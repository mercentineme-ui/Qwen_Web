import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MediaItem } from "../lib/data";

/* ---------- scroll reveal ---------- */
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } }),
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`rv ${className}`} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}

/* ---------- universal section head: small label chip + big heading + description ---------- */
export function SectionHead({
  label, title, titleNode, desc, meta, id,
}: {
  label: string; title?: string; titleNode?: React.ReactNode; desc?: string; meta?: string; id?: string;
}) {
  const [numPart, ...rest] = label.split("—");
  const namePart = rest.join("—").trim();
  return (
    <Reveal>
      <div id={id} className="scroll-mt-28">
        <div className="flex items-center justify-between gap-6">
          <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.26em] inline-flex items-center gap-2.5 px-3 py-2 border border-[var(--line)] rounded-[6px]">
            <span className="text-[var(--crimson-rough)] font-semibold">{numPart.trim()}</span>
            {namePart && (<><span className="text-[var(--crimson-rough)]">—</span><span className="text-[var(--ink)]">{namePart}</span></>)}
          </span>
          {meta && <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.22em] text-[var(--ink2)] hidden md:block shrink-0">{meta}</span>}
        </div>
        <h2 className="f-display leading-[0.95] tracking-wide mt-4 text-[clamp(2rem,5.2vw,4.2rem)]" style={{ color: "var(--ink)" }}>
          {titleNode ?? title}
        </h2>
        {desc && <p className="mt-4 max-w-[74ch] text-[15px] sm:text-[16px] leading-relaxed text-[var(--ink2)]">{desc}</p>}
      </div>
    </Reveal>
  );
}

/* ---------- empty editable slot ---------- */
export function EmptySlot({ item }: { item: MediaItem }) {
  const isVideo = item.kind === "video";
  return (
    <div className="absolute inset-0 mat-page-card"
      style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 16px, var(--line-soft) 16px 17px)" }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center">
        {isVideo ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-[var(--ink2)] opacity-70">
            <rect x="3" y="5" width="13" height="14" rx="1" /><path d="M16 10l5-3v10l-5-3z" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-[var(--ink2)] opacity-70">
            <rect x="3" y="3" width="18" height="18" rx="1" /><circle cx="9" cy="9" r="2" /><path d="M3 17l5-5 4 4 3-3 6 6" />
          </svg>
        )}
        {(item.emptyLines ?? [isVideo ? "ADD VIDEO" : "ADD IMAGE"]).map((l, i) => (
          <span key={i} className={`f-mono tracking-[0.3em] text-[9px] ${i === 0 ? "text-[var(--crimson-rough)]" : "text-[var(--ink2)] opacity-75"}`}>{l}</span>
        ))}
      </div>
      <span className="absolute inset-[6px] border border-dashed pointer-events-none" style={{ borderColor: "var(--line)" }} />
    </div>
  );
}

/* ---------- media slot (empty editable placeholder or loaded media) ---------- */
export function MediaSlot({
  item, ratio, className = "", showLabel = true, onClick, fill = false,
}: {
  item: MediaItem; ratio: string; className?: string; showLabel?: boolean; onClick?: () => void; fill?: boolean;
}) {
  const isVideo = item.kind === "video";
  return (
    <figure
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      className={`relative overflow-hidden rounded-lg border border-[var(--line)] mat-page-card group ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={fill ? { height: "100%", width: "100%" } : { aspectRatio: ratio }}
    >
      {item.src ? (
        isVideo ? (
          <video src={item.src} muted playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
        ) : (
          <img src={item.src} alt={item.label} draggable={false} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        )
      ) : (
        <EmptySlot item={item} />
      )}

      {onClick && (
        <span className="absolute top-2.5 right-2.5 z-10 f-tech font-bold text-[9px] tracking-[0.22em] px-2.5 py-1.5 rounded-[6px] bg-[var(--crimson)] text-[#ddddd8] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-1.5">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg>
          VIEW
        </span>
      )}
      {onClick && (
        <span className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: "inset 0 0 0 2px var(--crimson)" }} />
      )}
      {showLabel && (
        <figcaption className="absolute bottom-2 left-2.5 f-mono text-[8px] tracking-[0.24em] text-[var(--ink2)] opacity-80 pointer-events-none">
          {item.label}
        </figcaption>
      )}
    </figure>
  );
}

/* ============================================================
   FULLSCREEN VIEWER — one reusable overlay for all media.
   ‹ › navigate WITHOUT closing · only ✕ closes.
   White button boxes + black icons in both themes.
   ============================================================ */
export function FullscreenViewer({
  items, index, ratio, onClose, setIndex, autoPlay = false,
}: {
  items: MediaItem[]; index: number; ratio: string;
  onClose: () => void; setIndex: (i: number) => void; autoPlay?: boolean;
}) {
  const n = items.length;
  const item = items[Math.max(0, Math.min(index, n - 1))];

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowRight" && n > 1) setIndex((index + 1) % n);
    if (e.key === "ArrowLeft" && n > 1) setIndex((index - 1 + n) % n);
  }, [onClose, setIndex, index, n]);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onKey]);

  const isVideo = item.kind === "video";
  const ctl = "absolute w-12 h-12 grid place-items-center rounded-lg transition-all duration-300 hover:-translate-y-0.5 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.85)]";
  const ctlStyle = { background: "#ddddd8", color: "#222328" };

  /* rendered through a portal to document.body so the viewer is a true
     page-level layer — never clipped or trapped by an ancestor container. */
  return createPortal(
    <div className="fixed inset-0 z-[100] viewer-in" role="dialog" aria-modal="true"
      style={{ background: "rgba(20,20,24,0.82)", backdropFilter: "blur(20px) saturate(0.75)", WebkitBackdropFilter: "blur(20px) saturate(0.75)" }}
      onClick={onClose}>
      <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-14" onClick={(e) => e.stopPropagation()}>
        <div className="relative max-h-full" style={{ aspectRatio: ratio, maxHeight: "86vh", maxWidth: "92vw" }}>
          {item.src ? (
            isVideo ? (
              <video key={item.id} src={item.src} controls autoPlay={autoPlay} playsInline
                className="h-[86vh] max-w-[92vw] w-auto rounded-lg border border-[rgba(221,221,216,0.2)]"
                style={{ aspectRatio: ratio, objectFit: "contain", background: "#222328" }} />
            ) : (
              <img key={item.id} src={item.src} alt={item.label}
                className="h-[86vh] max-w-[92vw] w-auto object-contain rounded-lg border border-[rgba(221,221,216,0.2)]"
                style={{ aspectRatio: ratio, background: "#222328" }} />
            )
          ) : (
            <div className="h-[70vh] w-[min(92vw,60vh)] rounded-lg border-2 border-dashed grid place-items-center text-center p-8"
              style={{ borderColor: "rgba(221,221,216,0.3)", color: "#ddddd8", aspectRatio: ratio }}>
              <div className="flex flex-col gap-2 items-center">
                <span className="f-mono text-[10px] tracking-[0.3em] text-[#e72241]">{isVideo ? "ADD VIDEO" : "ADD IMAGE"}</span>
                <span className="f-mono text-[9px] tracking-[0.24em] opacity-60">UPLOAD VIA EDIT — SLOT EMPTY</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <button onClick={(e) => { e.stopPropagation(); onClose(); }} aria-label="Close viewer"
        className={`${ctl} top-5 right-5 f-tech font-bold text-[15px]`} style={ctlStyle}>
        ✕
      </button>
      {n > 1 && (
        <>
          {/* cinematic chevron controls — large invisible hit area, bold transparent curved chevron.
              Navigation only; they never close the viewer. */}
          <button onClick={(e) => { e.stopPropagation(); setIndex((index - 1 + n) % n); }} aria-label="Previous media"
            className="group absolute left-0 sm:left-3 top-1/2 -translate-y-1/2 w-20 sm:w-24 h-40 sm:h-52 grid place-items-center cursor-pointer"
            style={{ background: "transparent", border: "none" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ddddd8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
              className="opacity-60 group-hover:opacity-100 group-hover:-translate-x-1.5 transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <path d="M15 4l-8 8 8 8" />
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIndex((index + 1 + n) % n); }} aria-label="Next media"
            className="group absolute right-0 sm:right-3 top-1/2 -translate-y-1/2 w-20 sm:w-24 h-40 sm:h-52 grid place-items-center cursor-pointer"
            style={{ background: "transparent", border: "none" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#ddddd8" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"
              className="opacity-60 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all duration-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
              <path d="M9 4l8 8-8 8" />
            </svg>
          </button>
          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 f-mono text-[10px] tracking-[0.3em]" style={{ color: "rgba(221,221,216,0.75)" }}>
            {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
          </span>
        </>
      )}
    </div>,
    document.body
  );
}
