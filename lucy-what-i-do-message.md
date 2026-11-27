# Lucy — her "what I can do" answer, updated and easier to read — SENT to Emergent 27 Nov on Josh's word ("send this"), with his own wording of two lines

Josh, 27 Nov, pasting her fixed answer: "This is an old default message to answer what can you do. Update it and make it a more readable format."

No prototype: it is words in a place that already exists. Read in the code (`51354c7`): the answer lives twice — the fixed answer in `ADMIN_SYSTEM_PROMPT` (`backend/ai_routes.py`) and `WHAT` in `frontend/components/lucy/LucyChat.tsx` — and every round has edited both. Her bubbles already draw bold, bullets and line breaks (`Md`); the two places `WHAT` is shown draw it as plain text.

Its Emails and Files lines are true only once round L4 is built. L4 was at its last step (the testing agent) when this went, so the message opens by telling Emergent to do it after L4 is finished and reported.

Josh's wording, 27 Nov: Quotes — "Create, send, or revise an accepted one"; Jobs — "Track expenses, variations, crew, product and materials". Sent with those two first words in lower case, to match the other seven lines.

---

## The message as sent

# Lucy — her "what I can do" answer, updated and easier to read

Josh: "This is an old default message to answer what can you do. Update it and make it a more readable format."

**Do this after Lucy L4 is finished and reported — not in the middle of it.** Words only — what she can do does not change. One commit.

## The new answer

Exactly this, with its line breaks, bold and bullets:

```
I’m your AI assistant in Paint Trade HQ. I’m here to smooth things out for you, take away the guesswork and keep you on top of your game.

**Ask me about your business**
Clients, leads, quotes, invoices, jobs, crew and the calendar — who’s on site, what’s owed, which quotes have gone quiet.

**Tell me what needs doing**
- **Quotes** — create, send, or revise an accepted one
- **Jobs** — track expenses, variations, crew, product and materials
- **Invoices** — raise, send, remind, record payments
- **Clients and leads** — add, update, log calls and notes
- **Calendar** — book jobs and visits, set reminders
- **Timesheets** — add or fix a crew session
- **Library** — keep items, tasks and products up to date
- **Emails** — read your inbox and write the reply
- **Files** — find a job’s files and photos, attach them

**You stay in charge**
I tell you what I did. Before anything is sent or deleted, I show you first and wait for your OK.

You can also ask me to remind you of things, or share an idea and we’ll explore it together.
```

## Where it goes

1. **One copy.** Keep the text in one place on the server and use it for both: the fixed answer in `ADMIN_SYSTEM_PROMPT` ("give it word for word, nothing added, no tools" stays), and `GET /api/ai/status` returns it as `what` for the panel. `WHAT` in `LucyChat.tsx` goes; the panel shows what the server sent.
2. **Drawn as her messages are.** In both places the panel shows it — under the line on an empty chat (`ai-what-text`), and in the bubble when there are messages — draw it with `Md`, left-aligned, so the bold and the bullets show. Today both are a plain `<Text>` and would show the asterisks.
3. **The lines follow what is on.** Nothing new: the answer is fixed, as today. (Her setup can turn an area off; she already says so when asked to act there.)

## Checks

Pure: the prompt carries the new text once; `/ai/status` returns the same string.

On screen with the testing agent, a TS_ admin, **1440 then 1024**:
1. "What can you do?" → the answer above, word for word: the two opening lines, three bold headings, nine bullets each starting with its bold word, the closing line. No asterisks or dashes showing. No chips under it.
2. ⋯ › What Lucy can do on an empty chat → the same text under the line, left-aligned, bold and bullets drawn; Hide takes it away. With messages in the chat → the same in its bubble.
3. Every bullet fits on one line in the 560 px panel; nothing runs off sideways in the 480 px one; the whole answer is readable without the typing box covering it.
4. "Who are you?" → her name answer, unchanged.

## Rules

As the rounds before: this change only — nothing from your own suggestion list; TS_ rows only, torn down after; Josh's own tenant read-only; no notices or banners; nothing under `app/employee/*`; no key, password or admin id in any reply. Add a section to `memory/reports/lucy-l4-report.md`. No What's new line — it is the same answer, tidied. Save to GitHub and Publish are Josh's clicks.
