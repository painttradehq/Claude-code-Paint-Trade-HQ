// Revise an accepted quote — the quote screen, the client's page, the job and Lucy's card.
// Run: NODE_PATH=$(npm root -g) node tools/test_quote_revise.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('quote-revise.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
const T = (id) => `[data-testid="${id}"]`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H] of [[1440, 900], [1024, 768]]) {
    console.log(`\n== ${W} × ${H} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const txt = (id) => p.locator(T(id)).first().innerText();
    const has = (id) => p.locator(T(id)).count();
    const sideways = () => p.evaluate(() => { const bad = []; for (const el of document.querySelectorAll('#app *')) { const r = el.getBoundingClientRect(); if (r.width && r.right > window.innerWidth + 1) bad.push(el.className || el.tagName); } return [document.documentElement.scrollWidth <= window.innerWidth, bad.slice(0, 3)]; });
    const clean = async (m) => { const s = await sideways(); ok(s[0] && !s[1].length, `${m}: nothing runs off sideways${s[1].length ? ' — ' + s[1].join(', ') : ''}`); };

    // ---------------------------------------------------------- the quote, accepted
    console.log(' the quote — accepted');
    await p.goto(U); await p.waitForTimeout(150);
    ok((await txt('status-pill')) === 'Accepted' && !(await has('revised-tag')) && (await txt('send-btn')).includes('Resend'), 'an accepted quote: Accepted, no Revised tag, the button says Resend');
    await p.fill(T('qty-l2'), '42'); await p.locator(T('qty-l2')).blur(); await p.waitForTimeout(120);
    const t1 = await txt('toast');
    ok(t1.startsWith('EST-0046 is accepted, so it can\'t be changed as it stands.') && t1.includes('Revise this quote') && t1.includes('Leanne will need to accept it again') && t1.includes('«12 Ivanhoe Pde, Ivanhoe» as a variation'), 'a change typed on it is refused, and the sentence names the way: Revise this quote, or a variation on the job');
    ok((await p.inputValue(T('qty-l2'))) === '38' && (await txt('quote-total')) === '$5,000.60', 'the number snaps back and the total is unchanged ($5,000.60)');
    await p.click(T('more-btn')); await p.waitForTimeout(80);
    const items = await p.locator(T('more-menu') + ' button').allInnerTexts();
    ok(items.indexOf('Revise this quote') === items.indexOf('Save as template') + 1 && items.indexOf('Convert to invoice') === items.indexOf('Revise this quote') + 1 && !items.includes('Refresh rates from Library'), '⋯ menu: "Revise this quote" sits after Save as template, where a draft has Refresh rates');
    await p.click(T('more-revise')); await p.waitForTimeout(120);
    const pan = await p.locator(T('revise-panel')).boundingBox(); const con = await p.locator('.content').boundingBox();
    ok(Math.abs(pan.x + pan.width - (con.x + con.width)) <= 1 && pan.width === 440 && Math.abs(pan.height - con.height) <= 1 && pan.x + pan.width <= W, `the panel opens on the right, full height, 440 px wide (${Math.round(pan.x)}–${Math.round(pan.x + pan.width)})`);
    ok((await txt('revise-lead')).includes('Leanne Crowe accepted this quote on 21 Nov'), 'it says who accepted and when');
    const what = await p.locator(T('revise-what') + ' li').allInnerTexts();
    ok(what.length === 4 && what[0].includes('Draft') && what[0].includes('Revised') && what[1].includes('acceptance is withdrawn') && what[1].includes('Leanne accepts the corrected quote again once you send it') && what[2].includes('The job 12 Ivanhoe Pde, Ivanhoe stays as it is') && what[2].includes('new price when Leanne accepts again') && what[3].includes('INV-0052 is archived'), 'four plain lines: back to Draft and Revised · acceptance withdrawn · the job stays · the unsent deposit draft is archived');
    ok((await p.locator(T('revise-panel')).innerText()).includes('Nothing is sent to Leanne until you press Review & send'), 'and that nothing is sent yet');
    const go = await p.locator(T('revise-go')).boundingBox(); ok(go.y + go.height <= H && (await txt('revise-go')) === 'Revise quote', 'the Revise quote button is on screen');
    ok(!/\b(she|her|he|his|him)\b/i.test(await p.locator(T('revise-panel')).innerText()), 'no line guesses a pronoun from the client\'s name');
    await clean('the panel open');
    await p.screenshot({ path: `${SHOTS}/revise-panel-${W}.png` });
    await p.click(T('revise-cancel')); await p.waitForTimeout(80);
    ok(!(await has('revise-panel')) && (await txt('status-pill')) === 'Accepted', 'Cancel closes it and nothing has changed');
    await p.click(T('more-btn')); await p.click(T('more-revise')); await p.keyboard.press('Escape'); await p.waitForTimeout(80);
    ok(!(await has('revise-panel')), 'Esc closes it too');

    // ---------------------------------------------------------- revise
    console.log(' the quote — revised');
    await p.click(T('more-btn')); await p.click(T('more-revise')); await p.click(T('revise-go')); await p.waitForTimeout(120);
    ok((await txt('status-pill')) === 'Draft' && (await txt('revised-tag')) === 'Revised 27 Nov · not sent again yet' && (await txt('send-btn')).includes('Review & send'), 'after Revise: Draft, tagged "Revised 27 Nov · not sent again yet", the button says Review & send');
    ok((await txt('toast')) === 'EST-0046 is back in Draft — marked Revised', 'a short line says so');
    await p.click(T('more-btn')); const items2 = await p.locator(T('more-menu') + ' button').allInnerTexts(); await p.keyboard.press('Escape');
    ok(!items2.includes('Revise this quote') && items2.includes('Refresh rates from Library'), 'the menu no longer offers Revise (it is a draft now)');
    await p.fill(T('qty-l2'), '42'); await p.locator(T('qty-l2')).blur(); await p.waitForTimeout(120);
    ok((await p.inputValue(T('qty-l2'))) === '42' && (await txt('total-l2')) === '$798.00' && (await txt('quote-total')) === '$5,084.20', 'the ceiling now saves: 42 m², $798.00, total $5,084.20');
    await clean('the revised quote');
    await p.screenshot({ path: `${SHOTS}/revise-draft-${W}.png` });

    // the client opens the old link while it is being corrected
    await p.click('[data-screen="client"]'); await p.waitForTimeout(100);
    ok(await has('client-updating') && !(await has('client-doc')) && !(await has('accept-btn')), 'meanwhile the client\'s old link shows "This quote is being updated" — no half-corrected quote, no Accept');
    ok((await txt('client-updating')).includes('Sano Painting is correcting quote EST-0046') && (await txt('client-updating')).includes('nothing you need to do yet'), 'in plain words');
    // the job while it is being corrected
    await p.click('[data-screen="job"]'); await p.waitForTimeout(100);
    ok((await txt('project-link-estimate-sub')) === 'Being revised · not sent again yet' && (await txt('job-revenue')) === '$5,000.60', 'the job is still there: its quote row reads "Being revised · not sent again yet"; quoted revenue is still the accepted $5,000.60');
    ok(!(await has('project-link-invoice')) && await has('project-link-new-invoice'), 'the unsent deposit draft has gone from the job');
    await p.click(T('project-link-new-invoice')); await p.waitForTimeout(100);
    ok((await txt('toast')) === 'EST-0046 is being revised — invoice it once Leanne has accepted it again.', 'an invoice can\'t be raised from it yet, and it says why');
    await clean('the job');

    // ---------------------------------------------------------- send again
    console.log(' the quote — sent again');
    await p.click('[data-screen="builder"]'); await p.click(T('send-btn')); await p.waitForTimeout(120);
    const cks = await p.locator(T('review-checks') + ' .chk').allInnerTexts();
    ok(cks[0] === 'Leanne accepted the earlier quote on 21 Nov — this asks for it to be accepted again' && (await p.locator(T('check-reaccept')).getAttribute('class')).includes('amber'), 'Review & Send: the first check, in amber, says Leanne accepted the earlier quote and it is asked for again');
    const subj = await p.inputValue(T('review-subject')); const body = await p.inputValue(T('review-body'));
    ok(subj === 'Your revised painting quote EST-0046 from Sano Painting' && body.includes('I\'ve corrected your quote') && body.includes('replaces the one you accepted on 21 Nov') && body.includes('accept it again'), 'the opening words are the revised ones: what changed hands, and that she accepts again');
    ok((await p.locator(T('review-window') + ' ' + T('doc-title')).innerText()) === 'REVISED QUOTE' && (await p.locator(T('review-window') + ' ' + T('doc-revised')).innerText()) === '27 Nov', 'the preview reads REVISED QUOTE · Revised 27 Nov');
    ok(!/\b(she|her|he|his|him)\b/i.test(cks.join(' ') + ' ' + body), 'nor in the checks or the opening words');
    const rw = await p.locator(T('review-window')).boundingBox(); ok(rw.x >= 0 && rw.x + rw.width <= W && rw.y >= 0 && rw.y + rw.height <= H && (await txt('review-send')) === 'Send quote to 1 person', 'the window fits the screen; the button says Send quote to 1 person');
    await p.screenshot({ path: `${SHOTS}/revise-send-${W}.png` });
    await p.click(T('review-send')); await p.waitForTimeout(100);
    ok((await txt('review-sent')).includes('waiting for Leanne to accept it again'), 'sent: "waiting for Leanne to accept it again"');
    await p.click(T('review-done')); await p.waitForTimeout(80);
    ok((await txt('status-pill')) === 'Sent' && (await txt('revised-tag')) === 'Revision 2 · sent 27 Nov', 'the quote is Sent, tagged "Revision 2 · sent 27 Nov"');
    await p.click('[data-screen="job"]'); await p.waitForTimeout(80);
    ok((await txt('project-link-estimate-sub')) === 'Revised · sent 27 Nov, waiting for Leanne to accept', 'the job\'s quote row: "Revised · sent 27 Nov, waiting for Leanne to accept"');

    // ---------------------------------------------------------- the client accepts again
    console.log(' the client');
    await p.click('[data-screen="client"]'); await p.waitForTimeout(100);
    ok((await txt('client-reaccept-note')) === 'This quote was updated on 27 Nov. It replaces the one you accepted on 21 Nov — please review it and accept it again.', 'the client\'s page says it was updated, what it replaces, and to accept again');
    ok((await txt('doc-title')) === 'REVISED QUOTE' && (await txt('doc-total')) === '$5,084.20' && (await txt('bar-total')) === '$5,084.20' && !(await has('accepted-banner')), 'REVISED QUOTE, the new total $5,084.20, no "Accepted" strip');
    await p.screenshot({ path: `${SHOTS}/revise-client-${W}.png` });
    await p.click(T('accept-btn')); await p.click(T('sign-go')); await p.waitForTimeout(80);
    ok(await has('sign-sheet') && !(await has('accepted-banner')), 'accepting needs her name and the tick, as today');
    await p.fill(T('sign-name'), 'Leanne Crowe'); await p.check(T('sign-terms')); await p.click(T('sign-go')); await p.waitForTimeout(100);
    ok((await txt('accepted-banner')) === 'Accepted by Leanne Crowe on 27 Nov. Thank you!' && !(await has('accept-btn')) && !(await has('client-reaccept-note')), 'signed: "Accepted by Leanne Crowe on 27 Nov"');
    await clean('the client\'s page');
    await p.click('[data-screen="job"]'); await p.waitForTimeout(100);
    ok((await txt('project-link-estimate-sub')) === 'Accepted 27 Nov · $5,084.20 · revision 2' && (await txt('job-revenue')) === '$5,084.20', 'the job takes the new figure: quoted revenue $5,084.20, "Accepted 27 Nov · revision 2"');
    ok((await p.locator(T('project-link-invoice')).innerText()).includes('INV-0053') && (await p.locator(T('project-link-invoice')).innerText()).includes('$1,525.26'), 'a new deposit draft is raised on the new total (INV-0053, $1,525.26)');
    await p.screenshot({ path: `${SHOTS}/revise-job-${W}.png` });
    await p.click('[data-screen="builder"]'); await p.waitForTimeout(80);
    ok((await txt('status-pill')) === 'Accepted' && (await txt('revised-tag')) === 'Revision 2 · sent 27 Nov', 'the quote is Accepted again, still marked Revision 2');

    // ---------------------------------------------------------- Resend on an accepted quote keeps it accepted
    console.log(' Resend on an accepted quote');
    await p.goto(U); await p.waitForTimeout(120);
    await p.click(T('send-btn')); await p.waitForTimeout(100);
    ok(!(await has('check-reaccept')) && (await p.inputValue(T('review-subject'))) === 'Your painting quote EST-0046 from Sano Painting' && (await txt('review-send')) === 'Resend quote to 1 person', 'Resend on an accepted quote: the ordinary words, no accept-again check');
    await p.click(T('review-send')); await p.waitForTimeout(80);
    ok((await txt('review-sent')).includes('EST-0046 is still Accepted'), 'it goes, and the quote is still Accepted');
    await p.click(T('review-done')); ok((await txt('status-pill')) === 'Accepted' && !(await has('revised-tag')), 'the pill still says Accepted (today a Resend turns it back to Sent)');

    // ---------------------------------------------------------- refused: money has been asked for
    console.log(' refused when an invoice has been sent');
    await p.goto(U + '?inv=sent'); await p.waitForTimeout(120);
    await p.click(T('more-btn')); await p.click(T('more-revise')); await p.waitForTimeout(100);
    const bl = await txt('revise-blocked');
    ok(bl.includes('EST-0046 can\'t be revised') && bl.includes('INV-0052') && bl.includes('variation') && bl.includes('cancel or credit INV-0052 first') && !(await has('revise-go')), 'with the deposit invoice already sent the panel says it can\'t be revised, why, and the two ways on — no Revise button');
    await p.screenshot({ path: `${SHOTS}/revise-blocked-${W}.png` });
    await p.click(T('revise-open-job')); await p.waitForTimeout(100);
    ok(await has('job-page') && (await txt('project-link-estimate-sub')).startsWith('Accepted 21 Nov'), '"Open the job" goes to the job; the quote is still Accepted');
    await p.goto(U + '?job=0&inv=none'); await p.click(T('more-btn')); await p.click(T('more-revise')); await p.waitForTimeout(100);
    ok((await p.locator(T('revise-what') + ' li').count()) === 2, 'no job and no deposit draft: the panel has just the two lines about the quote');

    // ---------------------------------------------------------- Lucy
    console.log(' Lucy');
    await p.goto(U + '?screen=lucy'); await p.waitForTimeout(120);
    const lp = await p.locator(T('tc-panel')).boundingBox(); ok(lp.width === (W >= 1181 ? 560 : 480), `Lucy's panel is ${lp.width} px`);
    await p.click(T('lucy-try')); await p.waitForTimeout(100);
    ok((await p.locator(T('ai-msg-assistant')).first().innerText()).includes('so I can\'t change it as it stands') && (await p.locator(T('lucy-act')).getAttribute('data-kind')) === 'revise', 'asked to fix a number on the accepted quote, she says why she can\'t as it stands and shows a Revise card');
    const rows = await p.locator(T('lucy-act-rows') + ' div').allInnerTexts();
    ok(rows.length === 5 && rows[0].includes('EST-0046 · Leanne Crowe') && rows[1].includes('21 Nov by Leanne Crowe') && rows[2].includes('$5,000.60') && rows[3].includes('stays as it is') && rows[4].includes('INV-0052 — archived'), 'the card: the quote, who accepted and when, the total, the job stays, the deposit draft archived');
    ok((await txt('lucy-act-warn')) === 'The acceptance is withdrawn. Leanne will need to accept the quote again.' && (await txt('lucy-act-approve')) === 'Revise it', 'one warning line and the button "Revise it"');
    ok((await p.locator('#protoState').innerText()).startsWith('EST-0046 is Accepted'), 'nothing has happened yet — the quote is still Accepted');
    const act = await p.locator(T('lucy-act')).boundingBox(); ok(act.x >= lp.x && act.x + act.width <= lp.x + lp.width, 'the card sits inside her panel');
    await p.screenshot({ path: `${SHOTS}/revise-lucy-${W}.png` });
    await p.click(T('lucy-act-cancel')); await p.waitForTimeout(80);
    ok((await p.locator(T('lucy-act')).innerText()).includes('Nothing changed') && (await p.locator('#protoState').innerText()).startsWith('EST-0046 is Accepted'), 'Cancel: nothing changed');
    await p.click(T('proto-reset')); await p.click(T('lucy-try')); await p.click(T('lucy-act-approve')); await p.waitForTimeout(120);
    ok((await p.locator(T('lucy-act')).first().innerText()).includes('EST-0046 is back in Draft, marked Revised'), 'Revise it: "EST-0046 is back in Draft, marked Revised"');
    const said = await p.locator(T('ai-msg-assistant')).last().innerText();
    ok(said.includes('now 42 m² (was 38)') && said.includes('$5,000.60 to $5,084.20') && said.includes('Nothing is sent'), 'then she makes the change in the conversation and says what changed and that nothing is sent');
    ok((await p.locator(T('lucy-next')).innerText()) === 'Send it to Leanne', 'and offers "Send it to Leanne"');
    await p.click(T('lucy-next')); await p.waitForTimeout(100);
    const sc = p.locator(T('lucy-act') + '[data-kind="send"]');
    ok((await sc.locator(T('lucy-act-subject')).innerText()) === 'Your revised painting quote EST-0046 from Sano Painting' && (await sc.locator(T('check-reaccept')).count()) === 1 && (await sc.locator(T('lucy-act-mail')).innerText()).includes('accept it again'), 'the send card carries the revised words and the amber accept-again check');
    ok((await p.locator('#protoState').innerText()).startsWith('EST-0046 is Draft'), 'nothing is sent before Send it');
    await sc.locator(T('lucy-act-approve')).click(); await p.waitForTimeout(100);
    ok((await p.locator('#protoState').innerText()).startsWith('EST-0046 is Sent') && (await p.locator(T('lucy-act') + '[data-kind="send"]').innerText()).includes('waiting for Leanne to accept it again'), 'Send it: sent, waiting for Leanne to accept it again');
    await clean('Lucy');
    await p.goto(U + '?screen=lucy&inv=sent'); await p.click(T('lucy-try')); await p.waitForTimeout(100);
    ok(!(await has('lucy-act')) && (await p.locator(T('ai-msg-assistant')).innerText()).includes('has invoice INV-0052 raised against it, so it can\'t be revised') && (await txt('lucy-next')) === 'Draft the variation', 'with the invoice already sent: no card, the app\'s own sentence, and she offers the variation');
    await p.close();
  }

  // ---------------------------------------------------------- the client's page on a phone
  console.log('\n== 390 × 844 (the client\'s phone) ==');
  const ph = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const fits = async (m) => { const r = await ph.evaluate(() => { const bad = []; for (const el of document.querySelectorAll('#app *')) { const x = el.getBoundingClientRect(); if (x.width && x.right > window.innerWidth + 1) bad.push(el.className || el.tagName); } return [document.documentElement.scrollWidth <= window.innerWidth, bad.slice(0, 3)]; }); ok(r[0] && !r[1].length, `${m}: nothing runs off sideways${r[1].length ? ' — ' + r[1].join(', ') : ''}`); };
  await ph.goto(U + '?screen=client&step=revised'); await ph.waitForTimeout(120);
  ok(await ph.locator(T('client-updating')).isVisible(), 'being corrected: "This quote is being updated"'); await fits('the holding page');
  await ph.goto(U + '?screen=client&step=sent'); await ph.waitForTimeout(120);
  const note = await ph.locator(T('client-reaccept-note')).boundingBox(); const bar = await ph.locator(T('client-bar')).boundingBox(); const btn = await ph.locator(T('accept-btn')).boundingBox();
  ok(note.x >= 0 && note.x + note.width <= 390 && bar.y + bar.height <= 844 && btn.x + btn.width <= 390, 'the update line, the total bar and Accept quote all fit'); await fits('the revised quote');
  await ph.screenshot({ path: `${SHOTS}/revise-client-390.png` });
  await ph.click(T('accept-btn')); await ph.waitForTimeout(80);
  const sh = await ph.locator(T('sign-sheet')).boundingBox(); ok(sh.x >= 0 && sh.x + sh.width <= 390 && sh.y + sh.height <= 844, 'the signing sheet fits');
  await ph.fill(T('sign-name'), 'Leanne Crowe'); await ph.check(T('sign-terms')); await ph.click(T('sign-go')); await ph.waitForTimeout(100);
  ok((await ph.locator(T('accepted-banner')).innerText()).includes('27 Nov'), 'accepted again on the phone'); await fits('accepted');
  await ph.close();

  await b.close();
  console.log(`\n${pass} passed, ${fail} failed · shots in ${SHOTS}`);
  process.exit(fail ? 1 : 0);
})();
