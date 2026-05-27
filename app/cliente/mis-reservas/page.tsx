import { cookies } from "next/headers";
import { getAppointments, getResenas } from "@/lib/api";
import MisReservasClient from "./MisReservasClient";
import type { Booking, Resena } from "@/lib/api";

export default async function MisReservasPage() {
  const cookieStore = await cookies();
  const customerRaw = cookieStore.get("loggedCustomer")?.value;
  const customer = customerRaw ? JSON.parse(customerRaw) : null;

  let allAppointments: Booking[] = [];
  let resenas: Resena[] = [];

  try {
    allAppointments = await getAppointments();
  } catch {}

  try {
    resenas = await getResenas();
  } catch {}

  const myAppointments = customer
    ? allAppointments.filter((a) => a.customerId === customer.id)
    : [];

  // Mapa appointmentId -> reseña
  const resenasByAppointment: Record<number, Resena> = {};
  resenas.forEach((r) => {
    if (r.appointmentId != null) resenasByAppointment[r.appointmentId] = r;
  });

  return (
    <MisReservasClient
      appointments={myAppointments}
      customer={customer}
      resenasByAppointment={resenasByAppointment}
    />
  );
}
