import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import LibretonTransition from "@/components/LibretonTransition";
import UserPreferencesInitializer from "@/components/UserPreferencesInitializer";
import AbuelitaHelpChat from "@/components/AbuelitaHelpChat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OllaCercana — Comida Casera de Vecinas Cerca de Ti",
  description: "Encuentra y pide platos caseros, guisos tradicionales y repostería artesanal preparados por las mejores cocineras de tu barrio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-black text-[#f4f3ef] font-sans selection:bg-amber-400/20 selection:text-amber-200">
        <UserPreferencesInitializer />
        <LibretonTransition>{children}</LibretonTransition>
        <AbuelitaHelpChat />
      </body>
    </html>
  );
}
