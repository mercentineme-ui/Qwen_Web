import React, { useRef, useState } from "react";
import { useLocalTime, useReducedMotion, useStore } from "../lib/store";
import { ArrowRight, ArrowUp, InstagramIcon, LinkedInIcon, PaperPlane, Rune, WhatsAppIcon } from "./icons";
import { MediaSlot, Reveal, SectionHead, useInView } from "./ui";

/* ---------- interactive production mailbox ---------- */
function Mailbox({ onShoot }: { onShoot: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="group/mail cursor-pointer select-none w-fit"
      onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onClick={onShoot}
      title="Click — fire a red paper">
      <svg width="212" height="200" viewBox="0 0 240 224" fill="none" aria-label="Production mailbox — hover to open the door, click to fire a red paper">
        {/* ground */}
        <line x1="14" y1="212" x2="226" y2="212" stroke="var(--line)" strokeWidth="2" strokeDasharray="5 7" />
        {/* post */}
        <rect x="112" y="122" width="16" height="86" fill="var(--sup2)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="104" y="116" width="32" height="10" fill="var(--sup1)" stroke="var(--ink)" strokeWidth="2" />
        {/* hazard base */}
        <rect x="94" y="200" width="52" height="12" fill="var(--sup1)" stroke="var(--ink)" strokeWidth="2" />
        <path d="M100 212l10-12M114 212l10-12M128 212l10-12" stroke="var(--crimson)" strokeWidth="3" />
        {/* body */}
        <rect x="38" y="34" width="164" height="90" rx="10" fill="var(--sup2)" stroke="var(--ink)" strokeWidth="2.5" />
        <line x1="38" y1="58" x2="202" y2="58" stroke="var(--ink)" strokeWidth="1.6" />
        {/* rivets */}
        <circle cx="48" cy="46" r="2.2" fill="var(--ink2)" />
        <circle cx="192" cy="46" r="2.2" fill="var(--ink2)" />
        <circle cx="48" cy="114" r="2.2" fill="var(--ink2)" />
        <circle cx="192" cy="114" r="2.2" fill="var(--ink2)" />
        {/* opening (dark) behind the door */}
        <rect x="62" y="70" width="90" height="18" rx="3" fill="var(--ink)" opacity="0.85" />
        {/* mail door — hinges RIGHT, flips down on hover */}
        <g className="mail-door" style={{ transform: open ? "rotate(46deg)" : "rotate(0deg)" }}>
          <rect x="62" y="70" width="90" height="18" rx="3" fill="var(--sup1)" stroke="var(--ink)" strokeWidth="2" />
          <circle cx="70" cy="79" r="1.8" fill="var(--ink2)" />
          <rect x="138" y="76" width="8" height="6" rx="1.5" fill="var(--ink2)" />
        </g>
        {/* envelope waiting */}
        <g style={{ transform: open ? "translateY(-6px)" : "translateY(0)", transition: "transform .45s ease" }}>
          <rect x="76" y="52" width="56" height="26" fill="var(--sup1)" stroke="var(--ink2)" strokeWidth="1.8" />
          <path d="M76 52l28 16 28-16" stroke="var(--ink2)" strokeWidth="1.8" />
          <rect x="116" y="58" width="14" height="9" fill="var(--crimson)" opacity="0.9" />
        </g>
        {/* plate */}
        <rect x="150" y="96" width="40" height="18" rx="3" fill="var(--page)" stroke="var(--ink)" strokeWidth="1.8" />
        <text x="170" y="109" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="2" fill="var(--ink2)">CBK</text>
        {/* signal lamp */}
        <circle cx="56" cy="104" r="4" fill="var(--crimson)" />
        <circle cx="56" cy="104" r="8" stroke="var(--crimson)" strokeWidth="1.4" opacity="0.5" />
        {/* flag */}
        <rect x="198" y="40" width="6" height="44" fill="var(--ink)" />
        <polygon points="204,40 236,49 204,60" fill="var(--crimson)" />
      </svg>
    </div>
  );
}

/* ================= 06 — HOW I BUILD // THE PIPELINE ================= */

export function HowIBuild() {
  const { data } = useStore();
  const b = data.build;
  const reduced = useReducedMotion();
  const [revealed, setRevealed] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [paper, setPaper] = useState(false);
  const [plane, setPlane] = useState(false);
  const timers = useRef<number[]>([]);

  React.useEffect(() => () => { timers.current.forEach(clearTimeout); }, []);

  const firePaper = () => {
    if (paper) return;
    setPaper(true);
    timers.current.push(window.setTimeout(() => setPaper(false), 850));
  };

  const launchNext = () => {
    if (revealed) return;
    setPlane(true);
    if (!reduced) setShaking(true);
    timers.current.push(window.setTimeout(() => setShaking(false), 480));
    timers.current.push(window.setTimeout(() => {
      setRevealed(true);
      setPlane(false);
    }, reduced ? 60 : 950));
  };

  return (
    <section id="build" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="06 — HOW I BUILD"
          title="THE"
          titleAccent="PIPELINE"
          desc={b.support}
          meta="PROCESS · FOUR VISIBLE NODES"
        />

        <Reveal className="mt-8">
          <p className="text-[14px] sm:text-[15px] leading-relaxed text-[var(--ink)] font-medium max-w-[70ch]">{b.visibleNote}</p>
        </Reveal>

        {!revealed ? (
          <div className={`relative mt-10 ${shaking ? "glitch-shake" : ""}`}>
            {/* mailbox + rune column */}
            <div className="grid lg:grid-cols-[auto_1fr] gap-10 lg:gap-14 items-center">
              <Reveal className="relative">
                <div className="flex items-end gap-6">
                  <span className="group flex flex-col items-center gap-3 text-[var(--ink2)] transition-colors duration-400 hover:text-[var(--crimson)] mb-4">
                    <Rune size={92} strokeWidth={1.6} />
                    <span className="f-mono text-[8px] tracking-[0.3em] opacity-70">THE MARK</span>
                  </span>
                  <Mailbox onShoot={firePaper} />
                </div>
                {/* red paper — fires from the opening, travels straight right */}
                {paper && (
                  <span className="paper-shoot absolute left-[118px] top-[70px] w-9 h-6 rounded-[2px] pointer-events-none"
                    style={{ background: "var(--crimson)", boxShadow: "0 6px 16px -6px rgba(227,34,64,0.7)" }} />
                )}
              </Reveal>

              {/* the horizontal process line */}
              <Reveal delay={0.08} className="relative min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3">
                  {/* mailbox opening node */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <span className="w-11 h-11 rounded-full border-2 border-[var(--ink)] grid place-items-center f-tech font-bold text-[10px] tracking-[0.08em]">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="6" width="18" height="13" rx="2" /><path d="M3 10h18M14 14h4" /></svg>
                    </span>
                    <span className="f-tech font-bold text-[11px] tracking-[0.16em] whitespace-nowrap">MAILBOX<br />OPENING</span>
                  </div>

                  {b.nodes.map((nd) => (
                    <React.Fragment key={nd.num}>
                      <span className="h-[2px] w-8 sm:w-14 shrink-0 relative overflow-hidden rounded" style={{ background: "var(--line)" }}>
                        <span className="absolute inset-y-0 left-0 w-1/2 bg-[var(--crimson)] opacity-70" />
                      </span>
                      <div className="group flex items-center gap-2.5 shrink-0">
                        <span className="w-11 h-11 rounded-full border-2 border-[var(--ink)] group-hover:border-[var(--crimson)] group-hover:text-[var(--crimson)] grid place-items-center f-tech font-bold text-[13px] transition-colors duration-300">
                          {nd.num}
                        </span>
                        <span className="f-tech font-bold text-[11px] tracking-[0.14em] whitespace-nowrap group-hover:text-[var(--crimson)] transition-colors duration-300">
                          {nd.title}
                        </span>
                      </div>
                    </React.Fragment>
                  ))}

                  {/* final line reaches the red paper-plane button */}
                  <span className="h-[2px] w-8 sm:w-14 shrink-0 relative overflow-hidden rounded" style={{ background: "var(--line)" }}>
                    <span className="absolute inset-y-0 left-0 w-1/2 bg-[var(--crimson)] opacity-70" />
                  </span>
                  <button onClick={launchNext}
                    className="relative shrink-0 flex items-center gap-2.5 f-tech font-bold text-[12px] tracking-[0.24em] px-5 py-3.5 rounded-lg bg-[var(--crimson)] text-[#f4f2ed] hover:shadow-[0_14px_34px_-12px_rgba(227,34,64,0.8)] hover:-translate-y-0.5 transition-all duration-300">
                    <PaperPlane size={17} />
                    {b.nextLabel}
                  </button>
                </div>
                <p className="mt-3 f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">
                  HOVER THE MAILBOX — THE DOOR OPENS · NEXT LAUNCHES THE PLANE
                </p>

                {/* the flying paper plane */}
                {plane && !reduced && (
                  <span className="plane-fly absolute right-10 bottom-8 text-[var(--crimson)] pointer-events-none z-10">
                    <PaperPlane size={30} />
                  </span>
                )}
              </Reveal>
            </div>
          </div>
        ) : (
          /* ---------- revealed comedic continuation ---------- */
          <Reveal className="mt-10">
            <div className="mat-page-card mat-texture rounded-xl border border-[var(--line)] p-5 sm:p-8 grid lg:grid-cols-[1.15fr_0.85fr] gap-7 lg:gap-12 items-center">
              {/* large empty editable frame */}
              <MediaSlot item={b.reveal.image} ratio="4/3" showLabel={false} className="w-full" />
              <div>
                <span className="f-mono text-[10px] tracking-[0.3em] text-[var(--crimson)]">BEYOND THE FOUR NODES</span>
                <h3 className="f-display text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.02] mt-4">
                  {b.reveal.heading}{" "}
                  <span className="text-[var(--crimson)]">{b.reveal.headingAccent}</span>
                </h3>
                <p className="mt-5 text-[13.5px] sm:text-[14.5px] leading-relaxed text-[var(--ink2)] max-w-[58ch]">
                  {b.reveal.narrator}
                </p>
                <button onClick={() => setRevealed(false)}
                  className="mt-6 inline-flex items-center gap-2.5 f-tech font-bold text-[10px] tracking-[0.26em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors duration-300">
                  ← RE-ARM PIPELINE
                </button>
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ================= 07 — CONTACT ================= */

export function Contact() {
  const { data } = useStore();
  const c = data.contact;
  const reduced = useReducedMotion();
  const [nameRef, nameInView] = useInView<HTMLDivElement>(0.4);
  const [resumeNote, setResumeNote] = useState(false);

  const socialIcon = (label: string) => {
    if (label === "LINKEDIN") return <LinkedInIcon size={16} />;
    if (label === "WHATSAPP") return <WhatsAppIcon size={16} />;
    if (label === "INSTAGRAM") return <InstagramIcon size={16} />;
    return null;
  };

  return (
    <section id="contact" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="absolute inset-0 blueprint pointer-events-none" aria-hidden />
      {/* machined side rail — engineered closing hardware */}
      <div className="absolute left-3 sm:left-5 top-24 bottom-24 w-[3px] hidden md:block" aria-hidden
        style={{ background: "repeating-linear-gradient(180deg, var(--line) 0 10px, transparent 10px 22px)" }} />
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="07 — CONTACT"
          title="CONTACT"
          desc="Open for pipelines, films and systems — bring the brief nobody knows how to build yet."
          meta="RESPONSE WITHIN 24H"
        />

        <div className="mt-12 grid lg:grid-cols-[1.18fr_0.82fr] gap-12 lg:gap-16 items-start">
          <div className="min-w-0">
            <Reveal>
              <h3 className="f-display leading-[0.92] whitespace-nowrap text-[clamp(2.6rem,7.2vw,6.8rem)]">
                <span className="text-[var(--ink)]">{c.headingA}</span>{" "}
                <span className="text-[var(--crimson)]" style={{ textShadow: "0 16px 40px rgba(227,34,64,0.3)" }}>{c.headingB}</span>
              </h3>
            </Reveal>

            {/* one-shot 3s morph — then perfectly stable */}
            <div ref={nameRef} className="mt-6 border-y border-[var(--line)] py-5 overflow-hidden">
              {nameInView && (
                <span className={`f-tech font-bold text-[clamp(1.05rem,2.6vw,1.9rem)] tracking-[0.24em] text-[var(--ink2)] inline-block whitespace-nowrap ${reduced ? "" : "name-morph"}`}>
                  C. BALA KRISHNAN
                </span>
              )}
            </div>

            <Reveal delay={0.1}>
              <p className="mt-8 f-display text-[clamp(1.4rem,3vw,2.4rem)] leading-tight">{c.closing}</p>
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink2)] max-w-[54ch]">
                Bring the strange brief, the half-formed idea, the pipeline nobody has built yet. I'll walk in, find the problem and carry it to delivery.
              </p>
            </Reveal>

            {/* channels — email + socials + resume at the same scale */}
            <Reveal delay={0.16}>
              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <a href={`mailto:${c.email}`} className="btn btn-ghost border-[var(--ink)] text-[var(--ink)]">
                  {c.emailLabel}
                  <ArrowRight size={15} strokeWidth={2.2} />
                </a>
                {c.socials.map((s) =>
                  s.url ? (
                    <a key={s.label} href={s.url} target="_blank" rel="noreferrer"
                      className="btn btn-ghost border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]">
                      {socialIcon(s.label)}
                      {s.label}
                    </a>
                  ) : (
                    <span key={s.label} title="Not linked yet — add the URL via EDIT → CONTACT"
                      className="btn btn-ghost border-[var(--line)] text-[var(--ink2)] opacity-55 cursor-not-allowed">
                      {socialIcon(s.label)}
                      {s.label}
                    </span>
                  )
                )}
                {c.resumeUrl ? (
                  <a href={c.resumeUrl} download className="btn btn-crimson">
                    {c.resumeLabel}
                    <ArrowRight size={15} strokeWidth={2.2} />
                  </a>
                ) : (
                  <button onClick={() => setResumeNote(true)} className="btn btn-crimson">
                    {c.resumeLabel}
                    <ArrowRight size={15} strokeWidth={2.2} />
                  </button>
                )}
              </div>
              {resumeNote && !c.resumeUrl && (
                <p className="mt-3 f-mono text-[10px] tracking-[0.2em] text-[var(--crimson)]">
                  NO RESUME FILE LOADED — UPLOAD ONE VIA EDIT → CONTACT
                </p>
              )}
            </Reveal>

            <Reveal delay={0.22}>
              <div className="mt-10 grid sm:grid-cols-3 gap-4 f-mono text-[10px] tracking-[0.2em] text-[var(--ink2)]">
                <div className="border border-[var(--line)] rounded-lg p-4">
                  <span className="block text-[var(--crimson)] mb-2">EMAIL</span>{c.email}
                </div>
                <div className="border border-[var(--line)] rounded-lg p-4">
                  <span className="block text-[var(--crimson)] mb-2">BASE</span>HYDERABAD / REMOTE
                </div>
                <div className="border border-[var(--line)] rounded-lg p-4">
                  <span className="block text-[var(--crimson)] mb-2">STATUS</span>
                  <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--crimson)] live-blink" />AVAILABLE 2026</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* hardware-framed portrait */}
          <Reveal delay={0.12}>
            <div className="w-full max-w-[440px] lg:max-w-none lg:ml-auto relative" style={{ width: "min(100%, 440px)" }}>
              <div className="relative border-2 border-[var(--ink)] p-2.5 rounded-xl mat-page-card">
                {/* corner plates + bolts — machined detail */}
                {[["-top-1.5", "-left-1.5"], ["-top-1.5", "-right-1.5"], ["-bottom-1.5", "-left-1.5"], ["-bottom-1.5", "-right-1.5"]].map(([y, x]) => (
                  <span key={`${x}${y}`} className={`absolute ${y} ${x} w-5 h-5 rounded-[4px] bg-[var(--ink)] grid place-items-center`}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--page)" }} />
                  </span>
                ))}
                <MediaSlot item={c.portrait} ratio="9/16" />
              </div>
              <div className="mt-3 flex items-center justify-between f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">
                <span>PORTRAIT — 9:16</span>
                <span className="text-[var(--crimson)]">CBK / 2026</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ================= FOOTER ================= */

export function Footer() {
  const time = useLocalTime();
  return (
    <footer className="border-t border-[var(--line)] py-8 mt-4">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 flex flex-wrap items-center gap-x-8 gap-y-3 f-mono text-[10px] tracking-[0.22em] text-[var(--ink2)]">
        <span>© 2026 C. BALA KRISHNAN</span>
        <span className="hidden sm:inline">DESIGNFOLIO — BUILT AS A SYSTEM</span>
        <span className="hidden md:inline tabular-nums">LOCAL {time}</span>
        <a href="#about" className="ml-auto flex items-center gap-2 hover:text-[var(--crimson)] transition-colors duration-300">
          BACK TO TOP <ArrowUp size={13} strokeWidth={2.2} />
        </a>
      </div>
    </footer>
  );
}
