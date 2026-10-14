// Line details v2 — Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_line_panel.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('estimate-builder-line-details.html');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H] of [[1440, 900], [1024, 800]]) {
    console.log(`\n== ${W} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g|ERR_/.test(m.text())) errs.push(m.text()); });
    await p.goto(U); await p.waitForTimeout(700);

    // open the first library line (Kitchen walls) from the paper
    await p.locator('[data-openline="l1"]').first().click(); await p.waitForTimeout(300);
    const pn = await p.locator('#panel').boundingBox();
    ok(pn && Math.round(pn.width) === 640 && Math.abs(pn.x + pn.width - W) < 8, `panel 640 px on the right (${Math.round(pn.width)} × ${Math.round(pn.height)})`);
    ok(/Line details/.test(await p.locator('#panel .sh-head h2').innerText()), 'title Line details');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll');

    // quantity row: qty · unit · how measured
    ok(await p.locator(T('panel-qty')).isVisible() && await p.locator(T('panel-unit')).isVisible(), 'quantity row has a qty field and a Unit select');
    ok((await p.locator(T('panel-unit')).inputValue()) === 'm2' && (await p.locator(T('panel-unit') + ' option').count()) === 6, 'unit defaults to the Library item unit (m²), six units offered');
    ok(/Library default/.test(await p.locator(T('panel-unit') + ' option[value="m2"]').innerText()), 'the Library default is marked in the list');
    ok(await p.locator(T('panel-qtymode')).isVisible() && (await p.locator(T('panel-unit-note')).count()) === 0, 'auto / manual segment shown for m²; no unit note while on the default');
    await p.locator(T('panel-unit')).selectOption('each'); await p.waitForTimeout(250);
    ok((await p.locator(T('panel-unit-note')).count()) === 1 && /Library default is m² · this line uses ea/.test(await p.locator(T('panel-unit-note')).innerText()), 'changing to each shows "Library default is m² · this line uses ea" with Reset');
    ok((await p.locator(T('panel-qtymode')).count()) === 0 && await p.locator(T('panel-manual-hint')).isVisible(), 'no auto measure for each: "Typed by hand" hint instead');
    ok(/ea ×/.test(await p.locator('#panel .sh-foot .sum').innerText()), `footer sum shows the new unit (${(await p.locator('#panel .sh-foot .sum').innerText()).split('\n')[0]})`);
    ok(/\$ \/ ea/i.test(await p.locator('#panel .coathead').innerText()), 'rate column header follows the unit ($ / ea)');
    await p.locator(T('panel-unit-reset')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('panel-unit')).inputValue()) === 'm2' && await p.locator(T('panel-qtymode')).isVisible() && (await p.locator(T('panel-unit-note')).count()) === 0, 'Reset returns to m² with auto measure back');

    // preparation row: library text, edit for this line, print on quote + crew
    const about = await p.locator(T('panel-prep-about')).innerText();
    ok(/Clean, fill nail holes/.test(about) && /Edit for this line/.test(about), `prep row shows the Library item's prep text with "Edit for this line" (${about.slice(0, 48)}…)`);
    ok((await p.locator(T('panel-prep-show')).count()) === 0, 'prep off: no "print on the quote" box yet');
    await p.locator('[data-coat="prep"]').check(); await p.waitForTimeout(250);
    ok(await p.locator(T('panel-prep-show')).isVisible() && await p.locator(T('panel-prep-show')).isChecked(), 'prep on: "Print on the quote and show the crew" appears, ticked by default');
    const before = await p.locator('#panel .sh-foot .sum b').innerText();
    await p.locator(T('panel-prep-edit')).click(); await p.waitForTimeout(250);
    ok(await p.locator(T('panel-prep-note')).isVisible() && /Clean, fill nail holes/.test(await p.locator(T('panel-prep-note')).inputValue()), 'Edit opens a textarea prefilled with the Library text');
    await p.locator(T('panel-prep-note')).fill('Wash the walls, fill the picture hook holes, sand, spot prime.'); await p.waitForTimeout(100);
    await p.locator(T('panel-prep-edit')).click(); await p.waitForTimeout(250);
    ok(/Wash the walls/.test(await p.locator(T('panel-prep-about')).innerText()) && /Edited for this line/.test(await p.locator(T('panel-prep-about')).innerText()), 'Done keeps the per-line text and the link reads "Edited for this line"');
    await p.locator(T('panel-prep-edit')).click(); await p.waitForTimeout(200);
    ok((await p.locator(T('panel-prep-reset')).count()) === 1, '"Use the Library text instead" offered while a per-line text exists');
    await p.locator(T('panel-prep-edit')).click(); await p.waitForTimeout(200);
    ok(before === (await p.locator('#panel .sh-foot .sum b').innerText()), 'editing the prep text does not change the price');

    // product section: two columns, new product inline
    ok(await p.evaluate(() => { const g = document.querySelector('#panel .prodgrid'); return !!g && getComputedStyle(g).gridTemplateColumns.split(' ').length === 2; }), 'product chips two to a row');
    ok(await p.locator(T('panel-own-products')).isVisible() && (await p.locator(T('prod-new')).count()) === 1, '"On this Library item" group and the "New product…" chip');
    await p.locator(T('prod-new')).click(); await p.waitForTimeout(250);
    ok(await p.locator(T('newprod-form')).isVisible() && await p.locator(T('np-tolib')).isChecked(), 'New product form opens with "Also add it to the Library item" ticked');
    ok(await p.locator(T('np-brand')).isVisible() && await p.locator(T('np-name')).isVisible() && await p.locator(T('np-pack')).isVisible() && await p.locator(T('np-material')).isVisible() && await p.locator(T('np-cost')).isVisible(), 'form: Brand · Name · Pack · Material · Cost');
    await p.locator(T('np-brand')).fill('Haymes'); await p.locator(T('np-name')).fill('Expressions Low Sheen'); await p.locator(T('np-pack')).fill('15L'); await p.locator(T('np-cost')).fill('210');
    await p.locator(T('np-add')).click(); await p.waitForTimeout(350);
    const ownTxt = await p.locator(T('panel-own-products') + ' + .prodgrid').innerText();
    ok(/Haymes Expressions Low Sheen/.test(ownTxt) && (await p.locator('#panel .prodchip.on .n').innerText()).includes('Haymes Expressions'), 'the new product is added to the Library item group and selected on this line');
    ok(/added to your Products/.test(await p.locator('#toast').innerText()), 'toast confirms it went to Products');
    ok(await p.locator('#pl_colour').isVisible(), 'colour field appears for the selected product');

    // save → paper meta and client view carry the prep text
    await p.evaluate(() => { document.querySelector('#panel .sh-body').scrollTop = 0; });
    await p.screenshot({ path: path.join(SHOTS, `line-panel-${W}.png`) });
    await p.evaluate(() => { const b = document.querySelector('#panel .sh-body'); const h = b.querySelector('.prodsearch'); b.scrollTop = h.offsetTop - 70; });
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(SHOTS, `line-panel-products-${W}.png`) });
    await p.locator('#pl_save').click(); await p.waitForTimeout(400);
    ok(await p.locator('#panelwrap').isHidden(), 'Save closes the panel');
    const paper = await p.locator('[data-line="l1"]').first().innerText();
    ok(/Prep · Wash the walls/.test(paper), 'paper row meta prints "Prep · {text}"');
    await p.locator('#sendBtn').click(); await p.waitForTimeout(500);
    const cdoc = await p.locator('#rs_doc').innerText();
    ok(/prep: Wash the walls/.test(cdoc), 'client view line sub prints "prep: {text}"');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);

    // untick "print on the quote" → text leaves the quote, stays priced
    await p.locator('[data-openline="l1"]').first().click(); await p.waitForTimeout(300);
    await p.locator(T('panel-prep-show')).uncheck(); await p.waitForTimeout(150);
    await p.locator('#pl_save').click(); await p.waitForTimeout(300);
    const paper2 = await p.locator('[data-line="l1"]').first().innerText();
    ok(/Prep/.test(paper2) && !/Wash the walls/.test(paper2), 'unticked: the paper shows Prep without the text (still priced)');

    // escape closes; a repair line still opens its own panel
    await p.locator('[data-openline="l1"]').first().click(); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok(await p.locator('#panelwrap').isHidden(), 'Escape closes the panel');
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
