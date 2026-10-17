'use client';

import React from 'react';
import NexusLandingPage from '@/components/NexusLandingPage';
import WhatsAppBridgeDrawer from '@/components/WhatsAppBridgeDrawer';
import IngestArtifactModal from '@/components/IngestArtifactModal';
import InstitutionRadarModal from '@/components/InstitutionRadarModal';
import MicroAuditModal from '@/components/MicroAuditModal';
import ToastAlert from '@/components/ToastAlert';
import NodeEvidenceDrawer from '@/components/NodeEvidenceDrawer';

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-[#030509] text-slate-100">
      {/* 1. Kinetic Nexus Landing Page */}
      <NexusLandingPage />

      {/* 2. Interactive Right Floating Evidence Drawer (when node selected in graph) */}
      <NodeEvidenceDrawer />

      {/* 3. The Killer Feature: Interactive WhatsApp Action Bridge Smartphone Simulator */}
      <WhatsAppBridgeDrawer />

      {/* 4. Zero-Form Artifact Ingestion Modal */}
      <IngestArtifactModal />

      {/* 5. Institutional Opportunity & Skill-Gap Radar Modal */}
      <InstitutionRadarModal />

      {/* 6. 60-Second Technical Micro-Audit Modal */}
      <MicroAuditModal />

      {/* 7. Real-Time Celebration Toasts */}
      <ToastAlert />
    </main>
  );
}
