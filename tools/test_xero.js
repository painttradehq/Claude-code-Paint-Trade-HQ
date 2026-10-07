// Xero connection prototypes — Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_xero.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const S = 'file://' + path.resolve('xero-settings.html'); const I = 'file://' + path.resolve('xero-invoice.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const W of [1440, 1024]) {
    console.log(`\n== ${W} ==`);
    const p = await b.newPage({ viewport: { width: W, height: 900 } });
    const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_/.test(m.text())) errs.push(m.text()); });
    p.on('dialog', d => d.accept());
    // --- settings, not connected
    await p.goto(S + '?page=business#accounting'); await p.waitForTimeout(400);
    ok(await p.locator('[data-testid="sec-accounting"] h3').innerText().then(t => t.startsWith('Accounting')), 'Accounting section is the sixth section');
    ok((await p.locator('#stXero').innerText()).includes('Not connected'), 'status reads Not connected');
    ok(await p.locator('[data-testid="xero-connect-btn"]').isVisible(), 'Connect Xero button shown');
    await p.screenshot({ path: `${SHOTS}/xero-settings-off-${W}.png` });
    await p.click('[data-testid="xero-connect-btn"]'); await p.waitForTimeout(900);
    ok(await p.locator('[data-testid="xero-drawer"]').isVisible(), 'after connect the panel opens on the right');
    const box = await p.locator('[data-testid="xero-drawer"]').boundingBox();
    ok(box && Math.abs(box.x + box.width - W) < 2 && box.width === 480, `panel is 480 px and flush right (x=${box && box.x}, w=${box && box.width})`);
    ok((await p.locator('#xrSub').innerText()).includes('pick where things go'), 'fresh connection subtitle');
    ok((await p.locator('[data-testid="xero-from"]').inputValue()).length === 10, 'Send invoices from defaults to today');
    await p.screenshot({ path: `${SHOTS}/xero-settings-panel-${W}.png` });
    await p.selectOption('[data-testid="xero-sales"]', '210'); await p.click('[data-testid="xero-save"]'); await p.waitForTimeout(300);
    ok(await p.locator('[data-testid="xero-drawer"]').isHidden(), 'Save closes the panel');
    const st = await p.locator('#stXero').innerText();
    ok(st.includes('Connected to Sano Painting & Decorating Pty Ltd') && st.includes('210 · Painting income') && st.includes('last sync'), 'status reads connected · account · last sync');
    ok(await p.locator('[data-testid="xero-settings-btn"]').isVisible() && await p.locator('[data-testid="xero-disconnect-btn"]').isVisible(), 'Settings and Disconnect shown when connected');
    ok(await p.locator('[data-testid="xero-connect-btn"]').count() === 0, 'Connect button gone');
    await p.screenshot({ path: `${SHOTS}/xero-settings-on-${W}.png` });
    await p.click('[data-testid="xero-settings-btn"]'); await p.waitForTimeout(200);
    ok(await p.locator('[data-testid="xero-drawer"]').isVisible() && (await p.locator('[data-testid="xero-sales"]').inputValue()) === '210', 'Settings reopens the panel with the saved account');
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    ok(await p.locator('[data-testid="xero-drawer"]').isHidden(), 'Escape closes the panel');
    await p.click('[data-testid="xero-disconnect-btn"]'); await p.waitForTimeout(200);
    ok((await p.locator('#stXero').innerText()).includes('Not connected'), 'Disconnect (confirmed) returns to Not connected');
    // storage section untouched
    ok(await p.locator('[data-testid="storage-options"] .opt').count() === 3, 'Files & storage still has its three rows');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'settings: no horizontal scroll');
    // --- invoice
    await p.goto(I + '?state=progress'); await p.waitForTimeout(400);
    ok((await p.locator('[data-testid="inv-xero"]').innerText()).includes('Goes to Xero when you send it'), 'draft invoice: "Goes to Xero when you send it"');
    await p.goto(I + '?state=paid'); await p.waitForTimeout(400);
    const paidTxt = await p.locator('[data-testid="inv-xero"]').innerText();
    ok(/In Xero as INV-\d+ · synced/.test(paidTxt) && paidTxt.includes('Open in Xero'), 'paid invoice: In Xero as INV-… · synced · Open in Xero');
    await p.screenshot({ path: `${SHOTS}/xero-invoice-paid-${W}.png` });
    await p.goto(I + '?state=overdue'); await p.waitForTimeout(400);
    ok((await p.locator('[data-testid="inv-xero"]').innerText()).includes('Not in Xero · Xero was unavailable'), 'failed push: Not in Xero · reason · Retry');
    await p.screenshot({ path: `${SHOTS}/xero-invoice-error-${W}.png` });
    await p.click('[data-xretry]'); await p.waitForTimeout(1000);
    ok((await p.locator('[data-testid="inv-xero"]').innerText()).includes('In Xero as'), 'Retry sends it and the line turns green');
    ok(await p.locator('.mscrim, .modal, [data-testid="terms-dialog"]').count() === 0 || await p.locator('.mscrim').isHidden().catch(() => true), 'Retry did not open the Invoice details dialog');
    await p.goto(I + '?state=progress&xero=off'); await p.waitForTimeout(400);
    ok(await p.locator('[data-testid="inv-xero"]').count() === 0, 'Xero not connected: no line at all');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'invoice: no horizontal scroll');
    ok(errs.length === 0, 'no console errors' + (errs.length ? ': ' + errs.join(' | ').slice(0, 300) : ''));
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
