# Paint Trade HQ — Marketing Website Plan (v1)

_Drafted 5 October 2026 from a read of the app source at `painttradehq/the-newest-update-of-pthq` (HEAD "Round 64"). Status: **draft; five of seven decisions answered by Josh's 23 Oct chat-knowledge file, see the update block below**. Companion fact file: `docs/app/pthq-app-briefing.md` (what is live vs planned — the website must not claim anything that file marks as not live)._

---

## Update — 23 October 2026

Josh supplied `docs/website/chat-knowledge.md`: the app as built at Round 83 (82 published), written as the **website chat box's** memory. It overrides this plan wherever they differ and settles D2, D3, D4, D7 and most of D5. What changed:

- **Domain** is `painttradehq.co`, not `.com`.
- **Pricing** is three monthly plans ex-GST with seats (Starter $59, Small business $179, Enterprise $249), a 14-day trial on Enterprise, billing built but not switched on.
- **Legal:** Terms v1.2, lawyer-reviewed for the tester program; no separate Privacy Policy yet (Terms §5 covers personal data).
- **Support:** software@joshsano.com.au.
- **A chat box is part of v1**, answering only from that file and capturing leads by email.
- Several features moved since the audit (presentation pages, auto-invoicing, operating hours, overtime rate, crew app at `/crew`, a Xero connect button). `docs/app/reconciliation-2026-10-23.md` lists the 25 differences; **8 need Josh's confirmation** before they go on a page.

Still open: **D1** (where the site lives; recommend the static site in this repo, now with one serverless function for the chat box), **D6** (photos; recommend real), and whether the site takes the apex domain with the app moving to `app.painttradehq.co`.

## Update — 24 October 2026: the builder's handover pack

The app's builder sent `docs/website/website-pack.md`. It closes most of what was open and changes the page list:

- **Assets exist.** 47 screenshots (light theme, demo business "Harbourline Painting"; admin at 1440 and 1024, crew and client pages at 390) and 8 silent WebM walkthrough clips, in the app repo under `memory/marketing/`, zipped (~31 MB). Five screens are approximations (Drive, Billing, hours, crew contract, completion report). The Playwright capture script in §5 is no longer needed for v1; keep the idea for refreshes.
- **Call to action: "Ask for an invite."** A form that emails software@joshsano.com.au with name, business, suburb/state, email, mobile, crew size, current software. **The site must not take sign-ups.** Lead routing (reconciliation item 19) is therefore email; posting to the app's leads inbox is optional extra.
- **Legal:** footer link **Terms of Service → https://painttradehq.co/terms** (the app's page, no local copy); **no Privacy link or page**; footer line "© 2026 Josh Sano Painting and Decorating, trading as Paint Trade HQ"; contact software@joshsano.com.au.
- **Links:** "Sign in" → `https://painttradehq.co/admin/login`; crew door `/crew`. No checkout, no app-store badges.
- **Hero line** from the app's sign-in page: "Fast, accurate estimating · Invoicing and a live project tracker that follow the quote · CRM and an AI assistant that learns your workflow · Product library, employee records and calendar". The assistant is "powered by Anthropic" if named.
- **Look:** same tokens; 12 px card radius, 8 px button radius; **solid accent buttons with white text**.
- **Domain:** Josh owns `.co`, `.com` and `.com.au`; the site can sit on `.com`, `.com.au` or `www.painttradehq.co`. Josh's call; the build reads the final URL from one config value.
- **The 8 confirmations** in the reconciliation are treated as true: the pack says every claim in the knowledge file is live except what its §9 lists.

**v1 page list is now five pages plus the chat box:** Home · Features · Pricing · Story · Ask for an invite. Terms is an external link. **D1 is taken as recommended** (static Astro site in this repo, Cloudflare Pages Functions for the chat box and the invite email); hosting account and domain remain Josh's call.

---

## 0. The recommendation in one paragraph

Build a **separate, static marketing site** at `www.painttradehq.com` (Astro, kept in this repo under `website/`, deployed on Cloudflare Pages or Vercel). **Seven pages for v1.** Use the app's own brand system (warm paper background, purple accent, Fraunces headings) so site and app feel like one product. Imagery is **real app screenshots captured automatically** from a neutral demo account, plus **real job-site and crew photos** from Josh Sano Painting & Decorating, not stock or AI art. The lead form posts to the app's existing `POST /api/signup-leads` endpoint, so enquiries land in the Settings › Platform › Signup leads inbox you already use. Launch the site as **"early access"**, because self-serve sign-up is invite-code gated today, and flip the copy to "Start free trial" with one setting when the gate opens.

---

## 1. What the website has to do

1. **Explain it in ten seconds** to an Australian painting contractor on a phone: quotes, jobs, crew, invoices, in one place, built by a painter.
2. **Prove it is real.** Real screens, the real client-side quote experience, a founder story with a face.
3. **Capture leads** for the tester program → `signup_leads` inbox.
4. **Send the ready ones to the app** (`app.painttradehq.com/signup`, carrying the invite code when there is one).
5. **Be findable** for "painting quoting software Australia", "painter estimating app", "painting business app" (basic SEO now, content in v2).
6. **Hold the legal pages** from the same source as the app (`GET /api/public/legal/terms|privacy`).

---

## 2. Decisions needed (batched, pick one per line)

### D1 — Where the site lives
| Option | Pros | Cons |
|---|---|---|
| **A. Static site in this repo (`website/`, Astro) — recommended** | Fast, best SEO and Lighthouse, free hosting, Claude Code builds and iterates it here, zero risk to the app, deploys independently of app releases | Another thing to deploy (one-time setup) |
| B. Inside the Expo app (`frontend/app/welcome.tsx`) | One deploy | React-Native-Web is poor for marketing pages (heavy bundle, weaker SEO), ties marketing changes to app releases on Emergent, the existing page is legacy dark theme with fabricated content |
| C. Framer / Webflow | You can tweak visuals yourself, quick to look polished | Monthly cost, forms need glue (Zapier) to reach the leads endpoint, harder for Claude Code to maintain, brand consistency drifts from the app |

### D2 — Launch posture
- **"Early access / Join the tester program"** (truthful today: `TESTER_INVITES_REQUIRED=1` with per-tester invite codes and access dates) — **recommended now**.
- "Start your free trial" — only once the invite gate is off.

### D3 — Trial length — **answered 23 Oct**
Josh's chat-knowledge file settles it: **14 days on Enterprise, no card needed**, once sign-up opens. During the tester program the site says "free for invited testers". (At Round 64 the code granted 90 days at sign-up and 14 in Stripe; confirm the sign-up default now matches.)

### D4 — Show pricing during early access? — **answered 23 Oct**
Show it, labelled "Plans open at launch · testers use everything free". The plans are now (AUD a month, **ex-GST, +10%**): **Starter $59** (1 admin, 3 employees) · **Small business $179** (2 admins, 5 employees) · **Enterprise $249** (3 admins, 15 employees); extra admin seat $25/$25/$42, extra employee seat $15/$15/$25; monthly only, no annual; 14-day trial on Enterprise. The feature split per plan is in `chat-knowledge.md` §6. The public `pricing-config` endpoint may now return these plans; read it live if it does, otherwise hardcode from §6 and say both the ex-GST and the inc-GST figure the first time, as the file asks.

### D5 — Domains — **mostly answered 23 Oct**
The live domain is **painttradehq.co** (the admin app lives there; crew sign in at `/crew`; Terms at `/terms`). Open question: does the marketing site take the apex `painttradehq.co` with the app moving to `app.painttradehq.co`, or does the site sit at `www.painttradehq.co` while the app keeps the apex? Recommendation: site on the apex, app on `app.`, with redirects for the existing `/quote`, `/invoice`, `/report` and `/variation` links so nothing a client already holds breaks. The old code also referenced `www.painttradehq.com` and `pthq.app`; confirm whether those are still owned.

### D6 — Photos
- **Real** job-site, crew and founder photos from Josh Sano Painting & Decorating (needs consent from anyone whose face appears) — **recommended**.
- Stock / AI-generated (the current `frontend/public/marketing/img_*.png` are AI-style illustrations in an off-brand teal). Not recommended for a trust-driven trade market.

### D7 — The AI's public name — **answered 23 Oct**
"Lucy" stays; the chat-knowledge file uses it throughout and defines her scope (§4.12).

---

## 3. Pages

### v1 — seven pages (launch)
| # | Page | Purpose | Sections (cards, top to bottom) |
|---|---|---|---|
| 1 | **Home** `/` | The pitch | Hero (headline + one real screenshot + early-access CTA) · "Built by a painter" proof strip · Three pillars: Quote it · Run it · Get paid · **"What your client sees"** (the real public quote page, embedded or captured, with Accept & sign) · Crew on site (GPS clock, daily reports, phone-width shots) · Lucy card · Founder story teaser · Early-access CTA · Truthful FAQ · Footer |
| 2 | **Features** `/features` | One long page with anchors (split into sub-pages in v2) | Quotes & estimates · Client quote link & e-signature · Invoices & deposits · Projects, variations, photos · Crew: time clock, timesheets, daily reports · HR: onboarding, contracts, training, performance, equipment · CRM & leads · Calendar · Library & products · Lucy AI · Settings & branding |
| 3 | **Pricing** `/pricing` | Plans | Standard vs Pro cards, monthly/annual toggle, "what Pro adds" list (from the access gates in code), early-access note, billing FAQ |
| 4 | **Story** `/about` | Trust | Josh, Melbourne, why a painter built this, the real business as customer zero, photo, timeline |
| 5 | **Ask for an invite** `/invite` | Lead capture | Form (name, business, suburb/state, email, mobile, crew size, current software) → emails software@joshsano.com.au; "Josh reads these himself and will be in touch"; link to Sign in for people who already have access |
| — | Terms of Service | Legal | External footer link to https://painttradehq.co/terms (no local page; no Privacy link during the tester program) |
| + | **Chat box** (on every page) | Answers and lead capture | A small chat panel that answers only from `chat-knowledge.md`, in its voice and rules, and hands anything it cannot answer to Josh with an email capture (that file's §10) |

Plus redirects: `/signup` → `app.painttradehq.com/signup` (pass `?code=&email=` through), `/login` → `app.painttradehq.com/admin/login`.

### v2 — after launch
Per-feature deep dives (Quoting · Invoicing · Jobs · Crew · HR · Lucy) · Compare page (vs spreadsheets, vs generic trade apps — only with claims we can back) · Guides/blog for SEO ("how to quote an interior repaint", "painter daily report template", "GST on painting quotes") · public Help Centre · What's new (changelog, once the app exposes updates publicly) · Case study: Josh Sano P&D after real usage numbers exist · Integrations page.

---

## 4. How to make it attractive

- **Same brand as the app.** Background `#FAF9F6`, surface white, accent `#4B3E86` (hover `#5C4C9E`, tint `#F1EEFA`, ink `#34295E`), text `#1E1C1A`, borders `#E7E3DA`. Fraunces for headings, Inter for body, IBM Plex Mono for numbers and prices. Radii 8/12/16. The app calls this "Warm Craftsman Precision". Logo: purple rounded square with white P (`brand_logo_files/logo.svg` and the Drive brand kit).
- **Typography-led, screenshot-rich, not stock-photo-led.** Big real screens on the paper background with a soft shadow; one real human photo per page, maximum.
- **The killer demo:** "This is what your client gets." Show the public quote page with the Accept & sign dialog. Nobody else in this market shows the client side so clearly. Consider a 20-second looping screen recording of a client accepting a quote.
- **Trust devices:** founder photo and name, "Built in Melbourne by a working painter", ABN and legal entity in the footer, Australian spelling, prices incl. GST, Privacy Act wording.
- **Motion:** restrained. Fade-in on scroll, the quote demo loop, nothing that slows a phone.
- **Phone first.** Most painters will open this on a phone from a Facebook group or a text.
- **No fake social proof.** The old page's "50+ painters, 4,200 quotes, $2.4M tracked" and eight testimonials (Damo, Sarah, Mick…) are fabricated. Replace with the honest early-access story until real numbers exist.

---

## 5. Photos and screenshots — static vs dynamic

### Static (made once)
- Brand marks: `brand_logo_files/logo.svg` + PNG set; Drive "Brand Kit" doc has the four logo variants.
- Founder and crew photos (real, consented). Job-site photos (real).
- At most two illustrations, drawn in the brand palette.

### Dynamic (auto-captured, so they never go stale)
The UI changes every build round, so hand-made screenshots rot. Add `website/scripts/capture-screens.ts` (Playwright, already in the environment) that logs into a **neutral demo tenant** (not Josh Sano branding, no test names like "Jane Whitfield") and captures at 1440 px and 390 px:
dashboard · estimates list · estimate builder with a populated quote · public quote page · accept-and-sign dialog · invoice and public invoice page · projects board · project detail with before/after photos · calendar · time clock (phone) · daily report (phone) · Lucy chat · Settings › PDF & brand design.
Output to `website/public/screens/`. Re-run on demand or on each app release.

### What exists today and whether it is usable
| Folder in the app repo | What it is | Usable? |
|---|---|---|
| `memory/reports/shots/` (72 JPEGs, Sept 2026) | Current light theme: onboarding, estimates list, builder, public quote, accept dialog, signed state | For mock-ups yes; re-capture before publishing (Josh Sano branding + test names) |
| `design-captures/batch-b-populated/` and the numbered folders | Mixed eras from the redesign | Check per image; many are pre-redesign |
| `frontend/assets/marketing/screen-*.jpg` | **Legacy dark theme** with the old JSPD logo (used by the old welcome page) | No |
| `frontend/assets/images/team-photo.jpg` | Real photo of three Josh Sano painters beside the branded van (1600×1066) | Yes, with consent, where the site shows JSPD as customer zero |
| `frontend/public/marketing/img_01..10.png` | Lifestyle photos of tradies with phones and tablets (1408×768, likely AI-generated, provenance unknown, unreferenced in code) plus a couple of teal illustrations | Mood imagery only, and only once provenance is confirmed; real photos preferred |
| `frontend/public/library-photos/*.webp` | 127 clean 640×640 surface photos (doors, fences, gutters, ceilings) shipped with the item library | Yes, for a small "surface library" strip; too small for hero use |
| `design-samples/claude-round5/*.html`, `memory/specs/**/*.html` | HTML prototypes | Reference only |

---

## 6. Connectors

### Website → app
| Need | Endpoint today | Notes |
|---|---|---|
| Lead form and chat-box leads | `POST /api/signup-leads` (public, no token) **and/or** email to software@joshsano.com.au | Josh's chat-knowledge file §10 asks for leads by email. The API puts them in Settings › Platform › Signup leads but sends no notification. Recommendation: do both (email Josh via Resend, and post to the API) so nothing is missed. Fields: `business_name`, `owner_name`, `email`, `phone`, `notes`. **No rate limit and no spam check on the API route**; add a honeypot and Cloudflare Turnstile on the site before going live. |
| Chat box | A small serverless function beside the site (Cloudflare Pages Function or Vercel) that calls the Claude API with `chat-knowledge.md` as the system prompt, streams the reply, and posts captured leads as above | Options: **(A) serverless function beside the site, recommended**: full control, on-brand, pennies per conversation, no coupling to app deploys. (B) a public route on the app backend reusing its Claude key and audit log: couples the website to app releases and exposes the app to abuse. (C) a third-party widget (Crisp, Intercom): monthly cost, off-brand, hard to pin to one file. Needs an Anthropic API key, a per-IP rate limit and a daily spend cap. |
| Sign-up CTA | `app.painttradehq.com/signup?code=&email=` | Invite-code gated via `SIGNUP_INVITE_CODE` / tester invites. `GET /api/auth/signup-config` (public) tells the site whether a code is required, so the CTA copy can switch automatically. |
| Pricing | `GET /api/billing/pricing-config` | Public (verified: the router dependency passes anonymous GETs). Returns plans, AUD prices, `trial_days` and the Stripe publishable key. Read it live so prices never drift. |
| Legal text | `GET /api/public/legal/terms` and `/privacy` (public) | Returns markdown + version. Render on the site so the app and site never drift. Docs are 1.0-draft with `[Legal entity name]` placeholders. |
| App version | `GET /api/version` (public) | Could power a small "latest build" line. |
| What's new | `GET /api/updates` (signed-in only) | Public changelog is v2 and needs a small backend change. |
| CORS | `CORS_ORIGINS` env, explicit allowlist | Add `https://www.painttradehq.com` (and `https://painttradehq.com`) to the backend env before the form will work. |

### Third parties
- **Analytics:** Cloudflare Web Analytics or Plausible (privacy-friendly, no cookie banner). GA4 only if you want ads attribution later.
- **Email:** no separate newsletter tool for v1. Leads live in the app. Optional later: auto-reply via Resend once the sending domain is verified (it was still `onboarding@resend.dev` as of 8 Sept 2026).
- **Video:** one 60-second walkthrough (Descript is connected). Host on YouTube unlisted or Cloudflare Stream.
- **Social:** links from the Notion "Social Platforms Hub".
- **Canva:** OG/share images and social tiles from the brand kit.

### Integrations the website may list (the app's own)
Stripe (subscription billing, platform-managed) · Resend email · Google Calendar, Outlook, Apple Calendar (overlay; confirm two-way before claiming) · Google Drive and OneDrive file storage · Twilio SMS (business supplies its own Twilio account) · Claude (the AI).
**Not present:** Xero, MYOB, QuickBooks. Do not list accounting.

---

## 7. What the website must not say (short list — full table in the briefing)
- Clients can pay by card online. (Removed in Round 61b; public invoice is bank transfer only. The Stripe checkout route still exists in the backend but no page calls it.)
- There is an iPhone/Android app. (Web app + PWA install banner only; `mobile/` is an untouched Expo template.)
- It works offline. (Service worker serves an offline page; no offline queueing.)
- AI estimates from a photo or plan; AI photo validation. (Neither exists; F12/F14 are parked.)
- Any customer count, quotes generated, dollars tracked, or testimonials. (None real yet.)
- "14-day free trial". (See D3.)
- Xero/MYOB integration.
- SMS "out of the box". (Needs the business's own Twilio credentials.)
- Geofence warnings on clock-in. (The backend supports it, but the crew screens never send a project id, so no warning ever appears. Say "GPS-stamped clock-in".)
- Daily reports going to clients. (Crew-to-owner only. The client-facing document is the completion report.)
- "AI morning briefing". (The Today briefing is built by code; the AI-written brief is never displayed.)
- Drag-and-drop Kanban. (Status columns with advance buttons.)
- Two-way calendar sync. (Read-only overlays of Google, Outlook and iCloud.)
- "Send from your own domain". (Partial; no screen sets the from-address.)
- Lucy "does things for you". (She reads your data and saves reminders and ideas; she does not send, book or edit.)
- A sales pipeline board. (Lead statuses only.)
- Text polish or voice notes. (Removed.)
- Full admin on your phone. (Below 768 px the admin shell has no navigation; crew screens are phone-first, admin is desktop-first.)
- A free plan or annual pricing. (Three monthly plans; 14-day trial on Enterprise only.)
- Phone push notifications for the crew. (In-app notices today; Josh's file says push is "coming", so say "coming", never "live".)
- Xero connected. ("On the list; not connected yet." No MYOB.)
- Provider names (Emergent, Resend, Twilio, Stripe) unless a visitor asks how something works.
- Launch dates.

---

## 8. Build plan (one line at a time, no side quests)

1. **Decisions D1–D7** (you, 10 minutes).
2. **Scaffold** `website/` with the brand tokens, layout, header/footer, and the Early-access form wired to `signup-leads`. Deploy a preview URL.
3. **Home** with real screens from `memory/reports/shots` as placeholders.
4. **Features, Pricing, Story, Terms, Privacy.**
5. **Demo tenant + capture script**, swap in clean screenshots.
6. **Backend tweaks** (CORS origin, lead-route rate limit, optionally public pricing route) in the app repo.
7. **DNS, analytics, OG images, Lighthouse and SEO pass, launch.**
8. v2 content (guides, feature pages, case study) only after launch.

---

## 9. Open questions for Joshy
- Do you own `painttradehq.com` and `pthq.app`, and where is DNS managed?
- Hosting on Cloudflare Pages or Vercel (both free at this size) OK?
- Legal entity name, ABN and registered address for the footer and the legal docs.
- Which crew/clients can appear in photos (consent)?
- Keep "Lucy" as the public name?
- Name for the neutral demo business used in screenshots (e.g. "Harbour Painting Co").
- Should early-access applicants get an auto-reply email?
