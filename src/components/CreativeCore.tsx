import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const C = 300;
const N = 9;
const DEG = Math.PI / 180;

const LBL: { lines: [string, string]; side: "above" | "right" | "left" | "below" }[] = [
  { lines: ["CREATIVE", "DIRECTION"], side: "above" },
  { lines: ["GENERATIVE", "AI"], side: "right" },
  { lines: ["VISUAL", "DEVELOPMENT"], side: "right" },
  { lines: ["CINEMATIC", "STORYTELLING"], side: "right" },
  { lines: ["AI IMAGE +", "VIDEO"], side: "below" },
  { lines: ["CHARACTER", "DEVELOPMENT"], side: "below" },
  { lines: ["ENVIRONMENT", "DESIGN"], side: "left" },
  { lines: ["AI CREATIVE", "WORKFLOWS"], side: "left" },
  { lines: ["PROMPT", "ARCHITECTURE"], side: "left" },
];

function nodePos(i: number, r: number) {
  const deg = i * (360 / N);
  return { x: 50 + r * Math.sin(deg * DEG), y: 50 - r * Math.cos(deg * DEG), deg };
}
const polar = (r: number, deg: number) => [C + r * Math.sin(deg * DEG), C - r * Math.cos(deg * DEG)] as const;

/* ================= physical drawing primitives ================= */

/* machined gear — teeth, face, spokes, hub */
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
      {/* machined edge catch — matte, never glossy */}
      <path d={`M${-r * 0.6} ${-r * 0.42} A${r * 0.74} ${r * 0.74} 0 0 1 ${r * 0.1} ${-r * 0.72}`}
        fill="none" stroke="var(--core-inv)" strokeWidth={1.1} opacity={0.18} strokeLinecap="round" />
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

const Rivet = ({ x, y, r = 3 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
    <circle cx={x - r * 0.25} cy={y - r * 0.25} r={r * 0.32} fill="var(--core-inv)" opacity={0.3} />
  </g>
);

const Bolt = ({ x, y, deg = 0 }: { x: number; y: number; deg?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${deg})`}>
    <circle r={4.4} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
    <rect x={-2.6} y={-0.9} width={5.2} height={1.8} fill="var(--core-deep)" />
  </g>
);

/* cylindrical shaft segment between two points — body, matte highlight, end collars */
function Shaft({ x1, y1, x2, y2, w = 8 }: { x1: number; y1: number; x2: number; y2: number; w?: number }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <g transform={`translate(${x1} ${y1}) rotate(${ang})`}>
      <rect x={0} y={-w / 2} width={len} height={w} rx={w / 2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
      <rect x={4} y={-w / 2 + 1.4} width={len - 8} height={1.6} rx={0.8} fill="var(--core-inv)" opacity={0.25} />
      {/* collars */}
      <rect x={-3} y={-w / 2 - 2} width={7} height={w + 4} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
      <rect x={len - 4} y={-w / 2 - 2} width={7} height={w + 4} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
    </g>
  );
}

const Bearing = ({ x, y, r = 13 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r + 4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
    <circle cx={x} cy={y} r={r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
    <circle cx={x} cy={y} r={r - 3.5} fill="none" stroke="var(--core-line)" strokeWidth={1} strokeDasharray="3 2.4" opacity={0.8} />
    <circle cx={x} cy={y} r={3.2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
  </g>
);

/* ================= fixed mechanical layout =================
   Asymmetric transmission: large drive gear lower-left, transfer +
   precision gears upper area, output stage lower-right, crank + piston
   driven off the drive gear, pressure chamber + valve + gauge beside it. */
const MAIN = { x: 234, y: 336, r: 36 };          // large drive gear
const TRANS = { x: 281, y: 311, r: 22 };         // secondary transfer gear (meshes drive)
const PREC = { x: 305, y: 289, r: 12 };          // small precision gear (meshes transfer)
const OUT = { x: 348, y: 384, r: 26 };           // lower output gear
const OUTW = { x: 372, y: 424, r: 16 };          // output wheel
const CRANK_R = 15;                              // eccentric throw on drive gear
const ROD = 58;                                  // connecting rod length
const PISTON_X = MAIN.x;                         // vertical piston above the drive gear
const CHAMBER = { x: 196, y: 244, w: 40, h: 30 };// pressure chamber
const GAUGE = { x: 172, y: 300 };                // pressure gauge
const HUB_R = 64;                                // central engine housing

export default function CreativeCore() {
  const { data } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();

  /* ---- selection model (card sync only — no pointer in Phase 1) ---- */
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

  /* ---- the engine: every mechanism runs off one integration loop.
        motion chain: surge/pressure → drive gear → transfer → precision →
        central hub → output; drive gear crank → connecting rod → piston. ---- */
  const ring1G = useRef<SVGGElement>(null);   // primary indexing drum (CW, slow)
  const ring2G = useRef<SVGGElement>(null);   // secondary clockwork ring (CCW)
  const mainG = useRef<SVGGElement>(null);    // large drive gear
  const transG = useRef<SVGGElement>(null);   // transfer gear
  const precG = useRef<SVGGElement>(null);    // precision gear
  const hubG = useRef<SVGGElement>(null);     // central drive
  const outG = useRef<SVGGElement>(null);     // output gear
  const outWG = useRef<SVGGElement>(null);    // output wheel
  const crankG = useRef<SVGGElement>(null);   // eccentric crank on drive gear
  const rodL = useRef<SVGLineElement>(null);  // connecting rod
  const rodH = useRef<SVGLineElement>(null);
  const pistonG = useRef<SVGGElement>(null);  // piston body
  const needleG = useRef<SVGGElement>(null);  // gauge needle
  const valveG = useRef<SVGGElement>(null);   // surge valve lift
  const lampRef = useRef<SVGCircleElement>(null);
  const hubPulseG = useRef<SVGGElement>(null);

  const eng = useRef({
    t: 0, last: 0, raf: 0, surgeAt: 6, surge: -1, env: 0, energy: 0,
    a: { ring1: 8, ring2: -14, main: 0, trans: 22, prec: 40, hub: 0, out: -30, wheel: 12 },
  });
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hoverIdx;

  const setRing = (g: React.RefObject<SVGGElement>, a: number) =>
    g.current?.setAttribute("transform", `rotate(${a.toFixed(2)} ${C} ${C})`);
  const setLocal = (g: React.RefObject<SVGGElement>, a: number, cx: number, cy: number) =>
    g.current?.setAttribute("transform", `rotate(${a.toFixed(2)} ${cx} ${cy})`);

  useEffect(() => {
    if (reduced) {
      /* static assembled state */
      setRing(ring1G, 8); setRing(ring2G, -14);
      setLocal(mainG, 0, MAIN.x, MAIN.y); setLocal(transG, 22, TRANS.x, TRANS.y);
      setLocal(precG, 40, PREC.x, PREC.y); setLocal(hubG, 0, C, C);
      setLocal(outG, -30, OUT.x, OUT.y); setLocal(outWG, 12, OUTW.x, OUTW.y);
      setLocal(crankG, 0, MAIN.x, MAIN.y);
      const pinY = MAIN.y - CRANK_R - Math.sqrt(ROD * ROD - 0);
      pistonG.current?.setAttribute("transform", `translate(${PISTON_X} ${pinY})`);
      rodL.current?.setAttribute("x1", String(MAIN.x)); rodL.current?.setAttribute("y1", String(MAIN.y - CRANK_R));
      rodL.current?.setAttribute("x2", String(PISTON_X)); rodL.current?.setAttribute("y2", String(pinY));
      return;
    }
    const loop = (t: number) => {
      const e = eng.current;
      const dt = Math.min(0.05, e.last ? (t - e.last) / 1000 : 0.016);
      e.last = t; e.t += dt;

      /* 10-second mechanical surge — pressure build, ~1s burst, decay */
      if (e.surge < 0 && e.t >= e.surgeAt) e.surge = 0;
      let env = 0;
      if (e.surge >= 0) {
        e.surge += dt;
        env = e.surge < 0.5 ? e.surge / 0.5
          : e.surge < 1.6 ? 1
          : e.surge < 3.2 ? Math.max(0, 1 - (e.surge - 1.6) / 1.6) : 0;
        if (e.surge >= 3.2) { e.surge = -1; e.surgeAt = e.t + 10; }
      }
      e.env = env;
      e.energy += (1 - e.energy) * Math.min(1, dt * 1.1); // spin-up: engage → accelerate → run
      const hover = hoverRef.current !== null ? 1 : 0;
      const mult = e.energy * (1 + 1.6 * env + 0.25 * hover);

      /* independent mechanical speeds (deg/s) — never synchronized */
      const a = e.a;
      a.ring1 += 4 * mult * dt;
      a.ring2 -= 7 * mult * dt;
      a.main += 26 * mult * dt;
      a.trans -= 42 * mult * dt;
      a.prec += 96 * mult * dt;
      a.hub += 12 * mult * dt;
      a.out -= 20 * mult * dt;
      a.wheel += 34 * mult * dt;

      setRing(ring1G, a.ring1);
      setRing(ring2G, a.ring2);
      setLocal(mainG, a.main, MAIN.x, MAIN.y);
      setLocal(transG, a.trans, TRANS.x, TRANS.y);
      setLocal(precG, a.prec, PREC.x, PREC.y);
      setLocal(hubG, a.hub, C, C);
      setLocal(outG, a.out, OUT.x, OUT.y);
      setLocal(outWG, a.wheel, OUTW.x, OUTW.y);
      setLocal(crankG, a.main, MAIN.x, MAIN.y); // crank rides the drive gear

      /* crank → connecting rod → piston (true kinematics) */
      const th = a.main * DEG;
      const pinX = MAIN.x + CRANK_R * Math.sin(th);
      const pinY = MAIN.y - CRANK_R * Math.cos(th);
      const dxp = pinX - PISTON_X;
      const pistonY = pinY - Math.sqrt(Math.max(ROD * ROD - dxp * dxp, 100));
      pistonG.current?.setAttribute("transform", `translate(${PISTON_X} ${pistonY.toFixed(1)})`);
      rodL.current?.setAttribute("x1", pinX.toFixed(1)); rodL.current?.setAttribute("y1", pinY.toFixed(1));
      rodL.current?.setAttribute("x2", String(PISTON_X)); rodL.current?.setAttribute("y2", pistonY.toFixed(1));
      rodH.current?.setAttribute("x1", pinX.toFixed(1)); rodH.current?.setAttribute("y1", pinY.toFixed(1));
      rodH.current?.setAttribute("x2", String(PISTON_X)); rodH.current?.setAttribute("y2", pistonY.toFixed(1));

      /* pressure gauge + surge valve respond to the surge envelope */
      needleG.current?.setAttribute("transform",
        `rotate(${(-46 + env * 92 + Math.sin(e.t * 2.2) * 3).toFixed(1)} ${GAUGE.x} ${GAUGE.y})`);
      valveG.current?.setAttribute("transform", `translate(0 ${(-env * 3.4).toFixed(2)})`);

      lampRef.current?.setAttribute("opacity", (0.14 + env * 0.86).toFixed(2));
      hubPulseG.current?.setAttribute("transform",
        `translate(${C} ${C}) scale(${(1 + 0.05 * env).toFixed(3)}) translate(${-C} ${-C})`);

      e.raf = requestAnimationFrame(loop);
    };
    eng.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(eng.current.raf);
  }, [reduced]);

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="02 — WHAT I DO"
          title="CORE"
          desc="Nine disciplines, one practice — direction, generation and story held together by structured workflows. One machine powers all of them."
          meta="09 MODULES · ONE ENGINE"
        />

        <div className="mt-12 grid lg:grid-cols-[minmax(0,1.14fr)_minmax(0,352px)] gap-12 lg:gap-24 xl:gap-40 items-center">
          {/* ==================== THE STEAMPUNK CLOCKWORK ENGINE ==================== */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">

                {/* ---- LAYER 01 · BACKPLATE — the machine's rear chassis ---- */}
                <g>
                  <circle cx={C} cy={C + 4} r={252} fill="rgba(0,0,0,0.3)" />
                  <circle cx={C} cy={C} r={252} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={2} />
                  {/* machined grooves */}
                  {[244, 236].map((r) => (
                    <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="var(--core-line)" strokeWidth={0.7} opacity={0.4} />
                  ))}
                  {/* riveted perimeter seam */}
                  {Array.from({ length: 16 }).map((_, i) => {
                    const [x, y] = polar(247, i * 22.5);
                    return <Rivet key={i} x={x} y={y} r={2.6} />;
                  })}
                </g>

                {/* ---- LAYER 02 · OUTER HOUSING — heavy machined collar (stationary) ---- */}
                <g>
                  {/* collar body with thickness: back wall, face, bevels */}
                  <circle cx={C} cy={C + 3} r={232} fill="rgba(0,0,0,0.28)" />
                  <path d={`M ${polar(232, 0)[0]} ${polar(232, 0)[1]} A 232 232 0 1 1 ${polar(218, 0)[0]} ${polar(218, 0)[1]} A 218 218 0 1 0 ${polar(232, 0)[0]} ${polar(232, 0)[1]} Z`}
                    fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.5} fillRule="evenodd" />
                  {/* matte bevel catches */}
                  <path d={`M ${polar(230, 200)[0]} ${polar(230, 200)[1]} A 230 230 0 0 1 ${polar(230, 340)[0]} ${polar(230, 340)[1]}`}
                    fill="none" stroke="var(--core-inv)" strokeWidth={1.6} opacity={0.2} strokeLinecap="round" />
                  <path d={`M ${polar(220, 20)[0]} ${polar(220, 20)[1]} A 220 220 0 0 1 ${polar(220, 160)[0]} ${polar(220, 160)[1]}`}
                    fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={1.6} strokeLinecap="round" />
                  {/* housing bolts + inspection plates */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x, y] = polar(225, i * 30 + 15);
                    return <Bolt key={i} x={x} y={y} deg={i * 30} />;
                  })}
                  {[45, 135, 225, 315].map((deg) => {
                    const [x, y] = polar(225, deg);
                    return (
                      <g key={deg} transform={`translate(${x} ${y}) rotate(${deg})`}>
                        <rect x={-11} y={-7} width={22} height={14} rx={2.5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                        <circle cx={-7} r={1.4} fill="var(--core-deep)" /><circle cx={7} r={1.4} fill="var(--core-deep)" />
                        <rect x={-4} y={-2} width={8} height={4} rx={1} fill="var(--core-deep)" opacity={0.7} />
                      </g>
                    );
                  })}
                  {/* bearing housing stubs at cardinal points */}
                  {[0, 90, 180, 270].map((deg) => {
                    const [x, y] = polar(238, deg);
                    return (
                      <g key={deg} transform={`translate(${x} ${y}) rotate(${deg})`}>
                        <rect x={-9} y={-6} width={18} height={12} rx={3} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                        <circle r={3} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                      </g>
                    );
                  })}
                </g>

                {/* ---- LAYER 03 · PRIMARY INDEXING DRUM — rotates clockwise, slow ---- */}
                <g>
                  {/* drum depth: back wall sits below the face */}
                  <circle cx={C} cy={C + 3} r={210} fill="rgba(0,0,0,0.3)" />
                  <g ref={ring1G}>
                    <path d={`M ${polar(210, 0)[0]} ${polar(210, 0)[1]} A 210 210 0 1 1 ${polar(178, 0)[0]} ${polar(178, 0)[1]} A 178 178 0 1 0 ${polar(210, 0)[0]} ${polar(210, 0)[1]} Z`}
                      fill="var(--core-ring)" stroke="var(--core-line)" strokeWidth={1.4} fillRule="evenodd" />
                    {/* machined face lines */}
                    <circle cx={C} cy={C} r={203} fill="none" stroke="var(--core-line)" strokeWidth={0.7} opacity={0.5} />
                    <circle cx={C} cy={C} r={185} fill="none" stroke="var(--core-line)" strokeWidth={0.7} opacity={0.5} />
                    {/* physical indexing plates (timing teeth), not LEDs */}
                    {Array.from({ length: 36 }).map((_, k) => {
                      const [x, y] = polar(194, k * 10);
                      const major = k % 9 === 0;
                      return (
                        <g key={k} transform={`translate(${x} ${y}) rotate(${k * 10})`}>
                          <rect x={major ? -6 : -4} y={-9} width={major ? 12 : 8} height={18} rx={1.5}
                            fill={major ? "var(--core-mid)" : "var(--core-plate)"} stroke="var(--core-line)" strokeWidth={1} />
                          <rect x={major ? -6 : -4} y={-9} width={major ? 12 : 8} height={3} rx={1} fill="var(--core-inv)" opacity={0.18} />
                        </g>
                      );
                    })}
                    {/* the crimson marker plate travels with the drum */}
                    <g transform={`translate(${polar(194, 0)[0]} ${polar(194, 0)[1]})`}>
                      <rect x={-7} y={-11} width={14} height={22} rx={2} fill="var(--core-crimson)" stroke="var(--core-line)" strokeWidth={1.2} />
                      <circle cy={-5} r={2} fill="var(--core-inv)" opacity={0.8} />
                      <rect x={-3.5} y={1} width={7} height={5} rx={1} fill="rgba(0,0,0,0.3)" />
                    </g>
                    {/* drum bolts */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const [x, y] = polar(194, i * 60 + 30);
                      return <Bolt key={i} x={x} y={y} deg={i * 60} />;
                    })}
                  </g>
                </g>

                {/* ---- recessed channel between drums ---- */}
                <circle cx={C} cy={C} r={172} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={7} opacity={0.5} />
                <circle cx={C} cy={C} r={172} fill="none" stroke="var(--core-line)" strokeWidth={1} opacity={0.6} />

                {/* ---- LAYER 04 · SECONDARY CLOCKWORK RING — counter-clockwise ---- */}
                <g>
                  <circle cx={C} cy={C + 2.5} r={166} fill="rgba(0,0,0,0.26)" />
                  <g ref={ring2G}>
                    <path d={`M ${polar(166, 0)[0]} ${polar(166, 0)[1]} A 166 166 0 1 1 ${polar(140, 0)[0]} ${polar(140, 0)[1]} A 140 140 0 1 0 ${polar(166, 0)[0]} ${polar(166, 0)[1]} Z`}
                      fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.4} fillRule="evenodd" />
                    {/* larger external teeth */}
                    {Array.from({ length: 24 }).map((_, k) => {
                      const [x, y] = polar(166, k * 15);
                      return (
                        <rect key={k} x={-5} y={-8} width={10} height={12} rx={1.5}
                          transform={`translate(${x} ${y}) rotate(${k * 15})`}
                          fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
                      );
                    })}
                    {/* timing slots cut into the face */}
                    {Array.from({ length: 8 }).map((_, k) => {
                      const [x, y] = polar(153, k * 45 + 22.5);
                      return (
                        <rect key={k} x={-9} y={-3.5} width={18} height={7} rx={2}
                          transform={`translate(${x} ${y}) rotate(${k * 45 + 22.5})`}
                          fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />
                      );
                    })}
                    {/* small mechanical markers */}
                    {Array.from({ length: 4 }).map((_, k) => {
                      const [x, y] = polar(146, k * 90 + 45);
                      return <circle key={k} cx={x} cy={y} r={2.4} fill="var(--core-crimson)" opacity={0.85} />;
                    })}
                  </g>
                </g>

                {/* ---- LAYER 05 · RECESSED ENGINE CHAMBER ---- */}
                <g>
                  <circle cx={C} cy={C} r={140} fill="var(--core-deep)" />
                  {/* chamber inner shadow — it sits deeper than the rings */}
                  <circle cx={C} cy={C} r={140} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={6} opacity={0.55} />
                  <circle cx={C} cy={C} r={133} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth={3} />
                  {/* machined radial channels */}
                  {[20, 95, 165, 240, 310].map((deg) => {
                    const [x1, y1] = polar(132, deg);
                    const [x2, y2] = polar(74, deg);
                    return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.25)" strokeWidth={5} strokeLinecap="round" />;
                  })}
                  <circle cx={C} cy={C} r={112} fill="none" stroke="var(--core-line)" strokeWidth={0.8} opacity={0.5} />
                </g>

                {/* ---- RADIAL TRANSMISSION ARMS — five different structural members ---- */}
                <g>
                  {/* thick drive arm (lower-left, toward the drive gear) */}
                  <g transform={`rotate(205 ${C} ${C})`}>
                    <rect x={C - 8} y={C - 138} width={16} height={66} rx={3} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.3} />
                    <rect x={C - 8} y={C - 138} width={16} height={5} fill="var(--core-inv)" opacity={0.16} />
                    <Bolt x={C} y={C - 130} /><Bolt x={C} y={C - 80} />
                  </g>
                  {/* recessed rail (right) */}
                  <g transform={`rotate(115 ${C} ${C})`}>
                    <rect x={C - 5} y={C - 136} width={10} height={62} rx={2} fill="rgba(0,0,0,0.3)" />
                    <rect x={C - 3} y={C - 134} width={6} height={58} rx={2} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
                  {/* T-brace (upper-right) */}
                  <g transform={`rotate(65 ${C} ${C})`}>
                    <rect x={C - 6} y={C - 134} width={12} height={58} rx={2.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <rect x={C - 14} y={C - 82} width={28} height={9} rx={2.5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <circle cx={C} cy={C - 77} r={3} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
                  {/* articulated joint arm (upper-left) */}
                  <g transform={`rotate(290 ${C} ${C})`}>
                    <rect x={C - 4.5} y={C - 132} width={9} height={52} rx={2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                    <circle cx={C} cy={C - 80} r={6.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.3} />
                    <circle cx={C} cy={C - 80} r={2.2} fill="var(--core-deep)" />
                  </g>
                  {/* thin timing arm (lower-right) */}
                  <g transform={`rotate(155 ${C} ${C})`}>
                    <rect x={C - 3} y={C - 134} width={6} height={60} rx={2} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1} />
                    <rect x={C - 6} y={C - 100} width={12} height={5} rx={1.5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.9} />
                  </g>
                </g>

                {/* ---- TRANSMISSION SHAFTS (drawn under the gears/housing they pass behind) ---- */}
                <Shaft x1={TRANS.x} y1={TRANS.y} x2={OUT.x} y2={OUT.y} w={7} />
                <Shaft x1={OUT.x} y1={OUT.y} x2={OUTW.x} y2={OUTW.y} w={6} />
                <Bearing x={322} y={352} r={10} />

                {/* ---- LAYER · CENTRAL ENGINE — housing → bearing → drive → shaft → core ---- */}
                <g>
                  <circle cx={C} cy={C + 3} r={HUB_R} fill="rgba(0,0,0,0.3)" />
                  <circle cx={C} cy={C} r={HUB_R} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.8} />
                  <circle cx={C} cy={C} r={HUB_R - 6} fill="none" stroke="var(--core-line)" strokeWidth={1} opacity={0.6} />
                  {Array.from({ length: 6 }).map((_, i) => {
                    const [x, y] = polar(HUB_R - 12, i * 60 + 30);
                    return <Bolt key={i} x={x} y={y} deg={i * 60} />;
                  })}
                  {/* main central drive gear */}
                  <g ref={hubG}>
                    <g transform={`translate(${C} ${C})`}>
                      <Gear r={42} teeth={16} fill="var(--core-gear)" stroke="var(--core-line)" spokes={4} />
                    </g>
                  </g>
                  {/* central shaft + bearing + keyway */}
                  <Bearing x={C} y={C} r={15} />
                  <circle cx={C} cy={C} r={6} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <rect x={C - 1.6} y={C - 8} width={3.2} height={6} fill="var(--core-deep)" />
                  {/* inner core — the tiny crimson indicator (machine activity) */}
                  <g ref={hubPulseG}>
                    <circle cx={C} cy={C} r={11} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <circle ref={lampRef} cx={C} cy={C} r={5} fill="var(--core-crimson)" opacity={0.14} />
                    <circle cx={C} cy={C} r={5} fill="none" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
                </g>

                {/* ---- LARGE DRIVE GEAR + CRANK + PISTON (lower-left) ---- */}
                <g>
                  {/* bearing housing behind the gear */}
                  <circle cx={MAIN.x} cy={MAIN.y + 3} r={MAIN.r + 8} fill="rgba(0,0,0,0.28)" />
                  <circle cx={MAIN.x} cy={MAIN.y} r={MAIN.r + 8} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.3} />
                  <g ref={mainG}>
                    <g transform={`translate(${MAIN.x} ${MAIN.y})`}>
                      <Gear r={MAIN.r} teeth={15} fill="var(--core-gear)" stroke="var(--core-line)" spokes={5} />
                    </g>
                  </g>
                  {/* eccentric crank riding the drive gear */}
                  <g ref={crankG}>
                    <g transform={`translate(${MAIN.x} ${MAIN.y})`}>
                      <rect x={-4} y={-CRANK_R - 6} width={8} height={CRANK_R + 6} rx={3} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                      <circle cy={-CRANK_R} r={5.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.3} />
                      <circle cy={-CRANK_R} r={2} fill="var(--core-deep)" />
                    </g>
                  </g>
                  <Bearing x={MAIN.x} y={MAIN.y} r={11} />

                  {/* connecting rod — genuinely links crank pin to piston pin */}
                  <line ref={rodL} x1={MAIN.x} y1={MAIN.y - CRANK_R} x2={PISTON_X} y2={MAIN.y - CRANK_R - ROD}
                    stroke="var(--core-mid)" strokeWidth={7} strokeLinecap="round" />
                  <line ref={rodH} x1={MAIN.x} y1={MAIN.y - CRANK_R} x2={PISTON_X} y2={MAIN.y - CRANK_R - ROD}
                    stroke="var(--core-inv)" strokeWidth={1.6} strokeLinecap="round" opacity={0.25} />
                  <circle cx={PISTON_X} cy={MAIN.y - CRANK_R - ROD} r={5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />

                  {/* piston cylinder + body */}
                  <g>
                    {/* cylinder contains the full piston stroke (body spans ~252→304) */}
                    <rect x={PISTON_X - 20} y={MAIN.y - CRANK_R - ROD - 17} width={40} height={64} rx={4}
                      fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.4} />
                    <rect x={PISTON_X - 24} y={MAIN.y - CRANK_R - ROD - 21} width={48} height={9} rx={2.5}
                      fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <g ref={pistonG}>
                      <rect x={-16} y={-11} width={32} height={22} rx={3} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.4} />
                      <rect x={-16} y={-5} width={32} height={2.4} fill="var(--core-deep)" opacity={0.7} />
                      <rect x={-16} y={2} width={32} height={2.4} fill="var(--core-deep)" opacity={0.7} />
                      <circle r={4} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                    </g>
                  </g>

                  {/* pressure chamber + pipe + valve + gauge (steam language) */}
                  <g>
                    <rect x={CHAMBER.x} y={CHAMBER.y + 2.5} width={CHAMBER.w} height={CHAMBER.h} rx={5} fill="rgba(0,0,0,0.26)" />
                    <rect x={CHAMBER.x} y={CHAMBER.y} width={CHAMBER.w} height={CHAMBER.h} rx={5}
                      fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.3} />
                    <circle cx={CHAMBER.x + 8} cy={CHAMBER.y + 8} r={1.6} fill="var(--core-deep)" />
                    <circle cx={CHAMBER.x + CHAMBER.w - 8} cy={CHAMBER.y + 8} r={1.6} fill="var(--core-deep)" />
                    <rect x={CHAMBER.x + 12} y={CHAMBER.y + 12} width={16} height={7} rx={2} fill="var(--core-deep)" opacity={0.75} />
                    {/* pressure line to the gauge, with a lift valve */}
                    <line x1={CHAMBER.x} y1={CHAMBER.y + 15} x2={GAUGE.x + 16} y2={GAUGE.y}
                      stroke="var(--core-line)" strokeWidth={3.4} strokeLinecap="round" />
                    <line x1={CHAMBER.x} y1={CHAMBER.y + 15} x2={GAUGE.x + 16} y2={GAUGE.y}
                      stroke="var(--core-mid)" strokeWidth={1.6} strokeLinecap="round" />
                    <g ref={valveG}>
                      <rect x={200} y={262} width={10} height={12} rx={2} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                      <rect x={202.5} y={257} width={5} height={6} rx={1.5} fill="var(--core-crimson)" />
                    </g>
                    {/* gauge */}
                    <circle cx={GAUGE.x} cy={GAUGE.y + 2} r={17} fill="rgba(0,0,0,0.26)" />
                    <circle cx={GAUGE.x} cy={GAUGE.y} r={17} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.5} />
                    <circle cx={GAUGE.x} cy={GAUGE.y} r={13} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                    {[-60, -30, 0, 30, 60].map((a) => (
                      <line key={a} x1={GAUGE.x} y1={GAUGE.y - 10} x2={GAUGE.x} y2={GAUGE.y - 12.5}
                        stroke="var(--core-inv)" strokeWidth={1.1} opacity={0.7} transform={`rotate(${a} ${GAUGE.x} ${GAUGE.y})`} />
                    ))}
                    <g ref={needleG}>
                      <line x1={GAUGE.x} y1={GAUGE.y + 2} x2={GAUGE.x} y2={GAUGE.y - 10.5}
                        stroke="var(--core-crimson)" strokeWidth={1.8} strokeLinecap="round" />
                    </g>
                    <circle cx={GAUGE.x} cy={GAUGE.y} r={2.4} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
                </g>

                {/* ---- TRANSFER + PRECISION GEARS (upper area) ---- */}
                <g>
                  <circle cx={TRANS.x} cy={TRANS.y + 2.5} r={TRANS.r + 5} fill="rgba(0,0,0,0.24)" />
                  <g ref={transG}>
                    <g transform={`translate(${TRANS.x} ${TRANS.y})`}>
                      <Gear r={TRANS.r} teeth={12} fill="var(--core-gear)" stroke="var(--core-line)" spokes={3} />
                    </g>
                  </g>
                  <Bearing x={TRANS.x} y={TRANS.y} r={8} />
                  <g ref={precG}>
                    <g transform={`translate(${PREC.x} ${PREC.y})`}>
                      <Gear r={PREC.r} teeth={9} fill="var(--core-mid)" stroke="var(--core-line)" hub={false} />
                    </g>
                  </g>
                  <circle cx={PREC.x} cy={PREC.y} r={3} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                </g>

                {/* ---- LOWER OUTPUT STAGE (independent rotation) ---- */}
                <g>
                  <circle cx={OUT.x} cy={OUT.y + 2.5} r={OUT.r + 5} fill="rgba(0,0,0,0.24)" />
                  <g ref={outG}>
                    <g transform={`translate(${OUT.x} ${OUT.y})`}>
                      <Gear r={OUT.r} teeth={13} fill="var(--core-gear)" stroke="var(--core-line)" spokes={4} />
                    </g>
                  </g>
                  <Bearing x={OUT.x} y={OUT.y} r={9} />
                  <g ref={outWG}>
                    <g transform={`translate(${OUTW.x} ${OUTW.y})`}>
                      <Gear r={OUTW.r} teeth={10} fill="var(--core-mid)" stroke="var(--core-line)" hub={false} />
                    </g>
                  </g>
                  <circle cx={OUTW.x} cy={OUTW.y} r={3.4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                </g>
              </svg>

              {/* ================= NINE DISCIPLINE NODES + PHYSICAL COUPLINGS ================= */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                const { x, y } = nodePos(i, 44.5);
                const lb = LBL[i % LBL.length];
                const labelWrap =
                  lb.side === "above" ? "absolute -top-11 inset-x-0 flex flex-col items-center" :
                  lb.side === "below" ? "absolute -bottom-11 inset-x-0 flex flex-col items-center" :
                  lb.side === "left" ? "absolute right-full top-1/2 -translate-y-1/2 pr-3 flex flex-col items-end" :
                  "absolute left-full top-1/2 -translate-y-1/2 pl-3 flex flex-col items-start";
                const nodeFill = isActive || isHover ? "#e72241" : "var(--outer-bg)";
                const iconColor = isActive || isHover ? "#ddddd8" : "var(--outer-ink)";
                const nodeBorder = isActive || isHover
                  ? "1.5px solid #e72241"
                  : "1.5px solid color-mix(in srgb, var(--outer-ink) 30%, transparent)";

                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onClick={() => pick(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}>
                    <span className="relative grid place-items-center transition-all duration-300 mat-texture"
                      style={{
                        width: 74, height: 74,
                        clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
                        backgroundColor: nodeFill,
                        color: iconColor,
                        border: nodeBorder,
                        transform: isHover && !isActive ? "translateY(-2px) scale(1.04)" : "none",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${isActive || isHover ? "bg-[#e72241] text-[#ddddd8]" : ""}`}
                        style={isActive || isHover ? undefined : { background: "var(--outer-bg)", color: "var(--outer-ink)" }}>
                        {dis.num}
                      </span>
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors duration-300"
                        style={{ background: isActive || isHover ? "#ddddd8" : "color-mix(in srgb, var(--outer-ink) 40%, transparent)" }} />
                    </span>
                    <span className={`${labelWrap} pointer-events-none`}>
                      {lb.lines.map((ln) => (
                        <span key={ln} className={`f-tech font-bold text-[12px] tracking-[0.12em] leading-[1.3] whitespace-nowrap transition-colors duration-300 ${lb.side === "left" ? "text-right" : "text-left"}`}
                          style={{ color: isActive ? "var(--crimson-rough)" : "var(--ink2)" }}>
                          {ln}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}

              <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-8 h-px bg-[var(--line)]" />
                CLOCKWORK ENGINE — CORE/{d.num}
                <span className="w-8 h-px bg-[var(--line)]" />
              </div>
            </div>
          </Reveal>

          {/* ================= DETAIL CARD ================= */}
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
