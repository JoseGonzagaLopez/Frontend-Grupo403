"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface FanMenuItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface Props {
  items: FanMenuItem[];
  logoSrc?: string;
}

export default function FanMenu({ items, logoSrc = "/favicon.ico" }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Cerrar al navegar
  useEffect(() => { setOpen(false); }, [pathname]);

  // Abanico: ángulos de 30° a 150° (zona inferior-derecha desde la esquina)
  const START_ANGLE = 30;
  const END_ANGLE = 150;
  const RADIUS = 90;

  function getPos(index: number) {
    const angle = items.length === 1
      ? 90
      : START_ANGLE + (index * (END_ANGLE - START_ANGLE)) / (items.length - 1);
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * RADIUS,
      y: Math.sin(rad) * RADIUS,
    };
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            zIndex: 998,
            animation: "fadeIn 200ms ease both",
          }}
        />
      )}

      {/* Contenedor del menú */}
      <div
        ref={containerRef}
        style={{ position: "relative", width: 44, height: 44, zIndex: 999 }}
      >
        {/* Ítems del abanico */}
        {items.map((item, i) => {
          const { x, y } = getPos(i);
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.href}
              aria-label={item.label}
              title={item.label}
              onClick={() => { setOpen(false); router.push(item.href); }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 52,
                height: 52,
                borderRadius: "50%",
                border: `1px solid ${isActive ? "var(--teal-glow)" : "rgba(255,255,255,0.20)"}`,
                background: isActive
                  ? "linear-gradient(135deg, rgba(45,27,142,0.7), rgba(79,209,197,0.3))"
                  : "rgba(255,255,255,0.10)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                boxShadow: isActive
                  ? `0 0 18px var(--teal-glow), 0 4px 20px rgba(0,0,0,0.4)`
                  : "0 4px 20px rgba(0,0,0,0.35)",
                color: isActive ? "var(--teal)" : "var(--text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                // Animación: desde el centro → posición en abanico
                transform: open
                  ? `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(1)`
                  : "translate(-50%, -50%) scale(0.4)",
                opacity: open ? 1 : 0,
                pointerEvents: open ? "auto" : "none",
                transition: open
                  ? `transform 350ms cubic-bezier(0.34,1.56,0.64,1) ${i * 55}ms, opacity 200ms ease ${i * 55}ms, box-shadow 200ms ease`
                  : `transform 200ms cubic-bezier(0.25,0.46,0.45,0.94), opacity 150ms ease`,
                zIndex: 999,
              }}
            >
              {item.icon}
            </button>
          );
        })}

        {/* Botón logo principal */}
        <button
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          onClick={() => setOpen((v) => !v)}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: 44,
            height: 44,
            borderRadius: "50%",
            border: open
              ? "2px solid var(--teal)"
              : "2px solid var(--border-glow)",
            background: "var(--surface)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: open
              ? `0 0 20px var(--teal-glow), 0 4px 24px rgba(0,0,0,0.5)`
              : "0 4px 16px rgba(0,0,0,0.45)",
            padding: 2,
            cursor: "pointer",
            overflow: "hidden",
            transition: "all 350ms cubic-bezier(0.34,1.56,0.64,1)",
            transform: open ? "rotate(15deg) scale(1.08)" : "rotate(0deg) scale(1)",
            zIndex: 1000,
          }}
        >
          <img
            src={logoSrc}
            alt="Buk-A"
            style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", display: "block" }}
          />
        </button>
      </div>
    </>
  );
}
