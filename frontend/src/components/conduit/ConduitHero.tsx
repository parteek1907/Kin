'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import ConduitNavbar from './ConduitNavbar';
import ConstellationOverlay from './ConstellationOverlay';
import WavePanel from './WavePanel';

interface ConduitHeroProps {
  onExplore?: () => void;
  onHowItWorks?: () => void;
  onForInstitutions?: () => void;
}

export default function ConduitHero({
  onExplore,
  onHowItWorks,
  onForInstitutions
}: ConduitHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Subtle ambient parallax only on scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start']
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], ['0%', '10%']);

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative w-full min-h-[100svh] overflow-hidden bg-[#FFFDF8] select-none"
    >
      {/* =========================================================================
          LAYER 0: BACKGROUND SUNSET CAMPUS ILLUSTRATION
          object-fit: cover; object-position: right center;
          Sky bright, sun fully visible, no dark overlays.
          On mobile (<=768px): sits on top at ~36svh.
         ========================================================================= */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[20svh] md:h-full md:inset-0 w-full pointer-events-none z-0 overflow-hidden"
        style={shouldReduceMotion ? {} : { y: parallaxY }}
      >
        <div className="w-full h-full">
          <picture className="w-full h-full block">
            <source media="(min-width: 1440px)" srcSet="/Connected%20Valley%20at%20Dusk.png" type="image/png" />
            <source media="(min-width: 768px)" srcSet="/Connected%20Valley%20at%20Dusk.png" type="image/png" />
            <img
              src="/Connected%20Valley%20at%20Dusk.png"
              alt="Connected Valley at Dusk - Living Campus Proof & Intent Network"
              className="w-full h-full object-cover object-right"
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>
      </motion.div>

      {/* =========================================================================
          LAYER 1: NODE & ARC CONSTELLATION OVERLAY (SVG)
          Locks to rooftops and architectural landmarks on the illustration.
         ========================================================================= */}
      <div className="absolute top-0 left-0 right-0 h-[20svh] md:h-full md:inset-0 w-full pointer-events-none z-10 overflow-hidden">
        <ConstellationOverlay />
      </div>

      {/* =========================================================================
          LAYER 2 & 3: WHITE WAVE PANEL (2) & HERO TEXT CONTENT (3)
          Wave starts below nav at ~28% height.
          Eyebrow, Headline, Subtext, CTA, Stats share the exact same left edge.
         ========================================================================= */}
      <WavePanel onExplore={onExplore} />

      {/* =========================================================================
          LAYER 4: NAVBAR (FIXED TOP, 104px, 1fr auto 1fr GRID, LAYER 4)
         ========================================================================= */}
      <ConduitNavbar
        onExplore={onExplore}
        onHowItWorks={onHowItWorks}
        onForInstitutions={onForInstitutions}
      />
    </section>
  );
}
