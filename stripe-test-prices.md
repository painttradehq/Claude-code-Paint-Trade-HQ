# Stripe test mode — the seven prices and the preview webhook (created 22 Oct 2026; prices re-created the same day for GST on top)

Created through the Stripe connector in **test mode** on the "Paint Trade HQ" Stripe account. No live-mode object was touched. Price ids and product ids are not secrets; the secret key and the webhook signing secret are, and they are **not** in this file or in any chat.

## Price ids for the Emergent preview secrets

| Secret name (preview) | Price id | Product | AUD a month |
|---|---|---|---|
| `STRIPE_PRICE_STARTER` | `price_1UTDmJ0makc3HAyOzkXxe3Uy` | Starter (`prod_VUBhb0Kc72tVpw`) | 59 + GST |
| `STRIPE_PRICE_SMALL` | `price_1UTDmM0makc3HAyOOY9fWBym` | Small business (`prod_VUBi3TYvmwTdQh`) | 179 + GST |
| `STRIPE_PRICE_ENTERPRISE` | `price_1UTDmR0makc3HAyOozLy4HYH` | Enterprise (`prod_VUBigXmwThBxpG`) | 249 + GST |
| `STRIPE_PRICE_SEAT_ADMIN` | `price_1UTDnZ0makc3HAyOJvSZW6oB` | Extra admin seat (`prod_VUBiGrBdnfjtLw`) | 25 + GST |
| `STRIPE_PRICE_SEAT_ADMIN_ENTERPRISE` | `price_1UTDmg0makc3HAyOGft7T6Vc` | Extra admin seat, Enterprise (`prod_VUBjyF3e4RDeib`) | 42 + GST |
| `STRIPE_PRICE_SEAT_EMPLOYEE` | `price_1UTDmj0makc3HAyOhxGRJZoZ` | Extra employee seat (`prod_VUBjA8EIxToibx`) | 15 + GST |
| `STRIPE_PRICE_SEAT_EMPLOYEE_ENTERPRISE` | `price_1UTDmm0makc3HAyOkSzefJOY` | Extra employee seat, Enterprise (`prod_VUBjTwutRQoERy`) | 25 + GST |

Every price is recurring, monthly, `aud`, **`tax_behavior = exclusive`** — Josh, 22 Oct: the prices are **ex-GST, 10% GST is added on top** ($59 → $64.90 charged). The first seven prices had been set inclusive on a misread "yes"; Stripe does not allow that to change, so they are **retired** (`active = false`, nickname "retired - GST-inclusive, replaced 22 Oct"; ids `…KV…`, `…Km…`, `…Kp…`, `…LO…`, `…Lb…`, `…Lj…`, `…Lq…`) and each product's default price is the new one. The GST itself is a Stripe **tax rate** (10%, exclusive, AU, display name "GST") that Emergent creates through the API and stores as `STRIPE_TAX_RATE_GST`, applied as `default_tax_rates` on every checkout and subscription; the connector does not expose tax rates. Each product and price carries `metadata.pthq_plan` or `metadata.pthq_seat` + `metadata.pthq_tier`, and `metadata.pthq_env` names the secret it belongs to.

## The preview webhook endpoint

- Id `we_1UTDML0makc3HAyOMSSUMIco` — **disabled 22 Oct**: Josh could not find its signing secret in the dashboard, so Emergent creates the preview's endpoint itself through the API with the test key and writes the signing secret straight into the preview env (nobody handles it). The disabled one stays as a record; the connector has no delete.
- Events: `checkout.session.completed`; `customer.subscription.created / updated / deleted / trial_will_end`; `invoice.paid / payment_succeeded / payment_failed / upcoming`; `customer.updated`; `payment_method.attached / detached`; `subscription_schedule.created / updated / released / completed / canceled / aborted`.
- The new endpoint's signing secret goes into `STRIPE_WEBHOOK_SECRET` by Emergent; it never appears in a chat.

## What Josh still does (three values into Emergent's preview Secrets)

1. `STRIPE_SECRET_KEY` = the test secret key (`sk_test_…`) from Test mode → Developers → API keys → Reveal test key.
2. `STRIPE_PUBLISHABLE_KEY` = the test publishable key (`pk_test_…`) from the same page.
3. ~~`STRIPE_WEBHOOK_SECRET`~~ — Emergent sets it (above).
4. The seven price ids — Emergent writes them into the preview env (sent 22 Oct).
5. Done 22 Oct: the go for the Round 80 Stripe flows is sent; Josh had put the two keys in.

## Live mode, later

Josh widened the connector on 22 Oct, but it came back with a **sandbox** ("Paint Trade HQ sandbox", `acct_1UTCoL1rbCPUqQhY`, test mode), not live mode; nothing was created there. Rather than depend on live-mode access, the app gets a **find-or-create at startup** (sent to Emergent 22 Oct as part of the Round 80 Stripe step): when the `STRIPE_PRICE_*` variables are unset it finds its products by metadata or creates them (same names, amounts, metadata, `tax_behavior = exclusive`), likewise the GST tax rate, and the webhook endpoint for `{APP_PUBLIC_URL}/api/billing/webhook` with the signing secret kept in the platform settings record; env values win when set; `GET /api/platform/maintenance/stripe` (platform owner) shows mode and where each id came from. **Live setup then needs only two values in the published app's secrets: the live secret key and the live publishable key.** Not before the preview flows pass.
