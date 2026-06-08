"use client";
import { useState, useMemo } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { Booking, Business } from "@/lib/api";
import { updateAppointment, deleteAppointment } from "@/lib/api";

type ExtendedStatus = "pending" | "confirmed" | "paid";

const STATUS_LABELS: Record<ExtendedStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  paid: "Pagado",
};

const STATUS_COLORS: Record<ExtendedStatus, string> = {
  pending: "#e8a800",
  confirmed: "var(--accent)",
  paid: "var(--success-text)",
};

const EDITABLE_STATUSES: ExtendedStatus[] = ["pending", "confirmed", "paid"];

function isEditable(status: string): boolean {
  return EDITABLE_STATUSES.includes(status as ExtendedStatus);
}

export default function NegocioReservasClient({
  appointments: initial,
  business,
  businessId,
  customerNames,
}: {
  appointments: Booking[];
  business: Business | null;
  businessId: number;
  customerNames: Record<number, string>;
}) {
  const [appointments, setAppointments] = useState<Booking[]>(initial);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Booking>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filtros
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterService, setFilterService] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  function handleSort(column: string) {
    if (sortColumn === column) {
      if (sortDirection === "asc") setSortDirection("desc");
      else { setSortColumn(null); setSortDirection(null); }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  const filtered = useMemo(() => {
    let list = [...appointments];
    if (filterStatus !== "all") list = list.filter((a) => a.status === filterStatus);
    if (filterService.trim()) list = list.filter((a) => a.serviceName?.toLowerCase().includes(filterService.toLowerCase()));
    
    let sorted = list.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time || "00:00"}`).getTime() || new Date(a.date).getTime() || 0;
      const dateB = new Date(`${b.date}T${b.time || "00:00"}`).getTime() || new Date(b.date).getTime() || 0;
      return dateB - dateA;
    });

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
            valA = a.serviceName?.toLowerCase() || "";
            valB = b.serviceName?.toLowerCase() || "";
            break;
          case "Importe":
            valA = a.importe || 0;
            valB = b.importe || 0;
            break;
          case "Cliente": {
            valA = (customerNames[a.customerId] || `ID: ${a.customerId}`).toLowerCase();
            valB = (customerNames[b.customerId] || `ID: ${b.customerId}`).toLowerCase();
            break;
          }
          case "Estado": {
            const labelMap: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmada", paid: "Pagado" };
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
  }, [appointments, filterStatus, filterService, sortColumn, sortDirection, customerNames]);

  const totalImporte = useMemo(() => {
    return filtered.reduce((sum, a) => sum + (Number(a.importe) || 0), 0);
  }, [filtered]);

  function openEdit(a: Booking) {
    setEditingId(a.id);
    setEditForm({ date: a.date, time: a.time, serviceName: a.serviceName, status: a.status, importe: a.importe });
    setError("");
  }

  async function handleSave() {
    if (!editingId) return;
    setLoading(true);
    setError("");
    try {
      const updated = await updateAppointment(editingId, editForm as any);
      setAppointments((prev) => prev.map((a) => (a.id === editingId ? updated : a)));
      setEditingId(null);
      setSuccess("Reserva actualizada.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("No se pudo actualizar la reserva."); }
    finally { setLoading(false); }
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    setLoading(true);
    try {
      await deleteAppointment(deleteTargetId);
      setAppointments((prev) => prev.filter((a) => a.id !== deleteTargetId));
      setDeleteTargetId(null);
      setSuccess("Reserva eliminada.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("No se pudo eliminar la reserva."); }
    finally { setLoading(false); }
  }

  async function quickConfirm(id: number) {
    setLoading(true);
    try {
      const updated = await updateAppointment(id, { status: "confirmed" } as any);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSuccess("Reserva confirmada.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("No se pudo confirmar."); }
    finally { setLoading(false); }
  }

  async function markPaid(id: number) {
    setLoading(true);
    try {
      const updated = await updateAppointment(id, { status: "paid" } as any);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
      setSuccess("Reserva marcada como pagada.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("No se pudo marcar como pagada."); }
    finally { setLoading(false); }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Reservas de {business?.Nombre || "tu negocio"}</h2>
          <p>Gestiona, confirma y edita las citas de tu negocio.</p>
        </div>
        <button className="secondary-btn" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? "Ocultar filtros" : "Filtros"}
        </button>
      </section>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "16px" }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          padding: "18px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: `3px solid #fbbf24`,
          borderRadius: "12px",
        }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Reservas
          </span>
          <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#fbbf24", lineHeight: 1 }}>
            {filtered.length}
          </span>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          padding: "18px 20px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderLeft: `3px solid var(--success-text)`,
          borderRadius: "12px",
        }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Importe
          </span>
          <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--success-text)", lineHeight: 1 }}>
            {Number(totalImporte).toFixed(2)} €
          </span>
        </div>
      </div>

      {showFilters && (
        <section className="section-card">
          <div className="form-grid" style={{ gap: 12 }}>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Estado</label>
              <select className="input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">Todos</option>
                {(Object.keys(STATUS_LABELS) as ExtendedStatus[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Servicio</label>
              <input className="input" placeholder="Buscar servicio..." value={filterService} onChange={(e) => setFilterService(e.target.value)} />
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="secondary-btn" onClick={() => { setFilterStatus("all"); setFilterService(""); setSortColumn(null); setSortDirection(null); }}>Limpiar filtros</button>
            </div>
          </div>
        </section>
      )}

      {success && <div className="message-success">{success}</div>}
      {error && <div className="message-error">{error}</div>}

      {editingId !== null && (() => {
        const a = appointments.find((x) => x.id === editingId)!;
        return (
          <section className="section-card">
            <div className="panel-title-row">
              <h3 className="panel-title">Editar reserva #{editingId}</h3>
              <button className="secondary-btn" onClick={() => setEditingId(null)}>Cancelar</button>
            </div>
            <div className="form-grid" style={{ gap: 16 }}>
              <div>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Fecha</label>
                <input type="date" className="input" value={editForm.date || ""} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Hora</label>
                <input type="time" className="input" value={editForm.time || ""} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Servicio</label>
                <input type="text" className="input" value={editForm.serviceName || ""} onChange={(e) => setEditForm({ ...editForm, serviceName: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Importe (€)</label>
                <input type="number" step="0.01" className="input" value={editForm.importe !== undefined ? editForm.importe : ""} onChange={(e) => setEditForm({ ...editForm, importe: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Estado</label>
                <select className="input" value={editForm.status || ""} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}>
                  {(Object.keys(STATUS_LABELS) as ExtendedStatus[]).map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ marginTop: 16, display: "flex", gap: 8 }}>
              <button className="primary-btn" onClick={handleSave} disabled={loading}>{loading ? "Guardando..." : "Guardar cambios"}</button>
            </div>
          </section>
        );
      })()}

      {deleteTargetId !== null && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null); }}>
          <div className="modal-card">
            <div className="modal-icon">!</div>
            <h3 className="modal-title">Eliminar reserva</h3>
            <p className="modal-text">¿Seguro que quieres eliminar esta reserva? Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setDeleteTargetId(null)}>Cancelar</button>
              <button className="danger-btn" onClick={confirmDelete} disabled={loading}>{loading ? "Eliminando..." : "Eliminar"}</button>
            </div>
          </div>
        </div>
      )}

      <section className="section-card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--text-secondary)" }}>
            No hay reservas que coincidan con los filtros.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  {["Fecha", "Hora", "Servicio", "Importe", "Cliente", "Estado"].map((col) => (
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>{new Intl.DateTimeFormat("es-ES").format(new Date(a.date + "T12:00:00"))}</td>
                    <td>{a.time}</td>
                    <td>{a.serviceName}</td>
                    <td>{a.importe !== undefined ? `${Number(a.importe).toFixed(2)} €` : "—"}</td>
                    <td>{customerNames[a.customerId] || `ID: ${a.customerId}`}</td>
                    <td>
                      <span className="badge" style={{
                        background: STATUS_COLORS[a.status as ExtendedStatus] + "22",
                        color: STATUS_COLORS[a.status as ExtendedStatus],
                        border: `1px solid ${STATUS_COLORS[a.status as ExtendedStatus]}44`,
                        borderRadius: "var(--radius-full)",
                        padding: "2px 10px",
                        fontSize: "var(--text-xs)",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}>
                        {STATUS_LABELS[a.status as ExtendedStatus] || a.status}
                      </span>
                    </td>
                    <td>
                      {isEditable(a.status) ? (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {a.status === "pending" && (
                            <button className="secondary-btn" style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }} onClick={() => quickConfirm(a.id)} disabled={loading}>Confirmar</button>
                          )}
                          {a.status === "confirmed" && (new Date(a.date + "T" + (a.time || "00:00")).getTime() < Date.now()) && (
                            <button className="secondary-btn" style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }} onClick={() => markPaid(a.id)} disabled={loading}>Pagado</button>
                          )}
                          <button className="secondary-btn" style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }} onClick={() => openEdit(a)}>Editar</button>
                          <button className="danger-btn" style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }} onClick={() => setDeleteTargetId(a.id)}>Borrar</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
