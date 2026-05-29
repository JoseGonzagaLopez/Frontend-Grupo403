"use client";

import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logOut } from "@/lib/actions";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, LogOut, Search, Sparkles } from "lucide-react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  userName?: string;
  onLogout?: () => Promise<void>;
  onMenuClick?: () => void;
  hideHamburger?: boolean;
  forceHamburger?: boolean;
  fanItems?: unknown[];
}

const placeholderByTitle: Record<string, string> = {
  "Buk-A Admin": "Buscar reservas, clientes o pagos",
  "Panel de control": "Buscar métricas, reservas o actividad",
  Reservas: "Buscar por cliente, fecha o estado",
  Clientes: "Buscar por nombre, email o teléfono",
  Pagos: "Buscar cobros o transacciones",
  Negocios: "Buscar negocios o categorías",
  Solicitudes: "Buscar solicitudes pendientes",
};

export default function Header({
  title = "Buk-A Admin",
  subtitle = "Plataforma de gestión de reservas y cobros",
  userName = "Administrador",
  onLogout,
  onMenuClick,
  hideHamburger,
  forceHamburger,
}: HeaderProps) {
  const [dropOpen, setDropOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const dropRef = useRef<HTMLDivElement>(null);

  const searchPlaceholder = useMemo(() => {
    return placeholderByTitle[title] ?? "Buscar cualquier cosa";
  }, [title]);

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    else {
      await logOut();
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setDropOpen(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <header className="sellix-topbar">
      <div className="sellix-topbar__intro" style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {onMenuClick && !hideHamburger && (
          <button type="button" className="sellix-icon-btn sellix-icon-btn--soft sellix-hamburger" onClick={onMenuClick} aria-label="Abrir menú" style={{ display: "none" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span className="sellix-topbar__eyebrow">Workspace</span>
          <div className="sellix-topbar__heading-wrap">
            <h1 className="sellix-topbar__title">{title}</h1>
            <p className="sellix-topbar__subtitle">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="sellix-topbar__center">
        <label className="sellix-search" aria-label="Buscar en el panel">
          <Search size={16} className="sellix-search__icon" />
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            type="text"
            placeholder={searchPlaceholder}
            className="sellix-search__input"
          />
          <span className="sellix-search__shortcut">⌘K</span>
        </label>
      </div>

      <div className="sellix-topbar__actions">
        <button type="button" className="sellix-icon-btn sellix-icon-btn--soft" aria-label="Ver notificaciones">
          <Bell size={17} />
          <span className="sellix-icon-btn__ping" aria-hidden="true" />
        </button>

        <button type="button" className="sellix-icon-btn sellix-icon-btn--soft" aria-label="Actividad inteligente">
          <Sparkles size={16} />
        </button>

        <ThemeToggle />

        <div className="sellix-profile" ref={dropRef}>
          <button
            type="button"
            className={`sellix-profile__trigger${dropOpen ? " is-open" : ""}`}
            aria-expanded={dropOpen}
            aria-haspopup="menu"
            onClick={() => setDropOpen((v) => !v)}
          >
            <div className="sellix-profile__avatar-wrap">
              <Image src="/favicon.ico" alt="Avatar" width={36} height={36} className="sellix-profile__avatar" />
              <span className="sellix-profile__status" aria-hidden="true" />
            </div>
            <div className="sellix-profile__meta">
              <span className="sellix-profile__name">{userName}</span>
              <span className="sellix-profile__role">Admin</span>
            </div>
          </button>

          {dropOpen && (
            <div className="sellix-profile__dropdown" role="menu" aria-label="Menú de usuario">
              <div className="sellix-profile__dropdown-head">
                <p className="sellix-profile__dropdown-name">{userName}</p>
                <p className="sellix-profile__dropdown-status">
                  <span className="sellix-profile__dropdown-status-dot" />
                  Sesión activa
                </p>
              </div>
              <button type="button" className="sellix-profile__dropdown-item" onClick={handleLogout}>
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* ═══════════════════════════════════
           BUK-A HEADER — usa 100% variables CSS
           Sin colores hardcodeados ni media queries
           de prefers-color-scheme en los componentes
        ═══════════════════════════════════ */

        .sellix-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: grid;
          grid-template-columns: minmax(220px, 320px) minmax(280px, 1fr) auto;
          align-items: center;
          gap: 18px;
          padding: 14px 20px;
          margin: 12px 16px 0 16px;
          border: 1px solid var(--border);
          border-radius: var(--radius-xl, 20px);
          background: var(--surface);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          box-shadow: var(--shadow-lg);
          transition:
            background var(--transition-smooth),
            border-color var(--transition-smooth),
            box-shadow var(--transition-smooth);
          animation: topbarIn 380ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) both;
        }

        /* ── Intro ── */
        .sellix-topbar__intro {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sellix-topbar__eyebrow {
          font-size: var(--text-xs, 0.72rem);
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--text-tertiary);
          font-weight: 700;
        }

        .sellix-topbar__title {
          font-size: clamp(1.1rem, 0.9rem + 0.7vw, 1.6rem);
          line-height: 1.1;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text);
          margin: 0;
        }

        .sellix-topbar__subtitle {
          font-size: var(--text-xs, 0.72rem);
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 2px;
        }

        /* ── Search ── */
        .sellix-topbar__center { min-width: 0; }

        .sellix-search {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          min-height: 44px;
          padding: 0 12px;
          border-radius: var(--radius-lg, 14px);
          border: 1px solid var(--border);
          background: var(--surface-2, var(--surface));
          transition:
            border-color 180ms ease,
            box-shadow 180ms ease,
            transform 180ms ease,
            background var(--transition-smooth);
        }

        .sellix-search:focus-within {
          border-color: var(--border-strong);
          box-shadow: 0 0 0 3px var(--accent-soft);
          transform: translateY(-1px);
        }

        .sellix-search__icon {
          flex-shrink: 0;
          color: var(--text-tertiary);
        }

        .sellix-search__input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text);
          font-size: var(--text-sm, 0.8125rem);
          font-weight: 500;
        }

        .sellix-search__input::placeholder {
          color: var(--text-faint);
        }

        .sellix-search__shortcut {
          flex-shrink: 0;
          padding: 4px 7px;
          border-radius: 8px;
          background: var(--surface-hover);
          border: 1px solid var(--border);
          color: var(--text-tertiary);
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        /* ── Actions ── */
        .sellix-topbar__actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 8px;
        }

        .sellix-icon-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md, 10px);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            background 160ms ease,
            color 160ms ease;
        }

        .sellix-icon-btn--soft {
          background: var(--surface-hover);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .sellix-icon-btn:hover {
          transform: translateY(-1px);
          border-color: var(--border-strong);
          color: var(--text);
          background: var(--accent-soft);
        }

        .sellix-icon-btn__ping {
          position: absolute;
          top: 9px; right: 9px;
          width: 7px; height: 7px;
          border-radius: 9999px;
          background: var(--teal);
          box-shadow: 0 0 8px var(--teal-glow);
        }

        /* ── Profile ── */
        .sellix-profile { position: relative; }

        .sellix-profile__trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 44px;
          padding: 5px 10px 5px 5px;
          border-radius: var(--radius-lg, 14px);
          border: 1px solid var(--border);
          background: var(--surface-hover);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          transition:
            transform 160ms ease,
            border-color 160ms ease,
            background 160ms ease;
        }

        .sellix-profile__trigger:hover,
        .sellix-profile__trigger.is-open {
          transform: translateY(-1px);
          border-color: var(--border-strong);
          background: var(--accent-soft);
        }

        .sellix-profile__avatar-wrap {
          position: relative;
          width: 32px; height: 32px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid var(--border-strong);
        }

        .sellix-profile__avatar {
          width: 100%; height: 100%;
          object-fit: cover;
        }

        .sellix-profile__status {
          position: absolute;
          right: 1px; bottom: 1px;
          width: 8px; height: 8px;
          border-radius: 50%;
          border: 2px solid var(--surface-solid, var(--color-surface-solid));
          background: var(--teal);
          box-shadow: 0 0 8px var(--teal-glow);
        }

        .sellix-profile__meta {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
        }

        .sellix-profile__name {
          font-size: 0.82rem;
          color: var(--text);
          font-weight: 700;
          max-width: 130px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sellix-profile__role {
          font-size: 0.70rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* ── Dropdown ── */
        .sellix-profile__dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 230px;
          overflow: hidden;
          border-radius: var(--radius-lg, 14px);
          border: 1px solid var(--border-strong);
          background: var(--surface-solid, var(--color-surface-solid));
          backdrop-filter: blur(26px) saturate(190%);
          -webkit-backdrop-filter: blur(26px) saturate(190%);
          box-shadow: var(--shadow-float);
          animation: dropdownIn 200ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) both;
          transition: background var(--transition-smooth), border-color var(--transition-smooth);
        }

        .sellix-profile__dropdown-head {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border);
        }

        .sellix-profile__dropdown-name {
          color: var(--text);
          font-size: 0.86rem;
          font-weight: 700;
        }

        .sellix-profile__dropdown-status {
          margin-top: 5px;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          color: var(--teal);
          font-size: 0.72rem;
          font-weight: 600;
        }

        .sellix-profile__dropdown-status-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 6px currentColor;
        }

        .sellix-profile__dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          color: var(--danger);
          font-size: 0.82rem;
          font-weight: 600;
          transition: background 160ms ease;
        }

        .sellix-profile__dropdown-item:hover {
          background: var(--surface-hover);
        }

        /* ── Animations ── */
        @keyframes topbarIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Responsive ── */
        @media (max-width: 1180px) {
          .sellix-topbar {
            grid-template-columns: 1fr auto;
          }
          .sellix-topbar__center { display: none; }
          .sellix-hamburger { display: flex !important; }
        }

        @media (max-width: 760px) {
          .sellix-topbar {
            margin: 10px 10px 0 10px;
            padding: 10px 12px;
            border-radius: var(--radius-lg, 14px);
            grid-template-columns: 1fr auto;
          }
          .sellix-profile__meta,
          .sellix-topbar__subtitle {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
