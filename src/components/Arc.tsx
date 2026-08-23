import React, { useState } from "react";
import { Dossier } from "../lib/data";
import { useHashRoute, useStore } from "../lib/store";
import { MediaSlot, Reveal } from "./ui";

function ArcHead() {
  return (
    <Reveal>
      <div id="arc" className="flex items-end justify-between gap-6 border-b border-[var(--line)] pb-5 scroll-mt-24">
        <div className="flex items-end gap-4">
          <span className="f-mono text-[11px] sm:text-xs tracking-[0.3em] text-[var(--crimson)] pb-2">/05</span>
          <h2 className="f-display leading-[0.95] text-[clamp(2rem,5.2vw,4.2rem)] tracking-wide">
            A<span className="text-[var(--crimson)]">R</span>C
          </h2>
        </div>
        <span className="f-mono text-[10px] sm:text-[11px] tracking-[0.26em] text-[var(--ink2)] pb-2">AI REIMAGINED CONTENT</span>
      </div>
    </Reveal>
  );
}

function Selector({ items, active, onPick, kind }: { items: { id: string; name: string }[]; active: number; onPick: (i: number) => void; kind: string }) {
  const [, nav] = useHashRoute();
  return (
    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
      {items.map((it, i) => (
        <button key={it.id} onClick={() => onPick(i)}
          className={`group shrink-0 lg:shrink flex items-center gap-3 px-4 py-3.5 rounded-lg border text-left transition-all duration-400 ${
            i === active
              ? "border-[var(--crimson)] bg-[color-mix(in_srgb,var(--crimson)_10%,transparent)]"
              : "border-[var(--line)] hover:border-[var(--ink2)] mat-page-card"
          }`}>
          <span className={`w-2.5 h-2.5 rotate-45 transition-all duration-300 ${i === active ? "bg-[var(--crimson)] scale-110" : "bg-[var(--line)] group-hover:bg-[var(--ink2)]"}`} />
          <span className={`f-tech font-bold text-[11px] tracking-[0.18em] whitespace-nowrap transition-colors duration-300 ${i === active ? "text-[var(--crimson)]" : "text-[var(--ink2)] group-hover:text-[var(--ink)]"}`}>
            {it.name}
          </span>
        </button>
      ))}
      <button onClick={() => nav("#/edit")}
        className="shrink-0 lg:shrink flex items-center gap-3 px-4 py-3.5 rounded-lg border border-dashed border-[var(--line)] f-tech font-bold text-[11px] tracking-[0.18em] text-[var(--ink2)] hover:text-[var(--crimson)] hover:border-[var(--crimson)] transition-all duration-300">
        <span className="text-[15px] leading-none">+</span> ADD {kind} SLOT
      </button>
    </div>
  );
}

function DossierCard({ d, title, accent, fields }: { d: Dossier; title: string; accent: string; fields: [string, keyof Dossier][] }) {
  return (
    <div key={accent} className="dossier-swap mat-page-card mat-texture rounded-xl border border-[var(--line)] p-5 sm:p-6">
      <span className="f-mono text-[9px] tracking-[0.3em] text-[var(--crimson)]">{title}</span>
      <h4 className="f-display text-xl sm:text-2xl mt-2 mb-4 leading-tight">{d[fields[0][1]] || accent}</h4>
      <dl className="flex flex-col">
        {fields.map(([label, key]) => (
          <div key={label} className="grid grid-cols-[92px_1fr] sm:grid-cols-[120px_1fr] gap-3 py-2.5 border-t border-[var(--line)] first:border-t-0">
            <dt className="f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)] pt-0.5">{label}</dt>
            <dd className={`text-[12.5px] sm:text-[13px] leading-relaxed ${d[key] ? "" : "text-[var(--ink2)] opacity-60"}`}>
              {d[key] || "—"}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const CHAR_FIELDS: [string, keyof Dossier][] = [
  ["ROLE", "role"], ["PROJECT", "project"], ["DESCRIPTION", "description"],
  ["TOOLS", "tools"], ["IDEA", "idea"], ["PROCESS", "process"],
];

const WORLD_FIELDS: [string, keyof Dossier][] = [
  ["WORLD / ENV.", "role"], ["PROJECT", "project"], ["DESCRIPTION", "description"],
  ["TOOLS", "tools"], ["IDEA", "idea"], ["PROCESS", "process"],
];

export default function Arc() {
  const { data } = useStore();
  const { characters, worlds } = data.arc;
  const [charIdx, setCharIdx] = useState(0);
  const [worldIdx, setWorldIdx] = useState(0);
  const ch = characters[charIdx] ?? characters[0];
  const wo = worlds[worldIdx] ?? worlds[0];

  return (
    <section className="relative py-20 lg:py-28 scroll-mt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        <ArcHead />

        {/* ---------- 01 — AI CHARACTER SHEET ---------- */}
        <Reveal className="mt-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="f-mono text-[10px] tracking-[0.3em] text-[var(--crimson)]">01</span>
            <h3 className="f-tech font-bold text-[15px] sm:text-lg tracking-[0.2em]">AI CHARACTER SHEET</h3>
            <span className="hidden sm:block flex-1 h-px bg-[var(--line)]" />
            <span className="f-mono text-[9px] tracking-[0.22em] text-[var(--ink2)] hidden md:block">UPLOAD / REPLACE / DELETE — VIA EDIT</span>
          </div>
          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)_minmax(0,1.15fr)] gap-5 lg:gap-8 items-start">
            <Selector items={characters} active={charIdx} onPick={setCharIdx} kind="CHARACTER" />
            <div className="max-w-[380px] w-full mx-auto lg:mx-0">
              <MediaSlot key={ch.id} item={ch.image} ratio="9/16" className="dossier-swap" />
            </div>
            <DossierCard d={ch.dossier} title="CHARACTER DOSSIER" accent={ch.name} fields={CHAR_FIELDS} />
          </div>
        </Reveal>

        {/* ---------- 02 — AI WORLD BUILDING ---------- */}
        <Reveal className="mt-16 lg:mt-20">
          <div className="flex items-center gap-4 mb-6">
            <span className="f-mono text-[10px] tracking-[0.3em] text-[var(--crimson)]">02</span>
            <h3 className="f-tech font-bold text-[15px] sm:text-lg tracking-[0.2em]">AI WORLD BUILDING</h3>
            <span className="hidden sm:block flex-1 h-px bg-[var(--line)]" />
            <span className="f-mono text-[9px] tracking-[0.22em] text-[var(--ink2)] hidden md:block">UPLOAD / REPLACE / DELETE — VIA EDIT</span>
          </div>
          <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-5 lg:gap-8 items-start">
            <Selector items={worlds} active={worldIdx} onPick={setWorldIdx} kind="WORLD" />
            <div className="min-w-0">
              <MediaSlot key={wo.id} item={wo.image} ratio="16/9" className="dossier-swap" />
              <div className="mt-5">
                <DossierCard d={wo.dossier} title="WORLD / ENVIRONMENT DOSSIER" accent={wo.name} fields={WORLD_FIELDS} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
