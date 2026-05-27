"use client";
import { useRouter, usePathname } from "next/navigation";
import { CalendarDays, CalendarPlus, Home } from "lucide-react";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Inicio",        href: "/inicio",      icon: <Home        size={22} />, color: "#4fd1c5" },
  { label: "Hacer reserva", href: "/reservar",     icon: <CalendarPlus size={22} />, color: "#a78bfa" },
  { label: "Mis reservas",  href: "/mis-reservas", icon: <CalendarDays size={22} />, color: "#6c3fc4" },
];

export default function ClienteSidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  function handleNav(e: React.MouseEvent, href: string) {
    e.preventDefault();
    e.stopPropagation();
    router.push(href);
  }

  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────── */}
      <aside className="admin-sidebar glass-surface sidebar">
        <div className="admin-sidebar__brand">
          <h2 className="admin-sidebar__title">Buk-A</h2>
          <p className="admin-sidebar__subtitle">Portal de cliente</p>
        </div>
        <nav className="admin-sidebar__nav">
          {menuItems.map(({ href, label, icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNav(e, href)}
                className={`admin-sidebar__link ${
                  isActive ? "admin-sidebar__link--active" : ""
                }`}
              >
                {icon}
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile FanMenu ────────────────────────────── */}
      <div className="fan-menu-container">
        <FanMenu items={menuItems} logoSrc="/favicon.ico" />
      </div>
    </>
  );
}
