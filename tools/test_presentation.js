// Round 74 Presentation block builder — Playwright checks at 1440 then 1024 (gear editor + builder client view).
// Run: NODE_PATH=$(npm root -g) node tools/test_presentation.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const UG = 'file://' + path.resolve('quote-setup-presentation.html');
const UB = 'file://' + path.resolve('estimate-builder-presentation.html');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H] of [[1440, 900], [1024, 800]]) {
    console.log(`\n== ${W} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H } });
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
    const order = async () => p.$$eval('#blocks .blk', els => els.map(e => e.dataset.type));
    const toast = async () => (await p.locator('#toast').innerText().catch(() => ''));

    // ---- gear: Presentation tab
    await p.goto(UG + '?setup=presentation'); await p.waitForTimeout(600);
    ok(await p.locator(T('qs-pres-default')).isVisible() && (await p.locator(T('qs-pres-default')).getAttribute('aria-checked')) === 'true', 'Presentation tab: "Add presentation pages to every new quote" switch, on');
    ok(/built from blocks you order as you like/.test(await p.locator('#qsBody').innerText()), 'tab text explains the blocks');
    // reviews & ratings box on the tab
    ok(/2 of 3/i.test(await p.locator(T('qs-ratings-count')).innerText()) && (await p.locator(T('qs-rating-platform-1')).inputValue()) === 'hipages', 'Reviews & ratings lists two platforms, Google and hipages');
    await p.locator(T('qs-rating-add')).click(); await p.waitForTimeout(250);
    ok(/3 of 3/i.test(await p.locator(T('qs-ratings-count')).innerText()) && (await p.locator(T('qs-rating-platform-2')).inputValue()) === 'oneflare' && (await p.locator(T('qs-rating-add')).count()) === 0, 'Add platform → a third row (Oneflare), and no fourth');
    await p.locator(T('qs-rating-platform-2')).selectOption('airtasker'); await p.waitForTimeout(250);
    ok((await p.locator(T('qs-rating-platform-2')).inputValue()) === 'airtasker', 'the platform can be changed on the row');
    await p.locator(T('qs-rating-remove-2')).click(); await p.waitForTimeout(250);
    ok(/2 of 3/i.test(await p.locator(T('qs-ratings-count')).innerText()), 'Remove → back to two');
    await p.locator(T('qs-rating-stars-1')).fill('7'); await p.locator(T('qs-reviews-save')).click(); await p.waitForTimeout(250);
    ok(/0 to 5/.test(await toast()), 'a rating above 5 is refused');
    await p.locator(T('qs-rating-stars-1')).fill('4.8'); await p.locator(T('qs-reviews-save')).click(); await p.waitForTimeout(250);
    ok(/Reviews saved/.test(await toast()), 'Save reviews saves the platforms');
    await p.locator(T('qs-pres-p1')).click(); await p.waitForTimeout(300);
    ok(/hipages/.test(await p.locator(T('qs-blk-reviews-note')).innerText()), 'the Reviews block names the platforms it prints');
    ok((await order()).join(',') === 'hero,grid,break,message,about,grid,reviews,links', 'template opens as an ordered list of eight blocks (hero, grid, page break, message, about, grid, reviews, links)');
    ok((await p.locator(T('qs-pres-photo-count')).innerText()) === '8 of 8' && /2 pages/.test(await p.locator(T('qs-pres-page-count')).innerText()), 'counters: 8 of 8 photos · 2 pages');
    ok(await p.locator(T('qs-blk-head-b4')).inputValue() === 'A note for you' && /Thanks for having us out/.test(await p.locator(T('qs-blk-text-b4')).inputValue()), 'the Message block has a headline and text');
    // live preview
    await p.locator(T('qs-pres-preview')).click(); await p.waitForTimeout(400);
    ok(await p.locator(T('qs-preview-pane')).isVisible() && await p.locator(T('qs-prev-page1')).isVisible() && await p.locator(T('qs-prev-page2')).isVisible(), 'Live preview shows page 1 and page 2');
    ok(/A note for you/.test(await p.locator(T('qs-prev-page2')).innerText()) && await p.locator(T('qs-prev-reviews')).isVisible() && await p.locator(T('qs-prev-links')).isVisible(), 'page 2 of the preview carries the message, the reviews and the links');
    ok(/hipages/.test(await p.locator(T('qs-prev-reviews')).innerText()) && /Google/.test(await p.locator(T('qs-prev-reviews')).innerText()), 'the preview prints both platforms');
    await p.screenshot({ path: path.join(SHOTS, `pres-editor-${W}.png`) });
    // move: message above the page break → it prints on page 1
    await p.locator(T('qs-blk-up-b4')).click(); await p.waitForTimeout(300);
    ok((await order()).join(',') === 'hero,grid,message,break,about,grid,reviews,links' && /A note for you/.test(await p.locator(T('qs-prev-page1')).innerText()), 'Move up puts the message above the page break and the preview shows it on page 1');
    await p.locator(T('qs-blk-up-b4')).click(); await p.locator(T('qs-blk-up-b4')).click(); await p.waitForTimeout(300);
    ok((await order())[0] === 'message', 'two more moves put the message first — photos can go below the words');
    ok(await p.locator(T('qs-blk-up-b4')).isDisabled(), 'the first block cannot move up');
    // photos: remove, cap, pick from a job per block
    await p.locator(T('qs-slot-rm-b2-1')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('qs-pres-photo-count')).innerText()) === '7 of 8' && await p.locator(T('qs-slot-add-b2-1')).isVisible() && await p.locator(T('qs-slot-cap-b2-1')).isDisabled(), 'remove a grid photo → 7 of 8, the slot offers Add photo, its caption is disabled');
    await p.locator(T('qs-jobpick-b2')).click(); await p.waitForTimeout(200);
    ok(await p.locator('#jobPick-b2').isVisible() && (await p.locator('#jobPick-b2 .row button').count()) === 12, '"Pick from a finished job" on the grid block opens its own strip');
    await p.locator(T('qs-job-b2-7')).click(); await p.waitForTimeout(300);
    ok((await p.locator('[data-blk="b2"] [data-slot][data-i="1"]').getAttribute('data-url')) === 'bedroom-feature.jpg' && (await p.locator(T('qs-pres-photo-count')).innerText()) === '8 of 8', 'the job photo fills that block\'s empty slot → 8 of 8');
    await p.locator(T('qs-slot-cap-b2-1')).fill('Feature wall'); await p.waitForTimeout(250);
    ok(/Feature wall/.test(await p.locator(T('qs-prev-page1')).innerText()), 'typing a caption updates the preview');
    // layout switch
    await p.locator(T('qs-layout-b2-3wide')).click(); await p.waitForTimeout(300);
    ok((await p.locator('[data-blk="b2"] .wide3 .slot').count()) === 3 && (await p.locator(T('qs-pres-photo-count')).innerText()) === '7 of 8', 'switching the grid to three wide keeps the first three photos → 7 of 8');
    await p.locator(T('qs-layout-b2-2x2')).click(); await p.waitForTimeout(250);
    ok((await p.locator('[data-blk="b2"] .big4 .slot').count()) === 4 && (await p.locator(T('qs-pres-photo-count')).innerText()) === '7 of 8', 'back to 2 × 2: four slots, the fourth now empty (still 7 of 8)');
    // page break: remove → one page; add back from the menu
    await p.locator(T('qs-blk-rm-b3')).click(); await p.waitForTimeout(300);
    ok(!(await order()).includes('break') && /1 page/.test(await p.locator(T('qs-pres-page-count')).innerText()) && (await p.locator(T('qs-prev-page2')).count()) === 0, 'removing the page break → one page in the counter and the preview');
    await p.locator(T('qs-blk-add')).click(); await p.waitForTimeout(200);
    ok(await p.locator(T('qs-blk-menu')).isVisible() && (await p.locator(T('qs-blk-menu') + ' button').count()) === 7, '"Add a block" opens a menu of the seven block types');
    ok(await p.locator(T('qs-blk-add-reviews')).isDisabled() && await p.locator(T('qs-blk-add-links')).isDisabled(), 'reviews and links can be added once only');
    await p.locator(T('qs-blk-add-break')).click(); await p.waitForTimeout(300);
    ok((await order()).slice(-1)[0] === 'break' && /2 pages/.test(await p.locator(T('qs-pres-page-count')).innerText()), 'adding a page break at the end → 2 pages again');
    await p.locator(T('qs-blk-add')).click(); await p.waitForTimeout(150);
    ok(await p.locator(T('qs-blk-add-break')).isDisabled(), 'a second page break is not offered (two pages at most)');
    // add a second message block
    await p.locator(T('qs-blk-add-message')).click(); await p.waitForTimeout(300);
    const ids = await p.$$eval('#blocks .blk', els => els.map(e => e.dataset.blk)); const nid = ids[ids.length - 1];
    ok((await order()).slice(-1)[0] === 'message' && (await p.locator(T('qs-blk-head-' + nid)).inputValue()) === 'A note for you', 'a new Message block lands at the end with its headline ready');
    await p.locator(T('qs-blk-head-' + nid)).fill('Thanks, Jane'); await p.locator(T('qs-blk-text-' + nid)).fill('We start on the Monday after your deposit.'); await p.waitForTimeout(250);
    ok(/Thanks, Jane/.test(await p.locator(T('qs-prev-page2')).innerText()), 'the new message prints on page 2 of the preview');
    // hero remove / add
    await p.locator(T('qs-hero-remove-b1')).click(); await p.waitForTimeout(250);
    ok(/Your best photo, full width/.test(await p.locator(T('qs-hero-b1')).innerText()) && (await p.locator(T('qs-pres-photo-count')).innerText()) === '6 of 8', 'hero removed → the zone explains itself, 6 of 8');
    await p.locator(T('qs-hero-b1')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('qs-pres-photo-count')).innerText()) === '7 of 8', 'clicking the hero zone uploads a photo → 7 of 8');
    await p.screenshot({ path: path.join(SHOTS, `pres-editor-edited-${W}.png`) });
    // save
    await p.locator(T('qs-pres-save')).click(); await p.waitForTimeout(400);
    ok((await p.locator(T('qs-pres-p1')).count()) === 1 && await p.locator(T('qs-preview-pane')).isHidden(), 'Save returns to the template list and closes the preview');
    await p.locator(T('qs-pres-default')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('qs-pres-default')).getAttribute('aria-checked')) === 'false' && /estimate-defaults/.test(await toast()), 'the default switch saves on click');
    await p.locator(T('qs-pres-default')).click(); await p.waitForTimeout(150);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'gear: no horizontal page scroll');

    // ---- builder: client view with the blocks
    await p.goto(UB + '?pres=on'); await p.waitForTimeout(700);
    await p.locator('#sendBtn').click(); await p.waitForTimeout(500);
    const doc = p.locator('#rs_doc');
    ok(await doc.locator(T('cdoc-pres-page1')).isVisible() && await doc.locator(T('cdoc-pres-page2')).isVisible(), 'Review & Send client view: presentation page 1 and page 2 at the back of the quote');
    ok(await doc.locator(T('cdoc-blk-hero')).isVisible() && (await doc.locator(T('cdoc-pres-grid') + ' > div').count()) === 4 && (await doc.locator(T('cdoc-pres-wide') + ' > div').count()) === 3, 'hero, a 2 × 2 grid and a three-wide grid render as blocks');
    ok(await doc.locator(T('cdoc-blk-message')).isVisible() && /A note for you/.test(await doc.locator(T('cdoc-blk-message')).innerText()), 'the message block prints as a note to the client');
    ok(await doc.locator(T('cdoc-pres-hero')).evaluate(el => el.getBoundingClientRect().height) >= 150, 'the hero is a large photo area');
    ok(await doc.locator(T('cdoc-rating-google')).isVisible() && await doc.locator(T('cdoc-rating-hipages')).isVisible() && /41 reviews on hipages/.test(await doc.locator(T('cdoc-pres-reviews')).innerText()) && await doc.locator(T('cdoc-pres-links')).isVisible(), 'page 2 shows a rating card per platform and the links');
    await doc.locator(T('cdoc-pres-page1')).scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(SHOTS, `pres-client-${W}.png`) });
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    await p.locator(T('eb-details')).click(); await p.waitForTimeout(300);
    ok(/built from blocks you order as you like/.test(await p.locator(T('ed-presentation')).innerText()), 'Quote details explains the blocks');
    await p.locator(T('ed-tpl-commercial-strata')).click(); await p.waitForTimeout(250);
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    await p.locator('#sendBtn').click(); await p.waitForTimeout(500);
    ok(await doc.locator(T('cdoc-pres-page1')).isVisible() && (await doc.locator(T('cdoc-pres-page2')).count()) === 0 && /Recent commercial work/.test(await doc.locator(T('cdoc-pres-page1')).innerText()), 'the commercial template is one page');
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'builder: no horizontal page scroll');
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
