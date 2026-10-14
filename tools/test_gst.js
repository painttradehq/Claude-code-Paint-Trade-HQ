// Round 72 GST-inclusive — Playwright checks at 1440 then 1024 (gear + builder).
// Run: NODE_PATH=$(npm root -g) node tools/test_gst.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const UB = 'file://' + path.resolve('estimate-builder-gst.html');
const UG = 'file://' + path.resolve('quote-setup-gst.html');
const T = (id) => `[data-testid="${id}"]`;
const $n = (s) => Number(String(s).replace(/[^0-9.]/g, ''));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H] of [[1440, 900], [1024, 800]]) {
    console.log(`\n== ${W} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g|ERR_/.test(m.text())) errs.push(m.text()); });

    // ---- gear
    await p.goto(UG + '?setup=pricing'); await p.waitForTimeout(600);
    ok(await p.locator(T('qs-tax-inclusive')).isVisible() && (await p.locator(T('qs-tax-inclusive')).getAttribute('aria-checked')) === 'false', 'Pricing tab: "My prices include GST" switch, off by default');
    ok(/Library and the prices you type already include GST/.test(await p.locator(T('qs-tax-inclusive')).locator('..').innerText()), 'the switch explains on / off');
    await p.locator(T('qs-tax-inclusive')).click(); await p.waitForTimeout(150);
    ok((await p.locator(T('qs-tax-inclusive')).getAttribute('aria-checked')) === 'true', 'switch turns on');
    await p.locator(T('qs-save')).click(); await p.waitForTimeout(300);
    await p.locator(T('qs-tab-pdf')).click(); await p.waitForTimeout(300);
    await p.locator(T('qs-live-preview')).click(); await p.waitForTimeout(400);
    const tot = await p.locator('#qsPreview .total').innerText();
    ok(/Total \(includes GST 10% · \$948\.00\)/.test(tot), `PDF preview total reads "includes GST" when on (${tot.replace(/\s+/g, ' ').slice(0, 50)})`);
    await p.screenshot({ path: path.join(SHOTS, `gst-gear-${W}.png`) });

    // ---- builder, exclusive (as today)
    await p.goto(UB); await p.waitForTimeout(700);
    const sub0 = $n(await p.locator(T('eb-subtotal')).innerText()); const gst0 = $n(await p.locator(T('eb-gst')).innerText());
    ok(Math.abs(gst0 - sub0 * 0.10) < 0.02 && /Total incl\. GST/.test(await p.locator('#totals').innerText()), `exclusive: GST 10% added under the subtotal (${sub0} → +${gst0})`);
    await p.locator('#sendBtn').click(); await p.waitForTimeout(400);
    ok(/GST 10% applied/.test(await p.locator(T('rs-checklist')).innerText()), 'send checklist says "GST 10% applied"');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);

    // switch this quote in Quote details
    await p.locator(T('eb-details')).click(); await p.waitForTimeout(300);
    ok(await p.locator(T('ed-gst')).isVisible() && /GST added at the bottom/.test(await p.locator(T('ed-gst')).innerText()), 'Quote details has a GST section first: "GST added at the bottom"');
    await p.locator(T('ed-gst') + ' .qd-sw').click(); await p.waitForTimeout(300);
    ok(await p.locator(T('ed-gst-toggle')).isChecked(), 'the switch is on');
    ok(/Prices include GST/.test(await p.locator(T('ed-gst')).innerText()) && /read as including GST 10%/.test(await p.locator(T('ed-gst-text')).innerText()), 'toggle on: "Prices include GST" and the explanation');
    await p.screenshot({ path: path.join(SHOTS, `gst-details-${W}.png`) });
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    const sub1 = $n(await p.locator(T('eb-subtotal')).innerText()); const gst1 = $n(await p.locator(T('eb-gst')).innerText());
    const totTxt = await p.locator('#totals').innerText();
    ok(sub1 === sub0 && /Subtotal incl\. GST/.test(totTxt), 'inclusive: the subtotal is the same number, now labelled "incl. GST"');
    ok(Math.abs(gst1 - sub0 * 10 / 110) < 0.02 && await p.locator(T('eb-gst-incl')).isVisible() && /Includes GST 10%/.test(totTxt), `inclusive: "Includes GST 10%" = subtotal × 10/110 (${gst1})`);
    const grand = await p.locator('#totals .tr.grand b').innerText();
    ok($n(grand) === sub1 && !/Total incl\./.test(totTxt), `inclusive: Total equals the subtotal (${grand}), no "Total incl." line`);
    await p.locator('#totals').scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(SHOTS, `gst-builder-${W}.png`) });

    // line details header + add work footnote
    await p.locator('[data-openline="l1"]').first().click(); await p.waitForTimeout(300);
    ok(/\$ \/ m² incl\. GST/i.test(await p.locator('#panel .coathead').innerText()), 'Line details rate header: "$ / m² incl. GST"');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    await p.locator('[data-addwork]').first().click(); await p.waitForTimeout(300);
    ok(/Your Library rates include GST/.test(await p.locator('#sheet').innerText()), 'Add work footnote: "Your Library rates include GST."');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);

    // client view (Review & Send)
    await p.locator('#sendBtn').click(); await p.waitForTimeout(500);
    const cdoc = await p.locator('#rs_doc').innerText();
    ok(/Subtotal incl\. GST/.test(cdoc) && /Includes GST 10%/.test(cdoc) && await p.locator(T('cdoc-gst-incl')).isVisible(), 'client view: "Subtotal incl. GST", Total, then "Includes GST 10%"');
    ok(/Prices include GST 10%/.test(await p.locator(T('rs-checklist')).innerText()), 'send checklist now says "Prices include GST 10%"');
    await p.screenshot({ path: path.join(SHOTS, `gst-client-${W}.png`) });
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);

    // back to exclusive
    await p.locator(T('eb-details')).click(); await p.waitForTimeout(300);
    await p.locator(T('ed-gst') + ' .qd-sw').click(); await p.waitForTimeout(300); await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    ok(/Total incl\. GST/.test(await p.locator('#totals').innerText()) && $n(await p.locator(T('eb-gst')).innerText()) === gst0, 'toggle off: back to GST added under the subtotal, same numbers as before');

    // ?gst=incl deep link
    await p.goto(UB + '?gst=incl'); await p.waitForTimeout(700);
    ok(/Includes GST 10%/.test(await p.locator('#totals').innerText()), '?gst=incl opens the quote in inclusive mode');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll');
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
