import ReservarClient from "./ReservarClient";
import { getBusinesses, getCustomers } from "@/lib/api";
import { getCustomerSession } from "@/lib/actions";

export const metadata = {
  title: "Reservar Cita — Buk-A",
  description: "Reserva tu cita de forma rápida y sencilla con Buk-A.",
};

export default async function ReservarPage() {
  let initialBusinesses = [];
  let loggedCustomer = undefined;
  let serverError = undefined;

  try {
    const customerId = await getCustomerSession();
    const [businesses, customers] = await Promise.all([
      getBusinesses(),
      getCustomers(),
    ]);
    initialBusinesses = businesses;
    loggedCustomer = customers.find((c) => c.id === customerId);
  } catch {
    serverError = "No se pudo conectar con el servidor. Inténtalo más tarde.";
  }

  return (
    <ReservarClient
      initialBusinesses={initialBusinesses}
      loggedCustomer={loggedCustomer}
      serverError={serverError}
    />
  );
}
