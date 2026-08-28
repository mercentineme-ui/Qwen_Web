import React, { useRef, useState } from "react";
import { Company } from "../lib/data";
import { useReducedMotion, useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

/* manufactured silhouette: stepped notch top-right + chamfer bottom-left */
const CLIP =
  "polygon(0 0, calc(100% - 30px) 0, calc(100% - 30px) 10px, calc(100% - 12px) 10px, calc(100% - 12px) 0, 100% 0, 100% 100%, 14px 100%, 0 calc(100% - 14px))";

const yearOf = (d: string) => (d.match(/\d{4}/) || [""])[0];

/* ------------------------------------------------------------------
   Company-name vertical stacking.
   Long names break into two UPRIGHT columns; the second word/group is
   offset DOWNWARD (never beside the top letters) and carries the accent
   colour. Short names stay a single tall column at a larger size so every
   letter keeps a consistent, large display scale.
   ------------------------------------------------------------------ */
type StackCfg = { g1: string; g2?: string; offset?: number; font?: string; color?: string };
const NAME_STACKS: Record<string, StackCfg> = {
  IMPROMP2LABS: { g1: "IMPROMP2", g2: "LABS", offset: 4 },
  /* CYBEREDGE ~30% larger than the default two-column scale */
  CYBEREDGE: { g1: "CYBER", g2: "EDGE", offset: 1, font: "clamp(44px, 3.9vw, 62px)" },
  /* DNEG + PSD carry the active red accent (light: Amarnath #DA012D · dark: crimson #E72241)
     at the standard single-column company-name scale (1X). */
  DNEG: { g1: "DNEG", color: "var(--crimson)" },
  PSD: { g1: "PSD", color: "var(--crimson)" },
};
const fallbackStack = (name: string): StackCfg => {
  if (name.length <= 5) return { g1: name };
  const mid = Math.ceil(name.length / 2);
  return { g1: name.slice(0, mid), g2: name.slice(mid), offset: 1 };
};

function NameStack({ name, accent }: { name: string; accent: string }) {
  const cfg = NAME_STACKS[name] ?? fallbackStack(name);
  const twoCol = Boolean(cfg.g2);
  /* long two-column names (48px), short single-column names (64px);
     CYBEREDGE overrides to ~30% larger. All stay large & readable. */
  const font = cfg.font ?? (twoCol ? "clamp(34px, 3vw, 48px)" : "clamp(46px, 4.3vw, 64px)");

  type Cell = { ch: string; col: number; row: number; color: string; outline?: boolean };
  const cells: Cell[] = [];
  cfg.g1.split("").forEach((ch, k) =>
    cells.push({ ch, col: 1, row: k + 1, color: cfg.color ?? "var(--outer-ink)" })
  );
  if (cfg.g2)
    cfg.g2.split("").forEach((ch, k) =>
      cells.push({ ch, col: 2, row: (cfg.offset ?? 0) + k + 1, color: accent, outline: true })
    );

  return (
    <span
      className="inline-grid items-center justify-items-center select-none"
      style={{
        gridTemplateColumns: twoCol ? "auto auto" : "auto",
        gridAutoRows: "auto",
        columnGap: "0.24em",
        rowGap: "0.1em",
        fontSize: font,
      }}
      aria-label={name}
    >
      {cells.map((c, i) => (
        <span
          key={i}
          aria-hidden
          className="name-letter"
          style={
            c.outline
              ? {
                  gridColumn: c.col,
                  gridRow: c.row,
                  fontSize: "inherit",
                  /* outlined word (LABS / EDGE): transparent fill + theme-aware stroke.
                     Light card → medium neutral grey · Dark card → white / light-grey.
                     Deliberate typographic treatment — not a shadow, not red, no glow. */
                  color: "transparent",
                  WebkitTextStroke: "1.3px var(--name-outline)",
                  fontWeight: 600,
                }
              : { gridColumn: c.col, gridRow: c.row, color: c.color, fontSize: "inherit" }
          }
        >
          {c.ch}
        </span>
      ))}
    </span>
  );
}

/* ---------- dossier helpers (expanded card uses the journey material) ---------- */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center f-tech font-semibold text-[9px] sm:text-[10px] tracking-[0.12em] px-2 py-[3px]"
      style={{ border: "1px solid color-mix(in srgb, var(--journey-ink) 30%, transparent)", color: "var(--journey-ink)", opacity: 0.9 }}>
      {children}
    </span>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block f-mono text-[8px] tracking-[0.28em] mb-2" style={{ color: "var(--crim-journey)" }}>{label}</span>
      {children}
    </div>
  );
}

/* tiny machined fastener (closed face — outer material) */
function Screw({ className = "" }: { className?: string }) {
  return (
    <span className={`w-[7px] h-[7px] rounded-full grid place-items-center shrink-0 ${className}`}
      style={{ background: "color-mix(in srgb, var(--outer-ink) 16%, transparent)", boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--outer-ink) 32%, transparent)" }}>
      <span className="w-[4px] h-[1px] rotate-45" style={{ background: "color-mix(in srgb, var(--outer-ink) 48%, transparent)" }} />
    </span>
  );
}

/* L-shaped corner registration mark (closed face — outer material) */
function CornerMark({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const map = {
    tl: "top-[13px] left-[13px] border-t border-l",
    tr: "top-[13px] right-[13px] border-t border-r",
    bl: "bottom-[13px] left-[13px] border-b border-l",
    br: "bottom-[13px] right-[13px] border-b border-r",
  } as const;
  return <span className={`absolute w-[9px] h-[9px] pointer-events-none ${map[pos]}`} style={{ borderColor: "color-mix(in srgb, var(--outer-ink) 34%, transparent)" }} />;
}

/* thin segmented data rail (closed face — outer material) */
function DataRail({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block h-px w-full ${className}`} style={{ background: "color-mix(in srgb, var(--outer-ink) 22%, transparent)" }}>
      <span className="absolute left-0 -top-[2px] w-[5px] h-[5px]" style={{ background: "var(--crim-panel)" }} />
      <span className="absolute right-[18%] -top-[2px] w-[3px] h-[3px] rotate-45" style={{ background: "color-mix(in srgb, var(--outer-ink) 40%, transparent)" }} />
    </span>
  );
}

/* Restrained cyberpunk linework — a thin circuit trace with a step, a square
   node and a crimson node. Purely decorative (no metadata). */
function TraceLine({ className = "" }: { className?: string }) {
  const ln = "color-mix(in srgb, var(--outer-ink) 30%, transparent)";
  return (
    <span className={`relative block h-[8px] w-full pointer-events-none ${className}`} aria-hidden>
      <span className="absolute left-0 right-0 top-1/2 h-px" style={{ background: ln }} />
      <span className="absolute left-[16%] top-1/2 -translate-y-1/2 w-[5px] h-[5px]" style={{ background: "color-mix(in srgb, var(--outer-ink) 45%, transparent)" }} />
      <span className="absolute left-[16%] top-1/2 h-[7px] w-px" style={{ background: ln }} />
      <span className="absolute right-[8%] top-1/2 -translate-y-1/2 w-[4px] h-[4px] rotate-45" style={{ background: "var(--crim-panel)" }} />
    </span>
  );
}

/* Restrained cyberpunk linework — a cluster of vertical data ticks with a
   crimson node. Purely decorative (no metadata). */
function TechTicks({ className = "" }: { className?: string }) {
  const ln = "color-mix(in srgb, var(--outer-ink) 40%, transparent)";
  return (
    <span className={`flex items-end gap-[6px] h-[10px] pointer-events-none ${className}`} aria-hidden>
      <span className="w-px h-[5px]" style={{ background: ln }} />
      <span className="w-px h-[9px]" style={{ background: ln }} />
      <span className="w-px h-[6px]" style={{ background: ln }} />
      <span className="w-[5px] h-[5px]" style={{ background: "var(--crim-panel)" }} />
      <span className="w-px h-[8px]" style={{ background: ln }} />
      <span className="w-px h-[4px]" style={{ background: ln }} />
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

  /* rail columns — the expanded card claims substantially MORE real layout
     space (7fr ≈ 50%+ more than before) while closed cards compress into
     narrow vertical modules (0.85fr), so neighbours are physically pushed
     farther away. Real grid redistribution — never an overlay. */
  const cols = companies
    .map((_, i) => (i === expanded ? "minmax(0, 7fr)" : "minmax(0, 0.85fr)"))
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
          {/* MY JOURNEY — matte section; expanded card matches THIS material,
              closed cards use the contrasting archive material. */}
          <div id="journey" className="mat-texture rounded-xl p-5 sm:p-8 xl:p-10 relative overflow-hidden scroll-mt-28"
            style={{ background: "var(--journey-bg)", color: "var(--journey-ink)" }}>
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crim-journey)" }} />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crim-journey)" }} />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8">
              <span className="w-3 h-9" style={{ background: "var(--crim-journey)" }} />
              <h3 className="f-display text-[clamp(1.7rem,3.4vw,2.8rem)] leading-none tracking-wide" style={{ color: "var(--journey-ink)" }}>
                MY JOURNEY
              </h3>
              <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--journey-sub)" }}>
                INDUSTRIAL ARCHIVE — {String(n).padStart(2, "0")} MODULES
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--journey-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--journey-sub)" }}>
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
                    className="journey-card relative outline-none cursor-pointer mat-texture overflow-hidden"
                    style={{
                      /* closed = journey's own contrasting card material (kept original,
                         isolated from the global light-material token).
                         open  = INTERNAL extended card is ALWAYS #F0F8FF in BOTH themes,
                                 with dark dossier content overridden below for readability. */
                      background: isOpen ? "#f0f8ff" : "var(--journey-card-bg)",
                      color: isOpen ? "#222328" : "var(--outer-ink)",
                      clipPath: CLIP,
                      boxShadow: isOpen
                        ? "inset 0 0 0 1.5px var(--crim-journey), 0 18px 40px -18px rgba(0,0,0,0.5)"
                        : "inset 0 0 0 1px color-mix(in srgb, var(--outer-ink) 22%, transparent), 0 8px 24px -16px rgba(0,0,0,0.35)",
                      transition: reduced
                        ? "none"
                        : "box-shadow 520ms cubic-bezier(0.22,1,0.36,1), background-color 520ms cubic-bezier(0.22,1,0.36,1), color 520ms cubic-bezier(0.22,1,0.36,1)",
                      /* keep the internal dossier readable on the fixed light #f0f8ff surface */
                      ...(isOpen
                        ? ({
                            "--journey-ink": "#222328",
                            "--journey-sub": "rgba(34,35,40,0.62)",
                            "--journey-line": "rgba(34,35,40,0.18)",
                            "--crim-journey": "#da012d",
                          } as React.CSSProperties)
                        : {}),
                    }}
                  >
                    {/* inner recessed frame — visible gap between shell and frame */}
                    <div className="absolute inset-[7px] pointer-events-none z-0"
                      style={{ clipPath: CLIP, border: `1px solid ${isOpen ? "color-mix(in srgb, var(--journey-ink) 24%, transparent)" : "color-mix(in srgb, var(--outer-ink) 24%, transparent)"}` }} />
                    {/* panel seam — vertical machined line */}
                    <span className="absolute top-[10px] bottom-[10px] left-[22px] w-px pointer-events-none z-0 hidden lg:block"
                      style={{ background: isOpen ? "color-mix(in srgb, var(--journey-ink) 14%, transparent)" : "color-mix(in srgb, var(--outer-ink) 14%, transparent)" }} />

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

                      {/* top cyberpunk trace — decorative technical linework (metadata removed) */}
                      <div className="relative z-10 px-4 pt-5 shrink-0"><TraceLine /></div>

                      {/* large stacked company name — upright letters, second group offset down + accented */}
                      <div className="relative z-10 flex-1 flex items-center justify-center px-2 min-h-0">
                        <NameStack name={c.short} accent="var(--crim-panel)" />
                      </div>

                      {/* bottom cyberpunk ticks — decorative technical linework (metadata removed) */}
                      <div className="relative z-10 px-4 pb-5 shrink-0 flex justify-center"><TechTicks /></div>
                    </div>

                    {/* ---------- MOBILE CLOSED HEADER ---------- */}
                    <div className={"relative z-10 flex lg:hidden items-center gap-3 px-4 py-4 " + (isOpen ? "hidden" : "")}>
                      <span className="f-mono font-semibold text-[12px] tracking-[0.14em]" style={{ color: isOpen ? "var(--crim-journey)" : "var(--crim-panel)" }}>{c.num}</span>
                      <span className="name-letter flex-1 text-[17px] tracking-[0.06em]" style={{ color: isOpen ? "var(--journey-ink)" : "var(--outer-ink)" }}>{c.short}</span>
                      <span className="w-2 h-2 rotate-45" style={{ background: isOpen ? "var(--crim-journey)" : "var(--crim-panel)" }} />
                    </div>

                    {/* ---------- EXPANDED DOSSIER (journey material) ---------- */}
                    <div className={isOpen ? "relative z-10 block h-full" : "hidden lg:block lg:invisible relative z-10"}>
                      <div className={`journey-dossier h-full flex flex-col px-5 py-4 overflow-y-auto ${isOpen ? "journey-open" : ""}`} style={{ scrollbarWidth: "thin" }}>
                        {/* TOP: number + company + role + date/location */}
                        <div className="ji shrink-0" style={{ animationDelay: "0.04s" }}>
                          <div className="flex items-center gap-2.5">
                            <span className="f-mono font-semibold text-[12px] tracking-[0.14em]" style={{ color: "var(--crim-journey)" }}>{c.num}</span>
                            {c.discipline && <Chip>{c.discipline}</Chip>}
                          </div>
                          <h4 className="name-letter text-[clamp(1.15rem,1.8vw,1.55rem)] leading-[1.06] mt-1.5 break-words" style={{ color: "var(--journey-ink)", fontWeight: 700 }}>
                            {c.expandedName ?? c.name}
                          </h4>
                          <span className="block f-tech font-semibold text-[10px] tracking-[0.16em] mt-1" style={{ color: "var(--crim-journey)" }}>{c.role}</span>
                          <span className="block f-mono text-[9px] tracking-[0.14em] mt-1" style={{ color: "var(--journey-sub)" }}>
                            {c.date}{c.location ? ` · ${c.location}` : ""}
                          </span>
                          {c.disciplineNote && (
                            <span className="block f-mono text-[8px] tracking-[0.16em] mt-1.5" style={{ color: "var(--journey-sub)" }}>{c.disciplineNote}</span>
                          )}
                        </div>

                        {/* DESCRIPTION */}
                        {c.summary && (
                          <div className="ji mt-4 shrink-0" style={{ animationDelay: "0.10s" }}>
                            <Block label="DESCRIPTION">
                              <p className="text-[12px] leading-relaxed" style={{ color: "var(--journey-ink)", opacity: 0.88 }}>{c.summary}</p>
                            </Block>
                          </div>
                        )}

                        {/* TRACK RECORD — numbered 01–05 entries */}
                        {c.highlights && c.highlights.length > 0 && (
                          <div className="ji mt-4 shrink-0" style={{ animationDelay: "0.16s" }}>
                            <Block label={c.highlightsLabel ?? "TRACK RECORD"}>
                              <ul className="flex flex-col gap-y-2">
                                {c.highlights.map((h, i) => (
                                  <li key={h} className="flex items-start gap-2.5 text-[10.5px] leading-snug" style={{ color: "var(--journey-ink)", opacity: 0.85 }}>
                                    <span className="f-mono font-semibold text-[9px] tracking-[0.08em] shrink-0" style={{ color: "var(--crim-journey)" }}>
                                      {String(i + 1).padStart(2, "0")}.
                                    </span>
                                    {h}
                                  </li>
                                ))}
                              </ul>
                            </Block>
                          </div>
                        )}

                        {/* DISCIPLINES */}
                        {c.skills && c.skills.length > 0 && (
                          <div className="ji mt-4 shrink-0" style={{ animationDelay: "0.22s" }}>
                            <Block label="DISCIPLINES">
                              <div className="flex flex-wrap gap-1.5">{c.skills.map((s) => <Chip key={s}>{s}</Chip>)}</div>
                            </Block>
                          </div>
                        )}

                        {/* TOOLS */}
                        {c.tools && c.tools.length > 0 && (
                          <div className="ji mt-4 shrink-0" style={{ animationDelay: "0.28s" }}>
                            <Block label="TOOLS">
                              <div className="flex flex-wrap gap-1.5">{c.tools.map((t) => <Chip key={t}>{t}</Chip>)}</div>
                            </Block>
                          </div>
                        )}

                        {/* MEDIA AREA — all slots (DNEG = 2, others = 1), always reserved */}
                        {c.media && c.media.length > 0 && (
                          <div className="ji mt-4 shrink-0" style={{ animationDelay: "0.34s" }}>
                            <Block label={`MEDIA / ${String(c.media.length).padStart(2, "0")}`}>
                              <div className={c.media.length > 1 ? "grid grid-cols-2 gap-2" : ""}>
                                {c.media.map((m, i) => (
                                  <div key={m.id} style={{ height: c.media.length > 1 ? 100 : 190 }}>
                                    <MediaSlot item={m} ratio="16/9" fill className="rounded-[4px]! border-0!" showLabel={false} onClick={() => setMediaView(i)} />
                                  </div>
                                ))}
                              </div>
                            </Block>
                          </div>
                        )}

                        {/* footer technical marks */}
                        <div className="ji mt-auto pt-4 flex items-center justify-between shrink-0" style={{ animationDelay: "0.4s", borderTop: "1px solid var(--journey-line)" }}>
                          <span className="f-mono text-[8px] tracking-[0.2em]" style={{ color: "var(--journey-sub)" }}>ARCHIVE / {c.num}</span>
                          <span className="f-mono text-[8px] tracking-[0.2em]" style={{ color: isActive ? "var(--crim-journey)" : "var(--journey-sub)" }}>
                            {isActive ? "LOCKED" : "CLICK TO LOCK"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 f-mono text-[9px] tracking-[0.26em] text-center" style={{ color: "var(--journey-sub)" }}>
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
