"use client";
import { useState, useEffect } from "react";
import type { Booking, Resena, CreateResenaDto } from "@/lib/api";
import { getAppointments, getCustomers, getResenas, createResena } from "@/lib/api";
import { CalendarDays, Clock, Star, MessageSquarePlus } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "var(--warning, #964219)",      bg: "rgba(150,66,25,0.12)" },
  confirmed: { label: "Confirmada", color: "var(--success-text, #437a22)", bg: "rgba(67,122,34,0.12)" },
  cancelled: { label: "Cancelada",  color: "var(--danger, #c0392b)",       bg: "rgba(192,57,43,0.12)" },
  completed: { label: "Completada", color: "var(--text-secondary)",        bg: "var(--surface-2)" },
  paid:      { label: "Pagada",     color: "var(--accent, #01696f)",        bg: "rgba(1,105,111,0.12)" },
  no_show:   { label: "No asistió", color: "var(--text-secondary)",        bg: "var(--surface-2)" },
};

function hasPassed(date: string, time: string): boolean {
  try { return new Date(`${date}T${time || "23:59"}`).getTime() < Date.now(); }
  catch { return false; }
}

function StarRating({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" disabled={readonly}
          onClick={() => onChange && onChange(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{ background: "none", border: "none", padding: 1, cursor: readonly ? "default" : "pointer", color: n <= (hover || value) ? "#e0a800" : "var(--border)", transition: "color 0.1s" }}
        >
          <Star size={20} fill={n <= (hover || value) ? "#e0a800" : "none"} stroke={n <= (hover || value) ? "#e0a800" : "var(--border)"} />
        </button>
      ))}
    </div>
  );
}

function ModalResena({ appt, customerName, onClose, onSaved }: { appt: Booking; customerName: string; onClose: () => void; onSaved: (r: Resena) => void }) {
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (puntuacion === 0) { setError("Selecciona al menos una estrella."); return; }
    setLoading(true); setError("");
    try {
      const dto: CreateResenaDto = { businessId: appt.businessId, customerId: appt.customerId, appointmentId: appt.id, clienteNombre: customerName, puntuacion, comentario: comentario.trim() || undefined };
      const nueva = await createResena(dto);
      onSaved(nueva); onClose();
    } catch { setError("No se pudo enviar la reseña."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--space-4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius-xl)", padding: "var(--space-8) var(--space-6)", width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "var(--text-lg)", fontWeight: 700 }}>Dejar reseña</h3>
          <p style={{ margin: "4px 0 0", color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>{appt.serviceName}</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 8, fontSize: "var(--text-sm)" }}>Puntuación</label>
            <StarRating value={puntuacion} onChange={setPuntuacion} />
          </div>
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: "var(--text-sm)" }}>Comentario <span style={{ color: "var(--text-secondary)", fontWeight: 400 }}>(opcional)</span></label>
            <textarea className="input" rows={3} placeholder="Cuéntanos tu experiencia..." value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={500} style={{ resize: "vertical", minHeight: 80 }} />
          </div>
          {error && <p style={{ color: "var(--danger, #c0392b)", fontSize: "var(--text-sm)", margin: 0 }}>{error}</p>}
          <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "flex-end" }}>
            <button type="button" className="secondary-btn" onClick={onClose} disabled={loading}>Cancelar</button>
            <button type="submit" className="primary-btn" disabled={loading}>{loading ? "Enviando..." : "Publicar reseña"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TarjetaReserva({ appt, resena, customerName, onResenaGuardada }: { appt: Booking; resena: Resena | undefined; customerName: string; onResenaGuardada: (r: Resena) => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const st = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
  const pasada = hasPassed(appt.date, appt.time);
  const dateFormatted = new Intl.DateTimeFormat("es-ES", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(appt.date + "T12:00:00"));

  return (
    <>
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)", padding: "var(--space-4) var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)", flex: 1 }}>
            <p style={{ fontWeight: 600, margin: 0 }}>{appt.serviceName}</p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              <CalendarDays size={13} />{dateFormatted}<Clock size={13} style={{ marginLeft: 4 }} />{appt.time}
            </p>
          </div>
          <span style={{ background: st.bg, color: st.color, padding: "4px 14px", borderRadius: "var(--radius-full)", fontSize: "var(--text-sm)", fontWeight: 600, whiteSpace: "nowrap" }}>{st.label}</span>
        </div>
        {resena && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <StarRating value={resena.puntuacion} readonly />
              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>Tu reseña</span>
            </div>
            {resena.comentario && <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, fontStyle: "italic" }}>"{resena.comentario}"</p>}
          </div>
        )}
        {pasada && !resena && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-3)" }}>
            <button className="secondary-btn" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-sm)" }} onClick={() => setModalOpen(true)}>
              <MessageSquarePlus size={15} />Dejar reseña
            </button>
          </div>
        )}
      </div>
      {modalOpen && <ModalResena appt={appt} customerName={customerName} onClose={() => setModalOpen(false)} onSaved={onResenaGuardada} />}
    </>
  );
}

export default function MisReservasClient({ customerId }: { customerId: number }) {
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [resenas, setResenas] = useState<Record<number, Resena>>({});
  const [customerName, setCustomerName] = useState("Cliente");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"proximas" | "pasadas">("proximas");

  useEffect(() => {
    async function load() {
      try {
        const [customers, allAppointments, allResenas] = await Promise.all([
          getCustomers(),
          getAppointments(),
          getResenas(),
        ]);
        const found = customers.find((c) => c.id === customerId);
        if (found) setCustomerName(found.Nombre);
        const mine = allAppointments.filter((a) => a.customerId === customerId);
        setAppointments(mine);
        const map: Record<number, Resena> = {};
        allResenas.forEach((r) => { if (r.appointmentId != null) map[r.appointmentId] = r; });
        setResenas(map);
      } catch (err) {
        console.error("Error cargando mis reservas:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [customerId]);

  const sorted = [...appointments].sort((a, b) => new Date(`${a.date}T${a.time || "00:00"}`).getTime() - new Date(`${b.date}T${b.time || "00:00"}`).getTime());
  const proximas = sorted.filter((a) => !hasPassed(a.date, a.time));
  const pasadas  = sorted.filter((a) => hasPassed(a.date, a.time)).reverse();
  const lista = tab === "proximas" ? proximas : pasadas;

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "var(--space-2) var(--space-5)", borderRadius: "var(--radius-full)",
    fontWeight: 600, fontSize: "var(--text-sm)", cursor: "pointer", border: "none",
    background: active ? "var(--accent, #01696f)" : "transparent",
    color: active ? "#fff" : "var(--text-secondary)",
    transition: "background 0.18s, color 0.18s",
  });

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div><h2>Mis reservas</h2><p>Consulta y valora tus reservas.</p></div>
      </section>

      {loading ? (
        <section className="section-card">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {[1,2,3].map((i) => (
              <div key={i} style={{ height: 80, borderRadius: "var(--radius-lg)", background: "var(--surface-2)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        </section>
      ) : (
        <>
          <div style={{ display: "flex", gap: "var(--space-2)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-full)", padding: "var(--space-1)", width: "fit-content" }}>
            <button style={tabStyle(tab === "proximas")} onClick={() => setTab("proximas")}>Próximas {proximas.length > 0 && `(${proximas.length})`}</button>
            <button style={tabStyle(tab === "pasadas")} onClick={() => setTab("pasadas")}>Pasadas {pasadas.length > 0 && `(${pasadas.length})`}</button>
          </div>
          <section className="section-card">
            {lista.length === 0 ? (
              <div style={{ textAlign: "center", padding: "var(--space-16) var(--space-8)", color: "var(--text-secondary)", display: "flex", flexDirection: "column", alignItems: "center", gap: "var(--space-3)" }}>
                <CalendarDays size={44} style={{ opacity: 0.2 }} />
                <p style={{ fontWeight: 600, margin: 0 }}>{tab === "proximas" ? "No tienes reservas próximas" : "No tienes reservas pasadas"}</p>
                {tab === "proximas" && <p style={{ fontSize: "var(--text-sm)", margin: 0 }}>Cuando hagas una reserva aparecerá aquí.</p>}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {lista.map((appt) => (
                  <TarjetaReserva key={appt.id} appt={appt} resena={resenas[appt.id]} customerName={customerName} onResenaGuardada={(r) => setResenas((prev) => ({ ...prev, [appt.id]: r }))} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
