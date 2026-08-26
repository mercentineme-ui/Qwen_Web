import React, { useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

/* ================= APPROVED 2×2 CUBE (preserved unchanged) ================= */
type Axis = "X" | "Y" | "Z";
interface Move { axis: Axis; val: -1 | 1; dir: -1 | 1 }
interface Cubie { id: number; pos: [number, number, number]; orient: string; faces: Record<string, "body" | "crim"> }

const S = 46;
const U = (S + 6) / 2;
const SEQ: Move[] = [
  { axis: "Y", val: -1, dir: 1 },
  { axis: "X", val: 1, dir: 1 },
  { axis: "Y", val: -1, dir: -1 },
  { axis: "X", val: 1, dir: -1 },
  { axis: "Z", val: 1, dir: 1 },
  { axis: "Z", val: 1, dir: -1 },
  { axis: "X", val: -1, dir: -1 },
  { axis: "Y", val: 1, dir: -1 },
];
const initCubies = (): Cubie[] => {
  const out: Cubie[] = [];
  let id = 0;
  for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
    out.push({ id: id++, pos: [x, y, z], orient: "", faces: { px: "body", nx: "body", py: "body", ny: "body", pz: z === 1 ? "crim" : "body", nz: "body" } });
  }
  return out;
};
const inLayer = (c: Cubie, m: Move) => (m.axis === "X" ? c.pos[0] : m.axis === "Y" ? c.pos[1] : c.pos[2]) === m.val;
const rotPos = (p: [number, number, number], axis: Axis, dir: number): [number, number, number] => {
  const [x, y, z] = p;
  if (axis === "X") return [x, -dir * z, dir * y];
  if (axis === "Y") return [dir * z, y, -dir * x];
  return [-dir * y, dir * x, z];
};
const FACES: { k: string; t: string }[] = [
  { k: "pz", t: `translateZ(${S / 2}px)` },
  { k: "nz", t: `rotateY(180deg) translateZ(${S / 2}px)` },
  { k: "px", t: `rotateY(90deg) translateZ(${S / 2}px)` },
  { k: "nx", t: `rotateY(-90deg) translateZ(${S / 2}px)` },
  { k: "ny", t: `rotateX(90deg) translateZ(${S / 2}px)` },
  { k: "py", t: `rotateX(-90deg) translateZ(${S / 2}px)` },
];

function Cube() {
  const { theme } = useStore();
  const reduced = useReducedMotion();
  const [cubies, setCubies] = useState<Cubie[]>(initCubies);
  const [anim, setAnim] = useState<(Move & { angle: number; dur: number }) | null>(null);
  const [hover, setHover] = useState(false);
  const busy = useRef(false);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });
  const seqIdx = useRef(0);

  const commit = (m: Move) =>
    setCubies((cs) => cs.map((c) => inLayer(c, m) ? { ...c, pos: rotPos(c.pos, m.axis, m.dir), orient: `rotate${m.axis}(${m.dir * 90}deg) ${c.orient}`.trim() } : c));

  const play = (m: Move, dur: number) => {
    if (busy.current) return;
    busy.current = true;
    const d = reduced ? 1 : dur;
    setAnim({ ...m, angle: 0, dur: 0 });
    requestAnimationFrame(() => requestAnimationFrame(() => setAnim({ ...m, angle: m.dir * 90, dur: d })));
    window.setTimeout(() => { commit(m); setAnim(null); busy.current = false; }, d + 70);
  };

  useEffect(() => {
    const iv = window.setInterval(() => {
      if (!dragging.current && !busy.current) {
        play(SEQ[seqIdx.current % SEQ.length], 620);
        seqIdx.current++;
      }
    }, 2400);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const onDown = (e: React.PointerEvent) => {
    if (busy.current) return;
    dragging.current = true;
    start.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current || busy.current) return;
    const dx = e.clientX - start.current.x;
    const dy = e.clientY - start.current.y;
    if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    const m: Move = horizontal ? { axis: "Y", val: -1, dir: dx > 0 ? 1 : -1 } : { axis: "X", val: 1, dir: dy > 0 ? 1 : -1 };
    const raw = horizontal ? dx : dy;
    const angle = Math.max(-135, Math.min(135, raw * 0.55));
    setAnim({ ...m, angle: Math.sign(angle) * Math.abs(angle), dur: 0 });
  };
  const onUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (busy.current) return;
    if (anim && anim.dur === 0) {
      const m: Move = { axis: anim.axis, val: anim.val, dir: anim.dir };
      if (Math.abs(anim.angle) >= 45) {
        busy.current = true;
        const snap = Math.sign(anim.angle) as 1 | -1;
        setAnim({ ...m, dir: snap, angle: snap * 90, dur: reduced ? 1 : 260 });
        window.setTimeout(() => { commit({ ...m, dir: snap }); setAnim(null); busy.current = false; }, (reduced ? 1 : 260) + 60);
      } else {
        busy.current = true;
        setAnim({ ...m, angle: 0, dur: reduced ? 1 : 220 });
        window.setTimeout(() => { setAnim(null); busy.current = false; }, (reduced ? 1 : 220) + 50);
      }
    }
  };

  const body = theme === "light" ? "#ddddd8" : "#222328";
  const seam = theme === "light" ? "#222328" : "#ddddd8";

  return (
    <div className="select-none touch-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ cursor: "grab", width: 176, height: 168 }} role="img" aria-label="2 by 2 rubik cube — drag to turn a layer">
      <div style={{ perspective: 780, width: "100%", height: "100%", paddingTop: 18 }}>
        <div style={{
          position: "relative", width: 0, height: 0, left: "50%", top: "50%",
          transformStyle: "preserve-3d",
          transform: `rotateX(-28deg) rotateY(${hover ? 48 : 42}deg) scale(${hover ? 1.06 : 1})`,
          transition: reduced ? "none" : "transform .5s cubic-bezier(.3,.8,.3,1)",
        }}>
          {cubies.map((c) => {
            const [x, y, z] = c.pos;
            const layerActive = anim !== null && inLayer(c, anim);
            let tr = `translate3d(${x * U}px, ${y * U}px, ${z * U}px)`;
            if (layerActive && anim) tr = `rotate${anim.axis}(${anim.angle}deg) ${tr}`;
            tr += c.orient ? ` ${c.orient}` : "";
            return (
              <div key={c.id} style={{
                position: "absolute", width: S, height: S, left: -S / 2, top: -S / 2,
                transformStyle: "preserve-3d", transform: tr,
                transition: layerActive && anim && anim.dur > 0 ? `transform ${anim.dur}ms cubic-bezier(.3,.75,.2,1)` : "none",
              }}>
                {FACES.map((f) => {
                  const crim = c.faces[f.k] === "crim";
                  return (
                    <div key={f.k} style={{
                      position: "absolute", inset: 0, transform: f.t, backfaceVisibility: "hidden",
                      background: crim ? "var(--crimson)" : body,
                      border: `3px solid ${seam}`,
                      borderRadius: 7,
                      boxShadow: crim
                        ? "inset 0 0 0 1px rgba(0,0,0,0.25), inset 0 -8px 14px rgba(0,0,0,0.28), inset 0 6px 10px rgba(255,255,255,0.14)"
                        : `inset 0 0 0 1px ${theme === "light" ? "rgba(0,0,0,0.10)" : "rgba(255,255,255,0.08)"}, inset 0 -8px 14px rgba(0,0,0,0.16)`,
                    }} />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <div className="mx-auto -mt-2 w-24 h-3 rounded-[50%] opacity-25" style={{ background: "radial-gradient(closest-side, #000, transparent)", filter: "blur(3px)" }} />
      <p className="f-mono text-[8px] tracking-[0.26em] text-center opacity-60 mt-1.5" style={{ color: "var(--m-sub)" }}>
        DRAG — TURN LAYER · U R U′ R′ F F′ L D
      </p>
    </div>
  );
}

/* ================= AI LAB SECTION ================= */
export default function AILab() {
  const { data } = useStore();
  const lab = data.aiLab;
  const [videoOpen, setVideoOpen] = useState(false);
  const [tileView, setTileView] = useState<number | null>(null);

  return (
    <section id="ailab" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="mat-outer mat-texture rounded-xl p-5 sm:p-8 lg:p-12 overflow-hidden">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-end justify-between gap-6 border-b pb-5" style={{ borderColor: "var(--m-line)" }}>
                <div className="flex items-end gap-4 min-w-0">
                  <span className="f-mono text-[11px] sm:text-xs tracking-[0.3em] pb-2" style={{ color: "var(--crim-panel)" }}>/04</span>
                  <h2 className="f-display leading-[0.95] text-[clamp(2rem,5.2vw,4.2rem)] tracking-wide whitespace-nowrap">
                    <span style={{ color: "var(--outer-ink)" }}>AI </span>
                    <span style={{ color: "var(--crim-panel)" }}>LAB</span>
                  </h2>
                </div>
                <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.24em] pb-2 hidden md:block" style={{ color: "var(--m-sub)" }}>{lab.subLabel}</span>
              </div>
              <div className="mt-4 md:hidden f-mono text-[10px] tracking-[0.24em]" style={{ color: "var(--m-sub)" }}>{lab.subLabel}</div>
            </div>
            <div className="shrink-0 scale-[0.72] sm:scale-90 lg:scale-100 origin-top-right -mr-6 sm:-mr-3 lg:mr-0">
              <Cube />
            </div>
          </div>

          {/* GHOST.EXE dossier */}
          <Reveal className="mt-8">
            <div className="mat-inner mat-texture chamfer p-6 sm:p-7 relative overflow-hidden">
              <span className="absolute -right-6 -top-10 f-display text-[9rem] leading-none opacity-[0.05] pointer-events-none select-none">GX</span>
              <div className="grid lg:grid-cols-[1.35fr_0.65fr] gap-7 lg:gap-10">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="f-mono text-[9px] tracking-[0.3em] px-2.5 py-1.5 rounded-[6px]" style={{ color: "var(--m-sub)", border: "1px solid var(--line)" }}>{lab.subLabel}</span>
                    <span className="f-striker text-[10px] tracking-[0.16em] px-2.5 py-1.5 rounded-[6px] border" style={{ borderColor: "var(--crimson-rough)", color: "var(--crimson-rough)" }}>{lab.projectType}</span>
                    <span className="f-tech font-bold text-[9px] tracking-[0.26em] px-2.5 py-1.5 rounded-[6px] bg-[var(--crimson)] text-[#ddddd8]">{lab.projectStatus}</span>
                  </div>
                  <h3 className="f-display text-[clamp(2rem,4.4vw,3.4rem)] leading-none mt-4 tracking-wide" style={{ color: "var(--ink)" }}>
                    {(() => { const [a, b] = lab.projectName.split("."); return b ? (<>{a}<span style={{ color: "var(--crimson-rough)" }}>.{b}</span></>) : <span>{a}<span style={{ color: "var(--crimson-rough)" }}>.</span></span>; })()}
                  </h3>
                  <p className="mt-4 max-w-[62ch] text-[14px] sm:text-[15px] leading-relaxed text-[var(--ink)] opacity-90">{lab.projectDescription}</p>
                  <dl className="mt-6 grid sm:grid-cols-3 border-t" style={{ borderColor: "var(--line)" }}>
                    {[["PROJECT", lab.projectName], ["TYPE", "AI / GENERATIVE FILM"], ["TOOLS", lab.tools.join(" / ")]].map(([k, v], i) => (
                      <div key={k} className={`py-3.5 sm:px-4 ${i > 0 ? "sm:border-l border-t sm:border-t-0" : ""}`} style={{ borderColor: "var(--line)" }}>
                        <dt className="f-mono text-[8.5px] tracking-[0.3em] text-[var(--ink2)]">{k}</dt>
                        <dd className="f-tech font-bold text-[12px] sm:text-[12.5px] tracking-[0.1em] mt-1.5 leading-snug text-[var(--ink)]">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="lg:border-l lg:pl-8" style={{ borderColor: "var(--m-line)" }}>
                  <span className="f-mono text-[9px] tracking-[0.3em] block text-[var(--ink2)]">TOOLS IN PLAY</span>
                  <ul className="mt-3.5 flex flex-col">
                    {lab.tools.map((t, i) => (
                      <li key={t} className="group flex items-center gap-3 py-2 border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
                        <span className="f-mono text-[10px] font-semibold tabular-nums" style={{ color: "var(--crimson-rough)" }}>{String(i + 1).padStart(2, "0")}</span>
                        <span className="f-tech font-bold text-[13px] tracking-[0.14em] text-[var(--ink)] group-hover:text-[var(--crimson-rough)] transition-colors duration-300">{t}</span>
                        <span className="ml-auto w-3 h-[2px] origin-right scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{ background: "var(--crimson-rough)" }} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Reveal>

          {/* featured video */}
          <Reveal className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>FEATURED VIDEO — 16:9 · HOVER FOR VIEW</span>
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--crim-panel)" }}>FULL CUT</span>
            </div>
            <MediaSlot item={lab.video} ratio="16/9" className="mat-inner" showLabel={false} onClick={() => setVideoOpen(true)} />
          </Reveal>

          {/* 8 generic media slots */}
          <Reveal className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <span className="f-mono text-[10px] tracking-[0.28em]" style={{ color: "var(--m-sub)" }}>PRODUCTION STILLS — 08 FRAMES</span>
              <span className="f-mono text-[10px] tracking-[0.2em]" style={{ color: "var(--m-sub)" }}>IDENTICAL 16:9 · UPLOAD VIA EDIT</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              {lab.images.map((im, i) => (
                <MediaSlot key={im.id} item={im} ratio="16/9" className="mat-inner" showLabel={false} onClick={() => setTileView(i)} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {videoOpen && (
        <FullscreenViewer items={[lab.video]} index={0} ratio="16/9" onClose={() => setVideoOpen(false)} setIndex={() => undefined} />
      )}
      {tileView !== null && (
        <FullscreenViewer items={lab.images} index={tileView} ratio="16/9" onClose={() => setTileView(null)} setIndex={setTileView} />
      )}
    </section>
  );
}
