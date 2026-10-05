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
- Never open `memory/.tok` in the app repo (credential-like file; flagged to Joshy to check and rotate).

## The app in one screen (verified 5 Oct 2026 at HEAD `7139b03`, "Round 64")

- **Stack:** Expo SDK 54 / React Native Web / expo-router frontend (`frontend/`), FastAPI + Motor/MongoDB backend (`backend/`), JWT auth, multi-tenant by `owner_admin_id` on every query, WeasyPrint PDFs, Stripe subscriptions, Resend email, per-tenant Twilio SMS, Anthropic SDK for AI (the app's own key, model from `AI_MODEL` env), Google/Outlook/Apple calendar, Google Drive/OneDrive/GCS storage, APScheduler jobs in a separate `worker.py`.
- **Surfaces:** web admin (desktop-first, the only one being built), crew surface at `frontend/app/employee/*` (phone layouts in the same web bundle), PWA install banner. **No native iOS/Android app** (`mobile/` is an untouched Expo template). `frontend/app.json` still says "For Painters" / `com.sanopaint.crew`.
- **Hosting:** built on the Emergent platform; preview `pthq-replica.preview.emergentagent.com`; CORS lists `painttradehq.emergent.host`. Domains referenced in code: `www.painttradehq.com`, `app.painttradehq.com`, `pthq.app`. Owner deploys separately. Production needs the `worker` process too (Round 63).
- **Quality:** 724 backend tests pass, 110 skipped, 0 failed; `tsc` clean; a testing agent runs browser checks each round. Ruff for Python.
- **Brand tokens** (`frontend/theme/tokens.ts`): bg `#FAF9F6`, surface `#FFFFFF`, sunken `#F4F2EE`, border `#E7E3DA`, accent `#4B3E86` (hover `#5C4C9E`, tint `#F1EEFA`, ink `#34295E`), text `#1E1C1A` / `#6B675F` / `#9B968A`, success `#1C8A4B`, warning `#B45309`, danger `#C6382E`. Fonts: Fraunces (display), Inter (body), IBM Plex Mono (numbers). Radii 8/12/16/20. "Warm Craftsman Precision". The old black/neon-cyan theme is legacy.
- **Pricing in code:** Standard $49/mo or $470/yr, Pro $119/mo or $1,140/yr, AUD. **Trial is inconsistent:** sign-up grants 90 days (`SIGNUP_TRIAL_DAYS`), Stripe Checkout grants 14 days, the old marketing page says 14 days and "$468/yr". Decision pending.
- **Sign-up:** `app/admin/signup.tsx`; invite-code gated (`SIGNUP_INVITE_CODE` / tester invites). `GET /api/auth/signup-config` (public) says whether a code is required. Leads: `POST /api/signup-leads` (public, no rate limit, no auto-reply). `/api/leads/inbound` was removed in Round 41.
- **AI:** the assistant is called **Lucy** (chat, reminders and ideas, morning brief, email polish, products price refresh), per-tenant daily allowance, audit log. No AI estimating from photos or plans.
- **Email:** Resend live; sending domain was still the `resend.dev` test sender as of 8 Sept 2026 (re-check before claiming).
- **Legal:** `backend/content/legal/terms.md` and `privacy.md` are real 1.0-draft documents (~1,900 words each, Australian Privacy Principles) with `[Legal entity name]` placeholders; served at `GET /api/public/legal/{key}`; acceptance recorded at sign-up. Lawyer review still needed.

## Feature status — the rule

Before saying any feature is live, planned or missing, read **`docs/app/pthq-app-briefing.md`** (module-by-module table with evidence and adversarial verdicts) or the code at HEAD. Never rely on `frontend/app/welcome.tsx` (legacy marketing page with fabricated testimonials and stats) or on `ARCHITECTURE.md`.

Headline truths as of 5 Oct 2026: public quote link with draw/type e-signature **live**; PDFs **live**; deposit invoice on acceptance **live** (Round 51); client online card payment **removed** (Round 61b, bank transfer only); GPS time clock with soft geofence **live**; variations with public accept/decline **live**; native app, offline mode, AI photo/plan estimating, AI photo validation, Xero/MYOB: **do not exist**.

## Website project (current workstream)

- Plan: **`docs/website/website-plan.md`**. Recommendation: separate static site (Astro) under `website/` in this repo, seven v1 pages, early-access posture, real screenshots captured by a Playwright script from a neutral demo tenant, lead form → `signup-leads`.
- Status: plan drafted, awaiting Joshy's decisions D1–D7 (where it lives, launch posture, trial wording, show pricing, domains, photos, Lucy's name).
- Decisions log: _(append here as Joshy decides)_

## Conventions in this repo

- Docs under `docs/` (`docs/app/` = facts about the app, `docs/website/` = website work). Website code under `website/`.
- Work on the branch the session names; commit with clear messages; push with `git push -u origin <branch>`.
- When facts about the app change (new round in the app repo), update `docs/app/pthq-app-briefing.md` and the "one screen" section above, with the HEAD commit and date.
