// Job folder — photos and videos filed by phase (prototype job-folders-photos.html): crew at phone width, office at 1440 then 1024.
const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/job-folders-photos.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  const errs = [];
  const watch = (p) => { p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g|net::/.test(m.text())) errs.push(m.text()); }); };
  const noScroll = (p) => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  const txt = async (p, id) => (await p.locator(T(id)).textContent()).trim();
  const tiles = (p, grid) => p.locator(`${T(grid)} .tile`);

  // ═════════ CREW, phone width ═════════
  const c = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 }); watch(c);
  await c.goto(U); await c.waitForTimeout(700);
  ok('crew 390: no sideways scroll', await noScroll(c));
  ok('crew: one camera control, "Add photo or video"', await c.locator(T('crew-add')).isVisible() && /Add photo or video/.test(await txt(c, 'crew-add')));
  ok('crew: the line under it says where a capture goes and why (Process — the job is under way)', /saved to Process — the job is under way/.test(await txt(c, 'crew-goes')));
  ok('crew: chips are All · Before · Process · After with counts', /Before · 4/.test(await txt(c, 'crew-chip-before')) && /Process · 4/.test(await txt(c, 'crew-chip-process')) && /After · 0/.test(await txt(c, 'crew-chip-after')));
  ok('crew: the title counts everything (Photos · 8)', (await txt(c, 'crew-photos-title')) === 'Photos · 8');
  await c.screenshot({ path: OUT + 'folders-crew-390.png', fullPage: true });

  // chips only filter
  await c.click(T('crew-chip-before')); await c.waitForTimeout(100);
  ok('crew: tapping Before filters to the four Before captures — it does not open the camera', (await tiles(c, 'crew-grid').count()) === 4 && (await c.locator(`${T('crew-grid')} .tile[data-kind="before"]`).count()) === 4 && (await c.locator(T('sheet')).count()) === 0);
  await c.click(T('crew-chip-after')); await c.waitForTimeout(100);
  ok('crew: an empty filter says so', await c.locator(T('crew-none')).isVisible());
  await c.click(T('crew-chip-all')); await c.waitForTimeout(100);

  // the sheet, and filing by phase
  await c.click(T('crew-add')); await c.waitForTimeout(150);
  ok('crew: the sheet offers Take photo · Record video · Choose from gallery, and says where it goes', await c.locator(T('src-photo')).isVisible() && await c.locator(T('src-video')).isVisible() && await c.locator(T('src-gallery')).isVisible() && /Goes to Process/.test(await txt(c, 'sheet-sub')));
  ok('crew: the video option carries its limit (200 MB)', /200 MB/.test(await txt(c, 'src-video')));
  await c.screenshot({ path: OUT + 'folders-crew-sheet-390.png' });
  await c.click(T('src-photo')); await c.waitForTimeout(700);
  ok('crew: a photo taken now lands first in the grid, tagged Process', (await tiles(c, 'crew-grid').first().getAttribute('data-kind')) === 'process' && (await tiles(c, 'crew-grid').count()) === 9);
  ok('crew: the toast and the counts agree (Process · 5, folder tree 5)', /saved to Process/.test(await txt(c, 'toast')) && /Process · 5/.test(await txt(c, 'crew-chip-process')) && (await txt(c, 'tree-process')) === '5');
  await c.click(T('crew-add')); await c.waitForTimeout(120); await c.click(T('src-video')); await c.waitForTimeout(200);
  ok('crew: a video shows it is uploading', await c.locator(`${T('crew-grid')} .tile .up`).first().isVisible());
  await c.waitForTimeout(1100);
  ok('crew: then it is a video tile with its length, tagged Process', (await tiles(c, 'crew-grid').first().getAttribute('data-type')) === 'video' && /▶/.test(await tiles(c, 'crew-grid').first().textContent()) && (await txt(c, 'tree-process')) === '6');

  // viewer: read-only for crew
  await tiles(c, 'crew-grid').nth(1).click(); await c.waitForTimeout(150);
  ok('crew: the viewer shows who added it and the folder it is filed under', /Content › Process/.test(await txt(c, 'item-path')) && /Sam R\./.test(await txt(c, 'item-by')));
  ok('crew: no Delete and no re-file control for crew', (await c.locator(T('item-delete')).count()) === 0 && (await c.locator(T('item-move')).count()) === 0);
  await c.screenshot({ path: OUT + 'folders-crew-viewer-390.png' });
  await c.click(T('viewer-close')); await c.waitForTimeout(100);
  await tiles(c, 'crew-grid').nth(2).click(); await c.waitForTimeout(150);
  ok('crew: a quote-stage photo from the office reads Content › Before, with the office note', /Content › Before/.test(await txt(c, 'item-path')) && /Note from the office/.test(await txt(c, 'item-note')));
  await c.click(T('viewer-close')); await c.waitForTimeout(100);

  // the last invoice raised → After
  ok('crew: "Quote not accepted" is not offered on the crew screen (no job page before the job exists)', await c.locator(T('stage-quote')).isDisabled());
  await c.click(T('stage-last')); await c.waitForTimeout(120);
  ok('crew: once the last invoice is raised the line says After', /saved to After — the last invoice has been raised/.test(await txt(c, 'crew-goes')));
  await c.click(T('crew-add')); await c.waitForTimeout(120); await c.click(T('src-gallery')); await c.waitForTimeout(700);
  ok('crew: a capture now is tagged After and counted in After', (await tiles(c, 'crew-grid').first().getAttribute('data-kind')) === 'after' && /After · 1/.test(await txt(c, 'crew-chip-after')) && (await txt(c, 'tree-after')) === '1');
  ok('crew 390: still no sideways scroll after adding', await noScroll(c));
  await c.screenshot({ path: OUT + 'folders-crew-after-390.png', fullPage: true });

  // the reference tree
  const tree = await txt(c, 'tree-body');
  ok('tree: folder is the estimate number + suburb', (await txt(c, 'tree-root')) === 'EST-0031 South Wharf');
  ok('tree: four folders — Content (Before · Process · After), Crew reports, Final project report, Quotes and invoices', ['Content', 'Before', 'Process', 'After', 'Crew reports', 'Final project report', 'Quotes and invoices'].every((w) => tree.includes(w)));
  ok('tree: crew reports are named with the date and who filed them; quotes and invoices by number', /2026-11-12 Ali M\.pdf/.test(tree) && /INV-0042\.pdf/.test(tree) && /EST-0031 accepted\.pdf/.test(tree));
  await c.close();

  // ═════════ OFFICE, 1440 then 1024 ═════════
  for (const w of [1440, 1024]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 } }); watch(p);
    await p.goto(U); await p.waitForTimeout(600);
    await p.click(T('view-office')); await p.waitForTimeout(150);
    ok(`office ${w}: no sideways scroll`, await noScroll(p));
    ok(`office ${w}: the Photos card has Add photo or video and Open folder, with the folder's path`, await p.locator(T('office-add')).isVisible() && await p.locator(T('office-folder')).isVisible() && /Paint Trade HQ › EST-0031 South Wharf/.test(await txt(p, 'office-path')));
    const box = await p.locator(T('office-photos')).boundingBox(); const vp = p.viewportSize();
    ok(`office ${w}: the card fits the page`, box.x >= 0 && box.x + box.width <= vp.width + 1);
    await p.click(T('stage-quote')); await p.waitForTimeout(120);
    ok(`office ${w}: before acceptance the line says Before`, /saved to Before — the quote is not accepted yet/.test(await txt(p, 'office-goes')));
    await p.click(T('office-add')); await p.waitForTimeout(150);
    ok(`office ${w}: the add menu offers photos and a video (200 MB)`, await p.locator(T('office-src-photo')).isVisible() && /200 MB/.test(await txt(p, 'office-src-video')));
    const mb = await p.locator(T('office-menu')).boundingBox();
    ok(`office ${w}: the menu stays inside the page`, mb.x >= 0 && mb.x + mb.width <= vp.width);
    await p.click(T('office-src-photo')); await p.waitForTimeout(600);
    ok(`office ${w}: an upload before acceptance is filed under Before (5)`, (await tiles(p, 'office-grid').first().getAttribute('data-kind')) === 'before' && (await txt(p, 'tree-before')) === '5');
    if (w === 1440) await p.screenshot({ path: OUT + 'folders-office-1440.png', fullPage: true });
    // viewer: the office can re-file and delete
    await tiles(p, 'office-grid').first().click(); await p.waitForTimeout(150);
    ok(`office ${w}: the viewer has Filed as and Delete`, await p.locator(T('item-move')).isVisible() && await p.locator(T('item-delete')).isVisible());
    await p.selectOption(T('item-move'), 'process'); await p.waitForTimeout(200);
    ok(`office ${w}: re-filing moves it — Before back to 4, Process 5, the path follows`, (await txt(p, 'tree-before')) === '4' && (await txt(p, 'tree-process')) === '5' && /Content › Process/.test(await txt(p, 'item-path')));
    if (w === 1024) await p.screenshot({ path: OUT + 'folders-office-viewer-1024.png' });
    await p.click(T('item-delete')); await p.waitForTimeout(200);
    ok(`office ${w}: Delete removes it (Process back to 4, 8 in all)`, (await txt(p, 'tree-process')) === '4' && (await txt(p, 'office-count')) === '8');
    ok(`office ${w}: still no sideways scroll`, await noScroll(p));
    if (w === 1024) await p.screenshot({ path: OUT + 'folders-office-1024.png', fullPage: true });
    await p.close();
  }

  ok('no console errors', errs.length === 0); if (errs.length) console.log(errs.slice(0, 5));
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
