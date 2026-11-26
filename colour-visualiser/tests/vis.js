// Renders [truth | edge fill | SAM best | extra] panels for chosen taps. node vis.js <setdir> <out.jpg> <idx,idx,...> [mode]
const { chromium } = require('playwright'); const fs = require('fs');
const [setdir, outfile, idxs, mode] = process.argv.slice(2);
(async () => {
  const all = JSON.parse(fs.readFileSync(setdir + '/items.json')); const items = idxs.split(',').map(i => all[+i]);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://127.0.0.1:8765/index.html'); await p.waitForTimeout(500); await p.evaluate(() => window.__wcv.load());
  const rows = [];
  for (const it of items) {
    await p.evaluate(() => { document.getElementById('status').textContent = ''; });
    await p.setInputFiles('#file', setdir + '/' + it.img);
    await p.waitForFunction(() => document.getElementById('status').textContent.startsWith('Photo loaded'), null, { timeout: 20000 });
    await p.evaluate(() => window.__wcv.encode());
    const gtUrl = 'data:image/png;base64,' + fs.readFileSync(setdir + '/' + it.gt).toString('base64');
    rows.push(await p.evaluate(async ({ it, gtUrl, mode }) => {
      const [W, H] = window.__wcv.dims(), N = W * H, cv = document.getElementById('cv');
      const im = new Image(); im.src = gtUrl; await im.decode(); const c0 = document.createElement('canvas'); c0.width = W; c0.height = H; const g0 = c0.getContext('2d'); g0.drawImage(im, 0, 0, W, H); const d0 = g0.getImageData(0, 0, W, H).data; const gt = new Uint8Array(N); for (let i = 0; i < N; i++) gt[i] = d0[i * 4] > 127;
      const x = Math.min(W - 1, Math.round(it.x * W / it.w)), y = Math.min(H - 1, Math.round(it.y * H / it.h));
      const e = window.__wcv.edge(x, y, 45); const s = await window.__wcv.masks([{ x, y }]); const bi = s.scores.indexOf(Math.max(...s.scores));
      const extra = mode && window.__wcv[mode] ? await window.__wcv[mode](x, y) : s.masks[0];
      const pw = 380, ph = Math.round(pw * H / W), out = document.createElement('canvas'); out.width = pw * 4; out.height = ph; const g = out.getContext('2d');
      [[gt, [0, 200, 0]], [e, [255, 0, 255]], [s.masks[bi], [0, 160, 255]], [extra, [255, 140, 0]]].forEach(([m, col], k) => {
        const t = document.createElement('canvas'); t.width = W; t.height = H; const tg = t.getContext('2d'); tg.drawImage(cv, 0, 0); const id = tg.getImageData(0, 0, W, H), d = id.data;
        for (let i = 0; i < N; i++) if (m[i]) { d[i * 4] = d[i * 4] * .45 + col[0] * .55; d[i * 4 + 1] = d[i * 4 + 1] * .45 + col[1] * .55; d[i * 4 + 2] = d[i * 4 + 2] * .45 + col[2] * .55; }
        tg.putImageData(id, 0, 0); tg.fillStyle = '#fff'; tg.strokeStyle = '#000'; tg.lineWidth = 3; tg.beginPath(); tg.arc(x, y, 9, 0, 7); tg.fill(); tg.stroke();
        g.drawImage(t, k * pw, 0, pw, ph);
      });
      return out.toDataURL('image/jpeg', 0.8);
    }, { it, gtUrl, mode }));
  }
  // stack rows
  const sizes = await p.evaluate(async rows => { const ims = await Promise.all(rows.map(async r => { const i = new Image(); i.src = r; await i.decode(); return i; })); const c = document.createElement('canvas'); c.width = ims[0].width; c.height = ims.reduce((a, i) => a + i.height, 0); const g = c.getContext('2d'); let y = 0; for (const i of ims) { g.drawImage(i, 0, y); y += i.height; } return c.toDataURL('image/jpeg', 0.8); }, rows);
  fs.writeFileSync(outfile, Buffer.from(sizes.split(',')[1], 'base64')); await b.close();
})();
