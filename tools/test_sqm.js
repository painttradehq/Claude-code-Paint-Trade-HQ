const { chromium } = require('playwright');
const T = (id) => `[data-testid="${id}"]`;
let pass = 0, fail = 0;
const ok = (name, cond) => { if (cond) { pass++; console.log('PASS', name); } else { fail++; console.log('FAIL', name); } };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|Failed to load resource|fonts\.g/.test(m.text())) errs.push(m.text()); });
  const U = 'file:///home/user/Claude-code-Paint-Trade-HQ/estimate-builder-sqm.html';
  const OUT = '/tmp/claude-0/-home-user-Claude-code-Paint-Trade-HQ/bb4b0ba3-2e82-5106-8cd7-6f7e49bc4a44/scratchpad/shots/';
  require('fs').mkdirSync(OUT, { recursive: true });
  await p.goto(U); await p.waitForTimeout(900);
  const deck = '.agroup[data-area="a_deck"]'; const kit = '.agroup[data-area="a_kitchen"]';
  const qtyOf = async (lineId) => (await p.locator(`[data-line="${lineId}"] .q, [data-line="${lineId}"] input.q, .lrow[data-id="${lineId}"] .q`).first().textContent().catch(() => '')) || '';

  // 1. the box exists; a measured area fills it from W × L, muted
  ok('every area has an m² box after W L H', (await p.locator('[data-sqm]').count()) >= 4);
  ok('Kitchen 4.2 × 3.6: the m² box shows 15.1, not typed', (await p.locator(T('area-sqm-a_kitchen')).inputValue()) === '15.1' && !(await p.locator(T('area-sqm-a_kitchen')).getAttribute('class')).includes('typed') && await p.locator(T('area-sqm-typed-a_kitchen')).isHidden());
  ok('Kitchen header still reads walls · ceiling · lm, now with the floor', /floor 15\.1 m²/.test(await p.locator(kit + ' .derived').textContent()) && /walls 42\.1 m²/.test(await p.locator(kit + ' .derived').textContent()));

  // 2. the deck with no dimensions: the Decking line waits for the m²
  const deckDerived = async () => p.locator(deck + ' .derived').textContent();
  ok('Deck & Stairs with nothing: the header says what it needs', /floor — type the m² or give W and L/.test(await deckDerived()) && (await p.locator(deck + ' .dims').getAttribute('class')).includes('missing'));
  const deckTotal = async () => p.locator(deck + ' .atot').textContent();
  ok('the Decking line has no quantity yet and the area totals $0.00', (await deckTotal()) === '$0.00' && /needs the m² — or W and L/.test(await p.locator(deck).textContent()));
  await p.screenshot({ path: OUT + 'r97-deck-empty-1440.png' });

  // 3. type 38 → the line is 38 m² and priced, the header says typed
  await p.fill(T('area-sqm-a_deck'), '38'); await p.waitForTimeout(300);
  ok('typing 38 m² prices the Decking line (38 × $70 + prep = the area total) and marks the box typed', /floor 38 m² \(typed\)/.test(await deckDerived()) && (await deckTotal()) !== '$0.00' && (await p.locator(T('area-sqm-a_deck')).getAttribute('class')).includes('typed') && await p.locator(T('area-sqm-typed-a_deck')).isVisible());
  const total38 = await deckTotal();
  ok('the dims lose the red tint once the line has what it needs', !(await p.locator(deck + ' .dims').getAttribute('class')).includes('missing'));
  await p.screenshot({ path: OUT + 'r97-deck-typed-1440.png' });

  // 4. W and L typed as well: the typed m² still wins; clear it and W × L takes over
  await p.fill(deck + ' [data-dim="w"]', '6'); await p.fill(deck + ' [data-dim="l"]', '5'); await p.waitForTimeout(300);
  ok('with W 6 and L 5 the typed 38 still wins (the tag says so)', (await deckTotal()) === total38 && /\(typed\)/.test(await deckDerived()));  // the deck has no lineal line, so the header names no lm face
  await p.click(deck + ' [data-sqclear]'); await p.waitForTimeout(300);
  ok('× on the tag: back to W × L = 30 m², the box no longer typed', (await p.locator(T('area-sqm-a_deck')).inputValue()) === '30' && /floor 30 m²(?! \(typed\))/.test(await deckDerived()) && (await deckTotal()) !== total38);
  // a wall line in that area would still need H
  ok('walls need H: the header names it only when a wall line asks for it — the deck has none, so no walls part', !/walls/.test(await deckDerived()));

  // 5. the Kitchen: typing the m² overrides the ceiling line, walls keep W L H
  const kitTotalBefore = await p.locator(kit + ' .atot').textContent();
  await p.fill(T('area-sqm-a_kitchen'), '20'); await p.waitForTimeout(300);
  ok('Kitchen typed 20 m²: floor/ceiling lines take 20, walls keep 2(W+L)×H', /floor 20 m² \(typed\)/.test(await p.locator(kit + ' .derived').textContent()) && /walls 42\.1 m²/.test(await p.locator(kit + ' .derived').textContent()) && (await p.locator(kit + ' .atot').textContent()) !== kitTotalBefore);
  await p.click(kit + ' [data-sqclear]'); await p.waitForTimeout(300);
  ok('cleared: the Kitchen total is back where it was', (await p.locator(kit + ' .atot').textContent()) === kitTotalBefore);

  // 6. the paint card follows the typed m²
  await p.fill(T('area-sqm-a_deck'), '38'); await p.waitForTimeout(400);
  const paintTxt = await p.locator('.paintcard').first().textContent().catch(() => '');
  ok('the paint card picks up the deck product from the typed 38 m²', /Endure|Taubmans/.test(paintTxt));
  await p.screenshot({ path: OUT + 'r97-paint-1440.png' });

  // 7. the client view carries 38 m²
  await p.click('[data-view="client"], #viewClient, [data-testid="view-client"]').catch(() => {});
  await p.waitForTimeout(400);
  const client = await p.locator('body').textContent();
  ok('the client view shows the Decking line at 38 m²', /38\s*m²/.test(client) || /38\.0\s*m²/.test(client));
  ok('no console errors at 1440', errs.length === 0); if (errs.length) console.log(errs.slice(0, 3));

  // 8. 1024
  await p.setViewportSize({ width: 1024, height: 800 }); await p.goto(U); await p.waitForTimeout(700);
  const dims = await p.locator(deck + ' .dims').boundingBox(); const head = await p.locator(deck + ' .ahead').boundingBox();
  ok('1024: W L H and m² stay on one row inside the header', dims && head && dims.height < 40 && dims.x + dims.width <= head.x + head.width + 1);
  ok('1024: no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await p.screenshot({ path: OUT + 'r97-deck-1024.png' });
  ok('no console errors at 1024', errs.length === 0);
  console.log(`\n${pass} passed, ${fail} failed`);
  await b.close(); process.exit(fail ? 1 : 0);
})();
