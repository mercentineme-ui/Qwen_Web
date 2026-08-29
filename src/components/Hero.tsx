import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";

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

/* ---- C. BALA KRISHNAN — quick glitch → hollow → restore ---------------------
   Resting face is DRUKCOND-SUPER on ONE continuous line. On hover the whole
   name runs one fast (~0.7s) per-letter sequence: micro-glitch (registration
   displacement) → hollow outlines → snap back to solid DrukCond-SUPER. Each
   letter animates independently (tiny displacement / hollow / registration)
   but never reorders or changes spelling. Transform/opacity only, so the
   surrounding layout never shifts. ------------------------------------------- */
const NAME_TOTAL_MS = 620 + 15 * 14; /* keyframe duration + max per-letter stagger */

function IdentityName({ text, reduced }: { text: string; reduced: boolean }) {
  const [runId, setRunId] = useState(0);
  const [running, setRunning] = useState(false);
  const runTimer = useRef<number | null>(null);

  useEffect(() => () => { if (runTimer.current) clearTimeout(runTimer.current); }, []);

  const onEnter = () => {
    if (reduced || running) return;
    setRunning(true);
    setRunId((id) => id + 1);
    runTimer.current = window.setTimeout(() => setRunning(false), NAME_TOTAL_MS + 40);
  };

  /* split into "C. BALA" (navy/white) + "KRISHNAN" (crimson) by the last space */
  const splitAt = text.lastIndexOf(" ");
  const head = text.slice(0, splitAt);
  const tail = text.slice(splitAt + 1);

  let letterIndex = 0;
  const renderWord = (word: string, colorVar: string) =>
    word.split("").map((ch, k) => {
      const li = letterIndex++;
      return (
        <span key={`${word}-${k}`} className="nl inline-block will-change-transform"
          style={{ "--lc": `var(${colorVar})`, "--li": li } as React.CSSProperties}>
          {ch}
        </span>
      );
    });

  return (
    <div
      className={`f-druk select-none whitespace-nowrap leading-[1.02] ${running ? "name-run" : ""}`}
      onMouseEnter={onEnter}
      aria-label={text}
    >
      <span key={`run-${runId}`} className="inline-block">
        {renderWord(head, "--hero-blue")}
        <span className="inline-block" style={{ width: "0.34em" }} aria-hidden />
        {renderWord(tail, "--hero-crimson")}
      </span>
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
          {/* hero statement — NURA SEMI BOLD, major hero scale, exactly two lines, tight tracking */}
          <h1 className="f-nura leading-[1.06] select-none text-[clamp(2rem,4.4vw,3.6rem)]" style={{ color: "var(--ink)", letterSpacing: "-0.045em" }}>
            <span className="block whitespace-nowrap">Ideas into worlds.</span>
            <span className="block whitespace-nowrap">Images into sequences.</span>
          </h1>

          {/* identity — static hollow I'M label above the single-line C. BALA KRISHNAN name */}
          <div className="mt-7">
            <span
              className="hollow-outline block f-druk leading-none text-[clamp(1.05rem,1.7vw,1.35rem)]"
              style={{ "--lc": "var(--ink)", letterSpacing: "0.12em" } as React.CSSProperties}
            >
              I&rsquo;M
            </span>
            <h2 className="mt-2.5 text-[clamp(2.3rem,5.2vw,4.2rem)]">
              <IdentityName text="C. BALA KRISHNAN" reduced={reduced} />
            </h2>
          </div>

          {/* body statement */}
          <p className="mt-5 text-[18px] sm:text-[20px] leading-relaxed font-medium text-[var(--ink)] max-w-[58ch]">
            I create AI-powered visuals, motion experiences, and workflows that shape ambitious ideas into finished realities.
          </p>

          {/* CTAs + rotation counter */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a href="#showreel" className="btn btn-crimson">{h.ctaPrimary}</a>
            <a href="#contact" className="btn" style={{ background: "var(--btn2-bg)", color: "var(--btn2-ink)", borderColor: "var(--btn2-bg)" }}>
              CONTACT ME
            </a>
            <span className="f-mono text-[11px] tracking-[0.26em] text-[var(--ink2)] tabular-nums ml-1">
              <span style={{ color: "var(--crimson-rough)" }}>{String(idx + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* RIGHT — studio disc, top-aligned with the hero heading */}
        <div className="relative w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[540px] mx-auto lg:mr-0 lg:ml-auto aspect-square"
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

      {/* discipline ticker — Neuhaus Headline, between two fixed rules, seamless LEFT → RIGHT loop */}
      <div
        className="mt-16 lg:mt-20 overflow-hidden select-none pointer-events-none border-y py-3.5"
        style={{ color: "var(--ticker-col)", borderColor: "color-mix(in srgb, var(--ticker-col) 55%, transparent)" }}
        aria-hidden
      >
        <div className="ticker-lr flex w-max items-center whitespace-nowrap">
          {[0, 1].map((copy) => (
            <span key={copy} className="f-neuhaus flex items-center text-[clamp(0.9rem,1.7vw,1.3rem)] tracking-[0.14em]">
              {["GRAPHIC DESIGN", "AI MOTION DESIGN", "VISUAL DEVELOPMENT", "GENERATIVE AI", "CREATIVE DIRECTION", "PIPELINE INTEGRATION"].map((d) => (
                <span key={d} className="flex items-center">
                  <span className="px-6">{d}</span>
                  <span aria-hidden className="text-[0.72em] leading-none">&bull;</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
