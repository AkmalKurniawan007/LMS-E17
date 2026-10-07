import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Archivo, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import PageTracker from "@/components/marketing/PageTracker";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "E17 Course | Learning Management System",
  description: "Platform manajemen pembelajaran terpadu untuk bootcamp E17 Course — pelatihan berstandar nasional.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${archivo.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col font-sans">
        <PageTracker />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}

