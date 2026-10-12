# Admin and crew: two front doors (exploration, 12 October 2026)

Josh, 12 Oct: opening the preview link on his phone landed on the **admin** sign-in. "We need two different builds for the login page, one admin and one crew, or even a different app for crew that coheres with the admin app. Let's explore this."

This note is the exploration. Nothing here is sent or built. Decision at the end for Josh; the build, when he picks one, is a crew-chat follow-up (it touches the entry files the crew chat owns since C1), with the admin chat checking the admin side.

## 0. What happens today (after C1 follow-ups A and B, 12 Oct)

One codebase, one domain, one deployment: `/admin/*` is the admin web app, `/employee/*` is the crew app (restyled, tabs, Jobs since C2). Who sees what is decided by **user-agent sniffing** (`utils/device.ts`, `isPhone()`):

- A "phone" is a browser whose user agent contains `iPhone` or `iPod`, or `Android` **and** `Mobile`. Everything else (iPad, Android tablets, laptops, computers) is "not a phone".
- `/` for a signed-out visitor: phone → `/employee/login`; anything else → `/admin/login`. A signed-in user goes to their own dashboard by role.
- `/employee/*` on a non-phone → `/admin/login` (root guard in `app/_layout.tsx`). `/admin/*` on a phone is left alone.

**Why Josh's phone still landed on the admin sign-in.** Three causes fit the rules; which one needs his answer:
1. The phone's browser was sending a **desktop user agent**: iPad (identifies as a Mac), or iPhone Safari with "Request Desktop Website" switched on for that site, or a browser in desktop mode.
2. He had **used the admin app on that phone before**: an expired admin session on `/` is routed by role to the admin sign-in, not by device.
3. The link he opened was an `/admin/...` URL, not `/`.

**Why device sniffing is the wrong tool for this, whatever the cause.** It answers "what device is this" when the question is "which app did you come for". iPadOS lies about being a Mac; "Request desktop site" flips the answer; Android phones and tablets differ by one token; foldables sit in between; Chrome is reducing the user-agent string year by year. And some crew uses on a laptop are legitimate (a new starter filling in onboarding at home, a crew member checking a contract on a computer). The result is what Josh hit: the wrong front door with no way through.

## 1. The options

### A. Keep device sniffing, tune it
Add more rules (screen width, a "Crew sign-in" link on the admin page). Cheap, but the fragility above stays and every new device type is a new bug. Not recommended.

### B. Two front doors on one codebase, by hostname (the standard pattern)
- `app.painttradehq.com.au` = the admin app. `/` = admin sign-in. The crew routes do not exist on this host.
- `crew.painttradehq.com.au` = the crew app. `/` = crew sign-in. The QR onboarding link, every crew email and notification link, and "Add to Home Screen" all use this host. The admin routes do not exist on this host.
- Same deployment, same backend, same code: the root layout reads the hostname once and mounts the admin tree or the crew tree. No user-agent rule anywhere. Any device opens the host it was given.
- Each host has its own web manifest (name "Paint Trade HQ" / "Paint Trade HQ Crew", icon, colours, `start_url`), so each installs as its own app on a phone. The crew manifest is what C7 planned anyway.
- Cross-links on both sign-in pages: "Crew member? Sign in at crew.painttradehq.com.au" and "Business owner? Sign in at app.painttradehq.com.au".
- Env: `APP_PUBLIC_URL` stays the admin host; a new `CREW_PUBLIC_URL` for crew links (QR, contract emails, notification links). On the preview (one hostname) the code falls back to the path rule: `/employee/*` is the crew app, `/` is the admin sign-in, no device check.
- Costs: one DNS record, a second custom domain on the Emergent deployment (**to confirm with Emergent that one deployment can carry two domains**; if not, option B′ below gives the same result without DNS), the hostname switch in `app/_layout.tsx` and `index.tsx`, two manifests, the env name. One small round.

### B′. Two front doors on one host, by path (no DNS)
Same as B, but the crew app lives at `/employee/*` (or `/crew/*`) on the same host as today, with its own manifest whose `scope` is `/employee/`. Browsers treat manifests with different scopes as different installable apps, so the crew member still gets a "Paint Trade HQ Crew" icon and the owner a "Paint Trade HQ" icon. `/` = admin sign-in; `/employee` = crew sign-in; the QR and every crew link point at `/employee/...`. Remove the device rule. Costs: a second manifest, the manifest link on crew pages, the root rule, the cross-links. Works on the preview as it is. **This is the first step of B; B adds the hostnames when the real domain goes live.**

### C. A separate crew app (own repo, own deployment)
Full separation: the crew app becomes its own Expo project talking to the same API. Benefits: independent releases and a clean native build. Costs: a second Expo project to keep in step (api client, auth store, theme tokens, BrandLogo, ProjectPhotos, the daily-report parser twin), a second Emergent job or a second frontend inside this one, CORS and the API domain, two "one round at a time" queues, and drift between the two copies. The benefit it is usually chosen for, a different stack or a different team, does not apply here. And the native store app **does not need it**: `app.config.js` reading an `APP_TARGET=crew` variable gives a separate store app (name "Paint Trade HQ Crew", its own bundle id and icon, entry at the crew sign-in) from the same repo, which is what the handover's C8 already assumes. Not recommended.

## 2. Recommendation

**B′ now, B when the real domain goes live, native in C8 from the same code. Not C.**

1. **Now (one crew-chat follow-up, small):** drop the device rule; `/` = admin sign-in for signed-out visitors on every device; `/employee` = crew sign-in; crew manifest with `scope /employee/` and its own name and icon; cross-links on both sign-in pages; the admin app stays reachable on a phone (that is the "admin on the phone, later" question, a design matter, not a routing rule).
2. **With the real domain:** `crew.painttradehq.com.au` and `app.painttradehq.com.au` on the same deployment; the root layout picks the tree by hostname; `CREW_PUBLIC_URL` for crew links. Ask Emergent in the same breath whether the deployment accepts two custom domains.
3. **C8:** the store build for crew from this codebase with `app.config.js` and `APP_TARGET=crew`. Jay's setup work per Josh's decision of record in the crew log.

This gives Josh what he asked for: two different front doors, and a crew app that installs and later ships as its own app, while the two keep sharing one backend, one design system and one codebase.

## 3. What Josh decides (one line each)

1. Which option: B′ now then B (recommended), B straight away, or C.
2. Crew host name: `crew.painttradehq.com.au` (recommended) or something else.
3. Should the admin app stay reachable on a phone (recommended yes, unchanged) or be blocked on phones.
4. Who builds it: the crew chat as a C2 follow-up before C3 (recommended, it owns the entry files since C1), with the admin chat checking `index.tsx` and the admin sign-in page.

## 4. For the record: what already exists

Two sign-in pages already exist: `/admin/login` (admin shell) and `/employee/login` (restyled in C1). The problem was never the pages; it is the single front door at `/` deciding by device, and the C1 follow-up guards that send crew pages to the admin sign-in on anything that does not look like a phone.
