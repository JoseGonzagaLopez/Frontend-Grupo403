"use client";

import { useState } from "react";
import type { Business, CreateBusinessDto } from "@/lib/api";
import {
    createBusiness,
    deleteBusiness,
    updateBusiness,
} from "@/lib/api";

export default function NegociosClient({
    initialBusinesses,
}: {
    initialBusinesses: Business[];
}) {
    const [businesses, setBusinesses] = useState<Business[]>(initialBusinesses);

    const emptyForm: CreateBusinessDto = {
        Nombre: "",
        Localicacion: "",
        Telefono: "",
    };

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

    const filteredBusinesses = businesses.filter((business) => {
        const term = search.toLowerCase();
        return business.Nombre.toLowerCase().includes(term);
    });

    function updateCreateForm<K extends keyof CreateBusinessDto>(
        key: K,
        value: CreateBusinessDto[K]
    ) {
        setCreateForm((prev) => ({ ...prev, [key]: value }));
    }

    function updateEditForm<K extends keyof CreateBusinessDto>(
        key: K,
        value: CreateBusinessDto[K]
    ) {
        setEditForm((prev) => ({ ...prev, [key]: value }));
    }

    function openCreateForm() {
        setErrorMessage("");
        setSuccessMessage("");
        setEditingBusinessId(null);
        setDeleteTargetId(null);
        setEditForm(emptyForm);
        setIsCreateOpen(true);
    }

    function closeCreateForm() {
        setErrorMessage("");
        setCreateForm(emptyForm);
        setIsCreateOpen(false);
    }

    function openEditForm(business: Business) {
        setErrorMessage("");
        setSuccessMessage("");
        setIsCreateOpen(false);
        setDeleteTargetId(null);
        setEditingBusinessId(business.id);
        setEditForm({
            Nombre: business.Nombre,
            Localicacion: business.Localicacion ?? "",
            Telefono: business.Telefono ?? "",
        });
    }

    function closeEditForm() {
        setErrorMessage("");
        setEditingBusinessId(null);
        setEditForm(emptyForm);
    }

    function openDeleteModal(id: number) {
        setErrorMessage("");
        setSuccessMessage("");
        setDeleteTargetId(id);
    }

    function closeDeleteModal() {
        setDeleteTargetId(null);
    }

    async function handleCreateSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoadingCreate(true);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            const created = await createBusiness(createForm);
            setBusinesses((prev) => [created, ...prev]);
            setCreateForm(emptyForm);
            setIsCreateOpen(false);
            setSuccessMessage("Negocio creado correctamente.");
        } catch {
            setErrorMessage("No se pudo crear el negocio. Revisa los datos o el backend.");
        } finally {
            setLoadingCreate(false);
        }
    }

    async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingBusinessId) return;
        setLoadingEdit(true);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            const updated = await updateBusiness(editingBusinessId, editForm);
            setBusinesses((prev) =>
                prev.map((b) => (b.id === editingBusinessId ? updated : b))
            );
            setEditingBusinessId(null);
            setEditForm(emptyForm);
            setSuccessMessage("Negocio actualizado correctamente.");
        } catch {
            setErrorMessage("No se pudo actualizar el negocio.");
        } finally {
            setLoadingEdit(false);
        }
    }

    async function confirmDelete() {
        if (deleteTargetId === null) return;
        setDeletingBusinessId(deleteTargetId);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            await deleteBusiness(deleteTargetId);
            setBusinesses((prev) => prev.filter((b) => b.id !== deleteTargetId));
            if (editingBusinessId === deleteTargetId) closeEditForm();
            setSuccessMessage("Negocio eliminado correctamente.");
            closeDeleteModal();
        } catch {
            setErrorMessage("No se pudo eliminar el negocio.");
        } finally {
            setDeletingBusinessId(null);
        }
    }

    return (
        <div className="page-stack">
            {/* CABECERA */}
            <section className="page-hero">
                <div>
                    <h2>Lista de negocios</h2>
                    <p>Gestión de negocios conectada con la API.</p>
                </div>
                <button className="primary-btn" type="button" onClick={openCreateForm}>
                    Nuevo negocio
                </button>
            </section>

            {/* BUSCADOR */}
            <section className="section-card">
                <div className="search-row">
                    <input
                        className="input"
                        placeholder="Buscar negocio..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button className="secondary-btn" type="button" onClick={() => setSearch("")}>
                        Limpiar
                    </button>
                </div>
            </section>

            {/* FORMULARIO CREAR */}
            {isCreateOpen && (
                <section className="section-card">
                    <div className="panel-title-row">
                        <h3 className="panel-title">Nuevo negocio</h3>
                        <button type="button" className="secondary-btn" onClick={closeCreateForm}>
                            Cancelar
                        </button>
                    </div>
                    <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
                        <div className="form-grid">
                            <input className="input" type="text"
                                value={createForm.Nombre}
                                onChange={(e) => updateCreateForm("Nombre", e.target.value)}
                                placeholder="Nombre del negocio" required
                            />
                            <input className="input" type="text"
                                value={createForm.Localicacion}
                                onChange={(e) => updateCreateForm("Localicacion", e.target.value)}
                                placeholder="Ubicación del negocio"
                            />
                            <input className="input" type="text"
                                value={createForm.Telefono}
                                onChange={(e) => updateCreateForm("Telefono", e.target.value)}
                                placeholder="Teléfono del negocio"
                            />
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
                        <button type="button" className="secondary-btn" onClick={closeEditForm}>
                            Cancelar
                        </button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
                        <div className="form-grid">
                            <input
                                className="input"
                                type="text"
                                value={editForm.Nombre}
                                onChange={(e) => updateEditForm("Nombre", e.target.value)}
                                placeholder="Nombre del negocio"
                                required
                            />
                            <input
                                className="input"
                                type="text"
                                value={editForm.Localicacion}
                                onChange={(e) => updateEditForm("Localicacion", e.target.value)}
                                placeholder="Ubicación del negocio"
                            />
                            <input
                                className="input"
                                type="text"
                                value={editForm.Telefono}
                                onChange={(e) => updateEditForm("Telefono", e.target.value)}
                                placeholder="Teléfono del negocio"
                            />
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
                <div
                    className="modal-backdrop"
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
                >
                    <div className="modal-card">
                        <div className="modal-icon">!</div>
                        <h3 className="modal-title">Eliminar negocio</h3>
                        <p className="modal-text">
                            ¿Seguro que quieres eliminar este negocio? Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={closeDeleteModal}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="danger-btn"
                                onClick={confirmDelete}
                                disabled={deletingBusinessId === deleteTargetId}
                            >
                                {deletingBusinessId === deleteTargetId ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLA / TARJETAS */}
            <section className="customer-grid">
                {filteredBusinesses.map((business) => (
                    <div key={business.id} className="customer-card">
                        <p className="customer-name">{business.Nombre}</p>
                        {business.Localicacion && (
                            <p className="customer-meta">Ubicación: {business.Localicacion}</p>
                        )}
                        {business.Telefono && (
                            <p className="customer-meta">Teléfono: {business.Telefono}</p>
                        )}
                        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                            <button type="button" className="secondary-btn" onClick={() => openEditForm(business)}>Editar</button>
                            <button type="button" className="secondary-btn" onClick={() => openDeleteModal(business.id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </section>

            {filteredBusinesses.length === 0 && (
                <p style={{ textAlign: "center", color: "#888", padding: "16px 0" }}>
                    Sin coincidencias
                </p>
            )}
        </div >
    );
}
