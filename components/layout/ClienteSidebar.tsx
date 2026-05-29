"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, CalendarPlus, CalendarDays } from "lucide-react";

const menuItems = [
  { label: "Inicio",        href: "/inicio",       icon: Home,         color: "#2dd4bf" },
  { label: "Hacer reserva", href: "/reservar",      icon: CalendarPlus, color: "#a78bfa" },
  { label: "Mis reservas",  href: "/mis-reservas",  icon: CalendarDays, color: "#6366f1" },
];

interface ClienteSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function ClienteSidebar({ isOpen, setIsOpen }: ClienteSidebarProps = {}) {
  const pathname = usePathname();

  return (
    <aside className={`sellix-sidebar sellix-sidebar--cliente${isOpen ? " sellix-sidebar--mobile-open" : ""}`}>
      <div className="sellix-sidebar__logo">
        <div className="sellix-sidebar__logo-icon">
          <Image src="/favicon.ico" alt="Buk-A" width={32} height={32} priority />
        </div>
        <span className="sellix-sidebar__logo-text">Buk-A</span>
      </div>

      <div className="sellix-sidebar__divider" />

      <nav className="sellix-sidebar__nav" aria-label="Navegación cliente">
        {menuItems.map(({ label, href, icon: Icon, color }, i) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`sellix-sidebar__item${isActive ? " sellix-sidebar__item--active" : ""}`}
              style={{ animationDelay: `${i * 55}ms`, "--item-color": color } as React.CSSProperties}
            >
              <span className="sellix-sidebar__item-icon"><Icon size={18} /></span>
              <span className="sellix-sidebar__item-label">{label}</span>
              {isActive && <span className="sellix-sidebar__item-dot" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <style>{`
        .sellix-sidebar { position:fixed; left:0; top:0; bottom:0; width:var(--sidebar-width,240px); z-index:50; display:flex; flex-direction:column; padding:20px 12px; background:var(--surface,rgba(18,20,40,0.72)); backdrop-filter:blur(28px) saturate(180%); -webkit-backdrop-filter:blur(28px) saturate(180%); border-right:1px solid var(--border,rgba(99,102,241,0.18)); box-shadow:4px 0 32px rgba(0,0,0,0.18),inset -1px 0 0 rgba(255,255,255,0.04); }
        .sellix-sidebar__logo { display:flex; align-items:center; gap:10px; padding:4px 8px 16px 8px; }
        .sellix-sidebar__logo-icon { width:36px; height:36px; border-radius:10px; background:var(--accent-soft); border:1px solid var(--border-strong); display:flex; align-items:center; justify-content:center; flex-shrink:0; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); box-shadow:0 2px 12px var(--accent-glow),inset 0 1px 0 rgba(255,255,255,0.12); }
        .sellix-sidebar__logo-icon img { border-radius:6px; object-fit:cover; }
        .sellix-sidebar__logo-text { font-size:1rem; font-weight:700; letter-spacing:-0.01em; color:var(--text); white-space:nowrap; overflow:hidden; }
        .sellix-sidebar__divider { height:1px; background:var(--border); margin:0 4px 12px 4px; }
        .sellix-sidebar__nav { display:flex; flex-direction:column; gap:2px; flex:1; }
        .sellix-sidebar__item { position:relative; display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:var(--radius-md,12px); text-decoration:none; color:var(--text-secondary); font-size:0.8125rem; font-weight:500; transition:all 200ms cubic-bezier(0.16,1,0.30,1); animation:sidebarItemIn 320ms cubic-bezier(0.16,1,0.30,1) both; overflow:hidden; cursor:pointer; }
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
        @keyframes sidebarItemIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
        @keyframes dotPulse { 0%,100%{opacity:1}50%{opacity:0.6} }
        @media(max-width:1024px){.sellix-sidebar{width:var(--sidebar-collapsed,72px)}.sellix-sidebar__logo-text,.sellix-sidebar__item-label,.sellix-sidebar__item-dot{opacity:0;pointer-events:none}.sellix-sidebar__item{justify-content:center;padding:10px}.sellix-sidebar__item-icon{width:22px}}
        @media(max-width:640px){
          .sellix-sidebar {
            transform: translateX(-100%);
            transition: transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
          }
          .sellix-sidebar--mobile-open {
            transform: translateX(0);
          }
          .sellix-sidebar__logo-text, .sellix-sidebar__item-label {
            opacity: 1 !important;
            pointer-events: auto !important;
            width: auto !important;
          }
          .sellix-sidebar__item {
            justify-content: flex-start !important;
            padding: 9px 12px !important;
          }
          .sellix-sidebar__logo {
            justify-content: flex-start !important;
          }
        }
      `}</style>
    </aside>
  );
}
