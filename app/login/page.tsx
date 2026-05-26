"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/lib/actions";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authenticate(password);
      if (result.success) {
        setIsSuccess(true);
        // Esperar a que termine la animación (800ms) antes de redirigir
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 800);
      } else {
        setError("Contraseña incorrecta");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Ha ocurrido un error al intentar iniciar sesión");
      setIsLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    top: isSuccess ? '14px' : '50%',
    left: isSuccess ? 'calc(100vw - 24px - 38px)' : '50%',
    width: isSuccess ? '38px' : '100%',
    maxWidth: isSuccess ? '38px' : '400px',
    height: isSuccess ? '38px' : '480px',
    borderRadius: isSuccess ? '50%' : 'var(--radius-xl)',
    transform: isSuccess ? 'translate(0, 0)' : 'translate(-50%, -50%)',
    overflow: 'hidden',
    padding: isSuccess ? '0' : 'var(--space-6)',
    borderWidth: isSuccess ? '2px' : '1px',
    borderColor: isSuccess ? 'rgb(187, 187, 187)' : 'var(--border)',
    transition: 'all 0.8s cubic-bezier(0.65, 0, 0.35, 1)',
    zIndex: 100,
    background: 'var(--surface-solid)',
    boxShadow: isSuccess ? '0 4px 10px var(--accent-glow)' : 'var(--shadow-lg)',
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)]">
      <div className="surface-card" style={cardStyle}>
        
        {/* Favicon que hace de Logo y luego de Avatar */}
        <img 
          src="/favicon.ico" 
          alt="Avatar" 
          style={{
            position: 'absolute',
            top: isSuccess ? '0' : '32px',
            left: isSuccess ? '0' : '50%',
            transform: isSuccess ? 'none' : 'translateX(-50%)',
            width: isSuccess ? '100%' : '64px',
            height: isSuccess ? '100%' : '64px',
            borderRadius: '50%',
            objectFit: 'cover',
            transition: 'all 0.8s cubic-bezier(0.65, 0, 0.35, 1)',
            zIndex: 10,
          }}
        />

        {/* Contenido del formulario que se desvanece */}
        <div style={{
          opacity: isSuccess ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
          paddingTop: '80px', // Espacio para el logo posicionado absolutamente
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em' }}>
              Acceso Admin
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Introduce tus credenciales para acceder
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>
                Usuario
              </label>
              <input
                type="text"
                value="admin"
                disabled
                className="input opacity-70 cursor-not-allowed"
                style={{ backgroundColor: 'var(--surface-2)' }}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="message-error mt-2">
                {error}
              </div>
            )}

            <div className="mt-auto pt-4">
              <button
                type="submit"
                className="primary-btn w-full flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Acceder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
