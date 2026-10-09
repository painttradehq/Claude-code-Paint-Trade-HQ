#!/usr/bin/env python3
"""Start fresh (owner, 7 Oct): Settings › Platform gains a fourth tab that removes every job record from the signed-in
business — clients, quotes, invoices, projects, crew (optional) — keeping settings, products and templates. Patches the
Platform settings prototype as text."""
from pathlib import Path
SRC = Path('/home/user/Claude-code-Paint-Trade-HQ/settings-platform-redesign.html')
OUT = Path('/home/user/Claude-code-Paint-Trade-HQ/start-fresh-panel.html')
html = SRC.read_text()

def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:90])
    html = html.replace(a, b)

X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>'
TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"/></svg>'
DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/></svg>'

# A. the tab
rep('      <button data-tab="feedback" data-testid="platform-tab-feedback">Feedback <span class="n" id="nFb"></span></button>',
    '      <button data-tab="feedback" data-testid="platform-tab-feedback">Feedback <span class="n" id="nFb"></span></button>\n      <button data-tab="reset" data-testid="platform-tab-reset">Start fresh</button>')
# B. the tab body
rep('    </div>\n  </div>\n\n  <div class="mscrim" id="invModalScrim" hidden>',
    '''    </div>
    <div class="ptab" data-tab="reset" data-testid="sf-page">
      <div class="tb"><div class="count" id="sfCount" data-testid="sf-count"></div><button class="btn btn-danger" id="sfOpen" data-testid="sf-open">''' + TRASH + ''' Start fresh…</button></div>
      <p class="pgs" style="margin:0 0 12px">Removes every job record from <b>Sano Painting &amp; Decorating</b> so the business starts with a clean slate. Settings, products, templates and your account stay. Only you can do this, and only for your own business.</p>
      <div class="tbl sf"><div class="tr h"><div class="c">What goes</div><div class="c r">Records</div></div><div id="sfRows"></div></div>
      <p class="pgs" style="margin:12px 0 0" id="sfStays"></p>
      <div id="sfLast" data-testid="sf-last" hidden class="hint-line" style="margin-top:14px"></div>
    </div>
  </div>

  <div class="mscrim" id="invModalScrim" hidden>''')
# C. the right-side panel
rep('  <div class="dscrim" id="fbScrim" hidden>',
    '''  <div class="dscrim" id="sfScrim" hidden><div class="drawer" data-testid="sf-drawer">
    <div class="dhead"><div class="t"><h2>Start fresh</h2><div class="s">Sano Painting &amp; Decorating · removes job records, keeps settings</div></div><button class="dclose" id="sfClose" data-testid="sf-close">''' + X + '''</button></div>
    <div class="dbody" id="sfForm">
      <div class="sf-sec"><div class="lbl">What goes</div><div class="sf-list" id="sfGoes"></div></div>
      <label class="sf-cb"><input type="checkbox" id="sfEmp" data-testid="sf-employees"><span><b>Also remove crew and office staff</b><small>Their accounts and everything about them: timesheets, sign-ins, onboarding documents, contracts, leave, ratings, training progress, equipment issued. They would need to be onboarded again.</small></span></label>
      <label class="sf-cb"><input type="checkbox" id="sfNum" data-testid="sf-numbering"><span><b>Reset quote and invoice numbering to 1</b><small>Off: the next quote and invoice continue from today's numbers.</small></span></label>
      <div class="sf-sec"><div class="lbl">What stays</div><div class="sf-stay" id="sfStayList"></div></div>
      <div class="hint-line" style="margin:0">Before anything is removed, a full export of these records is saved and kept for 30 days. You can download it from the Start fresh tab.</div>
      <div class="sf-sec"><div class="lbl">Type the business name to confirm</div><input id="sfConfirm" data-testid="sf-confirm" placeholder="Sano Painting & Decorating" autocomplete="off"></div>
    </div>
    <div class="dbody" id="sfRun" hidden>
      <div class="sf-prog"><div class="bar"><i id="sfBar"></i></div><div class="t" id="sfProgText" data-testid="sf-progress"></div></div>
      <div class="hint-line" style="margin:0">Runs in the background. You can close this and come back; the tab shows the progress.</div>
    </div>
    <div class="dbody" id="sfDone" hidden>
      <div class="sf-ok" data-testid="sf-done"><b id="sfDoneTitle"></b><div class="sf-list" id="sfDoneList"></div></div>
      <a class="btn btn-ghost" id="sfExport" data-testid="sf-export" href="#">''' + DL + ''' Download the export · kept until 6 Nov 2026</a>
    </div>
    <div class="dfoot" id="sfFoot"><button class="btn btn-ghost" id="sfCancel">Cancel</button><span style="flex:1"></span><button class="btn btn-danger" id="sfGo" data-testid="sf-go" disabled>''' + TRASH + ''' Start fresh</button></div>
    <div class="dfoot" id="sfFootDone" hidden><span style="flex:1"></span><button class="btn btn-primary" id="sfDoneBtn" data-testid="sf-done-btn">Done</button></div>
  </div></div>

  <div class="dscrim" id="fbScrim" hidden>''')
# D. CSS
rep('  .ptab{ display:none; } .ptab.on{ display:block; }',
    '''  .ptab{ display:none; } .ptab.on{ display:block; }
  .btn-danger{ background:var(--danger); color:#fff; } .btn-danger:disabled{ opacity:.45; cursor:not-allowed; }
  .tbl.sf .tr{ grid-template-columns:1fr 120px; } .tbl.sf .c.r{ text-align:right; font-family:var(--font-mono); } .tbl.sf .tr.muted .c{ color:var(--text-muted); }
  .sf-sec .lbl{ font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px; }
  .sf-list{ display:flex; flex-direction:column; gap:3px; font-size:13px; } .sf-list div{ display:flex; justify-content:space-between; gap:12px; } .sf-list div span:last-child{ font-family:var(--font-mono); color:var(--text-secondary); } .sf-list div.off{ color:var(--text-muted); text-decoration:line-through; }
  .sf-stay{ font-size:13px; color:var(--text-secondary); line-height:1.55; }
  .sf-cb{ display:flex; gap:10px; align-items:flex-start; cursor:pointer; padding:10px 12px; border:1px solid var(--border); border-radius:10px; background:var(--surface); } .sf-cb input{ accent-color:var(--accent); width:18px; height:18px; margin-top:2px; } .sf-cb b{ display:block; font-size:13.5px; } .sf-cb small{ display:block; font-size:12px; color:var(--text-muted); margin-top:2px; line-height:1.45; }
  #sfConfirm{ width:100%; box-sizing:border-box; font:inherit; font-size:14px; padding:10px 12px; border:1px solid var(--border-strong); border-radius:8px; background:var(--surface); } #sfConfirm:focus{ outline:none; border-color:var(--accent); }
  .sf-prog .bar{ height:8px; border-radius:4px; background:var(--surface-sunken); overflow:hidden; margin-bottom:8px; } .sf-prog .bar i{ display:block; height:100%; width:0; background:var(--accent); transition:width .25s; } .sf-prog .t{ font-size:13.5px; font-weight:600; }
  .sf-ok{ background:var(--success-bg); border:1px solid #BFE3CB; border-radius:10px; padding:14px; } .sf-ok b{ display:block; font-size:14px; color:var(--success); margin-bottom:8px; }''')
# E. deep link
rep("showTab(['signups', 'invites', 'feedback'].includes(params.get('tab'))", "showTab(['signups', 'invites', 'feedback', 'reset'].includes(params.get('tab'))")
# F. behaviour
rep('</body>', '''<script>
// ---- Start fresh (owner, 7 Oct) ----
const BIZ = 'Sano Painting & Decorating';
const SF_JOB = [
  ['clients', 'Clients, leads and their contacts', 11],
  ['estimates', 'Quotes and estimates, with photos and attachments', 66],
  ['invoices', 'Invoices, credit notes and recorded payments', 23],
  ['projects', 'Projects, variations, daily and completion reports', 15],
  ['calendar', 'Calendar events and reminders', 14],
  ['messages', 'Messages, inbox threads and SMS log', 38],
  ['activity', 'Notifications, activity feed and audit entries', 120],
  ['ai', 'Lucy conversations, cached briefs, reminders and ideas', 14],
  ['equipment', 'Equipment items, check-outs and requests', 30],
  ['archived', 'Archived items of every kind', 7],
  ['library', 'Library prices and times (the cards stay)', 41],
];
const SF_EMP = ['employees', 'Crew and office staff with timesheets, documents, contracts, leave and ratings', 74];
const SF_STAYS = 'Business profile and settings · your products · the Library\\'s cards (names, descriptions, photos and methods — their prices and times are cleared) · quote and invoice setup · contract, message and automation templates · training videos · your owner account and team admins · Lucy\\'s settings · tester invites and feedback.';
let sfState = { last: null };
const sfTotal = (emp) => SF_JOB.reduce((a, r) => a + r[2], 0) + (emp ? SF_EMP[2] : 0);
function renderSf() {
  const rows = [...SF_JOB, SF_EMP];
  $('#sfRows').innerHTML = rows.map(r => `<div class="tr ${r[0] === 'employees' ? 'muted' : ''}" data-testid="sf-row-${r[0]}"><div class="c">${r[1]}${r[0] === 'employees' ? ' <span style="font-size:11.5px">(only if you tick it)</span>' : ''}</div><div class="c r">${r[2].toLocaleString()}</div></div>`).join('');
  $('#sfCount').innerHTML = sfState.last ? `<b>No job records.</b> Started fresh ${sfState.last}.` : `<b>${sfTotal(false).toLocaleString()}</b> job records from testing · <b>${SF_EMP[2]}</b> more if crew and staff go too`;
  $('#sfStays').textContent = 'Stays: ' + SF_STAYS;
}
function renderSfForm() {
  const emp = $('#sfEmp').checked; const rows = [...SF_JOB, SF_EMP];
  $('#sfGoes').innerHTML = rows.map(r => `<div class="${r[0] === 'employees' && !emp ? 'off' : ''}"><span>${r[1]}</span><span>${r[2].toLocaleString()}</span></div>`).join('') + `<div style="border-top:1px solid var(--border);padding-top:4px;margin-top:2px"><span><b>Total</b></span><span><b>${sfTotal(emp).toLocaleString()}</b></span></div>`;
  $('#sfStayList').textContent = SF_STAYS + ($('#sfNum').checked ? ' Numbering restarts at EST-0001 and INV-0001.' : ' Numbering continues from today\\'s numbers.');
  $('#sfGo').disabled = $('#sfConfirm').value.trim().toLowerCase() !== BIZ.toLowerCase();
}
function openSf() { $('#sfForm').hidden = false; $('#sfRun').hidden = true; $('#sfDone').hidden = true; $('#sfFoot').hidden = false; $('#sfFootDone').hidden = true; $('#sfConfirm').value = ''; renderSfForm(); $('#sfScrim').hidden = false; $('#sfConfirm').focus(); }
function closeSf() { $('#sfScrim').hidden = true; }
$('#sfOpen').addEventListener('click', openSf); $('#sfClose').addEventListener('click', closeSf); $('#sfCancel').addEventListener('click', closeSf);
$('#sfScrim').addEventListener('click', e => { if (e.target === $('#sfScrim')) closeSf(); });
['sfEmp', 'sfNum'].forEach(id => $('#' + id).addEventListener('change', renderSfForm)); $('#sfConfirm').addEventListener('input', renderSfForm);
$('#sfGo').addEventListener('click', () => {
  const emp = $('#sfEmp').checked; const total = sfTotal(emp); let done = 0;
  $('#sfForm').hidden = true; $('#sfRun').hidden = false; $('#sfFoot').hidden = true;
  say('Export saved · POST /api/platform/start-fresh → job queued');
  const tick = setInterval(() => { done = Math.min(total, done + Math.ceil(total / 9)); $('#sfBar').style.width = (done / total * 100) + '%'; $('#sfProgText').textContent = `Removing… ${done.toLocaleString()} of ${total.toLocaleString()}`; $('#sfCount').innerHTML = `<b>Starting fresh…</b> ${done.toLocaleString()} of ${total.toLocaleString()} removed`;
    if (done >= total) { clearInterval(tick); const rows = emp ? [...SF_JOB, SF_EMP] : SF_JOB; sfState.last = 'today at 9:41'; $('#sfRun').hidden = true; $('#sfDone').hidden = false; $('#sfFootDone').hidden = false;
      $('#sfDoneTitle').textContent = `Done. ${total.toLocaleString()} records removed${$('#sfNum').checked ? ' · numbering reset' : ''}.`;
      $('#sfDoneList').innerHTML = rows.map(r => `<div><span>${r[1]}</span><span>${r[2].toLocaleString()}</span></div>`).join('');
      SF_JOB.forEach(r => r[2] = 0); if (emp) SF_EMP[2] = 0; renderSf();
      $('#sfLast').hidden = false; $('#sfLast').innerHTML = `Last start fresh: today at 9:41 · ${total.toLocaleString()} records removed · <a href="#" class="alink" data-testid="sf-export-link">Download the export</a> (kept until 6 Nov 2026) · also in Recent activity on the Dashboard.`;
    } }, 180);
});
$('#sfDoneBtn').addEventListener('click', closeSf);
renderSf();
</script>
</body>''')
OUT.write_text(html); print('wrote', OUT, len(html))
