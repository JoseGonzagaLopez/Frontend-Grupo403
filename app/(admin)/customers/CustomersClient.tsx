"use client";

import { useState } from "react";
import type { Customer, CreateCustomerDto } from "@/lib/api";
import {
    createCustomer,
    deleteCustomer,
    updateCustomer,
} from "@/lib/api";

export default function CustomersClient({
    initialCustomers,
}: {
    initialCustomers: Customer[];
}) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

    const emptyForm: CreateCustomerDto = {
        Nombre: "",
        Telefono: "",
        Correo: "",
    };

    const [createForm, setCreateForm] = useState<CreateCustomerDto>(emptyForm);
    const [editForm, setEditForm] = useState<CreateCustomerDto>(emptyForm);

    const [loadingCreate, setLoadingCreate] = useState(false);
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
    const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

    function updateCreateForm<K extends keyof CreateCustomerDto>(
        key: K,
        value: CreateCustomerDto[K]
    ) {
        setCreateForm((prev) => ({ ...prev, [key]: value }));
    }

    function updateEditForm<K extends keyof CreateCustomerDto>(
        key: K,
        value: CreateCustomerDto[K]
    ) {
        setEditForm((prev) => ({ ...prev, [key]: value }));
    }

    function openCreateForm() {
        setErrorMessage("");
        setSuccessMessage("");
        setEditingCustomerId(null);
        setDeleteTargetId(null);
        setEditForm(emptyForm);
        setIsCreateOpen(true);
    }

    function closeCreateForm() {
        setErrorMessage("");
        setCreateForm(emptyForm);
        setIsCreateOpen(false);
    }

    function openEditForm(customer: Customer) {
        setErrorMessage("");
        setSuccessMessage("");
        setIsCreateOpen(false);
        setDeleteTargetId(null);
        setEditingCustomerId(customer.id);
        setEditForm({
            Nombre: customer.Nombre,
            Telefono: customer.Telefono,
            Correo: customer.Correo,
        });
    }

    function closeEditForm() {
        setErrorMessage("");
        setEditingCustomerId(null);
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
            const created = await createCustomer(createForm);
            setCustomers((prev) => [created, ...prev]);
            setCreateForm(emptyForm);
            setIsCreateOpen(false);
            setSuccessMessage("Cliente creado correctamente.");
        } catch {
            setErrorMessage("No se pudo crear el cliente. Revisa los datos o el backend.");
        } finally {
            setLoadingCreate(false);
        }
    }

    async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!editingCustomerId) return;
        setLoadingEdit(true);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            const updated = await updateCustomer(editingCustomerId, editForm);
            setCustomers((prev) =>
                prev.map((c) => (c.id === editingCustomerId ? updated : c))
            );
            setEditingCustomerId(null);
            setEditForm(emptyForm);
            setSuccessMessage("Cliente actualizado correctamente.");
        } catch {
            setErrorMessage("No se pudo actualizar el cliente.");
        } finally {
            setLoadingEdit(false);
        }
    }

    async function confirmDelete() {
        if (deleteTargetId === null) return;
        setDeletingCustomerId(deleteTargetId);
        setSuccessMessage("");
        setErrorMessage("");
        try {
            await deleteCustomer(deleteTargetId);
            setCustomers((prev) => prev.filter((c) => c.id !== deleteTargetId));
            if (editingCustomerId === deleteTargetId) closeEditForm();
            setSuccessMessage("Cliente eliminado correctamente.");
            closeDeleteModal();
        } catch {
            setErrorMessage("No se pudo eliminar el cliente.");
        } finally {
            setDeletingCustomerId(null);
        }
    }

    return (
        <div className="page-stack">
            {/* CABECERA */}
            <section className="page-hero">
                <div>
                    <h2>Lista de clientes</h2>
                    <p>Gestión de clientes conectada con la API.</p>
                </div>
                <button className="primary-btn" type="button" onClick={openCreateForm}>
                    Nuevo cliente
                </button>
            </section>

            {/* nuevo el buscador */}
            <section className="section-card">
                <div className="search-row">
                    <input className="input" placeholder="Buscar cliente..." />
                    <button className="secondary-btn" type="button">Filtrar</button>
                </div>
            </section>

            {/* FORMULARIO CREAR */}
            {isCreateOpen && (
                <section className="section-card">
                    <div className="panel-title-row">
                        <h3 className="panel-title">Nuevo cliente</h3>
                        <button type="button" className="secondary-btn" onClick={closeCreateForm}>
                            Cancelar
                        </button>
                    </div>
                    <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
                        <div className="form-grid">
                            <input className="input" type="text"
                                value={createForm.Nombre}
                                onChange={(e) => updateCreateForm("Nombre", e.target.value)}
                                placeholder="Nombre completo" required
                            />
                            <input className="input" type="tel"
                                value={createForm.Telefono}
                                onChange={(e) => updateCreateForm("Telefono", e.target.value)}
                                placeholder="Teléfono" required
                            />
                            <input className="input" type="email"
                                value={createForm.Correo}
                                onChange={(e) => updateCreateForm("Correo", e.target.value)}
                                placeholder="Correo electrónico" required
                            />
                        </div>
                        {errorMessage && <div className="message-error">{errorMessage}</div>}
                        <div className="message-row">
                            <button className="primary-btn" type="submit" disabled={loadingCreate}>
                                {loadingCreate ? "Guardando..." : "Crear cliente"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            {/* FORMULARIO EDITAR */}
            {editingCustomerId !== null && (
                <section className="section-card">
                    <div className="panel-title-row">
                        <h3 className="panel-title">Editar cliente #{editingCustomerId}</h3>
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
                                placeholder="Nombre completo"
                                required
                            />
                            <input
                                className="input"
                                type="tel"
                                value={editForm.Telefono}
                                onChange={(e) => updateEditForm("Telefono", e.target.value)}
                                placeholder="Teléfono"
                                required
                            />
                            <input
                                className="input"
                                type="email"
                                value={editForm.Correo}
                                onChange={(e) => updateEditForm("Correo", e.target.value)}
                                placeholder="Email"
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
                        <h3 className="modal-title">Eliminar cliente</h3>
                        <p className="modal-text">
                            ¿Seguro que quieres eliminar este cliente? Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={closeDeleteModal}>
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="danger-btn"
                                onClick={confirmDelete}
                                disabled={deletingCustomerId === deleteTargetId}
                            >
                                {deletingCustomerId === deleteTargetId ? "Eliminando..." : "Eliminar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TABLA */}
            <section className="customer-grid">
                {customers.map((customer) => {
                    const negocios = [...new Set(
                        (customer.appointments ?? [])
                            .map((a) => a.negocio?.Nombre)
                            .filter(Boolean)
                    )];

                    return (
                        <div key={customer.id} className="customer-card">
                            <p className="customer-name">{customer.Nombre}</p>
                            <p className="customer-meta">{customer.Telefono}</p>
                            <p className="customer-meta">{customer.Correo}</p>

                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                                {negocios.map((negocio) => (
                                    <div key={negocio} className="customer-tag">{negocio}</div>
                                ))}
                            </div>

                            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                                <button type="button" className="secondary-btn" onClick={() => openEditForm(customer)}>Editar</button>
                                <button type="button" className="secondary-btn" onClick={() => openDeleteModal(customer.id)}>Eliminar</button>
                            </div>
                        </div>
                    );
                })}
            </section>
        </div>
    );
}