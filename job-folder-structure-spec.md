# One folder per quote, filed by phase — photos, videos, daily reports, the project report (spec from Josh, 13 November) — PARKED; prototype first, then one round

Josh, 13 Nov, answering the three open points on "crew add photos on the job page" (`admin-remaining.md`, parking lot). His words, tidied:

> The point of the filter is easy navigation. The flow: when the estimate is being created the estimator adds photos. Those go into the PTHQ folder. The folder's name is the estimate number and the name of the area of the site address, or if there is none, the client's name with the estimate number. All photos or videos taken before the acceptance of the estimate go to the content_before folder. All content captured after the project details page is created goes to content_process. All content captured after the release of the last invoice goes to content_after. Each estimate folder gets three folders inside: (1) content — inside it before, after and process, wired to the camera icon; (2) reports — all the crews' daily reports for that project, with the name of who filled them; (3) project report — created after the project is completed (this already exists on the project detail page). Deleting rights stay with admins only.

## 1. The tree

In the business's chosen storage (Google Drive, OneDrive or the app's own store — the same paths in all three):

```
Paint Trade HQ/
└─ EST-0019 Ivanhoe/                 estimate number + the suburb of the job address;
   │                                 "EST-0019 John Smith" when the quote has no job address
   ├─ Content/
   │  ├─ Before/                     everything captured before the quote is accepted
   │  ├─ Process/                    everything captured once the job (Live Project) exists
   │  └─ After/                      everything captured after the last invoice is released
   ├─ Reports/                       each daily report filed against the job, a PDF named with the date and who filed it
   └─ Project report/                the completion report, when the job is completed
```

**Naming, to confirm at the prototype:** Josh wrote both "content_before / content_process / content_after" and "inside the content there is before, after, process". This spec takes the second: `Content › Before · Process · After`. If he wants three flat folders named `content_before` etc., it is a naming change only.

## 2. The rules

1. **The phase files the capture, not the person.** One camera control wherever content is added (the builder, the job page, the crew's job page). The server decides the folder from where the quote/job is at that moment:
   - quote not accepted → **Before**
   - job exists → **Process**
   - the last invoice has been released (nothing left to invoice and the final invoice sent) → **After**
   The photo's tag in the app (Before / Progress / After) follows the same rule, so the chips and the folders always agree.
2. **The chips stay filters** — All · Before · After · Progress — for navigation (Josh's answer to decision 1).
3. **Who adds:** the estimator/owner in the builder and on the job page; assigned crew on their job page (so crew captures land in Process or After — a crew member only exists on the job once there is one).
4. **Photos and videos.**
5. **Deleting: admins only** (Josh's answer to decision 2 — as it is today).
6. **Reports:** every daily report filed against the job is saved to `Reports/` as a PDF named e.g. `2026-11-13 Sajad.pdf`.
7. **Project report:** the completion report's PDF is saved to `Project report/` when it is sent.
8. **The job's "Drive folder" link** opens the quote's folder (`EST-0019 Ivanhoe`), so everything is one click from the job.

## 3. What exists today, and what this changes (read from the code, 13 Nov)

| Piece | Today | Change |
|---|---|---|
| Folder name | `Paint Trade HQ › Estimates › "EST-0019 John Smith"` (`estimates_v2.py::_storage_folder`), created on the first photo | `Paint Trade HQ › "EST-0019 Ivanhoe"` (suburb from `jobAddressDetails`, else the client's name), with the sub-folders |
| Depth | the storage helpers take two levels under the root (`upload_to_drive(folder, parent)`) | a path of folders (four levels), in Drive, OneDrive and the built-in store alike |
| Filing by phase | none — a photo's Before/After/Progress is a tag someone sets | a small pure resolver (quote status, job, invoices → phase), unit-tested; sets the folder and the tag |
| Crew adding on the job page | hidden (`ProjectPhotos.tsx:55`, `!crew`); the upload route already allows assigned crew and stamps their name | the crew view gets the camera control (camera or gallery sheet, `usePhotoSource`), no mark-up editor |
| Video | the built-in store serves video, but the photo upload routes refuse anything that is not an image | accept video on the same routes, with a size cap (§4) |
| Daily reports | records with photos; a PDF is rendered on demand (`/daily-reports/{id}.pdf`), nothing is saved to the folder; the report's photos are stored apart (`daily-report-photos`) and show on the job as Progress | on submit, the PDF is saved to `Reports/`; the report's photos are filed in `Content/Process` like any other capture |
| Completion report | rendered on demand, emailed, public link; not saved to the folder | saved to `Project report/` when sent |
| `photos_link` on the job | copied from the quote; can be empty or point at an older-style folder (`"John EST-0019"`) | set to the quote's folder when the folder is first created, and guaranteed at job creation |
| Other job files | attachments under `Paint Trade HQ › Jobs › …` (`services/attachments.py`) | unchanged in this spec (Josh did not mention them) |

## 4. Open points (each changes the build)

1. **When "After" starts.** By the rule above, the finished-work photos taken on the last day — before the final invoice goes out — are filed under Process. Is that what Josh wants, or should After start when the job is marked **Done**? Either way: the office can already re-tag a photo in the viewer; this spec proposes that re-tagging also moves the file, so tag and folder never disagree.
2. **"Area of the site address" = the suburb** ("EST-0019 Ivanhoe")? 
3. **Quotes and jobs that already exist:** by the standing no-backfill rule they keep their current folder; the new tree applies to quotes created after the release. Confirm, or say he wants his own tenant's existing folders moved (a one-off, his word only).
4. **Video size cap.** Photos are capped at 5 MB after shrinking. A video needs a cap — the proposal is 200 MB per clip — and it uploads on Wi-Fi or mobile data as the crew's phone has it.
5. **Decision 3 was left blank** (folder at acceptance). This spec answers it from his flow: the folder and its sub-folders are created when the first photo is added to the quote, and guaranteed to exist — with the job's link pointing at it — the moment the job is created.

## 5. How it would be built

Prototype first: the crew job page's Photos card with the camera control (phone width), and the admin job page's Photos card showing the phase a capture will be filed under. Then one round at Emergent: storage paths and the resolver (backend, unit tests), the upload routes (crew, video), the crew control, the two report saves, the link. The crew screen is the crew's — the crew chat is told. Nothing goes to Emergent before Josh's "send".
