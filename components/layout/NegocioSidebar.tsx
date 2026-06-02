"use client";

import Sidebar from "@/components/layout/Sidebar";
import { Calendar, Scissors, Star } from "lucide-react";

const menuItems = [
  { label: "Reservas",  href: "/negocio/reservas",  icon: Calendar, color: "#2dd4bf" },
  { label: "Servicios", href: "/negocio/servicios", icon: Scissors,  color: "#a78bfa" },
  { label: "Reseñas",   href: "/negocio/resenas",   icon: Star,      color: "#fbbf24" },
];

interface NegocioSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
}

export default function NegocioSidebar({ isOpen, setIsOpen }: NegocioSidebarProps = {}) {
  return (
    <Sidebar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      menuItems={menuItems}
      logoText="Mi Negocio"
    />
  );
}
