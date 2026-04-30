import { describe, expect, it } from 'vitest';
import { itemStatusProjection } from './item-status';
import { latestRunProjection } from './latest-run';
import { messageLogProjection } from './message-log';
import { nodeStatusProjection } from './node-status';
import { statsProjection } from './stats';

describe('engine projections', () => {
  describe('item-status', () => {
    it('evolves ItemStatusChanged into document', () => {
      const event = {
        type: 'ItemStatusChanged' as const,
        data: {
          correlationId: 'c1',
          commandType: 'CheckTests',
          itemKey: 'k1',
          requestId: 'r1',
          status: 'running' as const,
          attemptCount: 1,
        },
      };
      const result = itemStatusProjection.evolve(null, event);
      expect(result).toEqual({
        correlationId: 'c1',
        commandType: 'CheckTests',
        itemKey: 'k1',
        currentRequestId: 'r1',
        status: 'running',
        attemptCount: 1,
      });
    });

    it('generates document id from correlation, command, and item key', () => {
      const event = {
        type: 'ItemStatusChanged' as const,
        data: {
          correlationId: 'c1',
          commandType: 'CT',
          itemKey: 'k1',
          requestId: 'r1',
          status: 'running' as const,
          attemptCount: 1,
        },
      };
      expect(itemStatusProjection.getDocumentId(event)).toBe('c1-CT-k1');
    });
  });

  describe('node-status', () => {
    it('evolves NodeStatusChanged into document', () => {
      const event = {
        type: 'NodeStatusChanged' as const,
        data: {
          correlationId: 'c1',
          commandName: 'CheckTests',
          nodeId: 'n1',
          status: 'running' as const,
          previousStatus: 'idle' as const,
          pendingCount: 3,
          endedCount: 0,
        },
      };
      const result = nodeStatusProjection.evolve(null, event);
      expect(result).toEqual({
        correlationId: 'c1',
        commandName: 'CheckTests',
        status: 'running',
        pendingCount: 3,
        endedCount: 0,
      });
    });

    it('generates document id from correlation and command name', () => {
      const event = {
        type: 'NodeStatusChanged' as const,
        data: {
          correlationId: 'c1',
          commandName: 'CT',
          nodeId: 'n1',
          status: 'idle' as const,
          previousStatus: 'idle' as const,
          pendingCount: 0,
          endedCount: 0,
        },
      };
      expect(nodeStatusProjection.getDocumentId(event)).toBe('c1-CT');
    });
  });

  describe('latest-run', () => {
    it('evolves PipelineRunStarted into document', () => {
      const event = {
        type: 'PipelineRunStarted' as const,
        data: { correlationId: 'c1', triggerCommand: 'StartPipeline' },
      };
      const result = latestRunProjection.evolve(null, event);
      expect(result).toEqual({
        latestCorrelationId: 'c1',
        triggerCommand: 'StartPipeline',
      });
    });

    it('uses constant document id', () => {
      expect(latestRunProjection.getDocumentId()).toBe('latest');
    });
  });

  describe('message-log', () => {
    it('evolves CommandDispatched into document', () => {
      const now = new Date();
      const event = {
        type: 'CommandDispatched' as const,
        data: {
          correlationId: 'c1',
          requestId: 'r1',
          commandType: 'CheckTests',
          commandData: { x: 1 },
          timestamp: now,
        },
      };
      const result = messageLogProjection.evolve(null, event);
      expect(result).toEqual({
        correlationId: 'c1',
        requestId: 'r1',
        messageType: 'command',
        messageName: 'CheckTests',
        messageData: { x: 1 },
        timestamp: now,
      });
    });

    it('generates unique document ids', () => {
      const id1 = messageLogProjection.getDocumentId();
      const id2 = messageLogProjection.getDocumentId();
      expect(id1).not.toBe(id2);
      expect(typeof id1).toBe('string');
    });
  });

  describe('stats', () => {
    it('evolves CommandDispatched by incrementing command count', () => {
      const event = {
        type: 'CommandDispatched' as const,
        data: {
          correlationId: 'c1',
          requestId: 'r1',
          commandType: 'CT',
          commandData: {},
          timestamp: new Date(),
        },
      };
      const result = statsProjection.evolve(null, event);
      expect(result).toEqual({ totalMessages: 1, totalCommands: 1, totalEvents: 0 });
    });

    it('evolves DomainEventEmitted by incrementing event count', () => {
      const existing = { totalMessages: 1, totalCommands: 1, totalEvents: 0 };
      const event = {
        type: 'DomainEventEmitted' as const,
        data: {
          correlationId: 'c1',
          requestId: 'r1',
          eventType: 'ET',
          eventData: {},
          timestamp: new Date(),
        },
      };
      const result = statsProjection.evolve(existing, event);
      expect(result).toEqual({ totalMessages: 2, totalCommands: 1, totalEvents: 1 });
    });

    it('uses constant document id', () => {
      expect(statsProjection.getDocumentId()).toBe('global');
    });
  });
});
