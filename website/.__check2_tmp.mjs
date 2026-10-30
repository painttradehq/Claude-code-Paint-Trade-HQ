import { chromium } from 'playwright';
const b = await chromium.launch();
const lum = (c) => { const [r,g,bb] = c.match(/\d+/g).map(Number).map(v => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);}); return 0.2126*r+0.7152*g+0.0722*bb; };
const ratio = (a,bg) => { const l1=lum(a), l2=lum(bg); return ((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05)).toFixed(2); };
for (const vw of [390, 1280]) {
  const p = await b.newPage({ viewport: { width: vw, height: 900 } });
  const errors = [];
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await p.goto('http://localhost:4395/painters', { waitUntil: 'load' });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  const badges = await p.$$eval('#listings .listing', els => els.map(e => ({ name: e.querySelector('h3').textContent.trim(), pills: Array.from(e.querySelectorAll('.pill')).map(x => x.textContent.trim()), hidden: e.hidden })));
  const buttons = await p.$$eval('#state-filter .filter__btn', els => els.map(e => ({ t: e.textContent.trim(), on: e.classList.contains('is-on'), pressed: e.getAttribute('aria-pressed') })));
  await p.click('#state-filter .filter__btn[data-state="VIC"]');
  const afterClick = await p.$$eval('#listings .listing', els => els.filter(e => !e.hidden).map(e => e.querySelector('h3').textContent.trim()));
  const hash = await p.evaluate(() => location.hash);
  await p.goto('http://localhost:4395/painters#nsw', { waitUntil: 'load' });
  const fromHash = await p.$$eval('#listings .listing', els => els.filter(e => !e.hidden).map(e => e.querySelector('h3').textContent.trim()));
  const onBtn = await p.$$eval('#state-filter .filter__btn.is-on', els => els.map(e => e.textContent.trim()));
  // contrast of disclosure note on home
  await p.goto('http://localhost:4395/', { waitUntil: 'load' });
  const notes = await p.$$eval('.sample-note', els => els.map(e => { const sec = e.closest('section'); return { text: e.textContent.trim().slice(0,40), color: getComputedStyle(e).color, bg: getComputedStyle(sec).backgroundColor, size: getComputedStyle(e).fontSize }; }));
  const pill = await p.$eval('.quote__sample', e => { const sec = e.closest('section'); return { color: getComputedStyle(e).color, bg: getComputedStyle(e).backgroundColor, secbg: getComputedStyle(sec).backgroundColor, size: getComputedStyle(e).fontSize }; });
  const homeOverflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  await p.goto('http://localhost:4395/painters/harbourline-painting', { waitUntil: 'load' });
  const slugOverflow = await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  const slugPill = await p.$eval('.profile__head .pill', e => ({ text: e.textContent.trim(), w: e.getBoundingClientRect().width, vis: getComputedStyle(e).visibility }));
  console.log(JSON.stringify({ vw, overflow, homeOverflow, slugOverflow, errors, badges, buttons, afterClick, hash, fromHash, onBtn, notes: notes.map(n => ({...n, ratio: ratio(n.color, n.bg)})), pill: {...pill, ratio: ratio(pill.color, pill.bg)}, slugPill }, null, 1));
  await p.close();
}
await b.close();
