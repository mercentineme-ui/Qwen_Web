import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { defaultData, PortfolioData } from "./data";

const DATA_KEY = "cbk-portfolio-v1";
const THEME_KEY = "cbk-theme";

type Theme = "light" | "dark";

interface StoreCtx {
  data: PortfolioData;
  update: (fn: (d: PortfolioData) => PortfolioData) => void;
  resetAll: () => void;
  theme: Theme;
  toggleTheme: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

function deepMerge(base: unknown, over: unknown): unknown {
  if (Array.isArray(base)) return Array.isArray(over) ? over : base;
  if (base !== null && typeof base === "object") {
    const b = base as Record<string, unknown>;
    const o = (over !== null && typeof over === "object" ? over : {}) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(b)) out[k] = deepMerge(b[k], o[k]);
    return out;
  }
  return over === undefined || over === null ? base : over;
}

function normalize(d: PortfolioData): PortfolioData {
  /* backfill fields added after earlier schemas so old persisted data stays valid */
  const shortOf = (name: string) => (name === "PREMA SAI DESIGNERS" ? "PSD" : name);
  return {
    ...d,
    expertise: {
      ...d.expertise,
      companies: (d.expertise?.companies ?? defaultData.expertise.companies).map((c) => ({
        ...c,
        short: c.short || shortOf(c.name),
      })),
    },
    byNumbers: d.byNumbers ?? defaultData.byNumbers,
  };
}

function loadData(): PortfolioData {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return defaultData;
    return normalize(deepMerge(defaultData, JSON.parse(raw)) as PortfolioData);
  } catch {
    return defaultData;
  }
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>(loadData);
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      return localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem(DATA_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  const update = useCallback((fn: (d: PortfolioData) => PortfolioData) => setData((d) => fn(d)), []);
  const resetAll = useCallback(() => {
    setData(defaultData);
    try { localStorage.removeItem(DATA_KEY); } catch { /* ignore */ }
  }, []);
  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const value = useMemo(
    () => ({ data, update, resetAll, theme, toggleTheme }),
    [data, update, resetAll, theme, toggleTheme]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

export function useHashRoute(): [string, (r: string) => void] {
  const [route, setRoute] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const nav = useCallback((r: string) => {
    window.location.hash = r;
    window.scrollTo({ top: 0 });
  }, []);
  return [route, nav];
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export const readAsDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

export function useLocalTime(): string {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  let h = now.getHours();
  const mer = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())} ${mer}`;
}
