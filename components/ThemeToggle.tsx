"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Evitar hydration mismatch — render vacío hasta que el cliente sepa el tema
  if (!mounted) return <div className="theme-toggle-placeholder" aria-hidden="true" />;

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={isDark ? "Modo claro" : "Modo oscuro"}
      className="theme-toggle-btn"
    >
      {isDark ? <Sun size={16} strokeWidth={2} /> : <Moon size={16} strokeWidth={2} />}

      <style>{`
        .theme-toggle-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md, 10px);
          border: 1px solid var(--border);
          background: var(--surface-hover);
          color: var(--text-secondary);
          cursor: pointer;
          transition:
            background 160ms ease,
            border-color 160ms ease,
            color 160ms ease,
            transform 160ms ease;
          flex-shrink: 0;
        }

        .theme-toggle-btn:hover {
          background: var(--accent-soft);
          border-color: var(--border-strong);
          color: var(--accent);
          transform: translateY(-1px);
        }

        .theme-toggle-btn:active {
          transform: scale(0.94);
        }

        .theme-toggle-placeholder {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }
      `}</style>
    </button>
  );
}
