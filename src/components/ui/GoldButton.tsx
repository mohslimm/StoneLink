import React from 'react';
import { cn } from '@/lib/utils';

interface GoldButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const GoldButton = ({ 
  children, 
  onClick, 
  loading, 
  disabled, 
  size = 'md', 
  className 
}: GoldButtonProps) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-8 py-3 text-[11px]',
    lg: 'px-10 py-4 text-xs'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative font-black uppercase tracking-[0.2em] rounded-full transition-all duration-300",
        "bg-gradient-to-r from-[#c5a059] to-[#a07840] text-black shadow-[0_0_20px_rgba(197,160,89,0.2)]",
        "hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] active:scale-95",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100",
        sizeClasses[size],
        className
      )}
    >
      <span className={cn("flex items-center justify-center gap-2", loading ? "opacity-0" : "opacity-100")}>
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
};

GoldButton.displayName = 'GoldButton';
