// Pay and hours — Operating hours (Business page), the two reminder switches (Crew app page), the Overtime rate (employee page).
// Run: NODE_PATH=$(npm root -g) node tools/test_hours.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U1 = 'file://' + path.resolve('settings-pay-hours.html');
const U2 = 'file://' + path.resolve('employee-pay-rates.html');
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
    const txt = async (id) => (await p.locator(T(id)).innerText());

    // ---- Settings › Business › Operating hours ----
    await p.goto(U1 + '?page=business'); await p.waitForTimeout(500);
    ok(await p.locator(T('sec-hours')).isVisible() && (await p.locator(T('biz-hours-start')).inputValue()) === '07:00' && (await p.locator(T('biz-hours-end')).inputValue()) === '16:00', 'Operating hours section: 7:00 to 16:00 by default');
    ok((await p.locator(T('biz-hours-days') + ' .dchip.on').count()) === 5 && /9-hour day, Monday to Friday/.test(await txt('biz-hours-note')), 'Mon–Fri on; the note reads "A 9-hour day, Monday to Friday"');
    ok((await p.locator(T('sec-hours')).innerText()).includes('Timesheets gear keeps its own auto sign-out time'), 'the section says the auto sign-out stays in the Timesheets gear');
    await p.locator(T('biz-hours-end')).fill('17:00'); await p.locator(T('biz-hours-end')).dispatchEvent('input'); await p.waitForTimeout(200);
    ok(await p.locator(T('set-savebar')).evaluate(el => el.classList.contains('show')) && /10-hour day/.test(await txt('biz-hours-note')), 'changing the end raises the save bar and updates the note');
    await p.locator(T('biz-hours-end')).fill('06:00'); await p.locator(T('biz-hours-end')).dispatchEvent('input'); await p.waitForTimeout(150);
    ok(/must be after the start/.test(await txt('biz-hours-note')), 'an end before the start is refused with a note');
    await p.locator(T('set-save')).click(); await p.waitForTimeout(200);
    ok(/must be after the start/.test(await toast()), 'Save is blocked while the hours are wrong');
    await p.locator(T('biz-hours-end')).fill('17:00'); await p.locator(T('biz-hours-end')).dispatchEvent('input'); await p.waitForTimeout(100);
    await p.locator(T('biz-day-6')).click(); await p.waitForTimeout(150);
    ok((await p.locator('#biz-hours-days').inputValue()) === '1,2,3,4,5,6' && /Monday to Saturday/.test(await txt('biz-hours-note')), 'Saturday on → six days, the note follows');
    await p.locator(T('set-save')).click(); await p.waitForTimeout(250);
    ok(/Business saved/.test(await toast()) && !(await p.locator(T('set-savebar')).evaluate(el => el.classList.contains('show'))), 'Save → "Business saved", the bar goes');
    await p.locator(T('sec-hours')).scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(SHOTS, `hours-business-${W}.png`) });

    // ---- Settings › Crew app › the two reminder switches read the saved hours ----
    await p.locator(T('set-rail-crew')).click(); await p.waitForTimeout(300);
    ok((await p.locator(T('crew-notifications') + ' .sw').count()) === 7, 'seven push choices: the five from Round 79 plus the two reminders');
    ok(/At 7:00 am/.test(await txt('crew-notif-row-signin_reminder')) && /crew with a job that day/.test(await txt('crew-notif-row-signin_reminder')), 'sign-in reminder names the start time and who gets it');
    ok(/At 5:00 pm/.test(await txt('crew-notif-row-signout_reminder')) && /everyone still signed in/.test(await txt('crew-notif-row-signout_reminder')), 'sign-out reminder shows the saved end time (5:00 pm) and who gets it');
    ok((await p.locator(T('crew-notif-row-signout_reminder')).innerText()).includes('set in Settings › Business'), 'the rows point at the Business page for the time');
    await p.locator(T('crew-notif-signout_reminder')).click(); await p.waitForTimeout(200);
    ok((await p.locator(T('crew-notif-signout_reminder')).getAttribute('aria-checked')) === 'false' && /Notification choices saved/.test(await toast()), 'a reminder switch saves at once');
    await p.locator(T('sec-notifications')).scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(SHOTS, `hours-crew-${W}.png`) });
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'settings: no horizontal page scroll');

    // ---- Employee page › Pay rates with Overtime ----
    await p.goto(U2); await p.waitForTimeout(500);
    ok(await p.locator(T('sec-pay-rates')).isVisible() && (await p.locator(T('rate-hourly')).inputValue()) === '52.5' && (await p.locator(T('rate-daily')).inputValue()) === '' && (await p.locator(T('rate-overtime')).inputValue()) === '', 'Pay rates: Hourly 52.5, Daily blank, Overtime blank');
    ok(/leave it blank to pay overtime at the hourly rate/.test(await txt('rate-help')), 'the help line says blank = the hourly rate');
    ok(/\$2,205 labour/.test(await txt('week-labour')) && /4 h overtime × \$52\.50 \(the hourly rate/.test(await txt('week-rule')), 'This week: 38 h × 52.5 + 4 h × 52.5 = $2,205, the rule spelled out');
    await p.locator(T('rate-overtime')).fill('78.75'); await p.locator(T('rate-save')).click(); await p.waitForTimeout(250);
    ok(/Pay rates saved/.test(await toast()) && /overtime_rate/.test(await toast()) && /\$2,310 labour/.test(await txt('week-labour')), 'Overtime 78.75 saved → $2,310 (38 × 52.5 + 4 × 78.75)');
    await p.screenshot({ path: path.join(SHOTS, `employee-pay-${W}.png`) });
    await p.locator(T('emp-add')).click(); await p.waitForTimeout(300);
    ok(await p.locator(T('emp-add-drawer')).isVisible() && (await p.locator('[data-testid^="add-"][data-testid$="_rate"]').count()) === 0 && /set on their profile page/.test(await txt('add-pay-note')), 'Add employee opens on the right with no pay fields; a line points at the profile page');
    if (W === 1440) await p.screenshot({ path: path.join(SHOTS, `employee-pay-add-${W}.png`) });
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok(await p.locator(T('emp-add-drawer')).isHidden(), 'Escape closes it');
    await p.goto(U2 + '?daily=1'); await p.waitForTimeout(400);
    ok(await p.locator(T('rate-overtime')).isDisabled() && /not used with a daily rate/i.test(await txt('rate-help')) && /\$2,100 labour/.test(await txt('week-labour')), 'daily-rate employee: Overtime greyed with the note; 5 days × 420 = $2,100');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'employee: no horizontal page scroll');
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
