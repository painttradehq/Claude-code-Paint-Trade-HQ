// CRM › Messages setup — the page takes the CRM hub's frame (kit.tsx S.page: max 1400, centred) instead of its own 1100 cap.
// Run: NODE_PATH=$(npm root -g) node tools/test_crm_messages_setup_width.js
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const SHOTS = process.env.SHOTS || path.join(process.env.HOME || '/tmp', 'shots'); fs.mkdirSync(SHOTS, { recursive: true });
const U = 'file://' + path.resolve('crm-messages-setup-width.html');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok  ', m); } else { fail++; console.log('  FAIL', m); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  // 1440 then 1024, then 1500 — the width of the window in Josh's screenshot
  for (const [W, H] of [[1440, 900], [1024, 768], [1500, 960]]) {
    console.log(`\n== ${W} × ${H} ==`);
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const box = (sel) => p.locator(sel).first().boundingBox();
    for (const nav of ['', 'nav=open']) {
      const label = nav ? 'menu open' : 'icon rail';
      await p.goto(U + (nav ? '?' + nav : '')); await p.waitForTimeout(200);
      const area = await box('[data-testid="content-area"]'); const m = await box('main');
      const want = Math.min(1400, area.width);
      ok(Math.abs(m.width - want) <= 1, `${label}: the page is ${Math.round(m.width)} px wide — the hub's frame (the lesser of 1400 and the space beside the menu, ${Math.round(area.width)})`);
      ok(Math.abs((m.x - area.x) - (area.x + area.width - m.x - m.width)) <= 1, `${label}: it sits in the middle of that space`);
      const sw = await p.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth, document.querySelector('main').scrollWidth, document.querySelector('main').clientWidth]);
      ok(sw[0] <= sw[1] && sw[2] <= sw[3] + 1, `${label}: nothing runs off sideways`);
      // today, for comparison
      await p.goto(U + '?today=1' + (nav ? '&' + nav : '')); await p.waitForTimeout(150);
      const t = await box('main');
      ok(t.width <= 1100.5 && (area.width <= 1100 || m.width > t.width), `${label}: today it stops at ${Math.round(t.width)} px${area.width > 1100 ? ` — ${Math.round(m.width - t.width)} px narrower than the hub's frame` : ' (the window is too small for the cap to show)'}`);
    }
    await p.goto(U); await p.waitForTimeout(200);
    const m = await box('main'); const inner = m.width - 64;
    for (const [id, name] of [['comms-inbox', 'Connected inbox'], ['comms-sms', 'SMS number'], ['comms-automations', 'Automations'], ['comms-templates', 'Templates'], ['comms-ai', 'AI assistant'], ['comms-links', 'Links & signature']]) {
      const s = await box(`[data-testid="${id}"]`);
      if (id === 'comms-inbox' || id === 'comms-links') ok(Math.abs(s.width - inner) <= 1 && s.x >= m.x + 31, `${name} fills the page from margin to margin (${Math.round(s.width)} px)`);
      else if (Math.abs(s.width - inner) > 1) ok(false, `${name} fills the page`);
    }
    const top = await box('[data-testid="comms-page-top"]'); const acts = await box('[data-testid="comms-actions"]'); const save = await box('[data-testid="comms-save"]');
    ok(save.x + save.width <= m.x + m.width - 31 && acts.height < 48, 'Back to CRM, Open inbox and Save changes sit on one row, inside the page');
    ok(W < 1100 || acts.y < top.y + 40, 'they stay beside the title when there is room');
    const dns = await box('[data-testid="dns-table"]'); const long = await p.locator('[data-testid="dns-long"]').evaluate(e => [e.scrollWidth > e.clientWidth, e.getBoundingClientRect().right]);
    ok(dns.x + dns.width <= m.x + m.width - 31 && long[1] <= dns.x + dns.width, `the DNS table stays inside its card; the long key is cut with … (${long[0] ? 'cut' : 'fits'})`);
    const tg = await box('[data-testid="twilio-grid"]'); const tpl = await box('[data-testid="comms-tpl-editor"]'); const two = await box('[data-testid="ai-two"]');
    ok(tg.x + tg.width <= m.x + m.width - 31 && tpl.x + tpl.width <= m.x + m.width - 31 && two.x + two.width <= m.x + m.width - 31, 'the Twilio fields, the template editor and the two AI notes stay inside their cards');
    const jump = await box('[data-testid="comms-jump"]'); ok(jump.height < 50, 'the six section links fit on one line');
    await p.screenshot({ path: `${SHOTS}/crm-setup-${W}.png` });
    await p.goto(U + '?today=1'); await p.waitForTimeout(150); await p.screenshot({ path: `${SHOTS}/crm-setup-today-${W}.png` });
    await p.close();
  }
  await b.close();
  console.log(`\n${pass} passed, ${fail} failed · shots in ${SHOTS}`);
  process.exit(fail ? 1 : 0);
})();
