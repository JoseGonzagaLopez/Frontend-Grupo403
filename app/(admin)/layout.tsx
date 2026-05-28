"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="admin-shell" data-mounted={mounted}>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="admin-main">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="admin-content">
          <div className="admin-content-inner">{children}</div>
        </main>
      </div>

      <style>{`
        /* ── Shell ── */
        .admin-shell {
          display: flex;
          min-height: 100dvh;
          background: var(--bg-page, #f5f6fa);
          font-family: var(--font-body, 'Inter', sans-serif);
          opacity: 0;
          transition: opacity 300ms ease;
        }
        .admin-shell[data-mounted="true"] {
          opacity: 1;
        }

        /* ── Mobile overlay ── */
        .sidebar-overlay {
          position: fixed;
          inset: 0;
          z-index: 40;
          background: rgba(15, 17, 40, 0.45);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          animation: overlayIn 200ms ease forwards;
        }
        @keyframes overlayIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        /* ── Main area ── */
        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          margin-left: 240px;
          min-width: 0;
          transition: margin-left 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        /* ── Content ── */
        .admin-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .admin-content-inner {
          padding: 28px 32px;
          max-width: 1600px;
          animation: contentFadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        @keyframes contentFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
          .admin-main {
            margin-left: 72px;
          }
        }
        @media (max-width: 640px) {
          .admin-main {
            margin-left: 0;
          }
          .admin-content-inner {
            padding: 16px;
          }
        }

        /* ── Scrollbar ── */
        .admin-content::-webkit-scrollbar {
          width: 4px;
        }
        .admin-content::-webkit-scrollbar-track {
          background: transparent;
        }
        .admin-content::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.25);
          border-radius: 99px;
        }
        .admin-content::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.45);
        }
      `}</style>
    </div>
  );
}
