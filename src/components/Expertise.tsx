import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

/* [ RAMAYANA ]-style bracketed tokens render as crimson highlights */
function Description({ text }: { text: string }) {
  const parts = text.split(/\[\s*(.*?)\s*\]/g);
  return (
    <p className="text-[14px] sm:text-[15px] leading-relaxed">
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

/* compact selector label — PSD stays short on the rail, full name lives in the dossier */
const shortName = (name: string) => (name === "PREMA SAI DESIGNERS" ? "PSD" : name);

export default function Expertise() {
  const { data } = useStore();
  const { statement, statementAccent, supporting, companies } = data.expertise;
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [swapping, setSwapping] = useState(false);
  const [mediaOpen, setMediaOpen] = useState<number | null>(null);
  const swapTimer = useRef<number | null>(null);

  useEffect(() => () => { if (swapTimer.current) clearTimeout(swapTimer.current); }, []);

  /* click → editorial wipe (≈420ms) → new chapter. No reload, no rebuild. */
  const select = (i: number) => {
    if (i === active) return;
    if (reduced) { setActive(i); return; }
    setSwapping(true);
    if (swapTimer.current) clearTimeout(swapTimer.current);
    swapTimer.current = window.setTimeout(() => {
      setActive(i);
      setSwapping(false);
    }, 300);
  };

  const co = companies[active];

  return (
    <section id="expertise" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* ================= 01 — MY EXPERTISE ================= */}
        <SectionHead
          label="01 — MY EXPERTISE"
          long
          titleNode={<>{statement} <span style={{ color: "var(--crimson)" }}>{statementAccent}</span></>}
          desc={supporting}
          meta="2018 — 2026 · FOUR CHAPTERS"
        />

        {/* ================= MY JOURNEY — ONE unified career section =================
            LEFT: career information · RIGHT: four company selectors.
            No node map, no machine — a clean cyberpunk-industrial selector. */}
        <Reveal className="mt-10">
          <div className="mat-journey mat-texture rounded-xl p-5 sm:p-8 xl:p-10 relative overflow-hidden">
            {/* registration marks */}
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crim-panel)" }} />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crim-panel)" }} />

            {/* section header */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pb-6" style={{ borderBottom: "1px solid var(--m-line)" }}>
              <span className="w-3 h-9" style={{ background: "var(--crim-panel)" }} />
              <h3 className="f-display text-[clamp(1.7rem,3.4vw,2.8rem)] leading-none tracking-wide" style={{ color: "var(--outer-ink)" }}>
                MY JOURNEY
              </h3>
              <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>
                CAREER — SELECT A CHAPTER
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--m-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em] tabular-nums" style={{ color: "var(--m-sub)" }}>
                <span style={{ color: "var(--crim-panel)" }}>{String(active + 1).padStart(2, "0")}</span> / {String(companies.length).padStart(2, "0")}
              </span>
            </div>

            <div className="mt-8 grid lg:grid-cols-[1.18fr_0.82fr] gap-8 xl:gap-12 items-start">
              {/* ================= LEFT — CAREER INFORMATION ================= */}
              <div className="mat-inner mat-texture relative p-5 sm:p-7 min-h-0"
                style={{ clipPath: "polygon(18px 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%, 0 18px)" }}>
                {/* layered inner frame + corner cuts */}
                <span className="absolute inset-[7px] pointer-events-none opacity-50" style={{ border: "1px solid var(--m-line)" }} aria-hidden />
                <span className="absolute top-3 left-3 w-3 h-3 border-t border-l" style={{ borderColor: "var(--crim-panel)" }} aria-hidden />
                <span className="absolute bottom-3 right-3 w-3 h-3 border-b border-r" style={{ borderColor: "var(--crim-panel)" }} aria-hidden />

                <div key={co.id} className={swapping ? "career-wipe-out" : "career-wipe-in"} style={{ animationDuration: reduced ? "0.01s" : undefined }}>
                  {/* index + role */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span className="f-mono font-semibold text-[10px] tracking-[0.2em] px-2 py-1"
                          style={{ background: "var(--crim-panel)", color: "#DDDDD8" }}>
                          CHAPTER {co.num}
                        </span>
                        <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>{co.date}</span>
                      </div>
                      <span className="mt-4 block f-striker text-[12.5px] sm:text-[14px] tracking-[0.12em]" style={{ color: "var(--crim-panel)" }}>
                        {co.role}
                      </span>
                      <h4 className="f-display text-[clamp(1.6rem,2.8vw,2.5rem)] mt-2 leading-[0.98] tracking-wide">{co.name}</h4>
                    </div>
                    <span className="f-display text-[2.6rem] leading-none opacity-[0.12] shrink-0 select-none">{co.num}</span>
                  </div>

                  <div className="mt-5" style={{ borderTop: "1px solid var(--m-line)", paddingTop: "1.25rem" }}>
                    <Description text={co.description} />
                  </div>

                  {co.domain && (
                    <div className="mt-5 flex items-center gap-3">
                      <span className="f-mono text-[9px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>PROJECT / DOMAIN</span>
                      <span className="h-px flex-1" style={{ background: "var(--m-line)" }} />
                      <span className="f-tech font-bold text-[14px] sm:text-[15.5px] tracking-[0.14em]" style={{ color: "var(--crim-panel)" }}>{co.domain}</span>
                    </div>
                  )}

                  {/* disciplines + tools */}
                  <div className="mt-6 grid sm:grid-cols-2 gap-6">
                    <div>
                      <span className="f-mono text-[9px] tracking-[0.28em] block mb-3" style={{ color: "var(--m-sub)" }}>DISCIPLINES</span>
                      <div className="flex flex-wrap gap-x-3 gap-y-2">
                        {co.skills.map((s, i) => (
                          <span key={s} className="flex items-center gap-2 f-striker text-[9.5px] sm:text-[10.5px] tracking-[0.1em] opacity-90">
                            <span className="w-1.5 h-1.5 rotate-45" style={{ background: "var(--crim-panel)" }} />
                            {s}
                            {i < co.skills.length - 1 && <span className="opacity-30 f-mono text-[8px]">/</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sm:border-l sm:pl-6" style={{ borderColor: "var(--m-line)" }}>
                      <span className="f-mono text-[9px] tracking-[0.28em] block mb-3" style={{ color: "var(--m-sub)" }}>TOOLS</span>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2">
                        {co.tools.map((t, i) => (
                          <React.Fragment key={t}>
                            <span className="f-tech font-bold text-[12px] sm:text-[13px] tracking-[0.12em]">{t}</span>
                            {i < co.tools.length - 1 && <span style={{ color: "var(--crim-panel)" }} className="text-[10px]">/</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* media tiles — open the universal fullscreen viewer */}
                  <div className="mt-7" style={{ borderTop: "1px solid var(--m-line)", paddingTop: "1.25rem" }}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="f-mono text-[9px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>
                        MEDIA — {String(co.media.length).padStart(2, "0")} SLOTS
                      </span>
                      <span className="f-mono text-[9px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>CLICK — FULLSCREEN</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 content-start">
                      {co.media.map((m, i) => (
                        <MediaSlot key={m.id} item={m} ratio="1/1" className="mat-page-card" onClick={() => setMediaOpen(i)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= RIGHT — FOUR COMPANY SELECTORS ================= */}
              <div className="flex flex-col gap-3 lg:sticky lg:top-28">
                <div className="flex items-center justify-between mb-1">
                  <span className="f-mono text-[9px] tracking-[0.3em]" style={{ color: "var(--m-sub)" }}>COMPANY INDEX</span>
                  <span className="flex items-center gap-2 f-mono text-[9px] tracking-[0.24em]" style={{ color: "var(--m-sub)" }}>
                    <span className="w-1.5 h-1.5 rounded-full live-blink" style={{ background: "var(--crim-panel)" }} />
                    INTERACTIVE
                  </span>
                </div>

                {companies.map((c, i) => {
                  const isOn = i === active;
                  return (
                    <button key={c.id} type="button" onClick={() => select(i)} aria-pressed={isOn}
                      className="group relative text-left mat-texture transition-all duration-300 hover:translate-x-1.5 active:translate-x-1.5 active:scale-[0.995]"
                      style={{
                        background: isOn ? "color-mix(in srgb, var(--outer-ink) 10%, transparent)" : "color-mix(in srgb, var(--outer-ink) 4%, transparent)",
                        boxShadow: `inset 0 0 0 1.5px ${isOn ? "var(--crim-panel)" : "var(--m-line)"}`,
                        clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
                        padding: "1rem 1.15rem",
                      }}>
                      {/* inset technical frame */}
                      <span className="absolute inset-[5px] pointer-events-none opacity-35" style={{ border: "1px solid var(--m-line)" }} aria-hidden />
                      {/* active edge + notch */}
                      <span className="absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300"
                        style={{ background: isOn ? "var(--crim-panel)" : "transparent" }} />

                      <div className="relative flex items-center gap-4">
                        {/* index block */}
                        <span className="f-mono font-semibold text-[11px] tracking-[0.14em] w-8 h-8 grid place-items-center shrink-0 transition-colors duration-300"
                          style={{
                            background: isOn ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 12%, transparent)",
                            color: isOn ? "#DDDDD8" : "var(--m-sub)",
                          }}>
                          {c.num}
                        </span>

                        {/* company name — the only content */}
                        <span className="f-tech font-bold text-[14px] sm:text-[15.5px] tracking-[0.14em] leading-none transition-colors duration-300 min-w-0 truncate"
                          style={{ color: isOn ? "var(--outer-ink)" : "var(--m-sub)", textShadow: isOn ? "0 1px 0 rgba(0,0,0,0.25)" : "none" }}>
                          {shortName(c.name)}
                        </span>

                        {/* technical indicator */}
                        <span className="ml-auto flex items-center gap-2 shrink-0">
                          <span className="hidden sm:flex items-end gap-[3px]" aria-hidden>
                            {[0, 1, 2].map((k) => (
                              <span key={k} className="w-[3px] rounded-[1px] transition-all duration-400"
                                style={{
                                  height: `${6 + k * 4}px`,
                                  background: isOn ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 24%, transparent)",
                                  opacity: isOn ? 1 : 0.6,
                                  transform: isOn && k === 2 ? "scaleY(1.25)" : "none",
                                  transformOrigin: "bottom",
                                  transitionDelay: `${k * 60}ms`,
                                }} />
                            ))}
                          </span>
                          <span className={`w-2 h-2 rotate-45 transition-all duration-300 ${isOn ? "scale-110" : "opacity-40 group-hover:opacity-80"}`}
                            style={{ background: isOn ? "var(--crim-panel)" : "var(--m-sub)" }} />
                        </span>
                      </div>

                      {/* hover underline scan */}
                      <span className="absolute bottom-[7px] left-[14px] right-[14px] h-[2px] overflow-hidden" aria-hidden>
                        <span className="block h-full w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-400"
                          style={{ background: "var(--crim-panel)" }} />
                      </span>
                    </button>
                  );
                })}

                {/* evolution strip — the career tells its own direction */}
                <div className="mt-3 px-1">
                  <p className="f-mono text-[9px] sm:text-[10px] tracking-[0.22em] leading-relaxed" style={{ color: "var(--m-sub)" }}>
                    GRAPHIC DESIGN <span style={{ color: "var(--crim-panel)" }}>→</span> AI DESIGN{" "}
                    <span style={{ color: "var(--crim-panel)" }}>→</span> GEN AI{" "}
                    <span style={{ color: "var(--crim-panel)" }}>→</span> AI CREATIVE DIRECTION
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* universal fullscreen media viewer for the career tiles */}
      {mediaOpen !== null && co.media[mediaOpen] && (
        <FullscreenViewer
          items={co.media}
          index={mediaOpen}
          ratio="1/1"
          onClose={() => setMediaOpen(null)}
          setIndex={setMediaOpen}
        />
      )}
    </section>
  );
}
