import { getPagos, getCustomers } from '@/lib/api';
import PaymentsClient from './PaymentsClient';

export default async function PaymentsPage() {
  const [pagos, customers] = await Promise.all([
    getPagos(),
    getCustomers(),
  ]);

  return <PaymentsClient initialPayments={pagos} initialCustomers={customers} />;
}
