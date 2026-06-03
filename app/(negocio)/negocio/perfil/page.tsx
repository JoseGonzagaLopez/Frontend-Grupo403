import { getBusinessSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import { getBusinesses } from "@/lib/api";
import NegocioPerfilClient from "./NegocioPerfilClient";

export default async function NegocioPerfilPage() {
  const businessId = await getBusinessSession();
  if (!businessId) redirect("/login");
  const businesses = await getBusinesses();
  const business = businesses.find((b) => b.id === businessId) || null;
  return <NegocioPerfilClient business={business} businessId={businessId} />;
}
