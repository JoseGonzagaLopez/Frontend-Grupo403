import { getBusinessSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import DisponibilidadClient from "./DisponibilidadClient";

export default async function DisponibilidadPage() {
  const businessId = await getBusinessSession();
  if (!businessId) redirect("/login");
  return <DisponibilidadClient businessId={businessId} />;
}
