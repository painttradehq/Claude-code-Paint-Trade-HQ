const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/settings-connections.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(800);

  const rail = (await p.$$eval(T('set-rail') + ' button', els => els.map(e => e.textContent.trim().replace(/JOSH ONLY/, '').trim()))).join(',');
  ok('the rail: Business, Suppliers, Connections, Crew app · Account, Alerts · Billing · Platform, with group labels', rail === 'Business,Suppliers,Connections,Crew app,Account,Alerts,Billing,Platform' && (await p.$$eval(T('set-rail') + ' .gl', els => els.map(e => e.textContent))).join('|') === 'Your business|You|Plan|Paint Trade HQ');
  ok('Connections is the page; its two sections are Files & storage then Accounting, as they were on Business', await p.locator(T('set-page-connections')).isVisible() && (await p.$$eval('section.sec', els => els.map(e => e.dataset.testid))).join(',') === 'sec-storage,sec-accounting');
  ok('the storage options are the same three, the built-in cloud in use', (await p.locator('[data-testid^="storage-mode-"]').count()) === 3 && (await p.locator(T('storage-mode-builtin')).getAttribute('aria-checked')) === 'true' && /In use/.test(await p.locator(T('storage-mode-builtin')).textContent()));
  ok('the accounting rows are Xero and MYOB with their Connect buttons', await p.locator(T('acct-xero')).isVisible() && await p.locator(T('acct-myob')).isVisible() && await p.locator(T('xero-connect-btn')).isVisible() && await p.locator(T('myob-connect-btn')).isVisible());
  await p.screenshot({ path: OUT + 'r94-connections-1440.png', fullPage: true });
  await p.click(T('storage-mode-drive')); await p.waitForTimeout(150);
  ok('picking the connected Drive switches the place in use', (await p.locator(T('storage-mode-drive')).getAttribute('aria-checked')) === 'true' && (await p.locator(T('storage-mode-builtin')).getAttribute('aria-checked')) === 'false' && /Not in use — existing files stay here/.test(await p.locator(T('storage-mode-builtin')).textContent()));
  await p.click(T('storage-mode-onedrive')); await p.waitForTimeout(150);
  ok('an unconnected cloud cannot be picked', (await p.locator(T('storage-mode-onedrive')).getAttribute('aria-checked')) === 'false' && /Connect OneDrive first/.test(await p.locator('#toast').textContent()));
  ok('the pointer to the calendar and messaging connections sits at the foot', /calendar/.test(await p.locator(T('connections-also')).textContent()) && /Messages setup/.test(await p.locator(T('connections-also')).textContent()));
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(600);
  ok('1024: no horizontal scroll; the rail is a wrapping tab strip without group labels', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth) && (await p.locator(T('set-rail')).boundingBox()).height < 100 && !(await p.locator(T('set-rail') + ' .gl').first().isVisible()));
  await p.screenshot({ path: OUT + 'r94-connections-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
