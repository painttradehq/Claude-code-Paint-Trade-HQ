# Website launch checklist (Josh's side)

What has to happen for painttradehq.com to be live. Everything in the code is done, reviewed and pushed on branch `claude/sleepy-meitner-rg5ugj`.

## What the three services are for

| Service | What it does on the website | Needed to go live? | Without it |
|---|---|---|---|
| **Cloudflare** (free plan) | The shelf the site sits on: serves the pages, pictures and clips, and runs the two small programs behind the chat box and the free-trial form. | **Yes.** Nothing is public without a host. | No website. |
| **Resend** | The postman for the "Start free trial" form: a web page cannot send email by itself, so a program on the host sends it through Resend to software@joshsano.com.au. The app already uses this account and the domain is verified. | No. Add it any time. | The form shows "Email isn't set up yet, please email software@joshsano.com.au". |
| **Anthropic** | The brain behind the chat box, the same service that powers Lucy. Each visitor question is sent to Claude with the knowledge file. | No. Add it any time. | The chat box says "not switched on yet" and points to email, or set `PUBLIC_CHAT_ENABLED=0` and the box is left off the pages entirely. |

So the minimum is Cloudflare. The two keys are a two-minute paste each, with no code change, whenever you make them. They are new keys on accounts you already have, so the website's spending can be capped separately from the app's.

Allow about an hour for the Cloudflare part, mostly waiting on DNS.

## 0. Branch (say the word)

Cloudflare builds from one branch. Either tell Claude to open a pull request so the website lands on `main`, or in step 1 set the production branch to `claude/sleepy-meitner-rg5ugj` for now. Merging to `main` is the tidier choice.

## 1. Cloudflare Pages project (15 min)

1. In the Cloudflare dashboard open **Workers & Pages → Create → Pages → Connect to Git**, and pick the repo `painttradehq/Claude-code-Paint-Trade-HQ`.
2. Build settings: framework preset **Astro**; **root directory `website`**; build command `npm run build`; output directory `dist`.
3. Under **Environment variables** add `NODE_VERSION` = `22` and `PUBLIC_SITE_URL` = `https://painttradehq.com`.
4. Save and deploy. The first build gives a `*.pages.dev` preview link you can click straight away. From then on every push to the production branch redeploys, and every other branch gets its own preview link.

## 2. Secrets (10 min)

In the Pages project, **Settings → Variables and secrets**, add these as **secrets** (encrypted), for Production and Preview:

| Name | Value | Where it comes from |
|---|---|---|
| `ANTHROPIC_API_KEY` | a new key, made for the website only | console.anthropic.com → API keys → Create key, name it "website chat". Then **Settings → Limits**: set a monthly spend limit for the organisation (start low, e.g. $20) so a bot can never run it up. |
| `RESEND_API_KEY` | a new key with **sending access only**, restricted to the domain `painttradehq.co` | resend.com → API keys → Create |
| `INVITE_FROM` | `Paint Trade HQ website <website@painttradehq.co>` | the domain is already verified in Resend |
| `INVITE_TO` | `software@joshsano.com.au` | optional; this is the default anyway |

Leave `APP_LEADS_URL` unset for now. **Set up Turnstile before launch** (free, 5 minutes): Cloudflare dashboard → **Turnstile → Add site** (domain `painttradehq.com`, widget mode Managed) → copy the **site key** into a plain variable `PUBLIC_TURNSTILE_SITE_KEY` and the **secret key** into the secret `TURNSTILE_SECRET`, then redeploy. Since 1 Nov 2026 the form emails a confirmation to whatever address a visitor types, and Turnstile is what stops a script using that to send strangers mail from your domain (the function also allows one confirmation per address a day). Redeploy once after adding secrets (Deployments → Retry) so the functions pick them up. Add the plain variable `PUBLIC_CHAT_ENABLED` = `0` now and leave it there until step 5 is done; the chat box then stays off the pages. (The chat function carries a dated overrides block with the new prices and trial, so it would not contradict the pages, but the rest of its answers still come from the old file.)

Test on the preview link: fill in the free-trial form with your own email and check it arrives (and, once the knowledge file is updated and the chat is on, ask the chat box "What does it cost?"). Set `PUBLIC_SHOW_SAMPLES` = `0` for the live site unless you want the sample feedback cards and sample painter listings showing.

## 3. Domain (5 min, then wait on DNS)

1. In the Pages project, **Custom domains → Set up a custom domain**: add `painttradehq.com`, then add `www.painttradehq.com`. Cloudflare writes the DNS records if the `.com` zone is on Cloudflare; if the domain is registered elsewhere, move its nameservers to Cloudflare first (the registrar shows where).
2. For `painttradehq.com.au`: add the zone to Cloudflare and create a **Redirect Rule** sending everything to `https://painttradehq.com` (status 301).
3. The app stays on `painttradehq.co`; nothing changes there.

## 4. One protective rule (3 min)

**Security → WAF → Rate limiting rules → Create**: if URI path starts with `/api/`, more than **20 requests per 10 seconds** from the same IP → **Block** for the longest period the plan allows. This sits in front of the functions' own limits.

## 5. The knowledge file (2 min)

The pages changed on 30 Oct (30-day free trial on every plan, $98 / $178 / $249, no tester wording) but the chat box still answers from `docs/website/chat-knowledge.md` (your `website-chat-knowledge.md`), which says tester program, $59 / $179 and a 14-day trial on Enterprise. Update §0, §6, §9, §10 and §11 (and add that crew sign-in is on every plan) and send the file again. Until then keep `PUBLIC_CHAT_ENABLED` = `0` so the chat box stays off the pages.

Also in §10 (1 Nov 2026): drop "what software they use today"; add "which plan (Starter, Small business, Enterprise, or not sure) and whether they would rather pay monthly or yearly"; and note that the site emails each requester a fixed confirmation as soon as the form is sent. In §6, replace "Monthly only, no annual price yet" with the yearly option: a year up front is 10% less than twelve monthly payments ($1,058.40 / $1,922.40 / $2,689.20 ex-GST); extra seats stay monthly.

## 6. Check what the home page promises (4 Nov 2026, 15 min in the live app)

On 4 Nov you said to write the home page as if everything is connected by go-live ("by the time we go live it's all gonna be connected"). So the home page now says the items below work. On 23 Oct, when the knowledge file was written, they did not. Before the site goes public, try each one in the live app. **If any one isn't working on launch day, tell Claude and that line comes off the page** (a few minutes each). A page that promises Xero to a painter who then can't connect it costs more than leaving Xero off.

| The home page says | Where on the site | Try this in the live app | Knowledge file on 23 Oct |
|---|---|---|---|
| Xero connects from your settings | Works-with strip, the dark "Fits the way you already work" band, the question "Does it connect to Xero or MYOB?" (also on Pricing) | Settings › Business › Accounting: Xero connects and stays connected | §4.7, §9, §11: "not yet set up on the server" |
| OneDrive | Strip, dark band | Settings › Business › Files & storage: OneDrive connects and a job photo lands in it | §9: "Not yet" |
| Outlook calendar | Strip, dark band | Calendar settings: Outlook connects and your events show | §9: "Not yet" |
| Choose your plan on the app's Billing page, monthly or yearly | The question "What happens when the 30 days are up?" | Billing page is switched on, shows $98 / $178 / $249, and offers a year up front at 10% off | §6: "built but not switched on" |
| Gmail, Microsoft 365, Google Calendar, Google Drive, your Google review link | Strip, dark band | Connect each once | Live on 23 Oct; a quick check is enough |

So the site doesn't contradict itself, the same assumption was carried to the other pages that mentioned these services on 4 Nov: the Features page (Files and storage: "our cloud, your own Google Drive or OneDrive"; Calendar: "Google Calendar or Outlook") and the blog post "Where your photos and paperwork live" (OneDrive "from the same page"). **If one of them isn't live on launch day, every place it appears comes off together:** the home page strip, dark band and "Also in the app" card, the Xero answer (home and Pricing), the day-31 answer (Billing page), the two Features modules and the blog post.

Still showing the old state, whichever way it goes:

- Screen 33 (Settings › Files & storage, used on Features and as the blog post's picture) shows OneDrive and Xero "not set up yet", because that is what the app showed on 23 Oct. Its description for screen readers says so honestly. Once they are connected, ask the builder for a fresh screen 33.
- The knowledge file: §4.7, §9 and §11 on Xero, §4.8 and §9 on Outlook and OneDrive, §6 and §9 on billing. Until you change them and re-send the file, the chat box would say "not yet" to a question the home page answers "yes". Keep `PUBLIC_CHAT_ENABLED` = `0` until then.

**Videos to re-record (ask the builder, same demo business, any made-up client email such as mia@example.com):** all four play from the home page's "Watch it work".

| Clip | What shows that shouldn't |
|---|---|
| 02, quote to sent | Opens on a sign-in screen with a test login typed in (alpha.owner@test.pthq.local); the client card and the Review & Send "To" line show "delivered@resend.dev" (a supplier's test address); it ends on "Estimate sent! Emailed delivered@resend.dev" with the builder's preview link (pthq-replica.preview.emergentagent.com). Its cover picture was swapped on 4 Nov for a clean frame; the video itself can't be fixed from this side. |
| 03, client accepts | "delivered@resend.dev" under the client's name on the quote, the whole way through. |
| 07, invoice and payment | The demo invoice shows a red "150% of the quote · over the quote" warning, which reads like a billing mistake. |
| 05, crew clock-in | Fine. |

Until they are re-recorded, the cheaper option is to hide clips 02 and 03 from the home page (the stage card above still shows quote to signed). Your call.

## After launch

- Check the invite emails land in the inbox, not spam, for the first few days.
- Watch the Anthropic Console usage for the first week; raise or lower the cap.
- When the app team confirms `POST /api/signup-leads` is live at the current round, set `APP_LEADS_URL` to file leads in the app as well as by email.
