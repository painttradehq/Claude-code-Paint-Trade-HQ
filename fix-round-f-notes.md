# Fix Round F · part 1 — plain fixes, no design (spec, ready for "send")

Nine fixes from the owner's list of 14 October, the ones that need no new design. Walkthrough with the causes: `fix-round-f-walkthrough.md`. Part 2 (Line details redesign, Add to the Library from the builder) and Round 74 (presentation pages) follow after prototypes; nothing from them is in this message.

## Rules for this round

1. Admin side only. Nothing under `frontend/app/employee/*` changes (the crew chat owns it). `routes/calendar_feed.py`, `ai_routes.py`, `services/email.py`, `routes/crm.py`, `routes/estimates_v2.py`, `routes/admin_profile.py` are the backend files this round may touch; name any other.
2. One new frontend package is allowed: `pdfjs-dist` (F4). Pin it; report the version. No other package.
3. No environment change. The owner sets the Resend sender himself; do not touch `.env` or `.env.example`.
4. Owner's real tenant read-only. `TS_` rows only, torn down. No email or SMS leaves the sandbox.
5. Build exactly what is written. Where this spec is silent, keep what is built and list it under §8 in the report.
6. Tests in §Tests; suite green before and after; `ruff` and `tsc` clean on changed files; commit.
7. What's new: create the Draft in §What's new; never publish.
8. Report: "Fix Round F part 1 done" at the top, then every verify item as **agent-tested** or **Unverified**, the testing-agent pass (1440, then 1024, plus the two tablet checks named below), backend changes, the `pdfjs-dist` version, deleted files, removed routes, §8 silences. Then stop.

## F1. Library item editor: typing a rate or minutes closes the keyboard (owner's items 2 and 9)

- **Cause:** `frontend/app/admin/library/add-variant.tsx:338` defines `RateTimeRow` **inside** `AddVariantScreen`. Every keystroke re-renders the screen, the component identity changes, React remounts the row and the `TextInput` loses focus.
- **Change:** move `RateTimeRow` to module scope, above `AddVariantScreen`, unchanged otherwise (it uses the module-level styles `s` and the tokens `t`). No other edit in the file.
- **Verify (tablet emulation at 1024 with touch, and 1440):** on an item, type three digits in a row into Preparation $, Preparation min, First coat $, First coat min and Hourly rate without focus leaving the field; Save; reopen; values kept. The Suitable-products search field still works.

## F2. Lucy knows which page she is on (owner's item 4)

- **Cause:** the chat posts `{ message, session_id, image_base64, image_mime }` only (`components/lucy/LucyChat.tsx:51`); `ChatRequest` has no page (`backend/ai_routes.py:57`); the system prompt carries the business name and today's date (`ai_routes.py:45–53, 210`).
- **Frontend:** the component that posts `/ai/chat` sends `page: { path }` where `path` is the current pathname plus query string (expo-router `usePathname()` and `useGlobalSearchParams()`). Nothing else changes in the box.
- **Backend (`ai_routes.py`):** `ChatRequest.page: dict | None = None`. New `_page_context(db, owner_admin_id, page) -> tuple[str, dict | None]` returns a label and an entity, tenant-scoped (every lookup filters `owner_admin_id`; a miss gives `("an unknown page", None)`):
  - `/admin/estimate/{id}` → `Quote {estimate_number} for {clientName} · {status}`; entity `{type: "estimate", id}`
  - `/admin/invoice/{id}` → `Invoice {number} for {client name} · {status}`; entity `{type: "invoice", id}`
  - `/admin/project/{id}` → `Job {name} · {status}`; entity `{type: "project", id}`
  - `/admin/customer-detail?id={id}` → `Client {name}`; entity `{type: "customer", id}`
  - any other `/admin/{segment}` → the segment as a title (`dashboard` → "Dashboard", `timesheets` → "Timesheets", `crm` → "Clients", `estimates` → "Quotes", `invoices` → "Invoices", `projects` → "Jobs", `calendar` → "Calendar", `settings` → "Settings", `employees` → "Crew"; anything else title-cased); entity `None`
  - no page → nothing appended.
  - Appended to `system` right after `ADMIN_SYSTEM_PROMPT.format(...)`: `\nThe owner is looking at: {label}. When they say "this quote", "this client", "this job" or "here", they mean it.`
- **Tools:** `user_ctx["page_entity"] = entity`. In `execute_tool`, when a tool that takes `estimate_id`, `customer_id` or `project_id` is called **without** that id and the page entity is of that type, fill it from the page. No new tools; list in the report which existing tools gained the default.
- `_save_message` stores `page_path` on the user message.
- **Verify:** on a TS_ quote, "what's the total of this quote" answers with that quote's total; on a TS_ client, "when did I last message them" answers for that client; on the dashboard, "where am I" says the dashboard; a path carrying another tenant's estimate id gets "an unknown page" and no data.

## F3. Add exterior zone: remove the second window (owner's item 8)

- **Cause:** `components/estimate/v2/AreaPicker.tsx` has a second level for exterior (`face` state, `openFace`, `pickElement`, `elCount`, `elGroups`, the "← All faces" header, the element grid from `PK_ELEMENTS`) that adds lines directly, duplicating Add work.
- **Change:** delete the second level. Faces (`PK_FACES`) become plain tiles that call `pickZone` like rooms do (no chevron, count badge like the others). Remove the props `onAddLine`, `onFallback` and `lib` from `AreaPicker` and from its use in `Builder.tsx:105`. In `pickerData.ts` delete `PK_ELEMENTS`, `resolveElement` and `ELEMENT_NAME` (only the picker imports them; `types.ts:155` is unrelated and stays). Exterior sub-text becomes: "Pick a face of the house or a zone around it. It lands on the paper straight away; measurements come next, on its row, and the work through Add work."
- **Verify (1440 and 1024):** Add exterior zone → Front → lands on the paper, the dialog stays open with the green count pill (as interior does); "Your own" zone works; Add work on the new zone works; no element grid, no `pk-back`; interior picker unchanged; `tsc` clean.

## F4. Quote PDF live preview shows on tablets (owner's item 10)

- **Cause:** `components/estimates/QuotePdfPreview.tsx:35` renders the PDF with `<object type="application/pdf" data="blob:…">`. Safari on iPad does not render PDFs in an `<object>`; the pane is blank.
- **Change:** keep the fetch (`POST /admin/pdf/preview/{doc}`, 600 ms debounce, same store, same `qs-preview-*` / `is-preview-*` ids). Replace the `<object>` with a vertically scrolling column of `<canvas>` elements, one per page, rendered with `pdfjs-dist` from the blob at the pane's width minus 32 px, device-pixel-ratio aware, 12 px gap, each `data-testid="{prefix}-preview-page-{n}"`. Busy and error states as today. Worker: bundle the pdf.js worker through Metro or run without a worker; Emergent picks and reports which. The "Download a sample PDF" button is unchanged (still a real PDF). The invoice gear uses the same pane and gets the same.
- **Verify:** 1440 Chrome: pages render and re-render on an accent change; **iPad user agent at 1024 × 768** (testing agent): pages render (the old `<object>` would be blank); invoice gear same; no console errors.

## F5. Presentation pages: default switch and honest texts (owner's item 12, part 1)

- **Cause:** a template in Quote set-up › Presentation does nothing until the per-quote switch "Presentation pages" (Quote details) is on; new quotes start off (`estimates_v2.py:297` `presentation_enabled: False`). The builder preview shows a placeholder block, and the public quote page never renders presentation pages; the PDF does (`services/pdf.py:535`).
- **Changes in this round:**
  1. `EstimateDefaults.presentation_default_on: bool | None = None` (`admin_profile.py`). Resolved value: the stored boolean when set; otherwise **on** when the business has at least one presentation template, else off.
  2. Presentation tab: a switch at the top, under the kicker, same SwitchRow style as the other gear tabs: title "Add presentation pages to every new quote", sub "New quotes start with Presentation pages on. You can still turn them off per quote in Quote details." `data-testid="qs-pres-default"`. Saving stores the explicit value.
  3. `estimates_v2.py` new estimate: `presentation_enabled` = the resolved value; when on, `presentation` = the business's default template content (the template the tab marks as default if that exists in the stored templates; otherwise the first by creation date) so the PDF showcase has content. Existing quotes untouched.
  4. Texts: the builder placeholder (`Builder.tsx:61`) reads "Presentation pages are printed on the quote PDF after the quote. The on-screen pages come with the presentation redesign." (the old "Settings → PDF & Brand Design" wording goes). One line under the template list in the Presentation tab: "Prints on the quote PDF when 'Presentation pages' is on for that quote (Quote details). New quotes follow the switch above."
- **Not in this round:** rendering the pages on screen in the builder and on the public quote page. Round 74 redesigns the pages (one or two pages with large photo areas) and brings the on-screen rendering with it.
- **Verify:** TS_ tenant with one template and the switch unset → new quote has Presentation pages on and the PDF prints the showcase; switch off → new quote off; tenant with no template → off; an existing quote keeps its value; both texts present.

## F6. One signature on every email (owner's item 13)

- **Cause:** `components/estimate/v2/ReviewSend.tsx:23, 34, 60`: an editable Signature field is appended at send, while the body (default or AI draft) may end with its own sign-off → two signatures.
- **Changes:**
  1. Remove the Signature textarea (`rs-signature`). Under the Message textarea show a muted block in the existing hint style: label "Signature · from Messages setup", the saved signature text (`settings.comms.email_signature`; fallback owner name · business · phone as today), and a link **Edit** → `/admin/crm/setup#links` (the Links & signature section of Messages setup, `Sec id="links"`). Ids `rs-signature-preview`, `rs-signature-edit`.
  2. Send appends the saved signature exactly as today (`body + "\n\n" + signature`); the invoice send sheet shares the component and gets the same.
  3. AI draft prompt (`ReviewSend.tsx:30`): add to both the quote and the invoice prompt: " No sign-off and no signature — it is added automatically."
  4. The default body (line 22) has no sign-off; unchanged. The CRM composer already appends the saved signature server-side (`crm.py:128`); unchanged.
- **Verify:** send a TS_ quote → the email body ends with exactly one signature; three AI drafts in a row contain no "Cheers", "Regards", "Thanks," closing line or the owner's name at the end; Edit opens Messages setup at Links & signature; invoice send sheet same.

## F7. Owner-facing wording when email is not set up (owner's item 14, code half)

- **Cause:** `services/email.py:187–192` returns the provider's internals to the owner ("…onboarding@resend.dev… set RESEND_FROM"). The environment fix is the owner's (Resend sender on the verified domain); this is the wording.
- **Change:** the 422 detail becomes "Email isn't switched on for this server yet. Nothing was sent." The 424 "Failed to send email: {msg}" becomes "Email could not be sent. Try again in a minute." In both cases the full provider message is logged at error level with the tenant id. `crm.py:131` keeps passing `detail` through (now owner-safe). The Preview & send sheet shows `detail` as today.
- **Verify:** on the preview (test sender still active), a TS_ composer email shows the new sentence; the log line has the provider text.

## F8. Honest message states on the client timeline (owner's item 16, code half)

- **Facts:** `crm.py:124–143`: email → "sent" when the provider accepts (on the preview that is the sandbox, which only delivers to the account owner); SMS with no Twilio number → "queued". The owner was not sure what the SMS row showed.
- **Change:** one status → label map used by the client timeline and the Inbox: `sent` "Sent", `queued` "Queued · no SMS number connected", `failed` "Not sent", `draft` "Draft". Check how `ClientPage.tsx` and `InboxView.tsx` label a message today and report it (before/after) in the report. No change to the backend statuses. Delivery webhooks ("Delivered", "Bounced") are a later round.
- **Verify:** TS_ tenant without Twilio: SMS from the composer → row shows "Queued · no SMS number connected"; email → "Sent".

## F9. Reminders on the calendar name the client, quote or job (owner's item 17)

- **Cause:** `routes/calendar_feed.py:131–134` builds `title: "Reminder: {text}"`, no lookup of the related record, and passes the reminder's **related** id (the client's or quote's id, or "") as the entry's `related_id`. The drawer's Tomorrow and Mark done call `/reminders/{related_id}` (`components/calendar/CalDrawer.tsx:56`), so for a client-linked reminder they hit the wrong id and for an unlinked one an empty id.
- **Backend change:** each reminder entry becomes `{ id: "reminder-{_id}", kind: "reminder", date, time, title, description: {text}, related_id: {reminder _id}, for: { type, id, label } | null }` where `for` resolves `related_type`/`related_id` tenant-scoped with one query per collection: `customer` → `{label: client name}`; `estimate` → `{label: "{estimate_number} · {clientName}"}`; `project` → `{label: project name}`. Title: `Reminder · {for.label}: {text[:60]}` when `for` exists, else `Reminder: {text[:60]}`.
- **Frontend change (`CalDrawer.tsx:54–56`):** Note row shows `e.description`; new row **For** (icon `person-outline` / `document-text-outline` / `briefcase-outline` by type) with `e.for.label` as a link to `/admin/customer-detail?id={id}` / `/admin/estimate/{id}` / `/admin/project/{id}`, shown only when `e.for` exists; `data-testid="reminder-for"`. Tomorrow and Mark done keep calling `/reminders/{e.related_id}`, which is now the reminder's own id. `CalRail.tsx:30` unchanged.
- **Lucy:** the `add_reminder` tool sets `related_type`/`related_id` from the page entity (F2) when the call has none and the page is a client, quote or job.
- **Verify:** a reminder made from a TS_ client page shows on the calendar as "Reminder · TS_ Jane Smith: call about the deck quote"; the drawer's For row opens the client; Tomorrow moves it one day; Mark done removes it; an unlinked reminder shows "Reminder: …" with no For row and its Tomorrow / Mark done work; Lucy "remind me to call them Friday" on a client page creates a reminder linked to that client.

## Tests

`backend/tests/test_fixF.py` on `TS_` rows, torn down:
1. Calendar feed: a client-linked reminder → `id reminder-{_id}`, `related_id` = the reminder's id, `for.type == "customer"`, title starts "Reminder · {name}:"; an unlinked reminder → `for` null, title "Reminder: …"; a reminder of another tenant never appears.
2. New estimate: `presentation_enabled` follows `presentation_default_on` (true / false), and is true when unset with a template, false when unset without.
3. `_page_context`: own-tenant estimate, client and project paths → the labels above with the right entity; a foreign estimate id → "an unknown page", entity `None`; `/admin/timesheets` → "Timesheets".
4. Composer SMS without Twilio → status `queued`; email with the sandbox sender → the 422 detail equals the new owner sentence (mock the provider rejection).

Suite green before and after; `ruff` and `tsc` clean on changed files.

## Testing agent

1440 first, then 1024; the Library keyboard check with touch emulation at 1024; the PDF preview with an **iPad user agent** at 1024 × 768. TS_ tenant for everything that writes; owner tenant read-only.

## What's new (Draft only, never published)

**Title:** Small fixes across the builder, Lucy and the calendar
**Body:** Typing prices in the Library no longer closes the keyboard. Lucy now knows which quote, client or job you have open, so "this quote" means this quote. Adding an exterior zone lands it on the paper and leaves the work to Add work. The quote PDF preview now shows on tablets. New quotes can carry your presentation pages by default. Every email carries one signature, the one in Messages setup. Reminders on the calendar name the client, quote or job they belong to.

## Not in this round (for the record)

Line details redesign (owner's items 1, 5, 6, 7, 15) and Add to the Library from the builder (item 3): part 2, after prototypes. Presentation pages redesign and on-screen rendering (item 11, item 12 part 2): Round 74. Resend sender, reply-to and the Emergent email key (items 14 and 16, environment): the owner. Delivery webhooks: later.
