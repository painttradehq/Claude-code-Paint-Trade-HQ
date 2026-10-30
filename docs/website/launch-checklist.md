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

Leave `APP_LEADS_URL` and the Turnstile keys unset for now. Redeploy once after adding secrets (Deployments → Retry) so the functions pick them up. Add the plain variable `PUBLIC_CHAT_ENABLED` = `0` now and leave it there until step 5 is done; the chat box then stays off the pages. (The chat function carries a dated overrides block with the new prices and trial, so it would not contradict the pages, but the rest of its answers still come from the old file.)

Test on the preview link: fill in the free-trial form with your own email and check it arrives (and, once the knowledge file is updated and the chat is on, ask the chat box "What does it cost?"). Set `PUBLIC_SHOW_SAMPLES` = `0` for the live site unless you want the sample feedback cards and sample painter listings showing.

## 3. Domain (5 min, then wait on DNS)

1. In the Pages project, **Custom domains → Set up a custom domain**: add `painttradehq.com`, then add `www.painttradehq.com`. Cloudflare writes the DNS records if the `.com` zone is on Cloudflare; if the domain is registered elsewhere, move its nameservers to Cloudflare first (the registrar shows where).
2. For `painttradehq.com.au`: add the zone to Cloudflare and create a **Redirect Rule** sending everything to `https://painttradehq.com` (status 301).
3. The app stays on `painttradehq.co`; nothing changes there.

## 4. One protective rule (3 min)

**Security → WAF → Rate limiting rules → Create**: if URI path starts with `/api/`, more than **20 requests per 10 seconds** from the same IP → **Block** for the longest period the plan allows. This sits in front of the functions' own limits.

## 5. The knowledge file (2 min)

The pages changed on 30 Oct (30-day free trial on every plan, $98 / $178 / $249, no tester wording) but the chat box still answers from `docs/website/chat-knowledge.md` (your `website-chat-knowledge.md`), which says tester program, $59 / $179 and a 14-day trial on Enterprise. Update §0, §6, §9, §10 and §11 (and add that crew sign-in is on every plan) and send the file again. Until then keep `PUBLIC_CHAT_ENABLED` = `0` so the chat box stays off the pages.

## After launch

- Check the invite emails land in the inbox, not spam, for the first few days.
- Watch the Anthropic Console usage for the first week; raise or lower the cap.
- When the app team confirms `POST /api/signup-leads` is live at the current round, set `APP_LEADS_URL` to file leads in the app as well as by email.
