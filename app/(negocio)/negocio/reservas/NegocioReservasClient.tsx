"use client";
import { useState, useMemo } from "react";
import type { Booking, Business } from "@/lib/api";
import { updateAppointment, deleteAppointment } from "@/lib/api";

type ExtendedStatus = "pending" | "confirmed" | "completed" | "no_show";

const STATUS_LABELS: Record<ExtendedStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Terminada",
  no_show: "No presentada",
};

const STATUS_COLORS: Record<ExtendedStatus, string> = {
  pending: "#e8a800",
  confirmed: "var(--accent)",
  completed: "var(--success-text)",
  no_show: "var(--danger)",
};

const EDITABLE_STATUSES: ExtendedStatus[] = ["pending", "confirmed"];

function isEditable(status: string): boolean {
  return EDITABLE_STATUSES.includes(status as ExtendedStatus);
}

export default function NegocioReservasClient({
  appointments: initial,
  business,
  businessId,
}: {
  appointments: Booking[];
  business: Business | null;
  businessId: number;
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
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "none">("none");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let list = [...appointments];
    if (filterStatus !== "all") list = list.filter((a) => a.status === filterStatus);
    if (filterService.trim()) list = list.filter((a) => a.serviceName?.toLowerCase().includes(filterService.toLowerCase()));
    if (sortOrder === "asc") list.sort((a, b) => new Date(a.date + "T" + (a.time || "00:00")).getTime() - new Date(b.date + "T" + (b.time || "00:00")).getTime());
    if (sortOrder === "desc") list.sort((a, b) => new Date(b.date + "T" + (b.time || "00:00")).getTime() - new Date(a.date + "T" + (a.time || "00:00")).getTime());
    return list;
  }, [appointments, filterStatus, filterService, sortOrder]);

  function openEdit(a: Booking) {
    setEditingId(a.id);
    setEditForm({ date: a.date, time: a.time, serviceName: a.serviceName, status: a.status });
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
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Ordenar por fecha</label>
              <select className="input" value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
                <option value="none">Sin ordenar</option>
                <option value="asc">Más antiguas primero</option>
                <option value="desc">Más recientes primero</option>
              </select>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button className="secondary-btn" onClick={() => { setFilterStatus("all"); setFilterService(""); setSortOrder("none"); }}>Limpiar filtros</button>
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
                  <th>#</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Servicio</th>
                  <th>Cliente ID</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{a.id}</td>
                    <td>{new Intl.DateTimeFormat("es-ES").format(new Date(a.date + "T12:00:00"))}</td>
                    <td>{a.time}</td>
                    <td>{a.serviceName}</td>
                    <td>{a.customerId}</td>
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
