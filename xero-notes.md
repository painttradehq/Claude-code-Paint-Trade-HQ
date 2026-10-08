# Xero connection — Settings › Business › Accounting + one line on the invoice — Spec Notes for Emergent

Prototypes: `xero-settings.html` (open with `?page=business#accounting` at 1440: the sixth section **Accounting** → Connect Xero → the Xero sign-in is simulated → the right-side panel opens → pick the sales account → Save → the row reads Connected · account · last sync → Settings reopens the panel → Disconnect; `?xero=connected` starts connected; then 1024) and `xero-invoice.html` (the Round 61 invoice builder: `?state=progress` draft → "Goes to Xero when you send it"; `?state=paid` → "In Xero as INV-0029 · synced … · Open in Xero"; `?state=overdue` → "Not in Xero · Xero was unavailable · Retry" → Retry turns it green; `?xero=off` → no line at all). Playwright `tools/test_xero.js` 48/48 at 1440 and 1024. Built on the Round 36 Business page and the Round 61 invoice builder; everything not named here is unchanged.

**Owner (7 Oct):** painters keep their books in accounting software and the app must connect to it, Xero first. Decisions: Xero only in this round, built so MYOB and QuickBooks can be added later as further rows in the same section; invoices go across when they are **sent** (never drafts), from the day the business connects; credit notes and payments recorded in the app go across; a payment reconciled in Xero marks the invoice paid in the app; nothing else is read from or written to Xero (no quotes, bills, expenses, payroll, timesheets). Owner rules: one connection per business; every panel on the right; no banners, no "coming soon" rows; a fact is shown in one place (the invoice carries its own Xero state; the list and the dashboard do not repeat it); no mobile / crew-app work; nothing changes beyond what is listed.

## 1. Reuse / restyle / replace

| Existing piece | Decision | Notes |
|---|---|---|
| `components/settings/pages/BusinessPage.tsx` (Round 36, five sections) | **Extend** | Sixth `Section` `sec-accounting`, saves at once, after Files & storage. |
| `routes/google_drive.py` / `routes/onedrive.py` (per-tenant OAuth, state table, status/authorize-url/callback/disconnect) | **Copy the pattern** | New `routes/xero.py`, same shape, same env-missing behaviour (`configured: false` → "Not set up on this server yet", button disabled). |
| Round 63 worker + the `ai_jobs` queue (`services/jobs.py`) | **Reuse** | Two job kinds: `xero_push` (one invoice, credit note or payment) and `xero_pull` (scheduled, every 15 minutes, every connected tenant). |
| Invoice send route, `POST /invoices/{id}/payments`, credit-and-reissue (Round 61) | **Extend** | Each enqueues a `xero_push` when the tenant is connected and the invoice is on or after the from-date. No change to what they return. |
| Invoice builder (Round 61) Invoice details card | **Extend** | One line, `inv-xero`, under the GST line. |
| Right-side panel shell used by Start fresh (Round 67, 480 px) | **Reuse** | The Xero panel. |
| Token storage (Round 36: refresh tokens encrypted at rest / revocable) | **Reuse** | Same for the Xero refresh token. |

## 2. Settings › Business › Accounting (`sec-accounting`)

Heading **Accounting** with the "saves at once" tag. Line: "Invoices, credit notes and payments go to your accounting software as you send and record them, and a payment you reconcile there marks the invoice paid here. One connection for the whole business."

One row (`acct-xero`), Xero mark, **Xero**, "Each invoice you send appears in Xero with its number, lines, GST and client. Payments you record here are posted to your bank account in Xero; payments you reconcile in Xero come back within the hour."

- Status line `stXero`: "Not connected" (muted) / "✓ Connected to {organisation} · {sales account} · last sync {when}" (green). "last sync" is the finish time of the last `xero_pull` or `xero_push` for the tenant; "never" before the first.
- Actions on the right: **Connect Xero** `xero-connect-btn` (primary) when not connected; **Settings** `xero-settings-btn` (ghost) + **Disconnect** `xero-disconnect-btn` (danger, confirm "Disconnect Xero? Invoices and payments stop going across. Everything already in Xero stays there.") when connected.
- Without server credentials: Connect disabled with the muted line "Not set up on this server yet" under it, exactly as the Drive row behaves.
- Connect → Xero's sign-in and organisation consent → back to `/admin/settings?page=business#accounting&xero=connected` → the row is connected and **the panel opens by itself** in its fresh state (subtitle "Connected · pick where things go, then Save") with the organisation's accounts loaded. If the painter closes it without saving, the defaults in §3 apply and the row still reads connected.

## 3. The panel (`xero-drawer`, right side, 480 px)

Header "Xero" · subtitle "{business} · how invoices and payments go across" (fresh: "Connected · pick where things go, then Save") · ×.

- Organisation card: **{Xero organisation name}** · "Xero organisation · connected as {Xero login email}". When the Xero login has access to more than one organisation, this card becomes a select `xero-org` listing them (the prototype shows the single-organisation case); changing it reloads the accounts below.
- **Sales account** `xero-sales` — the organisation's active accounts of class REVENUE, "{code} · {name}"; default: code 200 if it exists, otherwise the first. "Every invoice line is posted to this account. The list is your Xero chart of accounts."
- **Bank account for payments** `xero-bank` — the organisation's active accounts of type BANK; default the first. "Payments you record in the app are posted here as received payments."
- **GST rate for invoice lines** `xero-tax` — the organisation's tax rates with `CanApplyToRevenue`; default OUTPUT ("GST on Income (10%)"). "Used when the invoice adds GST. Invoices marked No GST are always sent as GST Free Income" (EXEMPTOUTPUT).
- **Send invoices from** `xero-from` (date, default = the connection date, business time zone). "Invoices sent before this date stay out of Xero. Today is the usual choice."
- Text block: "**What goes across:** invoices when you send them, credit notes, and payments you record. Clients are matched by name and email and created in Xero if missing. Your invoice numbers are kept. **What comes back:** a payment reconciled in Xero marks the invoice paid here. Nothing else in Xero is read or changed."
- Footer: Cancel · **Save** `xero-save` → `PUT /api/integrations/xero/settings`, toast, the row's status line updates. Escape and × close without saving.

## 4. The invoice (Round 61 builder, Invoice details card)

One line `inv-xero` under the GST line, only when the tenant is connected (otherwise the card is exactly as today):

- Draft, or sent before the from-date: "Goes to Xero when you send it" (muted). An invoice sent before the from-date reads nothing at all.
- Pushed: "In Xero as {number} · synced {date, time}" (green) + link **Open in Xero** (the Xero deep link to that invoice, new tab).
- Failed: "Not in Xero · {short reason from Xero}" (red) + **Retry** `data-xretry` → `POST /api/invoices/{id}/xero/retry` → enqueues a push; the line reads "Sending…" until the job finishes, then green or red again.
- Clicking the line's links never opens the Invoice details dialog; clicking the rest of the card does, as today.
- The line is the only place the Xero state is shown: no change to the Invoices list, its drawer, the public page, the PDF or the Dashboard.

## 5. Backend

`routes/xero.py`, prefix `/api/integrations/xero`, admin auth, tenant = `owner_admin_id`:

- `GET /status` → `{configured, connected, org_name, org_id, email, settings: {sales_account_code, bank_account_code, tax_type, from_date}, last_sync_at, connected_at, orgs: [{id, name}]}`.
- `GET /authorize-url` → `https://login.xero.com/identity/connect/authorize` with scopes `openid profile email accounting.transactions accounting.contacts accounting.settings offline_access`, state stored in `xero_oauth_states` like Drive.
- `GET /callback` → exchange the code at `https://identity.xero.com/connect/token`; `GET https://api.xero.com/connections` for the organisations; store in `xero_integrations` keyed by admin id: `refresh_token` (encrypted at rest), `access_token` + `expires_at`, `tenant_id` (the Xero tenant id of the chosen organisation), `org_name`, `email` (from the id token), `orgs`, `settings` (defaults as §3), `connected_at`; redirect to `/admin/settings?page=business#accounting&xero=connected`. Xero refresh tokens rotate on every refresh and expire after 60 days unused: always store the new one; if a refresh fails, mark the integration `needs_reconnect` and the row reads "Reconnect Xero" (primary) with the muted line "Xero signed us out · reconnect to continue".
- `GET /accounts` → `{sales: [{code, name}], bank: [{code, name}], tax_rates: [{type, name, rate}]}` from Xero `GET Accounts` (Status ACTIVE; Class REVENUE for sales, Type BANK for bank) and `GET TaxRates` (CanApplyToRevenue).
- `PUT /settings {sales_account_code, bank_account_code, tax_type, from_date}` → 400 on a code not in the organisation's list.
- `POST /disconnect` → `DELETE https://api.xero.com/connections/{connection_id}`, delete the doc. Invoices keep their `xero` field (history); nothing is deleted in Xero.
- Env: `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`, redirect `{APP_PUBLIC_URL}/api/integrations/xero/callback`; both added empty to `backend/.env.example` with a one-line comment. The owner registers the Xero app at the external stage (E15); until then `configured: false`.

**Push** (`xero_push`, one job per action, enqueued by the send route, the payments route, the Stripe webhook's `_mark_invoice_paid`, and credit-and-reissue; only when connected and `issue_date >= from_date`):

- Contact: `GET Contacts?where=EmailAddress=="{email}"`, else by exact Name, else `POST Contacts {Name, EmailAddress, Phones, Addresses}`; store `xero_contact_id` on the customer.
- Invoice: `POST Invoices` with `Type ACCREC`, `InvoiceNumber` = the app's number (kept), `Reference` = the estimate number when the invoice comes from a quote, otherwise the job address, `Date` = issue date, `DueDate` = due date, `LineAmountTypes` = Inclusive when `gst_inclusive` else Exclusive, `Status AUTHORISED`, `LineItems` = one per app line `{Description (name + the sub-line), Quantity, UnitAmount, AccountCode = sales account, TaxType = the chosen rate, or EXEMPTOUTPUT when the invoice has no GST}`; a percentage discount becomes `DiscountRate` on every line; a fixed-amount discount becomes one negative line "Discount" with the same account and tax type. Xero's total must equal the app's total to the cent; if not, the push fails with "Totals differ — {app} vs {Xero}" and nothing is saved in Xero (validate before POST). Store on the invoice `xero: {invoice_id, number, synced_at, url, error: null}`; a second push of the same invoice updates by `InvoiceID` (never a duplicate).
- Credit note (credit-and-reissue): `POST CreditNotes {Type ACCRECCREDIT, Contact, Date, LineItems}` then `PUT CreditNotes/{id}/Allocations` against the original invoice; the re-issued invoice is pushed as a new invoice. Store `xero` on the credit note row.
- Payment recorded in the app: `PUT Payments {Invoice: {InvoiceID}, Account: {Code: bank account}, Date, Amount, Reference}`; store `xero_payment_id` on the payment entry; never pushed twice.
- Failure: Xero's first validation message, shortened to one sentence, into `xero.error`; the worker retries three times (1, 5, 15 minutes) on 5xx/429/network before leaving the error; 4xx validation errors are left at once. Rate limits: 60 calls a minute and 5,000 a day per organisation — the worker runs one tenant's Xero jobs in series.

**Pull** (`xero_pull`, scheduled every 15 minutes for every connected tenant, in the worker; the owner's promise is "within the hour"):

- `GET Invoices?Statuses=PAID,AUTHORISED&where=Type=="ACCREC"` with `If-Modified-Since` = the last pull; for each returned invoice whose `InvoiceID` matches an app invoice: when Xero's `AmountPaid` exceeds the app's `amount_paid`, record the difference as a payment in the app through the same service the typed payment uses (`source: "xero"`, `reference` = the Xero payment id, `date` = Xero's payment date) so status moves to partial/paid exactly as today. Nothing is pulled for invoices the app did not push.
- Update `last_sync_at`. Xero webhooks are not used this round (polling only; say so in the report).

**Tests** (`tests/test_xero.py`, mocking Xero with `httpx` transport mocks, no real calls): status shape and `configured: false` without env; authorize-url state; settings validation; the invoice payload for GST on top, GST inclusive, no GST, percentage and fixed discounts, totals check; contact match by email, then name, then create; credit note + allocation; payment push; pull records a partial then a full payment; push skipped before the from-date and for drafts; retry route enqueues once; refresh-token rotation stored, failure → `needs_reconnect`; tenant B cannot see or trigger tenant A's integration (`test_tenant_isolation.py` extended); disconnect leaves invoices' `xero` fields.

## 6. Verify (agent-tested / Unverified, then the testing-agent pass at 1440 and 1024)

1. Settings › Business shows the Accounting section sixth, as in the prototype at 1440 and 1024; without credentials the Connect button is disabled with the muted line.
2. With test credentials (mock Xero on a TS_ tenant): Connect → the panel opens by itself with the accounts loaded; Save → the status line reads connected · account · last sync; Settings reopens with the saved values; Escape/× close without saving; Disconnect confirms and returns to Not connected.
3. Invoice: a draft shows "Goes to Xero when you send it"; sending enqueues the push and the line turns green with Open in Xero; a failed push shows the red line and Retry re-queues it; nothing on the list, drawer, public page or PDF changed.
4. Credit-and-reissue pushes the credit note and the new invoice; a recorded payment is pushed; a payment reconciled in (mock) Xero marks the app invoice paid on the next pull.
5. Suite green before and after; isolation; TS_ torn down; the owner's tenant untouched; no email or SMS; no real call to Xero in tests.

What's new draft: title "Xero connection", audience Admins & testers, Email as well = No, cards: (1) "Connect Xero" · "Invoices you send go to Xero with their GST and client. Set it up once in Settings › Business." · Try it: Settings · picture: the Accounting row connected; (2) "Paid in Xero, paid here" · "Reconcile a payment in Xero and the invoice is marked paid in the app within the hour." · picture: the green line on an invoice; (3) "Your numbers, kept" · "Invoice numbers stay the same in both places, and nothing else in Xero is touched." · picture: the Xero panel. Draft only; report the id.
