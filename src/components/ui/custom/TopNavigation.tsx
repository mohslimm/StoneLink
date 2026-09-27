"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Radio, Eye, Layers } from 'lucide-react';
import { useUIStore } from '@/hooks/useUIStore';
import { useCrawlerStore } from '@/hooks/useCrawlerStore';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Cockpit', path: '/' },
  { label: 'CRM', path: '/crm' },
  { label: 'Appels', path: '/call' },
  { label: 'Campagnes', path: '/campaigns' },
  { label: 'Contrats', path: '/contracts' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Paramètres', path: '/settings' },
];

export function TopNavigation() {
  const pathname = usePathname();
  const { isMobileNavOpen, setMobileNavOpen } = useUIStore();
  const { isRunning, currentCount, targetCount, latestResults, setIsMonitorOpen } = useCrawlerStore();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 h-14 px-6 flex items-center justify-between bg-[#0a0a12] border-b border-[rgba(255,255,255,0.06)] z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 relative">
            <img src="/logo-icon.png" alt="StoneLink" className="w-7 h-7 object-contain drop-shadow-[0_0_15px_rgba(201,169,110,0.3)]" />
          </div>
          <span className="font-display italic font-normal text-[18px] text-[#e8e4dc]">
            StoneLink
          </span>
        </Link>

        {/* Center nav — desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                'relative px-4 py-1.5 rounded-full text-[11px] font-body font-medium uppercase tracking-[0.06em] transition-colors duration-200',
                pathname === item.path
                  ? 'text-[#e8e4dc]'
                  : 'text-[rgba(232,228,220,0.55)] hover:text-[#e8e4dc] hover:bg-[#11111a]'
              )}
            >
              {pathname === item.path && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-[#11111a] rounded-full border border-[rgba(255,255,255,0.10)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-3">
          {isRunning ? (
            <button
              onClick={() => setIsMonitorOpen(true)}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(197,160,89,0.15)] border border-[rgba(197,160,89,0.4)] hover:bg-[rgba(197,160,89,0.25)] text-[#e8e4dc] transition-all cursor-pointer shadow-[0_0_15px_rgba(197,160,89,0.2)] animate-pulse"
              title="Suivre et contrôler le bot en direct"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
              </span>
              <span className="text-[11px] font-body font-medium">
                Bot : <strong className="text-[#c5a059]">{currentCount}{targetCount > 0 ? `/${targetCount}` : ''}</strong>
              </span>
              <span className="hidden sm:inline-block text-[9.5px] uppercase font-mono px-1.5 py-0.5 rounded bg-[rgba(197,160,89,0.2)] text-[#c5a059]">
                Suivre &bull; Stop
              </span>
            </button>
          ) : latestResults && latestResults.leads && latestResults.leads.length > 0 ? (
            <button
              onClick={() => setIsMonitorOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] text-[rgba(232,228,220,0.7)] hover:text-[#e8e4dc] transition-all cursor-pointer text-[11px] font-body"
              title="Voir le résultat du dernier scan"
            >
              <Layers size={12} className="text-[#c5a059]" />
              <span>Dernier Scan ({latestResults.leads.length})</span>
            </button>
          ) : null}

          <div className="hidden sm:flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-glow absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
            </span>
            <span className="text-[11px] font-body font-medium uppercase tracking-[0.06em] text-[#4ade80]">
              Connecte
            </span>
          </div>
          <div className="w-8 h-8 rounded-full border border-[rgba(255,255,255,0.10)] bg-[#11111a] flex items-center justify-center">
            <span className="text-[11px] font-body font-medium text-[#c5a059]">SS</span>
          </div>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden text-[#e8e4dc] p-1"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Mobile nav overlay */}
      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-[rgba(5,5,9,0.95)] backdrop-blur-[20px] z-[60] flex flex-col items-center justify-center gap-6"
          >
            <button
              onClick={() => setMobileNavOpen(false)}
              className="absolute top-4 right-4 text-[#e8e4dc] p-2"
            >
              <X size={28} />
            </button>
            {navItems.map((item, i) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={item.path}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    'font-display text-[48px] font-light tracking-[-0.01em]',
                    pathname === item.path ? 'text-[#c5a059]' : 'text-[#e8e4dc]'
                  )}
                >
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
