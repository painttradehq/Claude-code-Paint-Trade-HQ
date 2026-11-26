// Lucy does the work — confirm first; a bigger panel; one chat (testers report to Lucy). Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_lucy_operator.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('lucy-operator.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H] of [[1440, 900], [1024, 768]]) {
    console.log(`\n== ${W} × ${H} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_/.test(m.text())) errs.push(m.text()); });
    const say = async (t) => { await p.fill('#tcInput', t); await p.keyboard.press('Enter'); await p.waitForTimeout(1000); };
    const last = () => p.locator('[data-testid="lucy-act"]').last();
    const fresh = async () => { await p.goto(U); await p.waitForTimeout(400); await p.click('#tcBubble'); await p.waitForTimeout(300); };
    const inView = async (loc) => { const r = await loc.boundingBox(); return r && r.x >= 0 && r.y >= 0 && r.x + r.width <= W + 1 && r.y + r.height <= H + 1; };

    // ---- size: a panel down the right, full height, wider on demand
    await fresh();
    let box = await p.locator('#tc').boundingBox();
    ok(box.height >= H - 40 && box.width === (W >= 1181 ? 560 : 480) && Math.abs(box.x + box.width - (W - 16)) <= 1, `Lucy is a right-hand panel, full height (${Math.round(box.width)} × ${Math.round(box.height)})`);
    await p.click('[data-testid="tc-wide"]'); await p.waitForTimeout(150);
    let wide = await p.locator('#tc').boundingBox();
    ok(wide.width === (W >= 1181 ? 760 : 640) && await p.getAttribute('[data-testid="tc-wide"]', 'aria-pressed') === 'true', `the wider button widens her (${Math.round(wide.width)} px)`);
    await p.click('[data-testid="tc-wide"]'); await p.waitForTimeout(150);
    ok((await p.locator('#tc').boundingBox()).width === box.width, 'and narrows her again');

    // ---- welcome
    ok((await p.locator('[data-testid="ai-welcome"] .big').innerText()) === 'Hi Josh, what do you need?', 'greeting asks what you need');
    ok(await p.locator('[data-starter]').count() === 4 && await p.locator('[data-fill]').count() === 5, 'rows: four questions, Start a quote, Add to a job, Remind me, I’ve got an idea, Report a problem');
    ok(await inView(p.locator('#tcInput')) && await inView(p.locator('[data-fill="report"]')), 'every row and the typing box are on screen');
    ok((await p.getAttribute('#tcInput', 'placeholder')) === 'Ask Lucy, or tell her what to do…', 'placeholder says she takes tasks');
    await p.screenshot({ path: `${SHOTS}/lucy-op-welcome-${W}.png` });
    await p.click('[data-fill="quote"]'); await p.waitForTimeout(100);
    ok((await p.inputValue('#tcInput')) === 'Start a quote for ', '"Start a quote for…" fills the box without sending');
    await p.fill('#tcInput', '');

    // ---- one change: nothing happens before Approve
    await say('Add a $180 skip bin expense to the South Wharf job');
    ok(await last().getAttribute('data-state') === 'ask' && (await last().locator('[data-testid="lucy-act-kick"]').innerText()).toUpperCase() === 'LUCY IS ABOUT TO', 'a card says "Lucy is about to" and waits');
    ok((await last().locator('[data-testid="lucy-act-title"]').innerText()) === 'Add an expense' && (await last().innerText()).includes('$180.00') && (await last().innerText()).includes('20 Convention Centre Place'), 'the card shows the job, what and the amount');
    const card = await last().boundingBox(); const body = await p.locator('#tcBody').boundingBox();
    ok(card.width > body.width - 40 && card.height > 150, `the card is a full-width block with its rows stacked (${Math.round(card.width)} × ${Math.round(card.height)})`);
    ok(await last().locator('.lz-btns button').count() === 3, 'three buttons: Approve · Change something · Cancel');
    await p.screenshot({ path: `${SHOTS}/lucy-op-card-${W}.png` });
    await last().locator('[data-testid="lucy-act-change"]').click(); await p.waitForTimeout(100);
    ok((await p.inputValue('#tcInput')) === 'Change that: ' && await last().getAttribute('data-state') === 'ask', '"Change something" fills the box; the card still waits');
    await say('Change that: make it $220');
    const cards = p.locator('[data-testid="lucy-act"]');
    ok(await cards.count() === 2 && await cards.nth(0).getAttribute('data-state') === 'cancelled' && (await cards.nth(0).innerText()).includes('Replaced by the one below') && (await cards.nth(1).innerText()).includes('$220.00'), 'the change replaces the card: the old one is marked replaced, the new one shows $220.00');
    await last().locator('[data-testid="lucy-act-approve"]').click(); await p.waitForTimeout(1300);
    ok(await last().getAttribute('data-state') === 'done' && (await last().locator('[data-testid="lucy-act-state"]').innerText()).includes('Expense added') && (await last().innerText()).includes('Approved by Josh'), 'Approve → done, with who approved it and when');
    ok(await last().locator('[data-testid="lucy-act-link"]').innerText() === 'Open the job' && await last().locator('.lz-btns').count() === 0, 'a done card links to the record and has no buttons left');

    // ---- cancel
    await say('Add a $90 skip bin expense to the South Wharf job');
    await last().locator('[data-testid="lucy-act-cancel"]').click(); await p.waitForTimeout(100);
    ok(await last().getAttribute('data-state') === 'cancelled' && (await last().innerText()).includes('Cancelled — nothing was changed.'), 'Cancel → "Cancelled — nothing was changed."');

    // ---- a task of several steps: one approval, then the next step is offered
    await say('Start a quote for Leanne Crowe, exterior repaint at 12 Ivanhoe Pde');
    ok(await last().getAttribute('data-kind') === 'plan' && await last().locator('.lz-steps li').count() === 4 && (await last().locator('[data-testid="lucy-act-approve"]').innerText()) === 'Approve all 4 steps', 'a plan lists its four steps and asks once');
    ok((await last().innerText()).includes('$8,460.00 + GST') && (await last().innerText()).includes('Draft — nothing is sent'), 'the plan shows the total and that nothing is sent');
    await p.screenshot({ path: `${SHOTS}/lucy-op-plan-${W}.png` });
    await last().locator('[data-testid="lucy-act-approve"]').click(); await p.waitForTimeout(700);
    ok(await last().getAttribute('data-state') === 'running' && (await last().locator('[data-testid="lucy-act-state"]').innerText()).startsWith('Working — step'), 'while she works the card says which step');
    await p.waitForTimeout(1800);
    ok(await last().getAttribute('data-state') === 'done' && await last().locator('.lz-steps li.ok').count() === 4 && (await last().innerText()).includes('EST-0046 is ready as a draft.'), 'all four steps tick and the quote number is given');
    ok(await last().locator('[data-testid="lucy-next"] button').innerText() === 'Send it to Leanne', 'a next step is offered: Send it to Leanne');

    // ---- sending always shows what goes out
    await last().locator('[data-testid="lucy-next"] button').click(); await p.waitForTimeout(1000);
    ok(await last().getAttribute('data-kind') === 'send' && (await last().locator('[data-testid="lucy-act-mail"]').innerText()).includes('leanne.crowe@example.com') && (await last().innerText()).includes('Hi Leanne,') && (await last().innerText()).includes('Estimate-EST-0046.pdf'), 'the send card shows who, the subject, the words and the attachment');
    ok((await last().locator('[data-testid="lucy-act-approve"]').innerText()) === 'Send it', 'its button says "Send it"');
    ok((await last().locator('[data-testid="lucy-act-sig"]').innerText()).includes('Josh Sano') && (await last().locator('[data-testid="lucy-act-sig"]').innerText()).toUpperCase().includes('FROM MESSAGES SETUP'), 'the send card shows the signature from Messages setup under the words');
    ok((await last().locator('[data-testid="lucy-act-checks"]').innerText()).includes('Nothing red on the quote') && await last().locator('[data-testid="lucy-act-approve"]').isEnabled(), 'it shows the quote’s own checks; nothing red, so Send it is on');
    await p.screenshot({ path: `${SHOTS}/lucy-op-send-${W}.png` });
    await last().locator('[data-testid="lucy-act-approve"]').click(); await p.waitForTimeout(1300);
    ok((await last().innerText()).includes('Sent to leanne.crowe@example.com'), 'sent only after "Send it"');

    // ---- Lucy's setup decides what she may do: deleting is off until the admin turns it on
    const nCards = await p.locator('[data-testid="lucy-act"]').count();
    await say('Delete the empty draft EST-0040');
    ok(await p.locator('[data-testid="lucy-act"]').count() === nCards && (await p.locator('[data-testid="ai-msg-assistant"]').last().innerText()).includes('Deleting is turned off in my setup.'), 'deleting is off by default: no card, she says so');
    await p.click('[data-testid="lucy-open-setup"]'); await p.waitForTimeout(250);
    ok(await p.locator('#pop').isVisible() && (await p.locator('#pop .qs-sec h3').first().innerText()).toUpperCase() === 'WHAT LUCY CAN DO', 'her button opens Lucy’s setup, which starts with "What Lucy can do"');
    ok(await p.locator('#lzPerms .lz-seg[data-perm]').count() === 9 && await p.locator('#lzPerms .lz-seg button.on').count() === 9, 'seven areas plus Email and Files, each with one choice lit');
    ok(await p.locator('[data-testid="lucy-perm-quotes"] button.on').innerText() === 'Read and change' && await p.locator('#pSend').isChecked() && !(await p.locator('#pDelete').isChecked()), 'defaults: areas read and change, Send on, Delete off');
    ok((await p.locator('[data-testid="lucy-perm-mail-who"]').innerText()).includes('Gmail') && (await p.locator('[data-testid="lucy-perm-files-who"]').innerText()).includes('Google Drive'), 'Email and Files name what this business has connected');
    const pop = await p.locator('#pop .qs-panel').boundingBox();
    ok(pop.x >= 0 && pop.x + pop.width <= W + 1 && await p.evaluate(() => { const b = document.querySelector('#pop .qs-body'); return b.scrollWidth <= b.clientWidth + 1; }), 'the setup panel fits, nothing runs off sideways');
    await p.screenshot({ path: `${SHOTS}/lucy-op-setup-${W}.png` });
    await p.click('label.tog:has(#pDelete)'); await p.click('[data-testid="ai-setting-save"]'); await p.waitForTimeout(250);
    ok(!(await p.locator('#pop').isVisible()), 'Save closes the setup');

    // ---- deleting asks for the number
    await say('Delete the empty draft EST-0040');
    ok(await last().getAttribute('data-kind') === 'delete' && await last().locator('[data-testid="lucy-act-warn"]').innerText() === 'This can’t be undone.' && await last().locator('[data-testid="lucy-act-approve"]').isDisabled(), 'the delete card is red, says it can’t be undone, and its button is off');
    await last().locator('[data-testid="lucy-act-confirm-input"]').fill('EST-004'); ok(await last().locator('[data-testid="lucy-act-approve"]').isDisabled(), 'a wrong number keeps it off');
    await last().locator('[data-testid="lucy-act-confirm-input"]').fill('est-0040'); ok(await last().locator('[data-testid="lucy-act-approve"]').isEnabled(), 'the right number turns it on');
    await p.screenshot({ path: `${SHOTS}/lucy-op-delete-${W}.png` });
    await last().locator('[data-testid="lucy-act-approve"]').click(); await p.waitForTimeout(1300);
    ok((await last().innerText()).includes('EST-0040 was deleted.'), 'deleted only then');

    // ---- the app's own rules still stand
    const before = await p.locator('[data-testid="lucy-act"]').count();
    await say('Change the price on EST-0019 to $9,000');
    ok(await p.locator('[data-testid="lucy-act"]').count() === before && (await p.locator('[data-testid="ai-msg-assistant"]').last().innerText()).includes('EST-0019 is accepted, so it can’t be changed.'), 'an accepted quote: no card, the app’s own sentence');
    await p.click('[data-testid="lucy-offer"]'); await p.waitForTimeout(900);
    ok((await last().locator('[data-testid="lucy-act-title"]').innerText()) === 'Draft a variation' && (await last().innerText()).includes('$320.00 + GST ($352.00 incl. GST)'), 'she offers the right way instead: a variation, with GST shown');

    // ---- moving on cancels a waiting card
    await say('What’s owed?');
    ok(await last().getAttribute('data-state') === 'cancelled' && (await last().innerText()).includes('Not done — you moved on.'), 'a new message while a card waits: "Not done — you moved on."');
    ok(await p.locator('[data-testid="ai-msg-assistant"]').last().locator('[data-testid="lucy-next"] button').innerText() === 'Send a reminder for INV-0009', 'an answer offers its next step');
    await p.locator('[data-testid="ai-msg-assistant"]').last().locator('[data-testid="lucy-next"] button').click(); await p.waitForTimeout(1000);
    ok(await last().getAttribute('data-kind') === 'send' && (await last().innerText()).includes('jane.chen@example.com'), 'the next step opens its own card');
    await last().locator('[data-testid="lucy-act-cancel"]').click();

    // ---- one chat: testers report to Lucy
    await p.click('[data-testid="tc-more"]'); await p.waitForTimeout(150);
    ok(await p.locator('[data-testid="tc-menu-help"]').count() === 0 && await p.locator('[data-testid="tc-menu-reports"]').isVisible() && await p.locator('[data-tab="help"]:visible').count() === 0, 'the Help chat is gone from the menu; "My reports" is there');
    await p.click('#tcBody'); await p.waitForTimeout(150);  // closes the menu (Escape would close Lucy herself)
    await say('Report a problem');
    ok((await p.locator('[data-testid="ai-msg-assistant"]').last().innerText()).startsWith('What went wrong?'), 'a bare "Report a problem" gets one question, no card');
    await say('Report a problem: the Variations card shows $0 after I approve one');
    ok(await last().getAttribute('data-kind') === 'report' && (await last().innerText()).includes('the Variations card shows $0 after I approve one') && (await last().innerText()).includes('/admin/dashboard') && (await last().innerText()).includes(`window ${W} wide`), 'the report card has their words, the page and the browser, added for them');
    ok((await last().locator('[data-testid="lucy-act-approve"]').innerText()) === 'Log it', 'its button says "Log it"');
    await p.screenshot({ path: `${SHOTS}/lucy-op-report-${W}.png` });
    await last().locator('[data-testid="lucy-act-approve"]').click(); await p.waitForTimeout(1300);
    const doneTxt = await last().locator('[data-testid="lucy-act-state"]').innerText(); const fb = (/FB-[0-9a-f]+/.exec(doneTxt) || [''])[0];
    ok(/Logged as FB-[0-9a-f]{6,}\. The team will see it\./.test(doneTxt), `logged with a number (${fb})`);
    await last().locator('[data-testid="lucy-act-link"]').click(); await p.waitForTimeout(200);
    ok(await p.locator('[data-testid="lucy-reports"]').isVisible() && await p.locator('.lz-rep').count() === 3 && (await p.locator('.lz-rep').first().innerText()).includes(fb) && (await p.locator('.lz-rep').first().innerText()).includes('Logged'), 'My reports lists it first, as Logged');
    ok((await p.locator('[data-testid="lucy-report-FB-3bea7197"]').innerText()).includes('Fixed') && (await p.locator('[data-testid="lucy-report-FB-3bea7197"]').innerText()).includes('THE TEAM'), 'an older report shows its status and the team’s reply');
    ok(!(await p.locator('#tcFoot').isVisible()), 'the reports list is a list — no typing box');
    await p.screenshot({ path: `${SHOTS}/lucy-op-reports-${W}.png` });
    await p.locator('[data-testid="lucy-report-FB-247c7747"] button').click(); await p.waitForTimeout(200);
    ok(await p.locator('#tcFoot').isVisible() && (await p.inputValue('#tcInput')) === 'About FB-247c7747: ', '"Add to this report" goes back to Lucy with the box filled');
    await say('About FB-247c7747: it should print on the invoice too');
    ok((await last().locator('[data-testid="lucy-act-title"]').innerText()) === 'Add to FB-247c7747', 'adding to a report is a card too');
    await last().locator('[data-testid="lucy-act-approve"]').click(); await p.waitForTimeout(1300);
    ok((await last().innerText()).includes('Added to FB-247c7747.'), 'added');

    // ---- round 2: a quote with red checks is not sent; a variation; a payment
    await say('Send EST-0041 to Mark');
    ok(await last().getAttribute('data-kind') === 'send' && (await last().locator('[data-testid="lucy-act-checks"]').innerText()).toUpperCase().includes('2 THINGS TO FIX BEFORE IT CAN GO'), 'a quote with red checks: the card lists them');
    ok((await last().locator('[data-testid="lucy-act-checks"]').innerText()).includes('isn’t measured') && await last().locator('[data-testid="lucy-act-approve"]').isDisabled(), 'Send it is off while a red check stands');
    ok((await last().locator('[data-testid="lucy-act-fix"]').innerText()) === 'Open EST-0041', 'a button opens the quote to fix it');
    await last().locator('[data-testid="lucy-act-approve"]').click({ force: true }); await p.waitForTimeout(400);
    ok(await last().getAttribute('data-state') === 'ask', 'pressing the switched-off button sends nothing');
    await p.screenshot({ path: `${SHOTS}/lucy-op-blocked-${W}.png` });
    await say('Send the variation to Leanne');
    ok(await last().getAttribute('data-kind') === 'send' && (await last().locator('[data-testid="lucy-act-title"]').innerText()) === 'Send a variation to Leanne Crowe' && (await last().innerText()).includes('carries the link to the approval page'), 'a variation has its own send card: no attachment, the approval link');
    ok((await last().locator('[data-testid="lucy-act-checks"]').innerText()).includes('$320.00 + GST ($352.00 incl. GST)'), 'its checks show the price with GST');
    await last().locator('[data-testid="lucy-act-approve"]').click(); await p.waitForTimeout(1300);
    ok((await last().innerText()).includes('awaiting approval'), 'sent on "Send it"; the variation is awaiting approval');
    await say('Record a payment on INV-0009');
    ok(await last().getAttribute('data-kind') === 'change' && (await last().locator('[data-testid="lucy-act-title"]').innerText()) === 'Record a payment' && (await last().innerText()).includes('$233.99') && (await last().innerText()).includes('Paid in full'), 'recording a payment is a card: the invoice, the amount, the method, the date and what it leaves owing');
    ok((await last().locator('[data-testid="lucy-act-approve"]').innerText()) === 'Approve', 'a payment is a change, not a send: the button says Approve');
    await p.screenshot({ path: `${SHOTS}/lucy-op-payment-${W}.png` });
    await say('Change that: $100');
    ok((await last().innerText()).includes('$100.00') && (await last().innerText()).includes('$133.99 still owing'), 'a part payment shows what is still owing');
    await last().locator('[data-testid="lucy-act-approve"]').click(); await p.waitForTimeout(1300);
    ok((await last().innerText()).includes('Payment recorded on INV-0009.'), 'recorded only after Approve');

    // ---- layout
    const sw = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth, document.querySelector('#tcBody').scrollWidth, document.querySelector('#tcBody').clientWidth]);
    ok(sw[0] <= sw[1] && sw[2] <= sw[3] + 1, 'no sideways scroll on the page or inside Lucy');
    ok(await inView(p.locator('#tc')), 'the panel is fully on screen');
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.join(' | ').slice(0, 200) : ''}`);

    // ---- an area set to Read: she reads, she does not offer the change; Cancel in the setup saves nothing
    await fresh();
    await p.click('[data-testid="tc-more"]'); await p.waitForTimeout(150); await p.click('[data-testid="tc-menu-setup"]'); await p.waitForTimeout(250);
    await p.click('[data-testid="lucy-perm-quotes"] button[data-v="read"]'); await p.click('label.tog:has(#pSend)');
    ok(await p.locator('[data-testid="lucy-perm-quotes"] button.on').innerText() === 'Read', 'Quotes can be set to Read');
    await p.click('[data-testid="ai-setting-cancel"]'); await p.waitForTimeout(200);
    await say('Start a quote for Leanne Crowe, exterior repaint at 12 Ivanhoe Pde');
    ok(await last().getAttribute('data-kind') === 'plan', 'Cancel saved nothing: she still plans a quote');
    await last().locator('[data-testid="lucy-act-cancel"]').click();
    await p.click('[data-testid="tc-more"]'); await p.waitForTimeout(150); await p.click('[data-testid="tc-menu-setup"]'); await p.waitForTimeout(250);
    ok(await p.locator('[data-testid="lucy-perm-quotes"] button.on').innerText() === 'Read and change' && await p.locator('#pSend').isChecked(), 'and the setup opens as it was saved');
    await p.click('[data-testid="lucy-perm-quotes"] button[data-v="read"]'); await p.click('label.tog:has(#pSend)'); await p.click('[data-testid="ai-setting-save"]'); await p.waitForTimeout(250);
    const c0 = await p.locator('[data-testid="lucy-act"]').count();
    await say('Start a quote for Leanne Crowe, exterior repaint at 12 Ivanhoe Pde');
    ok(await p.locator('[data-testid="lucy-act"]').count() === c0 && (await p.locator('[data-testid="ai-msg-assistant"]').last().innerText()).includes('Changing quotes is turned off in my setup'), 'Quotes on Read: no plan card, she says it is turned off');
    await say('Send EST-0046 to Leanne');
    ok(await p.locator('[data-testid="lucy-act"]').count() === c0 && (await p.locator('[data-testid="ai-msg-assistant"]').last().innerText()).includes('Sending is turned off in my setup'), 'Send off: no send card, she offers to draft instead');
    await say('Add a $180 skip bin expense to the South Wharf job');
    ok(await last().getAttribute('data-kind') === 'change' && await last().getAttribute('data-state') === 'ask', 'Jobs is still on: the expense card comes');

    // ---- email and files follow what the admin connected, whoever the provider is
    await p.goto(U + '?mail=microsoft&storage=onedrive'); await p.waitForTimeout(400); await p.click('#tcBubble'); await p.waitForTimeout(300);
    await p.click('[data-testid="tc-more"]'); await p.waitForTimeout(150); await p.click('[data-testid="tc-menu-setup"]'); await p.waitForTimeout(250);
    ok((await p.locator('[data-testid="lucy-perm-mail-who"]').innerText()).includes('Outlook') && (await p.locator('[data-testid="lucy-perm-files-who"]').innerText()).includes('OneDrive'), 'a business on Outlook and OneDrive sees Outlook and OneDrive');
    await p.goto(U + '?mail=none&storage=builtin'); await p.waitForTimeout(400); await p.click('#tcBubble'); await p.waitForTimeout(300);
    await p.click('[data-testid="tc-more"]'); await p.waitForTimeout(150); await p.click('[data-testid="tc-menu-setup"]'); await p.waitForTimeout(250);
    ok((await p.locator('[data-testid="lucy-perm-mail-who"]').innerText()).startsWith('No mailbox connected') && await p.getAttribute('[data-testid="lucy-perm-mail"]', 'aria-disabled') === 'true' && await p.locator('[data-testid="lucy-perm-mail"] button.on').innerText() === 'Off', 'no mailbox connected: the Email row says so and stays Off');
    ok((await p.locator('[data-testid="lucy-perm-files-who"]').innerText()).includes('Paint Trade HQ’s own storage'), 'no cloud storage: Files uses the app’s own storage');

    // ---- someone who is not a tester
    await p.goto(U + '?tester=0'); await p.waitForTimeout(400); await p.click('#tcBubble'); await p.waitForTimeout(300);
    ok(await p.locator('[data-fill="report"]').count() === 0 && await p.locator('[data-fill]').count() === 4, 'not a tester: no "Report a problem" row');
    await p.click('[data-testid="tc-more"]'); await p.waitForTimeout(150);
    ok(!(await p.locator('[data-testid="tc-menu-reports"]').isVisible()), 'not a tester: no "My reports" in the menu');
    await p.click('#tcBody'); await p.waitForTimeout(150); await say('Report a problem: something is broken');
    ok(await p.locator('[data-testid="lucy-act"]').count() === 0, 'not a tester: no report card');
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed · shots in ${SHOTS}`);
  process.exit(fail ? 1 : 0);
})();
