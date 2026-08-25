import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { MediaSlot, Reveal, SectionHead } from "./ui";

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

/* ================= MECHANICAL CASCADE × VERTICAL CLOCKWORK TRANSMISSION =================
   The vertical mechanical counterpart of the circular Creative Core reactor.
   LEFT: four machined company nameplates (name + index ONLY). Each feeds the
   machine through hinge → telescoping arm → drive gear → dog-tooth clutch →
   transmission shaft → central clock core, with a staggered mechanical cascade
   on engage and a reversed collapse on retract. Hover = material inversion +
   physical extension (never a red card). Click = lock. The 20s cycle runs the
   same physical handoff. All materials come from the --machine-* theme set.   */

const ROWS = [95, 235, 375, 515];                 /* connection heights — one per chapter */
const SHAFT_X = 300;                              /* vertical transmission shaft */
const CORE = { x: 430, y: 330 };                  /* clock / power core centre */

/* toothed gear primitive — rotates via CSS class, transform-origin at its own box */
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
      {hub && <circle cx={cx} cy={cy} r={r * 0.3} fill="var(--machine-plate)" stroke={stroke} strokeWidth={1.1} />}
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
  /* one clear active state — hover previews, otherwise the locked/cycled chapter */
  const featured = hoverIdx !== null ? hoverIdx : active;
  const spin = (s?: string) => (reduced || !s ? undefined : s);
  const machineOn = featured !== null;

  return (
    <div className="relative" style={{ aspectRatio: "560 / 640" }} onMouseLeave={onLeaveRow}>
      <svg viewBox="0 0 560 640" className="absolute inset-0 w-full h-full">

        {/* ================= BACK LAYER — structural framework ================= */}
        <g>
          {/* recessed backplate with machined inner chamber */}
          <rect x="240" y="34" width="296" height="572" rx="4" fill="var(--machine-deep)" opacity="0.5"
            stroke="var(--machine-line)" strokeWidth="1.2" />
          <rect x="254" y="48" width="268" height="544" rx="3" fill="var(--machine-deep)" opacity="0.55"
            stroke="var(--machine-line)" strokeWidth="0.8" />
          {/* diagonal cross-bracing — structural, faint */}
          <line x1="254" y1="48" x2="522" y2="160" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.22" />
          <line x1="522" y1="480" x2="254" y2="592" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.22" />
          {/* backplate bolt grid */}
          {[[248, 42], [528, 42], [248, 598], [528, 598], [248, 320], [528, 320]].map(([bx, by], k) => (
            <g key={k}>
              <circle cx={bx} cy={by} r="2.6" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="0.9" />
              <line x1={bx - 1.4} y1={by} x2={bx + 1.4} y2={by} stroke="var(--machine-line)" strokeWidth="0.7" />
            </g>
          ))}
          {/* top cap + bottom base with feet */}
          <rect x="234" y="24" width="314" height="16" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
          <rect x="234" y="600" width="314" height="16" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
          <rect x="258" y="616" width="26" height="16" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
          <rect x="492" y="616" width="26" height="16" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
        </g>

        {/* ================= MIDDLE LAYER — shaft, rails, secondary gears ================= */}
        <g>
          {/* clutch guide rail — every company clutch travels along this */}
          <rect x="246" y="58" width="5" height="524" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="0.8" />
          {/* vertical transmission shaft — passes through three bearing blocks */}
          <rect x="296" y="44" width="9" height="552" fill="var(--machine-line)" opacity="0.9" />
          <line x1="300.5" y1="44" x2="300.5" y2="596" stroke="var(--machine-inv)" strokeWidth="1" opacity="0.22" />
          {!reduced && (
            <line x1="300.5" y1="44" x2="300.5" y2="596" stroke="var(--machine-inv)" strokeWidth="1.6" opacity="0.4" className="shaft-flow" />
          )}
          {[120, 330, 520].map((by) => (
            <g key={by}>
              <rect x="284" y={by - 7} width="33" height="14" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <circle cx="289" cy={by} r="2" fill="var(--machine-line)" />
              <circle cx="312" cy={by} r="2" fill="var(--machine-line)" />
            </g>
          ))}
          {/* secondary gear cluster — meshed, opposite directions */}
          <Gear cx={352} cy={150} r={24} teeth={10} spin={spin("gear-ccw")} dur="16s" />
          <Gear cx={326} cy={182} r={13} teeth={7} spin={spin("gear-cw")} dur="9s" />
          {/* tension spring under the top cap */}
          <g className={spin("spring-stretch")} style={{ transformOrigin: "380px 52px" }}>
            <path d="M380 52 q6 -7 12 0 q6 7 12 0 q6 -7 12 0 q6 7 12 0 q6 -7 12 0" fill="none"
              stroke="var(--machine-line)" strokeWidth="1.6" />
            <rect x="374" y="48" width="6" height="8" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="0.9" />
            <rect x="440" y="48" width="6" height="8" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="0.9" />
          </g>
          {/* counterweight pulley — lower left of the machine */}
          <line x1="266" y1="556" x2="266" y2="470" stroke="var(--machine-line)" strokeWidth="1.2" />
          <g className={spin("gear-cw")} dur="14s" style={{ animationDuration: "14s" }}>
            <circle cx="266" cy="556" r="15" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
            {[0, 90, 180, 270].map((d) => (
              <line key={d} x1="266" y1="544" x2="266" y2="568" stroke="var(--machine-line)" strokeWidth="1.1" transform={`rotate(${d} 266 556)`} />
            ))}
            <circle cx="266" cy="556" r="3" fill="var(--machine-line)" />
          </g>
          <g className={spin("valve-wiggle")} style={{ transformOrigin: "266px 470px", animationDuration: "5s" }}>
            <rect x="259" y="462" width="14" height="16" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
          </g>
          {/* crank wheel + rod — shaft rotation feeds the clock core */}
          <g className={spin("gear-cw")} style={{ animationDuration: "9s" }}>
            <circle cx="316" cy="330" r="11" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
            {[0, 120, 240].map((d) => (
              <line key={d} x1="316" y1="321" x2="316" y2="339" stroke="var(--machine-line)" strokeWidth="1.2" transform={`rotate(${d} 316 330)`} />
            ))}
            <circle cx="316" cy="330" r="2.6" fill={machineOn ? "var(--machine-crimson-hot)" : "var(--machine-line)"} style={{ transition: "fill .4s ease" }} />
          </g>
          <line x1="316" y1="330" x2="336" y2="330" stroke="var(--machine-line)" strokeWidth="3.6" strokeLinecap="round" />
        </g>

        {/* ================= COMPANY LINKAGES — hinge → arm → gear → clutch → shaft =================
            Drawn between the middle and front layers: the arm passes UNDER the
            front frame rail, so it visibly enters the machine housing. */}
        {companies.map((co, i) => {
          const cy = ROWS[i];
          const engaged = i === featured;
          const isLocked = locked && engaged;
          return (
            <g key={co.id + "-link"}>
              {/* hinge bracket — mounted on the plate edge */}
              <rect x="158" y={cy - 13} width="9" height="10" rx="1.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
              <rect x="158" y={cy + 3} width="9" height="10" rx="1.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
              <circle cx="162.5" cy={cy} r="1.8" fill={engaged ? "var(--machine-crimson-hot)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }} />
              {/* outer sleeve — fixed to the hinge */}
              <rect x="168" y={cy - 5} width="36" height="10" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.2" />
              {/* telescoping rod + joint + drive gear — extends with a weighted overshoot */}
              <g style={{
                transform: engaged ? "translateX(0)" : "translateX(-44px)",
                transition: reduced ? "none"
                  : engaged ? "transform .5s cubic-bezier(.32,1.16,.42,1) .1s" : "transform .4s cubic-bezier(.5,0,.6,1) .2s",
              }}>
                <rect x="198" y={cy - 3} width="50" height="6" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="0.9" />
                <circle cx="248" cy={cy} r="5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                <g className={spin("gear-cw-fast")} style={{ animationDuration: engaged ? "2.2s" : "30s" }}>
                  {Array.from({ length: 8 }).map((_, t) => {
                    const a = (t / 8) * Math.PI * 2;
                    return (
                      <rect key={t} x="-2.2" y="-15" width="4.4" height="5"
                        transform={`translate(${258 + 13 * Math.cos(a)} ${cy + 13 * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
                        fill={engaged ? "var(--machine-crimson-hot)" : "var(--machine-deep)"} stroke="var(--machine-line)" strokeWidth="0.9"
                        style={{ transition: "fill .4s ease" }} />
                    );
                  })}
                  <circle cx="258" cy={cy} r="10.5" fill={engaged ? "var(--machine-crimson-hot)" : "var(--machine-deep)"}
                    stroke="var(--machine-line)" strokeWidth="1.3" style={{ transition: "fill .4s ease" }} />
                  <circle cx="258" cy={cy} r="3.4" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
                </g>
              </g>
              {/* dog-tooth clutch — slides into the transmission shaft, then teeth seat */}
              <g style={{
                transform: engaged ? "translateX(0)" : "translateX(-30px)",
                transition: reduced ? "none"
                  : engaged ? "transform .42s cubic-bezier(.3,.9,.3,1) .3s" : "transform .32s cubic-bezier(.5,0,.6,1) .05s",
              }}>
                <rect x="272" y={cy - 9} width="20" height="18" rx="2" fill="var(--machine-plate)"
                  stroke={engaged ? "var(--machine-crimson-hot)" : "var(--machine-line)"} strokeWidth="1.3" style={{ transition: "stroke .35s ease" }} />
                <g style={{
                  transform: engaged ? "translateX(6px)" : "translateX(0)",
                  transition: reduced ? "none" : `transform .18s ease-out ${engaged ? ".46s" : "0s"}`,
                }}>
                  {[0, 1, 2].map((k) => (
                    <rect key={k} x="292" y={cy - 7.5 + k * 6} width="7" height="4"
                      fill={engaged ? "var(--machine-crimson-hot)" : "var(--machine-line)"} style={{ transition: "fill .4s ease" }} />
                  ))}
                </g>
              </g>
              {/* crimson transmission channel + travelling signal — plate → clutch → shaft → core */}
              <path d={`M164 ${cy} L300 ${cy} L300 330 L334 330`} fill="none" stroke="var(--machine-crimson-hot)" strokeWidth="2"
                className={spin("channel-flow")}
                style={{ opacity: engaged && !reduced ? 0.9 : 0, transition: `opacity .3s ease ${engaged ? ".5s" : "0s"}` }} />
              {engaged && !reduced && (
                <circle r="3.4" fill="var(--machine-crimson-hot)">
                  <animateMotion dur="1.8s" repeatCount="indefinite" path={`M164 ${cy} L300 ${cy} L300 330 L334 330`} />
                </circle>
              )}
            </g>
          );
        })}

        {/* ================= FRONT LAYER — frame rails (arms pass beneath them) ================= */}
        <rect x="234" y="24" width="9" height="592" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.3" />
        <rect x="539" y="24" width="9" height="592" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.3" />

        {/* ================= FRONT — top clockwork zone: escapement + balance ================= */}
        <g>
          {/* crown wheel + pallet anchor — the tick mechanism */}
          <Gear cx={300} cy={96} r={22} teeth={10} spin={spin("gear-ccw")} dur="30s" fill="var(--machine-deep)" />
          <g className={spin("escapement")} style={{ transformOrigin: "300px 70px" }}>
            <path d="M288 70 L300 62 L312 70 M300 62 L300 52" fill="none" stroke="var(--machine-line)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="288" cy="70" r="2" fill="var(--machine-crimson-hot)" />
            <circle cx="312" cy="70" r="2" fill="var(--machine-line)" />
          </g>
          <circle cx="300" cy="96" r="3.4" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
          {/* fast input pinion meshing with the crown wheel (opposite direction) */}
          <Gear cx={334} cy={86} r={12} teeth={7} spin={spin("gear-cw")} dur="8s" />
          {/* balance wheel — continuous oscillation */}
          <g className={spin("balance")} style={{ transformOrigin: "472px 110px" }}>
            <circle cx="472" cy="110" r="26" fill="none" stroke="var(--machine-line)" strokeWidth="2.4" />
            <line x1="472" y1="86" x2="472" y2="134" stroke="var(--machine-line)" strokeWidth="1.6" />
            <line x1="448" y1="110" x2="496" y2="110" stroke="var(--machine-line)" strokeWidth="1.6" />
            <circle cx="472" cy="110" r="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
          </g>
          <path d="M460 110 a12 12 0 0 1 24 0" fill="none" stroke="var(--machine-line)" strokeWidth="0.9" opacity="0.6" />
          <rect x="498" y="104" width="24" height="12" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
          {/* pressure gauge */}
          <g>
            <circle cx="516" cy="212" r="15" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
            {[-60, -30, 0, 30, 60].map((d) => (
              <line key={d} x1="516" y1="200" x2="516" y2="203.5" stroke="var(--machine-inv)" strokeWidth="1" opacity="0.7" transform={`rotate(${d} 516 212)`} />
            ))}
            <line x1="516" y1="212" x2="516" y2="202" stroke="var(--machine-crimson-hot)" strokeWidth="1.6" strokeLinecap="round"
              className={spin("valve-wiggle")} style={{ transformOrigin: "516px 212px", animationDuration: "3.2s" }} />
            <circle cx="516" cy="212" r="2" fill="var(--machine-line)" />
          </g>
        </g>

        {/* ================= FRONT — CENTRAL CLOCK / POWER CORE ================= */}
        <g>
          {/* physical depth shadow */}
          <circle cx={CORE.x + 3} cy={CORE.y + 4} r="101" fill="var(--machine-deep)" opacity="0.55" />
          {/* rotating toothed ring — the main wheel */}
          <g className={spin("gear-cw")} style={{ animationDuration: "80s" }}>
            {Array.from({ length: 24 }).map((_, t) => {
              const a = (t / 24) * Math.PI * 2;
              return (
                <rect key={t} x="-6" y="-109" width="12" height="15"
                  transform={`translate(${CORE.x + 100 * Math.cos(a)} ${CORE.y + 100 * Math.sin(a)}) rotate(${(a * 180) / Math.PI})`}
                  fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
              );
            })}
            <circle cx={CORE.x} cy={CORE.y} r="92" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="2" />
          </g>
          {/* dial face */}
          <circle cx={CORE.x} cy={CORE.y} r="82" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.5" />
          {/* 60 calibration ticks — majors every 5 */}
          {Array.from({ length: 60 }).map((_, t) => {
            const a = (t / 60) * Math.PI * 2;
            const major = t % 5 === 0;
            const r1 = major ? 70 : 74, r2 = 78;
            return (
              <line key={t}
                x1={CORE.x + r1 * Math.cos(a)} y1={CORE.y + r1 * Math.sin(a)}
                x2={CORE.x + r2 * Math.cos(a)} y2={CORE.y + r2 * Math.sin(a)}
                stroke="var(--machine-inv)" strokeWidth={major ? 1.6 : 0.7} opacity={major ? 0.8 : 0.45} />
            );
          })}
          {/* roman fragments */}
          {[["XII", 0], ["III", 90], ["VI", 180], ["IX", 270]].map(([rn, d]) => {
            const a = ((d as number) * Math.PI) / 180;
            return (
              <text key={rn as string} x={CORE.x + 58 * Math.sin(a)} y={CORE.y - 58 * Math.cos(a) + 4} textAnchor="middle"
                className="f-mono" fontSize="10.5" letterSpacing="1" fill="var(--machine-inv)" opacity="0.85">{rn}</text>
            );
          })}
          {/* counter-rotating inner ring */}
          <g className={spin("gear-ccw")} style={{ animationDuration: "60s" }}>
            <circle cx={CORE.x} cy={CORE.y} r="46" fill="none" stroke="var(--machine-line)" strokeWidth="1.2" strokeDasharray="7 6" />
            <circle cx={CORE.x + 46} cy={CORE.y} r="2.4" fill="var(--machine-line)" />
          </g>
          {/* clock hands — independent, mechanically slow */}
          <g className={spin("gear-cw")} style={{ animationDuration: "180s" }}>
            <line x1={CORE.x} y1={CORE.y + 8} x2={CORE.x} y2={CORE.y - 38} stroke="var(--machine-inv)" strokeWidth="4" strokeLinecap="round" />
          </g>
          <g className={spin("gear-cw")} style={{ animationDuration: "30s" }}>
            <line x1={CORE.x} y1={CORE.y + 10} x2={CORE.x} y2={CORE.y - 60} stroke="var(--machine-inv)" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
            <circle cx={CORE.x} cy={CORE.y - 60} r="2.6" fill="var(--machine-crimson-hot)" />
          </g>
          {/* hub + living core — the soulpunk heartbeat */}
          <circle cx={CORE.x} cy={CORE.y} r="10" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.5" />
          <circle cx={CORE.x} cy={CORE.y} r="4.6" fill="var(--machine-crimson-hot)" className={spin("core-beat")} />
          {/* engagement pulse — fires each time a chapter plugs in */}
          {!reduced && (
            <circle key={featured} cx={CORE.x} cy={CORE.y} r="22" fill="none" stroke="var(--machine-crimson-hot)" strokeWidth="2.4"
              className="core-engage" />
          )}
        </g>

        {/* ================= FRONT — bottom transmission zone: gear reduction + pistons ================= */}
        <g>
          {/* meshed reduction train — large slow → medium → small fast, alternating direction */}
          <Gear cx={300} cy={470} r={46} teeth={14} spin={spin("gear-ccw")} dur="22s" fill="var(--machine-plate)" />
          <Gear cx={348} cy={508} r={20} teeth={9} spin={spin("gear-cw")} dur="10s" />
          <Gear cx={382} cy={528} r={12} teeth={7} spin={spin("gear-ccw")} dur="6s" />
          {/* twin pistons — actuate on the crank */}
          {[452, 490].map((px, k) => (
            <g key={px}>
              <rect x={px - 9} y="520" width="18" height="34" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
              <rect x={px - 3} y="506" width="6" height="20" fill="var(--machine-line)" className={spin("piston")} style={{ animationDelay: `${k * 0.9}s` }} />
              <rect x={px - 7} y="500" width="14" height="7" rx="2" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" />
              <circle cx={px} cy="562" r="2" fill="var(--machine-line)" />
            </g>
          ))}
          {/* lever from the piston bank to the reduction gear */}
          <line x1="443" y1="524" x2="400" y2="512" stroke="var(--machine-line)" strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="443" cy="524" r="3.4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
        </g>

        {/* ================= COMPANY NAMEPLATES — name + index ONLY, machined =================
            Hover = physical material inversion (black ⇄ off-white), NEVER a red card.
            Crimson stays a tiny activation accent: lamp, hinge pin, lock latch. */}
        {companies.map((co, i) => {
          const cy = ROWS[i];
          const label = co.name === "PREMA SAI DESIGNERS" ? "PSD" : co.name;
          const engaged = i === featured;
          const isLocked = locked && engaged;
          return (
            <g key={co.id} onMouseEnter={() => onHover(i)} onClick={() => onPick(i)} className="cursor-pointer">
              {/* idle micro-suspension breathing (parked plates only) */}
              <g className={!reduced && !engaged ? "plate-breathe" : undefined} style={{ animationDelay: `${i * 0.8}s` }}>
                <g style={{
                  transform: engaged ? "translateX(9px)" : "translateX(0)",
                  opacity: engaged || featured === null ? 1 : 0.88,
                  transition: reduced ? "none" : "transform .45s cubic-bezier(.3,.9,.3,1.08), opacity .4s ease",
                }}>
                  {/* depth shadow */}
                  <polygon
                    points={`16,${cy - 30} 152,${cy - 30} 164,${cy - 18} 164,${cy + 18} 152,${cy + 30} 16,${cy + 30} 16,${cy - 24}`}
                    fill="var(--machine-deep)" opacity="0.5" transform="translate(3 4)" />
                  {/* machined plate — chamfered toward the hinge */}
                  <polygon
                    points={`12,${cy - 34} 150,${cy - 34} 162,${cy - 22} 162,${cy + 22} 150,${cy + 34} 12,${cy + 34} 12,${cy - 28}`}
                    fill={engaged ? "var(--machine-inv)" : "var(--machine-plate)"}
                    stroke={isLocked ? "var(--machine-crimson-hot)" : engaged ? "var(--machine-line)" : "var(--machine-line)"}
                    strokeWidth={isLocked ? 2 : 1.4}
                    style={{ transition: "fill .4s ease, stroke .4s ease" }} />
                  {/* recessed centre panel */}
                  <rect x="20" y={cy - 26} width="126" height="52" rx="2"
                    fill={engaged ? "rgba(34,35,40,0.08)" : "rgba(255,255,255,0.06)"}
                    stroke={engaged ? "rgba(34,35,40,0.28)" : "rgba(255,255,255,0.14)"} strokeWidth="0.8"
                    style={{ transition: "all .4s ease" }} />
                  {/* mounting screws */}
                  {([[18, cy - 28], [18, cy + 28], [144, cy - 28], [144, cy + 28]] as const).map(([sx, sy], k) => (
                    <g key={k}>
                      <circle cx={sx} cy={sy} r="2.4" fill={engaged ? "rgba(34,35,40,0.25)" : "var(--machine-deep)"} stroke="var(--machine-line)" strokeWidth="0.9" />
                      <line x1={sx - 1.3} y1={sy} x2={sx + 1.3} y2={sy} stroke="var(--machine-line)" strokeWidth="0.7" />
                    </g>
                  ))}
                  {/* tiny technical index */}
                  <text x="26" y={cy - 12} className="f-mono" fontSize="9" letterSpacing="1.6" fontWeight={600}
                    fill={engaged ? "var(--machine-crimson-hot)" : "var(--machine-line)"} style={{ transition: "fill .4s ease" }}>
                    {String(i + 1).padStart(2, "0")}
                  </text>
                  {/* company name — the identity of the node */}
                  <text x="26" y={cy + 10} className="f-tech" fontSize="14" fontWeight="700" letterSpacing="1"
                    fill={engaged ? "var(--machine-plate)" : "var(--machine-inv)"} style={{ transition: "fill .4s ease" }}>
                    {label}
                  </text>
                  {/* status lamp */}
                  <circle cx="138" cy={cy - 19} r="2.6"
                    fill={isLocked ? "var(--machine-crimson-hot)" : engaged ? "var(--machine-crimson-hot)" : "var(--machine-line)"}
                    className={engaged && !isLocked && !reduced ? "live-blink" : undefined}
                    style={{ transition: "fill .35s ease" }} />
                  {/* lock latch — only when this chapter is locked */}
                  {isLocked && (
                    <g>
                      <rect x="112" y={cy - 42} width="38" height="10" rx="1.5" fill="var(--machine-crimson-hot)" />
                      <text x="117" y={cy - 34.5} className="f-mono" fontSize="6.5" letterSpacing="1.4" fontWeight={700} fill="var(--machine-inv)">LOCK</text>
                    </g>
                  )}
                </g>
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

  /* hover = mechanical preview + Career Info follows · click = lock · second click unlocks */
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
     ~450ms into the engagement, then the whole machine settles. */
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
                VERTICAL CLOCKWORK TRANSMISSION — HOVER TO ENGAGE · CLICK TO LOCK
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
