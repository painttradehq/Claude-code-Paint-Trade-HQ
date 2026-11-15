# Fix — a quote that has been sent can't be saved in the builder ("Could not save — check your connection") — READY TO SEND on Josh's word

Josh, 15 Nov, on the **published** app: in Leanne's estimate every change ends in "Could not save — check your connection". Root cause found by reading the code (this chat has no access to the live data, so "Leanne's quote has been sent" is the inference; the mechanism is certain for any sent quote).

## The cause

- When a quote is sent, `routes/estimate_send.py:304` stores **`sent_to` as a list** of addresses (`to_list`), with `sent_cc` beside it.
- The `Estimate` model (`models/estimate.py`) declares **`sent_to: str | None`**.
- The builder's save sends the whole quote back; its `STRIP` list (`components/estimate/v2/estModel.ts:110`) drops `status`, `sent_at`, `events`… but **not `sent_to`**. So every autosave of a quote that has ever been sent carries `sent_to: ["…"]`, the model refuses it (422), nothing is saved.
- `Builder.tsx:58` catches every failure and says "Could not save — check your connection", so a refusal by the server reads as a network problem.
- **Duplicate estimate** on a sent quote fails the same way (`Builder.tsx:91` puts `{...est}` onto the copy, `sent_to` included).
- This is the "autosave on a sent quote returns 422" that Fix Round I's testing agent reported (`admin-remaining.md`, Fix Round J candidates) — now root-caused.

Two lesser ways the same message can appear on a quote that was never sent: `crew_notes` saved as a list by the old job drawer (the model wants text — B-033's cousin), and a line whose paint product was deleted from the Library (`validate_paint_fields` → 400 "product_id is not one of your Products").

## The fix (small; message for Emergent)

> **Fix — sent quotes save again in the builder.** On the published app a quote that has been sent can't be saved: the send stores `sent_to` as a list, the `Estimate` model says `str`, and the builder echoes the field back on every autosave → 422 → "Could not save — check your connection".
>
> 1. `models/estimate.py`: `sent_to: list[str] | str | None`; and `crew_notes` accepts the old list shape — a validator turns a list of notes into text (the notes' `text` joined by new lines).
> 2. `routes/estimates.py::update_estimate`, the §11.1 guard: saves never take the send/sign internals from the client — pop `sent_to`, `sent_cc`, `sent_subject`, `last_viewed_at`, `view_count`, `last_resent_at`, `decline_reason`, `signer_ip`, `decliner_ip`, `archived_at`, `on_hold_at` along with the keys already popped.
> 3. `components/estimate/v2/estModel.ts`: add the same keys to `STRIP`. `Builder.tsx` Duplicate: the copy is built from `putBody(est)` (minus the number, status and customer link it already resets), not from `{...est}`.
> 4. The save error tells the truth: when the server answered, show its reason ("Could not save — <detail>"); "check your connection" only when there was no answer. (If your Step 0 follow-up already does this, leave it.)
> 5. Test: on TS_ Alpha send a quote, then `PUT` it back with the body the builder sends (the GET's body through `putBody`) → 200 and the change is stored; Duplicate on a sent quote → a new draft; a quote whose `crew_notes` is a list saves. Testing agent: open a sent quote in the builder at 1440, change a line, the header says Saved, reload — the change is there.
>
> Rules as always: TS_ rows only, torn down; the owner's tenant read-only; nothing beyond this; no secrets in replies; one commit; add it to the Round 100 report. Save to GitHub and Publish are Josh's clicks.

## Until it is published

On the live app a sent quote can't be edited in the builder at all. Josh's painting-business Claude can make the change through the connector (`update_quote` sends only the fields it changes, so `sent_to` is never echoed).
