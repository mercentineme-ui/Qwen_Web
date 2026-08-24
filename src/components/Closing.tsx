import React, { useEffect, useRef, useState } from "react";
import { useHashRoute, useReducedMotion, useStore } from "../lib/store";
import { ArrowRight, ArrowUp, LinkedInIcon, PaperPlane, Rune } from "./icons";
import { MediaSlot, Reveal, SectionHead, useInView } from "./ui";

/* ================= 06 — HOW I BUILD / THE PIPELINE ================= */

function Mailbox({ onFire }: { onFire: () => void }) {
  const [paper, setPaper] = useState(0);
  const fire = () => {
    onFire();
    setPaper((p) => p + 1);
  };
  return (
    <div className="relative shrink-0 group/mail" style={{ perspective: 420 }}>
      <svg width="128" height="104" viewBox="0 0 160 130" fill="none" aria-label="Pipeline mailbox — hover to open, click to send">
        {/* post */}
        <rect x="72" y="78" width="14" height="46" fill="var(--ink2)" opacity="0.5" />
        <rect x="60" y="120" width="38" height="6" fill="var(--ink2)" opacity="0.4" />
        {/* body */}
        <path d="M28 44a30 30 0 0160 0v34H28z" fill="var(--ink)" />
        <path d="M88 44a30 30 0 0160 0v34H88z" fill="var(--ink)" opacity="0.86" />
        <rect x="28" y="70" width="120" height="8" fill="var(--crimson)" opacity="0.9" />
        {/* slot + interior (visible when door opens) */}
        <rect x="96" y="52" width="42" height="22" fill="#141418" />
        <rect x="102" y="58" width="26" height="10" fill="var(--crimson)" opacity="0.85" />
        {/* signal flag */}
        <rect x="26" y="26" width="4" height="26" fill="var(--ink2)" />
        <path d="M30 26h16l-4 5 4 5H30z" fill="var(--crimson)" />
        {/* feet bolts */}
        <circle cx="40" cy="82" r="2.6" fill="var(--ink2)" />
        <circle cx="136" cy="82" r="2.6" fill="var(--ink2)" />
      </svg>
      {/* door — hinged on the RIGHT, flips DOWN on hover */}
      <div className="absolute right-[9px] top-[52px] w-[42px] h-[22px] origin-right transition-transform duration-500 group-hover/mail:[transform:rotateX(78deg)]"
        style={{ transformStyle: "preserve-3d" }}>
        <div className="w-full h-full rounded-[3px] border border-[var(--line)] mat-page-card flex items-center justify-center">
          <span className="w-5 h-[3px] rounded bg-[var(--ink2)]" />
        </div>
      </div>
      {/* click → red paper flies straight right */}
      {paper > 0 && (
        <span key={paper} className="paper-fly absolute left-[104px] top-[54px] w-7 h-4 rounded-[2px] bg-[var(--crimson)] shadow-[0_4px_10px_rgba(227,34,64,0.5)] pointer-events-none" />
      )}
      <button onClick={fire} aria-label="Send a red paper from the mailbox"
        className="absolute inset-0 cursor-pointer" />
      <span className="mt-1 block text-center f-mono text-[8px] tracking-[0.24em] text-[var(--ink2)]">HOVER — OPEN · CLICK — SEND</span>
    </div>
  );
}

export function HowIBuild() {
  const { data } = useStore();
  const b = data.build;
  const reduced = useReducedMotion();
  const [stage, setStage] = useState<"idle" | "launch" | "reveal">("idle");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const launch = () => {
    if (stage !== "idle") return;
    if (reduced) { setStage("reveal"); return; }
    setStage("launch");
    timers.current.push(window.setTimeout(() => setStage("reveal"), 1050));
  };

  return (
    <section id="pipeline" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="06 — HOW I BUILD"
          title="THE"
          titleAccent="PIPELINE"
          desc={b.support}
          meta="ONE MARK · FIVE MOVES"
        />
        <Reveal className="mt-6">
          <p className="max-w-[70ch] text-[13.5px] sm:text-[14.5px] leading-relaxed text-[var(--ink2)]">{b.visibleNote}</p>
        </Reveal>

        {stage !== "reveal" ? (
          <div className={stage === "launch" ? "shake-hard" : ""}>
            {/* mailbox + horizontal process line */}
            <Reveal className="mt-12">
              <div className="mat-page-card mat-texture rounded-xl border border-[var(--line)] p-6 sm:p-10 overflow-x-auto">
                <div className="flex items-center gap-4 sm:gap-5 min-w-[860px]">
                  <Mailbox onFire={() => undefined} />

                  {b.nodes.map((node, i) => (
                    <React.Fragment key={node.num}>
                      <span className="flex-1 h-[3px] relative rounded overflow-hidden" style={{ background: "var(--line)" }}>
                        {!reduced && (
                          <span className="absolute inset-y-0 left-0 w-1/3 bg-[var(--crimson)] opacity-70"
                            style={{ animation: `scanPass 3.2s linear ${i * 0.5}s infinite` }} />
                        )}
                      </span>
                      <span className="flex items-center gap-3 shrink-0">
                        <span className="w-11 h-11 grid place-items-center rounded-full border-2 border-[var(--ink)] f-tech font-bold text-[13px] tracking-[0.08em] bg-[var(--page)]">
                          {node.num}
                        </span>
                        <span className="f-tech font-bold text-[12px] sm:text-[13px] tracking-[0.18em] whitespace-nowrap">{node.title}</span>
                      </span>
                    </React.Fragment>
                  ))}

                  {/* final line reaches the red paper-plane button */}
                  <span className="flex-1 h-[3px] rounded" style={{ background: "var(--line)" }} />
                  <button onClick={launch}
                    className="btn btn-crimson shrink-0 relative overflow-visible">
                    <span className={stage === "launch" ? "plane-launch inline-flex" : "inline-flex"}>
                      <PaperPlane size={17} />
                    </span>
                    {b.nextLabel}
                  </button>
                </div>

                {/* the single rune — neutral, crimson on hover */}
                <div className="mt-10 pt-6 border-t border-[var(--line)] flex flex-wrap items-center gap-5">
                  <span className="text-[var(--ink2)] transition-colors duration-300 hover:text-[var(--crimson)] cursor-default">
                    <Rune size={34} />
                  </span>
                  <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">
                    THE MARK WALKS EVERY PROJECT — {b.nextLabel} REVEALS WHAT THE LINE LEAVES OUT
                  </span>
                </div>
              </div>
            </Reveal>
          </div>
        ) : (
          /* ---------- revealed comedic panel ---------- */
          <div className="reveal-in mt-12">
            <div className="mat-outer mat-texture rounded-xl p-6 sm:p-10 grid lg:grid-cols-[0.95fr_1.05fr] gap-8 lg:gap-12 items-center corner-bracket">
              {/* LEFT — large EMPTY editable frame */}
              <div>
                <MediaSlot item={b.reveal.image} ratio="4/3" className="mat-inner" />
                <span className="mt-3 block f-mono text-[9px] tracking-[0.26em]" style={{ color: "var(--m-sub)" }}>
                  BEYOND THE FOUR NODES — UPLOAD VIA EDIT
                </span>
              </div>
              {/* RIGHT — heading + narrator */}
              <div>
                <span className="f-mono text-[10px] tracking-[0.3em] text-[var(--crimson)]">/ THE REST OF THE PIPELINE</span>
                <h3 className="f-display text-[clamp(1.8rem,3.4vw,3rem)] leading-[1.02] mt-4" style={{ color: "var(--outer-ink)" }}>
                  {b.reveal.heading}<br />
                  <span className="text-[var(--crimson)]">{b.reveal.headingAccent}</span>
                </h3>
                <p className="mt-6 text-[14px] sm:text-[15px] leading-relaxed max-w-[58ch]" style={{ color: "color-mix(in srgb, var(--outer-ink) 78%, transparent)" }}>
                  {b.reveal.narrator}
                </p>
                <button onClick={() => setStage("idle")}
                  className="mt-8 f-tech font-bold text-[11px] tracking-[0.24em] inline-flex items-center gap-2.5 text-[var(--crimson)] hover:gap-4 transition-all duration-300">
                  RUN IT BACK <ArrowUp size={13} strokeWidth={2.2} />
                </button>
              </div>
            </div>
          </div>
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

  const resumeInner = (
    <>
      {c.resumeLabel}
      <ArrowRight size={15} strokeWidth={2.2} />
    </>
  );

  return (
    <section id="contact" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="absolute inset-0 blueprint pointer-events-none" aria-hidden />
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="07 — CONTACT"
          title="CONTACT"
          desc="Open for pipelines, films and systems — bring the brief nobody knows how to build yet."
          meta="RESPONSE WITHIN 24H"
        />

        {/* heavy mechanical frame — industrial, precise, premium */}
        <Reveal className="mt-12">
          <div className="relative rounded-xl border-2 border-[var(--line)] mat-page-card mat-texture p-6 sm:p-10 lg:p-14">
            {/* corner plates + bolts */}
            {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((pos) => (
              <span key={pos} className={`absolute w-8 h-8 ${pos}`} style={{ borderColor: "var(--crimson)" }} />
            ))}
            {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
              <span key={pos} className={`absolute ${pos} w-2 h-2 rounded-full bg-[var(--ink2)] opacity-60`} />
            ))}

            <div className="grid lg:grid-cols-[1.18fr_0.82fr] gap-12 lg:gap-16 items-start">
              <div className="min-w-0">
                {/* +40% scale statement — one line on desktop */}
                <h3 className="f-display leading-[0.92] whitespace-nowrap text-[clamp(2.6rem,7.2vw,6.8rem)]">
                  <span className="text-[var(--ink)]">{c.headingA}</span>{" "}
                  <span className="text-[var(--crimson)]" style={{ textShadow: "0 16px 40px rgba(227,34,64,0.3)" }}>{c.headingB}</span>
                </h3>

                {/* one-shot 3s temporal morph — then perfectly stable */}
                <div ref={nameRef} className="mt-6 border-y border-[var(--line)] py-5 overflow-hidden">
                  {nameInView && (
                    <span className={`f-tech font-bold text-[clamp(1.05rem,2.6vw,1.9rem)] tracking-[0.24em] text-[var(--ink2)] inline-block whitespace-nowrap ${reduced ? "" : "name-morph"}`}>
                      C. BALA KRISHNAN
                    </span>
                  )}
                </div>

                <p className="mt-8 f-display text-[clamp(1.4rem,3vw,2.4rem)] leading-tight">{c.closing}</p>
                <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink2)] max-w-[54ch]">
                  Bring the strange brief, the half-formed idea, the pipeline nobody has built yet. I'll walk in, find the problem and carry it to delivery.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <a href={`mailto:${c.email}`} className="btn btn-ghost border-[var(--ink)] text-[var(--ink)]">
                    {c.emailLabel}
                    <ArrowRight size={15} strokeWidth={2.2} />
                  </a>
                  {c.resumeUrl ? (
                    <a href={c.resumeUrl} download className="btn btn-crimson">{resumeInner}</a>
                  ) : (
                    <button onClick={() => setResumeNote(true)} className="btn btn-crimson">{resumeInner}</button>
                  )}
                </div>
                {resumeNote && !c.resumeUrl && (
                  <p className="mt-3 f-mono text-[10px] tracking-[0.2em] text-[var(--crimson)]">
                    NO RESUME FILE LOADED — UPLOAD ONE VIA EDIT → CONTACT
                  </p>
                )}

                {/* channels — Email + LinkedIn + WhatsApp + Instagram */}
                <div className="mt-10 grid sm:grid-cols-2 gap-3">
                  <a href={`mailto:${c.email}`}
                    className="border border-[var(--line)] rounded-lg p-4 flex items-center gap-3 hover:border-[var(--crimson)] transition-colors duration-300 group">
                    <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--crimson)]">EMAIL</span>
                    <span className="f-tech font-bold text-[12px] tracking-[0.1em] ml-auto group-hover:text-[var(--crimson)] transition-colors">{c.email}</span>
                  </a>
                  {(c.socials ?? []).map((s) => (
                    <a key={s.label} href={s.url || "#contact"} target={s.url ? "_blank" : undefined} rel="noreferrer"
                      className="border border-[var(--line)] rounded-lg p-4 flex items-center gap-3 hover:border-[var(--crimson)] transition-colors duration-300 group">
                      <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--crimson)]">{s.label}</span>
                      <span className="ml-auto text-[var(--ink2)] group-hover:text-[var(--crimson)] transition-colors">
                        {s.label === "LINKEDIN" ? <LinkedInIcon size={14} /> : <ArrowRight size={14} strokeWidth={2} />}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

              {/* 9:16 portrait — widened frame, no dead right gap */}
              <div className="w-full max-w-[440px] lg:max-w-none lg:ml-auto" style={{ width: "min(100%, 440px)" }}>
                <MediaSlot item={c.portrait} ratio="9/16" />
                <div className="mt-3 flex items-center justify-between f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">
                  <span>PORTRAIT — 9:16</span>
                  <span className="text-[var(--crimson)]">CBK / 2026</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
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
