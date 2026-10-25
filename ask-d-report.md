Not a build round. Paste here, verbatim and in full, `memory/reports/round-d-distance-weather-reset-report.md` (the Round D report, every section including the nine spec silences). Then, under it, answer these in a few lines each, from the code as it is now:

1. The two one-line deviations from rule 1 (`app/employee/_layout.tsx`, `app/employee/login.tsx`): quote both diffs and say what each fixes (the "cold deep-link redirect" and the "single login screen" notes in your summary).
2. The three testing-agent findings you fixed: for each, the symptom, the file, and the diff.
3. The finding you did not fix — `utils/crewLocation.ts`'s web `maximumAge: Infinity` reusing a stale position on a same-page retry: quote the lines, describe the exact sequence that reuses a stale fix, and propose the smallest change (a value for `maximumAge`, or a fresh fix on "anyway") for the next round. Change nothing now.
4. TS_ Alpha's `crew_app_settings`: your teardown printed "crew_app_settings deleted: 1". Did the document exist before the round started (quote the saved copy if you took one)? If it existed, restore it now exactly as it was and quote the result; if it did not, say so.
5. The two Unverified items — a new report's **Edit keeps stored chips** and the **weather-null** state on Today's job card for a job without an address: run both now at 390 × 844 on TS_ Alpha (a TS_ report edited after the forecast changes; a TS_ job with no address → no weather line), report, and delete the rows you make.
6. Drafts n 27 (D) and n 28 (F): paste each title and body as stored; confirm `status: draft`. Draft n 26: paste its card as corrected.
7. Git: the files changed since the "Round C5 done" commit (`git diff --name-status`), nothing committed by you.

Change nothing else. Do not start another round. End with "Report pasted."
