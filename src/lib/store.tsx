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
  storageNote: string;
}

const Ctx = createContext<StoreCtx | null>(null);

function loadData(): PortfolioData {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as Partial<PortfolioData>;
    // shallow-merge top level keys so schema evolution never breaks
    return { ...defaultData, ...parsed } as PortfolioData;
  } catch {
    return defaultData;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PortfolioData>(loadData);
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const t = localStorage.getItem(THEME_KEY);
      return t === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });
  const [storageNote, setStorageNote] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch { /* ignore */ }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
      setStorageNote("");
    } catch {
      setStorageNote("LOCAL STORAGE FULL — MEDIA HELD IN SESSION ONLY");
    }
  }, [data]);

  const update = useCallback((fn: (d: PortfolioData) => PortfolioData) => {
    setData((d) => fn(d));
  }, []);

  const resetAll = useCallback(() => {
    setData(defaultData);
    try { localStorage.removeItem(DATA_KEY); } catch { /* ignore */ }
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  const value = useMemo(
    () => ({ data, update, resetAll, theme, toggleTheme, storageNote }),
    [data, update, resetAll, theme, toggleTheme, storageNote]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore outside provider");
  return ctx;
}

/* ---------- hash routing (/#/edit) ---------- */
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

/* ---------- reduced motion ---------- */
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

/* ---------- helpers ---------- */
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
