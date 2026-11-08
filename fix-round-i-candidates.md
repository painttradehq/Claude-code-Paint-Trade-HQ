# Fix Round I — candidates collected after Round 87 (7 November)

Observations, not decisions. Josh picks what goes in.

1. **Two test files fail at the baseline `82bf0a3`**, before Round 87 touched anything: `test_r78_contracts` (2 cases) and `test_materials_tier_gating` (3 cases). They come from the November work done directly with Emergent (the contracts/countersign changes and the plan-tier catalogue gating). Ask Emergent for the failing assertions and whether the behaviour or the tests are wrong.
2. **Equipment page: what Josh meant.** His note said "there is no list of items"; the page lists his one item. If he meant a list of standard equipment to add from (ladders, sprayers, drop sheets…), that is a new catalogue, like the products one — a design round, not a fix.
3. **The CRM inbox at 390** after Round 87 is code-verified only (the after-screenshot was not captured). Josh checks it on his phone after the publish.
4. **More pre-existing test failures named by Emergent after the crew chat's Round E (7 Nov):** `test_r46_attachments` (2) and `test_r63_worker` (1), alongside `test_r78_contracts` (2) and the known `test_r19` order case. Same ask as item 1: failing assertions and whether the behaviour or the tests are wrong.
5. **Admin project page money card after a payment** (Josh asked Emergent directly, 7 Nov): the live data is right; the card showed stale figures until a fresh open. Emergent offered "a one-line refetch hardening on the admin project page" — an admin file, so it waits for Josh's word here.
