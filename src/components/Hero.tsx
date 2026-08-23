import React, { useEffect, useRef, useState } from "react";
import { MediaItem } from "../lib/data";
import { useReducedMotion, useStore } from "../lib/store";
import { Reveal } from "./ui";

function FrameContent({ item }: { item: MediaItem }) {
  return (
    <div className="absolute inset-0 rounded-full overflow-hidden">
      {item.src ? (
        <img src={item.src} alt={item.label} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="w-full h-full mat-texture flex flex-col items-center justify-center gap-2 text-center"
          style={{ backgroundColor: "var(--mat-black2)", color: "#E1E1DC" }}>
          <span className="f-mono text-[9px] tracking-[0.34em] text-[#8f908b]">{item.label}</span>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-[var(--crimson)]">
            <circle cx="12" cy="8.5" r="3.6" />
            <path d="M4.5 20c1.4-4.4 4.1-6.6 7.5-6.6s6.1 2.2 7.5 6.6" />
          </svg>
          {item.emptyLines.map((l, i) => (
            <span key={i} className={`f-mono tracking-[0.3em] ${i === 0 ? "text-[var(--crimson)] text-[12px]" : "text-[10px] text-[#8f908b]"}`}>{l}</span>
          ))}
          <span className="f-tech text-[9px] tracking-[0.24em] text-[#6d6e69] mt-2">EMPTY SLOT — FILL VIA EDIT</span>
        </div>
      )}
    </div>
  );
}

const SLICES = [
  { top: "0%", h: "18%", cls: "g-slice", d: "0s" },
  { top: "18%", h: "22%", cls: "g-slice-r", d: "0.04s" },
  { top: "40%", h: "20%", cls: "g-slice", d: "0.08s" },
  { top: "60%", h: "22%", cls: "g-slice-r", d: "0.02s" },
  { top: "82%", h: "18%", cls: "g-slice", d: "0.06s" },
];

export default function Hero() {
  const { data } = useStore();
  const h = data.hero;
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const count = Math.max(1, h.images.length);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const secs = Math.max(3, h.rotationSeconds) * 1000;
    const t = window.setInterval(() => {
      setDisplay((cur) => {
        const next = (cur + 1) % count;
        if (!reduced) {
          setGlitch(true);
          timers.current.push(window.setTimeout(() => setGlitch(false), 800));
          return next;
        }
        return next;
      });
    }, secs);
    return () => { clearInterval(t); timers.current.forEach(clearTimeout); };
  }, [count, h.rotationSeconds, reduced]);

  // during glitch, render previous frame under slices; base swaps instantly but is hidden behind slices
  const [prev, setPrev] = useState(0);
  const prevDisplay = useRef(0);
  useEffect(() => {
    if (display !== prevDisplay.current) {
      setPrev(prevDisplay.current);
      prevDisplay.current = display;
    }
  }, [display]);

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <section id="about" className="relative overflow-hidden pt-[108px] lg:pt-[128px] pb-16 lg:pb-24 scroll-mt-20">
      {/* ambient layers */}
      <div className="absolute inset-0 blueprint pointer-events-none" aria-hidden />
      <div className="absolute left-6 lg:left-12 top-40 bottom-24 w-px bg-[var(--line)] hidden md:block" aria-hidden>
        <span className="absolute top-10 -left-[3px] w-[7px] h-[7px] bg-[var(--crimson)]" />
        <span className="absolute top-1/2 -left-[3px] w-[7px] h-[7px] border border-[var(--ink2)]" />
      </div>
      <span className="absolute -right-8 bottom-0 f-display text-[22vw] leading-none text-[var(--ink)] opacity-[0.035] select-none pointer-events-none" aria-hidden>
        CBK
      </span>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 grid lg:grid-cols-[1.02fr_0.98fr] gap-12 lg:gap-8 items-start">
        {/* LEFT — typography */}
        <div className="min-w-0">
          <Reveal>
            <div className="flex items-center gap-4 mb-7 lg:mb-10">
              <span className="f-tech font-bold text-[11px] tracking-[0.34em] px-2.5 py-1.5 rounded-lg bg-[var(--crimson)] text-[#f4f2ed]">
                {h.morningLabel}
              </span>
              <span className="f-mono text-[11px] tracking-[0.14em] text-[var(--ink2)]">{h.greeting}</span>
            </div>
          </Reveal>

          <h1 className="f-display leading-[0.92] select-none">
            <Reveal><span className="block text-[clamp(3.2rem,8.4vw,7rem)] tracking-[0.01em] text-[var(--ink)]">{h.nameA}</span></Reveal>
            <Reveal delay={0.1}>
              <span className="block text-[clamp(3.6rem,10vw,8.6rem)] text-[var(--crimson)] tracking-[0.015em]"
                style={{ textShadow: "0 18px 46px rgba(227,34,64,0.28)" }}>
                {h.nameB}
              </span>
            </Reveal>
          </h1>

          <Reveal delay={0.18}>
            <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 f-tech font-semibold text-[11px] sm:text-[12px] tracking-[0.22em] text-[var(--ink2)]">
              {h.chips.map((c, i) => (
                <React.Fragment key={c}>
                  <span className="hover:text-[var(--crimson)] transition-colors duration-300 cursor-default">{c}</span>
                  {i < h.chips.length - 1 && <span className="text-[var(--crimson)]">/</span>}
                </React.Fragment>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <p className="mt-6 max-w-[52ch] text-[15px] sm:text-[16px] leading-relaxed text-[var(--ink2)]">
              {h.description}
            </p>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="mt-9 flex flex-wrap gap-4">
              <a href="#showreel" className="btn btn-crimson">{h.ctaPrimary}</a>
              <a href="#expertise" className="btn btn-ghost">{h.ctaSecondary}</a>
            </div>
          </Reveal>

          <Reveal delay={0.36}>
            <div className="mt-10 flex items-center gap-5 f-mono text-[10px] tracking-[0.26em] text-[var(--ink2)]">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--crimson)] live-blink" />PORTFOLIO — VOL.02</span>
              <span className="hidden sm:inline">2018 → 2026</span>
              <span className="hidden md:inline">HYDERABAD / REMOTE</span>
            </div>
          </Reveal>
        </div>

        {/* RIGHT — circular media system (top edge aligned with the top of C. BALA) */}
        <Reveal delay={0.15} className="mt-14 lg:mt-[67px] flex justify-center lg:justify-end">
          <div className="relative w-[min(82vw,420px)] sm:w-[min(80vw,500px)] lg:w-[min(38vw,560px)] aspect-square">
            {/* internal technical rings — borderless container */}
            <svg viewBox="0 0 100 100" className="absolute -inset-[6%] w-[112%] h-[112%] pointer-events-none text-[var(--ink)]" aria-hidden>
              <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeOpacity="0.22" strokeWidth="0.25" strokeDasharray="0.8 2.4" />
              <circle cx="50" cy="50" r="46.5" fill="none" stroke="var(--crimson)" strokeOpacity="0.55" strokeWidth="0.35" strokeDasharray="14 8 3 8" className="origin-center" style={{ transformBox: "fill-box", animation: reduced ? "none" : "sunSpin 60s linear infinite" }} />
              {Array.from({ length: 24 }).map((_, i) => {
                const a = (i * 15 * Math.PI) / 180;
                const r1 = i % 6 === 0 ? 43.4 : 44.4;
                return <line key={i} x1={50 + r1 * Math.cos(a)} y1={50 + r1 * Math.sin(a)} x2={50 + 45.4 * Math.cos(a)} y2={50 + 45.4 * Math.sin(a)} stroke="currentColor" strokeOpacity={i % 6 === 0 ? 0.6 : 0.3} strokeWidth={i % 6 === 0 ? 0.45 : 0.25} />;
              })}
              <path d="M50 2.2v3M50 94.8v3M2.2 50h3M94.8 50h3" stroke="var(--crimson)" strokeWidth="0.5" />
            </svg>

            {/* base frame */}
            <div className="absolute inset-0 rounded-full overflow-hidden shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
              <FrameContent item={h.images[glitch ? prev : display] ?? h.images[0]} />
            </div>

            {/* glitch layers */}
            {glitch && !reduced && (
              <>
                {SLICES.map((s, i) => (
                  <div key={i} className={`absolute inset-0 rounded-full overflow-hidden ${s.cls}`} style={{ clipPath: `inset(${s.top} 0 ${100 - parseFloat(s.top) - parseFloat(s.h)}% 0)`, animationDelay: s.d }}>
                    <FrameContent item={h.images[prev] ?? h.images[0]} />
                  </div>
                ))}
                <div className="absolute inset-0 rounded-full overflow-hidden g-new">
                  <FrameContent item={h.images[display]} />
                </div>
                <div className="absolute left-[-4%] right-[-4%] top-[30%] h-[7px] bg-[var(--crimson)] g-smear mix-blend-screen" />
                <div className="absolute left-[-4%] right-[-4%] top-[62%] h-[4px] bg-[#f2f1ec] g-smear mix-blend-overlay" style={{ animationDelay: "0.09s" }} />
                <div className="absolute inset-0 rounded-full border border-[var(--crimson)] g-flicker" />
              </>
            )}

            {/* counter + image labels */}
            <div className="absolute bottom-[4%] left-1/2 -translate-x-1/2 flex items-center gap-2.5 px-3.5 py-2 rounded-lg mat-texture" style={{ backgroundColor: "rgba(27,28,32,0.85)" }}>
              {h.images.map((im, i) => (
                <span key={im.id} className={`f-mono text-[9px] tracking-[0.18em] transition-colors duration-300 ${i === display ? "text-[var(--crimson)]" : "text-[#8f908b]"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              ))}
              <span className="w-px h-3 bg-[#4a4b50]" />
              <span className="f-mono text-[11px] tabular-nums text-[#e1e1dc]">
                {pad(display)} <span className="text-[var(--crimson)]">/</span> {String(count).padStart(2, "0")}
              </span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
