// Round 74 Presentation pages — Playwright checks at 1440 then 1024 (gear editor + builder client view).
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

    // ---- gear: Presentation tab
    await p.goto(UG + '?setup=presentation'); await p.waitForTimeout(600);
    ok(await p.locator(T('qs-pres-default')).isVisible() && (await p.locator(T('qs-pres-default')).getAttribute('aria-checked')) === 'true', 'Presentation tab: "Add presentation pages to every new quote" switch, on');
    ok(/One or two pages at the back of a quote, mostly large photos/.test(await p.locator('#qsBody').innerText()), 'tab text explains the pages');
    await p.locator(T('qs-pres-p1')).click(); await p.waitForTimeout(300);
    ok(await p.locator(T('qs-pres-page1')).isVisible() && await p.locator(T('qs-pres-page2')).isVisible(), 'template opens as a two-page editor');
    ok((await p.locator(T('qs-pres-photo-count')).innerText()) === '8 of 8', 'photo count reads "8 of 8" (hero + 4 + 3)');
    ok(await p.locator(T('qs-pres-hero-drop')).evaluate(el => el.getBoundingClientRect().height) >= 190, 'hero slot is the biggest (≥190 px tall)');
    ok((await p.locator('#big4 .slot').count()) === 4 && (await p.locator('#wide3 .slot').count()) === 3, 'page 1 has four large slots, page 2 three wide slots');
    // live preview
    await p.locator(T('qs-pres-preview')).click(); await p.waitForTimeout(400);
    ok(await p.locator(T('qs-preview-pane')).isVisible() && await p.locator(T('qs-prev-page1')).isVisible() && await p.locator(T('qs-prev-page2')).isVisible(), 'Live preview shows page 1 and page 2 beside the editor');
    ok(await p.locator(T('qs-prev-reviews')).isVisible() && await p.locator(T('qs-prev-links')).isVisible(), 'preview page 2 carries the reviews line and the link buttons');
    ok(/Kitchen · Manly/.test(await p.locator(T('qs-prev-page1')).innerText()), 'captions print on the preview');
    await p.screenshot({ path: path.join(SHOTS, `pres-editor-${W}.png`) });
    // remove a photo, pick from a job
    await p.locator(T('qs-pres-big-remove-1')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('qs-pres-photo-count')).innerText()) === '7 of 8' && await p.locator(T('qs-pres-big-add-1')).isVisible() && await p.locator(T('qs-pres-big-cap-1')).isDisabled(), 'remove a photo → "7 of 8", the slot offers Add photo, its caption is disabled');
    await p.locator(T('qs-pres-jobpick')).click(); await p.waitForTimeout(200);
    ok(await p.locator(T('qs-pres-jobpick-strip')).isVisible() && (await p.locator('#jobPick .row button').count()) === 12, '"Pick from a finished job" opens a strip of job photos');
    await p.locator(T('qs-pres-jobpick-7')).click(); await p.waitForTimeout(300);
    ok((await p.locator('#big4 [data-slot="big"][data-i="1"]').getAttribute('data-url')) === 'bedroom-feature.jpg' && (await p.locator(T('qs-pres-photo-count')).innerText()) === '8 of 8', 'a job photo fills the empty slot → "8 of 8"');
    await p.locator(T('qs-pres-big-cap-1')).fill('Feature wall'); await p.waitForTimeout(250);
    ok(/Feature wall/.test(await p.locator(T('qs-prev-page1')).innerText()), 'typing a caption updates the preview');
    // page 2 off / on keeps the story
    await p.locator(T('qs-pres-page2-toggle')).click(); await p.waitForTimeout(300);
    ok(await p.locator(T('qs-pres-page2-off')).isVisible() && (await p.locator(T('qs-prev-page2')).count()) === 0 && (await p.locator(T('qs-pres-photo-count')).innerText()) === '5 of 8', 'page 2 off: the editor says so, the preview has one page, count "5 of 8"');
    ok(/Page 1 of 1/.test(await p.locator(T('qs-prev-page1')).innerText()), 'preview footer reads "Page 1 of 1"');
    await p.locator(T('qs-pres-page2-toggle')).click(); await p.waitForTimeout(300);
    ok(/We treat your home/.test(await p.locator(T('qs-pres-intro')).inputValue()) && (await p.locator(T('qs-pres-photo-count')).innerText()) === '8 of 8', 'page 2 on again: the story and its photos are kept');
    // hero remove / add
    await p.locator(T('qs-pres-hero-remove')).click(); await p.waitForTimeout(250);
    ok(/Hero photo — the biggest picture/.test(await p.locator(T('qs-pres-hero-drop')).innerText()) && (await p.locator(T('qs-pres-photo-count')).innerText()) === '7 of 8', 'hero removed → the drop zone explains itself, "7 of 8"');
    await p.locator(T('qs-pres-hero-drop')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('qs-pres-photo-count')).innerText()) === '8 of 8', 'clicking the hero zone uploads a photo → "8 of 8"');
    // reviews toggle reflects in preview
    await p.locator(T('qs-pres-reviews')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('qs-prev-reviews')).count()) === 0, 'reviews switch off removes the reviews line from the preview');
    await p.locator(T('qs-pres-reviews')).click(); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(SHOTS, `pres-editor-edited-${W}.png`) });
    // save
    await p.locator(T('qs-pres-save')).click(); await p.waitForTimeout(400);
    ok(/Template saved/.test(await p.locator('#toast').innerText().catch(() => '')) || (await p.locator(T('qs-pres-p1')).count()) === 1, 'Save returns to the template list');
    ok((await p.locator(T('qs-preview-pane')).isHidden()), 'the preview closes with the editor');
    // default switch toggles and saves
    await p.locator(T('qs-pres-default')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('qs-pres-default')).getAttribute('aria-checked')) === 'false' && /estimate-defaults/.test(await p.locator('#toast').innerText().catch(() => '')), 'the default switch saves on click');
    await p.locator(T('qs-pres-default')).click(); await p.waitForTimeout(150);
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'gear: no horizontal page scroll');

    // ---- builder: client view with the pages
    await p.goto(UB + '?pres=on'); await p.waitForTimeout(700);
    await p.locator('#sendBtn').click(); await p.waitForTimeout(500);
    const doc = p.locator('#rs_doc');
    ok(await doc.locator(T('cdoc-pres-page1')).isVisible() && await doc.locator(T('cdoc-pres-page2')).isVisible(), 'Review & Send client view: presentation page 1 and page 2 at the back of the quote');
    ok((await doc.locator(T('cdoc-pres-grid') + ' > div').count()) === 4 && (await doc.locator(T('cdoc-pres-wide') + ' > div').count()) === 3, 'four large photos on page 1, three wide on page 2');
    ok(await doc.locator(T('cdoc-pres-hero')).evaluate(el => el.getBoundingClientRect().height) >= 150, 'the hero is a large photo area');
    ok(await doc.locator(T('cdoc-pres-reviews')).isVisible() && await doc.locator(T('cdoc-pres-links')).isVisible() && /4\.9/.test(await doc.locator(T('cdoc-pres-reviews')).innerText()), 'page 2 shows the reviews and the links');
    await doc.locator(T('cdoc-pres-page1')).scrollIntoViewIfNeeded(); await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(SHOTS, `pres-client-${W}.png`) });
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    // Quote details: text + commercial template = one page
    await p.locator(T('eb-details')).click(); await p.waitForTimeout(300);
    ok(/One or two pages at the back of the quote/.test(await p.locator(T('ed-presentation')).innerText()), 'Quote details explains the pages');
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
