"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, CreditCard,
  Building2, ClipboardList,
} from "lucide-react";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Panel de control", href: "/dashboard",   icon: <LayoutDashboard size={20} />,  fanIcon: <LayoutDashboard size={22} />,  color: "#4fd1c5" },
  { label: "Reservas",         href: "/bookings",    icon: <CalendarDays    size={20} />,  fanIcon: <CalendarDays    size={22} />,  color: "#a78bfa" },
  { label: "Clientes",         href: "/customers",   icon: <Users           size={20} />,  fanIcon: <Users           size={22} />,  color: "#60a5fa" },
  { label: "Pagos",            href: "/payments",    icon: <CreditCard      size={20} />,  fanIcon: <CreditCard      size={22} />,  color: "#34d399" },
  { label: "Negocios",         href: "/negocios",    icon: <Building2       size={20} />,  fanIcon: <Building2       size={22} />,  color: "#fb923c" },
  { label: "Solicitudes",      href: "/solicitudes", icon: <ClipboardList   size={20} />,  fanIcon: <ClipboardList   size={22} />,  color: "#f472b6" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop sidebar (≥1024px) ───────────────────────── */}
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
              className={`admin-sidebar__link${
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? " admin-sidebar__link--active"
                  : ""
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Mobile FanMenu (<1024px) ──────────────────────────── */}
      <div className="fan-menu-container">
        <FanMenu
          items={menuItems.map(({ href, label, fanIcon, color }) => ({
            href, label, icon: fanIcon, color,
          }))}
          logoSrc="/favicon.ico"
        />
      </div>
    </>
  );
}
