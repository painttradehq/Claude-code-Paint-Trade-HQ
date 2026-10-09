#!/usr/bin/env python3
"""Owner (9 Oct): "now that there is more space, can we redesign it smarter and cleaner". Patches
estimate-builder-add-work.html (the 860 px sheet) into estimate-builder-add-work-v2.html:
- header: Add work to {area} · an "On the paper" line of what this area already has · ONE search across the
  Library and Repairs (no tab row);
- body: a left rail (Library categories with counts · Repairs groups · Custom line) and a two-column card grid;
- search results come from both the Library and Repairs, and end with "Add '{q}' as a custom line";
- the Custom line form sits in two columns; footer unchanged.
Same handlers and ids for adding, details, products, dims, area switch, Done/close. The new renderSheet() is
declared after the original, so it replaces it. Every rep() asserts the exact count."""
from pathlib import Path
SRC = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-add-work.html')
OUT = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-add-work-v2.html')
html = SRC.read_text()
def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:90])
    html = html.replace(a, b)

CSS = """
  /* ---- Add work v2: rail + cards + one search ---- */
  .sh-head .onpaper{ display:flex; flex-wrap:wrap; gap:6px; align-items:center; margin-top:10px; font-size:12px; color:var(--text-muted); }
  .sh-head .onpaper .c{ background:var(--surface-sunken); border:1px solid var(--border); border-radius:999px; padding:2px 9px; color:var(--text-secondary); font-size:12px; }
  .sh-head .sh-search{ margin-top:12px; }
  .sh-body{ display:flex; padding:0; }
  .sh-body .rail{ width:196px; flex-shrink:0; border-right:1px solid var(--border); background:var(--surface); padding:12px 10px 20px; overflow:auto; }
  .rail .lbl{ font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:var(--text-muted); padding:8px 10px 4px; }
  .rail button{ display:flex; align-items:center; gap:8px; width:100%; border:none; background:none; font:inherit; font-size:13px; font-weight:500; color:var(--text-primary); padding:7px 10px; border-radius:8px; text-align:left; cursor:pointer; }
  .rail button:hover{ background:var(--surface-sunken); }
  .rail button.on{ background:var(--accent-bg); color:var(--accent-ink); font-weight:600; }
  .rail button .n{ margin-left:auto; font-family:var(--font-mono); font-size:11px; color:var(--text-muted); }
  .rail button svg{ width:14px; height:14px; color:var(--text-muted); flex-shrink:0; }
  .rail button.on svg{ color:var(--accent); }
  .sh-body .content{ flex:1; min-width:0; overflow:auto; padding:18px 22px 24px; }
  .lgrp{ font-size:10.5px; font-weight:800; text-transform:uppercase; letter-spacing:.08em; color:var(--text-muted); margin:18px 0 8px; display:flex; align-items:center; gap:8px; }
  .lgrp:first-child{ margin-top:0; }
  .lgrp .n{ font-family:var(--font-mono); font-weight:500; letter-spacing:0; text-transform:none; }
  .lgrp .side{ margin-left:auto; font-weight:600; text-transform:none; letter-spacing:0; color:var(--accent); }
  .lgrid{ display:grid; grid-template-columns:repeat(2, minmax(0,1fr)); gap:10px; }
  .lcard{ display:grid; grid-template-columns:64px 1fr; gap:4px 12px; padding:12px; background:var(--surface); border:1px solid var(--border); border-radius:12px; align-items:start; }
  .lcard:hover{ border-color:var(--border-strong); }
  .lcard .th{ width:64px; height:46px; border-radius:8px; background:linear-gradient(135deg, #EDE8DA, #D9D2C1); display:flex; align-items:center; justify-content:center; color:#8A8272; overflow:hidden; grid-row:span 3; }
  .lcard .th img{ width:100%; height:100%; object-fit:cover; display:block; }
  .lcard .th svg{ width:18px; height:18px; }
  .lcard .th.rp{ background:linear-gradient(135deg, #F1EEFA, #DCD5EE); color:var(--accent); }
  .lcard .th.hz{ background:var(--danger-bg); color:var(--danger); }
  .lcard .n{ font-weight:600; font-size:13.5px; cursor:pointer; line-height:1.3; }
  .lcard .n:hover{ color:var(--accent); }
  .lcard .m{ font-size:12px; color:var(--text-secondary); }
  .lcard .m .np{ color:var(--danger); font-weight:600; }
  .lcard .d{ font-size:12px; color:var(--text-muted); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; line-height:1.4; }
  .lcard .foot{ grid-column:1 / -1; display:flex; justify-content:flex-end; margin-top:4px; }
  .lcard .add{ border:1px solid var(--border-strong); background:var(--surface); border-radius:8px; font:inherit; font-size:12.5px; font-weight:600; padding:6px 10px; color:var(--accent); display:inline-flex; align-items:center; gap:5px; white-space:nowrap; cursor:pointer; }
  .lcard .add:hover{ background:var(--accent-bg); border-color:var(--accent); }
  .lcard .add svg{ width:13px; height:13px; }
  .lcard .add.done{ background:var(--success-bg); border-color:transparent; color:var(--success); }
  .srchint{ margin-top:18px; padding:12px 14px; border:1px dashed var(--border-strong); border-radius:10px; font-size:13px; color:var(--text-secondary); display:flex; align-items:center; gap:10px; }
  .srchint b{ color:var(--text-primary); }
  .srchint button{ margin-left:auto; border:1px solid var(--border-strong); background:var(--surface); border-radius:8px; font:inherit; font-size:12.5px; font-weight:600; padding:6px 10px; color:var(--accent); cursor:pointer; white-space:nowrap; display:inline-flex; align-items:center; gap:5px; flex-shrink:0; }
  .srchint button svg{ width:13px; height:13px; }
  .srchint button:hover{ background:var(--accent-bg); border-color:var(--accent); }
  .form2{ display:grid; grid-template-columns:1fr 1fr; gap:14px 18px; }
  .form2 .span{ grid-column:1 / -1; }
  .form2 .fld label{ display:block; }
  .content .footnote{ font-size:12px; color:var(--text-muted); margin-top:16px; }
"""
rep("  .sh-foot{ padding:12px 26px;", CSS + "  .sh-foot{ padding:12px 26px;")

JS = r"""
// ---- Add work v2: one search, a rail, cards (declared after the original renderSheet, so it replaces it) ----
const SH_ICON = { library: 'layers', repair: 'wrench', custom: 'edit' };
function shLines(a){ return a ? est.lines.filter(l => l.area_id === a.id) : est.lines.filter(l => !l.area_id); }
function shCard(x, kind){
  if (kind === 'lib'){
    const np = x.priced_by === 'hour' ? !x.rates.c1 : x.rates.c2 === null; const rate = x.priced_by === 'hour' ? x.rates.c1 : x.rates.c2; const added = sheet.added[x.id]; const ph = LIB_PHOTO[x.name];
    return `<div class="lcard" data-testid="lib-row-${x.id}"><div class="th ${ph ? 'img' : ''}">${ph ? `<img src="library-photos/${ph}.webp" alt="" loading="lazy">` : svg('layers')}</div><div class="n" data-libdetail="${x.id}">${esc(x.name)}</div><div class="m">${np ? '<span class="np">No price yet</span>' : `${money(rate)}/${UNIT[x.priced_by]}`} · ${x.priced_by === 'hour' ? 'hourly' : '2 coats'}</div><div class="d">${esc(x.about)}</div><div class="foot"><button class="add ${added ? 'done' : ''}" data-addlib="${x.id}">${added ? svg('check') + 'Added' : svg('plus') + 'Add'}</button></div></div>`;
  }
  const t = x; const added = sheet.added[t.id];
  return `<div class="lcard" data-testid="task-row-${t.id}"><div class="th ${t.hazard ? 'hz' : 'rp'}">${svg(t.hazard ? 'warn' : 'wrench')}</div><div class="n">${esc(t.name)}</div><div class="m">${t.hazard ? 'Hazard flag' : `${money(t.rate)}/${UNIT[t.priced_by]} · ${t.mins} min`}</div><div class="d">${t.hazard ? 'You choose refer out, we do it, or subcontract' : esc(t.about || '')}</div><div class="foot"><button class="add ${added ? 'done' : ''}" data-addtask="${t.id}">${added ? svg('check') + 'Added' : svg('plus') + 'Add'}</button></div></div>`;
}
function renderSheet(){
  if (!sheet) return;
  if (sheet.rgroup === undefined) sheet.rgroup = 'All';
  const a = sheet.areaId ? areaById(sheet.areaId) : null;
  const areaOpts = `<select class="areasel" id="shArea">${est.areas.map(x => `<option value="${x.id}" ${x.id === sheet.areaId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select>`;
  const have = shLines(a); const shown = have.slice(0, 6);
  const onpaper = `<div class="onpaper" data-testid="sheet-on-paper">${have.length ? `On the paper: ${shown.map(l => `<span class="c">${esc(l.name)}</span>`).join('')}${have.length > 6 ? `<span>+${have.length - 6} more</span>` : ''}` : `Nothing in ${a ? esc(a.name) : 'the job'} yet.`}</div>`;
  const search = `<div class="sh-search">${svg('search')}<input id="shq" data-testid="sheet-search" placeholder="Search everything — walls, doors, cracks, mould, scaffold…" value="${esc(sheet.q)}"></div>`;
  const measureStrip = a && !measured(a) ? `<div class="measure" data-testid="measure-strip"><b>${esc(a.name)} has no measurements.</b> Enter them so m² and lineal quantities fill themselves.<div class="dims" data-dims="${a.id}"><label>W</label><input value="${a.w || ''}" data-dim="w" placeholder="0"><label>L</label><input value="${a.l || ''}" data-dim="l" placeholder="0"><label>H</label><input value="${a.h || ''}" data-dim="h" placeholder="0"><span class="u">m</span></div></div>` : '';
  // pools
  const side = sheetSide();
  const rank = (x) => !side || x.scope === 'both' || x.scope === side ? 0 : 1;
  const pool = libItemsForScope().slice().sort((p, q) => rank(p) - rank(q));
  const cats = [...new Set(pool.map(x => x.category))];
  const tgroups = [...new Set(D.TASKS.map(t => t.group))];
  const q = (sheet.q || '').trim().toLowerCase();
  const hit = (s) => s.toLowerCase().includes(q);
  // rail
  const railBtn = (tab, cat, label, n, icon) => `<button class="${!q && sheet.tab === tab && (tab === 'custom' || (tab === 'library' ? sheet.cat : sheet.rgroup) === cat) ? 'on' : ''}" data-nav="${tab}|${esc(cat)}" data-testid="nav-${tab}-${cat.toLowerCase().replace(/[^a-z]+/g, '-')}">${icon ? svg(icon) : ''}${esc(label)}${n !== undefined ? `<span class="n">${n}</span>` : ''}</button>`;
  const rail = `<div class="rail" data-testid="sheet-rail"><div class="lbl">Library</div>${railBtn('library', 'All', 'Everything', pool.length)}${cats.map(c => railBtn('library', c, c, pool.filter(x => x.category === c).length)).join('')}<div class="lbl">Repairs &amp; prep</div>${railBtn('repair', 'All', 'All repairs', D.TASKS.length)}${tgroups.map(g => railBtn('repair', g, g, D.TASKS.filter(t => t.group === g).length)).join('')}<div class="lbl">Anything else</div>${railBtn('custom', 'custom', 'Custom line', undefined, 'edit')}</div>`;
  // content
  let body = '';
  const grid = (items, kind) => `<div class="lgrid">${items.map(x => shCard(x, kind)).join('')}</div>`;
  if (q){
    const libs = pool.filter(x => hit(x.category + ' ' + x.name + ' ' + x.about));
    const tasks = D.TASKS.filter(t => hit(t.group + ' ' + t.name + ' ' + (t.about || '')));
    const lg = [...new Set(libs.map(x => x.category))];
    body = (libs.length ? lg.map(g => `<div class="lgrp">${esc(g)} <span class="n">${libs.filter(x => x.category === g).length}</span></div>${grid(libs.filter(x => x.category === g), 'lib')}`).join('') : '')
      + (tasks.length ? `<div class="lgrp">Repairs &amp; prep <span class="n">${tasks.length}</span></div>${grid(tasks, 'task')}` : '')
      + (!libs.length && !tasks.length ? `<div class="aempty">Nothing in the Library or Repairs matches “${esc(sheet.q)}”.</div>` : '')
      + `<div class="srchint" data-testid="search-custom">Not in the Library? <b>${esc(sheet.q)}</b> can be a custom line — labour, material, equipment or a trade's sub-quote.<button data-custom-from-search="1" data-testid="search-custom-btn">${svg('plus')}Add as a custom line</button></div>`;
  } else if (sheet.tab === 'library'){
    const items = pool.filter(x => sheet.cat === 'All' || x.category === sheet.cat);
    const groups = [...new Set(items.map(x => x.category))];
    const otherSideFrom = side ? groups.find(g => items.filter(x => x.category === g).every(x => rank(x) === 1)) : null;
    body = groups.map(g => `<div class="lgrp">${esc(g)} <span class="n">${items.filter(x => x.category === g).length}</span>${g === otherSideFrom ? `<span class="side" data-testid="sheet-other-side">${side === 'interior' ? 'Outside the house' : 'Inside the house'} — also in your Library</span>` : ''}</div>${grid(items.filter(x => x.category === g), 'lib')}`).join('')
      + `<div class="footnote">Rates and minutes come from your Library. Click a name to change coats, primer, prep or product before adding.</div>`;
  } else if (sheet.tab === 'repair'){
    const tasks = D.TASKS.filter(t => sheet.rgroup === 'All' || t.group === sheet.rgroup);
    const groups = [...new Set(tasks.map(t => t.group))];
    body = groups.map(g => `<div class="lgrp">${esc(g)} <span class="n">${tasks.filter(t => t.group === g).length}</span></div>${grid(tasks.filter(t => t.group === g), 'task')}`).join('')
      + `<div class="footnote">Repairs sit inside the ${areaNoun()} with the paint lines. Hazards print a disclosure on the quote.</div>`;
  } else {
    const c = sheet.custom; const isTrade = c.category === 'trade'; const isMat = c.category === 'material';
    const kinds = [['labour','Labour','hammer'],['material','Material','box'],['equipment','Equipment','truck'],['trade','Trade','users']].map(([k,l,i]) => `<button class="${c.category === k ? 'on' : ''}" data-kind="${k}" data-testid="kind-${k}">${svg(i)}${l}</button>`).join('');
    const price = isTrade ? r2((+c.sub_cost || 0) * (1 + (+c.markup_pct || 0) / 100)) : (+c.rate || 0);
    body = `<div class="form2">
      <div class="fld span"><label>Kind</label><div class="kinds">${kinds}</div><div class="hint">${isTrade ? 'A sub-quote from another trade, marked up and shown as one line.' : isMat ? 'Paint or sundries you supply, shown under Materials on the quote.' : c.category === 'equipment' ? 'Hire or plant, shown as a line the client can see.' : 'Anything you do that is not a Library item.'}</div></div>
      ${isMat ? `<div class="fld span"><label>From your Products</label><div class="chips" style="margin:0">${D.PRODUCTS.map(p => `<button class="chip ${c.product === p.id ? 'on' : ''}" data-prod="${p.id}">${esc(p.brand)} ${esc(p.name)} ${esc(p.pack)}</button>`).join('')}</div></div>` : ''}
      <div class="fld"><label>Description</label><input type="text" id="cu_name" data-testid="custom-name" value="${esc(c.name || '')}" placeholder="${isTrade ? 'e.g. Plasterer: patch and set east wall' : isMat ? 'e.g. Dulux Wash&Wear 10L' : c.category === 'equipment' ? 'e.g. Scaffold hire for stairwell' : 'e.g. Pressure wash driveway'}"></div>
      <div class="fr3"><div class="fld"><label>Qty</label><input type="number" id="cu_qty" value="${c.qty}"></div><div class="fld"><label>Unit</label><select id="cu_unit" data-testid="custom-unit">${['each','m2','lineal','hour','day','job'].map(u => `<option value="${u}" ${c.unit === u ? 'selected' : ''}>${UNIT[u]}</option>`).join('')}</select></div>
      ${isTrade ? `<div class="fld"><label>Sub-quote $</label><input type="number" id="cu_sub" value="${c.sub_cost || ''}" placeholder="0"></div>` : `<div class="fld"><label>Rate $ per ${UNIT[c.unit]}</label><input type="number" id="cu_rate" value="${c.rate || ''}" placeholder="0"></div>`}</div>
      ${isTrade ? `<div class="fld"><label>Markup %</label><input type="number" id="cu_markup" value="${c.markup_pct ?? 15}"></div><div class="fld"><label>Shown to client</label><div id="cu_preview" data-testid="trade-shown" style="font-family:var(--font-mono);font-weight:700;padding:8px 0">${money(price)} per ${UNIT[c.unit]}</div></div>` : ''}
      ${c.category === 'labour' ? `<div class="fld"><label>Labour hours (for scheduling, not shown)</label><input type="number" id="cu_hours" value="${c.hours || ''}" placeholder="0"></div>` : ''}
      <div class="fld ${c.category === 'labour' ? '' : 'span'}"><label>Note</label><input type="text" id="cu_note" value="${esc(c.notes || '')}" placeholder="Optional"><label class="cb" style="margin-top:6px;font-weight:500"><input type="checkbox" id="cu_show" data-testid="custom-show" ${c.note_show_on_quote ? 'checked' : ''}>Show the note on the quote</label></div>
    </div>`;
  }
  const foot = sheet.tab === 'custom' && !q ? `<div class="sh-foot"><span class="sum">Adds one line to ${a ? esc(a.name) : 'the whole job'}</span><button class="btn btn-primary" id="cu_add" data-testid="custom-add">${svg('plus')}Add line</button></div>`
    : `<div class="sh-foot"><span class="sum">${Object.keys(sheet.added).length ? `<b>${Object.keys(sheet.added).length}</b> added this session · quote now <b>${money(T().total)}</b>` : `Quote total <b>${money(T().total)}</b>`}</span><button class="btn btn-ghost" id="shDone" data-testid="sheet-done">Done</button></div>`;
  $('#sheet').innerHTML = `<div class="sh-head"><div class="row"><h2>Add work to ${areaOpts}</h2><button class="x" id="shClose">${svg('close')}</button></div>${onpaper}${search}</div><div class="sh-body">${rail}<div class="content" data-testid="sheet-content">${measureStrip}${body}</div></div>${foot}`;
}
document.addEventListener('click', (e) => {
  if (!sheet) return;
  const nav = e.target.closest('[data-nav]'); if (nav){ e.stopPropagation(); const [tab, cat] = nav.dataset.nav.split('|'); sheet.tab = tab; if (tab === 'library') sheet.cat = cat; if (tab === 'repair') sheet.rgroup = cat; sheet.q = ''; renderSheet(); return; }
  const cf = e.target.closest('[data-custom-from-search]'); if (cf){ e.stopPropagation(); sheet.custom.name = sheet.q.trim(); sheet.tab = 'custom'; sheet.q = ''; renderSheet(); $('#cu_name')?.focus(); return; }
}, true);
"""
anchor = "document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ if (panel) closePanel();"
assert html.count(anchor) == 1
html = html.replace(anchor, JS + anchor)
OUT.write_text(html)
print('wrote', OUT, len(html))
