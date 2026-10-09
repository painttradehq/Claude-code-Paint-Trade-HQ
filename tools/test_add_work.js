// Add work sheet = Add area picker size — Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_add_work.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('estimate-builder-add-work.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H] of [[1440, 900], [1024, 800]]) {
    console.log(`\n== ${W} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g|ERR_/.test(m.text())) errs.push(m.text()); });
    await p.goto(U); await p.waitForTimeout(700);
    await p.click('[data-testid="add-interior-area"]'); await p.waitForTimeout(300);
    const pk = await p.locator('#mbox').boundingBox();
    ok(pk && pk.width >= 800 && Math.abs(pk.x + pk.width - W) < 8, `Add area picker: ${Math.round(pk.width)} × ${Math.round(pk.height)} on the right`);
    await p.screenshot({ path: `${SHOTS}/aw-picker-${W}.png` });
    await p.click('[data-testid="pk-done"]').catch(async () => { await p.evaluate(() => closeModal()); }); await p.waitForTimeout(250);
    await p.locator('[data-addwork]').first().click(); await p.waitForTimeout(300);
    const sh = await p.locator('#sheet').boundingBox();
    ok(sh && Math.abs(sh.width - pk.width) < 2 && Math.abs(sh.height - pk.height) < 2 && Math.abs(sh.x - pk.x) < 2, `Add work sheet: ${Math.round(sh.width)} × ${Math.round(sh.height)} — same box as the picker`);
    ok(Math.round(sh.width) === 860, `860 px at ${W} (the 96 % cap only bites below 896 px)`);
    ok(await p.locator('#sheet .librow').count() > 0 && await p.locator('#sheet .sh-search input').isVisible(), 'Library rows and search render inside');
    await p.screenshot({ path: `${SHOTS}/aw-sheet-${W}.png` });
    await p.click('#sheet .sh-tabs [data-tab="custom"]'); await p.waitForTimeout(200);
    ok(await p.locator('#cu_name').isVisible() && await p.locator('#cu_add').isVisible(), 'Custom line tab works');
    await p.click('#sheet .sh-tabs [data-tab="repair"]'); await p.waitForTimeout(200);
    ok(await p.locator('#sheet .librow').count() > 0, 'Repair tab works');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal scroll');
    ok(errs.length === 0, 'no console errors' + (errs.length ? ': ' + errs.join(' | ').slice(0, 200) : ''));
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
