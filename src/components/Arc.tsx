import React, { useState } from "react";
import { ArcEntry } from "../lib/data";
import { useReducedMotion, useStore } from "../lib/store";
import { FullscreenViewer, MediaSlot, Reveal, SectionHead } from "./ui";

function Carousel({ items, idx, setIdx, ratio }: { items: ArcEntry[]; idx: number; setIdx: (i: number) => void; ratio: string }) {
  const reduced = useReducedMotion();
  const n = items.length;
  const rel = (i: number) => {
    let r = (i - idx + n) % n;
    if (r > n / 2) r -= n;
    return r;
  };
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="relative w-full overflow-hidden py-3" style={{ aspectRatio: ratio === "9/16" ? "16/14.5" : ratio }}>
      {items.map((it, i) => {
        const r = rel(i);
        const active = r === 0;
        if (Math.abs(r) > 1) return null;
        return (
          <button key={it.id} onClick={() => (active ? setOpen(i) : setIdx(i))}
            aria-label={active ? `Open ${it.name}` : `Select ${it.name}`}
            className={`absolute top-1/2 left-1/2 rounded-xl overflow-hidden border transition-all ${active ? "border-[var(--crimson)] z-20" : "border-[var(--line)] z-10 cursor-pointer hover:border-[var(--ink2)]"}`}
            style={{
              width: ratio === "9/16" ? "47%" : "60%",
              aspectRatio: ratio,
              transform: `translate(-50%, -50%) translateX(${r * (ratio === "9/16" ? 105 : 78)}%) scale(${active ? 1 : 0.8})`,
              opacity: active ? 1 : 0.42,
              filter: active ? "none" : "saturate(0.65)",
              transition: reduced ? "none" : "transform .55s cubic-bezier(.3,.85,.3,1), opacity .45s ease, filter .45s ease",
            }}>
            <MediaSlot item={it.image} ratio={ratio} className="!rounded-none !border-0" showLabel={false} />
            {active && <span className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 2px var(--crimson)" }} />}
            <span className="absolute left-0 bottom-0 f-mono text-[9px] tracking-[0.22em] px-2 py-1 bg-[var(--ink)] text-[var(--page)] opacity-85">{it.name}</span>
          </button>
        );
      })}
      {open !== null && (
        <FullscreenViewer items={items.map((x) => x.image)} index={open} ratio={ratio}
          onClose={() => setOpen(null)} setIndex={(i) => { setIdx(i); setOpen(i); }} />
      )}
    </div>
  );
}

function Dossier({ entry, kind }: { entry: ArcEntry; kind: "CHARACTER" | "WORLD" }) {
  return (
    <div key={entry.id} className="career-wipe-in mat-inner mat-texture rounded-xl border border-[var(--line)] p-5 sm:p-6 h-full">
      <span className="f-mono text-[9px] tracking-[0.3em]" style={{ color: "var(--crimson-rough)" }}>{kind} DOSSIER</span>
      <h4 className="f-display text-xl sm:text-2xl mt-2 leading-tight text-[var(--ink)]">{entry.name}</h4>
      <dl className="mt-4 flex flex-col">
        <div className="py-3 border-t border-[var(--line)] first:border-t-0 grid grid-cols-[110px_1fr] gap-3">
          <dt className="f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)] pt-0.5">NAME</dt>
          <dd className="f-tech font-bold text-[12px] tracking-[0.12em] text-[var(--ink)]">{entry.name}</dd>
        </div>
        <div className="py-3 border-t border-[var(--line)] grid grid-cols-[110px_1fr] gap-3">
          <dt className="f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)] pt-0.5">TOOLS USED</dt>
          <dd className={`f-tech font-bold text-[12px] tracking-[0.12em] ${entry.tools ? "text-[var(--ink)]" : "text-[var(--ink2)] opacity-60"}`}>{entry.tools || "—"}</dd>
        </div>
        <div className="py-3 border-t border-[var(--line)] grid grid-cols-[110px_1fr] gap-3">
          <dt className="f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)] pt-0.5">{kind} DESCRIPTION</dt>
          <dd className={`text-[12.5px] sm:text-[13px] leading-relaxed ${entry.description ? "text-[var(--ink)]" : "text-[var(--ink2)] opacity-60"}`}>{entry.description || "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

export default function Arc() {
  const { data } = useStore();
  const reduced = useReducedMotion();
  const { characters, worlds } = data.arc;
  const [mode, setMode] = useState<"CHARACTERS" | "WORLDS">("CHARACTERS");
  const [charIdx, setCharIdx] = useState(0);
  const [worldIdx, setWorldIdx] = useState(0);

  const isChar = mode === "CHARACTERS";
  const items = isChar ? characters : worlds;
  const idx = isChar ? charIdx : worldIdx;
  const setIdx = isChar ? setCharIdx : setWorldIdx;
  const entry = items[idx] ?? items[0];
  const n = items.length;
  const ratio = isChar ? "9/16" : "16/9";

  /* transparent curved-triangle arrows — bold, minimal, no box */
  const arrowCls = "group self-center justify-self-center w-12 h-16 lg:w-14 lg:h-20 grid place-items-center bg-transparent transition-all duration-300";
  const arrowStyle = { color: "var(--outer-ink)" };
  const curve = (dir: 1 | -1) => (
    <svg width="26" height="30" viewBox="0 0 24 24" className={`transition-all duration-300 opacity-60 group-hover:opacity-100 group-hover:text-[var(--crimson)] ${reduced ? "" : "group-hover:scale-110"}`}
      style={{ transform: dir === -1 ? "scaleX(-1)" : undefined }} aria-hidden>
      <path d="M6.5 12 C11.5 6.5 15.5 4.4 18.5 3.8 C15.8 8 15.8 16 18.5 20.2 C15.5 19.6 11.5 17.5 6.5 12 Z" fill="currentColor" />
    </svg>
  );

  return (
    <section id="arc" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="05 — BTS"
          titleNode={<>A<span style={{ color: "var(--crimson-rough)" }}>R</span>C</>}
          desc="AI RE-IMAGINED CONTENT — one selector system, two production modules: character sheets and world building from the same generative pipeline."
          meta="CHARACTER + WORLD MODULES"
        />

        <Reveal className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            {(["CHARACTERS", "WORLDS"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m}
                className="f-tech font-bold text-[13px] sm:text-[14px] tracking-[0.22em] px-6 sm:px-8 py-3.5 dossier-clip-sm transition-all duration-300"
                style={mode === m
                  ? { background: "var(--ink)", color: "var(--page)", boxShadow: "inset 0 0 0 1.5px var(--ink), 4px 4px 0 color-mix(in srgb, var(--ink) 22%, transparent)" }
                  : { background: "var(--sup1)", color: "var(--ink2)", boxShadow: "inset 0 0 0 1.5px var(--line)" }}>
                {m}
              </button>
            ))}
            <span className="f-mono text-[10px] tracking-[0.24em] text-[var(--ink2)] ml-2">MODULE — {isChar ? "AI CHARACTER SHEET" : "AI WORLD BUILDING"}</span>
          </div>
        </Reveal>

        <Reveal className="mt-8">
          <div key={mode} className="career-wipe-in mat-outer mat-texture rounded-xl p-4 sm:p-7">
            <div className="grid lg:grid-cols-[180px_76px_minmax(0,1fr)_76px_300px] gap-3 lg:gap-4 items-stretch">
              {/* LEFT — slot list */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 items-stretch">
                {items.map((it, i) => (
                  <button key={it.id} onClick={() => setIdx(i)}
                    className={`group shrink-0 lg:shrink flex items-center gap-3 px-4 py-3.5 rounded-lg text-left transition-all duration-400 ${i === idx ? "" : ""}`}
                    style={i === idx
                      ? { background: "color-mix(in srgb, var(--crim-panel) 14%, transparent)", boxShadow: "inset 0 0 0 1.5px var(--crim-panel)" }
                      : { boxShadow: "inset 0 0 0 1px var(--m-line)" }}>
                    <span className={`w-2.5 h-2.5 rotate-45 transition-all duration-300 ${i === idx ? "scale-110" : ""}`}
                      style={{ background: i === idx ? "var(--crim-panel)" : "color-mix(in srgb, var(--outer-ink) 30%, transparent)" }} />
                    <span className="f-tech font-bold text-[11px] tracking-[0.16em] whitespace-nowrap transition-colors duration-300"
                      style={{ color: i === idx ? "var(--outer-ink)" : "var(--m-sub)" }}>
                      {it.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* LEFT arrow */}
              <button onClick={() => setIdx((idx - 1 + n) % n)} aria-label="Previous" className={arrowCls} style={arrowStyle}>
                {curve(-1)}
              </button>

              {/* CENTER — carousel */}
              <div className="min-w-0 flex items-center">
                <Carousel items={items} idx={idx} setIdx={setIdx} ratio={ratio} />
              </div>

              {/* RIGHT arrow */}
              <button onClick={() => setIdx((idx + 1) % n)} aria-label="Next" className={arrowCls} style={arrowStyle}>
                {curve(1)}
              </button>

              {/* RIGHT — dossier */}
              <Dossier entry={entry} kind={isChar ? "CHARACTER" : "WORLD"} />
            </div>

            <div className="mt-5 pt-4 border-t flex items-center gap-3 f-mono text-[9px] tracking-[0.26em]" style={{ borderColor: "var(--m-line)", color: "var(--m-sub)" }}>
              <span style={{ color: "var(--crim-panel)" }}>{String(idx + 1).padStart(2, "0")}</span>
              <span>/ {String(n).padStart(2, "0")} — {isChar ? "CHARACTER" : "WORLD"} SELECT</span>
              <span className="ml-auto hidden md:inline">LOOP — CIRCULAR SEQUENCE</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
