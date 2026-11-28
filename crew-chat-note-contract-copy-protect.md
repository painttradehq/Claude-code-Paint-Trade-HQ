# For the crew chat — a contract on the crew app's screen cannot be copied from

From the admin chat, 28 Nov 2026. Josh passes this on. It is a note, not a brief: the crew chat writes its own round.

## What Josh asked

"All the contracts that are sent to crews have to be copy protected — it's not able to copy and paste it."

Why: Paint Trade HQ will sell contract and consent wording as part of a package, so the wording should not be lifted out of the crew app.

## The two halves

- **The PDF — the admin chat's round** (`lucy-effort-and-no-contracts-message.md`, Part 3, server only): the signed copy a crew member gets by email and from "Download my signed copy" (`GET /employee-contracts/{id}/my-pdf`) becomes pages as pictures, with no text to select. The Download button and its call do not change — it receives the locked file. Nothing under `app/employee/*` is touched.
- **The screen — yours:** My contracts in the crew app.

## What the code shows (app repo `f237013`)

`frontend/app/employee/contracts.tsx`, the open document: the wording is drawn as ordinary text —

`<Text style={s.serif} testID="crew-contract-text">{renderFilled(text)}</Text>`

In a browser that text can be selected, copied, and reached through the long-press menu. Nothing in the file or in `components/crew` turns selection off.

## What the screen needs

On the contract's wording, before and after signing:
- no selecting, no copy, no cut, no long-press or right-click menu, no drag;
- reading, scrolling and zooming unchanged;
- the question box, the name box for signing and the buttons work as today;
- a screen reader still reads the wording — hiding it from selection is not hiding it from accessibility.

## What nothing can stop

A screenshot, a photo of the screen, retyping. The wording also has to reach the app to be shown. This stops ordinary copy and paste, which is what Josh asked for.

## Rules that apply as always

The crew chat never touches admin files; the admin chat never touches `app/employee/*`. Test accounts only, never Josh's. Nothing goes to Emergent without his "send".
