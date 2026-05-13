import { getPagos, type Pago } from '@/lib/api';

type PaymentStatus = 'pending' | 'paid' | 'Por cobrar' | 'Pagado' | string;

type Payment = {
  client: string;
  business: string;
  amount: string;
  method: string;
  date: string;
  status: PaymentStatus;
};

function formatDate(date: string) {
  try {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function mapPagoToPayment(pago: Pago): Payment {
  const status = pago.Estado === 'paid' || pago.Estado === 'Pagado' ? 'paid' : pago.Estado === 'pending' || pago.Estado === 'Por cobrar' ? 'pending' : pago.Estado;

  return {
    client: pago.Cliente,
    business: pago.Comercio,
    amount: `${pago.Importe} €`,
    method: pago.Metodo,
    date: pago.Fecha,
    status,
  };
}

function KpiCard({
  title,
  value,
  subtitle,
  variant,
}: {
  title: string;
  value: string;
  subtitle: string;
  variant?: 'positive' | 'warning';
}) {
  return (
    <div className="kpi-card">
      <p className="kpi-card__label">{title}</p>
      <h3 className="kpi-card__value">{value}</h3>
      <p
        className={`kpi-card__meta ${variant === 'positive'
            ? 'kpi-card__meta--positive'
            : variant === 'warning'
              ? 'kpi-card__meta--warning'
              : ''
          }`}
      >
        {subtitle}
      </p>
    </div>
  );
}

function Badge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`badge badge--${status === 'pending' ? 'pending' : 'confirmed'}`}>
      {status === 'pending' ? 'Por cobrar' : 'Pagado'}
    </span>
  );
}

export default async function PaymentsPage() {
  const pagos = await getPagos();
  const payments = pagos.map(mapPagoToPayment);

  const today = new Date().toISOString().slice(0, 10);
  const todayPayments = payments.filter((payment) => payment.date === today);
  const paidPayments = payments.filter((payment) => payment.status === 'paid');
  const pendingPayments = payments.filter((payment) => payment.status === 'pending');
  const collectedToday = todayPayments.reduce((total, payment) => {
    return total + parseInt(payment.amount, 10);
  }, 0);

  const methodCounts = payments.reduce<Record<string, number>>((acc, payment) => {
    acc[payment.method] = (acc[payment.method] ?? 0) + 1;
    return acc;
  }, {});

  const mostUsedMethod = Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Sin datos';
  const conversion = payments.length > 0 ? Math.round((paidPayments.length / payments.length) * 100) : 0;

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Pagos</h2>
          <p>Seguimiento de cobros realizados y pendientes.</p>
        </div>

        <button className="primary-btn" type="button">
          Registrar cobro
        </button>
      </section>

      <section className="kpi-grid">
        <KpiCard
          title="Cobrado hoy"
          value={`${collectedToday} €`}
          subtitle={`${todayPayments.length} operaciones registradas`}
          variant="positive"
        />
        <KpiCard
          title="Pendiente"
          value={`${pendingPayments.length}`}
          subtitle={`${pendingPayments.length} cobros por revisar`}
          variant="warning"
        />
        <KpiCard title="Método más usado" value={mostUsedMethod} subtitle="Mayor volumen del día" />
        <KpiCard title="Conversión" value={`${conversion}%`} subtitle="Cobros cerrados" />
      </section>

      <section className="section-card">
        <div className="panel-title-row">
          <h3 className="panel-title">Listado de cobros</h3>
          <span style={{ color: '#6b7280', fontSize: 14 }}>
            {payments.length} resultados
          </span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Comercio</th>
              <th>Importe</th>
              <th>Método</th>
              <th>Fecha</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={`${payment.client}-${payment.business}-${payment.date}-${payment.method}`}>
                <td>{payment.client}</td>
                <td>{payment.business}</td>
                <td>{payment.amount}</td>
                <td>{payment.method}</td>
                <td>{formatDate(payment.date)}</td>
                <td>
                  <Badge status={payment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
