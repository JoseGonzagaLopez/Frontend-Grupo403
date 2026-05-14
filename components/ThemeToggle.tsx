"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ width: 40, height: 40 }} />; // Placeholder for the button layout
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="theme-toggle-btn"
      aria-label="Alternar tema oscuro"
      title="Alternar tema oscuro"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        color: "var(--text)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: "var(--shadow-sm)"
      }}
    >
      {theme === "dark" ? (
        <Sun size={20} className="text-yellow-400" style={{ color: "#fbbf24" }} />
      ) : (
        <Moon size={20} className="text-slate-700" style={{ color: "#334155" }} />
      )}
    </button>
  );
}
