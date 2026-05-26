"use client";
import { useState } from "react";
import NegocioSidebar from "@/components/layout/NegocioSidebar";
import NegocioHeader from "@/components/layout/NegocioHeader";

export default function NegocioLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell">
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      <NegocioSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="admin-main">
        <NegocioHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
