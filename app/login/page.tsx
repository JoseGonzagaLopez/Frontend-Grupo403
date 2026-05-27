"use client";

import { useState, useEffect } from "react";
import { authenticate } from "@/lib/actions";
import { loginCustomer, registerCustomer, loginBusiness, registerBusiness } from "@/lib/api";
import { loginCustomerAction, loginBusinessAction } from "@/lib/actions";
import { Sun, Moon } from "lucide-react";

type Tab = "login" | "register";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("login");

  // Login unificado
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Registro
  const [registerRole, setRegisterRole] = useState<"cliente" | "empresa">("cliente");
  const [regForm, setRegForm] = useState({
    Nombre: "",
    username: "",
    Telefono: "",
    Correo: "",
    password: "",
    Localicacion: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isBusinessSuccess, setIsBusinessSuccess] = useState(false);

  // Tema oscuro/claro
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = document.documentElement.getAttribute("data-theme");
    const dark = stored === "dark" || (!stored && prefersDark);
    setIsDark(dark);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
  }

  // ── LOGIN UNIFICADO ────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (identifier.trim().toLowerCase() === "admin") {
        const result = await authenticate("admin", password);
        if (!result.success) throw new Error("Credenciales de administrador incorrectas");
        setSuccessMessage("Acceso concedido");
        setIsSuccess(true);
        setTimeout(() => { window.location.href = "/dashboard"; }, 800);
        return;
      }

      let clienteOk = false;
      try {
        const customer = await loginCustomer(identifier, password);
        await loginCustomerAction(customer.id);
        clienteOk = true;
        setSuccessMessage("Sesion iniciada");
        setIsSuccess(true);
        setTimeout(() => { window.location.href = "/inicio"; }, 800);
      } catch { /* no era cliente */ }

      if (clienteOk) return;

      const business = await loginBusiness(identifier, password);
      await loginBusinessAction(business.id);
      setSuccessMessage("Sesion iniciada");
      setIsSuccess(true);
      setTimeout(() => { window.location.href = "/negocio"; }, 800);

    } catch (err: any) {
      setError("Usuario o contrasena incorrectos. Verifica tus datos.");
      setIsLoading(false);
    }
  };

  // ── REGISTRO ────────────────────────────────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (registerRole === "cliente") {
        const customer = await registerCustomer({
          Nombre: regForm.Nombre,
          username: regForm.username || undefined,
          Telefono: regForm.Telefono,
          Correo: regForm.Correo,
          password: regForm.password,
        });
        await loginCustomerAction(customer.id);
        setSuccessMessage("Cuenta creada y sesion iniciada");
        setIsSuccess(true);
        setTimeout(() => { window.location.href = "/inicio"; }, 800);
      } else {
        await registerBusiness({
          Nombre: regForm.Nombre,
          Telefono: regForm.Telefono,
          Correo: regForm.Correo,
          Localicacion: regForm.Localicacion,
          password: regForm.password,
        });
        setSuccessMessage("Su peticion ha sido enviada");
        setIsBusinessSuccess(true);
        setIsSuccess(true);
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
      setIsLoading(false);
    }
  };

  const cardShouldAnimate = isSuccess && !isBusinessSuccess;

  const cardStyle: React.CSSProperties = {
    position: "fixed",
    top: cardShouldAnimate ? "14px" : "50%",
    left: cardShouldAnimate ? "calc(100vw - 24px - 38px)" : "50%",
    width: cardShouldAnimate ? "38px" : "100%",
    maxWidth: cardShouldAnimate ? "38px" : "460px",
    height: cardShouldAnimate ? "38px" : "auto",
    minHeight: cardShouldAnimate ? "38px" : "auto",
    borderRadius: cardShouldAnimate ? "50%" : "var(--radius-xl)",
    transform: cardShouldAnimate ? "translate(0, 0)" : "translate(-50%, -50%)",
    overflow: "hidden",
    padding: cardShouldAnimate ? "0" : "var(--space-6)",
    border: `1px solid ${cardShouldAnimate ? "rgb(187,187,187)" : "var(--border)"}`,
    transition: "all 0.8s cubic-bezier(0.65, 0, 0.35, 1)",
    zIndex: 100,
    background: "var(--surface-solid)",
    boxShadow: cardShouldAnimate ? "0 4px 10px var(--accent-glow)" : "var(--shadow-lg)",
  };

  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex items-center justify-center">

      {/* Toggle modo oscuro — se oculta al iniciar sesion */}
      {!isSuccess && (
        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          style={{
            position: "fixed",
            top: "var(--space-4)",
            right: "var(--space-4)",
            zIndex: 200,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-full)",
            width: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text)",
            boxShadow: "var(--shadow-sm)",
            transition: "all 0.2s ease",
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      )}

      <div className="surface-card" style={cardStyle}>
        <img
          src="/favicon.ico"
          alt="Logo"
          style={{
            position: "absolute",
            top: cardShouldAnimate ? "0" : "32px",
            left: cardShouldAnimate ? "0" : "50%",
            transform: cardShouldAnimate ? "none" : "translateX(-50%)",
            width: cardShouldAnimate ? "100%" : "56px",
            height: cardShouldAnimate ? "100%" : "56px",
            borderRadius: "50%",
            objectFit: "cover",
            transition: "all 0.8s cubic-bezier(0.65, 0, 0.35, 1)",
            zIndex: 10,
          }}
        />

        <div style={{ opacity: cardShouldAnimate ? 0 : 1, transition: "opacity 0.3s ease-out", paddingTop: "72px" }}>
          <div className="flex flex-col items-center text-center gap-1 mb-5">
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.03em" }}>Buk-A</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)" }}>
              {tab === "login" ? "Accede a tu cuenta" : "Crea tu cuenta"}
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", background: "var(--surface-2)", borderRadius: "var(--radius-md)", padding: "3px", marginBottom: "var(--space-5)" }}>
            {(["login", "register"] as Tab[]).map((t) => (
              <button key={t} type="button" onClick={() => { setTab(t); setError(""); }}
                style={{ padding: "var(--space-2) var(--space-3)", borderRadius: "var(--radius-sm)", fontSize: "var(--text-sm)", fontWeight: 600, background: tab === t ? "var(--surface-solid)" : "transparent", color: tab === t ? "var(--text)" : "var(--text-secondary)", boxShadow: tab === t ? "var(--shadow-sm)" : "none", transition: "all 0.2s ease", border: "none", cursor: "pointer" }}>
                {t === "login" ? "Iniciar sesion" : "Registrarse"}
              </button>
            ))}
          </div>

          {tab === "login" && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4" autoComplete="off">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Usuario o correo</label>
                <input type="text" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="input" placeholder="admin / tu@correo.com / username" required autoComplete="username" />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="••••••••" required autoComplete="current-password" />
              </div>
              {error && <div className="message-error">{error}</div>}
              <button type="submit" className="primary-btn w-full flex justify-center items-center mt-1" disabled={isLoading}>
                {isLoading ? "Verificando..." : "Entrar"}
              </button>
            </form>
          )}

          {tab === "register" && (
            <form onSubmit={handleRegister} className="flex flex-col gap-4" autoComplete="off">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Tipo de cuenta</label>
                <select value={registerRole} onChange={(e) => { setRegisterRole(e.target.value as "cliente" | "empresa"); setError(""); }} className="input">
                  <option value="cliente">Cliente</option>
                  <option value="empresa">Empresa / Negocio</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>
                  {registerRole === "cliente" ? "Nombre completo" : "Nombre del negocio"}
                </label>
                <input type="text" value={regForm.Nombre} onChange={(e) => setRegForm({ ...regForm, Nombre: e.target.value })} className="input" placeholder={registerRole === "cliente" ? "Ej. Maria Lopez" : "Ej. Peluqueria Carmen"} required />
              </div>
              {registerRole === "cliente" && (
                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>
                    Nombre de usuario
                    <span style={{ fontWeight: 400, color: "var(--text-secondary)", marginLeft: 6 }}>(para iniciar sesion)</span>
                  </label>
                  <input type="text" value={regForm.username} onChange={(e) => setRegForm({ ...regForm, username: e.target.value.toLowerCase().replace(/\s/g, "") })} className="input" placeholder="Ej. marialopez" pattern="[a-zA-Z0-9_]+" title="Solo letras, numeros y guion bajo" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Correo electronico</label>
                <input type="email" value={regForm.Correo} onChange={(e) => setRegForm({ ...regForm, Correo: e.target.value })} className="input" placeholder="ejemplo@correo.com" required />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Telefono</label>
                <input type="tel" value={regForm.Telefono} onChange={(e) => setRegForm({ ...regForm, Telefono: e.target.value })} className="input" placeholder="Ej. 600000000" pattern="[0-9]{9}" title="Debe contener 9 numeros" />
              </div>
              {registerRole === "empresa" && (
                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Direccion / Localizacion</label>
                  <input type="text" value={regForm.Localicacion} onChange={(e) => setRegForm({ ...regForm, Localicacion: e.target.value })} className="input" placeholder="Ej. Calle Mayor 10, Alicante" />
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--text)" }}>Contraseña</label>
                <input type="password" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} className="input" placeholder="Minimo 6 caracteres" required minLength={6} autoComplete="new-password" />
              </div>
              {error && <div className="message-error">{error}</div>}
              <button type="submit" className="primary-btn w-full flex justify-center items-center mt-1" disabled={isLoading}>
                {isLoading ? "Registrando..." : "Crear cuenta"}
              </button>
            </form>
          )}

          <p style={{ textAlign: "center", marginTop: "var(--space-4)", fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
            Al registrarte aceptas los terminos de uso del servicio
          </p>
        </div>
      </div>

      {isSuccess && successMessage && (
        <div style={{
          position: "fixed", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)", maxWidth: "400px",
          textAlign: "center", zIndex: 200, padding: "var(--space-6)",
          background: "var(--surface-solid)", border: "1px solid var(--border)",
          borderRadius: "var(--radius-xl)", boxShadow: "var(--shadow-lg)",
        }}>
          <p style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>✓</p>
          <p style={{ fontSize: "var(--text-lg)", color: "var(--text)", fontWeight: 700, marginBottom: "var(--space-2)" }}>
            {successMessage}
          </p>
          {isBusinessSuccess && (
            <button
              onClick={() => {
                setIsSuccess(false); setSuccessMessage(""); setIsBusinessSuccess(false);
                setTab("login"); setRegisterRole("cliente");
                setRegForm({ Nombre: "", username: "", Telefono: "", Correo: "", password: "", Localicacion: "" });
                setIsLoading(false); setError("");
              }}
              style={{ fontSize: "var(--text-sm)", color: "var(--accent)", textDecoration: "underline", background: "none", border: "none", cursor: "pointer", padding: "0", marginTop: "var(--space-3)" }}
            >
              Volver al inicio
            </button>
          )}
        </div>
      )}
    </div>
  );
}
