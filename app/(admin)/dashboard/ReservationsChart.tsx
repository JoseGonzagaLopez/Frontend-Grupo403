"use client";

import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Booking } from "@/lib/api";

interface ReservationsChartProps {
  appointments: Booking[];
}

export default function ReservationsChart({ appointments }: ReservationsChartProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const data = useMemo(() => {
    // Helper para obtener "YYYY-MM-DD" en hora LOCAL (evita el desfase UTC)
    function toLocalDateStr(d: Date): string {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }

    const today = new Date();
    const todayRaw = toLocalDateStr(today);

    // Ventana: 7 días atrás y 7 días adelante (15 días en total)
    const windowStart = new Date(today);
    windowStart.setDate(today.getDate() - 7);
    const windowEnd = new Date(today);
    windowEnd.setDate(today.getDate() + 7);

    // Generar los 15 días del rango siempre (aunque no haya reservas ese día)
    const days: { date: string; rawDate: string; reservas: number; time: number; isToday: boolean }[] = [];
    for (let d = new Date(windowStart); d <= windowEnd; d.setDate(d.getDate() + 1)) {
      const rawDate = toLocalDateStr(d);
      const formattedDate = new Date(`${rawDate}T00:00:00`).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });
      days.push({
        date: formattedDate,
        rawDate,
        reservas: 0,
        time: new Date(`${rawDate}T00:00:00`).getTime(),
        isToday: rawDate === todayRaw,
      });
    }

    // Contar reservas por día dentro de la ventana
    appointments.forEach((appointment) => {
      const entry = days.find((d) => d.rawDate === appointment.date);
      if (entry) entry.reservas++;
    });

    return days;
  }, [appointments]);

  if (!isMounted) {
    return (
      <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
        <span>Cargando gráfico...</span>
      </div>
    );
  }

  return (
    <div className="section-card" style={{ marginTop: "1.5rem" }}>
      <h3 className="panel-title" style={{ marginBottom: "1.5rem" }}>
        Reservas por día <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "var(--text-secondary)", marginLeft: 8 }}>últimos 7 días · hoy · próximos 7 días</span>
      </h3>
      <div style={{ width: "100%", height: 300, minHeight: 300, position: "relative" }}>
        <ResponsiveContainer width="99%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              dy={10}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
            />
            <Tooltip
              cursor={{ fill: "var(--surface-2)" }}
              contentStyle={{
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border)",
                backgroundColor: "var(--surface-solid)",
                boxShadow: "var(--shadow-md)",
              }}
              labelStyle={{ color: "var(--text)", fontWeight: 600, marginBottom: "4px" }}
              itemStyle={{ color: "var(--accent)", fontWeight: 500 }}
              formatter={(value: any) => [`${value} reserva${value === 1 ? "" : "s"}`, "Reservas"]}
            />
            <Bar dataKey="reservas" radius={[4, 4, 0, 0]} maxBarSize={50}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isToday ? "var(--teal, #2dd4bf)" : "var(--accent)"}
                  opacity={entry.isToday ? 1 : 0.65}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
