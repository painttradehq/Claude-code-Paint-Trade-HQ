# Address finder — one address field everywhere, backed by Google Places — Spec Notes for Emergent

Prototype: `address-finder.html` (the Round 68 builder; open at 1440: Job address card › Edit → type "14 wat" → the list → ArrowDown + Enter → suburb, state and postcode fill and the green "On the map" line appears → type after it → the line clears → type "22 coo" → Escape closes the list only → pick with the mouse → Save; then Client › Change › New client → type "3/41" → pick; `?ac=off` = no key on the server; then 1024). Playwright `tools/test_address.js` 38/38 at 1440 and 1024. Everything not named here is unchanged.

**Owner (8 Oct):** every address in the app is typed by hand today. As the painter types, the app should suggest matching real addresses and fill the rest. Decisions: Google Places (New), Australia only, through the app's own server (the key never reaches a browser); one shared field used in every place an address is typed; free text still allowed when nothing matches; the picked map point is stored so the job map and the crew sign-in distance use a street-level point instead of today's suburb-level guess; Open-Meteo stays for weather. Owner rules: no notices or banners; nothing duplicated; no mobile / crew-app work in this round (the crew app keeps its own fields); nothing changes beyond what is listed.

## 1. Reuse / restyle / replace

| Existing piece | Decision | Notes |
|---|---|---|
| Every address `<input>` listed in §4 | **Replace** with `AddressField` | Same value, same save path, same test ids; only the input gains the list and the fill. |
| `services/geo.py` (`geocode_address`, Open-Meteo, suburb-level) | **Extend** | New `suggest()` and `place()` on Google; `geocode_address` unchanged for old records and weather. |
| Business location (`business_location` from Settings › Business, Round 36) | **Reuse** | Bias for suggestions (50 km circle), falling back to Australia-wide. |
| Crew sign-in distance / geofence (`haversine_m` callers), job map pins | **Extend** | Use the stored `location` on the job / client when present; otherwise today's geocode. No change to the crew app's screens. |
| `.env.example` | **Fix while there** | It lists `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, but the code reads `GOOGLE_DRIVE_CLIENT_ID` / `GOOGLE_DRIVE_CLIENT_SECRET` (Calendar falls back to those). Make the example match the code and add `GOOGLE_PLACES_API_KEY`. Report the names only. |

## 2. The field (`AddressField`)

- A normal text input with the label the form already has (Address · Street address · Site address · Business address · Home address · Job site or address). Placeholder "Start typing the street address". `autocomplete="off"`.
- From the third character, after a 200 ms pause, up to five suggestions appear **in the form's flow directly under the input** (the dialog grows; nothing floats or clips): first line bold "14 Wattle Street", second line muted "Balmain NSW 2041", and a small right-aligned "powered by Google" line at the bottom of the list (Google's attribution rule when their data is shown without a Google map). Suggestions are Australia only, biased to the business location.
- Keyboard: ArrowDown / ArrowUp move, Enter picks the highlighted one (or the first), Escape closes the list and nothing else (the dialog stays open), Tab closes it. Mouse: click a row. Clicking anywhere else closes the list.
- Pick → the input reads the street line ("14 Wattle Street"; a unit reads "3/41 Bay Street"); where the form has them, Suburb, State and Postcode fill; where the form has one line only, the input reads the full line "14 Wattle Street, Balmain NSW 2041". Under the input a green line `{field}-pin`: "📍 On the map · Balmain NSW 2041". The record saves `location: {lat, lng, place_id, formatted, source: 'google'}` next to the address fields it already has.
- Typing again after a pick clears the pin line and the stored point for that save (the text stays). Nothing matched → no list, no message; the text saves as typed, as today.
- No key on the server (`configured: false`) → the field is a plain text box, exactly as today, no message.

## 3. Backend (`routes/geo.py`, admin auth; the key is `GOOGLE_PLACES_API_KEY`, server only)

- `GET /api/geo/status` → `{configured}`.
- `GET /api/geo/suggest?q=&session=` → `POST https://places.googleapis.com/v1/places:autocomplete` with `input`, `includedRegionCodes: ["au"]`, `locationBias` = 50 km circle around the business location when it exists, `sessionToken` = the `session` value → `[{place_id, main, secondary}]` from `structuredFormat`, max 5. Empty list under three characters. Results cached per tenant and query for five minutes.
- `GET /api/geo/place/{place_id}?session=` → `GET https://places.googleapis.com/v1/places/{id}` with field mask `addressComponents,location,formattedAddress` (the Essentials tier) → `{street, unit, suburb, state, postcode, formatted, lat, lng}`: street = street_number + route; unit = subpremise (rendered "3/41 Bay Street"); suburb = locality; state = administrative_area_level_1 short name; postcode = postal_code.
- Session: the field makes one session token (uuid) when the painter starts typing and sends it on every suggest and on the final place call, then forgets it. That is Google's cheapest shape: the keystrokes are free inside a session, the pick is one Essentials call, 10,000 free a month. A new token per new search; never reused.
- Errors from Google (quota, network) → empty list, logged with the status code; the field simply shows no list. Never surfaces an error to the painter.
- Rate: one suggest in flight per field; the server drops a request older than the newest for that session.
- Tests (`tests/test_geo.py`, Google mocked with httpx transport mocks, no real call): status; suggest shape, three-character minimum, `au` restriction and the bias in the outgoing request, session token passed through; place parsing for a house, a unit, a rural address without a street number; cache hit; Google 429 → empty list; tenant B cannot read tenant A's cached results.

## 4. Where the field goes (every input whose label is an address; grep and list the final set in the report)

| Place | Form fields | Mode |
|---|---|---|
| CRM › Clients › Add client / Edit client (`customer-address-input`) | address + suburb/state/postcode where present | split |
| CRM › Leads › New lead (`new-lead-address`) | address | single line |
| Estimate builder › Client dialog, edit (`client-address`) and New client (`new-address`) | address + suburb/state/postcode | split |
| Estimate builder › Job address dialog (`AddressDialog`) | street + suburb/state/postcode | split |
| Invoice builder › Job address (stand-alone invoice) | site address | single line |
| Employees › Add employee / employee detail edit (`address`) | address | single line |
| Project page › Job site card (`Site address`) | address | single line |
| Daily report › "Job site or address" | address | single line |
| Settings › Business › Business address (`biz-address`) | address | single line; the existing "Pinned on the map as {suburb}" line now uses the picked point |
| Settings › Account › Home address | address | single line |

The crew app's screens are untouched. Public pages are untouched.

## 5. Stored point in use

- Job map (Dashboard) and the crew sign-in distance read `location` from the job (the project's site, else the estimate's job address, else the client) when present; otherwise the existing Open-Meteo geocode. Old records keep working exactly as today; nothing is backfilled.
- Weather keeps using Open-Meteo on the business location. No other reader changes.

## 6. Verify (agent-tested / Unverified, then the testing-agent pass at 1440 and 1024)

1. Job address dialog: "14 wat" lists five or fewer suggestions in the form's flow with the Google line; ArrowDown + Enter fills street, suburb, state, postcode and shows the pin line; typing again clears the pin; Escape closes the list and the dialog stays; a mouse pick works; Save shows the address on the card and the saved record carries `location`.
2. New client form: "3/41" finds the unit and fills Rockdale NSW 2216; the saved client carries `location`; CRM › Add client behaves the same.
3. Each single-line place in §4: the pick writes the full line and `location`; free text with no match saves as typed.
4. No key: every field is a plain text box; no message anywhere.
5. The Dashboard job map pins a job with a stored point at the street, and the crew sign-in distance uses it (tested with a TS_ crew member and a seeded point; no crew-app screen changed).
6. Suite green before and after; isolation; TS_ torn down; the owner's tenant untouched; no real call to Google in tests; no email or SMS.

What's new draft: title "Addresses that finish themselves", audience Admins & testers, Email as well = No, cards: (1) "Start typing, pick the address" · "Three letters in and the real addresses appear. Pick one and suburb, state and postcode fill in." · Try it: Estimates · picture: the list under a Job address; (2) "On the map, exactly" · "A picked address pins the job to the street, so the job map and crew sign-in distance are spot on." · picture: the green On the map line. Draft only; report the id.
