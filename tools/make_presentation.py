#!/usr/bin/env python3
"""Round 74 — Presentation pages, block builder (second design, 18 Oct). Two prototypes:
1. quote-setup-presentation.html ← quote-setup-base.html: the Presentation tab's template editor becomes a list of
   BLOCKS the admin orders freely — Hero photo, Photo grid (2 × 2 or three wide), Message, About us, Reviews,
   Links, Page break — with move up/down, remove, "+ Add a block", per-block "Pick from a finished job", a live
   preview of the resulting page(s), and the "Add presentation pages to every new quote" switch on the tab.
2. estimate-builder-presentation.html ← estimate-builder-gst.html: the client view / public page renders the blocks
   at the back of the quote, split into pages at the page break; Quote details texts; `?pres=on` opens the demo on.
Every rep() asserts the exact count."""
from pathlib import Path

ROOT = Path('/home/user/Claude-code-Paint-Trade-HQ')
RATINGS_SECTION = r"""  <div class="qs-sec" data-testid="qs-ratings"><h3>Reviews &amp; ratings <span class="n" data-testid="qs-ratings-count">${R.length} of 3</span></h3><div class="p">Up to three platforms. The Reviews block on your presentation prints each one as "4.9 ★★★★★ from 87 reviews on hipages" with its link. Google, hipages, Oneflare, ServiceSeeking, Airtasker, Facebook, ProductReview, Word of Mouth, TrueLocal, Houzz or Trustpilot.</div>
    ${R.map((x, i) => `<div class="rrow" data-testid="qs-rating-${i}"><span class="rmark" style="background:${PLATFORMS[x.platform].color}">${PLATFORMS[x.platform].mark}</span><select data-rp="${i}" data-testid="qs-rating-platform-${i}" aria-label="Platform">${Object.entries(PLATFORMS).map(([k, v]) => `<option value="${k}" ${x.platform === k ? 'selected' : ''}>${v.name}</option>`).join('')}</select><input class="v" type="number" step="0.1" min="0" max="5" value="${x.rating ?? ''}" data-rr="${i}" data-testid="qs-rating-stars-${i}" placeholder="4.9" aria-label="Star rating"><input class="v" type="number" step="1" min="0" value="${x.count ?? ''}" data-rc="${i}" data-testid="qs-rating-count-${i}" placeholder="87" aria-label="Review count"><input class="u" value="${esc(x.url || '')}" data-ru="${i}" data-testid="qs-rating-url-${i}" placeholder="Link to your reviews" aria-label="Link"><button class="rm" data-rrm="${i}" title="Remove" data-testid="qs-rating-remove-${i}">${svg('close')}</button></div>`).join('')}
    ${R.length < 3 ? `<div class="newrow"><select id="ratingNew" data-testid="qs-rating-new" aria-label="Add a platform">${Object.entries(PLATFORMS).filter(([k]) => !R.some(x => x.platform === k)).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}</select><button class="btn btn-ghost" id="ratingAdd" data-testid="qs-rating-add">${svg('plus')} Add platform</button></div>` : ''}
    <div class="fr" style="justify-content:flex-end;margin:8px 0 0"><button class="btn btn-ghost" id="reviewsSave" data-testid="qs-reviews-save">${svg('check')} Save reviews</button></div>
"""
RATINGS_HANDLERS = r"""    else if (t.id === 'reviewsSave') { const R = readRatings(); if (R.some(x => x.rating !== null && (x.rating < 0 || x.rating > 5))) { say('Star ratings go from 0 to 5'); return; } QS.ratings = deep(R); say('Reviews saved — PUT /admin/profile/business'); renderBody(); }
    else if (t.id === 'ratingAdd') { const R = readRatings(); if (R.length >= 3) return; R.push({ platform: $('#ratingNew').value, rating: null, count: null, url: '' }); renderBody(); }
    else if (t.dataset.rrm) { const R = readRatings(); R.splice(+t.dataset.rrm, 1); renderBody(); }"""
OLD_HANDLER = r"""    else if (t.id === 'reviewsSave') { const r = { google_reviews_url: $('#reviews-url').value.trim(), google_review_rating: num($('#reviews-rating').value), google_review_count: num($('#reviews-count').value) }; if (r.google_review_rating !== null && (r.google_review_rating < 0 || r.google_review_rating > 5)) { setErr('reviews-rating', '0 to 5'); return; } W.reviews = r; QS.reviews = deep(r); say('Reviews saved — PUT /admin/profile/business'); renderBody(); }"""

# ============================================================ 1. Quote set-up gear
html = (ROOT / 'quote-setup-base.html').read_text()
def rep(a, b, count=1):
    global html
    assert html.count(a) == count, (html.count(a), a[:90])
    html = html.replace(a, b)

CSS = """  /* ---- Round 74: presentation block builder ---- */
  .cnt{ font-size:12.5px; color:var(--text-muted); margin:0 0 10px; } .cnt b{ color:var(--text-primary); }
  .blk{ border:1px solid var(--border); border-radius:12px; padding:12px 14px 14px; margin-bottom:10px; background:var(--surface); }
  .blk .bh{ display:flex; align-items:center; gap:8px; margin-bottom:10px; }
  .blk .bt{ font-size:11px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; color:var(--accent-ink); background:var(--accent-bg); border-radius:6px; padding:3px 7px; white-space:nowrap; }
  .blk .bhead{ flex:1; min-width:0; font:inherit; font-size:13.5px; font-weight:600; background:var(--surface-sunken); border:1px solid var(--border-strong); border-radius:8px; padding:6px 9px; color:var(--text-primary); }
  .blk .sp{ flex:1; }
  .blk .mv{ display:inline-flex; gap:2px; } .blk .mv button, .blk .rmb{ width:26px; height:26px; border-radius:6px; border:1px solid var(--border-strong); background:var(--surface); color:var(--text-secondary); cursor:pointer; display:inline-flex; align-items:center; justify-content:center; } .blk .mv button svg, .blk .rmb svg{ width:13px; height:13px; } .blk .mv button:disabled{ opacity:.35; cursor:default; } .blk .rmb:hover{ color:var(--danger); border-color:var(--danger); }
  .blk.brk{ border-style:dashed; background:var(--surface-sunken); padding:8px 14px; display:flex; align-items:center; gap:8px; } .blk.brk .bt{ background:#fff; } .blk.brk span.l{ flex:1; font-size:12.5px; color:var(--text-muted); }
  .hero{ position:relative; height:190px; border-radius:12px; border:2px dashed var(--border-strong); background:var(--surface-sunken); display:flex; align-items:center; justify-content:center; flex-direction:column; gap:6px; color:var(--text-muted); font-size:12.5px; cursor:pointer; text-align:center; padding:0 20px; }
  .hero b{ color:var(--text-primary); } .hero svg{ width:22px; height:22px; }
  .hero.has{ border-style:solid; border-color:var(--border); color:#fff; }
  .hero .cap{ position:absolute; left:10px; bottom:8px; font-family:var(--font-mono); font-size:11px; background:rgba(0,0,0,.35); padding:2px 6px; border-radius:6px; }
  .hero .acts{ position:absolute; right:10px; top:10px; display:flex; gap:6px; }
  .hero .acts .btn{ padding:4px 9px; font-size:12px; background:rgba(255,255,255,.92); color:var(--text-primary); border-color:transparent; }
  .hero.full{ cursor:default; }
  .big4{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
  .wide3{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; margin-top:10px; }
  .slot{ display:flex; flex-direction:column; gap:6px; min-width:0; }
  .slot .ph{ position:relative; border-radius:10px; overflow:hidden; border:1px solid var(--border); aspect-ratio:4/3; display:flex; align-items:center; justify-content:center; }
  .wide3 .slot .ph{ aspect-ratio:16/9; }
  .slot .ph.empty{ border:2px dashed var(--border-strong); background:var(--surface-sunken); color:var(--text-muted); font-size:12px; cursor:pointer; flex-direction:column; gap:3px; }
  .slot .ph.empty.full{ cursor:default; opacity:.6; }
  .slot .ph.empty svg{ width:16px; height:16px; }
  .slot .ph .rm{ position:absolute; top:6px; right:6px; width:22px; height:22px; border-radius:99px; border:none; background:rgba(0,0,0,.45); color:#fff; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; } .slot .ph .rm svg{ width:12px; height:12px; }
  .slot .ph .nm{ position:absolute; left:8px; bottom:6px; font-family:var(--font-mono); font-size:10px; color:#fff; background:rgba(0,0,0,.35); padding:2px 5px; border-radius:5px; max-width:calc(100% - 16px); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .slot input.cap, .blk input.hcap{ font:inherit; font-size:12.5px; background:var(--surface-sunken); border:1px solid var(--border-strong); border-radius:8px; padding:6px 9px; color:var(--text-primary); min-width:0; }
  .blk input.hcap{ width:100%; margin-top:8px; }
  .slot input.cap:disabled{ opacity:.5; }
  .g0{ background:linear-gradient(160deg,#D9CFC0,#A8977E); } .g1{ background:linear-gradient(160deg,#CFD9D0,#7E9A88); } .g2{ background:linear-gradient(160deg,#D8D3E6,#8A7BC8); } .g3{ background:linear-gradient(160deg,#E6D8CF,#C89A7B); } .g4{ background:linear-gradient(160deg,#CFD6E6,#7B93C8); } .g5{ background:linear-gradient(160deg,#E0E6CF,#9AB07B); } .g6{ background:linear-gradient(160deg,#E6CFD8,#C87B9A); } .g7{ background:linear-gradient(160deg,#D2D2D2,#8C8C8C); }
  .lay{ display:flex; gap:6px; } .lay button{ font-family:inherit; font-size:12.5px; padding:5px 10px; border-radius:8px; border:1px solid var(--border-strong); background:var(--surface); color:var(--text-secondary); cursor:pointer; } .lay button.on{ border-color:var(--accent); color:var(--accent-ink); background:var(--accent-bg); font-weight:600; }
  .jobpick{ margin-top:10px; border:1px solid var(--border); border-radius:10px; padding:10px; background:var(--surface-sunken); }
  .jobpick .t{ font-size:12px; color:var(--text-secondary); margin-bottom:8px; }
  .jobpick .row{ display:grid; grid-template-columns:repeat(6,1fr); gap:6px; }
  .jobpick .row button{ aspect-ratio:4/3; border-radius:8px; border:2px solid transparent; cursor:pointer; position:relative; padding:0; }
  .jobpick .row button:hover{ border-color:var(--accent); }
  .jobpick .row button span{ position:absolute; left:4px; right:4px; bottom:3px; font-family:var(--font-mono); font-size:9px; color:#fff; background:rgba(0,0,0,.4); padding:1px 4px; border-radius:4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; text-align:left; }
  .blk .bnote{ font-size:12.5px; color:var(--text-muted); line-height:1.45; }
  .blk .lnk{ display:inline-flex; align-items:center; gap:6px; } .blk .lnk svg{ width:14px; height:14px; }
  .addrow{ position:relative; margin:4px 0 14px; }
  .addmenu{ position:absolute; left:0; top:40px; z-index:5; background:var(--surface); border:1px solid var(--border-strong); border-radius:12px; box-shadow:0 12px 32px rgba(20,16,10,.16); padding:6px; display:grid; grid-template-columns:1fr 1fr; gap:4px; width:460px; max-width:calc(100% - 4px); }
  .addmenu button{ font-family:inherit; text-align:left; border:none; background:none; border-radius:8px; padding:8px 10px; cursor:pointer; color:var(--text-primary); font-size:13px; font-weight:600; } .addmenu button small{ display:block; font-weight:400; font-size:11.5px; color:var(--text-muted); margin-top:1px; } .addmenu button:hover{ background:var(--surface-sunken); } .addmenu button:disabled{ opacity:.45; cursor:default; }
  .rrow{ display:flex; gap:8px; align-items:center; margin-bottom:8px; }
  .rrow select, .newrow select{ flex:1.2; min-width:0; font:inherit; font-size:13px; padding:7px 9px; border:1px solid var(--border-strong); border-radius:8px; background:var(--surface); color:var(--text-primary); }
  .rrow input{ font:inherit; font-size:13px; padding:7px 9px; border:1px solid var(--border-strong); border-radius:8px; background:var(--surface); color:var(--text-primary); min-width:0; } .rrow input.v{ width:68px; flex:none; } .rrow input.u{ flex:2; }
  .rrow .rm{ border:none; background:none; color:var(--text-muted); cursor:pointer; width:26px; height:26px; border-radius:6px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; } .rrow .rm svg{ width:13px; height:13px; }
  .rmark, .sheet .rmk{ width:26px; height:26px; border-radius:7px; color:#fff; font-size:11px; font-weight:800; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; font-style:normal; }
  .sheet .rmk{ width:18px; height:18px; font-size:8px; border-radius:5px; } .sheet .srev{ flex-wrap:wrap; gap:8px 16px; } .sheet .srev .rp{ display:inline-flex; align-items:center; gap:5px; }
  .pe-head .btn{ padding:5px 10px; font-size:12px; } .pe-head .btn.on{ border-color:var(--accent); color:var(--accent-ink); background:var(--accent-bg); } .pe-head .btn svg{ width:14px; height:14px; }
  /* preview sheets */
  .sheet{ background:#fff; box-shadow:0 6px 24px rgba(20,16,10,.18); border-radius:4px; overflow:hidden; margin-bottom:16px; min-height:560px; display:flex; flex-direction:column; color:#2A2622; padding:14px 18px 0; }
  .sheet .sk{ font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:#8A8378; margin-bottom:6px; }
  .sheet .sh{ font-family:var(--font-display); font-weight:600; font-size:17px; margin:6px 0 8px; }
  .sheet .shero{ height:150px; border-radius:6px; position:relative; margin-bottom:10px; }
  .sheet .sgrid{ display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; } .sheet .sgrid div{ height:90px; border-radius:5px; position:relative; }
  .sheet .swide{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:10px; } .sheet .swide div{ height:64px; border-radius:5px; position:relative; }
  .sheet i.c{ position:absolute; left:6px; bottom:5px; font-style:normal; font-size:8.5px; color:#fff; background:rgba(0,0,0,.35); padding:1px 5px; border-radius:4px; }
  .sheet .stext{ font-size:10.5px; line-height:1.55; color:#3B3548; margin-bottom:10px; } .sheet .stext p{ margin:0 0 6px; }
  .sheet .smsg{ border-left:3px solid var(--accent); padding:6px 10px; background:#F7F5FD; border-radius:0 6px 6px 0; margin-bottom:10px; }
  .sheet .srev{ display:flex; align-items:center; gap:10px; font-size:10px; margin-bottom:10px; } .sheet .srev b{ font-size:16px; } .sheet .srev .st{ color:#E8B923; letter-spacing:1px; }
  .sheet .slinks{ display:flex; gap:8px; margin-bottom:10px; } .sheet .slinks span{ flex:1; border:1px solid #E5E1D8; border-radius:6px; padding:7px 9px; font-size:9.5px; font-weight:600; }
  .sheet .sfoot{ margin-top:auto; padding:10px 0; font-size:9px; color:#8A8378; display:flex; justify-content:space-between; }
"""
rep("  label.f textarea.tall{ min-height:150px; }\n", "  label.f textarea.tall{ min-height:150px; }\n" + CSS)

rep("tax_enabled_by_default:true, currency:'AUD',", "tax_enabled_by_default:true, presentation_default_on:true, currency:'AUD',")
rep("  reviews: { google_reviews_url:'https://g.page/r/sano-painting/review', google_review_rating:4.9, google_review_count:87 },",
    "  reviews: { google_reviews_url:'https://g.page/r/sano-painting/review', google_review_rating:4.9, google_review_count:87 },\n  ratings: [ { platform:'google', rating:4.9, count:87, url:'https://g.page/r/sano-painting/review' }, { platform:'hipages', rating:4.8, count:41, url:'https://hipages.com.au/connect/sanopainting' } ],")
rep("photos:['a','b','c','d'], youtube_urls:['https://youtu.be/abc123'], drive_photos_url:'https://drive.google.com/folders/res-photos', drive_videos_url:'' }",
    "photos:['a','b','c','d'], youtube_urls:['https://youtu.be/abc123'], drive_photos_url:'https://drive.google.com/folders/res-photos', drive_videos_url:'', blocks:[ { id:'b1', type:'hero', heading:'Our work', photo:'hero-manly.jpg', caption:'Full exterior · Manly' }, { id:'b2', type:'grid', heading:'', layout:'2x2', photos:['kitchen-after.jpg','facade-render.jpg','hallway-trim.jpg','deck-oil.jpg'], captions:['Kitchen · Manly','Render refresh · Dee Why','Hallway trims · Mosman','Deck re-oil · Balgowlah'] }, { id:'b3', type:'break' }, { id:'b4', type:'message', heading:'A note for you', text:'Thanks for having us out. Everything in this quote is written so you know exactly what we will do, and these pages show the kind of finish you can expect from us.' }, { id:'b5', type:'about', heading:'A bit about us', text:'We treat your home like our own — tidy, on time and finished to a standard we are proud to put our name on.' }, { id:'b6', type:'grid', heading:'', layout:'3wide', photos:['team-van.jpg','colour-consult.jpg','clean-site.jpg'], captions:['The team','Colour consult','Clean site, every day'] }, { id:'b7', type:'reviews' }, { id:'b8', type:'links' } ] }")

rep("Extra pages at the back of a quote: cover, intro, photos, videos and your reviews. Off by default — switch them on per quote in the builder (\"Presentation pages\"). A residential quote picks the residential template, a commercial quote the commercial one. Click a template to open it.",
    "One or two pages at the back of a quote, built from blocks you order as you like: a hero photo, photo grids, a message, your story, your reviews and links. New quotes follow the switch above; any quote can change it in its Quote details. A residential quote picks the residential template, a commercial quote the commercial one. Click a template to open it.")
rep("Cover, intro, photos, videos and reviews from the Presentation tab. Off by default; switch on per quote in the builder.",
    "One or two photo pages from the Presentation tab. New quotes follow the switch on that tab; each quote can change it in its Quote details.")
rep("""  <div class="qs-sec"><h3>Presentation templates <span class="n">${W.pres.length}</span>""",
    """  <div class="qs-sec">${tog('pres-default', W.defaults.presentation_default_on, 'Add presentation pages to every new quote', 'Each quote can still switch them off in its Quote details. Off: you switch them on per quote.')}</div>
  <div class="qs-sec"><h3>Presentation templates <span class="n">${W.pres.length}</span>""")

HELPERS = r"""const JOB_PHOTOS = [['kitchen-after.jpg','Kitchen · Manly'],['facade-render.jpg','Render · Dee Why'],['hallway-trim.jpg','Hallway · Mosman'],['deck-oil.jpg','Deck · Balgowlah'],['team-van.jpg','The team'],['colour-consult.jpg','Colour consult'],['clean-site.jpg','Clean site'],['bedroom-feature.jpg','Feature wall · Manly'],['exterior-weatherboard.jpg','Weatherboards · Freshwater'],['stairwell.jpg','Fire stair · Brookvale'],['shopfront.jpg','Shopfront · Brookvale'],['pergola.jpg','Pergola · Seaforth']];
const gcls = (name) => 'g' + ([...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % 8);
const BT = { hero:'Hero photo', grid:'Photo grid', message:'Message', about:'About us', reviews:'Reviews', links:'Links', break:'Page break' };
const BDESC = { hero:'One big photo, full width', grid:'Four photos 2 × 2, or three wide', message:'A short note to the client', about:'Your story, who you are', reviews:'Rating, count and link', links:'Drive folders and videos', break:'Page 2 starts here (one per template)' };
const uid = () => 'b' + Math.random().toString(36).slice(2, 7);
const PLATFORMS = { google:{ name:'Google', mark:'G', color:'#4285F4' }, hipages:{ name:'hipages', mark:'hi', color:'#2F6F5E' }, oneflare:{ name:'Oneflare', mark:'1f', color:'#1B75BC' }, serviceseeking:{ name:'ServiceSeeking', mark:'SS', color:'#E8572A' }, airtasker:{ name:'Airtasker', mark:'A', color:'#00B2D7' }, facebook:{ name:'Facebook', mark:'f', color:'#1877F2' }, productreview:{ name:'ProductReview.com.au', mark:'PR', color:'#D42D2D' }, womo:{ name:'Word of Mouth', mark:'W', color:'#E0A800' }, truelocal:{ name:'TrueLocal', mark:'TL', color:'#2E8B57' }, houzz:{ name:'Houzz', mark:'h', color:'#4DBC15' }, trustpilot:{ name:'Trustpilot', mark:'T', color:'#00B67A' } };
function ensureRatings(){ if (!W.ratings) { const r = W.reviews || {}; W.ratings = r.google_reviews_url ? [{ platform:'google', rating:r.google_review_rating, count:r.google_review_count, url:r.google_reviews_url }] : []; } return W.ratings; }
function readRatings(){ const R = ensureRatings(); R.forEach((x, i) => { const sel = $(`[data-rp="${i}"]`); if (!sel) return; x.platform = sel.value; x.rating = num($(`[data-rr="${i}"]`).value); x.count = num($(`[data-rc="${i}"]`).value); x.url = $(`[data-ru="${i}"]`).value.trim(); }); return R; }
const ratingWords = (x) => `${x.rating ?? '–'} ★ from ${x.count ?? 0} reviews on ${PLATFORMS[x.platform].name}`;
function ensureBlocks(p) { if (!p.blocks) { const ph = (p.photos || []).map(PH).map(u => u.split('/').pop()); p.blocks = [ { id:uid(), type:'hero', heading:'Our work', photo: p.cover_image_url ? p.cover_image_url.split('/').pop() : '', caption:'' }, { id:uid(), type:'grid', heading:'', layout:'2x2', photos: ph.slice(0, 4), captions:['', '', '', ''] }, { id:uid(), type:'break' }, { id:uid(), type:'about', heading:'A bit about us', text: p.intro || '' }, { id:uid(), type:'grid', heading:'', layout:'3wide', photos: ph.slice(4, 7), captions:['', '', ''] }, { id:uid(), type:'reviews' }, { id:uid(), type:'links' } ]; }
  for (const b of p.blocks) { if (b.type === 'grid') { const n = b.layout === '3wide' ? 3 : 4; b.photos = (b.photos || []).slice(0, n); b.captions = (b.captions || []).slice(0, n); while (b.photos.length < n) b.photos.push(''); while (b.captions.length < n) b.captions.push(''); } }
  return p.blocks; }
const photoCount = (blocks) => blocks.reduce((s, b) => s + (b.type === 'hero' ? (b.photo ? 1 : 0) : b.type === 'grid' ? b.photos.filter(Boolean).length : 0), 0);
const pageCount = (blocks) => 1 + blocks.filter(b => b.type === 'break').length;
const splitPages = (blocks) => { const pages = [[]]; for (const b of blocks) { if (b.type === 'break') pages.push([]); else pages[pages.length - 1].push(b); } return pages; };
"""
rep("const PH = (u) => u.startsWith('http') ? u : 'https://storage.example/photo-' + u + '.jpg';\n",
    "const PH = (u) => u.startsWith('http') ? u : 'https://storage.example/photo-' + u + '.jpg';\n" + HELPERS)

EDITOR = r"""function presEditor(p, isNew) { const blocks = ensureBlocks(p); const n = photoCount(blocks); const full = n >= 8; const pages = pageCount(blocks); const hasBreak = blocks.some(b => b.type === 'break');
  const mv = (b, i) => `<span class="mv"><button data-mv="${b.id}" data-dir="-1" data-testid="qs-blk-up-${b.id}" ${i === 0 ? 'disabled' : ''} title="Move up">${svg('up')}</button><button data-mv="${b.id}" data-dir="1" data-testid="qs-blk-down-${b.id}" ${i === blocks.length - 1 ? 'disabled' : ''} title="Move down">${svg('down')}</button></span><button class="rmb" data-rmblk="${b.id}" data-testid="qs-blk-rm-${b.id}" title="Remove this block">${svg('close')}</button>`;
  const slot = (b, u, i, cap) => `<div class="slot" data-testid="qs-slot-${b.id}-${i}">${u ? `<div class="ph ${gcls(u)}" data-slot="${b.id}" data-i="${i}" data-url="${esc(u)}"><span class="nm">${esc(u)}</span><button class="rm" data-slotrm="${b.id}" data-i="${i}" title="Remove" data-testid="qs-slot-rm-${b.id}-${i}">${svg('close')}</button></div>` : `<div class="ph empty ${full ? 'full' : ''}" data-slotadd="${b.id}" data-i="${i}" data-testid="qs-slot-add-${b.id}-${i}">${svg('plus')}${full ? '8 of 8 used' : 'Add photo'}</div>`}<input class="cap" value="${esc(cap || '')}" placeholder="Caption (optional)" data-cap="${b.id}" data-i="${i}" data-testid="qs-slot-cap-${b.id}-${i}" ${u ? '' : 'disabled'}></div>`;
  const jobpick = (b) => `<button class="lnk" data-jobpick="${b.id}" data-testid="qs-jobpick-${b.id}" style="margin-top:8px">${svg('folder')} Pick from a finished job</button><div class="jobpick" id="jobPick-${b.id}" hidden><div class="t">Photos from your finished jobs. Click one to put it in the next empty spot of this block.</div><div class="row">${JOB_PHOTOS.map(([f, l], i) => `<button class="${gcls(f)}" data-job="${esc(f)}" data-blk="${b.id}" data-testid="qs-job-${b.id}-${i}" title="${esc(l)}"><span>${esc(l)}</span></button>`).join('')}</div></div>`;
  const card = (b, i) => {
    if (b.type === 'break') return `<div class="blk brk" data-blk="${b.id}" data-type="break" data-testid="qs-blk-${b.id}"><span class="bt">${BT.break}</span><span class="l">Everything below prints on page 2.</span>${mv(b, i)}</div>`;
    const headed = b.type === 'hero' || b.type === 'grid' || b.type === 'message' || b.type === 'about';
    let body = '';
    if (b.type === 'hero') body = `<div class="hero ${b.photo ? 'has ' + gcls(b.photo) : (full ? 'full' : '')}" data-herozone="${b.id}" data-testid="qs-hero-${b.id}">${b.photo ? `<span class="cap">${esc(b.photo)}</span><span class="acts"><button class="btn btn-ghost" data-herorep="${b.id}" data-testid="qs-hero-replace-${b.id}">Replace</button><button class="btn btn-ghost" data-herorm="${b.id}" data-testid="qs-hero-remove-${b.id}">Remove</button></span>` : (full ? `<b>8 of 8 photos used</b><span>Remove a photo elsewhere to add one here</span>` : `${svg('image')}<b>Your best photo, full width</b><span>JPG or PNG up to 10 MB · drop it here or click</span>`)}</div><input class="hcap" value="${esc(b.caption || '')}" placeholder="Caption (optional)" data-hcap="${b.id}" data-testid="qs-hero-cap-${b.id}" ${b.photo ? '' : 'disabled'}>${jobpick(b)}`;
    else if (b.type === 'grid') body = `<div class="lay" data-testid="qs-layout-${b.id}">${[['2x2', 'Four photos · 2 × 2'], ['3wide', 'Three wide photos']].map(([k, l]) => `<button data-bl="${b.id}" data-v="${k}" class="${b.layout === k ? 'on' : ''}" data-testid="qs-layout-${b.id}-${k}">${l}</button>`).join('')}</div><div class="${b.layout === '3wide' ? 'wide3' : 'big4'}">${b.photos.map((u, i) => slot(b, u, i, b.captions[i])).join('')}</div>${jobpick(b)}`;
    else if (b.type === 'message' || b.type === 'about') body = `<label class="f"><textarea class="tall" data-bt="${b.id}" data-testid="qs-blk-text-${b.id}" placeholder="${b.type === 'message' ? 'A few lines to the client — what you noticed, what you will take care of.' : 'Who you are, how you work, what the client can expect.'}">${esc(b.text || '')}</textarea></label>`;
    else if (b.type === 'reviews') body = `<div class="bnote" data-testid="qs-blk-reviews-note">${ensureRatings().length ? 'Prints ' + ensureRatings().map(ratingWords).map(esc).join(' · ') + ', each with its link, from the Reviews &amp; ratings box on this tab.' : 'No platforms yet — add them in the Reviews &amp; ratings box on this tab.'} Remove the block to leave it off.</div>`;
    else if (b.type === 'links') body = `<div class="fr">${fld('pres-drive-photos', 'More photos (Drive folder)', p.drive_photos_url, { ph:'https://drive.google.com/…' })}${fld('pres-drive-videos', 'Videos (Drive folder)', p.drive_videos_url, { ph:'https://drive.google.com/…' })}</div><div class="vids" id="vids">${p.youtube_urls.map((u, i) => `<div class="vid"><span class="pl">${svg('play')}</span><input value="${esc(u)}" data-vd="${i}" data-testid="qs-pres-video-${i}" placeholder="https://youtu.be/…"><button class="rm" data-vdrm="${i}" title="Remove">${svg('close')}</button></div>`).join('')}</div><button class="lnk" id="vdAdd" data-testid="qs-pres-video-add" style="margin-top:6px">+ Add a YouTube link</button>`;
    return `<div class="blk" data-blk="${b.id}" data-type="${b.type}" data-testid="qs-blk-${b.id}"><div class="bh"><span class="bt">${BT[b.type]}</span>${headed ? `<input class="bhead" value="${esc(b.heading || '')}" placeholder="${b.type === 'message' ? 'Headline, e.g. A note for you' : b.type === 'about' ? 'Headline, e.g. A bit about us' : 'Heading above the photos (optional)'}" data-bh="${b.id}" data-testid="qs-blk-head-${b.id}">` : '<span class="sp"></span>'}${mv(b, i)}</div>${body}</div>`;
  };
  return `<div class="pe-head"><button class="back" id="presBack" data-testid="qs-pres-back">${svg('arrowl')} Templates</button><h3>${isNew ? 'New template' : esc(p.name)}</h3><button class="btn btn-ghost ${previewOn ? 'on' : ''}" id="presPreviewBtn" data-testid="qs-pres-preview">${svg('eye')} ${previewOn ? 'Hide preview' : 'Live preview'}</button></div>
    <input type="hidden" id="pres-keep" value="${esc(JSON.stringify(p))}">
    <div class="fr">${fld('pres-name', 'Template name', p.name, { w2:true, ph:'Standard residential' })}<label class="f">Type<div class="chips typechips" id="presType">${['residential','commercial'].map(t => `<button data-ptype="${t}" class="${p.type === t ? 'on' : ''}" data-testid="qs-pres-type-${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div></label></div>
    <p class="cnt">Blocks print in this order at the back of the quote. Move them up or down, remove what you do not want, add what you do. <b data-testid="qs-pres-photo-count">${n} of 8</b> photos · <b data-testid="qs-pres-page-count">${pages} page${pages === 1 ? '' : 's'}</b> · up to 2 pages.</p>
    <div id="blocks" data-testid="qs-blocks">${blocks.map(card).join('')}</div>
    <div class="addrow"><button class="btn btn-ghost" id="addBlk" data-testid="qs-blk-add">${svg('plus')} Add a block</button><div class="addmenu" id="addMenu" hidden data-testid="qs-blk-menu">${['hero', 'grid', 'message', 'about', 'reviews', 'links', 'break'].map(t => `<button data-addtype="${t}" data-testid="qs-blk-add-${t}" ${(t === 'break' && hasBreak) || ((t === 'reviews' || t === 'links') && blocks.some(b => b.type === t)) ? 'disabled' : ''}>${BT[t]}<small>${BDESC[t]}${t === 'break' && hasBreak ? ' — already in' : ''}</small></button>`).join('')}</div></div>
    ${isNew ? '' : `<div class="qs-sec"><button class="lnk pe-del" data-pdel="${p.id}" data-testid="qs-pres-delete-${p.id}">${svg('trash')} Delete this template</button></div>`}`; }
"""
start = html.index('function presEditor(p, isNew) {'); end = html.index('function tabPres() {')
assert html.count('function presEditor(p, isNew) {') == 1 and html.count('function tabPres() {') == 1
html = html[:start] + EDITOR + html[end:]

start = html.index('function readPresForm() {'); end = html.index('\n', start) + 1
assert html.count('function readPresForm() {') == 1
html = html[:start] + r"""function readPresForm() { const keep = JSON.parse($('#pres-keep').value); ensureBlocks(keep);
  const p = { ...keep, id: presEdit, name: $('#pres-name').value.trim(), type: $('#presType .on')?.dataset.ptype || 'residential', drive_photos_url: $('#pres-drive-photos') ? $('#pres-drive-photos').value.trim() : keep.drive_photos_url, drive_videos_url: $('#pres-drive-videos') ? $('#pres-drive-videos').value.trim() : keep.drive_videos_url, youtube_urls: $('#vids') ? $$('[data-vd]').map(i => i.value.trim()) : keep.youtube_urls };
  p.blocks = $$('#blocks .blk').map(el => { const b = { ...keep.blocks.find(x => x.id === el.dataset.blk) }; const h = el.querySelector('[data-bh]'); if (h) b.heading = h.value.trim(); const t = el.querySelector('[data-bt]'); if (t) b.text = t.value; if (b.type === 'hero') { const c = el.querySelector('[data-hcap]'); b.caption = c ? c.value.trim() : ''; } if (b.type === 'grid') { const n = b.layout === '3wide' ? 3 : 4; b.photos = [...Array(n).keys()].map(i => el.querySelector(`[data-slot][data-i="${i}"]`)?.dataset.url || ''); b.captions = [...Array(n).keys()].map(i => el.querySelector(`[data-cap][data-i="${i}"]`)?.value.trim() || ''); } return b; });
  const hero = p.blocks.find(b => b.type === 'hero'); p.cover_image_url = hero && hero.photo ? 'https://storage.example/' + hero.photo : ''; const about = p.blocks.find(b => b.type === 'about'); p.intro = about ? (about.text || '') : '';
  p.photos = p.blocks.flatMap(b => b.type === 'hero' ? [b.photo] : b.type === 'grid' ? b.photos : []).filter(Boolean).map(f => 'https://storage.example/' + f); return p; }
""" + html[end:]

rep("function renderPreview() { if (!previewOn || qsTab !== 'pdf') return;", "function renderPdfPreview() { if (!previewOn || qsTab !== 'pdf') return; $('#qsPreview .ph span').innerHTML = PDF_PREVIEW_HEAD;")
rep("function setPreview(on) {", r"""const PDF_PREVIEW_HEAD = 'Live preview <small>· the PDF your client gets — in the build this pane shows the real PDF from the renderer; this drawing only shows where it sits</small>';
function renderPreview() { if (qsTab === 'presentation' && (presEdit || presNew)) return renderPresPreview(); return renderPdfPreview(); }
function renderPresPreview() { if (!previewOn || !$('#pres-keep')) return; const p = readPresForm(); const pages = splitPages(p.blocks); const R = ensureRatings(); const biz = 'Sano Painting & Decorating';
  const cell = (u, cap) => `<div class="${u ? gcls(u) : 'g7'}" style="${u ? '' : 'opacity:.35'}">${u && cap ? `<i class="c">${esc(cap)}</i>` : ''}</div>`;
  const blk = (b) => { const h = b.heading ? `<div class="sh">${esc(b.heading)}</div>` : '';
    if (b.type === 'hero') return `${h}<div class="shero ${b.photo ? gcls(b.photo) : 'g7'}" style="${b.photo ? '' : 'opacity:.35'}">${b.photo && b.caption ? `<i class="c">${esc(b.caption)}</i>` : ''}</div>`;
    if (b.type === 'grid') return `${h}<div class="${b.layout === '3wide' ? 'swide' : 'sgrid'}">${b.photos.map((u, i) => cell(u, b.captions[i])).join('')}</div>`;
    if (b.type === 'message') return `<div class="smsg">${h}<div class="stext">${esc(b.text || 'Your note to the client.').split('\n').filter(Boolean).map(x => `<p>${x}</p>`).join('')}</div></div>`;
    if (b.type === 'about') return `${h}<div class="stext">${esc(b.text || 'Your story goes here.').split('\n').filter(Boolean).map(x => `<p>${x}</p>`).join('')}</div>`;
    if (b.type === 'reviews') return R.length ? `<div class="srev" data-testid="qs-prev-reviews">${R.map(x => `<span class="rp"><i class="rmk" style="background:${PLATFORMS[x.platform].color}">${PLATFORMS[x.platform].mark}</i><b>${x.rating ?? '–'}</b><span class="st">${'★★★★★'.slice(0, Math.round(x.rating || 0))}</span><span>${x.count ?? 0} on ${esc(PLATFORMS[x.platform].name)}</span></span>`).join('')}</div>` : '';
    if (b.type === 'links') return (p.drive_photos_url || p.drive_videos_url || p.youtube_urls.some(Boolean)) ? `<div class="slinks" data-testid="qs-prev-links">${p.drive_photos_url ? '<span>📸 Full photo gallery</span>' : ''}${(p.drive_videos_url || p.youtube_urls.some(Boolean)) ? '<span>▶ Walkthrough videos</span>' : ''}</div>` : '';
    return ''; };
  $('#qsPreviewBody').innerHTML = pages.map((bs, i) => `<div class="sheet" data-testid="qs-prev-page${i + 1}"><div class="sk">${esc(biz)} · presentation</div>${bs.map(blk).join('')}<div class="sfoot"><span>${esc(biz)}</span><span>Page ${i + 1} of ${pages.length}</span></div></div>`).join('');
  $('#qsPreview .ph span').innerHTML = 'Live preview <small>· the pages as the client sees them at the back of the quote; the photos are placeholders here</small>'; }
function setPreview(on) {""")
rep("if (qsTab !== 'pdf') setPreview(false); else if (previewOn) renderPreview(); }",
    "if (qsTab !== 'pdf' && !(qsTab === 'presentation' && (presEdit || presNew))) setPreview(false); else if (previewOn) renderPreview(); }")
rep("if (qsTab === 'pdf' && previewOn) renderPreview();", "if (previewOn) renderPreview();")

CLICKS = r"""$('#qsBody').addEventListener('click', e => {
  const t = e.target; const stop = () => { e.stopPropagation(); e.preventDefault(); };
  if (qsTab === 'presentation' && !(presEdit || presNew) && t.closest('#pres-default')) { stop(); const b = t.closest('.tog'); b.classList.toggle('on'); const on = b.classList.contains('on'); b.setAttribute('aria-checked', on); W.defaults.presentation_default_on = on; QS.defaults.presentation_default_on = on; say(on ? 'New quotes get presentation pages — PUT /admin/profile/estimate-defaults' : 'New quotes start without presentation pages — PUT /admin/profile/estimate-defaults'); return; }
  if (!(qsTab === 'presentation' && (presEdit || presNew))) return;
  const done = (p, keepPick) => { rerenderPresForm(p); if (keepPick) { const jp = $('#jobPick-' + keepPick); if (jp) jp.hidden = false; } mark(); renderPreview(); };
  const B = (p, id) => p.blocks.find(b => b.id === id);
  let x;
  if ((x = t.closest('[data-herozone]')) && !t.closest('button')) { const p = readPresForm(); const b = B(p, x.dataset.herozone); if (b.photo || photoCount(p.blocks) >= 8) return; stop(); b.photo = 'hero-' + (Date.now() % 1000) + '.jpg'; say('Upload — POST /admin/presentation-templates/{id}/photos'); done(p); return; }
  if ((x = t.closest('[data-herorep]'))) { stop(); const p = readPresForm(); B(p, x.dataset.herorep).photo = 'hero-' + (Date.now() % 1000) + '.jpg'; say('Upload — the new photo replaces this one'); done(p); return; }
  if ((x = t.closest('[data-herorm]'))) { stop(); const p = readPresForm(); const b = B(p, x.dataset.herorm); b.photo = ''; b.caption = ''; done(p); return; }
  if ((x = t.closest('[data-slotadd]'))) { stop(); const p = readPresForm(); if (photoCount(p.blocks) >= 8) { say('All 8 photos are used — remove one first'); return; } B(p, x.dataset.slotadd).photos[+x.dataset.i] = 'upload-' + (Date.now() % 1000) + '.jpg'; say('Upload — POST /admin/presentation-templates/{id}/photos'); done(p); return; }
  if ((x = t.closest('[data-slotrm]'))) { stop(); const p = readPresForm(); const b = B(p, x.dataset.slotrm); b.photos[+x.dataset.i] = ''; b.captions[+x.dataset.i] = ''; done(p); return; }
  if ((x = t.closest('[data-bl]'))) { stop(); const p = readPresForm(); const b = B(p, x.dataset.bl); b.layout = x.dataset.v; done(p); return; }
  if ((x = t.closest('[data-jobpick]'))) { stop(); const jp = $('#jobPick-' + x.dataset.jobpick); jp.hidden = !jp.hidden; return; }
  if ((x = t.closest('[data-job]'))) { stop(); const p = readPresForm(); if (photoCount(p.blocks) >= 8) { say('All 8 photos are used — remove one first'); return; } const b = B(p, x.dataset.blk); if (b.type === 'hero') { if (b.photo) { say('This block already has its photo — use Replace'); return; } b.photo = x.dataset.job; } else { const i = b.photos.findIndex(u => !u); if (i < 0) { say('This block is full — remove a photo first'); return; } b.photos[i] = x.dataset.job; } say(`${x.title} added — GET /projects/{id}/photos`); done(p, b.id); return; }
  if ((x = t.closest('[data-mv]'))) { stop(); const p = readPresForm(); const i = p.blocks.findIndex(b => b.id === x.dataset.mv); const j = i + (+x.dataset.dir); if (j < 0 || j >= p.blocks.length) return; [p.blocks[i], p.blocks[j]] = [p.blocks[j], p.blocks[i]]; done(p); return; }
  if ((x = t.closest('[data-rmblk]'))) { stop(); const p = readPresForm(); const b = B(p, x.dataset.rmblk); if (p.blocks.length <= 1) { say('A template needs at least one block'); return; } p.blocks = p.blocks.filter(y => y.id !== b.id); say(`${BT[b.type]} removed`); done(p); return; }
  if (t.closest('#addBlk')) { stop(); const m = $('#addMenu'); m.hidden = !m.hidden; return; }
  if ((x = t.closest('[data-addtype]'))) { stop(); const p = readPresForm(); const ty = x.dataset.addtype; const nb = { id: uid(), type: ty }; if (ty === 'hero') { nb.heading = ''; nb.photo = ''; nb.caption = ''; } if (ty === 'grid') { nb.heading = ''; nb.layout = '2x2'; nb.photos = ['', '', '', '']; nb.captions = ['', '', '', '']; } if (ty === 'message') { nb.heading = 'A note for you'; nb.text = ''; } if (ty === 'about') { nb.heading = 'A bit about us'; nb.text = p.intro || ''; } p.blocks.push(nb); say(`${BT[ty]} added at the end — move it up where you want it`); done(p); setTimeout(() => $(`[data-blk="${nb.id}"]`)?.scrollIntoView({ block:'center', behavior:'smooth' }), 50); return; }
  if (t.closest('#presPreviewBtn')) { stop(); setPreview(!previewOn); const b = $('#presPreviewBtn'); if (b) { b.classList.toggle('on', previewOn); b.innerHTML = svg('eye') + (previewOn ? ' Hide preview' : ' Live preview'); } return; }
}, true);
"""
rep("$('#qsBody').addEventListener('click', e => {\n    if (e.target.closest('#phAdd'))", CLICKS + "$('#qsBody').addEventListener('click', e => {\n    if (e.target.closest('#phAdd'))")
rep("  const r = W.reviews; const stars = Math.round(r.google_review_rating || 0); return `", "  const R = ensureRatings(); return `")
start = html.index('  <div class="qs-sec"><h3>Google reviews</h3>'); endm = 'Save reviews</button></div>\n'; end = html.index(endm, start) + len(endm)
html = html[:start] + RATINGS_SECTION + html[end:]
rep(OLD_HANDLER, RATINGS_HANDLERS)
rep("$('#qsBody').addEventListener('click', e => {\n    if (e.target.closest('#phAdd'))", "$('#qsBody').addEventListener('change', e => { if (e.target.dataset.rp !== undefined) { readRatings(); renderBody(); } });\n$('#qsBody').addEventListener('click', e => {\n    if (e.target.closest('#phAdd'))")
(ROOT / 'quote-setup-presentation.html').write_text(html)
print('wrote quote-setup-presentation.html', len(html))

# ============================================================ 2. Estimate builder
html = (ROOT / 'estimate-builder-gst.html').read_text()

CSS2 = """  /* ---- Round 74: presentation blocks on the client view / public page ---- */
  .cdoc .ppage{ margin-top:28px; padding-top:22px; border-top:1px dashed #E4DED2; }
  .cdoc .ppage .ptitle{ font-family:var(--font-display); font-weight:600; font-size:24px; margin:6px 0 14px; letter-spacing:-0.01em; }
  .cdoc .ppage .pblk{ margin-bottom:22px; }
  .cdoc .phero{ height:320px; border-radius:12px; position:relative; }
  .cdoc .pgrid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .cdoc .pgrid div{ height:200px; border-radius:10px; position:relative; }
  .cdoc .pwide{ display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }
  .cdoc .pwide div{ height:140px; border-radius:10px; position:relative; }
  .cdoc .ppage i.cap{ position:absolute; left:10px; bottom:8px; font-style:normal; font-size:11px; color:#fff; background:rgba(0,0,0,.38); padding:2px 7px; border-radius:6px; }
  .cdoc .pstory{ font-size:14px; line-height:1.6; color:#3B3548; max-width:640px; margin:0; white-space:pre-line; }
  .cdoc .pmsg{ border-left:3px solid var(--accent); background:#F7F5FD; border-radius:0 10px 10px 0; padding:14px 18px; }
  .cdoc .pmsg .ptitle{ font-size:20px; margin:0 0 8px; }
  .cdoc .prating{ display:flex; gap:10px; flex-wrap:wrap; }
  .cdoc .rcard{ flex:1; min-width:200px; display:flex; gap:10px; align-items:center; border:1px solid #E4DED2; border-radius:10px; padding:10px 12px; text-decoration:none; color:inherit; }
  .cdoc .rcard .rmk{ width:30px; height:30px; border-radius:8px; color:#fff; font-weight:800; font-size:12px; display:inline-flex; align-items:center; justify-content:center; font-style:normal; flex-shrink:0; }
  .cdoc .rcard .rating{ font-size:16px; font-weight:800; } .cdoc .rcard .stars{ color:#E8B923; letter-spacing:1px; font-size:12px; margin-left:4px; } .cdoc .rcard .n{ color:#6B6479; font-size:12px; }
  .cdoc .plinks{ display:flex; gap:10px; } .cdoc .plinks a{ flex:1; border:1px solid #E4DED2; border-radius:10px; padding:10px 12px; font-size:12.5px; font-weight:600; color:#1F1B2E; text-decoration:none; }
  .cdoc .g0{ background:linear-gradient(160deg,#D9CFC0,#A8977E); } .cdoc .g1{ background:linear-gradient(160deg,#CFD9D0,#7E9A88); } .cdoc .g2{ background:linear-gradient(160deg,#D8D3E6,#8A7BC8); } .cdoc .g3{ background:linear-gradient(160deg,#E6D8CF,#C89A7B); } .cdoc .g4{ background:linear-gradient(160deg,#CFD6E6,#7B93C8); } .cdoc .g5{ background:linear-gradient(160deg,#E0E6CF,#9AB07B); } .cdoc .g6{ background:linear-gradient(160deg,#E6CFD8,#C87B9A); } .cdoc .g7{ background:linear-gradient(160deg,#D2D2D2,#8C8C8C); }
"""
rep("  .cdoc .pres{ margin-top:22px; padding-top:18px; border-top:1px dashed #E4DED2; }\n", "  .cdoc .pres{ margin-top:22px; padding-top:18px; border-top:1px dashed #E4DED2; }\n" + CSS2)

PAGES = r"""const PRES_BLOCKS = { 'Residential showcase': [ { type:'hero', heading:'Our work', photo:'hero-manly.jpg', caption:'Full exterior · Manly' }, { type:'grid', layout:'2x2', photos:['kitchen-after.jpg','facade-render.jpg','hallway-trim.jpg','deck-oil.jpg'], captions:['Kitchen · Manly','Render refresh · Dee Why','Hallway trims · Mosman','Deck re-oil · Balgowlah'] }, { type:'break' }, { type:'message', heading:'A note for you', text:'Thanks for having us out. Everything in this quote is written so you know exactly what we will do, and these pages show the kind of finish you can expect from us.' }, { type:'about', heading:'A bit about us', text:'We treat your home like our own — tidy, on time and finished to a standard we are proud to put our name on. Two painters on every job, dust sheets everywhere, and a walk-through with you before we call it done.' }, { type:'grid', layout:'3wide', photos:['team-van.jpg','colour-consult.jpg','clean-site.jpg'], captions:['The team','Colour consult','Clean site, every day'] }, { type:'reviews' }, { type:'links', drive_photos_url:'https://drive.google.com/folders/res-photos', videos:true } ],
  'Commercial & strata': [ { type:'hero', heading:'Recent commercial work', photo:'strata-facade.jpg', caption:'Strata facade · Manly' }, { type:'grid', layout:'2x2', photos:['shopfront.jpg','carpark-lines.jpg','stairwell.jpg','office-fitout.jpg'], captions:['Shopfront · Brookvale','Car park lines','Fire stair · Brookvale','Office fit-out · Chatswood'] } ] };
const RATINGS = [ { platform:'google', name:'Google', mark:'G', color:'#4285F4', rating:4.9, count:87, url:'https://g.page/sano-painting/reviews' }, { platform:'hipages', name:'hipages', mark:'hi', color:'#2F6F5E', rating:4.8, count:41, url:'https://hipages.com.au/connect/sanopainting' } ];
const gcls = (name) => 'g' + ([...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % 8);
function renderPresPages(est, biz){ const blocks = PRES_BLOCKS[est.presentation_template] || PRES_BLOCKS['Residential showcase']; const pages = [[]]; for (const b of blocks) { if (b.type === 'break') pages.push([]); else pages[pages.length - 1].push(b); } const stars = '★★★★★'.slice(0, Math.round(biz.reviews.rating));
  const cell = (u, cap) => `<div class="${gcls(u)}">${cap ? `<i class="cap">${esc(cap)}</i>` : ''}</div>`;
  const blk = (b) => { const h = b.heading ? `<div class="ptitle">${esc(b.heading)}</div>` : '';
    if (b.type === 'hero') return `<div class="pblk" data-testid="cdoc-blk-hero">${h}<div class="phero ${gcls(b.photo)}" data-testid="cdoc-pres-hero">${b.caption ? `<i class="cap">${esc(b.caption)}</i>` : ''}</div></div>`;
    if (b.type === 'grid') return `<div class="pblk" data-testid="cdoc-blk-grid">${h}<div class="${b.layout === '3wide' ? 'pwide' : 'pgrid'}" data-testid="cdoc-pres-${b.layout === '3wide' ? 'wide' : 'grid'}">${b.photos.map((u, i) => cell(u, b.captions[i])).join('')}</div></div>`;
    if (b.type === 'message') return `<div class="pblk pmsg" data-testid="cdoc-blk-message">${h}<p class="pstory">${esc(b.text)}</p></div>`;
    if (b.type === 'about') return `<div class="pblk" data-testid="cdoc-blk-about">${h}<p class="pstory">${esc(b.text)}</p></div>`;
    if (b.type === 'reviews') return `<div class="pblk prating" data-testid="cdoc-pres-reviews">${RATINGS.map(x => `<a class="rcard" href="${esc(x.url)}" data-testid="cdoc-rating-${x.platform}"><i class="rmk" style="background:${x.color}">${x.mark}</i><div><div class="rating">${x.rating.toFixed(1)}<span class="stars">${'★★★★★'.slice(0, Math.round(x.rating))}</span></div><div class="n">${x.count} reviews on ${esc(x.name)}</div></div></a>`).join('')}</div>`;
    if (b.type === 'links') return `<div class="pblk plinks" data-testid="cdoc-pres-links">${b.drive_photos_url ? `<a href="${esc(b.drive_photos_url)}">📸 Full photo gallery</a>` : ''}${b.videos ? '<a href="#">▶ Walkthrough videos</a>' : ''}</div>`;
    return ''; };
  return pages.map((bs, i) => `<div class="ppage" data-testid="cdoc-pres-page${i + 1}"><div class="tag">Presentation · page ${i + 1}${pages.length > 1 ? ` of ${pages.length}` : ''}</div>${bs.map(blk).join('')}</div>`).join(''); }
"""
rep("\nconst LIB_PHOTO = {", "\n" + PAGES + "\nconst LIB_PHOTO = {")
start = html.index("  if (est.presentation_enabled) h += `<div class=\"pres\">"); end = html.index('\n', start) + 1
assert html.count("  if (est.presentation_enabled) h += `<div class=\"pres\">") == 1
html = html[:start] + "  if (est.presentation_enabled) h += renderPresPages(est, biz);\n" + html[end:]
rep("$('#cdoc .pres')?.scrollIntoView", "$('#cdoc .ppage')?.scrollIntoView")
rep("Pages after the quote that sell the job — recent work, reviews and your story. Set up under the Estimates gear › Presentation.",
    "One or two pages at the back of the quote, built from blocks you order as you like: large photos of your work, a note to the client, your story, your reviews. Set up under the Estimates gear › Presentation; new quotes follow the switch there.")
rep("d:'Recent homes, five reviews and your story — for houses and units.'", "d:'Two pages: a hero, four photos, a note, your story, three photos, reviews.'")
rep("d:'Body-corporate and shopfront work, compliance line, trade references.'", "d:'One page: a hero and four photos of body-corporate and shopfront work.'")
rep("if (params.get('gst') === 'incl'){ est.tax.inclusive = true; changed(); }",
    "if (params.get('gst') === 'incl'){ est.tax.inclusive = true; changed(); }\nif (params.get('pres') === 'on'){ est.presentation_enabled = true; changed(); }")
(ROOT / 'estimate-builder-presentation.html').write_text(html)
print('wrote estimate-builder-presentation.html', len(html))
