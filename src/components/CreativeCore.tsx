import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

/* gear wheel — toothed ring + bolts, drawn once and spun as a whole via class */
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
  const { data } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();
  const [lockedIdx, setLockedIdx] = useState(3);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const sel = hoverIdx ?? lockedIdx;
  const d = disciplines[sel] ?? disciplines[0];

  /* ---- mechanical surge — every 30s, 3s: arms ignite, channels flush ---- */
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

  /* ---- selector head: tracks mouse direction around the machine, settles at top ---- */
  const discRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const angleRef = useRef({ cur: 0, target: 0, raf: 0 });
  useEffect(() => {
    if (reduced) return;
    const loop = () => {
      const a = angleRef.current;
      const diff = ((a.target - a.cur + 180) % 360 + 360) % 360 - 180;
      if (Math.abs(diff) > 0.1) {
        a.cur += diff * 0.14;
        if (headRef.current) headRef.current.setAttribute("transform", `rotate(${a.cur} 300 300)`);
      }
      a.raf = requestAnimationFrame(loop);
    };
    angleRef.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(angleRef.current.raf);
  }, [reduced]);
  const onMove = (e: React.MouseEvent) => {
    const el = discRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    angleRef.current.target = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
  };
  const onLeave = () => { angleRef.current.target = 0; };

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

        <div onMouseMove={onMove} onMouseLeave={onLeave}
          className="mt-12 grid lg:grid-cols-[1.04fr_0.96fr] gap-12 lg:gap-16 items-center">
          {/* ================= MECHANICAL CREATIVE ENGINE ================= */}
          <Reveal>
            <div ref={discRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">
                {/* rear structural layer — ground shadow + outer guide rings */}
                <ellipse cx="300" cy="318" rx="252" ry="30" fill="#222328" opacity="0.22" />
                <circle cx="300" cy="300" r="276" fill="none" stroke="var(--line-soft)" strokeWidth="1.4" />
                <circle cx="300" cy="300" r="266" fill="none" stroke="var(--line-soft)" strokeWidth="1" strokeDasharray="3 9"
                  className={reduced ? undefined : "gear-ccw-slow"} style={{ transformOrigin: "300px 300px" }} />

                {/* ---------- MID machine layer (scaled in, leaves a clean outer orbit) ---------- */}
                <g transform="translate(300 300) scale(0.9) translate(-300 -300)">
                {/* baseplate + rivets + engraved grooves */}
                <circle cx="300" cy="300" r="252" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="2" style={{ filter: "drop-shadow(0 10px 18px rgba(34,35,40,0.35))" }} />
                {Array.from({ length: 16 }).map((_, i) => {
                  const [x, y] = polar(300, 300, 243, (i / 16) * 360);
                  return <circle key={i} cx={x} cy={y} r="3.4" fill="var(--machine-line)" stroke="var(--machine-plate)" strokeWidth="1.2" />;
                })}
                <circle cx="300" cy="300" r="234" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
                <circle cx="300" cy="300" r="222" fill="none" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.5" />

                {/* mounting arms — every discipline module bolts onto the machine */}
                {disciplines.map((dis, i) => {
                  const on = i === sel;
                  const litOn = surgeOn && lit > i;
                  const deg = (i / disciplines.length) * 360;
                  const [x1, y1] = polar(300, 300, 118, deg);
                  const [x2, y2] = polar(300, 300, 246, deg);
                  const [bx, by] = polar(300, 300, 238, deg);
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

                {/* outer tooth ring — slow counter rotation */}
                <g className={reduced ? undefined : "gear-ccw-slow"}>
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

                {/* middle drive ring — clockwise, own speed */}
                <g className={reduced ? undefined : "gear-cw"}>
                  <circle cx="300" cy="300" r="168" fill="none" stroke="var(--machine-line)" strokeWidth="1.4" opacity="0.85" />
                  {Array.from({ length: 6 }).map((_, i) => {
                    const [x1, y1] = polar(300, 300, 96, i * 60);
                    const [x2, y2] = polar(300, 300, 164, i * 60);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--machine-line)" strokeWidth="7" strokeLinecap="round" />;
                  })}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x, y] = polar(300, 300, 146, i * 30);
                    return <circle key={i} cx={x} cy={y} r="3" fill="var(--machine-line)" />;
                  })}
                </g>

                {/* satellite gears — meshed at different speeds */}
                <Gear cx={452} cy={168} r={50} teeth={16} spin={reduced ? "" : "gear-ccw"} />
                <Gear cx={148} cy={428} r={40} teeth={13} spin={reduced ? "" : "gear-cw-fast"} plate="var(--machine-deep)" bolts={4} />

                {/* pistons — small mechanical pumping movement */}
                {[-152, 188].map((deg, k) => {
                  const [px, py] = polar(300, 300, 190, deg);
                  return (
                    <g key={k} transform={`translate(${px} ${py}) rotate(${deg + 90})`}>
                      <rect x="-9" y="-26" width="18" height="30" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
                      <rect x="-3.5" y="2" width="7" height="18" fill="var(--machine-line)" className={reduced ? undefined : "piston"} style={{ animationDelay: `${k * 0.7}s` }} />
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
                <Gear cx={300} cy={300} r={92} teeth={22} spin={reduced ? "" : "gear-cw-fast"} bolts={8} />
                <circle cx="300" cy="300" r="58" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
                <circle cx="300" cy="300" r="44" fill="var(--machine-plate)" stroke={surgeOn ? hot : "var(--machine-crimson)"} strokeWidth="2.4"
                  style={{ transition: "stroke .4s ease" }} />
                <g className={reduced ? undefined : "fly-pulse"}>
                  <circle cx="300" cy="300" r="26" fill="var(--machine-crimson)" />
                  <circle cx="300" cy="300" r="15" fill={surgeOn ? hot : "var(--machine-shadow)"} style={{ transition: "fill .4s ease" }} />
                  <circle cx="300" cy="300" r="6" fill="#DDDDD8" opacity="0.9" />
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
                    <circle cx="300" cy="152" r="4.2" fill="#A6A6A4" stroke="#DDDDD8" strokeWidth="1.2" />
                    <circle cx="300" cy="448" r="3" fill="#59595B" stroke="#A6A6A4" strokeWidth="1" />
                  </g>
                )}
                </g>

                {/* ---------- FOREGROUND mechanical hardware — rests in front of the machine ---------- */}
                <g className={reduced ? undefined : "wedge-rock"} style={{ animationDuration: "12s" }}>
                  {/* lower-right graphite service band */}
                  <path d={`M${polar(300, 300, 262, 30)[0]} ${polar(300, 300, 262, 30)[1]} A262 262 0 0 1 ${polar(300, 300, 262, 104)[0]} ${polar(300, 300, 262, 104)[1]} L${polar(300, 300, 236, 104)[0]} ${polar(300, 300, 236, 104)[1]} A236 236 0 0 0 ${polar(300, 300, 236, 30)[0]} ${polar(300, 300, 236, 30)[1]} Z`}
                    fill="#59595B" stroke="#A6A6A4" strokeWidth="1.4" opacity="0.95"
                    style={{ filter: "drop-shadow(0 6px 10px rgba(34,35,40,0.4))" }} />
                  {[42, 60, 78, 93].map((deg) => {
                    const [x, y] = polar(300, 300, 249, deg);
                    return <circle key={deg} cx={x} cy={y} r="3" fill="#222328" stroke="#DDDDD8" strokeWidth="1" />;
                  })}
                  <path d={`M${polar(300, 300, 249, 34)[0]} ${polar(300, 300, 249, 34)[1]} A249 249 0 0 1 ${polar(300, 300, 249, 100)[0]} ${polar(300, 300, 249, 100)[1]}`}
                    fill="none" stroke="#A6A6A4" strokeWidth="1.6" strokeDasharray="2 8" opacity="0.8" />
                  {/* upper-left pale actuator band */}
                  <path d={`M${polar(300, 300, 258, 206)[0]} ${polar(300, 300, 258, 206)[1]} A258 258 0 0 1 ${polar(300, 300, 258, 244)[0]} ${polar(300, 300, 258, 244)[1]} L${polar(300, 300, 240, 244)[0]} ${polar(300, 300, 240, 244)[1]} A240 240 0 0 0 ${polar(300, 300, 240, 206)[0]} ${polar(300, 300, 240, 206)[1]} Z`}
                    fill="#DDDDD8" stroke="#A6A6A4" strokeWidth="1.2" opacity="0.92" />
                  <circle cx={polar(300, 300, 249, 216)[0]} cy={polar(300, 300, 249, 216)[1]} r="2.6" fill="#59595B" />
                  <circle cx={polar(300, 300, 249, 234)[0]} cy={polar(300, 300, 249, 234)[1]} r="2.6" fill="#59595B" />
                </g>

                {/* selector head — small crimson arrowhead, no tail */}
                <g ref={headRef} transform="rotate(0 300 300)">
                  <path d="M300 176 Q305 204 326 221 Q300 212 274 221 Q295 204 300 176 Z" fill="var(--crimson)"
                    style={{ filter: "drop-shadow(0 0 7px rgba(231,34,65,0.5))" }} />
                </g>
              </svg>

              {/* 9 discipline modules — physically bolted to the ring */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                /* clean outer orbit — node + name stay clear of the machine rim */
                const [x, y] = polar(50, 50, 44.5, (i / disciplines.length) * 360);
                const fill = isActive ? "var(--crimson)" : isHover ? "var(--machine-crimson)" : "var(--outer-bg)";
                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onClick={() => setLockedIdx(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}>
                    <span className="relative grid place-items-center transition-all duration-400 mat-texture dossier-clip-sm"
                      style={{
                        width: 74, height: 74,
                        backgroundColor: fill,
                        color: "#f4f2ed",
                        boxShadow: isActive
                          ? "inset 0 0 0 1.5px rgba(244,242,237,0.4), 0 12px 26px -14px rgba(231,34,65,0.55)"
                          : isHover
                            ? "inset 0 0 0 1.5px rgba(244,242,237,0.3)"
                            : "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 22%, transparent)",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${isActive || isHover ? "bg-[#DDDDD8] text-[var(--crimson)]" : "bg-[var(--outer-ink)] text-[var(--outer-bg)]"}`}>
                        {dis.num}
                      </span>
                    </span>
                    <span className={`f-tech font-bold text-[12px] tracking-[0.1em] text-center leading-tight max-w-[104px] transition-colors duration-300 ${isActive ? "text-[var(--crimson)]" : "text-[var(--ink2)] group-hover:text-[var(--crimson)]"}`}>
                      {dis.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* ================= DETAIL CARD — matte, machine-fed ================= */}
          <Reveal delay={0.1}>
            <div className="mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 18%, transparent)" }}>
              <span className="absolute top-0 left-0 h-[3px] bg-[var(--crimson)] scan-pass" style={{ width: "42%" }} aria-hidden />
              <div key={d.id} className="dossier-swap">
                <div className="flex items-center justify-between">
                  <span className="f-mono text-[11px] tracking-[0.3em] text-[var(--crimson)]">{d.num} / 09</span>
                  <span className="f-mono text-[9px] tracking-[0.26em] flex items-center gap-2" style={{ color: "var(--m-sub)" }}>
                    <span className={`w-1.5 h-1.5 ${surgeOn ? "bg-[var(--crimson)]" : "bg-[var(--crimson)]"} live-blink`} />
                    {hoverIdx !== null ? "ENGAGED" : "LOCKED"}
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
                  <span>HOVER — ENGAGE · CLICK — LOCK</span>
                  <span className="text-[var(--crimson)]">CORE/{d.num}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
