"use client";
import type { Booking } from "@/lib/api";
import { CalendarDays, Clock } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "var(--warning, #964219)",      bg: "rgba(150,66,25,0.12)" },
  confirmed: { label: "Confirmada", color: "var(--success-text, #437a22)", bg: "rgba(67,122,34,0.12)" },
  cancelled: { label: "Cancelada",  color: "var(--danger, #c0392b)",       bg: "rgba(192,57,43,0.12)" },
  completed: { label: "Completada", color: "var(--text-secondary)",        bg: "var(--surface-2)" },
  paid:      { label: "Pagada",     color: "var(--accent, #01696f)",        bg: "rgba(1,105,111,0.12)" },
  no_show:   { label: "No asistió", color: "var(--text-secondary)",        bg: "var(--surface-2)" },
};

export default function MisReservasClient({
  appointments,
  customer,
}: {
  appointments: Booking[];
  customer: { Nombre: string; id: number } | null;
}) {
  if (!customer) {
    return (
      <div className="page-stack">
        <section className="page-hero">
          <div>
            <h2>Mis reservas</h2>
            <p>Debes iniciar sesión para ver tus reservas.</p>
          </div>
        </section>
      </div>
    );
  }

  const sorted = [...appointments].sort((a, b) => {
    const da = new Date(a.date + "T" + (a.time || "00:00")).getTime();
    const db = new Date(b.date + "T" + (b.time || "00:00")).getTime();
    return db - da;
  });

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Mis reservas</h2>
          <p>Consulta el estado de todas tus reservas en tiempo real.</p>
        </div>
      </section>

      <section className="section-card">
        {sorted.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "var(--space-16) var(--space-8)",
            color: "var(--text-secondary)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--space-3)",
          }}>
            <CalendarDays size={48} style={{ opacity: 0.25 }} />
            <p style={{ fontWeight: 600, margin: 0 }}>No tienes reservas aún</p>
            <p style={{ fontSize: "var(--text-sm)", margin: 0, maxWidth: "36ch" }}>
              Cuando reserves un servicio, aparecerá aquí con su estado actualizado.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {sorted.map((appt) => {
              const st = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
              const dateFormatted = new Intl.DateTimeFormat("es-ES", {
                day: "2-digit", month: "long", year: "numeric",
              }).format(new Date(appt.date + "T12:00:00"));

              return (
                <div
                  key={appt.id}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-4) var(--space-5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "var(--space-4)",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
                    <p style={{ fontWeight: 600, margin: 0, fontSize: "var(--text-base)" }}>
                      {appt.serviceName}
                    </p>
                    <p style={{
                      fontSize: "var(--text-sm)",
                      color: "var(--text-secondary)",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      flexWrap: "wrap",
                    }}>
                      <CalendarDays size={13} />
                      {dateFormatted}
                      <Clock size={13} style={{ marginLeft: 4 }} />
                      {appt.time}
                    </p>
                    {appt.importe > 0 && (
                      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0 }}>
                        Importe: {appt.importe}€
                      </p>
                    )}
                  </div>
                  <span style={{
                    background: st.bg,
                    color: st.color,
                    padding: "4px 14px",
                    borderRadius: "var(--radius-full)",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
