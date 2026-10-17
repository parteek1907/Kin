'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface NodeData {
  id: string;
  cx: number;
  cy: number;
  r: number;
  delay: number;
  duration: number;
  name: string;
}

// Architectural landmark coordinates mapped onto Connected Valley at Dusk (viewBox 0 0 1916 821)
// Every node is grounded on physical architecture: spires, roofs, porticos, viaduct arches, terraces
// Monochromatic luxury editorial palette: pearl white, warm champagne accents
const CONSTELLATION_NODES: NodeData[] = [
  {
    id: 'node-campus-west',
    cx: 1293,
    cy: 502,
    r: 4.0,
    delay: 0.2,
    duration: 3.4,
    name: 'West Hillside Terrace'
  },
  {
    id: 'node-wing-roof',
    cx: 1376,
    cy: 471,
    r: 4.5,
    delay: 0.5,
    duration: 3.6,
    name: 'Quad West Wing Roof'
  },
  {
    id: 'node-clock-spire',
    cx: 1440,
    cy: 388,
    r: 4.0,
    delay: 0.8,
    duration: 3.2,
    name: 'Clock Tower Spire'
  },
  {
    id: 'node-clock-face',
    cx: 1441,
    cy: 430,
    r: 5.0,
    delay: 0.3,
    duration: 3.8,
    name: 'Clock Tower Lantern'
  },
  {
    id: 'node-viaduct-west',
    cx: 1506,
    cy: 502,
    r: 4.5,
    delay: 0.7,
    duration: 3.5,
    name: 'Stone Viaduct West Pier'
  },
  {
    id: 'node-viaduct-east',
    cx: 1582,
    cy: 509,
    r: 4.5,
    delay: 1.0,
    duration: 3.3,
    name: 'Stone Viaduct East Pier'
  },
  {
    id: 'node-water-hall',
    cx: 1635,
    cy: 532,
    r: 4.5,
    delay: 0.4,
    duration: 3.7,
    name: 'East Riverfront Hall'
  },
  {
    id: 'node-colonnade-roof',
    cx: 1711,
    cy: 570,
    r: 4.5,
    delay: 0.9,
    duration: 3.4,
    name: 'Colonnade Northwest Roof'
  },
  {
    id: 'node-colonnade-portico',
    cx: 1787,
    cy: 601,
    r: 5.2,
    delay: 0.6,
    duration: 4.0,
    name: 'Grand Colonnade Portico'
  },
  {
    id: 'node-colonnade-east',
    cx: 1863,
    cy: 547,
    r: 4.0,
    delay: 1.1,
    duration: 3.2,
    name: 'Colonnade East Wing'
  },
  {
    id: 'node-lower-terrace',
    cx: 1688,
    cy: 654,
    r: 4.5,
    delay: 0.4,
    duration: 3.6,
    name: 'Founders Lower Terrace'
  }
];

// Arcs connecting the physical landmark nodes with sweeping quadratic bezier curves
interface ArcPath {
  id: string;
  d: string;
  duration: number;
}

const CONSTELLATION_ARCS: ArcPath[] = [
  {
    id: 'arc-1',
    d: 'M 1293 502 Q 1335 480 1376 471',
    duration: 4.2
  },
  {
    id: 'arc-2',
    d: 'M 1376 471 Q 1405 440 1440 388',
    duration: 4.0
  },
  {
    id: 'arc-3',
    d: 'M 1440 388 L 1441 430',
    duration: 2.8
  },
  {
    id: 'arc-4',
    d: 'M 1441 430 Q 1475 460 1506 502',
    duration: 4.5
  },
  {
    id: 'arc-5',
    d: 'M 1506 502 Q 1544 515 1582 509',
    duration: 4.4
  },
  {
    id: 'arc-6',
    d: 'M 1582 509 Q 1608 518 1635 532',
    duration: 3.8
  },
  {
    id: 'arc-7',
    d: 'M 1635 532 Q 1672 548 1711 570',
    duration: 4.6
  },
  {
    id: 'arc-8',
    d: 'M 1711 570 Q 1750 582 1787 601',
    duration: 4.2
  },
  {
    id: 'arc-9',
    d: 'M 1787 601 Q 1825 570 1863 547',
    duration: 4.0
  },
  {
    id: 'arc-10',
    d: 'M 1711 570 Q 1695 615 1688 654',
    duration: 3.6
  },
  {
    id: 'arc-11',
    d: 'M 1688 654 Q 1740 640 1787 601',
    duration: 4.8
  }
];

export default function ConstellationOverlay() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-hidden">
      <svg
        viewBox="0 0 1916 821"
        preserveAspectRatio="xMaxYMid slice"
        className="w-full h-full"
      >
        <defs>
          {/* Subtle Ambient Node Glow Filter */}
          <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Monochromatic Luminous Champagne Arc Gradient */}
          <linearGradient id="monochromeArc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="50%" stopColor="#EDE3D2" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.55" />
          </linearGradient>

          {/* Delicate Particle Glow Filter */}
          <filter id="particleGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
          </filter>
        </defs>

        {/* =====================================================================
            1. MONOCHROMATIC EDITORIAL ARCS (Fine, ethereal, minimal)
           ===================================================================== */}
        <g className="constellation-arcs">
          {CONSTELLATION_ARCS.map((arc, index) => (
            <React.Fragment key={arc.id}>
              {/* Outer faint architectural guide */}
              <motion.path
                d={arc.d}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2.2,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1]
                }}
              />

              {/* Main crisp minimal luminous arc */}
              <motion.path
                id={`path-${arc.id}`}
                d={arc.d}
                fill="none"
                stroke="url(#monochromeArc)"
                strokeWidth="1.1"
                strokeLinecap="round"
                initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 2.0,
                  delay: index * 0.12,
                  ease: [0.16, 1, 0.3, 1]
                }}
              />

              {/* Traveling light particle: quiet white pearl dot */}
              {!shouldReduceMotion && (
                <circle r="1.6" fill="#FFFFFF" filter="url(#particleGlow)">
                  <animateMotion
                    dur={`${arc.duration}s`}
                    repeatCount="indefinite"
                    path={arc.d}
                    keyPoints="0;1"
                    keyTimes="0;1"
                    calcMode="linear"
                    begin={`${index * 0.4}s`}
                  />
                </circle>
              )}
            </React.Fragment>
          ))}
        </g>

        {/* =====================================================================
            2. MONOCHROMATIC ARCHITECTURAL NODES (Minimal, understated, luxury editorial)
           ===================================================================== */}
        <g className="constellation-nodes">
          {CONSTELLATION_NODES.map((node) => (
            <g key={node.id} transform={`translate(${node.cx}, ${node.cy})`}>
              {/* Subtle ambient breathing halo */}
              {!shouldReduceMotion ? (
                <motion.circle
                  r={node.r * 1.8}
                  fill="rgba(255, 250, 242, 0.22)"
                  initial={{ scale: 0.9, opacity: 0.2 }}
                  animate={{
                    scale: [0.9, 1.25, 0.9],
                    opacity: [0.2, 0.45, 0.2]
                  }}
                  transition={{
                    duration: node.duration,
                    delay: node.delay,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                  filter="url(#nodeGlow)"
                />
              ) : (
                <circle
                  r={node.r * 1.6}
                  fill="rgba(255, 250, 242, 0.22)"
                  opacity="0.3"
                />
              )}

              {/* Precision Astronomical Dashed Ring Accent */}
              <circle
                r={node.r + 3.5}
                fill="none"
                stroke="rgba(255, 255, 255, 0.38)"
                strokeWidth="0.75"
                strokeDasharray="2 2"
              />

              {/* Solid Pearl White Core */}
              <circle
                r={node.r}
                fill="#FFFFFF"
                stroke="#D9CEBC"
                strokeWidth="1.2"
              />

              {/* Center Micro Sparkle Dot */}
              <circle
                r={node.r * 0.35}
                fill="#FFFDF8"
                opacity="0.95"
              />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
