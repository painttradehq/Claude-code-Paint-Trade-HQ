#!/usr/bin/env python3
"""Lucy chat — minimal box. Patches the A5 Part 2 prototype (ai-chat-gear.html) into lucy-chat-minimal.html:
white 52 px header with two icons (⋯ menu, ×), no tab bar (Help, past chats, new chat, Lucy's setup and
"what Lucy can do" live in the ⋯ menu), a one-line greeting, four quiet starters, no usage bar unless the
allowance is nearly gone (?usage=high), and a big composer (3 lines, grows to 7) with + attach and send inside it.
Every rep() asserts the exact occurrence count."""
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, f'expected {n} of {a[:70]!r}, found {c}'
    return s.replace(a, b)

def rep1(s, a, b):
    i = s.find(a); assert i >= 0, f'missing {a[:70]!r}'
    return s[:i] + b + s[i + len(a):]

s = open('ai-chat-gear.html', encoding='utf-8').read()

CSS = """
  /* ---- Lucy · minimal box ---- */
  .tc{ width:440px; height:640px; border-radius:20px; }
  .tc-head{ background:var(--surface); color:var(--text-primary); border-bottom:1px solid var(--border); padding:10px 10px 10px 16px; gap:10px; }
  .tc-head .av{ width:26px; height:26px; border:none; }
  .tc-head .av .l{ font-size:13px; }
  .tc-head .t b{ font-size:16px; }
  .tc-head .t span{ display:none; }
  .tc-head .tools button{ background:none; color:var(--text-muted); width:32px; height:32px; }
  .tc-head .tools button:hover, .tc-head .tools button.on{ background:var(--surface-sunken); color:var(--text-primary); }
  .tc-head .tools button svg{ width:18px; height:18px; }
  .tc-head .tools #tcHist, .tc-head .tools #tcNew, .tc-head .tools #tcGear{ display:none !important; }  /* the render() toggles them; they live in the ⋯ menu now */
  .tc-head .back{ border:none; background:none; color:var(--accent); font:inherit; font-size:13px; font-weight:600; cursor:pointer; padding:0; margin-right:4px; display:none; align-items:center; gap:3px; }
  .tc-head .back svg{ width:14px; height:14px; }
  .tc.help .back{ display:inline-flex; }
  .tc.help .av{ display:none; }
  .tc-tabs{ display:none; }
  .tc-menu{ position:absolute; right:12px; top:50px; width:220px; background:var(--surface); border:1px solid var(--border-strong); border-radius:12px; box-shadow:0 14px 36px rgba(20,16,10,.18); padding:6px; z-index:5; display:flex; flex-direction:column; }
  .tc-menu[hidden]{ display:none; }
  .tc-menu button{ display:flex; align-items:center; gap:10px; width:100%; padding:9px 10px; border:none; background:none; font:inherit; font-size:13.5px; color:var(--text-primary); border-radius:8px; cursor:pointer; text-align:left; }
  .tc-menu button:hover{ background:var(--surface-sunken); }
  .tc-menu button svg{ width:16px; height:16px; color:var(--text-muted); flex-shrink:0; }
  .tc-menu button .n{ margin-left:auto; font-family:var(--font-mono); font-size:11px; color:var(--text-muted); }
  .tc-menu hr{ border:none; border-top:1px solid var(--border); margin:4px 6px; }
  .tc-body{ background:var(--surface); padding:18px 18px 10px; gap:12px; }
  .msg.ai{ border:none; background:var(--surface-sunken); }
  .welcome{ text-align:left; padding:6px 2px; margin:auto 0 0; }
  .welcome .big{ font-size:22px; line-height:1.25; margin-bottom:16px; }
  .welcome p{ display:none; }
  .welcome p.on{ display:block; margin:0 0 14px; font-size:13px; }
  .picks{ flex-direction:column; align-items:flex-start; gap:4px; }
  .picks button{ border:none; background:none; padding:7px 0; font-size:14.5px; font-weight:500; color:var(--text-primary); border-radius:0; }
  .picks button:hover{ background:none; color:var(--accent); border:none; }
  .picks button::before{ content:'→'; color:var(--border-strong); margin-right:10px; font-weight:400; }
  .picks button:hover::before{ color:var(--accent); }
  .welcome .what{ border:none; background:none; font:inherit; font-size:12.5px; color:var(--text-muted); cursor:pointer; padding:10px 0 0; text-decoration:underline dotted; }
  .tc-ctx{ border-top:none; padding:0 18px 6px; background:var(--surface); }
  .tc-ctx .sp{ display:none; } .tc-ctx .bar{ width:100%; }
  .tc-ctx:not(.show){ display:none; }
  .tc-foot{ border-top:none; padding:8px 14px 14px; gap:0; }
  .tc-foot .box{ flex:1; display:flex; align-items:flex-end; gap:6px; border:1px solid var(--border-strong); border-radius:16px; background:var(--surface); padding:8px 8px 8px 6px; position:relative; }
  .tc-foot .box:focus-within{ border-color:var(--accent); box-shadow:0 0 0 3px var(--accent-bg); }
  .tc-foot textarea{ min-height:66px; max-height:170px; font-size:15px; line-height:1.45; padding:8px 4px; border:none; background:none; border-radius:0; }
  .tc-foot textarea:focus{ background:none; }
  .tc-foot .ib{ width:34px; height:34px; border:none; background:none; color:var(--text-muted); border-radius:10px; }
  .tc-foot .ib:hover{ background:var(--surface-sunken); color:var(--text-primary); }
  .tc-foot .ib.send{ background:var(--accent); color:#fff; }
  .tc-foot .ib.send:hover{ background:var(--accent-hover, var(--accent)); color:#fff; }
  .tc-foot .amenu{ position:absolute; left:6px; bottom:46px; background:var(--surface); border:1px solid var(--border-strong); border-radius:12px; box-shadow:0 10px 28px rgba(20,16,10,.16); padding:6px; display:flex; flex-direction:column; min-width:170px; z-index:6; }
  .tc-foot .amenu[hidden]{ display:none; }
  .tc-foot .amenu .ib{ width:auto; height:auto; justify-content:flex-start; gap:10px; padding:8px 10px; font:inherit; font-size:13.5px; color:var(--text-primary); }
  .tc-foot .amenu .ib svg{ width:16px; height:16px; }
  .attach{ padding:0 18px 4px; }
"""
CSS2 = """
  /* ---- colour and warmth back (owner, 9 Oct): light on options, not on life ---- */
  .tc-head{ background:linear-gradient(135deg,#34295E 0%,#4B3E86 100%); color:#fff; border-bottom:none; padding:11px 10px 11px 14px; }
  .tc-head .av{ width:30px; height:30px; background:#F3E7D8; color:#8B6A46; box-shadow:0 2px 8px rgba(0,0,0,.18); }
  .tc-head .av .l{ font-size:14px; }
  .tc-head .t b{ color:#fff; }
  .tc-head .tools button{ color:rgba(255,255,255,.85); }
  .tc-head .tools button:hover, .tc-head .tools button.on{ background:rgba(255,255,255,.18); color:#fff; }
  .tc-head .back{ color:#fff; }
  .tc-body{ background:linear-gradient(180deg,#F5F2FC 0%,#FFFFFF 42%); }
  .welcome .wav{ width:48px; height:48px; border-radius:50%; background:#F3E7D8; color:#8B6A46; font-weight:700; font-size:21px; display:flex; align-items:center; justify-content:center; margin:0 0 12px; box-shadow:0 8px 20px rgba(75,62,134,.16); }
  .welcome .big{ font-size:22px; margin-bottom:6px; }
  .welcome .hey{ font-size:13px; color:var(--text-muted); margin:0 0 16px; }
  .picks{ flex-direction:row; flex-wrap:wrap; gap:8px; }
  .picks button{ padding:9px 14px; border-radius:999px; background:var(--accent-bg); color:var(--accent-ink); border:1px solid transparent; font-size:13.5px; font-weight:600; }
  .picks button::before{ content:none; }
  .picks button:hover{ background:#E4DEF6; border-color:var(--accent); color:var(--accent-ink); }
  .welcome .what{ color:var(--accent); text-decoration:none; font-weight:600; padding-top:12px; }
  .msg.ai{ background:#fff; border:1px solid var(--border); }
  .tc-foot .box{ border-color:#D9D2F0; background:#fff; box-shadow:0 2px 10px rgba(75,62,134,.06); }
  .tc-foot .ib#tcPlus{ background:var(--accent-bg); color:var(--accent); border-radius:50%; width:32px; height:32px; }
  .tc-foot .ib#tcPlus:hover{ background:#E4DEF6; }
  .tc-foot .ib.send{ border-radius:50%; width:34px; height:34px; box-shadow:0 4px 12px rgba(75,62,134,.3); }
  .tc-menu button svg{ color:var(--accent); }
  .tc-ctx.show{ color:var(--warning); font-weight:600; }
"""
s = rep1(s, '</style>', CSS + CSS2 + '</style>')

# ---- header: back link (help mode), one ⋯ button + × ; the old action buttons move into the ⋯ menu
s = rep(s, '<div class="tc-head"><div class="av" id="tcAv"><span class="l">L</span></div><div class="t"><b id="tcTitle">Lucy</b><span id="tcSub">Sano Painting &amp; Decorating · your team\'s assistant</span></div>\n    <div class="tools">',
           '<div class="tc-head"><button class="back" id="tcBack" data-testid="tc-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>Lucy</button><div class="av" id="tcAv"><span class="l">L</span></div><div class="t"><b id="tcTitle">Lucy</b><span id="tcSub">Sano Painting &amp; Decorating · your team\'s assistant</span></div>\n    <div class="tools">\n      <button id="tcMore" data-testid="tc-more" aria-label="More" title="More"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none"/></svg></button>')

# the three old header buttons → hidden from the header (they live in the menu now, same ids so the existing handlers keep working)
for bid in ('tcHist', 'tcNew', 'tcGear'):
    s = rep(s, f'<button id="{bid}" ', f'<button id="{bid}" hidden ')

MENU = '''  <div class="tc-menu" id="tcMenu" hidden data-testid="tc-menu">
    <button data-menu="new" data-testid="tc-menu-new"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>New chat</button>
    <button data-menu="hist" data-testid="tc-menu-history"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>Past chats</button>
    <button data-tab="help" data-testid="tc-menu-help"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13l2.5-8h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M3 13h5l1.5 3h5l1.5-3h5"/></svg>Help <span class="n" id="tcHelpN2"></span></button>
    <hr>
    <button data-menu="what" data-testid="tc-menu-what"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>What Lucy can do</button>
    <button data-menu="gear" data-testid="tc-menu-setup"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>Lucy’s setup</button>
  </div>
  <div class="tc-body"'''
s = rep(s, '  <div class="tc-body"', MENU)

# ---- composer: one box with + attach (menu with the old camera/file buttons) · textarea · send
s = rep(s, '<div class="tc-foot" id="tcFoot"><button class="ib" id="tcCam" ',
           '<div class="tc-foot" id="tcFoot"><div class="box"><button class="ib" id="tcPlus" data-testid="ai-attach-btn" aria-label="Add a photo" title="Add a photo"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></button><div class="amenu" id="tcAmenu" hidden data-testid="ai-attach-menu"><button class="ib" id="tcCam" ')
s = rep(s, '<textarea id="tcInput" placeholder="Ask about clients, leads, money, jobs…" rows="1" data-testid="ai-text-input"></textarea>',
           '</div><textarea id="tcInput" placeholder="Ask Lucy…" rows="3" data-testid="ai-text-input"></textarea>')
# camera/file buttons become menu rows with labels
s = rep(s, 'title="Take a photo"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg></button>',
           'title="Take a photo"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>Take a photo</button>')
s = rep(s, 'title="Attach a photo"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg></button>',
           'title="Attach a photo"><svg class="" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/></svg>Attach a photo</button>')
# close the composer box after the send button
i = s.find('<button class="ib send" id="tcSend"'); j = s.find('</button>', i) + len('</button>')
s = s[:j] + '</div>' + s[j:]

# ---- starters: four, short
s = rep(s, """const STARTERS = [['site', "Who's on site today?"], ['owed', "What's owed and by whom?"], ['leads', 'Any new leads this week?'], ['calendar', "What's on the calendar tomorrow?"], ['quiet', 'Which quotes have gone quiet?'], ['remind', 'Remind me to call Jane tomorrow'], ['idea', 'I’ve got an idea…']];""",
           """const STARTERS = [['site', "Who's on site today?"], ['owed', "What's owed?"], ['calendar', "What's on tomorrow?"], ['quiet', 'Which quotes have gone quiet?']];""")
# welcome: one line, the paragraph hidden behind "What can Lucy do?"
s = rep(s, '<div class="big">Hi ${ME}, I’m Lucy. What do you want to know?</div><p>', '<div class="wav">L</div><div class="big">Hi ${ME} — what do you want to know?</div><div class="hey">Ask me anything about this business.</div><p id="tcWhat" class="${WHAT ? \'on\' : \'\'}">')
s = rep(s, "<div class=\"picks\">${STARTERS.map(([k, l]) => `<button data-starter=\"${k}\" data-testid=\"ai-starter-${k}\">${l}</button>`).join('')}</div></div>`;",
           "<div class=\"picks\">${STARTERS.map(([k, l]) => `<button data-starter=\"${k}\" data-testid=\"ai-starter-${k}\">${l}</button>`).join('')}</div><button class=\"what\" id=\"tcWhatBtn\" data-testid=\"ai-what\">${WHAT ? 'Hide' : 'What can Lucy do?'}</button></div>`;")
# usage line: only when nearly used up (?usage=high) — otherwise it lives in Lucy's setup
s = rep(s, "$('#tcCtxTxt').textContent = 'Claude · your key'; $('#tcUsage').hidden = false; $('#tcUsageBar').parentElement.hidden = false;",
           "$('#tcCtxTxt').textContent = USAGE_HIGH ? 'Today’s allowance is nearly used up' : 'Claude · your key'; $('#tcUsage').hidden = false; $('#tcUsageBar').parentElement.hidden = false; $('#tcCtx').classList.toggle('show', USAGE_HIGH); if (USAGE_HIGH){ $('#tcUsage').textContent = '262,000 / 300,000 today'; $('#tcUsageBar').style.width = '87%'; }")

JS = """
// ---- minimal box: ⋯ menu, help mode title, attach menu, what-Lucy-can-do ----
const USAGE_HIGH = new URLSearchParams(location.search).get('usage') === 'high';
let WHAT = false;
function tcMenuClose(){ $('#tcMenu').hidden = true; $('#tcMore').classList.remove('on'); }
function tcHelpMode(){ const h = tab === 'help'; $('#tc').classList.toggle('help', h); $('#tcTitle').textContent = h ? 'Help' : 'Lucy'; }
document.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('#tcMore')) { const m = $('#tcMenu'); m.hidden = !m.hidden; $('#tcMore').classList.toggle('on', !m.hidden); $('#tcHelpN2').textContent = $('#tcHelpN').textContent; return; }
  if (!t.closest('#tcMenu')) tcMenuClose();
  const mi = t.closest('#tcMenu [data-menu], #tcMenu [data-tab]');
  if (mi) { e.stopPropagation(); tcMenuClose(); const k = mi.dataset.menu || mi.dataset.tab; if (k === 'new') { tab = 'assistant'; AI.msgs = []; AI.list = false; AI.attach = false; render(); tcHelpMode(); $('#tcInput').focus(); } else if (k === 'hist') { tab = 'assistant'; AI.list = !AI.list; render(); tcHelpMode(); } else if (k === 'gear') { $('#tcGear').click(); } else if (k === 'help') { tab = 'help'; HELP.list = false; render(); tcHelpMode(); } else if (k === 'what') { WHAT = true; tab = 'assistant'; AI.list = false; render(); tcHelpMode(); } return; }
  if (t.closest('#tcMenu')) { e.stopPropagation(); return; }
  if (t.closest('#tcBack')) { tab = 'assistant'; render(); tcHelpMode(); return; }
  if (t.closest('#tcWhatBtn')) { WHAT = !WHAT; render(); return; }
  if (t.closest('#tcPlus')) { const a = $('#tcAmenu'); a.hidden = !a.hidden; return; }
  if (t.closest('#tcCam') || t.closest('#tcFile')) { $('#tcAmenu').hidden = true; }
  else if (!t.closest('#tcAmenu')) { const a = $('#tcAmenu'); if (a) a.hidden = true; }
}, true);
document.addEventListener('input', e => { if (e.target.id === 'tcInput') { e.target.style.height = 'auto'; e.target.style.height = Math.min(170, Math.max(66, e.target.scrollHeight)) + 'px'; } });
"""
s = rep(s, "$('#tcInput').placeholder = 'Ask about clients, leads, money, jobs…';", "$('#tcInput').placeholder = 'Ask Lucy…';")
s = rep(s, "window.BOX = { open: openBox,", JS + "window.BOX = { open: openBox,")
open('lucy-chat-minimal.html', 'w', encoding='utf-8').write(s)
print('lucy-chat-minimal.html', len(s))
