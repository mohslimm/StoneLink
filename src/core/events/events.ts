import { EventEmitter } from 'events';

/**
 * StoneLink OS Event Registry
 * Centralized events for the autonomous agency OS
 */
export type StoneLinkEvent = 
  | 'PROSPECT_CREATED'
  | 'PROSPECT_UPDATED'
  | 'PROSPECT_DELETED'
  | 'AI_ANALYSIS_STARTED'
  | 'AI_ANALYSIS_COMPLETED'
  | 'AI_ANALYSIS_FAILED'
  | 'OUTREACH_TRIGGERED'
  | 'OUTREACH_SENT'
  | 'DEAL_CLOSED'
  | 'SYSTEM_ERROR'
  | 'TERMINAL_LOG';

export interface EventPayload<T = any> {
  id: string;
  timestamp: string;
  source: string;
  data: T;
}

class StoneLinkEventBus extends EventEmitter {
  private static instance: StoneLinkEventBus;

  private constructor() {
    super();
    // Increase max listeners for large modular system
    this.setMaxListeners(100);
  }

  public static getInstance(): StoneLinkEventBus {
    if (!StoneLinkEventBus.instance) {
      StoneLinkEventBus.instance = new StoneLinkEventBus();
    }
    return StoneLinkEventBus.instance;
  }

  /**
   * Emit a domain event with standard payload
   */
  public dispatch<T>(event: StoneLinkEvent, source: string, data: T) {
    const payload: EventPayload<T> = {
      id: Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      source,
      data
    };
    
    this.emit(event, payload);
    
    // Always log to terminal for real-time observability
    if (event !== 'TERMINAL_LOG') {
      this.dispatch('TERMINAL_LOG', 'EVENT_BUS', {
        type: 'info',
        message: `[${event}] from ${source}`,
        originalEvent: event
      });
    }
  }
}

export const eventBus = StoneLinkEventBus.getInstance();
