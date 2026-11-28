# C8 — Invites and the first sign-in (spec v1, 28 Nov 2026)

Prototype `c1-crew-shell.html` (240,310 bytes, md5 981ce619cc41a193bdf0496c8f447a47) at 390 × 844, then 360 × 800. Live facts checked against `main` at 19ede01 (28 Nov, after Round C7). The five decisions in §8 were taken by Josh on 28 Nov ("send the latest work" on the recommendations); each is reversible.

## 1. What this round builds

Two ways into the crew app exist today; this round makes both land properly.

**A. The owner adds someone** (`POST /employees` with `send_invite`): the plain-text email becomes the branded one in the prototype (`?screen=invite-mail&kind=added`): from "{business} via Paint Trade HQ", three numbered steps, the temporary password, a button into the sign-in with the email filled, a reply-to that reaches the owner.

**B. Someone joins with the link** (QR or copied link → `/employee/onboarding?admin=…&code=…` → `POST /employees/register`):
- The join signs them in (`?screen=onboarding&step=5&agree=1&autosignin=1` → Join): the done screen reads "You're on the team, {first}." and offers **Set a PIN**; no second typing of the password.
- The link can be **sent** (new route, email or text): the email in the prototype (`&kind=join`). The owner's button for it is admin-side (§10).
- An **approval gate**, off by default, a business switch: with it on, the join ends at "Thanks, {first}." (`…&gate=1` → Join), the owner gets an email with a link to the person, a sign-in before approval gets one line (`?error=pending`), approving emails the person. The Approve button is admin-side (§10); the route is this round's.

Not this round, already live (the prototype caught up on 28 Nov): the wizard's address fields, the one-link Crew notice agreement, the PIN screens, the Dashboard alerts card. Nothing in them moves.

Also in this round, from the C7 verdict (§4.4): the job page survives a scope failure, `TabHeader` gets an `above` prop for the Inbox back link, the weather chip becomes the pill, and the four C7 items left Unverified are verified.

## 2. Live facts (main at 19ede01)

- `backend/routes/employees.py`: `_invite(admin_id, code)` :100 (an active `qr_codes` row `{kind: "invite", admin_id, code, active}`); `GET /employees/invite` :108; `POST /employees/onboarding/finish` :161; `POST /employees/register` :194 (the code check → 403 `INVITE_INVALID` :200; address and suburb required → 422 "Enter your street address and suburb."; dup email → 400 "An account with this email already exists. Sign in instead."; the doc built :215–245 with `onboarding_complete: True`; returns `{"id", "name", "email"}` — **no token**); `POST /employees` :252 (`create_employee`; the invite email block :305–317: subject `Your Paint Trade HQ login — {biz}`, an inline html with the login link and the temporary password in clear, `invite_emailed` recorded; `biz = current_admin.get("business_name")`); `GET /employees` :321 (returns the whole doc minus `password_hash` — a new field on the doc reaches the crew list with no change); `restore_employee` :547; `_crew_login_response` :678 (`crew_public` + token + the refresh pair); `POST /employees/login` :698–716 (401 "Invalid credentials"; the red-flag 403 :713–714 "Account access temporarily restricted. Please contact admin."; nothing else refuses).
- `backend/models/employee.py:41` `EmployeeCreate` (`send_invite: bool = False` :55; `emergency_contact` optional :46; `address`, `suburb_state_postcode` :51–52).
- `backend/routes/employees_v2.py`: `_app_url()` :120, `_active_invite(aid)` :124 (one active invite per business, created on first read), `GET /employees/invite-link` :132 → `{url: "{app}/employee/onboarding?admin={aid}&code={code}", …}`, `POST /employees/invite-link/rotate` :139. **No send of any kind.**
- `backend/services/email.py`: `business_from` :43, `html_to_text` :86, `_assert_safe_email` :183 (every link absolute https, anchor text must match its host — G3), `reply_to_for(admin_id)` :210 (the business profile email, else the owner's login email), `send_email(*, to, subject, html, reply_to=None, tenant=None, attachments=None, business_name=None)` :223 — with `business_name` the from name reads "{business} via Paint Trade HQ" on both providers; 503 "Email is not configured" when neither key is set; `OUTBOUND_DRY_RUN=1` (the test runner) logs and returns id `dry-run`.
- `backend/services/welcome_email.py:13` `welcome_email_content` — the branded shell to copy (560 px column, the #4B3E86 button, the muted #6B6660 small print).
- `backend/services/messaging.py:52` `send_sms(admin_id, to, body)` — the owner's own Twilio (Settings → SMS Hub); raises 400 "SMS Hub is not enabled. Configure Twilio in Settings → SMS Hub." or "Twilio credentials are incomplete." when it cannot send.
- `backend/services/crew_app_settings.py`: `DEFAULTS` :24–30 (`onboarding`, `features`, `signin`, `notifications`, `scope`), `validate_patch` :59–103 (one block per section; `SettingsError` → 400), `save` :105, `for_admin` :117; the routes `GET/PUT /admin/crew-app-settings` (`routes/crew_app_settings.py` :29/:34).
- `backend/auth.py:133` `get_current_employee` (admins 403). `routes/crew_pin.py`: `POST /employees/pin-login` needs a device row, which only a signed-in crew member can create — a pending account can never reach it.
- `frontend/app/employee/onboarding.tsx`: `send()` :108–128 — the register call :120–121 then `go(5)`; the finish path calls `login({...user, onboarding_complete: true})` and `refreshCrewSettings()` :117–118; `toLogin` :131 (the sign-in with the email as a param); the done view :226–232 (`testID="crew-onb-done"` on the container; the title and lead by `finish`; **Go to Today** → `getPinDevice()` ? dashboard : `/employee/set-pin`; **Sign in** → `toLogin`). `getPinDevice` (`utils/crewPin.ts`), `login` (`store/authStore.ts:45`) and `api` are already imported.
- `frontend/app/employee/login.tsx`: `handleLogin` :57–68 shows the server's `detail` on any error :65 — a new 403 line needs no frontend change; after a password sign-in a phone without a PIN device goes to `/employee/set-pin` :63.
- `frontend/app/employee/_layout.tsx`: `/employee/onboarding` is in `OPEN`; a signed-in user on an OPEN path is not redirected; the edge clock is not mounted on OPEN paths.
- Admin side (not touched this round, cited for §10): the invite dialog `frontend/components/employees/EmpDialogs.tsx` :80–90 (QR + the link; `GET /employees/invite-link`, `/rotate`); the crew list `app/admin/employees.tsx` (`/admin/employee-detail?id={id}` :154); `GET /employees/summary` (`employees_v2.py:67`) builds its own rows.
- Tests: Round 43 fixtures `admin_a, admin_a_office, crew_a, crew_a_new, crew_b, admin_b, seed` (`seed["tenant_a"]`); `from seed import _db`; services import as `from services.x import y` (`test_crew_signup_audit.py:7` does it); the chunked suite with the pause; `PTHQ_TEST_PORT`. `test_crew_signup_audit.py` adds TS_ crew through `POST /employees` with `send_invite: False` and deletes the rows in `finally`.
- Round C7 (19ede01): `project/[id].tsx` `load` fetches the job and the scope in one `Promise.all`; `(tabs)/inbox.tsx` draws the back link above `TabHeader` with a negative margin; `(tabs)/dashboard.tsx` renders the weather as a plain `Text` in `kickerRight`; `TabHeader` (`(tabs)/_layout.tsx`) has `kicker, title, right, kickerRight, below`.

## 3. Strings (exact)

**Owner-added email** — subject `Your {business} login on Paint Trade HQ`. Body: "Hi {first}," · "{owner_first} has added you to {business}'s crew app." · 1. "Open the crew app." · 2. "Sign in with **{email}** and this temporary password: **{temp}**. It works until you set your own." · 3. "Check your details, set your password and add your licence and white card — about five minutes." · button **Open the crew app** → `{APP_PUBLIC_URL}/employee/login?email={email, url-encoded}` · footer "Sent by Paint Trade HQ for {business}. Reply to this email to reach {owner_first}." With no owner name on file: "{business} has added you…" and "…to reach {business}".

**Join email** — subject `Join {business} on Paint Trade HQ`. "Hi {first}," (or "Hi," with no name) · "{owner_first} has invited you to join the {business} crew on Paint Trade HQ." · button **Join {business}** → the invite url · small "It takes about five minutes: your details, a photo, your driving licence and white card. The link is for {business}'s crew — please don't forward it." · the same footer.

**Join text (SMS)** — `{owner_first} has invited you to join {business}'s crew on Paint Trade HQ. Join here: {url} — about five minutes. The link is for {business}'s crew only.`

**Owner email on a pending join** — subject `{name} asked to join {business}`. "Hi {owner_first}," · "{name} ({email}, {phone}) filled in the crew wizard with your join link and is waiting for your OK." · button **Review and approve** → `{APP_PUBLIC_URL}/admin/employee-detail?id={employee_id}` · small "They can't sign in until you approve them. Approving emails them straight away." · footer "Sent by Paint Trade HQ."

**Approval email** — subject `You're in, {first} — {business} on Paint Trade HQ`. "Hi {first}," · "{owner_first} has approved you. Sign in with **{email}** and the password you created." · button **Open the crew app** → `{APP_PUBLIC_URL}/employee/login?email=…` · the standard footer.

**Login, pending** (403): `Your account is waiting for {owner_first} to approve it. We'll email you when you're in.` ({owner_first} = the first word of `admins.owner_name`, else "your employer".)

**Done screen, signed in**: title `You're on the team, {first}.` lead `You're signed in on this phone. Set a PIN so you can clock on with four digits.` button **Set a PIN**. **Done screen, pending**: title `Thanks, {first}.` lead `{owner_first} needs to approve you before you can sign in. We'll email {email} when you're in — usually the same day.` button **Done** (outline). **Done screen, sign-in failed after the join** (rare): today's copy and **Sign in**.

Send route errors: 422 `Enter an email address.` / `Enter a mobile number.` / `channel is email or sms`; 429 `Too many invites in an hour — try again later.`; the SMS hub's own 400 lines pass through unchanged. Settings: 400 `require_approval is true or false`.

## 4. Frontend (`app/employee/*` only)

### 4.1 `app/employee/onboarding.tsx`
- `send()`, the register branch: keep the call; read `r.data.pending`. If true → `setPending(true)`. Else try `const l = await api.post('/employees/login', { username: f.email.trim(), password: f.password }); await login({ ...l.data, role: 'employee' }); refreshCrewSettings(); setSignedIn(true);` — on any error leave `signedIn` false (the done screen falls back to today's **Sign in**). Then `go(5)` as today. The finish branch is unchanged.
- The done view (step 5, not finish): three states per §3. **Set a PIN** → `router.replace(((await getPinDevice()) ? '/employee/(tabs)/dashboard' : '/employee/set-pin') as any)` (the same expression Go to Today uses). **Done** → `toLogin()`. Test ids: `crew-onb-done` stays on the container; the title gets `crew-onb-done-title`; `crew-onb-setpin`, `crew-onb-pending` (the pending title), `crew-onb-signin` as today.
- `{owner_first}` on the done screen = `invite.owner_name.split(' ')[0]` (already fetched at open), else "Your employer".

### 4.2 C7 carry-overs
- `app/employee/project/[id].tsx` `load`: fetch the job first and set it; fetch the scope in its own try/catch (`setScope(null)` on failure). The page renders with "The work" and no scope rows when the scope call fails; the job's own 404/500 copy is unchanged.
- `(tabs)/_layout.tsx` `TabHeader`: add `above?: React.ReactNode`, rendered first inside the header (before the kicker row, the same left padding). `(tabs)/inbox.tsx`: pass the back link as `above`; delete the wrapping `View` with the negative margin and the `insets` arithmetic. Test ids unchanged (`crew-inbox-back`).
- `(tabs)/dashboard.tsx`: the weather `Text` becomes the pill from the prototype's `.wx-chip`: a `View` with `borderWidth: 1, borderColor: t.colors.border, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10, maxWidth: '55%'` around the 13 px text; `testID="crew-today-weather"` moves to the `View`.

## 5. Backend

### 5.1 `services/crew_invite_email.py` (new)
Pure functions, each returning `(subject, html)` with the §3 words, the shell copied from `welcome_email_content` (560 px column, #4B3E86 button, muted small print): `owner_added(*, first, business, owner_first, email, temp_password, login_url)`, `join_link(*, first, business, owner_first, url)`, `pending_owner(*, owner_first, business, name, email, phone, review_url)`, `approved(*, first, business, owner_first, email, login_url)`, and `join_sms(*, business, owner_first, url) -> str`. Links are built from `APP_PUBLIC_URL` as the existing invite block does (G3 needs absolute https); `html.escape` on every interpolated value. No other module's data: the crew member's mail never carries the owner's email; the join mail never carries a password.

### 5.2 `POST /employees` (`routes/employees.py` :305–317)
Replace the inline html with `owner_added(...)`; `owner_first` from `(await _business_profile_for(aid))["owner_name"]` first word (`routes/pdf.py:29`), `business` from the same profile's `business_name`; send with `reply_to=await reply_to_for(aid)` and `business_name=biz`. `invite_emailed` and the try/except stay as they are. No change to the request model.

### 5.3 `POST /employees/invite-link/send` (`routes/employees_v2.py`, after `/rotate`)
Admin (`get_current_admin`). Body `{channel: "email" | "sms", to: str, name: str | null}` (a small pydantic model in the file). `url` from `_active_invite(aid)` exactly as `invite_link` builds it. `email` → `join_link(...)` via `send_email(to, subject, html, reply_to=await reply_to_for(aid), business_name=biz)`; `sms` → `send_sms(aid, to, join_sms(...))` (its own 400s pass through). On success push `{"to", "channel", "name", "at", "by": aid}` onto the invite doc's `sends` (`$push` with `$slice: -50`) and return `{"sent": true, "channel", "to", "sends": <count>}`. Before sending, count `sends` in the last hour; at 20 → 429 (§3). 422s per §3 (`to` must contain "@" for email; digits for sms). A crew token → 403 (the dependency does it).

### 5.4 The approval gate
- `services/crew_app_settings.py`: `DEFAULTS["invites"] = {"require_approval": False}`; `validate_patch` gains a block: `inv = body.get("invites")`; if a dict with `require_approval`, it must be a bool (else `SettingsError("require_approval", "require_approval is true or false")`) → `sets["invites.require_approval"]`; `for_admin` returns `"invites": s["invites"]`; `for_crew` unchanged.
- `register_employee` (:194): after the invite check, `s = await cas.get_settings(admin_id)`; when `s["invites"]["require_approval"]`: `employee_doc["pending_approval"] = True`, `employee_doc["requested_at"] = now`. After the insert, in a try/except that never fails the join: email the owner with `pending_owner(...)` to `await reply_to_for(admin_id)` (skip when None), `review_url = {APP_PUBLIC_URL}/admin/employee-detail?id={employee_id}`; set `owner_notified_at` when it went. The response gains `"pending": bool` (the three existing keys stay).
- `employee_login` (:698): after the password check and before the red-flag 403: `if employee.get("pending_approval"): raise HTTPException(403, detail=<§3 line>)` with `owner_first` from `admins.owner_name`.
- `POST /employees/{employee_id}/approve` (admin; `routes/employees.py` next to `restore_employee`): the row must belong to the caller (`owner_admin_id`), else 404. Already approved → 200 `{"ok": true, "already": true}`, no email. Else `$unset pending_approval, $set approved_at, approved_by`; email `approved(...)` to the crew member (`reply_to_for`, `business_name`); set `approval_emailed_at` when it went; return `{"ok": true, "emailed": bool}`.
- Refusing is the existing `DELETE /employees/{id}`; no new route. `GET /employees` already carries `pending_approval` (§2).

### 5.5 Tests — `tests/test_c8_crew_invites.py` (Round 43 fixtures; `TS_` rows only, deleted in `finally`; the owner's `crew_app_settings` row restored by snapshot, never `$unset`)
1. The five template functions, in process: exact subjects; the html carries the first name, the business and (owner-added) the email and the temporary password, (join) the url; `html_to_text` holds no "None"; every `href` starts with `https://`; the join mail carries no password and the crew mails carry no owner email.
2. `POST /employees` with `send_invite: true` on a fresh TS_ email → 2xx; `invite_emailed` is a bool (true under the dry run, false where email is unconfigured); the doc otherwise as today.
3. `POST /employees/invite-link/send`: email → 200 and the business's invite doc's `sends` grew by one with `channel: "email"`; sms with the hub off → 400 with the hub's line; `channel: "fax"` → 422; `to: "x"` for email → 422; crew → 403; tenant B's invite doc untouched.
4. The gate: default off → `register` returns `pending: false` and `/employees/login` → 200 at once. Set `invites.require_approval` true (`PUT /admin/crew-app-settings`): a second `register` → `pending: true`, the doc has `pending_approval: true` and `requested_at`; `/employees/login` → 403 with the exact line; `approve` as `admin_b` → 404; as `admin_a` → 200 `{ok, emailed}`, `pending_approval` gone, `approved_at` set; login → 200; `approve` again → 200 `{already: true}`.
5. `PUT /admin/crew-app-settings {"invites": {"require_approval": "yes"}}` → 400; `GET` shows `invites.require_approval` false by default.

Count from `pytest --collect-only`.

## 6. Verify (testing agent, 390 × 844 first, then 360 × 800, iPhone UA, TS_ Alpha; the owner's tenant read-only)

1. **Owner-added**: as the TS_ owner add a TS_ crew member with `send_invite`; render the email html (the dry run logs; write the html to `/app/test_reports/c8_owner_added.html`) and open it at 390 wide: the from line is the business via Paint Trade HQ in the provider payload, the subject, the three steps, the temporary password, the button; the button's link opens `/employee/login` with the email filled.
2. **Join, gate off**: the TS_ join link in the phone browser → the wizard → Join the team → "You're on the team, {first}." with **Set a PIN** → the PIN screen → the Dashboard, no password typed a second time; sign out; sign in with the password works. The Already-on-the-team dup path still reads as before.
3. **Join, gate on**: set the TS_ owner's `invites.require_approval` true (the PUT) → a second TS_ join → "Thanks, {first}." + **Done** → the sign-in shows the pending line → approve through the route → the approval email rendered at 390 → sign in works. Setting restored; both TS_ members deleted.
4. **The send route**: email and sms through the API as the TS_ owner; the join email rendered at 390; the sms refused with the hub's line (the TS_ tenant has no hub).
5. **C7 carry-overs**: the job page with the scope route failing (stub the request in the harness) still shows the job; the Inbox back link and header unchanged to the eye at both sizes; the weather pill with a border; a notification tap route lands on `/employee/inbox` and the Dashboard badge follows Mark all read; the Operations hours sub equals the hours screen's big number; no chip when the forecast is unavailable; a tap where a tab sits while the panel is open only closes it.
6. **Tests** green (count from `pytest --collect-only`); the full suite before and after (chunked, with the pause); TS_ torn down (0 rows); `app/admin/*` diff empty; no `rm -rf` outside `memory/tmp` and `/tmp`; nothing published.

## 7. What's new — Draft (never published)

Card title **A better welcome for new crew**. Text: "The email a new crew member gets when you add them now carries your business name, three short steps and a button into the app. Someone who joins with your link is signed in straight away and asked to set a PIN." (The join-link send, the approval switch and the Approve button are admin-side work; the admin chat extends this card when they land.)

## 8. Decisions (taken 28 Nov; reversible)

1. **Approval gate**: a business switch `invites.require_approval`, default **off** — a QR on the wall keeps working the day a new starter arrives; the owner turns it on if the link gets around.
2. **Auto sign-in after the join**: yes — one screen fewer and straight into the PIN.
3. **Email wording**: as in the prototype and §3.
4. **The temporary password** stays in the owner-added email; a set-your-password link is parked.
5. **Sequence**: the crew halves ship now; the admin chat gets §10.

## 9. Test ids

New: `crew-onb-done-title`, `crew-onb-setpin`, `crew-onb-pending`. Unchanged: `crew-onb-done`, `crew-onb-signin`, `crew-onb-join`, `crew-inbox-back`, `crew-today-weather` (now on the pill).

## 10. Handover to the admin chat (not this round)

- The invite dialog (`components/employees/EmpDialogs.tsx`): **Send by email** / **Send by text** fields calling `POST /employees/invite-link/send`; show the last sends from the doc.
- Settings › Crew app: the switch **Approve new crew before they can sign in** (`invites.require_approval`, via the existing PUT).
- The crew list and the person's page: a *Waiting for approval* badge from `pending_approval`; **Approve** (`POST /employees/{id}/approve`) and **Refuse** (`DELETE`); check `/employees/summary` passes `pending_approval` through.
- An admin Inbox row on a pending join (the email exists from this round).
- Resend invite for an owner-added member (the temporary password is not stored; a resend means a new one — admin-side design).
- Extend the What's new card (§7) when those land.
