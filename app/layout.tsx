import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auto Lazaridis | Premium Fleet",
  description: "Η πιο αυστηρά επιλεγμένη συλλογή οχημάτων στη Βόρεια Ελλάδα.",
  icons: {
    icon: [
      { url: '/auto-laz-icon.png', sizes: 'any' },
    ],
    apple: [
      { url: '/auto-laz-icon.png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="el"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}