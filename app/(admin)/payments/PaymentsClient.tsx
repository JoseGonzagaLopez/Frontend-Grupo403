"use client";

import { useState } from "react";
import type { Pago, CreatePagoDto, Customer } from "@/lib/api";
import {
  createPago,
  deletePago,
  updatePago,
  getCustomers,
} from "@/lib/api";

type PaymentStatus = 'pending' | 'paid' | 'Por cobrar' | 'Pagado' | string;

function Badge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`badge badge--${status === 'pending' ? 'pending' : 'confirmed'}`}>
      {status === 'pending' ? 'Por cobrar' : 'Pagado'}
    </span>
  );
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function KpiCard({
  title,
  value,
  subtitle,
  variant,
}: {
  title: string;
  value: string;
  subtitle: string;
  variant?: 'positive' | 'warning';
}) {
  return (
    <div className="kpi-card">
      <p className="kpi-card__label">{title}</p>
      <h3 className="kpi-card__value">{value}</h3>
      <p
        className={`kpi-card__meta ${variant === 'positive'
          ? 'kpi-card__meta--positive'
          : variant === 'warning'
            ? 'kpi-card__meta--warning'
            : ''
          }`}
      >
        {subtitle}
      </p>
    </div>
  );
}

export default function PaymentsClient({
  initialPayments,
  initialCustomers,
}: {
  initialPayments: Pago[];
  initialCustomers: Customer[];
}) {
  const [payments, setPayments] = useState<Pago[]>(initialPayments);
  const [customers] = useState<Customer[]>(initialCustomers);

  const emptyForm: CreatePagoDto = {
    customerId: 0,
    businessId: 0,
    Importe: 0,
    Metodo: "",
    Fecha: "",
    Estado: "Por cobrar",
  };

  const [createForm, setCreateForm] = useState<CreatePagoDto>(emptyForm);
  const [editForm, setEditForm] = useState<CreatePagoDto>(emptyForm);

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deletingPaymentId, setDeletingPaymentId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  function updateCreateForm<K extends keyof CreatePagoDto>(
    key: K,
    value: CreatePagoDto[K]
  ) {
    setCreateForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateEditForm<K extends keyof CreatePagoDto>(
    key: K,
    value: CreatePagoDto[K]
  ) {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function openCreateForm() {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingPaymentId(null);
    setDeleteTargetId(null);
    setEditForm(emptyForm);
    setIsCreateOpen(true);
  }

  function closeCreateForm() {
    setErrorMessage("");
    setCreateForm(emptyForm);
    setIsCreateOpen(false);
  }

  function openEditForm(payment: Pago) {
    setErrorMessage("");
    setSuccessMessage("");
    setIsCreateOpen(false);
    setDeleteTargetId(null);
    setEditingPaymentId(payment.ID);
    setEditForm({
      customerId: payment.customerId,
      businessId: payment.businessId,
      Importe: payment.Importe,
      Metodo: payment.Metodo,
      Fecha: payment.Fecha,
      Estado: payment.Estado,
    });
  }

  function closeEditForm() {
    setErrorMessage("");
    setEditingPaymentId(null);
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
      const created = await createPago(createForm);
      setPayments((prev) => [created, ...prev]);
      setCreateForm(emptyForm);
      setIsCreateOpen(false);
      setSuccessMessage("Pago creado correctamente.");
    } catch {
      setErrorMessage("No se pudo crear el pago. Revisa los datos introducidos");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editingPaymentId) return;

    setLoadingEdit(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updated = await updatePago(editingPaymentId, editForm);

      setPayments((prev) =>
        prev.map((payment) =>
          payment.ID === editingPaymentId ? updated : payment
        )
      );

      setEditingPaymentId(null);
      setEditForm(emptyForm);
      setSuccessMessage("Pago actualizado correctamente.");
    } catch {
      setErrorMessage("No se pudo actualizar el pago.");
    } finally {
      setLoadingEdit(false);
    }
  }

  async function confirmDelete() {
    if (deleteTargetId === null) return;

    setDeletingPaymentId(deleteTargetId);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await deletePago(deleteTargetId);
      setPayments((prev) => prev.filter((payment) => payment.ID !== deleteTargetId));

      if (editingPaymentId === deleteTargetId) {
        closeEditForm();
      }

      setSuccessMessage("Pago eliminado correctamente.");
      closeDeleteModal();
    } catch {
      setErrorMessage("No se pudo eliminar el pago.");
    } finally {
      setDeletingPaymentId(null);
    }
  }

  const paidPayments = payments.filter((p) => p.Estado === 'paid' || p.Estado === 'Pagado');
  const pendingPayments = payments.filter((p) => p.Estado === 'pending' || p.Estado === 'Por cobrar');
  const collectedTotal = paidPayments.reduce((total, payment) => total + payment.Importe, 0);
  const conversion = payments.length > 0 ? Math.round((paidPayments.length / payments.length) * 100) : 0;

  const methodCounts = payments.reduce<Record<string, number>>((acc, payment) => {
    acc[payment.Metodo] = (acc[payment.Metodo] ?? 0) + 1;
    return acc;
  }, {});
  const mostUsedMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sin datos';

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Pagos</h2>
          <p>Seguimiento de cobros realizados y pendientes.</p>
        </div>

        <button className="primary-btn" type="button" onClick={openCreateForm}>
          Registrar cobro
        </button>
      </section>

      <section className="kpi-grid">
        <KpiCard
          title="Cobrado"
          value={`${collectedTotal} €`}
          subtitle={`${paidPayments.length} operaciones registradas`}
          variant="positive"
        />
        <KpiCard
          title="Pendiente"
          value={`${pendingPayments.length}`}
          subtitle={`${pendingPayments.length} cobros por revisar`}
          variant="warning"
        />
        <KpiCard title="Método más usado" value={mostUsedMethod} subtitle="Mayor volumen" />
        <KpiCard title="Conversión" value={`${conversion}%`} subtitle="Cobros cerrados" />
      </section>

      {isCreateOpen && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Registrar nuevo cobro</h3>
            <button type="button" className="secondary-btn" onClick={closeCreateForm}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <select
                className="select"
                value={createForm.customerId}
                onChange={(e) => updateCreateForm("customerId", Number(e.target.value))}
                required
              >
                <option value={0}>Seleccionar cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.Nombre}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                min={1}
                value={createForm.businessId}
                onChange={(e) => updateCreateForm("businessId", Number(e.target.value))}
                placeholder="ID Negocio"
                required
              />
              <input
                className="input"
                type="number"
                step="0.01"
                value={createForm.Importe}
                onChange={(e) => updateCreateForm("Importe", parseFloat(e.target.value))}
                placeholder="Importe"
                required
              />
              <select
                className="select"
                value={createForm.Metodo}
                onChange={(e) => updateCreateForm("Metodo", e.target.value)}
                required
              >
                <option value="">Seleccionar método</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <input
                className="input"
                type="date"
                value={createForm.Fecha}
                onChange={(e) => updateCreateForm("Fecha", e.target.value)}
                required
              />
              <select
                className="select"
                value={createForm.Estado}
                onChange={(e) => updateCreateForm("Estado", e.target.value)}
              >
                <option value="Por cobrar">Por cobrar</option>
                <option value="Pagado">Pagado</option>
              </select>
            </div>

            {errorMessage ? <div className="message-error">{errorMessage}</div> : null}

            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingCreate}>
                {loadingCreate ? "Guardando..." : "Registrar cobro"}
              </button>
            </div>
          </form>
        </section>
      )}

      {editingPaymentId !== null && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Editar pago #{editingPaymentId}</h3>
            <button type="button" className="secondary-btn" onClick={closeEditForm}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <select
                className="select"
                value={editForm.customerId}
                onChange={(e) => updateEditForm("customerId", Number(e.target.value))}
                required
              >
                <option value={0}>Seleccionar cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.Nombre}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="number"
                min={1}
                value={editForm.businessId}
                onChange={(e) => updateEditForm("businessId", Number(e.target.value))}
                placeholder="ID Negocio"
                required
              />
              <input
                className="input"
                type="number"
                step="0.01"
                value={editForm.Importe}
                onChange={(e) => updateEditForm("Importe", parseFloat(e.target.value))}
                placeholder="Importe"
                required
              />
              <select
                className="select"
                value={editForm.Metodo}
                onChange={(e) => updateEditForm("Metodo", e.target.value)}
                required
              >
                <option value="">Seleccionar método</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Pendiente">Pendiente</option>
              </select>
              <input
                className="input"
                type="date"
                value={editForm.Fecha}
                onChange={(e) => updateEditForm("Fecha", e.target.value)}
                required
              />
              <select
                className="select"
                value={editForm.Estado}
                onChange={(e) => updateEditForm("Estado", e.target.value)}
              >
                <option value="Por cobrar">Por cobrar</option>
                <option value="Pagado">Pagado</option>
              </select>
            </div>

            {errorMessage ? <div className="message-error">{errorMessage}</div> : null}

            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingEdit}>
                {loadingEdit ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        </section>
      )}

      {deleteTargetId !== null && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          aria-describedby="delete-modal-description"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
        >
          <div className="modal-card">
            <div className="modal-icon">!</div>
            <h3 id="delete-modal-title" className="modal-title">
              Eliminar pago
            </h3>
            <p id="delete-modal-description" className="modal-text">
              ¿Seguro que quieres eliminar este pago? Esta acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={closeDeleteModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={confirmDelete}
                disabled={deletingPaymentId === deleteTargetId}
              >
                {deletingPaymentId === deleteTargetId ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Listado de cobros</h3>
          <span style={{ color: '#6b7280', fontSize: 14 }}>
            {payments.length} resultados
          </span>
        </div>

        {successMessage ? <div className="message-success" style={{ marginBottom: 12 }}>{successMessage}</div> : null}
        {errorMessage ? <div className="message-error" style={{ marginBottom: 12 }}>{errorMessage}</div> : null}

        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Comercio</th>
              <th>Importe</th>
              <th>Método</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const customer = customers.find((c) => c.id === payment.customerId);
              return (
                <tr key={payment.ID}>
                  <td>{customer?.Nombre ?? `Cliente #${payment.customerId}`}</td>
                  <td>{payment.Comercio ?? `Negocio #${payment.businessId}`}</td>
                  <td>{payment.Importe} €</td>
                  <td>{payment.Metodo}</td>
                  <td>{formatDate(payment.Fecha)}</td>
                  <td>
                    <Badge status={payment.Estado} />
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" className="secondary-btn" onClick={() => openEditForm(payment)}>
                        Editar
                      </button>
                      <button type="button" className="secondary-btn" onClick={() => openDeleteModal(payment.ID)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
