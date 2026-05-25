"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  className = "",
}: {
  options: { id: number; label: string }[];
  value: number | "";
  onChange: (id: number | "") => void;
  placeholder: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.id === value)?.label || "";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`searchable-select ${className}`}
      style={{ position: "relative", width: "100%" }}
    >
      <button
        type="button"
        className="input"
        style={{
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
          width: "100%",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: value === "" ? "#94a3b8" : "inherit" }}>
          {selectedLabel || placeholder}
        </span>
        <span style={{ fontSize: "12px", opacity: 0.5 }}>▼</span>
      </button>

      {isOpen && (
        <div
          className="searchable-select__dropdown"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 100,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            marginTop: "4px",
            maxHeight: "300px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>
            <input
              ref={inputRef}
              type="text"
              className="input"
              style={{ height: "36px", fontSize: "14px" }}
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {value !== "" && (
              <div
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  color: "#ef4444",
                  fontSize: "14px",
                  borderBottom: "1px solid var(--border)",
                }}
                onClick={() => {
                  onChange("");
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                ✕ Quitar selección
              </div>
            )}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "14px",
                    background: value === opt.id ? "var(--surface-2)" : "transparent",
                    fontWeight: value === opt.id ? "600" : "400",
                  }}
                  className="searchable-select__option"
                  onClick={() => {
                    onChange(opt.id);
                    setSearch("");
                    setIsOpen(false);
                  }}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "12px",
                  textAlign: "center",
                  color: "#94a3b8",
                  fontSize: "14px",
                }}
              >
                No hay resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
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
  const [statusFilter, setStatusFilter] = useState<Booking["status"] | "all">("all");
  const [customerFilter, setCustomerFilter] = useState<number | "">("");

  const customerOptions = initialCustomers.map((customer) => ({
    id: customer.id,
    label:
      customer.Nombre || (customer as any).nombre || `Cliente ${customer.id}`,
  }));

  const filteredBookings = useMemo(() => {
    let filtered = [...initialBookings];

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (customerFilter !== "") {
      filtered = filtered.filter((booking) => booking.customerId === customerFilter);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [initialBookings, statusFilter, customerFilter]);

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
            Reservas registradas ({filteredBookings.length})
          </h3>
        </div>

        <div className="filter-row" style={{ marginBottom: 16, gap: 12, alignItems: "center", display: "flex", flexWrap: "wrap" }}>
          <button
            type="button"
            className={`filter-pill ${statusFilter === "all" ? "active" : ""}`}
            onClick={() => setStatusFilter("all")}
          >
            Todas
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === "pending" ? "active" : ""}`}
            onClick={() => setStatusFilter("pending")}
          >
            Pendientes
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === "confirmed" ? "active" : ""}`}
            onClick={() => setStatusFilter("confirmed")}
          >
            Confirmadas
          </button>
          <button
            type="button"
            className={`filter-pill ${statusFilter === "paid" ? "active" : ""}`}
            onClick={() => setStatusFilter("paid")}
          >
            Pagadas
          </button>

          <div style={{ width: 250 }}>
            <SearchableSelect
              options={customerOptions}
              value={customerFilter}
              onChange={setCustomerFilter}
              placeholder="Filtrar por Cliente"
            />
          </div>
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
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
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
