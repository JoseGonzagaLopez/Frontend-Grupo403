"use client";

import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-shell" suppressHydrationWarning>
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          suppressHydrationWarning
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="admin-main" suppressHydrationWarning>
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
