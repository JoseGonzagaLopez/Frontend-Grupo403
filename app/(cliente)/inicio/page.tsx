import InicioClient from "./InicioClient";
import { getCustomerSession } from "@/lib/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Inicio — Buk-A",
  description: "Panel de inicio del cliente en Buk-A.",
};

export default async function ClienteInicioPage() {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/login");

  return <InicioClient customerId={customerId} />;
}
