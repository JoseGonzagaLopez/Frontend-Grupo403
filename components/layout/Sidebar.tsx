"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Building2, Users, FileCheck } from "lucide-react";

const menuItems = [
  { label: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { label: "Negocios", href: "/negocios", icon: Building2 },
  { label: "Usuarios", href: "/customers", icon: Users },
  { label: "Solicitudes", href: "/solicitudes", icon: FileCheck },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className={`admin-sidebar ${isOpen ? "admin-sidebar--open" : ""}`}>
      <div className="admin-sidebar__brand">
        <h2 className="admin-sidebar__title">BookFlow</h2>
        <p className="admin-sidebar__subtitle">Panel de administración</p>
      </div>

      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
