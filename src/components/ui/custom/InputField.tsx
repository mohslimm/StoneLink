"use client";
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  textarea?: boolean;
  error?: boolean;
  icon?: ReactNode;
}

export function InputField({
  textarea,
  error,
  icon,
  className,
  ...props
}: InputFieldProps) {
  const baseClasses = cn(
    'w-full bg-[#11111a] border rounded-[10px] text-[#e8e4dc] font-body text-[15px]',
    'placeholder:text-[rgba(232,228,220,0.30)]',
    'transition-all duration-200',
    'focus:outline-none focus:border-[rgba(197,160,89,0.25)] focus:shadow-[0_0_20px_rgba(197,160,89,0.15)]',
    error && 'border-[#f87171] bg-[rgba(248,113,113,0.10)]',
    !error && 'border-[rgba(255,255,255,0.06)]',
    icon && !textarea && 'pl-10',
    className
  );

  if (textarea) {
    return (
      <textarea
        className={cn(baseClasses, 'min-h-[100px] py-3 px-4 resize-vertical')}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    );
  }

  return (
    <div className="relative w-full">
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.55)]">
          {icon}
        </div>
      )}
      <input
        className={cn(baseClasses, 'h-11 px-4')}
        {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    </div>
  );
}

