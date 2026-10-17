'use client';

import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Menu, X } from 'lucide-react';
import { tokens } from '@/config/tokens';

interface ConduitNavbarProps {
  onExplore?: () => void;
  onHowItWorks?: () => void;
  onForInstitutions?: () => void;
}

export default function ConduitNavbar({
  onExplore,
  onHowItWorks,
  onForInstitutions
}: ConduitNavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollTo = (id: string, customHandler?: () => void) => {
    setMobileMenuOpen(false);
    if (customHandler) {
      customHandler();
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 104;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <motion.header
      initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: tokens.motion.ease }}
      id="conduit-nav"
      className={`fixed top-0 left-0 right-0 z-40 w-full h-[104px] transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFFDF8]/90 backdrop-blur-md shadow-sm border-b border-black/[0.04]'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full h-full px-[var(--gutter)] flex lg:grid lg:grid-cols-[1fr_auto_1fr] items-center justify-between">
        
        {/* =====================================================================
            ZONE 1: BRAND (KIN - Minimalist geometric luxury editorial branding)
           ===================================================================== */}
        <div id="nav-logo" className="flex items-center justify-self-start">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-2.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#11131A] rounded"
            aria-label="Kin Home"
          >
            <img 
              src="/images/kin_logo.png" 
              alt="KIN Logo" 
              className="w-8 h-8 object-contain transition-transform duration-300 group-hover:scale-105" 
            />
            <span 
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              className="inline-flex items-center text-[24px] font-bold tracking-[0.24em] text-[#11131A] uppercase transition-opacity group-hover:opacity-80 select-none leading-none"
            >
              KIN
            </span>
          </button>
        </div>

        {/* =====================================================================
            ZONE 2: CENTER NAVIGATION (NETWORK, HOW IT WORKS, FOR INSTITUTIONS)
            Centered directly on viewport with 64px gap
           ===================================================================== */}
        <nav 
          id="nav-links"
          aria-label="Primary Navigation"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
          className="hidden lg:flex items-center justify-center gap-16 text-[14px] font-semibold tracking-[0.12em] text-[#2D3139] uppercase justify-self-center select-none"
        >
          <button
            onClick={() => handleScrollTo('network', onExplore)}
            className="hover:text-[#11131A] transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#11131A] rounded whitespace-nowrap"
          >
            NETWORK
          </button>
          
          <button
            onClick={() => handleScrollTo('network', onHowItWorks)}
            className="hover:text-[#11131A] transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#11131A] rounded whitespace-nowrap"
          >
            HOW IT WORKS
          </button>
          
          <button
            onClick={() => handleScrollTo('pricing', onForInstitutions)}
            className="hover:text-[#11131A] transition-colors py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#11131A] rounded whitespace-nowrap"
          >
            PRICING
          </button>
        </nav>

        {/* =====================================================================
            ZONE 3: PRIMARY ACTION (ENTER NETWORK → Smooth blended borderless action, no pill boundary, no blur)
           ===================================================================== */}
        <div className="flex items-center justify-self-end">
          <button
            id="nav-cta"
            onClick={() => handleScrollTo('pricing', onExplore)}
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className="group hidden lg:inline-flex items-center space-x-2.5 h-[52px] text-[#11131A] font-bold text-[12px] tracking-[0.12em] uppercase transition-all duration-200 hover:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#11131A]/30 whitespace-nowrap cursor-pointer select-none"
          >
            <span>ENTER NETWORK</span>
            <ArrowRight className="w-4 h-4 stroke-[2.2] transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          {/* Tablet & Mobile Menu Hamburger (visible below 1024px) */}
          <button
            id="nav-hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#11131A] hover:bg-black/5 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#11131A]"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-[#FFFDF8] border-b border-black/[0.06] px-6 py-5 shadow-lg flex flex-col space-y-4"
        >
          <button
            onClick={() => handleScrollTo('network', onExplore)}
            className="text-left font-semibold text-sm tracking-[0.10em] text-[#11131A] py-1 uppercase"
          >
            NETWORK
          </button>
          <button
            onClick={() => handleScrollTo('network', onHowItWorks)}
            className="text-left font-semibold text-sm tracking-[0.10em] text-[#11131A] py-1 uppercase"
          >
            HOW IT WORKS
          </button>
          <button
            onClick={() => handleScrollTo('pricing', onForInstitutions)}
            className="text-left font-semibold text-sm tracking-[0.10em] text-[#11131A] py-1 uppercase"
          >
            PRICING
          </button>
        </motion.div>
      )}
    </motion.header>
  );
}

