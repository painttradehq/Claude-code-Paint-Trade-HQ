# CRM › Messages setup — the page takes the CRM hub's width — SENT to Emergent 27 Nov on Josh's word ("send it")

Josh, 27 Nov, with a screenshot of `/admin/crm/setup`: "CRM gear framing is weird. Make it full width like other pages."

**Cause, read in the code (`main` at `640c20d`):** every CRM page uses the shared frame `S.page` in `components/crm/v2/kit.tsx` (up to 1400 px, centred). `components/crm/v2/CommunicationSettings.tsx` overrides it on its `<main>` with `maxWidth: 1100`. On Josh's window (about 1500 px wide, menu collapsed) that leaves the page as a narrow column with some 170 px of empty space each side and its scrollbar floating in from the edge; the CRM hub beside it fills the space.

**Prototype:** `crm-messages-setup-width.html` — `?today=1` shows it as it is today, `?nav=open` with the side menu open. **Checks:** `tools/test_crm_messages_setup_width.js`, 45 of 45 at 1440 × 900, 1024 × 768 and 1500 × 960 (Josh's window).

---

## The message as sent

# CRM › Messages setup — the page takes the CRM hub's width

Josh: "CRM gear framing is weird. Make it full width like other pages." He is uploading `crm-messages-setup-width.html` (the prototype; `?today=1` shows today's page, `?nav=open` the side menu open). Save it as `memory/specs/crm/crm-messages-setup-width.html`.

**The change — one line.** In `components/crm/v2/CommunicationSettings.tsx`, on `<main data-testid="comms-settings">`, remove `maxWidth: 1100` from the style. The page then keeps the frame it already spreads in — `S.page` from `kit.tsx` (max 1400, centred) — exactly as the CRM hub (`CrmHome.tsx`) and the client page do. Nothing else on the page changes: the same sections in the same order, the same test ids, the same save.

**Checks with the testing agent, a TS_ admin, 1440 then 1024, the side menu open and collapsed:**
1. At the same window size, `[data-testid="comms-settings"]` is exactly as wide as `[data-testid="crm-hub"]` and starts at the same left edge.
2. Nothing scrolls sideways on the page, with every section open (a rule opened in Automations, a template opened in Templates).
3. Back to CRM, Open inbox and Save changes sit on one row beside the title at 1440.
4. In Sending domain, the DNS records table stays inside its card and the long key is still cut with "…"; its copy buttons still work.
5. The three Twilio fields, the template editor, the two AI notes and the signature box stay inside their cards.
6. A screenshot of the page at each width in the report.

**Also — one check to repeat, no code change.** Lucy L2's check 9 was not repeated by the testing agent: with "Ask me before changes" **on**, a send asked for inside a longer task ("start a quote for {TS_ client} and send it") gives a plan card with no send step, and the send comes as its own card afterwards; nothing is sent before **Send it** (dry run). Run it with the testing agent at 1440 and 1024 and add the result to `memory/reports/lucy-l2-report.md`.

**Rules:** this one change only — nothing from your own suggestion list; one commit; TS_ rows only, torn down after; Josh's own tenant read-only; nothing under `app/employee/*`; no key, password or admin id in any reply. Add one line to What's new draft #47 (never publish): "Messages setup in the CRM now uses the full width of the page." Save to GitHub and Publish are Josh's clicks.
