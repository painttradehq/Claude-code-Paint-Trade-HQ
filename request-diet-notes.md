# Round 76 — Request diet: fewer database trips per request, fewer requests per page (proposal for Josh's review, not sent)

Backend + admin-frontend round; no prototype (nothing changes on screen). Written from Emergent's read-only diagnosis of the live logs (15 Oct, 10:10 AEDT recording) and the Round 64 code. Answers Emergent's own "Round 76 — Request diet" question with a spec instead of a one-word pick.

**Why.** With Round 75 live, a hard refresh of the quotes page took 11.5 s for four rows: about 3 s is the hard refresh re-downloading the 1.3 MB app bundle and eight fonts (normal for Ctrl+Shift+R; a plain reload uses the cache), about 3 s until the shell, about 5 s until the rows. Server-side on production `GET /api/estimates` takes 1.5–2.2 s and `/admin/profile` 0.5–1.3 s; the same code on preview takes 0.15–0.25 s because preview's database is local. Every authenticated request runs about five sequential database round trips before its own query: the revoked-token check (`auth.py:84`, `services/sessions.py:128`), the user lookup (`auth.py:108`, crew `auth.py:116`), the subscription gate's admin lookup (`subscription_gate.py:173`), the pay-strip's admin lookup (`services/access.py:55` via `PayStripMiddleware`, `access.py:139`), and route guards that call `_member_access` again (`access.py:62–104`). On production each round trip costs 200–300 ms, so one request spends about 1.5 s on lookups, and the quotes page fires about ten requests at once (`platform/me`, `version`, `feedback/unread`, `admin/profile`, `auth/me`, `updates/unseen`, `billing/me`, `estimates`, `estimates?status=archived`, …) through one uvicorn worker per pod on a 500m CPU limit.

## 1. Backend: one principal per request

| Where | Change |
|---|---|
| **Resolve the caller once** | The first component that needs the caller (the subscription gate, the pay-strip, or `get_current_user`) verifies the token and loads what the others need into `request.state.principal`: `{payload, user: {_id, role, access, owner_admin_id, deleted, the subscription/billing fields the gate reads}, revoked: bool}`. Everything downstream reads `request.state.principal` instead of querying: `get_current_user` / `get_current_admin` / `get_current_employee` (`auth.py`), `SubscriptionGateMiddleware.dispatch`, `_member_access` and the guards built on it (`require_owner` etc.). One helper `services/principal.py: async def resolve(request) -> Principal` is the only place that does the work; it is idempotent (second call returns the stored one). |
| **A short cache for the user document** | `services/principal.py` keeps a process-local cache `{user_id: (doc, loaded_at)}`, TTL **30 s**, at most 2 000 entries, holding only the fields listed above (never the password hash, never tokens). Writes in the same process that change those fields delete the entry: member access changes, member removal, subscription and billing updates (incl. the Stripe webhook handler), the account delete. Another worker's cache can be stale for at most 30 s; that is the accepted cost. Keyed by `_id` only; an admin's doc is never stored under an employee's id or the reverse. |
| **Revocation stays live** | The revoked-token check (`is_jti_revoked`) runs on every request, uncached, so "sign out other devices" keeps biting on the next request. Result: a warm authenticated request does **one** lookup trip (revocation) plus the route's own query; a cold one does two. |
| **Trip counter for the report** | Debug-level log line per request with the number of database calls made (a counter on `request.state` incremented in `services/principal.py` and in a thin wrapper used by the three auth sites); used only for §4 numbers, off at info level. |

Crew requests go through the same `get_current_user`, so the crew app gets the saving without any change to `app/employee/*`.

## 2. Admin frontend: fewer requests on the way in

| Where | Change |
|---|---|
| **`/admin/profile` once per load** | `store/adminProfileStore.ts` dedupes: while a fetch is in flight every caller awaits the same promise; after it resolves callers read the store. Same for `store/accessStore.ts` (`/auth/me`). |
| **Archived quotes on demand** | `app/admin/estimates.tsx:87` fetches `/estimates` only; `/estimates?status=archived` is fetched the first time the Archived view is opened. If the Archived tab shows a count today, `GET /estimates` returns it in an `X-Archived-Count` response header (one `count_documents` server-side) and the tab reads it; if it shows no count, nothing is added. |
| **Badges and polls after first paint** | `feedback/unread`, `updates/unseen`, `version`, `platform/me`, `billing/me`: start after the screen's own data has rendered (a `useEffect` that waits for the shell's first paint, `setTimeout(…, 0)` after mount is enough), never on the sign-in pages, and any that repeat do so no faster than every 60 s and pause while the tab is hidden (`document.visibilityState !== 'visible'`). The agent lists in the report where each of these is fired today (`app/admin/_layout.tsx` and components). |
| **Nothing else moves** | Same shell, same badges, same data; they arrive a beat later on a cold load. |

## 3. Two uvicorn workers per pod (Emergent's question 2)

Start command `--workers 2`. Exactly one worker runs the embedded scheduler: a lease document `scheduler_lease` (`_id: "scheduler"`, `holder`, `expires_at` 90 s ahead) renewed every 30 s by the holder; the other worker checks every 30 s and takes over when the lease has expired. The report states how it was done and shows two local workers starting with one scheduler. Memory per pod roughly doubles; the 500m CPU limit stays (the waits are database latency, not CPU, so two workers still help). Josh decides (§9.2).

## 4. Measure (read-only on production via the deployer; the owner's tenant read-only)

Before and after: server time of `GET /api/estimates`, `/api/admin/profile`, `/api/auth/me` (p50 over ten calls); database calls per request from the §1 counter (before: by reading the code paths, after: the counter). The owner repeats the hard-refresh recording and a plain reload afterwards; the two timings go in the report.

## 5. Verify (testing agent, 1440 then 1024, TS_ tenant)

1. Sign in, quotes page, dashboard, a customer page, a job page, the Library: same content as before; the shell's badges appear after the list.
2. Sign out on device A ("sign out other devices") → device B's next request is 401 immediately.
3. Remove a TS_ member's access as the owner → that member's next request after at most 30 s is refused; a lapsed TS_ subscription is gated within 30 s; a tenant with access unchanged sees nothing different.
4. Isolation: alternate requests with tenant A's and tenant B's tokens for 60 s; every response carries only its own tenant's data (the cache is keyed by id).
5. Crew: a TS_ crew member signs in and opens Today, Jobs, a job → unchanged.
6. Quotes page: one `/estimates` request on load; the archived request only when the Archived view opens; `/admin/profile` exactly once; the five badge/poll endpoints fire after first paint and not on `/admin/login` or `/crew`.
7. §3 if accepted: two workers, one scheduler (`embedded scheduler running 13 jobs` once in the logs), Start fresh still runs.
8. Suite and `tsc` clean; 1024: no horizontal scroll; no console errors; `app/employee/*` untouched.

## 6. Tests

`backend/tests/test_r76_request_diet.py` on TS_: a wrapped `db.admins.find_one` is called at most once per authenticated request and zero times on a second request within 30 s; the revocation check runs on every request; a cache entry is dropped when access changes; TTL expiry after 30 s (clock patched); two tokens never see each other's doc; the scheduler lease is held by one holder when two takers race (if §3 accepted). Suite green before and after.

## 7. Not in this round

- Bundle size and fonts (the first 3 s of a hard refresh): a later round on code-splitting if the owner wants it.
- Where the database lives. If the production database is in a different region from the app pods, every round trip pays 200–300 ms and nothing in code fixes that; moving the database or the pods to the same region is a platform step for Emergent support (§9.3).
- `app/employee/*`.

## 8. What's new (Draft only)

**Title:** Quicker pages
**Body:** Every page now asks the server for less on the way in, so quotes, jobs, customers and the dashboard appear sooner, especially on slower connections. Nothing on screen has changed.

## 9. Questions for Josh (one line each)

1. Emergent's option a (backend only) or b (backend + the frontend diet in §2)? I recommend **b**.
2. Two workers per pod (§3): memory per pod roughly doubles. Yes or leave as is? I recommend **yes**.
3. Ask Emergent support where the production database runs relative to the app pods; if not the same region, ask them to move it. This is the biggest lever and needs no code. OK to ask them?
