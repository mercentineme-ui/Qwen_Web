# CORE-RESTORE — recovery procedure (CORE-RADIAL-V1-APPROVED)

Use this if `src/components/CreativeCore.tsx` (or a dependency) is deleted,
overwritten by a redesign, or broken. The archive is a verbatim snapshot —
restore by copying, never by rewriting.

## 1. Entry point

- **Component:** `src/components/CreativeCore.tsx` (default export `CreativeCore`)
- **Mounted by:** `src/App.tsx` — `<CreativeCore />` inside the `<Site />`
  section stack (between `<Expertise />` and `<ShowReel />`). If the mount was
  lost, restore that one JSX line; nothing else registers the section.

## 2. Restore the sources

Run from the repository root. The archive mirrors the production tree, so
relative imports stay valid:

```
cp Core_Disciplines/components/CreativeCore.tsx   src/components/CreativeCore.tsx
# only if the shared files are also missing/damaged:
cp Core_Disciplines/components/icons.tsx          src/components/icons.tsx
cp Core_Disciplines/components/ui.tsx             src/components/ui.tsx
cp Core_Disciplines/lib/store.tsx                 src/lib/store.tsx
cp Core_Disciplines/lib/data.ts                   src/lib/data.ts
```

⚠️ Copying `icons.tsx` / `ui.tsx` / `store.tsx` / `data.ts` over newer live
versions will also revert other sections' shared code. Only copy them if they
are missing or corrupted; otherwise restore **only** `CreativeCore.tsx`.

## 3. Restore the styles

The Core reads its CSS from `src/index.css`. Every rule it needs is preserved
in `Core_Disciplines/styles/core.css` (with the original intent noted).

- If `src/index.css` still exists → do nothing (production CSS is authoritative).
- If it was lost → merge the blocks from `Core_Disciplines/styles/core.css`
  into the rebuilt stylesheet (tokens in `:root` + `.dark`, then the
  class/keyframe blocks), and restore the non-Core blocks the rest of the
  portfolio needs from version control.

Required CSS inventory (check after restore):
- Tokens: `--core-plate --core-deep --core-line --core-mid --core-inv
  --core-ring --core-gear --core-crimson` in **both** `:root` and `.dark`
- Tokens: `--crimson --crim-panel --crimson-rough --line --ink --ink2
  --outer-bg --outer-ink`
- Classes: `.f-display .f-tech .f-mono .rv .is-in .live-blink .career-wipe-in`
- Keyframes: `coreSpinCW coreSpinCCW gearMesh liveBlink careerWipeIn`
  (+ `coreBeat escRock scanPass`)

## 4. Dependencies

| Dependency | Kind | Action |
|---|---|---|
| `react`, `react-dom` | npm (`package.json`) | `npm install` |
| Tailwind CSS v4 | `@import "tailwindcss"` at top of `src/index.css` | ensure import + tooling |
| Google Fonts: **Anton 400, Chakra Petch 500/600/700, IBM Plex Mono 400/500/600** | `index.html` `<link>` | ensure the font `<link>` exists in `index.html` |
| Binary assets | **none** — Core is 100% inline SVG + CSS | nothing to restore |

## 5. Data

The Core renders `data.core` (the nine disciplines) from `src/lib/data.ts`.
The archived copy preserves the exact production array (ids `d1…d9`, nums
`01…09`, names, icon keys, blurbs, tags). The store's `deepMerge` backfills old
persisted localStorage automatically, so restoring the file is sufficient.

## 6. Verify after restore

1. `npm install && npm run build` — must pass with 0 errors.
2. Load the site; section `#core` renders with heading "02 — THE CORE".
3. Count **nine** node chips; labels and order match the list in the README.
4. Idle: rings rotate, card says "ON STAND BY / Pick a node to explore".
5. Hover a node → chip turns crimson, pointer unfolds and aims, card shows the
   discipline. Move away → everything reverts (no stuck state).
6. Click a node → "LOCKED"; move mouse outside → pointer stays on node, card
   stays. Click same node again → unlocks, card → standby (mouse outside).
7. Toggle theme → machine explodes apart, holds, rebuilds in the new material;
   the locked node remains locked.
8. Watch ~20s → surge impulse (rings speed up, crimson arc flashes).
9. Browser console → no errors, no missing assets.

If all nine checks pass, the restored Core matches CORE-RADIAL-V1-APPROVED.

## 7. Known non-self-contained items (declared, not hidden)

- **Tailwind** utilities come from the project build, not this folder.
- **Fonts** come from Google's CDN via `index.html`.
- The **CSS home** is `src/index.css`; `styles/core.css` is a preservation
  mirror of exactly the Core-relevant rules.
- `icons.tsx`/`ui.tsx`/`store.tsx`/`data.ts` are shared with the rest of the
  portfolio; the archive holds verbatim copies so the Core's import graph
  resolves standalone, but in a live project the `src/` copies are canonical.

Everything else — the 951-line component, its animation engine, interaction
state machine, geometry constants, theme choreography, and the nine-module
data — is fully contained in this folder.
