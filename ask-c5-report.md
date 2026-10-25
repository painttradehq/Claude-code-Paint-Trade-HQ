Not a build round. Paste here, verbatim and in full, `memory/reports/round-c5-documents-report.md` (the Round C5 report, every section including the nine spec silences). Then, under it, answer these in a few lines each, from the code as it is now:

1. The two files outside rule 1's list: `backend/tests/seed.py` (crew_a now marked onboarded by a direct database write) and `backend/tests/test_r35_part_b_dashboard.py` (`onboarding_completed` added to the allowed activity kinds). Quote both diffs. Does any other test or fixture depend on crew_a being un-onboarded?
2. The one-document sign flow was Unverified in the browser because `crew_a` had no contract. Create one `TS_` contract for `crew_a` from `admin_a` (the Round 22 route), run the §8 sign flow at 390 × 844 and 360 × 800 (open the document, the question box, the sign sheet, the signed state, the countersigned copy's Download), report the result, and delete that `TS_` contract and its audit rows at the end.
3. The crew notice: paste `backend/content/legal/crew-notice.md` as saved, and the `routes/legal.py` diff.
4. `memory/PRD.md`'s new entry is headed "June 2026"; correct it to October 2026 and quote the line.
5. The What's new draft n 26: paste its title and body as stored; confirm `status: draft`.
6. Git: the list of files changed in this round (`git status --short`, the working tree, nothing committed by you).

Change nothing else. Do not start another round. End with "Report pasted."
