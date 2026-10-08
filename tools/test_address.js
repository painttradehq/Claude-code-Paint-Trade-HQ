// Address finder prototype — Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_address.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('address-finder.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const W of [1440, 1024]) {
    console.log(`\n== ${W} ==`);
    const p = await b.newPage({ viewport: { width: W, height: 900 } });
    const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_/.test(m.text())) errs.push(m.text()); });
    await p.goto(U); await p.waitForTimeout(500);
    // --- Job address dialog
    await p.click('.jcard[data-open="address"]'); await p.waitForTimeout(300);
    ok(await p.locator('#ja_addr').isVisible(), 'Job address dialog open');
    await p.fill('#ja_addr', ''); await p.type('#ja_addr', '14 wat', { delay: 30 }); await p.waitForTimeout(450);
    const items = p.locator('#ja_ac .it');
    ok(await p.locator('#ja_ac').isVisible() && await items.count() >= 3, `typing "14 wat" lists suggestions (${await items.count()})`);
    ok((await items.first().locator('b').innerText()) === '14 Wattle Street', 'first suggestion is 14 Wattle Street');
    ok((await p.locator('#ja_ac .pw').innerText()).includes('powered by Google'), 'Google attribution inside the list');
    await p.screenshot({ path: `${SHOTS}/address-job-list-${W}.png` });
    await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(200);
    ok((await p.inputValue('#ja_addr')) === '14 Wattle Street' && (await p.inputValue('#ja_sub')) === 'Balmain' && (await p.inputValue('#ja_state')) === 'NSW' && (await p.inputValue('#ja_pc')) === '2041', 'ArrowDown + Enter fills street, suburb, state, postcode');
    ok(await p.locator('#ja_ac').isHidden(), 'list closes after the pick');
    ok(await p.locator('#ja_pin').isVisible() && (await p.locator('#ja_pin').innerText()).includes('On the map'), 'pin line "On the map · Balmain NSW 2041"');
    await p.screenshot({ path: `${SHOTS}/address-job-picked-${W}.png` });
    await p.type('#ja_addr', ' rear', { delay: 20 }); await p.waitForTimeout(350);
    ok(await p.locator('#ja_pin').isHidden(), 'editing after a pick clears the pin');
    ok(await p.locator('#ja_ac').isHidden(), 'no match → no list (free text stays)');
    await p.fill('#ja_addr', ''); await p.type('#ja_addr', '22 coo', { delay: 30 }); await p.waitForTimeout(450);
    ok(await p.locator('#ja_ac').isVisible(), '"22 coo" lists again');
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    ok(await p.locator('#ja_ac').isHidden() && await p.locator('#modal').isVisible(), 'Escape closes the list only, the dialog stays');
    await p.type('#ja_addr', 'g', { delay: 20 }); await p.waitForTimeout(450);
    await p.locator('#ja_ac .it').first().click(); await p.waitForTimeout(200);
    ok((await p.inputValue('#ja_sub')) === 'Coogee' && (await p.inputValue('#ja_pc')) === '2034', 'mouse pick fills Coogee 2034');
    await p.click('#ja_save'); await p.waitForTimeout(300);
    ok((await p.locator('.jcard[data-open="address"]').innerText()).includes('22 Coogee Bay Road'), 'Save → the Job address card shows the picked address');
    // --- New client form
    await p.click('.jcard[data-open="contact"]'); await p.waitForTimeout(250);
    if (await p.locator('#changeClient').count()) { await p.click('#changeClient'); await p.waitForTimeout(250); }
    await p.click('#newContact'); await p.waitForTimeout(250);
    ok(await p.locator('[data-testid="client-address"]').isVisible(), 'New client form has the address finder field');
    await p.type('#cf_addr', '3/41', { delay: 30 }); await p.waitForTimeout(450);
    ok((await p.locator('#cf_ac .it').first().locator('b').innerText()) === '3/41 Bay Street', 'unit addresses: "3/41" finds 3/41 Bay Street');
    await p.locator('#cf_ac .it').first().click(); await p.waitForTimeout(200);
    ok((await p.inputValue('#cf_sub')) === 'Rockdale' && (await p.inputValue('#cf_state')) === 'NSW' && (await p.inputValue('#cf_pc')) === '2216', 'pick fills Rockdale NSW 2216 on the client form');
    await p.screenshot({ path: `${SHOTS}/address-client-${W}.png` });
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal scroll');
    // --- not configured
    await p.goto(U + '?ac=off'); await p.waitForTimeout(500);
    await p.click('.jcard[data-open="address"]'); await p.waitForTimeout(300);
    await p.fill('#ja_addr', ''); await p.type('#ja_addr', '14 wat', { delay: 30 }); await p.waitForTimeout(450);
    ok(await p.locator('#ja_ac').isHidden() && (await p.inputValue('#ja_addr')) === '14 wat', 'without a key the field is a plain text box');
    ok(errs.length === 0, 'no console errors' + (errs.length ? ': ' + errs.join(' | ').slice(0, 300) : ''));
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
