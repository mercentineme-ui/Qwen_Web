import React, { useState } from "react";
import { ArcEntry } from "../lib/data";
import { useHashRoute, useReducedMotion, useStore } from "../lib/store";
import { NavArrowHead } from "./icons";
import { FullscreenViewer, Reveal, SectionHead } from "./ui";

/* ARC — one selector system, two production modules.
   Material: matte black #222328 in light · rough matte white #DDDDD8 in dark.
   Crimson appears ONLY in the letter R and the word RE-IMAGINED. */

/* physical looping offset: center = 0, right = +1, left = -1, wraps circularly */
function relPos(i: number, idx: number, n: number) {
  let r = (i - idx + n) % n;
  if (r > n / 2) r -= n;
  return r;
}

function Carousel({ items, idx, setIdx, ratio, wide, onCenter }: {
  items: ArcEntry[]; idx: number; setIdx: (i: number) => void; ratio: string; wide: boolean; onCenter: () => void;
}) {
  const reduced = useReducedMotion();
  const n = items.length;
  return (
    /* fixed container ratio — CHARACTERS and WORLDS keep identical outer dimensions */
    <div className="relative w-full overflow-hidden py-3" style={{ aspectRatio: "16 / 14.5" }}>
      {items.map((it, i) => {
        const rel = relPos(i, idx, n);
        const active = rel === 0;
        if (Math.abs(rel) > 1) return null;
        return (
          <div key={it.id}
            onClick={() => (active ? onCenter() : setIdx(i))}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter") active ? onCenter() : setIdx(i); }}
            aria-label={active ? `${it.name} — open fullscreen` : `Select ${it.name}`}
            className={`absolute top-1/2 left-1/2 rounded-lg overflow-hidden ${active ? "z-20 cursor-pointer" : "z-10 cursor-pointer"}`}
            style={{
              width: wide ? "74%" : "47%",
              aspectRatio: ratio,
              /* unselected neighbours sit farther out — smaller, dimmer, slightly blurred */
              transform: `translate(-50%, -50%) translateX(${rel * (wide ? 96 : 112)}%) scale(${active ? 1 : 0.58})`,
              opacity: active ? 1 : 0.3,
              filter: active ? "none" : "blur(2.5px) saturate(0.45) brightness(0.82)",
              transition: reduced ? "none" : "transform .55s cubic-bezier(.3,.85,.3,1), opacity .45s ease, filter .45s ease",
              boxShadow: active
                ? "inset 0 0 0 2px var(--outer-ink), 0 16px 34px -18px rgba(34,35,40,0.8)"
                : "inset 0 0 0 1px var(--m-line)",
            }}>
            {it.image.src ? (
              <img src={it.image.src} alt={it.name} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              /* empty editable frame inherits the panel material — matte black / matte white */
              <div className="absolute inset-0 mat-outer mat-texture grid place-items-center">
                <div className="flex flex-col items-center gap-2 text-center p-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"
                    className="opacity-60" style={{ color: "var(--outer-ink)" }}>
                    <rect x="3" y="3" width="18" height="18" rx="1" /><circle cx="9" cy="9" r="2" /><path d="M3 17l5-5 4 4 3-3 6 6" />
                  </svg>
                  <span className="f-mono text-[9px] tracking-[0.3em]" style={{ color: "var(--outer-ink)" }}>
                    {it.image.emptyLines?.[0] ?? "ADD IMAGE"}
                  </span>
                  <span className="f-mono text-[8px] tracking-[0.26em] opacity-55" style={{ color: "var(--outer-ink)" }}>
                    {it.image.emptyLines?.[1] ?? (wide ? "16 : 9" : "9 : 16")}
                  </span>
                </div>
                <span className="absolute inset-[7px] border border-dashed pointer-events-none" style={{ borderColor: "var(--m-line)" }} />
              </div>
            )}
            {/* machined corner brackets on the active frame */}
            {active && (
              <>
                <span className="absolute top-1.5 left-1.5 w-3.5 h-3.5 border-t-2 border-l-2 pointer-events-none" style={{ borderColor: "var(--outer-ink)" }} />
                <span className="absolute bottom-1.5 right-1.5 w-3.5 h-3.5 border-b-2 border-r-2 pointer-events-none" style={{ borderColor: "var(--outer-ink)" }} />
              </>
            )}
            <span className="absolute left-0 bottom-0 f-mono text-[9px] tracking-[0.22em] px-2 py-1 opacity-90 pointer-events-none"
              style={{ background: "var(--outer-ink)", color: "var(--outer-bg)" }}>
              {it.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ArcaneArrow({ onClick, label, dir }: { onClick: () => void; label: string; dir: "left" | "right" }) {
  return (
    <button onClick={onClick} aria-label={label}
      className="group self-center justify-self-center transition-all duration-300 opacity-55 hover:opacity-100 focus:outline-none focus-visible:opacity-100"
      style={{ color: "var(--outer-ink)" }}>
      <span className={`block relative transition-transform duration-300 ${dir === "left" ? "group-hover:-translate-x-1.5" : "group-hover:translate-x-1.5"}`}>
        <NavArrowHead size={58} dir={dir} />
        <span className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[70%] w-[2px] opacity-0 group-hover:opacity-60 transition-opacity duration-300"
          style={{ background: "var(--outer-ink)", marginLeft: dir === "left" ? "10px" : "-14px" }} />
      </span>
    </button>
  );
}

function Dossier({ entry, kind }: { entry: ArcEntry; kind: "CHARACTER" | "WORLD" }) {
  return (
    <div key={entry.id} className="dossier-swap mat-texture rounded-lg p-5 sm:p-6 h-full"
      style={{ background: "color-mix(in srgb, var(--outer-ink) 7%, transparent)", boxShadow: "inset 0 0 0 1px var(--m-line)" }}>
      <span className="f-mono text-[9px] tracking-[0.3em]" style={{ color: "var(--m-sub)" }}>{kind} DOSSIER</span>
      <h4 className="f-display text-xl sm:text-2xl mt-2 leading-tight" style={{ color: "var(--outer-ink)" }}>{entry.name}</h4>
      <dl className="mt-4 flex flex-col">
        <div className="py-3 first:border-t-0 grid grid-cols-[110px_1fr] gap-3" style={{ borderTop: "1px solid var(--m-line)" }}>
          <dt className="f-mono text-[9px] tracking-[0.24em] pt-0.5" style={{ color: "var(--m-sub)" }}>NAME</dt>
          <dd className="f-tech font-bold text-[12px] tracking-[0.12em]" style={{ color: "var(--outer-ink)" }}>{entry.name}</dd>
        </div>
        <div className="py-3 grid grid-cols-[110px_1fr] gap-3" style={{ borderTop: "1px solid var(--m-line)" }}>
          <dt className="f-mono text-[9px] tracking-[0.24em] pt-0.5" style={{ color: "var(--m-sub)" }}>TOOLS USED</dt>
          <dd className="f-tech font-bold text-[12px] tracking-[0.12em]" style={{ color: "var(--outer-ink)", opacity: entry.tools ? 1 : 0.55 }}>
            {entry.tools || "—"}
          </dd>
        </div>
        <div className="py-3 grid grid-cols-[110px_1fr] gap-3" style={{ borderTop: "1px solid var(--m-line)" }}>
          <dt className="f-mono text-[9px] tracking-[0.24em] pt-0.5" style={{ color: "var(--m-sub)" }}>{kind} DESCRIPTION</dt>
          <dd className="text-[12.5px] sm:text-[13px] leading-relaxed" style={{ color: "var(--outer-ink)", opacity: entry.description ? 0.92 : 0.55 }}>
            {entry.description || "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function Arc() {
  const { data } = useStore();
  const [, nav] = useHashRoute();
  const { characters, worlds } = data.arc;
  const [mode, setMode] = useState<"CHARACTERS" | "WORLDS">("CHARACTERS");
  const [charIdx, setCharIdx] = useState(0);
  const [worldIdx, setWorldIdx] = useState(0);
  const [viewIdx, setViewIdx] = useState<number | null>(null);

  const isChar = mode === "CHARACTERS";
  const items = isChar ? characters : worlds;
  const idx = isChar ? charIdx : worldIdx;
  const setIdx = isChar ? setCharIdx : setWorldIdx;
  const n = Math.max(1, items.length);

  return (
    <section className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="05 — BTS"
          id="arc"
          titleNode={<>A<span className="text-[var(--crimson)]">R</span>C</>}
          desc="One selector system, two production modules — character sheets and world building from the same generative pipeline."
          meta="CHARACTER + WORLD MODULES"
        />

        {/* BIG subheading — AI RE-IMAGINED CONTENT (only RE-IMAGINED is crimson) */}
        <Reveal className="mt-8">
          <p className="f-display text-[clamp(1.5rem,3.4vw,2.5rem)] tracking-[0.05em] leading-none">
            AI <span className="text-[var(--crimson)]">RE-IMAGINED</span> CONTENT
          </p>
        </Reveal>

        {/* mode switch — ONE ARC system, identical outer dimensions */}
        <Reveal className="mt-8">
          <div className="flex flex-wrap items-center gap-3">
            {(["CHARACTERS", "WORLDS"] as const).map((m) => {
              const on = mode === m;
              return (
                <button key={m} onClick={() => setMode(m)}
                  className="f-tech font-bold text-[12px] sm:text-[13px] tracking-[0.22em] px-5 sm:px-7 py-3 rounded-lg transition-all duration-300"
                  style={on
                    ? { background: "var(--ink)", color: "var(--page)", boxShadow: "inset 0 0 0 1.5px var(--ink)" }
                    : { color: "var(--ink2)", boxShadow: "inset 0 0 0 1.5px var(--line)" }}
                  onMouseEnter={(e) => { if (!on) e.currentTarget.style.boxShadow = "inset 0 0 0 1.5px var(--ink2)"; }}
                  onMouseLeave={(e) => { if (!on) e.currentTarget.style.boxShadow = "inset 0 0 0 1.5px var(--line)"; }}>
                  {m}
                </button>
              );
            })}
            <span className="f-mono text-[10px] tracking-[0.24em] text-[var(--ink2)] ml-2">
              MODULE — {isChar ? "AI CHARACTER SHEET" : "AI WORLD BUILDING"}
            </span>
          </div>
        </Reveal>

        {/* selector system — matte black (light) / matte white (dark) panel */}
        <Reveal className="mt-8">
          <div key={mode} className="dossier-swap mat-outer mat-texture rounded-xl p-4 sm:p-7">
            <div className="grid lg:grid-cols-[180px_58px_minmax(0,1fr)_58px_300px] gap-3 lg:gap-4 items-stretch">
              {/* LEFT — slot list */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 items-stretch">
                {items.map((it, i) => {
                  const on = i === idx;
                  return (
                    <button key={it.id} onClick={() => setIdx(i)}
                      className="group shrink-0 lg:shrink flex items-center gap-3 px-4 py-3.5 rounded-lg text-left transition-all duration-400"
                      style={{
                        boxShadow: on ? "inset 0 0 0 1.5px var(--outer-ink)" : "inset 0 0 0 1px var(--m-line)",
                        background: on ? "color-mix(in srgb, var(--outer-ink) 10%, transparent)" : "transparent",
                      }}>
                      <span className="w-2.5 h-2.5 rotate-45 transition-all duration-300"
                        style={{ background: on ? "var(--outer-ink)" : "var(--m-line)" }} />
                      <span className="f-tech font-bold text-[11px] tracking-[0.16em] whitespace-nowrap transition-colors duration-300"
                        style={{ color: on ? "var(--outer-ink)" : "var(--m-sub)" }}>
                        {it.name}
                      </span>
                    </button>
                  );
                })}
                <button onClick={() => nav("#/edit")}
                  className="shrink-0 lg:shrink flex items-center gap-3 px-4 py-3.5 rounded-lg border border-dashed f-tech font-bold text-[11px] tracking-[0.16em] transition-all duration-300"
                  style={{ borderColor: "var(--m-line)", color: "var(--m-sub)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--outer-ink)"; e.currentTarget.style.color = "var(--outer-ink)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--m-line)"; e.currentTarget.style.color = "var(--m-sub)"; }}>
                  <span className="text-[15px] leading-none">+</span> ADD {isChar ? "CHARACTER" : "WORLD"} SLOT
                </button>
              </div>

              <ArcaneArrow label="Previous" dir="left" onClick={() => setIdx((idx - 1 + n) % n)} />

              {/* CENTER — large active media, neighbors partially visible, click center for fullscreen */}
              <div className="min-w-0 flex items-center">
                <Carousel items={items} idx={idx} setIdx={setIdx} ratio={isChar ? "9/16" : "16/9"} wide={!isChar}
                  onCenter={() => setViewIdx(idx)} />
              </div>

              <ArcaneArrow label="Next" dir="right" onClick={() => setIdx((idx + 1) % n)} />

              <Dossier entry={items[Math.min(idx, n - 1)] ?? items[0]} kind={isChar ? "CHARACTER" : "WORLD"} />
            </div>

            {/* carousel index strip */}
            <div className="mt-5 pt-4 flex items-center gap-3 f-mono text-[9px] tracking-[0.26em]" style={{ borderTop: "1px solid var(--m-line)", color: "var(--m-sub)" }}>
              <span style={{ color: "var(--outer-ink)" }}>{String(idx + 1).padStart(2, "0")}</span>
              <span>/ {String(n).padStart(2, "0")} — {isChar ? "CHARACTER" : "WORLD"} SELECT</span>
              <span className="hidden sm:flex items-center gap-1.5 ml-auto">
                {items.map((it, i) => (
                  <button key={it.id} onClick={() => setIdx(i)} aria-label={it.name}
                    className="h-[5px] rounded-sm transition-all duration-300"
                    style={{ width: i === idx ? 28 : 12, background: i === idx ? "var(--outer-ink)" : "var(--m-line)" }} />
                ))}
              </span>
              <span className="hidden md:inline">LOOP — CIRCULAR SEQUENCE</span>
            </div>
          </div>
        </Reveal>
      </div>

      {viewIdx !== null && (
        <FullscreenViewer
          items={items.map((it) => it.image)}
          index={viewIdx}
          ratio={isChar ? "9/16" : "16/9"}
          onClose={() => setViewIdx(null)}
          setIndex={(i) => { setViewIdx(i); setIdx(i); }}
        />
      )}
    </section>
  );
}
