'use client';

import React from 'react';
import CountUpNumber from './CountUpNumber';

interface WavePanelProps {
  onExplore?: () => void;
}

const HEADLINE_LINES = [
  'YOUR WORK.',
  'YOUR NETWORK.',
  'YOUR NEXT MOVE.'
];

export default function WavePanel({ onExplore }: WavePanelProps) {
  return (
    <>
      {/* =========================================================================
          LAYER 2: ORGANIC WHITE WAVE PANEL (SEAMLESS LUXURY BLEND, ZERO GREY LINES)
          Graceful flowing S-curve entering below navbar, sweeping around campus.
          Multi-stage warm dusk ambient shadow + soft silk feathering + champagne rim light.
         ========================================================================= */}
      <div 
        id="wave-panel-layer"
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-hidden"
        aria-hidden="true"
      >
        {/* DESKTOP & TABLET WAVE (>= 768px: 1920, 1440, 1280, 1024) */}
        <svg
          viewBox="0 0 1920 1080"
          preserveAspectRatio="none"
          className="hidden md:block w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Multi-stage warm dusk ambient occlusion shadow */}
            <filter id="waveAmbientBlend" x="-20%" y="-20%" width="140%" height="140%">
              {/* Crisp contact shadow */}
              <feDropShadow dx="-2" dy="5" stdDeviation="10" floodColor="#22120A" floodOpacity="0.08" />
              {/* Broad atmospheric dusk diffusion */}
              <feDropShadow dx="-6" dy="18" stdDeviation="30" floodColor="#180B06" floodOpacity="0.06" />
            </filter>

            {/* Feathered soft edge diffusion filter for silky seamless blend */}
            <filter id="silkFeather" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3.0" result="feather" />
            </filter>

            {/* Sunlit champagne rim gradient reflecting warm valley dusk lighting */}
            <linearGradient id="champagneRimGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#F5EADE" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#EAD8C6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
            </linearGradient>

            {/* Subtle warm ivory gradient for the architectural wave canvas */}
            <linearGradient id="waveIvoryFill" x1="0%" y1="0%" x2="85%" y2="100%">
              <stop offset="0%" stopColor="#FFFDF9" />
              <stop offset="65%" stopColor="#FFFDF8" />
              <stop offset="100%" stopColor="#FAF7F0" />
            </linearGradient>
          </defs>

          {/* Primary Sculpted Ivory Wave Panel Body
              Graceful continuous organic S-curve with zero corner bends.
              Flows like liquid silk across the valley landscape. */}
          <path
            id="wave-panel-path"
            d="
              M 0,250 
              C 350,240 650,250 850,300 
              C 960,340 1040,440 1080,560 
              C 1120,680 1160,800 1280,880 
              C 1400,950 1620,970 1920,965 
              L 1920,1080 
              L 0,1080 
              Z
            "
            fill="url(#waveIvoryFill)"
            filter="url(#waveAmbientBlend)"
          />

          {/* Silky soft feathered translucent edge for seamless integration into the dusk photo */}
          <path
            d="
              M 0,250 
              C 350,240 650,250 850,300 
              C 960,340 1040,440 1080,560 
              C 1120,680 1160,800 1280,880 
              C 1400,950 1620,970 1920,965
            "
            fill="none"
            stroke="#FFFDF8"
            strokeWidth="5"
            opacity="0.55"
            filter="url(#silkFeather)"
          />

          {/* Delicate 1.2px champagne rim light accent catching low evening sunlight */}
          <path
            d="
              M 0,250 
              C 350,240 650,250 850,300 
              C 960,340 1040,440 1080,560 
              C 1120,680 1160,800 1280,880 
              C 1400,950 1620,970 1920,965
            "
            fill="none"
            stroke="url(#champagneRimGlow)"
            strokeWidth="1.2"
            opacity="0.85"
          />
        </svg>

        {/* MOBILE WAVE (< 768px: e.g. 390x844) */}
        <div className="block md:hidden absolute top-[20svh] -mt-8 left-0 right-0 w-full h-14 pointer-events-none">
          <svg
            viewBox="0 0 390 60"
            preserveAspectRatio="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="mobileWaveShadow" x="-10%" y="-10%" width="125%" height="125%">
                <feDropShadow dx="0" dy="4" stdDeviation="10" floodColor="#241710" floodOpacity="0.08" />
              </filter>
            </defs>
            <path
              d="M 0,35 C 100,8 200,52 300,20 C 345,8 375,25 390,15 L 390,60 L 0,60 Z"
              fill="#FFFDF8"
              filter="url(#mobileWaveShadow)"
            />
          </svg>
        </div>
        <div className="block md:hidden absolute top-[calc(20svh+16px)] inset-x-0 bottom-0 bg-[#FFFDF8]" />
      </div>

      {/* =========================================================================
          LAYER 3: HERO CONTENT AND VERTICAL RHYTHM
          Optimized lower-left placement, generous white space utilization.
          Strict Left Edge parity: Logo, Eyebrow, Headline, Subtext, Stats.
          Grounded with balanced lower-left anchoring: pb-14 md:pb-20.
         ========================================================================= */}
      <div 
        id="hero-content"
        className="relative md:absolute md:inset-0 z-30 w-full flex flex-col justify-end min-h-[100svh] px-[var(--gutter)] pt-[calc(20svh+12px)] md:pt-0 pb-14 md:pb-20 pointer-events-none"
      >
        <div className="w-full flex flex-col items-start pointer-events-auto">
          
          {/* 1. EYEBROW: 13px, uppercase, tracking 0.2em, warm grey */}
          <div id="hero-eyebrow" className="mb-3 md:mb-5">
            <span 
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              className="text-[12px] md:text-[13px] font-bold tracking-[0.2em] text-[#8A829A] uppercase select-none block leading-none"
            >
              TRUST, BUILT INTO EVERY CONNECTION
            </span>
          </div>

          {/* 2. HEADLINE: authoritative, weight 800, line-height 0.95, uppercase. 3 lines. */}
          <h1 
            id="hero-headline"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className="text-[clamp(28px,6.8vw,38px)] md:text-[clamp(44px,4.3vw,84px)] font-extrabold text-[#11131A] leading-[0.95] tracking-[-0.025em] uppercase select-none mb-4 md:mb-7"
          >
            {HEADLINE_LINES.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </h1>

          {/* 3. SUBTEXT: max-width 520px, 21px, line-height 1.5, flowing naturally into stats */}
          <p
            id="hero-subtext"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            className="text-[#4A4B53] text-[15px] sm:text-[17px] md:text-[21px] font-normal leading-[1.4] md:leading-[1.5] max-w-[520px] mb-8 md:mb-14"
          >
            A living network that connects proven expertise to real opportunities through trusted campus relationships.
          </p>

          {/* 4. STATS: 3 equal columns, 40px padding on desktop (none on left of first), 1px dividers, bold numbers */}
          <div id="hero-stats" className="flex items-center select-none">
            {/* Column 1: Verified Nodes (left padding 0, right padding 40px on desktop) */}
            <div id="stat-col-1" className="flex flex-col pr-3.5 md:pr-10">
              <div 
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-[26px] sm:text-[34px] md:text-[48px] font-bold text-[#11131A] leading-none tracking-tight"
              >
                <CountUpNumber target={154} duration={1.2} />
              </div>
              <div 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[10px] md:text-[12px] font-semibold tracking-[0.16em] text-[#686875] uppercase mt-1.5 md:mt-2.5 whitespace-nowrap"
              >
                VERIFIED NODES
              </div>
            </div>

            {/* 1px Divider (48px tall on desktop, vertically centered) */}
            <div className="w-px h-7 md:h-12 bg-[#E5E0D8] self-center shrink-0" aria-hidden="true" />

            {/* Column 2: Trust Edges (padding 40px on desktop) */}
            <div id="stat-col-2" className="flex flex-col px-3.5 md:px-10">
              <div 
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-[26px] sm:text-[34px] md:text-[48px] font-bold text-[#11131A] leading-none tracking-tight"
              >
                <CountUpNumber target={412} duration={1.4} />
              </div>
              <div 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[10px] md:text-[12px] font-semibold tracking-[0.16em] text-[#686875] uppercase mt-1.5 md:mt-2.5 whitespace-nowrap"
              >
                TRUST EDGES
              </div>
            </div>

            {/* 1px Divider (48px tall on desktop, vertically centered) */}
            <div className="w-px h-7 md:h-12 bg-[#E5E0D8] self-center shrink-0" aria-hidden="true" />

            {/* Column 3: Active Intents (padding 40px on desktop) */}
            <div id="stat-col-3" className="flex flex-col px-3.5 md:px-10">
              <div 
                style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
                className="text-[26px] sm:text-[34px] md:text-[48px] font-bold text-[#11131A] leading-none tracking-tight"
              >
                <CountUpNumber target={18} duration={1.0} />
              </div>
              <div 
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                className="text-[10px] md:text-[12px] font-semibold tracking-[0.16em] text-[#686875] uppercase mt-1.5 md:mt-2.5 whitespace-nowrap"
              >
                ACTIVE INTENTS
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
