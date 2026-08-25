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

/* ================= CAREER NODE MAP — LIVING PRODUCTION-PROGRESSION NETWORK =================
   Career climbs PREMA SAI → CYBEREDGE → DNEG → IMPROMP2LABS.
   Rear depth bands + shadow chain, looping signal flow, branch satellites (real skill data),
   blinking junctions, pulsing active station. Hover scans · click locks. */

const STATION_POS: Record<number, { x: number; y: number }> = {
  3: { x: 84, y: 330 },   /* PREMA SAI DESIGNERS — origin */
  2: { x: 210, y: 246 },  /* CYBEREDGE */
  1: { x: 336, y: 162 },  /* DNEG */
  0: { x: 448, y: 78 },   /* IMPROMP2LABS — current */
};
const ORDER = [3, 2, 1, 0]; /* progression, oldest → newest */
const CHAIN_PTS: [number, number][] = [
  [84, 330], [148, 292], [210, 246], [274, 208], [336, 162], [394, 124], [448, 78],
];
const ELBOWS: [number, number][] = [[148, 292], [274, 208], [394, 124]];
const SAT_OFFSET: Record<number, [number, number]> = {
  3: [-46, 56],
  2: [-46, 56],
  1: [-46, 56],
  0: [44, 40],
};
const chainD = (pts: [number, number][]) =>
  pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x} ${y}`).join(" ");

function NodeMap({
  active, hoverIdx, locked, reduced, companies, onHover, onLeaveRow, onPick,
}: {
  active: number;
  hoverIdx: number | null;
  locked: boolean;
  reduced: boolean;
  companies: { id: string; num: string; name: string; date: string; skills: string[] }[];
  onHover: (i: number) => void;
  onLeaveRow: () => void;
  onPick: (i: number) => void;
}) {
  const activeRank = ORDER.indexOf(active); /* 0 at PREMA … 3 at IMPROMP2 */
  const litPts = CHAIN_PTS.slice(0, activeRank * 2 + 1);
  const litD = litPts.length > 1 ? chainD(litPts) : "";

  return (
    <div className="relative border rounded-xl mat-texture corner-bracket overflow-hidden"
      style={{ borderColor: "var(--m-line)", backgroundColor: "color-mix(in srgb, var(--outer-ink) 5%, transparent)", aspectRatio: "520 / 430" }}
      onMouseLeave={onLeaveRow}>

      {/* ---------- wiring + depth layers ---------- */}
      <svg viewBox="0 0 520 430" className="absolute inset-0 w-full h-full" fill="none" aria-hidden>
        {/* rear structural depth bands */}
        <rect x="-60" y="306" width="680" height="92" transform="rotate(-33 280 352)" fill="var(--line-soft)" />
        <rect x="-60" y="272" width="680" height="12" transform="rotate(-33 280 278)" fill="var(--line-soft)" opacity="0.85" />
        <rect x="-60" y="392" width="680" height="5" transform="rotate(-33 280 394)" fill="var(--line-soft)" opacity="0.6" />

        {/* chain drop shadow */}
        <path d={chainD(CHAIN_PTS)} stroke="#222328" strokeOpacity="0.2" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" transform="translate(3 6)" />
        {/* base chain */}
        <path d={chainD(CHAIN_PTS)} stroke="var(--m-line)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {/* ambient looping signal along the whole chain */}
        {!reduced && (
          <path d={chainD(CHAIN_PTS)} stroke="var(--m-sub)" strokeWidth="2" strokeLinecap="round" pathLength={360} className="route-signal" opacity="0.5" />
        )}
        {/* active route — crimson, lit up to the selected station */}
        {litD && (
          <>
            <path d={litD} stroke="var(--crimson)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
            {!reduced && <path d={litD} stroke="#DDDDD8" strokeWidth="2" strokeLinecap="round" pathLength={360} className="route-signal" />}
          </>
        )}

        {/* junction elbows — blinking cores */}
        {ELBOWS.map(([x, y], k) => (
          <g key={k}>
            <rect x={x - 7} y={y - 7} width="14" height="14" transform={`rotate(45 ${x} ${y})`}
              fill="#59595B" stroke="var(--m-line)" strokeWidth="1.4" />
            <circle cx={x} cy={y} r="2.6" fill="#A6A6A4" className={reduced ? undefined : "live-blink"}
              style={{ animationDelay: `${k * 0.5}s` }} />
          </g>
        ))}

        {/* terminal block beyond the newest chapter */}
        <g>
          <path d="M462 64 L486 48" stroke="var(--m-line)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 7" />
          <rect x="470" y="28" width="42" height="22" fill="color-mix(in srgb, var(--outer-ink) 10%, transparent)" stroke="var(--m-line)" strokeWidth="1.4" />
          <path d="M482 39 h12 M490 34 l6 5 -6 5" stroke="var(--m-sub)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* branch satellites — one per chapter, labelled with its lead skill */}
        {companies.map((c, i) => {
          const p = STATION_POS[i];
          const [dx, dy] = SAT_OFFSET[i];
          const sx = p.x + dx, sy = p.y + dy;
          const on = i === active;
          return (
            <g key={`sat-${c.id}`}>
              <path d={`M${p.x} ${p.y} L${sx} ${sy}`} stroke={on ? "var(--crimson)" : "var(--m-line)"} strokeWidth="2"
                strokeDasharray={on && !reduced ? undefined : "3 5"} style={{ transition: "stroke .35s ease" }} />
              <rect x={sx - 6.5} y={sy - 6.5} width="13" height="13" transform={`rotate(45 ${sx} ${sy})`}
                fill={on ? "var(--crimson)" : "#59595B"} stroke="var(--m-line)" strokeWidth="1.3" style={{ transition: "fill .35s ease" }} />
              <circle cx={sx} cy={sy} r="2" fill={on ? "#DDDDD8" : "#A6A6A4"} className={reduced ? undefined : "live-blink"} style={{ animationDelay: `${i * 0.37}s` }} />
              <text x={sx} y={sy + 21} textAnchor="middle" fontSize="8.5" letterSpacing="1.5"
                fill={on ? "var(--crimson)" : "var(--m-sub)"} style={{ fontFamily: "IBM Plex Mono, monospace", transition: "fill .35s ease" }}>
                {(c.skills[0] ?? "").slice(0, 16)}
              </text>
            </g>
          );
        })}

        {/* station echo plates — offset depth behind each company node */}
        {companies.map((c, i) => {
          const p = STATION_POS[i];
          return (
            <rect key={`echo-${c.id}`} x={p.x - 66} y={p.y - 22} width="140" height="52"
              fill="#59595B" opacity="0.34" transform="translate(6 7)"
              style={{ clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)" }} />
          );
        })}
      </svg>

      {/* ---------- company stations (primary nodes) ---------- */}
      {companies.map((c, i) => {
        const p = STATION_POS[i];
        const isActive = i === active;
        const isHover = i === hoverIdx;
        return (
          <button key={c.id}
            onClick={() => onPick(i)}
            onMouseEnter={() => onHover(i)}
            className="absolute -translate-x-1/2 -translate-y-1/2 text-left mat-texture"
            style={{
              left: `${(p.x / 520) * 100}%`,
              top: `${(p.y / 430) * 100}%`,
              width: "clamp(120px, 27%, 152px)",
              clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
              backgroundColor: isActive ? "var(--crimson)" : "var(--outer-bg)",
              boxShadow: isActive
                ? "inset 0 0 0 1.5px rgba(221,221,216,0.5), 0 14px 30px -14px rgba(231,34,65,0.65)"
                : isHover
                  ? "inset 0 0 0 1.5px var(--crimson)"
                  : "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 24%, transparent)",
              transform: `translate(-50%, -50%) ${isHover && !isActive ? "translateX(4px)" : ""}`,
              transition: "background-color .35s ease, box-shadow .35s ease, transform .35s ease",
            }}
            aria-label={`${c.name} — ${c.date}`}>
            {/* active pulse ring */}
            {isActive && !reduced && (
              <span className="absolute -inset-1.5 pointer-events-none"
                style={{ border: "2px solid var(--crimson)", clipPath: "inherit", animation: "stationPulse 1.8s cubic-bezier(.3,.7,.4,1) infinite" }} />
            )}
            <span className="relative flex items-center gap-2.5 px-3 py-2.5 sm:px-3.5 sm:py-3">
              <span className="grid place-items-center w-6 h-6 sm:w-7 sm:h-7 shrink-0 f-mono font-semibold text-[10px] sm:text-[11px]"
                style={{
                  background: isActive ? "#DDDDD8" : "var(--crimson)",
                  color: isActive ? "var(--crimson)" : "#DDDDD8",
                  transition: "background-color .35s ease, color .35s ease",
                }}>
                {c.num}
              </span>
              <span className="min-w-0">
                <span className="block f-tech font-bold text-[10.5px] sm:text-[12px] tracking-[0.1em] leading-tight truncate"
                  style={{ color: isActive ? "#DDDDD8" : "var(--outer-ink)" }}>
                  {c.name}
                </span>
                <span className="block f-mono text-[6.5px] sm:text-[7.5px] tracking-[0.12em] mt-1 truncate"
                  style={{ color: isActive ? "rgba(221,221,216,0.75)" : "var(--m-sub)" }}>
                  {c.date.split("·")[0].trim()}
                </span>
              </span>
            </span>
            {isActive && locked && <span className="absolute bottom-1 right-1.5 w-2 h-2 rotate-45 bg-[#DDDDD8]" />}
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
