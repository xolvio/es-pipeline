import { createCommandDispatcher } from './command-dispatcher.js';
import { createEventRouter } from './event-router.js';

describe('EventRouter', () => {
  it('dispatches commands when matching event is routed', async () => {
    const dispatcher = createCommandDispatcher();
    const dispatched: Array<{ type: string; data: Record<string, unknown> }> = [];
    dispatcher.register('ProcessPayment', (cmd) => {
      dispatched.push(cmd);
      return [{ type: 'PaymentProcessed', data: { amount: cmd.data.amount } }];
    });

    const router = createEventRouter(dispatcher);
    router.register({
      eventType: 'OrderCreated',
      commands: [{ commandType: 'ProcessPayment', data: { amount: 100 } }],
    });

    const results = await router.route({ type: 'OrderCreated', data: { orderId: '1' } });

    expect(dispatched).toEqual([{ type: 'ProcessPayment', data: { amount: 100 } }]);
    expect(results).toEqual([{ type: 'PaymentProcessed', data: { amount: 100 } }]);
  });

  it('dispatches multiple commands for single event', async () => {
    const dispatcher = createCommandDispatcher();
    dispatcher.register('ProcessPayment', () => [{ type: 'PaymentProcessed', data: {} }]);
    dispatcher.register('SendEmail', () => [{ type: 'EmailSent', data: {} }]);

    const router = createEventRouter(dispatcher);
    router.register({
      eventType: 'OrderCreated',
      commands: [
        { commandType: 'ProcessPayment', data: { amount: 100 } },
        { commandType: 'SendEmail', data: { template: 'order' } },
      ],
    });

    const results = await router.route({ type: 'OrderCreated', data: {} });

    expect(results).toEqual([
      { type: 'PaymentProcessed', data: {} },
      { type: 'EmailSent', data: {} },
    ]);
  });

  it('returns empty array for unregistered event type', async () => {
    const dispatcher = createCommandDispatcher();
    const router = createEventRouter(dispatcher);

    const results = await router.route({ type: 'Unknown', data: {} });

    expect(results).toEqual([]);
  });

  it('resolves factory data functions with the event', async () => {
    const dispatcher = createCommandDispatcher();
    dispatcher.register('ProcessPayment', (cmd) => [{ type: 'Processed', data: cmd.data }]);

    const router = createEventRouter(dispatcher);
    router.register({
      eventType: 'OrderCreated',
      commands: [
        {
          commandType: 'ProcessPayment',
          data: (event) => ({ orderId: event.data.orderId }),
        },
      ],
    });

    const results = await router.route({ type: 'OrderCreated', data: { orderId: '42' } });

    expect(results).toEqual([{ type: 'Processed', data: { orderId: '42' } }]);
  });
});
