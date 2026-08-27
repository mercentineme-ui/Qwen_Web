import React, { useRef, useState } from "react";
import { Company, MediaItem } from "../lib/data";
import { readAsDataURL, useHashRoute, useStore } from "../lib/store";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--line)] rounded-xl p-5 flex flex-col gap-4">
      <h4 className="f-tech font-bold text-[12px] tracking-[0.26em] text-[var(--ink)]">{title}</h4>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--ink2)] block mb-1.5">{label}</span>
      {textarea ? (
        <textarea className="ed-field min-h-[92px]" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="ed-field" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function MediaManager({ label, items, ratio, onChange, kind }: {
  label: string; items: MediaItem[]; ratio: string; kind?: "image" | "video"; onChange: (m: MediaItem[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<number | null>(null);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    const i = targetRef.current;
    if (!f || i === null) return;
    const src = await readAsDataURL(f);
    const next = [...items];
    next[i] = { ...next[i], src, kind: kind ?? next[i].kind };
    onChange(next);
    e.target.value = "";
  };

  return (
    <div>
      <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--ink2)] block mb-2">{label}</span>
      <input ref={fileRef} type="file" accept={kind === "video" ? "video/*" : "image/*"} className="hidden" onChange={onFile} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((m, i) => (
          <div key={m.id} className="relative rounded-lg border border-[var(--line)] overflow-hidden" style={{ aspectRatio: ratio }}>
            {m.src ? (
              kind === "video"
                ? <video src={m.src} className="absolute inset-0 w-full h-full object-cover" />
                : <img src={m.src} alt={m.label} className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center f-mono text-[8px] tracking-[0.2em] text-[var(--ink2)] bg-[var(--sup1)]">EMPTY</div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1" style={{ background: "color-mix(in srgb, var(--page) 78%, transparent)" }}>
              <button onClick={() => { targetRef.current = i; fileRef.current?.click(); }}
                className="flex-1 f-tech font-bold text-[8px] tracking-[0.14em] px-1 py-1 rounded bg-[var(--crimson)] text-[#ddddd8]">{m.src ? "REPLACE" : "UPLOAD"}</button>
              {m.src && (
                <button onClick={() => onChange(items.map((x, j) => (j === i ? { ...x, src: null } : x)))}
                  className="f-tech font-bold text-[8px] tracking-[0.14em] px-1.5 py-1 rounded border border-[var(--line)] text-[var(--ink2)]">✕</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeroEditor() {
  const { data, update } = useStore();
  const h = data.hero;
  const set = (p: Partial<typeof h>) => update((d) => ({ ...d, hero: { ...d.hero, ...p } }));
  return (
    <Group title="HERO / ABOUT">
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="MORNING GREETING" value={h.greetings.MORNING} onChange={(v) => set({ greetings: { ...h.greetings, MORNING: v } })} />
        <Field label="AFTERNOON GREETING" value={h.greetings.AFTERNOON} onChange={(v) => set({ greetings: { ...h.greetings, AFTERNOON: v } })} />
      </div>
      <Field label="EVENING GREETING" value={h.greetings.EVENING} onChange={(v) => set({ greetings: { ...h.greetings, EVENING: v } })} />
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="NAME LINE A" value={h.nameA} onChange={(v) => set({ nameA: v })} />
        <Field label="NAME LINE B" value={h.nameB} onChange={(v) => set({ nameB: v })} />
      </div>
      <Field label="DESCRIPTION" textarea value={h.description} onChange={(v) => set({ description: v })} />
      <MediaManager label="HERO IMAGES (01–04)" items={h.images} ratio="1/1" onChange={(m) => set({ images: m })} />
    </Group>
  );
}

function ByNumbersEditor() {
  const { data, update } = useStore();
  const bn = data.byNumbers;
  const set = (p: Partial<typeof bn>) => update((d) => ({ ...d, byNumbers: { ...d.byNumbers, ...p } }));
  return (
    <Group title="IMPACT METRICS">
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="ARTIST ROLE" value={bn.artistRole} onChange={(v) => set({ artistRole: v })} />
        <Field label="UPCOMING LABEL" value={bn.upcomingLabel} onChange={(v) => set({ upcomingLabel: v })} />
      </div>
      <Field label="UPCOMING WORKS (COMMA-SEPARATED)" value={bn.upcoming.join(", ")}
        onChange={(v) => set({ upcoming: v.split(",").map((s) => s.trim()).filter(Boolean) })} />
      {bn.stats.map((s, i) => (
        <div key={s.num} className="grid grid-cols-[70px_1fr_60px_1fr] gap-3">
          <Field label="IDX" value={s.num} onChange={(v) => set({ stats: bn.stats.map((x, j) => (j === i ? { ...x, num: v } : x)) })} />
          <Field label="VALUE" value={String(s.value)} onChange={(v) => set({ stats: bn.stats.map((x, j) => (j === i ? { ...x, value: Number(v.replace(/[^\d]/g, "")) || 0 } : x)) })} />
          <Field label="SUF" value={s.suffix} onChange={(v) => set({ stats: bn.stats.map((x, j) => (j === i ? { ...x, suffix: v } : x)) })} />
          <Field label="LABEL" value={s.label} onChange={(v) => set({ stats: bn.stats.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
        </div>
      ))}
    </Group>
  );
}

function ExpertiseEditor() {
  const { data, update } = useStore();
  const ex = data.expertise;
  const setCo = (i: number, p: Partial<Company>) =>
    update((d) => ({ ...d, expertise: { ...d.expertise, companies: d.expertise.companies.map((c, j) => (j === i ? { ...c, ...p } : c)) } }));
  return (
    <Group title="EXPERIENCE / MY JOURNEY — COMPANIES">
      {ex.companies.map((c, i) => (
        <div key={c.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
          <div className="grid sm:grid-cols-2 gap-3.5">
            <Field label="COMPANY" value={c.name} onChange={(v) => setCo(i, { name: v })} />
            <Field label="SHORT (INDEX)" value={c.short} onChange={(v) => setCo(i, { short: v })} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3.5">
            <Field label="ROLE" value={c.role} onChange={(v) => setCo(i, { role: v })} />
            <Field label="DATE" value={c.date} onChange={(v) => setCo(i, { date: v })} />
          </div>
          <Field label="DESCRIPTION" textarea value={c.description} onChange={(v) => setCo(i, { description: v })} />
          <Field label="DOMAIN" value={c.domain} onChange={(v) => setCo(i, { domain: v })} />
          <MediaManager label="COMPANY MEDIA" items={c.media} ratio="16/9" onChange={(m) => setCo(i, { media: m })} />
        </div>
      ))}
    </Group>
  );
}

function AILabEditor() {
  const { data, update } = useStore();
  const lab = data.aiLab;
  const set = (p: Partial<typeof lab>) => update((d) => ({ ...d, aiLab: { ...d.aiLab, ...p } }));
  return (
    <Group title="AI LAB — GHOST.EXE">
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="PROJECT NAME" value={lab.projectName} onChange={(v) => set({ projectName: v })} />
        <Field label="PROJECT TYPE" value={lab.projectType} onChange={(v) => set({ projectType: v })} />
      </div>
      <Field label="DESCRIPTION" textarea value={lab.projectDescription} onChange={(v) => set({ projectDescription: v })} />
      <MediaManager label="FEATURED VIDEO" items={[lab.video]} ratio="16/9" kind="video" onChange={(m) => m[0] && set({ video: m[0] })} />
      <MediaManager label="PRODUCTION STILLS (08)" items={lab.images} ratio="16/9" onChange={(m) => set({ images: m })} />
    </Group>
  );
}

function ArcEditor() {
  const { data, update } = useStore();
  const arc = data.arc;
  const setChars = (characters: typeof arc.characters) => update((d) => ({ ...d, arc: { ...d.arc, characters } }));
  const setWorlds = (worlds: typeof arc.worlds) => update((d) => ({ ...d, arc: { ...d.arc, worlds } }));
  const editor = (kind: "characters" | "worlds") => {
    const list = kind === "characters" ? arc.characters : arc.worlds;
    const setList = kind === "characters" ? setChars : setWorlds;
    return list.map((e, i) => (
      <div key={e.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
        <Field label="NAME" value={e.name} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, name: v } : x)))} />
        <Field label="TOOLS USED" value={e.tools} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, tools: v } : x)))} />
        <Field label="DESCRIPTION" textarea value={e.description} onChange={(v) => setList(list.map((x, j) => (j === i ? { ...x, description: v } : x)))} />
        <MediaManager label={kind === "characters" ? "PORTRAIT — 9:16" : "LANDSCAPE — 16:9"}
          items={[e.image]} ratio={kind === "characters" ? "9/16" : "16/9"}
          onChange={(m) => m[0] && setList(list.map((x, j) => (j === i ? { ...x, image: m[0] } : x)))} />
      </div>
    ));
  };
  return (
    <>
      <Group title="ARC — CHARACTERS">{editor("characters")}</Group>
      <Group title="ARC — WORLDS">{editor("worlds")}</Group>
    </>
  );
}

function ContactEditor() {
  const { data, update } = useStore();
  const c = data.contact;
  const set = (p: Partial<typeof c>) => update((d) => ({ ...d, contact: { ...d.contact, ...p } }));
  return (
    <Group title="CONTACT">
      <Field label="MANIFESTO (SERIF)" textarea value={c.statement} onChange={(v) => set({ statement: v })} />
      <Field label="MESSAGE" textarea value={c.message} onChange={(v) => set({ message: v })} />
      <Field label="EMAIL" value={c.email} onChange={(v) => set({ email: v })} />
      <MediaManager label="PORTRAIT — 1:1" items={[c.portrait]} ratio="1/1" onChange={(m) => m[0] && set({ portrait: m[0] })} />
    </Group>
  );
}

const SECTIONS = [
  { id: "hero", num: "00", label: "HERO", el: <HeroEditor /> },
  { id: "bynumbers", num: "00", label: "IMPACT METRICS", el: <ByNumbersEditor /> },
  { id: "expertise", num: "01", label: "EXPERIENCE", el: <ExpertiseEditor /> },
  { id: "ailab", num: "04", label: "AI LAB", el: <AILabEditor /> },
  { id: "arc", num: "05", label: "ARC", el: <ArcEditor /> },
  { id: "contact", num: "08", label: "CONTACT", el: <ContactEditor /> },
];

export default function Editor() {
  const [, nav] = useHashRoute();
  const { data, resetAll, theme, toggleTheme } = useStore();
  const [sel, setSel] = useState("hero");
  const current = SECTIONS.find((s) => s.id === sel) ?? SECTIONS[0];

  return (
    <div className="min-h-screen" style={{ background: "var(--page)", color: "var(--ink)" }}>
      <div className="border-b border-[var(--line)] mat-texture" style={{ background: "color-mix(in srgb, var(--page) 88%, transparent)" }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-[60px] flex items-center gap-5">
          <span className="f-automata text-[19px] tracking-[0.08em]">CBK</span>
          <span className="f-tech font-semibold text-[11px] tracking-[0.42em] text-[var(--ink2)]">EDITOR / CMS</span>
          <div className="flex-1" />
          <button onClick={toggleTheme} className="f-tech font-bold text-[11px] tracking-[0.24em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors">
            {theme === "light" ? "DARK" : "LIGHT"}
          </button>
          <button onClick={() => { if (confirm("Reset all portfolio content to defaults?")) resetAll(); }}
            className="f-tech font-bold text-[11px] tracking-[0.24em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors">
            RESET
          </button>
          <button onClick={() => nav("#/")} className="btn btn-crimson !py-2.5 !px-5 text-[11px]">VIEW SITE ↗</button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 grid lg:grid-cols-[220px_1fr] gap-8">
        <nav className="flex lg:flex-col gap-2 overflow-x-auto">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setSel(s.id)}
              className="f-tech font-bold text-[11px] tracking-[0.2em] px-4 py-3 rounded-lg text-left whitespace-nowrap transition-all duration-300"
              style={sel === s.id
                ? { background: "var(--crimson)", color: "#ddddd8" }
                : { border: "1px solid var(--line)", color: "var(--ink2)" }}>
              <span className="opacity-60 mr-2">{s.num}</span>{s.label}
            </button>
          ))}
        </nav>
        <div className="min-w-0 flex flex-col gap-6">
          {current.el}
        </div>
      </div>
    </div>
  );
}
