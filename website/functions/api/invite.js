/**
 * POST /api/invite — the "Start free trial" form (Cloudflare Pages Function). The path is internal.
 *
 * Takes the trial form (or the chat box's mini lead form), checks the honeypot and, if configured,
 * Cloudflare Turnstile, then emails Josh through Resend and sends the requester a fixed-text confirmation
 * (Josh, 1 Nov 2026: "they immediately get an email"). Optionally also posts the lead into the app's
 * Signup leads inbox. Works for both fetch/JSON and a plain HTML form POST (redirects back).
 *
 * Env (Cloudflare Pages → Settings → Variables and secrets):
 *   RESEND_API_KEY      required to send email
 *   INVITE_FROM         required: a sender on a domain verified in Resend, e.g. "Paint Trade HQ <website@painttradehq.co>"
 *   INVITE_TO           optional, default software@joshsano.com.au
 *   INVITE_CONFIRM_LIMIT optional Rate Limiting binding for the requester's confirmation (one per address a day)
 *   TURNSTILE_SECRET    set it before launch: the function emails the address a visitor types, and Turnstile is what
 *                       keeps a script from using that to mail strangers. When set, the full form needs a token. The chat's mini form is exempt
 *                       and gets its own tighter budget (2 a minute per IP) instead.
 *   APP_LEADS_URL       optional, e.g. https://painttradehq.co/api/signup-leads — also files the lead in the app
 *   INVITE_RATE_LIMIT   optional Rate Limiting binding; RATE_KV optional KV namespace (see wrangler.toml)
 *
 * Guards, in order: Origin must be the site; body ≤ 64 KB; honeypot; 5 requests a minute per IP (2 for
 * chat-sourced leads); Turnstile; field validation. Redirects only ever go to a path on this site:
 * /trial/sent on success, /trial/error on any failure.
 */
import { sameOrigin, readLimited, rateLimit } from '../_lib/guard.js';

const DEFAULT_TO = 'software@joshsano.com.au';
const FIELDS = ['name', 'business', 'location', 'email', 'mobile', 'crew', 'plan', 'billing', 'source', 'transcript', 'redirect', 'website', 'cf-turnstile-response'];
const MAX_BODY_BYTES = 64 * 1024;
const RATE = { binding: 'INVITE_RATE_LIMIT', limit: 5, period: 60 };
const CHAT_RATE = { binding: 'INVITE_CHAT_LIMIT', limit: 2, period: 60 };
const CONFIRM_RATE = { binding: 'INVITE_CONFIRM_LIMIT', limit: 1, period: 24 * 60 * 60 };
const DEFAULT_REDIRECT = '/trial/sent';
const ERROR_REDIRECT = '/trial/error';
/** Plans as the form sends them. Names and monthly prices mirror src/data/site.ts (the test checks they match). */
export const PLANS = {
  starter: { name: 'Starter', price: 98 },
  'small-business': { name: 'Small business', price: 178 },
  enterprise: { name: 'Enterprise', price: 249 },
  unsure: { name: 'Not sure yet' },
};
const BILLING = { monthly: 'Monthly', yearly: 'Yearly' };
/** Yearly = 10% off twelve monthly payments (Josh, 1 Nov 2026); mirrors yearly() in src/data/site.ts. */
const yearlyOf = (monthly) => Math.round(monthly * 12 * 0.9 * 100) / 100;
const aud = (n) => `$${n.toLocaleString('en-AU', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
/** "$178 + GST a month" or "$1,922.40 + GST a year" for a priced plan and a billing choice. */
const priceLine = (plan, billing) => (billing === 'yearly' ? `${aud(yearlyOf(plan.price))} + GST a year` : `${aud(plan.price)} + GST a month`);

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

/**
 * The requester's confirmation. Fixed text only: nothing they typed is echoed, so the address they gave is
 * the only input and a stranger's inbox can get at most this standard note, rate-limited like the rest.
 */
function confirmation(lead, origin) {
  const p = lead.plan && PLANS[lead.plan].price ? PLANS[lead.plan] : null;
  const lines = [
    'Thanks for starting a free trial of Paint Trade HQ.',
    '',
    'What happens next',
    `1. We set up your account${p ? ` on the ${p.name} plan` : ''} and email your login, usually the same business day.`,
    p ? `2. You use the ${p.name} plan for 30 days. No card needed, nothing to pay today.` : '2. You use it for 30 days. No card needed, nothing to pay today.',
    p
      ? `3. After that, ${p.name} is ${priceLine(p, lead.billing)}${lead.billing === 'yearly' ? ', paid up front (10% less than monthly)' : ''}, cancel any time.`
      : `3. After that, plans are from ${aud(PLANS.starter.price)} + GST a month, or 10% less paid yearly, cancel any time. We will help you pick one.`,
    '',
    p ? `What ${p.name} includes: ${origin}/pricing#${lead.plan}` : `The three plans side by side: ${origin}/pricing`,
  ];
  lines.push('', 'Questions? Reply to this email and it reaches us.', '', 'Paint Trade HQ', 'Josh Sano Painting and Decorating, trading as Paint Trade HQ · Melbourne');
  return lines.join('\n');
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

export async function onRequestPost({ request, env, waitUntil }) {
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
    plan: Object.hasOwn(PLANS, clean(data.plan, 40)) ? clean(data.plan, 40) : '',
    billing: Object.hasOwn(BILLING, clean(data.billing, 20)) ? clean(data.billing, 20) : '',
    source: ['chat', 'newsletter'].includes(clean(data.source, 40)) ? clean(data.source, 40) : 'website',
    transcript: clean(data.transcript, 6000),
  };

  // The chat's mini form has no Turnstile widget. Anyone can set source=chat, so instead of the check
  // it gets a tighter budget: 2 a minute per IP on top of the 5 above.
  if (lead.source !== 'website' && !(await rateLimit(env, { ...CHAT_RATE, key: ip }))) {
    return respond(isForm, 429, { error: 'Too many requests. Try again in a minute.' }, redirectTo);
  }
  if (env.TURNSTILE_SECRET && lead.source === 'website') {
    const ok = await verifyTurnstile(env.TURNSTILE_SECRET, clean(data['cf-turnstile-response'], 4000), ip);
    if (!ok) return respond(isForm, 400, { error: 'Please complete the check and try again.' }, redirectTo);
  }

  if (!lead.email || !isEmail(lead.email)) return respond(isForm, 400, { error: 'Please enter a valid email.' }, redirectTo);
  if (lead.source === 'website' && (!lead.name || !lead.business)) return respond(isForm, 400, { error: 'Name and business name are needed.' }, redirectTo);
  if (lead.source === 'website' && !lead.plan) return respond(isForm, 400, { error: 'Pick a plan.' }, redirectTo);

  if (!env.RESEND_API_KEY || !env.INVITE_FROM) {
    return respond(isForm, 503, { error: `Email isn't set up yet. Please email ${DEFAULT_TO}.` }, redirectTo);
  }

  const to = env.INVITE_TO || DEFAULT_TO;
  const plan = lead.plan ? PLANS[lead.plan] : null;
  const planText = plan ? (plan.price ? `${plan.name} (${aud(plan.price)} + GST a month)` : plan.name) : '-';
  const lines = [
    lead.source === 'newsletter' ? 'Updates sign-up from the website' : `Free trial request from the website (${lead.source})`,
    '',
    `Name:        ${lead.name || '-'}`,
    `Business:    ${lead.business || '-'}`,
    `Where:       ${lead.location || '-'}`,
    `Email:       ${lead.email}`,
    `Mobile:      ${lead.mobile || '-'}`,
    `Crew size:   ${lead.crew || '-'}`,
    `Plan:        ${planText}`,
    `Billing:     ${lead.billing ? BILLING[lead.billing] + (plan && plan.price ? ` (${priceLine(plan, lead.billing)})` : '') : '-'}`,
    '',
    `Page: ${clean(request.headers.get('referer'), 300) || '-'}`,
    `IP: ${ip} · ${clean(request.headers.get('user-agent'), 300)}`,
  ];
  if (lead.transcript) lines.push('', '--- Chat transcript (as sent by the visitor\'s browser; unverified) ---', lead.transcript);

  const subject = lead.source === 'newsletter' ? `Updates sign-up: ${lead.email}` : lead.business ? `Free trial request: ${lead.business} (${lead.name || lead.email})${plan ? ` · ${plan.name}` : ''}` : `Free trial request: ${lead.email}`;
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

  // Two follow-ups that never change the answer: the requester's confirmation and the optional app copy. On
  // Cloudflare they finish after the response (waitUntil); without it (tests) they are awaited.
  const followUps = [];
  if (lead.source === 'website') followUps.push(sendConfirmation(env, lead, to, new URL(request.url).origin));
  if (env.APP_LEADS_URL && lead.source !== 'newsletter') followUps.push(fileInApp(env, lead, plan));
  const tail = Promise.allSettled(followUps);
  if (typeof waitUntil === 'function') waitUntil(tail);
  else await tail;

  return respond(isForm, 200, { ok: true }, redirectTo);
}

/** The requester's confirmation: fixed text, same sender, replies go to the owner, at most one per address a day. */
async function sendConfirmation(env, lead, ownerTo, origin) {
  if (!(await rateLimit(env, { ...CONFIRM_RATE, key: `confirm:${lead.email}` }))) return;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: env.INVITE_FROM, to: [lead.email], reply_to: ownerTo, subject: 'Your Paint Trade HQ free trial', text: confirmation(lead, origin) }),
    });
    if (!r.ok) console.warn('invite: confirmation not sent', r.status);
  } catch {
    console.warn('invite: confirmation not sent');
  }
}

/** Optional copy into the app's Signup leads inbox (Settings › Platform). The owner's email is the record; this is a bonus. */
async function fileInApp(env, lead, plan) {
  try {
    await fetch(env.APP_LEADS_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        business_name: lead.business || '(from website chat)',
        owner_name: lead.name || lead.email,
        email: lead.email,
        phone: lead.mobile || null,
        notes: [lead.location && `Where: ${lead.location}`, lead.crew && `Crew: ${lead.crew}`, plan && `Plan: ${plan.name}`, lead.billing && `Billing: ${BILLING[lead.billing]}`, `Source: website ${lead.source}`].filter(Boolean).join(' · '),
      }),
    });
  } catch {
    /* bonus only */
  }
}

export function onRequestGet() {
  return json(405, { error: 'POST only' });
}
