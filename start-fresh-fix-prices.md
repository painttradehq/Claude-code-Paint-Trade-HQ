# Start fresh — also clear the Library's prices and times (Round 67 follow-up — SENT 10 Oct with the Add work follow-up)

Round 67 follow-up, small, not a new round. The owner ran Start fresh on the preview: the Library cards kept their set prices and task times. Owner's decision (9 Oct): **the cards stay — name, description, photo, methods and all — but every price and time on them goes.**

**What to change.** Start fresh (`POST /api/platform/start-fresh`, the `start_fresh` job) gets one more group, **Library prices and times**, run after the delete groups and before numbering:
- `library_variants` rows of the business: set `rates` to `{primer: null, oneCoat: null, twoCoat: null, threeCoat: null}`, `labourMins` the same, and `hourlyRate`, `hourlyHours`, `prepRate`, `prepMinutes` to `null`. Everything else on the row stays as the painter left it: `category`, `name`, `about`, `pricedBy`, `prepAbout`, `methods`, `material`, `process`, `products`, `photoUrl`, `photoCleared`, `source`, dates (`updatedAt` moves to now).
- `library_tasks` rows of the business: set `rate` to `0.0` and `labour_minutes` to `0` (the seeded blanks). Everything else stays: `group`, `name`, `about`, `applies`, `attaches_to`, `priced_by`, `materials`, `methods`, `products`, `hazard`, `stop_work`, `photo_url`.
- Count = the number of cards touched (variants + tasks). The rows are not deleted and are not in the export (nothing is lost but numbers the owner chose to drop); say in the report if you think the export should carry a JSON of the old prices anyway — if it is cheap, include it.
- Products (`materials`) and their prices, Settings rates and markups, templates: untouched, as today.

**Where it shows (the prototype `start-fresh-panel.html` has the wording, three places):**
- The tab's **What goes** table and the panel's **What goes** list: a new row **Library prices and times (the cards stay) · {n}** (`sf-row-library`), after Archived items, before the crew row; it counts toward the Total.
- The **Stays** sentence (tab and panel) now reads: "Business profile and settings · your products · the Library's cards (names, descriptions, photos and methods — their prices and times are cleared) · quote and invoice setup · contract, message and automation templates · training videos · your owner account and team admins · Lucy's settings · tester invites and feedback."
- The **Done** card lists the row like the others: "Library prices and times · {n} cards".
- `GET /api/platform/start-fresh/counts` returns the new group `{key: 'library', label: 'Library prices and times', count}`; Recent activity row and the last-run line unchanged (the total includes the cards).

**Tests.** Seed a TS_ tenant with two variants carrying rates/labourMins/hourly/prep values and two tasks with rate and minutes; after the run every price and time field is null/0 and every other field is byte-identical; counts endpoint shows the group; tenant B's Library untouched (isolation). Suite green before and after. The owner's real tenant: **do not run**; read-only counts only.

Verify at 1440 then 1024: the new row in the tab table, the panel list, the Stays sentence, the Done card (testing agent, iteration number in the report). Report: append a section "Round 67 follow-up — Library prices and times" to `memory/reports/round67-start-fresh-report.md` with files changed, the agent-tested items, suite numbers, TS_ records created and removed. No What's new draft (Start fresh is Josh-only). Do not start anything else after it. No next action items. No Code review.
