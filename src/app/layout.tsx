import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Game Belajar Seru - Kuis Interaktif SD",
  description: "Aplikasi kuis belajar interaktif dan seru untuk siswa SD Kelas 1-6.",
};

import BackgroundShapes from "@/components/ui/BackgroundShapes";
import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} antialiased`}>
      <body>
        <Providers>
          <BackgroundShapes />
          {children}
        </Providers>
      </body>
    </html>
  );
}
