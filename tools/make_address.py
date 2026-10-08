#!/usr/bin/env python3
"""Address finder — builds address-finder.html by patching the Round 68 builder prototype
(estimate-builder-fix-e.html): the Street address inputs of the Job address dialog and the
client forms become an autocomplete field (mocked Google Places list), filling suburb, state
and postcode on pick. Every rep() asserts the exact occurrence count."""
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, f'expected {n} of {a[:70]!r}, found {c}'
    return s.replace(a, b)

def rep1(s, a, b):
    i = s.find(a); assert i >= 0, f'missing {a[:70]!r}'
    return s[:i] + b + s[i + len(a):]

s = open('estimate-builder-fix-e.html', encoding='utf-8').read()

CSS = """
  /* Address finder */
  .acwrap{ position:relative; }
  .ac{ margin-top:4px; background:var(--surface); border:1px solid var(--border-strong); border-radius:10px; box-shadow:0 8px 24px rgba(20,16,10,.10); overflow:hidden; }  /* in the form's flow: the dialog grows, nothing is clipped */
  .ac[hidden]{ display:none; }
  .ac .it{ padding:8px 12px; cursor:pointer; display:flex; flex-direction:column; gap:1px; }
  .ac .it.on, .ac .it:hover{ background:var(--accent-bg); }
  .ac .it b{ font-size:13.5px; font-weight:600; color:var(--text-primary); }
  .ac .it span{ font-size:12px; color:var(--text-muted); }
  .ac .pw{ font-size:10.5px; color:var(--text-muted); padding:5px 12px; border-top:1px solid var(--border); text-align:right; letter-spacing:.02em; }
  .acpin{ font-size:12px; color:var(--success); margin-top:5px; display:flex; gap:5px; align-items:center; }
  .acpin svg{ width:13px; height:13px; }
  .form .lnk svg, .mbody .lnk svg{ width:14px; height:14px; }
"""
s = rep1(s, '</style>', CSS + '</style>')

def field(id_, pre, extra, label, testid):
    return (f'<div class="fld acwrap"><label>{label}</label><input type="text" id="{id_}" {extra} placeholder="Start typing the street address" autocomplete="off" data-ac="{pre}" data-testid="{testid}">'
            f'<div class="ac" id="{pre}_ac" hidden data-testid="{testid}-ac"></div><div class="acpin" id="{pre}_pin" hidden data-testid="{testid}-pin"></div></div>')

# new client form
s = rep(s, '<div class="fld"><label>Address</label><input type="text" id="cf_addr" placeholder="Street address"></div>',
        field('cf_addr', 'cf', '', 'Address', 'client-address'))
# edit client form
s = rep(s, '<div class="fld"><label>Address</label><input type="text" id="cf_addr" value="${esc(cust.address || \'\')}"></div>',
        field('cf_addr', 'cf', 'value="${esc(cust.address || \'\')}"', 'Address', 'client-address'))
# job address dialog
s = rep(s, '<div class="fld"><label>Street address</label><input type="text" id="ja_addr" value="${esc(j.address)}"></div>',
        field('ja_addr', 'ja', 'value="${esc(j.address)}"', 'Street address', 'job-address'))

JS = r"""// ---- Address finder: Google Places through the app's server (mocked here with a short Australian list) ----
const AC_ON = new URLSearchParams(location.search).get('ac') !== 'off';
const AC_DB = [
  { id:'p1',  num:'14',   street:'Wattle Street',       suburb:'Balmain',        state:'NSW', pc:'2041', lat:-33.858, lng:151.182 },
  { id:'p2',  num:'14',   street:'Wattle Crescent',     suburb:'Glenwood',       state:'NSW', pc:'2768', lat:-33.733, lng:150.933 },
  { id:'p3',  num:'14',   street:'Waterloo Road',       suburb:'Macquarie Park', state:'NSW', pc:'2113', lat:-33.784, lng:151.118 },
  { id:'p4',  num:'14',   street:'Watkins Street',      suburb:'Rockdale',       state:'NSW', pc:'2216', lat:-33.952, lng:151.137 },
  { id:'p5',  num:'140',  street:'Wattletree Road',     suburb:'Malvern',        state:'VIC', pc:'3144', lat:-37.858, lng:145.030 },
  { id:'p6',  num:'22',   street:'Coogee Bay Road',     suburb:'Coogee',         state:'NSW', pc:'2034', lat:-33.920, lng:151.253 },
  { id:'p7',  num:'22',   street:'Cook Street',         suburb:'Coorparoo',      state:'QLD', pc:'4151', lat:-27.496, lng:153.056 },
  { id:'p8',  num:'22',   street:'Coolibah Street',     suburb:'Cooma',          state:'NSW', pc:'2630', lat:-36.236, lng:149.125 },
  { id:'p9',  num:'8',    street:'Marlow Avenue',       suburb:'Concord',        state:'NSW', pc:'2137', lat:-33.851, lng:151.103 },
  { id:'p10', num:'3/41', street:'Bay Street',          suburb:'Rockdale',       state:'NSW', pc:'2216', lat:-33.953, lng:151.138 },
  { id:'p11', num:'41',   street:'Bay Street',          suburb:'Rockdale',       state:'NSW', pc:'2216', lat:-33.953, lng:151.138 },
  { id:'p12', num:'17',   street:'Pacific Highway',     suburb:'Roseville',      state:'NSW', pc:'2069', lat:-33.783, lng:151.180 },
  { id:'p13', num:'5',    street:'Smith Street',        suburb:'Collingwood',    state:'VIC', pc:'3066', lat:-37.802, lng:144.984 },
  { id:'p14', num:'5',    street:'Smith Road',          suburb:'Springvale',     state:'VIC', pc:'3171', lat:-37.947, lng:145.153 },
];
const acNorm = (v) => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
function acMatch(q){ q = acNorm(q); if (q.length < 3) return []; return AC_DB.filter(a => { const ns = acNorm(a.num + ' ' + a.street), st = acNorm(a.street), full = acNorm(a.num + ' ' + a.street + ' ' + a.suburb); return ns.startsWith(q) || st.startsWith(q) || full.includes(q); }).slice(0, 5); }
const acS = {}; let acT;
function acRender(pre){ const box = $('#' + pre + '_ac'); if (!box) return; const st = acS[pre] || { items: [], idx: -1 }; if (!st.items.length){ box.hidden = true; box.innerHTML = ''; return; } box.innerHTML = st.items.map((a, i) => `<div class="it ${i === st.idx ? 'on' : ''}" data-aci="${i}"><b>${esc(a.num + ' ' + a.street)}</b><span>${esc(a.suburb + ' ' + a.state + ' ' + a.pc)}</span></div>`).join('') + '<div class="pw">powered by Google</div>'; box.hidden = false; }
function acClose(pre){ acS[pre] = { items: [], idx: -1, picked: (acS[pre] || {}).picked || null }; acRender(pre); }
function acPick(pre, a){ $('#' + pre + '_addr').value = a.num + ' ' + a.street; $('#' + pre + '_sub').value = a.suburb; $('#' + pre + '_state').value = a.state; $('#' + pre + '_pc').value = a.pc; acS[pre] = { items: [], idx: -1, picked: a }; acRender(pre); const pin = $('#' + pre + '_pin'); pin.hidden = false; pin.innerHTML = `${ICONS.pin ? svg('pin') : svg('checkc')} On the map · ${esc(a.suburb)} ${esc(a.state)} ${esc(a.pc)}`; say(`Picked · GET /geo/place/${a.id} → street, suburb, state, postcode, map point`); }
document.addEventListener('input', e => { const inp = e.target.closest && e.target.closest('[data-ac]'); if (!inp) return; const pre = inp.dataset.ac; const pin = $('#' + pre + '_pin'); if (pin) pin.hidden = true; if (acS[pre]) acS[pre].picked = null; if (!AC_ON) return; clearTimeout(acT); acT = setTimeout(() => { acS[pre] = { items: acMatch(inp.value), idx: -1 }; acRender(pre); }, 200); });
document.addEventListener('keydown', e => { const inp = e.target.closest && e.target.closest('[data-ac]'); if (!inp) return; const pre = inp.dataset.ac; const st = acS[pre]; if (!st || !st.items.length) return; if (e.key === 'ArrowDown'){ e.preventDefault(); st.idx = (st.idx + 1) % st.items.length; acRender(pre); } else if (e.key === 'ArrowUp'){ e.preventDefault(); st.idx = (st.idx - 1 + st.items.length) % st.items.length; acRender(pre); } else if (e.key === 'Enter'){ e.preventDefault(); acPick(pre, st.items[st.idx < 0 ? 0 : st.idx]); } else if (e.key === 'Escape'){ e.preventDefault(); e.stopImmediatePropagation(); acClose(pre); } else if (e.key === 'Tab'){ acClose(pre); } }, true);
document.addEventListener('mousedown', e => { const it = e.target.closest && e.target.closest('.ac .it'); if (it){ e.preventDefault(); e.stopPropagation(); const pre = it.closest('.ac').id.replace('_ac', ''); acPick(pre, acS[pre].items[+it.dataset.aci]); return; } if (!(e.target.closest && e.target.closest('.acwrap'))) Object.keys(acS).forEach(acClose); }, true);
"""
s = rep(s, "document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ if (panel) closePanel();",
        JS + "document.addEventListener('keydown', (e) => { if (e.key === 'Escape'){ if (panel) closePanel();")
open('address-finder.html', 'w', encoding='utf-8').write(s)
print('address-finder.html', len(s), '| pin icon:', '"pin":' in s)
