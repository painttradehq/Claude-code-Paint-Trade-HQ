// Generates src/styles/ribbon.css, the purple ribbon on /new (hero, closing band and the blog lead card).
// Run: node scripts/ribbon-gen.mjs   (then rebuild). Edit the geometry below rather than the CSS.
//
// How it works: every piece of ribbon is a "band", the area between two eccentric circles (outer circle c/ro,
// inner circle c+off/ri) cut to a sector, drawn with mask-image (two radial gradients and a conic gradient,
// mask-composite: intersect). Its surface is a stack of background layers: a grain tile (soft-light) to stop
// banding, a crease (crisp light line plus a soft shadow on the far side), a dark hem along the inner edge,
// a conic sheen along the band (where the light catches it) and a radial "satin" cross-section from the
// outer edge inward. Desktop geometry is written in a 1440x900 design space anchored to the right edge of
// the section and scaled per breakpoint; the closing band mirrors it; phones get their own three pieces.
// Design by the 31 Oct 2026 ribbon round (approach A, CSS only); see docs/website/website-plan.md.
import { writeFileSync } from 'node:fs';
const out = new URL('../src/styles/ribbon.css', import.meta.url).pathname;
const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const r1 = (n) => Math.round(n * 10) / 10;
const css = (n) => String(r1(n)).replace(/^0\./, '.').replace(/^-0\./, '-.');
const norm = (a) => ((a % 360) + 360) % 360;
const u = (a) => [Math.cos(a * D2R), Math.sin(a * D2R)];
const KY = 1.15, SY = 83;

// Eccentric band: outer circle (c, ro), inner circle (c + off, ri). Width varies smoothly around the arc.
// Sector from startAng to endAng (screen angles, clockwise = dir +1). Returns mask + geometry helpers.
// M: a transparent margin around the box. Chromium bleeds ~1px of unmasked content at a masked element's box
// edge (a faint seam), so the box is M px bigger than the outer circle and the shared CSS clips 3px off it.
const M = 6;
function band({ c, ro, ri, off = [0, 0], startAng, endAng, dir = 1, feather = 1.1 }) {
  const R = ro, size = 2 * R + 2 * M, ci = [c[0] + off[0], c[1] + off[1]];
  const e = (p) => [p[0] - (c[0] - R - M), p[1] - (c[1] - R - M)]; // element coords
  const ei = e(ci);
  const layers = [
    `radial-gradient(circle,#000 ${css(ro - 1)}px,#0000 ${css(ro)}px)`,
    `radial-gradient(circle at ${css(ei[0])}px ${css(ei[1])}px,#0000 ${css(ri - 1)}px,#000 ${css(ri)}px)`,
  ];
  let comp = 'intersect';
  if (startAng != null) {
    const fa = (feather / ro) * R2D, extent = norm(dir * (endAng - startAng));
    const fromBody = dir > 0 ? norm(startAng + 90) : norm(endAng + 90);
    layers.push(`conic-gradient(from ${css(fromBody - fa)}deg,#0000,#000 ${css(fa)}deg ${css(extent + fa)}deg,#0000 ${css(extent + 2 * fa)}deg)`);
    comp = 'intersect,intersect';
  }
  // position (px along the gradient line) of a straight line through page point p for a linear-gradient at angle a (CSS deg)
  const lineStop = (aDeg, p) => {
    const dirv = [Math.sin(aDeg * D2R), -Math.cos(aDeg * D2R)];
    const Lg = Math.abs(size * dirv[0]) + Math.abs(size * dirv[1]);
    const d = (p[0] - c[0]) * dirv[0] + (p[1] - c[1]) * dirv[1];
    return Lg / 2 + d;
  };
  return { c, ci, ro, ri, size, left: c[0] - R - M, top: c[1] - R - M, e, ei, mask: layers.join(','), comp, lineStop };
}
// cross-section from the OUTER edge inward (stops as px inward from ro), centred on c
const satinOut = (ro, stops) => `radial-gradient(circle,${stops.slice().reverse().map(([d, col]) => `${col} ${css(ro - d)}px`).join(',')})`;
// hem along the INNER edge (centred on ci): dark underside strip with a light edge line
const hem = (b, w, dark, mid, line) => `radial-gradient(circle at ${css(b.ei[0])}px ${css(b.ei[1])}px,${dark} ${css(b.ri + 1)}px,${mid} ${css(b.ri + w - 3)}px,${line} ${css(b.ri + w - 1)}px ${css(b.ri + w)}px,#0000 ${css(b.ri + w + 1)}px)`;
// along-the-band shading: stops in screen degrees (absolute)
const conicAbs = (stops) => { const f = stops[0][0] + 90; return `conic-gradient(from ${css(norm(f))}deg,${stops.map(([a, col]) => `${col} ${css(a + 90 - f)}deg`).join(',')})`; };
// crease: crisp light line + soft shadow falling on the far side. a = CSS gradient angle pointing to the shadow side.
const crease = (b, aDeg, p, shadowLen, light, shadow) => {
  const P = b.lineStop(aDeg, p);
  return [
    `linear-gradient(${aDeg}deg,#0000 ${css(P - 3)}px,${light} ${css(P - 2)}px ${css(P - 0.5)}px,#0000 ${css(P)}px)`,
    `linear-gradient(${aDeg}deg,#0000 ${css(P - 0.5)}px,${shadow} ${css(P + 0.5)}px,${shadow.slice(0, 7)}00 ${css(P + shadowLen)}px)`,
  ];
};
const GRAIN = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23g)' opacity='.16'/%3E%3C/svg%3E")`; // low-opacity grain, normal blend (soft-light left a faint fringe at the box edge in Chromium)

// ---------- desktop scene (design space; visible window at 1440: x 0..1440, y 48..686) ----------
const U = band({ c: [1720, 430], ro: 820, ri: 620, off: [-72, 154], startAng: 100, endAng: 260 });
const T = band({ c: [1494, 348], ro: 636, ri: 600 });
const sheenU = conicAbs([[100, '#1f183d59'], [122, '#1f183d1a'], [136, '#ffffff2e'], [150, '#ffffff0d'], [168, '#1f183d26'], [180, '#1f183d00'], [205, '#ffffff00'], [222, '#ffffff4d'], [232, '#ffffff59'], [246, '#ffffff1a'], [262, '#1f183d4d']]);
const sheenEnd = conicAbs([[100, '#1f183d73'], [140, '#1f183d40'], [176, '#1f183d2e'], [196, '#1f183d00'], [226, '#ffffff14'], [248, '#ffffff40'], [262, '#ffffff4d']]);
const satinU = satinOut(820, [[0, '#fff'], [1.5, '#e6dffa'], [5, '#8a79d6'], [9, '#7a63c9'], [10, '#c3b7ec'], [11.5, '#7a63c9'], [16, '#7a63c9'], [48, '#9a8cd8'], [78, '#aa9ce0'], [105, '#8a79d6'], [165, '#6b5bb5'], [245, '#4b3e86'], [330, '#34295e'], [420, '#2a2150']]);
const hemU = hem(U, 18, '#1f183d', '#2a2150', '#8a79d6');
const [creaseLightU, creaseShadowU] = crease(U, 225, [968, 430], 90, '#ffffffb3', '#1f183d99');
const turnU = `linear-gradient(225deg,#0000 ${css(U.lineStop(225, [968, 430]))}px,#1f183d33 ${css(U.lineStop(225, [968, 430]) + 1)}px)`;
const thinT = satinOut(636, [[0, '#fff'], [1, '#f1eefa'], [2.5, '#7a63c9'], [7, '#c3b7ec'], [11, '#e6dffa'], [18, '#b7a8ea'], [27, '#8a79d6'], [33.5, '#5c4c9e'], [36, '#2a2150']]);

// ---------- phone pieces (section coords at 390 wide, anchored right) ----------
const PW = 390;
const P1 = band({ c: [800, 120], ro: 480, ri: 380, off: [-24, 66], startAng: 100, endAng: 262 });
const sheenP = conicAbs([[100, '#1f183d66'], [150, '#1f183d1a'], [175, '#ffffff00'], [205, '#ffffff40'], [225, '#ffffff1a'], [262, '#1f183d33']]);
const satinP = satinOut(480, [[0, '#fff'], [1.5, '#e6dffa'], [4, '#8a79d6'], [10, '#7a63c9'], [26, '#9a8cd8'], [40, '#aa9ce0'], [55, '#8a79d6'], [75, '#6b5bb5'], [100, '#4b3e86'], [130, '#34295e']]);
const [creaseLightP, creaseShadowP] = crease(P1, 225, [345, 250], 50, '#ffffffb3', '#1f183d99');
const turnP = `linear-gradient(225deg,#0000 ${css(P1.lineStop(225, [345, 250]))}px,#1f183d40 ${css(P1.lineStop(225, [345, 250]) + 1)}px)`;
const S2 = band({ c: [380, 1352], ro: 900, ri: 844, off: [-140, 0], startAng: 236, endAng: 300 });
const sheenS = conicAbs([[236, '#1f183d59'], [252, '#1f183d1a'], [262, '#ffffff00'], [278, '#ffffff40'], [290, '#ffffff00'], [300, '#1f183d33']]);
const satinS = satinOut(900, [[0, '#fff'], [1.5, '#e6dffa'], [4, '#8a79d6'], [9, '#7a63c9'], [20, '#9a8cd8'], [30, '#aa9ce0'], [38, '#8a79d6'], [48, '#6b5bb5'], [60, '#4b3e86'], [75, '#34295e']]);
const hemS = hem(S2, 10, '#1f183d', '#2a2150', '#8a79d6');
const E3 = band({ c: [700, 650], ro: 588, ri: 526, off: [-40, 36], startAng: 190, endAng: 255 });
const sheenE = conicAbs([[190, '#1f183d59'], [206, '#1f183d1a'], [216, '#ffffff00'], [232, '#ffffff26'], [246, '#ffffff00'], [255, '#1f183d33']]);
const satinE = satinOut(588, [[0, '#fff'], [1.5, '#e6dffa'], [4, '#8a79d6'], [9, '#7a63c9'], [22, '#8a79d6'], [34, '#9a8cd8'], [44, '#7a63c9'], [56, '#5c4c9e'], [70, '#4b3e86'], [90, '#34295e']]);
const hemE = hem(E3, 12, '#1f183d', '#2a2150', '#8a79d6');


// ---------- blog lead card (card space 560x340, anchored right; the card is #2a2150 with white text) ----------
const CW = 560;
const C1 = band({ c: [764, 196], ro: 334, ri: 246, off: [-28, 58], startAng: 100, endAng: 262 });
const sheenC = conicAbs([[100, '#1f183d59'], [128, '#1f183d1a'], [150, '#ffffff00'], [184, '#ffffff40'], [206, '#ffffff14'], [230, '#1f183d00'], [262, '#1f183d40']]);
const satinC = satinOut(334, [[0, '#fff'], [1.5, '#e6dffa'], [4, '#9a8cd8'], [9, '#8a79d6'], [10.5, '#c3b7ec'], [12, '#8a79d6'], [26, '#aa9ce0'], [44, '#9a8cd8'], [62, '#7a63c9'], [84, '#6b5bb5'], [110, '#5c4c9e'], [140, '#4b3e86'], [180, '#34295e']]);
const hemC = hem(C1, 10, '#1f183d', '#2a2150', '#8a79d6');
const [creaseLightC, creaseShadowC] = crease(C1, 225, [432, 196], 50, '#ffffffb3', '#1f183d99');
const turnC = `linear-gradient(225deg,#0000 ${css(C1.lineStop(225, [432, 196]))}px,#1f183d33 ${css(C1.lineStop(225, [432, 196]) + 1)}px)`;
const posC = (b) => `right:${css(CW - (b.left + b.size))}px;top:${css(b.top)}px;width:${b.size}px;height:${b.size}px;mask-image:${b.mask};mask-composite:${b.comp}`;

const pos = (b) => `left:${css(b.left)}px;top:${css(b.top + SY)}px;width:${b.size}px;height:${b.size}px;mask-image:${b.mask};mask-composite:${b.comp}`;
const posR = (b, v) => `right:${css(PW - (b.left + b.size))}px;${v}width:${b.size}px;height:${b.size}px;mask-image:${b.mask};mask-composite:${b.comp}`;
const bg = (layers) => `background:${layers.join(',')}`;

const style = `
.ribbon,.wpost__ribbon{--g:${GRAIN}}
.ribbon .rb i,.ribbon .rb div,.ribbon .rp i,.wpost__ribbon .rc i{position:absolute;display:block}
.rb__u,.rb__us,.rb__t,.rp__a,.rp__as,.rp__c,.rp__e,.rc__a,.rc__as{clip-path:inset(3px)}
.rb{position:absolute;right:0;top:50%;width:1440px;height:900px;margin-top:-450px;transform-origin:100% 50%;transform:translateX(var(--dx,0px)) scale(var(--s,1)) scaleY(${KY})}
.rb__u,.rb__us{${pos(U)}}
.rb__t{${pos(T)}}
.rb__u{${bg(['var(--g)', creaseLightU, creaseShadowU, turnU, hemU, sheenU, satinU])}}
.rb__t{${bg(['var(--g)', thinT])}}
.rb__s{inset:0;filter:blur(14px);transform:translate(16px,22px)}
.rb__us{background:#2a2150;opacity:.42}
.rb__gl{left:140px;top:-200px;width:220px;height:2000px;background:linear-gradient(90deg,#fff0,#fff8 50%,#fff0);mix-blend-mode:soft-light;transform:rotate(-30deg);animation:rbgl 44s ease-in-out infinite alternate}
.rb__t{animation:rbt 56s ease-in-out infinite alternate}
.rb__m{inset:0;animation:rbm 40s ease-in-out infinite alternate}
@keyframes rbgl{to{transform:rotate(-30deg) translateX(110px)}}
@keyframes rbt{to{transform:translate(-16px,22px)}}
@keyframes rbm{to{transform:translate(6px,-12px)}}
@media(prefers-reduced-motion:reduce){.ribbon *,.wpost__ribbon *{animation:none!important}}
@supports not (mask-composite:intersect){.rb,.rp,.rc{display:none}}
@media(min-width:1160px) and (max-width:1439px){.nh .rb{--s:.86;--dx:max(0px,632px - 50vw)}}
@media(min-width:861px) and (max-width:1159px){.nh .rb{--s:.72;--dx:max(0px,1108px - 100vw)}}
.ribbon--end .rb{right:auto;left:0;transform-origin:0 50%;transform:translateX(calc(806px - var(--dx,0px))) scale(-.56,.56) scaleY(${KY})}
.ribbon--end .rb__u{${bg(['var(--g)', creaseLightU, creaseShadowU, turnU, hemU, sheenEnd, satinU])}}
@media(min-width:1600px){.nh .rb{--s:1.15}}
@media(min-width:861px){.nend .rb{--dx:max(0px,713px - 50vw)}.rp{display:none}}
.rp{position:absolute;inset:0;overflow:hidden}
.rp__a,.rp__as{${posR(P1, 'top:' + css(P1.top) + 'px;')}}
.rp__c{${posR(S2, 'bottom:' + css(-(S2.c[1] + S2.ro - 513)) + 'px;')}}
.rp__e{${posR(E3, 'bottom:' + css(-(E3.c[1] + E3.ro - 285)) + 'px;')}}
.rp__a{${bg(['var(--g)', creaseLightP, creaseShadowP, turnP, sheenP, satinP])}}
.rp__c{${bg(['var(--g)', hemS, sheenS, satinS])}}
.rp__e{${bg(['var(--g)', hemE, sheenE, satinE])}}
.rp__s{position:absolute;inset:0;filter:blur(8px);transform:translate(8px,10px)}.rp__as{background:#2a2150;opacity:.4}
.rc{position:absolute;inset:0;overflow:hidden}
.rc__a,.rc__as{${posC(C1)}}
.rc__a{${bg(['var(--g)', creaseLightC, creaseShadowC, turnC, hemC, sheenC, satinC])}}
.rc__s{position:absolute;inset:0;filter:blur(10px);transform:translate(8px,12px)}.rc__as{background:#120d26;opacity:.5}
.rc__a{animation:rbm 40s ease-in-out infinite alternate}
@media(max-width:860px){.rb{display:none}.rp{animation:rbm 40s ease-in-out infinite alternate}}
`;

const heroMarkup = `<div class="rb"><i class="rb__t"></i><div class="rb__m"><div class="rb__s"><i class="rb__us"></i></div><i class="rb__u"><i class="rb__gl"></i></i></div></div><div class="rp"><div class="rp__s"><i class="rp__as"></i></div><i class="rp__a"></i><i class="rp__c"></i></div>`;
const cardMarkup = `<div class="rc"><div class="rc__s"><i class="rc__as"></i></div><i class="rc__a"></i></div>`;
const endMarkup = `<div class="rb"><i class="rb__t"></i><div class="rb__m"><div class="rb__s"><i class="rb__us"></i></div><i class="rb__u"><i class="rb__gl"></i></i></div></div><div class="rp"><i class="rp__e"></i></div>`;


writeFileSync(out, `/* Generated by scripts/ribbon-gen.mjs; edit the generator, not this file. */\n${style.trim()}\n`);
console.log('wrote', out, Buffer.byteLength(style, 'utf8'), 'bytes');
console.log('\nhero markup:\n' + heroMarkup + '\n\nclosing markup:\n' + endMarkup + '\n\ncard markup:\n' + cardMarkup);
