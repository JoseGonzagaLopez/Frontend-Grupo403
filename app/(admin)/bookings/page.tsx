import BookingsClient from "./BookingsClient";
import { getAppointments, getCustomers, getBusinesses } from "@/lib/api";

export default async function BookingsPage() {
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
}