#!/usr/bin/env python3
"""Settings › Crew app (admin side) — patches settings-business-redesign.html (the Round 36 Settings shell) into
settings-crew-app.html: a new rail item "Crew app" and its page with five sections — Onboarding (welcome video,
note, phone preview drawer), What the crew sees (feature switches), Sign-in on site (distance + flag/block),
Invites (general QR with approval, per-employee note, pending approvals) and Push notifications.
Every rep() asserts the exact count."""
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, f'expected {n} of {a[:70]!r}, found {c}'
    return s.replace(a, b)

s = open('settings-business-redesign.html', encoding='utf-8').read()

CSS = """
  /* ---- Settings › Crew app ---- */
  .sw{ display:flex; align-items:center; gap:14px; padding:10px 0; border-bottom:1px solid var(--border); }
  .sw:last-child{ border-bottom:none; }
  .sw .t{ flex:1; min-width:0; font-size:14px; font-weight:500; } .sw .t small{ display:block; font-size:12.5px; color:var(--text-muted); font-weight:400; margin-top:2px; line-height:1.4; }
  .sw .lk{ font-size:11.5px; color:var(--text-muted); display:inline-flex; align-items:center; gap:4px; } .sw .lk svg{ width:12px; height:12px; }
  .tog{ width:40px; height:24px; border-radius:99px; border:none; background:var(--border-strong); position:relative; cursor:pointer; flex-shrink:0; transition:background .15s; padding:0; }
  .tog::after{ content:''; position:absolute; top:3px; left:3px; width:18px; height:18px; border-radius:99px; background:#fff; transition:left .15s; box-shadow:0 1px 2px rgba(0,0,0,.25); }
  .tog.on{ background:var(--accent); } .tog.on::after{ left:19px; }
  .tog:disabled{ opacity:.45; cursor:default; }
  .vcard{ display:flex; gap:14px; align-items:flex-start; padding:14px 16px; border:1px solid var(--border-strong); border-radius:10px; background:var(--surface); }
  .vthumb{ width:132px; height:76px; border-radius:8px; background:#1F1B2E; color:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; } .vthumb svg{ width:26px; height:26px; fill:#fff; stroke:none; }
  .vthumb.empty{ background:var(--surface-sunken); color:var(--text-muted); border:2px dashed var(--border-strong); } .vthumb.empty svg{ fill:none; stroke:currentColor; width:20px; height:20px; }
  .vcard .t{ flex:1; min-width:0; } .vcard .t b{ display:block; font-size:14px; font-weight:600; } .vcard .t span{ display:block; font-size:12.5px; color:var(--text-secondary); margin-top:2px; line-height:1.45; }
  .vcard .t .st{ display:flex; align-items:center; gap:6px; font-size:12.5px; margin-top:8px; color:var(--text-muted); } .vcard .t .st svg{ width:13px; height:13px; } .vcard .t .st.ok{ color:var(--success); }
  .vcard .a{ display:flex; gap:8px; flex-shrink:0; flex-wrap:wrap; justify-content:flex-end; } .vcard .a .btn{ padding:7px 12px; font-size:13px; }
  .row textarea{ width:100%; min-height:110px; font:inherit; font-size:13.5px; padding:9px 11px; border:1px solid var(--border-strong); border-radius:8px; background:var(--surface); color:var(--text-primary); resize:vertical; }
  .row .u{ display:flex; align-items:center; gap:8px; } .row .u input{ width:110px; } .row .u span{ font-size:13px; color:var(--text-muted); }
  .row .note{ font-size:12.5px; color:var(--text-muted); margin-top:6px; line-height:1.45; } .row .note.bad{ color:var(--danger); }
  .radios{ display:flex; flex-direction:column; gap:8px; }
  .radio{ display:flex; gap:12px; align-items:flex-start; padding:12px 14px; border:1px solid var(--border-strong); border-radius:10px; background:var(--surface); cursor:pointer; }
  .radio.on{ border-color:var(--accent); background:var(--accent-bg); }
  .radio input{ margin-top:3px; accent-color:var(--accent); } .radio b{ display:block; font-size:14px; font-weight:600; } .radio span{ display:block; font-size:12.5px; color:var(--text-secondary); margin-top:2px; line-height:1.45; }
  .inv2{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
  .icard{ border:1px solid var(--border-strong); border-radius:10px; background:var(--surface); padding:14px 16px; display:flex; flex-direction:column; gap:10px; }
  .icard b{ font-size:14px; font-weight:600; } .icard .p{ font-size:12.5px; color:var(--text-secondary); line-height:1.45; margin:0; }
  .qrwrap{ display:flex; gap:14px; align-items:center; }
  .qr{ width:96px; height:96px; display:grid; grid-template-columns:repeat(9,1fr); gap:1px; padding:6px; background:#fff; border:1px solid var(--border); border-radius:8px; flex-shrink:0; }
  .qr i{ background:#1F1B2E; display:block; } .qr i.o{ background:transparent; }
  .code{ font-family:var(--font-mono); font-size:13px; background:var(--surface-sunken); border-radius:6px; padding:4px 8px; }
  .icard .acts{ display:flex; gap:6px; flex-wrap:wrap; } .icard .acts .btn{ padding:6px 10px; font-size:12.5px; }
  .pend{ display:flex; align-items:center; gap:10px; padding:10px 12px; border:1px solid var(--border); border-radius:8px; background:var(--surface-sunken); font-size:13px; }
  .pend .who{ flex:1; } .pend .who small{ display:block; color:var(--text-muted); font-size:12px; margin-top:1px; } .pend .btn{ padding:5px 10px; font-size:12.5px; }
  .dscrim{ position:fixed; inset:0; background:rgba(30,26,20,.35); z-index:40; display:flex; justify-content:flex-end; }
  .dscrim[hidden]{ display:none; }
  .drawer{ width:480px; max-width:92%; height:100%; background:var(--bg); border-left:1px solid var(--border); box-shadow:-12px 0 40px rgba(20,16,10,.18); display:flex; flex-direction:column; }
  .dhead{ display:flex; align-items:flex-start; gap:10px; padding:16px 20px; border-bottom:1px solid var(--border); background:var(--surface); }
  .dhead .t{ flex:1; min-width:0; } .dhead h2{ font-size:17px; font-weight:600; margin:0; } .dhead .s{ font-size:12.5px; color:var(--text-muted); margin-top:3px; }
  .dclose{ width:28px; height:28px; border-radius:6px; border:none; background:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; } .dclose svg{ width:18px; height:18px; }
  .dbody{ flex:1; overflow:auto; padding:20px; display:flex; flex-direction:column; gap:14px; align-items:center; }
  .phone{ width:300px; border:10px solid #1F1B2E; border-radius:36px; background:#fff; overflow:hidden; box-shadow:0 20px 50px rgba(20,16,10,.25); }
  .phone .bar{ height:28px; display:flex; align-items:center; justify-content:center; font-size:11px; color:#6B6479; }
  .phone .scr{ padding:0 18px 18px; display:flex; flex-direction:column; gap:12px; min-height:520px; }
  .phone .vid{ aspect-ratio:16/9; border-radius:12px; background:#1F1B2E; color:#fff; display:flex; align-items:center; justify-content:center; } .phone .vid svg{ width:34px; height:34px; fill:#fff; stroke:none; }
  .phone .vid.none{ background:var(--surface-sunken); color:var(--text-muted); font-size:12px; }
  .phone h4{ font-family:var(--font-display); font-weight:600; font-size:20px; margin:4px 0 0; line-height:1.2; }
  .phone p{ font-size:13px; line-height:1.5; color:#3B3548; margin:0; white-space:pre-line; }
  .phone .cta{ margin-top:auto; background:var(--accent); color:#fff; border-radius:12px; padding:13px; text-align:center; font-weight:600; font-size:14px; }
  .phone .dots{ display:flex; gap:5px; justify-content:center; } .phone .dots i{ width:6px; height:6px; border-radius:99px; background:var(--border-strong); } .phone .dots i.on{ background:var(--accent); }
  .dnote{ font-size:12.5px; color:var(--text-muted); text-align:center; line-height:1.45; max-width:300px; }
  @media (max-width:1100px){ .inv2{ grid-template-columns:1fr; } }
"""
s = rep(s, '</style>', CSS + '</style>')

RAIL = """    <a href="?page=crew" data-page="crew" data-testid="set-rail-crew"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg> Crew app</a>
    <a href="?page=account" data-page="account" data-testid="set-rail-account">"""
s = rep(s, '    <a href="?page=account" data-page="account" data-testid="set-rail-account">', RAIL)

FEATS = [('jobs', 'Jobs', 'The jobs they are assigned to, with the work, prep notes and photos.', True, True),
         ('timeclock', 'Time clock', 'Sign in and out on site; the hours feed Timesheets.', True, True),
         ('daily_reports', 'Daily reports', 'End-of-day report from the job, with photos and problems.', True, False),
         ('photos', 'Photos', 'Take and see job photos.', True, False),
         ('inbox', 'Inbox', 'Messages from the office and notices.', True, False),
         ('learn', 'Learn', 'Training videos and coaching.', True, False),
         ('documents', 'Documents & contracts', 'Their contracts, signed copies and documents.', True, False),
         ('equipment', 'Equipment requests', 'Ask for gear and report a problem with an item.', True, False),
         ('events', 'Team events', 'Social and team dates.', True, False),
         ('feedback', 'Feedback', 'Send a note to the office about the app or the job.', True, False)]
feat_rows = ''.join(f"""        <div class="sw" data-testid="crew-feat-row-{k}"><div class="t">{n}<small>{d}</small></div>{'<span class="lk">' + '${svg("lock")}' + ' always on</span>' if lock else f'<button class="tog {"on" if on else ""}" data-feat="{k}" data-testid="crew-feat-{k}" role="switch" aria-checked="{str(on).lower()}"></button>'}</div>\n""" for k, n, d, on, lock in FEATS)

NOTIFS = [('job_assigned', 'A job is assigned to them', 'With the start date and the address.'),
          ('start_change', 'A start time or date changes', 'For a job they are on.'),
          ('office_message', 'A message from the office', 'Inbox messages and notices.'),
          ('report_feedback', 'Feedback on their daily report', 'When you reply to a report.'),
          ('contract', 'A document to sign', 'A contract or policy waiting for their signature.')]
notif_rows = ''.join(f"""        <div class="sw"><div class="t">{n}<small>{d}</small></div><button class="tog on" data-notif="{k}" data-testid="crew-notif-{k}" role="switch" aria-checked="true"></button></div>\n""" for k, n, d in NOTIFS)

PAGE = """  <div class="content" id="pgCrew" data-testid="set-page-crew" hidden>
    <h2 class="pg">Crew app</h2>
    <p class="pgs">What your crew sees on their phones, the welcome they get, and the rule for signing in on site. Invites stay on the Employees page.</p>

    <section class="sec" data-testid="sec-onboarding">
      <h3>Onboarding</h3>
      <p class="sd">The first thing a new crew member sees after joining: your welcome video and a note from you. They get through this and the sign-up basics before the main pages open.</p>
      <div class="vcard" data-testid="crew-video-card"><div class="vthumb" id="vthumb">${svg('play')}</div><div class="t"><b>Welcome video</b><span>A short video from you — who you are, how the team works, what a good day on site looks like. Plays on the first page of the crew app.</span><div class="st" id="crewVideoSt" data-testid="crew-video-status"></div></div><div class="a" id="crewVideoActs"></div></div>
      <div class="row" style="margin-top:12px"><div class="k">Welcome headline</div><div class="v"><input type="text" id="crew-headline" data-k="crew_headline" value="Welcome to Sano Painting" placeholder="Welcome to …" data-testid="crew-headline" aria-label="crew_headline"></div></div>
      <div class="row"><div class="k">Welcome note<span>Who you are, how you work, what matters on site. Culture, values, the basics.</span></div><div class="v"><textarea id="crew-note" data-k="crew_note" data-testid="crew-note" aria-label="crew_note">We're a small team that takes pride in clean, careful work and in looking after each other.

Three things we care about: turn up on time, keep the site tidy, and speak up early if something isn't right. Your lead hand will show you the rest.</textarea><div class="note"><button class="btn btn-ghost" id="crewPreview" data-testid="crew-preview" style="padding:7px 12px;font-size:13px">${svg('eye')} Preview on a phone</button></div></div></div>
    </section>

    <section class="sec" data-testid="sec-features">
      <h3>What the crew sees <span class="now">saves at once</span></h3>
      <p class="sd">Switch off anything your crew does not need. Off hides the tab or card in the crew app; nothing is deleted.</p>
      <div class="sws" data-testid="crew-features">
""" + feat_rows + """      </div>
    </section>

    <section class="sec" data-testid="sec-signin">
      <h3>Sign-in on site</h3>
      <p class="sd">The time clock compares the phone's position with the job's address when the crew signs in and out.</p>
      <div class="row"><div class="k">Distance from the site<span>How far from the job address still counts as on site.</span></div><div class="v"><div class="u"><input type="number" id="crew-radius" data-k="crew_radius_m" value="50" min="30" step="10" data-testid="crew-radius" aria-label="crew_radius_m"><span>metres</span></div><div class="note" id="radiusNote" data-testid="crew-radius-note">Minimum 30 m: a phone's own GPS is only accurate to about 5–20 m outdoors, worse under roofs. A job can set its own distance on its page.</div></div></div>
      <div class="row"><div class="k">Outside the distance<span>Saves at once.</span></div><div class="v"><div class="radios" role="radiogroup">
        <label class="radio on" data-rule="flag" data-testid="crew-rule-flag"><input type="radio" name="rule" value="flag" checked><div><b>Flag it</b><span>Sign-in always works. Entries outside the distance are marked on the timesheet with how far away the phone was, for you to check.</span></div></label>
        <label class="radio" data-rule="block" data-testid="crew-rule-block"><input type="radio" name="rule" value="block"><div><b>Refuse it</b><span>Sign-in is refused outside the distance when the phone's GPS reading is accurate. When the reading is poor, the sign-in goes through flagged instead of locking the crew out.</span></div></label>
      </div></div></div>
    </section>

    <section class="sec" data-testid="sec-notifications">
      <h3>Push notifications <span class="now">saves at once</span></h3>
      <p class="sd">What reaches the crew's phone as a notification. Push arrives with the crew app's next round; these choices apply from then.</p>
      <div class="sws" data-testid="crew-notifications">
""" + notif_rows + """      </div>
    </section>
  </div>

  <div class="content" id="pgAccount" data-testid="set-page-account" hidden>"""
s = rep(s, '  <div class="content" id="pgAccount" data-testid="set-page-account" hidden>', PAGE)

DRAWER = """<div class="dscrim" id="crScrim" hidden><div class="drawer" data-testid="crew-phone">
  <div class="dhead"><div class="t"><h2>First page on the phone</h2><div class="s">What a new crew member sees after joining, before the sign-up basics.</div></div><button class="dclose" id="crClose" data-testid="crew-phone-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
  <div class="dbody">
    <div class="phone"><div class="bar">9:41</div><div class="scr"><div class="vid" id="phVid"></div><h4 id="phHead"></h4><p id="phNote"></p><div class="cta">Continue</div><div class="dots"><i class="on"></i><i></i><i></i></div></div></div>
    <div class="dnote">Then the sign-up steps the crew app already has: details, a photo, licence and white card, the terms to sign. The main pages open after that.</div>
  </div>
</div></div>

<div class="toast" id="toast"></div>"""
s = rep(s, '<div class="toast" id="toast"></div>', DRAWER)

# rail switching + save bar know the page
s = rep(s, "show(['business','account','platform'].includes(pageName) ? pageName : 'business');",
           "show(['business','crew','account','platform'].includes(pageName) ? pageName : 'business');")
s = rep(s, "const fields = $$('#pgBusiness input[data-k]');", "const fields = [...$$('#pgBusiness input[data-k]'), ...$$('#pgCrew input[data-k], #pgCrew textarea[data-k]')];")
s = rep(s, "refresh(); say('Business saved · PUT /admin/profile');",
           "refresh(); say(changed.some(k => k.startsWith('crew_')) ? 'Crew app saved · PUT /admin/crew-app-settings' : 'Business saved · PUT /admin/profile');")

s = rep(s, "  // ---- dirty tracking + save bar ----", r"""  $('#pgCrew').innerHTML = $('#pgCrew').innerHTML.replace(/\$\{svg\(['"](\w+)['"]\)\}/g, (_, a) => svg(a));
  // ---- dirty tracking + save bar ----""")

JS = """  // ---- Crew app page ----
  const CR = { video: { name: 'welcome-2026.mp4', len: '1:48', at: '3 Oct' } };
  const FEAT_NAMES = { daily_reports:'Daily reports', photos:'Photos', inbox:'Inbox', learn:'Learn', documents:'Documents & contracts', equipment:'Equipment requests', events:'Team events', feedback:'Feedback' };
  function renderVideo(){ const st = $('#crewVideoSt'), th = $('#vthumb'); if (CR.video) { st.className = 'st ok'; st.innerHTML = `${svg('checkc')} ${esc(CR.video.name)} · ${CR.video.len} · uploaded ${CR.video.at}`; th.className = 'vthumb'; th.innerHTML = svg('play'); $('#crewVideoActs').innerHTML = `<button class="btn btn-ghost" id="vidReplace" data-testid="crew-video-replace">Replace</button><button class="btn danger" id="vidRemove" data-testid="crew-video-remove">Remove</button>`; } else { st.className = 'st'; st.innerHTML = `${svg('image')} No video yet · MP4 or MOV up to 200 MB`; th.className = 'vthumb empty'; th.innerHTML = svg('image'); $('#crewVideoActs').innerHTML = `<button class="btn btn-primary" id="vidUpload" data-testid="crew-video-upload">${svg('plus')} Upload video</button>`; } }
  function renderPhone(){ $('#phHead').textContent = $('#crew-headline').value || 'Welcome'; $('#phNote').textContent = $('#crew-note').value; const v = $('#phVid'); if (CR.video) { v.className = 'vid'; v.innerHTML = svg('play'); } else { v.className = 'vid none'; v.textContent = 'No video — the note shows on its own'; } }
  function openPhone(){ renderPhone(); $('#crScrim').hidden = false; } function closePhone(){ $('#crScrim').hidden = true; }
  document.addEventListener('click', e => {
    const id = e.target.id; let x;
    if (id === 'vidUpload' || id === 'vidReplace'){ CR.video = { name: 'welcome-' + (Date.now() % 1000) + '.mp4', len: '2:05', at: 'today' }; renderVideo(); say('Uploading to your storage · POST /admin/crew-app-settings/video'); return; }
    if (id === 'vidRemove'){ if (!confirm('Remove the welcome video? New crew will see the note on its own.')) return; CR.video = null; renderVideo(); say('Welcome video removed'); return; }
    if (id === 'crewPreview'){ openPhone(); return; }
    if (id === 'crClose' || e.target.id === 'crScrim'){ closePhone(); return; }
    if ((x = e.target.closest('[data-feat]'))){ x.classList.toggle('on'); const on = x.classList.contains('on'); x.setAttribute('aria-checked', on); say(`${FEAT_NAMES[x.dataset.feat]} ${on ? 'shown to' : 'hidden from'} the crew · PUT /admin/crew-app-settings`); return; }
    if ((x = e.target.closest('[data-notif]'))){ x.classList.toggle('on'); x.setAttribute('aria-checked', x.classList.contains('on')); say('Notification choices saved · PUT /admin/crew-app-settings'); return; }
    if ((x = e.target.closest('.radio'))){ $$('.radio').forEach(r => { r.classList.toggle('on', r === x); r.querySelector('input').checked = r === x; }); say(x.dataset.rule === 'flag' ? 'Outside the distance: flagged on the timesheet · PUT /admin/crew-app-settings' : 'Outside the distance: refused when the GPS reading is accurate · PUT /admin/crew-app-settings'); return; }
  });
  $('#crew-radius').addEventListener('change', () => { const el = $('#crew-radius'); const n = $('#radiusNote'); if (+el.value < 30) { el.value = 30; n.className = 'note bad'; n.textContent = 'Set to 30 m — the minimum. A phone cannot place itself more precisely than that.'; } else { n.className = 'note'; n.textContent = 'Minimum 30 m: a phone\\'s own GPS is only accurate to about 5–20 m outdoors, worse under roofs. A job can set its own distance on its page.'; } });
  ['crew-headline', 'crew-note'].forEach(i => $('#' + i).addEventListener('input', () => { if (!$('#crScrim').hidden) renderPhone(); }));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#crScrim').hidden) closePhone(); });
  renderVideo();
  if (pageName === 'crew') $('#pageSub').textContent = 'The crew app follows these settings on every phone. Changes reach the crew the next time they open the app. Invites and approvals live on the Employees page.';
  else $('#pageSub').textContent"""
s = rep(s, "  $('#pageSub').textContent", JS)
open('settings-crew-app.html', 'w', encoding='utf-8').write(s)
print('settings-crew-app.html', len(s))
