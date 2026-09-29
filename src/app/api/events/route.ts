import { eventBus, type RealtimeEvent } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Initial handshake
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: 'connected', time: new Date().toISOString() })}\n\n`)
      );

      const handleEvent = (event: RealtimeEvent) => {
        try {
          controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(event)}\n\n`));
        } catch {
          // Stream closed
        }
      };

      eventBus.on('crm_event', handleEvent);

      // Heartbeat every 15 seconds
      const interval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(interval);
        }
      }, 15000);

      // Disconnect cleanup
      request.signal.addEventListener('abort', () => {
        eventBus.off('crm_event', handleEvent);
        clearInterval(interval);
        try {
          controller.close();
        } catch {
          // Already closed
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
