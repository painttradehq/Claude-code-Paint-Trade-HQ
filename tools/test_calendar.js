const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/calendar-layout.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(800);

  // 1. no right-hand rails; the grid spans the content width
  ok('no Today / Next 7 days / Needs attention cards beside the grid', (await p.locator(T('rail-today') + ', ' + T('rail-upcoming') + ', ' + T('rail-attention')).count()) === 0);
  const grid = await p.locator(T('cal-grid')).boundingBox(); const main = await p.locator('main').boundingBox();
  ok('the grid spans the whole content column (within the page padding)', grid && main && Math.abs((grid.x + grid.width) - (main.x + main.width - 48)) < 4 && grid.width > 1000);
  const tb = await p.locator(T('cal-tools')).boundingBox(); ok('1440: the toolbar sits on one row', tb && tb.height <= 44);
  await p.screenshot({ path: OUT + 'r91-month-1440.png' });

  // 2. the filters are one dropdown
  ok('one Show button instead of a row of chips, reading "All"', (await p.locator(T('cal-show')).count()) === 1 && /All/.test(await p.locator(T('cal-show')).textContent()) && (await p.locator('.chips, [data-testid^="filter-chip"]').count()) === 0);
  await p.click(T('cal-show')); await p.waitForTimeout(200);
  ok('the dropdown lists the seven categories with counts for the month', (await p.locator(T('cal-show-pop') + ' .row').count()) === 7 && (await p.locator(T('cal-show-pop') + ' .n').allTextContents()).every(t => /^\d+$/.test(t.trim())));
  await p.screenshot({ path: OUT + 'r91-show-1440.png' });
  const moneyBefore = await p.locator('.chip[data-cat="billing"]').count();
  await p.click(T('show-row-billing') + ' input'); await p.waitForTimeout(200);
  ok('unticking Money due hides its chips and the button reads "6 of 7"', moneyBefore >= 2 && (await p.locator('.chip[data-cat="billing"]').count()) === 0 && /6 of 7/.test(await p.locator(T('cal-show')).textContent()));
  ok('the dropdown stays open while you tick', await p.locator(T('cal-show-pop')).isVisible());
  await p.click(T('show-none')); await p.waitForTimeout(150);
  ok('Hide all empties the grid and reads "None"', (await p.locator('.chip').count()) === 0 && /None/.test(await p.locator(T('cal-show')).textContent()));
  await p.click(T('show-all')); await p.waitForTimeout(150);
  ok('Show all brings everything back', (await p.locator('.chip[data-cat="billing"]').count()) === moneyBefore && /All/.test(await p.locator(T('cal-show')).textContent()));
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  ok('Escape closes the dropdown', !(await p.locator(T('cal-show-pop')).isVisible()));

  // 3. needs attention lives in a pill, not a card
  ok('a red "Needs attention" pill shows the count', await p.locator(T('cal-attention')).isVisible() && (await p.locator('#attN').textContent()) === '4');
  await p.click(T('cal-attention')); await p.waitForTimeout(200);
  ok('the pill opens the list, late first', await p.locator(T('cal-attention-pop')).isVisible() && (await p.locator(T('cal-attention-pop') + ' .it').count()) === 4 && (await p.locator(T('cal-attention-pop') + ' .it .when').first().textContent()) === 'Late');
  await p.screenshot({ path: OUT + 'r91-attention-1440.png' });
  await p.keyboard.press('Escape');
  await p.click(T('cal-show')); await p.click(T('show-row-billing') + ' input'); await p.keyboard.press('Escape'); await p.waitForTimeout(150);
  ok('hiding a category also drops its items from the attention count', (await p.locator('#attN').textContent()) === '2');
  await p.click(T('cal-show')); await p.click(T('show-all')); await p.keyboard.press('Escape'); await p.waitForTimeout(150);

  // 4. a day click opens the day (Round 87 item 21), the view switch works
  await p.click(T('month-cell-2026-10-23') + ' .d'); await p.waitForTimeout(250);
  ok('clicking a day opens that day by hours', await p.locator(T('calendar-view-day')).isVisible() && /Friday,? 23 October/.test(await p.locator(T('cal-title')).textContent()));
  ok('the day shows its timed items as blocks', (await p.locator(T('calendar-view-day') + ' .blk').count()) >= 2);
  await p.screenshot({ path: OUT + 'r91-day-1440.png' });
  await p.click('[data-view="week"]'); await p.waitForTimeout(250);
  ok('Week shows seven columns', await p.locator(T('calendar-view-week')).isVisible() && (await p.locator(T('calendar-view-week') + ' .hd').count()) === 8);
  await p.click('[data-view="month"]'); await p.waitForTimeout(250);
  ok('Month comes back', await p.locator(T('calendar-view-month')).isVisible());
  await p.fill(T('cal-search'), 'okafor'); await p.waitForTimeout(200);
  ok('search narrows the grid', (await p.locator('.chip').count()) >= 2 && (await p.locator('.chip').allTextContents()).every(t => /Okafor/i.test(t)));
  await p.fill(T('cal-search'), '');
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 5. 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(600);
  ok('1024: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const tools = await p.locator(T('cal-tools')).boundingBox();
  ok('1024: the toolbar fits in at most two rows', tools && tools.height <= 90);
  await p.click(T('cal-show')); await p.waitForTimeout(200);
  const pop = await p.locator(T('cal-show-pop')).boundingBox();
  ok('1024: the dropdown stays inside the viewport', pop && pop.x >= 0 && pop.x + pop.width <= 1024);
  await p.screenshot({ path: OUT + 'r91-show-1024.png' });
  await p.keyboard.press('Escape');
  await p.screenshot({ path: OUT + 'r91-month-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
