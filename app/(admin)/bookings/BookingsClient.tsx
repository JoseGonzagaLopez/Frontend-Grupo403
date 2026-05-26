"use client";

import { useMemo, useState } from "react";
import type {
  Booking,
  BookingStatus,
  CreateBookingDto,
  UpdateBookingDto,
  Customer,
  Business,
} from "@/lib/api";
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
} from "@/lib/api";
import { useEffect, useRef } from "react";
import { CustomDatePicker } from "@/components/CustomDatePicker";

function StatusBadge({ status }: { status: BookingStatus }) {
  const label =
    status === "pending"
      ? "Pendiente"
      : status === "confirmed"
        ? "Confirmada"
        : "Pagada";

  return <span className={`badge badge--${status}`}>{label}</span>;
}

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

type BookingForm = Omit<CreateBookingDto, 'importe'> & {
  importe: number | "";
};

function formatImporte(value: number | undefined) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value ?? 0);
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


export default function BookingsClient({
  initialBookings,
  initialCustomers,
  initialBusinesses,
}: {
  initialBookings: Booking[];
  initialCustomers: Customer[];
  initialBusinesses: Business[];
}) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [customers] = useState<Customer[]>(initialCustomers);
  const [businesses] = useState<Business[]>(initialBusinesses);

  const emptyForm: BookingForm = {
    date: "",
    time: "",
    status: "pending",
    customerId: "" as any,
    businessId: "" as any,
    serviceName: "",
    importe: "",
  };

  const [createForm, setCreateForm] = useState<BookingForm>(emptyForm);
  const [editForm, setEditForm] = useState<BookingForm>(emptyForm);

  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [customerFilter, setCustomerFilter] = useState<number | "">("");
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const filteredBookings = useMemo(() => {
    let filtered = bookings;

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (customerFilter !== "") {
      filtered = filtered.filter((booking) => booking.customerId === customerFilter);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }, [bookings, statusFilter, customerFilter]);

  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const paidCount = bookings.filter((b) => b.status === "paid").length;

  function updateCreateForm<K extends keyof CreateBookingDto>(
    key: K,
    value: CreateBookingDto[K]
  ) {
    setCreateForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function updateEditForm<K extends keyof CreateBookingDto>(
    key: K,
    value: CreateBookingDto[K]
  ) {
    setEditForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function resetCreateForm() {
    setCreateForm(emptyForm);
  }

  function resetEditForm() {
    setEditForm(emptyForm);
  }

  function openCreateForm() {
    setErrorMessage("");
    setSuccessMessage("");
    setEditingBookingId(null);
    setDeleteTargetId(null);
    resetEditForm();
    setIsCreateOpen(true);
  }

  function closeCreateForm() {
    setErrorMessage("");
    resetCreateForm();
    setIsCreateOpen(false);
  }

  function openEditForm(booking: Booking) {
    setErrorMessage("");
    setSuccessMessage("");
    setIsCreateOpen(false);
    setDeleteTargetId(null);
    setEditingBookingId(booking.id);
    setEditForm({
      date: booking.date,
      time: booking.time,
      status: booking.status,
      customerId: booking.customerId,
      businessId: booking.businessId,
      serviceName: booking.serviceName,
      importe: booking.importe ?? 0,
    });
  }

  function closeEditForm() {
    setErrorMessage("");
    setEditingBookingId(null);
    resetEditForm();
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
    if (
      !createForm.date ||
      !createForm.time ||
      (createForm.customerId as any) === "" ||
      (createForm.businessId as any) === "" ||
      !createForm.serviceName ||
      createForm.importe === ""
    ) {
      setErrorMessage("Completa todos los campos");
      setSuccessMessage("");
      return;
    }
    setLoadingCreate(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const importeValue =
        (createForm.importe as any) === ""
          ? NaN
          : Number(createForm.importe);

      if ((createForm.importe as any) === "" || Number.isNaN(importeValue)) {
        throw new Error("Importe inválido");
      }

      const created = await createAppointment({
        ...createForm,
        importe: importeValue,
      });
      setBookings((prev) => [created, ...prev]);
      resetCreateForm();
      setIsCreateOpen(false);
      setSuccessMessage("Reserva creada correctamente.");
    } catch {
      setErrorMessage("No se pudo crear la reserva. Revisa los datos o el backend.");
    } finally {
      setLoadingCreate(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editingBookingId) return;
    if (
      !editForm.date ||
      !editForm.time ||
      (editForm.customerId as any) === "" ||
      (editForm.businessId as any) === "" ||
      !editForm.serviceName ||
      editForm.importe === ""
    ) {
      setErrorMessage("Completa todos los campos");
      setSuccessMessage("");
      return;
    }

    setLoadingEdit(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const importeValue =
        (editForm.importe as any) === ""
          ? NaN
          : Number(editForm.importe);

      if ((editForm.importe as any) === "" || Number.isNaN(importeValue)) {
        throw new Error("Importe inválido");
      }

      const payload: UpdateBookingDto = {
        date: editForm.date,
        time: editForm.time,
        status: editForm.status,
        customerId: editForm.customerId,
        businessId: editForm.businessId,
        serviceName: editForm.serviceName,
        importe: importeValue,
      };

      const updated = await updateAppointment(editingBookingId, payload);

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === editingBookingId ? updated : booking
        )
      );

      setEditingBookingId(null);
      resetEditForm();
      setSuccessMessage("Reserva actualizada correctamente.");
    } catch {
      setErrorMessage("No se pudo actualizar la reserva.");
    } finally {
      setLoadingEdit(false);
    }
  }

  async function confirmDelete() {
    if (deleteTargetId === null) return;

    setDeletingBookingId(deleteTargetId);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      await deleteAppointment(deleteTargetId);
      setBookings((prev) => prev.filter((booking) => booking.id !== deleteTargetId));

      if (editingBookingId === deleteTargetId) {
        closeEditForm();
      }

      setSuccessMessage("Reserva eliminada correctamente.");
      closeDeleteModal();
    } catch {
      setErrorMessage("No se pudo eliminar la reserva.");
    } finally {
      setDeletingBookingId(null);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Lista de reservas</h2>
          <p>Gestión de reservas conectada con la API.</p>
        </div>

        <button className="primary-btn" type="button" onClick={openCreateForm}>
          Nueva reserva
        </button>
      </section>

      <section className="kpi-grid">
        <div className="kpi-card">
          <p className="kpi-card__label">Total reservas</p>
          <h3 className="kpi-card__value">{totalCount}</h3>
          <p className="kpi-card__meta">Registros disponibles</p>
        </div>

        <div className="kpi-card">
          <p className="kpi-card__label">Pendientes</p>
          <h3 className="kpi-card__value">{pendingCount}</h3>
          <p className="kpi-card__meta kpi-card__meta--warning">
            Requieren seguimiento
          </p>
        </div>

        <div className="kpi-card">
          <p className="kpi-card__label">Confirmadas</p>
          <h3 className="kpi-card__value">{confirmedCount}</h3>
          <p className="kpi-card__meta kpi-card__meta--positive">
            Estado activo
          </p>
        </div>

        <div className="kpi-card">
          <p className="kpi-card__label">Pagadas</p>
          <h3 className="kpi-card__value">{paidCount}</h3>
          <p className="kpi-card__meta">Reservas cerradas</p>
        </div>
      </section>

      {isCreateOpen && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Nueva reserva</h3>
            <button type="button" className="secondary-btn" onClick={closeCreateForm}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <CustomDatePicker
                value={createForm.date}
                onChange={(date) => updateCreateForm("date", date)}
              />
              <input
                className="input"
                type="time"
                value={createForm.time}
                onChange={(e) => updateCreateForm("time", e.target.value)}
                onClick={(e) => {
                  if ('showPicker' in HTMLInputElement.prototype) {
                    e.currentTarget.showPicker();
                  }
                }}
                required
              />
              <select
                className="select"
                value={createForm.status}
                onChange={(e) =>
                  updateCreateForm("status", e.target.value as BookingStatus)
                }
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="paid">Pagada</option>
              </select>
              <SearchableSelect
                options={customers.map((c) => ({
                  id: c.id,
                  label: c.Nombre || (c as any).nombre || `Cliente ${c.id}`,
                }))}
                value={createForm.customerId}
                onChange={(id) => updateCreateForm("customerId", id as number)}
                placeholder="Seleccionar Cliente"
              />
              <SearchableSelect
                options={businesses.map((b) => ({
                  id: b.id,
                  label: b.Nombre || (b as any).nombre || `Empresa ${b.id}`,
                }))}
                value={createForm.businessId}
                onChange={(id) => updateCreateForm("businessId", id as number)}
                placeholder="Seleccionar Empresa"
              />
              <input
                className="input"
                type="number"
                min={0}
                step={0.01}
                value={createForm.importe}
                onChange={(e) => updateCreateForm("importe", Number(e.target.value))}
                placeholder="Importe"
                required
              />
              <input
                className="input input--full"
                type="text"
                value={createForm.serviceName}
                onChange={(e) => updateCreateForm("serviceName", e.target.value)}
                placeholder="Servicio"
                required
              />
            </div>

            {errorMessage ? <div className="message-error">{errorMessage}</div> : null}

            <div className="message-row">
              <button className="primary-btn" type="submit" disabled={loadingCreate}>
                {loadingCreate ? "Guardando..." : "Crear reserva"}
              </button>
            </div>
          </form>
        </section>
      )}

      {editingBookingId !== null && (
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Editar reserva #{editingBookingId}</h3>
            <button type="button" className="secondary-btn" onClick={closeEditForm}>
              Cancelar
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="page-stack" style={{ gap: 16 }}>
            <div className="form-grid">
              <CustomDatePicker
                value={editForm.date}
                onChange={(date) => updateEditForm("date", date)}
              />
              <input
                className="input"
                type="time"
                value={editForm.time}
                onChange={(e) => updateEditForm("time", e.target.value)}
                onClick={(e) => {
                  if ('showPicker' in HTMLInputElement.prototype) {
                    e.currentTarget.showPicker();
                  }
                }}
                required
              />
              <select
                className="select"
                value={editForm.status}
                onChange={(e) =>
                  updateEditForm("status", e.target.value as BookingStatus)
                }
              >
                <option value="pending">Pendiente</option>
                <option value="confirmed">Confirmada</option>
                <option value="paid">Pagada</option>
              </select>
              <SearchableSelect
                options={customers.map((c) => ({
                  id: c.id,
                  label: c.Nombre || (c as any).nombre || `Cliente ${c.id}`,
                }))}
                value={editForm.customerId}
                onChange={(id) => updateEditForm("customerId", id as number)}
                placeholder="Seleccionar Cliente"
              />
              <SearchableSelect
                options={businesses.map((b) => ({
                  id: b.id,
                  label: b.Nombre || (b as any).nombre || `Empresa ${b.id}`,
                }))}
                value={editForm.businessId}
                onChange={(id) => updateEditForm("businessId", id as number)}
                placeholder="Seleccionar Empresa"
              />
              <input
                className="input"
                type="number"
                min={0}
                step={0.01}
                value={editForm.importe}
                onChange={(e) => updateEditForm("importe", Number(e.target.value))}
                placeholder="Importe"
                required
              />
              <input
                className="input input--full"
                type="text"
                value={editForm.serviceName}
                onChange={(e) => updateEditForm("serviceName", e.target.value)}
                placeholder="Servicio"
                required
              />
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
              Eliminar reserva
            </h3>
            <p id="delete-modal-description" className="modal-text">
              ¿Seguro que quieres eliminar la reserva? Esta acción no se puede deshacer.
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
                disabled={deletingBookingId === deleteTargetId}
              >
                {deletingBookingId === deleteTargetId ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Reservas registradas</h3>
            <div className="filter-row">
              <button type="button" className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter("all")}>Todas</button>
              <button type="button" className={`filter-pill ${statusFilter === 'pending' ? 'active' : ''}`} onClick={() => setStatusFilter("pending")}>Pendientes</button>
              <button type="button" className={`filter-pill ${statusFilter === 'confirmed' ? 'active' : ''}`} onClick={() => setStatusFilter("confirmed")}>Confirmadas</button>
              <button type="button" className={`filter-pill ${statusFilter === 'paid' ? 'active' : ''}`} onClick={() => setStatusFilter("paid")}>Pagadas</button>
            </div>
            <div style={{ width: "250px" }}>
              <SearchableSelect
                options={customers.map((c) => ({
                  id: c.id,
                  label: c.Nombre || (c as any).nombre || `Cliente ${c.id}`,
                }))}
                value={customerFilter}
                onChange={(id) => setCustomerFilter(id)}
                placeholder="Filtrar por Cliente"
              />
            </div>
        </div>

        {successMessage ? <div className="message-success" style={{ marginBottom: 12 }}>{successMessage}</div> : null}
        {errorMessage ? <div className="message-error" style={{ marginBottom: 12 }}>{errorMessage}</div> : null}

        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Servicio</th>
              <th>Importe</th>
              <th>Cliente</th>
              <th>Negocio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map((booking) => (
              <tr key={booking.id}>
                <td>{formatDate(booking.date)}</td>
                <td>{booking.time}</td>
                <td>{booking.serviceName}</td>
                <td>{formatImporte(booking.importe)}</td>
                <td>
                  {customers.find((c) => c.id === booking.customerId)?.Nombre ||
                    (customers.find((c) => c.id === booking.customerId) as any)?.nombre ||
                    `Cliente ${booking.customerId}`}
                </td>
                <td>
                  {businesses.find((b) => b.id === booking.businessId)?.Nombre ||
                    (businesses.find((b) => b.id === booking.businessId) as any)?.nombre ||
                    `Empresa ${booking.businessId}`}
                </td>
                <td><StatusBadge status={booking.status} /></td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button type="button" className="secondary-btn" onClick={() => openEditForm(booking)}>
                      Editar
                    </button>
                    <button type="button" className="secondary-btn" onClick={() => openDeleteModal(booking.id)}>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}