"use client";

import { useState } from "react";

type DayKey = "lun" | "mar" | "mie" | "jue" | "vie" | "sab" | "dom";

const DAYS: { key: DayKey; label: string }[] = [
  { key: "lun", label: "Lunes" },
  { key: "mar", label: "Martes" },
  { key: "mie", label: "Miércoles" },
  { key: "jue", label: "Jueves" },
  { key: "vie", label: "Viernes" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

type DaySchedule = {
  enabled: boolean;
  open: string;
  close: string;
};

type Schedule = Record<DayKey, DaySchedule>;

const DEFAULT_SCHEDULE: Schedule = {
  lun: { enabled: true, open: "09:00", close: "18:00" },
  mar: { enabled: true, open: "09:00", close: "18:00" },
  mie: { enabled: true, open: "09:00", close: "18:00" },
  jue: { enabled: true, open: "09:00", close: "18:00" },
  vie: { enabled: true, open: "09:00", close: "18:00" },
  sab: { enabled: false, open: "10:00", close: "14:00" },
  dom: { enabled: false, open: "10:00", close: "14:00" },
};

const SLOT_OPTIONS = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos" },
  { value: "45", label: "45 minutos" },
  { value: "60", label: "1 hora" },
  { value: "90", label: "1 hora 30 min" },
  { value: "120", label: "2 horas" },
];

export default function DisponibilidadClient({
  businessId,
}: {
  businessId: number;
}) {
  const [schedule, setSchedule] = useState<Schedule>(DEFAULT_SCHEDULE);
  const [slotDuration, setSlotDuration] = useState("30");
  const [maxConcurrent, setMaxConcurrent] = useState("1");
  const [breakStart, setBreakStart] = useState("14:00");
  const [breakEnd, setBreakEnd] = useState("15:00");
  const [hasBreak, setHasBreak] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  function toggleDay(key: DayKey) {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  }

  function updateDay(key: DayKey, field: "open" | "close", value: string) {
    setSchedule((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  function setAllEnabled(enabled: boolean) {
    const updated = { ...schedule };
    (Object.keys(updated) as DayKey[]).forEach((k) => {
      updated[k] = { ...updated[k], enabled };
    });
    setSchedule(updated);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    // Simulación: en producción enviaría al backend
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSuccess("Disponibilidad guardada correctamente.");
    setTimeout(() => setSuccess(""), 4000);
  }

  const activeDays = (Object.keys(schedule) as DayKey[]).filter((k) => schedule[k].enabled);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Disponibilidad y horarios</h2>
          <p>Configura en qué días y horas aceptas reservas, y la duración de cada cita.</p>
        </div>
      </section>

      {success && <div className="message-success">{success}</div>}

      <form onSubmit={handleSave} className="page-stack">

        {/* Resumen visual */}
        <section className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Días activos</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="secondary-btn" style={{ padding: "4px 12px", fontSize: "var(--text-xs)" }} onClick={() => setAllEnabled(true)}>
                Todos
              </button>
              <button type="button" className="secondary-btn" style={{ padding: "4px 12px", fontSize: "var(--text-xs)" }} onClick={() => setAllEnabled(false)}>
                Ninguno
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {DAYS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleDay(key)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--radius-full)",
                  fontSize: "var(--text-sm)",
                  fontWeight: 600,
                  border: `2px solid ${schedule[key].enabled ? "var(--accent)" : "var(--border)"}`,
                  background: schedule[key].enabled ? "var(--accent)" : "transparent",
                  color: schedule[key].enabled ? "#fff" : "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
              >
                {label.slice(0, 3)}
              </button>
            ))}
          </div>
        </section>

        {/* Horarios por día */}
        <section className="section-card">
          <h3 className="panel-title" style={{ marginBottom: 16 }}>Horario por día</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {DAYS.map(({ key, label }) => (
              <div
                key={key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 1fr",
                  alignItems: "center",
                  gap: 16,
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: schedule[key].enabled ? "var(--surface-2)" : "var(--surface)",
                  opacity: schedule[key].enabled ? 1 : 0.5,
                  transition: "all 0.18s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    id={`day-${key}`}
                    checked={schedule[key].enabled}
                    onChange={() => toggleDay(key)}
                    style={{ width: 16, height: 16, accentColor: "var(--accent)", cursor: "pointer" }}
                  />
                  <label htmlFor={`day-${key}`} style={{ fontWeight: 600, fontSize: "var(--text-sm)", cursor: "pointer" }}>
                    {label}
                  </label>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", minWidth: 48 }}>Apertura</label>
                  <input
                    type="time"
                    className="input"
                    value={schedule[key].open}
                    onChange={(e) => updateDay(key, "open", e.target.value)}
                    disabled={!schedule[key].enabled}
                    style={{ flex: 1 }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <label style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", minWidth: 48 }}>Cierre</label>
                  <input
                    type="time"
                    className="input"
                    value={schedule[key].close}
                    onChange={(e) => updateDay(key, "close", e.target.value)}
                    disabled={!schedule[key].enabled}
                    style={{ flex: 1 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Configuración de citas */}
        <section className="section-card">
          <h3 className="panel-title" style={{ marginBottom: 16 }}>Configuración de citas</h3>
          <div className="form-grid">
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Duración de cada slot / cita
              </label>
              <select className="input" value={slotDuration} onChange={(e) => setSlotDuration(e.target.value)}>
                {SLOT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 4 }}>
                Tiempo que ocupa cada reserva en tu calendario
              </p>
            </div>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 6 }}>
                Citas simultáneas máximas
              </label>
              <input
                type="number"
                className="input"
                min={1}
                max={20}
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(e.target.value)}
              />
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 4 }}>
                Cuántos clientes puedes atender a la vez
              </p>
            </div>
          </div>
        </section>

        {/* Pausa / descanso */}
        <section className="section-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: hasBreak ? 16 : 0 }}>
            <div>
              <h3 className="panel-title" style={{ marginBottom: 2 }}>Pausa / descanso</h3>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                Bloquea un rango de horas diario (p.ej. hora de comer)
              </p>
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={hasBreak}
                onChange={(e) => setHasBreak(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--accent)" }}
              />
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 600 }}>Activar</span>
            </label>
          </div>
          {hasBreak && (
            <div className="form-grid">
              <div>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 6 }}>Inicio pausa</label>
                <input type="time" className="input" value={breakStart} onChange={(e) => setBreakStart(e.target.value)} />
              </div>
              <div>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 6 }}>Fin pausa</label>
                <input type="time" className="input" value={breakEnd} onChange={(e) => setBreakEnd(e.target.value)} />
              </div>
            </div>
          )}
        </section>

        {/* Resumen */}
        {activeDays.length > 0 && (
          <section className="section-card" style={{ background: "var(--surface-2)" }}>
            <h3 className="panel-title" style={{ marginBottom: 12 }}>Resumen de disponibilidad</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {activeDays.map((key) => (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--text-sm)" }}>
                  <span style={{ fontWeight: 600, color: "var(--text)" }}>
                    {DAYS.find((d) => d.key === key)?.label}
                  </span>
                  <span style={{ color: "var(--text-secondary)" }}>
                    {schedule[key].open} — {schedule[key].close}
                    {hasBreak && ` (pausa ${breakStart}–${breakEnd})`}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid var(--border)", marginTop: 8, paddingTop: 8, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                Duración por cita: <strong>{SLOT_OPTIONS.find(o => o.value === slotDuration)?.label}</strong>
                {" · "}Máximo simultáneo: <strong>{maxConcurrent}</strong>
              </div>
            </div>
          </section>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" className="primary-btn" disabled={saving} style={{ minWidth: 200 }}>
            {saving ? "Guardando..." : "Guardar disponibilidad"}
          </button>
        </div>
      </form>
    </div>
  );
}
