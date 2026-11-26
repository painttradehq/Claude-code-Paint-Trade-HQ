#!/usr/bin/env python3
"""Lucy does the work — confirm first. Builds lucy-operator.html from lucy-chat-notion.html (the box as built in Round 73).

Nothing of the box changes except: the greeting, the "What can Lucy do?" paragraph, two more verb rows, the placeholder,
and a new kind of message — the action card ("Lucy is about to …") that waits for Approve.
Run from the repo root: python3 tools/make_lucy_operator.py
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
src = (ROOT / "lucy-chat-notion.html").read_text()


def rep(old: str, new: str, count: int = 1) -> None:
    global src
    assert src.count(old) >= 1, f"anchor not found: {old[:70]!r}"
    src = src.replace(old, new, count)


PERMS_HTML = """<div class="qs-sec" id="lzPerms" data-testid="lucy-perms"><h3>What Lucy can do</h3>
        <p class="lz-hint">Lucy always shows you what she is about to do and waits for your OK. This sets what she is allowed to offer at all.</p>
        __AREAS__
        <div class="sw"><div class="t"><b>Send for me</b><span>Quotes, invoices, reminders and emails. You see each one before it goes.</span></div><label class="tog"><input type="checkbox" id="pSend" data-testid="lucy-perm-send"><span class="tr"></span></label></div>
        <div class="sw"><div class="t"><b>Delete records</b><span>One at a time, and you type its number.</span></div><label class="tog"><input type="checkbox" id="pDelete" data-testid="lucy-perm-delete"><span class="tr"></span></label></div>
        <div class="lz-sub">Email and files</div>
        <div class="sw"><div class="t"><b>Email</b><span id="pMailWho" data-testid="lucy-perm-mail-who"></span></div><div class="lz-seg" data-perm="mail" data-testid="lucy-perm-mail"><button data-v="off">Off</button><button data-v="read">Read</button><button data-v="send">Read and send</button></div></div>
        <div class="sw"><div class="t"><b>Files</b><span id="pFilesWho" data-testid="lucy-perm-files-who"></span></div><div class="lz-seg" data-perm="files" data-testid="lucy-perm-files"><button data-v="off">Off</button><button data-v="read">Read</button><button data-v="change">Read and change</button></div></div>
      </div>
      """
AREAS = [("quotes", "Quotes", "Start, change and follow up quotes."), ("clients", "Clients and leads", "Add and update clients, leads, notes and calls."), ("jobs", "Jobs", "Jobs, expenses, hire and variations."),
         ("invoices", "Invoices", "Raise and change invoices, record payments."), ("calendar", "Calendar and reminders", "Events, reminders and ideas."), ("crew", "Crew and HR", "Timesheet fixes, notes, contract wording."),
         ("library", "Library and products", "Items, tasks, products and suppliers.")]
PERMS_HTML = PERMS_HTML.replace("__AREAS__", "\n        ".join(
    f'<div class="sw"><div class="t"><b>{n}</b><span>{d}</span></div><div class="lz-seg" data-perm="{k}" data-testid="lucy-perm-{k}"><button data-v="read">Read</button><button data-v="change">Read and change</button></div></div>' for k, n, d in AREAS))

CSS = r"""
  /* ===== Lucy does the work — the action card ===== */
  .lz-card{ align-self:stretch; background:var(--surface); border:1px solid var(--border-strong); border-radius:14px; padding:12px 12px 11px; font-size:13px; line-height:1.45; }
  .lz-card.delete{ border-color:var(--danger); }
  .lz-card.off{ opacity:.72; }
  .lz-kick{ display:flex; align-items:center; gap:6px; font-size:10.5px; font-weight:800; letter-spacing:.06em; text-transform:uppercase; color:var(--accent); }
  .lz-kick svg{ width:13px; height:13px; }
  .lz-card.delete .lz-kick{ color:var(--danger); }
  .lz-card.done .lz-kick{ color:var(--success); }
  .lz-card.off .lz-kick{ color:var(--text-muted); }
  .lz-title{ font-family:var(--font-display); font-size:16px; font-weight:600; margin:3px 0 7px; }
  .lz-row{ display:flex; justify-content:space-between; gap:12px; padding:5px 0; border-top:1px solid var(--border); }
  .lz-row span{ color:var(--text-muted); flex:none; }
  .lz-row b{ font-weight:600; text-align:right; min-width:0; overflow-wrap:anywhere; }
  .lz-steps{ list-style:none; margin:0; padding:0; }
  .lz-steps li{ display:flex; gap:9px; padding:7px 0; border-top:1px solid var(--border); }
  .lz-steps li i{ width:18px; height:18px; border-radius:50%; border:1.5px solid var(--border-strong); flex:none; display:grid; place-items:center; font-style:normal; font-size:11px; font-weight:700; color:var(--text-muted); margin-top:1px; }
  .lz-steps li.now i{ border-color:var(--accent); color:var(--accent); }
  .lz-steps li.ok i{ background:var(--success); border-color:var(--success); color:#fff; }
  .lz-steps li div{ min-width:0; }
  .lz-steps li b{ display:block; font-weight:600; }
  .lz-steps li span{ display:block; color:var(--text-secondary); font-size:12.5px; overflow-wrap:anywhere; }
  .lz-mail pre{ white-space:pre-wrap; font:inherit; font-size:12.5px; background:var(--surface-sunken); border-radius:8px; padding:8px 10px; margin:7px 0 6px; overflow-wrap:anywhere; }
  .lz-att{ font-size:12px; color:var(--text-secondary); }
  .lz-sig{ white-space:pre-line; font-size:12px; color:var(--text-muted); margin:0 0 6px; line-height:1.45; }
  .lz-sig span{ display:block; font-size:10.5px; letter-spacing:.06em; text-transform:uppercase; font-weight:800; margin-bottom:2px; }
  .lz-checks{ margin-top:8px; padding:8px 10px; border-radius:8px; background:var(--success-bg); color:var(--success); font-size:12.5px; display:grid; gap:2px; }
  .lz-checks b{ font-size:10.5px; letter-spacing:.06em; text-transform:uppercase; }
  .lz-checks.red{ background:var(--danger-bg); color:var(--danger); }
  .lz-checks .lz-link{ justify-self:start; margin-top:6px; }
  .lz-warn{ margin-top:8px; padding:8px 10px; border-radius:8px; background:var(--danger-bg); color:var(--danger); font-size:12.5px; font-weight:600; }
  .lz-confirm{ margin-top:9px; }
  .lz-confirm label{ display:block; font-size:12px; color:var(--text-secondary); margin-bottom:4px; }
  .lz-confirm input{ width:100%; box-sizing:border-box; height:34px; border:1px solid var(--border-strong); border-radius:8px; padding:0 10px; font-family:var(--font-mono); font-size:13px; }
  .lz-btns{ display:flex; gap:6px; flex-wrap:wrap; margin-top:10px; }
  .lz-btn{ height:32px; padding:0 12px; border-radius:8px; border:1px solid var(--border-strong); background:var(--surface); font:inherit; font-size:12.5px; font-weight:600; color:var(--accent-ink); cursor:pointer; }
  .lz-btn.pri{ background:var(--accent); border-color:var(--accent); color:#fff; }
  .lz-btn.red{ background:var(--danger); border-color:var(--danger); color:#fff; }
  .lz-btn.quiet{ border-color:transparent; color:var(--text-secondary); }
  .lz-btn[disabled]{ opacity:.45; cursor:not-allowed; }
  .lz-state{ margin-top:9px; font-weight:600; }
  .lz-state.ok{ color:var(--success); }
  .lz-state.run{ color:var(--accent); }
  .lz-state.off{ color:var(--text-secondary); font-weight:500; }
  .lz-meta{ font-size:11.5px; color:var(--text-muted); margin-top:2px; }
  .lz-link{ margin-top:8px; height:30px; padding:0 11px; border-radius:8px; border:1px solid var(--border-strong); background:var(--surface); font:inherit; font-size:12.5px; font-weight:600; color:var(--accent-ink); cursor:pointer; }
  .lz-offer{ display:inline-flex; margin-top:8px; height:30px; align-items:center; padding:0 11px; border-radius:8px; border:1px solid var(--border-strong); background:var(--surface); font:inherit; font-size:12.5px; font-weight:600; color:var(--accent-ink); cursor:pointer; white-space:normal; }

  /* ===== a bigger Lucy: a panel down the right-hand side, with a wider setting ===== */
  .tc{ top:16px; right:16px; bottom:16px; height:auto; max-height:none; width:560px; }
  .tc.wide{ width:760px; }
  @media (max-width:1180px){ .tc{ width:480px; } .tc.wide{ width:640px; } }
  .tc .msg{ font-size:14px; }
  .tc-head .tools .lz-wide svg{ width:17px; height:17px; }
  [data-tab="help"]{ display:none !important; }
  /* next steps under an answer or a finished card */
  .lz-next{ display:flex; flex-wrap:wrap; gap:6px; margin-top:9px; }
  .lz-next button{ height:30px; padding:0 11px; border-radius:999px; border:1px solid var(--border-strong); background:var(--accent-bg); font:inherit; font-size:12.5px; font-weight:600; color:var(--accent-ink); cursor:pointer; white-space:normal; text-align:left; }
  .lz-card.report .lz-kick{ color:var(--accent); }
  /* Lucy's setup › What Lucy can do */
  .lz-hint{ font-size:12.5px; color:var(--text-secondary); margin:-4px 0 6px; line-height:1.5; }
  .lz-seg{ display:inline-flex; border:1px solid var(--border-strong); border-radius:8px; overflow:hidden; flex:none; }
  .lz-seg button{ height:30px; padding:0 10px; border:none; background:var(--surface); font:inherit; font-size:12.5px; font-weight:600; color:var(--text-secondary); cursor:pointer; white-space:nowrap; }
  .lz-seg button + button{ border-left:1px solid var(--border-strong); }
  .lz-seg button.on{ background:var(--accent-bg); color:var(--accent-ink); }
  .lz-seg[aria-disabled="true"]{ opacity:.45; pointer-events:none; }
  .lz-sub{ font-size:11px; font-weight:700; letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); margin:16px 0 2px; }
  /* a tester's reports */
  .lz-reports .lz-back{ border:none; background:none; font:inherit; font-size:12.5px; font-weight:600; color:var(--accent-ink); cursor:pointer; padding:0; margin-bottom:8px; }
  .lz-rep{ background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:10px 12px; margin-bottom:8px; font-size:13px; }
  .lz-rep .top{ display:flex; align-items:center; gap:8px; }
  .lz-rep .id{ font-family:var(--font-mono); font-size:11.5px; color:var(--text-secondary); }
  .lz-rep .chip{ margin-left:auto; font-size:11px; font-weight:700; padding:2px 8px; border-radius:999px; background:var(--surface-sunken); color:var(--text-secondary); }
  .lz-rep .chip.Fixed{ background:var(--success-bg); color:var(--success); }
  .lz-rep .chip.Logged{ background:var(--accent-bg); color:var(--accent-ink); }
  .lz-rep .what{ font-weight:600; margin:4px 0 2px; }
  .lz-rep .meta{ font-size:12px; color:var(--text-muted); }
  .lz-rep .reply{ margin-top:7px; padding:7px 9px; border-radius:8px; background:var(--surface-sunken); font-size:12.5px; }
  .lz-rep .reply b{ display:block; font-size:10.5px; letter-spacing:.06em; text-transform:uppercase; color:var(--text-muted); font-weight:800; margin-bottom:2px; }
  .lz-rep button{ margin-top:8px; height:28px; padding:0 10px; border-radius:8px; border:1px solid var(--border-strong); background:var(--surface); font:inherit; font-size:12px; font-weight:600; color:var(--accent-ink); cursor:pointer; }
"""

JS = r"""
/* ===== Lucy does the work — confirm first (prototype). One card at a time; nothing happens before Approve. ===== */
const ACT_ICON = {
  change: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16v4z"/></svg>',
  plan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"/></svg>',
  delete: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
};
let ACT_N = 0;
const nowHm = () => new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
const actCard = (kind, flow, o) => Object.assign({ role: 'act', id: 'a' + (++ACT_N), kind, flow, state: 'ask', typed: '', at: 0 }, o);
ACT_ICON.report = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>';
const ACT_OK = { change: 'Approve', plan: 'Approve all', send: 'Send it', delete: 'Delete', report: 'Log it' };
const TESTER = !/[?&]tester=0/.test(location.search);  // the tester program flag — reports are offered only while it is on
const REPORTS = [
  { id: 'FB-3bea7197', text: 'The Notes tab on a job goes blank', page: 'Live Projects › a job', at: '12 Nov', status: 'Fixed', reply: 'Fixed in the 15 November update. Thanks for the clear steps.' },
  { id: 'FB-247c7747', text: 'Would like a work order number on a quote', page: 'Quotes › builder', at: '13 Nov', status: 'Parked', reply: 'A good idea — it is on the list for later.' },
];
const nextHtml = (m) => (m.next && m.next.length && (m.role !== 'act' || m.state === 'done')) ? `<div class="lz-next" data-testid="lucy-next">${m.next.map(([l, t]) => `<button data-say="${esc(t)}">${esc(l)}</button>`).join('')}</div>` : '';
const lucyNext = (text) => /owed/i.test(text) ? [['Send a reminder for INV-0009', 'Send a payment reminder for INV-0009']] : /quiet/i.test(text) ? [['Remind me tomorrow to follow them up', 'Remind me tomorrow to follow up the quiet quotes']] : null;
function reportsHtml(){
  return `<div class="lz-reports" data-testid="lucy-reports"><button class="lz-back" data-lz="back" data-testid="lucy-reports-back">← Back to Lucy</button><div class="lbl">Problems you have reported · ${REPORTS.length}</div>${REPORTS.map(r => `<div class="lz-rep" data-testid="lucy-report-${r.id}"><div class="top"><span class="id">${r.id}</span><span class="chip ${r.status}">${r.status}</span></div><div class="what">${esc(r.text)}</div><div class="meta">${esc(r.page)} · ${r.at}</div>${r.reply ? `<div class="reply"><b>The team</b>${esc(r.reply)}</div>` : ''}<button data-lz="add" data-rid="${r.id}">Add to this report</button></div>`).join('')}</div>`;
}
function actHtml(m){
  const st = m.state, n = (m.steps || []).length;
  const kick = st === 'ask' ? 'Lucy is about to' : st === 'running' ? 'Lucy is working' : st === 'done' ? 'Lucy did' : 'Not done';
  const steps = n ? `<ol class="lz-steps">${m.steps.map((s, i) => `<li class="${st === 'done' || (st === 'running' && i < m.at) ? 'ok' : st === 'running' && i === m.at ? 'now' : ''}" data-testid="lucy-act-step-${i + 1}"><i>${st === 'done' || (st === 'running' && i < m.at) ? '✓' : i + 1}</i><div><b>${esc(s[0])}</b><span>${esc(s[1])}</span></div></li>`).join('')}</ol>` : '';
  const mail = m.mail ? `<div class="lz-mail" data-testid="lucy-act-mail"><div class="lz-row"><span>To</span><b>${esc(m.mail.to)}</b></div><div class="lz-row"><span>Subject</span><b>${esc(m.mail.subject)}</b></div><pre>${esc(m.mail.body)}</pre>${m.mail.sig ? `<div class="lz-sig" data-testid="lucy-act-sig"><span>Signature · from Messages setup</span>${esc(m.mail.sig)}</div>` : ''}<div class="lz-att">${m.mail.att ? 'Attached: ' + esc(m.mail.att) : esc(m.mail.link || '')}</div></div>` : '';
  const checks = m.checks && st === 'ask' ? `<div class="lz-checks ${m.blocked ? 'red' : ''}" data-testid="lucy-act-checks"><b>${m.blocked ? `${m.checks.length} thing${m.checks.length === 1 ? '' : 's'} to fix before it can go` : 'Checked'}</b>${m.checks.map(c => `<span>${esc(c)}</span>`).join('')}${m.blocked ? `<button class="lz-link" data-act="fix" data-testid="lucy-act-fix">${esc(m.fix)}</button>` : ''}</div>` : '';
  const rows = (m.rows || []).map(([k, v]) => `<div class="lz-row"><span>${esc(k)}</span><b>${v}</b></div>`).join('');
  const warn = m.warn && st === 'ask' ? `<div class="lz-warn" data-testid="lucy-act-warn">${esc(m.warn)}</div>` : '';
  const confirm = m.kind === 'delete' && st === 'ask' ? `<div class="lz-confirm"><label for="in-${m.id}">Type ${esc(m.confirm)} to delete it</label><input id="in-${m.id}" data-actin="${m.id}" data-testid="lucy-act-confirm-input" value="${esc(m.typed)}" autocomplete="off" spellcheck="false"></div>` : '';
  const okLabel = m.kind === 'plan' ? `Approve all ${n} steps` : m.kind === 'delete' ? `Delete ${esc(m.confirm)}` : ACT_OK[m.kind];
  const foot = st === 'ask' ? `<div class="lz-btns"><button class="lz-btn ${m.kind === 'delete' ? 'red' : 'pri'}" data-act="ok" data-testid="lucy-act-approve" ${(m.kind === 'delete' && m.typed.trim().toUpperCase() !== m.confirm) || m.blocked ? 'disabled' : ''}>${okLabel}</button>${m.kind === 'delete' ? '' : '<button class="lz-btn" data-act="change" data-testid="lucy-act-change">Change something</button>'}<button class="lz-btn quiet" data-act="no" data-testid="lucy-act-cancel">Cancel</button></div>`
    : st === 'running' ? `<div class="lz-state run" data-testid="lucy-act-state">Working${n ? ` — step ${Math.min(m.at + 1, n)} of ${n}` : ''}…</div>`
    : st === 'done' ? `<div class="lz-state ok" data-testid="lucy-act-state">✓ ${esc(m.doneText)}</div><div class="lz-meta">Approved by ${ME} · ${m.when}</div>${m.link ? `<button class="lz-link" data-act="open" data-testid="lucy-act-link">${esc(m.link)}</button>` : ''}${nextHtml(m)}`
    : `<div class="lz-state off" data-testid="lucy-act-state">${esc(m.offText || 'Cancelled — nothing was changed.')}</div>`;
  return `<div class="lz-card ${m.kind} ${st === 'done' ? 'done' : st === 'cancelled' ? 'off' : ''}" data-actid="${m.id}" data-kind="${m.kind}" data-state="${st}" data-testid="lucy-act"><div class="lz-kick">${ACT_ICON[m.kind]}<span data-testid="lucy-act-kick">${kick}</span></div><div class="lz-title" data-testid="lucy-act-title">${esc(m.title)}</div>${steps}${mail}${rows}${checks}${warn}${confirm}${foot}</div>`;
}
const fmtAud = (x) => '$' + Number(x).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const FLOWS = {
  expense: (amt) => ['I found the job and checked its expenses — nothing like this is logged yet.', ['list_projects'],
    actCard('change', 'expense', { title: 'Add an expense', amt, rows: [['Job', '20 Convention Centre Place, South Wharf'], ['What', 'Skip bin hire'], ['Amount', fmtAud(amt)], ['Category', 'Materials'], ['Date', 'Today']], doneText: 'Expense added to the South Wharf job.', link: 'Open the job' })],
  quote: () => ['Leanne Crowe is already a client, and your Library has every item this needs. Here is the plan.', ['search_clients', 'list_pending_estimates'],
    actCard('plan', 'quote', { title: 'Start a quote for Leanne Crowe', steps: [['Start a draft quote', 'Residential exterior · 12 Ivanhoe Pde, Ivanhoe'], ['Add two zones', 'Front facade · Side and rear walls'], ['Add five lines from your Library', 'Weatherboards, fascia, eaves, two doors, prep — at your Library rates'], ['Set the payment plan', '50% deposit · 50% on completion (your default)']],
      rows: [['Total', '$8,460.00 + GST'], ['Status', 'Draft — nothing is sent']], doneText: 'EST-0046 is ready as a draft.', link: 'Open EST-0046', next: [['Send it to Leanne', 'Send EST-0046 to Leanne']] })],
  reminder: () => ['INV-0009 is 12 days late and Jane has opened the last reminder. This is what would go out.', ['money_owed', 'recent_messages'],
    actCard('send', 'reminder', { title: 'Send a reminder for INV-0009', mail: { to: 'Jane Chen · jane.chen@example.com', subject: 'Reminder: invoice INV-0009', body: 'Hi Jane,\n\nA quick reminder that invoice INV-0009 for $233.99 was due on 13 November. The invoice and the bank transfer details are at the link below.', sig: 'Josh Sano\nSano Painting & Decorating\n0400 000 000', att: 'Invoice-INV-0009.pdf' },
      doneText: 'Reminder sent to jane.chen@example.com.', link: 'Open INV-0009' })],
  payment: (amt) => ['INV-0009 is for Jane Chen: $233.99, nothing paid yet.', ['money_owed'],
    actCard('change', 'payment', { title: 'Record a payment', amt, rows: [['Invoice', 'INV-0009 · Jane Chen'], ['Amount', fmtAud(amt === 180 ? 233.99 : amt)], ['Method', 'Bank transfer'], ['Date', 'Today'], ['After this', (amt === 180 ? 233.99 : amt) >= 233.99 ? 'Paid in full' : fmtAud(233.99 - amt) + ' still owing']], doneText: (amt === 180 ? 233.99 : amt) >= 233.99 ? 'Payment recorded. INV-0009 is paid.' : 'Payment recorded on INV-0009.', link: 'Open INV-0009' })],
  sendVariation: () => ['The variation on the Ivanhoe job is a draft with a price, and Leanne has an email. This is what would go out.', ['list_projects'],
    actCard('send', 'sendVariation', { title: 'Send a variation to Leanne Crowe', mail: { to: 'Leanne Crowe · leanne.crowe@example.com', subject: 'Extra work for your approval — 12 Ivanhoe Pde', body: 'Hi Leanne,\n\nWhile working at 12 Ivanhoe Pde we found some extra work that isn’t in your quote: extra door — rear entry. The details and the price are at the link below — you can approve or decline it there.\n\nWe won’t start it until you approve.', sig: 'Josh Sano\nSano Painting & Decorating\n0400 000 000', link: 'No attachment — the email carries the link to the approval page' },
      checks: ['Price set — $320.00 + GST ($352.00 incl. GST)', 'The client has an email'], doneText: 'Sent to leanne.crowe@example.com. The variation is now awaiting approval.', link: 'Open the job' })],
  sendBlocked: () => ['EST-0041 isn’t ready to go. These are the same checks its Review & Send shows.', ['list_pending_estimates'],
    actCard('send', 'sendBlocked', { title: 'Send EST-0041 to Mark Ellis', blocked: true, fix: 'Open EST-0041', checks: ['Side and rear walls isn’t measured', 'No job address'], mail: { to: 'Mark Ellis · mark.ellis@example.com', subject: 'Your painting quote EST-0041 from Sano Painting & Decorating', body: 'Hi Mark,\n\nThanks for the opportunity to quote. Your quote for residential exterior painting is attached and online at the link below — you can review, accept and sign there, or call me with any questions.\n\nThe quote is valid for 30 days.', sig: 'Josh Sano\nSano Painting & Decorating\n0400 000 000', att: 'Estimate-EST-0041.pdf' } })],
  report: (_amt, text) => { const what = text.replace(/^report a problem\s*:?\s*/i, '').trim(); const id = 'FB-' + Math.random().toString(16).slice(2, 10);
    return ['I’ve added the page you are on and your browser. Check it reads right.', [],
      actCard('report', 'report', { title: 'Log a problem for the Paint Trade HQ team', rep: { id, text: what }, rows: [['What happened', esc(what)], ['Page', 'Dashboard · /admin/dashboard'], ['Browser', 'Chrome · window ' + window.innerWidth + ' wide'], ['Screenshot', AI.attach ? 'Attached' : 'None — add one with + first if it helps']], doneText: 'Logged as ' + id + '. The team will see it.', link: 'My reports' })]; },
  about: (_amt, text) => { const m = /^about (fb-[0-9a-f]+)\s*:?\s*(.*)$/i.exec(text) || []; const id = (m[1] || '').toUpperCase().replace('FB-', 'FB-'); const rid = 'FB-' + (m[1] || '').slice(3);
    return ['', [], actCard('report', 'about', { title: 'Add to ' + rid, addTo: rid, addText: m[2] || '', rows: [['Report', rid], ['Adding', esc(m[2] || '')]], doneText: 'Added to ' + rid + '.', link: 'My reports' })]; },
  send: () => ['EST-0046 is a draft with no red checks, and Leanne has an email on file. This is what would go out.', ['list_pending_estimates', 'search_clients'],
    actCard('send', 'send', { title: 'Send EST-0046 to Leanne Crowe', mail: { to: 'Leanne Crowe · leanne.crowe@example.com', subject: 'Your painting quote EST-0046', body: 'Hi Leanne,\n\nThanks for the opportunity to quote. Your quote for the exterior repaint at 12 Ivanhoe Pde is attached and online at the link below — you can review, accept and sign there.\n\nThe quote is valid for 30 days.', sig: 'Josh Sano\nSano Painting & Decorating\n0400 000 000', att: 'Estimate-EST-0046.pdf' },
      checks: ['Nothing red on the quote', 'No photos attached (you can still send)'], doneText: 'Sent to leanne.crowe@example.com. EST-0046 is now Sent.', link: 'Open EST-0046' })],
  delete: () => ['EST-0040 is an empty draft made by Duplicate on 15 Nov. No job, invoice or client is linked to it.', ['list_pending_estimates'],
    actCard('delete', 'delete', { title: 'Delete a draft quote', confirm: 'EST-0040', rows: [['Quote', 'EST-0040 · draft · $0.00'], ['Client', 'None'], ['Linked', 'No job, no invoice']], warn: 'This can’t be undone.', doneText: 'EST-0040 was deleted.' })],
  variation: () => ['Here it is as a variation on the job instead.', ['list_projects'],
    actCard('change', 'variation', { title: 'Draft a variation', rows: [['Job', '12 Ivanhoe Pde, Ivanhoe'], ['Title', 'Extra door — rear entry'], ['Price', '$320.00 + GST ($352.00 incl. GST)'], ['Status', 'Draft — not sent to the client']], doneText: 'Variation drafted on the Ivanhoe job.', link: 'Open the job' })],
};
/* What Lucy can do — set in Lucy's setup. The app enforces it on the server as well; here it decides what she offers. */
const MAIL = (/[?&]mail=(\w+)/.exec(location.search) || [])[1] || 'gmail';
const STORE = (/[?&]storage=(\w+)/.exec(location.search) || [])[1] || 'drive';
const MAIL_WHO = { gmail: 'Your connected mailbox: Gmail · josh@sanopainting.example', microsoft: 'Your connected mailbox: Outlook · josh@sanopainting.example', imap: 'Your connected mailbox: your own mail server · josh@sanopainting.example', none: 'No mailbox connected — connect one in Settings › Communication' };
const STORE_WHO = { drive: 'Your storage: Google Drive · the Paint Trade HQ folder', onedrive: 'Your storage: OneDrive · the Paint Trade HQ folder', builtin: 'Your storage: Paint Trade HQ’s own storage' };
let P = { quotes: 'change', clients: 'change', jobs: 'change', invoices: 'change', calendar: 'change', crew: 'change', library: 'change', send: true, del: false, mail: MAIL === 'none' ? 'off' : 'send', files: 'change' };
let PD = Object.assign({}, P);
const lzAllowed = (k) => k === 'send' ? P.send : k === 'del' ? P.del : P[k] === 'change';
const PERM_OF = { expense: 'jobs', quote: 'quotes', refuse: 'quotes', send: 'send', reminder: 'send', sendVariation: 'send', sendBlocked: 'send', payment: 'invoices', delete: 'del' };
const PERM_OFF = { jobs: 'Changing jobs is turned off in my setup, so I can only read them.', quotes: 'Changing quotes is turned off in my setup, so I can only read them.', invoices: 'Changing invoices is turned off in my setup, so I can only read them.', send: 'Sending is turned off in my setup. I can still draft the words for you to send yourself.', del: 'Deleting is turned off in my setup.' };
function lzPaintPerms(){
  document.querySelectorAll('#lzPerms .lz-seg').forEach(g => g.querySelectorAll('button').forEach(b => { const on = PD[g.dataset.perm] === b.dataset.v; b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); }));
  $('#pSend').checked = PD.send; $('#pDelete').checked = PD.del;
  $('#pMailWho').textContent = MAIL_WHO[MAIL] || MAIL_WHO.gmail; $('#pFilesWho').textContent = STORE_WHO[STORE] || STORE_WHO.drive;
  document.querySelector('#lzPerms [data-perm="mail"]').setAttribute('aria-disabled', String(MAIL === 'none'));
}
function lzFillPerms(){ PD = Object.assign({}, P); lzPaintPerms(); }
function lzSavePerms(){ PD.send = $('#pSend').checked; PD.del = $('#pDelete').checked; P = Object.assign({}, PD); }
document.addEventListener('click', e => { const b = e.target.closest('#lzPerms .lz-seg button'); if (!b) return; e.stopPropagation(); PD[b.closest('.lz-seg').dataset.perm] = b.dataset.v; lzPaintPerms(); });
function lucyFlowOf(t){
  if (TESTER && /^about fb-/.test(t)) return 'about';
  if (TESTER && /(report a problem|found a (bug|problem)|went wrong|not working|doesn.t work|is broken)/.test(t)) return 'report';
  if (/reminder/.test(t) && /inv-/.test(t)) return 'reminder';
  if (/(record|log|add|mark).*(payment|paid)|inv-\d+.*\b(paid|payment)\b/.test(t)) return 'payment';
  if (/(send|email).*variation/.test(t)) return 'sendVariation';
  if (/(send|email).*est-0041/.test(t)) return 'sendBlocked';
  if (/(expense|skip bin)/.test(t)) return 'expense';
  if (/(send|email)/.test(t) && /(quote|est-)/.test(t)) return 'send';
  if (/(delete|remove)/.test(t)) return 'delete';
  if (/(change|update|edit|raise|drop).*(price|rate|total)/.test(t)) return 'refuse';
  if (/(start|new|draft|create|make|build).*quote|quote for/.test(t)) return 'quote';
  return null;
}
function lucyPush(lead, srcs, card){ AI.msgs.pop(); if (lead) AI.msgs.push({ role: 'ai', html: lead, src: srcs || [] }); if (card) AI.msgs.push(card); setMood(card ? 'idle' : 'done'); renderAssistant(); if (!card) setTimeout(() => { if (MOOD === 'done') setMood('idle'); }, 1400); }
function lucyDo(text){
  const t = text.toLowerCase();
  const pending = AI.msgs.find(m => m.role === 'act' && m.state === 'ask');
  const changing = pending && /^change that/.test(t);
  const flow = changing ? pending.flow : lucyFlowOf(t);
  if (pending) { pending.state = 'cancelled'; pending.offText = changing ? 'Replaced by the one below.' : 'Not done — you moved on.'; }
  if (!flow) return false;
  AI.msgs.push({ role: 'me', text }); AI.msgs.push({ role: 'typing' });
  $('#tcInput').value = ''; $('#tcInput').style.height = ''; setMood('think'); renderAssistant();
  setTimeout(() => {
    const need = PERM_OF[flow];
    if (need && !lzAllowed(need)) { lucyPush(PERM_OFF[need] + '\n<button class="lz-offer" data-lz="setup" data-testid="lucy-open-setup">Open Lucy’s setup</button>', []); return; }
    if (flow === 'refuse') { lucyPush('I can’t do that one. <b>EST-0019 is accepted, so it can’t be changed.</b> Price extra or changed work as a variation on the job «12 Ivanhoe Pde, Ivanhoe».\n<button class="lz-offer" data-offer="variation" data-testid="lucy-offer">Draft a variation instead</button>', ['list_pending_estimates']); return; }
    const m = /\$\s?(\d+(?:\.\d+)?)/.exec(text);
    const amt = m ? Number(m[1]) : (changing && pending.amt) || 180;
    if (flow === 'report' && !text.replace(/^report a problem\s*:?\s*/i, '').trim()) { lucyPush('What went wrong? Tell me what you did and what happened — I add the page and the browser myself.', []); return; }
    const [lead, srcs, card] = FLOWS[flow](amt, text);
    lucyPush(changing ? 'Changed. Here it is again.' : lead, changing ? [] : srcs, card);
  }, 700);
  return true;
}
function lucyRun(m){
  m.state = 'running'; m.at = 0; setMood('think'); renderAssistant();
  const n = Math.max(1, (m.steps || []).length);
  const tick = () => { m.at++; if (m.at >= n) { m.state = 'done'; m.when = nowHm(); if (m.rep) REPORTS.unshift({ id: m.rep.id, text: m.rep.text, page: 'Dashboard', at: 'Today', status: 'Logged', reply: '' }); if (m.addTo) { const r = REPORTS.find(x => x.id === m.addTo); if (r) r.text += ' — ' + m.addText; } setMood('done'); renderAssistant(); setTimeout(() => { if (MOOD === 'done') setMood('idle'); }, 1400); return; } renderAssistant(); setTimeout(tick, 420); };
  setTimeout(tick, 520);
}
document.addEventListener('input', e => {
  const i = e.target.closest('[data-actin]'); if (!i) return;
  const m = AI.msgs.find(x => x.id === i.dataset.actin); if (!m) return;
  m.typed = i.value; const b = i.closest('.lz-card').querySelector('[data-act="ok"]'); if (b) b.disabled = m.typed.trim().toUpperCase() !== m.confirm;
});
document.addEventListener('click', e => {
  const sayB = e.target.closest('[data-say]'); if (sayB) { e.stopPropagation(); sendAssistant(sayB.dataset.say); return; }
  const w = e.target.closest('#tcWide'); if (w) { e.stopPropagation(); const on = $('#tc').classList.toggle('wide'); w.setAttribute('aria-pressed', String(on)); w.setAttribute('aria-label', on ? 'Make Lucy narrower' : 'Make Lucy wider'); return; }
  const lz = e.target.closest('[data-lz]');
  if (lz) { e.stopPropagation(); const k = lz.dataset.lz; if (typeof tcMenuClose === 'function') tcMenuClose();
    if (k === 'setup') { openPop(); return; }
    if (k === 'reports') { AI.showReports = true; AI.list = false; renderAssistant(); }
    if (k === 'back') { AI.showReports = false; renderAssistant(); }
    if (k === 'add') { AI.showReports = false; renderAssistant(); const ta = $('#tcInput'); ta.value = 'About ' + lz.dataset.rid + ': '; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); ta.dispatchEvent(new Event('input', { bubbles: true })); }
    return; }
  const o = e.target.closest('[data-offer]');
  if (o) { e.stopPropagation(); AI.msgs.push({ role: 'typing' }); setMood('think'); renderAssistant(); setTimeout(() => { const [lead, srcs, card] = FLOWS[o.dataset.offer](); lucyPush(lead, srcs, card); }, 600); return; }
  const b = e.target.closest('[data-act]'); if (!b) return; e.stopPropagation();
  const m = AI.msgs.find(x => x.id === b.closest('[data-actid]').dataset.actid); if (!m) return;
  const a = b.dataset.act;
  if (a === 'open') { if (m.link === 'My reports') { AI.showReports = true; renderAssistant(); } else say('In the app this opens ' + m.link.replace(/^Open /, '')); return; }
  if (m.state !== 'ask') return;
  if (a === 'fix') { say('In the app this opens ' + m.fix.replace(/^Open /, '') + ' so you can fix it'); return; }
  if (a === 'no') { m.state = 'cancelled'; renderAssistant(); return; }
  if (a === 'change') { const ta = $('#tcInput'); ta.value = 'Change that: '; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); ta.dispatchEvent(new Event('input', { bubbles: true })); return; }
  if (a === 'ok') { if (m.blocked || (m.kind === 'delete' && m.typed.trim().toUpperCase() !== m.confirm)) return; lucyRun(m); }
});
if (!TESTER) { const mr = document.getElementById('tcMenuReports'); if (mr) mr.hidden = true; }

"""

# 1. styles
rep("</style>", CSS + "</style>")
# 2. the card renderer and the flows sit right before the box's own renderer
rep("function renderAssistant(){", JS + "function renderAssistant(){")
# 3. a card is a message
rep("b.innerHTML = AI.msgs.map(m => m.role === 'typing' ?", "b.innerHTML = AI.msgs.map(m => m.role === 'act' ? actHtml(m) : m.role === 'typing' ?")
# 3b. the reports list takes over the body; answers carry next steps
rep("function renderAssistant(){\n  const b = $('#tcBody');", "function renderAssistant(){\n  const b = $('#tcBody');\n  if (AI.showReports){ b.innerHTML = reportsHtml(); $('#tcFoot').hidden = true; $('#tcCtx').hidden = true; $('#tcAttach').hidden = true; return; }")
rep("""<button class="copy" data-copy data-testid="ai-copy">Copy</button></div></div></div>`).join('');""", """<button class="copy" data-copy data-testid="ai-copy">Copy</button></div>${nextHtml(m)}</div></div>`).join('');""")
rep("AI.msgs.push({ role: 'ai', html: rep[0], src: rep[1] });", "AI.msgs.push({ role: 'ai', html: rep[0], src: rep[1], next: lucyNext(text) });")
# 3c. one chat, not two: the tester's Help chat leaves the menu; "My reports" takes its place (testers only)
import re as _re
_n = len(_re.findall(r'<button data-tab="help" data-testid="tc-menu-help">.*?</button>', src, flags=_re.S))
assert _n == 1, _n
src = _re.sub(r'<button data-tab="help" data-testid="tc-menu-help">.*?</button>', '<button data-lz="reports" id="tcMenuReports" data-testid="tc-menu-reports"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>My reports<span id="tcHelpN2" hidden></span></button>', src, count=1, flags=_re.S)
# 3d. the header gets a wider / narrower button before the ⋯
_m = _re.search(r'<button[^>]*data-testid="tc-more"', src)
assert _m, "tc-more not found"
src = src[:_m.start()] + '<button id="tcWide" class="lz-wide" data-testid="tc-wide" aria-pressed="false" aria-label="Make Lucy wider"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg></button>' + src[_m.start():]
# 3e. Lucy's setup opens with "What Lucy can do"; it is filled and saved with the rest of the setup
rep('<div class="qs-sec"><h3>Voice</h3>', PERMS_HTML + '<div class="qs-sec"><h3>Voice</h3>')
rep("function fillPop(){", "function fillPop(){ lzFillPerms();")
rep("closePop(); say('Settings saved');", "lzSavePerms(); closePop(); say('Settings saved');")
# 4. a request to do something goes to the flows first
rep("text = (text || '').trim(); if (!text && !AI.attach) return;\n  const rep = pickReply(text);",
    "text = (text || '').trim(); if (!text && !AI.attach) return;\n  if (text && lucyDo(text)) return;\n  const rep = pickReply(text);")
# 5. words
rep("Hi ${ME}, what do you want to know?", "Hi ${ME}, what do you need?")
rep("Ask in plain words. I read your clients, leads, calendar, quotes, invoices, jobs and crew — only this business — and I keep your reminders and ideas. I don’t send anything or book jobs; I tell you where to.",
    "Ask in plain words, or tell me what to do. I read your clients, leads, calendar, quotes, invoices, jobs and crew — only this business — and I can do the work on them: start and change quotes, add to jobs, raise invoices, book the calendar, send and delete. I always show you what I’m about to do and wait for your OK.${TESTER ? ' While you’re testing: tell me when something goes wrong and I log it for the team, with the page you’re on.' : ''}")
rep("'Ask Lucy…'", "'Ask Lucy, or tell her what to do…'")
# 6. two more verb rows that fill the box
rep("const FILLERS = [['remind', 'Remind me…', 'type it in the box'], ['idea', 'I’ve got an idea', 'type it in the box']];",
    "const FILLERS = [['quote', 'Start a quote for…', 'type it in the box'], ['job', 'Add to a job…', 'type it in the box'], ['remind', 'Remind me…', 'type it in the box'], ['idea', 'I’ve got an idea', 'type it in the box'], ...(!/[?&]tester=0/.test(location.search) ? [['report', 'Report a problem', 'tell me what went wrong']] : [])];")
rep("const FILL_TEXT = { remind: 'Remind me to ', idea: 'I’ve got an idea: ' };",
    "const FILL_TEXT = { quote: 'Start a quote for ', job: 'Add to the job ', remind: 'Remind me to ', idea: 'I’ve got an idea: ', report: 'Report a problem: ' };")
rep("const ROWICON = {",
    "const ROWICON = {\n  report: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 21V4M5 4h11l-2 4 2 4H5\"/></svg>',\n  quote: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M7 3h8l4 4v14H7z\"/><path d=\"M15 3v4h4M10 12h6M10 16h6\"/></svg>',\n  job: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.9\" stroke-linecap=\"round\"><path d=\"M12 5v14M5 12h14\"/></svg>',")
rep("<title>", "<title>Lucy does the work · ", 1) if "<title>" in src else None
# 7. plain names on the source chips for the lookups the new flows use
rep("const SRC_LABEL = { ", "const SRC_LABEL = { search_clients: 'Clients', list_projects: 'Jobs', ")

(ROOT / "lucy-operator.html").write_text(src)
print("wrote lucy-operator.html", len(src))
