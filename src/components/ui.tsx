import React, { useCallback, useEffect, useRef, useState } from "react";
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

/* ============================================================
   UNIVERSAL SECTION HEAD
   SECTION NUMBER + EDITORIAL HEADING + SHORT DESCRIPTION + CRIMSON ACCENT
   ============================================================ */
export function SectionHead({
  label, title, titleAccent, titleNode, desc, meta, id, long, huge,
}: {
  label: string; title?: string; titleAccent?: string; titleNode?: React.ReactNode;
  desc?: string; meta?: string; id?: string; long?: boolean; huge?: boolean;
}) {
  const [numPart, ...rest] = label.split("—");
  const namePart = rest.join("—").trim();
  return (
    <Reveal>
      <div id={id} className="scroll-mt-28 border-b border-[var(--line)] pb-6">
        <div className="flex items-end justify-between gap-6">
          {/* compact technical label — small index + dash + section name */}
          <span className="inline-flex items-center gap-2.5 f-mono text-[10px] sm:text-[11px] tracking-[0.26em] text-[var(--ink2)] border border-[var(--line)] rounded-[6px] px-3 py-1.5"
            style={{ background: "color-mix(in srgb, var(--sup1) 55%, transparent)" }}>
            <span className="text-[var(--crimson)] font-semibold">{numPart.trim()}</span>
            {namePart ? (
              <>
                <span aria-hidden>—</span>
                <span style={{ color: "var(--ink)" }}>{namePart}</span>
              </>
            ) : null}
          </span>
          {meta && (
            <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.22em] text-[var(--ink2)] pb-0.5 hidden md:block shrink-0">{meta}</span>
          )}
        </div>
        <h2 className={`f-display leading-[0.95] tracking-wide mt-3 ${huge ? "text-[clamp(2.8rem,7.5vw,5.8rem)]" : long ? "text-[clamp(1.5rem,3.7vw,3.15rem)]" : "text-[clamp(2rem,5.2vw,4.2rem)] whitespace-nowrap overflow-hidden text-ellipsis"}`}>
          {titleNode ?? (
            <>
              {title}
              {titleAccent && <span className="text-[var(--crimson)]"> {titleAccent}</span>}
            </>
          )}
        </h2>
        {desc && <p className="mt-4 max-w-[74ch] text-[13px] sm:text-[14px] leading-relaxed text-[var(--ink2)]">{desc}</p>}
      </div>
    </Reveal>
  );
}

/* ---------- media slot (empty editable placeholder or loaded media) ---------- */
export function MediaSlot({
  item, ratio, className = "", showLabel = true, onClick,
}: {
  item: MediaItem; ratio: string; className?: string; showLabel?: boolean; onClick?: () => void;
}) {
  const isVideo = item.kind === "video";
  return (
    <figure
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } } : undefined}
      className={`relative overflow-hidden rounded-lg border border-[var(--line)] mat-page-card group ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {item.src ? (
        isVideo ? (
          onClick ? (
            <video src={item.src} muted playsInline className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
          ) : (
            <video src={item.src} controls className="absolute inset-0 w-full h-full object-cover" />
          )
        ) : item.kind === "audio" ? (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <audio src={item.src} controls className="w-full" />
          </div>
        ) : (
          <img src={item.src} alt={item.label} draggable={false} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
        )
      ) : (
        <EmptySlot item={item} />
      )}

      {/* video hover → VIEW */}
      {isVideo && onClick && (
        <span className="absolute inset-0 grid place-items-center pointer-events-none">
          <span className="f-tech font-bold text-[12px] tracking-[0.3em] px-4 py-2.5 rounded-lg bg-[var(--ink)] text-[var(--page)] opacity-0 group-hover:opacity-95 translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2.5">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg>
            VIEW
          </span>
        </span>
      )}

      {onClick && (
        <span className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: "inset 0 0 0 2px var(--crimson)" }} />
      )}
      {onClick && !isVideo && (
        <span className="absolute top-2 right-2 w-7 h-7 grid place-items-center rounded-lg bg-[var(--ink)] text-[var(--page)] opacity-0 group-hover:opacity-90 transition-all duration-300 pointer-events-none">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
        </span>
      )}
      {showLabel && (
        <figcaption className="absolute left-0 bottom-0 f-mono text-[9px] tracking-[0.22em] px-2 py-1 bg-[var(--ink)] text-[var(--page)] opacity-80">
          {item.label}
        </figcaption>
      )}
    </figure>
  );
}

export function EmptySlot({ item, compact = false }: { item: MediaItem; compact?: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-center p-3"
      style={{ backgroundImage: "repeating-linear-gradient(135deg, transparent 0 14px, var(--line-soft) 14px 15px)" }}>
      <svg width={compact ? 16 : 22} height={compact ? 16 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--ink2)] opacity-70">
        <rect x="3" y="3" width="18" height="18" /><path d="M3 15l5-5 4 4 3-3 6 6" /><circle cx="9" cy="9" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      {(item.emptyLines ?? ["ADD IMAGE"]).map((l, i) => (
        <span key={i} className={`f-mono tracking-[0.26em] text-[var(--ink2)] ${compact ? "text-[8px]" : "text-[10px]"} ${i === 0 ? "text-[var(--crimson)]" : "opacity-75"}`}>
          {l}
        </span>
      ))}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return <span className="f-tech text-[10px] font-semibold tracking-[0.18em] px-2.5 py-1.5 rounded-lg border border-current opacity-90">{children}</span>;
}

/* ============================================================
   FULLSCREEN MEDIA VIEWER — shared by Show Reel, AI Lab, ARC
   seek + mute/unmute + play/pause + close X · never reloads
   ============================================================ */
export function FullscreenViewer({
  items, index, ratio, onClose, setIndex, autoPlay = false,
}: {
  items: MediaItem[]; index: number; ratio: string;
  onClose: () => void; setIndex: (i: number) => void; autoPlay?: boolean;
}) {
  const item = items[Math.min(index, items.length - 1)];
  const n = items.length;
  const vref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  const fmt = (s: number) => {
    if (!isFinite(s)) return "00:00";
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

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

  useEffect(() => {
    const v = vref.current;
    if (!v) return;
    if (autoPlay) v.play().catch(() => setPlaying(false));
  }, [autoPlay, item.id]);

  const togglePlay = useCallback(() => {
    const v = vref.current;
    if (!v) return;
    if (v.paused) { v.play().catch(() => undefined); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const isVideo = item.kind === "video";

  return (
    <div className="fixed inset-0 z-[90] viewer-in" role="dialog" aria-modal="true" aria-label={item.label}>
      <div className="absolute inset-0 mat-texture" style={{ backgroundColor: "rgba(18,18,22,0.96)" }} onClick={onClose} />

      <div className="absolute top-0 inset-x-0 flex items-center justify-between gap-4 p-4 sm:p-6 z-10">
        <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.26em] text-[#a3a49f]">
          {item.label} — {item.kind.toUpperCase()} · {ratio.replace("/", ":")}
        </span>
        <button onClick={onClose} aria-label="Close viewer"
          className="w-11 h-11 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300">
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
      </div>

      <div className="absolute inset-0 grid place-items-center px-16 sm:px-24 py-20 z-[5]">
        {item.src ? (
          isVideo ? (
            <div className="w-full max-w-[1100px]">
              <video
                key={item.id} ref={vref} src={item.src} muted={muted} playsInline
                onClick={togglePlay}
                onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="w-full rounded-lg border border-[#3a3b41] bg-[#141418]"
                style={{ aspectRatio: ratio, objectFit: "contain" }}
              />
              <div className="mt-3 flex items-center gap-3 sm:gap-4 rounded-lg border border-[#3a3b41] bg-[#1b1c21] px-3 sm:px-4 py-2.5">
                <button onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}
                  className="w-9 h-9 shrink-0 grid place-items-center rounded-lg bg-[var(--crimson)] text-[#f4f2ed] hover:opacity-90 transition-opacity">
                  {playing ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4l14 8-14 8z" /></svg>
                  )}
                </button>
                <span className="f-mono text-[10px] tabular-nums text-[#a3a49f] w-11">{fmt(t)}</span>
                <input
                  type="range" min={0} max={dur || 0} step={0.05} value={Math.min(t, dur || 0)}
                  onChange={(e) => {
                    const v = vref.current;
                    if (!v) return;
                    v.currentTime = Number(e.target.value);
                    setT(v.currentTime);
                  }}
                  aria-label="Seek"
                  className="flex-1 h-[3px] cursor-pointer" style={{ accentColor: "#E72241" }}
                />
                <span className="f-mono text-[10px] tabular-nums text-[#a3a49f] w-11 text-right">{fmt(dur)}</span>
                <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}
                  className="w-9 h-9 shrink-0 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:border-[var(--crimson)] hover:text-[var(--crimson)] transition-colors">
                  {muted ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" /><path d="M16 9l5 6M21 9l-5 6" /></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" /><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" /></svg>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <img src={item.src} alt={item.label} className="max-h-[78vh] max-w-full rounded-lg border border-[#3a3b41]" style={{ aspectRatio: ratio, objectFit: "contain" }} />
          )
        ) : (
          <div className="w-full max-w-[760px] rounded-lg border border-[#3a3b41] bg-[#1b1c21] relative overflow-hidden" style={{ aspectRatio: ratio }}>
            <div className="absolute inset-0 text-[#a3a49f]">
              <EmptySlot item={item} />
            </div>
          </div>
        )}
      </div>

      {n > 1 && (
        <>
          <button onClick={() => setIndex((index - 1 + n) % n)} aria-label="Previous"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M15 5l-7 7 7 7" /></svg>
          </button>
          <button onClick={() => setIndex((index + 1) % n)} aria-label="Next"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-10 w-11 h-11 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      <div className="absolute bottom-4 inset-x-0 text-center f-mono text-[10px] tracking-[0.3em] text-[#a3a49f] z-10">
        {String(index + 1).padStart(2, "0")} / {String(n).padStart(2, "0")} — ESC TO CLOSE
      </div>
    </div>
  );
}

/* ---------- in-view hook (one-shot animations) ---------- */
export function useInView<T extends HTMLElement>(threshold = 0.3): [React.MutableRefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}
