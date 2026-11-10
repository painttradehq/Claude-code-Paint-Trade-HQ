const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/connect-ai.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(800);

  ok('view 1: the AI assistants section on Connections with two connections and the can / cannot lists', await p.locator(T('sec-ai')).isVisible() && (await p.locator('[data-testid^="ai-conn-"]').count()) === 2 && /can never do/.test(await p.locator(T('sec-ai')).textContent()));
  await p.screenshot({ path: OUT + 'x-connect-ai-settings.png', fullPage: true });
  await p.click(T('ai-connect')); await p.waitForTimeout(150);
  ok('Connect opens the three steps with the server address and Copy', await p.locator(T('modal')).isVisible() && (await p.locator(T('ai-url')).textContent()) === 'https://painttradehq.co/api/mcp' && /Add custom connector/.test(await p.locator(T('modal')).textContent()));
  await p.screenshot({ path: OUT + 'x-connect-ai-dialog.png' });
  await p.click(T('modal-close'));
  await p.click(T('ai-revoke-c2')); await p.click(T('modal-ok')); await p.waitForTimeout(150);
  ok('Revoke asks, then removes the connection', (await p.locator('[data-testid^="ai-conn-"]').count()) === 1);

  await p.click(T('view-consent')); await p.waitForTimeout(150);
  ok('view 2: the consent screen names the business and the person, Read ticked and locked, Drafts optional, and what it never does', await p.locator(T('consent')).isVisible() && await p.locator(T('scope-read')).isChecked() && await p.locator(T('scope-read')).isDisabled() && !(await p.locator(T('scope-drafts')).isChecked()) && /will never/.test(await p.locator(T('consent')).textContent()));
  await p.screenshot({ path: OUT + 'x-connect-ai-consent.png' });
  await p.click(T('scope-drafts')); await p.click(T('consent-allow')); await p.waitForTimeout(150);
  ok('Allow with drafts ticked reports read + drafts', /read \+ drafts/.test(await p.locator('#toast').textContent()));

  await p.click(T('view-chat')); await p.waitForTimeout(150);
  ok('view 3: inside Claude — the tools used, the answer, and the permission prompt for a draft', await p.locator(T('chat')).isVisible() && /money_owed/.test(await p.locator(T('chat')).textContent()) && await p.locator(T('chat-perm')).isVisible());
  await p.screenshot({ path: OUT + 'x-connect-ai-chat.png' });
  await p.click(T('chat-allow')); await p.waitForTimeout(100);
  ok('allowing the draft leaves it in the Inbox as not sent', /Draft · not sent/.test(await p.locator(T('chat-perm')).textContent()));
  ok('no console errors', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(500);
  ok('1024: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
