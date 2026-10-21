#!/usr/bin/env python3
"""Settings › Business › Operating hours + the two reminder switches on the Crew app page — patches settings-billing.html
(the full Settings shell) into settings-pay-hours.html. Every rep() asserts the exact count."""
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, f'expected {n} of {a[:70]!r}, found {c}'
    return s.replace(a, b)

s = open('settings-billing.html', encoding='utf-8').read()

CSS = """
  /* ---- Operating hours ---- */
  .row input[type=time]{ height:38px; width:140px; font:inherit; font-size:13.5px; padding:0 10px; border:1px solid var(--border-strong); border-radius:8px; background:var(--surface); color:var(--text-primary); }
  .row input[type=time]:focus{ border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-bg); outline:none; }
  .dchips{ display:flex; gap:6px; flex-wrap:wrap; }
  .dchip{ min-width:46px; padding:7px 10px; border-radius:999px; border:1px solid var(--border-strong); background:var(--surface); font-size:13px; font-weight:600; color:var(--text-secondary); cursor:pointer; }
  .dchip.on{ background:var(--accent-bg); border-color:var(--accent); color:var(--accent-ink); }
  .sw .t small b{ font-weight:600; color:var(--text-primary); }
"""
s = rep(s, '</style>', CSS + '</style>')

DAYS = [(1, 'Mon'), (2, 'Tue'), (3, 'Wed'), (4, 'Thu'), (5, 'Fri'), (6, 'Sat'), (7, 'Sun')]
chips = ''.join(f'<button type="button" class="dchip {"on" if d <= 5 else ""}" data-day="{d}" data-testid="biz-day-{d}" aria-pressed="{str(d <= 5).lower()}">{n}</button>' for d, n in DAYS)

HOURS = """    <section class="sec" data-testid="sec-hours">
      <h3>Operating hours</h3>
      <p class="sd">Your ordinary working day. The crew app uses it for the sign-in and sign-out reminders (Settings › Crew app › Push notifications). The Timesheets gear keeps its own auto sign-out time as the safety net for forgotten sessions.</p>
      <div class="row"><div class="k">Start of the day<span>The sign-in reminder goes out at this time.</span></div><div class="v"><input type="time" id="biz-hours-start" data-k="hours_start" value="07:00" step="900" data-testid="biz-hours-start" aria-label="hours_start"></div></div>
      <div class="row"><div class="k">End of the day<span>The sign-out reminder goes out at this time.</span></div><div class="v"><input type="time" id="biz-hours-end" data-k="hours_end" value="16:00" step="900" data-testid="biz-hours-end" aria-label="hours_end"><div class="note" id="hoursNote" data-testid="biz-hours-note"></div></div></div>
      <div class="row"><div class="k">Working days<span>Reminders go out on these days only.</span></div><div class="v"><div class="dchips" data-testid="biz-hours-days">""" + chips + """</div><input type="hidden" id="biz-hours-days" data-k="hours_days" value="1,2,3,4,5" aria-label="hours_days"></div></div>
    </section>

    <section class="sec" data-testid="sec-online">"""
s = rep(s, '    <section class="sec" data-testid="sec-online">', HOURS)

CONTRACT_ROW = """        <div class="sw"><div class="t">A document to sign<small>A contract or policy waiting for their signature.</small></div><button class="tog on" data-notif="contract" data-testid="crew-notif-contract" role="switch" aria-checked="true"></button></div>
"""
REMINDERS = CONTRACT_ROW + """        <div class="sw" data-testid="crew-notif-row-signin_reminder"><div class="t">Remind them to sign in at the start of the day<small>At <b id="remStart">7:00 am</b> on working days, to crew with a job that day · the time is set in Settings › Business › Operating hours</small></div><button class="tog on" data-notif="signin_reminder" data-testid="crew-notif-signin_reminder" role="switch" aria-checked="true"></button></div>
        <div class="sw" data-testid="crew-notif-row-signout_reminder"><div class="t">Remind them to sign out at the end of the day<small>At <b id="remEnd">4:00 pm</b> on working days, to everyone still signed in · the time is set in Settings › Business › Operating hours</small></div><button class="tog on" data-notif="signout_reminder" data-testid="crew-notif-signout_reminder" role="switch" aria-checked="true"></button></div>
"""
s = rep(s, CONTRACT_ROW, REMINDERS)

JS = r"""  // ---- Operating hours ----
  const DAYN = { 1:'Monday', 2:'Tuesday', 3:'Wednesday', 4:'Thursday', 5:'Friday', 6:'Saturday', 7:'Sunday' };
  const fmtT = (hhmm) => { const [h, m] = (hhmm || '0:0').split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`; };
  const mins = (hhmm) => { const [h, m] = (hhmm || '0:0').split(':').map(Number); return h * 60 + m; };
  const dayList = () => $('#biz-hours-days').value.split(',').filter(Boolean).map(Number);
  function hoursValid(){ return mins($('#biz-hours-end').value) > mins($('#biz-hours-start').value); }
  function renderHoursNote(){ const n = $('#hoursNote'); const ds = dayList(); if (!hoursValid()) { n.className = 'note bad'; n.textContent = 'The end of the day must be after the start.'; return; } const len = (mins($('#biz-hours-end').value) - mins($('#biz-hours-start').value)) / 60; const run = ds.length && ds.every((d, i) => i === 0 || d === ds[i - 1] + 1); const span = !ds.length ? 'no working days' : ds.length === 1 ? DAYN[ds[0]] : run ? `${DAYN[ds[0]]} to ${DAYN[ds[ds.length - 1]]}` : ds.map(d => DAYN[d].slice(0, 3)).join(', '); n.className = 'note'; n.textContent = `A ${len % 1 ? len.toFixed(2).replace(/0+$/, '') : len}-hour day, ${span}.`; }
  function renderReminderTimes(){ $('#remStart').textContent = fmtT(saved.hours_start); $('#remEnd').textContent = fmtT(saved.hours_end); }
  document.addEventListener('click', e => { const c = e.target.closest('.dchip'); if (!c) return; c.classList.toggle('on'); c.setAttribute('aria-pressed', c.classList.contains('on')); const inp = $('#biz-hours-days'); inp.value = $$('.dchip.on').map(x => x.dataset.day).sort().join(','); inp.dispatchEvent(new Event('input', { bubbles: true })); renderHoursNote(); });
  ['biz-hours-start', 'biz-hours-end'].forEach(i => $('#' + i).addEventListener('input', renderHoursNote));
  saveBtn.addEventListener('click', e => { if (!hoursValid()) { e.stopImmediatePropagation(); say('The end of the day must be after the start'); return; } }, true);
  saveBtn.addEventListener('click', () => renderReminderTimes());
  $('#cancelBtn').addEventListener('click', () => { $$('.dchip').forEach(c => { const on = dayList().includes(+c.dataset.day); c.classList.toggle('on', on); c.setAttribute('aria-pressed', on); }); renderHoursNote(); });
  renderHoursNote(); renderReminderTimes();

  const SUBS = {"""
s = rep(s, "  const SUBS = {", JS)
s = rep(s, "crew: 'The crew app follows these settings on every phone. Changes reach the crew the next time they open the app. Invites and approvals live on the Employees page.'",
           "crew: 'The crew app follows these settings on every phone. Changes reach the crew the next time they open the app. Invites and approvals live on the Employees page; the operating hours on the Business page.'")

open('settings-pay-hours.html', 'w', encoding='utf-8').write(s)
print('settings-pay-hours.html', len(s))
