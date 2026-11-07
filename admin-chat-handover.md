# Admin chat — handover (written 7 November 2026)

For a new session of the admin/web chat. Everything the chat needs is in this repository (`painttradehq/Claude-code-Paint-Trade-HQ`, branch `claude/build-request-xufpxo`); the app's code is `painttradehq/the-newest-update-of-PTHQ` (private; the session must be started with it selected). The crew chat has its own branch, `claude/zealous-gauss-wx3xn1`, with the same rules; its handover is `crew-app-handover.md` on that branch.

## 1. Who and what

Josh Sano (the owner; app login `painting@joshsano.com.au`, service and Drive account `software@joshsano.com.au`, this chat's account `forpainters@joshsano.com.au`). Paint Trade HQ: a painting-business web app (Expo / React Native Web + FastAPI / MongoDB) built by Emergent (job `b55b8df9-f0c5-41c7-80d1-f174b2874432`, slug `pthq-replica`; live at painttradehq.co; preview `pthq-replica.preview.emergentagent.com`). This chat writes specs and prototypes, Josh reviews, Josh says "send", the chat sends the round to the Emergent job, Josh says "check", the chat reads the result and logs it. Josh publishes. Nothing in the app is reachable from the chat's container (the preview and the live app are blocked); Josh pastes outputs.

## 2. Standing rules (Josh's; keep every one)

1. Nothing goes to Emergent without Josh's "send". Housekeeping answers inside a round and checks on his "check" are fine. Emergent's suggestion lists are never taken without his word.
2. One round at a time across both chats (same Emergent job). Check the job is stopped before sending.
3. Every frontend design is prototyped here first (self-contained HTML), verified with Playwright at 1440 then 1024, reviewed by Josh, then specified. Backend-only rounds need no prototype.
4. Simple and practical. No notices or banners, no duplication, no guess work in specs ("keep as built" or the exact value). Every panel opens on the right.
5. AI = Claude only, through the app's own key. No AI and no Lucy for crew. Help hub content is Adam's.
6. Isolation per business; TS_ test rows only, torn down; the owner's real tenant read-only in rounds (sanctioned one-off writes only by Josh's own click, e.g. the Storage card). No backfill.
7. Do not change anything beyond what was asked. **This chat never touches `app/employee/*`; the crew chat never touches admin files.**
8. Never paste or echo secrets (Anthropic, Resend, Google, Places, Stripe, webhook secrets, GitHub tokens, `MONGO_URL`). Josh must never paste a key into the chat; if one lands, it is rolled.
9. Every round message carries a What's new **Draft** (never published; publishing is Josh's call). Round messages end with "Round N done", a report file under `memory/reports/`, no code review, no next-action items.
10. Test keys on the preview only, live keys on the published app only. No security audit or code review unless Josh says.
11. Commit and push this repository after every change; no untracked files left.

## 3. Where things are

- `round11-results.md` — the running log, newest at the bottom. Read the last two headings first.
- `admin-remaining.md` — what is left, by state (ready to send, built waiting for publish, on hold, Josh's own list).
- `notes-triage-7nov.md` — Josh's 28 notes of 7 Nov sorted into Round 87 (fixes), design rounds 88–92 and crew items, with his answers.
- `fix-round-h-notes.md` — Round 87, ready for "send" (Josh said "wait" on 7 Nov until the repository can be read).
- `round{N}-message.md` — the messages as sent; `*-notes.md` — the specs; `*.html` — the prototypes; `tools/` — their Playwright checks; `lawyer/` — the legal pack; `platform-steps.md` — connections and keys (names only).
- Speed work (Rounds 84–86, closed 25 Oct): `speed-research-notes.md`, `speed-fixes-notes.md`, `presentation-images-notes.md`. Live dashboard 10,094 ms → 270 ms.

## 4. State on 7 November

- Published: Rounds 74–86. Emergent also built, at Josh's direct prompting in November: crew sign-up audit, crew app audit, crew notification audit, crew Web Push, "admin adds crew document types" (unpublished on 7 Nov). What's new drafts 23–29+ unpublished.
- Open: Round 87 (waits); the design rounds in `notes-triage-7nov.md` §B in order; the crew chat's Follow-up E and the Today's-jobs bug; trade accounts (admin half here, crew half there); Jay's reply on `support@painttradehq.co`; the lawyer's drafted reply (in the software@ Gmail drafts); the launch-phase legal review before any paid plan; DMARC (later); the database region ticket (optional now).
- GitHub: Emergent's Save to GitHub has been broken since 24 Oct (OAuth stuck on the second account `forgaiinters-source`); the code reached `main` once by a 7-day token (expired ~31 Oct). The app repository must be readable by the chat's session (Claude GitHub App on `painttradehq` with that repository selected) and `main` must be pushed again before the code can be checked against Josh's notes.
