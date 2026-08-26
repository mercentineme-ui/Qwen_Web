import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const C = 300;
const N = 9;
const DEG = Math.PI / 180;

/* Discipline names, split into two clean lines (node shows ONLY the name). */
const SPLIT: [string, string][] = [
  ["CREATIVE", "DIRECTION"],
  ["GENERATIVE", "AI"],
  ["VISUAL", "DEVELOPMENT"],
  ["CINEMATIC", "STORYTELLING"],
  ["AI IMAGE +", "VIDEO"],
  ["CHARACTER", "DEVELOPMENT"],
  ["ENVIRONMENT", "DESIGN"],
  ["AI CREATIVE", "WORKFLOWS"],
  ["PROMPT", "ARCHITECTURE"],
];

/* which side of the chip the title label sits on (outward from the circle) */
const SIDE: ("above" | "right" | "below" | "left")[] = [
  "above", "right", "right", "right", "below", "below", "left", "left", "left",
];

/* ---- orbital radii (viewBox 600, centre 300) ---- */
const R_OUTER = 272; /* outer calibration orbit          */
const R_NODE = 204;  /* node ring (pct 34)               */
const R_SEG = 148;   /* segmented interactive ring       */
const R_INNER = 112; /* inner orbit                      */
const R_NUC = 58;    /* nucleus                          */
const SEG_COUNT = 24;

const angleOf = (i: number) => i * (360 / N);
const pt = (r: number, deg: number) => [C + r * Math.sin(deg * DEG), C - r * Math.cos(deg * DEG)] as const;
const pct = (i: number, r: number) => ({ x: 50 + r * Math.sin(angleOf(i) * DEG), y: 50 - r * Math.cos(angleOf(i) * DEG) });

const wrap = (d: number) => ((d + 180) % 360 + 360) % 360 - 180;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOutCubic = (x: number) => 1 - Math.pow(1 - x, 3);

/* arc path between two angles (0 = up, clockwise) */
const arcPath = (r: number, a0: number, a1: number) => {
  const [x0, y0] = pt(r, a0);
  const [x1, y1] = pt(r, a1);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};
/* stroke-dash values to reveal `deg` of arc on a circle of radius r */
const dashFor = (r: number, deg: number) => {
  const circ = 2 * Math.PI * r;
  const d = (deg / 360) * circ;
  return `${d.toFixed(1)} ${(circ - d).toFixed(1)}`;
};

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();

  /* selection — hover previews only; click locks; second click unlocks */
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const selected = lockedIdx;

  const hoverRef = useRef<number | null>(null);
  const lockRef = useRef<number | null>(null);
  hoverRef.current = hoverIdx;
  lockRef.current = lockedIdx;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  /* ---------- refs: orbital layers driven by rAF ---------- */
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitalG = useRef<SVGGElement>(null);
  const outerTicksG = useRef<SVGGElement>(null);
  const arcOuterG = useRef<SVGGElement>(null);
  const arcMidG = useRef<SVGGElement>(null);
  const arcInnerG = useRef<SVGGElement>(null);
  const dashRingG = useRef<SVGGElement>(null);
  const markerG = useRef<SVGGElement>(null);
  const pulseC = useRef<SVGCircleElement>(null);
  const glowC = useRef<SVGCircleElement>(null);
  const dotA = useRef<SVGCircleElement>(null);
  const dotB = useRef<SVGCircleElement>(null);
  const dotC = useRef<SVGCircleElement>(null);
  const segRefs = useRef<(SVGPathElement | null)[]>([]);
  const signalLine = useRef<SVGLineElement>(null);
  const signalDot = useRef<SVGCircleElement>(null);
  const nodeWrapRefs = useRef<(HTMLDivElement | null)[]>([]);

  const mouse = useRef({ x: 0, y: 0, in: false });
  const box = useRef({ cx: 0, cy: 0, w: 0, h: 0 });
  const sig = useRef({ idx: -1, t: 1 });
  const pulse = useRef({ p: 1, intensity: 0, next: 2.5 });
  const eng = useRef({
    t: 0, last: 0, raf: 0,
    outerTicks: 0, arcOuter: 0, arcMid: 0, arcInner: 0, dashRot: 0,
    dA: 0, dB: 120, dC: 240,
    markerAngle: 0, markerPresence: 0,
    recT: -1, lastTheme: "",
    prox: Array(N).fill(0),
  });

  const pick = (i: number) => {
    if (lockedIdx === i) {
      setLockedIdx(null);
      sig.current = { idx: -1, t: 1 };
    } else {
      setLockedIdx(i);
      sig.current = { idx: i, t: 0 };
      pulse.current.p = 0;
      pulse.current.intensity = 1;
    }
  };

  useEffect(() => {
    const e = eng.current;
    e.lastTheme = themeRef.current;

    const onMove = (ev: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      box.current = { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height };
      mouse.current.x = ev.clientX - box.current.cx;
      mouse.current.y = ev.clientY - box.current.cy;
      mouse.current.in = true;
    };
    const onLeave = () => { mouse.current.in = false; };
    const el = containerRef.current;
    el?.addEventListener("mousemove", onMove);
    el?.addEventListener("mouseleave", onLeave);

    const loop = (t: number) => {
      const dt = Math.min(0.05, e.last ? (t - e.last) / 1000 : 0.016);
      e.last = t; e.t += dt;
      const rm = reduced ? 0 : 1;

      /* theme recalibration — layers gently separate, opacity dips, materials swap, re-settle */
      if (themeRef.current !== e.lastTheme) { e.lastTheme = themeRef.current; e.recT = 0.0001; }
      let recal = 1;
      if (e.recT > 0) {
        e.recT += dt;
        recal = e.recT < 1 ? 1 - 0.55 * Math.sin(Math.PI * Math.min(1, e.recT)) : 1;
        if (e.recT >= 1) e.recT = -1;
      }
      orbitalG.current?.setAttribute("opacity", (0.35 + 0.65 * recal).toFixed(3));
      orbitalG.current?.setAttribute("transform",
        `translate(${C} ${C}) scale(${(1 + 0.03 * (1 - recal)).toFixed(4)}) translate(${-C} ${-C})`);

      /* ---- continuous ambient motion (multiple slow layers, never synchronized) ---- */
      e.outerTicks += dt * 2.4 * rm;
      e.arcOuter += dt * 3.6 * rm;
      e.arcMid -= dt * 6.5 * rm;
      e.arcInner += dt * 9.5 * rm;
      e.dashRot -= dt * 13 * rm;
      e.dA += dt * 4.5 * rm;
      e.dB -= dt * 8 * rm;
      e.dC += dt * 12.5 * rm;

      outerTicksG.current?.setAttribute("transform", `rotate(${(e.outerTicks % 360).toFixed(2)} ${C} ${C})`);
      arcOuterG.current?.setAttribute("transform", `rotate(${(e.arcOuter % 360).toFixed(2)} ${C} ${C})`);
      arcMidG.current?.setAttribute("transform", `rotate(${(e.arcMid % 360).toFixed(2)} ${C} ${C})`);
      arcInnerG.current?.setAttribute("transform", `rotate(${(e.arcInner % 360).toFixed(2)} ${C} ${C})`);
      dashRingG.current?.setAttribute("transform", `rotate(${(e.dashRot % 360).toFixed(2)} ${C} ${C})`);

      /* orbiting satellite dots */
      const setDot = (g: React.RefObject<SVGCircleElement>, r: number, a: number) => {
        const [x, y] = pt(r, a % 360);
        g.current?.setAttribute("cx", x.toFixed(1));
        g.current?.setAttribute("cy", y.toFixed(1));
      };
      setDot(dotA, R_OUTER, e.dA);
      setDot(dotB, R_SEG, e.dB);
      setDot(dotC, R_INNER, e.dC);

      /* ---- mouse field: focus angle + node proximity + cursor glow ---- */
      const m = mouse.current;
      const mAng = Math.atan2(m.x, -m.y) / DEG;
      let focus: number | null = null;
      if (hoverRef.current !== null) focus = angleOf(hoverRef.current);
      else if (lockRef.current !== null) focus = angleOf(lockRef.current);
      else if (m.in && !reduced) focus = mAng;

      /* segmented ring brightens toward the focus angle */
      for (let i = 0; i < SEG_COUNT; i++) {
        const segAng = i * (360 / SEG_COUNT) + 360 / SEG_COUNT / 2;
        let b = 0;
        if (focus !== null) {
          const d = Math.abs(wrap(segAng - focus));
          b = Math.exp(-(d * d) / (2 * 24 * 24));
        }
        const el = segRefs.current[i];
        if (el) {
          el.setAttribute("opacity", (0.22 + 0.78 * b).toFixed(3));
          el.setAttribute("stroke", b > 0.45 ? "var(--crimson)" : "var(--ink2)");
        }
      }

      /* node proximity shift toward cursor */
      if (box.current.w > 0) {
        const scale = 600 / box.current.w;
        for (let i = 0; i < N; i++) {
          const nx = (pct(i, 34).x / 100 - 0.5) * box.current.w;
          const ny = (pct(i, 34).y / 100 - 0.5) * box.current.h;
          const dist = Math.hypot(m.x - nx, m.y - ny);
          const target = m.in && !reduced ? clamp01(1 - dist / 170) : 0;
          e.prox[i] += (target - e.prox[i]) * Math.min(1, dt * 8);
          const p = e.prox[i];
          let dx = 0, dy = 0;
          if (dist > 1) { dx = ((m.x - nx) / dist) * p * 4.5; dy = ((m.y - ny) / dist) * p * 4.5; }
          const w = nodeWrapRefs.current[i];
          if (w) w.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
        }
        /* cursor glow field */
        if (glowC.current) {
          glowC.current.setAttribute("cx", (C + m.x * scale).toFixed(1));
          glowC.current.setAttribute("cy", (C + m.y * scale).toFixed(1));
          glowC.current.setAttribute("opacity", (m.in && !reduced ? 0.5 : 0).toFixed(2));
        }
      }

      /* ---- central directional marker — follows cursor, returns to centre ---- */
      const mTarget = m.in && !reduced ? mAng : 0;
      e.markerAngle += wrap(mTarget - e.markerAngle) * Math.min(1, dt * 6);
      e.markerPresence += (((m.in && !reduced) ? 1 : 0) - e.markerPresence) * Math.min(1, dt * 5);
      markerG.current?.setAttribute("transform", `rotate(${e.markerAngle.toFixed(1)} ${C} ${C})`);
      markerG.current?.setAttribute("opacity", (e.markerPresence * 0.9).toFixed(3));

      /* ---- lock signal: node → centre ---- */
      if (sig.current.t < 1.4) {
        sig.current.t += dt / 0.65;
        const a = angleOf(sig.current.idx);
        const rr = R_NODE - (R_NODE - (R_NUC + 8)) * easeOutCubic(clamp01(sig.current.t));
        const [nx, ny] = pt(R_NODE - 6, a);
        const [sx, sy] = pt(rr, a);
        signalLine.current?.setAttribute("x1", nx.toFixed(1));
        signalLine.current?.setAttribute("y1", ny.toFixed(1));
        signalLine.current?.setAttribute("x2", sx.toFixed(1));
        signalLine.current?.setAttribute("y2", sy.toFixed(1));
        signalDot.current?.setAttribute("cx", sx.toFixed(1));
        signalDot.current?.setAttribute("cy", sy.toFixed(1));
        const vis = sig.current.idx >= 0 && sig.current.t < 1.15 ? 1 : 0;
        signalLine.current?.setAttribute("opacity", (vis * 0.4).toFixed(2));
        signalDot.current?.setAttribute("opacity", (vis * (sig.current.t > 1 ? Math.max(0, 1.15 - sig.current.t) * 6 : 1)).toFixed(2));
      } else {
        signalLine.current?.setAttribute("opacity", "0");
        signalDot.current?.setAttribute("opacity", "0");
      }

      /* ---- radial pulse (ambient + lock reaction) ---- */
      if (pulse.current.p < 1) {
        pulse.current.p += dt / 1.5;
      } else if (e.t > pulse.current.next && !reduced) {
        pulse.current.p = 0;
        pulse.current.intensity = 0.4;
        pulse.current.next = e.t + 4.5 + Math.random() * 2.5;
      }
      if (pulse.current.p < 1) {
        const p = pulse.current.p;
        pulseC.current?.setAttribute("r", (R_NUC + p * 165).toFixed(1));
        pulseC.current?.setAttribute("opacity", ((1 - p) * 0.4 * pulse.current.intensity).toFixed(3));
      } else {
        pulseC.current?.setAttribute("opacity", "0");
      }

      e.raf = requestAnimationFrame(loop);
    };
    eng.current.raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(eng.current.raf);
      el?.removeEventListener("mousemove", onMove);
      el?.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="02 — WHAT I DO"
          title="WHAT I DO"
          desc="Nine disciplines orbit one field — direction, generation and story held in a single creative system."
          meta="09 MODULES · ONE FIELD"
        />

        <div className="mt-12 grid lg:grid-cols-[1.22fr_0.78fr] gap-12 lg:gap-14 xl:gap-16 items-center">
          {/* ================= THE ORBITAL FIELD ================= */}
          <Reveal>
            <div ref={containerRef} className="relative mx-auto w-full max-w-[620px] aspect-square select-none cursor-crosshair">
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">
                <defs>
                  <radialGradient id="orbGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--crimson)" stopOpacity="0.10" />
                    <stop offset="60%" stopColor="var(--crimson)" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="var(--crimson)" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="orbBg" cx="50%" cy="46%" r="60%">
                    <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.045" />
                    <stop offset="70%" stopColor="var(--ink)" stopOpacity="0.015" />
                    <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* soft ambient field behind the system */}
                <circle cx={C} cy={C} r={292} fill="url(#orbBg)" />
                {/* cursor glow (follows the mouse inside the field) */}
                <circle ref={glowC} cx={C} cy={C} r={95} fill="url(#orbGlow)" opacity={0} />

                <g ref={orbitalG}>
                  {/* ---- OUTER CALIBRATION ORBIT ---- */}
                  <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke="var(--line)" strokeWidth={1} />
                  <g ref={outerTicksG}>
                    {Array.from({ length: 60 }).map((_, i) => {
                      const major = i % 5 === 0;
                      const [x1, y1] = pt(R_OUTER - (major ? 9 : 5), i * 6);
                      const [x2, y2] = pt(R_OUTER + (major ? 3 : 1), i * 6);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="var(--ink2)" strokeWidth={major ? 1.2 : 0.7} opacity={major ? 0.55 : 0.3} />;
                    })}
                  </g>
                  {/* travelling outer arc */}
                  <g ref={arcOuterG}>
                    <circle cx={C} cy={C} r={R_OUTER} fill="none" stroke="var(--ink2)" strokeWidth={1.6}
                      strokeDasharray={dashFor(R_OUTER, 38)} strokeLinecap="round" opacity={0.4} />
                  </g>
                  <circle ref={dotA} r={2.6} fill="var(--ink2)" opacity={0.7} />

                  {/* ---- NODE RING GUIDE ---- */}
                  <circle cx={C} cy={C} r={R_NODE} fill="none" stroke="var(--line)" strokeWidth={1} opacity={0.7} />
                  {Array.from({ length: N }).map((_, i) => {
                    const [x, y] = pt(R_NODE, angleOf(i));
                    return <circle key={i} cx={x} cy={y} r={2.4} fill="var(--ink2)" opacity={0.5} />;
                  })}

                  {/* ---- SEGMENTED INTERACTIVE RING ---- */}
                  {Array.from({ length: SEG_COUNT }).map((_, i) => {
                    const span = 360 / SEG_COUNT;
                    return (
                      <path key={i} ref={(el) => { segRefs.current[i] = el; }}
                        d={arcPath(R_SEG, i * span + 3, (i + 1) * span - 3)}
                        fill="none" stroke="var(--ink2)" strokeWidth={7} strokeLinecap="round" opacity={0.22} />
                    );
                  })}
                  {/* travelling mid arc (opposite direction) */}
                  <g ref={arcMidG}>
                    <circle cx={C} cy={C} r={R_SEG} fill="none" stroke="var(--ink2)" strokeWidth={1.4}
                      strokeDasharray={dashFor(R_SEG, 52)} strokeLinecap="round" opacity={0.35} />
                  </g>
                  <circle ref={dotB} r={2.2} fill="var(--crimson)" opacity={0.8} />

                  {/* ---- INNER ORBIT ---- */}
                  <circle cx={C} cy={C} r={R_INNER} fill="none" stroke="var(--line)" strokeWidth={1} opacity={0.8} />
                  <g ref={arcInnerG}>
                    <circle cx={C} cy={C} r={R_INNER} fill="none" stroke="var(--ink2)" strokeWidth={1.3}
                      strokeDasharray={dashFor(R_INNER, 44)} strokeLinecap="round" opacity={0.4} />
                  </g>
                  <circle ref={dotC} r={2} fill="var(--ink2)" opacity={0.6} />

                  {/* ---- LOCK SIGNAL (node → centre) ---- */}
                  <line ref={signalLine} stroke="var(--crimson)" strokeWidth={1.4} opacity={0} />
                  <circle ref={signalDot} r={4} fill="var(--crimson)" opacity={0} />

                  {/* ---- RADIAL PULSE ---- */}
                  <circle ref={pulseC} cx={C} cy={C} r={R_NUC} fill="none" stroke="var(--crimson)" strokeWidth={1.2} opacity={0} />

                  {/* ---- NUCLEUS (creative field seed — not a reactor) ---- */}
                  <circle cx={C} cy={C} r={R_NUC} fill="none" stroke="var(--ink2)" strokeWidth={1.1} opacity={0.5} />
                  <circle cx={C} cy={C} r={44} fill="none" stroke="var(--ink2)" strokeWidth={0.8} opacity={0.35} />
                  <circle cx={C} cy={C} r={30} fill="none" stroke="var(--ink2)" strokeWidth={0.8} opacity={0.3} />
                  {/* rotating dashed ring */}
                  <g ref={dashRingG}>
                    <circle cx={C} cy={C} r={36} fill="none" stroke="var(--ink2)" strokeWidth={1}
                      strokeDasharray="3 7" opacity={0.55} />
                  </g>
                  {/* centre point */}
                  <circle cx={C} cy={C} r={3.4} fill="var(--crimson)" />
                  <circle cx={C} cy={C} r={7} fill="none" stroke="var(--crimson)" strokeWidth={0.9} opacity={0.5} />

                  {/* ---- DIRECTIONAL MARKER (anchored wedge, follows cursor) ---- */}
                  <g ref={markerG} opacity={0}>
                    <path d={`M${C} ${C - 53} L${C + 5} ${C - 40} L${C} ${C - 44} L${C - 5} ${C - 40} Z`}
                      fill="var(--crimson)" />
                    <line x1={C} y1={C - 38} x2={C} y2={C - 30} stroke="var(--crimson)" strokeWidth={1.2} opacity={0.7} />
                  </g>
                </g>
              </svg>

              {/* ================= NINE DISCIPLINE NODES ================= */}
              {disciplines.map((dis, i) => {
                const { x, y } = pct(i, 34);
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const hovered = hoverIdx === i;
                const locked = lockedIdx === i;
                const side = SIDE[i];
                const titleStyle: React.CSSProperties =
                  side === "above" ? { left: 0, bottom: 52, transform: "translateX(-50%)", textAlign: "center" } :
                  side === "below" ? { left: 0, top: 52, transform: "translateX(-50%)", textAlign: "center" } :
                  side === "left" ? { right: 52, top: 0, transform: "translateY(-50%)", textAlign: "right" } :
                  { left: 52, top: 0, transform: "translateY(-50%)", textAlign: "left" };
                return (
                  <div key={dis.id} ref={(el) => { nodeWrapRefs.current[i] = el; }}
                    className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                    <button
                      onMouseEnter={() => setHoverIdx(i)}
                      onMouseLeave={() => setHoverIdx(null)}
                      onFocus={() => setHoverIdx(i)}
                      onBlur={() => setHoverIdx(null)}
                      onClick={() => pick(i)}
                      className="absolute outline-none"
                      style={{ left: 0, top: 0, width: 74, height: 74, transform: "translate(-50%,-50%)" }}
                      aria-label={dis.name}
                      aria-pressed={locked}>
                      <span
                        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                        style={{
                          clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
                          backgroundColor: "var(--outer-bg)",
                          color: "var(--outer-ink)",
                          boxShadow: locked
                            ? "inset 0 0 0 1.5px var(--crimson), 0 10px 24px -10px rgba(0,0,0,0.4)"
                            : hovered
                              ? "inset 0 0 0 1.5px color-mix(in srgb, var(--crimson) 65%, transparent), 0 8px 20px -10px rgba(0,0,0,0.35)"
                              : "inset 0 0 0 1px color-mix(in srgb, var(--outer-ink) 22%, transparent), 0 4px 14px -10px rgba(0,0,0,0.25)",
                          transform: hovered || locked ? "scale(1.07)" : "none",
                        }}>
                        <Icon size={26} strokeWidth={1.6} />
                        <span className="absolute top-1.5 left-2 f-mono text-[8px] tracking-[0.1em] transition-colors duration-300"
                          style={{ color: locked || hovered ? "var(--crimson)" : "color-mix(in srgb, var(--outer-ink) 55%, transparent)" }}>
                          {dis.num}
                        </span>
                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] rounded-sm transition-all duration-300"
                          style={{ width: locked ? 20 : hovered ? 14 : 8, background: locked ? "var(--crimson)" : "color-mix(in srgb, var(--outer-ink) 35%, transparent)" }} />
                      </span>
                    </button>
                    {/* discipline title (outside the chip) */}
                    <span className="absolute pointer-events-none f-tech font-bold text-[11px] leading-[1.3] tracking-[0.1em] transition-colors duration-300"
                      style={{ ...titleStyle, color: locked ? "var(--crimson)" : hovered ? "var(--ink)" : "var(--ink2)", width: side === "left" || side === "right" ? 110 : 120 }}>
                      {SPLIT[i][0]}
                      <br />
                      {SPLIT[i][1]}
                    </span>
                  </div>
                );
              })}

              {/* bottom technical identifier */}
              <div className="absolute -bottom-9 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-9 h-px bg-[var(--line)]" />
                ORBITAL FIELD — CORE/09
                <span className="w-9 h-px bg-[var(--line)]" />
              </div>
            </div>
          </Reveal>

          {/* ================= RIGHT — DETAIL CARD ================= */}
          <Reveal delay={0.12}>
            <div className="relative rounded-xl overflow-hidden"
              style={{ background: "var(--sup1)", boxShadow: "inset 0 0 0 1px var(--line)" }}>
              {/* thin orbital accent */}
              <span className="absolute top-0 left-0 h-[3px] w-16" style={{ background: "var(--crim-panel)" }} aria-hidden />

              <div className="p-6 sm:p-8">
                <div key={selected !== null ? disciplines[selected].id : "standby"} className="career-wipe-in">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5">
                      {/* orbital glyph */}
                      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                        <circle cx="10" cy="10" r="7.5" fill="none" stroke="var(--ink2)" strokeWidth="1" opacity="0.6" />
                        <circle cx="10" cy="10" r="2.4" fill="var(--crim-panel)" />
                        <circle cx="16.5" cy="6.5" r="1.6" fill="var(--ink2)" />
                      </svg>
                      <span className="f-mono text-[10px] tracking-[0.3em]" style={{ color: "var(--m-sub)" }}>
                        {selected !== null ? `MODULE ${disciplines[selected].num}` : "OUTPUT"}
                      </span>
                    </span>
                    <span className="f-mono text-[9px] tracking-[0.22em] flex items-center gap-2"
                      style={{ color: selected !== null ? "var(--crim-panel)" : "var(--m-sub)" }}>
                      <span className="w-1.5 h-1.5 rounded-full live-blink" style={{ background: selected !== null ? "var(--crim-panel)" : "var(--m-sub)" }} />
                      {selected !== null ? "SELECTED" : "STANDING BY"}
                    </span>
                  </div>

                  {selected !== null ? (
                    <>
                      <h3 className="f-display leading-[1.02] mt-3.5 text-[clamp(1.6rem,2.4vw,2.2rem)]" style={{ color: "var(--ink)" }}>
                        {disciplines[selected].name}
                      </h3>
                      <p className="mt-3 text-[13px] sm:text-[13.5px] leading-relaxed" style={{ color: "var(--ink)", opacity: 0.85 }}>
                        {disciplines[selected].blurb}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {disciplines[selected].tags.map((t) => (
                          <span key={t} className="f-tech font-bold text-[9.5px] tracking-[0.14em] px-2.5 py-1 rounded-sm"
                            style={{ background: "color-mix(in srgb, var(--ink) 8%, transparent)", border: "1px solid var(--line)", color: "var(--ink)" }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="f-display leading-[1.05] mt-3.5 text-[clamp(1.6rem,2.4vw,2.2rem)]" style={{ color: "var(--ink)" }}>
                        Standing by
                      </h3>
                      <p className="mt-3 text-[13px] sm:text-[13.5px]" style={{ color: "var(--ink2)" }}>
                        Choose a node to explore.
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-6 pt-4 f-mono text-[8.5px] tracking-[0.26em] flex items-center justify-between"
                  style={{ borderTop: "1px solid var(--line)", color: "var(--m-sub)" }}>
                  <span>CLICK A NODE — THE FIELD RESPONDS</span>
                  <span style={{ color: "var(--crim-panel)" }}>SYS/09</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
