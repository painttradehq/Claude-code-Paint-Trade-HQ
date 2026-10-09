#!/usr/bin/env python3
"""Lucy chat — direction E (owner, 9 Oct: "Notion AI is good"). Patches lucy-chat-minimal.html (the coloured
minimal box) into lucy-chat-notion.html: Lucy gets a face (three brown strokes on her cream circle) with five
moods that replace the typing dots; the empty state is six verb rows (the four starters + Remind me… + I've got
an idea, which fill the box instead of sending); answers end in source chips and Copy; the composer shows
Enter / Shift+Enter hints while focused. Everything else — ⋯ menu, help mode, attach menu, usage line — is
the minimal box unchanged. Every rep() asserts the exact occurrence count. Run make_lucy_minimal.py first."""
import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))

def rep(s, a, b, n=1):
    c = s.count(a); assert c == n, f'expected {n} of {a[:70]!r}, found {c}'
    return s.replace(a, b)

def rep1(s, a, b):
    i = s.find(a); assert i >= 0, f'missing {a[:70]!r}'
    return s[:i] + b + s[i + len(a):]

s = open('lucy-chat-minimal.html', encoding='utf-8').read()

CSS = """
  /* ---- direction E: the face, verb rows, source chips, composer hints ---- */
  .face{ display:inline-flex; width:100%; height:100%; }
  .face svg{ width:100%; height:100%; display:block; overflow:visible; }
  .face .eye, .face .brow{ transform-box:fill-box; transform-origin:center; }
  .face.idle .eye{ animation:lblink 6s infinite; }
  @keyframes lblink{ 0%,95%,100%{ transform:scaleY(1) } 97.5%{ transform:scaleY(.15) } }
  .face.think .brow{ animation:lbrow .9s ease-in-out infinite alternate; }
  .face.think .brow.br{ animation-delay:.45s; }
  @keyframes lbrow{ from{ transform:translateY(0) } to{ transform:translateY(-1.3px) } }
  .tc-bubble .face{ width:30px; height:30px; color:#F3E7D8; }
  .tc-bubble > svg{ display:none; }
  .tc-head .av .face{ width:20px; height:20px; color:#8B6A46; }
  .welcome .wav{ width:52px; height:52px; }
  .welcome .wav .face{ width:34px; height:34px; }
  .welcome .big{ font-size:21px; margin-bottom:8px; }
  .welcome .hey{ display:none; }
  .picks{ flex-direction:column; align-items:stretch; gap:0; }
  .picks button{ display:flex; align-items:center; gap:10px; width:100%; padding:8px 10px; border-radius:10px; background:none; border:1px solid transparent; font-size:14px; font-weight:500; color:var(--text-primary); text-align:left; }
  .picks button:hover{ background:var(--accent-bg); border-color:transparent; color:var(--text-primary); }
  .picks button svg{ width:17px; height:17px; color:var(--accent); flex-shrink:0; }
  .picks button small{ margin-left:auto; font-size:12px; color:var(--text-muted); font-weight:400; }
  .welcome .what{ padding:12px 10px 0; }
  .airow{ display:flex; gap:8px; align-items:flex-end; max-width:100%; }
  .airow .msg.ai{ max-width:calc(100% - 32px); }
  .sav{ width:24px; height:24px; border-radius:50%; background:#F3E7D8; color:#8B6A46; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-bottom:2px; }
  .sav .face{ width:16px; height:16px; }
  .typing{ border:none; background:none; padding:0; gap:8px; align-items:center; }
  .typing .dots{ display:flex; gap:4px; padding:12px 14px; background:#fff; border:1px solid var(--border); border-radius:14px; border-bottom-left-radius:5px; }
  .msg .src{ border-top:none; padding-top:0; margin-top:10px; gap:6px; }
  .msg .src code{ font-family:inherit; font-size:11.5px; color:var(--text-primary); background:#fff; border:1px solid var(--border); border-radius:6px; padding:3px 8px; display:inline-flex; align-items:center; gap:5px; }
  .msg .src code svg{ width:12px; height:12px; color:var(--accent); }
  .msg .src .copy{ font:inherit; font-size:11.5px; color:var(--text-muted); background:#fff; border:1px solid var(--border); border-radius:6px; padding:3px 8px; cursor:pointer; }
  .msg .src .copy:hover{ color:var(--text-primary); border-color:var(--border-strong); }
  .tc-foot{ flex-direction:column; align-items:stretch; }
  .tc-foot .box{ width:100%; }
  .tc-foot .hints{ display:flex; visibility:hidden; justify-content:space-between; align-items:center; padding:6px 6px 0; font-size:11.5px; color:var(--text-muted); }
  .tc-foot .hints .k{ border:1px solid var(--border); border-radius:6px; padding:1px 7px; background:#fff; }
  .tc-foot:focus-within .hints{ visibility:visible; }  /* reserved space: the footer never changes height, so a click on a row lands where it started */
"""
s = rep1(s, '</style>', CSS + '</style>')

# ---- the bubble shows the face (the old chat icon stays in the DOM, hidden by CSS)
s = rep(s, '<button class="tc-bubble" id="tcBubble" data-testid="tc-bubble" aria-label="Lucy and help">',
           '<button class="tc-bubble" id="tcBubble" data-testid="tc-bubble" aria-label="Lucy and help"><span class="face idle" data-face="bubble"></span>')

# ---- header avatar: the face instead of the L (help mode keeps the help icon)
s = rep(s, "$('#tcAv').innerHTML = tab === 'assistant' ? '<span class=\"l\">L</span>' : document.querySelector('[data-testid=\"tc-tab-help\"] svg').outerHTML;",
           "$('#tcAv').innerHTML = tab === 'assistant' ? faceHtml('head') : document.querySelector('[data-testid=\"tc-tab-help\"] svg').outerHTML;")

# ---- welcome: face, one-line greeting, six verb rows (four send, two fill the box)
s = rep(s, '<div class="wav">L</div><div class="big">Hi ${ME} — what do you want to know?</div><div class="hey">Ask me anything about this business.</div>',
           '<div class="wav">${faceHtml(\'welcome\')}</div><div class="big">Hi ${ME}, what do you want to know?</div>')
s = rep(s, "<div class=\"picks\">${STARTERS.map(([k, l]) => `<button data-starter=\"${k}\" data-testid=\"ai-starter-${k}\">${l}</button>`).join('')}</div>",
           "<div class=\"picks\">${STARTERS.map(([k, l]) => `<button data-starter=\"${k}\" data-testid=\"ai-starter-${k}\">${ROWICON[k]}${l}</button>`).join('')}${FILLERS.map(([k, l, h]) => `<button data-fill=\"${k}\" data-testid=\"ai-starter-${k}\">${ROWICON[k]}${l}<small>${h}</small></button>`).join('')}</div>")

# ---- messages: Lucy's face beside her bubbles; the thinking face beside the dots; sources as chips + Copy
s = rep(s, "b.innerHTML = AI.msgs.map(m => m.role === 'typing' ? '<div class=\"typing\" data-testid=\"ai-typing\"><i></i><i></i><i></i></div>'",
           "b.innerHTML = AI.msgs.map(m => m.role === 'typing' ? `<div class=\"typing\" data-testid=\"ai-typing\"><span class=\"sav\">${faceHtml('msg', 'think')}</span><span class=\"dots\"><i></i><i></i><i></i></span></div>`")
s = rep(s, "    : `<div class=\"msg ai\" data-testid=\"ai-msg-assistant\">${m.html}${m.src.length ? `<div class=\"src\" data-testid=\"ai-sources\">${svg('eye')} Read: ${m.src.map(s => `<code>${s}</code>`).join(' ')}</div>` : ''}</div>`).join('');",
           "    : `<div class=\"airow\"><span class=\"sav\">${faceHtml('msg', 'idle')}</span><div class=\"msg ai\" data-testid=\"ai-msg-assistant\">${m.html}<div class=\"src\" data-testid=\"ai-sources\">${m.src.map(s => `<code>${DOC}${srcLabel(s)}</code>`).join('')}<button class=\"copy\" data-copy data-testid=\"ai-copy\">Copy</button></div></div></div>`).join('');")

# ---- send: the face thinks while the dots show, smiles for a moment when the answer lands
s = rep(s, "AI.attach = false; $('#tcInput').value = ''; $('#tcInput').style.height = ''; renderAssistant();\n  setTimeout(() => { AI.msgs.pop(); AI.msgs.push({ role: 'ai', html: rep[0], src: rep[1] }); renderAssistant(); }, 700);",
           "AI.attach = false; $('#tcInput').value = ''; $('#tcInput').style.height = ''; setMood('think'); renderAssistant();\n  setTimeout(() => { AI.msgs.pop(); AI.msgs.push({ role: 'ai', html: rep[0], src: rep[1] }); setMood('done'); renderAssistant(); setTimeout(() => { if (MOOD === 'done') setMood('idle'); }, 1400); }, 700);")

# ---- composer hints under the box (shown while the box has focus)
s = rep(s, "</div><textarea id=\"tcInput\" placeholder=\"Ask Lucy…\" rows=\"3\" data-testid=\"ai-text-input\"></textarea>",
           "</div><textarea id=\"tcInput\" placeholder=\"Ask Lucy…\" rows=\"3\" data-testid=\"ai-text-input\"></textarea>")
i = s.find('<button class="ib send" id="tcSend"'); j = s.find('</button></div>', i) + len('</button></div>')
s = s[:j] + '<div class="hints" data-testid="ai-hints"><span><span class="k">Enter</span> to send</span><span><span class="k">Shift + Enter</span> for a new line</span></div>' + s[j:]

JS = r"""
// ---- direction E: the face, its moods, the verb rows, source chips ----
const FACES = {
  idle:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path class="brow bl" d="M6.5 7.5h3"/><path class="brow br" d="M14.5 7.5h3"/><circle class="eye" cx="8" cy="11" r="1.2" fill="currentColor" stroke="none"/><circle class="eye" cx="16" cy="11" r="1.2" fill="currentColor" stroke="none"/><path d="M12 11v4h2"/></svg>',
  listen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path class="brow bl" d="M6.5 7h3"/><path class="brow br" d="M14.5 7h3"/><circle class="eye" cx="8" cy="11" r="1.7"/><circle class="eye" cx="16" cy="11" r="1.7"/><path d="M12 11v4h2"/></svg>',
  think:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path class="brow bl" d="M6 8.5l3-1.5"/><path class="brow br" d="M14.5 6.5l3 1"/><circle class="eye" cx="9" cy="10.5" r="1.2" fill="currentColor" stroke="none"/><circle class="eye" cx="17" cy="10.5" r="1.2" fill="currentColor" stroke="none"/><path d="M12 11v4h2"/></svg>',
  done:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path class="brow bl" d="M6.5 6.5h3"/><path class="brow br" d="M14.5 6.5h3"/><path class="eye" d="M6.5 11.5a1.8 1.8 0 0 1 3 0"/><path class="eye" d="M14.5 11.5a1.8 1.8 0 0 1 3 0"/><path d="M12 11v4h2"/></svg>',
  error:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path class="brow bl" d="M5 9l3-2"/><path class="brow br" d="M15 5l3 2"/><circle class="eye" cx="7.5" cy="12.5" r="1.2" fill="currentColor" stroke="none"/><circle class="eye" cx="17" cy="9.5" r="1.2" fill="currentColor" stroke="none"/><path d="M11 13l1 4 2-1"/></svg>'
};
let MOOD = new URLSearchParams(location.search).get('mood') === 'error' ? 'error' : 'idle';
const faceHtml = (where, mood) => `<span class="face ${mood || MOOD}" data-face="${where}" data-testid="lucy-face-${where}">${FACES[mood || MOOD]}</span>`;
function setMood(m){ MOOD = m; $$('.face[data-face="head"], .face[data-face="bubble"], .face[data-face="welcome"]').forEach(el => { el.className = 'face ' + m; el.innerHTML = FACES[m]; }); }
const DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/></svg>';
const SRC_LABEL = { who_is_signed_in_today: 'Crew sign-ins', money_owed: 'Invoices', calendar_between: 'Calendar', recent_messages: 'Messages', list_leads: 'Leads', list_pending_estimates: 'Estimates', add_reminder: 'Reminders', save_idea: 'Ideas' };
const srcLabel = (k) => SRC_LABEL[k] || k.replace(/_/g, ' ');
const ROWICON = {
  site: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  owed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 3v18M7 8h7a3 3 0 0 1 0 6H8"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  quiet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M21 12a8 8 0 1 1-4.7-7.3"/><path d="M21 4v5h-5"/></svg>',
  remind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="9"/></svg>',
  idea: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z"/></svg>'
};
const FILLERS = [['remind', 'Remind me…', 'type it in the box'], ['idea', 'I’ve got an idea', 'type it in the box']];
const FILL_TEXT = { remind: 'Remind me to ', idea: 'I’ve got an idea: ' };
document.addEventListener('click', e => {
  const f = e.target.closest('[data-fill]'); if (f) { e.stopPropagation(); const ta = $('#tcInput'); ta.value = FILL_TEXT[f.dataset.fill]; ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); ta.dispatchEvent(new Event('input', { bubbles: true })); return; }
  const c = e.target.closest('[data-copy]'); if (c) { e.stopPropagation(); const txt = c.closest('.msg').innerText.replace(/\n?(Copy)$/, '').trim(); try { navigator.clipboard && navigator.clipboard.writeText(txt); } catch (_) {} c.textContent = 'Copied'; setTimeout(() => { c.textContent = 'Copy'; }, 1200); return; }
}, true);
document.addEventListener('input', e => { if (e.target.id === 'tcInput' && MOOD !== 'think' && MOOD !== 'error') setMood(e.target.value.trim() ? 'listen' : 'idle'); });
document.addEventListener('DOMContentLoaded', () => { const b = document.querySelector('.face[data-face="bubble"]'); if (b) { b.className = 'face ' + MOOD; b.innerHTML = FACES[MOOD]; } });
"""
s = rep(s, "window.BOX = { open: openBox,", JS + "window.BOX = { open: openBox,")
open('lucy-chat-notion.html', 'w', encoding='utf-8').write(s)
print('lucy-chat-notion.html', len(s))
