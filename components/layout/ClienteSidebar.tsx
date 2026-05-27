"use client";
import { useRouter, usePathname } from "next/navigation";
import { CalendarDays, CalendarPlus, Home } from "lucide-react";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Inicio",        href: "/inicio",      Icon: Home },
  { label: "Hacer reserva", href: "/reservar",     Icon: CalendarPlus },
  { label: "Mis reservas",  href: "/mis-reservas", Icon: CalendarDays },
];

const fanItems = menuItems.map((item) => ({
  icon: <item.Icon size={20} />,
  label: item.label,
  href: item.href,
}));

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
      {/* ── Desktop sidebar (≥1024px) ── */}
      <aside className="admin-sidebar glass-surface sidebar">
        <div className="admin-sidebar__brand">
          <h2 className="admin-sidebar__title">Buk-A</h2>
          <p className="admin-sidebar__subtitle">Portal de cliente</p>
        </div>
        <nav className="admin-sidebar__nav">
          {menuItems.map(({ href, label, Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <a
                key={href}
                href={href}
                onClick={(e) => handleNav(e, href)}
                className={`admin-sidebar__link ${
                  isActive ? "admin-sidebar__link--active" : ""
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile FanMenu (<1024px) ── */}
      <div className="fan-menu-container">
        <FanMenu items={fanItems} logoSrc="/favicon.ico" />
      </div>
    </>
  );
}
