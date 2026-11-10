const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/project-paint-litres.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(800);

  // 1. rows read litres → tins · cost; the sum
  ok('a row reads litres → tins, and the cost comes from the tins', /13\.4 L/.test(await p.locator(T('row-litres-m1')).textContent()) && (await p.locator(T('row-tins-m1')).textContent()) === '1 × 15L' && (await p.locator(T('row-cost-m1')).textContent()) === '$240.00');
  ok('3 L of a product sold in 1 / 4 / 10 L fits as 1 × 4L (cheaper than 3 × 1L)', (await p.locator(T('row-tins-m2')).textContent()) === '1 × 4L' && (await p.locator(T('row-cost-m2')).textContent()) === '$118.00');
  ok('the card sum is the tins, not the litres', (await p.locator(T('products-sum')).textContent()) === '$358.00');
  await p.screenshot({ path: OUT + 'r96-card-1440.png' });

  // 2. Add paint: one row per product, then litres
  await p.click(T('project-products-toggle')); await p.waitForTimeout(150);
  ok('the picker lists each product once, with its coverage and sizes, not one row per tin', (await p.locator('.prow').count()) === 7 && /4L · 10L · 15L/.test(await p.locator(T('project-products-pick-p1')).textContent()));
  await p.fill(T('project-products-search'), 'stain'); await p.waitForTimeout(100);
  ok('search narrows', (await p.locator('.prow').count()) === 1);
  await p.click(T('project-products-pick-p6')); await p.waitForTimeout(150);
  ok('picking a product asks for the litres, Add disabled until typed', await p.locator(T('picker-step-litres')).isVisible() && await p.locator(T('picker-add')).isDisabled());
  await p.fill(T('picker-litres'), '13'); await p.waitForTimeout(100);
  ok('the fit shows as you type: 13 L of a 1 / 4 / 10 L product → 1 × 10L + 1 × 4L', /1 × 10L \+ 1 × 4L/.test(await p.locator(T('picker-fit')).textContent()) && /\$366\.00/.test(await p.locator(T('picker-fit')).textContent()));
  await p.screenshot({ path: OUT + 'r96-picker-1440.png' });
  await p.keyboard.press('Enter'); await p.waitForTimeout(200);
  ok('Enter adds the row and closes the picker', (await p.locator('[data-testid^="product-row-"]').count()) === 3 && (await p.locator(T('project-products-picker')).count()) === 0 && (await p.locator(T('products-sum')).textContent()) === '$724.00');

  // 3. change the litres on a row
  await p.click(T('row-litres-m1')); await p.waitForTimeout(100);
  await p.fill(T('row-litres-input-m1'), '22'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok('typing new litres re-fits the tins: 22 L → 1 × 15L + 1 × 10L', (await p.locator(T('row-tins-m1')).textContent()) === '1 × 15L + 1 × 10L' && (await p.locator(T('row-cost-m1')).textContent()) === '$445.00');
  await p.click(T('row-litres-m1')); await p.fill(T('row-litres-input-m1'), '31'); await p.keyboard.press('Enter'); await p.waitForTimeout(150);
  ok('31 L → 2 × 15L + 1 × 4L (the remainder by the smallest tin that covers it)', (await p.locator(T('row-tins-m1')).textContent()) === '2 × 15L + 1 × 4L');
  ok('the colour fields stay as today, with the estimate mark', (await p.locator(T('row-colour-m1')).inputValue()) === 'Natural White' && /from the estimate/.test(await p.locator(T('product-row-m1')).textContent()));

  // 4. remove
  await p.click(T('row-remove-m2')); await p.waitForTimeout(150);
  ok('remove takes the row and the sum down', (await p.locator('[data-testid^="product-row-"]').count()) === 2 && !/\$118/.test(await p.locator(T('products-sum')).textContent()));
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 5. 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(500);
  ok('1024: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await p.click(T('project-products-toggle')); await p.click(T('project-products-pick-p4')); await p.fill(T('picker-litres'), '9'); await p.waitForTimeout(100);
  ok('1024: the litres step fits and fits 9 L as 1 × 10L', /1 × 10L/.test(await p.locator(T('picker-fit')).textContent()) && await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await p.screenshot({ path: OUT + 'r96-picker-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
