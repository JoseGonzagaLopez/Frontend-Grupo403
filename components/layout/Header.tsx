"use client";

import { useState, useMemo } from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
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
  onMenuClick,
  hideHamburger,
  forceHamburger,
}: HeaderProps) {
  const [searchValue, setSearchValue] = useState("");

  const searchPlaceholder = useMemo(() => {
    return placeholderByTitle[title] ?? "Buscar cualquier cosa";
  }, [title]);

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
          /*grid-template-columns: 1fr auto;*/
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
          .sellix-topbar__subtitle {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
