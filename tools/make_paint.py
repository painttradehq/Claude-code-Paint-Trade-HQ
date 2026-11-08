#!/usr/bin/env python3
"""Round 88 — Builder: areas move up and down, one product once, paint litres from coverage × m² × coats
(auto with a by-hand override), a Paint card under the totals with tins per product and a per-quote
"In my rates / Charge on top" choice. Patches estimate-builder-fix-e.html (the Round 76 builder) as text."""
import json
from pathlib import Path
SRC = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-fix-e.html')
OUT = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-paint.html')
html = SRC.read_text()
def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:100])
    html = html.replace(a, b)

# ---- data: products carry coverage (m²/L) and sizes; one more brand so "one product once" shows across brands ----
i = html.index('const D = '); j = html.index('\n', i)
D = json.loads(html[i + len('const D = '):j].rstrip(';'))
SIZES = {
    'p_dulux_ww':   (16, [('1L', 1, 34), ('4L', 4, 92), ('10L', 10, 189), ('15L', 15, 265)]),
    'p_dulux_ceil': (14, [('4L', 4, 68), ('10L', 10, 142), ('15L', 15, 199)]),
    'p_dulux_aqua': (16, [('500mL', 0.5, 32), ('1L', 1, 48), ('4L', 4, 98), ('10L', 10, 215)]),
}
for p in D['PRODUCTS']:
    cov, sizes = SIZES.get(p['id'], (14, [('4L', 4, round(p['unit_cost'] * 0.45)), ('10L', 10, p['unit_cost'])]))
    p['coverage'] = cov
    p['sizes'] = [{'label': l, 'litres': v, 'price': c} for l, v, c in sizes]
    big = p['sizes'][-1]; p['pack'] = big['label']; p['unit_cost'] = big['price']
D['PRODUCTS'].append({'id': 'p_taub_endure', 'brand': 'Taubmans', 'name': 'Endure Interior Low Sheen', 'pack': '10L', 'unit_cost': 176, 'material': 'Plasterboard', 'coverage': 14,
                      'sizes': [{'label': '1L', 'litres': 1, 'price': 31}, {'label': '4L', 'litres': 4, 'price': 86}, {'label': '10L', 'litres': 10, 'price': 176}]})
D['ESTIMATE']['paint_charge'] = False
D['ESTIMATE']['lines'] = [l for l in D['ESTIMATE']['lines'] if not (l.get('category') == 'material' and l.get('product'))]
html = html[:i] + 'const D = ' + json.dumps(D, ensure_ascii=False) + ';' + html[j:]

# ---- CSS ----
rep("  .agroup .anum{ position:absolute; left:-52px; top:2px; font-family:var(--font-display); font-weight:600; font-size:22px; color:var(--border-strong); letter-spacing:-0.02em; width:36px; text-align:right; }",
    "  .agroup .anum{ position:absolute; left:-52px; top:-6px; font-family:var(--font-display); font-weight:600; font-size:22px; color:var(--border-strong); letter-spacing:-0.02em; width:36px; text-align:right; display:flex; flex-direction:column; align-items:flex-end; }\n"
    "  .agroup .anum .mv{ border:none; background:none; padding:0; width:22px; height:14px; line-height:14px; font-size:10px; color:var(--text-muted); cursor:pointer; visibility:hidden; border-radius:4px; }\n"
    "  .agroup:hover .anum .mv, .agroup .anum:focus-within .mv{ visibility:visible; }\n"
    "  .agroup .anum .mv:hover{ color:var(--accent); background:var(--accent-bg); }\n"
    "  .agroup .anum .mv:disabled{ opacity:.25; cursor:default; background:none; color:var(--text-muted); }\n"
    "  .agroup .anum .num{ line-height:1.1; }\n"
    "  .agroup.moved{ animation:amoved .6s ease; }\n  @keyframes amoved{ from{ background:var(--accent-bg); } to{ background:transparent; } }\n"
    "  .paintrow{ display:flex; align-items:center; justify-content:space-between; gap:10px; }\n"
    "  .paintrow .pl b{ font-family:var(--font-mono); font-size:15px; }\n  .paintrow .pl .s{ display:block; font-size:12px; color:var(--text-muted); margin-top:2px; }\n"
    "  .ptable{ width:100%; border-collapse:collapse; font-size:13px; margin-top:8px; }\n  .ptable th{ text-align:left; font-size:10.5px; text-transform:uppercase; letter-spacing:.08em; color:var(--text-muted); font-weight:800; padding:4px 0; border-bottom:1px solid var(--border); }\n"
    "  .ptable td{ padding:7px 0; border-bottom:1px solid var(--border); vertical-align:top; }\n  .ptable .r, .ptable th.r{ text-align:right; font-family:var(--font-mono); }\n  .ptable .sub{ display:block; font-size:11.5px; color:var(--text-muted); }\n"
    "  .ptable td:nth-child(4), .ptable th:nth-child(4){ padding-left:18px; }\n  .ptable .tin{ display:inline-flex; align-items:center; gap:4px; margin-right:8px; font-family:var(--font-mono); font-size:12.5px; }\n  .ptable .tin input{ width:36px; border:1px solid var(--border-strong); border-radius:5px; font:inherit; font-size:12.5px; padding:2px 4px; text-align:right; }\n"
    "  .paintcard .lnk{ border:none; background:none; color:var(--accent); font:inherit; font-size:12px; cursor:pointer; padding:0; }\n  .paintcard .pempty{ font-size:13px; color:var(--text-muted); padding:6px 0 2px; }")

# ---- area number: arrows above and below, and the ⋯ menu gets Move up / Move down ----
rep("""<span class="anum">${String(i + 1).padStart(2, '0')}</span>""",
    """<span class="anum" data-testid="area-num-${a.id}"><button class="mv" data-amove="up" data-id="${a.id}" aria-label="Move ${esc(a.name)} up" ${i === 0 ? 'disabled' : ''}>▲</button><span class="num">${String(i + 1).padStart(2, '0')}</span><button class="mv" data-amove="down" data-id="${a.id}" aria-label="Move ${esc(a.name)} down" ${i === est.areas.length - 1 ? 'disabled' : ''}>▼</button></span>""")
rep("""openPop(x, `<button data-aact="rename" data-id="${id}">${svg('edit')}Rename</button>""",
    """openPop(x, `<button data-aact="up" data-id="${id}" ${est.areas[0].id === id ? 'disabled' : ''}>${svg('chevup')}Move up</button><button data-aact="down" data-id="${id}" ${est.areas[est.areas.length - 1].id === id ? 'disabled' : ''}>${svg('chevdown')}Move down</button><button data-aact="rename" data-id="${id}">${svg('edit')}Rename</button>""")
rep("const act = x.dataset.aact;", "const act = x.dataset.aact; if (act === 'up' || act === 'down'){ moveArea(a.id, act); return; }")

# ---- helpers after PROD ----
rep("const PROD = Object.fromEntries(D.PRODUCTS.map(x => [x.id, x]));",
    """const PROD = Object.fromEntries(D.PRODUCTS.map(x => [x.id, x]));
// ---- Round 88: areas in order, paint from coverage ----
function moveArea(id, dir){ const i = est.areas.findIndex(a => a.id === id); const j = dir === 'up' ? i - 1 : i + 1; if (i < 0 || j < 0 || j >= est.areas.length) return; [est.areas[i], est.areas[j]] = [est.areas[j], est.areas[i]]; est.areas.forEach((a, k) => { a.order = k; }); renderPaper(); const el = document.querySelector(`.agroup[data-area="${id}"]`); if (el){ el.classList.add('moved'); el.scrollIntoView({ block: 'nearest' }); } }
function paintArea(li){ if (li.kind !== 'library' || !li.product || !PROD[li.product] || li.unit !== 'm2') return null; return lineQty(li, est); }
function paintAuto(li){ const p = PROD[li.product]; const m2 = paintArea(li); if (m2 == null || !p || !p.coverage || !m2) return null; const coats = li.coats || 2; return { m2, coats, coverage: p.coverage, litres: Math.round((m2 * coats / p.coverage) * 10) / 10 }; }
function paintFor(li){ if (li.kind !== 'library' || !li.product || !PROD[li.product]) return null; const auto = paintAuto(li); if (li.paint && li.paint.mode === 'manual') return { ...(auto || { m2: paintArea(li), coats: li.coats || 2, coverage: PROD[li.product].coverage }), litres: Math.round((+li.paint.litres || 0) * 10) / 10, mode: 'manual', note: li.paint.note || '' }; return auto ? { ...auto, mode: 'auto' } : null; }
function fitTins(need, sizes){ const S = [...(sizes || [])].sort((a, b) => a.litres - b.litres); if (!S.length || !(need > 0)) return []; const cost = (c) => c.reduce((s, x) => s + x.count * x.price, 0); const cnt = (c) => c.reduce((s, x) => s + x.count, 0);
  let rem = need; const A = []; for (let k = S.length - 1; k >= 0; k--){ const s = S[k]; const n = Math.floor(rem / s.litres + 1e-9); if (n > 0){ A.push({ ...s, count: n }); rem = Math.round((rem - n * s.litres) * 1000) / 1000; } }
  if (rem > 0.001){ const s = S.find(x => x.litres >= rem) || S[S.length - 1]; const e = A.find(x => x.label === s.label); if (e) e.count++; else A.push({ ...s, count: 1 }); }
  const opts = [A, ...S.map(s => [{ ...s, count: Math.ceil(need / s.litres - 1e-9) }])]; opts.sort((x, y) => cost(x) - cost(y) || cnt(x) - cnt(y)); return opts[0].sort((x, y) => y.litres - x.litres); }
const tinsText = (tins) => tins.length ? tins.map(t => `${t.count} × ${t.label}`).join(' + ') : '—';
const tinsCost = (tins) => Math.round(tins.reduce((s, t) => s + t.count * t.price, 0) * 100) / 100;
function paintSummary(est, selected){ const sel = selected || new Set(est.accepted_options || []); const by = new Map();
  est.lines.filter(li => !li.optional || sel.has(li.id)).forEach(li => { const pf = paintFor(li); if (!pf || !pf.litres) return; const p = PROD[li.product]; if (!by.has(p.id)) by.set(p.id, { p, litres: 0, lines: 0, colours: new Set(), manual: 0 }); const r = by.get(p.id); r.litres = Math.round((r.litres + pf.litres) * 10) / 10; r.lines++; if (pf.mode === 'manual') r.manual++; if (li.colour) r.colours.add(li.colour); });
  return [...by.values()].map(r => { const over = (est.paint_tins || {})[r.p.id]; const tins = over ? r.p.sizes.map(s => ({ ...s, count: +(over[s.label] || 0) })).filter(t => t.count > 0) : fitTins(r.litres, r.p.sizes); return { ...r, tins, tinLitres: Math.round(tins.reduce((s, t) => s + t.count * t.litres, 0) * 10) / 10, cost: tinsCost(tins), byHand: !!over }; }); }
const paintTotal = (est, sel) => Math.round(paintSummary(est, sel).reduce((s, r) => s + r.cost, 0) * 100) / 100;
function paintBlock(li){ if (li.kind !== 'library') return ''; const p = li.product && PROD[li.product]; if (!p) return `<div class="psec" data-testid="panel-paint"><h5>Paint for this line</h5><div class="hint">Pick a product above and the paint works itself out from the area and the coats.</div></div>`;
  const pf = paintFor(li); const manual = pf ? pf.mode === 'manual' : false; const auto = paintAuto(li);
  const why = !auto ? (li.unit !== 'm2' ? `Priced per ${UNIT[li.unit]}, so there is no area to work from — set the litres by hand.` : `Measure ${li.area_id ? areaById(li.area_id).name : 'the area'} and the litres work themselves out.`) : '';
  return `<div class="psec" data-testid="panel-paint"><h5>Paint for this line</h5>
    <div class="paintrow"><div class="pl"><b data-testid="paint-litres">${pf ? pf.litres : '—'} L</b><span class="s">${pf && !manual ? `${qfmt(pf.m2)} m² × ${pf.coats} coat${pf.coats === 1 ? '' : 's'} ÷ ${pf.coverage} m²/L (the product's coverage)` : manual ? 'set by hand' + (pf.note ? ' · ' + esc(pf.note) : '') : why}</span></div>
      <div class="seg"><button class="${!manual ? 'on' : ''}" data-paintmode="auto" ${!auto ? 'disabled' : ''}>Auto</button><button class="${manual ? 'on' : ''}" data-paintmode="manual">By hand</button></div></div>
    ${manual ? `<div class="fr" style="margin-top:8px"><div class="fld"><label>Litres</label><input type="number" id="pl_paintl" step="0.1" min="0" value="${pf.litres || ''}" placeholder="0"></div><div class="fld"><label>Why (for you and the crew)</label><input type="text" id="pl_paintnote" value="${esc(pf.note || '')}" placeholder="e.g. porous render, an extra coat on the feature wall"></div></div>` : ''}
    ${li.primer ? `<div class="hint" style="margin-top:6px">The primer coat is not counted here — it is a different product. Add a primer line, or note it in the Paint card.</div>` : ''}
    <div class="hint" style="margin-top:6px">Tins and cost are worked out per product across the whole quote, in the Paint card under the totals.</div></div>`; }
function renderPaint(){ const box = $('#paintcard'); if (!box) return; const rows = paintSummary(est); const charge = !!est.paint_charge; const litres = Math.round(rows.reduce((s, r) => s + r.litres, 0) * 10) / 10; const cost = paintTotal(est);
  const tinCell = (r) => paintEdit === r.p.id ? `<div>${r.p.sizes.map(s => `<label class="tin"><input type="number" min="0" data-tin="${r.p.id}" data-size="${s.label}" value="${(r.tins.find(t => t.label === s.label) || {}).count || 0}">× ${s.label}</label>`).join('')}<div style="margin-top:4px"><button class="lnk" data-tindone="${r.p.id}">Done</button> · <button class="lnk" data-tinauto="${r.p.id}">Back to auto</button></div></div>` : `<span data-testid="paint-tins-${r.p.id}">${tinsText(r.tins)}</span>${r.byHand ? '<span class="sub">set by hand</span>' : ''}<span class="sub">${r.tinLitres} L bought · <button class="lnk" data-tinedit="${r.p.id}">edit tins</button></span>`;
  box.innerHTML = `<div class="thead"><span class="anum">${svg('layers')}</span><div><div class="tt">Paint for this quote</div><div class="ts">${rows.length ? `${rows.length} product${rows.length === 1 ? '' : 's'} · ${litres} L needed · ${money(cost)} at your prices` : 'Builds itself from the products and coats on your lines'}</div></div>
      <div class="seg" data-testid="paint-charge"><button class="${!charge ? 'on' : ''}" data-paintcharge="0" title="Your m² rates already cover the paint; this list is for ordering">In my rates</button><button class="${charge ? 'on' : ''}" data-paintcharge="1" title="Add the paint at your prices on top of the rates">Charge on top</button></div></div>
    ${rows.length ? `<table class="ptable" data-testid="paint-table"><thead><tr><th style="width:34%">Product</th><th style="width:10%">Lines</th><th class="r" style="width:12%">Litres</th><th style="width:30%">Tins</th><th class="r">Cost</th></tr></thead><tbody>${rows.map(r => `<tr data-testid="paint-row-${r.p.id}"><td><b>${esc(r.p.brand)} ${esc(r.p.name)}</b><span class="sub">${r.p.coverage} m²/L${r.colours.size ? ' · ' + esc([...r.colours].join(', ')) : ''}${r.manual ? ` · ${r.manual} line${r.manual === 1 ? '' : 's'} by hand` : ''}</span></td><td>${r.lines}</td><td class="r">${r.litres} L</td><td>${tinCell(r)}</td><td class="r">${money(r.cost)}</td></tr>`).join('')}</tbody></table>` : `<div class="pempty">Pick a product on a line and measure its area — the litres, tins and cost appear here.</div>`}
    <div class="hint" style="margin-top:8px">${charge ? `<b>Charge on top:</b> a Paint row of ${money(cost)} joins the totals and the client sees one Paint line, no litres.` : `<b>In my rates:</b> nothing is added to the quote; this is your ordering list.`} The default for new quotes is set in Quote setup › Pricing.</div>`; }
let paintEdit = null;"""
)

# ---- line panel: one product once, with coverage and sizes; the paint block after colour ----
rep("const all = D.PRODUCTS.filter(p => !q || `${p.brand} ${p.name} ${p.pack} ${p.material}`.toLowerCase().includes(q));",
    "const all = D.PRODUCTS.filter(p => !q || `${p.brand} ${p.name} ${p.material} ${(p.sizes || []).map(s => s.label).join(' ')}`.toLowerCase().includes(q));")
rep("""<div class="s">${esc(p.pack)} · ${money(p.unit_cost)} · ${esc(p.material)}</div></div></div>`;""",
    """<div class="s">${p.coverage ? p.coverage + ' m²/L · ' : ''}${(p.sizes || []).map(s => s.label).join(' · ')}${(p.sizes || []).length ? ' · from ' + money(Math.min(...p.sizes.map(s => s.price))) : ''} · ${esc(p.material)}</div></div></div>`;""")
rep("""everywhere</button></div></div></div>` : ''}</div>`;""", """everywhere</button></div></div></div>` : ''}${paintBlock(li)}</div>`;""")
rep("if (li.kind === 'library'){ if ($('#pl_colour')) li.colour = $('#pl_colour').value.trim();",
    "if (li.kind === 'library'){ if ($('#pl_colour')) li.colour = $('#pl_colour').value.trim(); if ($('#pl_paintl')) li.paint = { mode: 'manual', litres: +$('#pl_paintl').value || 0, note: ($('#pl_paintnote') ? $('#pl_paintnote').value : '').trim() };")
rep("if (t.matches('#pl_qty, #pl_rate, #pl_sub, #pl_markup, #pl_override, #pl_unit, #pl_hours, #pl_area, #pl_opt, #pl_colour, [data-srate], [data-smins]') && panel){ readPanel(); refreshPanelFoot(); return; }",
    "if (t.matches('#pl_qty, #pl_rate, #pl_sub, #pl_markup, #pl_override, #pl_unit, #pl_hours, #pl_area, #pl_opt, #pl_colour, #pl_paintl, #pl_paintnote, [data-srate], [data-smins]') && panel){ readPanel(); refreshPanelFoot(); if (t.id === 'pl_paintl'){ const b = $('#panel [data-testid=\"paint-litres\"]'); if (b) b.textContent = `${Math.round((+t.value || 0) * 10) / 10} L`; } return; }\n  if (t.matches('[data-tin]')){ est.paint_tins = est.paint_tins || {}; const o = est.paint_tins[t.dataset.tin] || (est.paint_tins[t.dataset.tin] = {}); o[t.dataset.size] = +t.value || 0; renderTotals(); return; }")
rep("  if ((x = c('[data-plprod]'))){ readPanel(); panel.line.product = x.dataset.plprod || null; renderPanel(); return; }",
    """  if ((x = c('[data-plprod]'))){ readPanel(); panel.line.product = x.dataset.plprod || null; renderPanel(); return; }
  if ((x = c('[data-paintmode]'))){ readPanel(); const li = panel.line; if (x.dataset.paintmode === 'auto') delete li.paint; else { const pf = paintFor(li); li.paint = { mode: 'manual', litres: pf ? pf.litres : 0, note: '' }; } renderPanel(); const f = $('#pl_paintl'); if (f){ f.focus(); f.select(); } return; }
  if ((x = c('[data-amove]'))){ if (x.disabled) return; moveArea(x.dataset.id, x.dataset.amove); return; }
  if ((x = c('[data-paintcharge]'))){ est.paint_charge = x.dataset.paintcharge === '1'; renderTotals(); return; }
  if ((x = c('[data-tinedit]'))){ paintEdit = x.dataset.tinedit; const rows = paintSummary(est); const r = rows.find(y => y.p.id === paintEdit); est.paint_tins = est.paint_tins || {}; if (r && !est.paint_tins[paintEdit]){ est.paint_tins[paintEdit] = Object.fromEntries(r.tins.map(t => [t.label, t.count])); } renderTotals(); return; }
  if ((x = c('[data-tindone]'))){ paintEdit = null; renderTotals(); return; }
  if ((x = c('[data-tinauto]'))){ if (est.paint_tins) delete est.paint_tins[x.dataset.tinauto]; paintEdit = null; renderTotals(); return; }""")

# ---- the line summary names the litres after the colour ----
rep("if (li.colour) bits.push(esc(li.colour)); } const h = lineHours(li, est); if (h) bits.push(hfmt(h)); }",
    "if (li.colour) bits.push(esc(li.colour)); const pf = paintFor(li); if (pf && pf.litres) bits.push(`${pf.litres} L`); } const h = lineHours(li, est); if (h) bits.push(hfmt(h)); }")

# ---- totals: the Paint card under the totals; a Paint row when charged on top ----
rep("""  h += `<section class="totals" id="totals" data-testid="eb-totals"></section>`;""",
    """  h += `<section class="totals" id="totals" data-testid="eb-totals"></section><section class="totals paintcard" id="paintcard" data-testid="eb-paint"></section>`;""")
rep("const subtotal = r2(live.reduce((s, li) => s + lineTotal(li, est), 0));",
    "const subtotal = r2(live.reduce((s, li) => s + lineTotal(li, est), 0) + (est.paint_charge ? paintTotal(est, sel) : 0));")
rep("""      ${dEl}${dForm}
      <div class="tr"><span>${esc(est.tax.label)} ${est.tax.rate}%</span><b data-testid="eb-gst">${money(t.tax)}</b></div>
      <div class="tr grand"><span>Total incl. ${esc(est.tax.label)}</span><b>${money(t.total)}</b></div>
    </div>`;
}""",
    """      ${est.paint_charge ? `<div class="tr" data-testid="eb-paint-row"><span>Paint · ${paintSummary(est).length} product${paintSummary(est).length === 1 ? '' : 's'} at your prices (in the subtotal)</span><b>${money(paintTotal(est))}</b></div>` : ''}${dEl}${dForm}
      <div class="tr"><span>${esc(est.tax.label)} ${est.tax.rate}%</span><b data-testid="eb-gst">${money(t.tax)}</b></div>
      <div class="tr grand"><span>Total incl. ${esc(est.tax.label)}</span><b>${money(t.total)}</b></div>
    </div>`;
  renderPaint();
}""")

# ---- client document: one Paint line when charged on top (never litres) ----
rep("""<td>${esc([...r.surfaces].join(', '))}</td><td>${esc([...r.where].join(', '))}</td></tr>`).join('')}</tbody></table></div>`;""",
    """<td>${esc([...r.surfaces].join(', '))}</td><td>${esc([...r.where].join(', '))}</td></tr>`).join('')}</tbody></table>${est.paint_charge && paintTotal(est, sel) ? `<div data-testid="doc-paint-line" style="margin-top:8px;font-size:13px;display:flex;justify-content:space-between"><span>Paint supplied by us (${paintSummary(est, sel).map(r => esc(r.p.brand + ' ' + r.p.name)).join(', ')})</span><b>${money(paintTotal(est, sel))}</b></div>` : ''}</div>`;""")

# ---- two icons for the menu ----
rep('const ICONS = {"search":', 'const ICONS = {"chevup": "<path d=\\"M6 15l6-6 6 6\\"/>", "chevdown": "<path d=\\"M6 9l6 6 6-6\\"/>", "search":')


# ---- live typing: the litres label and the tin counts follow the input event ----
rep("document.addEventListener('input', (e) => { const t = e.target; if (t.id === 'pl_prodq' && panel){",
    "document.addEventListener('input', (e) => { const t = e.target; if (t.id === 'pl_paintl' && panel){ readPanel(); const b = $('#panel [data-testid=\"paint-litres\"]'); if (b) b.textContent = `${Math.round((+t.value || 0) * 10) / 10} L`; return; } if (t.id === 'pl_paintnote' && panel){ readPanel(); return; } if (t.matches('[data-tin]')){ est.paint_tins = est.paint_tins || {}; const o = est.paint_tins[t.dataset.tin] || (est.paint_tins[t.dataset.tin] = {}); o[t.dataset.size] = +t.value || 0; const keep = document.activeElement === t ? [t.dataset.tin, t.dataset.size] : null; renderTotals(); if (keep){ const n = document.querySelector(`[data-tin=\"${keep[0]}\"][data-size=\"${keep[1]}\"]`); if (n){ n.focus(); n.select(); } } return; } if (t.id === 'pl_prodq' && panel){")

html = html.replace('<title>', '<title>Round 88 — ', 1) if '<title>Round 88' not in html else html
OUT.write_text(html); print('wrote', OUT, len(html))
