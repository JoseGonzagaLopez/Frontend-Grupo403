import { getNegocios } from "@/lib/api";
import NegociosClient from "./NegociosClient";

export default async function NegociosPage() {
  const negocios = await getNegocios();

  return <NegociosClient initialNegocios={negocios} />;
}
