import React, { useEffect, useState } from "react";
import { useHashRoute, useLocalTime, useReducedMotion, useStore } from "../lib/store";
import { LinkedInIcon, MoonIcon, SunIcon } from "./icons";

const NAV = [
  { label: "ABOUT", href: "#about" },
  { label: "CREATIVES", href: "#showreel" },
  { label: "AI LAB", href: "#ailab" },
  { label: "ARC", href: "#arc" },
  { label: "CONTACT ME", href: "#contact" },
];

const DESIGNFOLIO = "DESIGNFOLIO".split("");

export default function Header() {
  const { theme, toggleTheme } = useStore();
  const [, nav] = useHashRoute();
  const reduced = useReducedMotion();
  const time = useLocalTime();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const [hh, mm, ss, mer] = time.split(/[: ]/);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div
        className="hdr-shell mat-texture transition-all duration-500"
        style={{
          backgroundColor: "color-mix(in srgb, var(--page) 88%, transparent)",
          backdropFilter: scrolled ? "blur(3px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(3px)" : "none",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 h-[58px] lg:h-[64px] flex items-center gap-4 lg:gap-6">
          {/* CBK identity — clean mark, no strike */}
          <a href="#about" className="flex items-baseline gap-3 shrink-0" aria-label="CBK Designfolio — home">
            <span className="f-automata text-[21px] lg:text-[23px] leading-none tracking-[0.08em] text-[var(--ink)]">CBK</span>
            <span className="relative hidden sm:inline-flex overflow-hidden">
              <span className={`f-tech font-semibold text-[11px] lg:text-[12px] text-[var(--ink2)] ${reduced ? "" : "logo-track"}`}
                style={reduced ? { letterSpacing: "0.42em" } : undefined}>
                {DESIGNFOLIO.map((ch, i) => (
                  <span key={i} className={reduced ? "inline-block" : "logo-letter-in inline-block"}
                    style={reduced ? undefined : { animationDelay: `${0.08 + i * 0.035}s` }}>
                    {ch}
                  </span>
                ))}
              </span>
              {!reduced && (
                <span className="logo-scan pointer-events-none absolute top-0 bottom-0 left-0 w-[18px]"
                  style={{ background: "linear-gradient(90deg, transparent, color-mix(in srgb, var(--crimson) 55%, transparent), transparent)" }}
                  aria-hidden />
              )}
            </span>
          </a>

          <span className="w-px h-6 shrink-0" style={{ background: "var(--line)" }} aria-hidden />

          <button onClick={() => nav("#/edit")}
            className="f-tech font-bold text-[11px] lg:text-[12px] tracking-[0.3em] text-[var(--ink2)] hover:text-[var(--crimson)] transition-colors duration-300 shrink-0">
            EDIT
          </button>

          {/* nav — centered */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 absolute left-1/2 -translate-x-1/2">
            {NAV.map((n) => (
              <a key={n.label} href={n.href}
                className="f-tech font-bold text-[11.5px] lg:text-[12.5px] tracking-[0.24em] text-[var(--ink2)] hover:text-[var(--ink)] transition-colors duration-300 relative group">
                {n.label}
                <span className="absolute -bottom-1.5 left-0 h-[2px] w-0 bg-[var(--crimson)] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          <div className="flex-1" />

          {/* refined technical clock */}
          <div className="hidden sm:flex items-baseline gap-1.5 leading-none tabular-nums">
            <span className="f-mono text-[7.5px] tracking-[0.3em] text-[var(--ink2)] mr-1 self-center">LOCAL</span>
            <span className="clock-num f-tech font-bold text-[16px] lg:text-[17px] tracking-[0.05em]">{hh}:{mm}:{ss}</span>
            <span className={`f-tech font-bold text-[9px] tracking-[0.18em] px-1.5 py-[3px] rounded-[4px] self-center ${
              mer === "PM" ? "bg-[var(--crimson)] text-[#ddddd8]" : "border border-[var(--ink2)] text-[var(--ink2)]"
            }`}>
              {mer}
            </span>
          </div>

          <button onClick={toggleTheme} aria-label="Toggle theme"
            className="w-9 h-9 lg:w-10 lg:h-10 grid place-items-center rounded-[8px] border transition-all duration-400 hover:-translate-y-0.5 shrink-0"
            style={{ backgroundColor: theme === "light" ? "#222328" : "#ddddd8", borderColor: "var(--line)" }}>
            {theme === "light" ? <MoonIcon size={19} className="moon-drift" /> : <SunIcon size={20} />}
          </button>

          <a href="https://www.linkedin.com/in/c-bala-krishnan" target="_blank" rel="noreferrer" aria-label="LinkedIn"
            className="w-9 h-9 lg:w-10 lg:h-10 grid place-items-center rounded-[8px] border border-[var(--line)] text-[var(--ink)] transition-all duration-400 hover:-translate-y-0.5 hover:text-[var(--crimson)] hover:border-[var(--crimson)] shrink-0">
            <LinkedInIcon size={15} />
          </a>
        </div>

        {/* structural bottom edge */}
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

      {/* mobile nav row */}
      <nav className="md:hidden max-w-[1440px] mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-4 overflow-x-auto"
        style={{ backgroundColor: "color-mix(in srgb, var(--page) 92%, transparent)", borderBottom: "1px solid var(--line)" }}>
        {NAV.map((n) => (
          <a key={n.label} href={n.href}
            className="f-tech font-bold text-[10.5px] tracking-[0.22em] text-[var(--ink2)] whitespace-nowrap">
            {n.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
