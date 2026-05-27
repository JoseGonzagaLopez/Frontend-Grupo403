// Layout vacio: evita que /cliente/register herede el sidebar de cliente
export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
