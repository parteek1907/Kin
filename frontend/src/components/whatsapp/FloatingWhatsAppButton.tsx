'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsAppButton() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const shouldReduceMotion = useReducedMotion();

  const businessNumber = process.env.NEXT_PUBLIC_WA_BUSINESS_NUMBER || '919811022678';
  const waUrl = `https://wa.me/${businessNumber}?text=${encodeURIComponent('Hi KIN, I need…')}`;


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
          {/* Subtle warm champagne / emerald ambient ring */}
          <span
            className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping pointer-events-none"
            style={{ animationDuration: '3.5s' }}
            aria-hidden="true"
          />

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp with KIN"
            className="relative flex items-center justify-center w-13 h-13 rounded-full bg-white/85 hover:bg-white text-emerald-600 hover:text-emerald-700 shadow-[0_12px_35px_rgba(0,0,0,0.12),_inset_0_1.5px_2px_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95 transition-all duration-200 border border-white/80 backdrop-blur-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400/30 group"
          >
            {/* WhatsApp Icon */}
            <MessageCircle className="w-6 h-6 stroke-[2.2] group-hover:rotate-6 transition-transform duration-200" />

            {/* Hover Tooltip in matching luxury glass style */}
            <span className="absolute right-16 px-3.5 py-1.5 rounded-xl bg-white/95 text-slate-800 text-xs font-bold tracking-wide whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-200/80 hidden sm:block">
              Chat on WhatsApp
            </span>
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
