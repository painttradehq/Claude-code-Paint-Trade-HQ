# Round 100 — One folder per quote, filed by phase (photos, videos, crew reports, the final project report, quotes and invoices)

*Sent to Emergent on 14 Nov on Josh's word ("send the photos file work and all"). The prototype is the file Josh uploaded on 14 Nov, saved by Emergent as `memory/specs/projects/job-folders-photos.html`. The patch for Step 0 is `emergent-uploads/pthq-fixes-14nov.patch` in this repo, uploaded to the Emergent chat by Josh.*

Your two questions first. **Number:** Round 100. **The crew phone screen is in scope** — Josh's word — but only the Photos card of the crew's job page (the shared `components/project/photos/ProjectPhotos.tsx` in crew mode, and `app/employee/project/[id].tsx` only where it mounts that card). Nothing else under `app/employee/*`.

## Step 0 — apply the patch Josh uploads (before the round)

Josh is uploading **`pthq-fixes-14nov.patch`** to this chat. It is the code written outside while you had no credit, as one diff against GitHub `main` `8e14989` (your B-001 is kept as the one quote-terms implementation; nothing of mine duplicates it): the twenty Fix Round J bugs (B-002, B-003, B-005, B-012, B-025, B-029, B-033, B-035, B-037, B-038, B-039, B-042, B-044, B-047, B-051, B-052, B-055, B-058), the crew Today tab's first paint (three crew files, written at Josh's request), and "after sending a quote, Done goes to the Quotes list". 21 files, +680 −226.

1. Save it and run `cd /app && git apply --3way --index <file>`. Your tree has B-046 and B-060 on top of `main`, so `backend/routes/estimates.py` and `frontend/app/admin/project/[id].tsx` will three-way merge — keep both sides (your refresh-rates route and Start-job strip, and the patch's guards, equipment edit and drawer prop). If any other file conflicts, stop and name it; do not retype the patch by hand.
2. `tests/test_fixj_quote_guard.py` (14), `tests/test_fixj_pricing_source.py` (5), `tests/test_fixj_job_money.py` (7) run without the harness and must be green; `tsc --noEmit` clean apart from `CoverageBar.tsx:86`; then the suite.
3. One lean pass of the testing agent at 1440 on the Part A checks of the Fix Round J brief you already have (B-002 logo survives a save · Job money follows Quote setup › Pricing · Mark accepted makes the job at the job address · Details › Notes opens · an accepted quote with a sent invoice refuses a price change but saves notes · equipment row edits · a started job with nothing invoiced reads "Nothing invoiced yet") plus: the crew Today tab opens from the splash straight into its real state (no "Get buzzed" card on a phone with alerts on, no "You're up to date." before the inbox has answered), and Done after sending a quote lands on the Quotes list.
4. Commit. **If the patch file is not in the chat when you read this, reply "waiting for the patch" once and wait for it** — Josh is uploading it; if he writes "start without the patch", go straight to the round and apply it when it arrives.

## The round — what Josh asked for

> When the estimate is being created the estimator adds photos; those go into the PTHQ folder. The folder's name is the estimate number and the area of the site address, or the client's name with the estimate number if there is none. Everything captured before the acceptance of the estimate goes to before; everything captured after the project details page is created goes to process; everything captured after the last invoice is created or scheduled goes to after. The filter chips are for navigation. Deleting rights stay with admins only. Each folder holds: content (before, process, after), crew reports, the final project report, and quotes and invoices.

### The tree (the same paths in Google Drive, OneDrive and the app's own store)

```
Paint Trade HQ/
└─ EST-0031 South Wharf/            estimate number + the suburb of the job address (jobAddressDetails.suburb);
   │                                "EST-0031 John Smith" when the quote has no job address
   ├─ Content/
   │  ├─ Before/                    captured before the quote is accepted
   │  ├─ Process/                   captured once the job (Live Project) exists
   │  └─ After/                     captured once the job's last invoice is created or scheduled
   ├─ Crew reports/                 each daily report filed against the job, a PDF named "YYYY-MM-DD <crew name>.pdf"
   ├─ Final project report/         the completion report's PDF
   └─ Quotes and invoices/          a copy of the quote and of every invoice
```

### The rules

1. **The phase files the capture, not the person.** One camera control wherever content is added. The server decides: quote not accepted → Before; job exists → Process; **an invoice exists for the final stage of the quote's payment schedule, or a balance invoice — draft, dated or sent → After** (drafts count here, unlike the money rule). A small pure resolver, unit-tested.
2. The capture's tag follows the same rule (`kind` before / progress / after — the stored value stays `progress`; the **label** on screen becomes **Process**, so the chip and the folder use one word). When the office changes the tag in the viewer, the file moves to that folder.
3. **The chips only filter:** All · Before · Process · After.
4. **Who adds:** the owner/estimator in the builder and on the job page; assigned crew on their job page. **Who deletes or re-files: admins only** (a crew PATCH of the tag or a delete is refused).
5. **Photos and videos.** A video up to **200 MB** a clip (a plain refusal above it), not shrunk, with an upload progress state; tiles show ▶ and the length.
6. **Crew reports:** when a daily report is filed against a job, its PDF (the existing renderer) is saved to `Crew reports/`; the report's own photos are filed under Content by phase like any other capture.
7. **Final project report:** saved when the completion report is sent.
8. **Quotes and invoices:** the quote's PDF when it is sent (replaced when sent again) and once more as accepted (`EST-0031 accepted.pdf`); each invoice's PDF when it is sent (`INV-0042.pdf`). One file per document number.
9. **The folder is created with the quote's first capture, and guaranteed — all four sub-folders, and the job's folder link (`photos_link`) pointing at the quote's folder — when the job is created** (`_spawn_project_from_estimate`, which after Step 0 is the one path for all three ways a job is made).
10. **No backfill.** Only quotes created after this round ships use the new tree (mark them at creation); every existing quote and job keeps its current folder and behaviour.

### The screens (the prototype is the reference; 390 for the crew card, 1440 then 1024 for the office card)

- **Crew job page, Photos card:** the help line; a full-width **Add photo or video** button; under it "New photos and videos are saved to **Process** — the job is under way." (or After — the last invoice has been raised); the four chips with counts; the grid with a tag pill on each tile. The button opens a sheet: Take photo · Record video (Up to 200 MB a clip) · Choose from gallery · Cancel. After an upload: the tile first in the grid, a toast "Photo saved to Process"; no mark-up editor for crew. The viewer shows who added it and "Filed under … › Content › Process", the office's note read-only, no Delete, no re-file.
- **Office job page, Photos card:** the existing card with **Add photo or video** (upload photos · upload a video), **Open folder ↗** with the path under it (`Paint Trade HQ › EST-0031 South Wharf`), the same "saved to" line and chips. The viewer adds **Filed as** (Before / Process / After — changing it moves the file) beside the existing Edit marks and Delete.
- The reference tree in the prototype is not a screen — do not build it.

### Build it in this order, committing after each slice (credit is short — if it runs low, stop after a finished slice and report which are done)

- **A.** Folder name, paths of folders in the three stores, the phase resolver and tags, the upload routes filing by phase (builder and job page), re-file moves the file, the folder guaranteed at job creation, the no-backfill mark.
- **B.** The crew card: the camera control, the sheet, the "saved to" line, the Process label, crew cannot delete or re-file.
- **C.** Video on both upload routes and both screens.
- **D.** Crew reports saved as PDFs; a report's photos filed under Content.
- **E.** The final project report saved on send.
- **F.** Quotes and invoices copied on send and on acceptance.

### Checks for the testing agent (TS_ tenants, torn down)

1. A new quote with job address "…, South Wharf" → its first photo creates `EST-xxxx South Wharf` with Content/Before; a quote with no job address → `EST-xxxx <client name>`.
2. A photo added before acceptance is tagged Before and sits in Content/Before.
3. Accept → the job exists, the four sub-folders exist, the job's Open folder opens the quote's folder.
4. A crew member assigned to the job adds a photo from the crew job page → Process, their name on it; a crew member not assigned gets 404.
5. Chips filter and never open the camera.
6. A video under 200 MB uploads with a progress state and plays; one over is refused with the plain message.
7. Create the final invoice as a draft → the next capture is tagged After and sits in Content/After.
8. The office re-files a capture Before → Process: the tag, the count and the file's folder all change.
9. A crew delete or re-file is refused; the office can do both.
10. File a daily report for the job → `Crew reports/YYYY-MM-DD <name>.pdf`; its photos appear under Process.
11. Send the completion report → its PDF in `Final project report/`.
12. Send the quote, accept it, send an invoice → three files in `Quotes and invoices/`; re-sending the quote replaces its file.
13. A quote that existed before the round: its photos still save to its old folder; nothing moved.
14. The same on the app's own store (no Drive connected): the same paths, the photos display.
15. No horizontal scroll at 390, 1440, 1024.

## After the round is reported

If credit remains: Part B of the Fix Round J brief you already have — the lines not yet done, cheapest first, one commit per bug, the "ask Josh" and "hold" items left alone. Report which were done.

## Rules

TS_ rows only, torn down after; Josh's own tenant read-only; no backfill; nothing beyond this message and nothing from your own suggestion list; no notices or banners; AI = Claude only through the app's own key; under `app/employee/*` only what this message names; no secrets in any reply (never print a key, an admin id or MONGO_URL); report `memory/reports/round100-job-folders-report.md` with the commit hashes and which slices are done; What's new as a **draft** only (never publish): "Every quote now has its own folder — photos and videos file themselves as Before, Process or After, the crew can add them from the job, and the crew reports, the final report, the quote and the invoices are saved beside them." Save to GitHub and Publish are Josh's clicks.
