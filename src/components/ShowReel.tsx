import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

/* Thick industrial navigation triangle */
function TriNav({ dir, onClick, disabled, label }: { dir: 1 | -1; onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="group shrink-0 self-center grid place-items-center outline-none transition-all duration-200 active:scale-90 text-[var(--ink2)] hover:text-[var(--crimson)] disabled:opacity-30 disabled:pointer-events-none"
    >
      {/* thick solid triangle */}
      <svg width="34" height="40" viewBox="0 0 34 40" aria-hidden className="transition-transform duration-200 group-hover:scale-110">
        <polygon
          points={dir === 1 ? "4,2 30,20 4,38" : "30,2 4,20 30,38"}
          fill="currentColor"
        />
      </svg>
    </button>
  );
}

export default function ShowReel() {
  const { data } = useStore();
  const { portraits, landscapes } = data.showReel;

  const [pView, setPView] = useState<number | null>(null);
  const [lView, setLView] = useState<number | null>(null);

  const viewRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [maxOffset, setMaxOffset] = useState(1);
  const strideRef = useRef(0);
  const drag = useRef({ active: false, startX: 0, startOffset: 0, moved: false });

  const measure = useCallback(() => {
    const v = viewRef.current, i = innerRef.current;
    if (!v || !i) return;
    setMaxOffset(Math.max(1, i.scrollWidth - v.clientWidth));
    const kids = Array.from(i.children) as HTMLElement[];
    if (kids.length >= 2) strideRef.current = kids[1].offsetLeft - kids[0].offsetLeft;
    else if (kids.length === 1) strideRef.current = kids[0].offsetWidth;
  }, []);
  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, landscapes.length]);

  const onDown = (e: React.PointerEvent) => {
    drag.current = { active: true, startX: e.clientX, startOffset: offset, moved: false };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    setOffset(Math.min(maxOffset, Math.max(0, drag.current.startOffset - dx)));
  };
  const onUp = () => { drag.current.active = false; };

  /* step the carousel by one frame, clamped — coexists with free drag */
  const step = useCallback((dir: 1 | -1) => {
    const stride = strideRef.current || 340;
    setOffset((o) => Math.min(maxOffset, Math.max(0, o + dir * stride)));
  }, [maxOffset]);

  return (
    <section id="showreel" className="relative py-20 lg:py-28 scroll-mt-20 overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="03 — CREATIVES"
          title="CREATIVES"
          desc="Selected frames and sequences — portrait studies above, a draggable wide track below. Click any frame to open it full screen."
          meta="PORTRAITS → LANDSCAPES"
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

        {/* ---------- WIDE FRAMES — horizontal carousel + triangle navigation ---------- */}
        <Reveal className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <span className="f-mono text-[10px] tracking-[0.28em] text-[var(--ink2)]">WIDE FRAMES — 16:9 · {String(landscapes.length).padStart(2, "0")} SLOTS</span>
            <span className="f-mono text-[10px] tracking-[0.28em] hidden sm:block" style={{ color: "var(--crimson-rough)" }}>DRAG HORIZONTALLY</span>
          </div>

          <div className="flex items-stretch gap-3 sm:gap-4">
            {/* LEFT TRIANGLE — previous */}
            <TriNav dir={-1} onClick={() => step(-1)} disabled={offset <= 0} label="Previous wide frame" />

            {/* horizontal draggable track */}
            <div ref={viewRef}
              className="track-drag overflow-hidden select-none flex-1 min-w-0"
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}>
              <div ref={innerRef} className="flex gap-4 sm:gap-5 w-max"
                style={{ transform: `translateX(${-offset}px)`, transition: drag.current.active ? "none" : "transform .45s cubic-bezier(.25,.8,.3,1)" }}>
                {landscapes.map((l, i) => (
                  <div key={l.id} className="w-[240px] sm:w-[340px] lg:w-[420px] shrink-0">
                    <MediaSlot item={l} ratio="16/9" onClick={() => setLView(i)} />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT TRIANGLE — next */}
            <TriNav dir={1} onClick={() => step(1)} disabled={offset >= maxOffset - 1} label="Next wide frame" />
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
