import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonLoaderProps {
  lines?: number;
  width?: 'full' | 'half' | 'quarter';
}

export const SkeletonLoader = ({ lines = 3, width = 'full' }: SkeletonLoaderProps) => (
  <div className="space-y-3 animate-pulse">
    {[...Array(lines)].map((_, i) => (
      <div 
        key={i} 
        className={cn(
          "h-3 bg-white/5 rounded-full",
          i === lines - 1 && width === 'half' ? 'w-1/2' : i === lines - 1 && width === 'quarter' ? 'w-1/4' : 'w-full'
        )} 
      />
    ))}
  </div>
);

SkeletonLoader.displayName = 'SkeletonLoader';
