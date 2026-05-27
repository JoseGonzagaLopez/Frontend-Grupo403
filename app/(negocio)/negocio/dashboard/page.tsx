import { getBusinessSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { getAppointments, getBusinesses, getServices } from "@/lib/api";
import Link from "next/link";
import ErrorView from "@/components/ErrorView";
import type { Booking, BookingStatus } from "@/lib/api";

type ExtendedStatus = "pending" | "confirmed" | "completed" | "no_show";

const STATUS_LABELS: Record<ExtendedStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Terminada",
  no_show: "No presentada",
};

const STATUS_COLORS: Record<ExtendedStatus, string> = {
  pending: "#e8a800",
  confirmed: "#01696f",
  completed: "#22c55e",
  no_show: "#ef4444",
};

function Badge({ status }: { status: string }) {
  const s = status as ExtendedStatus;
  return (
    <span style={{
      background: (STATUS_COLORS[s] ?? "#888") + "22",
      color: STATUS_COLORS[s] ?? "#888",
      border: `1px solid ${(STATUS_COLORS[s] ?? "#888")}44`,
      borderRadius: "999px",
      padding: "2px 10px",
      fontSize: "var(--text-xs)",
      fontWeight: 600,
      whiteSpace: "nowrap",
    }}>
      {STATUS_LABELS[s] ?? status}
    </span>
  );
}

function KpiCard({ title, value, subtitle, color }: { title: string; value: string | number; subtitle: string; color?: string }) {
  return (
    <div className="kpi-card">
      <p className="kpi-card__label">{title}</p>
      <h3 className="kpi-card__value" style={color ? { color } : {}}>{value}</h3>
      <p className="kpi-card__meta">{subtitle}</p>
    </div>
  );
}

export default async function NegocioDashboardPage() {
  try {
    const businessId = await getBusinessSession();
    if (!businessId) redirect("/login");

    const [allAppointments, businesses, services] = await Promise.all([
      getAppointments(),
      getBusinesses(),
      getServices(businessId),
    ]);

    const business = businesses.find((b) => b.id === businessId) || null;
    const appointments = allAppointments.filter((a) => a.businessId === businessId);

    const today = new Date().toISOString().slice(0, 10);
    const now = new Date();

    const todayAppts = appointments.filter((a) => a.date === today);
    const pending = appointments.filter((a) => a.status === "pending");
    const upcoming = appointments
      .filter((a) => new Date(`${a.date}T${a.time}:00`) >= now)
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
      .slice(0, 5);

    const totalIngresosMes = appointments
      .filter((a) => {
        const d = new Date(a.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && a.status !== "no_show";
      })
      .reduce((sum, a) => sum + (a.importe || 0), 0);

    return (
      <div className="page-stack">
        <section className="page-hero">
          <div>
            <h2>Bienvenido/a{business?.Nombre ? `, ${business.Nombre}` : ""}</h2>
            <p>Gestiona tus reservas, servicios y disponibilidad desde aquí.</p>
          </div>
          <Link href="/negocio/reservas" className="primary-btn">Ver todas las reservas</Link>
        </section>

        {/* KPIs */}
        <section className="kpi-grid">
          <KpiCard
            title="Reservas hoy"
            value={todayAppts.length}
            subtitle={todayAppts.length > 0 ? `${todayAppts.length} cita${todayAppts.length !== 1 ? "s" : ""} hoy` : "Sin reservas hoy"}
            color="var(--accent)"
          />
          <KpiCard
            title="Pendientes de confirmar"
            value={pending.length}
            subtitle={pending.length > 0 ? "Requieren confirmación" : "Sin pendientes"}
            color={pending.length > 0 ? "#e8a800" : undefined}
          />
          <KpiCard
            title="Servicios activos"
            value={services.length}
            subtitle={services.length > 0 ? `${services.length} servicio${services.length !== 1 ? "s" : ""}` : "Añade servicios"}
          />
          <KpiCard
            title="Ingresos este mes"
            value={new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(totalIngresosMes)}
            subtitle="Estimado (reservas no canceladas)"
          />
        </section>

        {/* Próximas reservas */}
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Próximas reservas</h3>
            <Link href="/negocio/reservas" className="panel-subtle-link">Ver todas →</Link>
          </div>

          {upcoming.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-secondary)" }}>
              No hay reservas próximas.
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Servicio</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {upcoming.map((a) => (
                  <tr key={a.id}>
                    <td>{new Intl.DateTimeFormat("es-ES").format(new Date(a.date + "T12:00:00"))}</td>
                    <td style={{ fontWeight: 600 }}>{a.time}</td>
                    <td>{a.serviceName}</td>
                    <td style={{ color: "var(--text-secondary)" }}>Cliente #{a.customerId}</td>
                    <td><Badge status={a.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Accesos rápidos */}
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Accesos rápidos</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginTop: 16 }}>
            {[
              { href: "/negocio/reservas", icon: "📅", label: "Reservas", desc: "Gestiona y confirma citas" },
              { href: "/negocio/servicios", icon: "✂️", label: "Servicios", desc: "Añade o edita tus servicios" },
              { href: "/negocio/disponibilidad", icon: "🕐", label: "Disponibilidad", desc: "Configura tus horarios" },
              { href: "/negocio/resenas", icon: "⭐", label: "Reseñas", desc: "Ve qué opinan tus clientes" },
              { href: "/negocio/perfil", icon: "🏢", label: "Perfil", desc: "Actualiza la info de tu negocio" },
            ].map(({ href, icon, label, desc }) => (
              <Link key={href} href={href} style={{ textDecoration: "none" }}>
                <div className="hover-card-accent" style={{ padding: "16px 20px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", background: "var(--surface-2)", display: "flex", flexDirection: "column", gap: 6, cursor: "pointer", transition: "all 0.15s" }}>
                  <span style={{ fontSize: "1.5rem" }}>{icon}</span>
                  <p style={{ fontWeight: 700, color: "var(--text)", fontSize: "var(--text-sm)" }}>{label}</p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Error loading negocio dashboard:", error);
    return <ErrorView />;
  }
}
