import React from 'react';
import { cn } from '@/lib/utils';

interface TabBarProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onChange: (id: string) => void;
}

export const TabBar = ({ tabs, activeTab, onChange }: TabBarProps) => (
  <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          "px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
          activeTab === tab.id ? "bg-[#c5a059] text-black shadow-lg" : "text-slate-500 hover:text-slate-300"
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

TabBar.displayName = 'TabBar';
