/**
 * Exercises the two Pages Functions in plain Node with a stubbed network. No API keys, no requests leave
 * the machine. Run: npm run test:functions (after npm run build, which generates _lib/knowledge.js).
 */
import assert from 'node:assert/strict';
import { onRequestPost as chat } from '../functions/api/chat.js';
import { onRequestPost as invite } from '../functions/api/invite.js';

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
    { messages: Array.from({ length: 20 }, () => ({ role: 'user', content: 'y'.repeat(500) })) },
  ]) {
    r = await chat({ request: req('/api/chat', { body: bad }), env: live });
    assert.equal(r.status, 400, JSON.stringify(bad).slice(0, 60));
  }
  ok('role spoofing, non-string content, assistant-last, oversize window → 400');
  assert.equal((await r.text()).includes('at '), false); ok('error bodies carry no stack trace');
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
  const lead = { name: 'Mia', business: 'Harbourline Painting', email: 'mia@example.com', location: 'Mosman NSW' };

  let r = await invite({ request: req('/api/invite', { body: lead, origin: null }), env: base });
  assert.equal(r.status, 403); ok('missing Origin → 403 (JSON)');
  r = await invite({ request: req('/api/invite', { body: lead, json: false, origin: 'https://evil.example' }), env: base });
  assert.equal(r.status, 303); assert.equal(r.headers.get('location'), '/invite?error=1'); ok('foreign Origin on a form POST → redirect to /invite?error=1');

  r = await invite({ request: req('/api/invite', { body: { ...lead, transcript: 'z'.repeat(70 * 1024) } }), env: base });
  assert.equal(r.status, 413); ok('70 KB body → 413');

  calls.length = 0;
  r = await invite({ request: req('/api/invite', { body: { ...lead, website: 'http://spam' } }), env: base });
  assert.equal(r.status, 200); assert.equal(calls.length, 0); ok('honeypot filled → silent 200, no email');

  // Redirect safety (form POSTs).
  for (const [redirect, expect] of [
    ['/thanks?x=1', '/thanks?x=1'],
    ['/\\evil.com', '/invite?sent=1'],
    ['//evil.com', '/invite?sent=1'],
    ['https://evil.com/', '/invite?sent=1'],
    ['/thanks#frag', '/thanks'],
    ['javascript:alert(1)', '/invite?sent=1'],
  ]) {
    r = await invite({ request: req('/api/invite', { body: { ...lead, website: 'bot', redirect }, json: false, ip: '192.0.2.' + Math.floor(Math.random() * 200) }), env: base });
    assert.equal(r.status, 303); assert.equal(r.headers.get('location'), expect, redirect);
  }
  ok('redirect only ever goes to a path on this site (backslash, //, absolute, javascript: all rejected)');

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

  // Upstream failures become fixed answers, never a Cloudflare error page.
  fetchImpl = async () => { throw new TypeError('fetch failed'); };
  r = await invite({ request: req('/api/invite', { body: lead, ip: '192.0.2.207' }), env: base });
  assert.equal(r.status, 502); ok('Resend unreachable → 502 (JSON)');
  r = await invite({ request: req('/api/invite', { body: { ...lead, redirect: '/thanks' }, json: false, ip: '192.0.2.208' }), env: base });
  assert.equal(r.status, 303); assert.equal(r.headers.get('location'), '/thanks?error=1'); ok('Resend unreachable on a form POST → redirect with ?error=1');
  r = await invite({ request: req('/api/invite', { body: { ...lead, 'cf-turnstile-response': 'tok' }, ip: '192.0.2.209' }), env: { ...base, TURNSTILE_SECRET: 'ts' } });
  assert.equal(r.status, 400); ok('Turnstile unreachable → treated as failed check, 400');

  // Rate limit floor: 5 a minute per IP.
  fetchImpl = async () => new Response('{}', { status: 200 });
  let last;
  for (let i = 0; i < 6; i++) last = await invite({ request: req('/api/invite', { body: lead, ip: '192.0.2.250' }), env: base });
  assert.equal(last.status, 429); ok('6th request in a minute from one IP → 429');
}

console.log(`\n${passed} checks passed`);
