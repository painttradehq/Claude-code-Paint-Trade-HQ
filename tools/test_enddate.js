const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/calendar-end-date.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(800);

  // 1. the sample three-day crew event is one bar in the month
  const sp = async (day) => p.locator(`${T('month-cell-' + day)} .chip[data-open="e1"]`).getAttribute('data-span');
  ok('a three-day event draws on each of its days as one joined bar (start · mid · end)', (await sp('2026-10-20')) === 'sp-start' && (await sp('2026-10-21')) === 'sp-mid' && (await sp('2026-10-22')) === 'sp-end');
  const x0 = await p.locator(`${T('month-cell-2026-10-20')} .chip[data-open="e1"]`).boundingBox(); const x1 = await p.locator(`${T('month-cell-2026-10-21')} .chip[data-open="e1"]`).boundingBox();
  ok('the bar segments touch across the cell border', x0 && x1 && Math.abs((x0.x + x0.width) - x1.x) <= 2 && Math.abs(x0.y - x1.y) < 2);
  ok('a one-day event is a plain chip', (await p.locator(`${T('month-cell-2026-10-23')} .chip[data-open="m2"]`).getAttribute('data-span')) === 'one');
  await p.screenshot({ path: OUT + 'r95-month-1440.png' });

  // 2. New event: Ends on beside Date
  await p.click('#newEvent'); await p.waitForTimeout(200);
  const dr = await p.locator(T('ev-drawer')).boundingBox();
  ok('New event opens on the right with Date and Ends on side by side', dr && Math.abs(dr.x + dr.width - 1440) < 2 && await p.locator(T('ev-end')).isVisible() && (await p.locator(T('ev-end')).inputValue()) === (await p.locator(T('ev-date')).inputValue()));
  ok('Ends on starts as the same day', /Same day/.test(await p.locator(T('ev-days')).textContent()));
  await p.fill(T('ev-title'), 'Okafor · fence and gates (Sam)');
  await p.selectOption(T('ev-cat'), 'project');
  await p.fill(T('ev-date'), '2026-10-27'); await p.fill(T('ev-end'), '2026-10-26'); await p.waitForTimeout(150);
  ok('an end before the start is pulled back to the start', (await p.locator(T('ev-end')).inputValue()) === '2026-10-27');
  await p.fill(T('ev-end'), '2026-10-29'); await p.waitForTimeout(150);
  ok('the hint counts the days and promises one bar; the times say they apply each day', /3 days · one bar/.test(await p.locator(T('ev-days')).textContent()) && /each day/.test(await p.locator('#ev-timehint').textContent()));
  await p.selectOption(T('ev-job'), 'j2');
  await p.screenshot({ path: OUT + 'r95-drawer-1440.png' });
  await p.click(T('ev-save')); await p.waitForTimeout(250);
  const added = await p.locator('.chip[data-open^="n"]').count();
  ok('Add to calendar: the new event is one bar across 27–29 October', added === 3 && (await p.locator(`${T('month-cell-2026-10-27')} .chip[data-open^="n"]`).getAttribute('data-span')) === 'sp-start' && (await p.locator(`${T('month-cell-2026-10-29')} .chip[data-open^="n"]`).getAttribute('data-span')) === 'sp-end');
  ok('the title shows once, at the start of the bar', (await p.locator(`${T('month-cell-2026-10-28')} .chip[data-open^="n"]`).evaluate(el => getComputedStyle(el).color)) === 'rgba(0, 0, 0, 0)' && /Okafor · fence/.test(await p.locator(`${T('month-cell-2026-10-27')} .chip[data-open^="n"]`).textContent()));

  // 3. the week and the day carry the whole bar
  await p.click('[data-view="week"]'); await p.waitForTimeout(250);
  ok('Week: the all-day row shows the bar on all three days', (await p.locator(`${T('calendar-view-week')} .chip[data-open="e1"]`).count()) === 3);
  await p.screenshot({ path: OUT + 'r95-week-1440.png' });
  await p.click('[data-view="month"]'); await p.click(T('month-cell-2026-10-21') + ' .d'); await p.waitForTimeout(250);
  ok('Day (the middle day): the bar is there too', await p.locator(T('calendar-view-day')).isVisible() && (await p.locator(`${T('calendar-view-day')} .chip[data-open="e1"]`).count()) === 1);
  await p.screenshot({ path: OUT + 'r95-day-1440.png' });

  // 4. opening an entry shows its range; Edit reopens the form with Ends on filled
  await p.click(`${T('calendar-view-day')} .chip[data-open="e1"]`); await p.waitForTimeout(200);
  ok('the drawer reads the range and the daily times', await p.locator(T('ev-drawer')).isVisible() && /Tue,? 20 Oct – Thu,? 22 Oct/.test(await p.locator(T('ev-when')).textContent()) && /each day/.test(await p.locator(T('ev-when')).textContent()));
  await p.click(T('ev-edit')); await p.waitForTimeout(150);
  ok('Edit opens with Ends on filled', (await p.locator(T('ev-end')).inputValue()) === '2026-10-22' && (await p.locator(T('ev-date')).inputValue()) === '2026-10-20');
  await p.keyboard.press('Escape'); await p.waitForTimeout(100);
  ok('Escape closes the drawer', (await p.locator(T('ev-drawer')).count()) === 0);
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 5. 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(600);
  ok('1024: no horizontal scroll; the bar still joined', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth) && (await sp('2026-10-21')) === 'sp-mid');
  await p.click('#newEvent'); await p.waitForTimeout(200);
  const d2 = await p.locator(T('ev-drawer')).boundingBox();
  ok('1024: the drawer fits on the right at 440', d2 && Math.abs(d2.x + d2.width - 1024) < 2 && d2.width <= 460);
  await p.screenshot({ path: OUT + 'r95-drawer-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
