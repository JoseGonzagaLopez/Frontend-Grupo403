// app/reservas/page.tsx
import { getAppointments, getCustomers, getBusinesses } from '@/lib/api';
// Importamos el componente desde su ubicación actual según tu imagen
import BookingsClient from '../bookings/BookingsClient';

export default async function ReservasPage() {
  // 1. Obtenemos los datos del backend
  const [appointments, customers, businesses] = await Promise.all([
    getAppointments(),
    getCustomers(),
    getBusinesses(),
  ]);

  return (
    <main className="page-stack">
      <div className="page-hero">
        <div>
          <h2>Gestión de Reservas</h2>
          <p>Listado completo de todas las citas.</p>
        </div>
      </div>

      {/* 2. Pasamos las reservas al componente cliente */}
      <BookingsClient
        initialBookings={appointments}
        initialCustomers={customers}
        initialBusinesses={businesses}
      />
    </main>
  );
}