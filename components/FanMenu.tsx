"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
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

const R      = 190;
const ARC0   =  -4;
const ARC1   =  85;
const T_SIZE =  58;
const I_SIZE =  52;

function arcPos(idx: number, total: number) {
  const a = total === 1 ? (ARC0 + ARC1) / 2 : ARC0 + (idx * (ARC1 - ARC0)) / (total - 1);
  const rad = (a * Math.PI) / 180;
  return { x: Math.cos(rad) * R, y: -Math.sin(rad) * R };
}

const FanItem = memo(function FanItem({
  item, x, y, open, oDelay, cDelay, reduced,
}: {
  item: FanMenuItem;
  x: number; y: number;
  open: boolean;
  oDelay: number; cDelay: number;
  reduced: boolean;
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
        // Glass completamente estático — nunca cambia
        background: "rgba(255,255,255,0.12)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.22)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
        // Solo opacity + transform — GPU puro
        opacity: open ? 1 : 0,
        transform: open
          ? `translate(${x}px,${y}px) scale(${hov ? 1.13 : 1})`
          : "translate(0px,0px) scale(0.1)",
        transition: reduced ? "none" : open
          ? `opacity 350ms ${snappy} ${oDelay}ms, transform 450ms ${spring} ${oDelay}ms`
          : `opacity 200ms ${smooth} ${cDelay}ms, transform 230ms ${smooth} ${cDelay}ms`,
        willChange: "transform, opacity",
        pointerEvents: open ? "auto" : "none",
        // color fijo — el cambio de color lo hace una capa encima via opacity
        color: "rgba(232,232,248,0.95)",
      }}
    >
      {/* Capa de color base (siempre visible, baja opacidad) */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${accent}18, transparent 70%)`,
          opacity: 1,
          pointerEvents: "none",
        }}
      />

      {/* Capa de hover — solo opacity anima, sin repaint */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute", inset: 0, borderRadius: "50%",
          background: `radial-gradient(circle at 40% 35%, ${accent}40, ${accent}10 70%)`,
          border: `1.5px solid ${accent}50`,
          opacity: hov ? 1 : 0,
          transition: reduced ? "none" : "opacity 140ms ease",
          willChange: "opacity",
          pointerEvents: "none",
        }}
      />

      {/* Highlight especular fijo — liquid glass */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "8%", left: "18%",
          width: "55%", height: "32%",
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 100%)",
          filter: "blur(2px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Icono: dos capas superpuestas, color neutro y color accent
          El cambio es solo opacity — cero repaint */}
      <span style={{ position: "relative", zIndex: 2, display: "flex" }}>
        {/* Capa neutra (siempre visible cuando no hay hover) */}
        <span style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center",
          color: "rgba(232,232,248,0.95)",
          opacity: hov ? 0 : 1,
          transition: reduced ? "none" : "opacity 140ms ease",
          willChange: "opacity",
        }}>
          {item.icon}
        </span>
        {/* Capa accent (solo visible en hover) */}
        <span style={{
          display: "flex",
          alignItems: "center", justifyContent: "center",
          color: accent,
          opacity: hov ? 1 : 0,
          transition: reduced ? "none" : "opacity 140ms ease",
          willChange: "opacity",
        }}>
          {item.icon}
        </span>
      </span>

      {/* Tooltip */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "calc(100% + 12px)", top: "50%",
          transform: `translateY(-50%) translateX(${hov ? 0 : -6}px)`,
          whiteSpace: "nowrap",
          background: "rgba(8,5,28,0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.14)",
          color: "#e8e8f8",
          fontSize: "0.70rem", fontWeight: 600, letterSpacing: "0.04em",
          padding: "4px 12px", borderRadius: 99,
          pointerEvents: "none",
          opacity: hov ? 1 : 0,
          transition: reduced ? "none" : "opacity 150ms ease, transform 170ms ease",
          willChange: "opacity, transform",
          boxShadow: "0 4px 16px rgba(0,0,0,0.45)",
        }}
      >
        {item.label}
      </span>
    </Link>
  );
});

export default function FanMenu({ items, logoSrc = "/favicon.ico" }: FanMenuProps) {
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  const btnRef  = useRef<HTMLButtonElement>(null);

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
  const smooth = "cubic-bezier(0.25,0.46,0.45,0.94)";

  const menu = (
    <div style={{ position: "fixed", inset: 0, zIndex: 99999, pointerEvents: "none" }}>

      {/* Backdrop — blur estático, solo opacity anima */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(4,4,18,0.50)",
          backdropFilter: "blur(10px) saturate(140%)",
          WebkitBackdropFilter: "blur(10px) saturate(140%)",
          opacity: open ? 1 : 0,
          transition: reduced ? "none" : `opacity 300ms ${smooth}`,
          willChange: "opacity",
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Anchor bottom-left */}
      <div
        role="navigation"
        aria-label="Menú principal"
        style={{ position: "absolute", bottom: 24, left: 24, width: T_SIZE, height: T_SIZE, pointerEvents: "auto" }}
      >
        {/* Arc ring decorativo */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: T_SIZE / 2, left: T_SIZE / 2,
            width: R * 2, height: R * 2,
            marginLeft: -R, marginBottom: -R,
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.08)",
            pointerEvents: "none",
            opacity: open ? 1 : 0,
            transform: open ? "scale(1)" : "scale(0.5)",
            transition: reduced ? "none" : `opacity 380ms ${smooth}, transform 460ms ${spring}`,
            willChange: "transform, opacity",
          }}
        />

        {/* Ítems */}
        {items.map((item, i) => {
          const { x, y } = arcPos(i, items.length);
          const oDelay = reduced ? 0 : i * 55;
          const cDelay = reduced ? 0 : (items.length - 1 - i) * 30;
          return (
            <FanItem
              key={item.href}
              item={item}
              x={x} y={y}
              open={open}
              oDelay={oDelay}
              cDelay={cDelay}
              reduced={reduced}
            />
          );
        })}

        {/* Botón trigger */}
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
            cursor: "pointer", padding: 0, overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.13)",
            backdropFilter: "blur(32px) saturate(200%)",
            WebkitBackdropFilter: "blur(32px) saturate(200%)",
            border: "1.5px solid rgba(255,255,255,0.28)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.40), inset 0 1px 0 rgba(255,255,255,0.25)",
            transform: open ? "rotate(135deg) scale(1.06)" : "rotate(0deg) scale(1)",
            transition: reduced ? "none" : `transform 480ms ${spring}`,
            willChange: "transform",
          }}
        >
          {/* Highlight especular */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "6%", left: "15%",
              width: "60%", height: "35%",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0) 100%)",
              filter: "blur(3px)",
              pointerEvents: "none",
              zIndex: 2,
              transform: open ? "rotate(-135deg)" : "rotate(0deg)",
              transition: reduced ? "none" : `transform 480ms ${spring}`,
              willChange: "transform",
            }}
          />

          {/* Pulse ring */}
          <span
            aria-hidden="true"
            style={{
              position: "absolute", inset: -10, borderRadius: "50%",
              border: "1.5px solid rgba(79,209,197,0.28)",
              opacity: open ? 0 : 1,
              animation: reduced || open ? "none" : "fanRingPulse 3s ease-in-out infinite",
              transition: "opacity 200ms ease",
              pointerEvents: "none",
            }}
          />

          <Image
            src={logoSrc} alt="" width={T_SIZE} height={T_SIZE}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              borderRadius: "50%", pointerEvents: "none",
              userSelect: "none", display: "block",
              transform: open ? "rotate(-135deg)" : "rotate(0deg)",
              transition: reduced ? "none" : `transform 480ms ${spring}`,
              willChange: "transform",
              position: "relative", zIndex: 1,
            }}
            draggable={false} priority
          />
        </button>

        <style>{`
          @keyframes fanRingPulse {
            0%,100% { opacity:.28; transform:scale(1); }
            50%      { opacity:.9;  transform:scale(1.22); }
          }
          [data-next-themes-indicator],#__next-themes-indicator,nextjs-portal{display:none!important}
        `}</style>
      </div>
    </div>
  );

  return mounted ? createPortal(menu, document.body) : null;
}
