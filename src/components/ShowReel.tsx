import React, { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion, useStore } from "../lib/store";
import { Island, Kraken, Longship } from "./icons";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

function useTin() {
  const fired = useRef(false);
  return (arrived: boolean, progress: number) => {
    if (arrived && !fired.current) {
      fired.current = true;
      try {
        const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AC();
        const t = ctx.currentTime;
        const master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, t);
        master.gain.exponentialRampToValueAtTime(0.16, t + 0.01);
        master.gain.exponentialRampToValueAtTime(0.0001, t + 0.95);
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass"; bp.frequency.value = 2350; bp.Q.value = 7;
        const o = ctx.createOscillator();
        o.type = "triangle"; o.frequency.setValueAtTime(1970, t);
        o.frequency.exponentialRampToValueAtTime(1420, t + 0.12);
        o.connect(bp).connect(master).connect(ctx.destination);
        o.start(t); o.stop(t + 1);
        window.setTimeout(() => ctx.close().catch(() => undefined), 1200);
      } catch { /* silent */ }
    }
    if (progress < 0.5) fired.current = false;
  };
}

export default function ShowReel() {
  const { data } = useStore();
  const reduced = useReducedMotion();
  const { portraits, landscapes } = data.showReel;
  const playTin = useTin();

  const [pView, setPView] = useState<number | null>(null);
  const [lView, setLView] = useState<number | null>(null);

  const viewRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(1);
  const [moving, setMoving] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const drag = useRef({ active: false, startX: 0, startOffset: 0, moved: false });
  const idleTimer = useRef<number | null>(null);
  const captureTimer = useRef<number | null>(null);

  const measure = useCallback(() => {
    const v = viewRef.current, i = innerRef.current;
    if (!v || !i) return;
    setMaxOffset(Math.max(1, i.scrollWidth - v.clientWidth));
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, landscapes.length]);

  const poke = useCallback(() => {
    setMoving(true); setCapturing(false);
    if (captureTimer.current) clearTimeout(captureTimer.current);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setMoving(false), 900);
  }, []);

  useEffect(() => {
    if (moving || reduced) return;
    const mid = offset > maxOffset * 0.2 && offset < maxOffset * 0.95;
    if (!mid) { setCapturing(false); return; }
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
  useEffect(() => { playTin(arrived, progress); }, [arrived, progress, playTin]);

  const scrub = (ratio: number) => { setOffset(ratio * maxOffset); poke(); };

  return (
    <section id="showreel" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="03 — CREATIVES"
          title="CREATIVES"
          desc="Selected frames and sequences — portrait studies above, a draggable wide track below. Click any frame to open it full screen."
          meta="PORTRAITS → LANDSCAPES · DRAG THE SEA"
        />

        {/* ---------- PORTRAIT STUDIES — 9:16 ---------- */}
        <Reveal className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">PORTRAIT STUDIES — 9:16 · {String(portraits.length).padStart(2, "0")} SLOTS</span>
            <span className="f-mono text-[10px] tracking-[0.28em] hidden sm:block" style={{ color: "var(--crimson-rough)" }}>VERTICAL CUTS · CLICK TO EXPAND</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-5">
            {portraits.map((p, i) => (
              <MediaSlot key={p.id} item={p} ratio="9/16" onClick={() => setPView(i)} />
            ))}
          </div>
        </Reveal>

        {/* ---------- WIDE FRAMES — media uploads FIRST ---------- */}
        <Reveal className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">WIDE FRAMES — 16:9 · {String(landscapes.length).padStart(2, "0")} SLOTS</span>
            <span className="f-mono text-[10px] tracking-[0.28em] hidden sm:block" style={{ color: "var(--crimson-rough)" }}>DRAG HORIZONTALLY</span>
          </div>
          <div ref={viewRef}
            className="track-drag overflow-hidden select-none"
            onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}>
            <div ref={innerRef} className="flex gap-4 sm:gap-5 w-max"
              style={{ transform: `translateX(${-offset}px)`, transition: drag.current.active ? "none" : "transform .2s cubic-bezier(.25,.8,.3,1)" }}>
              {landscapes.map((l, i) => (
                <div key={l.id} className="w-[240px] sm:w-[340px] lg:w-[420px] shrink-0">
                  <MediaSlot item={l} ratio="16/9" onClick={() => setLView(i)} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ---------- SHIP / SEA VOYAGE VISUAL — below the media ---------- */}
        <Reveal className="mt-6">
          <div className="mat-inner mat-texture rounded-xl border border-[var(--line)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
              <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">THE VOYAGE — ODYSSEY</span>
              <div className="flex items-center gap-5 f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)]">
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${moving ? "bg-[var(--crimson)] live-blink" : "bg-[var(--ink2)]"}`} />
                  ODYSSEY — {moving ? "UNDERWAY" : arrived ? "ARRIVED" : capturing ? "CAPTURED" : "HELD"}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${capturing ? "bg-[var(--crimson)] live-blink" : "bg-[var(--ink2)]"}`} />
                  KRAKEN — {capturing ? "ATTACKING" : "DORMANT"}
                </span>
              </div>
            </div>

            <div className="relative h-[112px] sm:h-[128px] mx-2 sm:mx-4 mt-2 overflow-hidden text-[var(--ink)]">
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

              <div className="absolute bottom-3 text-[var(--ink)] opacity-85"
                style={{ left: capturing ? `calc(2% + ${progress * 90}% - 84px)` : "-160px", transition: `left ${capturing ? "2.6s" : "0.45s"} cubic-bezier(.4,.6,.3,1)` }}>
                <Kraken size={92} rise={capturing} />
              </div>

              <div className="absolute bottom-5 transition-[left] duration-200 ease-linear" style={{ left: `calc(2% + ${progress * 90}% - ${progress * 150}px)` }}>
                <div className={`relative ship-bob ${arrived ? "text-[var(--crimson)]" : "text-[var(--ink)]"} transition-colors duration-500`}>
                  <Longship size={118} />
                  {arrived && (
                    <span className="ahoy-pop absolute -top-8 left-1/2 -translate-x-[30%] whitespace-nowrap f-tech font-bold text-[10px] tracking-[0.2em] px-3 py-1.5 rounded-lg bg-[var(--ink)] text-[var(--page)]"
                      style={{ clipPath: "polygon(0 0, 100% 0, 100% 78%, 34% 78%, 26% 100%, 20% 78%, 0 78%)" }}>
                      LAND AHOY!
                    </span>
                  )}
                </div>
              </div>

              <div className="absolute top-2 inset-x-6 flex justify-between f-mono text-[8px] tracking-[0.2em] text-[var(--ink2)]">
                <span>DEPARTURE</span>
                <span style={{ color: "var(--crimson-rough)" }}>{arrived ? "ARRIVED AT THE ISLAND" : `${Math.round(progress * 100)}% VOYAGE`}</span>
                <span>THE ISLAND</span>
              </div>
            </div>

            {/* ---------- VOYAGE / TRACK CONTROL — below ship visual ---------- */}
            <div className="px-5 sm:px-6 pb-6 pt-3 flex items-center gap-4">
              <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)] whitespace-nowrap hidden sm:block">TRACK</span>
              <div className="relative flex-1 h-8 flex items-center"
                onPointerDown={(e) => {
                  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const move = (ev: PointerEvent) => scrub(Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width)));
                  const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
                  window.addEventListener("pointermove", move);
                  window.addEventListener("pointerup", up);
                  scrub(Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)));
                }}>
                <span className="absolute inset-x-0 h-[4px] rounded" style={{ background: "var(--line)" }} />
                <span className="absolute h-[4px] rounded" style={{ width: `${progress * 100}%`, background: "var(--crimson)" }} />
                {Array.from({ length: landscapes.length + 1 }).map((_, i) => (
                  <span key={i} className="absolute w-[3px] h-3 rounded-sm"
                    style={{ left: `calc(${(i / landscapes.length) * 100}% - 1px)`, background: i / landscapes.length <= progress + 0.001 ? "var(--crimson)" : "var(--ink2)", opacity: i / landscapes.length <= progress + 0.001 ? 1 : 0.5 }} />
                ))}
                <span className="absolute w-7 h-7 grid place-items-center rounded-[6px] mat-texture transition-transform duration-200"
                  style={{ left: `calc(${progress * 100}% - 14px)`, background: "var(--outer-bg)", boxShadow: "inset 0 0 0 1.5px var(--crimson)" }}>
                  <span className="flex gap-[3px]">
                    <span className="w-[2px] h-3" style={{ background: "var(--outer-ink)" }} />
                    <span className="w-[2px] h-3" style={{ background: "var(--outer-ink)" }} />
                  </span>
                </span>
              </div>
              <span className="f-mono text-[10px] tracking-[0.2em] tabular-nums whitespace-nowrap" style={{ color: "var(--crimson-rough)" }}>
                {Math.round(progress * 100)}%
              </span>
            </div>
          </div>
        </Reveal>
      </div>

      {pView !== null && (
        <FullscreenViewer items={portraits} index={pView} ratio="9/16" onClose={() => setPView(null)} setIndex={setPView} />
      )}
      {lView !== null && (
        <FullscreenViewer items={landscapes} index={lView} ratio="16/9" onClose={() => setLView(null)} setIndex={setLView} />
      )}
    </section>
  );
}
