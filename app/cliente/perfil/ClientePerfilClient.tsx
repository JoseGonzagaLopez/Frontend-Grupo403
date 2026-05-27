"use client";
import { useState } from "react";
import type { Customer } from "@/lib/api";
import { updateCustomer } from "@/lib/api";
import { User, Star, Edit3, Check, X } from "lucide-react";

export default function ClientePerfilClient({ customer }: { customer: Customer | null }) {
  const [form, setForm] = useState({
    Nombre: customer?.Nombre || "",
    Telefono: customer?.Telefono || "",
    Correo: customer?.Correo || "",
    descripcion: "", // Not natively in Customer yet, just UI state for now
    fotoUrl: "",     // Not natively in Customer yet, just UI state for now
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!customer) {
    return (
      <div className="page-stack">
        <section className="page-hero">
          <div>
            <h2>Mi perfil</h2>
            <p>Debes iniciar sesión para ver tu perfil.</p>
          </div>
        </section>
      </div>
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await updateCustomer(customer!.id, {
        Nombre: form.Nombre,
        Telefono: form.Telefono,
        Correo: form.Correo,
      });
      setSuccess("Perfil actualizado correctamente.");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  // Mock de reseñas del usuario (ya que el backend aún no tiene endpoint de reseñas por cliente)
  const misResenas: any[] = [];

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Mi perfil</h2>
          <p>Gestiona tu información personal y tus valoraciones.</p>
        </div>
        {!editing && (
          <button className="primary-btn" onClick={() => setEditing(true)}>
            <Edit3 size={16} style={{ marginRight: 6 }} />
            Editar perfil
          </button>
        )}
      </section>

      {success && <div className="message-success">{success}</div>}
      {error && <div className="message-error">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 24, alignItems: "start" }}>
        
        {/* Tarjeta de perfil (Izquierda) */}
        <section className="section-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 24px" }}>
          <div style={{ position: "relative", marginBottom: 16 }}>
            <div style={{ width: 120, height: 120, borderRadius: "50%", background: "var(--surface-2)", border: "4px solid var(--surface)", boxShadow: "var(--shadow-md)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              {form.fotoUrl ? (
                <img src={form.fotoUrl} alt="Perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <User size={64} style={{ color: "var(--text-secondary)", opacity: 0.5 }} />
              )}
            </div>
            {editing && (
              <label style={{ position: "absolute", bottom: 0, right: 0, background: "var(--accent)", color: "#fff", width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "var(--shadow-sm)" }}>
                <Edit3 size={16} />
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const reader = new FileReader();
                    reader.onload = () => setForm({ ...form, fotoUrl: reader.result as string });
                    reader.readAsDataURL(f);
                  }
                }} />
              </label>
            )}
          </div>
          
          <h3 style={{ fontSize: "var(--text-xl)", fontWeight: 700, margin: "0 0 4px", color: "var(--text)" }}>{form.Nombre || "Usuario"}</h3>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "0 0 16px" }}>{form.Correo}</p>
          
          {!editing ? (
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text)", lineHeight: 1.5, background: "var(--surface-2)", padding: "12px 16px", borderRadius: "var(--radius-lg)", width: "100%" }}>
              {form.descripcion || "Aún no has añadido una descripción. ¡Cuéntanos algo sobre ti!"}
            </p>
          ) : (
            <textarea 
              className="input" 
              placeholder="Escribe algo sobre ti..." 
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              style={{ width: "100%", minHeight: 80, resize: "vertical" }}
            />
          )}
        </section>

        {/* Formulario y Reseñas (Derecha) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          <section className="section-card">
            <h3 className="panel-title" style={{ marginBottom: 16 }}>Datos personales</h3>
            
            <form onSubmit={handleSave} className="form-grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Nombre completo</label>
                <input 
                  className="input" 
                  value={form.Nombre} 
                  onChange={(e) => setForm({ ...form, Nombre: e.target.value })}
                  disabled={!editing}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Correo electrónico</label>
                <input 
                  type="email"
                  className="input" 
                  value={form.Correo} 
                  onChange={(e) => setForm({ ...form, Correo: e.target.value })}
                  disabled={!editing}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, display: "block", marginBottom: 4 }}>Teléfono</label>
                <input 
                  type="tel"
                  className="input" 
                  value={form.Telefono} 
                  onChange={(e) => setForm({ ...form, Telefono: e.target.value })}
                  disabled={!editing}
                />
              </div>

              {editing && (
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
                  <button type="button" className="secondary-btn" onClick={() => {
                    setForm({
                      Nombre: customer.Nombre, Telefono: customer.Telefono, Correo: customer.Correo, descripcion: form.descripcion, fotoUrl: form.fotoUrl
                    });
                    setEditing(false);
                    setError("");
                  }}>
                    <X size={16} style={{ marginRight: 6 }} /> Cancelar
                  </button>
                  <button type="submit" className="primary-btn" disabled={saving}>
                    <Check size={16} style={{ marginRight: 6 }} /> {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              )}
            </form>
          </section>

          <section className="section-card">
            <div className="panel-title-row">
              <h3 className="panel-title">Mis reseñas publicadas</h3>
            </div>
            
            {misResenas.length === 0 ? (
              <div style={{ padding: "32px 0", textAlign: "center", color: "var(--text-secondary)" }}>
                <Star size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} />
                <p style={{ margin: 0, fontWeight: 600 }}>Aún no has dejado ninguna reseña</p>
                <p style={{ margin: "4px 0 0", fontSize: "var(--text-sm)" }}>Cuando valores un negocio tras tu cita, aparecerá aquí.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {misResenas.map((r, i) => (
                  <div key={i} style={{ padding: 16, background: "var(--surface-2)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{r.businessName}</p>
                      <span style={{ color: "#e8a800", fontSize: "var(--text-sm)", letterSpacing: 2 }}>
                        {Array.from({ length: 5 }, (_, idx) => (idx < r.puntuacion ? "★" : "☆")).join("")}
                      </span>
                    </div>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>"{r.comentario}"</p>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
}
