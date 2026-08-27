import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

function Description({ text }: { text: string }) {
  const parts = text.split(/\[\s*(.*?)\s*\]/g);
  return (
    <p className="text-[14px] sm:text-[15px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: 0.9 }}>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <em key={i} className="not-italic font-bold" style={{ color: "var(--crim-panel)" }}> {p} </em>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </p>
  );
}

const CYCLE_MS = 20000;

export default function Expertise() {
  const { data } = useStore();
  const { statement, statementAccent, supporting, companies } = data.expertise;
  const reduced = useReducedMotion();
  const n = companies.length;

  const [active, setActive] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [hover, setHover] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const elapsedRef = useRef(0);
  const [mediaView, setMediaView] = useState<number | null>(null);

  const featured = hoverIdx ?? active;
  const co = companies[featured];

  /* automatic 20s cycle — pauses on hover / lock */
  useEffect(() => {
    if (reduced || locked || hover) return;
    const iv = window.setInterval(() => {
      elapsedRef.current = 0;
      setActive((a) => (a + 1) % n);
    }, CYCLE_MS);
    return () => clearInterval(iv);
  }, [reduced, locked, hover, n]);

  const select = (i: number) => {
    if (i === featured && !leaving) {
      /* swap content with a quick mechanical wipe */
      setLeaving(true);
      window.setTimeout(() => { setActive(i); setHoverIdx(null); setLeaving(false); }, reduced ? 0 : 240);
    } else {
      setLeaving(true);
      window.setTimeout(() => { setActive(i); setHoverIdx(null); setLeaving(false); }, reduced ? 0 : 240);
    }
  };

  const onHover = (i: number) => {
    setHoverIdx(i);
  };

  return (
    <section id="expertise" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="01 — EXPERIENCE"
          titleNode={<>{statement} <span style={{ color: "var(--crimson-rough)" }}>{statementAccent}</span></>}
          desc={supporting}
          meta="2018 — 2026 · FOUR CHAPTERS"
        />

        <Reveal className="mt-10">
          <div id="journey" className="mat-journey mat-texture rounded-xl p-5 sm:p-8 xl:p-10 relative overflow-hidden scroll-mt-28">
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crim-panel)" }} />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crim-panel)" }} />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8">
              <span className="w-3 h-9" style={{ background: "var(--crim-panel)" }} />
              <h3 className="f-display text-[clamp(1.7rem,3.4vw,2.8rem)] leading-none tracking-wide" style={{ color: "var(--outer-ink)" }}>
                MY JOURNEY
              </h3>
              <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>
                CAREER TRANSMISSION — SELECT A CHAPTER
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--m-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                {locked ? "CHAPTER LOCKED" : hover ? "CYCLE PAUSED" : reduced ? "STATIC" : "AUTO CYCLE · 20S"}
              </span>
            </div>

            <div className="grid lg:grid-cols-[1fr_1.15fr] gap-8 lg:gap-12 items-start"
              onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setHoverIdx(null); }}>

              {/* ================= LEFT — career text info (fixed footprint; content scrolls inside) ================= */}
              <div className={`min-w-0 flex flex-col min-h-0 lg:h-[540px] xl:h-[580px] ${leaving ? "career-wipe-out" : "career-wipe-in"}`} key={`info-${featured}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="f-striker text-[12px] sm:text-[13px] tracking-[0.14em]" style={{ color: "var(--crim-panel)" }}>{co.role}</span>
                    <h4 className="f-display text-[clamp(1.5rem,2.4vw,2.2rem)] mt-1.5 leading-none" style={{ color: "var(--outer-ink)" }}>{co.name}</h4>
                  </div>
                  <span className="f-display text-[2.4rem] leading-none opacity-15 shrink-0" style={{ color: "var(--outer-ink)" }}>{co.num}</span>
                </div>
                <span className="f-mono text-[10px] tracking-[0.2em] block mt-2" style={{ color: "var(--m-sub)" }}>{co.date}</span>
                <div className="mt-5 flex-1 min-h-0 overflow-y-auto pr-1.5"><Description text={co.description} /></div>
                {co.domain && (
                  <div className="mt-5 shrink-0 f-tech font-bold text-[12px] tracking-[0.18em]" style={{ color: "var(--outer-ink)" }}>
                    PROJECT — <span className="text-[14px]" style={{ color: "var(--crim-panel)" }}>{co.domain}</span>
                  </div>
                )}

                <div className="mt-6 pt-5 flex flex-col gap-4 shrink-0" style={{ borderTop: "1px solid var(--m-line)" }}>
                  <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                    <span className="f-mono text-[9px] tracking-[0.28em] w-full" style={{ color: "var(--m-sub)" }}>DISCIPLINES</span>
                    {co.skills.map((s) => (
                      <span key={s} className="f-striker text-[9px] sm:text-[10px] tracking-[0.12em] opacity-90" style={{ color: "var(--outer-ink)" }}>{s}</span>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                    <span className="f-mono text-[9px] tracking-[0.28em] w-full" style={{ color: "var(--m-sub)" }}>TOOLS</span>
                    {co.tools.map((t, i) => (
                      <React.Fragment key={t}>
                        <span className="f-tech font-bold text-[11px] tracking-[0.14em]" style={{ color: "var(--outer-ink)" }}>{t}</span>
                        {i < co.tools.length - 1 && <span style={{ color: "var(--crim-panel)" }} className="text-[10px]">/</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* ================= RIGHT — company index + large media area (fixed footprint) ================= */}
              <div className="min-w-0 flex flex-col gap-6 min-h-0 lg:h-[540px] xl:h-[580px]">
                {/* COMPANY INDEX — full-width rows */}
                <div className="shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>COMPANY INDEX</span>
                    <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>{String(featured + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
                  </div>
                  <div className="flex flex-col">
                    {companies.map((c, i) => {
                      const isOn = i === featured;
                      return (
                        <button key={c.id}
                          onMouseEnter={() => onHover(i)}
                          onClick={() => select(i)}
                          className="group relative w-full flex items-center gap-3.5 px-4 sm:px-5 py-3 text-left transition-all duration-300 border-b last:border-b-0"
                          style={{
                            borderColor: "var(--m-line)",
                            background: isOn ? "color-mix(in srgb, var(--crim-panel) 10%, transparent)" : "transparent",
                            transform: isOn ? "translateX(5px)" : "none",
                          }}>
                          {/* compact index */}
                          <span className="f-mono font-semibold text-[10px] tracking-[0.14em] w-6 shrink-0 transition-colors duration-300"
                            style={{ color: isOn ? "var(--crim-panel)" : "var(--m-sub)" }}>
                            {c.num}
                          </span>
                          {/* name + meta */}
                          <span className="min-w-0 flex-1">
                            <span className="block f-tech font-bold text-[13.5px] sm:text-[15px] tracking-[0.14em] leading-tight transition-colors duration-300"
                              style={{ color: isOn ? "var(--outer-ink)" : "color-mix(in srgb, var(--outer-ink) 68%, transparent)" }}>
                              {c.short}
                            </span>
                            <span className="block f-mono text-[8.5px] tracking-[0.2em] mt-0.5" style={{ color: "var(--m-sub)" }}>{c.role}</span>
                          </span>
                          {/* restrained active indicator */}
                          <span className="w-[2px] self-stretch shrink-0 transition-all duration-300"
                            style={{ background: isOn ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 14%, transparent)" }} />
                          <span className="w-1.5 h-1.5 rotate-45 shrink-0 transition-all duration-300"
                            style={{ background: isOn ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 22%, transparent)" }} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* MEDIA / VIDEO AREA — production-archive composition filling the full media region */}
                <div key={`media-${featured}`} className={`flex-1 min-h-0 flex flex-col ${leaving ? "career-wipe-out" : "career-wipe-in"}`}>
                  <div className="flex items-center justify-between mb-3 shrink-0">
                    <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>PRODUCTION MEDIA — {String(co.media.length).padStart(2, "0")} SLOTS</span>
                    <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--crim-panel)" }}>{co.short}</span>
                  </div>
                  <div className="flex-1 min-h-0 grid gap-3"
                    style={(() => {
                      const n = co.media.length;
                      if (n <= 1) return { gridTemplateColumns: "1fr" };
                      if (n === 2) return { gridTemplateColumns: "1.5fr 1fr" };
                      if (n === 3) return { gridTemplateColumns: "1.5fr 1fr", gridTemplateRows: "1fr 1fr" };
                      return { gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" };
                    })()}>
                    {co.media.map((m, k) => (
                      <div key={m.id} className="min-h-0 min-w-0"
                        style={k === 0 && co.media.length === 3 ? { gridRow: "1 / span 2" } : undefined}>
                        <MediaSlot item={m} ratio="16/9" fill className="mat-inner rounded-[4px]! border-0!" showLabel={false}
                          onClick={() => setMediaView(k)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-8 f-mono text-[9px] sm:text-[10px] tracking-[0.24em] text-center" style={{ color: "var(--m-sub)" }}>
              GRAPHIC DESIGN <span style={{ color: "var(--crim-panel)" }}>→</span> AI DESIGN <span style={{ color: "var(--crim-panel)" }}>→</span> GEN AI <span style={{ color: "var(--crim-panel)" }}>→</span> AI CREATIVE DIRECTION
            </p>
          </div>
        </Reveal>
      </div>

      {mediaView !== null && (
        <FullscreenViewer items={co.media} index={mediaView} ratio="16/9"
          onClose={() => setMediaView(null)} setIndex={setMediaView} />
      )}
    </section>
  );
}
