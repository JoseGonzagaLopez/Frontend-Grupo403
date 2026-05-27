import { getBusinessSession } from "@/lib/actions";
import { redirect } from "next/navigation";
import NegocioResenasClient from "./NegocioResenasClient";
import { getResenas } from "@/lib/api";

export default async function NegocioResenasPage() {
  const businessId = await getBusinessSession();
  if (!businessId) redirect("/login");
  let resenas: import("@/lib/api").Resena[] = [];
  try { resenas = await getResenas(businessId); } catch {}
  return <NegocioResenasClient resenas={resenas} />;
}
