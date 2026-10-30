# Paint Trade HQ — marketing website

Static Astro site plus two small Cloudflare Pages Functions: `/api/chat` (the chat box) and `/api/invite` (the "Start free trial" form; the path is internal). Pages: Home, Features, Pricing, Story, Find a painter (one page per listing), Start your free trial. Terms of Service is an external link to the app.

## Where the words come from

Feature facts trace to **`../docs/website/chat-knowledge.md`** (Josh's file: what the app does today, plans, prices, FAQ, what is *not* live) and **`../docs/website/website-pack.md`** (the builder's handover: assets, legal lines, links, look). Page copy lives in `src/data/site.ts`. The chat box gets the knowledge file verbatim as its system prompt via `scripts/sync-knowledge.mjs`, which runs before every build. **When Josh updates the knowledge file, re-build; never edit `functions/_lib/knowledge.js` by hand.**

## Screenshots and clips

The builder's captures (demo business "Harbourline Painting", 23 Oct 2026) live in `public/screens/` (47 PNGs: admin at 1440×900, some at 1024×900, crew and client pages at 780×1688) and `public/clips/` (8 silent WebM walkthroughs, 25–45 s, 1440×900 except 03 and 05 at 390×844). Slots and captions are in `src/data/screens.ts`; any slot without a file renders a labelled placeholder, so the site always builds.

Clips never autoplay. Each shows a poster frame from `public/clips/posters/` with a play button, and the video loads only when clicked. To cut a new poster:

```sh
ffmpeg -nostdin -y -ss 39.5 -i public/clips/02-new-quote-to-sent.webm -frames:v 1 -q:v 3 public/clips/posters/02-new-quote-to-sent.jpg
```

When a new round changes a screen, replace the file under the same name and re-check the alt text and caption for that slot.

## Run locally

```bash
npm install
npm run dev          # http://localhost:4321 (pages only; /api/* needs wrangler)
npm run build        # syncs knowledge, builds to dist/
npx wrangler pages dev dist   # pages + functions, reads .dev.vars
```

## Deploy (Cloudflare Pages)

1. Create a Pages project from this repo, root directory `website`, build command `npm run build`, output `dist`.
2. Set the variables from `.dev.vars.example` as Pages secrets. `INVITE_FROM` must be on a domain verified in Resend.
3. Add the custom domain: `painttradehq.com` (Josh's call, 24 Oct 2026; the app stays on `painttradehq.co`), with `www.painttradehq.com` and `painttradehq.com.au` redirecting to it. Set `PUBLIC_SITE_URL` to match so canonical and Open Graph URLs are right.
4. Put a ceiling on cost before the first visitor: a **spend limit in the Anthropic Console** for the chat key, and a **WAF rate-limiting rule** on the zone for `/api/*` (the free plan includes one; 20 requests per 10 seconds per IP is plenty). The functions also limit per IP themselves (chat 20 a minute, invite 5 a minute) using the best storage they find: a Rate Limiting binding, else a KV namespace bound as `RATE_KV`, else an in-memory counter per server. Bind the KV namespace in `wrangler.toml` for the limit to hold across servers.
5. Optional: Turnstile on the full invite form (`TURNSTILE_SECRET` + `PUBLIC_TURNSTILE_SITE_KEY`). The chat's mini lead form is exempt; it sits behind the chat's own limits.

Both functions refuse requests whose `Origin` header is not this site (a missing or `null` Origin is accepted only when the browser's `Sec-Fetch-Site` says same-origin, so never add a `no-referrer` Referrer-Policy without keeping that), cap request bodies by bytes (32 KB chat, 64 KB invite), and answer every failure with a short fixed line rather than an upstream error. A form POST without JavaScript lands on `/invite/sent` or `/invite/error`; the redirect field is checked before and after resolving, so it can only ever point at a path on this site. Chat-sourced leads skip Turnstile but get a tighter budget (2 a minute per IP); anyone can set that field, so the trade-off is spam volume, not a bypass of validation.

`PUBLIC_CHAT_ENABLED=0` at build time leaves the chat box off every page (for a launch before the Anthropic key exists, or while the knowledge file still describes the tester program). `PUBLIC_SHOW_SAMPLES=0` hides the sample feedback cards and the sample directory listings; with samples shown, the directory pages carry `noindex`. `PUBLIC_*` values are read at build time from `.env` (Astro), not from `.dev.vars` (Wrangler); set them in both places locally, or just in the Pages project settings.

`npm run test:functions` exercises both functions in Node with a stubbed network: origin and size guards (including bodies without Content-Length and multi-byte text), honeypot, validation, redirect safety (including dot-segment tricks), rate-limit tiers that throw, Turnstile exemption and budget for chat leads, the email payload, and the chat's message sanitiser.

The same files deploy to Vercel or Netlify with a few lines of adapter code for the two functions; Cloudflare is the path of least resistance.

## Rules baked in

- Call to action is always "Start free trial" (30 days, every plan, no card; Josh, 30 Oct 2026). The site never takes sign-ups or payments itself: the form emails the owner, who sets the account up.
- Prices are AUD a month, ex-GST, with the inc-GST figure shown: $98 / $178 / $249 (Josh, 30 Oct 2026).
- No Privacy link (Terms §5 covers data). Footer: "© 2026 Josh Sano Painting and Decorating, trading as Paint Trade HQ".
- "Sign in" goes to https://painttradehq.co/admin/login; crew to /crew.
- Buttons are solid accent with white text. Tokens mirror the app's `theme/tokens.ts`.
