import React, { useCallback, useEffect, useRef, useState } from "react";
import { MediaItem } from "../lib/data";

/* ---------- scroll reveal ---------- */
export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        });
      },
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
   SMALL SECTION LABEL + LARGE EDITORIAL HEADING + SHORT DESCRIPTION
   Same family / hierarchy / crimson accent across every section.
   ============================================================ */
export function SectionHead({
  label,
  title,
  titleAccent,
  titleNode,
  desc,
  meta,
  id,
  long,
}: {
  label: string;
  title?: string;
  titleAccent?: string;
  titleNode?: React.ReactNode;
  desc?: string;
  meta?: string;
  id?: string;
  long?: boolean;
}) {
  const [numPart, ...rest] = label.split("—");
  const namePart = rest.join("—").trim();
  return (
    <Reveal>
      <div id={id} className="scroll-mt-28 border-b border-[var(--line)] pb-6">
        <div className="flex items-end justify-between gap-6">
          <span className="f-mono text-[11px] sm:text-xs tracking-[0.3em] text-[var(--ink2)]">
            <span className="text-[var(--crimson)]">{numPart.trim()}</span>
            {namePart ? ` — ${namePart}` : ""}
          </span>
          {meta && (
            <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.22em] text-[var(--ink2)] pb-0.5 hidden md:block shrink-0">
              {meta}
            </span>
          )}
        </div>
        <h2
          className={`f-display leading-[0.95] tracking-wide mt-3 ${
            long
              ? "text-[clamp(1.5rem,3.7vw,3.15rem)]"
              : "text-[clamp(2rem,5.2vw,4.2rem)] whitespace-nowrap overflow-hidden text-ellipsis"
          }`}
        >
          {titleNode ?? (
            <>
              {title}
              {titleAccent && <span className="text-[var(--crimson)]"> {titleAccent}</span>}
            </>
          )}
        </h2>
        {desc && (
          <p className="mt-4 max-w-[74ch] text-[13px] sm:text-[14px] leading-relaxed text-[var(--ink2)]">{desc}</p>
        )}
      </div>
    </Reveal>
  );
}

/* ---------- media slot (empty editable placeholder or loaded media) ---------- */
export function MediaSlot({
  item,
  ratio,
  className = "",
  showLabel = true,
  onClick,
}: {
  item: MediaItem;
  ratio: string;
  className?: string;
  showLabel?: boolean;
  onClick?: () => void;
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
          <img src={item.src} alt={item.label} draggable={false} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" loading="lazy" />
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
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
          </svg>
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
      style={{
        backgroundImage:
          "repeating-linear-gradient(135deg, transparent 0 14px, var(--line-soft) 14px 15px)",
      }}
    >
      <svg width={compact ? 16 : 22} height={compact ? 16 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[var(--ink2)] opacity-70">
        <rect x="3" y="3" width="18" height="18" />
        <path d="M3 15l5-5 4 4 3-3 6 6" />
        <circle cx="9" cy="9" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      {item.emptyLines.map((l, i) => (
        <span key={i} className={`f-mono tracking-[0.26em] text-[var(--ink2)] ${compact ? "text-[8px]" : "text-[10px]"} ${i === 0 ? "text-[var(--crimson)]" : "opacity-75"}`}>
          {l}
        </span>
      ))}
    </div>
  );
}

/* ============================================================
   FULLSCREEN MEDIA VIEWER — shared by Show Reel + AI Lab
   seek + mute/unmute + play/pause + close X · never reloads
   ============================================================ */
export function FullscreenViewer({
  items,
  index,
  ratio,
  onClose,
  setIndex,
  autoPlay = false,
}: {
  items: MediaItem[];
  index: number;
  ratio: string;
  onClose: () => void;
  setIndex: (i: number) => void;
  autoPlay?: boolean;
}) {
  const item = items[index];
  const n = items.length;
  const vref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay);
  const [muted, setMuted] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  const fmt = (s: number) => {
    if (!isFinite(s)) return "00:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
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

      {/* top bar */}
      <div className="absolute top-0 inset-x-0 flex items-center justify-between gap-4 p-4 sm:p-6 z-10">
        <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.26em] text-[#a3a49f]">
          {item.label} — {item.kind.toUpperCase()} · {ratio.replace("/", ":")}
        </span>
        <button onClick={onClose} aria-label="Close viewer"
          className="w-11 h-11 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300">
          <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2" fill="none"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </button>
      </div>

      {/* media — centered, original ratio preserved */}
      <div className="absolute inset-0 grid place-items-center px-16 sm:px-24 py-20 z-[5]">
        {item.src ? (
          isVideo ? (
            <div className="w-full max-w-[1100px]">
              <video
                key={item.id}
                ref={vref}
                src={item.src}
                muted={muted}
                playsInline
                onClick={togglePlay}
                onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                className="w-full rounded-lg border border-[#3a3b41] bg-[#141418]"
                style={{ aspectRatio: ratio, objectFit: "contain" }}
              />
              {/* custom control bar — seek + mute/unmute + play */}
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
                    const val = Number(e.target.value);
                    if (v) v.currentTime = val;
                    setT(val);
                  }}
                  className="vbar-range flex-1"
                  aria-label="Seek"
                />
                <span className="f-mono text-[10px] tabular-nums text-[#a3a49f] w-11">{fmt(dur)}</span>
                <button onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}
                  className="w-9 h-9 shrink-0 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:border-[var(--crimson)] hover:text-[var(--crimson)] transition-colors">
                  {muted ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H3v6h3l5 4zM16 9l6 6M22 9l-6 6" /></svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>
                  )}
                </button>
              </div>
            </div>
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
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300 z-10">
        <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button onClick={() => setIndex((index + 1) % n)} aria-label="Next media"
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center rounded-lg border border-[#3a3b41] text-[#e1e1dc] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300 z-10">
        <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none"><path d="M9 5l7 7-7 7" /></svg>
      </button>

      {/* bottom counter */}
      <div className="absolute bottom-0 inset-x-0 flex flex-col items-center gap-3 p-5 sm:p-6 z-10">
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

/* ---------- small bits ---------- */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="f-tech text-[10px] font-semibold tracking-[0.18em] px-2.5 py-1.5 rounded-lg border border-current opacity-90">
      {children}
    </span>
  );
}

export function LiveDot({ className = "" }: { className?: string }) {
  return <span className={`inline-block w-1.5 h-1.5 bg-[var(--crimson)] live-blink ${className}`} />;
}

/* ---------- in-view hook (for one-shot animations) ---------- */
export function useInView<T extends HTMLElement>(threshold = 0.3): [React.MutableRefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
          }
        });
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}
