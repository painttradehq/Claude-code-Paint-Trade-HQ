# Round 94 — Settings › Connections: Files & storage and Accounting move out of Business; the Settings rail gets its groups (9 November) — SENT 10 Nov with Round 93 (`round93-94-message.md`, queued `dbpdeq7q3e8s73ehme6g`; Josh uploads `settings-connections.html` with "here"; the §9 defaults taken: Connections, group labels, the foot line, one combined send)

Prototype: **`settings-connections.html`** (open at 1440: the new rail with its four groups → **Connections** with the two sections exactly as they are on Business today → pick *Your Google Drive* → the place in use changes → try OneDrive → refused until connected → the Connect buttons → the foot line; then 1024, where the rail is a wrapping tab strip without the group labels). Playwright `tools/test_connections.js` **10/10** at 1440 and 1024. Josh, 9 November: *"move the accounting and storage in a new page in Settings called integration or connection or something else"*. A move, not a redesign: the two sections keep their components, wording, state and routes. Code read at `82bf0a3`.

## 1. The Settings rail

`SettingsShell.tsx` `ITEMS` gains a `group` and the rail draws a small uppercase label above each group (`set-rail`, `.gl` in the prototype):

| Group | Pages, in order | Notes |
|---|---|---|
| **Your business** | Business · **Suppliers** (Round 93) · **Connections** (this round) · Crew app | business-wide, every admin sees the same |
| **You** | Account · **Alerts** (Round 92) | per person |
| **Plan** | Billing | owner only, as today |
| **Paint Trade HQ** | Platform · *JOSH ONLY* | platform admins only, as today |

Suppliers and Alerts appear with their own rounds; this round builds the groups and the Connections item, and the order above is fixed now so the other two slot in. Narrow mode (`narrow`, the tab strip at 1024): the strip **wraps** (`flexWrap: 'wrap'` — eight items no longer fit one row) and the group labels are not shown. Icons: Connections `link-outline`, Suppliers `storefront-outline`, Alerts `notifications-outline`. `?page=connections` opens it; `app/admin/_layout.tsx:41`, which marks Settings active for `page=business`, treats `connections`, `suppliers` and `alerts` the same way.

## 2. The page (`set-page-connections`, `components/settings/pages/ConnectionsPage.tsx`)

Title **Connections**; the shell's lead for the page: *"The outside services this business is connected to: where files are kept and which accounting software invoices go to. One connection each, for every admin."*; the page's line: *"Where this business keeps its files and which accounting software its invoices go to. One connection each, shared by every admin. The Business page keeps your brand, details and contact."*

Then the two sections **moved from `BusinessPage.tsx` unchanged**, in the same order:

1. **Files & storage** (`sec-storage`, *Saves at once*, the same description): the `storage-options` radio group — *Paint Trade HQ cloud*, *Your Google Drive*, *Your Microsoft OneDrive* — with `pickMode`, `cloudRow`, Open folder / Disconnect / Connect, the "In use" and "Not in use — existing files stay here" lines, the `Radio`. Its state and loaders (`drive`, `od`, `builtinOn`, the `/google-drive` and `/onedrive` status calls) move with it.
2. **Accounting** (`sec-accounting`, *Saves at once*, the same description, the `<div id="accounting" />` anchor above it): `XeroRow` and `MyobRow` with `xero`, `myob`, `loadXero`, `otherConnected`, unchanged.

The hash handling moves too: `BusinessPage.tsx:60` (`#storage` → scroll) becomes the Connections page's; `XeroRow.tsx:39` and `MyobRow.tsx:39` (`#accounting`) keep working because the rows now live here.

**The Business page keeps** Brand, Business details, Contact, Online, its save bar and its tests; the two sections and their state are deleted from it (no duplicate). If the shell's lead for `page === 'business'` mentions files or accounting, the words go.

At the foot of Connections, one dashed note (`connections-also`): *"Also connected, where they are used: your **calendars** from the calendar's gear (Google, Outlook, Apple) and your **email and SMS** from CRM › Messages setup."* — the two words are links (`/admin/events` with the gear's Calendar settings open as that page already allows, and `/admin/crm/setup`). Nothing else moves in this round.

## 3. Every link that points at the old place follows

- **OAuth returns** (the browser lands back on Settings after Google, Microsoft, Xero or MYOB): `routes/google_drive.py:86` `settings_url` → `…/admin/settings?page=connections` (the `#storage` hash and the `drive=` statuses unchanged); `routes/onedrive.py:69` the same with `#storage` and `onedrive=`; `routes/myob.py:23` `SETTINGS_URL` → `?page=connections` (its `#accounting&myob=…` suffix unchanged); Xero's return the same wherever it builds its URL (grep `page=business` and `#accounting` across `backend/` and `frontend/` and repoint every one — there must be none left).
- `backend/tests/test_myob.py:152` expects `…?page=business#accounting&myob=connected` → `page=connections`; any Drive or OneDrive redirect test likewise.
- Anything in the frontend that navigates to `settings?page=business#storage` or `#accounting` (none found at `82bf0a3` outside Settings; re-grep before the build) → `page=connections`.
- Help and What's new text that says "Settings › Business" for storage or accounting (none found) → "Settings › Connections".

## 4. Nothing else changes

The storage and accounting behaviour, the Drive folder, the Xero and MYOB sync, the drawers (`xero-drawer`), the statuses, the "Not set up on this server yet" lines — all as they are. No backend route changes beyond the three redirect URLs. Nothing under `app/employee/*`.

## 5. Verify (testing agent, 1440 then 1024; TS_ tenants; the owner's tenant read-only)

1. The rail shows the four groups and the order in §1 (the Suppliers and Alerts items only once their rounds are built); Platform still only for platform admins; Billing still owner only.
2. Business has no Files & storage and no Accounting; its other sections save as before.
3. Connections shows both sections with live state on a TS_ tenant: the storage mode in use, *Connected as …* for a connected Drive, the Xero and MYOB rows' real status.
4. Picking a storage mode saves and survives a reload; the Drive **Open folder** and **Disconnect** work as before.
5. Connect Google Drive on a TS_ tenant → the return lands on `…?page=connections…#storage`, Connections is open, scrolled to the section, with the connected line; the same for MYOB's return at `#accounting` (and Xero's, if the test harness can reach it — else the redirect URL asserted in a test).
6. `_layout` marks Settings active on `page=connections`.
7. The foot line's two links open the calendar settings and CRM › Messages setup.
8. 1024: the tab strip wraps to two rows at most, no labels, no horizontal scroll. No console errors; `tsc` clean; nothing under `app/employee/*`.

## 6. Tests

`test_myob.py` updated; a redirect test for Drive and OneDrive returns if none exists (one assertion each on the `location`); the Business and Settings frontend checks the testing agent already runs. Suite green before and after (chunked, as Rounds 85–93).

## 7. What's new

A new draft, the next free number, title **"Connections, in one place"**, one card: "Your file storage and accounting connections now have their own Settings page, Connections. Nothing changed in how they work — they just moved out of Business." Draft only; never publish.

## 8. Report

`memory/reports/round94-connections-report.md`, starting "Round 94 done": the verify items with screenshots at both widths, every repointed URL (file:line), the suite before and after. No code review. Do not start anything else after it. Do not offer next action items.

## 9. Josh's calls before the send (defaults; "send" takes them)

1. **The name: Connections.** Alternative: Integrations.
2. **Group labels in the rail** (Your business · You · Plan · Paint Trade HQ). Alternative: one flat list in the same order.
3. **The foot line pointing at the calendar and messaging connections**, which stay where they are used. Alternative: bring them onto Connections too, in a later round.
4. **One send with Round 93** (same rail, same Settings shell) — two messages, one after the other, or one combined message; Josh's word.
