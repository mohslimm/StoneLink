"use client";

import { useEffect, useState, useRef } from 'react';
import { useProspectsStore } from '@/hooks/useProspectsStore';
import { useUIStore } from '@/hooks/useUIStore';
import type { RealtimeEvent } from '@/lib/events';

interface RealtimeSyncOptions {
  onDeleted?: (id: string) => void;
  onRestored?: (doc: any) => void;
  onRefresh?: () => void;
}

export function useRealtimeSync(options?: RealtimeSyncOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const { onRemoteDeleted, onRemoteRestored, onRemoteUpdated, onRemoteCreated, fetchProspects } = useProspectsStore();
  const { addToast } = useUIStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let isMounted = true;
    let reconnectTimeout: any = null;

    function connect() {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource('/api/events');
      eventSourceRef.current = es;

      es.addEventListener('connected', () => {
        if (!isMounted) return;
        setIsConnected(true);
      });

      es.addEventListener('message', (e) => {
        if (!isMounted) return;
        try {
          const event: RealtimeEvent = JSON.parse(e.data);
          const { type, payload } = event;

          switch (type) {
            case 'prospect:deleted': {
              onRemoteDeleted(payload.id, payload.permanent);
              options?.onDeleted?.(payload.id);
              break;
            }

            case 'prospect:restored': {
              onRemoteRestored(payload.prospect);
              options?.onRestored?.(payload.prospect);
              break;
            }

            case 'prospect:updated': {
              onRemoteUpdated(payload.id, payload);
              break;
            }

            case 'prospect:created': {
              onRemoteCreated(payload.prospect);
              break;
            }

            case 'prospect:bulk_restored':
            case 'prospect:trash_emptied': {
              fetchProspects(true);
              options?.onRefresh?.();
              break;
            }
          }
        } catch (err) {
          console.warn('[useRealtimeSync] Error parsing event:', err);
        }
      });

      es.onerror = () => {
        if (!isMounted) return;
        setIsConnected(false);
        es.close();
        reconnectTimeout = setTimeout(() => {
          if (isMounted) connect();
        }, 3000);
      };
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [onRemoteDeleted, onRemoteRestored, onRemoteUpdated, onRemoteCreated, fetchProspects]);

  return { isConnected };
}
