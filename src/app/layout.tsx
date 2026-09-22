import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "AIMPRIMIR3D | Impresión 3D, Diseño y Prototipos en República Dominicana",
  description: "Servicios de impresión 3D, diseño 3D, prototipado y fabricación personalizada en República Dominicana. Encarga y gestiona tus pedidos fácilmente.",
  icons: {
    icon: "/img/logo.ico",
  },
  openGraph: {
    title: "AIMPRIMIR3D | Impresión 3D y Diseño 3D",
    description: "Transformamos ideas en piezas reales mediante impresión 3D, diseño, prototipado y fabricación.",
    url: "https://aimprimir3d.com.do/",
    siteName: "AIMPRIMIR3D",
    images: [
      {
        url: "/img/logonombre.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "es_DO",
    type: "website",
  },
};

import { CartProvider } from "@/context/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={poppins.variable}>
      <body>
        <CartProvider>
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}

