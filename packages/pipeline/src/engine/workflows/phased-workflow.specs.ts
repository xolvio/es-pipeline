import type { PhasedInput, PhasedOutput, PhasedState } from './phased-workflow.js';
import { createPhasedWorkflow, decide, evolve, initialState } from './phased-workflow.js';

describe('phased workflow', () => {
  describe('evolve', () => {
    it('transitions from idle to running on StartPhased', () => {
      const state = initialState();
      const event: PhasedInput = {
        type: 'StartPhased',
        data: {
          correlationId: 'corr-1',
          items: [
            { key: 'a', phase: 'p0' },
            { key: 'b', phase: 'p1' },
          ],
          phases: ['p0', 'p1'],
          stopOnFailure: true,
        },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'pending' },
          { key: 'b', phase: 'p1', status: 'pending' },
        ],
        phases: ['p0', 'p1'],
        currentPhaseIndex: 0,
        stopOnFailure: true,
      });
    });

    it('marks item as dispatched on DispatchItem output', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'pending' },
          { key: 'b', phase: 'p1', status: 'pending' },
        ],
        phases: ['p0', 'p1'],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      };
      const event: PhasedOutput = {
        type: 'DispatchItem',
        kind: 'Command',
        data: { itemKey: 'a', phase: 'p0' },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'dispatched' },
          { key: 'b', phase: 'p1', status: 'pending' },
        ],
        phases: ['p0', 'p1'],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      });
    });

    it('marks item as completed on ItemCompleted', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'dispatched' },
          { key: 'b', phase: 'p1', status: 'pending' },
        ],
        phases: ['p0', 'p1'],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      };
      const event: PhasedInput = {
        type: 'ItemCompleted',
        data: { itemKey: 'a', result: { output: 'done' } },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'completed' },
          { key: 'b', phase: 'p1', status: 'pending' },
        ],
        phases: ['p0', 'p1'],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      });
    });

    it('marks item as failed on ItemFailed', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'dispatched' },
          { key: 'b', phase: 'p1', status: 'pending' },
        ],
        phases: ['p0', 'p1'],
        currentPhaseIndex: 0,
        stopOnFailure: true,
      };
      const event: PhasedInput = {
        type: 'ItemFailed',
        data: { itemKey: 'a', error: { message: 'boom' } },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'failed' },
          { key: 'b', phase: 'p1', status: 'pending' },
        ],
        phases: ['p0', 'p1'],
        currentPhaseIndex: 0,
        stopOnFailure: true,
      });
    });

    it('sets status to completed on PhasedCompleted output', () => {
      const state: PhasedState = {
        status: 'running',
        items: [{ key: 'a', phase: 'p0', status: 'completed' }],
        phases: ['p0'],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      };
      const event: PhasedOutput = {
        type: 'PhasedCompleted',
        data: { completedItems: ['a'] },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'completed',
        items: [{ key: 'a', phase: 'p0', status: 'completed' }],
        phases: ['p0'],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      });
    });

    it('sets status to failed on PhasedFailed output', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'failed' },
          { key: 'b', phase: 'p0', status: 'completed' },
        ],
        phases: ['p0'],
        currentPhaseIndex: 0,
        stopOnFailure: true,
      };
      const event: PhasedOutput = {
        type: 'PhasedFailed',
        data: { failedItems: ['a'], completedItems: ['b'] },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'failed',
        items: [
          { key: 'a', phase: 'p0', status: 'failed' },
          { key: 'b', phase: 'p0', status: 'completed' },
        ],
        phases: ['p0'],
        currentPhaseIndex: 0,
        stopOnFailure: true,
      });
    });

    it('advances currentPhaseIndex when dispatching item from next phase', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'completed' },
          { key: 'b', phase: 'p1', status: 'pending' },
        ],
        phases: ['p0', 'p1'],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      };
      const event: PhasedOutput = {
        type: 'DispatchItem',
        kind: 'Command',
        data: { itemKey: 'b', phase: 'p1' },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'running',
        items: [
          { key: 'a', phase: 'p0', status: 'completed' },
          { key: 'b', phase: 'p1', status: 'dispatched' },
        ],
        phases: ['p0', 'p1'],
        currentPhaseIndex: 1,
        stopOnFailure: false,
      });
    });

    it('does not change state for unknown event type', () => {
      const state: PhasedState = {
        status: 'running',
        items: [{ key: 'a', phase: 'p0', status: 'pending' }],
        phases: ['p0'],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      };
      const event = { type: 'UnknownEvent', data: {} } as unknown as PhasedInput;

      const result = evolve(state, event);

      expect(result).toEqual(state);
    });
  });

  describe('decide', () => {
    it('dispatches next phase items when current phase completes', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'validate', status: 'completed' },
          { key: 'b', phase: 'validate', status: 'completed' },
          { key: 'c', phase: 'import', status: 'pending' },
        ],
        phases: ['validate', 'import'],
        currentPhaseIndex: 0,
        stopOnFailure: true,
      };
      const input: PhasedInput = {
        type: 'ItemCompleted',
        data: { itemKey: 'b', result: { ok: true } },
      };
      const result = decide(input, state);
      expect(result).toEqual([{ type: 'DispatchItem', kind: 'Command', data: { itemKey: 'c', phase: 'import' } }]);
    });

    it('returns empty when current phase still has pending items', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'validate', status: 'completed' },
          { key: 'b', phase: 'validate', status: 'dispatched' },
        ],
        phases: ['validate', 'import'],
        currentPhaseIndex: 0,
        stopOnFailure: true,
      };
      const input: PhasedInput = {
        type: 'ItemCompleted',
        data: { itemKey: 'a', result: { ok: true } },
      };
      const result = decide(input, state);
      expect(result).toEqual([]);
    });

    it('returns PhasedFailed on item failure when stopOnFailure is true', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'validate', status: 'failed' },
          { key: 'b', phase: 'validate', status: 'dispatched' },
        ],
        phases: ['validate', 'import'],
        currentPhaseIndex: 0,
        stopOnFailure: true,
      };
      const input: PhasedInput = {
        type: 'ItemFailed',
        data: { itemKey: 'a', error: { reason: 'invalid' } },
      };
      const result = decide(input, state);
      expect(result).toEqual({
        type: 'PhasedFailed',
        data: { failedItems: ['a'], completedItems: [] },
      });
    });

    it('returns empty on item failure when stopOnFailure is false', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'validate', status: 'failed' },
          { key: 'b', phase: 'validate', status: 'dispatched' },
        ],
        phases: ['validate', 'import'],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      };
      const input: PhasedInput = {
        type: 'ItemFailed',
        data: { itemKey: 'a', error: { reason: 'invalid' } },
      };
      const result = decide(input, state);
      expect(result).toEqual([]);
    });

    it('returns PhasedCompleted when all items across all phases complete', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'validate', status: 'completed' },
          { key: 'b', phase: 'import', status: 'completed' },
        ],
        phases: ['validate', 'import'],
        currentPhaseIndex: 1,
        stopOnFailure: true,
      };
      const input: PhasedInput = {
        type: 'ItemCompleted',
        data: { itemKey: 'b', result: { ok: true } },
      };
      const result = decide(input, state);
      expect(result).toEqual({
        type: 'PhasedCompleted',
        data: { completedItems: ['a', 'b'] },
      });
    });

    it('dispatches phase 0 items on StartPhased', () => {
      const state: PhasedState = {
        status: 'running',
        items: [
          { key: 'a', phase: 'validate', status: 'pending' },
          { key: 'b', phase: 'validate', status: 'pending' },
          { key: 'c', phase: 'import', status: 'pending' },
        ],
        phases: ['validate', 'import'],
        currentPhaseIndex: 0,
        stopOnFailure: true,
      };
      const input: PhasedInput = {
        type: 'StartPhased',
        data: {
          correlationId: 'c1',
          items: [
            { key: 'a', phase: 'validate' },
            { key: 'b', phase: 'validate' },
            { key: 'c', phase: 'import' },
          ],
          phases: ['validate', 'import'],
          stopOnFailure: true,
        },
      };
      const result = decide(input, state);
      expect(result).toEqual([
        { type: 'DispatchItem', kind: 'Command', data: { itemKey: 'a', phase: 'validate' } },
        { type: 'DispatchItem', kind: 'Command', data: { itemKey: 'b', phase: 'validate' } },
      ]);
    });
  });

  describe('initialState', () => {
    it('returns idle state with empty collections', () => {
      expect(initialState()).toEqual({
        status: 'idle',
        items: [],
        phases: [],
        currentPhaseIndex: 0,
        stopOnFailure: false,
      });
    });
  });

  describe('createPhasedWorkflow', () => {
    it('factory produces workflow with decide, evolve, initialState', () => {
      const workflow = createPhasedWorkflow();
      expect(workflow.decide).toBe(decide);
      expect(workflow.evolve).toBe(evolve);
      expect(workflow.initialState).toBe(initialState);
    });
  });
});
