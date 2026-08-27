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

/* ---- radial geometry (viewBox 600, centre 300) ---- */
const NODE_PCT = 39;       /* node orbit (% of container) — sits clear of the housing */
const R_WALL = 184;        /* outer structural wall                     */
const R_FACE = 177;        /* housing front face                        */
const R_INDEX_OUT = 162;   /* index ring outer                          */
const R_INDEX_IN = 148;    /* index ring inner                          */
const R_PRI_OUT = 142;     /* primary rotating ring outer track         */
const R_PRI_IN = 120;      /* primary rotating ring inner track         */
const R_PRI_MID = 131;     /* primary ring track bed / marker radius    */
const R_SEC_OUT = 114;     /* secondary transmission ring outer         */
const R_SEC_IN = 102;      /* secondary transmission ring inner         */
const R_PLATE = 98;        /* recessed engine plate                     */
const R_HUB = 58;          /* hub mounting plate                        */

/* central gear train */
const G_MAIN = { r: 40, teeth: 18 };                       /* dominant central gear   */
const G_SMALL = { r: 16, teeth: 8 };                       /* offset transmission gear*/
const G_OFF = 56;                                          /* mesh distance 40+16     */
const GA = { a: 45 };                                      /* offset gear A angle     */
const GB = { a: 160 };                                     /* offset gear B angle     */
const LOWER = { a: 215, d: 76, r: 14, housing: 24 };       /* lower regulator         */

const angleOf = (i: number) => i * (360 / N);
const pt = (r: number, deg: number) => [C + r * Math.sin(deg * DEG), C - r * Math.cos(deg * DEG)] as const;
const pct = (i: number, r: number) => ({ x: 50 + r * Math.sin(angleOf(i) * DEG), y: 50 - r * Math.cos(angleOf(i) * DEG) });
const ptOf = (cx: number, cy: number, r: number, deg: number) =>
  [cx + r * Math.sin(deg * DEG), cy - r * Math.cos(deg * DEG)] as const;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const wrap = (d: number) => ((d + 180) % 360 + 360) % 360 - 180;

/* engraved clockwork gear drawn at origin — teeth + machined face + centre hole */
function Gear({ r, teeth, fill = "var(--core-gear)", rim = "var(--core-line)", hole = true, opacity = 1 }: {
  r: number; teeth: number; fill?: string; rim?: string; hole?: boolean; opacity?: number;
}) {
  return (
    <g opacity={opacity}>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * 360;
        return (
          <rect key={i} x={-r * 0.16} y={-r} width={r * 0.32} height={r * 0.3} rx={r * 0.05}
            transform={`rotate(${a})`} fill={fill} stroke={rim} strokeWidth={0.8} />
        );
      })}
      <circle r={r * 0.8} fill={fill} stroke={rim} strokeWidth={1.1} />
      <circle r={r * 0.8} fill="none" stroke="var(--core-inv)" strokeWidth={0.7} opacity={0.14} />
      <circle r={r * 0.5} fill="none" stroke={rim} strokeWidth={0.8} opacity={0.5} />
      {hole && (
        <>
          <circle r={r * 0.22} fill="var(--core-deep)" stroke={rim} strokeWidth={1} />
          <circle r={r * 0.22} fill="none" stroke="var(--core-inv)" strokeWidth={0.6} opacity={0.2} />
        </>
      )}
    </g>
  );
}

/* three meshed gears — CONTROL / REPEATABILITY / SYSTEM.
   Each discipline gets a subtly different gear relationship (direction + speed)
   so every card feels like a slightly different mechanical module. */
const GEAR_BASE = [
  { r: 17, teeth: 9, label: "CONTROL" },
  { r: 12.5, teeth: 8, label: "REPEATABILITY" },
  { r: 9, teeth: 7, label: "SYSTEM" },
];
const GEAR_SETS: { ccw: boolean; dur: number }[][] = [
  [{ ccw: false, dur: 9 }, { ccw: true, dur: 6.4 }, { ccw: false, dur: 4.6 }],
  [{ ccw: true, dur: 8 }, { ccw: false, dur: 5.8 }, { ccw: true, dur: 4.2 }],
  [{ ccw: false, dur: 11 }, { ccw: false, dur: 7.2 }, { ccw: true, dur: 5.0 }],
  [{ ccw: true, dur: 9.5 }, { ccw: true, dur: 6.8 }, { ccw: false, dur: 4.8 }],
  [{ ccw: false, dur: 10 }, { ccw: true, dur: 6.0 }, { ccw: false, dur: 4.0 }],
  [{ ccw: true, dur: 8.5 }, { ccw: false, dur: 6.2 }, { ccw: true, dur: 4.4 }],
  [{ ccw: false, dur: 9 }, { ccw: true, dur: 7.0 }, { ccw: false, dur: 5.2 }],
  [{ ccw: true, dur: 10.5 }, { ccw: false, dur: 5.6 }, { ccw: false, dur: 4.6 }],
  [{ ccw: false, dur: 8 }, { ccw: true, dur: 6.6 }, { ccw: true, dur: 4.2 }],
];
function GearTrio({ reduced, node }: { reduced: boolean; node: number }) {
  const set = GEAR_SETS[node % GEAR_SETS.length];
  const spin = (dur: number, ccw: boolean): React.CSSProperties =>
    reduced ? {} : {
      animation: `${ccw ? "coreSpinCCW" : "coreSpinCW"} ${dur}s linear infinite`,
      transformBox: "fill-box",
      transformOrigin: "center",
    };
  return (
    <div className={`mt-5 flex items-end gap-4 ${reduced ? "" : "gear-mesh-in"}`}>
      {GEAR_BASE.map((g, k) => {
        const cfg = set[k];
        return (
          <div key={g.label} className="flex flex-col items-center gap-1.5">
            <svg width={g.r * 2 + 8} height={g.r * 2 + 8} viewBox={`${-g.r - 4} ${-g.r - 4} ${(g.r + 4) * 2} ${(g.r + 4) * 2}`}>
              <g style={spin(cfg.dur, cfg.ccw)}>
                <Gear r={g.r} teeth={g.teeth} fill="currentColor" rim="currentColor" opacity={0.55} />
              </g>
            </svg>
            <span className="f-mono text-[7.5px] tracking-[0.18em] opacity-60">{g.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const reduced = useReducedMotion();

  /* hover = temporary preview · click = lock · second click = unlock. Only click persists. */
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const active = lockedIdx ?? hoverIdx;

  const hoverRef = useRef<number | null>(null);
  hoverRef.current = hoverIdx;
  const lockedRef = useRef<number | null>(null);
  lockedRef.current = lockedIdx;

  const themeRef = useRef(theme);
  themeRef.current = theme;

  /* ---------- refs: mechanical assemblies driven by rAF ---------- */
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitalG = useRef<SVGGElement>(null);
  const primaryRingG = useRef<SVGGElement>(null);
  const secondaryRingG = useRef<SVGGElement>(null);
  const centralGearG = useRef<SVGGElement>(null);
  const gearAG = useRef<SVGGElement>(null);
  const gearBG = useRef<SVGGElement>(null);
  const lowerGearG = useRef<SVGGElement>(null);
  const indicatorC = useRef<SVGRectElement>(null);
  const surgeArcG = useRef<SVGGElement>(null);
  const glowC = useRef<SVGCircleElement>(null);
  const pulseC = useRef<SVGCircleElement>(null);
  const signalLine = useRef<SVGLineElement>(null);
  const signalDot = useRef<SVGCircleElement>(null);
  const nodeWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const couplingExtRefs = useRef<(SVGGElement | null)[]>([]);
  const couplingJointRefs = useRef<(SVGGElement | null)[]>([]);
  const couplingLightRefs = useRef<(SVGCircleElement | null)[]>([]);
  /* theme-disassembly layer groups */
  const housingG = useRef<SVGGElement>(null);
  const plateG = useRef<SVGGElement>(null);
  const hubPlateG = useRef<SVGGElement>(null);
  const couplingsG = useRef<SVGGElement>(null);
  /* articulated pointer — drive / support / articulation gears + folding linkage */
  const ptrRotG = useRef<SVGGElement>(null);
  const ptrDriveGearG = useRef<SVGGElement>(null);
  const ptrSupportGearG = useRef<SVGGElement>(null);
  const ptrArticGearG = useRef<SVGGElement>(null);
  const ptrFoldG = useRef<SVGGElement>(null);
  const ptrLink2 = useRef<SVGRectElement>(null);
  const ptrJoint2 = useRef<SVGCircleElement>(null);
  const ptrTipG = useRef<SVGGElement>(null);

  const mouse = useRef({ x: 0, y: 0, in: false });
  const box = useRef({ cx: 0, cy: 0, w: 0, h: 0 });
  const sig = useRef({ idx: -1, t: 1 });
  const pulse = useRef({ p: 1, intensity: 0, next: 2.5 });

  const eng = useRef({
    t: 0, last: 0, raf: 0, mult: 1,
    primary: 0, secondary: 0, central: 0, gearA: 0, gearB: 0, lower: 0,
    ext: Array(N).fill(0), joint: Array(N).fill(0), prox: Array(N).fill(0),
    ptrAngle: 0, ptrExt: 0, ptrSpin: 0,
    recT: -1, lastTheme: "",
  });

  /* click fires a mechanical pulse + lock signal toward the centre */
  const firePulse = (i: number) => {
    sig.current = { idx: i, t: 0 };
    pulse.current.p = 0;
    pulse.current.intensity = 1;
  };

  /* click a node: lock the pointer + card to it · click the same node again: unlock */
  const toggleLock = (i: number) => {
    firePulse(i);
    setLockedIdx((prev) => (prev === i ? null : i));
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

      /* theme recalibration — an exploded-view mechanical rebuild:
         PHASE 1 power down → PHASE 2/3 layers explode in Z-depth (some toward camera, some away,
         some rotate/slide) → material swaps mid-explosion → PHASE 5 reassemble → PHASE 6 power up. */
      if (themeRef.current !== e.lastTheme) { e.lastTheme = themeRef.current; e.recT = 0.0001; }
      let dis = 0;    /* 0..1 explosion amount */
      let power = 1;  /* rotation power — dips to near-zero while exploded, then ramps back */
      if (e.recT > 0) {
        e.recT += dt;
        const T = e.recT;
        const sstep = (x: number) => { const t = clamp01(x); return t * t * (3 - 2 * t); };
        if (T < 0.4) { dis = sstep(T / 0.4); power = 1 - 0.85 * sstep(T / 0.4); }        /* power down + begin explode */
        else if (T < 1.5) { dis = 1; power = 0.15; }                                     /* hold exploded, material swaps */
        else if (T < 2.2) { const u = (T - 1.5) / 0.7; dis = 1 - sstep(u); power = 0.15 + 0.85 * sstep(u); } /* reassemble + power up */
        else { e.recT = -1; }
      }
      /* ---- layers separate in distinct depth directions (toward / away / rotate / slide) ---- */
      orbitalG.current?.setAttribute("opacity", (1 - 0.3 * dis).toFixed(3));
      /* outer housing lifts toward the camera + rotates */
      housingG.current?.setAttribute("transform",
        `translate(${C} ${C}) rotate(${(4 * dis).toFixed(2)}) scale(${(1 + 0.075 * dis).toFixed(4)}) translate(${-C} ${-C})`);
      /* recessed engine plate recedes away from the camera */
      plateG.current?.setAttribute("transform",
        `translate(${C} ${C + 10 * dis}) scale(${(1 - 0.05 * dis).toFixed(4)}) translate(${-C} ${-(C + 10 * dis)})`);
      /* central hub recedes slightly */
      hubPlateG.current?.setAttribute("transform",
        `translate(${C} ${C}) scale(${(1 - 0.07 * dis).toFixed(4)}) translate(${-C} ${-C})`);
      /* node couplings detach (fade + shrink) */
      couplingsG.current?.setAttribute("opacity", (1 - 0.7 * dis).toFixed(3));
      couplingsG.current?.setAttribute("transform",
        `translate(${C} ${C}) scale(${(1 - 0.05 * dis).toFixed(4)}) translate(${-C} ${-C})`);

      /* ---- mechanical surge: every 20s, ~1s impulse (emphasises the secondary ring) ---- */
      const phase = e.t % 20;
      let target = 1;
      if (phase >= 18.2) {
        const u = phase - 18.2;
        if (u < 0.4) target = 1 + 1.6 * (u / 0.4);
        else if (u < 1.0) target = 2.6;
        else target = 2.6 - 1.6 * ((u - 1.0) / 0.8);
      }
      e.mult += (target - e.mult) * Math.min(1, dt * 7);
      const m = e.mult * rm;
      const boost = clamp01((e.mult - 1) / 1.6);

      /* ---- independent rotation (gear logic) — decelerates to near-stop while exploded ---- */
      e.primary += dt * 6 * m * power;
      e.secondary -= dt * 9 * m * power * (1 + 1.2 * boost);
      e.central += dt * 14 * m * power;
      e.gearA -= dt * 35 * m * power;
      e.gearB -= dt * 35 * m * power;
      e.lower -= dt * 10 * m * power;

      /* primary ring drifts away from camera + counter-rotates slightly */
      primaryRingG.current?.setAttribute("transform",
        `translate(${C} ${C}) rotate(${(-3 * dis).toFixed(2)}) scale(${(1 - 0.06 * dis).toFixed(4)}) rotate(${(e.primary % 360).toFixed(2)}) translate(${-C} ${-C})`);
      /* secondary ring slides sideways + recedes */
      secondaryRingG.current?.setAttribute("transform",
        `translate(${C + 6 * dis} ${C + 4 * dis}) scale(${(1 - 0.04 * dis).toFixed(4)}) rotate(${(e.secondary % 360).toFixed(2)}) translate(${-C} ${-C})`);
      /* central gear recedes into depth */
      centralGearG.current?.setAttribute("transform",
        `translate(${C} ${C + 11 * dis}) scale(${(1 - 0.06 * dis).toFixed(4)}) rotate(${(e.central % 360).toFixed(2)})`);
      /* support gears drift outward along their mounting paths + rotate */
      const [gax, gay] = ptOf(C, C, G_OFF + 18 * dis, GA.a);
      const [gbx, gby] = ptOf(C, C, G_OFF + 18 * dis, GB.a);
      gearAG.current?.setAttribute("transform", `translate(${gax} ${gay}) rotate(${(e.gearA % 360).toFixed(2)})`);
      gearBG.current?.setAttribute("transform", `translate(${gbx} ${gby}) rotate(${(e.gearB % 360).toFixed(2)})`);
      const [lx, ly] = ptOf(C, C, LOWER.d + 14 * dis, LOWER.a);
      lowerGearG.current?.setAttribute("transform", `translate(${lx} ${ly}) rotate(${(e.lower % 360).toFixed(2)})`);

      /* crimson timing indicator strengthens with the surge */
      indicatorC.current?.setAttribute("opacity", (0.8 + 0.2 * boost).toFixed(2));
      indicatorC.current?.setAttribute("width", (6 + 2.5 * boost).toFixed(1));
      indicatorC.current?.setAttribute("x", (-(3 + 1.25 * boost)).toFixed(1));
      /* faint crimson surge arc riding the secondary ring */
      surgeArcG.current?.setAttribute("opacity", (boost * 0.55).toFixed(2));
      surgeArcG.current?.setAttribute("transform", `rotate(${(e.secondary % 360).toFixed(2)} ${C} ${C})`);

      /* ---- node couplings: hover mechanically engages ---- */
      for (let i = 0; i < N; i++) {
        const activeNode = hoverRef.current === i;
        e.ext[i] += ((activeNode ? 1 : 0) - e.ext[i]) * Math.min(1, dt * 7);
        e.joint[i] += e.ext[i] * (activeNode ? 160 : 60) * m * dt;
        const ex = e.ext[i];
        couplingExtRefs.current[i]?.setAttribute("transform", `translate(0 ${(-6 * ex).toFixed(1)})`);
        couplingJointRefs.current[i]?.setAttribute("transform", `rotate(${(e.joint[i] % 360).toFixed(1)})`);
        couplingLightRefs.current[i]?.setAttribute("opacity", (ex * (0.5 + 0.5 * boost)).toFixed(2));
      }

      /* ---- articulated pointer: tracks the mouse anywhere inside the circular core, locks to a
            clicked node, and folds into the hub when idle. Never floats, never detaches. ---- */
      /* interaction field = whole radial engine: core + rings + node/connector region */
      const fieldRadiusPx = box.current.w > 0 ? 0.39 * box.current.w + 48 : 0;
      const mDist = Math.hypot(mouse.current.x, mouse.current.y);
      const mouseInCore = mouse.current.in && fieldRadiusPx > 0 && mDist < fieldRadiusPx;
      const mouseAngle = Math.atan2(mouse.current.x, -mouse.current.y) / DEG;

      const lk = lockedRef.current;
      const hv = hoverRef.current;
      const inTransition = e.recT > 0; /* during theme change the pointer powers down + retracts */
      const tracking = !inTransition && (lk !== null || hv !== null || mouseInCore);
      /* priority: locked node → hovered node → live mouse angle */
      const ptrAngTarget =
        lk !== null ? angleOf(lk)
        : hv !== null ? angleOf(hv)
        : mouseInCore ? mouseAngle
        : e.ptrAngle; /* idle: hold direction while folding */
      e.ptrAngle += wrap(ptrAngTarget - e.ptrAngle) * Math.min(1, dt * 6) * rm;
      e.ptrExt += ((tracking ? 1 : 0) - e.ptrExt) * Math.min(1, dt * (tracking ? 5 : 6.5));
      e.ptrSpin += dt * (26 + 90 * e.ptrExt) * m;

      ptrRotG.current?.setAttribute("transform", `rotate(${e.ptrAngle.toFixed(2)} ${C} ${C})`);
      ptrDriveGearG.current?.setAttribute("transform", `translate(${C} ${C}) rotate(${(e.ptrSpin % 360).toFixed(2)})`);
      ptrSupportGearG.current?.setAttribute("transform", `rotate(${(-e.ptrSpin * 1.6 % 360).toFixed(2)})`);
      ptrArticGearG.current?.setAttribute("transform", `rotate(${(-e.ptrSpin * 1.25 % 360).toFixed(2)})`);

      /* folding linkage: second stage telescopes + folds around the first joint */
      const ext = e.ptrExt;
      const span = 24 + 34 * ext;                  /* first-joint → second-joint distance */
      const joint2Y = C - 26 - span;               /* second joint absolute y */
      const fold = (1 - ext) * 68;                 /* fold angle when retracting */
      ptrFoldG.current?.setAttribute("transform",
        `translate(${C} ${C - 26}) rotate(${fold.toFixed(1)}) translate(${-C} ${-(C - 26)})`);
      ptrLink2.current?.setAttribute("y", joint2Y.toFixed(1));
      ptrLink2.current?.setAttribute("height", span.toFixed(1));
      ptrJoint2.current?.setAttribute("cy", joint2Y.toFixed(1));
      ptrTipG.current?.setAttribute("transform", `translate(${C} ${joint2Y.toFixed(1)})`);

      /* ---- nodes: proximity shift toward cursor + theme-disassembly drift (outward + slight rotate) ---- */
      for (let i = 0; i < N; i++) {
        const na = angleOf(i);
        const ox = Math.sin(na * DEG) * dis * 16;
        const oy = -Math.cos(na * DEG) * dis * 16;
        let dx = 0, dy = 0;
        if (box.current.w > 0) {
          const nx = (pct(i, NODE_PCT).x / 100 - 0.5) * box.current.w;
          const ny = (pct(i, NODE_PCT).y / 100 - 0.5) * box.current.h;
          const dist = Math.hypot(mouse.current.x - nx, mouse.current.y - ny);
          const tgt = mouse.current.in && !reduced ? clamp01(1 - dist / 170) : 0;
          e.prox[i] += (tgt - e.prox[i]) * Math.min(1, dt * 8);
          const p = e.prox[i];
          if (dist > 1) { dx = ((mouse.current.x - nx) / dist) * p * 4; dy = ((mouse.current.y - ny) / dist) * p * 4; }
        }
        const w = nodeWrapRefs.current[i];
        if (w) w.style.transform =
          `translate(${(dx + ox).toFixed(1)}px, ${(dy + oy).toFixed(1)}px) rotate(${(dis * 5).toFixed(1)}deg)`;
      }
      if (box.current.w > 0 && glowC.current) {
        const scale = 600 / box.current.w;
        glowC.current.setAttribute("cx", (C + mouse.current.x * scale).toFixed(1));
        glowC.current.setAttribute("cy", (C + mouse.current.y * scale).toFixed(1));
        glowC.current.setAttribute("opacity", (mouse.current.in && !reduced ? 0.4 : 0).toFixed(2));
      }

      /* ---- lock signal: node → centre (click feedback) ---- */
      if (sig.current.t < 1.4) {
        sig.current.t += dt / 0.65;
        const a = angleOf(sig.current.idx);
        const rr = R_WALL - (R_WALL - (R_HUB - 4)) * (1 - Math.pow(1 - clamp01(sig.current.t), 3));
        const [nx, ny] = pt(R_WALL - 8, a);
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

      /* ---- radial pulse (ambient + click reaction) ---- */
      if (pulse.current.p < 1) {
        pulse.current.p += dt / 1.5;
      } else if (e.t > pulse.current.next && !reduced) {
        pulse.current.p = 0;
        pulse.current.intensity = 0.35;
        pulse.current.next = e.t + 4.5 + Math.random() * 2.5;
      }
      if (pulse.current.p < 1) {
        const p = pulse.current.p;
        pulseC.current?.setAttribute("r", (R_HUB + p * 150).toFixed(1));
        pulseC.current?.setAttribute("opacity", ((1 - p) * 0.35 * pulse.current.intensity).toFixed(3));
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

  const [gaxS, gayS] = ptOf(C, C, G_OFF, GA.a);
  const [gbxS, gbyS] = ptOf(C, C, G_OFF, GB.a);
  const [lxS, lyS] = ptOf(C, C, LOWER.d, LOWER.a);

  /* every active-node card flips to a matte mechanical status panel:
     graphite on a light page, rough off-white on a dark page */
  const cardActive = active !== null;
  const cardBg = theme === "light" ? "#222328" : "#e7e6e1";
  const cardInk = theme === "light" ? "#e7e6e1" : "#222328";
  const cardSub = theme === "light" ? "#9b9c96" : "#59595b";

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="02 — THE CORE"
          title="THE CORE"
          desc="Nine disciplines drive one machine — direction, generation and story transmitted through a single radial clockwork engine."
          meta="09 MODULES · ONE ENGINE"
        />

        <div className="mt-12 grid lg:grid-cols-[1.22fr_0.78fr] gap-12 lg:gap-14 xl:gap-16 items-center">
          {/* ================= THE RADIAL CLOCKWORK TRANSMISSION CORE ================= */}
          <Reveal>
            <div ref={containerRef} className="relative mx-auto w-full max-w-[620px] aspect-square select-none">
              <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full">
                <defs>
                  <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--crimson)" stopOpacity="0.09" />
                    <stop offset="60%" stopColor="var(--crimson)" stopOpacity="0.03" />
                    <stop offset="100%" stopColor="var(--crimson)" stopOpacity="0" />
                  </radialGradient>
                  <radialGradient id="coreBg" cx="50%" cy="46%" r="62%">
                    <stop offset="0%" stopColor="var(--ink)" stopOpacity="0.05" />
                    <stop offset="70%" stopColor="var(--ink)" stopOpacity="0.015" />
                    <stop offset="100%" stopColor="var(--ink)" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* soft ambient field behind the machine */}
                <circle cx={C} cy={C} r={292} fill="url(#coreBg)" />
                {/* cursor glow (follows the mouse inside the field) */}
                <circle ref={glowC} cx={C} cy={C} r={92} fill="url(#coreGlow)" opacity={0} />

                <g ref={orbitalG}>
                  <g ref={housingG}>
                  {/* ---- LEVEL 1 · OUTER HOUSING (static, thick machined casing) ---- */}
                  <circle cx={C} cy={C + 4} r={R_WALL} fill="rgba(0,0,0,0.3)" />
                  <circle cx={C} cy={C} r={R_WALL} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={2} />
                  <circle cx={C} cy={C} r={R_WALL} fill="none" stroke="var(--core-inv)" strokeWidth={0.9} opacity={0.16} />
                  <circle cx={C} cy={C} r={R_FACE} fill="none" stroke="var(--core-line)" strokeWidth={1} opacity={0.6} />
                  {/* recessed channel */}
                  <circle cx={C} cy={C} r={R_FACE - 3} fill="none" stroke="var(--core-deep)" strokeWidth={4} opacity={0.7} />
                  <circle cx={C} cy={C} r={R_INDEX_OUT + 3} fill="none" stroke="var(--core-line)" strokeWidth={0.8} opacity={0.4} />
                  {/* segmented mechanical sections + radial divisions */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x1, y1] = pt(R_INDEX_OUT + 3, i * 30);
                    const [x2, y2] = pt(R_WALL, i * 30);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth={1} opacity={0.5} />;
                  })}
                  {/* fastening points */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x, y] = pt((R_WALL + R_INDEX_OUT) / 2 + 4, i * 30 + 15);
                    return (
                      <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
                        <circle r={3.2} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.8} />
                        <rect x={-1.8} y={-0.7} width={3.6} height={1.4} fill="var(--core-deep)" transform={`rotate(${i * 30})`} />
                      </g>
                    );
                  })}

                  {/* ---- LEVEL 2 · OUTER INDEX RING (static, structural teeth) ---- */}
                  <circle cx={C} cy={C} r={R_INDEX_OUT} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  {Array.from({ length: 36 }).map((_, i) => {
                    const [x, y] = pt((R_INDEX_OUT + R_INDEX_IN) / 2, i * 10);
                    return (
                      <g key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${i * 10})`}>
                        <rect x={-4.2} y={-7.5} width={8.4} height={15} rx={1.4}
                          fill={i % 9 === 0 ? "var(--core-mid)" : "var(--core-plate)"} stroke="var(--core-line)" strokeWidth={0.8} />
                        <rect x={-4.2} y={-7.5} width={8.4} height={3} rx={1.2} fill="var(--core-inv)" opacity={0.12} />
                      </g>
                    );
                  })}
                  <circle cx={C} cy={C} r={R_INDEX_IN} fill="none" stroke="var(--core-line)" strokeWidth={1} opacity={0.7} />
                  </g>

                  {/* ---- LEVEL 3 · PRIMARY ROTATING RING (slow CW) ---- */}
                  <g ref={primaryRingG}>
                    <circle cx={C} cy={C} r={R_PRI_MID} fill="none" stroke="var(--core-deep)" strokeWidth={16} opacity={0.85} />
                    <circle cx={C} cy={C} r={R_PRI_OUT} fill="none" stroke="var(--core-line)" strokeWidth={1.2} />
                    <circle cx={C} cy={C} r={R_PRI_IN} fill="none" stroke="var(--core-line)" strokeWidth={1.2} />
                    {/* precision timing marks */}
                    {Array.from({ length: 48 }).map((_, i) => {
                      const major = i % 6 === 0;
                      const [x1, y1] = pt(R_PRI_OUT - 2, i * 7.5);
                      const [x2, y2] = pt(R_PRI_OUT - (major ? 8 : 4.5), i * 7.5);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke="var(--core-mid)" strokeWidth={major ? 1.3 : 0.7} opacity={major ? 0.65 : 0.35} />;
                    })}
                    {/* mechanical segment divisions */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const [x1, y1] = pt(R_PRI_IN + 2, i * 30 + 15);
                      const [x2, y2] = pt(R_PRI_OUT - 2, i * 30 + 15);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-deep)" strokeWidth={2.4} opacity={0.8} />;
                    })}
                    {/* crimson timing marker — travels with the ring */}
                    <g transform={`translate(${C} ${C - R_PRI_MID})`}>
                      <rect x={-7.5} y={-9} width={15} height={18} rx={2.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1} />
                      <rect ref={indicatorC} x={-3} y={-5.5} width={6} height={11} rx={1.2} fill="var(--crimson)" />
                    </g>
                  </g>

                  {/* ---- secondary transmission ring (slow CCW, receives the 20s surge) ---- */}
                  <g ref={secondaryRingG}>
                    <circle cx={C} cy={C} r={R_SEC_OUT} fill="none" stroke="var(--core-mid)" strokeWidth={1.4} opacity={0.8} />
                    <circle cx={C} cy={C} r={R_SEC_IN} fill="none" stroke="var(--core-mid)" strokeWidth={1} opacity={0.6} />
                    <circle cx={C} cy={C} r={(R_SEC_OUT + R_SEC_IN) / 2} fill="none" stroke="var(--core-mid)"
                      strokeWidth={5} strokeDasharray="4 9" opacity={0.4} />
                  </g>
                  {/* faint crimson surge arc riding the secondary ring */}
                  <g ref={surgeArcG} opacity={0}>
                    <circle cx={C} cy={C} r={(R_SEC_OUT + R_SEC_IN) / 2} fill="none" stroke="var(--crimson)"
                      strokeWidth={3} strokeLinecap="round"
                      strokeDasharray={`${(2 * Math.PI * ((R_SEC_OUT + R_SEC_IN) / 2) * 0.12).toFixed(1)} ${(2 * Math.PI * ((R_SEC_OUT + R_SEC_IN) / 2) * 0.88).toFixed(1)}`} />
                  </g>

                  {/* ---- LEVEL 4 · RECESSED ENGINE PLATE ---- */}
                  <g ref={plateG}>
                  <circle cx={C} cy={C} r={R_PLATE} fill="var(--core-deep)" />
                  <circle cx={C} cy={C} r={R_PLATE} fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth={5} opacity={0.5} />
                  <circle cx={C} cy={C} r={R_PLATE - 5} fill="none" stroke="var(--core-line)" strokeWidth={0.8} opacity={0.4} />
                  {/* faint circular machining + radial construction lines */}
                  <circle cx={C} cy={C} r={86} fill="none" stroke="var(--core-line)" strokeWidth={0.6} opacity={0.3} />
                  <circle cx={C} cy={C} r={74} fill="none" stroke="var(--core-line)" strokeWidth={0.6} opacity={0.25} />
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x1, y1] = pt(62, i * 30 + 15);
                    const [x2, y2] = pt(R_PLATE - 6, i * 30 + 15);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-line)" strokeWidth={0.5} opacity={0.16} />;
                  })}
                  {/* mounting points */}
                  {Array.from({ length: 8 }).map((_, i) => {
                    const [x, y] = pt(90, i * 45 + 22.5);
                    return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={1.8} fill="var(--core-mid)" opacity={0.5} />;
                  })}

                  {/* ---- four radial structural arms (clockwork bridges) ---- */}
                  {[0, 90, 180, 270].map((deg, k) => {
                    const len = k % 2 === 0 ? 40 : 34;
                    return (
                      <g key={deg} transform={`rotate(${deg} ${C} ${C})`}>
                        <rect x={C - 4.5} y={C - R_PLATE + 4} width={9} height={len} rx={4}
                          fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
                        <rect x={C - 1.5} y={C - R_PLATE + 6} width={3} height={len - 4} rx={1.5}
                          fill="var(--core-inv)" opacity={0.18} />
                        <circle cx={C} cy={C - R_PLATE + 6} r={2.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />
                        <circle cx={C} cy={C - R_PLATE + 4 + len - 2} r={2.6} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />
                      </g>
                    );
                  })}
                  </g>

                  {/* ---- LEVEL 5 · CENTRAL CLOCKWORK HUB ---- */}
                  {/* recessed mounting plate + segmented gear housing (recedes during theme disassembly) */}
                  <g ref={hubPlateG}>
                  <circle cx={C} cy={C} r={R_HUB} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.4} />
                  <circle cx={C} cy={C} r={R_HUB} fill="none" stroke="var(--core-inv)" strokeWidth={0.7} opacity={0.14} />
                  {/* segmented gear housing */}
                  <circle cx={C} cy={C} r={R_HUB - 7} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={1} />
                  {Array.from({ length: 12 }).map((_, i) => {
                    const [x1, y1] = pt(R_HUB - 11, i * 30);
                    const [x2, y2] = pt(R_HUB - 7, i * 30);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--core-mid)" strokeWidth={1.4} opacity={0.6} />;
                  })}
                  </g>

                  {/* lower secondary regulator (offset, independent) */}
                  <g>
                    <circle cx={lxS} cy={lyS + 2.5} r={LOWER.housing} fill="rgba(0,0,0,0.25)" />
                    <circle cx={lxS} cy={lyS} r={LOWER.housing} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.2} />
                    <circle cx={lxS} cy={lyS} r={LOWER.housing - 5} fill="var(--core-deep)" stroke="var(--core-line)" strokeWidth={0.9} />
                    {/* short connecting shaft back to the hub */}
                    <line x1={lxS} y1={lyS} x2={ptOf(C, C, R_HUB - 4, LOWER.a)[0]} y2={ptOf(C, C, R_HUB - 4, LOWER.a)[1]}
                      stroke="var(--core-mid)" strokeWidth={5} strokeLinecap="round" opacity={0.85} />
                    <g ref={lowerGearG}><Gear r={LOWER.r} teeth={9} /></g>
                    <circle cx={lxS} cy={lyS} r={4.5} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1} />
                    <circle cx={lxS} cy={lyS} r={1.6} fill="var(--core-mid)" />
                  </g>

                  {/* central gear train: dominant gear + two meshed offset gears */}
                  <g ref={centralGearG}><Gear r={G_MAIN.r} teeth={G_MAIN.teeth} /></g>
                  <g ref={gearAG}><Gear r={G_SMALL.r} teeth={G_SMALL.teeth} /></g>
                  <g ref={gearBG}><Gear r={G_SMALL.r} teeth={G_SMALL.teeth} /></g>

                  {/* central bearing + axle */}
                  <circle cx={C} cy={C} r={13} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.3} />
                  <circle cx={C} cy={C} r={13} fill="none" stroke="var(--core-inv)" strokeWidth={0.7} opacity={0.2} />
                  <circle cx={C} cy={C} r={7} fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />

                  {/* ---- ARTICULATED POINTER — one continuous steampunk linkage, permanently mounted
                        on the central axle. Folds into the hub when idle, extends when tracking. ---- */}
                  <g ref={ptrRotG}>
                    {/* SECOND STAGE — folding link arm + second joint + pointer tip */}
                    <g ref={ptrFoldG}>
                      <rect ref={ptrLink2} x={C - 3} y={C - 50} width={6} height={24} rx={2.5}
                        fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.9} />
                      {/* telescoping collar near the first joint */}
                      <rect x={C - 4.5} y={C - 40} width={9} height={12} rx={2}
                        fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={0.9} />
                      <circle ref={ptrJoint2} cx={C} cy={C - 50} r={4.4}
                        fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.1} />
                      <g ref={ptrTipG} transform={`translate(${C} ${C - 50})`}>
                        {/* mechanical pointed tip — stays inside the core, never reaches the nodes */}
                        <path d="M0 -16 L6 -4 L2.4 -4 L2.4 2 L-2.4 2 L-2.4 -4 L-6 -4 Z"
                          fill="var(--crimson)" stroke="var(--core-line)" strokeWidth={0.8} />
                        <circle cy={-4} r={1.6} fill="var(--core-plate)" />
                      </g>
                    </g>
                    {/* FIRST STAGE — mechanical support link from axle to first joint */}
                    <rect x={C - 4} y={C - 26} width={8} height={18} rx={3}
                      fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={1} />
                    {/* ARTICULATION GEAR at the first joint (counter-rotates with the drive) */}
                    <g transform={`translate(${C} ${C - 26})`}>
                      <g ref={ptrArticGearG}><Gear r={8} teeth={7} fill="var(--core-plate)" rim="var(--core-line)" /></g>
                      <circle r={2.4} fill="var(--core-deep)" />
                    </g>
                    {/* PRIMARY DRIVE GEAR on the central axle */}
                    <g ref={ptrDriveGearG}><Gear r={15} teeth={9} fill="var(--core-plate)" rim="var(--core-line)" /></g>
                    {/* SECONDARY SUPPORT GEAR — offset, meshed with the drive, counter-rotates */}
                    <g transform={`translate(${C + 17} ${C + 13})`}>
                      <g ref={ptrSupportGearG}><Gear r={9} teeth={7} fill="var(--core-mid)" rim="var(--core-line)" hole={false} /></g>
                    </g>
                    {/* tiny crimson status indicator at the axle */}
                    <circle cx={C} cy={C} r={3} fill="var(--crimson)" />
                    <circle cx={C} cy={C} r={3} fill="none" stroke="var(--crimson)" strokeWidth={0.8} opacity={0.5} />
                  </g>

                  {/* ---- radial pulse ---- */}
                  <circle ref={pulseC} cx={C} cy={C} r={R_HUB} fill="none" stroke="var(--crimson)" strokeWidth={1.1} opacity={0} />

                  {/* ---- lock signal (node → centre) ---- */}
                  <line ref={signalLine} stroke="var(--crimson)" strokeWidth={1.3} opacity={0} />
                  <circle ref={signalDot} r={4} fill="var(--crimson)" opacity={0} />

                  {/* ---- nine node couplings (housing → shaft → joint → mount) ---- */}
                  <g ref={couplingsG}>
                  {Array.from({ length: N }).map((_, i) => (
                    <g key={i} transform={`rotate(${angleOf(i)} ${C} ${C})`}>
                      {/* core mounting point on the housing wall */}
                      <rect x={C - 8} y={C - R_WALL + 1} width={16} height={6} rx={2}
                        fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.9} />
                      {/* extending shaft + joint (bridges the gap, moves outward on hover) */}
                      <g ref={(el) => { couplingExtRefs.current[i] = el; }}>
                        <rect x={C - 3} y={C - R_WALL - 18} width={6} height={20} rx={2.5}
                          fill="var(--core-mid)" stroke="var(--core-line)" strokeWidth={0.9} />
                        <g transform={`translate(${C} ${C - R_WALL - 20})`}>
                          <g ref={(el) => { couplingJointRefs.current[i] = el; }}>
                            <circle r={6} fill="var(--core-plate)" stroke="var(--core-line)" strokeWidth={1.1} />
                            {Array.from({ length: 6 }).map((_, k) => (
                              <rect key={k} x={-1.4} y={-7.6} width={2.8} height={3.4} rx={0.8}
                                transform={`rotate(${k * 60})`} fill="var(--core-mid)" />
                            ))}
                            <circle r={2} fill="var(--core-deep)" />
                          </g>
                          <circle ref={(el) => { couplingLightRefs.current[i] = el; }} r={2} fill="var(--crimson)" opacity={0} />
                        </g>
                      </g>
                    </g>
                  ))}
                  </g>
                </g>
              </svg>

              {/* ================= NINE DISCIPLINE NODES (mechanical input modules) ================= */}
              {disciplines.map((dis, i) => {
                const { x, y } = pct(i, NODE_PCT);
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const hovered = active === i;
                const side = SIDE[i];
                const titleStyle: React.CSSProperties =
                  side === "above" ? { left: 0, bottom: 54, transform: "translateX(-50%)", textAlign: "center" } :
                  side === "below" ? { left: 0, top: 54, transform: "translateX(-50%)", textAlign: "center" } :
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
                      onClick={() => toggleLock(i)}
                      className="absolute outline-none"
                      style={{ left: 0, top: 0, width: 74, height: 74, transform: "translate(-50%,-50%)" }}
                      aria-label={dis.name}
                      aria-pressed={hovered}>
                      <span
                        className="absolute inset-0 flex items-center justify-center transition-all duration-300"
                        style={{
                          clipPath: "polygon(12px 0, 100% 0, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0 100%, 0 12px)",
                          backgroundColor: hovered ? "var(--crimson)" : "var(--outer-bg)",
                          color: hovered ? "#f4f2ed" : "var(--outer-ink)",
                          boxShadow: hovered
                            ? "inset 0 0 0 1.5px var(--crimson), 0 12px 26px -10px rgba(0,0,0,0.45)"
                            : "inset 0 0 0 1px color-mix(in srgb, var(--outer-ink) 22%, transparent), 0 4px 14px -10px rgba(0,0,0,0.25)",
                          transform: hovered ? "scale(1.07)" : "none",
                        }}>
                        {/* mechanical mounting screw */}
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border"
                          style={{ borderColor: hovered ? "rgba(244,242,237,0.5)" : "color-mix(in srgb, var(--outer-ink) 40%, transparent)" }} />
                        <Icon size={26} strokeWidth={1.6} />
                        <span className="absolute top-1.5 left-2 f-mono text-[8px] tracking-[0.1em] transition-colors duration-300"
                          style={{ color: hovered ? "#f4f2ed" : "color-mix(in srgb, var(--outer-ink) 55%, transparent)" }}>
                          {dis.num}
                        </span>
                        {/* technical indicator */}
                        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-[3px] rounded-sm transition-all duration-300"
                          style={{ width: hovered ? 20 : 8, background: hovered ? "#f4f2ed" : "color-mix(in srgb, var(--outer-ink) 35%, transparent)" }} />
                      </span>
                    </button>
                    {/* discipline title (outside the chip) */}
                    <span className="absolute pointer-events-none f-tech font-bold text-[11px] leading-[1.3] tracking-[0.1em] transition-colors duration-300"
                      style={{ ...titleStyle, color: hovered ? "var(--crimson)" : "var(--ink2)", width: side === "left" || side === "right" ? 104 : 116 }}>
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
                RADIAL ENGINE — CORE/09
                <span className="w-9 h-px bg-[var(--line)]" />
              </div>
            </div>
          </Reveal>

          {/* ================= RIGHT — DETAIL CARD ================= */}
          <Reveal delay={0.12}>
            {/* the standby state uses the same matte card system as the node cards */}
            <div className="relative rounded-xl overflow-hidden transition-colors duration-500"
              style={{
                background: cardBg,
                color: cardInk,
                boxShadow: "inset 0 0 0 1px color-mix(in srgb, currentColor 22%, transparent), 0 18px 40px -22px rgba(0,0,0,0.45)",
              }}>
              <span className="absolute top-0 left-0 h-[3px] w-16" style={{ background: "var(--crim-panel)" }} aria-hidden />

              <div className="p-6 sm:p-8">
                <div key={active !== null ? disciplines[active].id : "standby"} className="career-wipe-in">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2.5">
                      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden>
                        <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
                        <circle cx="10" cy="10" r="2.4" fill="var(--crim-panel)" />
                        <circle cx="16.5" cy="6.5" r="1.6" fill="currentColor" opacity="0.6" />
                      </svg>
                      <span className="f-mono text-[10px] tracking-[0.3em]" style={{ color: cardSub }}>
                        {active !== null ? `MODULE ${disciplines[active].num}` : "OUTPUT"}
                      </span>
                    </span>
                    <span className="f-mono text-[9px] tracking-[0.22em] flex items-center gap-2"
                      style={{ color: active !== null ? "var(--crim-panel)" : cardSub }}>
                      <span className="w-1.5 h-1.5 rounded-full live-blink" style={{ background: active !== null ? "var(--crim-panel)" : "currentColor", opacity: active !== null ? 1 : 0.5 }} />
                      {active !== null ? (lockedIdx !== null ? "LOCKED" : "SELECTED") : "ON STAND BY"}
                    </span>
                  </div>

                  {active !== null ? (
                    <>
                      <h3 className="f-display leading-[1.02] mt-3.5 text-[clamp(1.6rem,2.4vw,2.2rem)]">
                        {disciplines[active].name}
                      </h3>
                      <p className="mt-3 text-[13px] sm:text-[13.5px] leading-relaxed" style={{ opacity: 0.85 }}>
                        {disciplines[active].blurb}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {disciplines[active].tags.map((t) => (
                          <span key={t} className="f-tech font-bold text-[9.5px] tracking-[0.14em] px-2.5 py-1 rounded-sm"
                            style={{
                              background: "color-mix(in srgb, currentColor 12%, transparent)",
                              border: "1px solid color-mix(in srgb, currentColor 25%, transparent)",
                            }}>
                            {t}
                          </span>
                        ))}
                      </div>
                      {/* three meshed mechanical gear indicators — CONTROL / REPEATABILITY / SYSTEM */}
                      <div style={{ color: cardInk }}><GearTrio reduced={reduced} node={active ?? 0} /></div>
                    </>
                  ) : (
                    <>
                      <h3 className="f-display leading-[1.05] mt-3.5 text-[clamp(1.6rem,2.4vw,2.2rem)]">
                        ON STAND BY
                      </h3>
                      <p className="mt-3 text-[13px] sm:text-[13.5px]" style={{ color: cardSub }}>
                        Pick a node to explore
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-6 pt-4 f-mono text-[8.5px] tracking-[0.26em] flex items-center justify-between"
                  style={{ borderTop: "1px solid color-mix(in srgb, currentColor 20%, transparent)", color: cardSub }}>
                  <span>HOVER · CLICK TO LOCK — THE ENGINE RESPONDS</span>
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
