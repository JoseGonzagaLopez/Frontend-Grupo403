"use client";

import { useState, useEffect } from "react";
import type { Booking } from "@/lib/api";
import { getAppointments, getCustomers, getBusinesses } from "@/lib/api";
import { CalendarDays, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

const daysOfWeek = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: "Pendiente",  color: "#964219", bg: "rgba(150,66,25,0.12)" },
  confirmed: { label: "Confirmada", color: "#437a22", bg: "rgba(67,122,34,0.12)" },
  cancelled: { label: "Cancelada",  color: "#c0392b", bg: "rgba(192,57,43,0.12)" },
  completed: { label: "Completada", color: "#666",    bg: "rgba(0,0,0,0.06)" },
  paid:      { label: "Pagada",     color: "#01696f", bg: "rgba(1,105,111,0.12)" },
  no_show:   { label: "No asistio", color: "#666",    bg: "rgba(0,0,0,0.06)" },
};

export default function InicioClient({ customerId }: { customerId: number }) {
  const [appointments, setAppointments] = useState<Booking[]>([]);
  const [displayName, setDisplayName] = useState("Cliente");
  const [businessMap, setBusinessMap] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  
  const [selectedDate, setSelectedDate] = useState<string>(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  );

  useEffect(() => {
    async function load() {
      try {
        const [customers, allAppointments, businesses] = await Promise.all([
          getCustomers(),
          getAppointments(),
          getBusinesses(),
        ]);
        const found = customers.find((c) => c.id === customerId);
        if (found) {
          // username si existe, si no el Nombre
          setDisplayName(found.username || found.Nombre);
        }
        
        const mine = allAppointments.filter((a) => a.customerId === customerId);
        setAppointments(mine);
        
        const bMap: Record<number, string> = {};
        businesses.forEach((b) => { bMap[b.id] = b.Nombre; });
        setBusinessMap(bMap);
      } catch (err) {
        console.error("Error cargando inicio:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [customerId]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => ({
      month: prev.month === 0 ? 11 : prev.month - 1,
      year: prev.month === 0 ? prev.year - 1 : prev.year,
    }));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => ({
      month: prev.month === 11 ? 0 : prev.month + 1,
      year: prev.month === 11 ? prev.year + 1 : prev.year,
    }));
  };

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
  const emptyDays = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const appointmentsByDate = appointments.reduce((acc, appt) => {
    if (!acc[appt.date]) acc[appt.date] = [];
    acc[appt.date].push(appt);
    return acc;
  }, {} as Record<string, Booking[]>);

  const selectedAppointments = appointmentsByDate[selectedDate] || [];
  const selectedDateFormatted = new Intl.DateTimeFormat("es-ES", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric"
  }).format(new Date(selectedDate + "T12:00:00"));

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Hola, {displayName}!</h2>
          <p>Bienvenido a tu panel de control. Revisa tus proximas citas y organiza tu tiempo.</p>
        </div>
      </section>

      {loading ? (
        <section className="section-card">
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div style={{ height: 300, borderRadius: "var(--radius-lg)", background: "var(--surface-2)", opacity: 0.6 }} />
          </div>
        </section>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-4)", alignItems: "start" }}>
          
          <section className="section-card" style={{ padding: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
              <button onClick={handlePrevMonth} className="secondary-btn" style={{ padding: 8 }}>
                <ChevronLeft size={20} />
              </button>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: 0 }}>
                {monthNames[currentMonth.month]} {currentMonth.year}
              </h3>
              <button onClick={handleNextMonth} className="secondary-btn" style={{ padding: 8 }}>
                <ChevronRight size={20} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center", marginBottom: 8 }}>
              {daysOfWeek.map((day) => (
                <div key={day} style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text-tertiary)" }}>
                  {day}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {days.map((day) => {
                const currentDateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                const isSelected = selectedDate === currentDateStr;
                const isToday = today.getDate() === day && today.getMonth() === currentMonth.month && today.getFullYear() === currentMonth.year;
                const hasAppointments = !!appointmentsByDate[currentDateStr];

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDate(currentDateStr)}
                    style={{
                      aspectRatio: "1",
                      borderRadius: "50%",
                      border: "none",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      fontSize: "var(--text-sm)",
                      fontWeight: isSelected || isToday ? 700 : 500,
                      background: isSelected ? "var(--accent)" : isToday ? "var(--surface-2)" : "transparent",
                      color: isSelected ? "#fff" : "var(--text)",
                      position: "relative",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "var(--surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = isToday ? "var(--surface-2)" : "transparent";
                    }}
                  >
                    {day}
                    {hasAppointments && (
                      <span style={{
                        position: "absolute", bottom: 4, width: 4, height: 4, borderRadius: "50%",
                        background: isSelected ? "#fff" : "var(--accent)",
                      }} />
                    )}
                  </button>
                );
              })}
            </div>
            
            <div style={{ marginTop: "var(--space-5)", display: "flex", gap: "var(--space-2)", justifyContent: "center" }}>
               <Link href="/reservar" className="primary-btn" style={{ flex: 1, textAlign: "center", display: "flex", justifyContent: "center" }}>
                 Nueva Reserva
               </Link>
            </div>
          </section>

          <section className="section-card" style={{ padding: "var(--space-5)", display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 700, margin: "0 0 var(--space-1) 0" }}>Citas del dia</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", margin: 0, textTransform: "capitalize" }}>
                {selectedDateFormatted}
              </p>
            </div>
            
            {selectedAppointments.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "var(--space-10) var(--space-4)",
                color: "var(--text-secondary)", display: "flex", flexDirection: "column",
                alignItems: "center", gap: "var(--space-3)", background: "var(--surface-2)", borderRadius: "var(--radius-lg)"
              }}>
                <CalendarDays size={32} style={{ opacity: 0.3 }} />
                <p style={{ fontWeight: 500, margin: 0 }}>No hay citas para este dia</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {selectedAppointments.map((appt) => {
                  const st = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
                  const bName = businessMap[appt.businessId] || "Negocio";
                  
                  return (
                    <div key={appt.id} style={{
                      background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius-lg)",
                      padding: "var(--space-3) var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-2)",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <div>
                          <p style={{ fontWeight: 700, margin: "0 0 2px 0" }}>{appt.serviceName}</p>
                          <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)", margin: 0 }}>{bName}</p>
                        </div>
                        <span style={{
                          background: st.bg, color: st.color, padding: "2px 10px",
                          borderRadius: "var(--radius-full)", fontSize: "var(--text-xs)", fontWeight: 600, whiteSpace: "nowrap",
                        }}>{st.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
                        <Clock size={14} />
                        <span>{appt.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

        </div>
      )}
    </div>
  );
}
