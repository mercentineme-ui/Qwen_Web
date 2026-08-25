import React, { useState } from "react";
import { useHashRoute, useLocalTime, useStore } from "../lib/store";
import { LinkedInIcon, MoonIcon, SunIcon } from "./icons";

const NAV = [
  { label: "ABOUT", href: "#about" },
  { label: "CREATIVES", href: "#showreel" },
  { label: "AI LAB", href: "#ailab" },
  { label: "ARC", href: "#arc" },
  { label: "CONTACT ME", href: "#contact" },
];

/* DESIGNFOLIO — continuous fluid identity animation:
   thin → bold → mixed-weight letters → color wave → micro glitch → hops → rest */
function FluidWord() {
  return (
    <span className="f-tech tracking-[0.3em] text-[11px] lg:text-[12.5px] leading-none whitespace-nowrap" aria-label="DESIGNFOLIO">
      {"DESIGNFOLIO".split("").map((ch, i) => (
        <span key={i} className="logo-letter" style={{ animationDelay: `${i * 0.16}s` }}>{ch}</span>
      ))}
    </span>
  );
}

export default function Header() {
  const { theme, toggleTheme } = useStore();
  const [, nav] = useHashRoute();
  const time = useLocalTime();
  const [open, setOpen] = useState(false);
  const hhmm = time.slice(0, 8);
  const mer = time.slice(9);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      {/* angular technical shell — clipped shoulders, structural bottom edge.
          backdrop blur kept at ~30% so depth remains but type stays readable */}
      <div className="hdr-shell relative"
        style={{ backgroundColor: "color-mix(in srgb, var(--page) 88%, transparent)", backdropFilter: "blur(3px)" }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-[48px] lg:h-[58px] flex items-center gap-4 lg:gap-6">
          {/* ---------- CBK | DESIGNFOLIO ---------- */}
          <a href="#about" className="flex items-center gap-3.5 lg:gap-4 shrink-0 group" aria-label="CBK Designfolio home">
            <span className="relative f-automata text-[19px] lg:text-[22px] leading-none tracking-[0.08em] text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--crimson)]">
              CBK
              <span className="absolute -bottom-[7px] left-0 h-[2.5px] w-full overflow-hidden" style={{ background: "var(--line)" }}>
                <span className="absolute inset-y-0 left-0 w-1/2 bg-[var(--crimson)] -translate-x-full transition-transform duration-500 group-hover:translate-x-[220%]" />
              </span>
              <span className="text-[var(--crimson)] group-hover:text-[var(--ink)] transition-colors duration-300">_</span>
            </span>
            <span className="hidden sm:flex flex-col gap-[5px]">
              <FluidWord />
              <span className="h-px w-full relative overflow-hidden" style={{ background: "var(--line)" }}>
                <span className="absolute inset-y-0 left-0 w-1/3 bg-[var(--crimson)] -translate-x-full transition-transform duration-700 group-hover:translate-x-[320%]" />
              </span>
            </span>
          </a>

          <span className="hidden lg:block w-px h-7" style={{ background: "var(--line)" }} aria-hidden />

          {/* ---------- EDIT ---------- */}
          <button onClick={() => nav("#/edit")}
            className="hidden lg:block f-betron text-[12px] tracking-[0.24em] px-3.5 py-2.5 rounded-lg border border-[var(--ink)] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300 shrink-0">
            EDIT
          </button>

          {/* ---------- navigation ---------- */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7 mx-auto">
            {NAV.map((n) => (
              <a key={n.label} href={n.href}
                className="f-tech font-bold text-[13px] xl:text-[14px] tracking-[0.18em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-0 after:bg-[var(--crimson)] hover:after:w-full after:transition-all after:duration-300">
                {n.label}
              </a>
            ))}
          </nav>

          {/* ---------- right utilities : TIME → THEME → LINKEDIN ---------- */}
          <div className="flex items-center gap-3 lg:gap-3.5 ml-auto lg:ml-0">
            <div className="hidden md:flex flex-col items-end leading-none mr-1">
              <span className="f-mono text-[8.5px] tracking-[0.32em] text-[var(--ink2)]">LOCAL TIME</span>
              <span className="mt-1.5 flex items-baseline gap-2">
                <span className="f-clock text-[18px] lg:text-[21px] tabular-nums tracking-[0.05em] clock-num">
                  {hhmm}
                </span>
                <span className={`f-tech font-bold text-[10.5px] lg:text-[11.5px] tracking-[0.2em] px-1.5 py-[3px] rounded-[6px] ${
                  mer === "PM"
                    ? "bg-[var(--crimson)] text-[#f4f2ed] border-[1.5px] border-[var(--crimson)]"
                    : "border-[1.5px] border-[var(--ink)] text-[var(--ink)]"
                }`}>
                  {mer}
                </span>
              </span>
            </div>

            <button onClick={toggleTheme} aria-label="Toggle theme"
              className={`w-[42px] h-[42px] lg:w-11 lg:h-11 grid place-items-center rounded-lg border transition-colors duration-500 ${
                theme === "light" ? "bg-[#222328] border-[#222328]" : "bg-[#DDDDD8] border-[#DDDDD8]"
              }`}>
              {theme === "light" ? <span className="moon-drift"><MoonIcon size={22} /></span> : <SunIcon size={22} />}
            </button>

            <a href="https://www.linkedin.com/in/c-bala-krishnan" target="_blank" rel="noreferrer" aria-label="LinkedIn"
              className="w-[42px] h-[42px] lg:w-11 lg:h-11 grid place-items-center rounded-lg border border-[var(--line)] text-[var(--ink)] hover:text-[#f4f2ed] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] transition-all duration-300">
              <LinkedInIcon size={17} />
            </a>

            <button onClick={() => setOpen(!open)} aria-label="Menu"
              className="lg:hidden w-10 h-10 grid place-items-center rounded-lg border border-[var(--line)]">
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
                {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h12" />}
              </svg>
            </button>
          </div>
        </div>

        {/* structural bottom edge — horizontal line + diagonal shoulder rises,
            faint graphite outline on light / faint crimson on dark */}
        <div className="h-[12px] relative" aria-hidden>
          <svg width="52" height="12" viewBox="0 0 52 12" fill="none" className="absolute left-0 bottom-0">
            <path d="M0 0.5 L51 11.5" stroke="var(--hdr-edge)" strokeWidth="1.5" />
            <path d="M44 10.8 h8" stroke="var(--crimson)" strokeWidth="2" />
          </svg>
          <div className="absolute inset-x-[52px] bottom-0 h-px" style={{ background: "var(--hdr-edge)" }} />
          <svg width="52" height="12" viewBox="0 0 52 12" fill="none" className="absolute right-0 bottom-0">
            <path d="M52 0.5 L1 11.5" stroke="var(--hdr-edge)" strokeWidth="1.5" />
            <path d="M0 10.8 h8" stroke="var(--crimson)" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* mobile sheet */}
      {open && (
        <div className="lg:hidden border-t border-[var(--line)] mat-page-card">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-5 flex flex-col gap-4">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setOpen(false)}
                className="f-tech font-bold text-[15px] tracking-[0.2em] text-[var(--ink)] hover:text-[var(--crimson)] transition-colors">
                {n.label}
              </a>
            ))}
            <button onClick={() => { setOpen(false); nav("#/edit"); }}
              className="f-betron text-[13px] tracking-[0.24em] px-4 py-3 rounded-lg border border-[var(--ink)] w-fit">
              EDIT
            </button>
            <span className="f-mono text-[11px] tracking-[0.2em] text-[var(--ink2)] tabular-nums">LOCAL {time}</span>
          </div>
        </div>
      )}
    </header>
  );
}
