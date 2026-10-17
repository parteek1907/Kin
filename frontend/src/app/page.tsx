'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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

      {/* Floating Direct Access to Dashboard */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-[#141815] hover:bg-[#232323] text-white text-xs font-bold shadow-[0_10px_30px_rgba(0,0,0,0.25)] border border-white/10 hover:scale-105 transition-all group cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-[#E25C38] animate-ping" />
          <span>Launch Glassmorphic Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#E25C38] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

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
