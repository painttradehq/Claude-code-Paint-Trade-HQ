# Round 74 — Presentation pages, second design: a block builder (part 2 proposal, not sent)

Prototypes (both changed): **`quote-setup-presentation.html?setup=presentation`** (click **Standard residential** → the block editor → **Live preview**) and **`estimate-builder-presentation.html?pres=on`** (Review & Send → the pages at the back of the quote; Quote details › Presentation pages). Open at **1440** first, then **1024**. Playwright: `tools/test_presentation.js`, **74/74** at both widths. Screenshots: `pres-editor-1440.png`, `pres-editor-edited-1440.png`, `pres-client-1440.png`, `pres-editor-1024.png`.

Josh, 18 October, on the first design: "you have just adjusted a little bit bigger photo sizes; redesign it better and smarter; the admin should be able to move the sections up and down — some users want the photos down and some up; add a message box; we are giving a bit more freedom to design the presentation pages they want."

**Part 1 is built** (Emergent, 17 October: `pages {one, two}` on templates, the job-photo route, Quote details cards, the client view and public page, the PDF, suite 833). This part 2 replaces the page model with blocks and builds the editor; the already-built renderers are rewritten to walk blocks.

## 1. The idea

A presentation is a **list of blocks the admin orders freely**, printed in that order at the back of the quote, split into pages at a **Page break** block. Seven block types:

| Block | What it holds |
|---|---|
| **Hero photo** | One full-width photo, optional heading above, optional caption on the photo. |
| **Photo grid** | Four photos 2 × 2 or three wide photos (a layout toggle), optional heading, a caption per photo. |
| **Message** | A headline and a short note to the client ("A note for you"). Prints as a tinted note. |
| **About us** | A headline and the story (the existing intro text). |
| **Google reviews** | The rating, count and link from the Reviews box. One per template. |
| **Links** | The Drive folders and YouTube links. One per template. |
| **Page break** | Everything below prints on page 2. One per template, so a presentation is one or two pages. |

Limits: 8 photos across all photo blocks; 2 pages; 12 blocks. Every block has move up / move down and remove; **+ Add a block** opens a menu of the seven types (reviews, links and page break greyed when already in); a new block lands at the end and is moved where it is wanted. Photos come from an upload or from **Pick from a finished job** on each photo block (the strip fills that block's next empty spot). **Live preview** draws the pages from the unsaved form and follows every keystroke.

Default template for a new business (residential): Hero "Our work" → Photo grid 2 × 2 → Page break → Message "A note for you" → About us "A bit about us" → Photo grid three wide → Google reviews → Links. The commercial default: Hero → Photo grid 2 × 2 (one page).

## 2. What changes in the app (over part 1)

| Where | Change |
|---|---|
| **Template data** (`routes/estimate_presentation.py`, the part-1 `services/presentation_pages.py`) | `blocks: [ { id, type, heading?, photo?, caption?, layout?, photos?, captions?, text? } ]` replaces `pages`. Validation: ≤ 12 blocks; ≤ 1 `break`; ≤ 1 `reviews`; ≤ 1 `links`; grid `layout` in `2x2 \| 3wide` with `photos` sized 4 or 3; 8 photos across hero and grid blocks (9 → 400); `text` ≤ 2 000 characters; `heading` ≤ 80. **Derivation**, read-time and written back on the next save: a template with part-1 `pages` → Hero (title, hero, caption "") → Grid 2 × 2 (page 1 photos and captions) → Page break if `two.on` → About us (`two.headline`, intro) → Grid three wide (page 2 photos) → Reviews if `show_reviews` → Links if `show_links`; a template with neither → the Round 25 fields the same way (`ensureBlocks` in the prototype). `cover_image_url`, `intro` and `photos` keep mirroring (hero photo, the About us text, all photos in block order) so nothing else that reads them changes. |
| **Quote set-up › Presentation** (`QsPresentationTab`) | The editor exactly as the prototype: name and type; the counters line ("n of 8 photos · 1 or 2 pages · up to 2 pages"); the block cards (type pill, heading field where the type has one, move up / down, remove); hero zone with Replace / Remove and caption; grid layout toggle, slots with Add photo / remove and captions, the per-block job-photo strip; message and about textareas; reviews note; links fields; the page-break divider "Everything below prints on page 2"; **+ Add a block** menu; Delete template; Save / Cancel as today. **Live preview** renders the pages from the unsaved form in the existing preview pane. The tab text and the default switch at the top as part 1 built them. |
| **Client view and public page** (part 1's renderers) | Walk the blocks: split at `break` into `.ppage` sections ("Presentation · page 1 of 2"); hero (heading, 320 px photo, caption), grid (heading, 2 × 2 of 200 px or three wide of 140 px, captions), message (headline and text in a tinted note with the accent bar), about (headline and story), reviews box, link buttons. Phone: one column, hero 220 px. |
| **PDF** (`services/pdf.py`) | The same walk with a page break at the `break` block; message as the tinted note; everything else as part 1. |
| **Quote details** | Section text: "One or two pages at the back of the quote, built from blocks you order as you like: large photos of your work, a note to the client, your story, your reviews. Set up under the Estimates gear › Presentation; new quotes follow the switch there." Template cards describe themselves from their blocks ("Two pages: a hero, four photos, a note, your story, three photos, reviews."). |
| **Nothing else** | The rail switch, the per-quote enable, the type-based template pick (part 1), the job-photo route, the reviews box and the Drive/YouTube fields keep their behaviour. `app/employee/*` untouched. |

## 3. Verify (testing agent, 1440 then 1024, TS_ tenant; phone 390 for the public page)

1. Open the residential template: eight blocks in order; counters "8 of 8 photos · 2 pages"; the Message block with its headline and text.
2. Live preview shows page 1 and page 2; move the Message above the page break → it prints on page 1 in the preview; move it to the top → photos sit below the words; the first block's move-up is disabled.
3. Remove a grid photo → "7 of 8" and an Add photo slot; Pick from a finished job on that block → the TS_ tenant's photos only; the pick fills that block's empty slot; type a caption → the preview shows it; switch the grid to three wide → three slots, the fourth photo dropped; back to 2 × 2 → four slots.
4. Remove the page break → "1 page" and one sheet in the preview; + Add a block shows seven types with reviews and links greyed; add a page break → two pages; a second page break is greyed; add a Message → it lands at the end with its headline, its text prints on page 2.
5. Hero Remove → the zone explains itself and the count drops; click → upload; a ninth photo is refused with the toast; Save → reopen shows the same order and content.
6. A part-1 template (`pages`) opens as derived blocks and prints the same photos; a Round 25 template the same.
7. Client view, public link (laptop and 390 px phone) and PDF of a TS_ quote with the pages on: the blocks in order, the page break honoured, the message as a tinted note; the commercial template is one page; the pages off → none.
8. 1024: no horizontal scroll; no console errors; `tsc` clean; `app/employee/*` untouched.

## 4. Tests

`backend/tests/test_r74_presentation.py` (extend the part-1 file): create/patch with `blocks`; the limits (13 blocks, 2 breaks, 2 reviews, 9 photos, a 3wide grid with 4 photos → 400); derivation from `pages` and from the Round 25 fields, written back on save; the public document carries `presentation.blocks` only when enabled; the PDF text contains the block headings and the message. Suite green before and after.

## 5. What's new (Draft only, replaces part 1's n 19 text)

**Title:** Show your work, your way
**Body:** A quote can now end with one or two pages you build from blocks: a hero photo, photo grids, a note to the client, your story, your reviews and links, in whatever order you like. Set it up once under the Estimates gear › Presentation, with a live preview as you go. The client sees the pages on the quote and in the PDF.

## 6. Questions for Josh (one line each)

1. Two pages at most, eight photos at most (the prototype) — enough, or allow three pages and twelve photos?
2. The Message block is per template, so the same note goes to every client of that type. Fine for now, or should the quote builder let you edit the message for one client before sending?
