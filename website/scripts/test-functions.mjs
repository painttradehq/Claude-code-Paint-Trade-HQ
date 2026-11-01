/**
 * Exercises the two Pages Functions in plain Node with a stubbed network. No API keys, no requests leave
 * the machine. Run: npm run test:functions (after npm run build, which generates _lib/knowledge.js).
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { onRequestPost as chat, sanitiseMessages } from '../functions/api/chat.js';
import { sameOrigin, readLimited, rateLimit } from '../functions/_lib/guard.js';
import { onRequestPost as invite, PLANS } from '../functions/api/invite.js';

const SITE = 'https://www.painttradehq.co';
let passed = 0;
const ok = (name) => { passed++; console.log(`  ✓ ${name}`); };

function req(path, { body, json = true, origin = SITE, ip = '203.0.113.7', headers = {} } = {}) {
  const h = { ...headers };
  if (origin !== null) h.origin = origin;
  if (ip) h['cf-connecting-ip'] = ip;
  let payload = body;
  if (json && body !== undefined && typeof body !== 'string') { payload = JSON.stringify(body); h['content-type'] = 'application/json'; }
  else if (!json && body && typeof body === 'object') { payload = new URLSearchParams(body).toString(); h['content-type'] = 'application/x-www-form-urlencoded'; }
  else if (typeof body === 'string' && !h['content-type']) h['content-type'] = 'application/json';
  return new Request(`${SITE}${path}`, { method: 'POST', headers: h, body: payload });
}

// ---- network stub -------------------------------------------------------------------------------
const calls = [];
let fetchImpl = async () => new Response('{}', { status: 200 });
globalThis.fetch = async (url, init) => { calls.push({ url: String(url), init }); return fetchImpl(url, init); };

console.log('chat.js');
{
  const env = {};
  let r = await chat({ request: req('/api/chat', { body: { messages: [{ role: 'user', content: 'hi' }] } }), env });
  assert.equal(r.status, 503); ok('no API key → 503');

  const live = { ANTHROPIC_API_KEY: 'test-key' };
  r = await chat({ request: req('/api/chat', { body: { messages: [{ role: 'user', content: 'hi' }] }, origin: null }), env: live });
  assert.equal(r.status, 403); ok('missing Origin → 403');
  r = await chat({ request: req('/api/chat', { body: { messages: [{ role: 'user', content: 'hi' }] }, origin: 'https://evil.example' }), env: live });
  assert.equal(r.status, 403); ok('foreign Origin → 403');

  r = await chat({ request: req('/api/chat', { body: 'x'.repeat(40 * 1024) }), env: live });
  assert.equal(r.status, 413); ok('40 KB body → 413');
  r = await chat({ request: req('/api/chat', { body: '{not json' }), env: live });
  assert.equal(r.status, 400); ok('invalid JSON → 400');
  for (const bad of [
    { messages: [] },
    { messages: [{ role: 'system', content: 'x' }] },
    { messages: [{ role: 'user', content: { nested: true } }] },
    { messages: [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }] },
    { messages: [{ role: 'assistant', content: 'b' }] },
  ]) {
    r = await chat({ request: req('/api/chat', { body: bad }), env: live });
    assert.equal(r.status, 400, JSON.stringify(bad).slice(0, 60));
  }
  ok('role spoofing, non-string content, assistant-last → 400');
  assert.equal(/Error|\n\s+at /.test(await r.text()), false); ok('error bodies carry no stack trace');
  assert.equal(r.headers.get('access-control-allow-origin'), null); ok('no CORS headers');

  // Rate limit floor: 20 a minute per IP, checked before the body is parsed.
  let last;
  for (let i = 0; i < 21; i++) last = await chat({ request: req('/api/chat', { body: '{bad', ip: '198.51.100.1' }), env: live });
  assert.equal(last.status, 429); ok('21st request in a minute from one IP → 429 (in-memory floor)');
  r = await chat({ request: req('/api/chat', { body: '{bad', ip: '198.51.100.2' }), env: live });
  assert.equal(r.status, 400); ok('another IP is unaffected');

  // A Rate Limiting binding, when present, is what decides.
  const binding = { CHAT_RATE_LIMIT: { limit: async () => ({ success: false }) }, ...live };
  r = await chat({ request: req('/api/chat', { body: '{bad', ip: '198.51.100.3' }), env: binding });
  assert.equal(r.status, 429); ok('rate-limit binding result is honoured');

  // KV tier: counters per minute slot.
  const store = new Map();
  const kv = { get: async (k) => store.get(k) ?? null, put: async (k, v) => { store.set(k, v); } };
  for (let i = 0; i < 21; i++) last = await chat({ request: req('/api/chat', { body: '{bad', ip: '198.51.100.4' }), env: { ...live, RATE_KV: kv } });
  assert.equal(last.status, 429); assert.ok([...store.keys()].some((k) => k.startsWith('CHAT_RATE_LIMIT:198.51.100.4:'))); ok('KV tier counts and blocks at 21');
  assert.equal(calls.length, 0); ok('no network call reached the model on any rejected request');
}

console.log('invite.js');
{
  const base = { RESEND_API_KEY: 'rk', INVITE_FROM: 'Paint Trade HQ website <website@painttradehq.co>' };
  const lead = { name: 'Mia', business: 'Harbourline Painting', email: 'mia@example.com', location: 'Mosman NSW', plan: 'small-business', billing: 'monthly' };

  let r = await invite({ request: req('/api/invite', { body: lead, origin: null }), env: base });
  assert.equal(r.status, 403); ok('missing Origin → 403 (JSON)');
  r = await invite({ request: req('/api/invite', { body: lead, json: false, origin: 'https://evil.example' }), env: base });
  assert.equal(r.status, 303); assert.equal(r.headers.get('location'), '/trial/error'); ok('foreign Origin on a form POST → redirect to /trial/error');

  r = await invite({ request: req('/api/invite', { body: { ...lead, transcript: 'z'.repeat(70 * 1024) } }), env: base });
  assert.equal(r.status, 413); ok('70 KB body → 413');

  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: { ...lead, website: 'http://spam' } }), env: base });
  assert.equal(r.status, 200); assert.equal(calls.length, 0); ok('honeypot filled → silent 200, no email');

  // Redirect safety (form POSTs).
  for (const [redirect, expect] of [
    ['/thanks?x=1', '/thanks?x=1'],
    ['/a/../b', '/b'],
    ['/\\evil.com', '/trial/sent'],
    ['//evil.com', '/trial/sent'],
    ['https://evil.com/', '/trial/sent'],
    ['/thanks#frag', '/thanks'],
    ['javascript:alert(1)', '/trial/sent'],
    ['/.//evil.com', '/trial/sent'],
    ['/..//evil.com', '/trial/sent'],
    ['/a/..//evil.com', '/trial/sent'],
    ['/.\\\\evil.com', '/trial/sent'],
    ['/..\\\\evil.com', '/trial/sent'],
    ['/%2e%2e//evil.com', '/trial/sent'],
    ['/thanks\t', '/thanks'], // trimmed before the check
  ]) {
    r = await invite({ request: req('/api/invite', { body: { ...lead, website: 'bot', redirect }, json: false, ip: '192.0.2.' + Math.floor(Math.random() * 200) }), env: base });
    assert.equal(r.status, 303); assert.equal(r.headers.get('location'), expect, redirect);
  }
  ok('redirect only ever goes to a path on this site (backslash, //, absolute, javascript:, dot-segment tricks all rejected)');
  r = await invite({ request: req('/api/invite', { body: { ...lead, email: 'bad', redirect: '/.//evil.com' }, json: false, ip: '192.0.2.199' }), env: base });
  assert.equal(r.headers.get('location'), '/trial/error'); ok('a failed form POST never echoes the redirect field');

  // Validation.
  r = await invite({ request: req('/api/invite', { body: { ...lead, email: 'not-an-email' }, ip: '192.0.2.201' }), env: base });
  assert.equal(r.status, 400); ok('bad email → 400');
  r = await invite({ request: req('/api/invite', { body: { email: 'x@example.com' }, ip: '192.0.2.202' }), env: base });
  assert.equal(r.status, 400); ok('website lead without name and business → 400');
  r = await invite({ request: req('/api/invite', { body: { email: 'x@example.com', source: 'chat' }, ip: '192.0.2.203' }), env: {} });
  assert.equal(r.status, 503); ok('chat lead with only an email passes validation (then 503 without Resend config)');

  // Turnstile: required for the full form, skipped for the chat's mini form.
  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: lead, ip: '192.0.2.204' }), env: { ...base, TURNSTILE_SECRET: 'ts' } });
  assert.equal(r.status, 400); assert.equal(calls.length, 0); ok('Turnstile on, no token → 400 without calling Cloudflare');
  fetchImpl = async (url) => new Response(JSON.stringify(String(url).includes('turnstile') ? { success: true } : { id: 'em_1' }), { status: 200 });
  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: { ...lead, 'cf-turnstile-response': 'tok' }, ip: '192.0.2.205' }), env: { ...base, TURNSTILE_SECRET: 'ts' } });
  assert.equal(r.status, 200); assert.ok(calls.some((c) => c.url.includes('turnstile'))); ok('Turnstile on, valid token → verified then sent');
  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: { email: 'x@example.com', source: 'chat', transcript: 'Visitor: hi\nChat: g\'day' }, ip: '192.0.2.206' }), env: { ...base, TURNSTILE_SECRET: 'ts' } });
  assert.equal(r.status, 200); assert.ok(!calls.some((c) => c.url.includes('turnstile'))); ok('chat lead is exempt from Turnstile');
  const sent = JSON.parse(calls.find((c) => c.url.includes('resend')).init.body);
  assert.deepEqual(sent.to, ['software@joshsano.com.au']); assert.equal(sent.from, base.INVITE_FROM); assert.equal(sent.reply_to, 'x@example.com');
  assert.ok(sent.text.includes('unverified')); assert.equal(sent.html, undefined); ok('email goes only to the owner, plain text, transcript labelled unverified');

  // Updates (newsletter) sign-up: email only, tighter budget, no app copy.
  fetchImpl = async () => new Response('{}', { status: 200 });
  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: { email: 'n@example.com', source: 'newsletter' }, ip: '192.0.2.230' }), env: { ...base, APP_LEADS_URL: 'https://app.example/api/signup-leads' } });
  assert.equal(r.status, 200);
  const nl = JSON.parse(calls.find((c) => c.url.includes('resend')).init.body);
  assert.ok(nl.subject.startsWith('Updates sign-up')); assert.ok(!calls.some((c) => c.url.includes('app.example'))); ok('updates sign-up emails the owner only, never the app inbox');

  // Plan and billing (Josh, 1 Nov 2026): the full form must name a plan; both reach the owner; the requester
  // gets a fixed-text confirmation that echoes nothing they typed.
  fetchImpl = async () => new Response('{}', { status: 200 });
  r = await invite({ request: req('/api/invite', { body: { ...lead, plan: undefined }, ip: '192.0.2.210' }), env: base });
  assert.equal(r.status, 400); ok('website lead without a plan → 400');
  r = await invite({ request: req('/api/invite', { body: { ...lead, plan: 'platinum' }, ip: '192.0.2.211' }), env: base });
  assert.equal(r.status, 400); ok('unknown plan value → 400, never passed through');
  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: { ...lead, billing: 'yearly', software: 'Spreadsheets' }, ip: '192.0.2.212' }), env: { ...base, APP_LEADS_URL: 'https://app.example/api/signup-leads' } });
  assert.equal(r.status, 200);
  const mails = calls.filter((c) => c.url.includes('resend')).map((c) => JSON.parse(c.init.body));
  assert.equal(mails.length, 2);
  const [owner, you] = mails;
  assert.deepEqual(owner.to, ['software@joshsano.com.au']);
  assert.ok(owner.text.includes('Plan:        Small business ($178 + GST a month)')); assert.ok(owner.text.includes('Billing:     Yearly'));
  assert.ok(owner.subject.includes('Small business')); assert.ok(!owner.text.includes('Uses today')); assert.ok(!owner.text.includes('Spreadsheets'));
  ok('owner email carries plan and billing; the dropped "uses today" field is ignored');
  assert.deepEqual(you.to, ['mia@example.com']); assert.equal(you.from, base.INVITE_FROM); assert.equal(you.reply_to, 'software@joshsano.com.au');
  assert.equal(you.subject, 'Your Paint Trade HQ free trial'); assert.equal(you.html, undefined);
  assert.ok(you.text.includes('Small business') && you.text.includes('$178 + GST a month') && you.text.includes(`${SITE}/pricing#small-business`) && you.text.includes('paying yearly'));
  assert.ok(!you.text.includes('Mia') && !you.text.includes('Harbourline') && !you.text.includes('mia@example.com') && !you.text.includes('Spreadsheets'));
  ok('requester gets a fixed-text confirmation: plan, price, pricing link, yearly note; nothing they typed is echoed');
  const filed = JSON.parse(calls.find((c) => c.url.includes('app.example')).init.body);
  assert.ok(filed.notes.includes('Plan: Small business') && filed.notes.includes('Billing: Yearly') && !filed.notes.includes('Uses:'));
  ok('app inbox copy carries plan and billing');
  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: { ...lead, plan: 'unsure', billing: 'nonsense' }, ip: '192.0.2.213' }), env: base });
  assert.equal(r.status, 200);
  const [o2, y2] = calls.filter((c) => c.url.includes('resend')).map((c) => JSON.parse(c.init.body));
  assert.ok(o2.text.includes('Plan:        Not sure yet') && o2.text.includes('Billing:     -'));
  assert.ok(y2.text.includes('plans are from $98') && y2.text.includes(`${SITE}/pricing`) && !y2.text.includes('yearly'));
  ok('"not sure yet" is a valid plan; an unknown billing value is dropped, not echoed');
  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: lead, ip: '192.0.2.214' }), env: { ...base, INVITE_AUTOREPLY: '0' } });
  assert.equal(r.status, 200); assert.equal(calls.filter((c) => c.url.includes('resend')).length, 1); ok('INVITE_AUTOREPLY=0 turns the confirmation off');
  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: { email: 'x@example.com', source: 'chat' }, ip: '192.0.2.215' }), env: base });
  assert.equal(r.status, 200); assert.equal(calls.filter((c) => c.url.includes('resend')).length, 1); ok('chat leads need no plan and get no confirmation');
  r = await invite({ request: req('/api/invite', { body: { ...lead, redirect: '/trial/sent' }, json: false, ip: '192.0.2.216' }), env: base });
  assert.equal(r.status, 303); assert.equal(r.headers.get('location'), '/trial/sent'); ok('the no-JavaScript form POST carries plan and billing through');
  const siteTs = await readFile(new URL('../src/data/site.ts', import.meta.url), 'utf8');
  for (const [id, p] of Object.entries(PLANS)) if (p.price) assert.ok(siteTs.includes(`id: '${id}',\n    name: '${p.name}',\n    price: ${p.price},`), `${id} differs from site.ts`);
  assert.ok(!siteTs.includes("name: 'software'")); ok('the function\'s plan table matches site.ts; the form no longer has a software field');

  // Upstream failures become fixed answers, never a Cloudflare error page.
  fetchImpl = async () => { throw new TypeError('fetch failed'); };
  r = await invite({ request: req('/api/invite', { body: lead, ip: '192.0.2.207' }), env: base });
  assert.equal(r.status, 502); ok('Resend unreachable → 502 (JSON)');
  r = await invite({ request: req('/api/invite', { body: { ...lead, redirect: '/thanks' }, json: false, ip: '192.0.2.208' }), env: base });
  assert.equal(r.status, 303); assert.equal(r.headers.get('location'), '/trial/error'); ok('Resend unreachable on a form POST → redirect to /trial/error');
  r = await invite({ request: req('/api/invite', { body: { ...lead, 'cf-turnstile-response': 'tok' }, ip: '192.0.2.209' }), env: { ...base, TURNSTILE_SECRET: 'ts' } });
  assert.equal(r.status, 400); ok('Turnstile unreachable → treated as failed check, 400');

  // Rate limit floor: 5 a minute per IP.
  fetchImpl = async () => new Response('{}', { status: 200 });
  let last;
  for (let i = 0; i < 6; i++) last = await invite({ request: req('/api/invite', { body: lead, ip: '192.0.2.250' }), env: base });
  assert.equal(last.status, 429); ok('6th request in a minute from one IP → 429');
}


console.log('guard.js and sanitiser');
{
  // Chat-sourced leads: tighter budget on top of the general one.
  fetchImpl = async () => new Response('{}', { status: 200 });
  let last;
  for (let i = 0; i < 3; i++) last = await invite({ request: req('/api/invite', { body: { email: 'c@example.com', source: 'chat' }, ip: '192.0.2.251' }), env: { RESEND_API_KEY: 'rk', INVITE_FROM: 'x <website@painttradehq.co>' } });
  assert.equal(last.status, 429); ok('3rd chat-sourced lead in a minute from one IP → 429');

  // Rate-limit tiers that throw fall through instead of crashing the request.
  const throwing = { CHAT_RATE_LIMIT: { limit: async () => { throw new Error('binding down'); } } };
  assert.equal(await rateLimit(throwing, { binding: 'CHAT_RATE_LIMIT', key: 'k1', limit: 2, period: 60 }), true);
  const badKv = { RATE_KV: { get: async () => null, put: async () => { throw new Error('KV PUT failed: 429'); } } };
  assert.equal(await rateLimit(badKv, { binding: 'X', key: 'k2', limit: 2, period: 60 }), true);
  assert.equal(await rateLimit(badKv, { binding: 'X', key: 'k2', limit: 2, period: 60 }), true);
  assert.equal(await rateLimit(badKv, { binding: 'X', key: 'k2', limit: 2, period: 60 }), false);
  ok('a throwing binding or KV falls through to the in-memory floor');
  let r = await chat({ request: req('/api/chat', { body: '{bad', ip: '198.51.100.9' }), env: { ANTHROPIC_API_KEY: 'k', ...throwing } });
  assert.equal(r.status, 400); ok('a throwing binding never escapes onRequestPost');

  // Origin: missing or "null" is accepted only with Sec-Fetch-Site: same-origin.
  const mk = (h) => new Request(`${SITE}/api/x`, { method: 'POST', headers: h, body: 'x' });
  assert.equal(sameOrigin(mk({ origin: SITE })), true);
  assert.equal(sameOrigin(mk({ origin: 'https://evil.example' })), false);
  assert.equal(sameOrigin(mk({})), false);
  assert.equal(sameOrigin(mk({ 'sec-fetch-site': 'same-origin' })), true);
  assert.equal(sameOrigin(mk({ origin: 'null', 'sec-fetch-site': 'same-origin' })), true);
  assert.equal(sameOrigin(mk({ origin: 'null', 'sec-fetch-site': 'cross-site' })), false);
  assert.equal(sameOrigin(mk({ 'sec-fetch-site': 'none' })), false);
  ok('Origin check: site passes; foreign fails; absent or null passes only with Sec-Fetch-Site same-origin');

  // Byte cap holds without Content-Length and for multi-byte text.
  const big = new Request(`${SITE}/api/x`, { method: 'POST', body: 'é'.repeat(20 * 1024) }); // 40 KB in UTF-8, 20 K chars
  assert.equal((await readLimited(big, 32 * 1024)).tooLarge, true);
  const okBody = new Request(`${SITE}/api/x`, { method: 'POST', body: 'é'.repeat(10 * 1024) });
  assert.equal((await readLimited(okBody, 32 * 1024)).raw.length, 10 * 1024);
  const empty = new Request(`${SITE}/api/x`, { method: 'POST' });
  assert.equal((await readLimited(empty, 1024)).raw, '');
  ok('body cap counts bytes, not characters; empty body is fine');

  // Sanitiser trims an over-long but well-formed window instead of rejecting it.
  const long = [];
  for (let i = 0; i < 5; i++) long.push({ role: 'user', content: 'q'.repeat(400) }, { role: 'assistant', content: 'a'.repeat(1900) });
  long.push({ role: 'user', content: 'final question' });
  const trimmed = sanitiseMessages(long);
  assert.ok(trimmed && trimmed.length < long.length && trimmed[0].role === 'user' && trimmed.at(-1).content === 'final question');
  assert.ok(trimmed.reduce((n, m) => n + m.content.length, 0) <= 8000);
  assert.equal(sanitiseMessages([{ role: 'assistant', content: 'x' }]), null);
  assert.equal(sanitiseMessages([{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }]), null);
  ok('sanitiser drops the oldest turns to fit, keeps the last visitor turn, still rejects malformed input');
}

console.log(`\n${passed} checks passed`);
