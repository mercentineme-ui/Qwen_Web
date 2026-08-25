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

/* ---- the single rune (The Pipeline only) ---- */
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
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" className={p.className}>
    <circle cx="12" cy="12" r="8" fill="#DDDDD8" />
    <circle cx="9.5" cy="10" r="1.6" fill="#A6A6A4" />
    <circle cx="14.5" cy="14.5" r="1.1" fill="#A6A6A4" />
  </svg>
);
export const SunIcon = (p: P) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" className={p.className}>
    <g className="sun-spin" stroke="#E72241" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1" />
    </g>
    <circle cx="12" cy="12" r="5.4" fill="#E72241" className="sun-pulse" />
    <circle cx="12" cy="12" r="2.7" fill="#FF7A1F" />
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
export const ArrowUp = (p: P) => (
  <svg {...base(p)}><path d="M12 20V5M6 11l6-6 6 6" /></svg>
);
export const ArrowDown = (p: P) => (
  <svg {...base(p)}><path d="M12 4v15M6 13l6 6 6-6" /></svg>
);

/* ---- ARC nav arrowhead (left/right) ---- */
export const NavArrowHead = ({ size = 40, dir = "left", className }: { size?: number; dir?: "left" | "right"; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}
    style={{ transform: dir === "right" ? "scaleX(-1)" : undefined }}>
    <path d="M26 6 Q18 14 8 20 Q18 26 26 34 Q22 20 26 6 Z" fill="currentColor" />
    <path d="M24 12 Q20 16 14 20 Q20 24 24 28 Q22 20 24 12 Z" fill="#E72241" opacity="0.55" />
  </svg>
);

/* ---- paper plane ---- */
export const PaperPlane = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M2 12l20-8-6 18-4.5-7.5z" />
    <path d="M11.5 14.5L22 4" stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
  </svg>
);

/* ---- sea system (solid 2D black/white line art) ---- */
export const Island = ({ size = 104, className }: { size?: number; className?: string }) => (
  <svg width={size} height={size * 0.55} viewBox="0 0 110 60" fill="none" className={className} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 52c10-8 20-12 30-12 4-8 10-14 18-16l4 8 6-4c8 4 14 12 18 24" />
    <path d="M4 52h102" />
    <path d="M74 22c0-8 2-14 8-18M82 4c-4 4-8 5-12 4M82 4c4 3 8 4 12 2M82 4c-1 5-4 8-8 9M82 4c2 4 6 6 10 6" strokeWidth="1.8" />
    <path d="M18 44l6-6M92 44l-5-5" strokeWidth="1.5" />
  </svg>
);

export const GreekShip = ({ size = 120, arrived = false, className }: { size?: number; arrived?: boolean; className?: string }) => (
  <svg width={size} height={size * 0.52} viewBox="0 0 120 62" fill="none" className={className} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    {/* hull — clean 2D silhouette, secondary to the media */}
    <path d="M10 40c8 9 22 14 50 14s42-5 50-14l-8 2c-6 5-19 8-42 8s-36-3-42-8z" />
    {/* prow + stern curls */}
    <path d="M10 40C5 33 5 22 11 14c2 6 4 9 8 11M110 40c5-7 5-18-1-26-2 6-4 9-8 11" />
    {/* oars */}
    <path d="M30 50l-6 9M46 53l-5 8M62 54v10M78 53l5 8M94 50l6 9" strokeWidth="1.8" />
    {/* mast + sail outline */}
    <path d="M60 36V8M60 8l4 2" />
    <path d="M40 12h40l-6 20H46z" />
    <path d="M44 18h32M47 25h26" strokeWidth="1.4" />
    {/* shield rail */}
    <circle cx="34" cy="38" r="3.2" strokeWidth="1.8" /><circle cx="48" cy="38" r="3.2" strokeWidth="1.8" />
    <circle cx="62" cy="38" r="3.2" strokeWidth="1.8" /><circle cx="76" cy="38" r="3.2" strokeWidth="1.8" />
    {/* flag — hoists on arrival */}
    <g style={{ transform: arrived ? "translateY(0)" : "translateY(9px)", opacity: arrived ? 1 : 0, transition: "transform .7s cubic-bezier(.3,.9,.3,1.2) .25s, opacity .5s ease .25s" }}>
      <path d="M60 8V0" strokeWidth="1.8" />
      <path d="M60 0h13l-4 4 4 4H60z" fill="#E72241" stroke="none" />
    </g>
  </svg>
);

export const SeaThreat = ({ size = 150, rise = false, capturing = false, className }: { size?: number; rise?: boolean; capturing?: boolean; className?: string }) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 150 108" fill="none" className={className} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <g style={{
      transform: rise ? "translateY(0)" : "translateY(82%)",
      opacity: rise ? 1 : 0,
      transition: `transform ${rise ? "2.2s" : "0.5s"} cubic-bezier(.4,.6,.3,1), opacity ${rise ? "1.4s" : "0.4s"} ease`,
    }}>
      {/* dragon head */}
      <path d="M96 30c-4-10-14-16-26-15-3-5-9-7-14-5 2 4 2 7 1 10-8 3-13 9-14 17 8-2 14-1 19 3 3-2 7-3 11-2" />
      <path d="M57 15l-6-9M66 12l-2-9" strokeWidth="1.8" />
      <circle cx="72" cy="24" r="2.6" fill={capturing ? "#E72241" : "currentColor"} stroke="none" />
      <path d="M44 42l-8 3 9 3" strokeWidth="1.8" />
      {/* large squid tentacles — clearly readable */}
      <path d="M20 104c0-20 8-32 20-38M34 104c-2-14 4-24 14-29" />
      <path d="M50 104c-1-16 5-27 15-33 5-3 7-8 6-13" />
      <path d="M70 104c0-13 4-22 11-27 5-4 7-9 6-15" />
      <path d="M92 104c-1-11 2-19 8-24M112 104c-2-9-1-15 3-20M130 104c-2-7-1-12 2-16" />
      {/* suckers */}
      <circle cx="40" cy="78" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="46" cy="68" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="58" cy="80" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="64" cy="70" r="1.8" fill="currentColor" stroke="none" />
      <circle cx="80" cy="82" r="1.8" fill="currentColor" stroke="none" />
    </g>
    <path d="M4 104h142" strokeWidth="1.6" />
  </svg>
);
