import { useStoneStore } from '@/stores/useStoneStore';
import { pipelineService } from './pipeline.service';
import { Prospect, DealStage } from '@/types/pipeline';
import { useCallback } from 'react';

/**
 * Pipeline Module Hooks
 * State logic and action binding
 */
export const usePipeline = () => {
  const store = useStoneStore();

  const createProspect = useCallback(async (data: Partial<Prospect>) => {
    const prospect = await pipelineService.addProspect(data);
    store.addProspect(prospect); // Update local state for immediate feedback
    return prospect;
  }, [store]);

  const updateProspectStage = useCallback(async (id: string, stage: DealStage) => {
    const success = await pipelineService.moveProspect(id, stage);
    if (success) {
      store.moveProspectToStage(id, stage);
    }
    return success;
  }, [store]);

  return {
    prospects: store.prospects,
    stats: store.getStats(),
    createProspect,
    updateProspectStage,
    getFilteredProspects: store.getFilteredProspects,
    addTerminalEvent: store.addTerminalEvent
  };
};
