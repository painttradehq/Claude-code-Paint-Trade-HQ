"""Round 97 — build estimate-builder-sqm.html from estimate-builder-prep.html (Round 89): an m² box beside W L H that fills
itself from W × L and can be typed; floor-type lines take it, wall lines keep 2(W+L)×H; a Deck & Stairs area shows the case."""
import json, pathlib, re
SRC = pathlib.Path(__file__).resolve().parent.parent / 'estimate-builder-prep.html'
OUT = SRC.with_name('estimate-builder-sqm.html')
s = SRC.read_text()

def rep(a, b, count=1):
    global s
    assert s.count(a) == count, (a[:80], s.count(a))
    s = s.replace(a, b)

def obj_at(text, start):
    """The JSON object starting at text[start] == '{' (brace walk, strings respected)."""
    depth = 0; i = start; instr = False; esc = False
    while i < len(text):
        ch = text[i]
        if instr:
            if esc: esc = False
            elif ch == '\\': esc = True
            elif ch == '"': instr = False
        else:
            if ch == '"': instr = True
            elif ch == '{': depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0: return text[start:i + 1]
        i += 1
    raise ValueError('unbalanced')

rep('<title>Round 89 — Estimate builder: prep as a pop-up — Paint Trade HQ</title>', '<title>Round 97 — Estimate builder: square metres beside W L H — Paint Trade HQ</title>') if '<title>Round 89 — Estimate builder: prep as a pop-up — Paint Trade HQ</title>' in s else None
s = re.sub(r'<title>[^<]*</title>', '<title>Round 97 — Estimate builder: square metres beside W L H — Paint Trade HQ</title>', s, count=1)

# ── data: a Decking library item, a Deck & Stairs area with no dimensions, a Decking line ──
i = s.index('{"id": "lib_fence"'); fence = obj_at(s, i); fo = json.loads(fence)
deck = dict(fo); deck.update({"id": "lib_deck", "category": "Decking", "name": "Deck restoration", "priced_by": "m2", "scope": "exterior"})
if "rates" in deck and isinstance(deck["rates"], dict): deck["rates"] = {**deck["rates"], "c1": 42, "c2": 70, "c3": 92, "primer": 0}
s = s.replace(fence, fence + ', ' + json.dumps(deck), 1)
hall = '{"id": "a_hall", "name": "Hallway", "w": 0, "l": 0, "h": 0, "notes": "", "note_show_on_quote": false}'
rep(hall, hall + ', {"id": "a_deck", "name": "Deck & Stairs", "w": 0, "l": 0, "h": 0, "sqm": 0, "notes": "Client gave the area over the phone — 38 m², no drawings.", "note_show_on_quote": false}')
j = s.index('{"id": "l1", "area_id": "a_kitchen"'); l1 = obj_at(s, j); lo = json.loads(l1)
dl = dict(lo); dl.update({"id": "l_deck", "area_id": "a_deck", "lib_id": "lib_deck", "name": "Decking · Deck restoration", "unit": "m2", "qty": None, "qty_auto": True, "coats": 2, "primer": False, "prep": True, "product": "p_taub_endure", "colour": "Monument", "notes": ""})
for k in ("prep_steps", "prep_extra", "prep_show"):
    if k in lo: dl[k] = ["Wash down with sugar soap", "Sand back"] if k == "prep_steps" else (True if k == "prep_show" else "")
s = s.replace(l1, l1 + ', ' + json.dumps(dl), 1)

# ── maths ─────────────────────────────────────────────────────────────────────
rep("const areaCalc = (a) => { const w = +a.w || 0, l = +a.l || 0, h = +a.h || 0; return { walls: r2(2 * (w + l) * h), ceiling: r2(w * l), floor: r2(w * l), linear: r2(2 * (w + l)) }; };",
    "const areaCalc = (a) => { const w = +a.w || 0, l = +a.l || 0, h = +a.h || 0; const typed = +a.sqm > 0; const floor = typed ? r2(+a.sqm) : r2(w * l); return { walls: r2(2 * (w + l) * h), ceiling: floor, floor, linear: r2(2 * (w + l)), floorTyped: typed, floorMeasured: floor > 0, wallsMeasured: w > 0 && l > 0 && h > 0, linearMeasured: w > 0 && l > 0 }; };\n"
    "const FLOOR_CAT = /decking|driveway|concrete|floor/i, CEIL_CAT = /ceiling/i;\n"
    "const faceOf = (li) => { const lib = LIB[li.lib_id]; const cat = (lib?.category || ''); if (li.unit === 'lineal') return 'linear'; if (FLOOR_CAT.test(cat)) return 'floor'; if (CEIL_CAT.test(cat)) return 'ceiling'; return 'walls'; };\n"
    "const faceMeasured = (c, face) => face === 'walls' ? c.wallsMeasured : face === 'linear' ? c.linearMeasured : c.floorMeasured;\n"
    "const faceNeeds = (a, face) => { const w = +a.w > 0, l = +a.l > 0, h = +a.h > 0; if (face === 'walls') return !w || !l ? 'W, L and H' : 'H'; if (face === 'linear') return 'W and L'; return 'the m² — or W and L'; };\n"
    "const lineNeeds = (li, a) => { if (!a || !needsDims(li)) return null; const c = areaCalc(a); const f = faceOf(li); return faceMeasured(c, f) ? null : faceNeeds(a, f); };\n"
    "function derivedText(a, lines){ const c = areaCalc(a); const faces = new Set(lines.filter(needsDims).map(faceOf)); const parts = [];\n"
    "  if (c.floorMeasured) parts.push(`floor ${qfmt(c.floor)} m²${c.floorTyped ? ' (typed)' : ''}`); else if (faces.has('floor') || faces.has('ceiling')) parts.push('floor — type the m² or give W and L');\n"
    "  if (c.wallsMeasured) parts.push(`walls ${qfmt(c.walls)} m²`); else if (faces.has('walls')) parts.push(`walls — needs ${faceNeeds(a, 'walls')}`);\n"
    "  if (c.linearMeasured) parts.push(`${qfmt(c.linear)} lm`); else if (faces.has('linear')) parts.push('lm — needs W and L');\n"
    "  return parts.length ? parts.join(' · ') : 'no measurements needed yet'; }\n"
    "const areaMissing = (a, lines) => lines.some(l => lineNeeds(l, a));")
rep("""function autoQty(li, area){
  if (!area || !measured(area)) return 0;
  const c = areaCalc(area); const lib = LIB[li.lib_id]; const cat = (lib?.category || '').toLowerCase();
  if (li.unit === 'm2') return /ceiling/.test(cat) ? c.ceiling : c.walls;
  if (li.unit === 'lineal') return c.linear;
  return 1;
}""", """function autoQty(li, area){
  if (!area) return 0;
  const c = areaCalc(area); const f = faceOf(li);
  if (!faceMeasured(c, f)) return 0;
  if (li.unit === 'm2') return f === 'walls' ? c.walls : c.floor;
  if (li.unit === 'lineal') return c.linear;
  return 1;
}""")
# the derived text and the "missing" tint, in the render and in the live update
rep("m ? `walls ${qfmt(c.walls)} m² · ceiling ${qfmt(c.ceiling)} m² · ${qfmt(c.linear)} lm` : (lines.some(needsDims) ? 'not measured' : 'no measurements needed yet')", "derivedText(a, lines)", 2)
rep("<div class=\"dims ${!m && lines.some(needsDims) ? 'missing' : ''}\" data-dims=\"${a.id}\">", "<div class=\"dims ${areaMissing(a, lines) ? 'missing' : ''}\" data-dims=\"${a.id}\">")
rep("el.querySelector('.dims').classList.toggle('missing', !m && lines.some(needsDims));", "el.querySelector('.dims').classList.toggle('missing', areaMissing(a, lines)); const sq = el.querySelector('[data-sqm]'); if (sq && sq !== active){ sq.value = a.sqm ? qfmt(a.sqm) : (c.floor > 0 ? qfmt(c.floor) : ''); sq.classList.toggle('typed', !!a.sqm); } const tg = el.querySelector('.sqtag'); if (tg) tg.hidden = !a.sqm;")
# the warnings name what is missing
rep("const meta = nd ? `<span class=\"warn\">Measure ${esc(a?.name || 'the area')} to fill the quantity</span>`", "const meta = nd ? `<span class=\"warn\">${esc(a?.name || 'The area')} needs ${lineNeeds(li, a) || 'its measurements'} to fill the quantity</span>`")
rep("`Measure ${li.area_id ? areaById(li.area_id).name : 'the area'} and the litres work themselves out.`", "`Give ${li.area_id ? areaById(li.area_id).name : 'the area'} ${li.area_id ? (lineNeeds(li, areaById(li.area_id)) || 'its measurements') : 'its measurements'} and the litres work themselves out.`")
# nd (needs dims and has none) must follow the per-face rule
nd_old = re.search(r"const nd = [^;]+;", s)
assert nd_old, 'nd'
s = s.replace(nd_old.group(0), "const nd = needsDims(li) && !!lineNeeds(li, a);", 1)

# ── the header: the m² box after H ────────────────────────────────────────────
DIMS = "<label>W</label><input value=\"${a.w || ''}\" data-dim=\"w\" placeholder=\"0\"><label>L</label><input value=\"${a.l || ''}\" data-dim=\"l\" placeholder=\"0\"><label>H</label><input value=\"${a.h || ''}\" data-dim=\"h\" placeholder=\"0\"><span class=\"u\">m</span></div>"
SQM = "<span class=\"sep\"></span><label title=\"Floor area — fills itself from W × L; type it when the client gave you the square metres\">m²</label><input class=\"sq ${a.sqm ? 'typed' : ''}\" value=\"${a.sqm ? qfmt(a.sqm) : (areaCalc(a).floor > 0 ? qfmt(areaCalc(a).floor) : '')}\" data-sqm=\"${a.id}\" data-testid=\"area-sqm-${a.id}\" placeholder=\"0\" aria-label=\"Square metres\"><span class=\"sqtag\" data-testid=\"area-sqm-typed-${a.id}\" ${a.sqm ? '' : 'hidden'}>typed <button class=\"sqclear\" data-sqclear=\"${a.id}\" title=\"Back to W × L\" aria-label=\"Back to W × L\">×</button></span></div>"
# the area header (anchored on the class we set above) and the Add-work sheet's measure strip both get the box
rep("areaMissing(a, lines) ? 'missing' : ''}\" data-dims=\"${a.id}\">" + DIMS, "areaMissing(a, lines) ? 'missing' : ''}\" data-dims=\"${a.id}\">" + DIMS[:-6] + SQM)
rep("<div class=\"dims\" data-dims=\"${a.id}\">" + DIMS, "<div class=\"dims\" data-dims=\"${a.id}\">" + DIMS[:-6] + SQM)
rep("const measureStrip = a && !measured(a) ?", "const measureStrip = a && areaMissing(a, est.lines.filter(l => l.area_id === a.id)) ?")
rep("  .dims.missing{ background:var(--danger-bg); color:var(--danger); }",
    "  .dims.missing{ background:var(--danger-bg); color:var(--danger); }\n"
    "  .dims .sep{ width:1px; height:18px; background:var(--border-strong); margin:0 4px 0 6px; }\n"
    "  .dims input.sq{ width:52px; color:var(--text-muted); } .dims input.sq.typed{ color:var(--text-primary); font-weight:700; border-color:var(--accent); background:var(--accent-bg); }\n"
    "  .dims .sqtag{ font-size:10px; letter-spacing:.06em; text-transform:uppercase; color:var(--accent-ink); background:var(--accent-bg); border-radius:999px; padding:2px 4px 2px 7px; font-family:var(--font-body); font-weight:700; display:inline-flex; align-items:center; gap:2px; } .dims .sqtag[hidden]{ display:none; } .dims .sqclear{ border:none; background:none; color:var(--accent-ink); font-size:12px; padding:0 2px; line-height:1; }")
# input handling: typing the m² sets the override; clearing it goes back to W × L; × clears
rep("  if (t.matches('[data-dim]')){ const wrap = t.closest('[data-dims]'); const a = areaById(wrap.dataset.dims); a[t.dataset.dim] = +t.value || 0; changed(true);",
    "  if (t.matches('[data-sqm]')){ const a = areaById(t.dataset.sqm); a.sqm = +t.value || 0; t.classList.toggle('typed', !!a.sqm); const tg = t.parentElement.querySelector('.sqtag'); if (tg) tg.hidden = !a.sqm; changed(true); return; }\n"
    "  if (t.matches('[data-dim]')){ const wrap = t.closest('[data-dims]'); const a = areaById(wrap.dataset.dims); a[t.dataset.dim] = +t.value || 0; changed(true);")
# the × on the typed tag (click handler): find the first click-handler branch for data-amove and add ours before it
anchor = "  if ((x = c('[data-amove]'))){"
assert s.count(anchor) >= 1
s = s.replace(anchor, "  if ((x = c('[data-sqclear]'))){ const a = areaById(x.dataset.sqclear); a.sqm = 0; changed(true); render(); say('Back to W × L.'); return; }\n" + anchor, 1)

# typing fires `input` (the branch above sits in the `change` listener and only fires on blur): the same branch, live
rep("document.addEventListener('input', (e) => { const t = e.target; if (t.id === 'pl_paintl' && panel){",
    "document.addEventListener('input', (e) => { const t = e.target; if (t.matches && t.matches('[data-sqm]')){ const a = areaById(t.dataset.sqm); a.sqm = +t.value || 0; t.classList.toggle('typed', !!a.sqm); const tg = t.parentElement.querySelector('.sqtag'); if (tg) tg.hidden = !a.sqm; changed(true); return; } if (t.id === 'pl_paintl' && panel){")
OUT.write_text(s)
print('wrote', OUT.name, len(s))
