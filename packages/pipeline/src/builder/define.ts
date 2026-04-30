import type { Event } from '@xolvio/message-bus';
import type {
  AcceptsDescriptor,
  CustomHandlerDescriptor,
  EmitHandlerDescriptor,
  EventPredicate,
  FailureContext,
  ForEachPhasedDescriptor,
  GatherEventConfig,
  HandlerDescriptor,
  KeyExtractor,
  PipelineDescriptor,
  RunAwaitHandlerDescriptor,
  SettledEmitFunction,
  SettledHandler,
  SettledHandlerDescriptor,
  SuccessContext,
} from '../core/descriptors';
import type { CommandDispatch } from '../core/types';
import type { GraphEdge, GraphIR, GraphNode } from '../graph/types';
import type { PipelineContext } from '../runtime/context';

export interface Pipeline {
  descriptor: Readonly<PipelineDescriptor>;
  toGraph(): GraphIR;
}

export interface DeclareBuilder {
  accepts(targets: string[]): PipelineBuilder;
}

export interface PipelineBuilder {
  version(v: string): PipelineBuilder;
  description(d: string): PipelineBuilder;
  key<E>(name: string, extractor: (event: E) => string): PipelineBuilder;
  declare(commandType: string): DeclareBuilder;
  on(eventType: string): TriggerBuilder;
  settled(commandTypes: readonly string[], label?: string): SettledBuilder;
  build(): Pipeline;
}

export interface DispatchOptions<D extends readonly string[] = readonly string[]> {
  dispatches: D;
}

export interface SettledBuilder {
  maxRetries(n: number): SettledBuilder;
  dispatch<const D extends readonly string[]>(
    options: DispatchOptions<D>,
    handler: (
      events: Record<string, Event[]>,
      send: (commandType: D[number], data: unknown) => void,
      emit: SettledEmitFunction,
    ) => undefined | { persist: boolean },
  ): SettledChain;
}

export interface SettledChain {
  declare(commandType: string): DeclareBuilder;
  on(eventType: string): TriggerBuilder;
  settled(commandTypes: readonly string[], label?: string): SettledBuilder;
  maxRetries(n: number): SettledChain;
  build(): Pipeline;
}

export interface HandleOptions {
  emits?: string[];
}

export interface TriggerBuilder {
  when<E>(predicate: (event: E) => boolean): TriggerBuilder;
  emit(commandType: string, data: unknown): EmitChain;
  run(commands: CommandDispatch[]): RunBuilder;
  run<E>(factory: (event: E) => CommandDispatch[]): RunBuilder;
  forEach<E, T>(itemsSelector: (event: E) => T[]): ForEachBuilder<T>;
  handle<E>(handler: (event: E, ctx: PipelineContext) => void | Promise<void>, options?: HandleOptions): HandleChain;
}

export interface ForEachBuilder<T> {
  groupInto<P extends string>(phases: readonly P[], classifier: (item: T) => P): PhasedBuilder<T>;
}

export interface PhasedBuilder<T> {
  process(commandType: string, dataFactory: (item: T) => Record<string, unknown>): PhasedChain<T>;
}

export type CompletionEventConfig = string | { name: string; displayName: string };

export interface CompletionConfig {
  success: CompletionEventConfig;
  failure: CompletionEventConfig;
  itemKey: (event: Event) => string;
}

export interface PhasedChain<T> {
  stopOnFailure(): PhasedChain<T>;
  onComplete(config: CompletionConfig): PhasedTerminal;
  build(): Pipeline;
}

export interface PhasedTerminal {
  on(eventType: string): TriggerBuilder;
  build(): Pipeline;
}

export interface RunBuilder {
  awaitAll<E>(keyName: string, keyExtractor: (event: E) => string, options?: { timeout?: number }): GatherBuilder;
}

export interface GatherBuilder {
  onSuccess<T = unknown>(
    eventType: string,
    dataFactory: (ctx: SuccessContext<T>) => Record<string, unknown>,
  ): GatherChain;
  onFailure<T = unknown>(
    eventType: string,
    dataFactory: (ctx: FailureContext<T>) => Record<string, unknown>,
  ): GatherChain;
  on(eventType: string): TriggerBuilder;
  build(): Pipeline;
}

export interface GatherChain {
  onSuccess<T = unknown>(
    eventType: string,
    dataFactory: (ctx: SuccessContext<T>) => Record<string, unknown>,
  ): GatherChain;
  onFailure<T = unknown>(
    eventType: string,
    dataFactory: (ctx: FailureContext<T>) => Record<string, unknown>,
  ): GatherChain;
  on(eventType: string): TriggerBuilder;
  build(): Pipeline;
}

export interface EmitChain {
  emit(commandType: string, data: unknown): EmitChain;
  declare(commandType: string): DeclareBuilder;
  on(eventType: string): TriggerBuilder;
  settled(commandTypes: readonly string[], label?: string): SettledBuilder;
  build(): Pipeline;
}

export interface HandleChain {
  declare(commandType: string): DeclareBuilder;
  on(eventType: string): TriggerBuilder;
  settled(commandTypes: readonly string[], label?: string): SettledBuilder;
  build(): Pipeline;
}

function normalizeCompletionEvent(config: CompletionEventConfig): { name: string; displayName?: string } {
  if (typeof config === 'string') {
    return { name: config };
  }
  return config;
}

class PipelineBuilderImpl implements PipelineBuilder {
  private readonly name: string;
  private versionValue?: string;
  private descriptionValue?: string;
  private readonly keys: Map<string, KeyExtractor> = new Map();
  private readonly handlers: HandlerDescriptor[] = [];
  private settledCounter = 0;

  constructor(name: string) {
    this.name = name;
  }

  nextSettledId(): string {
    return `settled-${this.settledCounter++}`;
  }

  version(v: string): PipelineBuilder {
    this.versionValue = v;
    return this;
  }

  description(d: string): PipelineBuilder {
    this.descriptionValue = d;
    return this;
  }

  key<E>(name: string, extractor: (event: E) => string): PipelineBuilder {
    this.keys.set(name, extractor as KeyExtractor);
    return this;
  }

  declare(commandType: string): DeclareBuilder {
    return new DeclareBuilderImpl(this, commandType);
  }

  on(eventType: string): TriggerBuilder {
    return new TriggerBuilderImpl(this, eventType);
  }

  settled(commandTypes: readonly string[], label?: string): SettledBuilder {
    return new SettledBuilderImpl(this, commandTypes, undefined, label);
  }

  addHandler(handler: HandlerDescriptor): void {
    this.handlers.push(handler);
  }

  build(): Pipeline {
    const descriptor: PipelineDescriptor = {
      name: this.name,
      version: this.versionValue,
      description: this.descriptionValue,
      keys: this.keys,
      handlers: this.handlers,
    };
    const frozenDescriptor = Object.freeze(descriptor);
    return {
      descriptor: frozenDescriptor,
      toGraph: () => extractGraph(frozenDescriptor),
    };
  }
}

class DeclareBuilderImpl implements DeclareBuilder {
  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly commandType: string,
  ) {}

  accepts(targets: string[]): PipelineBuilder {
    this.parent.addHandler({ type: 'accepts', commandType: this.commandType, accepts: targets });
    return this.parent;
  }
}

type GraphBuilderContext = {
  nodeMap: Map<string, GraphNode>;
  edges: GraphEdge[];
};

function addNode(ctx: GraphBuilderContext, id: string, type: 'event' | 'command' | 'settled', label: string): void {
  if (!ctx.nodeMap.has(id)) {
    ctx.nodeMap.set(id, { id, type, label });
  }
}

function processEmitHandler(ctx: GraphBuilderContext, handler: EmitHandlerDescriptor): void {
  addNode(ctx, `evt:${handler.eventType}`, 'event', handler.eventType);
  for (const cmd of handler.commands) {
    addNode(ctx, `cmd:${cmd.commandType}`, 'command', cmd.commandType);
    ctx.edges.push({ from: `evt:${handler.eventType}`, to: `cmd:${cmd.commandType}` });
  }
}

function processRunAwaitHandler(ctx: GraphBuilderContext, handler: RunAwaitHandlerDescriptor): void {
  addNode(ctx, `evt:${handler.eventType}`, 'event', handler.eventType);
  const commands = Array.isArray(handler.commands) ? handler.commands : [];
  for (const cmd of commands) {
    addNode(ctx, `cmd:${cmd.commandType}`, 'command', cmd.commandType);
    ctx.edges.push({ from: `evt:${handler.eventType}`, to: `cmd:${cmd.commandType}` });
  }
  if (handler.onSuccess) {
    addNode(ctx, `evt:${handler.onSuccess.eventType}`, 'event', handler.onSuccess.eventType);
  }
  if (handler.onFailure) {
    addNode(ctx, `evt:${handler.onFailure.eventType}`, 'event', handler.onFailure.eventType);
  }
}

function processForEachPhasedHandler(ctx: GraphBuilderContext, handler: ForEachPhasedDescriptor): void {
  addNode(ctx, `evt:${handler.eventType}`, 'event', handler.eventType);
  const sampleCmd = handler.emitFactory({}, '', { type: '', data: {} });
  addNode(ctx, `cmd:${sampleCmd.commandType}`, 'command', sampleCmd.commandType);
  ctx.edges.push({ from: `evt:${handler.eventType}`, to: `cmd:${sampleCmd.commandType}` });
  const successEvent = handler.completion.successEvent;
  const failureEvent = handler.completion.failureEvent;
  const successLabel = successEvent.displayName ?? successEvent.name;
  const failureLabel = failureEvent.displayName ?? failureEvent.name;
  addNode(ctx, `evt:${successEvent.name}`, 'event', successLabel);
  addNode(ctx, `evt:${failureEvent.name}`, 'event', failureLabel);
  ctx.edges.push({ from: `cmd:${sampleCmd.commandType}`, to: `evt:${successEvent.name}` });
  ctx.edges.push({ from: `cmd:${sampleCmd.commandType}`, to: `evt:${failureEvent.name}` });
}

function processCustomHandler(ctx: GraphBuilderContext, handler: CustomHandlerDescriptor): void {
  addNode(ctx, `evt:${handler.eventType}`, 'event', handler.eventType);
  if (handler.declaredEmits) {
    for (const emittedEvent of handler.declaredEmits) {
      addNode(ctx, `evt:${emittedEvent}`, 'event', emittedEvent);
      ctx.edges.push({ from: `evt:${handler.eventType}`, to: `evt:${emittedEvent}` });
    }
  }
}

function processAcceptsHandler(ctx: GraphBuilderContext, handler: AcceptsDescriptor): void {
  addNode(ctx, `cmd:${handler.commandType}`, 'command', handler.commandType);
  for (const target of handler.accepts) {
    addNode(ctx, `cmd:${target}`, 'command', target);
    ctx.edges.push({ from: `cmd:${handler.commandType}`, to: `cmd:${target}` });
  }
}

function processSettledHandler(ctx: GraphBuilderContext, handler: SettledHandlerDescriptor): void {
  const settledKey = handler.settledId ?? handler.commandTypes.join(',');
  const settledNodeId = `settled:${settledKey}`;
  addNode(ctx, settledNodeId, 'settled', handler.label ?? 'Settled');

  for (const commandType of handler.commandTypes) {
    addNode(ctx, `cmd:${commandType}`, 'command', commandType);
    ctx.edges.push({ from: `cmd:${commandType}`, to: settledNodeId });
  }

  if (handler.dispatches) {
    for (const dispatchedCommand of handler.dispatches) {
      addNode(ctx, `cmd:${dispatchedCommand}`, 'command', dispatchedCommand);
      ctx.edges.push({ from: settledNodeId, to: `cmd:${dispatchedCommand}`, backLink: true });
    }
  }
}

function extractGraph(descriptor: PipelineDescriptor): GraphIR {
  const ctx: GraphBuilderContext = {
    nodeMap: new Map<string, GraphNode>(),
    edges: [],
  };

  for (const handler of descriptor.handlers) {
    switch (handler.type) {
      case 'emit':
        processEmitHandler(ctx, handler);
        break;
      case 'run-await':
        processRunAwaitHandler(ctx, handler);
        break;
      case 'foreach-phased':
        processForEachPhasedHandler(ctx, handler);
        break;
      case 'custom':
        processCustomHandler(ctx, handler);
        break;
      case 'settled':
        processSettledHandler(ctx, handler);
        break;
      case 'accepts':
        processAcceptsHandler(ctx, handler);
        break;
    }
  }

  return {
    nodes: Array.from(ctx.nodeMap.values()),
    edges: ctx.edges,
  };
}

class TriggerBuilderImpl implements TriggerBuilder {
  private predicate?: EventPredicate;

  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly eventType: string,
  ) {}

  when<E>(predicate: (event: E) => boolean): TriggerBuilder {
    this.predicate = predicate as EventPredicate;
    return this;
  }

  emit(commandType: string, data: unknown): EmitChain {
    return new EmitChainImpl(this.parent, this.eventType, [{ commandType, data }], this.predicate);
  }

  run(commandsOrFactory: CommandDispatch[] | ((event: Event) => CommandDispatch[])): RunBuilder {
    return new RunBuilderImpl(this.parent, this.eventType, commandsOrFactory, this.predicate);
  }

  forEach<E, T>(itemsSelector: (event: E) => T[]): ForEachBuilder<T> {
    return new ForEachBuilderImpl<T>(
      this.parent,
      this.eventType,
      itemsSelector as (event: Event) => unknown[],
      this.predicate,
    );
  }

  handle<E>(handler: (event: E, ctx: PipelineContext) => void | Promise<void>, options?: HandleOptions): HandleChain {
    return new HandleChainImpl(
      this.parent,
      this.eventType,
      handler as (event: Event, ctx: PipelineContext) => void | Promise<void>,
      this.predicate,
      options?.emits,
    );
  }
}

class EmitChainImpl implements EmitChain {
  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly eventType: string,
    private readonly commands: Array<{ commandType: string; data: unknown }>,
    private readonly predicate?: EventPredicate,
  ) {}

  emit(commandType: string, data: unknown): EmitChain {
    return new EmitChainImpl(this.parent, this.eventType, [...this.commands, { commandType, data }], this.predicate);
  }

  declare(commandType: string): DeclareBuilder {
    this.finalizeHandler();
    return new DeclareBuilderImpl(this.parent, commandType);
  }

  on(eventType: string): TriggerBuilder {
    this.finalizeHandler();
    return new TriggerBuilderImpl(this.parent, eventType);
  }

  settled(commandTypes: readonly string[], label?: string): SettledBuilder {
    this.finalizeHandler();
    return new SettledBuilderImpl(this.parent, commandTypes, this.eventType, label);
  }

  build(): Pipeline {
    this.finalizeHandler();
    return this.parent.build();
  }

  private finalizeHandler(): void {
    this.parent.addHandler({
      type: 'emit',
      eventType: this.eventType,
      predicate: this.predicate,
      commands: this.commands.map((c) => ({
        commandType: c.commandType,
        data: c.data as Record<string, unknown>,
      })),
    });
  }
}

class HandleChainImpl implements HandleChain {
  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly eventType: string,
    private readonly handler: (event: Event, ctx: PipelineContext) => void | Promise<void>,
    private readonly predicate?: EventPredicate,
    private readonly declaredEmits?: string[],
  ) {}

  declare(commandType: string): DeclareBuilder {
    this.finalizeHandler();
    return new DeclareBuilderImpl(this.parent, commandType);
  }

  on(eventType: string): TriggerBuilder {
    this.finalizeHandler();
    return new TriggerBuilderImpl(this.parent, eventType);
  }

  settled(commandTypes: readonly string[], label?: string): SettledBuilder {
    this.finalizeHandler();
    return new SettledBuilderImpl(this.parent, commandTypes, this.eventType, label);
  }

  build(): Pipeline {
    this.finalizeHandler();
    return this.parent.build();
  }

  private finalizeHandler(): void {
    this.parent.addHandler({
      type: 'custom',
      eventType: this.eventType,
      predicate: this.predicate,
      handler: this.handler,
      declaredEmits: this.declaredEmits,
    });
  }
}

class RunBuilderImpl implements RunBuilder {
  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly eventType: string,
    private readonly commands: CommandDispatch[] | ((event: Event) => CommandDispatch[]),
    private readonly predicate?: EventPredicate,
  ) {}

  awaitAll<E>(keyName: string, keyExtractor: (event: E) => string, options?: { timeout?: number }): GatherBuilder {
    return new GatherBuilderImpl(
      this.parent,
      this.eventType,
      this.commands,
      this.predicate,
      keyName,
      keyExtractor as KeyExtractor,
      options?.timeout,
    );
  }
}

class GatherBuilderImpl implements GatherBuilder {
  private successConfig?: GatherEventConfig<SuccessContext>;
  private failureConfig?: GatherEventConfig<FailureContext>;

  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly eventType: string,
    private readonly commands: CommandDispatch[] | ((event: Event) => CommandDispatch[]),
    private readonly predicate: EventPredicate | undefined,
    private readonly keyName: string,
    private readonly keyExtractor: KeyExtractor,
    private readonly timeout?: number,
  ) {}

  onSuccess<T = unknown>(
    eventType: string,
    dataFactory: (ctx: SuccessContext<T>) => Record<string, unknown>,
  ): GatherChain {
    this.successConfig = { eventType, dataFactory: dataFactory as (ctx: SuccessContext) => Record<string, unknown> };
    return new GatherChainImpl(this, this.parent);
  }

  onFailure<T = unknown>(
    eventType: string,
    dataFactory: (ctx: FailureContext<T>) => Record<string, unknown>,
  ): GatherChain {
    this.failureConfig = { eventType, dataFactory: dataFactory as (ctx: FailureContext) => Record<string, unknown> };
    return new GatherChainImpl(this, this.parent);
  }

  on(eventType: string): TriggerBuilder {
    this.finalizeHandler();
    return new TriggerBuilderImpl(this.parent, eventType);
  }

  build(): Pipeline {
    this.finalizeHandler();
    return this.parent.build();
  }

  setSuccessConfig(config: GatherEventConfig<SuccessContext>): void {
    this.successConfig = config;
  }

  setFailureConfig(config: GatherEventConfig<FailureContext>): void {
    this.failureConfig = config;
  }

  private finalizeHandler(): void {
    this.parent.addHandler({
      type: 'run-await',
      eventType: this.eventType,
      predicate: this.predicate,
      commands: this.commands,
      awaitConfig: {
        keyName: this.keyName,
        key: this.keyExtractor,
        timeout: this.timeout,
      },
      onSuccess: this.successConfig,
      onFailure: this.failureConfig,
    });
  }
}

class GatherChainImpl implements GatherChain {
  constructor(
    private readonly gatherBuilder: GatherBuilderImpl,
    readonly _parent: PipelineBuilderImpl,
  ) {}

  onSuccess<T = unknown>(
    eventType: string,
    dataFactory: (ctx: SuccessContext<T>) => Record<string, unknown>,
  ): GatherChain {
    this.gatherBuilder.setSuccessConfig({
      eventType,
      dataFactory: dataFactory as (ctx: SuccessContext) => Record<string, unknown>,
    });
    return this;
  }

  onFailure<T = unknown>(
    eventType: string,
    dataFactory: (ctx: FailureContext<T>) => Record<string, unknown>,
  ): GatherChain {
    this.gatherBuilder.setFailureConfig({
      eventType,
      dataFactory: dataFactory as (ctx: FailureContext) => Record<string, unknown>,
    });
    return this;
  }

  on(eventType: string): TriggerBuilder {
    return this.gatherBuilder.on(eventType);
  }

  build(): Pipeline {
    return this.gatherBuilder.build();
  }
}

class ForEachBuilderImpl<T> implements ForEachBuilder<T> {
  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly eventType: string,
    private readonly itemsSelector: (event: Event) => unknown[],
    private readonly predicate?: EventPredicate,
  ) {}

  groupInto<P extends string>(phases: readonly P[], classifier: (item: T) => P): PhasedBuilder<T> {
    return new PhasedBuilderImpl<T>(
      this.parent,
      this.eventType,
      this.itemsSelector,
      this.predicate,
      phases,
      classifier as (item: unknown) => string,
    );
  }
}

class PhasedBuilderImpl<T> implements PhasedBuilder<T> {
  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly eventType: string,
    private readonly itemsSelector: (event: Event) => unknown[],
    private readonly predicate: EventPredicate | undefined,
    private readonly phases: readonly string[],
    private readonly classifier: (item: unknown) => string,
  ) {}

  process(commandType: string, dataFactory: (item: T) => Record<string, unknown>): PhasedChain<T> {
    return new PhasedChainImpl<T>(
      this.parent,
      this.eventType,
      this.itemsSelector,
      this.predicate,
      this.phases,
      this.classifier,
      commandType,
      dataFactory as (item: unknown) => Record<string, unknown>,
    );
  }
}

class PhasedChainImpl<T> implements PhasedChain<T> {
  private stopOnFailureFlag = false;
  private completionConfig?: {
    successEvent: { name: string; displayName?: string };
    failureEvent: { name: string; displayName?: string };
    itemKey: KeyExtractor;
  };

  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly eventType: string,
    private readonly itemsSelector: (event: Event) => unknown[],
    private readonly predicate: EventPredicate | undefined,
    private readonly phases: readonly string[],
    private readonly classifier: (item: unknown) => string,
    private readonly commandType: string,
    private readonly dataFactory: (item: unknown) => Record<string, unknown>,
  ) {}

  stopOnFailure(): PhasedChain<T> {
    this.stopOnFailureFlag = true;
    return this;
  }

  onComplete(config: CompletionConfig): PhasedTerminal {
    this.completionConfig = {
      successEvent: normalizeCompletionEvent(config.success),
      failureEvent: normalizeCompletionEvent(config.failure),
      itemKey: config.itemKey as KeyExtractor,
    };
    return new PhasedTerminalImpl(this, this.parent);
  }

  build(): Pipeline {
    this.finalizeHandler();
    return this.parent.build();
  }

  finalizeHandler(): void {
    if (!this.completionConfig) {
      throw new Error('onComplete() must be called before build()');
    }
    this.parent.addHandler({
      type: 'foreach-phased',
      eventType: this.eventType,
      predicate: this.predicate,
      itemsSelector: this.itemsSelector,
      phases: this.phases,
      classifier: this.classifier,
      stopOnFailure: this.stopOnFailureFlag,
      emitFactory: (item: unknown, _phase: string, _event: Event) => ({
        commandType: this.commandType,
        data: this.dataFactory(item),
      }),
      completion: this.completionConfig,
    });
  }
}

class PhasedTerminalImpl implements PhasedTerminal {
  constructor(
    private readonly phasedChain: PhasedChainImpl<unknown>,
    private readonly parent: PipelineBuilderImpl,
  ) {}

  on(eventType: string): TriggerBuilder {
    this.phasedChain.finalizeHandler();
    return new TriggerBuilderImpl(this.parent, eventType);
  }

  build(): Pipeline {
    this.phasedChain.finalizeHandler();
    return this.parent.build();
  }
}

class SettledBuilderImpl implements SettledBuilder {
  private maxRetriesValue?: number;

  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly commandTypes: readonly string[],
    private readonly sourceEventType?: string,
    private readonly customLabel?: string,
  ) {}

  maxRetries(n: number): SettledBuilder {
    this.maxRetriesValue = n;
    return this;
  }

  dispatch<const D extends readonly string[]>(
    options: DispatchOptions<D>,
    handler: (
      events: Record<string, Event[]>,
      send: (commandType: D[number], data: unknown) => void,
      emit: SettledEmitFunction,
    ) => undefined | { persist: boolean },
  ): SettledChain {
    return new SettledChainImpl(
      this.parent,
      this.commandTypes,
      handler as SettledHandler,
      options.dispatches,
      this.sourceEventType,
      this.customLabel,
      this.maxRetriesValue,
    );
  }
}

class SettledChainImpl implements SettledChain {
  private maxRetriesValue?: number;

  constructor(
    private readonly parent: PipelineBuilderImpl,
    private readonly commandTypes: readonly string[],
    private readonly handler: SettledHandler,
    private readonly dispatches?: readonly string[],
    private readonly sourceEventType?: string,
    private readonly customLabel?: string,
    maxRetriesFromBuilder?: number,
  ) {
    this.maxRetriesValue = maxRetriesFromBuilder;
  }

  declare(commandType: string): DeclareBuilder {
    this.finalizeHandler();
    return new DeclareBuilderImpl(this.parent, commandType);
  }

  on(eventType: string): TriggerBuilder {
    this.finalizeHandler();
    return new TriggerBuilderImpl(this.parent, eventType);
  }

  settled(commandTypes: readonly string[], label?: string): SettledBuilder {
    this.finalizeHandler();
    return new SettledBuilderImpl(this.parent, commandTypes, undefined, label);
  }

  maxRetries(n: number): SettledChain {
    this.maxRetriesValue = n;
    return this;
  }

  build(): Pipeline {
    this.finalizeHandler();
    return this.parent.build();
  }

  private finalizeHandler(): void {
    const autoLabel = this.dispatches && this.dispatches.length > 0 ? `${this.dispatches[0]} Settled` : undefined;
    const settledLabel = this.customLabel ?? autoLabel;
    const descriptor: SettledHandlerDescriptor = {
      type: 'settled',
      commandTypes: this.commandTypes,
      handler: this.handler,
      dispatches: this.dispatches,
      settledId: this.parent.nextSettledId(),
      label: settledLabel,
      sourceEventTypes: this.sourceEventType ? [this.sourceEventType] : undefined,
      maxRetries: this.maxRetriesValue,
    };
    this.parent.addHandler(descriptor);
  }
}

export function define(name: string): PipelineBuilder {
  return new PipelineBuilderImpl(name);
}
