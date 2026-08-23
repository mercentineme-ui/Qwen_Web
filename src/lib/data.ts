/* ============================================================
   CBK DESIGNFOLIO — STRUCTURED DATA (single source of truth)
   Public site + Editor read/write the same structures.
   Media slots ship EMPTY and are filled via the /edit CMS.
   ============================================================ */

export type MediaKind = "image" | "video" | "audio";

export interface MediaItem {
  id: string;
  kind: MediaKind;
  label: string;
  src: string | null;
  emptyLines: string[];
}

export interface HeroData {
  morningLabel: string;
  greeting: string;
  nameA: string;
  nameB: string;
  chips: string[];
  description: string;
  ctaPrimary: string;
  ctaSecondary: string;
  images: MediaItem[];
  rotationSeconds: number;
}

export interface Company {
  id: string;
  num: string;
  name: string;
  role: string;
  date: string;
  description: string;
  skills: string[];
  tools: string[];
  domain: string;
  media: MediaItem[];
}

export interface ExpertiseData {
  statement: string;
  statementAccent: string;
  supporting: string;
  companies: Company[];
}

export interface Discipline {
  id: string;
  num: string;
  name: string;
  icon: string;
  blurb: string;
  tags: string[];
}

export interface ShowReelData {
  portraits: MediaItem[];
  landscapes: MediaItem[];
}

export interface AILabData {
  subLabel: string;
  projectName: string;
  projectType: string;
  projectStatus: string;
  projectDescription: string;
  tools: string[];
  video: MediaItem;
  images: MediaItem[];
}

export interface Dossier {
  role: string;
  project: string;
  description: string;
  tools: string;
  idea: string;
  process: string;
}

export interface ArcCharacter {
  id: string;
  name: string;
  image: MediaItem;
  dossier: Dossier;
}

export interface ArcWorld {
  id: string;
  name: string;
  image: MediaItem;
  dossier: Dossier;
}

export interface ArcData {
  characters: ArcCharacter[];
  worlds: ArcWorld[];
}

export interface BuildStep {
  num: string;
  title: string;
  text: string;
}

export interface BuildData {
  steps: BuildStep[];
}

export interface ContactData {
  headingA: string;
  headingB: string;
  closing: string;
  emailLabel: string;
  email: string;
  resumeLabel: string;
  resumeUrl: string;
  portrait: MediaItem;
}

export interface PortfolioData {
  hero: HeroData;
  expertise: ExpertiseData;
  core: Discipline[];
  showReel: ShowReelData;
  aiLab: AILabData;
  arc: ArcData;
  build: BuildData;
  contact: ContactData;
}

let uid = 0;
export const nextId = () => `m${Date.now().toString(36)}${(uid++).toString(36)}`;

const slot = (label: string, kind: MediaKind = "image", emptyLines?: string[]): MediaItem => ({
  id: nextId(),
  kind,
  label,
  src: null,
  emptyLines: emptyLines ?? ["ADD IMAGE"],
});

const emptyDossier = (): Dossier => ({ role: "", project: "", description: "", tools: "", idea: "", process: "" });

export const defaultData: PortfolioData = {
  hero: {
    morningLabel: "MORNING",
    greeting: "A beautiful morning to you, welcome in.",
    nameA: "C. BALA",
    nameB: "KRISHNAN",
    chips: ["CREATIVE DIRECTION", "GENERATIVE AI", "VISUAL DEVELOPMENT", "CINEMATIC STORYTELLING"],
    description:
      "I walk into unfamiliar projects with minimal starting information — figure out the problem, build the visual language, and carry the work from first idea to final delivery.",
    ctaPrimary: "ENTER THE WORK →",
    ctaSecondary: "INDEX ↓",
    images: [
      slot("IMAGE 01", "image", ["ADD PORTRAIT", "IN STUDIO"]),
      slot("IMAGE 02", "image", ["ADD PORTRAIT", "IN STUDIO"]),
      slot("IMAGE 03", "image", ["ADD PORTRAIT", "IN STUDIO"]),
      slot("IMAGE 04", "image", ["ADD PORTRAIT", "IN STUDIO"]),
    ],
    rotationSeconds: 15,
  },

  expertise: {
    statement: "THE INDUSTRY IS EVOLVING —",
    statementAccent: "SO DO I!",
    supporting: "Each chapter took me closer to building what once felt impossible.",
    companies: [
      {
        id: "impromp2",
        num: "01",
        name: "IMPROMP2LABS",
        role: "AI CREATIVE DIRECTOR",
        date: "NOV 2025 — PRESENT · HYDERABAD · HYBRID",
        description:
          "Built an end-to-end AI filmmaking pipeline from scratch — from concept and story through world-building, character locking, visual consistency, shot generation, sequence continuity, editing and final delivery.",
        skills: ["AI CONCEPT ART", "VISUAL R&D", "LOOKDEV", "PIPELINE INTEGRATION"],
        tools: ["HIGGSFIELD", "DZINE", "CLAUDE", "QWEN"],
        domain: "",
        media: [slot("IMAGE 01"), slot("IMAGE 02"), slot("IMAGE 03")],
      },
      {
        id: "dneg",
        num: "02",
        name: "DNEG",
        role: "GEN AI ARTIST",
        date: "JAN 2026 — APR 2026 · REMOTE",
        description:
          "Joined DNEG's core GenAI team during the early integration of Generative AI into world-class feature film [ RAMAYANA ], developing workflows for face swap, lip sync, persona transfer, digital humans, identity preservation and AI-generated synthetic media for VFX post-production.",
        skills: ["VFX", "GENERATIVE AI", "DIGITAL HUMANS", "SYNTHETIC MEDIA"],
        tools: ["COMFYUI", "METAFACE", "DGX", "NUKE"],
        domain: "RAMAYANA / DUNE 3",
        media: [slot("IMAGE 01"), slot("IMAGE 02"), slot("IMAGE 03")],
      },
      {
        id: "cyberedge",
        num: "03",
        name: "CYBEREDGE",
        role: "AI DESIGN ENGINEER · UX DESIGNER",
        date: "NOV 2024 — NOV 2025 · HYDERABAD · HYBRID",
        description:
          "Bridged design and emerging AI technologies, turning creative concepts into faster, more iterative and scalable visual workflows across design, UX and AI-assisted production.",
        skills: ["AI DESIGN", "UX DESIGN", "PROMPT ENGINEERING"],
        tools: ["MIDJOURNEY", "SORA", "FIGMA", "CAPCUT"],
        domain: "",
        media: [slot("IMAGE 01"), slot("IMAGE 02")],
      },
      {
        id: "premasai",
        num: "04",
        name: "PREMA SAI DESIGNERS",
        role: "GRAPHIC DESIGNER · PROMPT ENGINEER",
        date: "AUG 2018 — OCT 2024 · HYDERABAD · ONSITE",
        description:
          "Built a strong foundation in graphic design, branding and advertising, evolving from traditional visual communication into AI-assisted ideation and prompt-driven creative production.",
        skills: ["GRAPHIC DESIGN", "BRANDING", "ADVERTISING"],
        tools: ["PHOTOSHOP", "ILLUSTRATOR", "CANVA", "AI TOOLS"],
        domain: "",
        media: [slot("IMAGE 01")],
      },
    ],
  },

  core: [
    { id: "d1", num: "01", name: "CREATIVE DIRECTION", icon: "direction", blurb: "Setting the visual north star — taste, tone and intent that keep every frame accountable.", tags: ["VISION", "TONE", "DECISION"] },
    { id: "d2", num: "02", name: "GENERATIVE AI", icon: "generative", blurb: "Image and video models pushed past defaults into controlled, repeatable visual output.", tags: ["MODELS", "CONTROL", "OUTPUT"] },
    { id: "d3", num: "03", name: "VISUAL DEVELOPMENT", icon: "visualdev", blurb: "Keyframes, palettes and style frames that define the look before a single shot is made.", tags: ["KEYFRAMES", "PALETTE", "STYLE"] },
    { id: "d4", num: "04", name: "CINEMATIC STORYTELLING", icon: "cinematic", blurb: "Camera language, pacing, sequence design and visual storytelling built for cinematic continuity.", tags: ["CONCEPT", "STYLE FRAMES", "COLOR & LIGHT"] },
    { id: "d5", num: "05", name: "AI IMAGE + VIDEO", icon: "aivideo", blurb: "Still and moving generation directed like live footage — framed, lit and graded.", tags: ["STILLS", "MOTION", "GRADE"] },
    { id: "d6", num: "06", name: "CHARACTER DEVELOPMENT", icon: "character", blurb: "Identity locking, persona sheets and performance consistency across full sequences.", tags: ["IDENTITY", "SHEETS", "CONSISTENCY"] },
    { id: "d7", num: "07", name: "ENVIRONMENT DESIGN", icon: "environment", blurb: "Worlds built from reference, mood and logic — places that can hold a camera.", tags: ["WORLDS", "MOOD", "LOGIC"] },
    { id: "d8", num: "08", name: "AI CREATIVE WORKFLOWS", icon: "workflows", blurb: "Pipelines that turn raw generation into a reliable, repeatable production line.", tags: ["PIPELINE", "ITERATION", "SCALE"] },
    { id: "d9", num: "09", name: "PROMPT ARCHITECTURE", icon: "prompt", blurb: "Structured language systems that make models behave like a trained crew.", tags: ["SYSTEMS", "SYNTAX", "CONTROL"] },
  ],

  showReel: {
    portraits: [
      slot("PORTRAIT 01"), slot("PORTRAIT 02"), slot("PORTRAIT 03"),
      slot("PORTRAIT 04"), slot("PORTRAIT 05"),
    ],
    landscapes: [
      slot("LANDSCAPE 01"), slot("LANDSCAPE 02"), slot("LANDSCAPE 03"),
      slot("LANDSCAPE 04"), slot("LANDSCAPE 05"), slot("LANDSCAPE 06"),
    ],
  },

  aiLab: {
    subLabel: "RECENT PROJECT",
    projectName: "GHOST.EXE",
    projectType: "TRAIL PROJECT",
    projectStatus: "FEATURED",
    projectDescription:
      "A signal-hunting trail film built end-to-end with generative tools — an abandoned broadcast, a presence inside the static, and the crew that follows it in. Concept, world, character and sequence all generated, directed and cut in-house.",
    tools: ["HIGGSFIELD", "COMFYUI", "CLAUDE", "DZINE", "CAPCUT"],
    video: slot("FEATURED VIDEO", "video", ["ADD VIDEO"]),
    images: [
      slot("STILL 01"), slot("STILL 02"), slot("STILL 03"), slot("STILL 04"),
      slot("STILL 05"), slot("STILL 06"), slot("STILL 07"), slot("STILL 08"),
    ],
  },

  arc: {
    characters: [
      { id: "c1", name: "CHARACTER SLOT 01", image: slot("PORTRAIT 01", "image", ["ADD IMAGE", "9 : 16"]), dossier: emptyDossier() },
      { id: "c2", name: "CHARACTER SLOT 02", image: slot("PORTRAIT 02", "image", ["ADD IMAGE", "9 : 16"]), dossier: emptyDossier() },
      { id: "c3", name: "CHARACTER SLOT 03", image: slot("PORTRAIT 03", "image", ["ADD IMAGE", "9 : 16"]), dossier: emptyDossier() },
      { id: "c4", name: "CHARACTER SLOT 04", image: slot("PORTRAIT 04", "image", ["ADD IMAGE", "9 : 16"]), dossier: emptyDossier() },
    ],
    worlds: [
      { id: "w1", name: "WORLD SLOT 01", image: slot("LANDSCAPE 01", "image", ["ADD IMAGE", "16 : 9"]), dossier: emptyDossier() },
      { id: "w2", name: "WORLD SLOT 02", image: slot("LANDSCAPE 02", "image", ["ADD IMAGE", "16 : 9"]), dossier: emptyDossier() },
      { id: "w3", name: "WORLD SLOT 03", image: slot("LANDSCAPE 03", "image", ["ADD IMAGE", "16 : 9"]), dossier: emptyDossier() },
      { id: "w4", name: "WORLD SLOT 04", image: slot("LANDSCAPE 04", "image", ["ADD IMAGE", "16 : 9"]), dossier: emptyDossier() },
    ],
  },

  build: {
    steps: [
      { num: "01", title: "DECODE", text: "Walk in with almost nothing. Extract the real problem, the audience and the constraints before a single visual is made." },
      { num: "02", title: "LANGUAGE", text: "Build the visual language — reference, palette, typography and motion rules that every asset must obey." },
      { num: "03", title: "SYSTEMS", text: "Turn the language into a pipeline: prompts, tools and checkpoints so quality survives scale and deadlines." },
      { num: "04", title: "CINEMA", text: "Direct the output like footage — camera, pacing, light and continuity until sequences hold together." },
      { num: "05", title: "DELIVERY", text: "Carry it to final delivery: versioning, handoff, and the last five percent that separates shipped from almost." },
    ],
  },

  contact: {
    headingA: "I'M",
    headingB: "THE ONE!",
    closing: "LET'S BUILD SOMETHING.",
    emailLabel: "EMAIL ME",
    email: "bala@cbk.studio",
    resumeLabel: "DOWNLOAD MY RESUME",
    resumeUrl: "",
    portrait: slot("PORTRAIT", "image", ["ADD PORTRAIT", "9 : 16"]),
  },
};
