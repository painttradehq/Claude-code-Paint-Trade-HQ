#!/usr/bin/env python3
"""Settings › Billing — patches settings-crew-app.html (the Settings shell with Business, Crew app, Account, Platform) into
settings-billing.html: a new rail item "Billing" and its page — Your plan (pill, status, seats, next invoice, actions),
the three plan cards (Starter / Small business / Enterprise, the current one highlighted, what switching adds or drops
with the real seat arithmetic), a right-hand drawer to switch or cancel, the full comparison table and the Good-to-know
list. The Account page gets a Subscription row whose "Manage billing" opens the page. States: ?state=active (default),
trial, tester, past_due. Every rep() asserts the exact count."""
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, f'expected {n} of {a[:70]!r}, found {c}'
    return s.replace(a, b)

s = open('settings-crew-app.html', encoding='utf-8').read()

CSS = """
  /* ---- Settings › Billing ---- */
  .bl-plan{ border:1px solid var(--border-strong); border-radius:12px; background:var(--surface); padding:18px 20px; }
  .bl-plan .top{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
  .bl-pill{ font-size:11px; letter-spacing:.08em; text-transform:uppercase; font-weight:600; border-radius:999px; padding:4px 10px; background:var(--surface-sunken); color:var(--text-secondary); flex-shrink:0; }
  .bl-pill.acc{ background:var(--accent-bg); color:var(--accent); } .bl-pill.ok{ background:var(--success-bg); color:var(--success); } .bl-pill.warn{ background:var(--warning-bg); color:var(--warning); }
  .bl-plan .t{ flex:1 1 300px; min-width:0; } .bl-plan .top .acts{ flex:0 0 auto; } .bl-plan .t b{ display:block; font-size:16px; font-weight:600; } .bl-plan .t span{ display:block; font-size:13px; color:var(--text-secondary); margin-top:2px; line-height:1.45; } .bl-plan .t span.bad{ color:var(--danger); } .bl-plan .t span.warn{ color:var(--warning); }
  .bl-plan .acts{ display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
  .bl-facts{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:16px; }
  .bl-fact{ padding:12px 14px; border-radius:10px; background:var(--surface-sunken); } .bl-fact small{ display:block; font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; font-weight:600; color:var(--text-muted); } .bl-fact b{ display:block; font-size:14.5px; font-weight:600; margin-top:4px; } .bl-fact span{ display:block; font-size:12.5px; color:var(--text-secondary); margin-top:2px; line-height:1.4; }
  .bl-note{ font-size:12.5px; color:var(--text-muted); margin-top:12px; line-height:1.45; }
  .bl-cards{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; align-items:stretch; margin-top:14px; }
  .bl-card{ border:1px solid var(--border-strong); border-radius:12px; background:var(--surface); padding:20px 18px 16px; display:flex; flex-direction:column; gap:12px; position:relative; }
  .bl-card.cur{ border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-bg); }
  .bl-card .rib{ position:absolute; top:-11px; left:16px; font-size:10.5px; letter-spacing:.08em; text-transform:uppercase; font-weight:700; background:var(--accent); color:#fff; border-radius:999px; padding:3px 9px; }
  .bl-card h4{ margin:0; font-family:var(--font-display); font-size:20px; font-weight:600; }
  .bl-card .price{ display:flex; align-items:baseline; gap:6px; } .bl-card .price b{ font-size:30px; font-weight:600; letter-spacing:-0.02em; font-family:var(--font-display); line-height:1; } .bl-card .price span{ font-size:12.5px; color:var(--text-muted); }
  .bl-card .for{ font-size:13px; color:var(--text-secondary); line-height:1.45; min-height:56px; }
  .bl-card .seats{ font-size:12.5px; color:var(--text-primary); background:var(--surface-sunken); border-radius:8px; padding:8px 10px; line-height:1.45; } .bl-card .seats small{ display:block; color:var(--text-muted); font-size:11.5px; }
  .bl-card .pl{ font-size:12px; font-weight:600; color:var(--text-muted); }
  .bl-card ul{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; flex:1; } .bl-card li{ display:flex; gap:8px; font-size:13px; line-height:1.4; } .bl-card li svg{ width:14px; height:14px; flex-shrink:0; color:var(--success); margin-top:2px; }
  .bl-card .diff{ font-size:12.5px; line-height:1.45; color:var(--text-secondary); border-top:1px solid var(--border); padding-top:10px; } .bl-card .diff b{ color:var(--text-primary); font-weight:600; }
  .bl-card .btn{ justify-content:center; width:100%; } .bl-card .btn:disabled{ opacity:.55; cursor:default; }
  .bl-table{ overflow:auto; border:1px solid var(--border); border-radius:10px; }
  .bl-table table{ border-collapse:collapse; width:100%; min-width:560px; font-size:13px; }
  .bl-table th, .bl-table td{ padding:9px 12px; border-bottom:1px solid var(--border); text-align:center; vertical-align:middle; } .bl-table th:first-child, .bl-table td:first-child{ text-align:left; }
  .bl-table th{ font-size:12px; font-weight:600; background:var(--surface-sunken); } .bl-table th.cur, .bl-table td.cur{ background:var(--accent-bg); }
  .bl-table tr:last-child td{ border-bottom:none; } .bl-table td svg{ width:15px; height:15px; color:var(--success); vertical-align:middle; } .bl-table td.off{ color:var(--text-muted); }
  .bl-table tr.grp td{ background:var(--surface-sunken); font-weight:600; font-size:11px; text-align:left; color:var(--text-secondary); letter-spacing:.06em; text-transform:uppercase; padding:6px 12px; }
  .bl-faq{ display:grid; grid-template-columns:1fr 1fr; gap:12px 24px; } .bl-faq div{ font-size:13px; line-height:1.5; color:var(--text-secondary); } .bl-faq div b{ display:block; color:var(--text-primary); font-weight:600; }
  .bl-drawer .dbody{ align-items:stretch; } .bl-drawer .dl{ display:flex; flex-direction:column; gap:14px; } .bl-drawer .dl div{ font-size:13.5px; line-height:1.5; } .bl-drawer .dl b{ display:block; font-weight:600; margin-bottom:2px; } .bl-drawer .big{ font-family:var(--font-display); font-size:22px; font-weight:600; padding-top:4px; border-top:1px solid var(--border); } .bl-drawer .big small{ display:block; font-family:var(--font-body); font-size:12.5px; font-weight:400; color:var(--text-muted); margin-top:2px; }
  .bl-drawer .dfoot{ display:flex; gap:8px; padding:14px 20px; border-top:1px solid var(--border); background:var(--surface); justify-content:flex-end; }
  @media (max-width:1100px){ .bl-cards{ grid-template-columns:1fr; } .bl-facts{ grid-template-columns:1fr 1fr; } .bl-faq{ grid-template-columns:1fr; } .bl-card .for{ min-height:0; } }
"""
s = rep(s, '</style>', CSS + '</style>')

RAIL = """    <a href="?page=billing" data-page="billing" data-testid="set-rail-billing"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19"/><path d="M6 15h4"/></svg> Billing</a>
    <a href="?page=platform" data-page="platform" data-testid="set-rail-platform">"""
s = rep(s, '    <a href="?page=platform" data-page="platform" data-testid="set-rail-platform">', RAIL)

PAGE = """  <div class="content" id="pgBilling" data-testid="set-page-billing" hidden>
    <h2 class="pg">Billing</h2>
    <p class="pgs">Your plan, your seats and your invoices in one place. Payment details and receipts open in Stripe, the card processor.</p>

    <section class="sec" data-testid="sec-your-plan">
      <h3>Your plan</h3>
      <div class="bl-plan" id="blPlan" data-testid="bl-plan-card"></div>
    </section>

    <section class="sec" data-testid="sec-plans">
      <h3>Plans</h3>
      <p class="sd">Three plans, priced in Australian dollars a month. Each card says what you get and what changes for your team if you switch. Upgrades start today; downgrades start at your next renewal.</p>
      <div class="bl-cards" id="blCards" data-testid="bl-cards"></div>
    </section>

    <section class="sec" data-testid="sec-compare">
      <h3>Compare the plans</h3>
      <p class="sd">Everything in each plan, side by side. Your plan is the tinted column.</p>
      <div class="bl-table" id="blCompare" data-testid="bl-compare"></div>
    </section>

    <section class="sec" data-testid="sec-faq">
      <h3>Good to know</h3>
      <div class="bl-faq" id="blFaq" data-testid="bl-faq"></div>
    </section>
  </div>

  <div class="content" id="pgAccount" data-testid="set-page-account" hidden>"""
s = rep(s, '  <div class="content" id="pgAccount" data-testid="set-page-account" hidden>', PAGE)

ACCOUNT_OLD = """    <div class="soon"><b>Next round.</b> This page keeps its current content until its own redesign round: Subscription first, then Profile, Team admins and Security (password + sessions).</div>"""
ACCOUNT_NEW = """    <section class="sec" data-testid="sec-subscription">
      <h3>Subscription</h3>
      <p class="sd">Your plan at a glance. Plans, seats, invoices and the payment method live on the Billing page.</p>
      <div class="bl-plan" id="acctSub" data-testid="account-subscription-row"></div>
    </section>
    <div class="soon"><b>As today.</b> Profile, Team admins and Security keep their current content.</div>"""
s = rep(s, ACCOUNT_OLD, ACCOUNT_NEW)

DRAWER = """<div class="dscrim" id="blScrim" hidden><div class="drawer bl-drawer" data-testid="bl-drawer">
  <div class="dhead"><div class="t"><h2 id="blDTitle" data-testid="bl-drawer-title"></h2><div class="s" id="blDSub"></div></div><button class="dclose" id="blClose" data-testid="bl-drawer-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
  <div class="dbody"><div class="dl" id="blDBody" data-testid="bl-drawer-body"></div></div>
  <div class="dfoot" id="blDFoot"></div>
</div></div>

<div class="toast" id="toast"></div>"""
s = rep(s, '<div class="toast" id="toast"></div>', DRAWER)

s = rep(s, "show(['business','crew','account','platform'].includes(pageName) ? pageName : 'business');",
           "show(['business','crew','account','billing','platform'].includes(pageName) ? pageName : 'business');")

OLD_SUB = """  if (pageName === 'crew') $('#pageSub').textContent = 'The crew app follows these settings on every phone. Changes reach the crew the next time they open the app. Invites and approvals live on the Employees page.';
  else $('#pageSub').textContent = 'Account-wide details only. Everything that belongs to one page lives behind the gear on that page.';"""

JS = r"""  // ---- Billing page ----
  const PLANS = {
    starter:    { key:'starter',    name:'Starter',        price:59,  admins:1, emps:3,  xa:25, xe:15, rank:1, who:'A sole trader or a two-person outfit: quote, invoice, get paid and run the jobs.' },
    small:      { key:'small',      name:'Small business', price:179, admins:2, emps:5,  xa:25, xe:15, rank:2, who:'A growing team with someone in the office: timesheets, presentation pages, Lucy and SMS on top.' },
    enterprise: { key:'enterprise', name:'Enterprise',     price:249, admins:3, emps:15, xa:42, xe:25, rank:3, who:'Several crews and proper HR: contracts with e-sign, daily reports, equipment, performance and training.' } };
  const ORDER = ['starter', 'small', 'enterprise'];
  // [label on the card and in the table, lowest plan that has it, short name for the "switching adds / drops" sentence]
  const FEATS = [
    ['Dashboard', 'starter', 'the dashboard'],
    ['Estimating and quoting with the full library', 'starter', 'quoting'],
    ['Payments and invoicing', 'starter', 'invoicing'],
    ['CRM, calendar and the Employees page', 'starter', 'the CRM'],
    ['Project management: live project page and project details', 'starter', 'project management'],
    ['Presentation pages on quotes', 'small', 'presentation pages'],
    ['Auto-invoicing', 'small', 'auto-invoicing'],
    ['Lucy, the AI assistant', 'small', 'Lucy'],
    ['SMS to clients', 'small', 'SMS'],
    ['Timesheets', 'small', 'Timesheets'],
    ['Business performance stats on the live project page', 'small', 'the performance stats on the live project page'],
    ['AI summaries on project details and per client in the CRM', 'small', 'the AI summaries'],
    ['Performance page', 'enterprise', 'the Performance page'],
    ['Training videos', 'enterprise', 'training videos'],
    ['HR contracts with e-sign', 'enterprise', 'HR contracts with e-sign'],
    ['Daily reports from the crew', 'enterprise', 'daily reports'],
    ['Equipment', 'enterprise', 'Equipment'] ];
  const SVC = { starter: [], small: ['One hour of training for one person'], enterprise: ['One hour of training per person', 'Free data migration from your old software'] };
  const USE = { admins: 2, emps: 7 };
  const PERIOD_END = '14 Nov 2026', SINCE = '14 Aug 2026', TRIAL_END = '30 Oct 2026', TESTER_END = '31 Dec 2026', PAST_DUE_BY = '28 Oct 2026';
  const B = { state: params.get('state') || 'active', cur: 'small', pending: null, cancelling: false };
  if (B.state === 'trial') B.cur = 'enterprise';
  if (B.state === 'tester') B.cur = null;
  const rank = (k) => PLANS[k].rank;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const extras = (P) => ({ xa: Math.max(0, USE.admins - P.admins), xe: Math.max(0, USE.emps - P.emps) });
  const extraCost = (P) => { const x = extras(P); return x.xa * P.xa + x.xe * P.xe; };
  const monthly = (P) => P.price + extraCost(P);
  const gained = (from, to) => [...FEATS.filter(([, m]) => rank(m) > rank(from) && rank(m) <= rank(to)).map(f => f[2]), ...ORDER.filter(k => rank(k) > rank(from) && rank(k) <= rank(to)).flatMap(k => SVC[k].map(x => x.toLowerCase()))];
  const lost = (from, to) => gained(to, from);
  const seatSentence = (P) => { const x = extras(P); if (!x.xa && !x.xe) return `all of your ${plural(USE.admins, 'admin')} and ${plural(USE.emps, 'employee')} are included`; const parts = []; if (x.xa) parts.push(`${plural(x.xa, 'extra admin seat')}`); if (x.xe) parts.push(`${plural(x.xe, 'extra employee seat')}`); return `your ${plural(USE.admins, 'admin')} and ${plural(USE.emps, 'employee')} need ${parts.join(' and ')} (${AUD(extraCost(P))} a month)`; };
  const joinList = (a) => a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  function planTop(forAccount){
    const P = B.cur ? PLANS[B.cur] : null; let pill = ['', ''], title = '', line = '', lineCls = '';
    if (B.state === 'tester') { pill = ['Tester program', 'ok']; title = 'Full access · tester program'; line = `Free until ${TESTER_END} · no billing · invited by Paint Trade HQ`; }
    else if (B.state === 'trial') { pill = ['Free trial', 'warn']; title = `${P.name} · free trial`; line = `9 days left · ends ${TRIAL_END} · no card yet`; }
    else { pill = [P.name, 'acc']; title = `${P.name} · ${AUD(P.price)} a month`;
      if (B.state === 'past_due') { line = `Payment failed · update your card by ${PAST_DUE_BY} or the app locks until it is paid`; lineCls = 'bad'; }
      else if (B.cancelling) line = `Cancels on ${PERIOD_END} · you keep everything until then`;
      else if (B.pending) line = `Switches to ${PLANS[B.pending].name} on ${PERIOD_END} · until then nothing changes`;
      else line = `Active · renews ${PERIOD_END} · Visa ending 4242`; }
    const acts = forAccount ? `<button class="btn btn-ghost" id="acctManage" data-testid="account-manage-billing">${svg('card')} Manage billing ${svg('arrowr')}</button>` : actions();
    return `<div class="top"><span class="bl-pill ${pill[1]}" data-testid="${forAccount ? 'account-plan-pill' : 'bl-plan-pill'}">${esc(pill[0])}</span><div class="t"><b data-testid="${forAccount ? 'account-plan-title' : 'bl-plan-title'}">${esc(title)}</b><span class="${lineCls}" data-testid="${forAccount ? 'account-plan-line' : 'bl-plan-line'}">${esc(line)}</span></div><div class="acts">${acts}</div></div>`;
  }
  function actions(){
    if (B.state === 'tester') return '';
    if (B.state === 'trial') return `<button class="btn btn-primary" data-act="card" data-testid="bl-add-card">${svg('card')} Add a card</button>`;
    if (B.state === 'past_due') return `<button class="btn btn-primary" data-act="payment" data-testid="bl-payment">${svg('card')} Update card</button><button class="btn btn-ghost" data-act="invoices" data-testid="bl-invoices">${svg('receipt')} Invoices</button>`;
    if (B.cancelling) return `<button class="btn btn-ghost" data-act="invoices" data-testid="bl-invoices">${svg('receipt')} Invoices</button><button class="btn btn-primary" data-act="resume" data-testid="bl-resume">${svg('undo')} Resume plan</button>`;
    let h = `<button class="btn btn-ghost" data-act="payment" data-testid="bl-payment">${svg('card')} Payment method</button><button class="btn btn-ghost" data-act="invoices" data-testid="bl-invoices">${svg('receipt')} Invoices</button>`;
    if (B.pending) h += `<button class="btn btn-ghost" data-act="keep" data-testid="bl-keep">Keep ${esc(PLANS[B.cur].name)}</button>`;
    return h + `<button class="btn danger" data-act="cancel" data-testid="bl-cancel">Cancel plan</button>`;
  }
  function facts(){
    if (B.state === 'tester') return [['Admins', `${USE.admins}`, 'No seat limits during the tester program'], ['Employees', `${USE.emps}`, 'Counted against a plan when you choose one'], ['Next invoice', 'None', 'Nothing is charged before you choose a plan']];
    const P = PLANS[B.cur]; const x = extras(P);
    const a = ['Admins', `${USE.admins} of ${P.admins} included`, x.xa ? `${plural(x.xa, 'extra seat')} · ${AUD(x.xa * P.xa)} a month` : 'Within your plan'];
    const e = ['Employees', `${USE.emps} of ${P.emps} included`, x.xe ? `${plural(x.xe, 'extra seat')} · ${AUD(x.xe * P.xe)} a month` : 'Within your plan'];
    let n;
    if (B.state === 'trial') n = ['Next invoice', '—', `Add a card to continue after ${TRIAL_END} · ${AUD(monthly(P))} a month with your team as it is`];
    else if (B.cancelling) n = ['Next invoice', 'None', `The plan ends ${PERIOD_END}`];
    else if (B.pending) { const Q = PLANS[B.pending]; n = ['Next invoice', `${AUD(monthly(Q))} on ${PERIOD_END}`, `${Q.name} ${AUD(Q.price)}${extraCost(Q) ? ` + seats ${AUD(extraCost(Q))}` : ''}`]; }
    else n = ['Next invoice', `${AUD(monthly(P))} on ${PERIOD_END}`, `${P.name} ${AUD(P.price)}${extraCost(P) ? ` + seats ${AUD(extraCost(P))}` : ''}`];
    return [a, e, n];
  }
  function renderPlan(){
    const ids = ['bl-seat-admins', 'bl-seat-emps', 'bl-next-invoice'];
    $('#blPlan').innerHTML = planTop(false) + `<div class="bl-facts">${facts().map(([k, v, d], i) => `<div class="bl-fact" data-testid="${ids[i]}"><small>${esc(k)}</small><b>${esc(v)}</b><span>${esc(d)}</span></div>`).join('')}</div>` +
      `<div class="bl-note">${B.state === 'tester' ? 'When your tester access ends you choose a plan here. Nothing is charged before you do.' : 'Seats follow your Team admins and Employees pages: add someone there and the seat is added here; remove them and it drops off at the next invoice.'}</div>`;
    $('#acctSub').innerHTML = planTop(true);
  }
  function cardButton(P){
    if (B.state === 'tester') return `<button class="btn btn-ghost" disabled data-testid="bl-switch-${P.key}">Choose when your access ends</button>`;
    if (B.state === 'trial') return `<button class="btn ${P.key === B.cur ? 'btn-primary' : 'btn-ghost'}" data-choose="${P.key}" data-testid="bl-switch-${P.key}">Choose ${esc(P.name)}</button>`;
    if (P.key === B.cur) return `<button class="btn btn-ghost" disabled data-testid="bl-switch-${P.key}">${svg('check')} Your plan</button>`;
    if (P.key === B.pending) return `<button class="btn btn-ghost" disabled data-testid="bl-switch-${P.key}">Switching on ${PERIOD_END.slice(0, 6)}</button>`;
    return `<button class="btn ${rank(P.key) > rank(B.cur) ? 'btn-primary' : 'btn-ghost'}" data-switch="${P.key}" data-testid="bl-switch-${P.key}">Switch to ${esc(P.name)}</button>`;
  }
  function diffLine(P){
    if (B.state === 'tester') return `Available when your tester access ends. With your ${plural(USE.admins, 'admin')} and ${plural(USE.emps, 'employee')}: <b>${AUD(monthly(P))} a month</b>.`;
    if (B.state === 'trial') return P.key === B.cur ? `You are trialling this plan. <b>${AUD(monthly(P))} a month</b> after ${TRIAL_END} with your team as it is.` : `<b>${AUD(monthly(P))} a month</b> with your current team: ${seatSentence(P)}.`;
    if (P.key === B.cur) return `Your plan since ${SINCE}.`;
    const up = rank(P.key) > rank(B.cur); const list = up ? gained(B.cur, P.key) : lost(B.cur, P.key);
    return `<b>Switching ${up ? 'adds' : 'drops'}:</b> ${esc(cap(joinList(list)))}. <b>Seats:</b> ${esc(seatSentence(P))}. <b>${AUD(monthly(P))} a month</b>${!up && monthly(P) >= monthly(PLANS[B.cur]) ? ' — no saving with your team size' : ''}.`;
  }
  function renderCards(){
    $('#blCards').innerHTML = ORDER.map(k => { const P = PLANS[k]; const cur = k === B.cur; const prev = ORDER[rank(k) - 2];
      const items = [...FEATS.filter(f => f[1] === k).map(f => f[0]), ...SVC[k]];
      return `<div class="bl-card ${cur ? 'cur' : ''}" data-testid="bl-card-${k}">${cur ? `<span class="rib">${B.state === 'trial' ? 'Trialling' : 'Your plan'}</span>` : ''}
        <h4>${esc(P.name)}</h4>
        <div class="price"><b>${AUD(P.price)}</b><span>a month · AUD</span></div>
        <div class="for">${esc(P.who)}</div>
        <div class="seats">${plural(P.admins, 'admin')} + ${P.emps} employees included<small>Extra admin ${AUD(P.xa)} · extra employee ${AUD(P.xe)} a month</small></div>
        ${prev ? `<div class="pl">Everything in ${esc(PLANS[prev].name)}, plus</div>` : '<div class="pl">Includes</div>'}
        <ul>${items.map(x => `<li>${svg('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
        <div class="diff" data-testid="bl-diff-${k}">${diffLine(P)}</div>
        ${cardButton(P)}
      </div>`; }).join('');
  }
  function renderCompare(){
    const tick = (on) => on ? `<td class="${''}">${svg('check')}</td>` : `<td class="off">—</td>`;
    const colCls = (k) => k === B.cur ? ' class="cur"' : '';
    const row = (label, cells) => `<tr><td>${esc(label)}</td>${ORDER.map((k, i) => `<td${colCls(k)}>${cells[i]}</td>`).join('')}</tr>`;
    const grp = (t) => `<tr class="grp"><td colspan="4">${esc(t)}</td></tr>`;
    let h = `<table><thead><tr><th>What you get</th>${ORDER.map(k => `<th${colCls(k)}>${esc(PLANS[k].name)}${k === B.cur ? ' · yours' : ''}</th>`).join('')}</tr></thead><tbody>`;
    h += row('Price a month', ORDER.map(k => AUD(PLANS[k].price)));
    h += row('Admins included', ORDER.map(k => PLANS[k].admins));
    h += row('Employees included', ORDER.map(k => k === 'enterprise' ? `${PLANS[k].emps} active` : PLANS[k].emps));
    h += row('Extra admin seat', ORDER.map(k => AUD(PLANS[k].xa) + ' a month'));
    h += row('Extra employee seat', ORDER.map(k => AUD(PLANS[k].xe) + ' a month'));
    h += grp('Features');
    FEATS.forEach(([label, min]) => { h += `<tr><td>${esc(label)}</td>${ORDER.map(k => rank(k) >= rank(min) ? `<td${colCls(k)}>${svg('check')}</td>` : `<td class="off${k === B.cur ? ' cur' : ''}">—</td>`).join('')}</tr>`; });
    h += grp('Service');
    h += row('Training', ['—', '1 hour, one person', '1 hour per person']);
    h += row('Data migration from your old software', ['Quoted', 'Quoted', 'Free']);
    h += '</tbody></table>';
    $('#blCompare').innerHTML = h;
  }
  function renderFaq(){
    const Q = [
      ['Billing', 'Prices are in Australian dollars a month, billed monthly to your card through Stripe. Change or cancel any time.'],
      ['Switching plans', 'Upgrades start today and Stripe charges the difference for the rest of the month. Downgrades start at your next renewal, so you keep what you have paid for.'],
      ['Seats', 'An admin is anyone on your Team admins list. An employee is a crew member on your Employees page who has not been removed. Pass the included number and a seat is added at the plan\'s seat price; remove someone and it drops off at the next invoice.'],
      ['When a plan ends', 'If a payment fails, update the card by the date shown above. After that, or when a cancelled plan runs out, the app locks until a plan is chosen again. Your quotes, clients, invoices and files stay.'],
      ['Training and data migration', 'Small business includes one hour of training for one person; Enterprise one hour per person. Moving your data from old software is free on Enterprise and quoted on the other plans.'],
      ['Tester program', 'Businesses invited by Paint Trade HQ have full access, free, until their invite ends. Then they choose a plan here.'] ];
    $('#blFaq').innerHTML = Q.map(([q, a]) => `<div><b>${esc(q)}</b>${esc(a)}</div>`).join('');
  }
  function renderBilling(){ renderPlan(); renderCards(); renderCompare(); }

  // drawer
  function openDrawer(title, sub, body, foot){ $('#blDTitle').textContent = title; $('#blDSub').textContent = sub; $('#blDBody').innerHTML = body; $('#blDFoot').innerHTML = foot; $('#blScrim').hidden = false; }
  function closeDrawer(){ $('#blScrim').hidden = true; }
  function openSwitch(key){
    const P = PLANS[key], C = PLANS[B.cur]; const up = rank(key) > rank(B.cur);
    const body = up
      ? `<div><b>What you gain</b>${esc(cap(joinList(gained(B.cur, key))))}.</div><div><b>Seats</b>${esc(cap(seatSentence(P)))}.</div><div><b>From today</b>Stripe charges the difference between ${esc(C.name)} and ${esc(P.name)} for the rest of this period, to ${PERIOD_END}. Then the new amount each month.</div><div class="big">${AUD(monthly(P))} a month<small>${esc(P.name)} ${AUD(P.price)}${extraCost(P) ? ` + seats ${AUD(extraCost(P))}` : ' · all seats included'}</small></div>`
      : `<div><b>What switches off on ${PERIOD_END}</b>${esc(cap(joinList(lost(B.cur, key))))}. The pages stay in the sidebar with a note, nothing is deleted.</div><div><b>Seats</b>${esc(cap(seatSentence(P)))}.</div><div><b>Until then</b>Nothing changes. You keep ${esc(C.name)} to the end of what you have paid for.</div><div class="big">${AUD(monthly(P))} a month from ${PERIOD_END}<small>${esc(P.name)} ${AUD(P.price)}${extraCost(P) ? ` + seats ${AUD(extraCost(P))}` : ''}</small></div>`;
    openDrawer(`Switch to ${P.name}`, up ? 'Starts today.' : `Starts on ${PERIOD_END}, when the current period ends.`, body,
      `<button class="btn btn-ghost" data-act="close">Not now</button><button class="btn btn-primary" data-confirm="switch" data-key="${key}" data-testid="bl-drawer-confirm">Switch to ${esc(P.name)}</button>`);
  }
  function openCancel(){
    const C = PLANS[B.cur];
    openDrawer('Cancel your plan', `You keep ${C.name} until ${PERIOD_END}.`,
      `<div><b>After ${PERIOD_END}</b>The app locks until you choose a plan again. Your quotes, clients, invoices and files stay, and you can export them before then.</div><div><b>Seats</b>Extra seats stop with the plan. Nothing more is charged.</div><div><b>Changed your mind later?</b>Resume from this page any time before ${PERIOD_END} and nothing is lost.</div>`,
      `<button class="btn btn-ghost" data-act="close">Keep my plan</button><button class="btn danger" data-confirm="cancel" data-testid="bl-drawer-confirm">Cancel on ${PERIOD_END.slice(0, 6)}</button>`);
  }
  document.addEventListener('click', e => {
    let x;
    if (e.target.id === 'acctManage' || e.target.closest('#acctManage')) { $('[data-testid="set-rail-billing"]').click(); return; }
    if ((x = e.target.closest('[data-switch]'))) { openSwitch(x.dataset.switch); return; }
    if ((x = e.target.closest('[data-choose]'))) { say(`Stripe checkout for ${PLANS[x.dataset.choose].name} · POST /billing/create-checkout-session`); return; }
    if ((x = e.target.closest('[data-confirm]'))) {
      if (x.dataset.confirm === 'switch') { const k = x.dataset.key; if (rank(k) > rank(B.cur)) { B.cur = k; B.pending = null; say(`Plan changed to ${PLANS[k].name} · POST /billing/change-plan`); } else { B.pending = k; say(`Switch to ${PLANS[k].name} set for ${PERIOD_END} · POST /billing/change-plan`); } }
      else { B.cancelling = true; B.pending = null; say(`Plan cancels on ${PERIOD_END} · POST /billing/cancel`); }
      closeDrawer(); renderBilling(); return; }
    if ((x = e.target.closest('[data-act]'))) { const a = x.dataset.act;
      if (a === 'close') closeDrawer();
      else if (a === 'cancel') openCancel();
      else if (a === 'resume') { B.cancelling = false; renderBilling(); say('Plan resumed · POST /billing/resume'); }
      else if (a === 'keep') { B.pending = null; renderBilling(); say(`Staying on ${PLANS[B.cur].name} · DELETE /billing/change-plan`); }
      else if (a === 'payment') say('Stripe: payment method · POST /billing/customer-portal');
      else if (a === 'invoices') say('Stripe: invoices · POST /billing/customer-portal');
      else if (a === 'card') say('Stripe checkout · POST /billing/create-checkout-session');
      return; }
    if (e.target.id === 'blClose' || e.target.closest('#blClose') || e.target.id === 'blScrim') { closeDrawer(); return; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#blScrim').hidden) closeDrawer(); });
  renderBilling(); renderFaq();

  const SUBS = { business: 'Account-wide details only. Everything that belongs to one page lives behind the gear on that page.', crew: 'The crew app follows these settings on every phone. Changes reach the crew the next time they open the app. Invites and approvals live on the Employees page.', account: 'Your plan, your details, the admins on your team and your sign-in security.', billing: 'Your plan and your seats in one place. Payment details and receipts open in Stripe.', platform: 'Platform admin only.' };
  const setSub = (n) => { $('#pageSub').textContent = SUBS[n] || SUBS.business; };
  setSub(['business','crew','account','billing','platform'].includes(pageName) ? pageName : 'business');
  $$('.rail a').forEach(a => a.addEventListener('click', () => setSub(a.dataset.page)));"""
s = rep(s, OLD_SUB, JS)

open('settings-billing.html', 'w', encoding='utf-8').write(s)
print('settings-billing.html', len(s))
