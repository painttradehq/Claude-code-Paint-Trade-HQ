const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/estimate-builder-prep.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(700);

  // the paper already names the prep steps on the Skirting line
  const skMeta = await p.locator('.lrow .ln .meta').nth(2).textContent();
  ok('the paper summary reads "Prep · Fill nail holes and cracks · Sand back · …"', /Prep · Fill nail holes and cracks · Sand back · Caulk gaps and joints/.test(skMeta));
  // open the Skirting line (prep on, 3 steps)
  await p.locator('.lrow .ln .meta').nth(2).click(); await p.waitForTimeout(350);
  ok('the Preparation row shows "Edit prep · 3" and the chosen steps under it', (await p.locator(T('prep-edit')).textContent()).trim() === 'Edit prep · 3' && /Fill nail holes and cracks · Sand back · Caulk gaps and joints/.test(await p.locator(T('prep-summary')).textContent()));
  await p.screenshot({ path: OUT + 'r89-panel-1440.png' });
  await p.click(T('prep-edit')); await p.waitForTimeout(300);
  ok('the pop-up opens over the panel with the business\'s prep list', await p.locator(T('prep-pop')).isVisible() && (await p.locator(T('prep-list') + ' .pp-item').count()) === 16);
  ok('the three chosen steps are ticked and counted', (await p.locator(T('prep-list') + ' input:checked').count()) === 3 && (await p.locator(T('prep-count')).textContent()).trim() === '3 steps chosen');
  const box = await p.locator('#mbox').boundingBox();
  ok('the pop-up is a centred box about 520 px wide, above the panel', box && box.width <= 520 && box.x > 400 && box.x + box.width < 1040);
  await p.screenshot({ path: OUT + 'r89-popup-1440.png' });
  // search, tick, own step, remove, note, print switch
  await p.fill(T('prep-search'), 'sand'); await p.waitForTimeout(200);
  ok('search narrows the list', (await p.locator(T('prep-list') + ' .pp-item').count()) === 1);
  await p.fill(T('prep-search'), ''); await p.waitForTimeout(200);
  await p.click(T('prep-item-wash-down-with-sugar-soap') + ' input'); await p.waitForTimeout(150);
  ok('ticking a step updates the count at once', (await p.locator(T('prep-count')).textContent()).trim() === '4 steps chosen');
  await p.fill(T('prep-new'), 'Remove picture hooks'); await p.keyboard.press('Enter'); await p.waitForTimeout(250);
  ok('Enter adds your own step, ticked and marked yours', (await p.locator(T('prep-item-remove-picture-hooks') + ' input').isChecked()) && (await p.locator(T('prep-item-remove-picture-hooks') + ' .own').count()) === 1 && (await p.locator(T('prep-count')).textContent()).trim() === '5 steps chosen');
  await p.hover(T('prep-item-strip-old-wallpaper')); await p.click(T('prep-item-strip-old-wallpaper') + ' .rm'); await p.waitForTimeout(200);
  ok('× removes one of your own steps from the list', (await p.locator(T('prep-item-strip-old-wallpaper')).count()) === 0 && (await p.locator(T('prep-list') + ' .pp-item').count()) === 16);
  ok('standard steps have no ×', (await p.locator(T('prep-item-sand-back') + ' .rm').count()) === 0);
  await p.fill(T('prep-extra'), 'Client to move the furniture'); await p.waitForTimeout(100);
  ok('the pop-up offers "also set this prep for" the area and everywhere', (await p.locator(T('prep-apply-area')).count()) === 1 && /all skirting in Kitchen/.test(await p.locator(T('prep-apply-area')).textContent()));
  await p.click(T('prep-done')); await p.waitForTimeout(350);
  ok('Done closes the pop-up and the row reads "Edit prep · 5"', !(await p.locator(T('prep-pop')).count()) && (await p.locator(T('prep-edit')).textContent()).trim() === 'Edit prep · 5');
  const sum = await p.locator(T('prep-summary')).textContent();
  ok('the summary under the row lists the steps and the one-off note', /Wash down with sugar soap/.test(sum) && /Remove picture hooks/.test(sum) && /Client to move the furniture/.test(sum));
  await p.locator('#panel button:has-text("Save")').first().click(); await p.waitForTimeout(400);
  const meta2 = await p.locator('.lrow .ln .meta').nth(2).textContent();
  ok('the paper summary carries the five steps and the note', /Remove picture hooks/.test(meta2) && /Client to move the furniture/.test(meta2));
  // client view: prep text when printed, plain "prep" when not
  await p.click('[data-go="client"], button:has-text("Client view")'); await p.waitForTimeout(500);
  const docTxt = await p.locator('body').innerText();
  ok('the client document prints "prep: …" for that line, steps in the list\'s order', /prep: Wash down with sugar soap · Fill nail holes and cracks · Sand back · Caulk gaps and joints · Remove picture hooks — Client to move the furniture/.test(docTxt));
  await p.screenshot({ path: OUT + 'r89-client-1440.png' });
  await p.click('[data-go="build"], button:has-text("Builder")'); await p.waitForTimeout(400);
  await p.locator('.lrow .ln .meta').nth(2).click(); await p.waitForTimeout(300);
  await p.click(T('prep-edit')); await p.waitForTimeout(250);
  await p.click(T('prep-show')); await p.click(T('prep-done')); await p.waitForTimeout(300);
  ok('turning "print on the quote" off marks the summary "not on the quote"', (await p.locator(T('prep-summary') + ' .notq').count()) === 1);
  await p.locator('#panel button:has-text("Save")').first().click(); await p.waitForTimeout(300);
  await p.click('[data-go="client"], button:has-text("Client view")'); await p.waitForTimeout(400);
  ok('the client then sees plain "prep", no steps', !/prep: Wash down/.test(await p.locator('body').innerText()));
  await p.click('[data-go="build"], button:has-text("Builder")'); await p.waitForTimeout(400);
  // a line with prep off: tick → Add prep → pop-up with nothing chosen → Escape closes the pop-up only
  await p.locator('.lrow .ln .meta').first().click(); await p.waitForTimeout(300);
  ok('a line without prep shows no link', (await p.locator(T('prep-edit')).count()) === 0);
  await p.click('[data-coat="prep"]'); await p.waitForTimeout(250);
  ok('ticking Preparation shows "Add prep"', (await p.locator(T('prep-edit')).textContent()).trim() === 'Add prep');
  await p.click(T('prep-edit')); await p.waitForTimeout(250);
  ok('the pop-up opens with nothing chosen', (await p.locator(T('prep-count')).textContent()).trim() === 'No steps chosen yet');
  await p.keyboard.press('Escape'); await p.waitForTimeout(250);
  ok('Escape closes the pop-up and keeps the panel open', !(await p.locator(T('prep-pop')).count()) && await p.locator('#panelwrap').isVisible());
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(600);
  await p.locator('.lrow .ln .meta').nth(2).click(); await p.waitForTimeout(300);
  await p.click(T('prep-edit')); await p.waitForTimeout(300);
  const b2 = await p.locator('#mbox').boundingBox();
  ok('1024: the pop-up fits inside the viewport', b2 && b2.x >= 0 && b2.x + b2.width <= 1024 && b2.y + b2.height <= 800);
  ok('1024: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await p.screenshot({ path: OUT + 'r89-popup-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
