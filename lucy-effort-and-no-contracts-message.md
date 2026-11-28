# Lucy at normal effort · Lucy drafts contracts and consents only on the full package — NOT SENT, waits for Josh's "send"

Josh, 28 Nov: "One more small thing goes with the next round: tell Lucy not to draft any contract in the app, as PTHQ wants to have a package to sell the draft contracts and consents as a package." Then, the same day: **"Change it: Lucy only drafts contracts and others only in the full package."**

**Read as:** the full package is **Enterprise** — the top one of the three, the one that already includes "HR contracts with e-sign". On it Lucy drafts contracts, consents and the like as she does today; on the others she does not.

The next round is also the effort change recommended to him after Parts A–D (low → normal). He has not yet said "send"; this message carries both and goes on his word.

## What the code shows (app repo, `main` on 28 Nov)

- **The packages** (`services/plans.py`): Starter 59, Small business 179, Enterprise 249. **Lucy** comes with Small business; **Contracts** ("HR contracts with e-sign") comes with Enterprise. `plans.has(owner, "contracts")` answers whether a business has it — true on Enterprise, on a trial, for an invited tester and for the platform owner.
- **The Contracts page is already kept to Enterprise**, but only at the door: the plan gate (`services/plan_gate.py`) refuses requests to `/api/contracts…`. Lucy's ability `save_contract_template` calls the same code from inside, past that door — so **a Small business owner can have Lucy write contract templates today.** The same ability is in the connector for an outside Claude, also past the door.
- She can also simply write contract wording in a chat reply or an email. Nothing in her instructions mentions contracts.

**So the rule sits on the ability itself,** not only on Lucy: whoever calls it — Lucy or an outside Claude through the connector — it follows the package. That is one check in one place, and without it the rule is walked around through the connector.

**Still left for his word, not in the message:** the terms on a quote (`update_quote` can set a quote's `terms`).

No prototype: an instruction and a check.

---

## The message to send

# Two small parts: Lucy at normal effort · Lucy drafts contracts and consents only on the full package

**Josh's rules, first:** no test runs on his account — not signed in to, not read, not written; every database read carries the TS_ business's own filter; seed only through the dry-run server; TS_ rows only, removed after; nothing leaves.

From the admin chat. Two parts, one commit each.

## Part 1 — effort back to the model's normal

Your Part A report showed two slips at low effort that did not show at the default: with a photo she wrote "I can't open the photo myself" although it was in the conversation, and on the ten-item task she spoke before searching.

1. `AI_EFFORT`'s default in `services/ai_provider.py` becomes `high` — the default for `claude-sonnet-5-5`. The model does not change.
2. Run the photo check once more on the real API: she must describe what is in the photo, not say she cannot open it.
3. Run the cost set once: all sixteen pass. Report cold, warm, as billed and seconds beside the low-effort run.

No What's new card. Report: a short section at the end of `memory/reports/lucy-cost-report.md`.

## Part 2 — contracts and consents are drafted only on the package that includes Contracts

Josh: "Lucy only drafts contracts and others only in the full package."

The full package is the one whose plan includes the `contracts` feature — Enterprise today. Use `plans.has(owner, "contracts")` as the one rule, so trials, invited testers and the platform owner behave as they do everywhere else, and a renamed or re-arranged package needs no change here.

Today the Contracts page is refused to the other packages by the plan gate, but `save_contract_template` calls the same code from inside, past the gate — a Small business owner can have Lucy write contract templates.

1. **The ability follows the package.** `save_contract_template` and `get_contract_templates` are refused for a business whose package does not include Contracts — in the ability itself, so it holds for Lucy and for an outside Claude through the connector. The refusal is in the app's own plan words, naming the package from the plan table ("Enterprise" today).
2. **Lucy's list follows it too.** On a package without Contracts, neither ability is offered to the model and neither can be a step of `do_steps`.
3. **Her instructions follow it.** Build this paragraph of `ADMIN_SYSTEM_PROMPT` from the package:
   - **With Contracts:** nothing new — she drafts and saves contract and consent wording as today.
   - **Without Contracts:** she does not write or rewrite the wording of a contract, an agreement or a consent form — not in a chat reply, not in an email or a text, not into a template, not as a file. That covers employment agreements, subcontractor agreements, confidentiality, codes of conduct, safety agreements, photo and social media consents, client contracts, and any other agreement or consent. Asked for one, she says exactly: "Drafting contracts and consent forms comes with the {package name} package. The owner can change the package in Settings › Billing." Nothing added — no partial draft, no outline, no "here are the clauses you'd want".
   - Either way, mentioning a contract in a message is fine ("the signed contract is attached"); writing its wording is what the rule is about.
4. **Her "what I can do" answer** does not change.

### Checks for Part 2

Pure / in-process:
1. A business with Contracts: both abilities on Lucy's list; saving a template's wording works as today.
2. A business without: neither on her list; a `do_steps` step naming either is refused; the ability called directly (as the connector does) is refused in the plan's words; no template changes.
3. A trial, an invited tester and the platform owner: as 1.
4. The package changes from Small business to Enterprise: her next message has the abilities and the other paragraph.

On screen with the testing agent, real model, **1440 then 1024** — a TS_ business on Small business:
5. "Draft an employment contract for a new painter" → her sentence, word for word, naming Enterprise. No template changed, no card.
6. "Write a photo consent form I can send to a client" → her sentence.
7. "Just give me the main clauses for a subcontractor agreement" → her sentence; no clauses.
8. "Email TS_ client a simple painting contract" → her sentence; no send card.
9. "Email TS_ client that the signed contract is attached" → the normal send card.

A TS_ business on Enterprise:
10. "Rewrite our confidentiality agreement to add a non-solicitation clause" → she does it as today; the template's next version is saved.
11. "What contract templates do we have?" → she lists them by name.

No What's new card. Report: `memory/reports/lucy-contracts-by-package-report.md`.

## Rules

These two parts only — nothing from your own suggestion list. No notices or banners. Nothing under `app/employee/*`. No key, password or admin id in any reply. Save to GitHub and Publish are Josh's clicks.
