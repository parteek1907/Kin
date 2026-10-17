'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

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
  // Eye variations according to feature/pose
  const renderEyes = () => {
    switch (pose) {
      case 'bounties':
        // Star eyes (★ ★) glowing excited
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-[6%]">
            <div className="flex gap-7">
              {/* Left Star Eye */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], rotate: [0, 15, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] text-xl font-bold"
              >
                ★
              </motion.div>
              {/* Right Star Eye */}
              <motion.div
                animate={{ scale: [1, 1.25, 1], rotate: [0, -15, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut', delay: 0.15 }}
                className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] text-xl font-bold"
              >
                ★
              </motion.div>
            </div>
          </div>
        );

      case 'time-machine':
        // Time travel / chrono lens eyes (✦ ✦)
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-[6%]">
            <div className="flex gap-7">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                className="w-4 h-6 rounded-full border-2 border-indigo-400 bg-indigo-900/40 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.6)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                className="w-4 h-6 rounded-full border-2 border-indigo-400 bg-indigo-900/40 flex items-center justify-center shadow-[0_0_10px_rgba(99,102,241,0.6)]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              </motion.div>
            </div>
          </div>
        );

      case 'auto-connect':
        // Winking cool eye (^ _ -) with thumbs-up confidence
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-[6%]">
            <div className="flex items-center gap-7">
              {/* Left wink */}
              <motion.div
                animate={{ scaleY: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 2.2, times: [0, 0.5, 1] }}
                className="w-4 h-1 bg-slate-800 rounded-full shadow-xs"
              />
              {/* Right open sparkling eye */}
              <div className="w-3.5 h-6 rounded-full bg-slate-900 flex flex-col justify-start items-end p-0.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
              </div>
            </div>
          </div>
        );

      case 'radar':
        // Scanning radar eyes with pinging sweep beam
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-[6%]">
            <div className="flex gap-7">
              <div className="relative w-4 h-6 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center shadow-md">
                <motion.div
                  animate={{ y: [-12, 12, -12] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                  className="w-full h-1 bg-[#E25C38] shadow-[0_0_6px_#E25C38]"
                />
              </div>
              <div className="relative w-4 h-6 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center shadow-md">
                <motion.div
                  animate={{ y: [-12, 12, -12] }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', delay: 0.2 }}
                  className="w-full h-1 bg-[#E25C38] shadow-[0_0_6px_#E25C38]"
                />
              </div>
            </div>
          </div>
        );

      case 'community':
        // Joyful smiling eyes (◠ ‿ ◠) with peach blush cheeks
        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none -translate-y-[5%]">
            <div className="flex items-center gap-7">
              {/* Left happy curve eye */}
              <svg className="w-4 h-3" viewBox="0 0 20 12" fill="none">
                <path
                  d="M2 10C4 3 16 3 18 10"
                  stroke="#1E293B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
              {/* Right happy curve eye */}
              <svg className="w-4 h-3" viewBox="0 0 20 12" fill="none">
                <path
                  d="M2 10C4 3 16 3 18 10"
                  stroke="#1E293B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            {/* Blushing peach cheeks */}
            <div className="flex justify-between w-24 px-1 mt-1">
              <span className="w-3.5 h-2 rounded-full bg-pink-400/50 blur-[1px]" />
              <span className="w-3.5 h-2 rounded-full bg-pink-400/50 blur-[1px]" />
            </div>
          </div>
        );

      case 'overview':
      case 'welcome':
      default:
        // Friendly gentle eyes with specular highlight blink
        return (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none -translate-y-[6%]">
            <div className="flex gap-7">
              <motion.div
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ repeat: Infinity, duration: 4, times: [0, 0.7, 0.75, 0.8, 1] }}
                className="w-3.5 h-6 rounded-full bg-slate-900 relative shadow-xs"
              >
                <span className="absolute top-1 left-0.5 w-1.5 h-1.5 rounded-full bg-white" />
              </motion.div>
              <motion.div
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
                transition={{ repeat: Infinity, duration: 4, times: [0, 0.7, 0.75, 0.8, 1] }}
                className="w-3.5 h-6 rounded-full bg-slate-900 relative shadow-xs"
              >
                <span className="absolute top-1 left-0.5 w-1.5 h-1.5 rounded-full bg-white" />
              </motion.div>
            </div>
          </div>
        );
    }
  };

  // Pose animations for Kin body
  const getPoseMotion = () => {
    switch (pose) {
      case 'bounties':
        return {
          animate: { y: [0, -8, 0], rotate: [-2, 2, -2] },
          transition: { repeat: Infinity, duration: 1.6, ease: 'easeInOut' }
        };
      case 'radar':
        return {
          animate: { y: [0, -4, 0], rotate: [0, 3, 0] },
          transition: { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
        };
      case 'community':
        return {
          animate: { y: [0, -6, 0], scale: [1, 1.03, 1] },
          transition: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
        };
      case 'time-machine':
        return {
          animate: { rotate: [-2, 2, -2] },
          transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' }
        };
      case 'auto-connect':
        return {
          animate: { y: [0, -3, 0] },
          transition: { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
        };
      case 'welcome':
      case 'overview':
      default:
        return {
          animate: { y: [0, -5, 0] },
          transition: { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }
        };
    }
  };

  const motionProps = getPoseMotion();

  return (
    <motion.div
      onClick={onClick}
      {...motionProps}
      className={`relative select-none flex items-center justify-center ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Crisp Mascot Base Image (Clean feet, zero surface artifacts) */}
      <div className="relative w-full h-full">
        <Image
          src="/images/kin_mascot_transparent.png"
          alt="Kin Mascot"
          fill
          priority
          sizes={`${size}px`}
          className="object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.06)]"
        />
      </div>

      {/* Dynamic Animated Eyes Overlay */}
      {showEyesOverlay && (
        <AnimatePresence mode="wait">
          <motion.div
            key={pose}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {renderEyes()}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Feature Badge Particle */}
      {pose === 'bounties' && (
        <motion.div
          animate={{ y: [-4, -12, -4], opacity: [0.7, 1, 0.7] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute -top-1 -right-1 text-sm font-bold bg-[#E25C38] text-white px-2 py-0.5 rounded-full shadow-md"
        >
          $$$
        </motion.div>
      )}

      {pose === 'community' && (
        <motion.div
          animate={{ scale: [0.9, 1.1, 0.9] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="absolute -top-2 -right-1 text-base drop-shadow-md"
        >
          💬
        </motion.div>
      )}

      {pose === 'radar' && (
        <motion.div
          animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -top-2 -left-1 text-sm"
        >
          📡
        </motion.div>
      )}
    </motion.div>
  );
}
