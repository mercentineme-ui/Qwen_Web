import { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { SectionHead } from "./ui";

function useCountUp(target: number, start: boolean, reduced: boolean) {
  const [v, setV] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!start) return;
    if (reduced) { setV(target); return; }
    let raf = 0;
    const t0 = performance.now();
    const dur = 650;
    const loop = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [start, target, reduced]);
  return v;
}

/* ---------- abstract 3D decorative objects (pure CSS 3D, decorative only) ---------- */
function Box3D({ w, h, d, kind, className = "", style }: {
  w: number; h: number; d: number; kind: "black" | "white" | "glass"; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={`im-prop im-box im-${kind} ${className}`}
      style={{ width: w, height: h, "--w": `${w}px`, "--h": `${h}px`, "--d": `${d}px`, ...style } as React.CSSProperties}>
      <div className="face f-front" />
      <div className="face f-back" />
      <div className="face f-right" />
      <div className="face f-left" />
      <div className="face f-top" />
      <div className="face f-bottom" />
    </div>
  );
}

/* Ambient object field — sits BEHIND the information layer, never over text. */
function Props3D({ reduced }: { reduced: boolean }) {
  const anim = (name: string, dur: number, delay: number, rx: number, ry: number): React.CSSProperties =>
    reduced ? { transform: `rotateX(${rx}deg) rotateY(${ry}deg)` } : {
      animation: `${name} ${dur}s ease-in-out ${delay}s infinite`,
      "--rx": `${rx}deg`, "--ry": `${ry}deg`,
    } as React.CSSProperties;

  return (
    <div className="im-stage" aria-hidden>
      {/* black beveled cube — upper left, behind the AI ARTIST slab */}
      <Box3D w={88} h={88} d={88} kind="black" className="left-[3%] top-[8%] opacity-70" style={anim("imFloatA", 14, 0, 26, -30)} />
      {/* translucent glass slab — tall, right side */}
      <Box3D w={110} h={160} d={24} kind="glass" className="right-[4%] top-[12%] opacity-80" style={anim("imFloatB", 17, 1.2, -16, 34)} />
      {/* white block — lower left */}
      <Box3D w={66} h={44} d={66} kind="white" className="left-[14%] bottom-[10%] opacity-75" style={anim("imFloatB", 15, 2, -20, 28)} />
      {/* translucent sphere — mid-right gap */}
      <div className="im-prop im-sphere left-[55%] top-[56%] opacity-70" style={{ width: 70, height: 70, ...anim("imFloatA", 16, 0.6, 0, 0) }} />
      {/* thin glass cylinder (tall narrow slab) — far right */}
      <Box3D w={24} h={140} d={24} kind="glass" className="right-[13%] bottom-[16%] opacity-70" style={anim("imSpin", 26, 0, 18, 0)} />
      {/* floating architectural plate — upper centre, behind the metrics */}
      <Box3D w={140} h={16} d={100} kind="white" className="left-[36%] top-[4%] opacity-50" style={anim("imFloatA", 18, 1.8, 58, -14)} />
    </div>
  );
}

/* ---------- metric card (glass panel) ---------- */
function Stat({ num, value, suffix, label, start, delay, reduced }: {
  num: string; value: number; suffix: string; label: string; start: boolean; delay: number; reduced: boolean;
}) {
  const v = useCountUp(value, start, reduced);
  return (
    <div className="group metric-card relative p-5 sm:p-6 transition-transform duration-300 hover:-translate-y-1"
      style={{ clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)" }}>
      <span className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r" style={{ borderColor: "var(--p-sub)" }} aria-hidden />
      <span className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l" style={{ borderColor: "var(--p-sub)" }} aria-hidden />

      <div className="relative flex items-center justify-between">
        <span className="f-mono font-semibold text-[10px] tracking-[0.24em] px-1.5 py-0.5"
          style={{ background: "var(--crimson)", color: "#f0f8ff" }}>{num}</span>
        <span className="flex items-end gap-[3px]" aria-hidden>
          {[0, 1, 2, 3].map((k) => (
            <span key={k} className={`w-[3px] ${start ? "tick-grow" : "scale-x-0"}`}
              style={{ height: `${5 + k * 3}px`, background: k === 3 ? "var(--crimson)" : "var(--p-tick)", opacity: 0.75, animationDelay: `${delay + k * 70}ms` }} />
          ))}
        </span>
      </div>

      <div className={`relative mt-4 f-display leading-none tracking-wide text-[clamp(2.5rem,4.5vw,3.9rem)] tabular-nums ${start ? "num-assemble" : "opacity-0"}`}
        style={{ color: "var(--p-ink)", animationDelay: `${delay}ms` }}>
        {v.toLocaleString("en-US")}<span style={{ color: "var(--crimson)" }}>{suffix}</span>
      </div>

      <div className="relative mt-3 flex items-center gap-3">
        <span className="f-tech font-bold text-[11.5px] sm:text-[12.5px] tracking-[0.26em]" style={{ color: "var(--p-ink)" }}>{label}</span>
        <span className="h-px flex-1" style={{ background: "var(--p-line)" }} />
        <span className="w-1.5 h-1.5 rotate-45 transition-transform duration-300 group-hover:scale-125" style={{ background: "var(--crimson)" }} />
      </div>
    </div>
  );
}

export default function ByNumbers() {
  const { data } = useStore();
  const bn = data.byNumbers;
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="bynumbers" className="relative pt-4 pb-16 lg:pb-20 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8" ref={ref}>
        <SectionHead
          label="00 — OUTPUT LOG"
          title="IMPACT METRICS"
          desc="The output, counted. Everything below is produced, directed and shipped through the same AI pipeline."
          meta="AI ARTIST · PRODUCTION STATISTICS"
        />

        {/* environment: decorative 3D objects sit behind the whole content grid */}
        <div className="relative mt-10">
          <Props3D reduced={reduced} />

          <div className="relative z-10 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-stretch">
            {/* LEFT — AI ARTIST feature panel (larger architectural glass slab) */}
            <div className="metric-card metric-panel relative p-6 sm:p-8 flex flex-col justify-between overflow-hidden"
              style={{ clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)" }}>
              <span className="absolute inset-[8px] pointer-events-none opacity-30" style={{ border: "1px solid var(--p-line)" }} aria-hidden />
              <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crimson)" }} aria-hidden />
              <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crimson)" }} aria-hidden />
              <span className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-2" aria-hidden>
                {Array.from({ length: 9 }).map((_, k) => (
                  <span key={k} className="h-px" style={{ width: k % 2 === 0 ? 14 : 7, background: "var(--p-sub)", opacity: 0.55 }} />
                ))}
              </span>

              <div className="relative">
                <span className="f-mono text-[10px] tracking-[0.3em]" style={{ color: "var(--p-sub)" }}>DISCIPLINE</span>
                <h3 className="f-display text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[0.96] mt-3 tracking-wide" style={{ color: "var(--p-ink)" }}>
                  {bn.artistRole.split(" ")[0]}{" "}
                  <span style={{ color: "var(--crimson)" }}>{bn.artistRole.split(" ").slice(1).join(" ")}</span>
                </h3>
                <p className="mt-4 text-[14px] sm:text-[15px] leading-relaxed max-w-[38ch]" style={{ color: "var(--p-sub)" }}>
                  Generative production across film, campaign and content — one pipeline, many outputs.
                </p>
              </div>

              <div className="relative mt-8" style={{ borderTop: "1px solid var(--p-line)", paddingTop: "1.25rem" }}>
                <span className="f-mono text-[9px] tracking-[0.3em] block" style={{ color: "var(--p-sub)" }}>{bn.upcomingLabel}</span>
                <div className="mt-3 flex flex-col gap-2.5">
                  {bn.upcoming.map((w, i) => (
                    <div key={w} className="group flex items-center gap-3.5">
                      <span className="w-2 h-2 rotate-45 shrink-0 transition-transform duration-300 group-hover:rotate-[135deg]"
                        style={{ background: "var(--crimson)" }} />
                      <span className="f-tech font-bold text-[15px] sm:text-[17px] tracking-[0.18em]" style={{ color: "var(--p-ink)" }}>{w}</span>
                      <span className="h-px flex-1" style={{ background: "var(--p-line)" }} />
                      <span className="f-mono text-[9px] tracking-[0.2em]" style={{ color: "var(--p-sub)" }}>0{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — 2×2 statistics ledger */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
              {bn.stats.map((s, i) => (
                <Stat key={s.num} {...s} start={inView} delay={i * 110} reduced={reduced} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
