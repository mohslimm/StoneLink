import { Prospect, CustomizeRequest, CustomizeResponse } from '@/types/pipeline';

/**
 * Pipeline Module API
 * Responsible for backend communication
 */
export const pipelineApi = {
  /**
   * Fetch all prospects for the current user/tenant
   */
  async getProspects(): Promise<Prospect[]> {
    const response = await fetch('/api/pipeline/prospects');
    if (!response.ok) throw new Error('FETCH_PROSPECT_FAILED');
    return response.json();
  },

  /**
   * Create a new prospect and trigger the autonomous scoring event
   */
  async createProspect(prospect: Partial<Prospect>): Promise<Prospect> {
    const response = await fetch('/api/market-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prospect),
    });
    if (!response.ok) throw new Error('CREATE_PROSPECT_FAILED');
    return response.json();
  },

  /**
   * Update prospect stage
   */
  async updateStage(prospectId: string, stage: string): Promise<void> {
    const response = await fetch(`/api/pipeline/prospects/${prospectId}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    });
    if (!response.ok) throw new Error('UPDATE_STAGE_FAILED');
  },

  /**
   * Generate customized prototype
   */
  async customizePrototype(req: CustomizeRequest): Promise<CustomizeResponse> {
    const response = await fetch('/api/prototypes/customize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!response.ok) throw new Error('CUSTOMIZATION_FAILED');
    return response.json();
  }
};
