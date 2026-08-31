# CORE-INTERACTIONS — CORE-RADIAL-V1-APPROVED

The actual interaction / state behaviour of the Core, as implemented in
`components/CreativeCore.tsx`.

## State model

```
hoverIdx  : number | null   (set on node mouseenter/focus, cleared on leave/blur)
lockedIdx : number | null   (set/cleared ONLY by click via toggleLock)
active    = lockedIdx ?? hoverIdx     (lock wins over hover)
```

## IDLE

No node hovered or locked. The machine runs its continuous motion; the detail
card shows **"ON STAND BY / Pick a node to explore"** and status reads
"STANDING BY". The pointer is folded into the hub.

## HOVER (preview)

`mouseenter`/`focus` on a node sets `hoverIdx`. Effects:
- node chip flips to crimson background, off-white icon, enlarges slightly;
- its coupling shaft extends, toothed joint spins, crimson joint light shows;
- the pointer unfolds and aims at the node;
- the detail card switches to that discipline (status "SELECTED").
Hover does **not** persist — leaving clears it (unless a node is locked).

## CLICK (lock / unlock)

`onClick` → `toggleLock(i)`:
- fires a radial pulse + crimson lock signal travelling node → hub;
- sets `lockedIdx = i` (lock). Card status becomes "LOCKED".
- Clicking the **same** node again sets `lockedIdx = null` (unlock). If the
  mouse is outside the core the pointer folds and the card returns to standby.

Only click creates a persistent lock. Hover never locks.

## ACTIVE

While `active` (locked or hovered) the corresponding node is highlighted, its
coupling is engaged, the pointer is aimed at it, and the detail card shows its
name, blurb, tags and gear trio.

## SWITCH

Moving between nodes updates `hoverIdx`; the pointer re-aims (weighted,
shortest path) and the card wipes to the new discipline. A locked node takes
priority over hover until unlocked.

## RESET

Unlocking (second click on the locked node) returns to IDLE: pointer retracts,
card → standby, node returns to its idle material.

## POINTER TRACKING FIELD

The pointer tracks the mouse only inside the circular interaction field
(`0.39·containerWidth + 48`). Outside it, with nothing locked, the pointer
folds into the hub. It never floats, never detaches, never snaps.

## RESPONSIVE / ACCESSIBILITY

- Nodes are real `<button>`s with `aria-label` and `aria-pressed`; keyboard
  focus triggers the same preview as hover.
- Layout is a responsive grid (machine ~1.22fr / card ~0.78fr) that stacks on
  small screens; the machine scales via `max-w-[620px] aspect-square`.
- `prefers-reduced-motion` disables continuous motion while preserving
  hover/click/standby behaviour.

## THEME (see CORE-ANIMATION.md)

Theme toggle runs the exploded disassemble → material flip → reassemble
sequence; the locked node (if any) remains locked throughout.
