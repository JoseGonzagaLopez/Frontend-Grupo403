import { getBusinessSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import SorteosClient from "./SorteosClient";

export default async function NegocioSorteosPage() {
  const businessId = await getBusinessSession();

  if (!businessId) {
    redirect("/login");
  }

  return <SorteosClient businessId={businessId} />;
}
