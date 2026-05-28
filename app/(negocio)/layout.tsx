import NegocioShell from "./NegocioShell";

export default function NegocioLayout({ children }: { children: React.ReactNode }) {
  return <NegocioShell>{children}</NegocioShell>;
}
