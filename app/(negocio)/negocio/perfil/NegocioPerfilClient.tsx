"use client";
import { useState } from "react";
import type { Business } from "@/lib/api";
import { submitProfileChange } from "@/lib/api";

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
  const [form, setForm] = useState({
    Nombre: business?.Nombre || "",
    Localicacion: business?.Localicacion || "",
    Telefono: business?.Telefono || "",
    descripcion: (business as any)?.descripcion || "",
    tipoNegocio: (business as any)?.tipoNegocio || "",
    bannerUrl: (business as any)?.bannerUrl || "",
    fotoUrl: (business as any)?.fotoUrl || "",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSuccess("");
    try {
      await submitProfileChange(businessId, form);
      setSuccess("Solicitud enviada. Un administrador revisará los cambios antes de publicarlos.");
    } catch (err: any) {
      setError(err.message || "No se pudo enviar la solicitud.");
    } finally { setSaving(false); }
  }

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Perfil del negocio</h2>
          <p>Los cambios serán revisados por un administrador antes de hacerse visibles para los clientes.</p>
        </div>
      </section>

      {/* Vista previa del banner */}
      <section className="section-card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{
          height: 160,
          background: form.bannerUrl ? `url(${form.bannerUrl}) center/cover no-repeat` : "linear-gradient(135deg, var(--accent) 0%, var(--accent-2, #0f3638) 100%)",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
        }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />
          <div style={{ position: "relative", zIndex: 1, padding: "16px 24px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: form.fotoUrl ? `url(${form.fotoUrl}) center/cover no-repeat` : "var(--surface-2)",
              border: "3px solid rgba(255,255,255,0.7)",
              flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28,
            }}>{!form.fotoUrl && "🏢"}</div>
            <div>
              <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "var(--text-lg)", textShadow: "0 1px 4px rgba(0,0,0,0.5)" }}>{form.Nombre || "Nombre del negocio"}</h3>
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "var(--text-sm)" }}>{form.Localicacion || "Dirección"}</p>
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 24px", borderTop: "1px solid var(--border)", background: "var(--surface)", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
          Vista previa de cómo verán tu negocio los clientes
        </div>
      </section>

      {success && <div className="message-success">{success}</div>}
      {error && <div className="message-error">{error}</div>}

      <section className="section-card">
        <form onSubmit={handleSubmit} className="page-stack" style={{ gap: 20 }}>
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
          <div className="form-grid">
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>URL de foto de perfil</label>
              <input className="input" value={form.fotoUrl} onChange={(e) => setForm({ ...form, fotoUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>URL del banner</label>
              <input className="input" value={form.bannerUrl} onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="primary-btn" type="submit" disabled={saving} style={{ minWidth: 200 }}>
              {saving ? "Enviando solicitud..." : "Enviar cambios para aprobación"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
