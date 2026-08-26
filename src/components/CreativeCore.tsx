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

/* angular position of node i — 0° at top, clockwise */
const angleOf = (i: number) => i * (360 / N);
const pt = (r: number, deg: number) => [C + r * Math.sin(deg * DEG), C - r * Math.cos(deg * DEG)] as const;
/* percent position for the HTML cartridges */
const pct = (i: number, r: number) => ({ x: 50 + r * Math.sin(angleOf(i) * DEG), y: 50 - r * Math.cos(angleOf(i) * DEG) });

const wrap = (d: number) => ((d + 180) % 360 + 360) % 360 - 180;
const ss = (x: number, a: number, b: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const spin = (dur: number, ccw = false): React.CSSProperties => ({
  animation: `${ccw ? "coreSpinCCW" : "coreSpinCW"} ${dur}s linear infinite`,
  transformBox: "fill-box",
  transformOrigin: "center",
});

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

export default function CreativeCore() {
  const { data } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hoverIdx;

  /* ---------- refs: interactive mechanisms ---------- */
  const rodGs = useRef<(SVGGElement | null)[]>([]);
  const jointGs = useRef<(SVGGElement | null)[]>([]);
  const clutchPins = useRef<(SVGRectElement | null)[]>([]);
  const portDots = useRef<(SVGCircleElement | null)[]>([]);
  const transLines = useRef<(SVGLineElement | null)[]>([]);
  const pointerG = useRef<SVGGElement>(null);
  const armScaleG = useRef<SVGGElement>(null);
  const escWheelG = useRef<SVGGElement>(null);
  const palletG = useRef<SVGGElement>(null);
  const heartG = useRef<SVGGElement>(null);

  const eng = useRef({
    t: 0, last: 0, raf: 0,
    ext: Array(N).fill(0), jointRot: Array(N).fill(0),
    pAngle: 0, pAngleV: 0, pExt: 0,
    escStep: 0, escAcc: 0, escA: 0, palletA: 0,
  });

  useEffect(() => {
    const e = eng.current;
    const loop = (t: number) => {
      const dt = Math.min(0.05, e.last ? (t - e.last) / 1000 : 0.016);
      e.last = t; e.t += dt;
      const hov = hoverRef.current;

      /* ---- connectors: mechanical extension / retraction per node ---- */
      for (let i = 0; i < N; i++) {
        const target = hov === i ? 1 : 0;
        const speed = target > e.ext[i] ? 7.5 : 5.5; /* engage slightly quicker, retract weighted */
        e.ext[i] += (target - e.ext[i]) * Math.min(1, dt * speed);
        const ex = e.ext[i];
        rodGs.current[i]?.setAttribute("transform", `translate(0 ${(-44 * (1 - ex)).toFixed(1)})`);
        if (!reduced) e.jointRot[i] += ex * (hov === i ? 300 : 90) * dt;
        jointGs.current[i]?.setAttribute("transform", `rotate(${(e.jointRot[i] % 360).toFixed(1)} 300 152)`);
        clutchPins.current[i]?.setAttribute("opacity", ss(ex, 0.55, 0.9).toFixed(2));
        portDots.current[i]?.setAttribute("fill", hov === i ? "var(--core-crimson)" : "var(--core-deep)");
        portDots.current[i]?.setAttribute("stroke", hov === i ? "var(--core-crimson)" : "var(--core-line)");
        transLines.current[i]?.setAttribute("opacity", (ex * 0.5).toFixed(2));
      }

      /* ---- articulated pointer: pivots from central axle, extends toward hovered node ---- */
      const hasTarget = hov !== null;
      if (hasTarget) {
        const dA = wrap(angleOf(hov as number) - e.pAngle);
        e.pAngleV += (dA * 30 - e.pAngleV * 8) * dt;
        e.pAngle += e.pAngleV * dt;
      } else {
        e.pAngleV *= Math.max(0, 1 - dt * 6);
        e.pAngle += e.pAngleV * dt;
      }
      e.pExt += ((hasTarget ? 1 : 0) - e.pExt) * Math.min(1, dt * 6);
      const k = 0.12 + 0.88 * e.pExt;
      pointerG.current?.setAttribute("transform", `rotate(${e.pAngle.toFixed(1)} ${C} ${C})`);
      armScaleG.current?.setAttribute("transform",
        `translate(${C} ${C}) scale(${k.toFixed(3)}) translate(${-C} ${-C})`);

      /* ---- escapement: LOCK → RELEASE → ADVANCE rhythm ---- */
      if (!reduced) {
        e.escAcc += dt;
        if (e.escAcc > 0.42) { e.escAcc -= 0.42; e.escStep++; }
        const escTarget = e.escStep * 15;
        e.escA += (escTarget - e.escA) * Math.min(1, dt * 16);
        escWheelG.current?.setAttribute("transform", `translate(362 246) rotate(${(e.escA % 360).toFixed(1)})`);
        const palTarget = e.escAcc < 0.2 ? 13 : -11;
        e.palletA += (palTarget - e.palletA) * Math.min(1, dt * 18);
        palletG.current?.setAttribute("transform", `translate(362 219) rotate(${e.palletA.toFixed(1)})`);
      }

      /* ---- core heart pulse ---- */
      if (!reduced) {
        const boost = hov !== null ? 0.05 : 0;
        const s = 1 + 0.05 * Math.sin(e.t * 2.2) + boost;
        heartG.current?.setAttribute("transform", `translate(${C} ${C}) scale(${s.toFixed(3)}) translate(${-C} ${-C})`);
      }

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
          title="WHAT I DO"
          desc="Nine disciplines feed one machine — direction, generation and story transmitted through a single clockwork engine."
          meta="09 MODULES · ONE ENGINE"
        />

        {/* ============ TWO-COLUMN SYSTEM — machine left, explanation right ============ */}
        <div className="mt-12 grid lg:grid-cols-[1.22fr_0.78fr] gap-12 lg:gap-14 xl:gap-16 items-center">
        <Reveal>
          <div className="relative mx-auto w-full max-w-[620px] aspect-square select-none">
            {/* ================= THE CLOCKWORK RADIAL ENGINE ================= */}
            <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">
              <defs>
                <filter id="softBlur" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="13" />
                </filter>
              </defs>

              {/* ---- cast shadow (machine sits above the surface) ---- */}
              <ellipse cx={C} cy={C + 26} rx={206} ry={196} fill="#000" opacity={0.22} filter="url(#softBlur)" />

              {/* ---- faint radial construction guides ---- */}
              <g opacity={0.5}>
                <circle cx={C} cy={C} r={258} fill="none" stroke="var(--core-line)" strokeWidth={0.6} opacity={0.28} />
                <circle cx={C} cy={C} r={236} fill="none" stroke="var(--core-line)" strokeWidth={0.5} opacity={0.18} strokeDasharray="2 6" />
                {Array.from({ length: N }).map((_, i) => {
                  const [x1, y1] = pt(228, angleOf(i));
                  const [x2, y2] = pt(252, angleOf(i));
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth={0.6} opacity={0.3} />;
                })}
              </g>

              {/* ---- OUTER STRUCTURAL HOUSING (stationary, thick machined rim) ---- */}
              <g>
                <circle cx={C} cy={C} r={214} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={2} />
                <circle cx={C} cy={C} r={214} fill="none" stroke="var(--core-inv)" strokeWidth={1} opacity={0.16} />
                <circle cx={C} cy={C} r={190} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.6} />
                {/* segmented metal sections: panel seams */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const [x1, y1] = pt(190, i * 30);
                  const [x2, y2] = pt(214, i * 30);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth={1} opacity={0.5} />;
                })}
                {/* recessed channel */}
                <circle cx={C} cy={C} r={202} fill="none" stroke="var(--core-deep)" strokeWidth={6} opacity={0.7} />
                <circle cx={C} cy={C} r={202} fill="none" stroke="var(--core-line)" strokeWidth={0.8} opacity={0.4} />
                {/* bolts + outer index teeth */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const [x, y] = pt(202, i * 30 + 15);
                  return <Bolt key={i} x={x} y={y} deg={i * 30} />;
                })}
                {Array.from({ length: 36 }).map((_, i) => {
                  const [x, y] = pt(214, i * 10);
                  return <rect key={i} x={x - 2.4} y={y - 2.4} width={4.8} height={4.8}
                    transform={`rotate(${i * 10} ${x} ${y})`} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.6} opacity={0.8} />;
                })}
              </g>

              {/* ---- RING A · first rotating index ring (CW, slow) with crimson indicator ---- */}
              <g>
                <circle cx={C} cy={C + 3} r={185} fill="rgba(0,0,0,0.28)" />
                <g style={spin(30)}>
                  <circle cx={C} cy={C} r={185} fill="var(--core-ring)" stroke="var(--core-line)" strokeWidth={1.6} />
                  <circle cx={C} cy={C} r={160} fill="var(--core-ring)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <circle cx={C} cy={C} r={172.5} fill="none" stroke="var(--core-deep)" strokeWidth={18} opacity={0.55} />
                  {/* indexing blocks */}
                  {Array.from({ length: 30 }).map((_, i) => {
                    const [x, y] = pt(172.5, i * 12);
                    const isInd = i === 0; /* the travelling crimson indicator */
                    return (
                      <g key={i} transform={`translate(${x} ${y}) rotate(${i * 12})`}>
                        <rect x={isInd ? -4.5 : -3.4} y={-9} width={isInd ? 9 : 6.8} height={18} rx={1.4}
                          fill={isInd ? "var(--core-crimson)" : "var(--core-mid)"}
                          stroke={isInd ? "var(--core-inv)" : "var(--core-line)"} strokeWidth={isInd ? 1.2 : 0.8} />
                        {!isInd && <rect x={-3.4} y={-9} width={6.8} height={3} rx={1} fill="var(--core-inv)" opacity={0.16} />}
                      </g>
                    );
                  })}
                </g>
              </g>

              {/* ---- RECESSED ENGINE CHAMBER ---- */}
              <g>
                <circle cx={C} cy={C} r={157} fill="var(--core-deep)" />
                <circle cx={C} cy={C} r={157} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={6} opacity={0.5} />
                <circle cx={C} cy={C} r={149} fill="none" stroke="rgba(0,0,0,0.22)" strokeWidth={2.5} />
                {/* radial grooves */}
                {[36, 108, 180, 252, 324].map((d) => {
                  const [x1, y1] = pt(146, d);
                  const [x2, y2] = pt(70, d);
                  return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.2)" strokeWidth={4.5} strokeLinecap="round" />;
                })}
              </g>

              {/* ---- RING B · second transmission ring (CCW, faster) ---- */}
              <g>
                <circle cx={C} cy={C + 2.5} r={148} fill="rgba(0,0,0,0.24)" />
                <g style={spin(17, true)}>
                  <circle cx={C} cy={C} r={148} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.5} />
                  <circle cx={C} cy={C} r={125} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <circle cx={C} cy={C} r={136.5} fill="none" stroke="var(--core-deep)" strokeWidth={15} opacity={0.6} />
                  {Array.from({ length: 24 }).map((_, i) => {
                    const [x, y] = pt(148, i * 15);
                    return <rect key={i} x={-4} y={-7} width={8} height={11} rx={1.2}
                      transform={`translate(${x} ${y}) rotate(${i * 15})`} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.7} />;
                  })}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const [x, y] = pt(130, i * 45 + 22.5);
                    return <rect key={i} x={-8} y={-3} width={16} height={6} rx={2}
                      transform={`translate(${x} ${y}) rotate(${i * 45 + 22.5})`} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.7} />;
                  })}
                </g>
              </g>

              {/* ---- node ports + radial transmission paths (static, align to nodes) ---- */}
              <g>
                {Array.from({ length: N }).map((_, i) => {
                  const [px1, py1] = pt(136, angleOf(i));
                  const [px2, py2] = pt(74, angleOf(i));
                  return (
                    <g key={i}>
                      <line ref={(el) => { transLines.current[i] = el; }} x1={px1} y1={py1} x2={px2} y2={py2}
                        stroke="var(--core-crimson)" strokeWidth={2.4} strokeLinecap="round" opacity={0} />
                      <circle ref={(el) => { portDots.current[i] = el; }} cx={px1} cy={py1} r={5.5}
                        fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.3} />
                    </g>
                  );
                })}
              </g>

              {/* ---- radial structural arms (mid-depth, varied) ---- */}
              <g>
                {[20, 92, 164, 236, 308].map((d, k) => (
                  <g key={d} transform={`rotate(${d} ${C} ${C})`}>
                    <rect x={C - (k % 2 ? 4 : 6)} y={C - 150} width={k % 2 ? 8 : 12} height={88} rx={3}
                      fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                    <rect x={C - (k % 2 ? 4 : 6)} y={C - 150} width={k % 2 ? 8 : 12} height={4} fill="var(--core-inv)" opacity={0.15} />
                    <Bolt x={C} y={C - 142} /><Bolt x={C} y={C - 70} />
                  </g>
                ))}
              </g>

              {/* ---- GEAR TRAIN (functional meshing, opposite directions, ratios) ---- */}
              <g>
                {/* drive shaft from central hub to the large gear */}
                <line x1={C} y1={C} x2={238} y2={348} stroke="var(--core-mid)" strokeWidth={7} strokeLinecap="round" opacity={0.85} />
                <line x1={C} y1={C} x2={238} y2={348} stroke="var(--core-inv)" strokeWidth={1.4} strokeLinecap="round" opacity={0.2} />
                {/* large gear — slow */}
                <circle cx={238} cy={351} r={53} fill="rgba(0,0,0,0.24)" />
                <g transform="translate(238 348)"><g style={spin(26)}><Gear r={50} teeth={16} spokes={5} /></g></g>
                {/* medium gear — meshes large, opposite, faster */}
                <circle cx={320} cy={351} r={35} fill="rgba(0,0,0,0.22)" />
                <g transform="translate(320 348)"><g style={spin(15, true)}><Gear r={32} teeth={12} spokes={4} /></g></g>
                {/* small gear — meshes medium, faster still */}
                <g transform="translate(356 312)"><g style={spin(9)}><Gear r={19} teeth={9} hub={false} /></g></g>
                <circle cx={356} cy={312} r={3} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
              </g>

              {/* ---- ESCAPEMENT (clockwork regulator) ---- */}
              <g>
                <circle cx={362} cy={248.5} r={23} fill="rgba(0,0,0,0.2)" />
                <g ref={escWheelG}>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const a = (i / 12) * 2 * Math.PI;
                    return <polygon key={i}
                      points={`${Math.cos(a) * 21},${Math.sin(a) * 21} ${Math.cos(a + 0.3) * 14},${Math.sin(a + 0.3) * 14} ${Math.cos(a + 0.12) * 14},${Math.sin(a + 0.12) * 14}`}
                      fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.7} />;
                  })}
                  <circle r={14} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <circle r={3.4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                </g>
                <g ref={palletG}>
                  <path d="M-10 7 L0 -2 L10 7 M0 -2 L0 9" fill="none" stroke="var(--core-mid)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
                  <circle r={2.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                </g>
              </g>

              {/* ---- CENTRAL DRIVE ASSEMBLY ---- */}
              <g>
                <circle cx={C} cy={C + 3} r={42} fill="rgba(0,0,0,0.3)" />
                <circle cx={C} cy={C} r={42} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.8} />
                {[0, 1, 2, 3].map((i) => {
                  const a = (i / 4) * 2 * Math.PI + 0.78;
                  return <Bolt key={i} x={C + 34 * Math.cos(a)} y={C + 34 * Math.sin(a)} deg={(a * 180) / Math.PI} />;
                })}
                <g transform={`translate(${C} ${C})`}><g style={spin(12, true)}><Gear r={28} teeth={14} spokes={4} /></g></g>
                <g transform="translate(341 300)"><g style={spin(7)}><Gear r={13} teeth={9} hub={false} /></g></g>
                <circle cx={341} cy={300} r={2.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />
                {/* central bearing + axle cap */}
                <circle cx={C} cy={C} r={11} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.3} />
                <circle cx={C} cy={C} r={11} fill="none" stroke="var(--core-line)" strokeWidth={0.9} strokeDasharray="2.5 2" opacity={0.8} />
              </g>

              {/* ---- NINE MECHANICAL CONNECTORS (node → joint → gear → housing) ---- */}
              <g>
                {Array.from({ length: N }).map((_, i) => (
                  <g key={i} transform={`rotate(${angleOf(i)} ${C} ${C})`}>
                    {/* mounting bracket on housing outer edge */}
                    <rect x={C - 8} y={C - 224} width={16} height={13} rx={2.5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                    {/* fixed sleeve */}
                    <rect x={C - 5.5} y={C - 212} width={11} height={23} rx={2.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <rect x={C - 5.5} y={C - 212} width={3} height={23} fill="var(--core-inv)" opacity={0.13} />
                    {/* telescoping rod + joint gear (extends on hover) */}
                    <g ref={(el) => { rodGs.current[i] = el; }}>
                      <rect x={C - 3} y={C - 204} width={6} height={57} rx={2.5} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
                      <rect x={C - 3} y={C - 204} width={2} height={57} fill="var(--core-inv)" opacity={0.2} />
                      <g ref={(el) => { jointGs.current[i] = el; }}>
                        <circle cx={C} cy={C - 148} r={9.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.3} />
                        {Array.from({ length: 8 }).map((_, k) => {
                          const a = (k / 8) * 2 * Math.PI;
                          return <rect key={k} x={-1.8} y={-12} width={3.6} height={4.4} rx={1}
                            transform={`translate(${C + 9.5 * Math.cos(a)} ${C - 148 + 9.5 * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
                            fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.6} />;
                        })}
                        <circle cx={C} cy={C - 148} r={3.4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                      </g>
                    </g>
                    {/* clutch pin at housing inner edge — lights on engagement */}
                    <rect ref={(el) => { clutchPins.current[i] = el; }} x={C - 4} y={C - 193} width={8} height={7} rx={1.5}
                      fill="var(--core-crimson)" opacity={0} />
                  </g>
                ))}
              </g>

              {/* ---- ARTICULATED MECHANICAL POINTER (pivots from central axle) ---- */}
              <g ref={pointerG}>
                <g ref={armScaleG}>
                  {/* articulated linkage: arm → joint → tip */}
                  <polygon points={`${C - 4},${C - 16} ${C + 4},${C - 16} ${C + 2.4},${C - 100} ${C - 2.4},${C - 100}`}
                    fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                  <line x1={C - 1.4} y1={C - 20} x2={C - 0.8} y2={C - 96} stroke="var(--core-inv)" strokeWidth={0.8} opacity={0.25} />
                  <circle cx={C} cy={C - 56} r={4.6} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                  <circle cx={C} cy={C - 56} r={1.6} fill="var(--core-deep)" />
                  {/* pointer tip */}
                  <polygon points={`${C},${C - 112} ${C + 5},${C - 100} ${C - 5},${C - 100}`} fill="var(--core-crimson)" />
                  <rect x={C - 5} y={C - 101} width={10} height={2.4} fill="var(--core-inv)" opacity={0.6} />
                </g>
              </g>

              {/* ---- central pivot gear (always spinning) + CORE HEART ---- */}
              <g transform={`translate(${C} ${C})`}><g style={spin(8)}><Gear r={7.5} teeth={8} hub={false} fill="var(--core-mid)" /></g></g>
              <g ref={heartG}>
                <circle cx={C} cy={C} r={3.2} fill="var(--core-crimson)" />
                <circle cx={C} cy={C} r={3.2} fill="none" stroke="var(--core-inv)" strokeWidth={0.7} opacity={0.5} />
              </g>
            </svg>

            {/* ================= NINE DISCIPLINE CARTRIDGES (name only) ================= */}
            {disciplines.map((dis, i) => {
              const { x, y } = pct(i, 41);
              const active = hoverIdx === i;
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
                      backgroundColor: active ? "var(--core-deep)" : "var(--core-plate)",
                      boxShadow: active
                        ? "inset 0 0 0 1.5px var(--core-crimson), 0 12px 26px -10px rgba(0,0,0,0.5)"
                        : "inset 0 0 0 1.5px color-mix(in srgb, var(--core-line) 70%, transparent), 0 6px 16px -8px rgba(0,0,0,0.35)",
                      transform: active ? "translateY(-3px) scale(1.05)" : "none",
                    }}>
                    {/* corner screws */}
                    <span className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--core-mid)" }} />
                    <span className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: "var(--core-mid)" }} />
                    {/* discipline name — two lines, nothing else */}
                    <span className="f-tech font-medium text-[11px] leading-[1.25] tracking-[0.08em] text-center transition-colors duration-300"
                      style={{ color: active ? "var(--core-inv)" : "var(--core-mid)" }}>
                      {SPLIT[i][0]}
                      <br />
                      {SPLIT[i][1]}
                    </span>
                    {/* lower indicator */}
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-[3px] rounded-sm transition-colors duration-300"
                      style={{ background: active ? "var(--core-crimson)" : "color-mix(in srgb, var(--core-mid) 40%, transparent)" }} />
                  </span>
                </button>
              );
            })}

            {/* bottom technical identifier */}
            <div className="absolute -bottom-9 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
              <span className="w-9 h-px bg-[var(--line)]" />
              RADIAL ENGINE — CORE/FUSION
              <span className="w-9 h-px bg-[var(--line)]" />
            </div>
          </div>
        </Reveal>

        {/* ============ RIGHT — WHAT I DO EDITORIAL CARD ============ */}
        <Reveal delay={0.12}>
          <div className="mat-outer mat-texture relative overflow-hidden"
            style={{
              clipPath: "polygon(22px 0, 100% 0, 100% calc(100% - 22px), calc(100% - 22px) 100%, 0 100%, 0 22px)",
              boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 20%, transparent)",
            }}>
            {/* registration marks */}
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crim-panel)" }} aria-hidden />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crim-panel)" }} aria-hidden />

            <div className="p-6 sm:p-8">
              {/* editorial opening */}
              <span className="f-mono text-[10px] tracking-[0.3em]" style={{ color: "var(--m-sub)" }}>WHAT I DO</span>
              <h3 className="f-display leading-[1.02] mt-3 text-[clamp(1.7rem,2.6vw,2.4rem)]" style={{ color: "var(--outer-ink)" }}>
                Nine disciplines.<br />
                <span style={{ color: "var(--crim-panel)" }}>One connected creative system.</span>
              </h3>
              <p className="mt-4 text-[13.5px] sm:text-[14px] leading-relaxed max-w-[52ch]" style={{ color: "var(--outer-ink)", opacity: 0.88 }}>
                I work across creative direction, visual development, generative AI, cinematic storytelling and
                AI-assisted production — connecting strategy, visual thinking and execution into structured creative workflows.
              </p>

              {/* disciplines — synced to the machine */}
              <div className="mt-7 pt-5" style={{ borderTop: "1px solid var(--m-line)" }}>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="f-mono text-[9px] tracking-[0.3em]" style={{ color: "var(--m-sub)" }}>DISCIPLINES</span>
                  <span className="f-mono text-[9px] tracking-[0.22em]" style={{ color: hoverIdx !== null ? "var(--crim-panel)" : "var(--m-sub)" }}>
                    {hoverIdx !== null ? `ENGAGED — ${disciplines[hoverIdx].num}` : "09 / STANDBY"}
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
                        <span className="h-px w-3 shrink-0 transition-all duration-300"
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
              <div className="mt-7 pt-5" style={{ borderTop: "1px solid var(--m-line)" }}>
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

              {/* card footer */}
              <div className="mt-7 pt-4 f-mono text-[8.5px] tracking-[0.26em] flex items-center justify-between"
                style={{ borderTop: "1px solid var(--m-line)", color: "var(--m-sub)" }}>
                <span>HOVER A DISCIPLINE — THE ENGINE RESPONDS</span>
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
