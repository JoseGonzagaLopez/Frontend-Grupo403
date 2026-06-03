"use client";

import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
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
    // Group by date and count reservations
    const chartData = appointments.reduce((acc, appointment) => {
      const date = appointment.date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and prioritize dates near today when there are many
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groupedData = Object.entries(chartData).map(([date, count]) => {
      const dateObj = new Date(`${date}T00:00:00`);
      const formattedDate = dateObj.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
      });

      return {
        date: formattedDate,
        rawDate: date,
        reservas: count,
        time: dateObj.getTime(),
      };
    });

    if (groupedData.length <= 14) {
      return groupedData.sort((a, b) => a.time - b.time);
    }

    const nearestDates = groupedData
      .slice()
      .sort((a, b) => Math.abs(a.time - today.getTime()) - Math.abs(b.time - today.getTime()))
      .slice(0, 14)
      .sort((a, b) => a.time - b.time);

    return nearestDates;
  }, [appointments]);

  if (!isMounted) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500 bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm">Cargando gráfico...</span>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-gray-500 bg-white rounded-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <div className="section-card" style={{ marginTop: "1.5rem" }}>
      <h3 className="panel-title" style={{ marginBottom: "1.5rem" }}>
        Reservas por día
      </h3>
      <div style={{ width: "100%", height: 300, minHeight: 300, position: "relative" }}>
        <ResponsiveContainer width="99%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            />
            <Tooltip 
              cursor={{ fill: 'var(--surface-2)' }}
              contentStyle={{ 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border)', 
                backgroundColor: 'var(--surface-solid)',
                boxShadow: 'var(--shadow-md)' 
              }}
              labelStyle={{ color: 'var(--text)', fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: 'var(--accent)', fontWeight: 500 }}
              formatter={(value: any) => [`${value} reserva${value === 1 ? '' : 's'}`, 'Reservas']}
            />
            <Bar 
              dataKey="reservas" 
              fill="var(--accent)" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
