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
      <div className="sellix-topbar__intro">
        <span className="sellix-topbar__eyebrow">Workspace</span>
        <div className="sellix-topbar__heading-wrap">
          <h1 className="sellix-topbar__title">{title}</h1>
          <p className="sellix-topbar__subtitle">{subtitle}</p>
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
        .sellix-topbar {
          position: sticky;
          top: 0;
          z-index: 40;
          display: grid;
          grid-template-columns: minmax(220px, 320px) minmax(280px, 1fr) auto;
          align-items: center;
          gap: 18px;
          padding: 18px 24px;
          margin: 14px 18px 0 18px;
          border: 1px solid var(--border, rgba(99,102,241,0.18));
          border-radius: var(--radius-xl, 22px);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
            var(--surface, rgba(18,20,40,0.72));
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          box-shadow: var(--shadow-lg, 0 10px 40px rgba(0,0,0,0.18));
          animation: topbarIn 380ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) both;
        }

        .sellix-topbar__intro {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sellix-topbar__eyebrow {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--text-tertiary, rgba(140,140,180,0.45));
          font-weight: 700;
        }

        .sellix-topbar__heading-wrap {
          min-width: 0;
        }

        .sellix-topbar__title {
          font-size: clamp(1.2rem, 1rem + 0.7vw, 1.75rem);
          line-height: 1.05;
          font-weight: 700;
          letter-spacing: -0.03em;
          color: var(--text, #e8e9f8);
          margin: 0;
        }

        .sellix-topbar__subtitle {
          margin-top: 4px;
          font-size: 0.84rem;
          color: var(--text-secondary, rgba(180,182,215,0.70));
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sellix-topbar__center {
          min-width: 0;
        }

        .sellix-search {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          min-height: 52px;
          padding: 0 14px;
          border-radius: 16px;
          border: 1px solid var(--border, rgba(99,102,241,0.18));
          background: rgba(255,255,255,0.05);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
          transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
        }

        .sellix-search:focus-within {
          border-color: var(--border-strong, rgba(99,102,241,0.32));
          box-shadow: 0 0 0 4px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.08);
          transform: translateY(-1px);
        }

        .sellix-search__icon {
          flex-shrink: 0;
          color: var(--text-tertiary, rgba(140,140,180,0.45));
        }

        .sellix-search__input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: var(--text, #e8e9f8);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .sellix-search__input::placeholder {
          color: var(--text-secondary, rgba(180,182,215,0.70));
        }

        .sellix-search__shortcut {
          flex-shrink: 0;
          padding: 5px 8px;
          border-radius: 10px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          color: var(--text-tertiary, rgba(140,140,180,0.45));
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .sellix-topbar__actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        .sellix-icon-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 14px;
          border: 1px solid var(--border, rgba(99,102,241,0.18));
          color: var(--text, #e8e9f8);
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease, box-shadow 180ms ease;
        }

        .sellix-icon-btn--soft {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
        }

        .sellix-icon-btn:hover {
          transform: translateY(-1px);
          border-color: var(--border-strong, rgba(99,102,241,0.32));
          background: rgba(255,255,255,0.09);
        }

        .sellix-icon-btn__ping {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 8px;
          height: 8px;
          border-radius: 9999px;
          background: var(--teal, #2dd4bf);
          box-shadow: 0 0 10px var(--teal-glow, rgba(45,212,191,0.25));
        }

        .sellix-profile {
          position: relative;
        }

        .sellix-profile__trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding: 6px 8px 6px 6px;
          border-radius: 16px;
          border: 1px solid var(--border, rgba(99,102,241,0.18));
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .sellix-profile__trigger:hover,
        .sellix-profile__trigger.is-open {
          transform: translateY(-1px);
          border-color: var(--border-strong, rgba(99,102,241,0.32));
          background: rgba(255,255,255,0.09);
        }

        .sellix-profile__avatar-wrap {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          overflow: hidden;
          flex-shrink: 0;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 8px 18px rgba(0,0,0,0.18);
        }

        .sellix-profile__avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .sellix-profile__status {
          position: absolute;
          right: 2px;
          bottom: 2px;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: 2px solid rgba(18,20,40,0.8);
          background: var(--teal, #2dd4bf);
          box-shadow: 0 0 10px var(--teal-glow, rgba(45,212,191,0.25));
        }

        .sellix-profile__meta {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 0;
        }

        .sellix-profile__name {
          font-size: 0.86rem;
          color: var(--text, #e8e9f8);
          font-weight: 700;
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sellix-profile__role {
          font-size: 0.74rem;
          color: var(--text-secondary, rgba(180,182,215,0.70));
          font-weight: 500;
        }

        .sellix-profile__dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 240px;
          overflow: hidden;
          border-radius: var(--radius-lg, 16px);
          border: 1px solid var(--border-strong, rgba(99,102,241,0.32));
          background:
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02)),
            var(--surface, rgba(18,20,40,0.78));
          backdrop-filter: blur(26px) saturate(190%);
          -webkit-backdrop-filter: blur(26px) saturate(190%);
          box-shadow: var(--shadow-float, 0 24px 64px rgba(0,0,0,0.24));
          animation: dropdownIn 220ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) both;
        }

        .sellix-profile__dropdown-head {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border, rgba(99,102,241,0.18));
        }

        .sellix-profile__dropdown-name {
          color: var(--text, #e8e9f8);
          font-size: 0.9rem;
          font-weight: 700;
        }

        .sellix-profile__dropdown-status {
          margin-top: 6px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--teal, #2dd4bf);
          font-size: 0.76rem;
          font-weight: 600;
        }

        .sellix-profile__dropdown-status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          box-shadow: 0 0 8px currentColor;
        }

        .sellix-profile__dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          color: var(--danger, #f87171);
          font-size: 0.86rem;
          font-weight: 600;
          transition: background 160ms ease, color 160ms ease;
        }

        .sellix-profile__dropdown-item:hover {
          background: var(--surface-2, rgba(26,28,55,0.60));
        }

        @keyframes topbarIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @media (max-width: 1180px) {
          .sellix-topbar {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .sellix-topbar__actions {
            justify-content: space-between;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 760px) {
          .sellix-topbar {
            margin: 12px 12px 0 12px;
            padding: 14px;
            border-radius: 18px;
          }

          .sellix-profile__meta,
          .sellix-search__shortcut,
          .sellix-topbar__subtitle {
            display: none;
          }

          .sellix-topbar__actions {
            gap: 8px;
            justify-content: flex-start;
          }

          .sellix-profile__trigger {
            padding-right: 6px;
          }
        }
      `}</style>
    </header>
  );
}
