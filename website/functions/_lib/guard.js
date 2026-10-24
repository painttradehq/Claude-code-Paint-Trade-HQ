/**
 * Shared request guards for the two Pages Functions.
 *
 * - sameOrigin(): the browser must send an Origin header that matches the site. Same-origin fetch()
 *   and same-origin form POSTs always carry it; scripts and cross-site pages do not (or carry a
 *   different one). A forged Origin from curl still gets through, which is why rate limiting exists.
 * - readLimited(): refuses bodies over a byte cap before parsing them.
 * - rateLimit(): three tiers, best available wins. A Cloudflare Rate Limiting binding if the project
 *   has one; else a KV namespace bound as RATE_KV (per-minute counters); else an in-memory counter per
 *   server isolate, which is a soft floor rather than a guarantee. The WAF rate-limiting rule on
 *   /api/* (README) and a spend cap in the Anthropic Console are the backstops.
 */

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function readLimited(request, maxBytes) {
  const declared = Number(request.headers.get('content-length') || 0);
  if (declared > maxBytes) return { tooLarge: true };
  const raw = await request.text();
  if (raw.length > maxBytes) return { tooLarge: true };
  return { raw };
}

const memory = new Map(); // key -> { n, reset }
const MEMORY_MAX_KEYS = 5000;

export async function rateLimit(env, { binding, key, limit, period }) {
  const b = env[binding];
  if (b && typeof b.limit === 'function') {
    const { success } = await b.limit({ key });
    return success;
  }
  const kv = env.RATE_KV;
  if (kv && typeof kv.get === 'function' && typeof kv.put === 'function') {
    const slot = Math.floor(Date.now() / 1000 / period);
    const k = `${binding}:${key}:${slot}`;
    const n = Number(await kv.get(k)) || 0;
    if (n >= limit) return false;
    await kv.put(k, String(n + 1), { expirationTtl: Math.max(60, period * 2) });
    return true;
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
