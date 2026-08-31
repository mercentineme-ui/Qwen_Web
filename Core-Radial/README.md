# CORE-RADIAL — Archival Master Copy

**Version:** `CORE-RADIAL-V1-APPROVED`
**Snapshot of:** the approved production Core / Radial Engine of the Qwen_Web portfolio
**Policy:** this folder is a **frozen snapshot**. Never edit it in place. A future approved
Core becomes `Core-Radial-V2/` (or equivalent) — never overwrite this version.

---

## What this is

A self-contained preservation of the exact Core component that renders the
"02 — THE CORE" section of the portfolio: a radial clockwork transmission engine
with nine surrounding discipline modules, an articulated mechanical pointer,
per-node mechanical couplings, a 20-second surge, and an exploded
disassemble/reassemble theme transition.

The live source of truth remains `src/components/CreativeCore.tsx` in the main
project. This archive is a byte-faithful copy of that file plus everything it
needs to be restored if the live version is ever lost, broken, or redesigned away.

## Contents

```
Core-Radial/
├── README.md                        ← you are here
├── CORE-RADIAL-MANIFEST.md          ← every file, purpose, dependencies
├── CORE-ARCHITECTURE.md             ← mechanical architecture + geometry constants
├── CORE-ANIMATION.md                ← every animation with actual values
├── CORE-INTERACTIONS.md             ← IDLE / HOVER / SELECT / ACTIVE / SWITCH / RESET
├── CORE-RESTORE.md                  ← exact restoration procedure
├── components/
│   ├── CreativeCore.tsx             ← THE CORE — 951-line production component (verbatim)
│   ├── icons.tsx                    ← icon source (Core uses `disciplineIcons`) (verbatim)
│   └── ui.tsx                       ← Reveal + SectionHead (+ shared media UI) (verbatim)
├── lib/
│   ├── data.ts                      ← nine disciplines + all portfolio data (verbatim)
│   └── store.tsx                    ← state, theme, persistence, reduced-motion (verbatim)
├── styles/
│   └── core.css                     ← Core-specific CSS extracted verbatim from src/index.css
└── reference/
    └── CORE-RADIAL-V1-APPROVED.txt  ← visual verification notes (no screenshot capability)
```

The internal layout mirrors the production tree (`components/` beside `lib/`)
**on purpose**: the archived `CreativeCore.tsx` keeps its original relative
imports (`../lib/store`, `./icons`, `./ui`) untouched, so the archive can be
dropped back into the project without rewriting a single import.

## Quick restore (full procedure in CORE-RESTORE.md)

1. Copy `Core-Radial/components/CreativeCore.tsx` → `src/components/CreativeCore.tsx`
2. If missing: copy `lib/`, `components/icons.tsx`, `components/ui.tsx` into `src/` equivalents
3. Ensure `src/index.css` contains the blocks preserved in `styles/core.css`
4. `npm install && npm run build`

## What is intentionally NOT here

- **No binary assets.** The Core has zero image/font/audio files — every glyph is
  inline SVG; fonts are loaded externally by `index.html` (documented as shared).
- **No Tailwind config.** Tailwind v4 is a project-level shared dependency
  (`@import "tailwindcss"` in `src/index.css`), not a Core-owned file.
- **No build output.** Only sources are archived.

## The nine preserved modules (from `lib/data.ts`, in order)

01 — CREATIVE DIRECTION · 02 — GENERATIVE AI · 03 — VISUAL DEVELOPMENT ·
04 — CINEMATIC STORYTELLING · 05 — AI IMAGE + VIDEO · 06 — CHARACTER DEVELOPMENT ·
07 — ENVIRONMENT DESIGN · 08 — AI CREATIVE WORKFLOWS · 09 — PROMPT ARCHITECTURE
