'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface CountUpNumberProps {
  target: number;
  duration?: number;
  className?: string;
}

export default function CountUpNumber({
  target,
  duration = 1.6,
  className = ''
}: CountUpNumberProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    
    if (shouldReduceMotion) {
      setCount(target);
      return;
    }

    let start = 0;
    const startTime = performance.now();
    const durationMs = duration * 1000;

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      // Quartic ease-out for ultra smooth deceleration
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentVal = Math.round(start + (target - start) * easeProgress);
      
      setCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [isInView, target, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {count}
    </span>
  );
}
