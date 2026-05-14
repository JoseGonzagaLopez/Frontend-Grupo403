import { ThemeToggle } from "@/components/ThemeToggle";

export default function Header() {
    return (
      <header
        style={{
          backgroundColor: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: "var(--text)" }}>Bookings Admin</h1>
          <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: "14px" }}>
            Plataforma de gestión de reservas y cobros
          </p>
        </div>
        <ThemeToggle />
      </header>
    );
  }