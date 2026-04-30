import { describe, expect, it } from 'vitest';
import type { NodeStatus } from '../graph/types';
import { evolve, type NodeStatusChangedEvent, type NodeStatusDocument } from './node-status-projection';

describe('NodeStatusProjection', () => {
  describe('evolve', () => {
    it('creates node document from event', () => {
      const event: NodeStatusChangedEvent = {
        type: 'NodeStatusChanged',
        data: {
          correlationId: 'c1',
          commandName: 'RunCmd',
          nodeId: 'cmd:RunCmd',
          status: 'running' as NodeStatus,
          previousStatus: 'idle' as NodeStatus,
          pendingCount: 1,
          endedCount: 0,
        },
      };

      const result = evolve(null, event);

      expect(result).toEqual({
        correlationId: 'c1',
        commandName: 'RunCmd',
        status: 'running',
        pendingCount: 1,
        endedCount: 0,
        lastDurationMs: undefined,
      });
    });

    it('stores lastDurationMs when provided in event', () => {
      const event: NodeStatusChangedEvent = {
        type: 'NodeStatusChanged',
        data: {
          correlationId: 'c1',
          commandName: 'RunCmd',
          nodeId: 'cmd:RunCmd',
          status: 'success' as NodeStatus,
          previousStatus: 'running' as NodeStatus,
          pendingCount: 0,
          endedCount: 1,
          lastDurationMs: 5000,
        },
      };

      const result = evolve(null, event);

      expect(result.lastDurationMs).toBe(5000);
    });

    it('preserves lastDurationMs from existing document when event has none', () => {
      const existing: NodeStatusDocument = {
        correlationId: 'c1',
        commandName: 'RunCmd',
        status: 'success' as NodeStatus,
        pendingCount: 0,
        endedCount: 1,
        lastDurationMs: 3000,
      };
      const event: NodeStatusChangedEvent = {
        type: 'NodeStatusChanged',
        data: {
          correlationId: 'c1',
          commandName: 'RunCmd',
          nodeId: 'cmd:RunCmd',
          status: 'running' as NodeStatus,
          previousStatus: 'success' as NodeStatus,
          pendingCount: 1,
          endedCount: 1,
        },
      };

      const result = evolve(existing, event);

      expect(result.lastDurationMs).toBe(3000);
    });

    it('overwrites lastDurationMs when event provides new value', () => {
      const existing: NodeStatusDocument = {
        correlationId: 'c1',
        commandName: 'RunCmd',
        status: 'success' as NodeStatus,
        pendingCount: 0,
        endedCount: 1,
        lastDurationMs: 3000,
      };
      const event: NodeStatusChangedEvent = {
        type: 'NodeStatusChanged',
        data: {
          correlationId: 'c1',
          commandName: 'RunCmd',
          nodeId: 'cmd:RunCmd',
          status: 'success' as NodeStatus,
          previousStatus: 'running' as NodeStatus,
          pendingCount: 0,
          endedCount: 2,
          lastDurationMs: 7000,
        },
      };

      const result = evolve(existing, event);

      expect(result.lastDurationMs).toBe(7000);
    });
  });
});
