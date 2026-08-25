import React, { useEffect, useRef, useState } from "react";
import { useHashRoute, useReducedMotion, useStore } from "../lib/store";
import { ArrowRight, ArrowUp, LinkedInIcon, PaperPlane, Rune } from "./icons";
import { MediaSlot, Reveal, SectionHead, useInView } from "./ui";

/* ================= 06 — HOW I BUILD / THE PIPELINE =================
   THREE PHASES:
   01 mailbox (OPEN ME) → 02 paper flight reveals the four nodes → KNOW MORE
   → comic-glitch → 03 comic panel                                        */

function Mailbox({ open, onClick, small }: { open: boolean; onClick?: () => void; small?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} aria-label={open ? "Mailbox — open" : "Open the mailbox"}
      className={`relative select-none ${onClick ? "cursor-pointer group" : "cursor-default"}`}
      style={{ width: small ? 120 : 190 }}>
      <svg viewBox="0 0 200 190" className="w-full" fill="none">
        {/* shadow */}
        <ellipse cx="100" cy="176" rx="70" ry="9" fill="#222328" opacity="0.22" />
        {/* post — isometric */}
        <path d="M92 118 L108 118 L108 172 L92 172 Z" fill="#3C3D42" stroke="#59595B" strokeWidth="1.5" />
        <path d="M108 118 L118 112 L118 166 L108 172 Z" fill="#222328" stroke="#59595B" strokeWidth="1.5" />
        {/* body — top / front / side */}
        <path d="M38 62 L58 48 L162 48 L142 62 Z" fill="#59595B" stroke="#A6A6A4" strokeWidth="1.4" />
        <path d="M38 62 L142 62 L142 118 L38 118 Z" fill="#3C3D42" stroke="#59595B" strokeWidth="1.6" />
        <path d="M142 62 L162 48 L162 104 L142 118 Z" fill="#222328" stroke="#59595B" strokeWidth="1.6" />
        {/* ribs */}
        <path d="M52 62 V118 M128 62 V118" stroke="#222328" strokeWidth="2" opacity="0.6" />
        {/* door — flips down from the right hinge on open */}
        <g style={{ transformOrigin: "128px 78px", transform: open ? "rotate(74deg)" : "rotate(0deg)", transition: "transform .55s cubic-bezier(.4,.8,.3,1)" }}>
          <rect x="54" y="72" width="74" height="38" rx="3" fill="#222328" stroke="#A6A6A4" strokeWidth="1.6" />
          <rect x="60" y="78" width="62" height="26" rx="2" fill="none" stroke="#59595B" strokeWidth="1.2" />
          <circle cx="120" cy="91" r="4" fill="#CEB1AB" stroke="#A6A6A4" strokeWidth="1.2" />
        </g>
        {/* slot */}
        <rect x="62" y="56" width="58" height="5" rx="2" fill="#222328" />
        {/* flag — crimson, rises when open */}
        <g style={{ transform: open ? "translateY(-6px)" : "translateY(0)", transition: "transform .4s ease .15s" }}>
          <rect x="150" y="58" width="4" height="26" fill="#59595B" />
          <path d="M154 58 h20 l-5 6 5 6 h-20 z" fill="#E72241" stroke="#9E2237" strokeWidth="1.2" />
        </g>
        {/* red paper peeking out when open */}
        {open && <path d="M70 74 l16 -8 16 8 -16 6 z" fill="#E72241" stroke="#9E2237" strokeWidth="1.2" />}
      </svg>
      {!open && onClick && (
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
  const [glitching, setGlitching] = useState(false);
  const [planeDone, setPlaneDone] = useState(false);
  const [flight, setFlight] = useState(600);
  const lineRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const openMailbox = () => {
    if (phase !== 1) return;
    setPhase(2);
    requestAnimationFrame(() => {
      const w = lineRef.current?.getBoundingClientRect().width;
      if (w) setFlight(w - 56);
    });
    if (reduced) {
      setPlaneDone(true);
      return;
    }
    timers.current.push(window.setTimeout(() => setPlaneDone(true), 2650));
  };

  const knowMore = () => {
    if (reduced) { setPhase(3); return; }
    setGlitching(true);
    timers.current.push(window.setTimeout(() => { setGlitching(false); setPhase(3); }, 640));
  };

  const replay = () => { setPhase(1); setPlaneDone(false); setGlitching(false); };

  return (
    <section id="pipeline" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="06 — HOW I BUILD"
          titleNode={<>THE <span className="text-[var(--crimson)]">PIPELINE</span></>}
          desc={b.support}
          meta={`PHASE ${String(phase).padStart(2, "0")} / 03`}
        />
        <p className="mt-4 -mt-2 f-mono text-[11px] sm:text-[12px] tracking-[0.18em] text-[var(--ink2)]">{b.visibleNote}</p>

        {/* ================= PHASE 01 — THE MAILBOX ================= */}
        {phase === 1 && (
          <Reveal className="mt-12">
            <div className="mat-outer mat-texture rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-10 md:gap-16 relative overflow-hidden">
              <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--crimson)]" />
              <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--crimson)]" />
              <Mailbox open={false} onClick={openMailbox} />
              <div className="min-w-0 text-center md:text-left">
                <span className="f-mono text-[10px] tracking-[0.3em] text-[var(--crimson)]">PHASE 01 — THE DROP</span>
                <h3 className="f-display text-[clamp(1.6rem,3.2vw,2.6rem)] mt-3 leading-tight" style={{ color: "var(--outer-ink)" }}>
                  EVERY PROJECT STARTS IN A MAILBOX.
                </h3>
                <p className="mt-4 max-w-[52ch] text-[14px] leading-relaxed" style={{ color: "var(--m-sub)" }}>
                  A blind briefing lands. Nothing else is visible yet — the workflow stays sealed until you open it.
                </p>
                <span className="mt-6 inline-flex items-center gap-3 f-tech font-bold text-[12px] tracking-[0.22em] text-[var(--crimson)] live-blink">
                  <span className="w-2 h-2 rotate-45 bg-[var(--crimson)]" /> CLICK THE MAILBOX
                </span>
              </div>
            </div>
          </Reveal>
        )}

        {/* ================= PHASE 02 — PAPER FLIGHT ================= */}
        {phase === 2 && (
          <div className={`mt-12 mat-outer mat-texture rounded-xl p-8 sm:p-12 relative overflow-hidden ${glitching ? "shake-hard" : ""}`}>
            <span className="f-mono text-[10px] tracking-[0.3em] text-[var(--crimson)]">PHASE 02 — THE FLIGHT</span>
            <div className="mt-8 flex items-center gap-6 sm:gap-10">
              <div className="shrink-0"><Mailbox open small /></div>

              {/* one continuous process line */}
              <div ref={lineRef} className="relative flex-1 h-24">
                <span className="absolute left-0 right-0 top-1/2 h-[3px] rounded" style={{ background: "var(--m-line)" }} />
                <span className={`absolute left-0 top-1/2 h-[3px] rounded bg-[var(--crimson)] ${reduced ? "w-full" : ""}`}
                  style={reduced ? undefined : { width: planeDone ? "100%" : "0%", transition: "width 2.6s cubic-bezier(.5,.05,.45,.95)" }} />

                {/* four nodes reveal as the plane passes */}
                {b.nodes.map((nd, i) => (
                  <div key={nd.num}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-2 node-pop"
                    style={{ left: `${16 + i * 22.5}%`, animationDelay: reduced ? "0s" : `${0.4 + i * 0.55}s` }}>
                    <span className="w-11 h-11 grid place-items-center rounded-full border-2 f-tech font-bold text-[13px]"
                      style={{
                        borderColor: planeDone || reduced ? "var(--crimson)" : "var(--m-line)",
                        background: planeDone || reduced ? "color-mix(in srgb, var(--crimson) 18%, transparent)" : "var(--outer-bg)",
                        color: planeDone || reduced ? "#DDDDD8" : "var(--m-sub)",
                        transition: "all .4s ease",
                      }}>
                      {nd.num}
                    </span>
                    <span className="f-tech font-bold text-[11px] sm:text-[12.5px] tracking-[0.18em] whitespace-nowrap" style={{ color: "var(--outer-ink)" }}>
                      {nd.title}
                    </span>
                  </div>
                ))}

                {/* red paper plane — one straight horizontal flight */}
                {!planeDone && !reduced && (
                  <span className="absolute top-1/2 -translate-y-1/2 left-0 plane-cross" style={{ "--flight": `${flight}px` } as React.CSSProperties}>
                    <PaperPlane size={36} className="text-[#E72241]" />
                  </span>
                )}

                {/* KNOW MORE — red paper plane button at the end of the line */}
                {planeDone && (
                  <button onClick={knowMore}
                    className="btn btn-crimson absolute right-0 top-1/2 -translate-y-1/2 node-pop !py-3"
                    style={{ animationDelay: reduced ? "0s" : "0.15s" }}>
                    <PaperPlane size={16} /> {b.knowMore}
                  </button>
                )}
              </div>
            </div>
            <p className="mt-6 f-mono text-[9px] tracking-[0.26em]" style={{ color: "var(--m-sub)" }}>
              {planeDone ? "THE PLANE LANDED — TAKE THE NEXT STEP" : "THE PLANE IS IN THE AIR…"}
            </p>
          </div>
        )}

        {/* ================= PHASE 03 — COMIC PANEL ================= */}
        {phase === 3 && (
          <div className="mt-12 reveal-in relative rounded-xl border-4 p-6 sm:p-10 overflow-hidden"
            style={{
              borderColor: "#222328",
              background: "#DDDDD8",
              backgroundImage: "radial-gradient(rgba(34,35,40,0.16) 1px, transparent 1.4px)",
              backgroundSize: "12px 12px",
              boxShadow: "10px 10px 0 #222328",
              color: "#222328",
            }}>
            <span className="absolute top-3 left-4 f-mono text-[9px] tracking-[0.3em] text-[#9E2237]">PHASE 03 — BEYOND</span>
            <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-center mt-4">
              {/* LEFT — speech bubble + empty upload frame */}
              <div className="relative min-w-0">
                <div className="relative z-10 mb-[-14px] ml-2 sm:ml-6 w-[88%] rounded-[18px] border-[3px] border-[#222328] bg-[#DDDDD8] px-5 py-4 shadow-[5px_5px_0_#222328]">
                  <p className="f-tech font-bold text-[14px] sm:text-[15.5px] leading-snug">
                    {b.bubble}
                  </p>
                  {/* tail pointing down toward the frame */}
                  <svg className="absolute -bottom-[17px] left-10" width="34" height="20" viewBox="0 0 34 20">
                    <path d="M0 0 H34 L12 20 Z" fill="#DDDDD8" stroke="#222328" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M3 0 H31 L12 16 Z" fill="#DDDDD8" />
                  </svg>
                </div>
                <div className="relative border-4 border-[#222328] bg-[#C3C1BC] shadow-[7px_7px_0_#59232F]">
                  <MediaSlot item={b.reveal.image} ratio="4/3" className="!rounded-none !border-0" />
                  <span className="absolute top-2 left-2 f-mono text-[8px] tracking-[0.26em] px-2 py-1 bg-[#222328] text-[#DDDDD8]">UPLOAD SPACE</span>
                </div>
              </div>

              {/* RIGHT — established continuation copy */}
              <div className="min-w-0">
                <span className="f-mono text-[10px] tracking-[0.32em] text-[#E72241]">BEYOND THE FOUR NODES</span>
                <h3 className="f-display leading-[0.98] mt-4 text-[clamp(2rem,4.4vw,3.4rem)]">
                  {b.reveal.heading}{" "}
                  <span className="text-[#E72241]">{b.reveal.headingAccent}</span>
                </h3>
                <p className="mt-6 text-[15px] sm:text-[16.5px] leading-relaxed max-w-[58ch] font-medium">
                  {b.reveal.narrator}
                </p>
                <button onClick={replay}
                  className="mt-8 inline-flex items-center gap-3 f-tech font-bold text-[11px] tracking-[0.24em] px-4 py-3 rounded-lg border-2 border-[#222328] hover:bg-[#222328] hover:text-[#DDDDD8] transition-colors duration-300">
                  ↺ REPLAY THE PIPELINE
                </button>
              </div>
            </div>
          </div>
        )}

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

/* ================= 07 — CONTACT ================= */

function NameMorph({ text }: { text: string }) {
  const reduced = useReducedMotion();
  const [ref, inView] = useInView<HTMLDivElement>(0.4);
  const [fired, setFired] = useState(false);
  useEffect(() => { if (inView && !fired) setFired(true); }, [inView, fired]);
  return (
    <div ref={ref} className={fired && !reduced ? "name-morph" : ""}
      style={{ opacity: reduced || fired ? 1 : 0 }}>
      {text}
    </div>
  );
}

export function Contact() {
  const { data } = useStore();
  const c = data.contact;

  return (
    <section id="contact" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead label="07 — CONTACT" title="CONTACT" meta="FINAL TRANSMISSION" />

        <div className="mt-12 grid lg:grid-cols-[1.12fr_0.88fr] gap-12 lg:gap-16 items-start">
          {/* ================= LEFT — identity + channels ================= */}
          <Reveal>
            <div className="mat-outer mat-texture rounded-xl p-7 sm:p-10 relative overflow-hidden">
              <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-[var(--crimson)]" />
              <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-[var(--crimson)]" />

              {/* major hero statement */}
              <h2 className="f-display leading-[0.92] text-[clamp(3rem,7.5vw,6.2rem)] lg:whitespace-nowrap" style={{ color: "var(--outer-ink)" }}>
                {c.headingA} <span className="text-[var(--crimson)]">{c.headingB}</span>
              </h2>

              {/* one-time 3s temporal typography morph */}
              <div className="mt-6 f-tech font-bold text-[14px] sm:text-[16px] tracking-[0.3em] text-[var(--crimson)]">
                <NameMorph text="C. BALA KRISHNAN" />
              </div>

              {/* second major heading */}
              <h3 className="f-display text-[clamp(1.5rem,3.4vw,2.5rem)] mt-7 leading-tight" style={{ color: "var(--outer-ink)" }}>
                {c.closing}
              </h3>
              <p className="mt-4 max-w-[58ch] text-[14px] sm:text-[15px] leading-relaxed" style={{ color: "var(--m-sub)" }}>
                Creative direction, generative pipelines and cinematic AI production — bring the briefing, I'll bring the machine. One channel away.
              </p>

              {/* channels — Email + LinkedIn + WhatsApp + Instagram */}
              <div className="mt-9 grid sm:grid-cols-2 gap-3">
                <a href={`mailto:${c.email}`}
                  className="border-[1.5px] rounded-lg p-4 flex items-center gap-3 hover:border-[var(--crimson)] hover:bg-[color-mix(in_srgb,var(--crimson)_10%,transparent)] transition-all duration-300 group"
                  style={{ borderColor: "var(--m-line)" }}>
                  <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--crimson)]">{c.emailLabel}</span>
                  <span className="ml-auto text-[var(--m-sub)] group-hover:text-[var(--crimson)] group-hover:translate-x-1 transition-all duration-300">
                    <ArrowRight size={14} strokeWidth={2} />
                  </span>
                </a>
                {(c.socials ?? []).map((s) => (
                  <a key={s.label} href={s.url || "#contact"} target={s.url ? "_blank" : undefined} rel="noreferrer"
                    className="border-[1.5px] rounded-lg p-4 flex items-center gap-3 hover:border-[var(--crimson)] hover:bg-[color-mix(in_srgb,var(--crimson)_10%,transparent)] transition-all duration-300 group"
                    style={{ borderColor: "var(--m-line)" }}>
                    <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--crimson)]">{s.label}</span>
                    <span className="ml-auto text-[var(--m-sub)] group-hover:text-[var(--crimson)] group-hover:translate-x-1 transition-all duration-300">
                      {s.label === "LINKEDIN" ? <LinkedInIcon size={14} /> : <ArrowRight size={14} strokeWidth={2} />}
                    </span>
                  </a>
                ))}
              </div>

              {/* resume — same button scale as Email */}
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {c.resumeUrl ? (
                  <a href={c.resumeUrl} download className="btn btn-crimson justify-center !py-4">{c.resumeLabel} <ArrowRight size={14} strokeWidth={2} /></a>
                ) : (
                  <button className="btn btn-crimson justify-center !py-4">{c.resumeLabel} <ArrowRight size={14} strokeWidth={2} /></button>
                )}
                <span className="hidden sm:flex items-center f-mono text-[9px] tracking-[0.24em] pl-1" style={{ color: "var(--m-sub)" }}>
                  PDF — VIA /EDIT UPLOAD
                </span>
              </div>
            </div>
          </Reveal>

          {/* ================= RIGHT — 9:16 portrait frame ================= */}
          <Reveal delay={0.12}>
            <div className="relative mx-auto w-full max-w-[400px] lg:max-w-none">
              <div className="blueprint absolute -inset-4 rounded-xl" aria-hidden />
              <span className="absolute -top-2 -left-2 w-5 h-5 border-t-[3px] border-l-[3px] border-[var(--crimson)] z-10" />
              <span className="absolute -top-2 -right-2 w-5 h-5 border-t-[3px] border-r-[3px] border-[var(--crimson)] z-10" />
              <span className="absolute -bottom-2 -left-2 w-5 h-5 border-b-[3px] border-l-[3px] border-[var(--crimson)] z-10" />
              <span className="absolute -bottom-2 -right-2 w-5 h-5 border-b-[3px] border-r-[3px] border-[var(--crimson)] z-10" />
              <div className="flex items-center justify-between mb-3">
                <span className="f-mono text-[10px] tracking-[0.3em] px-2.5 py-1.5 rounded-md bg-[var(--ink)] text-[var(--page)]">PORTRAIT</span>
                <span className="f-mono text-[10px] tracking-[0.26em] text-[var(--ink2)]">9 : 16 · FRAME A</span>
              </div>
              <MediaSlot item={c.portrait} ratio="9/16" className="mat-page-card shadow-[14px_14px_0_var(--sup1)]" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */

export function Footer() {
  const [, nav] = useHashRoute();
  return (
    <footer className="border-t border-[var(--line)] py-8 mt-4">
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
