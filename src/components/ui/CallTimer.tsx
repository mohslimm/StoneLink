'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';

interface CallTimerProps {
  isActive: boolean;
  onTick?: (seconds: number) => void;
}

export const CallTimer = memo(({ isActive, onTick }: CallTimerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const minRef = useRef<HTMLDivElement>(null);
  const secRef = useRef<HTMLDivElement>(null);
  const prevM = useRef('00');
  const prevS = useRef('00');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (onTick) onTick(next);
          return next;
        });
      }, 1000);
    } else {
      setElapsed(0);
      prevM.current = '00';
      prevS.current = '00';
      if (minRef.current) minRef.current.innerText = '00';
      if (secRef.current) secRef.current.innerText = '00';
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, onTick]);

  useEffect(() => {
    if (!isActive) return;

    const m = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const s = (elapsed % 60).toString().padStart(2, '0');

    // Simple GSAP bump animation on seconds
    if (s !== prevS.current && secRef.current) {
      secRef.current.innerText = s;
      gsap.fromTo(
        secRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      prevS.current = s;
    }

    if (m !== prevM.current && minRef.current) {
      minRef.current.innerText = m;
      gsap.fromTo(
        minRef.current,
        { y: -10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }
      );
      prevM.current = m;
    }
  }, [elapsed, isActive]);

  return (
    <div className="flex items-center gap-3">
      <motion.div
        className="w-2.5 h-2.5 rounded-full bg-[var(--danger)]"
        animate={{ opacity: isActive ? [1, 0.4, 1] : 1 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
      />
      <div className="flex items-center text-2xl font-mono font-bold text-[var(--text-primary)] overflow-hidden">
        <div ref={minRef} className="w-[3ch] text-center inline-block">00</div>
        <span>:</span>
        <div ref={secRef} className="w-[3ch] text-center inline-block">00</div>
      </div>
    </div>
  );
});

CallTimer.displayName = 'CallTimer';
