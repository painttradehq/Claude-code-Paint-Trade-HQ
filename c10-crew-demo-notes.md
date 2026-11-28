# C10 — The crew demo (spec v1.1, 28 Nov 2026)

Prototype `c1-crew-shell.html` (259,620 bytes, md5 8c6cc519c12531d3063f9e9fe113f640) at 390 × 844, then 360 × 800: `?screen=app&tab=today&demo=1` (the demo over the Dashboard), `?screen=app&tab=me` → **What's new in the app** (the replay). Live facts read from `main` at f237013 (the two files this round edits are not touched by Round C9). Frontend only; no backend change.

## 1. What this round builds

The time clock left the Dashboard for the left edge in C7, and the job page gained the whole scope and the quote. A crew member opening the app after the update needs to be shown both, once.

**The demo**: a sheet over the Dashboard with two small moving pictures, each a drawn mock-up of the phone (plain views, no video, no image files), each with a title and two lines of words:

1. **The time clock moved to the left edge** — a finger swipes in from the left edge, the clock panel slides out, the finger taps Sign in, the status and the edge line turn green.
2. **The whole job, line by line** — a job page with "The work · 3 areas · 9 lines"; a finger taps a line and it opens to a note and a marked photo.

The quote has no page in the demo (Josh, 28 Nov: "do just the one and two"); the words never mention it.

**Next**, **Back**, **Skip**, two dots, **Got it** on the last. A sideways swipe turns the page. It opens by itself once per crew member on a phone — the first time the Dashboard is ready — and never again by itself. **Me › Account › What's new in the app** plays it again.

## 2. Live facts (main at f237013)

- `frontend/app/employee/(tabs)/dashboard.tsx`: `const { user } = useAuthStore()` :31; `const [popup, setPopup]` :37 and its effect (an unread `accomplishment` notification opens `AccomplishmentPopup`, a `Modal`, rendered :143); the focus effect :39; `const ready = waited || (…)` :69 (the cards appear together when the first answers are in, or after 4 s); the root views `crew-pane-today` / `crew-pane-dashboard` :72; `CrewAlertsCard` :83.
- `frontend/app/employee/(tabs)/me.tsx`: the Account section :79–83 — `<Row first icon="keypad-outline" title="PIN sign-in" … testID="crew-me-pin" />` then `<Row icon="log-out-outline" title="Sign out" tone="danger" … testID="crew-me-signout" />`. `Row` (`(tabs)/_layout.tsx:104`) takes `icon, title, sub, onPress, testID, first`.
- `frontend/components/crew/PhotoSheet.tsx`: `Sheet({ visible, onClose, title?, children, testID })` :9–19 — a `Modal` (slide), a `Pressable` scrim whose press is `onClose` (`{testID}-scrim`), a `Pressable` sheet with the grab bar; no scroll view, no max height. `SheetButton({ label, onPress, primary, testID, disabled })` :28. On the web a `Modal` is portaled above the crew column, so the edge clock (`components/crew/EdgeClock.tsx`, mounted in `app/employee/_layout.tsx`) and the tab bar are under it.
- A flag kept on the phone, the existing pattern: `components/crew/CrewAlerts.tsx:39` (`const DISMISS = 'pthq_crew_alerts_dismissed'`, AsyncStorage) and `utils/crewPin.ts:5–11`. On the web AsyncStorage is `localStorage` under the same key.
- Animation in the crew app today: `Animated.timing(x, { toValue, duration: 220, useNativeDriver: Platform.OS !== 'web' })` (`EdgeClock.tsx:44–46`). No loop and no reduced-motion handling exists anywhere yet.

## 3. Strings (exact)

Kicker `What's new` · **Skip** · **Back** · **Next** · **Got it**.

1. `The time clock moved to the left edge` — `Tap the line on the left edge of the screen, or swipe in from it, to sign in and out. It is there on every screen, and it turns green while you are on the clock.`
2. `The whole job, line by line` — `Open a job to see every area and every line of the work. Tap a line for its note, its paint and the marked photos.`

Inside the pictures (tiny, part of the drawing): `Signed out`, `Signed in`, `Sign in`, `THE WORK · 3 AREAS · 9 LINES`.

Me row: title `What's new in the app`, sub `A short look at the time clock and the job page`.

## 4. Frontend (`app/employee/*`, `components/crew/*` only)

### 4.1 `components/crew/AppDemo.tsx` (new)
- `export const demoKey = (userId: string) => `pthq_crew_demo_v1:${userId}`;` `export async function demoSeen(userId)` (AsyncStorage `getItem(...) === '1'`, false on any error) and `export async function markDemoSeen(userId)` (`setItem(..., '1')`, errors swallowed).
- `export function AppDemo({ visible, onClose }: { visible: boolean; onClose: () => void })`: the existing `Sheet` with no `title`, `testID="crew-demo"`. Inside, top to bottom: a row 44 px tall with the kicker left (`crew-demo-kicker`, 12.5 px semi-bold, upper case, `textMuted`) and **Skip** right (`crew-demo-skip`, 44 px tall, 14.5 px semi-bold, `accent`); the picture, centred (`crew-demo-stage`, `accessibilityElementsHidden` / `aria-hidden`); the title (`crew-demo-title`, the display font, 22 px, line height 26); the words (`crew-demo-body`, 15 px, line height 22, `textSecondary`, `minHeight: 92` so the buttons do not jump between pages); the dots (`crew-demo-dots`: two 7 px dots, the current one 18 px wide in `accent`, `accessibilityLabel` "1 of 2"); then a row of `SheetButton`s 12 px below: **Back** (`crew-demo-back`, outline, absent on the first page) and **Next** / **Got it** (`crew-demo-next`, primary), equal widths. State: `page` 0–1, reset to 0 each time `visible` turns true. Next on the last page, Skip, and a press on the dim all call `onClose`. A horizontal pan on the sheet (a `PanResponder`: `|dx| > 50` and `|dx| > 1.5 × |dy|`) turns the page: left = Next (never past the last page), right = Back.
- **The pictures**: each a 176 × 236 view, `borderWidth: 2`, `borderColor: t.colors.borderStrong`, `borderRadius: 22`, `backgroundColor: t.colors.bg`, `overflow: 'hidden'`, with `testID` `crew-demo-pic-clock` / `-work`. Content is grey bars (7 px tall, radius 4, `borderStrong`; the "title" bars 9 px and dark), small white cards (radius 9, 1 px border) and the tiny words in §3. The prototype's `/* ---- C10 */` CSS block is the reference for every size, colour and position; copy it rather than redesign.
- **Motion**: one `Animated.Value` per picture running `Animated.loop(Animated.timing(v, { toValue: 1, duration: 5200, easing: Easing.linear, useNativeDriver: false }))`, started when the page shows and stopped when it leaves or the sheet closes; everything is an `interpolate` of it (fractions of the 5.2 s loop):
  - Picture 1: the panel's `translateX` −104 % until 0.16, 0 from 0.30 to 0.86, back by 0.97; a dim over the mock screen follows the same curve (opacity 0 → 1 → 0); the finger (a 22 px `accent` circle at 0.42 opacity) appears at the left edge at 0.10, travels 80 px right by 0.28, fades by 0.34, reappears on the Sign in button from 0.52 to 0.58, fades by 0.64; from 0.60 to 0.94 the edge line and the status dot are `success` and the label reads "Signed in" (two labels cross-fading).
  - Picture 2: the finger shows on the second line from 0.18 to 0.28; the line's detail (a 30 px photo tile with a red ring, three bars) grows from 0 to 44 px between 0.28 and 0.40, holds to 0.90, closes by 0.99.
- **Reduced motion**: read `AccessibilityInfo.isReduceMotionEnabled()` when the sheet opens (on the web fall back to `window.matchMedia('(prefers-reduced-motion: reduce)').matches` if the first is unavailable); when on, no loop runs, no finger is drawn, and each picture stands on its end state (the panel out and green, the line open).

### 4.2 `app/employee/(tabs)/dashboard.tsx`
- `const [demo, setDemo] = useState(false)` and a `useRef(false)` "asked" guard. An effect on `[ready, user?.id, popup, notifs]`: when `ready`, `user?.id` is set, no `popup` is showing, no unread `accomplishment` notification is waiting (the popup goes first), and the guard is clear → set the guard, `await demoSeen(user.id)`, and if not seen `setDemo(true)`.
- `<AppDemo visible={demo} onClose={() => { setDemo(false); if (user?.id) markDemoSeen(user.id); }} />` beside the popup at the end of the screen. Nothing else on the Dashboard changes.

### 4.3 `app/employee/(tabs)/me.tsx`
- In Account, between PIN sign-in and Sign out: `<Row icon="play-circle-outline" title="What's new in the app" sub="A short look at the time clock and the job page" onPress={() => setDemo(true)} testID="crew-me-demo" />`, and `<AppDemo visible={demo} onClose={() => { setDemo(false); if (user?.id) markDemoSeen(user.id); }} />`.

## 5. Backend

None. No route, no setting, no test file. (`pytest --collect-only` stays at the count Round C9 leaves.)

## 6. Verify (testing agent, 390 × 844 first, then 360 × 800, iPhone UA with touch, TS_ Alpha; the owner's tenant read-only)

1. **First open**: a TS_ crew member with no `pthq_crew_demo_v1:{id}` in `localStorage` signs in → the Dashboard's cards appear → the demo opens over them: the kicker, Skip, picture 1, its title and words, two dots, Next, no Back; the sheet fits inside the screen with no sideways scroll at both sizes.
2. **The pictures move**: on page 1 the mock panel's right edge is at the mock's left edge at one moment and well inside it about two seconds later; on page 2 the detail's height goes from 0 to about 44. Nothing in the demo says "quote".
3. **Paging**: Next → 2 (Back appears, the button reads Got it); Back returns; a touch swipe left and right turns the page; Got it closes it; `localStorage` now holds the key with `1`; the Dashboard is as it was (the alerts card, today's job, the edge handle).
4. **Once**: reload and sign in again → no demo. Remove the key → it opens again; Skip → closed and the key set; remove it again; a tap on the dim → closed and the key set.
5. **Under it**: with the demo open, the element at the edge handle's position and at a tab's position belongs to the demo's Modal (neither can be used).
6. **The popup first**: with an unread `accomplishment` notification for the TS_ crew member and no key, the accomplishment popup shows first and the demo opens after it is closed (never both at once).
7. **Me**: Account shows PIN sign-in, What's new in the app, Sign out, in that order; the row opens the demo on page 1 whatever the key says.
8. **Reduced motion** (emulated): the pictures stand still on their end states, no finger.
9. **Housekeeping**: every other screen check a harness runs must set the key first, or the demo will sit over the Dashboard — say so in the report for the next rounds. `app/admin/*` diff empty; no backend diff; TS_ torn down (0 rows); no `rm -rf` outside `memory/tmp` and `/tmp`; nothing published.

## 7. What's new — Draft (never published)

Card title **A quick tour for your crew**. Text: "The first time each crew member opens the app after this update, two short pictures show where the time clock went and how to see the whole job, line by line. They can watch it again from Me."

## 8. Decisions (taken 28 Nov on Josh's "ask Emergent to build a small demo for the crew"; reversible)

1. **It opens by itself once**, because the Sign in button moved and people will look for it; and it can be replayed from Me. Alternative: the Me row alone.
2. **Once per crew member per phone** (a flag on the phone, as the alerts card's dismissal is). A new phone shows it again. Alternative: a flag on the account (a backend change).
3. **Everyone sees it once**, new starters too, after their first sign-in reaches the Dashboard.
4. **Drawn pictures, not a video**: nothing to host, nothing to load, and they follow the app's colours.
5. **Two pages**: the clock and the work. Josh cut the quote page on 28 Nov ("do just the one and two").

## 9. Test ids

`crew-demo`, `crew-demo-scrim`, `crew-demo-kicker`, `crew-demo-skip`, `crew-demo-stage`, `crew-demo-pic-clock`, `crew-demo-pic-work`, `crew-demo-title`, `crew-demo-body`, `crew-demo-dots`, `crew-demo-back`, `crew-demo-next`, `crew-me-demo`.
