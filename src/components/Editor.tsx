import React, { useRef, useState } from "react";
import {
  ArcCharacter, ArcWorld, Company, Discipline, MediaItem, nextId, PortfolioData,
} from "../lib/data";
import { readAsDataURL, useHashRoute, useStore } from "../lib/store";
import { disciplineIcons } from "./icons";
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
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--crimson)]">{label}</span>
        {allowAdd && (
          <button onClick={() => onChange([...items, { id: nextId(), kind, label: `${kind.toUpperCase()} ${String(items.length + 1).padStart(2, "0")}`, src: null, emptyLines: ["ADD " + kind.toUpperCase()] }])}
            className="f-tech font-bold text-[9px] tracking-[0.18em] px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)] transition-colors">
            + ADD SLOT
          </button>
        )}
      </div>
      <div className="flex flex-col gap-2.5">
        {items.map((it, i) => (
          <div key={it.id} className="flex items-center gap-3 border border-[var(--line)] rounded-lg p-2.5 bg-[var(--sup1)]">
            <div className="w-16 shrink-0 rounded overflow-hidden border border-[var(--line)] bg-[var(--sup2)] grid place-items-center" style={{ aspectRatio: ratio }}>
              {it.src ? (
                it.kind === "video" ? <video src={it.src} className="w-full h-full object-cover" muted />
                  : it.kind === "audio" ? <audio src={it.src} controls className="w-full scale-75" />
                    : <img src={it.src} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="f-mono text-[7px] tracking-[0.14em] text-[var(--ink2)]">EMPTY</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <input className="ed-field !py-1.5 !text-[11px]" value={it.label}
                onChange={(e) => onChange(items.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                <UploadBtn accept={accept} label={it.src ? "REPLACE" : "UPLOAD"} onFile={(f) => upload(i, f)} />
                {it.src && (
                  <button onClick={() => onChange(items.map((x, j) => (j === i ? { ...x, src: null } : x)))}
                    className="f-tech font-bold text-[9px] tracking-[0.18em] px-2.5 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)] transition-colors">
                    DELETE
                  </button>
                )}
                <button onClick={() => move(i, -1)} className="f-tech font-bold text-[9px] px-2 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--ink)] transition-colors">▲</button>
                <button onClick={() => move(i, 1)} className="f-tech font-bold text-[9px] px-2 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--ink)] transition-colors">▼</button>
                {allowAdd && (
                  <button onClick={() => onChange(items.filter((_, j) => j !== i))}
                    className="f-tech font-bold text-[9px] tracking-[0.18em] px-2.5 py-1.5 rounded-lg text-[var(--crimson)] border border-transparent hover:border-[var(--crimson)] transition-colors ml-auto">
                    REMOVE
                  </button>
                )}
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
  return (
    <Group title="HERO — EDIT WORKSPACE">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="MORNING LABEL" value={h.morningLabel} onChange={(v) => set({ morningLabel: v })} />
        <Field label="ROTATION (SECONDS)" value={String(h.rotationSeconds)} onChange={(v) => set({ rotationSeconds: Math.max(3, Number(v) || 15) })} />
      </div>
      <Field label="GREETING" value={h.greeting} onChange={(v) => set({ greeting: v })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="NAME — LINE 01" value={h.nameA} onChange={(v) => set({ nameA: v })} />
        <Field label="NAME — LINE 02 (CRIMSON)" value={h.nameB} onChange={(v) => set({ nameB: v })} />
      </div>
      <Field label="DISCIPLINES — ONE PER LINE" textarea hint={`${h.chips.length} ACTIVE`}
        value={h.chips.join("\n")} onChange={(v) => set({ chips: lines(v).length ? lines(v) : h.chips })} />
      <Field label="DESCRIPTION" textarea value={h.description} onChange={(v) => set({ description: v })} />
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="CTA PRIMARY" value={h.ctaPrimary} onChange={(v) => set({ ctaPrimary: v })} />
        <Field label="CTA SECONDARY" value={h.ctaSecondary} onChange={(v) => set({ ctaSecondary: v })} />
      </div>
      <MediaManager label="HERO IMAGES — 01→04 · SAME CIRCULAR FRAME" items={h.images} ratio="1/1"
        onChange={(images) => set({ images })} />
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
          <MediaManager label={`MEDIA — DEFAULT ${c.media.length} SLOTS`} items={c.media} ratio="1/1" allowAdd
            onChange={(media) => setCo(i, { media })} />
        </div>
      ))}
    </Group>
  );
}

function CoreEditor() {
  const { data, update } = useStore();
  const setD = (i: number, patch: Partial<Discipline>) =>
    update((d) => ({ ...d, core: d.core.map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
  return (
    <Group title="CREATIVE CORE — 09 DISCIPLINES">
      {data.core.map((disc, i) => (
        <div key={disc.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
          <div className="grid sm:grid-cols-[90px_1fr_150px] gap-4">
            <Field label="NUM" value={disc.num} onChange={(v) => setD(i, { num: v })} />
            <Field label="NAME" value={disc.name} onChange={(v) => setD(i, { name: v })} />
            <label className="block">
              <span className="f-mono text-[9px] tracking-[0.26em] text-[var(--ink2)]">ICON</span>
              <select className="ed-field mt-1.5" value={disc.icon} onChange={(e) => setD(i, { icon: e.target.value })}>
                {Object.keys(disciplineIcons).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </label>
          </div>
          <Field label="DETAIL CARD COPY" textarea value={disc.blurb} onChange={(v) => setD(i, { blurb: v })} />
          <Field label="TAGS — ONE PER LINE" value={disc.tags.join("\n")} onChange={(v) => setD(i, { tags: lines(v) })} />
        </div>
      ))}
    </Group>
  );
}

function ShowReelEditor() {
  const { data, update } = useStore();
  const set = (patch: Partial<PortfolioData["showReel"]>) => update((d) => ({ ...d, showReel: { ...d.showReel, ...patch } }));
  return (
    <Group title="SHOW REEL — MEDIA MANAGER">
      <MediaManager label="PORTRAITS — 9:16 (ABOVE)" items={data.showReel.portraits} ratio="9/16" allowAdd onChange={(portraits) => set({ portraits })} />
      <MediaManager label="LANDSCAPES — 16:9 DRAGGABLE TRACK (BELOW)" items={data.showReel.landscapes} ratio="16/9" allowAdd onChange={(landscapes) => set({ landscapes })} />
      <p className="f-mono text-[9px] tracking-[0.2em] text-[var(--ink2)]">SHIP / SEA / ISLAND / KRAKEN ARE INTERFACE BEHAVIOUR — NOT MEDIA.</p>
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
        <Field label="SUB-LABEL" value={lab.subLabel} onChange={(v) => set({ subLabel: v })} />
        <Field label="TYPE" value={lab.projectType} onChange={(v) => set({ projectType: v })} />
        <Field label="STATUS" value={lab.projectStatus} onChange={(v) => set({ projectStatus: v })} />
      </div>
      <Field label="DESCRIPTION" textarea value={lab.projectDescription} onChange={(v) => set({ projectDescription: v })} />
      <Field label="TOOLS IN PLAY — ONE PER LINE" textarea value={lab.tools.join("\n")} onChange={(v) => set({ tools: lines(v) })} />
      <MediaManager label="FEATURED VIDEO — 16:9 (ONE SLOT)" items={[lab.video]} ratio="16/9" kind="video"
        onChange={(arr) => arr[0] && set({ video: arr[0] })} />
      <MediaManager label="IMAGE GRID — EXACTLY 08 RECOMMENDED · 16:9" items={lab.images} ratio="16/9" allowAdd
        onChange={(images) => set({ images })} />
    </Group>
  );
}

function ArcEditor() {
  const { data, update } = useStore();
  const { characters, worlds } = data.arc;
  const setChars = (characters: ArcCharacter[]) => update((d) => ({ ...d, arc: { ...d.arc, characters } }));
  const setWorlds = (worlds: ArcWorld[]) => update((d) => ({ ...d, arc: { ...d.arc, worlds } }));

  const charEditor = (c: ArcCharacter, i: number) => {
    const patch = (p: Partial<ArcCharacter>) => setChars(characters.map((x, j) => (j === i ? { ...x, ...p } : x)));
    const dp = (k: keyof ArcCharacter["dossier"], v: string) => patch({ dossier: { ...c.dossier, [k]: v } });
    return (
      <div key={c.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <input className="ed-field !py-1.5 flex-1" value={c.name} onChange={(e) => patch({ name: e.target.value })} />
          <button onClick={() => setChars(characters.filter((_, j) => j !== i))}
            className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg text-[var(--crimson)] border border-[var(--line)] hover:border-[var(--crimson)]">DELETE</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field label="ROLE" value={c.dossier.role} onChange={(v) => dp("role", v)} />
          <Field label="PROJECT" value={c.dossier.project} onChange={(v) => dp("project", v)} />
        </div>
        <Field label="DESCRIPTION" textarea value={c.dossier.description} onChange={(v) => dp("description", v)} />
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field label="TOOLS" value={c.dossier.tools} onChange={(v) => dp("tools", v)} />
          <Field label="IDEA" value={c.dossier.idea} onChange={(v) => dp("idea", v)} />
        </div>
        <Field label="PROCESS" textarea value={c.dossier.process} onChange={(v) => dp("process", v)} />
        <MediaManager label="PORTRAIT — 9:16" items={[c.image]} ratio="9/16" onChange={(arr) => arr[0] && patch({ image: arr[0] })} />
      </div>
    );
  };

  const worldEditor = (w: ArcWorld, i: number) => {
    const patch = (p: Partial<ArcWorld>) => setWorlds(worlds.map((x, j) => (j === i ? { ...x, ...p } : x)));
    const dp = (k: keyof ArcWorld["dossier"], v: string) => patch({ dossier: { ...w.dossier, [k]: v } });
    return (
      <div key={w.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
        <div className="flex items-center gap-2">
          <input className="ed-field !py-1.5 flex-1" value={w.name} onChange={(e) => patch({ name: e.target.value })} />
          <button onClick={() => setWorlds(worlds.filter((_, j) => j !== i))}
            className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg text-[var(--crimson)] border border-[var(--line)] hover:border-[var(--crimson)]">DELETE</button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field label="WORLD / ENVIRONMENT" value={w.dossier.role} onChange={(v) => dp("role", v)} />
          <Field label="PROJECT" value={w.dossier.project} onChange={(v) => dp("project", v)} />
        </div>
        <Field label="DESCRIPTION" textarea value={w.dossier.description} onChange={(v) => dp("description", v)} />
        <div className="grid sm:grid-cols-2 gap-3.5">
          <Field label="TOOLS" value={w.dossier.tools} onChange={(v) => dp("tools", v)} />
          <Field label="IDEA" value={w.dossier.idea} onChange={(v) => dp("idea", v)} />
        </div>
        <Field label="PROCESS" textarea value={w.dossier.process} onChange={(v) => dp("process", v)} />
        <MediaManager label="LANDSCAPE — 16:9" items={[w.image]} ratio="16/9" onChange={(arr) => arr[0] && patch({ image: arr[0] })} />
      </div>
    );
  };

  return (
    <Group title="ARC — CHARACTERS & WORLDS">
      <div className="flex items-center justify-between">
        <span className="f-mono text-[10px] tracking-[0.24em]">AI CHARACTER SHEET</span>
        <button onClick={() => setChars([...characters, { id: nextId(), name: `CHARACTER SLOT ${String(characters.length + 1).padStart(2, "0")}`, image: { id: nextId(), kind: "image", label: "PORTRAIT", src: null, emptyLines: ["ADD IMAGE", "9 : 16"] }, dossier: { role: "", project: "", description: "", tools: "", idea: "", process: "" } }])}
          className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]">+ ADD CHARACTER SLOT</button>
      </div>
      {characters.map(charEditor)}
      <div className="flex items-center justify-between mt-2">
        <span className="f-mono text-[10px] tracking-[0.24em]">AI WORLD BUILDING</span>
        <button onClick={() => setWorlds([...worlds, { id: nextId(), name: `WORLD SLOT ${String(worlds.length + 1).padStart(2, "0")}`, image: { id: nextId(), kind: "image", label: "LANDSCAPE", src: null, emptyLines: ["ADD IMAGE", "16 : 9"] }, dossier: { role: "", project: "", description: "", tools: "", idea: "", process: "" } }])}
          className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]">+ ADD WORLD SLOT</button>
      </div>
      {worlds.map(worldEditor)}
    </Group>
  );
}

function BuildEditor() {
  const { data, update } = useStore();
  const steps = data.build.steps;
  const set = (next: typeof steps) => update((d) => ({ ...d, build: { steps: next } }));
  return (
    <Group title="HOW I BUILD — PROCESS STEPS">
      {steps.map((s, i) => (
        <div key={s.num} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
          <div className="grid grid-cols-[90px_1fr_auto] gap-3">
            <Field label="NUM" value={s.num} onChange={(v) => set(steps.map((x, j) => (j === i ? { ...x, num: v } : x)))} />
            <Field label="TITLE" value={s.title} onChange={(v) => set(steps.map((x, j) => (j === i ? { ...x, title: v } : x)))} />
            <button onClick={() => set(steps.filter((_, j) => j !== i))}
              className="self-end f-tech font-bold text-[9px] px-2.5 py-2.5 rounded-lg text-[var(--crimson)] border border-[var(--line)] hover:border-[var(--crimson)]">✕</button>
          </div>
          <Field label="TEXT" textarea value={s.text} onChange={(v) => set(steps.map((x, j) => (j === i ? { ...x, text: v } : x)))} />
        </div>
      ))}
      <button onClick={() => set([...steps, { num: String(steps.length + 1).padStart(2, "0"), title: "NEW STEP", text: "" }])}
        className="f-tech font-bold text-[10px] tracking-[0.18em] px-3 py-2.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)] self-start">+ ADD STEP</button>
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
  { id: "ailab", num: "03", label: "AI LAB", el: <AILab /> },
  { id: "arc", num: "05", label: "ARC", el: <Arc /> },
  { id: "build", num: "06", label: "HOW I BUILD", el: <HowIBuild /> },
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
  const Ed = EDITORS[active] ?? HeroEditor;
  const preview = SECTIONS.find((s) => s.id === active);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--page)" }}>
      {/* top bar */}
      <div className="sticky top-0 z-40 border-b border-[var(--line)] mat-outer mat-texture">
        <div className="px-4 sm:px-6 h-[58px] flex items-center gap-4">
          <span className="f-display text-[14px] px-2 py-1 bg-[var(--crimson)] text-[#f4f2ed] rounded-[4px]">CBK</span>
          <span className="f-tech font-bold text-[11px] tracking-[0.3em]">PORTFOLIO CMS</span>
          <span className="hidden sm:flex items-center gap-2 f-mono text-[9px] tracking-[0.22em] opacity-70">
            <span className="w-1.5 h-1.5 bg-[var(--surge)] live-blink" />PRODUCTION INTERFACE — v1.0
          </span>
          {storageNote && <span className="hidden md:block f-mono text-[9px] tracking-[0.18em] text-[var(--crimson)] ml-auto">{storageNote}</span>}
          <div className="flex items-center gap-2.5 ml-auto sm:ml-0">
            {confirmReset ? (
              <button onClick={() => { resetAll(); setConfirmReset(false); }} onMouseLeave={() => setConfirmReset(false)}
                className="f-tech font-bold text-[10px] tracking-[0.2em] px-3 py-2 rounded-lg bg-[var(--crimson)] text-[#f4f2ed]">CONFIRM RESET</button>
            ) : (
              <button onClick={() => setConfirmReset(true)}
                className="f-tech font-bold text-[10px] tracking-[0.2em] px-3 py-2 rounded-lg border border-[var(--m-line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)] transition-colors">RESET</button>
            )}
            <button onClick={() => nav("#/")}
              className="f-tech font-bold text-[10px] tracking-[0.2em] px-3 py-2 rounded-lg bg-[var(--crimson)] text-[#f4f2ed] hover:opacity-90 transition-opacity">
              ← BACK TO SITE
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 grid lg:grid-cols-[230px_1fr] xl:grid-cols-[230px_1fr_430px]">
        {/* left nav */}
        <aside className="border-r border-[var(--line)] p-4 lg:sticky lg:top-[58px] lg:h-[calc(100vh-58px)] overflow-y-auto">
          <p className="f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)] mb-3 px-2">SECTIONS</p>
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={`shrink-0 lg:shrink flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-300 ${
                  active === s.id ? "bg-[var(--crimson)] text-[#f4f2ed]" : "hover:bg-[var(--sup1)] text-[var(--ink2)] hover:text-[var(--ink)]"
                }`}>
                <span className={`f-mono text-[9px] tracking-[0.2em] ${active === s.id ? "opacity-80" : "text-[var(--crimson)]"}`}>{s.num}</span>
                <span className="f-tech font-bold text-[10px] tracking-[0.2em] whitespace-nowrap">{s.label}</span>
              </button>
            ))}
          </nav>
          <div className="hidden lg:block mt-8 px-2 f-mono text-[9px] leading-relaxed tracking-[0.14em] text-[var(--ink2)]">
            EVERY FIELD WRITES TO THE SAME STRUCTURED DATA THE PUBLIC SITE READS. CHANGES ARE LIVE IMMEDIATELY.
          </div>
        </aside>

        {/* center workspace */}
        <main className="p-4 sm:p-6 min-w-0">
          <Ed />
        </main>

        {/* right live preview */}
        <aside className="hidden xl:block border-l border-[var(--line)] lg:sticky lg:top-[58px] lg:h-[calc(100vh-58px)] overflow-y-auto bg-[var(--sup1)]">
          <div className="sticky top-0 z-10 px-4 py-3 border-b border-[var(--line)] flex items-center gap-2.5" style={{ backgroundColor: "var(--sup1)" }}>
            <span className="w-1.5 h-1.5 bg-[var(--crimson)] live-blink" />
            <span className="f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">LIVE PREVIEW — {preview?.label}</span>
          </div>
          <div className="p-3 overflow-hidden">
            <div className="pointer-events-none select-none origin-top-left" style={{ width: "200%", transform: "scale(0.5)" }}>
              {preview?.el}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
