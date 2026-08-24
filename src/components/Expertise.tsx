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

/* ================= CAREER NODE MAP — industrial data-pipeline hardware =================
   company modules (LEFT) → docking arms → structural hub w/ techno sphere → routing manifold */
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
  const n = companies.length;
  const H = ROW_H * n;
  const wrapRef = useRef<HTMLDivElement>(null);
  const ptrRef = useRef<HTMLDivElement>(null);
  const ptr = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0, seen: false });

  /* bloom triangle pointer — follows the mouse, settles back to center on leave */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const c = el.getBoundingClientRect();
    ptr.current.x = ptr.current.tx = c.width / 2;
    ptr.current.y = ptr.current.ty = c.height / 2;
    if (reduced) return;
    const loop = () => {
      const p = ptr.current;
      p.x += (p.tx - p.x) * 0.16;
      p.y += (p.ty - p.y) * 0.16;
      if (ptrRef.current) {
        ptrRef.current.style.transform = `translate(${p.x - 9}px, ${p.y - 8}px)`;
        ptrRef.current.style.opacity = p.seen ? "0.95" : "0.45";
      }
      p.raf = requestAnimationFrame(loop);
    };
    ptr.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(ptr.current.raf);
  }, [reduced]);

  const onMove = (e: React.MouseEvent) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    ptr.current.tx = e.clientX - r.left;
    ptr.current.ty = e.clientY - r.top;
    ptr.current.seen = true;
  };
  const onLeave = () => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    ptr.current.tx = r.width / 2;
    ptr.current.ty = r.height / 2;
    ptr.current.seen = false;
  };

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave}
      className="relative border rounded-xl p-4 sm:p-5 mat-texture corner-bracket flex gap-0 overflow-hidden"
      style={{ borderColor: "var(--m-line)", backgroundColor: "color-mix(in srgb, var(--outer-ink) 6%, transparent)" }}>

      {/* bloom triangle selector — no tail, no stem */}
      <div ref={ptrRef} className="absolute top-0 left-0 z-30 pointer-events-none" style={{ opacity: 0.45 }}>
        <svg width="18" height="16" viewBox="0 0 18 16" style={{ filter: "drop-shadow(0 0 6px rgba(227,34,64,0.65))" }}>
          <path d="M9 0 L18 15 L0 15 Z" fill="var(--crimson)" />
          <path d="M9 4.5 L14.5 13.5 L3.5 13.5 Z" fill="#f4f2ed" opacity="0.28" />
        </svg>
      </div>

      {/* ---------- LEFT : company modules + docking arms ---------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {companies.map((c, i) => {
          const isActive = i === active;
          const isHover = i === hoverIdx;
          return (
            <div key={c.id} className="flex items-center" style={{ height: ROW_H }} onMouseLeave={onLeaveRow}>
              <button onClick={() => onPick(i)} onMouseEnter={() => onHover(i)}
                className="module-plate relative flex-1 h-[72px] dossier-clip-sm flex items-center gap-3 sm:gap-4 px-4 sm:px-5 text-left overflow-hidden"
                style={{
                  backgroundColor: isActive
                    ? "color-mix(in srgb, var(--crimson) 92%, #1b1c20)"
                    : isHover
                      ? "color-mix(in srgb, var(--outer-ink) 16%, transparent)"
                      : "color-mix(in srgb, var(--outer-ink) 9%, transparent)",
                  border: `1.5px solid ${isActive ? "var(--crimson)" : isHover ? "var(--outer-ink)" : "var(--m-line)"}`,
                  color: isActive ? "#f4f2ed" : "var(--outer-ink)",
                  transform: isActive || isHover ? "translateX(4px)" : "none",
                  transition: "background-color .35s ease, border-color .35s ease, transform .35s ease, box-shadow .35s ease",
                  boxShadow: isActive ? "0 14px 34px -16px rgba(227,34,64,0.6)" : undefined,
                }}>
                <span className="absolute top-0 right-8 w-6 h-[3px]" style={{ background: isActive ? "#f4f2ed" : "var(--m-line)" }} />
                <span className="min-w-0 flex-1">
                  <span className="block f-tech font-bold text-[12.5px] sm:text-[14px] tracking-[0.14em] truncate">{c.name}</span>
                  <span className="block f-mono text-[8px] sm:text-[9px] tracking-[0.14em] mt-1"
                    style={{ color: isActive ? "rgba(244,242,237,0.75)" : "var(--m-sub)" }}>
                    {c.date.split("·")[0].trim()}
                  </span>
                </span>
                <span className="f-display text-[26px] sm:text-[30px] leading-none shrink-0" style={{ opacity: isActive ? 0.5 : 0.18 }}>
                  {c.num}
                </span>
                {isActive && locked && <span className="absolute bottom-1.5 right-2.5 w-2 h-2 rotate-45 bg-[#f4f2ed]" />}
              </button>

              {/* docking arm — module → hub, with travelling packet when active */}
              <span className="hidden sm:block relative w-[52px] h-[10px] shrink-0 ml-0" aria-hidden>
                <span className="absolute inset-y-[3px] inset-x-0"
                  style={{
                    background: isActive ? "var(--crimson)" : "var(--m-line)",
                    backgroundImage: isActive ? undefined : "repeating-linear-gradient(90deg, transparent 0 5px, color-mix(in srgb, var(--outer-ink) 22%, transparent) 5px 8px)",
                  }} />
                {isActive && !reduced && (
                  <span className="arm-packet absolute top-1/2 -translate-y-1/2 left-0 w-2.5 h-2.5 rounded-[2px]" style={{ background: "#f4f2ed" }} />
                )}
                <span className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-4" style={{ background: isActive ? "var(--crimson)" : "var(--m-line)" }} />
              </span>
            </div>
          );
        })}
      </div>

      {/* ---------- RIGHT : interactive node tree / production pipeline ----------
          COMPANY → ENTRY NODE → BRANCH → SECONDARY NODES → SPINE JUNCTION → TERMINAL ROUTE */}
      <div className="hidden md:block w-[250px] lg:w-[280px] shrink-0 relative" style={{ height: H }}>
        <svg viewBox={`0 0 260 ${H}`} className="absolute inset-0 w-full h-full" fill="none">
          {/* central spine — structural rail + inner channel + ambient data */}
          <rect x="160" y="12" width="9" height={H - 24} fill="color-mix(in srgb, var(--outer-ink) 14%, transparent)" />
          <path d={`M164.5 12 V ${H - 12}`} stroke="var(--m-line)" strokeWidth="1" />
          {!reduced && <path d={`M164.5 12 V ${H - 12}`} stroke="var(--crimson)" strokeWidth="2" className="packet-2" pathLength={352} opacity="0.55" />}
          {[12, H - 12].map((yy) => (
            <g key={yy}>
              <rect x="156" y={yy - 5} width="17" height="10" fill="color-mix(in srgb, var(--outer-ink) 18%, transparent)" stroke="var(--m-line)" strokeWidth="1.2" />
              <circle cx="164.5" cy={yy} r="1.8" fill="var(--m-line)" />
            </g>
          ))}

          {companies.map((c, i) => {
            const y = i * ROW_H + ROW_H / 2;
            const on = i === active;
            const col = on ? "var(--crimson)" : "var(--m-line)";
            const yu = y - 24, yd = y + 24;
            return (
              <g key={c.id}>
                {/* entry node — mechanical connector block */}
                <rect x="0" y={y - 13} width="22" height="26"
                  fill={on ? "color-mix(in srgb, var(--crimson) 26%, transparent)" : "color-mix(in srgb, var(--outer-ink) 12%, transparent)"}
                  stroke={col} strokeWidth="1.5" />
                <rect x="6" y={y - 5} width="10" height="10" fill={on ? "var(--crimson)" : "var(--m-line)"} />
                {/* pipeline → junction node */}
                <path d={`M22 ${y} H60`} stroke={col} strokeWidth="2.6" />
                <circle cx="60" cy={y} r="7" fill="color-mix(in srgb, var(--outer-ink) 10%, transparent)" stroke={col} strokeWidth="1.6" />
                <circle cx="60" cy={y} r="2.6" fill={on ? "var(--crimson)" : "var(--m-line)"} />
                {/* branch routes → secondary nodes */}
                <path d={`M60 ${y} L84 ${yu} H112`} stroke={col} strokeWidth="2.2" />
                <path d={`M60 ${y} L84 ${yd} H112`} stroke={col} strokeWidth="2.2" />
                <rect x="115.5" y={yu - 5.5} width="11" height="11" transform={`rotate(45 121 ${yu})`}
                  fill={on ? "var(--crimson)" : "color-mix(in srgb, var(--outer-ink) 18%, transparent)"} stroke={col} strokeWidth="1.4" />
                <rect x="115.5" y={yd - 5.5} width="11" height="11" transform={`rotate(45 121 ${yd})`}
                  fill={on ? "var(--crimson)" : "color-mix(in srgb, var(--outer-ink) 18%, transparent)"} stroke={col} strokeWidth="1.4" />
                {/* secondary nodes → spine junction */}
                <path d={`M129 ${yu} H148 L160 ${y}`} stroke={col} strokeWidth="2" />
                <path d={`M129 ${yd} H148 L160 ${y}`} stroke={col} strokeWidth="2" />
                {/* spine junction housing */}
                <rect x="153" y={y - 10} width="23" height="20"
                  fill={on ? "color-mix(in srgb, var(--crimson) 88%, #1b1c20)" : "color-mix(in srgb, var(--outer-ink) 18%, transparent)"}
                  stroke={col} strokeWidth="1.6" />
                <circle cx="164.5" cy={y} r="2.4" fill={on ? "#f4f2ed" : "var(--m-line)"} />
                {/* terminal route + block + chevrons + end cap */}
                <path d={`M176 ${y} H196`} stroke={col} strokeWidth="2.4" />
                <rect x="196" y={y - 12} width="24" height="24"
                  fill={on ? "color-mix(in srgb, var(--crimson) 20%, transparent)" : "color-mix(in srgb, var(--outer-ink) 10%, transparent)"}
                  stroke={col} strokeWidth="1.5" />
                <circle cx="203" cy={y} r="2.4" fill={on ? "var(--crimson)" : "var(--m-line)"} />
                <path d={`M209 ${y - 6} h8 M209 ${y} h6 M209 ${y + 6} h8`} stroke={col} strokeWidth="1.3" />
                <path d={`M226 ${y} H236`} stroke={col} strokeWidth="2" />
                <path d={`M236 ${y - 6} L244 ${y} L236 ${y + 6}`} stroke={col} strokeWidth="1.6" />
                <path d={`M244 ${y - 6} L252 ${y} L244 ${y + 6}`} stroke={col} strokeWidth="1.6" opacity="0.7" />
                <rect x="254" y={y - 7} width="4" height="14" fill={col} />
                {/* active signals travelling the branch */}
                {on && !reduced && (
                  <>
                    <path d={`M22 ${y} H60 L84 ${yu} H112`} stroke="var(--crimson)" strokeWidth="2.6" className="packet" pathLength={352} />
                    <path d={`M129 ${yd} H148 L160 ${y} H196`} stroke="var(--crimson)" strokeWidth="2.2" className="packet-2" pathLength={352} opacity="0.9" />
                  </>
                )}
              </g>
            );
          })}
        </svg>
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

              {/* ================= CAREER INFO (LEFT) — extended so DNEG fits fully ================= */}
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
