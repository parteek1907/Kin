import type { Metadata } from 'next';
import './globals.css';
import { NetworkProvider } from '@/context/NetworkContext';

export const metadata: Metadata = {
  title: 'KIN — Campus Trust Network',
  description: 'An intelligent platform connecting students, alumni, faculty, founders, and recruiters based on verified technical artifacts and warm campus connections.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full w-full bg-[#F7F5F0] text-[#141815] antialiased selection:bg-[#E25C38] selection:text-white overflow-x-hidden overflow-y-auto">
        <NetworkProvider>
          {children}
        </NetworkProvider>
      </body>
    </html>
  );
}
