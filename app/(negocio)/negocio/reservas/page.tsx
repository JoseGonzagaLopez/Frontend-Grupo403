import { getBusinessSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { getAppointments, getBusinesses } from "@/lib/api";
import NegocioReservasClient from "./NegocioReservasClient";

export default async function NegocioReservasPage() {
  const businessId = await getBusinessSession();
  if (!businessId) redirect("/login");
  const [allAppointments, businesses] = await Promise.all([
    getAppointments(),
    getBusinesses(),
  ]);
  const business = businesses.find((b) => b.id === businessId) || null;
  const appointments = allAppointments.filter((a) => a.businessId === businessId);
  return <NegocioReservasClient appointments={appointments} business={business} businessId={businessId} />;
}
