"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

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

const R      = 130;
const ARC0   = 10;   // ángulo inicio (grados desde eje X positivo, arriba)
const ARC1   = 80;   // ángulo fin
const T_SIZE = 52;   // tamaño trigger
const I_SIZE = 46;   // tamaño ítems

function arcPos(idx: number, total: number) {
  const a = total === 1 ? (ARC0 + ARC1) / 2 : ARC0 + (idx * (ARC1 - ARC0)) / (total - 1);
  const rad = (a * Math.PI) / 180;
  return { x: Math.cos(rad) * R, y: -Math.sin(rad) * R };
}

// Logo SVG inline de Buk-A — sin dependencia de Image ni favicon
function BukaLogo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      style={{ display: "block", flexShrink: 0 }}
    >
      <circle cx="20" cy="20" r="20" fill="url(#lg)" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4fd1c5" />
          <stop offset="1" stopColor="#6c3fc4" />
        </linearGradient>
      </defs>
      {/* Letra B estilizada */}
      <text
        x="20"
        y="27"
        textAnchor="middle"
        fontSize="20"
        fontWeight="700"
        fontFamily="'Satoshi','SF Pro Display',sans-serif"
        fill="white"
        letterSpacing="-1"
      >
        B
      </text>
    </svg>
  );
}

const FanItem = memo(function FanItem({
  item, x, y, open, oDelay, cDelay, reduced, onClose,
}: {
  item: FanMenuItem;
  x: number; y: number;
  open: boolean;
  oDelay: number; cDelay: number;
  reduced: boolean;
  onClose: () => void;
}) {
  const [hov, setHov] = useState(false);
  const accent = item.color ?? "#4fd1c5";
  const spring = "cubic-bezier(0.34,1.56,0.64,1)";
  const smooth = "cubic-bezier(0.25,0.46,0.45,0.94)";
  const snappy = "cubic-bezier(0.16,1,0.3,1)";

  return (
    <Link
      href={item.href}
      aria-label={item.label}
      onClick={onClose}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onFocus={() => setHov(true)}
      onBlur={() => setHov(false)}
      style={{
        position: "absolute",
        bottom: (T_SIZE - I_SIZE) / 2,
        left:   (T_SIZE - I_SIZE) / 2,
        width: I_SIZE, height: I_SIZE,
        borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        textDecoration: "none",
        cursor: open ? "pointer" : "default",
        background: hov
          ? `radial-gradient(circle at 40% 35%, ${accent}55, rgba(10,10,40,0.85) 70%)`
          : "rgba(255,255,255,0.10)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        border: `1px solid ${hov ? accent + "88" : "rgba(255,255,255,0.18)"  }`,
        boxShadow: hov
          ? `0 0 20px ${accent}55, 0 8px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.20)`
          : "0 6px 24px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)",
        opacity: open ? 1 : 0,
        transform: open
          ? `translate(${x}px,${y}px) scale(${hov ? 1.12 : 1})`
          : "translate(0px,0px) scale(0.15)",
        transition: reduced ? "none" : open
          ? `opacity 320ms ${snappy} ${oDelay}ms, transform 420ms ${spring} ${oDelay}ms, background 150ms ease, box-shadow 150ms ease`
          : `opacity 180ms ${smooth} ${cDelay}ms, transform 200ms ${smooth} ${cDelay}ms`,
        willChange: "transform, opacity",
        pointerEvents: open ? "auto" : "none",
        color: hov ? accent : "rgba(232,232,248,0.92)",
      }}
    >
      {/* Brillo interno tipo glass */}
      <span aria-hidden="true" style={{
        position: "absolute", top: "7%", left: "17%",
        width: "56%", height: "30%",
        borderRadius: "50%",
        background: "linear-gradient(135deg,rgba(255,255,255,0.50) 0%,rgba(255,255,255,0) 100%)",
        filter: "blur(2px)",
        pointerEvents: "none", zIndex: 1,
      }} />

      <span style={{ position: "relative", zIndex: 2, display: "flex" }}>
        {item.icon}
      </span>

      {/* Tooltip */}
      <span aria-hidden="true" style={{
        position: "absolute",
        left: "calc(100% + 10px)", top: "50%",
        transform: `translateY(-50%) translateX(${hov ? 0 : -8}px)`,
        whiteSpace: "nowrap",
        background: "rgba(6,4,22,0.88)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "#e8e8f8",
        fontSize: "0.70rem",
        fontWeight: 600,
        letterSpacing: "0.04em",
        padding: "4px 10px",
        borderRadius: 99,
        pointerEvents: "none",
        opacity: hov ? 1 : 0,
        transition: reduced ? "none" : "opacity 140ms ease, transform 160ms ease",
        boxShadow: "0 4px 14px rgba(0,0,0,0.4)",
      }}>
        {item.label}
      </span>
    </Link>
  );
});

export default function FanMenu({ items }: FanMenuProps) {
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduced  = useReducedMotion();
  const btnRef   = useRef<HTMLButtonElement>(null);
  const [hovTrigger, setHovTrigger] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { close(); btnRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const spring = "cubic-bezier(0.34,1.56,0.64,1)";
  const smooth = "cubic-bezier(0.25,0.46,0.45,0.94)";

  const menu = (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none" }}>

      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={close}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(4,4,18,0.52)",
          backdropFilter: "blur(8px) saturate(140%)",
          WebkitBackdropFilter: "blur(8px) saturate(140%)",
          opacity: open ? 1 : 0,
          transition: reduced ? "none" : `opacity 280ms ${smooth}`,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Zona de navegación — anclada bottom-left */}
      <div
        role="navigation"
        aria-label="Menú principal"
        style={{
          position: "absolute",
          bottom: 24, left: 24,
          width: T_SIZE, height: T_SIZE,
          pointerEvents: "auto",
        }}
      >
        {/* Anillo decorativo */}
        <div aria-hidden="true" style={{
          position: "absolute",
          bottom: T_SIZE / 2, left: T_SIZE / 2,
          width: R * 2, height: R * 2,
          marginLeft: -R, marginBottom: -R,
          borderRadius: "50%",
          border: "1px solid rgba(79,209,197,0.15)",
          pointerEvents: "none",
          opacity: open ? 1 : 0,
          transform: open ? "scale(1)" : "scale(0.4)",
          transition: reduced ? "none" : `opacity 350ms ${smooth}, transform 430ms ${spring}`,
        }} />

        {/* Ítems del abanico */}
        {items.map((item, i) => {
          const { x, y } = arcPos(i, items.length);
          return (
            <FanItem
              key={item.href}
              item={item}
              x={x} y={y}
              open={open}
              oDelay={reduced ? 0 : i * 55}
              cDelay={reduced ? 0 : (items.length - 1 - i) * 28}
              reduced={reduced}
              onClose={close}
            />
          );
        })}

        {/* Botón trigger — logo glass sin fondo negro */}
        <button
          ref={btnRef}
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen(v => !v)}
          onMouseEnter={() => setHovTrigger(true)}
          onMouseLeave={() => setHovTrigger(false)}
          style={{
            position: "absolute", bottom: 0, left: 0, zIndex: 2,
            width: T_SIZE, height: T_SIZE,
            borderRadius: "50%",
            cursor: "pointer",
            padding: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: hovTrigger
              ? "rgba(79,209,197,0.18)"
              : open
                ? "rgba(108,63,196,0.25)"
                : "rgba(255,255,255,0.11)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: `1.5px solid ${
              open ? "rgba(79,209,197,0.55)" : hovTrigger ? "rgba(79,209,197,0.40)" : "rgba(255,255,255,0.22)"
            }`,
            boxShadow: open
              ? "0 0 28px rgba(79,209,197,0.35), 0 8px 32px rgba(0,0,0,0.50), inset 0 1px 0 rgba(255,255,255,0.22)"
              : "0 6px 24px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.18)",
            transform: open
              ? `rotate(45deg) scale(${hovTrigger ? 1.10 : 1.04})`
              : `rotate(0deg) scale(${hovTrigger ? 1.08 : 1})`,
            transition: reduced ? "none" : `transform 460ms ${spring}, background 180ms ease, border-color 180ms ease, box-shadow 180ms ease`,
            willChange: "transform",
            overflow: "visible",  // sin clip que cause el negro
          }}
        >
          {/* Brillo interno del trigger */}
          <span aria-hidden="true" style={{
            position: "absolute", top: "7%", left: "16%",
            width: "58%", height: "32%",
            borderRadius: "50%",
            background: "linear-gradient(135deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0) 100%)",
            filter: "blur(3px)",
            pointerEvents: "none", zIndex: 2,
            transform: open ? "rotate(-45deg)" : "rotate(0deg)",
            transition: reduced ? "none" : `transform 460ms ${spring}`,
          }} />

          {/* Pulso externo cuando está cerrado */}
          <span aria-hidden="true" style={{
            position: "absolute", inset: -10,
            borderRadius: "50%",
            border: "1.5px solid rgba(79,209,197,0.25)",
            opacity: open ? 0 : 1,
            animation: reduced || open ? "none" : "fanRingPulse 3s ease-in-out infinite",
            transition: "opacity 200ms ease",
            pointerEvents: "none",
          }} />

          {/* Logo SVG inline — nunca negro */}
          <span style={{
            position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
            transform: open ? "rotate(-45deg)" : "rotate(0deg)",
            transition: reduced ? "none" : `transform 460ms ${spring}`,
          }}>
            <BukaLogo size={30} />
          </span>
        </button>

        <style>{`
          @keyframes fanRingPulse {
            0%,100%{opacity:.25;transform:scale(1);}
            50%{opacity:.85;transform:scale(1.20);}
          }
        `}</style>
      </div>
    </div>
  );

  return mounted ? createPortal(menu, document.body) : null;
}
