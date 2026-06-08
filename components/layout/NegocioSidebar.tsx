"use client";

import Sidebar from "@/components/layout/Sidebar";
import { Calendar, Scissors, Star, AlertTriangle, Gift } from "lucide-react";

const menuItems = [
  { label: "Reservas",  href: "/negocio/reservas",  icon: Calendar,       color: "#2dd4bf" },
  { label: "Servicios", href: "/negocio/servicios", icon: Scissors,       color: "#a78bfa" },
  { label: "Sorteos",   href: "/negocio/sorteos",   icon: Gift,           color: "#ec4899" },
  { label: "Reseñas",   href: "/negocio/resenas",   icon: Star,           color: "#fbbf24" },
  { label: "Deudas",    href: "/negocio/deudas",    icon: AlertTriangle,  color: "#f87171" },
];

interface NegocioSidebarProps {
  isOpen?: boolean;
  setIsOpen?: (open: boolean) => void;
  userName?: string;
  onLogout?: () => Promise<void>;
  onEditProfile?: () => Promise<void> | void;
}

export default function NegocioSidebar({ isOpen, setIsOpen, userName, onLogout, onEditProfile }: NegocioSidebarProps = {}) {
  return (
    <Sidebar
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      menuItems={menuItems}
      logoText="Mi Negocio"
      userName={userName}
      onLogout={onLogout}
      onEditProfile={onEditProfile}
    />
  );
}
