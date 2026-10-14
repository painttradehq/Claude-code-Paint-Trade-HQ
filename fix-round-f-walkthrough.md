# Fix Round F — walkthrough of Josh's list (14 October 2026)

Josh's list, item by item: what he saw, the cause as far as the code shows it, the fix, and what each needs before it can go (nothing, a prototype, an answer, or an environment change). Read from the app clone at Round 64 plus the Round 65–73 specs; the Add work sheet (follow-up A) and the Lucy box (Round 73) changed after the clone, so two items are marked where the current code may differ.

Legend for "Needs": **none** = bug fix, straight to the spec · **prototype** = design, Josh reviews first · **answer** = a question for Josh · **env** = a setting on the server, not code.

## A. Library

### 1. "Adding a product into the item doesn't work"
- **Where:** Library › item editor (`app/admin/library/add-variant.tsx`, section 6 "Suitable products").
- **How it works today:** the list of suggestions appears **only while you are typing** in "Search your Products…"; tapping a row adds the product as a chip and clears the search. The list comes from your Products page (`GET /materials`, archived ones hidden). If the Products page is empty or the request fails, the search shows "No match in your Products. Add it on Library › Products first" and nothing can be picked.
- **Cause:** not provable from the code alone. Three candidates: (a) the Products page has no products yet for that business (the editor never offers typing a new one); (b) on a tablet the on-screen keyboard closes when the row is tapped, the list shifts, and the tap lands on nothing; (c) the chip appears but the item's products are saved as **labels** (brand + name), so a renamed product silently detaches.
- **Needs: answer.** What exactly happens: no list appears, the tap does nothing, or the chip appears but is gone after Save? And on the tablet or the computer?
- **Fix once known:** (a) a "+ Add '{text}' as a new product" row in the suggestions that creates it on the Products page and attaches it; (b) keep the list mounted through the tap (same fix as the Lucy rows: reserve the space, do not collapse on blur); (c) store the product id, not the label.

### 2 and 9. "Typing a rate or minutes closes the keyboard" (item editor and edit cards are the same screen)
- **Cause, confirmed:** `RateTimeRow` is a component **defined inside** `AddVariantScreen` (`add-variant.tsx:338`). Every keystroke re-renders the screen, React sees a brand-new component type, unmounts the row and mounts a fresh one, and the text field loses focus. On a tablet that is the keyboard snapping shut after one digit. Every rate and minute field on the page is inside that row.
- **Fix:** move `RateTimeRow` out of the screen component to module level (it only needs the styles and the colour tokens, which are module-level already). No visual change.
- **Verify:** on a tablet, type three digits into Preparation rate, First-coat rate and minutes in a row without the keyboard closing; Save; reopen; values kept.
- **Needs: none.**

## B. Estimate builder

### 3. "Add a Library item or task from the builder, not only from the Library"
- **Today:** the Add work sheet's search, when nothing matches, offers a **custom line** only (follow-up A). The Line details panel says "No product matches. Add it in Library → Products." Nothing leads to the Library.
- **Fix (design):** in the Add work sheet's "nothing matches" state, a second button **Add "{text}" to the Library**. It saves the estimate first (the builder autosaves; this forces the save and waits for it), then opens the Library editor for that rail category (items → `add-variant`, repair → `add-task`) with the name prefilled and a return link. On Save in the Library, the user lands back in the builder with the Add work sheet open on that category, the new item at the top with a "New" pill, and one tap adds it to the area they were in. Cancel in the Library returns the same way without a new item.
- **Needs: prototype** (the empty-state buttons, the Library editor's return bar, the "New" pill on return). Current Add work sheet is follow-up A's; the prototype patches `estimate-builder-add-work-v2.html`.

### 4. "Why doesn't Lucy know which page she is in?"
- **Cause, confirmed:** the chat sends `message`, `session_id` and an optional image (`components/lucy/LucyChat.tsx:51`; `ai_routes.py:57` `ChatRequest`). The system prompt knows the business name and today's date (`ai_routes.py:45–53, 210`) and nothing about the page. Lucy literally cannot see where you are.
- **Fix:** the box sends `page: { path, title, entity: { type, id, label } }` with every message (path and params from the router; the label the page already shows, e.g. "EST-0192 · Smith", "Jane Smith", "Riverside deck", "Timesheets"). The backend adds one line to the system prompt: "The owner is looking at: {label} ({path})." and tools that take an estimate, client or project default to that entity when the question says "this". No new tools.
- **Verify:** on a quote, "what's the total of this quote" answers with that quote; on a client, "when did I last message them" answers for that client; on the dashboard, "where am I" says the dashboard.
- **Needs: none** (text, no design).

### 5. "The Line details panel on the right needs to be bigger"
- **Cause:** `LinePanel.tsx` opens `<Sheet width={460}>`. The rate grid (step · $ · min) and the product list are cramped at 460.
- **Fix:** 640 px, same family as the other right-hand panels. The rate grid gets a fourth column for the step hint, the product list two columns of chips.
- **Needs: prototype** (together with 6 and 15 below, one Line details prototype).

### 6. "Preparation should be definable: cleaning, sanding, setting up"
- **Today:** the Library item already has a **"What the prep includes"** text (`prepAbout`, placeholder "e.g. clean, fill nail holes, sand, spot prime bare patches"), but the Line details panel shows only "Preparation · optional, adds to every unit" with a rate and minutes (`LinePanel.tsx:17`). The text never reaches the estimate.
- **Fix:** the Preparation row in Line details shows the item's prep text under the label, with "Edit for this line" (a per-line `prep_note`, defaulting to the item's text). Where it prints is item 7.
- **Needs: prototype** (part of the Line details prototype).

### 7. "The preparation details are in the quote and visible to crew"
- **Today:** prep is a price component only. The quote line's meta says "2 coats + prep"; the prep **text** is printed nowhere and the crew job page (C2) lists the work per area without it.
- **My reading of your line:** you want the prep text **on the quote line** (the client sees what prep they are paying for) **and on the crew job page** under that area's line. Printed exactly as the item text or your per-line edit; never the prep rate on the crew side.
- **Needs: answer.** Is that the intent, or the opposite (prep text on the quote only, or crew only)?

### 8. "Add exterior zone opens a second window to pick items like Render walls — we already have Add work"
- **Cause, confirmed:** `AreaPicker.tsx` has a second level for exterior: pick a face → a grid of elements (Render Walls, Weatherboard Walls…) that adds lines straight away (`openFace`, `pickElement`, `PK_ELEMENTS`). Interior has no second level.
- **Fix:** remove the second level. The exterior picker becomes the interior one in shape: pick a face, a zone around the house or your own, it lands on the paper, Add work does the rest. `PK_ELEMENTS`, `resolveElement`, `onAddLine` and `onFallback` go from the picker (kept only if something else imports them).
- **Needs: none** (removal; the result is the existing interior picker).

### 10. "Quote PDF live preview doesn't show on my tablet"
- **Cause, confirmed:** the preview pane draws the PDF with `<object type="application/pdf" data="blob:…">` (`QuotePdfPreview.tsx:35`). Safari on iPad does not render PDFs inside an `<object>` or iframe; it shows a blank pane. Desktop browsers do.
- **Fix:** render the preview pages as images in the pane with PDF.js (`pdfjs-dist`, one new frontend package) onto canvases, scrolled vertically, re-rendered 600 ms after the last change as now. The "Download a sample PDF" button stays a real PDF. Same pane for the invoice gear.
- **Needs: none** (technical; the pane looks the same, only the page images change). Flag: a new package.

### 11. "We need a better quote presentation set-up"
- **Today:** Quote set-up gear › Presentation tab: templates with a name, type (residential / commercial), one cover image, an intro text, up to 5 past-project photos, YouTube links, Drive links (`QsPresentationTab.tsx`). Per quote: Quote details › "Presentation pages" switch + template (`QuoteDetails.tsx:45–62`). The PDF prints a showcase section when the switch is on (`services/pdf.py:535`).
- **This is a design round of its own, not a fix.** Candidate scope: pages instead of one block (cover · about us · how we work · past work · warranty and care · what happens next), per-quote photo pick from the job's own photos, page order and on/off per page, a real preview of the pages, and the public quote page showing the same pages as the PDF (see 12).
- **Needs: answer.** What "better" means to you in two or three lines, then I prototype it as Round 74.

### 12. "Why does the presentation I created not appear on the quote preview?"
- **Cause, confirmed:** two switches and one gap. (a) Creating a template in the gear does not turn it on for a quote; each quote has its own "Presentation pages" switch in Quote details, off by default (`estimates_v2.py:297` `presentation_enabled: False`). The builder preview shows the pages only when that switch is on (`Builder.tsx:61`). (b) The **public quote page never renders presentation pages at all** (`app/quote/[token].tsx:56` calls `ClientDoc` without them), while the PDF does. So the client gets them in the attached PDF and not on the link.
- **Fix:** (a) a setting in the gear's Presentation tab, "Add presentation pages to every new quote" (default on when a template exists), so new quotes start with the switch on; the Quote details switch stays for per-quote control; (b) the public page renders the same pages as the PDF; (c) one line under the gear's template list: "Shows on the PDF and the online quote when 'Presentation pages' is on for that quote."
- **Needs: none** beyond the exact texts above (the public page reuses the builder's presentation block).

### 13. "The draft message already has an email signature, and lower down there is also 'set your signature'. Why?"
- **Cause, confirmed:** two sources. The Signature field on Preview & send is prefilled from Messages setup (`comms.email_signature`, or owner · business · phone) and appended at send (`ReviewSend.tsx:23, 34`). The body itself comes from the default template or the AI draft, which often ends with its own sign-off ("Cheers, Josh"), so the email carries two.
- **Fix, recommended:** one signature, saved once. Remove the editable Signature field from Preview & send; show the saved signature **greyed under the body** as "Signature · from Messages setup · Edit" (Edit opens Messages setup). The AI draft prompt gets "no sign-off; the signature is added automatically", and the default template loses its closing line. The CRM client-page send already appends the saved signature server-side (`crm.py:128`), so this makes the two paths behave the same.
- **Needs: answer** (yes to the recommended, or keep the field and only fix the double sign-off).

### 14. "Email is integrated but sending says 'add a domain in your provider like Resend'"
- **Cause, confirmed:** `services/email.py:187–192`: when the server still sends from Resend's test sender (`onboarding@resend.dev`), Resend rejects any address except the account owner's, and the app shows "Resend rejected the send: the test sender onboarding@resend.dev can only deliver to your own Resend account email. Verify a domain at resend.com/domains and set RESEND_FROM." That is the preview's environment, not the business's settings: `RESEND_FROM` is not yet the verified domain.
- **Fix:** **env** (your list): set the Resend key, `RESEND_FROM` on the verified domain and the reply-to, remove the Emergent email key. **Code:** the owner-facing text must not leak platform internals. Replace with "Email isn't switched on for this server yet. Your message was saved as a draft." for owners; the full Resend text goes to the log and to the platform admin only.
- **Needs: env** + none.

### 15. "Items come as each / hours / m² by default; the default should stay but be changeable, in Line details"
- **Cause, confirmed:** a Library line's unit is fixed from the item's `pricedBy` (`estModel.ts:86`); Line details shows "Quantity · priced by m²" read-only (`LinePanel.tsx:26`). Only custom lines have a unit select (`LinePanel.tsx:38`).
- **Fix:** Library lines get the same unit select in Line details (each · m² · lineal · hour · day · job), defaulting to the item's unit. Changing it keeps the quantity number and the rates (they are "per unit"); auto-measure from the area switches off unless the unit is m² or lineal (the only ones the area maths can produce); the quote line and the crew job page print the new unit.
- **Needs: prototype** (part of the Line details prototype with 5 and 6).

## C. CRM

### 16. "The client page says SMS and email were sent, but I don't see any email"
- **Cause, confirmed for email:** on the preview the app sends through Emergent's email proxy when its key is set (`services/email.py:147–165`); the proxy answers 200 and the app records **"sent"** (`crm.py:124–131`), but the proxy's sandbox only delivers to the Emergent account's own address. "Sent" means "the provider accepted it", not "it arrived". **SMS:** with no Twilio number connected the row is recorded as **"queued"**, not sent (`crm.py:140–143`); if the page showed "sent" for SMS, that is a label bug to check.
- **Fix:** **env** first (same as 14; then real emails leave). **Code:** honest states on the timeline: "Sent" only when the provider accepted; "Queued · no SMS number connected" for SMS; "Not delivered" when the provider later reports a bounce (Resend webhooks: a small route, later round). The SMS label check goes in this round.
- **Needs: env** + answer (did the SMS row say "Sent" or "Queued"?).

### 17. "A reminder I left on a client shows on the calendar as 'call them' with no client"
- **Cause, confirmed:** the calendar feed builds reminder entries as "Reminder: {text}" and carries only `related_id` (`calendar_feed.py:131–134`); the reminder record has `related_type: "customer"` + `related_id` (`reminders.py:25–26, 44–45`) but the feed never looks the client up, so the drawer has nothing to show.
- **Fix:** the feed resolves the related record: customer → "Reminder · Jane Smith: call about the deck quote", estimate → "Reminder · EST-0192 Smith: …", project → "Reminder · Riverside deck: …". The calendar drawer gets a line "For: Jane Smith" linking to the client (or quote, or job), and the same label appears wherever reminders are listed (the client page already lists them). Lucy's `add_reminder` sets `related_type/id` when the reminder is made from a client or quote page (ties into item 4).
- **Needs: none** (exact texts above; the drawer line follows the existing drawer rows).

## D. How to run it

**Fix Round F, no design (goes first, one message):** 2/9, 4, 8, 10, 12, 14 (text), 16 (label + states), 17. Backend touches: `ai_routes.py` (page line), `calendar_feed.py` (titles), `estimates_v2.py` (default switch), `crm.py` (states), `services/email.py` (owner text). Frontend: `add-variant.tsx`, `AreaPicker.tsx`, `QuotePdfPreview.tsx` (+ `pdfjs-dist`), `LucyChat.tsx` (+ page context), `app/quote/[token].tsx`, the Presentation tab texts, the calendar drawer row. Tests: `test_r_fixF.py` for the feed titles, the default switch, the page line in the prompt, the queued/sent states. What's new: one draft, "Small fixes across the builder, Lucy and the calendar".

**Fix Round F, design (second message, after the prototypes):** Line details at 640 with the unit select and the prep text (5, 6, 15, and 7 once answered); Add to the Library from the builder (3); the signature on Preview & send (13).

**Separate round:** 11 (presentation set-up), prototyped as Round 74 after your answer.

**Your side (env):** Resend key + sender on the verified domain + reply-to, Emergent email key removed, then "send the test email" (14, 16).

## E. The five answers I need

1. Item 1: what exactly happens when you add a product, and on which device?
2. Item 7: prep text on the quote line **and** the crew job page?
3. Item 11: what "better presentation" means to you, two or three lines.
4. Item 13: remove the Signature field and use the saved one (recommended), or keep it?
5. Item 16: did the SMS row say "Sent" or "Queued"?
