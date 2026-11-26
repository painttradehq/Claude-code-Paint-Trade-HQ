# Lucy L3 — fixing and removing (round 3 of 5) — SENT to Emergent 27 Nov on Josh's word ("and send")

Josh, 27 Nov: "Let's go back to Lucy to finish it off." · "Remember Lucy should be able to do what you do as a connector — except as a connector you need a browser to operate, but because Lucy is native she has more capability."

Written against the app's own routes as saved to GitHub (`640c20d`, round 1). **Round 2 and conversation first are not on GitHub yet, so that code is unread here** — the message leans on the two messages Emergent built them from.

Josh uploads the updated `lucy-operator.html` with it. Checks: `tools/test_lucy_operator.js`, 214 of 214 at 1440 × 900 and 1024 × 768.

---

## The message as sent

# Lucy L3 — fixing and removing (round 3 of 5)

Josh: "Lucy should be able to do what you do as a connector — except as a connector you need a browser to operate, but because Lucy is native she has more capability." So this round's test is simple: **what an admin can do to a record on a screen, Lucy can do — a change in conversation, a delete behind a card.** The keys to the account stay outside her (listed at the end).

Josh is uploading an **updated `lucy-operator.html`** — save it over `memory/specs/lucy/lucy-operator.html` — with this message as `lucy-l3-emergent-message.md`. If the prototype is not in the chat, reply "waiting for the prototype" once and wait. Try: "Delete the skip bin expense on the South Wharf job" (it is off first — turn on Delete records in her setup) · "Archive EST-0040" then its button · "Fix Tom's timesheet for Tuesday to finish at 3:30, he left early" · and `?ask=1` for the same with "Ask me before changes" on.

Build **only L3**. Email from the mailbox and files are later rounds. One commit per part.

## Part 1 — The changes she cannot make yet

Add these to `services/connector_tools.REGISTRY` — thin wrappers over the screens' own route functions, like the 33 writes already there — so the Claude connector gains them too. In Lucy they behave like every other change: done and told in conversation, or behind the L1 card when "Ask me before changes" is on.

| Tool | Runs | Registry `access` |
|---|---|---|
| `set_job_crew({id, employee_ids})` | the job's crew route (`PUT /projects/{id}/crew` — the full list each time) | `projects` |
| `add_job_hire`, `update_job_hire` | `projects.add_equipment`, `update_equipment` | `projects` |
| `add_job_material`, `update_job_material` | `projects.add_project_material`, `update_project_material` | `projects` |
| `duplicate_quote({id})` | a new `POST /estimates/{id}/duplicate` that the builder's own "Duplicate estimate" also calls — one copy of that logic, and the copy it makes is the same as today's | `estimates` |
| `refresh_quote_rates({id})` | `estimates.refresh_rates_from_library` | `estimates` |
| `update_quote_followup` | `estimate_followups.update_followup` | `estimates` |
| `update_invoice({id, …})` | `invoices.update_invoice` | `invoices` |
| `set_invoice_status({id, status})` — `draft` or `archived` only; "sent" is the send card, "paid" is `record_payment` | `invoices.patch_invoice_status` | `invoices` |
| `archive_client`, `restore_client` | `customers.delete_customer` (the archive) and `crm.restore_customer` | `crm` |
| `add_timesheet_session`, `fix_timesheet_session({record_id, …, reason})` | `timeclock.admin_add_record`, `update_timeclock_record` | `timesheets` |
| `create_library_item`, `update_library_item` | `library_variants.create_variant`, `update_variant` | `library` |
| `create_library_task`, `update_library_task` | `library_tasks.create_task`, `update_task` | `library` |
| `create_product`, `update_product` | `materials.create_material`, `update_material` | `library` |

- A quote is archived through the `set_quote_status` she already has.
- For her setup's areas: a `timesheets` write belongs to **Crew and HR** and needs the admin's `crew_edit`; a `library` write belongs to **Library and products** and needs `products`.
- A timesheet fix needs a reason, as the screen does: if the admin gave none she asks for it in one line first. The app's own refusals stand — a locked pay week, money on an invoice with a payment, rates on a quote that is not a draft — and she repeats them in the app's words.
- An expense has no edit route in the app. Asked to change one she says so, and swaps it: the remove card (Part 2), then the new one added.

## Part 2 — Deleting

Lucy-only tools beside the send tools — **never in `REGISTRY`**; the connector still deletes nothing. Each runs the screen's own route function. **A delete is always a card, in both modes**, needs **Delete records** on (Part 3), its area on Read and change, and the admin's own access; it is never a step of `do_steps`; one record per card.

| Kind | Tools | Card |
|---|---|---|
| A small thing on a record | `delete_job_expense`, `delete_variation`, `delete_job_hire`, `remove_job_material`, `delete_quote_followup`, `delete_reminder`, `delete_event`, `delete_timesheet_session({record_id, reason})`, `archive_product` | red; rows say exactly what goes and what it sits on; one button, **Delete** |
| A record with a number | `delete_quote`, `delete_invoice` | red; "Type EST-0040 to delete it"; the button **Delete EST-0040** stays off until it is typed |
| A record without one | `delete_job`, `delete_client`, `delete_lead`, `delete_supplier`, `delete_library_item`, `delete_library_task` | the same, typing **DELETE** |

- The card is built by the server like every card: title, the record (number or name, status, amount), **what is linked** (a job: its expenses, variations and crew, and that its invoices stay on the quote; a client: "no quotes, invoices or jobs"), and the line "This can't be undone." Kicker, states and test ids as the prototype (`lucy-act-warn`, `lucy-act-confirm-input`).
- **The app's own order stands.** A quote or an invoice is deleted only once archived: asked to delete one that is not, she archives it — a change, told, "it can be brought back from Archived" — and then shows the delete card. Asked to delete a client she archives it and says so; the delete-for-good card comes only when that is asked, and the app refuses it while the client has quotes, invoices or jobs. An approved variation, a paid invoice, a quote with a job or an invoice: the refusal comes back in the app's own words.
- More than one ("delete all my old drafts"): she lists them and goes one card at a time.
- Done: "LUCY DID · ✓ EST-0040 was deleted." Every delete writes its `ai_tool_audit` row with what was deleted.

## Part 3 — Delete records (her setup)

One row under Send for me: **Delete records** — "One at a time. You see what goes before it goes." — a switch (`lucy-perm-delete`), **starts off**, stored as `ai.can.delete`. Off → she has no delete tools; asked to delete, `setup_is_off("delete")` returns "Deleting is turned off in my setup." with the **Open Lucy's setup** button. Archiving is not deleting and does not need it.

## Part 4 — Plain names on the chips, and her words

- The small chips under her answer show the **area in plain words** for the connector's tools — Jobs, Quotes, Clients, Invoices, Calendar, Crew, Library — one chip per area, never a tool's name ("get projects", "add job expense").
- `ADMIN_SYSTEM_PROMPT`: she can now change and remove what is listed above; a delete always goes through its card; she reads the record first and says what is linked; one record at a time; she still cannot touch what is listed below.
- The fixed "what I do" answer and `WHAT` — the added sentence becomes: **"I can also do the work for you — start, change and send quotes, add to jobs, raise and send invoices, record payments, book the calendar, fix timesheets and keep your Library up to date. I tell you what I did, and before anything is sent or deleted I show you first and wait for your OK."**

## Outside Lucy, for good

No tool for any of these, in any mode: adding or removing a crew member's account; team admins and their access; passwords and PINs; pay rates, approving or locking a pay week; the plan, billing and Stripe keys; refunds and credit notes; merging clients; Start fresh, bulk deletes and exports; platform tools; Lucy's own key and allowance. The setup pages (templates, automations, Quote setup, the business profile) are not in this round.

## Checks

Pure / in-process (model faked): every new change tool runs once and returns its record; the tool list with Delete records off, on, an area on Read, and the "site" preset; a delete pauses in both modes and never runs in `do_steps`; approve of a typed-delete without the right word is 400; a delete approved twice is 409; the refusals (quote not archived, invoice with a payment, approved variation, client with a job, locked pay week) come back in the app's words and nothing is removed; the audit row.

On screen with the testing agent, TS_ data, **1440 then 1024**:
1. Delete records off (as it starts): asked to delete an expense she says it is turned off, no card, the button opens her setup.
2. Turned on: "Delete the {TS_} expense on {job}" → the red card names the expense, the job and the amount; one **Delete** button; the expense is still there until it is pressed; then it is gone.
3. "Change that expense to $220" → she says an expense can't be edited, shows the remove card, and after Delete adds the new one and says so.
4. "Archive {a TS_ draft quote}" → no card, it is archived, and it can be brought back; **Delete it for good** → the card needs the quote's number typed; a wrong number keeps the button off.
5. "Delete {a TS_ quote that is not archived}" → she archives it, says so, then the delete card.
6. "Delete {a TS_ client with a job}" → she archives the client; asked to delete for good the app refuses in its own words.
7. "Fix {crew}'s session on {day} to finish at 3:30, he left early" → no card; the timesheet shows 3:30 with the reason; with no reason given she asks for one first; a locked week is refused in the app's words.
8. "Duplicate {a TS_ quote}" → a new draft with the same lines; the builder's own Duplicate still makes the same copy as before.
9. "Put {two TS_ crew} on {job}", "Add a scaffold hire to {job}", "Raise the rate of {a Library item} to $48" → each done and told, and visible on its screen.
10. The chips under each of these answers read Jobs, Quotes, Crew or Library — no tool names.
11. "Ask me before changes" on → the changes above wait on the L1 card; the deletes look the same in both modes.
12. Nothing runs off sideways in the 480 px panel with the longest delete card open.

## Rules

As the rounds before: TS_ rows only, torn down after; Josh's own tenant read-only; no backfill; nothing beyond this message and nothing from your own suggestion list; no notices or banners; AI is Claude only, through the app's own key; nothing under `app/employee/*`; no key, password or admin id in any reply. Report to `memory/reports/lucy-l3-report.md`. Add one card to What's new draft #47 (never publish): "Lucy can now fix and tidy up too — change a job's crew, fix a timesheet, update your Library, archive a quote. Deleting is off until you turn it on in her setup, one record at a time, and she shows you what goes first." Save to GitHub and Publish are Josh's clicks.
