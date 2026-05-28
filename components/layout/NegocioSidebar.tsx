"use client";

import { useState, useEffect } from "react";
import { Calendar, Scissors, Star } from "lucide-react";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Reservas",  href: "/negocio/reservas",  icon: <Calendar size={22} />, color: "#4fd1c5" },
  { label: "Servicios", href: "/negocio/servicios", icon: <Scissors size={22} />, color: "#a78bfa" },
  { label: "Reseñas",   href: "/negocio/resenas",   icon: <Star     size={22} />, color: "#fbbf24" },
];

export default function NegocioSidebar() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <FanMenu
      items={menuItems.map(({ href, label, icon, color }) => ({ href, label, icon, color }))}
    />
  );
}
