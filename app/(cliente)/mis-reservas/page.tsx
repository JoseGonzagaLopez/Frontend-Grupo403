import MisReservasClient from "./MisReservasClient";
import { getCustomerSession } from "@/lib/actions";
import { redirect } from "next/navigation";

export default async function MisReservasPage() {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/cliente/login");

  return <MisReservasClient customerId={customerId} />;
}
