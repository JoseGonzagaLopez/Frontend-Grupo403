"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
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
}

export default function Sidebar({ isOpen, setIsOpen, menuItems }: SidebarProps) {
  const pathname = usePathname();
  const items = menuItems ?? defaultMenuItems;

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
        <span className="sellix-sidebar__logo-text">Buk-A</span>
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

      <style>{`
        .sellix-sidebar { position:relative; width:240px; min-height:100vh; flex-shrink:0; z-index:10; display:flex; flex-direction:column; padding:20px 12px; background:var(--surface,rgba(18,20,40,0.72)); backdrop-filter:blur(28px) saturate(180%); -webkit-backdrop-filter:blur(28px) saturate(180%); border-right:1px solid var(--border,rgba(99,102,241,0.18)); box-shadow:4px 0 32px rgba(0,0,0,0.18),inset -1px 0 0 rgba(255,255,255,0.04); }
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
        @keyframes sidebarItemIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes dotPulse { 0%,100%{opacity:1}50%{opacity:0.6} }
      `}</style>
    </aside>
  );
}