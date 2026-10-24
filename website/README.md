# Paint Trade HQ — marketing website

Static Astro site plus two small Cloudflare Pages Functions: `/api/chat` (the chat box) and `/api/invite` (the "Ask for an invite" form). Five pages: Home, Features, Pricing, Story, Ask for an invite. Terms of Service is an external link to the app.

## Where the words come from

Every sentence traces to **`../docs/website/chat-knowledge.md`** (Josh's file: what the app does today, plans, prices, FAQ, what is *not* live) and **`../docs/website/website-pack.md`** (the builder's handover: assets, legal lines, links, look). Page copy lives in `src/data/site.ts`. The chat box gets the knowledge file verbatim as its system prompt via `scripts/sync-knowledge.mjs`, which runs before every build. **When Josh updates the knowledge file, re-build; never edit `functions/_lib/knowledge.js` by hand.**

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
3. Add the custom domain Josh picks. Set `PUBLIC_SITE_URL` to match so canonical and Open Graph URLs are right.
4. Optional: enable the rate-limit bindings in `wrangler.toml` and Turnstile.

The same files deploy to Vercel or Netlify with a few lines of adapter code for the two functions; Cloudflare is the path of least resistance.

## Rules baked in

- Call to action is always "Ask for an invite". The site never takes sign-ups or payments.
- Prices are AUD a month, ex-GST, with the inc-GST figure shown.
- No Privacy link (Terms §5 covers data during the tester program). Footer: "© 2026 Josh Sano Painting and Decorating, trading as Paint Trade HQ".
- "Sign in" goes to https://painttradehq.co/admin/login; crew to /crew.
- Buttons are solid accent with white text. Tokens mirror the app's `theme/tokens.ts`.
