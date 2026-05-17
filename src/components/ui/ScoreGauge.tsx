import React from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  maxScore?: number;
  label: string;
  animated?: boolean;
}

export const ScoreGauge = ({ 
  score, 
  maxScore = 100, 
  label, 
  animated = true 
}: ScoreGaugeProps) => {
  const percentage = (score / maxScore) * 100;
  const color = score < 40 ? '#ef4444' : score < 70 ? '#f59e0b' : '#22c55e';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
          <motion.circle
            initial={{ pathLength: 0 }}
            animate={{ pathLength: percentage / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeWidth="8"
            strokeDasharray="100 100"
            stroke={color}
            strokeLinecap="round"
            fill="transparent"
            r="42"
            cx="50"
            cy="50"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white tabular-nums">{score}</span>
          <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">{label}</span>
        </div>
      </div>
    </div>
  );
};

ScoreGauge.displayName = 'ScoreGauge';
