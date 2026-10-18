'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ConduitHero from '@/components/conduit/ConduitHero';
import { Feature } from '@/components/ui/feature-section-with-bento-grid';
import PricingSection3 from '@/components/ui/pricing-section-3';

import KinFooter from '@/components/kin/KinFooter';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const router = useRouter();

  const handleEnterNetwork = () => {
    if (isLoggedIn || user) {
      const roleParam =
        user?.userType === 'professional' || user?.role?.toLowerCase().includes('alumni')
          ? 'alumni'
          : 'student';
      router.push(`/dashboard?role=${roleParam}`);
    } else {
      openAuthModal();
    }
  };

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
        onEnterNetwork={handleEnterNetwork}
      />

      {/* 2. HOW TO USE KIN • BENTO GRID FEATURE SECTION */}
      <Feature />

      {/* 3. NUMBERFLOW INTERACTIVE PRICING SECTION */}
      <PricingSection3 />

      {/* 5. EDITORIAL CHARCOAL FOOTER */}
      <KinFooter />
    </main>
  );
}

