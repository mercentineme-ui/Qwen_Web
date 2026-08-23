import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { MediaSlot, Reveal, SectionHead } from "./ui";

const CYCLE_MS = 30000;
const ROW_H = 104;

function Description({ text }: { text: string }) {
  const parts = text.split(/\[\s*(.*?)\s*\]/g);
  return (
    <p className="text-[13px] sm:text-[14px] leading-relaxed">
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <em key={i} className="not-italic font-bold text-[var(--crimson)] tracking-wide"> {p} </em>
        ) : (
          <React.Fragment key={i}>{p}</React.Fragment>
        )
      )}
    </p>
  );
}

function ModuleHeading({ tag, title, right }: { tag: string; title: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b-2 border-[var(--ink)] pb-3">
      <h3 className="f-tech font-bold text-[14px] sm:text-[16px] tracking-[0.24em] flex items-center gap-3 whitespace-nowrap">
        <span className="w-2.5 h-2.5 bg-[var(--crimson)] shrink-0" />
        {title}
      </h3>
      <span className="f-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[var(--ink2)] flex items-center gap-2 min-w-0 truncate">
        <span className="f-mono text-[var(--crimson)]">{tag}</span>
        {right}
      </span>
    </div>
  );
}

export default function Expertise() {
  const { data } = useStore();
  const { statement, statementAccent, supporting, companies } = data.expertise;
  const [active, setActive] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hover, setHover] = useState(false);
  const reduced = useReducedMotion();
  const elapsedRef = useRef(0);
  const n = companies.length;

  /* 30s cycle — hover pauses and resumes at the exact position */
  useEffect(() => {
    elapsedRef.current = 0;
    if (reduced || locked || n < 2) return;
    let last = performance.now();
    const iv = window.setInterval(() => {
      if (hover) {
        last = performance.now();
        return;
      }
      const now = performance.now();
      elapsedRef.current += now - last;
      last = now;
      if (elapsedRef.current >= CYCLE_MS) {
        elapsedRef.current = 0;
        setActive((a) => (a + 1) % n);
      }
    }, 120);
    return () => clearInterval(iv);
  }, [active, locked, hover, n, reduced]);

  const pick = (i: number) => {
    if (i === active && locked) setLocked(false);
    else {
      setActive(i);
      setLocked(true);
    }
  };
  const co = companies[active];

  return (
    <section id="expertise" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="01 — MY EXPERTISE"
          long
          titleNode={
            <>
              {statement} <span className="text-[var(--crimson)]">{statementAccent}</span>
            </>
          }
          desc={supporting}
          meta="2018 — 2026 · FOUR CHAPTERS"
        />

        <Reveal className="mt-10 grid lg:grid-cols-[1.05fr_0.95fr] gap-x-6 gap-y-8 lg:gap-x-10">
          <ModuleHeading tag="A" title="CAREER INFO" right={locked ? "CLICK NODE TO RELEASE" : hover ? "CYCLE HELD" : reduced ? "STATIC" : "AUTO CYCLE · 30S"} />
          <ModuleHeading tag="B" title="CAREER NODE MAP" right={<span className="text-[var(--ink)]">{co.num} — {co.name}</span>} />
        </Reveal>

        {/* ================= MY JOURNEY — ONE integrated parent system ================= */}
        <Reveal className="mt-6">
          <div className="mat-outer mat-texture rounded-xl p-4 sm:p-6 xl:p-7 lg:h-[672px] overflow-hidden"
            onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
            <div className="flex items-center justify-between mb-5 px-1">
              <span className="f-display text-[15px] sm:text-lg tracking-[0.14em] flex items-center gap-3">
                <span className="w-2.5 h-2.5 rotate-45 bg-[var(--crimson)]" />
                MY JOURNEY
              </span>
              <span className="f-mono text-[9px] sm:text-[10px] tracking-[0.26em]" style={{ color: "var(--m-sub)" }}>
                GRAPHIC DESIGN → AI DESIGN → GEN AI → AI CREATIVE DIRECTION
              </span>
            </div>

            <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-5 lg:gap-7 lg:h-[calc(100%-52px)]">
              {/* ---------- CAREER INFO — opposite material card ---------- */}
              <div className="mat-inner mat-texture rounded-xl p-4 sm:p-5 xl:p-6 flex flex-col min-h-0 overflow-hidden">
                {/* company selector */}
                <div className="flex flex-wrap items-center gap-2">
                  {companies.map((c, i) => (
                    <button key={c.id} onClick={() => pick(i)}
                      className={`f-tech font-bold text-[10px] sm:text-[11px] tracking-[0.18em] px-3 py-2.5 rounded-lg border transition-all duration-300 ${
                        i === active
                          ? "bg-[var(--crimson)] border-[var(--crimson)] text-[#f4f2ed]"
                          : "border-[var(--m-line)] text-[var(--m-sub)] hover:text-[var(--outer-ink)] hover:border-[var(--outer-ink)]"
                      }`}>
                      {c.num} — {c.name}
                    </button>
                  ))}
                  {!reduced && (
                    <div className="ml-auto hidden sm:block w-28 h-[3px] bg-[var(--m-line)] rounded overflow-hidden">
                      <div key={active} className="h-full bg-[var(--crimson)] origin-left"
                        style={{ animation: `progFill ${CYCLE_MS}ms linear both`, animationPlayState: hover || locked ? "paused" : "running" }} />
                    </div>
                  )}
                </div>

                <div className="mt-5 grid xl:grid-cols-[0.95fr_1.25fr] gap-5 lg:gap-7 flex-1 min-h-0">
                  {/* dossier inner card — fold + signal + masked data pass */}
                  <div className="mat-page-card mat-texture chamfer relative p-4 sm:p-5 flex flex-col min-h-0 overflow-hidden">
                    <div key={co.id} className="dossier-swap flex flex-col gap-3 min-h-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="f-striker text-[12px] sm:text-[13px] tracking-[0.14em] text-[var(--crimson)]">{co.role}</span>
                          <h4 className="f-display text-[clamp(1.4rem,2.3vw,2.1rem)] mt-1.5 leading-none">{co.name}</h4>
                        </div>
                        <span className="f-display text-[2.4rem] leading-none opacity-15 shrink-0">{co.num}</span>
                      </div>
                      <span className="f-mono text-[10px] tracking-[0.2em] text-[var(--ink2)]">{co.date}</span>
                      <Description text={co.description} />
                      {co.domain && (
                        <span className="f-tech font-bold text-[12px] tracking-[0.18em]">
                          PROJECT / DOMAIN — <span className="text-[var(--crimson)] text-[14px]">{co.domain}</span>
                        </span>
                      )}
                      <div className="mt-auto pt-3.5 border-t border-[var(--line)] flex flex-col gap-2.5">
                        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                          <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--ink2)] w-full">SKILLS</span>
                          {co.skills.map((s) => (
                            <span key={s} className="f-striker text-[9px] sm:text-[10px] tracking-[0.12em] opacity-90">{s}</span>
                          ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                          <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--ink2)] w-full">TOOLS</span>
                          {co.tools.map((t, i) => (
                            <React.Fragment key={t}>
                              <span className="f-tech font-bold text-[11px] tracking-[0.14em]">{t}</span>
                              {i < co.tools.length - 1 && <span className="text-[var(--crimson)] text-[10px]">/</span>}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div key={`scan-${co.id}`} className="scan-pass absolute top-0 bottom-0 w-1/3 pointer-events-none"
                      style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--crimson) 16%, transparent), transparent)" }} />
                  </div>

                  {/* media tiles — exact counts 3 / 3 / 2 / 1 */}
                  <div className="flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--ink2)]">MEDIA — {String(co.media.length).padStart(2, "0")} SLOTS</span>
                      <span className="f-mono text-[9px] tracking-[0.2em] text-[var(--ink2)]">{co.name}</span>
                    </div>
                    <div key={`media-${co.id}`} className="dossier-swap grid grid-cols-3 gap-3 sm:gap-4 content-start">
                      {co.media.map((m) => (
                        <MediaSlot key={m.id} item={m} ratio="1/1" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ---------- CAREER NODE MAP — lives ON the outer material ---------- */}
              <div className="relative flex flex-col min-h-0 lg:border-l lg:pl-7" style={{ borderColor: "var(--m-line)" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="f-mono text-[9px] sm:text-[10px] tracking-[0.26em]" style={{ color: "var(--m-sub)" }}>
                    SIGNAL ROUTE — CIRCUIT → TRUNK → NODE
                  </span>
                  <span className="f-mono text-[9px] sm:text-[10px] tracking-[0.2em] text-[var(--crimson)] hidden sm:block">{co.num} ROUTED</span>
                </div>

                <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-x-0 sm:gap-x-6 flex-1 content-center">
                  {/* LEFT — four company node modules, left of the trunk */}
                  <div className="flex flex-col justify-center">
                    {companies.map((c, i) => (
                      <div key={c.id} className="flex items-center" style={{ height: ROW_H }}>
                        <button onClick={() => pick(i)}
                          className={`relative group flex-1 h-[68px] chamfer-sm flex items-center gap-3 px-3 sm:px-5 text-left transition-all duration-400 ${
                            i === active ? "bg-[var(--crimson)] text-[#f4f2ed]" : "mat-inner mat-texture hover:translate-x-1"
                          }`}
                          style={i === active ? { boxShadow: "0 14px 34px -16px rgba(227,34,64,0.65)" } : undefined}>
                          <span className={`f-display text-lg sm:text-xl ${i === active ? "opacity-90" : "opacity-25"}`}>{c.num}</span>
                          <span className="min-w-0">
                            <span className="block f-tech font-bold text-[10px] sm:text-[12px] tracking-[0.16em] truncate">{c.name}</span>
                            <span className={`block f-mono text-[8px] sm:text-[9px] tracking-[0.14em] mt-0.5 ${i === active ? "text-[#f4c9d1]" : "text-[var(--m-sub)]"}`}>
                              {c.date.split("·")[0].trim()}
                            </span>
                          </span>
                          <span className={`absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-7 transition-colors duration-300 hidden sm:block ${i === active ? "bg-[var(--crimson)]" : "bg-[var(--m-line)]"}`} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* CENTER — physical structural trunk */}
                  <div className="relative w-12 sm:w-16 mat-texture rounded-[6px] border-x-4 self-center"
                    style={{ backgroundColor: "var(--m-sup2, var(--sup2))", borderColor: "var(--outer-ink)", height: ROW_H * n, boxShadow: "inset 0 0 0 1px var(--m-line)" }}>
                    {/* inset channel */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-3 bottom-3 w-[6px] border-x" style={{ borderColor: "var(--m-line)", backgroundColor: "var(--page)" }}>
                      <div className="absolute inset-0" style={{ background: "repeating-linear-gradient(180deg, var(--line) 0 2px, transparent 2px 12px)" }} />
                      {/* trunk data packet — vertical */}
                      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 6 100">
                        <path d="M3 0 V100" pathLength={352} stroke="var(--crimson)" strokeWidth="2.4" className={reduced ? undefined : "packet"} vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                    {/* technical rails */}
                    <div className="absolute left-1 top-2 bottom-2 w-[3px]" style={{ background: "repeating-linear-gradient(180deg, var(--m-line) 0 6px, transparent 6px 14px)" }} />
                    <div className="absolute right-1 top-2 bottom-2 w-[3px]" style={{ background: "repeating-linear-gradient(180deg, var(--m-line) 0 6px, transparent 6px 14px)" }} />
                    {/* junction housings + docking sockets */}
                    {companies.map((c, i) => (
                      <div key={c.id} className="absolute left-1/2 -translate-x-1/2 w-9 sm:w-11" style={{ top: i * ROW_H + ROW_H / 2 - 18 }}>
                        <div className={`h-9 rounded-[5px] border-2 transition-all duration-500 relative ${i === active ? "bg-[var(--crimson)] border-[var(--crimson)]" : "border-[var(--m-line)]"}`}
                          style={i === active ? undefined : { backgroundColor: "var(--sup1)" }}>
                          <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-current opacity-50" />
                          <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current opacity-50" />
                          <span className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-current opacity-50" />
                          <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-current opacity-50" />
                          <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 ${i === active ? "bg-[#f4f2ed]" : "bg-[var(--m-line)]"}`} />
                        </div>
                      </div>
                    ))}
                    {/* active signal pierce node → trunk */}
                    <div className="absolute -left-6 sm:-left-8 w-[calc(100%+3rem)] h-[3px] bg-[var(--crimson)] transition-all duration-500"
                      style={{ top: active * ROW_H + ROW_H / 2 - 1, boxShadow: "0 0 12px rgba(227,34,64,0.8)" }} />
                  </div>

                  {/* RIGHT — technical circuit infrastructure + moving packets */}
                  <div className="relative hidden sm:block">
                    <svg viewBox={`0 0 300 ${ROW_H * n}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none" fill="none">
                      {/* solid structural bus lines */}
                      <line x1="186" y1="14" x2="186" y2={ROW_H * n - 14} stroke="var(--m-line)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
                      <line x1="252" y1="34" x2="252" y2={ROW_H * n - 34} stroke="var(--m-line)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeDasharray="3 6" />
                      {companies.map((c, i) => {
                        const y = i * ROW_H + ROW_H / 2;
                        return (
                          <g key={c.id}>
                            {/* angular circuit route */}
                            <path d={`M0 ${y} H70 L92 ${y - 14} H150 L164 ${y} H300`} stroke="var(--m-line)" strokeWidth="1.8" vectorEffect="non-scaling-stroke" />
                            {/* junction blocks + connector hardware */}
                            <rect x="176" y={y - 10} width="20" height="20" fill="var(--sup1)" stroke="var(--m-line)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                            <rect x="181" y={y - 5} width="10" height="10" fill="none" stroke="var(--m-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                            <rect x="243" y={y - 15} width="18" height="9" fill="var(--m-line)" />
                            <rect x="243" y={y + 6} width="18" height="4" fill="var(--m-line)" opacity="0.6" />
                            <path d={`M282 ${y - 5}h12M288 ${y - 11}v12`} stroke="var(--outer-ink)" strokeWidth="1.3" vectorEffect="non-scaling-stroke" opacity="0.7" />
                            {/* docking pads */}
                            <rect x="64" y={y - 4} width="8" height="8" fill="var(--m-line)" />
                            <rect x="146" y={y - 18} width="8" height="8" fill="var(--m-line)" opacity="0.7" />
                          </g>
                        );
                      })}
                      {/* ambient data packets on the bus */}
                      {!reduced && (
                        <>
                          <path d={`M300 20 H186 V${ROW_H * n - 20}`} pathLength={352} stroke="var(--outer-ink)" strokeOpacity="0.55" strokeWidth="2" className="packet" vectorEffect="non-scaling-stroke" />
                          <path d={`M186 24 V${ROW_H * n - 24} H290`} pathLength={352} stroke="var(--outer-ink)" strokeOpacity="0.35" strokeWidth="1.6" className="packet-2" vectorEffect="non-scaling-stroke" />
                        </>
                      )}
                      {/* active crimson signal route */}
                      {(() => {
                        const y = active * ROW_H + ROW_H / 2;
                        return (
                          <g>
                            <path d={`M300 ${y} H164 L150 ${y - 14} H92 L70 ${y} H0`} stroke="var(--crimson)" strokeWidth="2.6" vectorEffect="non-scaling-stroke" strokeDasharray="10 8" className={reduced ? undefined : "dash-flow"} style={{ filter: "drop-shadow(0 0 5px rgba(227,34,64,0.7))" }} />
                            <rect x="178" y={y - 8} width="16" height="16" fill="var(--crimson)" />
                            <rect x="182" y={y - 4} width="8" height="8" fill="#f4f2ed" />
                          </g>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* legend */}
                <div className="mt-4 pt-3.5 border-t flex flex-wrap gap-x-7 gap-y-2 f-mono text-[8px] sm:text-[9px] tracking-[0.22em]" style={{ borderColor: "var(--m-line)", color: "var(--m-sub)" }}>
                  <span className="flex items-center gap-2"><span className="w-3 h-[3px] bg-[var(--crimson)]" />SIGNAL</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 border-2" style={{ borderColor: "var(--m-sub)" }} />JUNCTION</span>
                  <span className="flex items-center gap-2"><span className="w-3 h-[3px]" style={{ background: "repeating-linear-gradient(90deg, currentColor 0 3px, transparent 3px 6px)" }} />TRUNK</span>
                  <span className="ml-auto">{locked ? "NODE LOCKED" : "AUTO 30S"}</span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
