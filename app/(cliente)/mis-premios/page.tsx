import { getCustomerSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import MisPremiosClient from "./MisPremiosClient";

export default async function MisPremiosPage() {
  const customerId = await getCustomerSession();

  if (!customerId) {
    redirect("/login");
  }

  return <MisPremiosClient customerId={customerId} />;
}
