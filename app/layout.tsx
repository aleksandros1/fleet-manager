import type { Metadata } from 'next';
import './globals.css'; // <-- ΑΥΤΗ Η ΓΡΑΜΜΗ ΕΛΕΙΠΕ ΚΑΙ "ΕΣΠΑΣΕ" ΤΟ DESIGN!

// Εδώ ορίζουμε τον τίτλο της καρτέλας και το λογότυπο (favicon) για όλο το site
export const metadata: Metadata = {
  title: 'Auto Lazaridis | Premium Fleet',
  description: 'Η πιο αυστηρά επιλεγμένη συλλογή οχημάτων στη Βόρεια Ελλάδα. Καθαρή διαφάνεια, αδιαπραγμάτευτη ποιότητα.',
  icons: {
    icon: '/brand-logo.png',
    shortcut: '/brand-logo.png',
    apple: '/brand-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <head>
        {/* Force προσθήκη των εικονιδίων για τον Safari και τα κινητά */}
        <link rel="icon" href="/brand-logo.png" />
        <link rel="apple-touch-icon" href="/brand-logo.png" />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#030303' }}>
        {children}
      </body>
    </html>
  );
}