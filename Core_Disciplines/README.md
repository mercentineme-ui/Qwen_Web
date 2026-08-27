# Core_Disciplines — ARCHIVAL MASTER COPY (CORE-RADIAL-V1-APPROVED)

This folder is a **production backup** of the approved **Core / Radial Engine**
section of the CBK Designfolio (`Qwen_Web`, branch
`cyberpunk-editorial-portfolio-8dc99`). It exists for disaster recovery: if the
live Core is deleted, redesigned, corrupted or overwritten, the approved Core
can be recovered from here.

**This is a snapshot, not a redesign.** Nothing in this folder was altered from
the live implementation; the source files are byte-for-byte copies.

## What is archived

| Item | Location | Notes |
|---|---|---|
| Core entry component (951 lines) | `components/CreativeCore.tsx` | the Radial Engine itself |
| Data incl. the 9 disciplines | `lib/data.ts` | 324 lines |
| State / theme / persistence | `lib/store.tsx` | 144 lines |
| Icons (incl. `disciplineIcons`) | `components/icons.tsx` | shared file |
| UI helpers (`Reveal`, `SectionHead`) | `components/ui.tsx` | shared file |
| Core-specific CSS | `styles/core.css` | extracted from `src/index.css` |
| Animation map | `animations/ANIMATION-INDEX.md` | points to real implementations |
| Asset declaration | `assets/ASSETS.md` | Core has 0 binary assets |
| Visual reference note | `reference/CORE-RADIAL-V1-APPROVED.txt` | PNG not capturable here |

## The nine disciplines (exact, in order)

```
01 — CREATIVE DIRECTION
02 — GENERATIVE AI
03 — VISUAL DEVELOPMENT
04 — CINEMATIC STORYTELLING
05 — AI IMAGE + VIDEO
06 — CHARACTER DEVELOPMENT
07 — ENVIRONMENT DESIGN
08 — AI CREATIVE WORKFLOWS
09 — PROMPT ARCHITECTURE
```

## Layout note

The archive mirrors the production tree (`components/` + `lib/`) so that the
relative imports inside `CreativeCore.tsx` (`../lib/store`, `./icons`, `./ui`)
resolve unchanged. This keeps the copy byte-identical AND importable.

## Read these next

- `CORE-MASTER-MANIFEST.md` — every file, its purpose, Core-specific vs shared
- `CORE-RESTORE.md` — exact recovery procedure
- `CORE-ARCHITECTURE.md` — component + mechanical structure
- `CORE-ANIMATION.md` — every animation with real values
- `CORE-INTERACTIONS.md` — hover / click / active / switch / reset behaviour
- `CORE-VERSION.md` — version identifier
