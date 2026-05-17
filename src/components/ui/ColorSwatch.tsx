'use client';

import { memo } from 'react';

interface ColorSwatchProps {
  hex: string;
  label: string;
}

export const ColorSwatch = memo(({ hex, label }: ColorSwatchProps) => (
  <div className="flex items-center gap-3">
    <div 
      className="w-8 h-8 rounded-md border border-white/10 shadow-sm transition-transform hover:scale-110" 
      style={{ backgroundColor: hex }} 
    />
    <div>
      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="text-xs font-mono text-slate-300">{hex}</div>
    </div>
  </div>
));

ColorSwatch.displayName = 'ColorSwatch';
