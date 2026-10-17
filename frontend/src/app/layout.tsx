import type { Metadata } from 'next';
import './globals.css';
import { NetworkProvider } from '@/context/NetworkContext';
import { AuthProvider } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import FloatingWhatsAppButton from '@/components/whatsapp/FloatingWhatsAppButton';

export const metadata: Metadata = {
  title: 'KIN — Campus Trust Network',
  description: 'A living network that connects proven expertise to real opportunities and trusted campus relationships.',
  icons: {
    icon: '/images/kin_logo.png',
    shortcut: '/images/kin_logo.png',
    apple: '/images/kin_logo.png',
  },
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
          rel="preload"
          as="image"
          href="/hero.webp"
          type="image/webp"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full w-full bg-[#FFFFFF] text-[#0A0D14] antialiased selection:bg-[#B6E64A] selection:text-[#142600] overflow-x-hidden">
        <SmoothScrollProvider>
          <AuthProvider>
            <NetworkProvider>
              {children}
              <AuthModal />
              <FloatingWhatsAppButton />
            </NetworkProvider>
          </AuthProvider>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
