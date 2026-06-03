import { getBusinessSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import NegocioServiciosClient from "./NegocioServiciosClient";

export default async function NegocioServiciosPage() {
  const businessId = await getBusinessSession();
  if (!businessId) redirect("/login");
  return <NegocioServiciosClient businessId={businessId} />;
}
