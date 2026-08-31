# CORE-RESTORE — recovery procedure for CORE-RADIAL-V1-APPROVED

Use this if `src/components/CreativeCore.tsx` (or a dependency) is deleted,
overwritten by a redesign, or broken. The archive is a verbatim snapshot —
restore by copying, never by rewriting.

## 1. Entry point

- **Component:** `src/components/CreativeCore.tsx` (default export `CreativeCore`)
- **Mounted by:** `src/App.tsx` — `<CreativeCore />` inside the `<Site />`
  section stack (between `<Expertise />` and `<ShowReel />`). If the mount was
  lost, restore that one JSX line; nothing else registers the section.

## 2. Restore the sources

From the repository root (archive layout mirrors the production tree, so
relative imports stay valid):

```
cp Core-Radial/components/CreativeCore.tsx   src/components/CreativeCore.tsx
# only if the shared files are also missing/damaged:
cp Core-Radial/components/icons.tsx          src/components/icons.tsx
cp Core-Radial/components/ui.tsx             src/components/ui.tsx
cp Core-Radial/lib/store.tsx                 src/lib/store.tsx
cp Core-Radial/lib/data.ts                   src/lib/data.ts
```

⚠️ Copying `icons.tsx` / `ui.tsx` / `store.tsx` / `data.ts` over newer live
versions will revert other sections' shared code too. Only copy them if they
are missing or corrupted; otherwise restore **only** `CreativeCore.tsx`.

## 3. Restore the styles

The Core reads its CSS from `src/index.css`. Every rule it needs is preserved
verbatim in `Core-Radial/styles/core.css` with the original line references.

- If `src/index.css` still exists → do nothing (production CSS is authoritative).
- If it was lost → merge the blocks from `Core-Radial/styles/core.css` into the
  rebuilt stylesheet (tokens in `:root` + `.dark`, then the class/keyframe
  blocks), or `@import` the file. Also restore the non-Core blocks the rest of
  the portfolio needs from version control.

Required CSS inventory (check after restore):

- Tokens: `--core-plate --core-deep --core-line --core-mid --core-inv
  --core-ring --core-gear --core-crimson` in **both** `:root` and `.dark`
- Tokens: `--crimson --crim-panel --crimson-rough --line --ink --ink2
  --outer-bg --outer-ink`
- Classes: `.f-display .f-tech .f-mono .rv .is-in .live-blink .career-wipe-in`
- Keyframes: `coreSpinCW coreSpinCCW gearMesh liveBlink careerWipeIn`
  (+ `coreBeat escRock scanPass` from the same block)

## 4. Dependencies

| Dependency | Kind | Action |
|---|---|---|
| `react`, `react-dom` | npm (project `package.json`) | `npm install` |
| Tailwind CSS v4 | shared — `@import "tailwindcss"` at top of `src/index.css` | ensure the import line + project tooling exist |
| Google Fonts: **Anton 400, Chakra Petch (500/600/700), IBM Plex Mono (400/500/600)** | external, loaded by `index.html` `<link>` | ensure the font `<link>` exists in `index.html` (project-wide, shared) |
| Binary assets | **none** — the Core is 100% inline SVG + CSS | nothing to restore |

## 5. Data requirements

The Core renders `data.core` (the nine disciplines) from `lib/data.ts`. The
archived copy preserves the exact production array — ids `d1…d9`, nums
`01…09`, names, icon keys (`direction, generative, visualdev, cinematic,
aivideo, character, environment, workflows, prompt`), blurbs and tags. If live
`data.ts` has drifted, the archived copy restores the approved nine-module set.
The store's `deepMerge` backfills old persisted localStorage automatically.

## 6. Verification after restore

1. `npm install && npm run build` — must pass with 0 errors.
2. Load the site; the section `#core` renders with heading `02 — THE CORE`.
3. Count **nine** node chips around the machine; labels match the list in the
   MANIFEST; order is 01 CREATIVE DIRECTION → 09 PROMPT ARCHITECTURE clockwise.
4. Idle: rings rotate, card says `ON STAND BY / Pick a node to explore`.
5. Hover a node → chip turns crimson, pointer unfolds and aims at it, card
   shows that discipline. Move away → everything reverts (no stuck state).
6. Click a node → `LOCKED` chip; move the mouse outside the machine → pointer
   stays on the node, card stays. Click the same node again → unlocks, card →
   standby (if the mouse is outside).
7. Toggle theme → machine explodes apart (~320 ms), holds (~140 ms), rebuilds
   (~420 ms) in the new material; the locked node remains locked.
8. Watch ~20 s → surge impulse (rings speed up ~1 s, crimson arc flashes).
9. Open browser console → no errors, no missing assets.

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
