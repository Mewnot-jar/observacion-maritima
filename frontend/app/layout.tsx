import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import { Petrona, Work_Sans } from "next/font/google";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

const petrona = Petrona({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-persona",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "Avistamientos",
  description: "Observaciones marinas y costeras",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${petrona.variable} ${workSans.variable} antialiased`}>
        <AuthProvider>
          <div className="lg:flex">
            <Sidebar />
            <div className="min-w-0 flex-1">{children}</div>
          </div>
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}

