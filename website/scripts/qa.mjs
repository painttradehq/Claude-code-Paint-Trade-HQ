// Browser QA for the built site. Run `npm run build && npm run qa`.
// Checks every page at four widths: no horizontal overflow, no console errors, no broken internal links,
// header menu works on phones, chat box opens/closes and is closed on load, invite form validates.
// Writes screenshots to .qa/ (git-ignored). Exit code 1 on any failure.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, readdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 4399;
const BASE = `http://127.0.0.1:${PORT}`;
const PAGES = ['/', '/features', '/pricing', '/story', '/invite', '/404'];
const WIDTHS = [390, 768, 1024, 1440];
const OUT = '.qa';
mkdirSync(OUT, { recursive: true });

const failures = [];
const fail = (msg) => { failures.push(msg); console.log('  ✗', msg); };
const ok = (msg) => console.log('  ✓', msg);

// Serve dist/ with astro preview.
const server = spawn('npx', ['astro', 'preview', '--port', String(PORT), '--host', '127.0.0.1'], { stdio: 'ignore' });
for (let i = 0; i < 40; i++) {
  try { const r = await fetch(BASE + '/'); if (r.ok) break; } catch {}
  await sleep(500);
}

const browser = await chromium.launch();
try {
  const builtFiles = new Set(readdirSync('dist').filter((f) => f.endsWith('.html')).map((f) => '/' + f.replace(/\.html$/, '').replace(/^index$/, '')));

  for (const path of PAGES) {
    console.log(`\n${path}`);
    for (const width of WIDTHS) {
      const ctx = await browser.newContext({ viewport: { width, height: width < 700 ? 844 : 900 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(String(e)));
      // Ignore third-party fetch failures caused by sandboxed networks (fonts behind a proxy certificate).
      page.on('console', (m) => { if (m.type() === 'error' && !/ERR_CERT_AUTHORITY_INVALID|ERR_NAME_NOT_RESOLVED|fonts\.g/.test(m.text())) errors.push(m.text()); });
      page.on('requestfailed', () => {});
      const res = await page.goto(BASE + path, { waitUntil: 'networkidle' });
      if (path !== '/404' && (!res || res.status() !== 200)) fail(`${path}@${width}: HTTP ${res?.status()}`);

      // No horizontal overflow.
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      if (sw > cw) fail(`${path}@${width}: horizontal overflow (${sw} > ${cw})`); else ok(`${width}px: no overflow`);

      // Chat panel closed on load; opens and closes.
      const panelHidden = await page.$eval('#chat-panel', (el) => el.hidden && getComputedStyle(el).display === 'none');
      if (!panelHidden) fail(`${path}@${width}: chat panel visible on load`);
      await page.click('#chat-open');
      const open = await page.$eval('#chat-panel', (el) => !el.hidden && getComputedStyle(el).display !== 'none');
      if (!open) fail(`${path}@${width}: chat panel did not open`);
      await page.click('#chat-close');
      const closed = await page.$eval('#chat-panel', (el) => el.hidden);
      if (!closed) fail(`${path}@${width}: chat panel did not close`);

      // Phone menu.
      if (width < 860) {
        const navHidden = await page.$eval('#site-nav', (el) => getComputedStyle(el).display === 'none');
        if (!navHidden) fail(`${path}@${width}: nav should be collapsed on phones`);
        await page.click('#nav-toggle');
        const navOpen = await page.$eval('#site-nav', (el) => getComputedStyle(el).display !== 'none');
        if (!navOpen) fail(`${path}@${width}: menu did not open`); else ok(`${width}px: menu opens`);
        await page.click('#nav-toggle');
      }

      // Internal links resolve to built pages or known anchors/externals.
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
      for (const h of hrefs) {
        if (!h || h.startsWith('http') || h.startsWith('mailto:') || h.startsWith('#')) continue;
        const clean = h.split('#')[0].split('?')[0];
        if (clean && !builtFiles.has(clean)) fail(`${path}: link to ${h} has no built page`);
      }

      // Invite form: required fields block submit; honeypot present.
      if (path === '/invite') {
        const hasHoney = await page.$('input[name="website"]');
        if (!hasHoney) fail('invite: honeypot missing');
        await page.click('#invite-submit');
        const invalid = await page.$eval('#invite-form', (f) => !f.checkValidity());
        if (!invalid) fail('invite: empty form passed validation'); else ok(`${width}px: invite form validates`);
      }

      // Pricing: every price shows + GST and an inc-GST figure.
      if (path === '/pricing' && width === 1440) {
        const txt = await page.textContent('body');
        for (const [ex, inc] of [['$59', '$64.90'], ['$179', '$196.90'], ['$249', '$273.90']]) {
          if (!txt.includes(ex) || !txt.includes(inc)) fail(`pricing: missing ${ex} / ${inc}`);
        }
        ok('prices ex and inc GST present');
      }

      if (errors.length) fail(`${path}@${width}: console errors: ${errors.slice(0, 3).join(' | ')}`);
      await page.screenshot({ path: `${OUT}/${path === '/' ? 'home' : path.slice(1)}-${width}.png`, fullPage: true });
      await ctx.close();
    }
  }

  // Forbidden words and claims (knowledge file §12 and §9) must not appear on any page.
  const banned = [/\btenant\b/i, /\bSaaS\b/, /\bplatform\b/i, /AI-powered/i, /revolutionary/i, /seamless/i, /App Store app/i, /free plan/i, /\bannual\b/i, /Stripe/, /Twilio/, /Resend/, /Emergent/, /offline/i, /Xero connected/i, /\bMYOB\b(?! \.)/];
  const allow = [/no app store app/i, /no app store or play store app/i, /app store or play store apps/i, /is there a free plan\?/i, /no\. three plans/i, /annual price yet/i, /no annual price/i, /annual pricing/i, /xero or myob/i, /no myob/i, /not connected yet/i];
  for (const path of PAGES.filter((p) => p !== '/404')) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
    const txt = (await page.textContent('main')) || '';
    for (const re of banned) {
      const m = txt.match(re);
      if (m) {
        const around = txt.slice(Math.max(0, m.index - 60), m.index + 60).replace(/\s+/g, ' ');
        if (!allow.some((a) => a.test(around))) fail(`${path}: banned word "${m[0]}" near "…${around}…"`);
      }
    }
    await ctx.close();
  }
  ok('word check done');
} finally {
  await browser.close();
  server.kill();
}

console.log(`\n${failures.length ? failures.length + ' failure(s)' : 'All checks passed'}`);
process.exit(failures.length ? 1 : 0);
