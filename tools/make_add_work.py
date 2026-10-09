#!/usr/bin/env python3
"""Owner (9 Oct): "fix the Add work page to the same size as the Add area page". Patches the Fix Round E builder
(estimate-builder-fix-e.html) into estimate-builder-add-work.html: the Add work sheet takes the picker's size —
860 px wide, max 96 % of the window, full height — and the picker's body padding. Nothing else changes
(tabs, search, chips, rows, custom line, repair, footer all as built). Every rep() asserts the exact count."""
from pathlib import Path
SRC = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-fix-e.html')
OUT = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-add-work.html')
html = SRC.read_text()
def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:90])
    html = html.replace(a, b)

# the sheet = the picker's box: same width rule, same max width, full height
rep("  .sheet{ width:560px; max-width:96%; height:100%; background:var(--bg); border-left:1px solid var(--border); box-shadow:-16px 0 48px rgba(20,16,10,.2); display:flex; flex-direction:column; }",
    "  .sheet{ width:860px; max-width:96%; height:100%; background:var(--bg); border-left:1px solid var(--border); box-shadow:-16px 0 48px rgba(20,16,10,.2); display:flex; flex-direction:column; }  /* same size as the Add area picker (E8) */")
# the same breathing room inside as the picker body
rep("  .sh-body{ flex:1; overflow:auto; padding:14px 20px 24px; }", "  .sh-body{ flex:1; overflow:auto; padding:20px 26px 24px; }")
rep("  .sh-head{ padding:16px 20px 12px; border-bottom:1px solid var(--border); background:var(--surface); }", "  .sh-head{ padding:16px 26px 12px; border-bottom:1px solid var(--border); background:var(--surface); }")
rep("  .sh-foot{ padding:12px 20px; border-top:1px solid var(--border); background:var(--surface); display:flex; align-items:center; gap:10px; }", "  .sh-foot{ padding:12px 26px; border-top:1px solid var(--border); background:var(--surface); display:flex; align-items:center; gap:10px; }")
OUT.write_text(html)
print('wrote', OUT, len(html))
