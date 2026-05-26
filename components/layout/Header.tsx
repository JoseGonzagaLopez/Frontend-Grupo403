"use client";

import { ThemeToggle } from "@/components/ThemeToggle";
import { logOut } from "@/lib/actions";
import { useState, useRef, useEffect } from "react";
import { LogOut } from "lucide-react";

interface HeaderProps {
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
  userName?: string;
  userRole?: string;
  onLogout?: () => Promise<void>;
  hideHamburger?: boolean;
}

export default function Header({
  onMenuClick,
  title = "BookFlow Admin",
  subtitle = "Plataforma de gestión de reservas y cobros",
  userName = "Administrador",
  userRole = "Administrador",
  onLogout,
  hideHamburger = false,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      await logOut();
      window.location.href = "/login";
    }
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="admin-header">
      <div className="admin-header__left">
        {!hideHamburger && (
          <button 
            className="hamburger-btn" 
            onClick={onMenuClick} 
            aria-label="Abrir menú"
            title="Abrir menú"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}
        <span className="admin-header__title">{title}</span>
        <span className="admin-header__subtitle">{subtitle}</span>
      </div>
      <div className="admin-header__actions">
        <ThemeToggle />
        
        <div className="relative" ref={dropdownRef}>
          <img 
            src="/favicon.ico" 
            alt="Avatar" 
            className="admin-avatar cursor-pointer" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          
          {isDropdownOpen && (
            <div 
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                zIndex: 100,
                background: 'var(--surface-solid)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                marginTop: '4px',
                width: '200px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
                <p style={{ color: 'var(--text)', fontWeight: 600, fontSize: '14px' }}>{userName}</p>
                <p style={{ color: 'var(--success-text)', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-text)', display: 'inline-block' }}></span>
                  Sesión activa
                </p>
              </div>
              <div
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: 'var(--danger)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s',
                  background: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Cerrar sesión
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}