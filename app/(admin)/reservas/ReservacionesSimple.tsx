"use client";

import { useMemo } from "react";
import type { Booking, Customer, Business } from "@/lib/api";

function StatusBadge({ status }: { status: Booking["status"] }) {
  const label =
    status === "pending"
      ? "Pendiente"
      : status === "confirmed"
        ? "Confirmada"
        : "Pagada";

  return <span className={`badge badge--${status}`}>{label}</span>;
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function formatImporte(value: number | undefined) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

export default function ReservacionesSimple({
  initialBookings,
  initialCustomers,
  initialBusinesses,
}: {
  initialBookings: Booking[];
  initialCustomers: Customer[];
  initialBusinesses: Business[];
}) {
  const sortedBookings = useMemo(() => {
    return [...initialBookings].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [initialBookings]);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Todas las reservas</h2>
          <p>Listado completo de reservas del sistema.</p>
        </div>
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">
            Reservas registradas ({sortedBookings.length})
          </h3>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Servicio</th>
              <th>Importe</th>
              <th>Cliente</th>
              <th>Negocio</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {sortedBookings.length > 0 ? (
              sortedBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{formatDate(booking.date)}</td>
                  <td>{booking.time}</td>
                  <td>{booking.serviceName}</td>
                  <td>{formatImporte(booking.importe)}</td>
                  <td>
                    {initialCustomers.find((c) => c.id === booking.customerId)
                      ?.Nombre ||
                      (initialCustomers.find(
                        (c) => c.id === booking.customerId
                      ) as any)?.nombre ||
                      `Cliente ${booking.customerId}`}
                  </td>
                  <td>
                    {initialBusinesses.find((b) => b.id === booking.businessId)
                      ?.Nombre ||
                      (initialBusinesses.find(
                        (b) => b.id === booking.businessId
                      ) as any)?.nombre ||
                      `Empresa ${booking.businessId}`}
                  </td>
                  <td>
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "2rem 0", color: "#6b7280" }}>
                  No hay reservas registradas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
