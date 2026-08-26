import React, { useState } from "react";
import { ArcEntry } from "../lib/data";
import { useHashRoute, useReducedMotion, useStore } from "../lib/store";
import { NavArrowHead } from "./icons";
import { EmptySlot, FullscreenViewer, Reveal, SectionHead } from "./ui";

/* looping offset: center = 0, right = +1, left = -1 */
function relPos(i: number, idx: number, n: number) {
  let r = (i - idx + n) % n;
  if (r > n / 2) r -= n;
  return r;
}

function Carousel({ items, idx, setIdx, ratio, wide, onView }: {
  items: ArcEntry[]; idx: number; setIdx: (i: number) => void; ratio: string; wide: boolean; onView: (i: number) => void;
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
          <button key={it.id}
            onClick={() => (active ? onView(i) : setIdx(i))}
            aria-label={active ? `${it.name} — open fullscreen` : `Select ${it.name}`}
            className={`absolute top-1/2 left-1/2 rounded-xl overflow-hidden transition-all ${
              active ? "z-20 cursor-pointer" : "z-10 cursor-pointer"
            }`}
            style={{
              width: wide ? "74%" : "47%",
              aspectRatio: ratio,
              border: active ? "2px solid var(--crim-panel)" : "1.5px solid var(--m-line)",
              transform: `translate(-50%, -50%) translateX(${rel * (wide ? 96 : 112)}%) scale(${active ? 1 : 0.58})`,
              opacity: active ? 1 : 0.3,
              filter: active ? "none" : "blur(2.5px) saturate(0.45) brightness(0.82)",
              transition: reduced ? "none" : "transform .55s cubic-bezier(.3,.85,.3,1), opacity .45s ease, filter .45s ease, border-color .4s ease",
            }}>
            {it.image.src ? (
              <img src={it.image.src} alt={it.name} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 mat-page-card">
                <EmptySlot item={it.image} />
              </div>
            )}
            {active && <span className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 0 2px var(--crim-panel)" }} />}
            <span className="absolute left-0 bottom-0 f-mono text-[9px] tracking-[0.22em] px-2 py-1 bg-[var(--outer-bg)] text-[var(--outer-ink)] opacity-90">
              {it.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function ArcaneArrow({ onClick, label, dir }: { onClick: () => void; label: string; dir: "left" | "right" }) {
  return (
    <button onClick={onClick} aria-label={label}
      className="group self-center justify-self-center w-full h-24 grid place-items-center rounded-lg transition-all duration-300 opacity-70 hover:opacity-100 hover:bg-[color-mix(in_srgb,var(--outer-ink)_7%,transparent)] focus:outline-none focus-visible:opacity-100"
      style={{ color: "var(--outer-ink)" }}>
      <span className={`block relative transition-transform duration-300 ${dir === "left" ? "group-hover:-translate-x-1.5" : "group-hover:translate-x-1.5"}`}>
        <NavArrowHead size={64} dir={dir} />
        <span className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[70%] w-[2px] opacity-0 group-hover:opacity-60 transition-opacity duration-300"
          style={{ background: "var(--crim-panel)", marginLeft: dir === "left" ? "12px" : "-16px" }} />
      </span>
    </button>
  );
}

function Dossier({ entry, kind }: { entry: ArcEntry; kind: "CHARACTER" | "WORLD" }) {
  return (
    <div key={entry.id} className="dossier-swap rounded-xl p-5 sm:p-6 h-full"
      style={{ border: "1.5px solid var(--m-line)", background: "color-mix(in srgb, var(--outer-ink) 6%, transparent)" }}>
      <span className="f-mono text-[9px] tracking-[0.3em]" style={{ color: "var(--crim-panel)" }}>{kind} DOSSIER</span>
      <h4 className="f-display text-xl sm:text-2xl mt-2 leading-tight" style={{ color: "var(--outer-ink)" }}>{entry.name}</h4>
      <dl className="mt-4 flex flex-col">
        <div className="py-3 grid grid-cols-[110px_1fr] gap-3" style={{ borderTop: "1px solid var(--m-line)" }}>
          <dt className="f-mono text-[9px] tracking-[0.24em] pt-0.5" style={{ color: "var(--m-sub)" }}>NAME</dt>
          <dd className="f-tech font-bold text-[12px] tracking-[0.12em]" style={{ color: "var(--outer-ink)" }}>{entry.name}</dd>
        </div>
        <div className="py-3 grid grid-cols-[110px_1fr] gap-3" style={{ borderTop: "1px solid var(--m-line)" }}>
          <dt className="f-mono text-[9px] tracking-[0.24em] pt-0.5" style={{ color: "var(--m-sub)" }}>TOOLS USED</dt>
          <dd className={`f-tech font-bold text-[12px] tracking-[0.12em] ${entry.tools ? "" : "opacity-60"}`} style={{ color: "var(--outer-ink)" }}>
            {entry.tools || "—"}
          </dd>
        </div>
        <div className="py-3 grid grid-cols-[110px_1fr] gap-3" style={{ borderTop: "1px solid var(--m-line)" }}>
          <dt className="f-mono text-[9px] tracking-[0.24em] pt-0.5" style={{ color: "var(--m-sub)" }}>{kind} DESCRIPTION</dt>
          <dd className={`text-[12.5px] sm:text-[13px] leading-relaxed ${entry.description ? "" : "opacity-60"}`} style={{ color: "var(--outer-ink)" }}>
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

        {/* BIG subheading — only RE-IMAGINED is crimson */}
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
                <button key={m} onClick={() => setMode(m)} aria-pressed={on}
                  className="f-tech font-bold text-[13px] sm:text-[14px] tracking-[0.22em] px-6 sm:px-8 py-3.5 dossier-clip-sm transition-all duration-300"
                  style={on
                    ? { background: "var(--ink)", color: "var(--page)", boxShadow: "inset 0 0 0 1.5px var(--ink), 4px 4px 0 color-mix(in srgb, var(--ink) 22%, transparent)" }
                    : { background: "var(--sup1)", color: "var(--ink2)", boxShadow: "inset 0 0 0 1.5px var(--line)" }}
                  onMouseEnter={(e) => { if (!on) { e.currentTarget.style.boxShadow = "inset 0 0 0 1.5px var(--ink2)"; e.currentTarget.style.color = "var(--ink)"; } }}
                  onMouseLeave={(e) => { if (!on) { e.currentTarget.style.boxShadow = "inset 0 0 0 1.5px var(--line)"; e.currentTarget.style.color = "var(--ink2)"; } }}>
                  {m}
                </button>
              );
            })}
            <span className="f-mono text-[10px] tracking-[0.24em] text-[var(--ink2)] ml-2">
              MODULE — {isChar ? "AI CHARACTER SHEET" : "AI WORLD BUILDING"}
            </span>
          </div>
        </Reveal>

        {/* selector system — matte panel */}
        <Reveal className="mt-8">
          <div key={mode} className="dossier-swap mat-outer mat-texture rounded-xl p-4 sm:p-7">
            <div className="grid lg:grid-cols-[180px_76px_minmax(0,1fr)_76px_300px] gap-3 lg:gap-4 items-stretch">
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
                        style={{ background: on ? "var(--crim-panel)" : "var(--m-line)" }} />
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

              <Carousel items={items} idx={idx} setIdx={setIdx} ratio={isChar ? "9/16" : "16/9"} wide={!isChar} onView={setViewIdx} />

              <ArcaneArrow label="Next" dir="right" onClick={() => setIdx((idx + 1) % n)} />

              <Dossier entry={items[idx] ?? items[0]} kind={isChar ? "CHARACTER" : "WORLD"} />
            </div>

            <div className="mt-5 pt-4 flex items-center gap-3 f-mono text-[9px] tracking-[0.26em]"
              style={{ borderTop: "1px solid var(--m-line)", color: "var(--m-sub)" }}>
              <span className="text-[var(--crim-panel)]">{String(idx + 1).padStart(2, "0")}</span>
              <span>/ {String(n).padStart(2, "0")} — {isChar ? "CHARACTER" : "WORLD"} SELECT</span>
              <span className="hidden sm:flex items-center gap-1.5 ml-auto">
                {items.map((it, i) => (
                  <button key={it.id} onClick={() => setIdx(i)} aria-label={it.name}
                    className={`h-[5px] rounded-sm transition-all duration-300 ${i === idx ? "w-7" : "w-3 opacity-50"}`}
                    style={{ background: i === idx ? "var(--crim-panel)" : "var(--m-line)" }} />
                ))}
              </span>
              <span className="hidden md:inline">LOOP — CIRCULAR SEQUENCE · CLICK CENTER TO EXPAND</span>
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
          setIndex={setViewIdx}
        />
      )}
    </section>
  );
}
