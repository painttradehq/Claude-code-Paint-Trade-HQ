// Follow-up C — the two sign-in footers. Crew sign-in (c1-crew-shell.html) at 390 × 844 and 360 × 800; admin sign-in mock at 390, 360 and 1280 × 800.
const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
const CREW = 'file:///home/user/Claude-code-Paint-Trade-HQ/c1-crew-shell.html';
const ADMIN = 'file:///home/user/Claude-code-Paint-Trade-HQ/followup-c-admin-signin.html';
const OUT = (process.argv[2] || '/tmp/fc-shots') + '/';
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H, tag, mobile] of [[390, 844, '390', true], [360, 800, '360', true], [1280, 800, '1280', false]]) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    const txt = async (sel) => (await p.locator(sel).first().textContent() || '').trim();
    const box = (sel) => p.locator(sel).first().boundingBox();
    const noH = () => p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
    if (mobile) {
      await p.goto(CREW); await p.waitForTimeout(300);
      const l = p.locator(T('crew-login-admin-link'));
      ok(`crew sign-in: "Business owner? Sign in at /admin" links to /admin [${tag}]`, await l.isVisible() && (await l.getAttribute('href')) === '/admin' && (await txt(T('crew-login-admin-link'))) === 'Sign in at /admin' && /Business owner\?/.test(await p.locator('.login-foot').nth(1).textContent()));
      ok(`crew sign-in: still fits without scrolling; the link is under the QR line and above Privacy · Terms [${tag}]`, await p.evaluate(() => { const s = document.getElementById('s-login'); return s.scrollHeight <= s.clientHeight + 1; }) && (await box(T('crew-login-admin-link'))).y > (await box('.login-foot')).y && (await box(T('crew-login-admin-link'))).y < (await box(T('crew-login-privacy'))).y);
      ok(`crew sign-in: no horizontal scroll [${tag}]`, await noH());
      await p.screenshot({ path: OUT + `fc-crew-${tag}.png` });
    }
    await p.goto(ADMIN); await p.waitForTimeout(300);
    const a = p.locator(T('login-crew-link'));
    ok(`admin sign-in: "Crew member? Sign in at /crew" under "New here?", links to /crew [${tag}]`, await a.isVisible() && (await a.getAttribute('href')) === '/crew' && (await txt(T('login-crew-link'))) === 'Sign in at /crew' && (await box(T('login-crew-link'))).y > (await box(T('login-signup-link'))).y);
    ok(`admin sign-in: hero ${mobile ? 'hidden' : 'shown'} at this width, card whole on screen [${tag}]`, (await p.locator(T('admin-login-hero')).isVisible()) === !mobile && (await box(T('admin-login-card'))).y + (await box(T('admin-login-card'))).height <= H + 1 && await noH());
    await p.screenshot({ path: OUT + `fc-admin-${tag}.png` });
    ok(`no page errors [${tag}]`, errs.length === 0);
    await p.close();
  }
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
