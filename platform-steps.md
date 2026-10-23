# Connections — state and steps (checked 22 October)

Every outside connection the app depends on, what I could verify from here, and what is left to do, click by click. The live address is **https://painttradehq.co** (Josh, 22 Oct). Secrets go into Emergent's deployment variables only, never into a chat. After each step, say which one is done or paste the exact error.

| Connection | State on 22 Oct | What is left |
|---|---|---|
| Emergent (build) | Connected; reconnects by itself | Nothing |
| Stripe (billing) | **Every billing flow passed on the preview** (22 Oct): checkout $64.90 with the GST line, proration, scheduled downgrade, card update, seat sync, failed card, trial conversion, cancel and resume | Two live keys into the published variables, then publish (§2) |
| Resend (email) | `painttradehq.co` verified and sending — but the app still sends from `painttradehq.com.au`, so every email fails | Change the sender address to `painttradehq.co` on the preview and in the published variables (§3); no DNS work |
| Google Drive / Calendar (OAuth) | Redirect URIs registered, secret rotated, Calendar connected on live, **Drive connected 22 Oct as `painting@joshsano.com.au`** ("in use"); the published `GOOGLE_DRIVE_CLIENT_ID` was empty before the last republish — confirm it is filled | Upload one photo on the live app and find it in that Drive (§5 step 4); delete the old Google secret ending 6uwk |
| Xero | No developer app yet; `XERO_CLIENT_ID` / `XERO_CLIENT_SECRET` unset | §6 |
| Microsoft (OneDrive storage, Outlook calendar) | `MS_CLIENT_ID` / `MS_CLIENT_SECRET` unset; the app says "Not set up on this server yet" | §9, only if you want OneDrive or Outlook offered |
| Google Places / geocoder key | Key present on the preview per earlier rounds | Allow the live address in the key's restrictions (§7) |
| Claude (Anthropic key) | Present on the preview; nothing to connect | Make sure the published variables carry it (§7) |
| Database | Emergent-managed, in a different cloud from the app | Optional upgrade, on hold (§8) |
| Push to crew phones | Does not exist yet (crew chat's C7) | Crew chat |
| GitHub copy of the code | Manual | Press Save to GitHub after each publish |

**Preview variables (Emergent, 22 Oct, names only):** set — `RESEND_API_KEY`, `RESEND_FROM` (= `Paint Trade HQ <no-reply@painttradehq.co>`), `GOOGLE_DRIVE_CLIENT_ID/SECRET`, `GOOGLE_CALENDAR_CLIENT_ID/SECRET`, `GOOGLE_PLACES_API_KEY`, `ANTHROPIC_API_KEY`, `APP_PUBLIC_URL`, `STRIPE_SECRET_KEY`, `MONGO_URL`; unset — `MS_CLIENT_ID/SECRET`, `XERO_CLIENT_ID/SECRET`; the Stripe price, tax-rate and webhook variables are intentionally unset (the app resolves them itself). The published app's variables are not visible to Emergent; the same names must be there. **Callback addresses on the published app:** `https://painttradehq.co/api/integrations/{google-drive | google-calendar | onedrive | outlook-calendar | xero}/callback`, and `https://painttradehq.co/api/billing/webhook` for Stripe.

## 1. Publish the What's new drafts (not a connection, but yours)

1. Live app → Settings › Platform › **Updates** tab.
2. The drafts, oldest first: 12 "Crew daily reports, rebuilt", 13 "Line details, roomier", 14 "Add to the Library from the quote", 15 "Faster everywhere", 16 "Quicker pages", 17 "Prices that include GST"; after the next publish of the app: 18 "Signed contracts, delivered", 19 "Show your work, your way", 20 "Your crew app, your way", 21 "Plans and billing, in one place", 22 "Overtime rates and reminders to sign in and out"; after Round 82: 23 "Our Terms, reviewed". Open each, read the text once, press **Publish**. Leave the email option off unless you want every business emailed.
3. Publish in that order. Unpublish exists if one reads wrong; tell me the words to change.

## 2. Stripe

**State.** Seven products with GST-on-top prices exist in your main account's test mode (`stripe-test-prices.md`). The preview's key belongs to your **sandbox** account, so the app creates its own prices, GST rate and webhook there at start-up; the flows are being tested there now. Your account is activated for live. My connection is test mode only, which is fine.

**Decision 22 Oct (Josh: "do what you recommend"): the live keys wait until the launch-phase Terms and Privacy Policy exist** — the reviewed Terms say the app is free, so nobody may be charged under them (`legal-terms-notes.md` §7). With no Stripe key on the published app the bootstrap does not run and no checkout can start. Until then the Billing page's plan buttons lead nowhere on the live app; making them say "Plans open at launch" while Stripe is unconfigured is on the Fix Round G list.

**Steps, when the launch-phase Terms are in:**

1. Stripe dashboard with the **Test mode toggle off**. Developers → API keys. Copy the **Secret key** (`sk_live_…`) and the **Publishable key** (`pk_live_…`).
2. Emergent → Manage Publishes (the deployment) → **Environment variables**: `STRIPE_SECRET_KEY` = the live secret key, `STRIPE_PUBLISHABLE_KEY` = the live publishable key. Nothing else: no price ids, no webhook secret. Check `APP_PUBLIC_URL` is `https://painttradehq.co` (no trailing slash) — the app's webhook is created on it.
3. Publish. On its first start the app creates the seven live products and prices, the 10 % GST rate and its own webhook endpoint, and keeps the ids.
4. Confirm: Settings › Platform (you only) → the Stripe status line shows "live", every id "created" or "found", webhook set. Then a trial sign-up with a real card of yours, cancelled at once, proves the loop.
5. Rules: live keys never on the preview; test keys never on the published app. If a key ever lands in a chat, roll it (Developers → API keys → the row's menu → Roll key) and set the new value.

## 3. Resend — the sender address

**State (22 Oct).** Your Resend account has `painttradehq.co` verified (sending on, region Tokyo) and two API keys named "PTHQ" and "PTHQ-SERVER". **The preview sends and delivers**: a test email from `Paint Trade HQ <no-reply@painttradehq.co>` to painting@joshsano.com.au reached the inbox (Resend status delivered, id `01a1630d-…`). The published app still needs its own `RESEND_FROM` (step 2) and test (step 4). **One finding:** the emails carry **Reply-To `support@painttradehq.co`** (the preview's `RESEND_REPLY_TO`), a mailbox that does not exist yet — a client or tester who replies to a quote, invoice or test email writes into a void (step 6). (The unused `painttradehq.com.au` domain I had registered in Resend was **removed on 22 Oct** at your word; only `painttradehq.co` remains.)

**Steps:**

1. The variable is **`RESEND_FROM`**; on the preview it now reads `Paint Trade HQ <no-reply@painttradehq.co>` and the app's test route answers ok.
2. Emergent → Manage Publishes → Environment variables: `RESEND_FROM` = `Paint Trade HQ <no-reply@painttradehq.co>`. Publish.
3. The API key: Resend keys can be limited to one domain. "PTHQ-SERVER" is the likely server key; if it was created for all domains nothing changes. If the test in step 4 fails with "not authorized", create a new key in resend.com → API keys → **Create**, permission "Sending access", domain **All domains** (or `painttradehq.co`), and set it as `RESEND_API_KEY` in the published variables (and the preview's secrets).
4. Test from the live app after the publish: Settings › Business › Connected services › Email → **Send a test email**. A passing result is the email in your inbox from `no-reply@painttradehq.co`. If it fails, paste the message.
5. Optional, for deliverability: in resend.com → Domains → `painttradehq.co`, check that DMARC is listed; if not, a TXT record at `_dmarc.painttradehq.co` with `v=DMARC1; p=none;` at your DNS host.
6. **The reply address** (Josh set the published reply address to software@joshsano.com.au on 22 Oct; Emergent asked to match the preview). Two variables, on the preview and the published app: `RESEND_REPLY_TO` (where replies to quotes, invoices, variations and the test email go) and `SUPPORT_EMAIL` (where tester feedback and the welcome email's "write to us" point). Until a real support mailbox exists, set both to `software@joshsano.com.au` (done on the published app 22 Oct). **Recommended end state (Josh asked 22 Oct):** one real Paint Trade HQ mailbox, `support@painttradehq.co` — the name the app already defaults to and the one people expect; "account@" or "hello@" would work the same, keep one. Make it real the cheap way: Google Workspace admin → Account → Domains → add `painttradehq.co` as a secondary domain (free), then an alias `support@painttradehq.co` on your user — mail lands in the inbox you already read and you can reply as support@. Google's MX records go on the root domain; Resend's records sit on `send.painttradehq.co` and `resend._domainkey`, so they do not clash. Then set the two variables to `support@painttradehq.co` on both copies and publish. **Asked of Jay (jay@nforceit.com.au, your IT provider) by email on 22 Oct**: the Workspace domain, Google's MX records (Resend's left alone), the support@ alias on software@, or admin rights for painting@ so you do it yourself. When Jay confirms, set the two variables to support@painttradehq.co and publish. **Not for subscribers:** a painter's clients must reply to the painter, not to us — the app sets that wrongly today on quotes, invoices and variations (Fix Round G item "replies to a painter's emails must reach the painter"). Sending stays from `no-reply@painttradehq.co` for everyone; the reply address is what carries the human.

## 4. Google — the OAuth app (Drive and Calendar sign-in)

**State (22 Oct, from Emergent's check).** One OAuth client serves Drive and Calendar: client id `1080562258935-00sr3209bgefheq304bmo4vckf0o73jb.apps.googleusercontent.com`, in Google Cloud project number **1080562258935**. The app's side is correct, but Google answers **"Error 400: redirect_uri_mismatch"** even on the preview, so no callback address is registered on the client at all. That is why Drive is connected nowhere. The client secret was rotated today (the exposed one ending 6uwk is to be deleted once the new one is published).

**Steps:**

1. console.cloud.google.com → pick project **1080562258935** (the project selector at the top shows the number under each name) → **Google Auth Platform › Clients** (or APIs & Services › Credentials) → the client whose id starts with `1080562258935-00sr`.
2. **Authorised redirect URIs** — add all four, exactly, no trailing slash:
   ```
   https://pthq-replica.preview.emergentagent.com/api/integrations/google-drive/callback
   https://pthq-replica.preview.emergentagent.com/api/integrations/google-calendar/callback
   https://painttradehq.co/api/integrations/google-drive/callback
   https://painttradehq.co/api/integrations/google-calendar/callback
   ```
   **Authorised JavaScript origins** — add `https://painttradehq.co` and `https://pthq-replica.preview.emergentagent.com`. Save.
3. **APIs & Services › Enabled APIs**: **Google Drive API** and **Google Calendar API** must both be enabled (Enable APIs & services → search → Enable).
4. **Google Auth Platform › Audience** (the consent screen): if it says **Testing**, add `software@joshsano.com.au`, `painting@joshsano.com.au` and any account that will connect as test users. The Calendar permission is a "sensitive" one, so in Testing only listed users can connect; publishing the consent screen lifts that but Google may ask for a verification later. Drive's permission (`drive.file`, only files the app creates) needs no verification.
5. Variables: `GOOGLE_DRIVE_CLIENT_ID` (unchanged) and `GOOGLE_DRIVE_CLIENT_SECRET` (the new secret) on both the preview and the published app (done 22 Oct); `APP_PUBLIC_URL` = `https://painttradehq.co` on the published app — Emergent cannot see the published variables, so check it yourself. Publish.
6. After the publish, delete the old secret ending 6uwk in the console.
7. **Also set `GOOGLE_CALENDAR_CLIENT_SECRET`** to the same new secret in the published variables (or delete that variable, so the app falls back to the Drive one). The Calendar sign-in reads it first; with the old value it fails with `invalid_client`. Emergent has set the preview's copy.
8. **Reading a failed connect on the live app.** After Google bounces back to Settings › Business, look at the address bar: `?drive=connected` is success; `?drive=token_error` means the published app still runs the old secret (publish not finished, or the variable not saved) or its `APP_PUBLIC_URL` differs from the registered address; `?drive=state_error` means the callback landed on a different deployment than the one that started it (`APP_PUBLIC_URL` pointing elsewhere); `?drive=error` means Google refused or the sign-in was cancelled (consent screen in Testing without the account as a test user). The card itself only says "Not connected" today — showing the reason on the card is on the Fix Round G list.

**Probe results, 22 Oct (Emergent, preview):** the authorize link now reaches Google's sign-in page (the four redirect URIs took effect); a token-endpoint probe with a bogus code answers `invalid_grant`, which means the client id and the new secret are accepted and the preview callback is registered.

## 5. Google Drive on the live app

After §4. This is what stops new photos being stored inside the database.

1. Live app → Settings › Business → **Files & storage** → "Your Google Drive" → the **Connect Google Drive** button at the right of the row (the row itself only picks the storage; the button is greyed with "Not set up on this server yet" while the server lacks `GOOGLE_DRIVE_CLIENT_ID` / `GOOGLE_DRIVE_CLIENT_SECRET`). Sign in as the account whose Drive should hold the files.
2. Choose "Your Google Drive" as the storage in use. The row says "Connected as … · folder "Paint Trade HQ" · in use". **Done 22 Oct as `painting@joshsano.com.au`** (first as software@, then switched).
3. From then on new photos, signed contracts (Round 78) and crew welcome videos (Round 79) land in a "Paint Trade HQ" folder in that Drive. The folder and its "Estimate Photos" sub-folder are created at the **first photo upload**, not at connect — so an empty Drive right after connecting is normal. Older photos stay until the Storage tool moves them (on hold).
4. Proof: upload one photo to any job on the live app, then open drive.google.com as `painting@joshsano.com.au` and look for "Paint Trade HQ › Estimate Photos" (or "Estimates › <job>"). If the photo shows in the app but not in Drive, the published app is missing one of the two Drive variables and silently fell back to the built-in cloud. (I can only see the `software@joshsano.com.au` Drive from here; share the folder with that address if you want me to check.)

## 6. Xero

1. developer.xero.com → **My Apps** → **New app**: name "Paint Trade HQ", type **Web app**, company URL your website.
2. Redirect URI, exactly: `https://painttradehq.co/api/integrations/xero/callback` (Xero rejects a one-character difference).
3. Copy the **Client ID**, generate a **Client secret**, copy it once.
4. Emergent → Manage Publishes → Environment variables: `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`. Publish.
5. Live app → Settings › Business › Accounting → **Connect** → sign in to Xero → choose the organisation. Check 3 of the admin checks then confirms an invoice pushes.

## 7. Keys that only need to be present

- **Google Places / geocoder key** (address finder, job map, geofence): console.cloud.google.com → Credentials → the API key → **Application restrictions**: if "HTTP referrers" is on, add `https://painttradehq.co/*`; if "IP addresses", switch to referrers or none. Published variables must carry the same name the preview uses (Emergent is confirming the name).
- **Claude (Anthropic) key**: the app's own key for Lucy, briefs and summaries. Present on the preview. The published variables must have it too; nothing to connect.
- Emergent lists these for us; nothing to paste here.

## 8. Database (optional, on hold)

The app runs in Google Cloud Iowa and its database in AWS Oregon, which is most of the remaining slowness. Option 1 from Emergent support: Manage Publishes → Database → **Upgrade** to the dedicated database add-on in the app's region. Your call, when you want it; nothing else depends on it.

## 9. Microsoft — OneDrive storage and Outlook calendar (optional)

Only if you want businesses to pick OneDrive or Outlook. Today those cards say "Not set up on this server yet", which is honest and harmless.

1. portal.azure.com → **Microsoft Entra ID** → **App registrations** → **New registration**: name "Paint Trade HQ", supported account types "Accounts in any organizational directory and personal Microsoft accounts", redirect URI type Web: `https://painttradehq.co/api/integrations/onedrive/callback`; after creating, add a second redirect URI `https://painttradehq.co/api/integrations/outlook-calendar/callback` (and the two preview equivalents on `https://pthq-replica.preview.emergentagent.com`).
2. **Certificates & secrets** → New client secret → copy the **Value** once (not the Secret ID).
3. **API permissions** → Microsoft Graph, delegated: `Files.ReadWrite`, `Calendars.Read`, `offline_access`, `User.Read`.
4. Emergent → Manage Publishes → Environment variables: `MS_CLIENT_ID` = the Application (client) ID, `MS_CLIENT_SECRET` = the secret value. Publish (and the preview's secrets for testing).
5. Live app → Settings › Business › Files & storage → "Your Microsoft OneDrive" → Connect.

## After each one

Say which step is done, or paste the exact error. Press **Save to GitHub** in Emergent after each publish so the code copy stays current.

## 10. GitHub — getting the app's code out of Emergent when Save to GitHub is stuck (24 Oct)

**State.** Save to GitHub fails. Your GitHub account `painttradehq` has the Emergent.sh app installed with **all repositories** (`Claude-code-Paint-Trade-HQ`, `the-newest-update-of-PTHQ`, `rebending-app`), but Emergent's own sign-in link is stuck on your second GitHub account `forgaiinters-source` (the one that owns "onboarding app"), so Emergent lists that account's repo only. Revoking on `painttradehq` did nothing because the stale link is on the other account.

**Fix A — the clean one (your clicks).** Sign in to GitHub as `forgaiinters-source` → Settings → Applications → **Authorized GitHub Apps** → Emergent.sh → **Revoke**; then **Installed GitHub Apps** → Emergent.sh → Configure → **Uninstall**. Sign out of GitHub. In Emergent → Home → GitHub → Connect; on GitHub's account chooser pick **painttradehq**. Hard-refresh Emergent (Ctrl+Shift+R). Save to GitHub → the three repos appear → pick `the-newest-update-of-PTHQ` and its existing branch. Never "create new".

**Fix B — the one I can drive (a push token, no Emergent sign-in involved).**
1. GitHub as `painttradehq` → Settings → **Developer settings** (bottom of the left menu) → Personal access tokens → **Fine-grained tokens** → Generate new token. Name "Emergent push", expiry 7 days, Repository access: **Only select repositories** → `the-newest-update-of-PTHQ`; Permissions → Repository permissions → **Contents: Read and write** (Metadata comes with it). Generate, copy it once.
2. Emergent → the job → **Secrets** (where the Stripe keys went) → new secret **`GITHUB_PUSH_TOKEN`** = the token. Never paste it into any chat.
3. Tell me "token in". I ask Emergent to push with it: the token is read from the environment through a git askpass helper, so it never appears in a command or a log; fast-forward push to the repo's existing branch, or a new branch `emergent-2026-10-24` if the histories differ; never a force push; the helper deleted after; the branch and commit reported.
4. Delete the token in GitHub when the push is done (Fix A remains the long-term answer).

**The capture files** need no GitHub: in the Emergent job, **Code → Open in browser**, find the three zips in `/app/memory/` (`marketing-captures-2026-10-23*.zip`), right-click → Download.
