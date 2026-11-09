const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/settings-alerts.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(800);

  // 1. its own Settings page
  ok('Alerts is its own rail page, between Account and Billing', (await p.$$eval(T('set-rail') + ' button', els => els.map(e => e.textContent.trim().replace(/JOSH ONLY/, '').trim()))).join(',') === 'Business,Crew app,Account,Alerts,Billing,Platform' && await p.locator(T('set-page-alerts')).isVisible());
  ok('the hero reads off, with one big Turn on button and the preview of a real alert', /off on this computer/.test(await p.locator(T('alerts-device-status')).textContent()) && /Turn on alerts/.test(await p.locator(T('alerts-device')).textContent()) && /Jo Okafor accepted Q-0142/.test(await p.locator(T('alerts-preview')).textContent()));
  ok('the devices strip lists the other device as a pill', (await p.locator(T('alerts-device-row')).count()) === 1 && /iPhone app/.test(await p.locator(T('alerts-devices')).textContent()));
  await p.screenshot({ path: OUT + 'r92-page-1440.png' });

  // 2. turning on
  await p.click(T('alerts-device')); await p.waitForTimeout(150);
  ok('turning on asks the browser first', await p.locator(T('perm-prompt')).isVisible());
  await p.click(T('perm-allow')); await p.waitForTimeout(200);
  ok('Allow: the hero turns green, names the device, offers Send a test and Turn off', /Alerts are on · Chrome on Windows/.test(await p.locator(T('alerts-device-status')).textContent()) && await p.locator(T('alerts-test')).isVisible() && /Turn off/.test(await p.locator(T('alerts-device')).textContent()));
  ok('this device joins the pills, marked', (await p.locator(T('alerts-device-row')).count()) === 2 && (await p.locator(T('alerts-device-row') + ' .this').count()) === 1);
  await p.click(T('alerts-test')); await p.waitForTimeout(350);
  ok('Send a test shows the alert as the system would', await p.locator(T('os-notification')).isVisible() && /Alerts are on/.test(await p.locator(T('os-notification')).textContent()));
  await p.screenshot({ path: OUT + 'r92-on-1440.png' });
  await p.waitForTimeout(3200);
  await p.click(T('alerts-remove-d2')); await p.waitForTimeout(150);
  ok('removing another device asks first', await p.locator(T('modal')).isVisible());
  await p.click(T('modal-ok')); await p.waitForTimeout(150);
  ok('the removed device leaves the strip', (await p.locator(T('alerts-device-row')).count()) === 1);
  ok('the phone steps are one click away (iPhone and Android)', (await p.locator(T('alerts-phone-steps')).count()) === 1 && /Add to Home Screen/.test(await p.locator(T('alerts-phone-steps')).textContent()) && /Android/.test(await p.locator(T('alerts-phone-steps')).textContent()));

  // 3. what buzzes: three group cards, a sample under each title
  ok('three group cards: Clients, Crew, You', (await p.locator('[data-testid^="alerts-group-"]').count()) === 3 && (await p.locator('[data-testid^="alert-ev-row-"]').count()) === 12);
  ok('each row carries a sample alert, not a description', (await p.locator(T('alert-ev-row-invoice_paid') + ' .ex').textContent()).includes('Priya Nair paid INV-0088'));
  ok('"11 of 12 on": Quote opened is the one off by default', (await p.locator(T('alerts-count')).textContent()) === '11 of 12 on' && (await p.locator(T('alert-ev-quote_opened')).getAttribute('aria-checked')) === 'false');
  await p.click(T('alert-ev-quote_answered')); await p.waitForTimeout(150);
  ok('a switch flips at once, the row dims and the counts follow', (await p.locator(T('alert-ev-quote_answered')).getAttribute('aria-checked')) === 'false' && (await p.locator(T('alert-ev-row-quote_answered')).getAttribute('class')).includes('off') && (await p.locator(T('alerts-count')).textContent()) === '10 of 12 on' && /3 of 5 on/.test(await p.locator(T('alerts-group-clients') + ' .n').textContent()));
  await p.click(T('alert-ev-quote_answered'));
  ok('Tester feedback is tagged Josh only', /Josh only/.test(await p.locator(T('alert-ev-row-tester_feedback')).textContent()));
  await p.screenshot({ path: OUT + 'r92-events-1440.png', fullPage: true });

  // 4. off again, the other states
  await p.click(T('alerts-device')); await p.waitForTimeout(150);
  ok('Turn off: back to off, no Send a test, the strip says no device yet', /off on this computer/.test(await p.locator(T('alerts-device-status')).textContent()) && !(await p.locator(T('alerts-test')).count()) && await p.locator(T('alerts-no-devices')).isVisible());
  await p.click(T('proto-state-ios-safari')); await p.waitForTimeout(150);
  ok('iPhone in Safari: the three steps replace the button', await p.locator(T('alerts-ios-steps')).isVisible() && !(await p.locator(T('alerts-device')).count()));
  await p.screenshot({ path: OUT + 'r92-ios-1440.png' });
  await p.click(T('proto-state-ios-app')); await p.click(T('alerts-device')); await p.click(T('perm-allow')); await p.waitForTimeout(150);
  ok('iPhone installed app: turns on like the desktop', /Alerts are on · iPhone app/.test(await p.locator(T('alerts-device-status')).textContent()));
  await p.click(T('proto-state-blocked')); await p.waitForTimeout(150);
  ok('blocked: the red state, the button disabled, the how-to-unblock line', /blocked in this browser/.test(await p.locator(T('alerts-device-status')).textContent()) && await p.locator(T('alerts-device')).isDisabled() && await p.locator(T('alerts-blocked')).isVisible());
  await p.screenshot({ path: OUT + 'r92-blocked-1440.png' });
  await p.click(T('proto-state-desktop')); await p.click(T('alerts-device')); await p.click(T('perm-block')); await p.waitForTimeout(150);
  ok('Block in the browser prompt lands in the blocked state', await p.locator(T('alerts-blocked')).isVisible());
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 5. 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(600);
  ok('1024: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const hero = await p.locator(T('alerts-card')).boundingBox(); const content = await p.locator(T('set-page-alerts')).boundingBox();
  ok('1024: the rail is a tab strip; the hero spans the content; the groups fall to two columns', (await p.locator(T('set-rail')).boundingBox()).height < 60 && hero && content && Math.abs(hero.width - content.width) < 2 && (await p.$$eval('[data-testid^="alerts-group-"]', els => new Set(els.map(e => Math.round(e.getBoundingClientRect().x))).size)) === 2);
  await p.screenshot({ path: OUT + 'r92-page-1024.png' });
  await p.click(T('alerts-device')); await p.click(T('perm-allow')); await p.waitForTimeout(150);
  ok('1024: the on state fits', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth) && await p.locator(T('alerts-test')).isVisible());
  await p.screenshot({ path: OUT + 'r92-on-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
