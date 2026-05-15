// app/reservas/page.tsx
import { getAppointments, getCustomers, getBusinesses } from '@/lib/api';
import BookingsClient from '../bookings/BookingsClient'; 
import ErrorView from '@/components/ErrorView';

export default async function ReservasPage() {
  try {
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

        <BookingsClient 
          initialBookings={appointments} 
          initialCustomers={customers}
          initialBusinesses={businesses}
        />
      </main>
    );
  } catch (error) {
    console.error("Error loading reservas:", error);
    return <ErrorView />;
  }
}