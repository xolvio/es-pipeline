import { createPipelineStore } from './sqlite-store.js';

describe('createPipelineStore', () => {
  it('creates a pipeline store with in-memory SQLite', async () => {
    const store = await createPipelineStore();
    expect(store.eventStore).toBeDefined();
    expect(store.close).toBeInstanceOf(Function);
    await store.close();
  });

  it('appends events to a stream and reads them back', async () => {
    const store = await createPipelineStore();

    await store.eventStore.appendToStream('test-stream-1', [
      { type: 'TaskStarted', data: { taskId: 'a' } },
      { type: 'TaskCompleted', data: { taskId: 'a' } },
    ]);

    const result = await store.eventStore.readStream('test-stream-1');

    expect(result.events).toHaveLength(2);
    expect(result.events[0]!.type).toEqual('TaskStarted');
    expect(result.events[0]!.data).toEqual({ taskId: 'a' });
    expect(result.events[1]!.type).toEqual('TaskCompleted');
    expect(result.events[1]!.data).toEqual({ taskId: 'a' });

    await store.close();
  });

  it('returns events in append order', async () => {
    const store = await createPipelineStore();

    await store.eventStore.appendToStream('test-stream-2', [
      { type: 'Step1', data: { order: 1 } },
      { type: 'Step2', data: { order: 2 } },
      { type: 'Step3', data: { order: 3 } },
    ]);

    const result = await store.eventStore.readStream('test-stream-2');

    expect(result.events.map((e) => e.type)).toEqual(['Step1', 'Step2', 'Step3']);
    expect(result.events.map((e) => e.data)).toEqual([{ order: 1 }, { order: 2 }, { order: 3 }]);

    await store.close();
  });
});
