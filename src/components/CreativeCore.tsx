import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead, Tag } from "./ui";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

const wedgePath = (i: number) => {
  const gap = 6;
  const a0 = i * 45 + gap / 2;
  const a1 = (i + 1) * 45 - gap / 2;
  const [ix0, iy0] = polar(300, 300, 96, a0);
  const [ox0, oy0] = polar(300, 300, 152, a0);
  const [ox1, oy1] = polar(300, 300, 152, a1);
  const [ix1, iy1] = polar(300, 300, 96, a1);
  return `M${ix0} ${iy0} L${ox0} ${oy0} A152 152 0 0 1 ${ox1} ${oy1} L${ix1} ${iy1} A96 96 0 0 0 ${ix0} ${iy0} Z`;
};

/* radial hairlines inside a wedge — holographic thin-line energy */
function wedgeLines(i: number) {
  const mid = i * 45 + 22.5;
  return [mid - 7, mid, mid + 7].map((deg, k) => {
    const [x1, y1] = polar(300, 300, 100, deg);
    const [x2, y2] = polar(300, 300, 148, deg);
    return { x1, y1, x2, y2, k };
  });
}

export default function CreativeCore() {
  const { data } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();
  const [lockedIdx, setLockedIdx] = useState(3);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const sel = hoverIdx ?? lockedIdx;
  const d = disciplines[sel] ?? disciplines[0];

  /* ---- arrowhead: tracks mouse direction around reactor center ---- */
  const stageRef = useRef<HTMLDivElement>(null);
  const discRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const angleRef = useRef({ cur: 0, target: 0, raf: 0 });

  useEffect(() => {
    if (reduced) return;
    const loop = () => {
      const a = angleRef.current;
      /* shortest angular path — never spins the long way round */
      let diff = ((a.target - a.cur + 180) % 360 + 360) % 360 - 180;
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
    if (reduced || !discRef.current) return;
    const r = discRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const deg = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
    angleRef.current.target = deg;
  };
  const onLeave = () => {
    angleRef.current.target = 0; /* settle back to the middle — outward at top */
  };

  /* ---- surge engine — every 30s, 3s, holographic thin-line ---- */
  const [lit, setLit] = useState(0);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    if (reduced) return;
    const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    const fire = () => {
      clearAll();
      setPhase(1); setLit(0);
      for (let i = 0; i < 8; i++) timers.current.push(window.setTimeout(() => setLit(i + 1), 110 * i));
      timers.current.push(window.setTimeout(() => setPhase(2), 980));
      timers.current.push(window.setTimeout(() => setPhase(3), 2150));
      timers.current.push(window.setTimeout(() => { setPhase(0); setLit(0); }, 3000));
    };
    const iv = window.setInterval(fire, 30000);
    return () => { clearInterval(iv); clearAll(); };
  }, [reduced]);

  const surgeOn = phase !== 0;
  const surge = "var(--surge)";

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="02 — WHAT I DO"
          title="CREATIVE CORE"
          desc="Nine disciplines, one practice — direction, generation and story held together by structured workflows."
          meta="09 NODES · ONE REACTOR"
        />

        <div ref={stageRef} onMouseMove={onMove} onMouseLeave={onLeave}
          className="mt-12 grid lg:grid-cols-[1.04fr_0.96fr] gap-12 lg:gap-16 items-center">
          {/* ---------- ARC REACTOR — living mechanical system ---------- */}
          <Reveal>
            <div ref={discRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">
                {/* outer structural ring — slow orbital motion */}
                <g className={reduced ? undefined : "react-spin"}>
                  <circle cx="300" cy="300" r="286" fill="none" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 7" />
                  <circle cx="300" cy="300" r="262" fill="none" stroke="var(--line)" strokeWidth="1" />
                  {Array.from({ length: 36 }).map((_, i) => {
                    const [x1, y1] = polar(300, 300, 268, i * 10);
                    const [x2, y2] = polar(300, 300, i % 3 === 0 ? 256 : 262, i * 10);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink2)" strokeOpacity="0.5" strokeWidth={i % 3 === 0 ? 1.6 : 0.8} />;
                  })}
                  {[0, 90, 180, 270].map((a) => {
                    const [x, y] = polar(300, 300, 274, a);
                    return <rect key={a} x={x - 5} y={y - 5} width="10" height="10" fill="var(--sup1)" stroke="var(--line)" strokeWidth="1.2" />;
                  })}
                </g>

                {/* orbital track — controlled directional flow */}
                <g className={reduced ? undefined : "react-orbit"}>
                  <circle cx="300" cy="300" r="178" fill="none" stroke="var(--ink2)" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="1 11" />
                  <rect x="295" y="116" width="10" height="12" fill="var(--ink)" opacity="0.75" />
                  <rect x="295" y="472" width="10" height="12" fill="var(--ink)" opacity="0.35" />
                </g>

                {/* 8 interior wedges — slow mechanical rotation + rocking + thin-line energy */}
                <g className={reduced ? undefined : "react-spin"} style={{ animationDuration: "84s" }}>
                  {disciplines.slice(0, 8).map((_, i) => {
                    const litOn = surgeOn && lit > i;
                    return (
                      <g key={i} className={reduced ? undefined : "wedge-rock"} style={{ animationDelay: `${i * 0.65}s` }}>
                        <path d={wedgePath(i)}
                          fill={litOn ? "color-mix(in srgb, var(--surge) 9%, transparent)" : "var(--sup2)"}
                          stroke={litOn ? surge : "var(--line)"}
                          strokeWidth={litOn ? 1.6 : 1.5}
                          style={{ transition: "fill .25s ease, stroke .25s ease", filter: litOn ? "drop-shadow(0 0 6px rgba(88,200,238,0.5))" : undefined }} />
                        {/* holographic radial hairlines */}
                        <g opacity={litOn ? 1 : undefined} className={litOn ? undefined : reduced ? undefined : "wedge-hot"}
                          style={litOn ? undefined : { animationDelay: `${i * 0.8}s` }}>
                          {wedgeLines(i).map((l) => (
                            <line key={l.k} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                              stroke={surge} strokeWidth={l.k === 1 ? 1.4 : 0.9} strokeLinecap="round" />
                          ))}
                        </g>
                      </g>
                    );
                  })}
                </g>

                {/* concentric rings — counter rotation + radial breathing */}
                <circle cx="300" cy="300" r="88" fill="var(--sup1)" stroke="var(--line)" strokeWidth="1.5" />
                <g className={reduced ? undefined : "react-spin-mid"}>
                  <circle cx="300" cy="300" r="72" fill="none" stroke="var(--ink2)" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="10 6" />
                  {[0, 120, 240].map((a) => {
                    const [x, y] = polar(300, 300, 72, a);
                    return <rect key={a} x={x - 4} y={y - 4} width="8" height="8" fill="var(--ink2)" opacity="0.8" />;
                  })}
                </g>
                <g className={reduced ? undefined : "react-breath"}
                  style={phase === 2 ? { filter: "drop-shadow(0 0 22px rgba(88,200,238,0.8))" } : undefined}>
                  <circle cx="300" cy="300" r="52" fill="var(--sup2)" stroke="var(--line)" strokeWidth="1.5" />
                  <circle cx="300" cy="300" r="34" fill="var(--ink)" stroke={surgeOn ? surge : "none"} strokeWidth={surgeOn ? 1.4 : 0}
                    style={{ transition: "stroke .4s ease" }} />
                  <circle cx="300" cy="300" r="20" fill="var(--page)" stroke="var(--crimson)" strokeWidth="2.5" />
                </g>

                {/* surge — thin-line holographic radial ignition + layered sweep */}
                {surgeOn && (
                  <>
                    <circle cx="300" cy="300" r="60" fill="none" stroke={surge} strokeWidth={phase === 2 ? 1.6 : 1}
                      opacity={phase === 3 ? 0 : 0.95}
                      style={{
                        transformBox: "fill-box", transformOrigin: "center",
                        transform: phase >= 2 ? "scale(3.6)" : "scale(1)",
                        transition: "transform 1.1s cubic-bezier(.25,.8,.3,1), opacity .6s ease",
                      }} />
                    <circle cx="300" cy="300" r="40" fill="none" stroke={surge} strokeWidth="0.8" strokeDasharray="4 5"
                      opacity={phase === 3 ? 0 : 0.8}
                      style={{
                        transformBox: "fill-box", transformOrigin: "center",
                        transform: phase >= 2 ? "scale(5.2)" : "scale(1)",
                        transition: "transform 1.4s cubic-bezier(.25,.8,.3,1), opacity .8s ease",
                      }} />
                  </>
                )}
                {phase === 2 && (
                  <>
                    <circle cx="300" cy="300" r="150" fill="none" stroke={surge} strokeWidth="1.8"
                      strokeDasharray="180 763" className={reduced ? undefined : "surge-arc"} opacity="0.95" />
                    <circle cx="300" cy="300" r="205" fill="none" stroke={surge} strokeWidth="1"
                      strokeDasharray="90 1197" className={reduced ? undefined : "surge-arc"} opacity="0.6" />
                  </>
                )}

                {/* ONE large arrowhead — tracks the mouse around the center, settles outward at top */}
                <g ref={headRef} transform="rotate(0 300 300)">
                  <g className={reduced ? undefined : "head-pulse"}>
                    <line x1="300" y1="244" x2="300" y2="176" stroke="var(--crimson)" strokeWidth="6" />
                    <polygon points="300,148 280,186 320,186" fill="var(--crimson)" />
                    <line x1="288" y1="214" x2="312" y2="214" stroke="var(--crimson)" strokeWidth="2.4" opacity="0.7" />
                  </g>
                </g>
              </svg>

              {/* 9 outer discipline nodes — larger, readable */}
              {disciplines.map((disc, i) => {
                const [x, y] = polar(50, 50, 36.8, i * 40);
                const Ico = disciplineIcons[disc.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                return (
                  <button key={disc.id}
                    onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
                    onFocus={() => setHoverIdx(i)} onBlur={() => setHoverIdx(null)}
                    onClick={() => setLockedIdx(i)}
                    className={`absolute flex flex-col items-center gap-2 group ${reduced ? "" : "node-bob"}`}
                    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)", animationDelay: `${i * 0.55}s` }}
                    aria-label={disc.name}>
                    <span className={`relative w-16 h-16 sm:w-[76px] sm:h-[76px] grid place-items-center rounded-lg border transition-all duration-400 mat-texture ${
                      isActive
                        ? "bg-[var(--crimson)] border-[var(--crimson)] text-[#f4f2ed] shadow-[0_12px_30px_-10px_rgba(227,34,64,0.7)] scale-110"
                        : "mat-outer border-transparent group-hover:scale-105 group-hover:border-[var(--crimson)]"
                    }`}>
                      <span className="absolute -top-2 -left-2 f-mono text-[8px] px-1.5 rounded-[3px] leading-[13px]"
                        style={{ backgroundColor: isActive ? "var(--crimson)" : "var(--ink)", color: isActive ? "#f4f2ed" : "var(--page)" }}>
                        {disc.num}
                      </span>
                      <Ico size={30} strokeWidth={1.7} />
                    </span>
                    <span className={`f-tech font-bold text-[9px] sm:text-[11px] tracking-[0.12em] text-center max-w-[104px] leading-tight transition-colors duration-300 ${
                      isActive ? "text-[var(--crimson)]" : "text-[var(--ink2)] group-hover:text-[var(--ink)]"
                    }`}>
                      {disc.name}
                    </span>
                  </button>
                );
              })}

              {/* surge status */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 f-mono text-[9px] tracking-[0.3em] flex items-center gap-2"
                style={{ color: surgeOn ? surge : "var(--ink2)" }}>
                <span className={`w-1.5 h-1.5 ${surgeOn ? "surge-pulse" : ""}`} style={{ backgroundColor: surgeOn ? surge : "var(--crimson)" }} />
                {surgeOn ? (phase === 1 ? "SURGE // IGNITION" : phase === 2 ? "SURGE // SWEEP — PEAK" : "SURGE // DECAY") : "CORE // IDLE — MECHANICAL"}
              </div>
            </div>
          </Reveal>

          {/* ---------- SELECTED DISCIPLINE ---------- */}
          <div>
            <Reveal>
              <div className="f-mono text-[10px] tracking-[0.26em] text-[var(--ink2)] flex items-center gap-3">
                <span className="w-6 h-px bg-[var(--crimson)]" />
                SELECTED DISCIPLINE — LIVE DOSSIER
              </div>
            </Reveal>

            <Reveal delay={0.12}>
              <div key={d.id} className="dossier-swap mt-6 mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="f-mono text-[11px] tracking-[0.26em] tabular-nums">
                    {d.num} <span className="text-[var(--crimson)]">/</span> 09
                  </span>
                  <span className="f-tech font-bold text-[9px] tracking-[0.3em] px-2.5 py-1.5 rounded-lg bg-[var(--crimson)] text-[#f4f2ed]">
                    ACTIVE
                  </span>
                </div>
                <h4 className="f-display text-[clamp(1.5rem,2.6vw,2.2rem)] mt-4 leading-tight">{d.name}</h4>
                <p className="mt-3 text-[13px] sm:text-[14px] leading-relaxed opacity-85">{d.blurb}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-[var(--outer-ink)]">
                  {d.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
                <span className="absolute -right-4 -bottom-7 f-display text-[7rem] leading-none opacity-[0.06] pointer-events-none">{d.num}</span>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div className="mt-5 f-mono text-[10px] tracking-[0.24em] text-[var(--ink2)] flex items-center gap-3">
                <span className="w-6 h-px bg-[var(--crimson)]" />
                MOVE CURSOR TO AIM · CLICK TO LOCK NODE · SURGE EVERY 30S
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
