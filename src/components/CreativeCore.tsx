import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

/* toothed gear drawn at origin — caller translates/rotates */
function GearShape({ r, teeth, fill = "var(--machine-plate)", stroke = "var(--machine-line)", hub = true, spokes = 0 }: {
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
        fill="none" stroke="var(--machine-inv)" strokeWidth={1.1} opacity={0.22} strokeLinecap="round" />
      {spokes > 0 && Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return <circle key={i} cx={r * 0.5 * Math.cos(a)} cy={r * 0.5 * Math.sin(a)} r={r * 0.16} fill="var(--machine-deep)" stroke={stroke} strokeWidth={0.9} />;
      })}
      {hub && (
        <>
          <circle r={r * 0.3} fill="var(--machine-deep)" stroke={stroke} strokeWidth={1.2} />
          <circle r={r * 0.1} fill={stroke} />
        </>
      )}
    </>
  );
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

const CX = 300, CY = 300;

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const locked = lockedIdx !== null;
  const sel = hoverIdx ?? lockedIdx;
  const d = sel !== null ? disciplines[sel] : null;
  const nodeAngle = (i: number) => i * (360 / disciplines.length);

  /* ---- 30s surge — 3s mechanical activation ---- */
  const [surgeOn, setSurgeOn] = useState(false);
  const [lit, setLit] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    if (reduced) return;
    const iv = window.setInterval(() => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setSurgeOn(true);
      for (let i = 0; i < 24; i++) timers.current.push(window.setTimeout(() => setLit(i + 1), 75 * i));
      timers.current.push(window.setTimeout(() => { setSurgeOn(false); setLit(0); }, 3000));
    }, 30000);
    return () => { clearInterval(iv); timers.current.forEach(clearTimeout); };
  }, [reduced]);

  /* ---- 3D theme rebuild — machine disassembles, inverts, reassembles ---- */
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
          "--machine-plate": grab("--machine-plate"),
          "--machine-deep": grab("--machine-deep"),
          "--machine-line": grab("--machine-line"),
          "--machine-inv": grab("--machine-inv"),
        });
        setRebuilding(true);
        const t = window.setTimeout(() => { setRebuilding(false); setFrozen(null); }, 1560);
        return () => clearTimeout(t);
      }
    }
  }, [theme, reduced]);

  /* ---- THE GEAR POINTER ------------------------------------------------
     central pivot → drive gear → secondary gear → telescoping linkage →
     mechanical pointer arm → crimson tip. The pointer is assembled from
     three sliding sleeve segments + three small gears that stack at the
     pivot when compressed and separate along the arm when extended.
     Choreography: RETRACT → ROTATE → EXTEND with weighted springs.      */
  const discRef = useRef<HTMLDivElement>(null);
  const handG = useRef<SVGGElement>(null);
  const seg2 = useRef<SVGGElement>(null);
  const seg3 = useRef<SVGGElement>(null);
  const tipG = useRef<SVGGElement>(null);
  const pGear1 = useRef<SVGGElement>(null);
  const pGear2 = useRef<SVGGElement>(null);
  const pGear3 = useRef<SVGGElement>(null);
  const driveGear = useRef<SVGGElement>(null);
  const meshGear = useRef<SVGGElement>(null);
  const visRef = useRef(true);

  const st = useRef({
    ang: 0, angV: 0, ext: 0, extV: 0,
    phase: "idle" as "idle" | "retract" | "rotate" | "extend",
    driveRot: 0, meshRot: 0, pRot: 0,
    raf: 0, last: 0,
  });
  const selRef = useRef<number | null>(sel);

  /* discipline change → full mechanical handoff, never an instant flip */
  useEffect(() => {
    selRef.current = sel;
    if (reduced) return;
    if (st.current.ext > 0.08) st.current.phase = "retract";
    else st.current.phase = sel !== null ? "rotate" : "idle";
  }, [sel, reduced]);

  /* pause the heavy loop when the machine scrolls out of view */
  useEffect(() => {
    const el = discRef.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { visRef.current = e.isIntersecting; }), { threshold: 0.08 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* apply a resolved static pose (reduced motion, or first paint) */
  const applyPose = (ang: number, ext: number) => {
    handG.current?.setAttribute("transform", `rotate(${ang} ${CX} ${CY})`);
    seg2.current?.setAttribute("transform", `translate(0 ${(-ext * 44).toFixed(1)})`);
    seg3.current?.setAttribute("transform", `translate(0 ${(-ext * 88).toFixed(1)})`);
    tipG.current?.setAttribute("transform", `translate(0 ${(-ext * 132).toFixed(1)})`);
    pGear1.current?.setAttribute("transform", `translate(${-16} ${-(44 + ext * 4).toFixed(1)})`);
    pGear2.current?.setAttribute("transform", `translate(${15} ${-(44 + ext * 52).toFixed(1)})`);
    pGear3.current?.setAttribute("transform", `translate(${-14} ${-(44 + ext * 100).toFixed(1)})`);
  };

  useEffect(() => {
    if (reduced) {
      const a = sel !== null ? nodeAngle(sel) : 0;
      applyPose(a, sel !== null ? 1 : 0);
      return;
    }
    const loop = (t: number) => {
      const s = st.current;
      const dt = Math.min(0.045, s.last ? (t - s.last) / 1000 : 0.016);
      s.last = t;
      if (visRef.current) {
        const target = selRef.current;
        const tAng = target !== null ? nodeAngle(target) : 0;
        const tExt = target !== null ? 1 : 0;
        let kA = 42, cA = 9.5, kE = 60, cE = 11;

        if (s.phase === "retract") {
          kE = 130; cE = 17;                                   /* fast damped pull-in */
          if (s.ext < 0.05 && Math.abs(s.extV) < 0.35) s.phase = tExt === 1 ? "rotate" : "idle";
        } else if (s.phase === "rotate") {
          kE = 90; cE = 16;                                    /* stay short while aiming */
          const dA = ((tAng - s.ang + 180) % 360 + 360) % 360 - 180;
          if (Math.abs(dA) < 1.4 && Math.abs(s.angV) < 22) s.phase = tExt === 1 ? "extend" : "idle";
        } else if (s.phase === "extend") {
          kE = 78; cE = 9.6;                                   /* under-damped — overshoot + settle */
          if (s.ext > 0.985 && Math.abs(s.extV) < 0.22) s.phase = "idle";
        }

        const dA = ((tAng - s.ang + 180) % 360 + 360) % 360 - 180;
        s.angV += (dA * kA - s.angV * cA) * dt;
        s.ang += s.angV * dt;
        const curExt = s.phase === "retract" || s.phase === "rotate" ? 0 : tExt;
        s.extV += ((curExt - s.ext) * kE - s.extV * cE) * dt;
        s.ext = Math.max(0, Math.min(1.05, s.ext + s.extV * dt));

        /* gear rotations driven by motion + a slow idle creep */
        const motion = Math.min(320, Math.abs(s.angV) * 1.7 + Math.abs(s.extV) * 46) + (surgeOn ? 70 : 0);
        s.driveRot += (26 + motion) * dt;
        s.meshRot = -s.driveRot * 1.62;
        s.pRot += (14 + Math.abs(s.extV) * 38 + Math.abs(s.angV) * 1.1) * dt;

        handG.current?.setAttribute("transform", `rotate(${s.ang.toFixed(2)} ${CX} ${CY})`);
        seg2.current?.setAttribute("transform", `translate(0 ${(-s.ext * 44).toFixed(1)})`);
        seg3.current?.setAttribute("transform", `translate(0 ${(-s.ext * 88).toFixed(1)})`);
        tipG.current?.setAttribute("transform", `translate(0 ${(-s.ext * 132).toFixed(1)})`);
        pGear1.current?.setAttribute("transform", `translate(-16 ${-(44 + s.ext * 4).toFixed(1)}) rotate(${(s.pRot % 360).toFixed(1)})`);
        pGear2.current?.setAttribute("transform", `translate(15 ${-(44 + s.ext * 52).toFixed(1)}) rotate(${(-s.pRot * 1.4 % 360).toFixed(1)})`);
        pGear3.current?.setAttribute("transform", `translate(-14 ${-(44 + s.ext * 100).toFixed(1)}) rotate(${(s.pRot * 1.8 % 360).toFixed(1)})`);
        driveGear.current?.setAttribute("transform", `translate(${CX} ${CY}) rotate(${(s.driveRot % 360).toFixed(1)})`);
        meshGear.current?.setAttribute("transform", `translate(${CX - 47} ${CY + 45}) rotate(${(s.meshRot % 360).toFixed(1)})`);
      }
      s.raf = requestAnimationFrame(loop);
    };
    st.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.current.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, surgeOn, disciplines.length]);

  const pick = (i: number) => {
    if (locked && lockedIdx === i) setLockedIdx(null);
    else setLockedIdx(i);
  };

  const spin = (s?: string) => (reduced || !s ? undefined : s);

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          huge
          label="02 — WHAT I DO"
          title="CORE"
          desc="Nine disciplines, one practice — direction, generation and story held together by structured workflows. One machine powers all of them."
          meta="09 MODULES · ONE ENGINE"
        />

        <div className="mt-12 grid lg:grid-cols-[minmax(0,1.14fr)_minmax(0,352px)] gap-12 lg:gap-24 xl:gap-40 items-center">
          {/* ================= THE PRECISION CLOCKWORK ENGINE ================= */}
          <Reveal>
            <div ref={discRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <div className={`mech-stage ${rebuilding ? "mech-rebuild" : ""}`} style={frozen ?? undefined}>
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`}>

                  {/* ============ LAYER 01 — BACKPLATE + EXTERNAL MODULES ============ */}
                  <g className="rb-a">
                    {/* deep recessed backplate */}
                    <circle cx={CX} cy={CY} r="252" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="2" />
                    <circle cx={CX} cy={CY} r="252" fill="url(#coreGrain)" opacity="0.5" />
                    <defs>
                      <pattern id="coreGrain" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="7" stroke="#000" strokeWidth="0.7" opacity="0.13" />
                      </pattern>
                      <radialGradient id="coreShade" cx="0.38" cy="0.34" r="0.85">
                        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
                        <stop offset="1" stopColor="#000" stopOpacity="0.22" />
                      </radialGradient>
                    </defs>
                    <circle cx={CX} cy={CY} r="252" fill="url(#coreShade)" />
                    {/* mounting holes around the plate */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const [x, y] = polar(CX, CY, 244, i * 30 + 15);
                      return <circle key={i} cx={x} cy={y} r="2.6" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />;
                    })}
                    {/* hidden structural shafts etched into the backplate */}
                    <line x1={CX - 150} y1={CY + 120} x2={CX + 40} y2={CY + 120} stroke="var(--machine-line)" strokeWidth="3" opacity="0.35" strokeLinecap="round" />
                    <line x1={CX + 90} y1={CY - 140} x2={CX + 90} y2={CY + 60} stroke="var(--machine-line)" strokeWidth="3" opacity="0.3" strokeLinecap="round" />

                    {/* EXTERNAL MODULE — rectangular actuator housing (lower-left) breaks the circle */}
                    <g transform={`translate(${polar(CX, CY, 250, 228)[0]} ${polar(CX, CY, 250, 228)[1]}) rotate(48)`}>
                      <rect x="-20" y="-34" width="56" height="68" rx="6" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.6" />
                      <rect x="-13" y="-27" width="42" height="54" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
                      <g className={spin("piston")} style={{ animationDuration: "3.1s" }}>
                        <rect x="2" y="-20" width="12" height="20" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                      </g>
                      <line x1="8" y1="-2" x2="8" y2="20" stroke="var(--machine-line)" strokeWidth="4" strokeLinecap="round" />
                      {[-26, 26].map((by) => <circle key={by} cx="-12" cy={by} r="2.4" fill="var(--machine-line)" />)}
                    </g>
                    {/* EXTERNAL MODULE — circular gear housing (lower-right) */}
                    <g transform={`translate(${polar(CX, CY, 252, 312)[0]} ${polar(CX, CY, 252, 312)[1]})`}>
                      <circle r="30" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.6" />
                      <circle r="23" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
                      <g className={spin("gear-cw")} style={{ animationDuration: "13s" }}>
                        <GearShape r={15} teeth={9} fill="var(--machine-line)" hub={false} />
                      </g>
                      {[0, 120, 240].map((a) => { const [x, y] = polar(0, 0, 26.5, a); return <circle key={a} cx={x} cy={y} r="2.2" fill="var(--machine-line)" />; })}
                    </g>
                    {/* EXTERNAL MODULE — angular mounting bracket (upper-right) */}
                    <g transform={`translate(${polar(CX, CY, 250, 52)[0]} ${polar(CX, CY, 250, 52)[1]}) rotate(52)`}>
                      <path d="M-26 -14 L30 -14 L38 0 L30 14 L-26 14 L-18 0 Z" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.5" />
                      <circle cx="-14" cy="0" r="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
                      <circle cx="22" cy="0" r="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
                    </g>
                  </g>

                  {/* ============ LAYER 02 — STRUCTURAL RING + PARTIAL TEETH ============ */}
                  <g className="rb-a">
                    <circle cx={CX} cy={CY} r="234" fill="none" stroke="var(--machine-plate)" strokeWidth="13" />
                    <circle cx={CX} cy={CY} r="241" fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.6" />
                    <circle cx={CX} cy={CY} r="227" fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.6" />
                    {/* partial exposed toothed arcs (not a full rotating ring) */}
                    <g className={spin("gear-cw")} style={{ animationDuration: "180s" }}>
                      {Array.from({ length: 10 }).map((_, i) => {
                        const [x, y] = polar(CX, CY, 234, i * 9 + 200);
                        return <rect key={i} x="-5" y="-8" width="10" height="8" rx="1.5" transform={`translate(${x} ${y}) rotate(${i * 9 + 200})`} fill="var(--machine-line)" opacity="0.9" />;
                      })}
                    </g>
                    {/* bolts on the structural ring */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const [x, y] = polar(CX, CY, 234, i * 45 + 22);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                          <line x1={x - 2.2} y1={y} x2={x + 2.2} y2={y} stroke="var(--machine-line)" strokeWidth="0.9" />
                        </g>
                      );
                    })}
                  </g>

                  {/* ============ LAYER 03 — TIMING MECHANISM (independent sections) ============ */}
                  <g className="rb-b">
                    {/* rotating segmented timing ring — slow */}
                    <g className={spin("gear-cw")} style={{ animationDuration: "240s" }}>
                      {Array.from({ length: 24 }).map((_, i) => {
                        const [x, y] = polar(CX, CY, 214, i * 15 + 7.5);
                        const on = surgeOn && lit > i;
                        return (
                          <rect key={i} x="-7.5" y="-6" width="15" height="12" rx="2"
                            transform={`translate(${x} ${y}) rotate(${i * 15 + 7.5})`}
                            fill={on ? "var(--machine-crimson-hot)" : "var(--machine-deep)"}
                            stroke="var(--machine-line)" strokeWidth="0.9"
                            style={{ transition: "fill .3s ease" }} />
                        );
                      })}
                    </g>
                    {/* counter-rotating gate arc with gaps — different speed */}
                    <g className={spin("gear-ccw")} style={{ animationDuration: "150s" }}>
                      {[30, 150, 270].map((start) => (
                        <path key={start}
                          d={`M${polar(CX, CY, 203, start)[0]} ${polar(CX, CY, 203, start)[1]} A203 203 0 0 1 ${polar(CX, CY, 203, start + 80)[0]} ${polar(CX, CY, 203, start + 80)[1]}`}
                          fill="none" stroke="var(--machine-line)" strokeWidth="4" strokeLinecap="round" opacity="0.75" />
                      ))}
                    </g>
                    {/* static calibration ticks — the locked reference */}
                    {Array.from({ length: 60 }).map((_, i) => {
                      const long = i % 5 === 0;
                      const [x1, y1] = polar(CX, CY, 196, i * 6);
                      const [x2, y2] = polar(CX, CY, long ? 188 : 192, i * 6);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={long ? "var(--machine-inv)" : "var(--machine-line)"}
                        strokeWidth={long ? 1.4 : 0.8} opacity={long ? 0.5 : 0.55} />;
                    })}
                    {/* discipline mechanical couplings — node → coupling → short shaft → core */}
                    {disciplines.map((dis, i) => {
                      const on = i === sel;
                      const deg = nodeAngle(i);
                      const [x1, y1] = polar(CX, CY, 222, deg);
                      const [x2, y2] = polar(CX, CY, 244, deg);
                      const [jx, jy] = polar(CX, CY, 233, deg);
                      return (
                        <g key={dis.id}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={on ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth={on ? 3.4 : 2.4}
                            strokeLinecap="round" style={{ transition: "stroke .35s ease" }} />
                          {!reduced && (
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={on ? "var(--machine-inv)" : "var(--machine-line)"}
                              strokeWidth="1" className={on ? "channel-flow" : undefined} opacity={on ? 0.9 : 0.2} />
                          )}
                          <circle cx={jx} cy={jy} r={on ? 5 : 3.8} fill="var(--machine-deep)"
                            stroke={on ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth="1.2"
                            style={{ transition: "all .35s ease" }} />
                          <circle cx={jx} cy={jy} r="1.4" fill={on ? "var(--machine-crimson-hot)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }} />
                        </g>
                      );
                    })}
                  </g>

                  {/* ============ LAYER 04 — TRANSMISSION SYSTEM ============ */}
                  <g className="rb-c">
                    {/* recessed transmission plate */}
                    <circle cx={CX} cy={CY} r="180" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" opacity="0.5" />
                    {/* power shafts radiating from the center to the gear clusters */}
                    <line x1={CX} y1={CY} x2={CX - 95} y2={CY - 92} stroke="var(--machine-line)" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
                    <line x1={CX} y1={CY} x2={CX + 112} y2={CY - 18} stroke="var(--machine-line)" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
                    <line x1={CX} y1={CY} x2={CX - 70} y2={CY + 96} stroke="var(--machine-line)" strokeWidth="4" opacity="0.5" strokeLinecap="round" />
                    <line x1={CX} y1={CY} x2={CX + 66} y2={CY + 104} stroke="var(--machine-line)" strokeWidth="4" opacity="0.5" strokeLinecap="round" />

                    {/* upper-left gear cluster (meshed — opposite directions) */}
                    <g transform={`translate(${CX - 95} ${CY - 92})`}>
                      <g className={spin("gear-cw")} style={{ animationDuration: "21s" }}><GearShape r={30} teeth={14} fill="var(--machine-plate)" spokes={4} /></g>
                    </g>
                    <g transform={`translate(${CX - 56} ${CY - 118})`}>
                      <g className={spin("gear-ccw")} style={{ animationDuration: "10s" }}><GearShape r={16} teeth={9} fill="var(--machine-line)" hub={false} /></g>
                    </g>
                    {/* right gear cluster */}
                    <g transform={`translate(${CX + 112} ${CY - 18})`}>
                      <g className={spin("gear-ccw")} style={{ animationDuration: "26s" }}><GearShape r={26} teeth={12} fill="var(--machine-plate)" spokes={3} /></g>
                    </g>
                    <g transform={`translate(${CX + 86} ${CY + 26})`}>
                      <g className={spin("gear-cw")} style={{ animationDuration: "8s" }}><GearShape r={13} teeth={8} fill="var(--machine-line)" hub={false} /></g>
                    </g>

                    {/* eccentric wheel + connecting rod → piston (lower-left) */}
                    <g transform={`translate(${CX - 70} ${CY + 96})`}>
                      <g className={spin("gear-cw")} style={{ animationDuration: "6s" }}>
                        <GearShape r={22} teeth={11} fill="var(--machine-plate)" hub={false} />
                        <circle cx="9" cy="0" r="3.4" fill="var(--machine-crimson-hot)" stroke="var(--machine-deep)" strokeWidth="1" />
                      </g>
                      <line x1="9" y1="0" x2="9" y2="52" stroke="var(--machine-line)" strokeWidth="4.5" strokeLinecap="round" />
                    </g>
                    <g transform={`translate(${CX - 61} ${CY + 150})`}>
                      <rect x="-9" y="-8" width="18" height="34" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                      <g className={spin("piston")} style={{ animationDuration: "3s" }}>
                        <rect x="-6" y="-4" width="12" height="14" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                      </g>
                    </g>

                    {/* balance wheel — continuous smooth oscillation (upper-right) */}
                    <g transform={`translate(${CX + 66} ${CY + 104})`}>
                      <path d="M-16 0 a16 16 0 0 1 32 0" fill="none" stroke="var(--machine-line)" strokeWidth="0.9" opacity="0.5" strokeDasharray="2 3" />
                      <g className={spin("balance")} style={{ transformOrigin: "0px 0px", transformBox: "fill-box" }}>
                        <circle r="17" fill="none" stroke="var(--machine-plate)" strokeWidth="3.4" />
                        <line x1="-14" y1="0" x2="14" y2="0" stroke="var(--machine-plate)" strokeWidth="2" />
                        <circle r="3" fill="var(--machine-crimson-hot)" />
                      </g>
                    </g>

                    {/* escapement — periodic lock/release tick (top) */}
                    <g transform={`translate(${CX + 34} ${CY - 132})`}>
                      <g className={spin("gear-ccw")} style={{ animationDuration: "17s" }}><GearShape r={14} teeth={9} fill="var(--machine-line)" hub={false} /></g>
                      <g className={spin("escapement")} style={{ transformOrigin: "0px 18px", transformBox: "fill-box" }}>
                        <path d="M-8 26 L0 12 L8 26" fill="none" stroke="var(--machine-inv)" strokeWidth="2.2" strokeLinecap="round" />
                      </g>
                    </g>

                    {/* small satellite gears — fast */}
                    <g transform={`translate(${CX - 128} ${CY + 10})`}>
                      <g className={spin("gear-ccw")} style={{ animationDuration: "7s" }}><GearShape r={12} teeth={8} fill="var(--machine-line)" hub={false} /></g>
                    </g>
                    <g transform={`translate(${CX + 128} ${CY + 74})`}>
                      <g className={spin("gear-cw")} style={{ animationDuration: "9s" }}><GearShape r={11} teeth={7} fill="var(--machine-line)" hub={false} /></g>
                    </g>
                  </g>

                  {/* surge sweep arcs — travel around the mechanism during the 3s window */}
                  {surgeOn && !reduced && (
                    <>
                      <circle cx={CX} cy={CY} r="168" fill="none" stroke="var(--machine-crimson-hot)" strokeWidth="1.6"
                        strokeDasharray="10 8" className="gear-cw-fast" opacity="0.85" />
                      <circle cx={CX} cy={CY} r="120" fill="none" stroke="var(--machine-crimson-hot)" strokeWidth="1"
                        strokeDasharray="4 12" className="gear-ccw" style={{ animationDuration: "9s" }} opacity="0.6" />
                    </>
                  )}

                  {/* ============ LAYER 05 — CENTRAL CONTROL ASSEMBLY ============ */}
                  <g className="rb-e">
                    <circle cx={CX} cy={CY} r="100" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
                    <path d={`M${polar(CX, CY, 96, 200)[0]} ${polar(CX, CY, 96, 200)[1]} A96 96 0 0 1 ${polar(CX, CY, 96, 320)[0]} ${polar(CX, CY, 96, 320)[1]}`}
                      fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="3" opacity="0.5" />
                    {/* outer retaining ring + inner toothed gear ring */}
                    <circle cx={CX} cy={CY} r="84" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.5" />
                    <g className={spin("gear-ccw")} style={{ animationDuration: "60s" }}>
                      {Array.from({ length: 20 }).map((_, i) => {
                        const [x, y] = polar(CX, CY, 72, i * 18);
                        return <rect key={i} x="-4" y="-5.5" width="8" height="7" rx="1.4" transform={`translate(${x} ${y}) rotate(${i * 18})`} fill="var(--machine-line)" />;
                      })}
                    </g>
                    <circle cx={CX} cy={CY} r="62" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                    {/* jewel bearings on the control plate */}
                    {[[CX - 40, CY - 44], [CX + 46, CY - 30], [CX - 30, CY + 48]].map(([bx, by], k) => (
                      <g key={k}>
                        <circle cx={bx} cy={by} r="5" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
                        <circle cx={bx} cy={by} r="2" fill="var(--machine-crimson-hot)" opacity="0.85" />
                      </g>
                    ))}
                    {/* secondary bearing + rotating inner race */}
                    <circle cx={CX} cy={CY} r="52" fill="none" stroke="var(--machine-line)" strokeWidth="1.2" opacity="0.8" />
                    <g className={spin("gear-cw")} style={{ animationDuration: "44s" }}>
                      <circle cx={CX} cy={CY} r="46" fill="none" stroke="var(--machine-inv)" strokeWidth="1" strokeDasharray="2 6" opacity="0.4" />
                    </g>
                    {/* meshing secondary gear (driven opposite the drive gear) */}
                    <g ref={meshGear} transform={`translate(${CX - 47} ${CY + 45})`}>
                      <GearShape r={24} teeth={11} fill="var(--machine-deep)" />
                    </g>
                    {/* CENTRAL DRIVE GEAR — the pointer's power source at the pivot */}
                    <g ref={driveGear} transform={`translate(${CX} ${CY})`}>
                      <GearShape r={40} teeth={16} fill="var(--machine-plate)" spokes={4} />
                    </g>
                    {/* pivot bearing + central pin + crimson indicator */}
                    <circle cx={CX} cy={CY} r="12" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
                    <circle cx={CX} cy={CY} r="6.5" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
                    <circle cx={CX} cy={CY} r="3" fill="var(--machine-crimson-hot)" className={spin("core-beat")} style={{ transformOrigin: `${CX}px ${CY}px`, transformBox: "view-box" }} />
                  </g>

                  {/* ============ LAYER 06 — THE GEAR POINTER (foreground) ============ */}
                  <g className="rb-d">
                    <g ref={handG} transform={`rotate(0 ${CX} ${CY})`}>
                      <g transform={`translate(${CX} ${CY})`}>
                        {/* energy signal — travels pivot → gears → tip → coupling when active */}
                        {sel !== null && !reduced && (
                          <circle r="3.4" fill="var(--machine-crimson-hot)" opacity="0.95">
                            <animateMotion dur="1.4s" repeatCount="indefinite" path="M0,0 L0,-204" />
                          </circle>
                        )}
                        {/* base sleeve (fixed housing) */}
                        <rect x="-8" y="-62" width="16" height="48" rx="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                        <rect x="-11" y="-16" width="22" height="10" rx="3" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                        {/* telescoping segment 2 */}
                        <g ref={seg2} transform="translate(0 0)">
                          <rect x="-5.5" y="-60" width="11" height="42" rx="3" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.1" />
                        </g>
                        {/* telescoping segment 3 */}
                        <g ref={seg3} transform="translate(0 0)">
                          <rect x="-4" y="-62" width="8" height="34" rx="2.5" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                        </g>
                        {/* pointer hand + crimson tip */}
                        <g ref={tipG} transform="translate(0 0)">
                          <rect x="-2.2" y="-60" width="4.4" height="26" rx="1.6" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="0.9" />
                          <polygon points="0,-72 7,-52 0,-44 -7,-52" fill="var(--machine-crimson-hot)" stroke="var(--machine-line)" strokeWidth="1.1" />
                          <polygon points="0,-66 3.4,-53 -3.4,-53" fill="var(--machine-inv)" opacity="0.9" />
                        </g>
                        {/* pointer gears — stack at the pivot when compressed, separate when extended */}
                        <g ref={pGear1} transform="translate(-16 -44)"><GearShape r={9} teeth={7} fill="var(--machine-line)" hub={false} /></g>
                        <g ref={pGear2} transform="translate(15 -44)"><GearShape r={8} teeth={6} fill="var(--machine-plate)" hub={false} /></g>
                        <g ref={pGear3} transform="translate(-14 -44)"><GearShape r={7} teeth={6} fill="var(--machine-line)" hub={false} /></g>
                        {/* retaining collar tying the pointer to the pivot */}
                        <circle r="15" fill="none" stroke="var(--machine-line)" strokeWidth="2.4" />
                        <circle r="15" fill="none" stroke="var(--machine-inv)" strokeWidth="0.9" opacity="0.25" />
                      </g>
                    </g>
                    {/* front clamp arcs — overlap the housing, give the machine a front plane */}
                    {[200, 340].map((deg) => (
                      <path key={deg}
                        d={`M${polar(CX, CY, 246, deg - 16)[0]} ${polar(CX, CY, 246, deg - 16)[1]} A246 246 0 0 1 ${polar(CX, CY, 246, deg + 16)[0]} ${polar(CX, CY, 246, deg + 16)[1]}`}
                        fill="none" stroke="var(--machine-line)" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
                    ))}
                    {[200, 340].map((deg) => (
                      <path key={`h-${deg}`}
                        d={`M${polar(CX, CY, 246, deg - 16)[0]} ${polar(CX, CY, 246, deg - 16)[1]} A246 246 0 0 1 ${polar(CX, CY, 246, deg + 16)[0]} ${polar(CX, CY, 246, deg + 16)[1]}`}
                        fill="none" stroke="var(--machine-inv)" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" transform="translate(0 -2.4)" />
                    ))}
                  </g>
                </svg>
              </div>

              {/* ============ NINE DISCIPLINE MODULES — radially mounted ============ */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                const deg = nodeAngle(i);
                const [x, y] = polar(50, 50, 44.5, deg);
                const fill = isActive ? "var(--machine-crimson-hot)" : isHover ? "var(--machine-inv)" : "var(--machine-plate)";
                const iconColor = isActive ? "#f4f2ed" : isHover ? "var(--machine-plate)" : "var(--machine-inv)";
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
                    onFocus={() => setHoverIdx(i)}
                    onBlur={() => setHoverIdx(null)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}
                    aria-pressed={isActive}>
                    <span className="relative grid place-items-center rounded-lg transition-all duration-400 mat-texture"
                      style={{
                        width: 74, height: 74,
                        backgroundColor: fill,
                        color: iconColor,
                        boxShadow: isActive
                          ? "inset 0 0 0 1.5px rgba(244,242,237,0.45), 0 12px 26px -14px rgba(0,0,0,0.55)"
                          : isHover
                            ? "inset 0 0 0 1.5px color-mix(in srgb, var(--machine-plate) 40%, transparent)"
                            : "inset 0 0 0 1.5px color-mix(in srgb, var(--machine-inv) 22%, transparent)",
                        transform: isHover && !isActive ? "translateY(-2px)" : "none",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${isActive || isHover ? "bg-[#f4f2ed] text-[var(--crim-panel)]" : "bg-[var(--machine-inv)] text-[var(--machine-plate)]"}`}>
                        {dis.num}
                      </span>
                    </span>
                    <span className={`${labelWrap} pointer-events-none`}>
                      {lb.lines.map((ln) => (
                        <span key={ln} className={`f-tech font-bold text-[12px] tracking-[0.12em] leading-[1.3] whitespace-nowrap transition-colors duration-300 ${lb.side === "left" ? "text-right" : "text-left"}`}
                          style={{ color: isActive ? "var(--machine-crimson-hot)" : "var(--ink2)" }}>
                          {ln}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}

              <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-8 h-px bg-[var(--line)]" />
                GEAR POINTER — {sel !== null ? `CORE/${disciplines[sel].num}` : "AT REST"}
                <span className="w-8 h-px bg-[var(--line)]" />
              </div>
            </div>
          </Reveal>

          {/* ================= DETAIL CARD ================= */}
          <Reveal delay={0.1}>
            <div className="mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 18%, transparent)" }}>
              <span className="absolute top-0 left-0 h-[3px] bg-[var(--crim-panel)] scan-pass" style={{ width: "42%" }} aria-hidden />
              {d ? (
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
              ) : (
                <div key="standby" className="dossier-swap">
                  <div className="flex items-center justify-between">
                    <span className="f-mono text-[11px] tracking-[0.3em]" style={{ color: "var(--m-sub)" }}>-- / 09</span>
                    <span className="f-mono text-[9px] tracking-[0.26em] flex items-center gap-2" style={{ color: "var(--m-sub)" }}>
                      <span className="w-1.5 h-1.5 rounded-full live-blink" style={{ background: "var(--m-sub)" }} />
                      IDLE
                    </span>
                  </div>
                  <h3 className="f-display text-[clamp(1.6rem,2.6vw,2.3rem)] leading-tight mt-3" style={{ color: "var(--outer-ink)", opacity: 0.92 }}>
                    STANDING BY
                  </h3>
                  <p className="mt-4 text-[13.5px] sm:text-[14px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: 0.75 }}>
                    Choose a node to explore. Hover previews a discipline; click locks it into the dossier. Click again to release.
                  </p>
                  <div className="mt-7 flex items-end gap-5" aria-hidden>
                    <svg width="168" height="66" viewBox="0 0 168 66" fill="none">
                      <line x1="14" y1="33" x2="154" y2="33" stroke="var(--m-line)" strokeWidth="1" opacity="0.5" />
                      <g className={reduced ? undefined : "ptr-gear-spin"} style={{ animationDuration: "14s" }}>
                        {Array.from({ length: 10 }).map((_, i) => {
                          const a = (i / 10) * Math.PI * 2;
                          return <rect key={i} x="-3.4" y="-4.2" width="6.8" height="8.4" rx="1"
                            transform={`translate(${34 + 24 * Math.cos(a)} ${33 + 24 * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
                            fill="var(--m-line)" opacity="0.85" />;
                        })}
                        <circle cx="34" cy="33" r="19.5" fill="var(--machine-deep)" stroke="var(--m-line)" strokeWidth="1.4" />
                        <circle cx="34" cy="33" r="5" fill="var(--machine-plate)" stroke="var(--m-line)" strokeWidth="1.1" />
                      </g>
                      <g className={reduced ? undefined : "ptr-gear-spin-rev"} style={{ animationDuration: "9s" }}>
                        {Array.from({ length: 8 }).map((_, i) => {
                          const a = (i / 8) * Math.PI * 2 + 0.39;
                          return <rect key={i} x="-3" y="-3.8" width="6" height="7.6" rx="1"
                            transform={`translate(${79 + 16 * Math.cos(a)} ${33 + 16 * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
                            fill="var(--m-line)" opacity="0.85" />;
                        })}
                        <circle cx="79" cy="33" r="12.5" fill="var(--machine-plate)" stroke="var(--m-line)" strokeWidth="1.3" />
                        <circle cx="79" cy="33" r="4" fill="var(--machine-deep)" stroke="var(--m-line)" strokeWidth="1" />
                      </g>
                      <g className={reduced ? undefined : "ptr-gear-spin"} style={{ animationDuration: "6s" }}>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const a = (i / 7) * Math.PI * 2;
                          return <rect key={i} x="-2.6" y="-3.4" width="5.2" height="6.8" rx="1"
                            transform={`translate(${112 + 10.5 * Math.cos(a)} ${33 + 10.5 * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
                            fill="var(--m-line)" opacity="0.85" />;
                        })}
                        <circle cx="112" cy="33" r="8" fill="var(--machine-deep)" stroke="var(--m-line)" strokeWidth="1.2" />
                      </g>
                      {[34, 79, 112].map((ax) => <circle key={ax} cx={ax} cy="33" r="1.6" fill="var(--m-sub)" />)}
                      <circle cx="140" cy="33" r="3.2" fill="var(--crim-panel)" className={reduced ? undefined : "live-blink"} />
                      <text x="150" y="36" className="f-mono" fontSize="7" letterSpacing="1.6" fill="var(--m-sub)">RDY</text>
                    </svg>
                    <span className="f-mono text-[9px] tracking-[0.24em] ml-auto" style={{ color: "var(--m-sub)" }}>GEARBOX · IDLE</span>
                  </div>
                  <div className="mt-7 pt-4 f-mono text-[9px] tracking-[0.24em] flex justify-between"
                    style={{ borderTop: "1px solid var(--m-line)", color: "var(--m-sub)" }}>
                    <span>HOVER — PREVIEW · CLICK — LOCK · AGAIN — RELEASE</span>
                    <span>CORE/--</span>
                  </div>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
