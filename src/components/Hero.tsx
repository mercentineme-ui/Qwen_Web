import React, { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";

type Daypart = "MORNING" | "AFTERNOON" | "EVENING";
const getDaypart = (): Daypart => {
  const h = new Date().getHours();
  if (h >= 0 && h <= 11) return "MORNING";
  if (h >= 12 && h <= 15) return "AFTERNOON";
  return "EVENING";
};

/* one rendered media frame (image or empty slot) — reused by glitch layers */
function Frame({ idx }: { idx: number }) {
  const { data } = useStore();
  const img = data.hero.images[idx % data.hero.images.length];
  return img?.src ? (
    <img src={img.src} alt={img.label} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
  ) : (
    <div className="absolute inset-0 mat-page-card" style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 16px, var(--line-soft) 16px 17px)" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-[var(--ink2)] opacity-70">
          <circle cx="12" cy="8.5" r="3.5" /><path d="M4.5 20c1.5-4.5 4.2-6.5 7.5-6.5s6 2 7.5 6.5" />
        </svg>
        {(img?.emptyLines ?? ["ADD PORTRAIT", "IN STUDIO"]).map((l, i) => (
          <span key={i} className={`f-mono tracking-[0.3em] text-[10px] ${i === 0 ? "text-[var(--crimson)]" : "text-[var(--ink2)] opacity-75"}`}>{l}</span>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const { data } = useStore();
  const h = data.hero;
  const reduced = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const glitchTimer = useRef<number | null>(null);
  const n = Math.max(1, h.images.length);

  const daypart = useMemo(getDaypart, []);
  const greeting = h.greetings[daypart] ?? h.greetings.MORNING;

  /* image rotation — controlled comic-print transition on change */
  useEffect(() => {
    const iv = window.setInterval(() => {
      setIdx((i) => (i + 1) % n);
      if (!reduced) {
        setGlitch(true);
        if (glitchTimer.current) clearTimeout(glitchTimer.current);
        glitchTimer.current = window.setTimeout(() => setGlitch(false), 760);
      }
    }, Math.max(3, h.rotationSeconds) * 1000);
    return () => {
      clearInterval(iv);
      if (glitchTimer.current) clearTimeout(glitchTimer.current);
    };
  }, [n, h.rotationSeconds, reduced]);

  const prevIdx = (idx - 1 + n) % n;

  return (
    <section id="about" className="relative overflow-hidden pt-[104px] lg:pt-[136px] pb-16 lg:pb-24 scroll-mt-20">
      {/* print-rough filter for matte pigment crimson */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="cbk-print-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" result="noise" seed="7" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
        </filter>
      </svg>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1.06fr_0.94fr] gap-12 lg:gap-10 items-start">
        {/* ================= LEFT — TYPOGRAPHY ================= */}
        <div className="min-w-0">
          {/* daypart meta + readable greeting */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <span className="f-tech font-bold text-[11px] tracking-[0.34em] px-2.5 py-1.5 rounded-lg bg-[var(--crimson)] text-[#f4f2ed] w-fit">
              {daypart}
            </span>
            <p className="text-[17px] sm:text-[19px] lg:text-[21px] leading-snug font-medium text-[var(--ink)]">
              {greeting}
            </p>
          </div>

          {/* name — C. BALA smaller, KRISHNAN wide + dominant, matte pigment crimson */}
          <h1 className="mt-8 lg:mt-9 leading-[0.9]">
            <span className="block f-display text-[clamp(1.9rem,3.6vw,3.1rem)] tracking-[0.04em] text-[var(--ink)]">
              {h.nameA}
            </span>
            <span className="block f-display print-matte text-[clamp(3.4rem,8.6vw,7.4rem)] tracking-[0.015em] mt-1">
              {h.nameB}
            </span>
          </h1>

          {/* ABOUT ME */}
          <div className="mt-8 max-w-[56ch]">
            <span className="f-mono text-[10px] tracking-[0.34em] text-[var(--crimson)] flex items-center gap-2.5">
              <span className="w-5 h-[2px] bg-[var(--crimson)]" />
              {h.aboutLabel}
            </span>
            <p className="mt-3 text-[15px] sm:text-[16px] leading-relaxed font-medium text-[var(--ink)]">
              {h.description}
            </p>
          </div>

          {/* creative tag strip — four technical tiles */}
          <div className="mt-8 grid grid-cols-2 xl:grid-cols-4 gap-3">
            {h.chips.map((c, i) => (
              <div key={c} className="mat-outer mat-texture rounded-lg px-4 py-3.5 flex flex-col gap-1.5">
                <span className="f-mono text-[9px] tracking-[0.28em]" style={{ color: "var(--crimson)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="f-tech font-bold text-[11px] sm:text-[12px] tracking-[0.12em] leading-tight" style={{ color: "var(--outer-ink)" }}>
                  {c}
                </span>
              </div>
            ))}
          </div>

          {/* CTAs + rotation counter (counter lives OUTSIDE the circle) */}
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#showreel" className="btn btn-crimson">{h.ctaPrimary}</a>
            <a href="#expertise" className="btn btn-ghost border-[var(--ink)] text-[var(--ink)]">{h.ctaSecondary}</a>
            <span className="f-mono text-[11px] tracking-[0.26em] text-[var(--ink2)] tabular-nums ml-1">
              <span className="text-[var(--crimson)]">{String(idx + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* ================= RIGHT — MECHANICAL APERTURE CIRCLE ================= */}
        <div className="relative w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[560px] mx-auto lg:mr-0 lg:ml-auto aspect-square lg:mt-[64px]">
          {/* media disc */}
          <div className="absolute inset-[7%] rounded-full overflow-hidden">
            <div className="absolute inset-0 depth-breath">
              {/* base = previous frame (holds during transition) */}
              <div className="absolute inset-0">
                <Frame idx={glitch ? prevIdx : idx} />
              </div>

              {/* spider-verse print transition layers */}
              {glitch && !reduced && (
                <>
                  <div className="absolute inset-0 gv2-shake">
                    <div className="absolute inset-0 gv2-sa"><Frame idx={idx} /></div>
                    <div className="absolute inset-0 gv2-sb"><Frame idx={idx} /></div>
                    <div className="absolute inset-0 gv2-sc"><Frame idx={idx} /></div>
                  </div>
                  {/* print misregistration — crimson + paper pass */}
                  <div className="absolute inset-0 gv2-ghost-l mix-blend-multiply" style={{ backgroundColor: "var(--hero-crimson)" }} />
                  <div className="absolute inset-0 gv2-ghost-r mix-blend-screen" style={{ backgroundColor: "#E7E6E1" }} />
                  {/* directional smear + speed lines */}
                  <div className="absolute inset-0 gv2-smear"
                    style={{ background: "repeating-linear-gradient(90deg, transparent 0 10px, rgba(27,28,32,0.32) 10px 13px, transparent 13px 26px)" }} />
                  {/* frame tearing */}
                  <div className="absolute inset-x-0 gv2-tear" style={{ top: "24%", height: "5px", background: "#E7E6E1" }} />
                  <div className="absolute inset-x-0 gv2-tear" style={{ top: "63%", height: "3px", background: "var(--hero-crimson)", animationDelay: "0.08s" }} />
                </>
              )}
            </div>
          </div>

          {/* aperture / calibration hardware */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            {/* ratcheting tick ring — stepped mechanical motion, not a loop blur */}
            <g className={reduced ? undefined : "ratchet-ticks"}>
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i * 6 * Math.PI) / 180;
                const long = i % 5 === 0;
                const r1 = 48.6, r2 = long ? 45.6 : 47;
                return (
                  <line key={i}
                    x1={50 + r1 * Math.cos(a)} y1={50 + r1 * Math.sin(a)}
                    x2={50 + r2 * Math.cos(a)} y2={50 + r2 * Math.sin(a)}
                    stroke={long ? "var(--ink)" : "var(--ink2)"} strokeWidth={long ? 0.55 : 0.3} opacity={long ? 0.9 : 0.55} />
                );
              })}
            </g>

            {/* calibration arcs — partial rings with a slow mechanical sway */}
            <g className={reduced ? undefined : "calib-sway"}>
              <path d="M 50 8.5 A 41.5 41.5 0 0 1 88.9 35.7" fill="none" stroke="var(--ink2)" strokeWidth="0.5" strokeDasharray="3.5 2.4" opacity="0.7" />
              <path d="M 14.4 68.2 A 41.5 41.5 0 0 1 10.2 41" fill="none" stroke="var(--ink2)" strokeWidth="0.5" strokeDasharray="1.5 2.6" opacity="0.6" />
            </g>

            {/* 4 slot quadrants — active slot fills over the rotation */}
            {Array.from({ length: 4 }).map((_, q) => {
              const a0 = -90 + q * 90, a1 = a0 + 86;
              const r = 43.2;
              const p0 = [(50 + r * Math.cos((a0 * Math.PI) / 180)).toFixed(2), (50 + r * Math.sin((a0 * Math.PI) / 180)).toFixed(2)];
              const p1 = [(50 + r * Math.cos((a1 * Math.PI) / 180)).toFixed(2), (50 + r * Math.sin((a1 * Math.PI) / 180)).toFixed(2)];
              const d = `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`;
              const isActive = q === idx % 4;
              return (
                <g key={q}>
                  <path d={d} fill="none" stroke="var(--line)" strokeWidth="1.1" />
                  {isActive && (
                    <path key={`fill-${idx}`} d={d} fill="none" stroke="var(--crimson)" strokeWidth="1.1"
                      pathLength={100} strokeDasharray="100" className={reduced ? undefined : "arc-fill"}
                      style={{ ["--arclen" as string]: "100", ["--arcdur" as string]: `${Math.max(3, h.rotationSeconds)}s` }} />
                  )}
                  {/* quadrant docking notch */}
                  <rect x={50 + 45.4 * Math.cos(((a0 + 43) * Math.PI) / 180) - 1} y={50 + 45.4 * Math.sin(((a0 + 43) * Math.PI) / 180) - 1}
                    width="2" height="2" fill={isActive ? "var(--crimson)" : "var(--ink2)"} opacity="0.85" />
                </g>
              );
            })}

            {/* aperture blades — snap 45° on every image change */}
            <g style={{ transform: `rotate(${idx * 45}deg)`, transformOrigin: "50px 50px", transition: reduced ? "none" : "transform .6s cubic-bezier(.3,.9,.25,1)" }}>
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i * 45 * Math.PI) / 180;
                const x = 50 + 40.2 * Math.cos(a), y = 50 + 40.2 * Math.sin(a);
                return (
                  <g key={i} className="aperture-blade" style={{ transform: `rotate(${i * 45}deg)`, transformOrigin: "50px 50px" }}>
                    <path d={`M ${x - 3.4} ${y} L ${x} ${y - 2} L ${x + 3.4} ${y} L ${x} ${y + 2} Z`}
                      fill={i % 2 === 0 ? "var(--ink)" : "var(--sup1)"} stroke="var(--line)" strokeWidth="0.25" opacity="0.95" />
                  </g>
                );
              })}
            </g>

            {/* directional index marker — points at the active slot */}
            <g style={{ transform: `rotate(${(idx % 4) * 90}deg)`, transformOrigin: "50px 50px", transition: reduced ? "none" : "transform .6s cubic-bezier(.3,.9,.25,1)" }}>
              <path d="M 50 2.4 L 47.6 6.6 L 52.4 6.6 Z" fill="var(--crimson)" />
            </g>
          </svg>

          {/* studio label under the disc */}
          <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
            <span className="w-8 h-px bg-[var(--line)]" />
            STUDIO DISC — {String(n).padStart(2, "0")} FRAMES
            <span className="w-8 h-px bg-[var(--line)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
