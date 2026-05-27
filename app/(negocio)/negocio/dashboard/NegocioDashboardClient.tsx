"use client";

import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { Booking } from "@/lib/api";

type ChartMetric = "ingresos" | "reservas" | "clientes";

export default function NegocioDashboardClient({ appointments }: { appointments: Booking[] }) {
  const [metric, setMetric] = useState<ChartMetric>("ingresos");

  const chartData = useMemo(() => {
    // Agrupar por fecha en los últimos 30 días
    const dataMap = new Map<string, { date: string; ingresos: number; reservas: number; clientes: Set<number> }>();
    
    // Crear mapa de los últimos 30 días
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      dataMap.set(dateStr, {
        date: new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short" }).format(d),
        ingresos: 0,
        reservas: 0,
        clientes: new Set(),
      });
    }

    appointments.forEach((app) => {
      if (app.status === "no_show" || app.status === "cancelled") return;
      if (dataMap.has(app.date)) {
        const item = dataMap.get(app.date)!;
        item.ingresos += app.importe || 0;
        item.reservas += 1;
        item.clientes.add(app.customerId as number);
      }
    });

    return Array.from(dataMap.values()).map(item => ({
      date: item.date,
      ingresos: item.ingresos,
      reservas: item.reservas,
      clientes: item.clientes.size,
    }));
  }, [appointments]);

  return (
    <section className="section-card" style={{ marginTop: 24, marginBottom: 24 }}>
      <div className="panel-title-row" style={{ marginBottom: 16 }}>
        <h3 className="panel-title">Rendimiento (Últimos 30 días)</h3>
        <select 
          className="input" 
          style={{ width: "auto", minWidth: 150 }} 
          value={metric} 
          onChange={(e) => setMetric(e.target.value as ChartMetric)}
        >
          <option value="ingresos">Dinero facturado</option>
          <option value="reservas">Número de reservas</option>
          <option value="clientes">Clientes únicos</option>
        </select>
      </div>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="var(--text-tertiary)" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => metric === "ingresos" ? `€${val}` : val}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-md)" }}
              itemStyle={{ color: "var(--text)", fontWeight: 600 }}
              formatter={(value: number) => [metric === "ingresos" ? `${value}€` : value, metric === "ingresos" ? "Ingresos" : metric === "reservas" ? "Reservas" : "Clientes"]}
            />
            <Area type="monotone" dataKey={metric} stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
