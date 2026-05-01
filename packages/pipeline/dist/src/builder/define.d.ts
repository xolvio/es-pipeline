import type { Event } from '@xolvio/message-bus';
import type { FailureContext, PipelineDescriptor, SettledEmitFunction, SuccessContext } from '../core/descriptors';
import type { CommandDispatch } from '../core/types';
import type { GraphIR } from '../graph/types';
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
    dispatch<const D extends readonly string[]>(options: DispatchOptions<D>, handler: (events: Record<string, Event[]>, send: (commandType: D[number], data: unknown) => void, emit: SettledEmitFunction) => undefined | {
        persist: boolean;
    }): SettledChain;
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
export type CompletionEventConfig = string | {
    name: string;
    displayName: string;
};
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
    awaitAll<E>(keyName: string, keyExtractor: (event: E) => string, options?: {
        timeout?: number;
    }): GatherBuilder;
}
export interface GatherBuilder {
    onSuccess<T = unknown>(eventType: string, dataFactory: (ctx: SuccessContext<T>) => Record<string, unknown>): GatherChain;
    onFailure<T = unknown>(eventType: string, dataFactory: (ctx: FailureContext<T>) => Record<string, unknown>): GatherChain;
    on(eventType: string): TriggerBuilder;
    build(): Pipeline;
}
export interface GatherChain {
    onSuccess<T = unknown>(eventType: string, dataFactory: (ctx: SuccessContext<T>) => Record<string, unknown>): GatherChain;
    onFailure<T = unknown>(eventType: string, dataFactory: (ctx: FailureContext<T>) => Record<string, unknown>): GatherChain;
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
export declare function define(name: string): PipelineBuilder;
//# sourceMappingURL=define.d.ts.map