# Stripe test mode — the seven prices and the preview webhook (created 22 Oct 2026)

Created through the Stripe connector in **test mode** on the "Paint Trade HQ" Stripe account. No live-mode object was touched. Price ids and product ids are not secrets; the secret key and the webhook signing secret are, and they are **not** in this file or in any chat.

## Price ids for the Emergent preview secrets

| Secret name (preview) | Price id | Product | AUD a month |
|---|---|---|---|
| `STRIPE_PRICE_STARTER` | `price_1UTDKV0makc3HAyOilRYTlkn` | Starter (`prod_VUBhb0Kc72tVpw`) | 59 |
| `STRIPE_PRICE_SMALL` | `price_1UTDKm0makc3HAyOU1yx4djm` | Small business (`prod_VUBi3TYvmwTdQh`) | 179 |
| `STRIPE_PRICE_ENTERPRISE` | `price_1UTDKp0makc3HAyOzAli3eGs` | Enterprise (`prod_VUBigXmwThBxpG`) | 249 |
| `STRIPE_PRICE_SEAT_ADMIN` | `price_1UTDLO0makc3HAyOcyItVaLN` | Extra admin seat (`prod_VUBiGrBdnfjtLw`) | 25 |
| `STRIPE_PRICE_SEAT_ADMIN_ENTERPRISE` | `price_1UTDLb0makc3HAyOblxyA5br` | Extra admin seat, Enterprise (`prod_VUBjyF3e4RDeib`) | 42 |
| `STRIPE_PRICE_SEAT_EMPLOYEE` | `price_1UTDLj0makc3HAyO4Ev5Kzfi` | Extra employee seat (`prod_VUBjA8EIxToibx`) | 15 |
| `STRIPE_PRICE_SEAT_EMPLOYEE_ENTERPRISE` | `price_1UTDLq0makc3HAyOA3mISymt` | Extra employee seat, Enterprise (`prod_VUBjTwutRQoERy`) | 25 |

Every price is recurring, monthly, `aud`, **`tax_behavior = inclusive`** (Josh, 22 Oct: the prices are the amounts charged, GST included; set on all seven, which Stripe does not allow to be changed again). Each product and price carries `metadata.pthq_plan` or `metadata.pthq_seat` + `metadata.pthq_tier`, and `metadata.pthq_env` names the secret it belongs to.

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

The same seven products and prices are created again in live mode (same names, amounts, metadata, `tax_behavior = inclusive`), a live webhook endpoint on the published app's address (Josh to say which), and the three live values go into the **published** app's secrets. Needs the connector widened to live mode. Not before the preview flows pass.
