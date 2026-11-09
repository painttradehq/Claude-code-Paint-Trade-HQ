const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/account-alerts.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(800);

  // 1. placement: Account page, Alerts between Profile and Team admins
  const order = await p.$$eval('section.sec', els => els.map(e => e.dataset.testid));
  ok('Alerts sits between Profile and Team admins on the Account page', order.join(',') === 'sec-profile,sec-alerts,sec-team,sec-security,sec-your-data');
  ok('the section is marked "Saves at once"', /Saves at once/i.test(await p.locator(T('sec-alerts') + ' .pill').first().textContent()));

  // 2. this device: off → the browser asks → on, with Send a test
  ok('the device switch starts off', (await p.locator(T('alerts-device')).getAttribute('aria-checked')) === 'false' && /Off/.test(await p.locator(T('alerts-device-status')).textContent()));
  ok('one other device is listed before this one is turned on', (await p.locator(T('alerts-device-row')).count()) === 1);
  await p.screenshot({ path: OUT + 'r92-account-1440.png', fullPage: false });
  await p.click(T('alerts-device')); await p.waitForTimeout(150);
  ok('turning on asks the browser first', await p.locator(T('perm-prompt')).isVisible());
  await p.screenshot({ path: OUT + 'r92-perm-1440.png' });
  await p.click(T('perm-allow')); await p.waitForTimeout(200);
  ok('Allow turns the switch on and names this device', (await p.locator(T('alerts-device')).getAttribute('aria-checked')) === 'true' && /On · Chrome on Windows/.test(await p.locator(T('alerts-device-status')).textContent()));
  ok('Send a test appears once alerts are on', await p.locator(T('alerts-test')).isVisible());
  ok('this device joins the list, marked', (await p.locator(T('alerts-device-row')).count()) === 2 && (await p.locator(T('alerts-device-row') + ' .this').count()) === 1);
  await p.click(T('alerts-test')); await p.waitForTimeout(350);
  ok('Send a test shows the alert as the system would', await p.locator(T('os-notification')).isVisible() && /Alerts are on/.test(await p.locator(T('os-notification')).textContent()));
  await p.screenshot({ path: OUT + 'r92-on-1440.png' });
  await p.waitForTimeout(3200);

  // 3. removing another device
  await p.click(T('alerts-remove-d2')); await p.waitForTimeout(150);
  ok('Remove asks first', await p.locator(T('modal')).isVisible());
  await p.click(T('modal-ok')); await p.waitForTimeout(150);
  ok('the removed device leaves the list', (await p.locator(T('alerts-device-row')).count()) === 1);

  // 4. what buzzes
  const rows = await p.locator('[data-testid^="alert-ev-row-"]').count();
  ok('twelve events in four groups (Clients, Crew, You, Platform)', rows === 12 && (await p.locator(T('alerts-events') + ' .gh').allTextContents()).map(t => t.replace(/Josh only/i, '').trim()).join(',') === 'Clients,Crew,You,Platform');
  ok('Quote opened is the one switch off by default', (await p.locator(T('alert-ev-quote_opened')).getAttribute('aria-checked')) === 'false' && (await p.locator('[data-testid^="alert-ev-"][role="switch"][aria-checked="true"]').count()) === 11);
  await p.click(T('alert-ev-quote_answered')); await p.waitForTimeout(150);
  ok('a switch flips at once and the row dims', (await p.locator(T('alert-ev-quote_answered')).getAttribute('aria-checked')) === 'false' && (await p.locator(T('alert-ev-row-quote_answered')).getAttribute('class')).includes('dim') && /Quote answered: off/.test(await p.locator('#toast').textContent()));
  await p.click(T('alert-ev-quote_answered'));
  ok('the Platform group is tagged for Josh', /Josh only/i.test(await p.locator(T('alerts-events') + ' .gh').last().textContent()));
  await p.screenshot({ path: OUT + 'r92-events-1440.png', fullPage: true });

  // 5. turning this device off
  await p.click(T('alerts-device')); await p.waitForTimeout(150);
  ok('off again: no Send a test, status reads Off, the other list is empty', !(await p.locator(T('alerts-test')).count()) && /Off/.test(await p.locator(T('alerts-device-status')).textContent()) && await p.locator(T('alerts-no-devices')).isVisible());

  // 6. the other states (prototype switcher)
  await p.click(T('proto-state-ios-safari')); await p.waitForTimeout(150);
  ok('iPhone in Safari: the three Home Screen steps, the switch disabled', await p.locator(T('alerts-ios-steps')).isVisible() && await p.locator(T('alerts-device')).isDisabled());
  await p.screenshot({ path: OUT + 'r92-ios-1440.png' });
  await p.click(T('proto-state-ios-app')); await p.click(T('alerts-device')); await p.click(T('perm-allow')); await p.waitForTimeout(150);
  ok('iPhone installed app: turns on like the desktop', /On · iPhone/.test(await p.locator(T('alerts-device-status')).textContent()));
  await p.click(T('proto-state-blocked')); await p.waitForTimeout(150);
  ok('blocked: the how-to-unblock line, the switch disabled', await p.locator(T('alerts-blocked')).isVisible() && await p.locator(T('alerts-device')).isDisabled());
  await p.screenshot({ path: OUT + 'r92-blocked-1440.png' });
  await p.click(T('proto-state-desktop')); await p.click(T('alerts-device')); await p.click(T('perm-block')); await p.waitForTimeout(150);
  ok('Block in the browser prompt lands in the blocked state', await p.locator(T('alerts-blocked')).isVisible());
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 7. 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(600);
  ok('1024: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const card = await p.locator(T('alerts-card')).boundingBox(); const content = await p.locator(T('set-page-account')).boundingBox();
  ok('1024: the rail is a tab strip and the card keeps a usable width inside the content column', card && content && card.x + card.width <= content.x + content.width + 1 && card.width >= 420 && (await p.locator(T('set-rail')).boundingBox()).height < 60);
  if (!(card && card.width >= 420)) console.log('card', card, 'content', content);
  await p.locator(T('sec-alerts')).scrollIntoViewIfNeeded(); await p.screenshot({ path: OUT + 'r92-account-1024.png' });
  await p.click(T('alerts-device')); await p.click(T('perm-allow')); await p.waitForTimeout(150);
  ok('1024: the on state fits (Send a test on one line with its note or wrapped, no overflow)', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth) && await p.locator(T('alerts-test')).isVisible());
  await p.screenshot({ path: OUT + 'r92-on-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
