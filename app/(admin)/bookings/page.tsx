import BookingsClient from "./BookingsClient";
import { getAppointments, getCustomers, getBusinesses } from "@/lib/api";
import ErrorView from "@/components/ErrorView";

export default async function BookingsPage() {
  try {
    const [bookings, customers, businesses] = await Promise.all([
      getAppointments(),
      getCustomers(),
      getBusinesses(),
    ]);

    return (
      <BookingsClient 
        initialBookings={bookings} 
        initialCustomers={customers}
        initialBusinesses={businesses}
      />
    );
  } catch (error) {
    console.error("Error loading bookings:", error);
    return <ErrorView />;
  }
}