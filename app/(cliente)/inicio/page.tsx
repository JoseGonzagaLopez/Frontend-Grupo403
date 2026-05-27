import InicioClient from "./InicioClient";
import { getCustomerSession } from "@/lib/actions";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Inicio — BookFlow",
  description: "Panel de inicio del cliente en BookFlow.",
};

export default async function ClienteInicioPage() {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/login");

  return <InicioClient customerId={customerId} />;
}
