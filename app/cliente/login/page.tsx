"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginCustomer } from "@/lib/api";
import { loginCustomerAction } from "@/lib/actions";
import Link from "next/link";

export default function ClienteLoginPage() {
  const [correo, setCorreo] = useState("");
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
      const customer = await loginCustomer(correo, password);
      await loginCustomerAction(customer.id);
      setIsSuccess(true);
      
      setTimeout(() => {
        window.location.href = "/reservar";
      }, 800);
    } catch (err: any) {
      setError(err.message || "Ha ocurrido un error al intentar iniciar sesión");
      setIsLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    position: 'fixed',
    top: isSuccess ? '14px' : '50%',
    left: isSuccess ? 'calc(100vw - 24px - 38px)' : '50%',
    width: isSuccess ? '38px' : '100%',
    maxWidth: isSuccess ? '38px' : '400px',
    height: isSuccess ? '38px' : '520px',
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
    <div className="public-page min-h-screen">
      <div className="surface-card" style={cardStyle}>
        
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

        <div style={{
          opacity: isSuccess ? 0 : 1,
          transition: 'opacity 0.3s ease-out',
          paddingTop: '80px',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}>
          <div className="flex flex-col items-center text-center gap-2 mb-6">
            <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em' }}>
              Iniciar Sesión
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
              Accede a tu cuenta de cliente
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1" autoComplete="off">
            <div className="flex flex-col gap-2">
              <label style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text)' }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                className="input"
                placeholder="ejemplo@correo.com"
                required
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

            <div className="mt-auto pt-4 flex flex-col gap-3">
              <button
                type="submit"
                className="primary-btn w-full flex justify-center items-center py-3"
                disabled={isLoading}
              >
                {isLoading ? "Verificando..." : "Acceder"}
              </button>
              
              <div className="text-center">
                <span className="text-var(--text-secondary) text-sm">¿No tienes cuenta? </span>
                <Link href="/cliente/register" className="text-var(--accent) font-semibold hover:underline text-sm">
                  Regístrate aquí
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
