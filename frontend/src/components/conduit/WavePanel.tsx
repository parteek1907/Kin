import React from 'react';
import Link from 'next/link';

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
          Lower-left anchored with generous whitespace and open typography tracking.
          Strict Left Edge parity: Logo, Eyebrow, Headline, Subtext.
         ========================================================================= */}
      <div 
        id="hero-content"
        className="relative md:absolute md:inset-0 z-30 w-full flex flex-col justify-end min-h-[100svh] px-[var(--gutter)] pt-[calc(20svh+12px)] md:pt-0 pb-8 md:pb-12 lg:pb-14 pointer-events-none"
      >
        <div className="w-full flex flex-col items-start pointer-events-auto">
          
          {/* 1. EYEBROW: 13px, uppercase, spacious tracking 0.26em, warm grey */}
          <div id="hero-eyebrow" className="mb-4 md:mb-6">
            <span 
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              className="text-[12px] md:text-[13px] font-bold tracking-[0.26em] text-[#8A829A] uppercase select-none block leading-none"
            >
              TRUST, BUILT INTO EVERY CONNECTION
            </span>
          </div>

          {/* 2. HEADLINE: open letter-spacing (tracking 0.055em), leading 1.05, uppercase */}
          <h1 
            id="hero-headline"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
            className="text-[clamp(26px,6.2vw,36px)] md:text-[clamp(40px,3.7vw,74px)] font-extrabold text-[#11131A] leading-[1.05] tracking-[0.055em] uppercase select-none mb-6 md:mb-8"
          >
            {HEADLINE_LINES.map((line) => (
              <span key={line} className="block whitespace-nowrap">
                {line}
              </span>
            ))}
          </h1>

          {/* 3. SUBTEXT: comfortable tracking 0.025em, relaxed leading 1.7, filling lower-left quadrant */}
          <p
            id="hero-subtext"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            className="text-[#4A4B53] text-[15px] sm:text-[17px] md:text-[20px] font-normal leading-[1.6] md:leading-[1.7] tracking-[0.025em] max-w-[580px] md:max-w-[640px] mb-8"
          >
            A living network that connects proven expertise to real opportunities through trusted campus relationships.
          </p>

          {/* 4. ACTIONS: Primary Enter Network CTA (Direct to Dashboard) + Secondary "Chat on WhatsApp" */}
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              className="h-[50px] px-8 rounded-xl bg-[#11131A] text-white font-bold text-[12px] tracking-[0.14em] uppercase transition-all duration-200 hover:bg-black active:scale-[0.98] shadow-lg flex items-center justify-center cursor-pointer"
            >
              <span>ENTER NETWORK</span>
            </Link>

            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WA_BUSINESS_NUMBER || '919811022678'}?text=${encodeURIComponent('Hi KIN, I need…')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              className="h-[50px] px-7 rounded-xl bg-white/80 hover:bg-white text-[#11131A] border border-black/10 hover:border-black/20 font-bold text-[12px] tracking-[0.14em] uppercase transition-all duration-200 shadow-sm flex items-center justify-center hover:shadow-md cursor-pointer group"
            >
              <span>CHAT ON WHATSAPP</span>
            </a>
          </div>


        </div>
      </div>
    </>
  );
}
