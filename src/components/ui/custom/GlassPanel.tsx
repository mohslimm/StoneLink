"use client";
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'gold-accent' | 'danger-accent';
}

export function GlassPanel({
  variant = 'default',
  className,
  children,
  ...props
}: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        'rounded-[10px] backdrop-blur-[20px]',
        variant === 'default' && 'bg-[rgba(17,17,26,0.7)] border border-[rgba(255,255,255,0.06)] shadow-glass',
        variant === 'elevated' && 'bg-[rgba(24,24,36,0.85)] border border-[rgba(255,255,255,0.10)] shadow-modal',
        variant === 'gold-accent' && 'bg-[rgba(17,17,26,0.7)] border border-[rgba(255,255,255,0.06)] shadow-glass border-l-2 border-l-[#c5a059]',
        variant === 'danger-accent' && 'bg-[rgba(17,17,26,0.7)] border border-[rgba(255,255,255,0.06)] shadow-glass border-l-2 border-l-[#f87171]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

