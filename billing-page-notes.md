# Round 80 — Billing: the plans in the app (SENT 21 Oct; BUILT the same day per the job — `tests/test_r80_billing.py`, `routes/billing_plans.py`, `services/plan_gate.py`, `services/plans.py` exist; the report is to be re-pasted and read; the Stripe flows wait for a test key and the seven price ids — `platform-steps.md` §6)

Prototype: **`settings-billing.html?page=billing`** (Settings rail › Billing; the Account page keeps only a line pointing here), with `&state=trial`, `&state=tester`, `&state=past_due` for the other states. Open at **1440** first, then **1024**. Playwright: `tools/test_billing.js`, **96/96** at both widths. Screenshots: `billing-1440.png`, `billing-cards-1440.png`, `billing-drawer-1440.png`, `billing-compare-1440.png`, `billing-trial-1440.png`, `billing-tester-1440.png`, `billing-1024.png`, `billing-cards-1024.png`.

Josh (21 October): "In Settings › Account the Manage billing section is not functional because it is not wired. Make it a page: all three tiers, each well explained with the benefits of switching, the one the user is on highlighted, a bit more information, like a website." Decisions the same day: **no free tier** — three packages only; the only free businesses are **testers invited by Paint Trade HQ, with access to everything**; names **Starter / Small business / Enterprise** at 59 / 179 / 249; **no annual prices yet**; **14-day trial on Enterprise**; data migration **quoted** below Enterprise; over the seat count after a downgrade: default below (§8.4), Josh to confirm.

## 1. What exists today (Round 64 code)

- `backend/billing.py`: two tiers `standard` and `pro` as four Stripe price ids in the secrets; checkout, the Stripe customer portal, webhooks that set `subscription_tier` / `subscription_status` / `current_period_end` / `cancel_at_period_end` on the admin; a 14-day trial with no card; the subscription gate (`subscription_gate.py`) blocks the app when nothing is active; tester invites override the gate (Platform › Tester invites); the platform owner's business is exempt.
- Frontend: Account page Subscription row (pill, status line, **Manage billing** → the Stripe portal, or **Upgrade** → the old full-screen `/admin/pricing` with two plans); `FeatureGate` / `ProLockedPage` used only for the curated materials catalogue; the sidebar "Pro" pills are drawings.
- No seats, no plan table, no feature switches.

## 2. The page (Settings rail › **Billing**, after Account)

Page line: "Your plan, your seats and your invoices in one place. Payment details and receipts open in Stripe, the card processor." Four sections. **Owner only** (§8.1): other admins have no Billing item in the rail.

1. **Your plan** (card): the plan pill; "{Plan} · ${price} a month"; the status line (Active · renews {date} · {card brand} ending {4}; Payment failed · update your card by {date} or the app locks until it is paid, in red; Cancels on {date} · you keep everything until then; Switches to {plan} on {date} · until then nothing changes; {Plan} · free trial with "{n} days left · ends {date} · no card yet"; Full access · tester program with "Free until {date} · no billing · invited by Paint Trade HQ"). Three facts: **Admins** "{used} of {included} included" + "{n} extra seats · ${x} a month" or "Within your plan"; **Employees** the same; **Next invoice** "${total} on {date}" + "{Plan} ${price} + seats ${extras}" (trial: "— · Add a card to continue after {date} · ${total} a month with your team as it is"; cancelled: "None · the plan ends {date}"; tester: "None"). Actions: **Payment method** and **Invoices** (both the Stripe portal), **Cancel plan**; while a downgrade is scheduled, **Keep {plan}**; while cancelled, **Resume plan**; trial: **Add a card**; past due: **Update card** + Invoices; tester: none. Note under the facts: "Seats follow your Team admins and Employees pages: add someone there and the seat is added here; remove them and it drops off at the next invoice."
2. **Plans**: three cards side by side (stacked under 1100 px). Each: name, "${price} a month · AUD", who it is for (one sentence), "{a} admins + {e} employees included · Extra admin ${x} · extra employee ${y} a month", "Includes" / "Everything in {previous}, plus" and the feature list (§3 table), then the **what-if line computed for this business**: current plan → "Your plan since {date}"; higher plan → "**Switching adds:** {short names}. **Seats:** all of your {a} admins and {e} employees are included / your {a} admins and {e} employees need {n} extra admin seat(s) and {m} extra employee seat(s) (${x} a month). **${total} a month**."; lower plan → "**Switching drops:** … **Seats:** … **${total} a month**" (+ " — no saving with your team size" when it would cost the same or more). Button: current → disabled "✓ Your plan"; higher → primary "Switch to {plan}"; lower → ghost "Switch to {plan}"; scheduled → disabled "Switching on {date}"; trial → "Choose {plan}" on every card (the trialled one ribboned "Trialling"); tester → disabled "Choose when your access ends". The current plan's card is ribboned **Your plan** with the accent border.
3. **Compare the plans**: one table — price, admins and employees included, the two seat prices, every feature with ✓ / —, Training ("— / 1 hour, one person / 1 hour per person"), Data migration ("Quoted / Quoted / Free"); the current plan's column tinted and headed "{Plan} · yours". Scrolls inside its box on narrow screens, never the page.
4. **Good to know**: six short entries — Billing (AUD a month, billed monthly through Stripe, change or cancel any time); Switching plans (upgrades today with the difference charged for the rest of the month; downgrades at the next renewal); Seats (who counts); When a plan ends (update the card by the date shown, then the app locks until a plan is chosen; data stays); Training and data migration; Tester program.

**Right drawer** for every change (nothing happens on the card): **Switch to {plan}** — upgrade: "Starts today." + What you gain, Seats, From today (Stripe charges the difference for the rest of this period, to {date}, then the new amount each month), the new monthly total; downgrade: "Starts on {date}, when the current period ends." + What switches off on {date} ("the pages stay in the sidebar with a note, nothing is deleted"), Seats, Until then (nothing changes), the total from {date}; buttons Not now / Switch to {plan}. **Cancel your plan** — "You keep {plan} until {date}", After {date} (the app locks until a plan is chosen; quotes, clients, invoices and files stay and can be exported), Seats stop with the plan, Resume any time before {date}; buttons Keep my plan / Cancel on {date}. Escape closes.

**Account page** (Josh, 21 Oct: "now that we have the Billing page, remove the Subscription section inside the Account page"): the Subscription section goes — the row, its Manage billing / Upgrade button and the Member since · Team admins · Storage facts under it. In its place one line: "The plan, the seats, the invoices and the payment method live on the Billing page", linked (for a non-owner: "Ask {owner} about the plan"). Team admins keeps its own section on the page; storage lives in Business › Files & storage. The old `/admin/pricing` screen is retired: its route, the gate's pay strip and every "Upgrade" link open Settings › Billing.

## 3. The plan table (one place, `backend/services/plans.py`, served to the frontend by `GET /billing/plans`)

| | Starter | Small business | Enterprise |
|---|---|---|---|
| Key | `starter` | `small` | `enterprise` |
| Price (AUD a month) | 59 | 179 | 249 |
| Admins / employees included | 1 / 3 | 2 / 5 | 3 / 15 |
| Extra admin / extra employee a month | 25 / 15 | 25 / 15 | 42 / 25 |
| Features | Dashboard; estimating and quoting with the full library; payments and invoicing; CRM, calendar and the Employees page; project management (live project page + project details) | Starter + presentation pages on quotes; auto-invoicing; Lucy; SMS to clients; Timesheets; business performance stats on the live project page; AI summaries (project details, per client in the CRM); one hour of training for one person | Small business + Performance page; training videos; HR contracts with e-sign; daily reports from the crew; Equipment; one hour of training per person; free data migration |

Feature keys: `presentation, auto_invoicing, lucy, sms, timesheets, project_stats, ai_summaries` (Small business and up); `performance, training_videos, contracts, daily_reports, equipment` (Enterprise). Everything else is on every plan. Stripe prices (Josh creates them, test mode first, then live — `platform-steps.md` §6): `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_SMALL`, `STRIPE_PRICE_ENTERPRISE`, `STRIPE_PRICE_SEAT_ADMIN` (25), `STRIPE_PRICE_SEAT_ADMIN_ENTERPRISE` (42), `STRIPE_PRICE_SEAT_EMPLOYEE` (15), `STRIPE_PRICE_SEAT_EMPLOYEE_ENTERPRISE` (25). The old `STRIPE_PRICE_STANDARD_*` / `STRIPE_PRICE_PRO_*` stay readable for businesses still on them (§8.2).

## 4. Seats

- **Admins** = the members on the Team admins list, the owner included. **Employees** = employees on the Employees page who have not been removed (ended or removed employees do not count). One definition on every plan.
- The subscription in Stripe is the plan price plus two seat items with quantities (`extra_admins`, `extra_employees`), each `max(0, used − included)`. Inviting past the included number asks "{n} of {included} admin seats are used — this adds an extra seat at ${x} a month" with Continue / Not now; on Continue the quantity goes up at once (prorated for the rest of the period). Removing someone lowers the quantity **at the next invoice** (no credit mid-period), as the page says.
- **Over the seat count after a downgrade** (§8.4, default): the business keeps working; the Billing page and the Team admins / Employees pages show "{n} more {admins|employees} than {plan} includes — ${x} a month in extra seats" and the extra seats are billed; nobody is removed and nothing is hidden.

## 5. Backend

| Route | What it does |
|---|---|
| `GET /billing/plans` | The plan table (§3) for the cards and the table. Public to any admin. |
| `GET /billing/overview` | `{ state: active\|trialing\|past_due\|cancelling\|tester\|owner\|none, plan, price, period_end, trial_end, tester_until, card: {brand, last4}, seats: { admins: {used, included, extra, price}, employees: {…} }, next_invoice: {amount, date, lines}, pending_plan, since }`. The "none" state (trial over, cancelled and run out, payment failed past the date) is what the gate shows. |
| `POST /billing/change-plan { plan }` | Upgrade: Stripe subscription updated now (plan price swapped, seat items re-priced, `proration_behavior: always_invoice`), `subscription_tier` set by the webhook. Downgrade: `pending_plan` stored and a Stripe subscription schedule (or the swap applied by the period-end webhook) switches at `current_period_end`; the page shows "Switches to … on {date}". |
| `DELETE /billing/change-plan` | Drops the pending downgrade. |
| `POST /billing/cancel` / `POST /billing/resume` | `cancel_at_period_end` true / false. |
| `POST /billing/create-checkout-session { plan }` | Trial or none → Stripe checkout with the plan price and the seat items at today's quantities; returns to Settings › Billing. |
| `POST /billing/customer-portal` | As today, with the portal configured for **payment method and invoices only** (no plan switching in Stripe's UI — the app owns that). |
| Webhooks | As today plus the seat quantities, `pending_plan`, `trial_end`, `card` (from the default payment method) on the admin record; `subscription_tier` ∈ `starter \| small \| enterprise`; the Round 76 principal cache invalidates on every billing write, as it does now. |
| Gate | `subscription_gate.py` reads `state`; `none` blocks everything except Settings › Billing, Account and sign-out, and the pay strip's link opens the Billing page. Tester overrides and the platform owner's exemption unchanged. |
| Feature access | `services/plans.has(business, feature)`; routes behind a feature refuse with `403 { detail: "plan_required", feature, plan: "small"\|"enterprise" }`. The crew app's routes are not gated (the crew's features are the admin's choice in Settings › Crew app). |

## 6. Feature switches in the admin frontend

One component, **`PlanCard`** ("Not on your plan"): "{Feature} is on the {plan} plan and up. See the plans" → Settings › Billing; owner-only link text for non-owners: "Ask {owner} about the plan". Nothing is hidden from the sidebar; a page below the plan shows the pill of the plan it needs (replacing today's "Pro" drawings: **Small business** on Timesheets for a Starter business; **Enterprise** on Performance, Training videos, Contracts, Daily reports, Equipment below Enterprise). Where each feature shows the card instead of the thing: Timesheets, Performance, Training videos, Contracts, Daily reports, Equipment → the page body; Presentation → the Quote set-up tab and the Quote details section (quotes get no pages); auto-invoicing → the switch disabled with the card's line; Lucy → the Lucy button opens the card; SMS → the SMS option disabled with the line; project stats on the live project page, the AI summary on project details and the per-client AI summary in the CRM → a small card in their place. The crew app and the public pages are untouched.

## 7. Verify (testing agent, 1440 then 1024, TS_ tenants on Stripe **test mode**)

1. The Account page has no Subscription section, only the line linking to Billing; the rail item exists (owner only); `/admin/pricing` redirects there; the pay strip links there.
2. TS_ Alpha on Small business with 2 admins and 7 employees: the facts read "2 of 2 included", "7 of 5 included · 2 extra seats · $30 a month", "$209 on {date} · Small business $179 + seats $30"; the three cards; Small business ribboned; the Enterprise what-if says "all … included · $249 a month"; the Starter what-if says "1 extra admin seat and 4 extra employee seats ($85 a month) · $144 a month"; the table's tinted column.
3. Switch to Enterprise → drawer → confirm → Stripe test subscription updated now; the overview shows Enterprise, "7 of 15 included", "$249 on {date}"; the card and the column follow. Switch to Starter → drawer says it starts at the period end → confirm → "Switches to Starter on {date}", the Starter button "Switching on …", **Keep Enterprise** → back.
4. Cancel → drawer → confirm → "Cancels on {date}", Resume → active. Payment method and Invoices open the Stripe portal (payment method and invoices only).
5. Trial (a fresh TS_ tenant): the trial card, **Add a card** → checkout with the seat items; after the test card, active. Tester tenant: the tester card, no actions, the plans not choosable. Past due (Stripe test clock or a simulated `invoice.payment_failed`): the red line and **Update card**.
6. Seats: inviting a third admin on Small business asks about the extra seat; Continue → the Stripe quantity rises and the facts update; removing an employee leaves the quantity until the next invoice.
7. Switches: a Starter TS_ tenant opens Timesheets → the PlanCard, the sidebar pill "Small business"; its Lucy button, SMS option, auto-invoicing switch and presentation tab show the line; a Small business tenant opens Performance → "Enterprise"; the backend refuses the gated routes with `403 plan_required`; Enterprise sees everything. The crew app for the same tenants is unchanged.
8. The platform owner's tenant and a tester tenant are never gated. Isolation: tenant B's billing never shows for A. Non-owner admin: no Billing rail item; the Account page's line reads "Ask {owner} about the plan". 1024: no horizontal scroll; no console errors; `tsc` clean; `app/employee/*` untouched.

## 8. Decisions and defaults (Josh's answers of 21 Oct; the rest are defaults to confirm)

1. **Owner only.** Billing is money: only the business owner sees the Billing page and can change the plan; team admins have no Billing item.
2. **Existing subscriptions** on the old `standard` / `pro` prices map to Small business / Enterprise for features and keep their Stripe price until they change plan or seats.
3. **Trial** 14 days on Enterprise, no card (as today); at the end, the gate with the Billing page.
4. **Over the seat count after a downgrade**: keep working, bill the extra seats, show the count; no one removed. (Josh: "not sure what that is" — it is what happens when a business with 7 employees moves from Small business to Starter, which includes 3.)
5. **GST**: prices are shown as "a month · AUD". *Open question*: are 59 / 179 / 249 the amounts charged (GST included) or is GST added on top? The invoice line and Stripe's tax setting follow the answer.
6. **Platform owner's tenant**: the tester-style card with "Platform owner · no billing" and no actions.
7. Downgrade mid-period gives no credit; the seat removal rule is the same. Stated on the page.

## 9. What's new (Draft only)

**Title:** Plans and billing, in one place
**Body:** Settings has a new Billing page: your plan, your seats and your next invoice; the three plans explained side by side with what switching would mean for your team; and switching or cancelling without leaving the app. Payment details and receipts still open in Stripe.

## 10. Before "send 80"

- Josh creates the seven Stripe prices in **test mode** and puts their ids in the preview secrets (`platform-steps.md` §6); the same again in live mode before publishing.
- Josh answers §8.5 (GST) and confirms §8.1, §8.4.
- This round comes after the crew chat's half of Round 79. It is one round in two parts built in order: part 1 the page, the plan table, seats and Stripe (§2–§5); part 2 the feature switches (§6). Part 2 ships with part 1 — the page must not say "switching drops Timesheets" while Timesheets still works on Starter.
