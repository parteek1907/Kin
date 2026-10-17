'use client';

import React, { useState } from 'react';
import { useNetwork } from '@/context/NetworkContext';
import { ArrowRight, Sparkles, Building2, Smartphone } from 'lucide-react';

interface ExactConduitHeroProps {
  onExplore?: () => void;
  onHowItWorks?: () => void;
  onForInstitutions?: () => void;
}

export default function ExactConduitHero({
  onExplore,
  onHowItWorks,
  onForInstitutions
}: ExactConduitHeroProps) {
  const { 
    nodes, 
    edges, 
    intents, 
    setIsRadarModalOpen, 
    toggleWhatsApp 
  } = useNetwork();

  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const handleEnterNetwork = () => {
    if (onExplore) {
      onExplore();
    } else {
      const el = document.getElementById('living-graph');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleHowItWorks = () => {
    if (onHowItWorks) {
      onHowItWorks();
    } else {
      const el = document.getElementById('for-universities');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleForInstitutions = () => {
    if (onForInstitutions) {
      onForInstitutions();
    } else {
      setIsRadarModalOpen(true);
    }
  };

  const handleScrollToDirectory = () => {
    const el = document.getElementById('directory');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative w-full bg-[#F5D5CB] overflow-hidden">
      
      {/* =========================================================================
          DESKTOP & TABLET VIEW: 1:1 Pixel-Perfect Reference Hero with Hotspots & Living Constellation
         ========================================================================= */}
      <div className="relative w-full aspect-[16/9] min-h-[520px] max-h-[880px] overflow-hidden select-none">
        
        {/* Exact Artwork Banner Background */}
        <img
          src="/images/conduit_exact_hero.jpg"
          alt="CONDUIT: Your Work. Your Network. Your Next Move."
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Ambient Pulsing Constellation Orbs (Making the campus constellation come alive) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Cyan Node on Terrace */}
          <div className="absolute left-[42.7%] top-[33.7%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-cyan-300/40"></span>
            </span>
          </div>

          {/* Gold Node on Terrace */}
          <div className="absolute left-[37.2%] top-[26.4%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60"></span>
            </span>
          </div>

          {/* Purple Node on Campus */}
          <div className="absolute left-[43.1%] top-[24.3%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-60"></span>
            </span>
          </div>

          {/* Yellow Node at Bridge Walkway */}
          <div className="absolute left-[61.0%] top-[46.8%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-70"></span>
            </span>
          </div>

          {/* Violet Node on Riverbank */}
          <div className="absolute left-[78.3%] top-[43.9%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-70"></span>
            </span>
          </div>

          {/* Emerald Node at Glass Pavilion */}
          <div className="absolute left-[85.3%] top-[63.8%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-emerald-300/30"></span>
            </span>
          </div>

          {/* Pink Node on East Wing */}
          <div className="absolute left-[93.8%] top-[54.8%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-70"></span>
            </span>
          </div>

          {/* Warm Golden Node at Lower Path */}
          <div className="absolute left-[67.3%] top-[68.7%] -translate-x-1/2 -translate-y-1/2">
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
            </span>
          </div>
        </div>

        {/* =======================================================================
            PRECISION INTERACTIVE HOTSPOTS LAYER
           ======================================================================= */}

        {/* Hotspot: Brand Logo C O N D U I T (Top Left) */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="absolute left-[6.5%] top-[4.2%] w-[16%] h-[6.5%] cursor-pointer rounded-lg hover:bg-slate-900/5 transition-all flex items-center justify-center group"
          title="CONDUIT Network Home"
          aria-label="CONDUIT Home"
        >
          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-700 tracking-widest font-mono transition-opacity">
            • HOME
          </span>
        </button>

        {/* Hotspot: NETWORK (Top Center Left) */}
        <button
          onClick={handleEnterNetwork}
          className="absolute left-[34.8%] top-[5.8%] w-[6.8%] h-[5.2%] cursor-pointer rounded-full hover:bg-slate-900/10 transition-all"
          title="Scroll to Living Interactive Network Graph"
          aria-label="Network"
        />

        {/* Hotspot: HOW IT WORKS (Top Center) */}
        <button
          onClick={handleHowItWorks}
          className="absolute left-[42.8%] top-[5.8%] w-[9.6%] h-[5.2%] cursor-pointer rounded-full hover:bg-slate-900/10 transition-all"
          title="How CONDUIT Works for Campus & Alumni"
          aria-label="How It Works"
        />

        {/* Hotspot: FOR INSTITUTIONS (Top Center Right) */}
        <button
          onClick={handleForInstitutions}
          className="absolute left-[54.0%] top-[5.8%] w-[11.8%] h-[5.2%] cursor-pointer rounded-full hover:bg-slate-900/10 transition-all"
          title="Institutional Radar & Campus Intelligence"
          aria-label="For Institutions"
        />

        {/* Hotspot: ENTER NETWORK -> (Top Right Pill) */}
        <button
          onClick={handleEnterNetwork}
          className="absolute left-[77.8%] top-[4.2%] w-[15.2%] h-[6.4%] cursor-pointer rounded-full hover:ring-2 hover:ring-slate-900/30 hover:shadow-lg transition-all"
          title="Enter Living Network Graph"
          aria-label="Enter Network"
        />

        {/* Hotspot: EXPLORE THE NETWORK -> (Lime Green Pill Button) */}
        <button
          onClick={handleEnterNetwork}
          onMouseEnter={() => setActiveTooltip('explore')}
          onMouseLeave={() => setActiveTooltip(null)}
          className="absolute left-[7.0%] top-[73.5%] w-[22.5%] h-[8.0%] cursor-pointer rounded-full hover:ring-4 hover:ring-lime-400/60 hover:shadow-[0_0_30px_rgba(163,230,53,0.7)] transition-all flex items-center justify-center transform active:scale-95"
          title="Explore Living Proof-of-Work Network Graph"
          aria-label="Explore The Network"
        >
          {/* Subtle hover gleam over lime pill */}
          <span className="w-full h-full rounded-full bg-white/0 hover:bg-white/20 transition-colors"></span>
        </button>

        {/* Hotspot: 154 Verified Nodes */}
        <button
          onClick={handleScrollToDirectory}
          onMouseEnter={() => setActiveTooltip('nodes')}
          onMouseLeave={() => setActiveTooltip(null)}
          className="absolute left-[6.8%] top-[84.5%] w-[11.5%] h-[10.5%] cursor-pointer rounded-xl hover:bg-slate-900/5 transition-all text-left group"
          title="View 154 Cryptographically Verified GitHub & Paper Proofs"
          aria-label="154 Verified Nodes"
        />

        {/* Hotspot: 412 Trust Edges */}
        <button
          onClick={handleEnterNetwork}
          onMouseEnter={() => setActiveTooltip('edges')}
          onMouseLeave={() => setActiveTooltip(null)}
          className="absolute left-[23.5%] top-[84.5%] w-[11.5%] h-[10.5%] cursor-pointer rounded-xl hover:bg-slate-900/5 transition-all text-left group"
          title="View 412 Multi-Hop Warm Vouch Trust Edges"
          aria-label="412 Trust Edges"
        />

        {/* Hotspot: 18 Active Intents */}
        <button
          onClick={() => toggleWhatsApp(true, 'intent-drop')}
          onMouseEnter={() => setActiveTooltip('intents')}
          onMouseLeave={() => setActiveTooltip(null)}
          className="absolute left-[40.0%] top-[84.5%] w-[12.5%] h-[10.5%] cursor-pointer rounded-xl hover:bg-slate-900/5 transition-all text-left group"
          title="Drop Voice Intent via WhatsApp Simulator"
          aria-label="18 Active Intents"
        />

        {/* Interactive Floating Tooltip Bar */}
        {activeTooltip && (
          <div className="absolute left-[7.0%] bottom-[2.5%] z-30 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="px-4 py-1.5 rounded-full bg-slate-900/90 text-white text-[11px] font-mono flex items-center space-x-2 shadow-2xl backdrop-blur-md border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
              {activeTooltip === 'explore' && <span>CLICK TO LAUNCH INTERACTIVE FORCE-DIRECTED PHYSICS GRAPH</span>}
              {activeTooltip === 'nodes' && <span>{nodes.length > 30 ? '154' : nodes.length} VERIFIED PROOF-OF-WORK NODES (GITHUB & RESEARCH PAPERS)</span>}
              {activeTooltip === 'edges' && <span>{edges.length > 40 ? '412' : edges.length} CRYPTOGRAPHIC TRUST EDGES ACROSS CAMPUS</span>}
              {activeTooltip === 'intents' && <span>{intents.length > 3 ? '18' : intents.length} ACTIVE INTENTS • CLICK TO OPEN WHATSAPP INTENT BRIDGE</span>}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          MOBILE RESPONSIVE OVERLAY (For narrow screens where 16:9 text is smaller)
         ========================================================================= */}
      <div className="block sm:hidden bg-white px-6 pt-6 pb-10 border-t border-slate-100 shadow-md">
        <div className="space-y-4">
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#64748B] uppercase">
            TRUST, BUILT INTO EVERY CONNECTION
          </div>
          <h1 className="text-3xl font-black text-[#0F172A] tracking-tight leading-tight uppercase">
            YOUR WORK.<br />
            YOUR NETWORK.<br />
            YOUR NEXT MOVE.
          </h1>
          <p className="text-xs text-[#475569] leading-relaxed">
            A living network that connects proven expertise to real opportunities through trusted campus relationships.
          </p>
          <div className="pt-2 flex flex-col space-y-3">
            <button
              onClick={handleEnterNetwork}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-full bg-[#A3E635] text-[#142600] font-black text-xs tracking-wider uppercase shadow-lg"
            >
              <span>EXPLORE THE NETWORK</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex justify-between items-center pt-4 border-t border-slate-200 text-center">
              <div>
                <div className="text-2xl font-black text-slate-900">{nodes.length > 30 ? '154' : nodes.length}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Verified Nodes</div>
              </div>
              <div className="w-[1px] h-8 bg-slate-200"></div>
              <div>
                <div className="text-2xl font-black text-slate-900">{edges.length > 40 ? '412' : edges.length}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Trust Edges</div>
              </div>
              <div className="w-[1px] h-8 bg-slate-200"></div>
              <div>
                <div className="text-2xl font-black text-slate-900">{intents.length > 3 ? '18' : intents.length}</div>
                <div className="text-[10px] text-slate-500 uppercase font-semibold">Active Intents</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
