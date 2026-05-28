"use client";

import { useState, useEffect } from "react";
import FanMenu from "@/components/FanMenu";
import { CalendarDays, Star, User } from "lucide-react";

const menuItems = [
  { label: "Mis reservas", href: "/cliente/reservas", icon: <CalendarDays size={22} />, color: "#4fd1c5" },
  { label: "Reseñas",      href: "/cliente/resenas",  icon: <Star         size={22} />, color: "#fbbf24" },
  { label: "Mi perfil",    href: "/cliente/perfil",   icon: <User         size={22} />, color: "#a78bfa" },
];

export default function ClienteSidebar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <FanMenu
      items={menuItems.map(({ href, label, icon, color }) => ({ href, label, icon, color }))}
    />
  );
}
