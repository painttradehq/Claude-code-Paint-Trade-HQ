# A quote that has a job says "Open live project" — NOT SENT. Waits for Josh's "send"

Josh, 28 Nov: "In the side bar of an accepted quote it says Create live project, while the accepted quote gets a project automatically — so that should say Visit live project or Manage this project or something else."

**Read in the code (`a71a8f3`):**
- The Quotes list's side panel was written to do exactly that: `app/admin/estimates.tsx` line 239, `label={est.project_id ? 'Open live project' : 'Create live project'}`. But a quote never carries `project_id` — the job points at the quote (`projects.estimate_id`), not the other way, and `GET /estimates` does not add it. So the label always falls to "Create live project".
- Pressing it still works: the create route answers "A project already exists for this estimate" with the job's id, and the panel opens that job.
- A second fault beside it: the builder's ⋯ › **Convert to live project** posts to `/estimates/{id}/convert-to-project`, a route that does not exist anywhere on the server. It can only ever say "Could not convert".

**No prototype** — words on two buttons that are already there. **Wording chosen:** "Open live project" — the words the code already meant to show, and how every other such button in the app reads ("Open EST-0046", "Open the job").

---

## The message

# A quote that has a job says "Open live project"

Josh: "In the side bar of an accepted quote it says Create live project, while the accepted quote gets a project automatically — so that should say Visit live project or Manage this project or something else."

**Tests: test accounts only — never Josh's account; made for the run and removed after.**

## What the code says

- `app/admin/estimates.tsx` already has `label={est.project_id ? 'Open live project' : 'Create live project'}`, but no quote ever carries `project_id` (the job holds `estimate_id`; `GET /estimates` adds nothing), so it always reads "Create live project". The press then gets the create route's 409 with the job's id and opens it.
- `components/estimate/v2/Builder.tsx`, ⋯ › Convert to live project, posts to `/estimates/{id}/convert-to-project`. There is no such route — it always ends in "Could not convert".

## The fix

1. **The quote knows its job.** `GET /estimates` and `GET /estimates/{id}` return `project_id` for a quote that has a job — for the list, one read for all the quotes on the page (`$in` on `projects.estimate_id`), inside the list's read budget. Never stored on the quote; never accepted back on a save (add it to the keys the save drops).
2. **The Quotes list's side panel** — one rule for both places the tile shows (accepted, and every other status): the quote has a job → **Open live project**, straight to `/admin/project/{id}`, no create call. No job → **Create live project**, as today.
3. **The builder's ⋯ menu** — the same rule and the same words: has a job → **Open live project** → `/admin/project/{id}`; no job → **Create live project**, posting the route that exists (`POST /projects/from-estimate/{id}`) and opening the new job; a refusal shown in the app's own words. "Convert to live project" and the call to the missing route go.

## Checks

Pure: the list and the single read carry `project_id` only for a quote with a job; a save that sends `project_id` back changes nothing; the list's read-budget test.

On screen with the testing agent, test accounts only, 1440 then 1024:
1. An accepted TS_ quote (its job made by the acceptance): the side panel's tile reads **Open live project** and opens that job. No second job is made.
2. The same quote in the builder: ⋯ › **Open live project** opens that job.
3. A TS_ draft with no job: both read **Create live project**; each makes the job once and opens it; pressed again they read Open live project.
4. A quote being revised (back in Draft with its job): **Open live project** in both places.
5. Nothing runs off sideways in the side panel or the menu.

## Rules

As the rounds before: this message only — nothing from your own suggestion list; no backfill; no notices or banners; nothing under `app/employee/*`; no key, password or admin id in any reply. **Tests: test accounts only — never Josh's account.** Report to `memory/reports/quote-open-live-project-report.md`. Add one line to What's new draft #47 (never publish): "A quote that already has a job now says Open live project, on the Quotes list and inside the quote." Save to GitHub and Publish are Josh's clicks.
