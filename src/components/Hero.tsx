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

/* legacy-safe: always renders parts[0] + crimson daypart + parts[1] — never duplicated */
function buildGreeting(raw: string): [string, string] {
  const s = raw.includes("{DAYPART}") ? raw : raw.replace(/\b(Morning|Afternoon|Evening)\b/i, "{DAYPART}");
  if (s.includes("{DAYPART}")) {
    const [a, b] = s.split("{DAYPART}");
    return [a, b ?? ""];
  }
  return [s, ""];
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
          <span key={i} className={`f-mono tracking-[0.3em] text-[10px] ${i === 0 ? "text-[var(--crimson)]" : "text-[var(--ink2)] opacity-75"}`}>{l}</span>
        ))}
      </div>
    </div>
  );
}

/* temporal typography line — resting font GONDENS (Oswald).
   Interaction → per-glyph font/slice/misregistration morph → resolves back. */
const GLITCH_FONTS = ['"Anton", sans-serif', '"Black Ops One", sans-serif', '"IBM Plex Mono", monospace'];
function NameLine({ text, glitchKey, glitchOn, resolve, accent, className, delay }: {
  text: string; glitchKey: number; glitchOn: boolean; resolve: boolean; accent?: boolean; className: string; delay?: string;
}) {
  const glyphs = useMemo(
    () => text.split("").map((ch, i) => ({
      ch,
      gx: `${(2 + ((i * 7 + glitchKey * 3) % 5)).toFixed(1)}`,
      gd: `${(i * 0.03 + (glitchKey % 5) * 0.006).toFixed(3)}`,
      gf: GLITCH_FONTS[(i * 3 + glitchKey * 5) % GLITCH_FONTS.length],
    })),
    [text, glitchKey]
  );
  return (
    <span className={`block f-magola ${accent ? "print-matte" : ""} ${glitchOn ? "name-glitch" : ""} ${resolve ? "name-resolve" : ""} ${className}`}
      style={{ color: accent ? undefined : "var(--hero-ink)", animationDelay: resolve ? delay : undefined }}>
      {glyphs.map((g, i) =>
        g.ch === " " ? (
          <span key={i} className="inline-block w-[0.32em]" />
        ) : (
          <span key={i} className="glyph"
            style={{ "--gx": `${g.gx}px`, "--gd": `${g.gd}s`, "--gf": g.gf } as React.CSSProperties}>
            {g.ch}
          </span>
        )
      )}
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

  /* name interaction glitch — throttled, never loops at idle */
  const [glitchKey, setGlitchKey] = useState(0);
  const [glitchOn, setGlitchOn] = useState(false);
  const lastGlitch = useRef(0);
  const triggerGlitch = () => {
    if (reduced) return;
    const now = performance.now();
    if (now - lastGlitch.current < 1300) return;
    lastGlitch.current = now;
    setGlitchKey((k) => k + 1);
    setGlitchOn(true);
    window.setTimeout(() => setGlitchOn(false), 760);
  };

  /* image rotation with spider-verse print transition */
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

  /* grey technical ring — mechanical rotation: hover accelerates, then keeps a subtle drift */
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
    rot.current.hovered = true;
    rot.current.awake = true;
    setHovered(true);
    if (!reduced) {
      const id = Date.now();
      setRipples((rs) => [...rs.slice(-2), id]);
      window.setTimeout(() => setRipples((rs) => rs.filter((r) => r !== id)), 1300);
    }
  };
  const ringLeave = () => { rot.current.hovered = false; setHovered(false); };

  return (
    <section id="about" className="relative overflow-hidden pt-[98px] lg:pt-[118px] pb-16 lg:pb-24 scroll-mt-20">
      {/* print-rough filter for matte pigment surfaces */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <filter id="cbk-print-rough">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="2" result="noise" seed="7" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.4" />
        </filter>
      </svg>
      <div className="absolute inset-0 blueprint pointer-events-none" aria-hidden />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1.06fr_0.94fr] gap-12 lg:gap-10 items-start relative">
        {/* ================= LEFT — TYPOGRAPHY ================= */}
        <div className="min-w-0">
          {/* greeting — HEY THERE! crimson block + readable sentence, daypart word crimson */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
            <span className="f-tech font-bold text-[12px] tracking-[0.28em] px-3.5 py-2 w-fit rounded-[6px] bg-[var(--crimson)] text-[#DDDDD8] shadow-[0_8px_22px_-14px_rgba(34,35,40,0.9)]">
              HEY THERE!
            </span>
            <p className="text-[18px] sm:text-[20px] lg:text-[21px] leading-snug font-semibold text-[var(--ink)]">
              {g0}
              <span className="text-[var(--crimson)]">{daypartWord[daypart]}</span>
              {g1}
            </p>
          </div>

          {/* name — GONDENS resting, temporal resolve on load, glitch on interaction */}
          <h1 className="mt-8 lg:mt-9 leading-[0.94] cursor-default select-none" onMouseEnter={triggerGlitch} onClick={triggerGlitch}>
            <NameLine text={h.nameA.replace(/^C\.\s+/i, "C.")} glitchKey={glitchKey} glitchOn={glitchOn} resolve={!reduced}
              className="text-[clamp(2.2rem,4.6vw,3.8rem)] tracking-[0.02em]" delay="0s" />
            <NameLine text={h.nameB} glitchKey={glitchKey} glitchOn={glitchOn} resolve={!reduced} accent
              className="text-[clamp(3rem,6.6vw,5.8rem)] tracking-[0.01em] mt-1.5" delay="0.12s" />
          </h1>

          {/* ABOUT ME */}
          <div className="mt-8 max-w-[56ch]">
            <span className="f-mono text-[10px] tracking-[0.34em] px-2.5 py-1.5 rounded-[5px] inline-flex items-center gap-2.5"
              style={{ color: "var(--crimson)", background: "color-mix(in srgb, var(--crimson) 12%, transparent)", border: "1px solid color-mix(in srgb, var(--crimson) 35%, transparent)" }}>
              <span className="w-4 h-[2px] bg-[var(--crimson)]" />
              {h.aboutLabel}
            </span>
            <p className="mt-3.5 text-[15px] sm:text-[16.5px] leading-relaxed font-medium text-[var(--ink)]">
              {h.description}
            </p>
          </div>

          {/* role strip — compact futuristic hardware modules */}
          <div className="mt-9 grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-3.5">
            {h.chips.map((c, i) => (
              <div key={c}
                className="group mat-outer mat-texture dossier-clip-sm relative overflow-hidden px-4 pt-4 pb-4 transition-all duration-300 hover:-translate-y-1.5 hover:translate-x-0.5 hover:shadow-[0_18px_34px_-18px_rgba(0,0,0,0.6)] active:translate-y-0 active:scale-[0.985]"
                style={{ boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--outer-ink) 20%, transparent)" }}>
                <div className="flex items-center justify-between">
                  <span className="grid place-items-center w-7 h-7 f-mono font-semibold text-[11px]"
                    style={{ background: "var(--crimson)", color: "#DDDDD8" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    {[0, 1, 2].map((k) => (
                      <span key={k} className="w-1 h-3 rounded-[1px] transition-all duration-300"
                        style={{
                          background: k === 0 ? "var(--crimson)" : "color-mix(in srgb, var(--outer-ink) 30%, transparent)",
                          opacity: k <= i % 3 ? 1 : 0.35,
                          transform: `scaleY(${k === 2 ? 0.6 : k === 1 ? 0.8 : 1})`,
                        }} />
                    ))}
                  </span>
                </div>
                <span className="mt-3.5 block f-striker text-[15px] sm:text-[16.5px] tracking-[0.08em] leading-[1.15]" style={{ color: "var(--outer-ink)" }}>
                  {c}
                </span>
                <div className="mt-3 flex items-center gap-2 f-mono text-[8px] tracking-[0.22em]" style={{ color: "var(--m-sub)" }}>
                  <span className="w-1.5 h-1.5 rounded-full transition-colors duration-300 group-hover:bg-[var(--crimson)]" style={{ background: "color-mix(in srgb, var(--outer-ink) 35%, transparent)" }} />
                  MODULE/{String(i + 1).padStart(2, "0")}
                  <span className="ml-auto w-6 h-[3px] overflow-hidden rounded-[1px]" style={{ background: "color-mix(in srgb, var(--outer-ink) 16%, transparent)" }}>
                    <span className="block h-full w-full origin-left scale-x-0 bg-[var(--crimson)] group-hover:scale-x-100 transition-transform duration-400" />
                  </span>
                </div>
                <span className="absolute top-0 right-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ background: "linear-gradient(225deg, var(--crimson) 0 50%, transparent 50%)" }} />
              </div>
            ))}
          </div>

          {/* CTAs + rotation counter (counter lives outside the circle) */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#showreel" className="btn btn-crimson">{h.ctaPrimary}</a>
            <a href="#core" className="btn btn-ghost border-[var(--ink)] text-[var(--ink)]">{h.ctaSecondary}</a>
            <span className="f-mono text-[11px] tracking-[0.26em] text-[var(--ink2)] tabular-nums ml-1">
              <span className="text-[var(--crimson)]">{String(idx + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* ================= RIGHT — GREY TECHNICAL PROFILE RING ================= */}
        <div className="relative w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[560px] mx-auto lg:mr-0 lg:ml-auto aspect-square lg:mt-[56px]"
          onMouseEnter={ringEnter} onMouseLeave={ringLeave}>
          {ripples.map((id, k) => (
            <span key={id} className="ring-ripple absolute inset-[4%] rounded-full pointer-events-none"
              style={{ border: `2px solid ${k % 2 ? "var(--hero-crimson)" : "var(--ink)"}`, animationDelay: `${k * 0.14}s` }} />
          ))}

          {/* media disc — portrait stays centered */}
          <div className={`absolute inset-[15%] rounded-full overflow-hidden transition-transform duration-700 ${hovered ? "scale-[1.015]" : ""}`}>
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
                  <div className="absolute inset-0 gv2-ghost-r mix-blend-screen" style={{ backgroundColor: "#DDDDD8" }} />
                  <div className="absolute inset-0 gv2-smear"
                    style={{ background: "repeating-linear-gradient(90deg, transparent 0 10px, rgba(34,35,40,0.32) 10px 13px, transparent 13px 26px)" }} />
                  <div className="absolute inset-x-0 gv2-tear" style={{ top: "24%", height: "5px", background: "#DDDDD8" }} />
                  <div className="absolute inset-x-0 gv2-tear" style={{ top: "63%", height: "3px", background: "var(--hero-crimson)", animationDelay: "0.08s" }} />
                </>
              )}
            </div>
          </div>

          {/* grey circular technical ring — radial ticks + engraved circles, mechanical rotation */}
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
