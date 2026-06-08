"use client";

import { useEffect, useState } from "react";
import { Sorteo, getSorteos, createSorteo, CreateSorteoDto, Service, getServices } from "@/lib/api";
import { Gift, Calendar, Plus, Trophy } from "lucide-react";

export default function SorteosClient({ businessId }: { businessId: number }) {
  const [sorteos, setSorteos] = useState<Sorteo[]>([]);
  const [servicios, setServicios] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm: CreateSorteoDto = {
    businessId,
    nombre: "",
    fechaInicio: "",
    fechaFin: "",
    minReservasPrevias: 0,
    minGastoPrevio: 0,
    condicionReservasDurante: 1,
    serviciosValidosId: "",
    premioServicioId: 0,
    premioDescuento: 100,
    cantidadGanadores: 1,
  };
  const [form, setForm] = useState<CreateSorteoDto>(emptyForm);

  useEffect(() => {
    fetchData();
  }, [businessId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sorteosData, serviciosData] = await Promise.all([
        getSorteos(businessId),
        getServices(businessId)
      ]);
      setSorteos(sorteosData);
      setServicios(serviciosData);
      if (serviciosData.length > 0) {
        setForm(prev => ({ ...prev, premioServicioId: serviciosData[0].id }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await createSorteo(form);
      setSuccess("Sorteo creado exitosamente.");
      setShowModal(false);
      setForm({ ...emptyForm, premioServicioId: servicios[0]?.id || 0 });
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-stack">Cargando sorteos...</div>;

  return (
    <div className="page-stack">
      <div className="page-hero">
        <h1 className="flex items-center gap-2"><Gift size={32} /> Sorteos</h1>
        <p>Incentiva a tus clientes creando sorteos con premios y descuentos.</p>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="flex" style={{ justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button className="primary-btn flex items-center gap-2" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Crear Sorteo
        </button>
      </div>

      <div className="section-card">
        <h2>Tus Sorteos Activos e Históricos</h2>
        {sorteos.length === 0 ? (
          <p>No tienes sorteos creados aún.</p>
        ) : (
          <div className="data-table" style={{ marginTop: "1rem" }}>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fechas</th>
                  <th>Premio</th>
                  <th>Ganadores</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {sorteos.map((s) => (
                  <tr key={s.id}>
                    <td>{s.nombre}</td>
                    <td>{s.fechaInicio} a {s.fechaFin}</td>
                    <td>{s.servicioPremio?.nombre} ({s.premioDescuento}% desc.)</td>
                    <td>{s.cantidadGanadores}</td>
                    <td>
                      <span className="badge" style={{ backgroundColor: s.estado === 'activo' ? '#2dd4bf' : '#a78bfa', color: '#18181b' }}>
                        {s.estado.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxHeight: "90vh", overflowY: "auto" }}>
            <h2 className="flex items-center gap-2 mb-4"><Trophy size={24} /> Nuevo Sorteo</h2>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="form-grid">
                <div>
                  <label>Nombre del Sorteo</label>
                  <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Sorteo de Primavera" />
                </div>
                <div>
                  <label>Cantidad de Ganadores</label>
                  <input className="input" type="number" min="1" required value={form.cantidadGanadores} onChange={e => setForm({ ...form, cantidadGanadores: +e.target.value })} />
                </div>
                <div>
                  <label>Fecha de Inicio</label>
                  <input className="input" type="date" required min={new Date().toISOString().split('T')[0]} value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} />
                </div>
                <div>
                  <label>Fecha de Fin</label>
                  <input className="input" type="date" required min={form.fechaInicio ? new Date(new Date(form.fechaInicio).getTime() + 86400000).toISOString().split('T')[0] : new Date(Date.now() + 86400000).toISOString().split('T')[0]} value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })} />
                </div>
              </div>

              <h3>Elegibilidad (Historia)</h3>
              <div className="form-grid">
                <div>
                  <label>Mínimo de Reservas Previas</label>
                  <input className="input" type="number" min="0" value={form.minReservasPrevias} onChange={e => setForm({ ...form, minReservasPrevias: +e.target.value })} />
                </div>
                <div>
                  <label>Mínimo Gasto Previo ($)</label>
                  <input className="input" type="number" min="0" value={form.minGastoPrevio} onChange={e => setForm({ ...form, minGastoPrevio: +e.target.value })} />
                </div>
              </div>

              <h3>Condiciones para Participar (Durante el sorteo)</h3>
              <div className="form-grid">
                <div>
                  <label>Reservas requeridas en este periodo</label>
                  <input className="input" type="number" min="1" required value={form.condicionReservasDurante} onChange={e => setForm({ ...form, condicionReservasDurante: +e.target.value })} />
                </div>
              </div>

              <h3>El Premio</h3>
              <div className="form-grid">
                <div>
                  <label>Servicio a Regalar/Descontar</label>
                  <select className="input" required value={form.premioServicioId} onChange={e => setForm({ ...form, premioServicioId: +e.target.value })}>
                    {servicios.map(srv => (
                      <option key={srv.id} value={srv.id}>{srv.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>% de Descuento (1-100)</label>
                  <input className="input" type="number" min="1" max="100" required value={form.premioDescuento} onChange={e => setForm({ ...form, premioDescuento: +e.target.value })} />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="secondary-btn" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="primary-btn" disabled={saving || servicios.length === 0}>
                  {saving ? "Creando..." : "Crear Sorteo"}
                </button>
              </div>
              {servicios.length === 0 && <p style={{ color: "#f87171", fontSize: "0.875rem" }}>Necesitas crear servicios primero.</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
