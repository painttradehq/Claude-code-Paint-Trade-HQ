const { chromium } = require('playwright'); const fs = require('fs');
const [setdir, outdir, idx] = process.argv.slice(2);
(async () => {
  const it = JSON.parse(fs.readFileSync(setdir + '/items.json'))[+idx || 30];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } }); const logs = [];
  p.on('pageerror', e => logs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() !== 'log') logs.push(m.type() + ' ' + m.text().slice(0, 300)); });
  let t = Date.now(); await p.goto('http://127.0.0.1:8765/index.html');
  await p.waitForFunction(() => document.getElementById('aiBtn').textContent === 'Smart detect' || document.getElementById('aiBtn').hidden && performance.now() > 20000, null, { timeout: 90000 }).catch(e => logs.push('wait1 ' + e.message.slice(0, 80)));
  console.log('sample ready ms', Date.now() - t, 'aiBtn:', await p.evaluate(() => [document.getElementById('aiBtn').hidden, document.getElementById('aiBtn').textContent]));
  t = Date.now(); await p.setInputFiles('#file', setdir + '/' + it.img);
  // responsiveness while encoding: can the page still answer quickly?
  const lag = await p.evaluate(async () => { let worst = 0; for (let i = 0; i < 20; i++) { const a = performance.now(); await new Promise(r => setTimeout(r, 50)); worst = Math.max(worst, performance.now() - a - 50); } return worst; });
  await p.waitForFunction(() => document.getElementById('status').textContent.startsWith('Smart detect is ready'), null, { timeout: 90000 }).catch(e => logs.push('wait2 ' + e.message.slice(0, 80)));
  console.log('photo ready ms', Date.now() - t, 'worst UI lag ms during prep', Math.round(lag));
  await p.fill('#hex', '#2F4A40'); await p.dispatchEvent('#hex', 'change');
  const box = await p.locator('#cv').boundingBox();
  t = Date.now(); await p.mouse.click(box.x + box.width * it.x / it.w, box.y + box.height * it.y / it.h);
  await p.waitForFunction(() => document.getElementById('status').textContent.startsWith('Filled'), null, { timeout: 30000 }).catch(e => logs.push('wait3 ' + e.message.slice(0, 80)));
  console.log('tap to filled ms', Date.now() - t); await p.waitForTimeout(500);
  await p.locator('#cv').screenshot({ path: outdir + '/app_mid.png' });
  for (const [v, nm] of [[15, 'small'], [85, 'large']]) { await p.evaluate(v => { const e = document.getElementById('tol'); e.value = v; e.dispatchEvent(new Event('input')); }, v); await p.waitForTimeout(1500); await p.locator('#cv').screenshot({ path: `${outdir}/app_${nm}.png` }); }
  await p.screenshot({ path: outdir + '/app_full.png' });
  console.log(JSON.stringify(logs)); await b.close();
})();
