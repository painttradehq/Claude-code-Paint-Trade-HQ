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

Every price is recurring, monthly, `aud`, with `tax_behavior` left unspecified (GST is still an open question, §8.5 of the billing spec; "inclusive" or "exclusive" cannot be changed once set, so it waits for the answer). Each product and price carries `metadata.pthq_plan` or `metadata.pthq_seat` + `metadata.pthq_tier`, and `metadata.pthq_env` names the secret it belongs to.

## The preview webhook endpoint

- Id `we_1UTDML0makc3HAyOMSSUMIco`, URL `https://pthq-replica.preview.emergentagent.com/api/billing/webhook`, status enabled, test mode.
- Events: `checkout.session.completed`; `customer.subscription.created / updated / deleted / trial_will_end`; `invoice.paid / payment_succeeded / payment_failed / upcoming`; `customer.updated`; `payment_method.attached / detached`; `subscription_schedule.created / updated / released / completed / canceled / aborted`.
- Its **signing secret** is shown in the Stripe dashboard only: Test mode → Developers → Webhooks → this endpoint → Signing secret → Reveal. That value goes into the preview secret `STRIPE_WEBHOOK_SECRET`.

## What Josh still does (three values into Emergent's preview Secrets)

1. `STRIPE_SECRET_KEY` = the test secret key (`sk_test_…`) from Test mode → Developers → API keys → Reveal test key.
2. `STRIPE_PUBLISHABLE_KEY` = the test publishable key (`pk_test_…`) from the same page.
3. `STRIPE_WEBHOOK_SECRET` = the signing secret above (`whsec_…`).
4. The seven price ids above, each under its secret name — or leave them to Emergent: the go message carries the ids and Emergent writes them into the preview env itself.
5. Say "stripe key in". The go message to Emergent then asks for the Round 80 Stripe flows end to end with the test card 4242 4242 4242 4242.

## Live mode, later

The same seven products and prices are created again in live mode (same names, amounts and metadata), a live webhook endpoint on the real domain, and the three live values go into the **published** app's secrets. Not before the GST answer, because `tax_behavior` on the live prices follows it.
