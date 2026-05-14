import { getPagos, getCustomers, getBusinesses } from '@/lib/api';
import PaymentsClient from './PaymentsClient';

export default async function PaymentsPage() {
  const [pagos, customers, businesses] = await Promise.all([
    getPagos(),
    getCustomers(),
    getBusinesses(),
  ]);

  return <PaymentsClient initialPayments={pagos} initialCustomers={customers} initialBusinesses={businesses} />;
}
