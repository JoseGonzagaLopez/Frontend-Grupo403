"use client";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logOutBusiness } from "@/lib/actions";
import { useState, useRef, useEffect } from "react";
import { LogOut, User } from "lucide-react";
import Link from "next/link";
import type { Business } from "@/lib/api";

interface Props {
  onMenuClick?: () => void;
  business?: Business | null;
}

export default function NegocioHeader({ onMenuClick, business }: Props) {
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

  const fotoUrl = (business as any)?.fotoUrl as string | undefined;
  const nombre = business?.Nombre || "Mi negocio";

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <button className="hamburger-btn" onClick={onMenuClick} aria-label="Abrir menú">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="admin-header__title">BookFlow</span>
        <span className="admin-header__subtitle">Portal de negocio</span>
      </div>
      <div className="admin-header__actions">
        <ThemeToggle />
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Menú de usuario"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid var(--border)",
              cursor: "pointer",
              background: "var(--surface-2)",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={nombre}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: 18, lineHeight: 1 }}>🏢</span>
            )}
          </button>

          {open && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                zIndex: 100,
                background: "var(--surface-solid)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)",
                boxShadow: "var(--shadow-lg)",
                marginTop: 6,
                width: 220,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--border)" }}>
                <p style={{ fontWeight: 600, fontSize: "var(--text-sm)", color: "var(--text)" }}>
                  {nombre}
                </p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--accent)", marginTop: 2, fontWeight: 500 }}>
                  ● Sesión activa
                </p>
              </div>
              <Link
                href="/negocio/perfil"
                onClick={() => setOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  fontSize: "var(--text-sm)",
                  color: "var(--text)",
                  textDecoration: "none",
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
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 14px",
                  fontSize: "var(--text-sm)",
                  color: "var(--danger)",
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
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
