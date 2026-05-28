"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Renderizamos los children siempre para no bloquear SSR,
  // pero el provider solo se activa en cliente para evitar
  // el mismatch de hidden y el script tag de next-themes.
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      {...props}
      // Suprimir el warning del <script> inline que inyecta next-themes
      scriptProps={{ suppressHydrationWarning: true } as React.ScriptHTMLAttributes<HTMLScriptElement>}
    >
      {children}
    </NextThemesProvider>
  );
}
