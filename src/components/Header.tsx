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

export default function Header() {
  const { theme, toggleTheme } = useStore();
  const [, nav] = useHashRoute();
  const time = useLocalTime();
  const [open, setOpen] = useState(false);
  const [hhmm, mer] = [time.slice(0, 8), time.slice(9)];

  /* AM / PM — two clearly different treatments */
  const merChip =
    mer === "AM" ? (
      <span className="f-tech font-bold text-[13px] lg:text-[14px] tracking-[0.22em] px-2.5 py-1.5 rounded-lg border-2 border-[var(--ink2)] text-[var(--ink2)]">
        AM
      </span>
    ) : (
      <span className="f-tech font-bold text-[13px] lg:text-[14px] tracking-[0.22em] px-2.5 py-1.5 rounded-lg bg-[var(--crimson)] text-[#f4f2ed] shadow-[0_8px_22px_-8px_rgba(227,34,64,0.9)]">
        PM
      </span>
    );

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-[var(--line)]"
      style={{ backgroundColor: "color-mix(in srgb, var(--page) 88%, transparent)", backdropFilter: "blur(10px)" }}>
      <div className="max-w-[1560px] mx-auto px-4 sm:px-8 h-[96px] lg:h-[116px] flex items-center gap-4 lg:gap-7">
        {/* ---------- wordmark : CBK | DESIGNFOLIO (≈2× scale) ---------- */}
        <a href="#about" className="flex items-center gap-4 lg:gap-5 shrink-0 group" aria-label="CBK Designfolio home">
          <span
            className="f-tech font-bold text-[34px] lg:text-[40px] leading-none px-4 lg:px-5 py-2.5 lg:py-3 bg-[var(--ink)] text-[var(--page)] tracking-[0.05em] mat-texture transition-all duration-300 group-hover:bg-[var(--crimson)] group-hover:text-[#f4f2ed]"
            style={{ clipPath: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%)" }}
          >
            CBK<span className="text-[var(--crimson)] group-hover:text-[#f4f2ed] transition-colors duration-300">_</span>
          </span>
          <span className="hidden sm:inline-flex flex-col leading-none">
            <span className="f-tech font-semibold text-[15px] lg:text-[17px] tracking-[0.5em] text-[var(--ink2)] transition-colors duration-300 group-hover:text-[var(--ink)]">
              DESIGNFOLIO
            </span>
            <span className="mt-2 h-[2.5px] w-full bg-[var(--line)] relative overflow-hidden">
              <span className="absolute inset-y-0 left-0 w-1/3 bg-[var(--crimson)] transition-transform duration-500 -translate-x-full group-hover:translate-x-[300%]" />
            </span>
          </span>
        </a>

        {/* intentional separation */}
        <span className="hidden lg:block w-px h-11 bg-[var(--line)]" aria-hidden />

        {/* ---------- EDIT ---------- */}
        <button onClick={() => nav("#/edit")}
          className="hidden lg:block f-tech font-bold text-[14px] tracking-[0.28em] px-5 py-3.5 rounded-lg border-2 border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--page)] transition-all duration-300 shrink-0">
          EDIT
        </button>

        {/* ---------- navigation ---------- */}
        <nav className="hidden lg:flex items-center gap-8 mx-auto">
          {NAV.map((n) => (
            <a key={n.label} href={n.href}
              className="f-tech font-bold text-[15px] xl:text-[16px] tracking-[0.18em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors duration-300 relative after:absolute after:left-0 after:-bottom-2.5 after:h-[2.5px] after:w-0 after:bg-[var(--crimson)] hover:after:w-full after:transition-all after:duration-300">
              {n.label}
            </a>
          ))}
        </nav>

        {/* ---------- right utilities : TIME → THEME → LINKEDIN ---------- */}
        <div className="flex items-center gap-3.5 lg:gap-5 ml-auto lg:ml-0">
          {/* local time — futuristic technical type, AM/PM separated */}
          <div className="hidden md:flex flex-col items-end leading-none mr-1">
            <span className="f-mono text-[10px] tracking-[0.34em] text-[var(--ink2)]">LOCAL TIME</span>
            <span className="mt-2 flex items-center gap-2.5">
              <span className="f-tech font-bold text-[22px] lg:text-[25px] tabular-nums tracking-[0.08em] text-[var(--ink)]">
                {hhmm}
              </span>
              {merChip}
            </span>
          </div>

          {/* theme — LIGHT: black square + white moon · DARK: off-white square + crimson/orange sun */}
          <button onClick={toggleTheme} aria-label="Toggle theme"
            className={`w-12 h-12 lg:w-[52px] lg:h-[52px] grid place-items-center rounded-lg border-2 transition-colors duration-500 ${
              theme === "light"
                ? "bg-[#1B1C20] border-[#1B1C20]"
                : "bg-[#E7E6E1] border-[#E7E6E1]"
            }`}>
            {theme === "light" ? <span className="moon-drift"><MoonIcon size={22} /></span> : <SunIcon size={22} />}
          </button>

          {/* linkedin */}
          <a href="https://www.linkedin.com/in/c-bala-krishnan" target="_blank" rel="noreferrer" aria-label="LinkedIn"
            className="w-12 h-12 lg:w-[52px] lg:h-[52px] grid place-items-center rounded-lg border-2 border-[var(--line)] text-[var(--ink)] hover:text-[#f4f2ed] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] transition-all duration-300">
            <LinkedInIcon size={20} />
          </a>

          {/* mobile menu */}
          <button onClick={() => setOpen(!open)} aria-label="Menu"
            className="lg:hidden w-12 h-12 grid place-items-center rounded-lg border-2 border-[var(--line)]">
            <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none">
              {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h12" />}
            </svg>
          </button>
        </div>
      </div>

      {/* mobile nav drawer */}
      <div className={`lg:hidden overflow-hidden transition-[max-height] duration-500 ease-out border-[var(--line)] ${open ? "max-h-[520px] border-t" : "max-h-0"}`}
        style={{ backgroundColor: "var(--page)" }}>
        <div className="px-6 py-7 flex flex-col gap-6">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} onClick={() => setOpen(false)}
              className="f-tech font-bold text-[17px] tracking-[0.22em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors">
              {n.label}
            </a>
          ))}
          <div className="flex items-center justify-between pt-5 border-t border-[var(--line)]">
            <span className="f-tech font-bold text-[18px] tabular-nums flex items-center gap-2.5">
              {hhmm} {merChip}
            </span>
            <button onClick={() => { setOpen(false); nav("#/edit"); }}
              className="f-tech font-bold text-[14px] tracking-[0.28em] px-5 py-3 rounded-lg border-2 border-[var(--ink)]">
              EDIT
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
