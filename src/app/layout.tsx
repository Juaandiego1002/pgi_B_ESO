import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Retornos y Amarres - Servicios Esotéricos Profesionales",
  description:
    "Guía espiritual profesional para el amor, la protección y la prosperidad. Consultas de tarot, retornos de pareja, amarres de amor, limpiezas energéticas y rituales personalizados.",
  keywords: [
    "tarot",
    "retorno de pareja",
    "amarre de amor",
    "limpieza energética",
    "rituales",
    "esotérico",
    "videncia",
  ],
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--card)",
              border: "1px solid var(--border)",
              color: "var(--foreground)",
            },
          }}
        />
      </body>
    </html>
  );
}
