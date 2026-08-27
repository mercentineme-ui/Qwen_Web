# CORE-INTERACTIONS — actual state machine of CreativeCore.tsx (V1-APPROVED)

State: `hoverIdx: number | null` (transient) · `lockedIdx: number | null`
(persistent) · derived `active = lockedIdx ?? hoverIdx`. Only **click** writes
`lockedIdx`; hover never persists. Mirrors `hoverRef`/`lockedRef` feed the rAF
loop without re-renders.

## IDLE

**Condition:** no hover, no lock; mouse anywhere (or outside the container).

- Pointer: `tracking = false` → `ptrExt → 0` at dt·6.5 → link telescopes in,
  second stage folds 68° around joint 1, assembly nests into the hub; aim holds
  its last angle while folding (no snap).
- Card: `ON STAND BY` / `Pick a node to explore`, status chip `ON STAND BY`,
  blink dot at 0.5 opacity.
- Machine: base rotation rates (see ANIMATION doc), ambient pulse every
  4.5–7 s, surge every 20 s.

## HOVER (preview only)

**Trigger:** `onMouseEnter` on a node button (`onFocus` also maps here for
keyboard; `onMouseLeave`/`onBlur` clear it).

- `hoverIdx = i` → node chip: bg → `var(--crimson)`, icon/text → `#f4f2ed`,
  scale 1.07, indicator bar 8→20 px — all 300 ms.
- Coupling: shaft extends (`translateY −6`), joint spins at 160°/s·m, crimson
  joint light fades in.
- Pointer: aims at `angleOf(i)` (dt·6 approach), `ptrExt → 1` (dt·5), gears
  spin up (26→116 deg/s base).
- Card: swaps to the discipline (`career-wipe-in`, keyed by id), chip `SELECTED`.
- **Nothing is persisted.** Leaving the node reverts everything.

## SELECT (click → lock)

**Trigger:** `onClick → toggleLock(i)`.

- If `lockedIdx !== i`: `firePulse(i)` (pulse intensity 1 + lock signal travels
  node→centre over 0.65 s) and `lockedIdx = i`.
- Pointer locks: aim target is `angleOf(lockedIdx)` regardless of mouse; `ext`
  stays 1 while the node is locked even if the cursor moves away or leaves.
- Card chip becomes `LOCKED`; node chip keeps its crimson active state.

## ACTIVE (locked)

**Condition:** `lockedIdx === i`.

- Pointer: locked to the node angle; survives mouse movement and container exit.
- Machine: that coupling stays engaged (ext 1, joint spinning, light on).
- Card: discipline content remains displayed.

## UNLOCK (second click on the locked node)

**Trigger:** `onClick` with `lockedIdx === i` → `setLockedIdx(null)`
(`firePulse(i)` fires the pulse feedback again).

- If the mouse is still inside the tracking field → pointer resumes live mouse
  tracking. If a different node is hovered → pointer aims at it (preview).
- If the mouse is outside → pointer folds back to idle; card returns to standby.

## SWITCH (hover or lock moves between nodes)

- Aim uses `wrap()` — the pointer always rotates the **shortest** direction.
- Extension eases out at dt·6.5 / in at dt·5, so a fast switch shows a brief
  mechanical re-settle rather than an instant jump.
- Couplings: the old node's `ext[i]` decays at dt·7 while the new one rises —
  both animate simultaneously (crossfade of mechanical engagement, not a state
  pop). Card content re-wipes via the `key` change.

## RESET (mouseleave on the container)

**Trigger:** container `mouseleave` → `mouse.in = false`.

- `mouseInCore = false`; if nothing is locked, `tracking = false` → pointer
  folds, aim holds, proximity shifts decay to 0, glow fades.
- Card → standby. Node chips → idle. A locked node is **not** affected.

## THEME SWITCH (exploded rebuild — see ANIMATION §8)

**Trigger:** `themeRef` change detected inside the loop.

- Phase 1 (320 ms): outer-first staggered disassembly; pointer forced to fold
  (`inTransition` disables tracking).
- Phase 2 (140 ms): exploded hold — inline palette freeze releases, the new
  theme's tokens take over while parts are apart.
- Phase 3 (420 ms): centre-first reassembly with overshoot settle; parts return
  to exact transforms; nodes return to exact positions/rotations.
- `lockedIdx`/`hoverIdx` are untouched — the selected node stays selected.
- Interrupt-safe: rapid toggling re-freezes + restarts; `applyFreeze(null)` on
  unmount guarantees no stale palette.

## Responsive behavior

- Layout: `grid lg:grid-cols-[1.22fr_0.78fr]` — below `lg` the card stacks
  under the machine. Machine container is `w-full max-w-[620px] aspect-square`.
- All tracking math is derived per-frame from `getBoundingClientRect`
  (`box.current`), so resize/reposition needs no recalibration.
- Node titles switch side per `SIDE[i]` (fixed per index, not breakpoint-based).

## Accessibility surface (as implemented)

- Node buttons are real `<button>`s with `aria-label={dis.name}` and
  `aria-pressed={hovered}`; `onFocus`/`onBlur` mirror hover so keyboard focus
  previews a node; activation is click-only.
- `prefers-reduced-motion`: all rAF motion zeroed (`rm = 0`), disassembly
  amounts 0, CSS keyframes disabled globally; states still change.

## What is deliberately NOT implemented

- No drag, no keyboard arrow-cycling between nodes, no autoplay selection.
- Hover never locks. Nothing auto-selects. The 20 s event is a **surge**
  (mechanical impulse), not an automatic node change.
