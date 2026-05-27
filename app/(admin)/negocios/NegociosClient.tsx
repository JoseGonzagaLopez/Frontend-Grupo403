"use client";

import { useState } from "react";
import { KeyRound, Eye, EyeOff } from "lucide-react";
import type { Business, CreateBusinessDto } from "@/lib/api";
import { createBusiness, deleteBusiness, updateBusiness } from "@/lib/api";

// ─── Modal reiniciar contraseña ───────────────────────────────────────────────
function ResetPasswordModal({
  businessId,
  businessName,
  onClose,
}: {
  businessId: number;
  businessName: string;
  onClose: () => void;
}) {
  const [newPassword, setNewPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newPassword.trim()) { setError("Introduce una contrase\u00f1a."); return; }
    setLoading(true); setError("");
    try {
      await updateBusiness(businessId, { password: newPassword });
      setSuccess(true);
    } catch {
      setError("No se pudo reiniciar la contrase\u00f1a.");
    } finally { setLoading(false); }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-card">
        <div className="modal-icon" style={{ background: "var(--primary-light, rgba(1,105,111,0.1))", color: "var(--primary, #01696f)" }}>
          <KeyRound size={22} />
        </div>
        <h3 className="modal-title">Reiniciar contrase\u00f1a</h3>
        {success ? (
          <>
            <p className="modal-text" style={{ color: "var(--success, #437a22)" }}>Contrase\u00f1a actualizada correctamente.</p>
            <div className="modal-actions">
              <button type="button" className="primary-btn" onClick={onClose}>Cerrar</button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            <p className="modal-text">Nueva contrase\u00f1a para <strong>{businessName}</strong>:</p>
            <div style={{ position: "relative" }}>
              <input
                className="input"
                type={showPwd ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contrase\u00f1a"
                style={{ paddingRight: 40, width: "100%" }}
                autoFocus
              />
              <button type="button" onClick={() => setShowPwd((v) => !v)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}
                aria-label={showPwd ? "Ocultar" : "Mostrar"}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {error && <p style={{ color: "var(--danger, #c0392b)", fontSize: "var(--text-sm)", margin: 0 }}>{error}</p>}
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={onClose}>Cancelar</button>
              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────
export default function NegociosClient({ initialBusinesses }: { initialBusinesses: Business[] }) {
  const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);
  const emptyForm: CreateBusinessDto = { Nombre: "", Localicacion: "", Telefono: "", Correo: "", password: "" };

  const [createForm, setCreateForm] = useState<CreateBusinessDto>(emptyForm);
  const [editForm, setEditForm] = useState<CreateBusinessDto>(emptyForm);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deletingBusinessId, setDeletingBusinessId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBusinessId, setEditingBusinessId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [resetTarget, setResetTarget] = useState<Business | null>(null);

  const filteredBusinesses = businesses.filter((b) =>
    b.Nombre.toLowerCase().includes(search.toLowerCase()) ||
    (b.Correo ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function updateCreateForm<K extends keyof CreateBusinessDto>(key: K, value: CreateBusinessDto[K]) {
    setCreateForm((prev) => ({ ...prev, [key]: value }));
  }
  function updateEditForm<K extends keyof CreateBusinessDto>(key: K, value: CreateBusinessDto[K]) {
    setEditForm((prev) => ({ ...prev, [key]: value }));
  }

  function openCreateForm() {
    setErrorMessage(""); setSuccessMessage("");
    setEditingBusinessId(null); setDeleteTargetId(null);
    setEditForm(emptyForm); setIsCreateOpen(true);
    setShowCreatePassword(false);
  }
  function closeCreateForm() { setErrorMessage(""); setCreateForm(emptyForm); setIsCreateOpen(false); }
  function openEditForm(business: Business) {
    setErrorMessage(""); setSuccessMessage("");
    setIsCreateOpen(false); setDeleteTargetId(null);
    setEditingBusinessId(business.id);
    setEditForm({ Nombre: business.Nombre, Localicacion: business.Localicacion ?? "", Telefono: business.Telefono ?? "", Correo: business.Correo ?? "" });
  }
  function closeEditForm() { setErrorMessage(""); setEditingBusinessId(null); setEditForm(emptyForm); }
  function openDeleteModal(id: number) { setErrorMessage(""); setSuccessMessage(""); setDeleteTargetId(id); }
  function closeDeleteModal() { setDeleteTargetId(null); }

  async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingCreate(true); setSuccessMessage(""); setErrorMessage("");
    try {
      const created = await createBusiness(createForm);
      setBusinesses((prev) => [created, ...prev]);
      setCreateForm(emptyForm); setIsCreateOpen(false);
      setSuccessMessage("Negocio creado correctamente.");
    } catch { setErrorMessage("No se pudo crear el negocio. Revisa los datos o el backend."); }
    finally { setLoadingCreate(false); }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingBusinessId) return;
    setLoadingEdit(true); setSuccessMessage(""); setErrorMessage("");
    try {
      const updated = await updateBusiness(editingBusinessId, editForm);
      setBusinesses((prev) => prev.map((b) => (b.id === editingBusinessId ? updated : b)));
      setEditingBusinessId(null); setEditForm(emptyForm);
      setSuccessMessage("Negocio actualizado correctamente.");
    } catch { setErrorMessage("No se pudo actualizar el negocio."); }
    finally { setLoadingEdit(false); }
  }

  async function confirmDelete() {
    if (deleteTargetId === null) return;
    setDeletingBusinessId(deleteTargetId); setSuccessMessage(""); setErrorMessage("");
    try {
      await deleteBusiness(deleteTargetId);
      setBusinesses((prev) => prev.filter((b) => b.id !== deleteTargetId));
      if (editingBusinessId === deleteTargetId) closeEditForm();
      setSuccessMessage("Negocio eliminado correctamente.");
      closeDeleteModal();
    } catch { setErrorMessage("No se pudo eliminar el negocio."); }
    finally { setDeletingBusinessId(null); }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Lista de negocios</h2>
          <p>Gesti\u00f3n de negocios conectada con la API.</p>
        </div>
        <button className="primary-btn" type="button" onClick={openCreateForm}>Nuevo negocio</button>
      </section>

      {successMessage && <div className="message-success">{successMessage}</div>}

      <section className="section-card">
        <div className="search-row">
          <input className="input" placeholder="Buscar negocio o correo..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="secondary-btn" type="button" onClick={() => setSearch("")}>Limpiar</button>
        </div>
      </section>

      {/* FORMULARIO CREAR */}
      {isCreateOpen && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Nuevo negocio</h3>
            <button type="button" className="secondary-btn" onClick={closeCreateForm}>Cancelar</button>
          </div>
          <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="text" value={createForm.Nombre}
                onChange={(e) => updateCreateForm("Nombre", e.target.value)}
                placeholder="Nombre del negocio" required />
              <input className="input" type="text" value={createForm.Localicacion}
                onChange={(e) => updateCreateForm("Localicacion", e.target.value)}
                placeholder="Ubicaci\u00f3n" />
              <input className="input" type="tel" value={createForm.Telefono}
                onChange={(e) => updateCreateForm("Telefono", e.target.value)}
                placeholder="Tel\u00e9fono" />
              <input className="input" type="email" value={createForm.Correo ?? ""}
                onChange={(e) => updateCreateForm("Correo", e.target.value)}
                placeholder="Correo electr\u00f3nico" />
              <div style={{ position: "relative" }}>
                <input className="input" type={showCreatePassword ? "text" : "password"}
                  value={createForm.password ?? ""}
                  onChange={(e) => updateCreateForm("password", e.target.value)}
                  placeholder="Contrase\u00f1a inicial"
                  style={{ paddingRight: 40, width: "100%" }} />
                <button type="button" onClick={() => setShowCreatePassword((v) => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center" }}
                  aria-label={showCreatePassword ? "Ocultar" : "Mostrar"}>
                  {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingCreate}>
                {loadingCreate ? "Guardando..." : "Crear negocio"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* FORMULARIO EDITAR */}
      {editingBusinessId !== null && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Editar negocio #{editingBusinessId}</h3>
            <button type="button" className="secondary-btn" onClick={closeEditForm}>Cancelar</button>
          </div>
          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <input className="input" type="text" value={editForm.Nombre}
                onChange={(e) => updateEditForm("Nombre", e.target.value)}
                placeholder="Nombre del negocio" required />
              <input className="input" type="text" value={editForm.Localicacion ?? ""}
                onChange={(e) => updateEditForm("Localicacion", e.target.value)}
                placeholder="Ubicaci\u00f3n" />
              <input className="input" type="tel" value={editForm.Telefono ?? ""}
                onChange={(e) => updateEditForm("Telefono", e.target.value)}
                placeholder="Tel\u00e9fono" />
              <input className="input" type="email" value={editForm.Correo ?? ""}
                onChange={(e) => updateEditForm("Correo", e.target.value)}
                placeholder="Correo electr\u00f3nico" />
            </div>
            {errorMessage && <div className="message-error">{errorMessage}</div>}
            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingEdit}>
                {loadingEdit ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </section>
      )}

      {/* MODAL ELIMINAR */}
      {deleteTargetId !== null && (
        <div className="modal-backdrop" role="dialog" aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}>
          <div className="modal-card">
            <div className="modal-icon">!</div>
            <h3 className="modal-title">Eliminar negocio</h3>
            <p className="modal-text">¿Seguro que quieres eliminar este negocio? Esta acci\u00f3n no se puede deshacer.</p>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={closeDeleteModal}>Cancelar</button>
              <button type="button" className="danger-btn" onClick={confirmDelete}
                disabled={deletingBusinessId === deleteTargetId}>
                {deletingBusinessId === deleteTargetId ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REINICIAR CONTRASEÑA */}
      {resetTarget && (
        <ResetPasswordModal
          businessId={resetTarget.id}
          businessName={resetTarget.Nombre}
          onClose={() => setResetTarget(null)}
        />
      )}

      {/* TARJETAS */}
      <section className="customer-grid">
        {filteredBusinesses.map((business) => (
          <div key={business.id} className="customer-card">
            <p className="customer-name">{business.Nombre}</p>
            {business.Correo && <p className="customer-meta">{business.Correo}</p>}
            {business.Localicacion && <p className="customer-meta">Ubicaci\u00f3n: {business.Localicacion}</p>}
            {business.Telefono && <p className="customer-meta">Tel: {business.Telefono}</p>}
            <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
              <button type="button" className="secondary-btn" onClick={() => openEditForm(business)}>Editar</button>
              <button type="button" className="secondary-btn" onClick={() => setResetTarget(business)}
                style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <KeyRound size={14} /> Reiniciar contrase\u00f1a
              </button>
              <button type="button" className="secondary-btn" onClick={() => openDeleteModal(business.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </section>

      {filteredBusinesses.length === 0 && (
        <p style={{ textAlign: "center", color: "#888", padding: "16px 0" }}>Sin coincidencias</p>
      )}
    </div>
  );
}
