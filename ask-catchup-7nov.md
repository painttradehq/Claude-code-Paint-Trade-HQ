Not a build round. I need to catch up on everything that changed since the "Round C6 done" commit (25 Oct). Paste, verbatim:

1. `git log --oneline <Round C6 done commit>..HEAD` (every commit, newest last), and `git diff --name-status <Round C6 done commit> HEAD -- frontend/app/employee frontend/components/crew frontend/hooks frontend/store backend/routes backend/services backend/server.py backend/rate_limiter.py backend/content` (crew-relevant files only).
2. `memory/PRD.md` from the heading "## Crew signup audit + fixes · 1 Nov 2026" to the end of the file (every section after it, in full).
3. For each of these, the report file's name and its first 40 lines: the crew signup audit, the crew app full audit (all three iterations), the crew notification system audit, the crew phone alerts (Web Push) round, and today's document-types round (`ls memory/reports | tail -20` first, then `head -40` of each relevant file).
4. The current `HIDDEN` list in `frontend/app/employee/_layout.tsx` and the current tap rule and icon rule in `frontend/app/employee/(tabs)/inbox.tsx` and `(tabs)/_layout.tsx` (quote the lines).
5. `GET /employee/app-settings`'s current response shape (quote `for_crew` in `services/crew_app_settings.py`) and the current `features` keys with defaults.
6. The list of routes under `/api/employee*`, `/api/employees/*`, `/api/projects/mine*`, `/api/training*`, `/api/coaching*`, `/api/validations/my*`, `/api/equipment/my*`, `/api/events*`, `/api/feedback*`, `/api/team*`, `/api/push*` or `/api/notifications*` as registered now (`grep -rn "@router\.\|@api_router\." backend/routes backend/server.py | grep -E "employee|projects/mine|training|coaching|validations/my|equipment/my|events|feedback|team|push|notifications"`).
7. What's new drafts: `db.updates` rows with `status: draft` — n, title, created_at; and which n were published since 25 Oct.
8. The live site: is painttradehq.co the deployed build, and when was it last published (the platform's deploy record if you can read it; otherwise say you cannot)?

Change nothing. Do not start another round. End with "Catch-up pasted."
