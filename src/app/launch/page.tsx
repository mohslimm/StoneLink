'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Rocket, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Database, 
  Trash2, 
  ChevronRight,
  Target,
  BarChart3,
  Terminal as TerminalIcon,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useStoneStore } from '@/stores/useStoneStore';
import { LaunchControl } from '@/components/modules/launch-control/LaunchControl';

export default function LaunchPage() {
  return (
    <main className="min-h-screen bg-[#060610] text-[#f0ede8] overflow-hidden selection:bg-[#c5a059]/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#c5a059]/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-8 h-screen flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c5a059] to-[#D4B57A] flex items-center justify-center shadow-[0_0_20px_rgba(197,160,89,0.3)]">
              <Rocket className="text-[#1A1200]" size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-['Cormorant_Garamond'] italic font-bold tracking-tight text-[#f0ede8]">
                StoneLink <span className="text-[#c5a059]">2.0</span>
              </h1>
              <p className="text-sm font-['Outfit'] font-light text-white/40 tracking-widest uppercase">
                Launch Control Center — Protocol S2
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium mb-1">System Status</span>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#22c55e]/10 border border-[#22c55e]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-xs font-['JetBrains_Mono'] font-bold text-[#22c55e] uppercase tracking-wider">Operational</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/5" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium mb-1">Target Revenue</span>
              <span className="text-xl font-['Outfit'] font-semibold text-[#c5a059]">$1,000,000</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <LaunchControl />
        </div>
      </div>
    </main>
  );
}
