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
    </div>
  );
}
