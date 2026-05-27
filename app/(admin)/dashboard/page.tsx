import Link from 'next/link';
import { getBusinesses, getCustomers, getPendingProfileChanges } from '@/lib/api';
import ErrorView from '@/components/ErrorView';

export default async function AdminDashboardPage() {
  try {
    const [businesses, customers, solicitudes] = await Promise.all([
      getBusinesses(),
      getCustomers(),
      getPendingProfileChanges(),
    ]);

    const pendingSolicitudes = solicitudes.filter(s => s.estado === 'pending');

    const stats = [
      {
        label: "Negocios registrados",
        value: businesses.length,
        sub: "Total en la plataforma",
        href: "/negocios",
        icon: "🏢",
        color: "var(--accent)",
      },
      {
        label: "Usuarios",
        value: customers.length,
        sub: "Clientes activos",
        href: "/customers",
        icon: "👥",
        color: "#8b5cf6",
      },
      {
        label: "Solicitudes pendientes",
        value: pendingSolicitudes.length,
        sub: pendingSolicitudes.length > 0 ? "Requieren revisión" : "Todo al día",
        href: "/solicitudes",
        icon: "📋",
        color: pendingSolicitudes.length > 0 ? "#e8a800" : "var(--success-text)",
      },
    ];

    return (
      <div className="page-stack">
        <section className="page-hero">
          <div>
            <h2>Panel de administración</h2>
            <p>Supervisa negocios, usuarios y aprueba cambios de perfil.</p>
          </div>
        </section>

        {/* KPI Cards */}
        <section className="kpi-grid">
          {stats.map((s) => (
            <Link key={s.href} href={s.href} style={{ textDecoration: "none" }}>
              <div className="kpi-card hover-lift" style={{ cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <p className="kpi-card__label">{s.label}</p>
                  <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                </div>
                <h3 className="kpi-card__value" style={{ color: s.color }}>{s.value}</h3>
                <p className="kpi-card__meta">{s.sub}</p>
              </div>
            </Link>
          ))}
        </section>

        {/* Accesos rápidos */}
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Accesos rápidos</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}>
            <Link href="/negocios" style={{ textDecoration: "none" }}>
              <div className="hover-card-accent" style={{ padding: "20px 24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer", transition: "all 0.15s" }}>
                <span style={{ fontSize: "1.75rem" }}>🏢</span>
                <p style={{ fontWeight: 700, color: "var(--text)", fontSize: "var(--text-sm)" }}>Gestionar negocios</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Ver, crear o desactivar negocios de la plataforma</p>
              </div>
            </Link>
            <Link href="/customers" style={{ textDecoration: "none" }}>
              <div className="hover-card-purple" style={{ padding: "20px 24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer", transition: "all 0.15s" }}>
                <span style={{ fontSize: "1.75rem" }}>👥</span>
                <p style={{ fontWeight: 700, color: "var(--text)", fontSize: "var(--text-sm)" }}>Gestionar usuarios</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Ver todos los clientes registrados en la plataforma</p>
              </div>
            </Link>
            <Link href="/solicitudes" style={{ textDecoration: "none" }}>
              <div className="hover-card-warning" style={{ padding: "20px 24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer", transition: "all 0.15s" }}>
                <span style={{ fontSize: "1.75rem" }}>📋</span>
                <p style={{ fontWeight: 700, color: "var(--text)", fontSize: "var(--text-sm)" }}>Solicitudes de perfil</p>
                <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                  Aprueba o rechaza cambios enviados por negocios
                  {pendingSolicitudes.length > 0 && (
                    <span style={{ marginLeft: 6, background: "#e8a80022", color: "#e8a800", border: "1px solid #e8a80044", borderRadius: 99, padding: "1px 7px", fontWeight: 700 }}>
                      {pendingSolicitudes.length} pendiente{pendingSolicitudes.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </p>
              </div>
            </Link>
          </div>
        </section>

        {/* Últimos negocios */}
        {businesses.length > 0 && (
          <section className="section-card">
            <div className="panel-title-row">
              <h3 className="panel-title">Negocios recientes</h3>
              <Link href="/negocios" className="panel-subtle-link">Ver todos</Link>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Localización</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                {businesses.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 600 }}>{b.Nombre}</td>
                    <td>{b.tipoNegocio || <span style={{ color: "var(--text-secondary)" }}>—</span>}</td>
                    <td>{b.Localicacion || <span style={{ color: "var(--text-secondary)" }}>—</span>}</td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{b.Correo || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    return <ErrorView />;
  }
}