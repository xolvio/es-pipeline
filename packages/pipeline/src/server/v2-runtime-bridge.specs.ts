import type { Command, Event } from '@xolvio/message-bus';
import type { SettledHandlerDescriptor } from '../core/descriptors.js';
import { createV2RuntimeBridge } from './v2-runtime-bridge.js';

function makeCommand(type: string, correlationId: string, requestId = 'req-1'): Command {
  return { type, data: {}, correlationId, requestId };
}

function makeEvent(type: string, correlationId: string, data: Record<string, unknown> = {}): Event {
  return { type, data, correlationId };
}

describe('V2RuntimeBridge', () => {
  describe('registerSettled', () => {
    it('creates workflow in processor that accepts keyed events', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const descriptor: SettledHandlerDescriptor = {
        type: 'settled',
        commandTypes: ['CheckTests', 'CheckTypes'],
        handler: () => undefined,
      };

      bridge.registerSettled(descriptor);

      const stats = bridge.getSettledStats('corr-1', 'template-CheckTests,CheckTypes');
      expect(stats).toEqual({ status: 'idle', pendingCount: 0, endedCount: 0 });
    });
  });

  describe('onCommandStarted', () => {
    it('emits StartSettled for relevant groups only', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A', 'B'],
        handler: () => undefined,
      });
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['C', 'D'],
        handler: () => undefined,
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));

      const statsAB = bridge.getSettledStats('corr-1', 'template-A,B');
      expect(statsAB).toEqual({ status: 'running', pendingCount: 1, endedCount: 0 });

      const statsCD = bridge.getSettledStats('corr-1', 'template-C,D');
      expect(statsCD).toEqual({ status: 'idle', pendingCount: 0, endedCount: 0 });
    });

    it('ignores commands with invalid correlationId or requestId', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: () => undefined,
      });

      bridge.onCommandStarted(makeCommand('A', ''));
      bridge.onCommandStarted(makeCommand('A', 'corr-1', ''));

      const stats1 = bridge.getSettledStats('', 'template-A');
      expect(stats1).toEqual({ status: 'idle', pendingCount: 0, endedCount: 0 });

      const stats2 = bridge.getSettledStats('corr-1', 'template-A');
      expect(stats2).toEqual({ status: 'idle', pendingCount: 0, endedCount: 0 });
    });

    it('ignores commands for unregistered command types', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: () => undefined,
      });

      bridge.onCommandStarted(makeCommand('Z', 'corr-1'));

      const stats = bridge.getSettledStats('corr-1', 'template-A');
      expect(stats).toEqual({ status: 'idle', pendingCount: 0, endedCount: 0 });
    });
  });

  describe('onEventReceived', () => {
    it('translates to CommandCompleted and buffers event', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const handlerCalls: Record<string, Event[]>[] = [];
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: (events) => {
          handlerCalls.push(events);
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('ACompleted', 'corr-1', { value: 42 }), 'A');

      expect(handlerCalls).toHaveLength(1);
      expect(handlerCalls[0]).toEqual({
        A: [{ type: 'ACompleted', data: { value: 42 }, correlationId: 'corr-1' }],
      });
    });

    it('ignores events for unregistered command types', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const handlerCalls: unknown[] = [];
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: (events) => {
          handlerCalls.push(events);
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('XCompleted', 'corr-1'), 'X');

      expect(handlerCalls).toHaveLength(0);
    });

    it('ignores events with empty correlationId', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const handlerCalls: unknown[] = [];
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: (events) => {
          handlerCalls.push(events);
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('ACompleted', ''), 'A');

      expect(handlerCalls).toHaveLength(0);
    });
  });

  describe('AllSettled fires v1 callback', () => {
    it('invokes handler with correct buffered events grouped by commandType', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const handlerCalls: Record<string, Event[]>[] = [];
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A', 'B'],
        handler: (events) => {
          handlerCalls.push(events);
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onCommandStarted(makeCommand('B', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1', { a: 1 }), 'A');
      bridge.onEventReceived(makeEvent('BDone', 'corr-1', { b: 2 }), 'B');

      expect(handlerCalls).toHaveLength(1);
      expect(handlerCalls[0]).toEqual({
        A: [{ type: 'ADone', data: { a: 1 }, correlationId: 'corr-1' }],
        B: [{ type: 'BDone', data: { b: 2 }, correlationId: 'corr-1' }],
      });
    });

    it('passes send function that dispatches via onDispatch', () => {
      const dispatched: Array<{ commandType: string; data: unknown; correlationId: string }> = [];
      const bridge = createV2RuntimeBridge({
        onDispatch: (commandType, data, correlationId) => {
          dispatched.push({ commandType, data, correlationId });
        },
      });

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: (_events, send) => {
          send('NextCommand', { payload: true });
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1'), 'A');

      expect(dispatched).toEqual([{ commandType: 'NextCommand', data: { payload: true }, correlationId: 'corr-1' }]);
    });

    it('passes emit function that calls onEmit with correlationId', () => {
      const emitted: Array<{ eventType: string; data: unknown; correlationId: string }> = [];
      const bridge = createV2RuntimeBridge({
        onDispatch: () => {},
        onEmit: (eventType, data, correlationId) => {
          emitted.push({ eventType, data, correlationId });
        },
      });

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: (_events, _send, emit) => {
          emit('ChecksPassed', { component: 'Foo' }, 'graph:g1:job-a');
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1'), 'A');

      expect(emitted).toEqual([
        { eventType: 'ChecksPassed', data: { component: 'Foo' }, correlationId: 'graph:g1:job-a' },
      ]);
    });

    it('emit uses settled correlationId when no explicit correlationId provided', () => {
      const emitted: Array<{ eventType: string; data: unknown; correlationId: string }> = [];
      const bridge = createV2RuntimeBridge({
        onDispatch: () => {},
        onEmit: (eventType, data, correlationId) => {
          emitted.push({ eventType, data, correlationId });
        },
      });

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: (_events, _send, emit) => {
          emit('ChecksPassed', { component: 'Bar' });
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1'), 'A');

      expect(emitted).toEqual([{ eventType: 'ChecksPassed', data: { component: 'Bar' }, correlationId: 'corr-1' }]);
    });
  });

  describe('RetryCommands', () => {
    it('triggers onDispatch for each failed commandType', () => {
      const dispatched: Array<{ commandType: string; data: unknown; correlationId: string }> = [];
      const bridge = createV2RuntimeBridge({
        onDispatch: (commandType, data, correlationId) => {
          dispatched.push({ commandType, data, correlationId });
        },
      });

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A', 'B'],
        handler: () => undefined,
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onCommandStarted(makeCommand('B', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1'), 'A');
      bridge.onEventReceived(makeEvent('BFailed', 'corr-1'), 'B', 'failure');

      expect(dispatched).toEqual([{ commandType: 'B', data: {}, correlationId: 'corr-1' }]);
    });
  });

  describe('SettledFailed', () => {
    it('invokes handler on SettledFailed after max retries exhausted', () => {
      const handlerCalls: Record<string, Event[]>[] = [];
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });

      bridge.registerSettled(
        {
          type: 'settled',
          commandTypes: ['A'],
          handler: (events) => {
            handlerCalls.push(events);
            return undefined;
          },
        },
        { maxRetries: 0 },
      );

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('AFailed', 'corr-1', { error: 'oops' }), 'A', 'failure');

      expect(handlerCalls).toHaveLength(1);
      expect(handlerCalls[0]).toEqual({
        A: [{ type: 'AFailed', data: { error: 'oops' }, correlationId: 'corr-1' }],
      });
    });

    it('passes send function to handler on SettledFailed', () => {
      const dispatched: Array<{ commandType: string; data: unknown; correlationId: string }> = [];
      const bridge = createV2RuntimeBridge({
        onDispatch: (commandType, data, correlationId) => {
          dispatched.push({ commandType, data, correlationId });
        },
      });

      bridge.registerSettled(
        {
          type: 'settled',
          commandTypes: ['A'],
          handler: (_events, send) => {
            send('RetryCommand', { retry: true });
            return undefined;
          },
        },
        { maxRetries: 0 },
      );

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('AFailed', 'corr-1'), 'A', 'failure');

      expect(dispatched).toEqual([{ commandType: 'RetryCommand', data: { retry: true }, correlationId: 'corr-1' }]);
    });
  });

  describe('persist: true resets instance', () => {
    it('allows receiving new commands after reset', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const handlerCalls: Record<string, Event[]>[] = [];
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: (events) => {
          handlerCalls.push(events);
          return { persist: true };
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1', { round: 1 }), 'A');

      expect(handlerCalls).toHaveLength(1);

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1', { round: 2 }), 'A');

      expect(handlerCalls).toHaveLength(2);
      expect(handlerCalls[1]).toEqual({
        A: [{ type: 'ADone', data: { round: 2 }, correlationId: 'corr-1' }],
      });
    });
  });

  describe('independent correlationIds', () => {
    it('tracks two correlationIds independently', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const handlerCalls: Array<{ correlationId: string; events: Record<string, Event[]> }> = [];

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A', 'B'],
        handler: (events) => {
          const corrId = Object.values(events).flat()[0]?.correlationId ?? '';
          handlerCalls.push({ correlationId: corrId, events });
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onCommandStarted(makeCommand('B', 'corr-1'));
      bridge.onCommandStarted(makeCommand('A', 'corr-2'));
      bridge.onCommandStarted(makeCommand('B', 'corr-2'));

      bridge.onEventReceived(makeEvent('ADone', 'corr-1', { v: 1 }), 'A');
      bridge.onEventReceived(makeEvent('ADone', 'corr-2', { v: 2 }), 'A');
      bridge.onEventReceived(makeEvent('BDone', 'corr-1', { v: 3 }), 'B');

      expect(handlerCalls).toHaveLength(1);
      expect(handlerCalls[0].correlationId).toBe('corr-1');

      bridge.onEventReceived(makeEvent('BDone', 'corr-2', { v: 4 }), 'B');

      expect(handlerCalls).toHaveLength(2);
      expect(handlerCalls[1].correlationId).toBe('corr-2');
    });
  });

  describe('getSettledStats', () => {
    it('returns idle for unknown correlationId', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: () => undefined,
      });

      const stats = bridge.getSettledStats('unknown', 'template-A');
      expect(stats).toEqual({ status: 'idle', pendingCount: 0, endedCount: 0 });
    });

    it('returns running while waiting for completions', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A', 'B'],
        handler: () => undefined,
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));

      const stats = bridge.getSettledStats('corr-1', 'template-A,B');
      expect(stats).toEqual({ status: 'running', pendingCount: 1, endedCount: 0 });
    });

    it('returns success after AllSettled', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        handler: () => undefined,
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1'), 'A');

      const stats = bridge.getSettledStats('corr-1', 'template-A');
      expect(stats).toEqual({ status: 'success', pendingCount: 0, endedCount: 1 });
    });

    it('returns error after SettledFailed', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      bridge.registerSettled(
        {
          type: 'settled',
          commandTypes: ['A'],
          handler: () => undefined,
        },
        { maxRetries: 0 },
      );

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('AFailed', 'corr-1'), 'A', 'failure');

      const stats = bridge.getSettledStats('corr-1', 'template-A');
      expect(stats).toEqual({ status: 'error', pendingCount: 0, endedCount: 1 });
    });

    it('returns idle for unknown templateId', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });

      const stats = bridge.getSettledStats('corr-1', 'template-Unknown');
      expect(stats).toEqual({ status: 'idle', pendingCount: 0, endedCount: 0 });
    });
  });

  describe('sourceEventTypes filtering', () => {
    it('only routes commands to settled blocks matching source event type', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const handler1Calls: Record<string, Event[]>[] = [];
      const handler2Calls: Record<string, Event[]>[] = [];

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A', 'B'],
        settledId: 'settled-0',
        sourceEventTypes: ['Foo'],
        handler: (events) => {
          handler1Calls.push(events);
          return undefined;
        },
      });

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A', 'B'],
        settledId: 'settled-1',
        sourceEventTypes: ['Bar'],
        handler: (events) => {
          handler2Calls.push(events);
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'), undefined, 'Foo');
      bridge.onCommandStarted(makeCommand('B', 'corr-1'), undefined, 'Foo');
      bridge.onEventReceived(makeEvent('ADone', 'corr-1', { a: 1 }), 'A', 'success', undefined, 'Foo');
      bridge.onEventReceived(makeEvent('BDone', 'corr-1', { b: 2 }), 'B', 'success', undefined, 'Foo');

      expect(handler1Calls).toHaveLength(1);
      expect(handler2Calls).toHaveLength(0);
    });

    it('routes to all blocks when sourceEventType is not provided', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const handler1Calls: Record<string, Event[]>[] = [];
      const handler2Calls: Record<string, Event[]>[] = [];

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        settledId: 'settled-0',
        sourceEventTypes: ['Foo'],
        handler: (events) => {
          handler1Calls.push(events);
          return undefined;
        },
      });

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A'],
        settledId: 'settled-1',
        sourceEventTypes: ['Bar'],
        handler: (events) => {
          handler2Calls.push(events);
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1'), 'A');

      expect(handler1Calls).toHaveLength(1);
      expect(handler2Calls).toHaveLength(1);
    });
  });

  describe('multiple settled blocks with same command types', () => {
    it('fires both handlers independently when two blocks watch the same commands', () => {
      const bridge = createV2RuntimeBridge({ onDispatch: () => {} });
      const handler1Calls: Record<string, Event[]>[] = [];
      const handler2Calls: Record<string, Event[]>[] = [];

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A', 'B'],
        settledId: 'settled-0',
        handler: (events) => {
          handler1Calls.push(events);
          return undefined;
        },
      });

      bridge.registerSettled({
        type: 'settled',
        commandTypes: ['A', 'B'],
        settledId: 'settled-1',
        handler: (events) => {
          handler2Calls.push(events);
          return undefined;
        },
      });

      bridge.onCommandStarted(makeCommand('A', 'corr-1'));
      bridge.onCommandStarted(makeCommand('B', 'corr-1'));
      bridge.onEventReceived(makeEvent('ADone', 'corr-1', { a: 1 }), 'A');
      bridge.onEventReceived(makeEvent('BDone', 'corr-1', { b: 2 }), 'B');

      expect(handler1Calls).toHaveLength(1);
      expect(handler2Calls).toHaveLength(1);
      expect(handler1Calls[0]).toEqual({
        A: [{ type: 'ADone', data: { a: 1 }, correlationId: 'corr-1' }],
        B: [{ type: 'BDone', data: { b: 2 }, correlationId: 'corr-1' }],
      });
      expect(handler2Calls[0]).toEqual({
        A: [{ type: 'ADone', data: { a: 1 }, correlationId: 'corr-1' }],
        B: [{ type: 'BDone', data: { b: 2 }, correlationId: 'corr-1' }],
      });
    });
  });
});
