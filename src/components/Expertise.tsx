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

/* ================= MECHANICAL CAREER TRANSMISSION =================
   Four company input modules on the LEFT (name + index ONLY). Each one
   connects NODE → SOCKET → ARM → JOINT → CLUTCH → TRANSMISSION into one
   large vertical machine on the right: drive gears, rotating shaft,
   flywheel with locking teeth, crank pistons, clutch chambers, rails.
   Hover = preview (active mechanism begins releasing) · click = lock ·
   second click = unlock · the 30s cycle uses the same mechanical handoff. */

const PLATE_CY = [62, 168, 274, 380];
const SHAFT_X = 430;
const FW_Y = 240;

function MiniGear({ cx, cy, r, teeth, spin, hot }: { cx: number; cy: number; r: number; teeth: number; spin: string; hot?: boolean }) {
  const edge = hot ? "#E72241" : "var(--mh)";
  return (
    <g className={spin}>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        return (
          <rect key={i} x={-r * 0.14} y={-r * 0.17} width={r * 0.28} height={r * 0.34}
            transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
            fill="var(--ml)" stroke={edge} strokeWidth="1" style={{ transition: "stroke .35s ease" }} />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.9} fill="var(--md)" stroke={edge} strokeWidth="1.4" style={{ transition: "stroke .35s ease" }} />
      <circle cx={cx} cy={cy} r={r * 0.34} fill="var(--mb)" stroke={edge} strokeWidth="1" style={{ transition: "stroke .35s ease" }} />
      <circle cx={cx} cy={cy} r={r * 0.1} fill={hot ? "#E72241" : "var(--ml)"} style={{ transition: "fill .35s ease" }} />
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
  const releasing = hoverIdx !== null && hoverIdx !== active;
  return (
    <div className="map-scope relative border rounded-xl mat-texture corner-bracket overflow-hidden"
      style={{ borderColor: "var(--m-line)", backgroundColor: "color-mix(in srgb, var(--outer-ink) 5%, transparent)", aspectRatio: "560 / 470" }}
      onMouseLeave={onLeaveRow}>

      <svg viewBox="0 0 560 470" className="absolute inset-0 w-full h-full">
        {/* shop-floor depth strata */}
        <rect x="0" y="0" width="560" height="470" fill="var(--outer-ink)" opacity="0.03" />
        <line x1="0" y1="452" x2="560" y2="452" stroke="var(--m-line)" strokeWidth="1" />

        {/* ================= VERTICAL TRANSMISSION — one large machine (RIGHT / CENTER) ================= */}
        <g>
          {/* machined chassis plate — seams + rivets */}
          <rect x="318" y="44" width="224" height="396" rx="6" fill="var(--mb)" stroke="var(--ml)" strokeWidth="2.2" />
          <rect x="326" y="52" width="208" height="380" rx="4" fill="none" stroke="var(--md)" strokeWidth="1.2" />
          <line x1="326" y1="132" x2="534" y2="132" stroke="var(--md)" strokeWidth="1.4" />
          <line x1="326" y1="348" x2="534" y2="348" stroke="var(--md)" strokeWidth="1.4" />
          {[[330, 56], [530, 56], [330, 428], [530, 428], [330, 240], [530, 240]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r="2.6" fill="var(--ml)" stroke="var(--mh)" strokeWidth="0.9" />
          ))}

          {/* mechanical rails with hatched guides */}
          <rect x="512" y="60" width="5" height="364" fill="var(--md)" />
          <rect x="521" y="60" width="2.5" height="364" fill="var(--ml)" opacity="0.7" />
          {Array.from({ length: 16 }).map((_, k) => (
            <line key={k} x1="512" y1={70 + k * 23} x2="523.5" y2={70 + k * 23} stroke="var(--mh)" strokeWidth="0.8" opacity="0.5" />
          ))}

          {/* rotating vertical shaft + bearings */}
          <rect x={SHAFT_X - 4} y="56" width="8" height="372" fill="var(--md)" stroke="var(--ml)" strokeWidth="1" />
          {!reduced && (
            <line x1={SHAFT_X} y1="58" x2={SHAFT_X} y2="426" stroke="var(--mh)" strokeWidth="1.6" strokeDasharray="5 9" opacity="0.5" className="channel-flow" />
          )}
          <rect x={SHAFT_X - 13} y="48" width="26" height="12" rx="2" fill="var(--ml)" stroke="var(--mh)" strokeWidth="1.1" />
          <rect x={SHAFT_X - 13} y="424" width="26" height="12" rx="2" fill="var(--ml)" stroke="var(--mh)" strokeWidth="1.1" />

          {/* primary drive gear train (top) */}
          <MiniGear cx={SHAFT_X} cy={96} r={30} teeth={11} spin={reduced ? "" : "gear-cw"} />
          <MiniGear cx={SHAFT_X + 52} cy={122} r={18} teeth={8} spin={reduced ? "" : "gear-ccw"} />
          <MiniGear cx={SHAFT_X - 50} cy={120} r={15} teeth={7} spin={reduced ? "" : "gear-ccw"} />

          {/* large central flywheel — rim, locking teeth, rotating spokes, hub */}
          <circle cx={SHAFT_X} cy={FW_Y} r="80" fill="var(--md)" stroke="var(--mh)" strokeWidth="5" />
          <circle cx={SHAFT_X} cy={FW_Y} r="64" fill="none" stroke="var(--mb)" strokeWidth="2" />
          <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "26s" }}>
            {Array.from({ length: 24 }).map((_, k) => {
              const a = (k / 24) * Math.PI * 2;
              return (
                <rect key={k} x="-3" y="-84" width="6" height="10"
                  transform={`translate(${SHAFT_X} ${FW_Y}) rotate(${(a * 180) / Math.PI})`}
                  fill="var(--ml)" stroke="var(--mh)" strokeWidth="0.8" />
              );
            })}
            {Array.from({ length: 6 }).map((_, k) => {
              const a = (k / 6) * Math.PI * 2;
              return (
                <line key={k} x1={SHAFT_X + 14 * Math.cos(a)} y1={FW_Y + 14 * Math.sin(a)}
                  x2={SHAFT_X + 60 * Math.cos(a)} y2={FW_Y + 60 * Math.sin(a)}
                  stroke="var(--ml)" strokeWidth="6" strokeLinecap="round" />
              );
            })}
            {Array.from({ length: 8 }).map((_, k) => {
              const a = (k / 8) * Math.PI * 2;
              return <circle key={k} cx={SHAFT_X + 70 * Math.cos(a)} cy={FW_Y + 70 * Math.sin(a)} r="2.8" fill="var(--mb)" stroke="var(--mh)" strokeWidth="1" />;
            })}
          </g>
          <circle cx={SHAFT_X} cy={FW_Y} r="16" fill="var(--mb)" stroke="var(--mh)" strokeWidth="2" />
          <circle cx={SHAFT_X} cy={FW_Y} r="6" fill="#E72241" style={{ transition: "fill .4s ease" }} />
          <circle cx={SHAFT_X} cy={FW_Y} r="26" fill="none" stroke="#E72241" strokeWidth="1.4" strokeDasharray="4 7"
            className={reduced ? undefined : "gear-ccw"} style={{ animationDuration: "14s", opacity: 0.5 }} />

          {/* crank wheels + pumping pistons (lower zone) */}
          {[{ x: 358, d: "4s" }, { x: 500, d: "5.2s" }].map((p) => (
            <g key={p.x}>
              <line x1={p.x} y1="322" x2={p.x} y2="340" stroke="var(--ml)" strokeWidth="3" />
              <circle cx={p.x} cy="322" r="15" fill="var(--mb)" stroke="var(--mh)" strokeWidth="1.6" />
              <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: p.d, transformOrigin: `${p.x}px 322px` }}>
                <line x1={p.x} y1="322" x2={p.x} y2="310" stroke="var(--mh)" strokeWidth="2.4" />
                <circle cx={p.x} cy="310" r="2.6" fill="#E72241" opacity="0.85" />
              </g>
              <rect x={p.x - 9} y="338" width="18" height="34" rx="3" fill="var(--md)" stroke="var(--mh)" strokeWidth="1.3" />
              <rect x={p.x - 3} y="336" width="6" height="20" fill="var(--mh)" className={reduced ? undefined : "piston"} style={{ animationDuration: p.d }} />
              <rect x={p.x - 6.5} y="370" width="13" height="5" rx="2" fill="var(--ml)" stroke="var(--mh)" strokeWidth="0.9" />
            </g>
          ))}

          {/* rack + pinion + pressure valve */}
          <rect x="346" y="398" width="98" height="11" rx="2" fill="var(--md)" stroke="var(--ml)" strokeWidth="1.1" />
          {Array.from({ length: 9 }).map((_, k) => (
            <line key={k} x1={352 + k * 11} y1="400" x2={352 + k * 11} y2="407" stroke="var(--mb)" strokeWidth="2" />
          ))}
          <MiniGear cx={368} cy={392} r={13} teeth={7} spin={reduced ? "" : "gear-cw-fast"} />
          <circle cx="494" cy="400" r="15" fill="var(--mb)" stroke="var(--mh)" strokeWidth="1.5" />
          <path d="M483 400 a11 11 0 0 1 22 0" fill="none" stroke="var(--ml)" strokeWidth="1.1" />
          <line x1="494" y1="400" x2="502" y2="391" stroke="#E72241" strokeWidth="2" strokeLinecap="round"
            className={reduced ? undefined : "valve-wiggle"} style={{ transformOrigin: "494px 400px", animationDuration: "4.5s" }} />
          <circle cx="494" cy="400" r="2.2" fill="var(--mh)" />

          {/* restrained cyberpunk signal rail */}
          <line x1="529" y1="64" x2="529" y2="420" stroke="var(--ml)" strokeWidth="1" />
          {PLATE_CY.map((y) => (
            <rect key={y} x="525" y={y - 3} width="8" height="6" fill="var(--md)" stroke="var(--ml)" strokeWidth="0.8" />
          ))}
          {!reduced && (
            <line x1="529" y1="64" x2="529" y2="420" stroke="#E72241" strokeWidth="1.6" className="packet" opacity="0.45" />
          )}
        </g>
        {/* ================= CLUTCH CHAMBERS + CONNECTORS — one per company =================
            NODE → SOCKET → ARM → JOINT → CLUTCH → TRANSMISSION.
            Engage = dog teeth slide in, conduit lights, crimson signal travels
            chamber → shaft → flywheel hub. Handoff is a 0.9s mechanical move. */}
        {companies.map((co, i) => {
          const sy = PLATE_CY[i];
          const engaged = i === active;
          const hovered = i === hoverIdx;
          /* hover = preview only: dog teeth creep part-way in, signal ghosts,
             output gear spins up — nothing locks until a click */
          const dogShift = engaged ? (releasing ? 7 : 14) : hovered ? 6 : 0;
          const sigOpacity = engaged ? (releasing ? 0.4 : 1) : hovered ? 0.3 : 0;
          const armPath = `M210 ${sy} L318 ${sy}`;
          return (
            <g key={co.id + "-link"}>
              {/* articulated arm with joint housings */}
              <g style={{ transform: hovered && !engaged ? "translateX(3px)" : "none", transition: "transform .45s cubic-bezier(.3,.8,.3,1)" }}>
                <path d={armPath} fill="none" stroke="var(--ml)" strokeWidth="8" strokeLinecap="round" opacity="0.95" />
                <path d={armPath} fill="none" stroke="var(--mb)" strokeWidth="3" strokeLinecap="round" />
                {!reduced && (
                  <path d={armPath} fill="none" stroke="#E72241" strokeWidth="2" strokeLinecap="round" className="channel-flow"
                    style={{ opacity: sigOpacity, transition: "opacity .7s ease" }} />
                )}
                <circle cx="252" cy={sy} r="5.2" fill="var(--md)" stroke={engaged ? "#E72241" : "var(--mh)"} strokeWidth="1.3" style={{ transition: "stroke .4s ease" }} />
                <circle cx="292" cy={sy} r="4.2" fill="var(--md)" stroke={engaged ? "#E72241" : "var(--mh)"} strokeWidth="1.2" style={{ transition: "stroke .4s ease" }} />
              </g>
              {/* clutch chamber on the machine face */}
              <rect x="318" y={sy - 16} width="38" height="32" rx="3" fill="var(--md)" stroke={engaged ? "#E72241" : "var(--ml)"}
                strokeWidth={engaged ? 2 : 1.4} style={{ transition: "stroke .5s ease" }} />
              {/* sliding dog teeth — the locking mechanism */}
              <g style={{ transform: `translateX(${dogShift}px)`, transition: "transform .9s cubic-bezier(.3,.7,.25,1)" }}>
                <rect x="344" y={sy - 9} width="16" height="18" fill="var(--ml)" stroke="var(--mh)" strokeWidth="1" />
                {[0, 1, 2].map((k) => (
                  <rect key={k} x="360" y={sy - 8 + k * 6.4} width="6" height="4"
                    fill={engaged ? "#E72241" : "var(--mh)"} style={{ transition: "fill .5s ease" }} />
                ))}
              </g>
              {/* chamber lever — wiggles while its chapter transmits */}
              <g className={engaged && !reduced ? "valve-wiggle" : undefined} style={{ transformOrigin: `330px ${sy}px`, animationDuration: "1.4s" }}>
                <line x1="330" y1={sy} x2="330" y2={sy - 12} stroke={engaged ? "#E72241" : "var(--mh)"} strokeWidth="2.2" strokeLinecap="round"
                  style={{ transition: "stroke .4s ease" }} />
                <circle cx="330" cy={sy - 13} r="2.6" fill={engaged ? "#E72241" : "var(--ml)"} style={{ transition: "fill .4s ease" }} />
              </g>
              {/* output gear meshes the chamber into the shaft — spins up on hover, full drive when engaged */}
              <MiniGear cx={384} cy={sy} r={13} teeth={7} hot={engaged} spin={reduced ? "" : engaged || hovered ? "gear-cw-fast" : "gear-cw"} />
              <line x1="397" y1={sy} x2={SHAFT_X - 4} y2={sy} stroke={engaged ? "#E72241" : "var(--ml)"} strokeWidth="2" style={{ transition: "stroke .5s ease" }} />
              {/* crimson mechanical signal — chamber → shaft → flywheel hub */}
              {engaged && !reduced && (
                <path d={`M397 ${sy} L${SHAFT_X} ${sy} L${SHAFT_X} ${FW_Y}`} fill="none" stroke="#E72241" strokeWidth="2.2"
                  className="channel-flow" style={{ opacity: sigOpacity, transition: "opacity .7s ease" }} />
              )}
            </g>
          );
        })}


        {/* ================= INPUT MODULES — all four on the LEFT (name + index ONLY) ================= */}
        {companies.map((co, i) => {
          const cy = PLATE_CY[i];
          const engaged = i === active;
          const hovered = i === hoverIdx;
          return (
            <g key={co.id}
              onMouseEnter={() => onHover(i)}
              onClick={() => onPick(i)}
              className="cursor-pointer"
              style={{ transform: hovered && !engaged ? "translateX(3px)" : "translateX(0)", transition: "transform .35s cubic-bezier(.3,.8,.3,1)" }}>
              {/* machined module — chamfered body, engraved index, bolts, socket */}
              <polygon
                points={`14,${cy - 28} 188,${cy - 28} 200,${cy - 16} 200,${cy + 16} 188,${cy + 28} 6,${cy + 28} 6,${cy - 20}`}
                fill={engaged ? "var(--ma)" : "var(--mp)"}
                stroke={engaged ? "#E72241" : hovered ? "var(--mt)" : "var(--mh)"}
                strokeWidth={engaged ? 2 : 1.4}
                style={{ transition: "fill .4s ease, stroke .4s ease" }} />
              <line x1="16" y1={cy - 24} x2="186" y2={cy - 24} stroke="var(--mh)" strokeWidth="0.9" opacity="0.45" />
              {/* engraved index */}
              <text x="16" y={cy + 10} className="f-display" fontSize="24" fill="var(--mb)" opacity="0.9">{co.num}</text>
              <text x="17" y={cy + 11} className="f-display" fontSize="24" fill="none" stroke={engaged ? "#E72241" : "var(--mt)"} strokeWidth="0.6" opacity="0.75">{co.num}</text>
              {/* company name — its own clean text area, never over the machine */}
              <text x="52" y={cy + 5} className="f-tech" fontSize="13" fontWeight="700" letterSpacing="1.2"
                fill={engaged ? "#E72241" : "var(--mt)"} style={{ transition: "fill .35s ease" }}>{co.name}</text>
              {/* corner bolts */}
              {[[14, cy - 21], [189, cy - 21], [14, cy + 21], [189, cy + 21]].map(([bx, by], k) => (
                <g key={k}>
                  <circle cx={bx} cy={by} r="2.8" fill="var(--mb)" stroke="var(--mh)" strokeWidth="0.9" />
                  <line x1={bx - 1.5} y1={by} x2={bx + 1.5} y2={by} stroke="var(--mh)" strokeWidth="0.7" />
                </g>
              ))}
              {/* socket stub + docking pin */}
              <rect x="198" y={cy - 7} width="12" height="14" rx="2" fill="var(--mb)" stroke="var(--mh)" strokeWidth="1.1" />
              <circle cx="204" cy={cy} r="2.6" fill={engaged ? "#E72241" : "var(--ml)"} style={{ transition: "fill .35s ease" }} />
              {/* lock indicator */}
              {engaged && (
                <g>
                  <rect x="6" y={cy - 38} width="30" height="9" rx="1.5" fill="#E72241" />
                  <text x="10" y={cy - 31} className="f-mono" fontSize="6.5" letterSpacing="1.4" fill="#DDDDD8" fontWeight="700">{locked ? "LOCK" : "RUN"}</text>
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

  /* ONE system: the mechanical handoff begins FIRST — the dossier swaps
     ~350ms into the clutch engagement, then the whole machine settles. */
  const [shownIdx, setShownIdx] = useState(active);
  useEffect(() => {
    if (shownIdx === active) return;
    const t = window.setTimeout(() => setShownIdx(active), reduced ? 0 : 350);
    return () => clearTimeout(t);
  }, [active, shownIdx, reduced]);

  const co = companies[shownIdx];

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
                MECHANICAL CAREER TRANSMISSION — CLICK A MODULE TO LOCK
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
