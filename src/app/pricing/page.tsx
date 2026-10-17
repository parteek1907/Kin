'use client';

import React from 'react';
import ConduitNavbar from '@/components/conduit/ConduitNavbar';
import KinPricingSection from '@/components/kin/KinPricingSection';
import KinFooter from '@/components/kin/KinFooter';
import ToastAlert from '@/components/ToastAlert';

export default function PricingPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#FAF7F0] text-[#11131A] overflow-x-hidden selection:bg-[#EAD8C6] selection:text-[#11131A]">
      {/* Top Navbar */}
      <ConduitNavbar />

      {/* Spacer for 104px fixed navbar */}
      <div className="h-[104px] w-full" aria-hidden="true" />

      {/* Pricing Section */}
      <KinPricingSection />

      {/* Footer */}
      <KinFooter />

      {/* Toast Alert */}
      <ToastAlert />
    </main>
  );
}
