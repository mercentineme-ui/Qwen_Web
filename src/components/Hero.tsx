import React, { useEffect, useMemo, useRef, useState } from "react";
import { Daypart } from "../lib/data";
import { useReducedMotion, useStore } from "../lib/store";

const getDaypart = (): Daypart => {
  const h = new Date().getHours();
  if (h >= 0 && h <= 11) return "MORNING";
  if (h >= 12 && h <= 15) return "AFTERNOON";
  return "EVENING";
};
const daypartWord: Record<Daypart, string> = { MORNING: "Morning", AFTERNOON: "Afternoon", EVENING: "Evening" };

/* Always renders: "A Beautiful <Daypart> to you, welcome in." — never duplicated.
   Forces capital-B "Beautiful" even if persisted data carries a lowercase variant. */
function buildGreeting(raw: string): [string, string] {
  const cap = (x: string) => x.replace(/\bbeautiful\b/i, "Beautiful");
  const s = raw.includes("{DAYPART}") ? raw : raw.replace(/\b(Morning|Afternoon|Evening)\b/i, "{DAYPART}");
  if (s.includes("{DAYPART}")) {
    const [a, b] = s.split("{DAYPART}");
    return [cap(a), b ?? ""];
  }
  return [cap(s), ""];
}

function Frame({ idx }: { idx: number }) {
  const { data } = useStore();
  const img = data.hero.images[idx % Math.max(1, data.hero.images.length)];
  return img?.src ? (
    <img src={img.src} alt={img.label} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
  ) : (
    <div className="absolute inset-0 mat-page-card" style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 16px, var(--line-soft) 16px 17px)" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-[var(--ink2)] opacity-70">
          <circle cx="12" cy="8.5" r="3.5" /><path d="M4.5 20c1.5-4.5 4.2-6.5 7.5-6.5s6 2 7.5 6.5" />
        </svg>
        {(img?.emptyLines ?? ["ADD PORTRAIT", "IN STUDIO"]).map((l, i) => (
          <span key={i} className={`f-mono tracking-[0.3em] text-[10px] ${i === 0 ? "text-[var(--crimson-rough)]" : "text-[var(--ink2)] opacity-75"}`}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function NameLine({ text, resolve, accent, className, delay }: {
  text: string; resolve: boolean; accent?: boolean; className: string; delay?: string;
}) {
  return (
    <span className={`block f-magola ${accent ? "print-matte" : ""} ${resolve ? "name-resolve" : ""} ${className}`}
      style={{ color: accent ? undefined : "var(--hero-ink)", animationDelay: resolve ? delay : undefined }}>
      {text}
    </span>
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
  const [g0, g1] = useMemo(
    () => buildGreeting(h.greetings?.[daypart] ?? "A Beautiful {DAYPART} to you, welcome in."),
    [h.greetings, daypart]
  );

  useEffect(() => {
    const iv = window.setInterval(() => {
      setIdx((i) => (i + 1) % n);
      if (!reduced) {
        setGlitch(true);
        if (glitchTimer.current) clearTimeout(glitchTimer.current);
        glitchTimer.current = window.setTimeout(() => setGlitch(false), 700);
      }
    }, Math.max(3, h.rotationSeconds) * 1000);
    return () => {
      clearInterval(iv);
      if (glitchTimer.current) clearTimeout(glitchTimer.current);
    };
  }, [n, h.rotationSeconds, reduced]);
  const prevIdx = (idx - 1 + n) % n;

  const ringRef = useRef<SVGGElement>(null);
  const rot = useRef({ angle: 0, vel: 0, raf: 0, hovered: false, awake: false });
  const [ripples, setRipples] = useState<number[]>([]);
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (reduced) return;
    let last = performance.now();
    const loop = (t: number) => {
      const r = rot.current;
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const target = r.hovered ? 26 : r.awake ? 4.5 : 0;
      r.vel += (target - r.vel) * Math.min(1, dt * 3.2);
      r.angle = (r.angle + r.vel * dt) % 360;
      if (ringRef.current) ringRef.current.setAttribute("transform", `rotate(${r.angle.toFixed(2)} 50 50)`);
      r.raf = requestAnimationFrame(loop);
    };
    rot.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rot.current.raf);
  }, [reduced]);
  const ringEnter = () => {
    rot.current.hovered = true; rot.current.awake = true; setHovered(true);
    if (!reduced) {
      const id = Date.now();
      setRipples((rs) => [...rs.slice(-2), id]);
      window.setTimeout(() => setRipples((rs) => rs.filter((r) => r !== id)), 1300);
    }
  };
  const ringLeave = () => { rot.current.hovered = false; setHovered(false); };

  return (
    <section id="about" className="relative overflow-hidden pt-[104px] lg:pt-[124px] pb-16 lg:pb-24 scroll-mt-20">
      <div className="absolute inset-0 blueprint pointer-events-none" aria-hidden />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1.06fr_0.94fr] gap-12 lg:gap-10 items-start relative">
        <div className="min-w-0">
          {/* greeting */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <span className="f-tech font-bold text-[12px] tracking-[0.28em] px-3.5 py-2 w-fit rounded-[6px] bg-[var(--crimson)] text-[#ddddd8]">
              HEY THERE!
            </span>
            <p className="text-[18px] sm:text-[20px] lg:text-[21px] leading-snug font-semibold text-[var(--ink)]">
              {g0}
              <span style={{ color: "var(--crimson-rough)" }}>{daypartWord[daypart]}</span>
              {g1}
            </p>
          </div>

          {/* name */}
          <h1 className="mt-8 lg:mt-9 leading-[0.94] select-none">
            <NameLine text={h.nameA.replace(/^C\.\s+/i, "C.")} resolve={!reduced}
              className="text-[clamp(2.2rem,4.6vw,3.8rem)] tracking-[0.02em]" delay="0s" />
            <NameLine text={h.nameB} resolve={!reduced} accent
              className="text-[clamp(3rem,6.6vw,5.8rem)] tracking-[0.01em] mt-1.5" delay="0.12s" />
          </h1>

          {/* ABOUT ME */}
          <div className="mt-8 max-w-[56ch]">
            <span className="f-mono text-[10px] tracking-[0.34em] px-2.5 py-1.5 rounded-[5px] inline-flex items-center gap-2.5"
              style={{ color: "var(--crimson-rough)", background: "color-mix(in srgb, var(--crimson) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--crimson) 32%, transparent)" }}>
              <span className="w-4 h-[2px]" style={{ background: "var(--crimson-rough)" }} />
              {h.aboutLabel}
            </span>
            <p className="mt-3.5 text-[15px] sm:text-[16.5px] leading-relaxed font-medium text-[var(--ink)]">
              {h.description}
            </p>
          </div>

          {/* EDUCATION */}
          <div className="mt-6 max-w-[56ch]">
            <span className="f-mono text-[10px] tracking-[0.34em] px-2.5 py-1.5 rounded-[5px] inline-flex items-center gap-2.5"
              style={{ color: "var(--ink2)", background: "color-mix(in srgb, var(--ink) 7%, transparent)", border: "1px solid var(--line)" }}>
              <span className="w-4 h-[2px] bg-[var(--ink2)]" />
              {h.educationLabel}
            </span>
            <ul className="mt-3.5 flex flex-col">
              {h.education.map((e) => (
                <li key={e.num} className="flex items-baseline gap-3.5 py-2.5 border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
                  <span className="f-mono text-[10px] font-semibold shrink-0" style={{ color: "var(--crimson-rough)" }}>{e.num}</span>
                  <span className="min-w-0">
                    <span className="block f-tech font-bold text-[13.5px] sm:text-[14px] tracking-[0.06em] text-[var(--ink)] leading-snug">{e.title}</span>
                    <span className="block text-[12.5px] text-[var(--ink2)] mt-0.5">{e.school}</span>
                  </span>
                  <span className="ml-auto f-mono text-[10px] tracking-[0.2em] text-[var(--ink2)] shrink-0 tabular-nums">{e.year}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* expertise — horizontal compact cyberpunk modules */}
          <div className="mt-9 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
            {h.chips.map((c, i) => (
              <div key={c}
                className="group mat-outer mat-texture relative overflow-hidden px-4 py-3.5 flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_34px_-18px_rgba(0,0,0,0.6)] active:translate-y-0 active:scale-[0.99]"
                style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--outer-ink) 20%, transparent)", clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }}>
                <span className="f-mono font-semibold text-[11px] tracking-[0.14em] px-1.5 py-1 shrink-0"
                  style={{ background: "var(--crimson)", color: "#ddddd8" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="f-striker text-[15px] sm:text-[16px] leading-[1.12] tracking-[0.06em] min-w-0" style={{ color: "var(--outer-ink)" }}>
                  {c}
                </span>
                <span className="ml-auto flex items-center gap-1 shrink-0">
                  {[0, 1, 2, 3].map((k) => (
                    <span key={k} className="w-1 h-2.5 rounded-[1px]"
                      style={{
                        background: k <= i % 4 ? "var(--crimson)" : "color-mix(in srgb, var(--outer-ink) 28%, transparent)",
                        transform: `scaleY(${k === 3 ? 0.55 : k === 2 ? 0.75 : k === 1 ? 0.9 : 1})`,
                      }} />
                  ))}
                </span>
                <span className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-400" style={{ background: "var(--crimson)" }} />
              </div>
            ))}
          </div>

          {/* CTAs + rotation counter */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#showreel" className="btn btn-crimson">{h.ctaPrimary}</a>
            <a href="#journey" className="btn btn-ghost border-[var(--ink)] text-[var(--ink)]">{h.ctaSecondary}</a>
            <span className="f-mono text-[11px] tracking-[0.26em] text-[var(--ink2)] tabular-nums ml-1">
              <span style={{ color: "var(--crimson-rough)" }}>{String(idx + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* RIGHT — profile ring */}
        <div className="relative w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[560px] mx-auto lg:mr-0 lg:ml-auto aspect-square lg:mt-[56px]"
          onMouseEnter={ringEnter} onMouseLeave={ringLeave}>
          {ripples.map((id, k) => (
            <span key={id} className="ring-ripple absolute inset-[4%] rounded-full pointer-events-none"
              style={{ border: `2px solid ${k % 2 ? "var(--hero-crimson)" : "var(--ink)"}`, animationDelay: `${k * 0.14}s` }} />
          ))}
          <div className={`absolute inset-[15%] rounded-full overflow-hidden transition-transform duration-700 ${hovered ? "scale-[1.015]" : ""}`}>
            <div className="absolute inset-0 depth-breath">
              <div className="absolute inset-0"><Frame idx={glitch ? prevIdx : idx} /></div>
            </div>
          </div>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            <g ref={ringRef}>
              <circle cx="50" cy="50" r="42.3" fill="none" stroke="var(--line)" strokeWidth="0.4" />
              <circle cx="50" cy="50" r="39.5" fill="none" stroke="var(--line)" strokeWidth="0.4" />
              {Array.from({ length: 72 }).map((_, i) => {
                const a = (i * 5 * Math.PI) / 180;
                const long = i % 6 === 0;
                const r1 = 43.6, r2 = long ? 39.8 : 42;
                const x1 = 50 + r1 * Math.cos(a), y1 = 50 + r1 * Math.sin(a);
                const x2 = 50 + r2 * Math.cos(a), y2 = 50 + r2 * Math.sin(a);
                return long ? (
                  <rect key={i} x={-0.9} y={-2.4} width="1.8" height="4.8"
                    transform={`translate(${x2} ${y2}) rotate(${i * 5 + 90})`}
                    fill={hovered ? "var(--ink)" : "var(--ink2)"} opacity="0.9" />
                ) : (
                  <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--ink2)" strokeWidth="0.5" opacity="0.55" />
                );
              })}
              <circle cx="50" cy="50" r="36.4" fill="none" stroke="var(--ink2)" strokeWidth="0.8" opacity="0.75" />
              <circle cx="50" cy="50" r="35.9" fill="none" stroke="var(--ink2)" strokeWidth="0.4" strokeDasharray="0.5 2.2" opacity="0.7" />
              <circle cx="50" cy="50" r="35.5" fill="none" stroke="var(--line)" strokeWidth="0.35" />
            </g>
            <g style={{ transform: `rotate(${(idx % 4) * 90}deg)`, transformOrigin: "50px 50px", transition: reduced ? "none" : "transform .6s cubic-bezier(.3,.9,.25,1)" }}>
              <path d="M50 7.6 L48.2 10 L50 12.4 L51.8 10 Z" fill="var(--crimson)" />
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
