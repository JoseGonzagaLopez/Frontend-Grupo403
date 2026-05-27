"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Scissors, Star } from "lucide-react";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Reservas",  href: "/negocio/reservas",  Icon: Calendar },
  { label: "Servicios", href: "/negocio/servicios", Icon: Scissors },
  { label: "Reseñas",   href: "/negocio/resenas",   Icon: Star },
];

const fanItems = menuItems.map((item) => ({
  icon: <item.Icon size={20} />,
  label: item.label,
  href: item.href,
}));

export default function NegocioSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar (≥1024px) ── */}
      <aside className="admin-sidebar glass-surface sidebar">
        <div className="admin-sidebar__brand">
          <h2 className="admin-sidebar__title">Buk-A</h2>
          <p className="admin-sidebar__subtitle">Portal de negocio</p>
        </div>
        <nav className="admin-sidebar__nav">
          {menuItems.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className={`admin-sidebar__link ${
                pathname.startsWith(href) ? "admin-sidebar__link--active" : ""
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Mobile FanMenu (<1024px) ── */}
      <div className="fan-menu-container">
        <FanMenu items={fanItems} logoSrc="/favicon.ico" />
      </div>
    </>
  );
}
