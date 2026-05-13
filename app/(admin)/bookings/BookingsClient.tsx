"use client";

import { useMemo, useState, useRef, useEffect } from "react";
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

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  className = ""
}: {
  options: { id: number, label: string }[],
  value: number | '',
  onChange: (id: number | '') => void,
  placeholder: string,
  className?: string
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const selectedOption = options.find(o => o.id === value);

  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(o =>
      (o.label || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  return (
    <div className={`searchable-select ${className}`} ref={wrapperRef} style={{ position: 'relative', width: '100%' }}>
      <div
        className="input input--full"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        style={{
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'white',
          minHeight: '42px'
        }}
      >
        <span style={{ color: selectedOption ? 'inherit' : '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          maxHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          border: '1px solid #e2e8f0',
          borderRadius: '0.5rem',
          zIndex: 100,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          marginTop: '4px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #f1f5f9', backgroundColor: '#f8fafc' }}>
            <input
              ref={searchInputRef}
              type="text"
              className="input input--full"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: '0.9rem', padding: '6px 10px' }}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }}>
            {value !== '' && (
              <div
                style={{ padding: '8px 12px', cursor: 'pointer', color: '#ef4444', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}
                onClick={() => {
                  onChange('');
                  setSearch("");
                  setIsOpen(false);
                }}
              >
                ✕ Quitar selección
              </div>
            )}
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', color: '#64748b', textAlign: 'center', fontSize: '0.9rem' }}>
                No hay resultados
              </div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.id}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f1f5f9',
                    backgroundColor: option.id === value ? '#f8fafc' : 'transparent',
                    fontWeight: option.id === value ? '600' : '400',
                    fontSize: '0.9rem'
                  }}
                  onClick={() => {
                    onChange(option.id);
                    setSearch("");
                    setIsOpen(false);
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = option.id === value ? '#f8fafc' : 'transparent'}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function BookingsClient({
  initialBookings,
  initialCustomers = [],
  initialBusinesses = [],
}: {
  initialBookings: Booking[];
  initialCustomers?: Customer[];
  initialBusinesses?: Business[];
}) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const customers = initialCustomers || [];
  const businesses = initialBusinesses || [];

  const emptyForm: CreateBookingDto = {
    date: "",
    time: "",
    status: "pending",
    customerId: 0,
    businessId: 0,
    serviceName: "",
  };

  const [createForm, setCreateForm] = useState<CreateBookingDto>(emptyForm);
  const [editForm, setEditForm] = useState<CreateBookingDto>(emptyForm);

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
    setLoadingCreate(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const created = await createAppointment(createForm);
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

    setLoadingEdit(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const payload: UpdateBookingDto = {
        date: editForm.date,
        time: editForm.time,
        status: editForm.status,
        customerId: editForm.customerId,
        businessId: editForm.businessId,
        serviceName: editForm.serviceName,
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
              <input
                className="input"
                type="date"
                value={createForm.date}
                onChange={(e) => updateCreateForm("date", e.target.value)}
                required
              />
              <input
                className="input"
                type="time"
                value={createForm.time}
                onChange={(e) => updateCreateForm("time", e.target.value)}
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
                options={customers.map(c => ({ id: c.id, label: c.Nombre || (c as any).nombre || `Cliente ${c.id}` }))}
                value={createForm.customerId || ""}
                onChange={(id) => updateCreateForm("customerId", id || 0)}
                placeholder="Nombre Cliente"
              />
              <SearchableSelect
                options={businesses.map(b => ({ id: b.id, label: b.Nombre || (b as any).nombre || `Negocio ${b.id}` }))}
                value={createForm.businessId || ""}
                onChange={(id) => updateCreateForm("businessId", id || 0)}
                placeholder="Nombre Empresa"
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
              <input
                className="input"
                type="date"
                value={editForm.date}
                onChange={(e) => updateEditForm("date", e.target.value)}
                required
              />
              <input
                className="input"
                type="time"
                value={editForm.time}
                onChange={(e) => updateEditForm("time", e.target.value)}
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
                options={customers.map(c => ({ id: c.id, label: c.Nombre || (c as any).nombre || `Cliente ${c.id}` }))}
                value={editForm.customerId || ""}
                onChange={(id) => updateEditForm("customerId", id || 0)}
                placeholder="Nombre Cliente"
              />
              <SearchableSelect
                options={businesses.map(b => ({ id: b.id, label: b.Nombre || (b as any).nombre || `Negocio ${b.id}` }))}
                value={editForm.businessId || ""}
                onChange={(id) => updateEditForm("businessId", id || 0)}
                placeholder="Nombre Empresa"
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
          <div className="filter-row" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div className="filter-group" style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter("all")}>Todas</button>
              <button type="button" className={`filter-pill ${statusFilter === 'pending' ? 'active' : ''}`} onClick={() => setStatusFilter("pending")}>Pendientes</button>
              <button type="button" className={`filter-pill ${statusFilter === 'confirmed' ? 'active' : ''}`} onClick={() => setStatusFilter("confirmed")}>Confirmadas</button>
              <button type="button" className={`filter-pill ${statusFilter === 'paid' ? 'active' : ''}`} onClick={() => setStatusFilter("paid")}>Pagadas</button>
            </div>

            <div style={{ width: '200px' }}>
              <SearchableSelect
                options={customers.map(c => ({ id: c.id, label: c.Nombre || (c as any).nombre || `Cliente ${c.id}` }))}
                value={customerFilter}
                onChange={(id) => setCustomerFilter(id)}
                placeholder="Filtrar por Cliente"
              />
            </div>
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
                <td>{customers.find(c => c.id === booking.customerId)?.Nombre || (customers.find(c => c.id === booking.customerId) as any)?.nombre || `Cliente ${booking.customerId}`}</td>
                <td>{businesses.find(b => b.id === booking.businessId)?.Nombre || (businesses.find(b => b.id === booking.businessId) as any)?.nombre || `Negocio ${booking.businessId}`}</td>
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