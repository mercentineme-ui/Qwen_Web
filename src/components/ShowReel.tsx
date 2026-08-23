import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { Island, Kraken, Longship } from "./icons";
import { MediaSlot, Reveal, SectionHead } from "./ui";

export default function ShowReel() {
  const { data } = useStore();
  const { portraits, landscapes } = data.showReel;

  const viewRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(1);
  const [moving, setMoving] = useState(false);
  const drag = useRef({ active: false, startX: 0, startOffset: 0, moved: false });
  const idleTimer = useRef<number | null>(null);

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
    setMoving(true);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => setMoving(false), 900);
  }, []);

  useEffect(() => () => { if (idleTimer.current) clearTimeout(idleTimer.current); }, []);

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

  return (
    <section id="showreel" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead num="03" title="SHOW" titleAccent="REEL" meta="PORTRAITS → LANDSCAPES · DRAG THE SEA" />

        {/* ---------- PORTRAITS ABOVE ---------- */}
        <Reveal className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">PORTRAIT FRAMES — 9:16 · {String(portraits.length).padStart(2, "0")} SLOTS</span>
            <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--crimson)] hidden sm:block">VERTICAL CUTS</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {portraits.map((p) => (
              <MediaSlot key={p.id} item={p} ratio="9/16" />
            ))}
          </div>
        </Reveal>

        {/* ---------- LANDSCAPES BELOW + SEA NAV ---------- */}
        <Reveal className="mt-12">
          <div className="mat-page-card mat-texture rounded-xl border border-[var(--line)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
              <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">
                LANDSCAPE TRACK — 16:9 · DRAG HORIZONTALLY
              </span>
              <div className="flex items-center gap-5 f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)]">
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${moving ? "bg-[var(--crimson)] live-blink" : "bg-[var(--ink2)]"}`} />
                  SHIP — {moving ? "UNDERWAY" : "HELD"}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${!moving ? "bg-[var(--crimson)] live-blink" : "bg-[var(--ink2)]"}`} />
                  KRAKEN — {moving ? "DORMANT" : "RISEN"}
                </span>
              </div>
            </div>

            {/* sea navigation strip */}
            <div className="relative h-[104px] sm:h-[120px] mx-2 sm:mx-4 mt-2 overflow-hidden text-[var(--ink)]">
              {/* sea line-art */}
              <svg className="absolute inset-x-0 bottom-4 w-full h-10 text-[var(--ink2)]" viewBox="0 0 1200 40" preserveAspectRatio="none" fill="none">
                {[10, 20, 30].map((y, i) => (
                  <path key={y} d={`M0 ${y} q 30 -7 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0`}
                    stroke="currentColor" strokeWidth={i === 1 ? 1.6 : 1} strokeOpacity={i === 1 ? 0.7 : 0.4}
                    strokeDasharray={i === 0 ? "14 10" : undefined} className="wave-drift" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>

              {/* island — right end */}
              <div className="absolute right-2 sm:right-5 bottom-5 text-[var(--ink)] opacity-90">
                <Island size={104} />
              </div>

              {/* kraken — rises when the ship pauses */}
              <div className="absolute bottom-3 text-[var(--ink)] opacity-80" style={{ left: "34%" }}>
                <Kraken size={76} rise={!moving} />
              </div>

              {/* longship — travels with the track */}
              <div className="absolute bottom-5 transition-[left] duration-200 ease-linear" style={{ left: `calc(2% + ${progress} * 68%)` }}>
                <div className="ship-bob text-[var(--ink)]">
                  <Longship size={118} />
                </div>
              </div>

              {/* voyage progress ticks */}
              <div className="absolute top-2 inset-x-6 flex justify-between f-mono text-[8px] tracking-[0.2em] text-[var(--ink2)]">
                <span>DEPARTURE</span>
                <span className="text-[var(--crimson)]">{Math.round(progress * 100)}% VOYAGE</span>
                <span>THE ISLAND</span>
              </div>
            </div>

            {/* draggable landscape track */}
            <div ref={viewRef}
              className="track-drag overflow-hidden px-4 sm:px-6 pb-6 pt-1 select-none"
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}>
              <div ref={innerRef} className="flex gap-4 sm:gap-5 w-max"
                style={{ transform: `translateX(${-offset}px)`, transition: drag.current.active ? "none" : "transform .3s cubic-bezier(.25,.8,.3,1)" }}>
                {landscapes.map((l) => (
                  <div key={l.id} className="w-[240px] sm:w-[340px] lg:w-[420px] shrink-0">
                    <MediaSlot item={l} ratio="16/9" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
