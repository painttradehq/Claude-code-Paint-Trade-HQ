# Josh's notes of 7 November — checked and sorted

Josh pasted 28 notes ("some of them have been done"). Each is checked against the round records (`round11-results.md`, the fix-round files, Emergent's reports) and the crew chat's log. The app code could not be read today: the clone from October is gone with the container and GitHub refuses the app repository from this session (403), so where the records do not settle it the item says **Emergent checks first** and the round message asks for the finding before the fix (as Round 83 did; item 1 there needed no change).

Since 25 Oct Emergent's own record shows work that neither chat sent: "Crew signup audit + fixes" (1 Nov), "Crew app full audit" (2 Nov), "Crew notification system audit", "Crew phone alerts (Web Push) + tester invite Never", one more section (title cut off), and "Admin adds crew document types" (7 Nov, not published). Josh to confirm he ran these directly.

## A. Not done, small, no prototype → **Round 87 — Fix Round H** (`fix-round-h-notes.md`)

| # | Josh's note | What the records say | Goes in as |
|---|---|---|---|
| 3 | Exterior: the face picker (north face, south…) stays open for multi-pick; close it on one click | Round 76 (E8) made the item picker an 860 px right panel; the **face** picker's stay-open behaviour is as built in Round 60 | H8: one click on a face closes the picker and lands on that face |
| 6 | CRM: remove the bottom "New lead" button; New client is enough | Not touched since the address finder (Round 71) | H9 |
| 7 | CRM: the inbox page scrolling is not right | No record | H10, Emergent checks first (1440, 1024, phone) |
| 11 | The equipment page shows no list of items | The check rounds say "as today"; no record of a list | H11, Emergent checks first |
| 12a | Clicking the "JS" logo signs the admin out | No record; a bug | H12 |
| 16 | Builder: after capturing a photo it takes a long time to load | Round 85/86 made uploads files; nothing shrinks a 12 MP phone photo before upload | H13: downscale on the device before upload, measure |
| 18 | Employee list and profile load slowly | Round 84–86 never measured `/employees`; the 7 Nov document-types work touched the Employee page | H14: measure with Server-Timing, fix the trips |
| 22 | Timesheets: admin cannot delete a mistaken clock-in | Round 79/81 built the editor without a delete | H15 |
| 23 | Estimates list: only the client's name should be the link, not the whole line | No record | H16 |
| 24 | Quote details right sidebar: typing closes the keyboard | Same cause as Round 77's F1 (a component defined inside the render); fixed there for the Library only | H17: the same fix in the quote details panel and a sweep of the builder |
| 25 | A test quote email landed in Gmail's Promotions | Resend sends from `Paint Trade HQ <no-reply@painttradehq.co>`; Round 83 set Reply-To to the painter; no DMARC record; no plain-text part known | H18 (Emergent: text part, From name "{Business} via Paint Trade HQ", headers report) + Josh: a DMARC record (§D) |
| 1 | Builder: the New client form looks disoriented | Round 76 (E6) added "More details" to the form; built and verified at 1440/1024 | H19: Emergent checks the form at 1440, 1024 and 390 and sends a screenshot in the report; fix any overlap found |
| 2 | Quote PDF: business name but no spot for the logo | Round 85's report says PDFs inline the logo at render; Round 71 says PDFs show "only the painter's logo" | H20: Emergent checks whether the quote PDF prints `logo_url` when set and where; if it does not, add it to the header |
| 5, 12b, 20a | Photo upload opens the cloud / Google Photos, not the device gallery; adding a photo should first offer **Take a photo / Choose from gallery** | File inputs today carry `accept` only; no camera/gallery choice | H21: every photo entry point (builder, Library item, Settings, presentation) offers the two choices; the gallery input is `accept="image/*"` without `capture`, the camera input adds `capture="environment"` |
| H1–H7 | The earlier Fix H candidates (`fix-round-h-candidates.md`): quote email button text, business-name fallback, two parked feedbacks, `memory/.tok`, the owner signature on the contract countersign PDF, the stale Metro note | — | H1–H7 |

## B. Needs a prototype first (design rounds, one each, in Josh's order)

| # | Josh's note | What exists | Round |
|---|---|---|---|
| 13 + 14 | Areas movable up and down with the numbers on the left; one product once (not per tin size); paint quantity from the Library's coverage × the area's m² × coats, auto with a manual override | Builder prototypes `estimate-builder-fix-e.html` and `estimate-builder-line-details.html`; the Library's product rows carry `coverage_sqm_per_l` and sizes; the builder's materials lines keep the pack size (E10) | **Round 88 — Builder: order, products, paint quantities** |
| 21 | Preparation presets: a list of prep steps kept in the Library (Repairs & prep), picked in the line panel, with "add new" right there | `add-library-notes.md` (Round 69) added the two Library doors from the Add work sheet; prep today is a free-text note (part 2a) | **Round 89 — Prep presets** (can ride with 88 if Josh wants one round) |
| 4 + 17 + 19 | Library: search by category and type ("primer" finds every brand's primers); far more products; products registered per brand by name and category; the product list that does not load from the search | A `materials` catalogue with `category` and `source_url` exists (Bauwerk rows seen in the tests); the search matches names | **Round 90 — Product catalogue**: search on name, brand, category, type; a seeded catalogue per brand from the brands' own pages (name, category, type, sheen, sizes, coverage, source URL), no invented rows |
| 8, 9, 10 | Calendar: clicking a day opens that day in hours (not the event dialog); the category filters become one dropdown; the three right-hand rails go | No calendar prototype in this repo; `CalRail.tsx` and `CalDrawer.tsx` exist | **Round 91 — Calendar layout** — needs a screenshot of today's calendar page at laptop width from Josh (the captures in `memory/marketing/screens` would do) |
| 28 | Admin gets notifications on the phone/desktop when the app is closed, like the crew | Crew web push exists since Emergent's "Crew phone alerts (Web Push)" (early Nov); the admin side has only in-app rows | **Round 92 — Admin web push**: same service worker and keys; Settings › Account › Notifications with per-event switches (new sign-up or lead, quote accepted or declined, variation approved, crew sign-in off site, equipment request, daily report, feedback reply, pending crew approval); works in the installed app on desktop Chrome and Android, iPhone only from the Home Screen |

## C. Crew app → the crew chat (this chat never touches `app/employee/*`)

| # | Josh's note | State in the crew chat |
|---|---|---|
| 26 | A job three weeks away shows under Today's jobs on the crew dashboard (the Inbox and Coming up are right) | A bug; not in the crew log. The crew chat's next fix. |
| 27 | Crew see each job's estimate as a PDF without prices | **Follow-up E "the Scope screen (quote without money, marked photos, owner's hours switch)"** — prototyped and specified 1 Nov, not sent. Ready for Josh's "send" in the crew chat. |
| 15 | Crew can see the business's paint **trade accounts**, managed on the admin Crew page | Not in any record. Josh to say what it is (§D). The admin half (where the accounts are entered and which crew see them) is this chat's; the crew screen is the crew chat's. |

## D. Josh's answers and actions needed

1. **Which phone?** Android or iPhone — the gallery/camera items (5, 12b, 20a) behave differently on each, and the fix is specified per platform.
2. **Trade accounts (15):** the business's accounts at paint shops (supplier, account number, branch, who may use them) that crew show at the counter? Or something else?
3. **Two attachments** named in the notes are not here: the timesheet screenshot (22) and the keyboard video (24). Not blocking; send them if handy.
4. **Calendar screenshot** at laptop width for Round 91 (or say "use the marketing capture").
5. **DMARC** for `painttradehq.co` (25): a TXT record `_dmarc.painttradehq.co` with `v=DMARC1; p=none; rua=mailto:software@joshsano.com.au` at your DNS host. Resend's SPF and DKIM are already verified; DMARC is the third signal Gmail weighs. Gmail's Promotions tab is Gmail's own call; this and H18 improve the odds, they do not guarantee the inbox.
6. **Confirm** the November work was yours directly with Emergent (so the records can say so), and whether "Admin adds crew document types" was published.
7. **GitHub for this chat:** the app repository is still not readable from here (403). If you add `the-newest-update-of-PTHQ` to the Claude GitHub app's repository access, I can check items against the code instead of spending Emergent's time on "checks first".

## E. Proposed order

Round 87 (Fix Round H, ready on "send") → the crew chat sends Follow-up E and the Today's-jobs fix → Round 88 (builder) → 89 (prep presets) → 90 (catalogue) → 91 (calendar, after the screenshot) → 92 (admin push) → trade accounts after the answer. One round at a time across both chats.
