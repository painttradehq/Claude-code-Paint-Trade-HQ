const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/estimate-builder-paint.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  const names = async () => p.$$eval('.agroup .aname', els => els.map(e => e.value));
  const nums = async () => p.$$eval('.agroup .anum .num', els => els.map(e => e.textContent.trim()));
  await p.goto(U); await p.waitForTimeout(700);

  // 1. areas move up and down from the number on the left
  ok('four areas, Kitchen first', (await names()).join('|') === 'Kitchen|Living Room|Hallway|Site & setup');
  ok('the first area cannot move up (arrow disabled)', await p.locator(T('area-num-a_kitchen') + ' [data-amove="up"]').isDisabled());
  await p.hover('.agroup[data-area="a_kitchen"]'); await p.waitForTimeout(150);
  ok('hovering an area shows its arrows', await p.locator(T('area-num-a_kitchen') + ' [data-amove="down"]').evaluate(e => getComputedStyle(e).visibility === 'visible'));
  await p.screenshot({ path: OUT + 'r88-areas-hover-1440.png', clip: { x: 0, y: 0, width: 1440, height: 700 } });
  await p.click(T('area-num-a_kitchen') + ' [data-amove="down"]'); await p.waitForTimeout(250);
  ok('▼ moves Kitchen below Living Room', (await names()).join('|') === 'Living Room|Kitchen|Hallway|Site & setup');
  ok('the numbers renumber 01 02 03 04', (await nums()).join(' ') === '01 02 03 04');
  await p.click('[data-amenu="a_kitchen"]'); await p.waitForTimeout(200);
  ok('the area menu has Move up and Move down', (await p.locator('#pop button[data-aact="up"]').count()) === 1 && (await p.locator('#pop button[data-aact="down"]').count()) === 1);
  await p.click('#pop button[data-aact="up"]'); await p.waitForTimeout(250);
  ok('Move up from the menu puts Kitchen back first', (await names()).join('|') === 'Kitchen|Living Room|Hallway|Site & setup');

  // 2. one product once, with coverage and sizes; the paint block
  await p.locator('.agroup[data-area="a_kitchen"] .lrow .ln .meta').first().click(); await p.waitForTimeout(350);
  ok('the line details panel opens', await p.locator('#panelwrap').isVisible());
  const chipNames = await p.$$eval('#panel .prodchip[data-plprod]:not([data-plprod=""]) .n', els => els.map(e => e.textContent.trim()));
  ok('every product is listed once (7 products, 7 chips, no repeats)', chipNames.length === 7 && new Set(chipNames).size === 7);
  const sub = await p.locator('#panel .prodchip.on .s').first().textContent();
  ok('a chip shows the coverage and the sizes, not one tin', /m²\/L/.test(sub) && /1L · 4L · 10L/.test(sub));
  const litres = await p.locator(T('paint-litres')).textContent();
  ok('the paint block shows litres worked out from the area', /^\d+(\.\d+)? L$/.test(litres.trim()) && parseFloat(litres) > 0);
  const formula = await p.locator(T('panel-paint') + ' .paintrow .s').textContent();
  ok('and says how: m² × coats ÷ coverage', /m² × 2 coats ÷ 16 m²\/L/.test(formula));
  await p.screenshot({ path: OUT + 'r88-panel-auto-1440.png' });
  await p.click('[data-paintmode="manual"]'); await p.waitForTimeout(250);
  ok('By hand shows a litres field with the auto value prefilled and focused', await p.locator('#pl_paintl').isVisible() && (await p.locator('#pl_paintl').inputValue()) === String(parseFloat(litres)) && await p.locator('#pl_paintl').evaluate(e => document.activeElement === e));
  await p.fill('#pl_paintl', '9'); await p.waitForTimeout(150);
  ok('typing 9 updates the litres at once', (await p.locator(T('paint-litres')).textContent()).trim() === '9 L');
  await p.fill('#pl_paintnote', 'porous render'); await p.waitForTimeout(100);
  await p.screenshot({ path: OUT + 'r88-panel-manual-1440.png' });
  await p.click('[data-paintmode="auto"]'); await p.waitForTimeout(250);
  ok('Auto brings the worked-out litres back and hides the field', (await p.locator(T('paint-litres')).textContent()).trim() === litres.trim() && (await p.locator('#pl_paintl').count()) === 0);
  await p.click('[data-paintmode="manual"]'); await p.fill('#pl_paintl', '9'); await p.waitForTimeout(100);
  await p.locator('#panel button:has-text("Save")').first().click(); await p.waitForTimeout(400);
  const meta = await p.locator('.agroup[data-area="a_kitchen"] .lrow .ln .meta').first().textContent();
  ok('the line summary names the litres after the colour', /Natural White · 9 L/.test(meta));

  // 3. the Paint card under the totals
  await p.locator(T('eb-paint')).scrollIntoViewIfNeeded();
  ok('the Paint card lists the products with litres, tins and cost', (await p.locator(T('paint-table') + ' tbody tr').count()) >= 2);
  const tins = await p.locator(T('paint-tins-p_dulux_ww')).textContent();
  ok('tins are fitted from the product\'s sizes (e.g. 1 × 10L + 1 × 4L)', /\d+ × \d+(\.\d+)?(m)?L/.test(tins));
  const totalBefore = await p.locator(T('eb-total')).textContent();
  ok('In my rates is the default: no Paint row in the totals', (await p.locator(T('eb-paint-row')).count()) === 0);
  await p.click('[data-paintcharge="1"]'); await p.waitForTimeout(250);
  const totalAfter = await p.locator(T('eb-total')).textContent();
  ok('Charge on top adds a Paint row and raises the total', (await p.locator(T('eb-paint-row')).count()) === 1 && totalAfter !== totalBefore);
  await p.screenshot({ path: OUT + 'r88-paint-card-1440.png', fullPage: true });
  await p.click('[data-tinedit="p_dulux_ww"]'); await p.waitForTimeout(200);
  ok('edit tins shows a count per size', (await p.locator('[data-tin="p_dulux_ww"]').count()) === 4);
  const costBefore = await p.locator(T('paint-row-p_dulux_ww') + ' td.r').last().textContent();
  const ten = p.locator('[data-tin="p_dulux_ww"][data-size="10L"]'); await ten.fill(String((+(await ten.inputValue()) || 0) + 1)); await ten.dispatchEvent('input'); await p.waitForTimeout(200);
  const costAfter = await p.locator(T('paint-row-p_dulux_ww') + ' td.r').last().textContent();
  ok('one more 10L tin raises that product\'s cost', costAfter !== costBefore);
  await p.click('[data-tinauto="p_dulux_ww"]'); await p.waitForTimeout(200);
  ok('Back to auto refits the tins', (await p.locator(T('paint-row-p_dulux_ww') + ' td.r').last().textContent()) === costBefore);

  // 4. the client sees one Paint line, never litres
  const go = p.locator('[data-go="client"], [data-go="doc"], button:has-text("Client view")').first();
  if (await go.count()) { await go.click(); await p.waitForTimeout(500);
    ok('client view: one Paint line with the price', (await p.locator(T('doc-paint-line')).count()) === 1);
    ok('client view: no litres anywhere', !/\d+(\.\d+)? L\b/.test(await p.locator('body').innerText()));
    await p.screenshot({ path: OUT + 'r88-client-1440.png', fullPage: true });
  } else console.log('no client view control found');
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 5. 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(600);
  ok('1024: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await p.hover('.agroup[data-area="a_living"]'); await p.waitForTimeout(100);
  ok('1024: the arrows sit left of the number without overlapping the name', await p.evaluate(() => { const n = document.querySelector('.agroup[data-area="a_living"] .anum').getBoundingClientRect(); const a = document.querySelector('.agroup[data-area="a_living"] .aname').getBoundingClientRect(); return n.right <= a.left + 1 && n.left >= 0; }));
  await p.locator('.agroup[data-area="a_kitchen"] .lrow .ln .meta').first().click(); await p.waitForTimeout(350);
  const pb = await p.locator('#panel').boundingBox();
  ok('1024: the panel fits and the paint block is inside it', pb && pb.width <= 1024 && await p.locator(T('panel-paint')).isVisible());
  await p.screenshot({ path: OUT + 'r88-panel-1024.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  await p.locator(T('eb-paint')).scrollIntoViewIfNeeded(); await p.waitForTimeout(100);
  ok('1024: the Paint card table fits its column', await p.evaluate(() => { const c = document.querySelector('[data-testid="eb-paint"]'); return c.scrollWidth <= c.clientWidth + 1; }));
  await p.screenshot({ path: OUT + 'r88-paint-card-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
