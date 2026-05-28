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
  rawScript: string;
  script: any | null;
  scriptLoading: boolean;

  startCall: (prospect: Prospect) => void;
  endCall: () => void;
  incrementTimer: () => void;
  advancePhase: () => void;
  jumpToPhase: (n: number) => void;
  toggleMute: () => void;
  toggleHold: () => void;
  setOutcome: (outcome: CallOutcome) => void;
  resetCall: () => void;
  appendRawScript: (text: string) => void;
  setScript: (script: any) => void;
  setScriptLoading: (loading: boolean) => void;
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
  rawScript: '',
  script: null,
  scriptLoading: false,

  startCall: (prospect) =>
    set({ isActive: true, prospect, elapsedSeconds: 0, currentPhase: 0, completedPhases: [], callOutcome: null, rawScript: '', script: null, scriptLoading: true }),

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

  appendRawScript: (text) => set((s) => ({ rawScript: s.rawScript + text })),
  setScript: (script) => set({ script, scriptLoading: false }),
  setScriptLoading: (loading) => set({ scriptLoading: loading }),

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
      rawScript: '',
      script: null,
      scriptLoading: false,
    }),
}));
