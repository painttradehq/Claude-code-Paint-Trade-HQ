// Settings › Billing — Playwright checks at 1440 then 1024, four states.
// Run: NODE_PATH=$(npm root -g) node tools/test_billing.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('settings-billing.html');
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

    // Account page → Manage billing opens the Billing page
    await p.goto(U + '?page=account'); await p.waitForTimeout(500);
    ok(await p.locator(T('account-subscription-row')).isVisible() && /Small business/.test(await txt('account-plan-title')) && /renews 14 Nov 2026/.test(await txt('account-plan-line')), 'Account › Subscription row shows the plan and its renewal');
    if (W === 1440) await p.screenshot({ path: path.join(SHOTS, `account-sub-${W}.png`) });
    await p.locator(T('account-manage-billing')).click(); await p.waitForTimeout(300);
    ok(await p.locator(T('set-page-billing')).isVisible() && await p.locator(T('set-page-account')).isHidden() && await p.locator(T('set-rail-billing')).evaluate(el => el.classList.contains('on')), '"Manage billing" opens the Billing page inside Settings; the rail follows');
    ok((await p.locator('#pageSub').innerText()).includes('Stripe'), 'the page line changes with the page');

    // Your plan
    ok((await txt('bl-plan-pill')).toUpperCase() === 'SMALL BUSINESS' && /\$179 a month/.test(await txt('bl-plan-title')) && /Active · renews 14 Nov 2026/.test(await txt('bl-plan-line')), 'Your plan: pill, price and renewal');
    ok(/2 of 2 included/.test(await txt('bl-seat-admins')) && /Within your plan/.test(await txt('bl-seat-admins')), 'admins 2 of 2 included');
    ok(/7 of 5 included/.test(await txt('bl-seat-emps')) && /2 extra seats · \$30 a month/.test(await txt('bl-seat-emps')), 'employees 7 of 5 → 2 extra seats at $15');
    ok(/\$209 on 14 Nov 2026/.test(await txt('bl-next-invoice')) && /Small business \$179 \+ seats \$30/.test(await txt('bl-next-invoice')), 'next invoice 179 + 30 = $209, explained');
    for (const id of ['bl-payment', 'bl-invoices', 'bl-cancel']) ok(await p.locator(T(id)).isVisible(), `action ${id} present`);
    await p.locator(T('bl-payment')).click(); await p.waitForTimeout(150);
    ok(/customer-portal/.test(await toast()), 'Payment method opens the Stripe portal');
    if (W === 1440) await p.screenshot({ path: path.join(SHOTS, `billing-${W}.png`) });

    // Plan cards
    ok((await p.locator(T('bl-cards') + ' .bl-card').count()) === 3, 'three plan cards');
    ok(await p.locator(T('bl-card-small')).evaluate(el => el.classList.contains('cur')) && /^your plan$/i.test(await p.locator(T('bl-card-small') + ' .rib').innerText()), 'Small business is highlighted as "Your plan"');
    ok(await p.locator(T('bl-switch-small')).isDisabled() && /Your plan/.test(await txt('bl-switch-small')), 'the current plan button is disabled');
    ok(/\$59/.test(await txt('bl-card-starter')) && /\$179/.test(await txt('bl-card-small')) && /\$249/.test(await txt('bl-card-enterprise')), 'prices 59 / 179 / 249');
    ok(/1 admin \+ 3 employees included/.test(await txt('bl-card-starter')) && /Extra admin \$25 · extra employee \$15/.test(await txt('bl-card-starter')) && /3 admins \+ 15 employees included/.test(await txt('bl-card-enterprise')) && /Extra admin \$42 · extra employee \$25/.test(await txt('bl-card-enterprise')), 'seats included and seat prices per card');
    ok(/Everything in Starter, plus/.test(await txt('bl-card-small')) && /Everything in Small business, plus/.test(await txt('bl-card-enterprise')) && /Includes/.test(await txt('bl-card-starter')), 'each card builds on the one before');
    const dE = await txt('bl-diff-enterprise');
    ok(/Switching adds:/.test(dE) && /Performance page/.test(dE) && /training per person/.test(dE) && /all of your 2 admins and 7 employees are included/.test(dE) && /\$249 a month/.test(dE), 'Enterprise card: what switching adds, seats all included, $249');
    const dS = await txt('bl-diff-starter');
    ok(/Switching drops:/.test(dS) && /Timesheets/.test(dS) && /Lucy/.test(dS) && /1 extra admin seat and 4 extra employee seats \(\$85 a month\)/.test(dS) && /\$144 a month/.test(dS), 'Starter card: what switching drops, 1 + 4 extra seats = $85, $144 a month');
    ok(/Your plan since 14 Aug 2026/.test(await txt('bl-diff-small')), 'current card says since when');
    await p.locator(T('sec-plans')).scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
    if (W === 1440) await p.screenshot({ path: path.join(SHOTS, `billing-cards-${W}.png`) });

    // Compare table + FAQ (before any switch)
    ok((await p.locator(T('bl-compare') + ' thead th').count()) === 4 && (await p.locator(T('bl-compare') + ' thead th.cur').innerText()).includes('Small business · yours'), 'compare table: four columns, the current one tinted');
    const tsRow = p.locator(T('bl-compare') + ' tbody tr', { hasText: 'Timesheets' });
    ok((await tsRow.locator('td.off').count()) === 1 && (await tsRow.locator('td svg').count()) === 2, 'Timesheets: off on Starter, on for the other two');
    ok((await p.locator(T('bl-compare') + ' tbody tr').count()) >= 24 && /1 hour per person/.test(await txt('bl-compare')) && /Quoted/.test(await txt('bl-compare')), 'the table carries seats, every feature, training and data migration');
    ok((await p.locator(T('bl-faq') + ' > div').count()) === 6 && /Tester program/.test(await txt('bl-faq')), 'six Good-to-know entries incl. the tester program');
    await p.locator(T('sec-compare')).scrollIntoViewIfNeeded(); await p.waitForTimeout(150);
    if (W === 1440) await p.screenshot({ path: path.join(SHOTS, `billing-compare-${W}.png`) });

    // Switch up → drawer → confirm
    await p.locator(T('bl-switch-enterprise')).click(); await p.waitForTimeout(300);
    ok(await p.locator(T('bl-drawer')).isVisible() && (await txt('bl-drawer-title')) === 'Switch to Enterprise' && /Starts today/.test(await p.locator('#blDSub').innerText()) && /\$249 a month/.test(await txt('bl-drawer-body')) && /What you gain/.test(await txt('bl-drawer-body')), 'Switch to Enterprise opens a right drawer: starts today, gains, $249');
    if (W === 1440) await p.screenshot({ path: path.join(SHOTS, `billing-drawer-${W}.png`) });
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    ok(await p.locator(T('bl-drawer')).isHidden(), 'Escape closes the drawer');
    await p.locator(T('bl-switch-enterprise')).click(); await p.waitForTimeout(200); await p.locator(T('bl-drawer-confirm')).click(); await p.waitForTimeout(300);
    ok((await txt('bl-plan-pill')).toUpperCase() === 'ENTERPRISE' && /\$249 a month/.test(await txt('bl-plan-title')) && /7 of 15 included/.test(await txt('bl-seat-emps')) && /\$249 on 14 Nov 2026/.test(await txt('bl-next-invoice')) && /Plan changed to Enterprise/.test(await toast()), 'confirm → Enterprise now: pill, seats 7 of 15, invoice $249');
    ok(await p.locator(T('bl-card-enterprise')).evaluate(el => el.classList.contains('cur')) && (await p.locator(T('bl-compare') + ' thead th.cur').innerText()).includes('Enterprise'), 'the highlight and the tinted column follow the plan');

    // Switch down → scheduled at renewal → keep
    await p.locator(T('bl-switch-starter')).click(); await p.waitForTimeout(300);
    ok((await txt('bl-drawer-title')) === 'Switch to Starter' && /Starts on 14 Nov 2026/.test(await p.locator('#blDSub').innerText()) && /switches off on 14 Nov 2026/i.test(await txt('bl-drawer-body')) && /\$144 a month from 14 Nov 2026/.test(await txt('bl-drawer-body')), 'Switch to Starter: starts at the renewal, what switches off, $144 from then');
    await p.locator(T('bl-drawer-confirm')).click(); await p.waitForTimeout(300);
    ok(/Switches to Starter on 14 Nov 2026/.test(await txt('bl-plan-line')) && await p.locator(T('bl-switch-starter')).isDisabled() && /Switching on 14 Nov/.test(await txt('bl-switch-starter')) && /\$144 on 14 Nov 2026/.test(await txt('bl-next-invoice')), 'downgrade is scheduled: status line, card button, next invoice $144');
    ok(await p.locator(T('bl-keep')).isVisible(), 'a "Keep Enterprise" action appears');
    await p.locator(T('bl-keep')).click(); await p.waitForTimeout(250);
    ok(/Active · renews 14 Nov 2026/.test(await txt('bl-plan-line')) && !(await p.locator(T('bl-switch-starter')).isDisabled()), 'Keep → back to active, Starter can be chosen again');
    ok(await p.locator(T('bl-plan-title')).evaluate(el => el.getBoundingClientRect().height < 30), 'the plan title sits on one line');

    // Cancel → resume
    await p.locator(T('bl-cancel')).click(); await p.waitForTimeout(300);
    ok((await txt('bl-drawer-title')) === 'Cancel your plan' && /locks until you choose a plan again/.test(await txt('bl-drawer-body')) && /files stay/.test(await txt('bl-drawer-body')), 'Cancel drawer says what happens and that the data stays');
    await p.locator(T('bl-drawer-confirm')).click(); await p.waitForTimeout(300);
    ok(/Cancels on 14 Nov 2026/.test(await txt('bl-plan-line')) && await p.locator(T('bl-resume')).isVisible() && (await p.locator(T('bl-cancel')).count()) === 0 && /None/.test(await txt('bl-next-invoice')), 'cancelled: status, Resume action, no next invoice');
    await p.locator(T('bl-resume')).click(); await p.waitForTimeout(250);
    ok(/Active · renews/.test(await txt('bl-plan-line')) && /Plan resumed/.test(await toast()), 'Resume → active again');
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll (active)');
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(100);
    if (W === 1024) { await p.screenshot({ path: path.join(SHOTS, `billing-${W}.png`) }); await p.locator(T('sec-plans')).scrollIntoViewIfNeeded(); await p.waitForTimeout(150); await p.screenshot({ path: path.join(SHOTS, `billing-cards-${W}.png`) }); await p.evaluate(() => window.scrollTo(0, 0)); }

    // Trial
    await p.goto(U + '?page=billing&state=trial'); await p.waitForTimeout(400);
    ok((await txt('bl-plan-pill')).toUpperCase() === 'FREE TRIAL' && /Enterprise · free trial/.test(await txt('bl-plan-title')) && /9 days left · ends 30 Oct 2026/.test(await txt('bl-plan-line')), 'trial: pill, plan, days left');
    ok(await p.locator(T('bl-add-card')).isVisible() && (await p.locator(T('bl-cancel')).count()) === 0 && /Add a card to continue after 30 Oct 2026/.test(await txt('bl-next-invoice')), 'trial: Add a card, no Cancel, next invoice explains');
    ok(/Choose Starter/.test(await txt('bl-switch-starter')) && /Choose Enterprise/.test(await txt('bl-switch-enterprise')) && /^trialling$/i.test(await p.locator(T('bl-card-enterprise') + ' .rib').innerText()), 'trial: every card is a choice, the trialled one marked');
    await p.locator(T('bl-switch-starter')).click(); await p.waitForTimeout(150);
    ok(/checkout/.test(await toast()), 'choosing a plan on trial goes to Stripe checkout');
    if (W === 1440) await p.screenshot({ path: path.join(SHOTS, `billing-trial-${W}.png`) });

    // Tester
    await p.goto(U + '?page=billing&state=tester'); await p.waitForTimeout(400);
    ok((await txt('bl-plan-pill')).toUpperCase() === 'TESTER PROGRAM' && /Full access · tester program/.test(await txt('bl-plan-title')) && /Free until 31 Dec 2026 · no billing/.test(await txt('bl-plan-line')), 'tester: full access, free until, no billing');
    ok((await p.locator(T('bl-plan-card') + ' .acts button').count()) === 0 && /None/.test(await txt('bl-next-invoice')) && /No seat limits/.test(await txt('bl-seat-admins')), 'tester: no actions, no invoice, no seat limits');
    ok(await p.locator(T('bl-switch-starter')).isDisabled() && await p.locator(T('bl-switch-enterprise')).isDisabled() && /Available when your tester access ends/.test(await txt('bl-diff-small')) && (await p.locator(T('bl-cards') + ' .bl-card.cur').count()) === 0, 'tester: plans shown but not choosable yet, none highlighted');
    if (W === 1440) await p.screenshot({ path: path.join(SHOTS, `billing-tester-${W}.png`) });

    // Past due
    await p.goto(U + '?page=billing&state=past_due'); await p.waitForTimeout(400);
    ok(/Payment failed · update your card by 28 Oct 2026/.test(await txt('bl-plan-line')) && /Update card/.test(await txt('bl-payment')) && (await p.locator(T('bl-cancel')).count()) === 0, 'past due: warning line and Update card');
    ok(await p.locator(T('bl-plan-line')).evaluate(el => el.classList.contains('bad')), 'the past-due line is red');

    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal page scroll');
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.slice(0, 2).join(' | ') : ''}`);
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})();
