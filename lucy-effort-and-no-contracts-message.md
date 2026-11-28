# Lucy at normal effort · Lucy does not draft contracts or consents — NOT SENT, waits for Josh's "send"

Josh, 28 Nov: "One more small thing goes with the next round: tell Lucy not to draft any contract in the app, as PTHQ wants to have a package to sell the draft contracts and consents as a package."

The next round is the effort change recommended to him after Parts A–D (low → normal, on two slips seen at low). He has not yet said "send" for it; this message carries both and goes on his word.

## What the code shows (app repo `3ece9f7`)

- **How Lucy can draft a contract in the app today:** `save_contract_template` (`services/connector_tools.py`) — "Save the wording of a crew document template as its next version". It writes the Contracts page's templates: employment agreement, confidentiality, code of conduct, safety agreement, **social media & photo consent**, other. It is in the connector's REGISTRY, so Lucy has it and so does an outside Claude connected to the app.
- She can also simply write contract wording in a chat reply or an email.
- `get_contract_templates` only reads (name, category, a short preview). Issuing a document has no ability — it stays in the app.
- Nothing in her instructions mentions contracts.

**Written to the letter of his ask — Lucy only.** Two edges left for his word, not in the message:
1. the outside-Claude connector keeps `save_contract_template`;
2. the terms on a quote (`update_quote` can set a quote's `terms`).

No prototype: an instruction and one ability taken off her list.

---

## The message to send

# Two small parts: Lucy at normal effort · Lucy does not draft contracts or consents

**Josh's rules, first:** no test runs on his account — not signed in to, not read, not written; every database read carries the TS_ business's own filter; seed only through the dry-run server; TS_ rows only, removed after; nothing leaves.

From the admin chat. Two parts, one commit each.

## Part 1 — effort back to the model's normal

Your Part A report showed two slips at low effort that did not show at the default: with a photo she wrote "I can't open the photo myself" although it was in the conversation, and on the ten-item task she spoke before searching.

1. `AI_EFFORT`'s default in `services/ai_provider.py` becomes `high` — the default for `claude-sonnet-5-5`. The model does not change.
2. Run the photo check once more on the real API: she must describe what is in the photo, not say she cannot open it.
3. Run the cost set once: all sixteen pass. Report cold, warm, as billed and seconds beside the low-effort run.

No What's new card. Report: a short section at the end of `memory/reports/lucy-cost-report.md`.

## Part 2 — Lucy does not draft contracts or consents

Josh: "Tell Lucy not to draft any contract in the app — PTHQ wants to have a package to sell the draft contracts and consents."

1. **The ability leaves her list.** `save_contract_template` is no longer one of Lucy's tools — not offered to the model, refused as a step of `do_steps` in her usual words. The connector's REGISTRY is not changed in this part. `get_contract_templates` stays: she may say what templates the business has.
2. **Her instructions** — add to `ADMIN_SYSTEM_PROMPT`, in her own style:
   - She does not write or rewrite the wording of a contract, an agreement or a consent form — not in a chat reply, not in an email or a text, not into a template, not as a file. That covers employment agreements, subcontractor agreements, confidentiality, codes of conduct, safety agreements, photo and social media consents, client contracts, and any other agreement or consent.
   - Asked for one, she says exactly: "I don't draft contracts or consent forms. Your templates are on the Contracts page — you can edit and issue them there." Nothing added, no partial draft, no outline, no "here are the clauses you'd want".
   - What she still does: lists the business's templates by name, says where they are, and answers questions about who has a document expiring or unsigned from what she can read.
   - Mentioning a contract in a message is fine ("the signed contract is attached"); writing its wording is not.
3. **Her "what I can do" answer** does not change.

### Checks for Part 2

Pure / in-process:
1. Lucy's tool list for an admin with everything on has no `save_contract_template`; the connector's REGISTRY still has it.
2. `do_steps` with a `save_contract_template` step is refused; nothing is saved.

On screen with the testing agent, a TS_ admin, **1440 then 1024**, real model:
3. "Draft an employment contract for a new painter" → her sentence, word for word. No template changed, no card.
4. "Write a photo consent form I can send to a client" → her sentence.
5. "Rewrite our confidentiality agreement to add a non-compete clause" → her sentence; the template's version is unchanged.
6. "Just give me the main clauses for a subcontractor agreement" → her sentence; no clauses.
7. "Email TS_ client a simple painting contract" → her sentence; no send card.
8. "What contract templates do we have?" → she lists them by name and points to the Contracts page.
9. "Email TS_ client that the signed contract is attached" → the normal send card.

No What's new card. Report: `memory/reports/lucy-no-contracts-report.md`.

## Rules

These two parts only — nothing from your own suggestion list. No notices or banners. Nothing under `app/employee/*`. No key, password or admin id in any reply. Save to GitHub and Publish are Josh's clicks.
