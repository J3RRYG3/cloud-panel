import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cloud Panel — Arquitecto Multicloud FinOps",
  description:
    "Plataforma agentic AI para diseño de infraestructura multicloud optimizada. Compara AWS, Azure y GCP bajo criterios FinOps y genera código Terraform listo para producción.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
