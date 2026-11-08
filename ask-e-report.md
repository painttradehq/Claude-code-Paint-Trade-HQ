Not a build round. Paste here, verbatim and in full, `memory/reports/roundE-crew-scope-report.md` (the Round E report, every section including the twelve spec silences). Then, under it, from the code as it is now:

1. `git log --oneline 3cab602..HEAD` and `git diff --stat 3cab602 HEAD -- backend frontend/app/employee frontend/components frontend/store frontend/utils memory/specs/crew` (3cab602 is the commit you compared the pre-round backend against). Confirm every Round E file is committed and "Save to GitHub" has run.
2. Paste in full the `_crew_scope` helper and the `GET /projects/mine/{id}/scope` route from `backend/routes/projects.py`, and the diff of `backend/services/crew_app_settings.py` and `backend/routes/project_photos.py`.
3. `pytest --collect-only -q tests/test_e_crew_scope.py` (the case names).
4. From `frontend/app/employee/project/[id]/scope.tsx`: the list of `testID` values, and the lines that decide hours (the `hours` fields and `hoursTxt`), the summary card, and the `features.photos` branch.
5. The `crew-job-scope` row in `frontend/app/employee/project/[id].tsx`: paste the block, and say what `scope_detail` is computed from on the backend.
6. Draft n 31: title and body as stored; confirm `status: draft`.
7. `test_r46_attachments::test_crew_switch_signed_link_rename_delete` fails on the pre-round backend with 403 where the crew member should get the PDF of a crew-visible attachment. Quote the route that answers that request and the check that returns 403. Do not fix it.

Leave the admin project page as it is (the invoice refetch question belongs to the admin chat). Change nothing. Do not start another round. End with "Report pasted."
