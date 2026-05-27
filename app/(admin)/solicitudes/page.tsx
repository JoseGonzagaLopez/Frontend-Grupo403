import { getPendingProfileChanges } from "@/lib/api";
import SolicitudesClient from "./SolicitudesClient";

export default async function SolicitudesPage() {
  let changes: any[] = [];
  try { changes = await getPendingProfileChanges(); } catch {}
  return <SolicitudesClient initialChanges={changes} />;
}
