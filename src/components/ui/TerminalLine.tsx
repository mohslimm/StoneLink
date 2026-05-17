import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Info, AlertTriangle, CheckCircle } from 'lucide-react';

interface TerminalLineProps {
  event: {
    timestamp: Date | string;
    type: 'scan' | 'detection' | 'generation' | 'deploy' | 'alert' | 'success';
    message: string;
  };
}

export const TerminalLine = memo(({ event }: TerminalLineProps) => {
  const icons = {
    scan: <Zap className="w-3 h-3 text-amber-400" />,
    detection: <Info className="w-3 h-3 text-blue-400" />,
    generation: <Zap className="w-3 h-3 text-[#c5a059]" />,
    deploy: <Zap className="w-3 h-3 text-purple-400" />,
    alert: <AlertTriangle className="w-3 h-3 text-red-400" />,
    success: <CheckCircle className="w-3 h-3 text-emerald-400" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-3 py-1 group"
    >
      <span className="text-slate-700 font-mono text-[10px] shrink-0 mt-0.5">
        [{new Date(event.timestamp).toLocaleTimeString([], { hour12: false })}]
      </span>
      <span className="shrink-0 mt-0.5">{icons[event.type as keyof typeof icons]}</span>
      <span className="text-slate-400 font-mono text-xs leading-relaxed group-hover:text-slate-200 transition-colors">
        {event.message}
      </span>
    </motion.div>
  );
});

TerminalLine.displayName = 'TerminalLine';
