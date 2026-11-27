// Lucy — email and files: reading the Inbox, a reply behind its card, a job's files, attaching them.
// Run: NODE_PATH=$(npm root -g) node tools/test_lucy_email_files.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('lucy-email-files.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
const T = (id) => `[data-testid="${id}"]`;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H] of [[1440, 900], [1024, 768]]) {
    console.log(`\n== ${W} × ${H} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const last = () => p.locator(T('ai-msg-assistant')).last();
    const card = () => p.locator(T('lucy-act')).last();
    const inside = async (m) => { const r = await p.evaluate(() => { const pn = document.querySelector('[data-testid="tc-panel"]').getBoundingClientRect(); const bad = []; for (const el of document.querySelectorAll('[data-testid="tc-body"] *')) { const x = el.getBoundingClientRect(); if (x.width && (x.right > pn.right + 1 || x.left < pn.left - 1)) bad.push(el.className || el.tagName); } const lb = document.querySelector('[data-testid="tc-body"]'); return [lb.scrollWidth <= lb.clientWidth + 1 && document.documentElement.scrollWidth <= window.innerWidth, bad.slice(0, 3)]; }); ok(r[0] && !r[1].length, `${m}: nothing runs off sideways in her panel${r[1].length ? ' — ' + r[1].join(', ') : ''}`); };
    await p.goto(U); await p.waitForTimeout(150);
    const pn = await p.locator(T('tc-panel')).boundingBox(); ok(pn.width === (W >= 1181 ? 560 : 480), `her panel is ${pn.width} px`);

    // ---- reading the inbox
    console.log(' the inbox');
    await p.click(T('try-inbox')); await p.waitForTimeout(100);
    const t = await last().innerText();
    ok(t.startsWith('I checked josh@sanopainting.example just now') && (await p.locator(T('lucy-inbox') + ' li').count()) === 3, '"Any new emails?" — she checks the connected mailbox and lists what is new');
    ok(t.includes('Leanne Crowe') && t.includes('start Monday the 14th') && t.includes('Mark Davis') && t.includes('text, today'), 'client emails are read and summed up; a text is there too, marked as a text');
    ok(t.includes('bookings@tilehaus.example') && t.includes('Not linked to a client, so I can see who sent it and the subject, not the email'), 'an unknown sender shows as sender and subject only, and she says why');
    ok((await last().locator(T('lucy-open')).innerText()) === 'Open the Inbox' && (await last().locator(T('ai-sources')).innerText()) === 'Clients', 'an "Open the Inbox" button; the chip reads Clients');
    await inside('the inbox answer');

    // ---- a reply
    console.log(' a reply');
    await p.click(T('try-reply')); await p.waitForTimeout(100);
    ok((await card().getAttribute('data-record')) === 'email' && (await card().getAttribute('data-state')) === 'waiting' && (await p.locator(T('lucy-act-title')).innerText()) === 'Reply to Leanne Crowe', 'asked to reply, she shows a card: "Reply to Leanne Crowe" — nothing is sent');
    const ir = await p.locator(T('lucy-act-inreply')).innerText();
    ok(ir.includes('In reply to “Re: Your painting quote EST-0046” · Leanne Crowe, today 8:12 am') && ir.includes('could you start on Monday the 14th'), 'the card shows the email being answered');
    ok((await p.locator(T('lucy-act-to')).innerText()) === 'leanne.crowe@example.com' && (await p.locator(T('lucy-act-subject')).innerText()) === 'Re: Your painting quote EST-0046', 'To is the client\'s own address; the subject is "Re: …"');
    const body = await p.locator(T('lucy-act-body')).innerText();
    ok(body.startsWith('Hi Leanne,') && body.includes('Monday the 14th works') && body.includes('ceilings in the living and dining room are included') && (await p.locator(T('lucy-act-sig')).innerText()).includes('Sano Painting'), 'the whole reply as it will go, with the business\'s signature under it');
    ok((await p.locator(T('lucy-act-approve')).innerText()) === 'Send it' && await p.locator(T('lucy-act-change')).isVisible() && await p.locator(T('lucy-act-cancel')).isVisible(), 'Send it · Change something · Cancel');
    const cb = await card().boundingBox(); ok(cb.x >= pn.x && cb.x + cb.width <= pn.x + pn.width, 'the card sits inside her panel');
    await inside('the reply card');
    await p.screenshot({ path: `${SHOTS}/lucy-email-reply-${W}.png` });
    await p.click(T('lucy-act-cancel')); await p.waitForTimeout(80);
    ok((await card().innerText()).includes('Nothing was sent'), 'Cancel: nothing was sent');
    await p.click(T('ai-new-chat-btn')); await p.click(T('try-reply')); await p.click(T('lucy-act-approve')); await p.waitForTimeout(100);
    ok((await card().innerText()).includes('Sent to leanne.crowe@example.com. The conversation is marked read.'), 'Send it: sent, and the conversation is marked read');
    ok((await last().innerText()).includes('still starts Mon 7 Dec — do you want me to move it to Mon 14 Dec?'), 'she notices the job still starts on the 7th and asks before changing it');

    // ---- files
    console.log(' files');
    await p.click(T('ai-new-chat-btn')); await p.click(T('try-files')); await p.waitForTimeout(100);
    const f = await last().innerText();
    ok(f.includes('3 files and 14 photos') && f.includes('Google Drive › Paint Trade HQ › EST-0046 Ivanhoe') && (await p.locator(T('lucy-files') + ' li').count()) === 4, 'a job\'s files: how many, where they are saved, each by name');
    ok(f.includes('Colour schedule.pdf') && f.includes('Goes with the quote email') && f.includes('Before 6 · Process 5 · After 3'), 'which go with the quote email, and the photos by phase');
    ok((await last().locator(T('lucy-open')).innerText()) === 'Open the job' && (await last().locator(T('ai-sources')).innerText()) === 'Jobs', '"Open the job"; the chip reads Jobs');
    await p.click(T('try-tick')); await p.waitForTimeout(100);
    ok((await last().innerText()).includes('Site plan.pdf now goes with EST-0046 when it is sent') && (await last().innerText()).includes('Nothing is sent') && !(await p.locator(T('lucy-act')).count()), 'ticking a file to go with the quote is a change: done and told, no card');
    await p.click(T('try-sendfiles')); await p.waitForTimeout(100);
    ok((await p.locator(T('lucy-act-title')).innerText()) === 'Email Leanne Crowe' && !(await p.locator(T('lucy-act-inreply')).count()), 'sending files is an email, so it is a card: "Email Leanne Crowe"');
    const fl = await p.locator(T('lucy-act-files') + ' .f').allInnerTexts();
    ok(fl.length === 2 && fl[0].includes('Colour schedule.pdf') && fl[0].includes('240 KB') && fl[1].includes('Hallway — before.jpg') && fl[1].includes('1.8 MB') && (await p.locator(T('lucy-act-files-total')).innerText()) === '2 attached · 2.0 MB of the 20 MB an email can carry', 'the card lists each attachment with its size and the total against the 20 MB an email can carry');
    await inside('the email with attachments');
    { const c = await card().boundingBox(); const g = await p.locator(T('lucy-act-approve')).boundingBox(); ok(g.y + g.height <= c.y + c.height && g.y >= c.y, 'in a long conversation the card keeps its full height — Send it is not clipped'); }
    await p.screenshot({ path: `${SHOTS}/lucy-email-files-${W}.png` });
    await p.click(T('lucy-act-approve')); await p.waitForTimeout(80);
    ok((await card().innerText()).includes('Sent to leanne.crowe@example.com'), 'Send it: sent');

    // ---- what she won't do
    console.log(' the edges');
    await p.click(T('ai-new-chat-btn')); await p.click(T('try-text')); await p.waitForTimeout(80);
    ok((await last().innerText()).includes('I can\'t send texts yet — open the conversation and send it from there') && !(await p.locator(T('lucy-act')).count()), 'a text: she can\'t send texts yet, and says where to do it');
    await p.click(T('try-unknown')); await p.waitForTimeout(80);
    ok((await last().innerText()).includes('isn\'t linked to a client, so the app keeps only who sent it and the subject'), 'an unknown sender\'s email: only who and the subject, and how to link it');
    await p.goto(U + '?big=1'); await p.click(T('try-sendfiles')); await p.waitForTimeout(100);
    ok((await p.locator(T('lucy-act-checks')).innerText()).includes('Too big for one email — 3 files come to 24.6 MB; the limit is 20 MB') && await p.locator(T('lucy-act-approve')).isDisabled(), 'over 20 MB: the card says so in red and Send it is off');
    await p.goto(U + '?noemail=1'); await p.click(T('try-reply')); await p.waitForTimeout(100);
    ok((await p.locator(T('lucy-act-checks')).innerText()).includes('No email on file for Leanne Crowe') && await p.locator(T('lucy-act-approve')).isDisabled() && await p.locator(T('lucy-act-fix')).isVisible(), 'no email on the client: red, Send it off, a button to open the client');
    await p.goto(U + '?mail=none'); await p.click(T('try-inbox')); await p.waitForTimeout(100);
    ok((await last().innerText()).startsWith('No mailbox is connected') && (await last().locator(T('lucy-open')).innerText()) === 'Open Messages setup', 'no mailbox connected: she says so and offers Messages setup');
    await p.goto(U + '?send=off'); await p.click(T('try-reply')); await p.waitForTimeout(100);
    ok((await last().innerText()).startsWith('Sending is turned off in my setup. I can still draft the words') && (await p.locator(T('lucy-draft')).innerText()).startsWith('Hi Leanne,') && !(await p.locator(T('lucy-act')).count()), 'Send for me off: no card — the draft as words to send yourself');

    // ---- her setup
    console.log(' her setup');
    await p.goto(U); await p.click(T('ai-settings')); await p.waitForTimeout(100);
    const sp = await p.locator(T('lucy-setup')).boundingBox(); const con = await p.locator('#app').boundingBox();
    ok(Math.abs(sp.x + sp.width - (con.x + con.width)) <= 1 && sp.x >= 0, 'her setup opens on the right');
    ok((await p.locator(T('lucy-perm-mail')).getAttribute('aria-checked')) === 'true' && (await p.locator(T('lucy-perm-files')).getAttribute('aria-checked')) === 'true', 'two new switches, both on as they start: Read my inbox · Job files');
    ok((await p.locator(T('lucy-perm-mail-sub')).innerText()).startsWith('Gmail · josh@sanopainting.example') && (await p.locator(T('lucy-perm-files-sub')).innerText()).startsWith('Google Drive · the Paint Trade HQ folder'), 'each names what is connected: the mailbox, the storage');
    ok((await p.locator(T('lucy-perm-send-sub')).innerText()) === 'Quotes, invoices, reminders, variations and emails to clients. You see each one before it goes.', 'Send for me now covers emails to clients too');
    await p.screenshot({ path: `${SHOTS}/lucy-email-setup-${W}.png` });
    await p.click(T('lucy-perm-mail')); await p.click(T('lucy-perm-files')); await p.keyboard.press('Escape'); await p.waitForTimeout(80);
    await p.click(T('try-inbox')); await p.waitForTimeout(80);
    ok((await last().innerText()).startsWith('Reading your inbox is turned off in my setup.') && await last().locator(T('lucy-open-setup')).isVisible(), 'Read my inbox off: she says it is turned off, with the button to her setup');
    await p.click(T('try-files')); await p.waitForTimeout(80);
    ok((await last().innerText()).startsWith('Job files are turned off in my setup.'), 'Job files off: the same');
    await p.goto(U + '?mail=none'); await p.click(T('ai-settings')); await p.waitForTimeout(80);
    ok((await p.locator(T('lucy-perm-mail-sub')).innerText()).startsWith('No mailbox connected yet — connect one in CRM › Messages setup'), 'with no mailbox the row says so');
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed · shots in ${SHOTS}`);
  process.exit(fail ? 1 : 0);
})();
