/**
 * CONDUIT Design Tokens
 * Single source of truth for colors, typography, spacing (8px scale), and motion.
 */

export const tokens = {
  colors: {
    // Brand & Palette (Strict Spec)
    brand: '#11131A',
    background: '#FFFDF8',
    panelBg: '#FFFDF8',
    sky: '#F3C9C1',
    border: 'rgba(0, 0, 0, 0.08)',
    
    // Primary Accent
    lime: '#B5E747',
    limeHover: '#A4D838',
    limeActive: '#93C72A',
    limeText: '#11131A',
    
    // Neutrals & Editorial Typography
    textHeadline: '#11131A',
    textEyebrow: '#8A829A',
    textSubtext: '#686875',
    textMuted: '#8A829A',
    divider: '#E5E0D8',
    
    // Constellation Nodes & Arcs
    nodes: {
      cyan: '#06B6D4',
      purple: '#8A829A',
      gold: '#F5C84C',
      green: '#10B981',
      pink: '#F43F5E',
      amber: '#F59E0B'
    },
    
    // Arcs
    arcStroke: 'rgba(245, 200, 76, 0.65)',
    arcGlow: 'rgba(245, 200, 76, 0.25)'
  },
  
  // Spacing Scale
  spacing: {
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    7: '56px',
    8: '64px',
    10: '80px',
    12: '96px',
    15: '120px',
    desktopSidePadding: '7.5%'
  },
  
  // Typography
  typography: {
    fonts: {
      headline: "var(--font-headline, 'Plus Jakarta Sans', 'Outfit', sans-serif)",
      body: "var(--font-body, 'Inter', system-ui, sans-serif)",
      mono: "var(--font-mono, 'JetBrains Mono', monospace)"
    },
    lineHeights: {
      headline: '1.04',
      body: '1.55',
      tight: '1.1'
    },
    letterSpacing: {
      wordmark: '0.18em',
      tagline: '0.16em',
      nav: '0.10em',
      eyebrow: '0.18em',
      cta: '0.06em',
      stats: '0.04em'
    }
  },
  
  // GPU-Accelerated Animation Easings & Timings
  motion: {
    ease: [0.16, 1, 0.3, 1] as const,
    durationHeadline: 0.7,
    staggerDelay: 0.1,
    parallaxFactor: 0.15
  }
} as const;

export type DesignTokens = typeof tokens;

