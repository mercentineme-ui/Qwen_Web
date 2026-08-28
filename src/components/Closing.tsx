import React, { useEffect, useRef, useState } from "react";
import { useHashRoute, useReducedMotion, useStore } from "../lib/store";
import { ArrowDown, ArrowRight, ArtstationIcon, InstagramIcon, LinkedInIcon, MailIcon, PaperPlane, WhatsAppIcon } from "./icons";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

/* ================= 06 — THE PIPELINE ================= */
function Mailbox({ door, onClick }: { door: "closed" | "half" | "open"; onClick?: () => void }) {
  const deg = door === "open" ? 74 : door === "half" ? 36 : 0;
  return (
    <button type="button" onClick={onClick} disabled={!onClick} aria-label={door === "closed" ? "Open the mailbox" : "Mailbox"}
      className={`relative select-none shrink-0 ${onClick ? "cursor-pointer group" : "cursor-default"}`}
      style={{ width: 170 }}>
      <svg viewBox="0 0 200 190" className="w-full" fill="none">
        <ellipse cx="100" cy="176" rx="70" ry="9" fill="#222328" opacity="0.22" />
        <path d="M92 118 L108 118 L108 172 L92 172 Z" fill="#3C3D42" stroke="#59595B" strokeWidth="1.5" />
        <path d="M108 118 L118 112 L118 166 L108 172 Z" fill="#222328" stroke="#59595B" strokeWidth="1.5" />
        <path d="M38 62 L58 48 L162 48 L142 62 Z" fill="#59595B" stroke="#A6A6A4" strokeWidth="1.4" />
        <path d="M38 62 L142 62 L142 118 L38 118 Z" fill="#3C3D42" stroke="#59595B" strokeWidth="1.6" />
        <path d="M142 62 L162 48 L162 104 L142 118 Z" fill="#222328" stroke="#59595B" strokeWidth="1.6" />
        <path d="M52 62 V118 M128 62 V118" stroke="#222328" strokeWidth="2" opacity="0.6" />
        <rect x="58" y="76" width="66" height="30" fill="#222328" opacity={door === "closed" ? 0 : 0.9} style={{ transition: "opacity .4s ease" }} />
        {door === "open" && <path d="M70 84 l16 -7 16 7 -16 6 z" fill="#E72241" stroke="#9E2237" strokeWidth="1.2" />}
        <g style={{ transformOrigin: "128px 78px", transform: `rotate(${deg}deg)`, transition: "transform .55s cubic-bezier(.4,.8,.3,1)" }}>
          <rect x="54" y="72" width="74" height="38" rx="3" fill="#222328" stroke="#A6A6A4" strokeWidth="1.6" />
          <rect x="60" y="78" width="62" height="26" rx="2" fill="none" stroke="#59595B" strokeWidth="1.2" />
          <circle cx="120" cy="91" r="4" fill="#CEB1AB" stroke="#A6A6A4" strokeWidth="1.2" />
        </g>
        <rect x="62" y="56" width="58" height="5" rx="2" fill="#222328" />
        <g style={{ transform: door === "open" ? "translateY(-6px)" : "translateY(0)", transition: "transform .4s ease .15s" }}>
          <rect x="150" y="58" width="4" height="26" fill="#59595B" />
          <path d="M154 58 h20 l-5 6 5 6 h-20 z" fill="#E72241" stroke="#9E2237" strokeWidth="1.2" />
        </g>
      </svg>
      {door !== "open" && onClick && (
        <span className="absolute -right-3 sm:-right-7 top-1 rotate-6 f-display text-[15px] sm:text-[17px] tracking-wide px-3 py-1.5 bg-[#f0f8ff] text-[#222328] border-2 border-[#222328] shadow-[4px_4px_0_#222328] group-hover:rotate-3 group-hover:-translate-y-0.5 transition-transform duration-300">
          OPEN ME
        </span>
      )}
    </button>
  );
}

export function HowIBuild() {
  const { data } = useStore();
  const b = data.build;
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<1 | 2 | 3>(1);
  const [mbHover, setMbHover] = useState(false);
  const [glitching, setGlitching] = useState(false);
  const [planeDone, setPlaneDone] = useState(false);
  const [litN, setLitN] = useState(0);
  const [flight, setFlight] = useState(600);
  const lineRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const openMailbox = () => {
    if (phase !== 1) return;
    setPhase(2);
    requestAnimationFrame(() => {
      const w = lineRef.current?.getBoundingClientRect().width;
      if (w) setFlight(w - 150);
    });
    if (reduced) { setPlaneDone(true); setLitN(4); return; }
    [450, 1000, 1550, 1900].forEach((t, k) => timers.current.push(window.setTimeout(() => setLitN(k + 1), t)));
    timers.current.push(window.setTimeout(() => { setPlaneDone(true); setLitN(4); }, 2850));
  };
  const knowMore = () => {
    if (reduced) { setPhase(3); return; }
    setGlitching(true);
    timers.current.push(window.setTimeout(() => { setGlitching(false); setPhase(3); }, 640));
  };
  const replay = () => { setPhase(1); setPlaneDone(false); setLitN(0); setGlitching(false); };

  const stage = planeDone || reduced ? 5 : litN;

  return (
    <section id="pipeline" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="06 — HOW I BUILD"
          titleNode={<>THE <span style={{ color: "var(--crimson-rough)" }}>PIPELINE</span></>}
          desc={b.support}
          meta={`PHASE ${String(phase).padStart(2, "0")} / 03`}
        />
        <p className="mt-4 f-mono text-[11px] sm:text-[12px] tracking-[0.18em] text-[var(--ink2)]">{b.visibleNote}</p>

        <Reveal className="mt-10">
          <div className={`mat-outer mat-texture rounded-xl p-6 sm:p-10 relative overflow-hidden ${glitching ? "shake-hard" : ""}`}>
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crim-panel)" }} />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crim-panel)" }} />
            <span className="f-mono text-[10px] tracking-[0.3em]" style={{ color: "var(--crim-panel)" }}>
              PHASE {String(phase).padStart(2, "0")} — {phase === 1 ? "THE DROP" : phase === 2 ? "THE FLIGHT" : "BEYOND"}
            </span>

            {phase < 3 ? (
              <div className={`mt-8 ${glitching ? "collapse-out" : ""}`}>
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
                  <div onMouseEnter={() => setMbHover(true)} onMouseLeave={() => setMbHover(false)}>
                    <Mailbox door={phase === 1 ? (mbHover ? "half" : "closed") : "open"} onClick={openMailbox} />
                  </div>

                  {phase === 1 ? (
                    <div className="min-w-0 text-center lg:text-left">
                      <h3 className="f-display text-[clamp(1.5rem,3vw,2.4rem)] leading-tight" style={{ color: "var(--outer-ink)" }}>
                        EVERY PROJECT STARTS IN A MAILBOX.
                      </h3>
                      <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed" style={{ color: "var(--m-sub)" }}>
                        A blind briefing lands. Nothing else is visible yet — the workflow stays sealed until you open it.
                      </p>
                      <span className="mt-6 inline-flex items-center gap-3 f-tech font-bold text-[12px] tracking-[0.22em] live-blink" style={{ color: "var(--crim-panel)" }}>
                        <span className="w-2 h-2 rotate-45" style={{ background: "var(--crim-panel)" }} /> CLICK THE MAILBOX
                      </span>
                    </div>
                  ) : (
                    /* PHASE 2 — one straight horizontal rail; the plane flies right, nose always right */
                    <div ref={lineRef} className="relative flex-1 h-40 w-full min-w-0">
                      <div className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2" style={{ right: 150, background: "var(--m-line)" }} />
                      <div className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2"
                        style={{ width: `${(stage / 5) * 100}%`, maxWidth: "calc(100% - 150px)", background: "var(--crimson-strong)", transition: reduced ? "none" : "width .7s cubic-bezier(.4,.4,.4,1)" }} />
                      {[14, 34, 54, 72].map((jx, k) => (
                        <span key={k} className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45 w-2.5 h-2.5"
                          style={{ left: `${jx}%`, background: stage > k ? "var(--crimson-strong)" : "var(--outer-bg)", border: "1px solid var(--m-sub)", transition: "background .5s ease" }} />
                      ))}

                      {b.nodes.map((nd, i) => {
                        const isCurrent = i === stage - 1;
                        const isPassed = i < stage - 1;
                        const above = i % 2 === 0;
                        return (
                          <div key={nd.num} className="absolute -translate-x-1/2 flex flex-col items-center"
                            style={{ left: `${[14, 34, 54, 72][i]}%`, top: above ? "14%" : "86%", transform: "translate(-50%, " + (above ? "0" : "-100%") + ")" }}>
                            {above ? (
                              <>
                                <div className="relative px-3.5 py-2 text-center mat-texture dossier-clip-sm pop-in"
                                  style={{ background: "var(--outer-ink)", boxShadow: `inset 0 0 0 1.5px ${isCurrent ? "var(--crimson-strong)" : "color-mix(in srgb, var(--outer-bg) 30%, transparent)"}`, animationDelay: reduced ? "0s" : `${0.3 + i * 0.5}s` }}>
                                  <span className="f-mono text-[9px] tracking-[0.2em] block" style={{ color: isCurrent ? "var(--crimson-strong)" : "var(--outer-bg)", opacity: isCurrent ? 1 : 0.8 }}>{nd.num}</span>
                                  <span className="f-tech font-bold text-[11px] sm:text-[12.5px] tracking-[0.16em] block mt-0.5 whitespace-nowrap" style={{ color: "var(--outer-bg)" }}>{nd.title}</span>
                                </div>
                                <span className="w-[3px] rounded" style={{ height: 10, background: isCurrent ? "var(--crimson-strong)" : "#59595B" }} />
                              </>
                            ) : (
                              <>
                                <span className="w-[3px] rounded" style={{ height: 10, background: isCurrent ? "var(--crimson-strong)" : "#59595B" }} />
                                <div className="relative px-3.5 py-2 text-center mat-texture dossier-clip-sm pop-in"
                                  style={{ background: "var(--outer-ink)", boxShadow: `inset 0 0 0 1.5px ${isCurrent ? "var(--crimson-strong)" : "color-mix(in srgb, var(--outer-bg) 30%, transparent)"}`, animationDelay: reduced ? "0s" : `${0.3 + i * 0.5}s` }}>
                                  <span className="f-mono text-[9px] tracking-[0.2em] block" style={{ color: isCurrent ? "var(--crimson-strong)" : "var(--outer-bg)", opacity: isCurrent ? 1 : 0.8 }}>{nd.num}</span>
                                  <span className="f-tech font-bold text-[11px] sm:text-[12.5px] tracking-[0.16em] block mt-0.5 whitespace-nowrap" style={{ color: "var(--outer-bg)" }}>{nd.title}</span>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}

                      {!planeDone && !reduced && (
                        <span className="absolute top-1/2 left-0 plane-cross" style={{ "--flight": `${flight}px` } as React.CSSProperties}>
                          <PaperPlane size={34} className="text-[#e72241]" />
                        </span>
                      )}

                      <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col items-center pop-in" style={{ animationDelay: reduced ? "0s" : "0.2s" }}>
                        {planeDone ? (
                          <button onClick={knowMore} className="btn btn-crimson !py-3">
                            <PaperPlane size={16} /> {b.knowMore} <ArrowRight size={14} strokeWidth={2.4} />
                          </button>
                        ) : (
                          <span className="px-3.5 py-2.5 f-tech font-bold text-[11px] tracking-[0.2em] whitespace-nowrap dossier-clip-sm"
                            style={{ background: "var(--outer-bg)", color: "var(--m-sub)", boxShadow: "inset 0 0 0 1.5px rgba(221,221,216,0.16)" }}>
                            {b.knowMore}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {phase === 2 && (
                  <div className="sm:hidden mt-4 flex justify-end w-full">
                    {planeDone ? (
                      <button onClick={knowMore} className="btn btn-crimson !py-3">
                        <PaperPlane size={16} /> {b.knowMore} <ArrowRight size={14} strokeWidth={2.4} />
                      </button>
                    ) : (
                      <span className="px-3.5 py-2.5 f-tech font-bold text-[11px] tracking-[0.2em] whitespace-nowrap dossier-clip-sm"
                        style={{ background: "var(--outer-bg)", color: "var(--m-sub)", boxShadow: "inset 0 0 0 1.5px rgba(221,221,216,0.16)" }}>
                        {b.knowMore}
                      </span>
                    )}
                  </div>
                )}

                <p className="mt-8 f-mono text-[9px] tracking-[0.26em]" style={{ color: "var(--m-sub)" }}>
                  {phase === 1 ? "HOVER — THE DOOR CRACKS OPEN · CLICK — PHASE 02" : planeDone ? "THE PLANE LANDED — TAKE THE NEXT STEP" : "THE PLANE IS IN THE AIR…"}
                </p>
              </div>
            ) : (
              /* PHASE 3 — comic production archive */
              <div className="mt-6 comic-in relative rounded-xl border-4 p-6 sm:p-9 overflow-hidden"
                style={{ borderColor: "#222328", background: "#f0f8ff", backgroundImage: "radial-gradient(rgba(34,35,40,0.16) 1px, transparent 1.4px)", backgroundSize: "12px 12px", boxShadow: "10px 10px 0 #9E2237, 16px 16px 0 #59232F", color: "#222328" }}>
                <span className="comic-flash absolute inset-0 border-4 pointer-events-none" style={{ borderColor: "#9E2237" }} aria-hidden />
                <span className="absolute top-3 left-4 f-mono text-[9px] tracking-[0.3em] text-[#9E2237]">PHASE 03 — BEYOND</span>
                <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-start mt-4">
                  <div className="relative min-w-0">
                    <div className="bubble-settle relative z-10 mb-[-12px] ml-2 sm:ml-5 w-[92%] rounded-[16px] border-[3px] border-[#222328] bg-[#f0f8ff] px-5 py-4"
                      style={{ boxShadow: "5px 5px 0 #9E2237" }}>
                      <p className="f-tech font-bold text-[14px] sm:text-[15.5px] leading-snug">{b.bubble}</p>
                      <svg className="absolute -bottom-[16px] left-10" width="34" height="20" viewBox="0 0 34 20">
                        <path d="M0 0 H34 L12 20 Z" fill="#f0f8ff" stroke="#222328" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M3 0 H31 L12 16 Z" fill="#f0f8ff" />
                      </svg>
                    </div>
                    <div className="relative border-4 border-[#222328] bg-[#C3C1BC]" style={{ boxShadow: "8px 8px 0 #9E2237" }}>
                      <MediaSlot item={b.reveal.image} ratio="1/1" className="!rounded-none !border-0" showLabel={false} />
                      <span className="absolute top-2 left-2 f-mono text-[8px] tracking-[0.26em] px-2 py-1 bg-[#222328] text-[#f0f8ff]">UPLOAD SPACE</span>
                      <span className="absolute bottom-2 right-2 f-mono text-[8px] tracking-[0.26em] px-2 py-1 bg-[#9E2237] text-[#f0f8ff]">1 : 1 FRAME</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="block f-mono text-[9px] tracking-[0.3em]" style={{ color: "rgba(34,35,40,0.6)" }}>CONTINUED FROM PAGE 615</span>
                    <span className="block f-mono text-[10px] tracking-[0.32em] text-[#9E2237] mt-1.5">BEYOND THE FOUR NODES</span>
                    <h3 className="f-display leading-[0.98] mt-4 text-[clamp(2rem,4.4vw,3.4rem)]">
                      {b.reveal.heading} <span className="text-[#9E2237]">{b.reveal.headingAccent}</span>
                    </h3>
                    <div className="mt-6 relative border-2 border-[#222328] bg-[#CEB1AB] p-5" style={{ boxShadow: "6px 6px 0 #9E2237" }}>
                      <span className="absolute -top-2.5 left-4 f-mono text-[8px] tracking-[0.3em] px-2 py-0.5 bg-[#9E2237] text-[#f0f8ff]">NARRATOR</span>
                      <p className="text-[14.5px] sm:text-[16px] leading-relaxed font-medium text-[#222328]">{b.reveal.narrator}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center gap-5">
                      <button onClick={replay}
                        className="inline-flex items-center gap-3 f-tech font-bold text-[11px] tracking-[0.24em] px-4 py-3 rounded-lg border-2 border-[#222328] hover:bg-[#222328] hover:text-[#f0f8ff] transition-all duration-300"
                        style={{ boxShadow: "4px 4px 0 #9E2237" }}>
                        ↻ RUN IT AGAIN
                      </button>
                      <span className="f-mono text-[8.5px] tracking-[0.3em]" style={{ color: "rgba(34,35,40,0.55)" }}>H8 · ISSUE 01 · END OF PAGE</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= 08 — CONTACT ================= */
export function Contact() {
  const { data } = useStore();
  const c = data.contact;
  const [portraitOpen, setPortraitOpen] = useState(false);

  return (
    <section id="contact" className="relative py-20 lg:py-28 scroll-mt-20 mat-texture overflow-hidden"
      style={{ backgroundColor: "var(--ct-bg)", color: "var(--ct-ink)" }}>
      <span className="absolute top-8 left-8 w-5 h-5 border-t-2 border-l-2 opacity-60" style={{ borderColor: "var(--crim-panel)" }} />
      <span className="absolute bottom-8 right-8 w-5 h-5 border-b-2 border-r-2 opacity-60" style={{ borderColor: "var(--crim-panel)" }} />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 relative">
        <Reveal>
          <div className="flex items-center justify-between gap-6">
            <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.26em] inline-flex items-center gap-2.5 px-3 py-2 rounded-[6px]"
              style={{ border: "1.5px solid var(--ct-line)" }}>
              <span className="font-semibold" style={{ color: "var(--crim-panel)" }}>08</span>
              <span style={{ color: "var(--crim-panel)" }}>—</span>
              <span>{c.heading}</span>
            </span>
            <span className="f-mono text-[10px] tracking-[0.3em] hidden sm:flex items-center gap-2.5" style={{ color: "var(--ct-sub)" }}>
              <span className="w-1.5 h-1.5 rounded-full live-blink" style={{ background: "var(--crim-panel)" }} />
              {c.metaTag}
            </span>
          </div>
          <h2 className="f-display leading-[0.95] tracking-wide mt-4 text-[clamp(2.4rem,6vw,4.8rem)]">{c.heading}</h2>
        </Reveal>

        <div className="mt-12 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-16 items-start">
          <Reveal>
            {/* IDENTITY + MANIFESTO — side by side */}
            <div className="grid sm:grid-cols-[auto_1fr] gap-6 sm:gap-10 items-center">
              <div className="relative p-5 sm:p-6 shrink-0" style={{ border: "1.5px solid var(--ct-line)" }}>
                <span className="absolute -top-[5px] -left-[5px] w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "var(--crim-panel)" }} />
                <span className="absolute -bottom-[5px] -right-[5px] w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "var(--crim-panel)" }} />
                <span className="f-mono text-[9px] tracking-[0.3em] block" style={{ color: "var(--ct-sub)" }}>IDENTITY</span>
                <h3 className="f-display text-[clamp(1.5rem,3.6vw,2.8rem)] leading-[1.02] mt-2 whitespace-nowrap" style={{ letterSpacing: "-0.01em" }}>
                  <span style={{ color: "var(--ct-ink)" }}>{c.identityA}</span>{" "}
                  <span style={{ color: "var(--crim-panel)" }}>{c.identityB}</span>
                </h3>
              </div>
              {/* manifesto — clean readable Arial editorial statement, regular weight */}
              <p className="font-normal text-[clamp(1.05rem,1.5vw,1.25rem)] leading-[1.55] max-w-[34ch]"
                style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "var(--ct-ink)", opacity: 0.95 }}>
                {c.statement}
              </p>
            </div>

            <span className="mt-8 block f-mono font-semibold text-[11px] tracking-[0.3em]" style={{ color: "var(--crim-panel)" }}>CHITHAMBARAM BALA KRISHNAN</span>

            {/* graphic-novel information panel — red + white identity is FIXED across both themes */}
            <div className="relative mt-8 p-6 sm:p-7 mat-texture max-w-[640px] overflow-hidden"
              style={{ background: "#f0f8ff", color: "#222328", border: "2.5px solid #222328", boxShadow: "7px 7px 0 #da012d" }}>
              {/* subtle halftone / comic-print dot texture */}
              <span className="absolute inset-0 pointer-events-none" aria-hidden
                style={{ backgroundImage: "radial-gradient(rgba(34,35,40,0.07) 1px, transparent 1px)", backgroundSize: "7px 7px" }} />
              {/* controlled red accent bar */}
              <span className="absolute left-0 top-0 bottom-0 w-[7px]" style={{ background: "#da012d" }} />
              {/* sharp comic-panel corner details */}
              <span className="absolute top-[6px] right-[6px] w-3 h-3 border-t-2 border-r-2" style={{ borderColor: "#222328" }} />
              <span className="absolute bottom-[6px] right-[6px] w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#222328" }} />
              <span className="absolute top-[6px] right-[24px] w-1.5 h-1.5" style={{ background: "#da012d" }} />
              {/* print registration mark */}
              <span className="absolute bottom-[8px] left-[14px] w-2.5 h-2.5 rounded-full border pointer-events-none" aria-hidden
                style={{ borderColor: "rgba(34,35,40,0.4)" }}>
                <span className="absolute left-1/2 top-1/2 w-[130%] h-px -translate-x-1/2 -translate-y-1/2" style={{ background: "rgba(34,35,40,0.35)" }} />
              </span>
              <p className="relative text-[19px] sm:text-[21px] lg:text-[22.5px] leading-relaxed font-semibold pl-2">
                Hey!, I'm Bala Krishnan —<br />
                I make ideas come alive — and you're just in time!
              </p>
              <div className="relative mt-4 pt-3 pl-2" style={{ borderTop: "1.5px solid #222328" }}>
                <span className="glitch-sig f-mono font-bold text-[10.5px] tracking-[0.26em]" style={{ color: "#222328" }}>
                  — WRITTEN BY THE ONE WHO BUILDS THE WORLDS
                </span>
              </div>
            </div>

            <h3 className="f-display text-[clamp(2rem,4.6vw,3.6rem)] leading-[0.98] mt-10">
              <span>{c.closingA}</span> <span style={{ color: "var(--crim-panel)" }}>{c.closingB}</span>
            </h3>

            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${c.email}`}
                className="group inline-flex items-center gap-3 px-5 py-3.5 rounded-lg f-tech font-bold text-[12px] tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5"
                style={{ border: "1.5px solid var(--ct-line)", color: "var(--ct-ink)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--crim-panel)"; e.currentTarget.style.color = "var(--crim-panel)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ct-line)"; e.currentTarget.style.color = "var(--ct-ink)"; }}>
                <MailIcon size={15} strokeWidth={1.8} />
                {c.emailLabel}
              </a>
              {c.socials.map((s) => {
                const icon =
                  s.label === "LINKEDIN" ? <LinkedInIcon size={15} strokeWidth={1.8} /> :
                  s.label === "WHATSAPP" ? <WhatsAppIcon size={15} strokeWidth={1.8} /> :
                  s.label === "INSTAGRAM" ? <InstagramIcon size={15} strokeWidth={1.8} /> :
                  s.label === "ARTSTATION" ? <ArtstationIcon size={15} strokeWidth={1.8} /> :
                  <MailIcon size={15} strokeWidth={1.8} />;
                return (
                  <a key={s.label} href={s.url || "#contact"} target={s.url ? "_blank" : undefined} rel="noreferrer"
                    className="group inline-flex items-center gap-3 px-5 py-3.5 rounded-lg f-tech font-bold text-[12px] tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5"
                    style={{ border: "1.5px solid var(--ct-line)", color: "var(--ct-ink)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--crim-panel)"; e.currentTarget.style.color = "var(--crim-panel)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--ct-line)"; e.currentTarget.style.color = "var(--ct-ink)"; }}>
                    {icon}
                    {s.label}
                  </a>
                );
              })}
            </div>

            <a href={c.resumeUrl || "#contact"} target={c.resumeUrl ? "_blank" : undefined} rel="noreferrer"
              className="btn btn-crimson mt-6 w-full sm:w-auto !py-4 text-[13px]">
              {c.resumeLabel} <ArrowDown size={15} strokeWidth={2.4} />
            </a>
          </Reveal>

          {/* RIGHT — TRUE SQUARE portrait */}
          <Reveal delay={0.1}>
            <div className="relative mat-texture max-w-[520px] w-full mx-auto lg:ml-auto"
              style={{ border: "1.5px solid var(--ct-line)", background: "var(--ct-bg)" }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--ct-line)" }}>
                <span className="f-tech font-bold text-[11px] tracking-[0.28em]">PORTRAIT</span>
                <span className="f-mono text-[9px] tracking-[0.22em]" style={{ color: "var(--ct-sub)" }}>1 : 1 · FRAME</span>
              </div>
              <div className="p-4">
                <MediaSlot item={c.portrait} ratio="1/1" className="!rounded-[4px] !border-0" showLabel={false} onClick={() => setPortraitOpen(true)} />
              </div>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid var(--ct-line)" }}>
                <span className="f-mono text-[9px] tracking-[0.24em]" style={{ color: "var(--crim-panel)" }}>C. BALA KRISHNAN</span>
                <span className="f-tech font-bold text-[10px] tracking-[0.24em]" style={{ color: "var(--ct-sub)" }}>PORTRAIT</span>
              </div>
              <span className="absolute top-12 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "var(--crim-panel)" }} />
              <span className="absolute bottom-12 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "var(--crim-panel)" }} />
            </div>
          </Reveal>
        </div>
      </div>

      {portraitOpen && (
        <FullscreenViewer items={[c.portrait]} index={0} ratio="1/1" onClose={() => setPortraitOpen(false)} setIndex={() => undefined} />
      )}
    </section>
  );
}

/* ================= FOOTER ================= */
export function Footer() {
  const [, nav] = useHashRoute();
  return (
    <footer className="border-t border-[var(--line)] py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-wrap items-center gap-x-8 gap-y-3 f-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">
        <span>© 2026 C. BALA KRISHNAN</span>
        <span className="hidden sm:inline">DESIGNFOLIO — BUILT AS A SYSTEM</span>
        <button onClick={() => nav("#/edit")} className="hover:text-[var(--crimson)] transition-colors duration-300">EDIT</button>
        <a href="#about" className="ml-auto flex items-center gap-2 hover:text-[var(--crimson)] transition-colors duration-300">
          BACK TO TOP <ArrowRight size={13} strokeWidth={2.2} className="-rotate-90" />
        </a>
      </div>
    </footer>
  );
}
