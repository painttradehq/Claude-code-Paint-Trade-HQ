#!/usr/bin/env python3
"""Fix Round E (owner notes, 7 Oct) on the estimate builder: wider right-side item picker, line summary order
Prep · Prime · coats · product · colour with the note on its own line, repeat picks become ×N, photos land in the
grid first, new-client More details, Job details = duration + start only, whole line opens details, client document
without pack sizes. Patches estimate-builder-faces.html as text."""
from pathlib import Path
SRC = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-faces.html')
OUT = Path('/home/user/Claude-code-Paint-Trade-HQ/estimate-builder-fix-e.html')
html = SRC.read_text()
def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:90])
    html = html.replace(a, b)

# ---- E8: the item picker is a right-side panel, wider, four tiles per row ----
rep("  .mbox.pk{ width:660px; max-width:100%; height:620px; max-height:88vh; display:flex; flex-direction:column; padding:0; overflow:hidden; }",
    "  .mscrim.pkside{ justify-content:flex-end; padding:0; }\n  .mbox.pk{ width:860px; max-width:96%; height:100%; max-height:100vh; border-radius:0; display:flex; flex-direction:column; padding:0; overflow:hidden; box-shadow:-16px 0 48px rgba(20,16,10,.2); }")
rep("  .pk-grid{ display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:10px; }", "  .pk-grid{ display:grid; grid-template-columns:repeat(4, minmax(0,1fr)); gap:12px; }")
rep("  .pk-body{ flex:1; min-height:0; overflow-y:auto; padding:16px 22px 20px; display:flex; flex-direction:column; gap:20px; }", "  .pk-body{ flex:1; min-height:0; overflow-y:auto; padding:20px 26px 24px; display:flex; flex-direction:column; gap:24px; }")
rep("function modal(html, cls = ''){ $('#mbox').className = 'mbox ' + cls; $('#mbox').innerHTML = html; $('#modal').hidden = false; }",
    "function modal(html, cls = ''){ $('#mbox').className = 'mbox ' + cls; $('#modal').classList.toggle('pkside', cls === 'pk'); $('#mbox').innerHTML = html; $('#modal').hidden = false; }")

# ---- E2: picking an each-item that is already on that face raises its quantity (Doors ×3) ----
rep("function pkPickElement(el){ const face = areaById(pk.face); const lib = LIB[ELEMENT_LIB[el]]; if (!face || !lib) return; const li = newLibraryLine(lib, face.id); est.lines.push(li); changed(); say(`${el} added to ${face.name}`); pk.added.push(`${face.name} · ${el}`); pkRender(); }",
    "function pkPickElement(el){ const face = areaById(pk.face); const lib = LIB[ELEMENT_LIB[el]]; if (!face || !lib) return; const have = est.lines.find(l => l.area_id === face.id && l.lib_id === lib.id); if (have && lib.priced_by === 'each'){ have.qty = (Number(have.qty) || 1) + 1; have.qty_auto = false; changed(); say(`${el} ×${have.qty} on ${face.name}`); pk.added.push(`${face.name} · ${el} ×${have.qty}`); pkRender(); return; } if (have){ say(`${el} is already on ${face.name} — it is measured, not counted`); return; } const li = newLibraryLine(lib, face.id); est.lines.push(li); changed(); say(`${el} added to ${face.name}`); pk.added.push(`${face.name} · ${el}`); pkRender(); }")
rep("  const lineCount = (el) => face ? est.lines.filter(l => l.area_id === face.id && l.lib_id === ELEMENT_LIB[el]).length : 0;",
    "  const lineCount = (el) => face ? est.lines.filter(l => l.area_id === face.id && l.lib_id === ELEMENT_LIB[el]).reduce((s, l) => s + (LIB[l.lib_id]?.priced_by === 'each' ? (Number(l.qty) || 1) : 1), 0) : 0;")

# ---- E5: the line summary — Prep · Prime · 2 coats · product · colour; the note on its own line; the card grows ----
rep("if (lib?.priced_by === 'hour') bits.push('hourly'); else { bits.push(`${li.coats} coat${li.coats === 1 ? '' : 's'}${li.primer ? ' + primer' : ''}${li.prep ? ' + prep' : ''}`); } if (li.product && PROD[li.product]) bits.push(`${PROD[li.product].brand} ${PROD[li.product].name}${li.colour ? ' in ' + esc(li.colour) : ''}`);",
    "if (lib?.priced_by === 'hour') bits.push('hourly'); else { if (li.prep) bits.push('Prep'); if (li.primer) bits.push('Prime'); bits.push(`${li.coats} coat${li.coats === 1 ? '' : 's'}`); } if (li.product && PROD[li.product]) { bits.push(`${PROD[li.product].brand} ${PROD[li.product].name}`); if (li.colour) bits.push(esc(li.colour)); }")
rep("  if (li.notes) bits.push(`<i>${esc(li.notes)}</i>${li.note_show_on_quote ? ' (on quote)' : ''}`);\n  return bits.join(' · ');",
    "  return bits.join(' · ') + (li.notes ? `<div class=\"lnote\">${svg('note')}${esc(li.notes)}${li.note_show_on_quote ? '<span class=\"onq\">on the quote</span>' : ''}</div>` : '');")
rep("  .lrow .ln .meta{ font-size:12px; color:var(--text-muted); margin-top:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }",
    "  .lrow .ln .meta{ font-size:12px; color:var(--text-muted); margin-top:2px; white-space:normal; line-height:1.4; }\n  .lrow .ln .meta .lnote{ display:flex; align-items:center; gap:5px; margin-top:3px; color:var(--text-secondary); font-style:italic; } .lrow .ln .meta .lnote svg{ width:12px; height:12px; flex-shrink:0; color:var(--text-muted); } .lrow .ln .meta .lnote .onq{ font-style:normal; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.05em; color:var(--accent-ink); background:var(--accent-bg); border-radius:4px; padding:1px 5px; margin-left:4px; }")
# the client document's row sub-line in the same order
rep("const sub = [li.kind === 'library' ? (LIB[li.lib_id]?.priced_by === 'hour' ? 'hourly' : `${li.coats} coat${li.coats===1?'':'s'}${li.primer?' + primer':''}${li.prep?' + prep':''}`)",
    "const sub = [li.kind === 'library' ? (LIB[li.lib_id]?.priced_by === 'hour' ? 'hourly' : [li.prep ? 'prep' : null, li.primer ? 'prime' : null, `${li.coats} coat${li.coats===1?'':'s'}`].filter(Boolean).join(' · '))")

# ---- E11: the whole name block opens the line details (photo count included), not only the name ----
rep("""    <div class="ln"><div class="nm" data-openline="${li.id}">${tag}${esc(li.name)}${li.optional ? '<span class="kindtag opt">Optional</span>' : ''}</div><div class="meta">${meta}</div></div>""",
    """    <div class="ln" data-openline="${li.id}" style="cursor:pointer"><div class="nm">${tag}${esc(li.name)}${li.optional ? '<span class="kindtag opt">Optional</span>' : ''}</div><div class="meta">${meta}</div></div>""")

# ---- E4: a new photo lands in the grid; Edit is a choice ----
rep("est.photos.push(p); if (ctx.line_id){ const li = lineById(ctx.line_id); if (li) li.photo = true; } changed(); openEditor(p.id); }",
    "est.photos.push(p); if (ctx.line_id){ const li = lineById(ctx.line_id); if (li) li.photo = true; } changed(); openPhotos(); say('Photo added · Edit to mark it up'); }")

# ---- E6: New client — More details (the CRM's fields) ----
rep("""<div class="fr3"><div class="fld"><label>Suburb</label><input type="text" id="cf_sub"></div><div class="fld"><label>State</label><input type="text" id="cf_state" value="QLD"></div><div class="fld"><label>Postcode</label><input type="text" id="cf_pc"></div></div></div>`""",
    """<div class="fr3"><div class="fld"><label>Suburb</label><input type="text" id="cf_sub"></div><div class="fld"><label>State</label><input type="text" id="cf_state" value="QLD"></div><div class="fld"><label>Postcode</label><input type="text" id="cf_pc"></div></div><button class="lnk" id="cf_more" data-testid="client-more">${svg('plus')} More details — company, other contacts, how they found you, notes</button><div id="cf_moreBox" hidden data-testid="client-more-box"><div class="fr"><div class="fld"><label>Company</label><input type="text" id="cf_company" placeholder="For strata, builders, agencies"></div><div class="fld"><label>How they found you</label><select id="cf_source"><option value="">—</option><option>Word of mouth</option><option>Google</option><option>Facebook / Instagram</option><option>Repeat client</option><option>Builder / agent</option><option>Other</option></select></div></div><div class="fr"><div class="fld"><label>Other contact</label><input type="text" id="cf_c2name" placeholder="Name · e.g. site manager"></div><div class="fld"><label>Their phone or email</label><input type="text" id="cf_c2"></div></div><div class="fld"><label>Notes</label><textarea id="cf_notes" rows="2" placeholder="Gate code, dog, parking, best time to call…"></textarea></div><div class="hint">Same fields as CRM › Add client — saved to the client record.</div></div></div>`""")
rep("  if (id === 'newContact'){", "  if (id === 'cf_more'){ $('#cf_moreBox').hidden = !$('#cf_moreBox').hidden; $('#cf_more').hidden = true; return; }\n  if (id === 'newContact'){")

# ---- E7: Job details = how long and when (the scope line and the reference go; the quote type and number already say what and which) ----
rep("""modal(`${mhead('Job details', 'Three short lines the client sees under the address. Leave blank to hide.')}<div class="mbody form"><div class="fld"><label>Scope in one line</label><input type="text" id="jd_scope" value="${esc(j.scope_summary)}" placeholder="e.g. Interior repaint of kitchen, living room and hallway"></div><div class="fr"><div class="fld"><label>Estimated duration</label>""",
    """modal(`${mhead('Job details', 'How long the job takes and when it starts — printed under the address. Leave blank to hide.')}<div class="mbody form"><div class="fr"><div class="fld"><label>How long it will take</label>""")
rep("""<div class="fld"><label>Start</label><input type="text" id="jd_start" value="${esc(j.start_date)}" placeholder="e.g. Mon 12 Oct or On acceptance"></div></div></div>""",
    """<div class="fld"><label>When it starts</label><input type="text" id="jd_start" value="${esc(j.start_date)}" placeholder="e.g. Mon 12 Oct or On acceptance"></div></div></div>""")
rep("Object.assign(est.job, { scope_summary: $('#jd_scope').value.trim(), est_duration:", "Object.assign(est.job, { est_duration:")
rep("  const jd = [est.job.scope_summary, est.job.est_duration ? `About ${est.job.est_duration}` : null,", "  const jd = [est.job.est_duration ? `About ${est.job.est_duration}` : null,")
rep("""<div class="v">${est.job.scope_summary ? 'On the quote' : '<span class="add">What, how long, when</span>'}</div>""", """<div class="v">${est.job.est_duration || est.job.start_date ? 'On the quote' : '<span class="add">How long and when</span>'}</div>""")
rep("""${est.job.scope_summary ? `<div class="kv"><span class="k">Scope</span><span>${esc(est.job.scope_summary)}</span></div>` : ''}${est.job.est_duration ? `<div class="kv"><span class="k">Est. duration</span>""",
    """${est.job.est_duration ? `<div class="kv"><span class="k">Duration</span>""")
rep("Your quote for ${esc(est.job.scope_summary || 'the painting work')} at", "Your quote for ${esc(est.estimate_type ? est.estimate_type.toLowerCase() + ' painting' : 'the painting work')} at")

# ---- E10: the client never sees pack sizes or litres ----
rep("""<td class="nm">${esc(r.p.brand)} ${esc(r.p.name)}<span class="sub">${esc(r.p.pack)}</span></td>""", """<td class="nm">${esc(r.p.brand)} ${esc(r.p.name)}</td>""")

OUT.write_text(html); print('wrote', OUT, len(html))
