// app/reservas/page.tsx
import { getAppointments } from '@/lib/api';
// Importamos el componente desde su ubicación actual según tu imagen
import BookingsClient from '../bookings/BookingsClient'; 

export default async function ReservasPage() {
  // 1. Obtenemos los datos del backend
  const appointments = await getAppointments();

  return (
    <main className="page-stack">
      <div className="page-hero">
        <div>
          <h2>Gestión de Reservas</h2>
          <p>Listado completo de todas las citas.</p>
        </div>
      </div>

      {/* 2. Pasamos las reservas al componente cliente */}
      <BookingsClient initialBookings={appointments} />
    </main>
  );
}