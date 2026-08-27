import React, { useEffect, useRef, useState } from "react";
import { Company } from "../lib/data";
import { useReducedMotion, useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

/* manufactured silhouette: stepped notch top-right + chamfer bottom-left */
const CLIP =
  "polygon(0 0, calc(100% - 30px) 0, calc(100% - 30px) 10px, calc(100% - 12px) 10px, calc(100% - 12px) 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))";

const yearOf = (d: string) => (d.match(/\d{4}/) || [""])[0];

/* Split a company name into compact vertical columns (upright letters).
   Short names stay one column; longer names break into two adjacent columns
   so every letter keeps the same large display size. */
function nameColumns(name: string): string[] {
  if (name.length <= 5) return [name];
  const mid = Math.ceil(name.length / 2);
  return [name.slice(0, mid), name.slice(mid)];
}

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

/* tiny machined fastener */
function Screw({ className = "" }: { className?: string }) {
  return (
    <span className={`w-[7px] h-[7px] rounded-full grid place-items-center shrink-0 ${className}`}
      style={{ background: "color-mix(in srgb, var(--outer-ink) 16%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--outer-ink) 32%, transparent)" }}>
      <span className="w-[4px] h-[1px] rotate-45" style={{ background: "color-mix(in srgb, var(--outer-ink) 48%, transparent)" }} />
    </span>
  );
}

/* L-shaped corner registration mark */
function CornerMark({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "top-[13px] left-[13px] border-t border-l",
    tr: "top-[13px] right-[13px] border-t border-r",
    bl: "bottom-[13px] left-[13px] border-b border-l",
    br: "bottom-[13px] right-[13px] border-b border-r",
  } as const;
  return <span className={`absolute w-[9px] h-[9px] pointer-events-none ${map[pos]}`} style={{ borderColor: "color-mix(in srgb, var(--outer-ink) 34%, transparent)" }} />;
}

/* thin segmented data rail */
function DataRail({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block h-px w-full ${className}`} style={{ background: "color-mix(in srgb, var(--outer-ink) 22%, transparent)" }}>
      <span className="absolute left-0 -top-[2px] w-[5px] h-[5px]" style={{ background: "var(--crim-panel)" }} />
      <span className="absolute right-[18%] -top-[2px] w-[3px] h-[3px] rotate-45" style={{ background: "color-mix(in srgb, var(--outer-ink) 40%, transparent)" }} />
    </span>
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

  /* rail column template — expanded card claims ~50% MORE real layout space,
     so neighbors are physically pushed farther away (no overlay). */
  const cols = companies
    .map((_, i) => (i === expanded ? "minmax(0, 5fr)" : "minmax(0, 1fr)"))
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
                const colsArr = nameColumns(c.short);
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
                    className="journey-card relative outline-none cursor-pointer mat-texture overflow-hidden"
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
                    <div className="absolute inset-[7px] pointer-events-none z-0" style={{ clipPath: CLIP, border: "1px solid color-mix(in srgb, var(--outer-ink) 24%, transparent)" }} />
                    {/* panel seam — vertical machined line */}
                    <span className="absolute top-[10px] bottom-[10px] left-[22px] w-px pointer-events-none z-0 hidden lg:block" style={{ background: "color-mix(in srgb, var(--outer-ink) 14%, transparent)" }} />

                    {/* ---------- CLOSED VERTICAL FACE (desktop, when collapsed) ---------- */}
                    <div
                      className={"absolute inset-0 z-10 hidden flex-col " + (isOpen ? "" : "lg:flex ")}
                      style={{ opacity: isOpen ? 0 : 1, pointerEvents: isOpen ? "none" : "auto", transition: reduced ? "none" : "opacity 300ms ease" }}
                    >
                      {/* ghosted serial number — large, embedded, low-opacity */}
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none select-none f-display font-bold z-0"
                        style={{ fontSize: "clamp(96px, 8.5vw, 148px)", lineHeight: 1, color: "var(--outer-ink)", opacity: 0.055, transform: "translateY(6px)" }}>
                        {c.num}
                      </span>

                      {/* corner registration marks + micro screws */}
                      <CornerMark pos="tl" /><CornerMark pos="tr" /><CornerMark pos="bl" /><CornerMark pos="br" />
                      <Screw className="absolute top-[16px] left-[16px]" />
                      <Screw className="absolute top-[16px] right-[34px]" />
                      <Screw className="absolute bottom-[16px] left-[16px]" />
                      <Screw className="absolute bottom-[16px] right-[34px]" />

                      {/* top technical header */}
                      <div className="relative z-10 flex items-center justify-between px-4 pt-4 shrink-0">
                        <span className="f-mono font-semibold text-[12px] tracking-[0.14em]" style={{ color: "var(--crim-panel)" }}>{c.num}</span>
                        <span className="f-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>EXP/{yearOf(c.date)}</span>
                      </div>
                      <div className="px-4 mt-2 shrink-0"><DataRail /></div>

                      {/* large multi-column stacked company name — vertically centered */}
                      <div className="relative z-10 flex-1 flex items-center justify-center px-2 select-none min-h-0">
                        <div className="flex items-start justify-center gap-[12px]">
                          {colsArr.map((col, ci) => (
                            <div key={ci} className="flex flex-col items-center gap-[3px]">
                              {col.split("").map((ch, k) => (
                                <span key={k} className="name-letter"
                                  style={{ fontSize: "clamp(24px, 2vw, 32px)", color: "var(--outer-ink)" }}>
                                  {ch}
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* bottom status rail */}
                      <div className="relative z-10 px-4 pb-2 shrink-0"><DataRail /></div>
                      <div className="relative z-10 flex items-center justify-between px-4 pb-4 shrink-0">
                        <span className="f-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                          {isActive ? "STATUS / LOCKED" : isOpen ? "STATUS / OPEN" : "STATUS / IDLE"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {/* indicator light */}
                          <span className="w-[5px] h-[5px] rounded-full transition-colors duration-300"
                            style={{ background: isOpen ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 28%, transparent)", boxShadow: isOpen ? "0 0 6px var(--crim-panel)" : "none" }} />
                          <span className="w-2 h-2 rotate-45 transition-colors duration-300" style={{ background: isOpen ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 30%, transparent)" }} />
                        </span>
                      </div>
                    </div>

                    {/* ---------- MOBILE CLOSED HEADER ---------- */}
                    <div className={"relative z-10 flex lg:hidden items-center gap-3 px-4 py-4 " + (isOpen ? "hidden" : "")}>
                      <span className="f-mono font-semibold text-[12px] tracking-[0.14em]" style={{ color: "var(--crim-panel)" }}>{c.num}</span>
                      <span className="name-letter flex-1 text-[17px] tracking-[0.06em]" style={{ color: "var(--outer-ink)" }}>{c.short}</span>
                      <span className="w-2 h-2 rotate-45" style={{ background: isOpen ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 30%, transparent)" }} />
                    </div>

                    {/* ---------- EXPANDED DOSSIER ---------- */}
                    <div className={isOpen ? "relative z-10 block h-full" : "hidden lg:block lg:invisible relative z-10"}>
                      <div className="h-full flex flex-col px-5 py-4 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
                        {/* TOP: number + company + role + date/location */}
                        <div className="flex items-start justify-between gap-3 shrink-0">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                              <span className="f-mono font-semibold text-[12px] tracking-[0.14em]" style={{ color: "var(--crim-panel)" }}>{c.num}</span>
                              {c.discipline && <Chip>{c.discipline}</Chip>}
                            </div>
                            <h4 className="name-letter text-[clamp(1.15rem,1.8vw,1.55rem)] leading-[1.06] mt-1.5 break-words" style={{ color: "var(--outer-ink)", fontWeight: 700 }}>
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

                        {/* SUMMARY */}
                        {c.summary && (
                          <div className="mt-4 shrink-0">
                            <Block label="EXPERIENCE">
                              <p className="text-[12px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: 0.88 }}>{c.summary}</p>
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

                        {/* ONE primary company media slot — large, prominent */}
                        {c.media.length > 0 && (
                          <div className="mt-4 shrink-0">
                            <Block label="MEDIA / 01">
                              <div style={{ height: 190 }}>
                                <MediaSlot item={c.media[0]} ratio="16/9" fill className="mat-inner rounded-[4px]! border-0!" showLabel={false} onClick={() => setMediaView(0)} />
                              </div>
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
