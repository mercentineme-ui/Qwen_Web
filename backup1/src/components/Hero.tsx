import React, { useEffect, useMemo, useRef, useState } from "react";
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

/* ---- C. BALA KRISHNAN — fragmented dimensional fracture (per-letter) -------
   The whole name is ONE continuous line. Each character is a fixed-size unit
   holding the base glyph plus several clipped fragment copies of the SAME
   glyph. On hover the glyph fractures into those pieces (tiny displacement /
   rotation / scale, matte-crimson / cyan / violet registration), peaks, then
   converges back to the clean glyph in ~2s. Fragments never leave the glyph
   box, never reorder, and never affect document flow. ---------------------- */

/* deterministic per-character variation (seeded — same every run) */
const seeded = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

const FRAG_DUR = 1750;
const STAGGER = 22;

interface FractureNameProps { text: string; reduced: boolean }

function FractureName({ text, reduced }: FractureNameProps) {
  const [runId, setRunId] = useState(0);
  const [running, setRunning] = useState(false);
  const runTimer = useRef<number | null>(null);
  const exitTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (runTimer.current) clearTimeout(runTimer.current);
    if (exitTimer.current) clearTimeout(exitTimer.current);
  }, []);

  const cancelRun = () => {
    if (runTimer.current) { clearTimeout(runTimer.current); runTimer.current = null; }
    if (exitTimer.current) { clearTimeout(exitTimer.current); exitTimer.current = null; }
  };

  const onEnter = () => {
    if (reduced) return;
    cancelRun();
    setRunId((id) => id + 1);
    setRunning(true);
    runTimer.current = window.setTimeout(() => setRunning(false), FRAG_DUR + STAGGER * text.length + 60);
  };

  /* hover exit — controlled convergence, never a hard reset */
  const onLeave = () => {
    if (!running) return;
    cancelRun();
    setRunning(false);
  };

  /* split into "C. BALA" (navy/white) + "KRISHNAN" (crimson) by the last space */
  const splitAt = text.lastIndexOf(" ");
  const head = text.slice(0, splitAt);
  const tail = text.slice(splitAt + 1);

  const chars = useMemo(() => {
    let li = 0;
    return text.split("").map((ch, k) => {
      const idx = li++;
      const rnd = seeded(idx * 7919 + runId * 101 + 13);
      const fragCount = 3 + Math.floor(rnd() * 4); /* 3–6 fragments */
      const frags = Array.from({ length: fragCount }).map((_, f) => {
        const r = () => rnd();
        const dx = (r() * 2 - 1) * 7;   /* ±7px */
        const dy = (r() * 2 - 1) * 6;   /* ±6px */
        const rot = (r() * 2 - 1) * 4;  /* ±4deg */
        const sc = 0.96 + r() * 0.08;
        const op = 0.65 + r() * 0.35;
        const delay = idx * STAGGER + f * 14;
        const tint = f % 3 === 0 ? "crimson" : f % 3 === 1 ? "cyan" : "none";
        /* irregular clip — diagonal strip / horizontal strip / shard */
        const shape = Math.floor(r() * 3);
        const a = Math.floor(r() * 100);
        const b = Math.min(100, a + 18 + Math.floor(r() * 22));
        const clip =
          shape === 0 ? `polygon(0 ${a}%, 100% ${Math.max(0, a - 12)}%, 100% ${b}%, 0 ${Math.min(100, b + 10)}%)`
          : shape === 1 ? `polygon(${a}% 0, ${b}% 0, ${Math.min(100, b + 8)}% 100%, ${Math.max(0, a - 6)}% 100%)`
          : `polygon(${a}% 0, 100% ${a}%, ${b}% 100%, 0 ${b}%)`;
        return { dx, dy, rot, sc, op, delay, tint, clip };
      });
      return { ch, k, frags };
    });
  }, [text, runId]);

  const headLen = head.length;

  const renderWord = (word: string, colorVar: string, offset: number) =>
    word.split("").map((ch, k) => {
      const spec = chars[offset + k];
      return (
        <span key={`${word}-${k}`} className="fr-ch" style={{ color: `var(${colorVar})` }}>
          <span className="fr-size">{ch}</span>
          <span className={`fr-base ${running ? "fr-anim" : ""}`} aria-hidden={running}>
            {ch}
          </span>
          {running &&
            spec.frags.map((f, fIdx) => (
              <span key={fIdx} className="fr-frag fr-anim" aria-hidden
                style={{
                  clipPath: f.clip,
                  color:
                    f.tint === "crimson" ? "var(--crimson-rough)"
                    : f.tint === "cyan" ? "#2ec4b6"
                    : undefined,
                  animationName: "frMove",
                  animationDuration: `${FRAG_DUR}ms`,
                  animationDelay: `${f.delay}ms`,
                  animationTimingFunction: "cubic-bezier(.3,.7,.3,1)",
                  animationFillMode: "both",
                  ["--fdx" as never]: `${f.dx}px`,
                  ["--fdy" as never]: `${f.dy}px`,
                  ["--frot" as never]: `${f.rot}deg`,
                  ["--fsc" as never]: `${f.sc}`,
                  ["--fop" as never]: `${f.op}`,
                } as React.CSSProperties}>
                {ch}
              </span>
            ))}
        </span>
      );
    });

  return (
    <span
      className="f-druk select-none whitespace-nowrap leading-[1.02] inline-block cursor-default"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label={text}
    >
      <span key={`run-${runId}`} className="inline-block">
        {renderWord(head, "--hero-blue", 0)}
        <span className="inline-block" style={{ width: "0.34em" }} aria-hidden />
        {renderWord(tail, "--hero-crimson", headLen)}
      </span>
      <style>{`
        @keyframes frMove {
          0%   { opacity: 0; transform: translate(0,0) rotate(0) scale(1); }
          12%  { opacity: var(--fop); transform: translate(calc(var(--fdx) * .35), calc(var(--fdy) * .35)) rotate(calc(var(--frot) * .4)) scale(1); }
          38%  { opacity: var(--fop); transform: translate(var(--fdx), var(--fdy)) rotate(var(--frot)) scale(var(--fsc)); }
          60%  { opacity: calc(var(--fop) * .9); transform: translate(var(--fdx), var(--fdy)) rotate(var(--frot)) scale(var(--fsc)); }
          82%  { opacity: calc(var(--fop) * .5); transform: translate(calc(var(--fdx) * .3), calc(var(--fdy) * .3)) rotate(calc(var(--frot) * .3)) scale(1); }
          100% { opacity: 0; transform: translate(0,0) rotate(0) scale(1); }
        }
        .fr-anim.fr-base { animation: frBase ${FRAG_DUR}ms cubic-bezier(.3,.7,.3,1) both; }
        @keyframes frBase {
          0%,100% { opacity: 1; }
          30%,62% { opacity: .38; }
        }
      `}</style>
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
              <FractureName text="C. BALA KRISHNAN" reduced={reduced} />
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
