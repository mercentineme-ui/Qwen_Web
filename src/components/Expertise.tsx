import React, { useEffect, useRef, useState } from "react";
import { Company } from "../lib/data";
import { useReducedMotion, useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

/* manufactured silhouette: stepped notch top-right + chamfer bottom-left */
const CLIP =
  "polygon(0 0, calc(100% - 30px) 0, calc(100% - 30px) 10px, calc(100% - 12px) 10px, calc(100% - 12px) 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))";

const yearOf = (d: string) => (d.match(/\d{4}/) || [""])[0];

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center f-tech font-semibold text-[9px] sm:text-[10px] tracking-[0.12em] px-2 py-[3px]"
      style={{ border: "1px solid color-mix(in srgb, var(--outer-ink) 30%, transparent)", color: "var(--outer-ink)", opacity: 0.9 }}>
      {children}
    </span>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block f-mono text-[8px] tracking-[0.28em] mb-2" style={{ color: "var(--crim-panel)" }}>{label}</span>
      {children}
    </div>
  );
}

export default function Expertise() {
  const { data } = useStore();
  const { statement, statementAccent, supporting, companies } = data.expertise;
  const reduced = useReducedMotion();
  const n = companies.length;

  const [locked, setLocked] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mediaView, setMediaView] = useState<number | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const expanded = locked ?? hovered;
  const activeCo: Company | null = expanded != null ? companies[expanded] : null;

  /* rail column template — expanded card claims real layout space, neighbors physically shift */
  const cols = companies
    .map((_, i) => (i === expanded ? "minmax(0, 3.4fr)" : "minmax(0, 1fr)"))
    .join(" ");

  const toggleLock = (i: number) => setLocked((prev) => (prev === i ? null : i));

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const next = e.key === "ArrowRight" ? (i + 1) % n : (i - 1 + n) % n;
      cardRefs.current[next]?.focus();
      setHovered(next);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleLock(i);
    } else if (e.key === "Escape") {
      setLocked(null);
      setHovered(null);
    }
  };

  return (
    <section id="expertise" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="01 — EXPERIENCE"
          titleNode={<>{statement} <span style={{ color: "var(--crimson-rough)" }}>{statementAccent}</span></>}
          desc={supporting}
          meta="2018 — 2026 · FOUR CHAPTERS · HOVER TO OPEN · CLICK TO LOCK"
        />

        <Reveal className="mt-10">
          <div id="journey" className="mat-journey mat-texture rounded-xl p-5 sm:p-8 xl:p-10 relative overflow-hidden scroll-mt-28">
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crim-panel)" }} />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crim-panel)" }} />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8">
              <span className="w-3 h-9" style={{ background: "var(--crim-panel)" }} />
              <h3 className="f-display text-[clamp(1.7rem,3.4vw,2.8rem)] leading-none tracking-wide" style={{ color: "var(--outer-ink)" }}>
                MY JOURNEY
              </h3>
              <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>
                INDUSTRIAL ARCHIVE — {String(n).padStart(2, "0")} MODULES
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--m-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                {locked != null ? "MODULE LOCKED" : expanded != null ? "PREVIEW" : "STANDBY"}
              </span>
            </div>

            {/* ================= ARCHIVAL RAIL ================= */}
            <div className="journey-rail" style={{ ["--rail-cols" as string]: cols } as React.CSSProperties} role="tablist" aria-label="Career archive">
              {companies.map((c, i) => {
                const isOpen = expanded === i;
                const isActive = locked === i;
                return (
                  <div
                    key={c.id}
                    ref={(el) => { cardRefs.current[i] = el; }}
                    role="tab"
                    aria-selected={isOpen}
                    tabIndex={0}
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered((h) => (h === i ? null : h))}
                    onClick={() => toggleLock(i)}
                    onKeyDown={(e) => onKey(e, i)}
                    className="journey-card relative outline-none cursor-pointer mat-texture"
                    style={{
                      background: "var(--outer-bg)",
                      color: "var(--outer-ink)",
                      clipPath: CLIP,
                      boxShadow: isOpen
                        ? "inset 0 0 0 1.5px var(--crim-panel), 0 18px 40px -18px rgba(0,0,0,0.5)"
                        : "inset 0 0 0 1px color-mix(in srgb, var(--outer-ink) 22%, transparent), 0 8px 24px -16px rgba(0,0,0,0.35)",
                      transition: reduced ? "none" : "box-shadow 420ms cubic-bezier(0.22,1,0.36,1)",
                    }}
                  >
                    {/* inner recessed frame — visible gap between shell and frame */}
                    <div className="absolute inset-[7px] pointer-events-none" style={{ clipPath: CLIP, border: "1px solid color-mix(in srgb, var(--outer-ink) 24%, transparent)" }} />

                    {/* ---------- CLOSED VERTICAL FACE (desktop, when collapsed) ---------- */}
                    <div
                      className={"absolute inset-0 hidden flex-col items-stretch " + (isOpen ? "" : "lg:flex ")}
                      style={{ opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? "none" : "auto", transition: reduced ? "none" : "opacity 300ms ease" }}
                    >
                      {/* top technical header */}
                      <div className="flex items-center justify-between px-4 pt-4">
                        <span className="f-mono font-semibold text-[12px] tracking-[0.14em]" style={{ color: "var(--crim-panel)" }}>{c.num}</span>
                        <span className="f-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>EXP/{yearOf(c.date)}</span>
                      </div>
                      {/* upright stacked letters */}
                      <div className="flex-1 flex flex-col items-center justify-center gap-[3px] px-2 select-none">
                        {c.short.split("").map((ch, k) => (
                          <span key={k} className="f-tech font-bold text-[15px] leading-[1.05] tracking-[0.06em]" style={{ color: "var(--outer-ink)" }}>
                            {ch}
                          </span>
                        ))}
                      </div>
                      {/* bottom status */}
                      <div className="flex items-center justify-between px-4 pb-4">
                        <span className="f-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                          {isActive ? "STATUS / LOCKED" : isOpen ? "STATUS / OPEN" : "STATUS / IDLE"}
                        </span>
                        <span className="w-2 h-2 rotate-45" style={{ background: isOpen ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 30%, transparent)" }} />
                      </div>
                    </div>

                    {/* ---------- MOBILE CLOSED HEADER ---------- */}
                    <div className={"flex lg:hidden items-center gap-3 px-4 py-4 " + (isOpen ? "hidden" : "")}>
                      <span className="f-mono font-semibold text-[12px] tracking-[0.14em]" style={{ color: "var(--crim-panel)" }}>{c.num}</span>
                      <span className="f-tech font-bold text-[13px] tracking-[0.1em] flex-1" style={{ color: "var(--outer-ink)" }}>{c.name}</span>
                      <span className="w-2 h-2 rotate-45" style={{ background: isOpen ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 30%, transparent)" }} />
                    </div>

                    {/* ---------- EXPANDED DOSSIER ---------- */}
                    <div className={isOpen ? "block h-full" : "hidden lg:block lg:invisible"}>
                      <div className="h-full flex flex-col px-5 py-4 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                        {/* TOP: number + company + role + date */}
                        <div className="flex items-start justify-between gap-3 shrink-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                              <span className="f-mono font-semibold text-[12px] tracking-[0.14em]" style={{ color: "var(--crim-panel)" }}>{c.num}</span>
                              {c.discipline && <Chip>{c.discipline}</Chip>}
                            </div>
                            <h4 className="f-display text-[clamp(1.15rem,1.8vw,1.6rem)] leading-[1.02] mt-1.5 break-words" style={{ color: "var(--outer-ink)" }}>
                              {c.expandedName ?? c.name}
                            </h4>
                            <span className="block f-tech font-semibold text-[10px] tracking-[0.16em] mt-1" style={{ color: "var(--crim-panel)" }}>{c.role}</span>
                            <span className="block f-mono text-[9px] tracking-[0.14em] mt-1" style={{ color: "var(--m-sub)" }}>
                              {c.date}{c.location ? ` · ${c.location}` : ""}
                            </span>
                            {c.disciplineNote && (
                              <span className="block f-mono text-[8px] tracking-[0.16em] mt-1.5" style={{ color: "var(--m-sub)" }}>{c.disciplineNote}</span>
                            )}
                          </div>
                        </div>

                        {/* MEDIA — horizontal production strip */}
                        {c.media.length > 0 && (
                          <div className="mt-4 shrink-0">
                            <Block label={`MEDIA / ${String(c.media.length).padStart(2, "0")}`}>
                              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(c.media.length, 3)}, minmax(0,1fr))` }}>
                                {c.media.slice(0, 3).map((m, k) => (
                                  <MediaSlot key={m.id} item={m} ratio="16/9" fill className="mat-inner rounded-[4px]! border-0!" showLabel={false} onClick={() => setMediaView(k)} />
                                ))}
                              </div>
                            </Block>
                          </div>
                        )}

                        {/* SUMMARY */}
                        {c.summary && (
                          <div className="mt-4 shrink-0">
                            <Block label="EXPERIENCE">
                              <p className="text-[12px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: 0.88 }}>{c.summary}</p>
                            </Block>
                          </div>
                        )}

                        {/* HIGHLIGHTS / METRICS */}
                        {c.highlights && c.highlights.length > 0 && (
                          <div className="mt-4 shrink-0">
                            <Block label={c.highlightsLabel ?? "HIGHLIGHTS"}>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-[5px]">
                                {c.highlights.map((h) => (
                                  <li key={h} className="flex items-start gap-2 text-[10.5px] leading-snug" style={{ color: "var(--outer-ink)", opacity: 0.85 }}>
                                    <span className="mt-[5px] w-[5px] h-[5px] rotate-45 shrink-0" style={{ background: "var(--crim-panel)" }} />
                                    {h}
                                  </li>
                                ))}
                              </ul>
                            </Block>
                          </div>
                        )}

                        {/* TOOLS / METHODS */}
                        {c.tools && c.tools.length > 0 && (
                          <div className="mt-4 shrink-0">
                            <Block label="TOOLS / METHODS">
                              <div className="flex flex-wrap gap-1.5">{c.tools.map((t) => <Chip key={t}>{t}</Chip>)}</div>
                            </Block>
                          </div>
                        )}

                        {/* EXTRAS (KEY EXPERIENCE) */}
                        {c.extras && c.extras.length > 0 && (
                          <div className="mt-4 shrink-0">
                            <Block label={c.extrasLabel ?? "KEY EXPERIENCE"}>
                              <div className="flex flex-wrap gap-1.5">{c.extras.map((t) => <Chip key={t}>{t}</Chip>)}</div>
                            </Block>
                          </div>
                        )}

                        {/* footer technical marks */}
                        <div className="mt-auto pt-4 flex items-center justify-between shrink-0" style={{ borderTop: "1px solid color-mix(in srgb, var(--outer-ink) 16%, transparent)" }}>
                          <span className="f-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>ARCHIVE / {c.num}</span>
                          <span className="f-mono text-[8px] tracking-[0.2em]" style={{ color: isActive ? "var(--crim-panel)" : "var(--m-sub)" }}>
                            {isActive ? "LOCKED" : "CLICK TO LOCK"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 f-mono text-[9px] tracking-[0.26em] text-center" style={{ color: "var(--m-sub)" }}>
              HOVER — OPEN MODULE · CLICK — LOCK · ESC — RELEASE · ARROWS — NAVIGATE
            </p>
          </div>
        </Reveal>
      </div>

      {activeCo && mediaView != null && (
        <FullscreenViewer items={activeCo.media} index={mediaView} ratio="16/9" onClose={() => setMediaView(null)} setIndex={setMediaView} />
      )}
    </section>
  );
}
