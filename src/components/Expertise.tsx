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
   One strong vertical spine, four PRIMARY chapter stations (01 → 04), solid
   structural sections + junction diamonds + skill satellites + a continuously
   looping signal. COMPANY → CAREER CHAPTER → NEXT CHAPTER. */

const SPINE_X = 168;
const ROW_CY = [66, 172, 278, 384];
const SPINE_TOP = 22;
const SPINE_BOT = 448;
const JUNCTION_MIDS = [119, 225, 331];

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
  const activeY = ROW_CY[Math.min(active, ROW_CY.length - 1)];
  const category = (role: string) => role.split("·")[0].trim();

  return (
    <div className="relative border rounded-xl mat-texture corner-bracket overflow-hidden"
      style={{ borderColor: "var(--m-line)", backgroundColor: "color-mix(in srgb, var(--outer-ink) 5%, transparent)", aspectRatio: "560 / 470" }}
      onMouseLeave={onLeaveRow}>

      <svg viewBox="0 0 560 470" className="absolute inset-0 w-full h-full">
        {/* depth strata */}
        <rect x="0" y="0" width="560" height="150" fill="var(--outer-ink)" opacity="0.03" />
        <rect x="0" y="150" width="560" height="160" fill="var(--outer-ink)" opacity="0.055" />
        <rect x="0" y="310" width="560" height="160" fill="var(--outer-ink)" opacity="0.03" />
        <line x1="0" y1="150" x2="560" y2="150" stroke="var(--m-line)" strokeWidth="0.6" />
        <line x1="0" y1="310" x2="560" y2="310" stroke="var(--m-line)" strokeWidth="0.6" />

        {/* ---------- SPINE — solid structural track ---------- */}
        <rect x={SPINE_X - 7} y={SPINE_TOP} width="14" height={SPINE_BOT - SPINE_TOP} rx="2" fill="var(--m-line)" opacity="0.45" />
        <rect x={SPINE_X - 2.5} y={SPINE_TOP} width="5" height={SPINE_BOT - SPINE_TOP} fill="color-mix(in srgb, var(--outer-ink) 12%, transparent)" />
        {/* end housings */}
        <rect x={SPINE_X - 12} y={SPINE_TOP - 8} width="24" height="10" rx="2" fill="var(--m-line)" />
        <rect x={SPINE_X - 12} y={SPINE_BOT - 2} width="24" height="10" rx="2" fill="var(--m-line)" />
        {/* looping signal travelling the whole spine */}
        {!reduced && (
          <line x1={SPINE_X} y1={SPINE_TOP} x2={SPINE_X} y2={SPINE_BOT}
            stroke="var(--crimson)" strokeWidth="2" className="packet" opacity="0.85" />
        )}
        {/* lit route — top → active chapter */}
        <line x1={SPINE_X} y1={SPINE_TOP} x2={SPINE_X} y2={activeY}
          stroke="var(--crimson)" strokeWidth="4" strokeLinecap="round" opacity="0.9"
          style={{ transition: "all .5s cubic-bezier(.3,.8,.3,1)" }} />
        {!reduced && (
          <line x1={SPINE_X} y1={SPINE_TOP} x2={SPINE_X} y2={activeY}
            stroke="#DDDDD8" strokeWidth="1.4" strokeDasharray="3 9" className="packet-2" opacity="0.5" />
        )}
        {/* junction diamonds between chapters */}
        {JUNCTION_MIDS.map((y, k) => {
          const near = Math.abs(ROW_CY[active] - y) <= 53;
          return (
            <rect key={y} x={SPINE_X - 6.5} y={y - 6.5} width="13" height="13"
              transform={`rotate(45 ${SPINE_X} ${y})`}
              fill={near ? "var(--crimson)" : "var(--m-line)"}
              stroke="color-mix(in srgb, var(--outer-ink) 30%, transparent)" strokeWidth="1.2"
              style={{ transition: "fill .4s ease" }} />
          );
        })}

        {/* ---------- CHAPTER STATIONS + SATELLITES ---------- */}
        {companies.map((co, i) => {
          const cy = ROW_CY[i];
          const isOn = i === active;
          const isHover = i === hoverIdx;
          return (
            <g key={co.id}
              onMouseEnter={() => onHover(i)}
              onClick={() => onPick(i)}
              className="cursor-pointer">
              {/* connector module → spine */}
              <line x1="152" y1={cy} x2={SPINE_X - 7} y2={cy} stroke="var(--m-line)" strokeWidth="3" />
              <circle cx={SPINE_X} cy={cy} r="5.5" fill={isOn ? "var(--crimson)" : "var(--m-line)"}
                stroke="color-mix(in srgb, var(--outer-ink) 35%, transparent)" strokeWidth="1.4"
                style={{ transition: "fill .35s ease" }} />

              {/* station block — chamfered */}
              <polygon
                points={`22,${cy - 32} 152,${cy - 32} 152,${cy + 24} 144,${cy + 32} 8,${cy + 32} 8,${cy - 24} 16,${cy - 32}`}
                fill={isOn ? "var(--crimson)" : isHover ? "color-mix(in srgb, var(--crimson) 22%, transparent)" : "color-mix(in srgb, var(--outer-ink) 8%, transparent)"}
                stroke={isOn ? "#DDDDD8" : "var(--m-line)"} strokeWidth="1.4"
                style={{ transition: "fill .35s ease, stroke .35s ease" }} />
              <polygon
                points={`22,${cy - 32} 152,${cy - 32} 152,${cy + 24} 144,${cy + 32} 8,${cy + 32} 8,${cy - 24} 16,${cy - 32}`}
                fill="none"
                stroke={isOn ? "rgba(221,221,216,0.4)" : "transparent"} strokeWidth="1"
                transform={`translate(3 3)`} style={{ transition: "stroke .35s ease" }} />
              {/* station text */}
              <text x="24" y={cy - 14} className="f-mono" fontSize="9" letterSpacing="2"
                fill={isOn ? "#DDDDD8" : "var(--crimson)"} fontWeight="600">{co.num}</text>
              <text x="24" y={cy + 3} className="f-tech" fontSize="14.5" fontWeight="700" letterSpacing="1"
                fill={isOn ? "#DDDDD8" : "var(--outer-ink)"} style={{ transition: "fill .35s ease" }}>{co.name}</text>
              <text x="24" y={cy + 18} className="f-mono" fontSize="7.5" letterSpacing="1.4"
                fill={isOn ? "rgba(221,221,216,0.85)" : "var(--m-sub)"}>{co.date}</text>
              <text x="24" y={cy + 27.5} className="f-tech" fontSize="7.5" fontWeight="700" letterSpacing="1.6"
                fill={isOn ? "rgba(221,221,216,0.9)" : "var(--crimson)"} opacity={isOn ? 1 : 0.85}>{category(co.role)}</text>

              {/* active chapter → skill satellite branch */}
              {isOn && (
                <g>
                  <line x1={SPINE_X + 7} y1={cy} x2="382" y2={cy} stroke="var(--m-line)" strokeWidth="2.4" />
                  <line x1={SPINE_X + 7} y1={cy} x2="382" y2={cy} stroke="var(--crimson)" strokeWidth="1.4" opacity="0.9" />
                  <circle cx="262" cy={cy} r="4" fill="var(--crimson)" />
                  {!reduced && (
                    <rect x={SPINE_X + 12} y={cy - 2.5} width="10" height="5" rx="1" fill="#DDDDD8" className="arm-packet" />
                  )}
                  {co.skills.slice(0, 3).map((s, k) => {
                    const yy = cy + (k - 1) * 26;
                    return (
                      <g key={s}>
                        <line x1="382" y1={cy} x2="382" y2={yy} stroke="var(--m-line)" strokeWidth="1.2" />
                        <line x1="382" y1={yy} x2="392" y2={yy} stroke="var(--m-line)" strokeWidth="1.2" />
                        <rect x="392" y={yy - 10} width="152" height="20" rx="3"
                          fill={isHover ? "color-mix(in srgb, var(--crimson) 16%, transparent)" : "color-mix(in srgb, var(--outer-ink) 9%, transparent)"}
                          stroke="var(--m-line)" strokeWidth="1" style={{ transition: "fill .3s ease" }} />
                        <text x="400" y={yy + 3.5} className="f-tech" fontSize="8.5" fontWeight="700" letterSpacing="1.4"
                          fill="var(--outer-ink)">{s}</text>
                      </g>
                    );
                  })}
                </g>
              )}
            </g>
          );
        })}

        {/* origin / terminus marks */}
        <text x={SPINE_X - 46} y={SPINE_TOP - 1} className="f-mono" fontSize="8" letterSpacing="2" fill="var(--m-sub)">2018</text>
        <text x={SPINE_X - 46} y={SPINE_BOT + 16} className="f-mono" fontSize="8" letterSpacing="2" fill="var(--m-sub)">NOW</text>
      </svg>

      {/* status strip */}
      <div className="absolute bottom-2.5 inset-x-4 flex items-center justify-between f-mono text-[8px] tracking-[0.24em] pointer-events-none" style={{ color: "var(--m-sub)" }}>
        <span className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 bg-[var(--crimson)] ${locked ? "" : "live-blink"}`} />
          {locked ? "CHAPTER LOCKED" : hoverIdx !== null ? "SCANNING" : reduced ? "STATIC" : "AUTO CYCLE"}
        </span>
        <span>COMPANY → CHAPTER → NEXT CHAPTER</span>
      </div>
    </div>
  );
}

export default function Expertise() {
  const { data } = useStore();
  const { statement, statementAccent, supporting, companies } = data.expertise;
  const reduced = useReducedMotion();
  const n = companies.length;
  const [active, setActive] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const [locked, setLocked] = useState(false);
  const elapsedRef = useRef(0);

  /* 30s cycle — hover pauses at the exact position, leave resumes */
  useEffect(() => {
    if (reduced || locked || hover) return;
    const last0 = performance.now();
    let last = last0;
    const iv = window.setInterval(() => {
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

              {/* ================= CAREER INFO (LEFT) — adapts to the selected chapter ================= */}
              <div className="mat-inner mat-texture dossier-clip corner-bracket relative p-5 sm:p-7 flex flex-col min-h-0 overflow-hidden lg:min-h-[640px] order-1">
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
