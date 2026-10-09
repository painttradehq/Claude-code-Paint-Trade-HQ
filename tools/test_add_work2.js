// Add work v2 (rail + cards + one search) — Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_add_work2.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('estimate-builder-add-work-v2.html');
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
    await p.locator('[data-addwork]').first().click(); await p.waitForTimeout(300);
    const sh = await p.locator('#sheet').boundingBox();
    ok(sh && Math.round(sh.width) === 860 && Math.abs(sh.x + sh.width - W) < 8, `sheet 860 px on the right (${Math.round(sh.width)} × ${Math.round(sh.height)})`);
    ok((await p.locator('.sh-tabs').count()) === 0 && await p.locator(T('sheet-search')).isVisible(), 'no tab row; one search in the header');
    const op = await p.locator(T('sheet-on-paper')).innerText();
    ok(/On the paper/.test(op) && (await p.locator(T('sheet-on-paper') + ' .c').count()) >= 3, `"On the paper" lists what the area already has (${await p.locator(T('sheet-on-paper') + ' .c').count()} chips)`);
    const railLbls = await p.locator(T('sheet-rail') + ' .lbl').allInnerTexts();
    ok(railLbls.length === 3 && /Library/i.test(railLbls[0]) && /Repairs/i.test(railLbls[1]) && (await p.locator(T('sheet-rail') + ' button').count()) > 8, 'rail: Library categories · Repairs & prep · Custom line, with counts');
    ok(await p.evaluate(() => getComputedStyle(document.querySelector('.lgrid')).gridTemplateColumns.split(' ').length === 2) && (await p.locator('.lcard').count()) > 6, 'cards two to a row');
    ok((await p.locator('.lcard .add').count()) === (await p.locator('.lcard').count()) && (await p.locator('.lcard .d').count()) === (await p.locator('.lcard').count()), 'every card: name, price · coats, description, Add');
    await p.screenshot({ path: `${SHOTS}/aw2-library-${W}.png` });
    await p.click(T('nav-library-ceilings')); await p.waitForTimeout(200);
    const grps = await p.locator('.lgrp').allInnerTexts();
    ok(grps.length === 1 && /^ceilings/i.test(grps[0]) && await p.locator(T('nav-library-ceilings') + '.on').count() === 1, 'rail Ceilings → only ceilings, rail row highlighted');
    await p.click(T('nav-repair-all')); await p.waitForTimeout(200);
    ok((await p.locator('[data-testid^="task-row-"]').count()) > 0 && (await p.locator('[data-testid^="lib-row-"]').count()) === 0, 'rail All repairs → repair cards only');
    await p.fill(T('sheet-search'), 'crack'); await p.waitForTimeout(300);
    ok((await p.locator('[data-testid^="task-row-"]').count()) > 0 && await p.locator(T('search-custom')).isVisible() && (await p.locator(T('sheet-rail') + ' button.on').count()) === 0, 'search "crack": results across Library and Repairs, custom-line offer at the end, rail unselected');
    await p.screenshot({ path: `${SHOTS}/aw2-search-${W}.png` });
    await p.fill(T('sheet-search'), 'wall'); await p.waitForTimeout(300);
    ok((await p.locator('[data-testid^="lib-row-"]').count()) > 0 && (await p.locator('.lgrp').allInnerTexts()).some(t => /^walls/i.test(t)), 'search "wall": Library walls come up');
    await p.fill(T('sheet-search'), 'pressure wash driveway'); await p.waitForTimeout(300);
    await p.click(T('search-custom-btn')); await p.waitForTimeout(250);
    ok((await p.inputValue('#cu_name')) === 'pressure wash driveway' && await p.locator(T('nav-custom-custom') + '.on').count() === 1 && await p.evaluate(() => getComputedStyle(document.querySelector('.form2')).gridTemplateColumns.split(' ').length === 2), '"Add as a custom line" opens the Custom line form with the words filled, two columns');
    ok(await p.locator('#cu_add').isVisible() && (await p.locator('#shDone').count()) === 0, 'custom footer: Add line');
    await p.click(T('kind-trade')); await p.waitForTimeout(200);
    ok(await p.locator('#cu_sub').isVisible() && await p.locator(T('trade-shown')).isVisible(), 'Trade kind shows sub-quote, markup and the shown-to-client price');
    await p.screenshot({ path: `${SHOTS}/aw2-custom-${W}.png` });
    await p.click(T('nav-library-all')); await p.waitForTimeout(200);
    const first = p.locator('.lcard').first();
    await first.locator('.add').click(); await p.waitForTimeout(250);
    ok((await p.locator('.lcard .add.done').count()) === 1 && /1.*added this session/.test(await p.locator('.sh-foot .sum').innerText()), 'Add on a card → Added, footer counts it and shows the new quote total');
    await p.locator('.lcard .n').first().click(); await p.waitForTimeout(300);
    ok(await p.locator('#panelwrap').isVisible(), 'clicking a name opens the line details panel');
    await p.keyboard.press('Escape'); await p.evaluate(() => { document.querySelector('#panelwrap').hidden = true; });
    await p.click('#shDone'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => document.querySelector('#sheetwrap').hidden), 'Done closes the sheet');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal scroll');
    ok(errs.length === 0, 'no console errors' + (errs.length ? ': ' + errs.join(' | ').slice(0, 300) : ''));
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
