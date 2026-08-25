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

/* ================= VERTICAL STEAMPUNK TRANSMISSION LAB =================
   A tall clockwork / laboratory engine that stores four career chapters.
   The four companies are detachable transmission cartridges parked on the
   LEFT. Hovering one physically wakes it — the plaque slides out, its
   telescoping connector unfolds (sleeve → shaft → joint → gear → clutch)
   and plugs into the machine. Clicking locks it as the live chapter: its
   gear spins faster and a crimson signal travels wall → manifold → core.
   The 20s cycle runs the same physical handoff. Machine inverts with theme
   via the --machine-* material set (matte black on light / off-white on dark). */

const ROWS = [95, 235, 375, 515];                       /* node / connection heights */
const NAMES = ["IMPROMP2LABS", "DNEG", "CYBEREDGE", "PSD"];
const CORE = { x: 415, y: 350 };                        /* main clock / power core */
const MANI_X = 282;                                     /* vertical manifold shaft */

function Gear({ cx, cy, r, teeth, spin, dur, fill = "var(--machine-deep)", stroke = "var(--machine-line)", hub = true }: {
  cx: number; cy: number; r: number; teeth: number; spin?: string; dur?: string;
  fill?: string; stroke?: string; hub?: boolean;
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
      {hub && <circle cx={cx} cy={cy} r={r * 0.28} fill="var(--machine-plate)" stroke={stroke} strokeWidth={1.2} />}
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
  companies: { id: string }[];
  onHover: (i: number) => void;
  onLeaveRow: () => void;
  onPick: (i: number) => void;
}) {
  const spin = (s?: string) => (reduced || !s ? undefined : s);

  return (
    <div
      className="mat-inner mat-texture relative rounded-xl border overflow-hidden"
      style={{ borderColor: "color-mix(in srgb, var(--machine-line) 55%, transparent)", aspectRatio: "560 / 640" }}
      onMouseLeave={onLeaveRow}
    >
      <svg viewBox="0 0 560 640" className="absolute inset-0 w-full h-full">
        {/* ============================================================
            THE MACHINE — tall housing, manifold, clock core, lab gear
            ============================================================ */}
        <g>
          {/* bottom legs + top input stack (break the box silhouette) */}
          <rect x="258" y="612" width="24" height="20" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
          <rect x="498" y="612" width="24" height="20" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
          <rect x="448" y="18" width="26" height="26" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
          <rect x="454" y="10" width="14" height="10" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />

          {/* outer chamfered housing */}
          <polygon
            points="225,55 245,35 525,35 545,55 545,595 525,615 245,615 225,595"
            fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="2.5"
            style={{ filter: "drop-shadow(0 12px 20px rgba(0,0,0,0.3))" }}
          />
          {/* recessed inner deck */}
          <rect x="234" y="44" width="302" height="562" rx="4" fill="var(--machine-deep)" opacity="0.9" />
          {/* frame rivets */}
          {[[238, 48], [532, 48], [238, 602], [532, 602], [238, 325], [532, 325]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r="2.6" fill="var(--machine-line)" stroke="var(--machine-inv)" strokeWidth="0.8" opacity="0.8" />
          ))}

          {/* ---------- vertical manifold shaft ---------- */}
          <rect x={MANI_X - 4} y="66" width="8" height="520" fill="var(--machine-line)" opacity="0.85" />
          <rect x={MANI_X - 1.5} y="66" width="3" height="520" fill="var(--machine-inv)" opacity="0.35" />
          <rect x={MANI_X - 10} y="58" width="20" height="12" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
          <rect x={MANI_X - 10} y="580" width="20" height="12" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />

          {/* ---------- TOP: winding crown + input gears + coil + escapement ---------- */}
          <Gear cx={415} cy={84} r={20} teeth={10} spin={spin("gear-cw")} dur="14s" fill="var(--machine-plate)" stroke="var(--machine-line)" />
          {!reduced && (
            <line x1={415} y1={84} x2={415} y2={58} stroke="var(--machine-inv)" strokeWidth={3.4} strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from={`0 415 84`} to={`360 415 84`} dur="7s" repeatCount="indefinite" />
            </line>
          )}
          <Gear cx={347} cy={132} r={22} teeth={11} spin={spin("gear-ccw")} dur="18s" />
          <Gear cx={375} cy={106} r={12} teeth={8} spin={spin("gear-cw")} dur="9s" />
          {/* electrical coil + crimson spark */}
          <g>
            <ellipse cx={503} cy={102} rx={15} ry={22} fill="none" stroke="var(--machine-line)" strokeWidth={2.4} />
            <ellipse cx={503} cy={102} rx={9} ry={15} fill="none" stroke="var(--machine-line)" strokeWidth={2} />
            <circle cx={503} cy={102} r={3.4} fill="var(--machine-crimson-hot)" className={spin("core-beat")} />
            <path d="M503 76 L497 90 L505 90 L498 106" fill="none" stroke="var(--machine-crimson-hot)" strokeWidth={1.8}
              strokeLinecap="round" strokeLinejoin="round" className={spin("spark")} />
          </g>
          {/* escapement */}
          <g transform="translate(468 200)">
            <Gear cx={0} cy={0} r={14} teeth={8} spin={spin("gear-cw")} dur="10s" fill="var(--machine-plate)" />
            <g className={spin("escapement")} style={{ transformOrigin: "0px -16px" }}>
              <path d="M-8 -20 L0 -12 L8 -20" fill="none" stroke="var(--machine-inv)" strokeWidth={2.4} strokeLinecap="round" />
            </g>
          </g>

          {/* ---------- UPPER gear cluster ---------- */}
          <Gear cx={332} cy={203} r={25} teeth={12} spin={spin("gear-cw")} dur="20s" />
          <Gear cx={366} cy={182} r={12} teeth={8} spin={spin("gear-ccw")} dur="8s" />

          {/* ---------- cable + fluid conduits (right side) ---------- */}
          <path d="M505 122 C 540 220 540 380 498 478" fill="none" stroke="var(--machine-line)" strokeWidth={2.6} opacity={0.65} />
          <path d="M475 478 L475 462 L447 452" fill="none" stroke="var(--machine-line)" strokeWidth={4.4} strokeLinecap="round" />
          <path d="M475 478 L475 462 L447 452" fill="none" stroke="var(--machine-crimson)" strokeWidth={1.6}
            strokeLinecap="round" className={spin("fluid-flow")} opacity={0.8} />

          {/* ---------- MAIN CLOCK / POWER CORE ---------- */}
          <g>
            {/* outer toothed ring */}
            {Array.from({ length: 28 }).map((_, i) => {
              const a = (i / 28) * Math.PI * 2;
              const x = CORE.x + 96 * Math.cos(a), y = CORE.y + 96 * Math.sin(a);
              return (
                <rect key={i} x={-7} y={-9} width={14} height={18}
                  transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
                  fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth={1} />
              );
            })}
            <circle cx={CORE.x} cy={CORE.y} r={88} fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth={3} />
            <circle cx={CORE.x} cy={CORE.y} r={72} fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth={1.6} />
            {/* calibration ticks */}
            {Array.from({ length: 60 }).map((_, i) => {
              const a = (i / 60) * Math.PI * 2;
              const big = i % 5 === 0;
              const r1 = big ? 60 : 64, r2 = 69;
              return (
                <line key={i}
                  x1={CORE.x + r1 * Math.cos(a)} y1={CORE.y + r1 * Math.sin(a)}
                  x2={CORE.x + r2 * Math.cos(a)} y2={CORE.y + r2 * Math.sin(a)}
                  stroke="var(--machine-inv)" strokeWidth={big ? 1.6 : 0.7} opacity={big ? 0.8 : 0.4} />
              );
            })}
            {/* roman fragments */}
            {[["XII", 0], ["III", 90], ["VI", 180], ["IX", 270]].map(([t, deg]) => {
              const a = ((deg as number) - 90) * (Math.PI / 180);
              return (
                <text key={t as string} x={CORE.x + 50 * Math.cos(a)} y={CORE.y + 50 * Math.sin(a) + 3}
                  textAnchor="middle" className="f-mono" fontSize={9} fill="var(--machine-inv)" opacity={0.75}>{t as string}</text>
              );
            })}
            {/* rotating inner ring */}
            <circle cx={CORE.x} cy={CORE.y} r={44} fill="none" stroke="var(--machine-line)" strokeWidth={1.4}
              strokeDasharray="4 8" className={spin("gear-cw")} style={{ animationDuration: "22s" }} />
            {/* hands */}
            {!reduced && (
              <g>
                <line x1={CORE.x} y1={CORE.y} x2={CORE.x} y2={CORE.y - 34} stroke="var(--machine-inv)" strokeWidth={3.2} strokeLinecap="round">
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${CORE.x} ${CORE.y}`} to={`360 ${CORE.x} ${CORE.y}`} dur="46s" repeatCount="indefinite" />
                </line>
                <line x1={CORE.x} y1={CORE.y} x2={CORE.x} y2={CORE.y - 52} stroke="var(--machine-inv)" strokeWidth={1.7} strokeLinecap="round" opacity={0.85}>
                  <animateTransform attributeName="transform" type="rotate" from={`0 ${CORE.x} ${CORE.y}`} to={`360 ${CORE.x} ${CORE.y}`} dur="12s" repeatCount="indefinite" />
                </line>
              </g>
            )}
            {/* central bearing + crimson heartbeat core */}
            <circle cx={CORE.x} cy={CORE.y} r={14} fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth={1.6} />
            <circle key={`beat-${active}`} cx={CORE.x} cy={CORE.y} r={14} fill="none" stroke="var(--machine-crimson-hot)" strokeWidth={2}
              className={reduced ? undefined : "core-engage"} />
            <circle cx={CORE.x} cy={CORE.y} r={7.5} fill="var(--machine-crimson-hot)" className={spin("core-beat")} />
            <circle cx={CORE.x} cy={CORE.y} r={2.6} fill="var(--machine-inv)" opacity={0.9} />
          </g>

          {/* manifold → core drive rod */}
          <rect x={MANI_X} y={CORE.y - 4} width={CORE.x - 92 - MANI_X} height={8} rx={2} fill="var(--machine-line)" />
          <circle cx={MANI_X + 14} cy={CORE.y} r={4.5} fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth={1.2} />

          {/* ---------- BOTTOM: pistons + gauge + reservoir + contacts ---------- */}
          {[330, 366].map((x, k) => (
            <g key={x}>
              <rect x={x - 9} y={470} width={18} height={34} rx={3} fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth={1.4} />
              <rect x={x - 3} y={500} width={6} height={16} fill="var(--machine-inv)" opacity={0.8}
                className={spin("piston")} style={{ animationDelay: `${k * 0.9}s` }} />
              <rect x={x - 7} y={514} width={14} height={6} rx={2} fill="var(--machine-line)" />
            </g>
          ))}
          {/* pressure gauge */}
          <g transform="translate(330 562)">
            <circle r={16} fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth={1.6} />
            <path d="M-10 0 A10 10 0 0 1 10 0" fill="none" stroke="var(--machine-inv)" strokeWidth={1.2} opacity={0.6} />
            <line x1={0} y1={0} x2={7} y2={-7} stroke="var(--machine-crimson-hot)" strokeWidth={1.8} strokeLinecap="round"
              className={spin("valve-wiggle")} style={{ animationDuration: "4s" }} />
            <circle r={2.2} fill="var(--machine-inv)" />
          </g>
          {/* fluid reservoir with rising bubbles */}
          <g>
            <rect x={440} y={482} width={72} height={76} rx={10} fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth={1.8} />
            <rect x={446} y={488} width={60} height={64} rx={7} fill="var(--machine-deep)" />
            <rect x={446} y={516} width={60} height={36} rx={7} fill="var(--machine-crimson)" opacity={0.32} />
            {[[458, 546, 0], [476, 550, 1], [492, 544, 2]].map(([bx, by, k]) => (
              <circle key={k as number} cx={bx as number} cy={by as number} r={2.6} fill="var(--machine-inv)" opacity={0.5}
                className={spin("bubble")} style={{ animationDelay: `${(k as number) * 0.9}s` }} />
            ))}
            <rect x={468} y={476} width={16} height={8} rx={2} fill="var(--machine-line)" />
          </g>
          {/* electrical contacts + rotating disc */}
          <g transform="translate(415 580)">
            <Gear cx={0} cy={0} r={13} teeth={8} spin={spin("gear-cw-fast")} fill="var(--machine-plate)" />
            <circle cx={-20} cy={0} r={3} fill="var(--machine-crimson-hot)" className={spin("spark")} />
            <circle cx={20} cy={0} r={3} fill="var(--machine-crimson-hot)" className={spin("spark")} style={{ animationDelay: "1.2s" }} />
            <path d="M-20 0 L-8 -6 M20 0 L8 6" stroke="var(--machine-crimson-hot)" strokeWidth={1.4} className={spin("spark")} style={{ animationDelay: "0.6s" }} />
          </g>
        </g>

        {/* ============================================================
            FOUR CAREER CARTRIDGES + TELESCOPING CONNECTORS (LEFT)
            ============================================================ */}
        {companies.map((co, i) => {
          const cy = ROWS[i];
          const isActive = i === active;
          const isHover = i === hoverIdx;
          const extended = isActive || isHover;
          const wallStroke = isActive ? "var(--machine-crimson-hot)" : isHover ? "var(--machine-inv)" : "var(--machine-line)";
          const nameFill = isActive || isHover ? "var(--machine-crimson-hot)" : "var(--machine-inv)";
          const ease = "cubic-bezier(.3,.85,.3,1)";

          return (
            <g key={co.id}>
              {/* wall receptacle / clutch housing on the machine */}
              <rect x={220} y={cy - 12} width={18} height={24} rx={2}
                fill="var(--machine-plate)" stroke={isActive ? "var(--machine-crimson-hot)" : "var(--machine-line)"}
                strokeWidth={isActive ? 2 : 1.4} style={{ transition: "stroke .35s ease" }} />
              <rect x={225} y={cy - 4} width={8} height={8} rx={1}
                fill={isActive ? "var(--machine-crimson-hot)" : "var(--machine-deep)"} style={{ transition: "fill .35s ease" }} />

              {/* feed junction gear on the manifold */}
              <Gear cx={MANI_X} cy={cy} r={13} teeth={8}
                spin={spin(extended ? "gear-cw-fast" : "gear-cw")} dur={extended ? "4s" : "16s"}
                fill={isActive ? "var(--machine-plate)" : "var(--machine-deep)"}
                stroke={isActive ? "var(--machine-crimson-hot)" : "var(--machine-line)"} />
              {/* conduit wall → manifold */}
              <line x1={238} y1={cy} x2={MANI_X - 13} y2={cy} stroke="var(--machine-line)" strokeWidth={4.6} strokeLinecap="round" />
              {isActive && !reduced && (
                <line x1={238} y1={cy} x2={MANI_X - 13} y2={cy} stroke="var(--machine-crimson-hot)" strokeWidth={1.8}
                  strokeLinecap="round" className="channel-flow" />
              )}
              {/* crimson signal bead travelling wall → manifold → core */}
              {isActive && !reduced && (
                <circle r={3.6} fill="var(--machine-crimson-hot)">
                  <animateMotion dur="1.7s" repeatCount="indefinite"
                    path={`M 238 ${cy} L ${MANI_X} ${cy} L ${MANI_X} ${CORE.y} L ${CORE.x - 92} ${CORE.y}`} />
                </circle>
              )}

              {/* ------- the cartridge (slides outward when extended) ------- */}
              <g
                onMouseEnter={() => onHover(i)}
                onClick={() => onPick(i)}
                className="cursor-pointer"
                style={{
                  transform: `translateX(${extended ? 18 : 0}px)`,
                  transition: reduced ? "none" : `transform .55s ${ease}`,
                }}
              >
                {/* telescoping connector: shaft, then joint + gear + clutch (staggered follow-through) */}
                <rect x={158} y={cy - 3} width={44} height={6} rx={2} fill="var(--machine-line)"
                  style={{
                    transform: `translateX(${extended ? 0 : -42}px)`,
                    opacity: extended ? 1 : 0.45,
                    transition: reduced ? "none" : `transform .6s ${ease} .08s, opacity .4s ease .08s`,
                  }} />
                <g style={{
                  transform: `translateX(${extended ? 0 : -54}px)`,
                  opacity: extended ? 1 : 0.35,
                  transition: reduced ? "none" : `transform .6s ${ease} .16s, opacity .4s ease .16s`,
                }}>
                  <circle cx={206} cy={cy} r={5} fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth={1.2} />
                  <Gear cx={222} cy={cy} r={10} teeth={8}
                    spin={spin(extended ? (isActive ? "gear-cw-fast" : "gear-cw") : undefined)} dur={isActive ? "3s" : "8s"}
                    fill={isActive ? "var(--machine-crimson-hot)" : "var(--machine-deep)"}
                    stroke={isActive ? "var(--machine-crimson-hot)" : "var(--machine-line)"} hub={false} />
                  <rect x={229} y={cy - 4} width={7} height={8} rx={1}
                    fill={isActive ? "var(--machine-crimson-hot)" : "var(--machine-line)"} />
                </g>

                {/* chamfered cartridge plaque */}
                <polygon
                  points={`20,${cy - 27} 132,${cy - 27} 148,${cy - 11} 148,${cy + 11} 132,${cy + 27} 20,${cy + 27} 12,${cy + 19} 12,${cy - 19}`}
                  fill="var(--machine-plate)" stroke={wallStroke} strokeWidth={isActive ? 2.2 : 1.5}
                  style={{ transition: "stroke .35s ease" }} />
                {/* recessed nameplate band */}
                <rect x={44} y={cy - 16} width={96} height={32} rx={2} fill="var(--machine-deep)" opacity={0.92} />
                {/* corner fasteners */}
                {[[20, cy - 21], [20, cy + 21], [128, cy - 21], [128, cy + 21]].map(([sx, sy], k) => (
                  <g key={k}>
                    <circle cx={sx} cy={sy} r={2} fill="var(--machine-line)" />
                    <line x1={sx - 1.3} y1={sy} x2={sx + 1.3} y2={sy} stroke="var(--machine-plate)" strokeWidth={0.8} />
                  </g>
                ))}
                {/* idle gear — the cartridge's own breathing mechanism */}
                <Gear cx={28} cy={cy} r={10} teeth={7} spin={spin("gear-cw")} dur={`${12 + i * 4}s`}
                  fill="var(--machine-deep)" stroke={isActive ? "var(--machine-crimson-hot)" : "var(--machine-line)"} />
                {/* index */}
                <text x={143} y={cy - 17} textAnchor="end" className="f-mono" fontSize={7.5} letterSpacing={1.4}
                  fill="var(--machine-line)">{String(i + 1).padStart(2, "0")}</text>
                {/* company name — the visual identity of the node */}
                <text x={50} y={cy + 4.5} className="f-tech" fontWeight={700}
                  fontSize={isActive || isHover ? 12 : 11} letterSpacing={isActive || isHover ? 1.6 : 1.1}
                  fill={nameFill} style={{ transition: "fill .3s ease" }}>
                  {NAMES[i]}
                </text>
                {/* socket sleeve on the right edge */}
                <rect x={146} y={cy - 6} width={16} height={12} rx={2} fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth={1.2} />
                <circle cx={154} cy={cy} r={2.4} fill={isActive ? "var(--machine-crimson-hot)" : "var(--machine-line)"}
                  style={{ transition: "fill .3s ease" }} />
                {/* engaged lock tab */}
                {isActive && (
                  <g>
                    <rect x={12} y={cy - 37} width={30} height={9} rx={1.5} fill="var(--machine-crimson-hot)" />
                    <text x={16} y={cy - 30} className="f-mono" fontSize={6.5} letterSpacing={1.4} fontWeight={700} fill="#DDDDD8">
                      {locked ? "LOCK" : "RUN"}
                    </text>
                  </g>
                )}
              </g>
            </g>
          );
        })}
      </svg>

      {/* status strip */}
      <div className="absolute bottom-2.5 inset-x-4 flex items-center justify-between f-mono text-[8px] tracking-[0.24em] pointer-events-none"
        style={{ color: "var(--machine-line)" }}>
        <span className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 ${locked ? "" : "live-blink"}`} style={{ background: "var(--machine-crimson-hot)" }} />
          {locked ? "CHAPTER LOCKED — CLICK AGAIN TO RELEASE" : hoverIdx !== null ? "SEQUENCE PAUSED — HOVER ONLY" : reduced ? "STATIC" : "AUTO SEQUENCE · 20S"}
        </span>
        <span className="hidden sm:inline">CARTRIDGE → CLUTCH → MANIFOLD → CORE</span>
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
     ~450ms into the clutch engagement, then the whole machine settles. */
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
                CLOCKWORK CAREER ENGINE — CLICK A MODULE TO LOCK
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--m-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                {locked ? "LOCKED" : hover ? "SEQUENCE PAUSED" : reduced ? "STATIC" : "AUTO SEQUENCE · 20S"}
              </span>
            </div>

            {/* twin module headings — CAREER INFO (LEFT) · CAREER NODE MAP (RIGHT) */}
            <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-x-6 gap-y-8 lg:gap-x-10 mb-5">
              <ModuleHeading tag="A" title="CAREER INFO" right="CLICK MODULE — LOCK · AGAIN — RELEASE" />
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
                  <span className="hidden sm:flex items-center gap-2"><span className="w-2.5 h-2.5 border-[1.5px]" style={{ borderColor: "var(--m-sub)" }} />CLUTCH</span>
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
