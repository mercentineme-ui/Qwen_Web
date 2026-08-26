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

const Bolt = ({ x, y, deg = 0 }: { x: number; y: number; deg?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${deg})`}>
    <circle r={4.4} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
    <rect x={-2.6} y={-0.9} width={5.2} height={1.8} fill="var(--core-deep)" />
  </g>
);

const Bearing = ({ x, y, r = 13 }: { x: number; y: number; r?: number }) => (
  <g>
    <circle cx={x} cy={y} r={r + 4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
    <circle cx={x} cy={y} r={r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
    <circle cx={x} cy={y} r={r - 3.5} fill="none" stroke="var(--core-line)" strokeWidth={1} strokeDasharray="3 2.4" opacity={0.8} />
    <circle cx={x} cy={y} r={3.2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
  </g>
);

function Shaft({ x1, y1, x2, y2, w = 8 }: { x1: number; y1: number; x2: number; y2: number; w?: number }) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <g transform={`translate(${x1} ${y1}) rotate(${ang})`}>
      <rect x={0} y={-w / 2} width={len} height={w} rx={w / 2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
      <rect x={4} y={-w / 2 + 1.4} width={len - 8} height={1.6} rx={0.8} fill="var(--core-inv)" opacity={0.25} />
      <rect x={-3} y={-w / 2 - 2} width={7} height={w + 4} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
      <rect x={len - 4} y={-w / 2 - 2} width={7} height={w + 4} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
    </g>
  );
}

/* ================= machine layout — clockwork transmission =================
   DRIVE (primary, on central shaft) → SHAFT (vertical) → GEAR (secondary,
   offset) → CAM (eccentric) → LINKAGE (push-rod) → CENTRAL HUB → OUTPUT
   (lower gear + crank). Governor regulates; escapement keeps time. */
const PRI = { x: 300, y: 300, r: 46 };      // GEAR 01 — primary drive (center)
const SEC = { x: 230, y: 234, r: 58 };      // GEAR 02 — transmission (upper-left, larger)
const ESC = { x: 368, y: 214, r: 24 };      // GEAR 03 — escape wheel (upper-right)
const GOV = { x: 300, y: 158, armLen: 42 }; // GEAR 05 — governor (top)
const CAM = { x: 232, y: 396, r: 20 };      // eccentric cam (lower-left)
const OUT = { x: 372, y: 392, r: 32 };      // GEAR 04 — output (lower-right)
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();

  /* ---- selection model (card sync only — no pointer) ---- */
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

  /* ---- the engine: one integration loop drives every mechanism ---- */
  const gFrame = useRef<SVGGElement>(null);
  const gShafts = useRef<SVGGElement>(null);
  const gSecondary = useRef<SVGGElement>(null);
  const gEscape = useRef<SVGGElement>(null);
  const gGovernor = useRef<SVGGElement>(null);
  const gPrimary = useRef<SVGGElement>(null);
  const gCam = useRef<SVGGElement>(null);
  const gOutput = useRef<SVGGElement>(null);
  const gHub = useRef<SVGGElement>(null);
  /* rotating parts */
  const primaryG = useRef<SVGGElement>(null);
  const secG = useRef<SVGGElement>(null);
  const escWG = useRef<SVGGElement>(null);
  const anchorG = useRef<SVGGElement>(null);
  const govSpinG = useRef<SVGGElement>(null);
  const camG = useRef<SVGGElement>(null);
  const outG = useRef<SVGGElement>(null);
  const hubCollarG = useRef<SVGGElement>(null);
  /* governor articulation */
  const armL = useRef<SVGLineElement>(null);
  const armR = useRef<SVGLineElement>(null);
  const linkL = useRef<SVGLineElement>(null);
  const linkR = useRef<SVGLineElement>(null);
  const ballL = useRef<SVGCircleElement>(null);
  const ballR = useRef<SVGCircleElement>(null);
  const hlL = useRef<SVGCircleElement>(null);
  const hlR = useRef<SVGCircleElement>(null);
  const sleeveG = useRef<SVGGElement>(null);
  /* cam linkage */
  const camRoller = useRef<SVGCircleElement>(null);
  const camRod = useRef<SVGLineElement>(null);
  const camSliderG = useRef<SVGGElement>(null);
  /* output crank */
  const crankRod = useRef<SVGLineElement>(null);
  const outSliderG = useRef<SVGGElement>(null);
  /* status */
  const hubLamp = useRef<SVGCircleElement>(null);
  const govLamp = useRef<SVGCircleElement>(null);

  const eng = useRef({
    t: 0, last: 0, raf: 0,
    surgeAt: 6, surge: -1, env: 0, energy: 0,
    pri: 0, sec: 0, cam: 0, out: 0, hubCollar: 0, govSpin: 0, spread: 0.3,
    escTimer: 0, escStep: 0, escA: 0, anchorA: 0,
    recalT: -1, lastTheme: "",
  });
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hoverIdx;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const setTr = (g: React.RefObject<SVGGElement | null>, tr: string) => g.current?.setAttribute("transform", tr);

  useEffect(() => {
    const e = eng.current;
    e.lastTheme = themeRef.current;

    if (reduced) {
      /* static assembled machine */
      [gFrame, gShafts, gSecondary, gEscape, gGovernor, gPrimary, gCam, gOutput, gHub].forEach((g) => {
        g.current?.setAttribute("opacity", "1"); g.current?.setAttribute("transform", "");
      });
      setTr(primaryG, `translate(${PRI.x} ${PRI.y}) rotate(15)`);
      setTr(secG, `translate(${SEC.x} ${SEC.y}) rotate(-12)`);
      setTr(escWG, `translate(${ESC.x} ${ESC.y}) rotate(24)`);
      setTr(camG, `translate(${CAM.x} ${CAM.y}) rotate(40)`);
      setTr(outG, `translate(${OUT.x} ${OUT.y}) rotate(30)`);
      setTr(hubCollarG, `translate(${PRI.x} ${PRI.y}) rotate(20)`);
      setTr(govSpinG, `translate(${GOV.x} ${GOV.y}) rotate(25)`);
      const th = (22 + 26 * 0.4) * DEG;
      const bx = Math.sin(th) * GOV.armLen, by = GOV.y + Math.cos(th) * GOV.armLen;
      armL.current?.setAttribute("x2", String(GOV.x - bx)); armL.current?.setAttribute("y2", String(by));
      armR.current?.setAttribute("x2", String(GOV.x + bx)); armR.current?.setAttribute("y2", String(by));
      ballL.current?.setAttribute("cx", String(GOV.x - bx)); ballL.current?.setAttribute("cy", String(by));
      ballR.current?.setAttribute("cx", String(GOV.x + bx)); ballR.current?.setAttribute("cy", String(by));
      hlL.current?.setAttribute("cx", String(GOV.x - bx - 2.5)); hlL.current?.setAttribute("cy", String(by - 2.5));
      hlR.current?.setAttribute("cx", String(GOV.x + bx - 2.5)); hlR.current?.setAttribute("cy", String(by - 2.5));
      const slY = by + 12;
      setTr(sleeveG, `translate(0 ${slY})`);
      linkL.current?.setAttribute("x1", String(GOV.x - bx)); linkL.current?.setAttribute("y1", String(by));
      linkR.current?.setAttribute("x1", String(GOV.x + bx)); linkR.current?.setAttribute("y1", String(by));
      const rollerY = CAM.y - CAM.r - 5 + 4.5 * Math.sin(40 * DEG);
      camRoller.current?.setAttribute("cx", String(CAM.x)); camRoller.current?.setAttribute("cy", String(rollerY));
      setTr(camSliderG, `translate(0 ${rollerY - 30})`);
      camRod.current?.setAttribute("x1", String(CAM.x)); camRod.current?.setAttribute("y1", String(rollerY - 4));
      camRod.current?.setAttribute("x2", String(CAM.x)); camRod.current?.setAttribute("y2", String(rollerY - 24));
      return;
    }

    const loop = (t: number) => {
      const dt = Math.min(0.05, e.last ? (t - e.last) / 1000 : 0.016);
      e.last = t; e.t += dt;

      /* 10-second mechanical surge — build, ~1s peak, decay */
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
      e.energy += (1 - e.energy) * Math.min(1, dt * 1.1); /* spin-up */

      /* theme recalibration — slow, dismantle, re-seat */
      if (themeRef.current !== e.lastTheme) { e.lastTheme = themeRef.current; e.recalT = 0.0001; }
      let sep = 0;
      if (e.recalT > 0) {
        e.recalT += dt;
        sep = e.recalT < 1.4 ? Math.sin(Math.PI * (e.recalT / 1.4)) : 0;
        if (e.recalT >= 1.4) e.recalT = -1;
      }
      const recalScale = 1 - 0.85 * sep;

      /* hover wakes the zone the node belongs to */
      const h = hoverRef.current;
      const bTop = h !== null && h <= 2 ? 0.4 : 0;
      const bLeft = h !== null && h >= 6 ? 0.4 : 0;
      const bRight = h !== null && h >= 3 && h <= 5 ? 0.4 : 0;
      const hoverAny = h !== null ? 0.15 : 0;
      const mC = e.energy * (1 + 1.6 * env + hoverAny) * recalScale;
      const mTop = e.energy * (1 + 1.6 * env + hoverAny + bTop) * recalScale;
      const mLeft = e.energy * (1 + 1.6 * env + hoverAny + bLeft) * recalScale;
      const mRight = e.energy * (1 + 1.6 * env + hoverAny + bRight) * recalScale;

      /* ---- gear train: drive → transmission (meshed, opposed, ratio'd) ---- */
      e.pri += 20 * mC * dt;
      e.sec -= 20 * (PRI.r / SEC.r) * mLeft * dt;   /* larger gear turns slower, opposite */
      e.cam += 55 * mLeft * dt;
      e.out += 38 * mRight * dt;                     /* independent output */
      e.hubCollar += 26 * mC * dt;

      setTr(primaryG, `translate(${PRI.x} ${PRI.y}) rotate(${(e.pri % 360).toFixed(1)})`);
      setTr(secG, `translate(${SEC.x} ${SEC.y}) rotate(${(e.sec % 360).toFixed(1)})`);
      setTr(camG, `translate(${CAM.x} ${CAM.y}) rotate(${(e.cam % 360).toFixed(1)})`);
      setTr(outG, `translate(${OUT.x} ${OUT.y}) rotate(${(e.out % 360).toFixed(1)})`);
      setTr(hubCollarG, `translate(${PRI.x} ${PRI.y}) rotate(${(e.hubCollar % 360).toFixed(1)})`);

      /* ---- escapement: release → lock → release (periodic, not constant) ---- */
      e.escTimer += dt * (0.55 + 1.3 * env) * mTop;
      if (e.escTimer > 0.5) { e.escTimer -= 0.5; e.escStep++; }
      e.escA += (e.escStep * 24 - e.escA) * Math.min(1, dt * 14);
      e.anchorA += ((e.escStep % 2 === 0 ? 13 : -13) - e.anchorA) * Math.min(1, dt * 16);
      setTr(escWG, `translate(${ESC.x} ${ESC.y}) rotate(${e.escA.toFixed(1)})`);
      setTr(anchorG, `translate(${ESC.x} ${ESC.y - ESC.r - 4}) rotate(${e.anchorA.toFixed(1)})`);

      /* ---- governor: centrifugal arms spread with speed ---- */
      e.govSpin += (90 + 150 * env) * mTop * dt;
      const spreadTarget = clamp01((mTop - 0.3) / 1.2) * (0.45 + 0.55 * clamp01(0.3 + env));
      e.spread += (spreadTarget - e.spread) * Math.min(1, dt * 2.2);
      setTr(govSpinG, `translate(${GOV.x} ${GOV.y}) rotate(${(e.govSpin % 360).toFixed(1)})`);
      const th = (22 + 26 * e.spread) * DEG;
      const bx = Math.sin(th) * GOV.armLen, by = GOV.y + Math.cos(th) * GOV.armLen;
      armL.current?.setAttribute("x2", (GOV.x - bx).toFixed(1)); armL.current?.setAttribute("y2", by.toFixed(1));
      armR.current?.setAttribute("x2", (GOV.x + bx).toFixed(1)); armR.current?.setAttribute("y2", by.toFixed(1));
      ballL.current?.setAttribute("cx", (GOV.x - bx).toFixed(1)); ballL.current?.setAttribute("cy", by.toFixed(1));
      ballR.current?.setAttribute("cx", (GOV.x + bx).toFixed(1)); ballR.current?.setAttribute("cy", by.toFixed(1));
      hlL.current?.setAttribute("cx", (GOV.x - bx - 2.5).toFixed(1)); hlL.current?.setAttribute("cy", (by - 2.5).toFixed(1));
      hlR.current?.setAttribute("cx", (GOV.x + bx - 2.5).toFixed(1)); hlR.current?.setAttribute("cy", (by - 2.5).toFixed(1));
      const slY = by + 12;
      setTr(sleeveG, `translate(0 ${slY.toFixed(1)})`);
      linkL.current?.setAttribute("x1", (GOV.x - bx).toFixed(1)); linkL.current?.setAttribute("y1", by.toFixed(1));
      linkL.current?.setAttribute("x2", String(GOV.x - 5)); linkL.current?.setAttribute("y2", slY.toFixed(1));
      linkR.current?.setAttribute("x1", (GOV.x + bx).toFixed(1)); linkR.current?.setAttribute("y1", by.toFixed(1));
      linkR.current?.setAttribute("x2", String(GOV.x + 5)); linkR.current?.setAttribute("y2", slY.toFixed(1));
      govLamp.current?.setAttribute("opacity", (0.25 + env * 0.75).toFixed(2));

      /* ---- cam → follower → push-rod → slider (rotation → linkage → linear) ---- */
      const camRad = e.cam * DEG;
      const rollerY = CAM.y - CAM.r - 5 + 4.5 * Math.sin(camRad);
      const rollerX = CAM.x + 4.5 * Math.cos(camRad) * 0.35;
      camRoller.current?.setAttribute("cx", rollerX.toFixed(1)); camRoller.current?.setAttribute("cy", rollerY.toFixed(1));
      camRod.current?.setAttribute("x1", rollerX.toFixed(1)); camRod.current?.setAttribute("y1", (rollerY - 4).toFixed(1));
      camRod.current?.setAttribute("x2", String(CAM.x)); camRod.current?.setAttribute("y2", (rollerY - 24).toFixed(1));
      setTr(camSliderG, `translate(0 ${(rollerY - 30).toFixed(1)})`);

      /* ---- output crank → connecting rod → slider on delivery rail ---- */
      const outRad = e.out * DEG;
      const pinX = OUT.x + 13 * Math.cos(outRad), pinY = OUT.y + 13 * Math.sin(outRad);
      const sliderX = pinX + Math.sqrt(Math.max(2025 - (pinY - OUT.y) ** 2, 100));
      crankRod.current?.setAttribute("x1", pinX.toFixed(1)); crankRod.current?.setAttribute("y1", pinY.toFixed(1));
      crankRod.current?.setAttribute("x2", sliderX.toFixed(1)); crankRod.current?.setAttribute("y2", String(OUT.y));
      setTr(outSliderG, `translate(${sliderX.toFixed(1)} ${OUT.y})`);

      /* ---- status lamps ---- */
      hubLamp.current?.setAttribute("opacity", clamp01(0.15 + env * 0.85 + (h !== null ? 0.2 : 0)).toFixed(2));

      /* ---- assembly / recalibration layer motion ---- */
      const prog = (delay: number) => clamp01((e.t - delay) / 0.45);
      const layers: [React.RefObject<SVGGElement | null>, number, number, number][] = [
        [gFrame, 0, 0, 0],
        [gShafts, 0.2, 0, 10],
        [gSecondary, 0.35, -12, -8],
        [gEscape, 0.45, 12, -8],
        [gGovernor, 0.55, 0, -14],
        [gPrimary, 0.65, 0, 0],
        [gCam, 0.75, -10, 10],
        [gOutput, 0.85, 12, 10],
        [gHub, 0.95, 0, -6],
      ];
      layers.forEach(([g, delay, dx, dy]) => {
        const p = prog(delay);
        g.current?.setAttribute("transform", `translate(${(dx * sep).toFixed(1)} ${(dy * sep + (1 - p) * 16).toFixed(1)})`);
        g.current?.setAttribute("opacity", (p * (1 - 0.12 * sep)).toFixed(2));
      });

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
          {/* ==================== CLOCKWORK TRANSMISSION ENGINE ==================== */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">

                {/* ---- LEVEL 0 · HOUSING + RECESSED CAVITY ---- */}
                <g ref={gFrame}>
                  <circle cx={C} cy={C + 4} r={252} fill="rgba(0,0,0,0.3)" />
                  <circle cx={C} cy={C} r={250} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={2} />
                  {/* thick rim + recessed inner wall */}
                  <circle cx={C} cy={C} r={236} fill="none" stroke="var(--core-deep)" strokeWidth={9} />
                  <circle cx={C} cy={C} r={228} fill="none" stroke="var(--core-line)" strokeWidth={1} opacity={0.7} />
                  {/* machined grooves */}
                  {[243, 222].map((r) => (
                    <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="var(--core-line)" strokeWidth={0.7} opacity={0.4} />
                  ))}
                  {/* bevel catches */}
                  <path d={`M ${polar(246, 205)[0]} ${polar(246, 205)[1]} A 246 246 0 0 1 ${polar(246, 335)[0]} ${polar(246, 335)[1]}`}
                    fill="none" stroke="var(--core-inv)" strokeWidth={1.6} opacity={0.18} strokeLinecap="round" />
                  <path d={`M ${polar(246, 25)[0]} ${polar(246, 25)[1]} A 246 246 0 0 1 ${polar(246, 155)[0]} ${polar(246, 155)[1]}`}
                    fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth={1.6} strokeLinecap="round" />
                  {/* structural bolts */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x, y] = polar(241, i * 30 + 15);
                    return <Bolt key={i} x={x} y={y} deg={i * 30} />;
                  })}
                  {/* panel breaks */}
                  {[70, 190, 310].map((deg) => {
                    const [x1, y1] = polar(228, deg);
                    const [x2, y2] = polar(250, deg);
                    return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth={1.2} opacity={0.5} />;
                  })}
                  {/* recessed cavity + back plate */}
                  <circle cx={C} cy={C} r={198} fill="var(--core-deep)" />
                  <circle cx={C} cy={C} r={198} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={7} opacity={0.5} />
                  <circle cx={C} cy={C} r={190} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth={3} />
                  {/* recessed mechanical plate with machined channels */}
                  <circle cx={C} cy={C} r={182} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.8} opacity={0.9} />
                  {[30, 105, 255, 330].map((deg) => {
                    const [x1, y1] = polar(176, deg);
                    const [x2, y2] = polar(96, deg);
                    return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.25)" strokeWidth={5} strokeLinecap="round" />;
                  })}
                  <circle cx={C} cy={C} r={120} fill="none" stroke="var(--core-line)" strokeWidth={0.7} opacity={0.35} />
                </g>

                {/* ---- LEVEL 1 · SHAFTS (vertical drive + branches) ---- */}
                <g ref={gShafts}>
                  {/* central vertical drive shaft */}
                  <rect x={295.5} y={150} width={9} height={252} rx={4} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <rect x={297.5} y={154} width={1.8} height={244} fill="var(--core-inv)" opacity={0.25} />
                  {[210, 350].map((y) => (
                    <rect key={y} x={292} y={y - 3.5} width={16} height={7} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  ))}
                  {/* branch to cam (lower-left) + branch to output (lower-right) */}
                  <Shaft x1={300} y1={395} x2={CAM.x} y2={CAM.y} w={7} />
                  <Shaft x1={300} y1={395} x2={OUT.x} y2={OUT.y} w={7} />
                  {/* secondary gear shaft + bearing housing (upper-left) */}
                  <Shaft x1={SEC.x + 10} y1={SEC.y + 10} x2={PRI.x - PRI.r + 8} y2={PRI.y - PRI.r + 8} w={6} />
                  {/* bottom shaft bearing */}
                  <Bearing x={300} y={404} r={8} />
                </g>

                {/* ---- LEVEL 2 · SECONDARY TRANSMISSION GEAR (upper-left) ---- */}
                <g ref={gSecondary}>
                  <circle cx={SEC.x} cy={SEC.y + 3} r={SEC.r + 4} fill="rgba(0,0,0,0.26)" />
                  <g ref={secG}>
                    <Gear r={SEC.r} teeth={20} fill="var(--core-gear)" stroke="var(--core-line)" spokes={5} />
                  </g>
                  <Bearing x={SEC.x} y={SEC.y} r={10} />
                </g>

                {/* ---- LEVEL 2 · ESCAPEMENT (upper-right) ---- */}
                <g ref={gEscape}>
                  <g ref={escWG}>
                    {Array.from({ length: 15 }).map((_, i) => {
                      const a = (i / 15) * 2 * Math.PI;
                      return (
                        <polygon key={i}
                          points={`${Math.cos(a) * ESC.r},${Math.sin(a) * ESC.r} ${Math.cos(a + 0.28) * (ESC.r - 6)},${Math.sin(a + 0.28) * (ESC.r - 6)} ${Math.cos(a + 0.1) * (ESC.r - 6)},${Math.sin(a + 0.1) * (ESC.r - 6)}`}
                          fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.7} />
                      );
                    })}
                    <circle r={ESC.r - 6} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <circle r={3.5} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
                  {/* locking anchor + pivot + small regulator */}
                  <g ref={anchorG}>
                    <path d="M-11 8 L0 -2 L11 8 M0 -2 L0 10" fill="none" stroke="var(--core-mid)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                    <circle r={2.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
                  <circle cx={ESC.x + 26} cy={ESC.y - 16} r={7} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <circle cx={ESC.x + 26} cy={ESC.y - 16} r={2} fill="var(--core-mid)" />
                </g>

                {/* ---- LEVEL 3 · GOVERNOR (top) ---- */}
                <g ref={gGovernor}>
                  <g ref={govSpinG}><Gear r={13} teeth={9} fill="var(--core-gear)" stroke="var(--core-line)" hub={false} /></g>
                  <circle cx={GOV.x} cy={GOV.y} r={4.5} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
                  {/* articulated arms + weighted balls */}
                  <line ref={armL} x1={GOV.x - 4} y1={GOV.y} x2={GOV.x - 16} y2={GOV.y + 38} stroke="var(--core-mid)" strokeWidth={4.5} strokeLinecap="round" />
                  <line ref={armR} x1={GOV.x + 4} y1={GOV.y} x2={GOV.x + 16} y2={GOV.y + 38} stroke="var(--core-mid)" strokeWidth={4.5} strokeLinecap="round" />
                  {/* lower links to sleeve */}
                  <line ref={linkL} x1={GOV.x - 16} y1={GOV.y + 38} x2={GOV.x - 5} y2={GOV.y + 50} stroke="var(--core-plate)" strokeWidth={3} strokeLinecap="round" />
                  <line ref={linkR} x1={GOV.x + 16} y1={GOV.y + 38} x2={GOV.x + 5} y2={GOV.y + 50} stroke="var(--core-plate)" strokeWidth={3} strokeLinecap="round" />
                  <circle ref={ballL} cx={GOV.x - 16} cy={GOV.y + 38} r={8.5} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.4} />
                  <circle ref={hlL} cx={GOV.x - 18.5} cy={GOV.y + 35.5} r={2.6} fill="var(--core-inv)" opacity={0.28} />
                  <circle ref={ballR} cx={GOV.x + 16} cy={GOV.y + 38} r={8.5} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.4} />
                  <circle ref={hlR} cx={GOV.x + 13.5} cy={GOV.y + 35.5} r={2.6} fill="var(--core-inv)" opacity={0.28} />
                  {/* adjustable collar / sleeve on the spindle */}
                  <g ref={sleeveG}>
                    <rect x={GOV.x - 11} y={-5} width={22} height={10} rx={3} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <circle ref={govLamp} cx={GOV.x} cy={0} r={2.4} fill="var(--core-crimson)" opacity={0.25} />
                  </g>
                </g>

                {/* ---- LEVEL 3 · PRIMARY DRIVE GEAR (center, on shaft) ---- */}
                <g ref={gPrimary}>
                  <circle cx={PRI.x} cy={PRI.y + 3} r={PRI.r + 4} fill="rgba(0,0,0,0.28)" />
                  <g ref={primaryG}>
                    <Gear r={PRI.r} teeth={16} fill="var(--core-gear)" stroke="var(--core-line)" spokes={4} />
                  </g>
                </g>

                {/* ---- LEVEL 2 · ECCENTRIC CAM + LINKAGE (lower-left) ---- */}
                <g ref={gCam}>
                  {/* vertical guide rail for the slider */}
                  <rect x={CAM.x - 4} y={336} width={8} height={30} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  {/* cam base + eccentric lobe */}
                  <circle cx={CAM.x} cy={CAM.y + 2.5} r={CAM.r + 2} fill="rgba(0,0,0,0.26)" />
                  <g ref={camG}>
                    <circle r={CAM.r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.5} />
                    <circle cx={4.5} cy={0} r={9} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.3} />
                    <circle r={4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.1} />
                    <circle cx={4.5} cy={0} r={2.4} fill="var(--core-deep)" />
                  </g>
                  {/* follower roller + push-rod */}
                  <circle ref={camRoller} cx={CAM.x} cy={CAM.y - CAM.r - 5} r={5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.3} />
                  <line ref={camRod} x1={CAM.x} y1={CAM.y - CAM.r - 9} x2={CAM.x} y2={CAM.y - CAM.r - 29} stroke="var(--core-mid)" strokeWidth={4} strokeLinecap="round" />
                  {/* slider block in the rail */}
                  <g ref={camSliderG}>
                    <rect x={CAM.x - 9} y={-6} width={18} height={12} rx={2.5} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.3} />
                    <circle cx={CAM.x} r={2.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
                </g>

                {/* ---- LEVEL 2 · OUTPUT GEAR + CRANK (lower-right) ---- */}
                <g ref={gOutput}>
                  <circle cx={OUT.x} cy={OUT.y + 3} r={OUT.r + 3} fill="rgba(0,0,0,0.26)" />
                  <g ref={outG}>
                    <circle r={OUT.r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={2} />
                    <circle r={OUT.r - 5} fill="none" stroke="var(--core-line)" strokeWidth={1} opacity={0.6} />
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const a = (i / 6) * 2 * Math.PI;
                      return <rect key={i} x={-3} y={-OUT.r + 7} width={6} height={OUT.r - 14} rx={2.5}
                        transform={`rotate(${(a * 180) / Math.PI})`} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.9} />;
                    })}
                    <circle r={9} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <circle cx={13} cy={0} r={4} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                  </g>
                  <Bearing x={OUT.x} y={OUT.y} r={6} />
                  {/* crank → connecting rod → slider on delivery rail */}
                  <rect x={408} y={OUT.y - 2.5} width={52} height={5} rx={2.5} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  <line ref={crankRod} x1={OUT.x + 13} y1={OUT.y} x2={430} y2={OUT.y} stroke="var(--core-mid)" strokeWidth={5} strokeLinecap="round" />
                  <g ref={outSliderG}>
                    <rect x={-8} y={-7} width={16} height={14} rx={3} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.3} />
                    <circle r={2.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
                </g>

                {/* ---- LEVEL 4 · CENTRAL DRIVE HUB (front) ---- */}
                <g ref={gHub}>
                  <circle cx={PRI.x} cy={PRI.y + 3} r={30} fill="rgba(0,0,0,0.3)" />
                  <circle cx={PRI.x} cy={PRI.y} r={30} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.8} />
                  {[0, 1, 2, 3].map((i) => {
                    const a = (i / 4) * 2 * Math.PI + 0.78;
                    return <Bolt key={i} x={PRI.x + 23 * Math.cos(a)} y={PRI.y + 23 * Math.sin(a)} deg={(a * 180) / Math.PI} />;
                  })}
                  {/* toothed drive collar (rotating) */}
                  <g ref={hubCollarG}>
                    <Gear r={18} teeth={11} fill="var(--core-gear)" stroke="var(--core-line)" hub={false} />
                  </g>
                  {/* retaining ring + bearing + layered cap */}
                  <circle cx={PRI.x} cy={PRI.y} r={13.5} fill="none" stroke="var(--core-mid)" strokeWidth={1.6} strokeDasharray="4 2.6" opacity={0.85} />
                  <Bearing x={PRI.x} y={PRI.y} r={9} />
                  {/* reserved central mount — future pointer attaches here */}
                  <circle cx={PRI.x} cy={PRI.y} r={6} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <rect x={PRI.x - 1.6} y={PRI.y - 8.5} width={3.2} height={5.5} fill="var(--core-deep)" />
                  <circle ref={hubLamp} cx={PRI.x} cy={PRI.y} r={2.4} fill="var(--core-crimson)" opacity={0.15} />
                </g>
              </svg>

              {/* ================= NINE DISCIPLINE NODES + INPUT COUPLINGS ================= */}
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full pointer-events-none">
                {disciplines.map((dis, i) => {
                  const [x1, y1] = polar(250, i * (360 / N));
                  const [x2, y2] = polar(226, i * (360 / N));
                  const [bx3, by3] = polar(226, i * (360 / N));
                  const awake = hoverIdx === i;
                  return (
                    <g key={dis.id}>
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth={4.5} strokeLinecap="round" />
                      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-mid)" strokeWidth={1.6} strokeLinecap="round" opacity={0.7} />
                      <g className={awake && !reduced ? "coupling-spin" : undefined} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                        <circle cx={bx3} cy={by3} r={6.5} fill="var(--core-deep)" stroke={awake ? "var(--core-crimson)" : "var(--core-line)"} strokeWidth={1.3}
                          strokeDasharray="3 2.2" style={{ transition: "stroke .3s ease" }} />
                      </g>
                      <circle cx={bx3} cy={by3} r={2.2} fill="var(--core-crimson)" opacity={awake ? 0.95 : 0.15} style={{ transition: "opacity .3s ease" }} />
                    </g>
                  );
                })}
              </svg>

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
                {hoverIdx !== null || locked
                  ? `TRANSMISSION — CORE/${d.num}`
                  : "ON STANDBY — PICK A NODE TO DISCOVER"}
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
