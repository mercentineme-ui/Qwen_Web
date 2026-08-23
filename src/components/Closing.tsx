import React, { useState } from "react";
import { useLocalTime, useReducedMotion, useStore } from "../lib/store";
import { ArrowRight, ArrowUp, Rune } from "./icons";
import { MediaSlot, Reveal, SectionHead, useInView } from "./ui";

/* ================= 06 — HOW I BUILD ================= */

export function HowIBuild() {
  const { data } = useStore();
  return (
    <section id="build" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead num="06" title="HOW I BUILD" meta="PROCESS · FIVE MOVES" />
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
        <SectionHead num="07" title="CONTACT" meta="OPEN FOR PIPELINES, FILMS & SYSTEMS" />

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
