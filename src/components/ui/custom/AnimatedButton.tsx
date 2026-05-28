"use client";
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';

interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export function AnimatedButton({
  variant = 'primary',
  children,
  icon,
  className,
  fullWidth,
  ...props
}: AnimatedButtonProps) {
  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-body font-semibold text-[15px] cursor-pointer transition-colors',
        'px-6 py-2.5',
        fullWidth && 'w-full',
        variant === 'primary' && 'bg-[#c5a059] text-[#0a0a12] hover:bg-[#d4b06a]',
        variant === 'secondary' && 'bg-transparent text-[#e8e4dc] border border-[rgba(255,255,255,0.10)] hover:bg-[#11111a]',
        variant === 'danger' && 'bg-[rgba(248,113,113,0.10)] text-[#f87171] border border-[rgba(248,113,113,0.2)] hover:bg-[rgba(248,113,113,0.2)]',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}

