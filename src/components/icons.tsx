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

/* ---- discipline icons (futuristic technical glyphs) ---- */
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
  direction: IconDirection, generative: IconGenerative, visualdev: IconVisualDev,
  cinematic: IconCinematic, aivideo: IconAiVideo, character: IconCharacter,
  environment: IconEnvironment, workflows: IconWorkflows, prompt: IconPrompt,
};

/* ---- the single rune (The Pipeline only) ---- */
export const Rune = (p: P) => (
  <svg {...base(p)} strokeWidth={p.strokeWidth ?? 2}>
    <path d="M12 2v20" /><path d="M12 6l6 4-6 4" /><path d="M12 10L6 14l6 4" /><path d="M8 2.5h8M8 21.5h8" />
  </svg>
);

/* ---- theme icons ---- */
export const MoonIcon = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" className={p.className}>
    <circle cx="12" cy="12" r="8" fill="#F2F1EC" />
    <circle cx="9.4" cy="9.8" r="1.6" fill="#C9C8C2" />
    <circle cx="14.6" cy="14.6" r="1.05" fill="#C9C8C2" />
  </svg>
);
export const SunIcon = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" className={p.className}>
    <g className="sun-spin" stroke="#E32240" strokeWidth="1.8" strokeLinecap="round">
      <path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M19.4 4.6l-2.1 2.1M6.7 17.3l-2.1 2.1" />
    </g>
    <circle cx="12" cy="12" r="5.4" fill="#E32240" className="sun-pulse" />
    <circle cx="12" cy="12" r="2.7" fill="#F07A3C" />
  </svg>
);

export const LinkedInIcon = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="currentColor" className={p.className}>
    <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.06c.53-1 1.84-2.05 3.79-2.05 4.05 0 4.8 2.67 4.8 6.14V23h-4v-7.9c0-1.88-.03-4.3-2.62-4.3-2.62 0-3.02 2.05-3.02 4.17V23H8V8z" transform="translate(2 0)" />
  </svg>
);

export const ArrowRight = (p: P) => (<svg {...base(p)}><path d="M4 12h15M13 6l6 6-6 6" /></svg>);
export const ArrowDown = (p: P) => (<svg {...base(p)}><path d="M12 4v15M6 13l6 6 6-6" /></svg>);
export const ArrowUp = (p: P) => (<svg {...base(p)}><path d="M12 20V5M6 11l6-6 6 6" /></svg>);

/* ---- ARC nav arrowhead (transparent, Arcane-style hover emphasis) ---- */
export const NavArrowHead = (p: P & { dir?: "l" | "r" }) => (
  <svg width={p.size ?? 40} height={(p.size ?? 40) * 1.4} viewBox="0 0 40 56" fill="none" className={p.className}
    style={p.dir === "r" ? { transform: "scaleX(-1)" } : undefined}>
    <path d="M30 4L8 28l22 24" stroke="currentColor" strokeWidth="3" strokeLinecap="square" />
    <path d="M34 12L18 28l16 16" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
  </svg>
);

export const PaperPlane = (p: P) => (
  <svg width={p.size ?? 18} height={p.size ?? 18} viewBox="0 0 24 24" fill="currentColor" className={p.className}>
    <path d="M2.5 11.2L21 3.5l-7.6 17.9-2.8-7.3z" /><path d="M10.6 14.1l9.4-9.6" stroke="#f4f2ed" strokeWidth="1" fill="none" />
  </svg>
);

/* ---- ODYSSEY : solid 2D graphic ancient galley, muted green color blocking ---- */
export const GreekShip = (p: P & { arrived?: boolean }) => {
  const s = p.size ?? 128;
  const HULL = "#4e6e58";
  const HULL_D = "#38523f";
  const TRIM = "#2b3f31";
  const SAIL = "#e7e6e1";
  const SAIL_D = "#c9c8c0";
  return (
    <svg width={s} height={s * 0.62} viewBox="0 0 128 80" fill="none" className={p.className}>
      {/* hull — solid blocked shape */}
      <path d="M8 46c4 12 20 20 56 20s52-8 56-20l-10 2c-6 8-20 12-46 12s-40-4-46-12z" fill={HULL_D} />
      <path d="M10 40c8 12 24 18 54 18s46-6 54-18l-4-6H14z" fill={HULL} />
      {/* trim band + oar ports */}
      <rect x="16" y="38" width="96" height="5" fill={TRIM} />
      {[28, 42, 56, 70, 84, 98].map((x) => <rect key={x} x={x} y="39.4" width="5" height="2.4" fill={SAIL} opacity="0.85" />)}
      {/* prow + stern (solid, curved) */}
      <path d="M10 40C5 32 5 22 12 12c1.6 6 4 10 8 12l-3 9z" fill={HULL_D} />
      <path d="M12 12c3-2 6-2 8 0-3 1-5 3-6 6z" fill={TRIM} />
      <path d="M118 40c5-8 5-18-2-28-1.6 6-4 10-8 12l3 9z" fill={HULL_D} />
      {/* oars */}
      <g stroke={TRIM} strokeWidth="2" strokeLinecap="round">
        {[30, 44, 58, 72, 86].map((x) => <path key={x} d={`M${x} 46l-7 12`} />)}
      </g>
      {/* mast + solid sail */}
      <rect x="61.5" y="6" width="5" height="34" fill={TRIM} />
      <path d="M36 10h56l-7 24H43z" fill={SAIL} />
      <path d="M36 10h56l-2 7H38z" fill={SAIL_D} />
      <rect x="58" y="17" width="12" height="17" fill={HULL} opacity="0.9" />
      {/* flag — hoists on arrival */}
      <g className="flag-hoist" style={{ transform: p.arrived ? "translateY(0)" : "translateY(9px)", opacity: p.arrived ? 1 : 0, transition: "transform .9s cubic-bezier(.2,.9,.25,1.2), opacity .5s ease" }}>
        <rect x="62.6" y="-4" width="2.4" height="12" fill={TRIM} />
        <path d="M65 -4h15l-4 4.5 4 4.5H65z" fill="#e32240" />
      </g>
    </svg>
  );
};

export const Island = (p: P) => (
  <svg width={p.size ?? 110} height={(p.size ?? 110) * 0.55} viewBox="0 0 110 60" fill="none" className={p.className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 52c10-8 20-12 30-12 4-8 10-14 18-16l4 8 6-4c8 4 14 12 18 24" />
    <path d="M4 52h102" />
    <path d="M74 22c0-8 2-14 8-18M82 4c-4 4-8 5-12 4M82 4c4 3 8 4 12 2M82 4c-1 5-4 8-8 9M82 4c2 4 6 6 10 6" strokeWidth="1.6" />
    <path d="M18 44l6-6M92 44l-5-5" strokeWidth="1.4" />
  </svg>
);

/* ---- SEA THREAT : dragon head + large squid tentacles, clearly readable ---- */
export const SeaThreat = (p: P & { rise: boolean; capturing?: boolean }) => (
  <svg width={p.size ?? 150} height={(p.size ?? 150) * 0.62} viewBox="0 0 190 94" fill="none" className={p.className} stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <g style={{
      transform: p.rise ? "translateY(0)" : "translateY(82%)",
      opacity: p.rise ? 1 : 0,
      transition: "transform 1.4s cubic-bezier(.3,.8,.3,1), opacity .9s ease",
    }}>
      {/* dragon head */}
      <path d="M34 78c-8-16-6-32 6-44 4 8 10 12 18 12-2 8 0 14 6 18-8 2-12 8-12 16z" fill="currentColor" fillOpacity="0.12" />
      <path d="M34 78c-8-16-6-32 6-44 4 8 10 12 18 12-2 8 0 14 6 18-8 2-12 8-12 16" />
      <path d="M40 34c2-6 8-10 14-10M58 46l8-4M46 24l-4-8 10 4" strokeWidth="2" />
      <circle cx="47" cy="42" r="3.2" fill="currentColor" stroke="none" />
      <path d="M62 60l6 5-8 2" />
      {/* large squid tentacles — thick, curling, readable */}
      <path d="M86 88c-4-22 4-40 20-50 8-5 12-12 11-21-6 3-9 8-10 14" strokeWidth="3.4" />
      <path d="M112 88c-2-16 2-28 12-36 7-6 10-13 9-21" strokeWidth="3" />
      <path d="M136 88c-1-12 2-22 9-29 5-5 7-10 6-16" strokeWidth="2.6" />
      <path d="M158 88c-2-9-1-16 4-22" strokeWidth="2.2" />
      {/* sucker marks */}
      {[[96, 52], [104, 40], [120, 56], [128, 44], [142, 62]].map(([x, y]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r="1.8" fill="currentColor" stroke="none" />
      ))}
      {/* splash at the waterline */}
      <path d="M20 88h156" strokeWidth="1.6" opacity="0.7" />
      <path d="M78 82c3-4 7-5 11-3M150 82c3-4 7-5 11-3" strokeWidth="1.6" opacity="0.6" />
    </g>
  </svg>
);
