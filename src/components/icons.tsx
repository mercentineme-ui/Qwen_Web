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

/* ---- discipline icons ---- */
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
    <g className="sun-spin" stroke="#E72241" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1" />
    </g>
    <circle cx="12" cy="12" r="5.4" fill="#E72241" className="sun-pulse" />
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

export const PaperPlane = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" className={p.className} fill="currentColor">
    <path d="M2 11l20-8-7 20-3.5-8.5L2 11zm9.5 3.5L22 3 13 16.5l-1.5-2z" />
  </svg>
);

/* ---- sea system (line art, interface graphics) ---- */
export const GreekShip = (p: P & { arrived?: boolean }) => (
  <svg width={p.size ?? 120} height={(p.size ?? 120) * 0.55} viewBox="0 0 140 72" fill="none" className={p.className}
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    {/* hull — clean 2D silhouette */}
    <path d="M8 44c8 12 26 18 62 18s54-6 62-18l-8 2c-6 8-22 12-54 12s-48-4-54-12z" fill="currentColor" stroke="none" />
    <path d="M8 44C4 34 4 22 12 12c2 8 5 12 10 14M132 44c4-10 4-22-4-32-2 8-5 12-10 14" />
    {/* oar line + shields */}
    <path d="M26 42h88" strokeWidth="1.6" />
    <circle cx="40" cy="42" r="3.6" strokeWidth="1.8" /><circle cx="56" cy="42" r="3.6" strokeWidth="1.8" />
    <circle cx="72" cy="42" r="3.6" strokeWidth="1.8" /><circle cx="88" cy="42" r="3.6" strokeWidth="1.8" />
    {/* oars */}
    <path d="M44 46l-6 12M60 47l-4 12M78 47l2 12M94 46l6 12" strokeWidth="1.6" />
    {/* mast + sail */}
    <path d="M70 40V8M70 8l5 2" strokeWidth="2" />
    <path d="M46 12h48l-7 22H53z" strokeWidth="2" />
    <path d="M50 19h40M53 26h34" strokeWidth="1.2" />
    {/* flag — hoists at the island */}
    <g style={{ transform: p.arrived ? "translateY(0)" : "translateY(6px)", opacity: p.arrived ? 1 : 0, transition: "transform .5s ease .15s, opacity .4s ease .15s" }}>
      <path d="M70 8h16l-4 4 4 4H70z" fill="#E72241" stroke="none" />
    </g>
  </svg>
);

export const Island = (p: P) => (
  <svg width={p.size ?? 110} height={(p.size ?? 110) * 0.55} viewBox="0 0 110 60" fill="none" className={p.className}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 52c10-8 20-12 30-12 4-8 10-14 18-16l4 8 6-4c8 4 14 12 18 24" />
    <path d="M4 52h102" />
    <path d="M74 22c0-8 2-14 8-18M82 4c-4 4-8 5-12 4M82 4c4 3 8 4 12 2M82 4c-1 5-4 8-8 9M82 4c2 4 6 6 10 6" strokeWidth="1.6" />
    <path d="M18 44l6-6M92 44l-5-5" strokeWidth="1.4" />
  </svg>
);

/* sea dragon head + squid tentacles — rises when the voyage pauses */
export const SeaThreat = (p: P & { rise: boolean; capturing?: boolean }) => (
  <svg width={p.size ?? 120} height={(p.size ?? 120) * 0.72} viewBox="0 0 130 86" fill="none" className={p.className}
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <g style={{ transform: p.rise ? "translateY(0)" : "translateY(78%)", opacity: p.rise ? 1 : 0, transition: "transform 2.2s cubic-bezier(.3,.7,.3,1), opacity 1s ease" }}>
      {/* dragon head */}
      <path d="M14 66C10 50 14 36 26 30c-2 6-1 10 2 13 4-8 12-12 20-11-5 4-7 8-7 13 8-2 14 1 17 7l-8 1c2 4 1 8-2 11" />
      <circle cx="30" cy="40" r="2.4" fill="currentColor" stroke="none" />
      <path d="M26 30l-4-8 8 4M48 32l4-8 2 9" strokeWidth="1.6" />
      <path d="M52 52l6 3-6 3" strokeWidth="1.6" />
      {/* squid tentacles — clearly readable curls reaching the ship */}
      <path d="M66 80c0-14 6-24 16-28M66 80c4-10 10-16 18-18" />
      <path d="M84 80c-2-16 4-28 15-34 6-3 9-8 8-14-4 2-6 5-7 9" />
      <path d="M99 80c0-12 3-20 9-25M112 80c-2-8-1-14 3-19" />
      <circle cx="87" cy="56" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="91" cy="48" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="102" cy="52" r="1.5" fill="currentColor" stroke="none" />
    </g>
    <path d="M2 80h126" strokeWidth="1.4" opacity="0.7" />
  </svg>
);

/* ARC carousel arrowhead — machined, directional */
export const NavArrowHead = (p: P & { dir?: "left" | "right" }) => {
  const flip = p.dir === "left" ? "scale(-1 1) translate(-24 0)" : undefined;
  return (
    <svg width={p.size ?? 40} height={(p.size ?? 40)} viewBox="0 0 24 24" className={p.className}>
      <g transform={flip}>
        <path d="M6 3 L18 12 L6 21 L9.4 12 Z" fill="currentColor" />
        <path d="M3.4 6 L10 12 L3.4 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
      </g>
    </svg>
  );
};
