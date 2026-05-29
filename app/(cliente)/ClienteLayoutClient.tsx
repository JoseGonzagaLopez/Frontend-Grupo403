"use client";
import { useState } from "react";
import ClienteSidebar from "@/components/layout/ClienteSidebar";
import Header from "@/components/layout/Header";
import { logOutCustomer } from "@/lib/actions";

export default function ClienteLayoutClient({
  children,
  customerName,
}: {
  children: React.ReactNode;
  customerName: string;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      <ClienteSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="admin-main">
        <Header
          title="Buk-A"
          subtitle="Portal de cliente"
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          userName={customerName}
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
