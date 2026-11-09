const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/settings-suppliers.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(800);

  // 1. the page
  ok('Settings › Suppliers in the rail, between Business and Connections', (await p.$$eval(T('set-rail') + ' button', els => els.map(e => e.textContent.trim().replace(/JOSH ONLY/, '').trim()))).join(',') === 'Business,Suppliers,Connections,Crew app,Account,Alerts,Billing,Platform' && await p.locator(T('set-page-suppliers')).isVisible());
  ok('four sample suppliers, three visible to the crew, three with a trade account', (await p.locator('.card').count()) === 4 && (await p.locator(T('sup-count')).textContent()) === '4' && (await p.locator(T('sup-crew-count')).textContent()) === '3' && (await p.locator(T('sup-acc-count')).textContent()) === '3');
  ok('a card shows the number large with Copy; a cash supplier says so instead', (await p.locator(T('sup-copy-a1')).count()) === 1 && /No trade account — Cash/.test(await p.locator(T('sup-noacc-a4')).textContent()) && /Crew see this/.test(await p.locator(T('sup-badge-a1')).textContent()) && /Hidden from crew/.test(await p.locator(T('sup-badge-a3')).textContent()));
  ok('three columns at 1440 inside the Settings content column', (await p.$$eval('.card', els => new Set(els.map(e => Math.round(e.getBoundingClientRect().x))).size)) === 3);
  await p.screenshot({ path: OUT + 'r93-suppliers-1440.png' });
  await p.click(T('sup-copy-a1')); await p.waitForTimeout(150);
  ok('Copy confirms with the number', /4471 0362 copied/.test(await p.locator('#toast').textContent()));

  // 2. add: the panel on the right
  await p.click(T('sup-add')); await p.waitForTimeout(200);
  const panel = await p.locator(T('sup-panel')).boundingBox();
  ok('Add supplier opens on the right edge, 480 wide', panel && Math.abs(panel.x + panel.width - 1440) < 2 && Math.abs(panel.width - 480) < 2);
  ok('the account name defaults to the business', (await p.locator(T('sup-f-account_name')).inputValue()) === 'Harbourline Painting Pty Ltd');
  await p.click(T('sup-save')); await p.waitForTimeout(150);
  ok('Save without a brand or store is refused', (await p.locator('.card').count()) === 4 && /Choose the brand or name the store/.test(await p.locator('#toast').textContent()));
  await p.selectOption(T('sup-f-brand'), 'Taubmans');
  await p.fill(T('sup-f-number'), 'TB 88214'); await p.fill(T('sup-f-store'), 'Taubmans Trade Centre Ashmore'); await p.fill(T('sup-f-store_phone'), '07 5500 1000');
  await p.fill(T('sup-f-counter'), 'Give the job name as the PO.'); await p.fill(T('sup-f-terms'), '30-day account');
  await p.screenshot({ path: OUT + 'r93-panel-1440.png' });
  await p.click(T('sup-save')); await p.waitForTimeout(200);
  ok('the new supplier is a fifth card, visible to the crew by default', (await p.locator('.card').count()) === 5 && (await p.locator(T('sup-crew-count')).textContent()) === '4' && (await p.locator('.card').allTextContents()).some(t => /Taubmans/.test(t) && /TB 88214/.test(t)));
  ok('the panel closed', (await p.locator(T('sup-panel')).count()) === 0);

  // 3. duplicates, Other, a cash store
  await p.click(T('sup-add')); await p.selectOption(T('sup-f-brand'), 'Dulux'); await p.fill(T('sup-f-store'), 'Dulux Trade Centre Nerang'); await p.click(T('sup-save')); await p.waitForTimeout(150);
  ok('the same brand at the same store is refused', (await p.locator('.card').count()) === 5 && /already have Dulux at/.test(await p.locator('#toast').textContent()));
  await p.selectOption(T('sup-f-brand'), '__other'); await p.waitForTimeout(100);
  ok('Other reveals a name field', await p.locator(T('sup-f-other')).isVisible());
  await p.fill(T('sup-f-other'), 'Paint Place'); await p.fill(T('sup-f-store'), 'Paint Place Robina'); await p.fill(T('sup-f-number'), ''); await p.click(T('sup-save')); await p.waitForTimeout(200);
  ok('a store without an account number joins the list as a cash supplier', (await p.locator('.card').count()) === 6 && (await p.locator('.card').allTextContents()).some(t => /Paint Place/.test(t) && /No trade account/.test(t)) && (await p.locator(T('sup-acc-count')).textContent()) === '4');

  // 4. edit, hide, remove
  await p.click(T('sup-card-a2')); await p.waitForTimeout(200);
  ok('clicking a card opens it for editing with its values', await p.locator(T('sup-panel')).isVisible() && (await p.locator(T('sup-f-number')).inputValue()) === 'HB-20931' && (await p.locator(T('sup-f-show')).getAttribute('aria-checked')) === 'true');
  await p.click(T('sup-f-show')); await p.click(T('sup-save')); await p.waitForTimeout(200);
  ok('Show to crew off → the badge reads Hidden and the crew count drops', /Hidden from crew/.test(await p.locator(T('sup-badge-a2')).textContent()) && (await p.locator(T('sup-crew-count')).textContent()) === '4');
  await p.click(T('sup-menu-a3')); await p.waitForTimeout(100);
  ok('the ⋯ menu offers Edit, Show to crew / Hide, Remove', await p.locator(T('sup-pop')).isVisible() && /Show to crew/.test(await p.locator(T('sup-toggle-a3')).textContent()));
  await p.click(T('sup-toggle-a3')); await p.waitForTimeout(150);
  ok('Show to crew from the menu flips the badge at once', /Crew see this/.test(await p.locator(T('sup-badge-a3')).textContent()));
  await p.click(T('sup-menu-a3')); await p.click(T('sup-remove-a3')); await p.waitForTimeout(150);
  ok('Remove asks first', await p.locator(T('modal')).isVisible());
  await p.click(T('modal-ok')); await p.waitForTimeout(150);
  ok('the supplier is gone', (await p.locator('.card').count()) === 5 && (await p.locator(T('sup-card-a3')).count()) === 0);

  // 5. search, crew preview
  await p.fill(T('sup-search'), 'nerang'); await p.waitForTimeout(150);
  ok('search narrows by store', (await p.locator('.card').count()) === 1);
  await p.fill(T('sup-search'), '');
  await p.click(T('sup-crew-preview')); await p.waitForTimeout(200);
  const prev = await p.locator(T('crew-preview')).textContent();
  ok('"What the crew see" lists only the shown suppliers — number, store, phone, counter note; a cash store says so; nothing office-only', await p.locator(T('crew-preview')).isVisible() && (await p.locator('[data-testid^="crew-card-"]').count()) === 4 && !/30-day|35%|Carla|Statement/.test(prev) && /4471 0362/.test(prev) && /No trade account/.test(prev));
  await p.screenshot({ path: OUT + 'r93-crew-1440.png' });
  await p.keyboard.press('Escape');
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 6. 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(600);
  ok('1024: no horizontal scroll, the rail a wrapping tab strip, two columns of cards', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth) && (await p.locator(T('set-rail')).boundingBox()).height < 100 && (await p.$$eval('.card', els => new Set(els.map(e => Math.round(e.getBoundingClientRect().x))).size)) === 2);
  await p.screenshot({ path: OUT + 'r93-suppliers-1024.png' });
  await p.click(T('sup-add')); await p.waitForTimeout(200);
  const pn = await p.locator(T('sup-panel')).boundingBox();
  ok('1024: the panel still opens on the right and fits', pn && Math.abs(pn.x + pn.width - 1024) < 2 && pn.width <= 460 && await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await p.screenshot({ path: OUT + 'r93-panel-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
