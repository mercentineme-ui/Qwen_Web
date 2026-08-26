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
function Drop({ cx, cy, rx, ry = 4, o = 0.18 }: { cx: number; cy: number; rx: number; ry?: number; o?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity={o} />;
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
const CON_OUT = 232;
const CON_IN = 207;
const HSG_OUT = 205;
const HSG_IN = 170;
const IDX_OUT = 166;
const IDX_IN = 148;
const CHAMBER = 146;
const SEG_COUNT = 36;
const INNER_R = 112;       // transmission ring — counter-clockwise (rAF, surges)
const SECOND_R = 134;      // structural ring — clockwise (CSS, different speed)

const easeOut = (x: number) => 1 - (1 - x) * (1 - x);
const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const wrap = (d: number) => ((d + 180) % 360 + 360) % 360 - 180;
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/* a fold "window" — lets one joint unfold within a slice of the master morph,
   so the three joints open (and close) sequentially, not together */
const seg = (m: number, s: number, e: number) => clamp01((m - s) / (e - s));

/* 3-point folding pointer geometry — local "up" is the pointing direction */
const L1 = 44;   // pivot A → joint B
const L2 = 40;   // joint B → joint C
const HEAD = 26; // joint C → tip
const FOLD_A1 = 138; // arm1 folded angle (tucked back)
const FOLD_A2 = 148; // arm2 folded angle
const FOLD_TIP = 70; // head folded angle

/* one physical connector, drawn pointing "up"; caller rotates to capability angle */
function Connector({ on, sigKey, reduced }: { on: boolean; sigKey: number; reduced: boolean }) {
  const hot = on ? "var(--core-crimson)" : "var(--core-line)";
  const engage = (extra: string, delay = "0s") => ({
    transform: extra,
    transition: reduced ? "none" : `transform .5s cubic-bezier(.3,.9,.3,1.1) ${delay}, stroke .35s ease, fill .35s ease`,
  });
  return (
    <g>
      {/* attachment bracket at the module */}
      <rect x={C - 12} y={C - CON_OUT - 4} width="24" height="9" rx="2" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
      <circle cx={C - 8} cy={C - CON_OUT + 0.5} r="1.5" fill="var(--core-line)" />
      <circle cx={C + 8} cy={C - CON_OUT + 0.5} r="1.5" fill="var(--core-line)" />
      {/* short drive shaft */}
      <rect x={C - 3.5} y={C - CON_OUT + 5} width="7" height={CON_OUT - CON_IN - 14} rx="2"
        fill="var(--core-deep)" stroke={hot} strokeWidth={on ? 1.3 : 1} style={{ transition: "stroke .35s ease" }} />
      {/* sliding clutch collar — seats against the housing when engaged (staggered) */}
      <g style={engage(on ? "translateY(7px)" : "translateY(0)", ".12s")}>
        <rect x={C - 7} y={C - CON_IN - 16} width="14" height="9" rx="2"
          fill={on ? "var(--core-plate)" : "var(--core-deep)"} stroke={hot} strokeWidth="1.3" />
        <line x1={C - 5} y1={C - CON_IN - 11.5} x2={C + 5} y2={C - CON_IN - 11.5} stroke={hot} strokeWidth="1" opacity="0.8" />
      </g>
      {/* coupling joint — swells on engagement (staggered after shaft) */}
      <g style={engage(on ? "scale(1.12)" : "scale(1)", ".06s")} className="origin-center">
        <circle cx={C} cy={C - (CON_OUT + CON_IN) / 2} r="7.5" fill="var(--core-plate)" stroke={hot} strokeWidth="1.4" />
        <circle cx={C} cy={C - (CON_OUT + CON_IN) / 2} r="2.6" fill={on ? "var(--core-crimson)" : "var(--core-line)"} />
      </g>
      {/* gear interface teeth meshing the housing */}
      <g transform={`translate(${C} ${C - CON_IN + 2})`}>
        <g className={reduced ? undefined : on ? "gear-cw-fast" : "gear-cw"} style={{ animationDuration: on ? "4s" : "14s" }}>
          <GearShape r={9} teeth={7} fill="var(--core-deep)" stroke={hot} hub={false} />
        </g>
      </g>
      {/* inward signal (capability → core) + outward feedback, re-triggered per selection */}
      {on && !reduced && (
        <>
          <circle key={`in-${sigKey}`} cx={C} cy={C - CON_OUT + 6} r="3.2" fill="var(--core-crimson)">
            <animateMotion dur="0.7s" repeatCount="1" path={`M0,0 L0,${CON_OUT - CON_IN - 8}`} />
          </circle>
          <circle key={`out-${sigKey}`} cx={C} cy={C - CON_IN - 2} r="2.2" fill="var(--core-crimson)" opacity="0.4">
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

  /* signal key — re-triggers the connector travel pulse on every selection change */
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

  /* ============================================================
     THE LIVING MACHINE — one rAF drives:
       · inner transmission ring (counter-clockwise + 10s surge)
       · gear-pointer (gear ⇄ pointer physical transformation,
         weighted mouse-tracking while inside a capability node)
       · surge crimson sweep + central power boost
     ============================================================ */
  const discRef = useRef<HTMLDivElement>(null);
  const innerRingG = useRef<SVGGElement>(null);
  const sweepG = useRef<SVGGElement>(null);
  const gearBoostG = useRef<SVGGElement>(null);
  const heartbeatG = useRef<SVGGElement>(null);

  /* pointer refs — the 3-point folding arm */
  const ptrAimG = useRef<SVGGElement>(null);     // whole assembly: rotates about pivot A
  const ptrJointAG = useRef<SVGGElement>(null);  // joint A fold (arm1)
  const ptrJointBG = useRef<SVGGElement>(null);  // joint B fold (arm2)
  const ptrJointCG = useRef<SVGGElement>(null);  // joint C fold (head)
  const ptrBaseGearG = useRef<SVGGElement>(null);// pivot gear — the pointer's gear identity
  const ptrMidG = useRef<SVGGElement>(null);     // joint-B mesh gear (counter-rotates)
  const ptrTipGear = useRef<SVGGElement>(null);  // joint-C mesh gear
  const ptrCollarG = useRef<SVGGElement>(null);  // rotating collar + lock
  /* bottom output transmission refs */
  const outputGearG = useRef<SVGGElement>(null); // output gear (rAF rotation)
  const outputRingG = useRef<SVGGElement>(null); // segmented output ring (counter-rotates)
  const outputPulseG = useRef<SVGGElement>(null);// power stroke / surge pulse

  const m = useRef({
    rot: 0, rotV: 0,              // pointer aim angle + velocity (about pivot A)
    morph: 0, morphV: 0,          // 0 = compact gear, 1 = extended pointer
    gearSpin: 0,                  // pivot/base gear tooth rotation
    outputAng: 0,                 // bottom output gear rotation
    innerAng: 0,                  // transmission ring angle
    sweepAng: 0,
    surgeLast: 0, surgeStart: 0, bursting: false,
    mouseAng: 0,
    raf: 0, last: 0,
  });
  /* pointer contact zone = the whole Core disc. Inside → articulated clock hand
     tracking the cursor; outside → folded compact gear. The pivot never moves. */
  const insideRef = useRef(false);
  const onDiscMove = (e: React.MouseEvent) => {
    const el = discRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    m.current.mouseAng = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    insideRef.current = true;
  };
  const onDiscLeave = () => { insideRef.current = false; };

  /* reduced motion: park the pointer extended toward the selected capability */
  useEffect(() => {
    if (!reduced) return;
    ptrAimG.current?.setAttribute("transform", `rotate(${nodeAngle(sel)} ${C} ${C})`);
    ptrJointAG.current?.setAttribute("transform", "rotate(0)");
    ptrJointBG.current?.setAttribute("transform", `translate(0 ${-L1}) rotate(0)`);
    ptrJointCG.current?.setAttribute("transform", `translate(0 ${-L2}) rotate(0)`);
  }, [reduced, sel]);

  useEffect(() => {
    if (reduced) return;
    const loop = (t: number) => {
      const s = m.current;
      const dt = Math.min(0.045, s.last ? (t - s.last) / 1000 : 0.016);
      s.last = t;

      /* ---------- 10s mechanical surge envelope ---------- */
      if (!s.bursting && t - s.surgeLast >= 10000) {
        s.bursting = true; s.surgeStart = t; s.surgeLast = t;
      }
      let burst = 0;
      if (s.bursting) {
        const bt = (t - s.surgeStart) / 1000;
        if (bt < 0.3) burst = easeOut(bt / 0.3);            // pressure builds
        else if (bt < 1.0) burst = 1;                        // ~1s power burst
        else if (bt < 1.9) burst = 1 - easeInOut((bt - 1.0) / 0.9); // natural decay
        else { burst = 0; s.bursting = false; }
      }

      /* ---------- inner transmission ring: ccw, accelerated by surge ---------- */
      const innerSpeed = -7 - burst * 340;   // deg/s, negative = counter-clockwise
      s.innerAng = (s.innerAng + innerSpeed * dt) % 360;
      innerRingG.current?.setAttribute("transform", `rotate(${s.innerAng.toFixed(2)} ${C} ${C})`);

      /* surge sweep + central power boost (no re-render — direct attrs) */
      s.sweepAng = (s.sweepAng + (50 + burst * 620) * dt) % 360;
      if (sweepG.current) {
        sweepG.current.setAttribute("transform", `rotate(${s.sweepAng.toFixed(1)} ${C} ${C})`);
        sweepG.current.setAttribute("opacity", (burst * 0.75).toFixed(2));
      }
      gearBoostG.current?.setAttribute("transform", `rotate(${(burst * 26).toFixed(1)} ${C} ${C})`);
      heartbeatG.current?.setAttribute("transform", `translate(${C} ${C}) scale(${(1 + burst * 0.16).toFixed(3)}) translate(${-C} ${-C})`);

      /* ---------- gear ⇄ pointer transformation ---------- */
      const tracking = insideRef.current;
      const morphTarget = tracking ? 1 : 0;

      /* morph spring (physical unfold / fold) */
      s.morphV += ((morphTarget - s.morph) * 60 - s.morphV * 11) * dt;
      s.morph = Math.max(0, Math.min(1.03, s.morph + s.morphV * dt));
      const morph = Math.min(1, s.morph);

      /* angle: track mouse while in contact; free gear-spin when parked */
      if (tracking) {
        const dA = wrap(s.mouseAng - s.rot);
        s.rotV += (dA * 42 - s.rotV * 9.5) * dt;      // weighted, slight overshoot
        s.rot += s.rotV * dt;
      } else {
        /* idle: the folded mechanism spins as a working gear assembly */
        s.rot += 26 * (1 - morph) * dt;
        s.rotV = 0;
      }

      /* ---------- 3-point folding: joints open/close sequentially ---------- */
      const ext1 = easeInOut(seg(morph, 0.00, 0.50)); // pivot arm unfolds first
      const ext2 = easeInOut(seg(morph, 0.22, 0.72)); // then the second arm
      const ext3 = easeInOut(seg(morph, 0.45, 1.00)); // then the head settles
      const a1 = lerp(FOLD_A1, 0, ext1);
      const a2 = lerp(FOLD_A2, 0, ext2);
      const tipA = lerp(FOLD_TIP, 0, ext3);

      ptrAimG.current?.setAttribute("transform", `rotate(${s.rot.toFixed(2)} ${C} ${C})`);
      ptrJointAG.current?.setAttribute("transform", `rotate(${a1.toFixed(2)})`);
      ptrJointBG.current?.setAttribute("transform", `translate(0 ${-L1}) rotate(${a2.toFixed(2)})`);
      ptrJointCG.current?.setAttribute("transform", `translate(0 ${-L2}) rotate(${tipA.toFixed(2)})`);

      /* pivot gear teeth spin — fast when parked (gear identity), slow when driving */
      s.gearSpin += ((1 - morph) * 120 + 24 + burst * 200) * dt;
      ptrBaseGearG.current?.setAttribute("transform", `rotate(${(s.gearSpin % 360).toFixed(1)})`);
      /* joint gears counter-mesh against the arms */
      ptrMidG.current?.setAttribute("transform", `rotate(${(-s.gearSpin * 1.5 % 360).toFixed(1)})`);
      ptrTipGear.current?.setAttribute("transform", `rotate(${(s.gearSpin * 1.2 % 360).toFixed(1)})`);
      /* rotating collar + lock — seats down as the pointer engages */
      ptrCollarG.current?.setAttribute("transform",
        `rotate(${(s.rot * 0.35 % 360).toFixed(1)} ${C} ${C}) translate(0 ${(2.5 * morph).toFixed(1)})`);

      /* ---------- bottom output transmission: medium speed, surge + load ---------- */
      const outSpeed = 30 + burst * 190 + (tracking ? 26 : 0);
      s.outputAng = (s.outputAng + outSpeed * dt) % 360;
      outputGearG.current?.setAttribute("transform", `rotate(${s.outputAng.toFixed(1)})`);
      outputRingG.current?.setAttribute("transform", `rotate(${(-s.outputAng * 0.6 % 360).toFixed(1)})`);
      outputPulseG.current?.setAttribute("transform", `scale(${(1 + burst * 0.1 + (tracking ? 0.04 : 0)).toFixed(3)})`);

      s.raf = requestAnimationFrame(loop);
    };
    m.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(m.current.raf);
  }, [reduced]);

  const spin = (s?: string) => (reduced || !s ? undefined : s);

  /* theme-aware node materials — active inverts to the opposite structural tone,
     never defaults to crimson (crimson stays a micro-accent) */
  const nodeFill = (active: boolean, hover: boolean) =>
    active ? "var(--core-inv)"
      : hover ? "var(--core-deep)"
      : "var(--core-plate)";
  const nodeIcon = (active: boolean) =>
    active ? (theme === "dark" ? "var(--core-deep)" : "var(--core-plate)") : "var(--core-mid)";

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
            <div ref={discRef} onMouseMove={onDiscMove} onMouseLeave={onDiscLeave}
              className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <div className={`mech-stage ${rebuilding ? "mech-rebuild" : ""}`} style={frozen ?? undefined}>
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`}>
                  <defs>
                    <radialGradient id="coreChamberDepth" cx="50%" cy="42%" r="65%">
                      <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                      <stop offset="78%" stopColor="rgba(0,0,0,0.10)" />
                      <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
                    </radialGradient>
                  </defs>

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

                  {/* ============ LAYER 1 — OUTER HOUSING ============ */}
                  <g className="rb-a">
                    <Drop cx={C} cy={C + 8} rx={HSG_OUT + 8} ry={HSG_OUT + 2} o={0.14} />
                    <circle cx={C} cy={C} r={HSG_OUT} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="2" />
                    <path d={`M${polar(C, C, HSG_OUT - 2, 205)[0]} ${polar(C, C, HSG_OUT - 2, 205)[1]} A${HSG_OUT - 2} ${HSG_OUT - 2} 0 0 1 ${polar(C, C, HSG_OUT - 2, 335)[0]} ${polar(C, C, HSG_OUT - 2, 335)[1]}`}
                      fill="none" stroke="var(--core-inv)" strokeWidth="1.4" opacity="0.2" strokeLinecap="round" />
                    <circle cx={C} cy={C} r={HSG_OUT - 7} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.2" />
                    {Array.from({ length: 12 }).map((_, i) => {
                      const [x, y] = polar(C, C, HSG_OUT - 17, i * 30 + 15);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="4" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                          <line x1={x - 2} y1={y} x2={x + 2} y2={y} stroke="var(--core-line)" strokeWidth="1" transform={`rotate(${i * 30} ${x} ${y})`} />
                        </g>
                      );
                    })}
                    <circle cx={C} cy={C} r={HSG_IN + 9} fill="none" stroke="var(--core-line)" strokeWidth="1" strokeDasharray="14 9" opacity="0.55" />
                    <circle cx={C} cy={C} r={HSG_IN} fill="none" stroke="var(--core-line)" strokeWidth="1.6" />
                    <circle cx={C} cy={C} r={HSG_IN - 3} fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="3" opacity="0.5" />
                  </g>

                  {/* ============ LAYER 2 — PHYSICAL CONNECTORS ============ */}
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
                    {/* static tick ring just below — parallax reference as the index ring turns above it */}
                    <circle cx={C} cy={C} r={IDX_IN - 1} fill="none" stroke="var(--core-mid)" strokeWidth="0.7" strokeDasharray="1.5 5" opacity="0.5" />
                    {/* FIRST INNER INDEXING RING — rotates continuously clockwise, carrying the crimson marker */}
                    <g className={spin("idx-ring-spin")}>
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
                    </g>
                    {/* idle orbit signal circling the capability orbit */}
                    {!reduced && (
                      <circle r="2.6" fill="var(--core-crimson)" opacity="0.3">
                        <animateMotion dur="26s" repeatCount="indefinite" path={`M ${C},${C - 245} a 245,245 0 1,1 -0.1,0 z`} />
                      </circle>
                    )}
                  </g>

                  {/* ============ LAYER 4 — RECESSED CHAMBER + COUNTER-ROTATING RINGS ============ */}
                  <g className="rb-c">
                    {/* chamber floor — progressively deeper */}
                    <circle cx={C} cy={C} r={CHAMBER} fill="var(--core-deep)" />
                    <circle cx={C} cy={C} r={CHAMBER} fill="url(#coreChamberDepth)" />
                    <circle cx={C} cy={C} r={CHAMBER} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="4" opacity="0.5" />
                    <circle cx={C} cy={C} r={132} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="2" opacity="0.5" />
                    {[126, 96, 66].map((r) => (
                      <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="var(--core-line)" strokeWidth="0.7" opacity="0.3" />
                    ))}

                    {/* asymmetric radial structural members */}
                    <g stroke="var(--core-line)" fill="var(--core-plate)">
                      <g transform={`rotate(35 ${C} ${C})`}>
                        <rect x={C - 7} y={C - 140} width="14" height="66" rx="2" strokeWidth="1.2" />
                        <line x1={C - 3} y1={C - 134} x2={C - 3} y2={C - 80} stroke="var(--core-inv)" strokeWidth="1" opacity="0.25" />
                      </g>
                      <g transform={`rotate(215 ${C} ${C})`}>
                        <rect x={C - 5} y={C - 138} width="10" height="60" rx="2" fill="var(--core-deep)" strokeWidth="1" />
                      </g>
                      <g transform={`rotate(275 ${C} ${C})`}>
                        {[0, 1, 2].map((sg) => (
                          <rect key={sg} x={C - 6} y={C - 136 + sg * 22} width="12" height="17" rx="2" strokeWidth="1.1" />
                        ))}
                      </g>
                      <g transform={`rotate(140 ${C} ${C})`}>
                        <rect x={C - 4} y={C - 132} width="8" height="54" rx="2" strokeWidth="1" />
                        <circle cx={C} cy={C - 132} r="4" fill="var(--core-deep)" strokeWidth="1" />
                        <circle cx={C} cy={C - 78} r="4" fill="var(--core-deep)" strokeWidth="1" />
                      </g>
                    </g>

                    {/* SECONDARY RING (r=134) — rotates CLOCKWISE, its own speed */}
                    <g className={spin("gear-cw")} style={{ animationDuration: "74s" }}>
                      <circle cx={C} cy={C} r={SECOND_R} fill="none" stroke="var(--core-plate)" strokeWidth="7" />
                      {Array.from({ length: 8 }).map((_, i) => {
                        const [x, y] = polar(C, C, SECOND_R, i * 45 + 22.5);
                        return <circle key={i} cx={x} cy={y} r="2.4" fill="var(--core-line)" />;
                      })}
                      <circle cx={C} cy={C} r={SECOND_R} fill="none" stroke="var(--core-line)" strokeWidth="1" strokeDasharray="2 10" opacity="0.7" />
                    </g>

                    {/* INNER TRANSMISSION RING (r=112) — rotates COUNTER-CLOCKWISE (rAF, surges) */}
                    <g ref={innerRingG}>
                      <circle cx={C} cy={C} r={INNER_R} fill="none" stroke="var(--core-plate)" strokeWidth="9" />
                      {Array.from({ length: 40 }).map((_, i) => {
                        const [x, y] = polar(C, C, INNER_R, i * 9);
                        return <rect key={i} x={x - 2} y={y - 2} width="4" height="4" fill="var(--core-line)" opacity="0.7" transform={`rotate(${i * 9} ${x} ${y})`} />;
                      })}
                      <circle cx={C} cy={C} r={INNER_R} fill="none" stroke="var(--core-mid)" strokeWidth="1" strokeDasharray="6 12" opacity="0.5" />
                    </g>

                    {/* surge sweep — crimson arc, opacity driven by the rAF burst */}
                    <g ref={sweepG} opacity="0">
                      <circle cx={C} cy={C} r={INNER_R} fill="none" stroke="var(--core-crimson)" strokeWidth="2.4" strokeDasharray="40 60" strokeLinecap="round" />
                      <circle cx={C} cy={C} r={INNER_R - 8} fill="none" stroke="var(--core-crimson)" strokeWidth="1.2" strokeDasharray="8 26" opacity="0.7" />
                    </g>
                  </g>

                  {/* ============ LAYER 5 — CENTRAL GEAR ASSEMBLY + OUTPUT TRANSMISSION ============ */}
                  <g className="rb-d">
                    {/* BACK — recessed transmission plate the hub is mounted on */}
                    <circle cx={C} cy={C} r={72} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.4" />
                    <circle cx={C} cy={C} r={72} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="3" opacity="0.4" />
                    {Array.from({ length: 8 }).map((_, i) => {
                      const [x, y] = polar(C, C, 64, i * 45 + 22.5);
                      return <circle key={i} cx={x} cy={y} r="2.2" fill="var(--core-line)" opacity="0.8" />;
                    })}
                    <circle cx={C} cy={C} r={56} fill="none" stroke="var(--core-line)" strokeWidth="0.8" strokeDasharray="3 6" opacity="0.5" />

                    <Drop cx={C} cy={C + 7} rx={58} ry={52} o={0.16} />
                    {/* MID — main drive + secondary + transfer gears (boosted by surge) */}
                    <g ref={gearBoostG}>
                      <g transform={`translate(${C} ${C})`}>
                        <g className={spin("gear-cw")} style={{ animationDuration: "34s" }}>
                          <GearShape r={50} teeth={20} fill="var(--core-plate)" stroke="var(--core-line)" spokes={5} />
                        </g>
                      </g>
                      <g transform={`translate(${polar(C, C, 79, -45).join(" ")})`}>
                        <g className={spin("gear-ccw")} style={{ animationDuration: "20s" }}>
                          <GearShape r={29} teeth={13} fill="var(--core-deep)" stroke="var(--core-line)" spokes={4} />
                        </g>
                      </g>
                      <g transform={`translate(${polar(C, C, 79, -45)[0] + 40} ${polar(C, C, 79, -45)[1] + 30})`}>
                        <g className={spin("gear-cw")} style={{ animationDuration: "9s" }}>
                          <GearShape r={16} teeth={9} fill="var(--core-plate)" stroke="var(--core-line)" hub={false} />
                        </g>
                      </g>
                    </g>

                    {/* BOTTOM OUTPUT TRANSMISSION — central drive → shaft → idler → output gear.
                       Rotates at its own medium speed (rAF), responds to load + surge. */}
                    <g>
                      {/* drive shaft from the main gear down to the idler */}
                      <rect x={C - 2.5} y={C + 46} width="5" height="16" rx="2" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="0.9" />
                      {/* idler / bevel gear at the junction */}
                      <g transform={`translate(${C} ${C + 60})`}>
                        <g className={spin("gear-ccw")} style={{ animationDuration: "12s" }}>
                          <GearShape r={8} teeth={7} fill="var(--core-plate)" stroke="var(--core-line)" hub={false} />
                        </g>
                      </g>
                      {/* short shaft to the output gear */}
                      <rect x={C - 2} y={C + 62} width="4" height="12" rx="2" fill="var(--core-line)" />
                      {/* output assembly */}
                      <g transform={`translate(${C} ${C + 84})`}>
                        <Drop cx={0} cy={4} rx={26} ry={20} o={0.14} />
                        {/* segmented output ring (counter-rotates, slower) */}
                        <g ref={outputRingG}>
                          <circle r={26} fill="none" stroke="var(--core-plate)" strokeWidth="4.5" />
                          {Array.from({ length: 16 }).map((_, i) => {
                            const [x, y] = polar(0, 0, 26, i * 22.5);
                            return <rect key={i} x={x - 1.6} y={y - 1.6} width="3.2" height="3.2" fill="var(--core-mid)" opacity="0.75" transform={`rotate(${i * 22.5} ${x} ${y})`} />;
                          })}
                        </g>
                        {/* output gear (rAF rotation) */}
                        <g ref={outputPulseG}>
                          <g ref={outputGearG}>
                            <GearShape r={18} teeth={11} fill="var(--core-deep)" stroke="var(--core-mid)" spokes={4} />
                          </g>
                          {/* bearing + crimson output indicator */}
                          <circle r={5.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
                          <circle r={2.2} fill="var(--core-crimson)" />
                        </g>
                      </g>
                      {/* crimson power signal traveling hub → output on activation / surge */}
                      {!reduced && sel !== null && (
                        <circle key={`pwr-${sigKey}`} cx={C} cy={C + 50} r="2.4" fill="var(--core-crimson)" opacity="0.85">
                          <animateMotion dur="0.6s" repeatCount="1" path="M0,0 L0,34" />
                        </circle>
                      )}
                    </g>

                    {/* FRONT — hub bearing stack under the pointer pivot */}
                    <circle cx={C} cy={C} r={21} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.5" />
                    <circle cx={C} cy={C} r={14} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
                  </g>

                  {/* ============ LAYER 6 — ARTICULATED CLOCKWORK POINTER + HEARTBEAT ============
                        pivot A → joint B → joint C → head. Idle = compact spinning gear
                        folded around the bearing; contact = narrow machined clock hand. */}
                  <g className="rb-f">
                    <g ref={ptrAimG}>
                      <g transform={`translate(${C} ${C})`}>
                        {/* ---- JOINT A fold: primary arm (A → B), tapered + machined ---- */}
                        <g ref={ptrJointAG}>
                          {/* contact shadow — arm floats above the dial */}
                          <polygon points={`-5.5,2 -3.4,${-L1} 3.4,${-L1} 5.5,2`} fill="#000" opacity="0.14" transform="translate(1.6 2.6)" />
                          {/* arm body */}
                          <polygon points={`-5.5,2 -3.4,${-L1} 3.4,${-L1} 5.5,2`}
                            fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1.1} />
                          {/* bright machined edge */}
                          <line x1={-2.3} y1={-5} x2={-1.4} y2={-L1 + 4} stroke="var(--core-inv)" strokeWidth={0.9} opacity={0.3} />
                          {/* recessed drive groove */}
                          <line x1={0.6} y1={-7} x2={0.4} y2={-L1 + 6} stroke="var(--core-deep)" strokeWidth={1.6} opacity={0.55} />
                          {/* rack teeth along the trailing edge */}
                          {Array.from({ length: 5 }).map((_, i) => (
                            <rect key={i} x={3.1} y={-L1 + 8 + i * 7} width={2.3} height={3.2} rx={0.7} fill="var(--core-line)" opacity={0.9} />
                          ))}

                          {/* ---- JOINT B fold: secondary arm (B → C) ---- */}
                          <g transform={`translate(0 ${-L1})`}>
                            <g ref={ptrJointBG}>
                              <polygon points={`-3.4,2 -2.1,${-L2} 2.1,${-L2} 3.4,2`} fill="#000" opacity="0.13" transform="translate(1.4 2.2)" />
                              <polygon points={`-3.4,2 -2.1,${-L2} 2.1,${-L2} 3.4,2`}
                                fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
                              <line x1={-1.3} y1={-4} x2={-0.8} y2={-L2 + 3} stroke="var(--core-inv)" strokeWidth={0.8} opacity={0.28} />
                              {/* joint-B mesh gear (counter-rotates against the arm) */}
                              <g ref={ptrMidG}>
                                <GearShape r={8.5} teeth={8} fill="var(--core-plate)" stroke="var(--core-line)" hub={false} />
                              </g>

                              {/* ---- JOINT C fold: pointer head ---- */}
                              <g transform={`translate(0 ${-L2})`}>
                                <g ref={ptrJointCG}>
                                  {/* head contact shadow */}
                                  <polygon points={`0,${-HEAD} 3.9,${-HEAD + 12} 2.4,-5 -2.4,-5 -3.9,${-HEAD + 12}`}
                                    fill="#000" opacity="0.14" transform="translate(1.3 2)" />
                                  {/* tapered needle body — narrow, elegant */}
                                  <polygon points={`0,${-HEAD} 3.9,${-HEAD + 12} 2.4,-5 -2.4,-5 -3.9,${-HEAD + 12}`}
                                    fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1} />
                                  <line x1={-1.5} y1={-7} x2={-0.7} y2={-HEAD + 10} stroke="var(--core-inv)" strokeWidth={0.7} opacity={0.3} />
                                  {/* mechanical collar at the head base */}
                                  <rect x={-4.2} y={-10.5} width={8.4} height={4} rx={1.4} fill="var(--core-line)" />
                                  {/* articulation gear where the head folds */}
                                  <g ref={ptrTipGear}>
                                    <GearShape r={5.6} teeth={7} fill="var(--core-deep)" stroke="var(--core-mid)" hub={false} />
                                  </g>
                                  {/* crimson tip + tiny indicator */}
                                  <polygon points={`0,${-HEAD - 6} 2.8,${-HEAD + 2.5} -2.8,${-HEAD + 2.5}`} fill="var(--core-crimson)" />
                                  <circle cy={-HEAD + 5} r={1.1} fill="var(--core-crimson)" />
                                </g>
                                {/* joint C bearing (recessed) */}
                                <circle r={3} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                                <circle cx={-0.8} cy={-0.8} r={0.7} fill="var(--core-inv)" opacity={0.6} />
                              </g>
                            </g>
                            {/* joint B bearing (recessed) */}
                            <circle r={3.4} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1.1} />
                            <circle cx={-0.9} cy={-0.9} r={0.8} fill="var(--core-inv)" opacity={0.6} />
                          </g>
                        </g>

                        {/* ---- pivot gear: the pointer's gear identity when parked (spins) ---- */}
                        <g ref={ptrBaseGearG}>
                          <GearShape r={20} teeth={12} fill="var(--core-deep)" stroke="var(--core-mid)" />
                        </g>
                      </g>
                    </g>

                    {/* ---- FIXED CENTRAL BEARING MOUNT — the permanent anchor. Never rotates. ---- */}
                    <circle cx={C} cy={C} r={24.5} fill="none" stroke="var(--core-line)" strokeWidth={0.9} opacity={0.6} />
                    <circle cx={C} cy={C} r={22} fill="none" stroke="var(--core-deep)" strokeWidth={5} />
                    <circle cx={C} cy={C} r={19.5} fill="none" stroke="var(--core-line)" strokeWidth={0.9} opacity={0.7} />
                    {[45, 135, 225, 315].map((deg) => {
                      const [bx, by] = polar(C, C, 22, deg);
                      return <circle key={deg} cx={bx} cy={by} r={1.6} fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth={0.6} />;
                    })}

                    {/* ---- rotating locking collar around the bearing (seats on engagement) ---- */}
                    <g ref={ptrCollarG}>
                      <circle cx={C} cy={C} r={27} fill="none" stroke="var(--core-mid)" strokeWidth={1.4} strokeDasharray="8 6" opacity={0.9} />
                      <rect x={C - 2.6} y={C - 30.5} width={5.2} height={3.6} rx={1.1} fill="var(--core-line)" />
                      <rect x={C - 2.6} y={C + 26.9} width={5.2} height={3.6} rx={1.1} fill="var(--core-line)" />
                    </g>

                    {/* CORE HEARTBEAT — the crimson pivot jewel */}
                    <g ref={heartbeatG}>
                      <g className={spin("core-beat")}>
                        <circle cx={C} cy={C} r={4.6} fill="var(--core-crimson)" />
                        <circle cx={C} cy={C} r={1.4} fill="var(--core-inv)" />
                      </g>
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
                    {/* grounding shadow so the module sits above the field */}
                    <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-14 h-2 rounded-full"
                      style={{ background: "#000", opacity: isActive ? 0.28 : 0.16, filter: "blur(3px)", transition: "opacity .3s ease" }} />
                    <span className="relative grid place-items-center transition-all duration-400 mat-texture"
                      style={{
                        width: 74, height: 74,
                        clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
                        backgroundColor: nodeFill(isActive, isHover),
                        color: nodeIcon(isActive),
                        boxShadow: isActive
                          ? `inset 0 0 0 1.5px ${theme === "dark" ? "var(--core-mid)" : "var(--core-line)"}, inset 0 -8px 14px rgba(0,0,0,0.2), 0 14px 28px -14px rgba(0,0,0,0.5)`
                          : isHover
                            ? "inset 0 0 0 1.5px var(--core-mid), 0 10px 22px -14px rgba(0,0,0,0.45)"
                            : "inset 0 0 0 1.5px color-mix(in srgb, var(--core-line) 60%, transparent), 0 8px 18px -14px rgba(0,0,0,0.4)",
                        transform: isHover && !isActive ? "translateY(-2px)" : "none",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${isActive ? "bg-[var(--core-crimson)] text-[#f4f2ed]" : "bg-[var(--core-deep)] text-[var(--core-mid)]"}`}>
                        {dis.num}
                      </span>
                      {/* mechanical coupling — wakes on hover, engages on active */}
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-[3px]">
                        <span className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                          style={{ background: isActive ? "var(--core-crimson)" : "var(--core-line)", transform: isActive ? "scale(1.25)" : "scale(1)" }} />
                        <span className="w-3 h-[2px] rounded-full transition-all duration-300"
                          style={{ background: isActive || isHover ? "var(--core-crimson)" : "var(--core-line)", opacity: isActive ? 1 : isHover ? 0.7 : 0.5, transform: `scaleX(${isActive ? 1 : isHover ? 0.7 : 0.45})` }} />
                      </span>
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
