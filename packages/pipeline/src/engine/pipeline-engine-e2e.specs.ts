import { defineV2, toGraph } from '../builder/define-v2.js';
import { containsSubsequence } from '../testing/snapshot-compare.js';
import { createPipelineEngine } from './pipeline-engine.js';
import { createAwaitWorkflow } from './workflows/await-workflow.js';
import { createPhasedWorkflow } from './workflows/phased-workflow.js';
import { createSettledWorkflow } from './workflows/settled-workflow.js';

type Event = { type: string; data: Record<string, unknown> };
type Command = { type: string; data: Record<string, unknown> };
type CommandHandler = (cmd: Command) => Event[] | Promise<Event[]>;

type EmitMapping = {
  eventType: string;
  commands: Array<{
    commandType: string;
    data: Record<string, unknown> | ((event: Event) => Record<string, unknown>);
  }>;
};

type WorkflowRegistration = {
  id: string;
  workflow: {
    decide: (input: Event, state: unknown) => Event | Event[];
    evolve: (state: unknown, event: Event) => unknown;
    initialState: () => unknown;
  };
  inputEvents: string[];
};

async function createTestPipeline(config: {
  handlers: Record<string, CommandHandler>;
  emitMappings?: EmitMapping[];
  workflows?: WorkflowRegistration[];
}) {
  const engine = await createPipelineEngine();
  const events: Event[] = [];
  engine.onEvent((event) => events.push(event));

  for (const [type, handler] of Object.entries(config.handlers)) {
    engine.registerCommandHandler(type, handler);
  }
  for (const mapping of config.emitMappings ?? []) {
    engine.registerEmitMapping(mapping);
  }
  for (const workflow of config.workflows ?? []) {
    engine.registerWorkflow(workflow);
  }

  return {
    dispatch: (cmd: Command) => engine.dispatch(cmd),
    replay: async (commands: Command[]) => {
      for (const cmd of commands) {
        await engine.dispatch(cmd);
      }
    },
    events: () => [...events],
    eventTypes: () => events.map((e) => e.type),
    eventsOfType: (type: string) => events.filter((e) => e.type === type),
    hasEvent: (type: string) => events.some((e) => e.type === type),
    close: () => engine.close(),
  };
}

describe('PipelineEngine E2E', () => {
  describe('emit chains', () => {
    it('dispatches downstream command when event fires', async () => {
      const pipeline = await createTestPipeline({
        handlers: {
          StartBuild: () => [{ type: 'BuildStarted', data: {} }],
          RunTests: () => [{ type: 'TestsPassed', data: {} }],
        },
        emitMappings: [{ eventType: 'BuildStarted', commands: [{ commandType: 'RunTests', data: {} }] }],
      });

      await pipeline.dispatch({ type: 'StartBuild', data: {} });

      expect(pipeline.eventTypes()).toEqual(['BuildStarted', 'TestsPassed']);
      await pipeline.close();
    });

    it('chains three hops with data factory functions', async () => {
      const pipeline = await createTestPipeline({
        handlers: {
          A: () => [{ type: 'ADone', data: { path: '/src' } }],
          B: (cmd) => [{ type: 'BDone', data: { target: cmd.data.target } }],
          C: () => [{ type: 'CDone', data: {} }],
        },
        emitMappings: [
          { eventType: 'ADone', commands: [{ commandType: 'B', data: (e) => ({ target: e.data.path }) }] },
          { eventType: 'BDone', commands: [{ commandType: 'C', data: {} }] },
        ],
      });

      await pipeline.dispatch({ type: 'A', data: {} });

      expect(pipeline.eventTypes()).toEqual(['ADone', 'BDone', 'CDone']);
      expect(pipeline.eventsOfType('BDone')[0].data).toEqual({ target: '/src' });
      await pipeline.close();
    });
  });

  describe('settled workflow', () => {
    it('all commands succeed produces AllSettled', async () => {
      const pipeline = await createTestPipeline({
        handlers: {
          RunChecks: () => [
            { type: 'StartSettled', data: { correlationId: 'c1', commandTypes: ['CheckA', 'CheckB'] } },
          ],
          CheckA: () => [{ type: 'CommandCompleted', data: { commandType: 'CheckA', result: 'success', event: {} } }],
          CheckB: () => [{ type: 'CommandCompleted', data: { commandType: 'CheckB', result: 'success', event: {} } }],
        },
        emitMappings: [
          {
            eventType: 'StartSettled',
            commands: [
              { commandType: 'CheckA', data: {} },
              { commandType: 'CheckB', data: {} },
            ],
          },
        ],
        workflows: [
          {
            id: 'settled-checks',
            workflow: createSettledWorkflow({ commandTypes: ['CheckA', 'CheckB'] }),
            inputEvents: ['StartSettled', 'CommandCompleted'],
          },
        ],
      });

      await pipeline.dispatch({ type: 'RunChecks', data: {} });

      expect(pipeline.hasEvent('AllSettled')).toBe(true);
      expect(pipeline.eventTypes()).toEqual(['StartSettled', 'CommandCompleted', 'CommandCompleted', 'AllSettled']);
      await pipeline.close();
    });

    it('retry succeeds after initial failure', async () => {
      let checkACallCount = 0;
      const pipeline = await createTestPipeline({
        handlers: {
          RunChecks: () => [
            { type: 'StartSettled', data: { correlationId: 'c1', commandTypes: ['CheckA', 'CheckB'] } },
          ],
          CheckA: () => {
            checkACallCount++;
            if (checkACallCount === 1) {
              return [
                {
                  type: 'CommandCompleted',
                  data: { commandType: 'CheckA', result: 'failure', event: { error: 'flaky' } },
                },
              ];
            }
            return [{ type: 'CommandCompleted', data: { commandType: 'CheckA', result: 'success', event: {} } }];
          },
          CheckB: () => [{ type: 'CommandCompleted', data: { commandType: 'CheckB', result: 'success', event: {} } }],
        },
        emitMappings: [
          {
            eventType: 'StartSettled',
            commands: [
              { commandType: 'CheckA', data: {} },
              { commandType: 'CheckB', data: {} },
            ],
          },
          {
            eventType: 'RetryCommands',
            commands: [
              { commandType: 'CheckA', data: {} },
              { commandType: 'CheckB', data: {} },
            ],
          },
        ],
        workflows: [
          {
            id: 'settled-checks',
            workflow: createSettledWorkflow({ commandTypes: ['CheckA', 'CheckB'], maxRetries: 3 }),
            inputEvents: ['StartSettled', 'CommandCompleted'],
          },
        ],
      });

      await pipeline.dispatch({ type: 'RunChecks', data: {} });

      expect(containsSubsequence(pipeline.eventTypes(), ['StartSettled', 'RetryCommands', 'AllSettled'])).toBe(true);
      expect(pipeline.hasEvent('AllSettled')).toBe(true);
      await pipeline.close();
    });

    it('max retries exhausted produces SettledFailed', async () => {
      const pipeline = await createTestPipeline({
        handlers: {
          RunChecks: () => [{ type: 'StartSettled', data: { correlationId: 'c1', commandTypes: ['CheckA'] } }],
          CheckA: () => [
            {
              type: 'CommandCompleted',
              data: { commandType: 'CheckA', result: 'failure', event: { error: 'broken' } },
            },
          ],
        },
        emitMappings: [
          { eventType: 'StartSettled', commands: [{ commandType: 'CheckA', data: {} }] },
          { eventType: 'RetryCommands', commands: [{ commandType: 'CheckA', data: {} }] },
        ],
        workflows: [
          {
            id: 'settled-checks',
            workflow: createSettledWorkflow({ commandTypes: ['CheckA'], maxRetries: 2 }),
            inputEvents: ['StartSettled', 'CommandCompleted'],
          },
        ],
      });

      await pipeline.dispatch({ type: 'RunChecks', data: {} });

      expect(pipeline.hasEvent('SettledFailed')).toBe(true);
      expect(pipeline.hasEvent('AllSettled')).toBe(false);
      await pipeline.close();
    });
  });

  describe('phased workflow', () => {
    it('items execute in phase order', async () => {
      const executionOrder: string[] = [];
      const pipeline = await createTestPipeline({
        handlers: {
          RunImport: () => [
            {
              type: 'StartPhased',
              data: {
                correlationId: 'c1',
                items: [
                  { key: 'a', phase: 'validate' },
                  { key: 'b', phase: 'validate' },
                  { key: 'c', phase: 'import' },
                ],
                phases: ['validate', 'import'],
                stopOnFailure: false,
              },
            },
          ],
          ProcessItem: (cmd) => {
            executionOrder.push(cmd.data.itemKey as string);
            return [{ type: 'ItemCompleted', data: { itemKey: cmd.data.itemKey, result: {} } }];
          },
        },
        emitMappings: [
          {
            eventType: 'DispatchItem',
            commands: [
              {
                commandType: 'ProcessItem',
                data: (e) => ({ itemKey: e.data.itemKey, phase: e.data.phase }),
              },
            ],
          },
        ],
        workflows: [
          {
            id: 'phased-import',
            workflow: createPhasedWorkflow(),
            inputEvents: ['StartPhased', 'ItemCompleted', 'ItemFailed'],
          },
        ],
      });

      await pipeline.dispatch({ type: 'RunImport', data: {} });

      expect(executionOrder).toEqual(['a', 'b', 'c']);
      expect(pipeline.hasEvent('PhasedCompleted')).toBe(true);
      expect(pipeline.eventTypes()).toEqual([
        'StartPhased',
        'DispatchItem',
        'ItemCompleted',
        'DispatchItem',
        'ItemCompleted',
        'DispatchItem',
        'ItemCompleted',
        'PhasedCompleted',
      ]);
      await pipeline.close();
    });

    it('stopOnFailure halts before next phase', async () => {
      const executionOrder: string[] = [];
      const pipeline = await createTestPipeline({
        handlers: {
          RunImport: () => [
            {
              type: 'StartPhased',
              data: {
                correlationId: 'c1',
                items: [
                  { key: 'a', phase: 'validate' },
                  { key: 'b', phase: 'import' },
                ],
                phases: ['validate', 'import'],
                stopOnFailure: true,
              },
            },
          ],
          ProcessItem: (cmd) => {
            executionOrder.push(cmd.data.itemKey as string);
            if (cmd.data.itemKey === 'a') {
              return [{ type: 'ItemFailed', data: { itemKey: 'a', error: { reason: 'invalid' } } }];
            }
            return [{ type: 'ItemCompleted', data: { itemKey: cmd.data.itemKey, result: {} } }];
          },
        },
        emitMappings: [
          {
            eventType: 'DispatchItem',
            commands: [
              {
                commandType: 'ProcessItem',
                data: (e) => ({ itemKey: e.data.itemKey, phase: e.data.phase }),
              },
            ],
          },
        ],
        workflows: [
          {
            id: 'phased-import',
            workflow: createPhasedWorkflow(),
            inputEvents: ['StartPhased', 'ItemCompleted', 'ItemFailed'],
          },
        ],
      });

      await pipeline.dispatch({ type: 'RunImport', data: {} });

      expect(executionOrder).toEqual(['a']);
      expect(pipeline.hasEvent('PhasedFailed')).toBe(true);
      expect(pipeline.hasEvent('PhasedCompleted')).toBe(false);
      await pipeline.close();
    });
  });

  describe('await workflow', () => {
    it('all keys complete produces AwaitCompleted', async () => {
      const pipeline = await createTestPipeline({
        handlers: {
          LoadData: () => [{ type: 'StartAwait', data: { correlationId: 'c1', keys: ['users', 'roles'] } }],
          FetchUsers: () => [{ type: 'KeyCompleted', data: { key: 'users', result: { count: 10 } } }],
          FetchRoles: () => [{ type: 'KeyCompleted', data: { key: 'roles', result: { count: 5 } } }],
        },
        emitMappings: [
          {
            eventType: 'StartAwait',
            commands: [
              { commandType: 'FetchUsers', data: {} },
              { commandType: 'FetchRoles', data: {} },
            ],
          },
        ],
        workflows: [
          {
            id: 'await-data',
            workflow: createAwaitWorkflow(),
            inputEvents: ['StartAwait', 'KeyCompleted'],
          },
        ],
      });

      await pipeline.dispatch({ type: 'LoadData', data: {} });

      expect(pipeline.hasEvent('AwaitCompleted')).toBe(true);
      const completed = pipeline.eventsOfType('AwaitCompleted')[0];
      expect(completed.data.results).toEqual({
        users: { count: 10 },
        roles: { count: 5 },
      });
      expect(pipeline.eventTypes()).toEqual(['StartAwait', 'KeyCompleted', 'KeyCompleted', 'AwaitCompleted']);
      await pipeline.close();
    });
  });

  describe('graph visualization', () => {
    it('toGraph produces correct nodes and edges for all registration types', () => {
      const pipeline = defineV2('full-pipeline')
        .settled(['CheckA', 'CheckB'])
        .on('BuildCompleted')
        .emit('RunTests', {})
        .on('TestsStarted')
        .handle(() => [{ type: 'TestsHandled', data: {} }])
        .on('ImportReady')
        .forEach()
        .groupInto(['validate', 'import'])
        .process()
        .on('DataReady')
        .run(['users', 'roles'])
        .awaitAll()
        .build();

      const graph = toGraph(pipeline);

      const nodeIds = graph.nodes.map((n) => n.id).sort();
      expect(nodeIds).toEqual([
        'await:users,roles',
        'cmd:CheckA',
        'cmd:CheckB',
        'cmd:RunTests',
        'evt:BuildCompleted',
        'evt:DataReady',
        'evt:ImportReady',
        'evt:TestsStarted',
        'handler:TestsStarted',
        'phased:validate,import',
        'settled:CheckA,CheckB',
      ]);

      const nodeTypes = new Set(graph.nodes.map((n) => n.type));
      expect(nodeTypes).toEqual(new Set(['event', 'command', 'settled', 'phased', 'await']));

      const edgeSet = graph.edges.map((e) => `${e.from}->${e.to}`).sort();
      expect(edgeSet).toEqual([
        'cmd:CheckA->settled:CheckA,CheckB',
        'cmd:CheckB->settled:CheckA,CheckB',
        'evt:BuildCompleted->cmd:RunTests',
        'evt:DataReady->await:users,roles',
        'evt:ImportReady->phased:validate,import',
        'evt:TestsStarted->handler:TestsStarted',
      ]);
    });
  });

  describe('multi-archetype combined pipeline', () => {
    it('chains settled → phased → await in a single dispatch', async () => {
      const pipeline = await createTestPipeline({
        handlers: {
          RunPipeline: () => [
            { type: 'StartSettled', data: { correlationId: 'c1', commandTypes: ['CheckA', 'CheckB'] } },
          ],
          CheckA: () => [{ type: 'CommandCompleted', data: { commandType: 'CheckA', result: 'success', event: {} } }],
          CheckB: () => [{ type: 'CommandCompleted', data: { commandType: 'CheckB', result: 'success', event: {} } }],
          TriggerPhased: () => [
            {
              type: 'StartPhased',
              data: {
                correlationId: 'c2',
                items: [
                  { key: 'x', phase: 'transform' },
                  { key: 'y', phase: 'load' },
                ],
                phases: ['transform', 'load'],
                stopOnFailure: false,
              },
            },
          ],
          ProcessItem: (cmd) => [{ type: 'ItemCompleted', data: { itemKey: cmd.data.itemKey, result: {} } }],
          TriggerAwait: () => [{ type: 'StartAwait', data: { correlationId: 'c3', keys: ['alpha', 'beta'] } }],
          FetchAlpha: () => [{ type: 'KeyCompleted', data: { key: 'alpha', result: { v: 1 } } }],
          FetchBeta: () => [{ type: 'KeyCompleted', data: { key: 'beta', result: { v: 2 } } }],
        },
        emitMappings: [
          {
            eventType: 'StartSettled',
            commands: [
              { commandType: 'CheckA', data: {} },
              { commandType: 'CheckB', data: {} },
            ],
          },
          { eventType: 'AllSettled', commands: [{ commandType: 'TriggerPhased', data: {} }] },
          {
            eventType: 'DispatchItem',
            commands: [
              {
                commandType: 'ProcessItem',
                data: (e) => ({ itemKey: e.data.itemKey, phase: e.data.phase }),
              },
            ],
          },
          { eventType: 'PhasedCompleted', commands: [{ commandType: 'TriggerAwait', data: {} }] },
          {
            eventType: 'StartAwait',
            commands: [
              { commandType: 'FetchAlpha', data: {} },
              { commandType: 'FetchBeta', data: {} },
            ],
          },
        ],
        workflows: [
          {
            id: 'settled-checks',
            workflow: createSettledWorkflow({ commandTypes: ['CheckA', 'CheckB'] }),
            inputEvents: ['StartSettled', 'CommandCompleted'],
          },
          {
            id: 'phased-etl',
            workflow: createPhasedWorkflow(),
            inputEvents: ['StartPhased', 'ItemCompleted', 'ItemFailed'],
          },
          {
            id: 'await-fetch',
            workflow: createAwaitWorkflow(),
            inputEvents: ['StartAwait', 'KeyCompleted'],
          },
        ],
      });

      await pipeline.dispatch({ type: 'RunPipeline', data: {} });

      expect(
        containsSubsequence(pipeline.eventTypes(), [
          'StartSettled',
          'AllSettled',
          'StartPhased',
          'PhasedCompleted',
          'StartAwait',
          'AwaitCompleted',
        ]),
      ).toBe(true);
      await pipeline.close();
    });
  });

  describe('replay', () => {
    it('reproduces event sequence from command log', async () => {
      const combinedConfig = {
        handlers: {
          RunPipeline: () => [
            { type: 'StartSettled', data: { correlationId: 'c1', commandTypes: ['CheckA', 'CheckB'] } },
          ],
          CheckA: () => [
            { type: 'CommandCompleted', data: { commandType: 'CheckA', result: 'success' as const, event: {} } },
          ],
          CheckB: () => [
            { type: 'CommandCompleted', data: { commandType: 'CheckB', result: 'success' as const, event: {} } },
          ],
          TriggerPhased: () => [
            {
              type: 'StartPhased',
              data: {
                correlationId: 'c2',
                items: [
                  { key: 'x', phase: 'transform' },
                  { key: 'y', phase: 'load' },
                ],
                phases: ['transform', 'load'],
                stopOnFailure: false,
              },
            },
          ],
          ProcessItem: (cmd: Command) => [{ type: 'ItemCompleted', data: { itemKey: cmd.data.itemKey, result: {} } }],
          TriggerAwait: () => [{ type: 'StartAwait', data: { correlationId: 'c3', keys: ['alpha', 'beta'] } }],
          FetchAlpha: () => [{ type: 'KeyCompleted', data: { key: 'alpha', result: { v: 1 } } }],
          FetchBeta: () => [{ type: 'KeyCompleted', data: { key: 'beta', result: { v: 2 } } }],
        },
        emitMappings: [
          {
            eventType: 'StartSettled',
            commands: [
              { commandType: 'CheckA', data: {} },
              { commandType: 'CheckB', data: {} },
            ],
          },
          { eventType: 'AllSettled', commands: [{ commandType: 'TriggerPhased', data: {} }] },
          {
            eventType: 'DispatchItem',
            commands: [
              {
                commandType: 'ProcessItem',
                data: (e: Event) => ({ itemKey: e.data.itemKey, phase: e.data.phase }),
              },
            ],
          },
          { eventType: 'PhasedCompleted', commands: [{ commandType: 'TriggerAwait', data: {} }] },
          {
            eventType: 'StartAwait',
            commands: [
              { commandType: 'FetchAlpha', data: {} },
              { commandType: 'FetchBeta', data: {} },
            ],
          },
        ] as EmitMapping[],
        workflows: [
          {
            id: 'settled-checks',
            workflow: createSettledWorkflow({ commandTypes: ['CheckA', 'CheckB'] }),
            inputEvents: ['StartSettled', 'CommandCompleted'],
          },
          {
            id: 'phased-etl',
            workflow: createPhasedWorkflow(),
            inputEvents: ['StartPhased', 'ItemCompleted', 'ItemFailed'],
          },
          {
            id: 'await-fetch',
            workflow: createAwaitWorkflow(),
            inputEvents: ['StartAwait', 'KeyCompleted'],
          },
        ],
      };

      const pipeline = await createTestPipeline(combinedConfig);

      await pipeline.replay([{ type: 'RunPipeline', data: {} }]);

      expect(pipeline.hasEvent('AwaitCompleted')).toBe(true);
      expect(
        containsSubsequence(pipeline.eventTypes(), [
          'StartSettled',
          'AllSettled',
          'StartPhased',
          'PhasedCompleted',
          'StartAwait',
          'AwaitCompleted',
        ]),
      ).toBe(true);
      await pipeline.close();
    });
  });

  describe('parallel emit mapping', () => {
    it('emit mapping dispatches commands in parallel', async () => {
      const startTimes: Record<string, number> = {};
      const endTimes: Record<string, number> = {};

      const pipeline = await createTestPipeline({
        handlers: {
          Scatter: () => [{ type: 'ScatterDone', data: {} }],
          TaskA: async () => {
            startTimes.A = Date.now();
            await new Promise((r) => setTimeout(r, 50));
            endTimes.A = Date.now();
            return [{ type: 'TaskADone', data: {} }];
          },
          TaskB: async () => {
            startTimes.B = Date.now();
            await new Promise((r) => setTimeout(r, 50));
            endTimes.B = Date.now();
            return [{ type: 'TaskBDone', data: {} }];
          },
        },
        emitMappings: [
          {
            eventType: 'ScatterDone',
            commands: [
              { commandType: 'TaskA', data: {} },
              { commandType: 'TaskB', data: {} },
            ],
          },
        ],
      });

      await pipeline.dispatch({ type: 'Scatter', data: {} });

      expect(startTimes.B).toBeLessThan(endTimes.A);
      expect(pipeline.hasEvent('TaskADone')).toBe(true);
      expect(pipeline.hasEvent('TaskBDone')).toBe(true);
      await pipeline.close();
    });
  });

  describe('parallel settled workflow', () => {
    it('settled scatter-gather runs checks in parallel', async () => {
      const startTimes: Record<string, number> = {};
      const endTimes: Record<string, number> = {};

      const pipeline = await createTestPipeline({
        handlers: {
          RunChecks: () => [
            { type: 'StartSettled', data: { correlationId: 'c1', commandTypes: ['CheckA', 'CheckB'] } },
          ],
          CheckA: async () => {
            startTimes.A = Date.now();
            await new Promise((r) => setTimeout(r, 50));
            endTimes.A = Date.now();
            return [{ type: 'CommandCompleted', data: { commandType: 'CheckA', result: 'success', event: {} } }];
          },
          CheckB: async () => {
            startTimes.B = Date.now();
            await new Promise((r) => setTimeout(r, 50));
            endTimes.B = Date.now();
            return [{ type: 'CommandCompleted', data: { commandType: 'CheckB', result: 'success', event: {} } }];
          },
        },
        emitMappings: [
          {
            eventType: 'StartSettled',
            commands: [
              { commandType: 'CheckA', data: {} },
              { commandType: 'CheckB', data: {} },
            ],
          },
        ],
        workflows: [
          {
            id: 'settled-checks',
            workflow: createSettledWorkflow({ commandTypes: ['CheckA', 'CheckB'] }),
            inputEvents: ['StartSettled', 'CommandCompleted'],
          },
        ],
      });

      await pipeline.dispatch({ type: 'RunChecks', data: {} });

      expect(startTimes.B).toBeLessThan(endTimes.A);
      expect(pipeline.hasEvent('AllSettled')).toBe(true);
      await pipeline.close();
    });
  });

  describe('concurrency', () => {
    it('processes multiple concurrent dispatches in parallel', async () => {
      const startTimes: Record<string, number> = {};
      const endTimes: Record<string, number> = {};

      const pipeline = await createTestPipeline({
        handlers: {
          SlowA: async () => {
            startTimes.A = Date.now();
            await new Promise((r) => setTimeout(r, 50));
            endTimes.A = Date.now();
            return [{ type: 'ADone', data: {} }];
          },
          SlowB: async () => {
            startTimes.B = Date.now();
            await new Promise((r) => setTimeout(r, 50));
            endTimes.B = Date.now();
            return [{ type: 'BDone', data: {} }];
          },
        },
      });

      await Promise.all([
        pipeline.dispatch({ type: 'SlowA', data: {} }),
        pipeline.dispatch({ type: 'SlowB', data: {} }),
      ]);

      expect(pipeline.hasEvent('ADone')).toBe(true);
      expect(pipeline.hasEvent('BDone')).toBe(true);
      expect(startTimes.B).toBeLessThan(endTimes.A);
      await pipeline.close();
    });

    it('accepts new commands while a handler is awaiting', async () => {
      let resolveGate: (() => void) | undefined;
      const gate = new Promise<void>((resolve) => {
        resolveGate = resolve;
      });
      const executionLog: string[] = [];

      const pipeline = await createTestPipeline({
        handlers: {
          SlowCommand: async () => {
            executionLog.push('slow-start');
            await gate;
            executionLog.push('slow-end');
            return [{ type: 'SlowDone', data: {} }];
          },
          FastCommand: () => {
            executionLog.push('fast');
            return [{ type: 'FastDone', data: {} }];
          },
        },
      });

      const slowPromise = pipeline.dispatch({ type: 'SlowCommand', data: {} });
      await new Promise((r) => setTimeout(r, 0));

      await pipeline.dispatch({ type: 'FastCommand', data: {} });

      expect(executionLog).toEqual(['slow-start', 'fast']);
      expect(pipeline.hasEvent('FastDone')).toBe(true);
      expect(pipeline.hasEvent('SlowDone')).toBe(false);

      resolveGate!();
      await slowPromise;

      expect(executionLog).toEqual(['slow-start', 'fast', 'slow-end']);
      expect(pipeline.hasEvent('SlowDone')).toBe(true);
      await pipeline.close();
    });
  });
});
