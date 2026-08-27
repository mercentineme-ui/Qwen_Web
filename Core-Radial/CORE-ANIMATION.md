# CORE-ANIMATION — actual values from CreativeCore.tsx + core.css (V1-APPROVED)

All values read from the implementation. The machine runs one
`requestAnimationFrame` loop (`eng.current`), dt clamped to 0.05 s;
`rm = reduced ? 0 : 1` zeroes all motion under `prefers-reduced-motion`.

## 1. Continuous rotations (idle life)

Rates are deg/s, multiplied by surge multiplier `m` and theme `power`:

| Target | Rate | Direction | Source |
|---|---|---|---|
| Primary rotating ring (`primaryRingG`) | 6 | CW | `e.primary += dt·6·m·power` |
| Secondary ring (`secondaryRingG`) | 9·(1+1.2·boost) | CCW | `e.secondary −= …` |
| Central gear (`centralGearG`) | 14 | CW | `e.central` |
| Offset gears A & B (`gearAG`, `gearBG`) | 35 | CCW | `e.gearA/gearB` |
| Lower regulator (`lowerGearG`) | 10 | CCW | `e.lower` |
| Pointer drive gear | 26 + 90·ext | CW | `e.ptrSpin` (spins faster as pointer extends) |
| Pointer support gear | 1.6× ptrSpin | CCW | counter-meshed |
| Pointer articulation gear | 1.25× ptrSpin | CCW | counter-meshed |

## 2. Mechanical surge (every 20 s, ~1 s impulse)

`phase = e.t % 20`. Window starts at `phase ≥ 18.2`:

- `0.0–0.4 s` — ramp: target `1 → 2.6` (pressure build)
- `0.4–1.0 s` — hold at `2.6` (peak)
- `1.0–1.8 s` — decay `2.6 → 1`
- `e.mult` approaches target at `dt·7`; `boost = clamp01((mult−1)/1.6)`

Effects while boosted: secondary ring spins up to 2.2×, coupling joint speed
rises, crimson timing marker widens `6 → 8.5` and brightens `0.8 → 1.0`,
`surgeArcG` opacity `0 → 0.55`, lock-signal lights strengthen.

## 3. Pointer motion (weighted, never linear)

- Tracking field: `fieldRadiusPx = 0.39·containerWidth + 48` (core + rings +
  node/connector region). `mouseAngle = atan2(x, −y)`.
- Aim priority: **locked node → hovered node → live mouse angle → hold**.
- Angle: `ptrAngle += wrap(target − ptrAngle)·min(1, dt·6)·rm` — exponential
  approach, shortest path, slight lag.
- Extension: `ptrExt` lerps toward 1 at `dt·5` (extending) / toward 0 at
  `dt·6.5` (retracting). Linkage: `span = 24 + 34·ext`, `fold = (1−ext)·68°`.
- Gear spin: `ptrSpin += dt·(26 + 90·ptrExt)·m` — gears audibly "work harder"
  while extending.
- During theme transition (`thPhase ≠ 0`): tracking forced off → pointer folds.

## 4. Node coupling engagement (per node)

- `ext[i]` lerps to 1 while hovered at `dt·7`; shaft `translateY(−6·ext)`.
- Joint rotation: `joint[i] += ext·(active?160:60)·m·dt` deg/s (engaged joints
  spin ~2.7× faster).
- Crimson joint light: opacity `ext·(0.5 + 0.5·boost)`.

## 5. Node proximity shift

`prox[i]` lerps at `dt·8` toward `clamp01(1 − dist/170px)`; nodes drift up to
**4 px** toward the cursor (x/y projected along the cursor vector).

## 6. Lock signal (click feedback, node → centre)

`sig.t += dt/0.65` (≈0.65 s travel). Radius eases cubically from `R_WALL−8` to
`R_HUB−4`; line opacity `0.4`, dot fades out after `t > 1.15`
(`(1.15 − t)·6`). Fires from `firePulse(i)` on every click.

## 7. Radial pulse

- Click pulse: `intensity 1`, `p += dt/1.5` (1.5 s), ring `r = R_HUB + p·150`,
  opacity `(1−p)·0.35·intensity`.
- Ambient pulse: every `4.5 + rand·2.5 s`, intensity `0.35`.

## 8. Theme exploded transition (phase machine)

Durations: `DIS_MS = 320` (disassemble) · `HOLD_MS = 140` (exploded hold —
material flips here) · `ASM_MS = 420` (reassemble + lock). Total ≈ 880 ms.

Phases: `0 idle → 1 disassemble → 2 hold → 3 assemble → 0`.

Per-layer stagger (`order` in `EXPLODE`): couplings 0 · housing 1 · primary 2 ·
secondary 3 · plate 4 · hub + gearA + gearB + lower 5. Out: outer leads
(stagger = order/5 · 50% of window, `easeOutCubic`). Back: centre leads
(stagger = (5−order)/5 · 45%, `easeOutBack c=1.70158` → snap-lock settle).

Explosion vectors (each part its own direction):

| Layer | dx | dy | scale | rot |
|---|---|---|---|---|
| couplings | 0 | −20 | — | — (opacity → 0.3) |
| housing | 0 | −16 | +0.035 | +2.5° |
| primary ring | 0 | −9 | +0.10 | −4° |
| secondary ring | +7 | +5 | +0.06 | +5° |
| engine plate | 0 | +11 | −0.03 | — |
| hub | 0 | +15 | −0.05 | — |
| gear A | −17 | +7 | — | −32° |
| gear B | +15 | +13 | — | +26° |
| lower reg | +9 | +17 | — | +22° |

Rotation power while apart: `1 → 1−0.85·A.housing → 0.15 → 0.15+0.85·(1−A.housing)`.
Nodes drift `16·A.couplings` px radially outward and rotate `5·A.couplings` deg,
returning to exact original positions on reassembly. Interrupt-safe: a new
toggle re-freezes the on-screen palette and restarts — parts never strand.

## 9. CSS keyframe animations (styles/core.css)

| Name | Class | Timing | Easing | Repeat |
|---|---|---|---|---|
| `careerWipeIn` | `.career-wipe-in` | 0.42 s | cubic-bezier(0.3,0.8,0.3,1) | both (once) |
| `gearMesh` | `.gear-mesh-in` | 0.6 s | cubic-bezier(0.34,0.9,0.3,1) | both (once) |
| `liveBlink` | `.live-blink` | 1.6 s | steps(2, jump-none) | infinite |
| `coreSpinCW` / `coreSpinCCW` | (JS inline, per-node durations) | — | linear | infinite |
| `coreBeat` | `.core-beat` | 2.8 s | ease-in-out | infinite |
| `escRock` | `.esc-rock` | 1.6 s | cubic-bezier(0.45,0.05,0.55,0.95) | infinite |
| `scanPass` | `.scan-pass` | 2.6 s | cubic-bezier(0.4,0.4,0.4,1) | infinite |
| Reveal (`.rv → .is-in`) | ui.tsx | 0.9 s | cubic-bezier(0.25,0.8,0.3,1) | once, IO threshold 0.12 |

## 10. Card gear-trio (per-discipline, from `GEAR_SETS`)

Sizes fixed: r17/t9 "CONTROL" · r12.5/t8 "REPEATABILITY" · r9/t7 "SYSTEM".
Direction + duration per node index (CW unless marked CCW):

| Node | Large | Medium | Small |
|---|---|---|---|
| 01 | CW 9 s | CCW 6.4 s | CW 4.6 s |
| 02 | CCW 8 s | CW 5.8 s | CCW 4.2 s |
| 03 | CW 11 s | CW 7.2 s | CCW 5.0 s |
| 04 | CCW 9.5 s | CCW 6.8 s | CW 4.8 s |
| 05 | CW 10 s | CCW 6.0 s | CW 4.0 s |
| 06 | CCW 8.5 s | CW 6.2 s | CCW 4.4 s |
| 07 | CW 9 s | CCW 7.0 s | CW 5.2 s |
| 08 | CCW 10.5 s | CW 5.6 s | CW 4.6 s |
| 09 | CW 8 s | CCW 6.6 s | CCW 4.2 s |

Trio enters with `gear-mesh-in` (translateY 8px, scale 0.6, rotate −14° → settle).

## Reduced motion

`rm = 0` freezes all rAF-driven motion (rotations, pointer, pulse, surge);
theme-disassembly amounts forced to 0 (instant material swap); CSS animations
disabled by the project's global `prefers-reduced-motion` block. Hover/click
states and the standby card still function.
