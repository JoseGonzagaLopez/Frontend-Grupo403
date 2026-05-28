"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users,
  CreditCard, Building2, ClipboardList,
} from "lucide-react";
import FanMenu from "@/components/FanMenu";

const menuItems = [
  { label: "Panel de control", href: "/dashboard",   icon: <LayoutDashboard size={22} />, color: "#4fd1c5" },
  { label: "Reservas",         href: "/bookings",    icon: <CalendarDays    size={22} />, color: "#a78bfa" },
  { label: "Clientes",         href: "/customers",   icon: <Users           size={22} />, color: "#60a5fa" },
  { label: "Pagos",            href: "/payments",    icon: <CreditCard      size={22} />, color: "#34d399" },
  { label: "Negocios",         href: "/negocios",    icon: <Building2       size={22} />, color: "#fb923c" },
  { label: "Solicitudes",      href: "/solicitudes", icon: <ClipboardList   size={22} />, color: "#f472b6" },
];

interface SidebarProps {
  isOpen?: boolean;
  setIsOpen?: (v: boolean) => void;
}

export default function Sidebar({ isOpen: _isOpen, setIsOpen: _setIsOpen }: SidebarProps) {
  const [mounted, setMounted] = useState(false);
  const _pathname = usePathname();
  void _pathname;

  useEffect(() => { setMounted(true); }, []);

  // No renderizar nada en SSR para evitar hydration mismatch con createPortal
  if (!mounted) return null;

  return (
    <FanMenu
      items={menuItems.map(({ href, label, icon, color }) => ({ href, label, icon, color }))}
    />
  );
}
