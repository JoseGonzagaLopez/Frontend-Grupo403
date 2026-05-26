"use client";

import { useState, useRef, useEffect } from "react";
import type { Business, Customer, Service } from "@/lib/api";
import { createAppointment, getServices } from "@/lib/api";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import Header from "@/components/layout/Header";
import { logOutCustomer } from "@/lib/actions";

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
      await createAppointment({ date: form.date, time: form.time, status: "pending", customerId: loggedCustomer.id, businessId: form.businessId as number, serviceName: form.serviceName, importe: services.find((s) => s.nombre === form.serviceName)?.precio ?? 0 });
      setIsSuccess(true);
    } catch { setError("Ha ocurrido un error al procesar tu reserva. Por favor, inténtalo de nuevo."); }
    finally { setIsLoading(false); }
  };

  if (isSuccess) {
    const selectedBusiness = businessOptions.find((b) => b.id === form.businessId)?.label;
    const dateFormatted = form.date
      ? new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(form.date + "T12:00:00"))
      : "";

    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "var(--space-4)",
      }}>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.10)",
          padding: "clamp(2rem, 5vw, 3rem) clamp(1.5rem, 4vw, 2.5rem)",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-4)",
        }}>
          {/* Icono pendiente */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "rgba(150,66,25,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "var(--space-1)",
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none"
              stroke="var(--warning, #964219)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <h2 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: 0 }}>Reserva enviada</h2>
            <p style={{ color: "var(--text-secondary)", margin: 0, maxWidth: "34ch", lineHeight: 1.6 }}>
              Tu reserva está <strong>pendiente de confirmación</strong> por parte del negocio.
            </p>
          </div>

          {/* Detalle reserva */}
          <div style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4) var(--space-5)",
            width: "100%",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}>
            {selectedBusiness && <p style={{ margin: 0 }}><strong>Negocio:</strong> {selectedBusiness}</p>}
            <p style={{ margin: 0 }}><strong>Servicio:</strong> {form.serviceName}</p>
            <p style={{ margin: 0 }}><strong>Fecha:</strong> {dateFormatted}</p>
            <p style={{ margin: 0 }}><strong>Hora:</strong> {form.time}</p>
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
              <strong>Estado:</strong>
              <span style={{
                background: "rgba(150,66,25,0.12)",
                color: "var(--warning, #964219)",
                padding: "2px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
              }}>Pendiente</span>
            </p>
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: "var(--space-3)", width: "100%", marginTop: "var(--space-1)" }}>
            <button
              className="secondary-btn"
              style={{ flex: 1 }}
              onClick={() => window.history.back()}
            >
              ← Volver
            </button>
            <button
              className="primary-btn"
              style={{ flex: 1 }}
              onClick={() => {
                setForm({ businessId: "", serviceName: "", date: "", time: "" });
                setIsSuccess(false);
              }}
            >
              Nueva reserva
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page min-h-screen flex flex-col">
      <Header
        title="BookFlow"
        subtitle="Solicita tu cita de forma rápida y sencilla"
        userName={loggedCustomer ? loggedCustomer.Nombre : "Cliente"}
        userRole="Cliente"
        onLogout={async () => { await logOutCustomer(); window.location.href = '/login'; }}
        hideHamburger={true}
      />
      <main className="flex-1 p-4 sm:p-8" style={{ maxWidth: "1000px", margin: "0 auto", width: "100%" }}>
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
                    <div className="input" style={{ color: "var(--text-faint)", cursor: "not-allowed", display: "flex", alignItems: "center" }}>
                      Primero selecciona un negocio
                    </div>
                  ) : loadingServices ? (
                    <div className="input" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center" }}>Cargando servicios...</div>
                  ) : services.length > 0 ? (
                    <select
                      className="input"
                      value={form.serviceName}
                      onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                      required
                    >
                      <option value="">Selecciona un servicio...</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.nombre}>
                          {s.nombre}{s.precio ? ` — ${s.precio}€` : ""}{s.duracion ? ` (${s.duracion} min)` : ""}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      className="input"
                      placeholder="Este negocio no tiene servicios definidos, escribe el servicio..."
                      value={form.serviceName}
                      onChange={(e) => setForm((f) => ({ ...f, serviceName: e.target.value }))}
                      required
                    />
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
      </main>
    </div>
  );
}
