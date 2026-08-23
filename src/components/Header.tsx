import React, { useState } from "react";
import { useHashRoute, useLocalTime, useStore } from "../lib/store";
import { LinkedInIcon, MoonIcon, SunIcon } from "./icons";

const NAV = [
  { label: "ABOUT", href: "#about" },
  { label: "SHOW REEL", href: "#showreel" },
  { label: "AI LAB", href: "#ailab" },
  { label: "ARC", href: "#arc" },
  { label: "CONTACT ME", href: "#contact" },
];

/* DESIGNFOLIO — continuous fluid identity animation.
   thin → bold → mixed-weight letters → color wave → micro glitch
   displacement → soft blur → letter hops → re-align → rest. */
function FluidWord() {
  return (
    <span className="f-tech tracking-[0.3em] text-[11px] lg:text-[12.5px] leading-none whitespace-nowrap" aria-label="DESIGNFOLIO">
      {"DESIGNFOLIO".split("").map((ch, i) => (
        <span key={i} className="logo-letter" style={{ animationDelay: `${i * 0.16}s` }}>
          {ch}
        </span>
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
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--line)]"
      style={{ backgroundColor: "color-mix(in srgb, var(--page) 88%, transparent)", backdropFilter: "blur(10px)" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-[64px] lg:h-[80px] flex items-center gap-4 lg:gap-6">
        {/* ---------- CBK | DESIGNFOLIO ---------- */}
        <a href="#about" className="flex items-center gap-3.5 lg:gap-4 shrink-0 group" aria-label="CBK Designfolio home">
          {/* BETRON brand mark — compact futuristic, not a badge */}
          <span className="f-betron font-black text-[21px] lg:text-[24px] leading-none tracking-[0.04em] text-[var(--ink)] transition-colors duration-300 group-hover:text-[var(--crimson)]">
            CBK<span className="text-[var(--crimson)] group-hover:text-[var(--ink)] transition-colors duration-300">/</span>
          </span>
          <span className="hidden sm:flex flex-col gap-[5px]">
            <FluidWord />
            <span className="h-px w-full relative overflow-hidden" style={{ background: "var(--line)" }}>
              <span className="absolute inset-y-0 left-0 w-1/3 bg-[var(--crimson)] -translate-x-full transition-transform duration-700 group-hover:translate-x-[320%]" />
            </span>
          </span>
        </a>

        {/* deliberate small separation */}
        <span className="hidden lg:block w-px h-7" style={{ background: "var(--line)" }} aria-hidden />

        {/* ---------- EDIT ---------- */}
        <button onClick={() => nav("#/edit")}
          className="hidden lg:block f-betron font-bold text-[12px] tracking-[0.24em] px-3.5 py-2.5 rounded-lg border border-[var(--ink)] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] hover:text-[#f4f2ed] transition-all duration-300 shrink-0">
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
          {/* local time — numbers and meridiem each have their own distinct color */}
          <div className="hidden md:flex flex-col items-end leading-none mr-1">
            <span className="f-mono text-[8.5px] tracking-[0.32em] text-[var(--ink2)]">LOCAL TIME</span>
            <span className="mt-1.5 flex items-baseline gap-2">
              <span className="f-betron font-bold text-[17px] lg:text-[19px] tabular-nums tracking-[0.05em] text-[var(--crimson)]">
                {hhmm}
              </span>
              <span className="f-tech font-bold text-[10.5px] lg:text-[11.5px] tracking-[0.2em] px-1.5 py-[3px] rounded-[6px] border-[1.5px] border-[var(--ink)] text-[var(--ink)]">
                {mer}
              </span>
            </span>
          </div>

          {/* theme — larger moon / sun inside the square */}
          <button onClick={toggleTheme} aria-label="Toggle theme"
            className={`w-[42px] h-[42px] lg:w-11 lg:h-11 grid place-items-center rounded-lg border transition-colors duration-500 ${
              theme === "light" ? "bg-[#1B1C20] border-[#1B1C20]" : "bg-[#E7E6E1] border-[#E7E6E1]"
            }`}>
            {theme === "light" ? <span className="moon-drift"><MoonIcon size={22} /></span> : <SunIcon size={22} />}
          </button>

          {/* linkedin */}
          <a href="https://www.linkedin.com/in/c-bala-krishnan" target="_blank" rel="noreferrer" aria-label="LinkedIn"
            className="w-[42px] h-[42px] lg:w-11 lg:h-11 grid place-items-center rounded-lg border border-[var(--line)] text-[var(--ink)] hover:text-[#f4f2ed] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] transition-all duration-300">
            <LinkedInIcon size={17} />
          </a>

          {/* mobile menu */}
          <button onClick={() => setOpen(!open)} aria-label="Menu"
            className="lg:hidden w-10 h-10 grid place-items-center rounded-lg border border-[var(--line)]">
            <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
              {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h12" />}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile nav drawer */}
      <div className={`lg:hidden overflow-hidden transition-[max-height] duration-500 ease-out border-[var(--line)] ${open ? "max-h-[440px] border-t" : "max-h-0"}`}
        style={{ backgroundColor: "var(--page)" }}>
        <div className="px-6 py-6 flex flex-col gap-5">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} onClick={() => setOpen(false)}
              className="f-tech font-bold text-[15px] tracking-[0.22em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors">
              {n.label}
            </a>
          ))}
          <div className="flex items-center justify-between pt-4 border-t border-[var(--line)]">
            <span className="f-betron font-bold text-[15px] tabular-nums flex items-center gap-2">
              <span className="text-[var(--crimson)]">{hhmm}</span>
              <span className="f-tech text-[11px] tracking-[0.2em] px-1.5 py-0.5 rounded-[6px] border-[1.5px] border-[var(--ink)]">{mer}</span>
            </span>
            <button onClick={() => { setOpen(false); nav("#/edit"); }}
              className="f-betron font-bold text-[12px] tracking-[0.24em] px-4 py-2.5 rounded-lg border border-[var(--ink)]">
              EDIT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
