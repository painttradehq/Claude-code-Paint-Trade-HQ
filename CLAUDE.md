# CLAUDE.md — Paint Trade HQ workspace

This file is loaded automatically at the start of every Claude Code session in this repo. It is the persistent memory for the Paint Trade HQ (PTHQ) project. Keep it under ~200 lines; put detail in `docs/`.

## Who you are working with

- **Joshy (Josh Sano)**, owner of Josh Sano Painting & Decorating (JSPD), Melbourne. Building PTHQ, a SaaS for painting contractors. Pre-launch, no paying customers, tester program running.
- Non-technical, very creative, lots of ideas. Wants to be **kept on one line until it ships** before starting the next thing. Say so when a new idea appears mid-task.
- How to work with Joshy (from their profile and the app repo's `memory/USER_PRINCIPLES.md`):
  - Accuracy over optimism. Always separate **live** from **planned**. Never round up.
  - Code analysis in two passes: inventory first, then targeted deep reads. No surface-level summaries.
  - Push back with reasons; no sycophancy. New task → offer 2–3 ways with pros/cons.
  - Plain English, but spell out real trade-offs fully.
  - Batch decisions into one list rather than many back-to-back questions.
  - Joshy thinks in **cards, sections, tabs**. Use those words. Screenshots and concrete examples land better than abstractions.
  - Keep a record: when Joshy says "remember this", write it here or in `docs/`.

## Two different things called "Josh Sano"

- **JSPD** = the painting business (customer zero). Canva designs titled "Josh Sano…" and "JoshSano_BrandCollateral" are JSPD, not PTHQ.
- **PTHQ** = the SaaS. Brand kit: Google Drive folder "Paint Trade HQ — Brand & Marketing" → doc "Paint Trade HQ — Brand Kit (logo + colours)". Purple rounded square with a white P.

## Where the code is

- **This repo** (`painttradehq/Claude-code-Paint-Trade-HQ`) holds Claude-managed files only: docs, plans, the marketing website. Do not copy app source in here.
- **App source**: `painttradehq/the-newest-update-of-PTHQ` (**public** GitHub repo). In a cloud session: `add_repo` it, then clone to `/home/user/painttradehq/the-newest-update-of-pthq`. Read access only unless attached with push access.
- Inside the app repo, the truthful docs are: `memory/PRD.md` (the **tail** is newest; entries are dated), `memory/reports/roundNN-*.md` (one per build round, Round 64 = 4 Oct 2026), `memory/USER_PRINCIPLES.md`, `DEPLOY.md`. `ARCHITECTURE.md` and `memory/FORK_HANDOFF_SUMMARY.md` are **August 2026 snapshots and stale**.
- Never open `memory/.tok` or `backend/tests/_creds.py` in the app repo (credential-like files tracked in a public repo, not git-ignored; flagged to Joshy to check and rotate).

## The app in one screen (verified 5 Oct 2026 at HEAD `7139b03`, "Round 64")

- **Stack:** Expo SDK 54 / React Native Web / expo-router frontend (`frontend/`), FastAPI + Motor/MongoDB backend (`backend/`), JWT auth, multi-tenant by `owner_admin_id` on every query, WeasyPrint PDFs, Stripe subscriptions, Resend email, per-tenant Twilio SMS, Anthropic SDK for AI (the app's own key, model from `AI_MODEL` env), Google/Outlook/Apple calendar, Google Drive/OneDrive/GCS storage, APScheduler jobs in a separate `worker.py`.
- **Surfaces:** web admin (desktop-first, the only one being built), crew surface at `frontend/app/employee/*` (phone layouts in the same web bundle), PWA install banner. **No native iOS/Android app** (`mobile/` is an untouched Expo template). `frontend/app.json` still says "For Painters" / `com.sanopaint.crew`.
- **Hosting and the live dev environment:** the app is built by an agent on the Emergent platform. Emergent job id `b55b8df9-f0c5-41c7-80d1-f174b2874432` (env slug `pthq-replica`); the `mcp__Emergent__*` tools can read its status and preview, and `send_message` can ask it questions (never while it is mid-round unless Joshy says so). Preview `https://pthq-replica.preview.emergentagent.com/`. **The Emergent workspace runs ahead of GitHub:** on 7 Oct 2026 it was mid Round 67 while GitHub HEAD was Round 64, because Joshy pushes to GitHub by hand. Check `memory/PRD.md` tail and the Emergent job before trusting round numbers. CORS lists `painttradehq.emergent.host`. Domains referenced in code: `www.painttradehq.com`, `app.painttradehq.com`, `pthq.app`. Owner deploys separately. Production needs the `worker` process too (Round 63).
- **Quality:** 724 backend tests pass, 110 skipped, 0 failed; `tsc` clean; a testing agent runs browser checks each round. Ruff for Python.
- **Brand tokens** (`frontend/theme/tokens.ts`): bg `#FAF9F6`, surface `#FFFFFF`, sunken `#F4F2EE`, border `#E7E3DA`, accent `#4B3E86` (hover `#5C4C9E`, tint `#F1EEFA`, ink `#34295E`), text `#1E1C1A` / `#6B675F` / `#9B968A`, success `#1C8A4B`, warning `#B45309`, danger `#C6382E`. Fonts: Fraunces (display), Inter (body), IBM Plex Mono (numbers). Radii 8/12/16/20. "Warm Craftsman Precision". The old black/neon-cyan theme is legacy.
- **Pricing in code:** Standard $49/mo or $470/yr, Pro $119/mo or $1,140/yr, AUD. **Trial is inconsistent:** sign-up grants 90 days (`SIGNUP_TRIAL_DAYS`), Stripe Checkout grants 14 days, the old marketing page says 14 days and "$468/yr". Decision pending.
- **Sign-up:** `app/admin/signup.tsx`; invite-gated by `TESTER_INVITES_REQUIRED=1` (default) plus per-tester hashed invite codes with a 5-attempt lockout; `SIGNUP_INVITE_CODE` no longer exists. `GET /api/auth/signup-config` (public) says whether a code is required. Every trial sign-up is created as tier `pro`. Leads: `POST /api/signup-leads` (public, **no rate limit**, no notification, no auto-reply). `/api/leads/inbound` was removed in Round 41. `GET /api/billing/pricing-config` **is public** (the router dependency passes anonymous GETs), so a website can read plans and prices live.
- **AI:** the assistant is called **Lucy** (chat over 18 read-only tools, reminders and ideas, AI drafts in Review & Send and the CRM composer, client summaries, products price refresh), per-business daily allowance, audit log, admin only. The dashboard **Today briefing is built by code, not AI**; Claude writes a daily four-line brief that no screen shows. Text polish and voice transcription were removed. No AI estimating from photos or plans, no AI photo validation.
- **Email:** Resend live; sending domain was still the `resend.dev` test sender as of 8 Sept 2026 (re-check before claiming).
- **Legal:** `backend/content/legal/terms.md` and `privacy.md` are real 1.0-draft documents (~1,900 words each, Australian Privacy Principles) with `[Legal entity name]` placeholders; served at `GET /api/public/legal/{key}`; acceptance recorded at sign-up. Lawyer review still needed. `privacy.md` wrongly names OpenAI via Emergent as the AI provider (the code uses Anthropic).

## Feature status — the rule

Before saying any feature is live, planned or missing, read **`docs/app/pthq-app-briefing.md`** (module-by-module table with evidence and adversarial verdicts) or the code at HEAD. Never rely on `frontend/app/welcome.tsx` (legacy marketing page with fabricated testimonials and stats) or on `ARCHITECTURE.md`.

Headline truths as of 7 Oct 2026 (HEAD `7139b03`): public quote link with optional extras and draw/type e-signature **live**; quote and invoice PDFs **live**; deposit invoice auto-drafted on acceptance **live**; project auto-created on acceptance **live**; variations with public approve/decline **live**; completion report with public link and PDF **live**; GPS clock-in/out **live** but the **geofence warning is dormant** (crew screens never send a project id); timesheets, payroll CSV, daily reports, QR onboarding, crew-signed contracts, training, performance, equipment, team admins **live** (Contracts, Training, Performance, Equipment, Team admins are Pro-gated); calendar Google/Outlook/Apple are **read-only overlays**; Live Projects is a status board, **not drag-and-drop**; daily reports are **crew-to-owner only**, never client-facing; SMS needs the **business's own Twilio**; custom sending domain is **partial** (no UI sets the from-address); client online card payment **removed** (Round 61b, bank transfer only); native app, offline mode, AI photo/plan estimating, AI photo validation, sales-pipeline board, Xero/MYOB, testimonials and usage stats: **do not exist**. Section 3 of the briefing lists 22 bugs and risks for the app team, including one security item (the password hash is logged on every login).

## Website project (current workstream)

- Plan: **`docs/website/website-plan.md`**. Recommendation: separate static site (Astro) under `website/` in this repo, seven v1 pages, early-access posture, real screenshots captured by a Playwright script from a neutral demo tenant, lead form → `signup-leads`.
- Facts: **`docs/app/pthq-app-briefing.md`** (the audit; its section 4 lists the exact endpoints, domains and copy constraints the site depends on, section 7 the must-not-say list).
- Status (7 Oct 2026): plan and briefing done and pushed; GitHub push access to this repo works. Awaiting Joshy's decisions D1–D7 (where it lives, launch posture, trial wording, show pricing, domains, photos, Lucy's name). Next step once decided: scaffold `website/`, home page, early-access form.
- Decisions log: _(append here as Joshy decides)_

## Conventions in this repo

- Docs under `docs/` (`docs/app/` = facts about the app, `docs/website/` = website work). Website code under `website/`.
- Work on the branch the session names; commit with clear messages; push with `git push -u origin <branch>`.
- When facts about the app change (new round in the app repo), update `docs/app/pthq-app-briefing.md` and the "one screen" section above, with the HEAD commit and date.
