import { getAppointments, getCustomers, type Booking, type BookingStatus } from '@/lib/api';
import Link from 'next/link';
import ExportButton from "./ExportButton";

function Badge({ status }: { status: BookingStatus }) {
  const label =
    status === 'pending'
      ? 'Pendiente'
      : status === 'confirmed'
        ? 'Confirmada'
        : 'Pagada';

  return <span className={`badge badge--${status}`}>{label}</span>;
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

function parseBookingDate(appointment: Booking) {
  return new Date(`${appointment.date}T${appointment.time}:00`);
}

function sortByDateTime(a: Booking, b: Booking) {
  return parseBookingDate(a).getTime() - parseBookingDate(b).getTime();
}

export default async function DashboardPage() {
  const appointments = await getAppointments();
  const customers = await getCustomers();
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();

  const sortedAppointments = [...appointments].sort(sortByDateTime);
  const appointmentsToday = sortedAppointments.filter((appointment) => appointment.date === today);
  const upcomingAppointments = sortedAppointments.filter((appointment) => parseBookingDate(appointment) >= now);
  const appointmentsNext = upcomingAppointments.slice(0, 5);
  const pendingToday = appointmentsToday.filter((appointment) => appointment.status === 'pending').length;
  const paidToday = appointmentsToday.filter((appointment) => appointment.status === 'paid').length;

  const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const appointmentsThisMonth = sortedAppointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    return appointmentDate >= currentMonth && appointmentDate <= now;
  });

  const uniqueCustomersThisMonth = new Set(appointmentsThisMonth.map((appointment) => appointment.customerId)).size;

  const businessCountsToday = appointmentsToday.reduce<Record<number, number>>((acc, appointment) => {
    acc[appointment.businessId] = (acc[appointment.businessId] ?? 0) + 1;
    return acc;
  }, {});

  const topBusinessEntry = Object.entries(businessCountsToday).sort(([, aCount], [, bCount]) => bCount - aCount)[0];
  const topBusinessLabel = topBusinessEntry
    ? `Comercio #${topBusinessEntry[0]}`
    : 'Sin actividad hoy';
  const topBusinessSubtitle = topBusinessEntry
    ? `${topBusinessEntry[1]} reserva${topBusinessEntry[1] === 1 ? '' : 's'} hoy`
    : 'No hay reservas en el día';

  const nextBooking = upcomingAppointments[0];
  const nextBookingLabel = nextBooking
    ? `${nextBooking.serviceName}`
    : 'No hay reservas pendientes';
  const nextBookingMeta = nextBooking
    ? `${nextBooking.time} · Comercio #${nextBooking.businessId}`
    : 'Agrega nuevas reservas para que aparezcan aquí';

  const infoReminderText = pendingToday > 0
    ? `${pendingToday} confirmación${pendingToday === 1 ? '' : 'es'} pendientes`
    : 'No hay confirmaciones pendientes';

  return (
    <div className="page-stack">
      <section className="page-hero">
        <div>
          <h2>Panel de control</h2>
          <p>Control diario de reservas, actividad y pagos.</p>
        </div>

        <ExportButton appointments={appointments} customers={customers} />
      </section>

      <section className="kpi-grid">
        <KpiCard
          title="Reservas hoy"
          value={`${appointmentsToday.length}`}
          subtitle={appointmentsToday.length > 0 ? `${appointmentsToday.length} reservas hoy` : 'Sin reservas hoy'}
          variant="positive"
        />
        <KpiCard
          title="Pagos hoy"
          value={`${paidToday}`}
          subtitle={`${paidToday} pago${paidToday === 1 ? '' : 's'} registrados`}
        />
        <KpiCard
          title="Pendientes"
          value={`${pendingToday}`}
          subtitle="Seguimiento necesario"
          variant="warning"
        />
        <KpiCard
          title="Clientes activos"
          value={`${uniqueCustomersThisMonth}`}
          subtitle="Este mes"
        />
      </section>

      <section className="dashboard-grid">
        <div className="section-card">
          <div className="panel-title-row">
            <h3 className="panel-title">Próximas reservas</h3>
            <Link href="/reservas" className="panel-subtle-link">
              Ver todas
            </Link>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Servicio</th>
                <th>Cliente</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {appointmentsNext.length > 0 ? (
                appointmentsNext.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.date}</td>
                    <td style={{ fontWeight: 600 }}>{appointment.time}</td>
                    <td>{appointment.serviceName}</td>
                    <td>Cliente #{appointment.customerId}</td>
                    <td>
                      <Badge status={appointment.status} />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem 0', color: '#6b7280' }}>
                    No hay reservas pendientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="info-stack">
          <div className="info-box">
            <p className="info-box__eyebrow">Siguiente reserva</p>
            <p className="info-box__title">{nextBookingLabel}</p>
            <p className="info-box__text">{nextBookingMeta}</p>
          </div>

          <div className="info-box">
            <p className="info-box__eyebrow">Comercio destacado</p>
            <p className="info-box__title">{topBusinessLabel}</p>
            <p className="info-box__text">{topBusinessSubtitle}</p>
          </div>

          <div className="info-box">
            <p className="info-box__eyebrow">Recordatorios</p>
            <p className="info-box__title">{infoReminderText}</p>
            <p className="info-box__text">Revisión recomendada esta mañana</p>
          </div>
        </div>
      </section>
    </div>
  );
}