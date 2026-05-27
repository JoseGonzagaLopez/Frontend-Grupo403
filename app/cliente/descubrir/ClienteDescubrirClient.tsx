"use client";
import { useState, useEffect } from "react";
import type { Business } from "@/lib/api";
import { Search, MapPin, Star, Filter } from "lucide-react";
import Link from "next/link";

const TIPO_NEGOCIO_OPTIONS = [
  "Todos", "Peluquería", "Barbería", "Centro de estética", "Clínica dental",
  "Consulta médica", "Fisioterapia", "Gimnasio", "Spa & Bienestar",
  "Restaurante", "Cafetería", "Taller mecánico", "Asesoría", "Otro",
];

export default function ClienteDescubrirClient({ businesses }: { businesses: Business[] }) {
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("Todos");
  
  // En un entorno real, favoritos se sincronizaría con la BD
  const [favorites, setFavorites] = useState<number[]>([]);
  
  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("bookflow_favs") || "[]");
      if (Array.isArray(favs)) setFavorites(favs);
    } catch {}
  }, []);

  function toggleFavorite(id: number) {
    let newFavs = [];
    if (favorites.includes(id)) {
      newFavs = favorites.filter(fid => fid !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem("bookflow_favs", JSON.stringify(newFavs));
  }

  const filtered = businesses.filter(b => {
    const matchSearch = b.Nombre.toLowerCase().includes(search.toLowerCase()) || 
                        (b.Localicacion && b.Localicacion.toLowerCase().includes(search.toLowerCase()));
    const matchTipo = filterTipo === "Todos" || b.tipoNegocio === filterTipo;
    return matchSearch && matchTipo;
  });

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Descubrir negocios</h2>
          <p>Encuentra los mejores profesionales y reserva tu cita al instante.</p>
        </div>
      </section>

      {/* Buscador y filtros */}
      <section className="section-card">
        <div className="form-grid" style={{ gap: 16 }}>
          <div style={{ position: "relative" }}>
            <Search size={18} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }} />
            <input 
              className="input" 
              placeholder="Buscar por nombre o ciudad..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Filter size={18} style={{ color: "var(--text-secondary)" }} />
            <select 
              className="input" 
              value={filterTipo} 
              onChange={(e) => setFilterTipo(e.target.value)}
            >
              {TIPO_NEGOCIO_OPTIONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Feed de negocios */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", padding: "64px 20px", textAlign: "center", color: "var(--text-secondary)", background: "var(--surface-2)", borderRadius: "var(--radius-lg)" }}>
            <Search size={48} style={{ margin: "0 auto 16px", opacity: 0.2 }} />
            <p style={{ fontWeight: 600, fontSize: "var(--text-lg)", margin: "0 0 8px" }}>No se encontraron negocios</p>
            <p style={{ margin: 0 }}>Intenta ajustar los filtros de búsqueda.</p>
          </div>
        ) : (
          filtered.map((b) => {
            const isFav = favorites.includes(b.id);
            return (
              <div key={b.id} style={{ 
                borderRadius: "var(--radius-lg)", 
                border: "1px solid var(--border)", 
                overflow: "hidden", 
                background: "var(--surface-2)", 
                transition: "all 0.2s",
                display: "flex",
                flexDirection: "column",
                position: "relative"
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                {/* Botón Favorito */}
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(b.id); }}
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    zIndex: 10,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.3)",
                    border: "none",
                    backdropFilter: "blur(4px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.1)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  <Star size={20} fill={isFav ? "#e8a800" : "none"} color={isFav ? "#e8a800" : "#fff"} />
                </button>

                {/* Banner */}
                <div style={{ height: 120, background: b.bannerUrl ? `url(${b.bannerUrl}) center/cover no-repeat` : "linear-gradient(135deg, var(--accent) 0%, #0f3638 100%)", position: "relative" }}>
                  <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.15)" }} />
                  {b.fotoUrl ? (
                    <img src={b.fotoUrl} alt={b.Nombre} style={{ position: "absolute", bottom: -24, left: 20, width: 64, height: 64, borderRadius: "50%", border: "3px solid var(--surface-2)", objectFit: "cover", zIndex: 5 }} />
                  ) : (
                    <div style={{ position: "absolute", bottom: -24, left: 20, width: 64, height: 64, borderRadius: "50%", border: "3px solid var(--surface-2)", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, zIndex: 5 }}>
                      🏢
                    </div>
                  )}
                </div>
                
                {/* Contenido */}
                <div style={{ padding: "36px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  <h3 style={{ fontWeight: 700, margin: "0 0 4px", fontSize: "var(--text-lg)", color: "var(--text)" }}>{b.Nombre}</h3>
                  {b.tipoNegocio && (
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--accent)", fontWeight: 600, display: "inline-block", marginBottom: 12 }}>
                      {b.tipoNegocio}
                    </span>
                  )}
                  
                  {b.descripcion && (
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: "0 0 16px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {b.descripcion}
                    </p>
                  )}

                  <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                    {b.Localicacion && (
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
                        <MapPin size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span style={{ lineHeight: 1.4 }}>{b.Localicacion}</span>
                      </div>
                    )}
                    
                    <Link href={`/cliente/reservar?businessId=${b.id}`} style={{ textDecoration: "none", width: "100%", marginTop: 8 }}>
                      <button className="primary-btn" style={{ width: "100%", justifyContent: "center" }}>
                        Ver disponibilidad
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
