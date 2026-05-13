"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const menuItems = [
  { label: "Panel de control", href: "/dashboard", icon: "◫" },
  { label: "Reservas", href: "/bookings", icon: "☰" },
  { label: "Clientes", href: "/customers", icon: "◎" },
  { label: "Negocios", href: "/negocios", icon: "◭" },
  { label: "Pagos", href: "/payments", icon: "◌" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">
        <h2 className="admin-sidebar__title">BookFlow</h2>
        <p className="admin-sidebar__subtitle">Admin workspace</p>
      </div>

      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="theme-toggle">
        <span className="theme-toggle__icon">{dark ? "🌙" : "☀️"}</span>
        <span className="theme-toggle__label">{dark ? "Modo oscuro" : "Modo claro"}</span>
        <label className="theme-toggle__switch">
          <input type="checkbox" checked={dark} onChange={toggleTheme} />
          <span className="theme-toggle__track" />
        </label>
      </div>
    </aside>
  );
}