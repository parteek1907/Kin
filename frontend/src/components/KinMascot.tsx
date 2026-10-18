'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export type MascotPose = 'welcome' | 'overview' | 'time-machine' | 'bounties' | 'auto-connect' | 'radar' | 'community';

interface KinMascotProps {
  pose?: MascotPose;
  size?: number;
  className?: string;
  onClick?: () => void;
  showEyesOverlay?: boolean;
}

export default function KinMascot({
  pose = 'welcome',
  size = 200,
  className = '',
  onClick,
  showEyesOverlay = true,
}: KinMascotProps) {
  const renderEyeModifications = () => {
    if (!showEyesOverlay) return null;

    switch (pose) {
      case 'community':
        // Happy upward semicircle eyes (^ ^)
        return (
          <>
            {/* Left Eye: Semicircle */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.9%',
                left: '38.2%',
                width: '6.2%',
                height: '14.6%',
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 3 17 C 3 6, 21 6, 21 17"
                  stroke="#1E2024"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Right Eye: Semicircle */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.9%',
                left: '55.0%',
                width: '6.2%',
                height: '14.6%',
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 3 17 C 3 6, 21 6, 21 17"
                  stroke="#1E2024"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </>
        );

      case 'bounties':
      case 'radar':
        // Focused arrow eyes (^ ^ / arrows)
        return (
          <>
            {/* Left Eye: Arrow Up */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.9%',
                left: '38.2%',
                width: '6.2%',
                height: '14.6%',
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 4 16 L 12 7 L 20 16"
                  stroke="#E25C38"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Right Eye: Arrow Up */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.9%',
                left: '55.0%',
                width: '6.2%',
                height: '14.6%',
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 4 16 L 12 7 L 20 16"
                  stroke="#E25C38"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </>
        );

      case 'auto-connect':
      case 'time-machine':
        // Both eyes subtle calm curved visor (^ ^)
        return (
          <>
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.9%',
                left: '38.2%',
                width: '6.2%',
                height: '14.6%',
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 3 17 C 3 6, 21 6, 21 17"
                  stroke="#1E2024"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.9%',
                left: '55.0%',
                width: '6.2%',
                height: '14.6%',
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 3 17 C 3 6, 21 6, 21 17"
                  stroke="#1E2024"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </>
        );

      case 'welcome':
      case 'overview':
      default:
        // Iconic capsule eyes with specular highlight and natural blink
        return (
          <>
            <motion.div
              animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
              transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.7, 0.73, 0.77, 1] }}
              className="absolute pointer-events-none rounded-full"
              style={{
                top: '33.9%',
                left: '38.5%',
                width: '5.8%',
                height: '14.6%',
                backgroundColor: '#1E2024',
                transformOrigin: 'center',
              }}
            >
              <span className="absolute top-1 left-0.5 w-1 h-1.5 rounded-full bg-white opacity-80" />
            </motion.div>
            <motion.div
              animate={{ scaleY: [1, 1, 0.08, 1, 1] }}
              transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.7, 0.73, 0.77, 1] }}
              className="absolute pointer-events-none rounded-full"
              style={{
                top: '33.9%',
                left: '55.2%',
                width: '5.8%',
                height: '14.6%',
                backgroundColor: '#1E2024',
                transformOrigin: 'center',
              }}
            >
              <span className="absolute top-1 left-0.5 w-1 h-1.5 rounded-full bg-white opacity-80" />
            </motion.div>
          </>
        );
    }
  };

  // Body motion: subtle minimal professional floating (no goofy tilting)
  const getBodyMotion = () => {
    return {
      y: [0, -3, 0],
      transition: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
    };
  };

  return (
    <motion.div
      onClick={onClick}
      animate={getBodyMotion()}
      className={`relative select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Clean, soft, luxury ground shadow */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[52%] h-[6px] rounded-full bg-slate-900/10 blur-[2px] pointer-events-none" />

      {/* Main Clean Robot PNG */}
      <div className="relative w-full h-full">
        <Image
          src="/images/kin_mascot_body.png"
          alt="Kin AI Mascot"
          fill
          priority
          sizes={`${size}px`}
          className="object-contain"
        />

        {/* Eye modifications placed directly over the two eye positions */}
        {renderEyeModifications()}
      </div>
    </motion.div>
  );
}
