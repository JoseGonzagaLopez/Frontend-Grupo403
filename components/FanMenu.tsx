"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
export interface FanMenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  color?: string; // per-item accent glow color
}
export interface FanMenuProps {
  items: FanMenuItem[];
  logoSrc?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────
function useReducedMotion() {
  const [v, setV] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setV(mq.matches);
    const h = (e: MediaQueryListEvent) => setV(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return v;
}

// ─────────────────────────────────────────────────────────────────────────────
// Geometry — arc sweeps right-to-up (0°→90°), origin = trigger center
// ─────────────────────────────────────────────────────────────────────────────
const R       = 112;  // arc radius px
const ARC0    =  8;   // start angle (deg from +X axis)
const ARC1    = 92;   // end angle
const T_SIZE  = 60;   // trigger button px
const I_SIZE  = 48;   // item button px

function pos(idx: number, total: number) {
  const a = total === 1 ? (ARC0 + ARC1) / 2
    : ARC0 + (idx * (ARC1 - ARC0)) / (total - 1);
  const r = (a * Math.PI) / 180;
  return { x: Math.cos(r) * R, y: -Math.sin(r) * R }; // CSS y grows down
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function FanMenu({ items, logoSrc = "/favicon.ico" }: FanMenuProps) {
  const [open, setOpen]       = useState(false);
  const [hover, setHover]     = useState<number | null>(null);
  const reduced               = useReducedMotion();

  // Escape to close
  const onKey = useCallback((e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); }, []);
  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  // Prevent bg scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const spring = "cubic-bezier(0.34,1.56,0.64,1)";
  const ease   = "cubic-bezier(0.16,1,0.30,1)";

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 290,
          background: open ? "rgba(5,5,16,0.50)" : "transparent",
          backdropFilter: open ? "blur(8px) saturate(130%)" : "none",
          WebkitBackdropFilter: open ? "blur(8px) saturate(130%)" : "none",
          pointerEvents: open ? "auto" : "none",
          transition: reduced ? "none" : `all 280ms ${ease}`,
        }}
      />

      {/* ── Root container — fixed top-left ── */}
      <div
        role="navigation"
        aria-label="Menú principal"
        style={{ position: "fixed", top: 18, left: 18, zIndex: 310, width: T_SIZE, height: T_SIZE }}
      >
        {/* dotted arc guide — visible when open */}
        <svg
          aria-hidden="true"
          width={R * 2 + I_SIZE + 8}
          height={R * 2 + I_SIZE + 8}
          style={{
            position: "absolute",
            top: T_SIZE / 2 - (R + I_SIZE / 2 + 4),
            left: T_SIZE / 2 - (R + I_SIZE / 2 + 4),
            pointerEvents: "none",
            opacity: open ? 0.14 : 0,
            transition: reduced ? "none" : `opacity 240ms ${ease}`,
          }}
        >
          {/* center the circle at (R + half_item + 4, R + half_item + 4) */}
          <circle
            cx={R + I_SIZE / 2 + 4}
            cy={R + I_SIZE / 2 + 4}
            r={R}
            fill="none"
            stroke="#4fd1c5"
            strokeWidth="1"
            strokeDasharray="3 7"
          />
        </svg>

        {/* ── Fan items ── */}
        {items.map((item, i) => {
          const { x, y } = pos(i, items.length);
          const isHover  = hover === i;
          const accent   = item.color ?? "#4fd1c5";
          const openDelay  = reduced ? 0 : i * 50;
          const closeDelay = reduced ? 0 : (items.length - 1 - i) * 28;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              style={{
                position: "absolute",
                top:  T_SIZE / 2 - I_SIZE / 2,
                left: T_SIZE / 2 - I_SIZE / 2,
                width: I_SIZE, height: I_SIZE,
                borderRadius: "50%",
                zIndex: 305,
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none",
                cursor: "pointer",
                color: isHover ? accent : "rgba(232,232,248,0.88)",
                fontSize: 20,
                // glass surface
                background: isHover ? `${accent}22` : "rgba(255,255,255,0.07)",
                backdropFilter: "blur(22px) saturate(180%)",
                WebkitBackdropFilter: "blur(22px) saturate(180%)",
                border: isHover ? `1.5px solid ${accent}55` : "1px solid rgba(255,255,255,0.16)",
                boxShadow: isHover
                  ? `0 0 0 5px ${accent}18, 0 8px 28px rgba(0,0,0,0.55)`
                  : "0 4px 18px rgba(0,0,0,0.45)",
                // animation
                opacity: open ? 1 : 0,
                transform: open
                  ? `translate(${x}px,${y}px) scale(${isHover ? 1.16 : 1})`
                  : `translate(0,0) scale(0.25)`,
                transition: reduced ? "none" : open
                  ? `opacity 360ms ${spring} ${openDelay}ms, transform 420ms ${spring} ${openDelay}ms,
                     background 160ms ${ease}, border-color 160ms ${ease}, box-shadow 160ms ${ease}, color 160ms ${ease}`
                  : `opacity 200ms ${ease} ${closeDelay}ms, transform 220ms ${ease} ${closeDelay}ms,
                     background 160ms ${ease}, border-color 160ms ${ease}, box-shadow 160ms ${ease}, color 160ms ${ease}`,
                pointerEvents: open ? "auto" : "none",
              }}
            >
              {item.icon}

              {/* floating label pill */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "calc(100% + 10px)",
                  top: "50%",
                  transform: `translateY(-50%) scale(${isHover ? 1 : 0.80})`,
                  transformOrigin: "left center",
                  whiteSpace: "nowrap",
                  background: "rgba(6,4,22,0.90)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(110,90,230,0.28)",
                  color: "#e8e8f8",
                  fontSize: "0.70rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  padding: "4px 12px",
                  borderRadius: 99,
                  pointerEvents: "none",
                  opacity: isHover ? 1 : 0,
                  transition: reduced ? "none" : `opacity 150ms ${ease}, transform 200ms ${spring}`,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.50)",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* ── Trigger button ── */}
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú de navegación"}
          onClick={() => setOpen(v => !v)}
          style={{
            position: "relative", zIndex: 315,
            width: T_SIZE, height: T_SIZE,
            borderRadius: "50%",
            cursor: "pointer", padding: 0, overflow: "visible",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: open ? "rgba(79,209,197,0.14)" : "rgba(255,255,255,0.09)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: open
              ? "2px solid rgba(79,209,197,0.55)"
              : "2px solid rgba(255,255,255,0.20)",
            boxShadow: open
              ? "0 0 0 7px rgba(79,209,197,0.10), 0 8px 32px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.16)"
              : "0 4px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
            transform: open ? "rotate(12deg) scale(1.06)" : "rotate(0deg) scale(1)",
            transition: reduced ? "none"
              : `transform 430ms ${spring}, border-color 250ms ${ease},
                 background 250ms ${ease}, box-shadow 250ms ${ease}`,
          }}
        >
          {/* pulsing ring — only when closed */}
          {!open && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                border: "1.5px solid rgba(79,209,197,0.30)",
                animation: reduced ? "none" : "fanRing 2.6s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          )}

          {/* logo / favicon */}
          <Image
            src={logoSrc}
            alt="Buk-A"
            width={T_SIZE}
            height={T_SIZE}
            style={{ width: "100%", height: "100%", objectFit: "cover",
                     borderRadius: "50%", pointerEvents: "none", userSelect: "none" }}
            draggable={false}
            priority
          />
        </button>

        <style>{`
          @keyframes fanRing {
            0%,100% { opacity:0.45; transform:scale(1);    }
            50%      { opacity:1;    transform:scale(1.18); }
          }
        `}</style>
      </div>
    </>
  );
}
