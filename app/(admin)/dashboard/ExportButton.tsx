"use client";

interface Appointment {
    date: string;
    time: string;
    serviceName: string;
    status: string;
    customerId: number;
}

interface Customer {
    id: number;
    Nombre: string;
}

function formatDate(date: string) {
    try {
        return new Intl.DateTimeFormat("es-ES", {
            day: "2-digit", month: "2-digit", year: "numeric",
        }).format(new Date(date));
    } catch {
        return date;
    }
}

function traducirEstado(status: string) {
    if (status === "pending") return "Pendiente";
    if (status === "confirmed") return "Confirmada";
    if (status === "paid") return "Pagada";
    return status;
}

export default function ExportButton({
    appointments,
    customers,
}: {
    appointments: Appointment[];
    customers: Customer[];
}) {
    function exportarReporte() {
        const now = new Date();
        const proximas = appointments
            .filter((b) => new Date(`${b.date}T${b.time}`) >= now)
            .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

        const ventana = window.open("", "_blank");
        ventana?.document.write(`
      <html>
        <head>
          <title>Próximas Reservas</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; }
            h1 { font-size: 24px; margin-bottom: 8px; }
            p { color: #666; margin-bottom: 24px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background: #f4f4f4; font-weight: bold; }
            tr:nth-child(even) { background: #fafafa; }
          </style>
        </head>
        <body>
          <h1>Próximas Reservas</h1>
          <p>Generado el ${now.toLocaleDateString("es-ES")}</p>
          <table>
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
              ${proximas.map((b) => `
                <tr>
                  <td>${formatDate(b.date)}</td>
                  <td>${b.time}</td>
                  <td>${b.serviceName}</td>
                  <td>${customers.find((c) => c.id === b.customerId)?.Nombre ?? `Cliente #${b.customerId}`}</td>
                  <td>${traducirEstado(b.status)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);
        ventana?.document.close();
        ventana?.print();
    }

    return (
        <button className="primary-btn" type="button" onClick={exportarReporte}>
            Exportar reporte
        </button>
    );
}