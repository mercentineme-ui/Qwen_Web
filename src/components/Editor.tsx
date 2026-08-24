import React, { useRef, useState } from "react";
import { ArcEntry, Company, MediaItem, nextId } from "../lib/data";
import { readAsDataURL, useHashRoute, useStore } from "../lib/store";
import AILab from "./AILab";
import Arc from "./Arc";
import { Contact, HowIBuild } from "./Closing";
import CreativeCore from "./CreativeCore";
import Expertise from "./Expertise";
import Hero from "./Hero";
import ShowReel from "./ShowReel";

/* ================= building blocks ================= */

function Field({ label, value, onChange, textarea, hint }: {
  label: string; value: string; onChange: (v: string) => void; textarea?: boolean; hint?: string;
}) {
  return (
    <label className="block">
      <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)] flex justify-between">
        {label}{hint && <em className="not-italic opacity-60">{hint}</em>}
      </span>
      {textarea ? (
        <textarea className="ed-field mt-1.5 min-h-[86px] leading-relaxed" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="ed-field mt-1.5" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

function UploadBtn({ accept, onFile, label }: { accept: string; onFile: (f: File) => void; label: string }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ""; }} />
      <button onClick={() => ref.current?.click()}
        className="f-tech font-bold text-[9px] tracking-[0.18em] px-2.5 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)] transition-colors duration-300">
        {label}
      </button>
    </>
  );
}

function MediaManager({ items, onChange, ratio, allowAdd, kind = "image", label }: {
  items: MediaItem[]; onChange: (next: MediaItem[]) => void; ratio: string;
  allowAdd?: boolean; kind?: "image" | "video" | "audio"; label: string;
}) {
  const accept = kind === "image" ? "image/*" : kind === "video" ? "video/*" : "audio/*";
  const upload = async (i: number, f: File) => {
    const src = await readAsDataURL(f);
    onChange(items.map((it, j) => (j === i ? { ...it, src, kind } : it)));
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="border border-[var(--line)] rounded-lg p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="f-mono text-[9px] tracking-[0.24em] text-[var(--ink2)]">{label}</span>
        {allowAdd && (
          <button onClick={() => onChange([...items, { id: nextId(), kind, label: `${kind.toUpperCase()} ${String(items.length + 1).padStart(2, "0")}`, src: null, emptyLines: kind === "video" ? ["ADD VIDEO"] : ["ADD IMAGE"] }])}
            className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]">
            + ADD {kind.toUpperCase()}
          </button>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((it, i) => (
          <div key={it.id} className="border border-[var(--line)] rounded-lg p-3 flex gap-3">
            <div className="w-20 shrink-0 relative overflow-hidden rounded mat-page-card border border-[var(--line)]" style={{ aspectRatio: ratio }}>
              {it.src ? (
                it.kind === "video"
                  ? <video src={it.src} muted className="absolute inset-0 w-full h-full object-cover" />
                  : <img src={it.src} alt={it.label} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center f-mono text-[7px] tracking-widest text-[var(--crimson)]">EMPTY</span>
              )}
            </div>
            <div className="min-w-0 flex-1 flex flex-col gap-1.5">
              <span className="f-mono text-[8px] tracking-[0.2em] text-[var(--ink2)] truncate">{it.label}</span>
              <div className="flex flex-wrap gap-1.5 mt-auto">
                <UploadBtn accept={accept} label={it.src ? "REPLACE" : "UPLOAD"} onFile={(f) => upload(i, f)} />
                {it.src && (
                  <button onClick={() => onChange(items.map((x, j) => (j === i ? { ...x, src: null } : x)))}
                    className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg text-[var(--crimson)] border border-[var(--line)] hover:border-[var(--crimson)]">
                    DELETE
                  </button>
                )}
                <button onClick={() => move(i, -1)} className="f-tech font-bold text-[9px] px-2 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--ink)]">↑</button>
                <button onClick={() => move(i, 1)} className="f-tech font-bold text-[9px] px-2 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--ink)]">↓</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--line)] rounded-xl p-5 bg-[var(--page)]">
      <h4 className="f-tech font-bold text-[11px] tracking-[0.26em] text-[var(--crimson)] mb-4">{title}</h4>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

/* ================= section editors ================= */

function HeroEditor() {
  const { data, update } = useStore();
  const h = data.hero;
  const set = (patch: Partial<typeof h>) => update((d) => ({ ...d, hero: { ...d.hero, ...patch } }));
  const setGreeting = (k: "MORNING" | "AFTERNOON" | "EVENING", v: string) =>
    set({ greetings: { ...h.greetings, [k]: v } });
  return (
    <Group title="HERO — EDIT WORKSPACE">
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="GREETING — MORNING" hint="USE {DAYPART}" value={h.greetings.MORNING} onChange={(v) => setGreeting("MORNING", v)} />
        <Field label="GREETING — AFTERNOON" hint="USE {DAYPART}" value={h.greetings.AFTERNOON} onChange={(v) => setGreeting("AFTERNOON", v)} />
        <Field label="GREETING — EVENING" hint="USE {DAYPART}" value={h.greetings.EVENING} onChange={(v) => setGreeting("EVENING", v)} />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="ABOUT LABEL" value={h.aboutLabel} onChange={(v) => set({ aboutLabel: v })} />
        <Field label="NAME — LINE 01" value={h.nameA} onChange={(v) => set({ nameA: v })} />
        <Field label="NAME — LINE 02 (CRIMSON)" value={h.nameB} onChange={(v) => set({ nameB: v })} />
      </div>
      <Field label="DISCIPLINES — ONE PER LINE" textarea hint={`${h.chips.length} ACTIVE`}
        value={h.chips.join("\n")} onChange={(v) => set({ chips: lines(v).length ? lines(v) : h.chips })} />
      <Field label="DESCRIPTION" textarea value={h.description} onChange={(v) => set({ description: v })} />
      <div className="grid sm:grid-cols-3 gap-4">
        <Field label="CTA PRIMARY" value={h.ctaPrimary} onChange={(v) => set({ ctaPrimary: v })} />
        <Field label="CTA SECONDARY" value={h.ctaSecondary} onChange={(v) => set({ ctaSecondary: v })} />
        <Field label="ROTATION (SECONDS)" value={String(h.rotationSeconds)} onChange={(v) => set({ rotationSeconds: Math.max(3, Number(v) || 15) })} />
      </div>
      <MediaManager label="HERO IMAGES — SAME CIRCULAR FRAME" items={h.images} ratio="1/1" onChange={(images) => set({ images })} />
    </Group>
  );
}

function ExpertiseEditor() {
  const { data, update } = useStore();
  const ex = data.expertise;
  const set = (patch: Partial<typeof ex>) => update((d) => ({ ...d, expertise: { ...d.expertise, ...patch } }));
  const setCo = (i: number, patch: Partial<Company>) =>
    set({ companies: ex.companies.map((c, j) => (j === i ? { ...c, ...patch } : c)) });
  return (
    <Group title="MY EXPERTISE — EDIT WORKSPACE">
      <Field label="STATEMENT" value={ex.statement} onChange={(v) => set({ statement: v })} />
      <Field label="STATEMENT ACCENT (CRIMSON)" value={ex.statementAccent} onChange={(v) => set({ statementAccent: v })} />
      <Field label="SUPPORTING LINE" value={ex.supporting} onChange={(v) => set({ supporting: v })} />
      {ex.companies.map((c, i) => (
        <div key={c.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
          <span className="f-mono text-[10px] tracking-[0.24em] text-[var(--ink)]">{c.num} — COMPANY DOSSIER</span>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="COMPANY" value={c.name} onChange={(v) => setCo(i, { name: v })} />
            <Field label="ROLE" value={c.role} onChange={(v) => setCo(i, { role: v })} />
          </div>
          <Field label="DATE / LOCATION" value={c.date} onChange={(v) => setCo(i, { date: v })} />
          <Field label="DESCRIPTION" hint="WRAP [ WORD ] FOR CRIMSON HIGHLIGHT" textarea value={c.description} onChange={(v) => setCo(i, { description: v })} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="SKILLS — ONE PER LINE" textarea value={c.skills.join("\n")} onChange={(v) => setCo(i, { skills: lines(v) })} />
            <Field label="TOOLS — ONE PER LINE" textarea value={c.tools.join("\n")} onChange={(v) => setCo(i, { tools: lines(v) })} />
          </div>
          <Field label="PROJECT / DOMAIN (OPTIONAL)" value={c.domain} onChange={(v) => setCo(i, { domain: v })} />
          <MediaManager label={`MEDIA — ${c.media.length} SLOTS`} items={c.media} ratio="1/1" allowAdd onChange={(media) => setCo(i, { media })} />
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
    <Group title="CREATIVE CORE — DISCIPLINES">
      {core.map((dis, i) => (
        <div key={dis.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <Field label="NUM" value={dis.num} onChange={(v) => set(core.map((x, j) => (j === i ? { ...x, num: v } : x)))} />
            <Field label="DISCIPLINE" value={dis.name} onChange={(v) => set(core.map((x, j) => (j === i ? { ...x, name: v } : x)))} />
          </div>
          <Field label="DESCRIPTION" textarea value={dis.blurb} onChange={(v) => set(core.map((x, j) => (j === i ? { ...x, blurb: v } : x)))} />
          <Field label="TAGS — ONE PER LINE (3)" textarea value={dis.tags.join("\n")} onChange={(v) => set(core.map((x, j) => (j === i ? { ...x, tags: lines(v) } : x)))} />
        </div>
      ))}
    </Group>
  );
}

function ShowReelEditor() {
  const { data, update } = useStore();
  const sr = data.showReel;
  const set = (patch: Partial<typeof sr>) => update((d) => ({ ...d, showReel: { ...d.showReel, ...patch } }));
  return (
    <Group title="SHOW REEL — MEDIA">
      <MediaManager label="PORTRAIT STUDIES — 9:16 (5)" items={sr.portraits} ratio="9/16" allowAdd onChange={(portraits) => set({ portraits })} />
      <MediaManager label="WIDE FRAMES — 16:9 (6)" items={sr.landscapes} ratio="16/9" allowAdd onChange={(landscapes) => set({ landscapes })} />
    </Group>
  );
}

function AILabEditor() {
  const { data, update } = useStore();
  const lab = data.aiLab;
  const set = (patch: Partial<typeof lab>) => update((d) => ({ ...d, aiLab: { ...d.aiLab, ...patch } }));
  return (
    <Group title="AI LAB — EDIT WORKSPACE (CUBE IS LOCKED)">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="PROJECT NAME" value={lab.projectName} onChange={(v) => set({ projectName: v })} />
        <Field label="SUB LABEL" value={lab.subLabel} onChange={(v) => set({ subLabel: v })} />
        <Field label="PROJECT TYPE" value={lab.projectType} onChange={(v) => set({ projectType: v })} />
        <Field label="STATUS" value={lab.projectStatus} onChange={(v) => set({ projectStatus: v })} />
      </div>
      <Field label="PROJECT DESCRIPTION" textarea value={lab.projectDescription} onChange={(v) => set({ projectDescription: v })} />
      <Field label="TOOLS IN PLAY — ONE PER LINE" textarea value={lab.tools.join("\n")} onChange={(v) => set({ tools: lines(v) })} />
      <MediaManager label="FEATURED VIDEO — 16:9" items={[lab.video]} ratio="16/9" kind="video"
        onChange={(arr) => arr[0] && set({ video: arr[0] })} />
      <MediaManager label="IMAGE GRID — GENERIC UPLOAD SLOTS (8)" items={lab.images} ratio="16/9" allowAdd
        onChange={(images) => set({ images })} />
    </Group>
  );
}

function ArcEditor() {
  const { data, update } = useStore();
  const { characters, worlds } = data.arc;
  const setChars = (characters: ArcEntry[]) => update((d) => ({ ...d, arc: { ...d.arc, characters } }));
  const setWorlds = (worlds: ArcEntry[]) => update((d) => ({ ...d, arc: { ...d.arc, worlds } }));

  const entryEditor = (kind: "CHARACTER" | "WORLD", e: ArcEntry, i: number) => {
    const list = kind === "CHARACTER" ? characters : worlds;
    const setList = kind === "CHARACTER" ? setChars : setWorlds;
    const patch = (p: Partial<ArcEntry>) => setList(list.map((x, j) => (j === i ? { ...x, ...p } : x)));
    return (
      <div key={e.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <input className="ed-field !py-1.5 flex-1" value={e.name} onChange={(ev) => patch({ name: ev.target.value })} />
          <button onClick={() => setList(list.filter((_, j) => j !== i))}
            className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg text-[var(--crimson)] border border-[var(--line)] hover:border-[var(--crimson)]">DELETE</button>
        </div>
        <Field label="NAME" value={e.name} onChange={(v) => patch({ name: v })} />
        <Field label="TOOLS USED" value={e.tools} onChange={(v) => patch({ tools: v })} />
        <Field label={`${kind} DESCRIPTION`} textarea value={e.description} onChange={(v) => patch({ description: v })} />
        <MediaManager label={kind === "CHARACTER" ? "PORTRAIT — 9:16" : "LANDSCAPE — 16:9"}
          items={[e.image]} ratio={kind === "CHARACTER" ? "9/16" : "16/9"}
          onChange={(arr) => arr[0] && patch({ image: arr[0] })} />
      </div>
    );
  };

  const addEntry = (kind: "CHARACTER" | "WORLD") => {
    const fresh = (n: number): ArcEntry => ({
      id: nextId(),
      name: `${kind} SLOT ${String(n).padStart(2, "0")}`,
      image: { id: nextId(), kind: "image", label: kind === "CHARACTER" ? "PORTRAIT" : "LANDSCAPE", src: null, emptyLines: ["ADD IMAGE", kind === "CHARACTER" ? "9 : 16" : "16 : 9"] },
      tools: "",
      description: "",
    });
    if (kind === "CHARACTER") setChars([...characters, fresh(characters.length + 1)]);
    else setWorlds([...worlds, fresh(worlds.length + 1)]);
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
      <div className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
        <span className="f-mono text-[10px] tracking-[0.24em] text-[var(--ink)]">PIPELINE NODES — EXACTLY FOUR</span>
        {b.nodes.map((s, i) => (
          <div key={i} className="grid grid-cols-[90px_1fr] gap-3">
            <Field label="NUM" value={s.num} onChange={(v) => set({ nodes: b.nodes.map((x, j) => (j === i ? { ...x, num: v } : x)) })} />
            <Field label="TITLE" value={s.title} onChange={(v) => set({ nodes: b.nodes.map((x, j) => (j === i ? { ...x, title: v } : x)) })} />
          </div>
        ))}
        <Field label="NEXT BUTTON LABEL" value={b.nextLabel} onChange={(v) => set({ nextLabel: v })} />
      </div>
      <div className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
        <span className="f-mono text-[10px] tracking-[0.24em] text-[var(--ink)]">REVEALED PANEL</span>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field label="HEADING" value={b.reveal.heading} onChange={(v) => set({ reveal: { ...b.reveal, heading: v } })} />
          <Field label="HEADING ACCENT (CRIMSON)" value={b.reveal.headingAccent} onChange={(v) => set({ reveal: { ...b.reveal, headingAccent: v } })} />
        </div>
        <Field label="NARRATOR TEXT" textarea value={b.reveal.narrator} onChange={(v) => set({ reveal: { ...b.reveal, narrator: v } })} />
        <MediaManager label="REVEAL FRAME — LARGE EMPTY EDITABLE" items={[b.reveal.image]} ratio="4/3"
          onChange={(arr) => arr[0] && set({ reveal: { ...b.reveal, image: arr[0] } })} />
      </div>
    </Group>
  );
}

function ContactEditor() {
  const { data, update } = useStore();
  const c = data.contact;
  const set = (patch: Partial<typeof c>) => update((d) => ({ ...d, contact: { ...d.contact, ...patch } }));
  return (
    <Group title="CONTACT — EDIT WORKSPACE">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="HEADING — PART 01" value={c.headingA} onChange={(v) => set({ headingA: v })} />
        <Field label="HEADING — PART 02 (CRIMSON)" value={c.headingB} onChange={(v) => set({ headingB: v })} />
      </div>
      <Field label="CLOSING LINE" value={c.closing} onChange={(v) => set({ closing: v })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="EMAIL LABEL" value={c.emailLabel} onChange={(v) => set({ emailLabel: v })} />
        <Field label="EMAIL ADDRESS" value={c.email} onChange={(v) => set({ email: v })} />
      </div>
      <div className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
        <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">SOCIAL CHANNELS</span>
        {(c.socials ?? []).map((s, i) => (
          <div key={s.label} className="grid grid-cols-[110px_1fr] gap-3">
            <Field label="LABEL" value={s.label} onChange={(v) => set({ socials: c.socials.map((x, j) => (j === i ? { ...x, label: v } : x)) })} />
            <Field label="URL" value={s.url} onChange={(v) => set({ socials: c.socials.map((x, j) => (j === i ? { ...x, url: v } : x)) })} />
          </div>
        ))}
      </div>
      <div className="border border-[var(--line)] rounded-lg p-4">
        <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">RESUME FILE</span>
        <div className="mt-2 flex items-center gap-2.5">
          <UploadBtn accept="application/pdf,.pdf,.doc,.docx" label={c.resumeUrl ? "REPLACE RESUME" : "UPLOAD RESUME"}
            onFile={async (f) => set({ resumeUrl: await readAsDataURL(f) })} />
          {c.resumeUrl && (
            <>
              <a href={c.resumeUrl} download="CBK-Resume" className="f-tech font-bold text-[9px] tracking-[0.18em] px-2.5 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--ink)]">DOWNLOAD TEST</a>
              <button onClick={() => set({ resumeUrl: "" })} className="f-tech font-bold text-[9px] tracking-[0.18em] px-2.5 py-1.5 rounded-lg text-[var(--crimson)] border border-[var(--line)] hover:border-[var(--crimson)]">DELETE</button>
            </>
          )}
          <span className="f-mono text-[9px] text-[var(--ink2)] ml-auto">{c.resumeUrl ? "LOADED ✓" : "EMPTY SLOT"}</span>
        </div>
      </div>
      <MediaManager label="CONTACT PORTRAIT — 9:16" items={[c.portrait]} ratio="9/16" onChange={(arr) => arr[0] && set({ portrait: arr[0] })} />
    </Group>
  );
}

/* ================= editor shell ================= */

const SECTIONS = [
  { id: "hero", num: "00", label: "HERO", el: <Hero /> },
  { id: "expertise", num: "01", label: "MY EXPERTISE", el: <Expertise /> },
  { id: "core", num: "02", label: "CREATIVE CORE", el: <CreativeCore /> },
  { id: "showreel", num: "03", label: "SHOW REEL", el: <ShowReel /> },
  { id: "ailab", num: "04", label: "AI LAB", el: <AILab /> },
  { id: "arc", num: "05", label: "ARC", el: <Arc /> },
  { id: "build", num: "06", label: "THE PIPELINE", el: <HowIBuild /> },
  { id: "contact", num: "07", label: "CONTACT", el: <Contact /> },
] as const;

const EDITORS: Record<string, () => React.ReactElement> = {
  hero: HeroEditor, expertise: ExpertiseEditor, core: CoreEditor, showreel: ShowReelEditor,
  ailab: AILabEditor, arc: ArcEditor, build: BuildEditor, contact: ContactEditor,
};

export default function Editor() {
  const [, nav] = useHashRoute();
  const { storageNote, resetAll } = useStore();
  const [active, setActive] = useState<string>("hero");
  const [confirmReset, setConfirmReset] = useState(false);
  const ActiveEditor = EDITORS[active] ?? HeroEditor;
  const preview = SECTIONS.find((s) => s.id === active);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--page)" }}>
      {/* top bar */}
      <div className="sticky top-0 z-40 border-b border-[var(--line)] mat-page-card mat-texture">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 h-[62px] flex items-center gap-4">
          <span className="f-automata text-[17px] tracking-[0.08em]">
            CBK<span className="text-[var(--crimson)]">_</span>
          </span>
          <span className="f-mono text-[10px] tracking-[0.3em] text-[var(--ink2)] hidden sm:inline">PRODUCTION CONSOLE</span>
          <span className="flex-1" />
          {storageNote && <span className="f-mono text-[9px] tracking-[0.2em] text-[var(--crimson)]">{storageNote}</span>}
          {!confirmReset ? (
            <button onClick={() => setConfirmReset(true)}
              className="f-tech font-bold text-[10px] tracking-[0.22em] px-3 py-2 rounded-lg border border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)] transition-colors">
              RESET DATA
            </button>
          ) : (
            <span className="flex items-center gap-2">
              <button onClick={() => { resetAll(); setConfirmReset(false); }}
                className="f-tech font-bold text-[10px] tracking-[0.22em] px-3 py-2 rounded-lg bg-[var(--crimson)] text-[#f4f2ed]">
                CONFIRM RESET
              </button>
              <button onClick={() => setConfirmReset(false)}
                className="f-tech font-bold text-[10px] tracking-[0.22em] px-3 py-2 rounded-lg border border-[var(--line)]">
                CANCEL
              </button>
            </span>
          )}
          <button onClick={() => nav("#/")}
            className="f-tech font-bold text-[10px] tracking-[0.22em] px-3.5 py-2 rounded-lg border border-[var(--ink)] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all">
            VIEW SITE ↗
          </button>
        </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[210px_minmax(0,1fr)_360px] gap-6 items-start">
        {/* LEFT — section navigation */}
        <div className="lg:sticky lg:top-[86px] flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setActive(s.id)}
              className={`shrink-0 lg:shrink flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all duration-300 ${
                active === s.id
                  ? "border-[var(--crimson)] bg-[color-mix(in_srgb,var(--crimson)_10%,transparent)]"
                  : "border-[var(--line)] hover:border-[var(--ink2)]"
              }`}>
              <span className={`f-mono text-[9px] tracking-[0.2em] ${active === s.id ? "text-[var(--crimson)]" : "text-[var(--ink2)]"}`}>{s.num}</span>
              <span className={`f-tech font-bold text-[11px] tracking-[0.16em] whitespace-nowrap ${active === s.id ? "text-[var(--crimson)]" : "text-[var(--ink)]"}`}>
                {s.label}
              </span>
            </button>
          ))}
        </div>

        {/* CENTER — editing workspace */}
        <div className="min-w-0">
          <ActiveEditor />
        </div>

        {/* RIGHT — live preview */}
        <div className="lg:sticky lg:top-[86px] hidden xl:block">
          <div className="border border-[var(--line)] rounded-xl overflow-hidden mat-page-card">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--line)]">
              <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">LIVE PREVIEW — {preview?.label}</span>
              <span className="w-1.5 h-1.5 bg-[var(--crimson)] live-blink" />
            </div>
            <div className="h-[560px] overflow-hidden pointer-events-none" style={{ background: "var(--page)" }}>
              <div style={{ width: "238%", transform: "scale(0.42)", transformOrigin: "top left" }}>
                {preview?.el}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
