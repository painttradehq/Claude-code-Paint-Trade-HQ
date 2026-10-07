#!/usr/bin/env python3
"""Xero connection — builds two prototypes by patching the app's own HTML:
  settings-business-redesign.html → xero-settings.html  (Settings › Business › sixth section "Accounting" + the right-side Xero panel)
  invoice-builder-clean.html      → xero-invoice.html   (one Xero line in the Invoice details card)
Every rep() asserts the exact number of occurrences so a drifted base file fails loudly."""
import os, re
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def rep(s, a, b, n=1):
    c = s.count(a)
    assert c == n, f'expected {n} of {a[:60]!r}, found {c}'
    return s.replace(a, b)

def rep1(s, a, b):
    i = s.find(a); assert i >= 0, f'missing {a[:60]!r}'
    return s[:i] + b + s[i + len(a):]

# ------------------------------------------------------------------ settings
s = open('settings-business-redesign.html', encoding='utf-8').read()

CSS = """
  /* Accounting (Xero) */
  .xopt{ display:flex; align-items:flex-start; gap:12px; padding:14px 16px; border:1px solid var(--border-strong); border-radius:10px; background:var(--surface); }
  .xopt .t{ flex:1; min-width:0; } .xopt .t b{ display:block; font-size:14px; font-weight:600; } .xopt .t span{ display:block; font-size:12.5px; color:var(--text-secondary); margin-top:2px; line-height:1.45; }
  .xopt .t .st{ display:flex; align-items:center; gap:6px; font-size:12.5px; margin-top:8px; color:var(--text-muted); flex-wrap:wrap; } .xopt .t .st svg{ width:13px; height:13px; } .xopt .t .st.ok{ color:var(--success); }
  .xopt .a{ display:flex; gap:8px; align-items:center; flex-shrink:0; } .xopt .a .btn{ padding:7px 12px; font-size:13px; }
  .xmark{ width:34px; height:34px; border-radius:9px; background:#13B5EA; color:#fff; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:15px; letter-spacing:-.02em; flex-shrink:0; margin-top:1px; }
  .xopt .t .st .sep{ color:var(--border-strong); }
  .dscrim{ position:fixed; inset:0; background:rgba(30,26,20,.35); z-index:40; display:flex; justify-content:flex-end; }
  .dscrim[hidden]{ display:none; }
  .drawer{ width:480px; max-width:92%; height:100%; background:var(--bg); border-left:1px solid var(--border); box-shadow:-12px 0 40px rgba(20,16,10,.18); display:flex; flex-direction:column; }
  .dhead{ display:flex; align-items:flex-start; gap:10px; padding:16px 20px; border-bottom:1px solid var(--border); background:var(--surface); }
  .dhead .t{ flex:1; min-width:0; } .dhead h2{ font-size:17px; font-weight:600; margin:0; } .dhead .s{ font-size:12.5px; color:var(--text-muted); margin-top:3px; }
  .dclose{ width:28px; height:28px; border-radius:6px; border:none; background:none; color:var(--text-muted); cursor:pointer; display:flex; align-items:center; justify-content:center; } .dclose svg{ width:18px; height:18px; }
  .dbody{ flex:1; overflow:auto; padding:16px 20px; display:flex; flex-direction:column; gap:14px; }
  .dfoot{ display:flex; gap:10px; padding:14px 20px; border-top:1px solid var(--border); background:var(--surface); }
  .xr-org{ display:flex; gap:12px; align-items:center; padding:12px 14px; border:1px solid var(--border); border-radius:10px; background:var(--surface); }
  .xr-org b{ display:block; font-size:14px; } .xr-org small{ display:block; font-size:12px; color:var(--text-muted); margin-top:2px; }
  .xr-f label{ display:block; font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--text-muted); margin-bottom:6px; }
  .xr-f select, .xr-f input{ width:100%; font:inherit; font-size:13.5px; padding:9px 11px; border:1px solid var(--border-strong); border-radius:8px; background:var(--surface); color:var(--text-primary); }
  .xr-f small{ display:block; font-size:12px; color:var(--text-muted); margin-top:5px; line-height:1.45; }
  .xr-what{ font-size:13px; color:var(--text-secondary); line-height:1.55; border-top:1px solid var(--border); padding-top:12px; }
  .xr-what b{ color:var(--text-primary); }
"""
s = rep1(s, '</style>', CSS + '</style>')

SECTION = """    </section>
    <section class="sec" data-testid="sec-accounting">
      <h3>Accounting <span class="now">saves at once</span></h3>
      <p class="sd">Invoices, credit notes and payments go to your accounting software as you send and record them, and a payment you reconcile there marks the invoice paid here. One connection for the whole business.</p>
      <div class="opts">
        <div class="xopt" data-testid="acct-xero"><div class="xmark">X</div><div class="t"><b>Xero</b><span>Each invoice you send appears in Xero with its number, lines, GST and client. Payments you record here are posted to your bank account in Xero; payments you reconcile in Xero come back within the hour.</span><div class="st" id="stXero"></div></div><div class="a" id="xeroActs"></div></div>
      </div>
    </section>
  </div>

  <div class="content" id="pgAccount\""""
s = rep(s, """    </section>
  </div>

  <div class="content" id="pgAccount\"""", SECTION)

DRAWER = """<div class="dscrim" id="xrScrim" hidden><div class="drawer" data-testid="xero-drawer">
  <div class="dhead"><div class="t"><h2>Xero</h2><div class="s" id="xrSub">Sano Painting &amp; Decorating · how invoices and payments go across</div></div><button class="dclose" id="xrClose" data-testid="xero-close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button></div>
  <div class="dbody">
    <div class="xr-org"><div class="xmark">X</div><div><b id="xrOrg">Sano Painting &amp; Decorating Pty Ltd</b><small>Xero organisation · connected as josh@sanopainting.com.au</small></div></div>
    <div class="xr-f"><label for="xrSales">Sales account</label><select id="xrSales" data-testid="xero-sales"><option value="200">200 · Sales</option><option value="210">210 · Painting income</option><option value="260">260 · Other revenue</option></select><small>Every invoice line is posted to this account. The list is your Xero chart of accounts.</small></div>
    <div class="xr-f"><label for="xrBank">Bank account for payments</label><select id="xrBank" data-testid="xero-bank"><option value="090">090 · Business Bank Account</option><option value="091">091 · Business Savings Account</option></select><small>Payments you record in the app are posted here as received payments.</small></div>
    <div class="xr-f"><label for="xrTax">GST rate for invoice lines</label><select id="xrTax" data-testid="xero-tax"><option value="OUTPUT">GST on Income (10%)</option><option value="EXEMPTOUTPUT">GST Free Income</option></select><small>Used when the invoice adds GST. Invoices marked No GST are always sent as GST Free Income.</small></div>
    <div class="xr-f"><label for="xrFrom">Send invoices from</label><input type="date" id="xrFrom" data-testid="xero-from"><small>Invoices sent before this date stay out of Xero. Today is the usual choice.</small></div>
    <div class="xr-what"><b>What goes across:</b> invoices when you send them, credit notes, and payments you record. Clients are matched by name and email and created in Xero if missing. Your invoice numbers are kept. <b>What comes back:</b> a payment reconciled in Xero marks the invoice paid here. Nothing else in Xero is read or changed.</div>
  </div>
  <div class="dfoot"><button class="btn btn-ghost" id="xrCancel" data-testid="xero-cancel">Cancel</button><span style="flex:1"></span><button class="btn btn-primary" id="xrSave" data-testid="xero-save">Save</button></div>
</div></div>

<div class="toast" id="toast"></div>"""
s = rep(s, '<div class="toast" id="toast"></div>', DRAWER)

JS = """  // ---- Accounting · Xero ----
  const XR = { connected: params.get('xero') === 'connected', org: 'Sano Painting & Decorating Pty Ltd', sales: '200', bank: '090', tax: 'OUTPUT', from: new Date(NOW).toISOString().slice(0, 10), last: 'today 2:10 pm' };
  const SALES = { '200': '200 · Sales', '210': '210 · Painting income', '260': '260 · Other revenue' };
  function renderXero(){
    const st = $('#stXero'); st.className = 'st ' + (XR.connected ? 'ok' : '');
    st.innerHTML = XR.connected ? `${svg('checkc')} Connected to ${esc(XR.org)} <span class="sep">·</span> ${esc(SALES[XR.sales])} <span class="sep">·</span> last sync ${XR.last}` : `${svg('link')} Not connected`;
    $('#xeroActs').innerHTML = XR.connected
      ? `<button class="btn btn-ghost" id="xeroSettings" data-testid="xero-settings-btn">Settings</button><button class="btn danger" id="xeroDisc" data-testid="xero-disconnect-btn">Disconnect</button>`
      : `<button class="btn btn-primary" id="xeroConnect" data-testid="xero-connect-btn">Connect Xero</button>`;
  }
  function openXero(fresh){
    $('#xrSales').value = XR.sales; $('#xrBank').value = XR.bank; $('#xrTax').value = XR.tax; $('#xrFrom').value = XR.from;
    $('#xrSub').textContent = fresh ? 'Connected · pick where things go, then Save' : 'Sano Painting & Decorating · how invoices and payments go across';
    $('#xrScrim').hidden = false; $('#xrSales').focus();
  }
  function closeXero(){ $('#xrScrim').hidden = true; }
  document.addEventListener('click', e => {
    const id = e.target.id;
    if (id === 'xeroConnect'){ say('→ Xero sign-in · choose the organisation · back to Settings'); setTimeout(() => { XR.connected = true; renderXero(); openXero(true); }, 500); return; }
    if (id === 'xeroSettings'){ openXero(false); return; }
    if (id === 'xeroDisc'){ if (!confirm('Disconnect Xero? Invoices and payments stop going across. Everything already in Xero stays there.')) return; XR.connected = false; renderXero(); say('Xero disconnected'); return; }
    if (id === 'xrClose' || id === 'xrCancel' || e.target.id === 'xrScrim'){ closeXero(); return; }
    if (id === 'xrSave'){ XR.sales = $('#xrSales').value; XR.bank = $('#xrBank').value; XR.tax = $('#xrTax').value; XR.from = $('#xrFrom').value; closeXero(); renderXero(); say('Xero settings saved · PUT /integrations/xero/settings'); return; }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#xrScrim').hidden) closeXero(); });
  renderXero();
  if (location.hash === '#accounting') setTimeout(() => $('[data-testid="sec-accounting"]').scrollIntoView({ block: 'start' }), 50);
  $('#pageSub').textContent"""
s = rep(s, "  $('#pageSub').textContent", JS)
open('xero-settings.html', 'w', encoding='utf-8').write(s)
print('xero-settings.html', len(s))

# ------------------------------------------------------------------ invoice
t = open('invoice-builder-clean.html', encoding='utf-8').read()

t = rep1(t, '</style>', """  .jcard .m .xero{ display:block; margin-top:3px; color:var(--text-secondary); }
  .jcard .m .xero.ok{ color:var(--success); }
  .jcard .m .xero.err{ color:var(--danger); font-weight:600; }
  .jcard .m .xero .lnk{ border:none; background:none; color:var(--accent); font:inherit; font-size:12.5px; font-weight:600; padding:0; cursor:pointer; text-decoration:underline dotted; margin-left:4px; }
</style>""")

t = rep(t, "const STATE = params.get('state') || 'new';", """const STATE = params.get('state') || 'new';
const XERO_ON = params.get('xero') !== 'off';
let xero = ({ progress: { st: 'pending' }, new: { st: 'pending' }, paid: { st: 'ok', at: '7 Oct, 2:10 pm' }, overdue: { st: 'error', why: 'Xero was unavailable' } })[STATE] || { st: 'pending' };
function xeroLine(){
  if (!XERO_ON) return '';
  if (xero.st === 'ok') return `<span class="xero ok" data-testid="inv-xero">In Xero as ${esc(inv.invoice_number)} · synced ${xero.at}<button class="lnk" data-xopen="1">Open in Xero</button></span>`;
  if (xero.st === 'error') return `<span class="xero err" data-testid="inv-xero">Not in Xero · ${esc(xero.why)}<button class="lnk" data-xretry="1">Retry</button></span>`;
  return `<span class="xero" data-testid="inv-xero">Goes to Xero when you send it</span>`;
}""")

t = rep(t, "${inv.tax.enabled ? `${esc(inv.tax.label)} ${inv.tax.rate}% added on top` : 'No GST'}</div></div>",
           "${inv.tax.enabled ? `${esc(inv.tax.label)} ${inv.tax.rate}% added on top` : 'No GST'}${xeroLine()}</div></div>")

t = rep(t, """  if ((x = c('[data-open="terms"]')) || (x = c('[data-fix="terms"]'))){ openTerms(); return; }""",
"""  if ((x = c('[data-xopen]'))){ say('→ Xero · ' + inv.invoice_number); return; }
  if ((x = c('[data-xretry]'))){ say('Sending to Xero…'); setTimeout(() => { xero = { st: 'ok', at: 'just now' }; renderPaper(); say(`${inv.invoice_number} is in Xero`); }, 700); return; }
  if ((x = c('[data-open="terms"]')) || (x = c('[data-fix="terms"]'))){ openTerms(); return; }""")

t = rep(t, "if (first){ inv.sent_at = 0; inv.due = inv.terms_days; inv.status = 'sent'; }",
           "if (first){ inv.sent_at = 0; inv.due = inv.terms_days; inv.status = 'sent'; if (XERO_ON) xero = { st: 'ok', at: 'just now' }; }")
open('xero-invoice.html', 'w', encoding='utf-8').write(t)
print('xero-invoice.html', len(t))
