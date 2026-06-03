import { getBusinesses } from "@/lib/api";
import NegociosClient from "./NegociosClient";
import ErrorView from "@/components/ErrorView";

export default async function NegociosPage() {
  try {
    const businesses = await getBusinesses();
    return <NegociosClient initialBusinesses={businesses} />;
  } catch (error) {
    console.error("Error loading businesses:", error);
    return <ErrorView />;
  }
}
