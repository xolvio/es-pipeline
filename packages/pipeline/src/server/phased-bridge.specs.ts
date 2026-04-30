import type { Event } from '@xolvio/message-bus';
import type { ForEachPhasedDescriptor } from '../core/descriptors.js';
import type { CommandDispatch } from '../core/types.js';
import { createPhasedBridge } from './phased-bridge.js';

interface TestItem {
  id: string;
  phase: string;
}

function prop(obj: unknown, key: string): string {
  return String(Object(obj)[key]);
}

function makeEvent(type: string, correlationId: string, data: Record<string, unknown> = {}): Event {
  return { type, data, correlationId };
}

function makeDescriptor(overrides: Partial<ForEachPhasedDescriptor> = {}): ForEachPhasedDescriptor {
  return {
    type: 'foreach-phased',
    eventType: 'BuildTriggered',
    phases: ['validate', 'compile'],
    stopOnFailure: false,
    itemsSelector: (event: Event): TestItem[] => {
      const items = event.data.items;
      if (!Array.isArray(items)) return [];
      return items;
    },
    classifier: (item: unknown) => prop(item, 'phase'),
    emitFactory: (item: unknown, phase: string, _event: Event): CommandDispatch => ({
      commandType: `Run${phase.charAt(0).toUpperCase()}${phase.slice(1)}`,
      data: { key: prop(item, 'id'), phase },
    }),
    completion: {
      successEvent: { name: 'BuildCompleted' },
      failureEvent: { name: 'BuildFailed' },
      itemKey: (event: Event) => String(event.data.id),
    },
    ...overrides,
  };
}

describe('PhasedBridge', () => {
  describe('startPhased dispatches phase 0 items', () => {
    it('calls onDispatch for each item in the first phase', () => {
      const dispatched: Array<{ commandType: string; data: unknown; correlationId: string }> = [];
      const bridge = createPhasedBridge({
        onDispatch: (commandType, data, correlationId) => {
          dispatched.push({ commandType, data, correlationId });
        },
        onPhasedComplete: () => {},
      });

      const descriptor = makeDescriptor();
      bridge.registerPhased(descriptor);

      const triggerEvent = makeEvent('BuildTriggered', 'corr-1', {
        items: [
          { id: 'item-a', phase: 'validate' },
          { id: 'item-b', phase: 'compile' },
        ],
      });

      bridge.startPhased(descriptor, triggerEvent, 'corr-1');

      expect(dispatched).toEqual([
        { commandType: 'RunValidate', data: { key: 'item-a', phase: 'validate' }, correlationId: 'corr-1' },
      ]);
    });
  });

  describe('item completion advances to next phase', () => {
    it('dispatches next phase items after current phase completes', () => {
      const dispatched: Array<{ commandType: string; data: unknown; correlationId: string }> = [];
      const bridge = createPhasedBridge({
        onDispatch: (commandType, data, correlationId) => {
          dispatched.push({ commandType, data, correlationId });
        },
        onPhasedComplete: () => {},
      });

      const descriptor = makeDescriptor();
      bridge.registerPhased(descriptor);

      const triggerEvent = makeEvent('BuildTriggered', 'corr-1', {
        items: [
          { id: 'item-a', phase: 'validate' },
          { id: 'item-b', phase: 'compile' },
        ],
      });

      bridge.startPhased(descriptor, triggerEvent, 'corr-1');
      dispatched.length = 0;

      bridge.onPhasedItemEvent(makeEvent('ItemDone', 'corr-1', { id: 'item-a' }), 'item-a');

      expect(dispatched).toEqual([
        { commandType: 'RunCompile', data: { key: 'item-b', phase: 'compile' }, correlationId: 'corr-1' },
      ]);
    });
  });

  describe('all phases complete triggers success', () => {
    it('calls onPhasedComplete with success event when all items finish', () => {
      const completed: Array<{ event: Event; correlationId: string }> = [];
      const bridge = createPhasedBridge({
        onDispatch: () => {},
        onPhasedComplete: (event, correlationId) => {
          completed.push({ event, correlationId });
        },
      });

      const descriptor = makeDescriptor();
      bridge.registerPhased(descriptor);

      const triggerEvent = makeEvent('BuildTriggered', 'corr-1', {
        items: [
          { id: 'item-a', phase: 'validate' },
          { id: 'item-b', phase: 'compile' },
        ],
      });

      bridge.startPhased(descriptor, triggerEvent, 'corr-1');
      bridge.onPhasedItemEvent(makeEvent('ItemDone', 'corr-1', { id: 'item-a' }), 'item-a');
      bridge.onPhasedItemEvent(makeEvent('ItemDone', 'corr-1', { id: 'item-b' }), 'item-b');

      expect(completed).toEqual([
        {
          event: {
            type: 'BuildCompleted',
            correlationId: 'corr-1',
            data: { results: ['item-a', 'item-b'], itemCount: 2 },
          },
          correlationId: 'corr-1',
        },
      ]);
    });
  });

  describe('stopOnFailure triggers failure event', () => {
    it('calls onPhasedComplete with failure event when item fails and stopOnFailure is true', () => {
      const completed: Array<{ event: Event; correlationId: string }> = [];
      const bridge = createPhasedBridge({
        onDispatch: () => {},
        onPhasedComplete: (event, correlationId) => {
          completed.push({ event, correlationId });
        },
      });

      const descriptor = makeDescriptor({ stopOnFailure: true });
      bridge.registerPhased(descriptor);

      const triggerEvent = makeEvent('BuildTriggered', 'corr-1', {
        items: [
          { id: 'item-a', phase: 'validate' },
          { id: 'item-b', phase: 'validate' },
        ],
      });

      bridge.startPhased(descriptor, triggerEvent, 'corr-1');
      bridge.onPhasedItemEvent(makeEvent('BuildFailed', 'corr-1', { id: 'item-a' }), 'item-a');

      expect(completed).toEqual([
        {
          event: {
            type: 'BuildFailed',
            correlationId: 'corr-1',
            data: { failures: ['item-a'], completedItems: [] },
          },
          correlationId: 'corr-1',
        },
      ]);
    });
  });

  describe('independent correlationIds', () => {
    it('tracks two correlationIds independently', () => {
      const dispatched: Array<{ commandType: string; data: unknown; correlationId: string }> = [];
      const completed: Array<{ event: Event; correlationId: string }> = [];
      const bridge = createPhasedBridge({
        onDispatch: (commandType, data, correlationId) => {
          dispatched.push({ commandType, data, correlationId });
        },
        onPhasedComplete: (event, correlationId) => {
          completed.push({ event, correlationId });
        },
      });

      const descriptor = makeDescriptor({
        phases: ['validate'],
      });
      bridge.registerPhased(descriptor);

      const trigger1 = makeEvent('BuildTriggered', 'corr-1', {
        items: [{ id: 'item-x', phase: 'validate' }],
      });
      const trigger2 = makeEvent('BuildTriggered', 'corr-2', {
        items: [{ id: 'item-y', phase: 'validate' }],
      });

      bridge.startPhased(descriptor, trigger1, 'corr-1');
      bridge.startPhased(descriptor, trigger2, 'corr-2');
      dispatched.length = 0;

      bridge.onPhasedItemEvent(makeEvent('ItemDone', 'corr-1', { id: 'item-x' }), 'item-x');

      expect(completed).toEqual([
        {
          event: {
            type: 'BuildCompleted',
            correlationId: 'corr-1',
            data: { results: ['item-x'], itemCount: 1 },
          },
          correlationId: 'corr-1',
        },
      ]);

      bridge.onPhasedItemEvent(makeEvent('ItemDone', 'corr-2', { id: 'item-y' }), 'item-y');

      expect(completed).toEqual([
        {
          event: {
            type: 'BuildCompleted',
            correlationId: 'corr-1',
            data: { results: ['item-x'], itemCount: 1 },
          },
          correlationId: 'corr-1',
        },
        {
          event: {
            type: 'BuildCompleted',
            correlationId: 'corr-2',
            data: { results: ['item-y'], itemCount: 1 },
          },
          correlationId: 'corr-2',
        },
      ]);
    });
  });

  describe('emitFactory with function data', () => {
    it('resolves data factory functions when dispatching', () => {
      const dispatched: Array<{ commandType: string; data: unknown; correlationId: string }> = [];
      const bridge = createPhasedBridge({
        onDispatch: (commandType, data, correlationId) => {
          dispatched.push({ commandType, data, correlationId });
        },
        onPhasedComplete: () => {},
      });

      const descriptor = makeDescriptor({
        phases: ['validate'],
        emitFactory: (item: unknown, phase: string, event: Event): CommandDispatch => ({
          commandType: `Run${phase.charAt(0).toUpperCase()}${phase.slice(1)}`,
          data: (_ev: Event) => ({ key: prop(item, 'id'), source: event.type }),
        }),
      });
      bridge.registerPhased(descriptor);

      const triggerEvent = makeEvent('BuildTriggered', 'corr-1', {
        items: [{ id: 'item-a', phase: 'validate' }],
      });

      bridge.startPhased(descriptor, triggerEvent, 'corr-1');

      expect(dispatched).toEqual([
        { commandType: 'RunValidate', data: { key: 'item-a', source: 'BuildTriggered' }, correlationId: 'corr-1' },
      ]);
    });
  });
});
