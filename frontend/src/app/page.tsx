'use client';

import React from 'react';
import ConduitHero from '@/components/conduit/ConduitHero';
import { Feature } from '@/components/ui/feature-section-with-bento-grid';
import WhatsAppRequirementSection from '@/components/kin/WhatsAppRequirementSection';
import PricingSection3 from '@/components/ui/pricing-section-3';
import KinFooter from '@/components/kin/KinFooter';
import ToastAlert from '@/components/ToastAlert';

export default function Home() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 104;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <main className="relative w-full min-h-screen bg-[#FFFDF8] text-[#11131A] overflow-x-hidden selection:bg-[#EAD8C6] selection:text-[#11131A]">
      {/* 1. HERO SECTION (INTACT, EXACT LUXURY DESIGN SPECIFICATION) */}
      <ConduitHero
        onExplore={() => scrollToSection('how-to-use')}
        onHowItWorks={() => scrollToSection('how-to-use')}
        onForInstitutions={() => scrollToSection('pricing')}
      />

      {/* 2. HOW TO USE KIN • BENTO GRID FEATURE SECTION */}
      <Feature />

      {/* 3. ZERO-APP WHATSAPP FLOW (VOICE NOTE, EXTRACTION, CANDIDATE MATCHES) */}
      <WhatsAppRequirementSection />

      {/* 4. NUMBERFLOW INTERACTIVE PRICING SECTION */}
      <PricingSection3 />

      {/* 5. EDITORIAL CHARCOAL FOOTER */}
      <KinFooter />


      {/* Ambient Toast Alerts */}
      <ToastAlert />

      {/* Floating Direct Access to Dashboard */}
      <div className="fixed bottom-6 right-6 z-50">
        <a
          href="/dashboard"
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#11131A] hover:bg-[#232323] text-white text-xs font-bold shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-white/10 hover:scale-105 transition-all group cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#E25C38] animate-ping" />
          <span>Launch Dashboard</span>
        </a>
      </div>
    </main>
  );
}
