# PORTFOLIO_E4 — PROJECT INVENTORY

> A recovery map of the CBK Designfolio at snapshot `portfolio_E4`.
> This is documentation for restoration, not a redesign document.

## Repository Layout (project-critical files)

```
.
├── index.html                  # HTML shell, font <link>, theme pre-paint script
├── package.json                # dependency manifest + scripts
├── package-lock.json           # exact dependency versions (commit this)
├── vite.config.js              # Vite build configuration
├── tsconfig.json               # TypeScript configuration
├── .gitignore                  # ignores node_modules/, dist/, build/, logs
├── PORTFOLIO_E4_RECOVERY.md    # recovery instructions
├── PORTFOLIO_E4_INVENTORY.md   # this file
├── portfolio_e4_snapshot.sh    # one-command snapshot script (macOS/Linux)
├── portfolio_e4_snapshot.bat   # one-command snapshot script (Windows)
└── src/
    ├── main.tsx                # React entry
    ├── App.tsx                 # app root + hash router (#/edit)
    ├── index.css               # ALL design tokens, themes, keyframes, utilities
    ├── lib/
    │   ├── data.ts             # portfolio content + data model + defaults
    │   └── store.tsx           # store, theme, routing, reduced-motion hooks
    └── components/
        ├── Header.tsx          # header / nav / clock / theme toggle
        ├── Hero.tsx            # hero: headline, name, Studio Disc, ticker
        ├── ByNumbers.tsx       # Impact Metrics
        ├── Expertise.tsx       # My Expertise / My Journey
        ├── CreativeCore.tsx    # THE CORE — Radial Engine   [LOCKED]
        ├── ShowReel.tsx        # My Work / Show Reel
        ├── AILab.tsx           # AI LAB + Cube              [LOCKED]
        ├── Arc.tsx             # ARC characters / worlds
        ├── Closing.tsx         # The Pipeline + Contact + Footer
        ├── Editor.tsx          # /edit CMS route
        ├── ui.tsx              # shared UI primitives + fullscreen viewer
        └── icons.tsx           # shared icon set
```

Files that are git-ignored and regenerated (do not need committing):
`node_modules/`, `dist/`, `build/`, `*.log`.

## Sections (in page order)

| # | Section | Component | Anchor |
|---|---|---|---|
| – | Header / nav | `Header.tsx` | – |
| 1 | Hero | `Hero.tsx` | `#about` |
| 2 | Impact Metrics | `ByNumbers.tsx` | `#bynumbers` |
| 3 | My Expertise / My Journey | `Expertise.tsx` | `#expertise` |
| 4 | The Core (Radial Engine) | `CreativeCore.tsx` | `#core` |
| 5 | My Work / Show Reel | `ShowReel.tsx` | `#showreel` |
| 6 | AI Lab | `AILab.tsx` | `#ailab` |
| 7 | ARC | `Arc.tsx` | `#arc` |
| 8 | The Pipeline | `Closing.tsx` | `#pipeline` |
| 9 | Contact | `Closing.tsx` | `#contact` |
| – | Footer | `Closing.tsx` | – |
| – | CMS Editor | `Editor.tsx` | `#/edit` (hash route) |

## Typography

- Display / headings: Anton; specialty display faces declared via `@font-face`
  slots (Gondens, Newspaper, Helvetica Punk, R&C, Rogue Hero, Neuhaus Headline,
  Nura Semi Bold, DrukCond-Super) with Google-Font fallbacks.
- Body: Archivo.
- Technical / mono: IBM Plex Mono, Share Tech Mono, Chakra Petch, Orbitron,
  Oxanium, Racing Sans One.
- Font classes live in `src/index.css` (`.f-display`, `.f-tech`, `.f-mono`, etc.).
- Font files: `public/fonts/*.woff2` (licensed, optional — see recovery doc).

## Theme System

- Two themes via `.dark` on `<html>`; persisted in `localStorage["cbk-theme"]`.
- All colors are CSS custom properties in `src/index.css` (`:root` = light,
  `.dark` = dark). Crimson family: `--crimson`, `--crimson-rough`,
  `--crimson-shadow` (base `#E72241`).
- Page light `#E9E7E2` / dark `#202126`; light material Alice Blue `#F0F8FF`.

## Animation Systems (CSS keyframes + rAF; no external lib)

- Hero name glitch (`name-run` / `.nl`), Studio Disc breathing, ticker marquee
  (`ticker-lr`), metric count-up (rAF), career node auto-cycle (30s), radial
  engine idle/surge, AI Lab cube rotation, pipeline machine, fullscreen viewer
  transitions, metric/prop float keyframes. `prefers-reduced-motion` honored.

## Interaction Systems

- Theme toggle (header) with smooth material transition.
- Hash routing for the CMS (`#/edit`), no page reloads.
- Fullscreen media viewer (`ui.tsx`) — X closes, arrows navigate, no reload.
- Career node hover/lock, company switching, media drag track, ARC carousel.
- Media upload / editable slots via the CMS editor (`localStorage` persistence).

## Media / Upload Architecture

- All media is user-uploaded via the CMS editor and stored in `localStorage`
  (data URL). Slots default to editable empty placeholders. No media is bundled
  in the repo; no media is required to build or run.

## State Management

- React context store (`src/lib/store.tsx`) holding the portfolio data model
  (`src/lib/data.ts`) + theme + persistence. No external state library.

## Important Utilities

- `useReducedMotion`, `useHashRoute`, `useLocalTime`, `useCountUp` (in
  `store.tsx` / `ByNumbers.tsx`), `readAsDataURL` (media upload).

## External Dependencies (from package.json / lockfile)

- `react`, `react-dom` (v18), `vite` (v6), TypeScript, Tailwind CSS v4.
- Exact versions pinned in `package-lock.json` — do not upgrade for recovery.

## Protected Components (do not modify)

- `CreativeCore.tsx` — THE CORE / Radial Engine.
- `AILab.tsx` — AI LAB / Cube.
