"use client";
import { useState, useMemo } from "react";
import type { Booking, Business } from "@/lib/api";
import { CalendarDays, Clock, ChevronLeft, ChevronRight, Star, MapPin } from "lucide-react";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: "Pendiente",  color: "#e8a800", bg: "rgba(232,168,0,0.15)",   dot: "#e8a800" },
  confirmed: { label: "Confirmada", color: "#01696f", bg: "rgba(1,105,111,0.15)",   dot: "#01696f" },
  completed: { label: "Completada", color: "#6b7280", bg: "rgba(107,114,128,0.12)", dot: "#6b7280" },
  paid:      { label: "Pagada",     color: "#01696f", bg: "rgba(1,105,111,0.15)",   dot: "#22c55e" },
  no_show:   { label: "No asistió", color: "#ef4444", bg: "rgba(239,68,68,0.12)",   dot: "#ef4444" },
};

const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DOW_ES    = ["Lu","Ma","Mi","Ju","Vi","Sá","Do"];

function toYMD(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ClienteInicioClient({
  appointments,
  customer,
  businesses,
  favorites,
}: {
  appointments: Booking[];
  customer: { Nombre: string; id: number } | null;
  businesses: Business[];
  favorites: number[];
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Agrupar reservas por fecha
  const apptByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    appointments.forEach((a) => {
      if (!map[a.date]) map[a.date] = [];
      map[a.date].push(a);
    });
    return map;
  }, [appointments]);

  // Próximas reservas (desde hoy, ordenadas)
  const upcoming = useMemo(() => {
    return [...appointments]
      .filter((a) => new Date(`${a.date}T${a.time ?? "00:00"}:00`) >= today)
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
      .slice(0, 6);
  }, [appointments]);

  // Construcción del calendario
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    // En JS getDay(): 0=Dom, convertir a Lu=0
    const startDow = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (string | null)[] = Array(startDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(toYMD(new Date(viewYear, viewMonth, d)));
    }
    // Rellenar hasta completar semanas
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const todayStr = toYMD(today);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  // Negocios favoritos (localStorage)
  const favBusinesses = businesses.filter(b => favorites.includes(b.id)).slice(0, 4);
  // Si no hay favoritos mostrar los primeros 4
  const displayBusinesses = favBusinesses.length > 0 ? favBusinesses : businesses.slice(0, 4);

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>¡Hola{customer?.Nombre ? `, ${customer.Nombre.split(" ")[0]}` : ""}! 👋</h2>
          <p>Aquí tienes un resumen de tus citas y actividad.</p>
        </div>
        <Link href="/cliente/descubrir" className="primary-btn">Descubrir negocios</Link>
      </section>

      {/* Layout principal: calendario + tabla */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* ─── CALENDARIO ─── */}
        <section className="section-card" style={{ padding: 0, overflow: "hidden" }}>
          {/* Header del calendario */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
            <button onClick={prevMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}>
              <ChevronLeft size={18} />
            </button>
            <h3 style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text)", margin: 0 }}>
              {MONTHS_ES[viewMonth]} {viewYear}
            </h3>
            <button onClick={nextMonth} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", alignItems: "center", padding: 4, borderRadius: 6 }}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Grid días de semana */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "8px 12px 4px" }}>
            {DOW_ES.map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--text-secondary)", padding: "4px 0" }}>
                {d}
              </div>
            ))}
          </div>

          {/* Celdas del mes */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 12px 16px", gap: 2, position: "relative" }}>
            {calendarDays.map((dateStr, i) => {
              if (!dateStr) return <div key={`empty-${i}`} />;
              const isToday = dateStr === todayStr;
              const hasAppts = !!apptByDate[dateStr];
              const appts = apptByDate[dateStr] || [];
              const dayNum = parseInt(dateStr.slice(8), 10);
              const isPast = dateStr < todayStr;

              return (
                <div
                  key={dateStr}
                  onMouseEnter={(e) => {
                    if (hasAppts) {
                      setHoveredDate(dateStr);
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.bottom + 8 });
                    }
                  }}
                  onMouseLeave={() => setHoveredDate(null)}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: 40,
                    borderRadius: "var(--radius-md)",
                    cursor: hasAppts ? "pointer" : "default",
                    background: isToday ? "var(--accent)" : hasAppts ? "rgba(1,105,111,0.1)" : "transparent",
                    border: isToday ? "none" : hasAppts ? "1px solid rgba(1,105,111,0.3)" : "1px solid transparent",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: isToday || hasAppts ? 700 : 400,
                    color: isToday ? "#fff" : isPast ? "var(--text-secondary)" : "var(--text)",
                  }}>
                    {dayNum}
                  </span>
                  {hasAppts && !isToday && (
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                      {appts.slice(0, 3).map((a, idx) => (
                        <div key={idx} style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_CONFIG[a.status]?.dot ?? "#888" }} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div style={{ padding: "10px 20px", borderTop: "1px solid var(--border)", display: "flex", gap: 16, flexWrap: "wrap" }}>
            {Object.entries(STATUS_CONFIG).slice(0, 3).map(([key, val]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: val.dot }} />
                {val.label}
              </div>
            ))}
          </div>
        </section>

        {/* ─── PRÓXIMAS RESERVAS (tabla compacta) ─── */}
        <section className="section-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text)", margin: 0 }}>Próximas citas</h3>
            <Link href="/cliente/mis-reservas" style={{ fontSize: "var(--text-xs)", color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
              Ver todas →
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-secondary)" }}>
              <CalendarDays size={36} style={{ opacity: 0.25, margin: "0 auto 12px" }} />
              <p style={{ margin: 0, fontWeight: 600 }}>Sin citas próximas</p>
              <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)" }}>Descubre negocios y realiza tu primera reserva</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {upcoming.map((a, i) => {
                const st = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
                const dateFormatted = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(new Date(a.date + "T12:00:00"));
                return (
                  <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < upcoming.length - 1 ? "1px solid var(--border)" : "none" }}>
                    {/* Fecha */}
                    <div style={{ minWidth: 44, textAlign: "center", background: "var(--surface-2)", borderRadius: 8, padding: "6px 4px" }}>
                      <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--text-secondary)", lineHeight: 1 }}>
                        {dateFormatted.split(" ")[1]?.toUpperCase()}
                      </p>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "var(--text-base)", color: "var(--text)" }}>
                        {dateFormatted.split(" ")[0]}
                      </p>
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.serviceName}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)", fontSize: "var(--text-xs)" }}>
                        <Clock size={11} /> {a.time}
                      </div>
                    </div>
                    {/* Badge */}
                    <span style={{ background: st.bg, color: st.color, padding: "3px 10px", borderRadius: 999, fontSize: "var(--text-xs)", fontWeight: 600, whiteSpace: "nowrap", flexShrink: 0 }}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* ─── NEGOCIOS FAVORITOS ─── */}
      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">
            {favBusinesses.length > 0 ? "Mis negocios favoritos" : "Negocios destacados"}
          </h3>
          <Link href="/cliente/descubrir" className="panel-subtle-link">Ver todos →</Link>
        </div>

        {displayBusinesses.length === 0 ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-secondary)" }}>
            <p style={{ margin: 0 }}>Explora negocios en la sección <strong>Descubrir</strong></p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginTop: 16 }}>
            {displayBusinesses.map((b) => (
              <div key={b.id} style={{ borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", overflow: "hidden", background: "var(--surface-2)", transition: "all 0.15s", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                {/* Banner */}
                <div style={{ height: 72, background: b.bannerUrl ? `url(${b.bannerUrl}) center/cover no-repeat` : "linear-gradient(135deg, var(--accent) 0%, #0f3638 100%)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
                  {b.fotoUrl && (
                    <img src={b.fotoUrl} alt={b.Nombre} style={{ position: "absolute", bottom: -16, left: 12, width: 36, height: 36, borderRadius: "50%", border: "2px solid var(--surface-2)", objectFit: "cover" }} />
                  )}
                </div>
                <div style={{ padding: b.fotoUrl ? "20px 12px 12px" : "12px" }}>
                  <p style={{ fontWeight: 700, margin: 0, fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.Nombre}</p>
                  {b.tipoNegocio && (
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--accent)", fontWeight: 600 }}>{b.tipoNegocio}</span>
                  )}
                  {b.Localicacion && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                      <MapPin size={10} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.Localicacion}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Tooltip del calendario */}
      {hoveredDate && apptByDate[hoveredDate] && (
        <div style={{
          position: "fixed",
          left: Math.min(tooltipPos.x, window.innerWidth - 220),
          top: tooltipPos.y,
          zIndex: 1000,
          background: "var(--surface-solid)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-lg)",
          padding: "12px 16px",
          minWidth: 200,
          maxWidth: 260,
          pointerEvents: "none",
        }}>
          <p style={{ fontWeight: 700, margin: "0 0 8px", fontSize: "var(--text-sm)", color: "var(--text)" }}>
            {new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long" }).format(new Date(hoveredDate + "T12:00:00"))}
          </p>
          {apptByDate[hoveredDate].map((a) => {
            const st = STATUS_CONFIG[a.status] ?? STATUS_CONFIG.pending;
            return (
              <div key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
                <div>
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--text)" }}>{a.serviceName}</p>
                  <p style={{ margin: 0, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{a.time}</p>
                </div>
                <span style={{ background: st.bg, color: st.color, padding: "2px 7px", borderRadius: 999, fontSize: "var(--text-xs)", fontWeight: 600 }}>{st.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
