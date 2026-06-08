"use client";
import type { Resena } from "@/lib/api";

function StarRating({ value }: { value: number }) {
  return (
    <span style={{ color: "#e8a800", fontSize: "var(--text-base)", letterSpacing: 2 }}>
      {Array.from({ length: 5 }, (_, i) => (i < value ? "★" : "☆")).join("")}
    </span>
  );
}

export default function NegocioResenasClient({ resenas }: { resenas: Resena[] }) {
  const avgRating = resenas.length > 0 ? (resenas.reduce((acc, r) => acc + (r.puntuacion || 0), 0) / resenas.length).toFixed(1) : null;

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Reseñas</h2>
          <p>Lo que opinan los clientes sobre tu negocio.</p>
        </div>
        {avgRating && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface-2)", padding: "8px 16px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)" }}>
            <span style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text)" }}>{avgRating}</span>
            <span style={{ color: "#e8a800", fontSize: "var(--text-lg)" }}>★</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>({resenas.length} reseñas)</span>
          </div>
        )}
      </section>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "16px" }}>
        <div style={{
          display: "flex", flexDirection: "column", gap: "6px",
          padding: "18px 20px", background: "var(--surface)",
          border: "1px solid var(--border)", borderLeft: `3px solid #eab308`,
          borderRadius: "12px",
        }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 500, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Total Reseñas
          </span>
          <span style={{ fontSize: "1.6rem", fontWeight: 700, color: "#eab308", lineHeight: 1 }}>
            {resenas.length}
          </span>
        </div>
      </div>

      {resenas.length === 0 ? (
        <section className="section-card" style={{ textAlign: "center", padding: "64px 24px" }}>
          <p style={{ fontSize: "2rem", marginBottom: 12 }}>⭐</p>
          <h3 style={{ color: "var(--text)", marginBottom: 8 }}>Aún no tienes reseñas</h3>
          <p style={{ color: "var(--text-secondary)" }}>Cuando los clientes dejen valoraciones, aparecerán aquí.</p>
        </section>
      ) : (
        <section className="customer-grid">
          {resenas.map((r, i) => (
            <div key={r.id ?? i} className="customer-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <p className="customer-name" style={{ margin: 0 }}>{r.clienteNombre || "Cliente anónimo"}</p>
                {r.fecha && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>{new Intl.DateTimeFormat("es-ES").format(new Date(r.fecha))}</span>}
              </div>
              {r.puntuacion != null && <StarRating value={r.puntuacion} />}
              {r.comentario && <p className="customer-meta" style={{ marginTop: 8, lineHeight: 1.5 }}>"{r.comentario}"</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
