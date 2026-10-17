import React from 'react';

interface WavePanelProps {

  onExplore?: () => void;
  onEnterNetwork?: () => void;
}

const HEADLINE_LINES = [
  'YOUR WORK.',
  'YOUR NETWORK.',
  'YOUR NEXT MOVE.'
];

export default function WavePanel({ onExplore, onEnterNetwork }: WavePanelProps) {
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
        className="relative md:absolute md:inset-0 z-30 w-full flex flex-col justify-end min-h-[100svh] px-[var(--gutter)] pt-[calc(20svh+12px)] md:pt-0 pb-6 md:pb-8 lg:pb-10 pointer-events-none"
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

          {/* 3. SUBTEXT: comfortable tracking 0.025em, relaxed leading 1.75, filling lower-left quadrant */}
          <p
            id="hero-subtext"
            style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            className="text-[#4A4B53] text-[16px] sm:text-[18px] md:text-[21px] font-normal leading-[1.65] md:leading-[1.75] tracking-[0.025em] max-w-[620px] md:max-w-[700px] mb-2"
          >
            A living network that connects proven expertise to real opportunities through trusted campus relationships.
          </p>

          {/* 4. HERO CTA ACTIONS: START NETWORKING & HOW IT WORKS */}
          <div id="hero-actions" className="mt-6 md:mt-8 flex flex-wrap items-center gap-3.5 sm:gap-4 pointer-events-auto">
            <button
              id="hero-start-networking-btn"
              onClick={() => onEnterNetwork && onEnterNetwork()}
              style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
              className="group relative inline-flex items-center justify-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-[#11131A] text-[#FFFDF8] hover:bg-[#252833] font-bold text-[13px] sm:text-[14px] tracking-[0.14em] uppercase transition-all duration-300 shadow-[0_10px_30px_rgba(17,19,26,0.18)] hover:shadow-[0_15px_35px_rgba(17,19,26,0.25)] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer select-none"
            >
              <span>START NETWORKING</span>
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
            <button
              onClick={() => onExplore && onExplore()}
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-black/5 hover:bg-black/10 text-[#11131A] font-bold text-[12px] sm:text-[13px] tracking-[0.1em] uppercase transition-colors cursor-pointer select-none"
            >
              <span>HOW IT WORKS</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
