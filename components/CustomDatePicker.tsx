"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

interface CustomDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const daysOfWeek = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  // Ajustar para que Lunes sea 0 y Domingo 6
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function CustomDatePicker({ value, onChange, placeholder = "Seleccionar fecha" }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize display month based on value or current date
  const initialDate = value ? new Date(value + "T12:00:00") : new Date();
  const [currentMonth, setCurrentMonth] = useState({
    month: initialDate.getMonth(),
    year: initialDate.getFullYear(),
  });

  // When value changes externally, update the visible month
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T12:00:00");
      setCurrentMonth({ month: d.getMonth(), year: d.getFullYear() });
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth((prev) => ({
      month: prev.month === 0 ? 11 : prev.month - 1,
      year: prev.month === 0 ? prev.year - 1 : prev.year,
    }));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth((prev) => ({
      month: prev.month === 11 ? 0 : prev.month + 1,
      year: prev.month === 11 ? prev.year + 1 : prev.year,
    }));
  };

  const handleDateClick = (day: number) => {
    const formattedMonth = String(currentMonth.month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    onChange(`${currentMonth.year}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth.year, currentMonth.month);
  const firstDay = getFirstDayOfMonth(currentMonth.year, currentMonth.month);
  const emptyDays = Array.from({ length: firstDay });
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const displayDate = value ? new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(new Date(value + "T12:00:00")) : "";

  return (
    <div ref={containerRef} className="custom-datepicker" style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        className="input custom-datepicker__trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <span style={{ color: value ? "inherit" : "var(--text-tertiary)" }}>
          {displayDate || placeholder}
        </span>
        <Calendar size={18} style={{ color: "var(--text-tertiary)" }} />
      </button>

      {isOpen && (
        <div className="custom-datepicker__popover">
          <div className="custom-datepicker__header">
            <button type="button" onClick={handlePrevMonth} className="custom-datepicker__nav">
              <ChevronLeft size={20} />
            </button>
            <span className="custom-datepicker__title">
              {monthNames[currentMonth.month]} {currentMonth.year}
            </span>
            <button type="button" onClick={handleNextMonth} className="custom-datepicker__nav">
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="custom-datepicker__grid">
            {daysOfWeek.map((day) => (
              <div key={day} className="custom-datepicker__weekday">
                {day}
              </div>
            ))}
            
            {emptyDays.map((_, i) => (
              <div key={`empty-${i}`} className="custom-datepicker__day empty" />
            ))}
            
            {days.map((day) => {
              const currentDateStr = `${currentMonth.year}-${String(currentMonth.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isSelected = value === currentDateStr;
              
              const today = new Date();
              const isToday = today.getDate() === day && today.getMonth() === currentMonth.month && today.getFullYear() === currentMonth.year;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDateClick(day)}
                  className={`custom-datepicker__day ${isSelected ? "selected" : ""} ${isToday && !isSelected ? "today" : ""}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .custom-datepicker__popover {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          z-index: 50;
          background: var(--surface-solid, #ffffff);
          border: 1px solid var(--border-strong, #e5e7eb);
          border-radius: var(--radius-lg, 12px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
          padding: 16px;
          width: 320px;
          animation: slideDown 0.2s ease-out;
        }

        .custom-datepicker__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .custom-datepicker__title {
          font-weight: 600;
          font-size: 1rem;
          color: var(--text, #111827);
        }

        .custom-datepicker__nav {
          padding: 6px;
          border-radius: var(--radius-md, 8px);
          color: var(--text-secondary, #6b7280);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }
        
        .custom-datepicker__nav:hover {
          background-color: var(--surface-hover, #f3f4f6);
          color: var(--text, #111827);
        }

        .custom-datepicker__grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
          text-align: center;
        }

        .custom-datepicker__weekday {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-tertiary, #9ca3af);
          margin-bottom: 8px;
        }

        .custom-datepicker__day {
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          font-size: 0.875rem;
          margin: auto;
          transition: all 0.2s;
          color: var(--text, #111827);
        }

        .custom-datepicker__day:not(.empty):hover {
          background-color: var(--surface-hover, #f3f4f6);
        }

        .custom-datepicker__day.today {
          color: var(--accent, #4f46e5);
          font-weight: bold;
          background-color: var(--accent-soft, #eef2ff);
        }

        .custom-datepicker__day.selected {
          background-color: var(--accent, #4f46e5);
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px var(--accent-glow, rgba(79, 70, 229, 0.4));
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
