import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCustomerSession } from "@/lib/actions";
import { getCustomers } from "@/lib/api";
import ClienteLayoutClient from "./ClienteLayoutClient";

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const customerId = await getCustomerSession();
  if (!customerId) redirect("/login");

  let customerName = "Cliente";
  try {
    const customers = await getCustomers();
    const found = customers.find((c) => c.id === customerId);
    if (found) customerName = found.Nombre;
  } catch {}

  return <ClienteLayoutClient customerName={customerName}>{children}</ClienteLayoutClient>;
}
