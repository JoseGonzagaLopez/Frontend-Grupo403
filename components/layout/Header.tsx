import { ThemeToggle } from "@/components/ThemeToggle";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="admin-header">
      <div className="admin-header__left">
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
        <span className="admin-header__title">BookFlow Admin</span>
        <span className="admin-header__subtitle">Plataforma de gestión de reservas y cobros</span>
      </div>
      <div className="admin-header__actions">
        <ThemeToggle />
        <img src="/favicon.ico" alt="Avatar" className="admin-avatar" />
      </div>
    </header>
  );
}