# Round 93 — Trade accounts, the admin half (9 November) — PROTOTYPED, waits for Josh's look and his calls in §11

Prototype: **`trade-accounts.html`** (open at 1440: Library › Trade accounts with three sample accounts → Copy on a number → **+ Add account** opens the panel on the right → pick Taubmans, type a number, a store, the counter note → Save → the fourth card → click a card to edit it → Show to crew off → the badge changes → ⋯ on a card → Show to crew / Remove → **What the crew see** opens the phone preview; then 1024). Playwright `tools/test_trade.js` **23/23** at 1440 and 1024. Josh's note 15 of 7 November and his answer: *"each brand has an account that trade can register to receive discount and all"*, and the crew need to see them. Nothing of the kind exists in the code (`82bf0a3`): a project's equipment line has a free-text `supplier` (`routes/projects.py:1745`), which stays as it is. Everything not named here is unchanged; nothing under `app/employee/*` changes — **the crew screen is the crew chat's round, built on the read route in §4.**

## 1. Where it lives

The Library gets a **fourth section, Trade accounts**, beside Products, Items and Tasks:

- **The hub card** (`app/admin/library/index.tsx`, the `cards` array, after Tasks): title *Trade accounts*, icon `card-outline`; headline *"{n} accounts · {m} the crew can see"*; stats *accounts · crew can see · brands and stores*; setup line *"Add the account you hold with each brand"* until one exists, then *"Up to date"*; *Jump to an account* chips = the brands and stores with one (→ `/admin/library/trade-accounts?brand=`); **Add account** → `/admin/library/trade-accounts?new=1`; hint *"Account number, store and what to say at the counter."* The hub's search box finds accounts by brand, store and number like it finds products.
- **The page** `app/admin/library/trade-accounts.tsx` on the shared Library shell (`components/library/LibraryShell`: `Crumb`, `PageTop`, `SearchRow`, the card grid with `useLibraryCols`). Crumb *Library › Trade accounts*. Title **Trade accounts**, sub *"The accounts your business holds with paint brands and stores. The crew see the ones you let them — the number, the store and what to say at the counter — so they can buy on the account."* Top right: **What the crew see** (ghost, §5) and **+ Add account** (primary, `ta-add`).

## 2. The list (`ta-page`)

- **Search** (`ta-search`): brand, store, account number, account name. Three small stats under it: *accounts · crew can see · brands and stores* (`ta-count`, `ta-crew-count`).
- **One card per account** (`ta-card-{id}`), four columns at 1280 and up, three below, sorted by brand: the brand tile (`BrandTiles` colour and monogram, the logo when Products setup has one) with the brand and the store under it; **Account** and the number large in mono with **Copy** (`ta-copy-{id}`, toast *"{number} copied."*); who the account is under; *Store {phone} · Rep {name} {phone}*; *{terms} · {discount}* (or *No terms noted*); a footer with the badge **CREW SEE THIS** / **HIDDEN FROM CREW** (`ta-badge-{id}`) and *Updated {date}*; a ⋯ menu (`ta-menu-{id}`): **Edit · Show to crew / Hide from crew · Remove**. Clicking the card opens it for editing. *Show to crew* from the menu flips at once (toast *"{brand}: the crew can see it / hidden from the crew."*).
- **Empty** (`ta-empty`): *"No trade accounts yet — add the account you hold with each brand or store: the number, the branch and what the crew should say at the counter."* with the Add button. No match: *"Nothing matches “{text}”."*

## 3. Add and edit — the panel on the right (`ta-panel`, 480 px, 440 at 1024; scrim; Escape closes)

Header **New trade account** / **{Brand} account**; ×. Fields, top to bottom:

1. **Brand or store** (`ta-f-brand`, required): a select of the business's brands from Products setup (`/materials/meta` → `allowed_brands`, the same list the Products page shows) plus **Other — a store or a brand not listed**, which reveals **Name it** (`ta-f-other`, e.g. *Bunnings PowerPass*). Hint: *"Your brands from Products setup, plus any store that holds an account for you."*
2. **Account number** (`ta-f-number`, required) and **Account is under** (`ta-f-account_name`, prefilled with the business name from the profile).
3. **Store or branch** (`ta-f-store`) and **Store phone** (`ta-f-store_phone`).
4. **At the counter — what the crew should say or show** (`ta-f-counter`, text, ≤ 300): *"e.g. Give the business name and the job name as the order reference. Keep the docket."*
5. **Show to crew** (`ta-f-show`, `Switch`, default **on**), with the line *"The crew app lists the brand, who the account is under, the number, the store and its phone, and your note for the counter. Never the terms, the discount, the rep or your notes."*
6. **Office only:** **Rep** and **Rep phone**; **Terms** (*e.g. 30-day account*) and **Discount or price level** (*e.g. 35 % off retail*); **Notes** (≤ 500).
7. Footer: **Remove** (edit only, confirm *"Remove the {brand} account? It leaves this list and the crew app. The account itself is untouched — this is only your record of it."*), **Cancel**, **Save**.

Rules: brand and number required (the field turns red, toast *"Give the brand and the account number."*); **one account per brand and store** (a second *Dulux* at the same store → *"You already have a Dulux account at {store}."*; two Dulux accounts at two stores are fine); saving closes the panel and the card appears or updates (toast *"{brand} account added / saved."*). Up to 30 accounts per business.

## 4. Data and backend

- **`db.trade_accounts`**: `{_id, owner_admin_id, brand, account_number, account_name, store, store_phone, counter_note, show_crew, rep_name, rep_phone, terms, discount, notes, created_by, created_at, updated_at}`; strings trimmed, ≤ 80 chars except `counter_note` ≤ 300 and `notes` ≤ 500; an index on `owner_admin_id`.
- **`routes/trade_accounts.py`**, admin side (`get_current_admin`, tenant-scoped as `library_variants.py`): `GET /api/trade-accounts` (the tenant's list, brand order); `POST` (409 on the brand + store rule, 400 past 30); `PUT /{id}`; `DELETE /{id}`. An "Other" brand is stored as typed; a brand chosen from the list is stored as the list spells it. The brand select is the Products setup list; this round does not add to it.
- **The crew's read**, same file, `get_current_employee`: **`GET /api/employee/trade-accounts`** → the rows of the employee's `owner_admin_id` with `show_crew` true, **only** `{id, brand, account_name, account_number, store, store_phone, counter_note}`, brand order. No write route for crew.
- Nothing else: materials, prices (`cost_price`, Round 88's paint card), the Products page and the builder are untouched. Lucy and MCP: no change.

## 5. "What the crew see" (`ta-crew-preview`)

The Settings › Crew app page already previews the crew app on a phone (`CrewPhonePreview`); this page gets the same kind of button: a 390-px phone mock listing the shown accounts as the crew will get them — the brand tile, who the account is under, the number large, the store, a tap-to-call phone and the counter note; hidden accounts are not listed. It is the admin's picture of the crew half and the crew chat's starting point.

**For the crew chat (after this round):** a *Trade accounts* screen in the crew app reading `GET /api/employee/trade-accounts` — the cards as the preview draws them, Copy on the number, the phone tappable, nothing office-only; where it sits in the crew app (Me tab or a Today card) is the crew chat's call.

## 6. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. The Library hub shows the fourth card with the right counts; its Add button opens the page with the panel open; a chip opens the page filtered to that brand.
2. Add a Dulux account with every field: the card shows the number, the store, the rep line, terms · discount and **Crew see this**; reload keeps it; the row exists with `owner_admin_id` of that TS_ tenant.
3. The rules: no brand or number → refused with the red field; a second Dulux at the same store → 409 and the toast; a second Dulux at another store → allowed; **Other** with *Bunnings PowerPass* → a card with that name.
4. Edit from the card and from ⋯; Hide from crew → the badge, the crew count and the crew route all change; Remove → confirm → gone from the list, the hub counts and the crew route.
5. `GET /api/employee/trade-accounts` as a TS_ employee: only the shown accounts, only the seven fields, none from another tenant; as an employee of a tenant with none → `[]`.
6. Search by store and by number; the hub search finds an account.
7. The preview lists the shown accounts without terms, discount, rep or notes.
8. 1024: three columns, the panel on the right at 440 px, no horizontal scroll. No console errors; `tsc` clean; nothing under `app/employee/*`.

## 7. Tests

`backend/tests/test_r93_trade_accounts.py`: create, list, update, delete; the brand + store rule; the limit; field lengths; the crew route's fields and its isolation (two tenants, two employees); an admin of tenant A cannot read or change tenant B's row. Suite green before and after (chunked, as Rounds 85–92).

## 8. What's new

A new draft, the next free number, title **"Trade accounts in the Library"**, one card: "Keep each brand's trade account in Library › Trade accounts — the number, the store and what to say at the counter. The crew see the ones you let them, on their phone." Draft only; never publish.

## 9. Report

`memory/reports/round93-trade-accounts-report.md`, starting "Round 93 done": the verify items with screenshots at both widths, the crew route's contract (fields, order, isolation) for the crew chat, the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

## 10. Order with the crew chat

This round first (data, routes, admin page). The crew chat's round follows and reads the route; one round at a time across the two chats as always.

## 11. Josh's calls before the send (defaults; "send" takes them)

1. **Home: Library › Trade accounts**, beside the brands the products come from. Alternative: Settings › Business.
2. **Every crew member sees every shown account.** Alternative: a *Who may buy on it* pick per account (everyone / only these people) — one more field and a filter on the crew route.
3. **What the crew see:** brand, who the account is under, number, store, store phone, the counter note — never terms, discount, rep or notes. Alternative: add the rep's name and phone.
4. **One account per brand and store**; a brand at two stores is two cards.
5. **"What the crew see" on the page**, the phone preview the Crew app settings already use. Alternative: leave it out and let the crew round be the picture.
