"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home } from "lucide-react";

const menuItems = [
  { label: "Hacer reserva", href: "/reservar", icon: Home },
  { label: "Mis reservas", href: "/cliente/mis-reservas", icon: CalendarDays },
];

interface Props { isOpen?: boolean; setIsOpen?: (v: boolean) => void; }

export default function ClienteSidebar({ isOpen, setIsOpen }: Props) {
  const pathname = usePathname();

  return (
    <aside className={`admin-sidebar ${isOpen ? "admin-sidebar--open" : ""}`}>
      <div className="admin-sidebar__brand">
        <h2 className="admin-sidebar__title">BookFlow</h2>
        <p className="admin-sidebar__subtitle">Portal de cliente</p>
      </div>

      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/reservar" && pathname.startsWith(item.href));
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
