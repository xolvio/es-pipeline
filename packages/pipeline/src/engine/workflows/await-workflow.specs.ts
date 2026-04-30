import { type AwaitInput, type AwaitState, createAwaitWorkflow, decide, evolve, initialState } from './await-workflow';

describe('await workflow', () => {
  describe('evolve', () => {
    it('transitions from idle to waiting on StartAwait', () => {
      const state = initialState();
      const event = { type: 'StartAwait' as const, data: { correlationId: 'c1', keys: ['a', 'b', 'c'] } };
      const result = evolve(state, event);
      expect(result).toEqual({
        status: 'waiting',
        pendingKeys: ['a', 'b', 'c'],
        results: {},
      });
    });

    it('removes key from pending and stores result on KeyCompleted', () => {
      const state: AwaitState = {
        status: 'waiting',
        pendingKeys: ['a', 'b'],
        results: {},
      };
      const event = { type: 'KeyCompleted' as const, data: { key: 'a', result: { value: 42 } } };
      const result = evolve(state, event);
      expect(result).toEqual({
        status: 'waiting',
        pendingKeys: ['b'],
        results: { a: { value: 42 } },
      });
    });

    it('ignores KeyCompleted for unknown keys', () => {
      const state: AwaitState = {
        status: 'waiting',
        pendingKeys: ['a'],
        results: {},
      };
      const event = { type: 'KeyCompleted' as const, data: { key: 'z', result: { value: 1 } } };
      const result = evolve(state, event);
      expect(result).toEqual(state);
    });
  });

  describe('decide', () => {
    it('returns empty array when keys still pending', () => {
      const state: AwaitState = {
        status: 'waiting',
        pendingKeys: ['b', 'c'],
        results: { a: { value: 1 } },
      };
      const input: AwaitInput = {
        type: 'KeyCompleted',
        data: { key: 'a', result: { value: 1 } },
      };
      const result = decide(input, state);
      expect(result).toEqual([]);
    });

    it('returns AwaitCompleted when all keys resolved', () => {
      const state: AwaitState = {
        status: 'waiting',
        pendingKeys: [],
        results: {
          a: { value: 1 },
          b: { value: 2 },
          c: { value: 3 },
        },
      };
      const input: AwaitInput = {
        type: 'KeyCompleted',
        data: { key: 'c', result: { value: 3 } },
      };
      const result = decide(input, state);
      expect(result).toEqual({
        type: 'AwaitCompleted',
        data: {
          results: {
            a: { value: 1 },
            b: { value: 2 },
            c: { value: 3 },
          },
        },
      });
    });

    it('returns empty array when status is idle', () => {
      const state = initialState();
      const input: AwaitInput = {
        type: 'StartAwait',
        data: { correlationId: 'c1', keys: ['a'] },
      };
      const result = decide(input, state);
      expect(result).toEqual([]);
    });
  });

  describe('createAwaitWorkflow', () => {
    it('factory produces workflow with decide, evolve, initialState', () => {
      const workflow = createAwaitWorkflow();
      expect(workflow.decide).toBe(decide);
      expect(workflow.evolve).toBe(evolve);
      expect(workflow.initialState).toBe(initialState);
    });
  });
});
