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

const R      = 190;  // radio aumentado para más separación entre ítems
const ARC0   =  12;  // ángulo inicio (grados desde +X) — más horizontal
const ARC1   =  98;  // ángulo fin — más vertical (amplía el arco total)
const T_SIZE =  58;
const I_SIZE =  52;  // ítems ligeramente más grandes

function arcPos(idx: number, total: number) {
  const a = total === 1 ? (ARC0 + ARC1) / 2 : ARC0 + (idx * (ARC1 - ARC0)) / (total - 1);
  const rad = (a * Math.PI) / 180;
  return { x: Math.cos(rad) * R, y: -Math.sin(rad) * R };
}

export default function FanMenu({ items, logoSrc = "/favicon.ico" }: FanMenuProps) {
  const [open, setOpen]       = useState(false);
  const [hover, setHover]     = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  // animPhase: "idle" | "opening" | "open" | "closing"
  const [animPhase, setAnimPhase] = useState<"idle" | "opening" | "open" | "closing">("idle");
  const reduced = useReducedMotion();
  const btnRef  = useRef<HTMLButtonElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Gestión de fases de animación
  useEffect(() => {
    if (reduced) return;
    if (open) {
      setAnimPhase("opening");
      const t = setTimeout(() => setAnimPhase("open"), 550);
      return () => clearTimeout(t);
    } else {
      if (animPhase !== "idle") {
        setAnimPhase("closing");
        const t = setTimeout(() => setAnimPhase("idle"), 380);
        return () => clearTimeout(t);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduced]);

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
  const smooth = "cubic-bezier(0.25,0.46,0.45,0.94)";
  const snappy = "cubic-bezier(0.16,1,0.3,1)";

  const menu = (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none" }}>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{
          position: "absolute", inset: 0,
          background: open ? "rgba(4,4,18,0.54)" : "transparent",
          backdropFilter: open ? "blur(8px) saturate(150%)" : "blur(0px)",
          WebkitBackdropFilter: open ? "blur(8px) saturate(150%)" : "blur(0px)",
          transition: reduced ? "none" : `background 340ms ${smooth}, backdrop-filter 340ms ${smooth}, -webkit-backdrop-filter 340ms ${smooth}`,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Anchor bottom-left */}
      <div
        role="navigation"
        aria-label="Menú principal"
        style={{ position: "absolute", bottom: 24, left: 24, width: T_SIZE, height: T_SIZE, pointerEvents: "auto" }}
      >
        {/* Arc ring guide */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: T_SIZE / 2, left: T_SIZE / 2,
            width: R * 2, height: R * 2,
            marginLeft: -R, marginBottom: -R,
            borderRadius: "50%",
            border: "1px dashed rgba(79,209,197,0.18)",
            pointerEvents: "none",
            opacity: open ? 1 : 0,
            transform: open ? "scale(1) rotate(0deg)" : "scale(0.45) rotate(-20deg)",
            transition: reduced ? "none" : `opacity 420ms ${smooth}, transform 520ms ${spring}`,
          }}
        />

        {/* Second decorative ring */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: T_SIZE / 2, left: T_SIZE / 2,
            width: (R - 28) * 2, height: (R - 28) * 2,
            marginLeft: -(R - 28), marginBottom: -(R - 28),
            borderRadius: "50%",
            border: "1px dashed rgba(108,63,196,0.13)",
            pointerEvents: "none",
            opacity: open ? 1 : 0,
            transform: open ? "scale(1) rotate(0deg)" : "scale(0.5) rotate(15deg)",
            transition: reduced ? "none" : `opacity 380ms ${smooth} 60ms, transform 480ms ${spring} 60ms`,
          }}
        />

        {/* Items */}
        {items.map((item, i) => {
          const { x, y } = arcPos(i, items.length);
          const isHov  = hover === i;
          const accent = item.color ?? "#4fd1c5";
          // stagger más largo y pronunciado al abrir
          const oDelay = reduced ? 0 : i * 65;
          const cDelay = reduced ? 0 : (items.length - 1 - i) * 35;

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
                bottom: (T_SIZE - I_SIZE) / 2,
                left:   (T_SIZE - I_SIZE) / 2,
                width: I_SIZE, height: I_SIZE,
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none",
                cursor: open ? "pointer" : "default",
                color: isHov ? accent : "rgba(232,232,248,0.90)",
                background: isHov ? `${accent}2a` : "rgba(255,255,255,0.09)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                border: isHov ? `1.5px solid ${accent}70` : "1px solid rgba(255,255,255,0.18)",
                boxShadow: isHov
                  ? `0 0 0 7px ${accent}16, 0 10px 30px rgba(0,0,0,0.55)`
                  : "0 4px 20px rgba(0,0,0,0.50)",
                opacity: open ? 1 : 0,
                // Animación: entra desde el botón con overshoot springy
                transform: open
                  ? `translate(${x}px,${y}px) scale(${isHov ? 1.18 : 1}) rotate(0deg)`
                  : "translate(0,0) scale(0.05) rotate(-90deg)",
                transition: reduced ? "none" : open
                  ? `opacity 380ms ${snappy} ${oDelay}ms, transform 480ms ${spring} ${oDelay}ms, background 180ms ${smooth}, border-color 180ms ${smooth}, box-shadow 180ms ${smooth}, color 180ms ${smooth}`
                  : `opacity 220ms ${smooth} ${cDelay}ms, transform 260ms ${smooth} ${cDelay}ms, background 180ms ${smooth}, border-color 180ms ${smooth}, box-shadow 180ms ${smooth}, color 180ms ${smooth}`,
                pointerEvents: open ? "auto" : "none",
              }}
            >
              {/* Icono con animación propia al aparecer */}
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: open ? "scale(1) rotate(0deg)" : "scale(0) rotate(180deg)",
                  transition: reduced ? "none" : open
                    ? `transform 400ms ${spring} ${oDelay + 80}ms`
                    : `transform 180ms ${smooth} ${cDelay}ms`,
                }}
              >
                {item.icon}
              </span>

              {/* Tooltip label */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "calc(100% + 12px)", top: "50%",
                  transform: `translateY(-50%) scale(${isHov ? 1 : 0.8})`,
                  transformOrigin: "left center",
                  whiteSpace: "nowrap",
                  background: "rgba(5,3,20,0.93)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid rgba(108,63,196,0.32)",
                  color: "#e8e8f8",
                  fontSize: "0.70rem", fontWeight: 600, letterSpacing: "0.04em",
                  padding: "4px 12px", borderRadius: 99,
                  pointerEvents: "none",
                  opacity: isHov ? 1 : 0,
                  transition: reduced ? "none" : `opacity 170ms ${smooth}, transform 210ms ${spring}`,
                  boxShadow: "0 4px 14px rgba(0,0,0,0.50)",
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Trigger */}
        <button
          ref={btnRef}
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen(v => !v)}
          style={{
            position: "absolute", bottom: 0, left: 0, zIndex: 2,
            width: T_SIZE, height: T_SIZE, borderRadius: "50%",
            cursor: "pointer", padding: 0, overflow: "visible",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: open ? "rgba(79,209,197,0.16)" : "rgba(255,255,255,0.10)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: open ? "2px solid rgba(79,209,197,0.65)" : "2px solid rgba(255,255,255,0.22)",
            boxShadow: open
              ? "0 0 0 9px rgba(79,209,197,0.09), 0 10px 36px rgba(0,0,0,0.55)"
              : "0 4px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)",
            // Rotación + ligero "bounce" al abrir
            transform: open ? "rotate(135deg) scale(1.08)" : "rotate(0deg) scale(1)",
            transition: reduced ? "none"
              : `transform 520ms ${spring}, border-color 300ms ${smooth}, background 300ms ${smooth}, box-shadow 300ms ${smooth}`,
          }}
        >
          {/* Pulse ring (solo cuando está cerrado) */}
          {!open && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute", inset: -10, borderRadius: "50%",
                border: "1.5px solid rgba(79,209,197,0.30)",
                animation: reduced ? "none" : "fanRingPulse 3s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Burst de partículas al abrir */}
          {(animPhase === "opening") && !reduced && (
            <>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <span
                  key={deg}
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    width: 5, height: 5,
                    borderRadius: "50%",
                    background: "rgba(79,209,197,0.75)",
                    pointerEvents: "none",
                    animation: `fanBurst 500ms ${snappy} forwards`,
                    // cada partícula sale en su dirección
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ["--deg" as any]: `${deg}deg`,
                  }}
                />
              ))}
            </>
          )}

          <Image
            src={logoSrc} alt="Buk-A" width={T_SIZE} height={T_SIZE}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              borderRadius: "50%", pointerEvents: "none", userSelect: "none", display: "block",
              transform: open ? "rotate(-135deg)" : "rotate(0deg)",
              transition: reduced ? "none" : `transform 520ms ${spring}`,
            }}
            draggable={false} priority
          />
        </button>

        <style>{`
          @keyframes fanRingPulse {
            0%,100% { opacity:.32; transform:scale(1);    }
            50%      { opacity:1;  transform:scale(1.24); }
          }
          @keyframes fanBurst {
            0%   { opacity: 1; transform: translate(0,0) scale(1); }
            100% { opacity: 0; transform:
                     translateX(calc(cos(var(--deg)) * 38px))
                     translateY(calc(sin(var(--deg)) * 38px))
                     scale(0); }
          }
          /* next-themes / Next.js debug indicator */
          [data-next-themes-indicator], #__next-themes-indicator,
          nextjs-portal { display: none !important; }
        `}</style>
      </div>
    </div>
  );

  return mounted ? createPortal(menu, document.body) : null;
}
