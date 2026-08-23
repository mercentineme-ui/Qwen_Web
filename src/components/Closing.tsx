import React, { useState } from "react";
import { useLocalTime, useReducedMotion, useStore } from "../lib/store";
import { ArrowDown, ArrowRight, ArrowUp, Rune } from "./icons";
import { MediaSlot, Reveal, SectionHead, useInView } from "./ui";

/* ---------- stylized technical mailbox — production object ---------- */
function Mailbox() {
  return (
    <svg width="224" height="206" viewBox="0 0 240 220" fill="none" aria-label="Production mailbox — stylized technical illustration">
      {/* ground */}
      <line x1="14" y1="208" x2="226" y2="208" stroke="var(--line)" strokeWidth="2" strokeDasharray="5 7" />
      {/* post */}
      <rect x="112" y="122" width="16" height="82" fill="var(--sup2)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="104" y="116" width="32" height="10" fill="var(--sup1)" stroke="var(--ink)" strokeWidth="2" />
      {/* hazard base */}
      <rect x="94" y="196" width="52" height="12" fill="var(--sup1)" stroke="var(--ink)" strokeWidth="2" />
      <path d="M100 208l10-12M114 208l10-12M128 208l10-12" stroke="var(--crimson)" strokeWidth="3" />
      {/* body */}
      <rect x="38" y="34" width="164" height="90" rx="10" fill="var(--sup2)" stroke="var(--ink)" strokeWidth="2.5" />
      <line x1="38" y1="58" x2="202" y2="58" stroke="var(--ink)" strokeWidth="1.6" />
      {/* rivets */}
      <circle cx="48" cy="46" r="2.2" fill="var(--ink2)" />
      <circle cx="192" cy="46" r="2.2" fill="var(--ink2)" />
      <circle cx="48" cy="114" r="2.2" fill="var(--ink2)" />
      <circle cx="192" cy="114" r="2.2" fill="var(--ink2)" />
      {/* slot + envelope */}
      <rect x="62" y="72" width="90" height="14" rx="3" fill="var(--page)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="76" y="56" width="56" height="30" fill="var(--sup1)" stroke="var(--ink2)" strokeWidth="1.8" />
      <path d="M76 56l28 18 28-18" stroke="var(--ink2)" strokeWidth="1.8" />
      {/* plate */}
      <rect x="150" y="94" width="40" height="20" rx="3" fill="var(--page)" stroke="var(--ink)" strokeWidth="1.8" />
      <text x="170" y="108" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" letterSpacing="2" fill="var(--ink2)">CBK</text>
      {/* signal lamp */}
      <circle cx="56" cy="104" r="4" fill="var(--crimson)" />
      <circle cx="56" cy="104" r="8" stroke="var(--crimson)" strokeWidth="1.4" opacity="0.5" />
      {/* flag */}
      <rect x="198" y="40" width="6" height="44" fill="var(--ink)" />
      <polygon points="204,40 236,49 204,60" fill="var(--crimson)" />
    </svg>
  );
}

/* ================= 06 — HOW I BUILD // THE PIPELINE ================= */

export function HowIBuild() {
  const { data } = useStore();
  return (
    <section id="build" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="06 — HOW I BUILD"
          title="THE"
          titleAccent="PIPELINE"
          desc="One mark, five moves — every project walks the same path, from blind briefing to final delivery."
          meta="PROCESS · FIVE MOVES"
        />
        <div className="mt-10 grid lg:grid-cols-[280px_1fr] gap-10 lg:gap-16">
          {/* the only rune */}
          <Reveal>
            <div className="group flex lg:flex-col items-center lg:items-start gap-6">
              <span className="text-[var(--ink2)] transition-colors duration-400 group-hover:text-[var(--crimson)] lg:sticky lg:top-32">
                <Rune size={110} strokeWidth={1.6} />
              </span>
              <div className="lg:mt-6">
                <p className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">RUNE // PROCESS</p>
                <p className="mt-3 text-[13px] leading-relaxed text-[var(--ink2)] max-w-[30ch]">
                  One mark, five moves. Every project walks the same path — from blind briefing to final delivery.
                </p>
              </div>
            </div>
          </Reveal>

          <div>
            {data.build.steps.map((s, i) => (
              <Reveal key={s.num} delay={i * 0.05}>
                <div className="group grid grid-cols-[64px_1fr] sm:grid-cols-[110px_1fr] gap-4 sm:gap-8 py-6 border-t border-[var(--line)] last:border-b hover:bg-[var(--sup1)] transition-colors duration-400 px-2 sm:px-4 rounded-lg">
                  <span className="f-display text-2xl sm:text-3xl text-[var(--ink2)] group-hover:text-[var(--crimson)] transition-colors duration-400 leading-none pt-1">
                    {s.num}
                  </span>
                  <div>
                    <h4 className="f-striker text-[14px] sm:text-[16px] tracking-[0.14em] group-hover:text-[var(--crimson)] transition-colors duration-400">
                      {s.title}
                    </h4>
                    <p className="mt-2 text-[13px] sm:text-[14px] leading-relaxed text-[var(--ink2)] max-w-[64ch]">{s.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* mailbox — the pipeline's delivery point */}
        <Reveal className="mt-14">
          <div className="mat-page-card mat-texture rounded-xl border border-[var(--line)] px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0 text-[var(--ink)]">
              <Mailbox />
            </div>
            <div className="min-w-0 sm:border-l sm:border-[var(--line)] sm:pl-10">
              <span className="f-mono text-[10px] tracking-[0.3em] text-[var(--crimson)]">MAILBOX // SIGNALS WELCOME</span>
              <h4 className="f-tech font-bold text-[17px] sm:text-xl tracking-[0.16em] mt-3">DROP A BRIEF IN</h4>
              <p className="mt-3 text-[13px] sm:text-[14px] leading-relaxed text-[var(--ink2)] max-w-[56ch]">
                The pipeline ends at a mailbox. Send the strange brief, the half-formed idea, the frame nobody can describe — it comes back as a build.
              </p>
              <a href="#contact" className="inline-flex items-center gap-2.5 mt-5 f-tech font-bold text-[11px] tracking-[0.24em] text-[var(--crimson)] hover:gap-4 transition-all duration-300">
                CONTINUE TO CONTACT <ArrowDown size={14} strokeWidth={2.2} />
              </a>
            </div>
          </div>
        </Reveal>
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

        <div className="mt-12 grid lg:grid-cols-[1.18fr_0.82fr] gap-12 lg:gap-16 items-start">
          <div className="min-w-0">
            {/* +40% scale headline — one line on desktop */}
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

            <Reveal delay={0.16}>
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

          {/* 9:16 portrait — widened frame, no dead right gap */}
          <Reveal delay={0.12}>
            <div className="w-full max-w-[440px] lg:max-w-none lg:ml-auto" style={{ width: "min(100%, 440px)" }}>
              <MediaSlot item={c.portrait} ratio="9/16" />
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
