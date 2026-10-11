// C1 crew shell prototype — Playwright checks at 390 × 844 (iPhone-class) then 360 × 800 (Android-class).
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
  ok('tab bar sits on the bottom edge, five tabs' + full, Math.abs(tb.y + tb.height - H) < 1 && (await p.locator('.tab').count()) === 5);
  const tabB = await box(T('crew-tab-jobs'));
  ok('tabs are at least 44 px tall' + full, tabB.height >= 44);
  ok('clock card: signed out state' + full, /Signed out/.test(await txt('#clockStatus')) && /Not on the clock/.test(await txt('#clockBig')) && (await txt(T('crew-today-job'))) === 'No job yet' && (await txt(T('crew-today-clock-btn'))) === 'Sign in');
  ok('unread: heading count, three rows, badge on the Today tab' + full, (await txt('#notifHead')) === 'Unread · 3' && (await p.locator(T('crew-notif-row')).count()) === 3 && (await txt(T('crew-tab-today-badge'))) === '3');
  const rowB = await box(T('crew-notif-row'));
  ok('notification rows are at least 44 px tall' + full, rowB.height >= 44);
  await p.screenshot({ path: OUT + `c1-today-out-${tag}.png` });
  await p.click(T('crew-today-clock-btn')); await p.waitForTimeout(150);
  ok('clock card: signed in state shows time on the clock, since, job, Sign out' + full, /Signed in/.test(await txt('#clockStatus')) && /2 h 35 m on the clock/.test(await txt('#clockBig')) && /Since 7:04 am today/.test(await txt('#clockLine')) && /Job: General/.test(await txt(T('crew-today-job'))) && (await txt(T('crew-today-clock-btn'))) === 'Sign out');
  await p.screenshot({ path: OUT + `c1-today-in-${tag}.png` });
  await p.locator(T('crew-notif-row')).first().click(); await p.waitForTimeout(150);
  ok('tapping a notification marks it read and records its link' + full, (await txt('#notifHead')) === 'Unread · 2' && (await txt(T('crew-tab-today-badge'))) === '2' && (await p.locator(T('crew-notif-row') + '.read').count()) === 1 && (await p.evaluate(() => document.body.dataset.lastGo)) === '/employee/contracts');
  ok('Daily report shortcut opens the existing screen' + full, (await p.locator(T('crew-today-report')).getAttribute('data-go')) === '/employee/daily-report');
  ok('Today: content ends above the tab bar' + full, await p.evaluate(() => { const b = document.querySelector('#t-today .body'); b.scrollTop = b.scrollHeight; const last = b.lastElementChild.getBoundingClientRect().bottom; const tab = document.querySelector('.tabbar').getBoundingClientRect().top; return last <= tab; }));
  ok('no horizontal scroll' + full, await noHScroll());

  // ---- hub tabs ----
  await p.click(T('crew-tab-jobs')); await p.waitForTimeout(120);
  ok('Jobs: two rows (Daily report, Time clock)' + full, await p.locator(T('crew-pane-jobs')).isVisible() && (await p.locator('#jobsList .row').count()) === 2 && (await p.locator(T('crew-jobs-clock')).getAttribute('data-go')) === '/employee/time-clock');
  await p.screenshot({ path: OUT + `c1-jobs-${tag}.png` });
  await p.click(T('crew-tab-docs')); await p.waitForTimeout(120);
  ok('Docs: Contracts (1 to sign), Profile, Equipment' + full, (await p.locator('#docsList .row').count()) === 3 && (await txt(T('crew-docs-contracts') + ' .count')) === '1' && (await p.locator(T('crew-docs-equipment')).getAttribute('data-go')) === '/employee/request-equipment');
  await p.screenshot({ path: OUT + `c1-docs-${tag}.png` });
  await p.click(T('crew-tab-learn')); await p.waitForTimeout(120);
  ok('Learn: Training, Coaching (route strike-system), How I\'m going' + full, (await p.locator('#learnList .row').count()) === 3 && (await p.locator(T('crew-learn-coaching')).getAttribute('data-go')) === '/employee/strike-system' && !/strike/i.test(await txt('#t-learn')));
  await p.screenshot({ path: OUT + `c1-learn-${tag}.png` });
  await p.click(T('crew-tab-more')); await p.waitForTimeout(120);
  ok('More: me card, Team events, Feedback, Notifications, Sign out' + full, await p.locator(T('crew-more-me')).isVisible() && (await p.locator('#moreList .row').count()) === 3 && await p.locator(T('crew-more-signout')).isVisible());
  ok('every crew screen is reachable from the shell' + full, await p.evaluate(() => {
    const want = ['/employee/time-clock','/employee/daily-report','/employee/team-events','/employee/training','/employee/contracts','/employee/request-equipment','/employee/notifications','/employee/profile','/employee/feedback','/employee/my-validations','/employee/strike-system'];
    const have = new Set([...document.querySelectorAll('[data-go]')].map(e => e.dataset.go));
    return want.every(w => have.has(w));
  }));
  await p.screenshot({ path: OUT + `c1-more-${tag}.png` });
  await p.click(T('crew-more-signout')); await p.waitForTimeout(200);
  ok('Sign out returns to the sign-in screen with the password cleared' + full, await p.locator(T('crew-login')).isVisible() && (await p.locator(T('employee-login-password')).inputValue()) === '');

  // ---- deep links ----
  await p.goto(U + '?screen=app&tab=today&state=in&notifs=0'); await p.waitForTimeout(300);
  ok('deep link: signed in, no unread → "Messages" + "You\'re up to date.", no badge' + full, (await txt('#notifHead')) === 'Messages' && await p.locator(T('crew-today-notifs-empty')).isVisible() && !(await p.locator(T('crew-tab-today-badge')).isVisible()));
  await p.screenshot({ path: OUT + `c1-today-empty-${tag}.png` });
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
