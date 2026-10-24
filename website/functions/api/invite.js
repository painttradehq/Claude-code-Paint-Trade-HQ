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
 *   TURNSTILE_SECRET    optional; when set, a Turnstile token is required
 *   APP_LEADS_URL       optional, e.g. https://painttradehq.co/api/signup-leads — also files the lead in the app
 *   INVITE_RATE_LIMIT   optional Rate Limiting binding (see wrangler.toml)
 */

const DEFAULT_TO = 'software@joshsano.com.au';
const FIELDS = ['name', 'business', 'location', 'email', 'mobile', 'crew', 'software', 'source', 'transcript', 'redirect', 'website', 'cf-turnstile-response'];

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const clean = (v, max = 300) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

async function readBody(request) {
  const ct = request.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    const b = await request.json().catch(() => ({}));
    return { data: b || {}, isForm: false };
  }
  const fd = await request.formData().catch(() => null);
  const data = {};
  if (fd) for (const [k, v] of fd.entries()) if (FIELDS.includes(k)) data[k] = typeof v === 'string' ? v : '';
  return { data, isForm: true };
}

function respond(isForm, status, payload, redirect) {
  if (isForm) {
    const to = typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/invite?sent=1';
    const url = status < 400 ? to : `${to.split('?')[0]}?error=1`;
    return new Response(null, { status: 303, headers: { location: url } });
  }
  return json(status, payload);
}

async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const form = new URLSearchParams({ secret, response: token });
  if (ip) form.set('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const j = await r.json().catch(() => ({}));
  return !!j.success;
}

export async function onRequestPost({ request, env }) {
  const { data, isForm } = await readBody(request);
  const redirect = clean(data.redirect, 200);

  // Honeypot: bots fill the hidden "website" field; pretend it worked and drop it.
  if (clean(data.website)) return respond(isForm, 200, { ok: true }, redirect);

  const ip = request.headers.get('cf-connecting-ip') || '';
  if (env.INVITE_RATE_LIMIT && typeof env.INVITE_RATE_LIMIT.limit === 'function') {
    const { success } = await env.INVITE_RATE_LIMIT.limit({ key: ip || 'unknown' });
    if (!success) return respond(isForm, 429, { error: 'Too many requests. Try again in a minute.' }, redirect);
  }

  if (env.TURNSTILE_SECRET) {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, clean(data['cf-turnstile-response'], 4000), ip);
    if (!ok) return respond(isForm, 400, { error: 'Please complete the check and try again.' }, redirect);
  }

  const lead = {
    name: clean(data.name, 120),
    business: clean(data.business, 160),
    location: clean(data.location, 160),
    email: clean(data.email, 200).toLowerCase(),
    mobile: clean(data.mobile, 40),
    crew: clean(data.crew, 40),
    software: clean(data.software, 200),
    source: clean(data.source, 40) || 'website',
    transcript: clean(data.transcript, 6000),
  };
  if (!lead.email || !isEmail(lead.email)) return respond(isForm, 400, { error: 'Please enter a valid email.' }, redirect);
  if (lead.source !== 'chat' && (!lead.name || !lead.business)) return respond(isForm, 400, { error: 'Name and business name are needed.' }, redirect);

  if (!env.RESEND_API_KEY || !env.INVITE_FROM) {
    return respond(isForm, 503, { error: `Email isn't set up yet. Please email ${DEFAULT_TO}.` }, redirect);
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
    `Page: ${request.headers.get('referer') || '-'}`,
    `IP: ${ip || '-'} · ${request.headers.get('user-agent') || ''}`,
  ];
  if (lead.transcript) lines.push('', '--- Chat transcript ---', lead.transcript);

  const subject = lead.business ? `Invite request: ${lead.business} (${lead.name || lead.email})` : `Invite request: ${lead.email}`;
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.INVITE_FROM, to: [to], reply_to: lead.email, subject, text: lines.join('\n') }),
  });
  if (!r.ok) {
    return respond(isForm, 502, { error: `That didn't send. Please email ${to}.` }, redirect);
  }

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

  return respond(isForm, 200, { ok: true }, redirect);
}

export function onRequestGet() {
  return json(405, { error: 'POST only' });
}
