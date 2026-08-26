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

/* ================= fixed machine layout — vertical governor engine =================
   GOVERNOR → main shaft → FLYWHEEL A / CAMSHAFT → FLYWHEEL B / ESCAPEMENT →
   CLUTCH → TRANSMISSION HUB → LOWER OUTPUT. Pressure subsystem feeds the clutch. */
const GOV = { pivotY: 112, armLen: 52, ballR: 9 };
const FW_A = { x: 212, y: 224, r: 52 };
const FW_B = { x: 398, y: 342, r: 34 };
const CAM_Y = 250;
const ESC = { x: 300, y: 320, r: 21 };
const CLUTCH_Y = 366;
const HUB = { x: 300, y: 418, r: 34 };
const OUT = { x: 300, y: 500, r: 36 };
const CYL = { x: 205, y: 296, w: 26, h: 58 };
const GAUGE = { x: 205, y: 374, r: 16 };
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export default function CreativeCore() {
  const { data, theme } = useStore();
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

  /* ---- the engine: single integration loop drives every mechanism ---- */
  const gFrame = useRef<SVGGElement>(null);
  const gGov = useRef<SVGGElement>(null);
  const gMidA = useRef<SVGGElement>(null);
  const gMidB = useRef<SVGGElement>(null);
  const gHub = useRef<SVGGElement>(null);
  const gOut = useRef<SVGGElement>(null);
  /* governor */
  const govGearG = useRef<SVGGElement>(null);
  const armUL = useRef<SVGLineElement>(null);
  const armUR = useRef<SVGLineElement>(null);
  const linkLL = useRef<SVGLineElement>(null);
  const linkLR = useRef<SVGLineElement>(null);
  const ballL = useRef<SVGCircleElement>(null);
  const ballR = useRef<SVGCircleElement>(null);
  const hlL = useRef<SVGCircleElement>(null);
  const hlR = useRef<SVGCircleElement>(null);
  const sleeveG = useRef<SVGGElement>(null);
  const govLinkL = useRef<SVGLineElement>(null);
  const govLamp = useRef<SVGCircleElement>(null);
  /* flywheels + cam */
  const fwAG = useRef<SVGGElement>(null);
  const fwBG = useRef<SVGGElement>(null);
  const bevelA = useRef<SVGGElement>(null);
  const lobe1 = useRef<SVGCircleElement>(null);
  const lobe2 = useRef<SVGCircleElement>(null);
  const lobeArm1 = useRef<SVGLineElement>(null);
  const lobeArm2 = useRef<SVGLineElement>(null);
  const fol1G = useRef<SVGGElement>(null);
  const fol2G = useRef<SVGGElement>(null);
  /* escapement + clutch */
  const escWG = useRef<SVGGElement>(null);
  const anchorG = useRef<SVGGElement>(null);
  const clutchRotG = useRef<SVGGElement>(null);
  const clutchUpG = useRef<SVGGElement>(null);
  const clutchDnG = useRef<SVGGElement>(null);
  const clutchMark = useRef<SVGRectElement>(null);
  /* hub + output + pressure */
  const hubCollarG = useRef<SVGGElement>(null);
  const transG = useRef<SVGGElement>(null);
  const hubLamp = useRef<SVGCircleElement>(null);
  const outWG = useRef<SVGGElement>(null);
  const crankRod = useRef<SVGLineElement>(null);
  const sliderG = useRef<SVGGElement>(null);
  const needleG = useRef<SVGGElement>(null);
  const valveG = useRef<SVGGElement>(null);

  const eng = useRef({
    t: 0, last: 0, raf: 0,
    surgeAt: 6, surge: -1, env: 0, energy: 0,
    govSpin: 0, spread: 0.3,
    fwA: 0, fwB: 0, bevel: 0, cam: 0,
    escTimer: 0, escStep: 0, escA: 0, anchorA: 0,
    clutchA: 0, engage: 0.2,
    hub: 0, trans: 0, out: 0,
    recalT: -1, lastTheme: "",
  });
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hoverIdx;
  const themeRef = useRef(theme);
  themeRef.current = theme;

  const setT = (g: React.RefObject<SVGGElement | null>, tr: string) => g.current?.setAttribute("transform", tr);

  useEffect(() => {
    const e = eng.current;
    e.lastTheme = themeRef.current;

    if (reduced) {
      /* static assembled machine */
      [gFrame, gGov, gMidA, gMidB, gHub, gOut].forEach((g) => { g.current?.setAttribute("opacity", "1"); g.current?.setAttribute("transform", ""); });
      setT(govGearG, `translate(300 96) rotate(20)`);
      const armAng = (20 + 26 * 0.4) * DEG;
      const bx = Math.sin(armAng) * GOV.armLen, by = GOV.pivotY + Math.cos(armAng) * GOV.armLen;
      [[armUL, -1], [armUR, 1]].forEach(([g, s]) => {
        const ln = g as React.RefObject<SVGLineElement>;
        ln.current?.setAttribute("x1", String(300 + (s as number) * 4)); ln.current?.setAttribute("y1", String(GOV.pivotY));
        ln.current?.setAttribute("x2", String(300 + (s as number) * bx)); ln.current?.setAttribute("y2", String(by));
      });
      [[ballL, hlL, -1], [ballR, hlR, 1]].forEach(([b, h, s]) => {
        (b as React.RefObject<SVGCircleElement>).current?.setAttribute("cx", String(300 + (s as number) * bx));
        (b as React.RefObject<SVGCircleElement>).current?.setAttribute("cy", String(by));
        (h as React.RefObject<SVGCircleElement>).current?.setAttribute("cx", String(300 + (s as number) * bx - 3));
        (h as React.RefObject<SVGCircleElement>).current?.setAttribute("cy", String(by - 3));
      });
      setT(sleeveG, `translate(0 ${by + 22})`);
      return;
    }

    const loop = (t: number) => {
      const dt = Math.min(0.05, e.last ? (t - e.last) / 1000 : 0.016);
      e.last = t; e.t += dt;

      /* 10-second mechanical surge — pressure build, ~1s peak, decay */
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
      e.energy += (1 - e.energy) * Math.min(1, dt * 1.1); /* spin-up: engage → accelerate → run */

      /* theme recalibration — machine slows, retracts, re-seats */
      if (themeRef.current !== e.lastTheme) { e.lastTheme = themeRef.current; e.recalT = 0.0001; }
      let sep = 0;
      if (e.recalT > 0) {
        e.recalT += dt;
        sep = e.recalT < 1.4 ? Math.sin(Math.PI * (e.recalT / 1.4)) : 0;
        if (e.recalT >= 1.4) e.recalT = -1;
      }
      const recalScale = 1 - 0.85 * sep;

      /* hover wakes the section the node feeds */
      const h = hoverRef.current;
      const bTop = h !== null && h <= 2 ? 0.4 : 0;
      const bMid = h !== null && h >= 3 && h <= 5 ? 0.4 : 0;
      const bLow = h !== null && h >= 6 ? 0.4 : 0;
      const hoverAny = h !== null ? 0.2 : 0;

      const mTop = e.energy * (1 + 1.6 * env + hoverAny + bTop) * recalScale;
      const mMid = e.energy * (1 + 1.6 * env + hoverAny + bMid) * recalScale;
      const mLow = e.energy * (1 + 1.6 * env + hoverAny + bLow) * recalScale;

      /* ---- governor: spin + centrifugal spread ---- */
      e.govSpin += (95 + 150 * env) * mTop * dt;
      const spreadTarget = clamp01((mTop - 0.35) / 1.15) * (0.5 + 0.5 * clamp01(0.35 + env));
      e.spread += (spreadTarget - e.spread) * Math.min(1, dt * 2.4);
      const armAng = (20 + 26 * e.spread) * DEG;
      const bx = Math.sin(armAng) * GOV.armLen;
      const by = GOV.pivotY + Math.cos(armAng) * GOV.armLen;
      const wob = Math.cos(e.govSpin * DEG) * 5;
      const near = Math.sin(e.govSpin * DEG);
      const slY = by + 22 - e.spread * 5;

      setT(govGearG, `translate(300 96) rotate(${(e.govSpin % 360).toFixed(1)})`);
      [[armUL, linkLL, ballL, hlL, -1], [armUR, linkLR, ballR, hlR, 1]].forEach(([ua, ll, bl, hlc, s]) => {
        const sgn = s as number;
        const X = 300 + sgn * bx + sgn * wob;
        const Y = by + near * 1.6;
        const scl = 1 + 0.06 * (sgn > 0 ? near : -near);
        (ua as React.RefObject<SVGLineElement>).current?.setAttribute("x2", X.toFixed(1));
        (ua as React.RefObject<SVGLineElement>).current?.setAttribute("y2", Y.toFixed(1));
        (ll as React.RefObject<SVGLineElement>).current?.setAttribute("x1", X.toFixed(1));
        (ll as React.RefObject<SVGLineElement>).current?.setAttribute("y1", Y.toFixed(1));
        (ll as React.RefObject<SVGLineElement>).current?.setAttribute("x2", String(300 + sgn * 9));
        (ll as React.RefObject<SVGLineElement>).current?.setAttribute("y2", slY.toFixed(1));
        (bl as React.RefObject<SVGCircleElement>).current?.setAttribute("cx", X.toFixed(1));
        (bl as React.RefObject<SVGCircleElement>).current?.setAttribute("cy", Y.toFixed(1));
        (bl as React.RefObject<SVGCircleElement>).current?.setAttribute("r", (GOV.ballR * scl).toFixed(2));
        (hlc as React.RefObject<SVGCircleElement>).current?.setAttribute("cx", (X - 3).toFixed(1));
        (hlc as React.RefObject<SVGCircleElement>).current?.setAttribute("cy", (Y - 3).toFixed(1));
      });
      setT(sleeveG, `translate(0 ${slY.toFixed(1)})`);
      govLinkL.current?.setAttribute("y1", (slY + 6).toFixed(1));
      govLamp.current?.setAttribute("opacity", (0.25 + env * 0.75).toFixed(2));

      /* ---- flywheels + bevel + camshaft ---- */
      e.fwA -= 46 * mMid * dt;
      e.fwB += 64 * mMid * dt;
      e.bevel -= 80 * mMid * dt;
      e.cam += 55 * mMid * dt;
      setT(fwAG, `translate(${FW_A.x} ${FW_A.y}) rotate(${(e.fwA % 360).toFixed(1)})`);
      setT(fwBG, `translate(${FW_B.x} ${FW_B.y}) rotate(${(e.fwB % 360).toFixed(1)})`);
      setT(bevelA, `translate(300 224) rotate(${(e.bevel % 360).toFixed(1)})`);
      const camRad = e.cam * DEG;
      [[lobe1, lobeArm1, fol1G, 348, 0], [lobe2, lobeArm2, fol2G, 392, 2.1]].forEach(([lb, la, fol, lx, ph]) => {
        const lxx = (lx as number) + 4.5 * Math.cos(camRad + (ph as number));
        const lyy = CAM_Y + 4.5 * Math.sin(camRad + (ph as number));
        (lb as React.RefObject<SVGCircleElement>).current?.setAttribute("cx", lxx.toFixed(1));
        (lb as React.RefObject<SVGCircleElement>).current?.setAttribute("cy", lyy.toFixed(1));
        (la as React.RefObject<SVGLineElement>).current?.setAttribute("x2", lxx.toFixed(1));
        (la as React.RefObject<SVGLineElement>).current?.setAttribute("y2", lyy.toFixed(1));
        const lift = 4.5 * Math.sin(camRad + (ph as number));
        (fol as React.RefObject<SVGGElement>).current?.setAttribute("transform", `translate(0 ${lift.toFixed(1)})`);
      });

      /* ---- escapement: tick → release → lock ---- */
      e.escTimer += dt * (0.6 + 1.4 * env) * mMid;
      if (e.escTimer > 0.5) { e.escTimer -= 0.5; e.escStep++; }
      const escTarget = e.escStep * 24;
      e.escA += (escTarget - e.escA) * Math.min(1, dt * 14);
      e.anchorA += (((e.escStep % 2 === 0 ? 13 : -13)) - e.anchorA) * Math.min(1, dt * 16);
      setT(escWG, `translate(${ESC.x} ${ESC.y}) rotate(${e.escA.toFixed(1)})`);
      setT(anchorG, `translate(${ESC.x} ${ESC.y - 26}) rotate(${e.anchorA.toFixed(1)})`);

      /* ---- clutch: plates approach, teeth align, lock under load ---- */
      const engageTarget = clamp01(0.2 + env * 0.8 + (h !== null ? 0.45 : 0) - sep);
      e.engage += (engageTarget - e.engage) * Math.min(1, dt * 3.2);
      const gap = 8 * (1 - e.engage);
      if (e.engage > 0.75) e.clutchA += 30 * mLow * dt;
      setT(clutchRotG, `rotate(${(e.clutchA % 360).toFixed(1)} ${HUB.x} ${CLUTCH_Y})`);
      setT(clutchUpG, `translate(0 ${(-gap / 2).toFixed(1)})`);
      setT(clutchDnG, `translate(0 ${(gap / 2).toFixed(1)})`);
      clutchMark.current?.setAttribute("opacity", clamp01((e.engage - 0.7) / 0.3).toFixed(2));

      /* ---- transmission hub + output ---- */
      e.hub += 24 * mLow * dt;
      e.trans -= 70 * mLow * dt;
      e.out += 38 * mLow * dt;
      setT(hubCollarG, `translate(${HUB.x} ${HUB.y}) rotate(${(e.hub % 360).toFixed(1)})`);
      setT(transG, `translate(${HUB.x + 42} ${HUB.y + 14}) rotate(${(e.trans % 360).toFixed(1)})`);
      hubLamp.current?.setAttribute("opacity", clamp01(0.15 + env * 0.85 + (h !== null ? 0.2 : 0)).toFixed(2));
      setT(outWG, `translate(${OUT.x} ${OUT.y}) rotate(${(e.out % 360).toFixed(1)})`);
      const outRad = e.out * DEG;
      const px = OUT.x + 13 * Math.cos(outRad), py = OUT.y + 13 * Math.sin(outRad);
      const sx = 372 + 20 * Math.sin(outRad);
      crankRod.current?.setAttribute("x1", px.toFixed(1)); crankRod.current?.setAttribute("y1", py.toFixed(1));
      crankRod.current?.setAttribute("x2", sx.toFixed(1)); crankRod.current?.setAttribute("y2", String(OUT.y));
      setT(sliderG, `translate(${sx.toFixed(1)} ${OUT.y})`);

      /* ---- pressure subsystem ---- */
      const pressure = clamp01(0.3 + 0.7 * env + (h !== null ? 0.15 : 0));
      needleG.current?.setAttribute("transform",
        `rotate(${(-52 + 104 * pressure + Math.sin(e.t * 2.1) * 3).toFixed(1)} ${GAUGE.x} ${GAUGE.y})`);
      valveG.current?.setAttribute("transform", `translate(0 ${(-env * 3.2).toFixed(2)})`);

      /* ---- assembly / recalibration layer motion ---- */
      const prog = (delay: number) => clamp01((e.t - delay) / 0.45);
      const layers: [React.RefObject<SVGGElement | null>, number, number, number][] = [
        [gFrame, 0, 0, 0],
        [gGov, 0.35, 0, -12],
        [gMidA, 0.5, -10, 0],
        [gMidB, 0.65, 10, 0],
        [gHub, 0.8, 0, 8],
        [gOut, 0.95, 0, 14],
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

  const clutchTeeth = (y: number, dir: 1 | -1) => (
    <>
      {[-18, -9, 0, 9, 18].map((x) => (
        <rect key={x} x={HUB.x + x - 3} y={y} width={6} height={4.5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.8}
          transform={dir === -1 ? undefined : undefined} />
      ))}
    </>
  );

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
          {/* ==================== THE STEAM GOVERNOR ENGINE ==================== */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">

                {/* ---- STRUCTURAL FRAME + BACK PLATE (stationary chassis) ---- */}
                <g ref={gFrame}>
                  {/* recessed back panel */}
                  <rect x={162} y={60} width={276} height={480} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.4} />
                  <rect x={162} y={60} width={276} height={480} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth={5} opacity={0.5} />
                  {[210, 300, 390].map((x) => (
                    <line key={x} x1={x} y1={70} x2={x} y2={530} stroke="rgba(0,0,0,0.18)" strokeWidth={2} />
                  ))}
                  {/* vertical rails */}
                  {[150, 450].map((x) => (
                    <g key={x}>
                      <rect x={x - 5} y={48} width={10} height={504} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.4} />
                      <rect x={x - 5} y={48} width={2.4} height={504} fill="var(--core-inv)" opacity={0.14} />
                      {[110, 230, 350, 470].map((y) => <Bolt key={y} x={x} y={y} />)}
                    </g>
                  ))}
                  {/* top + bottom cross members */}
                  <rect x={145} y={40} width={310} height={13} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.4} />
                  <rect x={145} y={40} width={310} height={3} fill="var(--core-inv)" opacity={0.14} />
                  <rect x={145} y={547} width={310} height={13} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.4} />
                  {[160, 440].map((x) => <Bolt key={x} x={x} y={46.5} />)}
                  {[160, 440].map((x) => <Bolt key={x} x={x} y={553.5} />)}
                  {/* side mounting plates */}
                  <rect x={136} y={288} width={19} height={46} rx={2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <rect x={445} y={288} width={19} height={46} rx={2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <Bolt x={145.5} y={297} /><Bolt x={145.5} y={325} />
                  <Bolt x={454.5} y={297} /><Bolt x={454.5} y={325} />
                  {/* shaft bearing mounts through frame */}
                  <Bearing x={300} y={50} r={8} />
                  <Bearing x={300} y={550} r={9} />
                </g>

                {/* ---- GOVERNOR (top) ---- */}
                <g ref={gGov}>
                  {/* main vertical drive shaft (runs the full height) */}
                  <rect x={295.5} y={96} width={9} height={408} rx={4} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <rect x={297.5} y={100} width={1.8} height={400} fill="var(--core-inv)" opacity={0.25} />
                  {[178, 224, 342, 470].map((y) => (
                    <rect key={y} x={292} y={y - 3.5} width={16} height={7} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  ))}
                  {/* upper drive gear + spindle cap */}
                  <g ref={govGearG}><Gear r={14} teeth={9} fill="var(--core-gear)" stroke="var(--core-line)" hub={false} /></g>
                  <circle cx={300} cy={96} r={4.5} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
                  {/* pivot cross */}
                  <rect x={288} y={GOV.pivotY - 3} width={24} height={6} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.1} />
                  {/* articulated arms + weighted balls */}
                  <line ref={armUL} x1={296} y1={GOV.pivotY} x2={280} y2={160} stroke="var(--core-mid)" strokeWidth={5} strokeLinecap="round" />
                  <line ref={armUR} x1={304} y1={GOV.pivotY} x2={320} y2={160} stroke="var(--core-mid)" strokeWidth={5} strokeLinecap="round" />
                  <line ref={linkLL} x1={280} y1={160} x2={291} y2={180} stroke="var(--core-plate)" strokeWidth={3.4} strokeLinecap="round" />
                  <line ref={linkLR} x1={320} y1={160} x2={309} y2={180} stroke="var(--core-plate)" strokeWidth={3.4} strokeLinecap="round" />
                  <circle ref={ballL} cx={280} cy={160} r={GOV.ballR} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.4} />
                  <circle ref={hlL} cx={277} cy={157} r={3} fill="var(--core-inv)" opacity={0.28} />
                  <circle ref={ballR} cx={320} cy={160} r={GOV.ballR} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.4} />
                  <circle ref={hlR} cx={317} cy={157} r={3} fill="var(--core-inv)" opacity={0.28} />
                  {/* adjustable collar / sleeve on the spindle */}
                  <g ref={sleeveG}>
                    <rect x={289} y={-5} width={22} height={10} rx={3} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <circle ref={govLamp} cx={300} cy={0} r={2.5} fill="var(--core-crimson)" opacity={0.25} />
                  </g>
                  <line ref={govLinkL} x1={300} y1={186} x2={300} y2={178} stroke="var(--core-line)" strokeWidth={2} opacity={0.6} />
                </g>

                {/* ---- MID-A · FLYWHEEL A + CAMSHAFT + PRESSURE (left) ---- */}
                <g ref={gMidA}>
                  {/* bevel pinion + stub shaft to flywheel A */}
                  <Shaft x1={295} y1={224} x2={FW_A.x + FW_A.r - 6} y2={224} w={7} />
                  <g ref={bevelA}><Gear r={10} teeth={8} fill="var(--core-mid)" stroke="var(--core-line)" hub={false} /></g>
                  {/* flywheel A — spoked, heavy rim */}
                  <circle cx={FW_A.x} cy={FW_A.y + 3} r={FW_A.r + 3} fill="rgba(0,0,0,0.26)" />
                  <g ref={fwAG}>
                    <circle r={FW_A.r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={2} />
                    <circle r={FW_A.r - 6} fill="none" stroke="var(--core-line)" strokeWidth={1} opacity={0.6} />
                    {[0, 1, 2, 3, 4].map((i) => {
                      const a = (i / 5) * 2 * Math.PI;
                      return <rect key={i} x={-3.5} y={-FW_A.r + 8} width={7} height={FW_A.r - 16} rx={3}
                        transform={`rotate(${(a * 180) / Math.PI})`} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />;
                    })}
                    <circle r={12} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.3} />
                    <circle r={16.5} fill="none" stroke="var(--core-mid)" strokeWidth={3} opacity={0.5} />
                  </g>
                  <Bearing x={FW_A.x} y={FW_A.y} r={7} />

                  {/* camshaft with eccentric lobes + followers */}
                  <Shaft x1={305} y1={CAM_Y} x2={432} y2={CAM_Y} w={6} />
                  <line ref={lobeArm1} x1={348} y1={CAM_Y} x2={352} y2={CAM_Y} stroke="var(--core-deep)" strokeWidth={3} />
                  <line ref={lobeArm2} x1={392} y1={CAM_Y} x2={396} y2={CAM_Y} stroke="var(--core-deep)" strokeWidth={3} />
                  <circle ref={lobe1} cx={352} cy={CAM_Y} r={9} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.3} />
                  <circle ref={lobe2} cx={396} cy={CAM_Y} r={9} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.3} />
                  {/* followers: tappet + rod through a fixed guide */}
                  {[348, 392].map((x, k) => (
                    <g key={x}>
                      <g ref={k === 0 ? fol1G : fol2G}>
                        <rect x={x - 8} y={CAM_Y - 21} width={16} height={6} rx={2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                        <rect x={x - 2} y={CAM_Y - 15} width={4} height={30} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={0.9} />
                        <circle cx={x} cy={CAM_Y + 17} r={3.4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                      </g>
                      <rect x={x - 10} y={CAM_Y + 4} width={20} height={7} rx={2} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                    </g>
                  ))}

                  {/* pressure cylinder + valve + gauge */}
                  <rect x={CYL.x + 2} y={CYL.y + 2.5} width={CYL.w} height={CYL.h} rx={5} fill="rgba(0,0,0,0.26)" />
                  <rect x={CYL.x} y={CYL.y} width={CYL.w} height={CYL.h} rx={5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.3} />
                  <rect x={CYL.x + 6} y={CYL.y + 8} width={CYL.w - 12} height={CYL.h - 16} rx={3} fill="var(--core-deep)" opacity={0.75} />
                  <g ref={valveG}>
                    <rect x={CYL.x + 9} y={CYL.y - 10} width={8} height={11} rx={2} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.1} />
                    <rect x={CYL.x + 11.5} y={CYL.y - 15} width={3} height={6} rx={1.2} fill="var(--core-crimson)" />
                  </g>
                  <line x1={CYL.x + CYL.w} y1={CYL.y + 18} x2={293} y2={CLUTCH_Y - 14} stroke="var(--core-line)" strokeWidth={3.2} strokeLinecap="round" />
                  <line x1={CYL.x + CYL.w} y1={CYL.y + 18} x2={293} y2={CLUTCH_Y - 14} stroke="var(--core-mid)" strokeWidth={1.5} strokeLinecap="round" />
                  <circle cx={GAUGE.x} cy={GAUGE.y + 2} r={GAUGE.r} fill="rgba(0,0,0,0.26)" />
                  <circle cx={GAUGE.x} cy={GAUGE.y} r={GAUGE.r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.4} />
                  <circle cx={GAUGE.x} cy={GAUGE.y} r={GAUGE.r - 4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />
                  {[-60, -30, 0, 30, 60].map((a) => (
                    <line key={a} x1={GAUGE.x} y1={GAUGE.y - GAUGE.r + 6} x2={GAUGE.x} y2={GAUGE.y - GAUGE.r + 8.5}
                      stroke="var(--core-inv)" strokeWidth={1} opacity={0.7} transform={`rotate(${a} ${GAUGE.x} ${GAUGE.y})`} />
                  ))}
                  <g ref={needleG}>
                    <line x1={GAUGE.x} y1={GAUGE.y + 2} x2={GAUGE.x} y2={GAUGE.y - GAUGE.r + 5.5} stroke="var(--core-crimson)" strokeWidth={1.7} strokeLinecap="round" />
                  </g>
                  <circle cx={GAUGE.x} cy={GAUGE.y} r={2.2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
                </g>

                {/* ---- MID-B · FLYWHEEL B + ESCAPEMENT (right/center) ---- */}
                <g ref={gMidB}>
                  <Shaft x1={305} y1={FW_B.y} x2={FW_B.x - FW_B.r + 5} y2={FW_B.y} w={6} />
                  {/* flywheel B — solid disc with lightening holes */}
                  <circle cx={FW_B.x} cy={FW_B.y + 3} r={FW_B.r + 3} fill="rgba(0,0,0,0.26)" />
                  <g ref={fwBG}>
                    <circle r={FW_B.r} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.8} />
                    {[0, 1, 2, 3].map((i) => {
                      const a = (i / 4) * 2 * Math.PI + 0.4;
                      return <circle key={i} cx={FW_B.r * 0.55 * Math.cos(a)} cy={FW_B.r * 0.55 * Math.sin(a)} r={5}
                        fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />;
                    })}
                    <circle r={9} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
                  </g>
                  <Bearing x={FW_B.x} y={FW_B.y} r={6} />

                  {/* escapement — escape wheel + locking anchor */}
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
                  <g ref={anchorG}>
                    <path d="M-11 8 L0 -2 L11 8 M0 -2 L0 10" fill="none" stroke="var(--core-mid)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                    <circle r={2.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
                </g>

                {/* ---- CENTRAL TRANSMISSION HUB + CLUTCH ---- */}
                <g ref={gHub}>
                  {/* clutch — two toothed plates that approach and lock */}
                  <g ref={clutchRotG}>
                    <g ref={clutchUpG}>
                      <rect x={HUB.x - 24} y={CLUTCH_Y - 11} width={48} height={8} rx={2.5} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.2} />
                      {clutchTeeth(CLUTCH_Y - 3, 1)}
                    </g>
                    <g ref={clutchDnG}>
                      {[-13.5, -4.5, 4.5, 13.5].map((x) => (
                        <rect key={x} x={HUB.x + x - 3} y={CLUTCH_Y - 1.5} width={6} height={4.5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.8} />
                      ))}
                      <rect x={HUB.x - 24} y={CLUTCH_Y + 3} width={48} height={8} rx={2.5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                    </g>
                    <rect ref={clutchMark} x={HUB.x + 26} y={CLUTCH_Y - 4} width={5} height={8} rx={1.5} fill="var(--core-crimson)" opacity={0} />
                  </g>

                  {/* hub housing → bearing → toothed drive collar → shaft → status hub */}
                  <circle cx={HUB.x} cy={HUB.y + 3} r={HUB.r} fill="rgba(0,0,0,0.3)" />
                  <circle cx={HUB.x} cy={HUB.y} r={HUB.r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.8} />
                  {[0, 1, 2, 3].map((i) => {
                    const [bx2, by2] = polar(0, 0);
                    void bx2; void by2;
                    const a = (i / 4) * 2 * Math.PI + 0.78;
                    return <Bolt key={i} x={HUB.x + (HUB.r - 8) * Math.cos(a)} y={HUB.y + (HUB.r - 8) * Math.sin(a)} deg={(a * 180) / Math.PI} />;
                  })}
                  <g ref={hubCollarG}>
                    <Gear r={26} teeth={14} fill="var(--core-gear)" stroke="var(--core-line)" spokes={4} />
                  </g>
                  <Bearing x={HUB.x} y={HUB.y} r={11} />
                  {/* reserved central mount — future pointer attaches here */}
                  <circle cx={HUB.x} cy={HUB.y} r={6.5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <rect x={HUB.x - 1.7} y={HUB.y - 9} width={3.4} height={6} fill="var(--core-deep)" />
                  <circle ref={hubLamp} cx={HUB.x} cy={HUB.y} r={2.6} fill="var(--core-crimson)" opacity={0.15} />
                  {/* small transfer gear */}
                  <g ref={transG}><Gear r={12} teeth={9} fill="var(--core-mid)" stroke="var(--core-line)" hub={false} /></g>
                  <circle cx={HUB.x + 42} cy={HUB.y + 14} r={3} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                </g>

                {/* ---- LOWER OUTPUT MECHANISM ---- */}
                <g ref={gOut}>
                  <circle cx={OUT.x} cy={OUT.y + 3} r={OUT.r + 3} fill="rgba(0,0,0,0.26)" />
                  <g ref={outWG}>
                    <circle r={OUT.r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={2} />
                    <circle r={OUT.r - 5} fill="none" stroke="var(--core-line)" strokeWidth={1} opacity={0.6} />
                    {[0, 1, 2, 3, 4, 5].map((i) => {
                      const a = (i / 6) * 2 * Math.PI;
                      return <rect key={i} x={-3} y={-OUT.r + 7} width={6} height={OUT.r - 14} rx={2.5}
                        transform={`rotate(${(a * 180) / Math.PI})`} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.9} />;
                    })}
                    <circle r={10} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.2} />
                    {/* crank pin */}
                    <circle cx={13} cy={0} r={4} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                  </g>
                  <Bearing x={OUT.x} cy={OUT.y} r={6} />
                  {/* crank → connecting rod → slider on a delivery rail */}
                  <line ref={crankRod} x1={OUT.x + 13} y1={OUT.y} x2={372} y2={OUT.y} stroke="var(--core-mid)" strokeWidth={5.5} strokeLinecap="round" />
                  <rect x={344} y={OUT.y - 2.5} width={96} height={5} rx={2.5} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  <g ref={sliderG}>
                    <rect x={-9} y={-8} width={18} height={16} rx={3} fill="var(--core-gear)" stroke="var(--core-line)" strokeWidth={1.3} />
                    <circle r={3} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  </g>
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
