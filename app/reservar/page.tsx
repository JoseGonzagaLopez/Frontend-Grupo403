import ReservarClient from "./ReservarClient";
import { getBusinesses, getCustomers } from "@/lib/api";

import { getCustomerSession } from "@/lib/actions";

export const metadata = {
  title: "Reservar Cita — BookFlow",
  description: "Reserva tu cita de forma rápida y sencilla con BookFlow.",
};

export default async function ReservarPage() {
  try {
    const customerId = await getCustomerSession();
    
    const [businesses, customers] = await Promise.all([
      getBusinesses(),
      getCustomers(),
    ]);

    const loggedCustomer = customers.find(c => c.id === customerId);

    return (
      <ReservarClient
        initialBusinesses={businesses}
        loggedCustomer={loggedCustomer}
      />
    );
  } catch (error) {
    console.error("Error loading data for reservar:", error);
    return (
      <ReservarClient
        initialBusinesses={[]}
        loggedCustomer={undefined}
        serverError="No se pudo conectar con el servidor. Inténtalo más tarde."
      />
    );
  }
}
