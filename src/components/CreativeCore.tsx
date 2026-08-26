import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const C = 300;
const N = 9;

const LBL: { lines: [string, string]; side: "above" | "right" | "left" | "below" }[] = [
  { lines: ["CREATIVE", "DIRECTION"], side: "above" },
  { lines: ["GENERATIVE", "AI"], side: "right" },
  { lines: ["VISUAL", "DEVELOPMENT"], side: "right" },
  { lines: ["CINEMATIC", "STORYTELLING"], side: "right" },
  { lines: ["AI IMAGE +", "VIDEO"], side: "below" },
  { lines: ["CHARACTER", "DEVELOPMENT"], side: "below" },
  { lines: ["ENVIRONMENT", "DESIGN"], side: "left" },
  { lines: ["AI CREATIVE", "WORKFLOWS"], side: "left" },
  { lines: ["PROMPT", "ARCHITECTURE"], side: "left" },
];

function nodePos(i: number, r: number) {
  const deg = i * (360 / N);
  const rad = (deg * Math.PI) / 180;
  return { x: 50 + r * Math.sin(rad), y: 50 - r * Math.cos(rad), deg };
}

const wrap = (d: number) => ((d + 180) % 360 + 360) % 360 - 180;

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();

  const [autoIdx, setAutoIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const locked = lockedIdx !== null;
  const sel = hoverIdx ?? lockedIdx ?? autoIdx;
  const d = disciplines[sel];

  useEffect(() => {
    if (reduced || locked || hoverIdx !== null) return;
    const iv = window.setInterval(() => setAutoIdx((a) => (a + 1) % N), 20000);
    return () => clearInterval(iv);
  }, [reduced, locked, hoverIdx]);

  const pick = (i: number) => {
    if (locked && lockedIdx === i) { setLockedIdx(null); }
    else setLockedIdx(i);
  };

  /* pointer: smooth mechanical rotation toward the selected node + extension */
  const ptrG = useRef<SVGGElement>(null);
  const ptrExtG = useRef<SVGGElement>(null);
  const st = useRef({ rot: 0, rotV: 0, ext: 0, extV: 0, raf: 0, last: 0 });
  const selRef = useRef(sel);
  const hoverRef = useRef(hoverIdx);
  selRef.current = sel;
  hoverRef.current = hoverIdx;

  useEffect(() => {
    if (reduced) {
      const { deg } = nodePos(selRef.current, 0);
      ptrG.current?.setAttribute("transform", `rotate(${deg} ${C} ${C})`);
      ptrExtG.current?.setAttribute("transform", "translate(0 0)");
      return;
    }
    const loop = (t: number) => {
      const s = st.current;
      const dt = Math.min(0.045, s.last ? (t - s.last) / 1000 : 0.016);
      s.last = t;
      const target = nodePos(selRef.current, 0).deg;
      const dA = wrap(target - s.rot);
      s.rotV += (dA * 40 - s.rotV * 9) * dt;
      s.rot += s.rotV * dt;
      const extTarget = 1; /* always engaged toward the selected discipline */
      s.extV += ((extTarget - s.ext) * 60 - s.extV * 11) * dt;
      s.ext = Math.max(0, Math.min(1, s.ext + s.extV * dt));
      ptrG.current?.setAttribute("transform", `rotate(${s.rot.toFixed(2)} ${C} ${C})`);
      const lift = -14 * s.ext;
      ptrExtG.current?.setAttribute("transform", `translate(0 ${lift.toFixed(1)})`);
      s.raf = requestAnimationFrame(loop);
    };
    st.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.current.raf);
  }, [reduced]);

  const spin = (cls: string) => (reduced ? undefined : cls);

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="02 — WHAT I DO"
          title="CORE"
          desc="Nine disciplines, one practice — direction, generation and story held together by structured workflows. One machine powers all of them."
          meta="09 MODULES · ONE ENGINE"
        />

        <div className="mt-12 grid lg:grid-cols-[minmax(0,1.14fr)_minmax(0,352px)] gap-12 lg:gap-24 xl:gap-40 items-center">
          {/* ================= RADIAL CLOCKWORK CORE ================= */}
          <Reveal>
            <div className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">
                {/* outer housing */}
                <circle cx={C} cy={C} r={205} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="2" />
                <circle cx={C} cy={C} r={198} fill="none" stroke="var(--core-deep)" strokeWidth="6" />
                {/* bolts on housing */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i * 30 * Math.PI) / 180;
                  const x = C + 190 * Math.cos(a), y = C + 190 * Math.sin(a);
                  return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1" />;
                })}

                {/* rotating index ring (slow clockwise) */}
                <g className={spin("idx-ring-spin")}>
                  {Array.from({ length: 36 }).map((_, k) => {
                    const a = (k * 10 * Math.PI) / 180;
                    const x1 = C + 168 * Math.cos(a), y1 = C + 168 * Math.sin(a);
                    const x2 = C + (k % 3 === 0 ? 156 : 162) * Math.cos(a), y2 = C + (k % 3 === 0 ? 156 : 162) * Math.sin(a);
                    return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={k % 3 === 0 ? "var(--core-mid)" : "var(--core-line)"} strokeWidth={k % 3 === 0 ? 2 : 1} />;
                  })}
                  <circle cx={C} cy={C} r={172} fill="none" stroke="var(--core-line)" strokeWidth="1.2" />
                </g>

                {/* inner transmission ring (counter-clockwise) */}
                <g className={spin("core-spin-ccw")}>
                  <circle cx={C} cy={C} r={140} fill="none" stroke="var(--core-plate)" strokeWidth="10" />
                  {Array.from({ length: 24 }).map((_, i) => {
                    const a = (i * 15 * Math.PI) / 180;
                    const x = C + 140 * Math.cos(a), y = C + 140 * Math.sin(a);
                    return <rect key={i} x={x - 3} y={y - 3} width="6" height="6" fill="var(--core-mid)" transform={`rotate(${i * 15} ${x} ${y})`} />;
                  })}
                </g>

                {/* gear train */}
                <g className={spin("core-spin-slow")}>
                  <circle cx={C} cy={C} r={104} fill="none" stroke="var(--core-deep)" strokeWidth="8" />
                  {Array.from({ length: 18 }).map((_, i) => {
                    const a = (i * 20 * Math.PI) / 180;
                    const x = C + 104 * Math.cos(a), y = C + 104 * Math.sin(a);
                    return <rect key={i} x={x - 5} y={y - 4} width="10" height="8" fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="0.8" transform={`rotate(${i * 20} ${x} ${y})`} />;
                  })}
                </g>

                {/* central hub */}
                <circle cx={C} cy={C} r={64} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="1.5" />
                <g className={spin("core-spin-cw")}>
                  <circle cx={C} cy={C} r={48} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.2" />
                  {Array.from({ length: 12 }).map((_, i) => {
                    const a = (i * 30 * Math.PI) / 180;
                    const x = C + 48 * Math.cos(a), y = C + 48 * Math.sin(a);
                    return <rect key={i} x={x - 4} y={y - 3.5} width="8" height="7" fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth="0.8" transform={`rotate(${i * 30} ${x} ${y})`} />;
                  })}
                </g>

                {/* pointer — mechanical clock hand from center */}
                <g ref={ptrG}>
                  <g ref={ptrExtG}>
                    <polygon points={`${C},${C - 188} ${C + 9},${C - 150} ${C + 4},${C - 60} ${C - 4},${C - 60} ${C - 9},${C - 150}`}
                      fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth="1.3" />
                    <line x1={C - 2.5} y1={C - 70} x2={C - 1.5} y2={C - 148} stroke="var(--core-inv)" strokeWidth="0.9" opacity="0.3" />
                    <polygon points={`${C},${C - 196} ${C + 6},${C - 178} ${C - 6},${C - 178}`} fill="var(--core-crimson)" />
                    <circle cx={C} cy={C - 176} r="2" fill="var(--core-inv)" />
                  </g>
                </g>

                {/* beating core center */}
                <g className={spin("core-beat")}>
                  <circle cx={C} cy={C} r={26} fill="var(--core-plate)" stroke="var(--core-crimson)" strokeWidth="2" />
                  <circle cx={C} cy={C} r={12} fill="var(--core-crimson)" />
                  <circle cx={C} cy={C} r={4} fill="var(--core-inv)" />
                </g>
              </svg>

              {/* ================= NINE DISCIPLINE NODES ================= */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                const { x, y } = nodePos(i, 44.5);
                const lb = LBL[i % LBL.length];
                const labelWrap =
                  lb.side === "above" ? "absolute -top-11 inset-x-0 flex flex-col items-center" :
                  lb.side === "below" ? "absolute -bottom-11 inset-x-0 flex flex-col items-center" :
                  lb.side === "left" ? "absolute right-full top-1/2 -translate-y-1/2 pr-3 flex flex-col items-end" :
                  "absolute left-full top-1/2 -translate-y-1/2 pl-3 flex flex-col items-start";

                /* Fix 04: normal = matte black / white icon (light) or matte white / black icon (dark).
                   Hover/active = crimson node + white icon, both themes. No bloom/glow. */
                const nodeFill = isActive || isHover ? "#e72241" : "var(--outer-bg)";
                const iconColor = isActive || isHover ? "#ddddd8" : "var(--outer-ink)";
                const nodeBorder = isActive || isHover
                  ? "1.5px solid #e72241"
                  : "1.5px solid color-mix(in srgb, var(--outer-ink) 30%, transparent)";

                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onClick={() => pick(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}>
                    <span className="relative grid place-items-center transition-all duration-300 mat-texture"
                      style={{
                        width: 74, height: 74,
                        clipPath: "polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px)",
                        backgroundColor: nodeFill,
                        color: iconColor,
                        border: nodeBorder,
                        transform: isHover && !isActive ? "translateY(-2px) scale(1.04)" : "none",
                      }}>
                      <Icon size={30} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${isActive || isHover ? "bg-[#e72241] text-[#ddddd8]" : ""}`}
                        style={isActive || isHover ? undefined : { background: "var(--outer-bg)", color: "var(--outer-ink)" }}>
                        {dis.num}
                      </span>
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-colors duration-300"
                        style={{ background: isActive || isHover ? "#ddddd8" : "color-mix(in srgb, var(--outer-ink) 40%, transparent)" }} />
                    </span>
                    <span className={`${labelWrap} pointer-events-none`}>
                      {lb.lines.map((ln) => (
                        <span key={ln} className={`f-tech font-bold text-[12px] tracking-[0.12em] leading-[1.3] whitespace-nowrap transition-colors duration-300 ${lb.side === "left" ? "text-right" : "text-left"}`}
                          style={{ color: isActive ? "var(--crimson-rough)" : "var(--ink2)" }}>
                          {ln}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}

              <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-8 h-px bg-[var(--line)]" />
                RADIAL ENGINE — CORE/{d.num}
                <span className="w-8 h-px bg-[var(--line)]" />
              </div>
            </div>
          </Reveal>

          {/* ================= DETAIL CARD ================= */}
          <Reveal delay={0.1}>
            <div className="mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 18%, transparent)" }}>
              <span className="absolute top-0 left-0 h-[3px] bg-[var(--crim-panel)] scan-pass" style={{ width: "42%" }} aria-hidden />
              <div key={d.id} className="career-wipe-in">
                <div className="flex items-center justify-between">
                  <span className="f-mono text-[11px] tracking-[0.3em]" style={{ color: "var(--crim-panel)" }}>{d.num} / 09</span>
                  <span className="f-mono text-[9px] tracking-[0.26em] flex items-center gap-2" style={{ color: "var(--m-sub)" }}>
                    <span className="w-1.5 h-1.5 bg-[var(--crim-panel)] live-blink" />
                    {hoverIdx !== null ? "PREVIEW" : locked ? "LOCKED" : "AUTO"}
                  </span>
                </div>
                <h3 className="f-display text-[clamp(1.6rem,2.6vw,2.3rem)] leading-tight mt-3" style={{ color: "var(--outer-ink)" }}>{d.name}</h3>
                <p className="mt-4 text-[13.5px] sm:text-[14px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: 0.92 }}>{d.blurb}</p>
                <div className="mt-6 flex flex-wrap gap-2.5">
                  {d.tags.map((t) => (
                    <span key={t} className="inline-block rounded-[6px] px-3 py-1.5 f-tech font-bold text-[10.5px] tracking-[0.14em]"
                      style={{ backgroundColor: "var(--outer-ink)", color: "var(--outer-bg)" }}>
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-6 pt-4 f-mono text-[9px] tracking-[0.24em] flex justify-between"
                  style={{ borderTop: "1px solid var(--m-line)", color: "var(--m-sub)" }}>
                  <span>HOVER — PREVIEW · CLICK — LOCK · AGAIN — RELEASE</span>
                  <span style={{ color: "var(--crim-panel)" }}>CORE/{d.num}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
