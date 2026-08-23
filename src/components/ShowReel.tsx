import React, { useCallback, useEffect, useRef, useState } from "react";
import { MediaItem } from "../lib/data";
import { useStore } from "../lib/store";
import { Island, Kraken, Longship } from "./icons";
import { EmptySlot, MediaSlot, Reveal, SectionHead } from "./ui";

/* ================= FULLSCREEN MEDIA VIEWER ================= */

function FullscreenViewer({
  items,
  index,
  ratio,
  onClose,
  setIndex,
}: {
  items: MediaItem[];
  index: number;
  ratio: string;
  onClose: () => void;
  setIndex: (i: number) => void;
}) {
  const item = items[index];
  const n = items.length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((index + 1) % n);
      if (e.key === "ArrowLeft") setIndex((index - 1 + n) % n);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [index, n, onClose, setIndex]);

  return (
    <div className="fixed inset-0 z-[90] viewer-in" role="dialog" aria-modal="true" aria-label={item.label}>
      {/* backdrop */}
      <div className="absolute inset-0 mat-texture" style={{ backgroundColor: "rgba(18,18,22,0.96)" }} onClick={onClose} />

      {/* top bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between gap-4 p-4 sm:p-6">
        <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.26em] text-[#a3a49f]">
          {item.label} — {item.kind.toUpperCase()} · {ratio.replace("/", ":")}
        </span>
        <button onClick={onClose} aria-label="Close viewer"
          className="w-11 h-11 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300">
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
      </div>

      {/* media — centered, original ratio preserved */}
      <div className="absolute inset-0 grid place-items-center px-16 sm:px-24 py-20">
        {item.src ? (
          item.kind === "video" ? (
            <video key={item.id} src={item.src} controls autoPlay
              className="max-h-[78vh] max-w-full rounded-lg border border-[#3a3b41]"
              style={{ aspectRatio: ratio, backgroundColor: "#141418" }} />
          ) : (
            <img key={item.id} src={item.src} alt={item.label}
              className="max-h-[80vh] max-w-full object-contain rounded-lg border border-[#3a3b41]" />
          )
        ) : (
          <div className="relative mat-page-card rounded-lg border border-[#3a3b41] overflow-hidden"
            style={{
              aspectRatio: ratio,
              ...(ratio === "9/16"
                ? { height: "min(76vh, 120vw)" }
                : { width: "min(88vw, 1240px)", maxHeight: "76vh" }),
              backgroundColor: "#202126",
            }}>
            <EmptySlot item={item} />
          </div>
        )}
      </div>

      {/* prev / next */}
      <button onClick={() => setIndex((index - 1 + n) % n)} aria-label="Previous media"
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300">
        <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button onClick={() => setIndex((index + 1) % n)} aria-label="Next media"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300">
        <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* bottom counter */}
      <div className="absolute bottom-0 inset-x-0 flex flex-col items-center gap-3 p-5 sm:p-6">
        <div className="flex items-center gap-1.5">
          {items.map((it, i) => (
            <button key={it.id} onClick={() => setIndex(i)} aria-label={`Open ${it.label}`}
              className={`h-[5px] rounded-sm transition-all duration-300 ${i === index ? "w-7 bg-[var(--crimson)]" : "w-3 bg-[#3a3b41] hover:bg-[#55565c]"}`} />
          ))}
        </div>
        <span className="f-mono text-[11px] tracking-[0.3em] text-[#e1e1dc] tabular-nums">
          <span className="text-[var(--crimson)]">{String(index + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

/* ================= SHOW REEL ================= */

export default function ShowReel() {
  const { data } = useStore();
  const { portraits, landscapes } = data.showReel;
  const [view, setView] = useState<{ group: "p" | "l"; i: number } | null>(null);

  const viewRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(1);
  const [moving, setMoving] = useState(false);
  const drag = useRef({ active: false, startX: 0, startOffset: 0, moved: false });
  const idleTimer = useRef<number | null>(null);
  const strideRef = useRef(0);

  const measure = useCallback(() => {
    const v = viewRef.current, i = innerRef.current;
    if (!v || !i) return;
    setMaxOffset(Math.max(1, i.scrollWidth - v.clientWidth));
    const kids = i.children;
    if (kids.length >= 2) {
      strideRef.current = (kids[1] as HTMLElement).offsetLeft - (kids[0] as HTMLElement).offsetLeft;
    } else if (kids.length === 1) {
      strideRef.current = (kids[0] as HTMLElement).offsetWidth + 20;
    }
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
  const onUp = () => {
    /* snap to the nearest slot boundary — one drag = one leg of the voyage */
    if (drag.current.active && drag.current.moved && strideRef.current > 0) {
      const k = Math.round(offset / strideRef.current);
      const snapped = Math.min(maxOffset, Math.max(0, k * strideRef.current));
      if (snapped !== offset) { setOffset(snapped); poke(); }
    }
    drag.current.active = false;
  };

  const progress = Math.min(1, offset / maxOffset);
  const arrived = progress > 0.985;
  const leg = strideRef.current > 0
    ? Math.min(landscapes.length, Math.floor(offset / strideRef.current) + 1)
    : 1;

  return (
    <section id="showreel" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="03 — CREATIVES"
          title="SHOW"
          titleAccent="REEL"
          desc="Selected frames and sequences — portrait studies above, a draggable wide track below. Click any frame to open it full screen."
          meta="PORTRAITS → LANDSCAPES · DRAG THE SEA"
        />

        {/* ---------- PORTRAIT STUDIES — 9:16 (above) ---------- */}
        <Reveal className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">PORTRAIT STUDIES — 9:16 · {String(portraits.length).padStart(2, "0")} SLOTS</span>
            <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--crimson)] hidden sm:block">VERTICAL CUTS · CLICK TO EXPAND</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {portraits.map((p, i) => (
              <MediaSlot key={p.id} item={p} ratio="9/16" onClick={() => setView({ group: "p", i })} />
            ))}
          </div>
        </Reveal>

        {/* ---------- WIDE FRAMES — 16:9 (below) + SEA NAV ---------- */}
        <Reveal className="mt-12">
          <div className="mat-page-card mat-texture rounded-xl border border-[var(--line)] overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-4">
              <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">
                WIDE FRAMES — 16:9 · DRAG HORIZONTALLY
              </span>
              <div className="flex items-center gap-5 f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)]">
                <span className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 ${moving ? "bg-[var(--crimson)] live-blink" : "bg-[var(--ink2)]"}`} />
                  SHIP — {moving ? "UNDERWAY" : arrived ? "ARRIVED" : "HELD"}
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
              <div className={`absolute right-2 sm:right-5 bottom-5 transition-colors duration-500 ${arrived ? "text-[var(--crimson)]" : "text-[var(--ink)] opacity-90"}`}>
                <Island size={104} />
              </div>

              {/* kraken — rises when the ship pauses */}
              <div className="absolute bottom-3 text-[var(--ink)] opacity-80" style={{ left: "34%" }}>
                <Kraken size={76} rise={!moving} />
              </div>

              {/* longship — travels with the track */}
              <div className="absolute bottom-5 transition-[left] duration-200 ease-linear" style={{ left: `calc(2% + ${progress} * 68%)` }}>
                <div className={`ship-bob ${arrived ? "text-[var(--crimson)]" : "text-[var(--ink)]"} transition-colors duration-500`}>
                  <Longship size={118} />
                </div>
              </div>

              {/* voyage progress ticks */}
              <div className="absolute top-2 inset-x-6 flex justify-between f-mono text-[8px] tracking-[0.2em] text-[var(--ink2)]">
                <span>DEPARTURE</span>
                <span className="text-[var(--crimson)]">
                  {arrived ? "ARRIVED AT THE ISLAND" : `LEG ${String(leg).padStart(2, "0")} / ${String(landscapes.length).padStart(2, "0")} · ${Math.round(progress * 100)}% VOYAGE`}
                </span>
                <span>THE ISLAND</span>
              </div>
            </div>

            {/* draggable landscape track */}
            <div ref={viewRef}
              className="track-drag overflow-hidden px-4 sm:px-6 pb-6 pt-1 select-none"
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}>
              <div ref={innerRef} className="flex gap-4 sm:gap-5 w-max"
                style={{ transform: `translateX(${-offset}px)`, transition: drag.current.active ? "none" : "transform .3s cubic-bezier(.25,.8,.3,1)" }}>
                {landscapes.map((l, i) => (
                  <div key={l.id} className="w-[240px] sm:w-[340px] lg:w-[420px] shrink-0">
                    <MediaSlot item={l} ratio="16/9" onClick={() => setView({ group: "l", i })} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* fullscreen overlay */}
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
