import { create } from 'zustand';
import type { Prospect, PipelineStage } from '@/types';
import { mapBackendProspect } from '@/types';
import { mockProspects } from '@/data/prospects';

interface ProspectsState {
  prospects: Prospect[];
  loading: boolean;
  isLoaded: boolean;
  isFallbackMode: boolean;
  trashCount: number;

  fetchProspects: (force?: boolean) => Promise<void>;
  updateStage: (id: string, stage: PipelineStage) => Promise<void>;
  batchUpdateStage: (ids: string[], stage: PipelineStage) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  deleteProspect: (id: string) => Promise<void>;
  restoreProspect: (id: string) => Promise<void>;
  addProspect: (prospect: Prospect) => void;
  importProspects: (prospects: Prospect[]) => void;
  toggleContacted: (id: string) => Promise<{ isContacted: boolean; company: string }>;

  // Real-time synchronization handlers
  onRemoteDeleted: (id: string, permanent: boolean) => void;
  onRemoteRestored: (doc: any) => void;
  onRemoteUpdated: (id: string, changes: any) => void;
  onRemoteCreated: (doc: any) => void;
}

export const useProspectsStore = create<ProspectsState>((set, get) => ({
  prospects: mockProspects,
  loading: false,
  isLoaded: false,
  isFallbackMode: false,
  trashCount: 0,

  fetchProspects: async (force = false) => {
    // Avoid redundant fetches if already loaded
    if (get().isLoaded && !force) return;

    try {
      set({ loading: true });
      const res = await fetch('/api/prospects?limit=1000');
      if (!res.ok) throw new Error('Erreur de chargement');
      const json = await res.json();

      if (json.source === 'memory_fallback' || json.source === 'local_file_sync') {
        set({ isFallbackMode: true });
      }

      const trashCount = typeof json.meta?.trashCount === 'number' ? json.meta.trashCount : 0;

      if (json.data && Array.isArray(json.data) && json.data.length > 0) {
        set({
          prospects: json.data.map(mapBackendProspect),
          trashCount,
          isLoaded: true,
          loading: false,
        });
      } else {
        set({
          prospects: mockProspects,
          trashCount,
          isLoaded: true,
          loading: false,
        });
      }
    } catch (err) {
      console.warn('[useProspectsStore] Fetch error, keeping local prospects', err);
      set({ isLoaded: true, loading: false, isFallbackMode: true });
    }
  },

  updateStage: async (id: string, stage: PipelineStage) => {
    const isContacted = stage !== 'nouveau';
    const now = new Date();
    const lastContact = isContacted ? "Aujourd'hui" : 'Non contacté';

    // Optimistic update
    set((state) => ({
      prospects: state.prospects.map((p) =>
        p.id === id ? { ...p, stage, lastContact } : p
      ),
    }));

    // Server persistence
    try {
      await fetch(`/api/prospects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage,
          ContactedAt: isContacted ? now.toISOString() : null,
          lastContact,
        }),
      });
    } catch (err) {
      console.warn('[useProspectsStore] Sync error:', err);
    }
  },

  batchUpdateStage: async (ids: string[], stage: PipelineStage) => {
    if (!ids || ids.length === 0) return;
    const isContacted = stage !== 'nouveau';
    const now = new Date();
    const lastContact = isContacted ? "Aujourd'hui" : 'Non contacté';

    // Optimistic update
    set((state) => ({
      prospects: state.prospects.map((p) =>
        ids.includes(p.id) ? { ...p, stage, lastContact } : p
      ),
    }));

    // Server persistence
    try {
      await Promise.allSettled(
        ids.map((id) =>
          fetch(`/api/prospects/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              stage,
              ContactedAt: isContacted ? now.toISOString() : null,
              lastContact,
            }),
          })
        )
      );
    } catch (err) {
      console.warn('[useProspectsStore] Batch sync error:', err);
    }
  },

  toggleContacted: async (id: string) => {
    const current = get().prospects.find((p) => p.id === id);
    const company = current?.company || 'Prospect';
    const isCurrentlyContacted = current?.stage === 'contacte';
    const newStage: PipelineStage = isCurrentlyContacted ? 'nouveau' : 'contacte';

    await get().updateStage(id, newStage);
    return { isContacted: !isCurrentlyContacted, company };
  },

  updateNotes: async (id: string, notes: string) => {
    set((state) => ({
      prospects: state.prospects.map((p) =>
        p.id === id ? { ...p, notes } : p
      ),
    }));

    try {
      await fetch(`/api/prospects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    } catch (err) {
      console.warn('[useProspectsStore] Notes sync error:', err);
    }
  },

  deleteProspect: async (id: string) => {
    set((state) => ({
      prospects: state.prospects.filter((p) => p.id !== id),
      trashCount: state.trashCount + 1,
    }));

    try {
      await fetch(`/api/prospects/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('[useProspectsStore] Delete error:', err);
    }
  },

  restoreProspect: async (id: string) => {
    try {
      const res = await fetch(`/api/prospects/${id}/restore`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const restored = mapBackendProspect(json.data);
          set((state) => ({
            prospects: [restored, ...state.prospects],
            trashCount: Math.max(0, state.trashCount - 1),
          }));
          return;
        }
      }
      set((state) => ({
        trashCount: Math.max(0, state.trashCount - 1),
      }));
    } catch (err) {
      console.warn('[useProspectsStore] Restore error:', err);
    }
  },

  addProspect: (newProspect: Prospect) => {
    set((state) => ({
      prospects: [newProspect, ...state.prospects],
    }));
  },

  importProspects: (newProspects: Prospect[]) => {
    set((state) => ({
      prospects: [...newProspects, ...state.prospects],
    }));
  },

  onRemoteDeleted: (id: string, permanent: boolean) => {
    set((state) => ({
      prospects: state.prospects.filter((p) => p.id !== id),
      trashCount: permanent ? state.trashCount : state.trashCount + 1,
    }));
  },

  onRemoteRestored: (doc: any) => {
    const restored = doc ? mapBackendProspect(doc) : null;
    set((state) => ({
      prospects: restored
        ? (state.prospects.some((p) => p.id === restored.id) ? state.prospects : [restored, ...state.prospects])
        : state.prospects,
      trashCount: Math.max(0, state.trashCount - 1),
    }));
  },

  onRemoteUpdated: (id: string, changes: any) => {
    set((state) => ({
      prospects: state.prospects.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          stage: changes.stage ? changes.stage : p.stage,
          notes: changes.notes !== undefined ? (typeof changes.notes === 'string' ? changes.notes : p.notes) : p.notes,
          lastContact: changes.lastContact || p.lastContact,
        };
      }),
    }));
  },

  onRemoteCreated: (doc: any) => {
    const created = doc ? mapBackendProspect(doc) : null;
    if (!created) return;
    set((state) => ({
      prospects: state.prospects.some((p) => p.id === created.id) ? state.prospects : [created, ...state.prospects],
    }));
  },
}));
