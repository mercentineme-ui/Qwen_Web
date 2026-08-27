# ANIMATION INDEX — CORE-RADIAL-V1-APPROVED

The Core's animation is NOT a separate library. It is implemented in two
places, both archived verbatim in this folder's parent:

1. **`components/CreativeCore.tsx`** — the imperative animation engine
   (single `requestAnimationFrame` loop, the theme-disassembly state machine,
   pointer kinematics, gear-trio timing tables).
2. **`styles/core.css`** — the CSS keyframe animations
   (`coreSpinCW/CCW`, `gearMesh`, `liveBlink`, `careerWipeIn`, `coreBeat`,
   `escRock`, `scanPass`).

Nothing is recreated here; this index maps every animation to its exact
implementation so a restorer knows precisely where the behaviour lives.

---

## A. Imperative engine — `components/CreativeCore.tsx`

All driven by one rAF loop (dt clamped to `0.05s`; `rm = reduced ? 0 : 1`).

| Animation | Implementation | Values (as implemented) |
|---|---|---|
| Continuous gear rotation | `eng.current` accumulators `primary/secondary/central/gearA/gearB/lower` | primary `+6°/s`, secondary `−9°/s`, central `+14°/s`, gearA/gearB `−35°/s`, lower `−10°/s` (× surge `m` × theme `power`) |
| 20s mechanical surge | `phase = e.t % 20`, window at `phase ≥ 18.2` | ramp `0→0.4s`, hold to `1.0s` at ×2.6, decay to `1.8s`; `e.mult` approaches at `dt·7` |
| Crimson timing indicator pulse | `indicatorC` opacity/width/x | opacity `0.8 + 0.2·boost`, width `6 + 2.5·boost` |
| Surge arc on secondary ring | `surgeArcG` opacity + rotate | opacity `0.55·boost` |
| Pointer aim (weighted) | `e.ptrAngle += wrap(target−ptrAngle)·min(1,dt·6)·rm` | exponential approach, shortest path |
| Pointer extension | `e.ptrExt` lerp | extend `dt·5`, retract `dt·6.5`; `span = 24 + 34·ext`, `fold = (1−ext)·68°` |
| Pointer gear spin | `e.ptrSpin += dt·(26 + 90·ptrExt)·m` | support gear `×−1.6`, articulation `×−1.25` |
| Node coupling engage | `e.ext[i]`, `e.joint[i]` | extend `dt·7`; joint `160°/s` active / `60°/s` idle |
| Node proximity shift | `e.prox[i]` | `dt·8`, up to 4px toward cursor |
| Lock signal (click) | `sig.current.t += dt/0.65` | radius eases cubically `R_WALL−8 → R_HUB−4` over ~0.65s |
| Radial pulse (click + ambient) | `pulse.current.p += dt/1.5` | `r = R_HUB + p·150`; ambient every `4.5 + rand·2.5s` at 0.35 intensity |
| Theme exploded disassembly | `thPhase` state machine `0→1→2→3→0` | `DIS_MS=320`, `HOLD_MS=140`, `ASM_MS=420`; per-layer `EXPLODE` vectors + stagger (`layerAmt`), `easeOutCubic` out / `easeOutBack` back |

## B. CSS keyframes — `styles/core.css`

| Keyframe / class | Duration | Easing | Repeat |
|---|---|---|---|
| `coreSpinCW` / `coreSpinCCW` | (set inline per gear) | linear | infinite |
| `gearMesh` `.gear-mesh-in` | 0.6s | cubic-bezier(0.34,0.9,0.3,1) | once |
| `liveBlink` `.live-blink` | 1.6s | steps(2, jump-none) | infinite |
| `careerWipeIn` `.career-wipe-in` | 0.42s | cubic-bezier(0.3,0.8,0.3,1) | once |
| `coreBeat` `.core-beat` | 2.8s | ease-in-out | infinite |
| `escRock` `.esc-rock` | 1.6s | cubic-bezier(0.45,0.05,0.55,0.95) | infinite |
| `scanPass` `.scan-pass` | 2.6s | cubic-bezier(0.4,0.4,0.4,1) | infinite |
| Reveal `.rv → .is-in` (ui.tsx) | 0.9s | cubic-bezier(0.25,0.8,0.3,1) | once (IO threshold 0.12) |

## C. Card gear-trio timing table — `components/CreativeCore.tsx` (`GEAR_SETS`)

Sizes fixed: r17/t9 "CONTROL", r12.5/t8 "REPEATABILITY", r9/t7 "SYSTEM".
Direction + duration per node index (CW unless marked CCW):

| Node | Large | Medium | Small |
|---|---|---|---|
| 01 | CW 9s | CCW 6.4s | CW 4.6s |
| 02 | CCW 8s | CW 5.8s | CCW 4.2s |
| 03 | CW 11s | CW 7.2s | CCW 5.0s |
| 04 | CCW 9.5s | CCW 6.8s | CW 4.8s |
| 05 | CW 10s | CCW 6.0s | CW 4.0s |
| 06 | CCW 8.5s | CW 6.2s | CCW 4.4s |
| 07 | CW 9s | CCW 7.0s | CW 5.2s |
| 08 | CCW 10.5s | CW 5.6s | CW 4.6s |
| 09 | CW 8s | CCW 6.6s | CCW 4.2s |

## Reduced motion

`prefers-reduced-motion` zeroes all rAF-driven motion (`rm=0`), forces
disassembly amounts to 0, and the project's global media-query block disables
the CSS animations. Hover/click states and the standby card still function.
