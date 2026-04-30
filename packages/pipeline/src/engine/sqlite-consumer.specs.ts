import { createConsumer } from './sqlite-consumer.js';
import { createPipelineStore } from './sqlite-store.js';

describe('SQLiteConsumer', () => {
  it('delivers events to registered handler', async () => {
    const store = await createPipelineStore();
    const consumer = createConsumer(store);
    const received: Array<{ type: string }> = [];

    consumer.on('TestEvent', (event) => {
      received.push(event);
    });

    await store.eventStore.appendToStream('test-stream', [{ type: 'TestEvent', data: { value: 1 } }]);

    await consumer.poll();

    expect(received).toEqual([expect.objectContaining({ type: 'TestEvent', data: { value: 1 } })]);
  });

  it('delivers events in order', async () => {
    const store = await createPipelineStore();
    const consumer = createConsumer(store);
    const types: string[] = [];

    consumer.on('A', (event) => {
      types.push(event.type);
    });
    consumer.on('B', (event) => {
      types.push(event.type);
    });

    await store.eventStore.appendToStream('s1', [
      { type: 'A', data: {} },
      { type: 'B', data: {} },
    ]);

    await consumer.poll();

    expect(types).toEqual(['A', 'B']);
  });
});
