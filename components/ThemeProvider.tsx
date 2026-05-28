"use client";

import * as React from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = React.createContext<ThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("dark");
  const [mounted, setMounted] = React.useState(false);

  // Leer preferencia al montar (solo cliente)
  React.useEffect(() => {
    let saved: Theme | null = null;
    try {
      saved = localStorage.getItem("theme") as Theme | null;
    } catch {}

    if (saved === "light" || saved === "dark") {
      setThemeState(saved);
    } else {
      // Seguir preferencia del sistema
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setThemeState(prefersDark ? "dark" : "light");
    }
    setMounted(true);
  }, []);

  // Aplicar data-theme en <html> cada vez que cambia
  React.useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [theme, mounted]);

  const setTheme = React.useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
