"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Panel de control", href: "/dashboard",   icon: "⬜" },
  { label: "Reservas",         href: "/bookings",    icon: "☰" },
  { label: "Clientes",         href: "/customers",   icon: "◎" },
  { label: "Pagos",            href: "/payments",    icon: "◌" },
  { label: "Negocios",         href: "/negocios",    icon: "✦" },
  { label: "Solicitudes",      href: "/solicitudes", icon: "⚑" },
];

const fanItems = menuItems.map((item) => ({
  icon: <span style={{ fontSize: 18 }}>{item.icon}</span>,
  label: item.label,
  href: item.href,
}));

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar (≥1024px) ── */}
      <aside className="admin-sidebar glass-surface sidebar">
        <div className="admin-sidebar__brand">
          <h2 className="admin-sidebar__title">Buk-A</h2>
          <p className="admin-sidebar__subtitle">Admin workspace</p>
        </div>
        <nav className="admin-sidebar__nav">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar__link ${
                pathname === item.href ? "admin-sidebar__link--active" : ""
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
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
