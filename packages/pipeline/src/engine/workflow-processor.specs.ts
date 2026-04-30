import { createWorkflowProcessor } from './workflow-processor.js';
import { createSettledWorkflow } from './workflows/settled-workflow.js';

describe('WorkflowProcessor', () => {
  it('processes input event through workflow decide/evolve cycle', () => {
    const processor = createWorkflowProcessor();
    processor.register({
      id: 'test-settled',
      workflow: createSettledWorkflow({ commandTypes: ['A', 'B'] }),
      inputEvents: ['StartSettled', 'CommandCompleted'],
    });

    const startResult = processor.process({
      type: 'StartSettled',
      data: { correlationId: 'c1', commandTypes: ['A', 'B'] },
    });
    expect(startResult).toEqual([]);

    const completeA = processor.process({
      type: 'CommandCompleted',
      data: { commandType: 'A', result: 'success', event: {} },
    });
    expect(completeA).toEqual([]);

    const completeB = processor.process({
      type: 'CommandCompleted',
      data: { commandType: 'B', result: 'success', event: {} },
    });
    expect(completeB).toEqual([expect.objectContaining({ type: 'AllSettled' })]);
  });

  it('returns empty for unregistered event types', () => {
    const processor = createWorkflowProcessor();
    const result = processor.process({ type: 'Unknown', data: {} });
    expect(result).toEqual([]);
  });

  it('processes keyed events independently per instanceKey', () => {
    const processor = createWorkflowProcessor();
    processor.register({
      id: 'test-settled',
      workflow: createSettledWorkflow({ commandTypes: ['A', 'B'] }),
      inputEvents: ['StartSettled', 'CommandCompleted'],
    });

    processor.processKeyed({ type: 'StartSettled', data: { commandTypes: ['A', 'B'] } }, 'key-1');
    processor.processKeyed({ type: 'StartSettled', data: { commandTypes: ['A', 'B'] } }, 'key-2');

    processor.processKeyed(
      { type: 'CommandCompleted', data: { commandType: 'A', result: 'success', event: {} } },
      'key-1',
    );
    processor.processKeyed(
      { type: 'CommandCompleted', data: { commandType: 'A', result: 'success', event: {} } },
      'key-2',
    );

    const result1 = processor.processKeyed(
      { type: 'CommandCompleted', data: { commandType: 'B', result: 'success', event: {} } },
      'key-1',
    );
    expect(result1).toEqual([expect.objectContaining({ type: 'AllSettled' })]);

    const result2 = processor.processKeyed(
      { type: 'CommandCompleted', data: { commandType: 'B', result: 'failure', event: {} } },
      'key-2',
    );
    expect(result2).toEqual([expect.objectContaining({ type: 'RetryCommands' })]);
  });

  it('getState returns current state for given key', () => {
    const processor = createWorkflowProcessor();
    processor.register({
      id: 'test-settled',
      workflow: createSettledWorkflow({ commandTypes: ['A'] }),
      inputEvents: ['StartSettled', 'CommandCompleted'],
    });

    processor.processKeyed({ type: 'StartSettled', data: { commandTypes: ['A'] } }, 'key-1');
    processor.processKeyed(
      { type: 'CommandCompleted', data: { commandType: 'A', result: 'success', event: { v: 1 } } },
      'key-1',
    );

    const state = processor.getState('test-settled', 'key-1');
    expect(state).toEqual({
      status: 'done',
      commandTypes: ['A'],
      completions: { A: { result: 'success', event: { v: 1 } } },
      retryCount: 0,
      maxRetries: 3,
    });
  });

  it('getState returns initial state for unknown key', () => {
    const processor = createWorkflowProcessor();
    processor.register({
      id: 'test-settled',
      workflow: createSettledWorkflow({ commandTypes: ['A'] }),
      inputEvents: ['StartSettled', 'CommandCompleted'],
    });

    const state = processor.getState('test-settled', 'unknown-key');
    expect(state).toEqual({
      status: 'idle',
      commandTypes: [],
      completions: {},
      retryCount: 0,
      maxRetries: 3,
    });
  });

  it('resetInstance clears keyed history', () => {
    const processor = createWorkflowProcessor();
    processor.register({
      id: 'test-settled',
      workflow: createSettledWorkflow({ commandTypes: ['A'] }),
      inputEvents: ['StartSettled', 'CommandCompleted'],
    });

    processor.processKeyed({ type: 'StartSettled', data: { commandTypes: ['A'] } }, 'key-1');
    processor.processKeyed(
      { type: 'CommandCompleted', data: { commandType: 'A', result: 'success', event: {} } },
      'key-1',
    );

    processor.resetInstance('test-settled', 'key-1');

    const state = processor.getState('test-settled', 'key-1');
    expect(state).toEqual({
      status: 'idle',
      commandTypes: [],
      completions: {},
      retryCount: 0,
      maxRetries: 3,
    });
  });
});
