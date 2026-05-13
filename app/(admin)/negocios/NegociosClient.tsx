"use client";

import { useState } from "react";
import type { Negocio, CreateNegocioDto } from "@/lib/api";
import {
    createNegocio,
    deleteNegocio,
    updateNegocio,
} from "@/lib/api";

export default function NegociosClient({
    initialNegocios,
}: {
    initialNegocios: Negocio[];
}) {
    const [negocios, setNegocios] = useState<Negocio[]>(initialNegocios);

    const emptyForm: CreateNegocioDto = {
        Nombre: "",
    };

    const [createForm, setCreateForm] = useState<CreateNegocioDto>(emptyForm);
    const [editForm, setEditForm] = useState<CreateNegocioDto>(emptyForm);

    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [deletingNegocioId, setDeletingNegocioId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingNegocioId, setEditingNegocioId] = useState<number | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
    const [search, setSearch] = useState("");

    const filteredNegocios = negocios.filter((negocio) => {
        const term = search.toLowerCase();
        return (
            negocio.Nombre.toLowerCase().includes(term)
        );
    });

    function updateCreateForm<K extends keyof CreateNegocioDto>(
        key: K,
        value: CreateNegocioDto[K]
    ) {
        setCreateForm((prev) => ({ ...prev, [key]: value }));
    }

    function updateEditForm<K extends keyof CreateNegocioDto>(
        key: K,
        value: CreateNegocioDto[K]
    ) {
        setEditForm((prev) => ({ ...prev, [key]: value }));
    }

    function openCreateForm() {
        setErrorMessage("");
        setSuccessMessage("");
        setEditingNegocioId(null);
        setDeleteTargetId(null);
        setEditForm(emptyForm);
        setIsCreateOpen(true);
    }

    function closeCreateForm() {
        setErrorMessage("");
        setCreateForm(emptyForm);
        setIsCreateOpen(false);
    }

    function openEditForm(negocio: Negocio) {
        setErrorMessage("");
        setSuccessMessage("");
        setIsCreateOpen(false);
        setDeleteTargetId(null);
        setEditingNegocioId(negocio.id);
        setEditForm({
            Nombre: negocio.Nombre,
        });
    }

    function closeEditForm() {
        setErrorMessage("");
        setEditingNegocioId(null);
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
            const created = await createNegocio(createForm);
            setNegocios((prev) => [created, ...prev]);
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
        if (!editingNegocioId) return;
        setLoadingEdit(true);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            const updated = await updateNegocio(editingNegocioId, editForm);
            setNegocios((prev) =>
                prev.map((n) => (n.id === editingNegocioId ? updated : n))
            );
            setEditingNegocioId(null);
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
        setDeletingNegocioId(deleteTargetId);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            await deleteNegocio(deleteTargetId);
            setNegocios((prev) => prev.filter((n) => n.id !== deleteTargetId));
            if (editingNegocioId === deleteTargetId) closeEditForm();
            setSuccessMessage("Negocio eliminado correctamente.");
            closeDeleteModal();
        } catch {
            setErrorMessage("No se pudo eliminar el negocio.");
        } finally {
            setDeletingNegocioId(null);
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
            {editingNegocioId !== null && (
                <section className="section-card">
                    <div className="panel-title-row">
                        <h3 className="panel-title">Editar negocio #{editingNegocioId}</h3>
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
                                disabled={deletingNegocioId === deleteTargetId}
                            >
                                {deletingNegocioId === deleteTargetId ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLA */}
            <section className="customer-grid">
                {filteredNegocios.map((negocio) => (
                    <div key={negocio.id} className="customer-card">
                        <p className="customer-name">{negocio.Nombre}</p>

                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <button type="button" className="secondary-btn" onClick={() => openEditForm(negocio)}>Editar</button>
                            <button type="button" className="secondary-btn" onClick={() => openDeleteModal(negocio.id)}>Eliminar</button>
                        </div>
                    </div>
                ))}
            </section>

            {filteredNegocios.length === 0 && (
                <p style={{ textAlign: "center", color: "#888", padding: "16px 0" }}>
                    Sin coincidencias
                </p>
            )}
        </div >
    );
}
