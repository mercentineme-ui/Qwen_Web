import React, { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { GreekShip, Island, SeaThreat } from "./icons";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

/* one short synthesized "dropped metal tea tin" ping (~1s, once) */
function playTin() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    const t = ctx.currentTime;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.2, t + 0.01);
    master.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(2350, t);
    bp.Q.value = 7;
    const o1 = ctx.createOscillator();
    o1.type = "triangle";
    o1.frequency.setValueAtTime(1970, t);
    o1.frequency.exponentialRampToValueAtTime(1420, t + 0.12);
    const o2 = ctx.createOscillator();
    o2.type = "square";
    o2.frequency.setValueAtTime(3340, t);
    const g2 = ctx.createGain();
    g2.gain.value = 0.35;
    o1.connect(bp);
    o2.connect(g2).connect(bp);
    bp.connect(master).connect(ctx.destination);
    o1.start(t); o2.start(t);
    o1.stop(t + 1); o2.stop(t + 1);
    window.setTimeout(() => ctx.close().catch(() => undefined), 1200);
  } catch { /* silent */ }
}

/* physical track control — rail + draggable handle */
function TrackRail({ progress, legs, onScrub }: { progress: number; legs: number; onScrub: (ratio: number) => void }) {
  const railRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [live, setLive] = useState(false);

  const scrub = (clientX: number) => {
    const r = railRef.current?.getBoundingClientRect();
    if (!r) return;
    onScrub(Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
  };
  return (
    <div className="px-4 sm:px-6 pb-6 pt-2 flex items-center gap-4 sm:gap-5">
      <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)] whitespace-nowrap hidden sm:block">TRACK CONTROL</span>
      <div
        ref={railRef}
        className="relative flex-1 h-10 cursor-pointer touch-none"
        role="slider" aria-label="Landscape track position"
        aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}
        onPointerDown={(e) => {
          dragging.current = true;
          setLive(true);
          (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
          scrub(e.clientX);
        }}
        onPointerMove={(e) => dragging.current && scrub(e.clientX)}
        onPointerUp={() => { dragging.current = false; setLive(false); }}
        onPointerCancel={() => { dragging.current = false; setLive(false); }}
      >
        <span className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[3px] rounded" style={{ background: "var(--line)" }} />
        <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-[3px] rounded bg-[var(--crimson)] ${live ? "" : "transition-[width] duration-300"}`}
          style={{ width: `${progress * 100}%` }} />
        {Array.from({ length: legs + 1 }).map((_, i) => (
          <span key={i} className="absolute top-1/2 -translate-y-1/2 w-[3px] h-3 rounded-sm"
            style={{ left: `calc(${(i / legs) * 100}% - 1px)`, background: i / legs <= progress + 0.001 ? "var(--crimson)" : "var(--ink2)", opacity: i / legs <= progress + 0.001 ? 1 : 0.5 }} />
        ))}
        <span
          className={`absolute top-1/2 -translate-y-1/2 w-14 h-[26px] rounded-lg border-[1.5px] mat-texture flex items-center justify-center gap-[3px] ${live ? "" : "transition-[left] duration-300"}`}
          style={{
            left: `calc(${progress} * (100% - 56px))`,
            borderColor: live || progress > 0.985 ? "var(--crimson)" : "var(--ink2)",
            backgroundColor: "var(--sup1)",
            boxShadow: "0 6px 16px -8px rgba(0,0,0,0.55)",
          }}>
          {[-1, 0, 1].map((k) => (
            <span key={k} className="w-[2px] h-3 rounded-sm" style={{ background: live || progress > 0.985 ? "var(--crimson)" : "var(--ink2)" }} />
          ))}
        </span>
      </div>
      <span className="f-mono text-[10px] tracking-[0.2em] text-[var(--crimson)] tabular-nums whitespace-nowrap">
        {Math.round(progress * 100)}%
      </span>
    </div>
  );
}

export default function ShowReel() {
  const { data } = useStore();
  const reduced = useReducedMotion();
  const { portraits, landscapes } = data.showReel;
  const [view, setView] = useState<{ group: "p" | "l"; i: number } | null>(null);

  const viewRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(1);
  const [moving, setMoving] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const drag = useRef({ active: false, startX: 0, startOffset: 0, moved: false });
  const idleTimer = useRef<number | null>(null);
  const captureTimer = useRef<number | null>(null);
  const strideRef = useRef(0);
  const tinFired = useRef(false);

  const measure = useCallback(() => {
    const v = viewRef.current, i = innerRef.current;
    if (!v || !i) return;
    const cards = Array.from(i.children) as HTMLElement[];
    if (cards.length >= 2) strideRef.current = cards[1].offsetLeft - cards[0].offsetLeft;
    else if (cards.length === 1) strideRef.current = cards[0].offsetWidth + 20;
    setMaxOffset(Math.max(1, i.scrollWidth - v.clientWidth));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, landscapes.length]);

  const poke = useCallback(() => {
    setMoving(true);
    setCapturing(false);
    if (captureTimer.current) clearTimeout(captureTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setMoving(false), 900);
  }, []);

  /* sea creature — rises when the voyage pauses midway, releases on drag */
  useEffect(() => {
    if (moving || reduced) return;
    const midVoyage = offset > strideRef.current * 0.35 && offset < maxOffset * 0.985;
    if (!midVoyage) { setCapturing(false); return; }
    captureTimer.current = window.setTimeout(() => setCapturing(true), 1300);
    return () => { if (captureTimer.current) clearTimeout(captureTimer.current); };
  }, [moving, offset, maxOffset, reduced]);

  useEffect(() => () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (captureTimer.current) clearTimeout(captureTimer.current);
  }, []);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { active: true, startX: e.clientX, startOffset: offset, moved: false };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    const next = Math.min(maxOffset, Math.max(0, drag.current.startOffset - dx));
    if (next !== offset) { setOffset(next); poke(); }
  };
  const onUp = () => { drag.current.active = false; };

  const progress = Math.min(1, offset / maxOffset);
  const arrived = progress > 0.985;
  const leg = strideRef.current > 0 ? Math.min(landscapes.length, Math.floor(offset / strideRef.current) + 1) : 1;

  /* island event — flag rises, LAND AHOY!, one tin ping */
  useEffect(() => {
    if (arrived && !tinFired.current) {
      tinFired.current = true;
      playTin();
    }
    if (progress < 0.5) tinFired.current = false;
  }, [arrived, progress]);

  const knowMore = () => {
    document.getElementById("ailab")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
    window.dispatchEvent(new CustomEvent("cbk:lab-video"));
  };

  return (
    <section id="showreel" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="03 — MY WORK"
          title="CREATIVES"
          desc="Selected frames and sequences — portrait studies above, a draggable wide track below. Click any frame to open it full screen."
          meta="PORTRAITS → LANDSCAPES · DRAG THE SEA"
        />

        {/* ---------- PORTRAIT STUDIES — 9:16 (5 slots) ---------- */}
        <Reveal className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">PORTRAIT STUDIES — 9:16 · {String(portraits.length).padStart(2, "0")} SLOTS</span>
            <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--crimson)] hidden sm:block">VERTICAL CUTS · CLICK TO EXPAND</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-5">
            {portraits.map((p, i) => (
              <MediaSlot key={p.id} item={p} ratio="9/16" onClick={() => setView({ group: "p", i })} />
            ))}
          </div>
        </Reveal>

        {/* ---------- WIDE FRAMES — 16:9 (6 slots) + ODYSSEY SEA SYSTEM ---------- */}
        <Reveal className="mt-12">
          <div className="mat-page-card mat-texture rounded-xl border border-[var(--line)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
              <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">
                WIDE FRAMES — 16:9 · DRAG HORIZONTALLY
              </span>
              <div className="flex items-center gap-5 f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)]">
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${moving ? "bg-[var(--crimson)] live-blink" : "bg-[var(--ink2)]"}`} />
                  ODYSSEY — {moving ? "UNDERWAY" : arrived ? "ARRIVED" : capturing ? "CAPTURED" : "HELD"}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${capturing ? "bg-[var(--crimson)] live-blink" : "bg-[var(--ink2)]"}`} />
                  LEVIATHAN — {capturing ? "ATTACKING" : "DORMANT"}
                </span>
              </div>
            </div>

            {/* sea / ship visual */}
            <div className="relative h-[138px] sm:h-[152px] mx-2 sm:mx-4 mt-2 overflow-hidden text-[var(--ink)]">
              <svg className="absolute inset-x-0 bottom-4 w-full h-10 text-[var(--ink2)]" viewBox="0 0 1200 40" preserveAspectRatio="none" fill="none">
                {[10, 20, 30].map((y, i) => (
                  <path key={y} d={`M0 ${y} q 30 -7 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`}
                    stroke="currentColor" strokeWidth={i === 1 ? 1.6 : 1} strokeOpacity={i === 1 ? 0.7 : 0.4}
                    strokeDasharray={i === 0 ? "14 10" : undefined} className="wave-drift" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>

              <div className={`absolute right-2 sm:right-5 bottom-5 transition-colors duration-500 ${arrived ? "text-[var(--crimson)]" : "text-[var(--ink)] opacity-90"}`}>
                <Island size={104} />
              </div>

              <div className="absolute bottom-3 text-[var(--ink)]"
                style={{
                  left: capturing ? `calc(2% + ${progress * 94}% - ${progress * 224 + 118}px)` : "-230px",
                  transition: `left ${capturing ? "2.4s" : "0.45s"} cubic-bezier(.4,.6,.3,1)`,
                }}>
                <SeaThreat size={150} rise={capturing} capturing={capturing} />
              </div>

              <div className="absolute bottom-5 transition-[left] duration-200 ease-linear" style={{ left: `calc(2% + ${progress * 94}% - ${progress * 224}px)` }}>
                <div className={`relative ship-bob transition-colors duration-500 ${arrived ? "text-[var(--crimson)]" : "text-[var(--ink)]"}`}>
                  <GreekShip size={140} arrived={arrived} />
                  {arrived && (
                    <span className="ahoy-pop absolute -top-7 left-1/2 -translate-x-[30%] z-20 whitespace-nowrap f-tech font-bold text-[10px] tracking-[0.2em] px-3 py-1.5 rounded-lg bg-[var(--ink)] text-[var(--page)]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% 78%, 34% 78%, 26% 100%, 20% 78%, 0 78%)" }}>
                      LAND AHOY!
                    </span>
                  )}
                </div>
              </div>

              <div className="absolute top-2 inset-x-6 flex justify-between f-mono text-[8px] tracking-[0.2em] text-[var(--ink2)]">
                <span>DEPARTURE</span>
                <span className="text-[var(--crimson)]">
                  {arrived ? "ARRIVED AT THE ISLAND" : `LEG ${String(leg).padStart(2, "0")} / ${String(landscapes.length).padStart(2, "0")} · ${Math.round(progress * 100)}% VOYAGE`}
                </span>
                <span>THE ISLAND</span>
              </div>
            </div>

            {/* ONE physical track control — directly below the sea visual */}
            <TrackRail progress={progress} legs={landscapes.length}
              onScrub={(ratio) => { setOffset(ratio * maxOffset); poke(); }} />

            {/* landscape media — free horizontal drag */}
            <div ref={viewRef}
              className="track-drag overflow-hidden px-4 sm:px-6 pb-6 pt-1 select-none"
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}>
              <div ref={innerRef} className="flex gap-4 sm:gap-5 w-max"
                style={{ transform: `translateX(${-offset}px)`, transition: drag.current.active ? "none" : "transform .2s cubic-bezier(.25,.8,.3,1)" }}>
                {landscapes.map((l, i) => (
                  <div key={l.id} className="relative w-[240px] sm:w-[340px] lg:w-[420px] shrink-0">
                    <MediaSlot item={l} ratio="16/9" onClick={i === 0 ? undefined : () => setView({ group: "l", i })} />
                    {i === 0 && (
                      <div className="absolute inset-0 z-10 group/first">
                        <div className="absolute inset-0 opacity-0 group-hover/first:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3"
                          style={{ background: "color-mix(in srgb, var(--page) 42%, transparent)" }}>
                          <button onClick={() => setView({ group: "l", i: 0 })}
                            className="btn btn-crimson !px-4 !py-2.5 text-[10px]">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg>
                            VIEW
                          </button>
                          <button onClick={knowMore}
                            className="btn btn-ghost border-[var(--ink)] text-[var(--ink)] !px-4 !py-2.5 text-[10px] bg-[var(--page)]">
                            KNOW MORE ↓
                          </button>
                        </div>
                        <span className="absolute inset-0 pointer-events-none opacity-0 group-hover/first:opacity-100 transition-opacity duration-300"
                          style={{ boxShadow: "inset 0 0 0 2px var(--crimson)" }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {view && (
        <FullscreenViewer
          items={view.group === "p" ? portraits : landscapes}
          index={Math.min(view.i, (view.group === "p" ? portraits : landscapes).length - 1)}
          ratio={view.group === "p" ? "9/16" : "16/9"}
          onClose={() => setView(null)}
          setIndex={(i) => setView({ group: view.group, i })}
        />
      )}
    </section>
  );
}
