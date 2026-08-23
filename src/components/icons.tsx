import React from "react";

type P = { size?: number; className?: string; strokeWidth?: number };
const base = (p: P) => ({
  width: p.size ?? 20,
  height: p.size ?? 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: p.strokeWidth ?? 1.7,
  strokeLinecap: "square" as const,
  className: p.className,
});

/* ---- discipline icons (custom technical glyphs) ---- */
export const IconDirection = (p: P) => (
  <svg {...base(p)}><path d="M12 3v18M3 12h18" /><path d="M12 3l3 3-3 3-3-3z" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="2.2" /></svg>
);
export const IconGenerative = (p: P) => (
  <svg {...base(p)}><rect x="4" y="4" width="7" height="7" /><rect x="13" y="13" width="7" height="7" /><path d="M11 7.5h5.5V13M7.5 11v5.5H13" /><path d="M17.5 4.5l2 2-2 2-2-2z" fill="currentColor" stroke="none" /></svg>
);
export const IconVisualDev = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" /><path d="M3 15l5-5 4 4 3-3 6 6" /><circle cx="9" cy="9" r="1.4" fill="currentColor" stroke="none" /></svg>
);
export const IconCinematic = (p: P) => (
  <svg {...base(p)}><rect x="3" y="5" width="18" height="14" /><path d="M3 8h18M7 5v3M12 5v3M17 5v3" /><path d="M10 12l5 3-5 3z" fill="currentColor" stroke="none" /></svg>
);
export const IconAiVideo = (p: P) => (
  <svg {...base(p)}><rect x="3" y="6" width="13" height="12" /><path d="M16 10l5-3v10l-5-3z" /><path d="M5.5 9h5M5.5 12h3" /></svg>
);
export const IconCharacter = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="8" r="3.4" /><path d="M5 20c1.2-4 3.6-6 7-6s5.8 2 7 6" /><path d="M12 11.4V14" /></svg>
);
export const IconEnvironment = (p: P) => (
  <svg {...base(p)}><path d="M3 18h18" /><path d="M5 18l4.5-8 3 5 2.5-3.5L19 18" /><path d="M4 7h6M4 9.5h3.5" /></svg>
);
export const IconWorkflows = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4" width="5" height="5" /><rect x="16" y="4" width="5" height="5" /><rect x="9.5" y="15" width="5" height="5" /><path d="M8 6.5h8M5.5 9v3.5h6.5M18.5 9v3.5H12" /></svg>
);
export const IconPrompt = (p: P) => (
  <svg {...base(p)}><rect x="3" y="4" width="18" height="16" /><path d="M6.5 9l3 3-3 3M12 15.5h5.5" /></svg>
);

export const disciplineIcons: Record<string, (p: P) => React.ReactElement> = {
  direction: IconDirection,
  generative: IconGenerative,
  visualdev: IconVisualDev,
  cinematic: IconCinematic,
  aivideo: IconAiVideo,
  character: IconCharacter,
  environment: IconEnvironment,
  workflows: IconWorkflows,
  prompt: IconPrompt,
};

/* ---- the single rune (How I Build) ---- */
export const Rune = (p: P) => (
  <svg {...base(p)} strokeWidth={p.strokeWidth ?? 2}>
    <path d="M12 2v20" />
    <path d="M12 6l6 4-6 4" />
    <path d="M12 10L6 14l6 4" />
    <path d="M8 2.5h8M8 21.5h8" />
  </svg>
);

/* ---- theme icons ---- */
export const MoonIcon = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" className={p.className}>
    <circle cx="12" cy="12" r="7.5" fill="#F2F1EC" />
    <circle cx="9.5" cy="10" r="1.5" fill="#C9C8C2" />
    <circle cx="14.5" cy="14.5" r="1" fill="#C9C8C2" />
  </svg>
);
export const SunIcon = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" className={p.className}>
    <g className="sun-spin" stroke="#E32240" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1" />
    </g>
    <circle cx="12" cy="12" r="5.2" fill="#E32240" className="sun-pulse" />
    <circle cx="12" cy="12" r="2.6" fill="#F07A3C" />
  </svg>
);

export const LinkedInIcon = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="currentColor" className={p.className}>
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.06c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.67 4.8 6.14V23h-4v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.17V23H8V8z" transform="translate(2 0)" />
  </svg>
);

export const ArrowRight = (p: P) => (
  <svg {...base(p)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>
);
export const ArrowDown = (p: P) => (
  <svg {...base(p)}><path d="M12 4v15M6 13l6 6 6-6" /></svg>
);
export const ArrowUp = (p: P) => (
  <svg {...base(p)}><path d="M12 20V5M6 11l6-6 6 6" /></svg>
);

/* ---- sea system (line art, interface graphics) ---- */
export const Longship = (p: P) => (
  <svg width={p.size ?? 120} height={(p.size ?? 120) * 0.52} viewBox="0 0 120 62" fill="none" className={p.className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* hull */}
    <path d="M8 38c6 10 20 16 52 16s46-6 52-16l-6 1c-4 6-18 10-46 10s-42-4-46-10z" fill="currentColor" stroke="none" />
    {/* prow + stern curls */}
    <path d="M8 38C4 30 4 20 10 12c2 6 4 9 8 11M112 38c4-8 4-18-2-26-2 6-4 9-8 11" />
    {/* shield rail */}
    <path d="M22 36h76" />
    <circle cx="32" cy="36" r="3.4" /><circle cx="46" cy="36" r="3.4" /><circle cx="60" cy="36" r="3.4" /><circle cx="74" cy="36" r="3.4" /><circle cx="88" cy="36" r="3.4" />
    {/* mast + sail */}
    <path d="M60 34V6M60 6l4 2" />
    <path d="M38 10h44l-6 20H44z" />
    <path d="M42 16h36M45 23h30" strokeWidth="1.2" />
  </svg>
);

export const Island = (p: P) => (
  <svg width={p.size ?? 110} height={(p.size ?? 110) * 0.55} viewBox="0 0 110 60" fill="none" className={p.className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 52c10-8 20-12 30-12 4-8 10-14 18-16l4 8 6-4c8 4 14 12 18 24" />
    <path d="M4 52h102" />
    {/* palm */}
    <path d="M74 22c0-8 2-14 8-18M82 4c-4 4-8 5-12 4M82 4c4 3 8 4 12 2M82 4c-1 5-4 8-8 9M82 4c2 4 6 6 10 6" strokeWidth="1.6" />
    <path d="M18 44l6-6M92 44l-5-5" strokeWidth="1.4" />
  </svg>
);

export const Kraken = (p: P & { rise: boolean }) => (
  <svg width={p.size ?? 90} height={(p.size ?? 90) * 0.8} viewBox="0 0 90 72" fill="none" className={p.className} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <g style={{ transform: p.rise ? "translateY(0)" : "translateY(68%)", opacity: p.rise ? 1 : 0, transition: "transform 1.1s cubic-bezier(.3,.8,.3,1), opacity .8s ease" }}>
      <path d="M14 66c0-14 6-22 14-26M14 66c4-10 10-14 16-15" />
      <path d="M30 66c-2-16 4-28 15-34 6-3 9-8 8-14-4 2-6 5-7 9" />
      <path d="M45 66c0-12 3-20 9-25 5-4 7-9 6-15" />
      <path d="M60 66c-1-10 2-18 8-23M73 66c-2-8-1-14 3-19" />
      {/* suckers */}
      <circle cx="33" cy="46" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="37" cy="38" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="47" cy="44" r="1.4" fill="currentColor" stroke="none" />
      {/* eye */}
      <circle cx="49" cy="24" r="3.4" />
      <circle cx="49" cy="24" r="1.1" fill="currentColor" stroke="none" />
    </g>
    <path d="M2 66h86" strokeWidth="1.4" />
  </svg>
);
