import { cookies } from "next/headers";
import { getAppointments, getBusinesses } from "@/lib/api";
import ClienteInicioClient from "./ClienteInicioClient";
import type { Booking } from "@/lib/api";

export default async function ClienteInicioPage() {
  const cookieStore = await cookies();
  const customerAuthToken = cookieStore.get("customer_auth_token")?.value;
  
  let customer = null;
  if (customerAuthToken) {
    try {
      // Para simular el objeto customer usando el id. Lo ideal sería obtenerlo de la DB.
      // Por simplicidad asumo que el token es el ID (como definimos en actions.ts)
      customer = { id: parseInt(customerAuthToken, 10), Nombre: "Cliente" };
    } catch {}
  }

  const [allAppointments, businesses] = await Promise.all([
    getAppointments().catch(() => [] as Booking[]),
    getBusinesses().catch(() => []),
  ]);

  const myAppointments = customer
    ? allAppointments.filter((a) => a.customerId === customer.id)
    : [];

  // Favoritos dummy (podría sacarse del localStorage o backend, lo pasaremos vacío por ahora y se maneja en client/local)
  const favorites: number[] = [];

  return (
    <ClienteInicioClient 
      appointments={myAppointments} 
      customer={customer} 
      businesses={businesses}
      favorites={favorites}
    />
  );
}
