/**
 * Shared request guards for the two Pages Functions.
 *
 * - sameOrigin(): the request must come from a page on this site. Browsers send an Origin header on
 *   every POST made by fetch() or a form; when it is absent or "null" (a no-referrer policy, a browser
 *   set to withhold it) the request is still accepted if the browser's own Sec-Fetch-Site header says
 *   same-origin. Scripts can forge both, which is why rate limiting exists; this stops cross-site pages
 *   and casual abuse, not a determined one.
 * - readLimited(): reads the body while counting bytes and stops at the cap, so an undeclared or
 *   multi-byte body cannot exceed it.
 * - rateLimit(): three tiers, best available wins, each falling through to the next if it throws:
 *   a Cloudflare Rate Limiting binding; a KV namespace bound as RATE_KV (per-minute counters); an
 *   in-memory counter per server isolate, which is a soft floor rather than a guarantee. The WAF
 *   rate-limiting rule on /api/* (README) and a spend cap in the Anthropic Console are the backstops.
 */

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  let site;
  try {
    site = new URL(request.url).origin;
  } catch {
    return false;
  }
  if (!origin || origin === 'null') return request.headers.get('sec-fetch-site') === 'same-origin';
  try {
    return new URL(origin).origin === site;
  } catch {
    return false;
  }
}

export async function readLimited(request, maxBytes) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > maxBytes) return { tooLarge: true };
  if (!request.body) return { raw: '' };
  const reader = request.body.getReader();
  const chunks = [];
  let n = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      n += value.byteLength;
      if (n > maxBytes) {
        await reader.cancel().catch(() => {});
        return { tooLarge: true };
      }
      chunks.push(value);
    }
  } catch {
    return { raw: '' };
  }
  const all = new Uint8Array(n);
  let off = 0;
  for (const c of chunks) {
    all.set(c, off);
    off += c.byteLength;
  }
  return { raw: new TextDecoder().decode(all) };
}

const memory = new Map(); // key -> { n, reset }
const MEMORY_MAX_KEYS = 5000;

export async function rateLimit(env, { binding, key, limit, period }) {
  const b = env[binding];
  if (b && typeof b.limit === 'function') {
    try {
      const { success } = await b.limit({ key });
      return !!success;
    } catch {
      /* binding unavailable: fall through */
    }
  }
  const kv = env.RATE_KV;
  if (kv && typeof kv.get === 'function' && typeof kv.put === 'function') {
    try {
      const slot = Math.floor(Date.now() / 1000 / period);
      const k = `${binding}:${key}:${slot}`;
      const n = Number(await kv.get(k)) || 0;
      if (n >= limit) return false;
      await kv.put(k, String(n + 1), { expirationTtl: Math.max(60, period * 2) });
      return true;
    } catch {
      /* KV unavailable or write-rate limited: fall through */
    }
  }
  const now = Date.now();
  if (memory.size > MEMORY_MAX_KEYS) for (const [k, v] of memory) if (v.reset <= now) memory.delete(k);
  const mk = `${binding}:${key}`;
  let e = memory.get(mk);
  if (!e || e.reset <= now) {
    e = { n: 0, reset: now + period * 1000 };
    memory.set(mk, e);
  }
  e.n += 1;
  return e.n <= limit;
}
