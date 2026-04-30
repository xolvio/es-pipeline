import { describe, expect, it } from 'vitest';
import type { ItemStatusDocument } from '../projections/item-status-projection';
import type { MessageLogDocument } from '../projections/message-log-projection';
import type { NodeStatusDocument } from '../projections/node-status-projection';
import { createPipelineEventStore } from './pipeline-event-store';

describe('PipelineEventStore', () => {
  describe('appendToStream', () => {
    it('should append events and update projections', async () => {
      const { eventStore, database, close } = createPipelineEventStore();
      try {
        await eventStore.appendToStream('pipeline-c1', [
          {
            type: 'ItemStatusChanged',
            data: {
              correlationId: 'c1',
              commandType: 'Cmd',
              itemKey: 'a',
              requestId: 'r1',
              status: 'running',
              attemptCount: 1,
            },
          },
        ]);

        const collection = database.collection<ItemStatusDocument & { _id: string }>('ItemStatus');
        const items = await collection.find();

        expect(items.length).toBe(1);
        expect(items[0]?.status).toBe('running');
      } finally {
        await close();
      }
    });

    it('should project NodeStatusChanged events', async () => {
      const { eventStore, database, close } = createPipelineEventStore();
      try {
        await eventStore.appendToStream('pipeline-c1', [
          {
            type: 'NodeStatusChanged',
            data: {
              correlationId: 'c1',
              commandName: 'Cmd',
              nodeId: 'node-1',
              status: 'running',
              previousStatus: 'idle',
              pendingCount: 1,
              endedCount: 0,
            },
          },
        ]);

        const collection = database.collection<NodeStatusDocument & { _id: string }>('NodeStatus');
        const nodes = await collection.find();

        expect(nodes.length).toBe(1);
        expect(nodes[0]?.status).toBe('running');
      } finally {
        await close();
      }
    });

    it('should update existing projection documents', async () => {
      const { eventStore, database, close } = createPipelineEventStore();
      try {
        await eventStore.appendToStream('pipeline-c1', [
          {
            type: 'ItemStatusChanged',
            data: {
              correlationId: 'c1',
              commandType: 'Cmd',
              itemKey: 'a',
              requestId: 'r1',
              status: 'running',
              attemptCount: 1,
            },
          },
        ]);

        await eventStore.appendToStream('pipeline-c1', [
          {
            type: 'ItemStatusChanged',
            data: {
              correlationId: 'c1',
              commandType: 'Cmd',
              itemKey: 'a',
              requestId: 'r1',
              status: 'success',
              attemptCount: 1,
            },
          },
        ]);

        const collection = database.collection<ItemStatusDocument & { _id: string }>('ItemStatus');
        const items = await collection.find();

        expect(items.length).toBe(1);
        expect(items[0]?.status).toBe('success');
      } finally {
        await close();
      }
    });
  });

  describe('readModel integration', () => {
    it('should provide working read model queries', async () => {
      const { eventStore, readModel, close } = createPipelineEventStore();
      try {
        await eventStore.appendToStream('pipeline-c1', [
          {
            type: 'ItemStatusChanged',
            data: {
              correlationId: 'c1',
              commandType: 'Cmd',
              itemKey: 'a',
              requestId: 'r1',
              status: 'running',
              attemptCount: 1,
            },
          },
          {
            type: 'ItemStatusChanged',
            data: {
              correlationId: 'c1',
              commandType: 'Cmd',
              itemKey: 'b',
              requestId: 'r2',
              status: 'success',
              attemptCount: 1,
            },
          },
        ]);

        const stats = await readModel.computeCommandStats('c1', 'Cmd');

        expect(stats).toEqual({
          pendingCount: 1,
          endedCount: 1,
          aggregateStatus: 'running',
        });
      } finally {
        await close();
      }
    });

    it('should detect correlation via read model', async () => {
      const { eventStore, readModel, close } = createPipelineEventStore();
      try {
        expect(await readModel.hasCorrelation('c1')).toBe(false);

        await eventStore.appendToStream('pipeline-c1', [
          {
            type: 'NodeStatusChanged',
            data: {
              correlationId: 'c1',
              commandName: 'Cmd',
              nodeId: 'node-1',
              status: 'running',
              previousStatus: 'idle',
              pendingCount: 1,
              endedCount: 0,
            },
          },
        ]);

        expect(await readModel.hasCorrelation('c1')).toBe(true);
      } finally {
        await close();
      }
    });

    it('should append a new message log entry for each NodeStatusChanged even on retry', async () => {
      const { eventStore, readModel, close } = createPipelineEventStore();
      try {
        await eventStore.appendToStream('pipeline-c1', [
          {
            type: 'NodeStatusChanged',
            data: {
              correlationId: 'c1',
              commandName: 'RebuildComponentDB',
              nodeId: 'node-1',
              status: 'running',
              previousStatus: 'idle',
              pendingCount: 1,
              endedCount: 0,
            },
          },
          {
            type: 'NodeStatusChanged',
            data: {
              correlationId: 'c1',
              commandName: 'RebuildComponentDB',
              nodeId: 'node-1',
              status: 'error',
              previousStatus: 'running',
              pendingCount: 0,
              endedCount: 1,
            },
          },
        ]);

        await eventStore.appendToStream('pipeline-c1', [
          {
            type: 'NodeStatusChanged',
            data: {
              correlationId: 'c1',
              commandName: 'RebuildComponentDB',
              nodeId: 'node-1',
              status: 'running',
              previousStatus: 'error',
              pendingCount: 1,
              endedCount: 0,
            },
          },
          {
            type: 'NodeStatusChanged',
            data: {
              correlationId: 'c1',
              commandName: 'RebuildComponentDB',
              nodeId: 'node-1',
              status: 'success',
              previousStatus: 'running',
              pendingCount: 0,
              endedCount: 1,
            },
          },
        ]);

        const messages = await readModel.getMessages('c1');
        const statuses = messages.map((m: MessageLogDocument) => (m.messageData as { status: string }).status);

        expect(statuses).toEqual(['running', 'error', 'running', 'success']);
      } finally {
        await close();
      }
    });

    it('should track message stats through CommandDispatched and DomainEventEmitted', async () => {
      const { eventStore, readModel, close } = createPipelineEventStore();
      try {
        await eventStore.appendToStream('pipeline-c1', [
          {
            type: 'CommandDispatched',
            data: {
              correlationId: 'c1',
              requestId: 'r1',
              commandType: 'CreateUser',
              commandData: { name: 'Alice' },
              timestamp: new Date(),
            },
          },
          {
            type: 'CommandDispatched',
            data: {
              correlationId: 'c1',
              requestId: 'r2',
              commandType: 'UpdateUser',
              commandData: { name: 'Bob' },
              timestamp: new Date(),
            },
          },
          {
            type: 'DomainEventEmitted',
            data: {
              correlationId: 'c1',
              requestId: 'r1',
              eventType: 'UserCreated',
              eventData: { userId: '123' },
              timestamp: new Date(),
            },
          },
        ]);

        const stats = await readModel.getStats();

        expect(stats).toEqual({
          totalMessages: 3,
          totalCommands: 2,
          totalEvents: 1,
        });
      } finally {
        await close();
      }
    });
  });
});
