# Fix Round K — 27 fixes from the bug log to 26 November (one patch) — SENT to Emergent 25 Nov on Josh's word ("send the work and I will upload the three files")

The patch is `emergent-uploads/pthq-fixes-26nov.patch` in this repo (56 files, +1316 −166), built against GitHub `main` `0165cde` (your Save to GitHub of 15 Nov). Josh uploads it to the Emergent chat with the message below. The full verdict table is `fix-round-k-tracker.md`.

---

## The message as sent

# Fix Round K — apply one patch, then check it on screen

Josh is uploading three files to this chat: **`pthq-fixes-26nov.patch`** (the one to apply), `fix-round-k-tracker.md` (the verdict on every entry of his bug log, for reference) and `fix-round-k-emergent-message.md` (this message as a file). The patch is 27 fixes from his bug log (B-062 to B-088 and the contracts set), written outside against GitHub `main` `0165cde`. Nothing else is asked for in this round.

## Step 0 — apply

1. Save the file and run `cd /app && git apply --3way --index <file>`. If your tree has work that was never saved to GitHub, some files will three-way merge — keep both sides. **If a file conflicts and the right result is not obvious, stop and name the file; do not retype the patch by hand.**
2. These run without the harness and must be green: `python -m pytest tests/test_fixk_*.py tests/test_fixj_quote_guard.py tests/test_fixj_pricing_source.py tests/test_fixj_job_money.py --noconftest -q` (98 tests). `tsc --noEmit` clean apart from `CoverageBar.tsx:86`. Then your suite.
3. **Some of your older harness tests assert the behaviour this patch removes — change those tests, not the code:**
   - the connector now offers **21 reads and 33 writes** (`update_variation` and `save_contract_template` are new; `_r98_inproc.py` still says 20 + 31);
   - `test_r26_invoice_setup.py` (~line 233) and `test_r26_audit_iter74.py` (~line 149) expect an "About us" block on the invoice whenever `invoice_match_branding` is on, and `test_pdf_layout.py` (~lines 128–129) expects "ABOUT US" and "TERMS & CONDITIONS" on a quote with nothing set. There is no sample About us and no stock terms any more (B-084): give the test tenant a blurb / a terms template first, or assert the block is absent;
   - `test_r99_quote_terms.py::test_01` is already updated in the patch (no template → no terms).
4. If the patch file is not in the chat when you read this, reply "waiting for the patch" once and wait.

## What the patch changes (one line each; the commit messages in the patch's branch `claude/fix-round-k` say more)

**Money and documents**
- **B-087** A variation is stamped from the job's quote when it is made (`gst_mode`, `gst_rate`, `total`). Quote adds GST on top → the price is ex-GST; the email, the text, the approval page and the job's activity say "$320.00 + GST ($352.00 incl. GST)"; bills read the GST-inclusive total, so the invoice line is $320 + GST. Variations without the stamp keep the old reading. **No backfill.**
- **B-088** The invoice line carries the whole variation description.
- **B-085** `PATCH /projects/{id}/variations/{vid}` (drafts only; 409 once sent); an edit pencil on draft rows opens the form pre-filled; connector `update_variation`.
- **B-084** No sample About us blurb or stats on the quote or invoice PDF, and no stock terms for a business with no terms template.
- **B-064** `services/terms_parse.py`: a heading line takes the paragraph under it; "Title: text" unchanged.
- **B-067** Invoice from a quote: the Job box is the job type and address; the scope sits under the quote's charge (stage and balance invoices).
- **B-065 / B-068 / B-072** A zone with only a shown note prints on the client's copy; notes keep line breaks; Surface prep tasks read "prep".
- **B-079 / B-076** A typed due date sets the payment terms to that many days; emails greet a person or a company's contact, never "Hi Owners"; the default quote opener is "Thanks for the opportunity to quote."

**Jobs, quotes, timesheets**
- **B-074 / B-080** A quote leaving Accepted drops `accepted_at`, the signer fields and the frozen `payment_schedule`, and archives its unsent, unpaid draft invoices. Deleting a job unlinks its invoices. A new job takes the quote's invoices that are linked to no job or to a deleted one.
- **B-082** A job leaving Done / Invoiced loses `completed_date`, with a "Reopened" activity line.
- **B-086** An hourly Library item carries its hourly rate onto the quote line (`services/library_snapshot.py`, mirrored in the builder).
- **B-075** A session's job can be changed without re-checking its times.
- **B-070** A Duplicate that can't be filled removes the empty draft and says why.
- **B-077** Delete project uses the app's confirm.
- **B-062** `AdminShell`: `useAccessStore` moved above the narrow-window return (React #300 / #310 when a window crossed 768 px).

**Storage and the connector**
- **B-083** Google Drive: one resolver for the root on every write — the stored folder while Drive says it is live, otherwise the live folder by name, stored again; the stored photos folder is checked the same way. A Drive error is not read as "gone".
- **B-069** `update_quote` accepts `note` on a zone or line and `mins` on a custom line, and returns what it can't place under `extra.warnings`.
- **Contracts:** `[CASUAL LOADING PERCENT]` and `[CASUAL HOURLY RATE]` (server and screen fill agree); the notice period is required only when the template uses `[NOTICE PERIOD]`; the preview says when a casual field is empty; "Insert a field" says what the money fields turn into; the editor stacks under the list below 1000 px; connector `save_contract_template`.

## Checks for the testing agent (TS_ tenants, torn down; 1440 then 1024)

1. **Variation GST.** On a job whose quote adds GST: draft a variation at $320 → the form says "+ GST · $352.00 incl. GST"; the row reads "$320.00 + GST"; the client page shows $320.00 + GST and "$352.00 including GST"; approve it, raise the next invoice → the variation line is $320.00 and GST is added on top. On a job whose quote includes GST → no "+ GST", the line bills $320 in total.
2. **Edit a draft variation.** Pencil → form pre-filled → change the title and price → saved; a sent variation has no pencil; PATCH on it → 409.
3. **About us and terms.** A tenant with About us empty and no terms template: the quote PDF and Client view have no About us block and no Terms section. With a blurb and two stats typed: exactly those print.
4. **Terms format.** A template written as "1. Your quote" / paragraph / blank line, twelve times → twelve numbered clauses, no "Note".
5. **Invoice layout.** Deposit invoice from a quote with a scope summary: the Job box shows the job type and address only; the scope is under "Deposit · N% of quote …" on the screen, the public page and the PDF.
6. **Zones and notes.** A zone with a multi-line note marked "show on quote" and no lines shows on the Client view and PDF with its line breaks; a "Site clean" task line reads "prep".
7. **Un-accept.** Accept a quote (job + deposit draft) → delete the job → set the quote to Draft: `accepted_at` gone, the deposit draft archived. Accept again → one new job, one new deposit draft linked to it; the job's invoice list and its money card agree.
8. **Reopen.** Mark a job Done then In progress → `completed_date` empty, a "Reopened" line in the activity.
9. **Hourly item.** A Library item priced by the hour at $75 added to a quote line → $75 a unit, no "no price".
10. **Session fix.** Change only the job on a session still on the clock, and on a 0-hour session → saved.
11. **Due date.** Invoice details: type a due date 3 days after the issue date → the card, the Review & send message and the PDF all show that date and "3 days".
12. **Greeting.** A client named "Owners Corporation PS 1234" with a contact "Priya Nair" ticked for quotes → the quote message opens "Hi Priya,"; with no contact → "Hi there,".
13. **Resize.** Open Settings › Crew app at 1440, drag the window to 600 px and back → no blank page, no React error in the console. Same on the quote builder.
14. **Drive.** With a test Drive connected: put the app's "Paint Trade HQ" folder in the bin, upload a quote photo → it lands under a live "Paint Trade HQ", and `drive_integrations.root_folder_id` now holds the live folder. If a test Drive still can't be connected on the preview (as you reported in Round 101), say so and skip this one — `tests/test_fixk_drive_root.py` covers the decision; do not connect anything to Josh's own tenant.
15. **Contracts.** Issue an Employment agreement to a casual with a template that has no `[NOTICE PERIOD]` → Next works with Notice empty; a template using `[CASUAL LOADING PERCENT]` and `$[CASUAL HOURLY RATE]` with rate 38.90 and loading 25 fills "25%" and "$48.63"; at 800 px wide the editor is full width under the list.
16. **Connector.** `update_quote` with `areas: [{id, name, note: "x", note_show_on_quote: true}]` saves the note; an unknown key comes back in `extra.warnings`; `update_variation` and `save_contract_template` work and are in the activity list.
17. No horizontal scroll at 1440 and 1024 on the job page, the invoice editor and Contracts.

## Rules

TS_ rows only, torn down after; Josh's own tenant read-only; **no backfill** (existing variations, quotes, invoices and Drive files are left as they are); nothing beyond this message and nothing from your own suggestion list; no notices or banners; nothing under `app/employee/*` (the patch touches none — `src/utils/contractFill.ts` is shared with the crew signing screen and only gains two fields); AI = Claude only through the app's own key; no secrets in any reply (never print a key, a password, an admin id or MONGO_URL). One commit for the apply, one per follow-up. Report `memory/reports/fix-round-k-report.md` with the commit hashes and the result of each numbered check. What's new as a **draft** only (never publish): "Variations follow the quote's GST, quotes print only what you wrote about your business, invoices show the scope under the charge, and a batch of fixes from the bug log." Save to GitHub and Publish are Josh's clicks.
