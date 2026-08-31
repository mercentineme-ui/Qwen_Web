# CORE-ARCHITECTURE — CORE-RADIAL-V1-APPROVED

Describes the actual implementation structure (not a redesign).

## Component architecture

```
App.tsx (Site)
└── <CreativeCore />                        <- src/components/CreativeCore.tsx
    ├── reads  data.core  (9 disciplines)   <- src/lib/data.ts
    ├── reads  theme, reduced-motion        <- src/lib/store.tsx
    ├── renders SectionHead ("02 — THE CORE")  <- src/components/ui.tsx
    ├── renders Reveal wrappers             <- src/components/ui.tsx
    ├── renders the SVG machine + 9 node <button>s + detail card
    └── uses  disciplineIcons               <- src/components/icons.tsx
```

`CreativeCore` is a single self-contained React component. All animation is a
single `requestAnimationFrame` loop writing SVG `transform`/`opacity`
attributes (no external animation library).

## Radial geometry (constants, viewBox 600, centre C=300)

| Constant | Value | Meaning |
|---|---|---|
| `NODE_PCT` | 39 | node orbit as % of container |
| `R_WALL` | 184 | outer structural wall |
| `R_FACE` | 177 | housing front face |
| `R_INDEX_OUT/IN` | 162 / 148 | outer index ring |
| `R_PRI_OUT/IN/MID` | 142 / 120 / 131 | primary rotating ring |
| `R_SEC_OUT/IN` | 114 / 102 | secondary transmission ring |
| `R_PLATE` | 98 | recessed engine plate |
| `R_HUB` | 58 | hub mounting plate |
| `G_MAIN` | r40 / 18 teeth | dominant central gear |
| `G_SMALL` | r16 / 8 teeth | offset transmission gears (A @45°, B @160°, mesh distance 56) |
| `LOWER` | @215°, d76, r14, housing 24 | lower secondary regulator |

Nodes are 9 buttons, 74×74px, chamfered, placed every 40° at 39% radius. Titles
render in two lines on a fixed side per node (`SIDE` array).

## Mechanical layer stack (back → front)

```
1  outer housing        (static; wall, 12 divisions, 12 bolts, recessed channel)
2  outer index ring     (static; 36 teeth)
3  primary rotating ring (slow CW; 48 timing marks, 12 divisions, crimson marker)
   secondary ring       (slow CCW; dashed track; carries 20s surge arc)
4  recessed engine plate (machining circles, construction lines, 8 mounts,
                          4 structural arms @ 0/90/180/270)
5  central hub plate    (segmented gear housing)
   lower regulator      (offset @215°)
   central gear train   (r40 + two r16 meshed gears + bearing r13/r7)
   articulated pointer  (drive gear, support link, articulation gear,
                         telescoping fold link, crimson tip)
   9 node couplings     (wall mount → extending shaft → toothed joint)
```

## Articulated pointer (never floats, never detaches)

Mounted on the central axle. Stages: drive gear (r15/t9) → support link →
articulation gear (r8/t7) → telescoping second link (`span = 24 + 34·ext`) that
folds `68°` when retracted → crimson tip. Tracking field radius =
`0.39·containerWidth + 48`. Aim priority: locked node → hovered node → live
mouse angle. Tip max radius ≈ 84 (never reaches nodes at ≈234).

## Theme handling

Two token palettes (`--core-*`) live in `src/index.css` (`:root` = light: dark
machine on light page; `.dark` = light machine on dark page). On theme toggle
the component runs an exploded disassembly/reassembly state machine
(`DIS_MS=320 / HOLD_MS=140 / ASM_MS=420`), freezing the old palette inline so
the material flip lands while the machine is apart, then reassembling.

## Detail card (right, ~0.78fr)

Matte flip panel: light page → `#222328` card / off-white ink; dark page →
`#e7e6e1` card / graphite ink. Standby shows "ON STAND BY / Pick a node to
explore". Active shows module number, Anton title, blurb, tag chips, and a
three-gear trio (CONTROL / REPEATABILITY / SYSTEM) with per-node timing.

## What is deliberately NOT here

No binary assets, no external animation library, no redesign of surrounding
sections. See `CORE-ANIMATION.md`, `CORE-INTERACTIONS.md`,
`animations/ANIMATION-INDEX.md`, `assets/ASSETS.md`.
