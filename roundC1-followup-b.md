Round C1 — §8 answers and follow-up B (guard every crew screen)

§8 answers (keep as built unless stated):
1. Keep. C2 imports the shared pieces from `app/employee/(tabs)/_layout.tsx` and does not move them.
2–7. Keep.
8. Expected; the job on sign-in arrives in C3.
9. Not this round. Noted for C3 (time clock), which touches `routes/timeclock.py` anyway: compare naive and aware timestamps safely in `/timeclock/status`.
10. Keep; the owner's admin chat has been told about the `utils/api.ts` change.
11. Keep. The owner's crew invite QR / code lives on the admin Employees page, so the landing page's QR is not needed on web.
12–16. Keep.

Follow-up B — guard every crew screen in one place:
- In `frontend/app/_layout.tsx` (the root Stack), on web only: if `usePathname()` starts with `/employee/` and `!isPhone()`, `router.replace('/admin/login')` and render nothing for that route. One guard, no per-screen edits, covers the eleven existing crew screens and every future one; the three entry-point guards from follow-up A stay as they are.
- Nothing under `app/admin/*`; no backend, env or route change.
- Verify (testing agent, phone UA for the crew paths, desktop UA + iPad UA for the non-phone paths): a desktop context carrying a crew session that opens `/employee/time-clock`, `/employee/contracts` and `/employee/project/<id>` directly lands on `/admin/login` with no crew element rendered; an iPhone UA still opens all three; the admin app on a desktop is untouched; no console errors; `tsc` clean.
- Report as "Round C1 follow-up B done", appended to the Round C1 report, then stop.
