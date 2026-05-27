import { cookies } from "next/headers";
import { getCustomers } from "@/lib/api";
import ClientePerfilClient from "./ClientePerfilClient";

export default async function ClientePerfilPage() {
  const cookieStore = await cookies();
  const customerAuthToken = cookieStore.get("customer_auth_token")?.value;
  
  let customer = null;
  if (customerAuthToken) {
    try {
      const customerId = parseInt(customerAuthToken, 10);
      const allCustomers = await getCustomers();
      customer = allCustomers.find((c) => c.id === customerId) || null;
    } catch {}
  }

  return <ClientePerfilClient customer={customer} />;
}
