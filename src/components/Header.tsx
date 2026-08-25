import React, { useEffect, useState } from "react";
import { useHashRoute, useLocalTime, useStore } from "../lib/store";
import { LinkedInIcon, MoonIcon, SunIcon } from "./icons";

const NAV = [
  { label: "ABOUT", href: "#about" },
  { label: "CREATIVES", href: "#showreel" },
  { label: "AI LAB", href: "#ailab" },
  { label: "ARC", href: "#arc" },
  { label: "CONTACT ME", href: "#contact" },
];

const DESIGNFOLIO = "DESIGNFOLIO";

export default function Header() {
  const { theme, toggleTheme } = useStore();
  const [, nav] = useHashRoute();
  const time = useLocalTime();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [hhmmss, mer] = time.split(" ");

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className={`hdr-shell transition-all duration-500 ${scrolled ? "backdrop-blur-[3px]" : ""}`}
        style={{
          backgroundColor: scrolled
            ? "color-mix(in srgb, var(--page) 82%, transparent)"
            : "color-mix(in srgb, var(--page) 55%, transparent)",
          borderBottom: "1px solid var(--line)",
        }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-12 lg:h-[58px] flex items-center gap-4 lg:gap-6">
          {/* ---------- CBK | DESIGNFOLIO ---------- */}
          <a href="#about" className="flex items-baseline gap-2.5 shrink-0" aria-label="CBK Designfolio — home">
            <span className="f-automata text-[19px] lg:text-[22px] tracking-[0.08em] leading-none relative">
              <span className="text-[var(--ink)]">CB</span><span className="text-[var(--crimson)]">K</span>
              <span className="absolute -bottom-[3px] left-0 right-0 h-[2px] bg-[var(--crimson)] opacity-80" aria-hidden />
            </span>
            <span className="hidden sm:block f-tech font-semibold text-[12px] lg:text-[13px] tracking-[0.34em] text-[var(--ink2)]" aria-label="Designfolio">
              {DESIGNFOLIO.split("").map((ch, i) => (
                <span key={i} className="logo-letter" style={{ animationDelay: `${i * 0.35}s` }}>{ch}</span>
              ))}
            </span>
          </a>

          {/* ---------- EDIT ---------- */}
          <button onClick={() => nav("#/edit")}
            className="f-tech font-bold text-[11px] lg:text-[12px] tracking-[0.24em] px-3 py-1.5 rounded-[6px] border border-[var(--line)] text-[var(--ink2)] hover:text-[var(--crimson)] hover:border-[var(--crimson)] transition-all duration-300 shrink-0">
            EDIT
          </button>

          {/* ---------- NAV ---------- */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 mx-auto">
            {NAV.map((n) => (
              <a key={n.label} href={n.href}
                className="f-tech font-bold text-[12.5px] tracking-[0.18em] text-[var(--ink)] relative py-1 group">
                {n.label}
                <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-[var(--crimson)] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* ---------- right utilities : TIME → THEME → LINKEDIN ---------- */}
          <div className="flex items-center gap-3 lg:gap-3.5 ml-auto lg:ml-0">
            <div className="hidden md:flex flex-col items-end leading-none mr-1">
              <span className="f-mono text-[8px] tracking-[0.32em] text-[var(--ink2)]">LOCAL TIME</span>
              <span className="mt-1 flex items-baseline gap-2">
                <span className="f-clock text-[19px] lg:text-[21px] tracking-[0.06em] clock-num tabular-nums">{hhmmss}</span>
                <span className={`f-tech font-bold text-[9px] tracking-[0.18em] px-1.5 py-0.5 rounded-[4px] ${
                  mer === "PM" ? "bg-[var(--crimson)] text-[#DDDDD8]" : "border border-[var(--ink2)] text-[var(--ink2)]"
                }`}>{mer}</span>
              </span>
            </div>

            <button onClick={toggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className={`w-10 h-10 lg:w-11 lg:h-11 grid place-items-center rounded-lg border transition-colors duration-500 ${
                theme === "light" ? "bg-[#222328] border-[#222328]" : "bg-[#DDDDD8] border-[#DDDDD8]"
              }`}>
              <span className={theme === "dark" ? "sun-spin" : "moon-drift"}>
                {theme === "light" ? <MoonIcon size={20} /> : <SunIcon size={20} />}
              </span>
            </button>

            <a href="https://www.linkedin.com/in/c-bala-krishnan" target="_blank" rel="noreferrer" aria-label="LinkedIn"
              className="w-10 h-10 lg:w-11 lg:h-11 grid place-items-center rounded-lg border border-[var(--line)] text-[var(--ink)] hover:text-[#DDDDD8] hover:bg-[var(--crimson)] hover:border-[var(--crimson)] transition-all duration-300">
              <LinkedInIcon size={17} />
            </a>

            <button onClick={() => setOpen(!open)} aria-label="Menu"
              className="lg:hidden w-10 h-10 grid place-items-center rounded-lg border border-[var(--line)]">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                {open ? <path d="M5 5l14 14M19 5L5 19" /> : <path d="M3 6h18M3 12h18M3 18h12" />}
              </svg>
            </button>
          </div>
        </div>

        {/* bottom structural edge — horizontal line + diagonal rises */}
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

      {/* mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-[var(--line)]" style={{ background: "var(--page)" }}>
          <nav className="max-w-[1440px] mx-auto px-4 py-4 grid gap-1">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setOpen(false)}
                className="f-tech font-bold text-[14px] tracking-[0.18em] py-3 px-3 rounded-lg hover:bg-[var(--sup1)] transition-colors duration-300">
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
