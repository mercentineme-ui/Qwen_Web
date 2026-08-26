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

/* ================= MECHANICAL CASCADE × VERTICAL CLOCKWORK TRANSMISSION =================
   Four machined company nameplates dock on the LEFT of one tall vertical
   clockwork transmission. Each connects through hinge → articulated rod →
   drive gear → dog clutch into the main shaft. The featured chapter
   physically extends, its clutch bites the shaft and a crimson signal runs
   plate → clutch → shaft → clock core while the dossier swaps mid-handoff.
   Hover = preview + Career Info follows · click = lock · the 20s cycle
   performs the same physical declutch → retract → align → engage. */

const PLATE_CY = [110, 240, 370, 500];
const SHAFT_X = 300;

function Gear({ cx, cy, r, teeth, spin, dur, fill = "var(--machine-deep)", stroke = "var(--machine-line)" }: {
  cx: number; cy: number; r: number; teeth: number; spin?: string; dur?: string; fill?: string; stroke?: string;
}) {
  return (
    <g>
      {/* machined edge highlight — fixed upper-left light catch on a raised face */}
      <path d={`M${cx - r * 0.62} ${cy - r * 0.42} A${r * 0.75} ${r * 0.75} 0 0 1 ${cx + r * 0.12} ${cy - r * 0.72}`}
        fill="none" stroke="var(--machine-inv)" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
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
    </g>
  );
}

function Shadow({ cx, cy, rx, ry = 5 }: { cx: number; cy: number; rx: number; ry?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#000" opacity="0.22" />;
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
  /* the engaged machine runs hotter */
  const hot = !reduced;
  const dDrive = featured >= 0 && hot ? "34s" : "48s";

  return (
    <div className="relative" style={{ aspectRatio: "560 / 640" }} onMouseLeave={onLeaveRow}>
      <svg viewBox="0 0 560 640" className="absolute inset-0 w-full h-full">
        {/* ============ BACK LAYER — structural framework ============ */}
        <g>
          <rect x="250" y="34" width="298" height="572" rx="10" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
          {/* machined surface variation */}
          <rect x="250" y="34" width="298" height="572" rx="10" fill="url(#mcGrain)" opacity="0.5" />
          <defs>
            <pattern id="mcGrain" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="7" stroke="#000" strokeWidth="0.7" opacity="0.14" />
            </pattern>
          </defs>
          {/* recessed inner panel */}
          <rect x="262" y="46" width="274" height="548" rx="7" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1" opacity="0.96" />
          {/* bolt grid on the frame */}
          {[52, 320, 588].map((by) => [258, 540].map((bx) => (
            <g key={`${bx}-${by}`}>
              <circle cx={bx} cy={by} r="3.4" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
              <line x1={bx - 1.8} y1={by} x2={bx + 1.8} y2={by} stroke="var(--machine-deep)" strokeWidth="0.8" />
            </g>
          )))}
          {/* precision scribe outline */}
          <rect x="267" y="51" width="264" height="538" rx="5" fill="none" stroke="var(--machine-inv)" strokeWidth="0.7" opacity="0.22" />
          {/* cross braces */}
          <line x1="262" y1="180" x2="536" y2="180" stroke="var(--machine-line)" strokeWidth="1" opacity="0.35" />
          <line x1="262" y1="310" x2="536" y2="310" stroke="var(--machine-line)" strokeWidth="1" opacity="0.35" />
          <line x1="262" y1="440" x2="536" y2="440" stroke="var(--machine-line)" strokeWidth="1" opacity="0.35" />
        </g>

        {/* ============ MID LAYER — shaft, bearings, gear train, spring, counterweight ============ */}
        <g>
          {/* main vertical drive shaft passing BEHIND the gears */}
          <rect x={SHAFT_X - 5} y="48" width="10" height="546" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
          <line x1={SHAFT_X - 2} y1="52" x2={SHAFT_X - 2} y2="590" stroke="var(--machine-inv)" strokeWidth="0.8" opacity="0.25" />
          {featured >= 0 && hot && (
            <line x1={SHAFT_X} y1="60" x2={SHAFT_X} y2="586" stroke="var(--crimson)" strokeWidth="1.6" opacity="0.5" className="shaft-flow" />
          )}
          {/* bearing housings where the shaft passes through */}
          {[180, 310, 440].map((by) => (
            <g key={by}>
              <rect x={SHAFT_X - 11} y={by - 8} width="22" height="16" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <circle cx={SHAFT_X - 7} cy={by} r="1.4" fill="var(--machine-inv)" opacity="0.5" />
              <circle cx={SHAFT_X + 7} cy={by} r="1.4" fill="var(--machine-inv)" opacity="0.5" />
            </g>
          ))}
          {/* input coupling gears on the shaft — one per company, mesh each drive gear into the main shaft */}
          {PLATE_CY.map((cy, i) => {
            const on = i === featured;
            return (
              <Gear key={`coup-${i}`} cx={SHAFT_X} cy={cy + 24} r={15} teeth={9} spin={spin("gear-cw")} dur={on ? "2.4s" : "13s"}
                fill={on ? "var(--machine-line)" : "var(--machine-deep)"} stroke={on ? "var(--crimson)" : "var(--machine-line)"} />
            );
          })}

          {/* ---- HERO 01: big intermediate gear train (center) ---- */}
          <Shadow cx={424} cy={322} rx={54} ry={6} />
          {/* connecting rod: shaft → big gear */}
          <line x1={SHAFT_X + 6} y1="322" x2="374" y2="322" stroke="var(--machine-line)" strokeWidth="7" strokeLinecap="round" />
          <line x1={SHAFT_X + 6} y1="322" x2="374" y2="322" stroke="var(--machine-inv)" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
          <circle cx={SHAFT_X + 6} cy="322" r="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
          <Gear cx={424} cy={322} r={52} teeth={18} spin={spin("gear-ccw")} dur={featured >= 0 ? "14s" : "26s"} fill="var(--machine-line)" />
          {/* meshed satellites — opposite direction, faster */}
          <Gear cx={372} cy={270} r={18} teeth={10} spin={spin("gear-cw")} dur="8s" />
          <Gear cx={478} cy={276} r={14} teeth={9} spin={spin("gear-cw")} dur="6.5s" />
          <Gear cx={478} cy={372} r={16} teeth={10} spin={spin("gear-cw")} dur="7s" />

          {/* ---- HERO 02: crank + connecting rod + piston (crank-fed) ---- */}
          <g className={spin("gear-cw")} style={{ animationDuration: featured >= 0 ? "2.2s" : "4.5s", transformOrigin: "424px 322px", transformBox: "view-box" }}>
            <line x1="424" y1="322" x2="424" y2="288" stroke="var(--machine-deep)" strokeWidth="6" strokeLinecap="round" />
            <circle cx="424" cy="288" r="4.5" fill="var(--crimson)" stroke="var(--machine-deep)" strokeWidth="1.2" />
          </g>
          <line x1="424" y1="374" x2="424" y2="420" stroke="var(--machine-line)" strokeWidth="3" strokeLinecap="round" />
          <rect x="410" y="414" width="28" height="58" rx="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
          <line x1="414" y1="420" x2="414" y2="466" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.5" />
          <g className={spin("piston")} style={{ animationDuration: featured >= 0 ? "1.1s" : "2.2s" }}>
            <rect x="415" y="420" width="18" height="12" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
            <line x1="424" y1="432" x2="424" y2="456" stroke="var(--machine-line)" strokeWidth="3.4" strokeLinecap="round" />
          </g>

          {/* ---- HERO 03: pressure gauge — needle responds to activity ---- */}
          <g>
            <circle cx="508" cy="330" r="20" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
            {[-60, -30, 0, 30, 60].map((a) => (
              <line key={a} x1="508" y1="314" x2="508" y2="318" stroke="var(--machine-inv)" strokeWidth="1" opacity="0.7" transform={`rotate(${a} 508 330)`} />
            ))}
            <g className={spin("valve-wiggle")} style={{ animationDuration: featured >= 0 ? "1.4s" : "3s", transformOrigin: "508px 330px", transformBox: "view-box" }}>
              <line x1="508" y1="332" x2="508" y2="316" stroke="var(--crimson)" strokeWidth="1.6" strokeLinecap="round" />
            </g>
            <circle cx="508" cy="330" r="2.4" fill="var(--machine-line)" />
          </g>

          {/* tension spring */}
          <g className={spin("spring-stretch")} style={{ transformOrigin: "352px 420px", transformBox: "view-box" }}>
            <path d="M330 420 h6 l4 7 5 -14 5 14 5 -14 5 14 4 -7 h8" fill="none" stroke="var(--machine-line)" strokeWidth="1.6" />
          </g>

          {/* ratchet + pawl */}
          <Gear cx={352} cy={480} r={16} teeth={12} spin={spin("gear-cw")} dur="10s" fill="var(--machine-deep)" />
          <line x1="352" y1="462" x2="363" y2="451" stroke="var(--machine-line)" strokeWidth="2.4" strokeLinecap="round"
            className={spin("valve-wiggle")} style={{ transformOrigin: "352px 462px", transformBox: "view-box", animationDuration: "1.8s" }} />

          {/* filler meshed gear pairs — keep the chamber alive in the gaps */}
          <Gear cx={352} cy={148} r={12} teeth={8} spin={spin("gear-cw")} dur="7s" />
          <Gear cx={376} cy={166} r={9} teeth={7} spin={spin("gear-ccw")} dur="5s" />
          <Gear cx={508} cy={216} r={13} teeth={9} spin={spin("gear-ccw")} dur="8s" />
          <Gear cx={528} cy={236} r={9} teeth={7} spin={spin("gear-cw")} dur="5.5s" />

          {/* toothed rack along the right inner edge */}
          {Array.from({ length: 12 }).map((_, k) => (
            <rect key={k} x="529" y={140 + k * 30} width="5" height="16" fill="var(--machine-line)" opacity="0.65" />
          ))}
        </g>

        {/* ============ TOP — escapement + balance wheel + crown ============ */}
        <g>
          <Shadow cx={SHAFT_X} cy={94} rx={26} ry={4} />
          <rect x={SHAFT_X - 10} y="30" width="20" height="10" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
          <Gear cx={SHAFT_X} cy={66} r={15} teeth={10} spin={spin("gear-ccw")} dur="14s" fill="var(--machine-line)" />
          <g className={spin("escapement")} style={{ transformOrigin: `${SHAFT_X}px 47px`, transformBox: "view-box" }}>
            <path d={`M${SHAFT_X - 9} 52 L${SHAFT_X} 41 L${SHAFT_X + 9} 52`} fill="none" stroke="var(--machine-inv)" strokeWidth="2" strokeLinecap="round" />
          </g>
          {/* balance wheel — the machine's heartbeat */}
          <g className={spin("balance")} style={{ transformOrigin: "362px 70px", transformBox: "view-box" }}>
            <circle cx="362" cy="70" r="15" fill="none" stroke="var(--machine-line)" strokeWidth="2.4" />
            <line x1="349" y1="70" x2="375" y2="70" stroke="var(--machine-line)" strokeWidth="1.6" />
            <circle cx="362" cy="70" r="3" fill="var(--crimson)" />
          </g>
          <path d="M347 70 a15 15 0 0 1 30 0" fill="none" stroke="var(--machine-line)" strokeWidth="0.8" opacity="0.5" strokeDasharray="2 3" />
        </g>

        {/* ============ BOTTOM — gear reduction + piston bank + central clock drive ============ */}
        <g>
          <Shadow cx={452} cy={622} rx={56} ry={6} />
          <Gear cx={SHAFT_X} cy={560} r={14} teeth={9} spin={spin("gear-ccw")} dur="7s" fill="var(--machine-line)" />
          <Gear cx={352} cy={572} r={22} teeth={12} spin={spin("gear-cw")} dur="11s" fill="var(--machine-line)" />
          {/* piston bank — crank-fed */}
          {[398, 426].map((px, k) => (
            <g key={px}>
              <rect x={px} y="468" width="20" height="66" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
              <g className={spin("piston")} style={{ animationDuration: featured >= 0 ? "1.6s" : "2.8s", animationDelay: `${k * 0.7}s` }}>
                <rect x={px + 3} y="474" width="14" height="12" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                <line x1={px + 10} y1="486" x2={px + 10} y2="512" stroke="var(--machine-line)" strokeWidth="2.6" strokeLinecap="round" />
              </g>
            </g>
          ))}
          {/* central clock drive — toothed wheel + clock face + hands */}
          <Gear cx={452} cy={560} r={54} teeth={20} spin={spin("gear-ccw")} dur={dDrive} fill="var(--machine-line)" />
          <circle cx="452" cy="560" r="40" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.6" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line key={i} x1="452" y1="524" x2="452" y2={i % 6 === 0 ? "530" : "527.5"} stroke="var(--machine-line)" strokeWidth={i % 6 === 0 ? 1.4 : 0.8}
              transform={`rotate(${i * 15} 452 560)`} opacity="0.85" />
          ))}
          {/* roman fragments */}
          <text x="452" y="541" textAnchor="middle" className="f-mono" fontSize="7" fill="var(--machine-inv)" opacity="0.85">XII</text>
          <text x="474" y="563" textAnchor="middle" className="f-mono" fontSize="7" fill="var(--machine-inv)" opacity="0.85">III</text>
          <text x="452" y="585" textAnchor="middle" className="f-mono" fontSize="7" fill="var(--machine-inv)" opacity="0.85">VI</text>
          <text x="430" y="563" textAnchor="middle" className="f-mono" fontSize="7" fill="var(--machine-inv)" opacity="0.85">IX</text>
          {/* hands — independent slow motion */}
          <g className={spin("gear-cw")} style={{ animationDuration: "90s" }}>
            <line x1="452" y1="560" x2="452" y2="534" stroke="var(--machine-inv)" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
          </g>
          <g className={spin("gear-cw")} style={{ animationDuration: "24s" }}>
            <line x1="452" y1="560" x2="452" y2="542" stroke="var(--machine-line)" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          {/* crimson core — beats, pulses on engage */}
          <g className={spin("core-beat")}>
            <circle cx="452" cy="560" r="7" fill="var(--crimson)" />
            <circle cx="452" cy="560" r="2.6" fill="var(--machine-inv)" />
          </g>
          <circle key={`engage-${featured}`} cx="452" cy="560" r="10" fill="none" stroke="var(--crimson)" strokeWidth="2"
            className={reduced ? undefined : "core-engage"} />
        </g>

        {/* ============ COMPANY DOCKING MODULES — all four on the LEFT ============ */}
        {companies.map((co, i) => {
          const cy = PLATE_CY[i];
          const label = co.name === "PREMA SAI DESIGNERS" ? "PSD" : co.name;
          const isFeat = i === featured;
          const isLock = i === active && locked;
          /* material inversion is fully theme-driven: light black→off-white, dark off-white→black */
          const plateFill = isFeat ? "var(--machine-inv)" : "var(--machine-plate)";
          const plateText = isFeat ? "var(--machine-plate)" : "var(--machine-inv)";
          const plateStroke = isFeat ? "var(--crimson)" : "var(--machine-line)";
          const ext = isFeat ? 1 : 0; /* connector extension 0..1 */

          return (
            <g key={co.id}
              onMouseEnter={() => onHover(i)}
              onClick={() => onPick(i)}
              className="cursor-pointer">
              {/* ---- connector: hinge → rod → drive gear → dog clutch ---- */}
              {/* hinge bracket on the plate edge */}
              <rect x="168" y={cy - 12} width="12" height="24" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
              <circle cx="174" cy={cy} r="3" fill={isFeat ? "var(--crimson)" : "var(--machine-line)"} stroke="var(--machine-line)" strokeWidth="1" style={{ transition: "fill .35s ease" }} />

              {/* idle tick lever — parked nodes stay subtly alive, not dead */}
              {!isFeat && !reduced && (
                <g className="valve-wiggle" style={{ transformOrigin: `166px ${cy + 22}px`, animationDuration: `${4.2 + i * 1.3}s`, animationDelay: `${i * 0.7}s` }}>
                  <line x1="166" y1={cy + 22} x2="166" y2={cy + 32} stroke="var(--machine-line)" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="166" cy={cy + 32} r="1.8" fill="var(--machine-line)" />
                </g>
              )}

              {/* articulated rod — telescopes outward when engaged */}
              <g style={{ transform: `translateX(${ext * 10}px)`, transition: reduced ? "none" : "transform .6s cubic-bezier(.32,1.16,.42,1) .08s" }}>
                <rect x="180" y={cy - 4.5} width="46" height="9" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                <rect x="222" y={cy - 3} width={26 + ext * 14} height="6" rx="2" fill={isFeat ? "var(--crimson)" : "var(--machine-line)"}
                  style={{ transition: reduced ? "none" : "width .6s cubic-bezier(.32,1.16,.42,1) .12s, fill .35s ease" }} />
                {/* rotating joint */}
                <circle cx="252" cy={cy} r="5.5" fill="var(--machine-deep)" stroke={isFeat ? "var(--crimson)" : "var(--machine-line)"} strokeWidth="1.3" style={{ transition: "stroke .35s ease" }} />
                <circle cx="252" cy={cy} r="1.8" fill="var(--machine-inv)" opacity="0.7" />
              </g>

              {/* drive gear — parked slow, engaged fast */}
              <g style={{ transform: `translateX(${ext * 12}px)`, transition: reduced ? "none" : "transform .55s cubic-bezier(.32,1.16,.42,1) .16s" }}>
                <Gear cx={268} cy={cy} r={13} teeth={8} spin={spin("gear-cw")} dur={isFeat ? "2.2s" : "12s"}
                  fill={isFeat ? "var(--machine-line)" : "var(--machine-deep)"} stroke={isFeat ? "var(--crimson)" : "var(--machine-line)"} />
              </g>

              {/* recessed clutch chamber in the machine wall — the clutch slides INTO it */}
              <rect x="278" y={cy - 18} width="27" height="36" rx="3" fill="rgba(0,0,0,0.28)" />
              <rect x="278" y={cy - 18} width="27" height="36" rx="3" fill="none" stroke="var(--machine-line)" strokeWidth="1" opacity="0.8" />
              <path d={`M279 ${cy + 15} h25`} stroke="var(--machine-inv)" strokeWidth="0.8" opacity="0.18" />

              {/* dog clutch — moving plate closes onto the fixed machine-side plate, teeth interlock, lock pin drops */}
              {/* fixed plate (machine side) with its own teeth */}
              <rect x="297" y={cy - 14} width="8" height="28" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
              {[0, 1, 2].map((k) => (
                <rect key={`ft-${k}`} x="292" y={cy - 10 + k * 8} width="5" height="4.4" rx="1" fill="var(--machine-line)" />
              ))}
              {/* moving plate */}
              <g style={{ transform: `translateX(${ext * 12}px)`, transition: reduced ? "none" : "transform .5s cubic-bezier(.3,.9,.3,1.1) .26s" }}>
                <rect x="281" y={cy - 13} width="9" height="26" rx="2"
                  fill={isFeat ? "var(--machine-line)" : "var(--machine-deep)"} stroke={isFeat ? "var(--crimson)" : "var(--machine-line)"} strokeWidth="1.1"
                  style={{ transition: "fill .35s ease, stroke .35s ease" }} />
                {[0, 1, 2].map((k) => (
                  <rect key={`mt-${k}`} x="290" y={cy - 6 + k * 8} width={ext * 6} height="4.4" rx="1"
                    fill={isFeat ? "var(--crimson)" : "var(--machine-line)"}
                    style={{ transition: reduced ? "none" : `width .45s cubic-bezier(.3,.9,.3,1.1) ${0.3 + k * 0.05}s, fill .35s ease` }} />
                ))}
              </g>
              {/* lock pin drops into place once engaged */}
              <g style={{ transform: `translateY(${isFeat ? 7 : -9}px)`, transition: reduced ? "none" : "transform .35s cubic-bezier(.3,1.5,.5,1) .55s" }}>
                <rect x="285.5" y={cy - 26} width="4" height="11" rx="1.5" fill={isFeat ? "var(--crimson)" : "var(--machine-line)"}
                  style={{ transition: "fill .35s ease" }} />
              </g>

              {/* crimson energy: rod → clutch → shaft → central drive */}
              {isFeat && hot && (
                <>
                  <line x1="182" y1={cy} x2="296" y2={cy} stroke="var(--crimson)" strokeWidth="1.8" className="channel-flow" opacity="0.9" />
                  <line x1={SHAFT_X} y1={cy} x2={SHAFT_X} y2="556" stroke="var(--crimson)" strokeWidth="1.8" className="channel-flow" opacity="0.7" />
                  <circle r="3.4" fill="var(--crimson)">
                    <animateMotion dur="1.6s" repeatCount="indefinite" path={`M182 ${cy} L296 ${cy} L${SHAFT_X} ${cy} L${SHAFT_X} 556 L398 556`} />
                  </circle>
                </>
              )}

              {/* ---- machined nameplate ---- */}
              <g className={spin("plate-breathe")} style={{ animationDelay: `${i * 0.8}s` }}>
                <Shadow cx={90} cy={cy + 42} rx={70} ry={5} />
                <rect x="12" y={cy - 36} width="156" height="72" rx="6"
                  fill={plateFill} stroke={plateStroke} strokeWidth={isFeat ? 2 : 1.3}
                  style={{ transition: "fill .4s ease, stroke .4s ease" }} />
                {/* recessed name area */}
                <rect x="20" y={cy - 28} width="140" height="56" rx="4" fill="none"
                  stroke="var(--machine-line)" strokeWidth="0.9" opacity="0.6" />
                {/* mounting points */}
                {[[22, cy - 26], [158, cy - 26], [22, cy + 26], [158, cy + 26]].map(([bx, by], k) => (
                  <g key={k}>
                    <circle cx={bx} cy={by} r="2.6" fill={isFeat ? "var(--machine-plate)" : "var(--machine-deep)"}
                      stroke="var(--machine-line)" strokeWidth="0.9" />
                    <line x1={bx - 1.4} y1={by} x2={bx + 1.4} y2={by} stroke="var(--machine-line)" strokeWidth="0.7" />
                  </g>
                ))}
                {/* technical index */}
                <text x="32" y={cy - 12} className="f-mono" fontSize="8.5" letterSpacing="1.6" fontWeight="600"
                  fill={isFeat ? "var(--crimson)" : "var(--machine-line)"} style={{ transition: "fill .35s ease" }}>
                  {String(i + 1).padStart(2, "0")}
                </text>
                {/* company name — medium-weight machined labeling, SAME weight active/inactive */}
                <text x="32" y={cy + 12} className="f-tech" fontSize={label.length > 9 ? 14.5 : 17} fontWeight="700" letterSpacing="1.1"
                  fill={plateText} style={{ transition: "fill .35s ease" }}>
                  {label}
                </text>
                {/* tiny status lamp */}
                <circle cx="150" cy={cy - 14} r="2.6" fill={isFeat ? "var(--crimson)" : "var(--machine-line)"}
                  className={isFeat && hot ? "live-blink" : undefined} style={{ transition: "fill .35s ease" }} />
                {/* lock latch */}
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

        {/* ============ FRONT LAYER — frame rails the arms pass beneath ============ */}
        <g>
          <rect x="246" y="34" width="8" height="572" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
          <rect x="544" y="34" width="8" height="572" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
          {[120, 320, 520].map((by) => (
            <g key={by}>
              <circle cx="250" cy={by} r="2.2" fill="var(--machine-line)" />
              <circle cx="548" cy={by} r="2.2" fill="var(--machine-line)" />
            </g>
          ))}
        </g>
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
                  active={active} hoverIdx={hoverIdx} locked={locked} reduced={reduced}
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
