"use client";

import * as React from "react";

type Theme = "light" | "dark";

const ThemeContext = React.createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
}>({
  theme: "light",
  setTheme: () => {},
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");

  // Al montar: leer preferencia guardada o sistema operativo
  React.useEffect(() => {
    let resolved: Theme = "light";
    try {
      const stored = localStorage.getItem("buka-theme") as Theme | null;
      if (stored === "light" || stored === "dark") {
        resolved = stored;
      } else {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
    } catch {
      resolved = "light";
    }
    setThemeState(resolved);
    document.documentElement.setAttribute("data-theme", resolved);
  }, []);

  // Cada vez que cambia: aplicar al DOM y guardar
  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("buka-theme", theme);
    } catch {
      // ignorar si localStorage no está disponible
    }
  }, [theme]);

  const setTheme = React.useCallback((t: Theme) => setThemeState(t), []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
