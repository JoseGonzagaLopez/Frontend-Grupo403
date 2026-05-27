"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Home, CalendarPlus, CalendarDays } from "lucide-react";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Inicio",        href: "/inicio",      icon: <Home         size={20} />, fanIcon: <Home         size={22} />, color: "#4fd1c5" },
  { label: "Hacer reserva", href: "/reservar",     icon: <CalendarPlus size={20} />, fanIcon: <CalendarPlus size={22} />, color: "#a78bfa" },
  { label: "Mis reservas",  href: "/mis-reservas", icon: <CalendarDays size={20} />, fanIcon: <CalendarDays size={22} />, color: "#6c3fc4" },
];

export default function ClienteSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  return (
    <>
      <aside className="admin-sidebar glass-surface sidebar">
        <div className="admin-sidebar__brand">
          <h2 className="admin-sidebar__title">Buk-A</h2>
          <p className="admin-sidebar__subtitle">Portal de cliente</p>
        </div>
        <nav className="admin-sidebar__nav">
          {menuItems.map(({ href, label, icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={(e) => { e.preventDefault(); router.push(href); }}
                className={`admin-sidebar__link${active ? " admin-sidebar__link--active" : ""}`}
              >
                {icon}
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="fan-menu-container">
        <FanMenu
          items={menuItems.map(({ href, label, fanIcon, color }) => ({ href, label, icon: fanIcon, color }))}
          logoSrc="/favicon.ico"
        />
      </div>
    </>
  );
}
