import { eventBus } from '@/core/events/events';
import { Prospect } from '@/types/pipeline';

/**
 * Sales Intelligence Module Service
 * Orchestrates AI asset generation and cross-module sync
 */
export const salesIntelService = {
  /**
   * Generates full AI package (site, logo, script) for a prospect
   */
  async generatePackage(prospect: Prospect, onProgress: (msg: string) => void) {
    if (!prospect) throw new Error("Aucun prospect sélectionné.");

    try {
      eventBus.dispatch('AI_ANALYSIS_STARTED', 'SALES_INTEL_SERVICE', { 
        prospectId: prospect.id, 
        task: 'full_generation' 
      });

      eventBus.dispatch('TERMINAL_LOG', 'SALES_INTEL_SERVICE', { 
        message: `Initialisation de la Sales Intelligence pour ${prospect.companyName}...`, 
        type: 'info',
        module: 'agent'
      });

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche: prospect.niche,
          name: prospect.companyName,
          city: prospect.city,
          website: prospect.website,
          lighthouseScore: prospect.lighthouseScore,
          estimatedLoss: prospect.estimatedLoss,
          context: prospect.notes?.[0]?.content || 'Prospect à fort potentiel'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur inconnue lors de la génération');
      }

      eventBus.dispatch('AI_ANALYSIS_COMPLETED', 'SALES_INTEL_SERVICE', { 
        prospectId: prospect.id, 
        assets: data 
      });

      eventBus.dispatch('TERMINAL_LOG', 'SALES_INTEL_SERVICE', { 
        message: `Intelligence générée avec succès pour ${prospect.companyName}`, 
        type: 'success',
        module: 'agent'
      });

      return data;
    } catch (error: any) {
      const msg = error.message || "Une erreur technique a interrompu la génération.";
      
      eventBus.dispatch('AI_ANALYSIS_FAILED', 'SALES_INTEL_SERVICE', { 
        prospectId: prospect.id, 
        error: msg 
      });

      eventBus.dispatch('TERMINAL_LOG', 'SALES_INTEL_SERVICE', { 
        message: `Échec de génération: ${msg}`, 
        type: 'error',
        module: 'agent'
      });

      throw error;
    }
  }
};
