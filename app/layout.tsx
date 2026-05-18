import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Toaster } from "@/components/ui/sonner";
import { NavProgress } from "@/components/ui/NavProgress";
import { DataProvider } from "@/components/providers/DataProvider";
import { ServiceWorkerRegistrar } from "@/components/providers/ServiceWorkerRegistrar";
import "./globals.css";

const geist = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist",
  weight: "100 900",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "yonne · livraison intelligente Sénégal",
  description: "Plateforme SaaS de livraison last-mile pour le Sénégal et l'Afrique de l'Ouest. Surpasser Glovo grâce à 10 fonctionnalités sans équivalent.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "YONNE",
  },
};

export const viewport: Viewport = {
  themeColor: "#FAF7F0",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const messages = await getMessages();
  return (
    <html lang="fr" className={`${geist.variable} ${inter.variable} ${jetbrains.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ServiceWorkerRegistrar />
          <NavProgress />
          <DataProvider>{children}</DataProvider>
          <Toaster position="top-center" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
