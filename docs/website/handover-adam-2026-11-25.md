# Paint Trade HQ website: handover to Adam

25 November 2026. Written by Claude (the AI assistant that built the site in Josh's workspace) at Josh's request. The live copy of this file is in the repo at `docs/website/handover-adam-2026-11-25.md`; if anything here goes out of date, that copy is the one to fix.

Hi Adam. Josh has asked you to take over the website work. This is everything in one place: what the site is, where it lives, who does what, how to work on it, and what's still open.

## 1. The short version

- This is the **marketing website** for Paint Trade HQ, not the app. It's built and has been reviewed several times, but it is **not live yet**.
- **See the latest version:** https://claude.ai/artifact/VmdQsTXNvehW6uqJqEpMRQ (a preview; the trial form and email box don't send from there). Your line, "Everything you need to run your painting business.", is the headline.
- **The code:** GitHub repo `painttradehq/Claude-code-Paint-Trade-HQ`, folder `website/`, branch `claude/sleepy-meitner-rg5ugj`.
- **Josh decides** what the site says: claims, prices, offers. **You run the website work.** **Jay at nForce IT** handles hosting, the domains, DNS and anything else on the IT side. Talk to Jay directly for those.
- To go live, three things are in the way: hosting (section 6), the domain plan (section 6) and a handful of decisions only Josh can make (section 7).

## 2. Who does what

| Who | Looks after | Contact |
|---|---|---|
| Josh | What the site says (claims, prices, offers), the knowledge file, access to accounts | software@joshsano.com.au |
| Adam (you) | The website: words, pages, layout, and getting it live with Jay | (not written here: anyone can read this repo) |
| Jay Guinto, nForce IT (web developer) | Hosting on Cloudflare Pages, domains and DNS, spam protection on the form, go-live and upkeep | jay@nforceit.com.au |
| Bobby Jafari, nForce IT | Jay's colleague; an administrator on the Cloudflare account | bobby@nforceit.com.au |
| The app builder (an AI agent Josh runs on Emergent) | The app itself, and new app screenshots and videos | through Josh |

There's an email thread for you and Jay: **"Adam and Jay - Paint Trade HQ website (all related communication)"**. Keep website, hosting and domain conversation there so it's all in one place. Anything for Josh goes in your existing thread with him.

## 3. Access: what you have and what's coming

- [ ] **GitHub repo.** Josh adds you as a collaborator. Accept the invite email from GitHub. If you want a particular GitHub username used, tell Josh.
- [x] **Website preview.** Open to anyone with the link above.
- [ ] **The home-page redesign proposal** (4 Nov, with Josh's answers to its 13 questions): https://claude.ai/artifact/TnZDVXb33zn3seWpLRt9hr. Josh shares it with you from its Share menu.
- [ ] **Brand kit.** Google Drive folder "Paint Trade HQ — Brand & Marketing", doc "Paint Trade HQ — Brand Kit (logo + colours)". Josh shares it.
- **You don't need** the Cloudflare, GoDaddy or Resend logins, or any API keys. Jay does, and keys never go in email or in the repo.
- **Claude:** once you've accepted the GitHub invite, open the repo in Claude Code (claude.ai/code). Claude reads `CLAUDE.md` at the start of every session. That file is the project's memory (who's who, every decision, the rules), so a session starts already knowing the history. If Claude can't see the repo, ask Josh to check that the Claude GitHub app has access to it.

## 4. Where things are

- `website/`: the site itself (Astro 5, Node 22).
  - `src/pages/`: one file per page. `index.astro` is the home page.
  - `src/data/site.ts`: plans, prices, menu, FAQs. `src/data/directory.ts`: the painter listings.
  - `src/content/blog/`: the six blog posts.
  - `public/screens/` and `public/clips/`: app screenshots and videos. They are real screens with a made-up demo business, "Harbourline Painting".
  - `functions/api/`: the two small programs behind the trial form (`invite.js`) and the chat box (`chat.js`).
- `docs/website/chat-knowledge.md`: Josh's knowledge file, the source of truth for what the app does. The site may only claim what's in it, plus Josh's later decisions (recorded in `CLAUDE.md`). It's Josh's file: don't edit it for him.
- `docs/website/launch-checklist.md`: click-by-click go-live steps (written for Josh and Jay).
- `docs/website/handover-nforceit-2026-11-01.md`: the hosting handover sent to Jay and Bobby on 1 Nov. Its domain section is out of date (see section 6).
- `docs/parking-lot.md`: ideas parked for later (a payment page after sign-up, a GoHighLevel CRM for leads, sign-in through the website).
- `CLAUDE.md`: the project memory.

## 5. How to work on it

**With Claude (easiest).** Open the repo in Claude Code and ask for the change in plain English. Claude runs the checks before it pushes.

**On your own computer:**

```
cd website
npm ci
npm run dev              # the site at http://localhost:4321
npm run build
npm run qa               # page checks at four screen widths
npm run test:functions   # 49 checks for the form and chat programs, no keys needed
```

Before the first `npm run qa`, run `npx playwright install chromium` once.

Work on the branch `claude/sleepy-meitner-rg5ugj`, or on your own branch with a pull request. Once Cloudflare Pages is connected, every push to the live branch goes live, and every other branch gets its own preview link. Until then, the preview link above is published from Josh's Claude workspace.

## 6. Hosting and domain: where it stands

- **Domains:** painttradehq.co, painttradehq.com and painttradehq.com.au, all registered at **GoDaddy**. None of them is on Cloudflare yet.
- **Josh changed the plan on 5 Nov:** the website and the app both go on **painttradehq.co**; painttradehq.com and .com.au **redirect to the website**; and the app's sign-in is reached through the website. The exact layout is still to be confirmed with Josh. The recommendation is the website on painttradehq.co (and www) and the app moved to **app.painttradehq.co**, with old app links redirected so links already sent to clients keep working.
  - The app is live on painttradehq.co today, so moving it is work for the app builder and Jay, not a quick switch.
  - The 1 Nov handover to Jay still says "site on painttradehq.com". That part is out of date.
  - The site's code still defaults to painttradehq.com (`website/astro.config.mjs`, and `PUBLIC_SITE_URL` on the host). Change both once the layout is settled.
- **Cloudflare:** the account is under software@joshsano.com.au, with Bobby as an administrator. The storage the form and chat use for their spam limits is already created and wired in (`pthq-website-rate-limits`, in `website/wrangler.toml`). The website project itself, and its connection to GitHub, aren't set up yet. That's Jay's first job.
- **Jay is waiting on access.** On 4 Nov he asked Josh to share GitHub, Cloudflare, Resend and GoDaddy access through Keeper. There's no reply to that in Josh's mailbox; Josh may have shared it in Keeper directly. Worth checking with Josh first.
- **Which branch goes live:** Cloudflare publishes one branch. Still open: merge the website into `main` first (tidier), or publish from the working branch for now.

## 7. Open decisions (Josh decides; you can chase them)

1. **Headline.** Josh asked for "All in one AI-powered software for painting businesses". It wasn't built, because "AI-powered" is on Josh's own words-to-avoid list, and Lucy (the AI assistant) is only on the Small business plan and up. Claude's reply on the preview comment gives three options: (1) "All-in-one software for painting businesses.", (2) the same "with an AI assistant on board", or (3) Josh's wording as written. Claude's pick is 1; keeping your current line is also fine.
2. **Domain layout** (section 6).
3. **Which branch goes live** (section 6).
4. **Videos 02, 03 and 07 need re-recording** by the app builder. They show a test email address, the builder's preview link and a red "150% of the quote" warning. Only 02 still plays on the site (the Quotes card on the Features page); 03 and 07 aren't on any page now, but they need re-recording before they're used again.
5. **Terms of Service.** Before billing is switched on, the Terms need a fees, cancelling and refunds section (Josh's lawyer). Until then the site says nothing about refunds.
6. **The "login usually the same business day" promise:** keep it or change it.
7. **Closing section on laptop screens:** the text sits partly on the purple ribbon and is hard to read. A light frosted panel behind it (as on phones) would fix it without touching the ribbon.
8. **The knowledge file (Josh's job).** The chat box stays switched off until Josh updates the file to match the site: prices, the 30-day trial, yearly billing, Xero and the rest.

## 8. Before go-live

From the launch checklist; the full steps are in `docs/website/launch-checklist.md`.

- **Spam protection (Turnstile) on.** The form emails whatever address a visitor types.
- **Samples off** (`PUBLIC_SHOW_SAMPLES=0`). This hides the sample feedback cards and sample painter listings.
- **Chat box off** (`PUBLIC_CHAT_ENABLED=0`) until the knowledge file is updated.
- **Check the claims in the live app.** The home page says Xero, OneDrive, the Outlook calendar and the in-app Billing page work (Josh, 4 Nov: "all gonna be connected" by go-live). If any of them doesn't, those lines come off; checklist step 6 lists every place.
- **Test the form.** Send a test trial request and check both emails arrive (Josh's lead, and your confirmation).

## 9. Rules of the site (please don't break these)

- Only claim what the knowledge file and Josh say. When a feature isn't on every plan, say which plan it's on.
- No refund or cancellation terms on the site; they belong in the Terms.
- No "tester" or "invite" wording. The button is "Start free trial": 30 days, every plan, no card.
- Prices: $98 / $178 / $249 a month + GST, or a year up front for 10% off.
- No behind-the-scenes supplier names on pages (the companies the app is built, hosted or emails with). The tools a painter connects (Google, Microsoft, Xero) are fine, and Lucy can be "powered by Anthropic".
- Josh's name only on the Story page and the legal line in the footer.
- Sample feedback is marked "Sample". No made-up testimonials or numbers.
- Words to avoid (Josh's list): "tenant", "SaaS", "platform", "AI-powered", "revolutionary", "seamless". Also "annual" (say "yearly"), "tester" and "free plan". `npm run qa` fails if any of them appears on a page.
- The purple ribbon on the home page is Josh's: leave it alone unless he asks.
- No sign-in links on the site for now (Josh, 1 Nov). Josh wants the app's sign-in reached through the website once the domain layout is done.

## 10. Recent history, so the rest makes sense

- **30 Oct to 1 Nov:**
  - the site moved to the free-trial offer;
  - new prices and yearly billing;
  - the painters directory and the blog;
  - the trial form got a plan choice and a confirmation email.
- **4 Nov:** the home page was rebuilt from a redesign proposal, including your feedback (your line became the headline).
- **22 Nov:** Josh edited the home page through comments on the preview:
  - a shorter top section;
  - new "Sound familiar?" problem cards;
  - the videos, the plans section and the "Also in the app" card removed (prices now live only on the Pricing page);
  - the connections diagram regrouped into Google, Microsoft and Xero;
  - a card on what connecting them gets you.

Questions about the website: ask Josh in your thread with him. Hosting, domain or DNS: Jay, in your thread with him.
