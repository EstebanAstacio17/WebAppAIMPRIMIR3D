import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "AIMPRIMIR3D | Fabricación Digital & Prototipos de Precisión",
  description: "Servicios de impresión 3D de alta precisión, diseño 3D, prototipado y piezas a medida en República Dominicana. Encarga y gestiona tus pedidos fácilmente.",
  icons: {
    icon: "/img/logo.ico",
  },
  openGraph: {
    title: "AIMPRIMIR3D | Fabricación Digital de Precisión",
    description: "Transformamos ideas en piezas reales mediante fabricación aditiva, resina 8K y filamentos técnicos.",
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
