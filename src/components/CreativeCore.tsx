import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead, Tag } from "./ui";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

function wedgePath(i: number) {
  const gap = 6;
  const a0 = i * 45 + gap / 2;
  const a1 = (i + 1) * 45 - gap / 2;
  const [ix0, iy0] = polar(300, 300, 96, a0);
  const [ox0, oy0] = polar(300, 300, 152, a0);
  const [ox1, oy1] = polar(300, 300, 152, a1);
  const [ix1, iy1] = polar(300, 300, 96, a1);
  return `M${ix0} ${iy0} L${ox0} ${oy0} A152 152 0 0 1 ${ox1} ${oy1} L${ix1} ${iy1} A96 96 0 0 0 ${ix0} ${iy0} Z`;
}

export default function CreativeCore() {
  const { data } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();
  const [lockedIdx, setLockedIdx] = useState(3);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const sel = hoverIdx ?? lockedIdx;
  const d = disciplines[sel] ?? disciplines[0];

  /* surge engine — every 30s, lasts 3s */
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
  const surgeColor = "var(--surge)";

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead num="02" title="CREATIVE CORE" meta="09 DISCIPLINES · ONE PRACTICE" />

        <div className="mt-10 grid lg:grid-cols-[1.04fr_0.96fr] gap-12 lg:gap-16 items-center">
          {/* ---------- REACTOR ---------- */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-[600px] aspect-square select-none">
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">
                {/* outer structural ring */}
                <circle cx="300" cy="300" r="286" fill="none" stroke="var(--line)" strokeWidth="1.5" strokeDasharray="2 7" />
                <circle cx="300" cy="300" r="262" fill="none" stroke="var(--line)" strokeWidth="1" />
                {Array.from({ length: 36 }).map((_, i) => {
                  const [x1, y1] = polar(300, 300, 268, i * 10);
                  const [x2, y2] = polar(300, 300, i % 3 === 0 ? 256 : 262, i * 10);
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink2)" strokeOpacity="0.5" strokeWidth={i % 3 === 0 ? 1.6 : 0.8} />;
                })}

                {/* 8 trapezoid reactor blocks */}
                {disciplines.slice(0, 8).map((_, i) => {
                  const litOn = surgeOn && lit > i;
                  return (
                    <path key={i} d={wedgePath(i)}
                      fill={litOn ? surgeColor : phase === 3 ? "var(--sup2)" : "var(--sup2)"}
                      fillOpacity={litOn ? (phase === 3 ? 0.25 : 0.85) : 1}
                      stroke={litOn ? surgeColor : "var(--line)"}
                      strokeWidth="1.5"
                      style={{ transition: "fill .18s ease, fill-opacity .5s ease, stroke .18s ease" }} />
                  );
                })}

                {/* concentric rings */}
                <circle cx="300" cy="300" r="88" fill="var(--sup1)" stroke="var(--line)" strokeWidth="1.5" />
                <circle cx="300" cy="300" r="72" fill="none" stroke="var(--ink2)" strokeOpacity="0.6" strokeWidth="1.2" strokeDasharray="10 6" />
                <circle cx="300" cy="300" r="52" fill="var(--sup2)" stroke="var(--line)" strokeWidth="1.5" />
                <circle cx="300" cy="300" r="34" fill={surgeOn ? surgeColor : "var(--ink)"} fillOpacity={surgeOn ? 0.8 : 1} stroke="none"
                  style={{ transition: "fill .4s ease" }} />
                <circle cx="300" cy="300" r="20" fill="var(--page)" stroke="var(--crimson)" strokeWidth="2.5" />

                {/* surge sweep ring */}
                {surgeOn && (
                  <circle cx="300" cy="300" r="60" fill="none" stroke={surgeColor} strokeWidth={phase === 2 ? 3 : 1.5}
                    opacity={phase === 3 ? 0 : 0.9}
                    style={{
                      transformBox: "fill-box", transformOrigin: "center",
                      transform: phase >= 2 ? "scale(3.4)" : "scale(1)",
                      transition: "transform 1.1s cubic-bezier(.25,.8,.3,1), opacity .6s ease",
                    }} />
                )}

                {/* center arrow — always outward, points at selected node */}
                <g style={{ transform: `rotate(${sel * 40}deg)`, transformOrigin: "300px 300px", transition: reduced ? "none" : "transform .65s cubic-bezier(.3,.8,.3,1)" }}>
                  <line x1="300" y1="238" x2="300" y2="196" stroke="var(--crimson)" strokeWidth="5" />
                  <polygon points="300,178 288,202 312,202" fill="var(--crimson)" />
                </g>
              </svg>

              {/* 9 outer discipline nodes */}
              {disciplines.map((disc, i) => {
                const [x, y] = polar(50, 50, 37.6, i * 40);
                const Ico = disciplineIcons[disc.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                return (
                  <button key={disc.id}
                    onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
                    onFocus={() => setHoverIdx(i)} onBlur={() => setHoverIdx(null)}
                    onClick={() => setLockedIdx(i)}
                    className="absolute flex flex-col items-center gap-1.5 group"
                    style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%,-50%)" }}
                    aria-label={disc.name}>
                    <span className={`w-12 h-12 sm:w-14 sm:h-14 grid place-items-center rounded-lg border transition-all duration-400 mat-texture ${
                      isActive
                        ? "bg-[var(--crimson)] border-[var(--crimson)] text-[#f4f2ed] shadow-[0_10px_28px_-10px_rgba(227,34,64,0.7)] scale-110"
                        : "mat-outer border-transparent group-hover:scale-105 group-hover:border-[var(--crimson)]"
                    }`}>
                      <span className="absolute -top-1.5 -left-1.5 f-mono text-[7px] px-1 rounded-[3px] leading-[11px]"
                        style={{ backgroundColor: isActive ? "var(--crimson)" : "var(--ink)", color: isActive ? "#f4f2ed" : "var(--page)" }}>
                        {disc.num}
                      </span>
                      <Ico size={20} strokeWidth={1.8} />
                    </span>
                    <span className={`f-tech font-semibold text-[8px] sm:text-[9px] tracking-[0.14em] text-center max-w-[92px] leading-tight transition-colors duration-300 ${
                      isActive ? "text-[var(--crimson)]" : "text-[var(--ink2)] group-hover:text-[var(--ink)]"
                    }`}>
                      {disc.name}
                    </span>
                  </button>
                );
              })}

              {/* surge status */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 f-mono text-[9px] tracking-[0.3em] flex items-center gap-2"
                style={{ color: surgeOn ? surgeColor : "var(--ink2)" }}>
                <span className={`w-1.5 h-1.5 ${surgeOn ? "surge-pulse" : ""}`} style={{ backgroundColor: surgeOn ? surgeColor : "var(--crimson)" }} />
                {surgeOn ? (phase === 1 ? "SURGE // IGNITION" : phase === 2 ? "SURGE // RADIAL SWEEP" : "SURGE // DECAY") : "CORE // IDLE"}
              </div>
            </div>
          </Reveal>

          {/* ---------- DETAIL ---------- */}
          <div>
            <Reveal>
              <h3 className="f-display text-[clamp(1.8rem,3.4vw,2.8rem)] leading-none">
                CREATIVE <span className="text-[var(--crimson)]">CORE</span>
              </h3>
              <p className="mt-4 max-w-[52ch] text-[14px] sm:text-[15px] leading-relaxed text-[var(--ink2)]">
                Nine disciplines, one practice — direction, generation and story held together by structured workflows.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div key={d.id} className="dossier-swap mt-8 mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden">
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
                HOVER TO SCAN · CLICK TO LOCK NODE
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
