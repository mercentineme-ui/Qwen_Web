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
      {/* machined edge highlight — upper-left light catch */}
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
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity="0.2" />;
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

  /* ---- 3D theme rebuild — machine dismantles, inverts, reassembles ---- */
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
        });
        setRebuilding(true);
        st.current.phase = "retract"; /* pointer folds away while the machine rebuilds */
        const t = window.setTimeout(() => { setRebuilding(false); setFrozen(null); }, 1560);
        return () => clearTimeout(t);
      }
    }
  }, [theme, reduced]);

  /* ---- THE GEAR-DRIVEN POINTER — central pinion → primary arm/sleeve →
         joint gear → toothed rack that slides through the sleeve → crimson tip.
         Choreography on capability change: RETRACT → ROTATE → EXTEND.
         The crank/piston governor spins up while the pointer is in motion. ---- */
  const discRef = useRef<HTMLDivElement>(null);
  const handG = useRef<SVGGElement>(null);
  const rackG = useRef<SVGGElement>(null);
  const pinionG = useRef<SVGGElement>(null);
  const secGearG = useRef<SVGGElement>(null);
  const jointGearG = useRef<SVGGElement>(null);
  const pinG = useRef<SVGGElement>(null);
  const crankG = useRef<SVGGElement>(null);
  const rodG = useRef<SVGGElement>(null);
  const pistonG = useRef<SVGGElement>(null);
  const pausedRef = useRef(false);
  const st = useRef({
    ang: 0, angV: 0, ext: 0, extV: 0,
    phase: "extend" as "retract" | "rotate" | "extend" | "idle",
    gearRot: 0, crankAng: 0, crankV: 1,
    raf: 0, last: 0,
    mouse: false, mouseAng: 0, outside: true,
  });
  const selRef = useRef(sel);

  /* capability change → mechanical handoff (never an instant flip) */
  useEffect(() => {
    selRef.current = sel;
    if (!reduced) st.current.phase = "retract";
  }, [sel, reduced]);

  /* reduced motion — snap the pointer to each capability, no continuous sim */
  useEffect(() => {
    if (!reduced) return;
    const a = nodeAngle(sel);
    handG.current?.setAttribute("transform", `rotate(${a} 300 300)`);
    rackG.current?.setAttribute("transform", "translate(0 -148)");
    pinG.current?.setAttribute("opacity", "1");
  }, [reduced, sel]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (reduced) return;
    const loop = (t: number) => {
      const s = st.current;
      const dt = Math.min(0.045, s.last ? (t - s.last) / 1000 : 0.016);
      s.last = t;

      if (!pausedRef.current) {
        const featAng = selRef.current !== null ? nodeAngle(selRef.current) : 0;
        const featExt = selRef.current !== null ? 1 : 0;
        let tAng = featAng, tExt = featExt, kA = 46, cA = 10.5, kE = 70, cE = 12;

        if (s.outside && !s.mouse && selRef.current === null) { tAng = 0; tExt = 0; }
        else if (s.mouse) { tAng = s.mouseAng; tExt = 1; kA = 60; cA = 13; }

        if (s.phase === "retract") {
          tExt = 0; kE = 110; cE = 18;
          if (s.ext < 0.05 && Math.abs(s.extV) < 0.4) s.phase = "rotate";
        } else if (s.phase === "rotate") {
          tExt = 0;
          if (Math.abs(((tAng - s.ang + 180) % 360 + 360) % 360 - 180) < 1.6 && Math.abs(s.angV) < 26) {
            s.phase = featExt === 1 ? "extend" : "idle";
          }
        } else if (s.phase === "extend") {
          tExt = 1; kE = 84; cE = 10.2; /* under-damped — physical overshoot + settle */
          if (s.ext > 0.985 && Math.abs(s.extV) < 0.25) s.phase = "idle";
        }

        /* weighted springs */
        const dA = ((tAng - s.ang + 180) % 360 + 360) % 360 - 180;
        s.angV += (dA * kA - s.angV * cA) * dt;
        s.ang += s.angV * dt;
        s.extV += ((tExt - s.ext) * kE - s.extV * cE) * dt;
        s.ext = Math.max(0, Math.min(1.06, s.ext + s.extV * dt));

        /* pointer gears spin with actual motion — idle tick + velocity drive */
        const vel = Math.abs(s.angV) * 2.2 + Math.abs(s.extV) * 40;
        s.gearRot += (14 + vel) * dt;

        /* governor crank — spins faster while the pointer works */
        const crankTarget = 1.0 + Math.min(3.2, vel * 0.022) + (s.ext > 0.4 ? 0.7 : 0);
        s.crankV += (crankTarget - s.crankV) * Math.min(1, dt * 1.6);
        s.crankAng += s.crankV * dt;

        /* apply pointer */
        handG.current?.setAttribute("transform", `rotate(${s.ang.toFixed(2)} 300 300)`);
        rackG.current?.setAttribute("transform", `translate(0 ${(-148 * Math.min(1, s.ext)).toFixed(1)})`);
        pinionG.current?.setAttribute("transform", `rotate(${(s.gearRot % 360).toFixed(1)})`);
        secGearG.current?.setAttribute("transform", `translate(24 -4) rotate(${(-s.gearRot * 1.6 % 360).toFixed(1)})`);
        jointGearG.current?.setAttribute("transform", `translate(0 -62) rotate(${(s.gearRot * 0.9 % 360).toFixed(1)})`);
        pinG.current?.setAttribute("opacity", s.ext > 0.94 ? "1" : "0");
        pinG.current?.setAttribute("transform", `translate(0 ${s.ext > 0.94 ? 3 : 0})`);

        /* governor kinematics — crank (309,232) r=8, rod L=36, piston on x=309 */
        const th = s.crankAng;
        const kx = 309 + 8 * Math.sin(th);
        const ky = 232 - 8 * Math.cos(th);
        const py = 232 - (8 * Math.cos(th) + Math.sqrt(36 * 36 - 64 * Math.sin(th) * Math.sin(th)));
        crankG.current?.setAttribute("transform", `translate(309 232) rotate(${((th * 180) / Math.PI % 360).toFixed(1)})`);
        const phi = (Math.atan2(309 - kx, py - ky) * 180) / Math.PI;
        rodG.current?.setAttribute("transform", `translate(${kx.toFixed(1)} ${ky.toFixed(1)}) rotate(${phi.toFixed(1)})`);
        pistonG.current?.setAttribute("transform", `translate(0 ${(py - 188).toFixed(1)})`);
      }

      s.raf = requestAnimationFrame(loop);
    };
    st.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.current.raf);
  }, [reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  /* pause the simulation when the Core is off-screen */
  useEffect(() => {
    const el = discRef.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { pausedRef.current = !e.isIntersecting; }));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* cursor tracking — ONLY inside a discipline node area */
  const onNodeMove = (e: React.MouseEvent) => {
    const el = discRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    st.current.mouseAng = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    st.current.mouse = true;
    st.current.outside = false;
  };
  const onNodeLeave = () => {
    st.current.mouse = false;
    if (selRef.current === null) st.current.phase = "retract";
  };
  const onDiscEnter = () => { st.current.outside = false; };
  const onDiscLeave = () => {
    st.current.outside = true;
    st.current.mouse = false;
    if (!reduced && selRef.current === null) st.current.phase = "retract";
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
          {/* ================= THE GOVERNOR ================= */}
          <Reveal>
            <div ref={discRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none"
              onMouseEnter={onDiscEnter} onMouseLeave={onDiscLeave}>
              <div className={`mech-stage ${rebuilding ? "mech-rebuild" : ""}`} style={frozen ?? undefined}>
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`}>

                  {/* ============ LAYER A — STRUCTURAL CASING ============ */}
                  <g className="rb-a">
                    {/* mounting pedestals at the cardinal points */}
                    {[0, 90, 180, 270].map((deg) => (
                      <g key={deg} transform={`rotate(${deg} 300 300)`}>
                        <polygon points="262,288 282,292 282,308 262,312" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.2" />
                        <circle cx="272" cy="300" r="2.6" fill="var(--core-line)" stroke="var(--core-deep)" strokeWidth="0.8" />
                      </g>
                    ))}
                    {/* heavy outer rim */}
                    <circle cx="300" cy="300" r="266" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="2" />
                    {/* bevel — upper light catch, lower shadow */}
                    <path d={`M${polar(300, 300, 261, 205)[0]} ${polar(300, 300, 261, 205)[1]} A261 261 0 0 1 ${polar(300, 300, 261, 335)[0]} ${polar(300, 300, 261, 335)[1]}`}
                      fill="none" stroke="var(--core-inv)" strokeWidth="1.3" opacity="0.15" />
                    <path d={`M${polar(300, 300, 261, 25)[0]} ${polar(300, 300, 261, 25)[1]} A261 261 0 0 1 ${polar(300, 300, 261, 155)[0]} ${polar(300, 300, 261, 155)[1]}`}
                      fill="none" stroke="#000" strokeWidth="1.6" opacity="0.28" />
                    {/* machined grooves */}
                    <circle cx="300" cy="300" r="262" fill="none" stroke="var(--core-line)" strokeWidth="0.8" opacity="0.5" />
                    <circle cx="300" cy="300" r="240" fill="none" stroke="var(--core-line)" strokeWidth="0.8" opacity="0.4" />
                    {/* rim bolts */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const [x, y] = polar(300, 300, 251, i * 45 + 22.5);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="5" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.1" />
                          <line x1={x - 2.4} y1={y} x2={x + 2.4} y2={y} stroke="var(--core-line)" strokeWidth="1" transform={`rotate(${i * 23} ${x} ${y})`} />
                        </g>
                      );
                    })}
                    {/* inspection plates at the diagonals */}
                    {[45, 135, 225, 315].map((deg) => {
                      const [x, y] = polar(300, 300, 251, deg);
                      return (
                        <g key={deg} transform={`rotate(${deg} ${x} ${y})`}>
                          <rect x={x - 15} y={y - 8} width="30" height="16" rx="2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />
                          <circle cx={x - 10} cy={y} r="1.7" fill="var(--core-line)" />
                          <circle cx={x + 10} cy={y} r="1.7" fill="var(--core-line)" />
                        </g>
                      );
                    })}
                    {/* engraved nameplate — bottom arc */}
                    <defs>
                      <path id="core-arc-text" d="M 52 300 A 248 248 0 0 0 548 300" fill="none" />
                    </defs>
                    <text fontSize="7.5" letterSpacing="2.5" className="f-mono" fill="var(--core-mid)" opacity="0.65">
                      <textPath href="#core-arc-text" startOffset="50%" textAnchor="middle">CREATIVE GOVERNOR · Nº 009 · CAL. 9F</textPath>
                    </text>
                    {/* recessed cavity */}
                    <circle cx="300" cy="300" r="236" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.4" />
                    <circle cx="300" cy="300" r="205" fill="var(--core-deep)" />
                    <circle cx="300" cy="300" r="205" fill="#000" opacity="0.14" />
                    <circle cx="300" cy="300" r="205" fill="none" stroke="var(--core-line)" strokeWidth="1.2" />
                  </g>

                  {/* ============ LAYER B — ROTATING TICK BAND + STATIC INDEX ============ */}
                  <g className="rb-b">
                    {/* continuously measuring tick band — very slow */}
                    <g className={spin("gear-cw")} style={{ animationDuration: "240s" }}>
                      <circle cx="300" cy="300" r="216" fill="none" stroke="var(--core-plate)" strokeWidth="17" opacity="0.9" />
                      {Array.from({ length: 72 }).map((_, i) => {
                        const long = i % 8 === 0;
                        const [x1, y1] = polar(300, 300, long ? 223 : 221, (i / 72) * 360);
                        const [x2, y2] = polar(300, 300, 209, (i / 72) * 360);
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke={long ? "var(--core-inv)" : "var(--core-line)"}
                          strokeWidth={long ? 1.3 : 0.7} opacity={long ? 0.45 : 0.5} />;
                      })}
                    </g>
                    {/* counter-rotating inner dashed ring */}
                    <g className={spin("gear-ccw-slow")}>
                      <circle cx="300" cy="300" r="196" fill="none" stroke="var(--core-line)" strokeWidth="1" strokeDasharray="3 7" opacity="0.6" />
                    </g>
                    {/* static index system — one diamond per discipline */}
                    {disciplines.map((dis, i) => {
                      const on = i === sel;
                      const [dx, dy] = polar(300, 300, 220, nodeAngle(i));
                      const [jx, jy] = polar(300, 300, 229, nodeAngle(i));
                      const [rx1, ry1] = polar(300, 300, 224, nodeAngle(i));
                      const [rx2, ry2] = polar(300, 300, 238, nodeAngle(i));
                      return (
                        <g key={dis.id}>
                          <line x1={rx1} y1={ry1} x2={rx2} y2={ry2}
                            stroke={on ? "var(--crim-panel)" : "var(--core-line)"} strokeWidth={on ? 3 : 2.2}
                            strokeLinecap="round" style={{ transition: "stroke .35s ease" }} />
                          {!reduced && (
                            <line x1={rx1} y1={ry1} x2={rx2} y2={ry2} stroke="var(--core-inv)" strokeWidth="1"
                              className={on ? "channel-flow" : undefined} opacity={on ? 0.9 : 0.18} />
                          )}
                          <circle cx={jx} cy={jy} r={on ? 4.4 : 3.4} fill="var(--core-deep)"
                            stroke={on ? "var(--crim-panel)" : "var(--core-line)"} strokeWidth="1.2"
                            style={{ transition: "all .35s ease" }} />
                          <rect x="-4" y="-4" width="8" height="8" transform={`translate(${dx} ${dy}) rotate(45)`}
                            fill={on ? "var(--crim-panel)" : "var(--core-plate)"} stroke={on ? "var(--core-inv)" : "var(--core-line)"} strokeWidth="1"
                            style={{ transition: "fill .35s ease" }} />
                        </g>
                      );
                    })}
                  </g>

                  {/* ============ LAYER C — GOING TRAIN + GOVERNOR ============ */}
                  <g className="rb-c">
                    {/* barrel / great wheel with visible mainspring spiral */}
                    <Drop cx={204} cy={368} rx={42} />
                    <g transform="translate(204 360)"><g className={spin("gear-cw")} style={{ animationDuration: "50s" }}>
                      <GearShape r={40} teeth={20} fill="var(--core-plate)" spokes={5} />
                      <path d="M0 0 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0 a16 16 0 0 1 -32 0"
                        fill="none" stroke="var(--core-inv)" strokeWidth="1" opacity="0.28" />
                    </g></g>
                    {/* ratchet click lever on the barrel */}
                    <g className={spin("valve-wiggle")} style={{ transformOrigin: "188px 332px", animationDuration: "3.4s" }}>
                      <line x1="188" y1="332" x2="206" y2="344" stroke="var(--core-mid)" strokeWidth="2.6" strokeLinecap="round" />
                      <circle cx="188" cy="332" r="2.4" fill="var(--core-mid)" />
                    </g>
                    {/* center wheel — meshes off the barrel */}
                    <Drop cx={269} cy={366} rx={27} />
                    <g transform="translate(269 360)"><g className={spin("gear-ccw")} style={{ animationDuration: "31s" }}>
                      <GearShape r={25} teeth={12} fill="var(--core-deep)" stroke="var(--core-line)" spokes={4} />
                    </g></g>
                    {/* third wheel — meshes off the center wheel, drives the shaft */}
                    <Drop cx={309} cy={366} rx={17} />
                    <g transform="translate(309 360)"><g className={spin("gear-cw")} style={{ animationDuration: "19s" }}>
                      <GearShape r={15} teeth={9} fill="var(--core-plate)" hub={false} />
                      <circle r="4" fill="var(--core-line)" />
                    </g></g>
                    {/* idler — carries motion across to the gauge */}
                    <g transform="translate(336 360)"><g className={spin("gear-ccw")} style={{ animationDuration: "14s" }}>
                      <GearShape r={11} teeth={8} fill="var(--core-deep)" stroke="var(--core-line)" hub={false} />
                    </g></g>
                    {/* thin drive rod up to the gauge */}
                    <line x1="336" y1="352" x2="366" y2="276" stroke="var(--core-line)" strokeWidth="2.4" strokeLinecap="round" />
                    <circle cx="351" cy="314" r="2.4" fill="var(--core-mid)" />
                    {/* vertical shaft — rises from the third wheel, passing BEHIND the hub */}
                    <rect x="305.5" y="236" width="7" height="122" rx="2" fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="1" />
                    {[330, 296, 262].map((by) => (
                      <g key={by}>
                        <rect x="301" y={by - 4.5} width="16" height="9" rx="2" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.1" />
                        <circle cx="309" cy={by} r="1.4" fill="var(--core-inv)" opacity="0.5" />
                      </g>
                    ))}
                    {/* governor — crank disc + connecting rod + piston in a cutaway cylinder */}
                    <rect x="296" y="148" width="26" height="56" rx="4" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.3" />
                    <rect x="300" y="152" width="18" height="48" rx="2" fill="#000" opacity="0.16" />
                    <rect x="292" y="142" width="34" height="8" rx="2" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                    <g ref={pistonG}>
                      <rect x="299" y="164" width="20" height="22" rx="3" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
                      <line x1="300" y1="170" x2="318" y2="170" stroke="var(--core-line)" strokeWidth="1" />
                      <line x1="300" y1="175" x2="318" y2="175" stroke="var(--core-line)" strokeWidth="1" />
                    </g>
                    <g ref={rodG}>
                      <rect x="-2.2" y="0" width="4.4" height="36" rx="2" fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="0.9" />
                      <circle r="4.2" fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="1" />
                      <circle cy="36" r="3.2" fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="1" />
                    </g>
                    <Drop cx={309} cy={240} rx={18} />
                    <g ref={crankG}>
                      <circle r="17" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.4" />
                      <circle cx="6" cy="6" r="3" fill="var(--core-deep)" />
                      <circle cx="-6" cy="-6" r="3" fill="var(--core-deep)" />
                      <circle cy="-8" r="3.4" fill="var(--core-inv)" stroke="var(--core-deep)" strokeWidth="1" />
                      <circle r="3" fill="var(--core-line)" />
                    </g>
                    {/* pressure gauge — needle sways on the drive */}
                    <g>
                      <circle cx="372" cy="262" r="15" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.4" />
                      {[-60, -30, 0, 30, 60].map((a) => (
                        <line key={a} x1="372" y1="250.5" x2="372" y2="248" stroke="var(--core-inv)" strokeWidth="0.9" opacity="0.55" transform={`rotate(${a} 372 262)`} />
                      ))}
                      <g className={spin("valve-wiggle")} style={{ transformOrigin: "372px 262px", animationDuration: "2.8s" }}>
                        <line x1="372" y1="264" x2="372" y2="252" stroke="var(--crim-panel)" strokeWidth="1.4" strokeLinecap="round" />
                      </g>
                      <circle cx="372" cy="262" r="2" fill="var(--core-mid)" />
                    </g>
                  </g>

                  {/* ============ LAYER D — ESCAPEMENT + BALANCE REGULATOR ============ */}
                  <g className="rb-d">
                    {/* bridge plate carrying the regulator */}
                    <rect x="192" y="200" width="92" height="96" rx="6" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.1" opacity="0.85" />
                    <circle cx="199" cy="207" r="1.8" fill="var(--core-line)" />
                    <circle cx="277" cy="207" r="1.8" fill="var(--core-line)" />
                    <circle cx="199" cy="289" r="1.8" fill="var(--core-line)" />
                    <circle cx="277" cy="289" r="1.8" fill="var(--core-line)" />
                    {/* escape wheel — advances in discrete ticks */}
                    <Drop cx={252} cy={224} rx={14} />
                    <g transform="translate(252 218)">
                      <g style={reduced ? undefined : { animation: "rotCW 10s steps(15, end) infinite", transformBox: "fill-box", transformOrigin: "center" }}>
                        {Array.from({ length: 15 }).map((_, i) => {
                          const a = (i / 15) * Math.PI * 2;
                          return <path key={i} d="M0 0 L2.6 -13 L-1.4 -12 Z" transform={`rotate(${(a * 180) / Math.PI})`} fill="var(--core-mid)" />;
                        })}
                        <circle r="9" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                        <circle r="2.4" fill="var(--core-line)" />
                      </g>
                    </g>
                    {/* pallet fork — rocks on its pivot */}
                    <g className={spin("escapement")} style={{ transformOrigin: "262px 240px" }}>
                      <line x1="262" y1="240" x2="252" y2="226" stroke="var(--core-mid)" strokeWidth="2.4" strokeLinecap="round" />
                      <line x1="262" y1="240" x2="268" y2="228" stroke="var(--core-mid)" strokeWidth="2.4" strokeLinecap="round" />
                      <rect x="249" y="222" width="4" height="5" rx="1" fill="var(--core-inv)" transform="rotate(-30 251 224)" />
                      <rect x="266" y="224" width="4" height="5" rx="1" fill="var(--core-inv)" transform="rotate(20 268 226)" />
                      <line x1="262" y1="240" x2="272" y2="252" stroke="var(--core-mid)" strokeWidth="2.2" strokeLinecap="round" />
                    </g>
                    <circle cx="262" cy="240" r="2.6" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1" />
                    {/* balance wheel with hairspring — continuous damped oscillation */}
                    <Drop cx={224} cy={272} rx={21} />
                    <g className={spin("balance")} style={{ transformOrigin: "224px 268px" }}>
                      <circle cx="224" cy="268" r="20" fill="none" stroke="var(--core-plate)" strokeWidth="3.2" />
                      <line x1="206" y1="268" x2="242" y2="268" stroke="var(--core-plate)" strokeWidth="1.6" />
                      <line x1="224" y1="250" x2="224" y2="286" stroke="var(--core-plate)" strokeWidth="1.6" />
                      <circle cx="224" cy="250" r="2.2" fill="var(--crim-panel)" />
                    </g>
                    <path d="M224 268 a3 3 0 0 1 6 0 a6 6 0 0 1 -12 0 a9 9 0 0 1 18 0 a12 12 0 0 1 -24 0"
                      fill="none" stroke="var(--core-mid)" strokeWidth="0.8" opacity="0.6" />
                    <circle cx="224" cy="268" r="3" fill="var(--core-line)" />
                  </g>

                  {/* ============ LAYER E — CENTRAL POWER HUB ============ */}
                  <g className="rb-e">
                    <Drop cx={300} cy={312} rx={34} />
                    {/* octagonal locking collar */}
                    <g transform="translate(300 300)">
                      <polygon points="30,12.4 12.4,30 -12.4,30 -30,12.4 -30,-12.4 -12.4,-30 12.4,-30 30,-12.4"
                        fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.5" />
                      {[[21, 8.7], [-21, 8.7], [8.7, -21], [-8.7, -21]].map(([bx, by], k) => (
                        <circle key={k} cx={bx} cy={by} r="1.9" fill="var(--core-line)" />
                      ))}
                    </g>
                    {/* rotating slotted hub ring */}
                    <g className={spin("gear-cw")} style={{ animationDuration: "60s" }}>
                      <circle cx="300" cy="300" r="23" fill="none" stroke="var(--core-mid)" strokeWidth="1.2" strokeDasharray="10 6" opacity="0.75" />
                    </g>
                    <circle cx="300" cy="300" r="17" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.3" />
                  </g>

                  {/* ============ LAYER F — THE GEAR-DRIVEN POINTER ============ */}
                  <g className="rb-f">
                    <g ref={handG} transform="rotate(0 300 300)">
                      <g transform="translate(300 300)">
                        <clipPath id="rack-clip"><rect x="-7" y="-240" width="14" height="172" /></clipPath>
                        {/* counterweight tail */}
                        <rect x="-6" y="18" width="12" height="26" rx="3" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.1" />
                        <circle cy="48" r="6.5" fill="var(--core-mid)" stroke="var(--core-deep)" strokeWidth="1.1" />
                        {/* toothed rack — slides through the sleeve as the pointer extends */}
                        <g clipPath="url(#rack-clip)">
                          <g ref={rackG} transform="translate(0 0)">
                            <rect x="-3.4" y="-218" width="6.8" height="154" rx="2" fill="var(--core-inv)" stroke="var(--core-line)" strokeWidth="1" />
                            {Array.from({ length: 16 }).map((_, i) => (
                              <rect key={i} x="3.4" y={-212 + i * 9} width="3.4" height="5" fill="var(--core-mid)" />
                            ))}
                            {/* crimson precision tip */}
                            <polygon points="0,-232 7,-215 -7,-215" fill="var(--crim-panel)" stroke="var(--core-deep)" strokeWidth="1.1" />
                            <polygon points="0,-226 3.4,-216 -3.4,-216" fill="var(--core-inv)" opacity="0.85" />
                            {/* locking pin — drops when fully extended */}
                            <g ref={pinG} opacity="0">
                              <circle cx="-7" cy="-206" r="2.6" fill="var(--crim-panel)" stroke="var(--core-deep)" strokeWidth="0.9" />
                            </g>
                          </g>
                        </g>
                        {/* primary arm / sleeve */}
                        <rect x="-8" y="-70" width="16" height="84" rx="3" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.3" />
                        <rect x="-11" y="-72" width="22" height="8" rx="2" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                        <circle cy="-40" r="5.5" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.1" />
                        <circle cy="-40" r="1.6" fill="var(--crim-panel)" />
                        {/* joint gear at the sleeve mouth — driven */}
                        <g ref={jointGearG} transform="translate(0 -62)">
                          <GearShape r={9} teeth={7} fill="var(--core-plate)" stroke="var(--core-line)" hub={false} />
                        </g>
                        {/* secondary gear — meshes off the central pinion */}
                        <g ref={secGearG} transform="translate(24 -4)">
                          <GearShape r={7.5} teeth={6} fill="var(--core-mid)" stroke="var(--core-deep)" hub={false} />
                        </g>
                        {/* central drive pinion */}
                        <g ref={pinionG} transform="rotate(0)">
                          <GearShape r={12} teeth={8} fill="var(--core-plate)" stroke="var(--core-line)" hub={false} />
                        </g>
                        {/* jewel bearing + cap on top of the pinion */}
                        <g className={spin("core-beat")}>
                          <circle r="7.5" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.2" />
                          <circle r="4" fill="var(--crim-panel)" />
                          <circle r="1.4" fill="var(--core-inv)" opacity="0.9" />
                        </g>
                        {/* engagement pulse on every capability change */}
                        <circle key={`engage-${sel}`} r="10" fill="none" stroke="var(--crim-panel)" strokeWidth="2"
                          className={reduced ? undefined : "core-engage"} />
                      </g>
                    </g>
                  </g>
                </svg>
              </div>

              {/* ============ NINE DISCIPLINE MODULES — radially mounted ============ */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                const [x, y] = polar(50, 50, 44.5, nodeAngle(i));
                const lb = LBL[i % LBL.length];
                const labelWrap =
                  lb.side === "above" ? "absolute -top-10 inset-x-0 flex flex-col items-center" :
                  lb.side === "left" ? "absolute right-full top-1/2 -translate-y-1/2 pr-3 flex flex-col items-end" :
                  "absolute left-full top-1/2 -translate-y-1/2 pl-3 flex flex-col items-start";
                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseMove={onNodeMove}
                    onMouseLeave={() => { setHoverIdx(null); onNodeLeave(); }}
                    onClick={() => pick(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}
                    aria-pressed={isActive}>
                    {/* machined docking module — octagonal housing, recessed panel, bolts, connector tab */}
                    <span className="relative block transition-all duration-300 mat-texture"
                      style={{
                        width: 76, height: 76,
                        clipPath: "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)",
                        backgroundColor: isActive ? "var(--core-inv)" : "var(--core-plate)",
                        color: isActive ? "var(--core-plate)" : "var(--core-inv)",
                        boxShadow: isActive
                          ? "inset 0 0 0 1.5px rgba(34,35,40,0.5), 0 12px 26px -14px rgba(0,0,0,0.55)"
                          : isHover
                            ? "inset 0 0 0 1.5px var(--core-mid)"
                            : "inset 0 0 0 1px color-mix(in srgb, var(--core-mid) 45%, transparent)",
                        transform: isHover && !isActive ? "translateY(-2px)" : "none",
                      }}>
                      <span className="absolute inset-0 grid place-items-center">
                        <Icon size={30} strokeWidth={1.8} />
                      </span>
                      {/* recessed inner panel line */}
                      <span className="absolute inset-[7px] pointer-events-none" style={{ border: "1px solid color-mix(in srgb, currentColor 18%, transparent)" }} />
                      {/* mounting bolts */}
                      <span className="absolute top-[4px] left-[13px] w-[3px] h-[3px] rounded-full" style={{ background: "currentColor", opacity: 0.5 }} />
                      <span className="absolute top-[4px] right-[13px] w-[3px] h-[3px] rounded-full" style={{ background: "currentColor", opacity: 0.5 }} />
                      {/* number plate */}
                      <span className="absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5"
                        style={{
                          background: isActive ? "var(--crim-panel)" : "var(--core-mid)",
                          color: isActive ? "#DDDDD8" : "var(--core-plate)",
                        }}>
                        {dis.num}
                      </span>
                      {/* connector tab toward the machine */}
                      <span className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-6 h-[7px]"
                        style={{
                          clipPath: "polygon(0 0, 100% 0, 75% 100%, 25% 100%)",
                          background: isActive ? "var(--crim-panel)" : "var(--core-line)",
                          transition: "background .3s ease",
                        }} />
                      {/* active micro-indicator */}
                      {isActive && (
                        <span className="absolute top-[4px] right-[4px] w-1.5 h-1.5 rounded-full live-blink" style={{ background: "var(--crim-panel)" }} />
                      )}
                    </span>
                    <span className={`${labelWrap} pointer-events-none`}>
                      {lb.lines.map((ln) => (
                        <span key={ln} className={`f-tech font-bold text-[12px] tracking-[0.12em] leading-[1.3] whitespace-nowrap transition-colors duration-300 ${lb.side === "left" ? "text-right" : "text-left"}`}
                          style={{ color: isActive ? "var(--crim-panel)" : "var(--ink2)" }}>
                          {ln}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}

              <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-8 h-px bg-[var(--line)]" />
                MECHANICAL HAND — {`CORE/${d.num}`}
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
