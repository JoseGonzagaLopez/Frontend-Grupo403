import { getPagos, getCustomers, getBusinesses } from '@/lib/api';
import PaymentsClient from './PaymentsClient';
import ErrorView from '@/components/ErrorView';

export default async function PaymentsPage() {
  try {
    const [pagos, customers, businesses] = await Promise.all([
      getPagos(),
      getCustomers(),
      getBusinesses(),
    ]);

    return <PaymentsClient initialPayments={pagos} initialCustomers={customers} initialBusinesses={businesses} />;
  } catch (error) {
    console.error("Error loading payments:", error);
    return <ErrorView />;
  }
}
