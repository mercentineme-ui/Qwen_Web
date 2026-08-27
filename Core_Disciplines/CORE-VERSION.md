# CORE-VERSION

**Version identifier:** `CORE-RADIAL-V1-APPROVED`

## Snapshot facts

| Field | Value |
|---|---|
| Version | `CORE-RADIAL-V1-APPROVED` |
| Component | `CreativeCore.tsx` (951 lines) |
| Data | `data.ts` (324 lines) — nine disciplines `d1…d9` |
| Store | `store.tsx` (144 lines) |
| Repository | `mercentineme-ui/Qwen_Web` |
| Branch | `cyberpunk-editorial-portfolio-8dc99` |
| Archive path | `Core_Disciplines/` |
| Source of truth | the live working Core at archive time (verified byte-identical) |

## Provenance

This snapshot was created by copying the **live, approved** Core implementation
(`src/components/CreativeCore.tsx` and its dependencies) verbatim. No content
was redesigned, simplified, or approximated. Verification markers confirmed at
archive time (e.g. `const DIS_MS = 320;` at line 168, "ON STAND BY" at line
900, `PROMPT ARCHITECTURE` as discipline `d9`).

## Immutability rule

`Core_Disciplines/` is a **protected archival snapshot**. Future redesigns of
the live Core must NOT overwrite this folder. A future approved version should
be stored as a new version (e.g. `CORE-RADIAL-V2-…`), never by mutating
`CORE-RADIAL-V1-APPROVED`.

## Git checkpoint (pending write access)

Repository write access to `mercentineme-ui/Qwen_Web` is **not available** in
the current environment, so the commit and tag were **not created** here. When
write access is available, run:

```
git checkout cyberpunk-editorial-portfolio-8dc99
git add Core_Disciplines/
git commit -m "CORE DISCIPLINES: preserve approved radial engine v1"
git push origin cyberpunk-editorial-portfolio-8dc99
git tag CORE-RADIAL-V1-APPROVED
git push origin CORE-RADIAL-V1-APPROVED
```

The tag `CORE-RADIAL-V1-APPROVED` must point to the commit containing this
complete, verified archive.
