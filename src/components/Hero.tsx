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

/* ---- C. BALA KRISHNAN — fragmented dimensional fracture ----------------------
   Resting face is DRUKCOND-SUPER on ONE continuous line. On hover each letter
   fractures into a few clipped pieces of the SAME glyph that drift 1–8px apart
   (some with matte-crimson / cyan / violet registration), peak, then converge
   back to the clean glyph in ~2s. Hover-exit converges in ~180ms. Everything is
   transform/opacity/clip-path on fixed-size letter units → ZERO layout shift. -- */

const FR_DUR = 1750;   /* full fracture cycle (ms) */
const FR_STAGGER = 22; /* per-letter stagger (ms) */
const FR_EASE = "cubic-bezier(.3,.7,.3,1)";

const clampPct = (v: number) => Math.min(98, Math.max(2, v));
const rngFrom = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/* Irregular clip-path pieces that partition the glyph box (diagonal strips,
   horizontal strips, or crossing shards) — never a uniform grid. */
function stripsV(F: number, rng: () => number): string[] {
  const n = F - 1, topX: number[] = [], botX: number[] = [];
  for (let j = 0; j < n; j++) {
    const c = 10 + ((j + 1) / (n + 1)) * 80 + (rng() * 2 - 1) * 10;
    topX.push(clampPct(c + (rng() * 2 - 1) * 10));
    botX.push(clampPct(c + (rng() * 2 - 1) * 10));
  }
  const polys: string[] = [];
  for (let j = 0; j < F; j++) {
    const lT = j === 0 ? 0 : topX[j - 1], rT = j === F - 1 ? 100 : topX[j];
    const lB = j === 0 ? 0 : botX[j - 1], rB = j === F - 1 ? 100 : botX[j];
    polys.push(`polygon(${lT}% 0%, ${rT}% 0%, ${rB}% 100%, ${lB}% 100%)`);
  }
  return polys;
}
function stripsH(F: number, rng: () => number): string[] {
  const n = F - 1, leftY: number[] = [], rightY: number[] = [];
  for (let j = 0; j < n; j++) {
    const c = 10 + ((j + 1) / (n + 1)) * 80 + (rng() * 2 - 1) * 10;
    leftY.push(clampPct(c + (rng() * 2 - 1) * 10));
    rightY.push(clampPct(c + (rng() * 2 - 1) * 10));
  }
  const polys: string[] = [];
  for (let j = 0; j < F; j++) {
    const tL = j === 0 ? 0 : leftY[j - 1], tR = j === 0 ? 0 : rightY[j - 1];
    const bL = j === F - 1 ? 100 : leftY[j], bR = j === F - 1 ? 100 : rightY[j];
    polys.push(`polygon(0% ${tL}%, 100% ${tR}%, 100% ${bR}%, 0% ${bL}%)`);
  }
  return polys;
}
function shards(rng: () => number): string[] {
  const cx = 40 + rng() * 20, cy = 40 + rng() * 20;
  return [
    `polygon(0% 0%, 100% 0%, ${cx}% ${cy}%)`,
    `polygon(100% 0%, 100% 100%, ${cx}% ${cy}%)`,
    `polygon(100% 100%, 0% 100%, ${cx}% ${cy}%)`,
    `polygon(0% 100%, 0% 0%, ${cx}% ${cy}%)`,
  ];
}

interface FragSpec { clip: string; dx: number; dy: number; rot: number; scale: number; op: number; colorKey: string; jitter: number; }
function fractureSpecs(ci: number): FragSpec[] {
  const rng = rngFrom(ci * 7919 + 17);
  const orient = ci % 3;
  const F = orient === 2 ? 4 : 3 + (ci % 3);
  const polys = orient === 0 ? stripsV(F, rng) : orient === 1 ? stripsH(F, rng) : shards(rng);
  return polys.map((clip) => {
    const cr = rng();
    return {
      clip,
      dx: (rng() * 2 - 1) * (1 + rng() * 7),
      dy: (rng() * 2 - 1) * (1 + rng() * 7),
      rot: (rng() * 2 - 1) * 4,
      scale: 0.96 + rng() * 0.08,
      op: 0.65 + rng() * 0.35,
      colorKey: cr < 0.6 ? "base" : cr < 0.85 ? "crimson" : cr < 0.95 ? "cyan" : "violet",
      jitter: rng() * 10,
    };
  });
}

const t = (dx: number, dy: number, rot: number, scale: number) =>
  `translate(${dx.toFixed(2)}px, ${dy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`;

const BASE_KF: Keyframe[] = [
  { opacity: 1, transform: "none", offset: 0 },
  { opacity: 1, transform: "translate(1px,-1px)", offset: 0.12 },
  { opacity: 0.18, transform: "none", offset: 0.34 },
  { opacity: 0.14, transform: "none", offset: 0.60 },
  { opacity: 0.72, transform: "none", offset: 0.82 },
  { opacity: 1, transform: "none", offset: 1 },
];
const fragKF = (s: FragSpec): Keyframe[] => [
  { transform: "none", opacity: 0, offset: 0 },
  { transform: "none", opacity: 0, offset: 0.16 },
  { transform: t(s.dx * 0.3, s.dy * 0.3, s.rot * 0.4, 1), opacity: s.op * 0.5, offset: 0.30 },
  { transform: t(s.dx, s.dy, s.rot, s.scale), opacity: s.op, offset: 0.52 },
  { transform: t(s.dx, s.dy, s.rot, s.scale), opacity: s.op, offset: 0.62 },
  { transform: t(s.dx * 0.35, s.dy * 0.35, s.rot * 0.3, 1 + (s.scale - 1) * 0.4), opacity: s.op * 0.7, offset: 0.80 },
  { transform: "none", opacity: 0, offset: 1 },
];

const fragColor = (key: string) =>
  key === "base" ? undefined : key === "crimson" ? "var(--fr-crimson)" : key === "cyan" ? "var(--fr-cyan)" : "var(--fr-violet)";

interface CharLayer { baseEl: HTMLElement | null; frags: { el: HTMLElement | null; spec: FragSpec }[]; }

function FractureName({ text, reduced }: { text: string; reduced: boolean }) {
  const charsRef = useRef<CharLayer[]>([]);
  const animsRef = useRef<Animation[]>([]);
  charsRef.current = [];

  const specs = useMemo(() => {
    /* one spec set per non-space character, in reading order */
    const out: { ci: number; specs: FragSpec[] }[] = [];
    let ci = 0;
    for (const ch of text) {
      if (ch === " ") continue;
      out.push({ ci, specs: fractureSpecs(ci) });
      ci++;
    }
    return out;
  }, [text]);

  const cancelAll = () => { animsRef.current.forEach((a) => a.cancel()); animsRef.current = []; };

  const settle = () => {
    cancelAll();
    charsRef.current.forEach((c) => {
      if (c.baseEl) {
        const cur = parseFloat(getComputedStyle(c.baseEl).opacity || "1");
        const a = c.baseEl.animate([{ opacity: cur }, { opacity: 1 }], { duration: 180, easing: "ease-out", fill: "forwards" });
        a.onfinish = () => { if (c.baseEl) { c.baseEl.style.opacity = "1"; c.baseEl.style.transform = "none"; } a.cancel(); };
        animsRef.current.push(a);
      }
      c.frags.forEach(({ el }) => {
        if (!el) return;
        const cur = parseFloat(getComputedStyle(el).opacity || "0");
        const a = el.animate([{ opacity: cur }, { opacity: 0 }], { duration: 180, easing: "ease-out", fill: "forwards" });
        a.onfinish = () => { if (el) { el.style.opacity = "0"; el.style.transform = "none"; } a.cancel(); };
        animsRef.current.push(a);
      });
    });
  };

  const play = () => {
    cancelAll();
    charsRef.current.forEach((c, idx) => {
      const delay = idx * FR_STAGGER;
      if (c.baseEl) animsRef.current.push(c.baseEl.animate(BASE_KF, { duration: FR_DUR, delay, easing: FR_EASE, fill: "both" }));
      c.frags.forEach(({ el, spec }) => {
        if (el) animsRef.current.push(el.animate(fragKF(spec), { duration: FR_DUR, delay: delay + spec.jitter, easing: FR_EASE, fill: "both" }));
      });
    });
  };

  const onEnter = () => { if (!reduced) play(); };
  const onLeave = () => { if (!reduced) settle(); };

  useEffect(() => cancelAll, []);

  const splitAt = text.lastIndexOf(" ");
  const head = text.slice(0, splitAt);
  const tail = text.slice(splitAt + 1);

  let ci = 0;
  const renderWord = (word: string, colorVar: string) =>
    word.split("").map((ch, k) => {
      if (ch === " ") return <span key={`${word}-s${k}`} className="inline-block" style={{ width: "0.34em" }} aria-hidden />;
      const myCi = ci;
      const specSet = specs.find((s) => s.ci === myCi);
      const charIdxInLayers = ci;
      ci++;
      return (
        <span key={`${word}-${k}`} className="fr-ch"
          ref={(el) => {
            if (!charsRef.current[charIdxInLayers]) charsRef.current[charIdxInLayers] = { baseEl: null, frags: [] };
          }}>
          <span className="fr-size" aria-hidden>{ch}</span>
          <span className="fr-base" aria-hidden
            ref={(el) => { if (charsRef.current[charIdxInLayers]) charsRef.current[charIdxInLayers].baseEl = el; }}>
            {ch}
          </span>
          {specSet?.specs.map((spec, f) => (
            <span key={f} className="fr-frag" aria-hidden
              style={{ clipPath: spec.clip, color: fragColor(spec.colorKey) }}
              ref={(el) => {
                const layer = charsRef.current[charIdxInLayers];
                if (layer) {
                  if (!layer.frags[f]) layer.frags[f] = { el: null, spec };
                  layer.frags[f].el = el;
                }
              }}>
              {ch}
            </span>
          ))}
        </span>
      );
    });

  return (
    <div
      className="f-druk select-none whitespace-nowrap leading-[1.02] cursor-default"
      style={{ "--fr-crimson": "var(--hero-crimson)", "--fr-cyan": "rgba(45,195,220,0.8)", "--fr-violet": "rgba(124,110,215,0.75)" } as React.CSSProperties}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      aria-label={text}
    >
      <span className="inline-block" style={{ color: "var(--hero-blue)" }}>{renderWord(head, "--hero-blue")}</span>
      <span className="inline-block" style={{ width: "0.34em" }} aria-hidden />
      <span className="inline-block" style={{ color: "var(--hero-crimson)" }}>{renderWord(tail, "--hero-crimson")}</span>
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
