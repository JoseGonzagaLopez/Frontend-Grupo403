"use client";
import { useState } from "react";
import ClienteSidebar from "@/components/layout/ClienteSidebar";
import Header from "@/components/layout/Header";
import { logOutCustomer } from "@/lib/actions";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      <ClienteSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="admin-main">
        <Header
          title="BookFlow"
          subtitle="Portal de cliente"
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          userName="Cliente"
          userRole="Cliente"
          onLogout={async () => {
            await logOutCustomer();
            window.location.href = "/login";
          }}
        />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
