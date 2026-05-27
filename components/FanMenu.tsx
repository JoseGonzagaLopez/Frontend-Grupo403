"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";

export interface FanMenuItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  color?: string;
}
export interface FanMenuProps {
  items: FanMenuItem[];
  logoSrc?: string;
}

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

// Arc geometry: bottom-left anchor, items fan upward-right
// Angles measured from +X axis going counter-clockwise
const R      = 110; // radius px
const ARC0   =  40; // start angle (up-right diagonal)
const ARC1   =  95; // end angle  (near vertical up)
const T_SIZE =  58; // trigger diameter
const I_SIZE =  48; // item diameter

function arcPos(idx: number, total: number) {
  const a = total === 1
    ? (ARC0 + ARC1) / 2
    : ARC0 + (idx * (ARC1 - ARC0)) / (total - 1);
  const rad = (a * Math.PI) / 180;
  // negative Y because CSS y-axis grows downward; items go UP from trigger
  return { x: Math.cos(rad) * R, y: -Math.sin(rad) * R };
}

export default function FanMenu({ items, logoSrc = "/favicon.ico" }: FanMenuProps) {
  const [open, setOpen]     = useState(false);
  const [hover, setHover]   = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const reduced  = useReducedMotion();
  const btnRef   = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
  }, []);
  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const spring = "cubic-bezier(0.34,1.56,0.64,1)";
  const ease   = "cubic-bezier(0.16,1,0.30,1)";

  const menu = (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none" }}>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{
          position: "absolute", inset: 0,
          background: open ? "rgba(4,4,18,0.52)" : "transparent",
          backdropFilter: open ? "blur(7px) saturate(140%)" : "none",
          WebkitBackdropFilter: open ? "blur(7px) saturate(140%)" : "none",
          transition: reduced ? "none" : `all 260ms ${ease}`,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Anchor — fixed bottom-left */}
      <div
        role="navigation"
        aria-label="Menú principal"
        style={{
          position: "absolute",
          bottom: 22,
          left: 22,
          width: T_SIZE,
          height: T_SIZE,
          pointerEvents: "auto",
        }}
      >
        {/* Fan items */}
        {items.map((item, i) => {
          const { x, y } = arcPos(i, items.length);
          const isHov   = hover === i;
          const accent  = item.color ?? "#4fd1c5";
          const oDelay  = reduced ? 0 : i * 50;
          const cDelay  = reduced ? 0 : (items.length - 1 - i) * 30;

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
                bottom: 0, left: 0,
                width: I_SIZE, height: I_SIZE,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none",
                cursor: open ? "pointer" : "default",
                color: isHov ? accent : "rgba(232,232,248,0.90)",
                fontSize: 20,
                background: isHov ? `${accent}28` : "rgba(255,255,255,0.09)",
                backdropFilter: "blur(22px) saturate(180%)",
                WebkitBackdropFilter: "blur(22px) saturate(180%)",
                border: isHov ? `1.5px solid ${accent}66` : "1px solid rgba(255,255,255,0.18)",
                boxShadow: isHov
                  ? `0 0 0 6px ${accent}18, 0 8px 28px rgba(0,0,0,0.55)`
                  : "0 4px 18px rgba(0,0,0,0.50)",
                opacity: open ? 1 : 0,
                // anchor at bottom-left; offset by half trigger - half item so they overlap trigger center
                transform: open
                  ? `translate(${x - (I_SIZE - T_SIZE) / 2}px, ${y + (T_SIZE - I_SIZE) / 2}px) scale(${isHov ? 1.14 : 1})`
                  : `translate(0,0) scale(0.2)`,
                transition: reduced ? "none" : open
                  ? `opacity 340ms ${spring} ${oDelay}ms, transform 400ms ${spring} ${oDelay}ms, background 140ms ${ease}, border-color 140ms ${ease}, box-shadow 140ms ${ease}, color 140ms ${ease}`
                  : `opacity 190ms ${ease} ${cDelay}ms, transform 210ms ${ease} ${cDelay}ms, background 140ms ${ease}, border-color 140ms ${ease}, box-shadow 140ms ${ease}, color 140ms ${ease}`,
                pointerEvents: open ? "auto" : "none",
              }}
            >
              {item.icon}
              {/* label pill */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "calc(100% + 10px)",
                  top: "50%",
                  transform: `translateY(-50%) scale(${isHov ? 1 : 0.78})`,
                  transformOrigin: "left center",
                  whiteSpace: "nowrap",
                  background: "rgba(5,3,20,0.92)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(108,63,196,0.30)",
                  color: "#e8e8f8",
                  fontSize: "0.70rem",
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  padding: "4px 12px",
                  borderRadius: 99,
                  pointerEvents: "none",
                  opacity: isHov ? 1 : 0,
                  transition: reduced ? "none" : `opacity 150ms ${ease}, transform 200ms ${spring}`,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.50)",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Trigger button */}
        <button
          ref={btnRef}
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen(v => !v)}
          style={{
            position: "absolute",
            bottom: 0, left: 0,
            zIndex: 2,
            width: T_SIZE, height: T_SIZE,
            borderRadius: "50%",
            cursor: "pointer", padding: 0, overflow: "visible",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: open ? "rgba(79,209,197,0.16)" : "rgba(255,255,255,0.10)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: open
              ? "2px solid rgba(79,209,197,0.60)"
              : "2px solid rgba(255,255,255,0.22)",
            boxShadow: open
              ? "0 0 0 8px rgba(79,209,197,0.10), 0 8px 32px rgba(0,0,0,0.55)"
              : "0 4px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)",
            transform: open ? "rotate(12deg) scale(1.07)" : "rotate(0deg) scale(1)",
            transition: reduced ? "none"
              : `transform 420ms ${spring}, border-color 240ms ${ease}, background 240ms ${ease}, box-shadow 240ms ${ease}`,
          }}
        >
          {!open && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute", inset: -9, borderRadius: "50%",
                border: "1.5px solid rgba(79,209,197,0.32)",
                animation: reduced ? "none" : "fanRingPulse 2.8s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          )}
          <Image
            src={logoSrc} alt="Buk-A"
            width={T_SIZE} height={T_SIZE}
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%", pointerEvents: "none", userSelect: "none", display: "block" }}
            draggable={false} priority
          />
        </button>

        <style>{`
          @keyframes fanRingPulse {
            0%,100% { opacity:.38; transform:scale(1);    }
            50%      { opacity:1;  transform:scale(1.22); }
          }
        `}</style>
      </div>
    </div>
  );

  return mounted ? createPortal(menu, document.body) : null;
}
