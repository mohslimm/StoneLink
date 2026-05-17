import { eventBus } from '@/core/events/events';
import type { AgentMessage } from './AgentModule.types';

/**
 * Agent Module Service
 * Handles AI message dispatching and response processing
 */
export const agentService = {
  /**
   * Dispatches a message to the AI agent and returns the response
   */
  async sendMessage(
    message: string, 
    history: AgentMessage[], 
    context: any
  ): Promise<string> {
    try {
      eventBus.dispatch('TERMINAL_LOG', 'AGENT_SERVICE', { 
        message: `Sending directive to Claude 3.7: "${message.substring(0, 50)}..."`, 
        type: 'info',
        module: 'agent'
      });

      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          activeProspect: context
        })
      });

      if (!res.ok) throw new Error('AI Agent response failed');
      
      const data = await res.json();

      eventBus.dispatch('TERMINAL_LOG', 'AGENT_SERVICE', { 
        message: `Response received from Agent. Processing context update.`, 
        type: 'success',
        module: 'agent'
      });

      return data.message;
    } catch (error: any) {
      eventBus.dispatch('SYSTEM_ERROR', 'AGENT_SERVICE', { 
        error: 'AI_DISPATCH_FAILED', 
        message: error.message 
      });
      throw error;
    }
  }
};
