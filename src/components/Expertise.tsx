import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { MediaSlot, Reveal, SectionHead } from "./ui";

const CYCLE_MS = 30000;

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

/* ==================================================================
   VERTICAL STEAM TRANSMISSION ENGINE — the Career Node Map.
   Four career chapters dock on the LEFT as mechanical input modules.
   Each connection is: NAMEPLATE → HINGE → ARTICULATED ARM → DRIVE GEAR
   → DOG CLUTCH → MAIN SHAFT. The tall machine on the right runs
   continuously: flywheel + belt → gear train → crank + piston →
   riveted boiler, gauge and safety valve → lower reduction → the
   central clockwork drive. Engaging a chapter cascades crimson
   mechanical energy from its clutch down through the whole machine.
   Materials follow the --machine-* theme set (matte black on light,
   matte off-white on dark); hover inverts the node material.
   ================================================================== */

const ROWS = [116, 248, 380, 512];                 /* docking heights */
const SHAFT_X = 352;                               /* main vertical shaft */
const SEC_X = 398;                                 /* secondary shaft (pulley / train / crank) */

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
  companies: { id: string; name: string; num: string }[];
  onHover: (i: number) => void;
  onLeaveRow: () => void;
  onPick: (i: number) => void;
}) {
  /* one clear active chapter: hover previews, otherwise the locked/cycled one */
  const featured = hoverIdx !== null ? hoverIdx : active;
  const spin = (s?: string) => (reduced || !s ? undefined : s);

  /* the machine revs briefly on every handoff — gears accelerate, the gauge
     climbs, the valve pops, the piston pumps harder: cause → effect. */
  const [rev, setRev] = useState(false);
  useEffect(() => {
    if (reduced) return;
    setRev(true);
    const t = window.setTimeout(() => setRev(false), 1700);
    return () => clearTimeout(t);
  }, [featured, reduced]);

  /* gear physics — large:slow · medium:medium · small:fast · meshed pairs oppose */
  const dMain = rev ? "2.6s" : "7.2s";     /* main shaft pinion (CCW)   */
  const dSec = rev ? "4s" : "11.2s";       /* secondary gear + crank    */
  const dTer = rev ? "1.7s" : "4.8s";      /* tertiary — fastest        */
  const dFly = rev ? "3.5s" : "10s";       /* flywheel                  */
  const dRed = rev ? "3.6s" : "9.9s";      /* lower reduction wheel     */
  const dDrive = rev ? "9s" : "26s";       /* central clockwork drive   */
  const dPiston = rev ? "2s" : "5.6s";     /* piston stroke             */

  const row = ROWS[Math.min(featured, ROWS.length - 1)];

  return (
    <div className="relative" style={{ aspectRatio: "560 / 640" }} onMouseLeave={onLeaveRow}>
      <svg viewBox="0 0 560 640" className="absolute inset-0 w-full h-full">

        {/* ==================== BACK LAYER — structure ==================== */}
        <rect x="292" y="26" width="252" height="588" rx="10" fill="var(--machine-deep)" opacity="0.32" stroke="var(--machine-line)" strokeWidth="1" />
        <rect x="300" y="34" width="236" height="572" rx="8" fill="var(--machine-plate)" opacity="0.16" />
        {[40, 320, 600].map((by) => (
          <React.Fragment key={by}>
            <circle cx="300" cy={by} r="2.6" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.9" />
            <circle cx="536" cy={by} r="2.6" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.9" />
          </React.Fragment>
        ))}

        {/* ==================== STEAM CIRCUIT — pipes · boiler · gauge · valve ==================== */}
        {/* vertical steam pipe + flanges */}
        <rect x="519" y="58" width="9" height="216" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
        {[110, 168, 226].map((fy) => (
          <rect key={fy} x="515" y={fy} width="17" height="6" rx="1.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
        ))}
        {/* horizontal run toward the flywheel bearing */}
        <rect x="466" y="54" width="58" height="8" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />

        {/* riveted boiler / pressure chamber behind the cylinder */}
        <rect x="436" y="272" width="106" height="150" rx="12" fill="var(--machine-deep)" opacity="0.5" stroke="var(--machine-line)" strokeWidth="1.5" />
        {[[448, 284], [530, 284], [448, 410], [530, 410], [448, 347], [530, 347]].map(([bx, by], k) => (
          <circle key={k} cx={bx} cy={by} r="2.2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.9" />
        ))}
        {/* inspection hatch */}
        <circle cx="521" cy="347" r="10" fill="var(--machine-plate)" opacity="0.4" stroke="var(--machine-line)" strokeWidth="1.3" />
        <line x1="514" y1="347" x2="528" y2="347" stroke="var(--machine-line)" strokeWidth="1.1" />

        {/* pressure gauge — needle climbs when the machine revs */}
        <circle cx="472" cy="240" r="21" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="2" />
        <circle cx="472" cy="240" r="16.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
        {Array.from({ length: 9 }).map((_, i) => {
          const a = (-120 + i * 30) * (Math.PI / 180);
          return (
            <line key={i} x1={472 + 12.5 * Math.sin(a)} y1={240 - 12.5 * Math.cos(a)}
              x2={472 + 15.5 * Math.sin(a)} y2={240 - 15.5 * Math.cos(a)}
              stroke="var(--machine-inv)" strokeWidth={i % 4 === 0 ? 1.6 : 0.9} opacity="0.75" />
          );
        })}
        <g className={spin("gauge-tremor")} style={{ transformOrigin: "472px 240px", transformBox: "view-box" }}>
          <g style={{ transform: `rotate(${reduced ? 28 : rev ? 46 : 28}deg)`, transformOrigin: "472px 240px", transformBox: "view-box", transition: reduced ? "none" : "transform 1.1s cubic-bezier(.3,.8,.3,1)" }}>
            <line x1="472" y1="243" x2="472" y2="227" stroke="var(--machine-crimson-hot)" strokeWidth="2" strokeLinecap="round" />
          </g>
        </g>
        <circle cx="472" cy="240" r="3" fill="var(--machine-crimson-hot)" />
        <rect x="466" y="259" width="12" height="8" rx="1.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />

        {/* safety valve — pops while transmitting */}
        <rect x="494" y="262" width="16" height="10" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
        <path d="M497 262 l3 -4 l3 4 l3 -4 l3 4" fill="none" stroke="var(--machine-line)" strokeWidth="1.2" />
        <rect x="496" y="248" width="12" height="9" rx="2" fill="var(--machine-plate)" stroke={rev || locked ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth="1.2"
          className={(rev || locked) ? spin("valve-pop") : undefined} style={{ transition: "stroke .4s ease" }} />

        {/* ==================== MIDDLE LAYER — clutch chamber · shaft · drivetrain ==================== */}
        {/* clutch chamber housing */}
        <rect x="292" y="64" width="88" height="480" rx="6" fill="var(--machine-deep)" opacity="0.45" stroke="var(--machine-line)" strokeWidth="1.3" />
        <text x="300" y="80" className="f-mono" fontSize="7" letterSpacing="1.6" fill="var(--machine-line)">CLUTCH BANK</text>

        {/* main vertical shaft — passes through bearings, carries the drive */}
        <rect x={SHAFT_X - 6} y="44" width="12" height="516" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.3" />
        <line x1={SHAFT_X - 3} y1="48" x2={SHAFT_X - 3} y2="556" stroke="var(--machine-inv)" strokeWidth="1.2" opacity="0.35" />
        {[92, 205, 336, 445, 548].map((by) => (
          <React.Fragment key={by}>
            <rect x={SHAFT_X - 13} y={by} width="26" height="11" rx="2.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
            <circle cx={SHAFT_X - 8} cy={by + 5.5} r="1.6" fill="var(--machine-line)" />
            <circle cx={SHAFT_X + 8} cy={by + 5.5} r="1.6" fill="var(--machine-line)" />
          </React.Fragment>
        ))}

        {/* secondary shaft — pulley → gear → crank */}
        <rect x={SEC_X - 4} y="96" width="8" height="240" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.1" />
        <rect x={SEC_X - 10} y="132" width="20" height="9" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
        <rect x={SEC_X - 10} y="262" width="20" height="9" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />

        {/* gear train — main pinion drives the secondary, which drives the tertiary */}
        <Gear cx={SHAFT_X} cy={165} r={18} teeth={10} spin={spin("gear-ccw")} dur={dMain} />
        <Gear cx={SEC_X} cy={165} r={28} teeth={14} spin={spin("gear-cw")} dur={dSec} />
        <Gear cx={438} cy={165} r={12} teeth={8} spin={spin("gear-ccw")} dur={dTer} />
        <rect x="433" y="176" width="10" height="16" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />

        {/* crank + connecting rod + horizontal piston cylinder */}
        <g className={spin("gear-cw")} style={{ animationDuration: dSec }}>
          <circle cx={SEC_X} cy="330" r="24" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
          <circle cx={SEC_X} cy="330" r="17" fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.5" />
          <circle cx={SEC_X + 15} cy="330" r="4.2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />
          <path d={`M${SEC_X - 14} 330 A14 14 0 0 1 ${SEC_X} 316`} fill="none" stroke="var(--machine-line)" strokeWidth="3" opacity="0.6" />
        </g>
        {/* connecting rod — swings with the crank */}
        <g className={spin("rod-swing")} style={{ transformOrigin: `${SEC_X}px 330px`, transformBox: "view-box", animationDuration: dSec }}>
          <line x1={SEC_X + 2} y1="330" x2="452" y2="330" stroke="var(--machine-line)" strokeWidth="5" strokeLinecap="round" />
          <line x1={SEC_X + 2} y1="330" x2="452" y2="330" stroke="var(--machine-inv)" strokeWidth="1.4" opacity="0.4" />
        </g>
        {/* cylinder */}
        <rect x="448" y="286" width="48" height="8" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
        <rect x="444" y="308" width="104" height="44" rx="8" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
        <rect x="450" y="313" width="92" height="34" rx="5" fill="var(--machine-plate)" opacity="0.35" />
        <rect x="448" y="352" width="48" height="8" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
        {/* piston head — travels the bore, faster while transmitting */}
        <g className={spin("piston-deep")} style={{ animationDuration: dPiston }}>
          <rect x="452" y="314" width="15" height="32" rx="2.5" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
          <line x1="456" y1="318" x2="456" y2="342" stroke="var(--machine-line)" strokeWidth="1" />
          <line x1="462" y1="318" x2="462" y2="342" stroke="var(--machine-line)" strokeWidth="1" />
        </g>

        {/* flywheel + belt — the prime mover */}
        <line x1="470" y1="46" x2={SEC_X} y2="88" stroke="var(--machine-line)" strokeWidth="4" opacity="0.85" />
        <line x1="470" y1="154" x2={SEC_X} y2="112" stroke="var(--machine-line)" strokeWidth="4" opacity="0.85" />
        {!reduced && (
          <>
            <line x1="470" y1="46" x2={SEC_X} y2="88" stroke="var(--machine-inv)" strokeWidth="1.4" opacity="0.5" className="belt-run" />
            <line x1="470" y1="154" x2={SEC_X} y2="112" stroke="var(--machine-inv)" strokeWidth="1.4" opacity="0.5" className="belt-run" />
          </>
        )}
        <g className={spin("gear-cw")} style={{ animationDuration: dFly }}>
          <circle cx="470" cy="100" r="54" fill="none" stroke="var(--machine-deep)" strokeWidth="12" />
          <circle cx="470" cy="100" r="60" fill="none" stroke="var(--machine-line)" strokeWidth="1.2" />
          <circle cx="470" cy="100" r="48" fill="none" stroke="var(--machine-line)" strokeWidth="1.2" />
          {[0, 90, 180, 270].map((d) => (
            <line key={d} x1="470" y1="58" x2="470" y2="142" stroke="var(--machine-deep)" strokeWidth="7" transform={`rotate(${d} 470 100)`} />
          ))}
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <circle key={i} cx={470 + 54 * Math.cos(a)} cy={100 + 54 * Math.sin(a)} r="2" fill="var(--machine-line)" />;
          })}
        </g>
        <circle cx="470" cy="100" r="11" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
        <circle cx="470" cy="100" r="4" fill="var(--machine-deep)" />

        {/* escapement — crown wheel + rocking anchor above the shaft */}
        <rect x={SHAFT_X - 9} y="28" width="18" height="9" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
        <Gear cx={SHAFT_X} cy={66} r={15} teeth={10} spin={spin("gear-ccw")} dur="14s" />
        <g className={spin("escapement")} style={{ transformOrigin: `${SHAFT_X}px 48px`, transformBox: "view-box" }}>
          <path d={`M${SHAFT_X - 9} 52 L${SHAFT_X} 42 L${SHAFT_X + 9} 52`} fill="none" stroke="var(--machine-line)" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* ==================== LOWER TRANSMISSION — reduction + central clockwork drive ==================== */}
        <Gear cx={SHAFT_X} cy={470} r={16} teeth={9} spin={spin("gear-ccw")} dur={dMain} />
        <Gear cx={390} cy={470} r={22} teeth={12} spin={spin("gear-cw")} dur={dRed} />
        <Gear cx={390} cy={470} r={9} teeth={7} spin={spin("gear-cw")} dur={dRed} fill="var(--machine-plate)" />
        {/* the central drive — toothed wheel + clock face + hands */}
        <Gear cx={448} cy={500} r={58} teeth={22} spin={spin("gear-ccw")} dur={dDrive} />
        <circle cx="448" cy="500" r="46" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line key={i} x1={448 + 38 * Math.sin(a)} y1={500 - 38 * Math.cos(a)}
              x2={448 + 43 * Math.sin(a)} y2={500 - 43 * Math.cos(a)}
              stroke="var(--machine-inv)" strokeWidth={i % 3 === 0 ? 2 : 1} opacity="0.7" />
          );
        })}
        <text x="448" y="472" textAnchor="middle" className="f-display" fontSize="8.5" fill="var(--machine-inv)" opacity="0.85">XII</text>
        <text x="478" y="503" textAnchor="middle" className="f-display" fontSize="8.5" fill="var(--machine-inv)" opacity="0.85">III</text>
        <text x="448" y="536" textAnchor="middle" className="f-display" fontSize="8.5" fill="var(--machine-inv)" opacity="0.85">VI</text>
        <text x="418" y="503" textAnchor="middle" className="f-display" fontSize="8.5" fill="var(--machine-inv)" opacity="0.85">IX</text>
        <g className={spin("gear-cw")} style={{ animationDuration: "120s" }}>
          <line x1="448" y1="500" x2="448" y2="478" stroke="var(--machine-inv)" strokeWidth="3.2" strokeLinecap="round" />
        </g>
        <g className={spin("gear-cw")} style={{ animationDuration: "42s" }}>
          <line x1="448" y1="500" x2="448" y2="468" stroke="var(--machine-inv)" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        </g>
        <g className={spin("core-beat")}>
          <circle cx="448" cy="500" r="5.5" fill="var(--machine-crimson-hot)" />
        </g>
        {/* balance wheel at the shaft foot — the machine's breath */}
        <g className={spin("balance")} style={{ transformOrigin: `${SHAFT_X}px 566px`, transformBox: "view-box" }}>
          <circle cx={SHAFT_X} cy="566" r="17" fill="none" stroke="var(--machine-deep)" strokeWidth="4" />
          <line x1={SHAFT_X - 15} y1="566" x2={SHAFT_X + 15} y2="566" stroke="var(--machine-deep)" strokeWidth="2.4" />
          <circle cx={SHAFT_X} cy="566" r="3" fill="var(--machine-line)" />
        </g>
        <path d={`M${SHAFT_X - 9} 566 A9 9 0 0 1 ${SHAFT_X + 9} 566`} fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.55" />

        {/* ==================== COMPANY MODULES — hinge → arm → gear → clutch ==================== */}
        {companies.map((co, i) => {
          const cy = ROWS[i];
          const label = co.name === "PREMA SAI DESIGNERS" ? "PSD" : co.name;
          const feat = i === featured;
          const isLocked = locked && i === active;
          return (
            <g key={co.id} onMouseEnter={() => onHover(i)} onClick={() => onPick(i)} className="cursor-pointer">

              {/* socket + guide rail on the clutch chamber (static hardware) */}
              <rect x="304" y={cy - 3} width="44" height="6" rx="2" fill="var(--machine-line)" opacity="0.35" />
              <rect x="334" y={cy - 21} width="34" height="42" rx="3" fill="var(--machine-deep)"
                stroke={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth={feat ? 2 : 1.4}
                style={{ transition: "stroke .35s ease" }} />
              <circle cx={SHAFT_X} cy={cy} r="9.5" fill="var(--machine-plate)"
                stroke={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth="1.4" style={{ transition: "stroke .35s ease" }} />
              {/* engagement lamp */}
              <circle cx={SHAFT_X} cy={cy - 27} r="2.6" fill={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"}
                className={feat && !reduced ? "live-blink" : undefined} style={{ transition: "fill .35s ease" }} />

              {/* hinge block on the plate edge */}
              <rect x="164" y={cy - 11} width="15" height="22" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <circle cx="171.5" cy={cy} r="3" fill={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }} />

              {/* articulated arm — sleeve fixed, inner rod telescopes out */}
              <rect x="177" y={cy - 6.5} width="54" height="13" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <g style={{
                transform: feat && !reduced ? "translateX(34px)" : feat ? "translateX(34px)" : "translateX(0)",
                transition: reduced ? "none" : "transform .55s cubic-bezier(.34,1.2,.42,1) .06s",
              }}>
                <rect x="182" y={cy - 3.5} width="92" height="7" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
                <circle cx="274" cy={cy} r="5.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                <circle cx="274" cy={cy} r="1.8" fill="var(--machine-line)" />
              </g>

              {/* drive gear — spins up when its chapter is featured */}
              <Gear cx={290} cy={cy} r={14} teeth={8} spin={spin("gear-cw")} dur={feat ? "1.6s" : "9s"}
                stroke={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} />

              {/* dog clutch — slides along the rail and seats into the shaft bore */}
              <g style={{
                transform: feat ? "translateX(10px)" : "translateX(-8px)",
                transition: reduced ? "none" : "transform .45s cubic-bezier(.3,.9,.35,1.1) .26s",
              }}>
                <rect x="310" y={cy - 13} width="28" height="26" rx="2" fill="var(--machine-deep)"
                  stroke={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth="1.5" style={{ transition: "stroke .35s ease" }} />
                {[-10, -2.5, 5].map((dy) => (
                  <rect key={dy} x="338" y={cy + dy} width="7" height="5"
                    fill={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }} />
                ))}
                <line x1="315" y1={cy - 7} x2="333" y2={cy - 7} stroke="var(--machine-line)" strokeWidth="1" />
                <line x1="315" y1={cy + 7} x2="333" y2={cy + 7} stroke="var(--machine-line)" strokeWidth="1" />
              </g>

              {/* crimson mechanical energy — arm → clutch → shaft → reduction → drive */}
              {feat && (
                <>
                  <line x1="171" y1={cy} x2={SHAFT_X} y2={cy} stroke="var(--machine-crimson-hot)" strokeWidth="1.6"
                    className={spin("channel-flow")} opacity="0.85" />
                  <line x1={SHAFT_X} y1={cy} x2={SHAFT_X} y2="552" stroke="var(--machine-crimson-hot)" strokeWidth="2"
                    className={spin("shaft-flow")} opacity="0.8" />
                  {!reduced && (
                    <>
                      <circle r="3" fill="var(--machine-crimson-hot)">
                        <animateMotion dur="2.4s" repeatCount="indefinite" path={`M 171 ${cy} L ${SHAFT_X} ${cy} L ${SHAFT_X} 470 L 390 470 L 448 500`} />
                      </circle>
                      <circle r="3" fill="var(--machine-crimson-hot)">
                        <animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite" path={`M 171 ${cy} L ${SHAFT_X} ${cy} L ${SHAFT_X} 470 L 390 470 L 448 500`} />
                      </circle>
                    </>
                  )}
                </>
              )}

              {/* ================= nameplate — material inverts on hover ================= */}
              <g className={spin("plate-breathe")} style={{ animationDelay: `${i * 0.6}s` }}>
                <g style={{
                  transform: feat ? "translateX(5px)" : "none",
                  transition: reduced ? "none" : "transform .5s cubic-bezier(.3,.9,.3,1)",
                }}>
                  {/* depth shadow */}
                  <polygon
                    points={`16,${cy - 24} 150,${cy - 24} 162,${cy - 12} 162,${cy + 16} 148,${cy + 30} 16,${cy + 30}`}
                    fill="var(--machine-deep)" opacity="0.45" />
                  {/* machined body */}
                  <polygon
                    points={`12,${cy - 28} 148,${cy - 28} 164,${cy - 14} 164,${cy + 14} 148,${cy + 28} 12,${cy + 28}`}
                    fill={feat ? "var(--machine-inv)" : "var(--machine-plate)"}
                    stroke={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"}
                    strokeWidth={feat ? 2 : 1.4}
                    style={{ transition: "fill .4s ease, stroke .35s ease" }} />
                  {/* recessed name area */}
                  <rect x="40" y={cy - 16} width="112" height="32" rx="3"
                    fill={feat ? "var(--machine-plate)" : "var(--machine-deep)"} opacity={feat ? 0.12 : 0.5}
                    stroke={feat ? "var(--machine-plate)" : "var(--machine-line)"} strokeWidth="0.9"
                    style={{ transition: "fill .4s ease, stroke .35s ease" }} />
                  {/* mounting screws */}
                  {([[20, cy - 20], [20, cy + 20]] as const).map(([sx, sy], k) => (
                    <g key={k}>
                      <circle cx={sx} cy={sy} r="2.6" fill={feat ? "var(--machine-plate)" : "var(--machine-deep)"}
                        stroke={feat ? "var(--machine-inv)" : "var(--machine-line)"} strokeWidth="0.9" style={{ transition: "fill .4s ease, stroke .35s ease" }} />
                      <line x1={sx - 1.4} y1={sy} x2={sx + 1.4} y2={sy} stroke={feat ? "var(--machine-inv)" : "var(--machine-line)"} strokeWidth="0.8" />
                    </g>
                  ))}
                  {/* index + name — the name is the signal */}
                  <text x="44" y={cy - 19.5} className="f-mono" fontSize="8" letterSpacing="1.6" fontWeight="700"
                    fill={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }}>
                    {co.num}
                  </text>
                  <text x="96" y={cy + 6.5} textAnchor="middle" className="f-display" fontSize={label.length > 8 ? 16.5 : 19} letterSpacing="0.04em"
                    fill={feat ? "var(--machine-plate)" : "var(--machine-inv)"}
                    style={{ transition: "fill .35s ease", fontWeight: feat ? 700 : 400 }}>
                    {label}
                  </text>
                  {/* lock latch */}
                  {isLocked && (
                    <rect x="12" y={cy + 24} width="42" height="5" fill="var(--machine-crimson-hot)" />
                  )}
                  {/* status lamp */}
                  <circle cx="146" cy={cy - 20} r="3" fill={feat ? "var(--machine-crimson-hot)" : "var(--machine-line)"}
                    className={feat && !reduced ? "live-blink" : undefined} style={{ transition: "fill .35s ease" }} />
                </g>
              </g>
            </g>
          );
        })}

        {/* ==================== FRONT FRAME — arms pass beneath the rails ==================== */}
        <rect x="234" y="14" width="320" height="11" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
        <rect x="234" y="615" width="320" height="11" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
        <rect x="234" y="14" width="11" height="612" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
        <rect x="543" y="14" width="11" height="612" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
        {[40, 210, 400, 590].map((ry) => (
          <React.Fragment key={ry}>
            <circle cx="239.5" cy={ry} r="2.2" fill="var(--machine-line)" />
            <circle cx="548.5" cy={ry} r="2.2" fill="var(--machine-line)" />
          </React.Fragment>
        ))}
        {[280, 420].map((rx) => (
          <React.Fragment key={rx}>
            <circle cx={rx} cy="19.5" r="2.2" fill="var(--machine-line)" />
            <circle cx={rx} cy="620.5" r="2.2" fill="var(--machine-line)" />
          </React.Fragment>
        ))}
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

  /* 30s automatic sequence — runs only while UNLOCKED · hover pauses the exact timer */
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

  /* hover = mechanical preview — Career Info follows the hovered chapter ·
     click = lock · second click on the locked chapter releases */
  const onHover = (i: number) => {
    setHoverIdx(i);
    if (!locked) setActive(i);
  };
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
                STEAM TRANSMISSION ENGINE — CLICK A MODULE TO LOCK
              </span>
              <span className="flex-1 h-px min-w-[60px]" style={{ background: "var(--m-line)" }} />
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>
                {locked ? "LOCKED" : hover ? "SEQUENCE PAUSED" : reduced ? "STATIC" : "AUTO SEQUENCE · 30S"}
              </span>
            </div>

            {/* twin module headings — CAREER INFO (LEFT) · CAREER NODE MAP (RIGHT) */}
            <div className="grid lg:grid-cols-[1.02fr_0.98fr] gap-x-6 gap-y-8 lg:gap-x-10 mb-5">
              <ModuleHeading tag="A" title="CAREER INFO" right="HOVER — PREVIEW · CLICK — LOCK" />
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
