# Round 99 — The quote's terms come from Quote setup › Terms (11 November) — CODE WRITTEN HERE on the app repo's branch `claude/quote-terms`; waits for Emergent credit to merge, verify and publish

Josh, 11 Nov: *"the terms default in the quote is incorrect — can you make it changeable?"* (his screenshot of Review & Send on EST-0029 showed the eight built-in placeholder terms: "2 years", "$20M public liability", …). Emergent was out of credit, so the code was written in this chat and pushed to the app repository as the branch **`claude/quote-terms`** (one commit on top of `main` `5e16d97`). Backend only; the frontend is untouched.

## 1. What was wrong

Settings › Quote setup › **Terms** (`components/estimates/QsTermsTab.tsx`) saves named templates to `contract_terms_templates` with one marked default — but nothing read them when a quote was shown, emailed or printed. `services/pdf.py:507 parse_terms` took the quote's own `contract_terms` (no screen sets it) or the legacy `estimate_defaults.default_contract_terms` blob, and otherwise printed `_default_terms()` — eight placeholder terms the same for every business. The public page (`estimate_send.py:383`), the builder's Client view (`estimates_v2.py:59`) and the two PDFs (`routes/pdf.py:65`) all went the same way; only the Quote setup *preview* knew a `terms_template_id`.

## 2. What the branch does

- **`backend/services/quote_terms.py`** (new): `default_terms_text(admin_id, estimate_defaults?, business_profile?)` = the default template's body → the legacy blob → `""`; `terms_text_for(admin_id, estimate, fallback?)` = the quote's own `contract_terms` → the template the quote names (`terms_template_id`, same tenant only) → the fallback / the default. Both take an optional `db` for tests.
- **`models/estimate.py`**: `terms_template_id: str | None` on the Estimate — the per-quote choice, saved by `PUT /estimates/{id}` like any field (the §11.1 guard does not touch it); no screen sets it yet (§4).
- **The three profile builders resolve through it, per quote:** `routes/pdf.py::_business_profile_for(admin_id, estimate=None)` (the admin and public estimate PDFs pass the quote; the Quote setup preview's `terms_template_id` override still applies after it), `routes/estimate_send.py::build_business_profile(owner_admin_id, estimate=None)` (the public page passes the quote; the emailed PDF at `:101` too), `routes/estimates_v2.py` (the builder's Client view passes the quote). `parse_terms` is unchanged: when everything is empty the built-in eight still print, so a business that has written nothing sees what it saw.
- **`tests/test_r99_quote_terms.py`**: eight unit checks on the order (default beats blob; blob when no default; passed-in defaults used without a read; nothing → ""; the quote's own text wins; a named template beats the default; an unknown or another tenant's id falls to the default; a given fallback is used). **8/8 here** (`pytest --noconftest`, no Mongo).

## 3. For Emergent, when there is credit (one short message; Josh's "send")

1. `git fetch origin && git merge origin/claude/quote-terms` (one commit on top of `5e16d97`; no conflicts expected — four small edits and two new files). If the tree has moved on, merge, do not rewrite.
2. Suite before and after (the new file runs without the harness); `test_r99_quote_terms.py` green.
3. Verify on the preview, TS_ Alpha: write a template in Quote setup › Terms, set it default → the builder's Client view, the public page, the PDF and the emailed PDF show its wording numbered as typed; a second template named on a quote by setting `terms_template_id` through `PUT /estimates/{id}` → that quote shows it, others keep the default; a TS_ tenant with no template and no blob → the built-in eight as today; another tenant's template id on a quote → ignored.
4. Report `memory/reports/round99-quote-terms-report.md`, the commit hash, Save to GitHub (Josh), **Publish** (Josh).

## 4. Follow-up (frontend, a small round of its own)

A **Terms** picker in the builder's Quote details: a select of the business's templates with the default pre-chosen, writing `terms_template_id`; the Client view updates at once. Until then the choice per quote is only through the API (or the connector's `update_quote`, which passes the field through), and every quote prints the default template — which is what Josh asked for first.

**Widened by Josh on 12 Nov (parking lot, `admin-remaining.md`):** not just a picker — a *Terms & conditions* card in the builder itself, under "Paint for this quote", framed as the Client view prints it and **editable per quote**; edits save to the quote's own `contract_terms` (already first in this module's order), with *Reset to template* and the picker in the card header. Prototype first.

## 5. What Josh does now

Settings › Quote setup › **Terms**: write the wording as numbered lines (`1. Title — text`), one template, **Set default**. Nothing changes on the live app until the branch is merged and published; until then the placeholders still print.
