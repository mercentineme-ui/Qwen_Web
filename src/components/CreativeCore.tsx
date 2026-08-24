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

  /* ---- bloom-triangle pointer: tracks mouse direction, settles outward at top ---- */
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
    if (reduced || !discRef.current) return;
    const r = discRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    angleRef.current.target = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI + 90;
  };
  const onLeave = () => { angleRef.current.target = 0; };

  /* ---- surge engine — every 30s, 3s, holographic thin-line ---- */
  const [lit, setLit] = useState(0);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    if (reduced) return;
    const run = () => {
      setPhase(1);
      for (let i = 0; i <= 8; i++) {
        timers.current.push(window.setTimeout(() => setLit(i), 90 * i));
      }
      timers.current.push(window.setTimeout(() => setPhase(2), 1050));
      timers.current.push(window.setTimeout(() => setPhase(3), 2200));
      timers.current.push(window.setTimeout(() => { setPhase(0); setLit(0); }, 3000));
    };
    const iv = window.setInterval(run, 30000);
    const kick = window.setTimeout(run, 3500);
    timers.current.push(kick);
    return () => {
      clearInterval(iv);
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
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

        <div onMouseMove={onMove} onMouseLeave={onLeave}
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

                {/* 8 interior wedges — slow rotation + rocking + thin-line energy */}
                <g className={reduced ? undefined : "react-spin"} style={{ animationDuration: "84s" }}>
                  {disciplines.slice(0, 8).map((_, i) => {
                    const litOn = surgeOn && lit > i;
                    return (
                      <g key={i} className={reduced ? undefined : "wedge-rock"} style={{ animationDelay: `${i * 0.65}s` }}>
                        <path d={wedgePath(i)}
                          fill={litOn ? "color-mix(in srgb, var(--surge) 16%, var(--wedge-fill))" : "var(--wedge-fill)"}
                          stroke={litOn ? surge : "var(--wedge-line)"}
                          strokeWidth={litOn ? 1.6 : 0.8}
                          style={{ transition: "fill .25s ease, stroke .25s ease", filter: litOn ? "drop-shadow(0 0 6px rgba(88,200,238,0.5))" : undefined }} />
                        <g opacity={litOn ? 1 : undefined} className={litOn ? undefined : reduced ? undefined : "wedge-hot"}
                          style={litOn ? undefined : { animationDelay: `${i * 0.8}s` }}>
                          {wedgeLines(i).map((l) => (
                            <line key={l.k} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                              stroke={surge} strokeWidth={l.k === 1 ? 1.9 : 1.15} strokeLinecap="round" />
                          ))}
                        </g>
                      </g>
                    );
                  })}
                </g>

                {/* concentric rings — counter rotation + radial breathing */}
                <circle cx="300" cy="300" r="88" fill="var(--wedge-fill)" stroke="var(--wedge-line)" strokeWidth="1.5" />
                <g className={reduced ? undefined : "react-spin-mid"}>
                  <circle cx="300" cy="300" r="72" fill="none" stroke={surge} strokeOpacity="0.45" strokeWidth="1.2" strokeDasharray="10 6" />
                  {[0, 120, 240].map((a) => {
                    const [x, y] = polar(300, 300, 72, a);
                    return <rect key={a} x={x - 4} y={y - 4} width="8" height="8" fill={surge} opacity="0.7" />;
                  })}
                </g>
                <g className={reduced ? undefined : "react-breath"}
                  style={phase === 2 ? { filter: "drop-shadow(0 0 22px rgba(88,200,238,0.8))" } : undefined}>
                  <circle cx="300" cy="300" r="52" fill="#191a1e" stroke="var(--wedge-line)" strokeWidth="1.5" />
                  <circle cx="300" cy="300" r="34" fill="#141519" stroke={surge} strokeWidth="1.6" />
                  <circle cx="300" cy="300" r="20" fill="#101116" stroke={surge} strokeWidth="2.2" />
                  {/* techno sphere — layered counter-rotating micro geometry + signal blink */}
                  <circle cx="300" cy="300" r="13.5" fill="none" stroke={surge} strokeOpacity="0.6" strokeWidth="1.1" strokeDasharray="5 4"
                    className={reduced ? undefined : "react-spin-mid"} style={{ animationDuration: "18s" }} />
                  <rect x="293" y="293" width="14" height="14" fill="none" stroke={surge} strokeOpacity="0.85" strokeWidth="1"
                    className={reduced ? undefined : "react-spin"} style={{ animationDuration: "14s" }} />
                  <circle cx="300" cy="300" r="3" fill="var(--crimson)" className={reduced ? undefined : "live-blink"} />
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

                {/* ONE small crimson bloom triangle — tracks mouse direction, settles outward at top */}
                <g ref={headRef} transform="rotate(0 300 300)">
                  <g className={reduced ? undefined : "head-pulse"} style={{ filter: "drop-shadow(0 0 8px rgba(227,34,64,0.65))" }}>
                    <path d="M300 194 Q303 212 319 223 Q300 217 281 223 Q297 212 300 194 Z" fill="var(--crimson)" />
                    <path d="M300 203 Q301.6 212 309 218 Q300 215 291 218 Q298.4 212 300 203 Z" fill="#f4f2ed" opacity="0.26" />
                  </g>
                </g>
              </svg>

              {/* 9 discipline nodes around the reactor */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const [x, y] = polar(50, 50, 39.5, (i / disciplines.length) * 360);
                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onClick={() => setLockedIdx(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}>
                    <span className={`relative grid place-items-center rounded-lg border transition-all duration-400 mat-texture ${
                      isActive
                        ? "bg-[var(--crimson)] border-[var(--crimson)] text-[#f4f2ed] shadow-[0_12px_30px_-10px_rgba(227,34,64,0.7)] scale-110"
                        : "bg-[var(--sup1)] border-[var(--line)] text-[var(--ink)] group-hover:border-[var(--ink2)] group-hover:scale-105"
                    }`} style={{ width: 96, height: 96 }}>
                      <Icon size={40} strokeWidth={1.7} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9.5px] tracking-widest px-1.5 py-0.5 rounded-sm ${isActive ? "bg-[#f4f2ed] text-[var(--crimson)]" : "bg-[var(--ink)] text-[var(--page)]"}`}>
                        {dis.num}
                      </span>
                    </span>
                    <span className={`f-tech font-bold text-[13px] tracking-[0.1em] text-center leading-tight max-w-[118px] transition-colors duration-300 ${isActive ? "text-[var(--crimson)]" : "text-[var(--ink2)] group-hover:text-[var(--ink)]"}`}>
                      {dis.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          {/* ---------- DETAIL CARD ---------- */}
          <Reveal delay={0.1}>
            <div className="mat-page-card mat-texture rounded-xl border border-[var(--line)] p-6 sm:p-8 relative overflow-hidden">
              <span className="absolute top-0 left-0 h-[3px] bg-[var(--crimson)] scan-pass" style={{ width: "42%" }} aria-hidden />
              <div key={d.id} className="dossier-swap">
                <div className="flex items-center justify-between">
                  <span className="f-mono text-[11px] tracking-[0.3em] text-[var(--crimson)]">{d.num} / 09</span>
                  <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)] flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 ${surgeOn ? "bg-[var(--surge)]" : "bg-[var(--crimson)]"} live-blink`} />
                    {hoverIdx !== null ? "SCANNING" : "LOCKED"}
                  </span>
                </div>
                <h3 className="f-display text-[clamp(1.6rem,2.6vw,2.3rem)] leading-tight mt-3">{d.name}</h3>
                <p className="mt-4 text-[13.5px] sm:text-[14px] leading-relaxed text-[var(--ink2)]">{d.blurb}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {d.tags.map((t) => <span key={t} className="text-[var(--ink)]"><Tag>{t}</Tag></span>)}
                </div>
                <div className="mt-6 pt-4 border-t border-[var(--line)] f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)] flex justify-between">
                  <span>HOVER — SCAN · CLICK — LOCK</span>
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
