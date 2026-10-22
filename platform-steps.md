# Connections — state and steps (checked 22 October)

Every outside connection the app depends on, what I could verify from here, and what is left to do, click by click. The live address is **https://painttradehq.co** (Josh, 22 Oct). Secrets go into Emergent's deployment variables only, never into a chat. After each step, say which one is done or paste the exact error.

| Connection | State on 22 Oct | What is left |
|---|---|---|
| Emergent (build) | Connected; reconnects by itself | Nothing |
| Stripe (billing) | Test prices in the main account; the preview runs on your sandbox with its own prices; your account activated for live | Two live keys into the published variables, after the flows report (§2) |
| Resend (email) | `painttradehq.co` verified and sending — but the app still sends from `painttradehq.com.au`, so every email fails | Change the sender address to `painttradehq.co` on the preview and in the published variables (§3); no DNS work |
| Google Drive / Calendar (OAuth) | Not verifiable from here; the client secret was exposed earlier and must be reset | §4, then connect Drive on the live app (§5) |
| Xero | No developer app yet | §6 |
| Google Places / geocoder key | Key present on the preview per earlier rounds | Allow the live address in the key's restrictions (§7) |
| Claude (Anthropic key) | Present on the preview; nothing to connect | Make sure the published variables carry it (§7) |
| Database | Emergent-managed, in a different cloud from the app | Optional upgrade, on hold (§8) |
| Push to crew phones | Does not exist yet (crew chat's C7) | Crew chat |
| GitHub copy of the code | Manual | Press Save to GitHub after each publish |

Emergent has been asked for the exact list of which variables are set on the preview, the callback addresses the app expects for each provider, and the test routes; I fold its answers in when they arrive.

## 1. Publish the What's new drafts (not a connection, but yours)

1. Live app → Settings › Platform › **Updates** tab.
2. The drafts, oldest first: 12 "Crew daily reports, rebuilt", 13 "Line details, roomier", 14 "Add to the Library from the quote", 15 "Faster everywhere", 16 "Quicker pages", 17 "Prices that include GST"; after the next publish of the app: 18 "Signed contracts, delivered", 19 "Show your work, your way", 20 "Your crew app, your way", 21 "Plans and billing, in one place", 22 "Overtime rates and reminders to sign in and out". Open each, read the text once, press **Publish**. Leave the email option off unless you want every business emailed.
3. Publish in that order. Unpublish exists if one reads wrong; tell me the words to change.

## 2. Stripe

**State.** Seven products with GST-on-top prices exist in your main account's test mode (`stripe-test-prices.md`). The preview's key belongs to your **sandbox** account, so the app creates its own prices, GST rate and webhook there at start-up; the flows are being tested there now. Your account is activated for live. My connection is test mode only, which is fine.

**Steps, after Emergent reports "Round 80 Stripe flows done":**

1. Stripe dashboard with the **Test mode toggle off**. Developers → API keys. Copy the **Secret key** (`sk_live_…`) and the **Publishable key** (`pk_live_…`).
2. Emergent → Manage Publishes (the deployment) → **Environment variables**: `STRIPE_SECRET_KEY` = the live secret key, `STRIPE_PUBLISHABLE_KEY` = the live publishable key. Nothing else: no price ids, no webhook secret. Check `APP_PUBLIC_URL` is `https://painttradehq.co` (no trailing slash) — the app's webhook is created on it.
3. Publish. On its first start the app creates the seven live products and prices, the 10 % GST rate and its own webhook endpoint, and keeps the ids.
4. Confirm: Settings › Platform (you only) → the Stripe status line shows "live", every id "created" or "found", webhook set. Then a trial sign-up with a real card of yours, cancelled at once, proves the loop.
5. Rules: live keys never on the preview; test keys never on the published app. If a key ever lands in a chat, roll it (Developers → API keys → the row's menu → Roll key) and set the new value.

## 3. Resend — the sender address

**State.** Your Resend account has `painttradehq.co` verified (sending on, region Tokyo) and two API keys named "PTHQ" and "PTHQ-SERVER". The app is set to send from `painttradehq.com.au`, which is not a Resend domain, so every email from the preview fails with "This API key is not authorized to send emails from painttradehq.com.au". Since the app lives at `painttradehq.co`, the sender must be on that domain. (I had registered `painttradehq.com.au` in Resend before you said which domain is the real one; it sits there unverified and unused — say the word and I remove it.)

**Steps:**

1. Emergent sets the preview's sender to `no-reply@painttradehq.co` and tells us the variable's name (asked; it also sends the app's own test email once).
2. Emergent → Manage Publishes → Environment variables: the same variable = `no-reply@painttradehq.co`. Publish.
3. The API key: Resend keys can be limited to one domain. "PTHQ-SERVER" is the likely server key; if it was created for all domains nothing changes. If the test in step 4 fails with "not authorized", create a new key in resend.com → API keys → **Create**, permission "Sending access", domain **All domains** (or `painttradehq.co`), and set it as `RESEND_API_KEY` in the published variables (and the preview's secrets).
4. Test from the live app after the publish: Settings › Business › Connected services › Email → **Send a test email**. A passing result is the email in your inbox from `no-reply@painttradehq.co`. If it fails, paste the message.
5. Optional, for deliverability: in resend.com → Domains → `painttradehq.co`, check that DMARC is listed; if not, a TXT record at `_dmarc.painttradehq.co` with `v=DMARC1; p=none;` at your DNS host.

## 4. Google — the OAuth app (Drive and Calendar sign-in)

**State.** The app signs in to Google for Drive storage and Calendar with one OAuth client. Its client secret appeared in the Emergent chat weeks ago, so it must be reset. Whether the live address is allowed on it is not verifiable from here.

**Steps:**

1. console.cloud.google.com → the project that holds the client → APIs & Services → **Credentials** → the OAuth 2.0 client of type Web application.
2. **Authorised redirect URIs**, add (keep the preview ones):
   ```
   https://painttradehq.co/api/integrations/google-drive/callback
   https://painttradehq.co/api/integrations/google-calendar/callback
   ```
   **Authorised JavaScript origins**: add `https://painttradehq.co`. (Emergent is confirming these two paths against the current code; I update this line if they differ.)
3. Same screen → **Reset secret** (or Add secret, then delete the old one). Copy the new secret once.
4. Emergent → Manage Publishes → Environment variables: `GOOGLE_DRIVE_CLIENT_ID` and `GOOGLE_DRIVE_CLIENT_SECRET`; `APP_PUBLIC_URL` = `https://painttradehq.co`. Publish (variables take effect on the next publish).
5. OAuth consent screen: if it is in "Testing", add your Google accounts as test users or publish the consent screen; Google refuses sign-ins otherwise.

## 5. Google Drive on the live app

After §4. This is what stops new photos being stored inside the database.

1. Live app → Settings › Business → **Files & storage** → "Your Google Drive" → **Connect**. Sign in as the account whose Drive should hold the files (`software@joshsano.com.au` if that is the service account you chose).
2. Choose "Your Google Drive" as the storage in use. The screen says "Connected as …".
3. From then on new photos, signed contracts (Round 78) and crew welcome videos (Round 79) land in a "Paint Trade HQ" folder in that Drive. Older photos stay until the Storage tool moves them (on hold). (Checked 22 Oct: the `software@joshsano.com.au` Drive has no such folder yet — only a marketing folder "Paint Trade HQ - Email Sequence" — so Drive is not connected anywhere today.)

## 6. Xero

1. developer.xero.com → **My Apps** → **New app**: name "Paint Trade HQ", type **Web app**, company URL your website.
2. Redirect URI: the app's Xero callback on `https://painttradehq.co` — Emergent is supplying the exact path; paste it exactly, Xero rejects a one-character difference.
3. Copy the **Client ID**, generate a **Client secret**, copy it once.
4. Emergent → Manage Publishes → Environment variables: `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`. Publish.
5. Live app → Settings › Business › Accounting → **Connect** → sign in to Xero → choose the organisation. Check 3 of the admin checks then confirms an invoice pushes.

## 7. Keys that only need to be present

- **Google Places / geocoder key** (address finder, job map, geofence): console.cloud.google.com → Credentials → the API key → **Application restrictions**: if "HTTP referrers" is on, add `https://painttradehq.co/*`; if "IP addresses", switch to referrers or none. Published variables must carry the same name the preview uses (Emergent is confirming the name).
- **Claude (Anthropic) key**: the app's own key for Lucy, briefs and summaries. Present on the preview. The published variables must have it too; nothing to connect.
- Emergent lists these for us; nothing to paste here.

## 8. Database (optional, on hold)

The app runs in Google Cloud Iowa and its database in AWS Oregon, which is most of the remaining slowness. Option 1 from Emergent support: Manage Publishes → Database → **Upgrade** to the dedicated database add-on in the app's region. Your call, when you want it; nothing else depends on it.

## After each one

Say which step is done, or paste the exact error. Press **Save to GitHub** in Emergent after each publish so the code copy stays current.
