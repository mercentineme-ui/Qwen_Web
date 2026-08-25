import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { MediaSlot, Reveal, SectionHead } from "./ui";

const CYCLE_MS = 30000;

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
    <div className="flex items-center justify-between gap-4 border-b-2 pb-3" style={{ borderColor: "var(--m-line)" }}>
      <h3 className="f-tech font-bold text-[14px] sm:text-[16px] tracking-[0.24em] flex items-center gap-3 whitespace-nowrap" style={{ color: "var(--outer-ink)" }}>
        <span className="w-2.5 h-2.5 bg-[var(--crimson)] shrink-0" />
        {title}
      </h3>
      <span className="f-mono text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center gap-2 min-w-0 truncate" style={{ color: "var(--m-sub)" }}>
        <span className="text-[var(--crimson)]">{tag}</span>
        {right}
      </span>
    </div>
  );
}

/* ================= CAREER NODE MAP — VERTICAL CHAPTER LADDER =================
   One strong vertical spine, four PRIMARY chapter stations (01 → 04, top → bottom),
   solid structural sections + branch points + junction nodes + a continuously
   looping signal. Stations carry name / number / date / category; skill satellites
   branch off each chapter. COMPANY → CAREER CHAPTER → NEXT CHAPTER. */

const SPINE_X = 118;
const ROW_Y = [70, 176, 282, 388]; /* chapter rows, top → newest-first order */
const SPINE_TOP = 26;
const SPINE_BOT = 444;
const JUNCTION_MIDS = [123, 229, 335];

function NodeMap({
  active, hoverIdx, locked, reduced, companies, onHover, onLeaveRow, onPick,
}: {
  active: number;
  hoverIdx: number | null;
  locked: boolean;
  reduced: boolean;
  companies: { id: string; num: string; name: string; date: string; role: string; skills: string[] }[];
  onHover: (i: number) => void;
  onLeaveRow: () => void;
  onPick: (i: number) => void;
}) {
  const activeY = ROW_Y[Math.min(active, ROW_Y.length - 1)];
  const litD = `M${SPINE_X} ${SPINE_TOP} V${activeY}`;
  const category = (role: string) => role.split("·")[0].trim();

  return (
    <div className="relative border rounded-xl mat-texture corner-bracket overflow-hidden"
      style={{ borderColor: "var(--m-line)", backgroundColor: "color-mix(in srgb, var(--outer-ink) 5%, transparent)", aspectRatio: "520 / 470" }}
      onMouseLeave={onLeaveRow}>

      {/* ---------- spine + branches + depth ---------- */}
      <svg viewBox="0 0 520 470" className="absolute inset-0 w-full h-full" fill="none" aria-hidden>
        {/* rear structural housing — depth band behind the spine */}
        <rect x="100" y="14" width="36" height="442" fill="#3C3D42" opacity="0.4" />
        <rect x="96" y="14" width="4" height="442" fill="#3C3D42" opacity="0.22" />
        {/* faint horizontal chapter strata */}
        {ROW_Y.map((y) => (
          <rect key={y} x="8" y={y + 26} width="504" height="1.5" fill="var(--line-soft)" />
        ))}

        {/* spine — solid structural rail + inset channel + shadow */}
        <path d={`M${SPINE_X} ${SPINE_TOP} V${SPINE_BOT}`} stroke="#222328" strokeOpacity="0.28" strokeWidth="13" transform="translate(4 5)" />
        <path d={`M${SPINE_X} ${SPINE_TOP} V${SPINE_BOT}`} stroke="#59595B" strokeWidth="13" />
        <path d={`M${SPINE_X} ${SPINE_TOP} V${SPINE_BOT}`} stroke="var(--m-line)" strokeWidth="9" />
        <path d={`M${SPINE_X} ${SPINE_TOP} V${SPINE_BOT}`} stroke="#A6A6A4" strokeWidth="2" opacity="0.5" />

        {/* looping signal packets — continuous controlled motion down the spine */}
        {!reduced && (
          <>
            <path d={`M${SPINE_X} ${SPINE_TOP} V${SPINE_BOT}`} stroke="#A6A6A4" strokeWidth="2.4" pathLength={420} className="route-signal" opacity="0.55" />
            <path d={`M${SPINE_X} ${SPINE_TOP} V${SPINE_BOT}`} stroke="#DDDDD8" strokeWidth="1.6" pathLength={420} className="route-signal" style={{ animationDelay: "-1.4s", animationDuration: "2s" }} opacity="0.4" />
          </>
        )}

        {/* top cap + bottom cap housings */}
        {[SPINE_TOP - 8, SPINE_BOT - 2].map((yy, k) => (
          <g key={k}>
            <rect x={SPINE_X - 19} y={yy - 6} width="38" height="16" fill="#59595B" stroke="var(--m-line)" strokeWidth="1.4" />
            <circle cx={SPINE_X - 11} cy={yy + 2} r="2" fill="#A6A6A4" />
            <circle cx={SPINE_X + 11} cy={yy + 2} r="2" fill="#A6A6A4" />
          </g>
        ))}
        <path d={`M${SPINE_X - 5} ${SPINE_BOT + 18} l5 6 l5 -6`} stroke="var(--m-sub)" strokeWidth="1.6" strokeLinecap="round" />

        {/* inter-chapter junction nodes + flow chevrons */}
        {JUNCTION_MIDS.map((yy, k) => (
          <g key={yy}>
            <rect x={SPINE_X - 8} y={yy - 8} width="16" height="16" transform={`rotate(45 ${SPINE_X} ${yy})`}
              fill="#59595B" stroke="var(--m-line)" strokeWidth="1.4" />
            <circle cx={SPINE_X} cy={yy} r="3" fill="#A6A6A4" className={reduced ? undefined : "live-blink"} style={{ animationDelay: `${k * 0.45}s` }} />
            <path d={`M${SPINE_X - 4.5} ${yy + 20} l4.5 5 l4.5 -5`} stroke="var(--m-sub)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ))}

        {/* branch arms + branch-point junctions + skill satellites */}
        {companies.map((c, i) => {
          const y = ROW_Y[i];
          const on = i === active;
          const arm = `M${SPINE_X + 6} ${y} H172`;
          return (
            <g key={`branch-${c.id}`}>
              {/* branch arm */}
              <path d={arm} stroke="#222328" strokeOpacity="0.28" strokeWidth="7" transform="translate(3 4)" />
              <path d={arm} stroke={on ? "var(--crimson)" : "#59595B"} strokeWidth="7" style={{ transition: "stroke .35s ease" }} />
              <path d={arm} stroke={on ? "#DDDDD8" : "var(--m-line)"} strokeWidth="2.4" style={{ transition: "stroke .35s ease" }} />
              {/* branch point on the spine */}
              <rect x={SPINE_X - 9} y={y - 9} width="18" height="18" transform={`rotate(45 ${SPINE_X} ${y})`}
                fill={on ? "var(--crimson)" : "#59595B"} stroke={on ? "#DDDDD8" : "var(--m-line)"} strokeWidth="1.5"
                style={{ transition: "fill .35s ease, stroke .35s ease" }} />
              <circle cx={SPINE_X} cy={y} r="2.6" fill={on ? "#DDDDD8" : "#A6A6A4"} className={reduced ? undefined : "live-blink"} style={{ animationDelay: `${i * 0.3}s` }} />

              {/* skill satellites — secondary supporting nodes */}
              {c.skills.slice(0, 2).map((s, k) => {
                const sy = y + (k === 0 ? -17 : 17);
                return (
                  <g key={s}>
                    <path d={`M400 ${y} L418 ${sy}`} stroke={on ? "var(--crimson)" : "var(--m-line)"} strokeWidth="1.6"
                      strokeDasharray={on ? undefined : "3 4"} style={{ transition: "stroke .35s ease" }} />
                    <rect x="414" y={sy - 5} width="10" height="10" transform={`rotate(45 419 ${sy})`}
                      fill={on ? "var(--crimson)" : "#59595B"} stroke="var(--m-line)" strokeWidth="1.2" style={{ transition: "fill .35s ease" }} />
                    <text x="430" y={sy + 3} fontSize="7.5" letterSpacing="1.2"
                      fill={on ? "var(--crimson)" : "var(--m-sub)"} style={{ fontFamily: "IBM Plex Mono, monospace", transition: "fill .35s ease" }}>
                      {s.length > 17 ? s.slice(0, 16) + "…" : s}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* active route — lit from the origin down to the selected chapter */}
        {active > 0 && (
          <>
            <path d={litD} stroke="var(--crimson)" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" />
            {!reduced && <path d={litD} stroke="#DDDDD8" strokeWidth="1.8" pathLength={420} className="route-signal" style={{ animationDuration: "1.4s" }} />}
          </>
        )}

        {/* station echo plates — offset depth behind each chapter */}
        {companies.map((c, i) => (
          <rect key={`echo-${c.id}`} x="178" y={ROW_Y[i] - 26} width="228" height="60"
            fill="#59595B" opacity="0.32" transform="translate(6 7)"
            style={{ clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)" }} />
        ))}
      </svg>

      {/* ---------- PRIMARY chapter stations ---------- */}
      {companies.map((c, i) => {
        const y = ROW_Y[i];
        const isActive = i === active;
        const isHover = i === hoverIdx;
        return (
          <button key={c.id}
            onClick={() => onPick(i)}
            onMouseEnter={() => onHover(i)}
            className="absolute -translate-y-1/2 text-left mat-texture"
            style={{
              left: "34.2%",
              top: `${(y / 470) * 100}%`,
              width: "clamp(170px, 44%, 230px)",
              clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
              backgroundColor: isActive ? "var(--crimson)" : "var(--outer-bg)",
              boxShadow: isActive
                ? "inset 0 0 0 1.5px rgba(221,221,216,0.5), 0 14px 30px -14px rgba(231,34,65,0.65)"
                : isHover
                  ? "inset 0 0 0 1.5px var(--crimson)"
                  : "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 24%, transparent)",
              transform: `translateY(-50%) ${isHover && !isActive ? "translateX(5px)" : ""}`,
              transition: "background-color .35s ease, box-shadow .35s ease, transform .35s ease",
            }}
            aria-label={`${c.name} — ${c.date}`}>
            {isActive && !reduced && (
              <span className="absolute -inset-1.5 pointer-events-none"
                style={{ border: "2px solid var(--crimson)", clipPath: "inherit", animation: "stationPulse 1.8s cubic-bezier(.3,.7,.4,1) infinite" }} />
            )}
            <span className="relative flex items-center gap-3 px-3.5 py-3">
              <span className="grid place-items-center w-8 h-8 shrink-0 f-mono font-semibold text-[11px]"
                style={{
                  background: isActive ? "#DDDDD8" : "var(--crimson)",
                  color: isActive ? "var(--crimson)" : "#DDDDD8",
                  transition: "background-color .35s ease, color .35s ease",
                }}>
                {c.num}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block f-tech font-bold text-[11.5px] sm:text-[13px] tracking-[0.09em] leading-tight truncate"
                  style={{ color: isActive ? "#DDDDD8" : "var(--outer-ink)" }}>
                  {c.name}
                </span>
                <span className="block f-mono text-[7px] sm:text-[7.5px] tracking-[0.1em] mt-1 truncate"
                  style={{ color: isActive ? "rgba(221,221,216,0.78)" : "var(--m-sub)" }}>
                  {c.date.split("·")[0].trim()}
                </span>
              </span>
            </span>
            {/* secondary category strip */}
            <span className="relative block px-3.5 pb-2.5 -mt-0.5">
              <span className="inline-block f-mono text-[7px] tracking-[0.18em] px-2 py-[3px] uppercase truncate max-w-full"
                style={{
                  background: isActive ? "rgba(221,221,216,0.18)" : "color-mix(in srgb, var(--outer-ink) 10%, transparent)",
                  color: isActive ? "#DDDDD8" : "var(--m-sub)",
                  border: `1px solid ${isActive ? "rgba(221,221,216,0.35)" : "var(--m-line)"}`,
                }}>
                {category(c.role)}
              </span>
            </span>
            {isActive && locked && <span className="absolute bottom-1.5 right-2 w-2 h-2 rotate-45 bg-[#DDDDD8]" />}
          </button>
        );
      })}

      {/* map captions */}
      <span className="absolute left-4 bottom-3 f-mono text-[8px] tracking-[0.24em] flex items-center gap-2" style={{ color: "var(--m-sub)" }}>
        <span className="w-5 h-[2px] bg-[var(--crimson)]" />
        CAREER PROGRESSION 2018 → PRESENT
      </span>
      <span className="absolute right-4 top-3 f-mono text-[8px] tracking-[0.24em]" style={{ color: "var(--m-sub)" }}>
        HOVER — SCAN · CLICK — LOCK
      </span>
    </div>
  );
}

/* ================= 01 — MY EXPERTISE / MY JOURNEY ================= */

export default function Expertise() {
  const { data } = useStore();
  const { statement, statementAccent, supporting, companies } = data.expertise;
  const [active, setActive] = useState(0);
  const [locked, setLocked] = useState(false);
  const [hover, setHover] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const elapsedRef = useRef(0);
  const n = companies.length;

  /* 30s cycle — hover pauses at the exact position, leave resumes */
  useEffect(() => {
    elapsedRef.current = 0;
    if (reduced || locked || n < 2) return;
    let last = performance.now();
    const iv = window.setInterval(() => {
      if (hover) { last = performance.now(); return; }
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

  /* the node map IS the selector */
  const onHover = (i: number) => {
    setHoverIdx(i);
    if (!locked) setActive(i);
  };
  const onPick = (i: number) => {
    if (i === active && locked) setLocked(false);
    else { setActive(i); setLocked(true); }
  };

  const co = companies[active];

  return (
    <section id="expertise" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="01 — MY EXPERTISE"
          long
          titleNode={<>{statement} <span className="text-[var(--crimson)]">{statementAccent}</span></>}
          desc={supporting}
          meta="2018 — 2026 · FOUR CHAPTERS"
        />

        {/* ============ MY JOURNEY — ONE large parent system ============ */}
        <Reveal className="mt-10">
          <div className="mat-journey mat-texture rounded-xl p-5 sm:p-8 xl:p-10 relative overflow-hidden">
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crimson)" }} />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crimson)" }} />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8">
              <span className="w-3 h-9 bg-[var(--crimson)]" />
              <h3 className="f-display text-[clamp(1.7rem,3.4vw,2.8rem)] leading-none tracking-wide" style={{ color: "var(--outer-ink)" }}>
                MY JOURNEY
              </h3>
              <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>
                PRODUCTION TIMELINE — SELECT A CHAPTER
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--m-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                {locked ? "CHAPTER LOCKED" : hover ? "CYCLE PAUSED" : reduced ? "STATIC" : "AUTO CYCLE · 30S"}
              </span>
            </div>

            {/* twin module headings — CAREER INFO (LEFT) · CAREER NODE MAP (RIGHT) */}
            <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-x-6 gap-y-8 lg:gap-x-10 mb-5">
              <ModuleHeading tag="A" title="CAREER INFO" right="HOVER TO SCAN · CLICK TO LOCK" />
              <ModuleHeading tag="B" title="CAREER NODE MAP" right={<span style={{ color: "var(--outer-ink)" }}>{co.num} — {co.name}</span>} />
            </div>

            <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-6 lg:gap-10 lg:items-start"
              onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setHoverIdx(null); }}>

              {/* ================= CAREER INFO (LEFT) — adapts to the selected company ================= */}
              <div className="mat-inner mat-texture dossier-clip corner-bracket relative p-5 sm:p-7 flex flex-col min-h-0 overflow-hidden lg:min-h-[640px] order-1">
                <span className="absolute inset-[7px] border pointer-events-none dossier-clip-sm" style={{ borderColor: "var(--m-line)" }} aria-hidden />
                <span key={`edge-${co.id}`} className="absolute top-0 left-0 h-[3px] bg-[var(--crimson)] scan-pass" style={{ width: "46%" }} aria-hidden />

                <div key={co.id} className="dossier-swap flex flex-col gap-3.5 min-h-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="f-striker text-[12px] sm:text-[13px] tracking-[0.14em] text-[var(--crimson)]">{co.role}</span>
                      <h4 className="f-display text-[clamp(1.5rem,2.4vw,2.2rem)] mt-1.5 leading-none">{co.name}</h4>
                    </div>
                    <span className="f-display text-[2.4rem] leading-none opacity-15 shrink-0">{co.num}</span>
                  </div>
                  <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>{co.date}</span>
                  <Description text={co.description} />
                  {co.domain && (
                    <span className="f-tech font-bold text-[12px] tracking-[0.18em]">
                      PROJECT / DOMAIN — <span className="text-[var(--crimson)] text-[14px]">{co.domain}</span>
                    </span>
                  )}

                  <div className="mt-auto pt-4 flex flex-col gap-4" style={{ borderTop: "1px solid var(--m-line)" }}>
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                      <span className="f-mono text-[9px] tracking-[0.28em] w-full" style={{ color: "var(--m-sub)" }}>SKILLS</span>
                      {co.skills.map((s) => (
                        <span key={s} className="f-striker text-[9px] sm:text-[10px] tracking-[0.12em] opacity-90">{s}</span>
                      ))}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                      <span className="f-mono text-[9px] tracking-[0.28em] w-full" style={{ color: "var(--m-sub)" }}>TOOLS</span>
                      {co.tools.map((t, i) => (
                        <React.Fragment key={t}>
                          <span className="f-tech font-bold text-[11px] tracking-[0.14em]">{t}</span>
                          {i < co.tools.length - 1 && <span className="text-[var(--crimson)] text-[10px]">/</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  {/* large media tiles — exact counts 3 / 3 / 2 / 1, never shrunk */}
                  <div className="min-h-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="f-mono text-[9px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>MEDIA — {String(co.media.length).padStart(2, "0")} SLOTS</span>
                      <span className="f-mono text-[9px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>{co.name}</span>
                    </div>
                    <div key={`media-${co.id}`} className="dossier-swap grid grid-cols-3 gap-3 sm:gap-4 content-start">
                      {co.media.map((m) => (
                        <MediaSlot key={m.id} item={m} ratio="1/1" className="mat-page-card" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= CAREER NODE MAP (RIGHT) ================= */}
              <div className="min-h-0 flex flex-col order-2">
                <NodeMap
                  active={active} hoverIdx={hoverIdx} locked={locked} reduced={reduced}
                  companies={companies}
                  onHover={onHover}
                  onLeaveRow={() => setHoverIdx(null)}
                  onPick={onPick}
                />
                <div className="mt-4 flex items-center gap-4 f-mono text-[9px] tracking-[0.22em]" style={{ color: "var(--m-sub)" }}>
                  {!reduced && (
                    <span className="w-32 h-[3px] rounded overflow-hidden" style={{ background: "var(--m-line)" }}>
                      <span key={active} className="block h-full bg-[var(--crimson)] origin-left"
                        style={{ animation: `progFill ${CYCLE_MS}ms linear both`, animationPlayState: hover || locked ? "paused" : "running" }} />
                    </span>
                  )}
                  <span className="flex items-center gap-2"><span className="w-3 h-[3px] bg-[var(--crimson)]" />ROUTE</span>
                  <span className="hidden sm:flex items-center gap-2"><span className="w-2.5 h-2.5 border-[1.5px]" style={{ borderColor: "var(--m-sub)" }} />JUNCTION</span>
                  <span className="ml-auto tabular-nums">{String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
                </div>
              </div>
            </div>

            {/* evolution line — the career itself tells it */}
            <p className="mt-6 f-mono text-[9px] sm:text-[10px] tracking-[0.24em] text-center" style={{ color: "var(--m-sub)" }}>
              GRAPHIC DESIGN <span className="text-[var(--crimson)]">→</span> AI DESIGN <span className="text-[var(--crimson)]">→</span> GEN AI <span className="text-[var(--crimson)]">→</span> AI CREATIVE DIRECTION
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
