# Revise an accepted quote — SENT to Emergent 27 Nov on Josh's word ("send the next one")

Josh, 27 Nov: "Sometimes the accepted quote has a mistake and it needs to be corrected. The accepted quote is reversible to draft and it becomes editable; if you do so it will have a tag that it has been revised, and after the revision it needs to be resent to the client for another acceptance." This replaces Round 101's "an accepted quote is final".

Written against the app's code as saved to GitHub (`51354c7`). **Prototype:** `quote-revise.html` — one story in four places (the quote, the client's page, the job, Lucy), switched from the dark strip at the top. **Checks:** `tools/test_quote_revise.js`, 129 of 129 at 1440 × 900, 1024 × 768, and the client's page at 390 × 844.

**Found in the code while designing it:** the builder's Resend posts to `/estimates/{id}/send`, which sets `status: "sent"` whatever the status was. So today a Resend on an accepted quote silently turns it back to Sent — the old signature, the frozen payment schedule, the job and the deposit draft all stay, and from then the quote can be edited. A second acceptance then reuses the job without giving it the new figures, keeps the old schedule (`freeze_schedule` returns the one already there) and raises no new deposit draft. Part 3 closes that door; Revise becomes the one way out of Accepted.

**Choices made here, for Josh to change:**
1. The job stays while the quote is revised, and takes the new price when the client accepts again. Its name, dates, crew, paint list, expenses and variations are not touched.
2. A quote with an invoice already sent or paid can't be revised — the change is a variation, or the invoice is cancelled or credited first.
3. While the quote is back in Draft the client's old link shows "This quote is being updated" — not the half-corrected quote, and no Accept.
4. No invoice can be raised from the quote until it is accepted again.
5. The "thanks for accepting" automation does not run a second time.
6. Lucy revises behind a card, always — a client's signature is being withdrawn.
7. One small tidy from reading round 3's code rides along (Part 8).

---

## The message as sent

# Revise an accepted quote

Josh: "Sometimes the accepted quote has a mistake and it needs to be corrected. The accepted quote is reversible to draft and it becomes editable; if you do so it will have a tag that it has been revised, and after the revision it needs to be resent to the client for another acceptance."

This replaces Round 101's "an accepted quote is final": it is still locked as it stands, and **Revise this quote** is the one way to take it back.

Josh is uploading **`quote-revise.html`** — save it as `memory/specs/quotes/quote-revise.html`, with this message beside it as `quote-revise-message.md`. If the prototype is not in the chat, reply "waiting for the prototype" once and wait. It is one story in four places, switched from the dark strip at the top: The quote · Client's page · The job · Lucy. Try: change the ceiling's 38 on the accepted quote (refused) → ⋯ › Revise this quote → Revise quote → change 38 to 42 → Review & send → Client's page → Accept → The job. Add `?inv=sent` for the refusal.

One commit per part.

## Part 1 — The action (server)

`POST /api/estimates/{id}/revise`, and `GET /api/estimates/{id}/revise-check` for what the panel and Lucy's card show before the press: `{can, reason, accepted_at, signer_name, total, job: {id, name} | null, deposit_draft: {id, number} | null, blocking_invoice: {number, total, sent_at} | null}`.

**Refused (409), in this order:**
- not accepted → "{EST-n} isn't accepted, so it can be edited as it is."
- an invoice raised against the quote or its job — the rule `_raised_invoice` in `services/quote_guard.py` already has (any status but draft, cancelled, credited, archived) → "{EST-n} has invoice {INV-n} raised against it, so it can't be revised. Price the change as a variation on the job, or cancel or credit the invoice first."

**What it does, in one update:**
- `status: "draft"`; `revision` + 1 (the original is 1); `revised_at: now`; `revising: {since, by, accepted_at, signer_name, total}` — the mark that this quote is waiting to be accepted again.
- `$push previous_acceptances: {accepted_at, signer_name, signature_data_url, signer_ip, accepted_options, total, revision}` — what the client signed stays on the record. Never sent to the client's page.
- `$unset` the `ACCEPTANCE_FIELDS` of `services/quote_unaccept.py`, as leaving Accepted already does. `accepted_options` stays, so the corrected quote starts from what the client chose.
- The unsent deposit draft is archived (`drafts_to_archive`, `archived_reason: "quote revised"`), as leaving Accepted already does.
- `$push events: {type: "revised", from: "accepted", at, by, accepted_at, signer_name}`; the quote's Activity shows it as "Taken back to revise — {signer_name}'s acceptance of {date} withdrawn".
- **The job is not touched.** The pipeline deal and the lead are not touched.

The Revised tag in the builder header and on the Quotes list needs nothing new: `revision > 1` with `revised_at` later than the last send already reads "Revised 27 Nov · not sent again yet", then "Revision 2 · sent 27 Nov".

## Part 2 — The two sentences

- `accepted_final_sentence` (the refused save; the connector's and Lucy's `update_quote` return it too): **"{EST-n} is accepted, so it can't be changed as it stands. To correct a mistake use Revise this quote — {client's first name} will need to accept it again. Extra or changed work goes on the job «{name}» as a variation."** ("the client" when there is no name; "on the job" when there is no job name.) The builder keeps doing what it does on that 409: shows the sentence, reloads the stored quote.
- `status_change_block`, the job case: "{EST-n} has the job «{name}», so it can't be {moved back to Draft}. To correct the quote use Revise this quote; if the acceptance itself was a mistake, delete the job first."

Never a pronoun for the client in any line of this round — the name, or "the client".

## Part 3 — Sending an accepted quote again leaves it accepted

`routes/estimate_send.py::send_estimate` sets `status: "sent"` and `sent_at` whatever the status was, and the builder's Resend posts to it. So today Resend on an accepted quote turns it back to Sent with the acceptance, the schedule, the job and the deposit draft all still in place.

When the quote is **accepted**, `/send` delivers the same email and writes only `last_resent_at`, `sent_to`, `sent_cc`, `sent_subject`, a `resent` event and the CRM message row. Status, `sent_at` and the acceptance stay; no `quote_sent` automation, no pipeline or lead sync. Every other status: as today.

## Part 4 — Accepting again

In both acceptance paths (`accept_public_estimate`, and `update_estimate_status` → accepted), when the quote carries `revising`:
- As today: the stamp and signature, the job reused, the schedule frozen (Revise unset it, so it is built from the corrected quote), the deposit draft raised (the old one was archived).
- **New — the job takes the corrected figures:** `estimated_revenue` = the quote's new total + the approved variations already added to the job (the `$inc` in `routes/variations.py`); `estimated_hours`, `estimated_labour`, `estimated_materials`, `estimated_cost` and `accepted_at` by the same lines `_spawn_project_from_estimate` uses — move those lines into one helper both call. **Not touched:** the job's name, status, dates, crew, paint rows, expenses, hire, variations, photos.
- `$unset revising`.
- The accepted PDF is filed as `{EST-n} accepted (revision {n}).pdf`; the earlier one stays.
- The admin alert fires as today. The `quote_accepted` automation does **not** run a second time.

## Part 5 — While it is being revised

- **The client's old link** (`GET /public/estimate/{token}`) while `revising` and the status is draft: return only `{updating: true, estimate_number, business_name, business_profile}`; record no view. The page shows one card (`client-updating`): **"This quote is being updated"** / "{Business} is correcting quote {EST-n} and will send you the new version shortly. There is nothing you need to do yet." Accept and decline on that token → 409 "This quote is being updated — a new version is on its way."
- **Sent again** (`revising`, sent or viewed): the payload carries `replaces_accepted_at`; above the document, where the Accepted strip sits (`client-reaccept-note`): **"This quote was updated on {revised date}. It replaces the one you accepted on {date} — please review it and accept it again."** REVISED QUOTE and the Revised date are already there. After signing, the Accepted strip as today.
- **No invoice from it yet:** `POST /invoices/from-estimate/{id}` while `revising` → 409 "{EST-n} is being revised — invoice it once {first name} has accepted it again."
- **The job page** (`app/admin/project/[id].tsx`, the `project-link-estimate` row; the page already loads the quote): accepted → as today, with " · revision {n}" when `revision > 1`; draft → "Being revised · not sent again yet"; sent or viewed → "Revised · sent {date}, waiting for {first name} to accept"; declined → "Revised quote declined {date}".

## Part 6 — The quote screen

- **⋯ menu** (`Builder.tsx`), on an accepted quote only: **Revise this quote** (`more-revise`), in the place a draft has "Refresh rates from Library".
- **A panel on the right** (new `RevisePanel.tsx`; `revise-panel`): 440 px, full height, scrim behind, ✕ and Esc close it. Filled from `revise-check`. Words exactly as the prototype:
  - "**{Client}** accepted this quote on {date}. Revising takes it back so you can correct it."
  - 1 — "The quote goes back to **Draft**, marked **Revised**, and can be edited again."
  - 2 — "{First name}'s acceptance is withdrawn. {First name} accepts the corrected quote again once you send it."
  - 3, when there is a job — "The job **{name}** stays as it is — crew, dates, expenses. It takes the new price when {first name} accepts again."
  - 4, when there is an unsent deposit draft — "The unsent deposit invoice **{INV-n}** is archived. A new one is raised when {first name} accepts again."
  - "Nothing is sent to {first name} until you press Review & send." · **Revise quote** (`revise-go`) · Cancel (`revise-cancel`).
  - When it can't be revised (`revise-blocked`): "**{EST-n} can't be revised.** Invoice **{INV-n}** ({amount}) was sent to {first name} on {date}. Once money has been asked for on a quote, it stays as accepted." — What you can do: "Price the change as a **variation** on the job «{name}»." · "Or cancel or credit {INV-n} first, then revise the quote." · **Open the job** · Close. No Revise button.
- **Revise quote:** save anything pending first (as Duplicate does), post, reload the quote, and say "{EST-n} is back in Draft — marked Revised".
- **Review & Send** on a quote that carries `revising`:
  - `checklist` (`estModel.ts`) starts with one amber line, no fix button (`check-reaccept`): "{First name} accepted the earlier quote on {date} — this asks for it to be accepted again".
  - `quoteWords` (`utils/sendWords.ts`) gives: subject "Your revised painting quote {EST-n} from {business}"; message "Hi {first},\n\nI've corrected your quote for {type} painting at {address} — the revised quote is attached and online at the link below. It replaces the one you accepted on {date}, so please review it and accept it again there, or call me with any questions."
  - Both come from the shared helpers, so Lucy's send card shows the same.

## Part 7 — Lucy follows the same road

- `revise_quote({id})` — Lucy's own, beside the sends and deletes; **never in `REGISTRY`**. Quotes on Read and change, and the admin's own access. In `ALWAYS_CARD` — a card whatever "Ask me before changes" says. Never a step of `do_steps` ("Revising gets its own card.").
- Before the card, the `revise-check`: a refusal goes back to her as the tool's error, so she says the app's sentence and offers the variation — no card.
- **The card** (`kind: "revise"`, built by the server): "LUCY IS ABOUT TO · Revise quote {EST-n}"; rows Quote ("{EST-n} · {client}") · Accepted ("{date} by {signer}") · Total · The job ("{name} — stays as it is") · Deposit draft ("{INV-n} — archived"), the last two only when they exist; one line (`lucy-act-warn`): "The acceptance is withdrawn. {First name} will need to accept the quote again."; **Revise it** · Change something · Cancel. Not red. Done: "LUCY DID · ✓ {EST-n} is back in Draft, marked Revised." with **Open {EST-n}**.
- After it she carries on in the same turn, as after any card: the change itself (in the conversation, or on its card with "Ask me before changes" on), what changed with the old and new total, "Nothing is sent", and the existing next step **Send it to {first name}** → the send card.
- `ADMIN_SYSTEM_PROMPT`, both modes, one paragraph: "An accepted quote is never changed in place. To correct a mistake on one, call revise_quote — it shows its card — then make the change, then offer to send it: the client has to accept it again. Extra or changed work is a variation on the job, not a revision; if it isn't clear which the user means, ask."

## Part 8 — One small tidy from round 3

`lucy_actions.delete_target` looks up a timesheet session (`db.timeclock.find_one({"_id": …})`) and a quote follow-up (`db.estimate_followups.find_one({"_id": …})`) by id alone when it builds the delete card. Nothing of another business can be deleted — the routes check — but the card's own read must carry the same check as every other card: the session's `employee_id` in `employee_ids_for_admin`, the follow-up only through the business's own quote. Otherwise "I can't find that record."

## Checks

Pure / in-process: the two refusals; what Revise writes and unsets, `previous_acceptances`, the deposit draft archived, the job untouched; `/send` on an accepted quote changes no status; a second acceptance refreshes the job's five figures, freezes a new schedule, raises a new deposit draft, unsets `revising`, runs no `quote_accepted` automation; the public read and accept while updating; `from-estimate` refused while revising; the new sentences from the save and from the connector's `update_quote`; `revise_quote` pauses in both modes, is never a plan step, is absent with Quotes on Read and for the "site" preset; the two scoped lookups of Part 8.

On screen with the testing agent, TS_ data, sends as a dry run, **1440 then 1024**; the client's page also at **390**:
1. An accepted TS_ quote with its job and unsent deposit draft: change a quantity → the new sentence, the number snaps back.
2. ⋯ › Revise this quote → the panel on the right with the four lines, the client's name and date, the job's name, the invoice number. Cancel and Esc change nothing.
3. Revise quote → Draft, "Revised {today} · not sent again yet", the button reads Review & send; the same tag on the Quotes list; the deposit draft is in Archived; the job is still there with its crew and dates.
4. The quantity now saves and the total follows.
5. The client's link now shows "This quote is being updated" — no document, no Accept.
6. The job: "Being revised · not sent again yet"; "Create one from this estimate" is refused with its sentence.
7. Review & send: the amber line first, the revised subject and message, REVISED QUOTE in the preview. Send → Sent, "Revision 2 · sent {today}".
8. The client's link: the update line, the new total, Accept → signed → "Accepted by … on {today}".
9. The job: the new quoted revenue, "Accepted {today} · revision 2", a new deposit draft on the new total; name, dates, crew, paint and expenses as they were.
10. A TS_ accepted quote whose deposit invoice was sent: the panel says it can't be revised, names the invoice, has no Revise button; Open the job works.
11. Resend on an accepted TS_ quote: it goes (dry run) and the quote is still Accepted.
12. Lucy, as she opens: "{a quantity} on {EST-n} should be …, fix it" on an accepted quote → her one line and the Revise card; nothing changes before **Revise it**; then the change, both totals, "Nothing is sent", **Send it to {name}** → the send card with the amber line and the revised words. With the invoice sent: no card, the app's sentence, the variation offered. With "Ask me before changes" on: the same, the change on its own card.
13. Nothing runs off sideways anywhere, the panel and the 480 px Lucy panel included.

## Rules

As the rounds before: this message only — nothing from your own suggestion list; TS_ rows only, torn down after; Josh's own tenant read-only; no backfill (no existing quote gets `revising`; a quote a Resend already turned back to Sent is left as it is); no notices or banners in the admin; AI is Claude only, through the app's own key; nothing under `app/employee/*`; no key, password or admin id in any reply. Report to `memory/reports/quote-revise-report.md`. Add one card to What's new draft #47 (never publish): "Fix a mistake on an accepted quote — open it and choose Revise this quote. It goes back to Draft marked Revised, the job stays where it is, and your client accepts the corrected quote again." Save to GitHub and Publish are Josh's clicks.
