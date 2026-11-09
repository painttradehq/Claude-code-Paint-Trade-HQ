const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/trade-accounts.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(800);

  // 1. the page
  ok('Library › Trade accounts: three sample accounts, two visible to the crew', (await p.locator('.card').count()) === 3 && (await p.locator(T('ta-count')).textContent()) === '3' && (await p.locator(T('ta-crew-count')).textContent()) === '2');
  ok('each card shows the number large, a Copy, and the crew badge', (await p.locator(T('ta-copy-a1')).count()) === 1 && /Crew see this/.test(await p.locator(T('ta-badge-a1')).textContent()) && /Hidden from crew/.test(await p.locator(T('ta-badge-a3')).textContent()));
  await p.screenshot({ path: OUT + 'r93-list-1440.png' });
  await p.click(T('ta-copy-a1')); await p.waitForTimeout(150);
  ok('Copy confirms with the number', /4471 0362 copied/.test(await p.locator('#toast').textContent()));

  // 2. add an account: the panel opens on the right
  await p.click(T('ta-add')); await p.waitForTimeout(200);
  const panel = await p.locator(T('ta-panel')).boundingBox();
  ok('the Add panel opens on the right edge, 480 wide', panel && Math.abs(panel.x + panel.width - 1440) < 2 && Math.abs(panel.width - 480) < 2);
  ok('the account name defaults to the business', (await p.locator(T('ta-f-account_name')).inputValue()) === 'Harbourline Painting Pty Ltd');
  await p.click(T('ta-save')); await p.waitForTimeout(150);
  ok('Save without a brand and a number is refused', (await p.locator('.card').count()) === 3 && /brand and the account number/.test(await p.locator('#toast').textContent()));
  await p.selectOption(T('ta-f-brand'), 'Taubmans');
  await p.fill(T('ta-f-number'), 'TB 88214'); await p.fill(T('ta-f-store'), 'Taubmans Trade Centre Ashmore'); await p.fill(T('ta-f-store_phone'), '07 5500 1000');
  await p.fill(T('ta-f-counter'), 'Give the job name as the PO.'); await p.fill(T('ta-f-terms'), '30-day account');
  await p.screenshot({ path: OUT + 'r93-panel-1440.png' });
  await p.click(T('ta-save')); await p.waitForTimeout(200);
  ok('the new account is a fourth card, visible to the crew by default', (await p.locator('.card').count()) === 4 && (await p.locator(T('ta-crew-count')).textContent()) === '3' && (await p.locator('.card').allTextContents()).some(t => /Taubmans/.test(t) && /TB 88214/.test(t)));
  ok('the panel closed', (await p.locator(T('ta-panel')).count()) === 0);

  // 3. duplicates, Other
  await p.click(T('ta-add')); await p.selectOption(T('ta-f-brand'), 'Dulux'); await p.fill(T('ta-f-number'), '1'); await p.fill(T('ta-f-store'), 'Dulux Trade Centre Nerang'); await p.click(T('ta-save')); await p.waitForTimeout(150);
  ok('a second account for the same brand and store is refused', (await p.locator('.card').count()) === 4 && /already have a Dulux account/.test(await p.locator('#toast').textContent()));
  await p.selectOption(T('ta-f-brand'), '__other'); await p.waitForTimeout(100);
  ok('Other reveals a name field', await p.locator(T('ta-f-other')).isVisible());
  await p.fill(T('ta-f-other'), 'Bunnings PowerPass'); await p.fill(T('ta-f-store'), 'Bunnings Burleigh Waters'); await p.click(T('ta-save')); await p.waitForTimeout(200);
  ok('a store account joins the list', (await p.locator('.card').count()) === 5 && (await p.locator('.card').allTextContents()).some(t => /Bunnings PowerPass/.test(t)));

  // 4. edit, hide from crew, remove
  await p.click(T('ta-card-a2')); await p.waitForTimeout(200);
  ok('clicking a card opens it for editing with its values', await p.locator(T('ta-panel')).isVisible() && (await p.locator(T('ta-f-number')).inputValue()) === 'HB-20931' && (await p.locator(T('ta-f-show')).getAttribute('aria-checked')) === 'true');
  await p.click(T('ta-f-show')); await p.click(T('ta-save')); await p.waitForTimeout(200);
  ok('Show to crew off → the badge reads Hidden and the crew count drops', /Hidden from crew/.test(await p.locator(T('ta-badge-a2')).textContent()) && (await p.locator(T('ta-crew-count')).textContent()) === '3');
  await p.click(T('ta-menu-a3')); await p.waitForTimeout(100);
  ok('the ⋯ menu offers Edit, Show to crew / Hide, Remove', await p.locator(T('ta-pop')).isVisible() && /Show to crew/.test(await p.locator(T('ta-toggle-a3')).textContent()));
  await p.click(T('ta-toggle-a3')); await p.waitForTimeout(150);
  ok('Show to crew from the menu flips the badge at once', /Crew see this/.test(await p.locator(T('ta-badge-a3')).textContent()));
  await p.click(T('ta-menu-a3')); await p.click(T('ta-remove-a3')); await p.waitForTimeout(150);
  ok('Remove asks first', await p.locator(T('modal')).isVisible());
  await p.click(T('modal-ok')); await p.waitForTimeout(150);
  ok('the account is gone', (await p.locator('.card').count()) === 4 && (await p.locator(T('ta-card-a3')).count()) === 0);

  // 5. search, crew preview
  await p.fill(T('ta-search'), 'nerang'); await p.waitForTimeout(150);
  ok('search narrows by store', (await p.locator('.card').count()) === 1);
  await p.fill(T('ta-search'), '');
  await p.click(T('ta-crew-preview')); await p.waitForTimeout(200);
  ok('"What the crew see" lists only the shown accounts, with the number, store, phone and counter note — nothing office-only', await p.locator(T('crew-preview')).isVisible() && (await p.locator('[data-testid^="crew-card-"]').count()) === 3 && !/30-day|35%|Carla|Statement/.test(await p.locator(T('crew-preview')).textContent()) && /4471 0362/.test(await p.locator(T('crew-preview')).textContent()));
  await p.screenshot({ path: OUT + 'r93-crew-1440.png' });
  await p.keyboard.press('Escape');
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 6. 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(600);
  ok('1024: no horizontal scroll, three columns', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth) && (await p.locator('.card').count()) === 3);
  await p.screenshot({ path: OUT + 'r93-list-1024.png' });
  await p.click(T('ta-add')); await p.waitForTimeout(200);
  const pn = await p.locator(T('ta-panel')).boundingBox();
  ok('1024: the panel still opens on the right and fits', pn && Math.abs(pn.x + pn.width - 1024) < 2 && pn.width <= 460 && await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await p.screenshot({ path: OUT + 'r93-panel-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
