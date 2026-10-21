# Platform steps — the five things only Josh can do (17 October)

None of these is code. Each is a few clicks in a dashboard you own. "Your live address" below means what the browser shows when you open the live app (the custom domain). Secrets go in Emergent's Deployment Panel only, never in a chat.

## 1. Publish the What's new drafts

Users see nothing in the bell until each draft is published.

1. Live app → Settings › Platform › **Updates** tab.
2. The drafts, oldest first: 12 "Crew daily reports, rebuilt", 13 "Line details, roomier", 14 "Add to the Library from the quote", 15 "Faster everywhere", 16 "Quicker pages", 17 "Prices that include GST"; after the next publish of the app (Rounds 78, 78b, 74 and 79): 18 "Signed contracts, delivered", 19 "Show your work, your way", 20 "Your crew app, your way". Open each, read the text once, press **Publish**. Leave the email option off unless you want every business emailed.
3. Order matters only for the bell's list; publish in that order. Unpublish exists if one reads wrong; tell me the words to change.

## 2. Resend: the `.com.au` sender

The sender `no-reply@painttradehq.com.au` only works once the domain is verified in Resend.

1. resend.com → **Domains** → `painttradehq.com.au`. If it says "Not started" or "Pending", open it: Resend lists three or four DNS records (DKIM, SPF for the return path, and DMARC).
2. At your DNS host (where the domain was bought), add those records exactly as shown. Wait; press **Verify** in Resend. All green = done.
3. Nothing to redeploy: the sender was already set in the Deployment Panel.
4. Test from the app: Settings › Business › Connected services › Email → **Send a test email** (it calls the app's own test route). If it fails, the message names the reason; send it to me.

## 3. Google: redirect addresses on the live domain, and a fresh secret

The Google client secret appeared in the Emergent chat earlier, so it must be reset, and the live domain must be allowed.

1. console.cloud.google.com → APIs & Services → **Credentials** → the OAuth client the app uses (Web application).
2. **Authorised redirect URIs**: add, with your live address in place of the placeholder:
   ```
   https://<your live address>/api/integrations/google-drive/callback
   https://<your live address>/api/integrations/google-calendar/callback
   ```
   Keep the preview ones if they are there. **Authorised JavaScript origins**: add `https://<your live address>`.
3. Same screen → **Reset secret** (or Add secret, then delete the old one). Copy the new secret once.
4. Emergent → Manage Publishes → **Secrets**: set `GOOGLE_DRIVE_CLIENT_ID` and `GOOGLE_DRIVE_CLIENT_SECRET` (the names the code reads today; the example file in the repo documents them). Also check `APP_PUBLIC_URL` is your live address with `https://` and no trailing slash; the callback addresses are built from it.
5. **Redeploy** (secrets take effect on the next deploy).
6. If the Google consent screen is still in "Testing" mode, add your own Google accounts as test users or publish the consent screen, or Google refuses the sign-in.

## 4. Connect Google Drive on the live app

After step 3 is live. This is what stops photos being stored inside the app's database at all.

1. Live app → Settings › Business → **Storage** → "Your Google Drive" → **Connect**. Sign in as the account whose Drive should hold the files (software@joshsano.com.au if that is the service account you chose).
2. Pick "Your Google Drive" as the storage mode on the same screen. The screen then says "Connected as …".
3. From then on new photos and the signed contracts (Round 78) land in a "Paint Trade HQ" folder in that Drive, one sub-folder per job. Older photos stay where they are until the Storage tool moves them (on hold).

## 5. Xero developer app

Needed before Settings › Business › Accounting › Connect can work.

1. developer.xero.com → **My Apps** → **New app**: name "Paint Trade HQ", type **Web app**, company URL your website.
2. Redirect URI: the app's Xero callback on your live address. Ask Emergent in one line for the exact path ("what is the production Xero redirect URI?") and paste it exactly; Xero rejects anything that differs by a character.
3. Copy the **Client ID**, generate a **Client secret**, copy it once.
4. Emergent → Manage Publishes → **Secrets**: `XERO_CLIENT_ID`, `XERO_CLIENT_SECRET`. **Redeploy**.
5. Live app → Settings › Business › Accounting → **Connect** → sign in to Xero → choose the organisation. Check 3 of the admin checks then confirms an invoice pushes.

## 6. Stripe prices for the billing round (before "send 80")

The Billing page sells three plans and two kinds of extra seat, so Stripe needs seven recurring prices. Do it in **test mode** first (the toggle at the top of the Stripe dashboard), give Emergent the test ids for the preview, and repeat in live mode before publishing.

1. Stripe dashboard → Product catalogue → **Add product**, one product per line, each with one recurring monthly price in AUD: Starter 59 · Small business 179 · Enterprise 249 · Extra admin seat 25 · Extra admin seat (Enterprise) 42 · Extra employee seat 15 · Extra employee seat (Enterprise) 25.
2. Open each price and copy its id (it starts with `price_`).
3. Emergent chat → Secrets: `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_SMALL`, `STRIPE_PRICE_ENTERPRISE`, `STRIPE_PRICE_SEAT_ADMIN`, `STRIPE_PRICE_SEAT_ADMIN_ENTERPRISE`, `STRIPE_PRICE_SEAT_EMPLOYEE`, `STRIPE_PRICE_SEAT_EMPLOYEE_ENTERPRISE`. The existing `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` stay; the old `STRIPE_PRICE_STANDARD_*` / `STRIPE_PRICE_PRO_*` stay too.
4. Settings → Billing → **Customer portal**: leave payment method and invoice history on, switch plan changes off (the app owns switching).
5. Decide GST: if the prices are to have GST added on top, turn on Stripe Tax for Australia; if 59 / 179 / 249 are the amounts charged, leave it off. Tell me which, it is §8.5 of the spec.

## After each one

Say which step is done, or paste the exact error. Also press **Save to GitHub** in Emergent after each publish, so the code copy stays current.
