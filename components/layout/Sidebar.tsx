"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X, LogOut, Edit2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logOut } from "@/lib/actions";
import {
  LayoutDashboard, CalendarDays, Users,
  CreditCard, Building2, ClipboardList,
} from "lucide-react";

const defaultMenuItems = [
  { label: "Panel de control", href: "/dashboard", icon: LayoutDashboard, color: "#6366f1" },
  { label: "Reservas", href: "/bookings", icon: CalendarDays, color: "#2dd4bf" },
  { label: "Clientes", href: "/customers", icon: Users, color: "#a78bfa" },
  { label: "Pagos", href: "/payments", icon: CreditCard, color: "#f59e0b" },
  { label: "Negocios", href: "/negocios", icon: Building2, color: "#34d399" },
  { label: "Solicitudes", href: "/solicitudes", icon: ClipboardList, color: "#f472b6" },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  menuItems?: { label: string; href: string; icon: any; color?: string }[];
  logoText?: string;
  userName?: string;
  role?: string;
  onLogout?: () => Promise<void>;
  onEditProfile?: () => Promise<void> | void;
}

export default function Sidebar({
  isOpen,
  setIsOpen,
  menuItems,
  logoText = "Buk-A",
  userName = "Administrador",
  role,
  onLogout,
  onEditProfile,
}: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems ?? defaultMenuItems;

  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    if (onLogout) await onLogout();
    else {
      await logOut();
      window.location.href = "/login";
    }
  };

  const handleEditProfile = async () => {
    if (onEditProfile) {
      await onEditProfile();
      setDropOpen(false);
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
    <aside className={`sellix-sidebar${isOpen ? " sellix-sidebar--mobile-open" : ""}`}>
      <div className="sellix-sidebar__logo">
        <div className="sellix-sidebar__logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#2dd4bf" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="9" height="9" rx="2.5" fill="url(#logoGrad)" />
            <rect x="13" y="2" width="9" height="9" rx="2.5" fill="url(#logoGrad)" opacity="0.5" />
            <rect x="2" y="13" width="9" height="9" rx="2.5" fill="url(#logoGrad)" opacity="0.5" />
            <rect x="13" y="13" width="9" height="9" rx="2.5" fill="url(#logoGrad)" />
          </svg>
        </div>
        <span className="sellix-sidebar__logo-text">{logoText}</span>
        {setIsOpen && (
          <button
            className="sellix-sidebar__close"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="sellix-sidebar__divider" />

      <nav className="sellix-sidebar__nav">
        {items.map(({ label, href, icon: Icon, color = "#6366f1" }, i) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`sellix-sidebar__item${isActive ? " sellix-sidebar__item--active" : ""}`}
              style={{ animationDelay: `${i * 55}ms`, "--item-color": color } as React.CSSProperties}
              onClick={() => setIsOpen?.(false)}
            >
              <span className="sellix-sidebar__item-icon"><Icon size={18} /></span>
              <span className="sellix-sidebar__item-label">{label}</span>
              {isActive && <span className="sellix-sidebar__item-dot" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="sellix-sidebar__footer">
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
              {role ? <span className="sellix-profile__role">{role}</span> : null}
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
              {onEditProfile && (
                <button type="button" className="sellix-profile__dropdown-item sellix-profile__dropdown-item--edit" onClick={handleEditProfile}>
                  <Edit2 size={15} />
                  Editar perfil
                </button>
              )}
              <button type="button" className="sellix-profile__dropdown-item" onClick={handleLogout}>
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .sellix-sidebar { position:sticky; top:0; align-self:flex-start; width:240px; min-height:100vh; flex-shrink:0; z-index:10; display:flex; flex-direction:column; padding:20px 12px; background:var(--surface,rgba(18,20,40,0.72)); backdrop-filter:blur(28px) saturate(180%); -webkit-backdrop-filter:blur(28px) saturate(180%); border-right:1px solid var(--border,rgba(99,102,241,0.18)); box-shadow:4px 0 32px rgba(0,0,0,0.18),inset -1px 0 0 rgba(255,255,255,0.04); }
        .sellix-sidebar__logo { display:flex; align-items:center; gap:10px; padding:4px 8px 16px 8px; }
        .sellix-sidebar__logo-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, rgba(167,139,250,0.15) 0%, rgba(45,212,191,0.15) 100%); border: 1px solid rgba(167,139,250,0.30); display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 12px rgba(167,139,250,0.25), inset 0 1px 0 rgba(255,255,255,0.10); transition: box-shadow 200ms ease, transform 200ms ease; }
        .sellix-sidebar__logo-icon:hover { box-shadow: 0 4px 20px rgba(167,139,250,0.40), inset 0 1px 0 rgba(255,255,255,0.15); transform: scale(1.05); }
        .sellix-sidebar__logo-text { font-size: 1.0625rem; font-weight: 800; letter-spacing: -0.03em; background: linear-gradient(90deg, #a78bfa 0%, #2dd4bf 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; white-space: nowrap; overflow: hidden; }
        .sellix-sidebar__divider { height:1px; background:var(--border); margin:0 4px 12px 4px; }
        .sellix-sidebar__nav { display:flex; flex-direction:column; gap:2px; flex:1; }
        .sellix-sidebar__item { position:relative; display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:12px; text-decoration:none; color:var(--text-secondary); font-size:0.8125rem; font-weight:500; transition:all 200ms cubic-bezier(0.16,1,0.30,1); animation:sidebarItemIn 320ms cubic-bezier(0.16,1,0.30,1) both; overflow:hidden; cursor:pointer; }
        .sellix-sidebar__item::before { content:''; position:absolute; inset:0; border-radius:inherit; background:var(--item-color); opacity:0; transition:opacity 200ms ease; }
        .sellix-sidebar__item:hover { color:var(--text); background:var(--surface-hover); transform:translateX(2px); }
        .sellix-sidebar__item:hover::before { opacity:0.07; }
        .sellix-sidebar__item:hover .sellix-sidebar__item-icon { color:var(--item-color); filter:drop-shadow(0 0 6px var(--item-color)); }
        .sellix-sidebar__item--active { color:var(--text) !important; background:var(--accent-soft); border:1px solid var(--border-strong); box-shadow:0 2px 12px var(--accent-glow),inset 0 1px 0 rgba(255,255,255,0.06); }
        .sellix-sidebar__item--active::before { opacity:0.1 !important; }
        .sellix-sidebar__item--active .sellix-sidebar__item-icon { color:var(--item-color); filter:drop-shadow(0 0 6px var(--item-color)); }
        .sellix-sidebar__item-icon { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:20px; transition:color 200ms ease,filter 200ms ease; position:relative; z-index:1; }
        .sellix-sidebar__item-label { white-space:nowrap; overflow:hidden; text-overflow:ellipsis; position:relative; z-index:1; }
        .sellix-sidebar__item-dot { position:absolute; right:10px; width:6px; height:6px; border-radius:50%; background:var(--item-color); box-shadow:0 0 8px var(--item-color); animation:dotPulse 2s ease-in-out infinite; z-index:1; }
        .sellix-sidebar__close { display:none; padding:4px; border-radius:6px; color:var(--text-secondary); background:none; border:none; cursor:pointer; margin-left:auto; transition:background 150ms ease,color 150ms ease; }
        .sellix-sidebar__close:hover { background:var(--surface-hover); color:var(--text); }

        /* ── Footer ── */
        .sellix-sidebar__footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Profile ── */
        .sellix-profile { position: relative; flex: 1; min-width: 0; }

        .sellix-profile__trigger {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
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
          text-align: left;
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
          max-width: 110px;
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
          bottom: calc(100% + 8px); /* Open upwards */
          left: 0;
          width: 100%;
          min-width: 200px;
          overflow: hidden;
          border-radius: var(--radius-lg, 14px);
          border: 1px solid var(--border-strong);
          background: var(--surface-solid, var(--color-surface-solid));
          backdrop-filter: blur(26px) saturate(190%);
          -webkit-backdrop-filter: blur(26px) saturate(190%);
          box-shadow: var(--shadow-float);
          animation: dropdownInUp 200ms var(--ease-out, cubic-bezier(0.16,1,0.3,1)) both;
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
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .sellix-profile__dropdown-item:hover {
          background: var(--surface-hover);
        }

        .sellix-profile__dropdown-item--edit {
          color: var(--accent, var(--text));
        }

        @keyframes dropdownInUp {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes sidebarItemIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes dotPulse { 0%,100%{opacity:1}50%{opacity:0.6} }
      `}</style>
    </aside>
  );
}