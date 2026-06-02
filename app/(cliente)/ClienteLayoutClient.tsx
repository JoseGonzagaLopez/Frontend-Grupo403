"use client";
import Header from "@/components/layout/Header";
import { logOutCustomer } from "@/lib/actions";
import Sidebar from "@/components/layout/Sidebar";
import { Home, CalendarPlus, CalendarDays } from "lucide-react";

const clienteMenu = [
  { label: "Inicio", href: "/inicio", icon: Home },
  { label: "Hacer reserva", href: "/reservar", icon: CalendarPlus },
  { label: "Mis reservas", href: "/mis-reservas", icon: CalendarDays },
];

export default function ClienteLayoutClient({
  children,
  customerName,
}: {
  children: React.ReactNode;
  customerName: string;
}) {
  return (
    <div className="admin-shell cliente-shell">
      <Sidebar menuItems={clienteMenu} />
      <div className="admin-main">
        <Header
          title="Buk-A"
          subtitle="Portal de cliente"
          userName={customerName}
          onLogout={async () => {
            await logOutCustomer();
            window.location.href = "/login";
          }}
        />
        <main className="admin-content">{children}</main>
      </div>

      <style>{`
      .cliente-shell {
        display: flex;
        min-height: 100dvh;
      }
      .cliente-shell .admin-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-left: 0;
        min-width: 0;
      }
      .cliente-shell .admin-content {
        flex: 1;
        overflow-y: auto;
        padding: 28px 32px;
      }
    `}</style>
    </div>
  );
}