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
  // Face color of Kin bot to mask original vertical pill dots when changing expression
  const faceBg = '#F3F4F6'; // Matches Kin's face robot tint

  const renderEyeModifications = () => {
    if (!showEyesOverlay) return null;

    switch (pose) {
      case 'community':
        // Happy upward semicircle eyes (^ ^) replacing the two vertical dots
        return (
          <>
            {/* Left Eye: Semicircle */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.8%',
                left: '37.8%',
                width: '7.5%',
                height: '14.8%',
                backgroundColor: faceBg,
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 3 17 C 3 7, 21 7, 21 17"
                  stroke="#11131A"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Right Eye: Semicircle */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.8%',
                left: '54.5%',
                width: '7.5%',
                height: '14.8%',
                backgroundColor: faceBg,
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 3 17 C 3 7, 21 7, 21 17"
                  stroke="#11131A"
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
                top: '33.8%',
                left: '37.8%',
                width: '7.5%',
                height: '14.8%',
                backgroundColor: faceBg,
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
                top: '33.8%',
                left: '54.5%',
                width: '7.5%',
                height: '14.8%',
                backgroundColor: faceBg,
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
        // Wink: Left eye is a horizontal happy line/semicircle, right eye is the normal dot
        return (
          <>
            {/* Left Eye: Wink curve */}
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.8%',
                left: '37.8%',
                width: '7.5%',
                height: '14.8%',
                backgroundColor: faceBg,
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 3 16 C 5 9, 19 9, 21 16"
                  stroke="#11131A"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {/* Right eye remains the natural open dot with subtle specular shine */}
          </>
        );

      case 'time-machine':
        // Semicircle looking through time / retro curved visor
        return (
          <>
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.8%',
                left: '37.8%',
                width: '7.5%',
                height: '14.8%',
                backgroundColor: faceBg,
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 4 10 C 4 19, 20 19, 20 10"
                  stroke="#11131A"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div
              className="absolute pointer-events-none flex items-center justify-center"
              style={{
                top: '33.8%',
                left: '54.5%',
                width: '7.5%',
                height: '14.8%',
                backgroundColor: faceBg,
              }}
            >
              <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
                <path
                  d="M 4 10 C 4 19, 20 19, 20 10"
                  stroke="#11131A"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </>
        );

      case 'welcome':
      case 'overview':
      default:
        // Subtle natural blink on the bot's own two dots
        return (
          <>
            <motion.div
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.7, 0.74, 0.78, 1] }}
              className="absolute pointer-events-none rounded-full"
              style={{
                top: '33.8%',
                left: '38.5%',
                width: '6%',
                height: '14.6%',
                backgroundColor: '#11131A',
                transformOrigin: 'center',
              }}
            >
              <span className="absolute top-1 left-0.5 w-1 h-1.5 rounded-full bg-white opacity-80" />
            </motion.div>
            <motion.div
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ repeat: Infinity, duration: 4.5, times: [0, 0.7, 0.74, 0.78, 1] }}
              className="absolute pointer-events-none rounded-full"
              style={{
                top: '33.8%',
                left: '55.2%',
                width: '6%',
                height: '14.6%',
                backgroundColor: '#11131A',
                transformOrigin: 'center',
              }}
            >
              <span className="absolute top-1 left-0.5 w-1 h-1.5 rounded-full bg-white opacity-80" />
            </motion.div>
          </>
        );
    }
  };

  // Body motion & waving hand:
  const getBodyMotion = () => {
    if (pose === 'welcome') {
      // Gentle friendly tilt waving
      return {
        rotate: [0, -3, 3, -1, 0],
        y: [0, -4, 0],
        transition: { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
      };
    }
    if (pose === 'community') {
      // Joyful bounce
      return {
        y: [0, -5, 0],
        transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
      };
    }
    return {
      y: [0, -3, 0],
      transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
    };
  };

  return (
    <motion.div
      onClick={onClick}
      animate={getBodyMotion()}
      className={`relative select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Hand up when in welcome or auto-connect mode */}
      {(pose === 'welcome' || pose === 'auto-connect') && (
        <motion.div
          animate={{ rotate: [0, 18, -8, 14, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="absolute -top-[2%] right-[10%] w-[15%] h-[20%] pointer-events-none z-10 origin-bottom-left"
        >
          {/* Cute white wave hand pill with black outline */}
          <div className="w-full h-full rounded-full bg-white border-2 border-slate-800 shadow-xs" />
        </motion.div>
      )}

      {/* Main Clean Robot PNG */}
      <div className="relative w-full h-full">
        <Image
          src="/images/kin_mascot_transparent.png"
          alt="Kin AI Mascot"
          fill
          priority
          sizes={`${size}px`}
          className="object-contain"
        />

        {/* Eye modifications placed directly over the two eye dots */}
        {renderEyeModifications()}
      </div>
    </motion.div>
  );
}
