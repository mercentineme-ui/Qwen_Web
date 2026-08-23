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
  label: string;            // "01 — MY EXPERTISE"
  title?: string;
  titleAccent?: string;     // rendered crimson after title
  titleNode?: React.ReactNode; // full custom heading (e.g. ARC)
  desc?: string;            // short supporting description
  meta?: string;            // technical metadata, right side
  id?: string;
  long?: boolean;           // smaller clamp for long editorial statements
}) {
  const [numPart, ...rest] = label.split("—");
  const namePart = rest.join("—").trim();
  return (
    <Reveal>
      <div id={id} className="scroll-mt-24 border-b border-[var(--line)] pb-6">
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
  ratio: string; // css aspect-ratio
  className?: string;
  showLabel?: boolean;
  onClick?: () => void;
}) {
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
        item.kind === "video" ? (
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
      {onClick && (
        <span className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ boxShadow: "inset 0 0 0 2px var(--crimson)" }} />
      )}
      {onClick && (
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
