import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
import { Reveal, SectionHead } from "./ui";

const polar = (cx: number, cy: number, r: number, deg: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

/* machined gear drawn at origin — caller translates/rotates */
function GearShape({ r, teeth, fill = "var(--machine-plate)", stroke = "var(--machine-line)", hub = true, spokes = 0 }: {
  r: number; teeth: number; fill?: string; stroke?: string; hub?: boolean; spokes?: number;
}) {
  return (
    <>
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
        fill="none" stroke="var(--machine-inv)" strokeWidth={1.1} opacity={0.2} strokeLinecap="round" />
      {spokes > 0 && Array.from({ length: spokes }).map((_, i) => {
        const a = (i / spokes) * Math.PI * 2;
        return <circle key={i} cx={r * 0.5 * Math.cos(a)} cy={r * 0.5 * Math.sin(a)} r={r * 0.15} fill="var(--machine-deep)" stroke={stroke} strokeWidth={0.9} />;
      })}
      {hub && (
        <>
          <circle r={r * 0.3} fill="var(--machine-deep)" stroke={stroke} strokeWidth={1.2} />
          <circle r={r * 0.1} fill={stroke} />
        </>
      )}
    </>
  );
}

/* two-line radial label system — forced breaks + placement side, zero overlap */
const LBL: { lines: [string, string]; side: "above" | "right" | "left" }[] = [
  { lines: ["CREATIVE", "DIRECTION"], side: "above" },
  { lines: ["GENERATIVE", "AI"], side: "right" },
  { lines: ["VISUAL", "DEVELOPMENT"], side: "right" },
  { lines: ["CINEMATIC", "STORYTELLING"], side: "right" },
  { lines: ["AI IMAGE +", "VIDEO"], side: "right" },
  { lines: ["CHARACTER", "DEVELOPMENT"], side: "left" },
  { lines: ["ENVIRONMENT", "DESIGN"], side: "left" },
  { lines: ["AI CREATIVE", "WORKFLOWS"], side: "left" },
  { lines: ["PROMPT", "ARCHITECTURE"], side: "left" },
];

/* ============================================================
   NINE DISTINCT INPUT MECHANISMS — one per capability.
   Each is drawn in canonical "up" orientation spanning the radial
   band r≈195–250, then rotated to its discipline angle. Every one
   uses a different physical principle so no two inputs look alike.
   `on` = its capability is currently active (crimson signal + faster).
   ============================================================ */
function InputMech({ i, on, reduced }: { i: number; on: boolean; reduced: boolean }) {
  const dur = (base: string, fast: string) => (on ? fast : base);
  const hot = on ? "var(--machine-crimson-hot)" : "var(--machine-line)";
  const spin = (s?: string) => (reduced || !s ? undefined : s);

  switch (i) {
    case 0: // CREATIVE DIRECTION — vertical piston
      return (
        <g>
          <rect x="292" y="196" width="16" height="40" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
          <g className={spin("piston")} style={{ animationDuration: dur("2.6s", "1.1s") }}>
            <rect x="296" y="200" width="8" height="10" rx="1.5" fill={hot} stroke="var(--machine-deep)" strokeWidth="0.9" style={{ transition: "fill .35s ease" }} />
            <line x1="300" y1="210" x2="300" y2="232" stroke="var(--machine-line)" strokeWidth="2.6" strokeLinecap="round" />
          </g>
          <rect x="294" y="230" width="12" height="5" rx="1.5" fill="var(--machine-line)" />
        </g>
      );
    case 1: // GENERATIVE AI — gear transmission
      return (
        <g>
          <g transform="translate(300 210)"><g className={spin(on ? "gear-cw-fast" : "gear-cw")} style={{ animationDuration: dur("14s", "4s") }}><GearShape r={15} teeth={9} fill="var(--machine-deep)" stroke={hot} hub={false} /></g></g>
          <g transform="translate(300 236)"><g className={spin("gear-ccw")} style={{ animationDuration: dur("9s", "3s") }}><GearShape r={9} teeth={7} fill="var(--machine-line)" hub={false} /></g></g>
        </g>
      );
    case 2: // VISUAL DEVELOPMENT — sliding linkage
      return (
        <g>
          <rect x="297" y="196" width="6" height="52" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
          <g className={spin("piston")} style={{ animationDuration: dur("3s", "1.3s") }}>
            <rect x="290" y="212" width="20" height="9" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
            <circle cx="300" cy="216.5" r="2" fill={hot} style={{ transition: "fill .35s ease" }} />
          </g>
          <line x1="291" y1="198" x2="291" y2="246" stroke="var(--machine-line)" strokeWidth="1" opacity="0.5" />
          <line x1="309" y1="198" x2="309" y2="246" stroke="var(--machine-line)" strokeWidth="1" opacity="0.5" />
        </g>
      );
    case 3: // CINEMATIC STORYTELLING — rotary clutch (two engaging discs)
      return (
        <g>
          <g transform="translate(300 208)"><g className={spin("gear-cw")} style={{ animationDuration: dur("12s", "3.5s") }}>
            <circle r="12" fill="var(--machine-deep)" stroke={hot} strokeWidth="1.3" style={{ transition: "stroke .35s ease" }} />
            {[0, 90, 180, 270].map((d) => <rect key={d} x="-2" y="-14" width="4" height="5" rx="1" transform={`rotate(${d})`} fill="var(--machine-line)" />)}
          </g></g>
          <g transform="translate(300 232)"><g className={spin("gear-ccw")} style={{ animationDuration: dur("12s", "3.5s") }}>
            <circle r="9" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1.2" />
            {[45, 135, 225, 315].map((d) => <rect key={d} x="-1.6" y="-11" width="3.2" height="4" rx="1" transform={`rotate(${d})`} fill="var(--machine-deep)" />)}
          </g></g>
        </g>
      );
    case 4: // AI IMAGE + VIDEO — belt / wheel system
      return (
        <g>
          <line x1="291" y1="206" x2="291" y2="238" stroke="var(--machine-line)" strokeWidth="2.4" />
          <line x1="309" y1="206" x2="309" y2="238" stroke="var(--machine-line)" strokeWidth="2.4" />
          <line x1="291" y1="206" x2="309" y2="206" stroke={hot} strokeWidth="1.4" className={spin("channel-flow")} style={{ transition: "stroke .35s ease" }} />
          <line x1="291" y1="238" x2="309" y2="238" stroke={hot} strokeWidth="1.4" className={spin("channel-flow")} style={{ transition: "stroke .35s ease" }} />
          <g transform="translate(300 206)"><g className={spin("gear-cw")} style={{ animationDuration: dur("8s", "2.6s") }}><GearShape r={9} teeth={7} fill="var(--machine-deep)" stroke={hot} hub={false} /></g></g>
          <g transform="translate(300 238)"><g className={spin("gear-cw")} style={{ animationDuration: dur("8s", "2.6s") }}><GearShape r={9} teeth={7} fill="var(--machine-deep)" stroke="var(--machine-line)" hub={false} /></g></g>
        </g>
      );
    case 5: // CHARACTER DEVELOPMENT — articulated crank
      return (
        <g>
          <rect x="296" y="196" width="8" height="14" rx="2" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
          <g transform="translate(300 216)"><g className={spin("gear-cw")} style={{ animationDuration: dur("5s", "1.8s") }}>
            <line x1="0" y1="0" x2="0" y2="-13" stroke="var(--machine-line)" strokeWidth="3.4" strokeLinecap="round" />
            <circle cy="-13" r="3" fill={hot} style={{ transition: "fill .35s ease" }} />
            <circle r="4.5" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1.2" />
          </g></g>
          <line x1="300" y1="216" x2="300" y2="246" stroke="var(--machine-deep)" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    case 6: // ENVIRONMENT DESIGN — heavy gear assembly
      return (
        <g>
          <g transform="translate(300 214)"><g className={spin(on ? "gear-ccw" : "gear-ccw-slow")} style={{ animationDuration: dur("26s", "7s") }}>
            <GearShape r={21} teeth={12} fill="var(--machine-deep)" stroke={hot} spokes={4} />
          </g></g>
          <g transform="translate(300 240)"><g className={spin("gear-cw")} style={{ animationDuration: dur("10s", "3s") }}><GearShape r={8} teeth={6} fill="var(--machine-line)" hub={false} /></g></g>
        </g>
      );
    case 7: // AI CREATIVE WORKFLOWS — compound (scissor) linkage
      return (
        <g>
          <g className={spin("valve-wiggle")} style={{ transformOrigin: "300px 222px", animationDuration: dur("4s", "1.6s") }}>
            <line x1="291" y1="200" x2="309" y2="244" stroke="var(--machine-line)" strokeWidth="2.6" strokeLinecap="round" />
            <line x1="309" y1="200" x2="291" y2="244" stroke="var(--machine-line)" strokeWidth="2.6" strokeLinecap="round" />
          </g>
          <circle cx="300" cy="222" r="3.4" fill="var(--machine-deep)" stroke={hot} strokeWidth="1.2" style={{ transition: "stroke .35s ease" }} />
          <circle cx="291" cy="200" r="2.4" fill="var(--machine-line)" />
          <circle cx="309" cy="200" r="2.4" fill="var(--machine-line)" />
          <circle cx="291" cy="244" r="2.4" fill="var(--machine-line)" />
          <circle cx="309" cy="244" r="2.4" fill="var(--machine-line)" />
        </g>
      );
    default: // PROMPT ARCHITECTURE — precision escapement
      return (
        <g>
          <g transform="translate(300 212)"><g className={spin(on ? "gear-cw-fast" : "gear-cw")} style={{ animationDuration: dur("16s", "4.5s") }}>
            <GearShape r={13} teeth={8} fill="var(--machine-deep)" stroke={hot} hub={false} />
          </g></g>
          <g className={spin("escapement")} style={{ transformOrigin: "300px 236px" }}>
            <path d="M293 230 L300 242 L307 230" fill="none" stroke={hot} strokeWidth="2.2" strokeLinecap="round" style={{ transition: "stroke .35s ease" }} />
          </g>
          <circle cx="300" cy="236" r="2" fill="var(--machine-line)" />
        </g>
      );
  }
}

export default function CreativeCore() {
  const { data, theme } = useStore();
  const disciplines = data.core;
  const N = disciplines.length;
  const reduced = useReducedMotion();

  /* ---- state: auto-demonstration + hover preview + click lock ---- */
  const [autoIdx, setAutoIdx] = useState(0);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [lockedIdx, setLockedIdx] = useState<number | null>(null);
  const locked = lockedIdx !== null;
  const sel = hoverIdx ?? lockedIdx ?? autoIdx;
  const d = disciplines[sel];
  const nodeAngle = (i: number) => i * (360 / N);

  /* 20s automatic demonstration — pauses while the user hovers or locks */
  useEffect(() => {
    if (reduced || locked || hoverIdx !== null) return;
    const iv = window.setInterval(() => setAutoIdx((a) => (a + 1) % N), 20000);
    return () => clearInterval(iv);
  }, [reduced, locked, hoverIdx, N]);

  const pick = (i: number) => {
    if (locked && lockedIdx === i) { setLockedIdx(null); setAutoIdx(i); }
    else setLockedIdx(i);
  };

  /* ---- 3D theme rebuild — machine dismantles, inverts, reassembles ---- */
  const [rebuilding, setRebuilding] = useState(false);
  const [frozen, setFrozen] = useState<Record<string, string> | null>(null);
  const prevTheme = useRef(theme);
  useEffect(() => {
    if (prevTheme.current !== theme) {
      prevTheme.current = theme;
      if (!reduced) {
        const cs = getComputedStyle(document.documentElement);
        const grab = (v: string) => cs.getPropertyValue(v).trim();
        setFrozen({
          "--machine-plate": grab("--machine-plate"),
          "--machine-deep": grab("--machine-deep"),
          "--machine-line": grab("--machine-line"),
          "--machine-inv": grab("--machine-inv"),
        });
        setRebuilding(true);
        const t = window.setTimeout(() => { setRebuilding(false); setFrozen(null); }, 1560);
        return () => clearTimeout(t);
      }
    }
  }, [theme, reduced]);

  /* ---- THE GEAR POINTER — central drive gear → primary arm → secondary
         gear joint → telescoping extension arm → crimson tip.
         Choreography on capability change: RETRACT → ROTATE → EXTEND. ---- */
  const discRef = useRef<HTMLDivElement>(null);
  const handG = useRef<SVGGElement>(null);
  const extG = useRef<SVGGElement>(null);
  const baseGear = useRef<SVGGElement>(null);
  const jointGear = useRef<SVGGElement>(null);
  const tipGear = useRef<SVGGElement>(null);
  const st = useRef({
    ang: 0, angV: 0, ext: 0, extV: 0,
    phase: "extend" as "retract" | "rotate" | "extend" | "idle",
    baseRot: 0, jointRot: 0, tipRot: 0,
    raf: 0, last: 0,
  });
  const selRef = useRef(sel);

  /* capability change → mechanical handoff (never an instant flip) */
  useEffect(() => {
    selRef.current = sel;
    if (!reduced) st.current.phase = "retract";
  }, [sel, reduced]);

  useEffect(() => {
    if (reduced) {
      const a = nodeAngle(selRef.current);
      handG.current?.setAttribute("transform", `rotate(${a} 300 300)`);
      extG.current?.setAttribute("transform", `translate(0 -150)`);
      return;
    }
    const loop = (t: number) => {
      const s = st.current;
      const dt = Math.min(0.045, s.last ? (t - s.last) / 1000 : 0.016);
      s.last = t;
      const tAng = nodeAngle(selRef.current);
      let kA = 46, cA = 10.5, kE = 84, cE = 10.2, tExt = 1;

      if (s.phase === "retract") {
        tExt = 0.06; kE = 110; cE = 18;
        if (s.ext < 0.12 && Math.abs(s.extV) < 0.4) s.phase = "rotate";
      } else if (s.phase === "rotate") {
        tExt = 0.06;
        if (Math.abs(((tAng - s.ang + 180) % 360 + 360) % 360 - 180) < 1.6 && Math.abs(s.angV) < 26) s.phase = "extend";
      } else if (s.phase === "extend") {
        tExt = 1;
        if (s.ext > 0.985 && Math.abs(s.extV) < 0.25) s.phase = "idle";
      }

      /* weighted springs — mass + inertia + mechanical resistance */
      const dA = ((tAng - s.ang + 180) % 360 + 360) % 360 - 180;
      s.angV += (dA * kA - s.angV * cA) * dt;
      s.ang += s.angV * dt;
      s.extV += ((tExt - s.ext) * kE - s.extV * cE) * dt;
      s.ext = Math.max(0, Math.min(1.06, s.ext + s.extV * dt));

      /* the gears participate — spin with angular + extension velocity */
      const speed = 14 + Math.min(420, Math.abs(s.angV) * 2.1) + Math.abs(s.extV) * 40;
      s.baseRot += speed * dt;
      s.jointRot -= speed * 2.2 * dt;
      s.tipRot += speed * 3.1 * dt;

      const ext = Math.min(1, s.ext);
      handG.current?.setAttribute("transform", `rotate(${s.ang.toFixed(2)} 300 300)`);
      /* telescoping: extension arm slides out along the primary arm */
      extG.current?.setAttribute("transform", `translate(0 ${(-150 * ext).toFixed(1)})`);
      baseGear.current?.setAttribute("transform", `rotate(${(s.baseRot % 360).toFixed(1)})`);
      jointGear.current?.setAttribute("transform", `translate(0 -52) rotate(${(s.jointRot % 360).toFixed(1)})`);
      /* pointer gears separate along the arm as it extends */
      tipGear.current?.setAttribute("transform", `translate(0 ${(-150 * ext).toFixed(1)}) rotate(${(s.tipRot % 360).toFixed(1)})`);

      s.raf = requestAnimationFrame(loop);
    };
    st.current.raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(st.current.raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const spin = (s?: string) => (reduced || !s ? undefined : s);
  const onCrim = "var(--machine-crimson-hot)";

  return (
    <section id="core" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          huge
          label="02 — WHAT I DO"
          title="CORE"
          desc="One machine powers nine disciplines — direction, generation and story held together by a single clockwork transmission. Hover to engage an input; click to lock it."
          meta="09 INPUTS · ONE ENGINE"
        />

        <div className="mt-12 grid lg:grid-cols-[minmax(0,1.14fr)_minmax(0,352px)] gap-12 lg:gap-24 xl:gap-40 items-center">
          {/* ================= THE CLOCKWORK ENGINE ================= */}
          <Reveal>
            <div ref={discRef} className="relative mx-auto w-full max-w-[660px] aspect-square select-none">
              <div className={`mech-stage ${rebuilding ? "mech-rebuild" : ""}`} style={frozen ?? undefined}>
                <svg viewBox="0 0 600 600" className={`absolute inset-0 w-full h-full ${rebuilding ? "mech-tilt" : ""}`}>

                  {/* ============ L1 — DEEP BACKPLATE / SHADOW CAVITY ============ */}
                  <g className="rb-a">
                    <circle cx="300" cy="300" r="258" fill="rgba(0,0,0,0.30)" />
                    <circle cx="300" cy="300" r="252" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="2" />
                    {/* mounting bolt circle */}
                    {Array.from({ length: 12 }).map((_, i) => {
                      const [x, y] = polar(300, 300, 245, (i / 12) * 360 + 15);
                      return <circle key={i} cx={x} cy={y} r="3" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />;
                    })}
                  </g>

                  {/* ============ L2 — OUTER STRUCTURAL HOUSING (segmented plates) ============ */}
                  <g className="rb-b">
                    <circle cx="300" cy="300" r="238" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.6" />
                    {/* segmented plates with machined grooves + inset screws */}
                    {Array.from({ length: 9 }).map((_, i) => {
                      const a0 = (i / 9) * 360, a1 = a0 + 34;
                      const [x0, y0] = polar(300, 300, 236, a0);
                      const [x1, y1] = polar(300, 300, 236, a1);
                      const [xi0, yi0] = polar(300, 300, 208, a0);
                      const [xi1, yi1] = polar(300, 300, 208, a1);
                      const [sx, sy] = polar(300, 300, 222, a0 + 17);
                      return (
                        <g key={i}>
                          <path d={`M${x0} ${y0} A236 236 0 0 1 ${x1} ${y1} L${xi1} ${yi1} A208 208 0 0 0 ${xi0} ${yi0} Z`}
                            fill={i % 2 ? "var(--machine-plate)" : "var(--machine-deep)"} stroke="var(--machine-line)" strokeWidth="1" opacity="0.9" />
                          <circle cx={sx} cy={sy} r="2.6" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="0.9" />
                          <line x1={sx - 1.4} y1={sy} x2={sx + 1.4} y2={sy} stroke="var(--machine-deep)" strokeWidth="0.8" />
                        </g>
                      );
                    })}
                    {/* recessed channel + inspection panels + calibration marks */}
                    <circle cx="300" cy="300" r="206" fill="none" stroke="var(--machine-deep)" strokeWidth="8" opacity="0.85" />
                    {[45, 135, 225, 315].map((deg) => {
                      const [x, y] = polar(300, 300, 222, deg);
                      return (
                        <g key={deg} transform={`rotate(${deg} ${x} ${y})`}>
                          <rect x={x - 16} y={y - 8} width="32" height="16" rx="2.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1" />
                          <line x1={x - 8} y1={y} x2={x + 8} y2={y} stroke="var(--machine-line)" strokeWidth="1.2" />
                        </g>
                      );
                    })}
                    {Array.from({ length: 72 }).map((_, i) => {
                      const long = i % 6 === 0;
                      const [x1, y1] = polar(300, 300, 200, (i / 72) * 360);
                      const [x2, y2] = polar(300, 300, long ? 192 : 196, (i / 72) * 360);
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={long ? "var(--machine-inv)" : "var(--machine-line)"}
                        strokeWidth={long ? 1.3 : 0.7} opacity={long ? 0.45 : 0.5} />;
                    })}
                  </g>

                  {/* ============ L3 — ROTATING TRANSMISSION RING ============ */}
                  <g className="rb-c">
                    <g className={spin("gear-cw")} style={{ animationDuration: "150s" }}>
                      <circle cx="300" cy="300" r="184" fill="none" stroke="var(--machine-line)" strokeWidth="13" opacity="0.85" />
                      {Array.from({ length: 36 }).map((_, i) => {
                        const [x, y] = polar(300, 300, 184, (i / 36) * 360);
                        return <rect key={i} x="-4.5" y="-9" width="9" height="18" rx="1.5"
                          transform={`translate(${x} ${y}) rotate(${(i / 36) * 360})`}
                          fill={i % 4 === 0 ? "var(--machine-line)" : "var(--machine-deep)"} stroke="var(--machine-plate)" strokeWidth="0.8" />;
                      })}
                      {/* indexing blocks + locking pins on the ring */}
                      {Array.from({ length: 9 }).map((_, i) => {
                        const [x, y] = polar(300, 300, 184, (i / 9) * 360);
                        const active = i === sel;
                        return <circle key={i} cx={x} cy={y} r={active ? 5 : 3.6}
                          fill={active ? onCrim : "var(--machine-deep)"} stroke="var(--machine-line)" strokeWidth="1.2"
                          style={{ transition: "fill .35s ease, r .35s ease" }} />;
                      })}
                    </g>
                    {/* thin precision ring rotating the other way */}
                    <g className={spin("gear-ccw")} style={{ animationDuration: "110s" }}>
                      <circle cx="300" cy="300" r="166" fill="none" stroke="var(--machine-line)" strokeWidth="1" strokeDasharray="4 9" opacity="0.6" />
                    </g>
                  </g>

                  {/* ============ L4 — SECONDARY CLOCKWORK (meshing gear train) ============ */}
                  <g className="rb-c">
                    <circle cx="300" cy="300" r="152" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" opacity="0.5" />
                    {/* primary train — each gear meshes the next, opposite directions */}
                    <g transform="translate(244 236)"><g className={spin("gear-cw")} style={{ animationDuration: "22s" }}><GearShape r={30} teeth={14} fill="var(--machine-plate)" spokes={4} /></g></g>
                    <g transform="translate(286 214)"><g className={spin("gear-ccw")} style={{ animationDuration: "11s" }}><GearShape r={15} teeth={9} fill="var(--machine-deep)" /></g></g>
                    <g transform="translate(356 240)"><g className={spin("gear-cw")} style={{ animationDuration: "30s" }}><GearShape r={26} teeth={13} fill="var(--machine-plate)" spokes={3} /></g></g>
                    <g transform="translate(388 272)"><g className={spin("gear-ccw")} style={{ animationDuration: "8s" }}><GearShape r={11} teeth={8} fill="var(--machine-line)" hub={false} /></g></g>
                    <g transform="translate(238 330)"><g className={spin("gear-ccw")} style={{ animationDuration: "18s" }}><GearShape r={20} teeth={11} fill="var(--machine-deep)" /></g></g>
                    <g transform="translate(368 352)"><g className={spin("gear-cw")} style={{ animationDuration: "13s" }}><GearShape r={17} teeth={10} fill="var(--machine-plate)" /></g></g>
                    {/* eccentric wheel + crank + toothed rail */}
                    <g transform="translate(300 388)">
                      <g className={spin("gear-cw")} style={{ animationDuration: "9s" }}>
                        <circle r="16" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                        <circle cx="7" cy="0" r="3.4" fill={onCrim} opacity="0.9" />
                      </g>
                    </g>
                    <rect x="262" y="404" width="76" height="7" rx="2" fill="var(--machine-line)" opacity="0.8" />
                    {Array.from({ length: 10 }).map((_, i) => (
                      <rect key={i} x={264 + i * 7.4} y="400" width="3.4" height="4" fill="var(--machine-deep)" />
                    ))}
                  </g>

                  {/* ============ L5 — NINE DISTINCT INPUT MECHANISMS ============ */}
                  <g className="rb-c">
                    {disciplines.map((dis, i) => (
                      <g key={dis.id} transform={`rotate(${nodeAngle(i)} 300 300)`}>
                        <InputMech i={i} on={i === sel} reduced={reduced} />
                        {/* crimson energy feed when this input is active */}
                        {i === sel && !reduced && (
                          <line x1="300" y1="250" x2="300" y2="200" stroke={onCrim} strokeWidth="2" className="channel-flow" opacity="0.9" />
                        )}
                      </g>
                    ))}
                  </g>

                  {/* ============ L6 — ASYMMETRIC PISTONS (linear motion) ============ */}
                  <g className="rb-d">
                    <g transform="translate(186 300)">
                      <rect x="-11" y="-26" width="22" height="52" rx="4" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                      <g className={spin("piston")} style={{ animationDuration: "2.4s" }}>
                        <rect x="-7" y="-20" width="14" height="12" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                        <line x1="0" y1="-8" x2="0" y2="14" stroke="var(--machine-line)" strokeWidth="3" strokeLinecap="round" />
                      </g>
                    </g>
                    <g transform="translate(430 316)">
                      <rect x="-9" y="-20" width="18" height="40" rx="3.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                      <g className={spin("piston")} style={{ animationDuration: "3.1s", animationDelay: "0.8s" }}>
                        <rect x="-5.5" y="-15" width="11" height="10" rx="2" fill="var(--machine-line)" />
                        <line x1="0" y1="-5" x2="0" y2="12" stroke="var(--machine-line)" strokeWidth="2.6" strokeLinecap="round" />
                      </g>
                    </g>
                  </g>

                  {/* ============ L7 — CENTRAL HEART + ESCAPEMENT + BALANCE ============ */}
                  <g className="rb-e">
                    <circle cx="300" cy="300" r="96" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.6" />
                    <circle cx="300" cy="300" r="78" fill="var(--machine-plate)" stroke="var(--machine-line)" strokeWidth="1.4" />
                    {/* rotating inner ring */}
                    <g className={spin("gear-ccw")} style={{ animationDuration: "40s" }}>
                      <circle cx="300" cy="300" r="62" fill="none" stroke="var(--machine-line)" strokeWidth="1.2" strokeDasharray="3 6" opacity="0.7" />
                    </g>
                    {/* roman fragments + clock calibration */}
                    <text x="300" y="252" textAnchor="middle" className="f-mono" fontSize="9" fill="var(--machine-inv)" opacity="0.8">XII</text>
                    <text x="348" y="304" textAnchor="middle" className="f-mono" fontSize="9" fill="var(--machine-inv)" opacity="0.8">III</text>
                    <text x="300" y="356" textAnchor="middle" className="f-mono" fontSize="9" fill="var(--machine-inv)" opacity="0.8">VI</text>
                    <text x="252" y="304" textAnchor="middle" className="f-mono" fontSize="9" fill="var(--machine-inv)" opacity="0.8">IX</text>
                    {/* mechanical locking collar */}
                    {Array.from({ length: 8 }).map((_, i) => {
                      const [x, y] = polar(300, 300, 70, (i / 8) * 360 + 22.5);
                      return <rect key={i} x={x - 3} y={y - 2} width="6" height="4" rx="1" transform={`rotate(${(i / 8) * 360 + 22.5} ${x} ${y})`} fill="var(--machine-line)" />;
                    })}
                    {/* balance wheel — continuous damped oscillation */}
                    <g transform="translate(352 258)">
                      <g className={spin("balance")} style={{ transformBox: "fill-box", transformOrigin: "center" }}>
                        <circle r="14" fill="none" stroke="var(--machine-line)" strokeWidth="2.4" />
                        <line x1="-12" y1="0" x2="12" y2="0" stroke="var(--machine-line)" strokeWidth="1.6" />
                        <circle r="2.6" fill="var(--machine-inv)" />
                      </g>
                    </g>
                    {/* central power hub — small & precise crimson indicator */}
                    <circle cx="300" cy="300" r="34" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.4" />
                    <circle cx="300" cy="300" r="8" fill="var(--machine-line)" />
                    <circle cx="300" cy="300" r="3.4" fill={onCrim} className={spin("core-beat")} />
                  </g>

                  {/* ============ L8 — THE GEAR POINTER (foreground) ============ */}
                  <g className="rb-d">
                    <g ref={handG} transform="rotate(0 300 300)">
                      <g transform="translate(300 300)">
                        {/* telescoping extension arm + secondary gear joint + crimson tip */}
                        <g ref={extG} transform="translate(0 0)">
                          <rect x="-3.4" y="-70" width="6.8" height="80" rx="2" fill="var(--machine-inv)" stroke="var(--machine-line)" strokeWidth="1.1" />
                          <line x1="-1.2" y1="-66" x2="-1.2" y2="4" stroke="var(--machine-line)" strokeWidth="0.7" opacity="0.4" />
                          {/* secondary gear travels with the extension */}
                          <g ref={tipGear} transform="translate(0 0)">
                            <g transform="translate(0 -58)"><GearShape r={8} teeth={7} fill="var(--machine-plate)" hub={false} /></g>
                          </g>
                          {/* crimson pointer tip */}
                          <polygon points="0,-88 7,-66 3.5,-62 -3.5,-62 -7,-66" fill={onCrim} stroke="var(--machine-line)" strokeWidth="1.1" />
                          <polygon points="0,-82 3.4,-67 -3.4,-67" fill="var(--machine-inv)" opacity="0.8" />
                        </g>
                        {/* counterweight behind the hub */}
                        <rect x="-7" y="24" width="14" height="20" rx="3" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.1" />
                        <circle cx="0" cy="46" r="6.5" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1.1" />
                        {/* primary arm / sleeve */}
                        <rect x="-5.5" y="-56" width="11" height="60" rx="2.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.2" />
                        <rect x="-8" y="-58" width="16" height="8" rx="2" fill="var(--machine-line)" stroke="var(--machine-deep)" strokeWidth="1" />
                        {/* secondary gear joint at the arm base */}
                        <g ref={jointGear} transform="translate(0 -52)">
                          <GearShape r={10} teeth={8} fill="var(--machine-plate)" hub={false} />
                        </g>
                        {/* central drive gear — powers the whole pointer */}
                        <g ref={baseGear} transform="rotate(0)">
                          <GearShape r={26} teeth={13} fill="var(--machine-plate)" spokes={4} />
                        </g>
                        {/* fixed central pivot — never disconnects */}
                        <circle r="7.5" fill="var(--machine-deep)" stroke="var(--machine-line)" strokeWidth="1.3" />
                        <circle r="2.6" fill={onCrim} />
                      </g>
                    </g>
                    {/* front mounting brackets overlapping the housing */}
                    {[200, 340].map((deg) => (
                      <path key={deg}
                        d={`M${polar(300, 300, 244, deg - 15)[0]} ${polar(300, 300, 244, deg - 15)[1]} A244 244 0 0 1 ${polar(300, 300, 244, deg + 15)[0]} ${polar(300, 300, 244, deg + 15)[1]}`}
                        fill="none" stroke="var(--machine-line)" strokeWidth="7" strokeLinecap="round" opacity="0.9" />
                    ))}
                  </g>
                </svg>
              </div>

              {/* ============ NINE CAPABILITY DOCKING MODULES ============ */}
              {disciplines.map((dis, i) => {
                const Icon = disciplineIcons[dis.icon] ?? disciplineIcons.direction;
                const isActive = i === sel;
                const isHover = i === hoverIdx;
                const deg = nodeAngle(i);
                const [x, y] = polar(50, 50, 44.5, deg);
                const fill = isActive ? "var(--machine-crimson-hot)" : isHover ? "var(--machine-inv)" : "var(--machine-plate)";
                const iconColor = isActive ? "#f4f2ed" : isHover ? "var(--machine-plate)" : "var(--machine-inv)";
                const lb = LBL[i % LBL.length];
                const labelWrap =
                  lb.side === "above" ? "absolute -top-10 inset-x-0 flex flex-col items-center" :
                  lb.side === "left" ? "absolute right-full top-1/2 -translate-y-1/2 pr-3 flex flex-col items-end" :
                  "absolute left-full top-1/2 -translate-y-1/2 pl-3 flex flex-col items-start";
                return (
                  <button key={dis.id}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onFocus={() => setHoverIdx(i)}
                    onBlur={() => setHoverIdx(null)}
                    onClick={() => pick(i)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${x}%`, top: `${y}%` }}
                    aria-label={dis.name}
                    aria-pressed={isActive}>
                    <span className="relative grid place-items-center transition-all duration-400 mat-texture"
                      style={{
                        width: 74, height: 74,
                        backgroundColor: fill,
                        color: iconColor,
                        /* chamfered housing — clipped corner + recessed panel */
                        clipPath: "polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)",
                        boxShadow: isActive
                          ? "inset 0 0 0 1.5px rgba(244,242,237,0.45), 0 12px 26px -14px rgba(0,0,0,0.55)"
                          : "inset 0 0 0 1.5px color-mix(in srgb, var(--machine-inv) 22%, transparent)",
                        transform: isHover && !isActive ? "translateY(-2px)" : "none",
                      }}>
                      <Icon size={28} strokeWidth={1.8} />
                      <span className={`absolute -top-2 -left-2 f-mono text-[9px] tracking-widest px-1.5 py-0.5 rounded-sm ${isActive || isHover ? "bg-[#f4f2ed] text-[var(--crim-panel)]" : "bg-[var(--machine-inv)] text-[var(--machine-plate)]"}`}>
                        {dis.num}
                      </span>
                      {/* mounting screw + connector stub */}
                      <span className="absolute bottom-1.5 right-2 w-1.5 h-1.5 rounded-full" style={{ background: "color-mix(in srgb, var(--machine-inv) 40%, transparent)" }} />
                    </span>
                    <span className={`${labelWrap} pointer-events-none`}>
                      {lb.lines.map((ln) => (
                        <span key={ln} className={`f-tech font-bold text-[12px] tracking-[0.12em] leading-[1.3] whitespace-nowrap transition-colors duration-300 ${lb.side === "left" ? "text-right" : "text-left"}`}
                          style={{ color: isActive ? "var(--machine-crimson-hot)" : "var(--ink2)" }}>
                          {ln}
                        </span>
                      ))}
                    </span>
                  </button>
                );
              })}

              <div className="absolute -bottom-7 inset-x-0 flex items-center justify-center gap-3 f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">
                <span className="w-8 h-px bg-[var(--line)]" />
                GEAR POINTER — {locked ? "LOCKED" : hoverIdx !== null ? "PREVIEW" : "AUTO DEMO"} · CORE/{disciplines[sel].num}
                <span className="w-8 h-px bg-[var(--line)]" />
              </div>
            </div>
          </Reveal>

          {/* ================= DETAIL CARD ================= */}
          <Reveal delay={0.1}>
            <div className="mat-outer mat-texture rounded-xl p-6 sm:p-8 relative overflow-hidden"
              style={{ boxShadow: "inset 0 0 0 1.5px color-mix(in srgb, var(--outer-ink) 18%, transparent)" }}>
              <span className="absolute top-0 left-0 h-[3px] bg-[var(--crim-panel)] scan-pass" style={{ width: "42%" }} aria-hidden />
              <div key={d.id} className="dossier-swap">
                <div className="flex items-center justify-between">
                  <span className="f-mono text-[11px] tracking-[0.3em] text-[var(--crim-panel)]">{d.num} / 09</span>
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
                  <span className="text-[var(--crim-panel)]">CORE/{d.num}</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
