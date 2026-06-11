"use client";

import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Minus, Sparkles } from "lucide-react";
import type { Booking, Customer, BookingStatus } from "@/lib/api";

function Badge({ status }: { status: BookingStatus }) {
  const label =
    status === "pending"
      ? "Pendiente"
      : status === "confirmed"
        ? "Confirmada"
        : "Pagada";

  return <span className={`badge badge--${status}`}>{label}</span>;
}

function formatImporte(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function UpcomingBookingsTable({
  appointments,
  customers,
}: {
  appointments: Booking[];
  customers: Customer[];
}) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  function handleSort(column: string) {
    if (sortColumn === column) {
      if (sortDirection === "asc") setSortDirection("desc");
      else { setSortColumn(null); setSortDirection(null); }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  const sortedAppointments = useMemo(() => {
    let sorted = [...appointments];

    if (sortColumn && sortDirection) {
      sorted = sorted.sort((a, b) => {
        let valA: any;
        let valB: any;

        switch (sortColumn) {
          case "Fecha":
            valA = new Date(`${a.date}T${a.time || "00:00"}`).getTime() || new Date(a.date).getTime() || 0;
            valB = new Date(`${b.date}T${b.time || "00:00"}`).getTime() || new Date(b.date).getTime() || 0;
            break;
          case "Hora":
            valA = a.time;
            valB = b.time;
            break;
          case "Servicio":
            valA = (a.servicio?.nombre || "").toLowerCase();
            valB = (b.servicio?.nombre || "").toLowerCase();
            break;
          case "Cliente": {
            const cA = customers.find((c) => c.id === a.customerId);
            const cB = customers.find((c) => c.id === b.customerId);
            valA = (cA?.Nombre || (cA as any)?.nombre || `Cliente #${a.customerId}`).toLowerCase();
            valB = (cB?.Nombre || (cB as any)?.nombre || `Cliente #${b.customerId}`).toLowerCase();
            break;
          }
          case "Importe":
            valA = a.importe;
            valB = b.importe;
            break;
          case "Estado": {
            const labelMap: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmada", paid: "Pagada" };
            valA = (labelMap[a.status?.toLowerCase().trim() || ""] || "").toLowerCase();
            valB = (labelMap[b.status?.toLowerCase().trim() || ""] || "").toLowerCase();
            break;
          }
        }

        if (typeof valA === "string" && typeof valB === "string") {
          const cmp = valA.localeCompare(valB);
          if (cmp !== 0) return sortDirection === "asc" ? cmp : -cmp;
          return 0;
        }

        const isAsc = sortDirection === "asc";
        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });
    }

    return sorted;
  }, [appointments, sortColumn, sortDirection, customers]);

  return (
    <table className="data-table">
      <thead>
        <tr>
          {["Fecha", "Hora", "Servicio", "Cliente", "Importe", "Estado"].map((col) => (
            <th key={col}>
              <button
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  background: "transparent",
                  border: "none",
                  color: "inherit",
                  fontWeight: "inherit",
                  fontSize: "inherit",
                  cursor: "pointer",
                  padding: 0
                }}
                onClick={() => handleSort(col)}
              >
                {col}
                {sortColumn === col && (
                  sortDirection === "asc" ? <ArrowUp size={14} /> :
                  sortDirection === "desc" ? <ArrowDown size={14} /> :
                  <Minus size={14} />
                )}
              </button>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {sortedAppointments.length > 0 ? (
          sortedAppointments.map((appointment) => (
            <tr key={appointment.id}>
              <td style={{ color: 'var(--text)' }}>{appointment.date}</td>
              <td style={{ fontWeight: 700, color: 'var(--text)' }}>{appointment.time}</td>
              <td>{appointment.servicio?.nombre || '—'}</td>
              <td>{customers.find((c) => c.id === appointment.customerId)?.Nombre || `Cliente #${appointment.customerId}`}</td>
              <td style={{ color: 'var(--text)' }}>{formatImporte(appointment.importe)}</td>
              <td>
                <Badge status={appointment.status} />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={6}>
              <div className="empty-glass">
                <Sparkles size={18} style={{ margin: '0 auto 10px', color: 'var(--teal)' }} />
                No hay reservas pendientes.
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
