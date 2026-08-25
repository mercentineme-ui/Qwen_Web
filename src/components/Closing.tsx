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
      if (w) setFlight(w - 168); /* the plane lands at the KNOW MORE dock, clear of DEVELOPMENT */
    });
    if (reduced) { setPlaneDone(true); setLitN(4); return; }
    [550, 1080, 1480, 1920].forEach((t, k) =>
      timers.current.push(window.setTimeout(() => setLitN(k + 1), t)));
    timers.current.push(window.setTimeout(() => { setPlaneDone(true); setLitN(4); }, 2680));
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
                      <p className="mt-4 max-w-[52ch] text-[14px] leading-relaxed" style={{ color: "var(--m-sub)" }}>
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
                    <div ref={lineRef} className="relative flex-1 h-44 w-full min-w-0">
                      {/* segmented mechanical rail — dashed travel path, joints at every checkpoint,
                         the crimson overlay extends segment-by-segment as the plane passes */}
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 176" preserveAspectRatio="none" aria-hidden>
                        <polyline points="0,88 140,62 330,112 520,66 680,108 1000,88" fill="none"
                          stroke="#59595B" strokeWidth="3" strokeDasharray="16 10" strokeLinecap="round" />
                        <polyline points="0,88 140,62 330,112 520,66 680,108 1000,88" fill="none"
                          stroke="#A6A6A4" strokeWidth="1" strokeDasharray="3 9" opacity="0.5" transform="translate(0 -6)" />
                        {/* restrained crimson active segments — only what the plane has covered */}
                        <polyline points="0,88 140,62 330,112 520,66 680,108 1000,88" fill="none"
                          stroke="#E72241" strokeWidth="3" strokeLinecap="round" pathLength={100}
                          strokeDasharray={`${((planeDone || reduced ? 5 : litN) / 5) * 100} 100`}
                          style={{ transition: reduced ? "none" : "stroke-dasharray .7s cubic-bezier(.4,.4,.4,1)" }} />
                        {/* mechanical joints at each checkpoint + directional chevrons */}
                        {[[140, 62], [330, 112], [520, 66], [680, 108]].map(([jx, jy], k) => (
                          <g key={k}>
                            <rect x={jx - 5} y={jy - 5} width="10" height="10" transform={`rotate(45 ${jx} ${jy})`}
                              fill={(planeDone || reduced ? 5 : litN) > k ? "#E72241" : "#3C3D42"} stroke="#A6A6A4" strokeWidth="1"
                              style={{ transition: "fill .5s ease" }} />
                            <circle cx={jx} cy={jy} r="1.8" fill="#DDDDD8" opacity="0.8" />
                          </g>
                        ))}
                        {[[70, 76], [425, 90], [600, 88], [840, 98]].map(([cxp, cyp], k) => (
                          <path key={k} d={`M${cxp} ${cyp - 6} L${cxp + 9} ${cyp} L${cxp} ${cyp + 6}`} fill="none"
                            stroke={(planeDone || reduced ? 5 : litN) * 20 > cxp / 10 ? "#E72241" : "#A6A6A4"} strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round" opacity="0.8" style={{ transition: "stroke .5s ease" }} />
                        ))}
                      </svg>

                      {/* checkpoints — compact mechanical modules hanging off the rail joints */}
                      {b.nodes.map((nd, i) => {
                        const stage = planeDone || reduced ? 5 : litN; /* stages passed so far */
                        const isCurrent = i === stage - 1;             /* ONLY the current checkpoint is active */
                        const isPassed = i < stage - 1;
                        const topPct = [35, 64, 37, 61][i % 4];
                        const above = topPct < 50;
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
                        const foot = (
                          <span className="w-4 h-[3px] rounded" style={{ background: isCurrent ? "#E72241" : isPassed ? "rgba(231,34,65,0.45)" : "#59595B", transition: "background .4s ease" }} />
                        );
                        return (
                          <div key={nd.num}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center node-pop"
                            style={{ left: `${[14, 33, 52, 68][i % 4]}%`, top: `${topPct}%`, animationDelay: reduced ? "0s" : `${0.3 + i * 0.55}s` }}>
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

                      {/* KNOW MORE — separate final destination at the far right */}
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col items-center node-pop"
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
                  )}
                </div>
                <p className="mt-8 f-mono text-[9px] tracking-[0.26em]" style={{ color: "var(--m-sub)" }}>
                  {phase === 1
                    ? "HOVER — THE DOOR CRACKS OPEN · CLICK — PHASE 02"
                    : planeDone ? "THE PLANE LANDED — TAKE THE NEXT STEP" : "THE PLANE IS IN THE AIR…"}
                </p>
              </div>
            ) : (
              /* ================= PHASE 03 — COMIC PRODUCTION ARCHIVE (same panel) ================= */
              <div className="mt-6 reveal-in relative rounded-xl border-4 p-6 sm:p-10 overflow-hidden"
                style={{
                  borderColor: "#222328",
                  background: "#DDDDD8",
                  backgroundImage: "radial-gradient(rgba(34,35,40,0.16) 1px, transparent 1.4px)",
                  backgroundSize: "12px 12px",
                  boxShadow: "10px 10px 0 #222328",
                  color: "#222328",
                }}>
                <span className="absolute top-3 left-4 f-mono text-[9px] tracking-[0.3em] text-[#9E2237]">PHASE 03 — BEYOND</span>
                <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-start mt-4">
                  {/* LEFT — speech bubble + VERTICAL empty upload frame */}
                  <div className="relative min-w-0">
                    <div className="relative z-10 mb-[-14px] ml-2 sm:ml-6 w-[88%] rounded-[18px] border-[3px] border-[#222328] bg-[#DDDDD8] px-5 py-4 -rotate-1 shadow-[5px_5px_0_#E72241,9px_9px_0_#222328]">
                      <p className="f-tech font-bold text-[14px] sm:text-[15.5px] leading-snug">{b.bubble}</p>
                      <svg className="absolute -bottom-[17px] left-10" width="34" height="20" viewBox="0 0 34 20">
                        <path d="M0 0 H34 L12 20 Z" fill="#DDDDD8" stroke="#222328" strokeWidth="3" strokeLinejoin="round" />
                        <path d="M3 0 H31 L12 16 Z" fill="#DDDDD8" />
                      </svg>
                    </div>
                    <div className="relative border-4 border-[#222328] bg-[#C3C1BC] shadow-[8px_8px_0_#E72241,14px_14px_0_#59232F]">
                      <MediaSlot item={b.reveal.image} ratio="3/5.4" className="!rounded-none !border-0" showLabel={false} />
                      <span className="absolute top-2 left-2 f-mono text-[8px] tracking-[0.26em] px-2 py-1 bg-[#222328] text-[#DDDDD8]">UPLOAD SPACE</span>
                      <span className="absolute bottom-2 right-2 f-mono text-[8px] tracking-[0.26em] px-2 py-1 bg-[#E72241] text-[#DDDDD8]">VERTICAL FRAME</span>
                    </div>
                  </div>

                  {/* RIGHT — continuation copy + narrator card */}
                  <div className="min-w-0">
                    <span className="block f-mono text-[9px] tracking-[0.3em]" style={{ color: "rgba(34,35,40,0.6)" }}>CONTINUED FROM PAGE 615</span>
                    <span className="block f-mono text-[10px] tracking-[0.32em] text-[#E72241] mt-1.5">BEYOND THE FOUR NODES</span>
                    <h3 className="f-display leading-[0.98] mt-4 text-[clamp(2rem,4.4vw,3.4rem)]">
                      {b.reveal.heading}{" "}
                      <span className="text-[#E72241]">{b.reveal.headingAccent}</span>
                    </h3>
                    {/* narrator card */}
                    <div className="mt-6 relative border-2 border-[#222328] bg-[#CEB1AB] p-5 shadow-[6px_6px_0_#E72241]">
                      <span className="absolute -top-2.5 left-4 f-mono text-[8px] tracking-[0.3em] px-2 py-0.5 bg-[#E72241] text-[#DDDDD8]">NARRATOR</span>
                      <p className="text-[14.5px] sm:text-[16px] leading-relaxed font-medium text-[#222328]">{b.reveal.narrator}</p>
                    </div>
                    <div className="mt-8 flex flex-wrap items-center gap-5">
                      <button onClick={replay}
                        className="inline-flex items-center gap-3 f-tech font-bold text-[11px] tracking-[0.24em] px-4 py-3 rounded-lg border-2 border-[#222328] shadow-[4px_4px_0_#E72241] hover:bg-[#222328] hover:text-[#DDDDD8] hover:shadow-[2px_2px_0_#E72241] transition-all duration-300">
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
