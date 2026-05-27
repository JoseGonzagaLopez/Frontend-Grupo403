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

// Arc geometry: sweeps from ARC0° to ARC1° (measured from +X axis, going counter-clockwise)
const R      = 115;  // radius px
const ARC0   =   5;  // start angle (near horizontal right)
const ARC1   =  88;  // end angle (near vertical up)
const T_SIZE =  58;  // trigger diameter px
const I_SIZE =  48;  // item diameter px

function arcPos(idx: number, total: number) {
  const a = total === 1
    ? (ARC0 + ARC1) / 2
    : ARC0 + (idx * (ARC1 - ARC0)) / (total - 1);
  const rad = (a * Math.PI) / 180;
  return { x: Math.cos(rad) * R, y: -Math.sin(rad) * R }; // CSS y grows down
}

export default function FanMenu({ items, logoSrc = "/favicon.ico" }: FanMenuProps) {
  const [open, setOpen]   = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  const btnRef  = useRef<HTMLButtonElement>(null);

  // Mount guard for createPortal (SSR safe)
  useEffect(() => { setMounted(true); }, []);

  // Close on Escape
  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") { setOpen(false); btnRef.current?.focus(); }
  }, []);
  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const spring = "cubic-bezier(0.34,1.56,0.64,1)";
  const ease   = "cubic-bezier(0.16,1,0.30,1)";

  const menu = (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,          // always on top of everything
        pointerEvents: "none",  // root never blocks — only children do
      }}
    >
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        style={{
          position: "absolute", inset: 0,
          background: open ? "rgba(4,4,18,0.52)" : "transparent",
          backdropFilter: open ? "blur(7px) saturate(140%)" : "none",
          WebkitBackdropFilter: open ? "blur(7px) saturate(140%)" : "none",
          transition: reduced ? "none" : `background 280ms ${ease}, backdrop-filter 280ms ${ease}`,
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* ── Menu root — anchored top-left ── */}
      <div
        role="navigation"
        aria-label="Menú principal"
        style={{
          position: "absolute",
          top: 18, left: 18,
          width: T_SIZE, height: T_SIZE,
          pointerEvents: "auto",  // this subtree is always interactive
        }}
      >
        {/* Dashed arc guide */}
        {open && (
          <svg
            aria-hidden="true"
            width={R * 2 + I_SIZE + 10}
            height={R * 2 + I_SIZE + 10}
            style={{
              position: "absolute",
              top:  T_SIZE / 2 - (R + I_SIZE / 2 + 5),
              left: T_SIZE / 2 - (R + I_SIZE / 2 + 5),
              pointerEvents: "none",
              opacity: 0.15,
              animation: reduced ? "none" : `fanFadeIn 250ms ${ease} both`,
            }}
          >
            <circle
              cx={R + I_SIZE / 2 + 5}
              cy={R + I_SIZE / 2 + 5}
              r={R}
              fill="none"
              stroke="#4fd1c5"
              strokeWidth="1"
              strokeDasharray="3 7"
            />
          </svg>
        )}

        {/* ── Fan items ── */}
        {items.map((item, i) => {
          const { x, y } = arcPos(i, items.length);
          const isHover  = hover === i;
          const accent   = item.color ?? "#4fd1c5";
          const openDelay  = reduced ? 0 : i * 52;
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
                zIndex: 1,
                display: "flex", alignItems: "center", justifyContent: "center",
                textDecoration: "none",
                cursor: open ? "pointer" : "default",
                color: isHover ? accent : "rgba(232,232,248,0.90)",
                fontSize: 20,
                background: isHover ? `${accent}28` : "rgba(255,255,255,0.08)",
                backdropFilter: "blur(22px) saturate(180%)",
                WebkitBackdropFilter: "blur(22px) saturate(180%)",
                border: isHover
                  ? `1.5px solid ${accent}66`
                  : "1px solid rgba(255,255,255,0.18)",
                boxShadow: isHover
                  ? `0 0 0 6px ${accent}18, 0 8px 28px rgba(0,0,0,0.55)`
                  : "0 4px 18px rgba(0,0,0,0.50)",
                opacity: open ? 1 : 0,
                transform: open
                  ? `translate(${x}px,${y}px) scale(${isHover ? 1.16 : 1})`
                  : "translate(0,0) scale(0.2)",
                transition: reduced ? "none" : open
                  ? `opacity 360ms ${spring} ${openDelay}ms,
                     transform 400ms ${spring} ${openDelay}ms,
                     background 150ms ${ease}, border-color 150ms ${ease},
                     box-shadow 150ms ${ease}, color 150ms ${ease}`
                  : `opacity 200ms ${ease} ${closeDelay}ms,
                     transform 220ms ${ease} ${closeDelay}ms,
                     background 150ms ${ease}, border-color 150ms ${ease},
                     box-shadow 150ms ${ease}, color 150ms ${ease}`,
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
                  transform: `translateY(-50%) scale(${isHover ? 1 : 0.78})`,
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
                  opacity: isHover ? 1 : 0,
                  transition: reduced ? "none"
                    : `opacity 150ms ${ease}, transform 200ms ${spring}`,
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
          ref={btnRef}
          type="button"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen(v => !v)}
          style={{
            position: "relative", zIndex: 2,
            width: T_SIZE, height: T_SIZE,
            borderRadius: "50%",
            cursor: "pointer", padding: 0, overflow: "visible",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: open
              ? "rgba(79,209,197,0.16)"
              : "rgba(255,255,255,0.10)",
            backdropFilter: "blur(28px) saturate(200%)",
            WebkitBackdropFilter: "blur(28px) saturate(200%)",
            border: open
              ? "2px solid rgba(79,209,197,0.60)"
              : "2px solid rgba(255,255,255,0.22)",
            boxShadow: open
              ? "0 0 0 8px rgba(79,209,197,0.10), 0 8px 32px rgba(0,0,0,0.55)"
              : "0 4px 22px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)",
            transform: open
              ? "rotate(12deg) scale(1.07)"
              : "rotate(0deg) scale(1)",
            transition: reduced ? "none"
              : `transform 430ms ${spring}, border-color 240ms ${ease},
                 background 240ms ${ease}, box-shadow 240ms ${ease}`,
          }}
        >
          {/* pulse ring — only when closed */}
          {!open && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute", inset: -9,
                borderRadius: "50%",
                border: "1.5px solid rgba(79,209,197,0.32)",
                animation: reduced ? "none" : "fanRingPulse 2.8s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
          )}

          <Image
            src={logoSrc}
            alt="Buk-A"
            width={T_SIZE}
            height={T_SIZE}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", borderRadius: "50%",
              pointerEvents: "none", userSelect: "none",
              display: "block",
            }}
            draggable={false}
            priority
          />
        </button>

        <style>{`
          @keyframes fanRingPulse {
            0%,100% { opacity:0.40; transform:scale(1);    }
            50%      { opacity:1;   transform:scale(1.20); }
          }
          @keyframes fanFadeIn {
            from { opacity:0; }
            to   { opacity:0.15; }
          }
        `}</style>
      </div>
    </div>
  );

  // Render into document.body via portal to escape any overflow:hidden parent
  return mounted ? createPortal(menu, document.body) : null;
}
