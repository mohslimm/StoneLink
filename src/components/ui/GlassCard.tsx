import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VARIANTS } from '@/lib/variants';

interface GlassCardProps {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
}

export const GlassCard = ({ 
  children, 
  active, 
  onClick, 
  className,
  hover = true
}: GlassCardProps) => (
  <motion.div
    variants={hover ? VARIANTS.cardHover : {}}
    initial="rest"
    whileHover="hover"
    onClick={onClick}
    className={cn(
      "relative p-8 rounded-[2rem] border transition-all duration-300 overflow-hidden",
      "bg-white/[0.035] border-white/10 backdrop-blur-md",
      active && "border-[#c5a059]/50 bg-white/[0.05]",
      onClick && "cursor-pointer",
      className
    )}
  >
    {/* Accent Glow */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#c5a059]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full" />
    {children}
  </motion.div>
);

GlassCard.displayName = 'GlassCard';
