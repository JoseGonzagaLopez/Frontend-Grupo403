"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowUp, ArrowDown, Minus, Plus } from "lucide-react";
import type { Pago, CreatePagoDto, Customer, Business } from "@/lib/api";
import {
  createPago,
  deletePago,
  updatePago,
  getCustomers,
} from "@/lib/api";

type PaymentStatus = 'pending' | 'paid' | 'Por cobrar' | 'Pagado' | string;

function Badge({ status }: { status: PaymentStatus }) {
  const isPending = status === 'pending' || status === 'Por cobrar';
  return (
    <span className={`badge badge--${isPending ? 'pending' : 'confirmed'}`}>
      {isPending ? 'Por cobrar' : 'Pagado'}
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
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

function normalizePago(p: Pago): Pago {
  return {
    ...p,
    Estado: p.Estado === "Completado" || p.Estado === "paid" ? "Pagado" : p.Estado === "pending" ? "Por cobrar" : p.Estado,
  };
}

export default function PaymentsClient({
  initialPayments,
  initialCustomers,
  initialBusinesses,
}: {
  initialPayments: Pago[];
  initialCustomers: Customer[];
  initialBusinesses: Business[];
}) {
  const [payments, setPayments] = useState<Pago[]>(() => initialPayments.map(normalizePago));
  const [customers] = useState<Customer[]>(initialCustomers);
  const [businesses] = useState<Business[]>(initialBusinesses);

  const emptyForm: CreatePagoDto = {
    customerId: 0,
    businessId: 0,
    Importe: "" as any,
    Metodo: "Pendiente",
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
  const [customerSearch, setCustomerSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'Por cobrar' | 'Pagado'>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null);

  function handleSort(column: string) {
    if (sortColumn === column) {
      if (sortDirection === "asc") setSortDirection("desc");
      else { setSortColumn(null); setSortDirection(null); }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  }

  function updateCreateForm<K extends keyof CreatePagoDto>(
    key: K,
    value: CreatePagoDto[K]
  ) {
    setCreateForm((prev) => {
      if (key === "Estado") {
        return {
          ...prev,
          Estado: value as string,
          Metodo:
            value === "Por cobrar"
              ? "Pendiente"
              : prev.Metodo === "Pendiente"
              ? ""
              : prev.Metodo,
        };
      }

      return {
        ...prev,
        [key]: value,
      };
    });
  }

  function updateEditForm<K extends keyof CreatePagoDto>(
    key: K,
    value: CreatePagoDto[K]
  ) {
    setEditForm((prev) => {
      if (key === "Estado") {
        return {
          ...prev,
          Estado: value as string,
          Metodo:
            value === "Por cobrar"
              ? "Pendiente"
              : prev.Metodo === "Pendiente"
              ? ""
              : prev.Metodo,
        };
      }

      return {
        ...prev,
        [key]: value,
      };
    });
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
      setPayments((prev) => [normalizePago(created), ...prev]);
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
          payment.ID === editingPaymentId ? normalizePago(updated) : payment
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

  const filteredPayments = payments.filter((payment) => {
    if (statusFilter !== 'all' && payment.Estado !== statusFilter) {
      return false;
    }
    if (methodFilter !== 'all' && payment.Metodo !== methodFilter) {
      return false;
    }
    if (customerSearch.trim() === "") return true;
    const customer = customers.find((c) => c.id === payment.customerId);
    const name = customer?.Nombre || (customer as any)?.nombre || "";
    return name.toLowerCase().includes(customerSearch.toLowerCase());
  });

  const paidPayments = filteredPayments.filter((p) => p.Estado === 'paid' || p.Estado === 'Pagado');
  const pendingPayments = filteredPayments.filter((p) => p.Estado === 'pending' || p.Estado === 'Por cobrar');
  const collectedTotal = paidPayments.reduce((total, payment) => total + payment.Importe, 0);
  const pendingTotal = pendingPayments.reduce((total, payment) => total + payment.Importe, 0);
  const overallTotal = filteredPayments.reduce((total, payment) => total + payment.Importe, 0);
  const conversion = filteredPayments.length > 0 ? Math.round((paidPayments.length / filteredPayments.length) * 100) : 0;

  const paymentMethods = Array.from(
    new Set(payments.map((payment) => payment.Metodo).filter((method) => method && method.trim() !== ""))
  ).sort();

  const filteredPaymentMethods = paymentMethods.filter((method) => method !== "Pendiente");

  const methodCounts = filteredPayments.reduce<Record<string, number>>((acc, payment) => {
    acc[payment.Metodo] = (acc[payment.Metodo] ?? 0) + 1;
    return acc;
  }, {});
  const mostUsedMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sin datos';

  let sortedPayments = [...filteredPayments];
  if (sortColumn && sortDirection) {
    sortedPayments = sortedPayments.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortColumn) {
        case "Cliente": {
          const cA = customers.find((c) => c.id === a.customerId);
          const cB = customers.find((c) => c.id === b.customerId);
          valA = (cA?.Nombre || (cA as any)?.nombre || `Cliente #${a.customerId}`).toLowerCase();
          valB = (cB?.Nombre || (cB as any)?.nombre || `Cliente #${b.customerId}`).toLowerCase();
          break;
        }
        case "Comercio": {
          const bA = businesses.find((biz) => biz.id === a.businessId);
          const bB = businesses.find((biz) => biz.id === b.businessId);
          valA = (bA?.Nombre || a.Comercio || `Negocio #${a.businessId}`).toLowerCase();
          valB = (bB?.Nombre || b.Comercio || `Negocio #${b.businessId}`).toLowerCase();
          break;
        }
        case "Importe":
          valA = Number(a.Importe);
          valB = Number(b.Importe);
          break;
        case "Método": {
          valA = (a.Metodo?.toLowerCase().trim() || "");
          valB = (b.Metodo?.toLowerCase().trim() || "");
          break;
        }
        case "Fecha":
          valA = new Date(a.Fecha).getTime();
          valB = new Date(b.Fecha).getTime();
          break;
        case "Estado":
          valA = a.Estado.toLowerCase();
          valB = b.Estado.toLowerCase();
          break;
      }

      if (typeof valA === "string" && typeof valB === "string") {
        const cmp = valA.localeCompare(valB);
        if (cmp !== 0) return sortDirection === "asc" ? cmp : -cmp;
        return 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Pagos</h2>
          <p>Seguimiento de cobros inmediatos realizados y pendientes.</p>
        </div>

        <button className="primary-btn" type="button" onClick={openCreateForm}>
          Registrar cobro
        </button>
      </section>

      <section className="kpi-grid">
        <KpiCard
          title="Total Pagos"
          value={`${filteredPayments.length}`}
          subtitle={`${formatCurrency(overallTotal)} € en total`}
        />
        <KpiCard
          title="Cobrado"
          value={`${formatCurrency(collectedTotal)} €`}
          subtitle={`${paidPayments.length} operaciones registradas`}
          variant="positive"
        />
        <KpiCard
          title="Pendiente"
          value={`${formatCurrency(pendingTotal)} €`}
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
              <SearchableSelect
                options={customers.map((c) => ({
                  id: c.id,
                  label: c.Nombre || (c as any).nombre || `Cliente ${c.id}`,
                }))}
                value={createForm.customerId === 0 ? "" : createForm.customerId}
                onChange={(id) => updateCreateForm("customerId", id === "" ? 0 : id)}
                placeholder="Seleccionar Cliente"
              />
              <SearchableSelect
                options={businesses.map((b) => ({
                  id: b.id,
                  label: b.Nombre || (b as any).nombre || `Empresa ${b.id}`,
                }))}
                value={createForm.businessId === 0 ? "" : createForm.businessId}
                onChange={(id) => updateCreateForm("businessId", id === "" ? 0 : id)}
                placeholder="Seleccionar Empresa"
              />
              <input
                className="input"
                type="number"
                step="0.01"
                value={createForm.Importe}
                onChange={(e) => updateCreateForm("Importe", e.target.value === "" ? "" as any : parseFloat(e.target.value))}
                placeholder="Importe"
                required
              />
              <select
                className="select"
                value={createForm.Metodo}
                onChange={(e) => updateCreateForm("Metodo", e.target.value)}
                required
                disabled={createForm.Estado === "Por cobrar"}
              >
                <option value="">Seleccionar método</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
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
              <SearchableSelect
                options={customers.map((c) => ({
                  id: c.id,
                  label: c.Nombre || (c as any).nombre || `Cliente ${c.id}`,
                }))}
                value={editForm.customerId === 0 ? "" : editForm.customerId}
                onChange={(id) => updateEditForm("customerId", id === "" ? 0 : id)}
                placeholder="Seleccionar Cliente"
              />
              <SearchableSelect
                options={businesses.map((b) => ({
                  id: b.id,
                  label: b.Nombre || (b as any).nombre || `Empresa ${b.id}`,
                }))}
                value={editForm.businessId === 0 ? "" : editForm.businessId}
                onChange={(id) => updateEditForm("businessId", id === "" ? 0 : id)}
                placeholder="Seleccionar Empresa"
              />
              <input
                className="input"
                type="number"
                step="0.01"
                value={editForm.Importe}
                onChange={(e) => updateEditForm("Importe", e.target.value === "" ? "" as any : parseFloat(e.target.value))}
                placeholder="Importe"
                required
              />
              <select
                className="select"
                value={editForm.Metodo}
                onChange={(e) => updateEditForm("Metodo", e.target.value)}
                required
                disabled={editForm.Estado === "Por cobrar"}
              >
                <option value="">Seleccionar método</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Bizum">Bizum</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
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
        <div
          className="panel-title-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <h3 className="panel-title">Listado de cobros</h3>
          <div style={{ width: '250px', minWidth: '250px' }}>
            <input
              type="text"
              className="input"
              placeholder="Buscar por cliente..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
            marginTop: 16,
            marginBottom: 12,
          }}
        >
          <div className="filter-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'Por cobrar' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Por cobrar')}
            >
              Por cobrar
            </button>
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'Pagado' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Pagado')}
            >
              Pagado
            </button>
          </div>
          <div className="filter-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end', minWidth: 0 }}>
            {filteredPaymentMethods.map((method) => (
              <button
                key={method}
                type="button"
                className={`filter-pill ${methodFilter === method ? 'active' : ''}`}
                onClick={() => setMethodFilter(method)}
              >
                {method}
              </button>
            ))}
            <button
              type="button"
              className={`filter-pill ${methodFilter === 'all' ? 'active' : ''}`}
              onClick={() => setMethodFilter('all')}
            >
              Todos
            </button>
          </div>
        </div>

        {successMessage ? <div className="message-success" style={{ marginBottom: 12 }}>{successMessage}</div> : null}
        {errorMessage ? <div className="message-error" style={{ marginBottom: 12 }}>{errorMessage}</div> : null}

        <table className="data-table">
          <thead>
            <tr>
              {["Cliente", "Comercio", "Importe", "Método", "Fecha", "Estado"].map((col) => (
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
                      <ArrowDown size={14} />
                    )}
                  </button>
                </th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedPayments.map((payment) => {
              const customer = customers.find((c) => c.id === payment.customerId);
              const business = businesses.find((b) => b.id === payment.businessId);
              return (
                <tr key={payment.ID}>
                  <td>{customer?.Nombre ?? `Cliente #${payment.customerId}`}</td>
                  <td>{business?.Nombre ?? payment.Comercio ?? `Negocio #${payment.businessId}`}</td>
                  <td>{formatCurrency(Number(payment.Importe))} €</td>
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
