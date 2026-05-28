import dynamic from "next/dynamic";

// ssr:false evita que Next.js intente renderizar este componente en servidor,
// eliminando completamente el hydration mismatch con 100dvh, variables CSS y temas.
const LoginClient = dynamic(() => import("./LoginClient"), { ssr: false });

export default function LoginPage() {
  return <LoginClient />;
}
