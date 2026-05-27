"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface FanMenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  /** Optional accent color for the glow, defaults to teal */
  color?: string;
}

export interface FanMenuProps {
  items: FanMenuItem[];
  logoSrc?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometry — arc from bottom-left origin
// Arc sweeps from 0° (right) to 90° (up), fan opens toward upper-right
// ─────────────────────────────────────────────────────────────────────────────
const RADIUS   = 110;     // px — distance from trigger center to item center
const ARC_FROM = 15;      // degrees from X-axis
const ARC_TO   = 95;      // degrees from X-axis
const TRIGGER_SIZE = 58;  // px
const ITEM_SIZE    = 50;  // px

function itemPosition(index: number, total: number) {
  const angle = total === 1
    ? (ARC_FROM + ARC_TO) / 2
    : ARC_FROM + (index * (ARC_TO - ARC_FROM)) / (total - 1);
  const rad = (angle * Math.PI) / 180;
  return {
    x:  Math.cos(rad) * RADIUS,
    y: -Math.sin(rad) * RADIUS, // CSS y grows downward, so negate
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FanMenu({ items, logoSrc = "/favicon.ico" }: FanMenuProps) {
  const [open, setOpen]           = useState(false);
  const [hovered, setHovered]     = useState<number | null>(null);
  const reduced                   = usePrefersReducedMotion();
  const triggerRef                = useRef<HTMLButtonElement>(null);

  /* close on Escape */
  const onKey = useCallback(
    (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); },
    []
  );
  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  /* prevent background scroll when open */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const spring  = `cubic-bezier(0.34,1.56,0.64,1)`;
  const smooth  = `cubic-bezier(0.25,0.46,0.45,0.94)`;
  const fast    = `cubic-bezier(0.16,1,0.30,1)`;

  return (
    <>
      {/* ── Backdrop overlay ─────────────────────────────── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 290,
          background: open ? "rgba(5,5,16,0.45)" : "transparent",
          backdropFilter: open ? "blur(6px) saturate(120%)" : "none",
          WebkitBackdropFilter: open ? "blur(6px) saturate(120%)" : "none",
          pointerEvents: open ? "auto" : "none",
          transition: reduced ? "none" : `background 300ms ${smooth}, backdrop-filter 300ms ${smooth}`,
        }}
      />

      {/* ── Menu root — anchored top-left ─────────────────── */}
      <div
        role="navigation"
        aria-label="Menú principal"
        style={{
          position: "fixed", top: 20, left: 20,
          zIndex: 310,
          width: TRIGGER_SIZE, height: TRIGGER_SIZE,
        }}
      >
        {/* ── Arc ring hint (decorative, shows when open) ── */}
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            top: TRIGGER_SIZE / 2, left: TRIGGER_SIZE / 2,
            width: (RADIUS + ITEM_SIZE) * 2,
            height: (RADIUS + ITEM_SIZE) * 2,
            transform: `translate(-50%, -50%)`,
            pointerEvents: "none",
            opacity: open ? 0.18 : 0,
            transition: reduced ? "none" : `opacity 250ms ${smooth}`,
          }}
        >
          <circle
            cx={RADIUS + ITEM_SIZE}
            cy={RADIUS + ITEM_SIZE}
            r={RADIUS}
            fill="none"
            stroke="rgba(79,209,197,0.9)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        </svg>

        {/* ── Fan items ──────────────────────────────────── */}
        {items.map((item, i) => {
          const { x, y } = itemPosition(i, items.length);
          const delay = open ? (reduced ? 0 : i * 55) : (reduced ? 0 : (items.length - 1 - i) * 30);
          const isHovered = hovered === i;
          const accentColor = item.color ?? "#4fd1c5";

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              style={{
                /* ─ positioning ─ */
                position: "absolute",
                top:  TRIGGER_SIZE / 2 - ITEM_SIZE / 2,
                left: TRIGGER_SIZE / 2 - ITEM_SIZE / 2,
                width:  ITEM_SIZE,
                height: ITEM_SIZE,
                borderRadius: "50%",
                zIndex: 305,

                /* ─ glass surface ─ */
                background: isHovered
                  ? `rgba(79,209,197,0.18)`
                  : `rgba(255,255,255,0.08)`,
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: isHovered
                  ? `1px solid ${accentColor}55`
                  : `1px solid rgba(255,255,255,0.18)`,
                boxShadow: isHovered
                  ? `0 0 0 4px ${accentColor}22, 0 8px 32px rgba(0,0,0,0.50)`
                  : `0 4px 18px rgba(0,0,0,0.40)`,

                /* ─ layout ─ */
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isHovered ? accentColor : "rgba(232,232,248,0.85)",
                fontSize: 20,
                textDecoration: "none",
                cursor: "pointer",

                /* ─ animation ─ */
                opacity:   open ? 1 : 0,
                transform: open
                  ? `translate(${x}px, ${y}px) scale(${isHovered ? 1.18 : 1})`
                  : `translate(0,0) scale(0.3)`,
                transition: reduced ? "none" : open
                  ? `opacity  350ms ${spring} ${delay}ms,
                     transform 400ms ${spring} ${delay}ms,
                     background 180ms ${fast},
                     border-color 180ms ${fast},
                     box-shadow 180ms ${fast},
                     color 180ms ${fast}`
                  : `opacity  200ms ${smooth} ${delay}ms,
                     transform 220ms ${smooth} ${delay}ms,
                     background 180ms ${fast},
                     border-color 180ms ${fast},
                     box-shadow 180ms ${fast},
                     color 180ms ${fast}`,
                pointerEvents: open ? "auto" : "none",
              }}
            >
              {/* icon */}
              {item.icon}

              {/* floating label pill */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  /* position label to the right of item, but above item when item is almost vertical */
                  left: "calc(100% + 10px)",
                  top: "50%",
                  transform: `translateY(-50%) scale(${isHovered ? 1 : 0.85})`,
                  transformOrigin: "left center",
                  whiteSpace: "nowrap",
                  background: "rgba(8,5,28,0.88)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: `1px solid rgba(120,100,255,0.25)`,
                  color: "#e8e8f8",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                  padding: "4px 11px",
                  borderRadius: 99,
                  pointerEvents: "none",
                  opacity: isHovered ? 1 : 0,
                  transition: reduced ? "none" : `opacity 160ms ${fast}, transform 200ms ${spring}`,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* ── Trigger button ─────────────────────────────── */}
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen(v => !v)}
          style={{
            position: "relative",
            zIndex: 315,
            width: TRIGGER_SIZE, height: TRIGGER_SIZE,
            borderRadius: "50%",
            border: open
              ? "2px solid rgba(79,209,197,0.55)"
              : "2px solid rgba(255,255,255,0.22)",
            background: open
              ? "rgba(79,209,197,0.12)"
              : "rgba(255,255,255,0.10)",
            backdropFilter: "blur(24px) saturate(200%)",
            WebkitBackdropFilter: "blur(24px) saturate(200%)",
            boxShadow: open
              ? `0 0 0 6px rgba(79,209,197,0.12), 0 8px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.18)`
              : `0 4px 20px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.14)`,
            cursor: "pointer",
            padding: 0,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: open ? "rotate(15deg) scale(1.05)" : "rotate(0deg) scale(1)",
            transition: reduced ? "none" :
              `transform 420ms ${spring},
               border-color 250ms ${smooth},
               background 250ms ${smooth},
               box-shadow 250ms ${smooth}`,
          }}
        >
          {/* glow ring pulse when closed */}
          {!open && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute", inset: -6,
                borderRadius: "50%",
                border: "1.5px solid rgba(79,209,197,0.25)",
                animation: reduced ? "none" : "fanPulse 2.5s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          )}

          {/* favicon / logo */}
          <Image
            src={logoSrc}
            alt="Buk-A"
            width={TRIGGER_SIZE}
            height={TRIGGER_SIZE}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
              pointerEvents: "none",
              userSelect: "none",
            }}
            draggable={false}
            priority
          />
        </button>

        {/* ── Keyframe injection ─────────────────────────── */}
        <style>{`
          @keyframes fanPulse {
            0%, 100% { opacity: 0.5; transform: scale(1); }
            50%       { opacity: 1;   transform: scale(1.15); }
          }
        `}</style>
      </div>
    </>
  );
}
