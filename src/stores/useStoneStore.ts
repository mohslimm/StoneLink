import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─────────────────────────────────────────────────────────────────
// TYPES & INTERFACES
// ─────────────────────────────────────────────────────────────────

import { 
  Prospect, 
  DealStage, 
  Priority, 
  PipelineFilters, 
  ViewMode, 
  PipelineStats,
  Reminder,
  Activity,
  SentEmail,
  CallNote
} from '@/types/pipeline';

export interface AIAssets {
  siteAdaptation: {
    colorPrimary: string;
    colorAccent: string;
    tagline: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaText: string;
    sections: Array<{ name: string; description: string }>;
    designNotes: string;
    performanceGains: string;
  };
  logoConcept: {
    style: string;
    symbol: string;
    typography: string;
    colorRationale: string;
    concept: string;
  };
  callScript: {
    bestTimeToCall: string;
    opener: string;
    accroche: string;
    pitchCore: string;
    socialProof: string;
    transitionQuestion: string;
    objections: Array<{ trigger: string; response: string }>;
    close: string;
  };
}

export type TerminalEvent = {
  id: string;
  timestamp: Date;
  type: 'scan' | 'detection' | 'generation' | 'success' | 'alert' | 'deploy' | 'info' | 'error' | 'warning';
  module: ModuleId;
  source?: string;
  message: string;
  prospectId?: string;
};

export interface AppNotification {
  id: string;
  timestamp: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  read: boolean;
  autoDismiss?: number;
  cta?: { label: string; action: () => void };
}



export type ModuleId =
  | 'dashboard'
  | 'market-link'
  | 'shadow-intelligence'
  | 'sales-intelligence'
  | 'sales-intel'
  | 'shadow'
  | 'pipeline'
  | 'agent'
  | 'mirror'
  | 'vault'
  | 'sovereign'
  | 'analytics'
  | 'terminal';

interface StoneStore {
  // MODULE ACTIF
  activeModule: ModuleId | null;
  setActiveModule: (id: ModuleId | null) => void;
  navigateTo: (module: ModuleId, prospectId?: string, tab?: string) => void;

  // PROSPECT ACTIF
  activeProspect: Prospect | null;
  setActiveProspect: (p: Prospect | null) => void;

  // PIPELINE UI STATE
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: PipelineFilters;
  setFilters: (filters: Partial<PipelineFilters>) => void;
  isDrawerOpen: boolean;
  selectedProspectId: string | null;
  activeDrawerTab: 'profile' | 'call' | 'prototype' | 'history' | 'mirror' | 'vault';
  openDrawer: (prospectId: string, tab?: 'profile' | 'call' | 'prototype' | 'history' | 'mirror' | 'vault') => void;
  closeDrawer: () => void;

  // LISTE DES PROSPECTS
  prospects: Prospect[];
  setProspects: (p: Prospect[]) => void;
  addProspect: (p: Omit<Prospect, 'id' | 'createdAt' | 'notes' | 'emails' | 'activities' | 'agentHistory'>) => Prospect;
  updateProspect: (id: string, changes: Partial<Prospect>) => void;
  moveProspectToStage: (id: string, stage: DealStage, reason?: string) => void;
  removeProspect: (id: string) => void;
  addNote: (prospectId: string, note: Omit<CallNote, 'id'>) => void;
  addEmail: (prospectId: string, email: Omit<SentEmail, 'id' | 'sentAt' | 'opened' | 'clicked'>) => void;
  addActivity: (prospectId: string, activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  addAgentMessage: (prospectId: string, message: { role: 'user' | 'assistant'; content: string }) => void;
  assignPrototype: (prospectId: string, prototypeId: string) => void;
  setCustomizedPrototypeUrl: (prospectId: string, url: string) => void;
  setProspectReminderAt: (prospectId: string, date: Date) => void;

  // REMINDERS
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id' | 'dismissed'>) => void;
  dismissReminder: (id: string) => void;

  // CSV IMPORT
  importProspects: (data: Array<Omit<Prospect, 'id' | 'notes' | 'emails' | 'activities' | 'createdAt' | 'agentHistory'>>) => {
    imported: number;
    duplicates: number;
    errors: Array<{ row: number; reason: string }>;
  };

  // ASSETS IA
  aiAssets: Record<string, AIAssets>;
  setAIAssets: (prospectId: string, assets: AIAssets) => void;

  // TERMINAL FEED
  terminalEvents: TerminalEvent[];
  addTerminalEvent: (e: Omit<TerminalEvent, 'id' | 'timestamp'>) => void;

  // NOTIFICATIONS
  notifications: AppNotification[];
  pushNotification: (n: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  dismissNotification: (id: string) => void;

  // ÉTAT GLOBAL
  isLoading: boolean;
  globalStatus: 'idle' | 'scanning' | 'generating' | 'calling' | 'ready';
  setGlobalStatus: (s: 'idle' | 'scanning' | 'generating' | 'calling' | 'ready') => void;

  // ACTIONS API
  fetchProspects: () => Promise<void>;
  fetchTerminalEvents: () => Promise<void>;

  // COMPUTED
  getFilteredProspects: () => Prospect[];
  getProspectById: (id: string) => Prospect | undefined;
  updatePriority: (id: string, priority: Priority) => void;
  setDrawerTab: (tab: 'profile' | 'call' | 'prototype' | 'history' | 'mirror' | 'vault') => void;
  getStats: () => PipelineStats;
  getPendingReminders: () => Reminder[];
  purgeSystem: () => void;
  seedSystemData: () => void;
}

// ─────────────────────────────────────────────────────────────────
// STORE IMPLEMENTATION
// ─────────────────────────────────────────────────────────────────

import { MOCK_PROSPECTS } from '@/lib/mockData';

const DEFAULT_FILTERS: PipelineFilters = {
  niche: 'all',
  country: 'all',
  priority: 'all',
  search: '',
  stage: 'all',
};

export const useStoneStore = create<StoneStore>()(
  persist(
    (set, get) => ({
      activeModule: 'dashboard',
      setActiveModule: (id) => set({ activeModule: id }),
      
      navigateTo: (module, prospectId, tab) => {
        set({ activeModule: module });
        if (prospectId) {
          const prospect = get().prospects.find(p => p.id === prospectId);
          if (prospect) {
            set({ activeProspect: prospect, isDrawerOpen: true, activeDrawerTab: (tab as any) || 'profile' });
          }
        }
      },

      activeProspect: null,
      setActiveProspect: (p) => set({ activeProspect: p }),

      // PIPELINE UI STATE
      viewMode: 'dashboard',
      setViewMode: (mode) => set({ viewMode: mode }),
      filters: DEFAULT_FILTERS,
      setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
      isDrawerOpen: false,
      selectedProspectId: null,
      activeDrawerTab: 'profile',
      openDrawer: (prospectId, tab = 'profile') => {
        const prospect = get().prospects.find(p => p.id === prospectId);
        set({ selectedProspectId: prospectId, isDrawerOpen: true, activeDrawerTab: tab, activeProspect: prospect || null });
      },
      closeDrawer: () => set({ isDrawerOpen: false, selectedProspectId: null }),

      // LISTE DES PROSPECTS
      prospects: [],
      isLoading: false,
      setProspects: (p) => set({ prospects: p }),

      fetchProspects: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch('/api/prospects');
          const json = await res.json();
          const rawProspects = json && Array.isArray(json.data) ? json.data : (Array.isArray(json) ? json : []);
          
          // Safeguard all prospects elements with default empty arrays for relations
          const sanitizedProspects = rawProspects.map((p: any) => ({
            ...p,
            notes: p.notes || [],
            emails: p.emails || [],
            activities: p.activities || [],
            agentHistory: p.agentHistory || []
          }));

          set({ prospects: sanitizedProspects });
        } catch (error) {
          console.error('Failed to fetch prospects:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchTerminalEvents: async () => {
        try {
          const res = await fetch('/api/terminal');
          const data = await res.json();
          if (Array.isArray(data)) set({ terminalEvents: data });
        } catch (error) {
          console.error('Failed to fetch terminal events:', error);
        }
      },
      
      addProspect: (p) => {
        const tempId = `TEMP-${Date.now()}`;
        const newProspect: Prospect = {
          ...p,
          id: tempId,
          createdAt: new Date(),
          notes: [],
          emails: [],
          activities: [],
          agentHistory: [],
        };
        
        // Optimistic update
        set((state) => ({ prospects: [newProspect, ...state.prospects] }));

        // Async persistence
        fetch('/api/prospects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(p),
        }).then(async (res) => {
          const saved = await res.json();
          const persistedProspect = saved && saved.data ? saved.data : saved;
          
          // Ensure arrays are populated to prevent downstream TypeErrors
          const sanitizedProspect = {
            ...persistedProspect,
            notes: persistedProspect.notes || [],
            emails: persistedProspect.emails || [],
            activities: persistedProspect.activities || [],
            agentHistory: persistedProspect.agentHistory || []
          };

          set((state) => ({
            prospects: state.prospects.map(pr => pr.id === tempId ? sanitizedProspect : pr)
          }));
          
          get().addTerminalEvent({
            message: `Prospect ${sanitizedProspect.companyName} persisté en base de données`,
            type: 'success',
            module: 'pipeline'
          });
        }).catch(err => {
          console.error("Failed to persist prospect:", err);
        });

        return newProspect;
      },

      updateProspect: (id, changes) => {
        // Optimistic update
        set((state) => ({
          prospects: state.prospects.map((p) => p.id === id ? { ...p, ...changes } : p),
          activeProspect: state.activeProspect?.id === id 
            ? { ...state.activeProspect, ...changes } 
            : state.activeProspect
        }));

        // Async persistence
        fetch(`/api/prospects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changes),
        });
      },

      moveProspectToStage: (id, stage, reason) => {
        set((state) => {
          const updatedProspects = state.prospects.map((p) =>
            p.id === id ? { ...p, stage, lostReason: reason || p.lostReason } : p
          );
          const activeProspect = state.activeProspect?.id === id 
            ? updatedProspects.find(p => p.id === id) || null 
            : state.activeProspect;
          
          const p = updatedProspects.find(x => x.id === id);
          if (p) {
             const activity: Activity = {
               id: `act-${Date.now()}`,
               timestamp: new Date(),
               type: 'stage_change',
               description: `Passage à l'étape: ${stage}${reason ? ` (${reason})` : ''}`
             };
             p.activities.push(activity);
          }

          return { prospects: updatedProspects, activeProspect };
        });
      },

      removeProspect: (id) => set((state) => ({
        prospects: state.prospects.filter((p) => p.id !== id)
      })),

      addNote: (prospectId, note) => {
        const newNote: CallNote = { ...note, id: `note-${Date.now()}` };
        set((state) => ({
          prospects: state.prospects.map((p) =>
            p.id === prospectId
              ? {
                  ...p,
                  notes: [...p.notes, newNote],
                  lastContactedAt: new Date(),
                }
              : p
          ),
        }));
      },

      addEmail: (prospectId, email) => {
        const newEmail: SentEmail = { ...email, id: `email-${Date.now()}`, sentAt: new Date(), opened: false, clicked: false };
        set((state) => ({
          prospects: state.prospects.map((p) =>
            p.id === prospectId
              ? { ...p, emails: [...p.emails, newEmail] }
              : p
          ),
        }));
      },

      addActivity: (prospectId, activity) => {
        const newActivity: Activity = {
          ...activity,
          id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
          timestamp: new Date(),
        };
        set((state) => {
          const updatedProspects = state.prospects.map((p) =>
            p.id === prospectId ? { ...p, activities: [newActivity, ...p.activities] } : p
          );
          const activeProspect = state.activeProspect?.id === prospectId 
            ? updatedProspects.find(p => p.id === prospectId) || null 
            : state.activeProspect;
          return { prospects: updatedProspects, activeProspect };
        });
      },

      addAgentMessage: (prospectId, message) => {
        const newMessage = {
          ...message,
          timestamp: new Date()
        };
        set((state) => {
          const updatedProspects = state.prospects.map((p) =>
            p.id === prospectId ? { ...p, agentHistory: [...(p.agentHistory || []), newMessage] } : p
          );
          const activeProspect = state.activeProspect?.id === prospectId 
            ? updatedProspects.find(p => p.id === prospectId) || null 
            : state.activeProspect;
          return { prospects: updatedProspects, activeProspect };
        });
      },

      assignPrototype: (prospectId, prototypeId) => {
        set((state) => {
          const updatedProspects = state.prospects.map((p) =>
            p.id === prospectId ? { ...p, prototypeId, stage: p.stage === 'interested' ? 'prototype_sent' : p.stage } : p
          );
          const activeProspect = state.activeProspect?.id === prospectId 
            ? updatedProspects.find(p => p.id === prospectId) || null 
            : state.activeProspect;
          return { prospects: updatedProspects, activeProspect };
        });
      },

      setCustomizedPrototypeUrl: (prospectId, url) => {
        set((state) => {
          const updatedProspects = state.prospects.map((p) =>
            p.id === prospectId ? { ...p, customizedPrototypeUrl: url } : p
          );
          const activeProspect = state.activeProspect?.id === prospectId 
            ? updatedProspects.find(p => p.id === prospectId) || null 
            : state.activeProspect;
          return { prospects: updatedProspects, activeProspect };
        });
      },
      setProspectReminderAt: (prospectId, date) => {
        set((state) => {
          const updatedProspects = state.prospects.map((p) =>
            p.id === prospectId ? { ...p, lastReminderAt: date } : p
          );
          const activeProspect = state.activeProspect?.id === prospectId 
            ? updatedProspects.find(p => p.id === prospectId) || null 
            : state.activeProspect;
          return { prospects: updatedProspects, activeProspect };
        });
      },

      // REMINDERS
      reminders: [],
      addReminder: (reminder) => set((state) => ({
        reminders: [...state.reminders, { ...reminder, id: `rem-${Date.now()}`, dismissed: false }]
      })),
      dismissReminder: (id) => set((state) => ({
        reminders: state.reminders.map((r) => r.id === id ? { ...r, dismissed: true } : r)
      })),

      // CSV IMPORT
      importProspects: (data) => {
        const newProspects = data.map(p => ({
          ...p,
          id: `DZ-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          createdAt: new Date(),
          notes: [],
          emails: [],
          activities: [],
          stage: p.stage || 'new',
          priority: p.priority || 'cold',
          agentHistory: [],
        }));
        set((state) => ({ prospects: [...newProspects, ...state.prospects] }));
        return { imported: newProspects.length, duplicates: 0, errors: [] };
      },

      // ASSETS IA
      aiAssets: {},
      setAIAssets: (prospectId, assets) => set((state) => ({
        aiAssets: { ...state.aiAssets, [prospectId]: assets }
      })),

      // TERMINAL FEED
      terminalEvents: [],
      addTerminalEvent: (eventData: Omit<TerminalEvent, 'id' | 'timestamp'>) => {
        const newEvent: TerminalEvent = {
          id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          ...eventData
        };
        
        set((state) => ({
          terminalEvents: [...state.terminalEvents, newEvent].slice(-100)
        }));

        // Async persistence
        fetch('/api/terminal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent),
        }).catch(err => console.error('Failed to persist terminal event:', err));
      },

      // NOTIFICATIONS
      notifications: [],
      pushNotification: (n) => {
        const newNotif: AppNotification = {
          ...n,
          id: `nt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          read: false,
        };
        set((state) => ({ notifications: [newNotif, ...state.notifications] }));
        if (n.autoDismiss) {
          setTimeout(() => {
            get().dismissNotification(newNotif.id);
          }, n.autoDismiss);
        }
      },

      markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) => n.id === id ? { ...n, read: true } : n)
      })),

      dismissNotification: (id) => set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id)
      })),

      // ÉTAT GLOBAL
      globalStatus: 'idle',
      setGlobalStatus: (s) => set({ globalStatus: s }),

      // COMPUTED
      getFilteredProspects: () => {
        const { prospects, filters } = get();
        return prospects.filter((p) => {
          if (filters.niche !== 'all' && p.niche !== filters.niche) return false;
          if (filters.country !== 'all' && p.country !== filters.country) return false;
          if (filters.priority !== 'all' && p.priority !== filters.priority) return false;
          if (filters.stage !== 'all' && p.stage !== filters.stage) return false;
          if (filters.search) {
            const q = filters.search.toLowerCase();
            return (
              p.companyName.toLowerCase().includes(q) ||
              p.contactName.toLowerCase().includes(q) ||
              p.email.toLowerCase().includes(q)
            );
          }
          return true;
        });
      },

      getProspectById: (id) => get().prospects.find((p) => p.id === id),

      updatePriority: (id, priority) => get().updateProspect(id, { priority }),

      setDrawerTab: (tab) => set({ activeDrawerTab: tab }),

      getStats: () => {
        const prospects = get().prospects;
        
        let totalEmails = 0;
        let openedEmails = 0;
        let totalMirrors = 0;
        let clickedMirrors = 0; // Simulation car pas de flag clickMirror dans le store actuel
        
        const byStage: Record<string, number> = {};
        let weightedPipelineValue = 0;

        prospects.forEach(p => {
          byStage[p.stage] = (byStage[p.stage] || 0) + 1;
          
          // Weighted value (simplified weights based on stage)
          const weight = p.stage === 'closed_won' ? 1 : 
                         p.stage === 'negotiation' ? 0.8 :
                         p.stage === 'proposal' ? 0.5 :
                         p.stage === 'meeting' ? 0.3 : 0.1;
          weightedPipelineValue += (p.estimatedDealValue || 0) * weight;

          p.emails.forEach(e => {
            totalEmails++;
            if (e.opened) openedEmails++;
          });

          if (p.mirrorUrl) {
            totalMirrors++;
            // Simulation: on considère le mirror comme ouvert s'il y a eu un call récemment ou un email click
            if (p.emails.some(e => e.clicked)) clickedMirrors++;
          }
        });

        const emailOpenRate = totalEmails > 0 ? (openedEmails / totalEmails) * 100 : 0;
        const mirrorClickRate = totalMirrors > 0 ? (clickedMirrors / totalMirrors) * 100 : 0;

        return {
          totalProspects: prospects.length,
          hotLeads: prospects.filter(p => p.priority === 'hot').length,
          callsToday: 0,
          prototypesSent: prospects.filter(p => p.stage === 'prototype_sent').length,
          pipelineValue: prospects.reduce((sum, p) => sum + (p.estimatedDealValue || 0), 0),
          weightedPipelineValue,
          closedWonThisMonth: prospects.filter(p => p.stage === 'closed_won').length,
          closedWonValueThisMonth: prospects.filter(p => p.stage === 'closed_won').reduce((sum, p) => sum + (p.estimatedDealValue || 0), 0),
          byStage,
          emailOpenRate,
          mirrorClickRate
        };
      },

      getPendingReminders: () => [], // Simplified

      purgeSystem: () => {
        set({
          prospects: [],
          terminalEvents: [],
          notifications: [],
          activeProspect: null,
          selectedProspectId: null,
          isDrawerOpen: false,
          aiAssets: {},
          filters: DEFAULT_FILTERS,
          globalStatus: 'ready'
        });
        
        get().addTerminalEvent({
          type: 'alert',
          module: 'terminal',
          message: 'SYSTÈME PURGÉ : État réinitialisé, base de données vide.'
        });
      },

      seedSystemData: () => {
        const seedData: Array<Omit<Prospect, 'id' | 'notes' | 'emails' | 'activities' | 'createdAt' | 'agentHistory'>> = [
          {
            companyName: 'Smile Bright Dentistry',
            contactName: 'Dr. Sarah Miller',
            email: 'dr.miller@smilebright.com',
            phone: '+33 6 12 34 56 78',
            website: 'https://smilebright.com',
            niche: 'dental',
            country: 'FR',
            city: 'Paris',
            stage: 'new',
            priority: 'hot',
            estimatedDealValue: 15000,
          },
          {
            companyName: 'Elite Orthodontics',
            contactName: 'Dr. James Wilson',
            email: 'j.wilson@eliteortho.com',
            phone: '+1 555-5678',
            website: 'https://eliteortho.com',
            niche: 'dental',
            country: 'CA',
            city: 'Toronto',
            stage: 'interested',
            priority: 'warm',
            estimatedDealValue: 25000,
          },
          {
            companyName: 'Luxury Escapes Travel',
            contactName: 'Marc Lefebvre',
            email: 'm.lefebvre@luxescapes.fr',
            phone: '+33 1 45 67 89 01',
            website: 'https://luxescapes.fr',
            niche: 'travel',
            country: 'FR',
            city: 'Lyon',
            stage: 'to_call',
            priority: 'warm',
            estimatedDealValue: 8000,
          },
          {
            companyName: 'Global Explorer Tours',
            contactName: 'Elena Rodriguez',
            email: 'e.rodriguez@globalexplorer.com',
            phone: '+34 91 234 56 78',
            website: 'https://globalexplorer.com',
            niche: 'travel',
            country: 'DZ',
            city: 'Alger',
            stage: 'new',
            priority: 'cold',
            estimatedDealValue: 5000,
          },
          {
            companyName: 'Dental Care Center',
            contactName: 'Dr. Robert Chen',
            email: 'contact@dentalcare-ny.com',
            phone: '+1 212-555-9988',
            website: 'https://dentalcare-ny.com',
            niche: 'dental',
            country: 'TN',
            city: 'Tunis',
            stage: 'meeting',
            priority: 'hot',
            estimatedDealValue: 45000,
          }
        ];
        
        get().importProspects(seedData);
        
        get().addTerminalEvent({
          type: 'success',
          module: 'terminal',
          message: 'BASE DE DONNÉES ALIMENTÉE : Leads stratégiques injectés.'
        });
      },
    }),
    {
      name: 'stonelink-ultimate-storage',
      partialize: (state) => ({ 
        prospects: state.prospects,
        aiAssets: state.aiAssets,
        terminalEvents: state.terminalEvents,
        viewMode: state.viewMode,
        filters: state.filters
      }),
    }
  )
);
