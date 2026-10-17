import type { Metadata } from 'next';
import './globals.css';
import { NetworkProvider } from '@/context/NetworkContext';

export const metadata: Metadata = {
  title: 'CONDUIT // Living Proof-of-Work & Intent Network',
  description: 'Artifact-Verified Intent & Multi-Hop Warm Routing Network connecting students, alumni, faculty, founders, and institutions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full w-full bg-[#F0F3F7] text-slate-800 antialiased font-sans overflow-x-hidden overflow-y-auto">
        <NetworkProvider>
          {children}
        </NetworkProvider>
      </body>
    </html>
  );
}
