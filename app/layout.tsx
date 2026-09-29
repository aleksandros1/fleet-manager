import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auto Lazaridis",
  description: "Ενοικίαση, Leasing & Πωλήσεις Οχημάτων στη Δράμα.",
  icons: {
    icon: "/brand-logo.png", // Εδώ ορίζουμε να παίρνει το ίδιο λογότυπο με το navbar
    apple: "/brand-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <body>{children}</body>
    </html>
  );
}