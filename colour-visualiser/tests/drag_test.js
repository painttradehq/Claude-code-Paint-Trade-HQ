// App-level check that dragging in the fill tool selects a surface. node drag_test.js <setdir> <outdir> <itemIndex>
const { chromium } = require('playwright'); const fs = require('fs');
const [setdir, outdir, idx] = process.argv.slice(2);
(async () => {
  const it = JSON.parse(fs.readFileSync(setdir + '/items.json'))[+idx]; const logs = [];
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 1000 } });
  p.on('pageerror', e => logs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.text().slice(0, 200)); });
  await p.goto('http://127.0.0.1:8765/index.html'); await p.setInputFiles('#file', setdir + '/' + it.img);
  await p.waitForFunction(() => document.getElementById('status').textContent.startsWith('Smart detect is ready'), null, { timeout: 120000 });
  await p.fill('#hex', '#24364D'); await p.dispatchEvent('#hex', 'change');
  const box = await p.locator('#cv').boundingBox(), cx = box.x + box.width * it.x / it.w, cy = box.y + box.height * it.y / it.h;
  await p.mouse.move(cx - 70, cy); await p.mouse.down(); await p.mouse.move(cx, cy + 10, { steps: 6 }); await p.mouse.move(cx + 70, cy, { steps: 6 }); await p.screenshot({ path: outdir + '/drag_trail.png' }); await p.mouse.up();
  await p.waitForFunction(() => document.getElementById('status').textContent.startsWith('Filled'), null, { timeout: 30000 }).catch(e => logs.push('no fill: ' + e.message.slice(0, 60)));
  await p.waitForTimeout(600); await p.locator('#cv').screenshot({ path: outdir + '/drag_result.png' });
  console.log('status:', await p.evaluate(() => document.getElementById('status').textContent), '| logs', JSON.stringify(logs)); await b.close();
})();
