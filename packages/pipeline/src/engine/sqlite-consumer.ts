import { dumbo } from '@event-driven-io/dumbo';
import { sqlite3DumboDriver } from '@event-driven-io/dumbo/sqlite3';
import { readMessagesBatch } from '@event-driven-io/emmett-sqlite';
import type { PipelineStore } from './sqlite-store.js';

type EventHandler = (event: { type: string; data: Record<string, unknown> }) => void;

export function createConsumer(store: PipelineStore) {
  const handlers = new Map<string, EventHandler>();
  let lastPosition = 0n;
  const pool = dumbo({ driver: sqlite3DumboDriver, fileName: store.fileName });

  return {
    on(eventType: string, handler: EventHandler): void {
      handlers.set(eventType, handler);
    },

    async poll(): Promise<void> {
      const { messages, currentGlobalPosition } = await readMessagesBatch(pool.execute, {
        after: lastPosition,
        batchSize: 1000,
      });

      for (const message of messages) {
        const handler = handlers.get(message.type);
        if (handler) {
          handler({ type: message.type, data: message.data as Record<string, unknown> });
        }
      }

      if (messages.length > 0) {
        lastPosition = currentGlobalPosition;
      }
    },
  };
}
