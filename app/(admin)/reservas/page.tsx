import { getAppointments, getCustomers, getBusinesses } from '@/lib/api';
import ReservacionesSimple from './ReservacionesSimple';
import ErrorView from '@/components/ErrorView';

export default async function ReservasPage() {
  try {
    const [appointments, customers, businesses] = await Promise.all([
      getAppointments(),
      getCustomers(),
      getBusinesses(),
    ]);

    return (
      <ReservacionesSimple
        initialBookings={appointments}
        initialCustomers={customers}
        initialBusinesses={businesses}
      />
    );
  } catch (error) {
    console.error("Error loading reservas:", error);
    return <ErrorView />;
  }
}