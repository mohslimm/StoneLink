import { eventBus } from '@/core/events/events';
import type { AuditResult } from './MarketLinkModule.types';

/**
 * Market Link Module Service
 * Business logic for infrastructure auditing and scoring
 */
export const marketLinkService = {
  /**
   * Run a full infrastructure audit for a given URL
   */
  async runAudit(url: string, onStepChange: (step: number) => void): Promise<AuditResult> {
    try {
      // 1. Initial log
      eventBus.dispatch('TERMINAL_LOG', 'MARKET_LINK_SERVICE', { 
        message: `Lancement de l'audit Market Link pour: ${url}`, 
        type: 'info',
        module: 'market-link'
      });

      // Phase 1: DNS/WAF Negotiation Simulation
      onStepChange(1);
      await new Promise(r => setTimeout(r, 1200));
      
      eventBus.dispatch('TERMINAL_LOG', 'MARKET_LINK_SERVICE', { 
        message: `Résolution DNS effectuée. Négociation avec le WAF de ${url}...`, 
        type: 'info',
        module: 'market-link'
      });

      // Phase 2: Lighthouse Analysis Simulation
      onStepChange(2);

      // Actual API Call
      const res = await fetch('/api/market-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Audit Cible', website: url })
      });
      
      if (!res.ok) throw new Error("Échec de l'audit distant.");
      
      const data = await res.json();
      
      // Delay to simulate deep analysis
      await new Promise(r => setTimeout(r, 1800));
      
      // Final Success Log
      eventBus.dispatch('TERMINAL_LOG', 'MARKET_LINK_SERVICE', { 
        message: `Audit terminé. Score Global: ${data.audit.lighthouseScore}/100. Failles identifiées.`, 
        type: 'success',
        module: 'market-link'
      });

      // Dispatch event for other modules (e.g., Sales Intel could use this data)
      eventBus.dispatch('AI_ANALYSIS_COMPLETED', 'MARKET_LINK_SERVICE', { 
        target: url, 
        score: data.audit.lighthouseScore,
        result: data.audit 
      });

      return data.audit;
    } catch (error: any) {
      const msg = error.message || "Une erreur est survenue lors de l'audit.";
      
      eventBus.dispatch('SYSTEM_ERROR', 'MARKET_LINK_SERVICE', { 
        error: 'AUDIT_FAILED', 
        url, 
        message: msg 
      });

      eventBus.dispatch('TERMINAL_LOG', 'MARKET_LINK_SERVICE', { 
        message: `ERREUR: ${msg}`, 
        type: 'alert',
        module: 'market-link'
      });

      throw error;
    }
  }
};
