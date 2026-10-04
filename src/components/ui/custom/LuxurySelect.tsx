"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LuxurySelectOption {
  label: string;
  value: string;
  count?: number;
  badge?: string;
  color?: string;
  icon?: React.ReactNode;
}

interface LuxurySelectProps {
  value: string;
  onChange: (value: string) => void;
  options: LuxurySelectOption[];
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
  showSearchThreshold?: number;
  align?: 'left' | 'right';
  title?: string;
}

export function LuxurySelect({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  className = '',
  icon,
  showSearchThreshold = 8,
  align = 'left',
  title,
}: LuxurySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && options.length >= showSearchThreshold) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen, options.length, showSearchThreshold]);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery('');
  };

  const showSearch = options.length >= showSearchThreshold;

  return (
    <div ref={containerRef} className={cn("relative", isOpen ? "z-50" : "z-10", className)} title={title}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          "w-full h-10 px-3.5 rounded-[10px] bg-[#11111a] border text-[12.5px] font-body transition-all cursor-pointer flex items-center justify-between gap-2 text-left select-none",
          isOpen
            ? "border-[#c5a059] bg-[#161624] text-[#e8e4dc] shadow-[0_0_16px_rgba(197,160,89,0.22)]"
            : "border-[rgba(255,255,255,0.08)] hover:border-[rgba(197,160,89,0.35)] hover:bg-[#141422] text-[#e8e4dc]"
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          {icon && <span className="text-[#c5a059] shrink-0">{icon}</span>}
          {selectedOption?.color && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: selectedOption.color }}
            />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={cn(
            "text-[rgba(232,228,220,0.45)] shrink-0 transition-transform duration-200",
            isOpen ? "rotate-180 text-[#c5a059]" : ""
          )}
        />
      </button>

      {/* Floating Luxury Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-[999] mt-1.5 min-w-[200px] w-max max-w-[320px] rounded-[12px] bg-[#0c0c16] border border-[rgba(197,160,89,0.3)] shadow-[0_16px_48px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden py-1.5",
              align === 'right' ? "right-0" : "left-0"
            )}
            style={{ maxHeight: '320px' }}
          >
            {/* Search Input for Long Option Lists */}
            {showSearch && (
              <div className="px-2.5 pb-2 pt-1 border-b border-[rgba(255,255,255,0.06)]">
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)]" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer..."
                    className="w-full h-7 pl-7 pr-6 rounded-[6px] bg-[#141422] border border-[rgba(255,255,255,0.08)] text-[11.5px] text-[#e8e4dc] placeholder:text-[rgba(232,228,220,0.3)] focus:outline-none focus:border-[#c5a059]"
                    onClick={(e) => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-[rgba(232,228,220,0.4)] hover:text-[#e8e4dc]"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1 space-y-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-[11.5px] text-[rgba(232,228,220,0.4)] font-body">
                  Aucun résultat
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        "w-full px-3 py-2 rounded-[8px] text-[12px] font-body text-left transition-colors flex items-center justify-between gap-2.5 cursor-pointer",
                        isSelected
                          ? "bg-[rgba(197,160,89,0.18)] text-[#c5a059] font-medium"
                          : "text-[rgba(232,228,220,0.8)] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#e8e4dc]"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {opt.color && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: opt.color }}
                          />
                        )}
                        <span className="truncate">{opt.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {opt.count !== undefined && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[rgba(255,255,255,0.06)] text-[rgba(232,228,220,0.5)]">
                            {opt.count}
                          </span>
                        )}
                        {isSelected && (
                          <Check size={13} className="text-[#c5a059]" />
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
