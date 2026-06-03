"use client";

import React from 'react';

interface ErrorViewProps {
  title?: string;
  message?: string;
}

export default function ErrorView({ 
  title = "Error de conexión", 
  message = "No se pudo obtener la información desde el servidor. Esto suele ocurrir porque el backend no está iniciado o es inaccesible." 
}: ErrorViewProps) {
  return (
    <div className="page-stack" style={{ padding: 40, textAlign: 'center' }}>
      <div className="section-card" style={{ maxWidth: 500, margin: '0 auto' }}>
        <h2 style={{ color: 'var(--text)', marginBottom: 16 }}>{title}</h2>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>
          {message}
        </p>
        <div style={{ padding: 16, background: 'var(--surface-2)', borderRadius: 12, textAlign: 'left', fontSize: 14 }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: 600 }}>Pasos para solucionar:</p>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            <li>Abre una nueva terminal en tu editor.</li>
            <li>Ve a la carpeta del backend: <code>cd ../Backend-Grupo403/backend/backend</code></li>
            <li>Ejecuta el comando: <code>npm run start:dev</code></li>
            <li>Una vez que el backend esté listo, refresca esta página.</li>
          </ol>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="primary-btn" 
          style={{ marginTop: 24 }}
        >
          Reintentar conexión
        </button>
      </div>
    </div>
  );
}
