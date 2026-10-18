# Crew app — parking lot (checked against the code, 18 Oct 2026)

Josh's items from 18 Oct, each checked against the clone (commit `dae9a2f`) and the C1–C5 reports. "Today" = what is live after C3; C4 is building; C5 is specified, not sent.

## 1. Do crew get notifications on their phone?

**No push exists.** There is no push-token registration anywhere (frontend or backend; grep `push_token`, `expo-notifications`: nothing). Every "notification" to the crew is a row in the `notifications` collection that the phone shows when it opens Today or the Inbox (C1 polls on open). The three triggers that write such rows: a contract issued or a reminder (`contract_sent`, `contract_reminder`), an equipment request outcome, a daily-report reply (`daily_report_feedback`). The daily-report route says it in a comment: "the crew app has no push-token registration yet, so there is nothing to send to; in-app only" (`routes/daily_reports.py:502`). The 8 AM / 4 PM clock reminders are also in-app rows.

**Plan:** C7 (handover §7) — `expo-notifications` + `expo-device` on the phone, a token route on the backend, the three existing triggers plus the clock reminders sent as push; web push for the installed web app on Android and on iOS 16.4+ when added to the home screen. Nothing before C7 reaches a locked phone.

## 2. Is GPS tied to sign-in and sign-out, and is sign-in limited to the site?

**Tied, yes. Limited, no — by your own decision in C3.** What C3 built (live): the phone takes one position at sign-in and one at sign-out; the sign-in carries the job's id, the backend measures the distance from the job's pin and compares it with the radius; a sign-in further than the radius is **recorded and flagged "off site"** with the distance, shown to the crew member in amber ("820 m off site · Further than 100 m from the job. Your hours still count; your employer sees the distance.") and to you in Timesheets (chip, banner, drawer). It is never refused. On 13 Oct you chose option **3a "allow + show + flag"** over "block" for C3.

Radius today: the owner's setting `gps_radius_m` (default **100 m**, in Settings › Operations), or a per-job `geofence_radius_m` on the job; a job with the per-job value set to "none" has no geofence.

**Sign-out: no geofence.** The sign-out stores the position raw and does not measure the distance (`routes/timeclock.py:193–225`). Only the sign-in is checked.

What you asked for on 18 Oct — **crew can only sign in (and out) within about 10–30 m of the site** — is a change on two counts: block instead of flag, and sign-out checked too. Two facts to weigh before deciding:
- Phone GPS is typically accurate to 5–20 m outdoors and 20–50 m or worse inside a house, under a roof or between buildings. A hard 10–30 m block will refuse real sign-ins from inside the job and from the street outside a deep block; a 50–100 m block rarely does.
- A crew member with no position (permission denied, no fix) signs in today as "No GPS" (your Privacy Policy promise). A hard block would have to refuse them, or let them through unverified — which is the flag model again.

**Options, one line to pick:** (a) keep allow + flag (as built); (b) **soft block**: outside the radius the sign-in asks "You're 820 m from the job — sign in anyway?" and records the answer and the distance (the owner still sees it flagged); (c) hard block at the owner's radius, sign-out too, with "No GPS" refused. Radius stays the owner's setting (you can set it to 30 m yourself today). Whichever you pick is a small C-round or rides C6/C7.

## 3. The patterns: how a crew member comes into the app

### 3a. The owner adds the employee (Team › Add)
1. The owner fills name, role, employment type, email, phone, a **temporary password** (generated or typed, at least 8 characters) and ticks "send invite" or not.
2. The backend creates the record with `onboarding_complete: false`, `agreed_to_terms: false`; if "send invite" was ticked, an email goes to the crew member: "{Business} has added you to Paint Trade HQ. Open the app: {app}/employee/login. Login: {email}. Temporary password: {password}. Log in, finish their details and upload your documents." (The email carries the password in clear text; that is as built.)
3. The crew member opens `/employee/login` (or `/crew`), signs in with the temporary password.
4. **Today:** they land on Today straight away and can never change the temporary password (no route exists); the owner sees them as "Pending onboarding" until they edit their own profile — and the Profile screen today can wipe their documents on save. **After C5:** the crew layout sends them to the onboarding wizard in "finish" mode: Welcome with your video, details to confirm (email read-only), temporary password + new password, photo, documents, your team page, the Terms/Privacy tick, "I'm done" → Today. The owner then sees them as onboarded with their documents.
5. From then on the normal app. **No "forgot password"** for crew exists (and the owner cannot reset one); C5 adds "Change password" on Profile; a reset-by-email is a later round.

### 3b. The crew member scans the QR or opens the link (self-registration)
1. The owner opens Team › **Invite link** (one dialog): it shows a QR code and the link `{app}/employee/onboarding?admin={business id}&code={code}`, with **Copy** and **New link** (rotates the code; the old link stops working) and the line "New starters scan this or open the link, fill in their details and land on your team as Pending."
2. **One code per business, not per employee.** The link is general: anyone with it can register under that business until the owner rotates it. There is no per-employee QR and nothing ties a registration to a particular person the owner expected. (The employee page's "Copy invite link" action copies the same general link.)
3. **Today** the wizard opens on a welcome step with a video placeholder that cannot play, then personal details, photo, documents, a Sano-only "Team culture" page and a Sano-only "Employment agreement" with a typed signature that is thrown away; a dead link is only found out after the last step. **After C5:** the link is checked first (a dead link stops on one screen), the welcome shows **your business name, your video and your notes** (title, intro and sections — culture, values, an introduction of the company; empty until the owner's Settings card exists, except your business which is seeded with the current text), then details (15+), photo, documents, your team page, the Terms/Privacy tick, Done → Sign in.
4. They sign in with the email and password they chose; the owner sees them as onboarded with their documents and the Terms acceptance recorded.

### 3c. Creating, copying and sending the QR
- **Creating:** automatic — the first time the owner opens Invite link, the code is made; it stays until "New link".
- **Copying:** "Copy" copies the link text; the QR image is on screen to print or screenshot (no "download QR" button).
- **Sending:** there is **no send button** — no SMS, no email of the invite from the app. The owner pastes the copied link into their own text message or email. The "Email" and "Call" buttons on an employee's page open the phone's mail and dialler for that person, not the invite.
- **Parking-lot item (admin chat):** a "Send invite" action in the Invite link dialog — SMS via Twilio and email via Resend with the link, and a "Download QR" button for the poster. Small admin round.

### 3d. The owner's settings for the crew-side welcome (video, notes, their order)
Not built; never existed (the text was typed into the crew app's code). C5 adds the per-business field the phone reads and seeds your business; the owner's Settings card is the admin chat's paired item (brief in `c5-documents-notes.md` §7). Until it exists, other businesses show the wizard without a video or a team page.

## Open decisions for Josh
1. Geofence: (a) allow + flag (as built), (b) soft block with "sign in anyway?", (c) hard block, sign-out included. Radius value is yours in Settings either way.
2. Whether the admin chat's next small round is the crew-welcome Settings card plus "Send invite" (SMS/email) and "Download QR".
