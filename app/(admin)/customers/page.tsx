import { getCustomers } from "@/lib/api";
import CustomersClient from "./CustomersClient";
import ErrorView from "@/components/ErrorView";

export default async function CustomersPage() {
  try {
    const customers = await getCustomers();
    return <CustomersClient initialCustomers={customers} />;
  } catch (error) {
    console.error("Error loading customers:", error);
    return <ErrorView />;
  }
}