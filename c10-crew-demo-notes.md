# C10 — The crew demo (spec v1.2, 28 Nov 2026)

Prototype `c1-crew-shell.html` (260,072 bytes, md5 247fcbbb5d582b3f485379e2e6b1894c) at 390 × 844, then 360 × 800: `?screen=app&tab=today&demo=1` (the demo over the Dashboard), `?screen=app&tab=me` → **What's new in the app** (the replay). Live facts read from `main` at f237013 and re-read by a second reader, who also read the pinned libraries' source (react-native-web 0.21.2, async-storage 2.2.0, bottom-tabs 7.18); fifteen corrections folded in. Round C9 does not edit the two screens this round edits or `PhotoSheet.tsx`; re-read the cited lines before building. Frontend only; no backend change.

## 1. What this round builds

The time clock left the Dashboard for the left edge in C7, and the job page gained the whole scope. A crew member opening the app after the update needs to be shown both, once.

**The demo**: a sheet over the Dashboard with two small moving pictures, each a drawn mock-up of the phone (plain views, no video, no image files), each with a title and a few lines of words:

1. **The time clock moved to the left edge** — a finger swipes in from the left edge, the clock panel slides out, the finger taps Sign in, the status turns green.
2. **The whole job, line by line** — a job page with "The work · 3 areas · 9 lines"; a finger taps a line and it opens to a note and a marked photo.

The quote has no page in the demo (Josh, 28 Nov: "do just the one and two"); nothing in it says "quote".

**Next**, **Back**, **Skip**, two dots, **Got it** on the last. A sideways swipe turns the page. It opens by itself once per crew member on a phone — the first time the Dashboard is ready and in front — and never again by itself. **Me › Account › What's new in the app** plays it again.

## 2. Live facts (main at f237013)

- `frontend/app/employee/(tabs)/dashboard.tsx`: `const { user } = useAuthStore()` :31; `notifs, …, loaded: notifsLoaded, load, markRead` from `useCrewStore()` :32; `waited` :34–35 (true after 4 s); `const [popup, setPopup]` :37; the focus effect :39; the popup effect :52–55 (deps `[notifs]`: an unread `accomplishment` notification and no popup → `setPopup`); `const ready = waited || (…)` :69 — so `ready` can turn true on the 4 s timer **before** the notifications have answered; the root views :72; `CrewAlertsCard` :83; `<AccomplishmentPopup …>` :143 (a `Modal`; its close marks the notification read, then clears `popup` when the request returns; its close button is `crew-accomplishment-close`). `notifType` is imported :11.
- Tabs stay mounted once visited (no `freezeOnBlur` in `(tabs)/_layout.tsx`), so an effect on the Dashboard keeps running while another tab or a pushed screen is in front. expo-router here exports `useFocusEffect` (used :39), not `useIsFocused`.
- `frontend/app/employee/(tabs)/me.tsx`: `user` :23; `useState` imported :4; the Account section :79–83 — `<Row first icon="keypad-outline" title="PIN sign-in" … testID="crew-me-pin" />` then `<Row icon="log-out-outline" title="Sign out" tone="danger" … testID="crew-me-signout" />`. `Row` (`(tabs)/_layout.tsx:104`) takes `icon, title, sub, onPress, testID, first` (and `count, tone, right, dim, dot`); its sub is one line (`numberOfLines={1}` :112) with about 208 px of room at 360 wide.
- `frontend/components/crew/PhotoSheet.tsx`: `Sheet({ visible, onClose, title?, children, testID })` :9–19 — a `Modal` (slide), a `Pressable` scrim whose press is `onClose` (`{testID}-scrim`), a `Pressable` sheet (`testID`) anchored to the bottom (`sh.sheet` :61: padding 8 top, 28 bottom, 16 sides, max width 430, no max height, no scroll view) with the grab bar; it takes no other props. `SheetButton({ label, onPress, primary, testID, disabled })` :28 — without `primary` it is the outline look (`sh.btnOutline` :69); `sh.btn` :67 is 52 px tall with `marginTop: 8` and takes no style. Two buttons side by side are done as in `components/crew/PasswordSheet.tsx:37–40`: a row with `gap: 10` and each button in a `<View style={{ flex: 1 }}>`.
- On the web a `Modal` is portaled to `document.body` above everything (z-index 9999): the edge clock (`components/crew/EdgeClock.tsx`, handle zIndex 40) and the tab bar are under it, and the column's edge swipe cannot fire inside it. react-native-web fires `onPress` from the DOM `click`: a touch drag makes no click, but a **mouse** drag begun on the sheet and released over the dim clicks the scrim. The sheet `Pressable` takes the responder on touch start, so a pan handler that only asks on move (EdgeClock's capture pattern :51) is never asked inside it.
- A flag kept on the phone with AsyncStorage: `utils/crewPin.ts:1,5–11` (default import from `@react-native-async-storage/async-storage`; on the web it is `localStorage` under the raw key). (`CrewAlerts.tsx` keeps its dismissal in bare `localStorage`, one flag per phone — not the pattern to copy.) Sign-out clears only the auth keys and the PIN device; two crew members can use one phone, so the flag is per crew member.
- Animation in the crew app today: `Animated.timing(…, { duration: 220, useNativeDriver: Platform.OS !== 'web' })` (`EdgeClock.tsx:44–46`); no loop and no reduced-motion handling in the crew app. On react-native-web `AccessibilityInfo.isReduceMotionEnabled()` returns a Promise of the `prefers-reduced-motion` match; `aria-hidden` is forwarded to the DOM and `accessibilityElementsHidden` is not; `interpolate` accepts percent strings (`'-104%'` → `'0%'`) when every output has the same shape.
- No committed script signs a crew member in through the browser; the crew screen harnesses (`c7_ui.py`, `c7_switches.py`, `c8_ui.py`) live in the git-ignored `test_reports/`.

## 3. Strings (exact)

Kicker `What's new` · **Skip** · **Back** · **Next** · **Got it**.

1. `The time clock moved to the left edge` — `Tap the line on the left edge of the screen, or swipe in from it, to sign in and out. It is there on every screen, and it turns green while you are on the clock.`
2. `The whole job, line by line` — `Open a job to see every area and every line of the work. Tap a line for its note, its paint and the marked photos.`

Inside the pictures (tiny, part of the drawing): `Signed out`, `Signed in`, `Sign in`, `THE WORK · 3 AREAS · 9 LINES`.

Me row: title `What's new in the app`, sub `A short tour of the changes`.

## 4. Frontend (`app/employee/*`, `components/crew/*` only)

### 4.1 `components/crew/AppDemo.tsx` (new)
- `export const demoKey = (userId: string) => `pthq_crew_demo_v1:${userId}`;` `export async function demoSeen(userId)` — AsyncStorage `getItem(...) === '1'`, and **true on any error** (a phone that cannot store the flag is never nagged); `export async function markDemoSeen(userId)` — `setItem(..., '1')`, errors swallowed.
- `export function AppDemo({ visible, onClose }: { visible: boolean; onClose: () => void })`: the existing `Sheet` with no `title`, `testID="crew-demo"` (so the dim is `crew-demo-scrim`). The live sheet's own padding and width stand; the prototype's sheet chrome does not apply. Inside it one wrapper `View` carrying the pan handlers, and in it, top to bottom:
  - a row 44 px tall: the kicker left (`crew-demo-kicker`, 12.5 px semi-bold, upper case, letter spacing 0.75, `textMuted`), **Skip** right (`crew-demo-skip`, 44 px tall, 14.5 px semi-bold, `accent`);
  - the picture, centred, 2 px above and 14 px below (`crew-demo-stage`, `aria-hidden`); only the current page's picture is mounted;
  - the title (`crew-demo-title`, the display font, 22 px, line height 26, `minHeight: 52`, 6 px below) and the words (`crew-demo-body`, 15 px, line height 22, `textSecondary`, `minHeight: 92`) — the two minimums keep the sheet the same height on both pages (it is anchored to the bottom, so a shorter page would drop the top);
  - the dots, 6 px below (`crew-demo-dots`: two 7 px dots 6 px apart in `borderStrong`, the current one 18 px wide in `accent`);
  - the buttons: a row with `gap: 10` and `marginTop: 4` (the buttons' own 8 makes 12), each `SheetButton` in a `<View style={{ flex: 1 }}>`: **Back** (`crew-demo-back`, no `primary`) only from page 2, and **Next** / **Got it** (`crew-demo-next`, `primary`), full width when it is alone.
- State: `page` 0–1, reset to 0 each time `visible` turns true. Next on the last page, Skip and a tap on the dim all call `onClose`.
- **The swipe**: a `PanResponder` on the wrapper with `onStartShouldSetPanResponder: () => true` and `onMoveShouldSetPanResponder` (a mostly horizontal move), decided in `onPanResponderRelease`: `dx < −50` and not on the last page → next; `dx > 50` → back. A swipe never closes the demo. Keep `swipedAt = useRef(0)`, set on release of a pan; the `onClose` handed to `Sheet` ignores a close within 400 ms of it (the mouse case in §2 — EdgeClock's `tapOk` pattern).
- **The pictures**: each a 176 × 236 view, `borderWidth: 2`, `borderColor: t.colors.borderStrong`, `borderRadius: 22`, `backgroundColor: t.colors.bg`, `overflow: 'hidden'`, `testID` `crew-demo-pic-clock` / `crew-demo-pic-work`; when the window is shorter than 640 px the picture is drawn at 0.75 scale so the sheet still fits. Content is grey bars (7 px tall, radius 4, `borderStrong`; the "title" bars 9 px and dark), small white cards (radius 9, 1 px border) and the tiny words in §3 (the semi-bold body font). The prototype's `/* ---- C10 */` CSS block is the reference for the sizes, colours and positions of the pictures; where CSS has no direct form, use the plain equivalent (the photo tile a flat `#CFC7B6`, its marker a 7 px ring with a 2 px `danger` border). The moving parts carry test ids: the clock panel `crew-demo-pic-panel` (vertically centred in the mock: `top: '50%'` and a `translateY` of −50 %, or a centring wrapper), the line's detail `crew-demo-pic-detail`.
- **Motion**: per picture one `Animated.Value`; on each start `setValue(0)` and a **new** `Animated.loop(Animated.timing(v, { toValue: 1, duration: 5200, easing: Easing.linear, useNativeDriver: false }))` (a stopped loop cannot be restarted); stopped when the page leaves or the sheet closes. Everything is an `interpolate` of it with `easing: Easing.bezier(0.25, 0.1, 0.25, 1)` on each segment (the prototype's CSS default), outputs all of one shape (`'0%'`, never `0`). Fractions of the 5.2 s loop:
  - Picture 1: the panel's `translateX` `'-104%'` until 0.16, `'0%'` from 0.30 to 0.86, back by 0.97; a dim over the mock screen follows the same curve (opacity 0 → 1 → 0); the finger (a 22 px `accent` circle at 0.42 opacity) appears at the left edge at 0.10, travels 80 px right by 0.28, fades by 0.34, reappears on the Sign in button from 0.52 to 0.58, fades by 0.64; from 0.60 to 0.94 the status dot and the edge line are `success` and the label reads "Signed in" (two labels cross-fading).
  - Picture 2: the finger shows on the second line from 0.18 to 0.28; the line's detail (a 30 px photo tile, three bars) grows from 0 to 44 px between 0.28 and 0.40, holds to 0.90, closes by 0.99.
- **Reduced motion**: `AccessibilityInfo.isReduceMotionEnabled()` when the sheet opens. Until it answers, and whenever it is true, no loop runs, no finger is drawn, and each picture stands on its end state (the panel out with the green dot and "Signed in"; the line open). When it answers false the loop starts.

### 4.2 `app/employee/(tabs)/dashboard.tsx`
- `const [demo, setDemo] = useState(false)`; `const [focused, setFocused] = useState(false)` set true in a `useFocusEffect` and false in its cleanup; `const asked = useRef(false)`; `const alive = useRef(true)` cleared on unmount.
- The effect — the guard is set **last**, after every gate has passed:
  ```ts
  useEffect(() => {
    if (asked.current || !ready || !notifsLoaded || !focused || !user?.id || user.role !== 'employee') return;
    if (popup || notifs.some((n) => notifType(n) === 'accomplishment' && !n.read)) return; // the popup goes first
    asked.current = true;
    demoSeen(user.id).then((seen) => { if (alive.current && !seen) setDemo(true); });
  }, [ready, notifsLoaded, focused, user?.id, popup, notifs]);
  ```
  `notifsLoaded` is required as well as `ready` because `ready` can come from the 4 s timer; without it the demo could open and the popup arrive over it.
- `<AppDemo visible={demo} onClose={() => { setDemo(false); if (user?.id) markDemoSeen(user.id); }} />` beside the popup at the end of the screen. Nothing else on the Dashboard changes.

### 4.3 `app/employee/(tabs)/me.tsx`
- `const [demo, setDemo] = useState(false)`. In Account, between PIN sign-in and Sign out: `<Row icon="sparkles-outline" title="What's new in the app" sub="A short tour of the changes" onPress={() => setDemo(true)} testID="crew-me-demo" />`, and `<AppDemo visible={demo} onClose={() => { setDemo(false); if (user?.id) markDemoSeen(user.id); }} />`.

## 5. Backend

None. No route, no setting, no test file. (`pytest --collect-only` stays at the count Round C9 leaves.)

## 6. Verify (testing agent, 390 × 844 first, then 360 × 800, iPhone UA with touch, TS_ Alpha; the owner's tenant read-only)

1. **First open**: a TS_ crew member with no `pthq_crew_demo_v1:{id}` in `localStorage` signs in with the password (the PIN screen comes first on a phone without one: **Not now**) → the Dashboard's cards appear → the demo opens over them: the kicker, Skip, picture 1, its title and words, two dots, Next full width, no Back; the sheet fits inside the screen with no sideways scroll at both sizes.
2. **The pictures move**: on page 1 `crew-demo-pic-panel`'s right edge is at the mock's left edge at one moment and well inside it about two seconds later; on page 2 `crew-demo-pic-detail`'s height goes from 0 to about 44. Nothing in the demo says "quote".
3. **Paging**: Next → 2 (Back appears, the button reads Got it); the kicker's position does not move between the pages; Back returns; a real touch swipe (touch events with moves, not synthetic pointer events) left turns to page 2 and right turns back; a left swipe on page 2 does nothing; Got it closes it; `localStorage` now holds the key with `1`; the Dashboard is as it was (the alerts card, today's job, the edge handle).
4. **Once**: reload and sign in again → no demo. Remove the key and reload → it opens again; Skip → closed and the key set. Remove the key and reload; a tap on the dim near the top of the screen → closed and the key set. Once with the mouse: a drag begun on the sheet and released over the dim leaves the demo open.
5. **Under it**: with the demo open, the element at the edge handle's position and at a tab's position belongs to the demo's Modal (neither can be used).
6. **The popup first**: with an unread `accomplishment` notification for the TS_ crew member and no key, the accomplishment popup shows first; close it (`crew-accomplishment-close`) and the demo opens after the popup has gone (never both at once).
7. **Only on the Dashboard**: with no key, open a job page straight after sign-in before the Dashboard has shown the demo (or switch to Jobs within the first second) — the demo does not open over another screen; it opens on the return to the Dashboard.
8. **Me**: Account shows PIN sign-in, What's new in the app, Sign out, in that order, the row's sub on one line uncut at 360 wide; the row opens the demo on page 1 whatever the key says.
9. **Reduced motion** (emulated): the pictures stand still on their end states, no finger.
10. **Housekeeping**: `c7_ui.py`, `c8_ui.py` and any later crew screen harness must set the key before signing in, or the demo will sit over the Dashboard — say so in the report. `app/admin/*` diff empty; no backend diff; TS_ torn down (0 rows); no `rm -rf` outside `memory/tmp` and `/tmp`; nothing published.

## 7. What's new — Draft (never published)

Card title **A quick tour for your crew**. Text: "The first time each crew member opens the app after this update, two short pictures show where the time clock went and how to see the whole job, line by line. They can watch it again from Me."

## 8. Decisions (taken 28 Nov on Josh's "ask Emergent to build a small demo for the crew"; reversible)

1. **It opens by itself once**, because the Sign in button moved and people will look for it; and it can be replayed from Me. Alternative: the Me row alone.
2. **Once per crew member per phone** (a flag on the phone, keyed by the crew member). A new phone shows it again. Alternative: a flag on the account (a backend change).
3. **Everyone sees it once**, new starters too, after their first sign-in reaches the Dashboard.
4. **Drawn pictures, not a video**: nothing to host, nothing to load, and they follow the app's colours.
5. **Two pages**: the clock and the work. Josh cut the quote page on 28 Nov ("do just the one and two").
6. **The pictures do not follow the owner's switches** (a business with photos off still sees the photo tile in picture 2). Say if they should.

## 9. Test ids

`crew-demo` (the sheet), `crew-demo-scrim`, `crew-demo-kicker`, `crew-demo-skip`, `crew-demo-stage`, `crew-demo-pic-clock`, `crew-demo-pic-panel`, `crew-demo-pic-work`, `crew-demo-pic-detail`, `crew-demo-title`, `crew-demo-body`, `crew-demo-dots`, `crew-demo-back`, `crew-demo-next`, `crew-me-demo`. (In the prototype `crew-demo` sits on the dim; the live `Sheet` puts it on the sheet — the spec wins.)
