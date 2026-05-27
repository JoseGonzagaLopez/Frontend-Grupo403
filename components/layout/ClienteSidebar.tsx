"use client";

import { Home, CalendarPlus, CalendarDays } from "lucide-react";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Inicio",        href: "/inicio",      icon: <Home         size={22} />, color: "#4fd1c5" },
  { label: "Hacer reserva", href: "/reservar",     icon: <CalendarPlus size={22} />, color: "#a78bfa" },
  { label: "Mis reservas",  href: "/mis-reservas", icon: <CalendarDays size={22} />, color: "#6c3fc4" },
];

export default function ClienteSidebar() {
  return (
    <FanMenu
      items={menuItems.map(({ href, label, icon, color }) => ({ href, label, icon, color }))}
      logoSrc="/favicon.ico"
    />
  );
}
