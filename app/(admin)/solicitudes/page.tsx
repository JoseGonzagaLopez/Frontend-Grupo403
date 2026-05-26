import { getAppointments, getBusinesses, getPendingProfileChanges } from "@/lib/api";
import SolicitudesClient from "./SolicitudesClient";

export default async function SolicitudesPage() {
  let changes = [];
  try { changes = await getPendingProfileChanges(); } catch {}
  return <SolicitudesClient initialChanges={changes} />;
}
