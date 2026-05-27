"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { logOut } from "@/lib/actions";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  onLogout?: () => Promise<void>;
  onMenuClick?: () => void;
  hideHamburger?: boolean;
  fanItems?: unknown[];
}

export default function Header({
  title    = "Buk-A Admin",
  subtitle = "Plataforma de gestión de reservas y cobros",
  userName = "Administrador",
  onLogout,
}: HeaderProps) {
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    else { await logOut(); window.location.href = "/login"; }
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header className="admin-header glass-surface">
      <div className="admin-header__left">
        <span className="admin-header__title">{title}</span>
        <span className="admin-header__subtitle">{subtitle}</span>
      </div>
      <div className="admin-header__actions">
        <ThemeToggle />
        <div style={{ position: "relative" }} ref={dropRef}>
          <img
            src="/favicon.ico"
            alt="Avatar"
            className="admin-avatar"
            onClick={() => setDropOpen(v => !v)}
          />
          {dropOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              zIndex: 100,
              background: "var(--surface)",
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-float)",
              width: 210, overflow: "hidden",
              animation: "fadeSlideUp 250ms var(--ease-out) both",
            }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ color: "var(--text)", fontWeight: 600, fontSize: 14 }}>{userName}</p>
                <p style={{ color: "var(--teal)", fontSize: 12, marginTop: 4, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />
                  Sesión activa
                </p>
              </div>
              <div
                onClick={handleLogout}
                style={{ padding: "10px 14px", cursor: "pointer", color: "var(--danger)", fontSize: 14, display: "flex", alignItems: "center", gap: 8, transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={15} /> Cerrar sesión
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
