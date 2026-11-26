// Runs real job photos through the app with real taps and drags, and saves the painted result.
// node job_test.js <photodir> <outdir> <plan.json>     plan: { "file.jpg": { w, h, surfaces: [{ name, hex, taps: [[x,y]], drags: [[[x,y],[x,y]]], brush: [[[x,y],[x,y]]], size }] } }
const { chromium } = require('playwright'); const fs = require('fs');
const [dir, outdir, planFile] = process.argv.slice(2);
(async () => {
  const plan = JSON.parse(fs.readFileSync(planFile)); const b = await chromium.launch();
  for (const [file, cfg] of Object.entries(plan)) {
    const p = await b.newPage({ viewport: { width: 1500, height: 1100 } }); const logs = [];
    p.on('pageerror', e => logs.push('PAGEERR ' + e.message));
    await p.goto('http://127.0.0.1:8765/index.html'); await p.setInputFiles('#file', dir + '/' + file);
    const t0 = Date.now(); await p.waitForFunction(() => document.getElementById('status').textContent.startsWith('Smart detect is ready'), null, { timeout: 180000 }); const ready = Date.now() - t0;
    const box = async () => p.locator('#cv').boundingBox();
    const gesture = async fn => { await p.evaluate(() => { document.getElementById('status').textContent = ''; }); await fn(); await p.waitForFunction(() => /^(Filled|That area)/.test(document.getElementById('status').textContent), null, { timeout: 60000 }).catch(() => logs.push('no result')); await p.waitForTimeout(250); };
    for (let i = 0; i < cfg.surfaces.length; i++) {
      const s = cfg.surfaces[i];
      if (i > 0) await p.click('#addBtn');
      await p.locator('.layer.on input.nm').fill(s.name); await p.fill('#hex', s.hex); await p.dispatchEvent('#hex', 'change');
      for (const [x, y] of s.taps || []) await gesture(async () => { const r = await box(); await p.mouse.click(r.x + r.width * x / cfg.w, r.y + r.height * y / cfg.h); });
      for (const path of s.drags || []) await gesture(async () => { const r = await box(); const q = path.map(([x, y]) => [r.x + r.width * x / cfg.w, r.y + r.height * y / cfg.h]); await p.mouse.move(...q[0]); await p.mouse.down(); for (const pt of q.slice(1)) await p.mouse.move(...pt, { steps: 14 }); await p.mouse.up(); });
      if (s.trim) { await p.click('#tTrim'); await p.evaluate(v => { document.getElementById('size').value = v; }, s.size || 28);
        for (const path of s.trim) { const r = await box(); const q = path.map(([x, y]) => [r.x + r.width * x / cfg.w, r.y + r.height * y / cfg.h]); await p.evaluate(() => { document.getElementById('status').textContent = ''; }); await p.mouse.move(...q[0]); await p.mouse.down(); for (const pt of q.slice(1)) await p.mouse.move(...pt, { steps: 40 }); await p.mouse.up(); await p.waitForTimeout(700); logs.push(await p.evaluate(() => document.getElementById('status').textContent.slice(0, 28))); }
        await p.click('#tFill'); }
      if (s.brush) { await p.click('#tBrush'); await p.evaluate(v => { document.getElementById('size').value = v; }, s.size || 40);
        for (const path of s.brush) { const r = await box(); const q = path.map(([x, y]) => [r.x + r.width * x / cfg.w, r.y + r.height * y / cfg.h]); await p.mouse.move(...q[0]); await p.mouse.down(); for (const pt of q.slice(1)) await p.mouse.move(...pt, { steps: 40 }); await p.mouse.up(); await p.waitForTimeout(900); }
        await p.click('#tFill'); }
    }
    await p.waitForTimeout(500); await p.locator('#cv').screenshot({ path: `${outdir}/${file.replace('.jpg', '')}_painted.png` }); await p.screenshot({ path: `${outdir}/${file.replace('.jpg', '')}_ui.png` });
    console.log(file, 'ready ms', ready, JSON.stringify(logs)); await p.close();
  }
  await b.close();
})();
