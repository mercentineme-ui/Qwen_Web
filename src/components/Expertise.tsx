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

/* ================= CLOCKWORK CAREER ENGINE =================
   A vertical watch-engine that records a career through mechanical
   transmission. Four detachable transmission modules (companies) sit
   PARKED on the left; the engaged chapter physically plugs into the
   central clockwork core. Hover = extend preview · click = lock ·
   again = release · the 20s cycle runs the same physical handoff.   */

const ROWS = [78, 190, 302, 414];         /* connection heights */
const PLATE_X = [10, 26, 14, 30];         /* organic stagger on the left */
const CORE = { x: 452, y: 262 };          /* clock core center */
const SHAFT_X = 398;

function MiniGear({ cx, cy, r, teeth, spin, hot }: { cx: number; cy: number; r: number; teeth: number; spin: string; hot?: boolean }) {
  const edge = hot ? "var(--crimson)" : "var(--machine-line)";
  return (
    <g className={spin}>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2;
        const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
        return (
          <rect key={i} x={-r * 0.14} y={-r * 0.17} width={r * 0.28} height={r * 0.34}
            transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
            fill="var(--machine-inv)" stroke={edge} strokeWidth="1" style={{ transition: "stroke .35s ease" }} />
        );
      })}
      <circle cx={cx} cy={cy} r={r * 0.9} fill="var(--machine-inv)" stroke={edge} strokeWidth="1.3" style={{ transition: "stroke .35s ease" }} />
      <circle cx={cx} cy={cy} r={r * 0.34} fill="var(--machine-deep)" stroke={edge} strokeWidth="1" />
      <circle cx={cx} cy={cy} r={r * 0.1} fill={hot ? "var(--crimson)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }} />
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
  const ROMANS = ["I", "II", "III", "IV"];
  return (
    <div className="relative border rounded-xl mat-texture corner-bracket overflow-hidden"
      style={{ borderColor: "var(--m-line)", backgroundColor: "color-mix(in srgb, var(--outer-ink) 5%, transparent)", aspectRatio: "560 / 520" }}
      onMouseLeave={onLeaveRow}>

      <svg viewBox="0 0 560 520" className="absolute inset-0 w-full h-full">
        <rect x="0" y="0" width="560" height="520" fill="var(--outer-ink)" opacity="0.03" />
        <line x1="0" y1="504" x2="560" y2="504" stroke="var(--m-line)" strokeWidth="1" />

        {/* ================= CENTRAL VERTICAL CLOCK CORE ================= */}
        <g>
          {/* heavy housing — thick plates, rivets, recessed window */}
          <rect x="344" y="24" width="204" height="476" rx="5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="2.4" />
          <rect x="354" y="34" width="184" height="456" rx="3" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.1" />
          {[[352, 32], [540, 32], [352, 492], [540, 492], [352, 262], [540, 262]].map(([rx, ry], k) => (
            <g key={k}>
              <circle cx={rx} cy={ry} r="3.1" fill="var(--machine-line)" stroke="var(--machine-inv)" strokeWidth="0.9" />
              <line x1={rx - 1.6} y1={ry} x2={rx + 1.6} y2={ry} stroke="var(--machine-inv)" strokeWidth="0.7" />
            </g>
          ))}
          {/* pressure fittings */}
          {[[368, 52], [524, 52], [368, 472], [524, 472]].map(([fx, fy], k) => (
            <g key={k}>
              <circle cx={fx} cy={fy} r="4.6" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
              <path d={`M${fx - 2.4} ${fy} h4.8 M${fx} ${fy - 2.4} v4.8`} stroke="var(--machine-inv)" strokeWidth="0.9" />
            </g>
          ))}
          {/* calibration marks along the housing edge */}
          {Array.from({ length: 23 }).map((_, k) => (
            <line key={k} x1="541" y1={48 + k * 20} x2={k % 5 === 0 ? "533" : "537"} y2={48 + k * 20}
              stroke="var(--machine-inv)" strokeWidth="0.9" opacity="0.55" />
          ))}

          {/* vertical drive shaft — bearings + moving segmentation */}
          <rect x={SHAFT_X - 6} y="44" width="12" height="436" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
          <line x1={SHAFT_X} y1="50" x2={SHAFT_X} y2="474" stroke="var(--machine-inv)" strokeWidth="3.4" opacity="0.9" />
          {!reduced && (
            <line x1={SHAFT_X} y1="50" x2={SHAFT_X} y2="474" stroke="var(--machine-line)" strokeWidth="3.4"
              strokeDasharray="6 14" className="packet-2" opacity="0.6" />
          )}
          {[60, 262, 464].map((by) => (
            <g key={by}>
              <rect x={SHAFT_X - 11} y={by - 6} width="22" height="12" rx="2" fill="var(--machine-line)" stroke="var(--machine-inv)" strokeWidth="0.9" />
              <circle cx={SHAFT_X - 6} cy={by} r="1.4" fill="var(--machine-deep)" />
              <circle cx={SHAFT_X + 6} cy={by} r="1.4" fill="var(--machine-deep)" />
            </g>
          ))}

          {/* winding crown + ratchet at the shaft top */}
          <g>
            <rect x={SHAFT_X - 9} y="26" width="18" height="12" rx="2" fill="var(--machine-line)" stroke="var(--machine-inv)" strokeWidth="1" />
            <rect x={SHAFT_X - 3} y="29.5" width="6" height="5" fill="var(--machine-deep)" />
            <path d={`M${SHAFT_X - 12} 24 a12 12 0 0 1 24 0`} fill="none" stroke="var(--machine-inv)" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
          </g>

          {/* tension springs */}
          <path d={`M366 74 l6 -6 6 12 6 -12 6 12 6 -12 6 12 6 -6`} fill="none" stroke="var(--machine-inv)" strokeWidth="1.4"
            className={reduced ? undefined : "spring-stretch"} style={{ transformOrigin: "366px 74px" }} />
          <path d={`M470 452 l6 -6 6 12 6 -12 6 12 6 -12 6 12 6 -6`} fill="none" stroke="var(--machine-inv)" strokeWidth="1.4"
            className={reduced ? undefined : "spring-stretch"} style={{ transformOrigin: "470px 452px", animationDelay: "1.2s" }} />

          {/* escapement — escape wheel + ticking anchor above the clock */}
          <g>
            <line x1={CORE.x} y1="176" x2={CORE.x} y2="196" stroke="var(--machine-line)" strokeWidth="3" />
            <g className={reduced ? undefined : "gear-cw-fast"} style={{ animationDuration: "9s" }}>
              {Array.from({ length: 8 }).map((_, i) => {
                const a = (i / 8) * Math.PI * 2;
                return <path key={i} d={`M${CORE.x + 13 * Math.cos(a - 0.14)} ${158 + 13 * Math.sin(a - 0.14)} L${CORE.x + 19 * Math.cos(a)} ${158 + 19 * Math.sin(a)} L${CORE.x + 13 * Math.cos(a + 0.14)} ${158 + 13 * Math.sin(a + 0.14)}`}
                  fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="0.8" />;
              })}
              <circle cx={CORE.x} cy="158" r="12.5" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="1.2" />
            </g>
            <g className={reduced ? undefined : "escapement"} style={{ transformOrigin: `${CORE.x}px 138px` }}>
              <path d={`M${CORE.x - 13} 152 Q${CORE.x} 132 ${CORE.x + 13} 152`} fill="none" stroke="var(--machine-line)" strokeWidth="3.4" strokeLinecap="round" />
              <circle cx={CORE.x - 13} cy="152" r="2.6" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="1" />
              <circle cx={CORE.x + 13} cy="152" r="2.6" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="1" />
              <line x1={CORE.x} y1="138" x2={CORE.x} y2="128" stroke="var(--machine-line)" strokeWidth="2.4" />
            </g>
            <circle cx={CORE.x} cy="138" r="2.2" fill="var(--machine-inv)" />
          </g>

          {/* balance wheel + hairspring — continuous oscillation */}
          <g>
            <line x1={CORE.x + 14} y1="140" x2="496" y2="100" stroke="var(--machine-line)" strokeWidth="1.6" opacity="0.8" />
            <g className={reduced ? undefined : "balance"} style={{ transformOrigin: "500px 88px" }}>
              <circle cx="500" cy="88" r="18" fill="none" stroke="var(--machine-inv)" strokeWidth="3" />
              <line x1="500" y1="70" x2="500" y2="106" stroke="var(--machine-line)" strokeWidth="2" />
              <line x1="482" y1="88" x2="518" y2="88" stroke="var(--machine-line)" strokeWidth="2" />
              <circle cx="500" cy="88" r="3.2" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="1" />
            </g>
            {[6, 9.5, 13].map((r) => (
              <path key={r} d={`M${500 + r} 88 a${r} ${r} 0 1 1 -${r * 0.4} -${r * 0.9}`} fill="none" stroke="var(--machine-line)" strokeWidth="0.9" opacity="0.75" />
            ))}
          </g>

          {/* small upper idler — faster rotation */}
          <MiniGear cx={SHAFT_X} cy={112} r={13} teeth={7} spin={reduced ? "" : "gear-cw-fast"} />

          {/* the four shaft gears — the transmission cluster */}
          {ROWS.map((cy, i) => (
            <MiniGear key={cy} cx={SHAFT_X} cy={cy} r={19} teeth={9} hot={i === active}
              spin={reduced ? "" : i % 2 ? "gear-ccw" : "gear-cw"} />
          ))}

          {/* lower piston pair — occasional pumping movement */}
          {[[486, 344], [486, 388]].map(([px, py], k) => (
            <g key={k}>
              <rect x={px - 10} y={py} width="20" height="30" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <rect x={px - 3} y={py - 12} width="6" height="14" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="0.8"
                className={reduced ? undefined : "piston"} style={{ animationDelay: `${k * 1.1}s` }} />
              <rect x={px - 7} y={py + 24} width="14" height="5" rx="1.5" fill="var(--machine-line)" />
            </g>
          ))}
          <line x1="404" y1="352" x2="476" y2="352" stroke="var(--machine-line)" strokeWidth="2.4" />

          {/* ============ THE CLOCK — recessed dial, rotating tooth ring, hands ============ */}
          <circle cx={CORE.x} cy={CORE.y} r="86" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.8" />
          {/* rotating toothed ring behind the dial */}
          <g className={reduced ? undefined : "gear-ccw-slow"}>
            {Array.from({ length: 36 }).map((_, i) => {
              const a = (i / 36) * Math.PI * 2;
              const x = CORE.x + 78 * Math.cos(a), y = CORE.y + 78 * Math.sin(a);
              return <rect key={i} x="-5" y="-6" width="10" height="12"
                transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI})`}
                fill="var(--machine-line)" opacity="0.9" />;
            })}
          </g>
          <circle cx={CORE.x} cy={CORE.y} r="74" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="2.2" />
          {/* minute ticks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * Math.PI * 2;
            const major = i % 5 === 0;
            return <line key={i}
              x1={CORE.x + (major ? 60 : 64) * Math.cos(a)} y1={CORE.y + (major ? 60 : 64) * Math.sin(a)}
              x2={CORE.x + 68 * Math.cos(a)} y2={CORE.y + 68 * Math.sin(a)}
              stroke="var(--machine-plate)" strokeWidth={major ? 2 : 0.9} opacity={major ? 0.9 : 0.55} />;
          })}
          {/* roman numeral fragments */}
          {[["XII", 0], ["III", 90], ["VI", 180], ["IX", 270]].map(([rn, deg]) => {
            const a = ((Number(deg) - 90) * Math.PI) / 180;
            return (
              <text key={rn as string} x={CORE.x + 49 * Math.cos(a)} y={CORE.y + 49 * Math.sin(a) + 4}
                textAnchor="middle" className="f-display" fontSize="11" fill="var(--machine-plate)" opacity="0.85">{rn}</text>
            );
          })}
          <circle cx={CORE.x} cy={CORE.y} r="40" fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.6" />
          <circle cx={CORE.x} cy={CORE.y} r="34" fill="none" stroke="var(--machine-line)" strokeWidth="0.7" strokeDasharray="2 5" opacity="0.6" />
          {/* clock hands — slow independent rotation */}
          <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "240s", transformOrigin: `${CORE.x}px ${CORE.y}px` }}>
            <line x1={CORE.x} y1={CORE.y} x2={CORE.x} y2={CORE.y - 26} stroke="var(--machine-plate)" strokeWidth="4.4" strokeLinecap="round" />
          </g>
          <g className={reduced ? undefined : "gear-cw"} style={{ animationDuration: "60s", transformOrigin: `${CORE.x}px ${CORE.y}px` }}>
            <line x1={CORE.x} y1={CORE.y} x2={CORE.x} y2={CORE.y - 40} stroke="var(--machine-plate)" strokeWidth="2.6" strokeLinecap="round" />
          </g>
          {/* jewel-bearing core — the soulpunk heartbeat */}
          <g className={reduced ? undefined : "core-beat"}>
            <circle cx={CORE.x} cy={CORE.y} r="12" fill="var(--machine-deep)" stroke="var(--crimson)" strokeWidth="1.6" />
            <circle cx={CORE.x} cy={CORE.y} r="6.5" fill="var(--crimson)" />
            <circle cx={CORE.x - 2} cy={CORE.y - 2} r="1.6" fill="#DDDDD8" opacity="0.8" />
          </g>
          {/* engagement pulse — fires when a chapter plugs in */}
          <circle key={active} cx={CORE.x} cy={CORE.y} r="24" fill="none" stroke="var(--crimson)" strokeWidth="2"
            className={reduced ? undefined : "core-engage"} style={{ opacity: reduced ? 0 : undefined }} />
        </g>

        {/* ============ TRANSMISSION CHAINS — one per chapter ============ */}
        {companies.map((co, i) => {
          const cy = ROWS[i];
          const engaged = i === active;
          const path = `M344 ${cy} L374 ${cy} L${SHAFT_X} ${cy} L${SHAFT_X} ${CORE.y} L${CORE.x - 16} ${CORE.y}`;
          return (
            <g key={co.id + "-chain"}>
              <path d={path} fill="none" stroke="var(--machine-line)" strokeWidth="1.2" opacity="0.4" />
              {engaged && (
                <>
                  {!reduced && <path d={path} fill="none" stroke="var(--crimson)" strokeWidth="2.2" className="channel-flow" />}
                  {/* physical signal bead travelling company gear → shaft → core */}
                  {!reduced && (
                    <circle r="3.6" fill="var(--crimson)" stroke="#DDDDD8" strokeWidth="1">
                      <animateMotion dur="1.5s" repeatCount="indefinite" path={path} />
                    </circle>
                  )}
                </>
              )}
              {/* idler gear inside the machine, driven when its chapter engages */}
              <MiniGear cx={374} cy={cy} r={12} teeth={7} hot={engaged} spin={reduced ? "" : engaged ? "gear-cw-fast" : "gear-ccw"} />
              {/* clutch socket + roman position mark */}
              <rect x="338" y={cy - 14} width="13" height="28" rx="2" fill="var(--machine-deep)"
                stroke={engaged ? "var(--crimson)" : "var(--machine-line)"} strokeWidth={engaged ? 1.8 : 1.2}
                style={{ transition: "stroke .4s ease" }} />
              <text x="333" y={cy + 3} textAnchor="end" className="f-mono" fontSize="8" letterSpacing="1"
                fill={engaged ? "var(--crimson)" : "var(--machine-inv)"} opacity="0.9" style={{ transition: "fill .4s ease" }}>{ROMANS[i]}</text>
            </g>
          );
        })}

        {/* ============ CLOCKWORK LINKAGE ARMS — node → arm → joint → gear → clutch ============ */}
        {companies.map((co, i) => {
          const cy = ROWS[i];
          const px = PLATE_X[i];
          const extended = i === active || i === hoverIdx;
          const engaged = i === active;
          const preview = i === hoverIdx && i !== active;
          const armX0 = px + 190;
          return (
            <g key={co.id + "-arm"}>
              {/* rod + tie-rod + joint — folds back when parked */}
              <g style={{
                transform: extended ? "none" : "translateX(-46px) scaleX(0.45)",
                transformBox: "fill-box", transformOrigin: "0% 50%",
                transition: reduced ? "none" : "transform .65s cubic-bezier(.45,.05,.3,1)",
                opacity: extended ? 1 : 0.55,
              }}>
                <line x1={armX0} y1={cy} x2="312" y2={cy} stroke="var(--machine-line)" strokeWidth="7" strokeLinecap="round" />
                <line x1={armX0} y1={cy} x2="312" y2={cy} stroke={engaged ? "var(--crimson)" : "var(--machine-plate)"} strokeWidth="2.6" strokeLinecap="round"
                  style={{ transition: "stroke .4s ease" }} />
                <line x1={armX0 + 6} y1={cy - 8} x2="296" y2={cy - 8} stroke="var(--machine-line)" strokeWidth="1.6" opacity="0.8" />
                <circle cx="252" cy={cy} r="5.6" fill="var(--machine-deep)" stroke={engaged ? "var(--crimson)" : "var(--machine-inv)"} strokeWidth="1.3"
                  style={{ transition: "stroke .4s ease" }} />
                <path d={`M248.6 ${cy} h6.8 M252 ${cy - 3.4} v6.8`} stroke="var(--machine-inv)" strokeWidth="0.9" />
              </g>
              {/* small gear — slides in and spins up when extended */}
              <g style={{
                transform: extended ? "none" : "translateX(-58px)",
                opacity: extended ? 1 : 0.4,
                transition: reduced ? "none" : "transform .6s cubic-bezier(.45,.05,.3,1) .12s, opacity .5s ease .12s",
              }}>
                <MiniGear cx={296} cy={cy} r={13} teeth={8} hot={engaged}
                  spin={reduced ? "" : engaged ? "gear-cw-fast" : extended ? "gear-cw" : "gear-ccw-slow"} />
              </g>
              {/* clutch sleeve — the last mechanical move before the transmission */}
              <g style={{
                transform: engaged ? "translateX(20px)" : extended ? "translateX(6px)" : "translateX(-58px)",
                opacity: extended ? 1 : 0.35,
                transition: reduced ? "none" : "transform .42s cubic-bezier(.4,.1,.3,1) .26s, opacity .45s ease .26s",
              }}>
                <rect x="312" y={cy - 10} width="22" height="20" rx="2"
                  fill={engaged ? "var(--machine-line)" : "var(--machine-deep)"}
                  stroke={engaged ? "var(--crimson)" : "var(--machine-line)"} strokeWidth={engaged ? 1.8 : 1.2}
                  style={{ transition: "stroke .35s ease, fill .35s ease" }} />
                {[0, 1, 2].map((k) => (
                  <rect key={k} x="334" y={cy - 7.5 + k * 5.6} width="6" height="3.6"
                    fill={engaged ? "var(--crimson)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }} />
                ))}
              </g>
            </g>
          );
        })}

        {/* ============ COMPANY MODULES — parked plaques on the LEFT ============ */}
        {companies.map((co, i) => {
          const cy = ROWS[i];
          const px = PLATE_X[i];
          const engaged = i === active;
          const extended = i === active || i === hoverIdx;
          const hovered = i === hoverIdx;
          return (
            <g key={co.id}
              onMouseEnter={() => onHover(i)}
              onClick={() => onPick(i)}
              className="cursor-pointer"
              style={{
                transform: extended ? "translate(12px,0) scale(1.06)" : "none",
                transformBox: "fill-box", transformOrigin: "0% 50%",
                transition: reduced ? "none" : "transform .7s cubic-bezier(.4,.9,.3,1.05)",
              }}>
              {/* industrial plaque — chamfered toward the arm */}
              <polygon
                points={`${px},${cy - 33} ${px + 172},${cy - 33} ${px + 184},${cy - 21} ${px + 184},${cy + 21} ${px + 172},${cy + 33} ${px},${cy + 33}`}
                fill={engaged ? "#3C3D42" : "#59595B"}
                stroke={engaged ? "var(--crimson)" : hovered ? "#DDDDD8" : "#A6A6A4"}
                strokeWidth={engaged ? 2 : 1.4}
                style={{ transition: "fill .4s ease, stroke .4s ease" }} />
              <line x1={px + 2} y1={cy - 29} x2={px + 170} y2={cy - 29} stroke="#A6A6A4" strokeWidth="0.8" opacity="0.4" />
              {/* inset panel */}
              <rect x={px + 44} y={cy - 25} width="132" height="50" rx="2"
                fill="#222328" stroke={engaged ? "var(--crimson)" : "#3C3D42"} strokeWidth="1.3" style={{ transition: "stroke .4s ease" }} />
              {engaged && <rect x={px + 44} y={cy - 25} width="4" height="50" fill="var(--crimson)" />}
              {/* engraved index */}
              <text x={px + 8} y={cy + 10} className="f-display" fontSize="26" fill="#222328" opacity="0.9">{co.num}</text>
              <text x={px + 9} y={cy + 11} className="f-display" fontSize="26" fill="none" stroke={engaged ? "var(--crimson)" : "#DDDDD8"} strokeWidth="0.6" opacity="0.75">{co.num}</text>
              {/* company name — always readable, grows with the plaque */}
              <text x={px + 52} y={cy - 1} className="f-tech" fontSize="12" fontWeight="700" letterSpacing="0.8"
                fill={engaged ? "#E72241" : "#DDDDD8"} style={{ transition: "fill .35s ease" }}>{co.name}</text>
              {/* role + date — revealed only while extended */}
              <text x={px + 52} y={cy + 13} className="f-tech" fontSize="7.5" fontWeight="700" letterSpacing="1.4"
                fill={engaged ? "#CEB1AB" : "#A6A6A4"}
                style={{ opacity: extended ? 1 : 0, transition: reduced ? "none" : "opacity .45s ease .25s" }}>
                {co.role.split("·")[0].trim()}
              </text>
              <text x={px + 52} y={cy + 23} className="f-mono" fontSize="6.8" letterSpacing="1" fill="#A6A6A4"
                style={{ opacity: extended ? 0.85 : 0, transition: reduced ? "none" : "opacity .45s ease .32s" }}>
                {co.date}
              </text>
              {/* screws */}
              {[[px + 8, cy - 26], [px + 176, cy - 26], [px + 8, cy + 26], [px + 170, cy + 26]].map(([sx, sy], k) => (
                <g key={k}>
                  <circle cx={sx} cy={sy} r="2.6" fill="#222328" stroke="#A6A6A4" strokeWidth="0.9" />
                  <line x1={sx - 1.4} y1={sy} x2={sx + 1.4} y2={sy} stroke="#A6A6A4" strokeWidth="0.7" transform={`rotate(${k * 40} ${sx} ${sy})`} />
                </g>
              ))}
              {/* arm socket + docking pin */}
              <rect x={px + 182} y={cy - 7} width="12" height="14" rx="2" fill="#222328" stroke="#A6A6A4" strokeWidth="1.1" />
              <circle cx={px + 188} cy={cy} r="2.6" fill={engaged ? "var(--crimson)" : "#59595B"} style={{ transition: "fill .35s ease" }} />
              {/* state chip */}
              {engaged && (
                <g>
                  <rect x={px} y={cy - 44} width="32" height="9" rx="1.5" fill="var(--crimson)" />
                  <text x={px + 4} y={cy - 37} className="f-mono" fontSize="6.5" letterSpacing="1.4" fill="#DDDDD8" fontWeight="700">{locked ? "LOCK" : hovered ? "SYNC" : "RUN"}</text>
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
          {locked ? "CHAPTER LOCKED — CLICK AGAIN TO RELEASE" : hoverIdx !== null ? "COUPLING PREVIEW" : reduced ? "STATIC" : "AUTO SEQUENCE · 20S"}
        </span>
        <span>MODULE → ARM → GEAR → CLUTCH → CORE</span>
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
