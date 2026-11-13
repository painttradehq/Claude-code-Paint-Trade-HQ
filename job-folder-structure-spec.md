# One folder per quote, filed by phase — photos, videos, crew reports, the final project report, quotes and invoices (spec from Josh, 13 November) — SETTLED; prototype `job-folders-photos.html`; then one round

Josh, 13 Nov, in three messages. First the ask ("crews add photos on the job page … wired to the same folder as the job"), then the flow, then his answers to the open points and one more folder. His words, tidied:

> The point of the filter is easy navigation. When the estimate is being created the estimator adds photos; those go into the PTHQ folder. The folder's name is the estimate number and the area of the site address, or the client's name with the estimate number if there is none. Everything captured before the acceptance of the estimate goes to before; everything captured after the project details page is created goes to process; everything captured after the last invoice goes to after. Deleting rights stay with admins only.
>
> Folder flow: folder "EST 001 Ivanhoe"; inside are content, crew reports and the final project report. Add another one, "quote and invoice", with a copy of the quotes and invoices related to the project. Inside content there are before, process and after. Inside crew reports, all the crew reports. In the final project report, the project report from the project details page.

## 1. The tree

In the business's chosen storage (Google Drive, OneDrive or the app's own store — the same paths in all three):

```
Paint Trade HQ/
└─ EST-0019 Ivanhoe/                 estimate number + the suburb of the job address;
   │                                 "EST-0019 John Smith" when the quote has no job address
   ├─ Content/
   │  ├─ Before/                     everything captured before the quote is accepted
   │  ├─ Process/                    everything captured once the job (Live Project) exists
   │  └─ After/                      everything captured once the job's last invoice is created or scheduled
   ├─ Crew reports/                  each daily report filed against the job, a PDF named with the date and who filed it
   ├─ Final project report/          the completion report from the project details page
   └─ Quotes and invoices/           a copy of the quote and of every invoice for the job
```

## 2. The rules (all settled with Josh, 13 Nov)

1. **The phase files the capture, not the person.** One camera control wherever content is added (the builder, the job page, the crew's job page). The server decides the folder from where the quote/job is at that moment:
   - quote not accepted → **Before**
   - job exists → **Process**
   - **the job's last invoice is created or scheduled → After** (Josh's answer to point 1). Precisely: the moment an invoice exists for the final stage of the quote's payment schedule, or a balance invoice — as a draft, with a send date, or sent. Drafts count here (unlike the "invoiced" money rule, where they don't).
   The photo's tag in the app follows the same rule, so the chips and the folders always agree; if the office re-tags a capture in the viewer, the file moves with the tag.
2. **The chips stay filters** — All · Before · Process · After — for navigation. (The app's chip says "Progress" today; the prototype labels it **Process** so the screen and the folder use one word. A label change only.)
3. **Who adds:** the estimator/owner in the builder and on the job page; assigned crew on their job page (so crew captures land in Process or After).
4. **Photos and videos**; a video up to **200 MB** a clip (Josh: OK).
5. **Deleting: admins only.**
6. **Crew reports:** every daily report filed against the job is saved as a PDF, named with the date and who filed it (`2026-11-13 Sam R.pdf`). The report's own photos are captures like any other and are filed under Content.
7. **Final project report:** the completion report's PDF is saved when it is sent.
8. **Quotes and invoices:** the quote's PDF is saved when it is sent (replaced if it is sent again) and once more as accepted; each invoice's PDF is saved when it is sent. One file per document number, so the folder always holds the current copy. *(The "when" is this spec's reading of "a copy of the quotes and invoices related to the project" — say if drafts should be copied too.)*
9. **The suburb** is the "area" in the folder's name (Josh: yes).
10. **The folder is created with the quote's first capture, and guaranteed — with all four sub-folders and the job's folder link pointing at it — the moment the job is created** (Josh: yes).
11. **No backfill** (Josh: no): quotes and jobs that exist keep their current folders; the tree applies to quotes created after the release.

## 3. What exists today, and what this changes (read from the code, 13 Nov)

| Piece | Today | Change |
|---|---|---|
| Folder name | `Paint Trade HQ › Estimates › "EST-0019 John Smith"` (`estimates_v2.py::_storage_folder`), created on the first photo | `Paint Trade HQ › "EST-0019 Ivanhoe"` (suburb from `jobAddressDetails`, else the client's name), with the sub-folders |
| Depth | the storage helpers take two levels under the root (`upload_to_drive(folder, parent)`) | a path of folders (four levels), in Drive, OneDrive and the built-in store alike |
| Filing by phase | none — a photo's Before/After/Progress is a tag someone sets | a small pure resolver (quote status, job, invoices → phase), unit-tested; sets the folder and the tag |
| Crew adding on the job page | hidden (`ProjectPhotos.tsx:55`, `!crew`); the upload route already allows assigned crew and stamps their name | the crew view gets the camera control (take photo · record video · gallery), no mark-up editor |
| Video | the built-in store serves video, but the photo upload routes refuse anything that is not an image | accept video on the same routes, 200 MB cap, an upload progress state |
| Daily reports | records with photos; a PDF is rendered on demand (`/daily-reports/{id}.pdf`); the report's photos are stored apart (`daily-report-photos`) | on submit, the PDF is saved to `Crew reports/`; the report's photos are filed under Content by phase |
| Completion report | rendered on demand, emailed, public link | saved to `Final project report/` when sent |
| Quote and invoice PDFs | rendered on demand | saved to `Quotes and invoices/` on send (and the quote again on acceptance) |
| `photos_link` on the job | copied from the quote; can be empty or point at an older-style folder | set to the quote's folder when it is first created, and guaranteed at job creation |
| Other job files | attachments under `Paint Trade HQ › Jobs › …` (`services/attachments.py`) | unchanged (not part of Josh's flow) |

## 4. The prototype

`job-folders-photos.html` — the crew's job page Photos card at phone width and the office job page's Photos card at 1440 and 1024, with a stage switch (quote not accepted · job under way · last invoice raised) to show the filing, and the folder tree beside it as a reference. Checks: `tools/test_job_folders.js`.

## 5. How it would be built

One round at Emergent after Josh's "send": storage paths and the phase resolver (backend, unit tests), the upload routes (crew, video), the crew control, the three document saves, the folder link. The crew screen is the crew's — the crew chat is told.
