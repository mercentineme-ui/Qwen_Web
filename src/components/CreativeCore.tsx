import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

/* machined gear drawn at origin — caller translates/rotates */
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
        fill="none" stroke="var(--machine-inv)" strokeWidth={1.1} opacity={0.2} strokeLinecap="round" />
      {spokes > 0 && Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return <circle key={i} cx={r * 0.5 * Math.cos(a)} cy={r * 0.5 * Math.sin(a)} r={r * 0.15} fill="var(--machine-deep)" stroke={stroke} strokeWidth={0.9} />;
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

/* two-line radial label system — forced breaks + placement side, zero overlap */
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
   NINE DISTINCT COUPLING MECHANISMS — one per discipline.
   Drawn canonical "up" spanning the radial band r≈222–258, then
   rotated to the discipline angle. Each uses a different physical
   principle: rod, gears, slider, clutch, belt, crank, heavy gear,
   scissor linkage, escapement. `on` = currently transmitting.
   ============================================================ */
function Coupling({ i, on, reduced }: { i: number; on: boolean; reduced: boolean }) {
  const dur = (base: string, fast: string) => (on ? fast : base);
  const hot = on ? "var(--machine-crimson-hot)" : "var(--machine-line)";
  const spin = (s?: string) => (reduced || !s ? undefined : s);

  switch (i) {
    case 0: // articulated rod with knuckle joint
      return (
        <g>
          <g className={spin("valve-wiggle")} style={{ transformOrigin: "300px 60px", animationDuration: dur("5s", "1.8s") }}>
            <line x1="300" y1="42" x2="300" y2="60" stroke="var(--machine-line)" strokeWidth="3.2" strokeLinecap="round" />
            <line x1="300" y1="60" x2="300" y2="78" stroke="var(--machine-line)" strokeWidth="2.6" strokeLinecap="round" />
          </g>
          <circle cx="300" cy="60" r="3.6" fill="var(--machine-deep)" stroke={hot} strokeWidth="1.2" style={{ transition: "stroke .35s ease" }} />
          <circle cx="300" cy="42" r="2.2" fill="var(--machine-line)" />
        </g>
      );
    case 1: // meshing gear pair
      return (
        <g>
          <g transform="translate(300 52)"><g className={spin(on ? "gear-cw-fast" : "gear-cw")} style={{ animationDuration: dur("13s", "3.6s") }}>
            <GearShape r={10} teeth={8} fill="var(--machine-deep)" stroke={hot} hub={false} /></g></g>
          <g transform="translate(300 70)"><g className={spin("gear-ccw")} style={{ animationDuration: dur("8s", "2.4s") }}>
            <GearShape r={8} teeth={6} fill="var(--machine-line)" hub={false} /></g></g>
        </g>
      );
    case 2: // sliding block on a rail
      return (
        <g>
          <rect x="297.5" y="42" width="5" height="36" rx="1.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.9" />
          <g className={spin("rail-slide")} style={{ animationDuration: dur("4.4s", "1.6s") }}>
            <rect x="291" y="55" width="18" height="8" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
            <circle cx="300" cy="59" r="2" fill={hot} style={{ transition: "fill .35s ease" }} />
          </g>
        </g>
      );
    case 3: // dog clutch — toothed disc + sliding collar
      return (
        <g>
          <g transform="translate(300 50)"><g className={spin("gear-cw")} style={{ animationDuration: dur("11s", "3.2s") }}>
            <circle r="9" fill="var(--machine-deep)" stroke={hot} strokeWidth="1.2" style={{ transition: "stroke .35s ease" }} />
            {[0, 120, 240].map((d) => <rect key={d} x="-2" y="-12" width="4" height="4.4" rx="1" transform={`rotate(${d})`} fill="var(--machine-line)" />)}
          </g></g>
          <g className={spin("piston")} style={{ animationDuration: dur("3.4s", "1.4s") }}>
            <rect x="293" y="66" width="14" height="8" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
          </g>
        </g>
      );
    case 4: // belt + twin pulleys
      return (
        <g>
          <line x1="294" y1="48" x2="294" y2="72" stroke={hot} strokeWidth="1.3" className={spin("channel-flow")} style={{ transition: "stroke .35s ease" }} />
          <line x1="306" y1="48" x2="306" y2="72" stroke={hot} strokeWidth="1.3" className={spin("channel-flow")} style={{ transition: "stroke .35s ease" }} />
          <g transform="translate(300 48)"><g className={spin("gear-cw")} style={{ animationDuration: dur("7s", "2.2s") }}>
            <circle r="6" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
            <line x1="-4" y1="0" x2="4" y2="0" stroke="var(--machine-line)" strokeWidth="1.2" /></g></g>
          <g transform="translate(300 72)"><g className={spin("gear-cw")} style={{ animationDuration: dur("7s", "2.2s") }}>
            <circle r="6" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="var(--machine-line)" strokeWidth="1.2" /></g></g>
        </g>
      );
    case 5: // articulated crank + connecting rod
      return (
        <g>
          <g transform="translate(300 50)"><g className={spin("gear-cw")} style={{ animationDuration: dur("5.5s", "1.9s") }}>
            <line x1="0" y1="0" x2="0" y2="-9" stroke="var(--machine-line)" strokeWidth="3" strokeLinecap="round" />
            <circle cy="-9" r="2.4" fill={hot} style={{ transition: "fill .35s ease" }} />
            <circle r="3.6" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1.1" />
          </g></g>
          <line x1="300" y1="58" x2="300" y2="78" stroke="var(--machine-line)" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="300" cy="78" r="2.2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
        </g>
      );
    case 6: // heavy single gear, 4 lightening holes
      return (
        <g transform="translate(300 60)">
          <g className={spin(on ? "gear-ccw" : "gear-ccw-slow")} style={{ animationDuration: dur("24s", "6s") }}>
            <GearShape r={16} teeth={11} fill="var(--machine-deep)" stroke={hot} spokes={4} />
          </g>
        </g>
      );
    case 7: // compound scissor linkage
      return (
        <g>
          <g className={spin("valve-wiggle")} style={{ transformOrigin: "300px 60px", animationDuration: dur("4.2s", "1.5s") }}>
            <line x1="293" y1="44" x2="307" y2="76" stroke="var(--machine-line)" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="307" y1="44" x2="293" y2="76" stroke="var(--machine-line)" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <circle cx="300" cy="60" r="3" fill="var(--machine-deep)" stroke={hot} strokeWidth="1.2" style={{ transition: "stroke .35s ease" }} />
          <circle cx="293" cy="44" r="1.9" fill="var(--machine-line)" />
          <circle cx="307" cy="44" r="1.9" fill="var(--machine-line)" />
        </g>
      );
    default: // precision escapement — toothed wheel + pallet
      return (
        <g>
          <g transform="translate(300 52)"><g className={spin(on ? "gear-cw-fast" : "gear-cw")} style={{ animationDuration: dur("15s", "4s") }}>
            <GearShape r={10} teeth={8} fill="var(--machine-deep)" stroke={hot} hub={false} /></g></g>
          <g className={spin("escapement")} style={{ transformOrigin: "300px 72px" }}>
            <path d="M294 66 L300 76 L306 66" fill="none" stroke={hot} strokeWidth="2" strokeLinecap="round" style={{ transition: "stroke .35s ease" }} />
          </g>
          <circle cx="300" cy="72" r="1.8" fill="var(--machine-line)" />
        </g>
      );
  }
}

/* ============================================================
   THE CORE — a regulator chronometer, built from zero.
   Layer A  segmented bolted casing        (rb-a)
   Layer B  ratchet index ring + 9 slots   (rb-b)
   Layer C  going train + couplings        (rb-d)
   Layer D  escapement / balance / barrel  (rb-c)
   Layer E  power hub + rack-and-pinion
            articulated pointer            (rb-e)
   ============================================================ */
export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const N = disciplines.length;
  const reduced = useReducedMotion();

  /* ---- interaction: 20s auto-demonstration + hover preview + click lock ---- */
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

  /* ---- theme rebuild: machine dismantles, inverts, reassembles ---- */
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

  /* ---- RACK-AND-PINION POINTER ----
     central pinion → primary arm → joint gear → toothed rack sliding
     through a sleeve → locking tip. Choreography on every discipline
     change: RETRACT (rack pulled in) → ROTATE (weighted spring) →
     EXTEND (rack driven out, overshoot, settle). All gear spin is
     derived from actual angular/extension velocity. */
  const discRef = useRef<HTMLDivElement>(null);
  const handG = useRef<SVGGElement>(null);
  const rackG = useRef<SVGGElement>(null);
  const pinionG = useRef<SVGGElement>(null);
  const jointG = useRef<SVGGElement>(null);
  const lockPin = useRef<SVGRectElement>(null);
  const st = useRef({
    ang: 0, angV: 0, ext: 0, extV: 0,
    phase: "extend" as "retract" | "rotate" | "extend" | "idle",
    pinionRot: 0, jointRot: 0,
    raf: 0, last: 0,
  });
  const selRef = useRef(sel);
  const firstRun = useRef(true);
  const liveRef = useRef(true);

  /* discipline change → mechanical handoff, never an instant flip */
  useEffect(() => {
    selRef.current = sel;
    if (firstRun.current) { firstRun.current = false; return; }
    if (!reduced) st.current.phase = "retract";
  }, [sel, reduced]);

  /* pause the simulation when the machine is off-screen */
  useEffect(() => {
    const el = discRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { liveRef.current = e.isIntersecting; }, { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* reduced motion — snap the pointer to the selected discipline, no loop */
  useEffect(() => {
    if (!reduced) return;
    const a = sel * (360 / N);
    handG.current?.setAttribute("transform", `rotate(${a} 300 300)`);
    rackG.current?.setAttribute("transform", "translate(0 -200)");
    lockPin.current?.setAttribute("transform", "translate(0 0)");
  }, [reduced, sel, N]);

  useEffect(() => {
    if (reduced) return;

    const loop = (t: number) => {
      const s = st.current;
      const dt = Math.min(0.045, s.last ? (t - s.last) / 1000 : 0.016);
      s.last = t;

      if (liveRef.current) {
        const tAng = selRef.current * (360 / N);
        let tExt = 1, kA = 46, cA = 10.5, kE = 70, cE = 12;

        if (s.phase === "retract") {
          tExt = 0; kE = 110; cE = 18;
          if (s.ext < 0.05 && Math.abs(s.extV) < 0.4) s.phase = "rotate";
        } else if (s.phase === "rotate") {
          tExt = 0;
          if (Math.abs(((tAng - s.ang + 180) % 360 + 360) % 360 - 180) < 1.6 && Math.abs(s.angV) < 26) s.phase = "extend";
        } else if (s.phase === "extend") {
          tExt = 1; kA = 60; cA = 13; kE = 84; cE = 10.2;
          if (s.ext > 0.985 && Math.abs(s.extV) < 0.25) s.phase = "idle";
        }

        const dA = ((tAng - s.ang + 180) % 360 + 360) % 360 - 180;
        s.angV += (dA * kA - s.angV * cA) * dt;
        s.ang += s.angV * dt;
        s.extV += ((tExt - s.ext) * kE - s.extV * cE) * dt;
        s.ext = Math.max(0, Math.min(1.06, s.ext + s.extV * dt));

        /* gears are driven by the motion itself */
        const speed = 14 + Math.min(430, Math.abs(s.angV) * 2.1) + Math.abs(s.extV) * 40;
        s.pinionRot += speed * dt;
        s.jointRot -= speed * 1.9 * dt;

        const ext = Math.min(1, s.ext);
        handG.current?.setAttribute("transform", `rotate(${s.ang.toFixed(2)} 300 300)`);
        rackG.current?.setAttribute("transform", `translate(0 ${-(52 + 148 * ext).toFixed(1)})`);
        pinionG.current?.setAttribute("transform", `rotate(${(s.pinionRot % 360).toFixed(1)})`);
        jointG.current?.setAttribute("transform", `rotate(${(s.jointRot % 360).toFixed(1)})`);
        lockPin.current?.setAttribute("transform", `translate(0 ${((1 - ext) * 7).toFixed(1)})`);
      } else {
        s.last = t;
      }
      s.raf = requestAnimationFrame(loop);
    };
    st.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.current.raf);
  }, [reduced, N]);

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
          {/* ================= THE MACHINE ================= */}
          <Reveal>
            <div ref={discRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <div className={`mech-stage ${rebuilding ? "mech-rebuild" : ""}`} style={frozen ?? undefined}>
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`}>
                  <defs>
                    <clipPath id="rackClip"><rect x="-22" y="-235" width="44" height="196" /></clipPath>
                  </defs>

                  {/* ============ LAYER A — SEGMENTED CASING ============ */}
                  <g className="rb-a">
                      {/* stepped outer rim */}
                      <circle cx="300" cy="300" r="258" fill="none" stroke="var(--machine-line)" strokeWidth="2.4" />
                      <circle cx="300" cy="300" r="252" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
                      {/* 12 casing segments with expansion gaps */}
                      {Array.from({ length: 12 }).map((_, i) => {
                        const a0 = ((i * 30 + 2.5 - 90) * Math.PI) / 180;
                        const a1 = (((i + 1) * 30 - 2.5 - 90) * Math.PI) / 180;
                        const deep = i % 3 === 0;
                        const p = (r: number, a: number) => `${300 + r * Math.cos(a)} ${300 + r * Math.sin(a)}`;
                        return (
                          <path key={i}
                            d={`M${p(250, a0)} A250 250 0 0 1 ${p(250, a1)} L${p(228, a1)} A228 228 0 0 0 ${p(228, a0)} Z`}
                            fill={deep ? "var(--machine-plate)" : "var(--machine-deep)"}
                            stroke="var(--machine-line)" strokeWidth="1.1" opacity={deep ? 0.92 : 1} />
                        );
                      })}
                      {/* segment joint bolts */}
                      {Array.from({ length: 12 }).map((_, i) => {
                        const [x, y] = polar(300, 300, 239, i * 30);
                        return (
                          <g key={i}>
                            <circle cx={x} cy={y} r="3.4" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                            <line x1={x - 1.8} y1={y} x2={x + 1.8} y2={y} stroke="var(--machine-deep)" strokeWidth="0.9"
                              transform={`rotate(${i * 23} ${x} ${y})`} />
                          </g>
                        );
                      })}
                      {/* inspection cuts with screws */}
                      {[45, 135, 225, 315].map((deg) => {
                        const [x, y] = polar(300, 300, 239, deg + 15);
                        return (
                          <g key={deg} transform={`rotate(${deg + 15} ${x} ${y})`}>
                            <rect x={x - 13} y={y - 6} width="26" height="12" rx="2" fill="rgba(0,0,0,0.3)" stroke="var(--machine-line)" strokeWidth="0.9" />
                            <circle cx={x - 8} cy={y} r="1.7" fill="var(--machine-line)" />
                            <circle cx={x + 8} cy={y} r="1.7" fill="var(--machine-line)" />
                          </g>
                        );
                      })}
                      {/* three structural brackets */}
                      {[90, 210, 330].map((deg) => {
                        const [x, y] = polar(300, 300, 240, deg);
                        return (
                          <g key={deg} transform={`rotate(${deg} ${x} ${y})`}>
                            <path d={`M${x - 16} ${y - 11} L${x + 16} ${y - 11} L${x + 10} ${y + 11} L${x - 10} ${y + 11} Z`}
                              fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />
                            <line x1={x - 9} y1={y - 5} x2={x + 9} y2={y - 5} stroke="var(--machine-inv)" strokeWidth="0.9" opacity="0.25" />
                          </g>
                        );
                      })}
                      {/* machined grooves */}
                      <circle cx="300" cy="300" r="226" fill="none" stroke="var(--machine-line)" strokeWidth="0.8" strokeDasharray="40 14" opacity="0.4" />
                      <circle cx="300" cy="300" r="262" fill="none" stroke="var(--machine-line)" strokeWidth="0.7" opacity="0.3" />
                  </g>

                  {/* ============ LAYER B — RATCHET INDEX RING + 9 SLOTS ============ */}
                  <g className="rb-b">
                    {/* static slot plate — one indexing slot per discipline */}
                    <circle cx="300" cy="300" r="222" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.3" />
                    <circle cx="300" cy="300" r="204" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
                    {disciplines.map((dis, i) => {
                      const on = i === sel;
                      const deg = nodeAngle(i);
                      const [sx, sy] = polar(300, 300, 213, deg);
                      return (
                        <g key={dis.id} transform={`rotate(${deg} ${sx} ${sy})`}>
                          <rect x={sx - 7} y={sy - 4.5} width="14" height="9" rx="1.5"
                            fill={on ? "rgba(0,0,0,0.4)" : "var(--machine-deep)"}
                            stroke={on ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth="1"
                            style={{ transition: "stroke .35s ease" }} />
                          {on && <rect x={sx - 1.6} y={sy - 7.5} width="3.2" height="15" rx="1" fill="var(--machine-crimson-hot)" />}
                        </g>
                      );
                    })}
                    {/* rotating ratchet tooth band — the machine measuring time */}
                    <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "300s" }}>
                      {Array.from({ length: 36 }).map((_, i) => {
                        const a = (i / 36) * Math.PI * 2;
                        const x = 300 + 200 * Math.cos(a), y = 300 + 200 * Math.sin(a);
                        return (
                          <path key={i} d="M-3.4 3 L-3.4 -3 L3.8 -1.4 L3.8 1.4 Z"
                            transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
                            fill="var(--machine-line)" opacity="0.85" />
                        );
                      })}
                      <circle cx="300" cy="300" r="196" fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.5" />
                    </g>
                    {/* calibration ticks */}
                    {Array.from({ length: 60 }).map((_, i) => {
                      const long = i % 5 === 0;
                      const [x1, y1] = polar(300, 300, 221, (i / 60) * 360);
                      const [x2, y2] = polar(300, 300, long ? 215 : 218, (i / 60) * 360);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={long ? "var(--machine-inv)" : "var(--machine-line)"}
                        strokeWidth={long ? 1.3 : 0.7} opacity={long ? 0.45 : 0.5} />;
                    })}
                  </g>

                  {/* ============ LAYER C — GOING TRAIN + COUPLINGS ============ */}
                  <g className="rb-d">
                    {/* left gear arc — four meshed wheels, opposing directions */}
                    <g transform={`translate(${polar(300, 300, 158, 150)[0]} ${polar(300, 300, 158, 150)[1]})`}>
                      <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "22s" }}><GearShape r={24} teeth={14} fill="var(--machine-deep)" spokes={4} /></g>
                    </g>
                    <g transform={`translate(${polar(300, 300, 158, 163.5)[0]} ${polar(300, 300, 158, 163.5)[1]})`}>
                      <g className={reduced ? undefined : "gear-ccw"} style={{ animationDuration: "13s" }}><GearShape r={17} teeth={10} fill="var(--machine-line)" hub={false} /></g>
                    </g>
                    <g transform={`translate(${polar(300, 300, 158, 175.5)[0]} ${polar(300, 300, 158, 175.5)[1]})`}>
                      <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "17s" }}><GearShape r={21} teeth={12} fill="var(--machine-deep)" spokes={3} /></g>
                    </g>
                    <g transform={`translate(${polar(300, 300, 158, 188.5)[0]} ${polar(300, 300, 158, 188.5)[1]})`}>
                      <g className={reduced ? undefined : "gear-ccw"} style={{ animationDuration: "10s" }}><GearShape r={14} teeth={9} fill="var(--machine-line)" hub={false} /></g>
                    </g>
                    {/* right idler pair */}
                    <g transform={`translate(${polar(300, 300, 170, 15)[0]} ${polar(300, 300, 170, 15)[1]})`}>
                      <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "15s" }}><GearShape r={18} teeth={11} fill="var(--machine-deep)" /></g>
                    </g>
                    <g transform={`translate(${polar(300, 300, 148, 28)[0]} ${polar(300, 300, 148, 28)[1]})`}>
                      <g className={reduced ? undefined : "gear-ccw"} style={{ animationDuration: "8s" }}><GearShape r={11} teeth={8} fill="var(--machine-line)" hub={false} /></g>
                    </g>
                    {/* eccentric wobble gear */}
                    <g transform={`translate(${polar(300, 300, 150, 330)[0]} ${polar(300, 300, 150, 330)[1]})`}>
                      <g className={reduced ? undefined : "gear-ccw"} style={{ animationDuration: "20s", transformOrigin: "4px 0px" }}>
                        <GearShape r={16} teeth={10} fill="var(--machine-deep)" />
                      </g>
                    </g>
                    {/* toothed rail + oscillating slider (lower zone) */}
                    <g>
                      <rect x="252" y="428" width="96" height="7" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.9" />
                      {Array.from({ length: 12 }).map((_, i) => (
                        <rect key={i} x={255 + i * 8} y="426" width="3" height="3" fill="var(--machine-line)" />
                      ))}
                      <g className={reduced ? undefined : "rail-slide"} style={{ animationDuration: "6s" }}>
                        <rect x="288" y="420" width="24" height="12" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1.1" />
                        <circle cx="300" cy="426" r="2.4" fill="var(--machine-deep)" />
                      </g>
                    </g>
                    {/* jewel bearings */}
                    {[[polar(300, 300, 158, 163.5)], [polar(300, 300, 170, 15)]].map(([[x, y]], k) => (
                      <g key={k}>
                        <circle cx={x} cy={y} r="4.2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
                        <circle cx={x} cy={y} r="1.6" fill="var(--machine-crimson-hot)" opacity="0.8" />
                      </g>
                    ))}

                    {/* nine discipline couplings */}
                    {disciplines.map((dis, i) => (
                      <g key={dis.id} transform={`rotate(${nodeAngle(i)} 300 300)`}>
                        <Coupling i={i} on={i === sel} reduced={reduced} />
                        {/* crimson energy travelling module → ring while active */}
                        {i === sel && !reduced && (
                          <circle r="2.6" fill="var(--machine-crimson-hot)">
                            <animateMotion dur="1.4s" repeatCount="indefinite" path="M300 42 L300 80" />
                          </circle>
                        )}
                      </g>
                    ))}
                  </g>

                  {/* ============ LAYER D — INTERNAL CLOCKWORK ============ */}
                  <g className="rb-c">
                    <circle cx="300" cy="300" r="136" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" opacity="0.5" />
                    {/* mainspring barrel (lower-left) */}
                    <g transform={`translate(${polar(300, 300, 118, 210)[0]} ${polar(300, 300, 118, 210)[1]})`}>
                      <g className={reduced ? undefined : "gear-ccw-slow"}>
                        <circle r="26" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
                        <path d="M0 0 m0 -3 a3 3 0 0 1 3 3 a6 6 0 0 1 -6 6 a10 10 0 0 1 -10 -10 a14 14 0 0 1 14 -14 a18 18 0 0 1 18 18"
                          fill="none" stroke="var(--machine-line)" strokeWidth="1.4" />
                      </g>
                      <circle r="3" fill="var(--machine-line)" />
                    </g>
                    {/* barrel → hub train */}
                    <g transform={`translate(${polar(300, 300, 100, 222)[0]} ${polar(300, 300, 100, 222)[1]})`}>
                      <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "9s" }}><GearShape r={12} teeth={8} fill="var(--machine-line)" hub={false} /></g>
                    </g>
                    <g transform={`translate(${polar(300, 300, 92, 214)[0]} ${polar(300, 300, 92, 214)[1]})`}>
                      <g className={reduced ? undefined : "gear-ccw"} style={{ animationDuration: "6s" }}><GearShape r={9} teeth={7} fill="var(--machine-deep)" hub={false} /></g>
                    </g>
                    {/* escape wheel + pallet fork (top) */}
                    <g transform="translate(300 188)">
                      <g className={reduced ? undefined : "escapement"}>
                        {Array.from({ length: 10 }).map((_, i) => {
                          const a = (i / 10) * Math.PI * 2;
                          return <path key={i} d="M0 -10 L3.4 -16 L-1 -15.4 Z" transform={`rotate(${(a * 180) / Math.PI})`} fill="var(--machine-line)" />;
                        })}
                        <circle r="10" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                        <circle r="2.4" fill="var(--machine-line)" />
                      </g>
                    </g>
                    <g className={reduced ? undefined : "escapement"} style={{ transformOrigin: "300px 168px", animationDelay: "0.8s" }}>
                      <path d="M291 172 L300 162 L309 172" fill="none" stroke="var(--machine-inv)" strokeWidth="2.2" strokeLinecap="round" />
                      <circle cx="300" cy="168" r="2" fill="var(--machine-line)" />
                    </g>
                    {/* escape → hub step-down */}
                    <g transform="translate(300 216)">
                      <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "7s" }}><GearShape r={10} teeth={7} fill="var(--machine-line)" hub={false} /></g>
                    </g>
                    {/* balance wheel + hairspring (upper-right) */}
                    <g transform={`translate(${polar(300, 300, 116, 40)[0]} ${polar(300, 300, 116, 40)[1]})`}>
                      <g className={reduced ? undefined : "balance"}>
                        <circle r="21" fill="none" stroke="var(--machine-line)" strokeWidth="3" />
                        <line x1="-21" y1="0" x2="21" y2="0" stroke="var(--machine-line)" strokeWidth="1.8" />
                        <circle r="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                      </g>
                      <path d="M0 0 m0 -8 a8 8 0 0 1 8 8 a12 12 0 0 1 -12 12" fill="none" stroke="var(--machine-inv)" strokeWidth="0.8" opacity="0.5" />
                    </g>
                    {/* cam + follower (upper-left) */}
                    <g transform={`translate(${polar(300, 300, 118, 310)[0]} ${polar(300, 300, 118, 310)[1]})`}>
                      <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "8s" }}>
                        <path d="M0 -13 A13 13 0 1 1 -9 9 Q-4 2 0 -13 Z" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                      </g>
                      <g className={reduced ? undefined : "piston"} style={{ animationDuration: "8s" }}>
                        <line x1="0" y1="-14" x2="0" y2="-26" stroke="var(--machine-line)" strokeWidth="2.4" strokeLinecap="round" />
                        <rect x="-5" y="-32" width="10" height="6" rx="1.5" fill="var(--machine-line)" />
                      </g>
                      <circle r="2" fill="var(--machine-line)" />
                    </g>
                    {/* twin pistons (right) */}
                    {[[100, 100], [125, 122]].map(([deg, dist], k) => {
                      const [px, py] = polar(300, 300, dist, deg);
                      return (
                        <g key={k} transform={`translate(${px} ${py}) rotate(${deg - 90})`}>
                          <rect x="-8" y="-4" width="16" height="30" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                          <g className={reduced ? undefined : "piston"} style={{ animationDuration: k ? "2.2s" : "3s", animationDelay: `${k * 0.6}s` }}>
                            <rect x="-5" y="0" width="10" height="9" rx="1.5" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="0.9" />
                          </g>
                          <line x1="-8" y1="8" x2="8" y2="8" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.5" />
                        </g>
                      );
                    })}
                    {/* regulator lever (right) */}
                    <g transform={`translate(${polar(300, 300, 120, 60)[0]} ${polar(300, 300, 120, 60)[1]})`}>
                      <path d="M-14 6 A15 15 0 0 1 14 6" fill="none" stroke="var(--machine-line)" strokeWidth="1" strokeDasharray="2 3" />
                      <g className={reduced ? undefined : "valve-wiggle"} style={{ animationDuration: "7s" }}>
                        <line x1="0" y1="8" x2="0" y2="-10" stroke="var(--machine-inv)" strokeWidth="1.8" strokeLinecap="round" />
                      </g>
                      <circle cy="8" r="2.6" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
                    </g>
                  </g>

                  {/* ============ LAYER E — POWER HUB + RACK-AND-PINION POINTER ============ */}
                  <g className="rb-e">
                    {/* hub recess + hex locking collar */}
                    <circle cx="300" cy="300" r="70" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.5" />
                    <path d={`M${polar(300, 300, 66, 200)[0]} ${polar(300, 300, 66, 200)[1]} A66 66 0 0 1 ${polar(300, 300, 66, 320)[0]} ${polar(300, 300, 66, 320)[1]}`}
                      fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="3" opacity="0.5" />
                    <polygon
                      points={Array.from({ length: 6 }).map((_, i) => {
                        const [x, y] = polar(300, 300, 56, i * 60 + 30);
                        return `${x},${y}`;
                      }).join(" ")}
                      fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
                    {Array.from({ length: 6 }).map((_, i) => {
                      const [x, y] = polar(300, 300, 56, i * 60 + 30);
                      return <circle key={i} cx={x} cy={y} r="2.2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.8" />;
                    })}
                    {/* rotating slotted hub ring */}
                    <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "60s" }}>
                      <circle cx="300" cy="300" r="42" fill="none" stroke="var(--machine-line)" strokeWidth="6" strokeDasharray="16 9" opacity="0.9" />
                    </g>
                    <circle cx="300" cy="300" r="34" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                    {/* power-reserve arc */}
                    <path d={`M${polar(300, 300, 64, 120)[0]} ${polar(300, 300, 64, 120)[1]} A64 64 0 0 1 ${polar(300, 300, 64, 240)[0]} ${polar(300, 300, 64, 240)[1]}`}
                      fill="none" stroke="var(--machine-crimson-hot)" strokeWidth="1.6" opacity="0.55" />

                    {/* ---- the articulated pointer ---- */}
                    <g ref={handG} transform="rotate(0 300 300)">
                      <g transform="translate(300 300)">
                        {/* counterweight tail */}
                        <rect x="-5" y="16" width="10" height="26" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
                        <circle cy="46" r="7" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1.2" />
                        {/* toothed rack — slides through the sleeve, clipped to it */}
                        <g clipPath="url(#rackClip)">
                          <g ref={rackG} transform="translate(0 -52)">
                            <rect x="-3.4" y="0" width="6.8" height="162" rx="1.5" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="1" />
                            {Array.from({ length: 16 }).map((_, i) => (
                              <rect key={i} x="-6.6" y={6 + i * 10} width="3.4" height="4.6" rx="1" fill="var(--machine-line)" />
                            ))}
                            <line x1="1.6" y1="4" x2="1.6" y2="158" stroke="var(--machine-crimson-hot)" strokeWidth="1.1" opacity="0.7" />
                            {/* precision tip + locking pin */}
                            <polygon points="0,-16 6.4,2 3.4,6 -3.4,6 -6.4,2" fill="var(--machine-crimson-hot)" stroke="var(--machine-line)" strokeWidth="1" />
                            <polygon points="0,-10 3,1 -3,1" fill="var(--machine-inv)" opacity="0.85" />
                            <rect ref={lockPin} x="5.5" y="8" width="4" height="9" rx="1" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="0.8" />
                          </g>
                        </g>
                        {/* primary arm / sleeve */}
                        <path d="M-7 14 L-5.4 -50 L5.4 -50 L7 14 Z" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                        <line x1="-2.4" y1="10" x2="-1.8" y2="-46" stroke="var(--machine-inv)" strokeWidth="0.9" opacity="0.2" />
                        <rect x="-8.5" y="-54" width="17" height="8" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                        {/* joint gear — meshes the rack */}
                        <g transform="translate(0 -52)">
                          <g ref={jointG}><GearShape r={11} teeth={8} fill="var(--machine-line)" hub={false} /></g>
                          <circle r="2.4" fill="var(--machine-deep)" />
                        </g>
                        {/* central drive pinion */}
                        <g ref={pinionG}><GearShape r={19} teeth={12} fill="var(--machine-plate)" spokes={4} /></g>
                        {/* pivot bearing + crimson centre */}
                        <circle r="8" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                        <circle r="2.8" fill="var(--machine-crimson-hot)" />
                      </g>
                    </g>

                    {/* front clamp brackets over the casing */}
                    {[160, 20].map((deg) => (
                      <path key={deg}
                        d={`M${polar(300, 300, 246, deg - 14)[0]} ${polar(300, 300, 246, deg - 14)[1]} A246 246 0 0 1 ${polar(300, 300, 246, deg + 14)[0]} ${polar(300, 300, 246, deg + 14)[1]}`}
                        fill="none" stroke="var(--machine-line)" strokeWidth="8" strokeLinecap="round" opacity="0.9" />
                    ))}
                  </g>
                </svg>
              </div>

              {/* ============ NINE DISCIPLINE MODULES — chamfered docking housings ============ */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                const deg = nodeAngle(i);
                const [x, y] = polar(50, 50, 44.5, deg);
                const variant = i % 3;
                const clip =
                  variant === 0 ? "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" :
                  variant === 1 ? "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))" :
                  "polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px)";
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
                    <span className="relative grid place-items-center mat-texture transition-all duration-400"
                      style={{
                        width: 74, height: 74,
                        clipPath: clip,
                        backgroundColor: "var(--machine-plate)",
                        color: "var(--machine-inv)",
                        boxShadow: isActive
                          ? "inset 0 0 0 1.5px color-mix(in srgb, var(--machine-inv) 45%, transparent), 0 12px 26px -14px rgba(0,0,0,0.55)"
                          : isHover
                            ? "inset 0 0 0 1.5px color-mix(in srgb, var(--machine-inv) 32%, transparent)"
                            : "inset 0 0 0 1px color-mix(in srgb, var(--machine-inv) 18%, transparent)",
                        transform: isHover && !isActive ? "translateY(-2px)" : "none",
                      }}>
                      {/* recessed panel + bolts */}
                      <span className="absolute inset-[7px] border" style={{ borderColor: "color-mix(in srgb, var(--machine-inv) 16%, transparent)" }} aria-hidden />
                      <span className="absolute top-[3px] left-[3px] w-[5px] h-[5px] rounded-full" style={{ background: "color-mix(in srgb, var(--machine-inv) 30%, transparent)" }} aria-hidden />
                      <span className="absolute bottom-[3px] right-[3px] w-[5px] h-[5px] rounded-full" style={{ background: "color-mix(in srgb, var(--machine-inv) 30%, transparent)" }} aria-hidden />
                      {/* crimson micro-signal on the machine-facing edge */}
                      <span className="absolute inset-x-[16px] bottom-0 h-[2.5px] transition-all duration-400"
                        style={{ background: isActive ? "var(--machine-crimson-hot)" : "transparent" }} aria-hidden />
                      <Icon size={28} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm transition-colors duration-300 ${isActive ? "bg-[var(--machine-crimson-hot)] text-[#f4f2ed]" : "bg-[var(--machine-inv)] text-[var(--machine-plate)]"}`}>
                        {dis.num}
                      </span>
                    </span>
                    <span className={`${labelWrap} pointer-events-none`}>
                      {lb.lines.map((ln) => (
                        <span key={ln}
                          className={`f-tech font-bold text-[12px] tracking-[0.12em] leading-[1.3] whitespace-nowrap transition-all duration-300 ${lb.side === "left" ? "text-right" : "text-left"}`}
                          style={{
                            color: isActive ? "var(--machine-crimson-hot)" : isHover ? "var(--ink)" : "var(--ink2)",
                            transform: isActive ? "scale(1.04)" : "none",
                          }}>
                          {ln}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}

              <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-8 h-px bg-[var(--line)]" />
                REGULATOR HAND — {`CORE/${d.num}`}
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
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
