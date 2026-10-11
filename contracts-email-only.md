# Contracts — signed copy by email only (follow-up, DRAFT 11 Oct, not sent)

Owner decision, 11 Oct: "maybe email only to both employee and admin." Josh confirms with one word before this goes. Queue position: after C1 is done (one round at a time across both chats). Admin side plus one unchanged crew screen; no prototype needed, nothing visual changes except the email.

## 1. What happens today (Round 22 code, `backend/routes/contracts.py`, countersign at lines 349–363)

1. On countersign the PDF is rendered (`_pdf_bytes`) and **stored** base64 in `private_files` (kind `contract_pdf`), a row is added to `employee_documents` (kind `contract_pdf`, private), and the issued row gets `pdf_url`, `pdf_file_id`, `pdf_at`.
2. The crew member's email "Your signed {document}" says *"Attached is your signed copy … You can also download it any time from the crew app → My contracts"* — **but nothing is attached**. `_email` calls `services/email.send_email(to, subject, html)`, which has no attachment parameter. The owner's email "Signed copy: {document} — {crew}" says *"The PDF is on the employee record"*, also without an attachment.
3. `GET /employee-contracts/{id}/pdf` (admin) and `GET /employee-contracts/{id}/my-pdf` (crew) serve the stored file and answer 404 "No signed PDF yet" when `pdf_file_id` is missing.
4. The **record** (`employee_contracts`: the filled text as signed, fields, both signatures with method, time and IP, template version, audit) is separate from the PDF. The seven-year promise (contracts spec §1.5, lawyer pack 04 §1) rests on the record; the PDF is a rendering of it and can be produced again at any time.

So "email only" loses nothing: the record stays, the PDF stops being stored, and both people actually receive it.

## 2. The change

**A. Countersign emails carry the PDF; the PDF is not stored.**
- Render the PDF as today. Attach it to both emails as `{"filename": "{document} - signed.pdf", "content": <base64>}`, the way `routes/estimate_send.py` and `routes/invoices.py` attach PDFs through Resend's `attachments`.
- Add an optional `attachments: list[dict] | None = None` parameter to `services/email.send_email`, passed through to `_send_via_resend` into `params["attachments"]`. Only the contracts route uses it in this round. On the other provider path (`EMAIL_KEY`) send without the attachment and append "attachment not sent on this provider" to the audit line; the parking-lot item "Resend-only code" removes that path later.
- Owner email body becomes: *"{crew} signed {document}; you countersigned on {date}. Your copy is attached. The record stays in Contracts › Issued."* Crew email body stays as written (it is true now).
- **No** `private_files` insert, **no** `employee_documents` row. Set `pdf_at` = now (the drawer timeline step "Copy emailed" reads it); leave `pdf_url` and `pdf_file_id` null.
- Audit line: *"Signed copy emailed · crew copy {result} · owner copy {result}"* (the `_email` return fragments as today).

**B. Downloads render on request.**
- `GET /employee-contracts/{id}/pdf` and `/my-pdf`: if `countersigned_at` is null → 404 "No signed PDF yet" (as today). Else if `pdf_file_id` is set (documents countersigned before this round) → serve the stored file as today. Else → `_pdf_bytes(doc, emp, biz, tz)` on request, same `Content-Disposition: attachment; filename="{document} - signed.pdf"`.
- Tenant and role checks on both routes unchanged (admin: own tenant; crew: own document).

**C. Admin UI: no change.** The drawer footer "Signed PDF", the row menu "Download signed PDF" and the employee detail Contracts link call the admin route and keep working. The employee detail **Documents** section simply gets no new `contract_pdf` row; existing rows stay (no deletion, no backfill).

**D. Crew app: no change.** "Download my signed copy" calls `/my-pdf` and keeps working. `app/employee/contracts.tsx` is not touched (crew chat territory).

**E. Not in this round:** templates, signing or countersign rules, stored PDFs (none deleted), Drive/OneDrive (contract PDFs never went there), the lawyer-facing texts (§4).

Backend changes: `routes/contracts.py` (countersign + two download routes), `services/email.py` (optional parameter). Env changes: none. New routes: none. Removed routes: none.

## 3. Tests

Extend `backend/tests/test_r22_contracts.py` on a `TS_` tenant:
1. Countersign → no `private_files` row of kind `contract_pdf` for the new document, no `employee_documents` row, `pdf_at` set, `pdf_file_id` null.
2. The two emails each carry exactly one attachment named "{document} - signed.pdf" (assert on the dry-run / Resend testing-mode params; no real email leaves the test).
3. Admin `/pdf` and crew `/my-pdf` return `application/pdf` whose bytes start with `%PDF`; the crew of another `TS_` tenant and an admin of another tenant get 404; before countersign → 404 "No signed PDF yet".
4. A document seeded with a `pdf_file_id` still serves the stored file.

Testing agent (1440, then 1024; TS_ tenant): Issued → row → Countersign as the owner → timeline "Copy emailed" green → Signed PDF downloads; employee detail → Contracts shows the link, Documents has no new row; crew app My contracts → Download my signed copy (the crew screen is untouched, so this is a reuse check only). Owner tenant read-only; TS_ torn down; no email or SMS sent for real.

## 4. Texts to change later (with the lawyer's rerun of Round 66, not in this round)

- Lawyer pack 04 §4 step 4: "stores it privately on the employee record" → "emails it to the crew member and the owner; the signed record stays in the app and the PDF can be downloaded again from it at any time".
- Data map §2 and §4: "signed PDFs … at least 7 years" → "the signed record (text, signatures, times) at least 7 years; the PDF is produced from it on request".
- Contracts spec §1.5 and §5 wording to match. The app shows no legal text about this, so nothing in the app changes.

## 5. What's new

None. The owner sees the same buttons; the only visible difference is the signed copy arriving as an attachment.

## 6. Report

"Contracts email-only done" at the top; every §3 item as agent-tested or Unverified; the testing-agent pass; the two files changed; confirm no stored PDF was deleted and no email left the sandbox.
