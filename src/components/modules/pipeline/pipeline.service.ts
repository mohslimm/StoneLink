import { eventBus } from '@/core/events/events';
import { pipelineApi } from './pipeline.api';
import { Prospect, DealStage } from '@/types/pipeline';

/**
 * Pipeline Module Service
 * Business logic and event orchestration
 */
export const pipelineService = {
  /**
   * Orchestrates prospect creation: API call + Event dispatching
   */
  async addProspect(data: Partial<Prospect>) {
    try {
      const newProspect = await pipelineApi.createProspect(data);
      
      // Emit event for autonomous AI scoring and enrichment
      eventBus.dispatch('PROSPECT_CREATED', 'PIPELINE_MODULE', newProspect);
      
      return newProspect;
    } catch (error) {
      eventBus.dispatch('SYSTEM_ERROR', 'PIPELINE_SERVICE', { error: 'ADD_PROSPECT_FAILED', data });
      throw error;
    }
  },

  /**
   * Handles stage transitions and potentially triggers outreach events
   */
  async moveProspect(id: string, stage: DealStage) {
    try {
      await pipelineApi.updateStage(id, stage);
      
      eventBus.dispatch('PROSPECT_UPDATED', 'PIPELINE_MODULE', { id, stage });

      // If moved to 'interested', trigger prototype generation event
      if (stage === 'interested') {
        eventBus.dispatch('AI_ANALYSIS_STARTED', 'PIPELINE_SERVICE', { prospectId: id, task: 'generate_prototype' });
      }

      return true;
    } catch (error) {
      eventBus.dispatch('SYSTEM_ERROR', 'PIPELINE_SERVICE', { error: 'MOVE_PROSPECT_FAILED', id, stage });
      return false;
    }
  },

  /**
   * Calculate pipeline health and ROI projections
   */
  calculateROI(prospects: Prospect[]) {
    const totalValue = prospects.reduce((acc, p) => acc + (p.estimatedDealValue || 0), 0);
    const winRate = 0.25; // Base assumption
    return {
      potentialRevenue: totalValue,
      projectedRevenue: totalValue * winRate,
      efficiency: prospects.length > 0 ? (prospects.filter(p => p.stage === 'closed_won').length / prospects.length) * 100 : 0
    };
  }
};
