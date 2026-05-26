"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { authenticate } from "@/lib/actions";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await authenticate(password);
      if (result.success) {
        // Forzamos la redirección con window.location para asegurar 
        // que el middleware detecte la nueva cookie y refresque el layout
        window.location.href = "/dashboard";
      } else {
        setError("Contraseña incorrecta");
      }
    } catch (err) {
      setError("Ha ocurrido un error al intentar iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="max-w-md w-full bg-[var(--card)] p-8 rounded-xl shadow-lg border border-[var(--border)]">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-[var(--primary)]/10 p-4 rounded-full mb-4">
            <Lock className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Panel de Administración</h1>
          <p className="text-[var(--muted-foreground)] mt-2">Introduce tus credenciales para acceder</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Usuario
            </label>
            <input
              type="text"
              value="admin"
              disabled
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed font-medium opacity-70"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center bg-red-500/10 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Verificando..." : "Acceder"}
          </button>
        </form>
      </div>
    </div>
  );
}
