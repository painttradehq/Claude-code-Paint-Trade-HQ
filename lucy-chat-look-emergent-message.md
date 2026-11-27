# Lucy — the chat is a plain conversation (look only) — SENT to Emergent 27 Nov on Josh's word ("send the brief")

Josh, 27 Nov, with a screenshot of the empty chat: "Let's improve the look and feel of the chat. Remove the Lucy face from inside the chat, and also remove the ability titles so it's just a conversational chat. However having a short sentence in there is good — you come up with one."

**Where it stands:** Josh uploaded the latest `lucy-operator.html` to Emergent himself (27 Nov 02:27 UTC, with the one word "here"). Emergent downloaded it, listed what differs from the saved prototype, changed nothing, and asked: "Do you want me to build these into the app as they stand, or is there a written brief to go with it?" This is that brief.

Written against `components/lucy/LucyChat.tsx` and `components/tester/HelperPanel.tsx`. Josh pressed Save to GitHub before it went (`51354c7`, round 3): the empty chat, the faces, the placeholder and the menu are the same there as in round 1, so the brief matches the code Emergent is working on.

Prototype checks: `tools/test_lucy_operator.js`, 230 of 230 at 1440 × 900 and 1024 × 768.

---

## The message as sent

# Lucy — the chat is a plain conversation (look only)

This is the brief for the `lucy-operator (8).html` Josh uploaded. His words: "Remove the Lucy face from inside the chat, and also remove the ability titles so it's just a conversational chat. However having a short sentence in there is good."

Save the upload over `memory/specs/lucy/lucy-operator.html` and this message beside it as `lucy-chat-look-message.md`.

**Look only.** What Lucy can do, her tools, her cards, her setup and her system prompt do not change. Two files: `components/lucy/LucyChat.tsx`, and one menu row in `components/tester/HelperPanel.tsx`. One commit.

## 1. An empty chat

`ai-welcome` becomes two lines, in the middle of the empty chat — centred across and up and down:

- **"Hi {firstName}."** — the display font, 30 px.
- under it (`ai-line`): **"Ask me anything, or tell me what needs doing."** — 15 px, the secondary text colour.

Taken out of it: the face (`lucy-face-welcome`); every row (`ai-starter-*` — the four questions, Start a quote for…, Add to a job…, Remind me…, I've got an idea, and the tester's Report a problem); the "What can Lucy do?" link.

"What Lucy can do" in the ⋯ menu stays as it is. On an empty chat its text shows under the line, left-aligned, with the Hide link (`ai-what-text`, `ai-what`). With messages in the chat, as today.

## 2. Her messages

- No face beside her messages, and none beside the three dots while she works — `lucy-face-msg` is gone from both. Her bubble stays on the left with its 92 % limit and takes the width the face used.
- The face in her header (`tc-avatar`) and on the round button that opens her stay, with their moods as now.

## 3. The typing box

The placeholder reads **"Message Lucy…"** in place of "Ask Lucy, or tell her what to do…". "Lucy is off" stays.

## 4. ⋯ menu — "Report a problem", testers only

One row above "My reports" (`tc-menu-report`, testers only): it opens Lucy's chat, closes Past chats and puts "Report a problem: " in the box with the cursor after it — what the removed row did, through the same `prefill` the "About FB-…" button uses. What happens after it is sent is unchanged.

## Not to build

The scripted small talk in the prototype — "Hey Josh. What do you need?", "This is the prototype — there is no AI behind it…" and the like. You read it right: it is there only because the prototype has no AI behind it. In the app Lucy is Claude and answers whatever is typed, in her own words. No fixed replies are added.

## Checks

On screen with the testing agent, a TS_ admin, **1440 then 1024**:

1. An empty chat shows "Hi {name}." and the one line, in the middle. No face, no rows and no "What can Lucy do?" link inside the chat. The typing box says "Message Lucy…" and is on screen.
2. The face is in her header and on the round button. `lucy-face-welcome` and `lucy-face-msg` are nowhere on the page — on an empty chat, with messages in it, and while she is working.
3. "hey" → she answers with a short greeting in her own words: not a list of what she can do, no chips of areas under it.
4. ⋯ › What Lucy can do on an empty chat → the text shows under the line; Hide takes it away. New chat returns to the two lines.
5. A tester: ⋯ › Report a problem → the box holds "Report a problem: " with the cursor in it; the fault typed and sent is logged as today. ⋯ › My reports opens the list. Not a tester: neither row is there.
6. A reopened past chat, a send card, a red delete card and an answer with its Open buttons look as before apart from the face; nothing runs off sideways in the 480 px panel.
7. A screenshot of the empty chat and of a short conversation at each width in the report.

## Rules

As the rounds before: this change only — nothing from your own suggestion list; TS_ rows only, torn down after; Josh's own tenant read-only; no notices or banners; nothing under `app/employee/*`; no key, password or admin id in any reply. Add a section to `memory/reports/lucy-l3-report.md`. Add one line to What's new draft #47 (never publish): "Lucy's chat is simpler — open her and just type." Save to GitHub and Publish are Josh's clicks.
