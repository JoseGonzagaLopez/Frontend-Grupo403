"use client";
import { useState, useEffect } from "react";
import NegocioSidebar from "@/components/layout/NegocioSidebar";
import NegocioHeader from "@/components/layout/NegocioHeader";
import { getBusinessSession } from "@/lib/actions";
import { getBusinesses } from "@/lib/api";
import type { Business } from "@/lib/api";

export default function NegocioLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const id = await getBusinessSession();
        if (!id) return;
        const list = await getBusinesses();
        setBusiness(list.find((b) => b.id === id) ?? null);
      } catch {}
    }
    load();
  }, []);

  return (
    <div className="admin-shell">
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      <NegocioSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="admin-main">
        <NegocioHeader
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          business={business}
        />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
