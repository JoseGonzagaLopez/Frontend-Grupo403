// Layout vacio: evita que /cliente/login herede el sidebar de cliente
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
