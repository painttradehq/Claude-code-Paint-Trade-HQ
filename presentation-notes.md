# Round 74 — Presentation pages: one or two pages of large photos (proposal for Josh's review, not sent)

Prototypes: **`quote-setup-presentation.html?setup=presentation`** (Quote set-up › Presentation: the switch for new quotes, the template list, click **Standard residential** → the two-page editor → **Live preview** on the left) and **`estimate-builder-presentation.html?pres=on`** (Review & Send → the client view ends with the pages; Quote details › Presentation pages). Open at **1440** first, then **1024**. Playwright: `tools/test_presentation.js`, **62/62** at both widths. Screenshots: `pres-editor-1440.png`, `pres-editor-edited-1440.png`, `pres-client-1440.png`, `pres-editor-1024.png`.

Owner's words (14 October, item 11): "right now it's a small section with few photos and links; what I like is to fill one or two pages with large photo areas, if the user wants." Item 12: the pages must show on the client's page, not only in the PDF.

## 1. What a presentation is now

A template has **two pages**, mostly photos, up to **8 photos** in all:

- **Page 1 — Our work.** A page title (default "Our work"), a **hero photo** (full width, the biggest picture) and **four large photos** in a 2 × 2 grid, each with an optional caption ("Kitchen · Manly").
- **Page 2 — About us** (switchable off; then the quote ends with page 1). A headline (default "A bit about us"), the story (the existing intro text), **three wide photos** with captions, and two switches: **Show your Google reviews** (the rating, count and link from the Reviews box) and **Show the Drive and video links** (the Drive folders and YouTube links already on the template).

Photos come from an upload or from **Pick from a finished job**: a strip of the business's project photos; one click puts the photo in the next empty spot (hero first, then page 1, then page 2). Captions are optional and print on the photo. A **Live preview** button in the editor opens the preview pane beside the panel and draws both pages as the client will see them; it follows every keystroke.

The switch **Add presentation pages to every new quote** (Fix Round F part 1's `presentation_default_on`) sits at the top of the Presentation tab and saves on click; a single quote still switches its pages on or off in Quote details. Residential quotes pick the residential template, commercial quotes the commercial one, as today.

## 2. What changes in the app

| Where | Change |
|---|---|
| **Template data** (`routes/estimate_presentation.py`) | A template gains `pages`: `{ one: { title, hero_url, photos: [≤4 urls], captions: [4 strings] }, two: { on, headline, photos: [≤3 urls], captions: [3 strings], show_reviews, show_links } }`. `intro` stays the story text; `cover_image_url` mirrors `hero_url`; the `photos` list mirrors hero + page 1 + page 2 (its cap goes from 5 to **8**, `:78` and `:112`). A template without `pages` is read as: hero = cover, page 1 = the first four of `photos`, page 2 on with the next three, headline "A bit about us", reviews and links on — the same derivation the prototype's `ensurePages` uses; it is written back on the next save. Photos are files (the Round 75 storage path, Drive first, PTHQ cloud otherwise); the template holds URLs. |
| **Pick from a finished job** | `GET /admin/presentation-templates/job-photos` returns the business's most recent 24 project photos (`project_photos`, done jobs first) as `{url, label}` with the job's suburb and area as the label; picking copies the URL onto the template (no re-upload). Tenant-scoped. |
| **Quote set-up › Presentation** (`QsPresentationTab` or wherever the Round 25 tab lives) | The tab text, the default switch at the top (moved there if F5 placed it elsewhere; one place only), the template cards' summary line ("2 pages · 8 photos"), and the editor exactly as the prototype: name and type; the "Up to 8 photos — n of 8 used" line; Page 1 card (title, hero zone with Replace / Remove, four slots with Add photo / remove and a caption field each, Pick from a finished job); Page 2 card with its switch (off → the one-line explanation), headline, story, three slots, the two switches, the Drive fields and the YouTube list; Delete at the end. Save and Cancel as today. **Live preview**: the existing preview pane (the PDF tab's) renders the two pages from the unsaved form; Escape closes it first. |
| **Quote details** (`QuoteDetails.tsx`) | Section text: "One or two pages at the back of the quote with large photos of your work, your story and your reviews. Set up under the Estimates gear › Presentation; new quotes follow the switch there." Template cards describe themselves from their data ("Two pages: eight large photos …" / "One page: five large photos …"). Switch, preview link and radio cards as today. |
| **Client view and public page** (`components/estimate/v2/…` client doc and `app/quote/[token].tsx`) | When `presentation_enabled`, after the closing footer: **page 1** as a section (tag "Presentation · page 1 of 2", title, hero 320 px tall full width, 2 × 2 grid of 200 px photos with captions) and **page 2** (headline, story, three wide 140 px photos, the reviews box, the link buttons). On a phone the grid becomes one column and the hero 220 px. Images lazy-load; the caption is the alt text. Today the public page never renders presentation pages (`[token].tsx:56`); this fixes item 12. |
| **PDF** (`services/pdf.py _presentation_showcase`) | The sections 08/09 layout is replaced by two real pages with page breaks: page 1 title, hero at about 45 % of the page height, the 2 × 2 grid; page 2 headline, story, the three wide photos, the reviews line, the link tiles. Rendered under the same conditions as today (`presentation_enabled`, or the business default when the quote has no flag). |
| **Nothing else** | The rail switch, the per-quote enable, the residential/commercial pick, the reviews box and the Drive/YouTube fields keep their behaviour. `app/employee/*` untouched. |

## 3. Verify (testing agent, 1440 then 1024, TS_ tenant)

1. Presentation tab: the default switch at the top, on/off saves on click (`estimate_defaults.presentation_default_on`) and a new TS_ quote follows it; the template list with the summary lines.
2. Open a template: the two-page editor; remove a page-1 photo → "7 of 8" and an Add photo slot; Pick from a finished job → the strip shows the TS_ tenant's project photos only; pick one → it fills the slot; type a caption; Live preview shows both pages with the caption; page 2 off → one page in the preview, the story kept when turned back on; hero Remove / click to upload; Save → reopen shows everything.
3. Client view, public link and PDF of a TS_ quote with the pages on: page 1 hero and four photos with captions, page 2 headline, story, three photos, reviews and links; a commercial quote with the one-page template ends after page 1; a quote with the pages off shows none; on a 390 px phone the grid stacks and nothing overflows.
4. A template saved before this round (no `pages`) opens with the derived pages and prints the same photos it did.
5. 1024: no horizontal scroll; no console errors; `tsc` clean; `app/employee/*` untouched.

## 4. Tests

`backend/tests/test_r74_presentation.py` on TS_: create/patch a template with `pages`; the 8-photo cap (9 → 400); a legacy template reads back with derived pages; `job-photos` returns only the tenant's photos; the public document carries `presentation.pages` when enabled and nothing when not; the PDF text contains the page title and the headline. Suite green before and after.

## 5. What's new (Draft only)

**Title:** Show your work
**Body:** A quote can now end with one or two pages of your best photos, your story and your reviews. Set them up once under the Estimates gear › Presentation: a hero photo, up to eight in all, captions if you like, and a live preview while you build. Every new quote can carry them, and the client sees them on the page and in the PDF.

## 6. Questions for Josh (one line each)

1. "Add presentation pages to every new quote": on for new businesses (the prototype) or off until they set a template up?
2. Page 2 on by default for a new template (the prototype), or off?
3. The pages sit at the back of the quote on the web page, as in the PDF (the prototype). Fine, or before the quote?
