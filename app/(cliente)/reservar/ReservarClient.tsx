"use client";

import { useState, useRef, useEffect } from "react";
import type { Business, Customer, Service } from "@/lib/api";
import { createAppointment, getServices } from "@/lib/api";
import { CustomDatePicker } from "@/components/CustomDatePicker";

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
  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = options.find((o) => o.id === value)?.label || "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => { if (isOpen && inputRef.current) inputRef.current.focus(); }, [isOpen]);

  return (
    <div ref={containerRef} className={`searchable-select ${className}`} style={{ position: "relative", width: "100%" }}>
      <button type="button" className="input" style={{ textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", width: "100%" }} onClick={() => setIsOpen(!isOpen)}>
        <span style={{ color: value === "" ? "var(--text-tertiary)" : "inherit" }}>{selectedLabel || placeholder}</span>
        <span style={{ fontSize: "12px", opacity: 0.5 }}>▼</span>
      </button>
      {isOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", marginTop: "4px", maxHeight: "300px", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "8px", borderBottom: "1px solid var(--border)" }}>
            <input ref={inputRef} type="text" className="input" style={{ height: "36px", fontSize: "14px" }} placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} onClick={(e) => e.stopPropagation()} />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {value !== "" && (
              <div style={{ padding: "8px 12px", cursor: "pointer", color: "var(--danger)", fontSize: "14px", borderBottom: "1px solid var(--border)" }}
                onClick={() => { onChange(""); setSearch(""); setIsOpen(false); }}>
                ✕ Quitar selección
              </div>
            )}
            {filtered.length > 0 ? filtered.map((opt) => (
              <div key={opt.id}
                style={{ padding: "8px 12px", cursor: "pointer", fontSize: "14px", background: value === opt.id ? "var(--surface-2)" : "transparent", fontWeight: value === opt.id ? 600 : 400 }}
                className="searchable-select__option"
                onClick={() => { onChange(opt.id); setSearch(""); setIsOpen(false); }}>
                {opt.label}
              </div>
            )) : (
              <div style={{ padding: "12px", textAlign: "center", color: "var(--text-tertiary)", fontSize: "14px" }}>No hay resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReservarClient({
  initialBusinesses,
  loggedCustomer,
  serverError,
}: {
  initialBusinesses: Business[];
  loggedCustomer?: Customer;
  serverError?: string;
}) {
  const [form, setForm] = useState({ businessId: "" as number | "", serviceName: "", date: "", time: "" });
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(serverError || "");
  const [isSuccess, setIsSuccess] = useState(false);
  const [calendarStatus, setCalendarStatus] = useState<string | null>(null);
  const [calendarLink, setCalendarLink] = useState<string | null>(null);
  // Guardamos el formulario al enviar para mostrarlo en la pantalla de éxito
  const [submittedForm, setSubmittedForm] = useState(form);

  const businessOptions = initialBusinesses.map((b) => ({ id: b.id, label: b.Nombre || `Empresa ${b.id}` }));

  useEffect(() => {
    if (form.businessId === "") { setServices([]); setForm((f) => ({ ...f, serviceName: "" })); return; }
    setLoadingServices(true);
    getServices(form.businessId as number)
      .then(setServices)
      .catch(() => setServices([]))
      .finally(() => setLoadingServices(false));
    setForm((f) => ({ ...f, serviceName: "" }));
  }, [form.businessId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.businessId === "" || !form.serviceName || !form.date || !form.time) {
      setError("Por favor, completa todos los campos requeridos."); return;
    }
    if (!loggedCustomer) { setError("Debes iniciar sesión para realizar una reserva."); return; }
    setIsLoading(true); setError("");
    try {
      await createAppointment({
        date: form.date, time: form.time, status: "pending",
        customerId: loggedCustomer.id,
        businessId: form.businessId as number,
        serviceName: form.serviceName,
        importe: services.find((s) => s.nombre === form.serviceName)?.precio ?? 0,
      });
      // Guardamos el formulario actual antes de resetear el estado
      setSubmittedForm({ ...form });
      setIsSuccess(true);
    } catch {
      setError("Ha ocurrido un error al procesar tu reserva. Por favor, inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithGoogleCalendar = () => {
    setCalendarStatus("Abriendo Google...");
    setCalendarLink(null);

    if (!(window as any).google) {
      setCalendarStatus("Error: La librería de Google no ha cargado aún. Recarga la página.");
      return;
    }

    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: "920872359737-74qfe3ohi1gp7kjmbkll8i5afslnvqbk.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/calendar.events",
      callback: (tokenResponse: any) => {
        if (!tokenResponse || !tokenResponse.access_token) {
          setCalendarStatus("❌ No se pudo obtener el token de Google.");
          return;
        }

        setCalendarStatus("Autenticado. Creando evento en tu calendario...");

        const businessLabel = businessOptions.find((b) => b.id === submittedForm.businessId)?.label || "Negocio";
        const title = `Reserva: ${submittedForm.serviceName} en ${businessLabel}`;
        const startDateTime = new Date(`${submittedForm.date}T${submittedForm.time}`).toISOString();
        const endDateTime = new Date(
          new Date(`${submittedForm.date}T${submittedForm.time}`).getTime() + 60 * 60 * 1000
        ).toISOString();

        const evento = {
          summary: title,
          description: `Reserva creada automáticamente desde Buk-A.\nCliente: ${loggedCustomer?.Nombre || ""}`,
          start: {
            dateTime: startDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          end: {
            dateTime: endDateTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
        };

        fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(evento),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Error en la respuesta de Google");
            return res.json();
          })
          .then((data) => {
            setCalendarStatus("¡Evento añadido con éxito a tu Google Calendar!");
            setCalendarLink(data.htmlLink);
          })
          .catch(() => {
            setCalendarStatus("❌ Error al crear el evento. Inténtalo de nuevo.");
          });
      },
    });

    tokenClient.requestAccessToken();
  };

  // Trigger sync automatically when isSuccess becomes true
  useEffect(() => {
    if (isSuccess && typeof window !== 'undefined') {
      // Small timeout to allow UI to render first
      const timer = setTimeout(() => {
        syncWithGoogleCalendar();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  if (isSuccess) {
    const selectedBusiness = businessOptions.find((b) => b.id === submittedForm.businessId)?.label;
    const dateFormatted = submittedForm.date
      ? new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
          new Date(submittedForm.date + "T12:00:00")
        )
      : "";

    return (
      <div style={{
        minHeight: "calc(100vh - 64px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "var(--space-4)",
      }}>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
          padding: "clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem)",
          maxWidth: 500, width: "100%",
          textAlign: "center",
          display: "flex", flexDirection: "column", alignItems: "center",
          gap: "var(--space-4)",
        }}>
          {/* Icono de éxito */}
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(34,197,94,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
              stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>¡Reserva enviada!</h2>
            <p style={{ color: "var(--text-secondary)", margin: 0, maxWidth: "34ch", lineHeight: 1.6 }}>
              Tu reserva está <strong>pendiente de confirmación</strong> por parte del negocio.
            </p>
          </div>

          {/* Detalles de la reserva */}
          <div style={{
            background: "var(--surface-2)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4) var(--space-5)",
            width: "100%", textAlign: "left",
            display: "flex", flexDirection: "column", gap: "var(--space-2)",
          }}>
            {selectedBusiness && <p style={{ margin: 0 }}><strong>Negocio:</strong> {selectedBusiness}</p>}
            <p style={{ margin: 0 }}><strong>Servicio:</strong> {submittedForm.serviceName}</p>
            <p style={{ margin: 0 }}><strong>Fecha:</strong> {dateFormatted}</p>
            <p style={{ margin: 0 }}><strong>Hora:</strong> {submittedForm.time}</p>
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <strong>Estado:</strong>
              <span style={{
                background: "rgba(234,179,8,0.12)", color: "#b45309",
                padding: "2px 12px", borderRadius: "var(--radius-full)",
                fontSize: "var(--text-sm)", fontWeight: 600,
              }}>Pendiente</span>
            </p>
          </div>

          {/* Botón Google Calendar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", width: "100%" }}>
            <button
              onClick={syncWithGoogleCalendar}
              style={{
                width: "100%",
                backgroundColor: "#4285F4",
                border: "none",
                borderRadius: "var(--radius-md)",
                color: "white",
                padding: "12px 20px",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                transition: "opacity 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z"/>
              </svg>
              Añadir a Google Calendar
            </button>

            {calendarStatus && (
              <div style={{
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: calendarStatus.includes("❌") ? "rgba(239,68,68,0.08)" : "rgba(34,197,94,0.08)",
                border: `1px solid ${calendarStatus.includes("❌") ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}`,
                fontSize: "var(--text-sm)",
                color: calendarStatus.includes("❌") ? "var(--danger)" : "#16a34a",
                textAlign: "left",
              }}>
                {calendarStatus}
                {calendarLink && (
                  <a
                    href={calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", marginTop: "6px", color: "#4285F4", fontWeight: 600, textDecoration: "underline" }}
                  >
                    → Ver evento en Google Calendar
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Acciones secundarias */}
          <div style={{ display: "flex", gap: "var(--space-3)", width: "100%" }}>
            <button className="secondary-btn" style={{ flex: 1 }} onClick={() => window.history.back()}>← Volver</button>
            <button className="primary-btn" style={{ flex: 1 }} onClick={() => {
              setForm({ businessId: "", serviceName: "", date: "", time: "" });
              setSubmittedForm({ businessId: "", serviceName: "", date: "", time: "" });
              setIsSuccess(false);
              setCalendarStatus(null);
              setCalendarLink(null);
            }}>Nueva reserva</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Reserva tu cita</h2>
          <p>Completa el formulario a continuación para solicitar una reserva.</p>
        </div>
      </section>
      <section className="section-card">
        <form onSubmit={handleSubmit} className="page-stack" style={{ gap: 24 }}>
          {error && <div className="message-error">{error}</div>}
          <div className="form-grid">
            <div>
              <label className="block text-sm font-semibold mb-1">Selecciona el Negocio <span style={{ color: "var(--danger)" }}>*</span></label>
              <SearchableSelect
                options={businessOptions}
                value={form.businessId}
                onChange={(id) => setForm((f) => ({ ...f, businessId: id }))}
                placeholder="Busca y selecciona un negocio..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Servicio <span style={{ color: "var(--danger)" }}>*</span></label>
              {form.businessId === "" ? (
                <div className="input" style={{ color: "var(--text-faint)", cursor: "not-allowed", display: "flex", alignItems: "center" }}>Primero selecciona un negocio</div>
              ) : loadingServices ? (
                <div className="input" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>Cargando servicios...</div>
              ) : services.length > 0 ? (
                <select className="input" value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))} required>
                  <option value="">Selecciona un servicio...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.nombre}>{s.nombre}{s.precio ? ` — ${s.precio}€` : ""}{s.duracion ? ` (${s.duracion} min)` : ""}</option>
                  ))}
                </select>
              ) : (
                <input type="text" className="input" placeholder="Este negocio no tiene servicios definidos, escribe el servicio..." value={form.serviceName} onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))} required />
              )}
            </div>
          </div>
          <div className="form-grid">
            <div>
              <label className="block text-sm font-semibold mb-1">Fecha <span style={{ color: "var(--danger)" }}>*</span></label>
              <CustomDatePicker value={form.date} onChange={(date) => setForm((f) => ({ ...f, date }))} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Hora <span style={{ color: "var(--danger)" }}>*</span></label>
              <input type="time" className="input" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} required
                onClick={(e) => { if ("showPicker" in HTMLInputElement.prototype) (e.currentTarget as any).showPicker(); }} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button type="submit" className="primary-btn" disabled={isLoading} style={{ minWidth: 200 }}>
              {isLoading ? "Procesando..." : "Confirmar reserva"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
