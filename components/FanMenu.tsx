"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface FanMenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

export interface FanMenuProps {
  items: FanMenuItem[];
  logoSrc: string;
}

// ─── Hook: prefers-reduced-motion ───────────────────────────────────────────
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return reduced;
}

// ─── Constants ──────────────────────────────────────────────────────────────
const START_ANGLE = 30;   // degrees
const END_ANGLE   = 150;  // degrees
const RADIUS      = 100;  // px

// ─── Component ──────────────────────────────────────────────────────────────
export default function FanMenu({ items, logoSrc }: FanMenuProps) {
  const [open, setOpen] = useState(false);
  const reduced = usePrefersReducedMotion();

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); },
    []
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Position for each item along the arc
  function getItemPosition(index: number): { x: number; y: number } {
    const angle =
      items.length === 1
        ? (START_ANGLE + END_ANGLE) / 2
        : START_ANGLE + (index * (END_ANGLE - START_ANGLE)) / (items.length - 1);
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * RADIUS,
      y: Math.sin(rad) * RADIUS,
    };
  }

  // ── Styles ────────────────────────────────────────────────────────────────
  const wrapperStyle: React.CSSProperties = {
    position: "fixed",
    top: 16,
    left: 16,
    zIndex: 300,
    width: 60,
    height: 60,
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 290,
    background: "rgba(0,0,0,0.30)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
    transition: reduced ? "none" : "opacity 200ms ease",
  };

  const triggerStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 310,
    width: 60,
    height: 60,
    borderRadius: "50%",
    overflow: "hidden",
    border: "2px solid rgba(255,255,255,0.25)",
    cursor: "pointer",
    background: "rgba(255,255,255,0.10)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: open
      ? "0 8px 32px rgba(0,0,0,0.40), 0 0 20px var(--color-teal-glow)"
      : "0 4px 20px rgba(0,0,0,0.30)",
    transform: open ? "rotate(15deg)" : "rotate(0deg)",
    transition: reduced
      ? "none"
      : `transform var(--duration-normal, 350ms) var(--ease-spring, cubic-bezier(0.34,1.56,0.64,1)),
         box-shadow var(--duration-fast, 200ms) var(--ease-smooth, cubic-bezier(0.25,0.46,0.45,0.94))`,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const logoStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    borderRadius: "50%",
    pointerEvents: "none",
    userSelect: "none",
  };

  // ── Fan items ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        style={overlayStyle}
        onClick={() => setOpen(false)}
      />

      {/* Container */}
      <div style={wrapperStyle} aria-label="Menú de navegación rápida">

        {/* Fan items */}
        {items.map((item, index) => {
          const { x, y } = getItemPosition(index);
          // Stagger: open → delay per item, close → all at once
          const delay = open
            ? reduced ? 0 : index * 60
            : 0;

          const itemStyle: React.CSSProperties = {
            position: "absolute",
            // Anchor at center of trigger button (30px = 60/2)
            top: 30,
            left: 30,
            width: 52,
            height: 52,
            marginTop: -26, // half of item size
            marginLeft: -26,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.10)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.20)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 305,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(0,0,0,0.35)",
            // Animation
            opacity: open ? 1 : 0,
            transform: open
              ? `translate(${x}px, ${-y}px) scale(1)`   // y is inverted (CSS top grows down)
              : `translate(0px, 0px) scale(0.5)`,
            transition: reduced
              ? "none"
              : open
                ? `opacity var(--duration-normal, 350ms) var(--ease-spring, cubic-bezier(0.34,1.56,0.64,1)) ${delay}ms,
                   transform var(--duration-normal, 350ms) var(--ease-spring, cubic-bezier(0.34,1.56,0.64,1)) ${delay}ms`
                : `opacity var(--duration-fast, 200ms) var(--ease-smooth, cubic-bezier(0.25,0.46,0.45,0.94)),
                   transform var(--duration-fast, 200ms) var(--ease-smooth, cubic-bezier(0.25,0.46,0.45,0.94))`,
            pointerEvents: open ? "auto" : "none",
          };

          const tooltipStyle: React.CSSProperties = {
            position: "absolute",
            top: "50%",
            left: "calc(100% + 10px)",
            transform: "translateY(-50%)",
            background: "rgba(10,10,40,0.85)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(120,100,255,0.20)",
            color: "#e8e8f8",
            fontSize: "0.75rem",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: 8,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 150ms ease",
            boxShadow: "0 4px 12px rgba(0,0,0,0.35)",
          };

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              title={item.label}
              style={itemStyle}
              onClick={() => setOpen(false)}
              // Tooltip via CSS sibling trick using onMouseEnter/Leave on Link
              onMouseEnter={(e) => {
                const tooltip = e.currentTarget.querySelector<HTMLElement>(".fan-tooltip");
                if (tooltip) tooltip.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                const tooltip = e.currentTarget.querySelector<HTMLElement>(".fan-tooltip");
                if (tooltip) tooltip.style.opacity = "0";
              }}
            >
              {/* Icon */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#e8e8f8",
                  fontSize: 22,
                }}
              >
                {item.icon}
              </span>

              {/* Tooltip */}
              <span className="fan-tooltip" style={tooltipStyle} aria-hidden="true">
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Trigger button */}
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú de navegación"}
          style={triggerStyle}
          onClick={() => setOpen((v) => !v)}
        >
          <img src={logoSrc} alt="Buk-A" style={logoStyle} />
        </button>

      </div>
    </>
  );
}
