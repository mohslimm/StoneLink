import { create } from 'zustand';
import type { Prospect, CallOutcome } from '@/types';

interface CallState {
  isActive: boolean;
  prospect: Prospect | null;
  elapsedSeconds: number;
  currentPhase: number;
  completedPhases: number[];
  isMuted: boolean;
  isHeld: boolean;
  callOutcome: CallOutcome | null;

  startCall: (prospect: Prospect) => void;
  endCall: () => void;
  incrementTimer: () => void;
  advancePhase: () => void;
  jumpToPhase: (n: number) => void;
  toggleMute: () => void;
  toggleHold: () => void;
  setOutcome: (outcome: CallOutcome) => void;
  resetCall: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  isActive: false,
  prospect: null,
  elapsedSeconds: 0,
  currentPhase: 0,
  completedPhases: [],
  isMuted: false,
  isHeld: false,
  callOutcome: null,

  startCall: (prospect) =>
    set({ isActive: true, prospect, elapsedSeconds: 0, currentPhase: 0, completedPhases: [], callOutcome: null }),

  endCall: () => set({ isActive: false, isMuted: false, isHeld: false }),

  incrementTimer: () => {
    const state = get();
    if (state.isActive && !state.isHeld) {
      set({ elapsedSeconds: state.elapsedSeconds + 1 });
    }
  },

  advancePhase: () => {
    const state = get();
    if (state.currentPhase < 5) {
      set({
        completedPhases: [...state.completedPhases, state.currentPhase],
        currentPhase: state.currentPhase + 1,
      });
    }
  },

  jumpToPhase: (n) => set({ currentPhase: n }),

  toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),
  toggleHold: () => set((s) => ({ isHeld: !s.isHeld })),

  setOutcome: (outcome) => set({ callOutcome: outcome }),

  resetCall: () =>
    set({
      isActive: false,
      prospect: null,
      elapsedSeconds: 0,
      currentPhase: 0,
      completedPhases: [],
      isMuted: false,
      isHeld: false,
      callOutcome: null,
    }),
}));
