import React, { useEffect, useRef, useState } from "react";
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

/* ---------- section header ---------- */
export function SectionHead({
  num,
  title,
  titleAccent,
  meta,
  id,
}: {
  num: string;
  title: string;
  titleAccent?: string;
  meta?: string;
  id?: string;
}) {
  return (
    <Reveal>
      <div id={id} className="flex items-end justify-between gap-6 border-b border-[var(--line)] pb-5 scroll-mt-24">
        <div className="flex items-end gap-4 min-w-0">
          <span className="f-mono text-[11px] sm:text-xs tracking-[0.3em] text-[var(--crimson)] pb-2 shrink-0">/{num}</span>
          <h2 className="f-display leading-[0.95] text-[clamp(2rem,5.2vw,4.2rem)] tracking-wide whitespace-nowrap overflow-hidden text-ellipsis">
            {title}
            {titleAccent && <span className="text-[var(--crimson)]"> {titleAccent}</span>}
          </h2>
        </div>
        {meta && (
          <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.22em] text-[var(--ink2)] pb-2 hidden md:block shrink-0">
            {meta}
          </span>
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
}: {
  item: MediaItem;
  ratio: string; // css aspect-ratio
  className?: string;
  showLabel?: boolean;
}) {
  return (
    <figure className={`relative overflow-hidden rounded-lg border border-[var(--line)] mat-page-card group ${className}`} style={{ aspectRatio: ratio }}>
      {item.src ? (
        item.kind === "video" ? (
          <video src={item.src} controls className="absolute inset-0 w-full h-full object-cover" />
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
      (es) => es.forEach((e) => e.isIntersecting && (setInView(true), io.disconnect())),
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}
