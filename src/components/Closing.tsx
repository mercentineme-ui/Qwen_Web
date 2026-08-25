import React, { useEffect, useRef, useState } from "react";
import { useHashRoute, useReducedMotion, useStore } from "../lib/store";
import { ArrowDown, ArrowRight, ArrowUp, LinkedInIcon, PaperPlane, Rune } from "./icons";
import { MediaSlot, Reveal, SectionHead } from "./ui";

/* ================= 06 — HOW I BUILD / THE PIPELINE =================
   THREE PHASES INSIDE ONE LARGE PANEL — the mailbox is ONE persistent
   object: PHASE 1 (closed, hover half-opens, click) → PHASE 2 (door open,
   tiny plane emerges and GROWS across the flight revealing the nodes) →
   KNOW MORE → comic glitch → PHASE 3 (comic production archive).       */

function Mailbox({ door, onClick }: { door: "closed" | "half" | "open"; onClick?: () => void }) {
  const deg = door === "open" ? 74 : door === "half" ? 36 : 0;
  return (
    <button type="button" onClick={onClick} disabled={!onClick} aria-label={door === "closed" ? "Open the mailbox" : "Mailbox"}
      className={`relative select-none shrink-0 ${onClick ? "cursor-pointer group" : "cursor-default"}`}
      style={{ width: 190 }}>
      <svg viewBox="0 0 200 190" className="w-full" fill="none">
        <ellipse cx="100" cy="176" rx="70" ry="9" fill="#222328" opacity="0.22" />
        {/* post — isometric */}
        <path d="M92 118 L108 118 L108 172 L92 172 Z" fill="#3C3D42" stroke="#59595B" strokeWidth="1.5" />
        <path d="M108 118 L118 112 L118 166 L108 172 Z" fill="#222328" stroke="#59595B" strokeWidth="1.5" />
        {/* body */}
        <path d="M38 62 L58 48 L162 48 L142 62 Z" fill="#59595B" stroke="#A6A6A4" strokeWidth="1.4" />
        <path d="M38 62 L142 62 L142 118 L38 118 Z" fill="#3C3D42" stroke="#59595B" strokeWidth="1.6" />
        <path d="M142 62 L162 48 L162 104 L142 118 Z" fill="#222328" stroke="#59595B" strokeWidth="1.6" />
        <path d="M52 62 V118 M128 62 V118" stroke="#222328" strokeWidth="2" opacity="0.6" />
        {/* dark mouth revealed behind the door */}
        <rect x="58" y="76" width="66" height="30" fill="#222328" opacity={door === "closed" ? 0 : 0.9} style={{ transition: "opacity .4s ease" }} />
        {door === "open" && <path d="M70 84 l16 -7 16 7 -16 6 z" fill="#E72241" stroke="#9E2237" strokeWidth="1.2" />}
        {/* door — flips down from the right hinge; hover = HALF open */}
        <g style={{ transformOrigin: "128px 78px", transform: `rotate(${deg}deg)`, transition: "transform .55s cubic-bezier(.4,.8,.3,1)" }}>
          <rect x="54" y="72" width="74" height="38" rx="3" fill="#222328" stroke="#A6A6A4" strokeWidth="1.6" />
          <rect x="60" y="78" width="62" height="26" rx="2" fill="none" stroke="#59595B" strokeWidth="1.2" />
          <circle cx="120" cy="91" r="4" fill="#CEB1AB" stroke="#A6A6A4" strokeWidth="1.2" />
        </g>
        {/* slot */}
        <rect x="62" y="56" width="58" height="5" rx="2" fill="#222328" />
        {/* flag — rises once open */}
        <g style={{ transform: door === "open" ? "translateY(-6px)" : "translateY(0)", transition: "transform .4s ease .15s" }}>
          <rect x="150" y="58" width="4" height="26" fill="#59595B" />
          <path d="M154 58 h20 l-5 6 5 6 h-20 z" fill="#E72241" stroke="#9E2237" strokeWidth="1.2" />
        </g>
      </svg>
      {door !== "open" && onClick && (
        <span className="absolute -right-3 sm:-right-7 top-1 rotate-6 f-display text-[15px] sm:text-[17px] tracking-wide px-3 py-1.5 bg-[#DDDDD8] text-[#222328] border-2 border-[#222328] shadow-[4px_4px_0_#222328] group-hover:rotate-3 group-hover:-translate-y-0.5 transition-transform duration-300">
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
  const [flight, setFlight] = useState(600);
  const [litN, setLitN] = useState(0); /* checkpoints lit as the plane passes */
  const lineRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const openMailbox = () => {
    if (phase !== 1) return;
    setPhase(2);
    requestAnimationFrame(() => {
      const w = lineRef.current?.getBoundingClientRect().width;
      if (w) setFlight(w - 150); /* the plane lands at the KNOW MORE dock, clear of DEVELOPMENT */
    });
    if (reduced) { setPlaneDone(true); setLitN(4); return; }
    /* timed to the straight-flight curve — the rail lights as the plane passes */
    [450, 1000, 1550, 1900].forEach((t, k) =>
      timers.current.push(window.setTimeout(() => setLitN(k + 1), t)));
    timers.current.push(window.setTimeout(() => { setPlaneDone(true); setLitN(4); }, 2850));
  };
  const knowMore = () => {
    if (reduced) { setPhase(3); return; }
    setGlitching(true);
    timers.current.push(window.setTimeout(() => { setGlitching(false); setPhase(3); }, 640));
  };
  const replay = () => { setPhase(1); setPlaneDone(false); setGlitching(false); setLitN(0); };

  return (
    <section id="pipeline" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="06 — HOW I BUILD"
          titleNode={<>THE <span className="text-[var(--crimson)]">PIPELINE</span></>}
          desc={b.support}
          meta={`PHASE ${String(phase).padStart(2, "0")} / 03`}
        />
        <p className="mt-4 f-mono text-[11px] sm:text-[12px] tracking-[0.18em] text-[var(--ink2)]">{b.visibleNote}</p>

        {/* ================= ONE LARGE PIPELINE PANEL — all three phases live inside ================= */}
        <Reveal className="mt-10">
          <div className={`mat-outer mat-texture rounded-xl p-6 sm:p-10 relative overflow-hidden ${glitching ? "shake-hard" : ""}`}>
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--crimson)]" />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--crimson)]" />
            <span className="f-mono text-[10px] tracking-[0.3em] text-[var(--crimson)]">
              PHASE {String(phase).padStart(2, "0")} — {phase === 1 ? "THE DROP" : phase === 2 ? "THE FLIGHT" : "BEYOND"}
            </span>

            {phase < 3 ? (
              <div className={`mt-8 ${glitching ? "collapse-out" : ""}`}>
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
                  {/* THE mailbox — same object through Phase 1 → Phase 2 */}
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
                      <span className="mt-6 inline-flex items-center gap-3 f-tech font-bold text-[12px] tracking-[0.22em] text-[var(--crimson)] live-blink">
                        <span className="w-2 h-2 rotate-45 bg-[var(--crimson)]" /> CLICK THE MAILBOX
                      </span>
                    </div>
                  ) : (
                    /* ---- PHASE 2 — ONE continuous journey: mailbox → paper plane →
                       01 IDEA → 02 REFERENCE → 03 CONCEPT → 04 DEVELOPMENT → KNOW MORE.
                       Segmented rail with joints + directional marks, no red timeline. ---- */
                    <>
                    <div ref={lineRef} className="relative flex-1 h-44 w-full min-w-0">
                      {/* ONE straight horizontal mechanical rail — begins at the plane origin,
                         travels through all four stages and TERMINATES at the KNOW MORE dock.
                         No line continues beyond it. */}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden sm:block" style={{ right: 150 }}>
                        {/* sleeper ticks under the rail */}
                        <span className="absolute inset-x-0 top-[8px] h-[3px] opacity-30"
                          style={{ background: "repeating-linear-gradient(90deg, #A6A6A4 0 2px, transparent 2px 16px)" }} />
                        {/* the rail itself */}
                        <span className="absolute inset-x-0 top-0 h-[4px] rounded-[2px]" style={{ background: "#59595B" }} />
                        {/* dashed guide hairline above */}
                        <span className="absolute inset-x-0 -top-[7px] h-px opacity-50"
                          style={{ background: "repeating-linear-gradient(90deg, #A6A6A4 0 10px, transparent 10px 24px)" }} />
                        {/* crimson progress — extends exactly as far as the plane has flown */}
                        <span className="absolute left-0 top-0 h-[4px] rounded-[2px]"
                          style={{
                            width: `${((planeDone || reduced ? 4 : litN) / 4) * 100}%`,
                            background: "#E72241",
                            transition: reduced ? "none" : "width .7s cubic-bezier(.4,.4,.4,1)",
                          }} />
                        {/* directional chevrons along the run */}
                        {[19.5, 41, 58.5].map((cx, k) => (
                          <svg key={k} className="absolute -top-[5px]" style={{ left: `${cx}%` }} width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden>
                            <path d="M2 2 L8 7 L2 12"
                              stroke={(planeDone || reduced ? 4 : litN) * 25 > cx ? "#E72241" : "#A6A6A4"}
                              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "stroke .5s ease" }} />
                          </svg>
                        ))}
                        {/* terminal stopper — the rail ENDS here, at the dock */}
                        <span className={`absolute -right-[3px] top-1/2 -translate-y-1/2 w-[7px] h-7 rounded-[2px] ${planeDone && !reduced ? "live-blink" : ""}`}
                          style={{ background: planeDone ? "#E72241" : "#59595B", transition: "background .5s ease" }} />
                      </div>

                      {/* checkpoints — compact mechanical modules hanging off the straight rail */}
                      {b.nodes.map((nd, i) => {
                        const stage = planeDone || reduced ? 5 : litN; /* stages passed so far */
                        const isCurrent = i === stage - 1;             /* ONLY the current checkpoint is active */
                        const isPassed = i < stage - 1;
                        const above = i % 2 === 0;
                        const moduleBox = (
                          <div className="relative px-3.5 py-2 text-center mat-texture dossier-clip-sm"
                            style={{
                              background: isCurrent ? "#3C3D42" : "var(--outer-bg)",
                              boxShadow: `inset 0 0 0 1.5px ${isCurrent ? "#E72241" : isPassed ? "rgba(231,34,65,0.4)" : "rgba(221,221,216,0.22)"}`,
                              transform: isCurrent && !reduced ? "translateY(-2px)" : "none",
                              transition: "box-shadow .4s ease, background .4s ease, transform .4s ease",
                            }}>
                            <span className={`absolute top-1 right-1.5 w-1.5 h-1.5 rounded-full ${isCurrent ? "bg-[#E72241] live-blink" : ""}`}
                              style={isCurrent ? undefined : { background: isPassed ? "rgba(231,34,65,0.55)" : "rgba(221,221,216,0.25)" }} />
                            <span className="f-mono text-[9px] tracking-[0.2em] block" style={{ color: isCurrent ? "#E72241" : isPassed ? "var(--outer-ink)" : "var(--m-sub)" }}>{nd.num}</span>
                            <span className="f-tech font-bold text-[11px] sm:text-[12.5px] tracking-[0.16em] block mt-0.5 whitespace-nowrap"
                              style={{ color: "var(--outer-ink)", opacity: isCurrent || planeDone || reduced ? 1 : isPassed ? 0.7 : 0.85 }}>
                              {nd.title}
                            </span>
                          </div>
                        );
                        const strut = (
                          <span className="w-[3px] rounded" style={{ height: 10, background: isCurrent ? "#E72241" : isPassed ? "rgba(231,34,65,0.45)" : "#59595B", transition: "background .4s ease" }} />
                        );
                        /* diamond foot doubles as the rail joint */
                        const foot = (
                          <span className="w-[11px] h-[11px] rotate-45"
                            style={{
                              background: isCurrent ? "#E72241" : isPassed ? "rgba(231,34,65,0.6)" : "#3C3D42",
                              border: "1px solid #A6A6A4",
                              transition: "background .5s ease",
                            }} />
                        );
                        return (
                          <div key={nd.num}
                            className="absolute flex flex-col items-center pop-in"
                            style={{
                              left: `${[12, 31, 51, 66][i % 4]}%`,
                              top: "50%",
                              "--pop-t": above ? "translate(-50%, calc(-100% - 2px))" : "translate(-50%, 2px)",
                              animationDelay: reduced ? "0s" : `${0.3 + i * 0.55}s`,
                            } as React.CSSProperties}>
                            {above ? (<>{moduleBox}{strut}{foot}</>) : (<>{foot}{strut}{moduleBox}</>)}
                          </div>
                        );
                      })}

                      {/* red paper plane — starts tiny at the mailbox, GROWS along the track */}
                      {!planeDone && !reduced && (
                        <span className="absolute top-1/2 left-0 plane-cross" style={{ "--flight": `${flight}px` } as React.CSSProperties}>
                          <PaperPlane size={34} className="text-[#E72241]" />
                        </span>
                      )}

                      {/* KNOW MORE — separate final destination at the far right (desktop) */}
                      <div className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 flex-col items-center node-pop"
                        style={{ animationDelay: reduced ? "0s" : "0.2s" }}>
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
                        <span className="w-[3px] h-3 rounded" style={{ background: "#59595B" }} />
                        <span className="w-4 h-[3px] rounded" style={{ background: "#59595B" }} />
                      </div>
                    </div>

                    {/* mobile dock — KNOW MORE ends the journey below the rail,
                        never colliding with DEVELOPMENT on narrow widths */}
                    <div className="sm:hidden mt-4 flex justify-end node-pop" style={{ animationDelay: reduced ? "0s" : "0.2s" }}>
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
                    </>
                  )}
                </div>
                <p className="mt-8 f-mono text-[9px] tracking-[0.26em]" style={{ color: "var(--m-sub)" }}>
                  {phase === 1
                    ? "HOVER — THE DOOR CRACKS OPEN · CLICK — PHASE 02"
                    : planeDone ? "THE PLANE LANDED — TAKE THE NEXT STEP" : "THE PLANE IS IN THE AIR…"}
                </p>
              </div>
            ) : (
              /* ================= PHASE 03 — COMIC PRODUCTION PAGE (same panel) =================
                 Enters with a print mis-register: displacement → stepped jitter →
                 rough crimson offset → square panel snaps → bubble settles. */
              <div className="mt-6 comic-in relative rounded-xl border-4 p-6 sm:p-8 overflow-hidden"
                style={{
                  borderColor: "#222328",
                  background: "#DDDDD8",
                  backgroundImage: "radial-gradient(rgba(34,35,40,0.14) 1px, transparent 1.4px)",
                  backgroundSize: "11px 11px",
                  boxShadow: "10px 10px 0 #9E2237, 18px 18px 0 #59232F",
                  color: "#222328",
                }}>
                {/* halftone flash — misregistered print layers settling */}
                {!reduced && (
                  <span className="comic-flash absolute inset-0 pointer-events-none z-20"
                    style={{ backgroundImage: "radial-gradient(rgba(158,34,55,0.5) 1.2px, transparent 1.6px)", backgroundSize: "7px 7px" }} />
                )}
                <span className="absolute top-3 left-4 f-mono text-[9px] tracking-[0.3em] text-[#9E2237]">PHASE 03 — BEYOND</span>
                <span className="absolute top-3 right-4 f-mono text-[9px] tracking-[0.3em]" style={{ color: "rgba(34,35,40,0.5)" }}>PANEL 615-B</span>

                <div className="grid lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)] gap-10 lg:gap-14 items-start mt-5">
                  {/* LEFT — speech bubble + TRUE SQUARE comic media frame */}
                  <div className="relative min-w-0 mx-auto lg:mx-0 w-full max-w-[430px]">
                    {/* comic speech bubble — irregular border, wobble, printed offset, tail */}
                    <div className="bubble-settle relative z-10 mb-[-16px] ml-1 sm:ml-4 w-[92%] px-5 py-4 bg-[#DDDDD8]"
                      style={{
                        border: "3px solid #222328",
                        borderRadius: "255px 18px 225px 18px / 18px 225px 18px 255px",
                        boxShadow: "5px 5px 0 #9E2237, 9px 9px 0 rgba(89,35,47,0.55)",
                      }}>
                      <p className="f-tech font-bold text-[14px] sm:text-[15.5px] leading-snug">{b.bubble}</p>
                      <svg className="absolute -bottom-[18px] left-12" width="36" height="21" viewBox="0 0 36 21" aria-hidden>
                        <path d="M1 0 H35 L13 20 Z" fill="#9E2237" transform="translate(3 3)" opacity="0.6" />
                        <path d="M0 0 H34 L12 20 Z" fill="#DDDDD8" stroke="#222328" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M4 0 H30 L12 15 Z" fill="#DDDDD8" />
                      </svg>
                    </div>

                    {/* SQUARE 1:1 frame — warm paper, dark structure, rough crimson offset,
                        registration marks + halftone, imperfect print construction */}
                    <div className="relative border-4 border-[#222328] bg-[#DDDDD8] shadow-[8px_8px_0_#9E2237,15px_15px_0_#59232F]"
                      style={{ transform: "rotate(-0.6deg)" }}>
                      <MediaSlot item={b.reveal.image} ratio="1/1" className="!rounded-none !border-0 !bg-[#C3C1BC]" showLabel={false} />
                      {/* halftone wash over the paper */}
                      <span className="absolute inset-0 pointer-events-none opacity-40"
                        style={{ backgroundImage: "radial-gradient(rgba(34,35,40,0.22) 1px, transparent 1.3px)", backgroundSize: "6px 6px" }} />
                      {/* misregistered duplicate edge */}
                      <span className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 3px 3px 0 rgba(158,34,55,0.28)" }} />
                      {/* registration crop marks */}
                      <span className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#222328]" />
                      <span className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#222328]" />
                      <span className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#222328]" />
                      <span className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#222328]" />
                      <span className="absolute top-2 left-2 f-mono text-[8px] tracking-[0.26em] px-2 py-1 bg-[#222328] text-[#DDDDD8]">UPLOAD SPACE</span>
                      <span className="absolute bottom-2 right-2 f-mono text-[8px] tracking-[0.26em] px-2 py-1 bg-[#9E2237] text-[#DDDDD8]">SQUARE · 1:1</span>
                    </div>
                  </div>

                  {/* RIGHT — continuation copy + narrator card */}
                  <div className="min-w-0">
                    <span className="block f-mono text-[9px] tracking-[0.3em]" style={{ color: "rgba(34,35,40,0.6)" }}>CONTINUED FROM PAGE 615</span>
                    <span className="block f-mono text-[10px] tracking-[0.32em] text-[#9E2237] mt-1.5">BEYOND THE FOUR NODES</span>
                    <h3 className="f-display leading-[0.98] mt-4 text-[clamp(2rem,4.4vw,3.4rem)]">
                      {b.reveal.heading}{" "}
                      <span className="text-[#9E2237]" style={{ textShadow: "2px 2px 0 rgba(89,35,47,0.4)" }}>{b.reveal.headingAccent}</span>
                    </h3>
                    {/* narrator card */}
                    <div className="mt-6 relative border-2 border-[#222328] bg-[#CEB1AB] p-5 shadow-[6px_6px_0_#9E2237]">
                      <span className="absolute -top-2.5 left-4 f-mono text-[8px] tracking-[0.3em] px-2 py-0.5 bg-[#9E2237] text-[#DDDDD8]">NARRATOR</span>
                      <p className="text-[15px] sm:text-[16px] leading-relaxed font-medium text-[#222328]">{b.reveal.narrator}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center gap-5">
                      <button onClick={replay}
                        className="inline-flex items-center gap-3 f-tech font-bold text-[11px] tracking-[0.24em] px-4 py-3 rounded-lg border-2 border-[#222328] shadow-[4px_4px_0_#9E2237] hover:bg-[#222328] hover:text-[#DDDDD8] hover:shadow-[2px_2px_0_#9E2237] transition-all duration-300">
                        ↻ RUN IT AGAIN
                      </button>
                      <span className="f-mono text-[8.5px] tracking-[0.3em]" style={{ color: "rgba(34,35,40,0.55)" }}>
                        H8 · ISSUE 01 · END OF PAGE
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {/* the one rune lives here — neutral, crimson on hover */}
        <div className="mt-8 flex justify-center">
          <span className="group cursor-default">
            <Rune size={34} className="text-[var(--ink2)] group-hover:text-[var(--crimson)] transition-colors duration-300" />
          </span>
        </div>
      </div>
    </section>
  );
}

/* ================= 08 — CONTACT — dark cinematic final transmission ================= */

export function Contact() {
  const { data } = useStore();
  const c = data.contact;

  return (
    <section id="contact" className="relative py-20 lg:py-28 scroll-mt-20 mat-texture overflow-hidden"
      style={{ backgroundColor: "#222328", color: "#DDDDD8" }}>
      {/* faint technical structures — nothing competing */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
        <defs>
          <pattern id="ct-grid" width="64" height="64" patternUnits="userSpaceOnUse">
            <path d="M64 0H0V64" fill="none" stroke="rgba(221,221,216,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ct-grid)" />
      </svg>
      <span className="absolute top-8 left-8 w-5 h-5 border-t-2 border-l-2 opacity-40" style={{ borderColor: "#E72241" }} />
      <span className="absolute bottom-8 right-8 w-5 h-5 border-b-2 border-r-2 opacity-40" style={{ borderColor: "#E72241" }} />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 relative">
        {/* header row */}
        <Reveal>
          <div className="flex items-center justify-between gap-6">
            <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.26em] inline-flex items-center gap-2.5 px-3 py-2 rounded-[6px]"
              style={{ border: "1px solid rgba(221,221,216,0.25)" }}>
              <span className="text-[#E72241] font-semibold">08</span>
              <span className="text-[#E72241]">—</span>
              <span>CONTACT</span>
            </span>
            <span className="f-mono text-[10px] tracking-[0.3em] hidden sm:flex items-center gap-2.5" style={{ color: "#A6A6A4" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E72241] live-blink" />
              {c.metaTag}
            </span>
          </div>
          <h2 className="f-display leading-[0.95] tracking-wide mt-4 text-[clamp(2.4rem,6vw,4.8rem)]">CONTACT</h2>
        </Reveal>

        {/* main composition — identity column (larger portrait) + center content + negative space */}
        <div className="mt-12 grid lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)_120px] gap-10 lg:gap-14 items-start">
          {/* ---------- LEFT — identity + portrait + resume ---------- */}
          <Reveal>
            {/* technical outlined identity frame */}
            <div className="relative p-6" style={{ border: "1.5px solid #59595B" }}>
              <span className="absolute -top-[5px] -left-[5px] w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "#E72241" }} />
              <span className="absolute -bottom-[5px] -right-[5px] w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#E72241" }} />
              <span className="f-mono text-[9px] tracking-[0.3em] block" style={{ color: "#A6A6A4" }}>IDENTITY</span>
              <h3 className="f-display text-[clamp(3.1rem,5vw,4.4rem)] leading-[0.98] mt-2 whitespace-nowrap">
                <span style={{ color: "#DDDDD8" }}>{c.identityA}</span>{" "}
                <span style={{ color: "#E72241" }}>{c.identityB}</span>
              </h3>
            </div>

            {/* large vertical 9:16 portrait upload frame */}
            <div className="relative mt-6 mat-texture" style={{ border: "1.5px solid #59595B", background: "#222328" }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(221,221,216,0.18)" }}>
                <span className="f-tech font-bold text-[11px] tracking-[0.28em]">PORTRAIT</span>
                <span className="f-mono text-[9px] tracking-[0.22em]" style={{ color: "#A6A6A4" }}>9 : 16 · FRAME</span>
              </div>
              <div className="p-4">
                <MediaSlot item={c.portrait} ratio="9/16" className="!rounded-[4px] !border-0" showLabel={false} />
              </div>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid rgba(221,221,216,0.18)" }}>
                <span className="f-mono text-[9px] tracking-[0.24em]" style={{ color: "#CEB1AB" }}>C. BALA KRISHNAN</span>
                <span className="f-tech font-bold text-[10px] tracking-[0.24em]" style={{ color: "#A6A6A4" }}>PORTRAIT</span>
              </div>
              <span className="absolute top-10 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: "#E72241" }} />
              <span className="absolute bottom-10 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: "#E72241" }} />
            </div>

            {/* resume — large crimson button */}
            <a href={c.resumeUrl || "#contact"} target={c.resumeUrl ? "_blank" : undefined} rel="noreferrer"
              className="btn btn-crimson w-full mt-6 !py-4 text-[13px]">
              {c.resumeLabel} <ArrowDown size={15} strokeWidth={2.4} />
            </a>
          </Reveal>

          {/* ---------- CENTER — statement + message + build + channels ---------- */}
          <Reveal delay={0.1}>
            <p className="text-[15px] sm:text-[17px] lg:text-[18.5px] leading-relaxed font-semibold tracking-[0.04em] max-w-[46ch]" style={{ color: "#DDDDD8" }}>
              {c.statement}
            </p>

            {/* warm matte-white message card with crimson strip */}
            <div className="relative mt-9 p-6 sm:p-7 mat-texture"
              style={{ background: "#DDDDD8", color: "#222328", boxShadow: "8px 8px 0 #E72241" }}>
              <span className="absolute left-0 top-0 bottom-0 w-[6px]" style={{ background: "#E72241" }} />
              <p className="text-[14.5px] sm:text-[16px] leading-relaxed font-medium pl-2">{c.message}</p>
              <span className="mt-4 block f-mono text-[9px] tracking-[0.26em] pl-2" style={{ color: "#59595B" }}>{c.signature}</span>
            </div>

            <h3 className="f-display text-[clamp(2rem,4.6vw,3.6rem)] leading-[0.98] mt-10">
              <span style={{ color: "#DDDDD8" }}>{c.closingA}</span>{" "}
              <span style={{ color: "#E72241" }}>{c.closingB}</span>
            </h3>

            {/* contact controls — technical rectangular buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={`mailto:${c.email}`}
                className="group inline-flex items-center gap-3 px-5 py-3.5 rounded-lg f-tech font-bold text-[12px] tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5"
                style={{ border: "1.5px solid #59595B", color: "#DDDDD8" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E72241"; e.currentTarget.style.color = "#E72241"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#59595B"; e.currentTarget.style.color = "#DDDDD8"; }}>
                {c.emailLabel}
                <ArrowRight size={14} strokeWidth={2.2} />
              </a>
              {c.socials.map((s) => (
                <a key={s.label} href={s.url || "#contact"} target={s.url ? "_blank" : undefined} rel="noreferrer"
                  className="group inline-flex items-center gap-3 px-5 py-3.5 rounded-lg f-tech font-bold text-[12px] tracking-[0.2em] transition-all duration-300 hover:-translate-y-0.5"
                  style={{ border: "1.5px solid #59595B", color: "#DDDDD8" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#E72241"; e.currentTarget.style.color = "#E72241"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#59595B"; e.currentTarget.style.color = "#DDDDD8"; }}>
                  {s.label === "LINKEDIN" ? <LinkedInIcon size={13} /> : s.label}
                  <ArrowRight size={14} strokeWidth={2.2} />
                </a>
              ))}
            </div>
          </Reveal>

          {/* ---------- RIGHT — negative space with faint structures ---------- */}
          <div className="hidden lg:flex flex-col items-center gap-5 pt-6 opacity-30" aria-hidden>
            <span className="w-px h-28" style={{ background: "linear-gradient(#59595B, transparent)" }} />
            <span className="f-mono text-[9px] tracking-[0.4em]" style={{ color: "#A6A6A4", writingMode: "vertical-rl" }}>
              SIGNAL // OPEN CHANNEL
            </span>
            {[0, 1, 2].map((k) => (
              <span key={k} className="w-2.5 h-2.5 rotate-45 border" style={{ borderColor: "#59595B" }} />
            ))}
            <span className="w-px h-28" style={{ background: "linear-gradient(transparent, #59595B)" }} />
          </div>
        </div>
      </div>
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
          BACK TO TOP <ArrowUp size={13} strokeWidth={2.2} />
        </a>
      </div>
    </footer>
  );
}
