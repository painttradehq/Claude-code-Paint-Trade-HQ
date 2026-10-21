#!/usr/bin/env python3
"""Employee page › Pay rates with an Overtime rate — a small stand-alone prototype on the app shell (sidebar and tokens
from settings-business-redesign.html): the file card's Pay rates block with Hourly, Daily and Overtime, the This week
card showing the one money rule, and the Add employee drawer's Pay section. ?daily=1 shows a daily-rate employee."""
import os, re
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

base = open('settings-business-redesign.html', encoding='utf-8').read()
head = base[:base.index('  <main>')]
helpers = base[base.index('<script>'):base.index('(() => {')]
head = head.replace('<title>Settings — Paint Trade HQ</title>', '<title>Employee · Pay rates — Paint Trade HQ</title>')

CSS = """
  /* ---- Employee page (pay rates prototype) ---- */
  .emp{ display:grid; grid-template-columns:320px minmax(0,1fr); gap:24px; align-items:start; }
  .ecard{ background:#fff; border:1px solid var(--border); border-radius:14px; overflow:hidden; }
  .ehead{ background:#F6F5FB; padding:22px 16px 16px; text-align:center; }
  .eav{ width:84px; height:84px; border-radius:42px; border:3px solid var(--success); margin:0 auto 10px; display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-size:30px; color:var(--accent); background:#fff; }
  .ehead b{ display:block; font-size:17px; } .ehead .r{ font-size:12.5px; color:var(--text-secondary); margin-top:2px; }
  .epill{ display:inline-block; margin-top:8px; font-size:11px; letter-spacing:.06em; text-transform:uppercase; font-weight:600; border-radius:999px; padding:3px 9px; background:var(--success-bg); color:var(--success); }
  .ehead .clk{ font-size:12.5px; color:var(--text-secondary); margin-top:8px; line-height:1.45; }
  .esec{ padding:14px 16px; border-top:1px solid var(--border); }
  .esec h4{ margin:0 0 10px; font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); display:flex; align-items:center; gap:8px; } .esec h4 i{ font-style:normal; font-size:10px; background:var(--surface-sunken); border-radius:999px; padding:2px 7px; letter-spacing:.04em; }
  .rates{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; align-items:end; }
  .rates label{ display:block; font-size:11px; color:var(--text-muted); margin-bottom:3px; }
  .rates input{ width:100%; box-sizing:border-box; height:34px; font:inherit; font-size:13.5px; padding:0 9px; border:1px solid var(--border-strong); border-radius:8px; background:var(--surface); color:var(--text-primary); }
  .rates input:disabled{ background:var(--surface-sunken); color:var(--text-muted); }
  .rates input:focus{ border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-bg); outline:none; }
  .rhelp{ font-size:11.5px; color:var(--text-muted); margin-top:8px; line-height:1.45; } .rhelp.warn{ color:var(--warning); }
  .rsave{ margin-top:10px; display:flex; justify-content:flex-end; }
  .muted{ font-size:12.5px; color:var(--text-muted); }
  .wk{ background:#fff; border:1px solid var(--border); border-radius:14px; padding:18px 20px; }
  .wk h3{ margin:0; font-size:16px; } .wk .sub{ font-size:12.5px; color:var(--text-muted); margin:3px 0 14px; }
  .bars{ display:grid; grid-template-columns:repeat(7,1fr); gap:8px; align-items:end; height:120px; }
  .bar{ display:flex; flex-direction:column; align-items:center; gap:4px; height:100%; justify-content:flex-end; font-size:11.5px; color:var(--text-secondary); }
  .bar div{ width:100%; border-radius:6px 6px 0 0; background:var(--accent); position:relative; } .bar div i{ position:absolute; left:0; right:0; top:0; background:var(--warning); border-radius:6px 6px 0 0; }
  .bar span{ font-family:var(--font-mono); font-size:11px; }
  .pills{ display:flex; gap:8px; margin-top:14px; flex-wrap:wrap; } .pills span{ font-family:var(--font-mono); font-size:12px; background:var(--surface-sunken); border-radius:999px; padding:4px 10px; } .pills span.ot{ background:var(--warning-bg); color:var(--warning); } .pills span.money{ background:var(--accent-bg); color:var(--accent-ink); font-weight:600; }
  .rule{ font-size:12.5px; color:var(--text-secondary); margin-top:10px; line-height:1.5; }
  .dscrim{ position:fixed; inset:0; background:rgba(30,26,20,.35); z-index:40; display:flex; justify-content:flex-end; } .dscrim[hidden]{ display:none; }
  .drawer{ width:480px; max-width:92%; height:100%; background:var(--bg); border-left:1px solid var(--border); box-shadow:-12px 0 40px rgba(20,16,10,.18); display:flex; flex-direction:column; }
  .dhead{ display:flex; align-items:flex-start; gap:10px; padding:16px 20px; border-bottom:1px solid var(--border); background:var(--surface); } .dhead .t{ flex:1; } .dhead h2{ font-size:17px; font-weight:600; margin:0; } .dhead .s{ font-size:12.5px; color:var(--text-muted); margin-top:3px; }
  .dclose{ width:28px; height:28px; border-radius:6px; border:none; background:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; } .dclose svg{ width:18px; height:18px; }
  .dbody{ flex:1; overflow:auto; padding:20px; display:flex; flex-direction:column; gap:12px; }
  .dbody .h{ font-size:12px; letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); margin-top:6px; display:flex; gap:8px; align-items:center; } .dbody .h i{ font-style:normal; font-size:10px; background:var(--surface-sunken); border-radius:999px; padding:2px 7px; }
  .dbody label{ display:block; font-size:11px; color:var(--text-muted); margin-bottom:3px; } .dbody input{ width:100%; box-sizing:border-box; height:36px; font:inherit; font-size:13.5px; padding:0 10px; border:1px solid var(--border-strong); border-radius:8px; background:var(--surface); }
  .g2{ display:grid; grid-template-columns:1fr 1fr; gap:8px; } .g3{ display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; }
  .dfoot{ display:flex; gap:8px; padding:14px 20px; border-top:1px solid var(--border); background:var(--surface); justify-content:flex-end; }
  @media (max-width:1100px){ .emp{ grid-template-columns:1fr; } }
"""
head = head.replace('</style>', CSS + '</style>')

BODY = """  <main>
    <div class="page-top">
      <div style="flex:1;min-width:220px;">
        <h1 class="page-title" id="empName">Sam Perera</h1>
        <p class="page-sub" id="empSub">Painter · Full time · started 3 Mar 2025 · Employees › Sam Perera</p>
      </div>
      <div class="page-actions"><button class="btn btn-primary" id="addBtn" data-testid="emp-add">${svg('plus')} Add employee</button></div>
    </div>

    <div class="emp">
      <div class="ecard" data-testid="file-card">
        <div class="ehead"><div class="eav">SP</div><b>Sam Perera</b><div class="r">Painter · Full time</div><span class="epill">On site</span><div class="clk">On site at <b>14 Livingstone St</b> since 7:02 am · 3h 40m so far</div></div>
        <div class="esec" data-testid="sec-pay-rates">
          <h4>Pay rates <i>admin only</i></h4>
          <div class="rates">
            <div><label>Hourly $/h</label><input type="number" step="0.25" id="rateH" data-testid="rate-hourly" aria-label="hourly_rate"></div>
            <div><label>Daily $/day</label><input type="number" step="1" id="rateD" data-testid="rate-daily" aria-label="daily_rate"></div>
            <div><label>Overtime $/h</label><input type="number" step="0.25" id="rateO" data-testid="rate-overtime" aria-label="overtime_rate"></div>
          </div>
          <div class="rhelp" id="rateHelp" data-testid="rate-help"></div>
          <div class="rsave"><button class="btn btn-primary small" id="rateSave" data-testid="rate-save">Save</button></div>
        </div>
        <div class="esec"><h4>Documents</h4><div class="muted">As today — licence, white card, contract.</div></div>
        <div class="esec"><h4>Notes</h4><div class="muted">As today.</div></div>
      </div>

      <div>
        <div class="wk" data-testid="week-card">
          <h3>This week</h3>
          <div class="sub">Overtime after 8 h a day and 38 h a week (the Timesheets gear). Last week 40 h over 5 days.</div>
          <div class="bars" id="bars"></div>
          <div class="pills" id="pills"></div>
          <div class="rule" id="ruleLine" data-testid="week-rule"></div>
        </div>
      </div>
    </div>
  </main>
</div>

<div class="dscrim" id="addScrim" hidden><div class="drawer" data-testid="emp-add-drawer">
  <div class="dhead"><div class="t"><h2>Add employee</h2><div class="s">They get the app link and a temporary password by email.</div></div><button class="dclose" id="addClose" data-testid="emp-add-close">${svg('close')}</button></div>
  <div class="dbody">
    <div><label>Full name</label><input type="text" placeholder="e.g. Sam Perera" data-testid="add-name"></div>
    <div class="g2"><div><label>Role</label><input type="text" value="Painter" data-testid="add-role"></div><div><label>Employment</label><input type="text" value="Full time" data-testid="add-employment_type"></div></div>
    <div class="g2"><div><label>Email</label><input type="email" data-testid="add-email"></div><div><label>Phone</label><input type="tel" data-testid="add-phone"></div></div>
    <div class="h">Pay <i>admin only</i></div>
    <div class="g3"><div><label>Hourly rate $/h</label><input type="number" data-testid="add-hourly_rate"></div><div><label>Daily rate $/day</label><input type="number" data-testid="add-daily_rate"></div><div><label>Overtime rate $/h</label><input type="number" data-testid="add-overtime_rate"></div></div>
    <div class="muted" style="line-height:1.45">Hourly wins; daily is used when hourly is empty. Overtime is paid for the hours past the thresholds in the Timesheets gear — leave it blank to pay overtime at the hourly rate.</div>
    <div class="h">Login</div>
    <div><label>Temporary password</label><input type="text" value="brush-9142-sky" style="font-family:var(--font-mono)" data-testid="add-password"></div>
  </div>
  <div class="dfoot"><button class="btn btn-ghost" id="addCancel">Cancel</button><button class="btn btn-primary" id="addSave" data-testid="add-save">Add employee</button></div>
</div></div>

<div class="toast" id="toast"></div>
"""

JS = r"""
(() => {
  // sidebar: Employees is the page, not Settings
  $$('.sidebar a').forEach(a => { const on = /Employees/.test(a.textContent) ; a.classList.toggle('on', on); });
  const daily = params.get('daily') === '1';
  const E = daily ? { h: '', d: '420', o: '' } : { h: '52.5', d: '', o: '' };
  const WEEK = [9, 9, 8, 9, 7, 0, 0]; // Mon..Sun; regular 38, overtime 4 at 8 h / day and 38 h / week
  const REG = 38, OT = 4, DAYS = 5;
  const num = (v) => v === '' || v === null || isNaN(+v) ? null : +v;
  const RATE = (v) => '$' + (Number.isInteger(v) ? String(v) : v.toFixed(2));
  function money(){ const h = num(E.h), d = num(E.d), o = num(E.o); if (h !== null) return { amount: REG * h + OT * (o !== null ? o : h), rule: `38 h regular × ${RATE(h)} + 4 h overtime × ${RATE(o !== null ? o : h)}${o === null ? ' (the hourly rate — no overtime rate set)' : ''} = ` }; if (d !== null) return { amount: DAYS * d, rule: `${DAYS} days × ${RATE(d)} a day = ` }; return { amount: 0, rule: 'No pay rate set — ' }; }
  function render(){
    $('#rateH').value = E.h; $('#rateD').value = E.d; $('#rateO').value = E.o;
    const dailyOnly = num(E.h) === null && num(E.d) !== null;
    $('#rateO').disabled = dailyOnly;
    const help = $('#rateHelp');
    if (dailyOnly) { help.className = 'rhelp warn'; help.textContent = 'Overtime is not used with a daily rate — a day is a day. Feeds labour cost on live projects.'; }
    else { help.className = 'rhelp'; help.textContent = 'Feeds labour cost on live projects and the payroll file. Hourly wins; daily is used when hourly is empty. Overtime is paid for the hours past the thresholds in the Timesheets gear — leave it blank to pay overtime at the hourly rate.'; }
    const max = Math.max(...WEEK, 9);
    $('#bars').innerHTML = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((n, i) => { const h = WEEK[i]; const ot = Math.max(0, h - 8); return `<div class="bar"><span>${h ? h + 'h' : '—'}</span><div style="height:${Math.round(h / max * 80)}px">${ot ? `<i style="height:${Math.round(ot / h * 100)}%"></i>` : ''}</div>${n}</div>`; }).join('');
    const m = money();
    $('#pills').innerHTML = `<span>${REG} h regular</span><span class="ot">${OT} h overtime</span><span class="money" data-testid="week-labour">${AUD(m.amount)} labour</span>`;
    $('#ruleLine').textContent = m.rule + AUD(m.amount) + '. The same rule prices the labour on the live project page and fills the payroll file.';
  }
  $('#rateSave').addEventListener('click', () => { E.h = $('#rateH').value; E.d = $('#rateD').value; E.o = $('#rateO').value; render(); say('Pay rates saved · PUT /employees/{id} { hourly_rate, daily_rate, overtime_rate }'); });
  ['rateH', 'rateD'].forEach(i => $('#' + i).addEventListener('input', () => { const dailyOnly = num($('#rateH').value) === null && num($('#rateD').value) !== null; $('#rateO').disabled = dailyOnly; }));
  $('#addBtn').addEventListener('click', () => { $('#addScrim').hidden = false; });
  const close = () => { $('#addScrim').hidden = true; };
  $('#addClose').addEventListener('click', close); $('#addCancel').addEventListener('click', close);
  $('#addScrim').addEventListener('click', e => { if (e.target.id === 'addScrim') close(); });
  $('#addSave').addEventListener('click', () => { close(); say('Employee added · POST /employees { …, hourly_rate, daily_rate, overtime_rate }'); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#addScrim').hidden) close(); });
  render();
})();
</script>
</body>
</html>
"""

html = head + BODY + helpers + JS
# render the ${svg('x')} placeholders in the static markup at load
html = html.replace("(() => {\n  // sidebar", "['.page-actions', '#addClose'].forEach(sel => { const el = document.querySelector(sel); el.innerHTML = el.innerHTML.replace(/\\$\\{svg\\(['\"](\\w+)['\"]\\)\\}/g, (_, a) => svg(a)); });\n(() => {\n  // sidebar", 1)
open('employee-pay-rates.html', 'w', encoding='utf-8').write(html)
print('employee-pay-rates.html', len(html))
