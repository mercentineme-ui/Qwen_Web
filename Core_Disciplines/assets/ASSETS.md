# ASSETS — CORE-RADIAL-V1-APPROVED

## Binary assets: NONE

The Core renders **entirely from inline SVG + CSS**. There are **no**
PNG / JPG / WebP / audio / texture / mask image files used by the Core, and
none are referenced anywhere in `components/CreativeCore.tsx` or its
dependencies. Every visual — the machine, rings, gears, nodes, icons, pointer,
couplings — is vector drawn in code.

Therefore there is nothing to archive under `assets/images`, `assets/svg`,
`assets/textures`, etc., and those folders were intentionally NOT created
(per instruction: "Do NOT create empty placeholder files").

## The nine discipline icons

The node icons are inline React SVG components in
`components/icons.tsx` (`disciplineIcons` map): `direction`, `generative`,
`visualdev`, `cinematic`, `aivideo`, `character`, `environment`, `workflows`,
`prompt`. They are code, not asset files, and are archived with the component.

## Fonts (shared, external)

The Core's typography relies on three Google Fonts loaded by the project's
`index.html` `<link>` (a shared-project dependency, not Core-local):

| Family | Weights | Used for |
|---|---|---|
| Anton | 400 | `.f-display` — headings, node titles, card titles |
| Chakra Petch | 500/600/700 | `.f-tech` — labels, chips, buttons |
| IBM Plex Mono | 400/500/600 | `.f-mono` — technical metadata, card readouts |

For an offline restore, fetch those three families (weights above) and ensure
the `index.html` font `<link>` is present. No font files are bundled here.

## Summary

- Binary assets archived: **0** (none exist / none needed)
- Icons: inline SVG in `components/icons.tsx`
- Fonts: external via Google Fonts (shared) — documented, not bundled
