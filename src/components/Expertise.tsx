import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { MediaSlot, Reveal, SectionHead } from "./ui";

const CYCLE_MS = 20000;

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

/* ================= KINETIC CAREER ARCHIVE =================
   A tall kinetic installation: four suspended company nameplates hung from an
   open overhead framework, each on its own cable → pulley → counterweight rig.
   A central clockwork spine keeps the archive in continuous subtle motion.
   Hovering a plate makes the mechanism pull it forward — cable taut, pulley
   spins up, counterweight drops, name flares crimson — while the other three
   settle back. Clicking locks it; the 20s cycle runs the same physical handoff.
   Materials invert with the theme via the --machine-* set. */

/* per-company rigging geometry + unique movement trajectories */
const UNITS = [
  { x: 128, y: 190, off: 26,  act: [8, 6],   ret: [-6, -4] },  /* IMPROMP2LABS — upper-left  */
  { x: 432, y: 168, off: -26, act: [-8, -5], ret: [6, -4]  },  /* DNEG         — upper-right */
  { x: 162, y: 398, off: 26,  act: [9, -4],  ret: [-7, 5]  },  /* CYBEREDGE    — lower-left  */
  { x: 410, y: 420, off: -26, act: [-8, -7], ret: [6, 5]   },  /* PSD          — lower-right */
];
const PULLEY_Y = 74;
const PLATE_W = 164;
const PLATE_H = 54;

function Gear({ cx, cy, r, teeth, spin, dur, fill = "var(--machine-deep)", stroke = "var(--machine-line)" }: {
  cx: number; cy: number; r: number; teeth: number; spin?: string; dur?: string; fill?: string; stroke?: string;
}) {
  return (
    <g className={spin} style={spin && dur ? { animationDuration: dur } : undefined}>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        return (
          <rect key={i} x={-r * 0.16} y={-r * 0.2} width={r * 0.32} height={r * 0.4}
            transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
            fill={fill} stroke={stroke} strokeWidth={1} />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.82} fill={fill} stroke={stroke} strokeWidth={1.4} />
      <circle cx={cx} cy={cy} r={r * 0.3} fill="var(--machine-plate)" stroke={stroke} strokeWidth={1.1} />
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
  companies: { id: string; name: string }[];
  onHover: (i: number) => void;
  onLeaveRow: () => void;
  onPick: (i: number) => void;
}) {
  /* one clear active state: hover previews, otherwise the locked/cycled chapter */
  const featured = hoverIdx !== null ? hoverIdx : active;
  const spin = (s?: string) => (reduced || !s ? undefined : s);
  /* draw the featured plate last so it sits above its neighbours */
  const order = UNITS.map((_, i) => i).sort((a, b) => (a === featured ? 1 : 0) - (b === featured ? 1 : 0));

  return (
    <div className="relative" style={{ aspectRatio: "560 / 640" }} onMouseLeave={onLeaveRow}>
      <svg viewBox="0 0 560 640" className="absolute inset-0 w-full h-full">
        {/* ================= OPEN FRAMEWORK (no enclosing box) ================= */}
        {/* top gantry beam */}
        <rect x="44" y="52" width="472" height="10" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
        <line x1="44" y1="66" x2="516" y2="66" stroke="var(--machine-line)" strokeWidth="1" opacity="0.5" />
        {/* side rails */}
        <line x1="44" y1="62" x2="44" y2="556" stroke="var(--machine-line)" strokeWidth="2.4" />
        <line x1="516" y1="62" x2="516" y2="556" stroke="var(--machine-line)" strokeWidth="2.4" />
        {/* base rail + feet */}
        <rect x="40" y="552" width="480" height="8" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
        <rect x="52" y="560" width="18" height="14" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
        <rect x="490" y="560" width="18" height="14" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
        {/* cross braces */}
        <line x1="44" y1="470" x2="128" y2="552" stroke="var(--machine-line)" strokeWidth="1" opacity="0.35" />
        <line x1="516" y1="470" x2="432" y2="552" stroke="var(--machine-line)" strokeWidth="1" opacity="0.35" />
        <line x1="44" y1="120" x2="110" y2="62" stroke="var(--machine-line)" strokeWidth="1" opacity="0.35" />
        <line x1="516" y1="120" x2="450" y2="62" stroke="var(--machine-line)" strokeWidth="1" opacity="0.35" />

        {/* ================= CENTRAL CLOCKWORK SPINE ================= */}
        <line x1="280" y1="70" x2="280" y2="545" stroke="var(--machine-line)" strokeWidth="2" opacity="0.7" />
        {/* rotating disc */}
        <g className={spin("gear-cw")} style={{ animationDuration: "22s" }}>
          <circle cx="280" cy="104" r="18" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
          {[0, 90, 180, 270].map((d) => (
            <line key={d} x1="280" y1="88" x2="280" y2="120" stroke="var(--machine-line)" strokeWidth="1.2" transform={`rotate(${d} 280 104)`} />
          ))}
          <circle cx="280" cy="104" r="4" fill="var(--machine-line)" />
        </g>
        {/* gear train */}
        <Gear cx={280} cy={250} r={52} teeth={14} spin={spin("gear-cw")} dur="42s" />
        <Gear cx={338} cy={206} r={22} teeth={9} spin={spin("gear-ccw")} dur="18s" />
        <Gear cx={226} cy={300} r={17} teeth={8} spin={spin("gear-cw")} dur="12s" />
        {/* bearings */}
        {[150, 356, 430].map((by) => (
          <circle key={by} cx="280" cy={by} r="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
        ))}
        {/* pendulum / escapement — continuous mechanical heartbeat */}
        <g className={spin("ka-pendulum")} style={{ transformOrigin: "280px 462px" }}>
          <line x1="280" y1="462" x2="280" y2="524" stroke="var(--machine-line)" strokeWidth="2" />
          <circle cx="280" cy="528" r="9" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
          <circle cx="280" cy="528" r="3" fill="var(--machine-crimson-hot)" />
        </g>
        <circle cx="280" cy="462" r="5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />

        {/* ================= SUSPENDED COMPANY NAMEPLATES ================= */}
        {order.map((i) => {
          const u = UNITS[i];
          const co = companies[i];
          const label = co.name === "PREMA SAI DESIGNERS" ? "PSD" : co.name;
          const isFeat = i === featured;
          const [tx, ty] = isFeat ? u.act : u.ret;
          const px = u.x, py = u.y;
          const pulX = px + u.off;
          const cwX = px + 2 * u.off;
          const plateTop = py - PLATE_H / 2;

          return (
            <g key={co.id}>
              {/* counterweight guide rod + top bracket */}
              <line x1={cwX} y1="66" x2={cwX} y2="520" stroke="var(--machine-line)" strokeWidth="1" opacity="0.5" />
              <rect x={cwX - 4} y="62" width="8" height="6" rx="1" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
              {/* hanger from gantry to pulley */}
              <line x1={pulX} y1="58" x2={pulX} y2={PULLEY_Y - 12} stroke="var(--machine-line)" strokeWidth="2" />

              {/* moving assembly — cable + counterweight + plate translate together */}
              <g
                onMouseEnter={() => onHover(i)}
                onClick={() => onPick(i)}
                className="cursor-pointer"
                style={{
                  transform: `translate(${tx}px, ${ty}px)`,
                  opacity: isFeat ? 1 : 0.6,
                  transition: reduced ? "none" : "transform .75s cubic-bezier(.22,.9,.32,1.12), opacity .5s ease",
                }}
              >
                {/* suspension cable: pulley → plate bracket */}
                <line x1={pulX} y1={PULLEY_Y - 4} x2={px} y2={plateTop + 6} stroke="var(--machine-line)" strokeWidth="1.6" />
                {isFeat && !reduced && (
                  <line x1={pulX} y1={PULLEY_Y - 4} x2={px} y2={plateTop + 6} stroke="var(--machine-crimson-hot)" strokeWidth="1.6" opacity="0.9" />
                )}
                {/* counterweight cable: pulley → weight (ends inside the block so the
                    weight can drop/bob without visually detaching) */}
                <line x1={pulX} y1={PULLEY_Y - 4} x2={cwX} y2={py + 10} stroke="var(--machine-line)" strokeWidth="1.4" />
                {/* counterweight — drops further when its plate is featured */}
                <g style={{ transform: isFeat ? "translateY(16px)" : "translateY(0)", transition: reduced ? "none" : "transform .7s cubic-bezier(.3,.8,.3,1.15)" }}>
                  <g className={spin("ka-cw")} style={{ animationDelay: `${i * 0.9}s` }}>
                    <rect x={cwX - 6} y={py - 8} width="12" height="26" rx="2" fill="var(--machine-deep)"
                      stroke={isFeat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth="1.4" style={{ transition: "stroke .4s ease" }} />
                    <line x1={cwX - 6} y1={py + 2} x2={cwX + 6} y2={py + 2} stroke="var(--machine-line)" strokeWidth="1" />
                  </g>
                </g>

                {/* nameplate — gentle suspension sway + featured scale */}
                <g className={spin("ka-sway")} style={{ animationDelay: `${i * 0.7}s` }}>
                  <g style={{
                    transform: isFeat ? "scale(1.06)" : "scale(1)",
                    transformOrigin: `${px}px ${py}px`,
                    transformBox: "view-box",
                    transition: reduced ? "none" : "transform .6s cubic-bezier(.3,.8,.3,1.1)",
                  }}>
                    {/* depth shadow */}
                    <rect x={px - PLATE_W / 2 + 4} y={py - PLATE_H / 2 + 5} width={PLATE_W} height={PLATE_H} rx="6" fill="var(--machine-deep)" opacity="0.5" />
                    {/* mounting bracket (covers cable end) */}
                    <rect x={px - 16} y={plateTop - 10} width="32" height="20" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                    <circle cx={px} cy={plateTop - 2} r="3" fill="var(--machine-line)" />
                    {/* plate frame */}
                    <rect x={px - PLATE_W / 2} y={py - PLATE_H / 2} width={PLATE_W} height={PLATE_H} rx="6"
                      fill="var(--machine-plate)" stroke={isFeat ? "var(--machine-crimson-hot)" : "var(--machine-line)"}
                      strokeWidth={isFeat ? 2 : 1.4} style={{ transition: "stroke .4s ease" }} />
                    {/* inset line */}
                    <rect x={px - PLATE_W / 2 + 6} y={py - PLATE_H / 2 + 6} width={PLATE_W - 12} height={PLATE_H - 12} rx="4"
                      fill="none" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.45" />
                    {/* corner screws */}
                    {([[px - PLATE_W / 2 + 9, py - PLATE_H / 2 + 9], [px + PLATE_W / 2 - 9, py - PLATE_H / 2 + 9],
                       [px - PLATE_W / 2 + 9, py + PLATE_H / 2 - 9], [px + PLATE_W / 2 - 9, py + PLATE_H / 2 - 9]] as const).map(([sx, sy], k) => (
                      <circle key={k} cx={sx} cy={sy} r="2.2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.9" />
                    ))}
                    {/* company name — the primary hover signal */}
                    <text x={px} y={py + 6} textAnchor="middle" className="f-display" fontSize="18.5" letterSpacing="0.05em"
                      fill={isFeat ? "var(--machine-crimson-hot)" : "var(--machine-inv)"} style={{ transition: "fill .4s ease" }}>
                      {label}
                    </text>
                  </g>
                </g>

                {/* crimson signal pulse travelling down the cable when featured */}
                {isFeat && !reduced && (
                  <circle r="3.2" fill="var(--machine-crimson-hot)">
                    <animateMotion dur="1.5s" repeatCount="indefinite" path={`M ${pulX} ${PULLEY_Y - 4} L ${px} ${plateTop + 6}`} />
                  </circle>
                )}
              </g>

              {/* pulley wheel — anchored to the gantry, spins faster when featured */}
              <g className={spin("gear-cw")} style={{ animationDuration: isFeat ? "2.6s" : "13s", animationDelay: `${i * 0.4}s` }}>
                <circle cx={pulX} cy={PULLEY_Y} r="13" fill="var(--machine-deep)"
                  stroke={isFeat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth="2" style={{ transition: "stroke .4s ease" }} />
                <circle cx={pulX} cy={PULLEY_Y} r="9" fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.6" />
                {[0, 120, 240].map((d) => (
                  <line key={d} x1={pulX} y1={PULLEY_Y - 9} x2={pulX} y2={PULLEY_Y + 9} stroke="var(--machine-line)" strokeWidth="1.2"
                    transform={`rotate(${d} ${pulX} ${PULLEY_Y})`} />
                ))}
                <circle cx={pulX} cy={PULLEY_Y} r="3" fill={isFeat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} style={{ transition: "fill .4s ease" }} />
              </g>
            </g>
          );
        })}
      </svg>
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

  /* 20s automatic sequence — runs only while UNLOCKED · hover pauses the exact timer */
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

  /* hover = mechanical preview only · click = lock · second click unlocks */
  const onHover = (i: number) => setHoverIdx(i);
  const onPick = (i: number) => {
    if (locked && active === i) { setLocked(false); return; }
    setActive(i);
    setLocked(true);
  };

  /* ONE system: the mechanical handoff begins FIRST — the dossier swaps
     ~450ms into the pull, then the whole archive settles. */
  const [shownIdx, setShownIdx] = useState(active);
  useEffect(() => {
    if (shownIdx === active) return;
    const t = window.setTimeout(() => setShownIdx(active), reduced ? 0 : 450);
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
                KINETIC CAREER ARCHIVE — CLICK A PLATE TO LOCK
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--m-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                {locked ? "LOCKED" : hover ? "SEQUENCE PAUSED" : reduced ? "STATIC" : "AUTO SEQUENCE · 20S"}
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
                  <span className="hidden sm:flex items-center gap-2"><span className="w-2.5 h-2.5 border-[1.5px]" style={{ borderColor: "var(--m-sub)" }} />PULLEY</span>
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
