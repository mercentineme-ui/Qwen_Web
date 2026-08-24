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

/* ============================================================
   CAREER NODE MAP — CHAPTER CONSTELLATION / DATA ARCHITECTURE
   Four primary chapter stations on staggered structural layers,
   angular data routes converging on a dossier-link terminal.
   ============================================================ */

const STATIONS = [
  { left: 3,  top: 6,  clip: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)", anchor: [47, 14.5] },
  { left: 40, top: 26, clip: "polygon(18px 0, 100% 0, 100% 100%, 0 100%, 0 18px)",              anchor: [84, 34.5] },
  { left: 5,  top: 52, clip: "polygon(0 0, 100% 0, 100% calc(100% - 18px), calc(100% - 18px) 100%, 0 100%)", anchor: [49, 60.5] },
  { left: 42, top: 73, clip: "polygon(0 18px, 18px 0, 100% 0, 100% 100%, 0 100%)",              anchor: [86, 81.5] },
];

const ROUTES = [
  "M47 14.5 H60 L66 20.5 V54.5 L72 60.5 V85 L78 91 H87",
  "M84 34.5 H87.5 L90.5 37.5 V86",
  "M49 60.5 H56 L62 66.5 V80 L68 86 H87",
  "M86 81.5 H89.5 L92.5 84.5 V86.5",
];

const JUNCTIONS: [number, number][] = [
  [66, 20.5], [72, 60.5], [90.5, 37.5], [62, 66.5], [78, 91],
];

function NodeMap({
  active, hoverIdx, locked, reduced, companies, onHover, onLeaveRow, onPick,
}: {
  active: number;
  hoverIdx: number | null;
  locked: boolean;
  reduced: boolean;
  companies: { id: string; num: string; name: string; date: string }[];
  onHover: (i: number) => void;
  onLeaveRow: () => void;
  onPick: (i: number) => void;
}) {
  return (
    <div className="relative border rounded-xl mat-texture corner-bracket overflow-hidden h-[430px] sm:h-[490px] lg:h-[520px]"
      style={{ borderColor: "var(--m-line)", backgroundColor: "color-mix(in srgb, var(--outer-ink) 5%, transparent)" }}>

      {/* layered structural strata — depth bands behind the constellation */}
      <span className="absolute inset-x-0 top-[24%] h-px opacity-60" style={{ background: "var(--m-line)" }} />
      <span className="absolute inset-x-0 top-[50%] h-px opacity-40" style={{ background: "var(--m-line)" }} />
      <span className="absolute inset-x-0 top-[76%] h-px opacity-60" style={{ background: "var(--m-line)" }} />
      <span className="absolute left-[6%] top-[8%] bottom-[6%] w-[3px] opacity-25"
        style={{ background: "repeating-linear-gradient(180deg, var(--outer-ink) 0 10px, transparent 10px 18px)" }} />

      {/* data network — angular routes, junctions, architectural datum */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="none" aria-hidden>
        {/* architectural datum line with survey ticks */}
        <path d="M62 3 V97" stroke="var(--m-line)" strokeWidth="1" strokeDasharray="0.8 2.4" vectorEffect="non-scaling-stroke" />
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d={`M60.6 ${7 + i * 8} H63.4`} stroke="var(--m-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        ))}

        {/* structural routes per chapter */}
        {ROUTES.map((d, i) => {
          const on = i === active;
          return (
            <g key={i}>
              <path d={d} stroke={on ? "var(--crimson)" : "var(--m-line)"} strokeWidth={on ? 2.4 : 1.7}
                vectorEffect="non-scaling-stroke"
                style={{ transition: "stroke .35s ease" }} />
              {on && !reduced && (
                <path d={d} stroke="var(--crimson)" strokeWidth="2.6" className="route-signal" pathLength={100}
                  vectorEffect="non-scaling-stroke" opacity="0.95" />
              )}
            </g>
          );
        })}
      </svg>

      {/* junction elements — solid diamonds at route elbows */}
      {JUNCTIONS.map(([x, y], i) => (
        <span key={i} className="absolute w-[9px] h-[9px] rotate-45 -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${x}%`, top: `${y}%`,
            backgroundColor: "color-mix(in srgb, var(--outer-ink) 20%, transparent)",
            boxShadow: "inset 0 0 0 1.5px var(--m-line)",
          }} />
      ))}

      {/* dossier-link terminal — where every route lands */}
      <div className="absolute flex flex-col items-center justify-center gap-1 rounded-lg mat-texture"
        style={{
          left: "87%", top: "86%", width: "11.5%", height: "11%", minWidth: 86,
          backgroundColor: active >= 0 ? "color-mix(in srgb, var(--crimson) 16%, transparent)" : "color-mix(in srgb, var(--outer-ink) 10%, transparent)",
          boxShadow: `inset 0 0 0 1.5px ${active >= 0 ? "var(--crimson)" : "var(--m-line)"}`,
          transition: "background-color .35s ease, box-shadow .35s ease",
        }}>
        <span className="f-mono text-[7.5px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>DOSSIER</span>
        <span className="f-tech font-bold text-[9px] tracking-[0.18em] text-[var(--crimson)]">LINK ◂</span>
      </div>

      {/* chapter stations — the primary objects */}
      {companies.map((c, i) => {
        const st = STATIONS[i % STATIONS.length];
        const isActive = i === active;
        const isHover = i === hoverIdx;
        const lit = isActive || isHover;
        return (
          <button key={c.id}
            onMouseEnter={() => onHover(i)}
            onMouseLeave={onLeaveRow}
            onClick={() => onPick(i)}
            className="absolute text-left group"
            style={{
              left: `${st.left}%`, top: `${st.top}%`, width: "44%", height: "17%",
              clipPath: st.clip,
              backgroundColor: isActive
                ? "var(--crimson)"
                : isHover
                  ? "var(--hero-crimson)"
                  : "color-mix(in srgb, var(--outer-ink) 9%, transparent)",
              color: lit ? "#f4f2ed" : "var(--outer-ink)",
              boxShadow: `inset 0 0 0 1.5px ${isActive ? "rgba(244,242,237,0.5)" : isHover ? "rgba(244,242,237,0.35)" : "var(--m-line)"}, ${isActive ? "0 16px 36px -18px rgba(227,34,64,0.65)" : "0 10px 24px -18px rgba(0,0,0,0.6)"}`,
              transform: lit ? "translateY(-3px)" : "none",
              transition: "background-color .35s ease, color .35s ease, transform .35s cubic-bezier(.3,.8,.3,1), box-shadow .35s ease",
            }}
            aria-label={`Select ${c.name}`}>
            <span className="absolute inset-0 mat-texture pointer-events-none" />
            {/* anchor nub — solid connector into the route network */}
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[7px] h-5"
              style={{ background: lit ? "#f4f2ed" : "var(--m-line)", transition: "background .35s ease" }} />
            <span className="relative flex items-center justify-between gap-2 h-full px-4 sm:px-5">
              <span className="min-w-0">
                <span className="block f-tech font-bold text-[11px] sm:text-[13.5px] tracking-[0.12em] leading-tight truncate">{c.name}</span>
                <span className="block f-mono text-[7.5px] sm:text-[8.5px] tracking-[0.14em] mt-1.5"
                  style={{ color: lit ? "rgba(244,242,237,0.8)" : "var(--m-sub)", transition: "color .35s ease" }}>
                  {c.date.split("·")[0].trim()}
                </span>
              </span>
              <span className="f-display text-[26px] sm:text-[32px] leading-none shrink-0" style={{ opacity: isActive ? 0.5 : 0.16 }}>
                {c.num}
              </span>
            </span>
            {isActive && locked && <span className="absolute bottom-1.5 left-3 w-2 h-2 rotate-45 bg-[#f4f2ed]" />}
          </button>
        );
      })}

      {/* system legend — micro metadata */}
      <div className="absolute left-4 bottom-3 flex items-center gap-4 f-mono text-[7.5px] tracking-[0.22em]" style={{ color: "var(--m-sub)" }}>
        <span>CHAPTER CONSTELLATION</span>
        <span className="hidden sm:inline">4 STATIONS · 5 JUNCTIONS · 1 TERMINAL</span>
      </div>
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
          <div className="mat-outer mat-texture rounded-xl p-5 sm:p-8 xl:p-10 relative overflow-hidden">
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

              {/* ================= CAREER INFO (LEFT) — adapts to the selected chapter ================= */}
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
                  <span className="flex items-center gap-2"><span className="w-3 h-[3px] bg-[var(--crimson)]" />SIGNAL</span>
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
