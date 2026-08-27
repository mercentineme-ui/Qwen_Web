# CORE-ARCHITECTURE — as implemented in CreativeCore.tsx (V1-APPROVED)

Documented from the live source. Nothing here is invented — every constant is a
verbatim value from the component.

## Entry point

`CreativeCore.tsx` default-exports the section component, rendered by
`App.tsx` between the Expertise and Show Reel sections. Section element:
`<section id="core" className="relative py-20 lg:py-28 scroll-mt-20">`.

Internal layout (Tailwind grid):

```
grid lg:grid-cols-[1.22fr_0.78fr] gap-12 lg:gap-14 xl:gap-16 items-center
├── LEFT  — Reveal → container div (max-w-[620px] aspect-square) → SVG machine + node DOM
└── RIGHT — Reveal(delay 0.12) → detail card
```

## Coordinate system

- SVG `viewBox 0 0 600 600`, centre `C = 300`, disciplines `N = 9`, `DEG = π/180`.
- Polar helpers: `pt(r, deg)` → absolute SVG coords (0° = 12 o'clock, clockwise);
  `pct(i, r)` → % of container for the HTML node layer; `ptOf(cx, cy, r, deg)`.
- `angleOf(i) = i * 40` — nodes are evenly spaced every 40°.
- `wrap(d)` normalises angles to (−180, 180] so the pointer always takes the shortest path.

## Radial geometry constants (verbatim)

| Constant | Value | Element |
|---|---|---|
| `NODE_PCT` | 39 | node orbit, % of container |
| `R_WALL` | 184 | outer structural wall |
| `R_FACE` | 177 | housing front face |
| `R_INDEX_OUT` / `R_INDEX_IN` | 162 / 148 | outer index ring band |
| `R_PRI_OUT` / `R_PRI_IN` / `R_PRI_MID` | 142 / 120 / 131 | primary rotating ring track |
| `R_SEC_OUT` / `R_SEC_IN` | 114 / 102 | secondary transmission ring |
| `R_PLATE` | 98 | recessed engine plate |
| `R_HUB` | 58 | hub mounting plate |

## Gear train constants (verbatim)

| Constant | Value | Element |
|---|---|---|
| `G_MAIN` | `{ r: 40, teeth: 18 }` | dominant central gear |
| `G_SMALL` | `{ r: 16, teeth: 8 }` | offset transmission gears (×2) |
| `G_OFF` | 56 | mesh distance (40 + 16) |
| `GA` | `{ a: 45 }` | offset gear A angle |
| `GB` | `{ a: 160 }` | offset gear B angle |
| `LOWER` | `{ a: 215, d: 76, r: 14, housing: 24 }` | lower secondary regulator |

## Machine layers (SVG group hierarchy = physical depth stack)

```
<g ref=orbitalG>                       ← whole machine (opacity during theme split)
 ├─ <g ref=housingG>                   ← LEVEL 1 · OUTER HOUSING (static)
 │    shadow circle (cy+4, rgba(0,0,0,.3))
 │    wall (R_WALL) · face line (R_FACE) · recessed channel (R_FACE−3)
 │    12 radial divisions · 12 fastening bolts
 │    LEVEL 2 · OUTER INDEX RING (static): 36 teeth every 10°, every 9th emphasised
 ├─ <g ref=primaryRingG>               ← LEVEL 3 · PRIMARY ROTATING RING (slow CW)
 │    track bed (R_PRI_MID, stroke 16) · 48 timing marks (major every 6th)
 │    12 segment divisions · crimson timing marker block (travels with ring)
 ├─ <g ref=secondaryRingG>             ← secondary ring (slow CCW, dashed mid-track)
 ├─ <g ref=surgeArcG>                  ← faint crimson arc riding the secondary ring
 ├─ <g ref=plateG>                     ← LEVEL 4 · RECESSED ENGINE PLATE
 │    machining circles (r 86/74) · 12 construction lines · 8 mounts
 │    4 radial structural arms at 0/90/180/270 (alternating length 40/34)
 ├─ <g ref=hubPlateG>                  ← LEVEL 5 · CENTRAL HUB plate + segmented housing (12 ticks)
 ├─ lower regulator group (static shell; gear ref=lowerGearG)
 ├─ <g ref=centralGearG> / gearAG / gearBG   ← central gear train
 ├─ bearing + axle circles (r 13 / 7)
 ├─ <g ref=ptrRotG>                    ← ARTICULATED POINTER (see below)
 ├─ <circle ref=pulseC>                ← radial pulse
 ├─ <line ref=signalLine> + <circle ref=signalDot>   ← lock signal (node → centre)
 └─ <g ref=couplingsG>                 ← nine node couplings (rotated per node)
```

Outside `orbitalG` but inside the container:
`<circle ref=glowC>` cursor glow (r 92, crimson radial gradient 0.09→0).

## The articulated pointer (refs inside `ptrRotG`)

```
ptrRotG            rotate(ptrAngle) about C                    ← whole assembly aims
 ├─ ptrFoldG       translate(C, C−26) rotate(fold)             ← 2nd stage folds at joint 1
 │   ├─ ptrLink2   rect — telescoping link (height = span)
 │   ├─ telescoping collar rect
 │   ├─ ptrJoint2  circle joint 2 (cy = joint2Y)
 │   └─ ptrTipG    translate(C, joint2Y) → crimson mechanical tip path
 ├─ first-stage support link rect (C−26 → C−8)
 ├─ articulation gear at joint 1 (r 8, t 7, counter-rotates: −1.25× ptrSpin)
 ├─ ptrDriveGearG  primary drive gear on the axle (r 15, t 9, spins ptrSpin)
 ├─ support gear   offset at (C+17, C+13), r 9, counter-rotates −1.6× ptrSpin
 └─ crimson axle status dot (r 3)
```

Kinematics (per frame): `span = 24 + 34·ext`, `joint2Y = C − 26 − span`,
`fold = (1 − ext)·68°`. Fully retracted: link nested, folded 68° around joint 1.
Fully extended: tip reaches `C − 26 − 58 = 216` (radius 84 from centre) — inside
the engine plate, never touching the nodes at r ≈ 234.

## Node layer (HTML, positioned by `pct(i, NODE_PCT)`)

Each node: wrapper div (ref `nodeWrapRefs[i]`, transform set per-frame) →
74×74 `<button>` (chamfer clip-path, hover → crimson bg `var(--crimson)`,
`#f4f2ed` icon, scale 1.07, 300ms) → icon (26px) + number (8px mono) +
3px technical indicator bar → two-line title span positioned by `SIDE[i]`
(above / right×3 / below×2 / left×3) at 11px Chakra Petch.

Couplings (SVG, per node, rotated `angleOf(i)` about C): wall mount rect →
`couplingExtRefs[i]` extending shaft (translateY −6·ex) → joint circle with
6 teeth (`couplingJointRefs[i]` rotates) + crimson light (`couplingLightRefs[i]`).

## Detail card (right column)

- Container flips material by theme: light → `#222328` bg / `#e7e6e1` ink /
  `#9b9c96` sub; dark → `#e7e6e1` bg / `#222328` ink / `#59595b` sub.
- Header: gear glyph + `MODULE NN` / `OUTPUT`; status chip `LOCKED` /
  `SELECTED` / `ON STAND BY` (with `.live-blink` dot).
- Content: `disciplines[active]` name (Anton clamp 1.6–2.2rem), blurb, tag
  chips, `GearTrio(node)`; standby: "ON STAND BY / Pick a node to explore".
- Content swap: `career-wipe-in` keyed by discipline id.
- Footer: `HOVER · CLICK TO LOCK — THE ENGINE RESPONDS` · `SYS/09`.

## Theme material system

- Production tokens live in `src/index.css` (`:root` and `.dark` `--core-*`
  blocks; archived in `styles/core.css`).
- The component additionally carries `CORE_PALETTES.light` / `.dark` — the same
  values — applied **inline on the container only during the exploded
  transition** (freeze old palette → parts separate → release → new theme
  already underneath), so the flip never reads as a crossfade.
- `applyFreeze(null)` on unmount guarantees no stale inline overrides.

## State (React)

`hoverIdx` (transient) · `lockedIdx` (persistent until re-click) ·
`active = lockedIdx ?? hoverIdx` · mirrors `hoverRef` / `lockedRef` for the rAF
loop · `theme` + `reduced` from `useStore` / `useReducedMotion`.
