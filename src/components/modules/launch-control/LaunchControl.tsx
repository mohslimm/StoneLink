'use client';

import { useState, memo, useMemo } from 'react';
import { motion } from 'framer-motion';

import { PHASES } from './constants';
import { PhaseSidebar } from './PhaseSidebar';
import { MissionControl } from './MissionControl';
import { TerminalControl } from './TerminalControl';
import { LAUNCH_CONTROL_VARIANTS } from './LaunchControl.variants';

export const LaunchControl = memo(() => {
  const [activePhaseId, setActivePhaseId] = useState('p0');

  const activePhase = useMemo(
    () =>
      PHASES.find((p) => p.id === activePhaseId) || PHASES[0],
    [activePhaseId]
  );

  return (
    <motion.div
      variants={LAUNCH_CONTROL_VARIANTS.container}
      initial="initial"
      animate="animate"
      className="h-full flex flex-col p-8 overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_400px] gap-8 h-full min-h-0">
        
        {/* LEFT SIDEBAR */}
        <div className="flex flex-col h-full min-h-0">
          <div className="mb-6 px-4">
            <h2 className="text-xs font-bold text-white/30 uppercase tracking-[0.3em]">
              Phase Lifecycle
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <PhaseSidebar
              phases={PHASES}
              activePhaseId={activePhaseId}
              onPhaseSelect={setActivePhaseId}
            />
          </div>
        </div>

        {/* CENTER */}
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
            <MissionControl phase={activePhase} />
          </div>
        </div>

        {/* RIGHT TERMINAL */}
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
          <TerminalControl />
        </div>
      </div>
    </motion.div>
  );
});

LaunchControl.displayName = 'LaunchControl';
