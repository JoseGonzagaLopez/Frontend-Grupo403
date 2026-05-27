"use client";
import { usePathname } from "next/navigation";
import { Calendar, Scissors, Star } from "lucide-react";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Reservas",  href: "/negocio/reservas",  icon: <Calendar size={22} />, color: "#4fd1c5" },
  { label: "Servicios", href: "/negocio/servicios", icon: <Scissors size={22} />, color: "#a78bfa" },
  { label: "Reseñas",   href: "/negocio/resenas",   icon: <Star    size={22} />, color: "#fbbf24" },
];

export default function NegocioSidebar() {
  const pathname = usePathname();
  return (
    <>
      {/* ── Desktop sidebar ──────────────────────────── */}
      <aside className="admin-sidebar glass-surface sidebar">
        <div className="admin-sidebar__brand">
          <h2 className="admin-sidebar__title">Buk-A</h2>
          <p className="admin-sidebar__subtitle">Portal de negocio</p>
        </div>
        <nav className="admin-sidebar__nav">
          {menuItems.map(({ href, label, icon }) => (
            <a
              key={href}
              href={href}
              className={`admin-sidebar__link ${
                pathname.startsWith(href) ? "admin-sidebar__link--active" : ""
              }`}
            >
              {icon}
              <span>{label}</span>
            </a>
          ))}
        </nav>
      </aside>

      {/* ── Mobile FanMenu ────────────────────────────── */}
      <div className="fan-menu-container">
        <FanMenu items={menuItems} logoSrc="/favicon.ico" />
      </div>
    </>
  );
}
