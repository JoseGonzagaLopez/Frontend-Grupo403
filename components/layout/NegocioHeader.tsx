"use client";
import FanMenu, { type FanMenuItem } from "./FanMenu";
import { Calendar, Scissors, Star } from "lucide-react";

const FAN_ITEMS: FanMenuItem[] = [
  { label: "Reservas",  href: "/negocio/reservas",  icon: <Calendar size={20} /> },
  { label: "Servicios", href: "/negocio/servicios", icon: <Scissors size={20} /> },
  { label: "Reseñas",   href: "/negocio/resenas",   icon: <Star     size={20} /> },
];

interface Props { onMenuClick?: () => void; }

export default function NegocioHeader({ onMenuClick }: Props) {
  return (
    <header className="admin-header glass-surface">
      <div className="admin-header__left">
        {/* Abanico radial para el negocio */}
        <FanMenu items={FAN_ITEMS} />
        <span className="admin-header__title">Buk-A</span>
        <span className="admin-header__subtitle">Portal de negocio</span>
      </div>

    </header>
  );
}
