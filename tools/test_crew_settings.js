// Settings › Crew app — Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_crew_settings.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('settings-crew-app.html');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H] of [[1440, 900], [1024, 800]]) {
    console.log(`\n== ${W} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H } });
    p.on('dialog', d => d.accept());
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
    const toast = async () => (await p.locator('#toast').innerText().catch(() => ''));

    await p.goto(U + '?page=business'); await p.waitForTimeout(500);
    ok(await p.locator(T('set-rail-crew')).isVisible(), 'Settings rail has "Crew app"');
    await p.locator(T('set-rail-crew')).click(); await p.waitForTimeout(300);
    ok(await p.locator(T('set-page-crew')).isVisible() && await p.locator(T('set-page-business')).isHidden(), 'clicking it opens the Crew app page');
    for (const s of ['sec-onboarding', 'sec-features', 'sec-signin', 'sec-notifications']) ok(await p.locator(T(s)).isVisible(), `section ${s} present`);
    // onboarding video
    ok(/welcome-2026\.mp4/.test(await p.locator(T('crew-video-status')).innerText()), 'welcome video shows name, length and upload date');
    await p.locator(T('crew-video-remove')).click(); await p.waitForTimeout(250);
    ok(/No video yet/.test(await p.locator(T('crew-video-status')).innerText()) && await p.locator(T('crew-video-upload')).isVisible(), 'Remove → "No video yet" and an Upload button');
    await p.locator(T('crew-video-upload')).click(); await p.waitForTimeout(250);
    ok(/uploaded today/.test(await p.locator(T('crew-video-status')).innerText()) && /storage/.test(await toast()), 'Upload → stored in the owner\'s storage, status updated');
    // phone preview follows the fields
    await p.locator(T('crew-headline')).fill('Welcome aboard, legend'); await p.locator(T('crew-preview')).click(); await p.waitForTimeout(350);
    ok(await p.locator(T('crew-phone')).isVisible() && (await p.locator('#phHead').innerText()) === 'Welcome aboard, legend' && /tidy/.test(await p.locator('#phNote').innerText()), 'Preview on a phone shows the headline and the note as typed');
    ok(await p.locator('#phVid').evaluate(el => el.classList.contains('none') === false), 'the phone shows the video block');
    await p.screenshot({ path: path.join(SHOTS, `crew-settings-phone-${W}.png`) });
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok(await p.locator(T('crew-phone')).isHidden(), 'Escape closes the preview');
    ok(await p.locator(T('set-savebar')).evaluate(el => el.classList.contains('show')), 'editing the headline raises the save bar');
    await p.locator(T('set-save')).click(); await p.waitForTimeout(250);
    ok(/Crew app saved/.test(await toast()), 'Save says "Crew app saved"');
    // features
    ok((await p.locator(T('crew-features') + ' .sw').count()) === 10 && (await p.locator(T('crew-feat-row-jobs')).innerText()).includes('always on'), 'ten features; Jobs and Time clock are always on');
    await p.locator(T('crew-feat-daily_reports')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('crew-feat-daily_reports')).getAttribute('aria-checked')) === 'false' && /Daily reports hidden from the crew/.test(await toast()), 'a feature switch saves at once with a plain toast');
    await p.locator(T('crew-feat-daily_reports')).click(); await p.waitForTimeout(150);
    // sign-in
    ok((await p.locator(T('crew-radius')).inputValue()) === '50' && (await p.locator(T('crew-rule-flag')).evaluate(el => el.classList.contains('on'))), 'distance 50 m, rule "Flag it" by default');
    await p.locator(T('crew-radius')).fill('10'); await p.locator(T('crew-radius')).dispatchEvent('change'); await p.waitForTimeout(200);
    ok((await p.locator(T('crew-radius')).inputValue()) === '30' && /minimum/.test(await p.locator(T('crew-radius-note')).innerText()), '10 m is pushed up to the 30 m minimum with a note');
    await p.locator(T('crew-rule-block')).click(); await p.waitForTimeout(250);
    ok((await p.locator(T('crew-rule-block')).evaluate(el => el.classList.contains('on'))) && /refused when the GPS reading is accurate/.test(await toast()), '"Refuse it" saves at once and explains the accuracy rule');
    await p.locator(T('crew-rule-flag')).click(); await p.waitForTimeout(150);
    // notifications
    ok((await p.locator(T('crew-notifications') + ' .sw').count()) === 5, 'five push choices');
    await p.locator(T('crew-notif-contract')).click(); await p.waitForTimeout(200);
    ok((await p.locator(T('crew-notif-contract')).getAttribute('aria-checked')) === 'false' && /Notification choices saved/.test(await toast()), 'a push switch saves at once');
    ok((await p.locator(T('set-page-crew')).innerText()).includes('Invites stay on the Employees page') && (await p.locator('[data-testid="sec-invites"]').count()) === 0, 'no Invites section: invites stay on the Employees page');
    await p.locator(T('sec-notifications')).scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(SHOTS, `crew-settings-${W}.png`) });
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(SHOTS, `crew-settings-top-${W}.png`) });
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll');
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
