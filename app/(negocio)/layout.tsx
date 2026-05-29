"use client";
import { useState } from "react";
import NegocioSidebar from "@/components/layout/NegocioSidebar";
import Header from "@/components/layout/Header";
import FanMenu from "@/components/FanMenu";
import { Calendar, Scissors, Star } from "lucide-react";
import { logOutBusiness } from "@/lib/actions";

const FAN_ITEMS = [
  { label: "Reservas",  href: "/negocio/reservas",  icon: <Calendar size={20} /> },
  { label: "Servicios", href: "/negocio/servicios", icon: <Scissors size={20} /> },
  { label: "Reseñas",   href: "/negocio/resenas",   icon: <Star     size={20} /> },
];

export default function NegocioLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell" style={{ display: "block" }}>
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      <NegocioSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="admin-main">
        <Header 
          title="Mi Negocio" 
          subtitle="Portal de gestión" 
          userName="Negocio" 
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          forceHamburger={true}
          onLogout={async () => {
             await logOutBusiness();
             window.location.href = "/login";
          }}
        />
        <main className="admin-content">{children}</main>
        <FanMenu items={FAN_ITEMS} />
      </div>
    </div>
  );
}
