"use client";
import { motion } from 'framer-motion';

interface CallTimerProps {
  seconds: number;
  size?: 'xl' | 'lg';
  color?: string;
}

export function CallTimer({ seconds, size = 'xl', color }: CallTimerProps) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      <div
        className={`font-body font-light tabular-nums tracking-[-0.03em] ${
          size === 'xl' ? 'text-[56px]' : 'text-[36px]'
        }`}
        style={{ color: color || '#e8e4dc' }}
      >
        <span>{mins}</span>
        <motion.span
          className="inline-block"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
        >
          :
        </motion.span>
        <span>{secs}</span>
      </div>
      <p className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[rgba(232,228,220,0.55)]">
        DUREE DE L&apos;APPEL
      </p>
    </div>
  );
}

