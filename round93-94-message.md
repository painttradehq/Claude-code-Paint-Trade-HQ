Rounds 93 + 94 in one round — Settings › **Suppliers** (new) and Settings › **Connections** (Files & storage and Accounting move out of Business), with the Settings rail grouped. Start when you hold the two prototypes: Josh uploads **`settings-suppliers.html`** and **`settings-connections.html`** (standalone pages) with "here"; save them as `memory/specs/settings/settings-suppliers.html` and `memory/specs/settings/settings-connections.html`, and this message as `memory/specs/settings/round93-94-message.md`. Round 92 is done (`42125f6`); nothing else is running. One round at a time — if a crew round is running, queue this behind it. Backend and admin frontend only; nothing under `app/employee/*`. TS_ tenants only; the owner's tenant read-only; nothing published. Build exactly what is written here; nothing from the suggestion list; no code review. File:line below are as at `82bf0a3`; where a line has moved since, find the function by name.

Part A is the rail (shared by both). Part B is Suppliers. Part C is Connections. Then verify, tests, What's new, report.

# Part A — the Settings rail gets its groups

`SettingsShell.tsx` `ITEMS` gains a `group` and the rail draws a small uppercase label above each group (`set-rail`, `.gl` in the prototypes):

| Group | Pages, in order | Notes |
|---|---|---|
| **Your business** | Business · **Suppliers** (Part B) · **Connections** (Part C) · Crew app | business-wide, every admin sees the same |
| **You** | Account · Alerts (Round 92, already there) | per person |
| **Plan** | Billing | owner only, as today |
| **Paint Trade HQ** | Platform · *JOSH ONLY* | platform admins only, as today |

Narrow mode (`narrow`, the tab strip at 1024): the strip **wraps** (`flexWrap: 'wrap'` — eight items no longer fit one row) and the group labels are not shown. Icons: Suppliers `storefront-outline`, Connections `link-outline`. `?page=suppliers` and `?page=connections` open their pages; `app/admin/_layout.tsx:41`, which marks Settings active for `page=business` (and `alerts` since Round 92), treats `suppliers` and `connections` the same way.

# Part B — Round 93: Suppliers

The prototype `settings-suppliers.html` (open at 1440: Settings › **Suppliers** with four sample suppliers, one a cash store → Copy on a number → **+ Add supplier** opens the panel on the right → pick Taubmans, type a number, a store, the counter note → Save → the fifth card → click a card to edit it → Show to crew off → the badge changes → ⋯ on a card → Show to crew / Remove → **What the crew see** opens the phone preview; then 1024). Its checks (`tools/test_suppliers.js`, 25 at 1440 and 1024) are the shape of the verify list. Josh's note 15 of 7 November and his answers: *"each brand has an account that trade can register to receive discount and all"*, the crew need to see them, and *"bring the trade accounts into the Settings page and call it Suppliers"*. Nothing of the kind exists in the code: a project's equipment line has a free-text `supplier` (`routes/projects.py:1745`), which stays as it is. The Library is untouched. **The crew screen is the crew chat's round, built on the read route in B4 — nothing under `app/employee/*` here.**

## B1. Where it lives

Rail page **Suppliers**, second in *Your business* (Part A), `SettingsShell.tsx` `ITEMS` key `suppliers`; `SettingsDesktop.tsx` renders `components/settings/pages/SuppliersPage.tsx` (`set-page-suppliers`). Every admin with Settings access sees it. The shell's lead for the page: *"The brands and stores you buy from, and the trade account you hold with each. The crew see what you let them."*

Page top: **Suppliers**, the line *"The brands and stores you buy from, and the trade account you hold with each. The crew see the ones you let them — the number, the store and what to say at the counter — so they can buy on the account."*; top right **What the crew see** (ghost, B5) and **+ Add supplier** (primary, `sup-add`).

## B2. The list

- **Search** (`sup-search`): brand or store, branch, account number, account name. Three small stats under it: *suppliers · crew can see · with a trade account* (`sup-count`, `sup-crew-count`, `sup-acc-count`).
- **One card per supplier** (`sup-card-{id}`), three columns in the Settings content column (two at 1024), sorted by name: the brand tile (`BrandTiles` colour and monogram, the logo when Products setup has one) with the name and the branch under it; **Account** and the number large in mono with **Copy** (`sup-copy-{id}`, toast *"{number} copied."*) — or, with no number, *"No trade account — {terms or cash}"* (`sup-noacc-{id}`); who the account is under; *Store {phone} · Rep {name} {phone}*; *{terms} · {discount}* when there is an account; a footer with the badge **CREW SEE THIS** / **HIDDEN FROM CREW** (`sup-badge-{id}`) and *Updated {date}*; a ⋯ menu (`sup-menu-{id}`): **Edit · Show to crew / Hide from crew · Remove**. Clicking the card opens it for editing. *Show to crew* from the menu flips at once (toast *"{name}: the crew can see it / hidden from the crew."*).
- **Empty** (`sup-empty`): *"No suppliers yet — add the brands and stores you buy from: the trade account number if you hold one, the branch, and what the crew should say at the counter."* with the Add button. No match: *"Nothing matches "{text}"."*

## B3. Add and edit — the panel on the right (`sup-panel`, 480 px, 440 at 1024; scrim; Escape closes)

Header **New supplier** / **{Name}**; ×. Fields, top to bottom:

1. **Brand or store** (`sup-f-brand`, required): a select of the business's brands from Products setup (`/materials/meta` → `allowed_brands`, the list the Products page shows) plus **Other — a store or a brand not listed**, which reveals **Name it** (`sup-f-other`, e.g. *Bunnings*). Hint: *"Your brands from Products setup, plus any store you buy from."*
2. **Store or branch** (`sup-f-store`) and **Store phone** (`sup-f-store_phone`).
3. **Trade account** — *leave the number blank if you pay cash here*: **Account number** (`sup-f-number`, optional) and **Account is under** (`sup-f-account_name`, prefilled with the business name from the profile; kept only when there is a number).
4. **At the counter — what the crew should say or show** (`sup-f-counter`, ≤ 300): *"e.g. Give the business name and the job name as the order reference. Keep the docket."*
5. **Show to crew** (`sup-f-show`, `Switch`, default **on**): *"The crew app lists the brand or store, who the account is under, the number, the store and its phone, and your note for the counter. Never the terms, the discount, the rep or your notes."*
6. **Office only:** **Rep** and **Rep phone**; **Terms** (*e.g. 30-day account, or Cash*) and **Discount or price level** (*e.g. 35 % off retail*); **Notes** (≤ 500).
7. Footer: **Remove** (edit only; confirm *"Remove {name}? It leaves this list and the crew app. Any account you hold with them is untouched — this is only your record of it."*), **Cancel**, **Save**.

Rules: the brand or store is required (red field, toast *"Choose the brand or name the store."*); **one entry per brand and branch** (a second *Dulux* at the same branch → *"You already have Dulux at {store}."*; Dulux at two branches is two cards); saving closes the panel and the card appears or updates (toast *"{name} added / saved."*). Up to 40 suppliers per business. A supplier with no account number is allowed (a cash store). Every crew member sees every shown supplier.

## B4. Data and backend

- **`db.suppliers`**: `{_id, owner_admin_id, name, store, store_phone, account_number, account_name, counter_note, show_crew, rep_name, rep_phone, terms, discount, notes, created_by, created_at, updated_at}`; strings trimmed, ≤ 80 chars except `counter_note` ≤ 300 and `notes` ≤ 500; an index on `owner_admin_id`.
- **`routes/suppliers.py`**, admin side (`get_current_admin`, tenant-scoped as `library_variants.py`): `GET /api/suppliers` (the tenant's list, name order); `POST` (409 on the name + branch rule, 400 past 40); `PUT /{id}`; `DELETE /{id}`. An "Other" name is stored as typed; a brand chosen from the list is stored as the list spells it. This round does not add to the Products setup brand list.
- **The crew's read**, same file, `get_current_employee`: **`GET /api/employee/suppliers`** → the rows of the employee's `owner_admin_id` with `show_crew` true, **only** `{id, name, account_name, account_number, store, store_phone, counter_note}`, name order. No write route for crew.
- Nothing else: materials, prices (`cost_price`, Round 88's paint card), the Products page, the Library and the builder are untouched. Lucy and MCP: no change.

## B5. "What the crew see" (`sup-crew-preview`)

The Settings › Crew app page already previews the crew app on a phone (`CrewPhonePreview`); this page gets the same kind of button: a 390-px phone mock listing the shown suppliers as the crew will get them — the tile, who the account is under, the number large (or *"No trade account — pay as the note says."*), the store, a tap-to-call phone and the counter note; hidden suppliers are not listed. It is the admin's picture of the crew half and the crew chat's starting point.

# Part C — Round 94: Connections

The prototype `settings-connections.html` (open at 1440: the new rail with its four groups → **Connections** with the two sections exactly as they are on Business today → pick *Your Google Drive* → the place in use changes → try OneDrive → refused until connected → the Connect buttons → the foot line; then 1024, where the rail is a wrapping tab strip without the group labels). Its checks (`tools/test_connections.js`, 10 at 1440 and 1024) are the shape of the verify list. Josh, 9 November: *"move the accounting and storage in a new page in Settings called integration or connection or something else"*. **A move, not a redesign: the two sections keep their components, wording, state and routes.**

## C1. The page (`set-page-connections`, `components/settings/pages/ConnectionsPage.tsx`)

Title **Connections**; the shell's lead for the page: *"The outside services this business is connected to: where files are kept and which accounting software invoices go to. One connection each, for every admin."*; the page's line: *"Where this business keeps its files and which accounting software its invoices go to. One connection each, shared by every admin. The Business page keeps your brand, details and contact."*

Then the two sections **moved from `BusinessPage.tsx` unchanged** (`BusinessPage.tsx:128–145` at `82bf0a3`), in the same order:

1. **Files & storage** (`sec-storage`, *Saves at once*, the same description): the `storage-options` radio group — *Paint Trade HQ cloud*, *Your Google Drive*, *Your Microsoft OneDrive* — with `pickMode`, `cloudRow`, Open folder / Disconnect / Connect, the "In use" and "Not in use — existing files stay here" lines, the `Radio`. Its state and loaders (`drive`, `od`, `builtinOn`, the `/google-drive` and `/onedrive` status calls) move with it.
2. **Accounting** (`sec-accounting`, *Saves at once*, the same description, the `<div id="accounting" />` anchor above it): `XeroRow` and `MyobRow` with `xero`, `myob`, `loadXero`, `otherConnected`, unchanged.

The hash handling moves too: `BusinessPage.tsx:60` (`#storage` → scroll) becomes the Connections page's; `XeroRow.tsx:39` and `MyobRow.tsx:39` (`#accounting`) keep working because the rows now live here.

**The Business page keeps** Brand, Business details, Contact, Online, its save bar and its tests; the two sections and their state are deleted from it (no duplicate). If the shell's lead for `page === 'business'` mentions files or accounting, the words go.

At the foot of Connections, one dashed note (`connections-also`): *"Also connected, where they are used: your **calendars** from the calendar's gear (Google, Outlook, Apple) and your **email and SMS** from CRM › Messages setup."* — the two words are links (`/admin/events` with the gear's Calendar settings open as that page already allows, and `/admin/crm/setup`). Nothing else moves in this round.

## C2. Every link that points at the old place follows

- **OAuth returns** (the browser lands back on Settings after Google, Microsoft, Xero or MYOB): `routes/google_drive.py:86` `settings_url` → `…/admin/settings?page=connections` (the `#storage` hash and the `drive=` statuses unchanged); `routes/onedrive.py:69` the same with `#storage` and `onedrive=`; `routes/myob.py:23` `SETTINGS_URL` → `?page=connections` (its `#accounting&myob=…` suffix unchanged); Xero's return the same wherever it builds its URL (grep `page=business` and `#accounting` across `backend/` and `frontend/` and repoint every one — there must be none left).
- `backend/tests/test_myob.py:152` expects `…?page=business#accounting&myob=connected` → `page=connections`; any Drive or OneDrive redirect test likewise.
- Anything in the frontend that navigates to `settings?page=business#storage` or `#accounting` (none found at `82bf0a3` outside Settings; re-grep before the build) → `page=connections`.
- Help and What's new text that says "Settings › Business" for storage or accounting (none found) → "Settings › Connections".

## C3. Nothing else changes

The storage and accounting behaviour, the Drive folder, the Xero and MYOB sync, the drawers (`xero-drawer`), the statuses, the "Not set up on this server yet" lines — all as they are. No backend route changes beyond the redirect URLs. Nothing under `app/employee/*`.

# Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

Rail

1. The rail shows the four groups in Part A's order for a TS_ owner (Business · Suppliers · Connections · Crew app / Account · Alerts / Billing / Platform for a platform admin only); Billing still owner only; a TS_ team admin sees the same groups minus what their access hides. `_layout` marks Settings active on `page=suppliers` and `page=connections`.

Suppliers

2. The page opens at `?page=suppliers`; the Library has no new section.
3. Add a Dulux supplier with every field: the card shows the number, the branch, the rep line, terms · discount and **Crew see this**; reload keeps it; the row exists with `owner_admin_id` of that TS_ tenant.
4. The rules: no brand or store → refused with the red field; a second Dulux at the same branch → 409 and the toast; Dulux at another branch → allowed; **Other** with *Bunnings* and no number → a card reading *No trade account — cash*.
5. Edit from the card and from ⋯; Hide from crew → the badge, the crew count and the crew route all change; Remove → confirm → gone from the list and the crew route.
6. `GET /api/employee/suppliers` as a TS_ employee: only the shown suppliers, only the seven fields, none from another tenant; an employee of a tenant with none → `[]`.
7. Search by branch and by number.
8. The preview lists the shown suppliers without terms, discount, rep or notes; the cash store says so.

Connections

9. Business has no Files & storage and no Accounting; its other sections save as before.
10. Connections shows both sections with live state on a TS_ tenant: the storage mode in use, *Connected as …* for a connected Drive, the Xero and MYOB rows' real status.
11. Picking a storage mode saves and survives a reload; the Drive **Open folder** and **Disconnect** work as before.
12. Connect Google Drive on a TS_ tenant → the return lands on `…?page=connections…#storage`, Connections is open, scrolled to the section, with the connected line; the same for MYOB's return at `#accounting` (and Xero's, if the harness can reach it — else the redirect URL asserted in a test).
13. The foot line's two links open the calendar settings and CRM › Messages setup.

Both

14. 1024: Suppliers in two columns with the panel at 440 px; the tab strip wraps to two rows at most, no labels; no horizontal scroll on either page. No console errors; `tsc` clean; nothing under `app/employee/*`.

# Tests

`backend/tests/test_r93_suppliers.py`: create, list, update, delete; the name + branch rule; the limit; field lengths; a row without a number; the crew route's fields and its isolation (two tenants, two employees); an admin of tenant A cannot read or change tenant B's row. `test_myob.py` updated; a redirect test for the Drive and OneDrive returns if none exists (one assertion each on the `location`). Suite green before and after (chunked, as Rounds 85–92).

# What's new

Two new drafts, the next free numbers, one card each. **"Suppliers in Settings"**: "Keep the brands and stores you buy from in Settings › Suppliers — the trade account number, the branch and what to say at the counter. The crew see the ones you let them, on their phone." **"Connections, in one place"**: "Your file storage and accounting connections now have their own Settings page, Connections. Nothing changed in how they work — they just moved out of Business." Drafts only; never publish.

# Report, and GitHub

One report, `memory/reports/round93-94-report.md`, starting "Rounds 93 and 94 done": the verify items with screenshots at both widths, the crew route's contract (fields, order, isolation) for the crew chat, every repointed URL (file:line), the suite before and after, and the commit hash at the end so Josh can click **Save to GitHub**. No code review. Do not start anything else after it. Do not offer next action items.
