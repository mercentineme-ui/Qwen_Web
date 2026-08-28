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

export type Daypart = "MORNING" | "AFTERNOON" | "EVENING";

export interface HeroData {
  greetings: Record<Daypart, string>;
  nameA: string;
  nameB: string;
  aboutLabel: string;
  chips: string[];
  description: string;
  educationLabel: string;
  education: { num: string; title: string; school: string; year: string }[];
  ctaPrimary: string;
  ctaSecondary: string;
  images: MediaItem[];
  rotationSeconds: number;
}

export interface Company {
  id: string;
  num: string;
  name: string;
  short: string;
  role: string;
  date: string;
  description: string;
  skills: string[];
  tools: string[];
  domain: string;
  media: MediaItem[];
  /* extended dossier fields for the archival rail (all optional — back-compatible) */
  expandedName?: string;
  location?: string;
  summary?: string;
  highlightsLabel?: string;
  highlights?: string[];
  extrasLabel?: string;
  extras?: string[];
  discipline?: string;
  disciplineNote?: string;
}

export interface ExpertiseData {
  statement: string;
  statementAccent: string;
  supporting: string;
  companies: Company[];
}

export interface Stat { num: string; value: number; suffix: string; label: string }
export interface ByNumbersData {
  artistRole: string;
  upcomingLabel: string;
  upcoming: string[];
  stats: Stat[];
}

export interface Discipline {
  id: string;
  num: string;
  name: string;
  icon: string;
  blurb: string;
  tags: string[];
}

export interface ShowReelData { portraits: MediaItem[]; landscapes: MediaItem[] }

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

export interface ArcEntry { id: string; name: string; image: MediaItem; tools: string; description: string }
export interface ArcData { characters: ArcEntry[]; worlds: ArcEntry[] }

export interface BuildData {
  support: string;
  visibleNote: string;
  nodes: { num: string; title: string }[];
  knowMore: string;
  bubble: string;
  reveal: { image: MediaItem; heading: string; headingAccent: string; narrator: string };
}

export interface ContactData {
  heading: string;
  metaTag: string;
  identityA: string;
  identityB: string;
  statement: string;
  message: string;
  signature: string;
  closingA: string;
  closingB: string;
  emailLabel: string;
  email: string;
  resumeLabel: string;
  resumeUrl: string;
  socials: { label: string; url: string }[];
  portrait: MediaItem;
}

export interface PortfolioData {
  hero: HeroData;
  byNumbers: ByNumbersData;
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

const GREETING = "A Beautiful {DAYPART} to you, welcome in.";

export const defaultData: PortfolioData = {
  hero: {
    greetings: { MORNING: GREETING, AFTERNOON: GREETING, EVENING: GREETING },
    nameA: "C.BALA",
    nameB: "KRISHNAN",
    aboutLabel: "ABOUT ME:",
    chips: ["CREATIVE DIRECTOR", "GEN AI ARTIST", "VISUAL DESIGNER", "AI PIPELINE ARCHITECT"],
    description:
      "I walk into unfamiliar projects with minimal starting information — figure out the problem, build the visual language, and carry the work from first idea to final delivery.",
    educationLabel: "EDUCATION",
    education: [
      { num: "01", title: "B.Tech in CSE / Information Technology", school: "Vignan’s Institute of Technology & Science", year: "2024" },
      { num: "02", title: "Diploma in Mechanical", school: "Anurag College of Engineering", year: "2020" },
    ],
    ctaPrimary: "CREATIVES →",
    ctaSecondary: "EXPERIENCE ↓",
    images: [
      slot("IMAGE 01", "image", ["ADD PORTRAIT", "IN STUDIO"]),
      slot("IMAGE 02", "image", ["ADD PORTRAIT", "IN STUDIO"]),
      slot("IMAGE 03", "image", ["ADD PORTRAIT", "IN STUDIO"]),
      slot("IMAGE 04", "image", ["ADD PORTRAIT", "IN STUDIO"]),
    ],
    rotationSeconds: 15,
  },

  byNumbers: {
    artistRole: "AI ARTIST",
    upcomingLabel: "UPCOMING WORKS",
    upcoming: ["RAMAYANA", "VEERABHADRA"],
    stats: [
      { num: "01", value: 1000, suffix: "+", label: "POSTS" },
      { num: "02", value: 750, suffix: "+", label: "CONTENT" },
      { num: "03", value: 450, suffix: "+", label: "AI CREATIVES" },
      { num: "04", value: 250, suffix: "+", label: "CAMPAIGNS" },
    ],
  },

  expertise: {
    statement: "THE INDUSTRY IS EVOLVING —",
    statementAccent: "SO DO I!",
    supporting: "Each chapter took me closer to building what once felt impossible.",
    companies: [
      {
        id: "impromp2", num: "01", name: "IMPROMP2LABS", short: "IMPROMP2LABS",
        role: "AI CREATIVE DIRECTOR / CO-FOUNDER",
        date: "NOV 2025 — PRESENT",
        location: "HYDERABAD · HYBRID",
        summary:
          "Built and led AI-first creative production across film, entertainment and visual-content projects — from concept development and visual generation to workflow architecture, continuity, production and final delivery.",
        highlightsLabel: "TRACK RECORD",
        highlights: [
          "Led AI production for an unreleased film project, delivering 450+ images and 20+ video outputs across four months.",
          "Built 7 production AI workflows and 15+ total workflows, including 5 built from scratch and 7 adapted for production.",
          "Reduced AI concept-generation time from approximately 4 hours to 1.5 hours — a 62.5% reduction through structured generation and review.",
          "Cut prompt testing and iteration from approximately 100 minutes to 60 minutes — a 40% improvement through batch generation and systematic evaluation.",
          "Trained 10+ artists, reviewed outputs for 25+ people, established workflow standards for 25+ users, and prompt standards used across 80+ people.",
        ],
        tools: ["HIGGSFIELD", "DZINE", "CLAUDE", "QWEN"],
        description:
          "Built and led AI-first creative production across film, entertainment and visual-content projects — from concept development and visual generation to workflow architecture, continuity, production and final delivery.",
        skills: ["CREATIVE DIRECTION", "GENERATIVE AI", "VISUAL DEVELOPMENT", "AI CREATIVE WORKFLOWS"],
        domain: "",
        media: [slot("IMAGE 01")],
      },
      {
        id: "dneg", num: "02", name: "DNEG", short: "DNEG",
        expandedName: "DNEG (DOUBLE NEGATIVE)",
        role: "GENERATIVE AI ARTIST",
        date: "JAN 2026 — APR 2026",
        location: "REMOTE",
        summary:
          "Contributed to production AI and R&D for cinematic workflows, working across identity preservation, performance transfer, face recreation, synthetic media and AI-assisted VFX within a collaborative production environment.",
        highlightsLabel: "TRACK RECORD",
        highlights: [
          "Worked across 5 identities and 10 faces for high-fidelity identity and performance-transfer workflows.",
          "Supported AI recreation of human faces through 23+ face-ingest operations across training and production workflows.",
          "Generated ample amount of images for production and R&D workflows while testing and adapting AI systems for cinematic use.",
          "Contributed to production AI and R&D across identity preservation, performance transfer, digital-human recreation and synthetic-media workflows.",
          "Collaborated across AI, VFX, production, compositing and model-art teams, adapting generative workflows for real production requirements.",
        ],
        tools: ["COMFYUI", "METAFACE", "DGX", "NUKE"],
        description:
          "Contributed to production AI and R&D for cinematic workflows, working across identity preservation, performance transfer, face recreation, synthetic media and AI-assisted VFX within a collaborative production environment.",
        skills: ["GENERATIVE AI", "VISUAL DEVELOPMENT", "AI MEDIA", "CHARACTER DEVELOPMENT"],
        domain: "RAMAYANA",
        media: [slot("IMAGE 01")],
      },
      {
        id: "cyberedge", num: "03", name: "CYBEREDGE", short: "CYBEREDGE",
        role: "GRAPHIC DESIGNER / UX DESIGNER",
        date: "NOV 2024 — NOV 2025",
        location: "HYDERABAD · HYBRID",
        summary:
          "Produced high-volume visual and digital content across diverse brands, combining AI-assisted design, UX thinking, prompt engineering, short-form content and campaign strategy to deliver scalable creative output.",
        highlightsLabel: "TRACK RECORD",
        highlights: [
          "Created 1,000+ social media posts, 750+ reels/videos and 450+ AI-driven creatives across 250+ digital-marketing campaigns.",
          "Worked across 80+ clients spanning fashion, hospitality, food, events, retail, beauty, fitness, sports, healthcare, real estate and entertainment.",
          "Developed content strategies by analyzing client positioning and engagement performance, translating insights into creative and content solutions.",
          "Presented creative work to 80+ clients, handled revisions for 50+ clients and directly developed content strategy for 35+ client accounts.",
          "Combined AI-assisted design, UX thinking, prompt engineering and multi-format content production to deliver creative work at scale.",
        ],
        tools: ["MIDJOURNEY", "SORA", "FIGMA", "CAPCUT"],
        description:
          "Produced high-volume visual and digital content across diverse brands, combining AI-assisted design, UX thinking, prompt engineering, short-form content and campaign strategy to deliver scalable creative output.",
        skills: ["CREATIVE DIRECTION", "GENERATIVE AI", "AI MEDIA", "PROMPT ARCHITECTURE"],
        domain: "",
        media: [slot("IMAGE 01")],
      },
      {
        id: "premasai", num: "04", name: "PREMA SAI DESIGNERS", short: "PSD",
        expandedName: "PREMA SAI DESIGNERS (PSD)",
        role: "DESIGNER",
        discipline: "BRAND IDENTITY",
        disciplineNote: "BRAND IDENTITY FOR JEWELLERY-STORE BUSINESSES",
        date: "AUG 2018 — OCT 2024",
        location: "HYDERABAD · INDIA",
        summary:
          "Built a long-term foundation in high-volume visual communication, branding and advertising design, producing marketing and identity assets for jewellery businesses while maintaining consistent visual presentation across client work.",
        highlightsLabel: "TRACK RECORD",
        highlights: [
          "Produced 24K+ design assets for jewellery businesses across more than six years of continuous production.",
          "Created logos, visiting cards and marketing materials for approximately 120 jewellery-store clients.",
          "Delivered approximately 50 logos, 120 visiting-card designs and 60+ additional design deliverables.",
          "Developed visual identities and advertising collateral while maintaining consistent brand presentation across different businesses.",
          "Built a strong production-focused design foundation spanning graphic design, branding, advertising and high-volume visual delivery.",
        ],
        tools: ["PHOTOSHOP", "ILLUSTRATOR", "CANVA"],
        description:
          "Built a long-term foundation in high-volume visual communication, branding and advertising design, producing marketing and identity assets for jewellery businesses while maintaining consistent visual presentation across client work.",
        skills: ["CREATIVE DIRECTION", "VISUAL DEVELOPMENT", "CHARACTER DEVELOPMENT", "ENVIRONMENT DESIGN"],
        domain: "",
        media: [slot("IMAGE 01")],
      },
    ],
  },

  core: [
    { id: "d1", num: "01", name: "CREATIVE DIRECTION", icon: "direction", blurb: "Deciding what the work is before deciding how it looks — taste, tone and intent translated into a north star the whole team can steer by. Every frame has to answer to the direction, not the other way around.", tags: ["VISION", "TONE", "DECISION"] },
    { id: "d2", num: "02", name: "GENERATIVE AI", icon: "generative", blurb: "Pushing image and video models past their defaults with structured control — seeds, checkpoints and custom pipelines tuned until output behaves like a trained crew instead of a slot machine.", tags: ["MODELS", "CONTROL", "PIPELINES"] },
    { id: "d3", num: "03", name: "VISUAL DEVELOPMENT", icon: "visualdev", blurb: "Keyframes, palettes and style frames that lock the look before production starts — the reference system every shot, character and environment must agree with.", tags: ["KEYFRAMES", "PALETTE", "STYLE FRAMES"] },
    { id: "d4", num: "04", name: "CINEMATIC STORYTELLING", icon: "cinematic", blurb: "Camera language, pacing, sequence design and visual storytelling built for cinematic continuity — beats that cut together, not just images that look good alone.", tags: ["CONCEPT", "STYLE FRAMES", "COLOR & LIGHT"] },
    { id: "d5", num: "05", name: "AI IMAGE + VIDEO", icon: "aivideo", blurb: "Directing stills and motion generation like live footage — framing, lighting, lens behaviour and grade applied after generation so the output survives contact with an edit.", tags: ["STILLS", "MOTION", "GRADE"] },
    { id: "d6", num: "06", name: "CHARACTER DEVELOPMENT", icon: "character", blurb: "Identity locking, persona sheets and performance consistency across full sequences — the same face, costume and attitude in every frame, from concept to final comp.", tags: ["IDENTITY", "SHEETS", "CONSISTENCY"] },
    { id: "d7", num: "07", name: "ENVIRONMENT DESIGN", icon: "environment", blurb: "Worlds built from reference, mood and physical logic — scale, weather and wear decided up front so environments can hold a camera move, not just a wallpaper frame.", tags: ["WORLDS", "MOOD", "LOGIC"] },
    { id: "d8", num: "08", name: "AI CREATIVE WORKFLOWS", icon: "workflows", blurb: "Pipelines that turn raw generation into repeatable production — versioning, checkpoints and review gates so quality survives deadlines, handoffs and scale.", tags: ["PIPELINE", "ITERATION", "SCALE"] },
    { id: "d9", num: "09", name: "PROMPT ARCHITECTURE", icon: "prompt", blurb: "Structured language systems — layered syntax, constraint blocks and style grammars — that make models behave predictably across hundreds of generations.", tags: ["SYSTEMS", "SYNTAX", "CONTROL"] },
  ],

  showReel: {
    portraits: [slot("PORTRAIT 01"), slot("PORTRAIT 02"), slot("PORTRAIT 03"), slot("PORTRAIT 04"), slot("PORTRAIT 05")],
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
      slot("IMAGE SLOT 01"), slot("IMAGE SLOT 02"), slot("IMAGE SLOT 03"), slot("IMAGE SLOT 04"),
      slot("IMAGE SLOT 05"), slot("IMAGE SLOT 06"), slot("IMAGE SLOT 07"), slot("IMAGE SLOT 08"),
    ],
  },

  arc: {
    characters: [
      { id: "c1", name: "CHARACTER SLOT 01", image: slot("PORTRAIT 01", "image", ["ADD IMAGE", "9 : 16"]), tools: "", description: "" },
      { id: "c2", name: "CHARACTER SLOT 02", image: slot("PORTRAIT 02", "image", ["ADD IMAGE", "9 : 16"]), tools: "", description: "" },
      { id: "c3", name: "CHARACTER SLOT 03", image: slot("PORTRAIT 03", "image", ["ADD IMAGE", "9 : 16"]), tools: "", description: "" },
      { id: "c4", name: "CHARACTER SLOT 04", image: slot("PORTRAIT 04", "image", ["ADD IMAGE", "9 : 16"]), tools: "", description: "" },
    ],
    worlds: [
      { id: "w1", name: "WORLD SLOT 01", image: slot("LANDSCAPE 01", "image", ["ADD IMAGE", "16 : 9"]), tools: "", description: "" },
      { id: "w2", name: "WORLD SLOT 02", image: slot("LANDSCAPE 02", "image", ["ADD IMAGE", "16 : 9"]), tools: "", description: "" },
      { id: "w3", name: "WORLD SLOT 03", image: slot("LANDSCAPE 03", "image", ["ADD IMAGE", "16 : 9"]), tools: "", description: "" },
      { id: "w4", name: "WORLD SLOT 04", image: slot("LANDSCAPE 04", "image", ["ADD IMAGE", "16 : 9"]), tools: "", description: "" },
    ],
  },

  build: {
    support: "One mark, five moves — every project walks the same path, from blind briefing to final delivery.",
    visibleNote: "The visible part of the process — exactly four nodes. What happens between and beyond them stays where it belongs.",
    nodes: [
      { num: "01", title: "IDEA" },
      { num: "02", title: "REFERENCE" },
      { num: "03", title: "CONCEPT" },
      { num: "04", title: "DEVELOPMENT" },
    ],
    knowMore: "KNOW MORE",
    bubble: "Almost there… let's connect before this turns into a season finale cliffhanger",
    reveal: {
      image: slot("REVEAL FRAME", "image", ["ADD IMAGE", "SQUARE UPLOAD"]),
      heading: "AND A LOT MORE LAYERS",
      headingAccent: "TO GO.",
      narrator:
        "These 4 nodes are just basic process. Everything that makes the work hold and progress are discussed while working as there's no \"Template\" for direction, so the part you don't get to see is the part you get to feel.",
    },
  },

  contact: {
    heading: "CONTACT",
    metaTag: "FINAL TRANSMISSION",
    identityA: "I'M",
    identityB: "THE ONE!",
    statement:
      "Who turns ideas into worlds, images into sequences, and emerging AI tools into a creative production language.",
    message:
      "Hey!, I'm Bala Krishnan — I love the adventure of creativity. If you're coming along, I'm glad - Together. We'll get there.",
    signature: "— WRITTEN BY THE ONE WHO BUILDS THE WORLDS",
    closingA: "LET'S BUILD",
    closingB: "SOMETHING.",
    emailLabel: "EMAIL ME",
    email: "bala@cbk.studio",
    resumeLabel: "DOWNLOAD MY RESUME",
    resumeUrl: "",
    socials: [
      { label: "LINKEDIN", url: "https://www.linkedin.com/in/c-bala-krishnan" },
      { label: "WHATSAPP", url: "" },
      { label: "ARTSTATION", url: "" },
      { label: "INSTAGRAM", url: "" },
    ],
    portrait: slot("PORTRAIT", "image", ["ADD IMAGE", "1 : 1"]),
  },
};
