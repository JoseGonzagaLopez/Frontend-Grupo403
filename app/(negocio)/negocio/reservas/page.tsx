import { getBusinessSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { getAppointments, getBusinesses, getCustomers } from "@/lib/api";
import NegocioReservasClient from "./NegocioReservasClient";

export default async function NegocioReservasPage() {
  const businessId = await getBusinessSession();
  if (!businessId) redirect("/login");
  const [allAppointments, businesses, customers] = await Promise.all([
    getAppointments(),
    getBusinesses(),
    getCustomers(),
  ]);
  const business = businesses.find((b) => b.id === businessId) || null;
  const appointments = allAppointments.filter((a) => a.businessId === businessId);
  const customerNames = customers.reduce((acc, c) => { acc[c.id] = c.Nombre; return acc; }, {} as Record<number, string>);
  
  return <NegocioReservasClient appointments={appointments} business={business} businessId={businessId} customerNames={customerNames} />;
}
