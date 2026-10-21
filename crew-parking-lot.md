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

## Decisions and options (18 Oct)

**Geofence: Josh picked (b) soft block.** *(21 Oct: prototyped and specified as Follow-up D — `c3-followup-d-notes.md`; sign-in and sign-out; waits on the Round 79 field names.)* To build as a short crew follow-up after C5 (it touches the clock card, `routes/timeclock.py` and one line of the owner's drawer): outside the radius the card shows **"You're {dist} from the job. Sign in anyway?"** with **Sign in anyway** / **Cancel**; the record stores `off_site_confirmed: true`; the owner's Timesheets drawer reads "Off-site sign-in · {dist} from the job · confirmed by {first name}" (admin chat, one string). Two sub-choices for Josh: **(b1)** ask at sign-in only (as the geofence runs today) or **(b2)** measure sign-out too and ask the same there; and for **no GPS**: ask **"We can't find your location. Sign in anyway?"** (recommended — keeps the Privacy Policy promise) or refuse.

### Options to improve the rest

**Push (C7)**
1. **Web push for the installed crew app** — Android Chrome now; iPhone only when the app is added to the Home Screen (iOS 16.4+). No store, no accounts. The C7 default.
2. **Native push through Expo** — reliable on every phone, needs the store build (C8). C7 can ship the backend token route so C8 only adds the phone side.
3. **SMS fallback via Twilio** for the two that must land: a document to sign and the clock reminders. Costs per message; needs the Twilio sender set up.
4. **Which events**: the three that exist (document sent or reminder, equipment outcome, daily-report reply), the clock reminders, plus two that have no notification today — **"You're on a new job"** when the owner assigns them, and **"Your document was countersigned"**. Recommendation: 1 + the token route from 2 + the two new events; 3 later if crews miss things.

**The owner-adds-employee flow**
1. The invite email's link opens the crew sign-in with the email filled in — one tap instead of typing.
2. **Replace the temporary password with a one-time sign-in link**: the crew member taps it and lands in the finish wizard, sets their own password there; no password in an email. Safer and simpler. Needs a token route and an expiry (7 days).
3. **Invite by SMS** (Twilio) as well as email — painters read texts, not email. Same link.
4. The owner's Team page shows "Invited · not finished" with **Resend invite** (admin chat). Recommendation: 2 + 3 as the invite round (crew + admin chats together), 4 with it.

**One general QR vs one per person**
1. **Keep the general QR, add owner approval**: a new registration waits as "Pending approval"; the crew member sees "Waiting for {business} to approve you" and nothing else; the owner approves from the Team page. Stops strangers with the poster from joining.
2. **Per-person invites**: the owner adds the person (name, phone or email) and sends them their own link or QR; the registration attaches to that record. With the option above this becomes **one flow with two doors**: a personal invite for known hires, the general poster QR for walk-ups (with approval). The temporary password disappears.
3. Expire the general code after 30 days or after N uses (owner setting). Recommendation: 1 + 2.

**Copy and send the QR**
1. **Send invite** from the dialog: SMS (Twilio) or email (Resend) with the link.
2. **Download QR** (PNG) and a **printable A4 poster** "Join {business} on Paint Trade HQ Crew — scan to start" with the business name and the QR.
3. On a phone, the owner's share sheet (`navigator.share`) for the link. Recommendation: all three; small admin round.

**The welcome settings card (video + notes)**
1. **Plain pages** as prototyped: a YouTube link (unlisted is fine), a title, an intro, ordered sections with lines. Simplest; no storage.
2. **"Must read" sections**: the owner marks sections as must-read; the crew member taps **Got it** on each (recorded as `welcome_acknowledged_at`, the way coaching notes are); the owner sees who has read what. Gives Josh's "importance".
3. **Uploaded video** instead of YouTube: storage and bandwidth on the platform; later, if YouTube is a problem for owners.
4. A short **welcome note** from the owner in their own words at the top of the first step. Recommendation: 1 now (C5 + the admin card), 2 as a follow-up once owners use it; 4 is cheap and can ride the admin card.

### Suggested order
C4 report → C5 (documents) → the soft-block follow-up → C6 (learn and gear) → C7 (push + the two new events) → the invite round (one-time link, SMS, approval, per-person, send/poster; crew + admin chats) → C8 (store). The admin chat's small rounds alongside: the welcome card, Send invite + Download QR.

## Josh's decisions, 18 Oct (the plan from here)

1. **Flagged sign-in** (Josh: call it "flagged", not "soft block"): outside the radius the phone asks **"You're {dist} from the job. Sign in anyway?"**; the sign-in stays flagged off site for the owner, and the record notes the crew member confirmed. **Sign-out measured and asked the same way** (b2). No GPS: the same question with "We can't find your location." A short crew follow-up straight after C5; one string in the owner's drawer (admin chat).
2. **Push**: web push for the installed crew app (Android now, iPhone once on the Home Screen) — **after the rounds are checked and working**, C7. Native push via Expo: explore later (C8). **No SMS fallback.** Events: the existing three, the clock reminders, plus **"You're on a new job"** and **"Your document was countersigned"**.
3. **Invite round (both chats)**: the invite link opens the sign-in with the email filled; a **one-time sign-in link replaces the temporary password** (tap → the finish wizard → set a password); invites go by **SMS and email**; the owner's Team page shows "Invited · not finished" with **Resend invite**. Until then C5's finish path uses the temporary password.
4. **Poster QR + owner approval**: a registration from the general QR waits as **"Pending approval"**; the owner is asked **in the app (a pop-up on screen) and by push on their phone when the app isn't open**. (Admin push is the admin side of C7's backend.) Per-person QR codes: **not needed**.
5. **Send invite** by SMS or email from the Invite dialog, **Download QR** and an **A4 poster** with the business name: yes, one small admin round.
6. **A welcome note** in the owner's own words at the top of the first onboarding step: yes — in C5 (`crew_welcome.note`, shown as "A note from {first name}") and on the admin card.

**Order:** C4 report → C5 → flagged sign-in follow-up → C6 (learn and gear) → C7 (web push + token route, the two new events, admin approval push) → the invite round (one-time link, SMS + email, approval, Resend) → C8. Admin-chat rounds alongside: the Crew welcome card (note, video, title, intro, sections), Send invite + Download QR + poster, the "Invited · not finished" row.


## 21 Oct — five more items, checked

**1. Weather on the crew app.** The admin home's weather strip is Open-Meteo (free, no key), one reading per suburb that has a live project, fetched by `services/dashboard_home.weather_areas` and cached; the business location is the fallback. The crew app has none; the daily report's weather chips are typed by hand. **Option:** Today's job card gets one line "{emoji} {temp}° · {condition} · {rain}% rain" for the job's suburb (the same helper, a crew route `GET /weather/today?project_id=`), and the daily-report weather chips are preselected from it (the crew can change them). Rides the flagged-sign-in follow-up or C6. Recommendation: yes, both. *(21 Oct: both prototyped in Follow-up D — the Today line and the report chips — `c3-followup-d-notes.md` §4.)*

**2. The address finder.** It is Google Places Autocomplete through the backend (`/geo/suggest`, session-based, biased to 50 km around the business, from 3 characters), so it already guesses as you type — when `GOOGLE_PLACES_API_KEY` is set. Without the key, `/geo/status` says "not configured" and the field is plain text: nothing comes up unless you type the whole address yourself, which matches what Josh saw. The job pin's fallback geocoder (Open-Meteo) is suburb-level and exact. **Check:** is the Places key set on the preview and on production? If it is and the box still needs the exact address, the admin chat looks at the field; if it is not, setting the key is the fix. (Item 5 below.)

**3. The crew-side settings page (admin chat, Round 79 — built 21 Oct).** From the job's trajectory: Settings › Crew app with the owner's decisions "50 m default, 30 m minimum, rule flag; invites stay on Employees; video by upload only"; `app/employee/*` untouched; "the routes the crew will call are built here"; spec `memory/specs/round-79-crew-settings.md`, prototype `memory/specs/round-79/settings-crew-app.html`, report `memory/reports/round-79-report.md`; the old `gps_radius_m` in Operations is no longer written. **For the crew chat:** C5's welcome content (§6) must use Round 79's fields and routes, the video is an uploaded file (played with `expo-av`, installed, not YouTube), and the flagged-sign-in follow-up reads the new distance and rule. I need the Round 79 spec text (Josh pastes it, or says the word and I ask the job for it).

**4. Onboarding from the very beginning — the rule set** (also in `c5-documents-notes.md` §4):
- A new starter opens the owner's link or scans the poster QR → the link is checked → Welcome (the owner's note, video, "You'll need") → About you → Photo → Documents → Our team → Agree → Done → Sign in. (Later: "Pending approval" before the first sign-in.)
- The owner adds the person first (temporary password now; a one-time link later) → the invite email → they sign in → the same wizard in finish mode (details, new password, photo, documents, Our team, Agree) → Today.
- **Both at once** — the owner added them and they also scan the QR: registering stops at Join with "That email is already on {business}. If {owner} added you, sign in with the password from your email and finish setting up there." and a Sign in button; signing in sends them to the finish wizard. The other way round (they registered, then the owner tries to add them) the owner's Add says "Employee with this email already exists" (as built, admin side).
- Nothing in the app lets two records exist for one email.

**5. Connectors on the preview and the published app.** Not checkable from this chat; it is a platform check. The 14 Oct production deploy verified Resend (a real send). Unknown on production: Google Places (`GOOGLE_PLACES_API_KEY`), Google Drive / Calendar OAuth (client id, secret, redirect URIs), Twilio, Stripe, the GCS bucket for documents. **Recommendation (admin chat):** a Settings › Connections card that shows each provider as Connected / Not set up per environment, read from the server (key present + a test call), so Josh sees it without asking. Until then the admin chat asks the job for a one-off "connections status" readout on preview and production.
