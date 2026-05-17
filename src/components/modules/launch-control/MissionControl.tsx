'use client';

import { useState, memo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Trash2,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Target,
  CheckCircle2,
  Zap,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { PHASES } from './constants';
import type { MissionControlProps } from './LaunchControl.types';
import { useLaunchControl } from './launch-control.hooks';

const VARIANTS = {
  container: {
    initial: { opacity: 0, y: 15 },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  },

  item: {
    initial: { opacity: 0, x: -8 },
    animate: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.25,
      },
    }),
  },
};

export const MissionControl = memo(
  ({ phase }: MissionControlProps) => {
    const [confirm, setConfirm] = useState<'seed' | 'purge' | null>(null);

    const {
      handleSeed,
      handlePurge,
      globalStatus,
      isProcessing,
    } = useLaunchControl();

    const onConfirm = useCallback(
      async (type: 'seed' | 'purge') => {
        try {
          if (type === 'seed') {
            await handleSeed();
          } else {
            await handlePurge();
          }
        } finally {
          setConfirm(null);
        }
      },
      [handleSeed, handlePurge]
    );

    /**
     * SAFE NEXT PHASE RESOLUTION
     */
    const currentIndex = PHASES.findIndex(
      (p) => p.id === phase.id
    );

    const nextPhase =
      currentIndex !== -1 &&
      currentIndex < PHASES.length - 1
        ? PHASES[currentIndex + 1]
        : null;

    return (
      <div className="flex flex-col gap-8">
        {/* HEADER */}
        <motion.div
          variants={VARIANTS.container}
          initial="initial"
          animate="animate"
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f20]/60 p-8 backdrop-blur-sm"
        >
          {/* Glow */}
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#c5a059]/5 blur-[100px]" />

          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <span className="rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059]">
                Phase {phase.number}
              </span>

              <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
            </div>

            <h2 className="mb-4 font-['Cormorant_Garamond'] text-4xl italic text-white md:text-5xl">
              {phase.title}
            </h2>

            <p className="max-w-2xl text-sm leading-relaxed text-white/50 md:text-base">
              {phase.description}
            </p>
          </div>
        </motion.div>

        {/* CONTENT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* OBJECTIVES */}
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <Target size={14} className="text-[#c5a059]" />

              <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                Strategic Objectives
              </h3>
            </div>

            <div className="space-y-3">
              {phase.objectives.map((obj, i) => (
                <motion.div
                  key={`${phase.id}-objective-${i}`}
                  custom={i}
                  variants={VARIANTS.item}
                  initial="initial"
                  animate="animate"
                  className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-300 hover:border-[#c5a059]/20 hover:bg-white/[0.04]"
                >
                  <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-[#c5a059]/30 bg-[#c5a059]/5 transition-colors group-hover:bg-[#c5a059]/10">
                    <CheckCircle2
                      size={14}
                      className="text-[#c5a059]"
                    />
                  </div>

                  <span className="text-sm leading-relaxed text-white/70">
                    {obj}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* KPI + CONTROLS */}
          <div className="space-y-6">
            {/* KPI CARD */}
            <div className="relative overflow-hidden rounded-3xl border border-[#c5a059]/20 bg-gradient-to-br from-[#c5a059]/10 to-transparent p-6">
              <div className="absolute inset-0 bg-[#c5a059]/5 opacity-0 transition-opacity duration-300 hover:opacity-100" />

              <div className="relative z-10">
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c5a059]">
                    KPI Performance
                  </span>

                  <Zap
                    size={16}
                    className="animate-pulse text-[#c5a059]"
                  />
                </div>

                <div className="mb-2 flex items-end gap-3">
                  <span className="font-['Cormorant_Garamond'] text-5xl text-white">
                    {phase.kpi.value}
                  </span>

                  <span className="mb-1 text-sm font-medium text-emerald-400">
                    {phase.kpi.trend}
                  </span>
                </div>

                <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                  {phase.kpi.label}
                </p>
              </div>
            </div>

            {/* CONTROLS */}
            {phase.id === 'p0' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={14}
                    className="text-[#c5a059]"
                  />

                  <h3 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                    System Controls
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* SEED */}
                  <button
                    onClick={() => setConfirm('seed')}
                    disabled={
                      globalStatus !== 'idle' || isProcessing
                    }
                    className={cn(
                      'group flex w-full items-center justify-between rounded-2xl bg-[#c5a059] p-4 font-semibold text-black transition-all duration-300',
                      'hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(197,160,89,0.35)] active:scale-[0.98]',
                      'disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Database size={18} />

                      <span className="text-sm">
                        Seed System Data
                      </span>
                    </div>

                    <ChevronRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </button>

                  {/* PURGE */}
                  <button
                    onClick={() => setConfirm('purge')}
                    disabled={isProcessing}
                    className={cn(
                      'group flex w-full items-center justify-between rounded-2xl border border-red-500/20 bg-red-500/5 p-4 transition-all duration-300',
                      'hover:border-red-500/40 hover:bg-red-500/10',
                      'disabled:cursor-not-allowed disabled:opacity-50'
                    )}
                  >
                    <div className="flex items-center gap-3 text-red-400">
                      <Trash2 size={18} />

                      <span className="text-sm font-medium">
                        Purge System
                      </span>
                    </div>

                    <AlertTriangle
                      size={18}
                      className="text-red-400 opacity-60 transition-opacity group-hover:opacity-100"
                    />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* NEXT PHASE */}
        {nextPhase && (
          <div className="mt-2 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03]">
                <CheckCircle2
                  size={18}
                  className="text-[#c5a059]"
                />
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">
                  Next Phase
                </p>

                <p className="text-sm text-white/60">
                  Phase {nextPhase.number}:{' '}
                  <span className="font-medium text-white/80">
                    {nextPhase.title}
                  </span>
                </p>
              </div>
            </div>

            {/* Progress */}
            <div className="hidden w-48 overflow-hidden rounded-full bg-white/5 md:block">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    ((currentIndex + 1) / PHASES.length) * 100
                  }%`,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="h-1 bg-[#c5a059]"
              />
            </div>
          </div>
        )}

        {/* CONFIRMATION MODAL */}
        <AnimatePresence>
          {confirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 15 }}
                transition={{
                  duration: 0.2,
                }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0f0f20] p-8 shadow-2xl"
              >
                {/* Glow */}
                <div className="absolute inset-0 bg-[#c5a059]/5" />

                <div className="relative z-10">
                  <div
                    className={cn(
                      'mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full',
                      confirm === 'seed'
                        ? 'bg-[#c5a059]/10 text-[#c5a059]'
                        : 'bg-red-500/10 text-red-400'
                    )}
                  >
                    {confirm === 'seed' ? (
                      <ShieldCheck size={32} />
                    ) : (
                      <AlertTriangle size={32} />
                    )}
                  </div>

                  <h3 className="mb-3 text-center font-['Cormorant_Garamond'] text-3xl italic text-white">
                    Confirm Operation
                  </h3>

                  <p className="mb-8 text-center text-sm leading-relaxed text-white/50">
                    {confirm === 'seed'
                      ? 'This action will inject demonstration datasets into the system and overwrite existing state.'
                      : 'Danger: this operation will permanently delete ALL system data.'}
                  </p>

                  <div className="flex gap-4">
                    <button
                      onClick={() => setConfirm(null)}
                      className="flex-1 rounded-2xl border border-white/10 py-3 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={() => onConfirm(confirm)}
                      className={cn(
                        'flex-1 rounded-2xl py-3 text-sm font-semibold transition-all',
                        confirm === 'seed'
                          ? 'bg-[#c5a059] text-black hover:shadow-[0_0_20px_rgba(197,160,89,0.4)]'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      )}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

MissionControl.displayName = 'MissionControl';
