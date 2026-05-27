import { getAppointments, getResenas, getCustomers } from "@/lib/api";
import MisReservasClient from "./MisReservasClient";
import type { Booking, Resena } from "@/lib/api";
import { getCustomerSession } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function MisReservasPage() {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/cliente/login");

  let customer: { id: number; Nombre: string } | null = null;
  let myAppointments: Booking[] = [];
  let resenasByAppointment: Record<number, Resena> = {};

  try {
    const [customers, allAppointments, resenas] = await Promise.all([
      getCustomers(),
      getAppointments(),
      getResenas(),
    ]);
    const found = customers.find((c) => c.id === customerId);
    if (found) customer = { id: found.id, Nombre: found.Nombre };
    myAppointments = allAppointments.filter((a) => a.customerId === customerId);
    resenas.forEach((r) => {
      if (r.appointmentId != null) resenasByAppointment[r.appointmentId] = r;
    });
  } catch {}

  return (
    <MisReservasClient
      appointments={myAppointments}
      customer={customer}
      resenasByAppointment={resenasByAppointment}
    />
  );
}
