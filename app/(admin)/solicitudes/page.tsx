import { getPendingProfileChanges } from "@/lib/api";
import SolicitudesClient from "./SolicitudesClient";

import type { ProfileChangeRequest } from "@/lib/api";

export default async function SolicitudesPage() {
  let changes: ProfileChangeRequest[] = [];
  try { changes = await getPendingProfileChanges(); } catch {}
  return <SolicitudesClient initialChanges={changes} />;
}
