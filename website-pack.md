# Website pack — what to hand the website builder (24 October 2026)

Everything the website needs exists now. The pictures and clips are in Josh's GitHub repo **`painttradehq/the-newest-update-of-PTHQ`**, branch **`main`**, as of commit `2b18339`. The repo is private, so a builder cannot fetch from GitHub by link unless Josh gives it access; the simple way is **download, then upload** into the website chat.

## 1. The files, where they are

| What | Where (in the app repo, branch `main`) | Notes |
|---|---|---|
| **47 screenshots** of the real app | `memory/marketing/screens/` — `01-login-1440.png` … `44-completion-report-390.png` (admin at 1440, some at 1024; crew and client pages at 390) | PNG, light theme, demo business "Harbourline Painting" |
| **8 walkthrough clips** | `memory/marketing/clips/` — `01-signin-to-job-drawer.webm` … `08-lucy-client-to-morning-brief.webm` | WebM, 25–45 s, no sound; every browser plays WebM. If the builder insists on MP4, send me the files and I convert them |
| **One zip of all of it** | `memory/marketing-captures-2026-10-23.zip` (plus `…-screens.zip` and `…-clips.zip` if the big one is too large to upload) | about 31 MB total |
| **The capture report** | `memory/reports/marketing-captures-report.md` | Names every file, and the five screens that are approximations (33 Drive, 36 Billing, 44 completion report, 42 crew contract, 41 hours) |
| **Logo** | `frontend/assets/brand/logo.svg` and `frontend/assets/brand/png/` | Also `frontend/assets/logo.png`, `icon.png`, `favicon.png` |
| **Older marketing stills** | `frontend/assets/marketing/screen-*.jpg` | Superseded by the new screens; ignore unless a filler is needed |

How to download from GitHub: open the repo → `memory/marketing` → **Code → Download ZIP** downloads the whole repo (big); better: open the zip file's page and press **Download raw**; or open each folder and download files one by one.

## 2. The words

- **`website-chat-knowledge.md`** (my notes repo, already in Josh's hands) — the only source for feature copy, plans, prices and the FAQ. Every claim on the website must be in that file. Its §9 lists what is **not** live yet; the website says nothing that §9 marks as not yet.
- Prices: **ex-GST, 10% GST added** — Starter $59, Small business $179, Enterprise $249 a month; show "+ GST" beside every price. Trial 14 days on Enterprise, no card. **The site must not take sign-ups yet**: sign-up is invite-only during the tester program. The call to action is "Ask for an invite" → a form that emails software@joshsano.com.au (name, business, suburb/state, email, mobile, crew size, current software).
- Legal: footer links **Terms of Service → https://painttradehq.co/terms**; no Privacy Policy page exists yet (the Terms' section 5 covers data), so no Privacy link; footer line **"© 2026 Josh Sano Painting and Decorating, trading as Paint Trade HQ"**; contact software@joshsano.com.au until support@painttradehq.co exists.
- The app's own one-line feature list (from its sign-in page), good for a hero: "Fast, accurate estimating · Invoicing and a live project tracker that follow the quote · CRM and an AI assistant that learns your workflow · Product library, employee records and calendar". The assistant is "powered by Anthropic" if named.

## 3. The look (from the app's design tokens, so the site and the app match)

| Token | Value |
|---|---|
| Accent (buttons, links) | `#4B3E86`, hover `#5C4C9E`, pale `#F1EEFA`, deep ink `#34295E` (the public pages' header) |
| Page background | `#FAF9F6` (warm off-white); cards `#FFFFFF`; sunken `#F4F2EE` |
| Text | `#1E1C1A` primary |
| Success / danger | `#1C8A4B` / `#C6382E` |
| Display font | **Fraunces** (600 semibold, 700 bold), fallback Georgia |
| Body font | **Inter** (400 / 500 / 600) |
| Mono (numbers, versions) | **IBM Plex Mono** |
| Radius | 12 px cards, 8 px buttons |

Tone: plain Australian English, short sentences, painter's words (quote, job, crew, client), no hype. Buttons: solid accent with **white** text (not dark text — the quote email gets this wrong today, do not copy it).

## 4. Where the site lives and how it links

- The app is at **https://painttradehq.co**; the sign-in door is `/admin/login`, the crew door `/crew`. Josh owns painttradehq.co, .com and .com.au: the marketing site can sit on `.com` or `.com.au` (or on `www.painttradehq.co` with the bare domain kept for the app) — Josh's call; whichever it is, the site's "Sign in" goes to `https://painttradehq.co/admin/login`.
- No pricing checkout on the site (plans open at launch). No "Download the app" badges (there is no store app; the crew app is a web page added to the home screen).

## 5. Not for the website

`marketing-screens-request.md` and the connections sheet are internal. The chat box's behaviour rules (§0 of the knowledge file) go to the chat tool, not onto pages.
