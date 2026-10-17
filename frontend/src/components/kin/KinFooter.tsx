'use client';

import React from 'react';
import { ArrowUp, Github, Shield, Sparkles } from 'lucide-react';

export default function KinFooter() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative w-full bg-[#11131A] text-[#FFFDF8] pt-20 pb-12 px-[var(--gutter)] border-t border-white/10 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto">
        
        {/* =====================================================================
            TOP ROW: BRAND & LIVE CONSENSUS TELEMETRY
           ===================================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img 
                  src="/images/kin_logo.png" 
                  alt="KIN Logo" 
                  className="w-9 h-9 object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]" 
                />
                <span 
                  style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                  className="text-[28px] font-bold tracking-[0.24em] text-white uppercase"
                >
                  KIN
                </span>
                <span className="text-[10px] font-mono tracking-widest text-[#F5C84C] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                  CAMPUS PROOF GRAPH
                </span>
              </div>

              <p 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[#9CA3AF] text-[15px] leading-relaxed max-w-md mb-8"
              >
                A living academic network that connects proven student engineering proof to real venture opportunities through trusted campus relationships.
              </p>
            </div>

            {/* Consensus Pulse Badge */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-[12px] text-[#D1D5DB] w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[11px]">154 NODES ONLINE • 412 TRUST EDGES</span>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Column 1: Network */}
            <div>
              <h4 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[12px] font-bold tracking-[0.16em] uppercase text-white mb-4"
              >
                Network
              </h4>
              <ul className="space-y-3 text-[14px] text-[#9CA3AF]">
                <li><a href="#network" className="hover:text-white transition-colors">Living Graph</a></li>
                <li><a href="#network" className="hover:text-white transition-colors">Verified Nodes</a></li>
                <li><a href="#network" className="hover:text-white transition-colors">Intent Capsules</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Trust Ledger</a></li>
              </ul>
            </div>

            {/* Column 2: Platform */}
            <div>
              <h4 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[12px] font-bold tracking-[0.16em] uppercase text-white mb-4"
              >
                Platform
              </h4>
              <ul className="space-y-3 text-[14px] text-[#9CA3AF]">
                <li><a href="#network" className="hover:text-white transition-colors">Zero-Form Ingest</a></li>
                <li><a href="#network" className="hover:text-white transition-colors">Faculty Bridges</a></li>
                <li><a href="#network" className="hover:text-white transition-colors">WhatsApp Gateway</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing & Access</a></li>
              </ul>
            </div>

            {/* Column 3: Institutional */}
            <div className="col-span-2 sm:col-span-1">
              <h4 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[12px] font-bold tracking-[0.16em] uppercase text-white mb-4"
              >
                Governance
              </h4>
              <ul className="space-y-3 text-[14px] text-[#9CA3AF]">
                <li><span className="hover:text-white transition-colors cursor-pointer">Data Sovereignty</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Zero-Knowledge Vouching</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Privacy & Consent</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span></li>
              </ul>
            </div>

          </div>

        </div>

        {/* =====================================================================
            BOTTOM ROW: COPYRIGHT & BACK TO TOP
           ===================================================================== */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[13px] text-[#9CA3AF]">
          <div>
            © 2026 KIN Living Network. Designed for universities and builder ecosystems.
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-2 text-white hover:text-[#F5C84C] transition-colors py-1 focus:outline-none"
            aria-label="Back to top"
          >
            <span className="text-[12px] font-bold tracking-[0.10em] uppercase">Back to Top</span>
            <ArrowUp className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

      </div>
    </footer>
  );
}
