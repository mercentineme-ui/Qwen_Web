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

/* ================= CAREER INDEXING MACHINE =================
   Four manufactured identification plates on the LEFT. Each docks through
   its own arm → elbow joint → socket into a DIFFERENT zone of one large
   industrial chassis on the right (flywheel, gears, pistons, rack).
   Hover = subtle mechanical response ONLY · click = lock · again = unlock. */

const PLATE_CY = [62, 168, 274, 380];
const SOCKETS_Y = [120, 196, 288, 356]; /* machine entry zones */
const ELBOW_X = [262, 274, 250, 268];

function MiniGear({ cx, cy, r, teeth, spin, hot }: { cx: number; cy: number; r: number; teeth: number; spin: string; hot?: boolean }) {
  const edge = hot ? "#E72241" : "#A6A6A4";
  return (
    <g className={spin}>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        return (
          <rect key={i} x={-r * 0.14} y={-r * 0.17} width={r * 0.28} height={r * 0.34}
            transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
            fill="#59595B" stroke={edge} strokeWidth="1" style={{ transition: "stroke .35s ease" }} />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.9} fill="#3C3D42" stroke={edge} strokeWidth="1.4" style={{ transition: "stroke .35s ease" }} />
      <circle cx={cx} cy={cy} r={r * 0.34} fill="#222328" stroke={edge} strokeWidth="1" style={{ transition: "stroke .35s ease" }} />
      <circle cx={cx} cy={cy} r={r * 0.1} fill={hot ? "#E72241" : "#59595B"} style={{ transition: "fill .35s ease" }} />
    </g>
  );
}

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
  return (
    <div className="relative border rounded-xl mat-texture corner-bracket overflow-hidden"
      style={{ borderColor: "var(--m-line)", backgroundColor: "color-mix(in srgb, var(--outer-ink) 5%, transparent)", aspectRatio: "560 / 470" }}
      onMouseLeave={onLeaveRow}>

      <svg viewBox="0 0 560 470" className="absolute inset-0 w-full h-full">
        {/* shop-floor depth strata */}
        <rect x="0" y="0" width="560" height="470" fill="var(--outer-ink)" opacity="0.03" />
        <line x1="0" y1="452" x2="560" y2="452" stroke="var(--m-line)" strokeWidth="1" />

        {/* ================= MAIN MACHINE — heavy industrial chassis (RIGHT) ================= */}
        <g>
          {/* central axle + bearing blocks */}
          <line x1="437" y1="66" x2="437" y2="414" stroke="#3C3D42" strokeWidth="7" />
          <rect x="425" y="58" width="24" height="12" rx="2" fill="#59595B" stroke="#A6A6A4" strokeWidth="1" />
          <rect x="425" y="410" width="24" height="12" rx="2" fill="#59595B" stroke="#A6A6A4" strokeWidth="1" />

          {/* housing — thick plates, seams, rivets */}
          <rect x="330" y="60" width="214" height="360" rx="6" fill="#222328" stroke="#59595B" strokeWidth="2.2" />
          <rect x="338" y="68" width="198" height="344" rx="4" fill="none" stroke="#3C3D42" strokeWidth="1.2" />
          <line x1="338" y1="152" x2="536" y2="152" stroke="#3C3D42" strokeWidth="1.4" />
          <line x1="338" y1="330" x2="536" y2="330" stroke="#3C3D42" strokeWidth="1.4" />
          {[[340, 70], [526, 70], [340, 410], [526, 410], [340, 240], [526, 240]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r="2.6" fill="#59595B" stroke="#A6A6A4" strokeWidth="0.9" />
          ))}

          {/* docking sockets on the machine face — one per arm, each at its own zone */}
          {SOCKETS_Y.map((y, i) => {
            const engaged = i === active;
            return (
              <g key={y}>
                <rect x="322" y={y - 9} width="16" height="18" rx="2" fill="#3C3D42" stroke={engaged ? "#E72241" : "#59595B"} strokeWidth="1.4"
                  style={{ transition: "stroke .35s ease" }} />
                <rect x="326" y={y - 4} width="8" height="8" fill={engaged ? "#E72241" : "#222328"} style={{ transition: "fill .35s ease" }} />
                {/* actuator lever — moves when its chapter is engaged */}
                <g className={engaged && !reduced ? "valve-wiggle" : undefined} style={{ transformOrigin: "346px " + y + "px", animationDuration: "1.6s" }}>
                  <line x1="346" y1={y} x2="362" y2={y - 8} stroke={engaged ? "#E72241" : "#59595B"} strokeWidth="2.6" strokeLinecap="round"
                    style={{ transition: "stroke .35s ease" }} />
                  <circle cx="362" cy={y - 8} r="3" fill={engaged ? "#E72241" : "#A6A6A4"} style={{ transition: "fill .35s ease" }} />
                </g>
              </g>
            );
          })}

          {/* large flywheel — rim, rotating spokes + bolts, hub */}
          <circle cx="437" cy="235" r="78" fill="#3C3D42" stroke="#A6A6A4" strokeWidth="5" />
          <circle cx="437" cy="235" r="64" fill="none" stroke="#222328" strokeWidth="2" />
          <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "18s" }}>
            {Array.from({ length: 6 }).map((_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <line key={i} x1={437 + 14 * Math.cos(a)} y1={235 + 14 * Math.sin(a)}
                  x2={437 + 62 * Math.cos(a)} y2={235 + 62 * Math.sin(a)}
                  stroke="#59595B" strokeWidth="6" strokeLinecap="round" />
              );
            })}
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              return <circle key={i} cx={437 + 70 * Math.cos(a)} cy={235 + 70 * Math.sin(a)} r="2.8" fill="#222328" stroke="#A6A6A4" strokeWidth="1" />;
            })}
          </g>
          <circle cx="437" cy="235" r="17" fill="#222328" stroke="#A6A6A4" strokeWidth="2" />
          <circle cx="437" cy="235" r="6" fill={active === 1 ? "#E72241" : "#59595B"} style={{ transition: "fill .35s ease" }} />

          {/* upper zone — INTERLOCKING gear train (driven when chapter 01 docks) + twin pistons */}
          <MiniGear cx={378} cy={108} r={26} teeth={10} hot={active === 0} spin={reduced ? "" : "gear-ccw"} />
          <MiniGear cx={420} cy={130} r={17} teeth={8} hot={active === 0} spin={reduced ? "" : "gear-cw-fast"} />
          {[470, 502].map((x, k) => (
            <g key={x}>
              <rect x={x} y="84" width="20" height="40" rx="3" fill="#3C3D42" stroke="#A6A6A4" strokeWidth="1.4" />
              <rect x={x + 7} y="122" width="6" height="18" fill="#A6A6A4" className={reduced ? undefined : "piston"} style={{ animationDelay: `${k * 0.9}s` }} />
              <rect x={x + 3} y="138" width="14" height="6" rx="2" fill="#59595B" stroke="#A6A6A4" strokeWidth="1" />
            </g>
          ))}

          {/* lower zone — rack rail + drive gear + pressure dial */}
          <rect x="346" y="344" width="120" height="12" rx="2" fill="#3C3D42" stroke="#59595B" strokeWidth="1.2" />
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1={352 + i * 12} y1="346" x2={352 + i * 12} y2="354" stroke="#222328" strokeWidth="2" />
          ))}
          <rect x="352" y="341" width="26" height="18" rx="2" fill="#59595B" stroke="#A6A6A4" strokeWidth="1.2"
            className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "7s", transformOrigin: "365px 350px" }} />
          <MiniGear cx={500} cy={382} r={22} teeth={9} hot={active === 3} spin={reduced ? "" : "gear-cw-fast"} />
          <MiniGear cx={464} cy={366} r={14} teeth={7} hot={active === 3} spin={reduced ? "" : "gear-ccw"} />
          <g>
            <circle cx="378" cy="392" r="16" fill="#222328" stroke="#A6A6A4" strokeWidth="1.6" />
            <path d="M366 392 a12 12 0 0 1 24 0" fill="none" stroke="#59595B" strokeWidth="1.2" />
            <line x1="378" y1="392" x2="386" y2="383" stroke="#E72241" strokeWidth="2" strokeLinecap="round"
              className={reduced ? undefined : "valve-wiggle"} style={{ transformOrigin: "378px 392px", animationDuration: "4s" }} />
            <circle cx="378" cy="392" r="2.4" fill="#A6A6A4" />
          </g>

          {/* segmented mechanical channel — right column; each docking socket owns a
             marker segment, and the engaged chapter's segment lights crimson */}
          <g>
            <rect x="520" y="104" width="16" height="268" rx="2" fill="#222328" stroke="#59595B" strokeWidth="1.2" />
            {Array.from({ length: 13 }).map((_, k) => (
              <line key={k} x1="523" y1={112 + k * 20} x2="533" y2={112 + k * 20} stroke="#3C3D42" strokeWidth="1" />
            ))}
            {SOCKETS_Y.map((sy, i) => (
              <rect key={sy} x="522.5" y={sy - 7} width="11" height="14" rx="1"
                fill={i === active ? "#E72241" : "#3C3D42"} stroke={i === active ? "#DDDDD8" : "#59595B"} strokeWidth="0.9"
                style={{ transition: "fill .4s ease, stroke .4s ease" }} />
            ))}
          </g>
          {/* segmented shaft between flywheel hub and rack drive */}
          <g>
            {Array.from({ length: 6 }).map((_, k) => (
              <rect key={k} x={433} y={318 + k * 5} width="8" height="3" fill={k % 2 ? "#59595B" : "#A6A6A4"} opacity="0.8" />
            ))}
          </g>
        </g>

        {/* ================= DOCKING ARMS — NODE → DOCK → ARM → JOINT → MACHINE ================= */}
        {companies.map((co, i) => {
          const cy = PLATE_CY[i];
          const sy = SOCKETS_Y[i];
          const ex = ELBOW_X[i];
          const engaged = i === active;
          const path = `M216 ${cy} L${ex} ${cy} L${ex + 26} ${sy} L322 ${sy}`;
          return (
            <g key={co.id + "-arm"}>
              <path d={path} fill="none" stroke="#59595B" strokeWidth="9" strokeLinejoin="round" strokeLinecap="round" opacity="0.95" />
              <path d={path} fill="none" stroke="#222328" strokeWidth="3.4" strokeLinejoin="round" strokeLinecap="round" />
              {engaged && (
                <path d={path} fill="none" stroke="#E72241" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round"
                  className={reduced ? undefined : "channel-flow"} />
              )}
              {/* joint housings + locking clamps (engaged arm is physically clamped in) */}
              <circle cx={ex} cy={cy} r="5.4" fill="#3C3D42" stroke={engaged ? "#E72241" : "#A6A6A4"} strokeWidth="1.3" style={{ transition: "stroke .35s ease" }} />
              <circle cx={ex + 26} cy={sy} r="4.4" fill="#3C3D42" stroke={engaged ? "#E72241" : "#A6A6A4"} strokeWidth="1.2" style={{ transition: "stroke .35s ease" }} />
              {engaged && (
                <g>
                  <path d={`M${ex - 9} ${cy - 4} A9.8 9.8 0 0 1 ${ex + 4} ${cy - 8.8}`} fill="none" stroke="#E72241" strokeWidth="2" strokeLinecap="round" />
                  <path d={`M${ex + 9} ${cy + 4} A9.8 9.8 0 0 1 ${ex - 4} ${cy + 8.8}`} fill="none" stroke="#E72241" strokeWidth="2" strokeLinecap="round" />
                  <circle cx={ex - 9} cy={cy - 4} r="1.6" fill="#DDDDD8" />
                  <circle cx={ex + 9} cy={cy + 4} r="1.6" fill="#DDDDD8" />
                </g>
              )}
            </g>
          );
        })}

        {/* ================= IDENTIFICATION PLATES — all four on the LEFT ================= */}
        {companies.map((co, i) => {
          const cy = PLATE_CY[i];
          const engaged = i === active;
          const hovered = i === hoverIdx;
          return (
            <g key={co.id}
              onMouseEnter={() => onHover(i)}
              onClick={() => onPick(i)}
              className="cursor-pointer"
              style={{ transform: hovered && !engaged ? "translateX(3px)" : "translateX(0)", transition: "transform .3s cubic-bezier(.3,.8,.3,1)" }}>
              {/* manufactured plate — chamfered body, inset panel, bolts, socket */}
              <polygon
                points={`18,${cy - 42} 196,${cy - 42} 208,${cy - 30} 208,${cy + 30} 196,${cy + 42} 8,${cy + 42} 8,${cy - 32}`}
                fill={engaged ? "#3C3D42" : "#59595B"}
                stroke={engaged ? "#E72241" : hovered ? "#DDDDD8" : "#A6A6A4"}
                strokeWidth={engaged ? 2 : 1.5}
                style={{ transition: "fill .35s ease, stroke .35s ease" }} />
              {/* top machining highlight */}
              <line x1="20" y1={cy - 38} x2="194" y2={cy - 38} stroke="#A6A6A4" strokeWidth="1" opacity="0.5" />
              {/* inset panel */}
              <rect x="58" y={cy - 30} width="138" height="60" rx="2"
                fill="#222328" stroke={engaged ? "#E72241" : "#3C3D42"} strokeWidth="1.4" style={{ transition: "stroke .35s ease" }} />
              {engaged && <rect x="58" y={cy - 30} width="4" height="60" fill="#E72241" />}
              {/* engraved number */}
              <text x="16" y={cy + 12} className="f-display" fontSize="30" fill="#222328" opacity={engaged ? 1 : 0.8}>{co.num}</text>
              <text x="17" y={cy + 13} className="f-display" fontSize="30" fill="none" stroke={engaged ? "#E72241" : "#A6A6A4"} strokeWidth="0.7" opacity="0.8">{co.num}</text>
              {/* identification text — fully inside the plate, never over the machine */}
              <text x="70" y={cy - 8} className="f-tech" fontSize="14" fontWeight="700" letterSpacing="1" fill="#DDDDD8">{co.name}</text>
              <text x="70" y={cy + 8} className="f-mono" fontSize="7.5" letterSpacing="1.2" fill="#A6A6A4">{co.date}</text>
              <text x="70" y={cy + 21} className="f-tech" fontSize="8" fontWeight="700" letterSpacing="1.6" fill={engaged ? "#E72241" : "#DDDDD8"} opacity="0.9">
                {co.role.split("·")[0].trim()}
              </text>
              {/* corner bolts */}
              {[[16, cy - 34], [190, cy - 34], [16, cy + 34], [190, cy + 34]].map(([bx, by], k) => (
                <g key={k}>
                  <circle cx={bx} cy={by} r="3" fill="#222328" stroke="#A6A6A4" strokeWidth="1" />
                  <line x1={bx - 1.6} y1={by} x2={bx + 1.6} y2={by} stroke="#A6A6A4" strokeWidth="0.8" />
                </g>
              ))}
              {/* connector socket + docking pin */}
              <rect x="204" y={cy - 8} width="14" height="16" rx="2" fill="#222328" stroke="#A6A6A4" strokeWidth="1.2" />
              <circle cx="211" cy={cy} r="3" fill={engaged ? "#E72241" : "#59595B"} style={{ transition: "fill .35s ease" }} />
              {/* lock indicator */}
              {engaged && (
                <g>
                  <rect x="8" y={cy - 46} width="26" height="9" rx="1.5" fill="#E72241" />
                  <text x="12" y={cy - 39} className="f-mono" fontSize="6.5" letterSpacing="1.5" fill="#DDDDD8" fontWeight="700">{locked ? "LOCK" : "RUN"}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>

      {/* status strip */}
      <div className="absolute bottom-2.5 inset-x-4 flex items-center justify-between f-mono text-[8px] tracking-[0.24em] pointer-events-none" style={{ color: "var(--m-sub)" }}>
        <span className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 bg-[var(--crimson)] ${locked ? "" : "live-blink"}`} />
          {locked ? "CHAPTER LOCKED — CLICK AGAIN TO RELEASE" : hoverIdx !== null ? "CYCLE PAUSED — HOVER ONLY" : reduced ? "STATIC" : "AUTO INDEX · 30S"}
        </span>
        <span>NODE → DOCK → ARM → JOINT → MACHINE</span>
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

  /* 30s automatic cycle — runs only while UNLOCKED · hover pauses the exact timer */
  useEffect(() => {
    if (reduced || locked || hover) return;
    let last = performance.now();
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
  }, [locked, hover, n, reduced]);

  /* hover = subtle mechanical response only · click = lock · second click unlocks */
  const onHover = (i: number) => setHoverIdx(i);
  const onPick = (i: number) => {
    if (locked && active === i) { setLocked(false); return; }
    setActive(i);
    setLocked(true);
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
                CAREER INDEXING MACHINE — CLICK A PLATE TO LOCK
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--m-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                {locked ? "LOCKED" : hover ? "CYCLE PAUSED" : reduced ? "STATIC" : "AUTO CYCLE · 30S"}
              </span>
            </div>

            {/* twin module headings — CAREER INFO (LEFT) · CAREER NODE MAP (RIGHT) */}
            <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-x-6 gap-y-8 lg:gap-x-10 mb-5">
              <ModuleHeading tag="A" title="CAREER INFO" right="CLICK PLATE — LOCK · AGAIN — RELEASE" />
              <ModuleHeading tag="B" title="CAREER NODE MAP" right={<span style={{ color: "var(--outer-ink)" }}>{co.num} — {co.name}</span>} />
            </div>

            <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-6 lg:gap-10 lg:items-start"
              onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setHoverIdx(null); }}>

              {/* ================= CAREER INFO (LEFT) ================= */}
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
                      <span key={`${active}-${locked}`} className="block h-full bg-[var(--crimson)] origin-left"
                        style={{
                          animation: `progFill ${CYCLE_MS}ms linear both`,
                          animationPlayState: hover || locked ? "paused" : "running",
                          transform: locked ? "scaleX(1)" : undefined,
                        }} />
                    </span>
                  )}
                  <span className="flex items-center gap-2"><span className="w-3 h-[3px] bg-[var(--crimson)]" />SIGNAL</span>
                  <span className="hidden sm:flex items-center gap-2"><span className="w-2.5 h-2.5 border-[1.5px]" style={{ borderColor: "var(--m-sub)" }} />JOINT</span>
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
