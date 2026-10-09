# Lucy — the minimal chat box — Spec Notes for Emergent

Prototype: `lucy-chat-minimal.html` (open at 1440: the bubble bottom-right → the box → "What can Lucy do?" → ⋯ → Help → ← Lucy → ⋯ → Past chats → ⋯ → New chat → "Who's on site today?" → type "any new leads?" + Enter → + → Attach a photo → ⋯ → Lucy's setup; `?usage=high` shows the allowance line; then 1024). Playwright `tools/test_lucy_minimal.js` 48/48 at 1440 and 1024. Built on the A5 Part 2 box (`ai-chat-gear.html`); Lucy's setup panel, the Help content, past chats, reminders, ideas and every answer are unchanged — only the box's frame, welcome and composer change.

**Owner (9 Oct):** the box is too crowded and overwhelming, the typing box too small; make it minimal. Owner rules: nothing removed from what Lucy can do, only moved out of sight; every test id kept; no banners or notices; nothing changes outside the box; no mobile / crew-app work.

## 1. What changes, what stays

| Piece | Decision |
|---|---|
| Header (purple, avatar, "Lucy", business line, four icon buttons) | **Replace** with a white 52 px header: small cream avatar + "Lucy" · two buttons on the right: **⋯** (`tc-more`) and **×** (`tc-close`). The business line goes (it is in the sidebar). |
| Tab bar Lucy · Help | **Remove**. Help opens from the ⋯ menu; in Help the title reads "Help" with a **← Lucy** link (`tc-back`) on the left. The Help content, threads and the unread count are exactly as built; the count shows beside Help in the menu. |
| Past chats (clock), New chat (+), Lucy's setup (gear) | **Move** into the ⋯ menu (`tc-menu`: New chat · Past chats · Help · ― · What Lucy can do · Lucy's setup). Same ids and handlers (`ai-history-btn`, `ai-new-chat-btn`, `ai-settings`); the header buttons are gone. |
| Welcome: "Hi Josh, I'm Lucy…" + the explanation paragraph + seven chips | **Shrink**: one line "Hi {first name} — what do you want to know?" (22 px display), **four** quiet starters as a list with a → mark (`ai-starter-site/owed/calendar/quiet`: "Who's on site today?" · "What's owed?" · "What's on tomorrow?" · "Which quotes have gone quiet?"), and a small link **What can Lucy do?** (`ai-what`) that reveals the explanation paragraph in place (also reachable from the ⋯ menu). The reminder and idea chips go: Lucy already understands "remind me…" and "I've got an idea" typed in the box (A5 Part 2 §2); the setup panel keeps the reminder and idea lists. |
| Usage line "Claude · your key · 7,511 / 300,000 today" + bar | **Hide** until the day's allowance is at 80 % or more; then one line above the composer: "Today's allowance is nearly used up · 262,000 / 300,000" with the bar; at 100 % the existing "used up — resets at midnight" line. The full figure stays in Lucy's setup (`ai-usage-today`), its one home. |
| Composer: camera · folder · one-line input · send | **Replace** with one rounded box: a **+** button (`ai-attach-btn`) that opens a small menu with the existing Take a photo / Attach a photo rows (same ids `ai-camera-btn`, `ai-upload-btn`), the textarea (`ai-text-input`, placeholder "Ask Lucy…", **three lines tall, 15 px, grows to seven lines**), and the send button (`ai-send-btn`) inside the box. Enter sends, Shift+Enter adds a line (as today). The attach chip above the box is unchanged. |
| Body | White, 18 px padding; Lucy's bubbles lose their border (soft grey fill); the painter's bubbles stay accent purple. Messages, typing dots, sources line, history list and Help threads unchanged. |
| Box | 440 × 640 (max-height unchanged), 20 px radius. The bubble, drag behaviour (Round 68 E1) and the Escape / close behaviour unchanged. |

## 2. Verify (agent-tested / Unverified, then the testing-agent pass at 1440 and 1024)

1. Box opens from the bubble: white header with only ⋯ and ×, no tab bar, no business line; welcome = one line + four starters + "What can Lucy do?"; usage line absent; composer three lines tall with + and send inside.
2. "What can Lucy do?" shows the paragraph; again hides it. ⋯ lists New chat · Past chats · Help (count) · What Lucy can do · Lucy's setup; each does what it says; Help shows the title "Help" and ← Lucy returns.
3. A starter sends and Lucy answers as today; typing + Enter sends; the composer grows to seven lines and no further; + opens the two photo rows and attaching shows the chip.
4. With a tenant whose allowance is at 80 % or more the line and bar appear above the composer; below that, nothing; in Lucy's setup the figure is unchanged.
5. The help flow, past chats, reminders, ideas, Lucy's setup and the morning brief behave exactly as before (regression on the A5 Part 2 tests); crew app untouched; no console errors; suite green before and after; nothing created on any tenant beyond TS_.

What's new draft: title "A calmer Lucy", audience Admins & testers, Email as well = No, one card: "Room to type" · "Lucy's box is cleaner: a bigger typing space, four quick questions, and everything else behind the ⋯ menu." · picture: the open box at 1440. Draft only; report the id.
