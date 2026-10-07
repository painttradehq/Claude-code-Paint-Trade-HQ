const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/estimate-builder-fix-e.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  const txt = async (sel) => (await p.locator(sel).first().textContent() || '').trim();
  await p.goto(U); await p.waitForTimeout(700);
  // E5 line summary order + note line
  const metas = await p.locator('.lrow .ln .meta').allTextContents();
  ok('line summary reads Prep · Prime · N coats · product · colour (prep/prime first when ticked)', metas.some(m => /^Prep · Prime · \d coats? · /.test(m) || /^Prime · \d coats? · /.test(m)) && !metas.some(m => /coats? · (Prime|Prep)/.test(m)));
  ok('a note sits on its own line under the summary, with an "on the quote" mark when shown', (await p.locator('.lrow .meta .lnote').count()) >= 1 && (await p.locator('.lrow .meta .lnote .onq').count()) >= 1);
  ok('summaries are no longer cut off with an ellipsis', await p.evaluate(() => getComputedStyle(document.querySelector('.lrow .ln .meta')).whiteSpace === 'normal'));
  await p.screenshot({ path: OUT + 'fe-card-1440.png' });
  // E11 whole name block opens details
  await p.locator('.lrow .ln .meta').first().click(); await p.waitForTimeout(300);
  ok('clicking the summary (not only the name) opens the line details panel', await p.locator('#panelwrap').isVisible());
  await p.keyboard.press('Escape'); await p.evaluate(() => { document.querySelector('#panelwrap').hidden = true; });
  // E8 picker as a wide right-side panel + E2 ×N
  await p.click('[data-testid="add-exterior-zone"]'); await p.waitForTimeout(300);
  const box = await p.locator('#mbox').boundingBox();
  ok('the item picker opens as a right-side panel about 860 px wide, full height', box && box.width >= 800 && Math.abs(box.x + box.width - 1440) < 8 && box.height >= 880);
  ok('tiles sit four to a row', await p.evaluate(() => getComputedStyle(document.querySelector('.pk-grid')).gridTemplateColumns.split(' ').length === 4));
  await p.click(T('pk-opt-north-face')); await p.waitForTimeout(250);
  await p.screenshot({ path: OUT + 'fe-picker-1440.png' });
  await p.click(T('pk-opt-front-door')); await p.waitForTimeout(150); await p.click(T('pk-opt-front-door')); await p.waitForTimeout(150); await p.click(T('pk-opt-front-door')); await p.waitForTimeout(250);
  ok('picking Front Door three times makes one line with ×3, not three lines', await p.evaluate(() => { const nf = est.areas.find(a => a.name === 'North face'); const ls = est.lines.filter(l => l.area_id === nf.id && /Doors/.test(l.name)); return ls.length === 1 && Number(ls[0].qty) === 3; }) && /3×/.test(await txt(T('pk-opt-front-door'))));
  await p.click(T('pk-done')); await p.waitForTimeout(300);
  // E7 job details
  await p.click('.jcard[data-open="job"]'); await p.waitForTimeout(250);
  ok('Job details asks only how long and when; no scope line, no reference', (await p.locator('#jd_scope').count()) === 0 && (await p.locator('#jd_dur').count()) === 1 && (await p.locator('#jd_start').count()) === 1 && /How long and when|On the quote/.test(await txt('.jcard[data-open="job"] .v')));
  await p.screenshot({ path: OUT + 'fe-job-1440.png' });
  await p.evaluate(() => closeModal());
  // E6 new client more details
  await p.click('.jcard[data-open="contact"]').catch(() => {}); await p.waitForTimeout(250);
  if (await p.locator('#changeClient').count()) { await p.click('#changeClient'); await p.waitForTimeout(250); }
  await p.click('#newContact'); await p.waitForTimeout(250);
  ok('New client has a More details link that reveals the CRM fields', (await p.locator(T('client-more')).count()) === 1 && (await p.click(T('client-more')), await p.waitForTimeout(150), await p.locator(T('client-more-box')).isVisible()) && (await p.locator('#cf_company').count()) === 1);
  await p.screenshot({ path: OUT + 'fe-client-1440.png' });
  await p.evaluate(() => closeModal());
  // E4 photos
  await p.evaluate(() => openPhotos({})); await p.waitForTimeout(250);
  const before = await p.locator('.phcard').count();
  await p.click('#phTake'); await p.waitForTimeout(400);
  ok('taking a photo lands it in the grid with an Edit choice; the editor does not open by itself', (await p.locator('.phcard').count()) === before + 1 && (await p.locator('#ped, .ped, [data-testid="ped"]').count()) === 0 && (await p.locator('.phcard [data-phedit]').count()) >= 1 && await p.locator('#modal').isVisible());
  await p.evaluate(() => closeModal());
  // E10 client view products table
  await p.click('#v_client').catch(async () => { await p.click('[data-view="client"]'); }); await p.waitForTimeout(500);
  const prodTable = await p.locator('#clientview .sec:has-text("Products and colours")').first();
  ok('client document: products and colours without pack sizes or litres', (await prodTable.count()) === 1 && !/\d+\s?L\b/.test(await prodTable.textContent()) && (await prodTable.locator('td.nm .sub').count()) === 0);
  ok('client document: job details show duration and start only (no Scope row)', !/Scope/.test(await p.locator('#clientview .card.soft').first().textContent()));
  await p.screenshot({ path: OUT + 'fe-clientdoc-1440.png' });
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(500); await p.click('[data-testid="add-interior-area"]'); await p.waitForTimeout(300);
  ok('1024: picker panel fits, no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth) && await p.locator('#mbox').isVisible());
  await p.screenshot({ path: OUT + 'fe-picker-1024.png' });
  ok('no page errors', errs.length === 0); if (errs.length) console.log(errs);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
