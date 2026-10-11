// C1 crew shell prototype (v2: Today · Jobs · Inbox · Learn · Me + Job screen) — Playwright checks at 390 × 844 then 360 × 800.
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
  ok('clock card: signed out state' + full, /Signed out/.test(await txt('#clockStatus')) && /Not on the clock/.test(await txt('#clockBig')) && (await txt(T('crew-today-job'))) === 'No job yet' && (await txt(T('crew-today-clock-btn'))) === 'Sign in');
  ok("today's job card: the in-progress job, address, who else is on it, access line" + full, /Nguyen/.test(await txt(T('crew-today-jobcard'))) && /14 Wattle St, Brunswick/.test(await txt(T('crew-today-jobcard'))) && /Tom with you/.test(await txt(T('crew-today-jobcard'))) && /Key under the pot plant/.test(await txt(T('crew-today-jobcard'))));
  ok('unread: heading count, three rows on Today, badge on the Inbox tab' + full, (await txt('#notifHead')) === 'Unread · 3' && (await p.locator('#notifList ' + T('crew-notif-row')).count()) === 3 && (await txt(T('crew-tab-inbox-badge'))) === '3');
  ok('notification rows are at least 44 px tall' + full, (await box(T('crew-notif-row'))).height >= 44);
  await p.screenshot({ path: OUT + `c1-today-out-${tag}.png` });
  await p.click(T('crew-today-clock-btn')); await p.waitForTimeout(150);
  ok('clock card: signed in shows time on the clock, since, the job, Sign out' + full, /Signed in/.test(await txt('#clockStatus')) && /2 h 35 m on the clock/.test(await txt('#clockBig')) && /Since 7:04 am today/.test(await txt('#clockLine')) && /Job: Wattle St repaint/.test(await txt(T('crew-today-job'))) && (await txt(T('crew-today-clock-btn'))) === 'Sign out');
  await p.screenshot({ path: OUT + `c1-today-in-${tag}.png` });
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
