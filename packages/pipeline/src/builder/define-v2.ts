import type { GraphEdge, GraphIR, GraphNode, NodeType } from '../graph/types';

type EmitRegistration = {
  type: 'emit';
  eventType: string;
  commands: Array<{
    commandType: string;
    data: Record<string, unknown> | ((event: Record<string, unknown>) => Record<string, unknown>);
  }>;
};

type CustomHandlerRegistration = {
  type: 'custom';
  eventType: string;
  handler: (event: {
    type: string;
    data: Record<string, unknown>;
  }) =>
    | Array<{ type: string; data: Record<string, unknown> }>
    | Promise<Array<{ type: string; data: Record<string, unknown> }>>;
};

export type SettledRegistration = {
  type: 'settled';
  commandTypes: string[];
  maxRetries?: number;
};

export type PhasedRegistration = {
  type: 'phased';
  eventType: string;
  phases: string[];
  stopOnFailure: boolean;
};

export type AwaitRegistration = {
  type: 'await';
  eventType: string;
  keys: string[];
};

type Registration =
  | EmitRegistration
  | CustomHandlerRegistration
  | SettledRegistration
  | PhasedRegistration
  | AwaitRegistration;

export type PipelineV2 = {
  name: string;
  registrations: Registration[];
};

type EmitChain = {
  emit(
    commandType: string,
    data: Record<string, unknown> | ((event: Record<string, unknown>) => Record<string, unknown>),
  ): EmitChain;
  on(eventType: string): TriggerBuilder;
  build(): PipelineV2;
};

type HandleChain = {
  on(eventType: string): TriggerBuilder;
  build(): PipelineV2;
};

type ProcessChain = {
  stopOnFailure(): ProcessChain;
  on(eventType: string): TriggerBuilder;
  build(): PipelineV2;
};

type GroupIntoChain = {
  process(): ProcessChain;
};

type ForEachChain = {
  groupInto(phases: string[]): GroupIntoChain;
};

type AwaitAllChain = {
  on(eventType: string): TriggerBuilder;
  build(): PipelineV2;
};

type RunChain = {
  awaitAll(): AwaitAllChain;
};

type TriggerBuilder = {
  emit(
    commandType: string,
    data: Record<string, unknown> | ((event: Record<string, unknown>) => Record<string, unknown>),
  ): EmitChain;
  handle(
    handler: (event: {
      type: string;
      data: Record<string, unknown>;
    }) =>
      | Array<{ type: string; data: Record<string, unknown> }>
      | Promise<Array<{ type: string; data: Record<string, unknown> }>>,
  ): HandleChain;
  forEach(): ForEachChain;
  run(keys: string[]): RunChain;
};

type SettledChain = {
  maxRetries(n: number): SettledChain;
  on(eventType: string): TriggerBuilder;
  settled(commandTypes: string[]): SettledChain;
  build(): PipelineV2;
};

type PipelineV2Builder = {
  on(eventType: string): TriggerBuilder;
  settled(commandTypes: string[]): SettledChain;
  build(): PipelineV2;
};

export function defineV2(name: string): PipelineV2Builder {
  const registrations: Registration[] = [];

  function createEmitChain(registration: EmitRegistration): EmitChain {
    return {
      emit(commandType, data) {
        registration.commands.push({ commandType, data });
        return createEmitChain(registration);
      },
      on(eventType) {
        return createTriggerBuilder(eventType);
      },
      build() {
        return { name, registrations };
      },
    };
  }

  function createHandleChain(): HandleChain {
    return {
      on(eventType) {
        return createTriggerBuilder(eventType);
      },
      build() {
        return { name, registrations };
      },
    };
  }

  function createProcessChain(registration: PhasedRegistration): ProcessChain {
    return {
      stopOnFailure() {
        registration.stopOnFailure = true;
        return createProcessChain(registration);
      },
      on(eventType) {
        return createTriggerBuilder(eventType);
      },
      build() {
        return { name, registrations };
      },
    };
  }

  function createForEachChain(eventType: string): ForEachChain {
    return {
      groupInto(phases) {
        return {
          process() {
            const registration: PhasedRegistration = {
              type: 'phased',
              eventType,
              phases,
              stopOnFailure: false,
            };
            registrations.push(registration);
            return createProcessChain(registration);
          },
        };
      },
    };
  }

  function createAwaitAllChain(): AwaitAllChain {
    return {
      on(eventType) {
        return createTriggerBuilder(eventType);
      },
      build() {
        return { name, registrations };
      },
    };
  }

  function createRunChain(eventType: string, keys: string[]): RunChain {
    return {
      awaitAll() {
        const registration: AwaitRegistration = {
          type: 'await',
          eventType,
          keys,
        };
        registrations.push(registration);
        return createAwaitAllChain();
      },
    };
  }

  function createTriggerBuilder(eventType: string): TriggerBuilder {
    return {
      emit(commandType, data) {
        const registration: EmitRegistration = {
          type: 'emit',
          eventType,
          commands: [{ commandType, data }],
        };
        registrations.push(registration);
        return createEmitChain(registration);
      },
      handle(handler) {
        const registration: CustomHandlerRegistration = {
          type: 'custom',
          eventType,
          handler,
        };
        registrations.push(registration);
        return createHandleChain();
      },
      forEach() {
        return createForEachChain(eventType);
      },
      run(keys) {
        return createRunChain(eventType, keys);
      },
    };
  }

  function createSettledChain(registration: SettledRegistration): SettledChain {
    return {
      maxRetries(n) {
        registration.maxRetries = n;
        return createSettledChain(registration);
      },
      on(eventType) {
        return createTriggerBuilder(eventType);
      },
      settled(commandTypes) {
        const reg: SettledRegistration = { type: 'settled', commandTypes };
        registrations.push(reg);
        return createSettledChain(reg);
      },
      build() {
        return { name, registrations };
      },
    };
  }

  return {
    on(eventType) {
      return createTriggerBuilder(eventType);
    },
    settled(commandTypes) {
      const registration: SettledRegistration = { type: 'settled', commandTypes };
      registrations.push(registration);
      return createSettledChain(registration);
    },
    build() {
      return { name, registrations };
    },
  };
}

type GraphBuilderContext = {
  nodeMap: Map<string, GraphNode>;
  edges: GraphEdge[];
};

function addNode(ctx: GraphBuilderContext, id: string, type: NodeType, label: string): void {
  if (!ctx.nodeMap.has(id)) {
    ctx.nodeMap.set(id, { id, type, label });
  }
}

function processEmitRegistration(ctx: GraphBuilderContext, reg: EmitRegistration): void {
  addNode(ctx, `evt:${reg.eventType}`, 'event', reg.eventType);
  for (const cmd of reg.commands) {
    addNode(ctx, `cmd:${cmd.commandType}`, 'command', cmd.commandType);
    ctx.edges.push({ from: `evt:${reg.eventType}`, to: `cmd:${cmd.commandType}` });
  }
}

function processCustomRegistration(ctx: GraphBuilderContext, reg: CustomHandlerRegistration): void {
  addNode(ctx, `evt:${reg.eventType}`, 'event', reg.eventType);
  addNode(ctx, `handler:${reg.eventType}`, 'command', `${reg.eventType} handler`);
  ctx.edges.push({ from: `evt:${reg.eventType}`, to: `handler:${reg.eventType}` });
}

function processSettledRegistration(ctx: GraphBuilderContext, reg: SettledRegistration): void {
  const settledNodeId = `settled:${reg.commandTypes.join(',')}`;
  addNode(ctx, settledNodeId, 'settled', 'Settled');
  for (const commandType of reg.commandTypes) {
    addNode(ctx, `cmd:${commandType}`, 'command', commandType);
    ctx.edges.push({ from: `cmd:${commandType}`, to: settledNodeId });
  }
}

function processPhasedRegistration(ctx: GraphBuilderContext, reg: PhasedRegistration): void {
  addNode(ctx, `evt:${reg.eventType}`, 'event', reg.eventType);
  const phasedNodeId = `phased:${reg.phases.join(',')}`;
  addNode(ctx, phasedNodeId, 'phased', reg.phases.join(' → '));
  ctx.edges.push({ from: `evt:${reg.eventType}`, to: phasedNodeId });
}

function processAwaitRegistration(ctx: GraphBuilderContext, reg: AwaitRegistration): void {
  addNode(ctx, `evt:${reg.eventType}`, 'event', reg.eventType);
  const awaitNodeId = `await:${reg.keys.join(',')}`;
  addNode(ctx, awaitNodeId, 'await', reg.keys.join(', '));
  ctx.edges.push({ from: `evt:${reg.eventType}`, to: awaitNodeId });
}

export function toGraph(pipeline: PipelineV2): GraphIR {
  const ctx: GraphBuilderContext = {
    nodeMap: new Map<string, GraphNode>(),
    edges: [],
  };

  for (const reg of pipeline.registrations) {
    switch (reg.type) {
      case 'emit':
        processEmitRegistration(ctx, reg);
        break;
      case 'custom':
        processCustomRegistration(ctx, reg);
        break;
      case 'settled':
        processSettledRegistration(ctx, reg);
        break;
      case 'phased':
        processPhasedRegistration(ctx, reg);
        break;
      case 'await':
        processAwaitRegistration(ctx, reg);
        break;
    }
  }

  return {
    nodes: Array.from(ctx.nodeMap.values()),
    edges: ctx.edges,
  };
}
