# Three small parts: Lucy at normal effort · Lucy drafts contracts and consents only on the full package · a crew member's copy of a contract cannot be copied from — NOT SENT, waits for Josh's "send"

Josh, 28 Nov, in order:
1. "One more small thing goes with the next round: tell Lucy not to draft any contract in the app, as PTHQ wants to have a package to sell the draft contracts and consents as a package."
2. "Change it: Lucy only drafts contracts and others only in the full package."
3. "Leave the connector alone. One more thing: all the contracts that are sent to crews have to be copy protected — it's not able to copy and paste it."

**Read as:** the full package is **Enterprise** — the top one of the three, the one that already includes "HR contracts with e-sign". The connector for an outside Claude is not touched.

The round also carries the effort change recommended to him after Parts A–D (low → normal). He has not yet said "send"; this message goes on his word.

## What the code shows (app repo `f237013`, 28 Nov)

**Packages** (`services/plans.py`): Starter 59, Small business 179, Enterprise 249. Lucy comes with Small business; Contracts comes with Enterprise. `plans.has(owner, "contracts")` is true on Enterprise, on a trial, for an invited tester and for the platform owner. The Contracts page is kept to Enterprise by the plan gate on `/api/contracts…`; Lucy's `save_contract_template` calls the same code from inside, past that gate — a Small business owner can have Lucy write contract templates today. She can also write contract wording in a reply or an email.

**How a contract reaches a crew member** (`routes/contracts.py`):
- **On screen, in the crew app** — My contracts (`app/employee/contracts.tsx`): the wording is ordinary text, which a browser lets anyone select and copy. **That file is the crew chat's, not this chat's** — the note for it is `crew-chat-note-contract-copy-protect.md`.
- **As a PDF** — the signed copy, attached to the crew member's email once the owner has countersigned, and from the crew app's "Download my signed copy" (`GET /employee-contracts/{id}/my-pdf`). It is an ordinary text PDF: select all, copy. **This is the half in this message.**
- The email that says a document is waiting carries no wording — only "open the crew app".

**How the PDF is protected:** the crew's copy is made of pictures of the pages — no text in it to select. A "no copying" flag on a text PDF was the other way; some viewers ignore that flag, so it would not meet "not able to copy and paste". The owner's own copy stays as it is.

**What no app can stop:** a screenshot, retyping, or photographing the screen. This stops ordinary copy and paste.

No prototype: nothing new to look at — the PDF looks the same.

---

## The message to send

# Three small parts: Lucy at normal effort · Lucy drafts contracts and consents only on the full package · a crew member's copy of a contract cannot be copied from

**Josh's rules, first:** no test runs on his account — not signed in to, not read, not written; every database read carries the TS_ business's own filter; seed only through the dry-run server; TS_ rows only, removed after; nothing leaves.

From the admin chat. Three parts, one commit each. **Nothing under `app/employee/*` in any of them.**

## Part 1 — effort back to the model's normal

Your Part A report showed two slips at low effort that did not show at the default: with a photo she wrote "I can't open the photo myself" although it was in the conversation, and on the ten-item task she spoke before searching.

1. `AI_EFFORT`'s default in `services/ai_provider.py` becomes `high` — the default for `claude-sonnet-5-5`. The model does not change.
2. Run the photo check once more on the real API: she must describe what is in the photo, not say she cannot open it.
3. Run the cost set once: all sixteen pass. Report cold, warm, as billed and seconds beside the low-effort run.

No What's new card. Report: a short section at the end of `memory/reports/lucy-cost-report.md`.

## Part 2 — Lucy drafts contracts and consents only on the package that includes Contracts

Josh: "Lucy only drafts contracts and others only in the full package." And: "Leave the connector alone."

The full package is the one whose plan includes the `contracts` feature — Enterprise today. Use `plans.has(owner, "contracts")` as the one rule, so trials, invited testers and the platform owner behave as they do everywhere else.

**Lucy only.** The connector's REGISTRY, its tools and what an outside Claude can do through it are not changed.

1. **Lucy's list follows the package.** On a package without Contracts, `save_contract_template` and `get_contract_templates` are not offered to her model and cannot be a step of `do_steps` — refused in her usual words.
2. **Her instructions follow it.** Build this paragraph of `ADMIN_SYSTEM_PROMPT` from the package:
   - **With Contracts:** nothing new — she drafts and saves contract and consent wording as today.
   - **Without Contracts:** she does not write or rewrite the wording of a contract, an agreement or a consent form — not in a chat reply, not in an email or a text, not into a template, not as a file. That covers employment agreements, subcontractor agreements, confidentiality, codes of conduct, safety agreements, photo and social media consents, client contracts, and any other agreement or consent. Asked for one, she says exactly: "Drafting contracts and consent forms comes with the {package name} package. The owner can change the package in Settings › Billing." Nothing added — no partial draft, no outline, no "here are the clauses you'd want".
   - Either way, mentioning a contract in a message is fine ("the signed contract is attached"); writing its wording is what the rule is about.
3. **Her "what I can do" answer** does not change.

### Checks for Part 2

Pure / in-process:
1. A business with Contracts: both abilities on Lucy's list; saving a template's wording works as today.
2. A business without: neither on her list; a `do_steps` step naming either is refused; no template changes.
3. A trial, an invited tester and the platform owner: as 1.
4. The package changes from Small business to Enterprise: her next message has the abilities and the other paragraph.
5. The connector's tool list and its answers are the same before and after this part.

On screen with the testing agent, real model, **1440 then 1024** — a TS_ business on Small business:
6. "Draft an employment contract for a new painter" → her sentence, word for word, naming Enterprise. No template changed, no card.
7. "Write a photo consent form I can send to a client" → her sentence.
8. "Just give me the main clauses for a subcontractor agreement" → her sentence; no clauses.
9. "Email TS_ client a simple painting contract" → her sentence; no send card.
10. "Email TS_ client that the signed contract is attached" → the normal send card.

A TS_ business on Enterprise:
11. "Rewrite our confidentiality agreement to add a non-solicitation clause" → she does it as today; the template's next version is saved.
12. "What contract templates do we have?" → she lists them by name.

No What's new card. Report: `memory/reports/lucy-contracts-by-package-report.md`.

## Part 3 — a crew member's copy of a contract cannot be copied from

Josh: "All the contracts that are sent to crews have to be copy protected — it's not able to copy and paste it."

A crew member gets the wording as a PDF in two places (`routes/contracts.py`): the signed copy attached to their email after the countersign, and `GET /employee-contracts/{id}/my-pdf` behind the crew app's Download button. Both are text PDFs — select all, copy. (The wording on the crew app's own screen is the crew chat's round, not this one.)

1. **One function** — `locked_copy(pdf) -> bytes` beside the PDF code: the same pages as pictures, with no text in the file. Render each page (pypdfium2 is installed) sharp enough to read and print (about 150 dpi), keep the page size and the page count, and build the PDF from those pictures.
2. **Used in exactly two places:** the attachment on the crew member's signed-copy email, and what `my-pdf` returns.
3. **Not changed:** the owner's copy — the email to the owner, the file saved in the owner's storage, and the admin's `GET /employee-contracts/{id}/pdf` stay the text PDF. The stored record is not touched. The crew app's Download button is not touched — it receives the locked file.
4. **If the locked copy cannot be made, the crew member is not sent the text one.** The email goes without the attachment and the document's audit line says so; `my-pdf` answers with its usual error.

### Checks for Part 3

Pure:
1. `locked_copy` of a three-page contract: three pages, the same page size; extracting text from every page returns nothing; no page is blank.
2. A ten-page contract: say what the file weighs; it must be well inside the email limit.

In-process, TS_ business, sends dry:
3. After the countersign: the crew member's attachment has no text to extract; the owner's attachment has the wording.
4. `my-pdf` as that crew member: no text to extract. The admin's `/pdf`: the wording. Another crew member: refused, as today.
5. `locked_copy` made to fail: the crew email goes without the attachment, the audit line says so, and the text PDF is not sent.

Report: `memory/reports/contract-crew-copy-report.md`, with one page of the locked copy as a picture beside the same page of the owner's copy. What's new **Draft** (never publish) — one line in draft #47: "The signed copy a crew member receives is copy-protected — its wording can't be selected or copied."

## Rules

These three parts only — nothing from your own suggestion list. No notices or banners. **Nothing under `app/employee/*`.** No key, password or admin id in any reply. Save to GitHub and Publish are Josh's clicks.
