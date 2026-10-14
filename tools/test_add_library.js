// Add to the Library from the builder — Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_add_library.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('estimate-builder-add-library.html');
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

    // 1. search with no match → two buttons
    await p.locator('[data-addwork]').first().click(); await p.waitForTimeout(300);
    await p.locator(T('sheet-search')).fill('bagged brick'); await p.waitForTimeout(250);
    ok(await p.locator(T('search-custom-btn')).isVisible() && await p.locator(T('search-library-btn')).isVisible(), 'no match: "Add as a custom line" and "Add to the Library" side by side');
    ok(/new Library item you will have next time too/.test(await p.locator(T('search-custom')).innerText()), 'the hint explains the difference');

    // 2. Add to the Library → quote saved, Library page with the return bar
    await p.locator(T('search-library-btn')).click(); await p.waitForTimeout(350);
    ok(await p.locator(T('libpage')).isVisible() && await p.locator('#sheetwrap').isHidden(), 'the Library page opens full screen; the sheet is closed');
    ok(/Quote saved/.test(await p.locator('#toast').innerText()), 'toast: Quote saved');
    const ret = await p.locator(T('lp-return')).innerText();
    ok(/Back to quote EST-0192 · Kitchen/.test(ret) && /Quote saved/.test(ret), `return bar names the quote and the area (${ret.split('\n')[0].slice(0, 40)}…)`);
    ok((await p.locator(T('lp-name')).inputValue()) === 'bagged brick' && (await p.locator(T('lp-category')).inputValue()) === 'Walls', 'name prefilled from the search; category guessed (Walls)');
    ok(/Library › Items › New item/.test(await p.locator('.lp-crumb').innerText()) && /Rate and time per m²/i.test(await p.locator('.lp-card h4').nth(1).innerText()), 'crumb "Library › Items › New item" and the rate grid per m²');
    await p.screenshot({ path: path.join(SHOTS, `add-library-page-${W}.png`) });

    // 3. empty name refused; fill and save
    await p.locator(T('lp-name')).fill(''); await p.locator(T('lp-save')).click(); await p.waitForTimeout(150);
    ok(await p.locator(T('lp-error')).isVisible() && /name/.test(await p.locator(T('lp-error')).innerText()), 'Save without a name shows the error line');
    await p.locator(T('lp-name')).fill('Bagged brick'); await p.locator('[data-lprate="c2"]').fill('18'); await p.locator('[data-lpmins="c2"]').fill('9'); await p.locator('[data-lprate="prep"]').fill('3'); await p.locator(T('lp-prep')).fill('Brush down, seal.');
    await p.locator(T('lp-save')).click(); await p.waitForTimeout(400);
    ok(await p.locator(T('libpage')).isHidden() && await p.locator('#sheetwrap').isVisible(), 'Save item returns to the Add work sheet');
    ok(await p.locator(T('nav-library-walls')).evaluate(el => el.classList.contains('on')), 'the sheet is on the Walls category');
    const first = p.locator('.lgrid .lcard').first();
    ok(await first.locator(T('lib-new-pill')).isVisible() && /Bagged brick/.test(await first.innerText()) && /\$18\.00\/m²/.test(await first.innerText()), 'the new item is the first card, with a New pill and its price');
    ok(/Bagged brick is in your Library/.test(await p.locator('#toast').innerText()), 'toast says it is in the Library and ready to add');
    await p.screenshot({ path: path.join(SHOTS, `add-library-back-${W}.png`) });
    await first.locator('[data-addlib]').click(); await p.waitForTimeout(300);
    ok(/Added/.test(await first.locator('[data-addlib]').innerText()), 'Add puts it on the quote (button reads Added)');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok((await p.locator('[data-line]').filter({ hasText: 'Bagged brick' }).count()) === 1, 'the paper has the new line in Kitchen');

    // 4. from the category view: the dashed card, Cancel returns as it was
    await p.locator('[data-addwork]').first().click(); await p.waitForTimeout(300);
    await p.locator(T('nav-library-ceilings')).click(); await p.waitForTimeout(200);
    ok(/New Library item in Ceilings/.test(await p.locator(T('new-lib-item')).innerText()), 'Ceilings view ends with "New Library item in Ceilings"');
    await p.locator(T('new-lib-item')).click(); await p.waitForTimeout(300);
    ok(await p.locator(T('libpage')).isVisible() && (await p.locator(T('lp-category')).inputValue()) === 'Ceilings', 'opens the Library page with Ceilings preselected');
    await p.locator(T('lp-cancel')).click(); await p.waitForTimeout(300);
    ok(await p.locator(T('libpage')).isHidden() && await p.locator(T('nav-library-ceilings')).evaluate(el => el.classList.contains('on')), 'Cancel returns to the sheet on Ceilings with nothing added');
    await p.locator(T('new-lib-item')).click(); await p.waitForTimeout(200); await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok(await p.locator(T('libpage')).isHidden() && await p.locator('#sheetwrap').isVisible(), 'Escape on the Library page is Cancel');

    // 5. repairs: new task from the Plaster group
    await p.locator(T('nav-repair-plaster')).click(); await p.waitForTimeout(200);
    ok(/New repair task in Plaster/.test(await p.locator(T('new-task-item')).innerText()), 'Plaster view ends with "New repair task in Plaster"');
    await p.locator(T('new-task-item')).click(); await p.waitForTimeout(300);
    ok(/New task/.test(await p.locator('.lp-crumb').innerText()) && (await p.locator(T('lp-category')).inputValue()) === 'Plaster' && await p.locator(T('lp-rate')).isVisible(), 'task editor: crumb "New task", group Plaster, rate and minutes');
    await p.screenshot({ path: path.join(SHOTS, `add-library-task-${W}.png`) });
    await p.locator(T('lp-name')).fill('Cornice crack fill'); await p.locator(T('lp-rate')).fill('45'); await p.locator(T('lp-mins')).fill('20');
    await p.locator(T('lp-save')).click(); await p.waitForTimeout(400);
    ok(await p.locator(T('libpage')).isHidden() && await p.locator(T('nav-repair-plaster')).evaluate(el => el.classList.contains('on')), 'Save task returns to the sheet on Plaster');
    const firstT = p.locator('.lgrid .lcard').first();
    ok(await firstT.locator(T('task-new-pill')).isVisible() && /Cornice crack fill/.test(await firstT.innerText()) && /\$45\.00\/ea · 20 min/.test(await firstT.innerText()), 'the new task is first with a New pill, its rate and minutes');
    await firstT.locator('[data-addtask]').click(); await p.waitForTimeout(300);
    ok(/Added/.test(await firstT.locator('[data-addtask]').innerText()), 'Add puts the task on the quote');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll');
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
