import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const C = 300;
const N = 9;
const DEG = Math.PI / 180;

/* ---- technical palette (fixed — the Core is a dark instrument on a light work surface) ---- */
const PAL = {
  bg: "#E5E4DF",
  cavity: "#15181C",
  main: "#202328",
  sec: "#292D32",
  raised: "#34383D",
  edge: "#4A4E53",
  line: "#666A6E",
  red: "#E9233F",
  redDeep: "#8F1528",
  redBright: "#FF334D",
  white: "#D8D9D6",
};

/* ---- radial discipline layout (spec positions: 01 top, numbering counter-clockwise) ---- */
const ANG_POS: Record<string, number> = {
  "CREATIVE DIRECTION": 0,
  "GENERATIVE AI": 40,
  "VISUAL DEVELOPMENT": 80,
  "CINEMATIC STORYTELLING": 120,
  "AI IMAGE + VIDEO": 160,
  "CHARACTER DEVELOPMENT": 200,
  "ENVIRONMENT DESIGN": 240,
  "AI CREATIVE WORKFLOWS": 280,
  "PROMPT ARCHITECTURE": 320,
};
const LBL: Record<string, { lines: [string, string]; side: "above" | "right" | "left" | "below" }> = {
  "CREATIVE DIRECTION": { lines: ["CREATIVE", "DIRECTION"], side: "above" },
  "GENERATIVE AI": { lines: ["GENERATIVE", "AI"], side: "right" },
  "VISUAL DEVELOPMENT": { lines: ["VISUAL", "DEVELOPMENT"], side: "right" },
  "CINEMATIC STORYTELLING": { lines: ["CINEMATIC", "STORYTELLING"], side: "below" },
  "AI IMAGE + VIDEO": { lines: ["AI IMAGE +", "VIDEO"], side: "below" },
  "CHARACTER DEVELOPMENT": { lines: ["CHARACTER", "DEVELOPMENT"], side: "below" },
  "ENVIRONMENT DESIGN": { lines: ["ENVIRONMENT", "DESIGN"], side: "left" },
  "AI CREATIVE WORKFLOWS": { lines: ["AI CREATIVE", "WORKFLOWS"], side: "left" },
  "PROMPT ARCHITECTURE": { lines: ["PROMPT", "ARCHITECTURE"], side: "left" },
};
const LBL_FALLBACK: [string, string][] = [
  ["CREATIVE", "DIRECTION"], ["GENERATIVE", "AI"], ["VISUAL", "DEVELOPMENT"],
  ["CINEMATIC", "STORYTELLING"], ["AI IMAGE +", "VIDEO"], ["CHARACTER", "DEVELOPMENT"],
  ["ENVIRONMENT", "DESIGN"], ["AI CREATIVE", "WORKFLOWS"], ["PROMPT", "ARCHITECTURE"],
];

function nodeAngle(i: number, name: string) {
  return ANG_POS[name] ?? i * (360 / N);
}
function nodePos(i: number, name: string, r: number) {
  const deg = nodeAngle(i, name);
  return { x: 50 + r * Math.sin(deg * DEG), y: 50 - r * Math.cos(deg * DEG), deg };
}
/* positional number per spec: 01 at top, increasing counter-clockwise */
const posNum = (ang: number) => String(Math.round((((360 - ang) % 360) / 40) + 1)).padStart(2, "0");
const polar = (r: number, deg: number) => [C + r * Math.sin(deg * DEG), C - r * Math.cos(deg * DEG)] as const;
const wrap = (d: number) => ((d + 180) % 360 + 360) % 360 - 180;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/* ================= machined gear primitive (drawn at origin) ================= */
function Gear({ r, teeth, fill, stroke, spokes = 0 }: {
  r: number; teeth: number; fill: string; stroke: string; spokes?: number;
}) {
  return (
    <>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * 2 * Math.PI;
        return (
          <rect key={i} x={-r * 0.15} y={-r * 0.24} width={r * 0.3} height={r * 0.48} rx={r * 0.05}
            transform={`translate(${r * Math.cos(a)} ${r * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
            fill={fill} stroke={stroke} strokeWidth={0.9} />
        );
      })}
      <circle r={r * 0.82} fill={fill} stroke={stroke} strokeWidth={1.4} />
      <path d={`M${-r * 0.55} ${-r * 0.4} A${r * 0.7} ${r * 0.7} 0 0 1 ${r * 0.08} ${-r * 0.68}`}
        fill="none" stroke={PAL.edge} strokeWidth={1.2} opacity={0.5} strokeLinecap="round" />
      {spokes > 0 && Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * 2 * Math.PI;
        return <circle key={i} cx={r * 0.48 * Math.cos(a)} cy={r * 0.48 * Math.sin(a)} r={r * 0.15}
          fill={PAL.cavity} stroke={stroke} strokeWidth={0.8} />;
      })}
      <circle r={r * 0.26} fill={PAL.cavity} stroke={stroke} strokeWidth={1.1} />
      <circle r={r * 0.09} fill={stroke} />
    </>
  );
}

const Bolt = ({ x, y, deg = 0 }: { x: number; y: number; deg?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${deg})`}>
    <circle r={4} fill={PAL.raised} stroke={PAL.edge} strokeWidth={1} />
    <rect x={-2.4} y={-0.8} width={4.8} height={1.6} fill={PAL.cavity} />
  </g>
);

/* ================= component ================= */
export default function CreativeCore() {
  const { data } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();

  /* ---- selection model (preserved) ---- */
  const [autoIdx, setAutoIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const locked = lockedIdx !== null;
  const sel = hoverIdx ?? lockedIdx ?? autoIdx;
  const d = disciplines[sel];

  useEffect(() => {
    if (reduced || locked || hoverIdx !== null) return;
    const iv = window.setInterval(() => setAutoIdx((a) => (a + 1) % N), 20000);
    return () => clearInterval(iv);
  }, [reduced, locked, hoverIdx]);

  const pick = (i: number) => {
    if (locked && lockedIdx === i) setLockedIdx(null);
    else setLockedIdx(i);
  };

  const activeAngle = nodeAngle(sel, disciplines[sel].name);
  /* machine attentiveness: auto → subtle, hover → attentive, lock → operating */
  const intensity = hoverIdx !== null ? 0.65 : locked ? 1 : 0.4;

  /* ---- engine state ---- */
  const ringIndexG = useRef<SVGGElement>(null);
  const perimG = useRef<SVGGElement>(null);
  const secTrackG = useRef<SVGGElement>(null);
  const gearLgG = useRef<SVGGElement>(null);
  const gearSm1G = useRef<SVGGElement>(null);
  const gearSm2G = useRef<SVGGElement>(null);
  const cGear1G = useRef<SVGGElement>(null);
  const cGear2G = useRef<SVGGElement>(null);
  const cGear3G = useRef<SVGGElement>(null);
  const lowerGearG = useRef<SVGGElement>(null);
  const escG = useRef<SVGGElement>(null);
  const armG = useRef<SVGGElement>(null);
  const heartG = useRef<SVGGElement>(null);
  const heartRed = useRef<SVGCircleElement>(null);
  const pulseG = useRef<SVGCircleElement>(null);
  const sigConn = useRef<SVGGElement>(null);
  const sigOuter = useRef<SVGGElement>(null);
  const sigInner = useRef<SVGGElement>(null);

  const eng = useRef({
    t: 0, last: 0, raf: 0, energy: 0,
    surgeAt: 5, surge: -1, env: 0,
    sig: 0, lastSel: -1, pulse: 0,
    a: { ringIndex: 0, perim: 0, secTrack: 0, gearLg: 0, gearSm1: 0, gearSm2: 0,
         cGear1: 0, cGear2: 0, cGear3: 0, lowerGear: 0, esc: 0, escTimer: 0, escStep: 0,
         arm: 0, heart: 0 },
  });
  const intenRef = useRef(intensity);
  intenRef.current = intensity;
  const activeAngRef = useRef(activeAngle);
  activeAngRef.current = activeAngle;

  useEffect(() => {
    const e = eng.current;
    const setRot = (g: React.RefObject<SVGGElement | null>, a: number) =>
      g.current?.setAttribute("transform", `rotate(${a.toFixed(2)} ${C} ${C})`);
    const setLocal = (g: React.RefObject<SVGGElement | null>, a: number, cx: number, cy: number) =>
      g.current?.setAttribute("transform", `translate(${cx} ${cy}) rotate(${a.toFixed(2)})`);

    if (reduced) {
      /* static assembled state */
      setRot(ringIndexG, 4); setRot(perimG, -6); setRot(secTrackG, 8);
      setLocal(gearLgG, 10, 230, 224); setLocal(gearSm1G, -20, 266, 246); setLocal(gearSm2G, 26, 206, 254);
      setLocal(cGear1G, 15, 350, 300); setLocal(cGear2G, -22, 275, 343); setLocal(cGear3G, 30, 275, 257);
      setLocal(lowerGearG, 12, 300, 398);
      setLocal(escG, 8, 230, 188);
      armG.current?.setAttribute("transform", `rotate(${activeAngRef.current} ${C} ${C})`);
      heartRed.current?.setAttribute("opacity", "0.8");
      return;
    }

    const loop = (t: number) => {
      const dt = Math.min(0.05, e.last ? (t - e.last) / 1000 : 0.016);
      e.last = t; e.t += dt;

      /* 10-second power surge */
      if (e.surge < 0 && e.t >= e.surgeAt) e.surge = 0;
      let env = 0;
      if (e.surge >= 0) {
        e.surge += dt;
        env = e.surge < 0.4 ? e.surge / 0.4
          : e.surge < 1.4 ? 1
          : e.surge < 3 ? Math.max(0, 1 - (e.surge - 1.4) / 1.6) : 0;
        if (e.surge >= 3) { e.surge = -1; e.surgeAt = e.t + 10; }
      }
      e.env = env;
      e.energy += (1 - e.energy) * Math.min(1, dt * 1.1);
      const inten = intenRef.current;
      const spd = e.energy * (1 + 1.4 * env + 0.3 * inten);

      /* ---- independent ring / gear speeds ---- */
      const a = e.a;
      a.ringIndex += 0.7 * spd * dt;     /* very slow CW */
      a.perim -= 1.2 * spd * dt;         /* slow CCW */
      a.secTrack += 2.6 * spd * dt;      /* medium CW */
      a.gearLg += 9 * spd * dt;
      a.gearSm1 -= 21 * spd * dt;
      a.gearSm2 += 31 * spd * dt;
      a.cGear1 += 26 * spd * dt;
      a.cGear2 -= 37 * spd * dt;
      a.cGear3 += 50 * spd * dt;
      a.lowerGear += 13 * spd * dt;

      /* escapement: periodic tick → release → lock */
      a.escTimer += dt * (0.8 + 1.2 * env);
      if (a.escTimer > 0.5) { a.escTimer -= 0.5; a.escStep++; }
      const escTarget = a.escStep * 14;
      a.esc += (escTarget - a.esc) * Math.min(1, dt * 13);

      /* mechanical arm eases toward the active discipline */
      a.arm += wrap(activeAngRef.current - a.arm) * Math.min(1, dt * 3.2);

      /* signal propagates inward on selection change */
      if (sel !== e.lastSel) { e.lastSel = sel; e.sig = 0; }
      e.sig = clamp01(e.sig + dt / 1.15);
      const sig = e.sig;

      /* heart pulse + core brightness */
      a.heart += dt;
      const hp = 1 + 0.1 * Math.sin(a.heart * 3) * inten + 0.12 * env;

      /* outward response pulse (closed loop) */
      e.pulse += dt;
      if (e.pulse > 2.6) e.pulse = 0;
      const pp = e.pulse / 2.6;

      /* ---- apply ---- */
      setRot(ringIndexG, a.ringIndex);
      setRot(perimG, a.perim);
      setRot(secTrackG, a.secTrack);
      setLocal(gearLgG, a.gearLg, 230, 224);
      setLocal(gearSm1G, a.gearSm1, 266, 246);
      setLocal(gearSm2G, a.gearSm2, 206, 254);
      setLocal(cGear1G, a.cGear1, 350, 300);
      setLocal(cGear2G, a.cGear2, 275, 343);
      setLocal(cGear3G, a.cGear3, 275, 257);
      setLocal(lowerGearG, a.lowerGear, 300, 398);
      setLocal(escG, a.esc, 230, 188);
      armG.current?.setAttribute("transform", `rotate(${a.arm.toFixed(2)} ${C} ${C})`);
      heartG.current?.setAttribute("transform", `translate(${C} ${C}) scale(${hp.toFixed(3)}) translate(${-C} ${-C})`);
      heartRed.current?.setAttribute("opacity", clamp01(0.45 + 0.55 * inten + 0.35 * env).toFixed(2));
      pulseG.current?.setAttribute("r", (34 + pp * 200).toFixed(1));
      pulseG.current?.setAttribute("opacity", ((1 - pp) * 0.22 * inten).toFixed(2));

      /* signal layer cascade: connector → outer → inner */
      sigConn.current?.setAttribute("opacity", clamp01((sig - 0.08) / 0.25).toFixed(2));
      sigOuter.current?.setAttribute("opacity", clamp01((sig - 0.32) / 0.25).toFixed(2));
      sigInner.current?.setAttribute("opacity", clamp01((sig - 0.58) / 0.25).toFixed(2));

      e.raf = requestAnimationFrame(loop);
    };
    e.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(e.raf);
  }, [reduced, sel]);

  /* ---- red active segment positions ---- */
  const outerSegPos = polar(212, activeAngle);
  const innerSegPos = polar(152, activeAngle);

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="02 — WHAT I DO"
          title="CORE"
          desc="Nine disciplines feed one machine — direction, generation and story transmitted through a single clockwork engine."
          meta="09 MODULES · ONE ENGINE"
        />

        <div className="mt-12 grid lg:grid-cols-[minmax(0,1.22fr)_minmax(0,0.78fr)] gap-12 lg:gap-16 xl:gap-20 items-start">
          {/* ==================== RADIAL ENGINE COMPOSITION ==================== */}
          <Reveal>
            <div className="relative rounded-[14px] overflow-visible mat-texture"
              style={{ background: PAL.bg, border: `1px solid ${PAL.line}`, boxShadow: "0 30px 70px -30px rgba(21,24,28,0.45)" }}>
              {/* faint technical construction field */}
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
                <circle cx={C} cy={C} r={286} fill="none" stroke={PAL.line} strokeWidth={0.6} opacity={0.35} strokeDasharray="2 6" />
                <circle cx={C} cy={C} r={250} fill="none" stroke={PAL.line} strokeWidth={0.5} opacity={0.3} />
                <circle cx={C} cy={C} r={120} fill="none" stroke={PAL.line} strokeWidth={0.5} opacity={0.25} strokeDasharray="1 5" />
                {Array.from({ length: 12 }).map((_, i) => {
                  const [x1, y1] = polar(110, i * 30);
                  const [x2, y2] = polar(288, i * 30);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAL.line} strokeWidth={0.5} opacity={0.18} />;
                })}
                {[30, 75, 120, 165].map((r) => (
                  <circle key={r} cx={C} cy={C} r={r} fill="none" stroke={PAL.line} strokeWidth={0.4} opacity={0.15} />
                ))}
              </svg>

              {/* top technical heading */}
              <div className="relative pt-8 pb-2 text-center px-6">
                <p className="f-mono text-[10px] sm:text-[11px] tracking-[0.32em] font-semibold" style={{ color: PAL.main }}>
                  NINE DISCIPLINES. ONE CLOCKWORK ENGINE.
                </p>
                <p className="mt-1.5 text-[11px] sm:text-[12px] tracking-[0.08em]" style={{ color: PAL.line }}>
                  Direction, generation and story — transmitted through a single core.
                </p>
              </div>

              {/* machine + nodes */}
              <div className="relative mx-auto w-full max-w-[560px] aspect-square select-none px-2">
                <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">
                  {/* ---- 10 · cast shadow ---- */}
                  <ellipse cx={C} cy={C + 246} rx={225} ry={34} fill={PAL.cavity} opacity={0.22} />
                  <ellipse cx={C} cy={C + 240} rx={190} ry={24} fill={PAL.cavity} opacity={0.18} />

                  {/* ---- 11–12 · outer housing + rim ---- */}
                  <circle cx={C} cy={C + 4} r={252} fill={PAL.cavity} opacity={0.5} />
                  <circle cx={C} cy={C} r={252} fill={PAL.main} stroke={PAL.edge} strokeWidth={1.6} />
                  <circle cx={C} cy={C} r={248} fill="none" stroke={PAL.edge} strokeWidth={1.2} opacity={0.6} />
                  {/* rim band (raised metal) */}
                  <circle cx={C} cy={C} r={238} fill="none" stroke={PAL.raised} strokeWidth={18} />
                  <circle cx={C} cy={C} r={246} fill="none" stroke={PAL.edge} strokeWidth={1} opacity={0.7} />
                  <circle cx={C} cy={C} r={229} fill="none" stroke={PAL.cavity} strokeWidth={1.4} opacity={0.8} />
                  {/* recessed screws on rim */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x, y] = polar(238, i * 30 + 15);
                    return <Bolt key={i} x={x} y={y} deg={i * 30} />;
                  })}
                  {/* panel seams + machining marks */}
                  {[45, 135, 225, 315].map((deg) => {
                    const [x1, y1] = polar(229, deg);
                    const [x2, y2] = polar(247, deg);
                    return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAL.cavity} strokeWidth={1.2} opacity={0.6} />;
                  })}

                  {/* ---- 13 · segmented index ring (very slow CW) ---- */}
                  <circle cx={C} cy={C} r={227} fill={PAL.sec} />
                  <g ref={ringIndexG}>
                    {Array.from({ length: 36 }).map((_, k) => {
                      const [x, y] = polar(212, k * 10);
                      const major = k % 3 === 0;
                      return (
                        <g key={k} transform={`translate(${x} ${y}) rotate(${k * 10})`}>
                          <rect x={major ? -9 : -7} y={-13} width={major ? 18 : 14} height={26} rx={2}
                            fill={PAL.cavity} />
                          <rect x={major ? -9 : -7} y={-13} width={major ? 18 : 14} height={major ? 24 : 22} rx={2}
                            fill={major ? PAL.raised : PAL.sec} stroke={PAL.edge} strokeWidth={0.8} />
                          <rect x={major ? -9 : -7} y={-13} width={major ? 18 : 14} height={3} rx={1}
                            fill={PAL.edge} opacity={0.55} />
                        </g>
                      );
                    })}
                  </g>
                  <circle cx={C} cy={C} r={199} fill="none" stroke={PAL.cavity} strokeWidth={1.6} />

                  {/* ---- 14 · inner perimeter track (slow CCW) ---- */}
                  <circle cx={C} cy={C} r={197} fill={PAL.main} />
                  <g ref={perimG}>
                    <circle cx={C} cy={C} r={188} fill="none" stroke={PAL.edge} strokeWidth={1} strokeDasharray="3 5" opacity={0.7} />
                    {Array.from({ length: 48 }).map((_, k) => {
                      const [x, y] = polar(182, k * 7.5);
                      return <circle key={k} cx={x} cy={y} r={k % 4 === 0 ? 1.8 : 1} fill={k % 4 === 0 ? PAL.edge : PAL.line} opacity={0.8} />;
                    })}
                    {Array.from({ length: 12 }).map((_, k) => {
                      const [x1, y1] = polar(194, k * 30);
                      const [x2, y2] = polar(190, k * 30);
                      return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAL.edge} strokeWidth={1.4} />;
                    })}
                  </g>
                  <circle cx={C} cy={C} r={176} fill="none" stroke={PAL.cavity} strokeWidth={2} />

                  {/* ---- 15 · recessed engine chamber ---- */}
                  <circle cx={C} cy={C} r={175} fill={PAL.cavity} />
                  <circle cx={C} cy={C} r={175} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth={7} opacity={0.5} />
                  {Array.from({ length: 8 }).map((_, k) => {
                    const [x1, y1] = polar(172, k * 45 + 22);
                    const [x2, y2] = polar(120, k * 45 + 22);
                    return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAL.main} strokeWidth={2.4} opacity={0.7} strokeLinecap="round" />;
                  })}
                  <circle cx={C} cy={C} r={118} fill="none" stroke={PAL.main} strokeWidth={1} opacity={0.8} />

                  {/* ---- 16 · radial internal structures ---- */}
                  <g>
                    {[18, 92, 158, 236, 306].map((deg, k) => {
                      const [x1, y1] = polar(170, deg);
                      const [x2, y2] = polar(k % 2 === 0 ? 112 : 126, deg);
                      return (
                        <g key={deg}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAL.sec} strokeWidth={k % 2 === 0 ? 10 : 6} strokeLinecap="round" />
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAL.raised} strokeWidth={k % 2 === 0 ? 4 : 2.4} strokeLinecap="round" opacity={0.8} />
                        </g>
                      );
                    })}
                  </g>

                  {/* ---- 17–18 · secondary inner track + red active segments ---- */}
                  <circle cx={C} cy={C} r={166} fill={PAL.sec} />
                  <g ref={secTrackG}>
                    {Array.from({ length: 60 }).map((_, k) => {
                      const [x, y] = polar(152, k * 6);
                      const major = k % 5 === 0;
                      return (
                        <rect key={k} x={major ? -4.5 : -3} y={-10} width={major ? 9 : 6} height={20} rx={1.5}
                          transform={`translate(${x} ${y}) rotate(${k * 6})`}
                          fill={major ? PAL.raised : PAL.main} stroke={PAL.edge} strokeWidth={0.6} />
                      );
                    })}
                  </g>
                  <circle cx={C} cy={C} r={141} fill="none" stroke={PAL.cavity} strokeWidth={2} />
                  <circle cx={C} cy={C} r={163} fill="none" stroke={PAL.cavity} strokeWidth={1.4} />
                  {/* red active segments (static at active angle; fade in with signal) */}
                  <g ref={sigInner} opacity={0}>
                    {[-12, -6, 0, 6].map((off, k) => {
                      const [x, y] = polar(152, activeAngle + off);
                      return (
                        <rect key={k} x={-4} y={-10} width={8} height={20} rx={1.5}
                          transform={`translate(${x} ${y}) rotate(${activeAngle + off})`}
                          fill={k === 2 ? PAL.redBright : PAL.red} opacity={k === 2 ? 1 : 0.75} />
                      );
                    })}
                  </g>
                  <g ref={sigOuter} opacity={0}>
                    {[-5, 0, 5].map((off, k) => {
                      const [x, y] = polar(212, activeAngle + off);
                      return (
                        <rect key={k} x={-7} y={-12} width={14} height={24} rx={2}
                          transform={`translate(${x} ${y}) rotate(${activeAngle + off})`}
                          fill={PAL.red} opacity={k === 1 ? 0.95 : 0.6} />
                      );
                    })}
                  </g>

                  {/* ---- 19 · secondary gear assembly (upper-left) ---- */}
                  <circle cx={230} cy={224} r={40} fill={PAL.main} opacity={0.55} />
                  <g ref={gearLgG}><Gear r={30} teeth={14} fill={PAL.raised} stroke={PAL.edge} spokes={4} /></g>
                  <g ref={gearSm1G}><Gear r={14} teeth={9} fill={PAL.sec} stroke={PAL.edge} /></g>
                  <g ref={gearSm2G}><Gear r={11} teeth={8} fill={PAL.sec} stroke={PAL.edge} /></g>
                  {/* escapement lever above the large gear */}
                  <g ref={escG}>
                    <path d="M-9 6 L0 -4 L9 6 M0 -4 L0 9" fill="none" stroke={PAL.edge} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
                    <circle r={2.4} fill={PAL.raised} stroke={PAL.edge} strokeWidth={1} />
                  </g>

                  {/* ---- 20–21 · central chamber + gear cluster ---- */}
                  <circle cx={C} cy={C + 3} r={104} fill="rgba(0,0,0,0.4)" />
                  <circle cx={C} cy={C} r={104} fill={PAL.main} stroke={PAL.edge} strokeWidth={1.6} />
                  <circle cx={C} cy={C} r={96} fill="none" stroke={PAL.edge} strokeWidth={1} strokeDasharray="5 4" opacity={0.6} />
                  {Array.from({ length: 8 }).map((_, k) => {
                    const [x, y] = polar(86, k * 45 + 22);
                    return <Bolt key={k} x={x} y={y} deg={k * 45} />;
                  })}
                  {/* central cluster gears */}
                  <g ref={cGear1G}><Gear r={13} teeth={9} fill={PAL.raised} stroke={PAL.edge} /></g>
                  <g ref={cGear2G}><Gear r={10} teeth={8} fill={PAL.sec} stroke={PAL.edge} /></g>
                  <g ref={cGear3G}><Gear r={8} teeth={7} fill={PAL.sec} stroke={PAL.edge} /></g>

                  {/* ---- 31 · lower secondary gear + drive shaft linkage ---- */}
                  <line x1={C} y1={C + 30} x2={C} y2={398} stroke={PAL.raised} strokeWidth={7} strokeLinecap="round" />
                  <line x1={C} y1={C + 30} x2={C} y2={398} stroke={PAL.edge} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
                  <g ref={lowerGearG}><Gear r={19} teeth={11} fill={PAL.raised} stroke={PAL.edge} spokes={3} /></g>
                  <circle cx={C} cy={398} r={4} fill={PAL.cavity} stroke={PAL.edge} strokeWidth={1.2} />

                  {/* ---- 22 · central mechanical arm (measurement hand) ---- */}
                  <g ref={armG}>
                    <rect x={-3} y={-166} width={6} height={140} rx={3} fill={PAL.raised} stroke={PAL.edge} strokeWidth={1} />
                    <rect x={-1.2} y={-160} width={2.4} height={126} fill={PAL.edge} opacity={0.5} />
                    <circle cy={-166} r={6} fill={PAL.sec} stroke={PAL.edge} strokeWidth={1.4} />
                    <circle cy={-166} r={2.4} fill={PAL.redBright} />
                  </g>

                  {/* ---- 24 · core heart ---- */}
                  <g ref={heartG}>
                    <circle cx={C} cy={C + 3} r={31} fill="rgba(0,0,0,0.45)" />
                    <circle cx={C} cy={C} r={31} fill={PAL.cavity} stroke={PAL.edge} strokeWidth={1.6} />
                    <circle cx={C} cy={C} r={25} fill="none" stroke={PAL.raised} strokeWidth={4} />
                    <circle cx={C} cy={C} r={17} fill={PAL.sec} stroke={PAL.edge} strokeWidth={1.3} />
                    <circle cx={C} cy={C} r={11} fill={PAL.main} stroke={PAL.edge} strokeWidth={1} />
                    <circle ref={heartRed} cx={C} cy={C} r={6.5} fill={PAL.red} opacity={0.5} />
                    <circle cx={C} cy={C} r={2.2} fill={PAL.redBright} />
                  </g>

                  {/* ---- 26 · outward response pulse ---- */}
                  <circle ref={pulseG} cx={C} cy={C} r={34} fill="none" stroke={PAL.red} strokeWidth={1.6} opacity={0} />
                </svg>

                {/* ---- node mechanical connectors + radial transmission paths ---- */}
                <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full pointer-events-none">
                  {disciplines.map((dis, i) => {
                    const ang = nodeAngle(i, dis.name);
                    const [x1, y1] = polar(262, ang);
                    const [x2, y2] = polar(250, ang);
                    const [jx, jy] = polar(256, ang);
                    const isSel = i === sel;
                    return (
                      <g key={dis.id}>
                        {/* radial transmission path */}
                        <line x1={polar(248, ang)[0]} y1={polar(248, ang)[1]} x2={polar(176, ang)[0]} y2={polar(176, ang)[1]}
                          stroke={PAL.line} strokeWidth={1.4} opacity={0.5} />
                        {/* connector joint + coupling + short shaft */}
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={PAL.raised} strokeWidth={6} strokeLinecap="round" />
                        <circle cx={jx} cy={jy} r={7} fill={PAL.sec} stroke={PAL.edge} strokeWidth={1.4} />
                        <circle cx={jx} cy={jy} r={3} fill={PAL.raised} stroke={PAL.edge} strokeWidth={1} />
                        {isSel && (
                          <g ref={i === sel ? sigConn : undefined} opacity={0}>
                            <line x1={x1} y1={y1} x2={polar(180, ang)[0]} y2={polar(180, ang)[1]}
                              stroke={PAL.red} strokeWidth={2.2} strokeLinecap="round" />
                            <circle cx={jx} cy={jy} r={4.5} fill={PAL.redBright} />
                          </g>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* ---- 05–07 · nine discipline modules + labels ---- */}
                {disciplines.map((dis, i) => {
                  const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                  const isActive = i === sel;
                  const isHover = i === hoverIdx;
                  const { x, y, deg } = nodePos(i, dis.name, 46.5);
                  const ang = nodeAngle(i, dis.name);
                  const lb = LBL[dis.name] ?? { lines: LBL_FALLBACK[i % LBL_FALLBACK.length], side: "above" as const };
                  const labelWrap =
                    lb.side === "above" ? "absolute -top-11 inset-x-0 flex flex-col items-center" :
                    lb.side === "below" ? "absolute -bottom-11 inset-x-0 flex flex-col items-center" :
                    lb.side === "left" ? "absolute right-full top-1/2 -translate-y-1/2 pr-3 flex flex-col items-end" :
                    "absolute left-full top-1/2 -translate-y-1/2 pl-3 flex flex-col items-start";
                  const num = posNum(ang);
                  return (
                    <button key={dis.id}
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                      onClick={() => pick(i)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${x}%`, top: `${y}%` }}
                      aria-label={dis.name}>
                      {/* precision-machined control cartridge */}
                      <span className="relative grid place-items-center transition-all duration-300"
                        style={{
                          width: 74, height: 74,
                          clipPath: "polygon(0 12px, 12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%)",
                          background: PAL.main,
                          boxShadow: `0 6px 16px -6px rgba(21,24,28,0.6), inset 0 1px 0 ${PAL.edge}, inset 0 0 0 1px ${isHover || isActive ? PAL.red : PAL.sec}`,
                          color: PAL.white,
                          transform: isHover && !isActive ? "translateY(-2px)" : "none",
                        }}>
                        {/* recessed icon area */}
                        <span className="grid place-items-center rounded-[6px]"
                          style={{ width: 44, height: 44, background: PAL.cavity, boxShadow: `inset 0 2px 5px rgba(0,0,0,0.7), inset 0 -1px 0 ${PAL.sec}` }}>
                          <Icon size={26} strokeWidth={1.6} />
                        </span>
                        {/* corner screws */}
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: PAL.raised, boxShadow: `inset 0 0 0 0.5px ${PAL.edge}` }} />
                        <span className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full" style={{ background: PAL.raised, boxShadow: `inset 0 0 0 0.5px ${PAL.edge}` }} />
                        {/* number plate */}
                        <span className="absolute top-1 left-1.5 f-mono text-[8px] tracking-widest" style={{ color: isActive || isHover ? PAL.redBright : PAL.line }}>
                          {num}
                        </span>
                        {/* lower indicator */}
                        <span className="absolute bottom-1.5 right-1.5 w-2.5 h-[3px] rounded-sm transition-colors duration-300"
                          style={{ background: isActive ? PAL.red : isHover ? PAL.redBright : PAL.raised }} />
                      </span>
                      <span className={`${labelWrap} pointer-events-none`}>
                        {lb.lines.map((ln) => (
                          <span key={ln}
                            className={`f-tech font-medium text-[11.5px] tracking-[0.14em] leading-[1.35] whitespace-nowrap transition-colors duration-300 ${lb.side === "left" ? "text-right" : "text-left"}`}
                            style={{ color: isActive ? PAL.red : PAL.main }}>
                            {ln}
                          </span>
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* bottom technical identifier */}
              <div className="relative pb-8 pt-3 flex items-center justify-center gap-4 px-6">
                <span className="h-px w-16 sm:w-24" style={{ background: PAL.line, opacity: 0.6 }} />
                <span className="f-mono text-[9px] sm:text-[10px] tracking-[0.34em]" style={{ color: PAL.main }}>
                  RADIAL ENGINE — CORE/{locked ? "LOCK" : hoverIdx !== null ? "ATTN" : "FUSION"}
                </span>
                <span className="h-px w-16 sm:w-24" style={{ background: PAL.line, opacity: 0.6 }} />
              </div>
            </div>
          </Reveal>

          {/* ================= DETAIL CARD (preserved) ================= */}
          <Reveal delay={0.1}>
            <div className="mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 18%, transparent)" }}>
              <span className="absolute top-0 left-0 h-[3px] bg-[var(--crim-panel)] scan-pass" style={{ width: "42%" }} aria-hidden />
              <div key={d.id} className="career-wipe-in">
                <div className="flex items-center justify-between">
                  <span className="f-mono text-[11px] tracking-[0.3em]" style={{ color: "var(--crim-panel)" }}>{d.num} / 09</span>
                  <span className="f-mono text-[9px] tracking-[0.26em] flex items-center gap-2" style={{ color: "var(--m-sub)" }}>
                    <span className="w-1.5 h-1.5 bg-[var(--crim-panel)] live-blink" />
                    {hoverIdx !== null ? "PREVIEW" : locked ? "LOCKED" : "AUTO"}
                  </span>
                </div>
                <h3 className="f-display text-[clamp(1.6rem,2.6vw,2.3rem)] leading-tight mt-3" style={{ color: "var(--outer-ink)" }}>{d.name}</h3>
                <p className="mt-4 text-[13.5px] sm:text-[14px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: 0.92 }}>{d.blurb}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {d.tags.map((t) => (
                    <span key={t} className="inline-block rounded-[6px] px-3 py-1.5 f-tech font-bold text-[10.5px] tracking-[0.14em]"
                      style={{ backgroundColor: "var(--outer-ink)", color: "var(--outer-bg)" }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-6 pt-4 f-mono text-[9px] tracking-[0.24em] flex justify-between"
                  style={{ borderTop: "1px solid var(--m-line)", color: "var(--m-sub)" }}>
                  <span>HOVER — PREVIEW · CLICK — LOCK · AGAIN — RELEASE</span>
                  <span style={{ color: "var(--crim-panel)" }}>CORE/{d.num}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
