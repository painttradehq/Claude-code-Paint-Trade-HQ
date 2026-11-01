# Website handover to nForce IT (Bobby and Jay), 1 November 2026

Josh asked for Bobby (bobby@nforceit.com.au) and Jay (jay@nforceit.com.au) to look after the Paint Trade HQ marketing website: hosting, go-live and upkeep. This is the handover that was emailed to them on 1 Nov 2026 from Josh's mailbox, kept here so it stays current. The click-by-click launch steps are in `launch-checklist.md` next to this file; `website/README.md` has the developer view.

## 1. What the website is

- A **static site** built with Astro 5 on Node 22. Source: GitHub repo `painttradehq/Claude-code-Paint-Trade-HQ`, folder `website/`, branch `claude/sleepy-meitner-rg5ugj` (all work is on that branch; it has not been merged to `main`). Josh grants repo access.
- **Two serverless functions** in `website/functions/api/`, written for Cloudflare Pages Functions:
  - `invite.js`: the "Start free trial" form. Emails the lead to Josh through Resend, emails the requester a fixed-text confirmation, and can copy the lead into the app's Signup leads inbox. Honeypot, optional Turnstile, rate limits, same-origin check.
  - `chat.js`: the website chat box, answering from Josh's knowledge file through Anthropic. **Off at build time** (`PUBLIC_CHAT_ENABLED=0`) until Josh updates the knowledge file.
- The **app** is a separate system at `painttradehq.co`, hosted elsewhere. The website goes on **`painttradehq.com`**. Nothing on the app's side changes.

## 2. Hosting: Cloudflare Pages (free plan)

Everything was built and tested for Cloudflare Pages. Vercel or Netlify would work with adapter code for the two functions; Cloudflare needs none.

1. Workers & Pages → Create → Pages → **Connect to Git** → repo `painttradehq/Claude-code-Paint-Trade-HQ`.
2. Build settings: framework **Astro**; **root directory `website`**; build command `npm run build`; output directory `dist`. The `functions/` folder deploys with it automatically (`website/wrangler.toml` holds the project config).
3. Environment variables: `NODE_VERSION` = `22`, `PUBLIC_SITE_URL` = `https://painttradehq.com`.
4. Production branch: `claude/sleepy-meitner-rg5ugj`, or `main` once the branch is merged (tidier; Josh can ask Claude to open the pull request).

The first deploy gives a `*.pages.dev` link to test on. Every push to the production branch redeploys; other branches get preview links.

## 3. Variables and secrets

Settings → Variables and secrets, for Production and Preview. Secrets are encrypted. **Redeploy once after adding them.** Names are also listed in `website/.dev.vars.example`. Nothing secret goes in the repo.

Required for launch:

| Name | Value | Notes |
|---|---|---|
| `RESEND_API_KEY` | a new key from Josh's Resend account, sending access only, restricted to `painttradehq.co` | the domain is already verified in Resend |
| `INVITE_FROM` | `Paint Trade HQ website <website@painttradehq.co>` | the sender of both emails |
| `TURNSTILE_SECRET` and `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare → Turnstile → Add site, domain `painttradehq.com`, widget Managed | **required**: the form emails whatever address a visitor types; Turnstile stops a script using that to mail strangers from the domain |
| `PUBLIC_CHAT_ENABLED` | `0` | keep the chat box off until Josh says the knowledge file is updated |
| `PUBLIC_SHOW_SAMPLES` | `0` | hides the sample feedback cards and the sample painter listings for launch |

Optional or later:

| Name | Value | Notes |
|---|---|---|
| `INVITE_TO` | `software@joshsano.com.au` | the default anyway |
| `ANTHROPIC_API_KEY`, `CHAT_MODEL` | a key made for the website only; model `claude-opus-5-5` | when the chat box goes on; set a monthly spend cap in the Anthropic Console, then `PUBLIC_CHAT_ENABLED` = `1` |
| `APP_LEADS_URL` | `https://painttradehq.co/api/signup-leads` | only after the app team confirms the endpoint is live |
| `RATE_KV` (KV namespace) or Rate Limiting bindings `CHAT_RATE_LIMIT`, `INVITE_RATE_LIMIT`, `INVITE_CHAT_LIMIT`, `INVITE_CONFIRM_LIMIT` | see `website/wrangler.toml` | without them the functions fall back to an in-memory counter per server |

Also add one WAF rule: Security → WAF → Rate limiting rules: URI path starts with `/api/`, more than 20 requests per 10 seconds from one IP → block.

## 4. Domain

- The site is `painttradehq.com`. Josh owns `.com`, `.com.au` and `.co`.
- Pages project → Custom domains: add `painttradehq.com` and `www.painttradehq.com`. If the zone is not on Cloudflare, move the nameservers or add the CNAME Cloudflare shows.
- `painttradehq.com.au`: redirect everything to `https://painttradehq.com` (301).
- **The app stays on `painttradehq.co`. Do not change its DNS.**

## 5. Checks before any deploy

From `website/`: `npm ci`, `npm run build`, `npm run qa` (Playwright at 390/768/1024/1440: overflow, console errors, links, menu, chat box, form, prices, banned words; needs `npx playwright install chromium` once), `npm run test:functions` (49 checks with a stubbed network; no keys needed). All green at handover.

## 6. After launch

- Send a test trial request with your own email: Josh gets the lead, you get the confirmation; check both land in the inbox, not spam.
- Confirm: samples off, chat off, Turnstile on. Watch Anthropic usage once the chat is on.
- The site promises "your login the same business day": **Josh creates each trial account by hand in the app** (the app's billing is switched off). "Get the notes by email" sign-ups also arrive by email; Josh sends updates by hand.

## 7. Rules of the site (do not break on edits)

- Copy may only claim what Josh's knowledge file says (`docs/website/chat-knowledge.md`). **That file is Josh's; nobody else edits it.** `npm run qa` enforces a banned-word list (tester, invite, annual, supplier names, and more).
- No sign-in links; no sign-up or checkout on the site; no app-store badges; no supplier names on pages except "powered by Anthropic" for Lucy; Josh's name only on the Story page and the legal footer line; no fabricated testimonials or stats (samples are labelled "Sample").
- Prices: $98 / $178 / $249 a month ex-GST, or a year up front for 10% off; 30-day free trial on every plan; no card.
- Site data lives in `website/src/data/site.ts` (plans, nav, FAQs) and `directory.ts` (painter listings); screenshots in `website/public/screens/`; blog posts in `website/src/content/blog/`.
- The home-page ribbon animation is Josh's; leave it unless he asks.

## 8. Coming later (parked, not built)

Stripe payment page after sign-up; a GoHighLevel CRM for website leads (the invite function would post each lead to its webhook); the chat box switch-on. See `docs/parking-lot.md`.

## 9. Access Josh needs to give you

GitHub collaborator access to the repo; the Cloudflare account (create it under Josh's email and add you as members, or Josh adds you); a Resend key (Josh creates it, or adds you to his Resend team); the registrar login for DNS.

Questions: reply on the handover email thread (Josh is copied) or ask Josh for a session with Claude.
