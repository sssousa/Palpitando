import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Palpitando — Bolão da Copa 2026",
  description: "Bolão entre amigos para a Copa do Mundo FIFA 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="text-center text-xs text-zinc-500 py-4">
          Palpitando · Copa do Mundo FIFA 2026 · horários de Brasília
        </footer>
      </body>
    </html>
  );
}
