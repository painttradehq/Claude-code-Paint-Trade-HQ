# Lucy sends the app's own completion report — SENT to Emergent 28 Nov on Josh's word ("send the completion report one too"), as Part D behind the three parts

Josh, 28 Nov: "Please check the completion report. Lucy made me one and sent it, but it's an email format. I wanted it to be a PDF attached — a completion report with all the details of completion and colours and photos, preferably a before and after photo, similar to a presentation but for finishing a job."

## What the code shows (app repo `14df5fb`)

**The app already has that report** (Round 14) — on the job page, the **Completion report** button:

- a cover ("Your … is finished", client, dates, crew), **What we did** room by room with coats and colours (no prices), **Before & after** pairs side by side, **More of the finished work**, **Changes along the way** (approved variations), **Warranty & looking after your paintwork** with **Colours used** and where, an invoice summary (off unless ticked), and a **How did we do?** review button;
- the window lets the owner tick sections, pick photos, edit the message, Preview, Download PDF, Send to client;
- sending emails the client the message, an **Open your report** link and **the PDF attached**, saves the PDF in the job's folder, marks the job Done, and holds back the automatic review request for a day (`routes/project_photos.py`, `services/pdf.render_completion_report_pdf`, `components/project/photos/ReportModal.tsx`, the client's page `app/report/[token].tsx`).

**Lucy has no ability for it.** Nothing in her list or the connector's reaches the completion report, so when asked for one she wrote an email of her own with `send_email`.

**No prototype:** the report and its window exist; Lucy's card is the send card she already uses for a quote (To, Subject, message, an attached line, the green/red checks box, a fix button).

If Josh wants the report itself to look different — more like the presentation — that is a design job with a prototype, after he has looked at what is there (job page › Completion report › Preview).

---

## The message as sent (it went with a Part D heading, the shared rules, and one addition to Part A's side-by-side: a third column from run C — Sonnet 5.5 at default effort)

# Lucy sends the app's own completion report

**Josh's rules, first:** no test runs on his account — not signed in to, not read, not written; every database read carries the TS_ business's own filter; seed only through the dry-run server; TS_ rows only, removed after; nothing leaves.

Josh: "Lucy made me a completion report and sent it, but it's an email format. I wanted it to be a PDF attached — all the details of completion and colours and photos, preferably a before and after photo."

The app's own report (job page › Completion report) is exactly that, and Lucy cannot reach it, so she wrote an email by hand. This round gives her the app's report. The report, its window and its PDF do not change. One commit.

## 1. One read — `get_completion_report`

Lucy-only (not in the connector's REGISTRY), under Jobs. Give the job; it answers from the same place the window reads (`get_completion_report` in `routes/project_photos.py`): whether it has been sent, to whom and when; the client's email; how many areas, before/after pairs, other after photos and approved variations it would carry; which sections are on; the message as it stands.

## 2. One send — `send_completion_report`

A send like `send_quote`: Lucy-only, in `SENDS`, always its own card, never a step of `do_steps`.

- **Takes:** the job; `message` only when the owner asked for different words; `invoice: true` only when the owner asked for the invoice summary. Sections and photos otherwise stay as the window has them (its defaults when never opened).
- **Runs:** the route the window's Send button runs (`send_completion_report`), so everything it does today still happens — the client's email with the link and the PDF attached, the copy in the job's folder, the job marked Done, the review request held back, the line on the job's activity.
- **The card** — the send card she uses for a quote:
  - title **Send the completion report for {job}**, or **Resend the completion report for {job}** when one has gone;
  - To: the client's email on the job. Subject and message: what the route will send;
  - the attached line: "Completion report PDF attached, link inside · {n} before/after pairs · {m} more photos";
  - a **Preview** that opens the report as the client will see it (`/report/{token}?preview=1`, as the window's Preview does);
  - the checks box: red and not sendable with "No email on file for {client}" and a fix button to the client; a plain line "Sending marks this job Done" when it is not Done yet; a plain line "No after photos on this job — the report goes without photos" when there are none.
- **After it goes:** her usual line, and the next-step button she already offers after a job is finished, if any.

## 3. Her instructions

Add to `ADMIN_SYSTEM_PROMPT`, in her own style: a completion report is the app's own — read it with `get_completion_report`, send it with `send_completion_report`; never write one as an email. When the job has no after photos, say so before the card and ask whether to send without. Before/after pairs and photo choices are made on the job page (Photos, and the Completion report window) — say where.

Add **Completion report** to her "what I can do" answer on the Jobs line: "**Jobs** — track expenses, variations, crew, product and materials, send the completion report".

## Checks

Pure / in-process:
1. `send_completion_report` is a card whatever the ask-first switch says; it is refused as a step of `do_steps`.
2. Another business's job → not found, no card.
3. The card's To, Subject and message are what the route sends; `message` replaces the words only; `invoice: true` turns that one section on.
4. A second press on Send it sends once.

On screen with the testing agent, a TS_ admin, **1440 then 1024**, dry run:
5. "Send the completion report for the TS_ job" on a job with two paired photos → the card as above; Preview opens the report with the pairs side by side and the colours; Send it → her line; the job reads Done; the job's activity has the line; the job's folder has the PDF.
6. The same on a job with no after photos → she says so first; told "send it anyway", the card carries the plain line and sends.
7. A client with no email → the red box and the fix button; nothing sends.
8. "Write a completion report and email it to the client" → she uses the same card, not `send_email`.
9. "What can you do?" → the Jobs line as above, on one line in the 560 px panel.

## Rules

This round only — nothing from your own suggestion list. No change to the report, its PDF, its window or the client's page. No notices or banners. Nothing under `app/employee/*`. No key, password or admin id in any reply. Report: `memory/reports/lucy-completion-report.md`. What's new **Draft** (never publish) — one line on the Lucy card of draft #47: "Ask Lucy to send a job's completion report — the client gets the PDF with before and after photos, as from the job page." Save to GitHub and Publish are Josh's clicks.
