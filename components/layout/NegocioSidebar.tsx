"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Scissors, Star } from "lucide-react";

const menuItems = [
  { label: "Reservas",  href: "/negocio/reservas",  icon: Calendar },
  { label: "Servicios", href: "/negocio/servicios", icon: Scissors },
  { label: "Reseñas",   href: "/negocio/resenas",   icon: Star },
];

interface Props { isOpen?: boolean; setIsOpen?: (v: boolean) => void; }

export default function NegocioSidebar({ isOpen, setIsOpen }: Props) {
  const pathname = usePathname();
  return (
    <aside className={`admin-sidebar ${isOpen ? "admin-sidebar--open" : ""}`}>
      <div className="admin-sidebar__brand">
        <h2 className="admin-sidebar__title">Buk-A</h2>
        <p className="admin-sidebar__subtitle">Portal de negocio</p>
      </div>
      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
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
