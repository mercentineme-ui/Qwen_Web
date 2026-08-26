import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();
  const [lockedIdx, setLockedIdx] = useState<number | null>(3);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const locked = lockedIdx !== null;
  const sel = hoverIdx ?? lockedIdx;
  const d = sel !== null ? disciplines[sel] : null;

  /* ---- 30s surge — 3s holographic activation ---- */
  const [surgeOn, setSurgeOn] = useState(false);
  const [lit, setLit] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    if (reduced) return;
    const iv = window.setInterval(() => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setSurgeOn(true);
      for (let i = 0; i < disciplines.length; i++) {
        timers.current.push(window.setTimeout(() => setLit(i + 1), 90 * i));
      }
      timers.current.push(window.setTimeout(() => { setSurgeOn(false); setLit(0); }, 3000));
    }, 30000);
    return () => { clearInterval(iv); timers.current.forEach(clearTimeout); };
  }, [disciplines.length, reduced]);

  /* ---- 3D theme rebuild — machine disassembles, inverts, reassembles ---- */
  const [rebuilding, setRebuilding] = useState(false);
  const prevTheme = useRef(theme);
  useEffect(() => {
    if (prevTheme.current !== theme) {
      prevTheme.current = theme;
      if (!reduced) {
        setRebuilding(true);
        const t = window.setTimeout(() => setRebuilding(false), 1560);
        return () => clearTimeout(t);
      }
    }
  }, [theme, reduced]);

  /* ---- mechanical gear pointer — fixed axle, tracks cursor only inside
        node areas, retracts + gears interlock when idle ---- */
  const discRef = useRef<HTMLDivElement>(null);
  const armG = useRef<SVGGElement>(null);
  const gearG = useRef<SVGGElement>(null);
  const segA = useRef<SVGLineElement>(null);
  const segB = useRef<SVGLineElement>(null);
  const headG = useRef<SVGGElement>(null);
  const st = useRef({ ang: 0, ext: 0, tAng: 0, tExt: 0, raf: 0 });

  useEffect(() => {
    if (reduced) return;
    const loop = () => {
      const s = st.current;
      const dA = ((s.tAng - s.ang + 180) % 360 + 360) % 360 - 180;
      s.ang += dA * 0.13;
      s.ext += (s.tExt - s.ext) * 0.12;
      const ext = s.ext;
      if (armG.current) armG.current.setAttribute("transform", `rotate(${s.ang.toFixed(2)} 300 300)`);
      if (gearG.current) {
        const sc = 1 + ext * 0.16;
        gearG.current.setAttribute("transform", `translate(300 300) scale(${sc.toFixed(3)}) translate(-300 -300)`);
      }
      const rElbow = 46 + 52 * ext;
      const rHead = 66 + 118 * ext;
      if (segA.current) { segA.current.setAttribute("y2", String(300 - rElbow)); }
      if (segB.current) { segB.current.setAttribute("y1", String(300 - rElbow)); segB.current.setAttribute("y2", String(300 - rHead)); }
      if (headG.current) headG.current.setAttribute("transform", `translate(300 ${(300 - rHead).toFixed(2)})`);
      s.raf = requestAnimationFrame(loop);
    };
    st.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.current.raf);
  }, [reduced]);

  const onNodeMove = (e: React.MouseEvent) => {
    const el = discRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    st.current.tAng = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    st.current.tExt = 1;
  };
  const onNodeLeave = () => {
    st.current.tExt = 0;
    st.current.tAng = lockedIdx !== null ? lockedIdx * (360 / disciplines.length) : 0;
  };
  const pick = (i: number) => {
    if (locked && lockedIdx === i) {
      setLockedIdx(null);
      st.current.tAng = 0;
    } else {
      setLockedIdx(i);
      st.current.tAng = i * (360 / disciplines.length);
    }
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
            <div ref={discRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <div className={`mech-stage ${rebuilding ? "mech-rebuild" : ""}`}>
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`}>
                  {/* rear structural ring */}
                  <g className="rb-a">
                    <circle cx="300" cy="300" r="252" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="2" />
                    {Array.from({ length: 16 }).map((_, i) => {
                      const [x, y] = polar(300, 300, 243, (i / 16) * 360);
                      return <circle key={i} cx={x} cy={y} r="3.4" fill="var(--machine-line)" stroke="var(--machine-plate)" strokeWidth="1.2" />;
                    })}
                    <circle cx="300" cy="300" r="234" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
                    <circle cx="300" cy="300" r="222" fill="none" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.5" />
                  </g>

                  {/* outer tooth ring — slow counter rotation */}
                  <g className={`rb-b ${reduced ? "" : "gear-ccw-slow"}`}>
                    {Array.from({ length: 48 }).map((_, i) => {
                      const a = (i / 48) * Math.PI * 2;
                      const x = 300 + 206 * Math.cos(a), y = 300 + 206 * Math.sin(a);
                      return (
                        <rect key={i} x="-7" y="-9" width="14" height="18" rx="2"
                          transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
                          fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
                      );
                    })}
                    <circle cx="300" cy="300" r="196" fill="none"
                      stroke={surgeOn ? "#58C8EE" : "var(--machine-line)"} strokeWidth="2.4" style={{ transition: "stroke .5s ease" }} />
                  </g>

                  {/* 8 interior wedges — rocking trapezoids + blue charging lines */}
                  <g className="rb-c">
                    {Array.from({ length: 8 }).map((_, i) => {
                      const a0 = ((i * 45 - 90 + 4) * Math.PI) / 180;
                      const a1 = ((i * 45 - 90 + 41) * Math.PI) / 180;
                      const p = (r: number, a: number) => `${300 + r * Math.cos(a)},${300 + r * Math.sin(a)}`;
                      const litOn = surgeOn && lit > i;
                      return (
                        <g key={i} className={reduced ? undefined : "wedge-rock"} style={{ animationDelay: `${i * 0.45}s` }}>
                          <path d={`M${p(100, a0)} L${p(186, a0)} L${p(186, a1)} L${p(100, a1)} Z`}
                            fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.3" />
                          <path d={`M${p(112, a0)} L${p(178, a0)}`} fill="none"
                            stroke={litOn ? "#58C8EE" : "var(--machine-line)"} strokeWidth={litOn ? 2 : 1}
                            opacity={litOn ? 0.95 : 0.5} className={litOn && !reduced ? "channel-flow" : undefined}
                            style={{ transition: "stroke .4s ease, opacity .4s ease" }} />
                        </g>
                      );
                    })}
                  </g>

                  {/* mid drive ring — clockwise, own speed */}
                  <g className={`rb-d ${reduced ? "" : "gear-cw"}`} style={{ animationDuration: "70s" }}>
                    <circle cx="300" cy="300" r="96" fill="none" stroke="var(--machine-line)" strokeWidth="1.4" opacity="0.85" />
                    {Array.from({ length: 6 }).map((_, i) => {
                      const [x1, y1] = polar(300, 300, 40, i * 60);
                      const [x2, y2] = polar(300, 300, 92, i * 60);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--machine-line)" strokeWidth="7" strokeLinecap="round" />;
                    })}
                  </g>

                  {/* inner ring + core */}
                  <g className="rb-e">
                    <circle cx="300" cy="300" r="88" fill="var(--machine-deep)" stroke={surgeOn ? "#58C8EE" : "var(--machine-line)"} strokeWidth="1.6" style={{ transition: "stroke .4s ease" }} />
                    <circle cx="300" cy="300" r="34" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
                    <circle cx="300" cy="300" r="20" fill="var(--machine-deep)" stroke={surgeOn ? "#58C8EE" : "var(--machine-crimson)"} strokeWidth="2.4" style={{ transition: "stroke .4s ease" }} />
                    <g className={reduced ? undefined : "core-beat"}>
                      <circle cx="300" cy="300" r="11" fill="var(--crim-panel)" />
                      <circle cx="300" cy="300" r="4" fill="var(--machine-inv)" opacity="0.9" />
                    </g>
                  </g>

                  {/* surge sweep arcs */}
                  {surgeOn && !reduced && (
                    <>
                      <circle cx="300" cy="300" r="70" fill="none" stroke="#58C8EE" strokeWidth="1.6" strokeDasharray="10 8" className="gear-cw-fast" opacity="0.9" />
                      <circle cx="300" cy="300" r="180" fill="none" stroke="#58C8EE" strokeWidth="1" strokeDasharray="4 14" className="gear-ccw" opacity="0.65" />
                    </>
                  )}

                  {/* ============ CENTER-MOUNTED MECHANICAL POINTER ============ */}
                  <g>
                    {/* linkage — collar → elbow → head (lengths driven by rAF) */}
                    <g ref={armG}>
                      <line ref={segA} x1="300" y1="291" x2="300" y2="254" stroke="var(--machine-line)" strokeWidth="4" strokeLinecap="round" opacity="0.85" />
                      <line ref={segB} x1="300" y1="254" x2="300" y2="116" stroke="var(--machine-line)" strokeWidth="2.6" strokeLinecap="round" opacity="0.7" />
                      {/* mechanical pointer head */}
                      <g ref={headG} transform="translate(300 116)">
                        <path d="M0 -17 L7.5 0 Q0 -4.5 -7.5 0 Z" fill="var(--crim-panel)" />
                        <path d="M0 -12 L3.6 -3 Q0 -5.4 -3.6 -3 Z" fill="var(--machine-inv)" opacity="0.32" />
                        <rect x="-5.5" y="-1.5" width="11" height="3" rx="1.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.9" />
                      </g>
                    </g>
                    {/* interlocking gear cluster around the fixed axle */}
                    <g ref={gearG}>
                      <g transform="translate(328 284)">
                        <g className={reduced ? undefined : "ptr-gear-spin"} style={{ animationDuration: "7s" }}>
                          {Array.from({ length: 8 }).map((_, i) => {
                            const a = (i / 8) * Math.PI * 2;
                            return <rect key={i} x="-2.6" y="-3.2" width="5.2" height="6.4" rx="1"
                              transform={`translate(${10.5 * Math.cos(a)} ${10.5 * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
                              fill="var(--machine-line)" />;
                          })}
                          <circle r="8" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                        </g>
                      </g>
                      <g transform="translate(272 316)">
                        <g className={reduced ? undefined : "ptr-gear-spin-rev"} style={{ animationDuration: "10s" }}>
                          {Array.from({ length: 7 }).map((_, i) => {
                            const a = (i / 7) * Math.PI * 2 + 0.45;
                            return <rect key={i} x="-2.4" y="-3" width="4.8" height="6" rx="1"
                              transform={`translate(${9.5 * Math.cos(a)} ${9.5 * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
                              fill="var(--machine-line)" />;
                          })}
                          <circle r="7" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                        </g>
                      </g>
                      {/* fixed central axle + hub collar */}
                      <circle cx="300" cy="300" r="8.5" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.6" />
                      <g transform="translate(300 291)">
                        <rect x="-6.5" y="-3.4" width="13" height="6.8" rx="2.4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                        <circle r="1.6" fill="var(--crim-panel)" />
                      </g>
                      <circle cx="300" cy="300" r="3.2" fill="var(--crim-panel)" />
                    </g>
                  </g>
                </svg>
              </div>

              {/* 9 discipline modules — bolted to the ring with reserved text zones */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                const isLockedOn = i === lockedIdx;
                const deg = (i / disciplines.length) * 360;
                const [x, y] = polar(50, 50, 44.5, deg);
                const fill = isActive ? "var(--crim-panel)" : isHover ? "var(--machine-crimson)" : "var(--machine-plate)";
                const zone = i === 0 ? "above" : i === 1 ? "right" : i === 2 ? "below" : i === disciplines.length - 1 ? "left"
                  : deg < 30 || deg > 330 ? "above" : deg <= 120 ? "right" : deg <= 240 ? "below" : "left";
                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onMouseMove={onNodeMove}
                    onClick={() => pick(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name} aria-pressed={isLockedOn}>
                    <span className="relative grid place-items-center transition-all duration-400 mat-texture dossier-clip-sm"
                      style={{
                        width: 74, height: 74,
                        backgroundColor: fill,
                        color: "#DDDDD8",
                        boxShadow: isActive
                          ? "inset 0 0 0 1.5px rgba(221,221,216,0.4), 0 12px 26px -14px rgba(34,35,40,0.6)"
                          : isHover
                            ? "inset 0 0 0 1.5px rgba(221,221,216,0.3)"
                            : "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 22%, transparent)",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${
                        isActive || isHover ? "bg-[#DDDDD8] text-[var(--crim-panel)]" : ""}`}
                        style={isActive || isHover ? undefined : { backgroundColor: "var(--machine-inv)", color: "var(--machine-plate)" }}>
                        {dis.num}
                      </span>
                      {isLockedOn && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-sm bg-[var(--crim-panel)]" />}
                    </span>
                    <span className={`pointer-events-none absolute f-tech font-bold text-[12px] tracking-[0.1em] leading-tight w-[112px] transition-colors duration-300 ${
                      zone === "above" ? "bottom-full left-1/2 -translate-x-1/2 mb-2 text-center"
                      : zone === "below" ? "top-full left-1/2 -translate-x-1/2 mt-2 text-center"
                      : zone === "right" ? "left-full top-1/2 -translate-y-1/2 ml-3 text-left"
                      : "right-full top-1/2 -translate-y-1/2 mr-3 text-right"} ${
                      isActive ? "text-[var(--crim-panel)]" : "text-[var(--ink2)] group-hover:text-[var(--crim-panel)]"}`}>
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
