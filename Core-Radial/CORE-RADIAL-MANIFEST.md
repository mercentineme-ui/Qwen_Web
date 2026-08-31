# CORE-RADIAL-MANIFEST — CORE-RADIAL-V1-APPROVED

Every file in this archive, its purpose, its classification
(**CORE-SPECIFIC** vs **SHARED-PROJECT**), its dependencies, and whether it is
required for restoration.

## Archived source files

| # | Archive path | Production path | Lines | Classification | Required | Purpose |
|---|---|---|---|---|---|---|
| 1 | `components/CreativeCore.tsx` | `src/components/CreativeCore.tsx` | 951 | CORE-SPECIFIC | **YES** | The Core itself: radial engine SVG machine, nine nodes, articulated pointer, rAF engine, theme-disassembly choreography, detail card |
| 2 | `lib/data.ts` | `src/lib/data.ts` | 324 | SHARED-PROJECT (copied) | **YES** | `defaultData` incl. the nine `core` disciplines (names, numbers, icons, blurbs, tags) + `PortfolioData` types |
| 3 | `lib/store.tsx` | `src/lib/store.tsx` | 144 | SHARED-PROJECT (copied) | **YES** | `StoreProvider`, `useStore`, `useReducedMotion`, `useHashRoute`, `useLocalTime`, `readAsDataURL`; theme class on `<html>`; localStorage persistence (`cbk-portfolio-v1`, `cbk-theme`) |
| 4 | `components/icons.tsx` | `src/components/icons.tsx` | 146 | SHARED-PROJECT (copied) | **YES** | `disciplineIcons` map + nine icon components (Core import). File also carries icons used by other sections — copied whole so it is byte-identical |
| 5 | `components/ui.tsx` | `src/components/ui.tsx` | 205 | SHARED-PROJECT (copied) | **YES** | `Reveal` + `SectionHead` (Core imports). Also exports `EmptySlot`, `MediaSlot`, `FullscreenViewer` used elsewhere — copied whole |
| 6 | `styles/core.css` | extracted from `src/index.css` | 120 | CORE-SPECIFIC extraction | **YES** (only if `src/index.css` is lost) | Verbatim extraction of every CSS rule the Core reads: `--core-*` tokens (both themes), palette tokens it references, `.f-display/.f-tech/.f-mono`, `.rv/.is-in`, `.live-blink`, the `creative core` block (`coreSpinCW/CCW`, `gearMesh`, `coreBeat`, `escRock`, `scanPass`…), `.career-wipe-in` |

## Dependency tree (as discovered from the live imports)

```
src/components/CreativeCore.tsx            ← CORE ENTRY COMPONENT
├── react  (useEffect, useRef, useState)
├── ../lib/store  → useReducedMotion, useStore
│   └── ../lib/data  → defaultData, PortfolioData
├── ./icons  → disciplineIcons
└── ./ui  → Reveal, SectionHead
    └── ../lib/data  → MediaItem (type only, used by shared exports)

CSS read at runtime (production home: src/index.css, archived: styles/core.css)
├── tokens: --core-plate/deep/line/mid/inv/ring/gear/crimson  (light + .dark)
├── tokens: --crimson, --crim-panel, --crimson-rough, --line, --ink, --ink2,
│           --outer-bg, --outer-ink
├── classes: .f-display .f-tech .f-mono .rv .is-in .live-blink .career-wipe-in
├── keyframes referenced by JS name: coreSpinCW, coreSpinCCW (GearTrio inline animation)
└── keyframes/classes: gearMesh (.gear-mesh-in), coreBeat, escRock, scanPass

External (SHARED-PROJECT, not duplicated here)
├── Tailwind CSS v4 — utility classes; supplied by `@import "tailwindcss"` in src/index.css
├── Google Fonts — Anton, Chakra Petch, IBM Plex Mono (loaded by index.html <link>)
└── Vite/React build tooling — project level
```

## Assets

| Count | Detail |
|---|---|
| **0 binary assets** | The Core renders entirely from inline SVG + CSS. No PNG/JPG/WebP/audio/textures exist or are referenced. |
| Fonts | Anton / Chakra Petch / IBM Plex Mono via Google Fonts CDN `<link>` in `index.html` (shared). If offline restore is ever needed, fetch those three families — sizes: Anton 400; Chakra Petch 500/600/700; IBM Plex Mono 400/500/600. |

## Animation systems (actual implementation locations)

| System | Lives in | Notes |
|---|---|---|
| rAF engine (rotations, surge, pointer, couplings, pulse, disassembly) | `components/CreativeCore.tsx` (`useEffect` loop, `eng.current`) | single `requestAnimationFrame` loop, dt-clamped |
| Theme exploded transition | `components/CreativeCore.tsx` (`EXPLODE`, `CORE_PALETTES`, `layerAmt`, phase machine) | 320ms out / 140ms hold / 420ms back |
| Card gear-trio mesh-in | `styles/core.css` `.gear-mesh-in` | 0.6s cubic-bezier(0.34,0.9,0.3,1) |
| Card content wipe | `styles/core.css` `.career-wipe-in` | 0.42s cubic-bezier(0.3,0.8,0.3,1) |
| Status blink | `styles/core.css` `.live-blink` | 1.6s steps(2, jump-none) |
| Reveal on scroll | `components/ui.tsx` + `.rv` | 0.9s cubic-bezier(0.25,0.8,0.3,1), threshold 0.12 |

## Interaction systems

| System | Lives in |
|---|---|
| hover preview / click lock / unlock / node switching / pointer states | `components/CreativeCore.tsx` (state: `hoverIdx`, `lockedIdx`, `active = lockedIdx ?? hoverIdx`) |
| theme state + reduced-motion + persistence | `lib/store.tsx` |
| discipline content (what each card shows) | `lib/data.ts` (`core[]`) |

## What was verified at archive time

- [x] `CreativeCore.tsx` is the 951-line production implementation (unchanged, unmodified)
- [x] `data.ts` preserves all nine modules in production order
- [x] `store.tsx` preserved verbatim (144 lines including trailing newline)
- [x] Every import in the archived component resolves **inside** the archive
- [x] Every CSS class/keyframe/token the component reads is captured in `styles/core.css`
- [x] Production build (`npm run build`) passes with the live files untouched
