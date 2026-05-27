"use client";
import { useRouter, usePathname } from "next/navigation";
import { CalendarDays, CalendarPlus } from "lucide-react";

const menuItems = [
  { label: "Hacer reserva", href: "/reservar", icon: CalendarPlus },
  { label: "Mis reservas", href: "/mis-reservas", icon: CalendarDays },
  { label: "Pollas", href: "/mispollas", icon: CalendarDays },

];

interface Props { isOpen?: boolean; setIsOpen?: (v: boolean) => void; }

export default function ClienteSidebar({ isOpen, setIsOpen }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function handleNav(e: React.MouseEvent, href: string) {
    e.preventDefault();
    e.stopPropagation();
    if (setIsOpen) setIsOpen(false);
    setTimeout(() => router.push(href), 0);
  }

  return (
    <aside className={`admin-sidebar ${isOpen ? "admin-sidebar--open" : ""}`}>
      <div className="admin-sidebar__brand">
        <h2 className="admin-sidebar__title">BookFlow</h2>
        <p className="admin-sidebar__subtitle">Portal de cliente</p>
      </div>
      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNav(e, item.href)}
              className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
