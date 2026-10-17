'use client';

import React, { useEffect } from 'react';

declare global {
  interface Window {
    __lenis?: any;
  }
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    let lenisInstance: any = null;

    // Dynamically load Lenis on client
    import('lenis')
      .then(({ default: Lenis }) => {
        lenisInstance = new Lenis({
          duration: 2.2,
          easing: (t: number) => 1 - Math.pow(1 - t, 4), // Quartic ease-out
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 0.7,
          touchMultiplier: 1.2,
          autoRaf: true,
          anchors: true,
        });

        window.__lenis = lenisInstance;
      })
      .catch((err) => {
        console.warn('Lenis smooth scroll fallback:', err);
      });

    return () => {
      if (lenisInstance) {
        lenisInstance.destroy();
        delete window.__lenis;
      }
    };
  }, []);

  return <>{children}</>;
}
