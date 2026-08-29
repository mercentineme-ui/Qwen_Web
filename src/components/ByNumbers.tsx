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

/* Matte-graphite panel tones — dark manufactured surface in both themes.
   Light page: charcoal panels on the light page (strong contrast).
   Dark page: slightly lighter graphite so panels stay visible off the page. */
const CARD_TONES_LIGHT = ["#26282d", "#2b2d32", "#303238", "#282a2f"];
const CARD_TONES_DARK = ["#2c2e33", "#303238", "#34363c", "#2e3036"];
const PANEL_LIGHT = "#25272c";
const PANEL_DARK = "#303238";

function Stat({ num, value, suffix, label, start, delay, reduced, tone }: {
  num: string; value: number; suffix: string; label: string; start: boolean; delay: number; reduced: boolean; tone: string;
}) {
  const v = useCountUp(value, start, reduced);
  return (
    <div className="group metric-card relative p-5 sm:p-6 transition-transform duration-300 hover:-translate-y-1"
      style={{
        clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
        backgroundColor: tone,
      }}>
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
        style={{ color: "#f0f0ec", animationDelay: `${delay}ms` }}>
        {v.toLocaleString("en-US")}<span style={{ color: "var(--crimson)" }}>{suffix}</span>
      </div>

      <div className="relative mt-3 flex items-center gap-3">
        <span className="f-tech font-bold text-[11.5px] sm:text-[12.5px] tracking-[0.26em]" style={{ color: "#c9cac6" }}>{label}</span>
        <span className="h-px flex-1" style={{ background: "var(--p-line)" }} />
        <span className="w-1.5 h-1.5 rotate-45 transition-transform duration-300 group-hover:scale-125" style={{ background: "var(--crimson)" }} />
      </div>
    </div>
  );
}

export default function ByNumbers() {
  const { data, theme } = useStore();
  const bn = data.byNumbers;
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  const tones = theme === "dark" ? CARD_TONES_DARK : CARD_TONES_LIGHT;
  const panelTone = theme === "dark" ? PANEL_DARK : PANEL_LIGHT;

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

        <div className="mt-10 grid lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-12 items-stretch">
          {/* LEFT — AI ARTIST feature plate (dark industrial panel) */}
          <div className="metric-card relative p-6 sm:p-8 flex flex-col justify-between overflow-hidden"
            style={{
              clipPath: "polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)",
              backgroundColor: panelTone,
            }}>
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
              <h3 className="f-display text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[0.96] mt-3 tracking-wide" style={{ color: "#f0f0ec" }}>
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
                    <span className="f-tech font-bold text-[15px] sm:text-[17px] tracking-[0.18em]" style={{ color: "#f0f0ec" }}>{w}</span>
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
              <Stat key={s.num} {...s} start={inView} delay={i * 110} reduced={reduced} tone={tones[i % tones.length]} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
