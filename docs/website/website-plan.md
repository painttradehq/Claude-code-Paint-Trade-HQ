# Paint Trade HQ — Marketing Website Plan (v1)

_Drafted 5 October 2026 from a read of the app source at `painttradehq/the-newest-update-of-pthq` (HEAD "Round 64"). Status: **draft for Joshy's decisions**. Companion fact file: `docs/app/pthq-app-briefing.md` (what is live vs planned — the website must not claim anything that file marks as not live)._

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
- **"Early access / Join the tester program"** (truthful today: `SIGNUP_INVITE_CODE` gate, tester invites with access dates) — **recommended now**.
- "Start your free trial" — only once the invite gate is off.

### D3 — Trial length (the code disagrees with itself)
- Sign-up grants **90 days** (`SIGNUP_TRIAL_DAYS` default in `server.py` and `billing.py`).
- Stripe Checkout grants **14 days** (`trial_period_days: 14` in `billing.py`).
- The old marketing page says **14 days**, and "$468/year" for Standard where the code says $470.
- **Recommendation:** during early access say "Free while you're in the tester program" and publish no number. Fix the 14 vs 90 split in the app before public launch.

### D4 — Show pricing during early access?
Plans in code: **Standard $49/mo or $470/yr, Pro $119/mo or $1,140/yr, AUD** (`billing.py` pricing-config). Note: that endpoint sits behind the owner-billing router dependency, so the website cannot fetch it anonymously today; either hardcode on the site or open that one route.
- Show it (transparency wins with tradies; filters tyre-kickers) — **recommended**, labelled "Pricing at launch · free during early access".
- Hide it until launch.

### D5 — Domains
Referenced in code: `www.painttradehq.com`, `app.painttradehq.com`, `pthq.app` (short quote/invoice links), `painttradehq.emergent.host`, `pthq-replica.preview.emergentagent.com`. Confirm which you own and where DNS is. Proposed: **www.painttradehq.com** = site, **app.painttradehq.com** = app, keep `pthq.app` for short client links only.

### D6 — Photos
- **Real** job-site, crew and founder photos from Josh Sano Painting & Decorating (needs consent from anyone whose face appears) — **recommended**.
- Stock / AI-generated (the current `frontend/public/marketing/img_*.png` are AI-style illustrations in an off-brand teal). Not recommended for a trust-driven trade market.

### D7 — The AI's public name
"Lucy" is used across the app (31 references in the UI). Keep "Lucy" on the website, with honest scope (reminders, morning brief, drafting, products refresh), or call it "AI assistant".

---

## 3. Pages

### v1 — seven pages (launch)
| # | Page | Purpose | Sections (cards, top to bottom) |
|---|---|---|---|
| 1 | **Home** `/` | The pitch | Hero (headline + one real screenshot + early-access CTA) · "Built by a painter" proof strip · Three pillars: Quote it · Run it · Get paid · **"What your client sees"** (the real public quote page, embedded or captured, with Accept & sign) · Crew on site (GPS clock, daily reports, phone-width shots) · Lucy card · Founder story teaser · Early-access CTA · Truthful FAQ · Footer |
| 2 | **Features** `/features` | One long page with anchors (split into sub-pages in v2) | Quotes & estimates · Client quote link & e-signature · Invoices & deposits · Projects, variations, photos · Crew: time clock, timesheets, daily reports · HR: onboarding, contracts, training, performance, equipment · CRM & leads · Calendar · Library & products · Lucy AI · Settings & branding |
| 3 | **Pricing** `/pricing` | Plans | Standard vs Pro cards, monthly/annual toggle, "what Pro adds" list (from the access gates in code), early-access note, billing FAQ |
| 4 | **Story** `/about` | Trust | Josh, Melbourne, why a painter built this, the real business as customer zero, photo, timeline |
| 5 | **Early access** `/early-access` | Lead capture | Form (business, your name, email, mobile, crew size, message) → `POST /api/signup-leads`; what happens next; link to `/signup` for people who already have a code |
| 6 | **Terms** `/terms` | Legal | Rendered from the app's markdown (one source) |
| 7 | **Privacy** `/privacy` | Legal | Same |

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
| `frontend/public/marketing/img_01..10.png` | AI-style illustrations, teal, off-brand | No |
| `design-samples/claude-round5/*.html`, `memory/specs/**/*.html` | HTML prototypes | Reference only |

---

## 6. Connectors

### Website → app
| Need | Endpoint today | Notes |
|---|---|---|
| Lead form | `POST /api/signup-leads` (public, no token) | Fields: `business_name`, `owner_name`, `email`, `phone`, `notes`. **No rate limit and no spam check on this route** (only `/api/auth/signup` is limited). Add a honeypot field on the site and a per-IP limit on the backend, or Cloudflare Turnstile, before going live. No auto-reply email is sent today. |
| Sign-up CTA | `app.painttradehq.com/signup?code=&email=` | Invite-code gated via `SIGNUP_INVITE_CODE` / tester invites. `GET /api/auth/signup-config` (public) tells the site whether a code is required, so the CTA copy can switch automatically. |
| Pricing | `GET /api/billing/pricing-config` | Docstring says public, but the billing router is mounted with the owner-billing dependency, so it is not reachable anonymously. Hardcode on the site, or open that one route. |
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
