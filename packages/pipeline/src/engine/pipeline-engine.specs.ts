import { createPipelineEngine } from './pipeline-engine.js';
import { createSettledWorkflow } from './workflows/settled-workflow.js';

describe('PipelineEngine', () => {
  it('dispatches command through registered handler', async () => {
    const engine = await createPipelineEngine();
    const calls: string[] = [];

    engine.registerCommandHandler('CheckTests', () => {
      calls.push('CheckTests');
      return [{ type: 'CheckTestsPassed', data: {} }];
    });

    await engine.dispatch({ type: 'CheckTests', data: {} });

    expect(calls).toEqual(['CheckTests']);
    await engine.close();
  });

  it('routes events to emit mappings after command dispatch', async () => {
    const engine = await createPipelineEngine();
    const calls: string[] = [];

    engine.registerCommandHandler('A', () => [{ type: 'ACompleted', data: {} }]);
    engine.registerCommandHandler('B', () => {
      calls.push('B');
      return [{ type: 'BCompleted', data: {} }];
    });
    engine.registerEmitMapping({
      eventType: 'ACompleted',
      commands: [{ commandType: 'B', data: {} }],
    });

    await engine.dispatch({ type: 'A', data: {} });

    expect(calls).toEqual(['B']);
    await engine.close();
  });

  it('processes full settled workflow flow', async () => {
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

    engine.onEvent((event) => events.push(event.type));

    engine.processWorkflowEvent({
      type: 'StartSettled',
      data: { correlationId: 'c1', commandTypes: ['CheckTests', 'CheckTypes'] },
    });

    await engine.dispatch({ type: 'CheckTests', data: {} });
    await engine.dispatch({ type: 'CheckTypes', data: {} });

    expect(events).toContain('AllSettled');
    await engine.close();
  });
});
