import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

const CYCLE_MS = 20000;

function Description({ text }: { text: string }) {
  const parts = text.split(/\[\s*(.*?)\s*\]/g);
  return (
    <p className="text-[14px] sm:text-[15px] leading-relaxed">
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
        <span className="w-2.5 h-2.5 bg-[var(--crim-panel)] shrink-0" />
        {title}
      </h3>
      <span className="f-mono text-[9px] sm:text-[10px] tracking-[0.2em] flex items-center gap-2 min-w-0 truncate" style={{ color: "var(--m-sub)" }}>
        <span className="text-[var(--crim-panel)]">{tag}</span>
        {right}
      </span>
    </div>
  );
}

/* ================= VERTICAL CLOCKWORK TRANSMISSION =================
   A watchmaker's transmission engine: the four career chapters plug into a
   tall mechanical assembly through clutch couplings. Energy cascades
   gear → lever → crank → piston → shaft → clock. A geared pointer on a fixed
   central pivot telescopes out to the engaged chapter and retracts home.   */

const PLATE_CY = [110, 240, 370, 500];
const SHAFT_X = 400;            /* primary vertical drive shaft */
const PIVOT = { x: 400, y: 320 }; /* big intermediate gear = pointer pivot */
const CONN_X = 292;             /* company connector / clutch face */

function Gear({ cx, cy, r, teeth, spin, dur, fill = "var(--machine-deep)", stroke = "var(--machine-line)", hub = true }: {
  cx: number; cy: number; r: number; teeth: number; spin?: string; dur?: string; fill?: string; stroke?: string; hub?: boolean;
}) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className={spin} style={spin && dur ? { animationDuration: dur } : undefined}>
        {Array.from({ length: teeth }).map((_, i) => {
          const a = (i / teeth) * Math.PI * 2;
          return (
            <rect key={i} x={-r * 0.15} y={-r * 0.21} width={r * 0.3} height={r * 0.42} rx={r * 0.05}
              transform={`translate(${r * Math.cos(a)} ${r * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
              fill={fill} stroke={stroke} strokeWidth={1} />
          );
        })}
        <circle r={r * 0.84} fill={fill} stroke={stroke} strokeWidth={1.5} />
        <path d={`M${-r * 0.6} ${-r * 0.42} A${r * 0.74} ${r * 0.74} 0 0 1 ${r * 0.1} ${-r * 0.72}`}
          fill="none" stroke="var(--machine-inv)" strokeWidth={1.1} opacity={0.22} strokeLinecap="round" />
        {hub && (
          <>
            <circle r={r * 0.3} fill="var(--machine-plate)" stroke={stroke} strokeWidth={1.1} />
            <circle r={r * 0.1} fill={stroke} />
          </>
        )}
      </g>
    </g>
  );
}

function Shadow({ cx, cy, rx, ry = 5 }: { cx: number; cy: number; rx: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity="0.22" />;
}

/* hex bracket — structural variety (not everything is a circle) */
function Hex({ cx, cy, r, fill, stroke }: { cx: number; cy: number; r: number; fill: string; stroke: string }) {
  const pts = Array.from({ length: 6 }).map((_, i) => {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="1.2" />;
}

function NodeMap({
  active, hoverIdx, locked, reduced, theme, companies, onHover, onLeaveRow, onPick,
}: {
  active: number;
  hoverIdx: number | null;
  locked: boolean;
  reduced: boolean;
  theme: "light" | "dark";
  companies: { id: string; name: string }[];
  onHover: (i: number) => void;
  onLeaveRow: () => void;
  onPick: (i: number) => void;
}) {
  const featured = hoverIdx !== null ? hoverIdx : active;
  const spin = (s?: string) => (reduced || !s ? undefined : s);
  const engaged = featured !== null;

  /* ---- theme rebuild: the machine stops, dismantles, re-inverts, reassembles ---- */
  const [rebuilding, setRebuilding] = useState(false);
  const prevTheme = useRef(theme);
  useEffect(() => {
    if (prevTheme.current !== theme) {
      prevTheme.current = theme;
      if (!reduced) {
        setRebuilding(true);
        const t = window.setTimeout(() => setRebuilding(false), 1560);
        return () => clearTimeout(t);
      }
    }
  }, [theme, reduced]);

  /* ---- the geared pointer: fixed central pivot → hub gear → linkage → telescoping tip ---- */
  const handG = useRef<SVGGElement>(null);
  const foreG = useRef<SVGGElement>(null);
  const pgMain = useRef<SVGGElement>(null);
  const pgSmall = useRef<SVGGElement>(null);
  const pgSec = useRef<SVGGElement>(null);
  const featRef = useRef(featured);
  const st = useRef({ ang: -90, angV: 0, len: 78, lenV: 0, mainRot: 0, smallRot: 0, secRot: 0, last: 0, raf: 0 });

  const targetFor = (f: number | null) => {
    if (f === null) return { ang: -90, len: 78 };
    const cy = PLATE_CY[f];
    const dx = CONN_X - PIVOT.x, dy = cy - PIVOT.y;
    return { ang: (Math.atan2(dy, dx) * 180) / Math.PI + 90, len: Math.hypot(dx, dy) + 16 };
  };

  useEffect(() => { featRef.current = featured; }, [featured]);

  useEffect(() => {
    if (reduced) {
      const t = targetFor(featured);
      handG.current?.setAttribute("transform", `rotate(${t.ang} ${PIVOT.x} ${PIVOT.y})`);
      foreG.current?.setAttribute("transform", `translate(0 ${(-(t.len - 64)).toFixed(1)})`);
      return;
    }
    const loop = (now: number) => {
      const s = st.current;
      const dt = Math.min(0.045, s.last ? (now - s.last) / 1000 : 0.016);
      s.last = now;
      const t = targetFor(featRef.current);
      /* weighted springs — mechanical weight, slight overshoot, settle */
      const dA = ((t.ang - s.ang + 180) % 360 + 360) % 360 - 180;
      s.angV += (dA * 46 - s.angV * 10.5) * dt;
      s.ang += s.angV * dt;
      s.lenV += ((t.len - s.len) * 70 - s.lenV * 12) * dt;
      s.len += s.lenV * dt;
      /* gears participate — spin with angular + telescoping velocity */
      const speed = 24 + Math.min(420, Math.abs(s.angV) * 2.2) + Math.abs(s.lenV) * 1.4 + (featRef.current !== null ? 46 : 0);
      s.mainRot += speed * dt;
      s.smallRot -= speed * 2.4 * dt;
      s.secRot -= speed * 1.7 * dt;
      handG.current?.setAttribute("transform", `rotate(${s.ang.toFixed(2)} ${PIVOT.x} ${PIVOT.y})`);
      foreG.current?.setAttribute("transform", `translate(0 ${(-(Math.max(64, s.len) - 64)).toFixed(1)})`);
      pgMain.current?.setAttribute("transform", `rotate(${(s.mainRot % 360).toFixed(1)})`);
      pgSmall.current?.setAttribute("transform", `translate(30 -13) rotate(${(s.smallRot % 360).toFixed(1)})`);
      pgSec.current?.setAttribute("transform", `translate(-33 20) rotate(${(s.secRot % 360).toFixed(1)})`);
      s.raf = requestAnimationFrame(loop);
    };
    st.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.current.raf);
  }, [reduced, featured]);


  return (
    <div className={`mech-stage relative ${rebuilding ? "mech-rebuild" : ""}`} style={{ aspectRatio: "560 / 640" }} onMouseLeave={onLeaveRow}>
      <svg viewBox="0 0 560 640" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`}>
        <defs>
          <pattern id="mcGrain" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" stroke="#000" strokeWidth="0.7" opacity="0.14" />
          </pattern>
        </defs>

        {/* ================= BACK — dark structural frame, rails, cavities ================= */}
        <g className="rb-a">
          <rect x="244" y="28" width="306" height="584" rx="8" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
          <rect x="244" y="28" width="306" height="584" rx="8" fill="url(#mcGrain)" opacity="0.5" />
          {/* shadowed inner cavity */}
          <rect x="258" y="42" width="278" height="556" rx="6" fill="rgba(0,0,0,0.32)" />
          {/* heavy vertical support beams */}
          <rect x="258" y="42" width="16" height="556" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />
          <rect x="520" y="42" width="16" height="556" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />
          {/* recessed horizontal rails */}
          {[150, 320, 490].map((ry) => (
            <g key={ry}>
              <rect x="274" y={ry - 4} width="246" height="8" rx="2" fill="rgba(0,0,0,0.28)" />
              <line x1="274" y1={ry + 4} x2="520" y2={ry + 4} stroke="var(--machine-inv)" strokeWidth="0.7" opacity="0.14" />
            </g>
          ))}
          {/* bolts along beams */}
          {[60, 200, 340, 480, 580].map((by) => (
            <g key={by}>
              <circle cx="266" cy={by} r="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
              <circle cx="528" cy={by} r="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
            </g>
          ))}
          {/* shadowed cavities behind the big gear + clock */}
          <ellipse cx={PIVOT.x} cy={PIVOT.y} rx="66" ry="66" fill="rgba(0,0,0,0.3)" />
          <ellipse cx={SHAFT_X} cy="540" rx="56" ry="52" fill="rgba(0,0,0,0.3)" />
        </g>

        {/* ================= MID — the transmission ================= */}
        <g className="rb-c">
          {/* PRIMARY VERTICAL DRIVE SHAFT (cylindrical — shaded edge) */}
          <rect x={SHAFT_X - 6} y="54" width="12" height="486" rx="3" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
          <line x1={SHAFT_X - 3} y1="58" x2={SHAFT_X - 3} y2="536" stroke="var(--machine-inv)" strokeWidth="1.2" opacity="0.28" />
          {engaged && !reduced && (
            <line x1={SHAFT_X} y1="60" x2={SHAFT_X} y2="536" stroke="var(--crimson)" strokeWidth="1.6" opacity="0.45" className="shaft-flow" />
          )}
          {/* shaft collars / bearings at each input + ends */}
          {[60, ...PLATE_CY, 530].map((by) => (
            <g key={by}>
              <rect x={SHAFT_X - 11} y={by - 8} width="22" height="16" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <circle cx={SHAFT_X - 7} cy={by} r="1.4" fill="var(--machine-inv)" opacity="0.5" />
              <circle cx={SHAFT_X + 7} cy={by} r="1.4" fill="var(--machine-inv)" opacity="0.5" />
            </g>
          ))}

          {/* input coupling gears on the shaft (one per company — spins fast when engaged) */}
          {PLATE_CY.map((cy, i) => {
            const on = i === featured;
            return (
              <g key={cy}>
                <Gear cx={SHAFT_X} cy={cy - 26} r={13} teeth={9}
                  spin={spin(on ? "gear-cw-fast" : "gear-cw")} dur={on ? "2.4s" : "14s"}
                  fill={on ? "var(--machine-line)" : "var(--machine-deep)"} stroke={on ? "var(--crimson)" : "var(--machine-line)"} />
              </g>
            );
          })}

          {/* SECONDARY DRIVE RAIL — toothed rack + sliding coupler (right) */}
          <g>
            <rect x="498" y="180" width="8" height="270" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
            {Array.from({ length: 18 }).map((_, i) => (
              <rect key={i} x="506" y={186 + i * 15} width="5" height="8" fill="var(--machine-line)" />
            ))}
            <g className={spin("piston")} style={{ animationDuration: "4.6s" }}>
              <rect x="492" y="290" width="20" height="30" rx="3" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <Gear cx={502} cy={305} r={8} teeth={7} spin={spin("gear-ccw")} dur="3s" fill="var(--machine-line)" hub={false} />
            </g>
          </g>

          {/* UPPER DRIVE — flywheel + crank + escapement + balance wheel */}
          <g>
            <Shadow cx={SHAFT_X} cy={104} rx={30} ry={4} />
            <Gear cx={SHAFT_X} cy={84} r={26} teeth={14} spin={spin("gear-ccw")} dur="16s" fill="var(--machine-line)" />
            {/* escapement: escape wheel + rocking anchor */}
            <g className={spin("gear-cw")} style={{ animationDuration: "6s" }}>
              {Array.from({ length: 12 }).map((_, i) => {
                const a = (i / 12) * Math.PI * 2;
                const x = 448 + 12 * Math.cos(a), y = 70 + 12 * Math.sin(a);
                return <path key={i} d={`M${x} ${y} l3 -3 l-1 5 z`} fill="var(--machine-line)" />;
              })}
              <circle cx="448" cy="70" r="9" fill="none" stroke="var(--machine-line)" strokeWidth="1.4" />
            </g>
            <g className={spin("escapement")} style={{ transformOrigin: "448px 56px", transformBox: "view-box" }}>
              <path d="M440 60 L448 48 L456 60" fill="none" stroke="var(--machine-inv)" strokeWidth="2" strokeLinecap="round" />
            </g>
            {/* balance wheel — the machine's heartbeat */}
            <g className={spin("balance")} style={{ transformOrigin: "486px 96px", transformBox: "view-box" }}>
              <circle cx="486" cy="96" r="14" fill="none" stroke="var(--machine-line)" strokeWidth="2.4" />
              <line x1="474" y1="96" x2="498" y2="96" stroke="var(--machine-line)" strokeWidth="1.6" />
              <circle cx="486" cy="96" r="3" fill={engaged ? "var(--crimson)" : "var(--machine-line)"} style={{ transition: "fill .4s ease" }} />
            </g>
            {/* hex bracket holding the upper assembly */}
            <Hex cx={SHAFT_X} cy={118} r={9} fill="var(--machine-plate)" stroke="var(--machine-line)" />
          </g>

          {/* piston + connecting rod (rod top hides behind the big gear) */}
          <g className={spin("piston")} style={{ animationDuration: engaged ? "1.5s" : "2.8s" }}>
            <rect x={SHAFT_X - 4} y="352" width="8" height="92" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
            <rect x={SHAFT_X - 13} y="436" width="26" height="18" rx="3" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.3" />
          </g>
          {/* pressure cylinder housing the piston */}
          <rect x={SHAFT_X - 16} y="446" width="32" height="64" rx="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
          <line x1={SHAFT_X - 12} y1="452" x2={SHAFT_X - 12} y2="504" stroke="var(--machine-line)" strokeWidth="1" opacity="0.6" />
          <line x1={SHAFT_X + 12} y1="452" x2={SHAFT_X + 12} y2="504" stroke="var(--machine-line)" strokeWidth="1" opacity="0.6" />

          {/* big intermediate gear at the pivot (with crank pin + counterweight) */}
          <Shadow cx={PIVOT.x} cy={PIVOT.y + 60} rx={54} ry={6} />
          <g>
            <Gear cx={PIVOT.x} cy={PIVOT.y} r={54} teeth={20} spin={spin("gear-cw")} dur={engaged ? "12s" : "22s"} fill="var(--machine-line)" />
            {/* crank pin (rotates with gear visually implied) + counterweight */}
            <g className={spin("gear-cw")} style={{ animationDuration: engaged ? "12s" : "22s" }}>
              <circle cx={PIVOT.x + 36} cy={PIVOT.y} r="5" fill={engaged ? "var(--crimson)" : "var(--machine-plate)"} stroke="var(--machine-deep)" strokeWidth="1.2" style={{ transition: "fill .4s ease" }} />
              <rect x={PIVOT.x - 42} y={PIVOT.y - 7} width="16" height="14" rx="3" fill="var(--machine-plate)" stroke="var(--machine-deep)" strokeWidth="1" />
            </g>
          </g>
          {/* satellite gear train off the big gear (opposite direction) */}
          <Gear cx={462} cy={272} r={19} teeth={11} spin={spin("gear-ccw")} dur="7s" fill="var(--machine-line)" />
          <Gear cx={474} cy={300} r={11} teeth={8} spin={spin("gear-cw")} dur="4s" fill="var(--machine-deep)" hub={false} />

          {/* pressure gauge near the pivot */}
          <g>
            <circle cx="348" cy="262" r="13" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
            {[-50, -25, 0, 25, 50].map((a) => (
              <line key={a} x1="348" y1="251" x2="348" y2="254" stroke="var(--machine-inv)" strokeWidth="0.8" opacity="0.6" transform={`rotate(${a} 348 262)`} />
            ))}
            <g className={spin("valve-wiggle")} style={{ transformOrigin: "348px 262px", animationDuration: engaged ? "1.6s" : "3.4s" }}>
              <line x1="348" y1="264" x2="348" y2="253" stroke="var(--crimson)" strokeWidth="1.4" strokeLinecap="round" />
            </g>
            <circle cx="348" cy="262" r="1.8" fill="var(--machine-line)" />
          </g>

          {/* LOWER CLOCK MECHANISM — the transmission's visual endpoint */}
          <g>
            <Shadow cx={SHAFT_X} cy={560 + 44} rx={50} ry={6} />
            {/* reduction gear feeding the clock */}
            <Gear cx={444} cy={474} r={14} teeth={10} spin={spin("gear-ccw")} dur="5s" fill="var(--machine-line)" />
            <Gear cx={SHAFT_X} cy={560} r={46} teeth={18} spin={spin("gear-cw")} dur={engaged ? "26s" : "44s"} fill="var(--machine-line)" />
            <circle cx={SHAFT_X} cy={560} r={34} fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.6" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={i} x1={SHAFT_X} y1="530" x2={SHAFT_X} y2={i % 6 === 0 ? "536" : "533"}
                stroke="var(--machine-line)" strokeWidth={i % 6 === 0 ? 1.4 : 0.8}
                transform={`rotate(${i * 15} ${SHAFT_X} 560)`} opacity="0.85" />
            ))}
            <text x={SHAFT_X} y="541" textAnchor="middle" className="f-mono" fontSize="7" fill="var(--machine-inv)" opacity="0.85">XII</text>
            <text x={SHAFT_X + 22} y="563" textAnchor="middle" className="f-mono" fontSize="7" fill="var(--machine-inv)" opacity="0.85">III</text>
            <text x={SHAFT_X} y="585" textAnchor="middle" className="f-mono" fontSize="7" fill="var(--machine-inv)" opacity="0.85">VI</text>
            <text x={SHAFT_X - 22} y="563" textAnchor="middle" className="f-mono" fontSize="7" fill="var(--machine-inv)" opacity="0.85">IX</text>
            <g className={spin("gear-cw")} style={{ animationDuration: "90s" }}>
              <line x1={SHAFT_X} y1="560" x2={SHAFT_X} y2="536" stroke="var(--machine-inv)" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
            </g>
            <g className={spin("gear-cw")} style={{ animationDuration: "24s" }}>
              <line x1={SHAFT_X} y1="560" x2={SHAFT_X} y2="544" stroke="var(--machine-line)" strokeWidth="1.6" strokeLinecap="round" />
            </g>
            <circle cx={SHAFT_X} cy={560} r="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
          </g>

          {/* counterweight + pulley (lower right) */}
          <g>
            <line x1="502" y1="520" x2="502" y2="592" stroke="var(--machine-line)" strokeWidth="1.4" />
            <g className={spin("gear-cw")} style={{ animationDuration: "10s" }}>
              <circle cx="502" cy="514" r="13" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="2" />
              {[0, 90, 180, 270].map((d) => (
                <line key={d} x1="502" y1="503" x2="502" y2="525" stroke="var(--machine-line)" strokeWidth="1.2" transform={`rotate(${d} 502 514)`} />
              ))}
            </g>
            <g className={spin("piston")} style={{ animationDuration: "3.8s" }}>
              <rect x="494" y="592" width="16" height="26" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <line x1="494" y1="601" x2="510" y2="601" stroke="var(--machine-line)" strokeWidth="1" />
            </g>
          </g>
        </g>

        {/* ================= FRONT — company modules, clutches, connectors ================= */}
        <g className="rb-d">
          {companies.map((co, i) => {
            const cy = PLATE_CY[i];
            const label = co.name === "PREMA SAI DESIGNERS" ? "PSD" : co.name;
            const isFeat = i === featured;
            const isLock = i === active && locked;
            const plateFill = isFeat ? "var(--machine-inv)" : "var(--machine-plate)";
            const plateText = isFeat ? "var(--machine-plate)" : "var(--machine-inv)";
            const plateStroke = isFeat ? "var(--crimson)" : "var(--machine-line)";
            const ext = isFeat ? 1 : 0;

            return (
              <g key={co.id} onMouseEnter={() => onHover(i)} onClick={() => onPick(i)} className="cursor-pointer">
                {/* energy path: connector → clutch → shaft → big gear → clock (only for featured) */}
                {isFeat && !reduced && (
                  <>
                    <line x1="182" y1={cy} x2={CONN_X + 8} y2={cy} stroke="var(--crimson)" strokeWidth="1.8" className="channel-flow" opacity="0.9" />
                    <line x1={SHAFT_X} y1={cy} x2={SHAFT_X} y2="556" stroke="var(--crimson)" strokeWidth="1.6" className="channel-flow" opacity="0.55" />
                    <circle r="3.2" fill="var(--crimson)">
                      <animateMotion dur="1.5s" repeatCount="indefinite" path={`M182 ${cy} L${CONN_X + 8} ${cy} L${SHAFT_X} ${cy} L${SHAFT_X} 556 L${SHAFT_X - 40} 556`} />
                    </circle>
                  </>
                )}

                {/* recessed clutch chamber in the machine wall */}
                <rect x="278" y={cy - 18} width="27" height="36" rx="3" fill="rgba(0,0,0,0.28)" />
                <rect x="278" y={cy - 18} width="27" height="36" rx="3" fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.8" />

                {/* hinge bracket + idle tick lever */}
                <rect x="168" y={cy - 12} width="12" height="24" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                <circle cx="174" cy={cy} r="3" fill={isFeat ? "var(--crimson)" : "var(--machine-line)"} stroke="var(--machine-line)" strokeWidth="1" style={{ transition: "fill .35s ease" }} />
                {!isFeat && !reduced && (
                  <g className="valve-wiggle" style={{ transformOrigin: `166px ${cy + 22}px`, animationDuration: `${4.2 + i * 1.3}s`, animationDelay: `${i * 0.7}s` }}>
                    <line x1="166" y1={cy + 22} x2="166" y2={cy + 32} stroke="var(--machine-line)" strokeWidth="1.6" strokeLinecap="round" />
                    <circle cx="166" cy={cy + 32} r="1.8" fill="var(--machine-line)" />
                  </g>
                )}

                {/* articulated connector: rod → joint → drive gear → clutch */}
                <g style={{ transform: `translateX(${ext * 10}px)`, transition: reduced ? "none" : "transform .6s cubic-bezier(.32,1.16,.42,1) .08s" }}>
                  <rect x="180" y={cy - 4.5} width="46" height="9" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                  <rect x="222" y={cy - 3} width={26 + ext * 14} height="6" rx="2" fill={isFeat ? "var(--crimson)" : "var(--machine-line)"}
                    style={{ transition: reduced ? "none" : "width .6s cubic-bezier(.32,1.16,.42,1) .12s, fill .35s ease" }} />
                  <circle cx="252" cy={cy} r="5.5" fill="var(--machine-deep)" stroke={isFeat ? "var(--crimson)" : "var(--machine-line)"} strokeWidth="1.3" style={{ transition: "stroke .35s ease" }} />
                  <circle cx="252" cy={cy} r="1.8" fill="var(--machine-inv)" opacity="0.7" />
                </g>
                <g style={{ transform: `translateX(${ext * 12}px)`, transition: reduced ? "none" : "transform .55s cubic-bezier(.32,1.16,.42,1) .16s" }}>
                  <Gear cx={268} cy={cy} r={13} teeth={8} spin={spin("gear-cw")} dur={isFeat ? "2.2s" : "12s"}
                    fill={isFeat ? "var(--machine-line)" : "var(--machine-deep)"} stroke={isFeat ? "var(--crimson)" : "var(--machine-line)"} />
                </g>
                {/* dog clutch — moving plate closes on the machine-side plate, teeth interlock, lock pin drops */}
                <g style={{ transform: `translateX(${ext * 12}px)`, transition: reduced ? "none" : "transform .5s cubic-bezier(.3,.9,.3,1.1) .26s" }}>
                  {/* fixed machine-side plate with teeth */}
                  <rect x="296" y={cy - 13} width="8" height="26" rx="1.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
                  {[0, 1, 2].map((k) => (
                    <rect key={k} x="292" y={cy - 9 + k * 7} width="4.5" height="4.4" rx="1" fill="var(--machine-line)" />
                  ))}
                  {/* moving plate with meshing teeth */}
                  <g style={{ transform: `translateX(${ext * 6}px)`, transition: reduced ? "none" : `transform .45s cubic-bezier(.3,.9,.3,1.1) ${0.3}s` }}>
                    <rect x="281" y={cy - 13} width="9" height="26" rx="1.5" fill={isFeat ? "var(--crimson)" : "var(--machine-deep)"} stroke="var(--machine-line)" strokeWidth="1" style={{ transition: "fill .35s ease" }} />
                    {[0, 1, 2].map((k) => (
                      <rect key={k} x="289.5" y={cy - 9 + k * 7} width="4.5" height="4.4" rx="1" fill={isFeat ? "var(--crimson)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }} />
                    ))}
                  </g>
                  {/* lock pin drops once engaged */}
                  <rect x="286" y={cy - 24 + (isFeat ? 8 : 0)} width="3" height="10" rx="1.5"
                    fill={isFeat ? "var(--crimson)" : "var(--machine-line)"}
                    style={{ transition: reduced ? "none" : "transform .35s cubic-bezier(.34,1.4,.5,1) .5s, fill .35s ease", transform: `translateY(${isFeat ? 0 : -6}px)` }} />
                </g>

                {/* machined nameplate — company name is the primary content */}
                <g className={spin("plate-breathe")} style={{ animationDelay: `${i * 0.8}s` }}>
                  <Shadow cx={90} cy={cy + 42} rx={70} ry={5} />
                  <rect x="12" y={cy - 36} width="156" height="72" rx="6"
                    fill={plateFill} stroke={plateStroke} strokeWidth={isFeat ? 2 : 1.3}
                    style={{ transition: "fill .4s ease, stroke .4s ease" }} />
                  <rect x="20" y={cy - 28} width="140" height="56" rx="4" fill="none" stroke="var(--machine-line)" strokeWidth="0.9" opacity="0.6" />
                  {[[22, cy - 26], [158, cy - 26], [22, cy + 26], [158, cy + 26]].map(([bx, by], k) => (
                    <g key={k}>
                      <circle cx={bx} cy={by} r="2.6" fill={isFeat ? "var(--machine-plate)" : "var(--machine-deep)"} stroke="var(--machine-line)" strokeWidth="0.9" />
                      <line x1={bx - 1.4} y1={by} x2={bx + 1.4} y2={by} stroke="var(--machine-line)" strokeWidth="0.7" />
                    </g>
                  ))}
                  <text x="32" y={cy - 12} className="f-mono" fontSize="8.5" letterSpacing="1.6" fontWeight="600"
                    fill={isFeat ? "var(--crimson)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }}>
                    {String(i + 1).padStart(2, "0")}
                  </text>
                  <text x="32" y={cy + 12} className="f-tech" fontSize={label.length > 9 ? 14.5 : 17} fontWeight="600" letterSpacing="1.1"
                    fill={plateText} style={{ transition: "fill .35s ease" }}>
                    {label}
                  </text>
                  <circle cx="150" cy={cy - 14} r="2.6" fill={isFeat ? "var(--crimson)" : "var(--machine-line)"}
                    className={isFeat && !reduced ? "live-blink" : undefined} style={{ transition: "fill .35s ease" }} />
                  {isLock && (
                    <g>
                      <rect x="12" y={cy - 44} width="34" height="10" rx="2" fill="var(--crimson)" />
                      <text x="17" y={cy - 36.5} className="f-mono" fontSize="6.5" letterSpacing="1.4" fontWeight="700" fill="#DDDDD8">LOCK</text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
          {/* front frame rails the arms pass beneath */}
          <rect x="246" y="34" width="8" height="572" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
          <rect x="544" y="34" width="8" height="572" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
        </g>

        {/* ================= FOREGROUND — the geared pointer ================= */}
        <g className="rb-e">
          <g ref={handG} transform={`rotate(-90 ${PIVOT.x} ${PIVOT.y})`}>
            <g transform={`translate(${PIVOT.x} ${PIVOT.y})`}>
              {/* telescoping forearm + clock-hand tip (slides through the sleeve) */}
              <g ref={foreG} transform="translate(0 0)">
                <rect x="-4" y="-32" width="8" height="60" rx="2" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="1.2" />
                <line x1="-1.4" y1="-28" x2="-1.4" y2="24" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.4" />
                {/* gear segments riding the forearm */}
                <circle cx="0" cy="-8" r="6" fill="none" stroke="var(--machine-line)" strokeWidth="1.2" />
                <circle cx="0" cy="8" r="4.5" fill="none" stroke="var(--machine-line)" strokeWidth="1" />
                {/* pointer tip — machined clock hand */}
                <polygon points="0,-50 8,-28 4.5,-24 -4.5,-24 -8,-28" fill="var(--crimson)" stroke="var(--machine-line)" strokeWidth="1.2" />
                <polygon points="0,-44 4,-28 -4,-28" fill="var(--machine-inv)" opacity="0.85" />
              </g>
              {/* counterweight behind the pivot */}
              <rect x="-8" y="22" width="16" height="22" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <circle cx="0" cy="48" r="7" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1.2" />
              {/* sleeve / upper arm */}
              <rect x="-6.5" y="-52" width="13" height="56" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
              <rect x="-9.5" y="-54" width="19" height="9" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
              <circle cx="0" cy="-42" r="5" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <circle cx="0" cy="-42" r="1.5" fill="var(--crimson)" />
              {/* hub gear train — spins with the pointer's motion */}
              <g ref={pgSec} transform="translate(-33 20)">
                <Gear cx={0} cy={0} r={17} teeth={10} fill="var(--machine-deep)" />
              </g>
              <g ref={pgSmall} transform="translate(30 -13)">
                <Gear cx={0} cy={0} r={11} teeth={8} fill="var(--machine-deep)" hub={false} />
              </g>
              <g ref={pgMain} transform="rotate(0)">
                <Gear cx={0} cy={0} r={30} teeth={15} fill="var(--machine-plate)" />
              </g>
              {/* fixed central pivot */}
              <circle r="8" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
              <circle r="2.8" fill="var(--crimson)" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export default function Expertise() {
  const { data, theme } = useStore();
  const { statement, statementAccent, supporting, companies } = data.expertise;
  const reduced = useReducedMotion();
  const n = companies.length;
  const [active, setActive] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [hover, setHover] = useState(false);
  const [locked, setLocked] = useState(false);
  const [mediaView, setMediaView] = useState<number | null>(null);
  const elapsedRef = useRef(0);

  /* 20s automatic cascade — runs only while UNLOCKED · hover pauses the exact timer */
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

  /* hover = mechanical preview · Career Info follows the hovered company */
  const onHover = (i: number) => {
    setHoverIdx(i);
    setActive(i);
  };
  /* click = lock · click the active company again = release */
  const onPick = (i: number) => {
    if (locked && active === i) { setLocked(false); return; }
    setActive(i);
    setLocked(true);
  };

  /* the mechanical handoff begins FIRST — the dossier swaps ~450ms into it */
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
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--crim-panel)" }} />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--crim-panel)" }} />

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-8">
              <span className="w-3 h-9 bg-[var(--crim-panel)]" />
              <h3 className="f-display text-[clamp(1.7rem,3.4vw,2.8rem)] leading-none tracking-wide" style={{ color: "var(--outer-ink)" }}>
                MY JOURNEY
              </h3>
              <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>
                VERTICAL CLOCKWORK TRANSMISSION — CLICK A MODULE TO LOCK
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--m-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                {locked ? "LOCKED" : hover ? "SEQUENCE PAUSED" : reduced ? "STATIC" : "AUTO CASCADE · 20S"}
              </span>
            </div>

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
                      <h4 className="f-display text-[clamp(1.5rem,2.4vw,2.2rem)] mt-1.5 leading-tight">{co.name}</h4>
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

                  {/* large media tiles — exact counts 3 / 3 / 2 / 1 · click opens fullscreen */}
                  <div className="min-h-0">
                    <div className="flex items-center justify-between mb-3">
                      <span className="f-mono text-[9px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>MEDIA — {String(co.media.length).padStart(2, "0")} SLOTS</span>
                      <span className="f-mono text-[9px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>{co.name}</span>
                    </div>
                    <div key={`media-${co.id}`} className="dossier-swap grid grid-cols-3 gap-3 sm:gap-4 content-start">
                      {co.media.map((m, mi) => (
                        <MediaSlot key={m.id} item={m} ratio="1/1" className="mat-page-card" onClick={() => setMediaView(mi)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= CAREER NODE MAP (RIGHT) ================= */}
              <div className="min-h-0 flex flex-col order-2">
                <NodeMap
                  active={active} hoverIdx={hoverIdx} locked={locked} reduced={reduced} theme={theme}
                  companies={companies}
                  onHover={onHover}
                  onLeaveRow={() => setHoverIdx(null)}
                  onPick={onPick}
                />
                <div className="mt-4 flex items-center gap-4 f-mono text-[9px] tracking-[0.22em]" style={{ color: "var(--m-sub)" }}>
                  {!reduced && (
                    <span className="w-32 h-[3px] rounded overflow-hidden" style={{ background: "var(--m-line)" }}>
                      <span key={`${active}-${locked}`} className="block h-full origin-left" style={{
                        background: "var(--crim-panel)",
                        animation: `progFill ${CYCLE_MS}ms linear both`,
                        animationPlayState: hover || locked ? "paused" : "running",
                        transform: locked ? "scaleX(1)" : undefined,
                      }} />
                    </span>
                  )}
                  <span className="flex items-center gap-2"><span className="w-3 h-[3px]" style={{ background: "var(--crim-panel)" }} />SIGNAL</span>
                  <span className="hidden sm:flex items-center gap-2"><span className="w-2.5 h-2.5 border-[1.5px]" style={{ borderColor: "var(--m-sub)" }} />CLUTCH</span>
                  <span className="ml-auto tabular-nums">{String(active + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}</span>
                </div>
              </div>
            </div>

            <p className="mt-6 f-mono text-[9px] sm:text-[10px] tracking-[0.24em] text-center" style={{ color: "var(--m-sub)" }}>
              GRAPHIC DESIGN <span className="text-[var(--crim-panel)]">→</span> AI DESIGN <span className="text-[var(--crim-panel)]">→</span> GEN AI <span className="text-[var(--crim-panel)]">→</span> AI CREATIVE DIRECTION
            </p>
          </div>
        </Reveal>
      </div>

      {mediaView !== null && co && (
        <FullscreenViewer
          items={co.media}
          index={mediaView}
          ratio="1/1"
          onClose={() => setMediaView(null)}
          setIndex={setMediaView}
        />
      )}
    </section>
  );
}
