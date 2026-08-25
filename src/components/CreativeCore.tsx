import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

/* machine material sets — held during the 3D rebuild so the inversion
   lands exactly while the pieces are apart */
const MACH_LIGHT: Record<string, string> = {
  "--machine-plate": "#222328", "--machine-deep": "#3C3D42", "--machine-line": "#59595B", "--machine-inv": "#DDDDD8",
};
const MACH_DARK: Record<string, string> = {
  "--machine-plate": "#DDDDD8", "--machine-deep": "#C3C1BC", "--machine-line": "#222328", "--machine-inv": "#222328",
};

function Gear({ cx, cy, r, teeth, spin, plate = "var(--machine-plate)", bolts = 6 }: {
  cx: number; cy: number; r: number; teeth: number; spin: string; plate?: string; bolts?: number;
}) {
  return (
    <g className={spin}>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        return (
          <rect key={i} x={-r * 0.13} y={-r * 0.16} width={r * 0.26} height={r * 0.32}
            transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
            fill={plate} stroke="var(--machine-line)" strokeWidth="1.2" />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.94} fill={plate} stroke="var(--machine-line)" strokeWidth="1.6" />
      <circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.7" />
      {Array.from({ length: bolts }).map((_, i) => {
        const [x, y] = polar(cx, cy, r * 0.58, (i / bolts) * 360);
        return <circle key={i} cx={x} cy={y} r={r * 0.055} fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />;
      })}
    </g>
  );
}

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  /* hover = preview only · click = lock · second click unlocks · nothing auto-selected */
  const sel = hoverIdx ?? (locked ? lockedIdx : null);
  const d = sel !== null ? disciplines[sel] ?? null : null;

  /* ---- 3D theme rebuild: disassemble → invert materials → reassemble ---- */
  const prevTheme = useRef(theme);
  const [rebuilding, setRebuilding] = useState(false);
  const [machOverride, setMachOverride] = useState<React.CSSProperties | null>(null);
  useEffect(() => {
    if (prevTheme.current === theme) return;
    const from = prevTheme.current;
    prevTheme.current = theme;
    if (reduced) return;
    /* hold the OLD theme's materials while the machine flies apart */
    setMachOverride((from === "light" ? MACH_LIGHT : MACH_DARK) as React.CSSProperties);
    setRebuilding(true);
    const t1 = window.setTimeout(() => setMachOverride(null), 780);   /* invert mid-flight */
    const t2 = window.setTimeout(() => setRebuilding(false), 1580);  /* reassembled */
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [theme, reduced]);

  /* ---- mechanical surge — every 30s, 3s ---- */
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const [lit, setLit] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const iv = window.setInterval(() => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setPhase(1);
      for (let i = 0; i < disciplines.length; i++) {
        timers.current.push(window.setTimeout(() => setLit(i + 1), 90 * i));
      }
      timers.current.push(window.setTimeout(() => setPhase(2), 1050));
      timers.current.push(window.setTimeout(() => setPhase(3), 2200));
      timers.current.push(window.setTimeout(() => { setPhase(0); setLit(0); }, 3000));
    }, 30000);
    return () => { clearInterval(iv); timers.current.forEach(clearTimeout); };
  }, [disciplines.length]);
  const surgeOn = phase !== 0;

  /* ---- CENTER-MOUNTED GEAR POINTER --------------------------------------
     Built INTO the reactor center — NOT a floating cursor. Fixed central
     axle · 2–3 interlocking gears · articulated arm · locking joint · head.
     · mouse out    → compact: gears interlocked, arm retracted, 12 o'clock
     · mouse inside → gears unfold, arm EXTENDS and continuously tracks the
       CURRENT real mouse angle (never an old position, never a node)
     · mouse leaves → arm retracts, linkage folds, gears rotate back and
       interlock at 12 o'clock (~700ms physical motion)
     Mouse position and node selection stay completely separate systems. */
  const discRef = useRef<HTMLDivElement>(null);
  const mech = useRef({
    angle: 0, tAngle: 0, ext: 0, tExt: 0, spin: 0, inside: false, raf: 0, holdTimer: 0,
  });
  const mArm = useRef<SVGGElement>(null);
  const mSeg1 = useRef<SVGLineElement>(null);
  const mSeg2 = useRef<SVGLineElement>(null);
  const mElbow = useRef<SVGGElement>(null);
  const mCollar = useRef<SVGGElement>(null);
  const mHead = useRef<SVGGElement>(null);
  const mSatB = useRef<SVGGElement>(null);
  const mSatC = useRef<SVGGElement>(null);
  const mGearA = useRef<SVGGElement>(null);
  const mGearB = useRef<SVGGElement>(null);
  const mGearC = useRef<SVGGElement>(null);
  useEffect(() => {
    if (reduced) return;
    let last = performance.now();
    const loop = (t: number) => {
      const m = mech.current;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      /* shortest-path angle chase — always toward the CURRENT target */
      const diff = ((m.tAngle - m.angle + 180) % 360 + 360) % 360 - 180;
      const dA = diff * Math.min(1, dt * 9);
      m.angle += dA;
      /* extension: unfolds in ~0.6s, folds in ~0.8s */
      const dE = (m.tExt - m.ext) * Math.min(1, dt * (m.tExt > m.ext ? 5.2 : 4.2));
      m.ext += dE;
      /* gears spin from arm travel + extension change — then settle */
      m.spin += Math.abs(dA) * 0.6 + Math.abs(dE) * 220 * dt * 60 * 0.016;
      const e = m.ext;
      const len = 34 + e * 46;                       /* arm reach */
      const bend = (1 - e) * 15;                     /* elbow articulation */
      const rad = (m.angle * Math.PI) / 180;
      const dirX = Math.sin(rad), dirY = -Math.cos(rad);
      const dist = 34 + e * 17;                      /* satellite gear unfold */
      /* --- write mechanism geometry (arm drawn in the "up" frame, group rotates) --- */
      if (mArm.current) mArm.current.setAttribute("transform", `rotate(${m.angle.toFixed(2)} 300 300)`);
      const ex = 300 + bend, ey = 300 - len * 0.58;
      if (mSeg1.current) { mSeg1.current.setAttribute("x2", ex.toFixed(1)); mSeg1.current.setAttribute("y2", ey.toFixed(1)); }
      if (mSeg2.current) { mSeg2.current.setAttribute("x1", ex.toFixed(1)); mSeg2.current.setAttribute("y1", ey.toFixed(1)); mSeg2.current.setAttribute("y2", (300 - len - 9).toFixed(1)); }
      if (mElbow.current) mElbow.current.setAttribute("transform", `translate(${ex.toFixed(1)} ${ey.toFixed(1)})`);
      if (mCollar.current) mCollar.current.setAttribute("transform", `translate(${(300 + bend * 0.45).toFixed(1)} ${(300 - len * 0.27).toFixed(1)})`);
      if (mHead.current) mHead.current.setAttribute("transform", `translate(300 ${(300 - len - 9).toFixed(1)})`);
      /* satellite gears unfold from the hub, counter-rotating as they mesh */
      const bx = 300 + dist * Math.cos(rad + 2.5), by = 300 + dist * Math.sin(rad + 2.5);
      const cx = 300 + dist * Math.cos(rad - 2.5), cy = 300 + dist * Math.sin(rad - 2.5);
      if (mSatB.current) mSatB.current.setAttribute("transform", `translate(${bx.toFixed(1)} ${by.toFixed(1)})`);
      if (mSatC.current) mSatC.current.setAttribute("transform", `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`);
      if (mGearA.current) mGearA.current.setAttribute("transform", `rotate(${(-m.spin).toFixed(1)})`);
      if (mGearB.current) mGearB.current.setAttribute("transform", `rotate(${(m.spin * 1.75).toFixed(1)})`);
      if (mGearC.current) mGearC.current.setAttribute("transform", `rotate(${(m.spin * 1.75 + 14).toFixed(1)})`);
      void dirX; void dirY;
      m.raf = requestAnimationFrame(loop);
    };
    mech.current.raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(mech.current.raf); clearTimeout(mech.current.holdTimer); };
  }, [reduced]);
  const onDiscMove = (e: React.MouseEvent) => {
    const el = discRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width) * 600;
    const my = ((e.clientY - r.top) / r.height) * 600;
    const m = mech.current;
    clearTimeout(m.holdTimer);
    m.inside = true;
    m.tExt = 1; /* gears unfold, arm extends */
    /* track the CURRENT real mouse position around the fixed axle */
    m.tAngle = (Math.atan2(my - 300, mx - 300) * 180) / Math.PI + 90;
  };
  const onDiscLeave = () => {
    const m = mech.current;
    m.inside = false;
    /* brief hold, then retract + fold back to 12 o'clock */
    m.holdTimer = window.setTimeout(() => {
      if (!mech.current.inside) { mech.current.tExt = 0; mech.current.tAngle = 0; }
    }, 200);
  };
  /* click = lock · click same again = unlock (movement never locks) */
  const pick = (i: number) => {
    if (locked && lockedIdx === i) setLocked(false);
    else { setLockedIdx(i); setLocked(true); }
  };

  const hot = "var(--machine-crimson-hot)";

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

        {/* reactor left · reserved clear gap · dossier pushed to the far right —
            the card never touches node labels or reactor graphics */}
        <div className="mt-12 grid lg:grid-cols-[minmax(0,1.14fr)_minmax(0,352px)] gap-12 lg:gap-24 xl:gap-40 items-center">
          {/* ================= MECHANICAL CREATIVE ENGINE ================= */}
          <Reveal>
            <div ref={discRef} className="relative mx-auto w-full max-w-[620px] aspect-square select-none"
              onMouseMove={onDiscMove} onMouseLeave={onDiscLeave}>
              <div className="mech-stage">
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt mech-rebuild" : ""}`}
                  style={machOverride ?? undefined}>
                  {/* rear structural layer — ground shadow + outer guide rings */}
                  <ellipse cx="300" cy="318" rx="252" ry="30" fill="#222328" opacity="0.22" />
                  <circle cx="300" cy="300" r="276" fill="none" stroke="var(--line-soft)" strokeWidth="1.4" />
                  <circle cx="300" cy="300" r="266" fill="none" stroke="var(--line-soft)" strokeWidth="1" strokeDasharray="3 9"
                    className={reduced ? undefined : "gear-ccw-slow"} style={{ transformOrigin: "300px 300px" }} />

                  {/* ---------- MID machine layer (0.72 scale → clean outer orbit for the nodes) ---------- */}
                  <g transform="translate(300 300) scale(0.72) translate(-300 -300)">
                    {/* baseplate + rivets + engraved grooves */}
                    <circle cx="300" cy="300" r="252" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="2"
                      style={{ filter: "drop-shadow(0 10px 18px rgba(34,35,40,0.35))" }} />
                    {Array.from({ length: 16 }).map((_, i) => {
                      const [x, y] = polar(300, 300, 243, (i / 16) * 360);
                      return <circle key={i} cx={x} cy={y} r="3.4" fill="var(--machine-line)" stroke="var(--machine-plate)" strokeWidth="1.2" />;
                    })}
                    <circle cx="300" cy="300" r="234" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
                    <circle cx="300" cy="300" r="222" fill="none" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.5" />

                    {/* outer tooth ring — slow counter rotation */}
                    <g className={`rb-a ${reduced ? "" : "gear-ccw-slow"}`}>
                      {Array.from({ length: 48 }).map((_, i) => {
                        const a = (i / 48) * Math.PI * 2;
                        const x = 300 + 206 * Math.cos(a), y = 300 + 206 * Math.sin(a);
                        return (
                          <rect key={i} x="-7" y="-9" width="14" height="18"
                            transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
                            fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
                        );
                      })}
                      <circle cx="300" cy="300" r="196" fill="none" stroke="var(--machine-line)" strokeWidth="2.4"
                        style={{ stroke: surgeOn ? hot : undefined, transition: "stroke .5s ease" }} />
                    </g>

                    {/* recessed channel groove around the rim */}
                    <circle cx="300" cy="300" r="168" fill="none" stroke="var(--machine-deep)" strokeWidth="13" opacity="0.9" />
                    <path d={`M${polar(300, 300, 168, 210)[0]} ${polar(300, 300, 168, 210)[1]} A168 168 0 0 1 ${polar(300, 300, 168, 330)[0]} ${polar(300, 300, 168, 330)[1]}`}
                      fill="none" stroke="var(--machine-inv)" strokeWidth="1.4" opacity="0.25" />

                    {/* middle drive ring — clockwise, own speed, alternating graphite/pale spokes */}
                    <g className={`rb-b ${reduced ? "" : "gear-cw"}`}>
                      <circle cx="300" cy="300" r="168" fill="none" stroke="var(--machine-line)" strokeWidth="1.4" opacity="0.85" />
                      {Array.from({ length: 6 }).map((_, i) => {
                        const [x1, y1] = polar(300, 300, 96, i * 60);
                        const [x2, y2] = polar(300, 300, 164, i * 60);
                        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                          stroke={i % 2 ? "#A6A6A4" : "var(--machine-line)"} strokeWidth="7" strokeLinecap="round" />;
                      })}
                      {Array.from({ length: 12 }).map((_, i) => {
                        const [x, y] = polar(300, 300, 146, i * 30);
                        return <circle key={i} cx={x} cy={y} r="3" fill="var(--machine-line)" />;
                      })}
                    </g>

                    {/* satellite gears — meshed at different speeds */}
                    <g className="rb-c">
                      <Gear cx={452} cy={168} r={50} teeth={16} spin={reduced ? "" : "gear-ccw"} />
                      <Gear cx={148} cy={428} r={40} teeth={13} spin={reduced ? "" : "gear-cw-fast"} plate="var(--machine-deep)" bolts={4} />
                    </g>

                    {/* pistons — small mechanical pumping movement, pale rods */}
                    {[-152, 188].map((deg, k) => {
                      const [px, py] = polar(300, 300, 190, deg);
                      return (
                        <g key={k} className="rb-d" transform={`translate(${px} ${py}) rotate(${deg + 90})`}>
                          <rect x="-9" y="-26" width="18" height="30" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
                          <rect x="-3.5" y="2" width="7" height="18" fill="var(--machine-inv)" stroke="#59595B" strokeWidth="0.8"
                            className={reduced ? undefined : "piston"} style={{ animationDelay: `${k * 0.7}s` }} />
                          <rect x="-7" y="18" width="14" height="6" rx="2" fill="var(--machine-warm)" stroke="var(--machine-line)" strokeWidth="1" />
                        </g>
                      );
                    })}

                    {/* pressure valves on the hub face */}
                    {[132, 228].map((deg, k) => {
                      const [vx, vy] = polar(300, 300, 82, deg);
                      return (
                        <g key={k} className={reduced ? undefined : "valve-wiggle"} style={{ animationDelay: `${k * 1.3}s` }}>
                          <circle cx={vx} cy={vy} r="11" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
                          <path d={`M${vx - 7} ${vy} h14 M${vx} ${vy - 7} v14`} stroke="var(--machine-warm)" strokeWidth="2" strokeLinecap="round" />
                          <circle cx={vx} cy={vy} r="2.6" fill="var(--machine-crimson)" />
                        </g>
                      );
                    })}

                    {/* central flywheel + power core */}
                    <g className="rb-e">
                      <Gear cx={300} cy={300} r={92} teeth={22} spin={reduced ? "" : "gear-cw-fast"} bolts={8} />
                      <circle cx="300" cy="300" r="58" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
                      <circle cx="300" cy="300" r="44" fill="var(--machine-plate)" stroke={surgeOn ? hot : "var(--machine-crimson)"} strokeWidth="2.4"
                        style={{ transition: "stroke .4s ease" }} />
                      <g className={reduced ? undefined : "fly-pulse"}>
                        <circle cx="300" cy="300" r="26" fill="var(--machine-crimson)" />
                        <circle cx="300" cy="300" r="15" fill={surgeOn ? hot : "var(--machine-shadow)"} style={{ transition: "fill .4s ease" }} />
                        <circle cx="300" cy="300" r="6" fill="var(--machine-inv)" opacity="0.9" />
                      </g>
                    </g>

                    {/* surge — channel flush rings */}
                    {phase >= 2 && phase < 3 && (
                      <>
                        <circle cx="300" cy="300" r="70" fill="none" stroke={hot} strokeWidth="1.6" strokeDasharray="10 8"
                          className={reduced ? undefined : "gear-cw-fast"} opacity="0.9" />
                        <circle cx="300" cy="300" r="180" fill="none" stroke={hot} strokeWidth="1" strokeDasharray="4 14"
                          className={reduced ? undefined : "gear-ccw"} opacity="0.65" />
                      </>
                    )}

                    {/* tiny internal signal — a courier dot travelling the mid ring */}
                    {!reduced && (
                      <g className="gear-cw" style={{ animationDuration: "11s" }}>
                        <circle cx="300" cy="152" r="4.2" fill="#A6A6A4" stroke="var(--machine-inv)" strokeWidth="1.2" />
                        <circle cx="300" cy="448" r="3" fill="#59595B" stroke="#A6A6A4" strokeWidth="1" />
                      </g>
                    )}
                  </g>

                  {/* mounting arms — full size, bridging machine rim to the node orbit */}
                  {disciplines.map((dis, i) => {
                    const on = i === sel;
                    const litOn = surgeOn && lit > i;
                    const deg = (i / disciplines.length) * 360;
                    const [x1, y1] = polar(300, 300, 184, deg);
                    const [x2, y2] = polar(300, 300, 228, deg);
                    const [bx, by] = polar(300, 300, 206, deg);
                    return (
                      <g key={dis.id}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--machine-line)" strokeWidth="5" strokeLinecap="round" />
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--machine-plate)" strokeWidth="2" />
                        {(on || litOn) && !reduced && (
                          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={hot} strokeWidth="2.6" className="channel-flow" />
                        )}
                        <rect x={bx - 7} y={by - 7} width="14" height="14" transform={`rotate(45 ${bx} ${by})`}
                          fill={on ? hot : "var(--machine-line)"} stroke="var(--machine-plate)" strokeWidth="1.4"
                          style={{ transition: "fill .3s ease" }} />
                      </g>
                    );
                  })}

                  {/* foreground mechanical hardware — pale clamp band + graphite service band */}
                  <g className={`rb-c ${reduced ? "" : "wedge-rock"}`} style={{ animationDuration: "12s" }}>
                    <path d={`M${polar(300, 300, 222, 8)[0]} ${polar(300, 300, 222, 8)[1]} A222 222 0 0 1 ${polar(300, 300, 222, 32)[0]} ${polar(300, 300, 222, 32)[1]} L${polar(300, 300, 200, 32)[0]} ${polar(300, 300, 200, 32)[1]} A200 200 0 0 0 ${polar(300, 300, 200, 8)[0]} ${polar(300, 300, 200, 8)[1]} Z`}
                      fill="#59595B" stroke="#A6A6A4" strokeWidth="1.4" opacity="0.95"
                      style={{ filter: "drop-shadow(0 6px 10px rgba(34,35,40,0.4))" }} />
                    {[14, 20, 26].map((deg) => {
                      const [x, y] = polar(300, 300, 211, deg);
                      return <circle key={deg} cx={x} cy={y} r="3" fill="var(--machine-plate)" stroke="var(--machine-inv)" strokeWidth="1" />;
                    })}
                    <path d={`M${polar(300, 300, 218, 206)[0]} ${polar(300, 300, 218, 206)[1]} A218 218 0 0 1 ${polar(300, 300, 218, 234)[0]} ${polar(300, 300, 218, 234)[1]} L${polar(300, 300, 202, 234)[0]} ${polar(300, 300, 202, 234)[1]} A202 202 0 0 0 ${polar(300, 300, 202, 206)[0]} ${polar(300, 300, 202, 206)[1]} Z`}
                      fill="var(--machine-inv)" stroke="#A6A6A4" strokeWidth="1.2" opacity="0.92" />
                    <circle cx={polar(300, 300, 210, 214)[0]} cy={polar(300, 300, 210, 214)[1]} r="2.6" fill="#59595B" />
                    <circle cx={polar(300, 300, 210, 226)[0]} cy={polar(300, 300, 210, 226)[1]} r="2.6" fill="#59595B" />
                  </g>

                  {/* CENTER-MOUNTED GEAR POINTER — fixed axle, interlocking gears,
                      articulated arm with locking joint and mechanical head.
                      Geometry is driven live by the rAF loop (mech refs). */}
                  <g className={rebuilding ? "rb-e" : undefined}>
                    {/* articulated arm (rotates about the fixed axle) */}
                    <g ref={mArm}>
                      <line ref={mSeg1} x1="300" y1="300" x2="300" y2="280" stroke="var(--machine-line)" strokeWidth="7" strokeLinecap="round" />
                      <line ref={mSeg2} x1="300" y1="280" x2="300" y2="256" stroke="var(--machine-line)" strokeWidth="5.5" strokeLinecap="round" />
                      {/* locking collar on the lower link */}
                      <g ref={mCollar} transform="translate(300 291)">
                        <rect x="-6.5" y="-3.4" width="13" height="6.8" rx="2.4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                        <circle r="1.6" fill="var(--crimson)" />
                      </g>
                      {/* elbow joint */}
                      <g ref={mElbow} transform="translate(300 280)">
                        <circle r="5.6" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
                        <circle r="2.2" fill="var(--machine-inv)" />
                      </g>
                      {/* mechanical pointer head */}
                      <g ref={mHead} transform="translate(300 256)">
                        <path d="M0 -17 L7.5 0 Q0 -4.5 -7.5 0 Z" fill="var(--crimson)" />
                        <path d="M0 -12 L3.6 -3 Q0 -5.4 -3.6 -3 Z" fill="var(--machine-inv)" opacity="0.32" />
                        <rect x="-5.5" y="-1.5" width="11" height="3" rx="1.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.9" />
                      </g>
                    </g>
                    {/* interlocking gear cluster around the fixed axle */}
                    <g ref={mSatB} transform="translate(272 316)">
                      <g ref={mGearB}>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const a = (i / 7) * Math.PI * 2;
                          return <rect key={i} x={-2.6} y={-16} width="5.2" height="6.4" rx="1"
                            transform={`rotate(${(a * 180) / Math.PI})`}
                            fill="var(--machine-line)" stroke="var(--machine-inv)" strokeWidth="0.8" />;
                        })}
                        <circle r="12" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
                        <circle r="4" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
                      </g>
                    </g>
                    <g ref={mSatC} transform="translate(328 316)">
                      <g ref={mGearC}>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const a = (i / 7) * Math.PI * 2;
                          return <rect key={i} x={-2.6} y={-16} width="5.2" height="6.4" rx="1"
                            transform={`rotate(${(a * 180) / Math.PI})`}
                            fill="var(--machine-line)" stroke="var(--machine-inv)" strokeWidth="0.8" />;
                        })}
                        <circle r="12" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
                        <circle r="4" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
                      </g>
                    </g>
                    {/* primary gear on the axle (under the arm) */}
                    <g transform="translate(300 300)">
                      <g ref={mGearA}>
                        {Array.from({ length: 8 }).map((_, i) => {
                          const a = (i / 8) * Math.PI * 2;
                          return <rect key={i} x={-3.4} y={-25} width="6.8" height="8" rx="1.2"
                            transform={`rotate(${(a * 180) / Math.PI})`}
                            fill="var(--machine-line)" stroke="var(--machine-inv)" strokeWidth="0.9" />;
                        })}
                        <circle r="20" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
                        <circle r="13" fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.65" />
                      </g>
                    </g>
                    {/* fixed central axle + hub collar */}
                    <circle cx="300" cy="300" r="8.5" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.6" />
                    <circle cx="300" cy="300" r="3.2" fill="var(--crimson)" />
                  </g>
                </svg>
              </div>

              {/* 9 discipline modules — bolted to the ring; each name owns a reserved,
                  collision-safe text zone (top node → above, right arc → right, bottom arc →
                  below, left arc → left). Hover previews; only a click locks. */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isLockedOn = locked && i === lockedIdx;
                const isHover = i === hoverIdx;
                const deg = (i / disciplines.length) * 360;
                const [x, y] = polar(50, 50, 44.5, deg);
                const fill = isActive ? "var(--crimson)" : isHover ? "var(--machine-crimson)" : "var(--machine-plate)";
                /* explicit reserved text zones: 01 above · 02 right · 03 below (clear of the card) · 09 left */
                const zone = i === 0 ? "above" : i === 1 ? "right" : i === 2 ? "below" : i === disciplines.length - 1 ? "left"
                  : deg < 30 || deg > 330 ? "above" : deg <= 120 ? "right" : deg <= 240 ? "below" : "left";
                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onClick={() => pick(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name} aria-pressed={isLockedOn}>
                    <span className="relative grid place-items-center transition-all duration-400 mat-texture dossier-clip-sm"
                      style={{
                        width: 74, height: 74,
                        backgroundColor: fill,
                        color: isActive || isHover ? "#DDDDD8" : "var(--machine-inv)",
                        boxShadow: isActive
                          ? "inset 0 0 0 2px rgba(221,221,216,0.55)"
                          : isHover
                            ? "inset 0 0 0 1.5px rgba(221,221,216,0.3)"
                            : "inset 0 0 0 1.5px color-mix(in srgb, var(--machine-inv) 22%, transparent)",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${
                        isActive || isHover ? "bg-[#DDDDD8] text-[var(--crimson)]" : ""}`}
                        style={isActive || isHover ? undefined : { backgroundColor: "var(--machine-inv)", color: "var(--machine-plate)" }}>
                        {dis.num}
                      </span>
                      {isLockedOn && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-sm bg-[var(--crimson)]" />}
                    </span>
                    {/* reserved name zone — never crosses the machine */}
                    <span className={`pointer-events-none absolute f-tech font-bold text-[12px] tracking-[0.1em] leading-tight w-[112px] transition-colors duration-300 ${
                      zone === "above" ? "bottom-full left-1/2 -translate-x-1/2 mb-2 text-center"
                      : zone === "below" ? "top-full left-1/2 -translate-x-1/2 mt-2 text-center"
                      : zone === "right" ? "left-full top-1/2 -translate-y-1/2 ml-3 text-left"
                      : "right-full top-1/2 -translate-y-1/2 mr-3 text-right"} ${
                      isActive ? "text-[var(--crimson)]" : "text-[var(--ink2)] group-hover:text-[var(--crimson)]"}`}>
                      {dis.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* ================= DETAIL CARD ================= */}
          <Reveal delay={0.1}>
            <div className="mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 18%, transparent)" }}>
              <span className="absolute top-0 left-0 h-[3px] bg-[var(--crimson)] scan-pass" style={{ width: "42%" }} aria-hidden />
              {d ? (
                <div key={d.id} className="dossier-swap">
                  <div className="flex items-center justify-between">
                    <span className="f-mono text-[11px] tracking-[0.3em] text-[var(--crimson)]">{d.num} / 09</span>
                    <span className="f-mono text-[9px] tracking-[0.26em] flex items-center gap-2" style={{ color: "var(--m-sub)" }}>
                      <span className="w-1.5 h-1.5 bg-[var(--crimson)] live-blink" />
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
                    <span className="text-[var(--crimson)]">CORE/{d.num}</span>
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
                  <div className="mt-7 flex items-center gap-4" aria-hidden>
                    {[14, 22, 16].map((s, k) => (
                      <svg key={k} width={s + 10} height={s + 10} viewBox="0 0 24 24" fill="none"
                        stroke="var(--m-sub)" strokeWidth="1.5"
                        className={reduced ? undefined : "ptr-gear-spin"} style={{ animationDuration: `${9 + k * 5}s` }}>
                        <circle cx="12" cy="12" r="5" />
                        {Array.from({ length: 8 }).map((_, i) => {
                          const a = (i / 8) * Math.PI * 2;
                          return <line key={i} x1={12 + 7 * Math.cos(a)} y1={12 + 7 * Math.sin(a)} x2={12 + 9.5 * Math.cos(a)} y2={12 + 9.5 * Math.sin(a)} />;
                        })}
                      </svg>
                    ))}
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
