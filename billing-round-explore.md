# The billing round — what it would be (exploration for Josh, 17 October)

Josh: "not sure about this one too, need to explore." This is what the app does today, what your pricing decision needs, and the decisions only you can make. No spec yet.

## 1. What the app does today (Round 64 code)

- **Two paid tiers, not three.** `backend/billing.py` knows `standard` and `pro`, each monthly or yearly, as four Stripe price ids read from the server's secrets (`STRIPE_PRICE_STANDARD_MONTHLY` and so on). A business's tier is whichever price it pays for.
- **A trial and a gate.** New businesses get a trial; when it ends with no subscription, the subscription gate blocks the app and the pay strip shows. Tester invites can override the gate (your Platform page).
- **Almost no feature gating.** The only place the tier changes what you can do is the curated materials catalogue (Pro). The "Pro" pills you see in the sidebar prototypes (CRM, Equipment, Performance, Training videos) are drawings; the app does not enforce them.
- **No seat counting.** Any business can add any number of admins and crew.
- **Your business** is the platform owner's and is exempt from the gate.

## 2. What your pricing says (`pricing.md`)

Dashboard free for everyone. Starter 59 (1 admin + 3 employees), Middle 179 (2 + 5), Pro 249 (3 + 15 active). Extra admin 25 / 25 / 42, extra employee 15 / 15 / 25 a month. Starter has some switches off (live project page, project details, Timesheets, CRM); some pages are Pro only. Training one hour; migration free on Pro, paid below. All AUD a month.

## 3. The gap, in plain words

| Needed | Today |
|---|---|
| Three plans plus a free Dashboard tier | Two plans, no free tier |
| Included seats per plan and paid extra seats | No seats at all |
| Features switched off on Starter, some Pro only | One Pro feature |
| A Billing page that shows the plan, the seats used and included, the add-ons, and lets you change or cancel | A checkout button and a status line |
| Stripe products for 3 plans and 6 add-on prices | 4 prices in secrets |

## 4. What the round would build

1. **Plans in one place.** A plan table in the code (name, price id, included admins and crew, which features are on) used by the gate, the Billing page and the invite screens. The Stripe products and prices you create once in Stripe; their ids go in the server's secrets.
2. **Settings › Billing.** Plan cards with "Current", seats used of included, add-on counters ("2 extra employees · $30/mo"), Change plan (Stripe checkout or the customer portal), Cancel, invoices. Prototyped first, as always.
3. **Seats.** Inviting an admin or a crew member past the included number asks to add a seat (a Stripe quantity on the add-on price); removing one frees it. "Active" employees count, not removed ones.
4. **Feature switches.** The Starter-off pages show a short "Not on your plan" card with the upgrade link instead of the page; the Pro-only pages the same; nothing is hidden from the sidebar, so people know it exists.
5. **The free Dashboard tier.** What a free business sees: the dashboard and what else? This is the biggest open question.
6. **Stripe webhooks** keep the tier, the seats and the add-ons in the business record; the gate reads them (through the Round 76 cache, which already invalidates on billing writes).

## 5. Decisions only you can make (one line each)

1. The free tier: dashboard only, or dashboard plus quotes with a cap?
2. Annual prices: none, or a discount (for example two months free)?
3. Trial: how many days, and on which plan does a trial run (Pro, so they see everything)?
4. Over the seat count when a plan is downgraded: block invites, or keep working and warn?
5. The middle plan's name ("Middle" in your note). "Team"? "Business"?
6. Migration "paid add-on below Pro": a fixed price, or quoted?

When these are answered, the Billing page gets a prototype and the round a spec. Nothing changes in the app before then; Check 3 of the admin checks records what the billing page does today.
