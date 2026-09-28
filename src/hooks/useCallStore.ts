import { create } from 'zustand';
import type { Prospect, CallOutcome } from '@/types';

export interface LiveTranscriptItem {
  id: string;
  sender: 'prospect' | 'agent' | 'system';
  text: string;
  timestamp: string;
}

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

  // Pre-Call & Voice Matrix
  speakerMode: 'human' | 'ai';
  channelMode: 'phonelink' | 'whatsapp';
  selectedOffer: string;
  isAiSpeaking: boolean;
  isListening: boolean;
  liveTranscript: LiveTranscriptItem[];

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

  setSpeakerMode: (mode: 'human' | 'ai') => void;
  setChannelMode: (mode: 'phonelink' | 'whatsapp') => void;
  setSelectedOffer: (offer: string) => void;
  setIsAiSpeaking: (speaking: boolean) => void;
  setIsListening: (listening: boolean) => void;
  addTranscriptMessage: (sender: 'prospect' | 'agent' | 'system', text: string) => void;
  clearTranscript: () => void;
  takeoverMicrophone: () => void;
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

  speakerMode: 'human',
  channelMode: 'phonelink',
  selectedOffer: 'vitrine',
  isAiSpeaking: false,
  isListening: false,
  liveTranscript: [],

  startCall: (prospect) =>
    set({
      isActive: true,
      prospect,
      elapsedSeconds: 0,
      currentPhase: 0,
      completedPhases: [],
      callOutcome: null,
      rawScript: '',
      script: null,
      scriptLoading: true,
      liveTranscript: [
        {
          id: 'init-1',
          sender: 'system',
          text: `Connexion établie avec ${prospect.company}. Prêt pour l'engagement commercial.`,
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        }
      ],
    }),

  endCall: () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    set({ isActive: false, isMuted: false, isHeld: false, isAiSpeaking: false, isListening: false });
  },

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

  setSpeakerMode: (mode) => set({ speakerMode: mode }),
  setChannelMode: (mode) => set({ channelMode: mode }),
  setSelectedOffer: (offer) => set({ selectedOffer: offer }),
  setIsAiSpeaking: (speaking) => set({ isAiSpeaking: speaking }),
  setIsListening: (listening) => set({ isListening: listening }),

  addTranscriptMessage: (sender, text) => {
    const newItem: LiveTranscriptItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sender,
      text,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    set((s) => ({ liveTranscript: [...s.liveTranscript, newItem] }));
  },

  clearTranscript: () => set({ liveTranscript: [] }),

  takeoverMicrophone: () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    set({ speakerMode: 'human', isAiSpeaking: false });
  },

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
      isAiSpeaking: false,
      isListening: false,
      liveTranscript: [],
    }),
}));
