"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NegocioSidebar from "@/components/layout/NegocioSidebar";
import Header from "@/components/layout/Header";
import { Calendar, Scissors, Star } from "lucide-react";
import { logOutBusiness } from "@/lib/actions";

export default function NegocioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
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
          onEditProfile={() => router.push("/negocio/perfil")}
          onLogout={async () => {
             await logOutBusiness();
             window.location.href = "/login";
          }}
        />
        <main className="admin-content">{children}</main>
      </div>

      <style>{`
        .admin-shell {
          display: flex;
          min-height: 100dvh;
          background: transparent;
          font-family: var(--font-body, 'Inter', sans-serif);
        }
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: rgba(15, 17, 40, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .admin-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 28px 32px;
        }
      `}</style>
    </div>
  );
}
