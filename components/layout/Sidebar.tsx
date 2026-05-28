"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  CreditCard,
  Building2,
  ClipboardList,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

const menuItems = [
  { label: "Panel de control", href: "/dashboard",    icon: LayoutDashboard },
  { label: "Reservas",          href: "/bookings",     icon: CalendarDays    },
  { label: "Clientes",          href: "/customers",    icon: Users           },
  { label: "Pagos",             href: "/payments",     icon: CreditCard      },
  { label: "Negocios",          href: "/negocios",     icon: Building2       },
  { label: "Solicitudes",       href: "/solicitudes",  icon: ClipboardList   },
];

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <aside
        className={`buka-sidebar${
          isOpen ? " buka-sidebar--mobile-open" : ""
        }`}
        aria-label="Navegación principal"
      >
        {/* ── Logo ── */}
        <div className="buka-sidebar__logo">
          <div className="buka-sidebar__logo-mark">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="2" y="2" width="9" height="9" rx="2.5" fill="#6366f1" />
              <rect x="13" y="2" width="9" height="9" rx="2.5" fill="#a5b4fc" opacity="0.7" />
              <rect x="2" y="13" width="9" height="9" rx="2.5" fill="#a5b4fc" opacity="0.7" />
              <rect x="13" y="13" width="9" height="9" rx="2.5" fill="#6366f1" />
            </svg>
          </div>
          <span className="buka-sidebar__logo-text">Buk-A</span>
          {setIsOpen && (
            <button
              className="buka-sidebar__close"
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Nav ── */}
        <nav className="buka-sidebar__nav">
          {menuItems.map(({ label, href, icon: Icon }, i) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={`buka-sidebar__item${
                  isActive ? " buka-sidebar__item--active" : ""
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setIsOpen?.(false)}
              >
                <span className="buka-sidebar__item-icon">
                  <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
                </span>
                <span className="buka-sidebar__item-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ── User pill at bottom ── */}
        <div className="buka-sidebar__footer">
          <div className="buka-sidebar__user">
            <div className="buka-sidebar__user-avatar" aria-hidden="true">A</div>
            <div className="buka-sidebar__user-info">
              <span className="buka-sidebar__user-name">Admin</span>
              <span className="buka-sidebar__user-role">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        /* ════════════════════════════════
           BUK-A SIDEBAR — Sellix Style
           Usa 100% variables CSS del tema
        ════════════════════════════════ */

        .buka-sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: var(--sidebar-width, 240px);
          z-index: 50;
          display: flex;
          flex-direction: column;
          padding: 20px 12px 16px;
          gap: 0;

          background: var(--surface);
          backdrop-filter: blur(24px) saturate(160%) brightness(1.02);
          -webkit-backdrop-filter: blur(24px) saturate(160%) brightness(1.02);
          border-right: 1px solid var(--border);
          box-shadow:
            1px 0 0 rgba(255,255,255,0.5) inset,
            4px 0 24px rgba(0,0,0,0.06);

          transition: transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      background var(--transition-smooth),
                      border-color var(--transition-smooth);
        }

        /* ── Logo ── */
        .buka-sidebar__logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 2px 8px 18px 8px;
          border-bottom: 1px solid var(--border);
          margin-bottom: 12px;
        }

        .buka-sidebar__logo-mark {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: var(--accent-soft);
          border: 1px solid var(--border-strong);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px var(--accent-glow);
        }

        .buka-sidebar__logo-text {
          font-size: 1.05rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text);
          flex: 1;
        }

        .buka-sidebar__close {
          margin-left: auto;
          display: none;
          width: 28px; height: 28px;
          border-radius: 8px;
          align-items: center; justify-content: center;
          color: var(--text-secondary);
          transition: background 160ms ease, color 160ms ease;
        }

        .buka-sidebar__close:hover {
          background: var(--surface-hover);
          color: var(--text);
        }

        /* ── Nav ── */
        .buka-sidebar__nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .buka-sidebar__item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 10px 12px;
          border-radius: var(--radius-lg, 14px);
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          transition:
            background 160ms ease,
            color 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
          animation: sidebarItemIn 280ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) both;
          position: relative;
        }

        .buka-sidebar__item:hover {
          background: var(--surface-hover);
          color: var(--text);
          transform: translateX(2px);
        }

        .buka-sidebar__item--active {
          background: var(--accent-soft);
          color: var(--accent);
          font-weight: 700;
          box-shadow: inset 0 0 0 1px var(--border-strong);
        }

        .buka-sidebar__item--active:hover {
          background: var(--accent-soft);
          transform: translateX(2px);
        }

        .buka-sidebar__item-icon {
          width: 32px; height: 32px;
          border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background 160ms ease;
        }

        .buka-sidebar__item--active .buka-sidebar__item-icon {
          background: var(--accent-soft);
        }

        .buka-sidebar__item-label {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── Footer ── */
        .buka-sidebar__footer {
          padding-top: 14px;
          margin-top: 8px;
          border-top: 1px solid var(--border);
        }

        .buka-sidebar__user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-lg, 14px);
          background: var(--surface-hover);
          border: 1px solid var(--border);
          transition: background 160ms ease, border-color 160ms ease;
          cursor: default;
        }

        .buka-sidebar__user:hover {
          background: var(--accent-soft);
          border-color: var(--border-strong);
        }

        .buka-sidebar__user-avatar {
          width: 32px; height: 32px;
          border-radius: 9px;
          background: var(--accent);
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .buka-sidebar__user-info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .buka-sidebar__user-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .buka-sidebar__user-role {
          font-size: 0.70rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        /* ── Mobile overlay ── */
        @media (max-width: 768px) {
          .buka-sidebar {
            transform: translateX(-100%);
          }

          .buka-sidebar--mobile-open {
            transform: translateX(0);
          }

          .buka-sidebar__close {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
