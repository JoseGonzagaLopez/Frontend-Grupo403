import { getCustomerSession } from "@/lib/actions";
import { getCustomers } from "@/lib/api";
import { redirect } from "next/navigation";
import ClienteLayoutClient from "./ClienteLayoutClient";

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/login");

  let displayName = "Cliente";
  try {
    const customers = await getCustomers();
    const found = customers.find((c) => c.id === customerId);
    if (found) {
      // Usar username si existe, si no el Nombre
      displayName = found.username || found.Nombre;
    }
  } catch {}

  return <ClienteLayoutClient customerName={displayName}>{children}</ClienteLayoutClient>;
}
