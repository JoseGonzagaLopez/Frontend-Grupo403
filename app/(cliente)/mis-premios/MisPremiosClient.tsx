"use client";

import { useEffect, useState } from "react";
import { GanadorSorteo, getMisPremios, reclamarPremio, createAppointment, CreateBookingDto } from "@/lib/api";
import { Gift, CalendarCheck, Calendar } from "lucide-react";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { useRouter } from "next/navigation";

export default function MisPremiosClient({ customerId }: { customerId: number }) {
  const [premios, setPremios] = useState<GanadorSorteo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [claimingPremio, setClaimingPremio] = useState<GanadorSorteo | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("10:00");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchPremios();
  }, [customerId]);

  const fetchPremios = async () => {
    try {
      setLoading(true);
      const data = await getMisPremios(customerId);
      setPremios(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimingPremio) return;
    setSaving(true);
    setError("");

    try {
      const servicio = claimingPremio.sorteo?.servicioPremio;
      const negocio = claimingPremio.sorteo?.negocio;
      if (!servicio || !negocio) throw new Error("Datos del premio incompletos");

      // Calculate discounted price
      const discountAmount = (servicio.precio * claimingPremio.sorteo!.premioDescuento) / 100;
      const finalPrice = Math.max(0, servicio.precio - discountAmount);

      const bookingDto: CreateBookingDto = {
        date: bookingDate,
        time: bookingTime,
        status: "pending",
        customerId,
        businessId: negocio.id,
        serviceId: servicio.id,
        importe: finalPrice
      };

      // Create appointment
      await createAppointment(bookingDto);

      // Mark prize as claimed
      await reclamarPremio(claimingPremio.id);

      setSuccess(`¡Premio reclamado exitosamente! Tu reserva para ${servicio.nombre} ha sido confirmada.`);
      setClaimingPremio(null);
      fetchPremios();
      
      // Optional: redirect to appointments
      setTimeout(() => router.push('/mis-reservas'), 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-stack">Cargando tus premios...</div>;

  return (
    <div className="page-stack">
      <div className="page-hero">
        <h1 className="flex items-center gap-2"><Gift size={32} /> Mis Premios</h1>
        <p>¡Felicidades! Aquí puedes ver los premios que has ganado en sorteos y reclamarlos.</p>
      </div>

      {error && <div className="message-error">{error}</div>}
      {success && <div className="message-success">{success}</div>}

      <div className="section-card">
        {premios.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem 0" }}>
            <Gift size={48} style={{ margin: "0 auto", opacity: 0.2 }} />
            <p style={{ marginTop: "1rem", color: "var(--text-dim)" }}>Aún no has ganado ningún premio. ¡Sigue participando!</p>
          </div>
        ) : (
          <div className="customer-grid">
            {premios.map((premio) => {
              const sorteo = premio.sorteo;
              const servicio = sorteo?.servicioPremio;
              return (
                <div key={premio.id} className="customer-card flex flex-col justify-between">
                  <div>
                    <h3 className="flex items-center gap-2" style={{ color: "var(--accent)", marginBottom: "0.5rem" }}>
                      <Gift size={20} /> {sorteo?.nombre}
                    </h3>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                      <strong>Negocio:</strong> {sorteo?.negocio?.Nombre}
                    </p>
                    <p style={{ fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                      <strong>Premio:</strong> {servicio?.nombre} ({sorteo?.premioDescuento}% de descuento)
                    </p>
                    <p style={{ fontSize: "0.875rem", marginBottom: "1rem", color: "var(--text-dim)" }}>
                      Ganado el: {premio.fechaGanado}
                    </p>
                  </div>
                  
                  {premio.premioReclamado ? (
                    <div className="badge flex items-center justify-center gap-1" style={{ backgroundColor: "#2dd4bf", color: "#000", padding: "0.5rem" }}>
                      <CalendarCheck size={16} /> Reclamado
                    </div>
                  ) : (
                    <button 
                      className="primary-btn flex items-center justify-center gap-2"
                      onClick={() => {
                        setClaimingPremio(premio);
                        setBookingDate(new Date().toISOString().split('T')[0]);
                        setSuccess("");
                        setError("");
                      }}
                    >
                      <Calendar size={18} /> Reclamar y Reservar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {claimingPremio && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h2 className="mb-4">Reclamar Premio</h2>
            <p className="mb-4">
              Estás a punto de reclamar tu descuento del <strong>{claimingPremio.sorteo?.premioDescuento}%</strong> para el servicio <strong>{claimingPremio.sorteo?.servicioPremio?.nombre}</strong> en <strong>{claimingPremio.sorteo?.negocio?.Nombre}</strong>.
            </p>
            <p className="mb-6">Elige la fecha y hora para tu cita:</p>
            
            <form onSubmit={handleClaim} className="flex flex-col gap-4">
              <div className="form-grid">
                <div>
                  <label>Fecha</label>
                  <CustomDatePicker
                    value={bookingDate}
                    onChange={(d) => setBookingDate(d)}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label>Hora</label>
                  <input 
                    type="time" 
                    className="input" 
                    required 
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="secondary-btn" onClick={() => setClaimingPremio(null)}>Cancelar</button>
                <button type="submit" className="primary-btn" disabled={saving || !bookingDate || !bookingTime}>
                  {saving ? "Confirmando..." : "Confirmar Reserva"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
