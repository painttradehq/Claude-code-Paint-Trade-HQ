// Per-tap measurements for tuning: raw outlines from one tap vs from a drag (several points on the surface).
// node feat_eval.js <setdir> <out.json>
const { chromium } = require('playwright'); const fs = require('fs');
const [setdir, outjson] = process.argv.slice(2);
(async () => {
  const items = JSON.parse(fs.readFileSync(setdir + '/items.json'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(500); await p.evaluate(() => window.__wcv.load());
  const out = []; let cur = null;
  for (const it of items) {
    if (it.img !== cur) { cur = it.img; await p.evaluate(() => { document.getElementById('status').textContent = ''; }); await p.setInputFiles('#file', setdir + '/' + it.img);
      await p.waitForFunction(() => document.getElementById('status').textContent.startsWith('Photo loaded'), null, { timeout: 20000 }); await p.evaluate(() => window.__wcv.encode()); }
    const gtUrl = 'data:image/png;base64,' + fs.readFileSync(setdir + '/' + it.gt).toString('base64');
    out.push({ ...it, ...await p.evaluate(async ({ it, gtUrl }) => {
      const [W, H] = window.__wcv.dims(), N = W * H;
      const im = new Image(); im.src = gtUrl; await im.decode(); const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(im, 0, 0, W, H); const d = g.getImageData(0, 0, W, H).data; const gt = new Uint8Array(N); for (let i = 0; i < N; i++) gt[i] = d[i * 4] > 127 ? 1 : 0;
      const x = Math.min(W - 1, Math.round(it.x * W / it.w)), y = Math.min(H - 1, Math.round(it.y * H / it.h));
      const iou = m => { let i2 = 0, u = 0; for (let i = 0; i < N; i++) { i2 += m[i] & gt[i]; u += m[i] | gt[i]; } return i2 / Math.max(1, u); };
      const feat = m => { let a = 0, per = 0; for (let yy = 0; yy < H; yy++) for (let xx = 0, i = yy * W; xx < W; xx++, i++) if (m[i]) { a++; if (xx === 0 || xx === W - 1 || yy === 0 || yy === H - 1 || !m[i - 1] || !m[i + 1] || !m[i - W] || !m[i + W]) per++; } return { area: a / N, thick: 2 * a / Math.max(1, per) / Math.max(W, H) }; };
      const pack = s => { const order = [0, 1, 2].map(j => ({ j, ...feat(s.masks[j]), iou: iou(s.masks[j]), score: s.scores[j] })).sort((a, b) => a.area - b.area); return order; };
      const one = pack(await window.__wcv.masks([{ x, y }]));
      // simulate a drag: up to k points spread over the labelled surface, starting at the tap
      const drag = async k => { const cand = [], st = Math.max(4, Math.round(W / 140)); for (let yy = st; yy < H - st; yy += st) for (let xx = st; xx < W - st; xx += st) { let ok = 1; for (let dy = -2; dy <= 2 && ok; dy += 2) for (let dx = -2; dx <= 2; dx += 2) if (!gt[(yy + dy) * W + xx + dx]) { ok = 0; break; } if (ok) cand.push([xx, yy]); }
        const pts = [{ x, y }]; while (pts.length < k && cand.length) { let bi = -1, bd = -1; cand.forEach((c, i) => { let dd = 1e12; for (const q of pts) dd = Math.min(dd, (c[0] - q.x) ** 2 + (c[1] - q.y) ** 2); if (dd > bd) { bd = dd; bi = i; } }); if (bd < (W / 25) ** 2) break; pts.push({ x: cand[bi][0], y: cand[bi][1] }); cand.splice(bi, 1); } return { n: pts.length, m: pack(await window.__wcv.masks(pts)) }; };
      return { one, drag3: await drag(3), drag6: await drag(6) };
    }, { it, gtUrl }) }); process.stdout.write('.');
  }
  fs.writeFileSync(outjson, JSON.stringify(out)); console.log('\ndone'); await b.close();
})();
