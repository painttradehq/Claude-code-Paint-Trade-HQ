/**
 * POST /api/invite — "Ask for an invite" (Cloudflare Pages Function).
 *
 * Takes the invite form (or the chat box's mini lead form), checks the honeypot and, if configured,
 * Cloudflare Turnstile, then emails Josh through Resend. Optionally also posts the lead into the app's
 * Signup leads inbox. Works for both fetch/JSON and a plain HTML form POST (redirects back).
 *
 * Env (Cloudflare Pages → Settings → Variables and secrets):
 *   RESEND_API_KEY      required to send email
 *   INVITE_FROM         required: a sender on a domain verified in Resend, e.g. "Paint Trade HQ <website@painttradehq.co>"
 *   INVITE_TO           optional, default software@joshsano.com.au
 *   TURNSTILE_SECRET    optional; when set, the full form needs a Turnstile token. The chat's mini form is exempt
 *                       and gets its own tighter budget (2 a minute per IP) instead.
 *   APP_LEADS_URL       optional, e.g. https://painttradehq.co/api/signup-leads — also files the lead in the app
 *   INVITE_RATE_LIMIT   optional Rate Limiting binding; RATE_KV optional KV namespace (see wrangler.toml)
 *
 * Guards, in order: Origin must be the site; body ≤ 64 KB; honeypot; 5 requests a minute per IP (2 for
 * chat-sourced leads); Turnstile; field validation. Redirects only ever go to a path on this site:
 * /invite/sent on success, /invite/error on any failure.
 */
import { sameOrigin, readLimited, rateLimit } from '../_lib/guard.js';

const DEFAULT_TO = 'software@joshsano.com.au';
const FIELDS = ['name', 'business', 'location', 'email', 'mobile', 'crew', 'software', 'source', 'transcript', 'redirect', 'website', 'cf-turnstile-response'];
const MAX_BODY_BYTES = 64 * 1024;
const RATE = { binding: 'INVITE_RATE_LIMIT', limit: 5, period: 60 };
const CHAT_RATE = { binding: 'INVITE_CHAT_LIMIT', limit: 2, period: 60 };
const DEFAULT_REDIRECT = '/invite/sent';
const ERROR_REDIRECT = '/invite/error';

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const clean = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

function parseBody(raw, contentType) {
  if (contentType.includes('application/json')) {
    try {
      const b = JSON.parse(raw);
      return { data: b && typeof b === 'object' && !Array.isArray(b) ? b : {}, isForm: false };
    } catch {
      return { data: {}, isForm: false };
    }
  }
  const data = {};
  if (contentType.includes('application/x-www-form-urlencoded')) {
    for (const [k, v] of new URLSearchParams(raw)) if (FIELDS.includes(k)) data[k] = v;
  }
  return { data, isForm: true };
}

/**
 * A redirect target is only ever a path on this site; anything else falls back to the thank-you page.
 * The input AND the resolved result are checked: dot segments ("/.//evil.com") can resolve to a
 * protocol-relative path even when the parsed origin is still ours.
 */
function safeRedirect(redirect, request) {
  if (typeof redirect !== 'string' || !/^\/(?![/\\])/.test(redirect)) return DEFAULT_REDIRECT;
  try {
    const base = new URL(request.url);
    const u = new URL(redirect, base);
    if (u.origin !== base.origin) return DEFAULT_REDIRECT;
    const out = u.pathname + u.search;
    if (!/^\/(?![/\\])/.test(out) || /[\\\s]/.test(out)) return DEFAULT_REDIRECT;
    return out;
  } catch {
    return DEFAULT_REDIRECT;
  }
}

function respond(isForm, status, payload, redirectTo) {
  if (isForm) {
    return new Response(null, { status: 303, headers: { location: status < 400 ? redirectTo : ERROR_REDIRECT } });
  }
  return json(status, payload);
}

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set('remoteip', ip);
  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const j = await r.json().catch(() => ({}));
    return !!j.success;
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  const contentType = request.headers.get('content-type') || '';
  const isFormHint = !contentType.includes('application/json');
  if (!sameOrigin(request)) {
    return respond(isFormHint, 403, { error: 'This form only works from the Paint Trade HQ website.' }, DEFAULT_REDIRECT);
  }
  const { raw, tooLarge } = await readLimited(request, MAX_BODY_BYTES);
  if (tooLarge) return respond(isFormHint, 413, { error: 'That is too much text for the form.' }, DEFAULT_REDIRECT);

  const { data, isForm } = parseBody(raw, contentType);
  const redirectTo = safeRedirect(clean(data.redirect, 200), request);

  // Honeypot: bots fill the hidden "website" field; pretend it worked and drop it.
  if (clean(data.website)) return respond(isForm, 200, { ok: true }, redirectTo);

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (!(await rateLimit(env, { ...RATE, key: ip }))) {
    return respond(isForm, 429, { error: 'Too many requests. Try again in a minute.' }, redirectTo);
  }

  const lead = {
    name: clean(data.name, 120),
    business: clean(data.business, 160),
    location: clean(data.location, 160),
    email: clean(data.email, 200).toLowerCase(),
    mobile: clean(data.mobile, 40),
    crew: clean(data.crew, 40),
    software: clean(data.software, 200),
    source: clean(data.source, 40) === 'chat' ? 'chat' : 'website',
    transcript: clean(data.transcript, 6000),
  };

  // The chat's mini form has no Turnstile widget. Anyone can set source=chat, so instead of the check
  // it gets a tighter budget: 2 a minute per IP on top of the 5 above.
  if (lead.source === 'chat' && !(await rateLimit(env, { ...CHAT_RATE, key: ip }))) {
    return respond(isForm, 429, { error: 'Too many requests. Try again in a minute.' }, redirectTo);
  }
  if (env.TURNSTILE_SECRET && lead.source !== 'chat') {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, clean(data['cf-turnstile-response'], 4000), ip);
    if (!ok) return respond(isForm, 400, { error: 'Please complete the check and try again.' }, redirectTo);
  }

  if (!lead.email || !isEmail(lead.email)) return respond(isForm, 400, { error: 'Please enter a valid email.' }, redirectTo);
  if (lead.source !== 'chat' && (!lead.name || !lead.business)) return respond(isForm, 400, { error: 'Name and business name are needed.' }, redirectTo);

  if (!env.RESEND_API_KEY || !env.INVITE_FROM) {
    return respond(isForm, 503, { error: `Email isn't set up yet. Please email ${DEFAULT_TO}.` }, redirectTo);
  }

  const to = env.INVITE_TO || DEFAULT_TO;
  const lines = [
    `Invite request from the website (${lead.source})`,
    '',
    `Name:        ${lead.name || '-'}`,
    `Business:    ${lead.business || '-'}`,
    `Where:       ${lead.location || '-'}`,
    `Email:       ${lead.email}`,
    `Mobile:      ${lead.mobile || '-'}`,
    `Crew size:   ${lead.crew || '-'}`,
    `Uses today:  ${lead.software || '-'}`,
    '',
    `Page: ${clean(request.headers.get('referer'), 300) || '-'}`,
    `IP: ${ip} · ${clean(request.headers.get('user-agent'), 300)}`,
  ];
  if (lead.transcript) lines.push('', '--- Chat transcript (as sent by the visitor\'s browser; unverified) ---', lead.transcript);

  const subject = lead.business ? `Invite request: ${lead.business} (${lead.name || lead.email})` : `Invite request: ${lead.email}`;
  let sent = false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.INVITE_FROM, to: [to], reply_to: lead.email, subject, text: lines.join('\n') }),
    });
    sent = r.ok;
  } catch {
    sent = false;
  }
  if (!sent) return respond(isForm, 502, { error: `That didn't send. Please email ${to}.` }, redirectTo);

  // Optional: also file the lead in the app's Signup leads inbox (Settings › Platform). Best effort.
  if (env.APP_LEADS_URL) {
    try {
      await fetch(env.APP_LEADS_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          business_name: lead.business || '(from website chat)',
          owner_name: lead.name || lead.email,
          email: lead.email,
          phone: lead.mobile || null,
          notes: [lead.location && `Where: ${lead.location}`, lead.crew && `Crew: ${lead.crew}`, lead.software && `Uses: ${lead.software}`, `Source: website ${lead.source}`].filter(Boolean).join(' · '),
        }),
      });
    } catch {
      /* the email is the record; this is a bonus */
    }
  }

  return respond(isForm, 200, { ok: true }, redirectTo);
}

export function onRequestGet() {
  return json(405, { error: 'POST only' });
}
