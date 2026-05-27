"use client";

import { useState } from "react";
import { authenticate } from "@/lib/actions";
import { loginCustomer, loginBusiness, registerCustomer, registerBusiness } from "@/lib/api";
import { loginCustomerAction, loginBusinessAction } from "@/lib/actions";
import { ThemeToggle } from "@/components/ThemeToggle";

type Tab = "login" | "register";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [registerRole, setRegisterRole] = useState<"cliente" | "empresa">("cliente");
  const [regForm, setRegForm] = useState({
    Nombre: "",
    Telefono: "",
    Correo: "",
    password: "",
    Localicacion: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      // 1. Intentar como cliente
      try {
        const customer = await loginCustomer(loginEmail, loginPassword);
        await loginCustomerAction(customer.id);
        setSuccessMessage("Sesión iniciada");
        setIsSuccess(true);
        setTimeout(() => { window.location.href = "/cliente"; }, 800);
        return;
      } catch {
        // no es cliente, intentar como negocio
      }

      // 2. Intentar como negocio
      try {
        const business = await loginBusiness(loginEmail, loginPassword);
        await loginBusinessAction(business.id);
        setSuccessMessage("Sesión iniciada");
        setIsSuccess(true);
        setTimeout(() => { window.location.href = "/negocio/dashboard"; }, 800);
        return;
      } catch {
        // no es negocio tampoco
      }

      // 3. Intentar como admin (contraseña sin email)
      const adminResult = await authenticate(loginPassword);
      if (adminResult.success) {
        setSuccessMessage("Acceso de administrador concedido");
        setIsSuccess(true);
        setTimeout(() => { window.location.href = "/dashboard"; }, 800);
        return;
      }

      throw new Error("Credenciales incorrectas. Verifica tu correo y contraseña.");
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (registerRole === "cliente") {
        const customer = await registerCustomer({
          Nombre: regForm.Nombre,
          Telefono: regForm.Telefono,
          Correo: regForm.Correo,
          password: regForm.password,
        });
        await loginCustomerAction(customer.id);
        setSuccessMessage("Cuenta creada. ¡Bienvenido/a!");
        setIsSuccess(true);
        setTimeout(() => { window.location.href = "/cliente"; }, 800);
      } else {
        await registerBusiness({
          Nombre: regForm.Nombre,
          Telefono: regForm.Telefono,
          Correo: regForm.Correo,
          Localicacion: regForm.Localicacion,
          password: regForm.password,
        });
        setSuccessMessage("Solicitud enviada. Un administrador revisará tu cuenta.");
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
      setIsLoading(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    position: "fixed",
    top: isSuccess ? "14px" : "50%",
    left: isSuccess ? "calc(100vw - 24px - 38px)" : "50%",
    width: isSuccess ? "38px" : "100%",
    maxWidth: isSuccess ? "38px" : "440px",
    height: isSuccess ? "38px" : "auto",
    minHeight: isSuccess ? "38px" : "auto",
    borderRadius: isSuccess ? "50%" : "var(--radius-xl)",
    transform: isSuccess ? "translate(0, 0)" : "translate(-50%, -50%)",
    overflow: "hidden",
    padding: isSuccess ? "0" : "var(--space-6)",
    border: `1px solid ${isSuccess ? "rgb(187,187,187)" : "var(--border)"}`,
    transition: "all 0.8s cubic-bezier(0.65, 0, 0.35, 1)",
    zIndex: 100,
    background: "var(--surface-solid)",
    boxShadow: isSuccess ? "0 4px 10px var(--accent-glow)" : "var(--shadow-lg)",
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">

      {/* ThemeToggle en esquina superior derecha */}
      <div style={{ position: "fixed", top: 16, right: 16, zIndex: 200 }}>
        <ThemeToggle />
      </div>

      <div className="surface-card" style={cardStyle}>

        <img
          src="/favicon.ico"
          alt="Logo"
          style={{
            position: "absolute",
            top: isSuccess ? "0" : "32px",
            left: isSuccess ? "0" : "50%",
            transform: isSuccess ? "none" : "translateX(-50%)",
            width: isSuccess ? "100%" : "56px",
            height: isSuccess ? "100%" : "56px",
            borderRadius: "50%",
            objectFit: "cover",
            transition: "all 0.8s cubic-bezier(0.65, 0, 0.35, 1)",
            zIndex: 10,
          }}
        />

        <div style={{ opacity: isSuccess ? 0 : 1, transition: "opacity 0.3s ease-out", paddingTop: "72px" }}>

          <div className="flex flex-col items-center text-center gap-1 mb-5">
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em" }}>BookFlow</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              {tab === "login" ? "Accede a tu cuenta" : "Crea tu cuenta"}
            </p>
          </div>

          {/* Tabs login / register */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--surface-2)", borderRadius: "var(--radius-md)", padding: "3px", marginBottom: "var(--space-5)" }}>
            {(["login", "register"] as Tab[]).map((t) => (
              <button key={t} type="button" onClick={() => { setTab(t); setError(""); }}
                style={{ padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-sm)", fontWeight: 600, background: tab === t ? "var(--surface-solid)" : "transparent", color: tab === t ? "var(--text)" : "var(--text-secondary)", boxShadow: tab === t ? "var(--shadow-sm)" : "none", transition: "all 0.2s ease", border: "none", cursor: "pointer" }}>
                {t === "login" ? "Iniciar sesión" : "Registrarse"}
              </button>
            ))}
          </div>

          {/* ── LOGIN ── */}
          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4" autoComplete="off">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Correo o Usuario (admin)</label>
                <input
                  type="text"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="input"
                  placeholder="ejemplo@correo.com o admin"
                  required
                  autoComplete="username"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Contraseña</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && <div className="message-error">{error}</div>}
              <button type="submit" className="primary-btn w-full flex justify-center items-center mt-1" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Entrar"}
              </button>

              <p style={{ textAlign: "center", fontSize: "var(--text-xs)", color: "var(--text-secondary)", marginTop: 4 }}>
                ¿Eres administrador? Usa tu contraseña de acceso en el campo de contraseña.
              </p>
            </form>
          )}

          {/* ── REGISTRO ── */}
          {tab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4" autoComplete="off">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Tipo de cuenta</label>
                <select value={registerRole} onChange={(e) => { setRegisterRole(e.target.value as "cliente" | "empresa"); setError(""); }} className="input">
                  <option value="cliente">👤 Cliente</option>
                  <option value="empresa">🏢 Empresa / Negocio</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>{registerRole === "cliente" ? "Nombre completo" : "Nombre del negocio"}</label>
                <input type="text" value={regForm.Nombre} onChange={(e) => setRegForm({ ...regForm, Nombre: e.target.value })} className="input" placeholder={registerRole === "cliente" ? "Ej. María López" : "Ej. Peluquería Carmen"} required />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Correo electrónico</label>
                <input type="email" value={regForm.Correo} onChange={(e) => setRegForm({ ...regForm, Correo: e.target.value })} className="input" placeholder="ejemplo@correo.com" required />
              </div>

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Teléfono</label>
                <input type="tel" value={regForm.Telefono} onChange={(e) => setRegForm({ ...regForm, Telefono: e.target.value })} className="input" placeholder="Ej. 600000000" pattern="[0-9]{9}" title="Debe contener 9 números" />
              </div>

              {registerRole === "empresa" && (
                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Dirección / Localización</label>
                  <input type="text" value={regForm.Localicacion} onChange={(e) => setRegForm({ ...regForm, Localicacion: e.target.value })} className="input" placeholder="Ej. Calle Mayor 10, Alicante" />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Contraseña</label>
                <input type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} className="input" placeholder="Mínimo 6 caracteres" required minLength={6} autoComplete="new-password" />
              </div>

              {error && <div className="message-error">{error}</div>}
              <button type="submit" className="primary-btn w-full flex justify-center items-center mt-1" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Crear cuenta"}
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            Al registrarte aceptas los términos de uso del servicio
          </p>
        </div>
      </div>

      {isSuccess && successMessage && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "400px",
          textAlign: "center",
          zIndex: 200,
          padding: "var(--space-6)",
          background: "var(--surface-solid)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-lg)",
        }}>
          <p style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>✓</p>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
            {successMessage}
          </p>
          <button
            onClick={() => { setIsSuccess(false); setSuccessMessage(""); setTab("login"); setRegisterRole("cliente"); setRegForm({ Nombre: "", Telefono: "", Correo: "", password: "", Localicacion: "" }); setIsLoading(false); setError(""); }}
            style={{ fontSize: "var(--text-sm)", color: "var(--accent)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "0", marginTop: "var(--space-3)" }}
          >
            Volver al inicio
          </button>
        </div>
      )}
    </div>
  );
}
