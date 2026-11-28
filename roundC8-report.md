# Round C8 — verdict (28 Nov 2026, read from `main` at f237013; the C8 commits are cd2a0e2 and 11e75f5)

**ACCEPTED, with one open line that my spec caused.** The diff is exactly the brief's rule-1 list: ten code files (`services/crew_invite_email.py` and `tests/test_c8_crew_invites.py` new; `routes/employees.py`, `routes/employees_v2.py`, `services/crew_app_settings.py`; `app/employee/onboarding.tsx`, `project/[id].tsx`, `(tabs)/_layout.tsx`, `(tabs)/inbox.tsx`, `(tabs)/dashboard.tsx`), nothing under `app/admin/*`, no env change, no new package. The saved shell and brief on main match the hashes sent (981ce619…, ba0eab43…); the v0 notes and the duplicate shell are gone.

Read by me from the diff:

- **Emails**: five pure templates on the welcome shell, every interpolated value escaped, links passed in as parameters; the crew mails carry no owner email and the join mail no password; `names_for` is the one rule for the business and the owner's first name (profile, then account, then "the team" / empty). "Join the crew" replaces the button label for a dotted business name.
- **Owner-added send** (`create_employee`): the new template, `reply_to=reply_to_for(owner)`, `business_name` only when it is a real name. The agent marked the reply-to and from-name "Unverified at runtime"; the code passes both (`routes/employees.py`, the send line), and its dry-run screen check got `invite_emailed: true` on an https origin.
- **Join** (`register_employee`): `pending_approval` + `requested_at` only when the switch is on; the owner's email in a catch-all that never fails the join; the response gains `pending` and `owner_first`.
- **Sign-in gate** (`employee_login`): one 403 line after the password check, before the red-flag check; no token for a pending account.
- **Approve**: tenant-scoped read (404 for another business, a missing or a removed row), idempotent, the email wrapped.
- **Send route**: validation, the hourly count (20), the send wrapped into the 502 line with nothing recorded, the hub's 400s passed through, `$push` with `$each` and `$slice`.
- **Setting**: `invites.require_approval`, default false, validated as a bool, returned to the admin page; `for_crew` unchanged.
- **Frontend**: the join signs in with what was typed and falls back to today's **Sign in** on any failure; three done states; the job page fetches the scope on its own; `TabHeader above`; the weather pill.
- **Tests**: five, with both environment branches written out for the send route; settings restored by snapshot; TS_ rows deleted in `finally`. `pytest --collect-only` 1,715.

## Open

1. **`tests/test_c5_crew_documents.py::test_02` is red because of this round**: it asserts the register response is exactly `{id, name, email}`; C8 adds `pending` and `owner_first`. My spec did not put that file on the touch list; the agent rightly left it and said so. One line to change — `roundC8-followup-note.md`, waiting for Josh's "send".

## Notes

- The screens were checked by the agent's harness and the testing agent re-running it, at both sizes; the screenshots are not on GitHub, so they are **not seen by eye here**.
- The hours comparison (C7 carry-over) is a weak proof: both figures were 0 h 00 m on the seed. Recheck on a phone pass with real hours.
- Not exercised: a real SMS, a team member without `crew_edit` on the new routes, the sign-in failing after the join.
- Housekeeping the agent reported: it deleted, by owner id and after checking that owner no longer existed, the rows of a TS_ tenant orphaned by its own interrupted baseline run (14 collections), and one stray `TS_` customer from the morning's admin round. TS_ rows left: 0. Reported honestly; accepted.
- Silences 2–9 accepted as decided (the no-owner-name wordings, the small negative margins on the back link inside the header, the extra `crew-onb-pending-done` id, the `sends` cap, the seed's "TS_" first name).
- Emails and the join link are built from the server's `APP_PUBLIC_URL`; on the preview that is the deployed host. Unchanged behaviour, worth one look after the next publish.
- The admin halves (spec §10) are untouched and now have routes to call.

---

# The agent's report, verbatim (`memory/reports/roundC8-invites-report.md`)

Round C8 done

# Round C8 — Invites and the first sign-in (28 Nov 2026)

Brief `memory/specs/crew/c8-round-message.md` (33,067 bytes, md5 ba0eab43…), spec `memory/specs/crew/c8-invites-notes.md`, prototype `memory/specs/crew/c1-crew-shell.html` (md5 981ce619…, the one shell; the v0 notes copy deleted). Commit `cd2a0e2`.

Screen checks ran on TS_ Alpha only, through a dry-run test server (nothing sent), iPhone user agent, 390 × 844 first, then 360 × 800. The owner's tenant was not signed in to or written.

## Verify (§6) — testing agent `iteration_c8.json`, both sizes

| # | Item | 390 × 844 | 360 × 800 |
|---|---|---|---|
| 1 | Owner-added: email goes (dry run) with the new subject; rendered mail shows three steps, the temporary password, the button; the button opens the sign-in with the email filled | agent-tested | agent-tested |
| 1 | `send_email` called with `business_name` and `reply_to` | confirmed by reading the code (`routes/employees.py`), not by a stub or log line — **Unverified at runtime** | same |
| 2 | Join, gate off: "You're on the team, {first}." + **Set a PIN** → PIN → Dashboard, no second password; later password sign-in works; the dup box as before | agent-tested | agent-tested |
| 3 | Join, gate on: "Thanks, {first}." + **Done**; no token; the pending line at sign-in; approve → `{ok, emailed}`; sign-in works; setting restored | agent-tested | agent-tested |
| 4 | Send route: email 200, the `sends` row, the dry-run line; sms → the hub's 400 line | agent-tested | agent-tested |
| 5 | C7 carry-overs (below) | agent-tested | agent-tested |
| 6 | Tests, suite, teardown, `app/admin/*` diff empty, nothing published | see below | |

Rendered emails (from the template functions, opened at 390 wide, all fit): `test_reports/c8_owner_added.html`, `c8_join.html`, `c8_pending_owner.html`, `c8_approved.html`; shots `c8_{390,360}_mail_*.jpeg`. Screens `c8_{390,360}_*.jpeg`, results `c8_{390,360}.json`, harness `c8_ui.py`.

## What changed

- **Backend:** new `services/crew_invite_email.py` (four emails, the text, `names_for`); `routes/employees.py` (`create_employee` send block, `register_employee`, `employee_login`, `approve_employee`); `routes/employees_v2.py` (`send_invite_link`); `services/crew_app_settings.py` (`invites.require_approval`, default off); new `tests/test_c8_crew_invites.py`.
- **Frontend:** `app/employee/onboarding.tsx`, `project/[id].tsx`, `(tabs)/_layout.tsx` (`above`), `(tabs)/inbox.tsx`, `(tabs)/dashboard.tsx` (the pill).
- **New routes (two):** `POST /employees/invite-link/send`, `POST /employees/{id}/approve`.
- **Env changes:** none. **Deleted files:** none in the app (the superseded v0 notes and the duplicate shell under `memory/specs/` only). **`app/admin/*` diff:** empty.
- **What's new:** draft #47 has a 15th card, "A better welcome for new crew". Not published.

## Tests

`pytest --collect-only`: `tests/test_c8_crew_invites.py` 5 collected, 5 pass. Whole tree: 1,715 collected (1,710 before), with the same 3 collection errors before and after (three files that seed at import).

Full suite, 4 chunks with a 25 s pause:

| | Before | After |
|---|---|---|
| Chunk 1 | 1 failed, 377 passed | 3 failed, 375 passed |
| Chunk 2 | 1 failed, 378 passed, 61 errors | 1 failed, 367 passed, 61 errors |
| Chunk 3 | 24 failed, 346 passed, 4 errors | 22 failed, 362 passed, 4 errors |
| Chunk 4 | 33 failed, 401 passed, 1 error | 32 failed, 405 passed |

New reds after, checked one by one:
- `test_c5_crew_documents::test_02_register_ok_and_login_trim` — **caused by this round.** It asserts the register response is exactly `{id, name, email}`; the brief adds `pending` and `owner_first`. The file is not on the round's list, so I left it red (see silences).
- `test_crm_omni_comms_slice1::…empty_comms_graceful` — an AI-wording test; red on the pre-change tree too when run alone.
- Four `test_tenant_isolation` tests — order noise: run alone, the same three tests in that file are red before and after, and none of the four new ones.
- Gone after: 9 (xero, outlook, one tenant-isolation) — also noise, not this round.

## C7 carry-overs

- Job page with the scope request failing: the job title and "The work" show, no scope rows, no error.
- Inbox: the back link is passed as `above`; the negative-margin wrapper and the insets arithmetic are gone. Back link at x 14, y 12; title 4 px below it; no sideways scroll.
- Weather: a pill (1 px border, 999 radius, 4 × 10 padding), test id on the pill; no pill when the forecast is unavailable.
- A notification with no route of its own lands on `/employee/inbox`; the Dashboard badge clears after Mark all read.
- Operations "My hours" row equals the hours screen's week total (both 0 h 00 m on the seed — equal, but a weak proof).
- With the panel open, a tap where a tab sits only closes the panel.

## Housekeeping

TS_ rows left: 0. Settings row restored by snapshot. Two leftovers I cleaned by ID after checking their owner no longer existed: rows of a TS_ tenant orphaned when I interrupted my own first baseline run, and one stray `TS_` customer from earlier today.

## Spec silences (for the owner)

1. **`test_c5` now fails** on the exact-keys assertion. One line in that test needs the two new keys; say so and I'll change it, or the admin chat can.
2. **Join email and text with no owner name on file:** §3 gives no wording. I used "You're invited to join the {business} crew on Paint Trade HQ."
3. **Owner email on a pending join with no owner name:** opens "Hi,".
4. **Inbox back link:** to keep it where C7 had it, the link carries small negative margins (left −6, top −4, bottom −6) inside the header. "The same left padding" taken literally would sit it 6 px further right.
5. **Done button test id:** I added `crew-onb-pending-done` (not in §9) so the button can be tapped in tests.
6. **Send route `sends` count** is capped at 50, as the list is.
7. **Links in the dry-run emails** were built from the environment's own `APP_PUBLIC_URL` (the deployed host, https), not the preview origin I passed; the rendered files use the preview origin. The wizard was opened on the preview with the invite's own admin and code.
8. **Seed names:** the TS_ owner's first name is literally "TS_", so screens read "Thanks, TS_." — the rule applied to seed data.
9. **Not exercised:** a team member without `crew_edit` on the new routes; a real SMS send; the sign-in failing after the join (the fallback to **Sign in** is in the code, not driven on screen).
10. **Handover to the admin chat:** §10 of the spec, unchanged.
