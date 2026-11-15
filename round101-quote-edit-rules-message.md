# Round 101 — Sent quotes save again; an accepted quote is final; a revised quote says so (15 November) — SENT to Emergent on Josh's word ("do what you recommend")

Supersedes `fix-autosave-sent-quote-message.md` (its fix is §1 here). Josh's rule, 15 Nov: *"The sent quote can be changed; it is only the accepted quote that becomes unchangeable, and it should give the right error. If the sent quote needs to be edited it should have a tag that this is a revised quote."* This also settles the open point on B-042: **acceptance alone locks the quote** (Step 0's rule waited for a raised invoice).

Choices this chat made beyond Josh's words, for him to veto: the accepted lock covers the words the client agreed to as well as the price, while office-side fields still save; the Revised tag shows on the Quotes list, in the builder header and on the quote the client sees; a quote counts as revised from the first change after a send, once per send.

---

## The message as sent

# Round 101 — Sent quotes save again; an accepted quote is final; a revised quote says so

**Josh's answer to your Drive question: (a)** — he will connect a test Google Drive to TS_ Alpha. He does not have the test owner's password and it must not be typed in this chat: give him a way to connect that needs no password from you — for example the Drive connect link for TS_ Alpha, which he opens in his own browser and signs in to Google with a spare account. If that can't be done without exposing a secret, say so and take (b). When he has connected, run the dry run (the folder tree, filing by phase, a re-file move, the crew-report, final-report, quote and invoice PDFs — read back through the Drive API), then disconnect and tell him what is left in that Drive. Do the three parts below first; they don't wait for it.

## 1. A quote that has been sent can't be saved on the published app — fix first

Josh, on the live app: every change to a sent quote ends in "Could not save — check your connection". Cause: the send stores `sent_to` as a **list** (`routes/estimate_send.py`, `"sent_to": to_list`, with `sent_cc`), the `Estimate` model declares `sent_to: str | None`, and the builder's save echoes the whole quote back — `STRIP` in `components/estimate/v2/estModel.ts` leaves `sent_to` in — so every autosave of a quote that has ever been sent is a 422. Duplicate estimate on a sent quote fails the same way (it puts `{...est}` onto the copy).

1. `models/estimate.py`: `sent_to: list[str] | str | None`; `crew_notes` accepts the old list shape — a validator turns a list of notes into text (each note's `text`, joined by new lines).
2. `routes/estimates.py::update_estimate`, the §11.1 guard: saves never take the send/sign internals from the client — pop `sent_to`, `sent_cc`, `sent_subject`, `last_viewed_at`, `view_count`, `last_resent_at`, `decline_reason`, `signer_ip`, `decliner_ip`, `archived_at`, `on_hold_at`, `revised_at`, `revision` with the keys already popped.
3. `estModel.ts`: the same keys join `STRIP`. Duplicate builds the copy from `putBody(est)` (minus what it already resets), not `{...est}`.
4. A refused save says why: when the server answered, the builder shows its reason; "check your connection" only when there was no answer.

## 2. What can change — Josh's rule

> "The sent quote can be changed; it is only the accepted quote that becomes unchangeable, and it should give the right error."

- **Draft, sent, viewed, declined, on hold: editable.**
- **Accepted: final.** This replaces Step 0's rule (locked only once an invoice was raised): acceptance alone locks. In `services/quote_guard.py`, a `PUT /estimates/{id}` on an accepted quote is refused (409) when it would change what the client agreed to: the money signature already there **plus the words** — each line's name and the description or notes the client sees, area names and their client-visible notes, the scope summary, the terms, the payment-plan stage names, the job address, the client's details, the dates printed on the quote. Compare after the same read-time normalisation the GET applies (the Site & setup area, the legacy migration), so a save that changes nothing, or only office-side fields (internal notes, crew notes and their switch, photos, the photos link, estimator, job tag, follow-ups), goes through. One sentence: **"EST-0019 is accepted, so it can't be changed. Price extra or changed work as a variation on the job «name»."** The connector's `update_quote` returns the same sentence. The status guard from Step 0 (B-044) stays as it is; the PATCH of safe fields the job page uses still works.
- **The builder on that 409:** shows the sentence and reloads the stored quote, so the screen never shows a change that was not saved. No banner and no notice on the page.

## 3. A revised quote says so

> "If the sent quote needs to be edited it should have a tag that this is a revised quote."

- When a quote that has been sent (it has `sent_at`; status sent, viewed, declined or on hold) is saved with a change to that same client-agreed content (§2's signature), the server stamps `revised_at` and bumps `revision` — the original is revision 1; the first such change after each send makes the next one; further edits before the next send don't bump again. A draft never sent is never revised. Sending again keeps the stamp and records the revision on the sent event.
- **Office:** a small **Revised** tag in the existing tag style beside the status — on the Quotes list row and in the builder header. Warning tone with "Revised 15 Nov · not sent again yet" until it is sent again; neutral with "Revision 2 · sent 15 Nov" after.
- **Client:** wherever the changed quote is shown to the client — the public page, the builder's Client view, the PDF and the emailed PDF — the header reads **Revised quote** with the revision date under the quote number.

## Tests and checks

- Pure (no harness): the content signature (a word change, a price change and a stage rename each change it; internal notes, crew notes, photos don't; the Site & setup normalisation doesn't); the revision counter (one bump per send cycle; never on an unsent draft).
- Routes, TS_ Alpha: send a quote, PUT it back with the builder's own body → 200 and stored; Duplicate a sent quote → a new draft; a quote whose `crew_notes` is a list saves; a sent quote's line change → 200, `revision` 2, `revised_at` set, a second change → still 2, send again then change → 3; an accepted quote: a line-name change → 409 with the sentence, a price change → 409, internal notes → 200, a no-change save → 200; the connector's `update_quote` on an accepted quote → the sentence.
- Testing agent, 1440 then 1024: open a sent quote, change a line → the header says Saved, the Revised tag appears in the header and on the Quotes list, the Client view reads "Revised quote"; open an accepted quote, change a rate → the sentence shows and the rate snaps back; no horizontal scroll.

## Rules

TS_ rows only, torn down after; Josh's own tenant read-only; no backfill (existing quotes get no revision stamp); nothing beyond this message and nothing from your own suggestion list; no notices or banners; nothing under `app/employee/*`; no secrets in any reply (never print a key, a password, an admin id or MONGO_URL); one commit per part; report `memory/reports/round101-quote-edit-rules-report.md` with the commit hashes; What's new as a **draft** only (never publish): "A sent quote can be edited again and shows as Revised; an accepted quote is final — changes go on the job as a variation." Save to GitHub and Publish are Josh's clicks.
