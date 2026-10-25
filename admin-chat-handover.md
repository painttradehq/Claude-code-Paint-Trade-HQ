# Items for the admin chat (from the crew rounds C5, D and the 23 Oct reviews) — 25 Oct 2026

Paste into the admin chat as its next small round or parking lot. Nothing here touches `app/employee/*`.

## Settings › Crew app
1. **A third radio "Ask them first"** — "Outside the distance the crew member is asked 'Sign in anyway?' and the answer is recorded" — writing `signin.rule: "ask"`. The backend accepts it since Round D (`services/crew_app_settings.py` `RULES`); until the radio exists no owner can pick it. The help text should also say a sign-out is never refused under Refuse it (recorded and flagged; only Ask asks at sign-out).

## Timesheets › Person drawer
2. A confirmed sign-in reads **"Off-site sign-in · {dist} from the job · confirmed by {first name}"** (today's string plus the suffix when the session row's `confirmed` is true).
3. A sign-out off site adds the line **"Signed out {dist} from the job"** (from `sign_out_outside_radius` / `sign_out_distance_from_site_m`, now on every session row). The CSV export has no sign-out distance (add a column if wanted).
4. A confirmed sign-in **without a position** (`location.address: "No GPS"`, `confirmed: true`): a string for it, e.g. "No position · confirmed by {first name}".

## Equipment (after C6 lands)
5. A red **"Problem"** pill on an item row and the drawer banner with `problem_reported {at, by_name, text, photo_url}`; the History event "Problem reported by {name}: {text}" with the photo; **clear `problem_reported` in `PATCH …/condition`** (setting the condition is the owner's "dealt with it").

## Training
6. The admin summary and `watched_count` filter on `is_active` (never set) instead of `deleted`, and count the owner's bridge row as crew (`training.py:134, 301`) — one-line fixes.

## What's new
7. Drafts n 26 (C5), n 27 (D) and n 28 (F) are waiting, unpublished; n 27 should not publish before item 1 exists.

## Platform hygiene and legal
8. 101 `private_files` rows whose `owner_admin_id` is no longer an admin (`estimate_media` / `update_picture`, 14–25 Oct tester runs): a cleanup for the storage tools.
9. Crew logins are not recorded in `admin_sessions` (`employee_login` never calls `create_session`), so a crew password reset cannot sign out other devices. Record them (source `employee_login`) when convenient.
10. Rating, problem and daily-report photos are 7-day signed URLs with no re-sign: store the blob path and sign on read (one round for all three).
11. **SMS Sender ID Register**: from 1 July 2026 a branded SMS sender name must be registered with the ACMA through the SMS provider (Twilio) or phones show it as "Unverified". Before any branded crew SMS.
12. **privacy.md gaps for crew** (lawyer): §3 names only welcome emails, not the crew emails the app sends (temporary password, documents to sign, countersigned copy, password codes); §9's "Reply STOP" reads as if crew service messages are opt-out; the acceptance record is listed under business sign-up, not crew; §1 puts crew in both "account holders" and "people in a business's records"; §2's crew list does not name the police check (sensitive information) or the working-with-children check. Also the crew notice (`content/legal/crew-notice.md`, 1.0-draft) and the IP in the acceptance record (optional) are for the lawyer.
