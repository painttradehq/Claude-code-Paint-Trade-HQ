// Variation · Review & Send — the same window the estimate builder opens. Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_variation_review_send.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('variation-review-send.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [W, H] of [[1440, 900], [1024, 768]]) {
    console.log(`\n== ${W} × ${H} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_/.test(m.text())) errs.push(m.text()); });
    await p.goto(U); await p.waitForTimeout(300);
    const row = (id) => p.locator(`[data-testid="variation-row-${id}"]`);

    // ---- the job's Variations card
    ok((await p.locator('[data-testid="variation-send-v1"]').innerText()) === 'Preview & send' && await p.locator('[data-testid="variation-edit-v1"]').isVisible(), 'a draft row offers "Preview & send" and the edit pencil — no bare Send');
    ok((await p.locator('[data-testid="variation-send-v2"]').innerText()) === 'Resend' && await p.locator('[data-testid="variation-send-v3"]').count() === 0, 'a sent row offers Resend; an approved row offers nothing');
    ok((await row('v1').innerText()).includes('$320.00 + GST'), 'the row shows the price with "+ GST"');

    // ---- the window: the estimate builder's Review & Send
    await p.click('[data-testid="variation-send-v1"]'); await p.waitForTimeout(200);
    ok(await p.locator('[data-testid="review-and-send-modal"]').isVisible() && (await p.locator('[data-testid="rs-title"]').innerText()) === 'Review & Send', 'the row opens "Review & Send"');
    ok((await p.locator('[data-testid="rs-sub"]').innerText()) === 'Compose the email on the left · the client sees the variation on the right', 'the same sub-line as the quote’s, saying "variation"');
    ok(await row('v1').getAttribute('data-status') === 'draft', 'opening it sends nothing');
    ok(!(await p.locator('[data-testid="rs-sent"]').isVisible()) && await p.locator('[data-testid="rs-send"]').isVisible(), 'the compose view shows; the "sent" box does not');
    const main = await p.locator('#rsMain').boundingBox(); ok(main.height > H - 160, `the two columns fill the window (${Math.round(main.height)} px tall)`);
    const m = await p.locator('[data-testid="review-and-send-modal"]').boundingBox();
    ok(m.x >= 0 && m.y >= 0 && m.x + m.width <= W && m.y + m.height <= H && m.width === Math.min(1400, W - 40), `the window is the quote’s size: ${Math.round(m.width)} wide, full height`);
    const L = await p.locator('[data-testid="rs-left"]').boundingBox(); const R = await p.locator('[data-testid="rs-preview"]').boundingBox();
    ok(Math.abs(L.width - Math.min(520, m.width * 0.48)) <= 1 && R.x >= L.x + L.width - 1 && R.width > 300, `email on the left (${Math.round(L.width)} px), the client’s page on the right (${Math.round(R.width)} px)`);
    const order = await p.evaluate(() => ['rs-checklist', 'rs-to-list', 'rs-subject', 'rs-body', 'rs-signature-preview', 'rs-sms-toggle', 'rs-send', 'rs-total'].map(t => { const el = document.querySelector(`[data-testid="${t}"]`); return el ? el.getBoundingClientRect().top + document.querySelector('[data-testid="rs-left"]').scrollTop : -1; }));
    ok(order.every((y, i) => y >= 0 && (i === 0 || y > order[i - 1])), 'left column in the quote’s order: checks · To · Subject · Message · Signature · SMS · Send · total');
    ok((await p.locator('[data-testid="rs-check-head"]').innerText()) === 'Ready to send' && (await p.locator('[data-testid="rs-check-0"]').innerText()).includes('$320.00 + GST ($352.00 incl. GST)'), 'the checks say Ready to send and state the price with GST');
    ok(await p.locator('[data-testid="rs-ai-draft"]').isVisible() && (await p.inputValue('[data-testid="rs-body"]')).startsWith('Hi Leanne,'), 'a message to the client, with "Draft with AI"');
    ok((await p.inputValue('[data-testid="rs-subject"]')).includes('12 Ivanhoe Pde'), 'a subject line that can be edited');
    await p.screenshot({ path: `${SHOTS}/var-rs-${W}.png` });

    // ---- who it goes to
    ok((await p.locator('[data-testid="rs-send"]').innerText()) === '✈ Send variation to 1 person', 'the button counts who it goes to: 1 person');
    await p.click('[data-testid="rs-to-c1"] input');
    ok((await p.locator('[data-testid="rs-send"]').innerText()) === '✈ Send variation to 2 people', 'ticking a contact: 2 people');
    await p.click('[data-testid="rs-to-c1"] input'); await p.click('[data-testid="rs-to-primary"] input');
    ok(await p.locator('[data-testid="rs-send"]').isDisabled(), 'nobody ticked: Send is off');
    await p.click('[data-testid="rs-to-primary"] input');
    await p.click('[data-testid="rs-cc-add"]'); await p.fill('[data-testid="rs-cc-input"]', 'not-an-email'); await p.keyboard.press('Enter');
    ok((await p.locator('[data-testid="rs-error"]').innerText()) === 'That address doesn’t look right', 'a bad cc address is refused in words');
    await p.fill('[data-testid="rs-cc-input"]', 'accounts@example.com'); await p.keyboard.press('Enter');
    ok(await p.locator('[data-testid="rs-cc-row"]').count() === 1 && !(await p.locator('[data-testid="rs-error"]').isVisible()), 'a good cc address is added');

    // ---- the preview is the client's page, switched off
    const cv = p.locator('[data-testid="public-variation-card"]');
    ok((await cv.innerText()).includes('Extra door — rear entry') && (await p.locator('[data-testid="variation-price"]').innerText()) === '$320.00 + GST' && (await p.locator('[data-testid="variation-total"]').innerText()) === '$352.00 including GST', 'the preview shows the client’s page: title, price + GST and the GST-inclusive figure');
    ok(await p.locator('[data-testid="cv-approve"]').isDisabled() && await p.locator('[data-testid="cv-decline"]').isDisabled(), 'Approve and Decline are off in the preview');
    const cvb = await cv.boundingBox(); ok(cvb.x >= R.x && cvb.x + cvb.width <= R.x + R.width + 1, 'the client’s page fits its pane');

    // ---- SMS, AI draft
    await p.click('[data-testid="rs-sms-toggle"]');
    ok(await p.locator('[data-testid="rs-sms-phone"]').isVisible() && (await p.inputValue('[data-testid="rs-sms-text"]')).includes('$320.00 + GST ($352.00 incl. GST)'), 'the SMS tick opens the number and the text, price with GST');
    await p.click('[data-testid="rs-ai-draft"]'); await p.waitForTimeout(800);
    ok((await p.inputValue('[data-testid="rs-body"]')).includes('A quick one from site'), '"Draft with AI" rewrites the message');

    // ---- closing sends nothing; sending shows the sent state, then the row changes
    await p.click('[data-testid="rs-close"]'); await p.waitForTimeout(100);
    ok(!(await p.locator('#rsScrim').isVisible()) && await row('v1').getAttribute('data-status') === 'draft', '× closes it and nothing was sent');
    await p.click('[data-testid="variation-send-v1"]'); await p.waitForTimeout(200); await p.click('[data-testid="rs-send"]'); await p.waitForTimeout(800);
    ok(await p.locator('[data-testid="rs-sent"]').isVisible() && (await p.locator('#rsSentH').innerText()) === 'Variation sent!' && (await p.locator('#rsSentP').innerText()).includes('leanne.crowe@example.com'), 'Send → "Variation sent!" naming who it went to');
    ok((await p.inputValue('[data-testid="rs-link"]')).includes('/variation/') && await p.locator('[data-testid="rs-copy-link"]').isVisible(), 'the approval link with Copy, as on a quote');
    ok(!(await p.locator('#rsMain').isVisible()), 'once sent, the compose view is gone');
    await p.screenshot({ path: `${SHOTS}/var-rs-sent-${W}.png` });
    await p.click('[data-testid="rs-done"]'); await p.waitForTimeout(100);
    ok(!(await p.locator('#rsScrim').isVisible()) && await row('v1').getAttribute('data-status') === 'sent' && (await p.locator('[data-testid="variation-send-v1"]').innerText()) === 'Resend' && await p.locator('[data-testid="variation-edit-v1"]').count() === 0, 'Done returns to the job; the row is Sent, offers Resend and no pencil');

    // ---- resend uses the same window
    await p.click('[data-testid="variation-send-v2"]'); await p.waitForTimeout(200);
    ok((await p.locator('[data-testid="rs-title"]').innerText()) === 'Resend variation' && (await p.locator('[data-testid="rs-send"]').innerText()) === '✈ Resend variation to 1 person', 'Resend opens the same window, worded as a resend');
    await p.click('[data-testid="rs-edit"]'); await p.waitForTimeout(100);
    ok(!(await p.locator('#rsScrim').isVisible()), '"Edit the variation" leaves the window for the form');

    const sw = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    ok(sw[0] <= sw[1], 'no sideways scroll');
    ok(errs.length === 0, `no console errors${errs.length ? ': ' + errs.join(' | ').slice(0, 200) : ''}`);

    // ---- the client's page: light like the quote (proposed); today's dark page with ?page=today
    await p.click('[data-testid="variation-send-v3"]').catch(() => {}); await p.goto(U); await p.waitForTimeout(300); await p.click('[data-testid="variation-send-v1"]'); await p.waitForTimeout(200);
    const look = async () => p.evaluate(() => { const g = (sel) => getComputedStyle(document.querySelector(sel)); return [g('[data-testid="cv-page"]').backgroundColor, g('[data-testid="public-variation-card"]').color, g('[data-testid="cv-approve"]').backgroundColor]; });
    let lk = await look();
    ok(lk[0] === 'rgb(255, 255, 255)' && lk[1] === 'rgb(30, 28, 26)' && lk[2] === 'rgb(28, 138, 75)', 'the client’s page is light: white paper, dark text, the app’s green on Approve');
    await p.screenshot({ path: `${SHOTS}/var-rs-light-${W}.png` });
    await p.goto(U + '?page=today'); await p.waitForTimeout(300); await p.click('[data-testid="variation-send-v1"]'); await p.waitForTimeout(200);
    lk = await look();
    ok(lk[0] === 'rgb(15, 17, 21)', '?page=today shows the dark page the client gets today');

    // ---- a client with no email
    await p.goto(U + '?noemail=1'); await p.waitForTimeout(300); await p.click('[data-testid="variation-send-v1"]'); await p.waitForTimeout(200);
    ok((await p.locator('[data-testid="rs-check-head"]').innerText()) === '1 thing to check before it goes' && await p.locator('[data-testid="rs-fix-1"]').isVisible() && await p.locator('[data-testid="rs-send"]').isDisabled(), 'no client email: a red check with Fix, and Send is off');
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed · shots in ${SHOTS}`);
  process.exit(fail ? 1 : 0);
})();
