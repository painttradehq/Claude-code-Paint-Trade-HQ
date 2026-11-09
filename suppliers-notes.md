# Round 93 — Suppliers: the brands and stores you buy from, with their trade accounts (9 November) — PROTOTYPED (Settings › Suppliers, after Josh's "call it Suppliers"), waits for his look and his calls in §11

Prototype: **`settings-suppliers.html`** (open at 1440: Settings › **Suppliers** with four sample suppliers, one a cash store → Copy on a number → **+ Add supplier** opens the panel on the right → pick Taubmans, type a number, a store, the counter note → Save → the fifth card → click a card to edit it → Show to crew off → the badge changes → ⋯ on a card → Show to crew / Remove → **What the crew see** opens the phone preview; then 1024). Playwright `tools/test_suppliers.js` **25/25** at 1440 and 1024. Josh's note 15 of 7 November and his answers: *"each brand has an account that trade can register to receive discount and all"*, the crew need to see them, and (9 Nov) *"bring the trade accounts into the Settings page and call it Suppliers"*. Nothing of the kind exists in the code (`82bf0a3`): a project's equipment line has a free-text `supplier` (`routes/projects.py:1745`), which stays as it is. The Library is untouched. Everything not named here is unchanged; nothing under `app/employee/*` changes — **the crew screen is the crew chat's round, built on the read route in §4.**

## 1. Where it lives

Settings gets a rail page **Suppliers**, second in the *Your business* group (Business · **Suppliers** · Connections · Crew app — the rail of Round 94, `connections-notes.md` §1), `SettingsShell.tsx` `ITEMS` key `suppliers`, icon `storefront-outline`, `?page=suppliers`; `SettingsDesktop.tsx` renders `components/settings/pages/SuppliersPage.tsx` (`set-page-suppliers`). Every admin with Settings access sees it. The shell's lead for the page: *"The brands and stores you buy from, and the trade account you hold with each. The crew see what you let them."*

Page top: **Suppliers**, the line *"The brands and stores you buy from, and the trade account you hold with each. The crew see the ones you let them — the number, the store and what to say at the counter — so they can buy on the account."*; top right **What the crew see** (ghost, §5) and **+ Add supplier** (primary, `sup-add`).

## 2. The list

- **Search** (`sup-search`): brand or store, branch, account number, account name. Three small stats under it: *suppliers · crew can see · with a trade account* (`sup-count`, `sup-crew-count`, `sup-acc-count`).
- **One card per supplier** (`sup-card-{id}`), three columns in the Settings content column (two at 1024), sorted by name: the brand tile (`BrandTiles` colour and monogram, the logo when Products setup has one) with the name and the branch under it; **Account** and the number large in mono with **Copy** (`sup-copy-{id}`, toast *"{number} copied."*) — or, with no number, *"No trade account — {terms or cash}"* (`sup-noacc-{id}`); who the account is under; *Store {phone} · Rep {name} {phone}*; *{terms} · {discount}* when there is an account; a footer with the badge **CREW SEE THIS** / **HIDDEN FROM CREW** (`sup-badge-{id}`) and *Updated {date}*; a ⋯ menu (`sup-menu-{id}`): **Edit · Show to crew / Hide from crew · Remove**. Clicking the card opens it for editing. *Show to crew* from the menu flips at once (toast *"{name}: the crew can see it / hidden from the crew."*).
- **Empty** (`sup-empty`): *"No suppliers yet — add the brands and stores you buy from: the trade account number if you hold one, the branch, and what the crew should say at the counter."* with the Add button. No match: *"Nothing matches “{text}”."*

## 3. Add and edit — the panel on the right (`sup-panel`, 480 px, 440 at 1024; scrim; Escape closes)

Header **New supplier** / **{Name}**; ×. Fields, top to bottom:

1. **Brand or store** (`sup-f-brand`, required): a select of the business's brands from Products setup (`/materials/meta` → `allowed_brands`, the list the Products page shows) plus **Other — a store or a brand not listed**, which reveals **Name it** (`sup-f-other`, e.g. *Bunnings*). Hint: *"Your brands from Products setup, plus any store you buy from."*
2. **Store or branch** (`sup-f-store`) and **Store phone** (`sup-f-store_phone`).
3. **Trade account** — *leave the number blank if you pay cash here*: **Account number** (`sup-f-number`, optional) and **Account is under** (`sup-f-account_name`, prefilled with the business name from the profile; kept only when there is a number).
4. **At the counter — what the crew should say or show** (`sup-f-counter`, ≤ 300): *"e.g. Give the business name and the job name as the order reference. Keep the docket."*
5. **Show to crew** (`sup-f-show`, `Switch`, default **on**): *"The crew app lists the brand or store, who the account is under, the number, the store and its phone, and your note for the counter. Never the terms, the discount, the rep or your notes."*
6. **Office only:** **Rep** and **Rep phone**; **Terms** (*e.g. 30-day account, or Cash*) and **Discount or price level** (*e.g. 35 % off retail*); **Notes** (≤ 500).
7. Footer: **Remove** (edit only; confirm *"Remove {name}? It leaves this list and the crew app. Any account you hold with them is untouched — this is only your record of it."*), **Cancel**, **Save**.

Rules: the brand or store is required (red field, toast *"Choose the brand or name the store."*); **one entry per brand and branch** (a second *Dulux* at the same branch → *"You already have Dulux at {store}."*; Dulux at two branches is two cards); saving closes the panel and the card appears or updates (toast *"{name} added / saved."*). Up to 40 suppliers per business.

## 4. Data and backend

- **`db.suppliers`**: `{_id, owner_admin_id, name, store, store_phone, account_number, account_name, counter_note, show_crew, rep_name, rep_phone, terms, discount, notes, created_by, created_at, updated_at}`; strings trimmed, ≤ 80 chars except `counter_note` ≤ 300 and `notes` ≤ 500; an index on `owner_admin_id`.
- **`routes/suppliers.py`**, admin side (`get_current_admin`, tenant-scoped as `library_variants.py`): `GET /api/suppliers` (the tenant's list, name order); `POST` (409 on the name + branch rule, 400 past 40); `PUT /{id}`; `DELETE /{id}`. An "Other" name is stored as typed; a brand chosen from the list is stored as the list spells it. This round does not add to the Products setup brand list.
- **The crew's read**, same file, `get_current_employee`: **`GET /api/employee/suppliers`** → the rows of the employee's `owner_admin_id` with `show_crew` true, **only** `{id, name, account_name, account_number, store, store_phone, counter_note}`, name order. No write route for crew.
- Nothing else: materials, prices (`cost_price`, Round 88's paint card), the Products page, the Library and the builder are untouched. Lucy and MCP: no change.

## 5. "What the crew see" (`sup-crew-preview`)

The Settings › Crew app page already previews the crew app on a phone (`CrewPhonePreview`); this page gets the same kind of button: a 390-px phone mock listing the shown suppliers as the crew will get them — the tile, who the account is under, the number large (or *"No trade account — pay as the note says."*), the store, a tap-to-call phone and the counter note; hidden suppliers are not listed. It is the admin's picture of the crew half and the crew chat's starting point.

**For the crew chat (after this round):** a *Suppliers* screen in the crew app reading `GET /api/employee/suppliers` — the cards as the preview draws them, Copy on the number, the phone tappable, nothing office-only; where it sits in the crew app (Me tab or a Today card) is the crew chat's call.

## 6. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. Settings shows **Suppliers** in the rail for a TS_ owner and a TS_ team admin; the page opens at `?page=suppliers`; the Library has no new section.
2. Add a Dulux supplier with every field: the card shows the number, the branch, the rep line, terms · discount and **Crew see this**; reload keeps it; the row exists with `owner_admin_id` of that TS_ tenant.
3. The rules: no brand or store → refused with the red field; a second Dulux at the same branch → 409 and the toast; Dulux at another branch → allowed; **Other** with *Bunnings* and no number → a card reading *No trade account — cash*.
4. Edit from the card and from ⋯; Hide from crew → the badge, the crew count and the crew route all change; Remove → confirm → gone from the list and the crew route.
5. `GET /api/employee/suppliers` as a TS_ employee: only the shown suppliers, only the seven fields, none from another tenant; an employee of a tenant with none → `[]`.
6. Search by branch and by number.
7. The preview lists the shown suppliers without terms, discount, rep or notes; the cash store says so.
8. 1024: two columns, the panel on the right at 440 px, the rail a wrapping tab strip, no horizontal scroll. No console errors; `tsc` clean; nothing under `app/employee/*`.

## 7. Tests

`backend/tests/test_r93_suppliers.py`: create, list, update, delete; the name + branch rule; the limit; field lengths; a row without a number; the crew route's fields and its isolation (two tenants, two employees); an admin of tenant A cannot read or change tenant B's row. Suite green before and after (chunked, as Rounds 85–92).

## 8. What's new

A new draft, the next free number, title **"Suppliers in Settings"**, one card: "Keep the brands and stores you buy from in Settings › Suppliers — the trade account number, the branch and what to say at the counter. The crew see the ones you let them, on their phone." Draft only; never publish.

## 9. Report

`memory/reports/round93-suppliers-report.md`, starting "Round 93 done": the verify items with screenshots at both widths, the crew route's contract (fields, order, isolation) for the crew chat, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

## 10. Order with the crew chat

This round first (data, routes, the Settings page). The crew chat's round follows and reads the route; one round at a time across the two chats as always. Round 94 (Connections) is the same rail — the two can go in one send.

## 11. Josh's calls before the send (defaults; "send" takes them)

1. **A supplier with no account number is allowed** (a cash store, with its phone and a note for the crew). Alternative: the number required, suppliers = trade accounts only.
2. **Every crew member sees every shown supplier.** Alternative: a *Who may buy on it* pick per supplier (everyone / only these people) — one more field and a filter on the crew route.
3. **What the crew see:** name, who the account is under, number, store, store phone, the counter note — never terms, discount, rep or notes. Alternative: add the rep's name and phone.
4. **One entry per brand and branch**; a brand at two branches is two cards.
5. **"What the crew see" on the page**, the phone preview the Crew app settings already use. Alternative: leave it out and let the crew round be the picture.
