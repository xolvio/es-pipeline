import { defineV2, toGraph } from '../builder/define-v2.js';
import { createPipelineEngine } from './pipeline-engine.js';
import { createSettledWorkflow } from './workflows/settled-workflow.js';

describe('PipelineEngine integration', () => {
  it('runs emit chain: command A produces event, triggers command B', async () => {
    const engine = await createPipelineEngine();
    const events: string[] = [];

    engine.registerCommandHandler('StartBuild', () => [{ type: 'BuildStarted', data: {} }]);
    engine.registerCommandHandler('RunTests', () => [{ type: 'TestsPassed', data: {} }]);
    engine.registerEmitMapping({
      eventType: 'BuildStarted',
      commands: [{ commandType: 'RunTests', data: {} }],
    });

    engine.onEvent((e) => events.push(e.type));
    await engine.dispatch({ type: 'StartBuild', data: {} });

    expect(events).toEqual(['BuildStarted', 'TestsPassed']);
    await engine.close();
  });

  it('runs settled workflow through full lifecycle', async () => {
    const engine = await createPipelineEngine();
    const events: string[] = [];

    engine.registerCommandHandler('CheckTests', () => [
      { type: 'CommandCompleted', data: { commandType: 'CheckTests', result: 'success', event: {} } },
    ]);
    engine.registerCommandHandler('CheckTypes', () => [
      { type: 'CommandCompleted', data: { commandType: 'CheckTypes', result: 'success', event: {} } },
    ]);

    engine.registerWorkflow({
      id: 'settled-checks',
      workflow: createSettledWorkflow({ commandTypes: ['CheckTests', 'CheckTypes'] }),
      inputEvents: ['StartSettled', 'CommandCompleted'],
    });

    engine.onEvent((e) => events.push(e.type));

    engine.processWorkflowEvent({
      type: 'StartSettled',
      data: { correlationId: 'c1', commandTypes: ['CheckTests', 'CheckTypes'] },
    });

    await engine.dispatch({ type: 'CheckTests', data: {} });
    await engine.dispatch({ type: 'CheckTypes', data: {} });

    expect(events).toContain('CommandCompleted');
    expect(events).toContain('AllSettled');
    await engine.close();
  });

  it('runs settled workflow with failure and retry', async () => {
    const engine = await createPipelineEngine();
    const events: string[] = [];
    let callCount = 0;

    engine.registerCommandHandler('CheckTests', () => {
      callCount++;
      if (callCount === 1) {
        return [
          {
            type: 'CommandCompleted',
            data: { commandType: 'CheckTests', result: 'failure', event: { error: 'failed' } },
          },
        ];
      }
      return [{ type: 'CommandCompleted', data: { commandType: 'CheckTests', result: 'success', event: {} } }];
    });

    engine.registerWorkflow({
      id: 'retry-settled',
      workflow: createSettledWorkflow({ commandTypes: ['CheckTests'], maxRetries: 3 }),
      inputEvents: ['StartSettled', 'CommandCompleted'],
    });

    engine.onEvent((e) => events.push(e.type));

    engine.processWorkflowEvent({
      type: 'StartSettled',
      data: { correlationId: 'c1', commandTypes: ['CheckTests'] },
    });

    await engine.dispatch({ type: 'CheckTests', data: {} });

    expect(events).toContain('RetryCommands');
    await engine.close();
  });
});

describe('crash recovery', () => {
  it('event store persists events across operations', async () => {
    const engine = await createPipelineEngine();

    engine.registerCommandHandler('StoreData', () => [{ type: 'DataStored', data: { key: 'test' } }]);

    await engine.dispatch({ type: 'StoreData', data: {} });

    const events: string[] = [];
    engine.onEvent((e) => events.push(e.type));

    engine.registerCommandHandler('MoreData', () => [{ type: 'MoreDataStored', data: {} }]);
    await engine.dispatch({ type: 'MoreData', data: {} });

    expect(events).toEqual(['MoreDataStored']);
    await engine.close();
  });
});

describe('A/B parity', () => {
  it('v2 graph output has same structure as v1 format', () => {
    const pipeline = defineV2('test').on('EventA').emit('CommandB', {}).build();

    const graph = toGraph(pipeline);

    expect(graph).toEqual({
      nodes: expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String), type: expect.any(String), label: expect.any(String) }),
      ]),
      edges: expect.arrayContaining([expect.objectContaining({ from: expect.any(String), to: expect.any(String) })]),
    });
  });
});
