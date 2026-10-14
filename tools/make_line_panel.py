#!/usr/bin/env python3
"""Fix Round F part 2 — Line details v2. Patches estimate-builder-add-work-v2.html into
estimate-builder-line-details.html:
- the Line details panel is 640 px (was 460);
- Quantity row: qty · Unit select (each / m² / lm / hr / day / job, default = the Library item's unit; a
  "Library default is … · Reset" note when changed; auto measure only for m² and lm);
- Preparation row shows the Library item's "what the prep includes" text, "Edit for this line" (per-line note),
  and "Print on the quote and show the crew";
- Product section: two-column chips, and "+ New product…" that creates a product on the spot, uses it on the
  line and (optionally) adds it to the Library item;
- the paper meta prints "Prep · {text}" and the client view's line sub prints "prep: {text}" when shown.
Every rep() asserts the exact count. The base's renderPanel / readPanel / lineMeta are re-declared later in
the script (a later `function` declaration wins), reusing the base text for everything that does not change."""
from pathlib import Path
import re

SRC = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-add-work-v2.html')
OUT = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-line-details.html')
html = SRC.read_text()

def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:90])
    html = html.replace(a, b)

def block(start_marker, end_marker):
    """Return the text from start_marker up to (not including) end_marker."""
    i = html.index(start_marker); j = html.index(end_marker, i)
    return html[i:j]

# ---------------------------------------------------------------- CSS
CSS = """  /* ---- Line details v2 (Fix Round F part 2) ---- */
  .sheet.panel{ width:640px; background:var(--surface); }
  .panel .qrow{ display:grid; grid-template-columns:130px 170px 1fr; gap:10px; align-items:end; }
  .panel .qrow .seg{ width:100%; }
  .panel .qrow .seg button{ flex:1; }
  .panel .unitnote{ margin-top:6px; }
  .panel .lnk{ border:none; background:none; color:var(--accent); font:inherit; font-size:11.5px; font-weight:700; cursor:pointer; padding:0; }
  .panel .coathead, .panel .coatrow{ grid-template-columns:22px 1fr 96px 84px; }
  .panel .coatrow.preprow{ align-items:start; }
  .panel .coatrow.preprow > input[type=checkbox]{ margin-top:3px; }
  .panel .coatrow.preprow > input[type=number]{ margin-top:0; }
  .panel .prepabout{ font-size:12px; color:var(--text-secondary); margin-top:4px; line-height:1.45; }
  .panel .prepabout i{ color:var(--text-muted); }
  .panel .prepabout .lnk{ margin-left:6px; }
  .panel textarea.prepnote{ width:100%; min-height:58px; margin-top:6px; font:inherit; font-size:12.5px; border:1px solid var(--accent); border-radius:8px; padding:7px 9px; resize:vertical; }
  .panel .prepshow{ margin-top:6px; font-size:12px !important; }
  .panel .prodgrid{ display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:6px; }
  .panel .prodgrid .prodchip{ margin-bottom:0; }
  .panel .prodchip.newp{ border-style:dashed; color:var(--accent); font-weight:600; }
  .panel .prodchip.newp .sw{ background:var(--accent-bg); display:flex; align-items:center; justify-content:center; color:var(--accent); font-weight:800; }
  .panel .npform{ border:1px solid var(--accent); border-radius:10px; padding:12px; margin:4px 0 8px; background:var(--accent-bg); }
  .panel .npform .fr{ margin-bottom:8px; }
  .panel .npform .act{ display:flex; gap:8px; align-items:center; justify-content:flex-end; margin-top:4px; }
  .panel .npform .cb{ margin-right:auto; font-size:12.5px; }
"""
rep(".sheet.panel{ width:460px; background:var(--surface); }", CSS)

# ---------------------------------------------------------------- client view: prep text in the line sub
rep("[li.prep ? 'prep' : null, li.primer ? 'prime' : null,", "[li.prep ? prepSub(li) : null, li.primer ? 'prime' : null,")

# ---------------------------------------------------------------- base functions to re-declare
render_base = block("function renderPanel(){", "function productFamily(lib){")
read_base = block("function readPanel(){", "function savePanel(){")
meta_base = block("function lineMeta(li, est){", "function displayUnit(li){")

# library branch of renderPanel → replaced wholesale
LIB_START = "  if (li.kind === 'library'){"
LIB_END = "  } else if (li.kind === 'repair'){"
assert render_base.count(LIB_START) == 1 and render_base.count(LIB_END) == 1
lib_new = r"""  if (li.kind === 'library'){
    const s = li.snap; const hourly = s.priced_by === 'hour'; const u = li.unit || s.priced_by; const U = UNIT[u] || u;
    const stepRow = (k, t, h, ty) => { const on = k === 'prep' ? li.prep : k === 'primer' ? li.primer : li.coats === +k[1]; const rate = k === 'prep' ? s.prep_rate : s.rates[k]; const mins = k === 'prep' ? s.prep_mins : s.mins[k];
      const prepExtra = k !== 'prep' ? '' : `<div class="prepabout" data-testid="panel-prep-about">${prepText(li).trim() ? esc(prepText(li)) : '<i>No prep notes on this Library item yet.</i>'}<button class="lnk" data-prepedit data-testid="panel-prep-edit">${panel.prepEdit ? 'Done' : (li.prep_note != null ? 'Edited for this line' : 'Edit for this line')}</button></div>${panel.prepEdit ? `<textarea class="prepnote" id="pl_prepnote" data-testid="panel-prep-note" placeholder="What the prep includes for this line — e.g. clean, fill nail holes, sand, spot prime bare patches">${esc(prepText(li))}</textarea>${li.prep_note != null && s.prep_about ? `<div><button class="lnk" data-prepreset data-testid="panel-prep-reset">Use the Library text instead</button></div>` : ''}` : ''}${li.prep ? `<label class="cb prepshow"><input type="checkbox" id="pl_prepshow" data-testid="panel-prep-show" ${li.prep_show !== false ? 'checked' : ''}>Print on the quote and show the crew</label>` : ''}`;
      return `<div class="coatrow ${on ? '' : 'off'} ${k === 'prep' ? 'preprow' : ''}" data-testid="step-${k}"><input type="${ty}" name="coat" data-coat="${k}" ${on ? 'checked' : ''}><div><div class="t">${t}</div><div class="h">${h}</div>${prepExtra}</div><input type="number" data-srate="${k}" value="${rate ?? ''}" placeholder="$ / ${U}"><input type="number" data-smins="${k}" value="${mins ?? ''}" placeholder="min"></div>`; };
    const rows = hourly ? `<div class="coatrow"><span></span><div><div class="t">Hourly rate</div></div><input type="number" data-srate="c1" value="${s.rates.c1 ?? ''}" placeholder="$"><input type="number" value="60" readonly></div>`
      : [['prep','Preparation','optional, adds to every unit','checkbox'],['primer','Primer','optional','checkbox'],['c1','First coat','1 coat total','radio'],['c2','Second coat','2 coats total · standard','radio'],['c3','Third coat','3 coats total','radio']].map(([k,t,h,ty]) => stepRow(k, t, h, ty)).join('');
    const c = a ? areaCalc(a) : null; const autoAble = u === 'm2' || u === 'lineal';
    const autoLabel = u === 'm2' ? (/ceiling/i.test(s.category) ? `ceiling ${c ? qfmt(c.ceiling) : '?'} m²` : `walls ${c ? qfmt(c.walls) : '?'} m²`) : u === 'lineal' ? `perimeter ${c ? qfmt(c.linear) : '?'} lm` : null;
    const unitSel = `<select id="pl_unit" data-testid="panel-unit">${['each','m2','lineal','hour','day','job'].map(x => `<option value="${x}" ${u === x ? 'selected' : ''}>${UNIT[x]}${x === s.priced_by ? ' · Library default' : ''}</option>`).join('')}</select>`;
    // (the closed select shows "m² · Library default" in full at 170 px; the open list carries the same words)
    body = `${common}<div class="psec"><h5>Quantity</h5><div class="qrow"><div class="fld"><label>Quantity</label><input type="number" id="pl_qty" data-testid="panel-qty" value="${qfmt(lineQty(li, est))}" ${li.qty_auto ? 'readonly' : ''}></div><div class="fld"><label>Unit</label>${unitSel}</div><div class="fld"><label>How it's measured</label>${autoAble && autoLabel ? `<div class="seg" data-testid="panel-qtymode"><button class="${li.qty_auto ? 'on' : ''}" data-qmode="auto">Auto · ${autoLabel}</button><button class="${li.qty_auto ? '' : 'on'}" data-qmode="manual">Manual</button></div>` : `<div class="hinttxt" data-testid="panel-manual-hint" style="margin-top:9px">Typed by hand · auto measure works for m² and lm</div>`}</div></div>${u !== s.priced_by ? `<div class="hint unitnote" data-testid="panel-unit-note">Library default is ${UNIT[s.priced_by]} · this line uses ${U} <button class="lnk" data-unitreset data-testid="panel-unit-reset">Reset</button></div>` : ''}${autoAble && autoLabel && a && !measured(a) ? `<div class="hint" style="color:var(--danger)">${esc(a.name)} has no measurements yet, so auto gives 0. Measure it on the paper or switch to manual.</div>` : ''}</div>
      <div class="psec"><h5>Rate and time (this line only; the Library item is untouched)</h5><div class="coathead"><span></span><span>Step</span><span class="r">$ / ${U}</span><span class="r">min / ${U}</span></div>${rows}<div class="hint" style="margin-top:6px">Or type one flat rate: <input type="number" id="pl_override" value="${li.rate_override ?? ''}" placeholder="$ / ${U}" style="width:100px;font-family:var(--font-mono);border:1px solid var(--border-strong);border-radius:6px;padding:4px 6px"> ${li.rate_override !== null ? '<button class="lnk" id="pl_clearov" style="border:none;background:none;color:var(--accent);font-weight:600;cursor:pointer">use the steps instead</button>' : ''}</div></div>
      <div class="psec"><h5>Product</h5><div class="sh-search prodsearch">${svg('search')}<input id="pl_prodq" data-testid="panel-product-search" placeholder="Search all your Products (brand, name, size)" value="${esc(panel.prodq || '')}"></div>${(() => { const fam = productFamily(s); const q = (panel.prodq || '').toLowerCase(); const all = D.PRODUCTS.filter(p => !q || `${p.brand} ${p.name} ${p.pack} ${p.material}`.toLowerCase().includes(q)); const ownIds = s.products || (s.product ? [s.product] : []); const own = q ? [] : all.filter(p => ownIds.includes(p.id)); const sug = q ? [] : all.filter(p => p.material === fam && !own.includes(p)); const rest = q ? all : all.filter(p => p.material !== fam && !own.includes(p)); const chip = (p) => `<div class="prodchip ${li.product === p.id ? 'on' : ''}" data-plprod="${p.id}" data-testid="prod-${p.id}"><span class="sw"></span><div><div class="n">${esc(p.brand)} ${esc(p.name)}</div><div class="s">${esc(p.pack)} · ${money(p.unit_cost)} · ${esc(p.material)}</div></div></div>`; const grp = (t, list, tid) => list.length ? `<div class="psub" ${tid ? `data-testid="${tid}"` : ''}>${t}</div><div class="prodgrid">${list.map(chip).join('')}</div>` : ''; const newChip = `<div class="prodchip newp" data-newprod data-testid="prod-new"><span class="sw">+</span><div><div class="n">New product…</div><div class="s">${q ? `Add “${esc(panel.prodq)}” to your Products` : 'Not in your Products yet? Add it here'}</div></div></div>`;
        const form = panel.newprod ? `<div class="npform" data-testid="newprod-form"><div class="fr3"><div class="fld"><label>Brand</label><input type="text" id="np_brand" data-testid="np-brand" placeholder="e.g. Dulux" value="${esc(panel.newprod.brand)}"></div><div class="fld"><label>Name</label><input type="text" id="np_name" data-testid="np-name" placeholder="e.g. Wash&amp;Wear Low Sheen" value="${esc(panel.newprod.name)}"></div><div class="fld"><label>Pack</label><input type="text" id="np_pack" data-testid="np-pack" placeholder="e.g. 10L" value="${esc(panel.newprod.pack)}"></div></div><div class="fr"><div class="fld"><label>Material</label><select id="np_material" data-testid="np-material">${[...new Set([fam, ...D.PRODUCTS.map(p => p.material)])].map(m => `<option ${panel.newprod.material === m ? 'selected' : ''}>${esc(m)}</option>`).join('')}</select></div><div class="fld"><label>Cost $ per pack</label><input type="number" id="np_cost" data-testid="np-cost" placeholder="0" value="${panel.newprod.cost}"></div></div><div class="act"><label class="cb"><input type="checkbox" id="np_tolib" data-testid="np-tolib" ${panel.newprod.tolib ? 'checked' : ''}>Also add it to the Library item “${esc(s.name)}”</label><button class="btn btn-ghost" id="np_cancel" data-testid="np-cancel">Cancel</button><button class="btn btn-primary" id="np_add" data-testid="np-add">${svg('plus')}Add and use</button></div></div>` : '';
        return grp('On this Library item', own, 'panel-own-products') + grp(`Suggested for ${esc(s.category)}`, sug) + (rest.length ? grp(q ? `${rest.length} match${rest.length === 1 ? '' : 'es'}` : 'Everything else', rest) : (q ? '<div class="aempty">No product matches.</div>' : '')) + (panel.newprod ? form : newChip); })()}<div class="prodchip ${!li.product ? 'on' : ''}" data-plprod="" data-testid="prod-none"><span class="sw" style="background:var(--surface-sunken)"></span><div><div class="n">No product on this line</div><div class="s">Labour only, or the client supplies the paint</div></div></div>
      ${li.product ? `<div class="fr" style="margin-top:8px"><div class="fld"><label>Colour / shade</label><input type="text" id="pl_colour" value="${esc(li.colour || '')}" placeholder="e.g. Natural White, Lexicon Quarter"></div><div class="fld"><label>Use this product and colour for</label><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-ghost" data-applyprod="area" style="padding:6px 10px;font-size:12px">All ${esc(s.category.toLowerCase())} in ${a ? esc(a.name) : 'whole job'}</button><button class="btn btn-ghost" data-applyprod="all" style="padding:6px 10px;font-size:12px">All ${esc(s.category.toLowerCase())} everywhere</button></div></div></div>` : ''}</div>`;
"""
i = render_base.index(LIB_START); j = render_base.index(LIB_END)
render_new = render_base[:i] + lib_new + render_base[j:]

# readPanel: unit, prep note, prep show for library lines
READ_ANCHOR = "if (li.kind === 'library'){ if ($('#pl_colour')) li.colour = $('#pl_colour').value.trim();"
assert read_base.count(READ_ANCHOR) == 1
read_new = read_base.replace(READ_ANCHOR, READ_ANCHOR + " const us = $('#pl_unit'); if (us) li.unit = us.value; const ps = $('#pl_prepshow'); if (ps) li.prep_show = ps.checked; const pn = $('#pl_prepnote'); if (pn) li.prep_note = pn.value;")

# lineMeta: prep text on the paper
META_ANCHOR = "if (li.prep) bits.push('Prep');"
assert meta_base.count(META_ANCHOR) == 1
meta_new = meta_base.replace(META_ANCHOR, "if (li.prep) bits.push(prepShown(li) ? `Prep · ${esc(prepText(li))}` : 'Prep');")

JS = """
// ============================================================ Line details v2 (Fix Round F part 2)
const PREP_ABOUT = { lib_walls_std:'Clean, fill nail holes and cracks, sand, spot prime bare patches.', lib_walls_feature:'Clean, fill and sand; mask the adjoining walls.', lib_walls_render:'Pressure wash, treat mould, patch cracks, seal.', lib_walls_wb:'Scrape and sand loose paint, gap-fill, prime bare timber.', lib_ceil_flat:'Dust, fill cracks, sand, spot prime stains.' };
Object.entries(PREP_ABOUT).forEach(([id, t]) => { if (LIB[id]) LIB[id].prep_about = t; });
function prepText(li){ const s = li.snap || LIB[li.lib_id] || {}; return (li.prep_note !== null && li.prep_note !== undefined) ? li.prep_note : (s.prep_about || ''); }
function prepShown(li){ return !!li.prep && li.prep_show !== false && !!prepText(li).trim(); }
function prepSub(li){ return prepShown(li) ? `prep: ${esc(prepText(li))}` : 'prep'; }
""" + render_new + "\n" + read_new + "\n" + meta_new + r"""
// panel v2 handlers (capture phase: they run before the base handlers and stop there)
document.addEventListener('click', (e) => {
  if (!panel) return; const c = (sel) => e.target.closest(sel); let x; const li = panel.line;
  if ((x = c('[data-prepedit]'))){ e.stopPropagation(); readPanel(); if (panel.prepEdit){ const s = li.snap; if (li.prep_note != null && li.prep_note.trim() === (s.prep_about || '').trim()) li.prep_note = null; } panel.prepEdit = !panel.prepEdit; renderPanel(); if (panel.prepEdit) $('#pl_prepnote')?.focus(); return; }
  if ((x = c('[data-prepreset]'))){ e.stopPropagation(); readPanel(); li.prep_note = null; renderPanel(); return; }
  if ((x = c('[data-unitreset]'))){ e.stopPropagation(); readPanel(); li.unit = li.snap.priced_by; const able = li.unit === 'm2' || li.unit === 'lineal'; li.qty_auto = able; if (able) li.qty = null; renderPanel(); return; }
  if ((x = c('[data-newprod]'))){ e.stopPropagation(); readPanel(); panel.newprod = { brand: '', name: panel.prodq || '', pack: '', material: productFamily(li.snap), cost: '', tolib: true }; renderPanel(); $('#np_brand')?.focus(); return; }
  if (e.target.id === 'np_cancel'){ e.stopPropagation(); readPanel(); panel.newprod = null; renderPanel(); return; }
  if ((x = c('#np_add'))){ e.stopPropagation(); readPanel(); const brand = $('#np_brand').value.trim(); const pname = $('#np_name').value.trim(); if (!pname){ say('Give the product a name'); $('#np_name').focus(); return; } const name = `${brand} ${pname}`.trim();
    const p = { id: uid('p_'), brand, name: pname, pack: $('#np_pack').value.trim() || '—', unit_cost: +$('#np_cost').value || 0, material: $('#np_material').value };
    D.PRODUCTS.push(p); PROD[p.id] = p; li.product = p.id;
    if ($('#np_tolib').checked){ const lib = LIB[li.lib_id]; lib.products = [...(lib.products || (lib.product ? [lib.product] : [])), p.id]; li.snap.products = [...lib.products]; }
    panel.newprod = null; panel.prodq = ''; renderPanel(); say(`${name} added to your Products${$('#pl_colour') ? ' and used on this line' : ''}`); return; }
}, true);
document.addEventListener('change', (e) => {
  if (!panel) return; const t = e.target; const li = panel.line;
  if (t.id === 'pl_unit' && li.kind === 'library'){ e.stopPropagation(); readPanel(); const able = li.unit === 'm2' || li.unit === 'lineal'; if (!able){ if (li.qty_auto) li.qty = lineQty(li, est) || 1; li.qty_auto = false; } renderPanel(); return; }
  if (t.id === 'pl_prepshow'){ e.stopPropagation(); readPanel(); return; }
}, true);
document.addEventListener('input', (e) => { if (!panel) return; const t = e.target; if (t.id === 'pl_prepnote') panel.line.prep_note = t.value; if (t.id === 'pl_prodq'){ panel.prodq = t.value; } }, true);
"""
anchor = "document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ if (panel) closePanel();"
rep(anchor, JS + anchor)

# the base search input re-renders on input through its own handler; make sure it exists once
assert html.count("id=\"pl_prodq\"") >= 1
OUT.write_text(html)
print('wrote', OUT, len(html))
