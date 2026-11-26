// Scores wall detection methods on real labelled photos. Usage: node ai_eval.js <setdir> <outjson> [limit]
const { chromium } = require('playwright'); const fs = require('fs');
const [setdir, outjson, limit] = process.argv.slice(2);
(async () => {
  const items = JSON.parse(fs.readFileSync(setdir + '/items.json')).slice(0, +limit || 1e9);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(500);
  const t0 = Date.now(); await p.evaluate(() => window.__wcv.load()); console.log('model load ms', Date.now() - t0);
  const out = []; let cur = null, encMs = 0;
  for (const it of items) {
    if (it.img !== cur) {
      cur = it.img; await p.setInputFiles('#file', setdir + '/' + it.img);
      await p.waitForFunction(() => document.getElementById('status').textContent.startsWith('Photo loaded'), null, { timeout: 20000 });
      await p.evaluate(() => { document.getElementById('status').textContent = ''; });
      encMs = await p.evaluate(async () => { const t = performance.now(); await window.__wcv.encode(); return performance.now() - t; });
    }
    const b64 = f => 'data:image/png;base64,' + fs.readFileSync(setdir + '/' + f).toString('base64');
    const res = await p.evaluate(async ({ it, gtUrl, clsUrl }) => {
      const [W, H] = window.__wcv.dims(), N = W * H;
      const load = async url => { const im = new Image(); im.src = url; await im.decode(); const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(im, 0, 0, W, H); const d = g.getImageData(0, 0, W, H).data; const m = new Uint8Array(N); for (let i = 0; i < N; i++) m[i] = d[i * 4] > 127 ? 1 : 0; return m; };
      const gt = await load(gtUrl), cls = await load(clsUrl);
      const x = Math.min(W - 1, Math.round(it.x * W / it.w)), y = Math.min(H - 1, Math.round(it.y * H / it.h));
      const score = m => { let a = 0, i2 = 0, u = 0, c = 0, g = 0; for (let i = 0; i < N; i++) { const mi = m[i] ? 1 : 0; a += mi; g += gt[i]; i2 += mi & gt[i]; u += mi | gt[i]; c += mi & cls[i]; } return { iou: i2 / Math.max(1, u), prec: c / Math.max(1, a), recall: i2 / Math.max(1, g), spill: (a - i2) / Math.max(1, g), nonwall: (a - c) / Math.max(1, g) }; };
      const and = (a, b) => a.map((v, i) => v & b[i]), or = (a, b) => a.map((v, i) => v | b[i]);
      const area = m => { let a = 0; for (let i = 0; i < N; i++) a += m[i]; return a; };
      const R = {}; const T = {};
      let t = performance.now(); const e45 = window.__wcv.edge(x, y, 45); T.edge = performance.now() - t; R.edge45 = score(e45);
      const e25 = window.__wcv.edge(x, y, 25); R.edge25 = score(e25); R.edge65 = score(window.__wcv.edge(x, y, 65)); window.__wcv.edge(x, y, 45);
      t = performance.now(); const s1 = await window.__wcv.masks([{ x, y }]); T.dec = performance.now() - t;
      const best = s => s.scores.indexOf(Math.max(...s.scores));
      R.sam1_best = score(s1.masks[best(s1)]); R.sam1_m0 = score(s1.masks[0]); R.sam1_m1 = score(s1.masks[1]); R.sam1_m2 = score(s1.masks[2]);
      // extra points: farthest-point sampling inside a conservative edge fill
      const pick = (m, k) => { const cand = []; const st = Math.max(8, Math.round(W / 60)); for (let yy = st; yy < H - st; yy += st) for (let xx = st; xx < W - st; xx += st) { let ok = 1; for (let dy = -6; dy <= 6 && ok; dy += 6) for (let dx = -6; dx <= 6; dx += 6) if (!m[(yy + dy) * W + xx + dx]) { ok = 0; break; } if (ok) cand.push([xx, yy]); } const pts = [{ x, y }]; while (pts.length < k && cand.length) { let bi = -1, bd = -1; cand.forEach((c, i) => { let d = 1e12; for (const q of pts) d = Math.min(d, (c[0] - q.x) ** 2 + (c[1] - q.y) ** 2); if (d > bd) { bd = d; bi = i; } }); if (bd < (W / 12) ** 2) break; pts.push({ x: cand[bi][0], y: cand[bi][1] }); cand.splice(bi, 1); } return pts; };
      for (const [nm, em] of [['e25', e25], ['e45', e45]]) for (const k of [3, 6]) {
        const pts = pick(em, k); const s = await window.__wcv.masks(pts); const bi = best(s);
        R[`samN_${nm}_k${k}_best`] = score(s.masks[bi]); R[`samN_${nm}_k${k}_m0`] = score(s.masks[0]);
        if (nm === 'e45' && k === 6) { R.npts = pts.length; R.hyb_or = score(or(s.masks[bi], e45)); R.hyb_and_m0 = score(and(e45, s.masks[0])); 
          // edge fill clipped to the largest SAM mask, plus SAM best
          R.hyb_clip = score(or(and(e45, s.masks[0]), s.masks[bi])); }
      }
      R.e45_and_sam1m0 = score(and(e45, s1.masks[0])); R.e45_or_sam1best = score(or(e45, s1.masks[best(s1)]));
      return { R, T };
    }, { it, gtUrl: b64(it.gt), clsUrl: b64(it.cls) });
    out.push({ ...it, encMs, ...res }); process.stdout.write('.');
  }
  fs.writeFileSync(outjson, JSON.stringify(out)); console.log('\ndone', out.length); await b.close();
})();
