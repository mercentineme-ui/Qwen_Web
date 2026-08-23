import React, { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { MediaSlot, Reveal, SectionHead } from "./ui";

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

const ROW_H = 104;

export default function Expertise() {
  const { data } = useStore();
  const { statement, statementAccent, supporting, companies } = data.expertise;
  const [tab, setTab] = useState<"info" | "map">("info");
  const [active, setActive] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hover, setHover] = useState(false);
  const [runId, setRunId] = useState(0);
  const n = companies.length;

  useEffect(() => {
    setRunId((r) => r + 1);
    if (locked || hover) return;
    const t = window.setInterval(() => setActive((a) => (a + 1) % n), 30000);
    return () => clearInterval(t);
  }, [locked, hover, n]);

  const pick = (i: number) => {
    if (i === active && locked) {
      setLocked(false);
    } else {
      setActive(i);
      setLocked(true);
    }
  };

  const co = companies[active];

  return (
    <section id="expertise" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead num="01" title="MY EXPERTISE" meta="2018 — 2026 · FOUR CHAPTERS" />

        <Reveal className="mt-10">
          <h3 className="f-display text-[clamp(1.7rem,4.4vw,3.4rem)] leading-[1.02]">
            {statement} <span className="text-[var(--crimson)]">{statementAccent}</span>
          </h3>
          <p className="mt-3 f-mono text-[11px] sm:text-xs tracking-[0.18em] text-[var(--ink2)] max-w-[70ch]">{supporting}</p>
        </Reveal>

        {/* tabs */}
        <Reveal className="mt-8 flex flex-wrap items-center gap-3">
          {(["info", "map"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`f-tech font-bold text-[11px] tracking-[0.24em] px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                tab === t ? "bg-[var(--ink)] text-[var(--page)] border-[var(--ink)]" : "border-[var(--line)] text-[var(--ink2)] hover:border-[var(--ink)] hover:text-[var(--ink)]"
              }`}>
              {t === "info" ? "CAREER INFO" : "CAREER NODE MAP"}
            </button>
          ))}
          <span className="ml-auto f-mono text-[10px] tracking-[0.26em] text-[var(--ink2)] flex items-center gap-2">
            <span className={`w-1.5 h-1.5 ${locked ? "bg-[var(--ink2)]" : "bg-[var(--crimson)] live-blink"}`} />
            {locked ? "LOCKED — CLICK NODE TO RELEASE" : hover ? "CYCLE PAUSED" : "AUTO CYCLE · 30S"}
          </span>
        </Reveal>

        {/* ================= CAREER INFO ================= */}
        <div className={`transition-all duration-500 ${tab === "info" ? "opacity-100" : "hidden"}`}>
          <Reveal className="mt-6">
            <div className="mat-outer mat-texture rounded-xl p-5 sm:p-8 lg:p-10 lg:h-[680px] flex flex-col overflow-hidden"
              onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
              {/* company selector */}
              <div className="flex flex-wrap items-center gap-2.5">
                {companies.map((c, i) => (
                  <button key={c.id} onClick={() => pick(i)}
                    className={`f-tech font-bold text-[10px] sm:text-[11px] tracking-[0.2em] px-3.5 py-2.5 rounded-lg border transition-all duration-300 ${
                      i === active
                        ? "bg-[var(--crimson)] border-[var(--crimson)] text-[#f4f2ed]"
                        : "border-[var(--m-line)] text-[var(--m-sub)] hover:text-[var(--outer-ink)] hover:border-[var(--outer-ink)]"
                    }`}>
                    {c.num} — {c.name}
                  </button>
                ))}
                {/* cycle progress */}
                <div className="ml-auto hidden sm:block w-28 h-[3px] bg-[var(--m-line)] rounded overflow-hidden">
                  <div key={`${active}-${runId}`} className="h-full bg-[var(--crimson)] origin-left"
                    style={{ animation: "progFill 30s linear both", animationPlayState: hover || locked ? "paused" : "running" }} />
                </div>
              </div>

              <div className="mt-6 grid lg:grid-cols-[0.95fr_1.25fr] gap-6 lg:gap-10 flex-1 min-h-0">
                {/* dossier inner card — opposite material */}
                <div className="mat-inner mat-texture chamfer relative p-6 sm:p-7 flex flex-col min-h-0 overflow-hidden">
                  <div key={co.id} className="dossier-swap flex flex-col gap-4 min-h-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="f-striker text-[12px] sm:text-[13px] tracking-[0.14em] text-[var(--crimson)]">{co.role}</span>
                        <h4 className="f-display text-[clamp(1.6rem,2.6vw,2.4rem)] mt-1.5 leading-none">{co.name}</h4>
                      </div>
                      <span className="f-display text-[2.6rem] leading-none opacity-15 shrink-0">{co.num}</span>
                    </div>
                    <span className="f-mono text-[10px] tracking-[0.22em] text-[var(--m-sub)]">{co.date}</span>
                    <Description text={co.description} />
                    {co.domain && (
                      <span className="f-tech font-bold text-[12px] tracking-[0.18em]">
                        PROJECT / DOMAIN — <span className="text-[var(--crimson)] text-[13px]">{co.domain}</span>
                      </span>
                    )}
                    <div className="mt-auto pt-4 border-t m-line flex flex-col gap-3">
                      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                        <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--m-sub)] w-full">SKILLS</span>
                        {co.skills.map((s) => (
                          <span key={s} className="f-striker text-[9px] sm:text-[10px] tracking-[0.12em] opacity-90">{s}</span>
                        ))}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                        <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--m-sub)] w-full">TOOLS</span>
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
                    <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--m-sub)]">MEDIA — {String(co.media.length).padStart(2, "0")} SLOTS</span>
                    <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--m-sub)]">{co.name}</span>
                  </div>
                  <div key={`media-${co.id}`} className="dossier-swap grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 content-start">
                    {co.media.map((m) => (
                      <MediaSlot key={m.id} item={m} ratio="1/1" className="mat-inner" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ================= CAREER NODE MAP ================= */}
        <div className={`transition-all duration-500 ${tab === "map" ? "opacity-100" : "hidden"}`}>
          <Reveal className="mt-6">
            <div className="mat-page-card mat-texture rounded-xl border border-[var(--line)] p-5 sm:p-8 lg:p-10 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">CAREER NODE MAP // SIGNAL ROUTE — CIRCUIT → TRUNK → NODE</span>
                <span className="f-mono text-[10px] tracking-[0.2em] text-[var(--crimson)] hidden sm:block">ACTIVE — {co.name}</span>
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-x-0 sm:gap-x-6">
                {/* LEFT — company node modules */}
                <div className="flex flex-col">
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
                        {/* connector */}
                        <span className={`absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-7 transition-colors duration-300 hidden sm:block ${i === active ? "bg-[var(--crimson)]" : "bg-[var(--line)]"}`} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* CENTER — structural trunk */}
                <div className="relative w-12 sm:w-16 mat-texture rounded-[6px] border-x-4 border-[var(--ink)]" style={{ backgroundColor: "var(--sup2)", height: ROW_H * n }}>
                  {/* inset channel */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-3 bottom-3 w-[6px] bg-[var(--page)] border-x border-[var(--line)]">
                    <div className="absolute inset-x-0 top-0 bottom-0" style={{ background: "repeating-linear-gradient(180deg, var(--line) 0 2px, transparent 2px 12px)" }} />
                  </div>
                  {/* technical ticks */}
                  <div className="absolute left-1 top-2 bottom-2 w-[3px]" style={{ background: "repeating-linear-gradient(180deg, var(--line) 0 6px, transparent 6px 14px)" }} />
                  <div className="absolute right-1 top-2 bottom-2 w-[3px]" style={{ background: "repeating-linear-gradient(180deg, var(--line) 0 6px, transparent 6px 14px)" }} />
                  {/* junction housings + docking sockets */}
                  {companies.map((c, i) => (
                    <div key={c.id} className="absolute left-1/2 -translate-x-1/2 w-9 sm:w-11" style={{ top: i * ROW_H + ROW_H / 2 - 18 }}>
                      <div className={`h-9 rounded-[5px] border-2 transition-all duration-500 relative ${i === active ? "bg-[var(--crimson)] border-[var(--crimson)]" : "bg-[var(--sup1)] border-[var(--line)]"}`}>
                        <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-current opacity-50" />
                        <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current opacity-50" />
                        <span className="absolute bottom-1 left-1 w-1 h-1 rounded-full bg-current opacity-50" />
                        <span className="absolute bottom-1 right-1 w-1 h-1 rounded-full bg-current opacity-50" />
                        <span className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rotate-45 ${i === active ? "bg-[#f4f2ed]" : "bg-[var(--line)]"}`} />
                      </div>
                    </div>
                  ))}
                  {/* active signal pierce */}
                  <div className="absolute -left-6 sm:-left-8 w-[calc(100%+3rem)] h-[3px] bg-[var(--crimson)] transition-all duration-500"
                    style={{ top: active * ROW_H + ROW_H / 2 - 1, boxShadow: "0 0 12px rgba(227,34,64,0.8)" }} />
                </div>

                {/* RIGHT — circuit field */}
                <div className="relative hidden sm:block">
                  <svg viewBox={`0 0 300 ${ROW_H * n}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="none" fill="none">
                    {/* static structure */}
                    <line x1="186" y1="18" x2="186" y2={ROW_H * n - 18} stroke="var(--line)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    <line x1="252" y1="40" x2="252" y2={ROW_H * n - 40} stroke="var(--line)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeDasharray="3 6" />
                    {companies.map((c, i) => {
                      const y = i * ROW_H + ROW_H / 2;
                      return (
                        <g key={c.id}>
                          <path d={`M0 ${y} H70 L92 ${y - 14} H150 L164 ${y} H300`} stroke="var(--line)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
                          <rect x="176" y={y - 9} width="20" height="18" fill="var(--sup1)" stroke="var(--line)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
                          <rect x="243" y={y - 14} width="18" height="8" fill="var(--line)" />
                          <path d={`M284 ${y - 5}h10M289 ${y - 10}v10`} stroke="var(--ink2)" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
                        </g>
                      );
                    })}
                    {/* active signal route */}
                    {(() => {
                      const y = active * ROW_H + ROW_H / 2;
                      return (
                        <g>
                          <path d={`M300 ${y} H164 L150 ${y - 14} H92 L70 ${y} H0`} stroke="var(--crimson)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" strokeDasharray="10 8" className="dash-flow" style={{ filter: "drop-shadow(0 0 5px rgba(227,34,64,0.7))" }} />
                          <rect x="178" y={y - 7} width="16" height="14" fill="var(--crimson)" />
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* map footer legend */}
              <div className="mt-6 pt-4 border-t border-[var(--line)] flex flex-wrap gap-x-8 gap-y-2 f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)]">
                <span className="flex items-center gap-2"><span className="w-3 h-[3px] bg-[var(--crimson)]" />SIGNAL ROUTE</span>
                <span className="flex items-center gap-2"><span className="w-3 h-3 border-2 border-[var(--ink2)]" />JUNCTION HOUSING</span>
                <span className="flex items-center gap-2"><span className="w-3 h-[3px]" style={{ background: "repeating-linear-gradient(90deg, var(--ink2) 0 3px, transparent 3px 6px)" }} />STRUCTURAL TRUNK</span>
                <span className="ml-auto">CLICK NODE TO LOCK · {locked ? "LOCKED" : "AUTO 30S"}</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
