"use client";
import { useState } from "react";
import type { ProfileChangeRequest } from "@/lib/api";
import { approveProfileChange, rejectProfileChange } from "@/lib/api";

/** Detecta si una cadena es una URL que apunta a una imagen */
function isImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const clean = value.split("?")[0].toLowerCase();
  return (
    clean.startsWith("http") &&
    (clean.endsWith(".jpg") ||
      clean.endsWith(".jpeg") ||
      clean.endsWith(".png") ||
      clean.endsWith(".gif") ||
      clean.endsWith(".webp") ||
      clean.endsWith(".svg") ||
      clean.includes("/image") ||
      clean.includes("/img") ||
      clean.includes("/foto") ||
      clean.includes("/logo") ||
      clean.includes("/upload"))
  );
}

/** Nombres de campo que son imágenes aunque la URL no lo diga explícitamente */
const IMAGE_KEYS = ["imagen", "foto", "logo", "fotoperfil", "fotoPerfil", "imgUrl", "imageUrl", "avatarUrl", "banner"];

function CampoValor({ campo, valor }: { campo: string; valor: unknown }) {
  const esImagen =
    IMAGE_KEYS.some((k) => campo.toLowerCase().includes(k.toLowerCase())) ||
    isImageUrl(valor);

  return (
    <div
      style={{
        background: "var(--surface-2)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
      }}
    >
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--text-secondary)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: 6,
        }}
      >
        {campo}
      </p>
      {esImagen && typeof valor === "string" && valor ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <img
            src={valor}
            alt={campo}
            style={{
              width: "100%",
              maxHeight: 160,
              objectFit: "contain",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
              background: "var(--surface)",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "block";
            }}
          />
          {/* fallback si la imagen falla */}
          <p
            style={{
              display: "none",
              fontSize: "var(--text-xs)",
              color: "var(--text-secondary)",
              wordBreak: "break-all",
            }}
          >
            {valor}
          </p>
          {/* URL corta debajo de la imagen */}
          <a
            href={valor}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--accent, #01696f)",
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "block",
              maxWidth: "100%",
            }}
            title={valor}
          >
            🔗 Ver imagen original
          </a>
        </div>
      ) : (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text)", wordBreak: "break-word" }}>
          {valor !== undefined && valor !== null && String(valor) !== "" ? (
            String(valor)
          ) : (
            <em style={{ opacity: 0.5 }}>vacío</em>
          )}
        </p>
      )}
    </div>
  );
}

export default function SolicitudesClient({ initialChanges }: { initialChanges: ProfileChangeRequest[] }) {
  const [changes, setChanges] = useState<ProfileChangeRequest[]>(initialChanges);
  const [loading, setLoading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function approve(id: number) {
    setLoading(id); setError("");
    try {
      await approveProfileChange(id);
      setChanges((prev) => prev.filter((c) => c.id !== id));
      setSuccess("Cambio aprobado y aplicado.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("No se pudo aprobar el cambio."); }
    finally { setLoading(null); }
  }

  async function reject(id: number) {
    setLoading(id); setError("");
    try {
      await rejectProfileChange(id);
      setChanges((prev) => prev.filter((c) => c.id !== id));
      setSuccess("Solicitud rechazada.");
      setTimeout(() => setSuccess(""), 3000);
    } catch { setError("No se pudo rechazar el cambio."); }
    finally { setLoading(null); }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Solicitudes de cambio de perfil</h2>
          <p>Revisa y aprueba los cambios de perfil enviados por los negocios.</p>
        </div>
        <span
          style={{
            background: changes.length > 0 ? "var(--accent)" : "var(--surface-2)",
            color: changes.length > 0 ? "#fff" : "var(--text-secondary)",
            padding: "4px 12px",
            borderRadius: "var(--radius-full)",
            fontSize: "var(--text-sm)",
            fontWeight: 700,
          }}
        >
          {changes.length} pendientes
        </span>
      </section>

      {success && <div className="message-success">{success}</div>}
      {error && <div className="message-error">{error}</div>}

      {changes.length === 0 ? (
        <section className="section-card" style={{ textAlign: "center", padding: "64px 24px" }}>
          <p style={{ fontSize: "2rem", marginBottom: 12 }}>✅</p>
          <h3>No hay solicitudes pendientes</h3>
          <p style={{ color: "var(--text-secondary)" }}>Todas las solicitudes han sido gestionadas.</p>
        </section>
      ) : (
        <section className="page-stack">
          {changes.map((c) => (
            <div key={c.id} className="section-card">
              <div className="panel-title-row" style={{ marginBottom: 16 }}>
                <h3 className="panel-title">
                  {c.businessId != null ? `Negocio #${c.businessId}` : "Solicitud de registro"} — Solicitud #{c.id}
                </h3>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                  {c.createdAt
                    ? new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date(c.createdAt))
                    : ""}
                </span>
              </div>

              <div className="form-grid" style={{ gap: 12, marginBottom: 16 }}>
                {c.businessId == null ? (
                  // Solicitud de registro — campos ordenados, sin contraseña
                  <>
                    <CampoValor campo="Nombre" valor={c.cambios?.Nombre} />
                    <CampoValor campo="Correo" valor={c.cambios?.Correo} />
                    <CampoValor campo="Teléfono" valor={c.cambios?.Telefono} />
                    <CampoValor campo="Localización" valor={c.cambios?.Localicacion} />
                    {Object.entries(c.cambios || {})
                      .filter(([k]) => !["Nombre", "Correo", "Telefono", "Localicacion", "password"].includes(k))
                      .map(([key, value]) => (
                        <CampoValor key={key} campo={key} valor={value} />
                      ))}
                  </>
                ) : (
                  // Cambio de perfil de negocio existente
                  Object.entries(c.cambios || {}).map(([key, value]) => (
                    <CampoValor key={key} campo={key} valor={value} />
                  ))
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="primary-btn" onClick={() => approve(c.id)} disabled={loading === c.id}>
                  {loading === c.id ? "Procesando..." : "✓ Aprobar"}
                </button>
                <button className="danger-btn" onClick={() => reject(c.id)} disabled={loading === c.id}>
                  ✕ Rechazar
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
