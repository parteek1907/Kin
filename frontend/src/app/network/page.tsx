'use client';

import React from 'react';
import ConduitNavbar from '@/components/conduit/ConduitNavbar';
import KinNetworkSection from '@/components/kin/KinNetworkSection';
import KinFooter from '@/components/kin/KinFooter';
import ToastAlert from '@/components/ToastAlert';

export default function NetworkPage() {
  return (
    <main className="relative w-full min-h-screen bg-[#FFFDF8] text-[#11131A] overflow-x-hidden selection:bg-[#EAD8C6] selection:text-[#11131A]">
      {/* Top Navbar */}
      <ConduitNavbar />

      {/* Spacer for 104px fixed navbar */}
      <div className="h-[104px] w-full" aria-hidden="true" />

      {/* Network / How It Works Section */}
      <KinNetworkSection />

      {/* Footer */}
      <KinFooter />

      {/* Toast Alert */}
      <ToastAlert />
    </main>
  );
}
