import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "SIS Lead Hunter — Shabaka Intelligence System",
  description: "Prospection B2B automatisée : trouvez des sites obsolètes, enrichissez vos leads et générez des emails personnalisés avec l'IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="fr" className={`${inter.variable} h-full`}>
        <body className="min-h-full bg-[#0A0F1E] text-[#E8F0FF] antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
