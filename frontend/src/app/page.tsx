'use client';

import React from 'react';
import NexusLandingPage from '@/components/NexusLandingPage';
import WhatsAppBridgeDrawer from '@/components/WhatsAppBridgeDrawer';
import InstitutionRadarModal from '@/components/InstitutionRadarModal';
import MicroAuditModal from '@/components/MicroAuditModal';
import ToastAlert from '@/components/ToastAlert';

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#F7F5F0] text-[#141815] selection:bg-[#E25C38]/20 selection:text-[#E25C38]">
      {/* 1. Kinetic Nexus Landing Page */}
      <NexusLandingPage />

      {/* 2. Interactive WhatsApp Action Bridge Smartphone Simulator */}
      <WhatsAppBridgeDrawer />

      {/* 3. Institutional Opportunity & Skill-Gap Radar Modal */}
      <InstitutionRadarModal />

      {/* 4. 60-Second Technical Micro-Audit Modal */}
      <MicroAuditModal />

      {/* 5. Real-Time Celebration Toasts */}
      <ToastAlert />
    </main>
  );
}
