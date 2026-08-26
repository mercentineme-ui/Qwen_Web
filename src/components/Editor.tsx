import React, { useState } from "react";
import { ArcEntry, MediaItem, nextId } from "../lib/data";
import { readAsDataURL, useHashRoute, useStore } from "../lib/store";
import { Reveal } from "./ui";

/* ============ shared field controls ============ */
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

/* ============ MEDIA MANAGER — upload / preview / replace / delete / reorder ============ */
function MediaManager({ items, onChange, ratio = "16/9", label }: {
  items: MediaItem[]; onChange: (items: MediaItem[]) => void; ratio?: string; label: string;
}) {
  const { storageNote } = useStore();
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--ink2)] block mb-2">{label}</span>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map((m, i) => (
          <div key={m.id} className="border border-[var(--line)] rounded-lg overflow-hidden bg-[var(--sup1)]">
            <div className="relative" style={{ aspectRatio: ratio }}>
              {m.src ? (
                m.kind === "video" ? (
                  <video src={m.src} className="absolute inset-0 w-full h-full object-cover" muted playsInline />
                ) : m.kind === "audio" ? (
                  <div className="absolute inset-0 grid place-items-center p-2"><audio src={m.src} controls className="w-full" /></div>
                ) : (
                  <img src={m.src} alt={m.label} className="absolute inset-0 w-full h-full object-cover" />
                )
              ) : (
                <div className="absolute inset-0 grid place-items-center f-mono text-[8px] tracking-[0.26em] text-[var(--ink2)] text-center p-2">
                  EMPTY SLOT
                </div>
              )}
            </div>
            <div className="p-2 flex flex-wrap gap-1.5">
              <label className="cursor-pointer f-tech font-bold text-[8.5px] tracking-[0.14em] px-2 py-1 rounded-[5px] bg-[var(--crimson)] text-[#DDDDD8]">
                {m.src ? "REPLACE" : "UPLOAD"}
                <input type="file" accept={m.kind === "video" ? "video/*" : m.kind === "audio" ? "audio/*" : "image/*"} className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    const src = await readAsDataURL(f);
                    onChange(items.map((x, k) => (k === i ? { ...x, src } : x)));
                  }} />
              </label>
              {m.src && (
                <button onClick={() => onChange(items.map((x, k) => (k === i ? { ...x, src: null } : x)))}
                  className="f-tech font-bold text-[8.5px] tracking-[0.14em] px-2 py-1 rounded-[5px] border border-[var(--line)] text-[var(--ink2)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]">
                  DELETE
                </button>
              )}
              <button onClick={() => move(i, -1)} disabled={i === 0}
                className="f-tech font-bold text-[8.5px] px-1.5 py-1 rounded-[5px] border border-[var(--line)] text-[var(--ink2)] disabled:opacity-30">←</button>
              <button onClick={() => move(i, 1)} disabled={i === items.length - 1}
                className="f-tech font-bold text-[8.5px] px-1.5 py-1 rounded-[5px] border border-[var(--line)] text-[var(--ink2)] disabled:opacity-30">→</button>
            </div>
          </div>
        ))}
      </div>
      {storageNote && <span className="mt-2 block f-mono text-[9px] tracking-[0.2em] text-[var(--crimson)]">{storageNote}</span>}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-[var(--line)] rounded-xl p-4 sm:p-5 flex flex-col gap-4">
      <span className="f-tech font-bold text-[11px] tracking-[0.24em] text-[var(--ink)]">{title}</span>
      {children}
    </div>
  );
}

/* ============ section editors ============ */
function HeroEditor() {
  const { data, update } = useStore();
  const h = data.hero;
  const set = (patch: Partial<typeof h>) => update((d) => ({ ...d, hero: { ...d.hero, ...patch } }));
  return (
    <Group title="HERO — GREETING / NAME / COPY / MEDIA">
      {(["MORNING", "AFTERNOON", "EVENING"] as const).map((k) => (
        <Field key={k} label={`GREETING — ${k}`} value={h.greetings[k]}
          onChange={(v) => set({ greetings: { ...h.greetings, [k]: v } })} />
      ))}
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="NAME LINE A" value={h.nameA} onChange={(v) => set({ nameA: v })} />
        <Field label="NAME LINE B" value={h.nameB} onChange={(v) => set({ nameB: v })} />
        <Field label="ABOUT LABEL" value={h.aboutLabel} onChange={(v) => set({ aboutLabel: v })} />
        <Field label="ROTATION (S)" value={String(h.rotationSeconds)} onChange={(v) => set({ rotationSeconds: Math.max(3, Number(v) || 15) })} />
      </div>
      <Field label="DESCRIPTION" textarea value={h.description} onChange={(v) => set({ description: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="CTA PRIMARY" value={h.ctaPrimary} onChange={(v) => set({ ctaPrimary: v })} />
        <Field label="CTA SECONDARY" value={h.ctaSecondary} onChange={(v) => set({ ctaSecondary: v })} />
      </div>
      <Field label="CHIPS (ONE PER LINE)" textarea value={h.chips.join("\n")}
        onChange={(v) => set({ chips: v.split("\n").map((s) => s.trim()).filter(Boolean) })} />
      <MediaManager label="PORTRAIT FRAMES 01–04 — 9:16" items={h.images} ratio="9/16"
        onChange={(imgs) => set({ images: imgs })} />
    </Group>
  );
}

function ExpertiseEditor() {
  const { data, update } = useStore();
  const ex = data.expertise;
  const setCo = (i: number, patch: Partial<typeof ex.companies[number]>) =>
    update((d) => ({ ...d, expertise: { ...d.expertise, companies: d.expertise.companies.map((c, k) => (k === i ? { ...c, ...patch } : c)) } }));
  return (
    <Group title="MY EXPERTISE — STATEMENT + COMPANY DOSSIERS">
      <Field label="STATEMENT" value={ex.statement} onChange={(v) => update((d) => ({ ...d, expertise: { ...d.expertise, statement: v } }))} />
      <Field label="STATEMENT ACCENT (CRIMSON)" value={ex.statementAccent} onChange={(v) => update((d) => ({ ...d, expertise: { ...d.expertise, statementAccent: v } }))} />
      <Field label="SUPPORTING" value={ex.supporting} onChange={(v) => update((d) => ({ ...d, expertise: { ...d.expertise, supporting: v } }))} />
      {ex.companies.map((c, i) => (
        <div key={c.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3.5">
          <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--crimson)]">{c.num} — {c.name}</span>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="ROLE" value={c.role} onChange={(v) => setCo(i, { role: v })} />
            <Field label="DATE" value={c.date} onChange={(v) => setCo(i, { date: v })} />
          </div>
          <Field label="DESCRIPTION" textarea value={c.description} onChange={(v) => setCo(i, { description: v })} />
          <Field label="DOMAIN" value={c.domain} onChange={(v) => setCo(i, { domain: v })} />
          <Field label="SKILLS ( / SEPARATED)" value={c.skills.join(" / ")} onChange={(v) => setCo(i, { skills: v.split("/").map((s) => s.trim()).filter(Boolean) })} />
          <Field label="TOOLS ( / SEPARATED)" value={c.tools.join(" / ")} onChange={(v) => setCo(i, { tools: v.split("/").map((s) => s.trim()).filter(Boolean) })} />
          <MediaManager label={`MEDIA — ${c.media.length} SLOTS · 1:1`} items={c.media} ratio="1/1" onChange={(m) => setCo(i, { media: m })} />
        </div>
      ))}
    </Group>
  );
}

function CoreEditor() {
  const { data, update } = useStore();
  const set = (i: number, patch: Partial<typeof data.core[number]>) =>
    update((d) => ({ ...d, core: d.core.map((c, k) => (k === i ? { ...c, ...patch } : c)) }));
  return (
    <Group title="CORE — 9 DISCIPLINES">
      {data.core.map((c, i) => (
        <div key={c.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3">
          <span className="f-mono text-[9px] tracking-[0.28em] text-[var(--crimson)]">{c.num} — {c.name}</span>
          <Field label="NAME" value={c.name} onChange={(v) => set(i, { name: v })} />
          <Field label="DESCRIPTION" textarea value={c.blurb} onChange={(v) => set(i, { blurb: v })} />
          <Field label="TAGS ( / SEPARATED)" value={c.tags.join(" / ")} onChange={(v) => set(i, { tags: v.split("/").map((s) => s.trim()).filter(Boolean) })} />
        </div>
      ))}
    </Group>
  );
}

function ShowReelEditor() {
  const { data, update } = useStore();
  const sr = data.showReel;
  return (
    <Group title="MY WORK — 5 PORTRAITS + 6 LANDSCAPES">
      <MediaManager label="PORTRAITS — 9:16 · REORDER ENABLED" items={sr.portraits} ratio="9/16"
        onChange={(m) => update((d) => ({ ...d, showReel: { ...d.showReel, portraits: m } }))} />
      <MediaManager label="LANDSCAPES — 16:9 · REORDER ENABLED" items={sr.landscapes} ratio="16/9"
        onChange={(m) => update((d) => ({ ...d, showReel: { ...d.showReel, landscapes: m } }))} />
    </Group>
  );
}

function AILabEditor() {
  const { data, update } = useStore();
  const lab = data.aiLab;
  const set = (patch: Partial<typeof lab>) => update((d) => ({ ...d, aiLab: { ...d.aiLab, ...patch } }));
  return (
    <Group title="AI LAB — GHOST.EXE">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="PROJECT NAME" value={lab.projectName} onChange={(v) => set({ projectName: v })} />
        <Field label="TYPE" value={lab.projectType} onChange={(v) => set({ projectType: v })} />
      </div>
      <Field label="DESCRIPTION" textarea value={lab.projectDescription} onChange={(v) => set({ projectDescription: v })} />
      <Field label="TOOLS ( / SEPARATED)" value={lab.tools.join(" / ")} onChange={(v) => set({ tools: v.split("/").map((s) => s.trim()).filter(Boolean) })} />
      <MediaManager label="FEATURED VIDEO — 16:9" items={[lab.video]} ratio="16/9" onChange={(m) => m[0] && set({ video: m[0] })} />
      <MediaManager label="STILL SLOTS — 8 × 16:9 · GENERIC" items={lab.images} ratio="16/9" onChange={(m) => set({ images: m })} />
    </Group>
  );
}

function ArcEditor() {
  const { data, update } = useStore();
  const { characters, worlds } = data.arc;
  const setChars = (cs: ArcEntry[]) => update((d) => ({ ...d, arc: { ...d.arc, characters: cs } }));
  const setWorlds = (ws: ArcEntry[]) => update((d) => ({ ...d, arc: { ...d.arc, worlds: ws } }));
  const entryBlock = (kind: "CHARACTER" | "WORLD", e: ArcEntry, i: number) => {
    const list = kind === "CHARACTER" ? characters : worlds;
    const setList = kind === "CHARACTER" ? setChars : setWorlds;
    const patch = (p: Partial<ArcEntry>) => setList(list.map((x, k) => (k === i ? { ...x, ...p } : x)));
    return (
      <div key={e.id} className="border border-[var(--line)] rounded-lg p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input className="ed-field !py-1.5 flex-1" value={e.name} onChange={(ev) => patch({ name: ev.target.value })} />
          <button onClick={() => setList(list.filter((_, k) => k !== i))}
            className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg text-[var(--crimson)] border border-[var(--line)] hover:border-[var(--crimson)]">DELETE</button>
        </div>
        <Field label="TOOLS USED" value={e.tools} onChange={(v) => patch({ tools: v })} />
        <Field label={`${kind} DESCRIPTION`} textarea value={e.description} onChange={(v) => patch({ description: v })} />
        <MediaManager label={kind === "CHARACTER" ? "PORTRAIT — 9:16" : "LANDSCAPE — 16:9"} items={[e.image]}
          ratio={kind === "CHARACTER" ? "9/16" : "16/9"} onChange={(m) => m[0] && patch({ image: m[0] })} />
      </div>
    );
  };
  const add = (kind: "CHARACTER" | "WORLD") => {
    const fresh = (n: number): ArcEntry => ({
      id: nextId(), name: `${kind} SLOT ${String(n).padStart(2, "0")}`,
      image: { id: nextId(), kind: "image", label: kind === "CHARACTER" ? "PORTRAIT" : "LANDSCAPE", src: null, emptyLines: ["ADD IMAGE", kind === "CHARACTER" ? "9 : 16" : "16 : 9"] },
      tools: "", description: "",
    });
    if (kind === "CHARACTER") setChars([...characters, fresh(characters.length + 1)]);
    else setWorlds([...worlds, fresh(worlds.length + 1)]);
  };
  return (
    <Group title="ARC — CHARACTERS & WORLDS">
      <div className="flex items-center justify-between">
        <span className="f-mono text-[10px] tracking-[0.24em]">AI CHARACTER SHEET</span>
        <button onClick={() => add("CHARACTER")}
          className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]">+ ADD CHARACTER SLOT</button>
      </div>
      {characters.map((c, i) => entryBlock("CHARACTER", c, i))}
      <div className="flex items-center justify-between mt-2">
        <span className="f-mono text-[10px] tracking-[0.24em]">AI WORLD BUILDING</span>
        <button onClick={() => add("WORLD")}
          className="f-tech font-bold text-[9px] tracking-[0.16em] px-2.5 py-1.5 rounded-lg border border-dashed border-[var(--line)] hover:border-[var(--crimson)] hover:text-[var(--crimson)]">+ ADD WORLD SLOT</button>
      </div>
      {worlds.map((w, i) => entryBlock("WORLD", w, i))}
    </Group>
  );
}

function BuildEditor() {
  const { data, update } = useStore();
  const b = data.build;
  const set = (patch: Partial<typeof b>) => update((d) => ({ ...d, build: { ...d.build, ...patch } }));
  return (
    <Group title="THE PIPELINE — PHASES & REVEAL">
      <Field label="SUPPORTING LINE" textarea value={b.support} onChange={(v) => set({ support: v })} />
      <Field label="VISIBLE-NODE NOTE" textarea value={b.visibleNote} onChange={(v) => set({ visibleNote: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="KNOW MORE LABEL" value={b.knowMore} onChange={(v) => set({ knowMore: v })} />
        <Field label="NEXT LABEL" value={b.nextLabel} onChange={(v) => set({ nextLabel: v })} />
      </div>
      <Field label="SPEECH BUBBLE" textarea value={b.bubble} onChange={(v) => set({ bubble: v })} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="REVEAL HEADING" value={b.reveal.heading} onChange={(v) => set({ reveal: { ...b.reveal, heading: v } })} />
        <Field label="HEADING ACCENT (CRIMSON)" value={b.reveal.headingAccent} onChange={(v) => set({ reveal: { ...b.reveal, headingAccent: v } })} />
      </div>
      <Field label="NARRATOR" textarea value={b.reveal.narrator} onChange={(v) => set({ reveal: { ...b.reveal, narrator: v } })} />
      <MediaManager label="REVEAL FRAME — 1:1 SQUARE" items={[b.reveal.image]} ratio="1/1" onChange={(m) => m[0] && set({ reveal: { ...b.reveal, image: m[0] } })} />
    </Group>
  );
}

function ContactEditor() {
  const { data, update } = useStore();
  const c = data.contact;
  const set = (patch: Partial<typeof c>) => update((d) => ({ ...d, contact: { ...d.contact, ...patch } }));
  return (
    <Group title="CONTACT — FINAL TRANSMISSION">
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="IDENTITY A" value={c.identityA} onChange={(v) => set({ identityA: v })} />
        <Field label="IDENTITY B (CRIMSON)" value={c.identityB} onChange={(v) => set({ identityB: v })} />
        <Field label="CLOSING A" value={c.closingA} onChange={(v) => set({ closingA: v })} />
        <Field label="CLOSING B (CRIMSON)" value={c.closingB} onChange={(v) => set({ closingB: v })} />
        <Field label="EMAIL" value={c.email} onChange={(v) => set({ email: v })} />
        <Field label="RESUME URL / FILE" value={c.resumeUrl} onChange={(v) => set({ resumeUrl: v })} />
      </div>
      <Field label="STATEMENT" textarea value={c.statement} onChange={(v) => set({ statement: v })} />
      <Field label="MESSAGE" textarea value={c.message} onChange={(v) => set({ message: v })} />
      <Field label="SOCIALS — LABEL=URL PER LINE" textarea
        value={c.socials.map((s) => `${s.label}=${s.url}`).join("\n")}
        onChange={(v) => set({
          socials: v.split("\n").map((l) => {
            const [label, ...u] = l.split("=");
            return { label: label.trim().toUpperCase(), url: u.join("=").trim() };
          }).filter((s) => s.label),
        })} />
      <MediaManager label="PORTRAIT — 1:1 SQUARE" items={[c.portrait]} ratio="1/1" onChange={(m) => m[0] && set({ portrait: m[0] })} />
    </Group>
  );
}

/* ============ editor shell ============ */
const SECTIONS = [
  { id: "hero", num: "00", label: "HERO", el: <HeroEditor /> },
  { id: "expertise", num: "01", label: "MY EXPERTISE", el: <ExpertiseEditor /> },
  { id: "core", num: "02", label: "CORE", el: <CoreEditor /> },
  { id: "showreel", num: "03", label: "MY WORK", el: <ShowReelEditor /> },
  { id: "ailab", num: "04", label: "AI LAB", el: <AILabEditor /> },
  { id: "arc", num: "05", label: "ARC", el: <ArcEditor /> },
  { id: "build", num: "06", label: "THE PIPELINE", el: <BuildEditor /> },
  { id: "contact", num: "08", label: "CONTACT", el: <ContactEditor /> },
];

export default function Editor() {
  const [, nav] = useHashRoute();
  const { data, resetAll, theme, toggleTheme } = useStore();
  const [sel, setSel] = useState("hero");
  const current = SECTIONS.find((s) => s.id === sel) ?? SECTIONS[0];

  return (
    <div className="min-h-screen" style={{ background: "var(--page)", color: "var(--ink)" }}>
      {/* top bar */}
      <div className="sticky top-0 z-40 mat-outer mat-texture hdr-shell">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-[60px] flex items-center gap-5">
          <span className="f-automata text-[15px] tracking-[0.12em]" style={{ color: "var(--outer-ink)" }}>CBK<span className="text-[var(--crimson)]">·</span>CMS</span>
          <span className="f-mono text-[9px] tracking-[0.3em] hidden sm:block" style={{ color: "var(--m-sub)" }}>PRODUCTION CONSOLE</span>
          <span className="flex-1" />
          <button onClick={toggleTheme} className="f-tech font-bold text-[10px] tracking-[0.2em] px-3 py-2 rounded-lg border"
            style={{ borderColor: "var(--m-line)", color: "var(--outer-ink)" }}>
            {theme === "dark" ? "LIGHT" : "DARK"}
          </button>
          <button onClick={() => { if (window.confirm("Reset all content to defaults?")) resetAll(); }}
            className="f-tech font-bold text-[10px] tracking-[0.2em] px-3 py-2 rounded-lg border"
            style={{ borderColor: "var(--m-line)", color: "var(--m-sub)" }}>
            RESET
          </button>
          <button onClick={() => nav("#/")} className="btn btn-crimson !py-2 !px-4 text-[10px]">VIEW SITE ↗</button>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 grid lg:grid-cols-[220px_minmax(0,1fr)_300px] gap-6 items-start">
        {/* left nav */}
        <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible lg:sticky lg:top-[76px]">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => setSel(s.id)}
              className={`shrink-0 lg:shrink text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                sel === s.id ? "" : "hover:translate-x-0.5"
              }`}
              style={sel === s.id
                ? { background: "var(--crimson)", color: "#DDDDD8" }
                : { border: "1px solid var(--line)", color: "var(--ink2)" }}>
              <span className="f-mono text-[9px] tracking-[0.2em] opacity-75">{s.num}</span>
              <span className="f-tech font-bold text-[11px] tracking-[0.18em] whitespace-nowrap">{s.label}</span>
            </button>
          ))}
        </nav>

        {/* center workspace */}
        <main className="min-w-0 flex flex-col gap-5">
          <Reveal key={current.id}>
            <div className="flex items-center gap-3 mb-1">
              <span className="w-2.5 h-7 bg-[var(--crimson)]" />
              <h2 className="f-display text-[clamp(1.4rem,2.6vw,2rem)] tracking-wide">{current.label}</h2>
            </div>
            {current.el}
          </Reveal>
        </main>

        {/* right — live preview snapshot */}
        <aside className="hidden lg:block sticky top-[76px] border border-[var(--line)] rounded-xl p-4 bg-[var(--sup1)]">
          <span className="f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">LIVE DATA — WRITES INSTANTLY</span>
          <div className="mt-4 flex flex-col gap-3 f-mono text-[9.5px] tracking-[0.12em] leading-relaxed text-[var(--ink)]">
            <span>HERO — {data.hero.nameA} {data.hero.nameB}</span>
            <span>GREETING — {data.hero.greetings.EVENING}</span>
            <span>CHAPTERS — {data.expertise.companies.map((c) => c.num).join(" · ")}</span>
            <span>DISCIPLINES — {data.core.length}</span>
            <span>PORTRAITS — {data.showReel.portraits.length} · LANDSCAPES — {data.showReel.landscapes.length}</span>
            <span>AI LAB — {data.aiLab.projectName}</span>
            <span>ARC — {data.arc.characters.length}C / {data.arc.worlds.length}W</span>
            <span>PIPELINE — {data.build.nodes.length} NODES</span>
            <span>CONTACT — {data.contact.email}</span>
            <span className="pt-2 border-t border-[var(--line)] text-[var(--ink2)]">MEDIA COUNT — {
              [
                ...data.hero.images, ...data.expertise.companies.flatMap((c) => c.media),
                ...data.showReel.portraits, ...data.showReel.landscapes,
                data.aiLab.video, ...data.aiLab.images,
                ...data.arc.characters.map((c) => c.image), ...data.arc.worlds.map((w) => w.image),
                data.build.reveal.image, data.contact.portrait,
              ].filter((m: MediaItem) => m.src).length
            } / {
              data.hero.images.length + data.expertise.companies.reduce((a, c) => a + c.media.length, 0) +
              data.showReel.portraits.length + data.showReel.landscapes.length + 1 + data.aiLab.images.length +
              data.arc.characters.length + data.arc.worlds.length + 2
            } LOADED</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
