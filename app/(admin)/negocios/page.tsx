import { getBusinesses } from "@/lib/api";
import NegociosClient from "./NegociosClient";

export default async function NegociosPage() {
  try {
    const businesses = await getBusinesses();
    return <NegociosClient initialBusinesses={businesses} />;
  } catch (error) {
    console.error("Error loading businesses:", error);
    return (
      <div className="page-stack" style={{ padding: 40, textAlign: 'center' }}>
        <div className="section-card" style={{ maxWidth: 500, margin: '0 auto' }}>
          <h2 style={{ color: 'var(--text)', marginBottom: 16 }}>Error de conexión</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
            No se pudo obtener la lista de negocios. Esto suele ocurrir porque el <strong>backend</strong> no está iniciado o es inaccesible.
          </p>
          <div style={{ padding: 16, background: 'var(--surface-2)', borderRadius: 12, textAlign: 'left', fontSize: 14 }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Pasos para solucionar:</p>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>Abre una nueva terminal</li>
              <li>Ve a la carpeta del backend: <code>cd ../Backend-Grupo403/backend/backend</code></li>
              <li>Ejecuta: <code>npm run start:dev</code></li>
              <li>Refresca esta página</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }
}
