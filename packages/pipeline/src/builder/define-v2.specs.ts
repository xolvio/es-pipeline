import { defineV2, toGraph } from './define-v2';

describe('define-v2', () => {
  it('exposes pipeline name', () => {
    const pipeline = defineV2('my-pipeline').build();
    expect(pipeline.name).toBe('my-pipeline');
  });

  describe('on().emit()', () => {
    it('produces EmitRegistration for single emit', () => {
      const pipeline = defineV2('test-pipeline').on('OrderCreated').emit('ProcessPayment', { amount: 100 }).build();

      expect(pipeline.registrations).toEqual([
        {
          type: 'emit',
          eventType: 'OrderCreated',
          commands: [{ commandType: 'ProcessPayment', data: { amount: 100 } }],
        },
      ]);
    });

    it('produces EmitRegistration with multiple commands', () => {
      const pipeline = defineV2('test-pipeline')
        .on('OrderCreated')
        .emit('ProcessPayment', { amount: 100 })
        .emit('SendConfirmation', { template: 'order' })
        .build();

      expect(pipeline.registrations).toEqual([
        {
          type: 'emit',
          eventType: 'OrderCreated',
          commands: [
            { commandType: 'ProcessPayment', data: { amount: 100 } },
            { commandType: 'SendConfirmation', data: { template: 'order' } },
          ],
        },
      ]);
    });

    it('supports factory function for data', () => {
      const factory = (event: Record<string, unknown>) => ({ id: event.id });
      const pipeline = defineV2('test-pipeline').on('OrderCreated').emit('ProcessPayment', factory).build();

      expect(pipeline.registrations[0]).toEqual({
        type: 'emit',
        eventType: 'OrderCreated',
        commands: [{ commandType: 'ProcessPayment', data: factory }],
      });
    });

    it('chains multiple on().emit() blocks', () => {
      const pipeline = defineV2('test-pipeline')
        .on('OrderCreated')
        .emit('ProcessPayment', { amount: 100 })
        .on('PaymentProcessed')
        .emit('ShipOrder', { warehouse: 'main' })
        .build();

      expect(pipeline.registrations).toEqual([
        {
          type: 'emit',
          eventType: 'OrderCreated',
          commands: [{ commandType: 'ProcessPayment', data: { amount: 100 } }],
        },
        {
          type: 'emit',
          eventType: 'PaymentProcessed',
          commands: [{ commandType: 'ShipOrder', data: { warehouse: 'main' } }],
        },
      ]);
    });
  });

  describe('on().handle()', () => {
    it('produces CustomHandlerRegistration', () => {
      const handler = () => [{ type: 'Result', data: {} }];
      const pipeline = defineV2('test-pipeline').on('OrderCreated').handle(handler).build();

      expect(pipeline.registrations).toEqual([
        {
          type: 'custom',
          eventType: 'OrderCreated',
          handler,
        },
      ]);
    });
  });

  describe('settled()', () => {
    it('produces SettledRegistration', () => {
      const pipeline = defineV2('test').settled(['CheckTests', 'CheckTypes', 'CheckLint']).build();
      expect(pipeline.registrations).toEqual([
        { type: 'settled', commandTypes: ['CheckTests', 'CheckTypes', 'CheckLint'] },
      ]);
    });

    it('supports maxRetries option', () => {
      const pipeline = defineV2('test').settled(['A', 'B']).maxRetries(5).build();
      expect(pipeline.registrations).toEqual([{ type: 'settled', commandTypes: ['A', 'B'], maxRetries: 5 }]);
    });
  });

  describe('forEach().groupInto().process()', () => {
    it('produces PhasedRegistration', () => {
      const pipeline = defineV2('test')
        .on('ComponentsGenerated')
        .forEach()
        .groupInto(['molecule', 'organism', 'page'])
        .process()
        .build();
      expect(pipeline.registrations).toEqual([
        {
          type: 'phased',
          eventType: 'ComponentsGenerated',
          phases: ['molecule', 'organism', 'page'],
          stopOnFailure: false,
        },
      ]);
    });

    it('supports stopOnFailure', () => {
      const pipeline = defineV2('test')
        .on('ComponentsGenerated')
        .forEach()
        .groupInto(['a', 'b'])
        .process()
        .stopOnFailure()
        .build();
      expect(pipeline.registrations).toEqual([
        {
          type: 'phased',
          eventType: 'ComponentsGenerated',
          phases: ['a', 'b'],
          stopOnFailure: true,
        },
      ]);
    });
  });

  describe('run().awaitAll()', () => {
    it('produces AwaitRegistration', () => {
      const pipeline = defineV2('test').on('BatchStarted').run(['fetchUsers', 'fetchRoles']).awaitAll().build();
      expect(pipeline.registrations).toEqual([
        {
          type: 'await',
          eventType: 'BatchStarted',
          keys: ['fetchUsers', 'fetchRoles'],
        },
      ]);
    });
  });

  describe('toGraph()', () => {
    it('converts emit registration to graph nodes and edges', () => {
      const pipeline = defineV2('test')
        .on('OrderCreated')
        .emit('ProcessPayment', { amount: 100 })
        .emit('SendEmail', { template: 'order' })
        .build();

      const graph = toGraph(pipeline);

      expect(graph.nodes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'evt:OrderCreated', type: 'event' }),
          expect.objectContaining({ id: 'cmd:ProcessPayment', type: 'command' }),
          expect.objectContaining({ id: 'cmd:SendEmail', type: 'command' }),
        ]),
      );
      expect(graph.edges).toEqual(
        expect.arrayContaining([
          { from: 'evt:OrderCreated', to: 'cmd:ProcessPayment' },
          { from: 'evt:OrderCreated', to: 'cmd:SendEmail' },
        ]),
      );
    });

    it('converts settled registration to graph nodes', () => {
      const pipeline = defineV2('test').settled(['CheckTests', 'CheckTypes']).build();

      const graph = toGraph(pipeline);

      expect(graph.nodes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'cmd:CheckTests', type: 'command' }),
          expect.objectContaining({ id: 'cmd:CheckTypes', type: 'command' }),
          expect.objectContaining({ id: 'settled:CheckTests,CheckTypes', type: 'settled' }),
        ]),
      );
      expect(graph.edges).toEqual(
        expect.arrayContaining([
          { from: 'cmd:CheckTests', to: 'settled:CheckTests,CheckTypes' },
          { from: 'cmd:CheckTypes', to: 'settled:CheckTests,CheckTypes' },
        ]),
      );
    });

    it('converts phased registration to graph nodes', () => {
      const pipeline = defineV2('test')
        .on('ComponentsGenerated')
        .forEach()
        .groupInto(['molecule', 'organism'])
        .process()
        .build();

      const graph = toGraph(pipeline);

      expect(graph.nodes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'evt:ComponentsGenerated', type: 'event' }),
          expect.objectContaining({ type: 'phased' }),
        ]),
      );
    });

    it('converts await registration to graph nodes', () => {
      const pipeline = defineV2('test').on('BatchStarted').run(['fetchUsers', 'fetchRoles']).awaitAll().build();

      const graph = toGraph(pipeline);

      expect(graph.nodes).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: 'evt:BatchStarted', type: 'event' }),
          expect.objectContaining({ type: 'await' }),
        ]),
      );
    });

    it('returns empty graph for empty pipeline', () => {
      const pipeline = defineV2('test').build();
      const graph = toGraph(pipeline);
      expect(graph).toEqual({ nodes: [], edges: [] });
    });
  });
});
