import React, { useState } from "react";
import { ArcEntry } from "../lib/data";
import { useHashRoute, useReducedMotion, useStore } from "../lib/store";
import { NavArrowHead } from "./icons";
import { EmptySlot, FullscreenViewer, Reveal } from "./ui";

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
            className={`absolute top-1/2 left-1/2 rounded-xl overflow-hidden border ${
              active ? "border-[var(--ink)] z-20 cursor-pointer" : "z-10 cursor-pointer border-[var(--line)] hover:border-[var(--ink2)]"
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
              <div className="absolute inset-0 mat-page-card">
                <EmptySlot item={it.image} />
              </div>
            )}
            {active && <span className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 2px var(--ink)" }} />}
            <span className="absolute left-0 bottom-0 f-mono text-[9px] tracking-[0.22em] px-2 py-1 bg-[var(--ink)] text-[var(--page)] opacity-85">
              {it.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* transparent arrowheads — left points LEFT, right points RIGHT; hover solidifies */
function ArcaneArrow({ onClick, label, dir }: { onClick: () => void; label: string; dir: "left" | "right" }) {
  return (
    <button onClick={onClick} aria-label={label}
      className="group self-center justify-self-center text-[var(--ink2)] hover:text-[var(--ink)] transition-all duration-300 opacity-35 hover:opacity-95 focus:outline-none focus-visible:opacity-95">
      <span className={`block relative transition-transform duration-300 ${dir === "left" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}>
        <NavArrowHead size={40} dir={dir} />
        <span className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[70%] w-[2px] bg-[var(--ink)] opacity-0 group-hover:opacity-60 transition-opacity duration-300"
          style={{ marginLeft: dir === "left" ? "12px" : "-14px" }} />
      </span>
    </button>
  );
}

function Dossier({ entry, kind }: { entry: ArcEntry; kind: "CHARACTER" | "WORLD" }) {
  return (
    <div key={entry.id} className="dossier-swap mat-texture rounded-xl border border-[var(--line)] p-5 sm:p-6 h-full"
      style={{ backgroundColor: "#DDDDD8", color: "#222328", boxShadow: "5px 5px 0 rgba(34,35,40,0.16)" }}>
      <span className="f-mono text-[9px] tracking-[0.3em] text-[#59595B]">{kind} DOSSIER</span>
      <h4 className="f-display text-xl sm:text-2xl mt-2 leading-tight">{entry.name}</h4>
      <dl className="mt-4 flex flex-col">
        <div className="py-3 border-t first:border-t-0 grid grid-cols-[110px_1fr] gap-3" style={{ borderColor: "rgba(34,35,40,0.18)" }}>
          <dt className="f-mono text-[9px] tracking-[0.24em] text-[#59595B] pt-0.5">NAME</dt>
          <dd className="f-tech font-bold text-[12px] tracking-[0.12em]">{entry.name}</dd>
        </div>
        <div className="py-3 border-t grid grid-cols-[110px_1fr] gap-3" style={{ borderColor: "rgba(34,35,40,0.18)" }}>
          <dt className="f-mono text-[9px] tracking-[0.24em] text-[#59595B] pt-0.5">TOOLS USED</dt>
          <dd className={`f-tech font-bold text-[12px] tracking-[0.12em] ${entry.tools ? "" : "text-[#59595B] opacity-60"}`}>
            {entry.tools || "—"}
          </dd>
        </div>
        <div className="py-3 border-t grid grid-cols-[110px_1fr] gap-3" style={{ borderColor: "rgba(34,35,40,0.18)" }}>
          <dt className="f-mono text-[9px] tracking-[0.24em] text-[#59595B] pt-0.5">{kind} DESCRIPTION</dt>
          <dd className={`text-[12.5px] sm:text-[13px] leading-relaxed ${entry.description ? "" : "text-[#59595B] opacity-60"}`}>
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
    <section id="arc" className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        {/* ONE ARC system — matte outer block (black in light, matte white in dark) */}
        <Reveal>
          <div className="mat-outer mat-texture rounded-xl p-5 sm:p-8 xl:p-10 relative overflow-hidden">
            <span className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "var(--m-line)" }} />
            <span className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "var(--m-line)" }} />

            {/* head — the ONLY crimson: the R and RE-IMAGINED */}
            <div className="flex items-center justify-between gap-6">
              <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.26em] inline-flex items-center gap-2.5 px-3 py-2 rounded-[6px]"
                style={{ border: "1px solid var(--m-line)", color: "var(--outer-ink)" }}>
                <span style={{ color: "var(--m-sub)" }}>05</span>
                <span style={{ color: "var(--m-sub)" }}>—</span>
                <span>BTS</span>
              </span>
              <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.22em] hidden md:block" style={{ color: "var(--m-sub)" }}>
                CHARACTER + WORLD MODULES
              </span>
            </div>
            <h2 className="f-display leading-[0.95] tracking-wide mt-4 text-[clamp(2rem,5.2vw,4.2rem)]" style={{ color: "var(--outer-ink)" }}>
              A<span className="text-[var(--crimson)]">R</span>C
            </h2>
            <p className="mt-4 max-w-[74ch] text-[13.5px] sm:text-[14.5px] leading-relaxed" style={{ color: "var(--m-sub)" }}>
              AI <span className="text-[var(--crimson)] font-bold tracking-wide">RE-IMAGINED</span> CONTENT — one selector system, two
              production modules: character sheets and world building from the same generative pipeline.
            </p>

            {/* mode switch — one system, identical outer dimensions */}
            <div className="flex flex-wrap items-center gap-3 mt-8">
              {(["CHARACTERS", "WORLDS"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`f-tech font-bold text-[12px] sm:text-[13px] tracking-[0.22em] px-5 sm:px-7 py-3 rounded-lg border transition-all duration-300 ${
                    mode === m
                      ? "border-transparent"
                      : "hover:opacity-100"
                  }`}
                  style={mode === m
                    ? { backgroundColor: "var(--outer-ink)", color: "var(--outer-bg)" }
                    : { borderColor: "var(--m-line)", color: "var(--m-sub)" }}>
                  {m}
                </button>
              ))}
              <span className="f-mono text-[10px] tracking-[0.24em] ml-2" style={{ color: "var(--m-sub)" }}>
                MODULE — {isChar ? "AI CHARACTER SHEET" : "AI WORLD BUILDING"}
              </span>
            </div>

            {/* selector — LEFT slots · arrows · CENTER carousel · RIGHT dossier */}
            <div key={mode} className="dossier-swap mat-inner mat-texture rounded-xl p-4 sm:p-7 mt-6">
              <div className="grid lg:grid-cols-[180px_44px_minmax(0,1fr)_44px_300px] gap-3 lg:gap-4 items-stretch">
                {/* LEFT — slot list */}
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0 items-stretch">
                  {items.map((it, i) => (
                    <button key={it.id} onClick={() => setIdx(i)}
                      className={`group shrink-0 lg:shrink flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-all duration-400 ${
                        i === idx ? "border-transparent" : "border-[var(--line)] hover:border-[var(--ink2)]"
                      }`}
                      style={i === idx ? { backgroundColor: "var(--ink)", color: "var(--page)" } : undefined}>
                      <span className={`w-2.5 h-2.5 rotate-45 transition-all duration-300 ${i === idx ? "scale-110" : "bg-[var(--line)] group-hover:bg-[var(--ink2)]"}`}
                        style={i === idx ? { backgroundColor: "var(--page)" } : undefined} />
                      <span className={`f-tech font-bold text-[11px] tracking-[0.16em] whitespace-nowrap transition-colors duration-300 ${i === idx ? "" : "text-[var(--ink2)] group-hover:text-[var(--ink)]"}`}>
                        {it.name}
                      </span>
                    </button>
                  ))}
                  <button onClick={() => nav("#/edit")}
                    className="shrink-0 lg:shrink flex items-center gap-3 px-4 py-3.5 rounded-lg border border-dashed border-[var(--line)] f-tech font-bold text-[11px] tracking-[0.16em] text-[var(--ink2)] hover:text-[var(--ink)] hover:border-[var(--ink2)] transition-all duration-300">
                    <span className="text-[15px] leading-none">+</span> ADD {isChar ? "CHARACTER" : "WORLD"} SLOT
                  </button>
                </div>

                <ArcaneArrow label="Previous" dir="left" onClick={() => setIdx((idx - 1 + n) % n)} />

                {/* CENTER — large media carousel (click center for fullscreen) */}
                <div className="min-w-0 flex items-center">
                  <Carousel items={items} idx={idx} setIdx={setIdx} ratio={isChar ? "9/16" : "16/9"} wide={!isChar}
                    onCenter={() => setViewIdx(idx)} />
                </div>

                <ArcaneArrow label="Next" dir="right" onClick={() => setIdx((idx + 1) % n)} />

                <Dossier entry={items[Math.min(idx, n - 1)] ?? items[0]} kind={isChar ? "CHARACTER" : "WORLD"} />
              </div>

              {/* index strip */}
              <div className="mt-5 pt-4 border-t border-[var(--line)] flex items-center gap-3 f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">
                <span className="text-[var(--ink)] font-semibold">{String(idx + 1).padStart(2, "0")}</span>
                <span>/ {String(n).padStart(2, "0")} — {isChar ? "CHARACTER" : "WORLD"} SELECT</span>
                <span className="hidden sm:flex items-center gap-1.5 ml-auto">
                  {items.map((it, i) => (
                    <button key={it.id} onClick={() => setIdx(i)} aria-label={it.name}
                      className={`h-[5px] rounded-sm transition-all duration-300 ${i === idx ? "w-7 bg-[var(--ink)]" : "w-3 bg-[var(--line)] hover:bg-[var(--ink2)]"}`} />
                  ))}
                </span>
                <span className="hidden md:inline">LOOP — CIRCULAR SEQUENCE</span>
              </div>
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
