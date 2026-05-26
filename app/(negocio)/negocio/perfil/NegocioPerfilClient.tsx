"use client";
import { useState, useRef, useCallback } from "react";
import type { Business } from "@/lib/api";
import { updateBusiness } from "@/lib/api";

const TIPO_NEGOCIO_OPTIONS = [
  "Peluquería", "Barbería", "Centro de estética", "Clínica dental", "Consulta médica",
  "Fisioterapia", "Gimnasio", "Spa & Bienestar", "Restaurante", "Cafetería",
  "Taller mecánico", "Asesoría", "Otro",
];

export default function NegocioPerfilClient({
  business,
  businessId,
}: {
  business: Business | null;
  businessId: number;
}) {
  const b = business as any;
  const [form, setForm] = useState({
    Nombre: b?.Nombre || "",
    Localicacion: b?.Localicacion || "",
    Telefono: b?.Telefono || "",
    descripcion: b?.descripcion || "",
    tipoNegocio: b?.tipoNegocio || "",
    bannerUrl: b?.bannerUrl || "",
    fotoUrl: b?.fotoUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Convierte archivo a base64 data URL para preview y almacenamiento
  function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleFotoFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Solo se aceptan imágenes.");
      return;
    }
    try {
      const dataUrl = await fileToDataUrl(file);
      setForm((prev) => ({ ...prev, fotoUrl: dataUrl }));
      setError("");
    } catch {
      setError("No se pudo cargar la imagen.");
    }
  }, []);

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFotoFile(file);
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await updateBusiness(businessId, form as any);
      setSuccess("Perfil actualizado correctamente.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Perfil del negocio</h2>
          <p>Edita la información de tu negocio. Los cambios se guardan de inmediato.</p>
        </div>
      </section>

      {/* Vista previa */}
      <section className="section-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          height: 160,
          background: form.bannerUrl
            ? `url(${form.bannerUrl.startsWith("data:") ? form.bannerUrl : form.bannerUrl}) center/cover no-repeat`
            : "linear-gradient(135deg, var(--accent) 0%, var(--accent-2, #0f3638) 100%)",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
          <div style={{ position: "relative", zIndex: 1, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid rgba(255,255,255,0.7)",
              flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
              background: "var(--surface-2)",
            }}>
              {form.fotoUrl
                ? <img src={form.fotoUrl} alt="Foto perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span>🏢</span>
              }
            </div>
            <div>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "var(--text-lg)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>
                {form.Nombre || "Nombre del negocio"}
              </h3>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "var(--text-sm)" }}>
                {form.Localicacion || "Dirección"}
              </p>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 24px", borderTop: "1px solid var(--border)", background: "var(--surface)", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
          Vista previa — así verán tu negocio los clientes
        </div>
      </section>

      {success && <div className="message-success">{success}</div>}
      {error && <div className="message-error">{error}</div>}

      <section className="section-card">
        <form onSubmit={handleSubmit} className="page-stack" style={{ gap: 20 }}>

          {/* Campos de texto */}
          <div className="form-grid">
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Nombre del negocio *</label>
              <input className="input" required value={form.Nombre} onChange={(e) => setForm({ ...form, Nombre: e.target.value })} placeholder="Ej. Peluquería Carmen" />
            </div>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Dirección / Calle</label>
              <input className="input" value={form.Localicacion} onChange={(e) => setForm({ ...form, Localicacion: e.target.value })} placeholder="Ej. Calle Mayor 10, Alicante" />
            </div>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Teléfono</label>
              <input className="input" value={form.Telefono} onChange={(e) => setForm({ ...form, Telefono: e.target.value })} placeholder="Ej. 600000000" />
            </div>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Tipo de negocio</label>
              <select className="input" value={form.tipoNegocio} onChange={(e) => setForm({ ...form, tipoNegocio: e.target.value })}>
                <option value="">Selecciona una categoría</option>
                {TIPO_NEGOCIO_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Descripción del negocio</label>
            <textarea
              className="input"
              rows={3}
              style={{ resize: "vertical", minHeight: 80 }}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              placeholder="Describe qué ofreces, tu experiencia, horarios especiales..."
            />
          </div>

          {/* Foto de perfil con drag & drop */}
          <div>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 8 }}>Foto de perfil</label>
            <div
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? "var(--accent)" : "var(--border)"}`,
                borderRadius: 10,
                padding: "24px 16px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "rgba(1,105,111,0.07)" : "var(--surface-2)",
                transition: "all 0.18s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              {form.fotoUrl ? (
                <img
                  src={form.fotoUrl}
                  alt="Preview"
                  style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)" }}
                />
              ) : (
                <div style={{ fontSize: 36 }}>📸</div>
              )}
              <div style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)" }}>
                {form.fotoUrl ? "Arrastra otra imagen o haz clic para cambiarla" : "Arrastra una imagen aquí o haz clic para seleccionarla"}
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-faint)" }}>JPG, PNG, WEBP — máx. 2MB</div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFotoFile(f); }}
              />
            </div>
            {form.fotoUrl && (
              <button
                type="button"
                style={{ marginTop: 8, fontSize: "var(--text-xs)", color: "var(--danger, #c0392b)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                onClick={() => setForm({ ...form, fotoUrl: "" })}
              >
                ✕ Quitar foto
              </button>
            )}
          </div>

          {/* URL Banner */}
          <div>
            <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>URL del banner (opcional)</label>
            <input
              className="input"
              value={form.bannerUrl}
              onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
              placeholder="https://... (imagen de cabecera del perfil)"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="primary-btn" type="submit" disabled={saving} style={{ minWidth: 180 }}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
