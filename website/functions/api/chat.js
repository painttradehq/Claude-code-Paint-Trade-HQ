/**
 * POST /api/chat — the website chat box (Cloudflare Pages Function).
 *
 * Answers ONLY from docs/website/chat-knowledge.md (synced into _lib/knowledge.js at build), in the
 * voice and under the rules of that file's §0. Streams plain text back to the browser.
 *
 * Env (Cloudflare Pages → Settings → Variables and secrets):
 *   ANTHROPIC_API_KEY   required
 *   CHAT_MODEL          optional, default claude-opus-5-5
 *   CHAT_RATE_LIMIT     optional Rate Limiting binding (see wrangler.toml)
 */
import Anthropic from '@anthropic-ai/sdk';
import { KNOWLEDGE, KNOWLEDGE_DATE } from '../_lib/knowledge.js';

const MODEL_DEFAULT = 'claude-opus-5-5';
const MAX_TURNS = 20; // messages in the window we accept from the browser
const MAX_USER_CHARS = 500;
const MAX_TOTAL_CHARS = 8000;
const SUPPORT = 'software@joshsano.com.au';

const OPERATOR_RULES = `
You are the chat box on the Paint Trade HQ marketing website. The document below is your only source of truth about the app. Follow its section 0 ("How the chat box should behave") exactly: plain Australian English, one to four sentences unless asked for detail, prices in AUD ex-GST with the inc-GST figure the first time, never invent a feature, price, date or integration, never give legal, tax or employment advice, never take card details or passwords, never quote a launch date, never promise app-store apps, do not name internal providers unless asked how something works.

If the answer is not in the document, say exactly: "I don't know that one — leave your email and Josh will answer." and ask for their email. When a visitor wants in, is a painter, or asks something the document cannot answer, invite them to leave their details (name, business, suburb/state, email, mobile, crew size, current software) and say "Josh reads these himself and will be in touch."

Escalate anything about a specific account, a bug, a refund or a legal question with: "I'll pass this to Josh — what's your email?"

Write plain text only: no markdown headings, no bullet symbols, no bold. Short paragraphs are fine.
`.trim();

const REFUSAL_TEXT = `I can't help with that one. For anything about Paint Trade HQ, ask away, or email ${SUPPORT}.`;
const TROUBLE_TEXT = `\n\nThe chat is having a moment. Email ${SUPPORT} or use the invite form and Josh will answer.`;

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const text = (status, body) =>
  new Response(body, { status, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } });

function sanitiseMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const out = [];
  let total = 0;
  for (const m of raw.slice(-MAX_TURNS)) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') return null;
    const content = m.content.trim().slice(0, m.role === 'user' ? MAX_USER_CHARS : 2000);
    if (!content) continue;
    total += content.length;
    if (total > MAX_TOTAL_CHARS) return null;
    out.push({ role: m.role, content });
  }
  // First message must be from the visitor.
  while (out.length && out[0].role !== 'user') out.shift();
  if (!out.length || out[out.length - 1].role !== 'user') return null;
  return out;
}

export async function onRequestPost({ request, env }) {
  if (!env.ANTHROPIC_API_KEY) {
    return text(503, `The chat isn't switched on yet. Email ${SUPPORT} and Josh will answer.`);
  }

  const ip = request.headers.get('cf-connecting-ip') || 'unknown';
  if (env.CHAT_RATE_LIMIT && typeof env.CHAT_RATE_LIMIT.limit === 'function') {
    const { success } = await env.CHAT_RATE_LIMIT.limit({ key: ip });
    if (!success) return text(429, `Too many questions from this connection in a minute. Try again shortly, or email ${SUPPORT}.`);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json(400, { error: 'Expected JSON' });
  }
  const messages = sanitiseMessages(body?.messages);
  if (!messages) return json(400, { error: 'Bad messages' });
  const page = typeof body?.page === 'string' ? body.page.slice(0, 120) : '/';

  const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 45_000 });

  // The knowledge file is the stable prefix (cached); page and date are volatile and come after it.
  const system = [
    { type: 'text', text: `${OPERATOR_RULES}\n\n=== KNOWLEDGE (${KNOWLEDGE_DATE}) ===\n${KNOWLEDGE}`, cache_control: { type: 'ephemeral' } },
    { type: 'text', text: `The visitor is on the website page "${page}". Today is ${new Date().toISOString().slice(0, 10)}.` },
  ];

  let stream;
  try {
    stream = client.beta.messages.stream({
      model: env.CHAT_MODEL || MODEL_DEFAULT,
      max_tokens: 600,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      output_config: { effort: 'low' },
      system,
      messages,
    });
  } catch (e) {
    return text(502, TROUBLE_TEXT.trim());
  }

  const encoder = new TextEncoder();
  const out = new ReadableStream({
    async start(controller) {
      let wrote = false;
      try {
        for await (const ev of stream) {
          if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
            controller.enqueue(encoder.encode(ev.delta.text));
            wrote = true;
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === 'refusal' && !wrote) controller.enqueue(encoder.encode(REFUSAL_TEXT));
      } catch (e) {
        // Typed SDK errors first, then anything else; the visitor always gets a way to reach Josh.
        if (e instanceof Anthropic.RateLimitError) controller.enqueue(encoder.encode(`\n\nLots of people are asking right now. Try again in a minute, or email ${SUPPORT}.`));
        else controller.enqueue(encoder.encode(TROUBLE_TEXT));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(out, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
      'x-knowledge-date': KNOWLEDGE_DATE,
    },
  });
}

export function onRequestGet() {
  return json(405, { error: 'POST only' });
}
