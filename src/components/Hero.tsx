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

/* ---- legacy per-letter profile table (retained for the material-transform
   pipeline; unused while the hero uses the MADE TOMMY statement) ------------ */
const P_LX  = [ 4,-5, 3,-3, 5,-4, 3,-5, 4,-3, 5,-4, 3,-5];
const P_LY  = [ 3, 4,-3, 5,-4, 3,-3, 4,-4, 3, 5,-3, 4,-4];
const P_LZ  = [ 2,-2, 3,-1, 2,-3, 3,-2, 2,-1, 3,-2, 2,-3];
const P_ROT = [-2, 2,-1.5,2.5,-2,1.5,-2.5, 2,-1.5,2.5,-2,1.5,-2.5, 2];
const P_FD  = ["left","top","right","diag","bottom","left","right","top","bottom","left","diag","right","top","bottom"];
const P_CA  = [ 45,-30, 60,  0,-45, 30,-60, 15,-15, 50,-50, 20,-20, 40];
const P_JIT = [  0, 18, 36, 54, 72, 90, 12, 30, 48, 66, 84, 24, 42, 60];

const foldOrigin = (fd: string) =>
  fd === "left" ? "left center" : fd === "right" ? "right center"
  : fd === "top" ? "center top" : fd === "bottom" ? "center bottom" : "center center";

function letterVars(gi: number, _accent: boolean): React.CSSProperties {
  const i = ((gi % 14) + 14) % 14;
  const fd = P_FD[i];
  return {
    "--ld":    `${gi * 55 + P_JIT[i]}ms`,
    "--lx":    `${P_LX[i]}px`,
    "--ly":    `${P_LY[i]}px`,
    "--lz":    `${P_LZ[i]}px`,
    "--lrot":  `${P_ROT[i]}deg`,
    "--lca":   `${P_CA[i]}deg`,
    "--pfrom": fd === "left"  ? "rotateY(72deg)"  : fd === "right" ? "rotateY(-72deg)"
             : fd === "top"   ? "rotateX(-72deg)" : fd === "bottom" ? "rotateX(72deg)"
             : "rotate(24deg) scale(.72)",
    "--lt-dur": "2.3s",
  } as React.CSSProperties;
}

function NameLine({ text, resolve, accent, className, delay, startIndex = 0, color }: {
  text: string; resolve: boolean; accent?: boolean; className: string; delay?: string; startIndex?: number; color?: string;
}) {
  let gi = startIndex;
  return (
    <span className={`block f-display ${accent ? "print-matte" : ""} ${resolve ? "name-resolve" : ""} ${className}`}
      style={{ color: color ?? (accent ? "var(--hero-crimson)" : "var(--hero-ink)"), animationDelay: resolve ? delay : undefined }}>
      {text.split("").map((ch, k) => {
        if (ch === " ") return <span key={k} className="inline-block w-[0.32em]" aria-hidden />;
        const i = ((gi % 14) + 14) % 14;
        const fd = P_FD[i];
        const org = foldOrigin(fd);
        const dimc = i % 3 === 1 ? "var(--ink2)" : "var(--crimson)";
        const stonc = accent ? "#8f1528" : "#191a1f";
        const v = letterVars(gi, Boolean(accent));
        gi++;
        return (
          <span key={k} className="lt" style={v}>
            {/* dimensional offset duplicate (registration / alternate dimension) */}
            <span className="lt-dim" aria-hidden style={{ color: dimc }}>{ch}</span>
            {/* stone / mass extrusion layer */}
            <span className="lt-stone" aria-hidden style={{ color: stonc }}>{ch}</span>
            {/* architectural construction layer (beams clipped to the glyph) */}
            <span className="lt-arch" aria-hidden>{ch}</span>
            {/* paper fold fragment */}
            <span className="lt-paper" aria-hidden style={{ transformOrigin: org }} />
            {/* base anchor letter — stays spatially fixed */}
            <span className="lt-base">{ch}</span>
          </span>
        );
      })}
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

  /* name hover — one continuous material transformation:
     NORMAL → STONE → ARCHITECTURE → PAPER WRAP → UNWRAP → STONE → NORMAL (~2.6s).
     Leaving mid-sequence resolves smoothly back to the original typography. */
  const [matPhase, setMatPhase] = useState<"idle" | "seq" | "resolve">("idle");
  const matTimer = useRef<number | null>(null);
  const enterMat = () => {
    if (reduced) return;
    if (matTimer.current) clearTimeout(matTimer.current);
    setMatPhase("seq");
    matTimer.current = window.setTimeout(() => setMatPhase("idle"), 2600);
  };
  const leaveMat = () => {
    if (reduced) return;
    if (matPhase !== "seq") return;
    if (matTimer.current) clearTimeout(matTimer.current);
    setMatPhase("resolve");
    matTimer.current = window.setTimeout(() => setMatPhase("idle"), 460);
  };
  useEffect(() => () => { if (matTimer.current) clearTimeout(matTimer.current); }, []);
  const nameA = h.nameA.replace(/^C\.\s+/i, "C.");

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
          {/* large hero statement — MADE TOMMY, tight editorial tracking */}
          <h1 className="f-tommy leading-[0.98] select-none text-[clamp(2.5rem,5.4vw,4.4rem)]" style={{ color: "var(--ink)", letterSpacing: "-0.055em" }}>
            Ideas into worlds.<br />
            Images into sequences.
          </h1>

          {/* identity — outlined I'M + navy BALA + crimson KRISHNAN */}
          <h2 className="f-display mt-6 text-[clamp(1.7rem,3.4vw,2.7rem)] leading-tight tracking-[0.02em] select-none flex flex-wrap items-baseline gap-x-[0.35em]">
            <span aria-label="I'M" style={{ color: "transparent", WebkitTextStroke: "2px var(--ink)" }}>I'M</span>
            <span style={{ color: "var(--hero-blue)" }}>BALA</span>
            <span style={{ color: "var(--hero-crimson)" }}>KRISHNAN</span>
          </h2>

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

      {/* role ticker — seamless continuous LEFT → RIGHT loop */}
      <div className="mt-16 lg:mt-20 overflow-hidden select-none pointer-events-none" aria-hidden>
        <div className={`ticker-lr flex w-max items-center whitespace-nowrap ${reduced ? "" : ""}`} style={{ color: "var(--ticker-col)" }}>
          {[0, 1].map((k) => (
            <span key={k} className="f-tommy flex items-center gap-7 pr-7 text-[clamp(1.05rem,2vw,1.55rem)] tracking-[0.1em]">
              {["DESIGN ENGINEER", "GEN AI ARTIST", "VISUAL WORLDBUILDER", "AI PIPELINE ARCHITECT", "CREATIVE DIRECTOR"].map((r) => (
                <span key={r} className="flex items-center gap-7">
                  <span>{r}</span>
                  <span aria-hidden className="opacity-60">-</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
