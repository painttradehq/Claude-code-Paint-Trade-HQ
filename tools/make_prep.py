#!/usr/bin/env python3
"""Round 89 — Prep as a pop-up from the line panel: tick Preparation, "Add prep" / "Edit prep · n" opens a checklist of
the business's prep steps (multi-select), with "add your own" (kept for next time), a one-off note for the line, and
"print on the quote". Patches estimate-builder-paint.html (the Round 88 builder) as text."""
import json
from pathlib import Path
SRC = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-paint.html')
OUT = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-prep.html')
html = SRC.read_text()
def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:100])
    html = html.replace(a, b)

# ---- data: the business's prep list; two lines already carry steps ----
i = html.index('const D = '); j = html.index('\n', i)
D = json.loads(html[i + len('const D = '):j].rstrip(';'))
D['PREP_LIST'] = [{'name': n} for n in [
    'Wash down with sugar soap', 'Fill nail holes and cracks', 'Sand back', 'Scrape loose and flaking paint',
    'Spot prime bare patches', 'Caulk gaps and joints', 'Patch plaster', 'Treat mould', 'Degloss glossy surfaces',
    'Remove and refit hardware', 'Mask and cover with drop sheets', 'Pressure wash', 'Treat rust on metal',
    'Timber repairs and putty', 'Seal stains']] + [{'name': 'Strip old wallpaper', 'own': True}]
for l in D['ESTIMATE']['lines']:
    if l['id'] == 'l3': l.update({'prep': True, 'prep_steps': ['Fill nail holes and cracks', 'Sand back', 'Caulk gaps and joints'], 'prep_extra': '', 'prep_show': True})
    if l['id'] == 'l9': l.update({'prep': True, 'prep_steps': ['Scrape loose and flaking paint', 'Sand back', 'Spot prime bare patches'], 'prep_extra': 'Cracked pane in the bathroom sash to be reglazed first (client)', 'prep_show': True})
html = html[:i] + 'const D = ' + json.dumps(D, ensure_ascii=False) + ';' + html[j:]

# ---- CSS ----
rep("  .coatrow.off{ opacity:.5; }",
    "  .coatrow.off{ opacity:.5; }\n"
    "  .coatrow .lnk, .prepsum .lnk{ border:none; background:none; color:var(--accent); font:inherit; font-size:11.5px; font-weight:600; cursor:pointer; padding:0; }\n"
    "  .prepsum{ font-size:12.5px; color:var(--text-secondary); padding:6px 0 8px 30px; border-bottom:1px solid var(--border); line-height:1.45; }\n"
    "  .prepsum .extra{ font-style:italic; }\n  .prepsum .notq{ font-size:10.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); margin-left:6px; }\n"
    "  .mscrim.prepscrim{ z-index:120; }\n  .mbox.prep{ max-width:520px; display:flex; flex-direction:column; max-height:86vh; }\n  .prep-pop{ display:flex; flex-direction:column; min-height:0; max-height:86vh; }\n"
    "  .pp-head{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding:18px 20px 10px; }\n  .pp-head h3{ margin:0; font-family:var(--font-display); font-weight:600; font-size:20px; }\n  .pp-head .sub{ font-size:12.5px; color:var(--text-secondary); margin-top:2px; }\n"
    "  .pp-head .x{ border:none; background:var(--surface-sunken); width:30px; height:30px; border-radius:8px; cursor:pointer; font-size:18px; color:var(--text-secondary); }\n"
    "  .pp-search{ padding:0 20px 8px; }\n  .pp-search input{ width:100%; box-sizing:border-box; border:1px solid var(--border-strong); border-radius:8px; padding:8px 10px; font:inherit; font-size:13px; }\n"
    "  .pp-list{ flex:1 1 auto; overflow-y:auto; padding:0 20px; min-height:120px; }\n"
    "  .pp-item{ display:flex; align-items:center; gap:10px; padding:8px 2px; border-bottom:1px solid var(--border); font-size:13.5px; cursor:pointer; }\n  .pp-item:hover{ background:var(--surface-sunken); }\n"
    "  .pp-item input{ width:16px; height:16px; accent-color:var(--accent); margin:0; flex-shrink:0; }\n  .pp-item .own{ font-size:10px; letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); margin-left:auto; }\n"
    "  .pp-item .rm{ border:none; background:none; color:var(--text-muted); cursor:pointer; font-size:15px; padding:0 4px; visibility:hidden; }\n  .pp-item:hover .rm{ visibility:visible; }\n  .pp-item .rm:hover{ color:var(--danger, #B4232C); }\n"
    "  .pp-empty{ padding:16px 2px; font-size:13px; color:var(--text-muted); }\n"
    "  .pp-add{ display:flex; gap:8px; padding:10px 20px; }\n  .pp-add input{ flex:1; border:1px solid var(--border-strong); border-radius:8px; padding:8px 10px; font:inherit; font-size:13px; }\n"
    "  .pp-extra{ padding:0 20px 6px; }\n  .pp-extra label{ display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-muted); margin-bottom:4px; }\n  .pp-extra input{ width:100%; box-sizing:border-box; border:1px solid var(--border-strong); border-radius:8px; padding:8px 10px; font:inherit; font-size:13px; }\n"
    "  .pp-show{ display:flex; align-items:center; gap:8px; padding:6px 20px 10px; font-size:13px; }\n  .pp-show input{ width:16px; height:16px; accent-color:var(--accent); margin:0; }\n"
    "  .pp-apply{ display:flex; gap:6px; flex-wrap:wrap; align-items:center; padding:0 20px 10px; font-size:12px; color:var(--text-muted); }\n"
    "  .pp-foot{ display:flex; justify-content:space-between; align-items:center; gap:10px; padding:12px 20px 16px; border-top:1px solid var(--border); }\n  .pp-foot .cnt{ font-size:12.5px; color:var(--text-secondary); }")

# ---- the prep row: Add prep / Edit prep · n, and the chosen steps under it ----
rep("""return `<div class="coatrow ${on ? '' : 'off'}"><input type="${ty}" name="coat" data-coat="${k}" ${on ? 'checked' : ''}><div><div class="t">${t}</div><div class="h">${h}</div></div><input type="number" data-srate="${k}" value="${rate ?? ''}" placeholder="$ / ${UNIT[s.priced_by]}"><input type="number" data-smins="${k}" value="${mins ?? ''}" placeholder="min"></div>`; }).join('');""",
    """return `<div class="coatrow ${on ? '' : 'off'}"><input type="${ty}" name="coat" data-coat="${k}" ${on ? 'checked' : ''}><div><div class="t">${t}</div><div class="h">${h}${k === 'prep' && on ? ` · <button class="lnk" data-prepedit="1" data-testid="prep-edit">${(li.prep_steps || []).length ? `Edit prep · ${li.prep_steps.length}` : 'Add prep'}</button>` : ''}</div></div><input type="number" data-srate="${k}" value="${rate ?? ''}" placeholder="$ / ${UNIT[s.priced_by]}"><input type="number" data-smins="${k}" value="${mins ?? ''}" placeholder="min"></div>${k === 'prep' && on && prepLineText(li) ? `<div class="prepsum" data-testid="prep-summary">${esc((li.prep_steps || []).join(' · '))}${li.prep_extra ? `${(li.prep_steps || []).length ? ' · ' : ''}<span class="extra">${esc(li.prep_extra)}</span>` : ''}${li.prep_show === false ? '<span class="notq">not on the quote</span>' : ''}</div>` : ''}`; }).join('');""")

# ---- the paper's summary and the client document ----
rep("if (li.prep) bits.push('Prep'); if (li.primer) bits.push('Prime');",
    "if (li.prep) bits.push(prepLineText(li) ? `Prep · ${esc(prepLineText(li))}` : 'Prep'); if (li.primer) bits.push('Prime');")
rep("[li.prep ? 'prep' : null, li.primer ? 'prime' : null,",
    "[li.prep ? (li.prep_show !== false && prepLineText(li) ? 'prep: ' + esc(prepLineText(li)) : 'prep') : null, li.primer ? 'prime' : null,")

# ---- helpers + the pop-up ----
rep("let paintEdit = null;",
    """let paintEdit = null;
// ---- Round 89: prep as a pop-up ----
const prepLineText = (li) => [(li.prep_steps || []).join(' · '), li.prep_extra || ''].filter(Boolean).join(' — ');
let prepPop = null;
function openPrepPop(){ const li = panel.line; prepPop = { steps: new Set(li.prep_steps || []), extra: li.prep_extra || '', show: li.prep_show !== false, q: '' }; renderPrepPop(); }
function closePrepPop(){ prepPop = null; $('#modal').classList.remove('prepscrim'); closeModal(); $('#mbox').innerHTML = ''; }
function renderPrepPop(keepFocus){ const li = panel.line; const a = areaById(li.area_id); const s = li.snap; const q = prepPop.q.trim().toLowerCase(); const list = D.PREP_LIST.filter(p => !q || p.name.toLowerCase().includes(q));
  const items = list.map(p => `<label class="pp-item" data-testid="prep-item-${slug(p.name)}"><input type="checkbox" data-pptoggle="${esc(p.name)}" ${prepPop.steps.has(p.name) ? 'checked' : ''}><span>${esc(p.name)}</span>${p.own ? `<span class="own">yours</span><button class="rm" data-pprm="${esc(p.name)}" title="Remove from your list" aria-label="Remove ${esc(p.name)}">×</button>` : ''}</label>`).join('');
  const n = prepPop.steps.size; const cat = (s.category || 'lines').toLowerCase();
  modal(`<div class="prep-pop" data-testid="prep-pop">
    <div class="pp-head"><div><h3>Preparation</h3><div class="sub">${esc(li.name)}${a ? ' · ' + esc(a.name) : ''}</div></div><button class="x" data-prepclose="1" aria-label="Close">×</button></div>
    <div class="pp-search"><input id="ppq" placeholder="Search prep steps…" value="${esc(prepPop.q)}" data-testid="prep-search"></div>
    <div class="pp-list" data-testid="prep-list">${items || `<div class="pp-empty">Nothing matches "${esc(prepPop.q)}" — add it below and it is yours from now on.</div>`}</div>
    <div class="pp-add"><input id="ppnew" placeholder="Add your own step, e.g. Remove picture hooks" data-testid="prep-new"><button class="btn btn-ghost" data-prepaddown="1" data-testid="prep-add-own">Add</button></div>
    <div class="pp-extra"><label>One-off note for this line only (optional)</label><input id="ppextra" value="${esc(prepPop.extra)}" placeholder="e.g. client is moving the furniture the day before" data-testid="prep-extra"></div>
    <label class="pp-show"><input type="checkbox" id="ppshow" ${prepPop.show ? 'checked' : ''} data-testid="prep-show"> Print on the quote and show the crew</label>
    <div class="pp-apply">Also set this prep for: <button class="btn btn-ghost" data-prepapply="area" style="padding:4px 9px;font-size:12px" data-testid="prep-apply-area">all ${esc(cat)} in ${a ? esc(a.name) : 'the whole job'}</button><button class="btn btn-ghost" data-prepapply="all" style="padding:4px 9px;font-size:12px" data-testid="prep-apply-all">all ${esc(cat)} everywhere</button></div>
    <div class="pp-foot"><span class="cnt" data-testid="prep-count">${n ? `${n} step${n === 1 ? '' : 's'} chosen` : 'No steps chosen yet'}</span><div style="display:flex;gap:8px"><button class="btn btn-ghost" data-prepclose="1">Cancel</button><button class="btn btn-primary" data-prepdone="1" data-testid="prep-done">Done</button></div></div>
  </div>`, 'prep'); $('#modal').classList.add('prepscrim');
  if (keepFocus){ const n2 = $('#' + keepFocus); if (n2){ n2.focus(); if (n2.setSelectionRange) n2.setSelectionRange(n2.value.length, n2.value.length); } } }
function prepPopRead(){ if (!prepPop) return; const ex = $('#ppextra'); const sh = $('#ppshow'); if (ex) prepPop.extra = ex.value.trim(); if (sh) prepPop.show = sh.checked; }
function applyPrepTo(li){ li.prep = true; li.prep_steps = D.PREP_LIST.map(p => p.name).filter(n => prepPop.steps.has(n)); li.prep_extra = prepPop.extra; li.prep_show = prepPop.show; }
function prepAddOwn(){ const inp = $('#ppnew'); const v = (inp ? inp.value : '').trim(); if (!v) return; const have = D.PREP_LIST.find(p => p.name.toLowerCase() === v.toLowerCase()); if (!have) D.PREP_LIST.push({ name: v, own: true }); prepPop.steps.add(have ? have.name : v); prepPop.q = ''; renderPrepPop('ppnew'); say(have ? `${have.name} ticked` : `${v} added to your prep list`); }"""
)

# ---- handlers ----
rep("  if ((x = c('[data-paintmode]'))){",
    """  if ((x = c('[data-prepedit]'))){ readPanel(); openPrepPop(); return; }
  if ((x = c('[data-prepclose]'))){ closePrepPop(); return; }
  if ((x = c('[data-prepdone]'))){ prepPopRead(); applyPrepTo(panel.line); closePrepPop(); renderPanel(); refreshPanelFoot(); return; }
  if ((x = c('[data-prepapply]'))){ prepPopRead(); const li = panel.line; applyPrepTo(li); const cat = LIB[li.lib_id].category; const scope = x.dataset.prepapply; let n = 0; est.lines.forEach(o => { if (o.id === li.id || o.kind !== 'library' || LIB[o.lib_id]?.category !== cat) return; if (scope === 'area' && o.area_id !== li.area_id) return; applyPrepTo(o); n++; }); closePrepPop(); renderPanel(); refreshPanelFoot(); renderPaper(); say(n ? `Prep set on ${n} other ${cat.toLowerCase()} line${n === 1 ? '' : 's'}` : `No other ${cat.toLowerCase()} lines ${scope === 'area' ? 'in this area' : ''}`.trim()); return; }
  if ((x = c('[data-pprm]'))){ e.preventDefault(); const nm = x.dataset.pprm; D.PREP_LIST = D.PREP_LIST.filter(p => p.name !== nm); prepPop.steps.delete(nm); renderPrepPop(); say(`${nm} removed from your list`); return; }
  if ((x = c('[data-prepaddown]'))){ prepPopRead(); prepAddOwn(); return; }
  if ((x = c('[data-paintmode]'))){""")
rep("if (t.id === 'pl_paintnote' && panel){ readPanel(); return; } if (t.matches('[data-tin]')){", "if (t.id === 'pl_paintnote' && panel){ readPanel(); return; } if (t.matches('[data-pptoggle]') && prepPop){ prepPopRead(); if (t.checked) prepPop.steps.add(t.dataset.pptoggle); else prepPop.steps.delete(t.dataset.pptoggle); const c = $('#modal [data-testid=\"prep-count\"]'); const n = prepPop.steps.size; if (c) c.textContent = n ? `${n} step${n === 1 ? '' : 's'} chosen` : 'No steps chosen yet'; return; } if (t.id === 'ppq' && prepPop){ prepPopRead(); prepPop.q = t.value; renderPrepPop('ppq'); return; } if (t.matches('[data-tin]')){")
rep("document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ if (panel) closePanel();",
    "document.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target && e.target.id === 'ppnew' && prepPop){ e.preventDefault(); prepPopRead(); prepAddOwn(); return; } if (e.key === 'Escape'){ if (prepPop){ closePrepPop(); return; } if (panel) closePanel();")
rep("$('#modal').addEventListener('click', (e) => { if (e.target === $('#modal')) closeModal(); });",
    "$('#modal').addEventListener('click', (e) => { if (e.target === $('#modal')){ if (prepPop) closePrepPop(); else closeModal(); } });")

html = html.replace('<title>Round 88 — ', '<title>Round 89 — ', 1)
OUT.write_text(html); print('wrote', OUT, len(html))
