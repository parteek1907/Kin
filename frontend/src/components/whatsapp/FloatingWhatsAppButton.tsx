'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsAppButton() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  const businessNumber = process.env.NEXT_PUBLIC_WA_BUSINESS_NUMBER || '919811022678';
  const waUrl = `https://wa.me/${businessNumber}?text=Hi%20CONDUIT`;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        // Scrolling down -> hide button
        setVisible(false);
      } else {
        // Scrolling up -> show button
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center select-none"
        >
          {/* Subtle ambient pulse ring */}
          <span
            className="absolute inset-0 rounded-full bg-[#B6E64A]/30 animate-ping pointer-events-none"
            style={{ animationDuration: '3s' }}
            aria-hidden="true"
          />

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp with CONDUIT"
            className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#11131A] text-[#B6E64A] shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200 border border-[#B6E64A]/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#B6E64A]/50 group"
          >
            {/* WhatsApp Icon */}
            <MessageCircle className="w-7 h-7 stroke-[2.2] group-hover:rotate-6 transition-transform duration-200" />

            {/* Hover Tooltip */}
            <span className="absolute right-16 px-3 py-1.5 rounded-lg bg-[#11131A] text-white text-xs font-semibold uppercase tracking-wider whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-xl border border-white/10 hidden sm:block">
              Chat on WhatsApp
            </span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
