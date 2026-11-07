# Josh's notes of 7 November — checked against the code and sorted

Josh pasted 28 notes ("some of them have been done"). Each was checked against the app code on GitHub `main` (commit `82bf0a3`, 7 Nov 2026, cloned after Josh gave this chat the repository), the round records and the crew chat's log. File and line references are from that commit.

Emergent's record shows November work that neither chat sent (Josh ran it directly): crew sign-up audit (1 Nov), crew app audit (2 Nov), crew notification audit, crew Web Push, MYOB connector (mock only), slow Employees pages fixed, crew photos in admin + document expiry nudges, stay signed in 30 days + quote logo on the preview and client page, admin adds crew document types (7 Nov). The last commits say "needs a publish" — Josh to say whether he published after 7 Nov.

## A. Already done in the code (confirm on the live app after the publish)

| # | Josh's note | What the code says |
|---|---|---|
| 18 | Employee list and profile load slowly | Fixed 5 Nov: crew photos and documents were base64 inside the employee records; `services/employee_files.py` moves them to files at every write and a startup migration converts the old ones. Published? |
| 2 | Quote PDF: business name but no spot for the logo | The quote PDF prints the logo above the business name when one is set (`services/pdf.py:283`, max 140 × 44 px); 6 Nov added it to the builder preview and the client's quote page too. If your own PDF shows none, your logo is not set where the PDF reads it — Round 87 item 18 checks that field. |

## B. Not done, small, no prototype → **Round 87 — Fix Round H** (`fix-round-h-notes.md`, ready for "send")

| # | Josh's note | What the code says | Round 87 item |
|---|---|---|---|
| 3 | Exterior face picker stays open after one pick | `AreaPicker.tsx:35` `pickZone` adds the zone and keeps the panel open | 6 |
| 6 | CRM: remove the "New lead" button | `CrmHome.tsx:28` header button `crm-new-lead-btn`; the Leads empty state says "New lead, top right"; the dialog is in `LeadsView.tsx:148` | 7 |
| 7 | CRM inbox scrolling | `InboxView.tsx:21` is a grid with `minHeight: 560` and `overflow: hidden`; only the thread list has its own scroll (`:27`) | 8 |
| 11 | Equipment page shows no list | An Items tab with filters exists (`components/equipment/ItemsTab.tsx`, loaded from `GET /equipment/items`); why Josh sees none is to be found on his tenant (read-only) | 9, check first |
| 12a | Clicking the "JS" logo signs the admin out | **Confirmed:** the sidebar's user row is the sign-out button (`components/design-system/Sidebar.tsx:152`, wired in `AdminShell.tsx:96`); it is the only sign-out in the admin shell | 10 |
| 16 | Builder photo takes long to appear | `Photos.tsx:17` posts the file as taken, no resize on the device | 11 |
| 22 | Timesheets: delete a mistaken clock-in | No delete route (`routes/timeclock.py` has PUT and POST on records only); the person drawer lists sessions (`PersonDrawer.tsx:36`) | 13 |
| 23 | Estimates list: only the name is the link | `ClientLink` (`components/lists/ListKit.tsx:114`) inside the cell (`estimates.tsx:193`) | 14 |
| 24 | Quote details panel: keyboard keeps closing | **Cause found:** `QuoteDetails.tsx:58` defines `Sec` inside the component — the exact bug Round 77's F1 fixed in the Library editor | 15 |
| 25 | Quote email lands in Promotions | No plain-text part (`services/email.py:194` sends html only); From name fixed to "Paint Trade HQ" | 16 |
| 1 | New client form looks disoriented | `Dialogs.tsx:48` "More details"; layout to check at three widths | 17 |
| 2 | PDF logo field | which field the PDF reads vs where the Business page saves (`photo_url` / `logo_url` / `business_profile.logo_url` — `services/storage_check.py:36` lists all three) | 18, check first |
| 5, 12b, 20a | Photo from the device gallery or the camera | The builder already has **Take photo** (`capture="environment"`) and **Upload** (`accept="image/*"`) (`Photos.tsx:25`); the Library task photo has the camera; Settings' uploads have only a plain file input (`UploadDropzone.tsx:78`); nothing uses a cloud picker — on Android the phone decides which app answers "images" | 19 |
| 4, 17 | Library: few products; search by category | The catalogue has **1,034 products from 31 brands** (`backend/data/catalogue.json`; primer 157, interior 93, exterior 71 …). Each business gets a copy at sign-up; `POST /materials/seed-if-empty` adds any it lacks, non-destructively. The server search (`routes/materials.py:186`) matches name, description and use case only — not brand or category; the builder's own matcher does include them | 20 (count Josh's rows, offer the catalogue, search on brand and category) |
| 8 | Calendar: a day click opens that day by hours | `CalViews.tsx:58` a month cell click opens the new-event dialog at 9:00; a day mode of the week grid already exists (`CalViews.tsx:73–74`) | 21 (behaviour only; the layout changes are Round 91) |
| — | The seven October candidates (`fix-round-h-candidates.md`): email button text `#0a0a0a` (`routes/estimate_send.py:81`), business name falling back to the login (`:224`), two parked feedbacks, `memory/.tok` (still in the tree, 7 Nov), the owner signature on the countersign PDF (`routes/contracts.py:353` prints a name only), the Metro note | — | 1–5 |

## C. Needs a prototype first (design rounds, one each, in Josh's order)

| # | Josh's note | What the code says | Round |
|---|---|---|---|
| 13 + 14 | Areas move up and down; one product once; paint litres from coverage × m² × coats with a manual override | No area reorder exists. `estModel.ts:94 flatProducts` lists one row per **size** — the reason the same product shows several times. Materials carry `coverage_sqm_per_l` and `sizes`; the line panel has Prep · Prime · coat steps (`LinePanel.tsx:35`) | **Round 88 — Builder: order, products, paint quantities** (prototype on `estimate-builder-line-details.html`) |
| 21 | Prep presets kept in the Library, picked in the line panel, with "add new" there | The prep text is typed per line; Library › Repairs & prep has task groups (`library/tasks.tsx`) | **Round 89 — Prep presets** (rides with 88 if Josh wants) |
| 19 | More products per brand, registered by name and category | 1,034 products exist; what is missing is per brand — after Round 87's count, Josh says which brands or lines are short | **Round 90 — Catalogue additions** (from the brands' own pages, no invented rows; may not be needed) |
| 9, 10 | Calendar: filters in one dropdown; the three right-hand rails go | `events.tsx` with `CalRail.tsx` (attention + upcoming rails) and the four `QCATS` filters | **Round 91 — Calendar layout** (prototype from the current page; a screenshot from Josh helps but the code is enough) |
| 28 | Admin notified when the app is closed | Crew Web Push exists: `services/crew_push.py` (sends on every crew notification row), `routes/crew_push.py`, VAPID keys in `platform_keys`, `public/sw.js`. Nothing for admins | **Round 92 — Admin web push**: a subscription route for admins, the same hook on admin notification rows, Settings › Account › Notifications with per-event switches; installed app on desktop Chrome and Android, iPhone from the Home Screen |
| 15 | Trade accounts | Nothing in the code. Josh: each paint brand's trade account the business registers for (discounts); crew need to see them | **Round 93 — Trade accounts (admin half)**: where they are entered (per brand: account name, number, branch, notes) and which crew see them; the crew screen is the crew chat's |

## D. Crew app → the crew chat (this chat never touches `app/employee/*`)

| # | Josh's note | State |
|---|---|---|
| 26 | A job three weeks away shows under Today's jobs on the crew dashboard | A bug for the crew chat's next fix |
| 27 | Crew see each job's estimate as a PDF without prices | The crew chat's **Follow-up E "Scope screen (quote without money, marked photos, owner's hours switch)"** — prototyped and specified 1 Nov, not sent |
| 15 | Trade accounts, crew side | After Round 93 |

## E. Josh's answers (7 Nov)

1. Round 87: "wait" until the repository could be read — it can now (7 Nov, later).
2. Phone: both Android and iPhone must work.
3. Trade accounts = the brands' trade accounts (discounts); crew need them.
4. The repository: readable since Josh added it to the Claude GitHub App; GitHub `main` is current (Emergent's Save to GitHub works again — commits by `emergent-agent-e1` on 5–7 Nov).
5. DMARC: later.

Still wanted: whether the November builds were published; the timesheet screenshot and the keyboard video are no longer needed (the causes are in the code).

## F. Proposed order

Round 87 → the crew chat's Follow-up E and the Today's-jobs fix → 88 → 89 → 91 → 92 → 93 → 90 if still wanted. One round at a time across both chats.
