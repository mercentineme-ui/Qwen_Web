import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

/* machined gear drawn at origin — caller translates/rotates */
function GearShape({ r, teeth, fill = "var(--core-plate)", stroke = "var(--core-line)", hub = true, spokes = 0 }: {
  r: number; teeth: number; fill?: string; stroke?: string; hub?: boolean; spokes?: number;
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

/* contact shadow — grounds a component on the plate below it */
function Drop({ cx, cy, rx, ry = 4 }: { cx: number; cy: number; rx: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity="0.18" />;
}

/* two-line radial label system — forced line breaks + placement side, zero overlap */
const LBL: { lines: [string, string]; side: "above" | "right" | "left" }[] = [
  { lines: ["CREATIVE", "DIRECTION"], side: "above" },
  { lines: ["GENERATIVE", "AI"], side: "right" },
  { lines: ["VISUAL", "DEVELOPMENT"], side: "right" },
  { lines: ["CINEMATIC", "STORYTELLING"], side: "right" },
  { lines: ["AI IMAGE +", "VIDEO"], side: "right" },
  { lines: ["CHARACTER", "DEVELOPMENT"], side: "left" },
  { lines: ["ENVIRONMENT", "DESIGN"], side: "left" },
  { lines: ["AI CREATIVE", "WORKFLOWS"], side: "left" },
  { lines: ["PROMPT", "ARCHITECTURE"], side: "left" },
];

/* ============================================================
   RADIAL CLOCKWORK ENGINE — geometry (viewBox 600, center 300)
   ============================================================ */
const C = 300;
const CON_OUT = 232;      // connector outer (meets capability module)
const CON_IN = 207;       // connector inner (meets housing)
const HSG_OUT = 205;      // outer housing outer edge
const HSG_IN = 170;       // outer housing inner edge
const IDX_OUT = 166;      // index segment ring outer
const IDX_IN = 148;       // index segment ring inner
const CHAMBER = 146;      // recessed chamber floor boundary
const SEG_COUNT = 36;     // index segments (capability i → segment i*4)

/* one physical connector, drawn pointing "up"; caller rotates to capability angle */
function Connector({ on, sigKey, reduced }: { on: boolean; sigKey: number; reduced: boolean }) {
  const hot = on ? "var(--core-crimson)" : "var(--core-line)";
  return (
    <g>
      {/* attachment bracket at the module */}
      <rect x={C - 12} y={C - CON_OUT - 4} width="24" height="9" rx="2"
        fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
      <circle cx={C - 8} cy={C - CON_OUT + 0.5} r="1.5" fill="var(--core-line)" />
      <circle cx={C + 8} cy={C - CON_OUT + 0.5} r="1.5" fill="var(--core-line)" />
      {/* short drive shaft */}
      <rect x={C - 3.5} y={C - CON_OUT + 5} width="7" height={CON_OUT - CON_IN - 14} rx="2"
        fill="var(--core-deep)" stroke={hot} strokeWidth={on ? 1.3 : 1} style={{ transition: "stroke .35s ease" }} />
      {/* coupling joint */}
      <circle cx={C} cy={C - (CON_OUT + CON_IN) / 2} r="7.5" fill="var(--core-plate)" stroke={hot} strokeWidth="1.4" style={{ transition: "stroke .35s ease" }} />
      <circle cx={C} cy={C - (CON_OUT + CON_IN) / 2} r="2.6" fill={on ? "var(--core-crimson)" : "var(--core-line)"} style={{ transition: "fill .35s ease" }} />
      {/* gear interface teeth where it meets the housing */}
      <g transform={`translate(${C} ${C - CON_IN + 2})`}>
        <GearShape r={9} teeth={7} fill="var(--core-deep)" stroke={hot} hub={false} />
      </g>
      {/* inward mechanical signal — travels capability → housing */}
      {on && !reduced && (
        <>
          <circle key={`in-${sigKey}`} cx={C} cy={C - CON_OUT + 6} r="3.4" fill="var(--core-crimson)">
            <animateMotion dur="0.7s" repeatCount="1" path={`M0,0 L0,${CON_OUT - CON_IN - 8}`} />
          </circle>
          {/* outward feedback — core → capability */}
          <circle key={`out-${sigKey}`} cx={C} cy={C - CON_IN - 2} r="2.4" fill="var(--core-crimson)" opacity="0.45">
            <animateMotion dur="0.8s" begin="0.75s" repeatCount="1" path={`M0,0 L0,-${CON_OUT - CON_IN - 8}`} />
          </circle>
        </>
      )}
    </g>
  );
}

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const N = disciplines.length;
  const reduced = useReducedMotion();

  /* ---- state: auto-demonstration + hover preview + click lock ---- */
  const [autoIdx, setAutoIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const locked = lockedIdx !== null;
  const sel = hoverIdx ?? lockedIdx ?? autoIdx;
  const d = disciplines[sel];
  const nodeAngle = (i: number) => i * (360 / N);

  /* 20s automatic demonstration — pauses while the user hovers or locks */
  useEffect(() => {
    if (reduced || locked || hoverIdx !== null) return;
    const iv = window.setInterval(() => setAutoIdx((a) => (a + 1) % N), 20000);
    return () => clearInterval(iv);
  }, [reduced, locked, hoverIdx, N]);

  const pick = (i: number) => {
    if (locked && lockedIdx === i) { setLockedIdx(null); setAutoIdx(i); }
    else setLockedIdx(i);
  };

  /* signal key — re-triggers the travel pulse on every selection change */
  const [sigKey, setSigKey] = useState(0);
  useEffect(() => { setSigKey((k) => k + 1); }, [sel]);

  /* occasional idle event — a distant index segment glints, then settles */
  const [glintSeg, setGlintSeg] = useState<number | null>(null);
  useEffect(() => {
    if (reduced) return;
    const iv = window.setInterval(() => {
      let g = Math.floor(Math.random() * SEG_COUNT);
      if (g === sel * 4) g = (g + 6) % SEG_COUNT;
      setGlintSeg(g);
      window.setTimeout(() => setGlintSeg(null), 900);
    }, 5200);
    return () => clearInterval(iv);
  }, [reduced, sel]);

  /* ---- theme switch: machine dismantles → material swaps → rebuilds ---- */
  const [rebuilding, setRebuilding] = useState(false);
  const [frozen, setFrozen] = useState<Record<string, string> | null>(null);
  const prevTheme = useRef(theme);
  useEffect(() => {
    if (prevTheme.current !== theme) {
      prevTheme.current = theme;
      if (!reduced) {
        const cs = getComputedStyle(document.documentElement);
        const grab = (v: string) => cs.getPropertyValue(v).trim();
        setFrozen({
          "--core-plate": grab("--core-plate"),
          "--core-deep": grab("--core-deep"),
          "--core-line": grab("--core-line"),
          "--core-mid": grab("--core-mid"),
          "--core-inv": grab("--core-inv"),
          "--core-crimson": grab("--core-crimson"),
        });
        setRebuilding(true);
        const t = window.setTimeout(() => { setRebuilding(false); setFrozen(null); }, 1560);
        return () => clearTimeout(t);
      }
    }
  }, [theme, reduced]);

  /* ---- THE MECHANICAL POINTER — gear-driven, telescoping shaft, counterweight.
         Choreography on selection change: RETRACT → ROTATE → EXTEND. ---- */
  const discRef = useRef<HTMLDivElement>(null);
  const handG = useRef<SVGGElement>(null);
  const shaftG = useRef<SVGGElement>(null);
  const driveGear = useRef<SVGGElement>(null);
  const st = useRef({ ang: 0, angV: 0, ext: 0, extV: 0, phase: "extend" as "retract" | "rotate" | "extend", gearRot: 0, raf: 0, last: 0 });
  const selRef = useRef(sel);

  useEffect(() => {
    selRef.current = sel;
    if (!reduced) st.current.phase = "retract";
  }, [sel, reduced]);

  useEffect(() => {
    if (reduced) {
      const a = nodeAngle(selRef.current);
      handG.current?.setAttribute("transform", `rotate(${a} ${C} ${C})`);
      shaftG.current?.setAttribute("transform", `translate(0 ${-1 * 78})`);
      return;
    }
    const loop = (t: number) => {
      const s = st.current;
      const dt = Math.min(0.045, s.last ? (t - s.last) / 1000 : 0.016);
      s.last = t;
      const tAng = nodeAngle(selRef.current);
      let kA = 46, cA = 10.5, kE = 84, cE = 10.2, tExt = 1;

      if (s.phase === "retract") {
        tExt = 0; kE = 110; cE = 18;
        if (s.ext < 0.05 && Math.abs(s.extV) < 0.4) s.phase = "rotate";
      } else if (s.phase === "rotate") {
        tExt = 0;
        if (Math.abs(((tAng - s.ang + 180) % 360 + 360) % 360 - 180) < 1.6 && Math.abs(s.angV) < 26) s.phase = "extend";
      } else {
        tExt = 1;
        if (s.ext > 0.985 && Math.abs(s.extV) < 0.25) s.phase = "extend";
      }

      const dA = ((tAng - s.ang + 180) % 360 + 360) % 360 - 180;
      s.angV += (dA * kA - s.angV * cA) * dt;
      s.ang += s.angV * dt;
      s.extV += ((tExt - s.ext) * kE - s.extV * cE) * dt;
      s.ext = Math.max(0, Math.min(1.06, s.ext + s.extV * dt));

      const speed = 14 + Math.min(400, Math.abs(s.angV) * 2) + Math.abs(s.extV) * 36;
      s.gearRot += speed * dt;

      handG.current?.setAttribute("transform", `rotate(${s.ang.toFixed(2)} ${C} ${C})`);
      shaftG.current?.setAttribute("transform", `translate(0 ${(-78 * Math.min(1, s.ext)).toFixed(1)})`);
      driveGear.current?.setAttribute("transform", `translate(${C} ${C}) rotate(${(s.gearRot % 360).toFixed(1)}) translate(${-C} ${-C})`);
      s.raf = requestAnimationFrame(loop);
    };
    st.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.current.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const spin = (s?: string) => (reduced || !s ? undefined : s);

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          huge
          label="02 — WHAT I DO"
          title="CORE"
          desc="Nine disciplines feed one machine — direction, generation and story transmitted through a single clockwork engine."
          meta="09 MODULES · ONE ENGINE"
        />

        <div className="mt-12 grid lg:grid-cols-[minmax(0,1.14fr)_minmax(0,352px)] gap-12 lg:gap-24 xl:gap-40 items-center">
          {/* ================= THE RADIAL CLOCKWORK ENGINE ================= */}
          <Reveal>
            <div ref={discRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <div className={`mech-stage ${rebuilding ? "mech-rebuild" : ""}`} style={frozen ?? undefined}>
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`}>

                  {/* ============ LAYER 0 — BACKGROUND RADIAL CONSTRUCTION ============ */}
                  <g opacity="0.5">
                    {[120, 240, 282].map((r) => (
                      <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="var(--core-line)" strokeWidth="0.6" strokeDasharray="2 6" opacity="0.35" />
                    ))}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const [x1, y1] = polar(C, C, 100, i * 30);
                      const [x2, y2] = polar(C, C, 282, i * 30);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth="0.5" opacity="0.18" />;
                    })}
                  </g>

                  {/* ============ LAYER 1 — OUTER HOUSING (heavy, bevelled, bolted) ============ */}
                  <g className="rb-a">
                    <Drop cx={C} cy={C} rx={HSG_OUT + 6} ry={HSG_OUT + 6} />
                    {/* outer bevel ring */}
                    <circle cx={C} cy={C} r={HSG_OUT} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="2" />
                    <path d={`M${polar(C, C, HSG_OUT - 2, 205)[0]} ${polar(C, C, HSG_OUT - 2, 205)[1]} A${HSG_OUT - 2} ${HSG_OUT - 2} 0 0 1 ${polar(C, C, HSG_OUT - 2, 335)[0]} ${polar(C, C, HSG_OUT - 2, 335)[1]}`}
                      fill="none" stroke="var(--core-inv)" strokeWidth="1.4" opacity="0.2" strokeLinecap="round" />
                    {/* housing body */}
                    <circle cx={C} cy={C} r={HSG_OUT - 7} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.2" />
                    {/* mounting bolts around the housing */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const [x, y] = polar(C, C, HSG_OUT - 17, i * 30 + 15);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="4" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                          <line x1={x - 2} y1={y} x2={x + 2} y2={y} stroke="var(--core-line)" strokeWidth="1" transform={`rotate(${i * 30} ${x} ${y})`} />
                        </g>
                      );
                    })}
                    {/* segmented structural markings on the housing face */}
                    <circle cx={C} cy={C} r={HSG_IN + 9} fill="none" stroke="var(--core-line)" strokeWidth="1" strokeDasharray="14 9" opacity="0.55" />
                    {/* recessed inner edge */}
                    <circle cx={C} cy={C} r={HSG_IN} fill="none" stroke="var(--core-line)" strokeWidth="1.6" />
                    <circle cx={C} cy={C} r={HSG_IN - 3} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="3" opacity="0.5" />
                  </g>

                  {/* ============ LAYER 2 — PHYSICAL CONNECTORS (capability → core) ============ */}
                  <g className="rb-e">
                    {disciplines.map((dis, i) => (
                      <g key={dis.id} transform={`rotate(${nodeAngle(i)} ${C} ${C})`}>
                        <Connector on={i === sel} sigKey={sigKey} reduced={reduced} />
                      </g>
                    ))}
                  </g>

                  {/* ============ LAYER 3 — SEGMENTED INDEX / TRANSMISSION RING ============ */}
                  <g className="rb-b">
                    <circle cx={C} cy={C} r={IDX_OUT} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
                    {Array.from({ length: SEG_COUNT }).map((_, k) => {
                      const isActive = k === sel * 4;
                      const isGlint = k === glintSeg;
                      const [x, y] = polar(C, C, (IDX_OUT + IDX_IN) / 2, k * (360 / SEG_COUNT));
                      return (
                        <rect key={k} x="-4.6" y={-(IDX_OUT - IDX_IN) / 2 + 2} width="9.2" height={IDX_OUT - IDX_IN - 4} rx="1.5"
                          transform={`translate(${x} ${y}) rotate(${k * (360 / SEG_COUNT)})`}
                          fill={isActive ? "var(--core-crimson)" : isGlint ? "var(--core-mid)" : "var(--core-deep)"}
                          stroke={isActive ? "var(--core-inv)" : "var(--core-line)"} strokeWidth={isActive ? 1.2 : 0.8}
                          opacity={isActive ? 1 : isGlint ? 0.9 : 0.85}
                          style={{ transition: "fill .3s ease, stroke .3s ease" }} />
                      );
                    })}
                    {/* slowly rotating calibration sub-ring */}
                    <g className={spin("gear-cw")} style={{ animationDuration: "240s" }}>
                      <circle cx={C} cy={C} r={IDX_IN - 4} fill="none" stroke="var(--core-line)" strokeWidth="0.9" strokeDasharray="3 8" opacity="0.6" />
                    </g>
                    {/* idle orbit signal — a faint pulse circling the capability orbit */}
                    {!reduced && (
                      <circle r="2.6" fill="var(--core-crimson)" opacity="0.3">
                        <animateMotion dur="26s" repeatCount="indefinite" path={`M ${C},${C - 245} a 245,245 0 1,1 -0.1,0 z`} />
                      </circle>
                    )}
                  </g>

                  {/* ============ LAYER 4 — RECESSED INNER CHAMBER ============ */}
                  <g className="rb-c">
                    {/* chamber floor — progressively deeper */}
                    <circle cx={C} cy={C} r={CHAMBER} fill="var(--core-deep)" />
                    <circle cx={C} cy={C} r={CHAMBER} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="4" opacity="0.5" />
                    <circle cx={C} cy={C} r={132} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" opacity="0.5" />
                    <circle cx={C} cy={C} r={104} fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="2" opacity="0.5" />
                    {/* concentric grooves */}
                    {[126, 96, 66].map((r) => (
                      <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="var(--core-line)" strokeWidth="0.7" opacity="0.3" />
                    ))}

                    {/* RADIAL STRUCTURAL MEMBERS — asymmetric, varied, load-bearing */}
                    <g stroke="var(--core-line)" fill="var(--core-plate)">
                      {/* thick bar upper-right */}
                      <g transform={`rotate(35 ${C} ${C})`}>
                        <rect x={C - 7} y={C - 140} width="14" height="66" rx="2" stroke="var(--core-line)" strokeWidth="1.2" />
                        <line x1={C - 3} y1={C - 134} x2={C - 3} y2={C - 80} stroke="var(--core-inv)" strokeWidth="1" opacity="0.25" />
                      </g>
                      {/* recessed rail lower-left */}
                      <g transform={`rotate(215 ${C} ${C})`}>
                        <rect x={C - 5} y={C - 138} width="10" height="60" rx="2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />
                      </g>
                      {/* segmented member left */}
                      <g transform={`rotate(275 ${C} ${C})`}>
                        {[0, 1, 2].map((s) => (
                          <rect key={s} x={C - 6} y={C - 136 + s * 22} width="12" height="17" rx="2" stroke="var(--core-line)" strokeWidth="1.1" />
                        ))}
                      </g>
                      {/* diagonal brace lower-right */}
                      <g transform={`rotate(140 ${C} ${C})`}>
                        <rect x={C - 4} y={C - 132} width="8" height="54" rx="2" stroke="var(--core-line)" strokeWidth="1" />
                        <circle cx={C} cy={C - 132} r="4" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />
                        <circle cx={C} cy={C - 78} r="4" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />
                      </g>
                    </g>

                    {/* inner structural ring (static, bolted) */}
                    <circle cx={C} cy={C} r={134} fill="none" stroke="var(--core-plate)" strokeWidth="7" />
                    <circle cx={C} cy={C} r={134} fill="none" stroke="var(--core-line)" strokeWidth="1" />
                    {Array.from({ length: 8 }).map((_, i) => {
                      const [x, y] = polar(C, C, 134, i * 45 + 22.5);
                      return <circle key={i} cx={x} cy={y} r="2.4" fill="var(--core-line)" />;
                    })}

                    {/* transmission ring — rotates opposite the index */}
                    <g className={spin("gear-ccw")} style={{ animationDuration: "150s" }}>
                      <circle cx={C} cy={C} r={112} fill="none" stroke="var(--core-plate)" strokeWidth="9" />
                      {Array.from({ length: 40 }).map((_, i) => {
                        const [x, y] = polar(C, C, 112, i * 9);
                        return <rect key={i} x={x - 2} y={y - 2} width="4" height="4" fill="var(--core-line)" opacity="0.7" transform={`rotate(${i * 9} ${x} ${y})`} />;
                      })}
                    </g>
                  </g>

                  {/* ============ LAYER 5 — CENTRAL GEAR ASSEMBLY ============ */}
                  <g className="rb-d">
                    <Drop cx={C} cy={C + 6} rx={58} ry={54} />
                    {/* primary central gear */}
                    <g transform={`translate(${C} ${C})`}>
                      <g className={spin("gear-cw")} style={{ animationDuration: "34s" }}>
                        <GearShape r={50} teeth={20} fill="var(--core-plate)" stroke="var(--core-line)" spokes={5} />
                      </g>
                    </g>
                    {/* secondary gear — meshed, opposite */}
                    <g transform={`translate(${polar(C, C, 79, -45).join(" ")})`}>
                      <g className={spin("gear-ccw")} style={{ animationDuration: "20s" }}>
                        <GearShape r={29} teeth={13} fill="var(--core-deep)" stroke="var(--core-line)" spokes={4} />
                      </g>
                    </g>
                    {/* small transfer gear — faster */}
                    <g transform={`translate(${polar(C, C, 79, -45)[0] + 40} ${polar(C, C, 79, -45)[1] + 30})`}>
                      <g className={spin("gear-cw")} style={{ animationDuration: "9s" }}>
                        <GearShape r={16} teeth={9} fill="var(--core-plate)" stroke="var(--core-line)" hub={false} />
                      </g>
                    </g>
                    {/* hub bearing */}
                    <circle cx={C} cy={C} r={21} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.5" />
                    <circle cx={C} cy={C} r={14} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
                  </g>

                  {/* ============ LAYER 6 — MECHANICAL POINTER ============ */}
                  <g className="rb-f">
                    <g ref={handG} transform={`rotate(0 ${C} ${C})`}>
                      {/* counterweight termination (opposite the tip) */}
                      <rect x={C - 5} y={C + 26} width="10" height="18" rx="2.5" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
                      <circle cx={C} cy={C + 47} r="6.5" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.3" />
                      {/* telescoping shaft */}
                      <g ref={shaftG}>
                        <rect x={C - 2.6} y={C - 150} width="5.2" height="112" rx="2" fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth="1" />
                        <line x1={C} y1={C - 146} x2={C} y2={C - 44} stroke="var(--core-inv)" strokeWidth="0.8" opacity="0.3" />
                        {/* pointer tip */}
                        <polygon points={`${C},${C - 162} ${C + 7},${C - 144} ${C - 7},${C - 144}`} fill="var(--core-crimson)" stroke="var(--core-line)" strokeWidth="1.2" />
                        <circle cx={C} cy={C - 144} r="2.4" fill="var(--core-inv)" />
                      </g>
                    </g>
                    {/* drive gear at the pivot — spins as the pointer moves */}
                    <g ref={driveGear}>
                      <GearShape r={13} teeth={9} fill="var(--core-deep)" stroke="var(--core-crimson)" hub={false} />
                    </g>
                    {/* CENTRAL CORE / HEARTBEAT */}
                    <g className={spin("core-beat")}>
                      <circle cx={C} cy={C} r={15} fill="none" stroke="var(--core-line)" strokeWidth="1" strokeDasharray="2 3" opacity="0.8" />
                      <circle cx={C} cy={C} r={9.5} fill="var(--core-plate)" stroke="var(--core-crimson)" strokeWidth="1.5" />
                      <circle cx={C} cy={C} r={3.6} fill="var(--core-crimson)" />
                      <circle cx={C} cy={C} r={1.2} fill="var(--core-inv)" />
                    </g>
                  </g>
                </svg>
              </div>

              {/* ============ NINE CAPABILITY MODULES — radially mounted ============ */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                const deg = nodeAngle(i);
                const [x, y] = polar(50, 50, 44.5, deg);
                const lb = LBL[i % LBL.length];
                const labelWrap =
                  lb.side === "above" ? "absolute -top-10 inset-x-0 flex flex-col items-center" :
                  lb.side === "left" ? "absolute right-full top-1/2 -translate-y-1/2 pr-3 flex flex-col items-end" :
                  "absolute left-full top-1/2 -translate-y-1/2 pl-3 flex flex-col items-start";
                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onClick={() => pick(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}>
                    <span className="relative grid place-items-center transition-all duration-400 mat-texture"
                      style={{
                        width: 74, height: 74,
                        clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
                        backgroundColor: isActive ? "var(--core-deep)" : "var(--core-plate)",
                        color: isActive ? "var(--core-inv)" : "var(--core-mid)",
                        boxShadow: isActive
                          ? "inset 0 0 0 1.5px var(--core-crimson), 0 12px 26px -14px rgba(0,0,0,0.55)"
                          : isHover
                            ? "inset 0 0 0 1.5px var(--core-mid)"
                            : "inset 0 0 0 1.5px color-mix(in srgb, var(--core-line) 60%, transparent)",
                        transform: isHover && !isActive ? "translateY(-2px)" : "none",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${isActive ? "bg-[var(--core-crimson)] text-[#f4f2ed]" : "bg-[var(--core-deep)] text-[var(--core-mid)]"}`}>
                        {dis.num}
                      </span>
                      {/* mechanical attachment point */}
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                        style={{ background: isActive ? "var(--core-crimson)" : "var(--core-line)", transition: "background .3s ease" }} />
                    </span>
                    <span className={`${labelWrap} pointer-events-none`}>
                      {lb.lines.map((ln) => (
                        <span key={ln} className={`f-tech font-bold text-[12px] tracking-[0.12em] leading-[1.3] whitespace-nowrap transition-colors duration-300 ${lb.side === "left" ? "text-right" : "text-left"}`}
                          style={{ color: isActive ? "var(--core-crimson)" : "var(--ink2)" }}>
                          {ln}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}

              <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-8 h-px bg-[var(--line)]" />
                RADIAL ENGINE — {`CORE/${disciplines[sel].num}`}
                <span className="w-8 h-px bg-[var(--line)]" />
              </div>
            </div>
          </Reveal>

          {/* ================= DETAIL CARD ================= */}
          <Reveal delay={0.1}>
            <div className="mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 18%, transparent)" }}>
              <span className="absolute top-0 left-0 h-[3px] bg-[var(--crim-panel)] scan-pass" style={{ width: "42%" }} aria-hidden />
              <div key={d.id} className="dossier-swap">
                <div className="flex items-center justify-between">
                  <span className="f-mono text-[11px] tracking-[0.3em] text-[var(--crim-panel)]">{d.num} / 09</span>
                  <span className="f-mono text-[9px] tracking-[0.26em] flex items-center gap-2" style={{ color: "var(--m-sub)" }}>
                    <span className="w-1.5 h-1.5 bg-[var(--crim-panel)] live-blink" />
                    {hoverIdx !== null ? "PREVIEW" : locked ? "LOCKED" : "UNLOCKED"}
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
                  <span className="text-[var(--crim-panel)]">CORE/{d.num}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
