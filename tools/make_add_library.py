#!/usr/bin/env python3
"""Fix Round F part 2b — "Add to the Library" from the estimate builder. Patches
estimate-builder-line-details.html (Line details v2 base) into estimate-builder-add-library.html:
- Add work sheet, search with no match: a second button "Add to the Library" beside "Add as a custom line";
- Add work sheet, Library tab: a dashed "New Library item in {category}" card after the cards;
- both save the quote first (toast "Quote saved"), then open the Library item editor as a full page with a
  return bar ("← Back to quote EST-0192 · Kitchen"); Save item creates the item and returns to the sheet on
  that category with the new card first and a "New" pill, ready to Add; Cancel returns as it was.
Every rep() asserts the exact count."""
from pathlib import Path

SRC = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-line-details.html')
OUT = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-add-library.html')
html = SRC.read_text()

def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:90])
    html = html.replace(a, b)

# ---------------------------------------------------------------- CSS
CSS = """  /* ---- Add to the Library (Fix Round F part 2b) ---- */
  .srchint.two{ flex-wrap:wrap; }
  .srchint.two .btns{ margin-left:auto; display:flex; gap:6px; flex-shrink:0; }
  .srchint.two .btns button{ margin-left:0; }
  .srchint.two .btns button.lib{ background:var(--accent); color:#fff; border-color:var(--accent); }
  .srchint.two .btns button.lib:hover{ background:var(--accent-ink); }
  .newlib{ margin-top:10px; border:1px dashed var(--border-strong); border-radius:12px; padding:12px 14px; display:flex; align-items:center; gap:10px; cursor:pointer; color:var(--accent); font-weight:600; font-size:13px; background:var(--surface); }
  .newlib:hover{ border-color:var(--accent); background:var(--accent-bg); }
  .newlib svg{ width:16px; height:16px; }
  .newlib small{ margin-left:auto; color:var(--text-muted); font-weight:500; font-size:12px; }
  .lcard.isnew{ border-color:var(--accent); box-shadow:0 0 0 2px var(--accent-bg); }
  .newpill{ display:inline-block; font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:#fff; background:var(--accent); border-radius:4px; padding:1px 6px; margin-right:6px; vertical-align:middle; }
  .libpage{ position:fixed; inset:0; z-index:60; background:var(--bg); overflow:auto; }
  .libpage[hidden]{ display:none; }
  .lp-return{ position:sticky; top:0; z-index:2; display:flex; align-items:center; gap:14px; padding:10px 28px; background:var(--accent-bg); border-bottom:1px solid var(--pale, #C9C2E8); font-size:13px; color:var(--accent-ink); }
  .lp-return button{ border:1px solid var(--accent); background:var(--surface); color:var(--accent); border-radius:8px; font:inherit; font-size:12.5px; font-weight:700; padding:6px 10px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; }
  .lp-return button svg{ width:13px; height:13px; }
  .lp-return .saved{ margin-left:auto; color:var(--text-secondary); font-size:12.5px; display:inline-flex; align-items:center; gap:6px; }
  .lp-return .saved svg{ width:14px; height:14px; color:var(--success); }
  .lp-wrap{ max-width:860px; margin:0 auto; padding:26px 28px 60px; }
  .lp-crumb{ font-size:12.5px; color:var(--text-muted); margin-bottom:6px; }
  .lp-crumb b{ color:var(--text-secondary); font-weight:600; }
  .lp-title{ font-family:var(--font-display); font-size:28px; font-weight:600; margin:0 0 4px; }
  .lp-sub{ font-size:13.5px; color:var(--text-secondary); margin-bottom:18px; }
  .lp-card{ background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:20px 22px; margin-bottom:14px; }
  .lp-card h4{ font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:var(--text-muted); margin:0 0 12px; }
  .lp-card .fr{ margin-bottom:12px; }
  .lp-card .fr:last-child{ margin-bottom:0; }
  .lp-grid{ display:grid; grid-template-columns:1fr 110px 96px; gap:8px 10px; align-items:center; font-size:13px; }
  .lp-grid .h{ font-size:10px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:var(--text-muted); }
  .lp-grid .h.r{ text-align:right; }
  .lp-grid .t{ font-weight:600; }
  .lp-grid .t small{ display:block; font-weight:500; font-size:11.5px; color:var(--text-muted); }
  .lp-grid input{ width:100%; font:inherit; font-size:13.5px; font-family:var(--font-mono); border:1px solid var(--border-strong); border-radius:8px; padding:7px 9px; text-align:right; }
  .lp-grid input:focus{ outline:none; border-color:var(--accent); }
  .lp-foot{ display:flex; justify-content:flex-end; gap:10px; align-items:center; margin-top:6px; }
  .lp-foot .err{ margin-right:auto; color:var(--danger); font-size:12.5px; font-weight:600; }
"""
rep(".sheet.panel{ width:640px; background:var(--surface); }", ".sheet.panel{ width:640px; background:var(--surface); }\n" + CSS)

# ---------------------------------------------------------------- search empty state: two buttons
OLD_HINT = """      + `<div class="srchint" data-testid="search-custom">Not in the Library? <b>${esc(sheet.q)}</b> can be a custom line — labour, material, equipment or a trade's sub-quote.<button data-custom-from-search="1" data-testid="search-custom-btn">${svg('plus')}Add as a custom line</button></div>`;"""
NEW_HINT = """      + `<div class="srchint two" data-testid="search-custom">Not in the Library? <b>${esc(sheet.q)}</b> can be a one-off custom line, or a new Library item you will have next time too.<span class="btns"><button data-custom-from-search="1" data-testid="search-custom-btn">${svg('plus')}Add as a custom line</button><button class="lib" data-lib-from-search="1" data-testid="search-library-btn">${svg('layers')}Add to the Library</button></span></div>`;"""
rep(OLD_HINT, NEW_HINT)

# ---------------------------------------------------------------- library tab: new-item card + "New" first
OLD_FOOT = """      + `<div class="footnote">Rates and minutes come from your Library. Click a name to change coats, primer, prep or product before adding.</div>`;"""
NEW_FOOT = """      + `<div class="newlib" data-newlib="${esc(sheet.cat)}" data-testid="new-lib-item">${svg('plus')}New Library item${sheet.cat !== 'All' ? ` in ${esc(sheet.cat)}` : ''}<small>Saves this quote, opens the Library, brings you back</small></div>`
      + `<div class="footnote">Rates and minutes come from your Library. Click a name to change coats, primer, prep or product before adding.</div>`;"""
rep(OLD_FOOT, NEW_FOOT)
rep("    const items = pool.filter(x => sheet.cat === 'All' || x.category === sheet.cat);",
    "    const items = pool.filter(x => sheet.cat === 'All' || x.category === sheet.cat).sort((p, q) => (q.id === sheet.newId ? 1 : 0) - (p.id === sheet.newId ? 1 : 0));")

# card: "New" pill + outline when it is the item just made
rep("""    return `<div class="lcard" data-testid="lib-row-${x.id}"><div class="th ${ph ? 'img' : ''}">""",
    """    const isNew = sheet.newId === x.id;
    return `<div class="lcard ${isNew ? 'isnew' : ''}" data-testid="lib-row-${x.id}"><div class="th ${ph ? 'img' : ''}">""")
rep("""<div class="n" data-libdetail="${x.id}">${esc(x.name)}</div><div class="m">${np ? '<span class="np">No price yet</span>'""",
    """<div class="n" data-libdetail="${x.id}">${isNew ? '<span class="newpill" data-testid="lib-new-pill">New</span>' : ''}${esc(x.name)}</div><div class="m">${np ? '<span class="np">No price yet</span>'""")
# repair task card: same pill
rep("""  const t = x; const added = sheet.added[t.id];
  return `<div class="lcard" data-testid="task-row-${t.id}"><div class="th ${t.hazard ? 'hz' : 'rp'}">${svg(t.hazard ? 'warn' : 'wrench')}</div><div class="n">${esc(t.name)}</div>""",
    """  const t = x; const added = sheet.added[t.id]; const isNewT = sheet.newId === t.id;
  return `<div class="lcard ${isNewT ? 'isnew' : ''}" data-testid="task-row-${t.id}"><div class="th ${t.hazard ? 'hz' : 'rp'}">${svg(t.hazard ? 'warn' : 'wrench')}</div><div class="n">${isNewT ? '<span class="newpill" data-testid="task-new-pill">New</span>' : ''}${esc(t.name)}</div>""")
# repairs view: dashed "New repair task" card + the new task first
OLD_RFOOT = """      + `<div class="footnote">Repairs sit inside the ${areaNoun()} with the paint lines. Hazards print a disclosure on the quote.</div>`;"""
NEW_RFOOT = """      + `<div class="newlib" data-newtask="${esc(sheet.rgroup)}" data-testid="new-task-item">${svg('plus')}New repair task${sheet.rgroup !== 'All' ? ` in ${esc(sheet.rgroup)}` : ''}<small>Saves this quote, opens the Library, brings you back</small></div>`
      + `<div class="footnote">Repairs sit inside the ${areaNoun()} with the paint lines. Hazards print a disclosure on the quote.</div>`;"""
rep(OLD_RFOOT, NEW_RFOOT)
rep("    const tasks = D.TASKS.filter(t => sheet.rgroup === 'All' || t.group === sheet.rgroup);",
    "    const tasks = D.TASKS.filter(t => sheet.rgroup === 'All' || t.group === sheet.rgroup).sort((p, q) => (q.id === sheet.newId ? 1 : 0) - (p.id === sheet.newId ? 1 : 0));")

# ---------------------------------------------------------------- the Library page + handlers
JS = r"""
// ============================================================ Add to the Library (Fix Round F part 2b)
let libpage = null;  // { from:{areaId, cat, q, tab}, item:{...} }
const LP_CATS = () => [...new Set(D.LIBRARY.map(x => x.category))];
function guessCategory(q){ const s = (q || '').toLowerCase(); const hit = LP_CATS().find(c => s.includes(c.toLowerCase().replace(/s$/, ''))); return hit || (/door|frame|skirt|arch|trim|window/.test(s) ? (LP_CATS().find(c => /door|trim|skirt/i.test(c)) || 'Walls') : /ceil/.test(s) ? 'Ceilings' : 'Walls'); }
const LP_GROUPS = () => [...new Set(D.TASKS.map(t => t.group))];
function openLibPage(from, name, mode = 'item'){
  const item = mode === 'task'
    ? { name: name || '', group: from.cat && from.cat !== 'All' ? from.cat : LP_GROUPS()[0], priced_by: 'each', rate: '', mins: '', about: '' }
    : { name: name || '', category: from.cat && from.cat !== 'All' ? from.cat : guessCategory(name), priced_by: 'm2', scope: sheetSide() || 'both', about: '', rates: { primer: '', c1: '', c2: '', c3: '' }, mins: { primer: '', c1: '', c2: '', c3: '' }, prep_rate: '', prep_mins: '', prep_about: '' };
  libpage = { from, mode, item, savedAt: new Date() };
  closeSheet(); say('Quote saved'); renderLibPage(); $('#libpage').hidden = false; window.scrollTo(0, 0); setTimeout(() => $('#lp_name')?.focus(), 50);
}
function closeLibPage(created){
  const f = libpage.from; const mode = libpage.mode; $('#libpage').hidden = true; libpage = null;
  openSheet(f.areaId, mode === 'task' ? 'repair' : 'library');
  if (mode === 'task'){ sheet.rgroup = created ? created.group : (f.cat || 'All'); } else { sheet.cat = created ? created.category : (f.cat || 'All'); }
  sheet.q = created ? '' : (f.q || ''); if (created) sheet.newId = created.id; renderSheet();
  if (created){ const el = $(`[data-testid="${mode === 'task' ? 'task-row' : 'lib-row'}-${created.id}"]`); if (el) el.scrollIntoView({ block: 'center' }); say(`${created.name} is in your Library — add it to ${f.areaId ? areaById(f.areaId).name : 'the job'}`); }
}
function renderLibPage(){
  const it = libpage.item; const a = libpage.from.areaId ? areaById(libpage.from.areaId) : null; const U = UNIT[it.priced_by]; const task = libpage.mode === 'task';
  const cats = LP_CATS(); const seg = (list, cur, attr) => `<div class="seg">${list.map(([k, l]) => `<button class="${cur === k ? 'on' : ''}" ${attr}="${k}">${l}</button>`).join('')}</div>`;
  const row = (k, t, h) => `<div class="t">${t}${h ? `<small>${h}</small>` : ''}</div><input type="number" data-lprate="${k}" value="${k === 'prep' ? it.prep_rate : it.rates[k]}" placeholder="$"><input type="number" data-lpmins="${k}" value="${k === 'prep' ? it.prep_mins : it.mins[k]}" placeholder="min">`;
  const time = libpage.savedAt.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  const head = `<div class="lp-return" data-testid="lp-return"><button id="lp_back" data-testid="lp-back">← Back to quote ${esc(est.estimate_number || 'EST-0192')}${a ? ` · ${esc(a.name)}` : ''}</button><span>You came here from the quote. Save and you go straight back with it ready to add.</span><span class="saved">${svg('checkc')}Quote saved ${time}</span></div>`;
  if (task){
    $('#libpage').innerHTML = `${head}<div class="lp-wrap">
    <div class="lp-crumb">Library › Repairs &amp; prep › <b>New task</b></div>
    <h1 class="lp-title">New repair task</h1>
    <div class="lp-sub">The same editor as Library › Repairs &amp; prep. Everything here can be changed later on the task's card.</div>
    <div class="lp-card"><h4>1 · What it is</h4>
      <div class="fr"><div class="fld"><label>Name</label><input type="text" id="lp_name" data-testid="lp-name" value="${esc(it.name)}" placeholder="e.g. Cornice crack fill"></div><div class="fld"><label>Group</label><select id="lp_cat" data-testid="lp-category">${LP_GROUPS().map(g => `<option ${it.group === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select></div></div>
      <div class="fr"><div class="fld"><label>Priced by</label>${seg([['each','each'],['m2','m²'],['lineal','lm'],['hour','hour']], it.priced_by, 'data-lppriced')}</div><div class="fld"><label>Rate and time per ${U}</label><div class="fr"><input type="number" id="lp_rate" data-testid="lp-rate" value="${it.rate}" placeholder="$"><input type="number" id="lp_mins" data-testid="lp-mins" value="${it.mins}" placeholder="min"></div></div></div>
      <div class="fld"><label>About</label><textarea id="lp_about" data-testid="lp-about" placeholder="What the crew does, in one line.">${esc(it.about)}</textarea></div>
    </div>
    <div class="lp-foot"><span class="err" id="lp_err" data-testid="lp-error" hidden></span><button class="btn btn-ghost" id="lp_cancel" data-testid="lp-cancel">Cancel</button><button class="btn btn-primary" id="lp_save" data-testid="lp-save">${svg('check')}Save task</button></div>
  </div>`; return;
  }
  $('#libpage').innerHTML = `${head}
  <div class="lp-wrap">
    <div class="lp-crumb">Library › Items › <b>New item</b></div>
    <h1 class="lp-title">New Library item</h1>
    <div class="lp-sub">The same editor as Library › Items. Everything here can be changed later on the item's card.</div>
    <div class="lp-card"><h4>1 · What it is</h4>
      <div class="fr"><div class="fld"><label>Name</label><input type="text" id="lp_name" data-testid="lp-name" value="${esc(it.name)}" placeholder="e.g. Bagged brick"></div><div class="fld"><label>Category</label><select id="lp_cat" data-testid="lp-category">${cats.map(c => `<option ${it.category === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
      <div class="fr"><div class="fld"><label>Priced by</label>${seg([['m2','m²'],['lineal','lm'],['each','each'],['hour','hour']], it.priced_by, 'data-lppriced')}</div><div class="fld"><label>Where</label>${seg([['interior','Inside'],['exterior','Outside'],['both','Both']], it.scope, 'data-lpscope')}</div></div>
      <div class="fld"><label>About</label><textarea id="lp_about" data-testid="lp-about" placeholder="One line the crew and you understand, e.g. Bagged brick, sealed then two coats.">${esc(it.about)}</textarea></div>
    </div>
    <div class="lp-card"><h4>2 · Rate and time per ${U}</h4>
      <div class="lp-grid"><div class="h">Step</div><div class="h r">$ / ${U}</div><div class="h r">min / ${U}</div>
        ${row('prep', 'Preparation', 'optional on each estimate line')}${row('primer', 'Primer', 'optional')}${row('c1', 'First coat', '1 coat total')}${row('c2', 'Second coat', '2 coats total · standard')}${row('c3', 'Third coat', '3 coats total')}
      </div>
      <div class="fld" style="margin-top:12px"><label>What the prep includes</label><textarea id="lp_prep" data-testid="lp-prep" placeholder="e.g. clean, fill nail holes, sand, spot prime bare patches.">${esc(it.prep_about)}</textarea></div>
    </div>
    <div class="lp-foot"><span class="err" id="lp_err" data-testid="lp-error" hidden></span><button class="btn btn-ghost" id="lp_cancel" data-testid="lp-cancel">Cancel</button><button class="btn btn-primary" id="lp_save" data-testid="lp-save">${svg('check')}Save item</button></div>
  </div>`;
}
function readLibPage(){ if (!libpage) return; const it = libpage.item; it.name = $('#lp_name').value; it.about = $('#lp_about').value;
  if (libpage.mode === 'task'){ it.group = $('#lp_cat').value; it.rate = $('#lp_rate').value; it.mins = $('#lp_mins').value; return; }
  it.category = $('#lp_cat').value; it.prep_about = $('#lp_prep').value; $$('[data-lprate]').forEach(i => { if (i.dataset.lprate === 'prep') it.prep_rate = i.value; else it.rates[i.dataset.lprate] = i.value; }); $$('[data-lpmins]').forEach(i => { if (i.dataset.lpmins === 'prep') it.prep_mins = i.value; else it.mins[i.dataset.lpmins] = i.value; }); }
function saveLibPage(){
  readLibPage(); const it = libpage.item; const name = it.name.trim();
  if (!name){ const e = $('#lp_err'); e.textContent = `Give the ${libpage.mode === 'task' ? 'task' : 'item'} a name.`; e.hidden = false; $('#lp_name').focus(); return; }
  const num = (v) => v === '' || v === null || v === undefined ? null : +v;
  if (libpage.mode === 'task'){ const t = { id: uid('t_'), group: it.group, name, priced_by: it.priced_by, rate: num(it.rate) || 0, mins: num(it.mins) || 0, about: it.about.trim() || 'Added from the quote.', hazard: false }; D.TASKS.push(t); TASK[t.id] = t; closeLibPage(t); return; }
  const item = { id: uid('lib_'), category: it.category, name, priced_by: it.priced_by, scope: it.scope, about: it.about.trim() || 'Added from the quote.', rates: { primer: num(it.rates.primer), c1: num(it.rates.c1), c2: num(it.rates.c2), c3: num(it.rates.c3) }, mins: { primer: num(it.mins.primer) || 0, c1: num(it.mins.c1) || 0, c2: num(it.mins.c2) || 0, c3: num(it.mins.c3) || 0 }, prep_rate: num(it.prep_rate), prep_mins: num(it.prep_mins) || 0, prep_about: it.prep_about.trim(), product: null };
  if (item.priced_by === 'hour' && item.rates.c1 === null) item.rates.c1 = null;
  D.LIBRARY.push(item); LIB[item.id] = item; closeLibPage(item);
}
document.addEventListener('click', (e) => {
  const c = (sel) => e.target.closest(sel); let x;
  if ((x = c('[data-lib-from-search]')) && sheet){ e.stopPropagation(); openLibPage({ areaId: sheet.areaId, cat: guessCategory(sheet.q), q: sheet.q }, sheet.q.trim()); return; }
  if ((x = c('[data-newlib]')) && sheet){ e.stopPropagation(); openLibPage({ areaId: sheet.areaId, cat: x.dataset.newlib, q: '' }, ''); return; }
  if ((x = c('[data-newtask]')) && sheet){ e.stopPropagation(); openLibPage({ areaId: sheet.areaId, cat: x.dataset.newtask, q: '' }, '', 'task'); return; }
  if (!libpage) return;
  if (c('#lp_cancel') || c('#lp_back')){ e.stopPropagation(); closeLibPage(null); return; }
  if (c('#lp_save')){ e.stopPropagation(); saveLibPage(); return; }
  if ((x = c('[data-lppriced]'))){ e.stopPropagation(); readLibPage(); libpage.item.priced_by = x.dataset.lppriced; renderLibPage(); return; }
  if ((x = c('[data-lpscope]'))){ e.stopPropagation(); readLibPage(); libpage.item.scope = x.dataset.lpscope; renderLibPage(); return; }
}, true);
document.addEventListener('keydown', (e) => { if (libpage && e.key === 'Escape'){ e.stopPropagation(); closeLibPage(null); } }, true);
document.body.insertAdjacentHTML('beforeend', '<div class="libpage" id="libpage" data-testid="libpage" hidden></div>');
"""
anchor = "document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ if (panel) closePanel();"
rep(anchor, JS + anchor)

# the base's own [data-addlib] handler adds the line; the arrowleft icon may not exist in the svg map → fallback handled inline
OUT.write_text(html)
print('wrote', OUT, len(html))
