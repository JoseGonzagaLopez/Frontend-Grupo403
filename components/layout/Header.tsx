import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
  return (
    <header className="admin-header">
      <div className="admin-header__left">
        <span className="admin-header__title">BookFlow Admin</span>
        <span className="admin-header__subtitle">Plataforma de gestión de reservas y cobros</span>
      </div>
      <div className="admin-header__actions">
        <ThemeToggle />
        <div className="admin-avatar" aria-hidden="true">BF</div>
      </div>
    </header>
  );
}