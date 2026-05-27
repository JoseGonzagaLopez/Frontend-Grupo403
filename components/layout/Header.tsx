"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { logOut } from "@/lib/actions";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";
import FanMenu, { type FanMenuItem } from "./FanMenu";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => Promise<void>;
  hideHamburger?: boolean;
  fanItems?: FanMenuItem[];
}

export default function Header({
  onMenuClick,
  title = "Buk-A Admin",
  subtitle = "Plataforma de gestión de reservas y cobros",
  userName = "Administrador",
  userRole = "Administrador",
  onLogout,
  hideHamburger = false,
  fanItems = [],
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    else { await logOut(); window.location.href = "/login"; }
  };

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setIsDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        {!hideHamburger && (
          fanItems.length > 0
            ? <FanMenu items={fanItems} />
            : (
              <button
                className="hamburger-btn"
                onClick={onMenuClick}
                aria-label="Abrir menú"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6"  x2="21" y2="6"  />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )
        )}
        <span className="admin-header__title">{title}</span>
        <span className="admin-header__subtitle">{subtitle}</span>
      </div>

      <div className="admin-header__actions">
        <ThemeToggle />
        <div className="relative" ref={dropdownRef}>
          <img
            src="/favicon.ico"
            alt="Avatar"
            className="admin-avatar"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          {isDropdownOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0,
              zIndex: 100,
              background: "var(--surface)",
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-float)",
              width: 210,
              overflow: "hidden",
              animation: "fadeSlideUp 250ms var(--ease-out) both",
            }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ color: "var(--text)", fontWeight: 600, fontSize: "14px" }}>{userName}</p>
                <p style={{ color: "var(--teal)", fontSize: "12px", marginTop: 4, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />
                  Sesión activa
                </p>
              </div>
              <div
                onClick={handleLogout}
                style={{
                  padding: "10px 14px", cursor: "pointer",
                  color: "var(--danger)", fontSize: "14px",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
