import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Buk-A — Bookings Admin",
  description: "Panel de administración de reservas, clientes y cobros",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {/*
          Script SÍNCRONO bloqueante — debe estar en <head> como script nativo,
          NO como next/script, para que se ejecute antes de cualquier paint CSS.
          Esto elimina el FOUC (flash of unstyled/wrong-theme content).
        */}
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){
  try {
    var t = localStorage.getItem('theme');
    if (t === 'light' || t === 'dark') {
      document.documentElement.setAttribute('data-theme', t);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  } catch(e){}
})();`,
          }}
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
