import { EventEmitter } from 'events';

export type RealtimeEventType =
  | 'prospect:deleted'
  | 'prospect:restored'
  | 'prospect:updated'
  | 'prospect:created'
  | 'prospect:trash_emptied'
  | 'prospect:bulk_restored'
  | 'copilot:focus_updated';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: any;
  timestamp: string;
}

const GLOBAL_EVENT_EMITTER_KEY = '__stonelink_event_bus__';

function getEventBus(): EventEmitter {
  if (!(globalThis as any)[GLOBAL_EVENT_EMITTER_KEY]) {
    const bus = new EventEmitter();
    bus.setMaxListeners(200);
    (globalThis as any)[GLOBAL_EVENT_EMITTER_KEY] = bus;
  }
  return (globalThis as any)[GLOBAL_EVENT_EMITTER_KEY];
}

export const eventBus = getEventBus();

export function emitRealtimeEvent(type: RealtimeEventType, payload: any) {
  const event: RealtimeEvent = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };
  eventBus.emit('crm_event', event);
}
