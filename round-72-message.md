Round 72 — GST-inclusive pricing. This message replaces the one-line "GST Inclusive Round" request: build Round 72 from the spec below, not from the suggestion text. If you have already changed files for it, keep only what matches this spec and list anything else you did in §8 of the report. The owner uploads two prototypes with "here" right after this message: `quote-setup-gst.html` (open with `?setup=pricing`) and `estimate-builder-gst.html` (`?gst=incl` opens the demo quote inclusive) → save them under memory/specs/round-72/. Open each at 1440 first, then 1024; where this text and the prototypes disagree, the prototypes win. Save this spec as memory/specs/round-72-gst.md. Report as "Round 72 done" at memory/reports/round-72-report.md and paste the summary, suite count and §8 in the chat as text. Nothing else from the suggestion list; do not publish; the owner says when.

Answers to the spec's open questions, decided by the owner: the setting is **off by default for every business**, including the owner's (he turns it on himself in Quote set-up › Pricing); the client's quote **keeps** the small "Includes GST 10% $x" line under the total; stand-alone invoices with no quote **follow the setting**.

---

# Round 72 — GST-inclusive pricing

**Why.** Quotes to households in Australia have to show a total that includes GST, and many painters think in GST-inclusive rates. Today every rate in the app is ex-GST and GST is added under the subtotal (`services/estimate_lines.py` compute, `estModel.ts` totals; invoices `services/invoice_lines.py`). Invoices already carry an unused `gst_inclusive` flag (`routes/invoices.py`, `routes/invoice_payments.py`), and the Round 69 Xero report flagged that no inclusive mode exists.

## 1. What changes

| Where | Change |
|---|---|
| **Quote set-up › Pricing › Tax & currency** (`QsPricingTab.tsx`) | New switch under "Add tax to new quotes": **My prices include GST** — sub text: "On: the rates in your Library and the prices you type already include GST, and quotes and invoices say "includes GST". Off: GST is added under the subtotal. New quotes follow this; a single quote can be switched in its Quote details." Stored as `estimate_defaults.prices_include_tax` (bool, default false). `data-testid="qs-tax-inclusive"`. The PDF preview's total line follows it (§2). |
| **New quotes** (`estimates_v2.py` create) | `tax.inclusive` = the setting at creation. Existing quotes are untouched (they have no `inclusive` key → exclusive, as today). |
| **Quote details drawer** (`QuoteDetails.tsx`) | A first section **GST** (the tax label): switch with the state word "Prices include GST" / "GST added at the bottom", then the text: "Every rate on this quote is read as including GST 10%; the quote shows the total with "includes GST"." or "GST 10% is added under the subtotal; the rates are ex-GST." followed by "The rate and the default for new quotes live in Quote set-up › Pricing. Switching changes how the numbers are read, not the numbers." Toggle sets `tax.inclusive`, toasts "This quote's prices now include GST" / "GST is added at the bottom again". `ed-gst`, `ed-gst-toggle`, `ed-gst-text`. |
| **Maths, one place each** | Quotes: `services/estimate_lines.compute` and `estModel.ts totals`: inclusive → `tax = r2(base × rate / (100 + rate))`, `total = base` (base = subtotal − discount, GST inside it); exclusive as today. Invoices: `services/invoice_lines.py` the same, keyed on the invoice's `gst_inclusive`; lines with the per-line GST box unticked stay outside the taxable base as today. |
| **Invoices** | Invoices raised from a quote (deposit, progress, final, stand-alone from the job) copy `gst_inclusive` from the quote's `tax.inclusive`. Invoices with no quote follow the setting. The invoice builder totals block, the public invoice page and the invoice PDF use the same words as the quote (§2). Credit notes follow their invoice. |
| **Xero** (`services/xero.py`) | Invoice push sends `LineAmountTypes: "Inclusive"` when the invoice is inclusive, `"Exclusive"` otherwise (today always Exclusive). Line unit amounts go across as stored. Covered in `test_xero.py`. |
| **Library** | Rates are read as entered; nothing is converted. One hint line under "Rate and time" in the item editor (`add-variant.tsx`) and the task editor: "These rates include GST." or "These rates are ex-GST." with "(Quote set-up › Pricing)". The Add work sheet footnote gains "Your Library rates include GST." when on. |
| **Line details** | Rate column header "$ / m² incl. GST" when on (the panel from Fix Round F part 2a). |
| **Send checklist** | "Prices include GST 10%" instead of "GST 10% applied" when on. |

## 2. Words on the totals (exact)

- **Builder totals block** — exclusive (as today): Subtotal · Discount · GST 10% · Total incl. GST. Inclusive: **Subtotal incl. GST** · Discount · **Total** (grand) · a muted line **Includes GST 10%  $x** (`eb-gst-incl`; `eb-gst` keeps carrying the GST amount).
- **Client view, public quote page, quote PDF** — exclusive as today. Inclusive: Subtotal incl. GST · Discount · **Total (AUD)** · the small line **Includes GST 10%  $x** under it (`cdoc-gst-incl`). The PDF's coloured total bar reads **Total (includes GST 10% · $x)** (the gear preview shows it).
- **Invoice builder, public invoice page, invoice PDF** — the same two layouts with the invoice's numbers; "Amount due" unchanged.

## 3. What it does not do

- No conversion of existing rates or existing quotes when the setting flips. The setting only says how the numbers are read from now on; the sub text says so.
- No per-line inclusive/exclusive mix on quotes. (Invoices keep their per-line "no GST" box.)
- Rounding stays as today: GST on the quote's base, not per line.
- `app/employee/*` untouched.

## 4. Verify (testing agent, 1440 then 1024, TS_ tenant)

1. Quote set-up › Pricing: the switch, off by default, with its text; turn on, Save; PDF tab › Live preview: the total bar reads "Total (includes GST 10% · $x)"; off again → "Total incl. GST 10%".
2. New TS_ quote with the setting on → Quote details shows "Prices include GST"; totals block "Subtotal incl. GST / Total / Includes GST 10%" with GST = base × 10/110 and Total = base; with the setting off → as today. An existing TS_ quote keeps its layout either way.
3. Quote details switch flips the words and the GST amount; the subtotal number never changes; the toasts.
4. Line details header "$ / m² incl. GST"; Add work footnote; send checklist line.
5. Review & Send client view, the public quote link and the PDF carry the inclusive words and the same numbers; the exclusive quote unchanged.
6. Accept the inclusive TS_ quote → the deposit invoice is `gst_inclusive`; its builder, public page and PDF show the inclusive words; a stand-alone invoice follows the setting; the Xero payload (mocked) carries `LineAmountTypes: Inclusive`.
7. Library item editor hint line follows the setting. 1024: no horizontal scroll; no console errors; `tsc` clean.

## 5. Tests

`backend/tests/test_r72_gst.py` on TS_: `compute` inclusive vs exclusive on the same lines (tax = base × 10/110, total = base; discount applied before GST); a new estimate copies `prices_include_tax` into `tax.inclusive`; the deposit invoice of an inclusive quote has `gst_inclusive: true` and `invoice_lines` returns the inclusive numbers; a stand-alone invoice follows the setting; the Xero invoice payload's `LineAmountTypes` for both; the public quote document's totals text. Suite green before and after.

## 6. What's new (Draft only — never publish)

**Title:** Prices that include GST
**Body:** If you price with GST included, tell Paint Trade HQ once in Quote set-up › Pricing. New quotes then read every rate as GST-inclusive and show the total with "includes GST", invoices and Xero follow, and any single quote can be switched in its Quote details. Nothing changes for quotes you have already sent.

---

Rules as always: TS_ rows only, torn down; the owner's tenant read-only; isolation per business; no notices or banners; every gear and panel opens on the right; `app/employee/*` untouched; do not change anything beyond this spec; if anything here contradicts the current code, stop and ask before building that part.
