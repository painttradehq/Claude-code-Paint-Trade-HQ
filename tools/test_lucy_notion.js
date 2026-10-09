// Lucy — direction E (the face, verb rows, source chips) — Playwright checks at 1440 then 1024.
// Run: NODE_PATH=$(npm root -g) node tools/test_lucy_notion.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('lucy-chat-notion.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const W of [1440, 1024]) {
    console.log(`\n== ${W} ==`);
    const p = await b.newPage({ viewport: { width: W, height: 900 } });
    const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/font|ERR_/.test(m.text())) errs.push(m.text()); });
    await p.goto(U); await p.waitForTimeout(500);
    ok(await p.locator('#tcBubble .face.idle svg').count() === 1 && !(await p.locator('#tcBubble > svg').isVisible()), 'the bubble shows the face, not the chat icon');
    await p.click('#tcBubble'); await p.waitForTimeout(300);
    ok(await p.locator('#tc').isVisible(), 'box opens');
    ok(await p.locator('[data-testid="lucy-face-head"].idle').count() === 1 && await p.locator('#tcAv > .l').count() === 0, 'header avatar is the face (idle), no L');
    ok(await p.locator('.tc-head .tools button:visible').count() === 2, 'header has two buttons only (⋯ and ×)');
    ok(!(await p.locator('#tcSub').isVisible()) && !(await p.locator('.tc-tabs').first().isVisible()), 'no business subtitle, no tab bar');
    ok(await p.locator('[data-testid="lucy-face-welcome"]').isVisible() && (await p.locator('[data-testid="ai-welcome"] .big').innerText()) === 'Hi Josh, what do you want to know?', 'welcome: face + one-line greeting');
    ok(!(await p.locator('.welcome .hey').isVisible()), 'no sub-line');
    ok(await p.locator('[data-starter]').count() === 4 && await p.locator('[data-fill]').count() === 2 && await p.locator('.picks button svg').count() === 6, 'six verb rows with icons: four starters + Remind me… + I’ve got an idea');
    const rows = await p.locator('.picks button').evaluateAll(els => els.map(e => e.getBoundingClientRect()));
    ok(rows.every((r, i) => i === 0 || Math.abs(r.x - rows[0].x) < 1 && r.y > rows[i - 1].y), 'rows stack, one per line');
    ok(!(await p.locator('#tcWhat').isVisible()) && await p.locator('[data-testid="ai-what"]').isVisible(), '"What can Lucy do?" link present, paragraph hidden');
    ok(!(await p.locator('#tcCtx').isVisible()), 'usage bar hidden by default');
    const ta = await p.locator('#tcInput').boundingBox();
    ok(ta && ta.height >= 60, `big composer (${ta && Math.round(ta.height)} px tall)`);
    ok(await p.locator('[data-testid="ai-hints"]').isVisible(), 'Enter / Shift+Enter hints show while the box has focus');
    await p.screenshot({ path: `${SHOTS}/lucy-e-welcome-${W}.png` });
    // fill rows
    await p.click('[data-fill="remind"]'); await p.waitForTimeout(100);
    ok((await p.inputValue('#tcInput')) === 'Remind me to ' && await p.locator('[data-testid="lucy-face-head"].listen').count() === 1, '"Remind me…" fills the box and Lucy listens (eyes open)');
    await p.fill('#tcInput', ''); await p.dispatchEvent('#tcInput', 'input'); await p.waitForTimeout(50);
    ok(await p.locator('[data-testid="lucy-face-head"].idle').count() === 1, 'empty box → idle face again');
    await p.click('[data-fill="idea"]'); await p.waitForTimeout(100);
    ok((await p.inputValue('#tcInput')).startsWith('I’ve got an idea'), '"I’ve got an idea" fills the box');
    await p.fill('#tcInput', ''); await p.dispatchEvent('#tcInput', 'input');
    // starter → thinking → done → idle
    await p.click('[data-starter="quiet"]'); await p.waitForTimeout(200);
    ok(await p.locator('[data-testid="ai-typing"] .face.think').count() === 1 && await p.locator('[data-testid="lucy-face-head"].think').count() === 1, 'while Lucy thinks: thinking face beside the dots and in the header');
    await p.waitForTimeout(700);
    ok(await p.locator('[data-testid="ai-msg-assistant"]').count() === 1 && await p.locator('[data-testid="lucy-face-head"].done').count() === 1, 'answer lands: header face smiles');
    ok(await p.locator('.airow .sav .face').count() === 1, 'Lucy’s face sits beside her bubble');
    const chips = await p.locator('[data-testid="ai-sources"] code').allInnerTexts();
    ok(chips.length === 2 && chips.join('|') === 'Estimates|Messages' && await p.locator('[data-testid="ai-copy"]').isVisible(), `sources as chips (${chips.join(' · ')}) + Copy`);
    await p.click('[data-testid="ai-copy"]'); await p.waitForTimeout(100);
    ok((await p.locator('[data-testid="ai-copy"]').innerText()) === 'Copied', 'Copy says Copied');
    await p.waitForTimeout(1400);
    ok(await p.locator('[data-testid="lucy-face-head"].idle').count() === 1, 'then idle again');
    await p.screenshot({ path: `${SHOTS}/lucy-e-chat-${W}.png` });
    await p.fill('#tcInput', 'any new leads?'); await p.keyboard.press('Enter'); await p.waitForTimeout(1000);
    ok(await p.locator('[data-testid="ai-msg-user"]').count() === 2 && await p.locator('[data-testid="ai-msg-assistant"]').count() === 2, 'Enter sends, Lucy answers');
    // menu, help, history, new chat, attach, setup — as the minimal box
    await p.click('#tcMore'); await p.waitForTimeout(150);
    ok(await p.locator('#tcMenu').isVisible() && await p.locator('#tcMenu button').count() === 5, '⋯ opens the menu: New chat · Past chats · Help · What Lucy can do · Lucy’s setup');
    await p.click('[data-testid="tc-menu-help"]'); await p.waitForTimeout(250);
    ok((await p.locator('#tcTitle').innerText()) === 'Help' && await p.locator('#tcBack').isVisible(), 'Help mode: title Help, back link');
    await p.click('#tcBack'); await p.waitForTimeout(250);
    ok((await p.locator('#tcTitle').innerText()) === 'Lucy' && await p.locator('[data-testid="lucy-face-head"]').count() === 1, 'back to Lucy, face back in the header');
    await p.click('#tcMore'); await p.click('[data-testid="tc-menu-history"]'); await p.waitForTimeout(200);
    ok((await p.locator('#tcBody').innerText()).toLowerCase().includes('chats with lucy'), 'Past chats from the menu');
    await p.click('#tcMore'); await p.click('[data-testid="tc-menu-new"]'); await p.waitForTimeout(200);
    ok(await p.locator('[data-testid="ai-welcome"]').isVisible() && await p.locator('.picks button').count() === 6, 'New chat from the menu → six rows again');
    await p.click('[data-testid="ai-what"]'); await p.waitForTimeout(150);
    ok(await p.locator('#tcWhat').isVisible(), '"What can Lucy do?" reveals the explanation');
    await p.click('[data-testid="ai-what"]'); await p.waitForTimeout(150);
    await p.click('#tcPlus'); await p.waitForTimeout(150);
    ok(await p.locator('#tcAmenu').isVisible() && await p.locator('#tcCam').isVisible(), '+ opens Take a photo / Attach a photo');
    await p.click('#tcFile'); await p.waitForTimeout(150);
    ok(await p.locator('#tcAttach').isVisible() && !(await p.locator('#tcAmenu').isVisible()), 'attach chip shows, menu closes');
    await p.click('#tcMore'); await p.click('[data-testid="tc-menu-setup"]'); await p.waitForTimeout(250);
    ok(await p.locator('#pop').isVisible(), 'Lucy’s setup opens from the menu');
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    await p.goto(U + '?usage=high'); await p.waitForTimeout(500); await p.click('#tcBubble'); await p.waitForTimeout(300);
    ok(await p.locator('#tcCtx').isVisible() && (await p.locator('#tcCtxTxt').innerText()).includes('nearly used up'), 'usage line appears only when the allowance is nearly gone');
    await p.goto(U + '?mood=error'); await p.waitForTimeout(500);
    ok(await p.locator('#tcBubble .face.error').count() === 1, '?mood=error: the face falls apart on the bubble (allowance used up / no key)');
    await p.click('#tcBubble'); await p.waitForTimeout(300);
    ok(await p.locator('[data-testid="lucy-face-head"].error').count() === 1, '…and in the header');
    await p.screenshot({ path: `${SHOTS}/lucy-e-error-${W}.png` });
    ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'no horizontal scroll');
    ok(errs.length === 0, 'no console errors' + (errs.length ? ': ' + errs.join(' | ').slice(0, 300) : ''));
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
})();
