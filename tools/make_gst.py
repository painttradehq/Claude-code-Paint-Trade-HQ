#!/usr/bin/env python3
"""Round 72 — GST-inclusive pricing. Two prototypes:
1. quote-setup-gst.html  ← quote-setup-base.html (the Round 25 Quote set-up gear): Pricing tab gains the switch
   "My prices include GST"; the PDF preview's total line follows it.
2. estimate-builder-gst.html ← estimate-builder-add-library.html (Fix Round F part 2 base): a per-quote flag
   `est.tax.inclusive` (Quote details › GST section; `?gst=incl` for the demo) that changes the maths and the words:
   totals block, client view totals, Line details rate header, Add work footnote, the rail checklist line.
Every rep() asserts the exact count."""
from pathlib import Path
import re

ROOT = Path('/home/user/Claude-code-Paint-Trade-HQ')

# ============================================================ 1. Quote set-up gear
html = (ROOT / 'quote-setup-base.html').read_text()
def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:90])
    html = html.replace(a, b)

rep("tax_enabled_by_default:true, currency:'AUD',", "tax_enabled_by_default:true, tax_inclusive:false, currency:'AUD',")
rep("""    ${tog('tax-default', d.tax_enabled_by_default, 'Add tax to new quotes', 'Turn it off on a quote in the builder when needed.')}""",
    """    ${tog('tax-default', d.tax_enabled_by_default, 'Add tax to new quotes', 'Turn it off on a quote in the builder when needed.')}
    ${tog('tax-inclusive', d.tax_inclusive, 'My prices include GST', 'On: the rates in your Library and the prices you type already include GST, and quotes and invoices say “includes GST”. Off: GST is added under the subtotal. New quotes follow this; a single quote can be switched in its Quote details.')}""")
m = re.search(r"d\.tax_enabled_by_default = g\('tax-default'\)[^;]*;", html)
assert m, 'readPricingForm tax-default read not found'
html = html[:m.end()] + " d.tax_inclusive = g('tax-inclusive').classList.contains('on');" + html[m.end():]
rep("""    total: `<div class="total" style="background:${c}"><span>Total incl. ${esc(d.tax_label)} ${d.tax_rate}%</span><span>${d.currency === 'AUD' ? '$' : d.currency + ' '}10,428.00</span></div>`,""",
    """    total: `<div class="total" style="background:${c}"><span>${d.tax_inclusive ? `Total (includes ${esc(d.tax_label)} ${d.tax_rate}% · ${d.currency === 'AUD' ? '$' : d.currency + ' '}948.00)` : `Total incl. ${esc(d.tax_label)} ${d.tax_rate}%`}</span><span>${d.currency === 'AUD' ? '$' : d.currency + ' '}10,428.00</span></div>`,""")
(ROOT / 'quote-setup-gst.html').write_text(html)
print('wrote quote-setup-gst.html', len(html))

# ============================================================ 2. Estimate builder
html = (ROOT / 'estimate-builder-add-library.html').read_text()

CSS = """  /* ---- GST-inclusive (Round 72) ---- */
  .trows .tr.incl{ color:var(--text-muted); font-size:12px; }
  .trows .tr.incl b{ color:var(--text-secondary); font-weight:500; }
  .cdoc .totals .row.incl{ color:#8A8272; font-size:11.5px; }
"""
rep(".sheet.panel{ width:640px; background:var(--surface); }", ".sheet.panel{ width:640px; background:var(--surface); }\n" + CSS)

# maths
rep("""  const tax = est.tax?.enabled ? r2(base * (+est.tax.rate || 0) / 100) : 0;
  return { subtotal, optional, hours, discount, base, tax, total: r2(base + tax) };""",
    """  const rate = +est.tax?.rate || 0; const incl = !!est.tax?.inclusive;
  const tax = !est.tax?.enabled ? 0 : incl ? r2(base * rate / (100 + rate)) : r2(base * rate / 100);
  return { subtotal, optional, hours, discount, base, tax, inclusive: incl, total: incl ? base : r2(base + tax) };""")

# totals block (bottom of the paper)
rep("""      <div class="tr"><span>Subtotal</span><b data-testid="eb-subtotal">${money(t.subtotal)}</b></div>""",
    """      <div class="tr"><span>Subtotal${t.inclusive ? ` incl. ${esc(est.tax.label)}` : ''}</span><b data-testid="eb-subtotal">${money(t.subtotal)}</b></div>""")
rep("""      <div class="tr"><span>${esc(est.tax.label)} ${est.tax.rate}%</span><b data-testid="eb-gst">${money(t.tax)}</b></div>
      <div class="tr grand"><span>Total incl. ${esc(est.tax.label)}</span><b>${money(t.total)}</b></div>""",
    """      ${t.inclusive ? `<div class="tr grand"><span>Total</span><b>${money(t.total)}</b></div><div class="tr incl" data-testid="eb-gst-incl"><span>Includes ${esc(est.tax.label)} ${est.tax.rate}%</span><b data-testid="eb-gst">${money(t.tax)}</b></div>`
      : `<div class="tr"><span>${esc(est.tax.label)} ${est.tax.rate}%</span><b data-testid="eb-gst">${money(t.tax)}</b></div><div class="tr grand"><span>Total incl. ${esc(est.tax.label)}</span><b>${money(t.total)}</b></div>`}""")

# client view totals (Review & Send preview, public page)
rep("""<div class="row"><span>Subtotal</span><span class="v">${money(t.subtotal)}</span></div>""",
    """<div class="row"><span>Subtotal${t.inclusive ? ` incl. ${esc(est.tax.label)}` : ''}</span><span class="v">${money(t.subtotal)}</span></div>""")
rep("""${t.tax ? `<div class="row"><span>${esc(est.tax.label)} (${est.tax.rate}%)</span><span class="v">${money(t.tax)}</span></div>` : ''}<div class="grand"><span class="l">Total (AUD)</span><span class="v">${money(t.total)}</span></div>""",
    """${t.inclusive ? `<div class="grand"><span class="l">Total (AUD)</span><span class="v">${money(t.total)}</span></div><div class="row incl" data-testid="cdoc-gst-incl"><span>Includes ${esc(est.tax.label)} ${est.tax.rate}%</span><span class="v">${money(t.tax)}</span></div>` : `${t.tax ? `<div class="row"><span>${esc(est.tax.label)} (${est.tax.rate}%)</span><span class="v">${money(t.tax)}</span></div>` : ''}<div class="grand"><span class="l">Total (AUD)</span><span class="v">${money(t.total)}</span></div>`}""")

# rail checklist line
rep("""  out.push({ lvl:'ok', text:`${est.tax.label} ${est.tax.rate}% applied` });""",
    """  out.push({ lvl:'ok', text: est.tax.inclusive ? `Prices include ${est.tax.label} ${est.tax.rate}%` : `${est.tax.label} ${est.tax.rate}% applied` });""")

# Quote details drawer: GST section first
rep("""      <section class="qd-sec" data-testid="ed-presentation">""",
    """      <section class="qd-sec" data-testid="ed-gst">
        <div class="qd-t"><h3>${esc(est.tax.label)}</h3><label class="qd-sw"><input type="checkbox" id="edGstIncl" ${est.tax.inclusive ? 'checked' : ''} data-testid="ed-gst-toggle"><span class="tr"></span><span class="lb">${est.tax.inclusive ? `Prices include ${esc(est.tax.label)}` : `${esc(est.tax.label)} added at the bottom`}</span></label></div>
        <p class="qd-p" data-testid="ed-gst-text">${est.tax.inclusive ? `Every rate on this quote is read as including ${esc(est.tax.label)} ${est.tax.rate}%; the quote shows the total with “includes ${esc(est.tax.label)}”.` : `${esc(est.tax.label)} ${est.tax.rate}% is added under the subtotal; the rates are ex-${esc(est.tax.label)}.`} The rate and the default for new quotes live in Quote set-up › Pricing. Switching changes how the numbers are read, not the numbers.</p>
      </section>
      <section class="qd-sec" data-testid="ed-presentation">""")

# Line details rate header
rep("""<span class="r">$ / ${U}</span><span class="r">min / ${U}</span>""",
    """<span class="r">$ / ${U}${est.tax.inclusive ? ` incl. ${esc(est.tax.label)}` : ''}</span><span class="r">min / ${U}</span>""")

# Add work footnote (every occurrence)
FOOT = "Rates and minutes come from your Library. Click a name to change coats, primer, prep or product before adding."
n = html.count(FOOT); assert n >= 1
html = html.replace(FOOT, FOOT + "${est.tax.inclusive ? ` Your Library rates include ${esc(est.tax.label)}.` : ''}")

JS = r"""
// ============================================================ GST-inclusive (Round 72)
document.addEventListener('change', (e) => {
  if (e.target.id === 'edGstIncl'){ e.stopPropagation(); est.tax.inclusive = e.target.checked; changed(); renderDetails(); say(est.tax.inclusive ? `This quote's prices now include ${est.tax.label}` : `${est.tax.label} is added at the bottom again`); }
}, true);
if (params.get('gst') === 'incl'){ est.tax.inclusive = true; changed(); }
"""
anchor = "document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ if (panel) closePanel();"
rep(anchor, JS + anchor)
(ROOT / 'estimate-builder-gst.html').write_text(html)
print('wrote estimate-builder-gst.html', len(html))
