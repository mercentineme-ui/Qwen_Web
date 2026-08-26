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
      {/* machined edge highlight — upper-left light catch */}
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
      for (let i = 0; i < 24; i++) {
        timers.current.push(window.setTimeout(() => setLit(i + 1), 75 * i));
      }
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

  /* ---- THE MECHANICAL HAND — hub gear → meshing gears → sleeve → telescoping
         forearm → machined tip. Choreography on discipline change:
         RETRACT (forearm pulls in) → ROTATE (weighted, slight overshoot) →
         EXTEND (forearm drives out, settles). Gears spin with angular velocity. ---- */
  const discRef = useRef<HTMLDivElement>(null);
  const handG = useRef<SVGGElement>(null);
  const foreG = useRef<SVGGElement>(null);
  const mainGear = useRef<SVGGElement>(null);
  const smallGear = useRef<SVGGElement>(null);
  const secGear = useRef<SVGGElement>(null);
  const st = useRef({
    ang: 0, angV: 0, ext: 0, extV: 0,
    phase: "idle" as "idle" | "retract" | "rotate" | "extend",
    mainRot: 0, smallRot: 0, secRot: 0,
    raf: 0, last: 0,
    mouse: false, mouseAng: 0, outside: true,
  });
  const selRef = useRef(sel);

  /* discipline change → mechanical handoff (never an instant flip) */
  useEffect(() => {
    selRef.current = sel;
    if (reduced) return;
    st.current.phase = "retract";
  }, [sel, reduced]);

  useEffect(() => {
    if (reduced) {
      /* static resolved state */
      const a = sel !== null ? nodeAngle(sel) : 0;
      const e = sel !== null ? 1 : 0;
      handG.current?.setAttribute("transform", `rotate(${a} 300 300)`);
      foreG.current?.setAttribute("transform", `translate(0 ${(-130 * e).toFixed(1)})`);
      return;
    }
    const loop = (t: number) => {
      const s = st.current;
      const dt = Math.min(0.045, s.last ? (t - s.last) / 1000 : 0.016);
      s.last = t;

      const featAng = selRef.current !== null ? nodeAngle(selRef.current) : 0;
      const featExt = selRef.current !== null ? 1 : 0;
      let tAng = featAng, tExt = featExt, kA = 46, cA = 10.5, kE = 70, cE = 12;

      if (s.outside && !s.mouse) { tAng = 0; tExt = 0; }           /* left the core — fold home */
      else if (s.mouse) { tAng = s.mouseAng; tExt = 1; kA = 60; cA = 13; } /* tracking the cursor */

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

      /* the gears participate — spin with angular velocity + surge */
      const speed = 16 + Math.min(430, Math.abs(s.angV) * 2.1) + Math.abs(s.extV) * 40 + (surgeOn ? 70 : 0);
      s.mainRot += speed * dt;
      s.smallRot -= speed * 2.43 * dt;
      s.secRot -= speed * 1.68 * dt;

      handG.current?.setAttribute("transform", `rotate(${s.ang.toFixed(2)} 300 300)`);
      foreG.current?.setAttribute("transform", `translate(0 ${(-130 * Math.min(1, s.ext)).toFixed(1)})`);
      mainGear.current?.setAttribute("transform", `rotate(${(s.mainRot % 360).toFixed(1)})`);
      smallGear.current?.setAttribute("transform", `translate(42 -18) rotate(${(s.smallRot % 360).toFixed(1)})`);
      secGear.current?.setAttribute("transform", `translate(-46 28) rotate(${(s.secRot % 360).toFixed(1)})`);

      s.raf = requestAnimationFrame(loop);
    };
    st.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.current.raf);
  }, [reduced, surgeOn, disciplines.length]);

  /* cursor tracking — ONLY inside a discipline node area */
  const onNodeMove = (e: React.MouseEvent) => {
    const el = discRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    st.current.mouseAng = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    st.current.mouse = true;
    st.current.outside = false;
    if (st.current.phase === "idle" && selRef.current === null) st.current.phase = "extend";
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
  const pick = (i: number) => {
    if (locked && lockedIdx === i) setLockedIdx(null);
    else setLockedIdx(i);
  };

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
          {/* ================= THE REACTOR ================= */}
          <Reveal>
            <div ref={discRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none"
              onMouseEnter={onDiscEnter} onMouseLeave={onDiscLeave}>
              <div className={`mech-stage ${rebuilding ? "mech-rebuild" : ""}`} style={frozen ?? undefined}>
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`}>

                  {/* ============ BACKGROUND — outer housing + recessed mechanisms ============ */}
                  <g className="rb-a">
                    <circle cx="300" cy="300" r="252" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="2" />
                    {/* housing bolts */}
                    {Array.from({ length: 16 }).map((_, i) => {
                      const [x, y] = polar(300, 300, 243, (i / 16) * 360);
                      return (
                        <g key={i}>
                          <circle cx={x} cy={y} r="3.4" fill="var(--machine-line)" stroke="var(--machine-plate)" strokeWidth="1.1" />
                          <line x1={x - 1.8} y1={y} x2={x + 1.8} y2={y} stroke="var(--machine-plate)" strokeWidth="0.9" />
                        </g>
                      );
                    })}
                    {/* main face plate */}
                    <circle cx="300" cy="300" r="236" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.6" />
                    {/* four recessed access plates */}
                    {[45, 135, 225, 315].map((deg) => {
                      const [x, y] = polar(300, 300, 222, deg);
                      return (
                        <g key={deg} transform={`rotate(${deg} ${x} ${y})`}>
                          <rect x={x - 24} y={y - 13} width="48" height="26" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
                          <line x1={x - 14} y1={y} x2={x - 6} y2={y} stroke="var(--machine-line)" strokeWidth="1.4" />
                          <line x1={x + 6} y1={y} x2={x + 14} y2={y} stroke="var(--machine-line)" strokeWidth="1.4" />
                        </g>
                      );
                    })}
                    {/* recessed channel groove + upper light catch */}
                    <circle cx="300" cy="300" r="206" fill="none" stroke="var(--machine-deep)" strokeWidth="9" opacity="0.9" />
                    <path d={`M${polar(300, 300, 206, 210)[0]} ${polar(300, 300, 206, 210)[1]} A206 206 0 0 1 ${polar(300, 300, 206, 330)[0]} ${polar(300, 300, 206, 330)[1]}`}
                      fill="none" stroke="var(--machine-inv)" strokeWidth="1.2" opacity="0.18" />
                  </g>

                  {/* ============ SEGMENTED OUTER RING + PRECISION TICKS ============ */}
                  <g className="rb-b">
                    {Array.from({ length: 24 }).map((_, i) => {
                      const [x, y] = polar(300, 300, 196, (i / 24) * 360 + 7.5);
                      const on = surgeOn && lit > i;
                      return (
                        <rect key={i} x="-8.5" y="-6.5" width="17" height="13" rx="2"
                          transform={`translate(${x} ${y}) rotate(${(i / 24) * 360 + 7.5})`}
                          fill={on ? "var(--machine-crimson-hot)" : "var(--machine-deep)"}
                          stroke="var(--machine-line)" strokeWidth="0.9"
                          style={{ transition: "fill .3s ease" }} />
                      );
                    })}
                    {Array.from({ length: 60 }).map((_, i) => {
                      const long = i % 5 === 0;
                      const [x1, y1] = polar(300, 300, 184, (i / 60) * 360);
                      const [x2, y2] = polar(300, 300, long ? 176 : 180, (i / 60) * 360);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={long ? "var(--machine-inv)" : "var(--machine-line)"}
                        strokeWidth={long ? 1.4 : 0.8} opacity={long ? 0.5 : 0.6} />;
                    })}
                    {/* node connector stubs + junction diamonds */}
                    {disciplines.map((dis, i) => {
                      const on = i === sel;
                      const [x1, y1] = polar(300, 300, 232, nodeAngle(i));
                      const [x2, y2] = polar(300, 300, 250, nodeAngle(i));
                      const [jx, jy] = polar(300, 300, 241, nodeAngle(i));
                      return (
                        <g key={dis.id}>
                          <line x1={x1} y1={y1} x2={x2} y2={y2}
                            stroke={on ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth={on ? 3.4 : 2.6}
                            strokeLinecap="round" style={{ transition: "stroke .35s ease" }} />
                          <rect x="-5" y="-5" width="10" height="10" transform={`translate(${jx} ${jy}) rotate(45)`}
                            fill={on ? "var(--machine-crimson-hot)" : "var(--machine-deep)"} stroke="var(--machine-line)" strokeWidth="1"
                            style={{ transition: "fill .35s ease" }} />
                        </g>
                      );
                    })}
                  </g>

                  {/* ============ MIDGROUND — spokes, secondary gears, inner rings ============ */}
                  <g className="rb-c">
                    {/* recessed inner plate */}
                    <circle cx="300" cy="300" r="170" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" opacity="0.55" />
                    {/* six mechanical spokes */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const deg = i * 60 + 30;
                      const [ax, ay] = polar(300, 300, 66, deg);
                      const [bx, by] = polar(300, 300, 168, deg);
                      return (
                        <g key={i}>
                          <line x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--machine-line)" strokeWidth="11" strokeLinecap="round" />
                          <line x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--machine-plate)" strokeWidth="6" strokeLinecap="round" />
                          <line x1={ax} y1={ay} x2={bx} y2={by} stroke="var(--machine-inv)" strokeWidth="1" opacity="0.16" strokeLinecap="round" />
                        </g>
                      );
                    })}
                    {/* secondary gears mounted at the spoke ends — always alive */}
                    {Array.from({ length: 6 }).map((_, i) => {
                      const deg = i * 60 + 30;
                      const [gx, gy] = polar(300, 300, 168, deg);
                      return (
                        <g key={i} transform={`translate(${gx} ${gy})`}>
                          <g className={reduced ? undefined : i % 2 ? "gear-cw" : "gear-ccw"} style={{ animationDuration: `${16 + i * 4}s` }}>
                            <GearShape r={15} teeth={9} fill="var(--machine-plate)" hub={false} />
                          </g>
                          <circle r="2.2" fill="var(--machine-line)" />
                        </g>
                      );
                    })}
                    {/* concentric calibration rings */}
                    <circle cx="300" cy="300" r="146" fill="none" stroke="var(--machine-line)" strokeWidth="1.3" opacity="0.8" />
                    <g className={reduced ? undefined : "gear-ccw-slow"}>
                      <circle cx="300" cy="300" r="122" fill="none" stroke="var(--machine-line)" strokeWidth="1" strokeDasharray="3 7" opacity="0.7" />
                    </g>
                    <circle cx="300" cy="300" r="100" fill="none" stroke="var(--machine-inv)" strokeWidth="0.8" opacity="0.2" />
                  </g>

                  {/* surge sweep arcs — travel around the reactor during the 3s window */}
                  {surgeOn && !reduced && (
                    <>
                      <circle cx="300" cy="300" r="158" fill="none" stroke="var(--machine-crimson-hot)" strokeWidth="1.6"
                        strokeDasharray="10 8" className="gear-cw-fast" opacity="0.85" />
                      <circle cx="300" cy="300" r="112" fill="none" stroke="var(--machine-crimson-hot)" strokeWidth="1"
                        strokeDasharray="4 12" className="gear-ccw" style={{ animationDuration: "9s" }} opacity="0.6" />
                    </>
                  )}

                  {/* ============ CENTRAL HUB CHAMBER + CORE ============ */}
                  <g className="rb-e">
                    <circle cx="300" cy="300" r="92" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
                    <path d={`M${polar(300, 300, 88, 200)[0]} ${polar(300, 300, 88, 200)[1]} A88 88 0 0 1 ${polar(300, 300, 88, 320)[0]} ${polar(300, 300, 88, 320)[1]}`}
                      fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="3" opacity="0.5" />
                    <circle cx="300" cy="300" r="58" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.6" />
                    {Array.from({ length: 8 }).map((_, i) => {
                      const [x, y] = polar(300, 300, 48, (i / 8) * 360 + 22.5);
                      return <circle key={i} cx={x} cy={y} r="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.7" />;
                    })}
                    <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "40s" }}>
                      <circle cx="300" cy="300" r="38" fill="none" stroke="var(--machine-inv)" strokeWidth="1" strokeDasharray="2 5" opacity="0.45" />
                    </g>
                    {/* heartbeat core */}
                    <g className={reduced ? undefined : "core-beat"}>
                      <circle cx="300" cy="300" r="13" fill="var(--machine-crimson-hot)" />
                      <circle cx="300" cy="300" r="5" fill="var(--machine-inv)" opacity="0.9" />
                    </g>
                    <circle key={`engage-${sel ?? "x"}`} cx="300" cy="300" r="10" fill="none"
                      stroke="var(--machine-crimson-hot)" strokeWidth="2" className={reduced || sel === null ? undefined : "core-engage"} />
                  </g>

                  {/* ============ FOREGROUND — THE MECHANICAL HAND ============ */}
                  <g className="rb-d">
                    <g ref={handG} transform="rotate(0 300 300)">
                      <g transform="translate(300 300)">
                        {/* telescoping forearm + machined pointer tip (drawn first — slides through the sleeve) */}
                        <g ref={foreG} transform="translate(0 0)">
                          <rect x="-4" y="-74" width="8" height="86" rx="2" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="1.2" />
                          <line x1="-1.4" y1="-70" x2="-1.4" y2="6" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.4" />
                          {/* pointer tip */}
                          <polygon points="0,-96 8.5,-72 4.5,-68 -4.5,-68 -8.5,-72" fill="var(--machine-crimson-hot)" stroke="var(--machine-line)" strokeWidth="1.2" />
                          <polygon points="0,-90 4,-73 -4,-73" fill="var(--machine-inv)" opacity="0.85" />
                          <circle cx="-6" cy="-62" r="1.5" fill="var(--machine-line)" />
                          <circle cx="6" cy="-62" r="1.5" fill="var(--machine-line)" />
                        </g>
                        {/* counterweight crank behind the hub */}
                        <rect x="-8" y="26" width="16" height="24" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                        <circle cx="0" cy="54" r="8" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1.2" />
                        {/* sleeve / upper arm */}
                        <rect x="-6.5" y="-64" width="13" height="66" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                        <rect x="-9.5" y="-66" width="19" height="9" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                        <circle cx="0" cy="-52" r="5.5" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />
                        <circle cx="0" cy="-52" r="1.6" fill="var(--machine-crimson-hot)" />
                        {/* hub gear train — spins with the hand's motion */}
                        <g ref={secGear} transform="translate(-46 28)">
                          <GearShape r={19} teeth={11} fill="var(--machine-deep)" />
                        </g>
                        <g ref={smallGear} transform="translate(42 -18)">
                          <GearShape r={12.5} teeth={8} fill="var(--machine-deep)" />
                        </g>
                        <g ref={mainGear} transform="rotate(0)">
                          <GearShape r={34} teeth={16} fill="var(--machine-plate)" spokes={4} />
                        </g>
                        {/* fixed central axle cap */}
                        <circle r="9" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                        <circle r="3" fill="var(--machine-crimson-hot)" />
                      </g>
                    </g>
                    {/* front clamp arcs — overlap the housing, give the machine its front plane */}
                    {[200, 340].map((deg) => (
                      <path key={deg}
                        d={`M${polar(300, 300, 246, deg - 16)[0]} ${polar(300, 300, 246, deg - 16)[1]} A246 246 0 0 1 ${polar(300, 300, 246, deg + 16)[0]} ${polar(300, 300, 246, deg + 16)[1]}`}
                        fill="none" stroke="var(--machine-line)" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
                    ))}
                    {[200, 340].map((deg) => (
                      <path key={`h-${deg}`}
                        d={`M${polar(300, 300, 246, deg - 16)[0]} ${polar(300, 300, 246, deg - 16)[1]} A246 246 0 0 1 ${polar(300, 300, 246, deg + 16)[0]} ${polar(300, 300, 246, deg + 16)[1]}`}
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
                /* reserved label zones — names never cross the machine */
                const zone = i === 0 ? "above" : i === 1 ? "right" : i === 2 ? "below" : i === disciplines.length - 1 ? "left"
                  : deg < 30 || deg > 330 ? "above" : deg <= 120 ? "right" : deg <= 240 ? "below" : "left";
                const labelWrap =
                  zone === "above" ? "absolute -top-9 inset-x-0 flex justify-center" :
                  zone === "below" ? "absolute -bottom-9 inset-x-0 flex justify-center" :
                  zone === "left" ? "absolute right-full top-1/2 -translate-y-1/2 pr-2.5 flex justify-end" :
                  "absolute left-full top-1/2 -translate-y-1/2 pl-2.5 flex justify-start";
                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseMove={onNodeMove}
                    onMouseLeave={() => { setHoverIdx(null); onNodeLeave(); }}
                    onClick={() => pick(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}>
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
                      <span className={`f-tech font-bold text-[12px] tracking-[0.1em] leading-tight whitespace-nowrap transition-colors duration-300 ${zone === "left" ? "text-right" : "text-left"}`}
                        style={{ color: isActive ? "var(--machine-crimson-hot)" : "var(--ink2)" }}>
                        {dis.name}
                      </span>
                    </span>
                  </button>
                );
              })}

              <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-8 h-px bg-[var(--line)]" />
                MECHANICAL HAND — {sel !== null ? `CORE/${disciplines[sel].num}` : "AT REST"}
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
                  {/* idle gearbox — interlocking gears + axle + ready indicator */}
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
