import { cookies } from "next/headers";
import { getBusinesses } from "@/lib/api";
import ClienteDescubrirClient from "./ClienteDescubrirClient";

import type { Business } from "@/lib/api";

export default async function ClienteDescubrirPage() {
  let businesses: Business[] = [];
  try {
    businesses = await getBusinesses();
  } catch {}

  return <ClienteDescubrirClient businesses={businesses} />;
}
