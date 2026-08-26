import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { Reveal, SectionHead } from "./ui";

/* the system chain rendered in the right card */
const SYSTEM_CHAIN = ["DIRECT", "GENERATE", "DEVELOP", "BUILD", "DELIVER"];

const C = 300;
const N = 9;
const DEG = Math.PI / 180;

/* Discipline names, split into two clean lines (node shows ONLY the name). */
const SPLIT: [string, string][] = [
  ["CREATIVE", "DIRECTION"],
  ["GENERATIVE", "AI"],
  ["VISUAL", "DEVELOPMENT"],
  ["CINEMATIC", "STORYTELLING"],
  ["AI IMAGE +", "VIDEO"],
  ["CHARACTER", "DEVELOPMENT"],
  ["ENVIRONMENT", "DESIGN"],
  ["AI CREATIVE", "WORKFLOWS"],
  ["PROMPT", "ARCHITECTURE"],
];

const angleOf = (i: number) => i * (360 / N);
const pt = (r: number, deg: number) => [C + r * Math.sin(deg * DEG), C - r * Math.cos(deg * DEG)] as const;
const pct = (i: number, r: number) => ({ x: 50 + r * Math.sin(angleOf(i) * DEG), y: 50 - r * Math.cos(angleOf(i) * DEG) });

const wrap = (d: number) => ((d + 180) % 360 + 360) % 360 - 180;
const ss = (x: number, a: number, b: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/* ============================================================
   STEAM ENGINE LAYOUT — asymmetric industrial composition
   flywheel (upper-left) · cylinder/piston/crank (upper-right)
   transmission gear (centre-left) · output wheel (lower-right)
   central power hub (centre)
   ============================================================ */
const FLY = { x: 216, y: 220, r: 58 };
const CYL = { x: 386, y: 190, w: 34, h: 68 };
const CRK = { x: 372, y: 284, r: 26, pin: 15 };
const TRN = { x: 232, y: 330, r: 28 };
const OUT = { x: 376, y: 388, r: 26 };
const VALVE = { x: 414, y: 214 };
const GAUGE = { x: 414, y: 248, r: 15 };
const ROD_LEN = 56;
const PISTON_X = 386;

/* ---------- physical primitives ---------- */
function Gear({ r, teeth, fill = "var(--core-gear)", stroke = "var(--core-line)", hub = true, spokes = 0 }: {
  r: number; teeth: number; fill?: string; stroke?: string; hub?: boolean; spokes?: number;
}) {
  return (
    <>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * 2 * Math.PI;
        return (
          <rect key={i} x={-r * 0.14} y={-r * 0.22} width={r * 0.28} height={r * 0.44} rx={r * 0.05}
            transform={`translate(${r * Math.cos(a)} ${r * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
            fill={fill} stroke={stroke} strokeWidth={1} />
        );
      })}
      <circle r={r * 0.84} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <path d={`M${-r * 0.6} ${-r * 0.42} A${r * 0.74} ${r * 0.74} 0 0 1 ${r * 0.1} ${-r * 0.72}`}
        fill="none" stroke="var(--core-inv)" strokeWidth={1.1} opacity={0.2} strokeLinecap="round" />
      {spokes > 0 && Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * 2 * Math.PI;
        return <circle key={i} cx={r * 0.5 * Math.cos(a)} cy={r * 0.5 * Math.sin(a)} r={r * 0.16} fill="var(--core-deep)" stroke={stroke} strokeWidth={0.9} />;
      })}
      {hub && (
        <>
          <circle r={r * 0.3} fill="var(--core-deep)" stroke={stroke} strokeWidth={1.2} />
          <circle r={r * 0.1} fill={stroke} />
        </>
      )}
    </>
  );
}

const Bolt = ({ x, y, deg = 0 }: { x: number; y: number; deg?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${deg})`}>
    <circle r={4.2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
    <rect x={-2.5} y={-0.9} width={5} height={1.8} fill="var(--core-deep)" />
  </g>
);

const Bearing = ({ x, y, r = 11 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r + 4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
    <circle cx={x} cy={y} r={r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
    <circle cx={x} cy={y} r={r - 3.5} fill="none" stroke="var(--core-line)" strokeWidth={1} strokeDasharray="3 2.4" opacity={0.8} />
    <circle cx={x} cy={y} r={3} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
  </g>
);

/* cylindrical shaft between two points — body, matte highlight, end collars */
function Shaft({ x1, y1, x2, y2, w = 7 }: { x1: number; y1: number; x2: number; y2: number; w?: number }) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
  return (
    <g transform={`translate(${x1} ${y1}) rotate(${ang})`}>
      <rect x={0} y={-w / 2} width={len} height={w} rx={w / 2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
      <rect x={4} y={-w / 2 + 1.3} width={len - 8} height={1.5} rx={0.75} fill="var(--core-inv)" opacity={0.25} />
      <rect x={-3} y={-w / 2 - 2} width={6.5} height={w + 4} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />
      <rect x={len - 3.5} y={-w / 2 - 2} width={6.5} height={w + 4} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />
    </g>
  );
}

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hoverIdx;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  /* ---------- interactive mechanism refs ---------- */
  const coupRodGs = useRef<(SVGGElement | null)[]>([]);
  const coupGearGs = useRef<(SVGGElement | null)[]>([]);
  const coupDots = useRef<(SVGCircleElement | null)[]>([]);
  const pointerG = useRef<SVGGElement>(null);
  const armFoldG = useRef<SVGGElement>(null);
  const armExtG = useRef<SVGGElement>(null);
  const baseGearG = useRef<SVGGElement>(null);
  const flyG = useRef<SVGGElement>(null);
  const crankG = useRef<SVGGElement>(null);
  const rodL = useRef<SVGLineElement>(null);
  const rodH = useRef<SVGLineElement>(null);
  const pistonG = useRef<SVGGElement>(null);
  const transG = useRef<SVGGElement>(null);
  const outG = useRef<SVGGElement>(null);
  const hubGearG = useRef<SVGGElement>(null);
  const valveStemG = useRef<SVGGElement>(null);
  const needleG = useRef<SVGGElement>(null);
  const heartG = useRef<SVGGElement>(null);
  const mechG = useRef<SVGGElement>(null);

  const eng = useRef({
    t: 0, last: 0, raf: 0,
    ext: Array(N).fill(0), jointRot: Array(N).fill(0),
    pAngle: 0, pAngleV: 0, pExt: 0,
    fly: 0, crank: 0, trans: 0, out: 0, hubR: 0, baseGear: 0,
    surgeAt: 5, surge: -1, env: 0,
    recT: -1, lastTheme: "",
  });

  useEffect(() => {
    const e = eng.current;
    e.lastTheme = themeRef.current;

    if (reduced) {
      /* static assembled machine — pointer parked, everything mid-position */
      return;
    }

    const loop = (t: number) => {
      const dt = Math.min(0.05, e.last ? (t - e.last) / 1000 : 0.016);
      e.last = t; e.t += dt;
      const hov = hoverRef.current;

      /* ---- 10-second steam surge: build → peak → decay ---- */
      if (e.surge < 0 && e.t >= e.surgeAt) e.surge = 0;
      let env = 0;
      if (e.surge >= 0) {
        e.surge += dt;
        env = e.surge < 0.5 ? e.surge / 0.5
          : e.surge < 1.5 ? 1
          : e.surge < 3.1 ? Math.max(0, 1 - (e.surge - 1.5) / 1.6) : 0;
        if (e.surge >= 3.1) { e.surge = -1; e.surgeAt = e.t + 10; }
      }
      e.env = env;

      /* ---- theme recalibration: machine slows, contracts, re-seats ---- */
      if (themeRef.current !== e.lastTheme) { e.lastTheme = themeRef.current; e.recT = 0.0001; }
      let recal = 1;
      if (e.recT > 0) {
        e.recT += dt;
        recal = e.recT < 1.5 ? 1 - 0.8 * Math.sin(Math.PI * Math.min(1, e.recT / 1.5)) : 1;
        if (e.recT >= 1.5) e.recT = -1;
      }
      mechG.current?.setAttribute("transform",
        `translate(${C} ${C}) scale(${(0.985 + 0.015 * recal).toFixed(4)}) translate(${-C} ${-C})`);
      mechG.current?.setAttribute("opacity", (0.4 + 0.6 * recal).toFixed(2));

      const m = (1 + 1.4 * env + (hov !== null ? 0.25 : 0)) * (0.2 + 0.8 * recal);

      /* ---- steam engine: crank → piston, flywheel, transmission, output ---- */
      e.fly += 38 * m * dt;
      e.crank += 84 * m * dt;
      e.trans -= 66 * m * dt;
      e.out += 52 * m * dt;
      e.hubR += 24 * m * dt;
      e.baseGear += (40 + 200 * Math.max(0, e.pExt)) * m * dt;

      flyG.current?.setAttribute("transform", `translate(${FLY.x} ${FLY.y}) rotate(${(e.fly % 360).toFixed(1)})`);
      crankG.current?.setAttribute("transform", `translate(${CRK.x} ${CRK.y}) rotate(${(e.crank % 360).toFixed(1)})`);
      transG.current?.setAttribute("transform", `translate(${TRN.x} ${TRN.y}) rotate(${(e.trans % 360).toFixed(1)})`);
      outG.current?.setAttribute("transform", `translate(${OUT.x} ${OUT.y}) rotate(${(e.out % 360).toFixed(1)})`);
      hubGearG.current?.setAttribute("transform", `rotate(${(e.hubR % 360).toFixed(1)} ${C} ${C})`);

      /* slider-crank: crank pin drives piston crosshead vertically */
      const th = e.crank * DEG;
      const pinX = CRK.x + CRK.pin * Math.sin(th);
      const pinY = CRK.y + CRK.pin * Math.cos(th);
      const dx = PISTON_X - pinX;
      const pistonY = pinY - Math.sqrt(Math.max(ROD_LEN * ROD_LEN - dx * dx, 100));
      pistonG.current?.setAttribute("transform", `translate(${PISTON_X} ${pistonY.toFixed(1)})`);
      rodL.current?.setAttribute("x1", String(PISTON_X)); rodL.current?.setAttribute("y1", pistonY.toFixed(1));
      rodL.current?.setAttribute("x2", pinX.toFixed(1)); rodL.current?.setAttribute("y2", pinY.toFixed(1));
      rodH.current?.setAttribute("x1", String(PISTON_X)); rodH.current?.setAttribute("y1", pistonY.toFixed(1));
      rodH.current?.setAttribute("x2", pinX.toFixed(1)); rodH.current?.setAttribute("y2", pinY.toFixed(1));

      /* pressure valve + gauge respond to the surge envelope */
      valveStemG.current?.setAttribute("transform", `translate(0 ${(-env * 4).toFixed(2)})`);
      needleG.current?.setAttribute("transform",
        `rotate(${(-52 + 104 * (0.25 + 0.75 * env) + Math.sin(e.t * 2.1) * 4).toFixed(1)} ${GAUGE.x} ${GAUGE.y})`);

      /* ---- node couplings: compact engage / disengage ---- */
      for (let i = 0; i < N; i++) {
        const target = hov === i ? 1 : 0;
        e.ext[i] += (target - e.ext[i]) * Math.min(1, dt * (target ? 8 : 6));
        const ex = e.ext[i];
        coupRodGs.current[i]?.setAttribute("transform", `translate(0 ${(-6 * (1 - ex)).toFixed(1)})`);
        e.jointRot[i] += ex * (hov === i ? 260 : 70) * m * dt;
        coupGearGs.current[i]?.setAttribute("transform", `rotate(${(e.jointRot[i] % 360).toFixed(1)})`);
        coupDots.current[i]?.setAttribute("opacity", ss(ex, 0.5, 0.95).toFixed(2));
      }

      /* ---- articulated pointer: folds into hub when idle, extends to the coupling ---- */
      const hasTarget = hov !== null;
      if (hasTarget) {
        const dA = wrap(angleOf(hov as number) - e.pAngle);
        e.pAngleV += (dA * 30 - e.pAngleV * 8) * dt;
        e.pAngle += e.pAngleV * dt;
      } else {
        e.pAngleV *= Math.max(0, 1 - dt * 6);
        e.pAngle += e.pAngleV * dt;
      }
      e.pExt += ((hasTarget ? 1 : 0) - e.pExt) * Math.min(1, dt * 5.5);
      const k = 0.16 + 0.84 * e.pExt;
      const fold = 148 * (1 - ss(e.pExt, 0.15, 0.85));
      pointerG.current?.setAttribute("transform", `rotate(${e.pAngle.toFixed(1)} ${C} ${C})`);
      armExtG.current?.setAttribute("transform", `translate(${C} ${C}) scale(${k.toFixed(3)}) translate(${-C} ${-C})`);
      armFoldG.current?.setAttribute("transform", `rotate(${fold.toFixed(1)} ${C} ${C - 66})`);
      baseGearG.current?.setAttribute("transform", `rotate(${(e.baseGear % 360).toFixed(1)} ${C} ${C})`);

      /* core heart — the tiny crimson power indicator */
      const s = 1 + 0.06 * Math.sin(e.t * 2.3) + 0.05 * env;
      heartG.current?.setAttribute("transform", `translate(${C} ${C}) scale(${s.toFixed(3)}) translate(${-C} ${-C})`);

      e.raf = requestAnimationFrame(loop);
    };
    eng.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(eng.current.raf);
  }, [reduced]);

  const active = hoverIdx;

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="02 — WHAT I DO"
          title="WHAT I DO"
          desc="Nine disciplines feed one machine — direction, generation and story transmitted through a single steam-driven engine."
          meta="09 MODULES · ONE ENGINE"
        />

        <div className="mt-12 grid lg:grid-cols-[1.22fr_0.78fr] gap-12 lg:gap-14 xl:gap-16 items-center">
          <Reveal>
            <div className="relative mx-auto w-full max-w-[620px] aspect-square select-none">
              {/* ================= THE STEAM ENGINE CORE ================= */}
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">
                <defs>
                  <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="13" />
                  </filter>
                </defs>

                {/* cast shadow — machine sits heavy on the surface */}
                <ellipse cx={C} cy={C + 24} rx={190} ry={180} fill="#000" opacity={0.24} filter="url(#softBlur)" />

                <g ref={mechG}>
                  {/* ---- OUTER INDUSTRIAL HOUSING (heavy riveted casing) ---- */}
                  <g>
                    <circle cx={C} cy={C} r={198} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={2} />
                    <circle cx={C} cy={C} r={198} fill="none" stroke="var(--core-inv)" strokeWidth={1} opacity={0.16} />
                    <circle cx={C} cy={C} r={193} fill="none" stroke="var(--core-deep)" strokeWidth={3.5} opacity={0.8} />
                    {/* machined groove */}
                    <circle cx={C} cy={C} r={187} fill="none" stroke="var(--core-line)" strokeWidth={0.8} opacity={0.5} />
                    {/* reinforced bracket plates — six bolted segments */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const a0 = (i * 60 + 12) * DEG, a1 = ((i + 1) * 60 - 12) * DEG;
                      const p0 = pt(197, i * 60 + 12), p1 = pt(197, (i + 1) * 60 - 12);
                      const q0 = pt(178, (i + 1) * 60 - 12), q1 = pt(178, i * 60 + 12);
                      void a0; void a1;
                      return (
                        <g key={i}>
                          <path d={`M${p0[0]} ${p0[1]} A197 197 0 0 1 ${p1[0]} ${p1[1]} L${q0[0]} ${q0[1]} A178 178 0 0 0 ${q1[0]} ${q1[1]} Z`}
                            fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
                          <Bolt x={pt(187.5, i * 60 + 22)[0]} y={pt(187.5, i * 60 + 22)[1]} deg={i * 60} />
                          <Bolt x={pt(187.5, (i + 1) * 60 - 22)[0]} y={pt(187.5, (i + 1) * 60 - 22)[1]} deg={(i + 1) * 60} />
                        </g>
                      );
                    })}
                    {/* rim rivets */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const [x, y] = pt(193, i * 30 + 15);
                      return <circle key={i} cx={x} cy={y} r={2.2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.7} />;
                    })}
                    {/* mechanical seams between brackets */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const [x1, y1] = pt(176, i * 60);
                      const [x2, y2] = pt(198, i * 60);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth={1.2} opacity={0.7} />;
                    })}
                    {/* recessed engine chamber */}
                    <circle cx={C} cy={C} r={176} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.4} />
                    <circle cx={C} cy={C} r={176} fill="none" stroke="rgba(0,0,0,0.42)" strokeWidth={6} opacity={0.5} />
                    <circle cx={C} cy={C} r={168} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth={2.5} />
                    <circle cx={C} cy={C} r={170} fill="var(--core-plate)" opacity={0.35} />
                  </g>

                  {/* ---- DRIVE SHAFTS (mid-back, run beneath the wheels) ---- */}
                  <g>
                    <Shaft x1={C} y1={C} x2={FLY.x} y2={FLY.y} w={8} />
                    <Shaft x1={CRK.x} y1={CRK.y} x2={C} y2={C} w={7} />
                    <Shaft x1={C} y1={C} x2={TRN.x} y2={TRN.y} w={6} />
                    <Shaft x1={C} y1={C} x2={OUT.x} y2={OUT.y} w={6} />
                  </g>

                  {/* ---- LARGE INDUSTRIAL FLYWHEEL (upper-left, dominant) ---- */}
                  <g>
                    <circle cx={FLY.x} cy={FLY.y + 3.5} r={FLY.r + 4} fill="rgba(0,0,0,0.26)" />
                    <g ref={flyG}>
                      {/* heavy outer rim */}
                      <circle r={FLY.r} fill="var(--core-ring)" stroke="var(--core-line)" strokeWidth={2.2} />
                      <circle r={FLY.r - 7} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.3} />
                      <circle r={FLY.r} fill="none" stroke="var(--core-inv)" strokeWidth={1} opacity={0.18} />
                      {/* counterweight thickening on the rim */}
                      <path d={`M${-FLY.r + 2} 0 A${FLY.r - 2} ${FLY.r - 2} 0 0 1 ${-(FLY.r - 2) * 0.5} ${-(FLY.r - 2) * 0.866}`}
                        fill="none" stroke="var(--core-mid)" strokeWidth={6} opacity={0.85} strokeLinecap="round" />
                      {/* heavy spokes */}
                      {Array.from({ length: 5 }).map((_, i) => {
                        const a = (i / 5) * 2 * Math.PI;
                        return (
                          <g key={i} transform={`rotate(${(a * 180) / Math.PI})`}>
                            <rect x={-5} y={-FLY.r + 9} width={10} height={FLY.r - 22} rx={3}
                              fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                            <rect x={-5} y={-FLY.r + 9} width={10} height={4} fill="var(--core-inv)" opacity={0.14} />
                          </g>
                        );
                      })}
                      {/* central axle + bearing */}
                      <circle r={13} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.4} />
                      <circle r={5} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.1} />
                      <rect x={-1.4} y={-5} width={2.8} height={10} fill="var(--core-mid)" />
                    </g>
                    {/* flywheel bearing housing (fixed, front) */}
                    <Bearing x={FLY.x} y={FLY.y} r={9} />
                  </g>

                  {/* ---- PRESSURE CYLINDER + PISTON + CRANK (upper-right cluster) ---- */}
                  <g>
                    {/* cylinder body */}
                    <rect x={CYL.x + 2.5} y={CYL.y - CYL.h / 2 + 2.5} width={CYL.w} height={CYL.h} rx={6} fill="rgba(0,0,0,0.26)" />
                    <rect x={CYL.x - CYL.w / 2} y={CYL.y - CYL.h / 2} width={CYL.w} height={CYL.h} rx={6}
                      fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.4} />
                    <rect x={CYL.x - CYL.w / 2 + 3} y={CYL.y - CYL.h / 2 + 3} width={CYL.w - 6} height={CYL.h - 6} rx={4}
                      fill="var(--core-ring)" stroke="var(--core-line)" strokeWidth={0.9} />
                    {/* clamp bands */}
                    {[-1, 1].map((s) => (
                      <rect key={s} x={CYL.x - CYL.w / 2 - 2} y={CYL.y + s * 16 - 3} width={CYL.w + 4} height={6} rx={2}
                        fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1} />
                    ))}
                    {/* top cap + bottom gland */}
                    <rect x={CYL.x - CYL.w / 2 - 3} y={CYL.y - CYL.h / 2 - 6} width={CYL.w + 6} height={9} rx={3}
                      fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <rect x={CYL.x - 8} y={CYL.y + CYL.h / 2 - 2} width={16} height={8} rx={2.5}
                      fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.1} />

                    {/* piston crosshead + connecting rod (driven by the crank) */}
                    <line ref={rodL} x1={PISTON_X} y1={238} x2={CRK.x} y2={CRK.y} stroke="var(--core-mid)" strokeWidth={6} strokeLinecap="round" />
                    <line ref={rodH} x1={PISTON_X} y1={238} x2={CRK.x} y2={CRK.y} stroke="var(--core-inv)" strokeWidth={1.4} strokeLinecap="round" opacity={0.22} />
                    <g ref={pistonG}>
                      <rect x={-11} y={-9} width={22} height={15} rx={3} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.3} />
                      <rect x={-11} y={-3} width={22} height={2.4} fill="var(--core-deep)" opacity={0.7} />
                      <circle r={3.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                    </g>

                    {/* crank wheel — converts piston stroke to rotation */}
                    <circle cx={CRK.x} cy={CRK.y + 3} r={CRK.r + 3} fill="rgba(0,0,0,0.24)" />
                    <g ref={crankG}>
                      <Gear r={CRK.r} teeth={11} fill="var(--core-gear)" stroke="var(--core-line)" spokes={0} hub={false} />
                      <circle r={8} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                      {/* crank arm + pin */}
                      <rect x={-3.5} y={-CRK.pin - 4} width={7} height={CRK.pin + 6} rx={3} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                      <circle cy={-CRK.pin} r={4.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                      <circle cy={-CRK.pin} r={1.6} fill="var(--core-deep)" />
                    </g>
                    <Bearing x={CRK.x} y={CRK.y} r={6} />

                    {/* pressure pipe → valve → gauge (compact, connected) */}
                    <path d={`M${CYL.x + CYL.w / 2} ${CYL.y - 8} L${VALVE.x} ${CYL.y - 8} L${VALVE.x} ${VALVE.y - 9}`}
                      fill="none" stroke="var(--core-line)" strokeWidth={5} strokeLinecap="round" />
                    <path d={`M${CYL.x + CYL.w / 2} ${CYL.y - 8} L${VALVE.x} ${CYL.y - 8} L${VALVE.x} ${VALVE.y - 9}`}
                      fill="none" stroke="var(--core-mid)" strokeWidth={2.2} strokeLinecap="round" />
                    {/* valve body + lifting stem */}
                    <rect x={VALVE.x - 7} y={VALVE.y - 9} width={14} height={16} rx={2.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <g ref={valveStemG}>
                      <rect x={VALVE.x - 2} y={VALVE.y - 15} width={4} height={8} rx={1.2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.9} />
                      <circle cx={VALVE.x} cy={VALVE.y - 15} r={2.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />
                    </g>
                    {/* compact gauge */}
                    <circle cx={GAUGE.x} cy={GAUGE.y + 2} r={GAUGE.r} fill="rgba(0,0,0,0.24)" />
                    <circle cx={GAUGE.x} cy={GAUGE.y} r={GAUGE.r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.3} />
                    <circle cx={GAUGE.x} cy={GAUGE.y} r={GAUGE.r - 4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.8} />
                    {[-60, -30, 0, 30, 60].map((a) => (
                      <line key={a} x1={GAUGE.x} y1={GAUGE.y - GAUGE.r + 5.5} x2={GAUGE.x} y2={GAUGE.y - GAUGE.r + 8}
                        stroke="var(--core-inv)" strokeWidth={0.9} opacity={0.65} transform={`rotate(${a} ${GAUGE.x} ${GAUGE.y})`} />
                    ))}
                    <g ref={needleG}>
                      <line x1={GAUGE.x} y1={GAUGE.y + 2} x2={GAUGE.x} y2={GAUGE.y - GAUGE.r + 5} stroke="var(--core-crimson)" strokeWidth={1.6} strokeLinecap="round" />
                    </g>
                    <circle cx={GAUGE.x} cy={GAUGE.y} r={2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.8} />
                  </g>

                  {/* ---- TRANSMISSION GEAR (centre-left) ---- */}
                  <g>
                    <circle cx={TRN.x} cy={TRN.y + 3} r={TRN.r + 4} fill="rgba(0,0,0,0.24)" />
                    <g ref={transG}>
                      <Gear r={TRN.r} teeth={12} fill="var(--core-gear)" stroke="var(--core-line)" spokes={4} />
                    </g>
                    <Bearing x={TRN.x} y={TRN.y} r={7} />
                  </g>

                  {/* ---- POWER OUTPUT WHEEL (lower-right) ---- */}
                  <g>
                    <circle cx={OUT.x} cy={OUT.y + 3} r={OUT.r + 3} fill="rgba(0,0,0,0.24)" />
                    <g ref={outG}>
                      <Gear r={OUT.r} teeth={11} fill="var(--core-gear)" stroke="var(--core-line)" spokes={3} />
                      {/* output coupling collar */}
                      <circle r={OUT.r + 7} fill="none" stroke="var(--core-mid)" strokeWidth={2.6} strokeDasharray="7 6" opacity={0.7} />
                    </g>
                    <Bearing x={OUT.x} y={OUT.y} r={6} />
                  </g>

                  {/* ---- CENTRAL POWER HUB (where power is distributed) ---- */}
                  <g>
                    <circle cx={C} cy={C + 3.5} r={44} fill="rgba(0,0,0,0.3)" />
                    {/* layered metal plates */}
                    <circle cx={C} cy={C} r={44} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.8} />
                    <circle cx={C} cy={C} r={38} fill="var(--core-ring)" stroke="var(--core-line)" strokeWidth={1.2} />
                    {/* gear coupling (rotates) */}
                    <g ref={hubGearG}>
                      <Gear r={30} teeth={14} fill="var(--core-gear)" stroke="var(--core-line)" spokes={4} />
                    </g>
                    {/* bearing housing + collar */}
                    <circle cx={C} cy={C} r={16} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.4} />
                    <circle cx={C} cy={C} r={16} fill="none" stroke="var(--core-line)" strokeWidth={0.9} strokeDasharray="2.6 2" opacity={0.8} />
                    {/* hub bolts */}
                    {[0, 1, 2, 3].map((i) => {
                      const a = (i / 4) * 2 * Math.PI + 0.78;
                      return <Bolt key={i} x={C + 36 * Math.cos(a)} y={C + 36 * Math.sin(a)} deg={(a * 180) / Math.PI} />;
                    })}
                  </g>

                  {/* ---- ARTICULATED POINTER (one connected piece, folds into the hub) ---- */}
                  <g ref={pointerG}>
                    <g ref={armExtG}>
                      {/* inner arm: hub → joint */}
                      <polygon points={`${C - 4},${C - 14} ${C + 4},${C - 14} ${C + 2.6},${C - 66} ${C - 2.6},${C - 66}`}
                        fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                      <line x1={C - 1.3} y1={C - 18} x2={C - 0.7} y2={C - 62} stroke="var(--core-inv)" strokeWidth={0.8} opacity={0.25} />
                      {/* folding outer section */}
                      <g ref={armFoldG}>
                        <polygon points={`${C - 3.4},${C - 62} ${C + 3.4},${C - 62} ${C + 2},${C - 176} ${C - 2},${C - 176}`}
                          fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                        <line x1={C - 1} y1={C - 66} x2={C - 0.5} y2={C - 172} stroke="var(--core-inv)" strokeWidth={0.7} opacity={0.22} />
                        {/* pointer tip — stops at the node coupling */}
                        <polygon points={`${C},${C - 186} ${C + 4.6},${C - 175} ${C - 4.6},${C - 175}`} fill="var(--core-crimson)" />
                        <rect x={C - 4.6} y={C - 176} width={9.2} height={2.2} fill="var(--core-inv)" opacity={0.55} />
                      </g>
                      {/* joint gear */}
                      <circle cx={C} cy={C - 66} r={7} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                      <circle cx={C} cy={C - 66} r={2.2} fill="var(--core-deep)" />
                    </g>
                  </g>

                  {/* base drive gear + tiny crimson heart (front, always over the hub) */}
                  <g ref={baseGearG}><Gear r={12} teeth={9} hub={false} fill="var(--core-mid)" stroke="var(--core-line)" /></g>
                  <g ref={heartG}>
                    <circle cx={C} cy={C} r={4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                    <circle cx={C} cy={C} r={2.4} fill="var(--core-crimson)" />
                  </g>
                </g>

                {/* ---- NINE COMPACT COUPLINGS (node → short shaft → housing) ---- */}
                <g>
                  {Array.from({ length: N }).map((_, i) => (
                    <g key={i} transform={`rotate(${angleOf(i)} ${C} ${C})`}>
                      {/* mounting pad on the housing rim */}
                      <rect x={C - 7} y={C - 200} width={14} height={9} rx={2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
                      {/* short telescoping shaft + coupling collar */}
                      <g ref={(el) => { coupRodGs.current[i] = el; }}>
                        <rect x={C - 2.6} y={C - 213} width={5.2} height={16} rx={2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.9} />
                        <rect x={C - 4.5} y={C - 206} width={9} height={5} rx={1.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1} />
                      </g>
                      {/* small joint gear — spins on engagement */}
                      <g transform={`translate(${C} ${C - 216})`}>
                        <g ref={(el) => { coupGearGs.current[i] = el; }}>
                          <Gear r={6.5} teeth={7} hub={false} fill="var(--core-plate)" stroke="var(--core-line)" />
                        </g>
                        <circle r={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.8} />
                      </g>
                      {/* crimson contact indicator */}
                      <circle ref={(el) => { coupDots.current[i] = el; }} cx={C} cy={C - 216} r={1.6} fill="var(--core-crimson)" opacity={0} />
                    </g>
                  ))}
                </g>
              </svg>

              {/* ================= NINE DISCIPLINE NODES (clearly separated) ================= */}
              {disciplines.map((dis, i) => {
                const { x, y } = pct(i, 41);
                const on = hoverIdx === i;
                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onFocus={() => setHoverIdx(i)}
                    onBlur={() => setHoverIdx(null)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group outline-none"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}>
                    <span
                      className="relative flex flex-col items-center justify-center gap-0.5 transition-all duration-300 mat-texture"
                      style={{
                        width: 96, height: 56,
                        clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                        backgroundColor: on ? "var(--core-deep)" : "var(--core-plate)",
                        boxShadow: on
                          ? "inset 0 0 0 1.5px var(--core-crimson), 0 12px 26px -10px rgba(0,0,0,0.5)"
                          : "inset 0 0 0 1.5px color-mix(in srgb, var(--core-line) 70%, transparent), 0 6px 16px -8px rgba(0,0,0,0.35)",
                        transform: on ? "translateY(-3px) scale(1.05)" : "none",
                      }}>
                      <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--core-mid)" }} />
                      <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--core-mid)" }} />
                      <span className="f-tech font-medium text-[11px] leading-[1.25] tracking-[0.08em] text-center transition-colors duration-300"
                        style={{ color: on ? "var(--core-inv)" : "var(--core-mid)" }}>
                        {SPLIT[i][0]}
                        <br />
                        {SPLIT[i][1]}
                      </span>
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-sm transition-colors duration-300"
                        style={{ background: on ? "var(--core-crimson)" : "color-mix(in srgb, var(--core-mid) 40%, transparent)" }} />
                    </span>
                  </button>
                );
              })}

              {/* bottom technical identifier */}
              <div className="absolute -bottom-9 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-9 h-px bg-[var(--line)]" />
                STEAM ENGINE — CORE/09
                <span className="w-9 h-px bg-[var(--line)]" />
              </div>
            </div>
          </Reveal>

          {/* ================= RIGHT — INFORMATION PANEL ================= */}
          <Reveal delay={0.12}>
            <div className="mat-outer mat-texture relative overflow-hidden"
              style={{
                clipPath: "polygon(22px 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%, 0 22px)",
                boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 20%, transparent)",
              }}>
              <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crim-panel)" }} aria-hidden />
              <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crim-panel)" }} aria-hidden />

              <div className="p-6 sm:p-8">
                {/* selection-driven output — never shows stale node data */}
                <div key={active !== null ? disciplines[active].id : "standby"} className="career-wipe-in">
                  <div className="flex items-center justify-between">
                    <span className="f-mono text-[10px] tracking-[0.3em]" style={{ color: "var(--m-sub)" }}>
                      {active !== null ? `MODULE ${disciplines[active].num}` : "OUTPUT"}
                    </span>
                    <span className="f-mono text-[9px] tracking-[0.22em] flex items-center gap-2" style={{ color: active !== null ? "var(--crim-panel)" : "var(--m-sub)" }}>
                      <span className="w-1.5 h-1.5 rounded-full live-blink" style={{ background: active !== null ? "var(--crim-panel)" : "var(--m-sub)" }} />
                      {active !== null ? "ENGAGED" : "STANDBY"}
                    </span>
                  </div>

                  {active !== null ? (
                    <>
                      <h3 className="f-display leading-[1.02] mt-3 text-[clamp(1.6rem,2.4vw,2.2rem)]" style={{ color: "var(--outer-ink)" }}>
                        {disciplines[active].name}
                      </h3>
                      <p className="mt-3 text-[13px] sm:text-[13.5px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: 0.88 }}>
                        {disciplines[active].blurb}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {disciplines[active].tags.map((t) => (
                          <span key={t} className="f-tech font-bold text-[9.5px] tracking-[0.14em] px-2.5 py-1"
                            style={{ background: "color-mix(in srgb, var(--outer-ink) 12%, transparent)", border: "1px solid var(--m-line)", color: "var(--outer-ink)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="f-display leading-[1.05] mt-3 text-[clamp(1.6rem,2.4vw,2.2rem)]" style={{ color: "var(--outer-ink)" }}>
                        On Stand by
                      </h3>
                      <p className="mt-3 text-[13px] sm:text-[13.5px]" style={{ color: "var(--m-sub)" }}>
                        Pick a node to discover.
                      </p>
                    </>
                  )}
                </div>

                {/* disciplines — synced to the machine */}
                <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--m-line)" }}>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="f-mono text-[9px] tracking-[0.3em]" style={{ color: "var(--m-sub)" }}>DISCIPLINES</span>
                    <span className="f-mono text-[9px] tracking-[0.22em]" style={{ color: active !== null ? "var(--crim-panel)" : "var(--m-sub)" }}>
                      {active !== null ? `0${active + 1} / 09` : "09 / 09"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-x-4 gap-y-1">
                    {disciplines.map((dis, i) => {
                      const on = hoverIdx === i;
                      return (
                        <div key={dis.id}
                          onMouseEnter={() => setHoverIdx(i)}
                          onMouseLeave={() => setHoverIdx(null)}
                          className="group flex items-center gap-2.5 py-1.5 cursor-default transition-all duration-300"
                          style={{ transform: on ? "translateX(3px)" : "none" }}>
                          <span className="f-mono text-[8.5px] tracking-[0.14em] w-6 shrink-0 transition-colors duration-300"
                            style={{ color: on ? "var(--crim-panel)" : "var(--m-sub)" }}>{dis.num}</span>
                          <span className="h-px shrink-0 transition-all duration-300"
                            style={{ background: on ? "var(--crim-panel)" : "color-mix(in srgb, var(--m-sub) 40%, transparent)", width: on ? 16 : 10 }} />
                          <span className="f-tech font-bold text-[10.5px] sm:text-[11px] tracking-[0.13em] leading-snug transition-colors duration-300"
                            style={{ color: on ? "var(--outer-ink)" : "color-mix(in srgb, var(--outer-ink) 62%, transparent)" }}>
                            {dis.name}
                          </span>
                          <span className="ml-auto w-1.5 h-1.5 rotate-45 shrink-0 transition-all duration-300"
                            style={{ background: on ? "var(--crim-panel)" : "color-mix(in srgb, var(--m-sub) 35%, transparent)", transform: on ? "rotate(225deg) scale(1.25)" : "rotate(45deg)" }} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* system chain */}
                <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--m-line)" }}>
                  <span className="f-mono text-[9px] tracking-[0.3em] block mb-4" style={{ color: "var(--m-sub)" }}>SYSTEM</span>
                  <div className="flex flex-wrap items-center gap-y-3">
                    {SYSTEM_CHAIN.map((step, i) => (
                      <React.Fragment key={step}>
                        <span className="flex items-center gap-2.5">
                          <span className="f-mono text-[8.5px] tracking-[0.12em] w-5 h-5 grid place-items-center shrink-0"
                            style={{ background: "color-mix(in srgb, var(--outer-ink) 12%, transparent)", color: "var(--m-sub)", border: "1px solid var(--m-line)" }}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span className="f-tech font-bold text-[11.5px] tracking-[0.18em]" style={{ color: "var(--outer-ink)" }}>{step}</span>
                        </span>
                        {i < SYSTEM_CHAIN.length - 1 && (
                          <svg width="18" height="10" viewBox="0 0 18 10" className="mx-2 shrink-0" style={{ color: "var(--crim-panel)" }} aria-hidden>
                            <path d="M0 5h13M10 1.5 14.5 5 10 8.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                          </svg>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 f-mono text-[8.5px] tracking-[0.26em] flex items-center justify-between"
                  style={{ borderTop: "1px solid var(--m-line)", color: "var(--m-sub)" }}>
                  <span>HOVER A NODE — THE ENGINE RESPONDS</span>
                  <span style={{ color: "var(--crim-panel)" }}>SYS/09</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
