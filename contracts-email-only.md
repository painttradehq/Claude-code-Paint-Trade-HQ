# Round 78 — Contracts: the signed copy goes to both emails and to the owner's storage, never inside the record (spec, ready for "send")

Owner decision, 17 Oct: "the signed contract PDF gets attached to both emails and to the chosen storage of the admin, under a folder named Employee contracts, and stops being stored inside the record of the app." Admin side plus one unchanged crew screen; no prototype (nothing visual changes except the email and a file in the owner's storage).

## 1. What happens today (Round 22 code, `backend/routes/contracts.py`, countersign at lines 349–363)

1. On countersign the PDF is rendered (`_pdf_bytes`) and **stored as base64 text** in `private_files` (kind `contract_pdf`), a row is added to `employee_documents` (kind `contract_pdf`, private), and the issued row gets `pdf_url`, `pdf_file_id`, `pdf_at`.
2. The crew member's email "Your signed {document}" says *"Attached is your signed copy … You can also download it any time from the crew app → My contracts"* — **but nothing is attached**. `_email` calls `services/email.send_email(to, subject, html)`, which has no attachment parameter. The owner's email "Signed copy: {document} — {crew}" says *"The PDF is on the employee record"*, also without an attachment.
3. `GET /employee-contracts/{id}/pdf` (admin) and `GET /employee-contracts/{id}/my-pdf` (crew) serve the stored file and answer 404 "No signed PDF yet" when `pdf_file_id` is missing.
4. The **record** (`employee_contracts`: the filled text as signed, fields, both signatures with method, time and IP, template version, audit) is separate from the PDF. The seven-year promise (contracts spec §1.5, lawyer pack 04 §1) rests on the record; the PDF is a rendering of it and can be produced again at any time.

## 2. The change

**A. Countersign emails carry the PDF.**
- Render the PDF as today. Attach it to both emails as `{"filename": "{document} - signed.pdf", "content": <base64>}`, the way `routes/estimate_send.py` and `routes/invoices.py` attach PDFs through Resend's `attachments`.
- Add an optional `attachments: list[dict] | None = None` parameter to `services/email.send_email`, passed through to `_send_via_resend` into `params["attachments"]`. On the other provider path send without the attachment and append "attachment not sent on this provider" to the audit line.
- Owner email body becomes: *"{crew} signed {document}; you countersigned on {date}. Your copy is attached and saved under Employee contracts in your storage. The record stays in Contracts › Issued."* Crew email body stays as written (it is true now).

**B. The PDF is saved to the owner's storage, as a private file.**
- `services/file_storage.upload(aid, pdf_bytes, "{document} - {crew name} - {date}.pdf", "application/pdf", folder="Employee contracts/{crew name}", public=False)`: Google Drive or OneDrive when the business has one connected (inside its "Paint Trade HQ" folder, as job photos are), otherwise PTHQ cloud — a GridFS blob with `owner_admin_id`, `employee_id`, `kind: "contract_pdf"`, **not** reachable through the public `/api/blobs/` route (that route serves images and videos only, Round 75/75b); it is served only by the two contract routes below with their role checks.
- The issued row keeps `pdf_file_id` and `pdf_url` as the **reference** to that file and `pdf_at` = now. **No** `private_files` insert of the bytes. The `employee_documents` row is kept, pointing at the same reference (so the employee's Documents section still lists the signed contract) — no base64 in it.
- Audit line: *"Signed copy emailed · crew copy {result} · owner copy {result} · saved to {Drive | OneDrive | PTHQ cloud}"*.

**C. Downloads serve the stored file, and render on request if it is gone.**
- `GET /employee-contracts/{id}/pdf` and `/my-pdf`: if `countersigned_at` is null → 404 "No signed PDF yet" (as today). Else serve the referenced file (Drive, OneDrive or the private blob). If the reference cannot be read (file deleted in Drive, blob missing) → `_pdf_bytes(doc, emp, biz, tz)` on request, same `Content-Disposition: attachment; filename="{document} - signed.pdf"`, and a debug log line.
- Tenant and role checks on both routes unchanged (admin: own tenant; crew: own document).

**D. Existing documents.** Documents countersigned before this round keep their stored base64 file and serve it as today; nothing is deleted or moved (no backfill). The owner-only Storage check (Round 75b) lists them if he ever wants them moved.

**E. Admin UI: no change.** The drawer footer "Signed PDF", the row menu "Download signed PDF" and the employee detail Contracts and Documents links keep working.

**F. Crew app: no change.** "Download my signed copy" calls `/my-pdf` and keeps working. `app/employee/contracts.tsx` is not touched (crew chat territory).

**G. Not in this round:** templates, signing or countersign rules, the lawyer-facing texts (§4).

Backend changes: `routes/contracts.py` (countersign + two download routes), `services/email.py` (optional parameter), `services/file_storage.py` only if `public=False` is not yet honoured on the PTHQ-cloud path. Env changes: none. New routes: none.

## 3. Tests

Extend `backend/tests/test_r22_contracts.py` on a `TS_` tenant:
1. Countersign → no `private_files` row with bytes for the new document; `pdf_file_id` set to a storage reference; `pdf_at` set; the `employee_documents` row points at the reference.
2. The two emails each carry exactly one attachment named "{document} - signed.pdf" (assert on the dry-run / Resend testing-mode params; no real email leaves the test).
3. With no Drive connected the file is a private blob: `GET /api/blobs/{id}` → 404; admin `/pdf` and crew `/my-pdf` return `application/pdf` whose bytes start with `%PDF`; the crew of another `TS_` tenant and an admin of another tenant get 404; before countersign → 404 "No signed PDF yet".
4. With the blob deleted, `/pdf` still returns a PDF (rendered on request).
5. A document seeded with the old base64 `pdf_file_id` still serves the stored file.
6. With Drive mocked as connected, `upload` is called with `public=False` and the folder "Employee contracts/{crew name}".

Testing agent (1440, then 1024; TS_ tenant): Issued → row → Countersign as the owner → timeline "Copy emailed" green → Signed PDF downloads; employee detail → Contracts shows the link and Documents lists the signed contract; crew app My contracts → Download my signed copy (the crew screen is untouched, so this is a reuse check only). Owner tenant read-only; TS_ torn down; no email or SMS sent for real.

## 4. Texts to change later (with the lawyer's rerun of Round 66, not in this round)

- Lawyer pack 04 §4 step 4: "stores it privately on the employee record" → "emails it to the crew member and the owner and saves it in the owner's storage under Employee contracts; the signed record stays in the app and the PDF can be downloaded again from it at any time".
- Data map §2 and §4: "signed PDFs … at least 7 years" → "the signed record (text, signatures, times) at least 7 years; the PDF is kept in the owner's storage and produced again from the record if lost".
- Contracts spec §1.5 and §5 wording to match. The app shows no legal text about this, so nothing in the app changes.

## 5. What's new (Draft only)

**Title:** Signed contracts, delivered
**Body:** When you countersign a crew contract, the signed PDF now arrives attached to both emails and is filed under Employee contracts in your storage. The record stays in Contracts › Issued as before.

## 6. Report

"Round 78 done" at the top; every §3 item as agent-tested or Unverified; the testing-agent pass; the files changed; confirm no stored PDF was deleted and no email left the sandbox.
