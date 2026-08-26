import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

/* ============================================================
   PHASE 1 — RADIAL STEAMPUNK CLOCKWORK TRANSMISSION ENGINE
   A physically layered machine, driven by an inertial rAF engine:
   every ring/gear has its own speed + direction, spins up with
   mechanical weight, and briefly accelerates on a 10s power surge.
   NO POINTER in this phase — the central hub is built ready for it.
   Layers are wrapped in rb-* groups so a later phase can run the
   dismantle → reassemble theme choreography on them independently.
   ============================================================ */

const C = 300;
const N = 9;
const polar = (r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)] as const;
};

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
  const rad = (deg * Math.PI) / 180;
  return { x: 50 + r * Math.sin(rad), y: 50 - r * Math.cos(rad), deg };
}

/* machined gear drawn at the origin — caller positions it */
function Gear({ r, teeth, fill = "var(--core-plate)", stroke = "var(--core-line)", spokes = 0, hub = true }: {
  r: number; teeth: number; fill?: string; stroke?: string; spokes?: number; hub?: boolean;
}) {
  return (
    <>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        return (
          <rect key={i} x={-r * 0.15} y={-r * 0.21} width={r * 0.3} height={r * 0.42} rx={r * 0.05}
            transform={`translate(${r * Math.cos(a)} ${r * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
            fill={fill} stroke={stroke} strokeWidth={1} />
        );
      })}
      <circle r={r * 0.84} fill={fill} stroke={stroke} strokeWidth={1.5} />
      <path d={`M${-r * 0.6} ${-r * 0.42} A${r * 0.74} ${r * 0.74} 0 0 1 ${r * 0.1} ${-r * 0.72}`}
        fill="none" stroke="var(--core-inv)" strokeWidth={1.1} opacity={0.16} strokeLinecap="round" />
      {spokes > 0 && Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return <circle key={i} cx={r * 0.52 * Math.cos(a)} cy={r * 0.52 * Math.sin(a)} r={r * 0.15} fill="var(--core-deep)" stroke={stroke} strokeWidth={0.9} />;
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

/* base speeds (deg/s) — signed = direction */
const BASE = {
  ring1: 4,      // primary indexing ring — slow clockwise
  ring2: -9.5,   // secondary transmission ring — counter, faster
  main: 10,      // central drive gear — slow
  sec: -28,      // meshed secondary — faster, opposite
  off: 20,       // offset gear
  hub: 6,        // hub cap
  out: -13,      // bottom output gear
  wheel: 24,     // output wheel
};

export default function CreativeCore() {
  const { data } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();

  /* hover = mechanical preview only (no selection in Phase 1) */
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hoverIdx;

  /* rotating part refs */
  const ring1G = useRef<SVGGElement>(null);
  const ring2G = useRef<SVGGElement>(null);
  const mainG = useRef<SVGGElement>(null);
  const secG = useRef<SVGGElement>(null);
  const offG = useRef<SVGGElement>(null);
  const hubG = useRef<SVGGElement>(null);
  const outG = useRef<SVGGElement>(null);
  const wheelG = useRef<SVGGElement>(null);
  const lampRef = useRef<SVGCircleElement>(null);
  const hubPulseG = useRef<SVGGElement>(null);
  /* live readout refs (mutated in rAF — zero re-renders) */
  const rpmRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const surgeBarRef = useRef<HTMLDivElement>(null);
  const statusDotRef = useRef<HTMLSpanElement>(null);

  /* ---- the engine: inertia + 10s surge + hover boost ---- */
  useEffect(() => {
    if (reduced) {
      if (statusRef.current) statusRef.current.textContent = "STATIC";
      if (rpmRef.current) rpmRef.current.textContent = "000";
      return;
    }
    const eng = {
      energy: 0,                       // spin-up 0 → 1 (mechanical engagement)
      kick: 0,                         // click impulse
      angles: { ring1: 8, ring2: -14, main: 0, sec: 22, off: 40, hub: 0, out: -30, wheel: 12 },
      raf: 0, last: 0, running: false, visible: true,
    };
    /* rings rotate about the viewBox centre; gears rotate about their own
       (already-translated) local origin */
    const applyRing = (g: React.RefObject<SVGGElement | null>, a: number) =>
      g.current?.setAttribute("transform", `rotate(${(a % 360).toFixed(2)} ${C} ${C})`);
    const applyLocal = (g: React.RefObject<SVGGElement | null>, a: number) =>
      g.current?.setAttribute("transform", `rotate(${(a % 360).toFixed(2)})`);

    const loop = (t: number) => {
      const dt = Math.min(0.045, eng.last ? (t - eng.last) / 1000 : 0.016);
      eng.last = t;

      /* spin-up: rest → engage → accelerate → stable (exponential inertia) */
      eng.energy += (1 - eng.energy) * Math.min(1, dt * 1.1);
      eng.kick = Math.max(0, eng.kick - dt * 2.2);

      /* 10s surge envelope: build 0.5s · hold 1.0s · decay 1.0s */
      const cyc = (t / 1000) % 10;
      const env = cyc < 7 ? 0 : cyc < 7.5 ? (cyc - 7) / 0.5 : cyc < 8.5 ? 1 : cyc < 9.5 ? 1 - (cyc - 8.5) : 0;

      const hover = hoverRef.current !== null ? 1 : 0;
      const mult = eng.energy * (1 + 1.6 * env + 0.25 * hover + eng.kick);

      const A = eng.angles;
      A.ring1 += BASE.ring1 * mult * dt;
      A.ring2 += BASE.ring2 * mult * dt;
      A.main += BASE.main * mult * dt;
      A.sec += BASE.sec * mult * dt;
      A.off += BASE.off * mult * dt;
      A.hub += BASE.hub * mult * dt;
      A.out += BASE.out * mult * dt;
      A.wheel += BASE.wheel * mult * dt;

      applyRing(ring1G, A.ring1);
      applyRing(ring2G, A.ring2);
      applyLocal(mainG, A.main);
      applyLocal(secG, A.sec);
      applyLocal(offG, A.off);
      applyLocal(hubG, A.hub);
      applyLocal(outG, A.out);
      applyLocal(wheelG, A.wheel);

      lampRef.current?.setAttribute("opacity", (0.12 + env * 0.88).toFixed(2));
      hubPulseG.current?.setAttribute("transform", `translate(${C} ${C}) scale(${(1 + 0.05 * env).toFixed(3)}) translate(${-C} ${-C})`);

      /* live readouts — write only on change */
      if (rpmRef.current) {
        const rpm = String(Math.round(Math.abs(BASE.main * mult) * 3.6)).padStart(3, "0");
        if (rpmRef.current.textContent !== rpm) rpmRef.current.textContent = rpm;
      }
      if (statusRef.current) {
        const st = env > 0.25 ? "SURGE" : hover ? "PREVIEW" : "IDLE";
        if (statusRef.current.textContent !== st) statusRef.current.textContent = st;
      }
      if (statusDotRef.current) {
        statusDotRef.current.style.background = env > 0.25 ? "var(--core-crimson)" : hover ? "var(--core-crimson)" : "var(--m-sub)";
      }
      if (surgeBarRef.current) surgeBarRef.current.style.transform = `scaleX(${env.toFixed(3)})`;

      eng.raf = requestAnimationFrame(loop);
    };

    /* run only while on screen */
    const start = () => { if (!eng.running && eng.visible) { eng.running = true; eng.last = 0; eng.raf = requestAnimationFrame(loop); } };
    const stop = () => { eng.running = false; cancelAnimationFrame(eng.raf); };
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { eng.visible = e.isIntersecting; e.isIntersecting ? start() : stop(); });
    }, { threshold: 0.15 });
    const sec = document.getElementById("core");
    if (sec) io.observe(sec);
    const onVis = () => { document.hidden ? stop() : start(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { stop(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
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
          {/* ================= THE CLOCKWORK ENGINE ================= */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-[660px] aspect-square select-none"
              onClick={() => { /* mechanical kick on interaction — speeds settle naturally */ }}>
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">

                {/* ============ LAYER 01 — BACKPLATE (rear chassis) ============ */}
                <g className="rb-a">
                  <circle cx={C} cy={C} r={246} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="2" />
                  <circle cx={C} cy={C} r={246} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="5" opacity="0.4" />
                  <circle cx={C} cy={C} r={240} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1.2" strokeDasharray="3 5" />
                  {/* mounting bolts */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x, y] = polar(240, i * 30 + 15);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="3.6" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1" />
                        <line x1={x - 1.8} y1={y} x2={x + 1.8} y2={y} stroke="var(--core-line)" strokeWidth="0.9" transform={`rotate(${i * 30} ${x} ${y})`} />
                      </g>
                    );
                  })}
                </g>

                {/* ============ LAYER 02 — OUTER HOUSING (static shell) ============ */}
                <g className="rb-b">
                  <circle cx={C} cy={C} r={236} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="2" />
                  {/* bevels — light catch above, shadow below */}
                  <path d={`M${polar(232, 205)[0]} ${polar(232, 205)[1]} A232 232 0 0 1 ${polar(232, 335)[0]} ${polar(232, 335)[1]}`}
                    fill="none" stroke="var(--core-inv)" strokeWidth="1.6" opacity="0.22" strokeLinecap="round" />
                  <path d={`M${polar(232, 25)[0]} ${polar(232, 25)[1]} A232 232 0 0 1 ${polar(232, 155)[0]} ${polar(232, 155)[1]}`}
                    fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.6" opacity="0.35" strokeLinecap="round" />
                  {/* segmented construction — 12 plate seams */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x1, y1] = polar(200, i * 30);
                    const [x2, y2] = polar(234, i * 30);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth="1.2" opacity="0.7" />;
                  })}
                  {/* housing screws */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x, y] = polar(217, i * 30 + 15);
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="4.4" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.1" />
                        <line x1={x - 2.2} y1={y} x2={x + 2.2} y2={y} stroke="var(--core-line)" strokeWidth="1" transform={`rotate(${i * 30 + 40} ${x} ${y})`} />
                      </g>
                    );
                  })}
                  {/* recessed channel + inner rim */}
                  <circle cx={C} cy={C} r={206} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="4" opacity="0.5" />
                  <circle cx={C} cy={C} r={198} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.6" />
                  {/* mechanical indexing marks on the rim */}
                  {Array.from({ length: 36 }).map((_, i) => {
                    const [x1, y1] = polar(194, i * 10);
                    const [x2, y2] = polar(i % 3 === 0 ? 187 : 191, i * 10);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={i % 3 === 0 ? "var(--core-mid)" : "var(--core-line)"} strokeWidth={i % 3 === 0 ? 1.6 : 0.9} opacity="0.8" />;
                  })}
                  {/* surge lamp — top of housing */}
                  <circle cx={C} cy={C - 217} r="5" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.2" />
                  <circle ref={lampRef} cx={C} cy={C - 217} r="2.6" fill="var(--core-crimson)" opacity="0.12" />
                </g>

                {/* ============ LAYER 03 — PRIMARY INDEXING RING (rotates, slow CW) ============ */}
                <g className="rb-c">
                  <g ref={ring1G}>
                    <circle cx={C} cy={C} r={175} fill="none" stroke="var(--core-ring)" strokeWidth={30} opacity="0.9" />
                    <circle cx={C} cy={C} r={175} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={30} opacity="0.25" strokeDasharray="2 8" />
                    {/* segmented tooth-like indexing blocks */}
                    {Array.from({ length: 36 }).map((_, k) => {
                      const [x, y] = polar(175, k * 10);
                      const major = k % 6 === 0;
                      return (
                        <rect key={k} x={major ? -5.5 : -4} y={major ? -17 : -13} width={major ? 11 : 8} height={major ? 34 : 26} rx="1.5"
                          transform={`translate(${x} ${y}) rotate(${k * 10})`}
                          fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={major ? 1.2 : 0.8} />
                      );
                    })}
                    {/* the one crimson marker — travels with the ring */}
                    <g transform={`translate(${polar(175, 0)[0]} ${polar(175, 0)[1]})`}>
                      <rect x="-6" y="-18" width="12" height="36" rx="2" fill="var(--core-crimson)" stroke="var(--core-line)" strokeWidth="1.2" />
                      <circle cy="-10" r="1.8" fill="var(--core-inv)" />
                    </g>
                    <circle cx={C} cy={C} r={190} fill="none" stroke="var(--core-line)" strokeWidth="1" opacity="0.6" />
                    <circle cx={C} cy={C} r={160} fill="none" stroke="var(--core-line)" strokeWidth="1" opacity="0.6" />
                  </g>
                </g>

                {/* ============ LAYER 04 — SECONDARY TRANSMISSION RING (counter-rotates) ============ */}
                <g className="rb-d">
                  <g ref={ring2G}>
                    <circle cx={C} cy={C} r={136} fill="none" stroke="var(--core-plate)" strokeWidth={20} />
                    <circle cx={C} cy={C} r={136} fill="none" stroke="var(--core-line)" strokeWidth={1} opacity="0.5" />
                    {/* inward teeth */}
                    {Array.from({ length: 24 }).map((_, i) => {
                      const [x, y] = polar(121, i * 15);
                      return <rect key={i} x="-3.5" y="-6" width="7" height="12" rx="1"
                        transform={`translate(${x} ${y}) rotate(${i * 15})`}
                        fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth="0.8" />;
                    })}
                    {/* radial slots */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const [x1, y1] = polar(129, i * 45 + 22.5);
                      const [x2, y2] = polar(143, i * 45 + 22.5);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-deep)" strokeWidth="5" strokeLinecap="round" />;
                    })}
                    {/* small bearings riding the ring */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const [x, y] = polar(136, i * 45);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="4.6" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.1" />
                          <circle cx={x} cy={y} r="1.5" fill="var(--core-mid)" />
                        </g>
                      );
                    })}
                  </g>
                </g>

                {/* ============ LAYER 05 — RECESSED INNER CHAMBER + CLOCKWORK ============ */}
                <g className="rb-e">
                  {/* chamber floor — sits deeper than the rings */}
                  <circle cx={C} cy={C} r={116} fill="var(--core-deep)" />
                  <circle cx={C} cy={C} r={116} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="5" opacity="0.5" />
                  <circle cx={C} cy={C} r={110} fill="none" stroke="var(--core-line)" strokeWidth="1" opacity="0.5" />
                  {/* machined channels */}
                  {[60, 120, 240, 300].map((deg) => {
                    const [x1, y1] = polar(48, deg);
                    const [x2, y2] = polar(112, deg);
                    return (
                      <g key={deg}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.3)" strokeWidth="6" strokeLinecap="round" />
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth="1" opacity="0.5" />
                      </g>
                    );
                  })}
                  <circle cx={C} cy={C} r={92} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" opacity="0.5" />

                  {/* RADIAL STRUCTURAL MEMBERS — three different constructions */}
                  {/* thick arm with rivets (upper-right diagonal) */}
                  <g transform={`rotate(60 ${C} ${C})`}>
                    <rect x={C - 6.5} y={C - 112} width="13" height="76" rx="2" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.3" />
                    <circle cx={C} cy={C - 100} r="2.2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="0.8" />
                    <circle cx={C} cy={C - 48} r="2.2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="0.8" />
                  </g>
                  {/* recessed rail with bearing mount (lower-left) */}
                  <g transform={`rotate(205 ${C} ${C})`}>
                    <rect x={C - 5} y={C - 108} width="3" height="66" fill="var(--core-line)" opacity="0.8" />
                    <rect x={C + 2} y={C - 108} width="3" height="66" fill="var(--core-line)" opacity="0.8" />
                    <circle cx={C} cy={C - 76} r="6.5" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.3" />
                    <circle cx={C} cy={C - 76} r="2.2" fill="var(--core-mid)" />
                  </g>
                  {/* articulated bar with pivot joints (left) */}
                  <g transform={`rotate(275 ${C} ${C})`}>
                    <rect x={C - 4.5} y={C - 100} width="9" height="58" rx="4" fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth="1.1" />
                    <circle cx={C} cy={C - 100} r="5" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
                    <circle cx={C} cy={C - 42} r="5" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
                    <circle cx={C} cy={C - 71} r="3" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />
                  </g>

                  {/* CENTRAL CLOCKWORK ASSEMBLY */}
                  {/* primary drive gear — on the central shaft */}
                  <g transform={`translate(${C} ${C})`}>
                    <g ref={mainG} style={{ transformOrigin: "0px 0px" }} transform="">
                      <Gear r={44} teeth={18} fill="var(--core-gear)" stroke="var(--core-line)" spokes={5} />
                    </g>
                  </g>
                  {/* secondary gear — meshed upper-left, opposite rotation */}
                  <g transform={`translate(${polar(62, 335)[0]} ${polar(62, 335)[1]})`}>
                    <g ref={secG}>
                      <Gear r={26} teeth={12} fill="var(--core-plate)" stroke="var(--core-line)" spokes={4} />
                    </g>
                  </g>
                  {/* offset gear — off-axis, lower-right */}
                  <g transform={`translate(${polar(74, 120)[0]} ${polar(74, 120)[1]})`}>
                    <g ref={offG}>
                      <Gear r={15} teeth={9} fill="var(--core-mid)" stroke="var(--core-line)" hub={false} />
                      <circle r={4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />
                    </g>
                  </g>

                  {/* BOTTOM OUTPUT MECHANISM — shaft from hub → gear → wheel */}
                  <g>
                    <line x1={C} y1={C + 40} x2={C} y2={C + 64} stroke="var(--core-line)" strokeWidth="6" strokeLinecap="round" />
                    <circle cx={C} cy={C + 52} r="5.5" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.2" />
                    {/* output gear */}
                    <g transform={`translate(${polar(80, 180)[0]} ${polar(80, 180)[1]})`}>
                      <g ref={outG}>
                        <Gear r={18} teeth={10} fill="var(--core-plate)" stroke="var(--core-line)" hub={false} />
                        <circle r={5} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.1" />
                      </g>
                    </g>
                    {/* secondary output wheel + its bearing bracket */}
                    <rect x={C - 16} y={C + 96} width="32" height="6" rx="2" fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth="1" />
                    <g transform={`translate(${polar(105, 180)[0]} ${polar(105, 180)[1]})`}>
                      <g ref={wheelG}>
                        <Gear r={12} teeth={8} fill="var(--core-mid)" stroke="var(--core-line)" hub={false} />
                        <circle r={3.2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />
                      </g>
                    </g>
                  </g>

                  {/* CENTRAL HUB — bearing + rotating cap + keyway ready for the pointer */}
                  <circle cx={C} cy={C} r={40} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.6" />
                  <circle cx={C} cy={C} r={31} fill="none" stroke="var(--core-line)" strokeWidth="7" opacity="0.85" />
                  <g transform={`translate(${C} ${C})`}>
                    <g ref={hubG}>
                      <circle r={22} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.4" />
                      {[45, 135, 225, 315].map((deg) => {
                        const a = (deg * Math.PI) / 180;
                        return <circle key={deg} cx={14 * Math.cos(a)} cy={14 * Math.sin(a)} r="2.2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="0.8" />;
                      })}
                      {/* keyway slot — the future pointer mount */}
                      <rect x="-3" y="-22" width="6" height="10" rx="1.5" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />
                    </g>
                  </g>
                  {/* shaft centre + restrained crimson index */}
                  <g ref={hubPulseG}>
                    <circle cx={C} cy={C} r={8} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth="1.3" />
                    <circle cx={C} cy={C} r={3} fill="var(--core-crimson)" />
                    <circle cx={C} cy={C} r={1.1} fill="var(--core-inv)" />
                  </g>
                </g>

                {/* ============ LAYER 06 — SMALL PERIODIC MECHANISMS + NODE DOCKS ============ */}
                <g className="rb-f">
                  {/* escapement anchor — periodic rock at the top of the chamber */}
                  <g transform={`translate(${polar(97, 0)[0]} ${polar(97, 0)[1]})`}>
                    <g className={reduced ? undefined : "esc-rock"}>
                      <path d="M-9 3 L0 -7 L9 3 M0 -7 L0 6" fill="none" stroke="var(--core-mid)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                      <circle r="2.4" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1" />
                    </g>
                  </g>
                  {/* valve indicators — tiny periodic pulses */}
                  {[110, 250].map((deg, k) => {
                    const [x, y] = polar(101, deg);
                    return (
                      <g key={deg} transform={`translate(${x} ${y})`}>
                        <rect x="-5" y="-5" width="10" height="10" rx="2" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                        <circle r="1.8" fill="var(--core-crimson)" className={reduced ? undefined : "live-blink"} style={{ animationDelay: `${k * 0.8}s` }} />
                      </g>
                    );
                  })}

                  {/* NODE DOCKS — one physical coupling per capability, mounted on the housing */}
                  {disciplines.map((dis, i) => {
                    const deg = i * (360 / N);
                    const isHover = i === hoverIdx;
                    return (
                      <g key={dis.id} transform={`rotate(${deg} ${C} ${C})`}>
                        <g style={{ transform: isHover ? "translateY(-3px)" : "none", transition: reduced ? "none" : "transform .35s cubic-bezier(.3,.8,.3,1)" }}>
                          {/* coupling arm from housing to dock */}
                          <rect x={C - 4} y={C - 232} width="8" height="34" rx="2" fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth="1.1" />
                          <line x1={C - 1.5} y1={C - 228} x2={C - 1.5} y2={C - 202} stroke="var(--core-inv)" strokeWidth="0.9" opacity="0.25" />
                          {/* mounting joint on the housing rim */}
                          <rect x={C - 8} y={C - 203} width="16" height="11" rx="2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.2" />
                          <circle cx={C} cy={C - 197.5} r="2.2" fill={isHover ? "var(--core-crimson)" : "var(--core-mid)"} style={{ transition: "fill .3s ease" }} />
                          {/* transmission coupling gear — engages on hover */}
                          <g transform={`translate(${C} ${C - 243})`}>
                            <g className={isHover && !reduced ? "coupling-spin" : undefined}>
                              <Gear r={8.5} teeth={7} fill="var(--core-deep)" stroke={isHover ? "var(--core-crimson)" : "var(--core-mid)"} hub={false} />
                            </g>
                            <circle r={2} fill={isHover ? "var(--core-crimson)" : "var(--core-line)"} style={{ transition: "fill .3s ease" }} />
                          </g>
                          {/* signal stub into the ring — wakes on hover */}
                          <line x1={C} y1={C - 190} x2={C} y2={C - 172} stroke="var(--core-crimson)" strokeWidth="2.4" strokeLinecap="round"
                            opacity={isHover ? 0.6 : 0} style={{ transition: "opacity .35s ease" }} />
                        </g>
                      </g>
                    );
                  })}
                </g>
              </svg>

              {/* ================= NINE DISCIPLINE NODES (unchanged positions/labels) ================= */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isHover = i === hoverIdx;
                const { x, y } = nodePos(i, 44.5);
                const lb = LBL[i % LBL.length];
                const labelWrap =
                  lb.side === "above" ? "absolute -top-11 inset-x-0 flex flex-col items-center" :
                  lb.side === "below" ? "absolute -bottom-11 inset-x-0 flex flex-col items-center" :
                  lb.side === "left" ? "absolute right-full top-1/2 -translate-y-1/2 pr-3 flex flex-col items-end" :
                  "absolute left-full top-1/2 -translate-y-1/2 pl-3 flex flex-col items-start";

                const nodeFill = isHover ? "#e72241" : "var(--outer-bg)";
                const iconColor = isHover ? "#ddddd8" : "var(--outer-ink)";
                const nodeBorder = isHover
                  ? "1.5px solid #e72241"
                  : "1.5px solid color-mix(in srgb, var(--outer-ink) 30%, transparent)";

                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
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
                        transform: isHover ? "translateY(-2px) scale(1.04)" : "none",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${isHover ? "bg-[#e72241] text-[#ddddd8]" : ""}`}
                        style={isHover ? undefined : { background: "var(--outer-bg)", color: "var(--outer-ink)" }}>
                        {dis.num}
                      </span>
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors duration-300"
                        style={{ background: isHover ? "#ddddd8" : "color-mix(in srgb, var(--outer-ink) 40%, transparent)" }} />
                    </span>
                    <span className={`${labelWrap} pointer-events-none`}>
                      {lb.lines.map((ln) => (
                        <span key={ln} className={`f-tech font-bold text-[12px] tracking-[0.12em] leading-[1.3] whitespace-nowrap transition-colors duration-300 ${lb.side === "left" ? "text-right" : "text-left"}`}
                          style={{ color: isHover ? "var(--crimson-rough)" : "var(--ink2)" }}>
                          {ln}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}

              <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-8 h-px bg-[var(--line)]" />
                RADIAL TRANSMISSION — 09 DOCKS · 01 ENGINE
                <span className="w-8 h-px bg-[var(--line)]" />
              </div>
            </div>
          </Reveal>

          {/* ================= ENGINE STATUS PANEL (pointer arrives in a later phase) ================= */}
          <Reveal delay={0.1}>
            <div className="mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 18%, transparent)" }}>
              <span className="absolute top-0 left-0 h-[3px] bg-[var(--crim-panel)] scan-pass" style={{ width: "42%" }} aria-hidden />
              <div className="flex items-center justify-between">
                <span className="f-mono text-[11px] tracking-[0.3em]" style={{ color: "var(--crim-panel)" }}>ENGINE / 01</span>
                <span className="f-mono text-[9px] tracking-[0.26em] flex items-center gap-2" style={{ color: "var(--m-sub)" }}>
                  <span ref={statusDotRef} className="w-1.5 h-1.5 rounded-full live-blink" style={{ background: "var(--m-sub)" }} />
                  <span ref={statusRef}>IDLE</span>
                </span>
              </div>
              <h3 className="f-display text-[clamp(1.6rem,2.6vw,2.3rem)] leading-tight mt-3" style={{ color: "var(--outer-ink)" }}>STANDBY</h3>
              <p className="mt-4 text-[13.5px] sm:text-[14px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: 0.92 }}>
                The transmission is running — nine docks parked on the housing, the clockwork turning under load. The pointer mechanism is built into the hub and engages in a later phase.
              </p>

              {/* live mechanical readouts */}
              <div className="mt-6 pt-4 flex flex-col gap-3" style={{ borderTop: "1px solid var(--m-line)" }}>
                <div className="flex items-center justify-between f-mono text-[10px] tracking-[0.24em]" style={{ color: "var(--m-sub)" }}>
                  <span>MAIN DRIVE</span>
                  <span className="tabular-nums" style={{ color: "var(--outer-ink)" }}><span ref={rpmRef}>000</span> RPM</span>
                </div>
                <div className="flex items-center justify-between f-mono text-[10px] tracking-[0.24em]" style={{ color: "var(--m-sub)" }}>
                  <span>POWER SURGE — 10S CYCLE</span>
                  <span className="w-24 h-[5px] rounded-sm overflow-hidden" style={{ background: "color-mix(in srgb, var(--outer-ink) 16%, transparent)" }}>
                    <span ref={surgeBarRef} className="block h-full w-full origin-left" style={{ background: "var(--crim-panel)", transform: "scaleX(0)" }} />
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 f-mono text-[9px] tracking-[0.24em] flex justify-between"
                style={{ borderTop: "1px solid var(--m-line)", color: "var(--m-sub)" }}>
                <span>HOVER — MECHANICAL PREVIEW ONLY</span>
                <span style={{ color: "var(--crim-panel)" }}>09 / 09 PARKED</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
