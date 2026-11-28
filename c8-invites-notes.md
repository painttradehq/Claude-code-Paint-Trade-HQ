# C8 — Invites and the first sign-in (prototype v0, 28 Nov 2026)

Prototype only. Nothing here has gone to Emergent; Round C7 is still building there. This file is for Josh: what the prototype shows, what is live today (checked against `main` at `a71a8f3`, 28 Nov), and the decisions the round needs before a brief is written.

## 1. What the prototype shows

Open `c1-crew-shell.html` at 390 × 844, then 360 × 800.

| Deep link | Screen |
|---|---|
| `?screen=invite-mail&kind=added` | The email a crew member gets when the owner adds them (branded proposal; the live one is plain text) |
| `?screen=invite-mail&kind=join` | The email or text with the join link (proposal; today the link is a QR code and a copy button only) |
| `?screen=onboarding&step=1` | About you — street address and suburb instead of the emergency contact (live since 2 Nov; the prototype was behind) |
| `?screen=onboarding&step=5&agree=1` → Join | Done → Sign in (live) |
| `…&autosignin=1` → Join | Proposal: the join signs you in; the done screen offers **Set a PIN** |
| `…&gate=1` → Join | Proposal: the approval gate; "Thanks, Mia. Josh needs to approve you…", **Done** |
| sign in with a password | **Set a 4-digit PIN** → "Type it once more" → Dashboard (live since the PIN round; the prototype was behind). "Not now" skips |
| `?pindevice=1` | A phone with a PIN opens on the pad: "Hi Mia", "Enter your PIN to clock on.", "Use my password instead". Wrong PIN → "Wrong PIN · 4 tries left"; five wrong → the password form with the live line |
| `?error=pending` | Proposal: a sign-in before approval |
| `?screen=app&tab=today` | The Dashboard with the alerts card (live since 2 Nov; the prototype was behind). × dismisses; **Turn on alerts** → "Turning on…" → gone. `&alerts=0` hides it |

Catch-up items (no round work, the prototype now matches live): address fields, "You'll need: licence / white card / home address", the one-link agreement "I've read and agree to the Crew notice.", the PIN screens, the alerts card.

## 2. Live today — the two ways in

**Path A, the join link.** The owner shows a QR code or copies a link (`/employee/onboarding?admin=…&code=…`). The crew member fills the wizard (About you, photo, documents, agreement) → `POST /employees/register` creates an active account at once → Done → Sign in → types the email and password again → Set a PIN → Dashboard.

**Path B, the owner adds them.** The owner enters name, email, phone (address optional) and a temporary password → an email goes out → the crew member signs in with the temporary password → "Finish setting up" (details, new password, photo, documents, agreement) → Go to Today → Set a PIN → Dashboard.

The email today, word for word:

> Subject: Your Paint Trade HQ login — {business}
> Hi {first}, {business} has added you to Paint Trade HQ. Open the app: {url}/employee/login. Login: {email}. Temporary password: {password}. Log in, finish your details and upload your documents.

No logo, no owner's name, no reply-to, the temporary password in clear. The owner's own sign-up email (`services/welcome_email.py`) already has a branded layout the crew email can reuse.

Facts that shape the decisions:

- `register` returns `{id, name, email}` and no token, so the crew member types the credentials twice (once to create them, once to sign in).
- There is no approval state. Anyone holding the link joins instantly; the only gate is the code, which the owner can rotate.
- SMS goes through the owner's own Twilio (Settings → SMS Hub). Not every business has it on, so email is the channel that always works; a text is a bonus where the hub is on.
- The join link has no send at all: no email, no text. The screen that would send it lives under `app/admin/*`, which the crew chat never touches.

## 3. Gaps and proposals

| # | Gap | Proposal | Who builds |
|---|---|---|---|
| 1 | The owner-added email is unbranded and shows no owner | The email in the prototype: from "{business} via Paint Trade HQ", three numbered steps, **Open the crew app** (lands on the sign-in with the email filled), reply-to the owner, footer "Sent by Paint Trade HQ for {business}". The temporary password stays in it; the finish step depends on it | Crew chat (backend `POST /employees`, the template) |
| 2 | The join link cannot be sent | A backend route that emails (and texts, where the hub is on) the join link with the prototype's wording; the owner's button for it is admin-side | Crew chat builds the route and the template; **admin chat** wires the button |
| 3 | Credentials typed twice after "Join the team" | After `register` succeeds the app signs in with what was just typed (`/employees/login`), stores the token, and the done screen offers **Set a PIN** instead of **Sign in**. Frontend only | Crew chat |
| 4 | Anyone with the link joins instantly | An approval gate: `register` marks the account pending, the done screen says so, a sign-in before approval gets the pending line, the owner is emailed "Mia asked to join", and approving sends Mia an email. The Approve button is admin-side | Crew chat (register, login, the two emails); **admin chat** (the Approve button, the pending badge on the crew list) |
| 5 | No "resend the invite" for an owner-added member | Admin-side only | Admin chat |

Proposals 3 and 4 do not combine for the same person: a pending account cannot be signed in. With the gate on, the join ends at "Thanks, Mia."; with it off, at "You're on the team" and the PIN.

## 4. Decisions for Josh

1. **Approval gate** — on for every business, off, or a switch in Settings (admin side)? My recommendation: a switch, default **off** at launch so a QR on the wall keeps working the day a new starter arrives, and the owner turns it on if the link gets around. If you want it on by default, say so and the default flips.
2. **Auto sign-in after the join** — yes or no? My recommendation: yes. It removes one screen and a second typing of the password, and it leads straight into the PIN.
3. **Email wording** — the two emails in the prototype as written, or changes? Note the join email says "The link is for {business}'s crew — please don't forward it."
4. **Temporary password in the email** — keep (today), or replace with a set-your-password link? Keeping it is the smaller round; the link is the safer one and would retire the "Enter the temporary password from your email" step. My recommendation: keep for C8, park the link.
5. **Sequence with the admin chat** — proposals 2, 4 and 5 each need an admin-side piece. The crew round can ship its halves first (the routes return 404 to nothing; the button comes later), or wait. My recommendation: ship the crew halves in C8 and hand the admin chat a list.

## 5. If the decisions go my way, Round C8 is

Small. Backend: the branded owner-added email, the join-link send route and its template, and (gate off by default) the pending field, the login line and the two gate emails behind the switch. Frontend: auto sign-in after `register` with the **Set a PIN** done screen, and the pending done screen. Tests: the email bodies never carry anyone else's data; the pending account cannot sign in; `register` + auto sign-in lands on `set-pin`. No change to the PIN screens, the alerts card or the wizard fields — they are live.

## 6. Test ids added by the prototype

`crew-pin-login`, `crew-pin-hello`, `crew-pin-pad`, `crew-pin-input`, `crew-pin-box-0..3`, `crew-pin-error`, `crew-pin-use-password`; `crew-set-pin`, `set-pin-title`, `set-pin-pad`, `set-pin-input`, `set-pin-error`, `set-pin-skip`; `crew-mail`, `crew-mail-back`, `crew-mail-meta`, `crew-mail-body`, `crew-mail-card`, `crew-mail-subject`, `crew-mail-cta`, `crew-mail-note`; `crew-onb-address`, `crew-onb-suburb`, `crew-onb-pending`, `crew-onb-setpin`; `crew-alerts-card`, `crew-alerts-title`, `crew-alerts-on`, `crew-alerts-dismiss`. Removed: `crew-onb-emergency`, `crew-onb-privacy` (the agreement has the one link).

Prototype suite: 608 checks, 304 per viewport, all passing at 390 × 844 and 360 × 800 (shell md5 981ce619cc41a193bdf0496c8f447a47, 240,310 bytes).
