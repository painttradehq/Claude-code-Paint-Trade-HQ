"""Round 95 — build calendar-end-date.html from calendar-layout.html (Round 91): the New event drawer gains "Ends on",
multi-day entries draw as one joined bar in Month and in the Week/Day all-day row, and an entry opens in a drawer with its range."""
import pathlib, re
SRC = pathlib.Path(__file__).resolve().parent.parent / 'calendar-layout.html'
OUT = SRC.with_name('calendar-end-date.html')
s = SRC.read_text()

def rep(a, b, count=1):
    global s
    assert s.count(a) == count, (a[:70], s.count(a))
    s = s.replace(a, b)

rep('<title>Round 91 — Calendar layout — Paint Trade HQ</title>', '<title>Round 95 — Calendar: an end date on events — Paint Trade HQ</title>')

# ── CSS: joined bars, the drawer ─────────────────────────────────────────────
rep('.more{ font-size:11.5px; color:var(--accent); font-weight:600; padding-left:4px; }',
    '.more{ font-size:11.5px; color:var(--accent); font-weight:600; padding-left:4px; }\n'
    '/* Round 95 — a multi-day entry is one bar: the chips of one entry touch across the cell borders */\n'
    '.chip.sp-start, .chip.sp-mid{ margin-right:-7px; border-top-right-radius:0; border-bottom-right-radius:0; }\n'
    '.chip.sp-mid, .chip.sp-end{ margin-left:-7px; border-top-left-radius:0; border-bottom-left-radius:0; }\n'
    '.chip.sp-mid, .chip.sp-end{ color:transparent !important; } .chip.sp-mid .t, .chip.sp-end .t{ display:none; }\n'
    '.tgrid .slot .chip.sp-start, .tgrid .slot .chip.sp-mid{ margin-right:-5px; } .tgrid .slot .chip.sp-mid, .tgrid .slot .chip.sp-end{ margin-left:-5px; }\n'
    '/* the event drawer (CalDrawer: the right-hand panel) */\n'
    '.scrim{ position:fixed; inset:0; background:rgba(20,16,10,.28); z-index:40; }\n'
    '.panel{ position:fixed; top:0; right:0; bottom:0; width:480px; background:var(--surface); border-left:1px solid var(--border); box-shadow:-16px 0 40px rgba(20,16,10,.12); z-index:41; display:flex; flex-direction:column; }\n'
    '.panel .ph{ padding:18px 22px 14px; border-bottom:1px solid var(--border); display:flex; align-items:flex-start; gap:12px; } .panel .ph h2{ margin:0; font-family:var(--font-display); font-weight:600; font-size:22px; } .panel .ph .sub{ color:var(--text-secondary); font-size:13px; margin-top:3px; display:flex; align-items:center; gap:6px; } .panel .ph .sub i{ width:10px; height:10px; border-radius:3px; display:inline-block; } .panel .ph .x{ margin-left:auto; border:none; background:none; font-size:20px; color:var(--text-muted); padding:0 4px; }\n'
    '.panel .pb{ flex:1; overflow-y:auto; padding:18px 22px; display:flex; flex-direction:column; gap:14px; min-height:0; }\n'
    '.f label{ display:block; font-size:12.5px; font-weight:600; margin-bottom:5px; } .f .hint{ font-size:12px; color:var(--text-muted); margin-top:4px; line-height:1.45; }\n'
    '.inp{ width:100%; height:38px; padding:0 12px; border-radius:8px; border:1px solid var(--border-strong); background:var(--surface); font:inherit; font-size:14px; color:var(--text-primary); } .inp:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-bg); } .inp.err{ border-color:var(--danger); }\n'
    '.two{ display:grid; grid-template-columns:1fr 1fr; gap:12px; } .chk{ display:flex; align-items:center; gap:8px; font-size:14px; } .chk input{ width:18px; height:18px; accent-color:var(--accent); }\n'
    '.panel .pf{ padding:14px 22px; border-top:1px solid var(--border); display:flex; align-items:center; gap:10px; } .panel .pf .sp{ flex:1; }\n'
    '.kv{ display:grid; grid-template-columns:90px 1fr; gap:8px 12px; font-size:14px; } .kv b{ font-weight:600; color:var(--text-secondary); font-size:12.5px; padding-top:1px; }\n'
    '@media (max-width:1100px){ .panel{ width:440px; } }')

# ── data: a sample two-day crew event, a job id list for Linked job ───────────
rep("  { id:'m2', k:'meetings', title:'Colour consult · Okafor', date:'2026-10-23', time:'14:00', dur:1 },",
    "  { id:'m2', k:'meetings', title:'Colour consult · Okafor', date:'2026-10-23', time:'14:00', dur:1 },\n"
    "  { id:'e1', k:'project',  title:'Whitfield · deck restoration (Mia, Daniel)', date:'2026-10-20', end:'2026-10-22', time:'07:30', endt:'15:30', job:'j1' },")

# ── month: joined-bar classes, titles only at the start of a run ──────────────
rep("function chip(e){ const c = CAT[e.k]; return `<div class=\"chip ${c.hollow ? 'hollow' : ''}\" data-open=\"${e.id}\" data-cat=\"${e.k}\" style=\"background:${c.bg};color:${c.fg}\">${e.time ? `<span class=\"t\">${fmtT(e.time)}</span>` : ''}<span style=\"overflow:hidden;text-overflow:ellipsis\">${e.title}</span></div>`; }",
    "const spanCls = (e, k, weekStart) => { if (!e.end || e.end === e.date) return ''; const first = k === e.date, last = k === e.end; if (first && last) return ''; if (first) return 'sp-start'; if (last) return 'sp-end'; return 'sp-mid'; };\n"
    "function chip(e, k, opts = {}){ const c = CAT[e.k]; const sp = k ? spanCls(e, k) : ''; const showTitle = !sp || sp === 'sp-start' || (opts.weekStart && k === opts.weekStart); return `<div class=\"chip ${c.hollow ? 'hollow' : ''} ${sp} ${showTitle && sp && sp !== 'sp-start' ? 'sp-label' : ''}\" data-open=\"${e.id}\" data-cat=\"${e.k}\" data-span=\"${sp || 'one'}\" style=\"background:${c.bg};color:${c.fg}\">${e.time && !sp ? `<span class=\"t\">${fmtT(e.time)}</span>` : ''}<span style=\"overflow:hidden;text-overflow:ellipsis\">${e.title}</span></div>`; }")
# a bar continuing into a new week row shows its title again on the Monday
rep(".chip.sp-mid, .chip.sp-end{ color:transparent !important; } .chip.sp-mid .t, .chip.sp-end .t{ display:none; }",
    ".chip.sp-mid, .chip.sp-end{ color:transparent !important; } .chip.sp-mid .t, .chip.sp-end .t{ display:none; } .chip.sp-label{ color:inherit !important; }")
rep("const items = vis.filter(e => onDay(e, k)).sort((a, b) => (a.end ? 0 : 1) - (b.end ? 0 : 1) || (a.time || '').localeCompare(b.time || '')); const shown = items.slice(0, 3); h += `<div class=\"cell ${k.slice(0, 7) !== anchor.slice(0, 7) ? 'other' : ''} ${k === TODAY ? 'today' : ''}\" data-day=\"${k}\" data-testid=\"month-cell-${k}\"><span class=\"d\">${+k.slice(8)}</span>${shown.map(chip).join('')}",
    "const items = vis.filter(e => onDay(e, k)).sort((a, b) => (a.end ? 0 : 1) - (b.end ? 0 : 1) || (a.date + a.id).localeCompare(b.date + b.id) || (a.time || '').localeCompare(b.time || '')); const shown = items.slice(0, 3); const weekStart = monday(k); h += `<div class=\"cell ${k.slice(0, 7) !== anchor.slice(0, 7) ? 'other' : ''} ${k === TODAY ? 'today' : ''}\" data-day=\"${k}\" data-testid=\"month-cell-${k}\"><span class=\"d\">${+k.slice(8)}</span>${shown.map(e => chip(e, k, { weekStart })).join('')}")
# week/day all-day row: the same joined chips; timed items of a span show on each day of the span
rep("${vis.filter(e => onDay(e, d) && !e.time).map(chip).join('')}", "${vis.filter(e => onDay(e, d) && (!e.time || (e.end && e.end !== e.date))).map(e => chip(e, d, { weekStart: start })).join('')}")
rep("const blocks = vis.filter(e => e.date === d && e.time && +e.time.slice(0, 2) === hr);", "const blocks = vis.filter(e => onDay(e, d) && e.time && !(e.end && e.end !== e.date) && +e.time.slice(0, 2) === hr);")

# ── the drawer: new / edit / view ────────────────────────────────────────────
rep("<div class=\"toast\" id=\"toast\"></div>", "<div id=\"pbox\"></div>\n<div class=\"toast\" id=\"toast\"></div>")
rep("function say(m){", r'''const fmtRange = (e) => { const a = parse(e.date), b = parse(e.end || e.date); const o = { weekday: 'short', day: 'numeric', month: 'short' }; return e.end && e.end !== e.date ? `${a.toLocaleDateString('en-AU', o)} – ${b.toLocaleDateString('en-AU', o)}` : a.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' }); };
const JOBS = [['', 'None'], ['j1', 'Whitfield · interior repaint'], ['j2', 'Okafor · exterior']];
let drawer = null; // { mode: 'new'|'edit'|'view', e }
function openDrawer(mode, e){
  drawer = { mode, e: e ? { ...e } : { id: null, k: 'project', title: '', date: anchor, end: anchor, time: '09:00', endt: '10:00', allday: false, job: '' } };
  const d = drawer.e; const c = CAT[d.k] || CATS[0];
  if (mode === 'view'){
    $('#pbox').innerHTML = `<div class="scrim" data-testid="ev-scrim"></div><aside class="panel" data-testid="ev-drawer"><div class="ph"><div><h2>${d.title}</h2><div class="sub"><i style="background:${c.fg}"></i>${c.label}</div></div><button class="x" data-testid="ev-close" aria-label="Close">×</button></div>
      <div class="pb"><div class="kv"><b>When</b><span data-testid="ev-when">${fmtRange(d)}${d.allday || !d.time ? ' · all day' : ` · ${fmtT(d.time)}${d.endt ? '–' + fmtT(d.endt) : ''}${d.end && d.end !== d.date ? ' each day' : ''}`}</span>${d.job ? `<b>Linked job</b><span>${JOBS.find(j => j[0] === d.job)?.[1] || ''}</span>` : ''}${d.crew ? `<b>Crew</b><span>${d.crew}</span>` : ''}</div></div>
      <div class="pf"><button class="btn ghost" data-testid="ev-delete" style="color:var(--danger)">Delete</button><span class="sp"></span><button class="btn" data-testid="ev-edit">Edit</button></div></aside>`;
    return;
  }
  const dates = `<div class="two"><div class="f"><label for="ev-date">Date</label><input class="inp" type="date" lang="en-AU" id="ev-date" data-testid="ev-date" value="${d.date}"></div><div class="f"><label for="ev-end">Ends on</label><input class="inp" type="date" lang="en-AU" id="ev-end" data-testid="ev-end" value="${d.end || d.date}" min="${d.date}"><div class="hint" id="ev-days" data-testid="ev-days"></div></div></div>`;
  $('#pbox').innerHTML = `<div class="scrim" data-testid="ev-scrim"></div><aside class="panel" data-testid="ev-drawer" role="dialog" aria-label="${mode === 'new' ? 'New event' : 'Edit event'}"><div class="ph"><div><h2>${mode === 'new' ? 'New event' : 'Edit event'}</h2><div class="sub" id="ev-sub"><i style="background:${c.fg}"></i>${fmtRange(d)}</div></div><button class="x" data-testid="ev-close" aria-label="Close">×</button></div>
    <div class="pb">
      <div class="f"><label for="ev-title">Title</label><input class="inp" id="ev-title" data-testid="ev-title" placeholder="e.g. Site visit — Sarah Mitchell" value="${d.title.replace(/"/g, '&quot;')}"></div>
      ${dates}
      <div class="two"><div class="f"><label for="ev-cat">Category</label><select class="inp" id="ev-cat" data-testid="ev-cat">${CATS.filter(x => !x.hollow).map(x => `<option value="${x.k}" ${x.k === d.k ? 'selected' : ''}>${x.label}</option>`).join('')}</select></div><div class="f"><label>&nbsp;</label><label class="chk"><input type="checkbox" id="ev-allday" data-testid="ev-allday" ${d.allday ? 'checked' : ''}> All day</label></div></div>
      <div class="two" id="ev-times" ${d.allday ? 'hidden' : ''}><div class="f"><label for="ev-start">Starts</label><input class="inp" type="time" id="ev-start" data-testid="ev-start" value="${d.time || '09:00'}"></div><div class="f"><label for="ev-endt">Ends</label><input class="inp" type="time" id="ev-endt" data-testid="ev-endt" value="${d.endt || '10:00'}"><div class="hint" id="ev-timehint"></div></div></div>
      <div class="f"><label for="ev-job">Linked job</label><select class="inp" id="ev-job" data-testid="ev-job">${JOBS.map(j => `<option value="${j[0]}" ${j[0] === (d.job || '') ? 'selected' : ''}>${j[1]}</option>`).join('')}</select></div>
      <div class="muted" style="font-size:13px;color:var(--accent);font-weight:600;cursor:pointer">More options ▾</div>
    </div>
    <div class="pf"><span class="sp"></span><button class="btn" data-testid="ev-cancel">Cancel</button><button class="btn primary" data-testid="ev-save">${mode === 'new' ? 'Add to calendar' : 'Save'}</button></div></aside>`;
  syncDrawer();
}
function readDrawer(){ const v = (id) => $('#' + id)?.value || ''; const d = drawer.e; d.title = v('ev-title').trim(); d.date = v('ev-date') || d.date; d.end = v('ev-end') || d.date; if (d.end < d.date) d.end = d.date; d.k = v('ev-cat') || d.k; d.allday = $('#ev-allday').checked; d.time = d.allday ? '' : v('ev-start'); d.endt = d.allday ? '' : v('ev-endt'); d.job = v('ev-job'); return d; }
function syncDrawer(){ if (!drawer || drawer.mode === 'view') return; const d = readDrawer(); const endEl = $('#ev-end'); endEl.min = d.date; if (endEl.value < d.date) endEl.value = d.date; const n = Math.round((parse(d.end) - parse(d.date)) / 86400000) + 1; $('#ev-days').textContent = n > 1 ? `${n} days · one bar across them` : 'Same day'; $('#ev-sub').innerHTML = `<i style="background:${(CAT[d.k] || CATS[0]).fg}"></i>${fmtRange(d)}`; $('#ev-times').hidden = d.allday; const th = $('#ev-timehint'); if (th) th.textContent = n > 1 && !d.allday ? 'These times apply on each day' : ''; }
function closeDrawer(){ $('#pbox').innerHTML = ''; drawer = null; }
function saveDrawer(){ const d = readDrawer(); if (!d.title){ $('#ev-title').classList.add('err'); say('Give the event a title.'); return; } const dur = d.time && d.endt ? Math.max(0.5, (+d.endt.slice(0, 2) + (+d.endt.slice(3)) / 60) - (+d.time.slice(0, 2) + (+d.time.slice(3)) / 60)) : 1; const row = { id: d.id || ('n' + Math.random().toString(36).slice(2, 7)), k: d.k, title: d.title, date: d.date, end: d.end !== d.date ? d.end : undefined, time: d.allday ? undefined : d.time, endt: d.allday ? undefined : d.endt, dur, job: d.job || undefined, allday: d.allday }; const i = E.findIndex(x => x.id === row.id); if (i >= 0) E[i] = { ...E[i], ...row }; else E.push(row); closeDrawer(); render(); say(i >= 0 ? 'Saved.' : (row.end ? `Added — ${fmtRange(row)}, one bar.` : 'Added to the calendar.')); }
function say(m){''')
rep("  if ((x = c('[data-open]'))){ say(`Opens: ${E.find(y => y.id === x.dataset.open).title}`); return; }",
    "  if (c('[data-testid=\"ev-cancel\"]') || c('[data-testid=\"ev-close\"]') || c('[data-testid=\"ev-scrim\"]')){ closeDrawer(); return; }\n"
    "  if (c('[data-testid=\"ev-save\"]')){ saveDrawer(); return; }\n"
    "  if (c('[data-testid=\"ev-edit\"]')){ openDrawer('edit', drawer.e); return; }\n"
    "  if (c('[data-testid=\"ev-delete\"]')){ const id = drawer.e.id; const i = E.findIndex(y => y.id === id); if (i >= 0) E.splice(i, 1); closeDrawer(); render(); say('Deleted.'); return; }\n"
    "  if (c('.panel')) return;\n"
    "  if ((x = c('[data-open]'))){ const ev = E.find(y => y.id === x.dataset.open); if (['project', 'meetings', 'reminder'].includes(ev.k) && !ev.crew) openDrawer('view', ev); else say(`Opens: ${ev.title}`); return; }")
rep("  if ((x = c('.slot')) && x.dataset.hour){ say(`New event · ${fmtDay(x.dataset.day)} at ${fmtT(pad(x.dataset.hour) + ':00')}`); return; }\n  if (c('#newEvent')){ say('New event dialog (as today)'); return; }",
    "  if ((x = c('.slot')) && x.dataset.hour){ openDrawer('new', { id: null, k: 'meetings', title: '', date: x.dataset.day, end: x.dataset.day, time: pad(x.dataset.hour) + ':00', endt: pad(+x.dataset.hour + 1) + ':00', allday: false, job: '' }); return; }\n"
    "  if (c('#newEvent')){ openDrawer('new'); return; }")
rep("document.addEventListener('input', (e) => { if (e.target.id === 'q'){ q = e.target.value.trim().toLowerCase(); render(); } });",
    "document.addEventListener('input', (e) => { if (e.target.id === 'q'){ q = e.target.value.trim().toLowerCase(); render(); } if (e.target.closest && e.target.closest('.panel')) syncDrawer(); });\n"
    "document.addEventListener('change', (e) => { if (e.target.closest && e.target.closest('.panel')) syncDrawer(); });")
rep("document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ $('#showPop').hidden = true; $('#attPop').hidden = true; } });",
    "document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ if (drawer){ closeDrawer(); return; } $('#showPop').hidden = true; $('#attPop').hidden = true; } });")
# the cell click must not fire when a chip inside it was clicked (the chip opens the drawer first — handled above by return)
OUT.write_text(s)
print('wrote', OUT.name, len(s))
