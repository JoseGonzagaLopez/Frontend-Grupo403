"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { ArrowUp, ArrowDown, AlertTriangle, User, TrendingDown, Search, ChevronDown, ChevronUp } from "lucide-react";
import type { Booking, Business } from "@/lib/api";

type ExtendedStatus = "pending" | "confirmed";

const STATUS_LABELS: Record<ExtendedStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
};

const STATUS_COLORS: Record<ExtendedStatus, string> = {
  pending: "#e8a800",
  confirmed: "#2dd4bf",
};

function formatImporte(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value ?? 0);
}

function StatusBadge({ status }: { status: string }) {
  const s = status as ExtendedStatus;
  const label = STATUS_LABELS[s] ?? status;
  const color = STATUS_COLORS[s] ?? "var(--text-muted)";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: "999px",
        fontSize: "0.78rem",
        fontWeight: 600,
        background: `${color}22`,
        color,
        border: `1px solid ${color}55`,
      }}
    >
      {label}
    </span>
  );
}

export default function NegocioDeudasClient({
  appointments,
  business,
  businessId,
  customerNames,
}: {
  appointments: Booking[];
  business: Business | null;
  businessId: number;
  customerNames: Record<number, string>;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "confirmed">("all");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [expandedCustomer, setExpandedCustomer] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const STATUS_OPTIONS: { value: "all" | "pending" | "confirmed"; label: string }[] = [
    { value: "all",       label: "Todos los estados" },
    { value: "pending",   label: "Pendiente" },
    { value: "confirmed", label: "Confirmada" },
  ];
  const selectedLabel = STATUS_OPTIONS.find((o) => o.value === filterStatus)?.label ?? "Todos los estados";

  function handleSort(column: string) {
    if (sortColumn === column) {
      if (sortDirection === "asc") setSortDirection("desc");
      else { setSortColumn(null); setSortDirection(null); }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  function SortIcon({ col }: { col: string }) {
    if (sortColumn !== col) return null;
    return sortDirection === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />;
  }

  const grouped = useMemo(() => {
    let list = [...appointments];
    if (filterStatus !== "all") list = list.filter((a) => a.status === filterStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((a) => {
        const name = (customerNames[a.customerId] || "").toLowerCase();
        return name.includes(q) || !!a.serviceName?.toLowerCase().includes(q);
      });
    }

    const map: Record<number, { name: string; bookings: Booking[]; total: number }> = {};
    for (const apt of list) {
      if (!map[apt.customerId]) {
        map[apt.customerId] = {
          name: customerNames[apt.customerId] || `Cliente #${apt.customerId}`,
          bookings: [],
          total: 0,
        };
      }
      map[apt.customerId].bookings.push(apt);
      map[apt.customerId].total += apt.importe ?? 0;
    }

    let entries = Object.entries(map).map(([id, data]) => ({
      customerId: Number(id),
      ...data,
    }));

    if (sortColumn && sortDirection) {
      entries.sort((a, b) => {
        let valA: any;
        let valB: any;
        if (sortColumn === "Cliente") { valA = a.name.toLowerCase(); valB = b.name.toLowerCase(); }
        else if (sortColumn === "Reservas") { valA = a.bookings.length; valB = b.bookings.length; }
        else if (sortColumn === "Total") { valA = a.total; valB = b.total; }
        else return 0;

        if (typeof valA === "string") {
          const cmp = valA.localeCompare(valB);
          return sortDirection === "asc" ? cmp : -cmp;
        }
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    } else {
      entries.sort((a, b) => b.total - a.total);
    }

    return entries;
  }, [appointments, filterStatus, search, sortColumn, sortDirection, customerNames]);

  const totalDeuda = grouped.reduce((sum, g) => sum + g.total, 0);
  const totalClientes = grouped.length;
  const totalReservas = grouped.reduce((sum, g) => sum + g.bookings.length, 0);

  return (
    <div className="page-stack">
      {/* Header */}
      <section className="page-hero">
        <div>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={22} style={{ color: "#f87171" }} />
            Deudas pendientes
          </h2>
          <p>Clientes con reservas confirmadas o pendientes de pago.</p>
        </div>
      </section>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "16px" }}>
        {([
          { label: "Total pendiente",   value: formatImporte(totalDeuda), color: "#f87171" },
          { label: "Clientes con deuda", value: totalClientes,             color: "#a78bfa" },
          { label: "Reservas sin pagar", value: totalReservas,             color: "#fbbf24" },
        ] as const).map(({ label, value, color }) => (
          <div key={label} style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            padding: "18px 20px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderLeft: `3px solid ${color}`,
            borderRadius: "12px",
          }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {label}
            </span>
            <span style={{ fontSize: "1.6rem", fontWeight: 700, color, lineHeight: 1 }}>
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center", marginBottom: "4px" }}>
        <div style={{ position: "relative", flex: "1", minWidth: "200px", maxWidth: "340px" }}>
          <Search size={15} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Buscar cliente o servicio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              paddingLeft: "32px",
              paddingRight: "12px",
              paddingTop: "8px",
              paddingBottom: "8px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
              fontSize: "0.875rem",
              boxSizing: "border-box",
            }}
          />
        </div>
        {/* Custom dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--text)",
              fontSize: "0.875rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              minWidth: "170px",
              justifyContent: "space-between",
            }}
          >
            {selectedLabel}
            <ChevronDown size={14} style={{ transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>
          {dropdownOpen && (
            <div style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              minWidth: "100%",
              background: "#0f1128",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "8px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
              zIndex: 50,
              overflow: "hidden",
            }}>
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setFilterStatus(opt.value); setDropdownOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "9px 14px",
                    background: filterStatus === opt.value ? "rgba(45,212,191,0.15)" : "transparent",
                    color: filterStatus === opt.value ? "#2dd4bf" : "#ffffff",
                    border: "none",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    fontWeight: filterStatus === opt.value ? 600 : 400,
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {grouped.length === 0 ? (
        <div className="empty-glass" style={{ marginTop: "32px" }}>
          <TrendingDown size={28} style={{ margin: "0 auto 12px", color: "#2dd4bf" }} />
          <p>¡Sin deudas! Todos los clientes están al día.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                {[
                  { col: "Cliente", label: "Cliente" },
                  { col: "Reservas", label: "Nº reservas" },
                  { col: "Total", label: "Total pendiente" },
                ].map(({ col, label }) => (
                  <th key={col}>
                    <button
                      type="button"
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        background: "transparent", border: "none",
                        color: "inherit", fontWeight: "inherit",
                        fontSize: "inherit", cursor: "pointer", padding: 0,
                      }}
                      onClick={() => handleSort(col)}
                    >
                      {label}
                      <SortIcon col={col} />
                    </button>
                  </th>
                ))}
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {grouped.map((g) => (
                <React.Fragment key={g.customerId}>
                  <tr
                    style={{ cursor: "pointer" }}
                    onClick={() => setExpandedCustomer(expandedCustomer === g.customerId ? null : g.customerId)}
                  >
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <User size={14} style={{ color: "#a78bfa" }} />
                        {g.name}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{g.bookings.length}</td>
                    <td style={{ fontWeight: 700, color: "#f87171" }}>{formatImporte(g.total)}</td>
                    <td>
                      <button
                        type="button"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          borderRadius: "6px",
                          color: "var(--text-muted)",
                          fontSize: "0.78rem",
                          padding: "4px 10px",
                          cursor: "pointer",
                        }}
                      >
                        {expandedCustomer === g.customerId
                          ? <><ChevronUp size={13} /> Ocultar</>
                          : <><ChevronDown size={13} /> Ver reservas</>}
                      </button>
                    </td>
                  </tr>
                  {expandedCustomer === g.customerId && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          padding: "0",
                          background: "var(--surface)",
                          borderBottom: "2px solid var(--border)",
                        }}
                      >
                        <div style={{
                          margin: "0 16px 14px 40px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          border: "1px solid var(--border)",
                          background: "var(--bg, var(--surface))",
                        }}>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                            <thead>
                              <tr style={{
                                background: "var(--surface)",
                                borderBottom: "1px solid var(--border)",
                              }}>
                                {["Fecha", "Hora", "Servicio", "Importe", "Estado"].map((h) => (
                                  <th key={h} style={{
                                    textAlign: "left",
                                    padding: "8px 12px",
                                    fontWeight: 600,
                                    fontSize: "0.78rem",
                                    color: "var(--text-muted)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.04em",
                                  }}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {g.bookings
                                .slice()
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((apt, idx) => (
                                  <tr
                                    key={apt.id}
                                    style={{
                                      borderBottom: idx < g.bookings.length - 1 ? "1px solid var(--border)" : "none",
                                      background: idx % 2 === 0 ? "transparent" : "var(--surface)",
                                    }}
                                  >
                                    <td style={{ padding: "8px 12px", color: "var(--text)" }}>{apt.date}</td>
                                    <td style={{ padding: "8px 12px", color: "var(--text)", fontWeight: 600 }}>{apt.time || "—"}</td>
                                    <td style={{ padding: "8px 12px", color: "var(--text)" }}>{apt.serviceName}</td>
                                    <td style={{ padding: "8px 12px", fontWeight: 700, color: "var(--text)" }}>{formatImporte(apt.importe)}</td>
                                    <td style={{ padding: "8px 12px" }}>
                                      <StatusBadge status={apt.status} />
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
