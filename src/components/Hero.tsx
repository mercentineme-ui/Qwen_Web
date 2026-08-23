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

/* letter-by-letter spans (used only during the resolve window) */
function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) =>
        ch === " " ? (
          <span key={i}> </span>
        ) : (
          <span key={i} className="nr-letter" style={{ animationDelay: `${i * 0.05}s` }}>{ch}</span>
        )
      )}
    </>
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

  /* one-time identity resolve — then perfectly stable */
  const [resolved, setResolved] = useState(reduced);
  useEffect(() => {
    if (reduced) { setResolved(true); return; }
    const t = window.setTimeout(() => setResolved(true), 2500);
    return () => clearTimeout(t);
  }, [reduced]);

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

  const nameA = resolved ? h.nameA : <Letters text={h.nameA} />;
  const nameB = resolved ? h.nameB : <Letters text={h.nameB} />;

  return (
    <section id="about" className="relative overflow-hidden pt-[92px] lg:pt-[116px] pb-16 lg:pb-24 scroll-mt-20">
      {/* print-rough displacement filter (matte pigment edges) */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="cbk-print-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" result="noise" seed="7" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
        </filter>
      </svg>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1.06fr_0.94fr] gap-12 lg:gap-10 items-start">
        {/* ================= LEFT — TYPOGRAPHY ================= */}
        <div className="min-w-0">
          {/* daypart chip + large readable greeting */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <span className="f-tech font-bold text-[11px] tracking-[0.34em] px-3 py-2 rounded-lg bg-[var(--crimson)] text-[#f4f2ed] w-fit">
              {daypart}
            </span>
            <p className="text-[21px] sm:text-[25px] lg:text-[28px] leading-snug font-semibold text-[var(--ink)]">
              {greeting}
            </p>
          </div>

          {/* name — balanced two lines, temporal identity resolve */}
          <h1 className="mt-7 lg:mt-8 leading-[0.94] relative">
            {/* print misregistration ghosts (resolve window only) */}
            {!resolved && (
              <>
                <span aria-hidden className="nr-ghost f-display text-[clamp(2.1rem,4.4vw,3.6rem)] tracking-[0.04em]" style={{ color: "var(--name-blue)" }}>{h.nameA}</span>
                <span aria-hidden className="nr-ghost screen f-display text-[clamp(2.9rem,6vw,5.2rem)] tracking-[0.015em] mt-1" style={{ color: "var(--hero-crimson)", top: "auto" }}>{h.nameB}</span>
                <span aria-hidden className="nr-slice f-display text-[clamp(2.9rem,6vw,5.2rem)] tracking-[0.015em]" style={{ color: "var(--hero-crimson)", clipPath: "inset(58% 0 18% 0)", top: "3.4rem" }}>{h.nameB}</span>
              </>
            )}
            <span className={`block f-display print-rough text-[clamp(2.1rem,4.4vw,3.6rem)] tracking-[0.04em] ${resolved ? "" : "nr-main"}`}
              style={{ color: "var(--name-blue)" }}>
              {nameA}
            </span>
            <span className={`block f-display print-matte text-[clamp(2.9rem,6vw,5.2rem)] tracking-[0.015em] mt-1 ${resolved ? "" : "nr-main"}`}
              style={{ animationDelay: "0.12s" }}>
              {nameB}
            </span>
          </h1>

          {/* ABOUT ME — highlighted chip label + full-ink body */}
          <div className="mt-8 max-w-[58ch]">
            <span className="f-tech font-bold text-[10.5px] tracking-[0.3em] px-3 py-1.5 rounded-lg bg-[var(--crimson)] text-[#f4f2ed] w-fit">
              {h.aboutLabel}
            </span>
            <p className="mt-4 text-[15.5px] sm:text-[16.5px] leading-relaxed font-medium text-[var(--ink)]">
              {h.description}
            </p>
          </div>

          {/* expertise strip — four premium matte tiles */}
          <div className="mt-9 grid grid-cols-2 xl:grid-cols-4 gap-3">
            {h.chips.map((c, i) => (
              <div key={c}
                className="mat-outer mat-texture dossier-clip-sm group relative px-5 py-5 flex flex-col gap-2.5 transition-transform duration-400 hover:-translate-y-1">
                <span className="absolute top-0 left-0 w-7 h-[3px] bg-[var(--crimson)] transition-all duration-400 group-hover:w-full" />
                <span className="f-mono text-[9px] tracking-[0.28em]" style={{ color: "var(--crimson)" }}>
                  {String(i + 1).padStart(2, "0")} /
                </span>
                <span className="f-tech font-bold text-[12px] sm:text-[12.5px] tracking-[0.12em] leading-snug" style={{ color: "var(--outer-ink)" }}>
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
        <div className="relative w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[540px] mx-auto lg:mr-0 lg:ml-auto aspect-square lg:mt-[64px]">
          {/* media disc */}
          <div className="absolute inset-[7%] rounded-full overflow-hidden">
            <div className="absolute inset-0 depth-breath">
              <div className="absolute inset-0">
                <Frame idx={glitch ? prevIdx : idx} />
              </div>

              {glitch && !reduced && (
                <>
                  <div className="absolute inset-0 gv2-shake">
                    <div className="absolute inset-0 gv2-sa"><Frame idx={idx} /></div>
                    <div className="absolute inset-0 gv2-sb"><Frame idx={idx} /></div>
                    <div className="absolute inset-0 gv2-sc"><Frame idx={idx} /></div>
                  </div>
                  <div className="absolute inset-0 gv2-ghost-l mix-blend-multiply" style={{ backgroundColor: "var(--hero-crimson)" }} />
                  <div className="absolute inset-0 gv2-ghost-r mix-blend-screen" style={{ backgroundColor: "#E7E6E1" }} />
                  <div className="absolute inset-0 gv2-smear"
                    style={{ background: "repeating-linear-gradient(90deg, transparent 0 10px, rgba(27,28,32,0.32) 10px 13px, transparent 13px 26px)" }} />
                  <div className="absolute inset-x-0 gv2-tear" style={{ top: "24%", height: "5px", background: "#E7E6E1" }} />
                  <div className="absolute inset-x-0 gv2-tear" style={{ top: "63%", height: "3px", background: "var(--hero-crimson)", animationDelay: "0.08s" }} />
                </>
              )}
            </div>
          </div>

          {/* aperture / calibration hardware */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
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

            <g className={reduced ? undefined : "calib-sway"}>
              <path d="M 50 8.5 A 41.5 41.5 0 0 1 88.9 35.7" fill="none" stroke="var(--ink2)" strokeWidth="0.5" strokeDasharray="3.5 2.4" opacity="0.7" />
              <path d="M 14.4 68.2 A 41.5 41.5 0 0 1 10.2 41" fill="none" stroke="var(--ink2)" strokeWidth="0.5" strokeDasharray="1.5 2.6" opacity="0.6" />
            </g>

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
                  <rect x={50 + 45.4 * Math.cos(((a0 + 43) * Math.PI) / 180) - 1} y={50 + 45.4 * Math.sin(((a0 + 43) * Math.PI) / 180) - 1}
                    width="2" height="2" fill={isActive ? "var(--crimson)" : "var(--ink2)"} opacity="0.85" />
                </g>
              );
            })}

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

            <g style={{ transform: `rotate(${(idx % 4) * 90}deg)`, transformOrigin: "50px 50px", transition: reduced ? "none" : "transform .6s cubic-bezier(.3,.9,.25,1)" }}>
              <path d="M 50 2.4 L 47.6 6.6 L 52.4 6.6 Z" fill="var(--crimson)" />
            </g>
          </svg>

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
