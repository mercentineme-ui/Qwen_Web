# CORE-MASTER-MANIFEST — CORE-RADIAL-V1-APPROVED

Every file required by the Core, with purpose, classification, dependencies and
restore requirement.

## Archived files (all byte-for-byte copies of the live source)

| File | Lines | Classification | Purpose | Dependencies | Required |
|---|---|---|---|---|---|
| `components/CreativeCore.tsx` | 951 | **CORE-SPECIFIC** | The Core / Radial Engine: SVG machine, 9 nodes, articulated pointer, rAF engine, theme disassembly, detail card | react; `../lib/store`; `./icons`; `./ui` | **YES** |
| `lib/data.ts` | 324 | SHARED-PROJECT (copied) | `defaultData` incl. the 9 `core` disciplines + `PortfolioData` types | (none) | **YES** |
| `lib/store.tsx` | 144 | SHARED-PROJECT (copied) | `StoreProvider`, `useStore`, `useReducedMotion`, `useHashRoute`, `useLocalTime`; theme class; localStorage persistence | react; `./data` | **YES** |
| `components/icons.tsx` | 146 | SHARED-PROJECT (copied) | `disciplineIcons` map + 9 icon components (Core import) + other sections' icons | react | **YES** (for the Core import) |
| `components/ui.tsx` | 205 | SHARED-PROJECT (copied) | `Reveal` + `SectionHead` (Core imports); also `MediaSlot`, `FullscreenViewer` (other sections) | react; `../lib/data` (types) | **YES** (for the Core imports) |
| `styles/core.css` | ~130 | CORE-SPECIFIC (extraction) | Every CSS rule the Core reads: `--core-*` tokens (both themes), palette tokens, `.f-*` type classes, `.rv/.is-in`, `.live-blink`, core keyframes, `.career-wipe-in` | Tailwind build; Google Fonts | **YES** (only if `src/index.css` is lost) |

## Documentation / index files

| File | Purpose |
|---|---|
| `README.md` | Overview + the nine disciplines + layout note |
| `CORE-MASTER-MANIFEST.md` | this file |
| `CORE-ARCHITECTURE.md` | component + mechanical structure |
| `CORE-ANIMATION.md` | every animation with real values |
| `CORE-INTERACTIONS.md` | hover/click/active/switch/reset behaviour |
| `CORE-RESTORE.md` | recovery procedure |
| `CORE-VERSION.md` | version identifier |
| `animations/ANIMATION-INDEX.md` | maps every animation to its real implementation |
| `assets/ASSETS.md` | asset declaration (0 binary assets) |
| `reference/CORE-RADIAL-V1-APPROVED.txt` | visual ground-truth note (PNG not capturable here) |

## Dependency tree (as discovered from the live imports)

```
components/CreativeCore.tsx                <- CORE ENTRY
├── react (useEffect, useRef, useState)
├── ../lib/store  -> useReducedMotion, useStore
│   └── ./data  -> defaultData, PortfolioData
├── ./icons  -> disciplineIcons
└── ./ui  -> Reveal, SectionHead
    └── ../lib/data  -> MediaItem (type only, used by shared exports)

CSS read at runtime (production home: src/index.css; archived: styles/core.css)
├── tokens: --core-plate/deep/line/mid/inv/ring/gear/crimson (light + .dark)
├── tokens: --crimson, --crim-panel, --crimson-rough, --line, --ink, --ink2,
│           --outer-bg, --outer-ink
├── classes: .f-display .f-tech .f-mono .rv .is-in .live-blink .career-wipe-in
└── keyframes: coreSpinCW coreSpinCCW gearMesh liveBlink careerWipeIn coreBeat
               escRock scanPass
```

## External / shared-project dependencies (NOT duplicated)

| Dependency | Kind | Restore requirement |
|---|---|---|
| `react`, `react-dom` | npm (`package.json`) | `npm install` |
| Tailwind CSS v4 | `@import "tailwindcss"` in `src/index.css` | ensure import line + project tooling exist |
| Google Fonts: **Anton 400, Chakra Petch 500/600/700, IBM Plex Mono 400/500/600** | `index.html` `<link>` | ensure the font `<link>` exists in `index.html` (project-wide) |
| Binary assets | **none** — Core is 100% inline SVG + CSS | nothing to restore |

## Shared-file handling

`data.ts`, `store.tsx`, `icons.tsx`, `ui.tsx` are shared with the rest of the
portfolio. They are copied verbatim into this archive so the Core's import
graph resolves standalone, but in a live project the `src/` copies are
canonical. **Do not** edit the archive copies and expect the live site to
change — they are a snapshot. To restore, copy archive → `src/` (see
`CORE-RESTORE.md`).

## Assets

Binary assets archived: **0** — the Core has none (see `assets/ASSETS.md`).
