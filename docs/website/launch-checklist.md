# Website launch checklist (Josh's side)

What has to happen for painttradehq.com to be live with the chat box and the invite form working. Everything in the code is done, reviewed and pushed on branch `claude/sleepy-meitner-rg5ugj`. Allow about an hour, mostly waiting on DNS.

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

Leave `APP_LEADS_URL` and the Turnstile keys unset for now. Redeploy once after adding secrets (Deployments → Retry) so the functions pick them up.

Test on the preview link: open the chat box and ask "What does it cost?"; fill in the invite form with your own email and check it arrives.

## 3. Domain (5 min, then wait on DNS)

1. In the Pages project, **Custom domains → Set up a custom domain**: add `painttradehq.com`, then add `www.painttradehq.com`. Cloudflare writes the DNS records if the `.com` zone is on Cloudflare; if the domain is registered elsewhere, move its nameservers to Cloudflare first (the registrar shows where).
2. For `painttradehq.com.au`: add the zone to Cloudflare and create a **Redirect Rule** sending everything to `https://painttradehq.com` (status 301).
3. The app stays on `painttradehq.co`; nothing changes there.

## 4. One protective rule (3 min)

**Security → WAF → Rate limiting rules → Create**: if URI path starts with `/api/`, more than **20 requests per 10 seconds** from the same IP → **Block** for the longest period the plan allows. This sits in front of the functions' own limits.

## 5. The knowledge file (2 min)

Add one line to §6 of `website-chat-knowledge.md` saying crew sign-in and sign-out are included on every plan, and send the file again. The pages already say it; the chat box only knows what the file says.

## After launch

- Check the invite emails land in the inbox, not spam, for the first few days.
- Watch the Anthropic Console usage for the first week; raise or lower the cap.
- When the app team confirms `POST /api/signup-leads` is live at the current round, set `APP_LEADS_URL` to file leads in the app as well as by email.
