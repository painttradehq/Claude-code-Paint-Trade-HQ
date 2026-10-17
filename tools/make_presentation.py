#!/usr/bin/env python3
"""Round 74 — Presentation pages. Two prototypes:
1. quote-setup-presentation.html ← quote-setup-base.html: the Presentation tab becomes a two-page editor
   (Page 1 "Our work": hero + four large photos with captions; Page 2 "About us": headline, story, three wide
   photos, reviews + links switches) with a live preview of the pages, "Pick from a finished job", and the
   "Add presentation pages to every new quote" switch on the tab.
2. estimate-builder-presentation.html ← estimate-builder-gst.html: the client view / public page renders the
   pages at the back of the quote with large photo areas; Quote details texts; `?pres=on` opens the demo with
   the pages on.
Every rep() asserts the exact count."""
from pathlib import Path

ROOT = Path('/home/user/Claude-code-Paint-Trade-HQ')

# ============================================================ 1. Quote set-up gear
html = (ROOT / 'quote-setup-base.html').read_text()
def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:90])
    html = html.replace(a, b)

CSS = """  /* ---- Round 74: presentation pages editor ---- */
  .pg{ border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:12px; background:var(--surface); }
  .pg .pgh{ display:flex; align-items:center; gap:10px; margin-bottom:10px; }
  .pg .pgh .no{ font-family:var(--font-mono); font-size:11px; color:var(--text-muted); background:var(--surface-sunken); border-radius:6px; padding:2px 7px; }
  .pg .pgh h4{ margin:0; font-size:14px; font-weight:600; flex:1; }
  .pg .fr label.f{ margin-bottom:8px; }
  .hero{ position:relative; height:200px; border-radius:12px; border:2px dashed var(--border-strong); background:var(--surface-sunken); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:6px; color:var(--text-muted); font-size:12.5px; cursor:pointer; text-align:center; padding:0 20px; }
  .hero b{ color:var(--text-primary); } .hero svg{ width:22px; height:22px; }
  .hero.has{ border-style:solid; border-color:var(--border); color:#fff; }
  .hero .cap{ position:absolute; left:10px; bottom:8px; font-family:var(--font-mono); font-size:11px; background:rgba(0,0,0,.35); padding:2px 6px; border-radius:6px; }
  .hero .acts{ position:absolute; right:10px; top:10px; display:flex; gap:6px; }
  .hero .acts .btn{ padding:4px 9px; font-size:12px; background:rgba(255,255,255,.92); color:var(--text-primary); border-color:transparent; }
  .big4{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
  .wide3{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:10px; }
  .slot{ display:flex; flex-direction:column; gap:6px; min-width:0; }
  .slot .ph{ position:relative; border-radius:10px; overflow:hidden; border:1px solid var(--border); aspect-ratio:4/3; display:flex; align-items:center; justify-content:center; }
  .wide3 .slot .ph{ aspect-ratio:16/9; }
  .slot .ph.empty{ border:2px dashed var(--border-strong); background:var(--surface-sunken); color:var(--text-muted); font-size:12px; cursor:pointer; flex-direction:column; gap:3px; }
  .slot .ph.empty svg{ width:16px; height:16px; }
  .slot .ph .rm{ position:absolute; top:6px; right:6px; width:22px; height:22px; border-radius:99px; border:none; background:rgba(0,0,0,.45); color:#fff; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; } .slot .ph .rm svg{ width:12px; height:12px; }
  .slot .ph .nm{ position:absolute; left:8px; bottom:6px; font-family:var(--font-mono); font-size:10px; color:#fff; background:rgba(0,0,0,.35); padding:2px 5px; border-radius:5px; max-width:calc(100% - 16px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .slot input.cap{ font:inherit; font-size:12.5px; background:var(--surface-sunken); border:1px solid var(--border-strong); border-radius:8px; padding:6px 9px; color:var(--text-primary); min-width:0; }
  .slot input.cap:disabled{ opacity:.5; }
  .g0{ background:linear-gradient(160deg,#D9CFC0,#A8977E); } .g1{ background:linear-gradient(160deg,#CFD9D0,#7E9A88); } .g2{ background:linear-gradient(160deg,#D8D3E6,#8A7BC8); } .g3{ background:linear-gradient(160deg,#E6D8CF,#C89A7B); } .g4{ background:linear-gradient(160deg,#CFD6E6,#7B93C8); } .g5{ background:linear-gradient(160deg,#E0E6CF,#9AB07B); } .g6{ background:linear-gradient(160deg,#E6CFD8,#C87B9A); } .g7{ background:linear-gradient(160deg,#D2D2D2,#8C8C8C); }
  .jobpick{ margin-top:10px; border:1px solid var(--border); border-radius:10px; padding:10px; background:var(--surface-sunken); }
  .jobpick .t{ font-size:12px; color:var(--text-secondary); margin-bottom:8px; }
  .jobpick .row{ display:grid; grid-template-columns:repeat(6,1fr); gap:6px; }
  .jobpick .row button{ aspect-ratio:4/3; border-radius:8px; border:2px solid transparent; cursor:pointer; position:relative; padding:0; }
  .jobpick .row button:hover{ border-color:var(--accent); }
  .jobpick .row button span{ position:absolute; left:4px; right:4px; bottom:3px; font-family:var(--font-mono); font-size:9px; color:#fff; background:rgba(0,0,0,.4); padding:1px 4px; border-radius:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left; }
  .pgoff{ color:var(--text-muted); font-size:12.5px; padding:4px 0; }
  .pe-head .btn{ padding:5px 10px; font-size:12px; } .pe-head .btn.on{ border-color:var(--accent); color:var(--accent-ink); background:var(--accent-bg); } .pe-head .btn svg{ width:14px; height:14px; }
  /* preview sheets (the pages as the client sees them) */
  .sheet{ background:#fff; box-shadow:0 6px 24px rgba(20,16,10,.18); border-radius:4px; overflow:hidden; margin-bottom:16px; aspect-ratio:1/1.414; display:flex; flex-direction:column; color:#2A2622; }
  .sheet .pt{ padding:16px 18px 8px; font-family:var(--font-display); font-weight:600; font-size:18px; }
  .sheet .pt small{ display:block; font-family:var(--font-body); font-weight:500; font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:#8A8378; margin-bottom:4px; }
  .sheet .shero{ margin:0 18px; flex:0 0 38%; border-radius:6px; }
  .sheet .sgrid{ margin:10px 18px 0; display:grid; grid-template-columns:1fr 1fr; gap:8px; flex:1; }
  .sheet .sgrid div, .sheet .swide div{ border-radius:5px; position:relative; }
  .sheet i{ position:absolute; left:6px; bottom:5px; font-style:normal; font-size:8.5px; color:#fff; background:rgba(0,0,0,.35); padding:1px 5px; border-radius:4px; }
  .sheet .stext{ padding:0 18px; font-size:10.5px; line-height:1.55; color:#3B3548; }
  .sheet .stext p{ margin:0 0 8px; }
  .sheet .swide{ margin:12px 18px 0; display:grid; grid-template-columns:repeat(3,1fr); gap:8px; flex:0 0 22%; }
  .sheet .srev{ margin:14px 18px 0; display:flex; align-items:center; gap:10px; font-size:10px; } .sheet .srev b{ font-size:16px; } .sheet .srev .st{ color:#E8B923; letter-spacing:1px; }
  .sheet .slinks{ margin:10px 18px 0; display:flex; gap:8px; } .sheet .slinks span{ flex:1; border:1px solid #E5E1D8; border-radius:6px; padding:7px 9px; font-size:9.5px; font-weight:600; }
  .sheet .sfoot{ margin-top:auto; padding:10px 18px; font-size:9px; color:#8A8378; display:flex; justify-content:space-between; }
"""
rep("  label.f textarea.tall{ min-height:150px; }\n", "  label.f textarea.tall{ min-height:150px; }\n" + CSS)

# data: the default switch + pages on the residential template
rep("tax_enabled_by_default:true, currency:'AUD',", "tax_enabled_by_default:true, presentation_default_on:true, currency:'AUD',")
rep("photos:['a','b','c','d'], youtube_urls:['https://youtu.be/abc123'], drive_photos_url:'https://drive.google.com/folders/res-photos', drive_videos_url:'' }",
    "photos:['a','b','c','d'], youtube_urls:['https://youtu.be/abc123'], drive_photos_url:'https://drive.google.com/folders/res-photos', drive_videos_url:'', pages:{ one:{ title:'Our work', hero:'hero-manly.jpg', photos:['kitchen-after.jpg','facade-render.jpg','hallway-trim.jpg','deck-oil.jpg'], captions:['Kitchen · Manly','Render refresh · Dee Why','Hallway trims · Mosman','Deck re-oil · Balgowlah'] }, two:{ on:true, headline:'A bit about us', photos:['team-van.jpg','colour-consult.jpg','clean-site.jpg'], captions:['The team','Colour consult','Clean site, every day'], show_reviews:true, show_links:true } } }")

# texts on the tab and the PDF sections list
rep("Extra pages at the back of a quote: cover, intro, photos, videos and your reviews. Off by default — switch them on per quote in the builder (\"Presentation pages\"). A residential quote picks the residential template, a commercial quote the commercial one. Click a template to open it.",
    "One or two pages at the back of a quote, mostly large photos of your work, with your story and your reviews. New quotes follow the switch above; any quote can change it in its Quote details. A residential quote picks the residential template, a commercial quote the commercial one. Click a template to open it.")
rep("Cover, intro, photos, videos and reviews from the Presentation tab. Off by default; switch on per quote in the builder.",
    "One or two photo pages from the Presentation tab. New quotes follow the switch on that tab; each quote can change it in its Quote details.")
rep("""  <div class="qs-sec"><h3>Presentation templates <span class="n">${W.pres.length}</span>""",
    """  <div class="qs-sec">${tog('pres-default', W.defaults.presentation_default_on, 'Add presentation pages to every new quote', 'Each quote can still switch them off in its Quote details. Off: you switch them on per quote.')}</div>
  <div class="qs-sec"><h3>Presentation templates <span class="n">${W.pres.length}</span>""")

# helpers before the editor
HELPERS = r"""const JOB_PHOTOS = [['kitchen-after.jpg','Kitchen · Manly'],['facade-render.jpg','Render · Dee Why'],['hallway-trim.jpg','Hallway · Mosman'],['deck-oil.jpg','Deck · Balgowlah'],['team-van.jpg','The team'],['colour-consult.jpg','Colour consult'],['clean-site.jpg','Clean site'],['bedroom-feature.jpg','Feature wall · Manly'],['exterior-weatherboard.jpg','Weatherboards · Freshwater'],['stairwell.jpg','Fire stair · Brookvale'],['shopfront.jpg','Shopfront · Brookvale'],['pergola.jpg','Pergola · Seaforth']];
const gcls = (name) => 'g' + ([...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % 8);
function ensurePages(p) { if (!p.pages) { const ph = (p.photos || []).map(PH).map(u => u.split('/').pop()); p.pages = { one:{ title:'Our work', hero: p.cover_image_url ? p.cover_image_url.split('/').pop() : '', photos: ph.slice(0, 4), captions:['', '', '', ''] }, two:{ on:true, headline:'A bit about us', photos: ph.slice(4, 7), captions:['', '', ''], show_reviews:true, show_links:true } }; } const pg = p.pages; while (pg.one.photos.length < 4) pg.one.photos.push(''); while (pg.two.photos.length < 3) pg.two.photos.push(''); pg.one.captions = pg.one.captions || ['', '', '', '']; pg.two.captions = pg.two.captions || ['', '', '']; return pg; }
const photoCount = (pg) => (pg.one.hero ? 1 : 0) + pg.one.photos.filter(Boolean).length + (pg.two.on ? pg.two.photos.filter(Boolean).length : 0);
"""
rep("const PH = (u) => u.startsWith('http') ? u : 'https://storage.example/photo-' + u + '.jpg';\n",
    "const PH = (u) => u.startsWith('http') ? u : 'https://storage.example/photo-' + u + '.jpg';\n" + HELPERS)

# the editor, replaced whole
EDITOR = r"""function presEditor(p, isNew) { const pg = ensurePages(p); const n = photoCount(pg);
  const slot = (u, i, cap, kind) => `<div class="slot" data-testid="qs-pres-${kind}-${i}">${u ? `<div class="ph ${gcls(u)}" data-slot="${kind}" data-i="${i}" data-url="${esc(u)}"><span class="nm">${esc(u)}</span><button class="rm" data-slotrm="${kind}" data-i="${i}" title="Remove" data-testid="qs-pres-${kind}-remove-${i}">${svg('close')}</button></div>` : `<div class="ph empty" data-slotadd="${kind}" data-i="${i}" data-testid="qs-pres-${kind}-add-${i}">${svg('plus')}Add photo</div>`}<input class="cap" value="${esc(cap || '')}" placeholder="Caption (optional)" data-cap="${kind}" data-i="${i}" data-testid="qs-pres-${kind}-cap-${i}" ${u ? '' : 'disabled'}></div>`;
  return `<div class="pe-head"><button class="back" id="presBack" data-testid="qs-pres-back">${svg('arrowl')} Templates</button><h3>${isNew ? 'New template' : esc(p.name)}</h3><button class="btn btn-ghost ${previewOn ? 'on' : ''}" id="presPreviewBtn" data-testid="qs-pres-preview">${svg('eye')} ${previewOn ? 'Hide preview' : 'Live preview'}</button></div>
    <input type="hidden" id="pres-keep" value="${esc(JSON.stringify(p))}">
    <div class="fr">${fld('pres-name', 'Template name', p.name, { w2:true, ph:'Standard residential' })}<label class="f">Type<div class="chips typechips" id="presType">${['residential','commercial'].map(t => `<button data-ptype="${t}" class="${p.type === t ? 'on' : ''}" data-testid="qs-pres-type-${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></label></div>
    <div class="p" style="margin:0 0 10px">Two pages at the back of the quote, mostly photos. Up to 8 photos across both — <b data-testid="qs-pres-photo-count">${n} of 8</b> used.</div>
    <div class="pg" data-testid="qs-pres-page1"><div class="pgh"><span class="no">Page 1</span><h4>Our work</h4></div>
      <div class="fr">${fld('pres-p1-title', 'Page title', pg.one.title, { w2:true, ph:'Our work' })}</div>
      <div class="hero ${pg.one.hero ? 'has ' + gcls(pg.one.hero) : ''}" id="heroDrop" data-testid="qs-pres-hero-drop">${pg.one.hero ? `<span class="cap">${esc(pg.one.hero)}</span><span class="acts"><button class="btn btn-ghost" id="heroReplace" data-testid="qs-pres-hero-replace">Replace</button><button class="btn btn-ghost" id="heroRemove" data-testid="qs-pres-hero-remove">Remove</button></span>` : `${svg('image')}<b>Hero photo — the biggest picture, full width</b><span>Your best finished job · JPG or PNG up to 10 MB · drop it here or click</span>`}</div>
      <input type="hidden" id="pres-hero" value="${esc(pg.one.hero)}" data-testid="qs-pres-hero">
      <div class="big4" id="big4">${pg.one.photos.map((u, i) => slot(u, i, pg.one.captions[i], 'big')).join('')}</div>
      <button class="lnk" id="jobPickBtn" data-testid="qs-pres-jobpick" style="margin-top:8px">${svg('folder')} Pick from a finished job</button>
      <div class="jobpick" id="jobPick" hidden data-testid="qs-pres-jobpick-strip"><div class="t">Photos from your finished jobs. Click one to put it in the next empty spot.</div><div class="row">${JOB_PHOTOS.map(([f, l], i) => `<button class="${gcls(f)}" data-job="${esc(f)}" data-testid="qs-pres-jobpick-${i}" title="${esc(l)}"><span>${esc(l)}</span></button>`).join('')}</div></div>
    </div>
    <div class="pg" data-testid="qs-pres-page2"><div class="pgh"><span class="no">Page 2</span><h4>About us</h4><button class="tog ${pg.two.on ? 'on' : ''}" id="pres-page2" data-testid="qs-pres-page2-toggle" role="switch" aria-checked="${pg.two.on}"></button></div>
      ${pg.two.on ? `<div class="fr">${fld('pres-p2-headline', 'Headline', pg.two.headline, { w2:true, ph:'A bit about us' })}</div>
      <label class="f">Your story<textarea class="tall" id="pres-intro" data-testid="qs-pres-intro" placeholder="Who you are, how you work, what the client can expect. A paragraph or two.">${esc(p.intro)}</textarea></label>
      <div class="wide3" id="wide3">${pg.two.photos.map((u, i) => slot(u, i, pg.two.captions[i], 'wide')).join('')}</div>
      ${tog('pres-reviews', pg.two.show_reviews, 'Show your Google reviews', 'The rating, the count and the link from the Reviews box on the Presentation tab.')}
      ${tog('pres-links', pg.two.show_links, 'Show the Drive and video links', 'Buttons to the folders and videos below.')}
      <div class="fr" style="margin-top:8px">${fld('pres-drive-photos', 'More photos (Drive folder)', p.drive_photos_url, { ph:'https://drive.google.com/…' })}${fld('pres-drive-videos', 'Videos (Drive folder)', p.drive_videos_url, { ph:'https://drive.google.com/…' })}</div>
      <div class="vids" id="vids" style="margin-top:4px">${p.youtube_urls.map((u, i) => `<div class="vid"><span class="pl">${svg('play')}</span><input value="${esc(u)}" data-vd="${i}" data-testid="qs-pres-video-${i}" placeholder="https://youtu.be/…"><button class="rm" data-vdrm="${i}" title="Remove">${svg('close')}</button></div>`).join('')}</div>
      <button class="lnk" id="vdAdd" data-testid="qs-pres-video-add" style="margin-top:6px">+ Add a YouTube link</button>` : `<div class="pgoff" data-testid="qs-pres-page2-off">Off — the quote ends with page 1. Turn it on for your story, three more photos, your reviews and the links.</div>`}
    </div>
    ${isNew ? '' : `<div class="qs-sec"><button class="lnk pe-del" data-pdel="${p.id}" data-testid="qs-pres-delete-${p.id}">${svg('trash')} Delete this template</button></div>`}`; }
"""
start = html.index('function presEditor(p, isNew) {'); end = html.index('function tabPres() {')
assert html.count('function presEditor(p, isNew) {') == 1 and html.count('function tabPres() {') == 1
html = html[:start] + EDITOR + html[end:]

# readPresForm, replaced whole line
start = html.index('function readPresForm() {'); end = html.index('\n', start) + 1
assert html.count('function readPresForm() {') == 1
html = html[:start] + r"""function readPresForm() { const keep = JSON.parse($('#pres-keep').value); const pg = ensurePages(keep); const two = !!$('#pres-page2')?.classList.contains('on');
  const p = { ...keep, id: presEdit, name: $('#pres-name').value.trim(), type: $('#presType .on')?.dataset.ptype || 'residential', intro: $('#pres-intro') ? $('#pres-intro').value : keep.intro, drive_photos_url: $('#pres-drive-photos') ? $('#pres-drive-photos').value.trim() : keep.drive_photos_url, drive_videos_url: $('#pres-drive-videos') ? $('#pres-drive-videos').value.trim() : keep.drive_videos_url, youtube_urls: $('#vids') ? $$('[data-vd]').map(i => i.value.trim()) : keep.youtube_urls };
  pg.one.title = $('#pres-p1-title').value.trim() || 'Our work'; pg.one.hero = $('#pres-hero').value.trim(); pg.one.photos = [0, 1, 2, 3].map(i => $(`#big4 [data-slot="big"][data-i="${i}"]`)?.dataset.url || ''); pg.one.captions = [0, 1, 2, 3].map(i => $(`[data-cap="big"][data-i="${i}"]`)?.value.trim() || '');
  pg.two.on = two; if (two) { pg.two.headline = $('#pres-p2-headline').value.trim() || 'A bit about us'; pg.two.photos = [0, 1, 2].map(i => $(`#wide3 [data-slot="wide"][data-i="${i}"]`)?.dataset.url || ''); pg.two.captions = [0, 1, 2].map(i => $(`[data-cap="wide"][data-i="${i}"]`)?.value.trim() || ''); pg.two.show_reviews = $('#pres-reviews').classList.contains('on'); pg.two.show_links = $('#pres-links').classList.contains('on'); }
  p.pages = pg; p.cover_image_url = pg.one.hero ? 'https://storage.example/' + pg.one.hero : ''; p.photos = [pg.one.hero, ...pg.one.photos, ...(pg.two.on ? pg.two.photos : [])].filter(Boolean).map(f => 'https://storage.example/' + f); return p; }
""" + html[end:]

# preview: pdf renderer renamed, dispatcher + pages renderer added
rep("function renderPreview() { if (!previewOn || qsTab !== 'pdf') return;", "function renderPdfPreview() { if (!previewOn || qsTab !== 'pdf') return; $('#qsPreview .ph span').innerHTML = PDF_PREVIEW_HEAD;")
rep("function setPreview(on) {", r"""const PDF_PREVIEW_HEAD = 'Live preview <small>· the PDF your client gets — in the build this pane shows the real PDF from the renderer; this drawing only shows where it sits</small>';
function renderPreview() { if (qsTab === 'presentation' && (presEdit || presNew)) return renderPresPreview(); return renderPdfPreview(); }
function renderPresPreview() { if (!previewOn || !$('#pres-keep')) return; const p = readPresForm(); const pg = p.pages; const r = W.reviews; const stars = '★★★★★'.slice(0, Math.round(r.google_review_rating || 0)); const biz = 'Sano Painting & Decorating';
  const cell = (u, cap) => `<div class="${u ? gcls(u) : 'g7'}" style="${u ? '' : 'opacity:.35'}">${u && cap ? `<i>${esc(cap)}</i>` : ''}</div>`;
  let h = `<div class="sheet" data-testid="qs-prev-page1"><div class="pt"><small>${esc(biz)} · presentation</small>${esc(pg.one.title)}</div><div class="shero ${pg.one.hero ? gcls(pg.one.hero) : 'g7'}" style="${pg.one.hero ? '' : 'opacity:.35'}"></div><div class="sgrid">${pg.one.photos.map((u, i) => cell(u, pg.one.captions[i])).join('')}</div><div class="sfoot"><span>${esc(biz)}</span><span>Page 1 of ${pg.two.on ? 2 : 1}</span></div></div>`;
  if (pg.two.on) h += `<div class="sheet" data-testid="qs-prev-page2"><div class="pt"><small>${esc(biz)} · presentation</small>${esc(pg.two.headline)}</div><div class="stext">${esc(p.intro || 'Your story goes here.').split('\n').filter(Boolean).map(x => `<p>${x}</p>`).join('')}</div><div class="swide">${pg.two.photos.map((u, i) => cell(u, pg.two.captions[i])).join('')}</div>${pg.two.show_reviews && r.google_reviews_url ? `<div class="srev" data-testid="qs-prev-reviews"><b>${esc(String(r.google_review_rating))}</b><span class="st">${stars}</span><span>from ${r.google_review_count} Google reviews</span></div>` : ''}${pg.two.show_links && (p.drive_photos_url || p.drive_videos_url || p.youtube_urls.some(Boolean)) ? `<div class="slinks" data-testid="qs-prev-links">${p.drive_photos_url ? '<span>📸 Full photo gallery</span>' : ''}${(p.drive_videos_url || p.youtube_urls.some(Boolean)) ? '<span>▶ Walkthrough videos</span>' : ''}</div>` : ''}<div class="sfoot"><span>${esc(biz)}</span><span>Page 2 of 2</span></div></div>`;
  $('#qsPreviewBody').innerHTML = h; $('#qsPreview .ph span').innerHTML = 'Live preview <small>· the pages as the client sees them at the back of the quote; the photos are placeholders here</small>'; }
function setPreview(on) {""")
rep("if (qsTab !== 'pdf') setPreview(false); else if (previewOn) renderPreview(); }",
    "if (qsTab !== 'pdf' && !(qsTab === 'presentation' && (presEdit || presNew))) setPreview(false); else if (previewOn) renderPreview(); }")
rep("if (qsTab === 'pdf' && previewOn) renderPreview();", "if (previewOn) renderPreview();")

# clicks: capture-phase handlers for the editor and the default switch, before the generic handler
CLICKS = r"""$('#qsBody').addEventListener('click', e => {
  const t = e.target; const stop = () => { e.stopPropagation(); e.preventDefault(); };
  if (qsTab === 'presentation' && !(presEdit || presNew) && t.closest('#pres-default')) { stop(); const b = t.closest('.tog'); b.classList.toggle('on'); const on = b.classList.contains('on'); b.setAttribute('aria-checked', on); W.defaults.presentation_default_on = on; QS.defaults.presentation_default_on = on; say(on ? 'New quotes get presentation pages — PUT /admin/profile/estimate-defaults' : 'New quotes start without presentation pages — PUT /admin/profile/estimate-defaults'); return; }
  if (!(qsTab === 'presentation' && (presEdit || presNew))) return;
  const fill = (p, kind, i, name) => { if (kind === 'big') p.pages.one.photos[i] = name; else p.pages.two.photos[i] = name; };
  const nextEmpty = (p) => { const i1 = p.pages.one.photos.findIndex(x => !x); if (!p.pages.one.hero) return ['hero', 0]; if (i1 >= 0) return ['big', i1]; if (p.pages.two.on) { const i2 = p.pages.two.photos.findIndex(x => !x); if (i2 >= 0) return ['wide', i2]; } return null; };
  const done = (p, keepPick) => { rerenderPresForm(p); if (keepPick) $('#jobPick').hidden = false; mark(); renderPreview(); };
  let x;
  if (t.closest('#heroDrop') && !t.closest('button')) { stop(); const p = readPresForm(); p.pages.one.hero = 'hero-' + (Date.now() % 1000) + '.jpg'; say('Upload — POST /admin/presentation-templates/{id}/photos'); done(p); return; }
  if (t.closest('#heroReplace')) { stop(); const p = readPresForm(); p.pages.one.hero = 'hero-' + (Date.now() % 1000) + '.jpg'; say('Upload — the new photo replaces the hero'); done(p); return; }
  if (t.closest('#heroRemove')) { stop(); const p = readPresForm(); p.pages.one.hero = ''; done(p); return; }
  if ((x = t.closest('[data-slotadd]'))) { stop(); const p = readPresForm(); fill(p, x.dataset.slotadd, +x.dataset.i, 'upload-' + (Date.now() % 1000) + '.jpg'); say('Upload — POST /admin/presentation-templates/{id}/photos'); done(p); return; }
  if ((x = t.closest('[data-slotrm]'))) { stop(); const p = readPresForm(); fill(p, x.dataset.slotrm, +x.dataset.i, ''); (x.dataset.slotrm === 'big' ? p.pages.one : p.pages.two).captions[+x.dataset.i] = ''; done(p); return; }
  if (t.closest('#jobPickBtn')) { stop(); const jp = $('#jobPick'); jp.hidden = !jp.hidden; return; }
  if ((x = t.closest('[data-job]'))) { stop(); const p = readPresForm(); const at = nextEmpty(p); if (!at) { say('All 8 spots are full — remove one first'); return; } if (at[0] === 'hero') p.pages.one.hero = x.dataset.job; else fill(p, at[0], at[1], x.dataset.job); say(`${x.title} added — GET /projects/{id}/photos`); done(p, true); return; }
  if (t.closest('#pres-page2')) { stop(); const p = readPresForm(); p.pages.two.on = !p.pages.two.on; done(p); return; }
  if (t.closest('#pres-reviews') || t.closest('#pres-links')) { stop(); const b = t.closest('.tog'); b.classList.toggle('on'); b.setAttribute('aria-checked', b.classList.contains('on')); mark(); renderPreview(); return; }
  if (t.closest('#presPreviewBtn')) { stop(); setPreview(!previewOn); const b = $('#presPreviewBtn'); if (b) { b.classList.toggle('on', previewOn); b.innerHTML = svg('eye') + (previewOn ? ' Hide preview' : ' Live preview'); } return; }
}, true);
"""
rep("$('#qsBody').addEventListener('click', e => {\n    if (e.target.closest('#phAdd'))", CLICKS + "$('#qsBody').addEventListener('click', e => {\n    if (e.target.closest('#phAdd'))")
(ROOT / 'quote-setup-presentation.html').write_text(html)
print('wrote quote-setup-presentation.html', len(html))

# ============================================================ 2. Estimate builder
html = (ROOT / 'estimate-builder-gst.html').read_text()

CSS2 = """  /* ---- Round 74: presentation pages on the client view / public page ---- */
  .cdoc .ppage{ margin-top:28px; padding-top:22px; border-top:1px dashed #E4DED2; }
  .cdoc .ppage .ptitle{ font-family:var(--font-display); font-weight:600; font-size:24px; margin:6px 0 14px; letter-spacing:-0.01em; }
  .cdoc .phero{ height:320px; border-radius:12px; position:relative; }
  .cdoc .pgrid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
  .cdoc .pgrid div{ height:200px; border-radius:10px; position:relative; }
  .cdoc .pwide{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:16px; }
  .cdoc .pwide div{ height:140px; border-radius:10px; position:relative; }
  .cdoc .ppage i.cap{ position:absolute; left:10px; bottom:8px; font-style:normal; font-size:11px; color:#fff; background:rgba(0,0,0,.38); padding:2px 7px; border-radius:6px; }
  .cdoc .pstory{ font-size:14px; line-height:1.6; color:#3B3548; max-width:640px; margin:0; }
  .cdoc .plinks{ display:flex; gap:10px; margin-top:14px; } .cdoc .plinks a{ flex:1; border:1px solid #E4DED2; border-radius:10px; padding:10px 12px; font-size:12.5px; font-weight:600; color:#1F1B2E; text-decoration:none; }
  .cdoc .g0{ background:linear-gradient(160deg,#D9CFC0,#A8977E); } .cdoc .g1{ background:linear-gradient(160deg,#CFD9D0,#7E9A88); } .cdoc .g2{ background:linear-gradient(160deg,#D8D3E6,#8A7BC8); } .cdoc .g3{ background:linear-gradient(160deg,#E6D8CF,#C89A7B); } .cdoc .g4{ background:linear-gradient(160deg,#CFD6E6,#7B93C8); } .cdoc .g5{ background:linear-gradient(160deg,#E0E6CF,#9AB07B); } .cdoc .g6{ background:linear-gradient(160deg,#E6CFD8,#C87B9A); } .cdoc .g7{ background:linear-gradient(160deg,#D2D2D2,#8C8C8C); }
"""
rep("  .cdoc .pres{ margin-top:22px; padding-top:18px; border-top:1px dashed #E4DED2; }\n", "  .cdoc .pres{ margin-top:22px; padding-top:18px; border-top:1px dashed #E4DED2; }\n" + CSS2)

PAGES = r"""const PRES_PAGES = { 'Residential showcase': { one:{ title:'Our work', hero:'hero-manly.jpg', photos:['kitchen-after.jpg','facade-render.jpg','hallway-trim.jpg','deck-oil.jpg'], captions:['Kitchen · Manly','Render refresh · Dee Why','Hallway trims · Mosman','Deck re-oil · Balgowlah'] }, two:{ on:true, headline:'A bit about us', story:'We treat your home like our own — tidy, on time and finished to a standard we are proud to put our name on. Two painters on every job, dust sheets everywhere, and a walk-through with you before we call it done.', photos:['team-van.jpg','colour-consult.jpg','clean-site.jpg'], captions:['The team','Colour consult','Clean site, every day'], show_reviews:true, show_links:true, drive_photos_url:'https://drive.google.com/folders/res-photos', videos:true } },
  'Commercial & strata': { one:{ title:'Recent commercial work', hero:'strata-facade.jpg', photos:['shopfront.jpg','carpark-lines.jpg','stairwell.jpg','office-fitout.jpg'], captions:['Strata facade · Manly','Shopfront · Brookvale','Fire stair · Brookvale','Office fit-out · Chatswood'] }, two:{ on:false } } };
const gcls = (name) => 'g' + ([...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % 8);
function renderPresPages(est, biz){ const pg = PRES_PAGES[est.presentation_template] || PRES_PAGES['Residential showcase']; const stars = '★★★★★'.slice(0, Math.round(biz.reviews.rating));
  const cell = (u, cap) => `<div class="${gcls(u)}">${cap ? `<i class="cap">${esc(cap)}</i>` : ''}</div>`;
  let h = `<div class="ppage" data-testid="cdoc-pres-page1"><div class="tag">Presentation · page 1${pg.two.on ? ' of 2' : ''}</div><div class="ptitle">${esc(pg.one.title)}</div><div class="phero ${gcls(pg.one.hero)}" data-testid="cdoc-pres-hero"></div><div class="pgrid" data-testid="cdoc-pres-grid">${pg.one.photos.map((u, i) => cell(u, pg.one.captions[i])).join('')}</div></div>`;
  if (pg.two.on) h += `<div class="ppage" data-testid="cdoc-pres-page2"><div class="tag">Presentation · page 2 of 2</div><div class="ptitle">${esc(pg.two.headline)}</div><p class="pstory">${esc(pg.two.story)}</p><div class="pwide" data-testid="cdoc-pres-wide">${pg.two.photos.map((u, i) => cell(u, pg.two.captions[i])).join('')}</div>${pg.two.show_reviews ? `<div class="reviews" data-testid="cdoc-pres-reviews"><div class="rating">${biz.reviews.rating.toFixed(1)}</div><div><div class="stars">${stars}</div><div class="n">${biz.reviews.count} Google reviews · <a href="${esc(biz.reviews.url)}" style="color:inherit">read them</a></div></div></div>` : ''}${pg.two.show_links ? `<div class="plinks" data-testid="cdoc-pres-links">${pg.two.drive_photos_url ? `<a href="${esc(pg.two.drive_photos_url)}">📸 Full photo gallery</a>` : ''}${pg.two.videos ? '<a href="#">▶ Walkthrough videos</a>' : ''}</div>` : ''}</div>`;
  return h; }
"""
rep("\nconst LIB_PHOTO = {", "\n" + PAGES + "\nconst LIB_PHOTO = {")

start = html.index("  if (est.presentation_enabled) h += `<div class=\"pres\">"); end = html.index('\n', start) + 1
assert html.count("  if (est.presentation_enabled) h += `<div class=\"pres\">") == 1
html = html[:start] + "  if (est.presentation_enabled) h += renderPresPages(est, biz);\n" + html[end:]

rep("$('#cdoc .pres')?.scrollIntoView", "$('#cdoc .ppage')?.scrollIntoView")
rep("Pages after the quote that sell the job — recent work, reviews and your story. Set up under the Estimates gear › Presentation.",
    "One or two pages at the back of the quote with large photos of your work, your story and your reviews. Set up under the Estimates gear › Presentation; new quotes follow the switch there.")
rep("d:'Recent homes, five reviews and your story — for houses and units.'", "d:'Two pages: eight large photos of recent homes, your story and your reviews.'")
rep("d:'Body-corporate and shopfront work, compliance line, trade references.'", "d:'One page: five large photos of body-corporate and shopfront work.'")
rep("if (params.get('gst') === 'incl'){ est.tax.inclusive = true; changed(); }",
    "if (params.get('gst') === 'incl'){ est.tax.inclusive = true; changed(); }\nif (params.get('pres') === 'on'){ est.presentation_enabled = true; changed(); }")
(ROOT / 'estimate-builder-presentation.html').write_text(html)
print('wrote estimate-builder-presentation.html', len(html))
