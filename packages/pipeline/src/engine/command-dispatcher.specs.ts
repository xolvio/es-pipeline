import { createCommandDispatcher, dispatchAndStore } from './command-dispatcher.js';
import { createPipelineStore } from './sqlite-store.js';

describe('CommandDispatcher', () => {
  it('calls registered handler for matching command type', async () => {
    const dispatcher = createCommandDispatcher();
    const calls: Array<{ type: string; data: Record<string, unknown> }> = [];

    dispatcher.register('CheckTests', (cmd) => {
      calls.push(cmd);
      return [{ type: 'CheckTestsPassed', data: { duration: 100 } }];
    });

    const result = await dispatcher.dispatch({ type: 'CheckTests', data: { target: './src' } });

    expect(calls).toEqual([{ type: 'CheckTests', data: { target: './src' } }]);
    expect(result).toEqual([{ type: 'CheckTestsPassed', data: { duration: 100 } }]);
  });

  it('throws for unregistered command type', async () => {
    const dispatcher = createCommandDispatcher();

    await expect(dispatcher.dispatch({ type: 'Unknown', data: {} })).rejects.toThrow(
      'No handler registered for command type: Unknown',
    );
  });

  it('returns handler result events', async () => {
    const dispatcher = createCommandDispatcher();
    dispatcher.register('BuildProject', () => [
      { type: 'BuildStarted', data: {} },
      { type: 'BuildCompleted', data: { output: './dist' } },
    ]);

    const result = await dispatcher.dispatch({ type: 'BuildProject', data: {} });

    expect(result).toEqual([
      { type: 'BuildStarted', data: {} },
      { type: 'BuildCompleted', data: { output: './dist' } },
    ]);
  });
});

describe('dispatchAndStore', () => {
  it('dispatches command and stores result events', async () => {
    const store = await createPipelineStore();
    const dispatcher = createCommandDispatcher();
    dispatcher.register('CheckTests', () => [{ type: 'CheckTestsPassed', data: { duration: 100 } }]);

    const results = await dispatchAndStore(dispatcher, store.eventStore, 'pipeline-c1', {
      type: 'CheckTests',
      data: { target: './src' },
    });

    expect(results).toEqual([{ type: 'CheckTestsPassed', data: { duration: 100 } }]);

    const stream = await store.eventStore.readStream('pipeline-c1');
    expect(stream.events.map((e) => ({ type: e.type, data: e.data }))).toEqual([
      { type: 'CheckTestsPassed', data: { duration: 100 } },
    ]);
  });
});
