import React, { useRef, useState } from "react";
import { MediaItem, MediaKind, nextId } from "../lib/data";
import { readAsDataURL, useHashRoute, useStore } from "../lib/store";
import AILab from "./AILab";
import Arc from "./Arc";
import CreativeCore from "./CreativeCore";
import Expertise from "./Expertise";
import Hero from "./Hero";
import ShowReel from "./ShowReel";
import { HowIBuild } from "./Closing";

/* ---------- primitives ---------- */

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <label className="block">
      <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)] block mb-1.5">{label}</span>
      {textarea ? (
        <textarea className="ed-field min-h-[84px]" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="ed-field" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-[var(--line)] rounded-xl p-5 flex flex-col gap-4">
      <h3 className="f-tech font-bold text-[13px] tracking-[0.24em] pb-3 border-b border-[var(--line)] flex items-center gap-3">
        <span className="w-2 h-2 bg-[var(--crimson)]" /> {title}
      </h3>
      {children}
    </section>
  );
}

/* ---------- media manager: upload / preview / replace / delete / reorder ---------- */

function MediaManager({ label, items, onChange, kind = "image", ratio = "16/9" }: {
  label: string; items: MediaItem[]; onChange: (next: MediaItem[]) => void; kind?: MediaKind; ratio?: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const targetRef = useRef<number>(-1);

  const pick = (i: number) => { targetRef.current = i; fileRef.current?.click(); };
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const src = await readAsDataURL(f);
    const i = targetRef.current;
    onChange(items.map((m, j) => (j === i ? { ...m, src, kind: f.type.startsWith("video") ? "video" : m.kind } : m)));
  };
  const add = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const src = await readAsDataURL(f);
    onChange([...items, { id: nextId(), kind: f.type.startsWith("video") ? "video" : kind, label: `${label.split(" ")[0]} ${String(items.length + 1).padStart(2, "0")}`, src, emptyLines: ["ADD IMAGE"] }]);
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2.5">
        <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">{label} — {items.length} SLOT{items.length === 1 ? "" : "S"}</span>
        <label className="f-tech font-bold text-[9px] tracking-[0.2em] px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)] cursor-pointer transition-colors">
          + ADD
          <input type="file" accept={kind === "video" ? "video/*" : "image/*"} className="hidden" onChange={add} />
        </label>
      </div>
      <input ref={fileRef} type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={onFile} />
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {items.map((m, i) => (
          <div key={m.id} className="border border-[var(--line)] rounded-lg overflow-hidden">
            <div className="relative mat-page-card" style={{ aspectRatio: ratio }}>
              {m.src ? (
                m.kind === "video"
                  ? <video src={m.src} muted className="absolute inset-0 w-full h-full object-cover" />
                  : <img src={m.src} alt={m.label} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 grid place-items-center f-mono text-[8px] tracking-[0.22em] text-[var(--ink2)]">EMPTY</div>
              )}
              <span className="absolute top-1.5 left-1.5 f-mono text-[8px] tracking-[0.2em] px-1.5 py-0.5 bg-[var(--ink)] text-[var(--page)] rounded-sm">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <div className="flex items-center gap-1 p-1.5">
              <button onClick={() => pick(i)} className="f-tech font-bold text-[8px] tracking-[0.14em] px-2 py-1 rounded-md bg-[var(--crimson)] text-[#DDDDD8]">
                {m.src ? "REPLACE" : "UPLOAD"}
              </button>
              <button onClick={() => onChange(items.map((x, j) => (j === i ? { ...x, src: null } : x)))}
                className="f-tech font-bold text-[8px] tracking-[0.14em] px-2 py-1 rounded-md border border-[var(--line)] text-[var(--ink2)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]">CLR</button>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="ml-auto px-1.5 py-1 text-[var(--ink2)] disabled:opacity-25 hover:text-[var(--crimson)]">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="px-1.5 py-1 text-[var(--ink2)] disabled:opacity-25 hover:text-[var(--crimson)]">↓</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- section workspaces ---------- */

function HeroEditor() {
  const { data, update } = useStore();
  const h = data.hero;
  const set = (patch: Partial<typeof h>) => update((d) => ({ ...d, hero: { ...d.hero, ...patch } }));
  return (
    <Group title="HERO — IDENTITY & MEDIA">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="NAME LINE 1" value={h.nameA} onChange={(v) => set({ nameA: v })} />
        <Field label="NAME LINE 2" value={h.nameB} onChange={(v) => set({ nameB: v })} />
        <Field label="ABOUT LABEL" value={h.aboutLabel} onChange={(v) => set({ aboutLabel: v })} />
        <Field label="ROTATION (SECONDS)" value={String(h.rotationSeconds)} onChange={(v) => set({ rotationSeconds: Math.max(3, Number(v) || 15) })} />
      </div>
      {(["MORNING", "AFTERNOON", "EVENING"] as const).map((dp) => (
        <Field key={dp} label={`GREETING — ${dp} (use {DAYPART} for the time word)`}
          value={h.greetings[dp]} onChange={(v) => set({ greetings: { ...h.greetings, [dp]: v } })} />
      ))}
      <Field label="ABOUT TEXT" textarea value={h.description} onChange={(v) => set({ description: v })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="PRIMARY CTA" value={h.ctaPrimary} onChange={(v) => set({ ctaPrimary: v })} />
        <Field label="SECONDARY CTA" value={h.ctaSecondary} onChange={(v) => set({ ctaSecondary: v })} />
      </div>
      {h.chips.map((c, i) => (
        <Field key={i} label={`ROLE CARD ${String(i + 1).padStart(2, "0")}`} value={c}
          onChange={(v) => set({ chips: h.chips.map((x, j) => (j === i ? v : x)) })} />
      ))}
      <MediaManager label="HERO IMAGES" items={h.images} onChange={(images) => set({ images })} ratio="1/1" />
    </Group>
  );
}

function ExpertiseEditor() {
  const { data, update } = useStore();
  const ex = data.expertise;
  const set = (patch: Partial<typeof ex>) => update((d) => ({ ...d, expertise: { ...d.expertise, ...patch } }));
  return (
    <Group title="MY EXPERTISE — COMPANIES">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="STATEMENT" value={ex.statement} onChange={(v) => set({ statement: v })} />
        <Field label="STATEMENT ACCENT (CRIMSON)" value={ex.statementAccent} onChange={(v) => set({ statementAccent: v })} />
      </div>
      <Field label="SUPPORTING LINE" textarea value={ex.supporting} onChange={(v) => set({ supporting: v })} />
      {ex.companies.map((co, i) => (
        <div key={co.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
          <div className="grid sm:grid-cols-2 gap-3.5">
            <Field label="COMPANY" value={co.name} onChange={(v) => set({ companies: ex.companies.map((x, j) => (j === i ? { ...x, name: v } : x)) })} />
            <Field label="ROLE" value={co.role} onChange={(v) => set({ companies: ex.companies.map((x, j) => (j === i ? { ...x, role: v } : x)) })} />
            <Field label="DATE / LOCATION" value={co.date} onChange={(v) => set({ companies: ex.companies.map((x, j) => (j === i ? { ...x, date: v } : x)) })} />
            <Field label="PROJECT / DOMAIN" value={co.domain} onChange={(v) => set({ companies: ex.companies.map((x, j) => (j === i ? { ...x, domain: v } : x)) })} />
          </div>
          <Field label="DESCRIPTION (use [ BRACKETS ] for crimson highlights)" textarea value={co.description}
            onChange={(v) => set({ companies: ex.companies.map((x, j) => (j === i ? { ...x, description: v } : x)) })} />
          <div className="grid sm:grid-cols-2 gap-3.5">
            <Field label="SKILLS ( / separated )" value={co.skills.join(" / ")}
              onChange={(v) => set({ companies: ex.companies.map((x, j) => (j === i ? { ...x, skills: v.split("/").map((s) => s.trim()).filter(Boolean) } : x)) })} />
            <Field label="TOOLS ( / separated )" value={co.tools.join(" / ")}
              onChange={(v) => set({ companies: ex.companies.map((x, j) => (j === i ? { ...x, tools: v.split("/").map((s) => s.trim()).filter(Boolean) } : x)) })} />
          </div>
          <MediaManager label={`MEDIA ${co.name}`} items={co.media} ratio="1/1"
            onChange={(media) => set({ companies: ex.companies.map((x, j) => (j === i ? { ...x, media } : x)) })} />
        </div>
      ))}
    </Group>
  );
}

function CoreEditor() {
  const { data, update } = useStore();
  const core = data.core;
  const set = (next: typeof core) => update((d) => ({ ...d, core: next }));
  return (
    <Group title="CORE — DISCIPLINES">
      {core.map((dis, i) => (
        <div key={dis.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
          <Field label={`DISCIPLINE ${dis.num} — NAME`} value={dis.name} onChange={(v) => set(core.map((x, j) => (j === i ? { ...x, name: v } : x)))} />
          <Field label="DESCRIPTION" textarea value={dis.blurb} onChange={(v) => set(core.map((x, j) => (j === i ? { ...x, blurb: v } : x)))} />
          <Field label="TAGS ( / separated )" value={dis.tags.join(" / ")}
            onChange={(v) => set(core.map((x, j) => (j === i ? { ...x, tags: v.split("/").map((s) => s.trim()).filter(Boolean) } : x)))} />
        </div>
      ))}
    </Group>
  );
}

function ShowReelEditor() {
  const { data, update } = useStore();
  const sr = data.showReel;
  return (
    <Group title="MY WORK — MEDIA">
      <MediaManager label="PORTRAITS 9:16" items={sr.portraits} ratio="9/16"
        onChange={(portraits) => update((d) => ({ ...d, showReel: { ...d.showReel, portraits } }))} />
      <MediaManager label="LANDSCAPES 16:9" items={sr.landscapes} ratio="16/9"
        onChange={(landscapes) => update((d) => ({ ...d, showReel: { ...d.showReel, landscapes } }))} />
    </Group>
  );
}

function AILabEditor() {
  const { data, update } = useStore();
  const lab = data.aiLab;
  const set = (patch: Partial<typeof lab>) => update((d) => ({ ...d, aiLab: { ...d.aiLab, ...patch } }));
  return (
    <Group title="AI LAB — GHOST.EXE">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="PROJECT NAME" value={lab.projectName} onChange={(v) => set({ projectName: v })} />
        <Field label="PROJECT TYPE" value={lab.projectType} onChange={(v) => set({ projectType: v })} />
        <Field label="STATUS" value={lab.projectStatus} onChange={(v) => set({ projectStatus: v })} />
        <Field label="SUB-LABEL" value={lab.subLabel} onChange={(v) => set({ subLabel: v })} />
      </div>
      <Field label="DESCRIPTION" textarea value={lab.projectDescription} onChange={(v) => set({ projectDescription: v })} />
      <Field label="TOOLS ( / separated )" value={lab.tools.join(" / ")}
        onChange={(v) => set({ tools: v.split("/").map((s) => s.trim()).filter(Boolean) })} />
      <MediaManager label="FEATURED VIDEO" items={[lab.video]} kind="video" ratio="16/9"
        onChange={(arr) => arr[0] && set({ video: arr[0] })} />
      <MediaManager label="STILLS" items={lab.images} ratio="16/9" onChange={(images) => set({ images })} />
    </Group>
  );
}

function ArcEditor() {
  const { data, update } = useStore();
  const { characters, worlds } = data.arc;
  const entryEditor = (kind: "CHARACTER" | "WORLD", e: typeof characters[number], i: number) => {
    const list = kind === "CHARACTER" ? characters : worlds;
    const setList = (next: typeof list) =>
      update((d) => ({ ...d, arc: kind === "CHARACTER" ? { ...d.arc, characters: next } : { ...d.arc, worlds: next } }));
    const patch = (p: Partial<typeof e>) => setList(list.map((x, j) => (j === i ? { ...x, ...p } : x)));
    return (
      <div key={e.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <input className="ed-field !py-1.5 flex-1" value={e.name} onChange={(ev) => patch({ name: ev.target.value })} />
          <button onClick={() => setList(list.filter((_, j) => j !== i))}
            className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg text-[var(--crimson)] border border-[var(--line)] hover:border-[var(--crimson)]">DELETE</button>
        </div>
        <Field label="TOOLS USED" value={e.tools} onChange={(v) => patch({ tools: v })} />
        <Field label={`${kind} DESCRIPTION`} textarea value={e.description} onChange={(v) => patch({ description: v })} />
        <MediaManager label={kind === "CHARACTER" ? "PORTRAIT — 9:16" : "LANDSCAPE — 16:9"}
          items={[e.image]} ratio={kind === "CHARACTER" ? "9/16" : "16/9"}
          onChange={(arr) => arr[0] && patch({ image: arr[0] })} />
      </div>
    );
  };
  const addEntry = (kind: "CHARACTER" | "WORLD") => {
    const list = kind === "CHARACTER" ? characters : worlds;
    const fresh = {
      id: nextId(),
      name: `${kind} SLOT ${String(list.length + 1).padStart(2, "0")}`,
      image: { id: nextId(), kind: "image" as MediaKind, label: kind === "CHARACTER" ? "PORTRAIT" : "LANDSCAPE", src: null, emptyLines: ["ADD IMAGE", kind === "CHARACTER" ? "9 : 16" : "16 : 9"] },
      tools: "",
      description: "",
    };
    update((d) => ({ ...d, arc: kind === "CHARACTER" ? { ...d.arc, characters: [...characters, fresh] } : { ...d.arc, worlds: [...worlds, fresh] } }));
  };
  return (
    <Group title="ARC — CHARACTERS & WORLDS">
      <div className="flex items-center justify-between">
        <span className="f-mono text-[10px] tracking-[0.24em]">AI CHARACTER SHEET</span>
        <button onClick={() => addEntry("CHARACTER")}
          className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]">+ ADD CHARACTER SLOT</button>
      </div>
      {characters.map((c, i) => entryEditor("CHARACTER", c, i))}
      <div className="flex items-center justify-between mt-2">
        <span className="f-mono text-[10px] tracking-[0.24em]">AI WORLD BUILDING</span>
        <button onClick={() => addEntry("WORLD")}
          className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]">+ ADD WORLD SLOT</button>
      </div>
      {worlds.map((w, i) => entryEditor("WORLD", w, i))}
    </Group>
  );
}

function BuildEditor() {
  const { data, update } = useStore();
  const b = data.build;
  const set = (patch: Partial<typeof b>) => update((d) => ({ ...d, build: { ...d.build, ...patch } }));
  return (
    <Group title="THE PIPELINE — EDIT WORKSPACE">
      <Field label="SUPPORTING LINE" textarea value={b.support} onChange={(v) => set({ support: v })} />
      <Field label="VISIBLE-NODE NOTE" textarea value={b.visibleNote} onChange={(v) => set({ visibleNote: v })} />
      {b.nodes.map((s, i) => (
        <div key={i} className="grid grid-cols-[90px_1fr] gap-3">
          <Field label="NUM" value={s.num} onChange={(v) => set({ nodes: b.nodes.map((x, j) => (j === i ? { ...x, num: v } : x)) })} />
          <Field label="TITLE" value={s.title} onChange={(v) => set({ nodes: b.nodes.map((x, j) => (j === i ? { ...x, title: v } : x)) })} />
        </div>
      ))}
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="KNOW MORE LABEL" value={b.knowMore} onChange={(v) => set({ knowMore: v })} />
        <Field label="SPEECH BUBBLE" value={b.bubble} onChange={(v) => set({ bubble: v })} />
      </div>
      <Field label="REVEAL NARRATOR" textarea value={b.reveal.narrator}
        onChange={(v) => set({ reveal: { ...b.reveal, narrator: v } })} />
      <MediaManager label="REVEAL FRAME — VERTICAL" items={[b.reveal.image]} ratio="3/4.4"
        onChange={(arr) => arr[0] && set({ reveal: { ...b.reveal, image: arr[0] } })} />
    </Group>
  );
}

function ContactEditor() {
  const { data, update } = useStore();
  const c = data.contact;
  const set = (patch: Partial<typeof c>) => update((d) => ({ ...d, contact: { ...d.contact, ...patch } }));
  return (
    <Group title="CONTACT — FINAL TRANSMISSION">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="IDENTITY A" value={c.identityA} onChange={(v) => set({ identityA: v })} />
        <Field label="IDENTITY B (CRIMSON)" value={c.identityB} onChange={(v) => set({ identityB: v })} />
        <Field label="EMAIL" value={c.email} onChange={(v) => set({ email: v })} />
        <Field label="RESUME URL / FILE" value={c.resumeUrl} onChange={(v) => set({ resumeUrl: v })} />
      </div>
      <Field label="STATEMENT" textarea value={c.statement} onChange={(v) => set({ statement: v })} />
      <Field label="MESSAGE" textarea value={c.message} onChange={(v) => set({ message: v })} />
      <Field label="SIGNATURE" value={c.signature} onChange={(v) => set({ signature: v })} />
      <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">SOCIAL CHANNELS</span>
      {(c.socials ?? []).map((s, i) => (
        <div key={s.label} className="grid grid-cols-[110px_1fr] gap-3">
          <Field label="LABEL" value={s.label} onChange={(v) => set({ socials: c.socials.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
          <Field label="URL" value={s.url} onChange={(v) => set({ socials: c.socials.map((x, j) => (j === i ? { ...x, url: v } : x)) })} />
        </div>
      ))}
      <MediaManager label="PORTRAIT — 9:16" items={[c.portrait]} ratio="9/16"
        onChange={(arr) => arr[0] && set({ portrait: arr[0] })} />
    </Group>
  );
}

/* ---------- editor shell ---------- */

const SECTIONS: { id: string; num: string; label: string; el: React.ReactNode }[] = [
  { id: "hero", num: "00", label: "HERO", el: <Hero /> },
  { id: "expertise", num: "01", label: "MY EXPERTISE", el: <Expertise /> },
  { id: "core", num: "02", label: "CORE", el: <CreativeCore /> },
  { id: "showreel", num: "03", label: "MY WORK", el: <ShowReel /> },
  { id: "ailab", num: "04", label: "AI LAB", el: <AILab /> },
  { id: "arc", num: "05", label: "ARC", el: <Arc /> },
  { id: "pipeline", num: "06", label: "THE PIPELINE", el: <HowIBuild /> },
  { id: "contact", num: "08", label: "CONTACT", el: null },
];

export default function Editor() {
  const { resetAll, storageNote } = useStore();
  const [, nav] = useHashRoute();
  const [active, setActive] = useState("hero");

  const workspace: Record<string, React.ReactNode> = {
    hero: <HeroEditor />,
    expertise: <ExpertiseEditor />,
    core: <CoreEditor />,
    showreel: <ShowReelEditor />,
    ailab: <AILabEditor />,
    arc: <ArcEditor />,
    pipeline: <BuildEditor />,
    contact: <ContactEditor />,
  };

  const previewEl = SECTIONS.find((s) => s.id === active)?.el;

  return (
    <div className="min-h-screen" style={{ background: "var(--page)", color: "var(--ink)" }}>
      {/* console bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] mat-texture" style={{ background: "var(--sup1)" }}>
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
          <span className="f-automata text-[16px] tracking-[0.08em]">
            <span className="text-[var(--ink)]">CB</span><span className="text-[var(--crimson)]">K</span>
          </span>
          <span className="f-tech font-bold text-[11px] tracking-[0.3em] text-[var(--ink2)]">PRODUCTION CONSOLE</span>
          <span className="f-mono text-[9px] tracking-[0.22em] px-2 py-1 rounded-md border border-[var(--line)] text-[var(--ink2)] hidden sm:inline-flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--crimson)] live-blink" /> LIVE DATA
          </span>
          {storageNote && <span className="f-mono text-[9px] tracking-[0.18em] text-[var(--crimson)] hidden md:inline">{storageNote}</span>}
          <div className="ml-auto flex items-center gap-2.5">
            <button onClick={() => { if (window.confirm("Reset all portfolio data to defaults?")) resetAll(); }}
              className="f-tech font-bold text-[10px] tracking-[0.2em] px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--ink2)] hover:text-[var(--crimson)] hover:border-[var(--crimson)] transition-colors">
              RESET DATA
            </button>
            <button onClick={() => nav("#/")}
              className="f-tech font-bold text-[10px] tracking-[0.2em] px-3 py-2 rounded-lg bg-[var(--crimson)] text-[#DDDDD8] hover:opacity-90 transition-opacity">
              VIEW SITE →
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[220px_minmax(0,1fr)_440px] gap-6 items-start">
        {/* left — section navigation */}
        <nav className="lg:sticky lg:top-20 flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`shrink-0 lg:shrink flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-300 ${
                active === s.id ? "bg-[var(--crimson)] text-[#DDDDD8]" : "text-[var(--ink2)] hover:bg-[var(--sup1)] hover:text-[var(--ink)]"
              }`}>
              <span className={`f-mono text-[9px] tracking-[0.2em] ${active === s.id ? "opacity-80" : "text-[var(--crimson)]"}`}>{s.num}</span>
              <span className="f-tech font-bold text-[11.5px] tracking-[0.16em] whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </nav>

        {/* center — editing workspace */}
        <main className="min-w-0 flex flex-col gap-5">
          {workspace[active]}
        </main>

        {/* right — live preview */}
        <aside className="lg:sticky lg:top-20 min-w-0">
          <div className="flex items-center justify-between mb-3">
            <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">LIVE PREVIEW — {SECTIONS.find((s) => s.id === active)?.label}</span>
            <span className="f-mono text-[9px] tracking-[0.2em] text-[var(--crimson)]">INSTANT</span>
          </div>
          <div className="border border-[var(--line)] rounded-xl overflow-hidden mat-page-card" style={{ height: 560 }}>
            {previewEl ? (
              <div style={{ width: "233%", transform: "scale(0.43)", transformOrigin: "top left", pointerEvents: "none" }}>
                {previewEl}
              </div>
            ) : (
              <div className="h-full grid place-items-center f-mono text-[10px] tracking-[0.24em] text-[var(--ink2)]">
                PREVIEW ON SITE — #contact
              </div>
            )}
          </div>
          <p className="mt-3 f-mono text-[9px] leading-relaxed tracking-[0.14em] text-[var(--ink2)]">
            EDITS WRITE TO THE SAME STRUCTURED DATA THE PUBLIC SITE READS. UPLOADS PERSIST IN LOCAL STORAGE.
          </p>
        </aside>
      </div>
    </div>
  );
}
