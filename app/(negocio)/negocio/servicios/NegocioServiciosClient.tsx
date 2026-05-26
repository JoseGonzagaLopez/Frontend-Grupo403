"use client";
import { useState, useEffect } from "react";
import { getServices, createService, updateService, deleteService } from "@/lib/api";
import type { Service } from "@/lib/api";

type FormState = { nombre: string; precio: string; duracion: string; descripcion: string };

function FormPanel({
  onSubmit, title, onCancel, form, setForm, saving,
}: {
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  onCancel: () => void;
  form: FormState;
  setForm: (f: FormState) => void;
  saving: boolean;
}) {
  return (
    <section className="section-card">
      <div className="panel-title-row">
        <h3 className="panel-title">{title}</h3>
        <button className="secondary-btn" type="button" onClick={onCancel}>Cancelar</button>
      </div>
      <form onSubmit={onSubmit} className="form-grid" style={{ gap: 16, alignItems: "end" }}>
        <div>
          <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Nombre del servicio *</label>
          <input className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Ej. Corte de pelo" />
        </div>
        <div>
          <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Precio (€) *</label>
          <input className="input" type="number" required min="0" step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} placeholder="Ej. 25.00" />
        </div>
        <div>
          <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Duración (min)</label>
          <input className="input" type="number" min="0" value={form.duracion} onChange={(e) => setForm({ ...form, duracion: e.target.value })} placeholder="Ej. 60" />
        </div>
        <div>
          <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Descripción</label>
          <input className="input" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} placeholder="Opcional" />
        </div>
        <div>
          <button className="primary-btn" type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
        </div>
      </form>
    </section>
  );
}

export default function NegocioServiciosClient({ businessId }: { businessId: number }) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const emptyForm: FormState = { nombre: "", precio: "", duracion: "", descripcion: "" };
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getServices(businessId)
      .then(setServices)
      .catch(() => setError("No se pudieron cargar los servicios."))
      .finally(() => setLoading(false));
  }, [businessId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const created = await createService({ ...form, businessId, precio: Number(form.precio), duracion: Number(form.duracion) });
      setServices((prev) => [created, ...prev]);
      setForm(emptyForm);
      setIsCreating(false);
      setSuccess("Servicio creado.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("No se pudo crear el servicio."); }
    finally { setSaving(false); }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true); setError("");
    try {
      const updated = await updateService(editingId, { ...form, precio: Number(form.precio), duracion: Number(form.duracion) });
      setServices((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
      setEditingId(null); setForm(emptyForm);
      setSuccess("Servicio actualizado.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("No se pudo actualizar el servicio."); }
    finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    setSaving(true);
    try {
      await deleteService(deleteTargetId);
      setServices((prev) => prev.filter((s) => s.id !== deleteTargetId));
      setDeleteTargetId(null);
      setSuccess("Servicio eliminado.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("No se pudo eliminar el servicio."); }
    finally { setSaving(false); }
  }

  function openEdit(s: Service) {
    setEditingId(s.id);
    setIsCreating(false);
    setForm({ nombre: s.nombre, precio: String(s.precio), duracion: String(s.duracion || ""), descripcion: s.descripcion || "" });
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Servicios</h2>
          <p>Gestiona los servicios y precios que ofrece tu negocio.</p>
        </div>
        {!isCreating && !editingId && (
          <button className="primary-btn" onClick={() => { setIsCreating(true); setEditingId(null); setForm(emptyForm); }}>Nuevo servicio</button>
        )}
      </section>

      {success && <div className="message-success">{success}</div>}
      {error && <div className="message-error">{error}</div>}

      {isCreating && (
        <FormPanel
          title="Nuevo servicio"
          onSubmit={handleCreate}
          onCancel={() => { setIsCreating(false); setForm(emptyForm); }}
          form={form}
          setForm={setForm}
          saving={saving}
        />
      )}
      {editingId !== null && (
        <FormPanel
          title={`Editar servicio #${editingId}`}
          onSubmit={handleUpdate}
          onCancel={() => { setEditingId(null); setForm(emptyForm); }}
          form={form}
          setForm={setForm}
          saving={saving}
        />
      )}

      {deleteTargetId !== null && (
        <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null); }}>
          <div className="modal-card">
            <div className="modal-icon">!</div>
            <h3 className="modal-title">Eliminar servicio</h3>
            <p className="modal-text">¿Seguro que quieres eliminar este servicio?</p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setDeleteTargetId(null)}>Cancelar</button>
              <button className="danger-btn" onClick={confirmDelete} disabled={saving}>{saving ? "Eliminando..." : "Eliminar"}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: "48px", textAlign: "center", color: "var(--text-secondary)" }}>Cargando servicios...</div>
      ) : (
        <section className="customer-grid">
          {services.length === 0 ? (
            <div style={{ gridColumn: "1/-1", padding: "48px 24px", textAlign: "center", color: "var(--text-secondary)" }}>No tienes servicios aún. Crea el primero.</div>
          ) : services.map((s) => (
            <div key={s.id} className="customer-card">
              <p className="customer-name">{s.nombre}</p>
              <p className="customer-meta" style={{ fontWeight: 700, color: "var(--accent)", fontSize: "var(--text-lg)" }}>{Number(s.precio).toFixed(2)} €</p>
              {s.duracion && <p className="customer-meta">Duración: {s.duracion} min</p>}
              {s.descripcion && <p className="customer-meta">{s.descripcion}</p>}
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button className="secondary-btn" onClick={() => openEdit(s)}>Editar</button>
                <button className="secondary-btn" onClick={() => setDeleteTargetId(s.id)}>Eliminar</button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
