"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
          {/* Mobile close */}
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
            <div className="buka-sidebar__user-avatar" aria-hidden="true">
              A
            </div>
            <div className="buka-sidebar__user-info">
              <span className="buka-sidebar__user-name">Admin</span>
              <span className="buka-sidebar__user-role">Super Admin</span>
            </div>
          </div>
        </div>
      </aside>

      <style>{`
        /* ════════════════════════════════
           BUK-A SIDEBAR  —  Sellix Style
           Liquid Glass + clean indigo
        ════════════════════════════════ */

        .buka-sidebar {
          position: fixed;
          left: 0; top: 0; bottom: 0;
          width: 240px;
          z-index: 50;
          display: flex;
          flex-direction: column;
          padding: 20px 12px 16px;
          gap: 0;

          /* Liquid Glass base */
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(24px) saturate(160%) brightness(1.04);
          -webkit-backdrop-filter: blur(24px) saturate(160%) brightness(1.04);
          border-right: 1px solid rgba(99, 102, 241, 0.10);
          box-shadow:
            1px 0 0 rgba(255,255,255,0.6) inset,
            4px 0 24px rgba(99,102,241,0.06);

          transition: transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* Dark mode */
        [data-theme="dark"] .buka-sidebar {
          background: rgba(17, 18, 36, 0.88);
          border-right-color: rgba(99,102,241,0.16);
          box-shadow:
            1px 0 0 rgba(255,255,255,0.04) inset,
            4px 0 32px rgba(0,0,0,0.24);
        }

        /* ── Logo ── */
        .buka-sidebar__logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 2px 8px 18px 8px;
          border-bottom: 1px solid rgba(99,102,241,0.10);
          margin-bottom: 12px;
        }
        .buka-sidebar__logo-mark {
          width: 36px; height: 36px;
          border-radius: 10px;
          background: rgba(99,102,241,0.10);
          border: 1px solid rgba(99,102,241,0.20);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          /* Liquid Glass icon background */
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          box-shadow: 0 2px 8px rgba(99,102,241,0.18), inset 0 1px 0 rgba(255,255,255,0.35);
          transition: box-shadow 200ms ease;
        }
        .buka-sidebar__logo-mark:hover {
          box-shadow: 0 4px 16px rgba(99,102,241,0.30), inset 0 1px 0 rgba(255,255,255,0.45);
        }
        .buka-sidebar__logo-text {
          font-size: 1.0625rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #1e1f3b;
          flex: 1;
        }
        [data-theme="dark"] .buka-sidebar__logo-text { color: #e8e9f4; }
        .buka-sidebar__close {
          display: none;
          padding: 4px;
          border-radius: 6px;
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
          margin-left: auto;
          transition: background 150ms ease, color 150ms ease;
        }
        .buka-sidebar__close:hover {
          background: rgba(99,102,241,0.08);
          color: #6366f1;
        }

        /* ── Nav ── */
        .buka-sidebar__nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: none;
        }
        .buka-sidebar__nav::-webkit-scrollbar { display: none; }

        /* ── Nav item ── */
        .buka-sidebar__item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 12px;
          text-decoration: none;
          color: #6b7280;
          font-size: 0.8125rem;
          font-weight: 500;
          letter-spacing: 0.005em;
          white-space: nowrap;
          overflow: hidden;
          cursor: pointer;

          /* entry animation */
          animation: sidebarItemIn 280ms cubic-bezier(0.16, 1, 0.3, 1) both;

          /* glass micro-effect */
          transition:
            color 160ms ease,
            background 160ms ease,
            transform 160ms ease,
            box-shadow 160ms ease;
        }
        @keyframes sidebarItemIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .buka-sidebar__item:hover {
          color: #4f46e5;
          background: rgba(99,102,241,0.07);
          transform: translateX(2px);
        }
        .buka-sidebar__item:active {
          transform: translateX(1px) scale(0.99);
        }

        /* ── Active state — solid indigo pill ── */
        .buka-sidebar__item--active {
          color: #fff !important;
          background: #6366f1 !important;
          box-shadow:
            0 4px 16px rgba(99,102,241,0.35),
            inset 0 1px 0 rgba(255,255,255,0.20);
          transform: none !important;
        }
        .buka-sidebar__item--active:hover {
          background: #4f46e5 !important;
          transform: none !important;
        }
        [data-theme="dark"] .buka-sidebar__item { color: rgba(180,183,220,0.70); }
        [data-theme="dark"] .buka-sidebar__item:hover {
          color: #a5b4fc;
          background: rgba(99,102,241,0.12);
        }

        .buka-sidebar__item-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 20px;
          transition: transform 200ms ease;
        }
        .buka-sidebar__item:hover .buka-sidebar__item-icon {
          transform: scale(1.10);
        }
        .buka-sidebar__item--active .buka-sidebar__item-icon {
          transform: none;
        }

        .buka-sidebar__item-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: opacity 200ms ease;
        }

        /* ── Footer / User pill ── */
        .buka-sidebar__footer {
          padding-top: 12px;
          border-top: 1px solid rgba(99,102,241,0.10);
          margin-top: 4px;
        }
        .buka-sidebar__user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 12px;
          cursor: pointer;
          transition: background 160ms ease;
        }
        .buka-sidebar__user:hover {
          background: rgba(99,102,241,0.07);
        }
        .buka-sidebar__user-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(99,102,241,0.30);
        }
        .buka-sidebar__user-info {
          display: flex;
          flex-direction: column;
          gap: 1px;
          overflow: hidden;
        }
        .buka-sidebar__user-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: #1e1f3b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .buka-sidebar__user-role {
          font-size: 0.6875rem;
          color: #9ca3af;
          white-space: nowrap;
        }
        [data-theme="dark"] .buka-sidebar__user-name { color: #e8e9f4; }

        /* ════════════════════════════════
           RESPONSIVE
        ════════════════════════════════ */

        /* Collapsed on medium screens */
        @media (max-width: 1024px) {
          .buka-sidebar {
            width: 72px;
          }
          .buka-sidebar__logo-text,
          .buka-sidebar__item-label,
          .buka-sidebar__user-info {
            opacity: 0;
            pointer-events: none;
            width: 0;
          }
          .buka-sidebar__close {
            display: none;
          }
          .buka-sidebar__item {
            justify-content: center;
            padding: 10px;
          }
          .buka-sidebar__user {
            justify-content: center;
          }
          .buka-sidebar__logo {
            justify-content: center;
          }
        }

        /* Hidden on mobile — slides in when open */
        @media (max-width: 640px) {
          .buka-sidebar {
            width: 260px;
            transform: translateX(-100%);
          }
          .buka-sidebar--mobile-open {
            transform: translateX(0);
          }
          .buka-sidebar__logo-text,
          .buka-sidebar__item-label,
          .buka-sidebar__user-info {
            opacity: 1 !important;
            pointer-events: auto !important;
            width: auto !important;
          }
          .buka-sidebar__close {
            display: flex;
          }
          .buka-sidebar__item {
            justify-content: flex-start;
            padding: 9px 12px;
          }
          .buka-sidebar__user {
            justify-content: flex-start;
          }
          .buka-sidebar__logo {
            justify-content: flex-start;
          }
        }
      `}</style>
    </>
  );
}
