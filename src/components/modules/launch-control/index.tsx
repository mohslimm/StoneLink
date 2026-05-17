'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PHASES } from './constants';
import { PhaseSidebar } from './PhaseSidebar';
import { MissionControl } from './MissionControl';
import { TerminalControl } from './TerminalControl';
import { LAUNCH_CONTROL_VARIANTS } from './LaunchControl.variants';
import { useLaunchControl } from './launch-control.hooks';

export const LaunchControl = memo(() => {
  const { activePhaseId, setActivePhaseId } = useLaunchControl();

  const activePhase = useMemo(() => 
    PHASES.find(p => p.id === activePhaseId) || PHASES[0],
    [activePhaseId]
  );

  return (
    <motion.div 
      variants={LAUNCH_CONTROL_VARIANTS.container}
      initial="initial"
      animate="animate"
      className="h-full flex flex-col p-4 md:p-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr_400px] gap-8 h-full min-h-0">
        {/* Navigation Sidebar */}
        <div className="flex flex-col h-full">
          <h2 className="text-[10px] font-bold text-[#f0ede8]/30 uppercase tracking-[0.3em] mb-6 px-4">
            Phase Lifecycle
          </h2>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
            <PhaseSidebar 
              phases={PHASES} 
              activePhaseId={activePhaseId} 
              onPhaseSelect={setActivePhaseId} 
            />
          </div>
        </div>

        {/* Central Intelligence Section */}
        <div className="flex flex-col h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/5">
          <MissionControl phase={activePhase} />
        </div>

        {/* Real-time Feedback Terminal */}
        <div className="flex flex-col h-full overflow-hidden">
          <TerminalControl />
        </div>
      </div>
    </motion.div>
  );
});

LaunchControl.displayName = 'LaunchControl';

export default LaunchControl;
