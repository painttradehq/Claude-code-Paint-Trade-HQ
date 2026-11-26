// Scores the finished outline on trim taps (skirting, frames, doors) and wall taps (spill onto trim).
// node trim_eval.js <setdir> <out.json> [vis.jpg] [idx,idx,...]
const { chromium } = require('playwright'); const fs = require('fs');
const [setdir, outjson, visfile, visidx] = process.argv.slice(2);
(async () => {
  const items = JSON.parse(fs.readFileSync(setdir + '/items.json')); const vis = new Set((visidx || '').split(',').filter(Boolean).map(Number));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(500); await p.evaluate(() => window.__wcv.load());
  const out = [], panels = []; let cur = null;
  for (let n = 0; n < items.length; n++) {
    const it = items[n];
    if (it.img !== cur) { cur = it.img; await p.evaluate(() => { document.getElementById('status').textContent = ''; }); await p.setInputFiles('#file', setdir + '/' + it.img);
      await p.waitForFunction(() => document.getElementById('status').textContent.startsWith('Photo loaded'), null, { timeout: 20000 }); await p.evaluate(() => window.__wcv.encode()); }
    const b64 = f => 'data:image/png;base64,' + fs.readFileSync(setdir + '/' + f).toString('base64');
    const res = await p.evaluate(async ({ it, gtUrl, clsUrl, wantVis }) => {
      const [W, H] = window.__wcv.dims(), N = W * H, cv = document.getElementById('cv');
      const load = async url => { const im = new Image(); im.src = url; await im.decode(); const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(im, 0, 0, W, H); const d = g.getImageData(0, 0, W, H).data; const m = new Uint8Array(N); for (let i = 0; i < N; i++) m[i] = d[i * 4] > 127 ? 1 : 0; return m; };
      const gt = await load(gtUrl), cls = await load(clsUrl);
      const x = Math.min(W - 1, Math.round(it.x * W / it.w)), y = Math.min(H - 1, Math.round(it.y * H / it.h));
      const score = m => { let a = 0, i2 = 0, u = 0, c = 0, g = 0, t = 0; for (let i = 0; i < N; i++) { const mi = m[i]; a += mi; g += gt[i]; i2 += mi & gt[i]; u += mi | gt[i]; c += mi & cls[i]; t += cls[i]; } return { iou: i2 / Math.max(1, u), recall: i2 / Math.max(1, g), spill: (a - i2) / Math.max(1, g), onTrim: c / Math.max(1, t) }; };
      const R = {}, M = {};
      // simulate a drag: up to six points spread over the labelled surface, starting at the tap
      const cand = [], st = Math.max(4, Math.round(W / 140)); for (let yy = st; yy < H - st; yy += st) for (let xx = st; xx < W - st; xx += st) { let ok = 1; for (let dy = -2; dy <= 2 && ok; dy += 2) for (let dx = -2; dx <= 2; dx += 2) if (!gt[(yy + dy) * W + xx + dx]) { ok = 0; break; } if (ok) cand.push([xx, yy]); }
      const dpts = [{ x, y }]; while (dpts.length < 6 && cand.length) { let bi = -1, bd = -1; cand.forEach((c, i) => { let dd = 1e12; for (const q of dpts) dd = Math.min(dd, (c[0] - q.x) ** 2 + (c[1] - q.y) ** 2); if (dd > bd) { bd = dd; bi = i; } }); if (bd < (W / 25) ** 2) break; dpts.push({ x: cand[bi][0], y: cand[bi][1] }); cand.splice(bi, 1); }
      for (const [k, mode, sv, pts] of [['edge', 'edge', 45, [{ x, y }]], ['tap', 'smart', 45, [{ x, y }]], ['drag', 'smart', 45, dpts]]) { M[k] = await window.__wcv.final(pts, mode, sv); R[k] = score(M[k]); }
      let img = null;
      if (wantVis) { const pw = 300, x0 = Math.max(0, Math.min(W - 1, x) - 0), out = document.createElement('canvas'); const ph = Math.round(pw * H / W); out.width = pw * 4; out.height = ph; const g = out.getContext('2d');
        [[gt, [0, 200, 0]], [M.edge, [255, 0, 255]], [M.tap, [0, 160, 255]], [M.drag, [255, 140, 0]]].forEach(([m, col], k) => { const t = document.createElement('canvas'); t.width = W; t.height = H; const tg = t.getContext('2d'); tg.drawImage(cv, 0, 0); const id = tg.getImageData(0, 0, W, H), d = id.data; for (let i = 0; i < N; i++) if (m[i]) { d[i * 4] = d[i * 4] * .4 + col[0] * .6; d[i * 4 + 1] = d[i * 4 + 1] * .4 + col[1] * .6; d[i * 4 + 2] = d[i * 4 + 2] * .4 + col[2] * .6; } tg.putImageData(id, 0, 0); tg.fillStyle = '#fff'; tg.strokeStyle = '#000'; tg.lineWidth = 3; tg.beginPath(); tg.arc(x, y, 8, 0, 7); tg.fill(); tg.stroke(); g.drawImage(t, k * pw, 0, pw, ph); }); img = out.toDataURL('image/jpeg', 0.8); }
      return { R, img };
    }, { it, gtUrl: b64(it.gt), clsUrl: b64(it.cls), wantVis: vis.has(n) });
    if (res.img) panels.push(res.img); out.push({ ...it, R: res.R }); process.stdout.write('.');
  }
  fs.writeFileSync(outjson, JSON.stringify(out));
  if (visfile && panels.length) { const u = await p.evaluate(async rows => { const ims = await Promise.all(rows.map(async r => { const i = new Image(); i.src = r; await i.decode(); return i; })); const c = document.createElement('canvas'); c.width = ims[0].width; c.height = ims.reduce((a, i) => a + i.height, 0); const g = c.getContext('2d'); let y = 0; for (const i of ims) { g.drawImage(i, 0, y); y += i.height; } return c.toDataURL('image/jpeg', 0.8); }, panels); fs.writeFileSync(visfile, Buffer.from(u.split(',')[1], 'base64')); }
  console.log('\ndone'); await b.close();
})();
