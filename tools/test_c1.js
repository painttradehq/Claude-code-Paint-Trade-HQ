// Crew shell prototype (C1 shell + C2 Jobs + C3 time clock) — Playwright checks at 390 × 844 then 360 × 800.
// Run: NODE_PATH=$(npm root -g) node tools/test_c1.js [shots-dir]
const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/c1-crew-shell.html';
const OUT = (process.argv[2] || '/tmp/c1-shots') + '/';
require('fs').mkdirSync(OUT, { recursive: true });

async function run(b, W, H, tag) {
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const txt = async (sel) => (await p.locator(sel).first().textContent() || '').trim();
  const noHScroll = () => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth && document.body.scrollWidth <= window.innerWidth);
  const box = (sel) => p.locator(sel).first().boundingBox();
  const go = () => p.evaluate(() => document.body.dataset.lastGo);
  const full = ` [${tag}]`;

  // ---- sign in ----
  await p.goto(U); await p.waitForTimeout(400);
  ok('login: mark, name, email, password, Sign in visible' + full,
    await p.locator(T('crew-login')).isVisible() && (await txt(T('crew-login-name'))) === 'Paint Trade HQ' &&
    await p.locator(T('employee-login-email')).isVisible() && await p.locator(T('employee-login-password')).isVisible() && await p.locator(T('employee-login-submit')).isVisible());
  ok('login: fits the screen without scrolling' + full, await p.evaluate(() => { const s = document.getElementById('s-login'); return s.scrollHeight <= s.clientHeight + 1; }));
  const inB = await box(T('employee-login-email')), btnB = await box(T('employee-login-submit'));
  ok('login: inputs and button are at least 44 px tall' + full, inB.height >= 44 && btnB.height >= 44);
  await p.screenshot({ path: OUT + `c1-login-${tag}.png` });
  await p.click(T('employee-login-submit')); await p.waitForTimeout(150);
  ok('login: empty submit shows one inline error, stays on login' + full, await p.locator(T('employee-login-error')).isVisible() && /Enter your email and password/.test(await txt(T('employee-login-error'))));
  await p.fill(T('employee-login-email'), 'restricted@example.com'); await p.fill(T('employee-login-password'), 'x'); await p.click(T('employee-login-show'));
  ok('login: Show reveals the password' + full, (await p.locator(T('employee-login-password')).getAttribute('type')) === 'text');
  await p.click(T('employee-login-submit')); await p.waitForTimeout(150);
  ok('login: red-flagged account keeps the existing 403 wording' + full, (await txt(T('employee-login-error'))) === 'Account access temporarily restricted. Please contact admin.');
  await p.screenshot({ path: OUT + `c1-login-error-${tag}.png` });
  await p.fill(T('employee-login-email'), 'mia@example.com'); await p.click(T('employee-login-submit')); await p.waitForTimeout(300);

  // ---- Today ----
  ok('sign in lands on Today with the tab bar' + full, await p.locator(T('crew-pane-today')).isVisible() && await p.locator(T('crew-tabbar')).isVisible() && (await p.locator(T('crew-tab-today')).getAttribute('class')).includes('on'));
  const tb = await box(T('crew-tabbar'));
  ok('tab bar on the bottom edge: Today · Jobs · Inbox · Learn · Me' + full, Math.abs(tb.y + tb.height - H) < 1 && (await p.evaluate(() => [...document.querySelectorAll('.tab')].map(t => t.textContent.replace(/\d/g, '').trim()).join(' '))) === 'Today Jobs Inbox Learn Me');
  ok('tabs are at least 44 px tall' + full, (await box(T('crew-tab-jobs'))).height >= 44);
  ok('clock card: signed out = last sign-out with its hours, no job row, Sign in, the one location line' + full, /Signed out/.test(await txt('#clockStatus')) && /Not on the clock/.test(await txt('#clockBig')) && (await txt('#clockLine')) === 'Last signed out 5:12 pm yesterday · 7 h 50 m · Wattle St repaint' && !(await p.locator(T('crew-today-job')).isVisible()) && (await txt(T('crew-today-clock-btn'))) === 'Sign in' && (await txt(T('crew-clock-legal'))) === 'Your location is recorded only when you sign in or out, never in between.' && !(await p.locator(T('crew-clock-offsite')).isVisible()) && !(await p.locator(T('crew-clock-nogps')).isVisible()));
  ok("today's job card: the in-progress job, address, who else is on it, access line" + full, /Nguyen/.test(await txt(T('crew-today-jobcard'))) && /14 Wattle St, Brunswick/.test(await txt(T('crew-today-jobcard'))) && /Tom with you/.test(await txt(T('crew-today-jobcard'))) && /Key under the pot plant/.test(await txt(T('crew-today-jobcard'))));
  ok('unread: heading count, three rows on Today, badge on the Inbox tab' + full, (await txt('#notifHead')) === 'Unread · 3' && (await p.locator('#notifList ' + T('crew-notif-row')).count()) === 3 && (await txt(T('crew-tab-inbox-badge'))) === '3');
  ok('notification rows are at least 44 px tall' + full, (await box(T('crew-notif-row'))).height >= 44);
  await p.screenshot({ path: OUT + `c1-today-out-${tag}.png` });
  // ---- C3: sign in = pick the job → one location fix → signed in ----
  await p.click(T('crew-today-clock-btn')); await p.waitForTimeout(150);
  ok('Sign in opens the job sheet: Now job, Coming-up job, General; Cancel' + full, await p.locator(T('crew-clock-picker')).isVisible() && (await p.locator(T('crew-clock-pick')).count()) === 3 && /Wattle St repaint/.test(await txt(T('crew-clock-pick'))) && /In progress/.test(await txt(T('crew-clock-pick'))) && (await p.locator(T('crew-clock-pick')).nth(1).textContent()).includes('Starts Mon 20 Oct') && /General/.test(await p.locator(T('crew-clock-pick')).nth(2).textContent()) && await p.locator(T('crew-clock-picker-cancel')).isVisible());
  ok('job sheet rows are at least 44 px tall' + full, (await box(T('crew-clock-pick'))).height >= 44);
  await p.screenshot({ path: OUT + `c3-picker-${tag}.png` });
  await p.click(T('crew-clock-picker-cancel')); await p.waitForTimeout(100);
  ok('Cancel closes the sheet and nothing is signed in' + full, !(await p.locator(T('crew-clock-picker')).isVisible()) && /Signed out/.test(await txt('#clockStatus')));
  await p.click(T('crew-today-clock-btn')); await p.waitForTimeout(100); await p.locator(T('crew-clock-pick')).first().click(); await p.waitForTimeout(80);
  ok('picking a job closes the sheet; the button reads "Getting your location…" and is disabled' + full, !(await p.locator(T('crew-clock-picker')).isVisible()) && (await txt(T('crew-today-clock-btn'))) === 'Getting your location…' && await p.locator(T('crew-today-clock-btn')).isDisabled());
  await p.waitForTimeout(700);
  ok('clock card: signed in = time on the clock, since, the job row, Sign out' + full, /Signed in/.test(await txt('#clockStatus')) && /0 h 00 m on the clock/.test(await txt('#clockBig')) && /Since 7:04 am today/.test(await txt('#clockLine')) && /Job: Wattle St repaint/.test(await txt(T('crew-today-job'))) && (await txt(T('crew-today-clock-btn'))) === 'Sign out' && !(await p.locator(T('crew-clock-offsite')).isVisible()));
  await p.screenshot({ path: OUT + `c1-today-in-${tag}.png` });
  await p.click(T('crew-today-job')); await p.waitForTimeout(150);
  ok('the job row on the clock card opens the job screen' + full, await p.locator(T('crew-job')).isVisible() && (await txt('#jobTitle')) === 'Wattle St repaint');
  await p.click(T('crew-job-back')); await p.waitForTimeout(100); await p.click(T('crew-tab-today')); await p.waitForTimeout(100);
  await p.click(T('crew-today-clock-btn')); await p.waitForTimeout(80);
  ok('Sign out: no sheet, "Getting your location…" first' + full, !(await p.locator(T('crew-clock-picker')).isVisible()) && (await txt(T('crew-today-clock-btn'))) === 'Getting your location…');
  await p.waitForTimeout(700);
  ok('after sign-out the card shows the sign-out time, the hours and the job' + full, /Signed out/.test(await txt('#clockStatus')) && (await txt('#clockLine')) === 'Last signed out 9:39 am today · 0 h 00 m · Wattle St repaint' && (await txt(T('crew-today-clock-btn'))) === 'Sign in');
  await p.screenshot({ path: OUT + `c3-today-after-out-${tag}.png` });
  await p.click(T('crew-today-clock-btn')); await p.waitForTimeout(100); await p.locator(T('crew-clock-pick')).first().click(); await p.waitForTimeout(700);
  await p.locator('#notifList ' + T('crew-notif-row')).first().click(); await p.waitForTimeout(150);
  ok('tapping a notification marks it read and records its link' + full, (await txt('#notifHead')) === 'Unread · 2' && (await txt(T('crew-tab-inbox-badge'))) === '2' && (await go()) === '/employee/contracts');
  ok('Daily report row opens the existing screen' + full, (await p.locator(T('crew-today-report')).getAttribute('data-go')) === '/employee/daily-report');
  ok('Today: content ends above the tab bar' + full, await p.evaluate(() => { const b = document.querySelector('#t-today .body'); b.scrollTop = b.scrollHeight; const last = b.lastElementChild.getBoundingClientRect().bottom; const tab = document.querySelector('.tabbar').getBoundingClientRect().top; return last <= tab; }));
  ok('no horizontal scroll' + full, await noHScroll());

  // ---- Jobs ----
  await p.click(T('crew-tab-jobs')); await p.waitForTimeout(120);
  ok('Jobs: Now shows the one in-progress job with pill, address, dates, crew count' + full, (await p.locator(T('crew-job-row')).count()) === 1 && /In progress/.test(await txt(T('crew-job-row'))) && /3 on the crew|2 on the crew/.test(await txt(T('crew-job-row'))));
  await p.screenshot({ path: OUT + `c1-jobs-${tag}.png` });
  await p.click(T('crew-jobs-seg-up')); await p.waitForTimeout(100);
  ok('Jobs: Coming up shows Harrow with its start date' + full, (await p.locator(T('crew-job-row')).count()) === 1 && /Harrow/.test(await txt(T('crew-job-row'))) && /Starts Mon 20 Oct/.test(await txt(T('crew-job-row'))));
  await p.click(T('crew-jobs-seg-done')); await p.waitForTimeout(100);
  ok('Jobs: Done shows Patel' + full, /Patel/.test(await txt(T('crew-job-row'))));
  await p.click(T('crew-jobs-seg-now')); await p.waitForTimeout(100);
  await p.locator(T('crew-job-row')).first().click(); await p.waitForTimeout(200);

  // ---- Job screen ----
  ok('job screen opens as a stack screen: no tab bar, back to Jobs, name + address, Directions + Daily report' + full, await p.locator(T('crew-job')).isVisible() && !(await p.locator(T('crew-tabbar')).isVisible()) && (await txt('#jobTitle')) === 'Wattle St repaint' && (await txt('#jobAddr')) === 'Linh Nguyen · 14 Wattle St, Brunswick' && await p.locator(T('crew-job-directions')).isVisible() && await p.locator(T('crew-job-report-btn')).isVisible() && (await go()) === '/employee/project/j1');
  ok('job: no site-contact row on a job without one' + full, (await p.locator(T('crew-job-site-contact')).count()) === 0);
  ok('job: dates & crew, access note from the owner' + full, /Mon 6 Oct → Fri 17 Oct/.test(await txt(T('crew-job-crew'))) && /Mia, Tom/.test(await txt(T('crew-job-crew'))) && /From Josh:/.test(await txt(T('crew-job-notes'))) && /alarm code 4471/.test(await txt(T('crew-job-notes'))));
  ok('job: the work = areas with lines and coats, added work marked, no prices anywhere' + full, (await p.locator(T('crew-job-work') + ' .area').count()) === 5 && (await p.locator(T('crew-job-added-work')).count()) === 1 && /Added work · approved 9 Oct/.test(await txt(T('crew-job-added-work'))) && /Skirting & architraves/.test(await txt(T('crew-job-work'))) && !/\$/.test(await txt('#jobBody')));
  ok('job: paints & colours with swatches' + full, (await p.locator(T('crew-job-paints') + ' .swatch').count()) === 3 && /Natural White · walls/.test(await txt(T('crew-job-paints'))));
  ok('job: files the owner marked crew-visible' + full, (await p.locator(T('crew-job-file')).count()) === 2 && /Strata approval\.pdf/.test(await txt(T('crew-job-files'))));
  ok('job: photo grid with Add, my reports with Replied' + full, (await p.locator(T('crew-job-photos') + ' .ph').count()) === 6 && await p.locator(T('crew-job-photo-add')).isVisible() && /Replied/.test(await txt(T('crew-job-reports'))));
  ok('job: back row ≥ 44 px; no horizontal scroll' + full, (await box(T('crew-job-back'))).height >= 44 && await noHScroll());
  await p.screenshot({ path: OUT + `c1-job-${tag}.png` });
  await p.evaluate(() => { document.getElementById('jobBody').scrollTop = 99999; }); await p.waitForTimeout(100);
  await p.screenshot({ path: OUT + `c1-job-bottom-${tag}.png` });
  await p.click(T('crew-job-report-btn')); ok('job: Daily report button opens the report screen' + full, (await go()) === '/employee/daily-report');
  await p.click(T('crew-job-back')); await p.waitForTimeout(150);
  ok('back returns to the Jobs tab' + full, await p.locator(T('crew-pane-jobs')).isVisible() && await p.locator(T('crew-tabbar')).isVisible());
  await p.click(T('crew-tab-today')); await p.waitForTimeout(100); await p.click(T('crew-today-jobcard')); await p.waitForTimeout(150);
  ok("Today's job card opens the same job screen" + full, await p.locator(T('crew-job')).isVisible() && (await txt('#jobTitle')) === 'Wattle St repaint');
  await p.click(T('crew-job-back')); await p.waitForTimeout(100);

  // ---- Inbox ----
  await p.click(T('crew-tab-inbox')); await p.waitForTimeout(120);
  ok('Inbox: Message Josh row, all five messages, unread first with dots, Mark all read' + full, await p.locator(T('crew-inbox-message')).isVisible() && (await p.locator('#inboxList ' + T('crew-notif-row')).count()) === 5 && (await p.locator('#inboxList .row.read').count()) === 3 && await p.locator(T('crew-inbox-readall')).isVisible());
  await p.screenshot({ path: OUT + `c1-inbox-${tag}.png` });
  await p.click(T('crew-inbox-readall')); await p.waitForTimeout(100);
  ok('Mark all read clears the badge and hides the link' + full, !(await p.locator(T('crew-tab-inbox-badge')).isVisible()) && !(await p.locator(T('crew-inbox-readall')).isVisible()) && (await p.locator('#inboxList .row.read').count()) === 5);

  // ---- Learn / Me ----
  await p.click(T('crew-tab-learn')); await p.waitForTimeout(120);
  ok('Learn: Training, Coaching (route strike-system), How I\'m going; never the word strike' + full, (await p.locator('#learnList .row').count()) === 3 && (await p.locator(T('crew-learn-coaching')).getAttribute('data-go')) === '/employee/strike-system' && !/strike/i.test(await txt('#t-learn')));
  await p.screenshot({ path: OUT + `c1-learn-${tag}.png` });
  await p.click(T('crew-tab-me')); await p.waitForTimeout(120);
  ok('Me: profile row, My documents (1), My equipment, My hours, Team events, Sign out' + full, await p.locator(T('crew-me-profile')).isVisible() && (await txt(T('crew-me-contracts') + ' .count')) === '1' && (await p.locator('#meList .row').count()) === 3 && (await p.locator('#teamList .row').count()) === 1 && await p.locator(T('crew-me-signout')).isVisible());
  // ---- C3: My hours ----
  await p.click(T('crew-me-hours')); await p.waitForTimeout(150);
  ok('My hours opens as a stack screen: back to Me, days newest first, the open session on top' + full, await p.locator(T('crew-hours')).isVisible() && !(await p.locator(T('crew-tabbar')).isVisible()) && (await go()) === '/employee/time-clock' && (await p.locator(T('crew-hours-day')).count()) === 7 && (await txt(T('crew-hours-day'))) === 'Today0 h 00 m' && /On the clock/.test(await txt(T('crew-hours-session'))) && /7:04 am – now/.test(await txt(T('crew-hours-session'))));
  ok('My hours: a day sums its sessions; off-site, edited, auto-closed and added sessions say so' + full, await p.evaluate(() => {
    const days = [...document.querySelectorAll('[data-testid="crew-hours-day"]')].map(d => d.textContent);
    const sess = [...document.querySelectorAll('[data-testid="crew-hours-session"]')].map(d => d.textContent);
    return days[1] === 'Fri 10 Oct7 h 50 m' && days[6] === 'Thu 2 Oct7 h 45 m' && sess.some(t => /820 m off site/.test(t)) && sess.some(t => /Edited by Josh · Forgot to sign out, left at 2:30/.test(t)) && sess.some(t => /Closed automatically at 6:00 pm/.test(t)) && sess.some(t => /Added by Josh · Phone was flat/.test(t)) && sess.filter(t => /Patel exterior/.test(t)).length === 3;
  }) && (await txt(T('crew-hours-foot'))) === "Hours here are as you clocked them. Pay comes from your employer's timesheet.");
  ok('My hours: back row ≥ 44 px, no horizontal scroll' + full, (await box(T('crew-hours-back'))).height >= 44 && await noHScroll());
  await p.screenshot({ path: OUT + `c3-hours-${tag}.png` });
  await p.click(T('crew-hours-back')); await p.waitForTimeout(120);
  ok('back returns to Me' + full, await p.locator(T('crew-pane-me')).isVisible() && await p.locator(T('crew-tabbar')).isVisible());
  ok('every existing crew screen is reachable from the shell' + full, await p.evaluate(() => {
    const want = ['/employee/time-clock','/employee/daily-report','/employee/team-events','/employee/training','/employee/contracts','/employee/request-equipment','/employee/notifications','/employee/profile','/employee/feedback','/employee/my-validations','/employee/strike-system'];
    const have = new Set([...document.querySelectorAll('[data-go]')].map(e => e.dataset.go));
    return want.every(w => have.has(w));
  }));
  await p.screenshot({ path: OUT + `c1-me-${tag}.png` });
  await p.click(T('crew-me-signout')); await p.waitForTimeout(200);
  ok('Sign out returns to the sign-in screen with the password cleared' + full, await p.locator(T('crew-login')).isVisible() && (await p.locator(T('employee-login-password')).inputValue()) === '');

  // ---- deep links / empty states ----
  await p.goto(U + '?screen=app&tab=today&state=in&notifs=0&jobs=0'); await p.waitForTimeout(300);
  ok('empty states: no jobs → "No jobs assigned to you yet."; nothing unread → "You\'re up to date."; General on the clock; no badge' + full, await p.locator(T('crew-today-nojob')).isVisible() && await p.locator(T('crew-today-notifs-empty')).isVisible() && /Job: General/.test(await txt(T('crew-today-job'))) && !(await p.locator(T('crew-tab-inbox-badge')).isVisible()));
  await p.screenshot({ path: OUT + `c1-today-empty-${tag}.png` });
  await p.goto(U + '?screen=job&id=j2'); await p.waitForTimeout(300);
  ok('deep link: site-contact row with a tel: link when the job has one' + full, (await txt(T('crew-job-site-contact'))).includes('Priya Raman') && /Site contact · 0412 555 018/.test(await txt(T('crew-job-site-contact'))) && (await p.locator(T('crew-job-site-contact')).getAttribute('href')) === 'tel:0412555018' && (await box(T('crew-job-site-contact'))).height >= 44);
  ok('deep link: a coming-up job with no files shows "No files shared for this job." and no reports' + full, (await txt('#jobTitle')) === '2/88 Lygon St, Carlton' && (await txt('#jobAddr')) === 'Harrow Strata' && /No files shared for this job/.test(await txt(T('crew-job-files'))) && /No reports for this job yet/.test(await txt(T('crew-job-reports'))));
  await p.goto(U + '?error=restricted'); await p.waitForTimeout(200);
  ok('deep link: restricted error on login' + full, await p.locator(T('employee-login-error')).isVisible());
  // ---- C3 deep links ----
  await p.goto(U + '?screen=app&tab=today&state=in&offsite=1'); await p.waitForTimeout(300);
  ok('off-site sign-in: the card says how far and that the hours still count, in the owner\'s words' + full, await p.locator(T('crew-clock-offsite')).isVisible() && (await txt(T('crew-clock-offsite'))) === '820 m off siteFurther than 100 m from the job. Your hours still count; your employer sees the distance.' && /2 h 35 m on the clock/.test(await txt('#clockBig')));
  ok('off-site card still fits: content ends above the tab bar' + full, await p.evaluate(() => { const c = document.getElementById('clock').getBoundingClientRect(); const tab = document.querySelector('.tabbar').getBoundingClientRect().top; return c.bottom <= tab; }));
  await p.screenshot({ path: OUT + `c3-today-offsite-${tag}.png` });
  await p.goto(U + '?screen=app&tab=today&state=in&nogps=1'); await p.waitForTimeout(300);
  ok('sign-in without a position: one plain line, no off-site block' + full, await p.locator(T('crew-clock-nogps')).isVisible() && (await txt(T('crew-clock-nogps'))) === 'No location from this phone. Your employer sees this sign-in without a position.' && !(await p.locator(T('crew-clock-offsite')).isVisible()));
  await p.screenshot({ path: OUT + `c3-today-nogps-${tag}.png` });
  await p.goto(U + '?screen=app&tab=today&state=in&job=general'); await p.waitForTimeout(300);
  ok('signed in to General: the job row says General and opens nothing' + full, /Job: General/.test(await txt(T('crew-today-job'))) && !(await p.locator('#clockJobChev').isVisible()));
  await p.click(T('crew-today-job')); await p.waitForTimeout(100);
  ok('…tapping it stays on Today' + full, await p.locator(T('crew-pane-today')).isVisible() && !(await p.locator(T('crew-job')).isVisible()));
  await p.goto(U + '?screen=app&tab=today&jobs=0'); await p.waitForTimeout(300); await p.click(T('crew-today-clock-btn')); await p.waitForTimeout(80);
  ok('no jobs at all: Sign in skips the sheet and signs in to General' + full, !(await p.locator(T('crew-clock-picker')).isVisible()) && (await txt(T('crew-today-clock-btn'))) === 'Getting your location…');
  await p.waitForTimeout(700);
  ok('…signed in to General' + full, /Signed in/.test(await txt('#clockStatus')) && /Job: General/.test(await txt(T('crew-today-job'))));
  await p.goto(U + '?screen=hours&hours=0'); await p.waitForTimeout(300);
  ok('My hours empty state' + full, await p.locator(T('crew-hours-empty')).isVisible() && /No sign-ins yet/.test(await txt(T('crew-hours-empty'))));
  await p.goto(U + '?screen=hours'); await p.waitForTimeout(300);
  ok('My hours while signed out: no Today group, six days' + full, (await p.locator(T('crew-hours-day')).count()) === 6 && (await txt(T('crew-hours-day'))) === 'Fri 10 Oct7 h 50 m');
  await p.goto(U + '?screen=app&tab=today&picker=1'); await p.waitForTimeout(300);
  ok('deep link: the job sheet open over Today' + full, await p.locator(T('crew-clock-picker')).isVisible() && (await p.locator(T('crew-clock-pick')).count()) === 3);

  ok('no page errors' + full, errs.length === 0); if (errs.length) console.log(errs);
  await p.close();
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  await run(b, 390, 844, '390');
  await run(b, 360, 800, '360');
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
