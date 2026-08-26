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

function Drop({ cx, cy, rx, ry = 4 }: { cx: number; cy: number; rx: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity="0.2" />;
}

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
   NINE COUPLING MECHANISMS — compact stations on the stationary
   mounting ring (radial band y 124–148 canonical "up"). Each uses
   a different physical principle; `on` = its capability is active.
   ============================================================ */
function Coupling({ i, on, reduced }: { i: number; on: boolean; reduced: boolean }) {
  const dur = (base: string, fast: string) => (on ? fast : base);
  const hot = on ? "var(--machine-crimson-hot)" : "var(--core-line)";
  const spin = (s?: string) => (reduced || !s ? undefined : s);

  switch (i) {
    case 0: return ( // piston
      <g>
        <rect x="291" y="125" width="18" height="14" rx="2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.1" />
        <g className={spin("piston")} style={{ animationDuration: dur("2.8s", "1.2s") }}>
          <rect x="295" y="127" width="10" height="6" rx="1" fill={hot} stroke="var(--core-deep)" strokeWidth="0.8" style={{ transition: "fill .35s ease" }} />
          <line x1="300" y1="133" x2="300" y2="146" stroke="var(--core-line)" strokeWidth="2.2" strokeLinecap="round" />
        </g>
      </g>
    );
    case 1: return ( // gear pair
      <g>
        <g transform="translate(300 132)"><g className={spin(on ? "gear-cw-fast" : "gear-cw")} style={{ animationDuration: dur("14s", "4s") }}><GearShape r={10} teeth={8} fill="var(--core-deep)" stroke={hot} hub={false} /></g></g>
        <g transform="translate(300 145)"><g className={spin("gear-ccw")} style={{ animationDuration: dur("9s", "3s") }}><GearShape r={6.5} teeth={6} fill="var(--core-line)" hub={false} /></g></g>
      </g>
    );
    case 2: return ( // sliding block on rail
      <g>
        <line x1="300" y1="125" x2="300" y2="147" stroke="var(--core-line)" strokeWidth="1" opacity="0.55" />
        <line x1="293" y1="125" x2="293" y2="147" stroke="var(--core-line)" strokeWidth="1" opacity="0.35" />
        <line x1="307" y1="125" x2="307" y2="147" stroke="var(--core-line)" strokeWidth="1" opacity="0.35" />
        <g className={spin("piston")} style={{ animationDuration: dur("3.2s", "1.4s") }}>
          <rect x="292" y="131" width="16" height="8" rx="1.5" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="0.9" />
          <circle cx="300" cy="135" r="1.8" fill={hot} style={{ transition: "fill .35s ease" }} />
        </g>
      </g>
    );
    case 3: return ( // clutch discs
      <g>
        <g transform="translate(300 131)"><g className={spin("gear-cw")} style={{ animationDuration: dur("12s", "3.6s") }}>
          <circle r="8.5" fill="var(--core-deep)" stroke={hot} strokeWidth="1.1" style={{ transition: "stroke .35s ease" }} />
          {[0, 90, 180, 270].map((d) => <rect key={d} x="-1.6" y="-10.5" width="3.2" height="4" rx="0.8" transform={`rotate(${d})`} fill="var(--core-line)" />)}
        </g></g>
        <g transform="translate(300 144)"><g className={spin("gear-ccw")} style={{ animationDuration: dur("12s", "3.6s") }}>
          <circle r="6.5" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="1" />
          {[45, 135, 225, 315].map((d) => <rect key={d} x="-1.4" y="-8.5" width="2.8" height="3.4" rx="0.8" transform={`rotate(${d})`} fill="var(--core-deep)" />)}
        </g></g>
      </g>
    );
    case 4: return ( // belt + wheels
      <g>
        <line x1="293" y1="130" x2="293" y2="144" stroke={hot} strokeWidth="1.3" className={spin("channel-flow")} style={{ transition: "stroke .35s ease" }} />
        <line x1="307" y1="130" x2="307" y2="144" stroke={hot} strokeWidth="1.3" className={spin("channel-flow")} style={{ transition: "stroke .35s ease" }} />
        <g transform="translate(300 130)"><g className={spin("gear-cw")} style={{ animationDuration: dur("8s", "2.6s") }}><GearShape r={7} teeth={6} fill="var(--core-deep)" stroke={hot} hub={false} /></g></g>
        <g transform="translate(300 144)"><g className={spin("gear-cw")} style={{ animationDuration: dur("8s", "2.6s") }}><GearShape r={7} teeth={6} fill="var(--core-deep)" stroke="var(--core-line)" hub={false} /></g></g>
      </g>
    );
    case 5: return ( // crank arm
      <g>
        <rect x="295" y="124" width="10" height="5" rx="1.5" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="0.9" />
        <g transform="translate(300 138)"><g className={spin("gear-cw")} style={{ animationDuration: dur("5s", "1.8s") }}>
          <line x1="0" y1="0" x2="0" y2="-9" stroke="var(--core-line)" strokeWidth="2.8" strokeLinecap="round" />
          <circle cy="-9" r="2.4" fill={hot} style={{ transition: "fill .35s ease" }} />
          <circle r="3.6" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="1" />
        </g></g>
      </g>
    );
    case 6: return ( // heavy gear + pinion
      <g>
        <g transform="translate(300 134)"><g className={spin(on ? "gear-ccw" : "gear-ccw-slow")} style={{ animationDuration: dur("24s", "7s") }}><GearShape r={12.5} teeth={10} fill="var(--core-deep)" stroke={hot} spokes={4} /></g></g>
        <g transform="translate(300 147)"><g className={spin("gear-cw")} style={{ animationDuration: dur("10s", "3s") }}><GearShape r={5.5} teeth={6} fill="var(--core-line)" hub={false} /></g></g>
      </g>
    );
    case 7: return ( // scissor linkage
      <g>
        <g className={spin("valve-wiggle")} style={{ transformOrigin: "300px 136px", animationDuration: dur("4s", "1.6s") }}>
          <line x1="293" y1="125" x2="307" y2="147" stroke="var(--core-line)" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="307" y1="125" x2="293" y2="147" stroke="var(--core-line)" strokeWidth="2.2" strokeLinecap="round" />
        </g>
        <circle cx="300" cy="136" r="2.8" fill="var(--core-deep)" stroke={hot} strokeWidth="1.1" style={{ transition: "stroke .35s ease" }} />
        <circle cx="293" cy="125" r="1.8" fill="var(--core-line)" /><circle cx="307" cy="125" r="1.8" fill="var(--core-line)" />
        <circle cx="293" cy="147" r="1.8" fill="var(--core-line)" /><circle cx="307" cy="147" r="1.8" fill="var(--core-line)" />
      </g>
    );
    default: return ( // mini escapement
      <g>
        <g transform="translate(300 132)"><g className={spin(on ? "gear-cw-fast" : "gear-cw")} style={{ animationDuration: dur("16s", "4.5s") }}><GearShape r={8} teeth={7} fill="var(--core-deep)" stroke={hot} hub={false} /></g></g>
        <g className={spin("escapement")} style={{ transformOrigin: "300px 144px" }}>
          <path d="M294 140 L300 148 L306 140" fill="none" stroke={hot} strokeWidth="1.8" strokeLinecap="round" style={{ transition: "stroke .35s ease" }} />
        </g>
      </g>
    );
  }
}

/* ============================================================
   GEOMETRY — one closed mechanical story, deliberately asymmetric:
   STEAM piston → CRANK wheel (planet B) → rotating TRANSMISSION
   RING → MAIN DRIVE (planet A) → HUB (shaft) + REGULATOR (pinion).
   Flywheel rides the crankshaft; gauge/valve/pipe serve the cylinder.
   ============================================================ */
const C = 300;
const A_POS = { x: 346, y: 172, r: 34 };            // main drive — upper right
const B_POS = { x: 207, y: 410, r: 26 };            // crank wheel — lower left
const C_POS = { x: 151, y: 327, r: 15 };            // idler — mid left
const CRANK_R = 16, ROD_L = 76, PISTON_X = 160, PISTON_MID = 354;
const ESC = { x: 439, y: 220, r: 19 };              // escape wheel
const BAL = { x: 417, y: 248, r: 21 };              // balance wheel
const PIN = { x: 414, y: 206, r: 8 };               // regulator pinion
const GAU = { x: 136, y: 292, r: 24 };              // pressure gauge
const VAL = { x: 150, y: 316 };                     // steam valve
const HUB = { r: 25 };
const W = { ring: 14, B: 91.5, A: 70, C: 158.7, small: 152 }; // deg/s at full speed

const easeIO = (x: number) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));

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

  useEffect(() => {
    if (reduced || locked || hoverIdx !== null) return;
    const iv = window.setInterval(() => setAutoIdx((a) => (a + 1) % N), 20000);
    return () => clearInterval(iv);
  }, [reduced, locked, hoverIdx, N]);

  const pick = (i: number) => {
    if (locked && lockedIdx === i) { setLockedIdx(null); setAutoIdx(i); }
    else setLockedIdx(i);
  };

  /* ---- theme switch: the machine slows, dismantles, rebuilds ---- */
  const [rebuilding, setRebuilding] = useState(false);
  const rebuildingRef = useRef(false);
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
        });
        rebuildingRef.current = true;
        setRebuilding(true);
        const t = window.setTimeout(() => {
          rebuildingRef.current = false;
          setRebuilding(false);
          setFrozen(null);
        }, 1560);
        return () => clearTimeout(t);
      }
    }
  }, [theme, reduced]);

  /* ---- the simulation: one rAF drives every mechanism with real
         cause-and-effect (crank angle integrates the piston/rod),
         a staged startup ramp, and an off-viewport pause. ---- */
  const boxRef = useRef<HTMLDivElement>(null);
  const ringG = useRef<SVGGElement>(null);
  const gearAG = useRef<SVGGElement>(null);
  const gearBG = useRef<SVGGElement>(null);
  const gearCG = useRef<SVGGElement>(null);
  const flyG = useRef<SVGGElement>(null);
  const crankG = useRef<SVGGElement>(null);
  const rodL = useRef<SVGLineElement>(null);
  const rodH = useRef<SVGLineElement>(null);
  const pistonG = useRef<SVGGElement>(null);
  const hubGearG = useRef<SVGGElement>(null);
  const hubRingG = useRef<SVGGElement>(null);
  const smallG = useRef<SVGGElement>(null);
  const escG = useRef<SVGGElement>(null);
  const anchorG = useRef<SVGGElement>(null);
  const balG = useRef<SVGGElement>(null);
  const needleG = useRef<SVGGElement>(null);
  const valveG = useRef<SVGGElement>(null);
  const tensG = useRef<SVGGElement>(null);
  const pinGs = useRef<(SVGGElement | null)[]>([]);

  const sim = useRef({
    t: 0, last: 0, ease: 0, started: false, raf: 0,
    ringA: 8, bA: -35, aA: 22, cA: -60, smallA: -40,
    escT: 0, escStep: 2, escA: 48, anchorA: -7, balT: 0,
    gaugeA: 0, valveT: 99,
  });

  /* reduced motion: one static assembled pose, no loop */
  useEffect(() => {
    if (!reduced) return;
    const s = sim.current;
    const apply = () => {
      const th = (s.bA * Math.PI) / 180;
      const px = B_POS.x + CRANK_R * Math.cos(th), py0 = B_POS.y + CRANK_R * Math.sin(th);
      const dx = px - PISTON_X;
      const py = py0 - Math.sqrt(Math.max(0, ROD_L * ROD_L - dx * dx));
      ringG.current?.setAttribute("transform", `rotate(${s.ringA} ${C} ${C})`);
      gearAG.current?.setAttribute("transform", `translate(${A_POS.x} ${A_POS.y}) rotate(${s.aA})`);
      gearBG.current?.setAttribute("transform", `translate(${B_POS.x} ${B_POS.y}) rotate(${s.bA})`);
      gearCG.current?.setAttribute("transform", `translate(${C_POS.x} ${C_POS.y}) rotate(${s.cA})`);
      flyG.current?.setAttribute("transform", `translate(${B_POS.x} ${B_POS.y}) rotate(${s.bA})`);
      crankG.current?.setAttribute("transform", `translate(${B_POS.x} ${B_POS.y}) rotate(${s.bA})`);
      rodL.current?.setAttribute("x1", String(px)); rodL.current?.setAttribute("y1", String(py0));
      rodL.current?.setAttribute("x2", String(PISTON_X)); rodL.current?.setAttribute("y2", String(py));
      rodH.current?.setAttribute("x1", String(px)); rodH.current?.setAttribute("y1", String(py0));
      rodH.current?.setAttribute("x2", String(PISTON_X)); rodH.current?.setAttribute("y2", String(py));
      pistonG.current?.setAttribute("transform", `translate(0 ${(py - PISTON_MID).toFixed(1)})`);
      hubGearG.current?.setAttribute("transform", `rotate(${s.aA})`);
      hubRingG.current?.setAttribute("transform", `rotate(${-s.aA * 0.6})`);
      smallG.current?.setAttribute("transform", `translate(319 285) rotate(${s.smallA})`);
      escG.current?.setAttribute("transform", `translate(${ESC.x} ${ESC.y}) rotate(${s.escA})`);
      anchorG.current?.setAttribute("transform", `rotate(${s.anchorA} ${ESC.x} ${ESC.y - 23})`);
      balG.current?.setAttribute("transform", `translate(${BAL.x} ${BAL.y}) rotate(12)`);
      needleG.current?.setAttribute("transform", `rotate(${-14} ${GAU.x} ${GAU.y})`);
      pinGs.current.forEach((p) => p && p.setAttribute("opacity", "0"));
    };
    apply();
  }, [reduced]);

  useEffect(() => {
    if (reduced) return;
    let alive = true;
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting && alive && !sim.current.raf) sim.current.raf = requestAnimationFrame(loop); });
      if (!es.some((e) => e.isIntersecting) && sim.current.raf) { cancelAnimationFrame(sim.current.raf); sim.current.raf = 0; sim.current.last = 0; }
    }, { threshold: 0.12 });
    if (boxRef.current) io.observe(boxRef.current);

    const s = (at: number, ramp: number) => sim.current.ease * easeIO(Math.min(1, Math.max(0, (sim.current.t - at) / ramp)));

    function loop(ts: number) {
      const S = sim.current;
      const dt = Math.min(0.05, S.last ? (ts - S.last) / 1000 : 0.016);
      S.last = ts;
      /* global speed: eases down when dismantling, up when running */
      const target = rebuildingRef.current ? 0 : 1;
      const tau = target < S.ease ? 0.32 : 0.85;
      S.ease += (target - S.ease) * Math.min(1, dt / tau);
      if (S.ease < 0.004 && target === 0) S.ease = 0;
      S.t += dt;

      /* staged startup ramps */
      const sRing = s(0.15, 1.0), sB = s(0.55, 0.9), sA = s(0.85, 0.9), sC = s(0.7, 0.9);
      const sReg = s(1.2, 0.8), sGauge = s(1.0, 1.0);
      const pins = easeIO(Math.min(1, Math.max(0, S.t / 0.5)));

      /* the transmission chain */
      S.ringA += W.ring * dt * sRing;
      S.bA -= W.B * dt * sB;
      S.aA -= W.A * dt * sA;
      S.cA -= W.C * dt * sC;
      S.smallA += W.small * dt * sA;

      /* steam: crank angle integrates the piston through the rod */
      const th = (S.bA * Math.PI) / 180;
      const px = B_POS.x + CRANK_R * Math.cos(th), py0 = B_POS.y + CRANK_R * Math.sin(th);
      const dx = px - PISTON_X;
      const py = py0 - Math.sqrt(Math.max(0, ROD_L * ROD_L - dx * dx));

      /* escapement — stepped ticks, anchor rocks with each release */
      S.escT += dt * sReg;
      if (S.escT > 0.9) { S.escT -= 0.9; S.escStep += 1; }
      const escTarget = S.escStep * 24;
      S.escA += (escTarget - S.escA) * Math.min(1, dt * 16);
      const anchorTarget = S.escT < 0.45 ? 7 : -7;
      S.anchorA += (anchorTarget - S.anchorA) * Math.min(1, dt * 18);

      /* balance — smooth damped oscillation */
      S.balT += dt * sReg;
      const balA = 26 * Math.sin((S.balT * Math.PI * 2) / 1.05) * sReg;

      /* gauge — pressure responds to the piston phase + slow wander */
      const gFrac = Math.min(1, 0.32 + 0.5 * sGauge + 0.07 * Math.sin(S.t * 0.8) + 0.05 * Math.sin(S.t * 2.3 + 1) + 0.06 * Math.cos(th) * sB);
      S.gaugeA = -52 + 104 * Math.max(0, Math.min(1, gFrac));

      /* valve — periodic steam admission event */
      S.valveT += dt * (S.ease > 0.6 ? 1 : 0);
      const vPh = S.valveT % 6;
      const valveA = vPh < 0.9 && S.t > 2 ? 42 * Math.sin((Math.PI * vPh) / 0.9) * S.ease : 0;

      /* tensioner — breathes against the ring */
      const tensA = 3.5 * Math.sin(S.t * 1.15) * S.ease;

      /* write transforms */
      ringG.current?.setAttribute("transform", `rotate(${S.ringA.toFixed(2)} ${C} ${C})`);
      gearAG.current?.setAttribute("transform", `translate(${A_POS.x} ${A_POS.y}) rotate(${(S.aA % 360).toFixed(2)})`);
      gearBG.current?.setAttribute("transform", `translate(${B_POS.x} ${B_POS.y}) rotate(${(S.bA % 360).toFixed(2)})`);
      gearCG.current?.setAttribute("transform", `translate(${C_POS.x} ${C_POS.y}) rotate(${(S.cA % 360).toFixed(2)})`);
      flyG.current?.setAttribute("transform", `translate(${B_POS.x} ${B_POS.y}) rotate(${(S.bA % 360).toFixed(2)})`);
      crankG.current?.setAttribute("transform", `translate(${B_POS.x} ${B_POS.y}) rotate(${(S.bA % 360).toFixed(2)})`);
      rodL.current?.setAttribute("x1", px.toFixed(1)); rodL.current?.setAttribute("y1", py0.toFixed(1));
      rodL.current?.setAttribute("x2", String(PISTON_X)); rodL.current?.setAttribute("y2", py.toFixed(1));
      rodH.current?.setAttribute("x1", px.toFixed(1)); rodH.current?.setAttribute("y1", py0.toFixed(1));
      rodH.current?.setAttribute("x2", String(PISTON_X)); rodH.current?.setAttribute("y2", py.toFixed(1));
      pistonG.current?.setAttribute("transform", `translate(0 ${(py - PISTON_MID).toFixed(1)})`);
      hubGearG.current?.setAttribute("transform", `rotate(${(S.aA % 360).toFixed(2)})`);
      hubRingG.current?.setAttribute("transform", `rotate(${(-S.aA * 0.6 % 360).toFixed(2)})`);
      smallG.current?.setAttribute("transform", `translate(319 285) rotate(${(S.smallA % 360).toFixed(2)})`);
      escG.current?.setAttribute("transform", `translate(${ESC.x} ${ESC.y}) rotate(${S.escA.toFixed(2)})`);
      anchorG.current?.setAttribute("transform", `rotate(${S.anchorA.toFixed(2)} ${ESC.x} ${ESC.y - 23})`);
      balG.current?.setAttribute("transform", `translate(${BAL.x} ${BAL.y}) rotate(${balA.toFixed(2)})`);
      needleG.current?.setAttribute("transform", `rotate(${S.gaugeA.toFixed(2)} ${GAU.x} ${GAU.y})`);
      valveG.current?.setAttribute("transform", `rotate(${valveA.toFixed(2)} ${VAL.x} ${VAL.y})`);
      tensG.current?.setAttribute("transform", `rotate(${tensA.toFixed(2)} 352 116)`);
      pinGs.current.forEach((p, k) => {
        if (p) p.setAttribute("transform", `rotate(${45 + k * 90} ${C} ${C}) translate(0 ${(-11 * pins).toFixed(2)})`);
      });

      S.raf = requestAnimationFrame(loop);
    }
    return () => { alive = false; io.disconnect(); if (sim.current.raf) cancelAnimationFrame(sim.current.raf); sim.current.raf = 0; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const spinCls = (s?: string) => (reduced || !s ? undefined : s);

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
          {/* ================= THE CLOCKWORK ENGINE ================= */}
          <Reveal>
            <div ref={boxRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <div className={`mech-stage ${rebuilding ? "mech-rebuild" : ""}`} style={frozen ?? undefined}>
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`} aria-hidden>

                  {/* ======== LAYER 1+2 — HOUSING + RECESSED CHAMBER ======== */}
                  <g className="rb-a">
                    {/* rear cavity — the chamber the machine lives in */}
                    <circle cx={C} cy={C} r="224" fill="var(--core-deep)" />
                    <circle cx={C} cy={C} r="224" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="7" opacity="0.5" />
                    {/* chamber structure: mounting rails, channels, slots */}
                    <circle cx={C} cy={C} r="196" fill="none" stroke="rgba(0,0,0,0.28)" strokeWidth="10" />
                    <circle cx={C} cy={C} r="150" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1.4" />
                    {[15, 105, 195, 285].map((deg) => {
                      const [x1, y1] = polar(C, C, 96, deg), [x2, y2] = polar(C, C, 220, deg);
                      return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(0,0,0,0.22)" strokeWidth="5" strokeLinecap="round" />;
                    })}
                    {[60, 150, 240, 330].map((deg) => {
                      const [x, y] = polar(C, C, 128, deg);
                      return <rect key={deg} x={x - 9} y={y - 3.5} width="18" height="7" rx="2" transform={`rotate(${deg} ${x} ${y})`} fill="rgba(0,0,0,0.26)" />;
                    })}
                    {/* rear mounting bolts */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const [x, y] = polar(C, C, 216, 22.5 + i * 45);
                      return <circle key={i} cx={x} cy={y} r="2.4" fill="rgba(0,0,0,0.35)" stroke="var(--core-line)" strokeWidth="0.6" opacity="0.6" />;
                    })}

                    {/* outer rim — front edge, band, inner recessed step */}
                    <circle cx={C} cy={C} r="252" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="2" />
                    <path d={`M${polar(C, C, 249, 205)[0]} ${polar(C, C, 249, 205)[1]} A249 249 0 0 1 ${polar(C, C, 249, 335)[0]} ${polar(C, C, 249, 335)[1]}`}
                      fill="none" stroke="var(--core-inv)" strokeWidth="1.6" opacity="0.16" />
                    <path d={`M${polar(C, C, 236, 25)[0]} ${polar(C, C, 236, 25)[1]} A236 236 0 0 1 ${polar(C, C, 236, 155)[0]} ${polar(C, C, 236, 155)[1]}`}
                      fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="2" opacity="0.5" />
                    <circle cx={C} cy={C} r="232" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="6" opacity="0.45" />
                    {/* rim bolts */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const [x, y] = polar(C, C, 242, i * 30);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="4.4" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="1.2" />
                          <line x1={x - 2.2} y1={y} x2={x + 2.2} y2={y} stroke="var(--core-deep)" strokeWidth="1.1" transform={`rotate(${i * 37} ${x} ${y})`} />
                          <path d={`M${x - 2.6} ${y - 2.2} A3.2 3.2 0 0 1 ${x + 1.4} ${y - 3}`} fill="none" stroke="var(--core-inv)" strokeWidth="0.8" opacity="0.35" />
                        </g>
                      );
                    })}
                    {/* inspection ports */}
                    {[145, 35].map((deg) => {
                      const [x, y] = polar(C, C, 242, deg);
                      return (
                        <g key={deg} transform={`rotate(${deg} ${x} ${y})`}>
                          <rect x={x - 11} y={y - 6} width="22" height="12" rx="3" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.2" />
                          <circle cx={x - 6} cy={y} r="1.4" fill="var(--core-line)" /><circle cx={x + 6} cy={y} r="1.4" fill="var(--core-line)" />
                        </g>
                      );
                    })}
                    {/* nameplate */}
                    <defs>
                      <path id="coreArc" d={`M${polar(C, C, 240, 198)[0]} ${polar(C, C, 240, 198)[1]} A240 240 0 0 0 ${polar(C, C, 240, 162)[0]} ${polar(C, C, 240, 162)[1]}`} />
                    </defs>
                    <text fontSize="9.5" letterSpacing="3.4" fill="var(--core-mid)" opacity="0.85" className="f-mono">
                      <textPath href="#coreArc" startOffset="50%" textAnchor="middle">STEAM CLOCKWORK · CAL. 9F · Nº 009</textPath>
                    </text>
                  </g>

                  {/* ======== LAYER 3 — ROTATING TRANSMISSION RING ======== */}
                  <Drop cx={C} cy={C + 8} rx={188} ry={182} />
                  <g ref={ringG} className="rb-c">
                    <circle cx={C} cy={C} r="186" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.6" />
                    {/* inward teeth — mesh with the planet gears */}
                    {Array.from({ length: 44 }).map((_, i) => {
                      const [x, y] = polar(C, C, 172, (i / 44) * 360);
                      return <rect key={i} x="-3.4" y="-5" width="6.8" height="10" rx="1"
                        transform={`translate(${x} ${y}) rotate(${(i / 44) * 360})`} fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="0.7" />;
                    })}
                    {/* segmented plates with radial slots */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const a0 = (i * 60 + 8) * Math.PI / 180, a1 = ((i + 1) * 60 - 8) * Math.PI / 180;
                      const p = (r: number, a: number) => `${C + r * Math.sin(a)} ${C - r * Math.cos(a)}`;
                      return (
                        <path key={i} d={`M${p(179, a0)} A179 179 0 0 1 ${p(179, a1)} L${p(192, a1)} A192 192 0 0 0 ${p(192, a0)} Z`}
                          fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" opacity="0.92" />
                      );
                    })}
                    {/* ring bolts + timing marks */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const [x, y] = polar(C, C, 186, i * 30 + 15);
                      return <circle key={i} cx={x} cy={y} r="2" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="0.7" />;
                    })}
                    {Array.from({ length: 36 }).map((_, i) => {
                      const [x1, y1] = polar(C, C, 194, i * 10), [x2, y2] = polar(C, C, i % 3 === 0 ? 188 : 191, i * 10);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-mid)" strokeWidth={i % 3 === 0 ? 1.2 : 0.7} opacity="0.55" />;
                    })}
                  </g>

                  {/* ======== LAYER 4 — STATIONARY MOUNTING RING + 9 COUPLINGS ======== */}
                  <g className="rb-b">
                    <circle cx={C} cy={C} r="206" fill="none" stroke="var(--core-plate)" strokeWidth="20" />
                    <circle cx={C} cy={C} r="216" fill="none" stroke="var(--core-line)" strokeWidth="1.4" />
                    <circle cx={C} cy={C} r="196" fill="none" stroke="var(--core-line)" strokeWidth="1.4" />
                    <circle cx={C} cy={C} r="206" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="8" opacity="0.4" />
                    {/* ring bolts */}
                    {Array.from({ length: 18 }).map((_, i) => {
                      const [x, y] = polar(C, C, 206, 10 + i * 20);
                      return <circle key={i} cx={x} cy={y} r="1.8" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="0.6" />;
                    })}
                    {/* coupling stations — drawn canonical "up", rotated to each discipline angle */}
                    {disciplines.map((dis, i) => {
                      const deg = nodeAngle(i);
                      const on = i === sel;
                      return (
                        <g key={dis.id} transform={`rotate(${deg} ${C} ${C})`}>
                          <line x1={C} y1="100" x2={C} y2="124" stroke={on ? "var(--machine-crimson-hot)" : "var(--core-line)"}
                            strokeWidth={on ? 2.6 : 2} strokeLinecap="round" style={{ transition: "stroke .35s ease" }} />
                          {on && !reduced && (
                            <line x1={C} y1="100" x2={C} y2="124" stroke="var(--core-inv)" strokeWidth="1" className="channel-flow" opacity="0.8" />
                          )}
                          <rect x={C - 4.5} y={C - 216 - 4.5} width="9" height="9" transform={`rotate(45 ${C} ${C - 216})`}
                            fill={on ? "var(--machine-crimson-hot)" : "var(--core-deep)"} stroke="var(--core-line)" strokeWidth="1"
                            style={{ transition: "fill .35s ease" }} />
                          <Coupling i={i} on={on} reduced={reduced} />
                        </g>
                      );
                    })}
                  </g>

                  {/* ======== MID-BACK — FLYWHEEL + STEAM CYLINDER + PIPE ======== */}
                  <g className="rb-d">
                    {/* flywheel on the crankshaft — behind the crank wheel */}
                    <Drop cx={B_POS.x} cy={B_POS.y + 8} rx={36} ry={7} />
                    <g ref={flyG} transform={`translate(${B_POS.x} ${B_POS.y})`}>
                      <circle r="34" fill="none" stroke="var(--core-plate)" strokeWidth="9" />
                      <circle r="34" fill="none" stroke="var(--core-line)" strokeWidth="1.4" />
                      <circle r="28.5" fill="none" stroke="var(--core-line)" strokeWidth="0.9" opacity="0.6" />
                      {[0, 90, 180, 270].map((a) => <rect key={a} x="-3" y="-29" width="6" height="24" rx="2" transform={`rotate(${a})`} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="0.9" />)}
                      <path d="M-24 -16 A29 29 0 0 1 4 -28.5" fill="none" stroke="var(--core-inv)" strokeWidth="1.4" opacity="0.18" />
                    </g>

                    {/* pressure pipe: cylinder → gauge, passing behind the ring */}
                    <path d={`M${PISTON_X} 332 L${PISTON_X} 320 L${VAL.x} ${VAL.y} L${GAU.x + 14} ${GAU.y + 12}`} fill="none" stroke="var(--core-deep)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={`M${PISTON_X} 332 L${PISTON_X} 320 L${VAL.x} ${VAL.y} L${GAU.x + 14} ${GAU.y + 12}`} fill="none" stroke="var(--core-line)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                    {/* exhaust stub disappearing into the housing recess */}
                    <path d={`M${PISTON_X - 14} 372 L132 372 L120 360`} fill="none" stroke="var(--core-deep)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />

                    {/* steam cylinder — cutaway body */}
                    <Drop cx={PISTON_X} cy={386} rx={18} ry={4} />
                    <rect x={PISTON_X - 15} y="332" width="30" height="52" rx="4" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.5" />
                    <rect x={PISTON_X - 11} y="337" width="22" height="42" rx="2" fill="var(--core-deep)" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
                    <rect x={PISTON_X - 19} y="328" width="38" height="7" rx="2" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="1" />
                    <rect x={PISTON_X - 19} y="381" width="38" height="7" rx="2" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="1" />
                    <circle cx={PISTON_X - 12} cy={331.5} r="1.4" fill="var(--core-deep)" /><circle cx={PISTON_X + 12} cy={331.5} r="1.4" fill="var(--core-deep)" />
                  </g>

                  {/* ======== LAYER 3b — PLANET GEARS + CRANK + ROD + PISTON ======== */}
                  <g className="rb-d">
                    {/* main drive — upper right, meshes with the ring teeth */}
                    <Drop cx={A_POS.x} cy={A_POS.y + 7} rx={36} ry={7} />
                    <g ref={gearAG} transform={`translate(${A_POS.x} ${A_POS.y})`}>
                      <GearShape r={A_POS.r} teeth={16} fill="var(--core-plate)" stroke="var(--core-line)" spokes={4} />
                      <circle r="6" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="1.2" />
                    </g>
                    {/* idler — mid left */}
                    <g ref={gearCG} transform={`translate(${C_POS.x} ${C_POS.y})`}>
                      <GearShape r={C_POS.r} teeth={9} fill="var(--core-deep)" stroke="var(--core-line)" />
                    </g>
                    {/* crank wheel (planet B) + crank pin */}
                    <Drop cx={B_POS.x} cy={B_POS.y + 7} rx={28} ry={6} />
                    <g ref={gearBG} transform={`translate(${B_POS.x} ${B_POS.y})`}>
                      <GearShape r={B_POS.r} teeth={13} fill="var(--core-plate)" stroke="var(--core-line)" spokes={3} />
                    </g>
                    <g ref={crankG} transform={`translate(${B_POS.x} ${B_POS.y})`}>
                      <rect x="0" y="-4" width={CRANK_R + 4} height="8" rx="3" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="1" />
                      <circle cx={CRANK_R} r="5" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="1.2" />
                      <circle cx={CRANK_R} r="1.8" fill="var(--core-inv)" opacity="0.8" />
                      <circle r="7" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.3" />
                    </g>
                    {/* connecting rod — genuinely links crank pin to piston pin */}
                    <line ref={rodL} x1={B_POS.x + CRANK_R} y1={B_POS.y} x2={PISTON_X} y2={PISTON_MID}
                      stroke="var(--core-mid)" strokeWidth="6" strokeLinecap="round" />
                    <line ref={rodH} x1={B_POS.x + CRANK_R} y1={B_POS.y} x2={PISTON_X} y2={PISTON_MID}
                      stroke="var(--core-inv)" strokeWidth="1.4" strokeLinecap="round" opacity="0.3" />
                    {/* piston inside the cylinder */}
                    <g ref={pistonG}>
                      <rect x={PISTON_X - 9} y={PISTON_MID - 8} width="18" height="14" rx="2.5" fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="1.3" />
                      <line x1={PISTON_X - 9} y1={PISTON_MID - 3} x2={PISTON_X + 9} y2={PISTON_MID - 3} stroke="var(--core-deep)" strokeWidth="1" opacity="0.6" />
                      <line x1={PISTON_X - 9} y1={PISTON_MID + 1} x2={PISTON_X + 9} y2={PISTON_MID + 1} stroke="var(--core-deep)" strokeWidth="1" opacity="0.6" />
                      <circle cx={PISTON_X} cy={PISTON_MID - 1} r="3.4" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />
                    </g>
                    {/* cylinder front rails (piston slides behind them) */}
                    <line x1={PISTON_X - 11} y1="337" x2={PISTON_X - 11} y2="379" stroke="var(--core-line)" strokeWidth="1.6" opacity="0.8" />
                    <line x1={PISTON_X + 11} y1="337" x2={PISTON_X + 11} y2="379" stroke="var(--core-line)" strokeWidth="1.6" opacity="0.8" />
                  </g>

                  {/* ======== LAYER 5 — SHAFTS + CENTRAL TRANSMISSION HUB ======== */}
                  <g className="rb-f">
                    {/* drive shaft: main gear → hub (passes under the hub, through bearings) */}
                    <line x1={A_POS.x} y1={A_POS.y} x2={C} y2={C} stroke="var(--core-deep)" strokeWidth="7" strokeLinecap="round" />
                    <line x1={A_POS.x} y1={A_POS.y} x2={C} y2={C} stroke="var(--core-line)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                    {[[0.32], [0.66]].map(([t], k) => {
                      const bx = A_POS.x + (C - A_POS.x) * t, by = A_POS.y + (C - A_POS.y) * t;
                      return (
                        <g key={k}>
                          <rect x={bx - 7} y={by - 5.5} width="14" height="11" rx="2.5" transform={`rotate(50 ${bx} ${by})`} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                          <circle cx={bx} cy={by} r="1.3" fill="var(--core-deep)" />
                        </g>
                      );
                    })}
                    {/* regulator drive: main gear → escape pinion */}
                    <line x1={A_POS.x} y1={A_POS.y} x2={PIN.x} y2={PIN.y} stroke="var(--core-deep)" strokeWidth="5" strokeLinecap="round" />
                    <line x1={A_POS.x} y1={A_POS.y} x2={PIN.x} y2={PIN.y} stroke="var(--core-line)" strokeWidth="1.4" strokeLinecap="round" opacity="0.45" />

                    {/* central hub — the machine's output assembly */}
                    <Drop cx={C} cy={C + 8} rx={58} ry={10} />
                    <circle cx={C} cy={C} r="54" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.8" />
                    <path d={`M${polar(C, C, 50, 205)[0]} ${polar(C, C, 50, 205)[1]} A50 50 0 0 1 ${polar(C, C, 50, 335)[0]} ${polar(C, C, 50, 335)[1]}`}
                      fill="none" stroke="var(--core-inv)" strokeWidth="1.2" opacity="0.14" />
                    {/* locking ring bolts */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const [x, y] = polar(C, C, 48, 30 + i * 60);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="3" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="0.9" />
                          <line x1={x - 1.5} y1={y} x2={x + 1.5} y2={y} stroke="var(--core-deep)" strokeWidth="0.8" transform={`rotate(${i * 53} ${x} ${y})`} />
                        </g>
                      );
                    })}
                    {/* rotating slotted ring */}
                    <g transform={`translate(${C} ${C})`}><g ref={hubRingG}>
                      <circle r="41" fill="none" stroke="var(--core-line)" strokeWidth="7" opacity="0.9" />
                      {Array.from({ length: 8 }).map((_, i) => {
                        const [x, y] = polar(0, 0, 41, i * 45);
                        return <rect key={i} x={x - 4} y={y - 2} width="8" height="4" rx="1" transform={`rotate(${i * 45} ${x} ${y})`} fill="var(--core-deep)" />;
                      })}
                      <circle cx="0" cy="-41" r="2.2" fill="var(--machine-crimson-hot)" />
                    </g></g>
                    {/* layered hub plates */}
                    <circle cx={C} cy={C} r="34" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.4" />
                    <circle cx={C} cy={C} r="29" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1" />
                    {/* primary hub gear — driven */}
                    <g transform={`translate(${C} ${C})`}><g ref={hubGearG}>
                      <GearShape r={HUB.r} teeth={12} fill="var(--core-deep)" stroke="var(--core-line)" spokes={3} />
                    </g></g>
                    {/* meshing transmission gear */}
                    <g ref={smallG} transform="translate(319 285)">
                      <GearShape r={11.5} teeth={8} fill="var(--core-line)" stroke="var(--core-deep)" />
                    </g>
                    {/* central bearing + output collet (Phase 2 pointer mounts here) */}
                    <circle cx={C} cy={C} r="9" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="1.4" />
                    <circle cx={C} cy={C} r="4.5" fill="var(--core-deep)" stroke="var(--core-mid)" strokeWidth="1" />
                    <circle cx={C} cy={C} r="1.6" fill="var(--core-mid)" />
                  </g>

                  {/* ======== LAYER 4b — CLOCK REGULATOR (upper right) ======== */}
                  <g className="rb-e">
                    {/* escape wheel — stepped ticks */}
                    <Drop cx={ESC.x} cy={ESC.y + 5} rx={20} ry={4} />
                    <g ref={escG} transform={`translate(${ESC.x} ${ESC.y})`}>
                      {Array.from({ length: 15 }).map((_, i) => {
                        const a = (i / 15) * Math.PI * 2;
                        return <path key={i} d={`M${13 * Math.cos(a)} ${13 * Math.sin(a)} L${19 * Math.cos(a + 0.16)} ${19 * Math.sin(a + 0.16)} L${14.5 * Math.cos(a + 0.3)} ${14.5 * Math.sin(a + 0.3)} Z`}
                          fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="0.6" />;
                      })}
                      <circle r="13" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.3" />
                      {[0, 120, 240].map((a) => <line key={a} x1="0" y1="0" x2={9 * Math.cos(a * Math.PI / 180)} y2={9 * Math.sin(a * Math.PI / 180)} stroke="var(--core-line)" strokeWidth="1.6" />)}
                      <circle r="2.6" fill="var(--core-line)" />
                    </g>
                    {/* anchor — rocks with each release */}
                    <g ref={anchorG} transform={`rotate(-7 ${ESC.x} ${ESC.y - 23})`}>
                      <path d={`M${ESC.x - 14} ${ESC.y - 8} Q${ESC.x} ${ESC.y - 30} ${ESC.x + 14} ${ESC.y - 8}`} fill="none" stroke="var(--core-mid)" strokeWidth="3.4" strokeLinecap="round" />
                      <rect x={ESC.x - 17} y={ESC.y - 12} width="6" height="7" rx="1.5" transform={`rotate(24 ${ESC.x - 14} ${ESC.y - 8})`} fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="0.9" />
                      <rect x={ESC.x + 11} y={ESC.y - 12} width="6" height="7" rx="1.5" transform={`rotate(-24 ${ESC.x + 14} ${ESC.y - 8})`} fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="0.9" />
                      <circle cx={ESC.x} cy={ESC.y - 23} r="3" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                    </g>
                    {/* regulator pinion — driven off the main gear shaft */}
                    <g transform={`translate(${PIN.x} ${PIN.y})`}><g className={spinCls("gear-ccw")} style={{ animationDuration: "9s" }}>
                      <GearShape r={PIN.r} teeth={7} fill="var(--core-line)" stroke="var(--core-deep)" hub={false} />
                    </g></g>
                    {/* balance wheel — continuous damped oscillation */}
                    <Drop cx={BAL.x} cy={BAL.y + 5} rx={22} ry={4} />
                    <g ref={balG} transform={`translate(${BAL.x} ${BAL.y})`}>
                      <circle r={BAL.r} fill="none" stroke="var(--core-mid)" strokeWidth="3.6" />
                      <circle r={BAL.r} fill="none" stroke="var(--core-deep)" strokeWidth="1" opacity="0.6" />
                      {[0, 90, 180, 270].map((a) => <line key={a} x1="0" y1="0" x2={BAL.r * 0.92 * Math.cos(a * Math.PI / 180)} y2={BAL.r * 0.92 * Math.sin(a * Math.PI / 180)} stroke="var(--core-mid)" strokeWidth="2" />)}
                      {/* hairspring */}
                      <path d="M0 0 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0" fill="none" stroke="var(--core-line)" strokeWidth="0.9" opacity="0.8" />
                      <circle r="4" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                      <circle cx="0" cy={-BAL.r} r="2.6" fill="var(--machine-crimson-hot)" />
                    </g>
                    {/* regulator index lever (F/S) */}
                    <g transform={`translate(${ESC.x + 34} ${ESC.y - 34})`}>
                      <g className={spinCls("valve-wiggle")} style={{ animationDuration: "5.2s" }}>
                        <line x1="0" y1="0" x2="13" y2="-7" stroke="var(--core-line)" strokeWidth="2.4" strokeLinecap="round" />
                      </g>
                      <circle r="2.6" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1" />
                      <text x="-12" y="-6" fontSize="6.5" className="f-mono" fill="var(--core-mid)">S</text>
                      <text x="12" y="-10" fontSize="6.5" className="f-mono" fill="var(--core-mid)">F</text>
                    </g>
                  </g>

                  {/* ======== FRONT — GAUGE + VALVE + TENSIONER + BRACKETS ======== */}
                  <g className="rb-e">
                    {/* pressure gauge — glass face, wandering needle */}
                    <Drop cx={GAU.x} cy={GAU.y + 5} rx={25} ry={5} />
                    <circle cx={GAU.x} cy={GAU.y} r={GAU.r} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.8" />
                    <circle cx={GAU.x} cy={GAU.y} r={GAU.r - 5} fill="color-mix(in srgb, var(--core-inv) 13%, var(--core-deep))" stroke="var(--core-line)" strokeWidth="1" />
                    {[-52, -26, 0, 26, 52].map((a) => {
                      const [x1, y1] = polar(GAU.x, GAU.y, GAU.r - 7, a - 90), [x2, y2] = polar(GAU.x, GAU.y, GAU.r - 11, a - 90);
                      return <line key={a} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-mid)" strokeWidth="1.2" />;
                    })}
                    <text x={GAU.x - 12} y={GAU.y + 10} fontSize="5.5" className="f-mono" fill="var(--core-mid)" opacity="0.8">PSI</text>
                    <g ref={needleG} transform={`rotate(-14 ${GAU.x} ${GAU.y})`}>
                      <line x1={GAU.x} y1={GAU.y + 4} x2={GAU.x} y2={GAU.y - GAU.r + 8} stroke="var(--machine-crimson-hot)" strokeWidth="1.8" strokeLinecap="round" />
                    </g>
                    <circle cx={GAU.x} cy={GAU.y} r="2.6" fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="0.9" />
                    <path d={`M${GAU.x - 14} ${GAU.y - 12} A19 19 0 0 1 ${GAU.x + 2} ${GAU.y - 18}`} fill="none" stroke="var(--core-inv)" strokeWidth="1.6" opacity="0.22" strokeLinecap="round" />

                    {/* steam valve on the pipe — periodic admission event */}
                    <g ref={valveG} transform={`rotate(0 ${VAL.x} ${VAL.y})`}>
                      <circle cx={VAL.x} cy={VAL.y} r="8" fill="none" stroke="var(--core-mid)" strokeWidth="2.6" />
                      <line x1={VAL.x - 8} y1={VAL.y} x2={VAL.x + 8} y2={VAL.y} stroke="var(--core-mid)" strokeWidth="2" />
                      <line x1={VAL.x} y1={VAL.y - 8} x2={VAL.x} y2={VAL.y + 8} stroke="var(--core-mid)" strokeWidth="2" />
                    </g>
                    <circle cx={VAL.x} cy={VAL.y} r="2.4" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1" />

                    {/* tensioner spring against the transmission ring */}
                    <g transform="rotate(20 300 300)">
                      <rect x="346" y="108" width="12" height="8" rx="2" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1" />
                      <g ref={tensG} transform="rotate(0 352 116)">
                        <line x1="352" y1="116" x2="352" y2="104" stroke="var(--core-line)" strokeWidth="2.2" strokeLinecap="round" />
                        <path d="M347 103 h10 M347 99 l5 -3 5 3 M347 95 h10" fill="none" stroke="var(--core-mid)" strokeWidth="1.4" />
                      </g>
                    </g>

                    {/* housing mounting brackets — front layer, clamp the rim */}
                    {[45, 135, 225, 315].map((deg) => {
                      const [x, y] = polar(C, C, 240, deg);
                      return (
                        <g key={deg} transform={`rotate(${deg} ${x} ${y})`}>
                          <rect x={x - 13} y={y - 9} width="26" height="18" rx="3" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.4" />
                          <rect x={x - 13} y={y - 9} width="26" height="5" rx="2" fill="var(--core-line)" opacity="0.5" />
                          <circle cx={x - 7} cy={y + 3} r="2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="0.8" />
                          <circle cx={x + 7} cy={y + 3} r="2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="0.8" />
                        </g>
                      );
                    })}
                  </g>

                  {/* ======== SHIPPING LOCKS — release during startup ======== */}
                  {[0, 1, 2, 3].map((k) => (
                    <g key={k} ref={(el) => { pinGs.current[k] = el; }} transform={`rotate(${45 + k * 90} ${C} ${C})`}>
                      <rect x={C - 4.5} y="104" width="9" height="18" rx="2" fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="1.2" />
                      <line x1={C - 4.5} y1="110" x2={C + 4.5} y2="110" stroke="var(--core-deep)" strokeWidth="1" />
                      <line x1={C - 4.5} y1="116" x2={C + 4.5} y2="116" stroke="var(--core-deep)" strokeWidth="1" />
                    </g>
                  ))}
                </svg>
              </div>

              {/* ================= NINE CAPABILITY MODULES ================= */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                const deg = nodeAngle(i);
                const [x, y] = polar(50, 50, 44.5, deg);
                const lb = LBL[i % LBL.length];
                const fill = isActive ? "var(--core-deep)" : isHover ? "var(--core-mid)" : "var(--core-plate)";
                const edge = isActive ? "var(--machine-crimson-hot)" : isHover ? "var(--core-inv)" : "color-mix(in srgb, var(--core-inv) 20%, transparent)";
                const iconColor = isActive ? "var(--core-inv)" : isHover ? "var(--core-deep)" : "var(--core-inv)";
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
                    aria-label={dis.name} aria-pressed={isActive}>
                    <span className="relative grid place-items-center transition-all duration-400 mat-texture"
                      style={{
                        width: 74, height: 74,
                        backgroundColor: fill,
                        color: iconColor,
                        clipPath: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)",
                        boxShadow: `inset 0 0 0 1.5px ${edge}, 0 12px 26px -16px rgba(0,0,0,0.6)`,
                        transform: isHover && !isActive ? "translateY(-2px)" : "none",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${isActive ? "bg-[var(--machine-crimson-hot)] text-[#f4f2ed]" : "bg-[var(--core-inv)] text-[var(--core-plate)]"}`}>
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
                STEAM CLOCKWORK — {sel !== null ? `CORE/${disciplines[sel].num}` : "IDLING"}
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
                    <span className="text-[var(--crim-panel)]">CORE/{d.num}</span>
                  </div>
                </div>
              ) : (
                <div key="standby" className="dossier-swap">
                  <h3 className="f-display text-[clamp(1.6rem,2.6vw,2.3rem)] leading-tight mt-3" style={{ color: "var(--outer-ink)", opacity: 0.92 }}>STANDING BY</h3>
                  <p className="mt-4 text-[13.5px] sm:text-[14px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: 0.75 }}>
                    Choose a discipline to explore. The machine demonstrates one every 20 seconds.
                  </p>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
