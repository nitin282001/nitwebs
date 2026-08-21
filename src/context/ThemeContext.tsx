import React, { createContext, useContext, useEffect, useState } from "react";
import { hexToHsl } from "../lib/utils";
import { useSiteDataContext } from "./SiteDataContext";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const THEME_STORAGE_KEY = "nitwebs_theme";

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") return stored;
  } catch (e) {
    // localStorage unavailable (privacy mode, etc.) — fall through to default
  }
  return "system";
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme);

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const { siteData } = useSiteDataContext();

  // Apply the backend primary color setting once shared site data arrives —
  // sourced from SiteDataProvider instead of its own /content fetch.
  useEffect(() => {
    const primaryColor = siteData?.theme?.primaryColor;
    if (!primaryColor) return;
    const hsl = hexToHsl(primaryColor);
    if (hsl) {
      document.documentElement.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      document.documentElement.style.setProperty("--primary-tint", `${hsl.h} ${hsl.s}% ${Math.min(95, hsl.l + 32)}%`);
    }
  }, [siteData]);

  // Track OS-level scheme changes so "System" stays live without a reload.
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setSystemTheme(mql.matches ? "dark" : "light");
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  // The inline script in index.html already applies the correct class before
  // first paint; this effect just keeps it in sync with in-app toggles.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const setTheme = (next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (e) {
      // localStorage unavailable — theme just won't persist across reloads
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
