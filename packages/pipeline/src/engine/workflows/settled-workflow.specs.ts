import type { SettledInput, SettledState } from './settled-workflow';
import { createSettledWorkflow, decide, evolve, initialState } from './settled-workflow';

describe('settled workflow', () => {
  describe('initialState', () => {
    it('returns idle state with empty tracking', () => {
      expect(initialState()).toEqual({
        status: 'idle',
        commandTypes: [],
        completions: {},
        retryCount: 0,
        maxRetries: 3,
      });
    });
  });

  describe('evolve', () => {
    it('transitions from idle to waiting on StartSettled', () => {
      const state = initialState();
      const event = {
        type: 'StartSettled' as const,
        data: { correlationId: 'corr-1', commandTypes: ['CheckTests', 'CheckTypes'] },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'waiting',
        commandTypes: ['CheckTests', 'CheckTypes'],
        completions: {},
        retryCount: 0,
        maxRetries: 3,
      });
    });

    it('records command completion', () => {
      const state = {
        status: 'waiting' as const,
        commandTypes: ['CheckTests', 'CheckTypes'],
        completions: {},
        retryCount: 0,
        maxRetries: 3,
      };
      const event = {
        type: 'CommandCompleted' as const,
        data: {
          commandType: 'CheckTests',
          result: 'success' as const,
          event: { passed: true },
        },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'waiting',
        commandTypes: ['CheckTests', 'CheckTypes'],
        completions: {
          CheckTests: { result: 'success', event: { passed: true } },
        },
        retryCount: 0,
        maxRetries: 3,
      });
    });

    it('preserves existing completions when recording another', () => {
      const state = {
        status: 'waiting' as const,
        commandTypes: ['CheckTests', 'CheckTypes', 'CheckLint'],
        completions: {
          CheckTests: { result: 'success' as const, event: { passed: true } },
        },
        retryCount: 0,
        maxRetries: 3,
      };
      const event = {
        type: 'CommandCompleted' as const,
        data: {
          commandType: 'CheckTypes',
          result: 'failure' as const,
          event: { errors: 3 },
        },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'waiting',
        commandTypes: ['CheckTests', 'CheckTypes', 'CheckLint'],
        completions: {
          CheckTests: { result: 'success', event: { passed: true } },
          CheckTypes: { result: 'failure', event: { errors: 3 } },
        },
        retryCount: 0,
        maxRetries: 3,
      });
    });

    it('does not mutate the original state', () => {
      const state = {
        status: 'waiting' as const,
        commandTypes: ['CheckTests', 'CheckTypes'],
        completions: {},
        retryCount: 0,
        maxRetries: 3,
      };
      const event = {
        type: 'CommandCompleted' as const,
        data: {
          commandType: 'CheckTests',
          result: 'success' as const,
          event: { passed: true },
        },
      };

      evolve(state, event);

      expect(state.completions).toEqual({});
    });

    it('returns state unchanged for unknown event types', () => {
      const state = initialState();
      const event = { type: 'UnknownEvent' as string, data: {} };

      const result = evolve(state, event as any);

      expect(result).toEqual(state);
    });

    it('handles output events by returning state unchanged', () => {
      const state = {
        status: 'waiting' as const,
        commandTypes: ['CheckTests'],
        completions: {
          CheckTests: { result: 'success' as const, event: { passed: true } },
        },
        retryCount: 0,
        maxRetries: 3,
      };
      const event = {
        type: 'AllSettled' as const,
        data: {
          results: {
            CheckTests: { result: 'success' as const, event: { passed: true } },
          },
        },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'done',
        commandTypes: ['CheckTests'],
        completions: {
          CheckTests: { result: 'success', event: { passed: true } },
        },
        retryCount: 0,
        maxRetries: 3,
      });
    });

    it('transitions to done on SettledFailed', () => {
      const state = {
        status: 'waiting' as const,
        commandTypes: ['CheckTests'],
        completions: {
          CheckTests: { result: 'failure' as const, event: { errors: 1 } },
        },
        retryCount: 0,
        maxRetries: 3,
      };
      const event = {
        type: 'SettledFailed' as const,
        data: {
          results: {
            CheckTests: { result: 'failure' as const, event: { errors: 1 } },
          },
          failures: ['CheckTests'],
        },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'done',
        commandTypes: ['CheckTests'],
        completions: {
          CheckTests: { result: 'failure', event: { errors: 1 } },
        },
        retryCount: 0,
        maxRetries: 3,
      });
    });

    it('increments retryCount on RetryCommands', () => {
      const state = {
        status: 'waiting' as const,
        commandTypes: ['CheckTests', 'CheckTypes'],
        completions: {
          CheckTests: { result: 'failure' as const, event: { errors: 1 } },
          CheckTypes: { result: 'success' as const, event: {} },
        },
        retryCount: 0,
        maxRetries: 3,
      };
      const event = {
        type: 'RetryCommands' as const,
        kind: 'Command' as const,
        data: { commandTypes: ['CheckTests'] },
      };

      const result = evolve(state, event);

      expect(result).toEqual({
        status: 'waiting',
        commandTypes: ['CheckTests', 'CheckTypes'],
        completions: {
          CheckTypes: { result: 'success', event: {} },
        },
        retryCount: 1,
        maxRetries: 3,
      });
    });
  });

  describe('decide', () => {
    it('returns empty array when not all commands completed', () => {
      const state: SettledState = {
        status: 'waiting',
        commandTypes: ['CheckTests', 'CheckTypes', 'CheckLint'],
        completions: {
          CheckTests: { result: 'success', event: { duration: 100 } },
        },
        retryCount: 0,
        maxRetries: 3,
      };
      const input: SettledInput = {
        type: 'CommandCompleted',
        data: { commandType: 'CheckTests', result: 'success', event: { duration: 100 } },
      };
      const result = decide(input, state);
      expect(result).toEqual([]);
    });

    it('returns empty array when status is idle', () => {
      const state = initialState();
      const input: SettledInput = {
        type: 'StartSettled',
        data: { correlationId: 'c1', commandTypes: ['A'] },
      };
      const result = decide(input, state);
      expect(result).toEqual([]);
    });

    it('returns AllSettled when all commands completed successfully', () => {
      const completions = {
        CheckTests: { result: 'success' as const, event: { duration: 100 } },
        CheckTypes: { result: 'success' as const, event: { duration: 50 } },
        CheckLint: { result: 'success' as const, event: { duration: 30 } },
      };
      const state: SettledState = {
        status: 'waiting',
        commandTypes: ['CheckTests', 'CheckTypes', 'CheckLint'],
        completions,
        retryCount: 0,
        maxRetries: 3,
      };
      const input: SettledInput = {
        type: 'CommandCompleted',
        data: { commandType: 'CheckLint', result: 'success', event: { duration: 30 } },
      };
      const result = decide(input, state);
      expect(result).toEqual({
        type: 'AllSettled',
        data: { results: completions },
      });
    });

    it('returns RetryCommands when failures exist and retries available', () => {
      const completions = {
        CheckTests: { result: 'failure' as const, event: { error: 'test failed' } },
        CheckTypes: { result: 'success' as const, event: { duration: 50 } },
        CheckLint: { result: 'success' as const, event: { duration: 30 } },
      };
      const state: SettledState = {
        status: 'waiting',
        commandTypes: ['CheckTests', 'CheckTypes', 'CheckLint'],
        completions,
        retryCount: 0,
        maxRetries: 3,
      };
      const input: SettledInput = {
        type: 'CommandCompleted',
        data: { commandType: 'CheckLint', result: 'success', event: { duration: 30 } },
      };
      const result = decide(input, state);
      expect(result).toEqual({
        type: 'RetryCommands',
        kind: 'Command',
        data: { commandTypes: ['CheckTests'] },
      });
    });

    it('returns SettledFailed when failures exist and no retries left', () => {
      const completions = {
        CheckTests: { result: 'failure' as const, event: { error: 'test failed' } },
        CheckTypes: { result: 'success' as const, event: { duration: 50 } },
        CheckLint: { result: 'success' as const, event: { duration: 30 } },
      };
      const state: SettledState = {
        status: 'waiting',
        commandTypes: ['CheckTests', 'CheckTypes', 'CheckLint'],
        completions,
        retryCount: 3,
        maxRetries: 3,
      };
      const input: SettledInput = {
        type: 'CommandCompleted',
        data: { commandType: 'CheckLint', result: 'success', event: { duration: 30 } },
      };
      const result = decide(input, state);
      expect(result).toEqual({
        type: 'SettledFailed',
        data: {
          results: completions,
          failures: ['CheckTests'],
        },
      });
    });
  });

  describe('createSettledWorkflow', () => {
    it('factory produces workflow with configured command types and max retries', () => {
      const workflow = createSettledWorkflow({
        commandTypes: ['A', 'B'],
        maxRetries: 5,
      });
      const state = workflow.initialState();
      expect(state).toEqual({
        status: 'idle',
        commandTypes: [],
        completions: {},
        retryCount: 0,
        maxRetries: 5,
      });
      expect(workflow.decide).toBe(decide);
      expect(workflow.evolve).toBe(evolve);
    });

    it('defaults maxRetries to 3 when not provided', () => {
      const workflow = createSettledWorkflow({
        commandTypes: ['X'],
      });
      const state = workflow.initialState();
      expect(state).toEqual({
        status: 'idle',
        commandTypes: [],
        completions: {},
        retryCount: 0,
        maxRetries: 3,
      });
    });
  });
});
