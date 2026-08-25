import React, { useState } from "react";
import { ArcEntry } from "../lib/data";
import { useHashRoute, useReducedMotion, useStore } from "../lib/store";
import { NavArrowHead } from "./icons";
import { EmptySlot, FullscreenViewer, Reveal, SectionHead } from "./ui";

/* physical looping offset: center = 0, right = +1, left = -1, wraps circularly */
function relPos(i: number, idx: number, n: number) {
  let r = (i - idx + n) % n;
  if (r > n / 2) r -= n;
  return r;
}

function Carousel({ items, idx, setIdx, ratio, wide, onOpen }: {
  items: ArcEntry[]; idx: number; setIdx: (i: number) => void; ratio: string; wide: boolean; onOpen: () => void;
}) {
  const reduced = useReducedMotion();
  const n = items.length;
  return (
    <div className="relative w-full overflow-hidden py-3" style={{ aspectRatio: "16 / 14.5" }}>
      {items.map((it, i) => {
        const rel = relPos(i, idx, n);
        const active = rel === 0;
        if (Math.abs(rel) > 1) return null;
        return (
          <button key={it.id} onClick={() => (active ? onOpen() : setIdx(i))}
            aria-label={active ? `Open ${it.name} fullscreen` : `Select ${it.name}`}
            className={`absolute top-1/2 left-1/2 rounded-xl overflow-hidden border transition-all ${
              active ? "border-[var(--crimson)] z-20 cursor-pointer" : "border-[var(--line)] z-10 cursor-pointer hover:border-[var(--ink2)]"
            }`}
            style={{
              width: wide ? "78%" : "50%",
              aspectRatio: ratio,
              transform: `translate(-50%, -50%) translateX(${rel * (wide ? 62 : 74)}%) scale(${active ? 1 : 0.8})`,
              opacity: active ? 1 : 0.42,
              filter: active ? "none" : "saturate(0.65)",
              transition: reduced ? "none" : "transform .55s cubic-bezier(.3,.85,.3,1), opacity .45s ease, filter .45s ease",
            }}>
            {it.image.src ? (
              <img src={it.image.src} alt={it.name} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 mat-page-card"><EmptySlot item={it.image} /></div>
            )}
            {active && <span className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 2px var(--crimson)" }} />}
            <span className="absolute left-0 bottom-0 f-mono text-[9px] tracking-[0.22em] px-2 py-1 bg-[var(--ink)] text-[var(--page)] opacity-85">
              {it.name}
            </span>
            {active && (
              <span className="absolute top-2 right-2 f-tech font-bold text-[8px] tracking-[0.24em] px-2 py-1 rounded bg-[var(--ink)] text-[var(--page)] opacity-0 hover:opacity-90 transition-opacity">
                EXPAND ⤢
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ArcaneArrow({ onClick, label, dir }: { onClick: () => void; label: string; dir: "left" | "right" }) {
  return (
    <button onClick={onClick} aria-label={label}
      className="group self-center justify-self-center text-[var(--ink2)] hover:text-[var(--crimson)] transition-all duration-300 opacity-30 hover:opacity-95 hover:-translate-y-0.5 focus:outline-none focus-visible:opacity-90"
      style={dir === "right" ? undefined : undefined}>
      <span className="block relative">
        <NavArrowHead size={40} dir={dir === "right" ? "r" : "l"} />
        <span className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[70%] w-[2px] bg-[var(--crimson)] opacity-0 group-hover:opacity-60 transition-opacity duration-300" style={{ marginLeft: "-13px" }} />
      </span>
    </button>
  );
}

function Dossier({ entry, kind }: { entry: ArcEntry; kind: "CHARACTER" | "WORLD" }) {
  return (
    <div key={entry.id} className="dossier-swap mat-page-card mat-texture rounded-xl border border-[var(--line)] p-5 sm:p-6 h-full">
      <span className="f-mono text-[9px] tracking-[0.3em] text-[var(--crimson)]">{kind} DOSSIER</span>
      <h4 className="f-display text-xl sm:text-2xl mt-2 leading-tight">{entry.name}</h4>
      <dl className="mt-4 flex flex-col">
        <div className="py-3 border-t border-[var(--line)] first:border-t-0 grid grid-cols-[110px_1fr] gap-3">
          <dt className="f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)] pt-0.5">NAME</dt>
          <dd className="f-tech font-bold text-[12px] tracking-[0.12em]">{entry.name}</dd>
        </div>
        <div className="py-3 border-t border-[var(--line)] grid grid-cols-[110px_1fr] gap-3">
          <dt className="f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)] pt-0.5">TOOLS USED</dt>
          <dd className={`f-tech font-bold text-[12px] tracking-[0.12em] ${entry.tools ? "" : "text-[var(--ink2)] opacity-60"}`}>
            {entry.tools || "—"}
          </dd>
        </div>
        <div className="py-3 border-t border-[var(--line)] grid grid-cols-[110px_1fr] gap-3">
          <dt className="f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)] pt-0.5">{kind} DESCRIPTION</dt>
          <dd className={`text-[12.5px] sm:text-[13px] leading-relaxed ${entry.description ? "" : "text-[var(--ink2)] opacity-60"}`}>
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
  const [fsOpen, setFsOpen] = useState(false);

  const isChar = mode === "CHARACTERS";
  const items = isChar ? characters : worlds;
  const idx = isChar ? charIdx : worldIdx;
  const setIdx = isChar ? setCharIdx : setWorldIdx;
  const entry = items[Math.min(idx, items.length - 1)] ?? items[0];
  const n = items.length;

  return (
    <section className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <SectionHead
          label="05 — BTS"
          id="arc"
          titleNode={<>A<span className="text-[var(--crimson)]">R</span>C</>}
          desc="AI RE-IMAGINED CONTENT — one selector system, two production modules: character sheets and world building from the same generative pipeline."
          meta="CHARACTER + WORLD MODULES"
        />

        {/* mode switch — ONE ARC system */}
        <Reveal className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            {(["CHARACTERS", "WORLDS"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className={`f-tech font-bold text-[12px] sm:text-[13px] tracking-[0.22em] px-5 sm:px-7 py-3 rounded-lg border transition-all duration-300 ${
                  mode === m
                    ? "bg-[var(--crimson)] border-[var(--crimson)] text-[#f4f2ed] shadow-[0_10px_26px_-12px_rgba(227,34,64,0.7)]"
                    : "border-[var(--line)] text-[var(--ink2)] hover:text-[var(--ink)] hover:border-[var(--ink2)]"
                }`}>
                {m}
              </button>
            ))}
            <span className="f-mono text-[10px] tracking-[0.24em] text-[var(--ink2)] ml-2">
              MODULE — {isChar ? "AI CHARACTER SHEET" : "AI WORLD BUILDING"}
            </span>
          </div>
        </Reveal>

        {/* character-select system: NAV ← → CAROUSEL ← → DOSSIER */}
        <Reveal className="mt-8">
          <div key={mode} className="dossier-swap mat-page-card mat-texture rounded-xl border border-[var(--line)] p-4 sm:p-7">
            <div className="grid lg:grid-cols-[180px_44px_minmax(0,1fr)_44px_300px] gap-3 lg:gap-4 items-stretch">
              {/* LEFT — navigation controls */}
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 items-stretch">
                {items.map((it, i) => (
                  <button key={it.id} onClick={() => setIdx(i)}
                    className={`group shrink-0 lg:shrink flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-all duration-400 ${
                      i === idx
                        ? "border-[var(--crimson)] bg-[color-mix(in_srgb,var(--crimson)_10%,transparent)]"
                        : "border-[var(--line)] hover:border-[var(--ink2)]"
                    }`}>
                    <span className={`w-2.5 h-2.5 rotate-45 transition-all duration-300 ${i === idx ? "bg-[var(--crimson)] scale-110" : "bg-[var(--line)] group-hover:bg-[var(--ink2)]"}`} />
                    <span className={`f-tech font-bold text-[11px] tracking-[0.16em] whitespace-nowrap transition-colors duration-300 ${i === idx ? "text-[var(--crimson)]" : "text-[var(--ink2)] group-hover:text-[var(--ink)]"}`}>
                      {it.name}
                    </span>
                  </button>
                ))}
                <button onClick={() => nav("#/edit")}
                  className="shrink-0 lg:shrink flex items-center gap-3 px-4 py-3.5 rounded-lg border border-dashed border-[var(--line)] f-tech font-bold text-[11px] tracking-[0.16em] text-[var(--ink2)] hover:text-[var(--crimson)] hover:border-[var(--crimson)] transition-all duration-300">
                  <span className="text-[15px] leading-none">+</span> ADD {isChar ? "CHARACTER" : "WORLD"} SLOT
                </button>
              </div>

              {/* prev arrowhead — points LEFT */}
              <ArcaneArrow dir="left" label="Previous" onClick={() => setIdx((idx - 1 + n) % n)} />

              {/* CENTER — large media carousel (click center → fullscreen) */}
              <div className="min-w-0 flex items-center">
                <Carousel items={items} idx={idx} setIdx={setIdx} ratio={isChar ? "9/16" : "16/9"} wide={!isChar} onOpen={() => setFsOpen(true)} />
              </div>

              {/* next arrowhead — points RIGHT */}
              <ArcaneArrow dir="right" label="Next" onClick={() => setIdx((idx + 1) % n)} />

              {/* RIGHT — dossier */}
              <Dossier entry={entry} kind={isChar ? "CHARACTER" : "WORLD"} />
            </div>

            {/* carousel index strip */}
            <div className="mt-5 pt-4 border-t border-[var(--line)] flex items-center gap-3 f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">
              <span className="text-[var(--crimson)]">{String(idx + 1).padStart(2, "0")}</span>
              <span>/ {String(n).padStart(2, "0")} — {isChar ? "CHARACTER" : "WORLD"} SELECT</span>
              <span className="hidden sm:flex items-center gap-1.5 ml-auto">
                {items.map((it, i) => (
                  <button key={it.id} onClick={() => setIdx(i)} aria-label={it.name}
                    className={`h-[5px] rounded-sm transition-all duration-300 ${i === idx ? "w-7 bg-[var(--crimson)]" : "w-3 bg-[var(--line)] hover:bg-[var(--ink2)]"}`} />
                ))}
              </span>
              <span className="hidden md:inline">LOOP — CIRCULAR SEQUENCE · CLICK CENTER TO EXPAND</span>
            </div>
          </div>
        </Reveal>
      </div>

      {/* fullscreen ARC media — X closes the overlay only, ARC state preserved */}
      {fsOpen && (
        <FullscreenViewer
          items={items.map((it) => it.image)}
          index={Math.min(idx, n - 1)}
          ratio={isChar ? "9/16" : "16/9"}
          onClose={() => setFsOpen(false)}
          setIndex={(i) => setIdx(i)}
        />
      )}
    </section>
  );
}
