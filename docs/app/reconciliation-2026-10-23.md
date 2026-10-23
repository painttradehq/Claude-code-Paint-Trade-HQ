# Reconciliation — Round 64 audit vs Josh's chat-knowledge file (Round 83)

_23 October 2026. Two sources now describe the app: `docs/app/pthq-app-briefing.md` (a read-only code audit at GitHub HEAD `7139b03`, Round 64, 4 Oct) and `docs/website/chat-knowledge.md` (Josh's statement of what the app does at Round 83 on preview / Round 82 published, 23 Oct). Nineteen rounds separate them and the app repo is not readable from here, so the newer file could not be checked against code. This table says, item by item, which source wins for website copy and what still needs a yes from Josh._

**Rule:** for anything a visitor can read (website pages, the chat box), the chat-knowledge file wins, because it is newer and Josh owns it. For engineering facts (endpoints, env keys, bugs), the audit stands until the code can be re-read. Items marked **confirm** are where the two disagree in a way that matters.

| # | Topic | Round 64 audit said | Chat-knowledge (Round 83) says | For the website | Status |
|---|---|---|---|---|---|
| 1 | Domain | Code referenced `www.painttradehq.com`, `app.painttradehq.com`, `pthq.app` | Admin app at **painttradehq.co**; Terms at painttradehq.co/terms; crew sign-in at `/crew` | Use **painttradehq.co**. Decide whether the marketing site is the apex and the app moves to `app.painttradehq.co`, or the site lives at `www.` | **confirm** (where does the site sit relative to the app?) |
| 2 | Plans and prices | Standard $49/mo or $470/yr, Pro $119/mo or $1,140/yr, AUD, incl. annual | **Starter $59, Small business $179, Enterprise $249** a month, **ex-GST (+10%)**, seats (admins 1/2/3, employees 3/5/15), extra admin $25/$25/$42, extra employee $15/$15/$25, **monthly only**, billing built but **not switched on** | Publish the new table with "Plans open at launch; testers use everything free" | changed, file wins |
| 3 | Trial | 90 days at sign-up vs 14 in Stripe (inconsistent) | **14 days on Enterprise, no card** | Say "14-day trial on Enterprise, no card needed" once sign-up opens; during the tester program say "free for invited testers" | D3 answered by the file |
| 4 | Sign-up | Invite-code gated (`TESTER_INVITES_REQUIRED=1`) | Invite only; "leave your details and Josh will send an invite" | Early-access posture confirmed | consistent, D2 answered |
| 5 | Feature gating by plan | Hard Pro gates on Contracts, Training, Performance, Equipment, Team admins, AI price refresh; everything else ungated | Three tiers with a published feature split (Starter: dashboard, quoting, invoicing, CRM, calendar, employees, projects · Small business adds presentation pages, auto-invoicing, Lucy, SMS, Timesheets, performance stats, AI summaries · Enterprise adds Performance, training videos, HR contracts, daily reports, Equipment, migration) | Use the file's split on the pricing page | changed, file wins |
| 6 | GPS geofence | GPS stamping live; **warning dormant** (crew screens never sent a project id) | "flags a sign-in outside the job's radius" | Safe wording either way: "records location and distance from the job site at sign-in and sign-out and flags sign-ins outside the job's radius" only if confirmed | **confirm** |
| 7 | Morning brief | Today briefing built by code; the AI-written brief was never displayed | "Lucy's morning brief, written from your own data" | Say "Lucy writes a morning brief from your own data" only if confirmed | **confirm** |
| 8 | AI price suggestions | No such feature (only the products price refresh) | "AI price suggestions are starting points you check"; Lucy "suggests prices from your Library" | Hold until confirmed | **confirm** |
| 9 | Presentation pages | Partial: toggle stored, not rendered on the client quote | Plan feature, built from blocks (about, team, photos, reviews from eleven platforms, guarantees), on by default | Likely built in rounds 65–83; show on the Features page as a Small business feature once confirmed | **confirm** |
| 10 | Auto-invoicing | Not present | Plan feature (Small business and up) | New; list once confirmed | **confirm** |
| 11 | Xero | Nothing | Connect button exists, **not set up on the server** | "Xero is on the list; not connected yet." No MYOB. | consistent |
| 12 | Calendar | Google/Outlook/Apple read-only overlays | "Connect Google Calendar (works today)"; Outlook not set up | Say "see your Google Calendar alongside your jobs". Do not say sync. | consistent |
| 13 | Connected inbox | Read-only sync; replies went out from the platform sender | "Email in and out from your connected mailbox" | Say "see client replies in the CRM"; say "send from your own mailbox" only if confirmed | **confirm** |
| 14 | SMS | Needs the business's own Twilio | Same; Small business and up | "Through your own SMS number" | consistent |
| 15 | Daily reports | Crew-to-owner only; completion report is the client document | Enterprise feature; completion report draws on them | Consistent. Never say clients get daily reports. | consistent |
| 16 | Client card payments | Removed (bank transfer only) | None, by design; "the app never takes their card" | Say exactly that | consistent |
| 17 | Legal | Terms and Privacy both 1.0-draft with placeholders | **Terms v1.2 (22 Oct), lawyer-reviewed for the tester program**; no separate Privacy Policy during the tester program (Terms §5 covers it); legal entity Josh Sano Painting and Decorating trading as Paint Trade HQ | Website has a Terms page; "Privacy" links to Terms §5 for now | changed, file wins |
| 18 | Support | None stated | software@joshsano.com.au (support@painttradehq.co being set up) | Footer and chat-box hand-off | new |
| 19 | Lead capture | `POST /api/signup-leads` (public, lands in Settings › Platform) | "Website enquiry forms into the CRM: none"; chat box sends leads **by email** to software@joshsano.com.au | Both are true (the leads inbox is platform-level, not the CRM). Decide where website leads land: email, the leads inbox, or both | **confirm** (recommend both) |
| 20 | Crew app | Phone-web screens under `/employee/*` | A crew app at `/crew`, controlled from Settings › Crew app; in-app reminders now, phone push "coming" | Say "web app for the crew's phones, add to home screen"; never promise push or store apps | changed, file wins |
| 21 | Operating hours, overtime rate, auto sign-out, payroll CSV | Auto sign-out, overtime thresholds and CSV existed; no operating hours or overtime rate | All present | Fine to list under Timesheets (Small business and up) | new, file wins |
| 22 | Data export and account closure | Not audited | PDF/CSV exports; 30-day retention then deletion; backups overwritten within 60 more days | Use in the Trust section | new |
| 23 | Native app, offline, AI estimating from photos, AI photo validation | Do not exist | Not claimed; "no App Store app" | Keep on the must-not-say list | consistent |
| 24 | Reviews platforms | Not audited | Reviews and ratings from eleven platforms on presentation pages | Only if item 9 is confirmed | **confirm** |
| 25 | Security bugs from the audit (password hash logged, unlimited signup-leads, plain-text Twilio token, `.tok` and `_creds.py` tracked) | Open at Round 64 | Not mentioned | Ask whether rounds 65–83 fixed them | **confirm** |

## What this means for the website

- **Domain, pricing, plans, trial, legal pages, support email** come from the chat-knowledge file now. The website plan has been updated accordingly.
- **The chat box is part of v1.** The file is written as its system prompt: voice, truth rules, lead capture, escalation, FAQs. It should answer only from that file and hand anything else to Josh with an email capture.
- **Eight items need a yes or a correction from Josh** before they appear on a page: 1, 6, 7, 8, 9, 10, 13, 19 (and 25 for the app team).
