import React, { useState } from "react";
import { useHashRoute, useLocalTime, useStore } from "../lib/store";
import { LinkedInIcon, MoonIcon, SunIcon } from "./icons";

const NAV = [
  { label: "ABOUT", href: "#about" },
  { label: "AI LAB", href: "#ailab" },
  { label: "SHOW REEL", href: "#showreel" },
  { label: "ARC", href: "#arc" },
  { label: "CONTACT ME", href: "#contact" },
];

export default function Header() {
  const { theme, toggleTheme } = useStore();
  const [, nav] = useHashRoute();
  const time = useLocalTime();
  const [open, setOpen] = useState(false);
  const [hhmm, mer] = [time.slice(0, 8), time.slice(9)];

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--line)]"
      style={{ backgroundColor: "color-mix(in srgb, var(--page) 88%, transparent)", backdropFilter: "blur(10px)" }}>
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-[64px] flex items-center gap-5">
        {/* wordmark */}
        <a href="#about" className="flex items-center gap-2.5 shrink-0 group" aria-label="CBK Designfolio home">
          <span className="f-display text-[15px] leading-none px-2 py-1.5 bg-[var(--ink)] text-[var(--page)] tracking-[0.08em] rounded-[4px] transition-colors duration-300 group-hover:bg-[var(--crimson)] group-hover:text-[#f4f2ed]">
            CBK
          </span>
          <span className="hidden xs:inline sm:inline f-tech font-semibold text-[11px] tracking-[0.34em] text-[var(--ink2)]">
            DESIGNFOLIO
          </span>
        </a>

        {/* nav */}
        <nav className="hidden lg:flex items-center gap-6 mx-auto">
          {NAV.map((n) => (
            <a key={n.label} href={n.href}
              className="f-tech font-semibold text-[11px] tracking-[0.22em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-1.5 after:h-[2px] after:w-0 after:bg-[var(--crimson)] hover:after:w-full after:transition-all after:duration-300">
              {n.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-4 ml-auto lg:ml-0">
          {/* local time */}
          <div className="hidden md:flex flex-col items-end leading-none mr-1">
            <span className="f-mono text-[9px] tracking-[0.3em] text-[var(--ink2)]">LOCAL TIME</span>
            <span className="f-mono text-[12px] font-medium mt-1 tabular-nums">
              {hhmm} <span className="text-[var(--crimson)] font-semibold">{mer}</span>
            </span>
          </div>

          {/* linkedin */}
          <a href="https://www.linkedin.com/in/c-bala-krishnan" target="_blank" rel="noreferrer" aria-label="LinkedIn"
            className="w-9 h-9 grid place-items-center rounded-lg border border-[var(--line)] text-[var(--ink)] hover:text-[#f4f2ed] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] transition-all duration-300">
            <LinkedInIcon size={14} />
          </a>

          {/* theme */}
          <button onClick={toggleTheme} aria-label="Toggle theme"
            className={`w-9 h-9 grid place-items-center rounded-lg border transition-colors duration-500 ${
              theme === "light"
                ? "bg-[#1B1C20] border-[#1B1C20]"
                : "bg-[#E7E6E1] border-[#E7E6E1]"
            }`}>
            {theme === "light" ? <span className="moon-drift"><MoonIcon size={16} /></span> : <SunIcon size={16} />}
          </button>

          {/* edit */}
          <button onClick={() => nav("#/edit")}
            className="f-tech font-bold text-[11px] tracking-[0.24em] px-3.5 py-2.5 rounded-lg border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--page)] transition-all duration-300 hidden sm:block">
            EDIT
          </button>

          {/* mobile menu */}
          <button onClick={() => setOpen(!open)} aria-label="Menu"
            className="lg:hidden w-9 h-9 grid place-items-center rounded-lg border border-[var(--line)]">
            <svg width="16" height="16" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
              {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h12" />}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile nav drawer */}
      <div className={`lg:hidden overflow-hidden transition-[max-height] duration-500 ease-out border-[var(--line)] ${open ? "max-h-[420px] border-t" : "max-h-0"}`}
        style={{ backgroundColor: "var(--page)" }}>
        <div className="px-6 py-5 flex flex-col gap-4">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} onClick={() => setOpen(false)}
              className="f-tech font-semibold text-[13px] tracking-[0.24em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors">
              {n.label}
            </a>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]">
            <span className="f-mono text-[11px] text-[var(--ink2)] tabular-nums">{hhmm} <span className="text-[var(--crimson)]">{mer}</span></span>
            <button onClick={() => { setOpen(false); nav("#/edit"); }}
              className="f-tech font-bold text-[11px] tracking-[0.24em] px-3.5 py-2 rounded-lg border border-[var(--ink)]">
              EDIT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
