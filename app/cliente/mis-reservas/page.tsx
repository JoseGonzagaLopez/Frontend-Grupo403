import { cookies } from "next/headers";
import { getAppointments } from "@/lib/api";
import MisReservasClient from "./MisReservasClient";
import type { Booking } from "@/lib/api";

export default async function MisReservasPage() {
  const cookieStore = await cookies();
  const customerRaw = cookieStore.get("loggedCustomer")?.value;
  const customer = customerRaw ? JSON.parse(customerRaw) : null;

  let allAppointments: Booking[] = [];
  try {
    allAppointments = await getAppointments();
  } catch {}

  const myAppointments = customer
    ? allAppointments.filter((a) => a.customerId === customer.id)
    : [];

  return <MisReservasClient appointments={myAppointments} customer={customer} />;
}
