# CORE-ANIMATION — CORE-RADIAL-V1-APPROVED

The authoritative, line-referenced animation map is
`animations/ANIMATION-INDEX.md`. This document summarises the behaviour for
quick verification. All values are read from the implementation, not guessed.

## Continuous motion (idle life)

- Rings/gears rotate from one rAF loop; dt clamped 0.05s.
- Primary ring slow CW, secondary ring slow CCW, central gear +14°/s, offset
  gears −35°/s, lower regulator −10°/s (all × surge multiplier × theme power).
- Every 20s a ~1s surge: multiplier ramps to ×2.6 (0.4s), holds, decays;
  secondary ring + crimson timing marker emphasised.
- Ambient radial pulse every 4.5–7s at 0.35 intensity.

## Pointer (articulated, weighted)

- Aim: exponential approach to (locked → hovered → mouse) angle, shortest path.
- Extension: `ext` lerps (extend dt·5 / retract dt·6.5); telescoping link
  `span = 24 + 34·ext`, fold `68°` when retracted.
- Gears spin faster as the pointer extends (`26 + 90·ext`).
- During theme transition the pointer powers down and retracts.

## Interaction feedback

- Node coupling on hover: shaft extends (`dt·7`), toothed joint spins
  (160°/s active / 60°/s idle), crimson joint light fades in.
- Click lock: fires a radial pulse + a crimson signal line/dot travelling from
  the node to the hub over ~0.65s.
- Detail card content wipes in (`career-wipe-in`, 0.42s); the three-gear trio
  meshes in (`gear-mesh-in`, 0.6s) with per-node direction/speed sets.

## Theme transition (exploded mechanical rebuild)

State machine `0→1→2→3→0`:
- disassemble 320ms (outside-first stagger, `easeOutCubic`),
- hold 140ms (material palette flips here),
- reassemble 420ms (centre-first, `easeOutBack` snap-lock).
Each layer has its own explosion vector (translate/scale/rotate) and the whole
machine's rotation power dips to ~0.15 while apart. Interrupt-safe.

## CSS keyframes (styles/core.css)

`coreSpinCW/CCW`, `gearMesh` (0.6s), `liveBlink` (1.6s), `careerWipeIn`
(0.42s), `coreBeat` (2.8s), `escRock` (1.6s), `scanPass` (2.6s), plus the
`Reveal` scroll-in (0.9s). See the index for easings/repeats.

## Reduced motion

`prefers-reduced-motion` zeroes rAF motion, forces disassembly amounts to 0
(instant material swap), and the global media-query block disables CSS
animation. Hover/click and the standby card still function.
