import { describe, expect, it } from 'vitest';
import { evolve, type ItemStatusChangedEvent, type ItemStatusDocument } from './item-status-projection';

describe('ItemStatusProjection', () => {
  describe('evolve', () => {
    it('creates item document with running status when item starts', () => {
      const event: ItemStatusChangedEvent = {
        type: 'ItemStatusChanged',
        data: {
          correlationId: 'c1',
          commandType: 'ProcessItem',
          itemKey: 'item-1',
          requestId: 'req-1',
          status: 'running',
          attemptCount: 1,
        },
      };

      const result = evolve(null, event);

      expect(result).toEqual({
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'running',
        attemptCount: 1,
      });
    });

    it('updates item document to success status when item completes', () => {
      const existing: ItemStatusDocument = {
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'running',
        attemptCount: 1,
      };
      const event: ItemStatusChangedEvent = {
        type: 'ItemStatusChanged',
        data: {
          correlationId: 'c1',
          commandType: 'ProcessItem',
          itemKey: 'item-1',
          requestId: 'req-1',
          status: 'success',
          attemptCount: 1,
        },
      };

      const result = evolve(existing, event);

      expect(result).toEqual({
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'success',
        attemptCount: 1,
      });
    });

    it('updates item document to error status when item fails', () => {
      const existing: ItemStatusDocument = {
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'running',
        attemptCount: 1,
      };
      const event: ItemStatusChangedEvent = {
        type: 'ItemStatusChanged',
        data: {
          correlationId: 'c1',
          commandType: 'ProcessItem',
          itemKey: 'item-1',
          requestId: 'req-1',
          status: 'error',
          attemptCount: 1,
        },
      };

      const result = evolve(existing, event);

      expect(result).toEqual({
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'error',
        attemptCount: 1,
      });
    });

    it('increments attempt count on retry', () => {
      const existing: ItemStatusDocument = {
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'error',
        attemptCount: 1,
      };
      const event: ItemStatusChangedEvent = {
        type: 'ItemStatusChanged',
        data: {
          correlationId: 'c1',
          commandType: 'ProcessItem',
          itemKey: 'item-1',
          requestId: 'req-2',
          status: 'running',
          attemptCount: 2,
        },
      };

      const result = evolve(existing, event);

      expect(result).toEqual({
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-2',
        status: 'running',
        attemptCount: 2,
      });
    });

    it('sets startedAt when status becomes running', () => {
      const now = new Date('2025-01-01T00:00:00Z');
      const event: ItemStatusChangedEvent = {
        type: 'ItemStatusChanged',
        data: {
          correlationId: 'c1',
          commandType: 'ProcessItem',
          itemKey: 'item-1',
          requestId: 'req-1',
          status: 'running',
          attemptCount: 1,
          timestamp: now.toISOString(),
        },
      };

      const result = evolve(null, event);

      expect(result.startedAt).toEqual(now.toISOString());
      expect(result.endedAt).toBeUndefined();
    });

    it('sets endedAt when status becomes success', () => {
      const startTime = new Date('2025-01-01T00:00:00Z');
      const endTime = new Date('2025-01-01T00:00:05Z');
      const existing: ItemStatusDocument = {
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'running',
        attemptCount: 1,
        startedAt: startTime.toISOString(),
      };
      const event: ItemStatusChangedEvent = {
        type: 'ItemStatusChanged',
        data: {
          correlationId: 'c1',
          commandType: 'ProcessItem',
          itemKey: 'item-1',
          requestId: 'req-1',
          status: 'success',
          attemptCount: 1,
          timestamp: endTime.toISOString(),
        },
      };

      const result = evolve(existing, event);

      expect(result.startedAt).toEqual(startTime.toISOString());
      expect(result.endedAt).toEqual(endTime.toISOString());
    });

    it('preserves batchId from creation event on subsequent updates', () => {
      const existing: ItemStatusDocument = {
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'running',
        attemptCount: 1,
        batchId: '2025-01-01T00:00:00.000Z',
      };
      const event: ItemStatusChangedEvent = {
        type: 'ItemStatusChanged',
        data: {
          correlationId: 'c1',
          commandType: 'ProcessItem',
          itemKey: 'item-1',
          requestId: 'req-1',
          status: 'success',
          attemptCount: 1,
        },
      };

      const result = evolve(existing, event);

      expect(result).toEqual({
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'success',
        attemptCount: 1,
        batchId: '2025-01-01T00:00:00.000Z',
      });
    });

    it('sets batchId from event data on creation', () => {
      const event: ItemStatusChangedEvent = {
        type: 'ItemStatusChanged',
        data: {
          correlationId: 'c1',
          commandType: 'ProcessItem',
          itemKey: 'item-1',
          requestId: 'req-1',
          status: 'running',
          attemptCount: 1,
          batchId: '2025-01-01T00:00:00.000Z',
        },
      };

      const result = evolve(null, event);

      expect(result).toEqual({
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'running',
        attemptCount: 1,
        batchId: '2025-01-01T00:00:00.000Z',
      });
    });

    it('sets endedAt when status becomes error', () => {
      const startTime = new Date('2025-01-01T00:00:00Z');
      const endTime = new Date('2025-01-01T00:00:03Z');
      const existing: ItemStatusDocument = {
        correlationId: 'c1',
        commandType: 'ProcessItem',
        itemKey: 'item-1',
        currentRequestId: 'req-1',
        status: 'running',
        attemptCount: 1,
        startedAt: startTime.toISOString(),
      };
      const event: ItemStatusChangedEvent = {
        type: 'ItemStatusChanged',
        data: {
          correlationId: 'c1',
          commandType: 'ProcessItem',
          itemKey: 'item-1',
          requestId: 'req-1',
          status: 'error',
          attemptCount: 1,
          timestamp: endTime.toISOString(),
        },
      };

      const result = evolve(existing, event);

      expect(result.startedAt).toEqual(startTime.toISOString());
      expect(result.endedAt).toEqual(endTime.toISOString());
    });
  });
});
