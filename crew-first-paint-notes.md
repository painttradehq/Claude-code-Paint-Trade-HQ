# Crew app — the wrong screen for a second on opening (13 November) — FIX WRITTEN on the app repo's branch `claude/crew-first-paint`

Josh, 13 Nov, with a 9-second screen recording from his phone: *"Parking lot: when opening the crew app, there is a second that the screen is different than what it should be — investigate, explain and fix."*

## 1. What the recording shows

Frame by frame (60 fps recording, PTHQ Crew opened from the home screen):

| Time | On screen |
|---|---|
| 2.5 – 4.0 s | The app's splash (the P mark), fading with "Loading…" |
| **4.15 – 5.05 s** | **The wrong screen, about 0.9 s:** "Morning, Sajad" · TIME CLOCK a short card with a spinner · a **"Get buzzed for new jobs — Turn on alerts"** card · a **"TODAY'S JOB"** heading with nothing under it · INBOX **"You're up to date."** · no badge on the Inbox tab |
| 5.05 s on | The real screen: "Not on the clock / Sign in" · the alerts card **gone** · Today's job card · "UNREAD · 1 — Time to sign in" · badge 1 on Inbox. Everything below the greeting jumps |
| 6.2 – 7.3 s | Josh scrolling (the touch dot is visible) — not part of the problem |

So it is not another page flashing: it is the Today tab painted before its data arrived, with three parts saying things that are not true.

## 2. Why

1. **The alerts card** — `components/crew/CrewAlerts.tsx`. The hook starts with `on = false` and learned the truth only after `syncPush()` — which re-saves the phone's subscription to the server, a network call — had finished. For that long, a phone with alerts ON looked like one with alerts off, so the card that invites you to turn them on was drawn, then removed.
2. **"You're up to date."** — `app/employee/(tabs)/_layout.tsx` + `dashboard.tsx`. The notifications store had no "loaded" flag; an empty list before the first answer and an empty list after it were the same thing, so the empty line showed while the request was still out. The tab badge has the same source.
3. **"Today's job" with nothing under it** — `dashboard.tsx`. The heading was drawn at once, its card only when the jobs list had answered.
4. **The jump** — the clock card is ~70 px tall while it spins and ~250 px once it knows; with the alerts card leaving and the job card arriving at the same moment, the whole column moves.

## 3. The fix (branch `claude/crew-first-paint`, one commit on top of GitHub `main` `8e14989`)

- `CrewAlerts.tsx` — the hook reads **this phone's own subscription first** (local, a few milliseconds) and does the server re-save afterwards in the background; a new `known` flag keeps the card off the screen until that first read is in. The Me tab's alerts switch uses the same hook and gets the truth sooner too.
- `(tabs)/_layout.tsx` — the notifications store gets `loaded` (true after the first answer or failure, cleared on sign-out).
- `(tabs)/dashboard.tsx` — the cards **wait for the three first answers** (clock status, jobs list, inbox) and then appear together in their real state; meanwhile the greeting shows with one small spinner under it. Never longer than 4 seconds: on a slow connection the screen then shows what it has, with "Checking your inbox…" instead of "You're up to date." and no job heading until the jobs are in.

Three files, 25 lines added, 12 removed. `tsc --noEmit` clean apart from the one error already on `main`. **Not run on a phone here** — there is no backend in this chat; the confirmation is the same recording again after it is published: splash → greeting with a spinner → the real screen, no alerts card, no "You're up to date." with unread mail, no jump.

## 4. Two things to know

- **The crew-files rule.** Two of the three files are under `app/employee/*`, which by Josh's standing rule belong to the crew chat. This was written here because Josh asked this chat for the fix, and it sits on **its own branch**, merged nowhere. Nothing else pending touches those files (`claude/fix-round-j` and Emergent's recent commits are all admin-side), so it merges cleanly whenever Josh says. The crew chat should be told the Today tab's first paint changed.
- **Going live** rides the same sequence as the bug-fix branch: Josh's Save to GitHub → I merge `claude/fix-round-j` and (on his word) `claude/crew-first-paint` into `main` → Emergent picks `main` up → Publish.

## 5. Not done, on purpose

Opening straight onto yesterday's data (keep the last Today answers on the phone and refresh behind them) would remove even the spinner. It is a bigger change with a stale-data question (a clock card that says "signed in" from this morning), so it is left as an idea, not built.
