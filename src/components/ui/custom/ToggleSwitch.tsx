"use client";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (v: boolean) => void;
}

export function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'w-11 h-6 rounded-full relative transition-colors duration-200 cursor-pointer',
        checked ? 'bg-[#4ade80]' : 'bg-[#11111a] border border-[rgba(255,255,255,0.06)]'
      )}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md absolute top-[2px]"
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ left: checked ? '22px' : '2px' }}
      />
    </button>
  );
}

