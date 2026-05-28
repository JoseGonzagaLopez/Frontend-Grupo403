"use client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logOutBusiness } from "@/lib/actions";
import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

// FanMenu se renderiza a través de NegocioSidebar — NO duplicar aquí
interface Props { onMenuClick?: () => void; }

export default function NegocioHeader({ onMenuClick: _onMenuClick }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logOutBusiness();
    window.location.href = "/login";
  };

  return (
    <header className="admin-header glass-surface">
      <div className="admin-header__left">
        <span className="admin-header__title">Buk-A</span>
        <span className="admin-header__subtitle">Portal de negocio</span>
      </div>

      <div className="admin-header__actions">
        <ThemeToggle />
        <div style={{ position: "relative" }} ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--teal))",
              color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid var(--border-glow)",
              cursor: "pointer",
              fontSize: 18,
              boxShadow: "0 0 16px var(--accent-glow)",
              transition: "all var(--transition-spring)",
            }}
            aria-label="Menú de usuario"
          >
            🏢
          </button>
          {open && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 100,
              background: "var(--surface)",
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-float)",
              width: 220, overflow: "hidden",
              animation: "fadeSlideUp 250ms var(--ease-out) both",
            }}>
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text)" }}>Mi negocio</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--teal)", marginTop: 2, fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)", display: "inline-block" }} />
                  Sesión activa
                </p>
              </div>
              <Link
                href="/negocio/perfil"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 14px", fontSize: "var(--text-sm)",
                  color: "var(--text)", textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <User size={15} /> Editar perfil
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 14px", fontSize: "var(--text-sm)",
                  color: "var(--danger)", width: "100%",
                  background: "transparent", border: "none", cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={15} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
