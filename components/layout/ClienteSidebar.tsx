"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, CalendarDays, Compass, UserCircle } from "lucide-react";

const menuItems = [
  { label: "Inicio", href: "/cliente", icon: Home, exact: true },
  { label: "Reservas", href: "/cliente/mis-reservas", icon: CalendarDays },
  { label: "Descubrir", href: "/cliente/descubrir", icon: Compass },
  { label: "Mi perfil", href: "/cliente/perfil", icon: UserCircle },
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
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
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
