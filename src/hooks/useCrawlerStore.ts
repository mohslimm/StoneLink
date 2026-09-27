import { create } from 'zustand';

export interface CrawlerState {
  isRunning: boolean;
  status: 'idle' | 'running' | 'completed' | 'stopped' | 'error';
  pid: number | null;
  query: string;
  area: string;
  targetCount: number;
  currentCount: number;
  currentCombination: string;
  currentLead: string;
  openBrowser: boolean;
  testMode: boolean;
  logs: string[];
  latestResults: {
    status: string;
    timestamp: string;
    query: string;
    area: string;
    total: number;
    leads: any[];
  } | null;
  isMonitorOpen: boolean;

  setIsMonitorOpen: (open: boolean) => void;
  fetchStatus: () => Promise<void>;
  stopCrawler: () => Promise<{ success: boolean; savedCount: number }>;
  startCrawler: (params: {
    query: string;
    area: string;
    count: number;
    onlyNoWebsite: boolean;
    testMode: boolean;
    openBrowser: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
}

export const useCrawlerStore = create<CrawlerState>((set, get) => ({
  isRunning: false,
  status: 'idle',
  pid: null,
  query: '',
  area: '',
  targetCount: 0,
  currentCount: 0,
  currentCombination: '',
  currentLead: '',
  openBrowser: false,
  testMode: false,
  logs: [],
  latestResults: null,
  isMonitorOpen: false,

  setIsMonitorOpen: (open) => set({ isMonitorOpen: open }),

  fetchStatus: async () => {
    try {
      const res = await fetch('/api/crawler/status');
      if (!res.ok) return;
      const data = await res.json();
      set({
        isRunning: !!data.isRunning,
        status: data.status || (data.isRunning ? 'running' : 'idle'),
        pid: data.pid || null,
        query: data.query || '',
        area: data.area || '',
        targetCount: data.targetCount || 0,
        currentCount: data.currentCount || 0,
        currentCombination: data.currentCombination || '',
        currentLead: data.currentLead || '',
        openBrowser: !!data.openBrowser,
        testMode: !!data.testMode,
        logs: data.logs || [],
        latestResults: data.latestResults || null,
      });
    } catch (e) {}
  },

  startCrawler: async (params) => {
    try {
      set({
        isRunning: true,
        status: 'running',
        query: params.query,
        area: params.area,
        currentCount: 0,
        currentLead: 'Initialisation du scraper...',
        logs: ['Initialisation du moteur Playwright Stealth...'],
        isMonitorOpen: true,
      });

      const res = await fetch('/api/crawler/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const data = await res.json();
      if (!res.ok) {
        set({ isRunning: false, status: 'error' });
        return { success: false, error: data.error || 'Erreur lors du démarrage' };
      }

      set({ pid: data.pid });
      // Fetch fresh status
      get().fetchStatus();
      return { success: true };
    } catch (err: any) {
      set({ isRunning: false, status: 'error' });
      return { success: false, error: err.message };
    }
  },

  stopCrawler: async () => {
    try {
      const pid = get().pid;
      const res = await fetch('/api/crawler/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid }),
      });
      const data = await res.json();
      set({
        isRunning: false,
        status: 'stopped',
        currentLead: 'Scan arrêté par l’utilisateur',
        latestResults: data.latestResults || get().latestResults,
      });
      get().fetchStatus();
      return { success: true, savedCount: data.savedLeadsCount || 0 };
    } catch (err) {
      return { success: false, savedCount: 0 };
    }
  },
}));
