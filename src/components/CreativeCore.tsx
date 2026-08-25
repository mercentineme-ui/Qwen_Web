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

  /* ---- MECHANICAL GEAR POINTER ----------------------------------------
     Mouse position controls the pointer. Node clicks control locking.
     These are completely separate systems.
     · inside the Core circle  → gear assembles, pointer tracks the ACTUAL
       cursor position continuously (smooth lerp — never jumps or snaps)
     · leaving the circle      → position is retained briefly, then the
       pointer travels back to the exact reactor center and folds into
       its resting gear form
     · re-entering             → gear reassembles and picks up the current
       cursor position from wherever it is sitting                      */
  const discRef = useRef<HTMLDivElement>(null);
  const ptrRef = useRef<SVGGElement>(null);
  const ptr = useRef({ x: 300, y: 300, tx: 300, ty: 300, inside: false, returning: false, settled: true, raf: 0, holdTimer: 0 });
  const [assembled, setAssembled] = useState(false);
  useEffect(() => {
    if (reduced) return;
    const loop = () => {
      const p = ptr.current;
      if (p.inside) {
        p.x += (p.tx - p.x) * 0.2;
        p.y += (p.ty - p.y) * 0.2;
        if (p.settled) { p.settled = false; setAssembled(true); }
      } else if (p.returning) {
        p.x += (300 - p.x) * 0.08;
        p.y += (300 - p.y) * 0.08;
        if (Math.hypot(300 - p.x, 300 - p.y) < 3.5) {
          p.x = 300; p.y = 300;
          p.returning = false;
          if (!p.settled) { p.settled = true; setAssembled(false); }
        }
      }
      if (ptrRef.current) ptrRef.current.setAttribute("transform", `translate(${p.x} ${p.y})`);
      p.raf = requestAnimationFrame(loop);
    };
    ptr.current.raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(ptr.current.raf); clearTimeout(ptr.current.holdTimer); };
  }, [reduced]);
  const onDiscMove = (e: React.MouseEvent) => {
    const el = discRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const p = ptr.current;
    /* re-entering: reassemble and track the CURRENT cursor position — no jump to an old spot */
    clearTimeout(p.holdTimer);
    p.inside = true;
    p.returning = false;
    p.tx = ((e.clientX - r.left) / r.width) * 600;
    p.ty = ((e.clientY - r.top) / r.height) * 600;
  };
  const onDiscLeave = () => {
    const p = ptr.current;
    p.inside = false;
    /* retain the current position briefly, then travel home and fold */
    p.holdTimer = window.setTimeout(() => { if (!ptr.current.inside) ptr.current.returning = true; }, 240);
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

        {/* reactor left · reserved clear gap · dossier pushed to the far right */}
        <div className="mt-12 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,390px)] gap-12 lg:gap-20 xl:gap-28 items-center">
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

                  {/* MECHANICAL GEAR POINTER — position driven by the rAF loop (ptrRef).
                      Assembled pointer form while tracking the cursor inside the Core;
                      folds into its resting gear when settled at the reactor center. */}
                  <g ref={ptrRef} transform="translate(300 300)" className={rebuilding ? "rb-e" : undefined}>
                    <g className={assembled && !reduced ? "ptr-gear-spin" : undefined}
                      style={{ opacity: assembled ? 0.92 : 1, transition: "opacity .4s ease" }}>
                      {Array.from({ length: 8 }).map((_, i) => {
                        const a = (i / 8) * Math.PI * 2;
                        return <rect key={i} x={-2.4} y={-16} width="4.8" height="6" rx="1"
                          transform={`rotate(${(a * 180) / Math.PI})`}
                          fill="#59595B" stroke="#A6A6A4" strokeWidth="0.9" />;
                      })}
                      <circle r="12.5" fill="var(--machine-deep)" stroke="#A6A6A4" strokeWidth="1.4" />
                      <circle r="6.5" fill="#222328" stroke="#A6A6A4" strokeWidth="1" />
                    </g>
                    <g style={{
                      transform: assembled ? "scale(1)" : "scale(0.25)",
                      opacity: assembled ? 1 : 0,
                      transformOrigin: "0px 0px",
                      transition: reduced ? "none" : "transform .45s cubic-bezier(.3,.9,.3,1.15), opacity .35s ease",
                    }}>
                      <line x1="0" y1="-13" x2="0" y2="-24" stroke="var(--crimson)" strokeWidth="3.4" strokeLinecap="round" />
                      <path d="M0 -40 L8.5 -21 Q0 -26 -8.5 -21 Z" fill="var(--crimson)" />
                      <path d="M0 -34 L4 -24.5 Q0 -27 -4 -24.5 Z" fill="#DDDDD8" opacity="0.3" />
                      <rect x="-6" y="-12.5" width="12" height="2.4" rx="1.2" fill="var(--crimson)" opacity="0.85" />
                    </g>
                    <circle r="2.6" fill={assembled ? "var(--crimson)" : "#A6A6A4"} style={{ transition: "fill .35s ease" }} />
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
                const zone = deg < 30 || deg > 330 ? "above" : deg <= 120 ? "right" : deg <= 240 ? "below" : "left";
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
